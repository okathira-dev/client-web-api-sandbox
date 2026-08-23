# 現存全ステージ レビューチェックリスト

現行の89ステージ・204箱を、実際の画面を見ながら一件ずつ確認するための作業台帳。
解法仕様の正本は各 `src/busybox/stages/S-xxx.tsx` の日本語JSDocであり、この文書は確認結果を記録するための索引とする。

## チェックの意味

- `[x]`: このレビュー作業で確認済み。正式な公開ゲートの完了を意味しない。
- `[ ]`: 未確認、部分確認、または別環境での再確認が必要。
- ステージ別チェックについて `TODO: ここまで人手レビュー済み` までは人手レビューしたことを示す。
- 実機、権限、installed PWA、公開origin、外部機器が必要な項目は、対応環境がない場合に推測でチェックしない。
- 問題を見つけたら各ステージの「メモ」へ現象、再現手順、期待結果、環境を書く。

## 横断レビュー（全ステージ共通）

- [ ] 一覧、地図、直接URL、戻る／進む、再入場で、今回開いた箱と永続進捗が混ざらない。
- [ ] reset後に今回状態と永続進捗が仕様どおり戻り、遅れて届いたeventで再び開かない。
- [ ] 日本語／英語、keyboard、200% zoom、狭いviewport、音なしでも箱・操作箇所・状態が理解できる。
- [ ] unsupported、permission denied、cancel、timeout、network failureが他の箱の成功として扱われない。
- [ ] listener、timer、stream、track、worker、接続、object URLなどが離脱・再試行後に残らない。
- [ ] camera、microphone、位置、contact、credential、file内容などの生データを不要に表示・保存・同期・送信しない。
- [ ] 固定flag文字列を入力する問題は、正答flagをギミックの事前達成状態やsession内unlockで制限しない。
- [ ] Consoleに未処理errorがなく、想定外のwarningが増えない。

## ステージ別チェック

### S-000 — 最初の箱

中心API・操作: click / activation

- [x] B01 クリックする箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: 初回・再入場の閉箱、累積1/1、再開封、進捗非重複
- [x] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-020
- メモ:

### S-010 — 三つの手

中心API・操作: Pointer Events

- [x] B01 マウスの箱: 想定操作でこの箱だけが開く。
- [x] B02 タッチの箱: 想定操作でこの箱だけが開く。
- [x] B03 ペンの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 3箱の同形性、マウス分離、再入場時の累積1/3
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-020, H-024
- メモ:

### S-020 — 枠に合わせる

中心API・操作: viewport resize / HTMLMeterElement

- [x] B01 画面幅の箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: 実viewport resizeが成功条件。meterは現在幅と目標帯の表示だけで、scriptによるmeter値変更は判定外
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-020
- メモ: ゲージが2つあるのが謎。ゲージのmaxをブラウザ表示中のモニターサイズ、minを0pxとして、optimumを目標サイズ値にして、low, highは許容範囲に一致させて。アイコンはAspectRatioIconが良さそう。「864 → 878」というような数値表示はなくて良い。

TODO: ここまで人手レビュー済み

### S-030 — 選ばれた範囲

中心API・操作: Selection

- [ ] B01 選択範囲の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 一つの文章から指定範囲をnative Selectionで選択する。CSS Custom Highlightによる旧B02は削除し、入力欄やscript製ハイライトでは開かない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-020, H-025
- メモ:

### S-040 — 見ない時間

中心API・操作: Page Visibility / High Resolution Time

- [ ] B01 見ない時間の箱: 想定操作でこの箱だけが開く。
- [ ] B02 長い不在の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: monotonicな2秒判定と、同一documentが25分以上連続hidden後に復帰するB02。reload / discardは試行終了
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-013, H-022, H-025
- メモ:

### S-050 — 二つの窓

中心API・操作: Broadcast Channel

- [ ] B01 二つの窓の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: URL直接起動、cleanup境界
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-013
- メモ:

### S-060 — 帰ってくる箱

中心API・操作: IndexedDB再訪 / Beacon offline郵便

- [ ] B01 再訪の箱: 想定操作でこの箱だけが開く。
- [ ] B02 オフライン郵便の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01の観測保存、移行、マージ。B02は実`sendBeacon()`、offline full-document navigation、Service Worker POST検証、IndexedDB receipt commitを使い、same-document遷移、通常fetch、直接writeでは開かない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-018, H-021, H-048
- メモ:

### S-070 — 通信のない返事

中心API・操作: Service Worker / offline

- [ ] B01 オフラインの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: scope付きbuild、offlineイベント
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-021, H-022
- メモ:

### S-080 — 別の入口

中心API・操作: PWA display-mode

- [ ] B01 別の入口の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: capability失敗の隔離
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-023
- メモ:

### S-090 — 外からの呼び声

中心API・操作: Notifications

- [ ] B01 通知の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 明示操作、復帰URL
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-006, H-023
- メモ:

### S-100 — 傾けて止める

中心API・操作: Device Orientation

- [ ] B01 端末姿勢の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 明示権限、cleanup境界
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-008
- メモ:

### S-110 — 光だけを見る

中心API・操作: camera / luminance

- [ ] B01 光の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 生映像非保存、track cleanup
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-007, H-019
- メモ:

### S-120 — 音のかたち

中心API・操作: microphone / RMS

- [ ] B01 音の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 生音声非保存、AudioContext cleanup
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-007, H-019
- メモ:

### S-130 — 箱の外の鍵

中心API・操作: File API / Web Crypto

