# ギミック実装カバレッジ計画

> JSDocとstage-localizationへ移行する前の対応履歴。現行の解法・箱番号・実装状態はこの表から導かない。JSDoc移行完了後に削除または履歴ディレクトリへの移動を再判定する。

> 本文には実装前の状態語も履歴として残る。2026-08-20に81stage・181箱へ更新し、G-068、G-079、G-081〜G-090を製品stageとして実装した。G-024 / S-270とMedia Capabilities profile箱をD-141で不採用、G-080 / S-810をnative seek後のアスペクト比判定へ更新、D-143でG-020のPiP箱をS-350へ統合し、D-144でfullscreen箱とmedia stage製品UXを確定した。G-076 / S-700-B03 PresentationとG-077 / S-780 Payment Handlerも製品stageへ実装し、S-780はD-147でbrowser所有chooserの指定wallet箱を加えた。G-049 / S-510はページ内画像、OS File、iframe拒否から別windowへ進む3箱へ更新した。過去のframe cadence案は履歴であり、現行状態は[ステージ実装状況](./stage-implementation-status.md)、解法は各stage JSDocを正とする。

## 完了条件

ギミックメモ台帳のG-001〜G-080を、実装済みステージ、合意済み計画、既存ステージへの統合、または理由付き取りやめのいずれかへ対応付ける。API名だけが異なる重複ステージは作らず、同じ発見を構成する場合は1ステージへ統合する。対応端末がない採用機能も、次を満たすコードまでは実装し、人手ゲートを残す。

- 実APIを呼び、ユーザー操作または実イベントの結果だけをクリア条件にする
- 非対応、拒否、取消、切断を全体エラーにしない
- 生の画面、音声、映像、機器ID、転送データを進捗やDriveへ保存しない
- 離脱時にstream、track、lock、device、animation、badgeを解放する
- 全問題を共通 `ProblemGiftBox` で表示し、再入場時は閉箱から再挑戦する

## G-001〜G-030の対応

