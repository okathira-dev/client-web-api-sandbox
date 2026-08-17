# ステージ展開計画

> この文書は実装前の展開スナップショットである。D-143後、本文のS-230、S-270、Media Capabilities profile箱、旧S-350箱番号と件数は現行計画へ使わない。旧S-230のPiPは現行S-350-B06である。現行箱ID・件数・解法は[現行ステージ解法仕様](./stage-walkthroughs.md)と[ステージ実装状況](./stage-implementation-status.md)を正とし、本文から導かない。

> 実装完了記録（2026-07-20）: Wave 1〜6をコードへ反映し、S-380 / S-390を分離した60stage・97箱をcatalogueへ登録した。以下の「現在35stage」「未実装」「技術スパイク待ち」は着手前スナップショットとして残す。2026-07-21〜2026-08-09のDeep Research対話でS-030追加箱、S-060-B02、S-220-B04、S-350-B04〜B08、S-430-B02、S-510-B02、S-580-B02、S-610〜S-800を含む追加差分を承認した。D-135でS-680を外しD-136でS-800を加えた全体計画値は79stage・187箱だが、D-137で現環境確認分の68stage・157箱を初版実装へ昇格した。既存S-270-B01は不可視な4096候補検索の完成扱いを撤回し、大量光粒子を導くWebGPU盤面へ全面再設計する。現在状態は[ステージ実装状況](./stage-implementation-status.md)と[検証記録](./verification-record.md)を正とする。S-190-B05とS-680は不採用に確定した。

> 2026-08-09実装境界: D-137で、現環境確認分を先に68stage・157箱まで実装するWave 0〜6を確定した。具体的な対象、依存関係、完了条件は[現環境確認分の一括実装計画](./current-environment-implementation-plan.md)を正とし、残り30箱を今回の完了条件へ含めない。

## 目的と正本の範囲

2026-07-18から2026-07-20に行ったBlackbox参考機構の相談結果、新規Web API案、既存35ステージの再設計を、実装可能な順序へまとめる。この文書は「何をどの順で実装するか」の正本とし、個々の成功条件は[ステージ実装状況](./stage-implementation-status.md)、判断履歴は[決定ログ](./decision-log.md)と[Blackbox機構監査](./blackbox-mechanism-ledger.md)を正とする。

この文書の下記スナップショットはコード実装を開始する前の記録である。実装済みの結果と混同しない。

未実装案のPoC要否、最小構成、手順、合格条件、失敗時の扱い、推奨順は[実装PoCマスタープラン](./implementation-poc-master-plan.md)を正とする。本書の古い技術判断表は相談・実装前の履歴として残し、現在コード化済みのstageを実装前PoCへ戻さない。

## 2026-07-20スナップショット

| 対象 | 現在 | 合意済みの計画 |
| --- | ---: | ---: |
| 実装／計画ステージ | 35 | 60行 |
| 問題箱 | 42 | 97個を確定計画 |
| ギミック台帳 | G-001〜G-059 | 57採用、2取りやめ |
| Blackbox初期△／×の相談 | 29件 | 29/29完了 |

計画ステージ数は、S-380と仮S-390を別ページにした場合が60、同一ページへ統合した場合が59である。問題箱はどちらも5個なので総数は変わらない。S-190のnotification marker B05を実機PoC後に採用した場合だけ98個になる。

97個の内訳は次のとおり。

- 現在の42箱
- 既存ステージの確定変更による純増8箱: S-040 `+1`、S-180 `-1`、S-190 B01〜B04 `+3`、S-220 `+2`、S-240 `+1`、S-310 `+2`
- 新規S-350〜S-600の25ステージ、47箱

S-250は現行2箱をRGB三色タブと解放順の2箱へ再設計するため、総数は変わらない。これらは計画値であり、現在のコード上の35ステージ・42箱と混同しない。

## 相談結果の整理

初期評価が△だった28件と×だったBB-065の合計29件は、すべて一度相談を完了した。Web向け問題または既存ステージへの統合を22件で採用し、7件は新規問題を作らない判断とした。元機構を取りやめて独自問題だけを採用したBB-080は、採用側へ数えている。

残っているのは採否の相談漏れではなく、次の技術判断である。

