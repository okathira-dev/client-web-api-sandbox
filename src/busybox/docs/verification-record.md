# 検証記録

## 2026-08-21 人手確認以外の残作業完遂

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | 89stage・204箱。S-430-B02、S-480追加5箱、S-630、S-700追加2箱、S-730〜S-770、S-790をID重複なしで統合し、6地図clusterを各15stage以下に維持 |
| stage documentation / locale | 合格 | 全89 `S-xxx.tsx`の隣接localeと9項目の日本語JSDocを`stageDocumentation.test.ts`で検証 |
| 固定fixture | 合格 | S-700の4 VP9 WebM、S-740の植物3 SVG、S-760の架空icon、S-790の独自TTFを製品assetへ追加。S-700は生成後frameをjsQRで復号し、S-790はtable・PostScript名・SHA-256を検証 |
| Google FedCM境界 | 合格（実accountはH-049） | Google GISの非空credentialかつ厳密な`select_by === "fedcm"`だけを受理するunit test、公開client IDの設定資料、GitHub Repository Secret経路を追加 |
| TypeScript | 合格 | Node 24.14.0の`tsc` |
| Jest | 合格 | 59 suites / 316 tests |
| Markuplint | 合格 | `src/**/*.{jsx,tsx,html}` 全対象 |
| Biome | 合格 | 560 files。schemaを2.5.6へ同期し、warning / infoなし |
| Vite production build | 合格 | 89stageのlazy chunkと新規固定assetを含むmulti-page build。configの`__dirname`を`import.meta.dirname`へ移行。ghostpdl browser externalizationと500 kB超chunk warningは既存構成 |
| path / secret / diff衛生 | 合格 | source・script・workflowの絶対workspace / user path 0、private key / client secret / refresh token / Google key形式0、一時拡張子0、staged / unstaged `git diff --check`合格、`package-lock.json`変更なし |
| 人手確認 | 保留 | 実API、専用機器、公開origin、実account、実SMS、OS contact / font、長期schedulerだけをH-040〜H-051等へ残した |

この節が現行コードに対する最新の自動検証結果である。下位の旧件数と未実装表現は当時の履歴であり、現行仕様の結論に使わない。

## 2026-08-21 S-690〜S-920製品stage統合

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | 82stage・184箱。S-920をcatalogue、lazy registry、stage manifest、stage map、locale registryへ重複なく統合 |
| stage documentation | 合格 | 全82 `S-xxx.tsx`に隣接localeと9項目の日本語JSDocを`stageDocumentation.test.ts`で検証 |
| 固定fixture | 合格 | S-880、S-900、S-910のasset、生成script、README、構造検証testをGit管理。S-900はFFmpeg生成の専用5 VP8 segmentを明示timestamp offsetでappendし、S-910は3記号をFFmpeg生成動画へ焼き込む。同一toolchainで2回生成しWebM TrackUID正規化後のbyte-for-byte一致を確認 |
| FFmpeg生成環境 | 合格 | WinGet版FFmpeg / FFprobe 8.0.1 full buildを生成時の環境変数だけで指定。実行パスをsource・manifestへ保存していない |
| TypeScript | 合格 | Node 24.14.0の`tsc` |
| Jest | 合格 | 54 suites / 309 tests。S-920固定treeの3終点、各部屋の最大3択、異なる手数・方向列を含む |
| Markuplint | 合格 | `src/**/*.{jsx,tsx,html}` 全対象 |
| Biome | 合格 | 508 files。既存のschema version infoと`jest.setup.ts` optional-chain warningのみ |
| Vite production build | 合格 | 82stageのlazy chunk（`S-920`を含む）と新規固定assetを含むmulti-page build。既存の`__dirname`、ghostpdl externalization、500 kB chunk warningのみ |
| S-920 browser | 合格（実端末総合確認はH-066） | production previewでiframe額縁と斜線外周を表示。B01のinline反転、B02のblock反転を確認。JavaScript座標測定を使わない影専用CSS anchor chainと、開いた実goalの`left / top / width / height`が3経路すべて差分0で一致 |
| 人手確認 | 保留 | H-054〜H-066を追加。Text Fragment、Pointer Lock、Idle、Document PiP、EditContext、FSA、MSE、runtime WebVTT、Popover迷路は実browserでの最終確認が必要 |

この節はS-690〜S-920統合時点の履歴である。

