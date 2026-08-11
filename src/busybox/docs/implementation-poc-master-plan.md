# 実装PoCマスタープラン

> この文書はPoC計画時の箱IDと件数を保存する履歴資料である。D-143後、旧S-350-B04 Media Capabilitiesと旧B06実寸reelは不採用、旧B05はS-810-B01、旧B07は現行S-350-B05、旧S-230-B01は現行S-350-B06、旧B08の音声track案は合意済みIDの将来B07である。現行S-350-B04はnative再生速度。本文のS-230とS-270は現行stageではなく、現行計画へ使わない。現行の箱IDと解法は[現行ステージ解法仕様](./stage-walkthroughs.md)を正とする。

> 作成日: 2026-08-01。対象は現在の79stage・187箱計画のうち、未実装の追加箱、新規stage、全面再設計、およびstage ID未予約だが実装内容が確定した統合案である。S-680はD-135で不採用となり、S-800はD-136で追加された。

> 2026-08-09方針変更: D-137により、現環境でAPIまたは中心経路を確認済みで、製品実装上の不確実性を実stageで追加確認できる箱は、PARTIALのままでも箱単位の未確認条件を保持して実装へ進める。対象と停止条件は[現環境確認分の一括実装計画](./current-environment-implementation-plan.md)を正とする。API非対応、外部環境だけが中心経路、問題未確定の箱は従来どおり実装しない。

## 目的

実装へ入った後でAPI非対応、OS差、fixture不成立、cleanup不能が判明することを避けるため、成立性に不確実性がある案を先に最小試作する。この文書を「何にPoCが必要か」「どのように試すか」「何をもって実装へ進めるか」の正本とする。

[ステージ実装状況](./stage-implementation-status.md)を実装済み／未実装の正本、[人手確認台帳](./human-test-matrix.md)を公開前の環境確認の正本、[ステージ展開計画](./stage-rollout-plan.md)を依存関係と実装waveの正本とする。古い計画表に「技術スパイク待ち」と残っていても、現在コード化済みのstageは本書の「実装前PoC」へ戻さない。

## 対象範囲

含めるもの:

- `stage-implementation-status.md`で未実装、追加承認、全面再設計、詳細保留になっている案
- DR-136のInvoker Commands追加箱のように、内容は確定したがstage IDと箱数をまだ予約していない具体的な統合案
- すでに最小試作済みでも、再現可能な証跡とnegative pathが揃っていない案

含めないもの:

- すでにコード化済みで、残作業が通常の人手確認だけのstage。これらは[人手確認台帳](./human-test-matrix.md)で扱う
- 却下済みのS-190-B05 notification marker、S-470 Tabbed Application Mode等
- Deep Researchで`採用`に分類しただけで、stage ID、箱、成功条件をまだ予約していない研究候補。具体案を確定した時点で本書へPoC行を追加する
- 通常のunit test、component test、accessibility testだけで確定でき、API／環境／fixtureの成立性を先に試す必要がない変更

## PoCと公開前確認の区別

| 種別 | 目的 | 実装開始条件 |
| --- | --- | --- |
| 成立性PoC | API、OS、機器、権限、cross-context境界が中心動詞を実現できるか確かめる | 合格証跡が必要。失敗時はaffected boxを保留・再相談し、模倣fallbackを作らない |
| fixture／algorithm PoC | media、font、文字、codec、変換列が一意かつ再生成可能か確かめる | fixture source、生成手順、checksum、期待結果が必要 |
| UX PoC | API固有挙動がplayerへ理解可能で、game製UIの総当たりにならないか確かめる | 最小prototypeと観察記録が必要 |
| 公開前人手確認 | 実装済みの製品コードが対象環境で動くか確かめる | `H-xxx`を合格させる。実装前PoCとは別管理 |

## 共通実行規約

すべてのPoCは次を満たす。

1. 最初にMDN、仕様、browser公式情報を再確認し、調査日と対象browser versionを結果へ記録する。Deprecatedになった機能は試作前に採否を再相談する。
2. 製品stageへ直接書き込まず、最小のisolated page、script、fixture generatorから始める。PoC codeを製品へ移す場合は、通常の型、cleanup、testへ書き直す。
3. success pathだけでなく、cancel、deny、unsupported、stale、duplicate、reset、離脱、resource cleanupを確認する。
4. DevToolsのsynthetic event、browser flag、mock、stubは配線確認に使えるが、player向け成立性の肯定証拠にしない。
5. 実機・外部account・OS設定が必要な操作は事前にユーザーの許可を得る。font、contact、passkey、PWA関連付け、site permission等の削除・解除手順を結果へ残す。
6. 生のsensor値、位置、contact、token、font一覧、media frame等をrepository、進捗、Drive、analytics、外部endpointへ保存しない。
7. 事前生成できるmedia／fontはsource、license、生成script、codecまたはformat条件、checksumをGit管理する。PoC用fixtureも最終採用時に同じ規約へ移す。
8. 結果文書には`PASS`、`PARTIAL`、`FAIL`、`BLOCKED`のいずれか、対象環境、再現手順、証跡、残る不確実性、採る対応を記録する。
9. 共通PoC隔離ページへprobeを追加する場合は、PoCごとに独立したnative `details` / `summary`へ収める。同一階層では`details[name]`による排他的accordionとし、長いfixture表や実行buttonを初期表示へ展開し続けない。