| 対象 | 合意済み | PoCでだけ決めること |
| --- | --- | --- |
| S-190-B05 | notification画像を共有映像から読む案 | OS通知欄が共有対象へ入り、別種markerの実pixelを安定decodeできるか。成立しなければB05だけ作らない |
| S-380 / S-390 | passkey 3箱とrequest lifecycle 2箱は採用 | 同一ページ5箱か、3箱＋2箱の2ステージか |
| S-360 | backend、STUN/TURN、microphoneなしの同一origin WebRTC 2箱 | 2タブの手動／BroadcastChannel signalingと明示切断が、問題として分かる操作感になるか |
| S-410 / S-420 | 2種類の通知action列問題を採用 | `Notification.maxActions >= 2`、tag差替え、Service Worker再起動後の反復が対象環境で成立するか |
| S-510 | B01のPWA window→通常browser PNG File dragと、B02のcross-origin iframe→親Document画像URL dragを採用 | B01の`DataTransfer.files`、B02の`text/uri-list`とcurrent payloadが各境界を越えて維持される環境範囲 |
| S-480 | 小・標準・大・特大の4箱は実装済み。DR-019のUser Preferences API 5箱を追加承認 | 5種類の`requestOverride()`、実効`matchMedia()`、拒否、開箱後cleanupを対象browserで確認する。非対応時の代替clearは作らない |
| S-520〜S-600 | 各問題の中心APIと箱数を採用 | 実機noise、sampling rate、権限、値欠損を踏まえた閾値。成功条件を別APIへ置換しない |
| S-020 / S-150 / S-610 | DR-025のmeter表示、details 1箱、dialog 3箱を追加承認 | `<details name>`の排他toggle、`closedby="any"`の実装差、light dismissとplatform cancelのsource分離をPoCする |
| S-030 | DR-029のCustom HighlightをB02 / B03の別箱として追加承認 | 複数Rangeの保持、Selection移動後の再描画、`highlightsFromPoint()`の重なり集合・折返し・bidi・pointer座標を対象browserで確認する。DOM elementや手計算矩形の代替clearは作らない |
| S-220 | DR-047のNavigation APIをB04として追加承認 | A→B→Cからbrowser BackでAへ戻りDへ分岐した時、旧B / C両entryの`dispose`と`canGoForward === false`を観測する。script traverseやHistory APIの代替clearは作らない |
| S-350 | DR-069のmedia能力・frame・trackをB04〜B08として追加承認 | 最高適性profile、24fps実提示frame、目標実解像度、`Busybox`字幕、条件付き`Busybox`音声trackを分ける。native画質menuの現在値は取得不能なので成功条件にしない |
| S-580 | DR-063のSpeechSynthesisをB02として追加承認 | 位置ごとの+1、+2…shiftを画面に出さず一文字ずつ発話し、`aspuwiq → busybox`のutteranceがstart後に正常endした時だけ開く。録音や表示による代替clearは作らない |
| S-620 | DR-028のAPI案を却下し、派生したUnicode数字17箱を追加承認 | font再配布licenseとglyph、RTL、Mayan縦積み、算木の交互表記、基数20、全回答の一意性をfixtureと実browserで確認する |
| S-710 | DR-077を動画変換4箱として追加承認 | Insertable Streamsのworker対応、1 frame置換、低bitrate記録、WebM metadata remux、固定回答、10秒上限、frame cleanupをPoCする |
| S-720 | DR-077派生の映像復元4箱を追加承認 | WebCodecsによるframe parity / timestamp保持、T1 / T2 / T3の連結、途中QR非decode、bounded queueをPoCする |
| S-730 | DR-084を最小のWebXR 2箱として追加承認 | AR / VRの実immersive sessionと最初のviewer pose、実XRInputSourceのselect ray hit、inline拒否、静止したままの安全な完了、session cleanupを実機PoCする |
| S-740 | DR-097を長期植物1箱として追加承認 | installed PWA、permission / engagement、window client 0件のreal scheduler event二回、水と光の別訪問、発芽・開花asset cache、unregister、長期非発火をPoCする。DevTools模擬eventは配線確認だけに限り、公開証跡へ使わない |
| S-750 | DR-126をbrowser所有OTP入力1箱として追加承認 | 別送信者、origin-bound SMS、実`OTPCredential`、Security Code AutoFill、`:autofill`、current round code、manual input拒否、Android / iOS / desktop、cancel / abort、電話番号非取得をPoCする。event列だけの推定やDevTools virtual SMSを公開証跡へ使わない |
| S-760 | DR-017を架空名刺2箱として追加承認 | Android Chromeの実Contact Pickerでname / email / tel / address / iconの返却と正規化一致、全5propertyを非共有にしたまま1件を確定できるnative UI、架空contactのOS同期説明と削除案内をPoCする |
| S-770 | DR-127を公式FedCM providerごとの身分証棚として追加承認 | 実装時点の公式情報、public RP登録、managed IdP、provider別FedCM確証、独自backend不要を調査する。Google 1箱を下限とし、追加serviceはclient登録と実account PoC後に加算する |
| S-780 | DR-129を架空Payment Handler 3箱として追加承認 | 複数handler候補、trusted PaymentRequestEvent、承認success、意図的拒否fail、同一handler retry、非言語開箱、実provider非使用を対応browserとHTTPS originでPoCする。handler選択・開始経路は固定しない |
| S-790 | DR-137を専用font再発見1箱として追加承認 | Git管理OTFのOS install、対象PostScript名だけのLocal Font Access、FontData Blob検証、glyph表示、permission / font cleanupをdesktop ChromiumでPoCする |
| S-060-B02 | DR-100をオフライン郵便1箱として追加承認 | onlineで制御中Service Workerとcacheを準備し、server停止・offline中の明示`sendBeacon()`、receiverへのfull-document navigation、workerのPOST検証とIndexedDB receipt commitをPoCする |

