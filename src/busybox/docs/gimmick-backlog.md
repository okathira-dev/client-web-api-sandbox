# ギミックメモ台帳

> JSDocとstage-localizationへ移行する前の設計履歴。現行の解法・箱番号・実装状態はこの表から導かない。JSDoc移行完了後に削除または履歴ディレクトリへの移動を再判定する。

> この表の末尾状態語は着手時点の履歴である。現在状態は[ステージ実装状況](./stage-implementation-status.md)、解法は[現行ステージ解法仕様](./stage-walkthroughs.md)を正とする。G-060〜G-079の追加履歴に加え、2026-08-10にD-140でS-350のframe cadenceをG-080 / S-810へ分離した。

この台帳はアイデアを確定仕様にするためではなく、重複を見つけ、調査と試作の順番を決めるために使う。

ここにあるAPI名、操作、区分はすべて候補であり、対応状況の再調査、最小試作、ゲーム性レビューを通過するまで実装確定ではない。

[添付Deep Researchメモ](./source/deep-research-report.md)は網羅的な未レビュー案の原本、この台帳は重複整理と採否判断を進める作業台帳とする。原本の案をすべてこの表へ無条件に複製せず、現行性と一意性を確認してから統合する。

## ギミックの一意性

同じAPIを複数ステージで使ってもよい。ただし、ステージの中心となる発見は重複させない。

ギミックを比較するときは、次の組み合わせを見る。

- プレイヤーが行う中心動詞
- 変化させる対象
- 成功に必要な時間や順序
- ブラウザ内外の文脈
- プレイヤーが気づくべきWeb固有の性質

たとえば「権限を許可するとクリア」は、カメラでもマイクでも同じギミックである。許可は入口にすぎず、その後の観測や発見が異ならなければ別ステージにしない。

## ルール

- 1ステージに複数の代替解法ギミックを用意しない
- 現環境で解けない場合に、別APIを使う代替ルートを同じステージへ足さない
- 未対応のステージが残ることを許容する
- APIの存在確認だけをクリア条件にしない
- 許可ダイアログを出すだけのステージにしない
- 一般的なミニゲームへAPIを飾りとして付けない
- 生データの保存や外部送信をギミック上の必須条件にしない
- 事前生成可能な動画・音声・画像はsource、生成手順、checksumとともにGit管理する
- 同期・リアルタイム性が本質でない合言葉は固定し、copy可能なら長いCTF形式、転記なら最大2語にする
- 実装前に人手確認IDを割り当てる

## 状態

| 状態 | 意味 |
| --- | --- |
| メモ | 体験の核だけがある |
| 調査待ち | 現行対応、権限、制約の確認が必要 |
| 試作待ち | 技術的には候補で、最小試作が必要 |
| 評価待ち | 試作済みで、面白さや重複を評価する |
| 採用 | 実装対象に決定した |
| 保留 | 環境、費用、サーバー、リスクなどで止める |
| 却下 | 重複、非対応、非推奨、体験不成立などで採用しない |

## 初期ギミックメモ