実施結果は[実装PoC 実施記録](./poc-results.md)へ対象ごとに保存する。大量のbinaryや録画を無条件にcommitせず、必要なfixtureだけを生成sourceとchecksum付きで所定のasset directoryへ置く。

## 全未実装案のPoC要否対応表

| 対象 | 未実装範囲 | 判定 | PoC |
| --- | --- | --- | --- |
| S-020 | meter表示 | 不要。成功条件でなく既存viewport値の表示だけ | — |
| S-030 | B02複数Range、B03 `highlightsFromPoint()` | 必要 | POC-001 |
| S-060 | B02 offline Beacon郵便 | 必要。最小Chromium試作は済み、再現証跡を作る | POC-002 |
| S-150 | B02不可視箱focus | 不要。標準focus eventと自動testで確定する | — |
| S-150 / S-610 | B03排他的details、Dialog 3経路 | 必要 | POC-003 |
| S-220 | B04 Navigation branch破棄 | 必要 | POC-004 |
| S-270 | WebGPU全面再設計 | 必要 | POC-005 |
| S-350 | B04〜B08 media能力・frame・track | 必要 | POC-006 |
| S-430 | B02 Audio Session interruption | 必要 | POC-007 |
| S-480 | B05〜B09 User Preferences override | 必要 | POC-008 |
| S-510 | B02 cross-origin iframe D&D | 必要。B01も境界回帰を同時確認 | POC-009 |
| S-580 | B02 SpeechSynthesis変換音声 | 必要 | POC-010 |
| S-620 | Unicode数字17箱 | 必要 | POC-011 |
| S-630 | Network Information `type` 4箱 | 必要 | POC-012 |
| S-640 | Encoding fixture 12箱 | 必要 | POC-013 |
| S-650 | Permissions API 4箱 | 必要 | POC-014 |
| S-660 | Compute Pressure 4箱 | 必要 | POC-015 |
| S-670 | Console迷路 | 必要 | POC-016 |
| S-680 | Console診断卓 | D-135で不採用。実装しない | POC-017 |
| S-690 | Text Fragment巡回 | 必要。謎fixture自体が未確定 | POC-018 |
| S-700 | B01 / B02 Remote PlaybackとQR | 必要 | POC-019 |
| S-700 | B03 Presentation receiver | 必要 | POC-020 |
| S-710 | 動画変換4箱 | 必要 | POC-021 |
| S-720 | 映像復元4箱 | 必要 | POC-022 |
| S-730 | WebXR 2箱 | 必要 | POC-023 |
| S-740 | Periodic Background Sync植物 | 必要 | POC-024 |
| S-750 | WebOTP／Security Code AutoFill | 必要 | POC-025 |
| S-760 | Contact Picker 2箱 | 必要 | POC-026 |
| S-770 | FedCM provider箱 | 必要 | POC-027 |
| S-780 | Payment Handler 4箱 | 必要 | POC-028 |
| S-790 | Local Font Access 1箱 | 必要 | POC-029 |
| S-800 | Text Fragment組み立て2箱 | 必要。`hidden=until-found`からの実Text Fragment matchと`beforematch`の対応差を問題fixture確定後に確認する | POC-032 |
| DR-041追加箱 | Invoker Commands統合、stage ID未予約 | 必要 | POC-030 |
| S-230 / S-350 / S-430 | 既実装のbrowser／OS所有media controls | 必要。既実装でも公開成立性は未証明 | POC-031 |

## 個別PoC計画

### POC-001 S-030 Custom Highlight

- 種別: 成立性＋layout PoC
- 最小構成: wrapping、bidi、重なりを含むtext、3個のRangeを持つHighlight、通常Selection、pointer座標logを一つのpageへ置く。
- 手順: Rangeを順に追加し、Selectionを別位置へ移動した後も描画が残ることを確認する。重なり、行折返し、bidi境界をmouse／touch／penで指し、`highlightsFromPoint()`の返す集合を記録する。
- 合格条件: B02の3 RangeがSelectionから独立して保持される。B03でtrusted pointer位置の期待Highlight集合を取得でき、DOM wrapperや手計算矩形を使わず判定できる。
- failure: B02とB03を別判定する。B03だけ不成立ならB02は進め、B03は未観測または再相談とする。
- 成果物: 対象browser表、layout fixture、期待hit集合、自動化可能部分のtest vector。対応: H-001〜H-004、H-020、H-025。

### POC-002 S-060-B02 offline Beacon郵便

