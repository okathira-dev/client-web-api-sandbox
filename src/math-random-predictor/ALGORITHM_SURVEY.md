# Math.random アルゴリズム調査

本書は `Math.random()` 推測・検証ツールで exact モデルを作るための根拠を整理する。ECMAScript は `Math.random()` のアルゴリズムを規定しないため、各エンジンの実装・バージョン・出力順序を確認してからモデル ID を固定する。

## 前提

[ECMAScript 仕様の `Math.random`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.random) は、`0` 以上 `1` 未満の `Number` を返すことを定めるが、乱数生成アルゴリズムや seed の扱いは実装依存である。したがって、このアプリの「exact」は JavaScript 全般に対する exact ではなく、参照したエンジン実装・revision・出力順序に対する exact を意味する。

## アルゴリズム ID 方針

時期・実装経路・出力変換・キャッシュ順序が観測値に影響する場合は、同じ UI 選択肢の内部オプションにはせず、別アルゴリズム ID として扱う。

| ID 案 | 対象 | 初版扱い | メモ |
| --- | --- | --- | --- |
| `v8-node-24-cache-lifo-state0` | Node.js 24.16.0 / V8 13.6.233.17-node.49 | 実装済み | 64 件 cache を LIFO で観測。出力は `ToDouble(state.s0)` |
| `v8-chrome-148-cache-lifo-sum` | Chrome Stable 148.0.7778.217 / V8 commit `5e24a1fd...` | 次候補 | 64 件 cache を LIFO で観測。出力は `ToDouble(random = state0 + state1)` |
| `v8-main-direct` | V8 upstream main の 64-bit direct path | 追跡候補 | `math.tq` の 64-bit 直接生成経路。Chrome stable と一致するとは限らない |
| `v8-legacy-cache-lifo` | cache pool を 64 個使う古い V8 / PwnFunction 型 | 後続候補 | 観測列 reverse が必要な可能性あり |
| `v8-legacy-state0-mantissa` | V8 v7.1 付近の `state0 >> 12` 型 | 後続候補 | PwnFunction の制約式がこの型に近い |
| `v8-legacy-mwc1616` | V8 4.9.40 以前 | 後続候補 | MWC1616。Chrome 49 以前 |
| `spidermonkey-current` | 最新 Firefox / SpiderMonkey | 後続候補 | xorshift128+。出力変換と seed を実測確認する |
| `javascriptcore-current` | 最新 Safari / JavaScriptCore | 後続候補 | `WeakRandom`。JIT path 差分に注意 |

## 要約