`SpeechRecognition.processLocally`、`available()`、`install()`、Geolocationの`speed` / `heading`、`clipboardchange`はMDN全件監査へ残すが、今回の確定ステージへ混ぜない。これらは実装のブロッカーではない。

## 実装前に解消する基盤差分

| 基盤 | 現状 | 必要な変更 |
| --- | --- | --- |
| stage catalogue | 実装済み35ステージだけから`StageId`を導出 | 計画項目をruntime registryへ誤登録せず、実装単位で型・catalogue・lazy importを同時追加する |
| stage map | 単純なgrid/list | 決定的座標、branch、related / clue edge、pan / zoom、semantic DOMを持つmind mapへ移行する |
| round通信 | 各ステージ固有 | BroadcastChannel handshake、round nonce、期限、重複consumeを共通化する |
| PWA manifest | 基本installと`launch_handler`のみ | shortcuts、note_taking、share_target、file_handlers、protocol_handlers、`display_override`を一つの互換性監査で追加する |
| Service Worker | offline cacheとS-090通知復帰 | stage別tag/action router、IndexedDB inbox、通知差替え、S-740のperiodicsync router / local garden store / cache、version migrationを追加する |
| 実験API型 | TypeScript DOM型にあるAPIが中心 | Generic Sensor、LaunchQueue、PeriodicSyncManager、OTPCredentialなど不足するIDLを狭い宣言とfeature probeで補う |
| privacy storage | 共通進捗だけ | S-590の短命開始anchorとS-740の端末local care / phase receiptを共通進捗・Drive・exportから分離し、各stageのreset / 完了条件で削除する |
| media fixture | stageごとに生成方法が異なる | 事前生成可能な動画・音声・画像へsource、生成script、codec条件、寸法・フレーム・内容などの意味検証を共通化する |
| 合言葉 | 固定値とround値の境界が未統一 | 非同期・非リアルタイム問題は固定回答にし、copy可否に応じた長さをstage specとtestへ記録する |

既存実装・承認済み計画のmediaも例外扱いしない。実装ウェーブへ入る前に次を監査し、事前生成可能な内容はGit管理assetへ移す。

| 対象 | 事前生成するもの | runtimeに残せるもの |
| --- | --- | --- |
| S-190 | 固定説明画像・decode基準fixture | playerが選んだscreen capture、local recording、round同期marker |
| S-230 | PiPへ流す固定loop映像 | PiP用track接続と入退場event |
| S-350 | 解像度 / framerate reel、字幕、音声track、期待metadata | native再生状態とframe callback観測 |
| S-360 | peerへ送る固定短尺audio source | WebRTC接続、live track送信、data channel |
| S-430 | media controlへ載せる固定loop audio | Media Session / Audio Sessionの外部状態変化 |
| S-510 | B01固定PNG構造・decoder fixture、B02透明PNG layer 3枚・完成見本・外部静的helper page | B01 current roundを埋めたwindow間drag用PNG。B02 current iframe payload、cross-origin drop、layer合成 |
| S-640 | 全legacy encoding byte fixture | `TextDecoder`による現在環境でのdecode |
| S-700 | Remote Playback用の全動画区間 | current roundのslot割当、接続、camera decode、Presentation handshake |
| S-710 / S-720 | error動画、QR template、全復元fixture、元QR、期待画像 | player入力動画の変換、webcam録画、各変換の実行結果 |
| S-730 | 単純なXR箱model、material、icon | XRSession、viewer / input pose、実select rayによるinteraction |
| S-740 | 種、鉢、発芽、開花の各assetとchecksum | care入力、real periodicsync receipt、phase遷移、asset取得・cache |