- 種別: 成立性PoC。backend停止中のChromium最小試作は既に成功しているため、再現可能な製品化gateを作る。
- 最小構成: sender、receiver、Service Worker、専用same-origin POST、IndexedDB receipt、native broken imageと受領済みasset。
- 手順: onlineでworker制御とcacheを確立し、server停止またはofflineにする。明示投函で`sendBeacon()`を呼び、`true`時だけreceiverへfull-document navigationする。workerがPOSTを検証し、`respondWith()`中にreceipt commitしてからreceiverが照会する。
- 合格条件: server不在でもreceiptが一度だけcommitされる。`false`、通常fetch、same-document遷移、foreground直接write、単純再訪、wrong／stale attemptでは開かない。
- failure: browserごとの違いを記録し、成立する公開対象だけへ限定する。`sendBeacon() === true`だけを成功証拠にしない。
- 成果物: 再現script、network／worker／IndexedDB時系列、race negative case、H-048記録。

### POC-003 S-150-B03／S-610 native disclosure・dialog

- 種別: 成立性PoC
- 最小構成: 同じ`name`を持つ複数`details`と、`closedby="any"`のmodal dialog。×button、外側操作、Esc／platform dismissを個別に記録する。
- 手順: detailsの排他的toggle列をkeyboardとpointerで確認する。dialogでは直前trusted action、`cancel`、`close`、return value、open stateの列を比較する。
- 合格条件: detailsの排他状態をnative挙動として観測できる。dialogの3経路をscript製backdrop handlerなしで安定して分離できる。
- failure: 不成立経路だけを未観測または再相談とし、pointer eventでnative light dismissを模倣しない。
- 成果物: browser別event trace、keyboard／touch結果、採用する最小判定表。

### POC-004 S-220-B04 Navigation branch破棄

- 種別: 成立性PoC
- 最小構成: A→B→Cのsame-document entry、browser BackでAへ戻った後のD分岐、entryごとの`dispose` listener。
- 手順: browser UIまたはtrusted history navigationでAへ戻りDへ進む。旧B／C双方の`dispose`と`navigation.canGoForward`を記録する。reload、BFCache、連打も試す。
- 合格条件: old forward branchの破棄を実Navigation API eventで観測し、`canGoForward === false`と組み合わせて判定できる。
- failure: History APIによる模倣やscript traverseへ置換せず、B04を未観測または再相談とする。
- 成果物: entry IDを個人情報なしで記したevent sequence、browser差、H-022シナリオ。

### POC-005 S-270 WebGPU光粒子盤面

- 種別: performance＋safety＋UX PoC
- 最小構成: 4096粒子から段階増加するcompute／render loop、磁石またはレンズ一つ、受光器二つ、frame間隔とGPU完了時間の監視。
- 手順: hardware GPU、software adapter相当、低性能環境、device lossで段階gateを測る。hidden、離脱、stopで新規submitが止まることを確認する。少人数に操作してもらい、並列物量が知覚できるか確認する。
- 合格条件: target frame budget内で数万以上の粒子が操作へ同時反応し、複数受光器の条件を再現できる。CPU fallback、busy loop、同期readback、粒子ごとのDOM更新がない。
- failure: 粒子数を端末別に安全に下げても並列性が見えない場合は再設計する。CPU版へ置換しない。
- 成果物: threshold表、GPU resource lifecycle、操作動画または数値証跡、H-031結果。

### POC-006 S-350-B04〜B08 native media能力・frame・track

- 種別: API＋fixture PoC
- 最小構成: 複数codec／resolution profile、24fps区間を含むreel、字幕track、条件付き音声track、生成manifest。
- 手順: `decodingInfo()`候補順位、`requestVideoFrameCallback()`の実提示frame、`videoWidth`／`videoHeight`、native track選択eventを別々に観測する。
- 合格条件: B04〜B08が同じeventの言い換えにならず、各fixtureで一つの成功条件だけが成立する。native画質menuの選択値を推測しない。
- failure: 音声track選択を観測できないbrowserではB08を未観測とする。game製track pickerへ置換しない。
- 成果物: source、生成script、codec条件、checksum、profile期待表、H-030結果。

### POC-007 S-430-B02 Audio Session interruption

- 種別: 実機成立性PoC
- 最小構成: controlsなしの固定loop audio、Media Session、Audio Session state log。
- 手順: `active`後、別app／別tab／system audio focusで実`interrupted`を発生させ、外部音声終了後の`active`復帰とmedia再生再開を観測する。通常pauseと`inactive`をnegativeにする。
- 合格条件: game自身が中断を生成せず、`active → interrupted → active`と実再生復帰を同一attemptで観測できる。
- failure: 通常pauseやMedia Session pause actionをB02へ流用せず、対応環境限定または保留とする。
- 成果物: Safari／WebKit中心のstate trace、cleanup結果、H-039記録。

### POC-008 S-480-B05〜B09 User Preferences override

