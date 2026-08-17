# S-810 aspect-ratio seek fixture

`assets/resolution-sweep.pack` は、144〜1080pxへnative寸法が変化する120個の1フレームVP8 WebM segmentを連結した固定assetです。`generation-manifest.json` のoffsetと寸法を使い、S-810がMSEの`SourceBuffer`へ順番に追加します。プレイヤーはnative controlsでシークを止め、提示されたframeの比率を1:1、4:3、16:9、9:20（各相対5%以内）へ合わせます。通常再生、pause、CSS拡大、scriptからの自動seekは成功条件ではありません。

実行時にMediaBunnyやCanvasで動画を生成しません。再生成する場合だけ、信頼したFFmpegの絶対パスを環境変数へ渡します。

```powershell
$env:BUSYBOX_FFMPEG_PATH = "<trusted-ffmpeg-path>"
node scripts/generate-busybox-s810-fixture.mjs
```

manifestと`assets.test.ts`が、フレーム数、offsetの連続性、WebM header、代表的な寸法を検証します。
