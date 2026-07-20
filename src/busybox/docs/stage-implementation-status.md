# ステージ実装状況

## 状態の定義

| 状態 | 意味 |
| --- | --- |
| 実装済み | 観測・判定・演出・永続化・cleanupをコード化し、自動チェック済み |
| 人手確認待ち | 実装済みだが、指定した実ブラウザ・実機の証跡が未記録 |
| 設定待ち | 外部設定や公開環境がなければ最終確認できない |
| 計画 | 仕様候補のみで、ゲーム一覧では操作不可 |

「実装済み」は公開合格を意味しない。人手確認台帳の必須ケースが未実施なら、リリース判定では未検証として扱う。

## 2026-07-20時点

全60ステージを `stages/S-xxx.tsx` または機構別共有moduleに実装し、runtime registryから同じIDの遅延chunkとして読み込む。ステージラベルは表示コピーだけに使い、識別子はステージID・問題箱IDへ固定した。

コード上の基準値は60ステージ・97問題箱である。S-380 / S-390は別stageとして採用し、下表の全行がcatalogue、runtime registry、ゲーム地図、機械可読manifestに存在する。候補だったS-190-B05は、OS通知面をscreen captureの選択候補として要求・検証できる標準APIがなく、再現可能な成功条件を作れないため不採用とした。

