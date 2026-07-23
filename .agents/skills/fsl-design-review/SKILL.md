---
name: fsl-design-review
description: A procedure for design exploration and design review using FSL. Mechanically check with fslc refine whether a design proposal, variant, extension, or change breaks a stable contract (the abstract spec), and report the result in the vocabulary of design principles (SOLID — the Open/Closed Principle, the Liskov Substitution Principle, Design by Contract, etc.). Triggers include "explore this design", "do a design review", "does this follow SOLID", "is this extension/change safe", "I want to add a variant", and "is this substitutable". Use fsl-design instead when the task is to author the design-layer spec rather than review a proposal. FSL syntax is delegated to the fsl skill.
---

# Codex discovery adapter

The canonical upstream skill is [`skills/fsl-design-review/SKILL.md`](../../../skills/fsl-design-review/SKILL.md).

Before taking task actions, read the canonical `SKILL.md` completely and follow it.
Treat `skills/fsl-design-review/` as the skill directory when resolving relative
references. References to `docs/`, `examples/`, `specs/`, or `schemas/` identify
optional files in the upstream FSL v3.1.0 source tree, not paths in this consumer
repository. Do not maintain workflow instructions in this adapter.