- 種別: 成立性PoC
- 最小構成: 5種類のPreferenceObject、対応`matchMedia()`表示、request／clear操作。
- 手順: 各`requestOverride()`を単独で実行し、実効media query、拒否、競合、clear、stage離脱後を確認する。
- 合格条件: 各overrideがbrowser機能として実効値へ反映され、別箱として分離でき、開箱後と離脱時に確実に解除できる。
- failure: CSS classによる模倣clearを作らず、非対応箱を未観測にする。
- 成果物: feature／browser表、5 preferenceのtrace、cleanup証跡。

### POC-009 S-510 cross-window／cross-origin Drag and Drop

- 種別: 境界成立性PoC
- 最小構成: installed PWA source window、通常browser destination、別静的origin iframe、透明PNG layer 3枚、current payload。
- 手順: B01でPNG `File`をwindow境界越しにdropし、B02でiframe画像を親へdragして`text/uri-list`とpayloadを読む。mouse／trackpadを確認し、可能ならtouch差も記録する。
- 合格条件: drag data storeが各境界を越え、B01は実File、B02は期待asset URLとcurrent payloadを得る。別origin DOMへの直接アクセスは使わない。
- failure: clipboard、download→upload、postMessage、同一origin iframeへ置換しない。成立する環境だけへ限定する。
- 成果物: helper origin構成、DataTransfer type trace、fixture checksum、H-025相当の境界結果。

### POC-010 S-580-B02 SpeechSynthesis変換音声

- 種別: API＋聴取UX PoC
- 最小構成: 一文字ずつqueueする`aspuwiq`変換列、voice準備、start／end／error trace、停止操作。
- 手順: 画面へ答えを出さず発話し、voice未準備、cancel、途中error、background、連続再試行を確認する。少人数で変換規則を聞き取れるか試す。
- 合格条件: start後に全文が順にendした時だけ判定でき、表示や録音を成功条件へ使わない。発話速度と間隔が理解可能かつ過剰に長くない。
- failure: browserがqueue／endを安定通知しない場合は対応限定。文字列表示への置換はしない。
- 成果物: utterance sequence、voice差、聴取所見、H-027結果。

### POC-011 S-620 Unicode数字17箱

- 種別: fixture＋font＋puzzle PoC
- 最小構成: 17記数法の3桁＋3桁式、候補self-host font、ASCII回答generator。
- 手順: glyph coverage、font license、RTL、Mayan縦積み、算木の交互表記、基数20、copy結果、bidi隔離をbrowser別に確認する。全回答が異なり、ヒントなしでも調査可能か検証する。
- 合格条件: 17式が実textとして正しく描画・copyでき、全回答が一意で、不可視／置換glyph／私用領域依存がない。
- failure: 表現不能な記数法だけを別fixtureへ再設計し、画像化や`@counter-style`へ逃げない。
- 成果物: font source／license／checksum、式generator、expected answer table、render screenshot。

### POC-012 S-630 Network Information `type`

- 種別: 実機成立性PoC
- 最小構成: 明示走査button、`connection.type`と`change`だけを一時表示するprobe。
- 手順: 対応Android／ChromeOS等でWi-Fi、cellular、ethernet、Bluetooth tetheringを切り替える。unknown、none、property欠損、再訪を確認する。
- 合格条件: 少なくとも公開対象環境で各採用typeを実値として区別でき、速度、RTT、IP、UA sniff、通信試験を使わない。
- failure: 取得不能typeを別signalで推定せず、箱単位で未観測または構成再相談とする。
- 成果物: OS／接続方式／返却値matrix、change timing、H-032結果。

### POC-013 S-640 Encoding fixture

- 種別: fixture／algorithm PoC
- 最小構成: 2進4問、16進4問、文字化け4問、16 encoding label、fatal decode validator。
- 手順: WHATWG `TextDecoder`で全候補をdecodeし、置換文字、control、不可視、私用領域を拒否する。16 label一回制約を含めた全体解をsolverで総当たりする。
- 合格条件: 正解割当が一意で、全fixtureが対象browserで同じ期待textを返し、B10を含む12問に表示上の曖昧さがない。
- failure: fixture byte列を再生成する。runtimeへlegacy encoderを実装しない。
- 成果物: binary／hex fixture、generator、solver、一意性test、checksum。

### POC-014 S-650 Permissions API四権限

- 種別: browser／OS成立性PoC
- 最小構成: geolocation、notifications、camera、microphoneのPermissionStatus、native request、focus再照会、media track cleanup。
- 手順: prompt／granted／denied、site settings外部変更、`change`、focus復帰、OS拒否、Permissions Policy、descriptor非対応を確認する。
- 合格条件: request成功でなく実PermissionStatusが`granted`になった時だけ開き、外部変更も再照会できる。camera／microphone trackを即停止できる。
- failure: permission prompt表示やstream取得だけを代替clearにしない。descriptor非対応箱は未観測。
- 成果物: browser／OS／permission matrix、event trace、遅延stream cleanup、H-034結果。

### POC-015 S-660 Compute Pressure四状態

