# 実装PoC 実施記録

> この文書の箱番号はPoC実施時の履歴である。D-144後、encoding、Unicode、video recoveryのfixtureは`src/busybox/fixtures/`へ製品昇格し、製品stageはPoC pathを参照しない。PoC上の旧S-350-B04 Media Capabilitiesと旧B06実寸reelは不採用、旧B05 frame cadenceは製品S-810-B01、旧B07は現行S-350-B05、旧S-230-B01は現行S-350-B06、旧B08の音声track案は合意済みIDの将来B07に対応する。現行S-350-B04はnative再生速度、B08はfullscreen。本文のS-230とS-270は製品実装から削除済み。現行の解法は[現行ステージ解法仕様](./stage-walkthroughs.md)を正とする。

> 初回実施日: 2026-08-01、POC-006 / POC-011 / POC-013 / POC-021 / POC-022 fixture更新: 2026-08-02。現行の対象と作業順は[次のPoC・ステージ化キュー](./next-poc-and-stage-work.md)を正とする。本文は実施時点の証拠であり、旧箱番号や当時の実装順を現在の結論に使わない。

> 2026-08-16現行更新: S-810はVFR cadence判定ではなく、native seek停止後の提示frame比率（1:1 / 4:3 / 16:9 / 9:20、各相対5%以内）へ変更した。実開箱はH-053の人手確認待ち。POC-008、POC-029、POC-032は対応APIの実挙動を捏造せず、User Preferences、Local Font Access、Text Fragment `beforematch`の実API呼び出しを隔離ページへ追加した。未対応環境でPASS表示へ置き換えない。

## 共通環境と証跡

- Local isolated page: `http://127.0.0.1:4173/busybox/poc/`（製品stageから独立）。[probe source](../poc/main.ts) と [page](../poc/index.html) をGit管理する。
- Browser: Windows 10 x64 の Chrome `150.0.0.0`、secure localhost。
- TypeScript: `node .\\node_modules\\typescript\\bin\\tsc --noEmit` が合格。
- 実測: POC-006の6候補ではVP8のみ `powerEfficient=false`、VP9 / H.264 / AV1 / HEVCは3灯すべて`true`。最高pixel rateのH.264 / 1920×1080 / 60fps / 8Mbpsを正解候補として選べた。permission state は geolocation / notifications=`denied`、camera / microphone=`prompt`。`connection.type` と `CSS.highlightsFromPoint` は欠損。
- 権限の受諾、カメラ・マイク取得、連絡先取得、フォント列挙、外部accountログイン、SMS送信、決済、機器操作、負荷生成は行っていない。これらは成功を模倣できず、専用の実機・account・公開HTTPS環境が要る。

## 2026-08-18 Windows Chrome追加報告（ユーザー実測）

Windows ChromeでPOC-035〜054を一括確認した結果を、実測者の報告として記録する。ここでいうpositiveは「そのPoCの中心操作を観測できた」、negativeは「この環境では成功経路を観測できなかった」を意味し、製品stageの採用や公開環境の合格を意味しない。

- positive: POC-036, POC-037, POC-039, POC-040, POC-041, POC-042, POC-043, POC-044, POC-045, POC-048, POC-049, POC-050, POC-051。
- negative: POC-035, POC-052, POC-054。
- cleanup / 説明不足: POC-038は「3つの窓を同時に重ねる」の操作意図が不明瞭、POC-053はpositiveに見えるが何が変化したか見えない。038は横スクロールとroot付きratio表示へ、053はnative字幕とactive cue表示へ修正する。
- 未報告の項目は、Windows Chromeで機能待ち・操作環境待ちとして結果を推測しない。

### 2026-08-20 製品採否レビュー

D-148でPOC-035〜054を全件レビューし、PoCのpositive / negativeとは別に製品stageの処遇を確定した。下記は結論の索引であり、成功条件と実装順は[次のPoC・ステージ化キュー](./next-poc-and-stage-work.md)を正とする。