## 実装ウェーブ

### Wave 0: 台帳と実装契約

1. この計画、stage status、gimmick coverage、human testの件数と状態語を揃える。
2. MDN 147ファミリー・1,045インターフェースという2026-07-18スナップショットを再取得し、機械可読API台帳へ変換する。現在この完全台帳は未作成であり、固定件数を現行値として扱わない。
3. stage manifestとJSON Schemaを作り、stage ID、problem ID、Gimmick ID、API台帳、人手確認IDの未参照・重複をCIで失敗させる。
4. 計画ステージを実装済みとしてcatalogueへ先行登録しない。

完了条件は、現在の35ステージ・42箱を壊さず、計画と実装の件数を別々に自動集計できること。

### Wave 1: mind mapと横断ランタイム

1. [ステージMind Map設計](./stage-map-design.md)に従ってgridを置き換える。
2. `StageSpec`へ安定order、branch、related / clue edgeを追加する。
3. round nonce、BroadcastChannel handshake、one-time inbox、期限切れ、resetを共通化する。
4. PWA専用URLをquery parameterの直接訪問と区別して受け取るroute envelopeを定義する。
5. Generic Sensor lifecycleと実験APIの型宣言を、まだ個別stageを追加せず用意する。

mind mapはS-190-B04の盤面でもあるため、Screen Capture拡張より先に完成させる。

### Wave 2: 低リスクな既存再設計とCore追加

次を小さな単位で実装し、stage catalogue移行と再挑戦モデルを検証する。

1. S-040 B02、S-180 1箱化、S-220 B02/B03/B04
2. S-250 RGB三色タブと解放順
3. S-350 native media controls B01〜B03、Media Capabilities / frame / track B04〜B08
4. S-490 `busybox` input 1箱
5. S-500 Caesar copy override / paste / Selection 1箱
6. S-190-B02 local recording
7. S-030 Custom Highlight B02 / B03

各変更で既存の累積進捗を移行する。削除されるS-180-B02の達成記録を無言で別問題へ流用せず、progress schemaの移行方針を先に決める。

### Wave 3: 複数tab・画面・WebRTC

1. S-360を先に技術スパイクし、同一origin 2タブ間の接続・切断を確認する。
2. 成立した共通接続を使ってS-190-B03 live relayを実装する。
3. mind map外縁markerとround handshakeを使ってS-190-B04を実装する。
4. S-190-B05 notification markerは独立した実機PoCを行い、採否だけを記録する。
5. S-510のcross-window File dragとcross-origin iframe画像URL dragをdesktop実機で試作する。

画面frame、録画Blob、生成音声、D&D画像は進捗・Driveへ保存しない。

### Wave 4: PWA起動面とService Worker

manifest関連はインストール時の関連付けと再インストールを伴うため、一つの互換性バッチとして扱う。

1. 共通のPWAインストール説明と、各OSでの再インストール／関連付け更新手順
2. S-240-B02 Share Target受信
3. S-310-B02 shortcut、S-310-B03 note taking
4. S-440 `.busybox` File Handling
5. S-450 `web+busybox:` Protocol Handler
6. S-460 Window Controls Overlay
7. S-410 / S-420 notification actionsとService Worker inbox
8. S-430-B01 Media Session external pause
9. S-430-B02 Audio Session interruption / recovery

File Handlingは現時点で主にdesktop Chromiumのinstalled PWA、Window Controls Overlayもinstalled desktop PWAが対象となる。通知actionは実装上限が0の場合がある。S-430-B02はAudio Sessionの実`active → interrupted → active`と再生復帰を要求し、ゲーム自身はinterruptionを生成しない。いずれも代替clearやskipを設けず、feature probeと対象環境の人手証跡を完成条件にする。

### Wave 5: WebAuthnと時計

