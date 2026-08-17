# API調査・採用方針

> D-140でS-350のframe cadenceをG-080 / S-810へ分離し、D-141でS-270とMedia Capabilities profile箱を不採用、D-143でS-230のPiP箱をS-350-B06へ統合、D-144でS-350-B08 fullscreenとmedia stage製品UXを確定した。現行計画は78stage・186箱であり、本文中のそれ以前の件数と旧箱番号は履歴としてのみ扱う。現行の箱IDと解法は[現行ステージ解法仕様](./stage-walkthroughs.md)を正とする。

## 2026-08-01 Local Font Access API追加監査

[Local Font Access API](https://developer.mozilla.org/en-US/docs/Web/API/Local_Font_Access_API)は、user activationと`local-fonts` permissionを前提に、`queryLocalFonts()`でsystem fontのPostScript名等を照会し、`FontData.blob()`で実font dataへアクセスするLimited availabilityのAPIである。[WICG草案](https://wicg.github.io/local-font-access/)は`postscriptNames` optionで要求対象を特定fontへ限定できる。Chromeではdesktop 103以降で提供され、permissionはsite informationへ表示・保持されるため、実装時と公開前に対象desktop Chromiumの現行挙動を再確認する。

DR-137元案の「端末へ偶然install済みのfont一覧から頭文字を作る」は、端末差で共通解を保証できずfingerprinting面も広いため破棄する。代わりに新規G-078 / S-790「活字の鍵（仮）」を任意Labs 1箱として採用する。Git管理する専用OpenType fontをplayerがOS標準UIでinstallし、対象PostScript名だけを要求した実`queryLocalFonts()`が期待faceを返し、`FontData.blob()`のmetadata / checksum検証と専用glyph表示が成功した時だけ直接開く。

全font列挙、既存font集合、permissionだけ、`@font-face local()`だけ、file upload、game bundled webfont、名前だけの一致を代替clearにしない。返却font情報とraw bytesはmemory内で破棄し、表示・log・保存・Drive同期・file export・analytics・送信しない。専用font、生成source、license、再生成手順、checksumを事前生成してGit管理し、完了後にOSからfontをuninstallする方法とsite permission解除方法を案内する。D-143後の現在の計画値は78stage・184箱である（S-780の正しい財布箱を削除）。

## 2026-07-31 Topics API追加監査

[Topics API](https://developer.mozilla.org/en-US/docs/Web/API/Topics_API)は、複数siteでの観測と週単位のepochからbrowserが一般的な閲覧関心を推定し、`document.browsingTopics()`やrequest headerで広告technologyへ渡す非標準APIである。Privacy Sandbox enrollmentを要し、FirefoxとSafariのstandards positionは否定的である。playerがその場で狙ったtopicを作れず、履歴不足、noise、browser設定によって結果が変わる。通常player向けのAPI固有UIもなく、gameがカテゴリを表示するだけではTopics固有体験にならない。

Googleは2025-10-17にTopics APIのretireを発表し、Chromeは144からdeprecationを開始して削除を予定している。廃止予定を主理由としてDR-132の新規stage、統合、historical exhibit、browserの広告privacy設定変更を要求する箱を却下する。閲覧傾向や推定関心カテゴリを取得、表示、保存、同期、送信せず、固定カテゴリによる通常分岐へ置換しない。計画値は78stage・184箱のままとする。

## 2026-07-31 Private State Token API追加監査

[Private State Token API](https://privacysandbox.google.com/protections/private-state-tokens)は、issuerがbrowserへ暗号tokenを発行し、別contextのredeemerが匿名の粗いtrust signalとして償還するanti-fraud機構である。`document.hasPrivateToken()`と`document.hasRedemptionRecord()`で存在をclientから確認できるが、発行prompt、token icon、償還確認等の通常player向けbrowser UIはない。Chrome DevToolsのApplication panelには統合があるものの、DevToolsを解法に使わない本作ではgame製反応しかplayerへ見えない。

API自体は2025-10-17のPrivacy Sandbox整理後も継続サポート対象だが、本番利用にはissuer登録、key commitment、token issuance、redemption endpoint、暗号鍵の保護・rotation・監視を含む独自server-side stackが必要である。[公式developer guide](https://privacysandbox.google.com/protections/private-state-tokens/developer-guide)も独自issuer / redeemer serverの構築を前提にする。Busyboxの架空儀式を任意条件にできる一般向けmanaged issuerは確認できず、`privatetokens.dev`等のdemoをproduction gameplayへ依存させない。DR-131は新規stage、統合、demo依存、historical exhibitを却下し、計画値は78stage・184箱のままとする。

## 2026-07-31 Attribution Reporting API追加監査

[Attribution Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Attribution_Reporting_API)は、`attributionsrc`、Fetch / XHR設定、HTTP response headerでsourceとtriggerを登録し、browserが非公開領域で照合した後、遅延・noise・件数制限を伴うreportをserver endpointへ送る広告効果測定APIである。source登録、trigger登録、一致、report送信にbrowser固有UIがなく、pageへ一致を通知する確定eventもない。通常のURL / referrerで導線を再現するとAPI固有性を失い、reportで成否を知るには受信backendが必要になる。

Googleは2025-10-17にAttribution Reporting APIのretireを発表し、[Privacy Sandbox feature status](https://privacysandbox.google.com/overview/status)で「Deprecate and remove」としている。Chromeは[144 beta](https://developer.chrome.com/blog/chrome-144-beta)でdeprecationを開始した。廃止予定APIを新規stage、既存stage統合、historical exhibitへ固定せず、DR-130は却下する。実広告、campaign、第三者計測service、debug reportをgameplayへ導入しない。計画値は78stage・184箱のままとする。

## 2026-07-31 Payment Handler API追加監査

[Payment Handler API](https://www.w3.org/TR/payment-handler/)は、Service Workerへpayment appとしてのorigin権限を与え、browserが候補handlerを提示し、選択したhandlerへtrusted `PaymentRequestEvent`を配送する。[Web-based Payment Handler API](https://developer.mozilla.org/en-US/docs/Web/API/Web-Based_Payment_Handler_API)のJIT登録、handler window、`respondWith()`と、merchant側の`complete()` / [`retry()`](https://developer.mozilla.org/en-US/docs/Web/API/PaymentResponse/retry)を使えば、実決済providerを混ぜずにGit管理された架空payment methodだけでAPI固有のflowを構成できる。

新規G-077 / S-780「三つの財布（仮）」を任意Labs 3箱として採用する。trusted eventはhandler経路の証跡として扱い、単独の箱にはしない。B01はhandler windowで承認responseをmerchantが検証して`complete("success")`へ到達した時、B02は意図的拒否responseを検証して`complete("fail")`へ到達した時、B03は最初のresponseに`retry()`を行い、同じhandlerで二度目のresponseを成功完了した時に開く。merchant側の開始経路は承認／拒否／再試行のいずれにも固定せず、返ったresponseの結果に対応する箱だけを開く。

実Google Pay / Apple Pay、card、実通貨、payer / shipping情報、payment credentialを要求せず、game製payment sheet、handler不在、browser cancel、例外を代替clearにしない。handler windowはpayment lifecycleに必要な非言語操作だけに制限し、一般的なWebパズルを埋め込まない。候補UI、trusted event、失敗完了、同一handler retryを実browserでPoCできた場合だけ公開する。DR-128のPayment Request却下は維持し、Payment Requestは架空handlerを起動する配線としてのみ使う。新規1stage・3箱を加え、計画値は78stage・184箱となる。

## 2026-07-30 Payment Request API追加監査

[Payment Request API](https://www.w3.org/TR/payment-request/)はmerchant、payer、payment methodをbrowserが仲介し、`show()`でhandlerを選択・承認した後にmerchant処理用の`PaymentResponse`を返す。元案は通貨の組み合わせを鍵として標準payment UIで模擬承認するものだったが、APIに安全なsimulation modeはなく、汎用card入力の`basic-card` payment method identifierも[Deprecated](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API/Concepts)である。

実Google Pay / Apple Pay等を指定すると、playerには実購入UIとして見え、payment credential、merchant登録、誤操作リスクを持ち込む。総額0や架空labelでもbrowser UIの意味は変わらない。payment sheetを開いてcancelしたら開く案も肯定的な支払完了ではなく、user cancel、handler不存在、browser裁量のabortを固有の成功として分けられない。DR-128は元案、新規stage、既存stage統合を却下し、計画値は77stage・181箱のままとする。実payment method、card、billing / shipping、payer情報、payment tokenを取得・保存・送信しない。架空payment methodをWeb Payment Handlerで処理する案だけはDR-129へ分離する。

## 2026-07-30 Federated Credential Management API追加監査

[FedCM](https://developer.mozilla.org/en-US/docs/Web/API/FedCM_API)は任意のOAuth providerを自動変換するAPIではなく、IdP側がwell-known file、config、account、assertion endpointとRP / client登録を提供する必要がある。[Google Identity Services](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)は、静的配信のBusyboxからGoogle hosted scriptを読み、Google CloudのOAuth Web clientと許可JavaScript originを設定するだけで利用できる成立確認済みのmanaged IdPであり、Busybox独自server、Cloud Functions、serverless function、identity databaseは不要である。一方、Xの現行公式認証はOAuth redirectであってFedCM提供を確認できず、有名なIdP名だけで箱を作れない。

元案は別世界の連携IDが箱規則と一致すると勢力の印章で門が開くものだった。account属性や勢力照合はbackendと個人情報利用を必要とするため残さない。新規G-076 / S-770「身分証棚（仮）」は、実装着手時に公式資料を再調査し、公式FedCM提供、一般向けRP登録、provider自身または信頼できるmanaged運用、FedCM経路の肯定的証明、Busybox独自backend不要を満たすserviceごとに独立箱を置く。Google 1箱だけを現計画の下限とし、追加providerはclient登録と実account PoC後に箱数へ加える。

各箱はprovider名を示した明示操作から単一providerのactive attemptを開始する。provider公式SDKがFedCM専用resultを返す場合はその証拠、標準APIを公式に案内するproviderでは実`IdentityCredential`と期待`configURL`を使う。Google箱はGoogle Identity Servicesを`auto_select: false`で呼び、非空`credential`と厳密な`select_by === "fedcm"`の場合だけ開く。[GIS JavaScript API reference](https://developers.google.com/identity/gsi/web/reference/js-reference)で区別される`fedcm_auto`、`auto`、`user`、`btn`その他のlegacy / button / automatic経路、OAuth redirect、popup、broker越しの通常SNS loginでは開かない。tokenはdecode、署名検証、account照合、DOM / console表示、保存、Drive同期、file export、analytics、network転送をせず、判定直後に破棄する。

provider account、active session、online接続、FedCM対応browserと設定が必要なため、全箱を通常攻略と全箱必須報酬から外したLabsにする。非対応、未login、prompt非表示、cancel、network failureは未観測とし、game製account chooserや通常Sign-In fallbackを作らない。完了後はprovider公式account管理から解除できることを案内し、Busyboxからauto revokeしない。FedCM操作の成立時に対応箱だけを開き、provider別の完了messageや固定flagを後置しない。DR-127はGoogle 1箱を下限とする新規1stageとして採用した。追加providerは実装時点の再調査とPoC完了後に加算する。複数provider指定自体はChrome 136以降で可能だが、active modeはsingle providerで使うため、一箱一providerを正とする。[Chrome FedCM overview](https://developer.chrome.com/docs/identity/fedcm/overview)

## 2026-07-29 投機ルール API追加監査

[HTML Living Standardのspeculative loading](https://html.spec.whatwg.org/multipage/speculative-loading.html)は、`<script type="speculationrules">`またはresponse headerでnavigation候補を宣言し、user agentへprefetch / prerenderをhintする。`immediate`、`eager`、`moderate`、`conservative`は実行時機の意図を表すが、実行はuser preferences、device conditions、resource limitsを含むbrowser裁量である。prerenderはfull-page navigation専用でSPAのsoft navigationには使えず、target documentは`document.prerendering`、`prerenderingchange`、navigation timingの`activationStart`で事前実行を観測できる。

元案はplayerの次の移動を予測し、予測が当たった場合だけ遷移を滑らかにするものだった。速度はcache、network、端末性能でも変わり、playerは投機成功と通常の高速読込を区別できないため採らない。新規案としてS-220-B05「先に入っていた部屋（仮）」を検討した。対象linkのhover / pointer interactionでdedicated documentをprerenderし、targetがprerender状態を経験してactivationされた場合だけ、到着時に既に開いた箱を見せる案だった。

この案ではgame側はprerenderを強く証明できるが、playerが直接見るのは「到着時に箱が開いている」「経過表示が進んでいる」というgame製演出だけである。browserは投機中の専用UI、indicator、permission promptを出さず、player自身は事前実行を知覚・判別できない。DevToolsのSpeculations panelを解法にするとDevTools依存になり、本作の方針にも反する。DR-119は元案、新規stage、S-220への統合をすべて却下する。通常navigationの内部高速化へ投機ルールを任意利用してもよいが、問題箱、clear条件、採用実績へ数えず、計画値は76stage・180箱のままとする。根拠は[HTML Standard](https://html.spec.whatwg.org/multipage/speculative-loading.html)、[Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html)、[Chromeのprerender説明](https://developer.chrome.com/docs/web-platform/prerender-pages)。

## 2026-07-29 JS Self-Profiling API追加監査

[JS Self-Profiling API](https://wicg.github.io/js-self-profiling/)はpageがsampling profilerを開始し、`Profiler.stop()`からsample、stack、frame、resourceを含むtraceを得るdeveloper向けAPIである。sampling intervalは要求値どおりの取得を保証せず、user agentはbackground contextでpauseできる。browser所有のprofile画面、permission prompt、player操作UIを開くAPIではなく、利用にはDocument Policyの`js-profiling-mode`による明示許可が必要である。WICG Draft Community Group Reportで、実装はChromium中心の限定対応である。

元案はplayer操作ではなく、実装者がcodeを最適化して特定関数のself timeを削減すると開く「開発者向けデバッグ箱」だった。これはrepositoryのcode編集と再配信が解法になり、player向けgameplayではないため採らない。新規案として三つの処理をprofileし、最も多くsampleされたhot functionを答える診断卓も検討した。S-680 Console診断卓で実traceを`console.table()`へ出すことは可能だが、表示はConsole APIとgame製formatterによるものでSelf-Profiling固有のbrowser UIではない。

sampling結果は端末性能、JIT、sampling timing、foreground状態で揺れ、安定させるにはgame側が長いCPU処理を実行する必要がある。固定traceへ置換すると実APIを使う意味を失う。DR-117は元案、新規stage、S-680への統合をすべて却下する。将来、開発時のlocal性能診断へ任意利用することは妨げないが、player traceを収集・保存・送信せず、採用API、問題箱、clear条件へ数えない。計画値は76stage・180箱のままとする。根拠は[WICG仕様](https://wicg.github.io/js-self-profiling/)と[Chromium Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/7K7Qt7aRJ8s)。

## 2026-07-29 Shared Storage API追加監査

元案は`sharedStorage.set("global-box", "1")`を世界全体のplayer進捗として扱い、集約達成率で箱を開くものだった。しかしShared Storageはserver上のglobal databaseではなく、各browser profile内でcontext originがtop-level siteをまたいで使うunpartitioned local storageである。他playerの状態は共有されず、backendなしに世界全体の集計を得られない。

新規案として、二つの異なるtop-level siteへ同じ第三者originを埋め込み、一方で書いた記憶をworkletで読み、`selectURL()`の結果をFenced Frameへ表示する「二つのsiteをまたぐ秘密の記憶」も検討した。ただしpageは保存値や選択indexを直接取得できず、workletの出力gateはURL選択またはPrivate Aggregationに制限される。playerが見るのはgameが用意した選択後contentで、Shared Storage固有のbrowser UI、permission prompt、外部操作はない。通常のlocal storage puzzleとの差を成立させるには別top-level site、第三者origin、privacy sandbox enrollmentを持ち込む必要があり、本作の中心操作に見合わない。

さらにShared StorageはWICGのDraft Community Group Reportに留まり、repositoryは2026-01-28にarchiveされた。ChromeはM144でdeprecatedとし、M150以降の無効化とM152でのstub置換・実装削除を進めている。他engineも採用していない。DR-108は元案、新規stage、既存stageへの統合をすべて却下する。historical exhibit、polyfill、third-party cookieによる模倣も作らず、計画値は76stage・180箱のままとする。根拠は[WICG Shared Storage](https://wicg.github.io/shared-storage/)、[Chromium Intent to Deprecate and Remove](https://groups.google.com/a/chromium.org/g/blink-dev/c/uh5Ke6qyegc)、[archive済みWICG repository](https://github.com/WICG/shared-storage)。

## 2026-07-29 Beacon API追加監査

[Beacon](https://w3c.github.io/beacon/)の`navigator.sendBeacon()`は、小さなPOST bodyを送信queueへ入れ、documentのunloadを遅延させずに転送するためのAPIである。返り値`true`はqueueへ受理できたことだけを示し、server受領や保存完了を証明しない。一方、same-origin requestは[Service Worker](https://w3c.github.io/ServiceWorker/)のfetch event対象になり得るため、online backendを置かず、制御中のworkerをlocal郵便局として使う構成は成立する。

元案はpageを去る時に別れの手紙をBeaconで送り、次回訪問時に開くものだった。単なる`visibilitychange:hidden`やtab closeだけを開始条件にすると、遷移、browser終了、automation差に左右され、playerも投函結果を確認しにくい。統合先案は既存S-060「帰ってくる箱」のB02「オフライン郵便（仮）」とし、B01の単純な再訪記憶は変更しない。playerは最初にonlineでService Worker制御とsender / receiver shellのcacheを準備し、networkをofflineにした後、「投函して郵便局へ移動」という通常linkを明示操作する。

click handlerは実`navigator.sendBeacon()`を小さな固定protocol dataとcurrent attempt IDだけで呼ぶ。`false`ならnavigationを止め、queueへ入らなかったことを示して開箱しない。`true`ならdefaultを止めず、React routerのsame-document遷移ではなくreceiver pageへのfull-document navigationを続行する。Service Workerは専用virtual endpointへのsame-origin POSTだけをinterceptし、methodとpayloadを検証し、`respondWith()`内のPromiseで専用IndexedDB storeへreceiptをcommitしてから204を返す。receiverはmessage listenerを先に設置してからstoreを照会し、message / query競合を避ける。matching receiptがある場合だけB02を開き、cached receiverとGit管理済みreceipt画像を表示する。

実Chromium PoCではlocal HTTP serverを停止した完全offline状態でも、明示clickの`sendBeacon()`が`true`を返し、制御中Service WorkerがPOSTを受けて`receipt:explicit-offline-letter`を保存・再読出しできた。tab close / `visibilitychange`だけに依存する試行はreceiptを得られなかったため、これらは任意の説明演出に留め、成功条件にしない。`sendBeacon() === true`だけ、通常`fetch({keepalive:true})`、same-document遷移、単純再訪、foregroundからの直接IndexedDB writeでも開かない。

初期表示はreceipt画像を未取得のままnative broken image表示にし、受領後だけGit管理したstamp画像へ差し替える。flagは画像へ埋めず、copy可能な固定DOM text `BUSYBOX{THE_OFFLINE_BROWSER_DELIVERED_MY_FAREWELL}`とする。payloadへ個人情報を含めず、receiptはDrive同期、file export、analytics、外部networkへ出さない。resetは専用attempt / receiptだけを削除する。DR-100は新規stageではなくS-060-B02への統合案として確定し、1箱を追加して計画値を76stage・180箱とする。

## 2026-07-29 XMLHttpRequest追加監査

[XMLHttpRequest Living Standard](https://xhr.spec.whatwg.org/)は現役であり、API全体をDeprecatedとは扱わない。`UNSENT`、`OPENED`、`HEADERS_RECEIVED`、`LOADING`、`DONE`の状態、download / uploadの`ProgressEvent`、`abort`、`timeout`等はXHR固有のprogramming modelである。一方、main threadの同期XHRは削除方向にあり、新規ギミックで使わない。

元案は古い通信機器風の箱で`open()`、`setRequestHeader()`、`send()`を順に実行し、特定headerと`readyState`遷移を満たすものだった。新規案として、Service WorkerからGit管理済みresponseを分割し、実`readystatechange`、`progress`、`timeout`、`abort`を5灯の通信盤へ反映する案も検討した。backendなしで成立するが、playerが知覚する灯火、状態名、操作盤はすべてgame製UIであり、XHR自身にbrowser所有の表示はない。download progressや中断もFetchのresponse streamとabortで近い体験を作れる。

統合先候補のDR-085 Fetch APIはresponse header / bodyを手掛かりに次の静的URLを選ぶ案である。通信儀式をXHRへ差し替えてもplayerの中心操作が増えず、upload progressを中心にすると受信endpointとgame製progress UIが必要になる。DR-086は新規stage、問題箱、DR-085への統合を追加せず却下する。内部通信でXHRを使うだけでは採用実績へ数えず、計画値は76stage・179箱のままとする。

## 2026-07-29 WebVR追加監査

[WebVR 1.1 preserved specification](https://immersive-web.github.io/webvr/spec/1.1/)は`VRDisplay.requestPresent()`等を定義した旧APIだが、仕様化は中止され、主要browserは実装しないことを明記している。現代の代替は[WebXR Device API](https://www.w3.org/TR/webxr/)である。

元案はWebVR空間で箱の裏面を覗き、通常画面では見えない鍵を得るものだった。新規案は作らない。現代APIへ読み替えたimmersive sessionとXR空間上の箱へのinteractionは、既にG-072 / S-730-B01・B02へ採用済みである。さらに「裏へ回る」「振り返って探す」を加えると、XRは対応機器の起動と空間上の箱へのinteractionの2箱だけに留める既決方針から外れる。

DR-083は新規stage、問題箱、既存stageへの統合を追加せず却下する。WebVRをcompatibility exhibitとして残さず、WebXR採用実績にも重ねて数えない。計画値は76stage・179箱のままとする。

## 2026-07-29 Encrypted Media Extensions追加監査

[Encrypted Media Extensions](https://www.w3.org/TR/encrypted-media-2/)は`HTMLMediaElement`へkey system選択、license / key交換、暗号化blockの復号を接続する。商用DRMやproprietary license serverは必須ではなく、全準拠user agentの共通baselineである`org.w3.clearkey`なら、暗号化mediaとClear Key licenseを静的assetとしてGit管理し、page内だけで`MediaKeySession.update()`まで完結できる。したがって「backendと実DRMが必須」という暫定却下理由は採らない。

元案は正しいlicenseを得た者だけが見られる暗号化映像へ鍵を埋めるものだった。Clear Keyの新規案として、複数license cardからKIDに合う鍵を選ぶ一枚鍵と、異なるKIDの保護区間を順に解くkey rotationの2箱も検討した。実EME pipelineでは鍵がない区間で`readyState`を下げ、`waitingforkey`を発火して再生をsuspendし、usable keyが入ると再開できる。

ただし仕様が保証するplayer可視状態は動画停止までで、鍵icon、error文、spinner等のEME専用browser UIを要求しない。key system非対応やlicense不正はpromise rejection、wrong KIDは鍵待ち継続、wrong keyは復号またはdecode errorとなり、いずれも専用default表示を保証しない。playerにはnetwork bufferingやgeneric media errorと区別しにくく、意味を伝えるにはgame製UIや動画内演出が中心になる。

DR-074は新規stage、問題箱、既存stageへの統合を追加せず却下する。Clear Key fixtureを内部testへ使うだけでは採用実績へ数えない。計画値は76stage・179箱のままとする。

## 2026-07-29 Web Components追加監査

[Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html)はauthorが独自elementを定義し、parser、upgrade、lifecycle reaction、`ElementInternals`等を通じて再利用可能なDOM componentを実装する基盤である。Shadow DOM、`<template>`、`<slot>`と組み合わせれば内部DOM / CSSのencapsulationやlight DOM投影も行えるが、これらはauthor向け実装機構であり、playerが直接操作するbrowser所有UIではない。

元案は各箱を`<busy-box>` custom elementとして独立実装し、内部state machine完了で開くものだった。これは問題の解法ではなく開発architectureである。未定義elementの後発upgradeを見せる新規案もplayer操作はgameが用意したmodule読込buttonに留まり、slotへ部品を配置する案は既存Drag and Drop問題と体験が重なる。Web Components固有の肯定的なbrowser外操作をclear条件にできない。

DR-052は新規stage、問題箱、既存stageへの統合を追加せず却下する。現在のReact `GiftBox` / stage runtimeをAPI網羅のために移行せず、必要な局所箇所でCustom Elements、Shadow DOM、slot、ElementInternalsを内部利用しても採用stageや箱数へ数えない。計画値は76stage・179箱のままとする。

## 2026-07-29 Contact Picker API追加監査

[Contact Picker API](https://www.w3.org/TR/contact-picker/)はsecureなtop-level contextでtransient user activationを消費し、user agent所有のpickerからplayerが選んだcontactだけを一回限りでpageへ返す。要求可能なpropertyは`name`、`email`、`tel`、`address`、`icon`で、`multiple`により単数・複数選択を切り替えられる。pickerはorigin、要求property、共有される情報を明示し、実装はproperty単位の共有拒否UIを提供できる。連絡先の列挙、検索、追加、変更、削除、永続permission、stable contact IDは提供しない。

元案は実アドレス帳から「箱の持ち主」を探し、選ばれた実連絡先がhint条件に一致すると開くものだった。これは第三者の個人情報を正解へ使い、端末ごとに成功可能性が変わるため採らない。新規G-075 / S-760「架空の名刺（仮）」では、stageに固定の`name`、`email`、`tel`、`address`、Git管理済み`icon`を持つ架空名刺を表示し、player自身がOSの連絡先へ架空contactとして追加する。B01は実`navigator.contacts.select(["name", "email", "tel", "address", "icon"])`で選んだ1件を正規化し、5項目すべてが名刺fixtureと一致した時だけ開く。

B02は同じ5項目を要求してpickerを開き、1件を選んだまま全propertyの共有を拒んだ結果、返却contactの5配列がすべて空または欠損である時に開く。APIは「共有を拒んだ」と「元から値がなかった」を意図的に区別せず、何も返らなければ同じ架空contactかも識別できない。そのためclear条件を「B01のcontactを再び選んだ」ではなく「B01解決後、何らかのcontactを1件選んだが、Busyboxへ5項目を一つも渡さなかった」と定義する。全propertyをOFFにしたまま確定できるnative UIは仕様上の必須機能ではないため、Android Chrome実機PoCで成立しない環境へgame製checkboxや部分共有fallbackを作らない。

`name`はUnicodeと空白、`email`はcaseと空白、`tel`は表示記号、`address`は構造化field、`icon`は連絡先appによるcrop・resize・再圧縮を許容する画像内容で比較する。B01の返却値とBlobは判定直後に破棄し、表示、保存、Drive同期、file export、analytics、network送信へ使わない。架空contact自体がOS accountへ同期され得ることを登録前に説明し、stage完了後に削除を案内する。固定flagはB01を`BUSYBOX{THE_CARD_BECAME_A_CONTACT}`、B02を`BUSYBOX{ONE_CONTACT_SHARED_NOTHING}`とする。新規1stage・2箱を追加し、計画値は76stage・179箱とする。

## 2026-07-26 Force Touch events追加監査

[Force Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Force_Touch_events)はApple固有の非標準APIで、標準仕様を持たない。Appleのarchive文書にはForce Touch trackpad向けの`webkitmouseforcewillbegin`、`webkitmouseforcechanged`、`webkitmouseforcedown`、`webkitmouseforceup`と`MouseEvent.webkitForce`が記載されているが、vendor固有の機能である。

元案は押し込む強さのprofileを合わせて封印を割るものだった。検討時には通常clickの後にforce変化、force click、releaseを順に起こす新規1箱「二段底（仮）」も考えたが、本作の新規stageへ非標準vendor APIを入れない方針から採用しない。標準`PointerEvent.pressure`で代替するとForce Touch固有の操作ではなくなり、既存DR-010 Pointer Eventsと重複するためfallbackや統合先にも使わない。

DR-012は新規stage、問題箱、既存stageへの統合、stage ID予約を追加せず却下する。hardware対応状況や体験の良し悪しをPoCで比較する前に、非標準APIであることを決定理由とする。計画値は75stage・177箱のままとする。

## 2026-07-26 WebOTP API追加監査

[WebOTP API](https://wicg.github.io/WebOTP/)は`navigator.credentials.get({ otp: { transport: ["sms"] } })`で、呼出元originへ結び付いた形式の実SMSを待ち、user agentの確認UIでplayerが許可した場合に`OTPCredential`を返す。Chrome AndroidではSMS到着時にbrowserのbottom sheetが表示され、playerがVerifyを押すとpromiseが解決する。[Chrome公式解説](https://developer.chrome.com/docs/identity/web-apis/web-otp)のdemoと同じく、SMSの送信者はgame serverである必要がなく、別の携帯電話から所定文面を送れる。

DR-126は新規G-074 / S-750「届いた封書（仮）」の任意Labs 1箱へ採用する。playerが明示的に受信待機を始めるとmemory上にcurrent roundの6桁codeを生成し、対応環境では実WebOTP requestを開始してから、別の携帯電話または協力者へ渡すSMS文面をcopy可能に表示する。最終行は[Origin-bound one-time codes](https://wicg.github.io/sms-one-time-codes/)の`@公開host #code`形式とする。一箱のclear条件は「current OTPがbrowser所有のOTP専用入力経路から入ること」とし、待機中の実WebOTP promiseが返した`OTPCredential.code`一致、または`autocomplete="one-time-code"`欄への強く検証したuser-agent AutoFillのどちらか一方で開く。

AutoFill経路は空で未汚染の`autocomplete="one-time-code"`欄が一度のtrusted browser editでcurrent code全体へ変化し、次frameでも`:autofill`または`:-webkit-autofill`に一致し、その前に手入力、paste、drop、composition等の値変更がない場合だけ認める。keydownが無かったという消去法や`inputType="insertReplacementText"`だけには依存しない。`:autofill`を実SMSに限定せず、OS / browserのOTP専用AutoFillでcurrent codeが入ったことを正とする。実機PoCでSafari Security Code AutoFillからpseudo-classを観測できない環境にはevent列だけのfallbackを作らない。電話番号はpageへ入力させず、取得、保存、同期、送信しない。SMS送信に別端末または協力者、通信契約、料金が必要になり得ること、SMS本文からcarrier、OS、送信者へ訪問hostが伝わることを開始前に明示する。cancel、timeout、reset、離脱では待機と入力監視を終了し、round code、credential参照、入力値を破棄する。固定flagは`BUSYBOX{THE_ORIGIN_BOUND_SMS_REACHED_THE_BROWSER}`とする。

## 2026-07-26 Reporting API追加監査

[Reporting API](https://www.w3.org/TR/reporting-1/)はCSP違反、COOP / COEP、browser介入、非推奨機能等のreportを生成し、`ReportingObserver`から同じenvironment settings objectに属するreportを構造化dataとして受け取れる。report生成時のobserver通知とendpointへの配送は別処理であり、Report自体にplayer向けのbrowser標準画面、通知、dialog、操作部はない。[CSP Level 3](https://www.w3.org/TR/CSP/)のReport-Only policyなら、対象操作を阻止せずに`csp-violation`を生成できる。

元案はエラー、介入、違反reportを受け取ると箱が「異常時だけ本音を言う」stageだった。新規案では、Service Workerが返す専用documentへ`Content-Security-Policy-Report-Only`を付け、script、style、image、same-origin fetchの4操作を画面上では成功させながら実`csp-violation`を観測する4箱も検討した。しかし違反はplayerから直接見えず、ランプ、報告書一覧、箱の反応はすべてゲーム側の自作UIになる。珍しい内部dataを可視化しているだけで、playerがReporting API固有のbrowser UIや外部操作へ触れるstageにはならない。

DR-115は新規stage、問題箱、既存stageへの統合を追加せず却下する。将来、対応browserでCSP違反や非推奨APIを開発用diagnosticへ一時表示する内部実装には利用してよいが、対応不能でもgameplayへ影響させず、外部report endpoint、telemetry、player識別、成功条件には使わない。内部利用しただけではAPI採用stageや箱数へ数えない。

## 2026-07-26 Content Index追加監査

[Content Index](https://wicg.github.io/content-index/spec/)はService Workerがoffline対応HTMLのURL、title、description、icon、categoryをbrowserのlocal indexへ登録し、user agentがアプリ外のcontent一覧やoffline recommendationへ表示できるようにする。`add()`はmetadata登録でありcontent自体をcacheせず、user agentによるentry表示も任意である。entry activationは登録URLへの通常navigationで、pageへContent Index経由を示す専用launch eventを渡さない。一方、browser内蔵UIからentryを削除した場合だけService Workerへ実`contentdelete`が届き、scriptから`registration.index.delete()`した場合は発火しない。

元案の「offline閲覧対象を集めて持ち歩ける鍵束にする」を、次期案「持ち歩く鍵」として記録する。専用HTMLとiconをcacheしてContent Indexへ`article`として登録し、playerがBusyboxを閉じてChrome AndroidのDownloads / Articles for Youからentryを開く。offlineページの指示に従ってbrowser標準UIからentryを削除し、同じgeneration IDについてpage open receiptと実`contentdelete`が揃った場合だけ、次回訪問時に固定flag `BUSYBOX{THE_OFFLINE_KEY_WAS_REMOVED_FROM_THE_BROWSER_SHELF}`を表示する。アプリ内一覧、通常link、`index.delete()`、DevTools操作では代替clearしない。

しかし現行実装はChrome Android / Android WebView等へ偏り、desktop Chrome、Firefox、Safariを含むPC browserで利用できない。[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Content_Index_API)でもLimited / Experimentalであり、user agentがentryを外部UIへ実表示する保証もない。本作の現状の取り組みとしては新規stage・箱・既存stageへの統合を行わず却下し、Content Index用のstage IDを予約しない。将来PC browserでContent Indexと削除UIが実装され、実`contentdelete`まで人手検証できる場合だけ次期案を再相談する。

## 2026-07-26 Background Fetch追加監査

[Background Fetch](https://wicg.github.io/background-fetch/)は複数requestを一つのbrowser管理jobとして登録し、page / workerがなくなった後も転送を継続または再開し、実byte数のprogress、browser / OS側の中止可能なUI、完了後の`backgroundfetchsuccess`を提供する。完了event中に`BackgroundFetchRecord`のresponseをCache Storageへ移せる一方、network requestはservice-workers mode `none`で行われるため、BusyboxのService Workerがresponse streamを遅延させることはできない。[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)ではLimited / Experimentalである。Chromeでの廃止提案は2025年12月に撤回されたが、Firefox / Safariを含む相互運用性は依然限定される。

元案の巨大な鍵dataを取得して最終箱を開く案は、ゲームのためだけに帯域を消費するため採らない。小容量の新規案として、未取得のflag画像をprecacheせず、通常の`<img>`にはbrowser標準の壊れた画像表示を出し、全Busybox windowを閉じている間の実Background Fetchだけが画像を取得・cacheし、次回訪問時に固定2語`AFTER HOURS`を画像内へ表示する1箱を検討した。offline登録なら静的GitHub Pagesでも完了前に離脱を挟めるが、playerはoffline判定を使わず、実download割合を数時間かけて進める設計を希望した。

静的assetの転送時間は回線と配信側が決め、`downloadTotal`、動画の再生時間、Dedicated / Shared Worker、Service Worker、page timerでは実downloadを意図的に遅くできない。特にBackground FetchはService Workerを迂回し、client Workerは全window終了後の生存を保証されない。動画へ置換しても再生時間と取得時間は一致せず、確実な数時間化には巨大化による帯域浪費か、低速responseを生成する配信backendが必要になる。

backend許容時の将来案として、Git管理した固定画像をstateless Edge Workerが`FixedLengthStream`等で低速配信し、正確な`Content-Length`、CORS、`Range` / `206`再開、`Cache-Control: no-store`を提供する構成を記録する。GitHub Pagesはアプリ本体と壊れた`<img>`を配信し、Edge Workerはplayer状態、cookie、token、判定を持たずimmutableな画像bytesだけを約3時間の目標速度で返す。これは常駐serverを運用しなくても配信側backendであり、現行のGitHub Pages中心・自前backendなし方針には含めない。

DR-098は新規stage・箱・既存stageへの統合・低速配信endpointを追加せず却下する。将来、statelessな配信backendを正式に許容する場合だけ、実Background Fetchのprogress、window client 0件の`backgroundfetchsuccess`、response cache、再訪時の画像復元を一体にした案として再相談する。client timer、偽progress、DevTools throttling、巨大fixture、公開第三者downloadで模倣しない。

## 2026-07-26 Periodic Background Sync追加監査

[Web Periodic Background Synchronization](https://wicg.github.io/background-sync/spec/PeriodicBackgroundSync-index.html)は`PeriodicSyncManager.register(tag, { minInterval })`で最小間隔の希望を登録し、user agentがonline、originの利用頻度、privacy、電源、resource条件を考慮してService Workerへ実`periodicsync` eventを配送する。`minInterval`は正確な周期、deadline、最大待ち時間ではなく、実効間隔にはuser agent定義値や`Infinity`もあり得る。Chromeではinstalled PWAを独立appとして起動した実績、site engagement、既知network等も発火へ影響する。[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)でもLimited / Experimentalである。

DR-097は新規G-073 / S-740「留守番温室（仮）」の長期Labs 1箱へ採用する。playerが種を植えて水を預け、window client 0件の実periodicsyncが発芽assetを取得・cacheした後、再訪して光を預け、別の実periodicsyncが開花assetを取得した時だけ開花する。毎日、24時間後、countdown、期限、枯死、通知、badge、timer、page load、DevTools模擬eventを成功経路にせず、二回の実background eventが来ない環境では未観測のままにする。成長assetは事前生成・Git管理し、固定flag `BUSYBOX{THE_GARDEN_GREW_WHILE_THE_APP_WAS_AWAY}`を使う。

## 2026-07-26 Background Sync追加監査

[Web Background Synchronization](https://wicg.github.io/background-sync/spec/)は、foreground clientが存在する間に`ServiceWorkerRegistration.sync.register(tag)`したone-shotの仕事を、online復旧後に実`SyncEvent`としてService Workerへ配送する。登録元pageがなくてもeventを実行できる点は固有だが、時刻、delay、deadlineは指定できず、失敗後のretry時刻と回数もuser agent裁量である。online中の登録では即時発火し得るため、page不在中の実行を狙う場合はofflineで登録し、全windowを閉じてからonlineへ戻す必要がある。browser process終了中やmobile OSによる停止中の発火は保証しない。

SyncEventでは`event.waitUntil()`の範囲で短い`fetch()`、IndexedDB、Cache Storage、hash検証、client列挙とmessageを実行できる。[Notifications API](https://notifications.spec.whatwg.org/)の権限が事前に`granted`なら`ServiceWorkerRegistration.showNotification()`も可能で、playerが通知を押した後の`notificationclick`からpageへ戻せる。一方、background中の権限要求、DOM操作、長時間timer、無制限計算、時刻指定、user activationなしの自動window生成、sync登録の自己連鎖には使わない。

DR-096では、offline登録後に全Busybox windowを閉じ、online復旧時のSyncEventが静的JSONを取得して受取証をIndexedDBへ置き、通知するS-070-B02案まで検討した。しかしpage不在中の実行という能力に比べて処理対象と発見が弱く、通知を必須にすると既存S-090 / S-410 / S-420へ体験が寄るため確定しない。API固有性は残して継続保留とし、通常Service Worker / online eventでは代替できない具体的ギミックが得られた時に再相談する。

## 2026-07-25 Push API / Worker追加監査

[Push API](https://www.w3.org/TR/push-api/)はapplication serverがPushSubscription endpointへmessageを送り、push serviceがuser agentへ配送し、Service Workerへ実PushEventを渡す構成である。[RFC 8292](https://www.rfc-editor.org/info/rfc8292/)のrestricted subscriptionでは登録時のapplication server公開鍵に対応する秘密鍵でVAPID署名する。Service Workerは受信側であり、自分自身の将来のPushEventを予約できない。

[HTML StandardのWorkers](https://html.spec.whatwg.org/multipage/workers.html)ではDedicated / Shared Workerはownerがなくなれば終了対象となり、[Service Workers](https://www.w3.org/TR/service-workers/)も処理eventがなければuser agentが終了できる。Worker timer、待機Promise、直接notificationではpageを閉じた後のwakeを保証できない。browserからpush endpointへ直送する案も、VAPID秘密鍵、payload encryption、CORS、page終了後の送信役、予約配達不在を解決しないため採らない。

DR-093は新規stage・箱・S-090統合・backendなしで却下する。Periodic Background Syncはpage終了後のwakeに近いが、実PushEventではないためDR-093の代替にしない。その後DR-097 / S-740として、Pushや通知を使わない別の長期植物stageへ採用した。

## 2026-07-25 WebSocket追加監査

[WebSockets Living Standard](https://websockets.spec.whatwg.org/)はbrowserとserver processの双方向通信、text / binary message、subprotocol、4種類のready state、close code / reason、`bufferedAmount`を定義する。標準WebSocketには受信backpressureがなく、`bufferedAmount`を問題にする大量送信はmemory、CPU、回線差を招くため採らない。

DR-090では、room codeで遠隔二人を結び、別々のswitchをserverが同じtickで確認する1箱も検討した。しかし面白さの中心は二人協力でありWebSocket固有ではなく、既存S-360のWebRTC協力と別に相手待ち、room lifecycle、荒らし対策、常時接続backendを追加する根拠にならない。[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)は静的site hostingでWebSocket endpointも提供しないため、新規stage・箱・統合先・backendを追加しない。

## 2026-07-25 Server-Sent Events追加監査

[HTML Living StandardのServer-sent events](https://html.spec.whatwg.org/dev/server-sent-events.html)は`EventSource`による一方向の持続HTTP stream、`text/event-stream`形式、named event、ID、自動再接続、`Last-Event-ID`による再開、`retry:`、HTTP 204による再接続停止を定義する。APIは現役だが、playerから見るとevent到着を待つだけで、通常の逐次表示と区別できる固有操作を作れない。

DR-087では、serverがID付き予言の途中で切断し、同じEventSourceの自動再接続後に続きを送る1箱も検討した。しかしplayer操作は接続開始だけであり、offline → onlineを要求すると既存S-070と重なるため却下した。[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)は静的site hostingで、動的なSSE endpointには別backendも必要になる。client timer、Service Worker、静的event-stream file、公開demo endpointで模倣せず、stage・箱・統合先・backendを追加しない。

## 2026-07-25 WebXR追加監査

[WebXR Device API Candidate Recommendation Draft](https://www.w3.org/TR/webxr/)はimmersive session、reference space、frameごとのviewer pose、XRInputSourceのtarget rayを扱う。汎用の「XR機器が物理接続された」eventをpage外で得るAPIではないため、G-072 / S-730-B01は`isSessionSupported()`のtrueではなく、user activationから開始した実`immersive-ar`または`immersive-vr`のsessionと最初の非null `XRViewerPose`を稼働証明にする。

S-730-B02は`local` reference spaceの固定位置に単純な箱を一つ描き、実XRInputSourceの`select`と`targetRaySpace`から得たrayが箱へ交差した時だけ開く。AR画面tap、controller、機器が配送するgaze selectは許可するが、inline session、page click、DOM overlay、PointerEvent、一般Gamepad、模擬poseでは代替しない。[WebXR AR Module](https://www.w3.org/TR/webxr-ar-module-1/)や[Hit Test Module](https://immersive-web.github.io/hit-test/)が提供する空間機能は使用範囲を広げる根拠にせず、現実marker、plane / mesh / depth sensing、raw camera、anchor、room mapping、歩行を要求しない。

[WebDXのWebXR support](https://web-platform-dx.github.io/web-features-explorer/features/webxr-device/)ではLimited availabilityであるため、AR / VRのどちらかに対応する実機だけのExhibit / Labsとする。[privacy / security explainer](https://immersive-web.github.io/webxr/privacy-security-explainer.html)に従い、開始前の明示説明、静止・座位で完了できる配置、周囲の安全確認を用意し、pose、座標、機器情報を保存・同期・送信しない。cleanupではXR animation frameとlistenerを止め、resourceを解放してsessionを終了する。

## 2026-07-25 media transform追加監査

DR-077は新規G-070 / S-710へ採用した。現行の[MediaStreamTrack Insertable Media Processing using Streams](https://www.w3.org/TR/mediacapture-transform/)は`MediaStreamTrackProcessor`から`VideoFrame`の`ReadableStream`を取り出し、変換後frameを`VideoTrackGenerator`へ書くworker指向のpipelineを定義する。実装時は全frameをcloseし、bounded queueと10秒上限を設け、Canvas / CSSだけの代替clearを作らない。

S-710のdownload用記録では[MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)の`videoBitsPerSecond`を低い固定hintとして使うが、user agentが指定bitrateを厳密に達成する保証はないため、実sizeと入力比を結果へ表示する。任意container metadataはMediaRecorderに専用surfaceがないので、[Matroska SimpleTag](https://www.matroska.org/technical/elements.html)を扱えるself-hosted libraryでWebMをremuxする。

D-144で派生G-071 / S-720の製品経路は、PoCの逐次frame変換ではなく、生成時に奇偶frameを正確に保持してchecksumを固定したsource / 中間 / 復元WebMを使うpatch bayへ変更した。runtimeはroute topologyを検証し、正規routeに対応する復元動画をoutput nodeへ流す。G-070のQR markerはbundled jsQR decoderを使い端末差をなくす一方、DR-016 / S-700-B02では実`BarcodeDetector.detect()`以外の成功経路を禁止する。

## 2026-07-25 WebTransport追加監査

[WebTransport W3C Working Draft](https://www.w3.org/TR/webtransport/)はsecure context上のclientからserverへ、欠落を許すdatagramと信頼できるuni / bidirectional streamを一つのsessionで提供する。datagramはbuffer上限、age、network lossでdropし得る一方、streamはwriteごとのmessage境界を保持しない。元案の「datagramを取りこぼさず高速hintを同期する」はAPIの性質と合わず、採る場合はlatest snapshotをdatagram、完全なbyte列をstreamへ分担する必要がある。

中心機能は[WebDXの2026年3月更新](https://web-platform-dx.github.io/web-features-explorer/release-notes/march-2026/)でBaseline Newly Availableになった。しかしbrowserだけではsessionを自己完結できず、[WebTransport over HTTP/3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)に対応するHTTP/3 / QUIC server、extended CONNECT、Origin検証、証明書、監視運用が必要である。WebTransport requestはService Workerを通らず、GitHub Pagesをendpointにはできない。DR-080は対応差ではなく、静的配信・自前backendなし方針との不整合により却下し、公開echo serverやclient内simulationによる代替clearも作らない。

## 2026-07-20 Geolocation追加監査

2026-03-26 Candidate RecommendationのGeolocation APIは、one-shot取得とvisible documentでの継続更新を提供する。`watchPosition()`はdocumentがfully activeかつvisibleでない間の更新を配送しないため、G-058 / S-590ではbackground経路追跡を行わず、sleep復帰時の再取得と短命な開始anchorを組み合わせる。

| Interface / member | 採否 | 割当・理由 |
| --- | --- | --- |
| `getCurrentPosition()` | 採用 | S-590の開始anchorとsleep / visibility復帰後の現在fixを取得する |
| `watchPosition()` / `clearWatch()` | 採用 | visible中の距離更新とhidden / 離脱時の電池・privacy cleanupに使う |
| `latitude` / `longitude` / `accuracy` | 採用 | haversine距離から双方のaccuracyを引いた距離下限だけをclear判定に使う |
| `timestamp` | 採用 | anchor TTLとstale fix排除に使う。server時刻や継続時間の証明には使わない |
| `speed` / `heading` | 別問題候補 | S-590では使用・保存しない。精度とnullabilityを別途監査する |
| `altitude` / `altitudeAccuracy` | 採用 | G-059 / S-600。confidence区間全体が100m未満、100〜500m、500m以上の各帯へ収まる連続readingで3箱を判定する |

開始anchorのsession保存はsleep / page discard復帰に必要な限定例外とし、最大24時間、同一tab内だけとする。経路と途中fixは永続化せず、B03達成、reset、expiryでanchorを削除し、Drive同期・外部送信しない。

高度問題の実測には、local-onlyを明記するDevice-TestのGeolocation pageと、`altitudeAccuracy`まで表示するOpenLayers公式exampleを使う。後者はOpenStreetMap tileを読み込むため、network観測時は位置表示用tile requestを考慮する。

## 2026-07-20 Clipboard change追加監査

Editor’s DraftとMDNに追加されたExperimentalな`clipboardchange`は、sticky activationまたはclipboard-read permissionがあるdocumentへsystem clipboardの変更を通知し、page外で起きた変更はsystem focus復帰時にpending eventとして配送できる。ただし変更元のappは識別できない。

BB-051への利用案は、外部copy後に`readText()`する既存S-180とplayerの中心操作が重なるため新規stageとして採用しない。`ClipboardChangeEvent.types`と`changeId`を含むinterface監査は残し、別の固有mechanicが見つかった場合だけ再提案する。

## 2026-07-20 Web Speech追加監査

現行Web Speech APIの`SpeechRecognition`はSecure ContextのWindow interfaceで、短いone-shot recognitionとfinal alternativesを取得できる。一方、MDNではLimited availabilityであり、認識engineはbrowser実装によりclient内またはserver側となり得るため、G-057 / S-580をLabsとして採用する。

| Interface / member | 採否 | 割当・理由 |
| --- | --- | --- |
| `SpeechRecognition` / `start()` / `result` | 採用 | G-057 / S-580。明示操作から1回認識し、final alternativeの正規化結果が`busybox`なら1箱 |
| `SpeechRecognitionAlternative.confidence` | 成功条件外 | engine間のscaleとcalibrationへ依存するため、語の一致だけを使う |
| `interimResults` / continuous recognition | 成功条件外 | 一時仮説や常時listeningを避け、final one-shotだけを観測する |
| `processLocally` / `available()` / `install()` | 保留・別監査 | on-device認識と言語pack lifecycleは実験的。S-580のfallbackや同じ箱の必須条件へ混ぜない |
| `SpeechSynthesis` / `SpeechSynthesisUtterance` | 採用 | DR-063 / S-580-B02。位置ごとのalphabet shift結果を画面へ出さず一文字ずつ発話し、`aspuwiq`から`busybox`を生成したutteranceの正常終了で開く |

アプリ自身は音声、transcript、confidence、alternativesを永続化・Drive同期しない。ただしbrowserのrecognition serviceが外部処理する可能性は開始前に説明し、H-027でnetwork、permission、error、abort、cleanupを確認する。

## 2026-08-16 S-810 aspect-ratio seek revision

S-810の採用条件を、過去に検討したVFR cadenceやページ製の解像度selectorではなく、playerがnative controlsでシークを止めた時点の提示frameへ更新した。固定MSE WebM assetの`seeked`後に`requestVideoFrameCallback()`を1回待ち、実`videoWidth / videoHeight`の比率を相対5%で1:1、4:3、16:9、9:20へ分類する。通常再生・pause・CSS寸法変更は解法にせず、ページにはscript自動seek経路を置かない。以下の旧行は監査時点の履歴であり、この更新後のS-810仕様には適用しない。

## 2026-07-21 Media Capabilities / media track追加監査

Media Capabilitiesはnative playerで選択中の画質やFPSを読むAPIではない。authorがcodec、width、height、bitrate、framerate等を含む構成を渡し、`supported`、`smooth`、`powerEfficient`の予測を得る。実mediaのframeとtrack状態はHTML media APIおよび`requestVideoFrameCallback()`で別に観測する。

| Interface / member | 採否 | 割当・理由 |
| --- | --- | --- |
| `MediaCapabilities.decodingInfo()` | 不採用 | 候補構成の再生適性をauthorが照会するAPIであり、playerがnative controlsから解像度を選ぶ体験ではない |
| `requestVideoFrameCallback()` / `mediaTime` / `presentedFrames` | 採用（旧cadence案は履歴） | 現行S-810では`seeked`後の提示frame同期に使う。過去の24fps cadence判定は採用しない |
| callback `width` / `height`、`videoWidth` / `videoHeight` | 採用（S-810） | native提示frameの実寸からアスペクト比を分類する。CSS表示寸法やページ製selectorは使わない |
| `playbackRate` / `ratechange` | 採用 | S-350-B04。native controlsから1倍速以外へ変更された実media状態を観測する |
| `textTracks` / `TextTrack.mode` / `change` | 採用 | S-350-B05。native字幕menuでlabel `Busybox`をshowingへ変更する |
| `audioTracks` / `AudioTrack.enabled` / `change` | 条件付き採用 | 将来S-350-B07。native音声track menuとAPIがある環境でlabel `Busybox`をenabledにする |

PiPはD-143でG-020 / S-350-B06へ統合し、同じnative videoの`enterpictureinpicture`を観測する。独立S-230とpage製PiP buttonは削除した。
| UA固有の画質menu / 選択中FPS | 不採用 | native controlsの内部DOMや「720p」等の現在選択labelを読む標準APIがない |

trackの表示labelは「日本語」「英語」のような実言語名を使わず、`Busy`、`Busybox`、`Box`のような箱固有名にする。BCP 47 language tagは正しい内部metadataとして維持するが、正解labelにはしない。profile結果、frame統計、解像度、track選択は保存・同期・送信しない。

## 2026-07-20 Generic Sensor追加監査

W3Cの2026-05-14版Generic Sensor関連仕様とMDNを再確認した。これらはSecure Context、個別permission / Permissions Policy、実hardware、visible documentを前提とし、多くがLimited availabilityであるため、すべてLabsとしてfeature detectionと実機gateを持つ。非対応環境へ別APIの代替clearは作らない。

| Interface | 採否 | 割当・理由 |
| --- | --- | --- |
| `Sensor` / `SensorErrorEvent` | 実装基盤 | 直接constructできる具体sensorではない。全Generic Sensor stageのstart / stop / reading / error共通runtimeで扱う |
| `Accelerometer` | 採用 | G-053 / S-550。raw X/Y/Zの合成値が遊びを持った0付近へ入る短い区間を1箱として観測する |
| `ProximitySensor` | 採用 | G-050 / S-520。実far→nearの1箱 |
| `LinearAccelerationSensor` | 採用 | G-051 / S-530。X/Y/Z往復加速の3箱 |
| `AmbientLightSensor` | 採用 | G-052 / S-540。暗所・明所の2箱。reading量子化を考慮 |
| `GravitySensor` | 独立stageなし | 3軸gravity成分を均等にする案は不採用。GravitySensor固有の箱は作らない |
| `Gyroscope` | 採用 | G-054 / S-560。X/Y/Z各軸の累積1回転3箱 |
| `Magnetometer` / `UncalibratedMagnetometer` | 除外 | 既定有効engineがなく、磁石・金属操作の再現性と安全性が不足 |
| `AbsoluteOrientationSensor` | 除外 | magnetometer依存のためG-055と同時に除外 |
| `RelativeOrientationSensor` | 採用 | G-056 / S-570。quaternion姿勢pathを閉じる1箱 |
| `OrientationSensor` | 実装基盤 | 直接利用しない基底interface。採用時はRelative版のquaternion / `populateMatrix()`で扱う |

Accelerometer仕様自身が新規projectにはcross-engineなDevice Orientation and Motionを推奨している点も記録する。ただしBusyboxはWeb APIの環境差を探索するため、Generic Sensor固有interfaceは対応環境だけで成立するLabs問題として保持する。

Web APIの対応状況は時間とともに変わる。この文書は採用対象を固定した古い一覧ではなく、実装直前に再検証するための手順を定義する。

## 母集団

最初の母集団は、MDNのWeb API仕様一覧に掲載されるAPI群とする。ただし、MDNの一覧にあるという理由だけで採用を確定しない。

次の情報を照合する。

- [MDN Web API一覧](https://developer.mozilla.org/en-US/docs/Web/API)と各APIページ
- MDN Browser Compatibility Data
- Web Platform Baseline / web-features
- 仕様策定元の文書
- Chrome、Firefox、Safariなど実装元の公式情報
- 実ブラウザでのfeature detectionと最小試作

対応状況、Experimental、Deprecated、権限要件は変化しうるため、API棚卸しを行うターンでは必ず最新情報を調査し、確認日と出典を残す。

初回全体調査は2026-07-18、Geolocation、Clipboard change、Web Speech、Generic Sensorと実装順を左右するPWA / Notification / WebAuthn / text scale / Batteryの追加確認は2026-07-20に行った。2026-07-20にMDN Web API indexと現行BCDを再取得し、147ファミリー・1,090インターフェースを[`api-ledger.json`](../data/api-ledger.json)へ機械可読化した。全項目はstage、既存stageへ統合する基盤、Labs保留、除外のいずれかに分類され、未分類は0件である。以前の1,045は2026-07-18スナップショットとしてのみ扱う。

再取得手順は`scripts/update-busybox-api-ledger.mjs`に固定した。MDN indexのSpecificationsをfamily母集団、`@mdn/browser-compat-data/data.json`の`api` top-levelをinterface母集団とし、取得日、BCD key、MDN URL、status、処遇、stage ID、理由を出力する。自動分類は追加APIを無言で採用するものではなく、公開前に`hold`と`integrate`の差分を人が再監査するための漏れ検知である。

## 添付Deep Researchメモの扱い

[添付Deep Researchメモの保存版](./source/deep-research-report.md)は、APIごとのギミック案を広く拾うためのアイデア源として使う。原文の引用マーカーはこのリポジトリから解決できず、WebVRのような旧API、旧来方式、広告・決済・認証など高リスクな用途も含むため、互換性表や採用判断の根拠にはしない。

2026-07-20に原文145案へ`DR-001`〜`DR-145`を付け、[Deep Research元案・暫定採否台帳](./deep-research-idea-disposition-ledger.md)で未分類0まで整理した。対話結果を反映した現分類は`採用`48、`重複`51、`統合案`11、`保留`1、`却下`34である。DR-017は実連絡先を正解にする元案を架空名刺の登録・選択・全property非共有へ再設計し、G-075 / S-760へ採用済みである。DR-083はDeprecatedな旧APIで、現代のimmersive体験が既存G-072 / S-730と重複するため却下済みである。DR-086は現役標準だが固有状態をplayerへ見せるgame製UIが中心になり、既存Fetch案との差が体験にならないため却下済みである。DR-096はAPI固有性を残す継続保留、DR-097はG-073 / S-740へ採用済み、DR-098は静的配信だけでは低速転送を制御できないため却下済み、DR-102はPC browser非対応のため次期案だけを残して却下済み、DR-105はStorage Access許可前の不可視状態をclear条件へ絡めない方針から却下済み、DR-107は既存storage、cross-context通信、S-740との体験重複から却下済み、DR-115はplayer向けのbrowser固有UIがなく自作可視化が中心になるためstageとして却下済み、DR-126は別送信者から届く実SMSとbrowser確認UIを使うG-074 / S-750へ、DR-127は実装時点の公式FedCM providerごとに手動提示箱を置くG-076 / S-770へ採用済み、DR-128は実決済UIを模擬通貨へ流用せず却下済み、DR-129は架空payment handler 3箱のG-077 / S-780へ採用済み、DR-130は廃止予定のAttribution Reportingをstage・統合・historical exhibitへ使わず却下済み、DR-131は独自issuer / redeemer backendと鍵運用を要し、managed issuerや通常player向け固有UIがないため却下済み、DR-132は廃止予定のTopicsをprivacy・非決定性・固有UI欠如の観点からも却下済み、DR-134はFenced Frameの隔離を通常playerが知覚できず親進捗へ直接通知できないため却下済み、DR-137は専用fontをOSへ追加してLocal Font Accessで再発見するG-078 / S-790へ再設計して採用済みである。DR-105から派生したcross-origin iframe画像D&Dだけは既存G-049 / S-510-B02へ統合し、通常相談queueは完了した。

DR-028から派生したAPI非依存のUnicode数字問題はG-061 / S-620、DR-077から派生したframe厳密復元問題はG-071 / S-720として別途採用した。G-024 / S-270はD-141で不採用とした。対話でstage IDを予約した現行差分は、DR-101のG-062 / S-630、DR-114のG-063 / S-640、DR-121のG-064 / S-650、DR-023のG-065 / S-660、DR-120のG-066 / S-670、DR-049のG-068 / S-690と派生G-079 / S-800、DR-075 / DR-016 / DR-076のG-069 / S-700、DR-077のG-070 / S-710と派生G-071 / S-720、DR-084のG-072 / S-730、DR-097のG-073 / S-740、DR-126のG-074 / S-750、DR-017のG-075 / S-760、DR-127のG-076 / S-770、DR-129のG-077 / S-780、DR-137のG-078 / S-790である。G-067 / S-680はD-135で不採用とした。個々の採否、統合先、回答文字列の要否、privacy、cleanupは分類台帳と決定ログを正とする。

取り込み時は、各案を次のいずれかへ分類する。

| 取り込み状態 | 意味 |
| --- | --- |
| 採用 | 現行stageと異なる中心操作があり、新規問題として仕様化する価値がある |
| 重複 | 中心操作が既存の採用案・実装と同じで、追加stageや追加統合を行わない |
| 統合案 | 単独stageにせず、既存stageの追加箱、共通診断、演出、実装基盤へ取り込む案 |
| 保留 | サーバー、特殊機器、審査、プライバシーなどの前提が重い |
| 却下 | Deprecated、現行実装なし、重複、高リスク、静的アプリ方針との不一致 |

「1 APIにつき1アイデア」は棚卸しの抜けを防ぐルールであり、「1 APIにつき1ステージを実装する」という要件ではない。複数APIを1つの発見へ統合する場合も、API台帳には対応先と理由を残す。

## 採用原則

### 採用候補に含める

- Deprecatedではない
- 現行のブラウザまたは端末の少なくとも1環境で実装されている
- Windows版Chromeで利用可能な現役API
- Windows Chrome以外でのみ利用可能な現役API
- ExperimentalまたはLimited availabilityである
- 権限、PWA、外部機器、特定OSを必要とする
- 非標準でも、現行環境で実在し、Deprecatedでなく、企画上の価値がある

### 原則として採用しない

- Deprecatedと明示されている
- 仕様だけ存在し、現行環境に利用可能な実装がない
- 静的Webアプリから安全かつ現実的に成立しない
- ギミックの中心がWeb APIではなく、単なる一般的なUI操作になる
- 別APIのステージと体験の核が重複し、区別できない

### 別枠で保留する

- 独自サーバーや第三者サービスが必須
- 有料契約や審査が必須
- 実装はあるが、公開Webでの利用条件が不明瞭
- セキュリティ、プライバシー、決済に大きなリスクがある
- 自動化や実機検証の環境を用意できない

## Baselineの扱い

Baselineは「API名全体」ではなく、個別機能ごとに状態が異なる場合がある。したがって、API単位で一律にBaselineと断定せず、ステージで実際に使う機能の状態を記録する。

ゲーム上の「Webページ基盤系」とBaselineは同義ではない。Baselineは互換性の内部情報であり、ゲーム上の大区分は体験の性質を表す。

内部では少なくとも次を区別する。

| 互換性情報 | 用途 |
| --- | --- |
| Baseline Widely available | 主要環境で長く利用可能な機能 |
| Baseline Newly available | 主要環境へ最近揃った機能 |
| Limited availability | 主要環境の一部で利用できない機能 |
| Experimental | 実装・仕様が変わる可能性を明示された機能 |
| Non-standard | 標準化されていないが現役実装がある機能 |
| Deprecated | 新規ステージから除外する機能 |

## API台帳に必要な項目

本格的な棚卸しでは、各候補に次を記録する。

| 項目 | 内容 |
| --- | --- |
| API / feature | API名と、実際に使う機能名 |
| 調査日 | 最後に対応状況を確認した日 |
| 出典 | MDN、BCD、仕様、ブラウザ公式情報 |
| ライフサイクル | 現役、Experimental、Deprecatedなど |
| Baseline | Widely、Newly、Limited、対象外 |
| 対応環境 | ブラウザ、OS、端末 |
| 前提 | HTTPS、権限、PWA、機器、ユーザージェスチャー |
| サーバー依存 | なし、任意、必須 |
| プライバシー | 取得する可能性がある情報 |
| ギミックID | ギミックメモ台帳との対応 |
| 人手確認ID | 人手確認台帳との対応 |
| 採否 | 採用、保留、除外とその理由 |

## 調査から実装までのゲート

1. MDN一覧から候補を抽出する。
2. Deprecatedと現行実装なしを除外候補にする。
3. BCDとブラウザ公式情報で対応環境を照合する。
4. 実際に使うfeature単位でBaselineとExperimentalを確認する。
5. 最小試作で、公開HTTPS環境でも成立するか確認する。
6. ギミックメモ台帳で既存ステージとの重複を確認する。
7. 権限・プライバシー・外部依存を評価する。
8. 必要な人手確認ケースを登録する。
9. ステージ実装へ進めるか決定する。

調査だけで「利用可能」と確定しない。APIオブジェクトの存在と、実際にそのステージを完遂できることは別である。

## 静的アプリとサーバー依存API

本作は自前サーバーを持たない方針であるため、サーバー依存APIは次のいずれかとして扱う。

- ブラウザ内で自己完結するデモ経路がある場合のみ採用する
- 信頼できる外部サービスを任意利用する実験枠として分離する
- GitHub Pagesだけでは成立しない場合は保留する
- API網羅のためだけに恒常的なバックエンドを追加しない

「すべてのAPIを一度は使う」という長期目標より、自前サーバーを持たないというプロダクト方針を優先する。両立できないAPIは、未実装理由を台帳に残す。

## 更新ルール

- API対応情報に永続的な真実を期待しない
- 実装開始時、公開前、重大なブラウザ更新後に再確認する
- 出典のない対応表を追加しない
- Deprecatedへ移行したステージは新規プレイ導線から外すことを検討し、既存進捗は保持する
- API名が変わった場合も、ステージIDと進捗互換性を安易に変えない
