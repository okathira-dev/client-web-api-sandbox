# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### 未実装候補の個別PoC整備

既存ステージの人手確認は `current-status-and-handoff.md` の待機列へ残し、現在は未実装候補のPoCを先にコード化する。feature detectionや模擬eventだけではPASSにせず、API固有のbrowser／OS所有動作を実測できた候補だけを製品実装へ昇格する。

全残存PoCの対象、実装順、肯定条件、negative case、cleanup、commit境界は `src/busybox/docs/remaining-poc-implementation-plan.md` を現行計画とする。

- [x] 承認済み未実装候補を、既存stage追加箱と新規stageの両方から棚卸し
- [x] 新規PoCを巨大な`poc/main.ts`へ直書きせず、case単位のmoduleとlazy registryへ分離できる最小基盤を作る
- [x] 各PoCに前提環境、操作手順、肯定条件、negative case、cleanup、PASS／PARTIAL／FAIL記録欄を持たせる（対応機器が必要なものは実行待ち表示）
- [x] Wave A実装: S-690／S-800のText Fragment 2体験を別fixtureで比較し、`beforematch`観測を隔離ページへ追加した（Back／reloadの人手確認は未実施）
- [x] Wave A実装: S-790のLocal Font Accessをdesktop Chromium向けに再PoCし、限定`queryLocalFonts()`、permission、`FontData.blob()`、Blob由来glyph、revokeを検証する入口を追加した（専用OTF install／uninstallは未実施）
- [x] Wave A実装: S-480-B05〜B09のUser Preferences APIを専用documentでPoCし、5 preferenceのoverride、実効media query、clearを検証する入口を追加した（対応browserでの実overrideは未実施）
- [x] S-810をnative seek停止後の4アスペクト比（各相対5%以内）判定へ変更し、固定fixture・manifest・単体テスト・解法資料を更新した（H-053の人手確認は未実施）
- [x] Wave B実装: S-430-B02 Audio Session、S-630 Network Information、S-750 WebOTP／OTP AutoFill、S-760 Contact Pickerを実機待ち可能な独立PoCとして用意した
- [x] Wave C実装: S-780 Payment Handlerをstatic worker／manifestで構成し、trusted eventを証跡として、承認・拒否・同一handler retryの3箱入口を用意した（正しい財布箱は再挑戦しにくいため削除。2026-08-17に技術検証PoC・stage PoCをforeground Chromeで確認済み）
- [x] Wave C実装: S-740 Periodic Background Syncをcare store、client 0件event、asset取得、unregisterの実scheduler待ち構成にした
- [x] Wave D実装: S-700 Remote Playback／BarcodeDetector／Presentation receiverとS-730 WebXRを、外部機器でしかPASSにならないPoCとして用意した
- [x] Wave E実装枠: S-770は公式provider監査待ちとして、通常OAuthへ迂回しないFedCM chooser入口だけを用意した
- [x] 各Wave完了時に`poc-latest.md`、`poc-results.md`、`human-test-matrix.md`を更新し、旧候補や模擬成功経路を残さない
- [x] Node 24で対象test、`npm run check`、`npm run test:ci`、buildを実行し、固定asset、license、秘密情報、絶対pathを監査した（48 suites / 298 tests、447 files、絶対path該当なし）

### 今回の検証結果

- `npm run check`、`npm run test:ci`、`npm run build` はNode 24.14.0で合格。
- Biomeには既存のconfig schema 2.5.5 / CLI 2.5.6 warningと、`jest.setup.ts`のoptional-chain infoだけ残る。今回の変更由来ではない。
- Wave Aの実API挙動、専用OTF install、S-810の4比率実開箱は人手確認待ち。未対応環境でPASSへ昇格しない。
- POCページをブラウザで再読込し、16件すべてのlazy caseが開閉・mountできること、POC-012のunsupported、POC-028のhandler登録・技術検証PoC・stage PoC、POC-034のaudioTracks unsupportedを確認。ページconsole errorなし。
- Periodic Background Syncはpermission deniedをpartialとして記録する。Payment HandlerはlocalのLink header、manifest、worker、handler window、承認・拒否・retryの3箱を技術検証PoC・stage PoCとも確認済み。FedCM／Presentation／XR／Contact Picker／WebOTP／Remote Playback／Audio Sessionの肯定証拠は実機・外部条件待ち。
- Periodic SyncとPayment Handlerのstatic workerはそれぞれ`/busybox/poc/periodic/`と`/busybox/poc/payment/`へ分離し、scope競合をなくした。Payment Handlerのworker応答は`PaymentHandlerResponse`形式へ修正した。

## 正本への参照

- 最新PoC索引: `src/busybox/docs/poc-latest.md`
- 現状・残問題・確認順: `src/busybox/docs/current-status-and-handoff.md`
- 現行解法: 各`S-xxx.tsx`のdefault component直前にある日本語JSDoc
- 実装状態: `src/busybox/docs/stage-implementation-status.md`
- 人手確認: `src/busybox/docs/human-test-matrix.md`
- 自動検証: `src/busybox/docs/verification-record.md`
