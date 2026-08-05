"""cocotb probe for the WO-0007 spike harness (dv_lead).

Reads every measurement point out of `spike_top` and writes them to the JSON
path named by SPIKE_OUT. It asserts nothing: the driver adjudicates, so a
surprising value is recorded rather than swallowed by a failing assert.

X-handling is the point of `resolvable` / `binstr`: an Icarus `x` must be
observed AS an x, not silently resolved. Both are recorded so the driver can
report whether the four-state lane is actually four-state at the bench
boundary.
"""

import json
import os

import cocotb
from cocotb.clock import Clock
from cocotb.triggers import RisingEdge


def _sig(handle):
    """Record one signal three ways: resolvability, bit pattern, and the
    integer conversion a naive bench would use."""
    val = handle.value
    out = {"binstr": str(val.binstr), "n_bits": len(val.binstr)}
    try:
        out["resolvable"] = bool(val.is_resolvable)
    except Exception as exc:  # pragma: no cover - version guard
        out["resolvable"] = f"ERROR:{type(exc).__name__}"
    try:
        out["int"] = int(val)
    except Exception as exc:
        out["int"] = f"RAISED:{type(exc).__name__}:{exc}"
    return out


@cocotb.test()
async def probe(dut):
    cocotb.start_soon(Clock(dut.clk, 10, units="ns").start())

    result = {"params": {}, "mem": {}, "hier": {}}

    await RisingEdge(dut.clk)

    for name in (
        "sp_w_mod",
        "sp_w_pkg",
        "stack_bits_mod",
        "stack_bits_pkg",
        "quirk_enum_o",
        "quirk_int_o",
        "stack_depth_o",
    ):
        result["params"][name] = _sig(getattr(dut, name))

    # Registered read of every location, one per cycle.
    for addr in range(16):
        dut.probe_addr.value = addr
        await RisingEdge(dut.clk)
        await RisingEdge(dut.clk)
        result["mem"][str(addr)] = _sig(dut.mem_rd)

    # NV-1's shape: can the bench reach the unpacked array by hierarchy?
    try:
        result["hier"]["mem_0"] = str(dut.mem[0].value.binstr)
        result["hier"]["ok"] = True
    except Exception as exc:
        result["hier"]["ok"] = False
        result["hier"]["error"] = f"{type(exc).__name__}: {exc}"

    result["resolve_x_env"] = os.environ.get("COCOTB_RESOLVE_X", "<unset>")

    with open(os.environ["SPIKE_OUT"], "w") as fh:
        json.dump(result, fh, indent=1)