- [ ] B01 鍵を外へ出す箱: 想定操作でこの箱だけが開く。
- [ ] B02 鍵を戻す箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 4KB上限、ハッシュ照合、2箱進捗
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-014, H-020
- メモ:

### S-140 — もう一つの端末

中心API・操作: Google Drive `appDataFolder`

- [ ] B01 バックアップの箱: 想定操作でこの箱だけが開く。
- [ ] B02 別端末の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: installationごとのreplica統合、ETag再試行、破損／未来versionの復旧選択
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-015〜H-018
- メモ:

### S-150 — キーボードでたどる

中心API・操作: DOM / UI Events / native select / details

- [x] B01 フォーカスの箱: 想定操作でこの箱だけが開く。
- [ ] B02 検索選択の箱: 想定操作でこの箱だけが開く。
- [ ] B03 排他開示の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01は`pointer-events:none`のbuttonへTabでfocus。B02はdecoyの中からnative selectのtypeaheadで`open busybox`を選択。B03は同じ`name`の`<details>`を複数開閉し、UAの排他状態を観測
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-020
- メモ:

### S-160 — 速さの軌跡

中心API・操作: Canvas / Pointer Events

- [ ] B01 入力軌跡の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 距離・時間・速度差の判定、pointer cleanup
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-020, H-024
- メモ:

### S-170 — 止まった時間

中心API・操作: Web Animations

- [ ] B01 時間の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: animation時刻判定、cancel cleanup
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-020
- メモ:

### S-180 — 見えない受け渡し

中心API・操作: Clipboard API

- [ ] B01 コピーの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: copy操作で`xobysub`を書き、page外で`busybox`へ修正・再copyした後、箱click時の`clipboard.readText()`完全一致でB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025
- メモ:

### S-190 — 画面の中の画面

中心API・操作: Screen Capture / MediaRecorder / WebRTC / Canvas marker decode

- [ ] B01 再帰画面の箱: 想定操作でこの箱だけが開く。
- [ ] B02 録画の箱: 想定操作でこの箱だけが開く。
- [ ] B03 中継の箱: 想定操作でこの箱だけが開く。
- [ ] B04 外縁の印の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01 frame継続、B02 local recording、B03 observer relay、B04はround handshake済みmind map外縁markerを実frameからdecode。notification image marker B05は再現保証不能
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-007, H-012, H-013, H-019, H-023
- メモ:

### S-200 — 同時に押す

中心API・操作: Gamepad

- [ ] B01 同時入力の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 2 button + axis同時判定、機器ID非保存
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-009, H-019
- メモ:

### S-210 — 外側の数字

中心API・操作: Badging

- [ ] B01 外側の数字の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 1→2→3成功、離脱時clear
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-023
- メモ:

### S-220 — 戻る道

中心API・操作: History / Navigation Timing / Navigation API

- [ ] B01 履歴の箱: 想定操作でこの箱だけが開く。
- [ ] B02 戻る・進むの箱: 想定操作でこの箱だけが開く。
- [ ] B03 再読込の箱: 想定操作でこの箱だけが開く。
- [ ] B04 分岐破棄の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01は同一ステージ3履歴とBack再入場、B02はfull-document back-forward復帰、B03はreload。B04はA→B→Cからbrowser BackでAへ戻ってDへ分岐し、旧B / C両entryの`dispose`と`canGoForward === false`を観測する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-022
- メモ:

### S-240 — 渡した印

中心API・操作: Web Share / Web Share Target

- [ ] B01 共有の箱: 想定操作でこの箱だけが開く。
- [ ] B02 共有先の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はOS共有完了、B02はinstalled Busyboxのmanifest share target受信
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-005, H-014, H-023
- メモ:

### S-250 — 一つだけの鍵

中心API・操作: BroadcastChannel / Page Lifecycle

- [ ] B01 白になる箱: 想定操作でこの箱だけが開く。
- [ ] B02 閉じる順番の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: RGBの3tab同時生存で白、`B → G → R`のpagehide列で2箱目
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-013, H-022
- メモ:

### S-260 — 画面の一滴

中心API・操作: EyeDropper

- [ ] B01 色を採る箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 実画面選択、指定sRGB色との一致
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-023
- メモ:

### S-280 — 近くの電池

中心API・操作: Web Bluetooth

- [ ] B01 近くの電池の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: Battery Service実read、GATT切断
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-010, H-019
- メモ:

### S-290 — 生の入力

中心API・操作: WebHID

- [ ] B01 入力レポートの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 選択後の実inputreport、device close
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-011, H-019
- メモ:

### S-300 — 線の向こう

中心API・操作: WebUSB

- [ ] B01 USB転送の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: claim後の実IN transfer、device close
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-011, H-019
- メモ:

### S-310 — もう一度の起動

中心API・操作: Launch Handler / manifest shortcuts / note taking

- [ ] B01 再起動の箱: 想定操作でこの箱だけが開く。
- [ ] B02 ショートカットの箱: 想定操作でこの箱だけが開く。
- [ ] B03 新しいメモの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01 stage-scoped URL、B02 icon shortcut、B03 `note_taking.new_note_url`をLaunchQueueまたは起動URLで受信
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-021, H-023, H-025
- メモ:

### S-320 — 折れ目をまたぐ

中心API・操作: Device Posture / Viewport Segments

- [ ] B01 折れ目の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: folded changeまたは2 segment
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-023
- メモ:

### S-330 — 消えない灯り

中心API・操作: Screen Wake Lock

