#!/usr/bin/env python3
"""WO-0007 confirmatory-pass spike driver (dv_lead).

Deliberately NOT named `test_*.py`: `build.yml`'s R-CI-d source guard keys on
`test/test_*.py`, and its written de-gating condition ties de-gating to the
commit landing the first `rtl/` module and the first bench. This harness is a
measurement instrument, not that bench, so it must not trip the guard.

Run:  python3 test/spikes/run_spike.py            (both lanes)
      python3 test/spikes/run_spike.py icarus     (one lane)

All build output goes to a temp tree outside the repo, so a run leaves no
untracked files.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SOURCES = [os.path.join(HERE, "spike_pkg.sv"), os.path.join(HERE, "spike_top.sv")]
PREFIX_IMG = os.path.join(HERE, "img_prefix.hex")
SPARSE_IMG = os.path.join(HERE, "img_sparse.hex")

# (id, description, parameters, extra env)
def sv_string(path):
    """cocotb 1.9.2 formats every parameter as `-P<top>.<n>=<v>` (Icarus) or
    `-G<n>=<v>` (Verilator) with NO type awareness and NO quoting, so a bare
    Python str reaches the tool as an unquoted token. This wraps the value in
    SystemVerilog string-literal quotes at the call site — the form under
    measurement."""
    return '"%s"' % path


CONFIGS = [
    ("C1-default", "no overrides at all", {}, {}),
    ("C2-stackdepth", "STACK_DEPTH=4 through the runner", {"STACK_DEPTH": 4}, {}),
    ("C3-enum", "enum-typed + int params overridden", {"QUIRK_ENUM": 2, "QUIRK_INT": 2}, {}),
    ("C4-image-conformant", "prefix image, zero-fill ON (REQ-014 conformant)",
     {"MEM_INIT_FILE": sv_string(PREFIX_IMG), "ZERO_FILL": 1}, {}),
    ("C5-image-nonconformant", "prefix image, zero-fill OFF (the forbidden row)",
     {"MEM_INIT_FILE": sv_string(PREFIX_IMG), "ZERO_FILL": 0}, {}),
    ("C6-sparse-nonconformant", "SPARSE image, zero-fill OFF (hole in the middle)",
     {"MEM_INIT_FILE": sv_string(SPARSE_IMG), "ZERO_FILL": 0}, {}),
    ("C7-sparse-conformant", "SPARSE image, zero-fill ON (the repair, per location)",
     {"MEM_INIT_FILE": sv_string(SPARSE_IMG), "ZERO_FILL": 1}, {}),
    ("C8-missing-path", "MEM_INIT_FILE names a path that does not exist",
     {"MEM_INIT_FILE": sv_string(os.path.join(HERE, "no_such_image.hex")), "ZERO_FILL": 1}, {}),
    ("C9-resolvex", "non-conformant image with COCOTB_RESOLVE_X=ZEROS",
     {"MEM_INIT_FILE": sv_string(PREFIX_IMG), "ZERO_FILL": 0}, {"COCOTB_RESOLVE_X": "ZEROS"}),
    ("C10-raw-string", "UNQUOTED python str straight through the runner (the natural form)",
     {"MEM_INIT_FILE": PREFIX_IMG, "ZERO_FILL": 1}, {}),
]


def run_one(sim, cid, params, extra_env, root):
    from cocotb.runner import get_runner

    build_dir = os.path.join(root, sim, cid)
    out_json = os.path.join(build_dir, "probe.json")
    os.makedirs(build_dir, exist_ok=True)

    env = dict(os.environ)
    env["SPIKE_OUT"] = out_json
    # Keep the working tree clean: no __pycache__ beside the probe module.
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["PYTHONPATH"] = HERE + os.pathsep + env.get("PYTHONPATH", "")
    env.update(extra_env)
    old = dict(os.environ)
    os.environ.update(env)
    try:
        runner = get_runner(sim)
        # Verilator refuses an enum-typed parameter overridden from the command
        # line (%Error-ENUMVALUE) unless these two waivers are given. The
        # waivers are part of the measurement, not a convenience: see finding
        # C-4 in DV-P1-countersignature.md.
        bargs = ["-Wno-ENUMVALUE", "-Wno-WIDTHTRUNC"] if sim == "verilator" else []
        runner.build(
            sources=SOURCES,
            hdl_toplevel="spike_top",
            parameters=params,
            build_dir=build_dir,
            build_args=bargs,
            always=True,
        )
        runner.test(
            hdl_toplevel="spike_top",
            test_module="spike_probe",
            build_dir=build_dir,
            extra_env=env,
        )
    finally:
        os.environ.clear()
        os.environ.update(old)

    with open(out_json) as fh:
        return json.load(fh)


def fmt_mem(res):
    return " ".join(res["mem"][str(a)]["binstr"] for a in range(16))


def hexish(binstr):
    if set(binstr) <= set("01"):
        return "%02x" % int(binstr, 2)
    return "".join("x" if c not in "01" else c for c in binstr)[:2] or "xx"


def main():
    sims = sys.argv[1:] or ["icarus", "verilator"]
    root = tempfile.mkdtemp(prefix="wo0007-spike-")
    print("build root:", root)
    all_res = {}
    for sim in sims:
        for cid, desc, params, extra in CONFIGS:
            print("\n=== %s / %s — %s ===" % (sim, cid, desc), flush=True)
            try:
                res = run_one(sim, cid, params, extra, root)
            except Exception as exc:
                print("  RUN FAILED: %s: %s" % (type(exc).__name__, exc))
                all_res[(sim, cid)] = None
                continue
            all_res[(sim, cid)] = res
            p = res["params"]
            print("  STACK_DEPTH seen by module : %s" % p["stack_depth_o"]["int"])
            print("  SP_W  module-derived / package-derived : %s / %s"
                  % (p["sp_w_mod"]["int"], p["sp_w_pkg"]["int"]))
            print("  obs_stack width  module / package      : %s / %s"
                  % (p["stack_bits_mod"]["int"], p["stack_bits_pkg"]["int"]))
            print("  QUIRK_ENUM / QUIRK_INT : %s / %s"
                  % (p["quirk_enum_o"]["int"], p["quirk_int_o"]["int"]))
            mem = [hexish(res["mem"][str(a)]["binstr"]) for a in range(16)]
            print("  mem[0..15] : %s" % " ".join(mem))
            print("  mem[3] resolvable=%s int=%s"
                  % (res["mem"]["3"]["resolvable"], res["mem"]["3"]["int"]))
            print("  hierarchical dut.mem[0] : %s" % res["hier"])
            print("  COCOTB_RESOLVE_X = %s" % res["resolve_x_env"])

    with open(os.path.join(root, "summary.json"), "w") as fh:
        json.dump({"%s/%s" % k: v for k, v in all_res.items()}, fh, indent=1)
    print("\nsummary: %s/summary.json" % root)
    shutil.rmtree(root, ignore_errors=True) if os.environ.get("SPIKE_CLEAN") else None


if __name__ == "__main__":
    main()