1. Busybox専用host名を確定し、他コンテンツとRP IDを共有しない静的配信を用意する。
2. S-380 / S-390の2variantを同じ実装部品でPoCし、ページ境界だけを決める。
3. passkeyが端末または同期providerへ残り得ること、Webページから完全削除を保証できないことを作成前に示す。
4. create、conditional get成功、保存済みcredentialの不成立、no-match、player起因`AbortSignal`を別eventとして記録する。
5. S-400は`performance.now()`系のmonotonic基準とwall clock差だけを一時保持し、document切断で試行を終える。

WebAuthnはゲーム内の強い認証を目的にせず、browser UIとcredential lifecycleを観測する。独自backendは追加しない。

### Wave 6: 端末・センサー・位置

依存する共通runtimeごとに実装する。

1. S-370 Battery Status
2. S-480 text scale専用documentとUser Preferences API 5箱
3. S-520 Proximity、S-530 Linear Acceleration、S-540 Ambient Light
4. S-550 raw Accelerometer、S-560 Gyroscope、S-570 Relative Orientation
5. S-580 Speech Recognition B01 / Speech Synthesis B02
6. S-590 distance、S-600 altitude
7. S-020 meter表示、S-150 details箱、S-610 dialog 3箱
8. S-620 Unicode数字の計算式17箱
9. S-270 WebGPU大量光粒子盤面の置換とCPU-only安全gate
10. S-630 Network Information接続方式4箱
11. S-640 Encoding APIの2進・16進・文字化け12箱
12. S-650 Permissions APIの位置・通知・カメラ・マイク4箱
13. S-660 Compute Pressure APIのCPU pressure 4状態
14. S-670 read-only Console迷路1箱
15. S-680 read-only Console診断卓はD-135で体験重複のため不採用
16. S-690 同一page Text Fragment巡回1箱（hint構成と完全解は再吟味後に確定）
17. S-700 外部映写3箱（B01 Remote Playback文字鍵、B02 DR-016のround別QR読取、B03 Presentation receiver表示）
18. S-710 合言葉変換所4箱（暗黒frame、decode失敗、QR frame、自己生成metadata）
19. S-720 映像復元機4箱（T1左右交換、T2時間乗算、T3奇偶半面選択、QR helper）
20. S-730 XRの箱2箱（実immersive session＋最初のpose、実select rayで空間上の箱を選択）
21. S-740 留守番温室1箱（水と光を別訪問で預け、window不在中の実periodicsync二回で開花）
22. S-750 届いた封書1箱（実WebOTP credentialまたは強く検証したOTP AutoFillでcurrent codeを受け取る）
23. S-760 架空の名刺2箱（架空contactの全5property一致、1件選択したまま全5propertyを非共有）
24. S-770 身分証棚1箱以上（公式FedCM providerごとにbrowser仲介の手動提示を行う。現計画はGoogle 1箱を下限に算入）
25. S-780 三つの財布3箱（承認、意図的拒否、同一handler再試行。trusted eventは証跡で、handler選択・開始経路は固定しない）
26. S-790 活字の鍵1箱（専用fontをOSへinstallし、限定照会した実font dataからglyphを戻す）
27. S-800 Text Fragment組み立て2箱（fragment提示B01、単語提示B02。具体的な英文と対象語は再吟味後に確定）

