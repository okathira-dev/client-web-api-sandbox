# ビットレート、Profile / Level、bitrateMode

## この検査で使う値

検査値は「その codec が通る最大値」を推測するためではなく、同じ解像度・FPS で結果を比較するための代表的な入力負荷である。`constant` と `variable` は次の公式配信ガイドの初期目標を解像度・FPSへ対応付けている。

| ファミリー | 参照した目安 | 検査での扱い |
| --- | --- | --- |
| H.264 / AVC | YouTube の SDR アップロード目標（480p 2.5 Mbps、720p 5 / 7.5 Mbps、1080p 8 / 12 Mbps、1440p 24 Mbps、4K 40 / 60 Mbps） | 範囲は代表値へ丸める |
| H.265 / HEVC | Apple HLS Authoring Specification の初期目標（720p 2.4 Mbps、1080p 4.5 / 5.8 Mbps、1440p 8.1 Mbps、4K 11.6 / 16.8 Mbps） | 表にない FPS は最も近い行へ対応付ける |
| VP9 | Google の VP9 設定表の VOD 目標（720p 1.024 Mbps、1080p 1.8 / 3 Mbps、1440p 9 Mbps、4K 12 / 18 Mbps） | VOD の目標値を使う |
| AV1 | 一律の公式配信ビットレート表は採用していない | VP9 の Web 配信目標を比較起点として使う |
| VP8 | 一律の公式配信ビットレート表は採用していない | WebM ガイドの 1080p 例（2 Mbps）を比較起点として使う |

これらは配信サービスの初期値であり、録画・会議・ゲーム配信などの最終設定ではない。画面の動き、映像内容、フレームレート、遅延、帯域、コンテナなどを実運用条件に合わせて調整する。AV1 / VP8 の値は公式の codec 固有推奨値と誤解しないよう、結果にも「推奨値」ではなく検査値として表示する。

ビットレートガイドの「サポート値」は、映像では H.264 / H.265 / VP9 / AV1 の Level 表にある最大ビットレート（現行候補の HEVC は Main tier、AV1 は codec string の `M` に対応する Main tier）、VP8 の一般的な上限なしという仕様上の扱いを表示する。音声では次の3環境を分けて表示する。

- Windows Chromium: Chromium の Media Foundation AAC 実装が検証している `96 / 128 / 160 / 192 kbps` の離散値。
- macOS Chromium: Chromium の AudioToolbox 経由で、現在のサンプルレート・チャンネル設定から適用可能な値を実行時に決めるため、固定一覧ではなく「設定依存」と表示する。
- macOS Safari: WebKit の WebCodecs AudioEncoder と macOS AudioToolbox による設定依存の値として表示する。

後2者はOSのAudioToolboxが返す適用可能範囲に依存するため、共通の固定リストを推測せず、実際の `isConfigSupported`・エンコード結果で確認する。Opus は RFC 6716 の `6〜510 kbps` と用途別の目安を表示する。これらは規格・公式実装上の情報であって、ブラウザーが値を照会できた結果ではない。

音声は品質ごとに候補を増やさず、48 kHz の 128 kbps を代表値として `constant` と `variable` を検査する。画面のビットレートガイドでは、AAC の Windows Chromium 実装にある離散値、macOS Chromium / macOS Safari の設定依存情報、Opus の RFC 6716 にある範囲と用途別の目安を、推奨値とは別のサポート情報として表示する。AAC の離散値は Windows Chromium 固有であり、他の OS・ブラウザーの許容範囲を意味しない。codec string 横の情報ボタンと全体一覧は同じカタログを使う。

カタログの正本は [`domain/bitrateGuidance.ts`](../domain/bitrateGuidance.ts) である。`standard` は仕様上の上限、`implementation` は公式実装固有の制約、`recommendation` は公式配信ガイドや RFC の用途別目安、`comparison` は一律の公式推奨値がないコーデック（現状 AV1 / VP8）に置いた比較起点を表す。ガイドの値はこの環境での `isConfigSupported` や実出力を代替しない。

## Profile と Level

