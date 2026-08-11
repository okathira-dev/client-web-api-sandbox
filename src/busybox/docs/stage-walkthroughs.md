# レビュー済みステージの現行解法仕様

## この文書の位置づけ

この文書は、個別レビューが完了したステージの現行プレイヤー体験と解法の正本である。現在の収録対象はS-350、S-640、S-710、S-720、S-810。他ステージは今後の個別レビュー時に追加し、未収録中は実装と[ステージ実装状況](./stage-implementation-status.md)を使う。ステージをレビューするときは、必ず「何をするステージか」「各箱の解法」「開かない操作」を一緒に説明する。

情報が衝突する場合は、次の順で現行仕様を判断する。

1. `domain/stages.ts`、`runtime/stageDefinitions.ts`、対応する`stages/S-xxx.tsx`
2. この文書
3. [ステージ実装状況](./stage-implementation-status.md)
4. [決定ログ](./decision-log.md)のうち最後の決定

PoC記録、展開計画、Deep Research分類台帳、旧実装計画は履歴資料であり、現行の箱ID、箱数、解法の正本にしない。

## S-350 映像の手触り

### 何をするステージか

音と字幕を持つ一つのnative video playerを操作し、browser所有のcontrolsと実media状態を使う。シーク、音量、再生・停止、再生速度、字幕、Picture-in-Picture、fullscreenをnative controlsから行う。page製のmedia操作UIは置かない。旧S-230のPiP箱はD-143でこのstageへ統合した。

### 各箱の解法

| 箱 | プレイヤーの操作 | 実際の成功条件 |
| --- | --- | --- |
| B01 シーク | native timelineを0.5秒以上動かす | `seeking`から`seeked`までの実時刻差。再生終了後の先頭復帰は除外 |
| B02 ミュート | 音付きfixtureをnative controlsでmute、または音量0にする | trustedな`volumechange`後の`muted === true`または`volume === 0` |
| B03 再生と停止 | 再生して0.2秒以上進め、終了前に停止する | 再生位置が進んだ後の`pause`。`ended`、source切替、初期pausedは除外 |
| B04 再生速度 | native controlsで1倍速以外を選ぶ | `ratechange`後の`playbackRate !== 1`。pageは値を変更しない |
| B05 字幕track | native字幕menuで`Busybox`を選ぶ | `TextTrackList.change`後、`Busybox`だけが`showing` |
| B06 小窓 | native controlsからPicture-in-Pictureへ入る | 同じvideoで実`enterpictureinpicture` eventを受信 |
| B08 全画面 | native controlsから動画をfullscreenへ入れる | `fullscreenchange`時に`document.fullscreenElement`が同じvideo |

### 開かない操作

- 再生終了後に再度再生し、自動で先頭へ戻ること
- 動画の自然終了、reel切替に伴う停止
- DevToolsやpage scriptから`playbackRate`を書き換えることを正規解法にはしない
- page製の字幕selectorやscriptからtrackを変えること
- page製buttonや自動scriptからPiPを要求すること
- 別elementのfullscreen、CSSでの全画面風表示

### 保留箱

複数音声trackのnative UIと`audioTracks`を公開するbrowserでのみ、合意済みIDの将来B07として`Busybox`音声track選択を追加する。custom pickerや別file再生で代替しない。

## S-640 読めない文字列

### 何をするステージか

異なる文字コードで誤表示された8問の文字化けを読み解く。問題は分類別のcardで一覧表示され、回答欄は8問共通で一つだけである。

### 各箱の解法

各cardの`S-640-Bxx`を識別し、表示に使われた文字コードからbytesへ戻して元の文字コードで復号する。得られた固有文字列を共通欄へ正確に入力する。正答8個はすべて異なるため、一致した一箱だけが開く。文字コード名を入力する問題ではない。

### 開かない操作

- 文字コード名そのものを入力すること
- cardの一部だけ、空白を省いた文字列、似たglyphへ置換した文字列
- 別問題の正答を現在見ているcardの答えとして扱うこと

## S-710 動画変換室

### 何をするステージか

ゲーム内に別サイト風の動画圧縮ツール「ClipPress」がiframeで埋め込まれている。fileまたは最大10秒のcamera録画を入力し、固定160kbpsのWebMへ変換する。入力と出力のfile sizeも表示する。ゲーム本体には四箱と一つの合言葉欄だけがある。

### 各箱の解法