| ID | API / feature候補 | 中心となる発見・操作 | 一意性の核 | 仮の系統 | 主な人手確認 | 状態 |
| --- | --- | --- | --- | --- | --- | --- |
| G-001 | DOM | 画面上の要素ではなく、文書構造の変化を手掛かりに整列させる | 見た目と文書構造のずれ | Webページ基盤 | H-001, H-020 | 採用 |
| G-002 | CSSOM View / Resize Observer | ビューポートと要素寸法を特定の関係にする | ブラウザ窓の外形が入力になる | Webページ基盤 | H-001, H-002, H-003 | 採用 |
| G-003 | Selection / Custom Highlight | B01は可視語の実Selection、B02は選択した非連続Rangeの永続蛍光化、B03は重なったHighlight領域を座標から直接触る | native Selection、一つのHighlightが持つ複数Range、`highlightsFromPoint()`が返すHighlight集合を別々の回答にする | Webページ基盤 | H-001, H-002, H-003, H-004, H-020, H-025 | 採用・B02/B03追加待ち |
| G-004 | Canvas / Pointer Events | 見本をなぞるのでなく、速度や筆圧を含む軌跡を作る | 描画結果より入力履歴を読む | Webページ基盤 + 端末 | H-004, H-020 | 採用 |
| G-005 | Web Animations | アニメーションの時間を観察し、特定の瞬間へ停止させる | 時間軸を直接扱う | Webページ基盤 | H-001, H-002, H-003 | 採用 |
| G-006 | Clipboard API | copy操作で逆順の`xobysub`をclipboardへ入れ、外で`busybox`へ直して再copyした状態で箱を押す | clipboardへ書いた不完全な鍵をpage外で修復し、箱clickのuser activationで読み戻す | Webページ基盤 + 遷移 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 | 採用・S-180再設計待ち |
| G-007 | File API | ゲーム外へ出た成果物を、内容を変えずに再び持ち込む | ファイルの往復が時間差の入力になる | 保存 + Webページ基盤 | H-014, H-020 | 採用 |
| G-008 | Web Crypto | 表示された文字ではなく、与えられた成果物の同一性を証明する | 内容を明かさず一致を確認する | Webページ基盤 + 保存 | H-001, H-002, H-003 | 採用 |
| G-009 | Device Orientation | 端末を動かし続けるのではなく、狙った姿勢で静止させる | 姿勢と静止時間の組み合わせ | 端末 + 環境依存 | H-008 | 採用 |
| G-010 | Media Capture / camera | 映像を撮影物として残さず、その場の光の変化だけを入力にする | カメラを環境センサーとして使う | 端末 | H-006, H-007 | 採用 |
| G-011 | Web Audio / microphone | 発話内容ではなく、音高や無音の時間構造を合わせる | 言語に依存しない音の構造 | 端末 | H-006, H-007 | 採用 |
| G-012 | Screen Capture / MediaRecorder / Canvas marker decode | user-selected browser surfaceをlive preview、local recording、別tabへのlive relayへ流し、mind map型stage一覧の外縁にあるround markerを探索して実frameから読む | ブラウザが自分自身を映し、記録し、中継し、一覧の遠端で見つけたpixelを再入力にする | 端末 + 遷移 + 環境依存 | H-006, H-007, H-012, H-013, H-019, H-023 | B01〜B04採用済み・再設計待ち。BB-060はB04へ統合。notification marker B05は実機PoC待ち |
| G-013 | Gamepad | 画面上の仮想パッドでは不可能な、複数軸とボタンの状態を作る | 外部入力の同時状態 | 端末 + 環境依存 | H-009 | 採用 |
| G-014 | IndexedDB / Beacon / Service Worker | B01は過去の訪問でpageが残した状態、B02はoffline中にsenderを離れながら実`sendBeacon()`でlocal Service Workerへ投函したreceiptを材料にする | page自身が残す再訪記憶と、破棄されるsenderからfire-and-forgetで届くlocal郵便を対比する | 保存 + 遷移 | H-001, H-018, H-021, H-048 | B01 / B02初版実装済み・人手確認待ち |
| G-015 | Service Worker / Cache | オフライン時だけ現れる応答を観測する | 通信断が失敗でなく条件になる | 保存 + 遷移 | H-005, H-021, H-022 | 採用 |
| G-016 | Badging | アプリ外のバッジ表示を、段階的なフィードバックとして使う | インストール後のOS表面が盤面になる | 保存 + 環境依存 | H-005, H-023 | 採用 |
| G-017 | Broadcast Channel | 2つのタブが異なる役割を持ち、同時に状態を合わせる | 同一オリジンの並行文脈 | 遷移 | H-013 | 採用 |
| G-018 | Page Visibility | 同一documentを2秒または25分以上連続して隠し、visible復帰時のmonotonic elapsedを2箱で観測する | 観測していない短時間と長時間が別の入力になる | 保存 + 遷移 | H-013, H-022, H-025 | 採用・S-040拡張待ち |
| G-019 | History / Navigation Timing / Navigation API | same-document履歴を戻る箱、documentのback-forward復帰、reloadに加え、戻った位置から別の枝へ進んで旧forward entryを破棄する | ブラウザ履歴の移動・種類・枝刈りが迷路になる | 遷移 | H-001, H-002, H-003, H-022 | B01〜B03実装済み、DR-047のB04拡張待ち |
| G-020 | Picture-in-Picture | 本体から離れた映像と元画面の状態を組み合わせる | ブラウザ外縁の小窓が別の盤面になる | 端末 + 遷移 | H-012, H-023 | 採用 |
| G-021 | Web Share / Web Share Target | 一時tokenを外へ渡す箱と、installed Busyboxを共有先にして同じroundを外から受け取る箱を分ける | Webが共有の送信元と受信先の両方になる | 遷移 + PWA + 環境依存 | H-005, H-014, H-004, H-023 | 採用・S-240再設計待ち |
| G-022 | Web Locks | RGB三色のタブを同時に灯し、白い監視タブで指定順のlock解放を観測する | 並行文脈の生存と終了順を加法混色として読む | 保存 + 遷移 | H-013, H-022 | 採用・S-250再設計待ち |
| G-023 | EyeDropper | ページ内部の色ではなく、画面上の別の場所から正確な色を採る | ブラウザ境界をまたぐ色入力 | 端末 + 環境依存 | H-006, H-023 | 採用 |
| G-024 | WebGPU | — | playerがWebGPU固有処理と任意の描画演出を区別できる核を成立させられない | — | — | D-141で不採用。S-270も削除 |
| G-025 | Web Bluetooth | 選択した近接機器から変化する信号を受け取る | 無線距離と外部状態 | 端末 + 環境依存 | H-010, H-006 | 採用 |
| G-026 | WebHID / WebUSB | 一般入力へ変換されない機器固有のレポートを読む | ブラウザが特殊機器と直接対話する | 端末 + 環境依存 | H-011, H-006 | 採用 |
| G-027 | Launch Handler / PWA起動 / manifest shortcuts / note taking | 通常tabとinstalled起動を分け、stage URL、icon shortcut、新規メモの各専用URLを3箱で受ける | installed appへの通常deep linkと2種類のOS登録taskが別の入口になる | 保存 + 遷移 + 環境依存 | H-005, H-021, H-023, H-025 | 採用・S-310-B02/B03拡張待ち |
| G-028 | Device Posture / Viewport Segments | 折りたたみ状態や画面境界で分断された要素を合わせる | 物理的な折れ目がレイアウト入力になる | 端末 + 環境依存 | H-023 | 採用 |
| G-029 | Notifications | ページ外で受け取った情報を通知操作によって持ち帰る | OS通知からゲームへ復帰する | 保存 + 遷移 | H-005, H-006 | 採用 |
| G-030 | Google Drive backup | 片方の端末だけでは揃わない観測を、同じユーザーの別端末から取り込む | 端末間の非同期な観測統合 | 保存 + 遷移 | H-015, H-016, H-017, H-018 | 採用 |
| G-031 | Screen Wake Lock | 画面を見せ続ける権利を得て、visibilityで失った後に取り戻す | 表示状態がOSの画面消灯制御へ影響する | 保存 + 遷移 | H-005, H-022, H-023 | 採用 |
| G-032 | View Transition | DOM更新の前後をブラウザが一つの視覚遷移として結ぶ | 画面の差分ではなく遷移自体を操作する | Webページ基盤 | H-001, H-002, H-003, H-020 | 採用 |
| G-033 | HTMLMediaElement controls / media tracks | B01〜B03はnative seek、mute、play後pause。B04は1倍速以外へのnative速度変更、B05は`Busybox`字幕track、B06はnative PiP入場。対応環境限定の`Busybox`音声trackは将来B07 | UA controlsとnative track選択が実media状態へ反映される挙動を観測する | Webページ基盤 + 端末 + 環境依存 | H-001, H-002, H-003, H-012, H-019, H-020, H-023, H-025, H-030, H-052 | B01〜B06実装済み。Media Capabilities profile箱と実寸reelは不採用、frame cadenceはG-080 / S-810、PiPはG-020から統合 |
| G-034 | WebRTC | 同一ラウンドの2タブ間で生成音声を接続し、接続成立と明示切断を2箱として順に観測する | signalingでなく実際のpeer connection lifecycleが通話になる | 遷移 + 端末 + 環境依存 | H-013, H-019, H-020, H-023 | 採用・S-360技術スパイク待ち |
| G-035 | Battery Status | hosting deviceのcharger接続、取り外し、75%以上、75%未満を4箱として独立観測する | charger eventとbrowser報告capacity帯を別々の入力にする | 端末 + 環境依存 | H-004, H-019, H-023 | 採用・S-370計画 |
| G-036 | Web Authentication Conditional UI / Passkeys | 同一pageでpasskey保存、autofill利用成功、保存済みpasskey利用不成立を3箱として観測する | browserのautofill UIとauthenticatorを作成・成功・不成立で比較する | 保存 + 端末 + 環境依存 | H-006, H-019, H-020, H-023 | 採用・S-380計画 |
| G-037 | Web Authentication request lifecycle / AbortSignal | no-match credential requestの拒否とpending conditional requestのplayer中断を2箱として観測する | credentialを残さず、authenticator側不成立とRP側abortを比較する | Webページ基盤 + 端末 + 環境依存 | H-019, H-020, H-023 | 採用・仮S-390。S-380統合とのPoC比較待ち |
| G-038 | Date / High Resolution Time / Page Visibility | monotonic基準で1時間遅れたアナログ時計へOS wall clockを合わせ、その後正しい時刻へ戻す | 補正される時計と戻らない時計の差が物理的な時刻設定になる | 端末 + 遷移 + 環境依存 | H-004, H-019, H-022, H-023 | 採用・S-400技術スパイク待ち |
| G-039 | Notification actions / Service Worker | pageを開かず左右2 actionの入力列を通知の差替えだけで進め、誤入力時は先頭から再挑戦する | 閉じたpageの外側だけに反復可能な有限状態機械が残る | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-022, H-023, H-025 | 採用・S-410技術スパイク待ち |
| G-040 | Notification actions / notification body click / IndexedDB | 通知の左右actionを金庫の組合せとして蓄積し、通知本文から戻ったpageで正解列と一括照合する | page外で回した鍵の履歴が、金庫へ戻った時にtumbler animationとして再生される | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-020, H-022, H-023, H-025 | 採用・S-420技術スパイク待ち |
| G-041 | Media Session / Audio Session | B01はcontrolsなし生成loop音声をexternal pause actionで停止する。B02は同音声が外部audio focusに中断され、復帰して再生を再開するまでを観測する | page外の停止操作とOSのaudio focus interruptionを別箱にし、外側の音声制御を往復で扱う | 端末 + 遷移 + Labs + 環境依存 | H-003, H-004, H-019, H-020, H-022, H-023, H-025, H-039 | B01実装済み。DR-065のB02承認済み・未実装 |
| G-042 | File Handling / LaunchQueue | stageから得た固有拡張子の鍵fileをOSの「開く」でinstalled Busyboxへ渡す | file managerがPWAの入口になり、実file handleが起動payloadになる | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-021, H-023, H-025 | 採用・S-440技術スパイク待ち |
| G-043 | Protocol Handlers / LaunchQueue | round固有値を含む`web+busybox:` linkからinstalled Busyboxを起動する | HTTPSとは別のURL schemeがOS / browserのapp routingを通る | 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-021, H-023, H-025 | 採用・S-450技術スパイク待ち |
| G-044 | Window Controls Overlay | desktop PWAのtitlebar領域へ現れた箱を、その実geometry内で押す | browser chromeだった場所がWeb contentの盤面になる | Webページ基盤 + PWA + 環境依存 | H-001, H-003, H-005, H-019, H-020, H-023, H-025 | 採用・S-460技術スパイク待ち |
| G-045 | Tabbed Application Mode / tab_strip | ChromeOS PWAのbrowser-owned new-tab buttonから専用stage tabを開く案 | 通常browser tabではなく1つのPWA window内のapp tabを入力にする案だった | 遷移 + PWA + 環境依存 | H-005, H-013, H-019, H-021, H-023, H-025 | 取りやめ・ChromeOS限定のためS-470未予約 |
| G-046 | Preferred text scale / CSS Fonts / User Preferences API | 文字倍率4帯に加え、pageから明示的にoverrideした5種類の`prefers-*`を別々の箱へ対応させる | B01〜B04は文字scale、追加B05〜B09は明暗反転、輪郭変化、動作停止、不透明化、軽量表示を実media queryから描く | Webページ基盤 + 端末 + 環境依存 | H-003, H-004, H-019, H-020, H-023, H-025 | B01〜B04実装済み。DR-019のB05〜B09は採用・未実装 |
| G-047 | HTML input / InputEvent | placeholderの`busybox`を手掛かりに、同じ小文字列をtext inputへ完全一致で入れる | 後続の暗号問題で鍵になる語を、先行stageの弱い記憶として残す | Webページ基盤 | H-001, H-002, H-003, H-004, H-020, H-025 | 採用・S-490計画 |
| G-048 | Clipboard Events / Selection | Caesar暗号文の全体copyで表示と異なる平文を入れ、実paste後に平文中の`busybox`だけを選ぶ | copy overrideで初めて現れる平文と、最後のSelection範囲が一つの暗号chainになる | Webページ基盤 + 遷移 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 | 採用・S-500計画 |
| G-049 | HTML Drag and Drop / DataTransfer File / `text/uri-list` | B01はinstalled PWAのPNG Fileを通常browserへ運ぶ。B02はcross-origin iframe内の透明画像3枚を親Documentの現像台へ運んで重ねる | diskやserverを介さず、継続中のdrag data storeがtop-level window境界とiframe / parent境界を越え、Fileと画像URLをそれぞれ渡す | 遷移 + PWA + 別静的origin + 環境依存 | H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025 | B01 / B02初版実装済み・人手確認待ち |
| G-050 | ProximitySensor | 実readingでfarを確認した後、端末上部へ物を近づけてnearへ変える | cameraではなくhardware proximity detectorの状態遷移を直接使う | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-520技術スパイク待ち |
| G-051 | LinearAccelerationSensor | 端末をX、Y、Z各軸に沿って安全な短い往復運動で振り、各軸の箱を開く | gravityを除いた加速度の正負peakと軸dominanceが3方向の入力になる | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-530技術スパイク待ち |
| G-052 | AmbientLightSensor | 実illuminanceを暗所と非常に明るい環境へ変え、2箱を独立して開く | camera映像ではなく端末の環境光sensorが量子化したlux帯を入力にする | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-540技術スパイク待ち |
| G-053 | Accelerometer | raw X/Y/Zの合成値を算出し、遊びを持った0付近へ入る短い区間を観測する1箱 | `LinearAccelerationSensor`ではなく重力込みのraw accelerationがほぼ0となる状態を使う。`GravitySensor`固有問題は作らない | 端末 + Labs + 環境依存 + 物理操作注意 | H-006, H-019, H-023, H-025, H-026 | 採用・S-550技術スパイク待ち |
| G-054 | Gyroscope | X、Y、Z各軸のdominantな角速度を積分し、各軸で約1回転すると3箱を開く | 現在姿勢でなく回転速度と累積角度が入力になる | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-560技術スパイク待ち |
| G-055 | Magnetometer / AbsoluteOrientationSensor | 金属や磁石を近づける案と、磁北基準のabsolute orientation案 | 磁場readingを使う案 | 端末 + Labs + 環境依存 | H-019, H-023, H-026 | 取りやめ・既定有効engineなし、安全性と再現性不足 |
| G-056 | RelativeOrientationSensor | 開始quaternionから3つの直交する姿勢gateを通り、開始姿勢へ戻る | angular velocityではなく、磁場に依存しない姿勢の経路と閉路を使う | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-570技術スパイク待ち |
| G-057 | Web Speech: SpeechRecognition / SpeechSynthesis | B01はone-shot認識のfinal resultが`busybox`なら開く。DR-063のB02は入力文字を位置ごとに+1、+2…shiftし、画面に出さず一文字ずつ読み上げ、`aspuwiq → busybox`の正常発話完了で開く | browserのspeech-to-text入力と動的text-to-speech出力を別箱にし、B02は聞こえた変換列だけから規則を推測する | 端末 + 権限 + Labs + 環境依存 | H-006, H-007, H-019, H-020, H-023, H-025, H-027 | B01 / B02初版実装済み・人手確認待ち |
| G-058 | Geolocation / Page Visibility / sessionStorage | memoryとsessionStorage上の開始地点から、accuracyを差し引いた確実な距離が5m、25m、100mへ達すると3箱を開く | background追跡ではなく、sleep復帰時の最新fixと短命な開始anchorだけで移動の広がりを判定する | 端末 + 権限 + 保存 + 遷移 + 環境依存 | H-004, H-006, H-019, H-022, H-025, H-028 | 採用・S-590技術スパイク待ち |
| G-059 | Geolocation altitude / altitudeAccuracy | browser報告高度の信頼区間が100m未満、100〜500m、500m以上の各帯へ完全に入ると3箱を開く | 地図上の距離ではなく、異なる高度帯への実訪問が別々の箱になる | 端末 + 権限 + Labs + 環境依存 | H-004, H-006, H-019, H-023, H-025, H-029 | 採用・S-600技術スパイク待ち |
| G-060 | HTMLDialogElement / `closedby` | modal dialogを×button、外側click、platform cancelの3経路で閉じ、それぞれ別箱を開く | top layerと外側inert化を共有しつつ、developer mechanism、native light dismiss、Esc / 端末dismissのclose requestを分ける | Webページ基盤 + Labs + 環境依存 | H-001, H-002, H-003, H-004, H-019, H-020, H-025 | S-610初版実装済み・人手確認待ち。外側clickはnative `closedby="any"`経路 |
| G-061 | Unicode数字の計算式 | 17種類の実Unicode数字で書いた3桁＋3桁の式を並べ、調べて得たASCII十進回答を一つの共通入力欄へ入れると対応する箱が開く | API説明や対応表を表示せず、選択・コピーできる文字、基数、bidi、縦積みなど各記数法の実表記そのものを調査対象にする | Webページ基盤 + フォント資産 | H-001, H-002, H-003, H-004, H-014, H-020, H-025 | S-620初版実装済み・人手確認待ち。17回答は全て異なる固定値、`@counter-style`不使用 |
| G-062 | Network Information `type` | playerが端末外側で接続方式を切り替え、明示観測時のWi-Fi、cellular、ethernet、Bluetoothを別々の箱へ累積する | 回線速度ではなく、実network routeの種類を端末外操作として集める | 端末 + Labs + 環境依存 | H-004, H-019, H-023, H-025, H-032 | 採用・S-630未実装。速度、RTT、Save Data、offline、unknown系は使わない |
| G-063 | 十二の文字コード | 2進byte列4問、16進byte列4問、文字化け4問へ16文字コードlabelを一度ずつ割り当てる | 同じbyte列がdecoder選択で別の文字になるEncoding API固有の境界を、全体一意の対応パズルにする | Webページ基盤 | H-001, H-002, H-003, H-004, H-014, H-020, H-025, H-033 | S-640初版実装済み・人手確認待ち。固定fixtureを`TextDecoder(..., { fatal: true })`で検証する |
| G-064 | 四つの許可 | 位置情報、通知、カメラ、マイクをnative promptまたはsite settingsでONにすると、対応する箱が一つずつ開く | PermissionStatusの初期`granted`と外部変更の`change`を直接盤面化する | 端末 + 権限 + 環境依存 | H-004, H-006, H-007, H-019, H-023, H-025, H-034 | S-650初版実装済み・人手確認待ち。request成功だけでは開かず、media trackは即停止する |
| G-065 | 四つの計算圧力 | CPU pressureの`nominal`、`fair`、`serious`、`critical`を実観測し、対応4箱を訪問間で累積する | user agentが量子化した端末全体のPressureStateをそのまま盤面化する | 端末 + Labs + 環境依存 | H-004, H-019, H-023, H-025, H-035 | S-660初版実装済み・人手確認待ち。ゲーム自身は負荷を生成せず、状態列・時刻を保存しない |
| G-066 | 端末迷路 | Consoleにだけ表示されるASCII迷路を、page上の方向buttonで一歩ずつ進み出口へ到達する | Consoleをread-onlyの別画面にし、pageとConsoleを往復する | Hidden + desktop | H-001, H-002, H-003, H-004, H-020, H-025, H-036 | S-670初版実装済み・人手確認待ち。Console evaluator入力とpage編集を要求しない |
| G-067 | 端末診断卓 | page上のswitch / dialを操作し、Console診断表の複数readingを同時に正常化する案 | S-670と同じくConsoleをread-only表示面、pageを入力面として往復する | — | — | D-135で体験重複のため不採用。S-680は実装しない |
| G-068 | 断片をたどる文書 | 同一page内のText Fragment linkを順に辿り、browserが示した複数の一節からhintを集めて最終回答を作る | URLそのものを長文内の移動手段にし、scriptから読めないUA highlightを手掛かりとして使う | Labs + browser依存 | H-001, H-002, H-003, H-004, H-019, H-020, H-025, H-038 | 枠組み採用・S-690未実装。各jumpをscript判定せず、謎の巡回順と完全解は再吟味する |
| G-069 | 遠くの映写箱 | B01 / B02はRemote Playback接続中の外部画面へ動画内の文字鍵またはround別QRを映し、手元pageで文字入力または実`BarcodeDetector`によるcamera読取を行う。B03はPresentation receiverを外部画面へ実表示する | 同じmediaの外部再生と独立receiver documentの表示を、手元端末と外部画面を往復する3箱にまとめる | 端末 + 外部機器 + 権限 + Labs + 環境依存 | H-003, H-004, H-006, H-019, H-020, H-023, H-025, H-040, H-041 | 採用・S-700未実装。DR-075をB01、DR-016をB02、DR-076をB03へ具体化。B01 / B02は変更せず、B03はmessage列パズルにしない |
| G-070 | 合言葉変換所 | 別サイト風iframeへ動画fileまたは最大10秒のwebcam録画を入れて低bitrate変換し、暗黒frame、decode失敗、QR frame、自己生成metadataの4条件で固定合言葉を出力動画へ埋める | frame処理とcontainer再入力を普通の圧縮toolへ隠し、QR検出をbundled jsQRで端末非依存にする | メディア + iframe + 権限 | H-003, H-004, H-006, H-007, H-014, H-019, H-020, H-023, H-025, H-042 | S-710初版実装済み・人手確認待ち。decode失敗の入力・出力fixtureも製品領域で固定済み |
| G-071 | 映像復元機 | 3動画source、T1〜T3、1 outputをBezier cableで結び、4つの固定QR flagを復元する | 同じT1 nodeへ戻るcycleを含む映像pipelineをpatch bayとして操作する | メディア + 固定fixture | H-001, H-002, H-003, H-004, H-014, H-019, H-020, H-023, H-025, H-043 | S-720初版実装済み・人手確認待ち。9本の製品fixture、4 route、共通flag欄を実装済み |
| G-072 | XRの箱 | 対応するAR / VR機器で実immersive sessionを開始して最初のviewer poseを得た後、XR空間に置かれた一つの箱を実XRInputSourceのselect rayで選ぶ | XRの凝った世界ではなく、機器を稼働させることと空間上の対象へ入力することだけを2箱へ分ける | Exhibit + XR機器 | H-001, H-002, H-003, H-004, H-014, H-019, H-023, H-044 | 採用・S-730未実装。inline session、page click、DOM overlay、模擬poseでは開けず、歩行やroom scanを要求しない |
| G-073 | 留守番温室 | installed PWAで水と光の世話を訪問ごとに一回ずつ預け、window不在中の実`periodicsync`を各一回経て発芽・開花させる | browser裁量の長い待ち時間を植物の生育速度にし、再訪とbackground eventを交互に要求する | Labs + installed PWA + 長期 | H-005, H-014, H-018, H-019, H-021, H-023, H-025, H-045 | 採用・S-740未実装。日次保証、通知、timer、foreground event、DevTools模擬eventでは成長しない |
| G-074 | 届いた封書 | 別の携帯電話または協力者からcurrent roundのorigin-bound SMSを送り、WebOTPまたはOS / browserのOTP専用AutoFillで受け取る | 現実の電話回線からWeb originへ届く封書と、browser所有の二種類のOTP受取UIを一箱のOR条件へ束ねる | Labs + SMS端末 + 協力者 + 環境依存 | H-003, H-004, H-019, H-020, H-023, H-025, H-046 | 採用・S-750未実装。実credentialまたは強い`:autofill`だけを認め、手入力、paste、drop、compositionでは開かない |
| G-075 | 架空の名刺 | 固定のname / email / tel / address / iconをOS contactへ追加し、実Contact Pickerで全項目を渡す箱と、1件選択したまま全項目を渡さない箱を解く | user agent所有pickerで架空contactを共有するB01と、同じ要求propertyをすべて伏せるB02を対比する | Labs + Android contact + 環境依存 | H-003, H-004, H-019, H-023, H-025, H-047 | 採用・S-760未実装。B02はcontact identityや拒否操作を推定せず、1件選択・全property空という返却結果だけを判定する |
| G-076 | 身分証棚 | 実装時点で公式FedCMと一般向けRP登録を提供するmanaged IdPを調査し、providerごとのbrowser所有account chooserを手動完了して独立箱を開く | 複数の外部世界の実accountをbrowserが仲介する固有UIを、identity照合やloginではなく一回限りの身分証提示として集める | Labs + provider account + online + 環境依存 | H-003, H-004, H-019, H-023, H-025, H-049 | 採用・S-770未実装。Google 1箱を計画下限とし、追加providerは公式提供、public client登録、FedCM確証、独自backend不要をPoC後に加算する |
| G-077 | 四つの財布 | 複数の架空payment handlerから正しい財布を選び、承認、意図的拒否、同一handler再試行を別々に成立させる | browser所有のhandler候補、trusted PaymentRequestEvent、handler window、complete / retryというpayment lifecycleを4箱へ分ける | Labs + Chromium系 + HTTPS + Service Worker | H-003, H-004, H-019, H-023, H-025, H-050 | 採用・S-780未実装。各条件成立時に箱だけを開き、結果label、完了message、固定flagを表示しない |
| G-078 | 活字の鍵 | Git管理するBusybox専用fontをOSへinstallし、Local Font Accessでその実font dataを再発見する | OSのfont install UIとbrowserのlocal-fonts許可を通り、system fontになったfixtureだけがWebへ戻る | Labs + desktop Chromium + OS変更 + 権限 | H-003, H-004, H-006, H-014, H-019, H-023, H-025, H-051 | 採用・S-790未実装。全fontを列挙せず対象PostScript名だけを要求し、端末固有font名・固定flagを使わない |
| G-079 | 断片を組み立てる文書 | 同一pageの英文に対してplayer自身がText Fragment付きURLを組み立て、指定された単語だけをbrowserにhighlightさせる | fragmentを読む箱と単語からfragmentを作る箱を対にし、address barを入力面、UA highlightを結果表示にする | Labs + Text Fragment / `hidden=until-found`対応browser | H-001, H-002, H-003, H-004, H-019, H-020, H-025, H-038 | 採用・S-800未実装。B01 / B02の2箱。入力欄なし。英文、対象語、提示fragmentは実装前に吟味する |
| G-080 | frameの拍子 | VFR動画のnative timelineをseekし、実提示frameから24fps区間を探す | `requestVideoFrameCallback().mediaTime`だけで観測し、wall clockとscript自動seekを使わない | page + `requestVideoFrameCallback()`対応browser | H-001, H-002, H-003, H-019, H-020, H-023, H-025, H-053 | 採用・S-810-B01実装済み。S-350の旧frame cadence箱は廃止 |

## 候補を採用へ進めるときの追記

各メモには、採用前に次を追記する。

- 調査日と一次情報へのリンク
- 実際に使うAPI機能
- 対応ブラウザとOS
- 必要な権限、機器、PWA、Secure Context
- クリア条件の観測方法
- 似ている既存ギミックとの差
- 生データの扱いと後片付け
- 事前生成media assetと再現手順、またはruntime生成が不可欠な理由
- 文字列回答が必要なら固定合言葉とcopy可否、同期値が必要ならround値が不可欠な理由。API操作だけで開く場合は回答文字列なしと明記する
- 自動テスト可能な範囲
- 必須の人手確認ID
- 試作で分かった失敗理由

却下した案も削除せず、理由を残す。同じ失敗や重複案を別のエージェントが再提案するのを防ぐためである。