| ID | コード | 状態 | 自動確認 | 残る人手確認 |
| --- | --- | --- | --- | --- |
| S-000 | click / activation | 実装済み・人手確認待ち | 初回・再入場の閉箱、累積1/1、再開封、進捗非重複 | H-001, H-002, H-003, H-020 |
| S-010 | Pointer Events | 実装済み・人手確認待ち | 3箱の同形性、マウス分離、再入場時の累積1/3 | H-004, H-020, H-024 |
| S-020 | viewport resize | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-002, H-003 |
| S-030 | Selection | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-003, H-020 |
| S-040 | Page Visibility / High Resolution Time | 実装済み・人手確認待ち | monotonicな2秒判定と、同一documentが25分以上連続hidden後に復帰するB02。reload / discardは試行終了 | H-013, H-022, H-025 |
| S-050 | Broadcast Channel | 実装済み・人手確認待ち | URL直接起動、cleanup境界 | H-013 |
| S-060 | IndexedDB再訪 | 実装済み・人手確認待ち | 観測保存、移行、マージ | H-001, H-018 |
| S-070 | Service Worker / offline | 実装済み・人手確認待ち | scope付きbuild、offlineイベント | H-005, H-021, H-022 |
| S-080 | PWA display-mode | 実装済み・人手確認待ち | capability失敗の隔離 | H-005, H-023 |
| S-090 | Notifications | 実装済み・人手確認待ち | 明示操作、復帰URL | H-005, H-006, H-023 |
| S-100 | Device Orientation | 実装済み・人手確認待ち | 明示権限、cleanup境界 | H-008 |
| S-110 | camera / luminance | 実装済み・人手確認待ち | 生映像非保存、track cleanup | H-006, H-007, H-019 |
| S-120 | microphone / RMS | 実装済み・人手確認待ち | 生音声非保存、AudioContext cleanup | H-006, H-007, H-019 |
| S-130 | File API / Web Crypto | 実装済み・人手確認待ち | 4KB上限、ハッシュ照合、2箱進捗 | H-014, H-020 |
| S-140 | Google Drive `appDataFolder` | 実装済み・設定/人手確認待ち | API通信モック、grow-onlyマージ、破損保護 | H-015〜H-018 |
| S-150 | DOM / MutationObserver | 実装済み・人手確認待ち | DOM順と見た目順の分離、observer cleanup | H-001, H-020 |
| S-160 | Canvas / Pointer Events | 実装済み・人手確認待ち | 距離・時間・速度差の判定、pointer cleanup | H-004, H-020, H-024 |
| S-170 | Web Animations | 実装済み・人手確認待ち | animation時刻判定、cancel cleanup | H-001, H-002, H-003, H-020 |
| S-180 | Clipboard API | 実装済み・人手確認待ち | copy操作で`xobysub`を書き、page外で`busybox`へ修正・再copyした後、箱click時の`clipboard.readText()`完全一致でB01 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-190 | Screen Capture / MediaRecorder / WebRTC / Canvas marker decode | B01〜B04実装済み・人手確認待ち、B05不採用 | B01 frame継続、B02 local recording、B03 observer relay、B04はround handshake済みmind map外縁markerを実frameからdecode。notification image marker B05は再現保証不能 | H-006, H-007, H-012, H-013, H-019, H-023 |
| S-200 | Gamepad | 実装済み・人手確認待ち | 2 button + axis同時判定、機器ID非保存 | H-009, H-019 |
| S-210 | Badging | 実装済み・人手確認待ち | 1→2→3成功、離脱時clear | H-005, H-023 |
| S-220 | History / Navigation Timing | 実装済み・人手確認待ち | B01は同一ステージ3履歴とBack再入場、B02はfull-document back-forward復帰、B03はreload | H-001, H-002, H-003, H-022 |
| S-230 | Picture-in-Picture | 実装済み・人手確認待ち | 生成stream、PiP入場event、終了cleanup | H-012, H-023 |
| S-240 | Web Share / Web Share Target | 実装済み・人手確認待ち | B01はOS共有完了、B02はinstalled Busyboxのmanifest share target受信 | H-004, H-005, H-014, H-023 |
| S-250 | BroadcastChannel / Page Lifecycle | 実装済み・人手確認待ち | RGBの3tab同時生存で白、`B → G → R`のpagehide列で2箱目 | H-013, H-022 |
| S-260 | EyeDropper | 実装済み・人手確認待ち | 実画面選択、指定sRGB色との一致 | H-006, H-023 |
| S-270 | WebGPU | 実装済み・人手確認待ち | compute dispatch、GPU readback、buffer破棄 | H-019, H-023 |
| S-280 | Web Bluetooth | 実装済み・人手確認待ち | Battery Service実read、GATT切断 | H-006, H-010, H-019 |
| S-290 | WebHID | 実装済み・人手確認待ち | 選択後の実inputreport、device close | H-006, H-011, H-019 |
| S-300 | WebUSB | 実装済み・人手確認待ち | claim後の実IN transfer、device close | H-006, H-011, H-019 |
| S-310 | Launch Handler / manifest shortcuts / note taking | 実装済み・人手確認待ち | B01 stage-scoped URL、B02 icon shortcut、B03 `note_taking.new_note_url`をLaunchQueueまたは起動URLで受信 | H-005, H-021, H-023, H-025 |
| S-320 | Device Posture / Viewport Segments | 実装済み・人手確認待ち | folded changeまたは2 segment | H-023 |
| S-330 | Screen Wake Lock | 実装済み・人手確認待ち | 取得・visibility解放・再取得の2箱 | H-005, H-022, H-023 |
| S-340 | View Transition | 実装済み・人手確認待ち | 3回のtransition完了、非対応隔離 | H-001, H-002, H-003, H-020 |
| S-350 | HTMLMediaElement controls | 実装済み・人手確認待ち | 生成動画のnative seek、mute、play後のpauseを3箱で観測 | H-001, H-002, H-003, H-020, H-023 |
| S-360 | WebRTC / Web Audio | 実装済み・人手確認待ち | 2タブ間の生成音声接続でB01、明示的data channel終了でB02。外部server、STUN / TURN、microphoneなし | H-013, H-019, H-020, H-023 |
| S-370 | Battery Status | 実装済み・人手確認待ち | B01/B02は実chargingchange、B03/B04は75%境界のbrowser報告値 | H-004, H-019, H-023 |
| S-380 | Web Authentication Conditional UI / Passkeys | 実装済み・人手確認待ち | B01作成＋credential ID保存、B02 Conditional利用成功、B03利用不成立。専用host名とpasskey残留警告が前提 | H-006, H-019, H-020, H-023 |
| S-390 | Web Authentication request lifecycle / AbortSignal | 実装済み・人手確認待ち | B01 no-match拒否、B02 pending conditional requestのplayer起因abort。S-380とは別stageに確定 | H-019, H-020, H-023 |
| S-400 | Date / High Resolution Time / Page Visibility | 実装済み・人手確認待ち | monotonic基準からwall clockを-60分±5分へ合わせるB01、その後baseline±5分へ戻すB02 | H-004, H-019, H-022, H-023 |
| S-410 | Notification actions / Service Worker | 実装済み・人手確認待ち | pageを開かず左右action列をnotification差替えで反復。誤入力reset、完了時だけ専用URLへ復帰 | H-005, H-006, H-019, H-022, H-023, H-025 |
| S-420 | Notification actions / notification body click | 実装済み・人手確認待ち | 左右actionを固定長まで通知dataへ蓄積し、本文clickで金庫pageへ提出。一括照合一致でB01 | H-005, H-006, H-019, H-020, H-022, H-023, H-025 |
| S-430 | Media Session / generated audio | 実装済み・人手確認待ち | controlsなし生成音がplaying中、registered Media Session pause handlerで停止した場合だけB01 | H-003, H-004, H-019, H-020, H-022, H-023, H-025 |
| S-440 | File Handling / LaunchQueue | 実装済み・人手確認待ち | downloaded `.busybox`をOSから開き、実handleのroundがarmed roundと一致した場合にB01 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-450 | Protocol Handlers / LaunchQueue | 実装済み・人手確認待ち | `web+busybox:`のround nonceをinstalled PWAのhandler URL / LaunchQueueで受けてB01 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-460 | Window Controls Overlay | 実装済み・人手確認待ち | overlay visibleかつgetTitlebarAreaRect内のno-drag箱を実clickしてB01 | H-001, H-003, H-005, H-019, H-020, H-023, H-025 |
| S-480 | Preferred text scale / CSS Fonts | 実装済み・人手確認待ち | 1rem実測を小・標準・大・特大の4帯へ分類し、設定変更をResizeObserverで再評価 | H-003, H-004, H-019, H-020, H-023, H-025 |
| S-490 | HTML input / InputEvent | 実装済み・人手確認待ち | placeholderが`busybox`のinputで現在値が完全一致した時にB01。値は保存しない | H-001, H-002, H-003, H-004, H-020, H-025 |
| S-500 | Clipboard Events / Selection | 実装済み・人手確認待ち | Caesar暗号文のcopy override、trusted paste、target DOM内の`busybox`完全選択の連続条件でB01 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-510 | HTML Drag and Drop / DataTransfer File | 実装済み・人手確認待ち | 専用source窓からround PNG Fileを実drag / dropし、type、filename、bytes内round一致でB01 | H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025 |
| S-520 | ProximitySensor | 実装済み・人手確認待ち | 実far reading後、同じsensor instanceで`near === true`を観測してB01 | H-006, H-019, H-023, H-025, H-026 |
| S-530 | LinearAccelerationSensor | 実装済み・人手確認待ち | X/Y/Z各軸の正負peakを観測するB01〜B03。危険な操作を要求しない | H-006, H-019, H-023, H-025, H-026 |
| S-540 | AmbientLightSensor | 実装済み・人手確認待ち | 実illuminanceの暗所帯B01と非常に明るい帯B02 | H-006, H-019, H-023, H-025, H-026 |
| S-550 | Accelerometer | 実装済み・人手確認待ち | raw合成加速度が2.0m/s²以下へ3 reading以上かつ80ms以上入るB01。投げ上げを指示しない | H-006, H-019, H-023, H-025, H-026 |
| S-560 | Gyroscope | 実装済み・人手確認待ち | 角速度を積分し、X/Y/Z各軸で約2πへ到達するB01〜B03 | H-006, H-019, H-023, H-025, H-026 |
| S-570 | RelativeOrientationSensor | 実装済み・人手確認待ち | 開始quaternionから3つの姿勢gateを通り、開始姿勢へ戻るB01 | H-006, H-019, H-023, H-025, H-026 |
| S-580 | SpeechRecognition | 実装済み・人手確認待ち | 明示buttonから認識し、正規化後に`busybox`ならB01。入力代替なし | H-006, H-007, H-019, H-020, H-023, H-025, H-027 |
| S-590 | Geolocation / Page Visibility / sessionStorage | 実装済み・人手確認待ち | 保守的距離が5m、25m、100mへ達するB01〜B03。開始anchorだけを同一tabへ最大24時間保存 | H-004, H-006, H-019, H-022, H-025, H-028 |
| S-600 | Geolocation altitude / altitudeAccuracy | 実装済み・人手確認待ち | 不確実性区間全体が3高度帯の一つへ入り、3 reading以上かつ5秒安定すると対応B01〜B03 | H-004, H-006, H-019, H-023, H-025, H-029 |