| 箱 | 入力条件 | 出力で読むもの |
| --- | --- | --- |
| B01 暗闇frame | RGBが全pixel `#000000`〜`#101010`のframeを含む動画 | 該当する一frameだけに表示される`busybox{dark_frame}` |
| B02 decode失敗 | 動画としてdecodeできないfileを変換する | Git管理済み固定error動画の`busybox{broken_input}` |
| B03 QR frame | QRを含むframeがある動画を変換する | downscale frameを同梱jsQRで検出し、検出四辺形へ射影した`busybox{qr_replaced}`のQRへ同じ一frameだけを差し替える |
| B04 metadata | ClipPressで正常変換した出力をもう一度入力する | 全frameへoverlayされる`busybox{second_pass}` |

出力を再生・停止・seekして文字またはQRを読み、親pageの共通合言葉欄へ完全一致で入力する。iframeはsession付き同一origin `postMessage`で「どの条件が成立したか」だけを親へ伝え、合言葉そのものを伝えない。

### 開かない操作

- 変換buttonを押しただけ、内部条件を検出しただけ
- `BarcodeDetector`を使ってS-710のQR検出を実装すること（S-710は同梱jsQRを使う。Barcode Detection APIの実績は別stageだけに残す）
- file名や拡張子だけで二回目の変換と判定すること
- 動画でないfileを暗黒frameとして扱うこと

## S-720 映像復元室

### 何をするステージか

左に三つの動画source、中央にT1〜T3を二列（各変換を最大二回使える）、右に一つの動画outputが固定配置されたpatch bayである。out portを選んでから任意のin portを選ぶとBezier cableがつながる。各portは一接続で、同じ出力からの分岐はない。sourceをoutputへ直接つなぐこともできる。正しい経路がoutputへ到達すると、実際にその経路の変換を施した動画がoutput nodeでloop再生される。downloadとfile pickerはない。

### 各箱の解法

| 箱 | ケーブル経路 | 出力QRのflag |
| --- | --- | --- |
| B01 | VIDEO 1 → T1 → OUTPUT | `busybox{swap_halves}` |
| B02 | VIDEO 2 → T2 → OUTPUT | `busybox{merge_frames}` |
| B03 | VIDEO 3 → T3 → T2 → OUTPUT | `busybox{odd_even_alpha}` |
| B04 | VIDEO 3 → T1 → T3 → T2 → T1 → OUTPUT（T1を二列で二度使用） | `busybox{swap_route_beta}` |

T1は左右半分の交換、T2は全frameの画素積（fixtureでは黒セルを合成）、T3は偶数frameの左半分／奇数frameの右半分以外を白で埋める変換である。B04だけはT1の一列目と二列目を順に通す。ケーブルがoutputへ届かない、またはcycleになる接続は成立しない。出力動画のQRを読み、全箱共通のflag欄へ入力する。

### 開かない操作

- sourceからoutputまでつながらない変換nodeだけの配線
- VIDEO 3 → T1 → OUTPUTなど、正規routeの一部だけをつなぐこと
- 同じportからの分岐やcycleを作ること
- 出力動画が再生可能になる前のflag入力
- QR以外の内部statusやfixture file名を答えとして使うこと

## S-810 変形する映像

### 何をするステージか

一本のMSE動画へ、1フレームずつVP8 WebMをtimestamp offset付きで追加する。各セグメントのcanvas寸法を変え、144〜1080pxの正方形、横長、縦長へスイープする。これは固定assetを再生するだけでは確認できないnative videoの実寸変化をギミックにするためである。プレイヤーは生成後、native controlsで再生またはシークして実寸の変化を観察する。

### 解法

「スウィープ動画を生成」を押し、native controlsで再生・シークする。小さい正方形、大きい正方形、横長、縦長の4種類を実際の`videoWidth` / `videoHeight`または`resize` eventで観測すると、それぞれB01〜B04が開く。CSSで見た目だけを変えても開かない。

### 開かない操作

- 生成前に箱やflag欄へ入力すること
- CSSの表示サイズだけを変えること
- 固定された一つの解像度しか返さない動画を読み込むこと

## 更新テンプレート

他ステージをレビュー・再構成するときは、そのターンでこの文書へ次を追加する。

- プレイヤーが見る目的とbrowser固有の反応
- 各箱の正確な操作手順と成功条件
- 誤開箱を防ぐnegative case
- 使用API、能力不足時の扱い、権限・privacy・cleanup
- 人手確認IDと対象browser / 機器
