# ステージ実装状況

プレイヤー向けの解法と実装意図は、各 `src/busybox/stages/S-xxx.tsx` の日本語JSDocを正本とする。この表はID、API、状態、人手確認IDの索引であり、解法本文を複製しない。

## 状態の定義

| 状態 | 意味 |
| --- | --- |
| 実装済み | 観測・判定・演出・永続化・cleanupをコード化し、自動チェック済み |
| 人手確認待ち | 実装済みだが、指定した実ブラウザ・実機の証跡が未記録 |
| 設定待ち | 外部設定や公開環境がなければ最終確認できない |
| 計画 | 仕様候補のみで、ゲーム一覧では操作不可 |

「実装済み」は公開合格を意味しない。人手確認台帳の必須ケースが未実施なら、リリース判定では未検証として扱う。

## 現行スナップショット

2026-08-15現在、catalogue、runtime registry、地図、manifestに67stage・153箱が実装されている。S-030-B02を削除し、S-270とS-350のMedia Capabilities profile箱を不採用、S-230のPiP箱をS-350へ統合し、S-350へfullscreen箱を追加した。ステージ名・箱名は隣接locale bundleと`metadataLocale.ts`から解決する。全採用計画の旧件数は現行コードの判断に使わない。

過去の60stage・97箱、68stage・156箱、69stage・156箱、79stage・187箱、80stage・187箱は、実装前または中間時点のスナップショットである。現行の箱IDと解法は[現行ステージ解法仕様](./stage-walkthroughs.md)と実装を正とし、旧展開計画やPoCの番号から導かない。