## 2026-08-20 POC-035〜054採否整理

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| 最終処遇の完全性 | 合格 | POC-035〜054の20件を、新規stage候補10件とstage不採用10件へ重複・欠落なく分類 |
| Deep Research台帳 | 合格 | D-148で変更した10件を採用から却下へ移し、既存の変則分類も5区分へ正規化。集計を採用38 / 重複50 / 統合11 / 保留1 / 却下45 = 145へ同期 |
| 既存stageとの差分 | 合格 | Fullscreen / MediaSource / WebVTTをS-350 / S-810の既存中心操作へ統合せず、独立stageとする理由をD-149へ記録 |
| 件数境界 | 合格 | この採否整理時点では、新規10stage候補・計19箱はID未予約・未実装であり、当時の69stage・159箱を変更していなかった |
| Markdown | 合格 | `git diff --check`。コード、fixture、catalogueは今回変更していないためTypeScript / Jest / buildは対象外 |

## 2026-08-16 S-810比率シーク・個別PoC追補

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| stage documentation audit | 合格 | 67個の`S-xxx.tsx`に隣接`S-xxx.locale.ts`、ja/en bundle、9項目の日本語JSDocを確認する`stageDocumentation.test.ts` |
| Jest | 合格 | 50 suites / 301 tests |
| TypeScript | 合格 | bundled TypeScript `--noEmit` |
| Biome | 合格 | Node 24.14.0の`npm run check`で447 filesをcheck（既存warning/infoのみ） |
| Markuplint | 合格 | `src/**/*.{jsx,tsx,html}` |
| Vite production build | 合格 | nvs defaultのNode 24.14.0でmulti-page build、S-710 tool、S-810固定packを含む |
| locale propagation | 合格 | Appの`document.documentElement.lang`、S-710 iframeの`locale` query、S-510 helperの`locale` query |
| metadata locale registry | 合格 | `StageSpec` / `ProblemSpec`から表示名を切り離し、67隣接locale bundleの`stageName` / `Bxx`を解決する`metadataLocale.ts`と回帰テスト |
| absolute path scan | 合格 | source/docsからWindows・Unix絶対パスなし |

## 2026-08-12 実装追補の検証

この節は2026-08-16のS-810比率仕様変更前に行った検証の履歴である。下記の「小正方形・大正方形・横長・縦長」は旧寸法分類の結果であり、現行の1:1・4:3・16:9・9:20の4箱が開く証拠ではない。現行の実開箱はH-053で再確認する。

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | bundled TypeScript で `--noEmit` |
| Jest | 合格 | 44 suites / 285 tests |
| Biome | 合格 | `src/busybox` と変更したfixture生成script |
| Markuplint | 合格 | `src/**/*.{jsx,tsx,html}` |
| Vite production build | 合格 | multi-page build、S-640/S-710/S-720/S-810 chunkを含む |
| S-810 Windows Chrome | 合格 | 固定pack assetのMSE timestamp offset経路で小正方形・大正方形・横長・縦長の4箱を実再生中に開箱 |
| S-710 Windows Chrome | 合格 | Git管理QR fixtureでQR frame置換を確認し、lowercase `busybox{qr_replaced}`で開箱。JSON file入力でdecode失敗固定outputと`busybox{broken_input}`を確認 |
| S-720 Windows Chrome / fixture QR | 合格 | `VIDEO 1 → T1 → OUTPUT`の実変換後にlowercase `busybox{swap_halves}`を入力し、T1箱を開箱。FFmpeg抽出frameをjsQRで4 routeとも `busybox{...}`へ照合 |
| 固定media再生成 | 合格 | ローカルのWebM対応FFmpegを`BUSYBOX_FFMPEG_PATH`へ明示してS-710 decode失敗output、S-720全9本、S-810の120 segment packを再生成。manifest、WebM header、lowercase QR payloadの正本を更新 |

生成時のFFmpegはソースコードへ絶対パスを記録せず、実行時の`BUSYBOX_FFMPEG_PATH`で注入する。実装側も入力flagを小文字へ正規化して照合する。

## 2026-08-11 現行実装コミット前検証

この節が現行コードに対する最新の自動検証結果である。以下の過去節は当時のfixture、箱番号、実装経路を記録した履歴であり、現在のS-640/S-710/S-720/S-810の仕様判断には使わない。人手確認の未完了項目は[現状・残問題・人手確認への引継ぎ](./current-status-and-handoff.md)と[人手確認台帳](./human-test-matrix.md)を正とする。

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Jest | 合格 | 44 suites / 285 tests |
| Biome | 合格 | `src/busybox` とfixture生成script |
| Markuplint | 合格 | `src` の JSX / HTML 全対象 |
| Vite production build | 合格 | multi-page build、S-640/S-710/S-720/S-810 chunkを含む |
| S-640 fixture | 合格 | 8問の文字化け、元/誤表示encoding、回答非重複、fatal decode |
| S-710 fixture | 合格 | 暗黒frame、QR frame、10秒、WebM構造、QR payload、decode失敗output |
| S-720 route | 合格 | 4正規route、実変換関数、cycle拒否、経路判定単体test |
| S-810 capability | 合格 | `resize`、`seeked`、`requestVideoFrameCallback()`をprobe。4比率の実開箱はH-053待ち |
| licenses / path hygiene | 合格 | 第三者ライセンス内容、ソース内絶対Windows pathなし |

