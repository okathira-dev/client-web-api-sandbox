# ギミック実装カバレッジ計画

## 完了条件

ギミックメモ台帳のG-001〜G-030を、少なくとも1つの実装済みステージへ対応付ける。API名だけが異なる重複ステージは作らず、同じ発見を構成する場合は1ステージへ統合する。対応端末がない機能も、次を満たすコードまでは実装し、人手ゲートを残す。

- 実APIを呼び、ユーザー操作または実イベントの結果だけをクリア条件にする
- 非対応、拒否、取消、切断を全体エラーにしない
- 生の画面、音声、映像、機器ID、転送データを進捗やDriveへ保存しない
- 離脱時にstream、track、lock、device、animation、badgeを解放する
- 全問題を共通 `ProblemGiftBox` で表示し、再入場時は閉箱から再挑戦する

## G-001〜G-030の対応

| ギミック | 実装ステージ | 扱い |
| --- | --- | --- |
| G-001 DOM | S-150 文書の順番 | 新規。見た目を固定したままDOM順だけを回転する |
| G-002 Resize Observer | S-020 枠に合わせる | 既存 |
| G-003 Selection | S-030 選ばれた範囲 | 既存 |
| G-004 Canvas / Pointer | S-010 三つの手、S-160 速さの軌跡 | pointer種別と入力履歴を分担 |
| G-005 Web Animations | S-170 止まった時間 | 新規。Animationの時刻で判定する |
| G-006 Clipboard | S-180 見えない受け渡し | 新規。書込み成功と実pasteを2箱にする |
| G-007 File API | S-130 箱の外の鍵 | 既存 |
| G-008 Web Crypto | S-130 箱の外の鍵 | 既存 |
| G-009 Device Orientation | S-100 傾けて止める | 既存 |
| G-010 Camera | S-110 光だけを見る | 既存 |
| G-011 Web Audio | S-120 音のかたち | 既存 |
| G-012 Screen Capture | S-190 画面の中の画面 | 新規。capture frameを保存せず再帰表示する |
| G-013 Gamepad | S-200 同時に押す | 新規。軸と複数buttonの同時状態を読む |
| G-014 IndexedDB | S-060 帰ってくる箱 | 既存 |
| G-015 Service Worker / Cache | S-070 通信のない返事 | 既存 |
| G-016 Badging | S-210 外側の数字 | 新規。app badgeを段階更新し離脱時に消す |
| G-017 Broadcast Channel | S-050 二つの窓 | 既存 |
| G-018 Page Visibility | S-040 見ない時間 | 既存 |
| G-019 History | S-220 戻る道 | 新規。積んだ同一ステージ履歴をブラウザBackで戻る |
| G-020 Picture-in-Picture | S-230 浮かぶ窓 | 新規。生成映像のPiP入場イベントを読む |
| G-021 Web Share | S-240 渡した印 | 新規。share promiseが完了した操作だけを採用する |
| G-022 Web Locks | S-250 一つだけの鍵 | 新規。holderと別タブのblocked状態を2箱にする |
| G-023 EyeDropper | S-260 画面の一滴 | 新規。画面上から指定色を採る |
| G-024 WebGPU | S-270 並列の捜索 | 新規。compute shaderのreadback結果で判定する |
| G-025 Web Bluetooth | S-280 近くの電池 | 新規。標準Battery Serviceの値を実際に読む |
| G-026 WebHID / WebUSB | S-290 生の入力、S-300 線の向こう | 新規。input reportとIN transferを別ステージにする |
| G-027 Launch Handler | S-080 別の入口、S-310 もう一度の起動 | display-modeとLaunchQueueを分担 |
| G-028 Device Posture / Viewport Segments | S-320 折れ目をまたぐ | 新規。posture changeまたは2 segmentを読む |
| G-029 Notifications | S-090 外からの呼び声 | 既存 |
| G-030 Drive backup | S-140 もう一つの端末 | 既存 |

## 追加採用

既存の中心動詞と重複せず、現在のWebで説明可能な2案を追加する。

| ID | ステージ | API | 一意性 |
| --- | --- | --- | --- |
| G-031 | S-330 消えない灯り | Screen Wake Lock | 画面を見せ続ける権利がvisibilityで失われ、再取得される |
| G-032 | S-340 形をつなぐ | View Transition | DOM更新の前後をブラウザが1つの視覚遷移として結ぶ |

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
- [Device Posture API](https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API) / [Viewport Segments API](https://developer.mozilla.org/en-US/docs/Web/API/Viewport_segments_API/Using): experimental。通常端末の偽クリアを作らない。
- [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API): secure contextとvisibilityによるreleaseを状態機械へ含める。

対応表は「全環境で公開合格」を意味しない。Limited / Experimental、PWA、実機、外部機器のステージは、人手確認台帳の該当環境で成功・取消・切断・cleanupを確認するまで公開ゲート待ちとする。
