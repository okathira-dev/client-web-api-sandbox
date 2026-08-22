# S-700 Remote Playback fixtures

Each fixed 640×360 VP9 WebM has an 8 second timeline: a two-word lowercase text key from 0–4 seconds and a slot-specific QR token from 4–8 seconds. The source, keys, QR encoder, generation steps, checksums, and segment ranges are tracked by `scripts/generate-busybox-s700-fixtures.mjs` and `assets/generation-manifest.json`.

The runtime randomly selects one finite slot for the current visit. It never renders the source video visibly on the local page. B01 requires the slot text after real Remote Playback connection; B02 requires the slot QR through the native `BarcodeDetector` while the same connection remains active.

The frames, bitmap letters, and QR encoder are project-original. `jsQR` is used only to verify the encoded VP9 frame and is covered by the repository's third-party license page.

Regenerate with the repository's pinned Node runtime and a trusted FFmpeg executable. The executable path is used only for that process and is not written to the manifest.

```powershell
$env:BUSYBOX_FFMPEG_PATH = "<path-to-ffmpeg>"
node scripts/generate-busybox-s700-fixtures.mjs
```