S-810の現行判定は、固定packをnative controlsでシーク停止し、`seeked`後の提示frameを1:1、4:3、16:9、9:20（各相対5%以内）へ分類する方式である。上表のcapability probeは実APIの存在確認であり、4箱の実開箱はH-053の人手確認を待つ。過去の24fps cadence記録は履歴であり、現行条件には使わない。

自動検証は人手確認の代替ではない。特にS-710の実frame差し替え、S-720のoutput再生・QR、S-810の可変寸法WebM再生は、Chrome実画面で確認する。

## 2026-07-20 ステージ一覧のcompact化

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| 一覧操作 | 合格（コード） | 60cardの専用入場buttonを廃止し、card全面を1つのbutton操作領域へ変更。accessible nameにstage名、`x/n`、状態を保持 |
| 進捗表示 | 合格 | `n 箱 · 状態`を累積値`x/n`へ変更し、箱のリボン・閉箱・開箱表現を維持 |
| 近接配置 | 合格 | 60stageを入力、ページ往来、メディア、PWA、端末、センサーの6clusterへ重複・欠落なく割当。196×92px node、2列、16px行間 |
| 回帰test | 合格 | 20 suites / 109 tests。cluster完全性test 2件を追加 |
| 静的check / build | 合格 | TypeScript、markuplint、変更対象Biome check、Vite production build |
| ブラウザ目視 | 環境制約で未実施 | host側serverはHTTP 200を確認したが、Codex in-app browserの分離環境から`127.0.0.1:4181`へ接続できなかったため、目視を合格扱いにしない |

実機またはhost browserでは、desktopとmobileの初期80%表示、card hover / focus、長い日英stage名の省略、map pan、S-190外縁markerを人手確認する。

## 2026-07-20 合意済みステージの全実装

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry | 合格 | 60stage・97箱、ID重複なし、全stageにlazy componentとcapability probe |
| 再設計 | 合格 | S-040 / 180 / 190 / 220 / 240 / 250 / 310を合意仕様へ更新 |
| Core追加 | 合格 | S-350 / 490 / 500 |
| 横断context | 合格 | S-190 B03/B04、S-250、S-360、S-510でround分離とcleanup |
| PWA / OS面 | 合格（コード） | manifest shortcuts、note taking、share/file/protocol handlers、Window Controls Overlay、通知action router、Media Session |
| WebAuthn / 時計 | 合格（コード） | S-380 Conditional UI 3箱、S-390 no-match / abort 2箱、S-400 monotonic比較2箱 |
| 端末API | 合格（コード） | Battery、文字倍率、Proximity、LinearAcceleration、AmbientLight、Accelerometer、Gyroscope、RelativeOrientation、SpeechRecognition、距離、高度 |
| 不採用確定 | 合格 | S-190-B05 notification capture markerはOS通知面を標準APIで選択・検証できず不採用。総数は97箱 |
| TypeScript / markup / Biome | 合格 | `tsc --noEmit`、markuplint、Biome check |
| Jest | 合格 | 19 suites / 107 tests。60/97 manifest整合、MDN / BCD全件台帳、通知action状態遷移を含む |
| MDN / BCD台帳 | 合格 | 2026-07-20再取得で147 family・1,090 interface、未分類0。再生成scriptと全件testを追加 |

権限、実機sensor、PWAインストール関連付け、OS通知action、passkey、system clock変更、cross-window D&Dはコード完成と公開合格を分離し、[人手確認台帳](./human-test-matrix.md)を必須ゲートとして残す。迂回clearやskipは追加していない。

## 2026-07-20 ステージ地図・機械可読manifest・横断基盤

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| 地図catalogue | 合格 | 全35stageに一意なbranch / order。既存`StageCard`をsemantic listとして再利用 |
| 機械可読manifest | 合格 | 全stageのproblem、gimmick、API、人手確認、map metadataをcatalogueと照合 |
| 横断round | 合格 | 30分期限、UUID、source stage、channel名の生成・検証test |
| PWA起動envelope | 合格 | shortcut / note / share / file / protocol / notificationのround URL生成・期限検証test |
| TypeScript | 合格 | `tsc --noEmit` |
| Jest | 合格 | 18 suites / 105 tests |
| ブラウザ目視 | 環境制約で未実施 | in-app browserから127.0.0.1、host.docker.internal、LAN addressのいずれも開発serverへ到達不能。H-020へ残す |

この時点のmanifestは実装済み35stageを対象にする。S-350以降はcatalogueへ追加したコミットで同時にmanifestへ入り、計画だけの項目を実装済みと誤認させない。

