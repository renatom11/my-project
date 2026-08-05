`timescale 1ns/1ps
// Spike DUT — WO-0007 confirmatory pass (dv_lead).
//
// Four measurements, one elaboration:
//
//  1. REQ-115's override path: module parameters defaulting to package values,
//     reached through cocotb's runner `parameters=` (NV-3's remaining
//     fraction), for an int, a string and an ENUM-TYPED parameter.
//  2. The near-miss (ADR-0018 A2.4): a module-derived width follows a
//     module-parameter override; a package-derived one does not.
//  3. The same question for a width EXPRESSION rather than a named parameter
//     (`ADDR_W*STACK_DEPTH`, the width of `obs_stack` in spec §4.A).
//  4. REQ-014's two ordered clauses: zero-fill THEN overlay, against a prefix
//     image and against a SPARSE image with a hole in the middle, with the
//     non-conformant realisation (overlay without zero-fill) as the negative
//     control (L-D11 — the instrument proves it can fail first).
//
// MEM_N is 16, not 4096: this measures the mechanism, not the memory map.

module spike_top #(
  parameter int    STACK_DEPTH   = spike_pkg::STACK_DEPTH,
  // MEASURED DEVIATION from spec REQ-115, forced by the tool:
  //   parameter string MEM_INIT_FILE = spike_pkg::MEM_INIT_FILE;
  // is REJECTED by Icarus 12.0 —
  //   "error: Unable to bind variable `MEM_INIT_FILE' in `spike_pkg'"
  // A package `string` parameter cannot appear in a parameter DEFAULT
  // expression under Icarus, though the same package string is usable inside
  // the module body, and package int / logic-vector / bit / ENUM parameters
  // are all accepted as defaults. The literal default below is the only form
  // that elaborates in both lanes — and it is the form spec REQ-109's A-5
  // clause names as a defect. See DV-P1-countersignature.md finding C-0.
  parameter string MEM_INIT_FILE = "",
  parameter        spike_pkg::quirk_memi_e QUIRK_ENUM = spike_pkg::QUIRK_MEM_I_MODE,
  parameter int    QUIRK_INT     = 0,
  parameter bit    ZERO_FILL     = 1'b1
) (
  input  logic       clk,
  input  logic [3:0] probe_addr,
  output logic [7:0] mem_rd,
  output logic [15:0] sp_w_mod,
  output logic [15:0] sp_w_pkg,
  output logic [15:0] stack_bits_mod,
  output logic [15:0] stack_bits_pkg,
  output logic [15:0] quirk_enum_o,
  output logic [15:0] quirk_int_o,
  output logic [15:0] stack_depth_o
);

  localparam int MEM_N = 16;

  // (2) The two derivations of SP_W, side by side.
  localparam int SP_W_MOD = $clog2(STACK_DEPTH) + 1;   // REQ-115-conformant
  localparam int SP_W_PKG = spike_pkg::SP_W;           // the forbidden read

  // (3) The two derivations of obs_stack's WIDTH EXPRESSION, side by side.
  logic [spike_pkg::ADDR_W*STACK_DEPTH-1:0]              obs_stack_mod;
  logic [spike_pkg::ADDR_W*spike_pkg::STACK_DEPTH-1:0]   obs_stack_pkg;
  logic [SP_W_MOD-1:0]                                   obs_sp_mod;
  logic [SP_W_PKG-1:0]                                   obs_sp_pkg;

  assign obs_stack_mod = '0;
  assign obs_stack_pkg = '0;
  assign obs_sp_mod    = '0;
  assign obs_sp_pkg    = '0;

  assign sp_w_mod       = 16'($bits(obs_sp_mod));
  assign sp_w_pkg       = 16'($bits(obs_sp_pkg));
  assign stack_bits_mod = 16'($bits(obs_stack_mod));
  assign stack_bits_pkg = 16'($bits(obs_stack_pkg));
  assign quirk_enum_o   = 16'(QUIRK_ENUM);
  assign quirk_int_o    = 16'(QUIRK_INT);
  assign stack_depth_o  = 16'(STACK_DEPTH);

  // (4) REQ-014's two clauses, with clause 1 defeatable for the negative
  // control. `mem_rd` is a REGISTERED read, so an uncovered location's value
  // reaches a port exactly as it would through spec §4.B's read-latency
  // register — no hierarchical access needed to observe it.
  logic [7:0] mem [0:MEM_N-1];

  initial begin
    if (ZERO_FILL)
      for (int i = 0; i < MEM_N; i++) mem[i] = 8'h00;   // clause 1
    if (MEM_INIT_FILE != "")
      $readmemh(MEM_INIT_FILE, mem);                    // clause 2
  end

  always_ff @(posedge clk) mem_rd <= mem[probe_addr];

endmodule