- [ ] B01 灯りを保つ箱: 想定操作でこの箱だけが開く。
- [ ] B02 灯りを戻す箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 取得・visibility解放・再取得の2箱
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-022, H-023
- メモ:

### S-340 — 形をつなぐ

中心API・操作: View Transition

- [ ] B01 画面遷移の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 3回のtransition完了、非対応隔離
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-020
- メモ:

### S-350 — 映像の手触り

中心API・操作: HTMLMediaElement controls / playbackRate / media tracks / Picture-in-Picture / Fullscreen

- [ ] B01 シークの箱: 想定操作でこの箱だけが開く。
- [ ] B02 ミュートの箱: 想定操作でこの箱だけが開く。
- [ ] B03 再生と停止の箱: 想定操作でこの箱だけが開く。
- [ ] B04 再生速度の箱: 想定操作でこの箱だけが開く。
- [ ] B05 字幕trackの箱: 想定操作でこの箱だけが開く。
- [ ] B06 小窓の箱: 想定操作でこの箱だけが開く。
- [ ] B08 全画面の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 一つのnative playerでB01 seek、B02 mute / volume 0、B03再生後の終了前pause、B04 native再生速度変更、B05 `Busybox`字幕、B06 native PiP入場、B08同じvideoのfullscreen入場を観測。終了後の先頭復帰と`ended`は除外
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-012, H-019, H-020, H-023, H-025, H-030, H-052
- メモ:

### S-360 — 窓を渡る音

中心API・操作: WebRTC / Web Audio

- [ ] B01 接続の箱: 想定操作でこの箱だけが開く。
- [ ] B02 切断の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 2タブ間の生成音声接続でB01、明示的data channel終了でB02。外部server、STUN / TURN、microphoneなし
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-013, H-019, H-020, H-023
- メモ:

### S-370 — 電気の境目

中心API・操作: Battery Status

- [ ] B01 接続の箱: 想定操作でこの箱だけが開く。
- [ ] B02 取り外しの箱: 想定操作でこの箱だけが開く。
- [ ] B03 75%以上の箱: 想定操作でこの箱だけが開く。
- [ ] B04 75%未満の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01/B02は実chargingchange、B03/B04は75%境界のbrowser報告値
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-019, H-023
- メモ:

### S-380 — 三つの資格情報

中心API・操作: Web Authentication Conditional UI / Passkeys

- [ ] B01 保存の箱: 想定操作でこの箱だけが開く。
- [ ] B02 利用成功の箱: 想定操作でこの箱だけが開く。
- [ ] B03 利用失敗の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01作成＋credential ID保存、B02 Conditional利用成功、B03利用不成立。専用host名とpasskey残留警告が前提
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-020, H-023
- メモ:

### S-390 — 待つ資格情報

中心API・操作: Web Authentication request lifecycle / AbortSignal

- [ ] B01 一致なしの箱: 想定操作でこの箱だけが開く。
- [ ] B02 中断の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01 no-match拒否、B02 pending conditional requestのplayer起因abort。S-380とは別stageに確定
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-019, H-020, H-023
- メモ:

### S-400 — 一時間ずれた時計

中心API・操作: Date / High Resolution Time / Page Visibility

- [ ] B01 巻き戻しの箱: 想定操作でこの箱だけが開く。
- [ ] B02 現在へ戻す箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: monotonic基準からwall clockを-60分±5分へ合わせるB01、その後baseline±5分へ戻すB02
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-019, H-022, H-023
- メモ:

### S-410 — 通知の迷路

中心API・操作: Notification actions / Service Worker

- [ ] B01 通知操作の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: pageを開かず左右action列をnotification差替えで反復。誤入力reset、完了時だけ専用URLへ復帰
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-006, H-019, H-022, H-023, H-025
- メモ:

### S-420 — 通知の金庫

中心API・操作: Notification actions / notification body click

- [ ] B01 金庫の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 左右actionを固定長まで通知dataへ蓄積し、本文clickで金庫pageへ提出。一括照合一致でB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-006, H-019, H-020, H-022, H-023, H-025
- メモ:

### S-430 — 外側から止める

中心API・操作: Media Session / Audio Session / generated audio

- [ ] B01 外部停止の箱: 想定操作でこの箱だけが開く。
- [ ] B02 音声復帰の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はexternal pause handler、B02は実Audio Sessionのactive → interrupted → activeとmedia再生復帰を観測する。通常pause、B01、inactiveはB02へ流用しない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-020, H-022, H-023, H-025, H-039, H-052
- メモ:

### S-440 — .busyboxの入口

中心API・操作: File Handling / LaunchQueue

- [ ] B01 ファイル起動の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: downloaded `.busybox`をOSから開き、実handleのroundがarmed roundと一致した場合にB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-006, H-019, H-021, H-023, H-025
- メモ:

### S-450 — 専用の合図

中心API・操作: Protocol Handlers / LaunchQueue

- [ ] B01 プロトコルの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: `web+busybox:`のround nonceをinstalled PWAのhandler URL / LaunchQueueで受けてB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-006, H-019, H-021, H-023, H-025
- メモ:

### S-460 — タイトルバーの内側

中心API・操作: Window Controls Overlay

- [ ] B01 オーバーレイの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: overlay visibleかつgetTitlebarAreaRect内のno-drag箱を実clickしてB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-003, H-005, H-019, H-020, H-023, H-025
- メモ:

### S-480 — 文字と好みの四季

中心API・操作: Preferred text scale / CSS Fonts / User Preferences API

