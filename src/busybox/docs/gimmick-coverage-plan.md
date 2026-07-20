# ギミック実装カバレッジ計画

> 2026-07-20追記: 「承認済み・未実装」などの記述は実装前の対応表を保存したもの。現在は60stage・97箱を実装済みで、S-190-B05だけを不採用とした。現在状態は[ステージ実装状況](./stage-implementation-status.md)を正とする。

## 完了条件

ギミックメモ台帳のG-001〜G-059を、実装済みステージ、合意済み計画、既存ステージへの統合、または理由付き取りやめのいずれかへ対応付ける。API名だけが異なる重複ステージは作らず、同じ発見を構成する場合は1ステージへ統合する。対応端末がない採用機能も、次を満たすコードまでは実装し、人手ゲートを残す。

- 実APIを呼び、ユーザー操作または実イベントの結果だけをクリア条件にする
- 非対応、拒否、取消、切断を全体エラーにしない
- 生の画面、音声、映像、機器ID、転送データを進捗やDriveへ保存しない
- 離脱時にstream、track、lock、device、animation、badgeを解放する
- 全問題を共通 `ProblemGiftBox` で表示し、再入場時は閉箱から再挑戦する

## G-001〜G-030の対応

| ギミック | 実装ステージ | 扱い |
| --- | --- | --- |
| G-001 DOM | S-150 文書の順番 | 実装済み。見た目を固定したままDOM順だけを回転する |
| G-002 Resize Observer | S-020 枠に合わせる | 既存 |
| G-003 Selection | S-030 選ばれた範囲 | 既存 |
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
| G-014 IndexedDB | S-060 帰ってくる箱 | 既存 |
| G-015 Service Worker / Cache | S-070 通信のない返事 | 既存 |
| G-016 Badging | S-210 外側の数字 | 実装済み。app badgeを段階更新し離脱時に消す |
| G-017 Broadcast Channel | S-050 二つの窓 | 既存 |
| G-018 Page Visibility | S-040 見ない時間 | B01の2秒条件をmonotonic化し、25分以上連続hiddenのB02を追加することを承認済み・未実装。background timerやpersistent開始時刻は使わない |
| G-019 History / Navigation Timing | S-220 戻る道 | B01は実装済み。full-document navigation後のback-forward復帰を読むB02と、reloadを読むB03は承認済み・未実装。bfcache復元は同じ操作として`pageshow.persisted`を観測する |
| G-020 Picture-in-Picture | S-230 浮かぶ窓 | 実装済み。生成映像のPiP入場イベントを読む |
| G-021 Web Share / Web Share Target | S-240 渡した印 | 現行B01は実装済み。targetまたはOSへのpayload引き渡しを送出箱とし、installed Busyboxが同じround URLを受信するB02を追加する。PWAインストール導線を含め承認済み・未実装 |
| G-022 Web Locks | S-250 一つだけの鍵 | 現行はholder / blockedの2箱を実装済み。RGB三色同時点灯と白い監視タブでの `B → G → R` 解放順へ再設計することを承認済み・未実装 |
| G-023 EyeDropper | S-260 画面の一滴 | 実装済み。画面上から指定色を採る |
| G-024 WebGPU | S-270 並列の捜索 | 実装済み。compute shaderのreadback結果で判定する |
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
| G-033 | S-350 ラベル未定 | HTMLMediaElement controls / events | 計画。native playerのseek、mute、play後のpauseを3箱として独立観測する |
| G-034 | S-360 ラベル未定 | WebRTC / Web Audio / BroadcastChannel | 計画。生成音声を2タブ間で接続し、実peer接続とdata channelの明示終了を2箱で観測する。実装前PoC必須 |
| G-035 | S-370 ラベル未定 | Battery Status | 計画。実chargingchangeによるcharger接続・取り外しと、browser報告levelの75%以上・75%未満を4箱で独立観測する |
| G-036 | S-380 ラベル未定 | Web Authentication Conditional UI / Passkeys / Web Crypto / IndexedDB | 採用。B01 passkey作成＋local record保存、B02 Conditional assertion完全検証、B03保存済みpasskey利用の`NotAllowedError`を同一pageで観測 |
| G-037 | 仮S-390 ラベル未定 | Web Authentication / AbortSignal | 採用。B01 no-match requestの`NotAllowedError`、B02pending conditional requestのplayer起因`AbortError`。S-380へ統合するvariantとPoC比較後にstage ID確定 |
| G-038 | S-400 ラベル未定 | Date / High Resolution Time / Page Visibility | 採用。monotonic基準で現在より1時間遅れて進むアナログ時計へOS wall clockを±5分で合わせるB01と、baseline±5分へ復元するB02。実機PoC必須 |
| G-039 | S-410 ラベル未定 | Notification actions / Service Worker / IndexedDB | 採用。page非遷移の2 action入力をnotification差替えで反復し、完了inboxを後の通常訪問でconsumeする1箱。`Notification.maxActions >= 2`の実表示とworker lifecycleをPoCする |
| G-040 | S-420 金庫（仮） | Notification actions / notification body click / IndexedDB | 採用。左右action列をService Workerで蓄積し、本文click時の提出snapshotをpageで正解列と一括照合する1箱。金庫animationで成功・失敗を示し、失敗後は同じroundを再挑戦できる |
| G-041 | S-430 外側の停止（仮） | Media Session / HTMLAudioElement | 採用。controlsなしのclient生成loop audioがplaying中、Media Sessionのexternal pause action handlerで停止した場合だけ開く1箱。native playerや通常pause eventでは開かない |
| G-042 | S-440 ファイルの鍵（仮） | File Handling / LaunchQueue / FileSystemFileHandle | 採用。round情報を含む`.busybox`をdownloadし、OSの「開く」からinstalled PWAへ渡された実file handleの内容が一致した場合に開く1箱。通常dropは判定外 |
| G-043 | S-450 別の名前で呼ぶ（仮） | Protocol Handlers / LaunchQueue | 採用。stageで発行したround nonce入り`web+busybox:` URLをuser activationで開き、registered PWAがhandler targetを受けた場合に開く1箱 |
| G-044 | S-460 窓の上辺（仮） | Window Controls Overlay / display_override | 採用。overlayがvisibleなdesktop PWAで、実titlebar geometry内に配置した箱を押した場合に開く1箱 |
| G-045 | stageなし | Tabbed Application Mode / tab_strip / display-mode | 取りやめ。ChromeOS限定のためS-470は予約しない |
| G-046 | S-480 文字の目盛り（仮） | text-scale meta / preferred-text-scale / CSS Fonts | 採用。current preferred text scaleを小・標準・大・特大の4帯へ分類し、各帯に対応する4箱を開く。zoomやpage内文字sliderは判定外 |
| G-047 | S-490 名前の鍵（仮） | HTML input / InputEvent | 採用。placeholderだけで`busybox`を示し、text inputの現在値が小文字で完全一致すると開く1箱。入力方法は限定せず、値や入力履歴は保存しない |
| G-048 | S-500 暗号の紙片（仮） | Clipboard Events / Selection | 採用。Caesar暗号文全体のtrusted copyで平文をclipboardへ入れ、trusted pasteで紙面へ戻し、そのDOM内の`busybox`だけを選ぶと開く1箱。S-180、S-490とは別stage |
| G-049 | S-510 窓を渡るステッカー（仮） | HTML Drag and Drop / DataTransferItemList / File | 採用。installed PWA sourceで事前生成したround PNG Fileを、通常browser receiverの実dropで読み、payload一致時に開く1箱。同一page、text token、file input、download / uploadは判定外。window間File保持をPoCする |
| G-050 | S-520 近づく影（仮） | ProximitySensor | 採用。実far reading後の`near === true`で開くLabs 1箱。camera / pointer代替なし |
| G-051 | S-530 三軸の振り子（仮） | LinearAccelerationSensor | 採用。X/Y/Zそれぞれでdominantな正負加速度peakを短時間に観測して開く3箱 |
| G-052 | S-540 光の両端（仮） | AmbientLightSensor | 採用。量子化されたilluminanceの暗所帯と非常に明るい帯をそれぞれ開く2箱。cameraは使わない |
| G-053 | S-550 無重力の瞬間（仮） | Accelerometer | 採用。raw 3軸の合成加速度が遊びを持った0付近へ短時間入る1箱。GravitySensor固有問題は作らない |
| G-054 | S-560 三つの回転（仮） | Gyroscope | 採用。dominant axisの角速度を積分し、X/Y/Z各軸で約2π回転すると開く3箱 |
| G-055 | stageなし | Magnetometer / AbsoluteOrientationSensor | 取りやめ。既定有効engineがなく、金属・磁石操作の再現性と安全性が不足 |
| G-056 | S-570 姿勢の輪（仮） | RelativeOrientationSensor / quaternion | 採用。3つの姿勢gateを通過して開始quaternionへ戻る1箱。Gyroscopeとは姿勢pathで分担 |
| G-057 | S-580 声の鍵（仮） | SpeechRecognition | 採用。final resultを正規化して`busybox`と一致する1箱。S-490からclue edgeを引く |
| G-058 | S-590 広がる円（仮） | Geolocation / sessionStorage | 採用。開始anchorからaccuracyを差し引いた確実な距離5m・25m・100mの3箱。sleep / discard復帰用にanchorだけを最大24時間session保存 |
| G-059 | S-600 三つの高度帯（仮） | Geolocation altitude / altitudeAccuracy | 採用。100m未満、100m以上500m未満、500m以上の3箱を別訪問で累積。高度reading自体は保存しない |

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