- 新規stage候補: POC-036、037、038、041、042、046、048、051、052、053。
- stage不採用: POC-035、039、040、043、044、045、047、049、050、054。
- POC-052の単体negativeは旧fixtureに対する証拠として残す。その後S-810の固定segment packでMediaSource / SourceBuffer経路を製品実装できたため、player自身がsegmentをappendする別体験を採用した。
- POC-040、043、044、045、049、050は内部実装に利用できるが、問題箱・採用stage・API件数には含めない。
- POC-051はS-350、POC-052はS-810、POC-053はS-350-B05へ統合せず、それぞれ異なる中心操作の独立stageとする。

## 2026-08-09 製品初版への反映

この記録時点で中心経路を、既存stageと新規S-610 / S-620 / S-640 / S-650 / S-660 / S-670 / S-700 / S-710 / S-720 / S-780 / S-810へ反映した。ここにある69stage・159箱は当時のスナップショットであり、現行registryは81stage・181箱である。PoCと製品stageは別entryとして維持する。

- S-060-B02、S-150-B02/B03、S-220-B04、S-580-B02、S-610、S-620、S-640、S-650、S-660、S-670、S-710、S-720は、実ブラウザの再確認が必要な初版実装として人手確認待ちへ移した。
- S-030-B02、S-350-B04〜B07、S-510-B02は、対応API／native UIの実入力を製品stageで再確認する。
- S-270は4096粒子のGPU描画と磁石盤面を実装した。成功判定は座標で行い、同期GPU readbackやCPU fallbackは置いていないため、playerが並列描画を理解できるかを人手確認する。
- S-710はMediaBunnyの10秒・640×360・15fps・384kbps変換、暗闇frame、downscale QR、WebM metadata、size比、downloadを実装した。decode失敗は通常frame pipelineと分離したruntime fallbackで、固定1-frame output videoへの差し替えは次のmedia waveで行う。
- S-720はGit管理済み7 assetと4 routeをcanvas frame transformで検証する初版を実装した。WebCodecs直結、実QR decoder、同一画面内の複数file入力UIは未完了として明記する。

自動検証は markuplint、変更範囲Biome、TypeScript、Jest 39 suites / 273 tests、Vite production build、`git diff --check`を通過した。PoCのPARTIAL / FAILは解決済み扱いにせず、対応環境または追加fixtureが必要な箱として残す。

## 結果一覧