- 種別: 成立性＋安全性PoC
- 最小構成: `PressureObserver`、known sources、passive CPU record表示、disconnect操作。test用virtual sourceまたはstubは配線確認だけに使う。
- 手順: 対応Chromiumで初期record、visibility、停止、policy拒否を確認する。ゲームからworker、benchmark、busy loopを起動しない。自動testでは4 stateのmappingだけをvirtual sourceで確認する。
- 合格条件: 実端末で少なくともpassive recordを受け、実stateをそのまま箱へ対応できる。timestamp／状態列を保存しない。
- failure: 4状態を発生させる負荷generatorを追加しない。対象環境限定の任意Labsとして扱う。
- 成果物: real／virtual証拠の区別、lifecycle trace、H-035結果。

### POC-016 S-670 Console迷路

- 種別: UX PoC
- 最小構成: ASCII迷路、現在位置、壁、出口、page側direction button／keyboard、Console再表示button。
- 手順: desktop Chromium、Firefox、SafariのConsoleで幅、font、group、長いlog後を確認する。Console入力なしで数名が往復操作できるか観察する。
- 合格条件: color、列幅、group展開に依存せずplain textで盤面が読め、page編集やevaluator入力なしに出口へ到達できる。
- failure: browser別表示差で迷路が崩れる場合はASCII記号と幅を単純化する。Console APIを通常DOM表示へ置換しない。
- 成果物: 各Console screenshot、操作時間、誤読箇所、H-036結果。

### POC-017 S-680 Console診断卓

- 種別: design＋UX PoC
- 最小構成: 候補signal、switch／dial、相互依存式を2案以上作り、`console.table()`とplain textを同じ情報から生成する。
- 手順: 部分成立、全成立、誤操作、総当たりを試し、説明なしまたは最小hintで規則を推測できるか観察する。
- 合格条件: Consoleが実質的な別計器盤になり、page側だけの操作で解ける。単純全探索より観察と推論が有利で、table非対応でも同じ情報が読める。
- failure: signal名、値域、数式、正解組を再設計する。詳細レビュー完了まで製品stageを実装しない。
- 成果物: 候補2案、選定理由、操作trace、理解度所見、H-037結果。

### POC-018 S-690 Text Fragment巡回

- 種別: browser成立性＋puzzle UX PoC
- 最小構成: 同一pageの長文、4〜6個のText Fragment link、最終回答だけを受けるinput。巡回順の候補を2案作る。
- 手順: link activation、UA highlight、scroll、Back、reload、keyboard、layout変化を確認する。scriptは各jumpやscroll位置を判定しない。数名にhint収集を試してもらう。
- 合格条件: 対応browserでfragmentごとの対象が視覚的に分かり、同一page内を繰り返し移動できる。最終回答だけで一意に解ける。
- failure: 通常anchor、IntersectionObserver、game製highlightで代替clearを作らない。謎fixtureを再設計し、詳細確定まで実装しない。
- 成果物: 長文fixture候補、fragment URL一覧、browser screenshot、解答経路、H-038結果。

### POC-019 S-700-B01／B02 Remote PlaybackとQR

- 種別: 外部機器成立性PoC
- 最小構成: 文字区間とround別QR区間を持つ動画、Remote Playback sender、camera reader、実`BarcodeDetector`。
- 手順: 機器なし、picker cancel、connecting、connected、切断、再接続を確認する。B01は外部画面の文字を手元入力、B02は外部画面のQRを手元cameraで読む。
- 合格条件: 接続中の外部再生だけで各手掛かりを得られ、local再生、PiP、接続前、固定QR、手入力では該当箱が開かない。
- failure: Remote Playback非対応を画面ミラーリングや通常windowで代替しない。B02のAPI固有経路はJS decoderへ置換しない。
- 成果物: 機器matrix、fixture source／checksum、connection trace、H-040結果。

### POC-020 S-700-B03 Presentation receiver

- 種別: 外部機器成立性PoC
- 最小構成: controller page、receiver page、round付きready handshake、close／terminate操作。
- 手順: 明示`PresentationRequest.start()`からpickerを開き、外部画面へreceiverを表示する。connected後、receiver初期描画済みのreadyを返す。cancel、load failure、wrong round、disconnectを試す。
- 合格条件: 実Presentation connectionと外部receiver表示が揃った時だけB03を開ける。
- failure: screen mirroring、Remote Playback、PiP、local iframe、`window.open()`、mock messageを代替clearにしない。
- 成果物: 対応display／browser表、handshake trace、cleanup、H-041結果。

### POC-021 S-710 動画変換