| 系統 | 代表環境 | 現行アルゴリズム | 状態 | 出力変換 | cache / 順序 | 主要ソース |
| --- | --- | --- | --- | --- | --- | --- |
| V8 / Node.js 24 | Node.js 24.16.0 | xorshift128+ | 64-bit x 2 | `state.s0 >> 11` / `2**53` | 64 件 cache / LIFO | [Node v24.16.0 `math-random.cc`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/numbers/math-random.cc), [Node v24.16.0 RNG header](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.h), [Node v24.16.0 RNG impl](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.cc) |
| V8 / Chrome 148 | Chrome Stable 148.0.7778.217 | xorshift128+ | 64-bit x 2 | `(state0 + state1) >> 11` / `2**53` | 64 件 cache / LIFO | [Chromium Dash release metadata](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1), [V8 `math-random.cc` at `5e24a1fd`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/numbers/math-random.cc), [V8 RNG at `5e24a1fd`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/base/utils/random-number-generator.h) |
| V8 upstream main | V8 main branch | xorshift128+ | 64-bit x 2 | `random >> 11` / `2**53` | 64-bit direct path の時期あり | [V8 `math.tq`](https://github.com/v8/v8/blob/main/src/builtins/math.tq), [V8 RNG](https://github.com/v8/v8/blob/main/src/base/utils/random-number-generator.h) |
| V8 legacy | 旧 Chrome / 旧 Node | MWC1616 または xorshift128+ 旧変換 | 実装時期依存 | 時期依存 | 64 個 pool / LIFO の可能性 | [V8 blog](https://v8.dev/blog/math-random), [PwnFunction](https://github.com/PwnFunction/v8-randomness-predictor) |
| SpiderMonkey | Firefox | xorshift128+ | 64-bit x 2 | `nextDouble()` | cache なしと見られるが実測確認 | [jsmath.cpp](https://searchfox.org/mozilla-central/source/js/src/jsmath.cpp), [XorShift128PlusRNG.h](https://searchfox.org/mozilla-central/source/mfbt/XorShift128PlusRNG.h) |
| JavaScriptCore | Safari | xorshift128+ 系 `WeakRandom` | 64-bit x 2 | `advance() & ((1ULL << 53) - 1)` / `2**53` | cache なしと見られる。JIT path 差分に注意 | [WeakRandom.h](https://github.com/WebKit/WebKit/blob/main/Source/WTF/wtf/WeakRandom.h), [MathObject.cpp](https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/runtime/MathObject.cpp) |

## V8 / Node.js / Chromium 系

### Node.js 24.16.0 / V8 13.6.233.17-node.49

CLI PoC の実装済みモデルは、Node.js 24.16.0 の同梱 V8 を対象にする。実行環境で確認した `process.versions.v8` は `13.6.233.17-node.49`。

- 想定モデル ID: `v8-node-24-cache-lifo-state0`
- 実装状況: CLI 実装済み
- 参照ソース:
  - [Node v24.16.0 `deps/v8/src/numbers/math-random.cc`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/numbers/math-random.cc)
  - [Node v24.16.0 `deps/v8/src/base/utils/random-number-generator.h`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.h)
  - [Node v24.16.0 `deps/v8/src/base/utils/random-number-generator.cc`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.cc)
- seed 初期化: `math-random.cc` で `MurmurHash3(seed)` と `MurmurHash3(~seed)` を `state.s0` / `state.s1` に設定
- 状態遷移: `XorShift128(&state.s0, &state.s1)`。Node v24.16.0 の `XorShift128` は戻り値を持たず state を更新する
- 出力変換: cache refill 時に `ToDouble(state.s0)`。`ToDouble` は `state0 >> 11` を `2**53` で割る
- 観測順序: `kCacheSize` は 64。cache は生成順に `0..63` へ保存され、`Math.random()` は index を 1 ずつ減らして取り出すため、観測順は生成順の逆（LIFO）

`node --random_seed=1337` の 70 件実測列はこのモデルで再現済み。

### Chrome Stable 148.0.7778.217 / V8 `5e24a1fd...`

2026-05-29 時点の Chromium Dash Windows Stable metadata では、Chrome `148.0.7778.217` の V8 commit は `5e24a1fd6ffb840b93ee90a800897fcb4d60eeab`。

- 想定モデル ID: `v8-chrome-148-cache-lifo-sum`
- 実装状況: ソース確認済み。CLI solver は未実装
- 参照ソース:
  - [Chromium Dash release metadata](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1)
  - [V8 `src/numbers/math-random.cc` at `5e24a1fd`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/numbers/math-random.cc)
  - [V8 `src/base/utils/random-number-generator.h` at `5e24a1fd`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/base/utils/random-number-generator.h)
  - [V8 `src/builtins/math.tq` at `5e24a1fd`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/builtins/math.tq)
- seed 初期化: `math-random.cc` で `MurmurHash3(seed)` と `MurmurHash3(~seed)` を `state.s0` / `state.s1` に設定
- 状態遷移: `XorShift128(&state.s0, &state.s1)`。この commit の `XorShift128` は `state0 + state1` を返す
- 出力変換: cache refill 時に `ToDouble(random)`。`random` は `XorShift128` の戻り値、つまり `state0 + state1`
- 観測順序: 64 件 cache / LIFO

Node.js 24 実装済みモデルとは、出力変換が `state.s0` か `state0 + state1` かで異なる。Chrome 実ブラウザの exact solver はこの差分を別モデルとして追加する。

### V8 upstream main の注意

V8 upstream main は stable Chrome や Node 同梱 V8 と同じ revision ではない。調査時点の [V8 `math.tq`](https://github.com/v8/v8/blob/main/src/builtins/math.tq) では 64-bit direct path が確認できる時期があるが、Chrome Stable 148 の V8 commit では cache 経路である。`main` branch だけを根拠に「最新 Chrome」と断定しない。

### seed 初期化

`math-random.cc` は state が `{0, 0}` のときに seed を初期化する。`--random_seed` 相当の V8 flag が指定されていればそれを使い、なければ isolate の RNG から seed を得る。その後、`MurmurHash3(seed)` と `MurmurHash3(~seed)` で 2 つの 64-bit state を作る。

Node.js では V8 flag として `--random_seed` を使った実測が可能である。Node.js 24 は [OpenJS Foundation の Node.js 24 リリース記事](https://openjsf.org/blog/nodejs-24-released)で V8 13.6 と説明されている。Node 側の同梱 V8 ソースにも [Node.js `deps/v8/src/base/utils/random-number-generator.h`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.h) があり、`>> 11` / `2**53` 型の `ToDouble` が確認できる。

### V8 の実装史

[V8 blog: There’s `Math.random()`, and then there’s `Math.random()`](https://v8.dev/blog/math-random) によると、V8 は late 2015 まで、V8 4.9.40 以前で MWC1616 を使っていた。その後 V8 4.9.41.0 で xorshift128+ に切り替わり、Chrome 49 から利用可能になった。また、V8 v7.1 で state0 のみを使う形へ調整されたと説明されている。

この履歴から、少なくとも次の legacy モデルを分けて扱う必要がある。

| ID 案 | 対象時期 | 実装 | 確認ソース |
| --- | --- | --- | --- |
| `v8-legacy-mwc1616` | V8 4.9.40 以前 / Chrome 49 より前 | MWC1616 | [V8 blog](https://v8.dev/blog/math-random) |
| `v8-legacy-xorshift128plus-pre-v71` | V8 4.9.41 以降、v7.1 より前 | xorshift128+。出力変換は revision 固定が必要 | [V8 blog](https://v8.dev/blog/math-random) |
| `v8-legacy-state0-mantissa` | V8 v7.1 付近 | `state0 >> 12` を mantissa に入れる型 | [PwnFunction](https://github.com/PwnFunction/v8-randomness-predictor), [V8 blog](https://v8.dev/blog/math-random) |
| `v8-node-24-cache-lifo-state0` | Node.js 24.16.0 | cache/LIFO。`ToDouble(state.s0)` | [Node v24.16.0 `math-random.cc`](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/numbers/math-random.cc), [Node v24.16.0 RNG](https://github.com/nodejs/node/blob/v24.16.0/deps/v8/src/base/utils/random-number-generator.h) |
| `v8-chrome-148-cache-lifo-sum` | Chrome Stable 148.0.7778.217 | cache/LIFO。`ToDouble(state0 + state1)` | [Chromium Dash](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1), [V8 `math-random.cc`](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/numbers/math-random.cc), [V8 RNG](https://chromium.googlesource.com/v8/v8/+/5e24a1fd6ffb840b93ee90a800897fcb4d60eeab/src/base/utils/random-number-generator.h) |

`v8-legacy-state0-mantissa` は PwnFunction 型の制約と相性がよいが、現行 V8 64-bit 経路とは出力変換が違う。実装時に混ぜない。

### PwnFunction 実装からの注意点

[PwnFunction/v8-randomness-predictor](https://github.com/PwnFunction/v8-randomness-predictor) は Chrome 102 / Node.js 18.2.0 で検証された Python + Z3 実装である。コード中では、V8 の entropy pool が 64 個で、値が LIFO で取り出されるため入力列を `sequence[::-1]` している。また、観測値に `1` を足して IEEE 754 double として解釈し、mantissa と `se_state0 >> 12` を比較している。

この実装は参考になるが、Node.js 24 / Chrome 148 の確認済みモデルとは出力変換が異なる可能性がある。PwnFunction 型は `v8-legacy-cache-lifo` または `v8-legacy-state0-mantissa` として別 ID にする。

### Node.js / Chrome / Edge の扱い

Node.js は同梱 V8 に従う。Chrome と Edge は Chromium 系で V8 を使うため、同じ V8 revision と同じ architecture / execution path であれば同じモデルで扱える。とはいえ、Node と Chromium の V8 revision がずれることはありうるため、初版のモデル説明カードには「確認した Node / Chrome / Edge version」と「V8 revision」を記録する。

## SpiderMonkey / Firefox

Firefox の SpiderMonkey では、[jsmath.cpp](https://searchfox.org/mozilla-central/source/js/src/jsmath.cpp) の `math_random_impl(cx)` が `cx->realm()->getOrCreateRandomNumberGenerator().nextDouble()` を返す。`getOrCreateRandomNumberGenerator` は seed を作り、`XorShift128PlusRNG` を初期化する。

[XorShift128PlusRNG.h](https://searchfox.org/mozilla-central/source/mfbt/XorShift128PlusRNG.h) は xorshift128+ PRNG を実装している。コメントでは Vigna の xorshift+ 論文を参照し、周期は `2**128 - 1` とされる。`nextDouble()` は `[0, 2**53)` の整数を選び `2**53` で割る方針である。

[Mozilla bug 322529](https://bugzilla.mozilla.org/show_bug.cgi?id=322529) は `Math.random()` をより良い XorShift128+ algorithm に upgrade する issue である。V8 blog でも Firefox が xorshift128+ に切り替えたことに触れている。

未確認点:

- Firefox の正確な切り替え version / release 日。
- `nextDouble()` が xorshift128+ のどの state / sum / bit slice を使うかの厳密な式。
- JIT / interpreter で差分がないか。
- seed を固定した実測方法。

## JavaScriptCore / Safari

JavaScriptCore では [MathObject.cpp](https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/runtime/MathObject.cpp) の `mathProtoFuncRandom` が `globalObject->weakRandomNumber()` を返す。乱数の本体は [WeakRandom.h](https://github.com/WebKit/WebKit/blob/main/Source/WTF/wtf/WeakRandom.h) の `WeakRandom` である。

`WeakRandom` は `m_low` と `m_high` の 2 つの 64-bit state を持つ。`advance()` は `m_low = y`, `m_high = nextState(x, y)` と進め、`m_high + m_low` を返す。`nextState(x, y)` は `x ^= x << 23`, `x ^= x >> 17`, `x ^= y ^ (y >> 26)` である。`get()` は `advance() & ((1ULL << 53) - 1)` を `2**53` で割る。

[WebKit PR #51077](https://github.com/WebKit/WebKit/pull/51077) では、JSC の `Math.random` JIT path が arithmetic right shift を使い、`WeakRandom::nextState` の logical right shift と異なる可能性が議論されている。つまり、Safari / JSC は同じ `WeakRandom` 系でも JIT path と non-JIT path の差分を確認する必要がある。

未確認点:

- Safari の正確な version ごとの実装変更履歴。
- PR #51077 の修正が含まれる WebKit / Safari version。
- `setRandomSeed()` を使える環境と、Safari 実ブラウザでの実測方法。
- JIT path 差分を別 ID にする必要があるか。

## 初版実装対象の判断

初版の exact solver 実装は、次の理由から V8 系を優先する。

- Node.js と Chromium 系ブラウザで広く使われている。
- 参照ソースが V8 の `math.tq` / `random-number-generator.h` に集約され、状態遷移と出力変換を追いやすい。
- Node.js では `--random_seed` による固定 seed 実測ができる。
- `state0 >> 11` 型の raw observation は GF(2) 線形方程式として扱いやすい。
- `state0 + state1` や区間制約など、線形等式だけで扱いにくいモデルでは Z3 などの SMT solver を後続候補にできる。

ただし、Node.js 24 と Chrome 148 でも出力変換に差があるため、単一の汎用 ID で exact モデルを固定しない。CLI と UI では `v8-node-24-cache-lifo-state0` のようなモデル ID をそのまま表示する。

## 実測検証計画

### Node.js / V8

1. `node --random_seed=1337 -e "console.log(Array.from({ length: 70 }, Math.random).join('\n'))"` で 70 件以上を取得する。
2. `process.versions.v8` と `process.version` を同時に記録する。
3. 先頭 5 件だけでなく、64 件境界をまたぐ 60-70 件目を検証ベクトルに含める。
4. `v8-node-24-cache-lifo-state0` の cache/LIFO 順で一致するかをテストする。

### Chromium / Chrome / Edge

1. DevTools で `navigator.userAgent`、`navigator.userAgentData` があれば brands / fullVersionList、`Array.from({ length: 70 }, Math.random)` を記録する。
2. V8 revision はブラウザ version から別途追跡し、確認できない場合は「未確認」と書く。
3. Node.js と同じ V8 model で説明できるかを確認する。

### Firefox

1. DevTools で user agent と 70 件の `Math.random()` 系列を記録する。
2. SpiderMonkey の source revision と Firefox version の対応を確認する。
3. xorshift128+ の出力変換式を source から固定してから solver 対象にする。

### Safari

1. Web Inspector で user agent と 70 件の `Math.random()` 系列を記録する。
2. JIT path と non-JIT path の差分が実ブラウザで観測されうるかを確認する。
3. WebKit revision と Safari version の対応を確認する。

## 未解決事項

- Node.js release と V8 revision の細かい対応表は、実装フェーズ前に Node release notes と `process.versions.v8` 実測で補完する。
- Chrome / Edge / Safari / Firefox の release version と engine source revision の対応は、各ブラウザの release notes または source tag で補完する。
- SpiderMonkey と JavaScriptCore の seed 固定方法は未確定。固定 seed が難しい場合、まずモデル実装から生成した既知 state ベクトルで検証する。
- 変換系列 `Math.floor(Math.random() * N)` の exact 制約は、各 raw `Math.random()` モデルが固まった後に追加する。