| PoC | 結果 | 実施済みの証拠 | 残る条件／対応 |
| --- | --- | --- | --- |
| 001 S-030 | PARTIAL | `CSS.highlights` へ独立した2 Rangeを登録後に描画が残る。 | `highlightsFromPoint` は欠損。B02だけ実装可、B03はこのAPIを必須にする設計のまま保留。 |
| 002 S-060-B02 | PASS | native `sendBeacon()`→Service Worker POST→IndexedDB one-shot receipt→worker生成receiverの経路を実browserで確認した。senderを含む`/busybox/poc/` scopeへworkerを登録し、online時とVite停止中の両方でfull-document navigation後にmatching receiptを読めた。`sendBeacon()===true`ではなく、receiver側のworker照会成功を合格証拠にした。 | 製品実装ではcurrent attempt、receipt consume、reset、wrong／stale attempt、未制御時の案内、固定flag表示を追加し、H-048で再確認する。 |
| 003 S-150/S-610 | PARTIAL | 同一`name`の2 `details`を順に開くと state は`false, true`。`dialog.showModal()`も動作。PoCページにnative `toggle` trace、×button、`closedby="any"` dialogを集約した。 | Esc / light dismiss / closeの3経路は最後の実入力で観測する。 |
| 004 S-220 | PARTIAL | Navigation API と `canGoForward=false` は実測。PoCページにA〜Dのnative `navigate()`とentry `dispose` logを追加した。 | A→B→C→Back→Dのbranch disposal、BFCache、連打は最後の実入力で観測する。 |
| 005 S-270 | PARTIAL | 明示操作でadapter / deviceを取得し、直ちに`destroy()`できた。render loop、CPU fallback、負荷生成は開始していない。 | device loss、GPU完了時間、粒子数gateとUXは未実施。 |
| 006 S-350 | PARTIAL | 6 codec profileの3灯、12/24/30/60fps VFR、3 native解像度、3 VTT track、3 AAC trackを固定fixtureで検証。B01〜B03はPOC-031でnative seek、mute、play後pauseをユーザーが実入力して合格。B04〜B06は実browserで合格し、B07はnative字幕menuで`Busybox`へ変更すると対象trackだけが`showing`になることをユーザーが確認した。B08は3音声fixtureをffprobe検証した。 | 現browserは`audioTracks`が`undefined`のためB08は未観測で、custom pickerは設けない。 |
| 007 S-430 | FAIL | Audio Session APIが現在のChromeにない。 | Safari/WebKit実機でのみ `active → interrupted → active` を実音声focusで再PoCする。 |
| 008 S-480 | PARTIAL | 隔離PoCへ5 preferenceの実`requestOverride()` / `clearOverride()`入口と実効media-query表示を追加した。非対応環境ではunsupportedを表示し、CSS模倣や合成eventを使わない。 | User Preferences対応browserでの実override、`change`、permission、clear後の復帰を確認する。 |
| 009 S-510 | PARTIAL | Windows Chromeではsandbox iframeから親documentへのDnDが禁止cursorとなった。一方、別windowからの実drag / dropはユーザーが成功を確認した。 | 製品stageをページ内画像、OS File、iframe拒否→別windowの3箱へ再構成し、許可／拒否cursorとdragover表示を含めて再確認する。 |
| 010 S-580 | PARTIAL | 明示操作で一文字ずつqueueした発話が、実聴取で`aspuwiq`として聞こえた。 | voice差、cancel/error、background、複数人での聴取UXは未実施。 |
| 011 S-620 | PASS | [17件fixture](../fixtures/unicode/data.ts)とGNU Unifont 17.0.05の[subset WOFF2・OFL](../fixtures/unicode/fonts/README.md)をGit管理した。17回答の一意性、各formatter/parserのround-trip、私用領域・置換文字不使用、font `cmap`の要求214 code point全収録を自動検証した。隔離browserでは17式、RTL 5式、漢数字、算木の位別交互表記、基数20、Mayan上位桁からの縦積みを実描画し、豆腐化0件、選択・copy glyph不一致0件を確認した。 | 製品stageでは体系名、Unicode version、基数、答えを隠し、式と共通ASCII整数欄だけを置く。Mayanのcopyでは縦列境界の改行を許すが、空白を除いたglyph列の完全一致を維持する。font load失敗を代替clearにしない。 |
| 012 S-630 | FAIL | Network Informationの`connection.type`が欠損。 | Android / ChromeOS等の接続別実機以外で推定しない。 |
| 013 S-640 | PASS | [12件fixture](../fixtures/encoding/data.ts)をGit管理し、fatal `TextDecoder`、表示不能文字拒否、16 labelを各一回使う全体solver、fixtureの意味検証を自動testした。2進4問・16進4問は各1 label、文字化け4問は「元の符号化」と「誤表示に使った符号化」の順序付き2 labelで、計16位置を検証する。12回答と12問題表示はすべて別値、CJK回答は3文字以上、空白文化圏は2語を基本とする。隔離プレビューでは全問のraw bytesを全16 labelで復号する表（計192行）を出し、回答文字列・正答文字コード・一致行を実測した。 | runtimeではplayerに文字コード名を入力させず、推理して復号した固有文字列を12問共通のtext fieldへ入力させる。spaceを含むexact code point一致で判定し、legacy encoderは実装しない。 |
| 014 S-650 | PARTIAL | 非要求の照会でgeolocation / notifications=`prompt`、camera / microphone=`granted`を実測。照会だけなのでgeolocation / notificationsのpromptは出ない。 | prompt/granted/denied変更、OS拒否、camera/mic即stopは未実施。 |
| 015 S-660 | PARTIAL | 負荷を生成せず`cpu=nominal`の実passive recordを受信し、`disconnect()`も確認した。 | fair / serious / critical、policy拒否、visibilityは実環境で未観測。負荷generatorは使わない。 |
| 016 S-670 | PARTIAL | page側buttonで操作し、plain ASCII盤面がConsoleに表示されることを実確認。折りたたみgroupではなく、盤面を直に開いた`console.info()`へ出すよう修正した。 | Chromium / Firefox / Safari Consoleでの列幅・長いlog後の可読性とplayer観察は未実施。 |
| 017 S-680 | REJECTED | N/E/S/WのswitchをConsoleのplain textと`console.table()`へ同時出力するcandidate Aまで試作した。 | D-135でS-670 Console迷路との中心体験の重複を理由に不採用。製品stageへ実装しない。 |
| 018 S-690 | PARTIAL | 同一pageの4つの`#:~:text=` linkと、すべて一意な文章からなるscroll / UA highlight観察用fixtureを追加し、link activationを実確認した。 | hint構成・完全解は未確定。Back、reload、layout変化とplayer観察は未実施。 |
| 019 S-700-B01/B02 | PARTIAL | Remote Playback APIは存在。 | 対応receiverへの実再生、round動画、BarcodeDetector必須読取を未実施。 |
| 020 S-700-B03 | PASS | Windows Chromeと外部画面で`PresentationRequest.start()`、receiver初期描画、current round付きreadyを実確認した。 | 別OS／display種別は製品化時の人手matrixで確認する。 |
| 021 S-710 | PARTIAL | 固定360×360 videoから`MediaStreamTrackProcessor`で2 frameだけを読み、`maxBufferSize=2`、reader cancel、track stopまでを実browserで確認した。製品初版には10秒MediaBunny変換、metadata、size比、downloadと、壊れた入力・固定output fixtureを追加した。 | 実browserでの暗闇／QR frame置換、連続変換、固定1-frame `BROKEN INPUT` output動画は次のmedia確認で検証する。 |
| 022 S-720 | PARTIAL | T1〜T3、途中・復元video 7 assetを生成script・manifestとともにGit管理し、ページ上で使用する5 assetのWebM構造、360×360、2.0秒を実browserで照合。復元video alpha / betaの表示も実確認した。B03 / B04は同一の`source-t3.webm`を参照する。さらに、全24 frameを読んでT1/T2/T3を二値matrixへ実行し、期待videoのframeと比較する4経路のruntime verifierを追加した。 | runtime verifierの各routeと、復元QRの実camera decodeは最後の一括確認で観測する。 |
| 023 S-730 | PARTIAL | WebXR APIは存在。 | 対応XR機器、immersive session、実select rayは未実施。 |
| 024 S-740 | PARTIAL | `periodicSync` propertyはService Worker prototypeに存在。 | installed PWA、公開HTTPS、実schedulerのclient 0件eventを未観測。 |
| 025 S-750 | PARTIAL | OTPCredential APIは存在。 | 実SMS / Safari AutoFill、未汚染field、`:autofill`を未観測。 |
| 026 S-760 | FAIL | Contact Picker APIが現在のChromeにない。 | 対応Android実機でのみ、架空contactを用いた2経路を再PoCする。 |
| 027 S-770 | PARTIAL | IdentityCredential/FedCM入口は存在する。providerなしの旧呼出しは必須`identity.providers`欠損で失敗したため、登録不要・任意client ID／origin対応のMockFedCMをPoC専用providerとして設定した。 | MockFedCMへ架空値でsign inし、browser所有chooserとFedCM専用credentialを確認する。製品化時は公式provider、公開RP登録、実accountで再監査する。 |
| 028 S-780 | PASS（local技術・3箱stage PoC） | Viteのmethod URLに`Link: rel=payment-method-manifest`を返すmiddleware、manifest、handler、window、承認・拒否・retryの3箱stage試作を実装し、foreground Chromeで確認した。この実測はD-147以前の3箱PoCである。製品stageはその後○/◇の2 appと指定wallet B04へ拡張した。 | managed static hostの公開originでLink header、browser-owned 2候補、B01〜B03のwallet非依存、◇workerのtrusted eventで開くB04をH-050で確認する。 |
| 029 S-790 | PARTIAL | 隔離PoCへ`window.queryLocalFonts({ postscriptNames })`の1件限定照会、`FontData.blob()`、Blob由来`FontFace` glyph表示、SHA-256証跡、revoke入口を追加した。全font列挙・upload・`local()`代替は使わない。 | desktop Chromium対応環境で専用OTFをOS user installし、permission、対象名一致、uninstall／revoke、deny／cancelを実確認する。 |
| 030 DR-041 | IMPLEMENTED / MANUAL | 一つのPopoverへ複数buttonから宣言的commandを送り、`CommandEvent.source` / `command`の列、light dismiss、button由来hideを記録する実装へ修正した。Dialogのcloseだけを成功経路にしない。 | Windows Chromeでshow→show→hide、Esc、外側クリック、誤順、details再入場、listener cleanupを確認する。 |
| 031 S-230/S-350/S-430 | PASS | ユーザーがPoCページの全表示checkを緑にした。S-350はnative seek、mute、play後pause、S-230はnative／page PiP入場とPiP終了、S-430-B01はpage外`pause` actionを実入力で確認した。S-430探索logでは`play`、`pause`、`seekto`×2、`nexttrack`、`previoustrack`を受信し、page内安全停止はB01を通さなかった。 | `seekbackward`、`seekforward`は今回未観測だが成功条件・追加箱にはしない。H-052の別OS／browser surface確認は公開対象を広げる時の人手ゲートとして残す。 |
| 032 S-800 | PARTIAL | 隔離PoCへ、文脈付きfragmentと「先頭空白＋suffix」の2 fixtureを追加し、`hidden="until-found"`対象の`beforematch`を実観測する。入力欄・通常anchor・自作highlightで代替しない。 | Chrome系でB01/B02のURL貼付、UA highlight、`beforematch`、Back／reload、対象外語では発火しないことを確認する。 |
| 033 S-430-B02 | NOT_RUN | Audio Sessionのactive／interrupted／activeを観測するlazy case、外部focus操作手順、listener／audio cleanupを追加した。 | Audio Session対応Safari／WebKitで実interruptionと再生復帰を確認する。通常pause、Media Session action、synthetic eventではPASSにしない。 |