- [ ] B01 小の箱: 想定操作でこの箱だけが開く。
- [ ] B02 標準の箱: 想定操作でこの箱だけが開く。
- [ ] B03 大の箱: 想定操作でこの箱だけが開く。
- [ ] B04 特大の箱: 想定操作でこの箱だけが開く。
- [ ] B05 暗色の箱: 想定操作でこの箱だけが開く。
- [ ] B06 強調の箱: 想定操作でこの箱だけが開く。
- [ ] B07 静止の箱: 想定操作でこの箱だけが開く。
- [ ] B08 不透明の箱: 想定操作でこの箱だけが開く。
- [ ] B09 節約の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01〜B04は1rem実測の4帯。B05〜B09は5種類の`PreferenceObject.requestOverride()`成功、報告値、対応`matchMedia()`実効値を同時に確認して独立解錠し、開箱後・reset・離脱時にclearする
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-020, H-023, H-025
- メモ:

### S-490 — 名前を置く

中心API・操作: HTML input / InputEvent

- [x] B01 busyboxの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: placeholderが`busybox`のinputで現在値が完全一致した時にB01。値は保存しない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-020, H-025
- メモ:

### S-500 — 暗号の受け渡し

中心API・操作: Clipboard Events / Selection

- [ ] B01 選び出す箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: Caesar暗号文のcopy override、trusted paste、target DOM内の`busybox`完全選択の連続条件でB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025
- メモ:

### S-510 — 窓を越えるドラッグ

中心API・操作: HTML Drag and Drop / DataTransfer File / `text/uri-list` / `window.open`

- [ ] B01 ページ内画像の箱: 想定操作でこの箱だけが開く。
- [ ] B02 OSファイルの箱: 想定操作でこの箱だけが開く。
- [ ] B03 別window画像の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はページ内PNGのURI、B02はdraggable=false画像を保存したOS File、B03はiframe画像を拒否し別windowのPNG URIだけを受ける。各fixtureのSHA-256とtrusted dropを照合し、欄の許可／拒否cursorとdragover状態を表示する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025
- メモ:

### S-520 — すぐそば

中心API・操作: ProximitySensor

- [ ] B01 近接の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 実far reading後、同じsensor instanceで`near === true`を観測してB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-530 — 三方向の加速

中心API・操作: LinearAccelerationSensor

- [ ] B01 X軸の箱: 想定操作でこの箱だけが開く。
- [ ] B02 Y軸の箱: 想定操作でこの箱だけが開く。
- [ ] B03 Z軸の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: X/Y/Z各軸の正負peakを観測するB01〜B03。危険な操作を要求しない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-540 — 光の両端

中心API・操作: AmbientLightSensor

- [ ] B01 暗闇の箱: 想定操作でこの箱だけが開く。
- [ ] B02 眩光の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 実illuminanceの暗所帯B01と非常に明るい帯B02
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-550 — 重さが消える瞬間

中心API・操作: Accelerometer

- [ ] B01 低加速度の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: raw合成加速度が2.0m/s²以下へ3 reading以上かつ80ms以上入るB01。投げ上げを指示しない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-560 — 三軸の一回転

中心API・操作: Gyroscope

- [ ] B01 X回転の箱: 想定操作でこの箱だけが開く。
- [ ] B02 Y回転の箱: 想定操作でこの箱だけが開く。
- [ ] B03 Z回転の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 角速度を積分し、X/Y/Z各軸で約2πへ到達するB01〜B03
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-570 — 姿勢の巡回

中心API・操作: RelativeOrientationSensor

- [ ] B01 巡回の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 開始quaternionから3つの姿勢gateを通り、開始姿勢へ戻るB01
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-019, H-023, H-025, H-026
- メモ:

### S-580 — 箱の名前を呼ぶ

中心API・操作: SpeechRecognition / SpeechSynthesis

- [ ] B01 発話の箱: 想定操作でこの箱だけが開く。
- [ ] B02 ずれた声の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01は明示buttonから認識し、正規化後に`busybox`なら開く。B02は位置shift結果を表示せず発話し、`aspuwiq → busybox`のutteranceが正常終了した時に開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-006, H-007, H-019, H-020, H-023, H-025, H-027
- メモ:

### S-590 — 出発点から

中心API・操作: Geolocation / Page Visibility / sessionStorage

- [ ] B01 5mの箱: 想定操作でこの箱だけが開く。
- [ ] B02 25mの箱: 想定操作でこの箱だけが開く。
- [ ] B03 100mの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 保守的距離が5m、25m、100mへ達するB01〜B03。開始anchorだけを同一tabへ最大24時間保存
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-006, H-019, H-022, H-025, H-028
- メモ:

### S-600 — 高さの三層

中心API・操作: Geolocation altitude / altitudeAccuracy

- [ ] B01 100m未満の箱: 想定操作でこの箱だけが開く。
- [ ] B02 100〜500mの箱: 想定操作でこの箱だけが開く。
- [ ] B03 500m以上の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 不確実性区間全体が3高度帯の一つへ入り、3 reading以上かつ5秒安定すると対応B01〜B03
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-006, H-019, H-023, H-025, H-029
- メモ:

### S-610 — 閉じ方の三態

中心API・操作: HTMLDialogElement / `closedby`

- [ ] B01 ボタン閉じの箱: 想定操作でこの箱だけが開く。
- [ ] B02 外側閉じの箱: 想定操作でこの箱だけが開く。
- [ ] B03 Escape閉じの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: ×button、外側native light dismiss、platform cancelを直前のtrusted操作、`cancel`、`close`から分離。外側clickのscript模倣clearなし
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-019, H-020, H-025
- メモ:

