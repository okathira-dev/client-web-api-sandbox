# テストと依存ライブラリ

## テスト

```bash
npm run test:ci
```

WebCodecs は Node.js で動かないため、単体テストの対象は純粋関数のみ。

- [../domain/plan.test.ts](../domain/plan.test.ts): 候補行列の件数・ID の一意性・codec string の形式
- [../domain/synthetic.test.ts](../domain/synthetic.test.ts): 合成パターンの決定性・位相の連続・クリップしないこと
- [../workers/liveAudio.test.ts](../workers/liveAudio.test.ts): キャプチャ音声のチャンネル割り当て・リサンプル・詰め替え
- [../domain/report.test.ts](../domain/report.test.ts): 完了判定・`previousCompleted` フォールバック・ファミリー集計
- [../domain/filters.test.ts](../domain/filters.test.ts): 絞り込み述語
- [../domain/backendInference.test.ts](../domain/backendInference.test.ts): `no-preference` の実体推定
- [../domain/sustained.test.ts](../domain/sustained.test.ts): 実用継続検査が抱えるメモリの見積り
- [../domain/export.test.ts](../domain/export.test.ts): 書き出しの封筒と持ち出さない項目
- [../utils/preferences.test.ts](../utils/preferences.test.ts): 設定値の検証

エンコード・デコード・多重化の実処理はブラウザーでの手動確認による。

## 使用ライブラリ

- [mediabunny](https://github.com/Vanilagy/mediabunny) (MPL-2.0): mp4 / webm への多重化
- [@tanstack/react-virtual](https://tanstack.com/virtual) (MIT): 結果一覧の仮想化
