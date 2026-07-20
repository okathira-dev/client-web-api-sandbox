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

全35ステージは `stages/S-xxx.tsx` に1ファイルずつ実装し、runtime registryから同じIDの遅延chunkとして読み込む。ステージラベルは表示コピーだけに使い、識別子はステージID・問題箱IDへ固定した。各ファイルのJSDocはギミック、使用API、成功条件、権限・プライバシー、cleanup、人手確認IDを同じ見出しで記録する。

コード上の基準値は35ステージ・42問題箱である。下表には既存ステージの再設計とS-350以降の計画も併記するが、計画行はcatalogue、runtime registry、ゲーム一覧にはまだ存在しない。合意済みの確定計画はS-380 / S-390を分ける場合60ステージ・97箱、統合する場合59ステージ・97箱であり、PoC中のS-190-B05を採用した場合だけ1箱増える。集計根拠と実装順は[ステージ展開計画](./stage-rollout-plan.md)を正とする。

| ID | コード | 状態 | 自動確認 | 残る人手確認 |
| --- | --- | --- | --- | --- |
| S-000 | click / activation | 実装済み・人手確認待ち | 初回・再入場の閉箱、累積1/1、再開封、進捗非重複 | H-001, H-002, H-003, H-020 |
| S-010 | Pointer Events | 実装済み・人手確認待ち | 3箱の同形性、マウス分離、再入場時の累積1/3 | H-004, H-020, H-024 |
| S-020 | viewport resize | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-002, H-003 |
| S-030 | Selection | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-003, H-020 |
| S-040 | Page Visibility / High Resolution Time | B01実装済み・B02拡張待ち | B01をDate.nowからmonotonicな2秒判定へ変更し、同一documentが25分以上連続hidden後に復帰するB02を追加。reload / discardは試行終了 | H-013, H-022, H-025 |
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
| S-180 | Clipboard API | 現行2箱実装済み・1箱再設計待ち | copy操作で`xobysub`を書き、page外で`busybox`へ修正・再copyした後、箱click時の`clipboard.readText()`完全一致でB01。現行write / paste 2箱を一つの往復条件へ統合 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-190 | Screen Capture / MediaRecorder / WebRTC / Canvas marker decode | 現行B01実装済み・B02〜B04再設計待ち・B05 PoC待ち | B01 frame継続、B02 local recording、B03 observer relay、B04は別tabのmind map外縁markerを探索し実frame decode。BB-060を統合。notification image marker B05はOSの通知capture可否を実機PoC後に決める | H-006, H-007, H-012, H-013, H-019, H-023 |
| S-200 | Gamepad | 実装済み・人手確認待ち | 2 button + axis同時判定、機器ID非保存 | H-009, H-019 |
| S-210 | Badging | 実装済み・人手確認待ち | 1→2→3成功、離脱時clear | H-005, H-023 |
| S-220 | History / Navigation Timing | 現行B01実装済み・B02/B03拡張待ち | B01は同一ステージ3履歴とBack再入場。B02はfull-document navigationからのback-forward復帰、B03はreload。bfcache復元も観測する仕様は未実装 | H-001, H-002, H-003, H-022 |
| S-230 | Picture-in-Picture | 実装済み・人手確認待ち | 生成stream、PiP入場event、終了cleanup | H-012, H-023 |
| S-240 | Web Share / Web Share Target | 現行B01実装済み・B02再設計待ち | B01はtargetまたはOSへのpayload引き渡し。B02はinstalled Busyboxによる同一round URL受信。manifest、受信route、PWAインストール導線は未実装 | H-004, H-005, H-014, H-023 |
| S-250 | Web Locks | 現行実装済み・RGB再設計待ち | holder / blockedの2箱は自動確認済み。三色同時点灯、白い監視タブ、`B → G → R` 解放順は未実装 | H-013, H-022 |
| S-260 | EyeDropper | 実装済み・人手確認待ち | 実画面選択、指定sRGB色との一致 | H-006, H-023 |
| S-270 | WebGPU | 実装済み・人手確認待ち | compute dispatch、GPU readback、buffer破棄 | H-019, H-023 |
| S-280 | Web Bluetooth | 実装済み・人手確認待ち | Battery Service実read、GATT切断 | H-006, H-010, H-019 |
| S-290 | WebHID | 実装済み・人手確認待ち | 選択後の実inputreport、device close | H-006, H-011, H-019 |
| S-300 | WebUSB | 実装済み・人手確認待ち | claim後の実IN transfer、device close | H-006, H-011, H-019 |
| S-310 | Launch Handler / manifest shortcuts / note taking | B01実装済み・B02/B03拡張待ち | B01はstage-scoped URL、B02はicon shortcut専用URL、B03は`note_taking.new_note_url`をLaunchQueueで受信。通常page内linkは置かない | H-005, H-021, H-023, H-025 |
| S-320 | Device Posture / Viewport Segments | 実装済み・人手確認待ち | folded changeまたは2 segment | H-023 |
| S-330 | Screen Wake Lock | 実装済み・人手確認待ち | 取得・visibility解放・再取得の2箱 | H-005, H-022, H-023 |
| S-340 | View Transition | 実装済み・人手確認待ち | 3回のtransition完了、非対応隔離 | H-001, H-002, H-003, H-020 |
| S-350 | HTMLMediaElement controls | 計画 | native seek、mute、play後のpauseを3箱で観測。動画assetを含め未実装 | H-001, H-002, H-003, H-020, H-023 |
| S-360 | WebRTC / Web Audio | 技術スパイク待ち | 2タブ間の生成音声接続でB01、connected後の明示的なdata channel終了でB02。外部signaling server、STUN / TURN、microphoneは使わない計画 | H-013, H-019, H-020, H-023 |
| S-370 | Battery Status | 計画 | B01 charger接続、B02取り外しは実chargingchangeを要求。B03 level 75%以上、B04 75%未満はbrowser報告値として観測。未実装 | H-004, H-019, H-023 |
| S-380 | Web Authentication Conditional UI / Passkeys | 計画 | 同一pageの3箱。B01作成＋local保存、B02 Conditional利用成功、B03保存済みpasskey利用不成立。専用host名と残留警告が前提。G-037の2箱を同居させるvariantもPoC比較する | H-006, H-019, H-020, H-023 |
| S-390 | Web Authentication request lifecycle / AbortSignal | 仮配置・技術スパイク待ち | B01no-match拒否、B02pending conditional requestのplayer起因abort。問題採用は確定し、S-380へ統合するか別stageにするかだけPoC比較する | H-019, H-020, H-023 |
| S-400 | Date / High Resolution Time / Page Visibility | 技術スパイク待ち | monotonic基準の1時間遅れアナログ時計へwall clockを-60分±5分で合わせるB01、その後baseline±5分へ戻すB02。exact timestampは保存せず、page lifecycle切断時は試行終了 | H-004, H-019, H-022, H-023 |
| S-410 | Notification actions / Service Worker / IndexedDB | 技術スパイク待ち | pageを開かず左右2 actionの列をnotification差替えで反復するB01。誤入力は先頭reset、完了は専用inboxへcommitし通常訪問でconsume。S-090とtag分岐する | H-005, H-006, H-019, H-022, H-023, H-025 |
| S-420 | Notification actions / notification body click / IndexedDB | 技術スパイク待ち | 左右actionを固定長まで蓄積し、本文clickで提出snapshotをcommitして金庫pageへ復帰。一括照合animationの完全一致でB01、不一致は入力resetして再通知 | H-005, H-006, H-019, H-020, H-022, H-023, H-025 |
| S-430 | Media Session / generated audio | 技術スパイク待ち | controlsなしloop audioがplaying中、registered Media Session pause handlerが呼ばれて停止した場合にB01。page内pause、native video controls、通常pause eventは判定外 | H-003, H-004, H-019, H-020, H-022, H-023, H-025 |
| S-440 | File Handling / LaunchQueue | 技術スパイク待ち | downloaded `.busybox`をOSから開き、LaunchParams.filesの実handleを読み、armed roundと一致した場合にB01。通常file input / drag-and-dropは判定外 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-450 | Protocol Handlers / LaunchQueue | 技術スパイク待ち | custom `web+busybox:` schemeへ埋めたround nonceをinstalled PWAのhandler URL / LaunchQueueで受けてB01。handler用HTTPS URLへの直接遷移は判定外 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-460 | Window Controls Overlay | 技術スパイク待ち | overlay visibleかつgetTitlebarAreaRect内に配置したno-dragの箱を押してB01。standalone windowやCSSだけの模擬titlebarは判定外 | H-001, H-003, H-005, H-019, H-020, H-023, H-025 |
| S-480 | Preferred text scale / CSS Fonts | 技術スパイク待ち | scaleを小・標準・大・特大の4帯へ分類するB01〜B04。初期帯も開き、setting変更後の別帯を再評価。zoom / resize / page内sliderは判定外 | H-003, H-004, H-019, H-020, H-023, H-025 |
| S-490 | HTML input / InputEvent | 計画 | placeholderが`busybox`のtext inputで、composition終了後を含む現在値が小文字の`busybox`と完全一致した時にB01。typing / pasteは区別せず、値を保存しない | H-001, H-002, H-003, H-004, H-020, H-025 |
| S-500 | Clipboard Events / Selection | 計画 | Caesar暗号文全体のcopy override、同一round平文のtrusted paste、target DOM内の`busybox`完全選択という連続条件でB01。S-180 / S-490から分離 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-510 | HTML Drag and Drop / DataTransfer File | 技術スパイク待ち | installed PWA sourceから通常browser receiverへ、事前生成したround PNG Fileを実drag / dropし、bytes内payload一致でB01。textやuploadは判定外 | H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025 |
| S-520 | ProximitySensor | 技術スパイク待ち | 実far readingを受けた同じsensor instanceで`near === true`を観測してB01。camera / pointer代替なし | H-006, H-019, H-023, H-025, H-026 |
| S-530 | LinearAccelerationSensor | 技術スパイク待ち | X/Y/Z各軸のdominantな正負peakを短いwindow内で観測するB01〜B03。投げる、落とす、打ち付ける操作は要求しない | H-006, H-019, H-023, H-025, H-026 |
| S-540 | AmbientLightSensor | 技術スパイク待ち | 実illuminanceの暗所帯B01と非常に明るい帯B02。camera / CSS themeは判定外 | H-006, H-019, H-023, H-025, H-026 |
| S-550 | Accelerometer | 技術スパイク待ち | raw合成加速度が初期値2.0m/s²以下へ3 reading以上かつ80ms以上入るB01。実機PoCではnoise、sampling rate、誤検知と端末を損傷させない試験手順を確認する | H-006, H-019, H-023, H-025, H-026 |
| S-560 | Gyroscope | 技術スパイク待ち | dominantな角速度を積分し、X/Y/Z各軸で約2πへ到達するB01〜B03。回転方向は問わない | H-006, H-019, H-023, H-025, H-026 |
| S-570 | RelativeOrientationSensor | 技術スパイク待ち | 開始quaternionから3つの直交姿勢gateを通り、開始姿勢へ戻るB01。AbsoluteOrientationSensorは使わない | H-006, H-019, H-023, H-025, H-026 |
| S-580 | SpeechRecognition | 技術スパイク待ち | 明示buttonから1回認識し、final alternativesのいずれかが空白・句読点・大小文字の正規化後に`busybox`ならB01。入力代替なし | H-006, H-007, H-019, H-020, H-023, H-025, H-027 |
| S-590 | Geolocation / Page Visibility / sessionStorage | 技術スパイク待ち | `max(0, haversine - startAccuracy - currentAccuracy)`が5m、25m、100mへ達するB01〜B03。開始anchorだけを同一tab sessionへ最大24時間保存し、復帰時に再取得 | H-004, H-006, H-019, H-022, H-025, H-028 |
| S-600 | Geolocation altitude / altitudeAccuracy | 技術スパイク待ち | `altitude ± altitudeAccuracy`全体が100m未満、100〜500m、500m以上の帯へ入り、3 reading以上かつ5秒安定すると対応B01〜B03。値は保存しない | H-004, H-006, H-019, H-023, H-025, H-029 |

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