## 2026-07-20 相談結果の統合とステージ展開計画

Blackbox初期△28件・×1件の対話判断、新規G-033〜G-059、既存ステージ再設計を[ステージ展開計画](./stage-rollout-plan.md)へ統合した。コード実装は行わず、現在のcatalogueと計画値を分離して検証した。

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| 現行catalogue | 合格 | 35ステージ・42問題箱 |
| 計画台帳 | 合格 | stage status 60行、Gimmick 59件、うち取りやめ2件 |
| 計画箱数 | 合格 | 既存変更後50箱＋新規47箱＝97箱。S-190-B05採用時のみ98箱 |
| Blackbox相談 | 合格 | 初期△28件＋×1件の29/29にWeb案または新規問題を作らない理由あり |
| Markdownリンク | 合格 | `src/busybox`配下の全相対Markdownリンクが実在 |
| 差分形式 | 合格 | `git diff --check` |
| 自動test | 合格 | 16 suites / 99 tests |
| 静的check | 合格 | markuplint、Biome check。既存のBiome schema差異info 2件と`jest.setup.ts` warning 1件のみ |
| build | 合格 | TypeScriptとVite production build。既存のbrowser external、plugin timing、chunk size warningのみ |

完全なMDN 147ファミリー・1,045インターフェースの機械可読台帳は未作成である。この件数は2026-07-18の調査スナップショットとしてのみ保持し、次のWave 0で母集団を再取得する。

## 2026-07-18 ステージID単位の分割と問題ハンドル抽象化

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| モジュール境界 | 合格 | `S-000.tsx`〜`S-340.tsx`を10刻みで35ファイル。runtime registryも35件すべて同じIDの遅延import |
| 静的定義 | 合格 | 35 `StageSpec` と42 `ProblemSpec`を単一catalogueからregistry、一覧、箱表示、永続集計へ供給 |
| 入場オブジェクト | 合格 | 全ステージが `ProblemHandle` の定義・今回状態・安定した `solve` を利用し、移行用 `problemState` / ID別 `solve` を削除 |
| 表示ラベル境界 | 合格 | 日英ラベルは `label` と画面表示だけに残し、ファイル、export、registry、URL、保存、テストの識別はIDへ固定 |
| JSDoc | 合格 | 全35ファイルに `Gimmick`、`Uses`、`Success`、`Privacy/Permission`、`Cleanup`、`Human verification`。全件を人手台帳H-001〜H-025へ接続 |
| 共有化 | 合格 | 複数のcaptureステージで意味が同じMediaStream全track停止だけを `stages/shared/media.ts` へ抽出 |
| TypeScript / Biome / markuplint | 合格 | `tsc --noEmit`、Busybox 64ファイルのBiome、BusyboxのHTML/TSX markup検査 |
| Jest | 合格 | 16 suites / 99 tests。registry 35件、問題42件、S-200入力境界、Service Worker振り分けを含む |
| production build | 合格 | Vite buildが35個の `S-xxx` chunkを個別生成。既存の他entryに関するexternal化・500kB警告だけ継続 |

### セルフレビュー

| 観点 | 発見事項 | 対応 |
| --- | --- | --- |
| 永続化コールバック | 長時間動くstage effectが、保存状態変更前の `solve` / `observe` を保持し得た | `ProblemHandle` の関数identityを保ったまま、実行時は最新の進捗controllerへ委譲 |
| 非同期離脱 | 権限picker、メディア再生、共有、Drive、周辺機器処理の待機中にstageを離れると、完了後にstateまたは進捗を更新し得た | 各await境界でentryの `AbortSignal` を確認し、離脱後の更新・解決・後続I/Oを停止 |
| リソース所有権 | camera / microphone / display capture、PiP、通知、Bluetooth / HID / USB、WebGPUの一部確保後に失敗すると解放漏れの余地があった | 確保直後にcleanupを登録し、成功・拒否・例外・離脱・部分確保の全経路で停止、切断、close、destroy |
| 再検証 | 上記修正による型・表示・chunk境界への影響 | Biome、markuplint、`tsc --noEmit`、16 suites / 99 tests、production build、35 stage / 42 problem / JSDoc台帳整合を修正後に再実行 |

セルフレビュー後の未解決コード指摘はない。権限UI、OS連携、実センサー、実周辺機器、OAuth、PWAについては自動検査で代替せず、下記の人手ゲートを公開判定に残す。

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | fresh production preview originで35ステージ、42問題箱、推敲可能な日英ラベルを表示 |
| S-000再挑戦 | 合格 | 初回リボン付き0/1→クリックで開箱1/1→再入場で累積1/1のままリボンなし閉箱 |
| S-010共通箱 | 合格 | 3箱が同形・同寸法で、直下ヒントはマウス、指、ペン。マウス操作後はB01だけ開き1/3 |
| S-140複数問題 | 合格 | Drive未設定でもB01/B02の共通箱を表示し、同期操作だけを無効化 |
| S-200遅延・offline | 合格 | ID単位chunkをonlineで読込後、preview停止中の再読込でもService Workerから問題箱を表示 |
| S-250入場状態 | 合格 | lock取得でB01だけ今回開箱、B02はリボン付き閉箱、ヘッダーは永続1/2 |

