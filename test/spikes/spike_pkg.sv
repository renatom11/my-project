`timescale 1ns/1ps
// Spike harness package — WO-0007 confirmatory pass (dv_lead).
//
// NOT the P1 design and NOT `chip8_pkg`. This is a measurement instrument
// shaped like the spec's §5.5 package so that REQ-115's override path, the
// derived-width rule, and REQ-014's zero-fill-then-overlay ordering can be
// measured in both simulator lanes BEFORE any RTL exists. It measures the
// language and the toolchain, not a design (the same limit ADR-0018 A1.5
// states for the architect's own harness).
//
// Nothing here is derived from RTL: there is none. The shapes are taken from
// SPEC-P1-core-cpu.md §5.1, §5.5, §5.0 (REQ-115) and §6.1.1 (REQ-014).

package spike_pkg;

  parameter int ADDR_W      = 12;
  parameter int STACK_DEPTH = 16;

  // The trap under test: a package-level width DERIVED from an overridable
  // parameter. REQ-115 forbids a module reading this; the harness reads it
  // deliberately, to measure what reading it costs.
  parameter int SP_W = $clog2(STACK_DEPTH) + 1;

  parameter string MEM_INIT_FILE = "";

  typedef enum logic [1:0] {
    MEMI_INC_X_PLUS_1,
    MEMI_INC_X,
    MEMI_UNCHANGED
  } quirk_memi_e;

  parameter quirk_memi_e QUIRK_MEM_I_MODE = MEMI_INC_X_PLUS_1;

endpackage