| ギミック | 実装ステージ | 扱い |
| --- | --- | --- |
| G-001 DOM / UI Events / details | S-150 文書の順番 | B01〜B03初版実装済み・人手確認待ち。B02は不可視focus、B03は同じ`name`の`<details>`排他的開閉列 |
| G-002 Resize Observer / meter | S-020 枠に合わせる | B01実装済み・人手確認待ち。viewport幅と目標帯の表示は`<meter>`へ反映し、成功条件は既存の実`resize`観測のまま |
| G-003 Selection / Custom Highlight | S-030 選ばれた範囲 | B01と、DR-029の同一Highlightへ非連続Rangeを3個蓄積するB02を初版実装。`highlightsFromPoint()`で重なりを含む名前付きHighlight集合を順に触るB03はAPI未対応で保留 |
| G-004 Canvas / Pointer | S-010 三つの手、S-160 速さの軌跡 | 実装済み。pointer種別と入力履歴を分担 |
| G-005 Web Animations | S-170 止まった時間 | 実装済み。Animationの時刻で判定する |
| G-006 Clipboard API | S-180 見えない受け渡し | 再設計承認済み。copy操作で`xobysub`を書き、playerがpage外で`busybox`へ直して再copyし、箱click時の`clipboard.readText()`が完全一致すると開く1箱。現行の単純write / paste 2箱はこの往復条件へ統合する |
| G-007 File API | S-130 箱の外の鍵 | 既存 |
| G-008 Web Crypto | S-130 箱の外の鍵 | 既存 |
| G-009 Device Orientation | S-100 傾けて止める | 既存 |
| G-010 Camera | S-110 光だけを見る | 既存 |
| G-011 Web Audio | S-120 音のかたち | 既存 |
| G-012 Screen Capture / MediaRecorder / Canvas marker decode | S-190 画面の中の画面 | 現行B01は実装済み。B02 local recording、B03 WebRTC relay、mind map型stage一覧の外縁markerを探索して実capture frameから読むB04は採用済み・未実装。BB-060はB04へ統合。notification image marker B05はOSが共有映像へ通知を含めるか実機PoC後に採否決定。Blobとframeは保存しない |
| G-013 Gamepad | S-200 同時に押す | 実装済み。軸と複数buttonの同時状態を読む |
| G-014 IndexedDB / Beacon / Service Worker | S-060 帰ってくる箱 | B01 / B02初版実装済み・人手確認待ち。B02はoffline中の明示Beacon投函、full-document navigation、Service Worker receiptを使う |
| G-015 Service Worker / Cache | S-070 通信のない返事 | 既存 |
| G-016 Badging | S-210 外側の数字 | 実装済み。app badgeを段階更新し離脱時に消す |
| G-017 Broadcast Channel | S-050 二つの窓 | 既存 |
| G-018 Page Visibility | S-040 見ない時間 | B01の2秒条件をmonotonic化し、25分以上連続hiddenのB02を追加することを承認済み・未実装。background timerやpersistent開始時刻は使わない |
| G-019 History / Navigation Timing / Navigation API | S-220 戻る道 | B01〜B04初版実装済み・人手確認待ち。B04はA→B→CからBackでAへ戻り、別のDへ進むことでB / C entryの`dispose`と`canGoForward === false`を観測する |
| G-020 Picture-in-Picture | S-350-B06 小窓 | 実装済み。同じnative videoのPiP入場イベントを読む |
| G-021 Web Share / Web Share Target | S-240 渡した印 | 現行B01は実装済み。targetまたはOSへのpayload引き渡しを送出箱とし、installed Busyboxが同じround URLを受信するB02を追加する。PWAインストール導線を含め承認済み・未実装 |
| G-022 Web Locks | S-250 一つだけの鍵 | 現行はholder / blockedの2箱を実装済み。RGB三色同時点灯と白い監視タブでの `B → G → R` 解放順へ再設計することを承認済み・未実装 |
| G-023 EyeDropper | S-260 画面の一滴 | 実装済み。画面上から指定色を採る |
| G-024 WebGPU | 不採用 | playerからWebGPU固有処理と任意の描画演出を区別できる核を成立させられないため、D-141でS-270ごと削除 |
| G-025 Web Bluetooth | S-280 近くの電池 | 実装済み。標準Battery Serviceの値を実際に読む |
| G-026 WebHID / WebUSB | S-290 生の入力、S-300 線の向こう | 実装済み。input reportとIN transferを別ステージにする |
| G-027 Launch Handler / manifest shortcuts / note taking | S-080 別の入口、S-310 もう一度の起動 | S-080のstandalone、S-310-B01のstage URL LaunchQueueは実装済み。icon shortcut専用URLのB02と`note_taking.new_note_url`のB03は承認済み・未実装 |
| G-028 Device Posture / Viewport Segments | S-320 折れ目をまたぐ | 実装済み。posture changeまたは2 segmentを読む |
| G-029 Notifications | S-090 外からの呼び声 | 既存 |
| G-030 Drive backup | S-140 もう一つの端末 | 既存 |

## 追加採用

既存の中心動詞と重複せず、現在のWebで説明可能な案を追加する。

