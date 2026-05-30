# Math.random 推測アプリ 実装ロードマップ

本書は `Math.random()` 推測・検証ツールを実装するための全体の流れをまとめる。今回のドキュメント制作フェーズでは実装に入らず、次フェーズ以降で何をどの順序で作るかを固定する。

関連文書:

- [README.md](./README.md): アプリの目的とユーザー向け概要
- [SPEC.md](./SPEC.md): 製品仕様、画面構成、入出力、制約
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md): solver 方針、ブラウザ実行、TDD 方針の技術メモ
- [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md): 各エンジンの `Math.random()` 実装調査

## 現段階の実装状況

この文書は当初ロードマップとして作成したが、現段階では core / CLI PoC まで実装済みである。

- React UI / Vite エントリ登録は未実装。実推論なしの UI は先行しない。
- `v8-node-24-cache-lifo-state0` の PRNG core、観測パーサ、理論値計算、ConstraintPlan、CLI は実装済み。
- raw observation の exact solver は Z3 ではなく GF(2) 線形方程式で実装済み。`maxCandidates: "all"` で列挙可能な internal state 候補を全列挙する。
- `z3-solver` は導入済み依存だが、現行 raw solver の主経路では使っていない。変換系列・区間制約・非線形モデルで必要になった場合の候補技術として扱う。
- GitHub Pages / COOP / COEP 設定変更は未実施。現行 raw solver をブラウザで動かすだけなら SharedArrayBuffer は不要な見込み。

## 全体フロー

```mermaid
flowchart LR
  Survey[Algorithm Survey] --> ModelDecision[Model Decision]
  ModelDecision --> CoreTdd[Core TDD]
  CoreTdd --> ConstraintPlan[Constraint Plan]
  ConstraintPlan --> SolverAdapter[Solver Adapter]
  SolverAdapter --> Ui[React UI]
  Ui --> Integration[Vite Integration]
  Integration --> Verification[Verification]
```

## フェーズ 0: アルゴリズム調査

目的:

- Node.js / Chrome / Edge / Firefox / Safari の `Math.random()` 実装を、ソース・revision・バージョン範囲付きで整理する。
- 時期差・実装差・JIT path 差・cache/LIFO 差がある場合、別アルゴリズム ID として扱う判断材料を作る。
- 初版実装対象を決める。

成果物:

- [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md)
- 実装対象候補のアルゴリズム ID 一覧
- 未確認事項リスト

完了条件:

- Node / Chrome の対象 V8 モデルについて、参照ソース、状態遷移、出力変換、観測順が説明できる。
- `v8-legacy-*`、`spidermonkey-current`、`javascriptcore-current` で未確認点が明示されている。
- 初版は最新の主要 Node.js / Chromium 系 V8 を優先する判断が文書化されている。

## フェーズ 1: exact モデル固定

目的:

- 初版の exact モデルを Node / Chrome の実装差が混ざらない粒度で固定する。
- 参照する V8 revision、Node.js version、Chrome / Chromium version、出力変換、cache 有無を model metadata に落とせる形にする。

作業:

1. `node --random_seed=1337` などで 70 件以上の実測ベクトルを取得する。
2. `process.version` と `process.versions.v8` を実測ベクトルに添える。
3. 64 件境界をまたぐ系列で、cache/LIFO reverse が不要か必要かを確認する。
4. Chromium / Chrome / Edge でも同じ形式の系列を採取する。
5. Node と Chromium で差があれば `v8-node-current` / `v8-chromium-current` に分ける。

実装時メモ: Node.js 24 と Chrome Stable 148 では V8 の `Math.random()` モデルに差がある。対象バージョン、出力変換、参照ソースリンクは [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md) を正とし、このロードマップでは実装順とスコープだけを扱う。

成果物:

- `v8-node-24-cache-lifo-state0` / `v8-chrome-148-cache-lifo-sum` model metadata
- 固定 seed 検証ベクトル
- 64 件境界の順序検証結果

## フェーズ 2: core TDD

t-wada 流に、小さい Red-Green-Refactor のサイクルで solver 非依存の純粋関数から作る。Web UI や Z3 を先に作らない。

対象:

- PRNG model
  - `nextState`
  - `toMathRandomNumber`
  - `floorRandom`
  - cache / 観測順正規化
  - model metadata
- 観測値パーサ
  - 生系列の 10 進文字列を JS `Number` に parse
  - `Number.prototype.toString()` で round-trip できる値の扱い
  - `[0, 1)` の範囲外エラー
  - 変換系列の `N` と `0..N-1` 検証