- 種別: media pipeline／fixture PoC
- 最小構成: file inputと最大10秒webcam、worker、TrackProcessor／Generator、低bitrate recorder、WebM metadata remux、QR detector、4種fixture。
- 手順: 暗黒境界、decode不能file、QR frame、自己生成metadata再入力を個別に通す。該当1 frameだけの差替え、全frame overlay、実size比、download再生を確認する。
- 合格条件: B01／B03はsampleされた該当frameだけ、B02は入力失敗の別経路、B04はmetadata付き出力再入力だけで成立する。queueとmemoryが10秒上限でboundedになる。
- failure: frame単位処理、metadata保持、codecのいずれかが不安定ならcontainer／codec候補を再比較する。高負荷化やbackend変換へ逃げない。
- 成果物: fixture、generator、codec matrix、size結果、frame trace、cleanup、H-042結果。

### POC-022 S-720 映像復元

- 種別: algorithm／codec／fixture PoC
- 最小構成: 360×360元QR、T1左右交換、T2時間方向二値乗算、T3奇数左／偶数右、demux／mux、QR helper。
- 手順: 各変換を単独・連結し、入力1 frame対出力1 frame、timestamp、parity、白黒再正規化を検証する。途中動画が意図せずdecodeできないか確認する。
- 合格条件: 4つの期待経路だけが固定QRを復元し、B03／B04の入力fixtureはbyte-identicalで、bounded queueを維持する。
- failure: MediaRecorderへ置換してparityを失わない。fixtureまたはtransform定義を再生成する。
- 成果物: 全source／fixture／checksum、transform verifier、QR decode matrix、H-043結果。

### POC-023 S-730 WebXR

- 種別: XR実機成立性PoC
- 最小構成: 一つの静止XR箱、viewer pose、実XRInputSource select ray、ray hit判定、session cleanup。
- 手順: ARまたはVR機器でsupport probe、picker cancel、immersive session、最初のnon-null pose、controller／screen／gaze select、hit／miss、session endを確認する。
- 合格条件: B01は実immersive sessionとpose、B02は実input sourceのray hitでのみ開く。静止したまま安全に完了できる。
- failure: inline session、DOM overlay、PointerEvent、Gamepad、mock poseへ置換しない。機器別に任意Labs公開を判断する。
- 成果物: hardware／browser matrix、pose／hitの非保存trace、resource cleanup、H-044結果。

### POC-024 S-740 Periodic Background Sync植物

- 種別: 長期scheduler PoC
- 最小構成: installed PWA、Service Worker、care／phase専用IndexedDB、seed／sprout／flower asset、periodicsync tag。
- 手順: 水を預けてwindow client 0件にし、実scheduler eventを待つ。発芽後の別訪問で光を預け、別の実eventで開花させる。permission、engagement、browser終了、OS停止、unregister、resetを長期観測する。
- 合格条件: foreground event、page load、timer、通常Background Sync、synthetic／DevTools発火で成長せず、実scheduler event二回だけでphaseが進む。
- failure: 発火時刻を保証するcopy、通知、30分timerへ置換しない。対象環境で実event証拠が得られなければ長期保留とする。
- 成果物: 日時付きevent log、client数、phase receipt、asset cache、unregister結果、H-045記録。

### POC-025 S-750 WebOTP／Security Code AutoFill

- 種別: 実SMS／browser UI成立性PoC
- 最小構成: current round code、origin-bound SMS文面、空の`autocomplete="one-time-code"` input、WebOTP AbortController、autofill検出probe。
- 手順: 別送信者からAndroidへ実SMSを送り、native確認後の`OTPCredential`を確認する。iOSではSecurity Code AutoFillから空inputへ一括入力し、trusted input、current code、実`:autofill`を確認する。
- 合格条件: いずれかのOTP専用経路を肯定的に識別でき、manual type、paste、drop、composition、programmatic value、通常候補を拒否できる。
- failure: event列だけでAutoFillを推定しない。Safariでpseudo-classを観測できなければその経路は未観測。
- 成果物: OS／browser別trace、SMS費用・privacy説明、abort／timeout cleanup、H-046結果。

### POC-026 S-760 Contact Picker

- 種別: Android実機成立性PoC
- 最小構成: 固定name／email／tel／address／iconの架空contact、native picker、正規化／icon比較probe。
- 手順: OSへ架空contactを追加し、B01で5 propertyを共有する。B02で同じ5 propertyを要求し、すべて非共有のまま1件を確定できるか試す。crop／resize／recompress、0／multiple、cancelを確認する。
- 合格条件: B01は全5 property一致、B02はpickerが1件を返しながら全配列が空または欠損になる。pageはcontact identityや拒否理由を推定しない。
- failure: 全OFFで確定できなければB02を未観測とし、game製pickerや空contact作成へfallbackしない。
- 成果物: Android／Chrome結果、icon fixture／checksum、同期説明、削除手順、H-047結果。

### POC-027 S-770 FedCM provider

