# 権限・実機ステージ実装メモ

## 共通原則

権限プロンプトはページ表示時や一覧表示時には出さず、各ステージの説明可能なボタン操作からだけ開始する。拒否、機器なし、実行時失敗は箱の未解決として扱い、アプリ全体のエラーにしない。

ステージを戻る、別画面へ移る、再読込する場合は共通AbortSignalと各ステージのcleanupでイベント、タイマー、Animation Frame、MediaStreamTrack、AudioContextを破棄する。

## S-100 傾けて止める

- 観測: `deviceorientation` のbeta・gamma。
- 判定: beta 45°±12°、gamma 0°±12°を1秒維持。
- 権限: iOS系で `requestPermission` が存在するときだけ明示ボタン内で呼ぶ。
- 保存: `orientation:held` という判定事実だけ。
- 人手確認: H-008。回転ロック、縦横、イベント頻度差は自動テストで保証しない。

## S-110 光だけを見る

- 観測: 背面優先カメラ映像をDOM外videoへ流し、32×24 canvasで200msごとに平均輝度を算出。
- 判定: 暗さ（55未満）を観測した後、明るさ（165超）を観測。
- プライバシー: 映像を画面表示、保存、送信しない。進捗には `camera:dark-light` だけを保存。
- cleanup: interval停止、全MediaStreamTrack停止、`srcObject`解除。
- 人手確認: H-006, H-007, H-019。カメラ自動露出による閾値差を実機で確認する。

## S-120 音のかたち

- 観測: Web Audio Analyserの時間領域バッファからRMSだけを算出。
- 判定: 静か（0.05未満）→大きな音（0.2超）→静か（0.06未満）。
- プライバシー: 音声サンプルを録音、保存、送信しない。進捗には `audio:quiet-loud-quiet` だけを保存。
- cleanup: Animation Frame停止、source切断、全MediaStreamTrack停止、AudioContext終了。
- 人手確認: H-006, H-007, H-019。端末ゲイン、騒音、Bluetoothマイク差を確認する。

## S-130 箱の外の鍵

- 書き出し: 18byteの乱数を含む最大数百byteの `.busykey` JSONを生成。
- 保存: 乱数自体ではなくSHA-256だけを観測事実として保存し、第1箱を開く。
- 再投入: 4KB以下、formatが `busybox-key-v1`、保存済みハッシュと一致する場合だけ第2箱を開く。
- cleanup: Object URLをクリック後に破棄し、選択inputを空にする。
- 人手確認: H-014, H-020。キャンセル、別ファイル、巨大ファイル、再ダウンロードを確認する。

## S-190 画面の中の画面

- 観測: 明示ボタンから `getDisplayMedia()` を呼び、選択されたvideo trackの `displaySurface` とvideo frameの継続を読む。
- 判定: browser surfaceが12 frame以上再生された場合だけ開く。共有ダイアログを開いただけでは判定しない。
- プライバシー: capture frameを解析、保存、送信しない。プレビューは現在のステージ内だけに表示する。
- cleanup: interval停止、全MediaStreamTrack停止、videoの `srcObject` 解除。
- 人手確認: H-006, H-007, H-012, H-019。タブ共有、画面共有、取消、ブラウザ側の共有停止を確認する。

## S-230〜S-250 ブラウザ・OS境界

- S-230: canvasから生成した短命なMediaStreamをvideoへ渡し、実際の `enterpictureinpicture` eventで判定する。離脱時は描画timer、track、PiPを終了する。
- S-240: 毎回生成する印を `navigator.share()` へ渡し、promiseが正常完了した場合だけ判定する。取消は未クリアのままとする。
- S-250: origin内のexclusive Web Lockを保持する箱と、別タブで `ifAvailable` が取得不能になった事実を受け取る箱に分ける。BroadcastChannelは観測通知だけに使い、離脱時にlockを解放する。
- 人手確認: H-004, H-012, H-013, H-014, H-022, H-023。PiP終了、共有先なし、共有取消、holder tab終了、同時操作を確認する。

## S-310 / S-330 PWAライフサイクル

- S-310: manifestの `launch_handler.client_mode` を `navigate-existing` とし、`window.launchQueue` の実callbackに渡されたtarget URLだけを判定する。通常のリンククリックだけではクリアしない。
- S-330: 明示操作からScreen Wake Lockを取得し、visibilityでreleaseされた後、表示復帰時に同じ入場内で再取得できた場合に第2箱を開く。
- cleanup: WakeLockSentinelをreleaseし、visibility / release listenerを破棄する。LaunchQueueへは同一入場のconsumerだけを登録する。
- 人手確認: H-005, H-021, H-022, H-023。インストール起動、既存windowへの再起動、タブ非表示、OSの省電力制限を確認する。

## S-200 / S-210 外部表面

- S-200: `navigator.getGamepads()` をAnimation Frameごとに読み、2ボタン以上と絶対値0.65以上の軸入力が同じframeに存在するときだけ判定する。controller ID、mapping、timestampは保存しない。
- S-210: `setAppBadge(1)`、`setAppBadge(2)`、`setAppBadge(3)` の各promiseが完了した順序を観測し、第3段階で判定する。離脱時は `clearAppBadge()` を呼ぶ。
- 人手確認: H-005, H-009, H-019, H-023。未接続、複数gamepad、PWA未インストール、OS側badge非表示を確認する。

## S-260 / S-270 画面・GPU

- S-260: 明示操作から `EyeDropper.open()` を呼び、ブラウザが返した `sRGBHex` がステージ上の指定色と完全一致した場合だけ判定する。取消は未クリアとする。
- S-270: 4096個のu32候補をcompute shaderで64 workgroupへ分配し、GPU bufferからreadbackした正しいindexだけで判定する。CPUでの代替成功は用意しない。
- cleanup: GPU bufferはfinallyでdestroyし、GPU adapter情報や採取した画面内容は保存しない。
- 人手確認: H-006, H-019, H-023。色管理差、EyeDropper取消、adapterなし、device lost、GPU実行エラーを確認する。

## S-280〜S-300 外部機器

- S-280: `battery_service` を公開する機器だけをpickerへ出し、GATT接続後に `battery_level` characteristicを実際に読む。選択や接続だけでは判定せず、読取後と離脱時に切断する。
- S-290: WebHID pickerで選択したdeviceをopenし、byteを含む実 `inputreport` を待つ。product name、vendor/product ID、report本体は保存しない。
- S-300: WebUSB deviceをopenし、configurationとIN endpointを確認してinterfaceをclaimした後、実 `transferIn()` がbyteを返した場合だけ判定する。受信内容やdevice IDは保存しない。
- cleanup: HID / USB deviceは離脱時にcloseし、inputreport listenerを解除する。USB転送中の離脱はdevice closeで終了させる。
- 人手確認: H-006, H-010, H-011, H-019, H-023。picker取消、機器なし、切断、空report、IN endpointなし、再接続を確認する。

## S-320 折れ目をまたぐ

- 観測: `navigator.devicePosture.type` とhorizontal / vertical viewport segmentsのmedia query。
- 判定: postureが `folded`、またはviewport segmentが2面になった実状態だけを使う。通常viewportの開発用ボタンは用意しない。
- cleanup: postureとMediaQueryListのchange listenerをすべて解除する。
- 人手確認: H-023。対応する折りたたみ実機でcontinuous / folded、縦横、折れ目幅、再展開を確認する。

閾値やコピーは実機ゲートの結果で調整できるが、生入力を保存しない境界とユーザージェスチャー内の権限要求は変更しない。