- 理論値計算
  - 状態サイズ
  - 1 観測あたりの情報量
  - 残り不確実性 bit
  - 推定残り観測数
- 制約生成
  - solver を呼ばず、観測からどの制約を作るかをデータ構造としてテストする

テスト方針:

- 既存の [lcg-predictor](../lcg-predictor) と同様に `*.spec.ts` をコロケーションする。
- まず `domain/` の純粋関数を Jest node 環境でテストする。
- 乱数実装ごとの差分は fixture と model metadata で表現する。
- Node / Chrome / legacy V8 を同じ関数のフラグで分岐しすぎない。差分が大きい場合は別 model object にする。

## フェーズ 3: SolverAdapter / raw solver

UI や domain から solver 実装を直接呼ばず、`ConstraintPlan` を入力し、推論結果を返す `SolverAdapter` を境界にする。

現行方針:

- `v8-node-24-cache-lifo-state0` の raw observation は、`state0 >> 11` の既知 bit 制約として扱えるため GF(2) 線形方程式で解く。
- cache offset が未知の場合は、cache 先頭と境界跨ぎが起きうる代表 offset の `ConstraintPlan` を試す。
- `maxCandidates` が数値なら preview として指定件数で打ち切る。
- `maxCandidates: "all"` なら、解空間が大きすぎない範囲で internal state 候補を全列挙する。
- 候補数が多すぎて全列挙しない場合は `unknown` と理由を返す。
- `timeoutMs` は solver contract 互換のため残しているが、現行 GF(2) raw solver では時間制限には使っていない。

Z3 の扱い:

- Z3 は現行 raw solver の既定経路では使わない。
- `Math.floor(Math.random() * N)` の区間制約、丸め・表示桁不足、`state0 + state1` の加算 carry を厳密に扱うモデルなど、線形等式だけで表しにくい問題で再検討する。
- Z3 を使う場合も UI や domain へ直接露出せず、SolverAdapter の内側に閉じ込める。

戻り値に含める情報:

- 推論状態
- 候補数
- 候補一覧の先頭 N 件
- 一意性確認の完了 / 未完了
- timeout / unknown の理由
- solver unavailable の理由
- 次値予測可能か

## フェーズ 4: UI 実装

UI は [SPEC.md](./SPEC.md) の完成形に沿う。ただし、実際の推論なしでブラウザ版 UI だけを先に作らない。まずは core / solver を TDD で固め、ブラウザ solver の動作確認や結合検証が必要になったタイミングで、必要最小限の検証用 UI から作る。

初版 UI は数値・テキスト中心で、グラフは作らない。

主要領域:

- ヘッダと説明
- 推論 / デモの 2 タブ
- 設定
  - 観測系列種別: 生系列 / 変換系列
  - `N`
  - 利用アルゴリズム
  - 逐次推論 ON / OFF
  - デモのみ生成源
- 観測入力
  - 貼り付け
  - カンマ / 空白 / 改行区切り
  - 1 件追加
  - 編集 / 削除 / 全クリア
- 絞り込み状況パネル
  - 実推論候補数
  - 理論候補数
  - 残り不確実性
  - 信頼度
  - 整合観測数
  - 推定残り観測数
  - 推論状態
  - 更新ソース
- 詳細
  - 候補一覧
  - 次値予測
  - デモの正解状態
  - ログ
  - モデル説明カード

状態管理:

- 初版は `lcg-predictor` に近い `useState` 中心でよい。
- 状態が肥大化した場合のみ Jotai を採用する。
- Jotai を採用する場合は、リポジトリのルールどおり atom 本体をコンポーネントから直接 import しない。

## フェーズ 5: Vite / リポジトリ統合

作業:

- `src/math-random-predictor/index.html`
- `src/math-random-predictor/main.tsx`
- `src/math-random-predictor/App.tsx`
- `vite.config.ts` の MPA input 追加
- `src/index.html` の目次リンク追加
- ルート `README.md` のプロジェクト一覧追加

注意:

- 今回のドキュメント制作フェーズでは上記は実施しない。
- core / solver / browser integration の contract が固まるまでは、Vite エントリ登録を先行しない。
- Z3 browser 実行が必要になり COOP / COEP が必要な場合、Vite dev server headers と GitHub Pages の扱いを別途設計する。

## フェーズ 6: ブラウザ solver 実行