| ID | ステージ | API | 一意性 |
| --- | --- | --- | --- |
| G-031 | S-330 消えない灯り | Screen Wake Lock | 実装済み。画面を見せ続ける権利がvisibilityで失われ、再取得される |
| G-032 | S-340 形をつなぐ | View Transition | 実装済み。DOM更新の前後をブラウザが1つの視覚遷移として結ぶ |
| G-033 | S-350 映像の手触り | HTMLMediaElement controls / playbackRate / media tracks / Picture-in-Picture | B01〜B06を実装。native seek、mute / volume 0、再生後の終了前pause、1倍速以外への`ratechange`、native字幕label `Busybox`、PiP入場を独立観測する。Media Capabilities profile箱はD-141、実寸reelはD-142で不採用。frame cadenceはG-080 / S-810へ分離。音声trackは対応環境でのみ将来B07 |
| G-034 | S-360 ラベル未定 | WebRTC / Web Audio / BroadcastChannel | 計画。生成音声を2タブ間で接続し、実peer接続とdata channelの明示終了を2箱で観測する。実装前PoC必須 |
| G-035 | S-370 ラベル未定 | Battery Status | 計画。実chargingchangeによるcharger接続・取り外しと、browser報告levelの75%以上・75%未満を4箱で独立観測する |
| G-036 | S-380 ラベル未定 | Web Authentication Conditional UI / Passkeys / Web Crypto / IndexedDB | 採用。B01 passkey作成＋local record保存、B02 Conditional assertion完全検証、B03保存済みpasskey利用の`NotAllowedError`を同一pageで観測 |
| G-037 | 仮S-390 ラベル未定 | Web Authentication / AbortSignal | 採用。B01 no-match requestの`NotAllowedError`、B02pending conditional requestのplayer起因`AbortError`。S-380へ統合するvariantとPoC比較後にstage ID確定 |
| G-038 | S-400 ラベル未定 | Date / High Resolution Time / Page Visibility | 採用。monotonic基準で現在より1時間遅れて進むアナログ時計へOS wall clockを±5分で合わせるB01と、baseline±5分へ復元するB02。実機PoC必須 |
| G-039 | S-410 ラベル未定 | Notification actions / Service Worker / IndexedDB | 採用。page非遷移の2 action入力をnotification差替えで反復し、完了inboxを後の通常訪問でconsumeする1箱。`Notification.maxActions >= 2`の実表示とworker lifecycleをPoCする |
| G-040 | S-420 金庫（仮） | Notification actions / notification body click / IndexedDB | 採用。左右action列をService Workerで蓄積し、本文click時の提出snapshotをpageで正解列と一括照合する1箱。金庫animationで成功・失敗を示し、失敗後は同じroundを再挑戦できる |
| G-041 | S-430 外側の停止と復帰（仮） | Media Session / Audio Session / HTMLAudioElement | B01は生成loop音声へ届くMedia Sessionのexternal pause actionで停止する。B02はAudio Sessionの実`active → interrupted → active`と再生復帰を観測する。 |
| G-042 | S-440 ファイルの鍵（仮） | File Handling / LaunchQueue / FileSystemFileHandle | 採用。round情報を含む`.busybox`をdownloadし、OSの「開く」からinstalled PWAへ渡された実file handleの内容が一致した場合に開く1箱。通常dropは判定外 |
| G-043 | S-450 別の名前で呼ぶ（仮） | Protocol Handlers / LaunchQueue | 採用。stageで発行したround nonce入り`web+busybox:` URLをuser activationで開き、registered PWAがhandler targetを受けた場合に開く1箱 |
| G-044 | S-460 窓の上辺（仮） | Window Controls Overlay / display_override | 採用。overlayがvisibleなdesktop PWAで、実titlebar geometry内に配置した箱を押した場合に開く1箱 |
| G-045 | stageなし | Tabbed Application Mode / tab_strip / display-mode | 取りやめ。ChromeOS限定のためS-470は予約しない |
| G-046 | S-480 文字と好みの目盛り（仮） | text-scale meta / preferred-text-scale / CSS Fonts / User Preferences API / preference media queries | B01〜B04は実装済み。current preferred text scaleを小・標準・大・特大の4帯へ分類する。DR-019として、`prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion`、`prefers-reduced-transparency`、`prefers-reduced-data`を`requestOverride()`して実効media queryを変える独立B05〜B09を追加承認済み・未実装。開箱後と離脱時にoverrideをclearする |
| G-047 | S-490 名前の鍵（仮） | HTML input / InputEvent | 採用。placeholderだけで`busybox`を示し、text inputの現在値が小文字で完全一致すると開く1箱。入力方法は限定せず、値や入力履歴は保存しない |
| G-048 | S-500 暗号の紙片（仮） | Clipboard Events / Selection | 採用。Caesar暗号文全体のtrusted copyで平文をclipboardへ入れ、trusted pasteで紙面へ戻し、そのDOM内の`busybox`だけを選ぶと開く1箱。S-180、S-490とは別stage |
| G-049 | S-510 境界を越える画像 | HTML Drag and Drop / DataTransfer / File / `text/uri-list` / `window.open` | 3箱を実装。B01はページ内PNGのURI、B02はdraggable=false画像を保存したOS File、B03はiframe画像を拒否し、別windowのPNG URIとround markerだけを受ける。各fixtureのSHA-256を照合し、許可／拒否cursorとdragover状態を表示する。合成イベント、file input、模擬payloadは判定外 |
| G-050 | S-520 近づく影（仮） | ProximitySensor | 採用。実far reading後の`near === true`で開くLabs 1箱。camera / pointer代替なし |
| G-051 | S-530 三軸の振り子（仮） | LinearAccelerationSensor | 採用。X/Y/Zそれぞれでdominantな正負加速度peakを短時間に観測して開く3箱 |
| G-052 | S-540 光の両端（仮） | AmbientLightSensor | 採用。量子化されたilluminanceの暗所帯と非常に明るい帯をそれぞれ開く2箱。cameraは使わない |
| G-053 | S-550 無重力の瞬間（仮） | Accelerometer | 採用。raw 3軸の合成加速度が遊びを持った0付近へ短時間入る1箱。GravitySensor固有問題は作らない |
| G-054 | S-560 三つの回転（仮） | Gyroscope | 採用。dominant axisの角速度を積分し、X/Y/Z各軸で約2π回転すると開く3箱 |
| G-055 | stageなし | Magnetometer / AbsoluteOrientationSensor | 取りやめ。既定有効engineがなく、金属・磁石操作の再現性と安全性が不足 |
| G-056 | S-570 姿勢の輪（仮） | RelativeOrientationSensor / quaternion | 採用。3つの姿勢gateを通過して開始quaternionへ戻る1箱。Gyroscopeとは姿勢pathで分担 |
| G-057 | S-580 声の鍵（仮） | Web Speech: SpeechRecognition / SpeechSynthesis | B01/B02を初版実装。B02は入力のi文字目を+i shiftし、変換結果を表示せず発話する。`aspuwiq → busybox`のutteranceがstart後、取消・errorなしでendした時に開く |
| G-058 | S-590 広がる円（仮） | Geolocation / sessionStorage | 採用。開始anchorからaccuracyを差し引いた確実な距離5m・25m・100mの3箱。sleep / discard復帰用にanchorだけを最大24時間session保存 |
| G-059 | S-600 三つの高度帯（仮） | Geolocation altitude / altitudeAccuracy | 採用。100m未満、100m以上500m未満、500m以上の3箱を別訪問で累積。高度reading自体は保存しない |
| G-060 | S-610 三つの閉じ方（仮） | HTMLDialogElement / `closedby` / cancel / close | 初版実装・人手確認待ち。modal dialogの×button、外側light dismiss、Escまたは端末dismissによるplatform cancelを別々に観測して開く3箱。外側clickはnative `closedby="any"`対応時だけ成立 |
| G-061 | S-620 十七の計算式（仮） | Unicode数字 / bidi / font / positional notation | 初版実装・人手確認待ち。17種類の数字体系で3桁＋3桁を表示し、各式のASCII十進回答を入力すると対応箱を開く。式は選択・コピー可能、全回答は別値 |
| G-062 | S-630 接続の道（仮） | Network Information `connection.type` | 採用・未実装。明示観測buttonでWi-Fi、cellular、ethernet、Bluetoothの4箱を累積する。初期表示やchangeだけでは開かず、速度、RTT、Save Data、UA sniff、network requestによる推定を使わない |
| G-063 | S-640 十二の文字コード（仮） | Encoding API / TextDecoder / legacy encoding indexes | 初版実装・人手確認待ち。2進4箱、16進4箱、文字化け4箱に16文字コードを各1回だけ割り当てる。固定fixture、表示差、12問全体の一意解を自動検証する |
| G-064 | S-650 四つの許可（仮） | Permissions API / PermissionStatus | 初版実装・人手確認待ち。位置情報、通知、カメラ、マイクのPermissionStatusが`granted`になると対応4箱を開く。初期照会、`change`、request、media cleanupを扱い、request成功だけではclearしない |
| G-065 | S-660 計算圧力（仮） | Compute Pressure API / PressureObserver | 初版実装・人手確認待ち。CPUの`nominal`、中間（`fair` / `serious`）、`critical`を3箱へ対応させ、実PressureRecordを訪問間で累積する。ゲーム自身はCPU負荷を生成しない |
| G-066 | S-670 端末迷路（仮） | Console API / ASCII TUI | 初版実装・人手確認待ち。Consoleへread-onlyの迷路盤面を出し、page上の方向buttonだけで移動して出口へ到達する1箱。Console入力やpage編集を要求しない |
| G-067 | S-680 端末診断卓（不採用） | Console API / `console.table()` | D-135でS-670 Console迷路との体験重複を理由に不採用。stage・箱を実装しない |
| G-068 | S-690 断片の道標 | URL Fragment Text Directives | 製品実装・人手確認待ち。4つの一意な英文targetを実linkで巡り、`text` / `fragments` / `leave` / `trails`を固定回答へ組み立てる1箱。各jumpの成否はscriptで判定しない |
| G-069 | S-700 遠くの映写箱（仮） | Remote Playback / Barcode Detection / camera / Presentation | B01 / B02は候補保留。B03のみS-700-B03としてPresentation receiver readyを製品実装済み。 |
| G-070 | S-710 合言葉変換所（仮） | MediaBunny / MediaRecorder / WebM metadata / jsQR / iframe | 初版実装・人手確認待ち。別サイト風ClipPress iframe内で、B01は全pixelが`#101010`以下の1 frameだけを`DARK FRAME`へ、B02はdecode失敗時の固定動画、B03はdownscale jsQR検出frameを固定flag QRへ、B04はS-710 SimpleTag付き動画の全frameを`SECOND PASS` overlayへ変換する。低bitrate、10秒上限、download、size比を含む |
| G-071 | S-720 映像復元機（仮） | HTMLMediaElement / SVG patch cable / fixed media fixtures | 初版実装・人手確認待ち。3動画source、T1〜T3、1 outputをBezier cableで接続し、4正規routeだけでGit管理済み復元動画をoutputへ流す。QR flagは4問共通欄へ入力する |
| G-072 | S-730 XRの箱（仮） | WebXR Device API / XRSession / XRFrame / XRInputSource | 採用・未実装。B01は実immersive sessionと最初の非null viewer pose、B02は実XRInputSourceのselect rayとXR空間上の箱との交差で開く。AR / VRのどちらでもよく、inline session、page click、DOM overlay、模擬poseは代替clearにしない |
| G-073 | S-740 留守番温室（仮） | Web Periodic Background Synchronization / Service Worker / IndexedDB / Cache Storage | 採用・未実装。水と光のcare recordを別訪問で一回ずつ預け、window client 0件の異なる実`periodicsync`が発芽・開花assetを取得した時だけ一箱を開く。日次、countdown、通知、timer、page load、debug模擬eventは代替clearにしない |
| G-074 | S-750 届いた封書（仮） | WebOTP API / Security Code AutoFill / origin-bound SMS | 採用・未実装。一箱を実`OTPCredential`一致、または空の`autocomplete="one-time-code"`欄への強く検証した`:autofill`によるcurrent code入力のどちらかで開く。手入力、paste、drop、compositionは代替clearにしない |
| G-075 | S-760 架空の名刺（仮） | Contact Picker API / ContactsManager / ContactInfo | 採用・未実装。B01はOSへ追加した架空contactのname / email / tel / address / icon一致、B02はB01後に1件を選択しつつ5propertyを一つもpageへ渡さないことで開く。game製pickerやmanual formは代替clearにしない |
| G-076 | S-770 身分証棚（仮） | FedCM / provider公式SDK / managed IdP | 採用・未実装。実装時点で公式FedCMと一般向けRP登録を提供するserviceを再調査し、providerごとの明示開始とbrowser所有account chooserの手動完了で独立箱を開く。Google 1箱を下限とし、OAuth redirect、broker越しの非FedCM login、game製account UIは代替clearにしない |
| G-077 | S-780 四つの財布 | Payment Handler / Payment Request / Service Worker | B01〜B04製品stage実装済み・公開origin確認待ち。B01は✓とsuccess完了、B02は×とfail完了、B03は↻後の同一handler成功、B04はbrowser所有chooserで◇walletを選び対象workerへtrusted eventが届くと開く。B01〜B03はwallet非依存。実provider、game製picker、cancel / errorの代替clear、結果label、固定flagを使わない |
| G-078 | S-790 活字の鍵（仮） | Local Font Access / FontData / FontFace / Web Crypto | 採用・未実装。Git管理する専用OTFをplayerがOSへinstallし、対象PostScript名へ絞った`queryLocalFonts()`と`FontData.blob()`の実data検証・glyph表示で1箱を直接開く。全font列挙、既存font集合、file upload、`local()`だけ、固定flagを代替clearにしない |
| G-079 | S-800 URLの蛍光ペン | URL Fragment Text Directives / `hidden=until-found` / `beforematch` | B01はpercent-encoded `cobalt` fragment、B02は検索対象外canvasの`ember`からaddress bar URLを作る。専用containerの実`beforematch`を開箱に使い、UA Rangeとfind-in-pageの区別不能はH-055へ分担する |
| G-080 | S-810 比率を止める | HTMLMediaElement / `videoWidth` / `videoHeight` / `seeked` / `requestVideoFrameCallback()` | 実装済み・人手確認待ち。playerがnative seekを止めた提示frameの比率が1:1、4:3、16:9、9:20の各相対5%以内ならB01〜B04が対応して開く。通常再生、pauseだけ、CSS寸法は解法にせず、ページにはscript自動seek経路を置かない |
| G-081 | S-820 遠い箱 | Pointer Lock / `movementX` / `movementY` | lock中の相対移動だけで2D平面を進み、3座標のboxを中央reticleからtrusted clickする3箱 |
| G-082 | S-830 留守番する箱 | Idle Detection | 実idle-unlockedと実screen lockedを別々に観測する2箱。timer / visibilityの代替なし |
| G-083 | S-840 ぴったり重ねる | IntersectionObserver | 二次元scroll root内でtargetの実intersection ratioを0.98以上にする1箱 |
| G-084 | S-850 浮かぶ箱 | Document Picture-in-Picture | Document PiPへportalした実boxだけをtrusted clickする1箱 |
| G-085 | S-860 校正刷り | EditContext | inputでない通常copyへEditContextをattachし、単語単位の誤字・脱字・余分語を直す3箱 |
| G-086 | S-870 外の書庫 | File System Access | 空の使い捨てfolderにseedしたfileをOS側で書換え・削除・新規作成する3箱 |
| G-087 | S-880 圧縮された荷物 | Compression Streams | 固定gzip / deflate / deflate-raw assetを実DecompressionStreamで展開する3箱 |
| G-088 | S-890 額縁の中だけ | Element Fullscreen | 指定HTML elementをfullscreenにして初めて内部boxを押せる1箱 |
| G-089 | S-900 映像の継ぎ目 | MediaSource / SourceBuffer | playerのA→B→C→D append orderで完成videoを最後までnative再生する1箱 |
| G-090 | S-910 その場でつくる字幕 | runtime WebVTT / TextTrack | 再生中に追加したVTTCueが対応した映像時刻へ重なる1箱 |