### 2026-08-18 追加PoC wave（POC-035〜054）

採用した最新版だけを共通のlazy accordionと`advanced-poc.ts`へ残した。各ケースは実APIをfeature-detectし、非対応時にfallbackでPASSへ置き換えない。`partial`は人手確認または専用fixtureが残る状態であり、製品stageへの採用を意味しない。

| PoC | 状態 | 現在の証拠 | 次の確認 |
| --- | --- | --- | --- |
| 035 Keyboard Layout Map | IMPLEMENTED / WINDOWS CHROME NEGATIVE | trusted keydown 3件と`navigator.keyboard.getLayoutMap()`を記録する入口を実装したが、ユーザー実測では成功経路を確認できなかった | APIの実提供・permission・layout差が確認できる環境で再試行。未提供時に製品化しない |
| 036 Pointer Lock | IMPLEMENTED / MANUAL | user activationからlock、実movement、Esc解除、pointerlockchangeを記録 | lock中の3movement、解除、離脱cleanup |
| 037 Idle Detection | IMPLEMENTED / MANUAL | `requestPermission()`後の実IdleDetectorをthreshold 60秒で開始 | user idle / screen state、permission拒否、abort |
| 038 IntersectionObserver | IMPLEMENTED / CLEANUP-UNCLEAR | Windows Chromeで中心操作は確認できたが、旧表示の「3窓を同時に重ねる」が不明瞭だったため、scroll rootと60%閾値を明示するUIへ修正 | 横scroll、3窓同時ratio、閉じた時のobserver disconnect |
| 039 URL address-bar route | IMPLEMENTED / MANUAL | pathname/query/hashを実navigationし、sessionStorageで3経路を累積 | reload、Back、storage reset、別タブの分離 |
| 040 Sanitizer API | IMPLEMENTED / MANUAL | `Sanitizer` / `Element.setHTML`でscript・event属性を除去 | 対応Chromeの安全DOM、unsupported表示、危険文字列の非実行 |
| 041 Document PiP | IMPLEMENTED / MANUAL | 実Document PiP windowとpagehide cleanupを実装 | chooser、PiP閉鎖、離脱cleanup |
| 042 EditContext | IMPLEMENTED / MANUAL | textarea fallbackなしのEditContext surfaceとtextupdate入口 | IME composition、selection、cancel、離脱 |
| 043 WebGL2 projection | IMPLEMENTED / PARTIAL | WebGL2 context、viewport、framebuffer readbackを実測 | shader / projectionを問題化できるか、context loss |
| 044 Fetch conditional | IMPLEMENTED / PARTIAL | ETagと`If-None-Match`のheader/resultを記録 | static hostの304可否とcache cleanup |
| 045 MessageChannel | IMPLEMENTED / MANUAL | iframeへtransferしたMessagePortだけでready/ackを交換 | iframe load、port close、wrong-port負例 |
| 046 File System Access | IMPLEMENTED / MANUAL | `showSaveFilePicker()`の同一handleを再読込 | OS editor変更、permission revoke、cancel |
| 047 File and Directory Entries | IMPLEMENTED / MANUAL | Explorerのdirectory dropを再帰的`readEntries()`で走査 | nested tree、flat file拒否、drag cleanup |
| 048 Compression Streams | IMPLEMENTED / PASS-CANDIDATE | gzip → `DecompressionStream` → exact payloadのstream照合 |形式負例と全量bufferを避けた製品境界 |
| 049 Streams backpressure | IMPLEMENTED / PASS-CANDIDATE | `WritableStream`遅延sinkとwriter.ready / desiredSizeを記録 | backpressure値、abort、再実行 |
| 050 Trusted Types | IMPLEMENTED / PARTIAL | policy由来HTMLをsinkへ渡す入口を実装 | CSP `require-trusted-types-for` fixtureでenforcementを確認 |
| 051 Fullscreen | IMPLEMENTED / MANUAL | 実fullscreen elementとfullscreenchangeを観測 | S-350-B08との差分、Esc、離脱cleanup |
| 052 MediaSource | IMPLEMENTED / WINDOWS CHROME NEGATIVE | SourceBufferへ固定WebMをappendし再生する入口を実装したが、ユーザー実測では成功経路を確認できなかった | segment分割fixture、updateend/error、URL revokeを観測できる環境で再試行 |
| 053 WebVTT | IMPLEMENTED / POSITIVE-BUT-UNCLEAR | cue編集の中心操作はpositiveに見えたが、何が変化したか表示から判別できなかった。native字幕とactive cue previewを追加した | A/B cueの表示変化、cuechange、track cleanup |
| 054 WebCodecs | IMPLEMENTED / WINDOWS CHROME NEGATIVE | `VideoDecoder.isConfigSupported()`の入口を実装したが、ユーザー実測では成功経路を確認できなかった | encoded chunk fixture、decode output、close/errorを観測できる環境で再試行 |