- 種別: 現行情報監査＋外部service実連携PoC
- 最小構成: provider候補台帳、公開origin、provider別client、manual FedCM adapter。まずGoogle下限を検証する。
- 手順: 公式FedCM提供、一般向けRP登録、managed IdP、独自backend不要、fallback loginと区別できる肯定的resultを公式資料で確認する。実accountでbrowser chooserを手動完了する。
- 合格条件: provider公式経路でmanual FedCM証拠を得られ、token／account属性をdecode・保存・送信せず対応箱だけ開ける。Google GISでは非空credentialと`select_by === "fedcm"`を要求する。
- failure: OAuth redirect、popup、broker経由の通常SNS login、auto-selectを箱へ数えない。条件を満たさないproviderは追加しない。
- 成果物: provider audit表、client登録証跡、公式URL、実account結果、解除方法、H-049結果。

### POC-028 S-780 Payment Handler

- 種別: browser payment lifecycle成立性PoC
- 最小構成: Git管理する架空payment method、複数payment app manifest、handler Service Worker、handler window、merchant page。
- 手順: browser所有候補から正しいhandlerを選びtrusted `PaymentRequestEvent`を得る。承認→`complete("success")`、意図的拒否→`complete("fail")`、最初のresponse→`retry()`→同一handler二度目成功を別々に試す。
- 合格条件: B01〜B04を実browser lifecycleで分離でき、実provider、実通貨、payer data、game製payment sheetを使わない。
- failure: cancel、handler不在、例外を意図的拒否へ数えない。候補UIまたはretryが成立しなければaffected boxを再相談する。
- 成果物: manifest群、trusted event trace、window lifecycle、cleanup、H-050結果。

### POC-029 S-790 Local Font Access

- 種別: OS変更＋permission＋font data PoC
- 最小構成: 最小のBusybox専用OTF、生成source／script／license／checksum、download page、限定`queryLocalFonts()` probe、Blob validator、専用glyph。
- 手順: OS標準UIでuser scopeへinstallし、明示走査から`queryLocalFonts({ postscriptNames: [expectedName] })`を実行する。`FontData.blob()`のmetadata／checksumを検証し、Blob由来FontFaceでglyphを表示する。browser再起動、uninstall、permission revokeも確認する。
- 合格条件: system fontになった専用fixtureだけを限定照会で再発見し、名前だけでなく実dataを確認できる。全font列挙、upload、`local()`だけ、bundled webfontでは開かない。
- failure: OSがbytesを書き換える場合は不変tableをPoCで特定する。名前だけへのfallbackはしない。
- 成果物: OTF一式、OS／browser matrix、raw data比較、cleanup手順、H-051結果。

### POC-030 DR-041 Invoker Commands追加箱

- 種別: 仕様／browser成立性PoC
- 最小構成: 一つのPopover、複数の`commandfor` button、built-in commandとcustom command、`CommandEvent.source` trace。
- 手順: pointer／keyboardで各buttonを起動し、対象側の`command`、`source`、Popover stateを確認する。scriptから直接`showPopover()`した場合と比較する。
- 合格条件: 同じ対象へ届いた実CommandEventのsourceとcommandを使い、正しい呼び出し元列を判定できる。
- failure: click handlerの`data-*`や直接Popover操作へ置換しない。実装対象browserが揃わなければstage ID予約を保留する。
- 成果物: browser event trace、keyboard結果、DR-041へ追加する箱仕様と箱数判断。

### POC-031 S-230／S-350-B01〜B03／S-430-B01 browser・OS media controls

- 種別: browser／OS所有UIの成立性＋既実装回帰PoC
- 最小構成: Git管理するseek可能な短尺音声付き動画、`<video controls>`、PiP入退場event、controlsなしの固定loop audio、Media Session action logを一つの隔離pageへ置く。
- 手順: S-350はnative playerだけでseek、mute、実再生後pauseを行い、各event列が対応する一条件だけを満たすことを確認する。S-230はbrowserがnative playerへPiP操作を提示する場合、その操作と現在のpage内`requestPictureInPicture()`経路を分けて`enterpictureinpicture`／`leavepictureinpicture`を記録する。S-430はOS control surface、lock screen、media key、headset、browser media UIから届くMedia Session `pause`を確認し、探索項目として`play`、`seekbackward`、`seekforward`、`seekto`、`previoustrack`、`nexttrack`の提示有無とaction typeを記録する。
- 合格条件: S-350-B01〜B03、S-230-B01、S-430-B01がgame製controlやscript dispatchなしで成立し、別stageのeventを代替clearに流用しない。Media Sessionはaction typeを区別できる一方、OSとbrowser UIなどaction sourceを区別できない境界を受け入れる。
- failure: native controlが提示されない環境では該当経路を未観測とする。PiPの入口設計変更やMedia Sessionのplay／seek／前後track追加箱は、このPoC結果を見て別途相談し、今回の計画だけで箱数を増やさない。
- 成果物: OS／browser／表示surface別の操作表、event/action trace、S-230入口比較、negative case、H-052記録。

### POC-032 S-800 Text Fragment組み立て