| ID | コード | 状態 | 自動確認 | 残る人手確認 |
| --- | --- | --- | --- | --- |
| S-000 | click / activation | 実装済み・人手確認待ち | 初回・再入場の閉箱、累積1/1、再開封、進捗非重複 | H-001, H-002, H-003, H-020 |
| S-010 | Pointer Events | 実装済み・人手確認待ち | 3箱の同形性、マウス分離、再入場時の累積1/3 | H-004, H-020, H-024 |
| S-020 | viewport resize / HTMLMeterElement | B01実装済み・人手確認待ち、meter表示も実装済み | 実viewport resizeが成功条件。meterは現在幅と目標帯の表示だけで、scriptによるmeter値変更は判定外 | H-001, H-002, H-003, H-020 |
| S-030 | Selection | B01実装済み・人手確認待ち | 一つの文章から指定範囲をnative Selectionで選択する。CSS Custom Highlightによる旧B02は削除し、入力欄やscript製ハイライトでは開かない | H-001, H-002, H-003, H-004, H-020, H-025 |
| S-040 | Page Visibility / High Resolution Time | 実装済み・人手確認待ち | monotonicな2秒判定と、同一documentが25分以上連続hidden後に復帰するB02。reload / discardは試行終了 | H-013, H-022, H-025 |
| S-050 | Broadcast Channel | 実装済み・人手確認待ち | URL直接起動、cleanup境界 | H-013 |
| S-060 | IndexedDB再訪 / Beacon offline郵便 | B01/B02実装済み・人手確認待ち | B01の観測保存、移行、マージ。B02は実`sendBeacon()`、offline full-document navigation、Service Worker POST検証、IndexedDB receipt commitを使い、same-document遷移、通常fetch、直接writeでは開かない | H-001, H-018, H-021, H-048 |
| S-070 | Service Worker / offline | 実装済み・人手確認待ち | scope付きbuild、offlineイベント | H-005, H-021, H-022 |
| S-080 | PWA display-mode | 実装済み・人手確認待ち | capability失敗の隔離 | H-005, H-023 |
| S-090 | Notifications | 実装済み・人手確認待ち | 明示操作、復帰URL | H-005, H-006, H-023 |
| S-100 | Device Orientation | 実装済み・人手確認待ち | 明示権限、cleanup境界 | H-008 |
| S-110 | camera / luminance | 実装済み・人手確認待ち | 生映像非保存、track cleanup | H-006, H-007, H-019 |
| S-120 | microphone / RMS | 実装済み・人手確認待ち | 生音声非保存、AudioContext cleanup | H-006, H-007, H-019 |
| S-130 | File API / Web Crypto | 実装済み・人手確認待ち | 4KB上限、ハッシュ照合、2箱進捗 | H-014, H-020 |
| S-140 | Google Drive `appDataFolder` | 実装済み・設定/人手確認待ち | API通信モック、grow-onlyマージ、破損保護 | H-015〜H-018 |
| S-150 | DOM / UI Events / native select / details | B01〜B03実装済み・人手確認待ち | B01は`pointer-events:none`のbuttonへTabでfocus。B02はdecoyの中からnative selectのtypeaheadで`open busybox`を選択。B03は同じ`name`の`<details>`を複数開閉し、UAの排他状態を観測 | H-001, H-002, H-003, H-020 |
| S-160 | Canvas / Pointer Events | 実装済み・人手確認待ち | 距離・時間・速度差の判定、pointer cleanup | H-004, H-020, H-024 |
| S-170 | Web Animations | 実装済み・人手確認待ち | animation時刻判定、cancel cleanup | H-001, H-002, H-003, H-020 |
| S-180 | Clipboard API | 実装済み・人手確認待ち | copy操作で`xobysub`を書き、page外で`busybox`へ修正・再copyした後、箱click時の`clipboard.readText()`完全一致でB01 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-190 | Screen Capture / MediaRecorder / WebRTC / Canvas marker decode | B01〜B04実装済み・人手確認待ち、B05不採用 | B01 frame継続、B02 local recording、B03 observer relay、B04はround handshake済みmind map外縁markerを実frameからdecode。notification image marker B05は再現保証不能 | H-006, H-007, H-012, H-013, H-019, H-023 |
| S-200 | Gamepad | 実装済み・人手確認待ち | 2 button + axis同時判定、機器ID非保存 | H-009, H-019 |
| S-210 | Badging | 実装済み・人手確認待ち | 1→2→3成功、離脱時clear | H-005, H-023 |
| S-220 | History / Navigation Timing / Navigation API | B01〜B04実装済み・人手確認待ち | B01は同一ステージ3履歴とBack再入場、B02はfull-document back-forward復帰、B03はreload。B04はA→B→Cからbrowser BackでAへ戻ってDへ分岐し、旧B / C両entryの`dispose`と`canGoForward === false`を観測する | H-001, H-002, H-003, H-022 |
| S-240 | Web Share / Web Share Target | 実装済み・人手確認待ち | B01はOS共有完了、B02はinstalled Busyboxのmanifest share target受信 | H-004, H-005, H-014, H-023 |
| S-250 | BroadcastChannel / Page Lifecycle | 実装済み・人手確認待ち | RGBの3tab同時生存で白、`B → G → R`のpagehide列で2箱目 | H-013, H-022 |
| S-260 | EyeDropper | 実装済み・人手確認待ち | 実画面選択、指定sRGB色との一致 | H-006, H-023 |
| S-280 | Web Bluetooth | 実装済み・人手確認待ち | Battery Service実read、GATT切断 | H-006, H-010, H-019 |
| S-290 | WebHID | 実装済み・人手確認待ち | 選択後の実inputreport、device close | H-006, H-011, H-019 |
| S-300 | WebUSB | 実装済み・人手確認待ち | claim後の実IN transfer、device close | H-006, H-011, H-019 |
| S-310 | Launch Handler / manifest shortcuts / note taking | 実装済み・人手確認待ち | B01 stage-scoped URL、B02 icon shortcut、B03 `note_taking.new_note_url`をLaunchQueueまたは起動URLで受信 | H-005, H-021, H-023, H-025 |
| S-320 | Device Posture / Viewport Segments | 実装済み・人手確認待ち | folded changeまたは2 segment | H-023 |
| S-330 | Screen Wake Lock | 実装済み・人手確認待ち | 取得・visibility解放・再取得の2箱 | H-005, H-022, H-023 |
| S-340 | View Transition | 実装済み・人手確認待ち | 3回のtransition完了、非対応隔離 | H-001, H-002, H-003, H-020 |
| S-350 | HTMLMediaElement controls / playbackRate / media tracks / Picture-in-Picture / Fullscreen | B01〜B06・B08実装済み・人手確認待ち、将来B07の音声trackはAPI未対応で保留。監視枠POC-034を追加 | 一つのnative playerでB01 seek、B02 mute / volume 0、B03再生後の終了前pause、B04 native再生速度変更、B05 `Busybox`字幕、B06 native PiP入場、B08同じvideoのfullscreen入場を観測。終了後の先頭復帰と`ended`は除外 | H-001, H-002, H-003, H-012, H-019, H-020, H-023, H-025, H-030, H-052 |
| S-360 | WebRTC / Web Audio | 実装済み・人手確認待ち | 2タブ間の生成音声接続でB01、明示的data channel終了でB02。外部server、STUN / TURN、microphoneなし | H-013, H-019, H-020, H-023 |
| S-370 | Battery Status | 実装済み・人手確認待ち | B01/B02は実chargingchange、B03/B04は75%境界のbrowser報告値 | H-004, H-019, H-023 |
| S-380 | Web Authentication Conditional UI / Passkeys | 実装済み・人手確認待ち | B01作成＋credential ID保存、B02 Conditional利用成功、B03利用不成立。専用host名とpasskey残留警告が前提 | H-006, H-019, H-020, H-023 |
| S-390 | Web Authentication request lifecycle / AbortSignal | 実装済み・人手確認待ち | B01 no-match拒否、B02 pending conditional requestのplayer起因abort。S-380とは別stageに確定 | H-019, H-020, H-023 |
| S-400 | Date / High Resolution Time / Page Visibility | 実装済み・人手確認待ち | monotonic基準からwall clockを-60分±5分へ合わせるB01、その後baseline±5分へ戻すB02 | H-004, H-019, H-022, H-023 |
| S-410 | Notification actions / Service Worker | 実装済み・人手確認待ち | pageを開かず左右action列をnotification差替えで反復。誤入力reset、完了時だけ専用URLへ復帰 | H-005, H-006, H-019, H-022, H-023, H-025 |
| S-420 | Notification actions / notification body click | 実装済み・人手確認待ち | 左右actionを固定長まで通知dataへ蓄積し、本文clickで金庫pageへ提出。一括照合一致でB01 | H-005, H-006, H-019, H-020, H-022, H-023, H-025 |
| S-430 | Media Session / Audio Session / generated audio | B01実装済み・DR-065のB02承認済み。B02隔離入口POC-033を追加 | B01はexternal pause handlerをPOC-031で実入力確認する。play／seek／前後track actionは探索だけ行い、箱追加は未決定。B02はPOC-033でactive後に実`interrupted`を経てactiveとplayingへ復帰する列、B01との分離、type reset、cleanupを検証する | H-003, H-004, H-019, H-020, H-022, H-023, H-025, H-039, H-052 |
| S-440 | File Handling / LaunchQueue | 実装済み・人手確認待ち | downloaded `.busybox`をOSから開き、実handleのroundがarmed roundと一致した場合にB01 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-450 | Protocol Handlers / LaunchQueue | 実装済み・人手確認待ち | `web+busybox:`のround nonceをinstalled PWAのhandler URL / LaunchQueueで受けてB01 | H-005, H-006, H-019, H-021, H-023, H-025 |
| S-460 | Window Controls Overlay | 実装済み・人手確認待ち | overlay visibleかつgetTitlebarAreaRect内のno-drag箱を実clickしてB01 | H-001, H-003, H-005, H-019, H-020, H-023, H-025 |
| S-480 | Preferred text scale / CSS Fonts / User Preferences API | B01〜B04実装済み・人手確認待ち、DR-019のB05〜B09承認済み・未実装 | B01〜B04は1rem実測の4帯。B05〜B09は5種類の`PreferenceObject.requestOverride()`成功と対応`matchMedia()`実効値で独立解錠し、開箱後・reset・離脱時にclearする | H-003, H-004, H-019, H-020, H-023, H-025 |
| S-490 | HTML input / InputEvent | 実装済み・人手確認待ち | placeholderが`busybox`のinputで現在値が完全一致した時にB01。値は保存しない | H-001, H-002, H-003, H-004, H-020, H-025 |
| S-500 | Clipboard Events / Selection | 実装済み・人手確認待ち | Caesar暗号文のcopy override、trusted paste、target DOM内の`busybox`完全選択の連続条件でB01 | H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025 |
| S-510 | HTML Drag and Drop / DataTransfer File / `text/uri-list` | B01/B02実装済み・人手確認待ち | B01は専用source窓からround PNG Fileを実drag / drop。B02はsandbox iframeの透明PNG 3枚を親の現像台へ実dropし、current payloadとasset URLをSHA-256照合して合成 | H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025 |
| S-520 | ProximitySensor | 実装済み・人手確認待ち | 実far reading後、同じsensor instanceで`near === true`を観測してB01 | H-006, H-019, H-023, H-025, H-026 |
| S-530 | LinearAccelerationSensor | 実装済み・人手確認待ち | X/Y/Z各軸の正負peakを観測するB01〜B03。危険な操作を要求しない | H-006, H-019, H-023, H-025, H-026 |
| S-540 | AmbientLightSensor | 実装済み・人手確認待ち | 実illuminanceの暗所帯B01と非常に明るい帯B02 | H-006, H-019, H-023, H-025, H-026 |
| S-550 | Accelerometer | 実装済み・人手確認待ち | raw合成加速度が2.0m/s²以下へ3 reading以上かつ80ms以上入るB01。投げ上げを指示しない | H-006, H-019, H-023, H-025, H-026 |
| S-560 | Gyroscope | 実装済み・人手確認待ち | 角速度を積分し、X/Y/Z各軸で約2πへ到達するB01〜B03 | H-006, H-019, H-023, H-025, H-026 |
| S-570 | RelativeOrientationSensor | 実装済み・人手確認待ち | 開始quaternionから3つの姿勢gateを通り、開始姿勢へ戻るB01 | H-006, H-019, H-023, H-025, H-026 |
| S-580 | SpeechRecognition / SpeechSynthesis | B01/B02実装済み・人手確認待ち | B01は明示buttonから認識し、正規化後に`busybox`なら開く。B02は位置shift結果を表示せず発話し、`aspuwiq → busybox`のutteranceが正常終了した時に開く | H-006, H-007, H-019, H-020, H-023, H-025, H-027 |
| S-590 | Geolocation / Page Visibility / sessionStorage | 実装済み・人手確認待ち | 保守的距離が5m、25m、100mへ達するB01〜B03。開始anchorだけを同一tabへ最大24時間保存 | H-004, H-006, H-019, H-022, H-025, H-028 |
| S-600 | Geolocation altitude / altitudeAccuracy | 実装済み・人手確認待ち | 不確実性区間全体が3高度帯の一つへ入り、3 reading以上かつ5秒安定すると対応B01〜B03 | H-004, H-006, H-019, H-023, H-025, H-029 |
| S-610 | HTMLDialogElement / `closedby` | B01〜B03初版実装済み・人手確認待ち | ×button、外側native light dismiss、platform cancelを直前のtrusted操作、`cancel`、`close`から分離。外側clickのscript模倣clearなし | H-001, H-002, H-003, H-004, H-019, H-020, H-025 |
| S-620 | Unicode数字 / positional notation | B01〜B17初版実装済み・人手確認待ち | ASCII、Arabic-Indic、Eastern Arabic-Indic、漢数字、Osmanya、Adlam、N'Ko、Garay、Ol Chiki、Mro、Wancho、Nag Mundari、Ol Onal、Sora Sompeng、算木、Kaktovik、Mayanの全回答を別値にし、共通入力のASCII十進完全一致で対応箱だけを開く | H-001, H-002, H-003, H-004, H-014, H-020, H-025 |
| S-630 | Network Information `type` | DR-101でB01〜B04承認済み・未実装 | 明示観測時のWi-Fi、cellular、ethernet、Bluetoothを別箱へ累積。速度、RTT、Save Data、offline、unknown系、UA sniff、通信試験を判定に使わない | H-004, H-019, H-023, H-025, H-032 |
| S-640 | Encoding API / legacy encodings | B01〜B08初版実装済み・人手確認待ち | 8つの文字化けcardを表示し、一つの共通入力欄へ元の符号化で復号した文字列を入れる。誤表示用と元データ用の2つのencodingをfixtureで検証し、全回答非重複とexact code point一致を固定する | H-001, H-002, H-003, H-004, H-014, H-020, H-025, H-033 |
| S-650 | Permissions API / PermissionStatus | B01〜B04初版実装済み・人手確認待ち | 位置情報、通知、カメラ、マイクの初期granted、change、focus再照会、明示request、denied / prompt、descriptor非対応、media cleanupを検証する | H-004, H-006, H-007, H-019, H-023, H-025, H-034 |
| S-660 | Compute Pressure API / PressureObserver | B01〜B03初版実装済み・人手確認待ち | 入場時にCPUを自動観測し、nominal、中間（fair / serious）、criticalを箱へ累積。ゲーム負荷なし。hidden時disconnect、再表示時の再購読、非対応、Permissions Policy、非保存を検証する | H-004, H-019, H-023, H-025, H-035 |
| S-670 | Console API / ASCII TUI | B01初版実装済み・人手確認待ち | Consoleへread-only迷路を出し、page方向buttonで移動。plain text、再表示、Console入力なし、page編集なし、resetを検証する | H-001, H-002, H-003, H-004, H-020, H-025, H-036 |
| S-680 | Console API / diagnostic table | D-135で不採用・stage予約解除 | S-670 Console迷路と、Consoleをread-only表示面、pageを入力面として往復する中心体験が重複するため実装しない | — |
| S-690 | URL Fragment Text Directives | DR-049でB01の枠組み承認済み・詳細保留 | 同一pageの実Text Fragment link、対象text一意性、巡回graph、最終回答、Back、非対応、固定history上限を検証する。謎fixtureのレビュー後に仕様確定する | H-001, H-002, H-003, H-004, H-019, H-020, H-025, H-038 |
| S-700 | Remote Playback / Barcode Detection / camera / Presentation | DR-075でB01 / B02、DR-076でB03承認済み・未実装。B02はDR-016の実装先 | B01 / B02はRemote Playback接続と文字鍵 / QRを従来どおり検証する。B03は明示`start()`、実`connected`、receiver初期描画後のround付きready、取消、切断、terminate、非保存を検証する | H-003, H-004, H-006, H-019, H-020, H-023, H-025, H-040, H-041 |
| S-710 | MediaBunny / MediaRecorder / WebM metadata / jsQR / iframe | B01〜B04初版実装済み・人手確認待ち | 独立したClipPress風HTMLをsame-origin iframeへ埋め込み、10秒・640×360・15fps・160kbps変換、暗黒frame白文字化、入力decode失敗時の固定error動画、downscaleしたframeのjsQR検出と検出四辺形へのQR射影置換、SimpleTag再入力overlay、downloadとsize比を実装。iframeは条件成立だけをsession付き`postMessage`で親へ渡し、共通合言葉欄は小文字へ正規化して照合する | H-003, H-004, H-006, H-007, H-014, H-019, H-020, H-023, H-025, H-042 |
| S-720 | HTMLMediaElement / SVG patch cable / MediaBunny / Canvas | B01〜B04初版実装済み・人手確認待ち | 左の動画3node、中央にT1〜T3を二列、右の出力nodeをBezier cableで配線する。source→output直結または変換の連結を実行し、4つの正規routeだけでQR flagを共通欄へ入れると対応箱が開く。分岐とcycleは拒否する | H-001, H-002, H-003, H-004, H-014, H-019, H-020, H-023, H-025, H-043 |
| S-730 | WebXR Device API / XRSession / XRFrame / XRInputSource | DR-084でB01 / B02承認済み・未実装 | B01はAR / VRの実immersive sessionと最初の非null viewer pose、B02は実input sourceのselect rayと固定XR箱の交差を検証する。inline、page click、DOM overlay、模擬pose、歩行、room scanは成功経路にしない | H-001, H-002, H-003, H-004, H-014, H-019, H-023, H-044 |
| S-740 | Periodic Background Sync / Service Worker / IndexedDB / Cache Storage | DR-097でB01承認済み・未実装 | installed PWAで水と光を別訪問に預け、window client 0件の異なる二回の実`periodicsync`が発芽・開花assetを取得してphaseを進める。日次保証、通知、timer、foreground / synthetic event、debug発火は成功経路にしない | H-005, H-014, H-018, H-019, H-021, H-023, H-025, H-045 |
| S-750 | WebOTP API / Security Code AutoFill / origin-bound SMS | DR-126でB01承認済み・未実装 | 一箱を実`OTPCredential`一致、または空のOTP専用欄へのtrustedな一括入力、current code一致、実`:autofill`状態の組合せで開く。手入力、paste、drop、composition、event列だけの推定は成功経路にしない | H-003, H-004, H-019, H-020, H-023, H-025, H-046 |
| S-760 | Contact Picker API / ContactsManager / ContactInfo | DR-017でB01 / B02承認済み・未実装 | B01はOSへ追加した架空contact 1件のname / email / tel / address / icon一致、B02はB01後に1件を選択しながら5propertyが全空または欠損であることを検証する。contact identity、共有拒否理由、game製UIは成功条件にしない | H-003, H-004, H-019, H-023, H-025, H-047 |
| S-770 | FedCM / provider公式SDK / managed IdP | DR-127でGoogle下限B01承認済み・未実装 | provider別の明示開始、browser所有chooser、manual FedCM結果、token非保存を検証する。追加providerは公式提供、public client登録、独自backend不要、実account PoC後に加算する | H-003, H-004, H-019, H-023, H-025, H-049 |
| S-780 | Payment Handler / Payment Request / Service Worker | DR-129でB01〜B03承認済み・PoC試作済み、製品stage未実装 | trusted eventは証跡として扱い、承認success、意図的拒否fail、同一handler retry後successを3箱へ累積する。handler windowの選択を経路に固定せず、local Vite middlewareでmethod URLの`Link` headerを検証する。実provider、cancel / error、game製UI、結果label、固定flagを使わない | H-003, H-004, H-019, H-023, H-025, H-050 |
| S-790 | Local Font Access / FontData / FontFace / Web Crypto | DR-137でB01承認済み・未実装 | Git管理する専用fontをOSへinstallし、対象PostScript名だけの実照会、raw font data検証、専用glyph表示で直接開く。全font列挙、既存font、upload、`local()`だけ、固定flagを使わない | H-003, H-004, H-006, H-014, H-019, H-023, H-025, H-051 |
| S-800 | URL Fragment Text Directives / `hidden=until-found` / `beforematch` | D-136でB01 / B02承認済み・問題詳細保留 | 英文上の対象語を、B01ではpercent-encoded `textStart`とpunctuation contextから、B02では表示された単語からplayer自身がfragment URLへ組み立てる。入力欄なし。`beforematch`で対象語を出現させ対応箱を開く。英文、対象語、fragment文字列は実装前に吟味する | H-001, H-002, H-003, H-004, H-019, H-020, H-025, H-038 |
| S-810 | MediaSource / SourceBuffer / `videoWidth` / `videoHeight` / `resize` / `seeked` / `requestVideoFrameCallback` | B01〜B04初版実装済み・人手確認待ち | Git管理した120個のVP8 WebM segmentをpackとmanifestからMSEへtimestamp offset付きで連結し、native controlsでシークを止めた提示frameの比率が1:1、4:3、16:9、9:20（各相対5%以内）なら対応箱を開く。実行時エンコード、CSS寸法、固定画像、通常再生・pauseだけは成功条件に使わない | H-001, H-002, H-003, H-019, H-020, H-023, H-025, H-053 |

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