### POC-006 native media実測

- [fixture定義](../fixtures/media/fixtures.ts)、[生成script](../../../scripts/generate-busybox-media-fixtures.mjs)、事前生成したWebM / MP4 / VTT、ffprobeの[generation manifest](../fixtures/media/assets/generation-manifest.json)をGit管理する。再生成時は[検証script](../../../scripts/verify-busybox-media-assets.mjs)でcodec、native寸法、3音声のlabel / language / defaultと全assetの意味契約を照合する。
- B04: VP8 640×360 / 30だけ`true / true / false`。VP9 1280×720 / 30、H.264 1280×720 / 30、AV1 1920×1080 / 30、HEVC 1920×1080 / 30、H.264 1920×1080 / 60は`true / true / true`。pixel rate優先、bitrate tie-breakでH.264 1920×1080 / 60を選べた。
- B05: `requestVideoFrameCallback()`の`mediaTime`差分から、12fps区間=`12.0fps / 21差分`、24fps区間=`23.8fps / 65差分`、30fps区間=`30.3fps / 53差分`、60fps区間=`58.8fps / 107差分`を観測。24fps安定差分は64で合格基準24以上を満たした。
- B06: low=`320×180`、target=`640×360`、high=`960×540`で、各reelの`videoWidth / videoHeight`とframe callbackの`width / height`が期待値へ一致した。CSS表示寸法は判定に使わない。
- B07: VTTのBusy / Busybox / Boxを`TextTrackList`で観測し、既定Busyだけ`showing`、残り2件は`disabled`。2026-08-02にユーザーがnative字幕menuでBusyboxへ変更できることを確認した。
- B08: MP4はH.264 640×360とAAC 3 stream（Busy=`qaa/default`、Busybox=`qab`、Box=`qac`）を持ち、5秒・`readyState=4`まで読めた。現在のbrowserは`HTMLMediaElement.audioTracks === undefined`でnative変更eventを観測できないため未達のままとし、custom pickerで迂回しない。