## 2026-07-17 現行API確認

- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API): secure context、read/writeのユーザー操作・権限差を前提とし、paste eventを主経路にする。
- [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API): `getDisplayMedia()` は明示操作から開始し、全trackを離脱時に停止する。
- [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API): 接続eventと `getGamepads()` pollingを併用し、機器名は保存しない。
- [Badging API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API): limited availabilityかつsecure context。`setAppBadge()` 成功後だけ判定し、cleanupで `clearAppBadge()` を呼ぶ。
- [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API): videoの `enterpictureinpicture` eventを判定に使う。
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API): transient activation内で呼び、取消は未クリアのままにする。
- [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API): origin単位のexclusive lockと `ifAvailable` を使い、待機を残さない。
- [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API): experimentalかつsecure context。明示操作と画面上の実選択を必須にする。
- [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API): adapter/device取得後にcompute passとreadbackを実行し、adapter情報を保存しない。
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API): limited availability。transient activationでBattery Service対応機器だけを選び、GATTを切断する。
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) / [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API): limited availability。選択だけをクリアにせず、実input report / transferを待つ。
- [Launch Handler API](https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API): experimental。manifestの `launch_handler` と `window.launchQueue` の実callbackを組み合わせる。
- [File Handling](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA): Chromium desktop限定。manifestの`file_handlers`と`LaunchParams.files`の両方を要求する。
- [Protocol Handlers](https://wicg.github.io/manifest-incubations/#protocol_handlers-member): installed PWAへcustom schemeを登録し、初回起動時のbrowser確認を含める。
- [Window Controls Overlay](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API): desktop installed PWA限定。`visible`と実titlebar geometryを判定する。
- [Preferred text scale](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/text-scale): `text-scale` metaとCSS Fontsのuser preference反映を使う。
- [Device Posture API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API) / [Viewport Segments API](https://developer.mozilla.org/en-US/docs/Web/API/Viewport_segments_API/Using): experimental。通常端末の偽クリアを作らない。
- [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API): secure contextとvisibilityによるreleaseを状態機械へ含める。

対応表は「全環境で公開合格」を意味しない。Limited / Experimental、PWA、実機、外部機器のステージは、人手確認台帳の該当環境で成功・取消・切断・cleanupを確認するまで公開ゲート待ちとする。
