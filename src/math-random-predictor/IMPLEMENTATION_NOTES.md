# Math.random 推測・検証ツール — 実装調査メモ

本書は実装時に確認すべき技術メモをまとめる。製品仕様は [SPEC.md](./SPEC.md)、エンジン別 `Math.random()` 実装調査は [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md)、実装全体の流れは [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) を参照する。

## 1. Solver 方針

現行の `v8-node-24-cache-lifo-state0` raw observation solver は、[z3-solver](https://z3prover.github.io/api/html/js/index.html) ではなく GF(2) 線形方程式として実装する。

- `state0 >> 11` の 53bit raw 観測は、128bit state に対する bit 単位の線形等式として扱える。
- `maxCandidates` が数値なら preview として指定件数で打ち切る。
- `maxCandidates: "all"` なら、自由変数が多すぎない範囲で internal state 候補を全列挙する。
- 全列挙が大きすぎる場合は `unknown` と理由を返す。
- 実推論が重い場合は、SPEC の通り理論候補数・推定残り観測数を先に表示し、solver 結果は後から併記する。
- solver API を直接 UI に露出せず、core から `SolverAdapter` を介して呼ぶ。Node / browser で同じ raw solver を使える形へ整理する。
- ブラウザ UI は solver が実際に動く前提を確認してから作る。実推論なしの UI を先行せず、必要になった時点で solver 結合テスト用の薄い UI から始める。

Z3 は、次のような線形等式だけでは扱いにくい機能で再検討する。

- `Math.floor(Math.random() * N)` の区間制約
- 丸め・表示桁不足の区間制約
- `state0 + state1` の carry を含む出力変換
- 他エンジン・legacy モデルで bit-level SMT のほうが簡潔な場合

参考:

- [Z3 JavaScript API documentation](https://z3prover.github.io/api/html/js/index.html)
- [Z3 JavaScript examples in Z3Guide](https://microsoft.github.io/z3guide/programming/Z3%20JavaScript%20Examples/)
- [microsoft/z3guide](https://github.com/microsoft/z3guide)

## 2. ブラウザ実行と SharedArrayBuffer

現行 raw solver は pure TypeScript 実装なので、ブラウザ実行に `SharedArrayBuffer` は不要な見込みである。Z3 を使う機能を追加する場合のみ、`z3-solver` の threads 要件により `SharedArrayBuffer` を使える環境が必要になる。

ブラウザで `SharedArrayBuffer` を使うには、ページが secure context かつ cross-origin isolated である必要がある。典型的には次のレスポンスヘッダが必要。

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Z3 solver を実行する場合は `crossOriginIsolated` を確認し、false の場合はその solver 機能が使えない状態として明示する。pure TS raw solver だけで成立する範囲では、SharedArrayBuffer 不可を blocker にしない。

参考:

- [MDN: SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [MDN: WorkerGlobalScope.crossOriginIsolated](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/crossOriginIsolated)

## 3. GitHub Pages 配信時の注意

GitHub Pages では任意の HTTP レスポンスヘッダを直接設定しづらいため、COOP / COEP が必要な WASM + threads 構成では工夫が必要になる。

候補:

1. **coi-serviceworker を使う**
   - GitHub Pages のような静的ホスティング上で cross-origin isolation を成立させるための workaround。
   - 初回ロード時に service worker 登録と再読み込みが発生する。
   - デモ用途には有力。ただし複雑な service worker 連携が必要な場合は注意。
2. **Z3 を使うページだけ別配信にする**
   - GitHub Pages ではなく、ヘッダ設定可能な配信先を使う。
   - 例: Cloudflare Pages / Netlify / Firebase Hosting など、headers 設定が可能なホスティング。
3. **環境エラーとして明示する**
   - cross-origin isolation がない環境では、Z3 が必要な精密推論が利用できないことを表示する。
   - 理論値だけでアプリを成立させる設計は初版の主目的にしない。

参考:

- [Wasmer: Patching COOP/COEP Headers for GitHub Pages Deployment](https://docs.wasmer.io/sdk/wasmer-js/how-to/coop-coep-headers/)
- [z3-solver JavaScript docs](https://z3prover.github.io/api/html/js/index.html)

## 4. TDD 実装方針

Web UI を先に作るのではなく、t-wada 流のテストドリブンで必要な関数を小さく実装していく。UI は core / solver の contract が固まり、ブラウザ solver の動作確認に必要になってから追加する。

初期の実装順:

1. **PRNG モデルの純粋関数**
   - `nextState`
   - `toMathRandomNumber`
   - `floorRandom`
   - モデル説明カード用 metadata
2. **観測値パーサ**
   - 生系列の 10 進文字列を JS `Number` として parse
   - 変換系列の整数と `N` の検証
3. **理論値計算**
   - 理論候補数
   - 残り不確実性 bit
   - 推定残り観測数
4. **制約生成**
   - solver を呼ばず、観測からどの制約を作るかをテスト
5. **Solver adapter**
   - raw observation は GF(2) 線形 solver で Node テスト
   - 後で browser でも同じ solver contract を使える境界を確認
6. **候補列挙・一意性確認**
   - `unique` / `multiple` / `unsat` / `unknown`
   - 候補数過多
   - 「候補あり・一意性未確認」などの部分状態

まずは V8 モデル 1 つ、生系列の厳密観測値のみで PoC を作り、候補数・一意性確認・候補数過多・途中結果の実際の挙動を観察する。

## 5. 生系列の 10 進入力と厳密観測値

初版では、`Math.random()` の観測値を「厳密な JS `Number`」として扱う。

- ユーザー入力は 10 進文字列。
- `Number(text)` で parse した JS `Number` を観測値とする。
- `Number.prototype.toString()` が返す 10 進表記は、同じ JS `Number` へ round-trip できる。
- したがって、ユーザーが `Math.random()` の返した JS `Number` を十分な 10 進表記で入力するインターフェイスとして、10 進文字列は十分である。

注意:

- これは「10 進の数学的実数を JS が厳密に保持する」という意味ではない。
- `0.1` のような 10 進小数を JS が数学的に厳密保持できるか、という問題とは逆向きである。
- 今回の関心は「既に JS `Number` として観測された値を、10 進文字列で同じ JS `Number` に戻せるか」である。

丸め・切り捨て・表示桁不足を区間制約として扱う推論は将来拡張とする。

参考:

- [MDN: Number.prototype.toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)

## 6. exact モデルと参照情報

選択したモデルが対象環境の状態遷移・出力変換・出力順序と一致している場合、推論はそのモデルに対して exact に扱える。

各モデルには、次の metadata を持たせる。

- モデル ID / 表示名
- 対象環境例
- 参照ソースコード URL
- commit / tag / revision
- 状態サイズ
- 出力変換
- 出力順序（キャッシュや LIFO など）
- 出力時に失われる bit
- 必要観測数の目安
- 既知サンプルベクトル

Node と Chromium の V8 が同じモデルでよいかは、参照する V8 ソース・Node に同梱された V8・実測ベクトルで確認する。実装時点では差分が確認できたため、UI 実装時は `v8-node-*` / `v8-chrome-*` のように分けられる registry 設計にする。

モデル ID、対象バージョン、出力変換、観測順序、実装ソースリンクは [ALGORITHM_SURVEY.md](./ALGORITHM_SURVEY.md) に集約する。このメモでは、solver 境界やブラウザ実行制約など実装時の判断だけを扱う。

## 7. 変換系列と `N`

変換系列は `Math.floor(Math.random() * N)` の結果だけを観測する。

- `N` はユーザーが観測条件として指定する。
- 入力値は `0..N-1` の整数のみ受け付ける。
- `N` の指定ミスはユーザーの観測条件指定ミスとして扱い、初版では特別な診断対象にしない。

制約としては、観測値 `k` に対して元の生乱数が `[k/N, (k+1)/N)` に入ることを表す。ただし初版では、入力された `k` と `N` 自体は厳密観測条件として扱う。