H-025は全行に共通する公開前ゲートである。コード上は全問題箱が単一 `ProblemGiftBox` とID別presentationを通り、状態導出の組み合わせを自動テストしている。実API・権限・端末条件を再達成した時に各箱が開くことは、各ステージの既存人手ゲートと合わせて確認する。

## 共通ランタイムとの対応

| 層 | 現在の実装 |
| --- | --- |
| 観測 | 各ステージコンポーネントがイベントを購読し、権限不要の能力判定を一覧とは分離する |
| 判定 | `ProblemHandle` を通して生イベントを問題箱IDと非機密な `facts` へ変換する |
| 演出 | 単一 `GiftBox` の同じDOMで、問題箱はリボン付き・閉箱・開箱、一覧は集約3状態を表示する |
| 永続化 | ステージはIndexedDBへ直接触らず、共通進捗コントローラーへ解決・観測だけを渡す |
| 再挑戦 | `StageHost` が入場時の永続履歴snapshotと今回開いた集合を分離し、入場ごとに閉箱へ戻す。AbortSignalとReact effect cleanupでイベント、stream、lock、channelを破棄する |

ステージURLは `index.html?stage=S-xxx` とし、GitHub Pagesでrewriteを要求しない。履歴の戻る・進むと直接URL起動の両方を同じ入口で扱う。