権限プロンプト、実センサー、外部機器、PWAインストール、OAuth実アカウントはこの確認で発火していない。公開合格には引き続き[人手確認台帳](./human-test-matrix.md)の該当ケースが必要である。

## 2026-07-18 Service Workerキャッシュ境界の再設計

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| 開発モード | 合格 | `?mode=development` workerはfetchへ介入せず、即時activate時に旧 `busybox-` キャッシュを削除 |
| 本番HTML | 合格 | Busyboxのnavigation、manifest、iconをnetwork-firstで更新し、正規化した `index.html` をオフラインfallbackに使用 |
| 本番asset | 合格 | `/assets/` のcontent hash付きJS・CSS・JSON・Wasmだけをcache-firstとし、生成HTML参照entry assetsをinstall時に自動precache |
| 対象外通信 | 合格 | ViteのTSX/HMR、任意のGET、APIレスポンスをCache Storageへ保存しない |
| TypeScript / Biome | 合格 | `tsc --noEmit`、Busybox 39ファイル |
| Jest | 合格 | 16 suites / 99 tests。development pass-through、precache抽出、navigation・asset・sourceの振り分けを含む |
| production build | 合格 | Vite production buildで新しい登録処理、Service Worker、hash付き遅延chunkを生成 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| Vite開発サーバー | 合格 | 設定画面に「開発モードではキャッシュせず、Service Worker機能だけを有効」と表示。35ステージを描画し可視エラーなし |
| production preview | 合格 | 設定画面がオフライン起動readyとなり、development workerと混同しない |
| 遅延stage online | 合格 | S-200の遅延chunkを読み込み、共通問題箱を表示 |
| 遅延stage offline再訪 | 合格 | production preview停止後、S-200直接URLを再読込してstageと問題箱をService Workerキャッシュから表示。可視エラーなし |

旧cache-first workerがすでに開発originを制御している環境だけは、最初の一度だけ更新操作またはDevToolsからの登録解除が必要になる。以後の開発workerはfetchを処理しないため、Viteの更新を古いCache Storageが隠さない。

## 2026-07-17 全ギミック実装の最終確認

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busyboxの38ファイルを確認 |
| markuplint | 合格 | Busybox配下を確認 |
| Jest | 合格 | 15 suites / 95 tests。35ステージ・42問題箱のID対応、入場状態導出、永続集計、Gamepad入力境界を含む |
| production build | 合格 | Vite production buildで本体、基礎・複数コンテキスト・周辺機器の遅延chunk、PWA静的ファイルを生成 |
| 台帳整合 | 合格 | G-001〜G-032をすべて採用済みとして記録し、35ステージ・42問題箱のregistry、表示定義、仕様台帳が一致 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | 全35ステージを番号順に表示し、全42問題箱の永続進捗を集計 |
| S-200待機状態 | 合格 | Gamepadの遅延chunkが読み込まれ、実入力待ちのリボン付き共通箱として表示 |
| S-210実行 | 合格 | Badging APIの成功を1→2→3回と数え、3回目に箱が開いてヘッダーが永続1/1へ更新 |
| S-210再入場 | 合格 | ヘッダーは永続1/1、一覧は1/42を維持しつつ、問題箱はリボンなし閉箱 `closed` へ戻り再挑戦可能 |
| S-280待機状態 | 合格 | Web Bluetooth対応ブラウザで実API操作を明示ボタンの後にだけ開始する構成を表示。自動確認では機器選択を発火させていない |
| 共通箱 | 合格 | 新規ステージを含め、ステージ内問題を共通 `ProblemGiftBox` と `data-box-state` で表現 |
| エラー隔離 | 合格（確認範囲） | 上記画面でエラー境界・alertの可視表示なし。権限UIや実機接続後のエラーは人手ゲートへ残す |

限定提供・実験的APIは、APIの存在だけでクリアさせない。Gamepad、Screen Capture、Picture-in-Picture、Web Locks、EyeDropper、WebGPU、Web Bluetooth、WebHID、WebUSB、Device Posture、Screen Wake Lockは、それぞれ仕様に定めた実イベントまたは実データを観測した場合だけ箱を開く。

