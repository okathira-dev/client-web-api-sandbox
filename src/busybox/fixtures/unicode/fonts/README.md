# Busybox POC-011 Unicode fixture font

The two WOFF2 files are subsets of GNU Unifont 17.0.05, downloaded from the
official Unifoundry release:

- `unifont-17.0.05.otf` for Unicode Plane 0
- `unifont_upper-17.0.05.otf` for the Supplementary Multilingual Plane

Source: <https://www.unifoundry.com/unifont/index.html>

The source fonts are dual-licensed under SIL Open Font License 1.1 and GNU GPL
2 or later with the GNU Font Embedding Exception. This repository redistributes
the subsets under SIL OFL 1.1; see `OFL-1.1.txt` in this directory.

The subsets contain only the spaces, addition sign, Han numerals, and digit
ranges used by the 17 fixed POC-011 expressions. They were produced with
FontTools `pyftsubset` and WOFF2 compression. Git records the redistributed
files; the fixture verifier checks their format and license contract.

Modification notice: in 2026, the Busybox project created these WOFF2 subsets
from the upstream OTF files by removing unused glyphs and tables. No glyph
designs were added or redrawn. The subsets remain licensed under SIL OFL 1.1.