### POC-011 固定回答表

| ID | 内部体系名 | operand（十進値） | ASCII回答 |
| --- | --- | ---: | ---: |
| B01 | ASCII / European digits | 123 + 456 | 579 |
| B02 | Arabic-Indic digits | 234 + 567 | 801 |
| B03 | Eastern Arabic-Indic digits | 345 + 678 | 1023 |
| B04 | Han numerals | 456 + 321 | 777 |
| B05 | Osmanya digits | 517 + 264 | 781 |
| B06 | Adlam digits | 629 + 154 | 783 |
| B07 | N'Ko digits | 731 + 168 | 899 |
| B08 | Garay digits | 842 + 157 | 999 |
| B09 | Ol Chiki digits | 913 + 286 | 1199 |
| B10 | Mro digits | 184 + 725 | 909 |
| B11 | Wancho digits | 295 + 613 | 908 |
| B12 | Nag Mundari digits | 376 + 522 | 898 |
| B13 | Ol Onal digits | 487 + 410 | 897 |
| B14 | Sora Sompeng digits | 598 + 307 | 905 |
| B15 | Counting Rod Numerals | 619 + 274 | 893 |
| B16 | Kaktovik numerals（20進3桁） | 1352 + 1781 | 3133 |
| B17 | Mayan numerals（20進3桁） | 2056 + 1023 | 3079 |

