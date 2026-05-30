# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### Math.random 推測アプリ — optimized Z3 inference spike

- [x] cache offset 不明・境界跨ぎを含む solver 挙動をテストで固定
- [x] raw observations 用 `ConstraintPlan` を domain に抽出
- [x] UI/CLI 共通の solver 戻り値型を定義
- [x] 既存 raw solver を `ConstraintPlan` と共通型へ寄せる
- [x] 理論値計算を model metadata 連動にし CLI observe に表示
- [x] cache offset 不明時も境界候補ごとの次値候補を返す
- [x] 先行追加した簡易 UI と Vite MPA 登録を削除
- [x] ドキュメントを core / solver TDD 先行方針へ整理
- [x] 候補 preview / exhaustive と cache offset 不明ケースの追加テストを整理
- [x] 観測数を増やした `maxCandidates: "all"` で unknown offset の internal state 候補を安定して列挙する
- [x] core / solver / CLI 関数に日本語 JSDoc を追加する
- [x] `src/math-random-predictor/` 用の JSDoc ルールを追加する
- [x] ドキュメントとコメントを現行 GF(2) raw solver 実装に合わせて整合させる
- [x] Z3 raw solver を本番 GF(2) solver とは別実装として追加する
- [x] 代表ケースを `RUN_Z3_RAW_SPIKE=1` の任意実行テストとして追加する
- [x] Z3 raw spike の timeout / unknown / unique 傾向を実測して記録する
- [x] 通常の test / check / build が Z3 spike なしで通ることを確認する
- [x] GF(2) 線形 solver core を共有 helper へ抽出する
- [x] Z3 raw solver を GF(2) 簡約ベースの optimized strategy に更新する
- [x] Z3 platform 化と GF(2) 簡約の流れ・意図をドキュメントへ記録する
- [x] optimized Z3 spike と通常 test / check / build を確認する

## 進捗状況