### S-620 — 数字の遠い親戚

中心API・操作: Unicode数字 / positional notation

- [x] B01 異体数字 1: 想定操作でこの箱だけが開く。
- [x] B02 異体数字 2: 想定操作でこの箱だけが開く。
- [x] B03 異体数字 3: 想定操作でこの箱だけが開く。
- [x] B04 異体数字 4: 想定操作でこの箱だけが開く。
- [x] B05 異体数字 5: 想定操作でこの箱だけが開く。
- [x] B06 異体数字 6: 想定操作でこの箱だけが開く。
- [x] B07 異体数字 7: 想定操作でこの箱だけが開く。
- [x] B08 異体数字 8: 想定操作でこの箱だけが開く。
- [x] B09 異体数字 9: 想定操作でこの箱だけが開く。
- [x] B10 異体数字 10: 想定操作でこの箱だけが開く。
- [x] B11 異体数字 11: 想定操作でこの箱だけが開く。
- [x] B12 異体数字 12: 想定操作でこの箱だけが開く。
- [x] B13 異体数字 13: 想定操作でこの箱だけが開く。
- [x] B14 異体数字 14: 想定操作でこの箱だけが開く。
- [x] B15 異体数字 15: 想定操作でこの箱だけが開く。
- [x] B16 異体数字 16: 想定操作でこの箱だけが開く。
- [x] B17 異体数字 17: 想定操作でこの箱だけが開く。
- [x] 成立境界: ASCII、Arabic-Indic、Eastern Arabic-Indic、漢数字、Osmanya、Adlam、N'Ko、Garay、Ol Chiki、Mro、Wancho、Nag Mundari、Ol Onal、Sora Sompeng、算木、Kaktovik、Mayanの全回答を別値にし、共通入力のASCII十進完全一致で対応箱だけを開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-014, H-020, H-025
- メモ:

### S-630 — 四つの回線

中心API・操作: Network Information `type`

- [ ] B01 Wi-Fiの箱: 想定操作でこの箱だけが開く。
- [ ] B02 携帯回線の箱: 想定操作でこの箱だけが開く。
- [ ] B03 有線の箱: 想定操作でこの箱だけが開く。
- [ ] B04 Bluetoothの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: playerの明示観測時に得たWi-Fi、cellular、ethernet、Bluetoothの厳密な`type`だけを別箱へ累積。速度、RTT、Save Data、offline、unknown系、UA sniff、通信試験を判定に使わない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-019, H-023, H-025, H-032
- メモ:

### S-640 — 読めない文字列

中心API・操作: Encoding API / legacy encodings

- [x] B01 文字コードの箱 1: 想定操作でこの箱だけが開く。
- [x] B02 文字コードの箱 2: 想定操作でこの箱だけが開く。
- [x] B03 文字コードの箱 3: 想定操作でこの箱だけが開く。
- [x] B04 文字コードの箱 4: 想定操作でこの箱だけが開く。
- [x] B05 文字コードの箱 5: 想定操作でこの箱だけが開く。
- [x] B06 文字コードの箱 6: 想定操作でこの箱だけが開く。
- [x] B07 文字コードの箱 7: 想定操作でこの箱だけが開く。
- [x] B08 文字コードの箱 8: 想定操作でこの箱だけが開く。
- [x] 成立境界: 8つの文字化けcardを表示し、一つの共通入力欄へ元の符号化で復号した文字列を入れる。誤表示用と元データ用の2つのencodingをfixtureで検証し、全回答非重複とexact code point一致を固定する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-014, H-020, H-025, H-033
- メモ:

### S-650 — 許可の四扉

中心API・操作: Permissions API / PermissionStatus

- [ ] B01 位置情報の箱: 想定操作でこの箱だけが開く。
- [ ] B02 通知の箱: 想定操作でこの箱だけが開く。
- [ ] B03 カメラの箱: 想定操作でこの箱だけが開く。
- [ ] B04 マイクの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 位置情報、通知、カメラ、マイクの初期granted、change、focus再照会、明示request、denied / prompt、descriptor非対応、media cleanupを検証する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-006, H-007, H-019, H-023, H-025, H-034
- メモ:

### S-660 — 負荷の三景

中心API・操作: Compute Pressure API / PressureObserver

- [ ] B01 nominalの箱: 想定操作でこの箱だけが開く。
- [ ] B02 中間状態の箱: 想定操作でこの箱だけが開く。
- [ ] B03 criticalの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 入場時にCPUを自動観測し、nominal、中間（fair / serious）、criticalを箱へ累積。ゲーム負荷なし。hidden時disconnect、再表示時の再購読、非対応、Permissions Policy、非保存を検証する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-004, H-019, H-023, H-025, H-035
- メモ:

### S-670 — Console迷路

中心API・操作: Console API / ASCII TUI

- [ ] B01 診断盤面の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: Consoleへread-only迷路を出し、page方向buttonで移動。plain text、再表示、Console入力なし、page編集なし、resetを検証する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-020, H-025, H-036
- メモ:

### S-690 — 断片の道標

中心API・操作: URL Fragment Text Directives

- [x] B01 断片の道標: 正答flagの入力でこの箱が開くことを確認した（Text Fragmentを巡る想定操作そのものは未確認）。
- [ ] 成立境界: 4つの同一page Text Fragment linkを巡り、`text` / `fragments` / `leave` / `trails`から固定回答`busybox{text_fragments_leave_trails}`を作る。jumpはscriptで数えず、回答一致だけで開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-054
- メモ:

### S-700 — 遠くの映写箱

