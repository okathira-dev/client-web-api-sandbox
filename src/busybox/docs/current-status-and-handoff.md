# 現状・残問題・人手確認への引継ぎ

更新日: 2026-08-16

この文書は、現在の実装をコミットした時点での「できていること」「人手で確認すること」「次の設計課題」を一つにまとめた引継ぎメモである。結論を決めるときは、コードとこの文書を入口にし、古い計画表の件数・箱番号・成功条件を再利用しない。

## 現在の正本

| 内容 | 正本 |
| --- | --- |
| ステージと問題箱のID | `src/busybox/domain/stages.ts`、`src/busybox/runtime/stageDefinitions.ts` |
| 現行プレイヤー体験と解法 | 各`src/busybox/stages/S-xxx.tsx`の日本語JSDoc（[互換ポインタ](./stage-walkthroughs.md)） |
| 実装・未確認・外部条件の状態 | [ステージ実装状況](./stage-implementation-status.md) |
| 実機・ブラウザ確認項目 | [人手確認台帳](./human-test-matrix.md) |
| 自動検証の証跡 | [検証記録](./verification-record.md) |
| 仕様決定の履歴 | [決定ログ](./decision-log.md) |

現行catalogueは67ステージで、S-230・S-270・S-680は製品stageではない。S-350のPiPはS-350-B06、S-810は4つの目標アスペクト比へnative seekする可変寸法スイープ、S-640は8問の文字化け、S-720は実変換patch bayである。

## 今回コミットする実装

- S-030-B02を削除してSelection APIのB01だけにし、S-150をpointer-inert button・native select typeahead・named detailsのキーボード操作へ再構成した。
- S-060-B02はonlineの単純投函を拒否し、offlineかつService Worker制御下でのみBeaconを投函できるようにした。S-220の分岐ガイド、S-580のen-US認識、S-660の入場時自動Pressure観測、S-510の実ファイル／iframe drop分離も反映した。各stageの解法はstage隣接JSDocを正本とする。
- S-640を8問の文字化け問題へ整理し、元の符号化で復号した文字列を一つの共通入力欄へ入力する形にした。
- 製品で入力する固定flagは小文字の`busybox{...}`へ統一し、S-720のQR fixtureも再生成した。
- S-710へClipPress風のsame-origin iframe、10秒camera録画、160kbps固定bitrate圧縮、暗黒frame・QR frame・decode失敗・再入力metadataの4経路を実装した。QRは同梱jsQRで検出し、検出した四辺形へflag QRを射影して置換する。
- S-710の暗黒frameとQR frameを生成script、manifest、意味検証test付きの製品fixtureへ昇格した。decode失敗時は固定outputだけを配布し、入力用の壊れたfixtureはゲーム画面から提供しない。
- S-720を動画3ノード、T1/T2/T3の2列、outputノードのpatch bayへ変更した。source→output直結、変換の連結、同一変換の2回使用を許可し、分岐とcycleを拒否する。接続された経路をMediaBunnyとCanvasで実変換する。
- S-810は事前生成した120個のVP8 WebM segmentをpack assetとmanifestとしてGit管理し、MSEへtimestamp offset付きで追加するnative寸法スイープへ変更した。native controlsでシークを止めた提示frameの比率を`videoWidth` / `videoHeight`から読み、1:1、4:3、16:9、9:20（各相対5%以内）の4箱を開く。通常再生・pause・CSS寸法は解法にせず、ページにはscript自動seek経路を置かない。
- 設定ページから第三者ライセンスページへ到達できるようにし、共通app shellを広げた。
- 現行解法仕様、人手確認台帳、ステージ実装状況のS-640/S-710/S-720/S-810記載を更新した。

## 自動検証済み

- TypeScript型検査: 合格
- Jest: 48 suites / 298 tests 合格
- Biome: Node 24.14.0の`npm run check`で447 files 合格（既存のschema warningとoptional-chain infoのみ）
- Markuplint: `src` の JSX / HTML 合格
- Vite production build: Node 24.14.0で合格（既存のnative config、browser externalization、chunk size warningのみ）
- S-710 fixture: 10秒、暗黒frameの画素上限、QR payload、WebM構造を検証
- S-640 fixture: 8問、元encoding・誤表示encoding、回答重複なし、fatal decodeを検証
- S-720 route: 4正規経路、T1/T2/T3、cycle拒否、経路判定を単体検証
- S-810 capability probe: `resize`、`seeked`、`requestVideoFrameCallback()`を要求する。固定packの4比率シーク停止による実開箱はWindows Chromeで再確認する
- ソースコード内の絶対Windowsパス検索: 該当なし
- ライセンス配布test: jsQR、MediaBunny、GNU Unifontの同一内容を検証

