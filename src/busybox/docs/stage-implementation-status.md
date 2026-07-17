# ステージ実装状況

## 状態の定義

| 状態 | 意味 |
| --- | --- |
| 実装済み | 観測・判定・演出・永続化・cleanupをコード化し、自動チェック済み |
| 人手確認待ち | 実装済みだが、指定した実ブラウザ・実機の証跡が未記録 |
| 設定待ち | 外部設定や公開環境がなければ最終確認できない |
| 計画 | 仕様候補のみで、ゲーム一覧では操作不可 |

「実装済み」は公開合格を意味しない。人手確認台帳の必須ケースが未実施なら、リリース判定では未検証として扱う。

## 2026-07-18時点

全35ステージは `stages/S-xxx.tsx` に1ファイルずつ実装し、runtime registryから同じIDの遅延chunkとして読み込む。ステージラベルは表示コピーだけに使い、識別子はステージID・問題箱IDへ固定した。各ファイルのJSDocはギミック、使用API、成功条件、権限・プライバシー、cleanup、人手確認IDを同じ見出しで記録する。

| ID | コード | 状態 | 自動確認 | 残る人手確認 |
| --- | --- | --- | --- | --- |
| S-000 | click / activation | 実装済み・人手確認待ち | 初回・再入場の閉箱、累積1/1、再開封、進捗非重複 | H-001, H-002, H-003, H-020 |
| S-010 | Pointer Events | 実装済み・人手確認待ち | 3箱の同形性、マウス分離、再入場時の累積1/3 | H-004, H-020, H-024 |
| S-020 | viewport resize | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-002, H-003 |
| S-030 | Selection | 実装済み・人手確認待ち | capability失敗の隔離 | H-001, H-003, H-020 |
| S-040 | Page Visibility | 実装済み・人手確認待ち | cleanup境界、進捗集約 | H-013, H-022 |
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
| S-180 | Clipboard | 実装済み・人手確認待ち | write成功と実pasteの2箱、取消保護 | H-006, H-014, H-020 |
| S-190 | Screen Capture | 実装済み・人手確認待ち | browser surfaceとframe継続、track cleanup | H-006, H-007, H-012, H-019 |
| S-200 | Gamepad | 実装済み・人手確認待ち | 2 button + axis同時判定、機器ID非保存 | H-009, H-019 |
| S-210 | Badging | 実装済み・人手確認待ち | 1→2→3成功、離脱時clear | H-005, H-023 |
| S-220 | History | 実装済み・人手確認待ち | 同一ステージ3履歴、Back再入場 | H-001, H-002, H-003, H-022 |
| S-230 | Picture-in-Picture | 実装済み・人手確認待ち | 生成stream、PiP入場event、終了cleanup | H-012, H-023 |
| S-240 | Web Share | 実装済み・人手確認待ち | share完了と取消の分離 | H-004, H-014 |
| S-250 | Web Locks | 実装済み・人手確認待ち | holder / blockedの2箱、lock解放 | H-013, H-022 |
| S-260 | EyeDropper | 実装済み・人手確認待ち | 実画面選択、指定sRGB色との一致 | H-006, H-023 |
| S-270 | WebGPU | 実装済み・人手確認待ち | compute dispatch、GPU readback、buffer破棄 | H-019, H-023 |
| S-280 | Web Bluetooth | 実装済み・人手確認待ち | Battery Service実read、GATT切断 | H-006, H-010, H-019 |
| S-290 | WebHID | 実装済み・人手確認待ち | 選択後の実inputreport、device close | H-006, H-011, H-019 |
| S-300 | WebUSB | 実装済み・人手確認待ち | claim後の実IN transfer、device close | H-006, H-011, H-019 |
| S-310 | Launch Handler | 実装済み・人手確認待ち | manifest、LaunchQueue target URL | H-005, H-021, H-023 |
| S-320 | Device Posture / Viewport Segments | 実装済み・人手確認待ち | folded changeまたは2 segment | H-023 |
| S-330 | Screen Wake Lock | 実装済み・人手確認待ち | 取得・visibility解放・再取得の2箱 | H-005, H-022, H-023 |
| S-340 | View Transition | 実装済み・人手確認待ち | 3回のtransition完了、非対応隔離 | H-001, H-002, H-003, H-020 |

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