## 実装判断

- D-137で、現環境にAPIまたは中心経路があり、製品実装によって残る不確実性を実stage上で確認できる箱は一括実装へ進めることにした。これは当時の履歴であり、現在の対象と作業順は[次のPoC・ステージ化キュー](./next-poc-and-stage-work.md)を正とする。
- `PARTIAL`をstage全体の一状態として扱わず、実装後は箱単位で「現環境確認済み」と「外部確認待ち」を分ける。S-650の未観測permission変化、S-660のfair / serious / critical等をtest doubleだけでPASSへ昇格しない。
- `FAIL` と `BLOCKED` は「不採用」ではなく、この実施環境では肯定証拠を作れなかった状態である。今回のbatchへ含めず、対応環境、fixture、または詳細設計を用意した別batchで扱う。
- game製UI、別API、synthetic event、固定flagだけの迂回で未確認箱を開けない。

## 次の再PoCに必要なもの

1. fixture generator: S-710、S-720。S-350-B04〜B07はPOC-006、S-620はPOC-011、S-640はPOC-013で完了。S-350-B08は対応browser待ち。
2. public HTTPS / installed PWA / foreground browser: S-510、S-740、S-780。S-060-B02のbackend停止経路はlocalhost PoCで合格済み。
3. 対応実機: Safari Audio Session、Android/ChromeOS Network Information・Contact Picker、desktop Chromium Local Font、XR / receiver画面。
4. 外部協力と登録: SMS送信端末、FedCM providerのRP clientとテストaccount。
5. 先に詳細を確定: S-690 Text Fragment謎。S-680 Console診断卓はD-135で不採用。
6. 公開対象を拡大する時: H-052でS-430のexternal media surfaceを別OS／browserでも記録する。今回未観測のseekbackward／seekforwardを新しい成功条件へ昇格させない。