- 種別: browser成立性＋UX PoC
- 最小構成: 一つの英文block、互いに異なる二つの`hidden="until-found"`対象語、B01用のpercent-encoded `textStart`とpunctuation context、B02用の可視単語、document-level `beforematch` log。
- 手順: address barへ各fragment付き同一page URLを貼り、対象語だけが出現してUA highlightされ、対応する`beforematch`だけが発火することを確認する。Back、reload、複数回、誤fragment、通常anchor、find-in-page、非対応browserも比較する。
- 合格条件: B01 / B02の実Text Fragment navigationで対象語が一意にmatchし、別の箱を開かない。提示fragmentからB01の対象語が平文で直接読めず、B02は単語からfragmentを組み立てられる。
- failure: 可視Text Fragmentのscroll位置や独自highlightで代替判定しない。`beforematch`非対応環境は未観測とし、find-in-pageによる既知の迂回と空欄の読みづらさが許容できない場合は実装前に再相談する。
- 成果物: 確定した英文fixture、B01 / B02 URL、browser差、event trace、H-038更新。

## すでに実装済みで公開前実機確認だけが残るもの

原則として次は製品コードがすでに存在するため[人手確認台帳](./human-test-matrix.md)で扱う。ただし、browser／OS所有UIそのものが体験の中心で、実装済みであることだけでは成立性を証明できないmedia controlsはPOC-031として明示的に戻した。

| 分類 | 対象 |
| --- | --- |
| 複数context／browser UI | S-190-B01〜B04、S-230〜S-260、S-310〜S-340、S-360、S-380〜S-420 |
| 機器／PWA／OS統合 | S-280〜S-300、S-370、S-440〜S-460 |
| Generic Sensor／位置 | S-520〜S-570、S-590、S-600 |
| 基礎stageのbrowser差 | その他「実装済み・人手確認待ち」のS-010〜S-600 |

S-190-B05は不採用、S-380とS-390は別stageに確定済みである。古いstage rollout snapshotに残る「PoCで決める」は現行状態として扱わない。

## 推奨実行順

PoCはstage番号順でなく、安価に失敗を発見できる順と外部待ち時間で並べる。

### Batch A: local desktopで短時間に判定

1. POC-029 Local Font Access
2. POC-030 Invoker Commands
3. POC-003 details／dialog
4. POC-004 Navigation branch
5. POC-001 Custom Highlight
6. POC-008 User Preferences
7. POC-010 SpeechSynthesis
8. POC-016 Console迷路
9. POC-017 Console診断卓（D-135で不採用。再PoC・実装なし）
10. POC-018 Text Fragment
11. POC-032 Text Fragment組み立て（問題fixtureの相談完了後）

### Batch B: fixture／algorithmを先に固定

1. POC-011 Unicode数字
2. POC-013 Encoding
3. POC-006 native media fixture
4. POC-031 browser／OS media controls
5. POC-022 映像復元
6. POC-021 動画変換

S-720 fixture generatorを先に作り、共通media manifestをS-710にも利用する。runtime変換より、事前生成assetと期待checksumを先に固定する。

### Batch C: local HTTPS／PWA／Service Worker

1. POC-002 offline Beacon再現
2. POC-014 Permissions
3. POC-015 Compute Pressure
4. POC-005 WebGPU安全性
5. POC-028 Payment Handler
6. POC-007 Audio Session

### Batch D: 外部端末・機器

1. POC-012 Network Information
2. POC-009 cross-window／cross-origin D&D
3. POC-026 Contact Picker
4. POC-025 OTP
5. POC-019 Remote Playback
6. POC-020 Presentation
7. POC-023 WebXR

### Batch E: 外部service／長期scheduler

1. POC-027 FedCM provider auditと実account
2. POC-024 Periodic Background Sync長期観測

POC-024は結果待ちが長いため、Batch A開始後に環境準備と観測を並行開始してよい。未発火は即FAILにせず、期限、permission、engagement、OS停止条件を記録する。

## 各PoC完了後の更新先

1. `docs/poc-results/POC-xxx.md`へ結果を追加する。
2. `stage-implementation-status.md`の状態を`PoC合格・未実装`、`PoC部分合格`、`PoC失敗・再相談`のいずれかへ更新する。
3. `human-test-matrix.md`へ、製品実装後に再確認するcaseだけを残す。PoC証拠を公開前確認の代わりにしない。
4. 箱数、stage ID、成功条件が変わる場合は、実装前にdecision log、gimmick backlog、coverage、rollout、permission implementation、Scratchpadを同期する。
5. `FAIL`時にgame製UI、別API、DevTools、backendで迂回せず、affected boxだけを保留・却下・再設計としてユーザーへ相談する。

## 完了条件

- POC-001〜POC-032の各結果が記録されている（D-135で不採用のPOC-017を含み、POC-031 / POC-032の追加結果も残す）
- 未実装案の全行がPoC IDまたは「PoC不要」に対応している
- PoC合格前に製品stageへ組み込んでいない
- 外部機器、account、OS変更、長期待機の未実施を成功扱いしていない
- pre-generated assetにsource、license、生成手順、checksumがある
- negative path、privacy、cleanupが各結果に含まれる
- 合格したPoCだけが実装waveへ進む