## 2026-07-17 統一問題箱・再挑戦の再検証

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busyboxコードと `publish-pages.yml` を確認 |
| markuplint | 合格 | Busybox配下を確認 |
| Jest | 合格 | 14 suites / 92 tests。全15ステージ・19問題箱のID対応、入場状態導出、ステージ別累積数を含む |
| production build | 合格 | Vite production buildでBusybox本体と遅延stage chunkを生成 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| S-000初回 | 合格 | 入場時はリボン付き閉箱・0/1、箱クリック後は開箱・1/1 |
| S-000再入場 | 合格 | 過去クリア済みではリボンなし閉箱から再挑戦し、ヘッダーは累積1/1を維持。再クリックで開箱になり、累積進捗は重複加算せず1/19 |
| S-010同形性 | 合格 | 3箱はいずれも72px幅、同じDOM部品・寸法・リボン形状で、差分は色と直下のSVGヒントだけ |
| S-010入力分離 | 合格（マウス） | マウスクリックでB01だけが開き、B02 touchとB03 penはリボン付き閉箱のまま。実機touch / penはH-024へ残す |
| S-010再入場 | 合格 | B01はリボンなし閉箱、未クリアのB02/B03はリボン付き閉箱へ戻る一方、ヘッダーは累積1/3を維持 |
| アクセシブル名 | 合格（確認範囲） | 未クリア、過去クリア・今回未クリア、今回クリアを箱のボタン名で区別 |
| コンソール | 合格 | 上記シナリオでerror / warningなし |

S-010は画面でも、各箱の下にマウスカーソル、指、ペンのアイコンが対応順で表示されることを確認した。全API・権限条件を実端末で再達成する確認はH-025として人手台帳へ残す。

## 2026-07-15 ローカル自動確認

### 対象

- ブランチ: `codex/busybox-web-api-game`
- worktree: `worktrees.local/busybox-web-api-game`
- URL: Viteローカルサーバーの `/busybox/index.html`
- ブラウザ: Codex in-app Chromiumブラウザ
- OAuth Client ID: 未設定

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busybox変更に新規警告なし。リポジトリ既存の設定version情報と `jest.setup.ts` 1警告は継続 |
| markuplint | 合格 | リポジトリ全対象がpass |
| Jest | 合格 | 14 suites / 89 tests |
| production build | 合格 | Busybox本体と遅延stage chunkを生成 |
| PWA静的ファイル | 合格 | `manifest.webmanifest`、`service-worker.js`、`icon.svg` を `dist/busybox/` へ配置 |

### 2026-08-09 現環境一括実装の自動検証

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry | 合格 | 68 stage・156箱、追加ID重複なし、lazy componentとprobeを同期。`stageDefinitions.test.ts` |
| TypeScript | 合格 | `tsc --noEmit` |
| markuplint | 合格 | `src/**/*.{jsx,tsx,html}` 全対象がpass |
| Biome | 合格 | 追加・変更したBusybox TS/TSX/JS 25ファイルをpass。既存全体警告は別管理 |
| Jest | 合格 | 40 suites / 274 tests、S-710の事前生成decode-failure fixtureのWebM構造検証を含む |
| production build | 合格 | Vite buildでS-610〜S-720の遅延chunk、public helper、静的mediaを生成 |
| fixture determinism | 合格 | S-710 `s710-decode-failure.webm`を生成scriptと形式検証で固定。S-620/S-640/S-720のfixture manifestと意味検証を維持 |
| diff hygiene | 合格 | `git diff --check` |

同日再実行でも、S-710 object URL cleanup追加後にTypeScript、Biome（変更対象）、markuplint、Jest 40 suites / 274 tests、Vite production buildがすべて合格した。buildの既知警告（`vite.config.ts`の`__dirname`、browser externalization、500 kB超chunk）は既存警告として残る。

2026-08-10: S-660の中間二状態を一箱へ統合した。未公開のため進捗schemaはv1のままとし、旧箱構成との互換処理は持たない。S-710のB02を入力decode失敗の別経路へ限定し、B03を実QR画像へ置換、S-510-B02のasset URLとSHA-256を固定した。TypeScript、Biome、Jest、Vite production build、`git diff --check`が合格した。Windows ChromeでのS-710 QR出力とS-510 iframe内からの実dragは最終人手確認として残す。

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | 15ステージ、19問題箱、進捗0/19を表示 |
| デスクトップ表示 | 合格 | ヘッダー、ナビゲーション、4列カード、フォーカス可能な操作を目視 |
| S-000直接URL | 合格 | `?stage=S-000` で直接起動 |
| S-000解決と再読込 | 合格 | 0/1→解決、reload後も解決、一覧1/19 |
| 日英切替 | 合格 | Englishを選び、reload後も英語コピーを保持 |
| IndexedDB状態 | 合格 | 設定画面が保存readyを表示 |
| S-050複数タブ | 合格 | 同じURLを2タブで開き、両方が解決 |
| S-060再訪 | 合格 | 箱本体表示後に即別ページへ移動し、次の直接訪問で解決 |
| Drive未設定 | 合格 | OAuth Client ID未設定を表示し、同期操作を無効化。ローカル進捗は利用可能 |
| コンソール | 合格（確認範囲） | S-060診断タブでerror/warningなし |
| 390px viewport | 未確定 | viewport制御中に自動ブラウザがタイムアウト。合格へ数えずH-020へ残す |