- 参照計画: `/Users/okathira/.cursor/plans/math_random_next_32e8a79d.plan.md`
- 実装: `domain/` に V8 current cache/LIFO モデル、観測パーサ、理論値計算を追加
- 実装: `solver/` に GF(2) 線形 solver を追加し、生系列の候補列挙と次値予測に対応
- 実装: `cli/` に `generate` / `observe` を追加し、`npm run math-random:cli` で実行可能にした
- 検証: `npm test -- math-random-predictor` 成功、CLI smoke test 成功、`npm run check` 成功、`npm run build` 成功
- 追加調査: Node.js 24.16.0 の同梱 V8 は cache/LIFO + `ToDouble(state.s0)`、Chrome Stable 148.0.7778.217 の V8 commit は cache/LIFO + `ToDouble(random = state0 + state1)` で差分あり
- 更新: `ALGORITHM_SURVEY.md`, `IMPLEMENTATION_NOTES.md`, `IMPLEMENTATION_PLAN.md`, `README.md` に対象バージョンとソースリンクを追記
- 検証: `npm run check` 成功
- 重複整理: 詳細なモデル表と実装ソースリンクは `ALGORITHM_SURVEY.md` を正とし、他 md は要約と参照リンクのみに整理
- 実装: `domain/constraints.ts` に cache offset 候補と境界跨ぎを表現する `ConstraintPlan` を追加
- 実装: `solver/types.ts` に UI/CLI 共通の solver 戻り値型を追加
- 実装: raw solver を `ConstraintPlan` 入力へ寄せ、cache offset 不明時は offset 候補を探索するよう更新
- 実装: CLI `observe` に理論値と cache offset 指定を追加
- 更新: offset 不明の短い生系列では、同一 cache 内の等価 offset を代表に畳み、cache 境界候補ごとの `nextPredictions` を返す
- 検証: `npm test -- math-random-predictor` 成功、`npm run check` 成功、`npm run build` 成功
- 方針整理: 実推論なしのブラウザ UI は先行しない。browser solver の動作確認が必要になった時点で最小検証 UI を作る
- 削除: 先行追加した `math-random-predictor` の React UI / Vite MPA 登録 / 目次リンクを削除
- 更新: Z3 ではなく GF(2) 線形方程式として V8 current raw 観測を解くことで、`maxCandidates: "all"` で internal state 候補を全列挙可能にした
- テスト: unknown offset の境界なし/境界跨ぎ x unique/multiple/unsat と、preview 打ち切り/全列挙の差分を追加
- 調整: preview は観測 3 個、exhaustive は観測 4 個（offset 0/60 で各 1 state）に分離。観測 3 個の全列挙（4096 件）は手元 ~60ms のため通常実行、重い環境では `SKIP_SLOW_SOLVER_TESTS=1` で省略可能
- 作業中: `src/math-random-predictor/` の公開 API と非自明な helper に日本語 JSDoc を追加
- ルール化: `.cursor/rules/math-random-predictor-jsdoc.mdc` を追加し、同プロジェクト配下の JSDoc 方針を明文化
- 更新: docs 内の Z3 前提を整理し、現行 raw solver は GF(2) 線形、Z3 は将来の区間制約・非線形モデル候補として扱う方針に修正
- 実装: `solver/v8CurrentZ3RawSolver.ts` を追加し、Z3 の raw observation solver を spike 用の別実装として隔離
- テスト: `solver/v8CurrentZ3RawSolver.spec.ts` を追加し、`RUN_Z3_RAW_SPIKE=1` のときだけ代表ケースを実行する構成にした
- 実測: preview は 1 秒未満、観測 3 個の 4096 全列挙は timeout、観測 1 個の全列挙は Z3 実行前に unknown、64 観測の既知 offset unique は約 16 秒
- 検証: `RUN_Z3_RAW_SPIKE=1 npm test -- v8CurrentZ3RawSolver --runInBand` 成功、`npm test -- math-random-predictor --runInBand` 成功、`npm run check` 成功、`npm run build` 成功
- 設計更新: raw exact bit を Z3 に直接投げて blocking clause で全列挙するのではなく、GF(2) で `particular + basis` の reduced candidate space へ簡約してから Z3 residual constraints へ渡す方針にした
- 実装: `solver/v8CurrentLinearSolver.ts` に GF(2) 線形 solver core を抽出し、GF(2) 本番 solver と Z3 optimized strategy で共有する構造にした
- 実測: optimized Z3 raw spike は preview 観測3個 9ms、preview 観測4個 17ms、既知 offset 観測4個 9ms、観測3個 4096 全列挙 234ms、観測1個 unknown 3ms、64観測 unique 118ms
- 検証: `RUN_Z3_RAW_SPIKE=1 npm test -- v8CurrentZ3RawSolver --runInBand` 成功、`npm test -- math-random-predictor --runInBand` 成功、`npm run check` 成功、`npm run build` 成功
- 比較実測: 同一プロセス内の中央値では GF(2) 本番 solver と optimized Z3 strategy はほぼ同等。観測3 preview は 1.24ms / 1.16ms、観測4 preview は 2.94ms / 2.94ms、既知 offset 観測4 unique は 1.47ms / 1.46ms、観測3 4096 全列挙は 53.11ms / 54.55ms、観測1 unknown は 0.42ms / 0.43ms、既知 offset 64観測 unique は 22.62ms / 22.58ms

## メモと反省

- V8 は時期・経路によって出力変換や cache/LIFO の扱いが変わるため、差分は別アルゴリズム ID として扱う
- 調査で確証が弱いバージョン範囲は「未確認」と明記し、推測で exact モデルを固定しない
- 手元の Node.js 24.16.0 / V8 13.6.233.17-node.49 は、V8 main の 64-bit direct path ではなく 64 件 cache/LIFO の `state0 >> 11` / `2**53` 系列と一致した
- Chrome / Chromium 最新は DevTools 取得列を CLI に貼り付け、同一モデルで説明できない場合は `v8-node-current` / `v8-chromium-current` に分ける
- cache/LIFO モデルでは、観測列が cache の先頭から始まるとは限らないため、観測開始 offset と境界跨ぎを推論対象に含める
- UI は core / solver contract と browser solver の動作確認ができるまで作らない
- raw observation の本番経路は GF(2) solver を正とする。Z3 raw solver は、converted observation や非線形制約へ進む前に実行特性を測る spike として扱う
- Z3 は raw exact bit を直接全探索する先ではなく、GF(2) 簡約後の residual constraint を記述・判定する platform として扱う。converted observation では reduced candidate space 上に区間制約を追加する
- optimized Z3 strategy の raw 性能は GF(2) と同等になる。これは Z3 が raw exact bit を解いているのではなく、同じ GF(2) core で reduced candidate space を作っているため。今後の差分は residual constraint（converted / 非線形）を載せたときに評価する