中心API・操作: Remote Playback / native Barcode Detection / Presentation API

- [ ] B01 外部文字の箱: 想定操作でこの箱だけが開く。
- [ ] B02 外部QRの箱: 想定操作でこの箱だけが開く。
- [ ] B03 外部画面の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 固定4slotの前半を外部再生し文字鍵を戻すB01、後半QRを外部再生して手元cameraのnative `BarcodeDetector`で読むB02、実Presentation receiverの同一round readyで開くB03。local再生、PiP、JS QR decoder、通常window、合成messageは代替にしない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-020, H-023, H-025, H-040, H-041
- メモ:

### S-710 — 動画変換室

中心API・操作: MediaBunny / MediaRecorder / WebM metadata / jsQR / iframe

- [x] B01 暗闇frameの箱: 想定操作でこの箱だけが開く。
- [x] B02 decode失敗の箱: 想定操作でこの箱だけが開く。
- [x] B03 QR frameの箱: 想定操作でこの箱だけが開く。
- [x] B04 metadataの箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: 独立したClipPress風HTMLをsame-origin iframeへ埋め込み、10秒・640×360・15fps・160kbps変換、暗黒frame白文字化、入力decode失敗時の小文字固定error動画、各downscale frameでjsQRを検出した場合だけ当該frameの四辺形へQR射影置換、SimpleTag再入力overlay、downloadとsize比を実装。iframeはsession付き`postMessage`で内容高を親へ通知して内部scrollなしで表示し、固定flagの正答は変換達成状態を問わず共通欄で照合する
- [x] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-006, H-007, H-014, H-019, H-020, H-023, H-025, H-042
- メモ:

### S-720 — 映像復元室

中心API・操作: HTMLMediaElement / SVG patch cable / MediaBunny / Canvas

- [x] B01 T1の箱: 想定操作でこの箱だけが開く。
- [x] B02 T2の箱: 想定操作でこの箱だけが開く。
- [x] B03 T3の箱: 想定操作でこの箱だけが開く。
- [x] B04 QR復元の箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: 左の動画3node、中央にT1〜T3を二列、右の出力nodeをBezier cableで配線する。source→output直結または変換の連結を実行し、4つの正規routeでQR flagを発見できる。分岐とcycleは拒否するが、固定flagの正答は現在のrouteや変換達成状態を問わず共通欄で照合する
- [x] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-014, H-019, H-020, H-023, H-025, H-043
- メモ:

### S-730 — XRの箱

中心API・操作: WebXR Device API / XRSession / XRFrame / XRInputSource

- [ ] B01 空間の箱: 想定操作でこの箱だけが開く。
- [ ] B02 選択光線の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はAR / VRの実immersive sessionと最初の非null viewer pose、B02は実input sourceのselect rayと固定XR箱の交差を検証する。inline、page click、DOM overlay、模擬pose、歩行、room scanは成功経路にしない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-004, H-014, H-019, H-023, H-044
- メモ:

### S-740 — 留守番温室

中心API・操作: Periodic Background Sync / Service Worker / IndexedDB / Cache Storage

- [ ] B01 開花の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: installed PWAで水と光を別訪問に預け、window client 0件の異なる二回の実`periodicsync`が発芽・開花assetをcacheしてphaseを進める。日次保証、通知、timer、foreground / synthetic event、debug発火は成功経路にしない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-005, H-014, H-018, H-019, H-021, H-023, H-025, H-045
- メモ:

### S-750 — 届いた封書

中心API・操作: WebOTP API / Security Code AutoFill / origin-bound SMS

- [ ] B01 自動受取の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 実`OTPCredential`一致、または最初から空のOTP専用欄へのtrusted一括入力、current code一致、実`:autofill`状態の組合せで一箱を開く。手入力、paste、drop、composition、event列だけの推定は成功経路にしない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-020, H-023, H-025, H-046
- メモ:

### S-760 — 架空の名刺

中心API・操作: Contact Picker API / ContactsManager / ContactInfo

- [ ] B01 五項目の箱: 想定操作でこの箱だけが開く。
- [ ] B02 伏せた名刺の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はOSへ追加した架空contact 1件のname / email / tel / address / icon一致、B02は一件を選びながら要求した5propertyが全空または欠損であることを検証する。contact identity、共有拒否理由、game製UIは成功条件にしない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-023, H-025, H-047
- メモ:

### S-770 — 身分証棚

中心API・操作: FedCM / Google Identity Services

- [ ] B01 Google FedCMの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 明示開始、browser所有chooser、非空credential、厳密なmanual `select_by === "fedcm"`、token非保存を検証する。追加providerは公式提供、public client登録、独自backend不要、実account証跡後にだけ加算する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-023, H-025, H-049
- メモ:

### S-780 — 架空の財布

中心API・操作: Payment Handler / Payment Request / Service Worker

- [ ] B01 承認の箱: 想定操作でこの箱だけが開く。
- [ ] B02 拒否の箱: 想定操作でこの箱だけが開く。
- [ ] B03 再試行の箱: 想定操作でこの箱だけが開く。
- [ ] B04 ◇財布の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 架空BBX methodの`Link` header、2つのPayment App、browser-owned chooser / handler windowを使う。B01〜B03は財布を限定せず✓、×、↻→✓で開き、B04は◇wallet workerへのtrusted `PaymentRequestEvent`で開く。game製picker、実provider、payer情報、credential、結果flagを使わない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-019, H-023, H-025, H-050
- メモ:

### S-790 — 活字の鍵

中心API・操作: Local Font Access / FontData / FontFace / Web Crypto

