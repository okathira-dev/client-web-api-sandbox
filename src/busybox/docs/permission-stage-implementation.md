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

閾値やコピーは実機ゲートの結果で調整できるが、生入力を保存しない境界とユーザージェスチャー内の権限要求は変更しない。