S-030-B02 / B03はDOMへ選択断片ごとのwrapperを増やさず、RangeとHighlight registryを正本にする。`highlightsFromPoint()`非対応環境ではB03を未観測のまま残す。S-480はページ全体のroot font sizeと`prefers-*` media queryへ影響するため、通常のstage shellへmetaやoverrideを常設せず、同一PWA scope内の専用documentで先に検証する。User Preferences APIのoverrideは開箱演出後と離脱時にclearする。S-610-B02はnative light dismissを中心動詞にするため、`closedby="any"`非対応環境へpointer handlerだけの模倣clearを追加しない。S-620は式を画像化せず、各Unicode文字をcopy可能なtextとしてself-host fontで表示し、17回答の一意性とformatterを自動testする。S-270は4096粒子以下のprobeからframe間隔とGPU完了時間を測り、段階増加gateを通らない環境では本盤面を開始しない。CPU fallback、busy loop、同期readback、粒子ごとのDOM更新を禁止し、停止、hidden、離脱、device lossで新規submitを止める。S-630は明示観測時の`connection.type`だけを使い、速度・RTT・Save Data・IP情報・UA sniff・network requestによる推定を禁止する。S-640はlegacy encoderをruntime実装せず、固定byte fixtureをTextDecoderで検証し、playerには文字コード名でなく復号文字列を入力させる。12回答の非重複、16 labelのfixture内一回制約、12問全体の一意解を自動testする。S-650は4 descriptorのPermissionStatusだけを成功条件にし、位置を破棄、notificationを非送信、camera / microphone trackを即停止する。S-660はCPUの実PressureStateだけを成功条件にし、ゲーム自身によるworker、busy loop、benchmark等の負荷生成を禁止する。GPU版は標準PressureSource追加まで計画値へ含めない。S-670はConsoleをread-only表示に限定し、入力をpage側だけから受ける。DevTools evaluator入力とpage編集を要求せず、色、table列幅、group UI、Console open状態を成功条件にしない。S-680はD-135で体験重複のため不採用とした。S-690は実Text Fragment linkを同一page内で辿り、各jumpの成否やscroll位置をscriptで判定せず、集めたhintの最終回答だけを成功条件にする。謎fixtureの詳細レビュー完了まで実装を開始しない。S-700-B01 / B02はself-hosted動画のround別区間だけをremote再生し、文字鍵入力とQR読取を従来どおり残す。B03は明示`PresentationRequest.start()`からreceiver pageを外部画面へ起動し、実connectedとreceiver readyで開く。通常window、画面ミラーリング、Remote Playback、PiP、local iframe、模擬messageをB03の代替clearにしない。S-550は問題採用済みだが物理操作リスクが高いため、保護された試験環境で誤検知と閾値を確認し、投げる・落とす指示や演出を公開コピーへ入れない。S-590の開始anchor以外のsensor値、音声、transcript、位置、高度は保存・送信しない。

S-710はvideo-only・先頭10秒・640×360・15fpsを基準にし、低い固定bitrate hintと実file size比を表示する。B01 / B03は条件に該当する1 frameだけを置換し、B02はdecode失敗の別経路、B04は固定SimpleTagを検出する。S-720は360×360・12fps・最大約36 frameとし、WebCodecsで入力1 frame対出力1 frameとtimestampを守る。両stageのQR library利用はBarcode Detection APIの採用実績へ数えず、S-700-B02だけは実`BarcodeDetector`を必須にする。

S-710のerror動画と基準fixture、S-720の全fixture / 元QR / 期待画像は、実装前にsource、生成script、codec条件、寸法・フレーム・内容などの意味検証とともに生成してGit管理する。これらをstage起動時に生成しない。S-710のplayer入力由来出力だけはruntime生成を認める。S-710の映像内転記回答は`DARK FRAME`、`BROKEN INPUT`、`SECOND PASS`の最大2語、QRは`BUSYBOX{qr_frame_message}`、S-720は仕様で定めた4つの長い固定QR flagとし、round tokenを混ぜない。

S-730はAR / VRのどちらか一方の実immersive modeで成立させる。B01はsupport probeではなく実sessionと最初のnon-null viewer pose、B02はXRInputSourceのselect rayと`local` spaceの固定箱との交差を条件にする。inline session、page click、DOM overlay、PointerEvent、一般Gamepad、模擬poseへfallbackしない。箱は開始姿勢から無理なく見える位置へ一つだけ置き、歩行、振り返り、現実marker、hit test、anchor、plane / mesh / depth、raw camera、room scanを要求しない。固定model / material / iconはsource、生成手順、checksumとともに実装前にGit管理する。

S-740はinstalled PWAからperiodic syncを登録し、水careを預けた後のclient 0件eventで発芽、再訪して光careを預けた後の別eventで開花させる。二つのcareを先積みできず、毎日、24時間後、countdown、期限、枯死、通知、badge、通常timer、page load、日付変更、通常Background Sync、foreground / synthetic / DevTools debug eventへfallbackしない。発芽・開花assetは通常precacheから外して事前生成・Git管理し、実eventでsame-origin取得する。care / phase receiptは端末localに限定し、開花とresetでtag、store、cacheを削除する。Limited / Experimentalかつ完了時刻を保証できないため通常攻略と全箱必須報酬から外し、H-045のreal scheduler証跡が揃うまで公開しない。