現行の `v8-node-24-cache-lifo-state0` raw solver は TypeScript の GF(2) 線形 solver なので、ブラウザでも SharedArrayBuffer なしで動かせる見込みである。ただし重い入力や将来の Z3 solver は worker 側に逃がす。

方針:

- UI thread では重い solver を実行しない。
- まずは pure TS solver を main thread / worker のどちらに置くかを実測で決める。
- Z3 が必要な solver を追加する場合は worker で `z3-solver/browser` を初期化する。
- Z3 solver で `crossOriginIsolated` が false の場合は精密推論を unavailable として表示する。
- GitHub Pages では任意 HTTP header を直接設定しにくいため、Z3 solver は solver unavailable 表示または別配信を検討する。

## フェーズ 7: 検証

実装フェーズでは、少なくとも次を実行する。

```bash
npm test -- math-random-predictor
npm run check
npm run build
```

検証観点:

- Node.js 24 の固定 seed ベクトルに一致する。
- 64 件境界で観測順が崩れない。
- 不正入力が仕様どおりエラーになる。
- `unknown` / 候補数過多 / timeout が UI 状態に反映される。
- Z3 solver が必要な機能では、SharedArrayBuffer 不可環境で solver unavailable 表示になる。
- 推論モードとデモモードで同じ core を使う。

## 初版スコープ

初版で狙うもの:

- Node.js 24 の `v8-node-24-cache-lifo-state0`
- Chrome Stable 148 の `v8-chrome-148-cache-lifo-sum` model metadata（solver は後続でもよい）
- 生系列の厳密観測値
- 理論値計算
- Node / browser で共有できる raw solver adapter
- ブラウザ solver の feasibility 確認
- browser solver が動く段階での最小検証 UI
- モデル説明カード用 metadata

初版では見送るもの:

- 生系列と変換系列の同時比較
- 丸め・表示桁不足の区間制約
- SpiderMonkey / JavaScriptCore の精密 solver
- `v8-chrome-148-cache-lifo-sum` の精密 solver
- `v8-legacy-*` の精密 solver
- グラフ表示
- ファイル import / export

## 実装前チェックリスト

- [ ] `ALGORITHM_SURVEY.md` の未確認事項を見直した
- [ ] `v8-node-24-cache-lifo-state0` / `v8-chrome-148-cache-lifo-sum` の参照 V8 revision を固定した
- [x] Node.js の固定 seed ベクトルを保存した
- [x] 64 件境界の順序検証を完了した
- [x] model metadata に出力変換と cache 有無を記録した
- [x] `v8-legacy-*` を初版に混ぜない判断を確認した
- [x] SolverAdapter の戻り値型を決めた
- [x] `v8-node-24-cache-lifo-state0` raw solver を GF(2) 線形方程式で実装した
- [ ] browser solver の動作確認に必要な最小 UI の範囲を決めた

## リスク

- ブラウザや Node.js の V8 revision 差で単一の V8 モデル ID にまとめられない。実装時点では Node.js 24 と Chrome Stable 148 で出力変換差が確認済み。
- 旧 V8 の cache/LIFO を現行 V8 と混同すると、観測順の制約が誤る。
- JavaScriptCore は JIT path 差分がありうるため、`WeakRandom` だけを見て exact と断定しない。
- SpiderMonkey / JavaScriptCore は固定 seed の実測が難しい可能性がある。
- Z3 browser 実行が必要な機能では、GitHub Pages で必要な isolation header を付けられない可能性がある。

## 参考リンク

- [Z3 JavaScript API documentation](https://z3prover.github.io/api/html/js/index.html)
- [Z3 JavaScript examples in Z3Guide](https://microsoft.github.io/z3guide/programming/Z3%20JavaScript%20Examples/)
- [PwnFunction/v8-randomness-predictor](https://github.com/PwnFunction/v8-randomness-predictor)
- [V8 Math.random blog](https://v8.dev/blog/math-random)
- [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md)
- [SpiderMonkey jsmath.cpp](https://searchfox.org/mozilla-central/source/js/src/jsmath.cpp)
- [SpiderMonkey XorShift128PlusRNG.h](https://searchfox.org/mozilla-central/source/mfbt/XorShift128PlusRNG.h)
- [JavaScriptCore WeakRandom.h](https://github.com/WebKit/WebKit/blob/main/Source/WTF/wtf/WeakRandom.h)
- [JavaScriptCore MathObject.cpp](https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/runtime/MathObject.cpp)