S-060の最初の試行では、問題コンポーネントの遅延読込前に強制遷移したため観測対象にならなかった。箱本体が表示されたことを待つ正しいシナリオへ修正し、表示commit直後の同期フラグとIndexedDB観測の両方で再訪を確認した。

## 2026-08-10 D-141 S-270削除 / S-350再整理

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | 68stage・154箱。S-270 / G-024、S-350 Media Capabilities profile箱、実寸reel箱を削除。S-350-B04をnative再生速度へ置換し、B01〜B05、合意済みの将来B07、S-810-B01を同期 |
| API ledger | 合格 | 公式MDN / BCDから再生成。WebGPUはstage未割当の`hold`、Media Capabilitiesは箱にしない`integrate`へ更新 |
| media fixture | 合格 | `src/busybox/fixtures/media/`へ製品昇格。codec・寸法・音声trackとportable manifestを`verify-busybox-media-assets.mjs`で照合 |
| cadence判定 | 合格 | 25提示frame / 24連続delta、許容差0.004秒。12 / 30 / 60fpsのnegative caseを単体test |
| static checks | 合格 | Markuplint、Biome、TypeScript、`git diff --check`。Biomeの既存schema version infoと`jest.setup.ts` warningのみ |
| automated tests | 合格 | Jest 41 suites / 277 tests。mapの各cluster 12stage以下も再確認 |
| production build | 合格 | Vite buildでS-350 / S-810の遅延chunkと全5media assetを出力 |
| browser structure | 合格（速度変更はH-030待ち） | S-350が5箱・単一player・page製profile / reel UIなし、B03 pause icon、B04 speed icon、B05 subtitles iconであることをlocalhostで確認。Chrome native playerのoverflow入口も表示。実menuから速度変更して開箱する操作はH-030に残す |
| native seek完遂 | H-053待ち | browser制御からnative timelineの任意時刻操作を安定再現できないため、実マウスで24fps区間だけが開くことを公開前ゲートに残す |

## 2026-08-10 D-143 PiP統合 / S-640修復

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | 独立S-230を削除し、G-020をS-350-B06へ移動。67stage・154箱 |
| S-640 ID契約 | 合格 | fixture順を明示的なS-640-B01〜B12へ対応させ、全IDがcatalogueに属することをunit testで固定 |
| S-640 問題表示 | 合格 | 2進・16進はbyte列だけ、文字化けは誤復号textだけを提示し、正答文字列の露出をunit testで拒否 |
| S-350 cleanup | 合格 | 離脱時pauseをB03判定から除外し、PiPを終了する |
| S-720 解錠境界 | 合格 | 実file選択前のtransformを無効化し、復元成功だけでは開箱・flag表示せず、復元後のQR flag完全一致だけで開く |
| S-710 解錠境界 | 合格 | 変換条件の内部検出だけでは開箱せず、出力動画から読んだ合言葉の共通欄への完全一致だけで対応箱を開く。statusへのdecode失敗flag露出も削除 |
| automated checks | 合格 | Markuplint、Biome（既存warningのみ）、TypeScript、Jest 42 suites / 279 tests、Vite production build |
| browser structure | 合格（native PiP実操作はH-030待ち） | S-350は0/6・単一video、S-640は0/12でB01〜B12と意図した問題表現を表示し例外なし、S-720は未選択のtransformとflag欄がdisabled |

## 2026-08-10 D-144 media stage製品化

| 検証 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | S-350-B08 fullscreenを追加し67stage・155箱、全採用計画78stage・186箱へ同期。Fullscreen APIをS-350へ割当 |
| S-640 UI / 回答境界 | 合格 | 2進・16進・文字化けを分類別cardへ整理し、12問共通入力一つだけを表示。localhostで12問・1 textbox・正答非露出を確認 |
| S-710 iframe / decode失敗 | 合格 | same-origin ClipPress iframeを独立MPA entryとしてbuild。session付きmessageを検証し、壊れた固定inputで固定recovery output、親合言葉欄の有効化、console errorなしを実browser確認 |
| S-710 QR portability | 合格（実QR入力はH-042待ち） | native `BarcodeDetector`を先に試し、失敗・非対応時はdownscale `ImageData`をbundled jsQR 1.4.0へ渡す。S-700-B02の実Barcode Detection条件とは分離 |
| S-720 patch bay | 合格 | 3 source・3 transform・1 output、out→任意in、Bezier canvas cable、4正規routeのunit test。実browserでB04 cycleの`recovered-beta.webm`即時再生、共通flag入力による1/4、console errorなしを確認 |
| fixture製品昇格 | 合格 | encoding、Unicode font、S-720のsource / intermediate / 4 output、S-710のdecode失敗input / outputを`src/busybox/fixtures/`でGit管理。生成script、manifest、形式・寸法・内容の意味検証を同期し、製品stageのPoC path参照0件 |
| automated checks | 合格 | TypeScript、Biome 140 files、Markuplint全対象、Jest 43 suites / 285 tests、encoding / Unicode / native media fixture verifier、Vite production build、`git diff --check` |
| build既知warning | 継続 | Vite `__dirname` native-loader予告、ghostpdl browser externalization、500kB超chunkは既存warning。S-710 tool chunkはMediaBunny + jsQRを独立iframeへ分離済み |