## 直近の動作確認手順

開発サーバーを起動してBusyboxへ入り、次の順で確認する。確認結果は日付、OS、browser版、通常tab/PWA、コンソールエラーとともに記録する。

### 共通UI・設定

1. 一覧、地図、stage直接URL、戻る・進む、再入場で箱の今回状態と永続進捗が混ざらないことを確認する。
2. 200%拡大、狭い画面、キーボード操作、音なしで箱の状態と操作箇所が分かることを確認する。
3. 設定ページから第三者ライセンスページを開き、jsQR、MediaBunny、Unifontのリンクと本文が読めることを確認する。

### S-640

1. 8枚の問題cardと一つの回答欄だけが表示されることを確認する。
2. 各問題で、誤表示された文字列を表示encodingでbytesへ戻し、元encodingで復号した文字列を入力する。
3. 文字コード名、別問題の回答、空白を変えた回答では開かないことを確認する。
4. 再入場、reset、日英切替、長い回答の折返しを確認する。

### S-710

fixtureは`src/busybox/fixtures/s710/assets/`にある。

1. `dark-frame-input.webm`を入力し、変換後の暗黒frameだけが白文字へ差し替わることを確認する。
2. `qr-frame-input.webm`を入力し、downscaleした同じframe単位でQRがflag QRへ差し替わることを確認する。
3. 動画でない壊れたfileを入力し、通常のInsertable Streams変換ではなく固定のdecode失敗outputが返ることを確認する。
4. 10秒録画を開始し、REC表示、カウントダウン、停止、録画fileの変換、camera track停止を確認する。
5. 変換後の実file sizeと入力比、download、output再生を確認する。
6. 変換済みWebMを再入力し、SimpleTagを根拠に全frame overlayが出ることを確認する。file名や拡張子だけでは発火しないことも確認する。
7. QR検出はBarcode Detection APIではなく、同梱jsQRで端末差なく動くことを確認する。

### S-720

1. source 3個、T1/T2/T3各2個、output 1個が固定表示されることを確認する。
2. outを選んで任意のinへ接続でき、同じoutの分岐、cycle、同じinへの競合接続は成立しないことを確認する。
3. 次の4経路を接続し、output動画が実変換後の映像になることを確認する。
   - `VIDEO 1 → T1 → OUTPUT`
   - `VIDEO 2 → T2 → OUTPUT`
   - `VIDEO 3 → T3 → T2 → OUTPUT`
   - `VIDEO 3 → T1 → T3 → T2 → T1 → OUTPUT`
4. output動画が全frame再生され、QRを読み取れることを確認する。
5. 読み取った固定flagを共通欄へ入力し、該当経路の箱だけが開くことを確認する。
6. 直接`VIDEO → OUTPUT`、不完全経路、誤った変換順、再接続、離脱時object URL破棄を確認する。

### S-810

1. 「スウィープ動画を読み込む」を押し、固定assetの構築後にnative controlsでシークを止める。
2. 表示される`videoWidth` / `videoHeight`を見ながら、1:1、4:3、16:9、9:20の比率（各相対5%以内）でシークを止め、B01〜B04がそれぞれ開くことを確認する。
3. 通常再生、pauseだけ、CSSの表示サイズ変更、読み込み前の操作では開かず、reload・離脱でcallbackとobject URLが残らないことを確認する。
4. 再生成、pause、ended、reload、離脱でcallbackとobject URLが残らないことを確認する。

## 未確認・残問題

### 必ず次の動作確認で見るもの

- S-640 8問の実ブラウザ表示、共通入力欄、正答・誤答、再入場。
- S-710はWindows ChromeでQR置換とdecode失敗を確認済み。暗黒frame、metadata再入力、camera録画、size比、download、連続試行を追加確認する。
- S-720はWindows ChromeでT1 routeとlowercase flagを確認済み。残り3正規route、全frame再生、QR読取、分岐・cycle拒否、mobile横幅を確認する。
- S-810は固定pack経路へ変更したため、Windows Chromeで4比率のシーク停止による開箱を再確認する。通常再生・pauseだけでは開かず、ended、reload、離脱でcallbackとobject URLが残らないことも同時に確認する。
- S-350のB01〜B06/B08、S-060-B02、S-150、S-220、S-580など、以前にPoCで確認した中心経路を製品stageで再確認する。
- 全stage共通のH-025（再入場、今回開いた箱、永続進捗、reset）とH-019（生データ非送信）。

### 対応環境が必要なもの

