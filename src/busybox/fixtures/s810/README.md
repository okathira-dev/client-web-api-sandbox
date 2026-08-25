# S-810 aspect-ratio seek fixture

`assets/resolution-sweep.pack` は、辺の最大値3840pxまでnative寸法が変化する120個の1フレームVP8 WebM segmentを連結した固定assetです。`generation-manifest.json` のoffsetと寸法を使い、S-810がMSEの`SourceBuffer`へ順番に追加します。順番は小さい正方形→横幅を伸ばす横長→縦横を伸ばす縦長→横幅を伸ばす大きい正方形です。プレイヤーはnative controlsでシークを止め、提示されたframeの比率を1:1、4:3、16:9、9:20（各相対5%以内）へ合わせます。1:1は即時に開いてよく、通常再生中は開きません。pauseしたフレームでの判定は許可します。CSS拡大とscriptからの自動seekは成功条件ではありません。

実行時にMediaBunnyやCanvasで動画を生成しません。再生成する場合だけ、信頼したFFmpegの絶対パスを環境変数へ渡します。

```powershell
$env:BUSYBOX_FFMPEG_PATH = "<trusted-ffmpeg-path>"
node scripts/generate-busybox-s810-fixture.mjs
```

manifestと`assets.test.ts`が、フレーム数、offsetの連続性、WebM header、代表的な寸法を検証します。