S-750はgame側のSMS backendと電話番号入力を持たず、受信待機開始後に表示するcurrent roundの`@host #code`文面を別の携帯電話または協力者が送る。一箱を、実WebOTP promiseが返した`OTPCredential.code`一致、または空で未汚染の`autocomplete="one-time-code"`欄が一度のtrusted browser editでcurrent code全体へ変化し次frameでも実`:autofill`状態にあること、のORで開く。AutoFill前の手入力、paste、drop、composition、途中編集を拒否し、keydown不在、`insertReplacementText`、timingだけでは開かない。Safari実機でSecurity Code AutoFill後の`:autofill`が観測できなければevent列fallbackを作らず、その環境のAutoFill経路を未観測にする。SMS料金、対応端末、連絡先条件、carrier / OS / 送信者へ公開hostが伝わることを開始前に説明し、H-046の実SMS証跡が揃うまで任意Labsとして公開しない。

S-760は固定のname / email / tel / address / iconを表示し、playerが架空contactをOSへ追加する。B01は実Contact Pickerから返った1件の全5propertyを正規化してfixtureと照合し、B02はB01後の実pickerが1件を返しながら全5propertyが空または欠損の場合だけ開く。B02では共有拒否と元からの欠損、contact identityを区別できないため、「同じcontactを選んだ」「共有OFF操作を検出した」とは表示しない。全property非共有を確定できない実装へgame製pickerや部分共有fallbackを作らない。架空iconは比較用source、生成手順、checksumとともにGit管理し、返却contact dataとBlobはmemory照合後に破棄する。OS accountへ同期され得ることを登録前に説明し、終了後に削除を案内する。H-047の実機証跡が揃うまで任意Labsとして公開しない。

S-770は実装着手時に公式情報を再調査し、公式FedCM提供、一般の第三者siteが行えるRP / client登録、provider自身または信頼できるmanaged IdP、FedCM経路をfallback loginと区別できる肯定的証明、Busybox独自backend / serverless function不要、の全条件を満たすserviceごとに独立箱を置く。各箱は単一providerの明示操作からbrowser所有chooserを開き、provider公式SDKのFedCM専用result、または実`navigator.credentials.get({identity})`が返す期待`configURL`の`IdentityCredential`だけで開く。Google GISでは非空credentialと`select_by === "fedcm"`を要求する。OAuth redirect、popup、broker配下でX等へ通常loginしただけの経路、auto-select、game製pickerは代替clearにしない。tokenとaccount属性はdecode・照合・保存・同期・転送せず直ちに破棄する。すべて任意Labsとし、Google 1箱だけを現計画の187箱へ算入する。追加providerはclient登録と実account PoCを完了した時点で固定problem IDと箱数を追加し、H-049のprovider別証跡が揃うまで公開しない。FedCM操作の成立時に箱だけを開き、provider別完了flagを後置しない。

S-780はBusyboxが管理する架空payment methodと複数の架空handlerだけを使う。trusted `PaymentRequestEvent`はhandler経路の証跡として記録するが単独の箱にはしない。B01は承認responseをmerchantが検証して`complete("success")`へ到達した時、B02は意図的拒否responseを検証して`complete("fail")`へ到達した時、B03は同じhandlerの最初のresponseへ実`retry()`を行い二度目のresponseを成功完了した時に開く。handler選択・merchant側の開始経路は承認／拒否／再試行のいずれにも固定せず、返ったresponseに対応する箱だけを開く。各条件成立時に対応箱だけを開き、結果label、完了message、固定flagを表示しない。handler window内はpayment lifecycleに必要な非言語操作だけに限定する。実payment method、payer / shipping情報、game製payment sheet、handler不在、cancel、例外を代替clearにせず、H-050の実browser証跡が揃うまで任意Labsとして公開しない。

S-790はGit管理するBusybox専用OpenType fontを箱からdownloadし、playerがOS標準UIでuser scopeへinstallした後の明示走査だけを扱う。`queryLocalFonts({ postscriptNames: [expectedName] })`で対象faceだけを要求し、実`FontData.blob()`のmetadata / checksumとBlob由来`FontFace`の専用glyph表示が成立した時にB01だけを直接開く。全font列挙、既存font集合、permissionだけ、`local()`だけ、upload、bundled webfont、名前だけの一致、固定flagを使わない。返却dataを保存・同期・送信せず、H-051でOS install / uninstall、permission persistence / revoke、browser再起動、非対応環境まで確認してから任意Labsとして公開する。