- **Profile** はコーデックの機能集合である。たとえば H.264 の Baseline / Main / High は、CABAC、B フレーム、参照フレームなど利用できる機能の段階を表す。一般に High は圧縮効率が高いが、Baseline のほうが古い機器まで含めた互換性を取りやすい。
- **Level** は Profile の機能ではなく、解像度・最大 luma sample rate・参照フレーム・CPB / 最大ビットレートなど、1 秒あたりに処理できる規模の上限である。同じ Profile でも Level が高いほど大きな映像を扱える。
- Profile / Level の宣言が通っても、実際のエンコーダーがその設定で出力できるとは限らない。この検査では `isConfigSupported`、実エンコード、デコード、多重化をすべて通す。

VP9 / AV1 の Profile も、主にビット深度・色差サンプリング・色域の組み合わせを表す。Profile や Level は画質の「良・悪」を直接表す段階ではなく、利用可能な形式と処理能力の制約である。

## bitrateMode と quantizer

WebCodecs の `VideoEncoderConfig.bitrateMode` は次の 3 値を持つ。

- `constant`: フレーム間のビット配分を一定に近づける。
- `variable`: 複雑なフレームへ多く、単純なフレームへ少なく配分する。指定 `bitrate` は平均目標である。
- `quantizer`: ビットレートではなく量子化パラメーターを指定する。ガイドと情報ダイアログには、codec 登録仕様で確認できる範囲、値の大小と品質の関係、公式に公開された目安、検査で使う比較値を分けて表示する。AVC / HEVC は `0〜51`、VP9 / AV1 は `0〜63` で、いずれも値が小さいほど高品質・大きいほど低品質（強い圧縮）になる。VP9 には Google の良好な品質目安 `33` があるが、H.264 / HEVC / AV1 に一律の公式推奨値はない。検査の比較値は AVC QP 28、HEVC QP 28、VP9 QP 40、AV1 QP 32 とし、仕様範囲内の代表点として扱う。VP8 は codec-specific な quantizer オプションが登録されていないので、`quantizer` 設定が受理されるか自体を確認する。

音声の `AudioEncoderConfig.bitrateMode` は `constant` と `variable` の 2 値で、映像のような `quantizer` はない。そのため音声の候補は 2 倍、映像の候補は 3 倍に展開される。

## 参考資料

- [YouTube: Recommended upload encoding settings](https://support.google.com/youtube/answer/1722171)
- [Apple: HLS Authoring Specification for Apple Devices](https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices)
- [Google: VP9 encoding settings](https://developers.google.com/media/vp9/settings)
- [Google: VP9 bitrate modes and quantizer](https://developers.google.com/media/vp9/bitrate-modes)
- [WebM: VP9 levels](https://www.webmproject.org/vp9/levels/)
- [WebM: Encoder parameters](https://www.webmproject.org/docs/encoder-parameters/)
- [AOMedia: AV1 specification](https://aomediacodec.github.io/av1-spec/av1-spec.pdf)
- [RFC 6716: Definition of the Opus Audio Codec](https://www.rfc-editor.org/rfc/rfc6716.html#section-2.1.1)
- [W3C WebCodecs](https://www.w3.org/TR/webcodecs/)
- [W3C AVC Codec Registration (QP 0–51)](https://www.w3.org/TR/webcodecs-avc-codec-registration/)
- [W3C HEVC Codec Registration (QP 0–51)](https://www.w3.org/TR/webcodecs-hevc-codec-registration/)
- [W3C VP9 Codec Registration (QP 0–63)](https://www.w3.org/TR/webcodecs-vp9-codec-registration/)
- [W3C AV1 Codec Registration (QP 0–63)](https://www.w3.org/TR/webcodecs-av1-codec-registration/)
- [W3C VP8 Codec Registration](https://www.w3.org/TR/webcodecs-vp8-codec-registration/)
- [W3C AAC Codec Registration](https://www.w3.org/TR/webcodecs-aac-codec-registration/)
- [Chromium: Windows Media Foundation AAC encoder](https://chromium.googlesource.com/chromium/src/+/main/media/gpu/windows/mf_audio_encoder.cc)
- [Chromium: macOS AudioToolbox AAC encoder](https://chromium.googlesource.com/chromium/src/+/main/media/filters/mac/audio_toolbox_audio_encoder.cc)
- [WebKit: macOS WebCodecs AudioEncoder](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/webcodecs/WebCodecsAudioEncoder.cpp)
- [Apple: applicable AudioToolbox encode bit rates](https://developer.apple.com/documentation/audiotoolbox/kaudioconverterapplicableencodebitrates)