- S-430 Audio Session: 現ChromeではAPIがなく、Safari/WebKit実機で再調査する。
- S-480 User Preferences API: 現Chromeでは未提供。CSS模倣で代替しない。
- S-630 Network Information: `connection.type`がないため、対応Android/ChromeOS以外で推定しない。
- S-700 Remote Playback / Barcode Detection / Presentation: receiver画面と外部画面が必要。S-700のQR箱だけは実`BarcodeDetector`を使い、S-710/S-720のQRとは混同しない。
- S-730 WebXR: 対応XR機器、immersive session、実input sourceが必要。
- S-740 Periodic Background Sync: installed PWA、公開HTTPS、実scheduler、window client 0件が必要。timer・通知・foregroundで代替しない。
- S-750 WebOTP / iOS AutoFill: 実SMSとAndroid/iOS実機が必要。手入力・pasteでは開かない。
- S-760 Contact Picker: 対応Android実機と架空contactが必要。
- S-770 FedCM: 公式provider、RP client、実account、browser所有chooserが必要。provider・token・backendを推測で追加しない。
- S-780 Payment Handler: local PoCでmethod URLの`Link` header、manifest、Service Worker、handler window、承認・拒否・retryの3箱を実装・foreground Chromeで確認済み。handler windowの選択は経路に固定しない。公開時はheaderを供給できるoriginが必要。
- S-790 Local Font Access: 対応desktop Chromium、OSへの専用font install、実font照会が必要。

### 設計・品質上の記録と残問題

1. **stage-gimmick-jsdoc** — 67 stageのdefault component直前に、目的・最初の一手・箱ごとの解法・negative case・API・privacy・cleanup・対応環境・人手確認を日本語で記載した。`stageDocumentation.test.ts`が件数と見出しを監査する。
2. **localeとJSDocの境界** — JSDocの説明を表示文言の代替にせず、localeはUI、JSDocは実装意図と解法の開発者向け正本にする。`stage-walkthroughs.md`は互換ポインタへ縮約し、決定履歴、PoC証跡、公開前人手確認項目は残す。
3. **S-810固定assetの再生互換性** — pack内segmentをMSEへ追加する経路は固定asset化済み。単一WebMの直接再生へ置き換えるかどうかは、`seeked`後の4比率実測を失わないことを確認してから別途判断する。
4. **S-720期待assetの整理** — 最新POC-022の二値照合に必要な期待assetは残し、旧候補が製品stageや最新PoCから参照されなくなった時点で生成script・manifest・testと一緒に削除する。
5. **S-710 fixtureの配布境界** — B01/B03 fixtureはGit管理するが、ゲーム画面から直接配布すると謎を先に見せる。ローカル動作確認用としてrepoに置く現状を維持するか、開発専用のfixture indexを用意するかを決める。
6. **実装の重さと対応差** — S-710/S-720/S-810のMediaBunny処理、Canvas frame変換、object URL、camera track、callbackの負荷と中断を、低性能desktop・mobile・連続再試行で確認する。
7. **アクセシビリティと入力経路** — S-720のケーブル接続がmouseだけでなくkeyboard・touchでも説明可能か、S-810のnative controlsと寸法変化が音なし・読み上げでも理解できるかを確認する。
8. **commit衛生** — absolute path、個人情報、生成途中の一時file、不要な壊れた入力fixture、第三者ライセンス本文の改変がないことを確認する。`package-lock.json`の差分はTakumi Guard依存更新と一致するかを確認する。

## 古い資料の扱い

PoC結果、決定ログ、Deep Research元案、Blackbox監査は、なぜ現在の設計になったかを追跡する証跡なので残す。ただし、現行の箱番号・成功条件・件数をそこから導かない。

現行の解法説明は各stage隣接JSDoc（互換リンクは[現行ステージ解法仕様](./stage-walkthroughs.md)）、現行の進捗は[ステージ実装状況](./stage-implementation-status.md)、次の作業はこの文書へ集約する。資料の入口と履歴／現行の境界は[ドキュメント入口](./README.md)で確認する。JSDocとlocaleの全件監査は完了しており、`gimmick-backlog.md`と`gimmick-coverage-plan.md`は履歴として保持する。

## 完了の定義

- 自動検証が通る。
- 必須人手確認に実施環境・期待結果・実結果が記録される。
- 対応環境外では誤開箱せず、アプリ全体を壊さない。
- UI文言がstage-localizationと共通localeへ分離される。
- 日本語JSDocが各stageにあり、解法・negative case・privacy・cleanupが抜けない。
- 現行説明と履歴資料の境界がREADMEとファイル先頭で明確である。
