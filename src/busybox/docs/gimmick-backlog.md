# ギミックメモ台帳

> 2026-07-20追記: この表の末尾状態語は着手時点の履歴である。採用済み項目はS-350〜S-600を含め実装済みで、現在状態は[ステージ実装状況](./stage-implementation-status.md)を正とする。

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
| G-003 | Selection / Custom Highlight | 意味のある範囲を文字列入力ではなく選択範囲として示す | 選択そのものが回答になる | Webページ基盤 | H-001, H-003, H-020 | 採用 |
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
| G-014 | IndexedDB | その場の操作では完成せず、過去の訪問で残した状態が材料になる | 再訪まで保持される記憶 | 保存 | H-001, H-018 | 採用 |
| G-015 | Service Worker / Cache | オフライン時だけ現れる応答を観測する | 通信断が失敗でなく条件になる | 保存 + 遷移 | H-005, H-021, H-022 | 採用 |
| G-016 | Badging | アプリ外のバッジ表示を、段階的なフィードバックとして使う | インストール後のOS表面が盤面になる | 保存 + 環境依存 | H-005, H-023 | 採用 |
| G-017 | Broadcast Channel | 2つのタブが異なる役割を持ち、同時に状態を合わせる | 同一オリジンの並行文脈 | 遷移 | H-013 | 採用 |
| G-018 | Page Visibility | 同一documentを2秒または25分以上連続して隠し、visible復帰時のmonotonic elapsedを2箱で観測する | 観測していない短時間と長時間が別の入力になる | 保存 + 遷移 | H-013, H-022, H-025 | 採用・S-040拡張待ち |
| G-019 | History / Navigation Timing | same-document履歴を戻る箱に加え、documentのback-forward復帰とreloadを別々に観測する | ブラウザ履歴とnavigation種別が迷路になる | 遷移 | H-001, H-002, H-003 | 採用・S-220拡張待ち |
| G-020 | Picture-in-Picture | 本体から離れた映像と元画面の状態を組み合わせる | ブラウザ外縁の小窓が別の盤面になる | 端末 + 遷移 | H-012, H-023 | 採用 |
| G-021 | Web Share / Web Share Target | 一時tokenを外へ渡す箱と、installed Busyboxを共有先にして同じroundを外から受け取る箱を分ける | Webが共有の送信元と受信先の両方になる | 遷移 + PWA + 環境依存 | H-005, H-014, H-004, H-023 | 採用・S-240再設計待ち |
| G-022 | Web Locks | RGB三色のタブを同時に灯し、白い監視タブで指定順のlock解放を観測する | 並行文脈の生存と終了順を加法混色として読む | 保存 + 遷移 | H-013, H-022 | 採用・S-250再設計待ち |
| G-023 | EyeDropper | ページ内部の色ではなく、画面上の別の場所から正確な色を採る | ブラウザ境界をまたぐ色入力 | 端末 + 環境依存 | H-006, H-023 | 採用 |
| G-024 | WebGPU | 描画の派手さではなく、大量の候補を並列評価した結果だけを使う | GPU計算能力が解法の装置になる | 端末 + 環境依存 | H-023, H-019 | 採用 |
| G-025 | Web Bluetooth | 選択した近接機器から変化する信号を受け取る | 無線距離と外部状態 | 端末 + 環境依存 | H-010, H-006 | 採用 |
| G-026 | WebHID / WebUSB | 一般入力へ変換されない機器固有のレポートを読む | ブラウザが特殊機器と直接対話する | 端末 + 環境依存 | H-011, H-006 | 採用 |
| G-027 | Launch Handler / PWA起動 / manifest shortcuts / note taking | 通常tabとinstalled起動を分け、stage URL、icon shortcut、新規メモの各専用URLを3箱で受ける | installed appへの通常deep linkと2種類のOS登録taskが別の入口になる | 保存 + 遷移 + 環境依存 | H-005, H-021, H-023, H-025 | 採用・S-310-B02/B03拡張待ち |
| G-028 | Device Posture / Viewport Segments | 折りたたみ状態や画面境界で分断された要素を合わせる | 物理的な折れ目がレイアウト入力になる | 端末 + 環境依存 | H-023 | 採用 |
| G-029 | Notifications | ページ外で受け取った情報を通知操作によって持ち帰る | OS通知からゲームへ復帰する | 保存 + 遷移 | H-005, H-006 | 採用 |
| G-030 | Google Drive backup | 片方の端末だけでは揃わない観測を、同じユーザーの別端末から取り込む | 端末間の非同期な観測統合 | 保存 + 遷移 | H-015, H-016, H-017, H-018 | 採用 |
| G-031 | Screen Wake Lock | 画面を見せ続ける権利を得て、visibilityで失った後に取り戻す | 表示状態がOSの画面消灯制御へ影響する | 保存 + 遷移 | H-005, H-022, H-023 | 採用 |
| G-032 | View Transition | DOM更新の前後をブラウザが一つの視覚遷移として結ぶ | 画面の差分ではなく遷移自体を操作する | Webページ基盤 | H-001, H-002, H-003, H-020 | 採用 |
| G-033 | HTMLMediaElement controls | native playerでシーク、ミュート、再生後の停止を行い、3箱を独立して開く | user agentが描画するmedia controlsとtimelineを盤面にする | Webページ基盤 + 端末 | H-001, H-002, H-003, H-020, H-023 | 採用・S-350計画 |
| G-034 | WebRTC | 同一ラウンドの2タブ間で生成音声を接続し、接続成立と明示切断を2箱として順に観測する | signalingでなく実際のpeer connection lifecycleが通話になる | 遷移 + 端末 + 環境依存 | H-013, H-019, H-020, H-023 | 採用・S-360技術スパイク待ち |
| G-035 | Battery Status | hosting deviceのcharger接続、取り外し、75%以上、75%未満を4箱として独立観測する | charger eventとbrowser報告capacity帯を別々の入力にする | 端末 + 環境依存 | H-004, H-019, H-023 | 採用・S-370計画 |
| G-036 | Web Authentication Conditional UI / Passkeys | 同一pageでpasskey保存、autofill利用成功、保存済みpasskey利用不成立を3箱として観測する | browserのautofill UIとauthenticatorを作成・成功・不成立で比較する | 保存 + 端末 + 環境依存 | H-006, H-019, H-020, H-023 | 採用・S-380計画 |
| G-037 | Web Authentication request lifecycle / AbortSignal | no-match credential requestの拒否とpending conditional requestのplayer中断を2箱として観測する | credentialを残さず、authenticator側不成立とRP側abortを比較する | Webページ基盤 + 端末 + 環境依存 | H-019, H-020, H-023 | 採用・仮S-390。S-380統合とのPoC比較待ち |
| G-038 | Date / High Resolution Time / Page Visibility | monotonic基準で1時間遅れたアナログ時計へOS wall clockを合わせ、その後正しい時刻へ戻す | 補正される時計と戻らない時計の差が物理的な時刻設定になる | 端末 + 遷移 + 環境依存 | H-004, H-019, H-022, H-023 | 採用・S-400技術スパイク待ち |
| G-039 | Notification actions / Service Worker | pageを開かず左右2 actionの入力列を通知の差替えだけで進め、誤入力時は先頭から再挑戦する | 閉じたpageの外側だけに反復可能な有限状態機械が残る | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-022, H-023, H-025 | 採用・S-410技術スパイク待ち |
| G-040 | Notification actions / notification body click / IndexedDB | 通知の左右actionを金庫の組合せとして蓄積し、通知本文から戻ったpageで正解列と一括照合する | page外で回した鍵の履歴が、金庫へ戻った時にtumbler animationとして再生される | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-020, H-022, H-023, H-025 | 採用・S-420技術スパイク待ち |
| G-041 | Media Session | controlsなしの生成loop audioを、OS / browser / physical media controlから届くpause actionで停止する | page外の再生面が、見えない停止buttonになる | 端末 + 遷移 + 環境依存 | H-003, H-004, H-019, H-020, H-022, H-023, H-025 | 採用・S-430技術スパイク待ち |
| G-042 | File Handling / LaunchQueue | stageから得た固有拡張子の鍵fileをOSの「開く」でinstalled Busyboxへ渡す | file managerがPWAの入口になり、実file handleが起動payloadになる | 保存 + 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-021, H-023, H-025 | 採用・S-440技術スパイク待ち |
| G-043 | Protocol Handlers / LaunchQueue | round固有値を含む`web+busybox:` linkからinstalled Busyboxを起動する | HTTPSとは別のURL schemeがOS / browserのapp routingを通る | 遷移 + PWA + 環境依存 | H-005, H-006, H-019, H-021, H-023, H-025 | 採用・S-450技術スパイク待ち |
| G-044 | Window Controls Overlay | desktop PWAのtitlebar領域へ現れた箱を、その実geometry内で押す | browser chromeだった場所がWeb contentの盤面になる | Webページ基盤 + PWA + 環境依存 | H-001, H-003, H-005, H-019, H-020, H-023, H-025 | 採用・S-460技術スパイク待ち |
| G-045 | Tabbed Application Mode / tab_strip | ChromeOS PWAのbrowser-owned new-tab buttonから専用stage tabを開く案 | 通常browser tabではなく1つのPWA window内のapp tabを入力にする案だった | 遷移 + PWA + 環境依存 | H-005, H-013, H-019, H-021, H-023, H-025 | 取りやめ・ChromeOS限定のためS-470未予約 |
| G-046 | Preferred text scale / CSS Fonts | OS / browserの推奨文字倍率を小・標準・大・特大の4帯へ分け、各帯で別の箱を開く | accessibilityの文字設定がCSS layoutそのものを4状態へ変える | Webページ基盤 + 端末 + 環境依存 | H-003, H-004, H-019, H-020, H-023, H-025 | 採用・S-480技術スパイク待ち |
| G-047 | HTML input / InputEvent | placeholderの`busybox`を手掛かりに、同じ小文字列をtext inputへ完全一致で入れる | 後続の暗号問題で鍵になる語を、先行stageの弱い記憶として残す | Webページ基盤 | H-001, H-002, H-003, H-004, H-020, H-025 | 採用・S-490計画 |
| G-048 | Clipboard Events / Selection | Caesar暗号文の全体copyで表示と異なる平文を入れ、実paste後に平文中の`busybox`だけを選ぶ | copy overrideで初めて現れる平文と、最後のSelection範囲が一つの暗号chainになる | Webページ基盤 + 遷移 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 | 採用・S-500計画 |
| G-049 | HTML Drag and Drop / DataTransfer File | installed PWAで生成したPNG stickerを、通常browserの別windowへpointer dragで運ぶ | diskやserverを介さず、継続中のdrag data storeがapp window境界を越えて実Fileを渡す | 遷移 + PWA + 環境依存 | H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025 | 採用・S-510技術スパイク待ち |
| G-050 | ProximitySensor | 実readingでfarを確認した後、端末上部へ物を近づけてnearへ変える | cameraではなくhardware proximity detectorの状態遷移を直接使う | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-520技術スパイク待ち |
| G-051 | LinearAccelerationSensor | 端末をX、Y、Z各軸に沿って安全な短い往復運動で振り、各軸の箱を開く | gravityを除いた加速度の正負peakと軸dominanceが3方向の入力になる | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-530技術スパイク待ち |
| G-052 | AmbientLightSensor | 実illuminanceを暗所と非常に明るい環境へ変え、2箱を独立して開く | camera映像ではなく端末の環境光sensorが量子化したlux帯を入力にする | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-540技術スパイク待ち |
| G-053 | Accelerometer | raw X/Y/Zの合成値を算出し、遊びを持った0付近へ入る短い区間を観測する1箱 | `LinearAccelerationSensor`ではなく重力込みのraw accelerationがほぼ0となる状態を使う。`GravitySensor`固有問題は作らない | 端末 + Labs + 環境依存 + 物理操作注意 | H-006, H-019, H-023, H-025, H-026 | 採用・S-550技術スパイク待ち |
| G-054 | Gyroscope | X、Y、Z各軸のdominantな角速度を積分し、各軸で約1回転すると3箱を開く | 現在姿勢でなく回転速度と累積角度が入力になる | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-560技術スパイク待ち |
| G-055 | Magnetometer / AbsoluteOrientationSensor | 金属や磁石を近づける案と、磁北基準のabsolute orientation案 | 磁場readingを使う案 | 端末 + Labs + 環境依存 | H-019, H-023, H-026 | 取りやめ・既定有効engineなし、安全性と再現性不足 |
| G-056 | RelativeOrientationSensor | 開始quaternionから3つの直交する姿勢gateを通り、開始姿勢へ戻る | angular velocityではなく、磁場に依存しない姿勢の経路と閉路を使う | 端末 + Labs + 環境依存 | H-006, H-019, H-023, H-025, H-026 | 採用・S-570技術スパイク待ち |
| G-057 | SpeechRecognition | microphone buttonから1回のrecognitionを開始し、final resultの候補が正規化後に`busybox`なら1箱を開く | 音量や音程ではなくbrowserのspeech-to-text結果を使い、S-490で覚えた鍵語を声で再入力する | 端末 + 権限 + Labs + 環境依存 | H-006, H-007, H-019, H-020, H-023, H-025, H-027 | 採用・S-580技術スパイク待ち |
| G-058 | Geolocation / Page Visibility / sessionStorage | memoryとsessionStorage上の開始地点から、accuracyを差し引いた確実な距離が5m、25m、100mへ達すると3箱を開く | background追跡ではなく、sleep復帰時の最新fixと短命な開始anchorだけで移動の広がりを判定する | 端末 + 権限 + 保存 + 遷移 + 環境依存 | H-004, H-006, H-019, H-022, H-025, H-028 | 採用・S-590技術スパイク待ち |
| G-059 | Geolocation altitude / altitudeAccuracy | browser報告高度の信頼区間が100m未満、100〜500m、500m以上の各帯へ完全に入ると3箱を開く | 地図上の距離ではなく、異なる高度帯への実訪問が別々の箱になる | 端末 + 権限 + Labs + 環境依存 | H-004, H-006, H-019, H-023, H-025, H-029 | 採用・S-600技術スパイク待ち |

## 候補を採用へ進めるときの追記

各メモには、採用前に次を追記する。

- 調査日と一次情報へのリンク
- 実際に使うAPI機能
- 対応ブラウザとOS
- 必要な権限、機器、PWA、Secure Context
- クリア条件の観測方法
- 似ている既存ギミックとの差
- 生データの扱いと後片付け
- 自動テスト可能な範囲
- 必須の人手確認ID
- 試作で分かった失敗理由

却下した案も削除せず、理由を残す。同じ失敗や重複案を別のエージェントが再提案するのを防ぐためである。