- [ ] B01 OS活字の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 独自生成してGit管理する専用TTFをOSへinstallし、対象PostScript名だけの実照会、raw bytesのSHA-256照合、Blob由来FontFaceの専用glyph表示で直接開く。全font列挙、既存font、upload、`local()`だけ、固定flagを使わない
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-003, H-004, H-006, H-014, H-019, H-023, H-025, H-051
- メモ:

### S-800 — URLの蛍光ペン

中心API・操作: URL Fragment Text Directives / `hidden=until-found` / `beforematch`

- [ ] B01 読めない断片: 想定操作でこの箱だけが開く。
- [ ] B02 一語の断片: 想定操作でこの箱だけが開く。
- [ ] 成立境界: B01はpercent-encoded `cobalt` fragment、B02はcanvasだけに見せた`ember`からfragmentを作る。各専用containerの実`beforematch`で開く。UA highlight起点とfind-in-pageの区別不能はH-055で明示的に扱う
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-055
- メモ:

### S-810 — 変形する映像

中心API・操作: MediaSource / SourceBuffer / `videoWidth` / `videoHeight` / `seeked` / `requestVideoFrameCallback`

- [x] B01 1:1の箱: 想定操作でこの箱だけが開く。
- [x] B02 4:3の箱: 想定操作でこの箱だけが開く。
- [x] B03 16:9の箱: 想定操作でこの箱だけが開く。
- [x] B04 9:20の箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: Git管理した120個のVP8 WebM segmentをpackとmanifestからMSEへtimestamp offset付きで連結し、入場時に自動表示する。小正方形から横幅だけを3840pxまで伸ばし、縦横同時の縦長化を経て、縦幅3840pxのまま横幅だけを伸ばして大正方形へ至る。停止中の提示frameが1:1、4:3、16:9、9:20（各相対5%以内）なら対応箱を開き、初期1:1は直ちに開く。通常再生中の通過、CSS寸法、固定画像は成功条件に使わない
- [x] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-001, H-002, H-003, H-019, H-020, H-023, H-025, H-053
- メモ:

### S-820 — 遠い箱

中心API・操作: Pointer Lock / `movementX` / `movementY`

- [ ] B01 1000px先の箱: 想定操作でこの箱だけが開く。
- [ ] B02 5000px先の箱: 想定操作でこの箱だけが開く。
- [ ] B03 10000px先の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 2D平面をlock中の相対mouse移動だけで進み、3座標の箱を中央reticleのtrusted clickで開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-056
- メモ:

### S-830 — 留守番する箱

中心API・操作: Idle Detection

- [ ] B01 離席した箱: 想定操作でこの箱だけが開く。
- [ ] B02 画面を閉じた箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 60秒thresholdの実idle-unlockedと実screen lockedを別boxへ観測する。timer / visibility代替なし
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-057
- メモ:

### S-840 — ぴったり重ねる

中心API・操作: IntersectionObserver

- [x] B01 重なった箱: 想定操作でこの箱だけが開く。
- [x] 成立境界: 二次元scroll rootとtargetを実layoutに合わせ、intersection ratio 0.98以上で開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-058
- メモ:

### S-850 — 浮かぶ箱

中心API・操作: Document Picture-in-Picture

- [ ] B01 浮かぶ箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: React portalした実ProblemGiftBoxをDocument PiP内でtrusted clickする
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-059
- メモ:

### S-860 — 校正刷り

中心API・操作: EditContext

- [ ] B01 題名の誤字: 想定操作でこの箱だけが開く。
- [ ] B02 説明の脱字: 想定操作でこの箱だけが開く。
- [ ] B03 コピーの余分な語: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 通常見出しと文章へEditContextをattachし、共通copyの単語誤字・脱字・余分語を直す
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-060
- メモ:

### S-870 — 外の書庫

中心API・操作: File System Access

- [ ] B01 書き換える箱: 想定操作でこの箱だけが開く。
- [ ] B02 消す箱: 想定操作でこの箱だけが開く。
- [ ] B03 作る箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 空の使い捨てfolderへseedしたfileをOS側で編集・削除・作成し、visible中の再走査で別々に開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-061
- メモ:

### S-880 — 圧縮された荷物

中心API・操作: Compression Streams

- [ ] B01 青い荷物: 想定操作でこの箱だけが開く。
- [x] B02 紫の荷物: 想定操作でこの箱だけが開く。
- [x] B03 赤い荷物: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 固定gzip / deflate / deflate-raw荷物を選択形式の実DecompressionStreamで展開し、markerとbyte長を照合する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-062
- メモ:

### S-890 — 画面いっぱいの箱

中心API・操作: Element Fullscreen

- [ ] B01 画面いっぱいの箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 指定HTML elementだけをfullscreenにし、その内部の実boxをtrusted clickする
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-063
- メモ:

### S-900 — 映像の継ぎ目

中心API・操作: MediaSource / SourceBuffer

- [ ] B01 つながった箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 固定lead-inとA→B→C→D WebM segmentを実appendし、完成videoのtrusted endedで開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-064
- メモ:

### S-910 — その場でつくる字幕

中心API・操作: runtime WebVTT / TextTrack

- [ ] B01 重なった字幕の箱: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 再生中に追加したVTTCueが対応する表示時間へ重なることをactiveCues / cuechangeで観測する
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-065
- メモ:

### S-920 — ポップオーバー迷路

中心API・操作: Popover API / CSS Anchor Positioning