## 未実施の人手ゲート

次はローカル自動確認だけでは合格にしない。

- Firefox、Safari、Android Chrome、iOS Safari
- 200%拡大、390px相当の実表示、スクリーンリーダー
- PWAインストール、ホーム画面起動、オフライン起動、更新、アンインストール
- 通知の許可・拒否・通知クリック
- mouse / touch / pen実機
- Device Orientation実機とiOS許可
- カメラ・マイクの許可、拒否、機器なし、インジケーター停止、閾値
- Screen Captureの許可・拒否・共有停止と、共有面からの実フレーム観測
- Picture-in-Pictureの入退場、Web Shareの共有完了、Web Locksの複数タブ待機順
- Gamepadの複数ボタン・スティック、Badging、EyeDropper、Screen Wake Lockの実機・OS差
- WebGPUの対応GPU、デバイス喪失、計算結果readback
- Web Bluetooth、WebHID、WebUSBの対象機器、選択キャンセル、切断、再接続
- Device Posture / Viewport Segmentsの折りたたみ実機、Launch Handlerのインストール済みPWA起動
- ファイルのキャンセル、大容量、別ファイル、ダウンロード制限
- Google OAuth実アカウント、単一端末、2端末、失効、削除、アカウント切替
- GitHub Pages本番相当のサブパス、直接URL、Service Worker scope

これらは[人手確認台帳](./human-test-matrix.md)の該当IDへ結果と環境を追記してから公開合格にする。

## 2026-08-18 追加PoC・製品stage wave

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| catalogue / registry / map / manifest | 合格 | 69stage・159箱。S-700-B03、S-780-B01〜B04、S-510-B03を`stages.ts`、lazy registry、`stageManifest.ts`、metadata localeへ同期。`stageDefinitions.test.ts`でID重複・箱数を検証 |
| S-700-B03 | 実装済み・人手待ち | Presentation APIのround付き専用receiverを製品public assetへ昇格。通常window / iframe / Remote Playbackをclearにしない |
| S-780 | B01〜B04実装済み・公開origin人手待ち | 架空BBX method manifest、○/◇の2 app manifestとworker scope、共有handler runtimeを製品assetへ昇格。✓ / × / ↻→✓はwallet非依存、◇選択は対象workerのtrusted eventだけで開く。fixture testで2 app構造を固定し、H-050でbrowser chooserを確認する |
| POC-035〜054 | 実装済み・個別確認待ち | lazy accordion、共通`advanced-poc.ts`、positive / negative / cleanup方針を追加。CSP fixture、MediaSource分割fixture、WebCodecs encoded chunkはpartialとして明示 |
| TypeScript | 合格 | bundled Node 24 runtimeで`tsc --noEmit`およびproduction `tsc` |
| markuplint | 合格 | `src/**/*.{jsx,tsx,html}` 全対象 |
| Biome | 合格 | 追加・変更Busybox sourceを`biome check` |
| Jest | 合格 | 全50 suites / 301 tests。stage catalogue、metadata locale、S-810関数、S-780の2 Payment App fixtureと既存fixture検証を含む |
| Vite production build | 合格 | stage lazy chunks、`dist/busybox/payment/`、`dist/busybox/presentation-receiver.html`を生成 |
| diff hygiene | 合格 | `git diff --check`。source/config対象のabsolute Windows path scanとsecret-like pattern scanに該当なし |

### Windows Chrome手動結果（ユーザー報告）

POC-035〜054をWindows Chromeで確認した結果は、positiveが036/037/039/040/041/042/043/044/045/048/049/050/051、negativeが035/052/054だった。POC-038は旧説明が不明瞭、POC-053はpositiveに見えるものの変化が見えにくかったため、今回のコードでそれぞれ横scrollのroot付きratio表示、native字幕とactive cue previewへ修正した。未報告の項目は環境待ちとして未判定のまま残す。