S-060-B02はB01の単純再訪とは別に、offlineで破棄されるsenderからlocal Service Workerへ郵便を渡す。実`sendBeacon()`が`false`なら移動せず、`true`ならreceiverへのfull-document navigationを続ける。workerは専用same-origin POSTだけを検証し、`respondWith()`中に専用IndexedDB receiptをcommitして204を返す。receiverはlistener設置後にstoreを照会し、matching attemptだけを開く。`true`だけ、same-document navigation、通常`fetch({keepalive:true})`、foreground write、単純再訪、tab close / visibilityだけでは開かない。初期receiptはnative broken image、受領後画像は生成手順とchecksumを含めGit管理し、固定flagはDOM textで表示する。H-048が揃うまで未実装扱いとする。

### Wave 7: API全件監査と公開判定

1. MDN / BCD / Web Featuresの固定スナップショットを生成し、未分類をCIエラーにする。
2. 採用、既存stageへ統合、Labs、保留、除外をfamily / interface / member単位で記録する。
3. 実装直前と公開前にLimited / Experimental APIの対応を再確認する。
4. iPhone / iPad Safari、Android Chrome、Windows / macOSの主要browser、通常tab / installed PWA、権限状態、機器なしを人手台帳へ記録する。
5. 参考作品の名称、文面、画像、音、配置、数値、解法順を流用していないことを独立レビューする。

## 優先依存関係

```text
machine-readable ledger ──> stage manifest / CI
mind map ─────────────────> S-190-B04
round protocol ───────────> S-190-B03/B04, S-240-B02, S-310, S-410/420, S-440/450
WebRTC spike ─────────────> S-360 ──> S-190-B03
manifest + install guide ─> S-240, S-310, S-440, S-450, S-460
Service Worker inbox ─────> S-410, S-420
dedicated RP hostname ────> S-380/S-390
Generic Sensor runtime ───> S-520〜S-570
Geolocation runtime ──────> S-590, S-600
media fixture generator ──> S-710, S-720, S-740
frame transform spike ────> S-710
WebCodecs demux/mux spike ─> S-720
WebXR hardware spike ──────> S-730
installed PWA + real scheduler ─> S-740
real SMS sender + WebOTP / OTP AutoFill device ─> S-750
official FedCM provider audit + public client registration + real accounts ─> S-770
Payment Handler manifests + HTTPS browser PoC ─> S-780
OpenType fixture生成 + desktop Chromium / OS install PoC ─> S-790
```

## 共通完了条件

- 成功は対象APIの実event / reading / payloadからのみ導出する。
- 非対応、権限拒否、取消、機器なしに代替clear、skip、模擬入力を用意しない。
- 条件不成立はその問題を未観測のままにし、他ステージの利用を壊さない。
- stage離脱、再入場、reload、visibility変化でlistener、stream、track、sensor、lock、peer connectionを確実に解放する。
- 生のcamera、microphone、screen、sensor、clipboard、位置情報を進捗やDriveへ保存しない。明記されたS-590の短命anchorだけを例外とする。
- 事前生成可能な動画・音声・画像はsource、生成条件、codec / 寸法 / フレーム / 内容などの意味検証とともにGit管理し、runtime生成しない。Gitのコミットが固定assetの同一性を担保する。
- 同期・リアルタイム性が本質でない合言葉は固定し、copy可能なら説明的な長い`BUSYBOX{...}`、転記が必要なら最大2語にする。
- 一つのAPI名につき一問を量産せず、同じ中心操作は既存stageへ統合する。
- 自動test、型check、buildに加え、Limited / Experimental、PWA、権限、実機条件は人手証跡が揃うまで公開合格にしない。

## 2026-07-20公式情報の再確認

- [Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/)はconditional mediationの能力確認と`AbortSignal`による中断を定義する。Conditional requestはdocument lifetime中待機し得るため、S-380 / S-390は明示cleanupが必要。
- [Notifications Living Standard](https://notifications.spec.whatwg.org/)ではaction数は実装・platform依存で0以上であり、`image`も表示されない場合がある。S-410 / S-420とS-190-B05は実機PoCを外せない。
- [MDNのFile Handling解説](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA)ではinstalled PWA、manifestの`file_handlers`、`LaunchQueue`が必要で、現状はdesktop Chromium系に限定される。
- [Web App Manifest member一覧](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference)で、shortcuts、share_target、note_taking、file_handlers、protocol_handlers、launch_handler、display_overrideを別々のmemberとして再確認した。
- [`<meta name="text-scale">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/text-scale)は2026-07-20時点でExperimental / Limitedであり、最大200〜300%超の設定でもlayoutを壊さない検証が必要。
- [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)はSecure Context限定かつLimited availabilityで、`chargingchange`と`levelchange`を提供する。