- [ ] B01 琥珀の終点: 想定操作でこの箱だけが開く。
- [ ] B02 青緑の終点: 想定操作でこの箱だけが開く。
- [ ] B03 紫の終点: 想定操作でこの箱だけが開く。
- [ ] 成立境界: 同一origin iframeの額縁内で宣言的invokerと入れ子`popover="auto"`をたどる固定tree。斜線外周は実際の表示不可領域で、B01はinline、B02はblock反射を必ず踏む。3つの影は実経路と同じ部屋寸法・十字button位置・`position-area`・fallback列を持つ非操作CSS anchor chainの終点で、JavaScriptの座標測定なしに実goalと一致する。goal内の実箱trusted clickでのみ開く
- [ ] UI: 初見で最初の一手を推測でき、標準UIとゲーム内UIの区別、現在状態、成功／失敗が分かる。日英、keyboard、zoom、狭い幅も確認する。

- 関連する正式な人手確認: H-066
- メモ:

## AI実行済み確認ログ（2026-08-23）

### 自動検査

- [x] TypeScript `--noEmit`
- [x] Jest 59 suites / 316 tests
- [x] Biome check
- [x] Markuplint
- [x] Vite production build
- [x] `git diff --check`

### 直接URLの表示スモーク

各stageを `?stage=S-xxx` で開き、500ms待って見出し・箱数・stage本体を確認した。unsupported表示は成功経路の検証とは分けて記録する。

- [x] S-000 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-010 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-020 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-030 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-040 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-050 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-060 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-070 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-080 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-090 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-100 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-110 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-120 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-130 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-140 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-150 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-160 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-170 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-180 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-190 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-200 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-210 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-220 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-240 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-250 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-260 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-280 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-290 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-300 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-310 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-320 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-330 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-340 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-350 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-360 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-370 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-380 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-390 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-400 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-410 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-420 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-430 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-440 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-450 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-460 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-480 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-490 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-500 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-510 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-520 route smoke: stage見出し・箱数・unsupported表示を確認（success pathは環境非対応のため未実施）。
- [x] S-530 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-540 route smoke: stage見出し・箱数・unsupported表示を確認（success pathは環境非対応のため未実施）。
- [x] S-550 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-560 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-570 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-580 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-590 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-600 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-610 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-620 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-630 route smoke: stage見出し・箱数・unsupported表示を確認（success pathは環境非対応のため未実施）。
- [x] S-640 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-650 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-660 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-670 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-690 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-700 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-710 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-720 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-730 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-740 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-750 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-760 route smoke: stage見出し・箱数・unsupported表示を確認（success pathは環境非対応のため未実施）。
- [x] S-770 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-780 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-790 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-800 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-810 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-820 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-830 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-840 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-850 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-860 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-870 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-880 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [ ] S-890 route smoke: 表示は描画されたが、離脱時に `document.exitFullscreen()` の非アクティブ文書例外を検出。cleanupの修正後に再確認する。
- [x] S-900 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-910 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。
- [x] S-920 route smoke: stage見出し・箱数・stage本体を確認し、該当URL由来のconsole errorなし。

### 追加で実操作した項目

- [x] S-010-B01 マウス箱: ブラウザの通常クリックで `1/3` になり、Mouse boxが「今回開いた」状態になった。
- [x] S-150-B01 フォーカス箱: `Keyboard-only box`へキーボードのEnterを送り、`1/3`になった。
- [x] S-490-B01 busybox入力: placeholder `busybox` の入力欄へ正答を入力し、`1/1`になった。
- [x] S-690-B01 断片の道標: 正答`busybox{text_fragments_leave_trails}`を入力して送信し、`1/1`になった。
- [x] S-620-B01〜B17 Unicode入力: 17個の正答`579, 801, 1023, 777, 781, 783, 899, 999, 1199, 909, 908, 898, 897, 905, 893, 3133, 3079`を順に入力し、`1/17`から`17/17`まで対応箱だけが開いた。
- [x] S-640-B01〜B08 文字コード復号: 8つの正答`café français`、`русский ящик`、`український код`、`åbn æsken`、`תיבת קוד`、`กล่อง รหัส`、`český kód`、`编码 宝箱`を順に入力し、`1/8`から`8/8`まで対応箱だけが開いた。
- [x] S-880-B02/B03 圧縮荷物: `deflate` と `deflate-raw` を選び、各parcelの内容一致で `2/3` になった。
- [ ] S-880-B01 gzip荷物: 正しい `gzip` を選んでも「形式を開けない」となり、B01が開かなかった。fixture／ブラウザのgzip経路を調査する。
- [x] S-840-B01 二次元scroll: 大きな平面を横1500px・縦1100px方向へ実scrollし、表示比率100.0%で `1/1` になった。
- [ ] S-890 cleanup: `S-890` から別stageへ移動すると、React cleanup内の `document.exitFullscreen()` が `Document not active` で例外になる。

### 既存レビューから移行した横断確認記録

- [x] S-000: 再入場・reset・後始末・privacyを確認済み。
- [x] S-010: 負例を確認済み。
- [x] S-710 / S-720 / S-810: 負例を確認済み。

### MUIアイコン置換後のスモーク（2026-08-24）

- [x] 89ステージの直接URLを再表示し、見出し・stage本体・該当URL由来のconsole errorなしを確認した。
- [x] 代表画面でMUIの`svg`（`MuiSvgIcon-root`、`aria-hidden="true"`、`viewBox="0 0 24 24"`）を確認した。S-010: 3個、S-020: 1個、S-350: 7個、S-620: 17個、S-720: 4個、S-810: 4個。
