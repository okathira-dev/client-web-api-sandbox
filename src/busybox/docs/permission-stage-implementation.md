# 権限・実機ステージ実装メモ

> 2026-07-20追記: 本文の差分・技術スパイク表現は設計履歴である。S-190拡張とS-380 / S-390分離案は実装済み。公開合格には本文の実機ゲートが引き続き必要である。
>
> 現行の箱番号・成功条件・実装状態はこのメモから導かない。現行仕様は[現行ステージ解法仕様](./stage-walkthroughs.md)、状態は[ステージ実装状況](./stage-implementation-status.md)、残問題は[現状・残問題・人手確認への引継ぎ](./current-status-and-handoff.md)を正とする。

## 共通原則

権限プロンプトはページ表示時や一覧表示時には出さず、各ステージの説明可能なボタン操作からだけ開始する。拒否、機器なし、実行時失敗は箱の未解決として扱い、アプリ全体のエラーにしない。

ステージを戻る、別画面へ移る、再読込する場合は共通AbortSignalと各ステージのcleanupでイベント、タイマー、Animation Frame、MediaStreamTrack、AudioContextを破棄する。

事前確定できる動画、音声、画像fixtureはruntime生成せず、source、生成script、codec等の生成条件、checksumとともにGit管理する。player入力やlive sensorへ依存する出力だけを実行時に生成する。同期・リアルタイム性が本質でない問題の合言葉は固定し、copy可能なら説明的な長い`BUSYBOX{...}`、映像・音声等から転記するなら最大2語とする。

## S-030 選ばれた範囲（DR-029追加箱、初版実装済み）

- B01は現行どおり、playerが見えている正解語を実Selectionした事実だけで開く純Selection問題とする。
- B02は一つの文章へ散らした3個の正解断片を順にSelectionさせる。正しい単一Rangeごとにcloneを同じ`Highlight`へ`add()`し、native Selectionが次へ移っても過去の非連続蛍光線を残す。3Rangeを正順で保持した時だけ開き、inputは置かない。部分選択、段落外、複数断片をまたぐRange、順序違いは追加せず、reset時だけ既存Rangeを空にする。
- B03はspanやbuttonへ分割していない同一paragraph上へ、複数の名前付きHighlightを一部重ねて登録する。箱面の色列に従ってplayerが蛍光領域へ触れ、trusted `pointerup`のviewport座標を`CSS.highlights.highlightsFromPoint()`へ渡す。返された`HighlightHitResult.highlight`を順序非依存の集合として次の正解集合と完全一致させ、2個のHighlightが重なる点を含む全列の完了で開く。空、余分なHighlight、誤った集合、順序違いは入力列を先頭へ戻す。
- B03の`event.target`は共通paragraphのままであり、`elementFromPoint()`、手計算したRangeのDOMRect、透明elementの重ね置きでは成功させない。B02はCSS Custom Highlight非対応、B03はさらに`highlightsFromPoint()`非対応なら未観測のままとし、別方式の代替clearを作らない。
- keyboardではB02のSelectionを「記録」buttonで同じRange登録経路へ渡せる。B03は座標hit testが中心操作なのでfake keyboard clearを追加せず、対応状態と入力進捗をlive regionで通知する。
- 離脱時は専用registry名、Range参照、Selection / pointer listenerをすべて破棄し、選択文字列、座標、入力列は保存しない。人手確認: H-001, H-002, H-003, H-004, H-020, H-025。mouse / touch / keyboard Selection、重なり集合、拡大・折返し、bidi、synthetic event、非対応隔離、cleanupを確認する。

## S-100 傾けて止める

- 観測: `deviceorientation` のbeta・gamma。
- 判定: beta 45°±12°、gamma 0°±12°を1秒維持。
- 権限: iOS系で `requestPermission` が存在するときだけ明示ボタン内で呼ぶ。
- 保存: `orientation:held` という判定事実だけ。
- 人手確認: H-008。回転ロック、縦横、イベント頻度差は自動テストで保証しない。

## S-110 光だけを見る

- 観測: 背面優先カメラ映像をDOM外videoへ流し、32×24 canvasで200msごとに平均輝度を算出。
- 判定: 暗さ（55未満）を観測した後、明るさ（165超）を観測。
- プライバシー: 映像を画面表示、保存、送信しない。進捗には `camera:dark-light` だけを保存。
- cleanup: interval停止、全MediaStreamTrack停止、`srcObject`解除。
- 人手確認: H-006, H-007, H-019。カメラ自動露出による閾値差を実機で確認する。

## S-120 音のかたち

- 観測: Web Audio Analyserの時間領域バッファからRMSだけを算出。
- 判定: 静か（0.05未満）→大きな音（0.2超）→静か（0.06未満）。
- プライバシー: 音声サンプルを録音、保存、送信しない。進捗には `audio:quiet-loud-quiet` だけを保存。
- cleanup: Animation Frame停止、source切断、全MediaStreamTrack停止、AudioContext終了。
- 人手確認: H-006, H-007, H-019。端末ゲイン、騒音、Bluetoothマイク差を確認する。

## S-130 箱の外の鍵

- 書き出し: 18byteの乱数を含む最大数百byteの `.busykey` JSONを生成。
- 保存: 乱数自体ではなくSHA-256だけを観測事実として保存し、第1箱を開く。
- 再投入: 4KB以下、formatが `busybox-key-v1`、保存済みハッシュと一致する場合だけ第2箱を開く。
- cleanup: Object URLをクリック後に破棄し、選択inputを空にする。
- 人手確認: H-014, H-020。キャンセル、別ファイル、巨大ファイル、再ダウンロードを確認する。

## S-180 見えない受け渡し

- stage上のcopy操作をplayerが行った時、`navigator.clipboard.writeText("xobysub")`で`busybox`を文字順だけ逆にした鍵をclipboardへ書く。書込成功だけでは箱を開かない。
- playerはpage外の任意の編集面へ貼り付け、文字順を`busybox`へ直し、それを再びsystem clipboardへcopyしてstageへ戻る。stage内に修正用text inputやpaste欄は置かない。
- S-180-B01の箱そのものをclick / keyboard activationしたhandler内でだけ`navigator.clipboard.readText()`を呼ぶ。取得値がtrimやcase-foldなしで正確に`busybox`なら開き、それ以外、読取拒否、空clipboardは未解決のままにする。
- 自動polling、visibility復帰時の読取、paste eventだけでの判定は行わない。Clipboard readの権限・user activation境界も問題の一部とする。
- clipboardには非機密な短語が残るため、離脱時に無断で上書きしない。clipboard値、失敗時の別文字列、編集履歴は進捗やDriveへ保存しない。
- 現行コードとの差: 現在はround固有`BOX-XXXXXXXX`のwrite成功でB01、同じtokenのinput pasteでB02を開く。これを固定の逆順鍵、page外修正、箱click時readの1箱へ置換する。
- 人手確認: H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025。write / read許可、browserのuser activation差、外部editor往復、case / whitespace不一致、keyboard activation、取消、離脱後の非上書きを確認する。

## S-190 画面の中の画面

- 観測: 明示ボタンから `getDisplayMedia()` を呼び、選択されたvideo trackの `displaySurface` とvideo frameの継続を読む。
- 判定: browser surfaceが12 frame以上再生された場合だけ開く。共有ダイアログを開いただけでは判定しない。
- プライバシー: capture frameを解析、保存、送信しない。プレビューは現在のステージ内だけに表示する。
- cleanup: interval停止、全MediaStreamTrack停止、videoの `srcObject` 解除。
- 承認済みB02: 同じcapture streamをMediaRecorderへ渡し、start、recording中のframe進行、明示stop、非空dataavailable、stopを観測する。Blobはsize確認後に即時破棄する。
- 承認済みB03: 同じcapture video trackを同一roundのobserver tabへWebRTCで送り、observer側の実frame進行で判定する。BroadcastChannelはsignalingにだけ使う。
- 現行実装との差: B02、B03、observer tab、WebRTC / MediaRecorder cleanupは未実装。詳細は `blackbox-mechanism-ledger.md` のBB-081–082を正とする。
- 人手確認: H-006, H-007, H-012, H-019。タブ共有、画面共有、取消、ブラウザ側の共有停止を確認する。

### 画像マーカー拡張案

- 採用B04: S-190でroundをarmedにしてmind map型stage一覧を別tabで開く。BroadcastChannel handshakeが成立したmapだけ、一覧canvasの外縁にround固有payloadとchecksumを持つ高contrast markerを表示する。playerがmapをpanしてmarkerを見つけ、そのtabを`getDisplayMedia()`の共有対象へ選び、stream frameからmarker geometryとpayloadを連続3 frameでdecodeできた場合だけ開く。marker DOMの表示、map到達、viewportへの表示だけでは開かない。
- B05候補（実機PoC待ち）: Service Workerから表示するnotificationの`image`へ別種のround markerを置き、共有映像内の通知欄からdecodeする。`showNotification()`成功だけでは開かず、B04と異なるmarkerの実pixelを要求する。
- B05は通知画像自体がLimitedであり、OS / browserがscreen sharing中のsystem notificationを抑止または共有映像から除外する場合がある。対象環境を少なくともWindows、macOS、Androidの現行browserで試し、実pixelが安定して取れる環境が確認できるまで採用確定にしない。
- marker bitmapはclient生成し、round終了時にCache Storage / Object URLから破棄する。解析用Canvasは低解像度にし、frame、通知内容、decode失敗画像を保存・送信しない。
- S-090 / S-410 / S-420はnotification click / action eventが中心であり、この案は通知のpixelをscreen captureへ戻すことが中心なので別の問題箱として扱える。

## S-240〜S-250 ブラウザ・OS境界

- S-240現行: 毎回生成する印を `navigator.share()` へ渡し、share targetまたはOSへのpayload引き渡しでpromiseがresolveした場合だけ判定する。target内での投稿・保存完了は観測できない。取消は未クリアのままとする。
- S-240承認済み再設計: 現行の送出をB01として残し、manifestでinstalled BusyboxをWeb Share Targetへ登録する。browser UIまたは別appから同じround URLを受信した場合にB02を開く。stage内と共通PWA画面からBusybox自身のインストール手順へ進めるようにする。
- S-250現行: origin内のexclusive Web Lockを保持する箱と、別タブで `ifAvailable` が取得不能になった事実を受け取る箱に分ける。BroadcastChannelは観測通知だけに使い、離脱時にlockを解放する。
- S-250承認済み再設計: ラウンド固有のRGB三色lockを別タブで保持し、三色同時で第1箱を開く。第1箱から開いた白い監視タブが `B → G → R` の解放順を観測して第2箱を開く。終了通知だけを正とせず、Web Lockの実解放を判定に使う。詳細は `blackbox-mechanism-ledger.md` のBB-065を正とする。
- 人手確認: H-004, H-012, H-013, H-014, H-022, H-023。PiP終了、共有先なし、共有取消、holder tab終了、同時操作を確認する。

## S-310 / S-330 PWAライフサイクル

- S-310-B01: manifestの `launch_handler.client_mode` を `navigate-existing` とし、`window.launchQueue` の実callbackに渡されたstage-scoped target URLだけを判定する。通常のリンククリックだけではクリアしない。
- S-310-B02: manifest `shortcuts`の専用URLを先頭taskとして登録し、installed Busybox iconのlong press / right clickからLaunchQueueへそのtarget URLが渡された場合に開く。page内に同じclickable linkを置かない。
- S-310-B03: manifest `note_taking.new_note_url`を専用URLへ向け、OS / browserの「新規メモ」入口からLaunchQueueへtarget URLが渡された場合に開く。実装が入口を提供しない環境では未観測のままにする。
- S-330: 明示操作からScreen Wake Lockを取得し、visibilityでreleaseされた後、表示復帰時に同じ入場内で再取得できた場合に第2箱を開く。
- cleanup: WakeLockSentinelをreleaseし、visibility / release listenerを破棄する。LaunchQueueへは同一入場のconsumerだけを登録する。
- 人手確認: H-005, H-021, H-022, H-023。インストール起動、既存windowへの再起動、タブ非表示、OSの省電力制限を確認する。

## S-440〜S-460 PWA起動面

- S-440: manifest `file_handlers`へMIME `application/x-busybox`と固有拡張子`.busybox`を登録する。stageがclientで生成したround fileをdownloadし、OSのfile managerからinstalled Busyboxで開いた時だけ`LaunchParams.files`を読む。内容一致後にhandle参照を破棄し、file input / dropでは開かない。file dropだけで未起動PWAをlaunchする標準経路はない。
- S-450: manifest `protocol_handlers`へ`web+busybox`を登録する。stageの明示操作でround nonce入りcustom URLを開き、handler URLへ展開されたpayloadとmemory上のarmed roundを照合する。初回確認の拒否、既定handler変更、直接HTTPS遷移は未クリアとする。
- S-460: `display_override`に`window-controls-overlay`を含める。`navigator.windowControlsOverlay.visible`と`getTitlebarAreaRect()`を毎回読み、矩形内の`app-region: no-drag`要素の実clickだけを受ける。geometrychangeで位置を追従し、離脱時にlistenerを破棄する。
- manifest更新後の既存installには反映遅延や再installがあり得るため、共通PWA画面でmanifest版と更新手順を示す。どのstageもinstall完了だけでは開かない。
- 人手確認: H-005, H-006, H-019, H-020, H-021, H-023, H-025。Windows / macOS Chromiumのfile / protocol / overlayと、入口を提供する環境のnote-takingを実機で確認する。

## S-480 文字の目盛り（仮）

- documentに`<meta name="text-scale" content="scale">`を設定し、rootのfont sizeを固定pxで上書きしない。stageの基準probeは`font-size: medium`とする。
- current computed sizeを標準16pxで割ったscaleとして、B01小`<0.90`、B02標準`0.90以上1.20未満`、B03大`1.20以上1.50未満`、B04特大`1.50以上`の相互排他的な4帯へ分類する。
- 入場時の帯を直ちに評価し、設定変更がlive反映されるbrowserではcomputed style / layout変化を購読する。reloadが必要なbrowserでは再入場時に新しい帯を評価する。
- 4段のtypographic clueを`rem` / `em`で描き、current bandに対応する行だけが箱へ接続する。page内にfont sliderや数値倍率を表示しない。
- browser zoom、viewport resize、`transform: scale()`、stage内CSS変更は判定に使わない。exact computed pxとOS / browser設定名は保存せず、観測したband IDだけを問題箱へ渡す。
- 技術スパイクで各対象OSの離散設定を列挙し、4帯すべてへ実操作で到達できる組み合わせと境界丸めを確認する。到達不能な環境へ代替clearやskipは追加しない。
- 人手確認: H-003, H-004, H-019, H-020, H-023, H-025。OS文字設定、browser既定font、初期大文字設定、live update、reload後反映、zoom非clearを確認する。

DR-019で追加承認したB05〜B09は、文字倍率4箱とは別にUser Preferences APIを使う。

- B05 `prefers-color-scheme`: 現在の実効light / darkと反対側を`navigator.preferences.colorScheme.requestOverride()`で要求し、盤面全体の明暗反転を描く。
- B06 `prefers-contrast`: `validValues`の安全な候補から現在値と異なる値を要求し、箱の輪郭・境界の強さを切り替える。`less`を固定正解として強制しない。
- B07 `prefers-reduced-motion`: `reduce`を要求し、動いていた錠前を停止する。
- B08 `prefers-reduced-transparency`: `reduce`を要求し、半透明の外装を不透明にして鍵穴を現す。
- B09 `prefers-reduced-data`: `reduce`を要求し、情報量の多い絵を軽量な記号へ置き換える。
- 各箱は明示操作から`requestOverride()`を呼び、Promise成功後に`PreferenceObject.override`と対応する`matchMedia()`が要求値へ一致した場合だけ開く。初期OS設定、CSS classの直接変更、`matchMedia()`だけの一致はclearにしない。
- 開箱演出後、reset、stage離脱、`pagehide`で対象の`clearOverride()`をbest-effort実行し、「システム設定へ戻す」操作も置く。override値は保存しない。非対応またはUA拒否は未観測とし、通常theme toggleによる代替clearは作らない。

## S-490 名前の鍵（仮）

- 1つのtext inputとS-490-B01を置き、inputのplaceholderを小文字の`busybox`とする。答えを説明文やlabelには重ねて書かない。
- `input` eventで現在値を読み、IME composition中は判定せず、`compositionend`後を含めて値がcase-sensitiveで正確に`busybox`になった場合だけ開く。trim、case-fold、自動補正はしない。
- typing、paste、autofillは区別しない。このstageの中心は入力経路ではなく、別stageで再登場する鍵語をplayerの記憶へ残すことにある。
- inputは`autocomplete="off"`、`autocapitalize="none"`、`spellcheck="false"`とし、値とInputEvent履歴をstorage、進捗、Driveへ保存しない。離脱時はcomponent memoryとlistenerを破棄する。
- stage mapではS-490からS-500へ「手掛かりの継承」を示す有向edgeを置く。S-500をhard lockせず、先に見つけたplayerだけが関係へ気づける配置にする。
- 人手確認: H-001, H-002, H-003, H-004, H-020, H-025。keyboard、touch keyboard、paste、IME、autocorrect、case / whitespace不一致、再入場を確認する。

## S-500 暗号の紙片（仮）

- stage入場ごとに短い英数字の平文をmemoryで生成し、`busybox`を正確に1回だけ含める。1〜25のround固有shiftでCaesar変換した暗号文だけを最初の紙面へ表示する。
- playerが暗号文block全体を選択してuser-initiated copyを実行した時だけ、trusted `copy` eventで`clipboardData.setData("text/plain", plaintext)`を設定して`preventDefault()`する。部分選択や別DOMのcopyでは差し替えず、進捗も開かない。
- 空の貼付け紙面でtrusted `paste` eventを受け、`clipboardData.getData("text/plain")`が同じroundの平文と一致した時だけ、値を`textContent`相当で安全なstatic DOMとして表示する。typing、drop、query parameterでは表示しない。
- `selectionchange`でselectionの単一Rangeが貼付け結果DOM内に完全包含され、trimやcase-foldをせず文字列が正確に`busybox`で、前後の文字を含まない場合だけS-500-B01を開く。
- copy、clipboard差替え、pasteだけでは箱を開かない。成功根拠は暗号文→clipboard平文→貼付けDOM→exact selectionの全chainを同じmemory roundで通過したこととする。
- S-180は逆順鍵をpage外で直して箱click時に読み戻すClipboard API問題、S-490はplaceholderを使う直接入力問題、S-030は可視語の純Selection問題として分離する。
- clipboardには非機密な短文が残るため、自動的に上書きしてcleanupしない。stage離脱時はcopy / paste / selection listenerとround平文のmemory参照だけを破棄し、平文・暗号文・selectionを進捗へ保存しない。
- stage mapではS-180とS-490からS-500へ手掛かりの継承edgeを引くが、到達順は強制しない。
- 人手確認: H-001, H-002, H-003, H-004, H-006, H-014, H-020, H-025。mouse / touch / keyboard selection、OS copy UI、部分copy、別paste、複数`busybox`防止、前後空白、synthetic event、離脱cleanupを確認する。

## S-510 窓を渡るステッカー（仮）

- B01 sourceはinstalled PWA windowでだけ有効にし、通常browserで開いた同一roundのreceiver pageを別top-level contextとして用意する。共通PWA導線からinstallとsource起動方法へ到達できるようにする。
- sourceはround ID、乱数nonce、checksumを埋めた小さなPNG Blob / Fileをplayerがdragを始める前にmemory生成する。画像表面は同じpayloadを文字として露出しない。
- draggable stickerの同期`dragstart` handler内でだけ`event.dataTransfer.items.add(file)`を呼び、drag imageをstickerへ設定する。非同期`toBlob()`をdragstart後に開始しない。
- receiverの実`drop` eventで`DataTransfer.items`からkind `file`、MIME `image/png`の項目を取得し、size上限内のbytesをlocal decodeする。embedded round ID、nonce、checksumが現在のarmed roundと一致した時だけS-510-B01を開く。
- `text/plain` / custom stringだけのdrop、同一page内drop、file input、clipboard paste、download後のupload、OSの「開く」、programmatic DragEventでは開かない。
- B02はBusyboxとはcross-siteになる専用の外部静的originを直接child iframeとして埋める。helperはcookie、storage、analytics、identity、backendを持たず、current round識別子と期待layer一覧だけをquery / initial messageで受ける。
- helper iframeには事前生成・Git管理した透明PNG layer 3枚を直接`<img>`として置き、iframe内ではblur / cropして表示する。各画像の同期的な実`dragstart`で、browser既定の`text/uri-list`画像URLを維持したまま、layer IDとcurrent roundを標準text payloadへ追加する。非同期処理や画像生成を`dragstart`から開始しない。
- 親Documentの現像台はtrustedな実`drop`でだけpayloadを読む。`text/uri-list`がallowlist済みhelper origin上の期待PNG URLであり、current roundとlayer IDが一致し、同じiframe instanceのactive dragとして整合する場合だけlayerを受領する。3枚をfilterなしの`<img>`として同じ座標へ重ね、全layerが一度ずつ揃った時にS-510-B02を開く。
- B02は通常link / address barから同じURLをdragした場合、同一page内drag、file input、clipboard、download / upload、`postMessage`だけ、constructed DragEvent、想定外origin / path、stale roundでは開かない。cross-origin画像はcanvasでpixel readせず、表示だけに使う。
- 完成時は固定flag `BUSYBOX{THE_IMAGE_ESCAPED_FROM_ITS_FOREIGN_FRAME}`をcopy可能なtextとして表示する。PNG 3枚、完成見本、生成source、生成手順、checksumを実装前にGit管理する。
- PNG、payload、drag履歴をstorageやDriveへ保存せず、serverへ送信しない。round終了時にBlob / File参照、iframe、active drag、受領layer、receiver recordを破棄する。
- desktop Chrome、Edge、Firefox、Safariで、B01のscript生成Fileがinstalled PWA windowからbrowser windowのdropまで保持されるか、B02の`text/uri-list`とcurrent payloadがcross-origin iframeから親Documentのdropまで保持されるかをPoCする。不成立環境へ別clear routeを追加しない。
- 人手確認: H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025。PWA / browser境界、iframe / parent境界、window配置、取消、別画像、oversize、通常link、stale round、重複layer、同一page非clear、keyboard説明、cleanupを確認する。

## S-520 近づく影（仮）

- 明示開始操作から`ProximitySensor`を生成してstartし、少なくとも1回の実`reading`でfar状態を観測した後、同じinstanceの後続readingが`near === true`になった場合にB01を開く。
- reading未受信の初期`null`をfarとして数えない。distanceのcm値やmax値は判定・保存に使わない。
- camera遮蔽、画面touch、pointer長押しによる代替clearは用意しない。非対応、hardwareなし、permission / policy拒否は未観測のままにする。
- 離脱時にsensorをstopし、listenerとlatest readingを破棄する。
- 人手確認: H-006, H-019, H-023, H-025, H-026。far→near、初期near、素材差、permission、visibility、cleanupを確認する。

## S-530 三軸の振り子（仮）

- `LinearAccelerationSensor({ frequency: 60, referenceFrame: "device" })`のX/Y/Zを読み、各axisに独立したB01〜B03を置く。
- 1つの箱は、target axisが他2軸より十分大きい正peakと負peakを短いtime window内で両方観測した場合に開く。単発の衝撃、傾けただけ、同符号だけでは開かない。
- 初期値は絶対値8m/s²、他軸の1.5倍、800ms以内をPoC基準とし、安全な短い手首の往復で達成できる値へ調整する。端末を投げる、落とす、机へ打ち付ける説明や判定は作らない。
- raw samples、peak値、frequency、端末情報を保存しない。離脱時にsensorをstopする。
- 人手確認: H-006, H-019, H-023, H-025, H-026。軸表示、縦横画面、誤軸、複合shake、sampling差、安全な強度、cleanupを確認する。

## S-540 光の両端（仮）

- `AmbientLightSensor`の実`illuminance`を読み、B01暗所とB02非常に明るい環境を順序なしで独立して開く。
- 初期PoC帯は暗所`<= 50 lx`、明所`>= 10,000 lx`を1秒維持とする。仕様上readingは少なくとも50 lux単位へ量子化され得るため、境界は対象実機の報告帯を見て調整するが2箱は維持する。
- 明所は安全な屋外日陰や十分に明るい室内を想定し、太陽を直接見る、端末を太陽へ向け続ける、高出力光源へ極端に近づける案内はしない。
- camera frame、CSS theme、screen brightnessは判定外。lux列や環境推定は保存しない。離脱時にsensorをstopする。
- 人手確認: H-006, H-019, H-023, H-025, H-026。量子化、saturation、sensor位置、暗所、明所、安全な光源、permission、cleanupを確認する。

## S-550 無重力の瞬間（仮）

- `Accelerometer`のraw `x` / `y` / `z`から`Math.hypot(x, y, z)`を計算し、合成値が0付近の帯へ短時間入った場合にB01を開く。
- 初期PoCは合成値2.0m/s²以下、3 reading以上、先頭から末尾まで80ms以上とする。2.0m/s²をclear側、3.0m/s²をreset側とするhysteresisを試し、実機noiseとsampling rateを見て閾値だけを調整する。
- `null`、非有限値、page非表示中のreadingは無効とし、sensor停止、permission / policy、離脱cleanupはGeneric Sensor共通runtimeで扱う。
- stage内の文章や演出では端末を投げる、落とす、打ち付ける操作を指示しない。PoCでは端末を損傷させない試験手順と誤検知率も合格条件に含める。
- `GravitySensor`固有の箱は作らない。端末情報とraw readingは保存しない。

## S-560 三つの回転（仮）

- `Gyroscope({ frequency: 60, referenceFrame: "device" })`のrad/sをtime deltaで積分し、X/Y/Zに独立したB01〜B03を置く。
- target axisの絶対角速度が他2軸より十分大きいsampleだけを積算し、同じ符号方向の累積角が約`2π`へ達すると対応箱を開く。逆回転した分は差し引き、randomな端末振りでは進めない。
- 回転方向は正負どちらでもよい。端末を両手で保持して1回転させる範囲とし、投げる、指先だけで高速spinする、周囲へぶつける操作を要求しない。
- raw angular velocity、trajectory、端末情報を保存しない。離脱時にsensorをstopする。
- 人手確認: H-006, H-019, H-023, H-025, H-026。軸、符号、screen orientation、sampling gap、drift、複合回転、安全な操作、cleanupを確認する。

## S-570 姿勢の輪（仮）

- `RelativeOrientationSensor`で開始quaternionをmemoryへ取り、開始姿勢から相対的なX/Y/Z quarter-turn gateを各1回通過した後、開始姿勢のangular distance内へ戻って1秒静止するとB01を開く案。
- S-560は角速度と累積回転量、S-570は現在quaternionが作る姿勢pathと閉路を判定する。gate順は視覚patternとして示し、raw quaternion列は保存しない。
- `AbsoluteOrientationSensor`はmagnetometer permissionへ依存するため採用しない。Relative版のgate角度と開始姿勢への許容角は実機PoCで確定する。
- 人手確認: H-006, H-019, H-023, H-025, H-026。quaternion符号同値、gate順、drift、開始姿勢復帰、sampling gap、cleanupを確認する。

## S-580 声の鍵（仮）

- B01はmicrophone iconの明示buttonからだけ、`SpeechRecognition`またはvendor prefix付き同interfaceの1回認識を開始する。`lang = "en-US"`、`continuous = false`、`interimResults = false`とする。
- B01は`result` eventのfinal alternativesだけを調べる。transcriptをNFKC、英小文字へ変換し、Unicodeの空白と句読点を除いた結果が正確に`busybox`なら開く。interim result、page内text input、録音file、独自ASRは成功根拠にしない。
- target文字列をstage本文へ直接表示せず、S-490で覚えた語とmind mapのclue edgeを手掛かりにする。音声なしで答えを説明するaccessibility textは置かないが、buttonの役割とlistening状態は視覚・読み上げの両方で示す。
- 開始前に、アプリは音声とtranscriptを保存しないこと、browserの認識実装が外部serviceへ音声を送る可能性があることを説明する。`processLocally`、`available()`、`install()`は実験的な別機能として台帳に残すが、この箱の成功条件や代替routeにはしない。
- final result、`end`、`error`、stage離脱でrecognitionをstop / abortし、取得したmicrophone trackがある実装ではtrackもstopする。transcript、confidence、alternatives、音声は進捗やDriveへ保存しない。
- DR-063追加B02は1〜12文字のASCII小文字だけを受ける。i文字目をalphabetで+i shiftしてzからaへwrapする。変換結果はDOM、status、accessible nameへ表示せず、`SpeechSynthesisUtterance`へ一文字ずつ区切った`en-US` textとして渡す。
- B02はtrustedな提出ごとに既存queueを`cancel()`してから一つのutteranceを` speak()`する。変換結果が`busybox`、すなわち入力が`aspuwiq`であり、そのutteranceが実際に`start`した後、取消・errorなしで`end`した時だけ開く。文字列一致だけ、`start`だけ、直接`busybox`を入力した場合では開かない。
- 空欄、ASCII小文字以外、13文字以上は発話しない。入力、変換結果、試行回数、voice情報、発話履歴は保存・同期・送信しない。再提出、reset、離脱、abort時は`speechSynthesis.cancel()`し、utterance listenerと参照を破棄する。
- `speechSynthesis`、`SpeechSynthesisUtterance`、利用可能voiceのいずれかがない場合と発話errorではB02を未観測とし、録音音声、画面表示、Web Audioによる代替clearを作らない。
- 人手確認: H-006, H-007, H-019, H-020, H-023, H-025, H-027。B01のpermission、取消、no-speech、network、言語差、候補列に加え、B02のvoice準備、文字読み、queue取消、start / end / error、離脱cleanupを確認する。

## S-590 広がる円（仮）

- 開始buttonの明示操作後、`getCurrentPosition()`で高精度fixを取得してroundをarmedにする。開始fixは`latitude`、`longitude`、`accuracy`、`timestamp`、round IDだけをmemoryと同一tabの`sessionStorage`へ保存する。
- B01、B02、B03の距離はそれぞれ5m、25m、100m。現在fixまでのhaversine距離を`d`として、`max(0, d - startAccuracy - currentAccuracy)`が各閾値以上になった場合だけ対応箱を開く。観測距離そのものや座標はUIへ表示しない。
- armed中のvisible documentでは`watchPosition({ enableHighAccuracy: true, maximumAge: 0 })`を使う。hidden時は`clearWatch()`して電池消費を止め、visible復帰時に`getCurrentPosition()`で現在fixを再取得してからwatchを再開する。
- screen sleep、page freeze / discard、同一tab内reloadでは`sessionStorage`のanchorからroundを復元する。標準APIはhidden documentへ位置updateを配送しないため、sleep中の経路は追跡せず、復帰後の開始点からの直線距離だけを判定する。
- anchor recordのTTLは24時間。B03達成、player reset、期限切れで即削除する。tab / PWA session終了時もsessionStorageのlifecycleに従って消える。経路、途中fix、speed、heading、altitudeは保存せず、Drive同期・analytics・外部送信へ含めない。
- 位置情報非保存原則に対する限定例外をpermission説明前に明示する。許可拒否、accuracy不足、timeout、session復元失敗に別のclear routeは用意しない。
- 人手確認: H-004, H-006, H-019, H-022, H-025, H-028。GPS drift、accuracy、各距離、sleep / wake、discard / reload、expiry、削除、watch cleanupを確認する。

## S-600 三つの高度帯（仮）

- 初回は位置利用の説明後、明示buttonから`watchPosition({ enableHighAccuracy: true, maximumAge: 0 })`を開始する。許可済みの再訪ではstage表示中に最新fixを取得する。
- B01は100m未満、B02は100m以上500m未満、B03は500m以上。browserが返す`altitude`をそのままWGS84基準の報告値として扱い、海抜や建物階を別data sourceで補正しない。
- `altitude`と`altitudeAccuracy`が有限値の場合だけ、下限`altitude - altitudeAccuracy`と上限`altitude + altitudeAccuracy`を計算する。B01は上限`< 100`、B02は下限`>= 100`かつ上限`< 500`、B03は下限`>= 500`を満たす場合に候補とする。
- 同じ帯の候補readingを3回以上かつ先頭から5秒以上観測した時だけ対応箱を開く。境界をまたぐaccuracy区間、`null`、stale fix、別帯readingでは候補列をresetする。
- 各帯は別訪問で累積できる。保存するのは通常のproblem達成IDだけで、latitude、longitude、altitude、accuracy、altitudeAccuracy、timestampはsessionStorage、IndexedDB、Drive、analyticsへ保存・送信しない。
- hidden、permission error、stage離脱で`clearWatch()`する。非対応、`null`、accuracy不足に別のclear routeは用意しない。
- 人手確認: H-004, H-006, H-019, H-023, H-025, H-029。実高度帯、境界、drift、null、連続判定、再訪累積、cleanupを確認する。

## S-200 / S-210 外部表面

- S-200: `navigator.getGamepads()` をAnimation Frameごとに読み、2ボタン以上と絶対値0.65以上の軸入力が同じframeに存在するときだけ判定する。controller ID、mapping、timestampは保存しない。
- S-210: `setAppBadge(1)`、`setAppBadge(2)`、`setAppBadge(3)` の各promiseが完了した順序を観測し、第3段階で判定する。離脱時は `clearAppBadge()` を呼ぶ。
- 人手確認: H-005, H-009, H-019, H-023。未接続、複数gamepad、PWA未インストール、OS側badge非表示を確認する。

## S-220 戻る道（DR-047追加箱、初版実装済み）

- 既存B01〜B03は変更しない。B04のround開始時にNavigation APIでsame-document entry Aを基点とし、trusted UIの選択からround固有stateを持つB、Cを順に`navigation.navigate()`で作る。
- playerが実際のbrowser Backを2回使い、user-initiated traverseとしてAへ戻ったことを観測する。stage内の模擬Back buttonやscriptだけの`navigation.back()`は成功手順へ数えない。
- Aから別の選択肢Dへ進んだ後、round開始時に参照を保持したBとCの`NavigationHistoryEntry`が両方とも`dispose`を発火し、`navigation.currentEntry`がD、`navigation.canGoForward === false`になった時だけB04を開く。`dispose`の順序には依存しない。
- Aから直接Dへ進む、queryだけを変更する、entry数だけを合わせる、B / Cを残したままD相当の表示へ変える、別roundのentryを使う操作では開かない。
- `window.navigation`、`entries()`、`currentEntry`、`NavigationHistoryEntry.dispose`をfeature detectionする。不足する環境ではB04を未観測とし、History APIや模擬履歴による代替clearは作らない。
- entry object、key、id、state、listenerはround内memoryだけに保持し、進捗以外の履歴情報を保存・同期・送信しない。開箱、reset、離脱、abort時にlistenerと参照を破棄し、試行で積むentry数を固定上限にする。
- 自動確認: A→B→C→Back→Back→D、B / Cのdispose順の違い、直接D、1回だけBack、script traverse、別round、対応API欠損、reset / cleanupを検証する。人手確認: H-001, H-002, H-003, H-022で実browser Back、forward枝の消失、履歴汚染の上限を確認する。

## S-260 画面の色

- S-260: 明示操作から `EyeDropper.open()` を呼び、ブラウザが返した `sRGBHex` がステージ上の指定色と完全一致した場合だけ判定する。取消は未クリアとする。
- S-270 / G-024のWebGPU案はD-141で不採用とし、実装と現行計画から削除した。
- 人手確認: H-006, H-019, H-023。色管理差とEyeDropper取消を確認する。

## S-280〜S-300 外部機器

- S-280: `battery_service` を公開する機器だけをpickerへ出し、GATT接続後に `battery_level` characteristicを実際に読む。選択や接続だけでは判定せず、読取後と離脱時に切断する。
- S-290: WebHID pickerで選択したdeviceをopenし、byteを含む実 `inputreport` を待つ。product name、vendor/product ID、report本体は保存しない。
- S-300: WebUSB deviceをopenし、configurationとIN endpointを確認してinterfaceをclaimした後、実 `transferIn()` がbyteを返した場合だけ判定する。受信内容やdevice IDは保存しない。
- cleanup: HID / USB deviceは離脱時にcloseし、inputreport listenerを解除する。USB転送中の離脱はdevice closeで終了させる。
- 人手確認: H-006, H-010, H-011, H-019, H-023。picker取消、機器なし、切断、空report、IN endpointなし、再接続を確認する。

## S-320 折れ目をまたぐ

- 観測: `navigator.devicePosture.type` とhorizontal / vertical viewport segmentsのmedia query。
- 判定: postureが `folded`、またはviewport segmentが2面になった実状態だけを使う。通常viewportの開発用ボタンは用意しない。
- cleanup: postureとMediaQueryListのchange listenerをすべて解除する。
- 人手確認: H-023。対応する折りたたみ実機でcontinuous / folded、縦横、折れ目幅、再展開を確認する。

## S-350 native media

> 現在のS-350 B01〜B06とS-810 B01の成功条件は[現行ステージ解法仕様](./stage-walkthroughs.md)を正とする。

- B01〜B03はnative seek、mute / volume 0、play後の終了前pauseを別々に観測する。
- B04はnative controlsで1倍速以外が選ばれ、`ratechange`後の`playbackRate !== 1`を観測した時だけ開く。page側から値を設定するUIやscriptは置かない。
- B05はnative controlsの字幕menuからlabel `Busybox`を選び、targetだけが`showing`なら開く。
- B06は同じnative videoのbrowser所有PiP controlから小窓へ入り、実`enterpictureinpicture`を観測した時だけ開く。page製buttonや自動要求は置かない。
- 将来B07は、複数音声trackのnative UIと`AudioTrackList`を公開するbrowserだけでlabel `Busybox`を観測する。custom selectや別file再生で代替しない。
- Media Capabilities profile箱はD-141、実寸reelはD-142で不採用。VFR cadenceはS-810へ分離し、PiPはD-143でS-350-B06へ統合した。
- cleanup: mediaをpauseし、track / media listenerを解除する。再生速度、track選択、languageは保存・同期・送信しない。
- 人手確認: H-001, H-002, H-003, H-019, H-020, H-023, H-025, H-030。

## S-810 frameの拍子

- 12 / 24 / 30 / 60fps区間を持つsame-origin VFR fixtureを事前生成し、checksum付きでGit管理する。
- playerによる0.5秒以上のnative seek後だけ試行をarmする。scriptから`currentTime`を目標区間へ変えない。
- `requestVideoFrameCallback()`の`mediaTime`に、24回連続する1/24秒±0.004秒の差がある場合だけB01を開く。callback到着wall time、表示用fps、`presentedFrames`数だけでは開かない。
- cleanup: pause / ended / 離脱 / abortでframe callbackをcancelし、media time列と表示用推定fpsを保存・同期・送信しない。
- 人手確認: H-053。native seek後の24fps区間だけが開き、先頭通し再生と他3区間で開かないことを確認する。

## S-380 使い捨ての鍵（ラベル未定）

- 状態: 5問題の採用は確定。S-380のpasskey3箱と仮S-390のrequest lifecycle2箱を分けるか、S-380同一pageの5箱にするかは技術スパイク待ち。直下の6項目は旧2箱案の履歴であり、現行仕様は後半の採用仕様を正とする。
- setup: 明示操作からゲーム専用discoverable credentialを作る。作成前に、passkeyが端末または同期providerへ残り、Webページから確実には削除できないことを説明する。
- B01: 新しいchallengeで取得したassertionについて、client data、origin、RP ID hash、UP / UV flags、credential ID、signatureを保存公開鍵で検証する。promise resolveだけでは判定しない。
- B02: 実在しない乱数credential IDだけを指定した専用requestが `NotAllowedError` で拒否された場合に判定する。script abort、短時間timeout、設定errorは数えず、生体照合失敗とは表現しない。
- 保存: credential ID、SPKI公開鍵、COSE algorithm、必要なtransportだけをlocal recordへ保存する。private key、生体情報、PIN、attestation objectは保存しない。
- cleanup: ユーザー操作で `signalUnknownCredential()` をbest effortで呼び、local recordを消す。provider側の削除は保証できないため手動削除方法も案内し、progress resetでも残留警告を出す。
- 公開条件: credentialはURL pathで分離できないため、S-380はBusybox専用host名またはcustom subdomainで提供する。GitHub Pagesの共用host配下pathだけでは本番有効化しない。
- 人手確認: H-006, H-019, H-020, H-023。作成cancel、認証cancel、対象鍵なし、署名検証、ES256 / RS256、provider同期、cleanup非対応を確認する。

### 不採用: memory-only Web Crypto

- Dedicated Worker内でECDSA P-256鍵pairを `extractable: false` で生成し、private keyをWorkerのmemoryだけに保持する。
- B01は乱数challengeへの署名が元のchallengeでverifyできた場合、B02は署名後にplayerが1 bit変えたchallengeでverifyがfalseになった場合に開く案だった。
- 離脱時にWorkerをterminateし、鍵、challenge、signatureを破棄する。Web storageへは一切保存せず、OS prompt、account、cleanup操作を要求しない。
- browserやOSのauthenticator mediationがなく、既存S-020のWeb Cryptoにも近いため採用しない。

### 検討終了: credential-less WebAuthn

- B01: 実在しない乱数credential IDを指定した `navigator.credentials.get()` が `NotAllowedError`で不成立になることを観測する。
- B02: pending中の同種requestを、同一roundのbreaker tabからBroadcastChannel経由で `AbortController.abort()`し、元tabの実 `AbortError`を観測する。
- credential作成、passkey、account、provider同期、保存公開鍵は使わず、challengeとcredential IDはmemoryだけに置く。
- Conditional UI必須方針では表示候補となるdiscoverable credentialが必要なため、credential-less stageとしては採用しない。

### 採用: Conditional UI + disposable passkey

- playerがLabsから明示的にS-380を開いた場合だけpasskey作成の説明と同意画面を出す。
- setupでdiscoverable credentialを作る。`isConditionalMediationAvailable()`または`getClientCapabilities().conditionalGet`を確認し、annotated inputへ `autocomplete="username webauthn"`を設定する。
- 同一stage pageから遷移せず、passkey icon、lock iconと3箱を置く。lock iconは`autocomplete="username webauthn"`付きinputまたはlabelと関連付け、player操作でfocusする。
- B01はpasskey作成とregistration recordのIndexedDB commit、B02はautofill候補から選んだassertionの完全検証、B03は保存済みpasskeyを利用するrequestの`NotAllowedError`を観測する。
- conditional requestでは`allowCredentials`を省略する。inputの自動focus、popup dismissal、password autofill、通常cleanupのabortは箱を開かない。
- WebAuthn requestは1件ずつ直列化し、request ID、mode、challenge、AbortControllerを対応付ける。
- private keyや生体情報はsiteへ渡らないが、passkeyは端末または同期providerへ残りうる。`signalUnknownCredential()`とlocal record削除はbest effort cleanupとして提供し、手動削除方法も案内する。
- WebAuthn credentialはURL pathでは分離できないため、本番はBusybox専用host名またはcustom subdomainを前提とする。
- 人手確認: H-006, H-019, H-020, H-023。作成とlocal保存、autofill候補表示、候補なし、device verification、popup dismissal、利用不成立、request直列化、provider残留、cleanup非対応を確認する。

## S-390 request lifecycle（仮配置、技術スパイク待ち）

- 問題採用は確定。B01は乱数no-match IDを指定したnon-conditional requestの`NotAllowedError`、B02はpending conditional requestをplayerが回路操作でabortした実`AbortError`とする。
- 5箱をS-380へ統合するvariantと、G-037の2箱をこのS-390へ分けるvariantを実際に触って比較する。比較後にstage IDと配置を確定する。
- 通常cleanup、自動timer、入場直後のabortではB02を開かない。別tab、BroadcastChannel、simulation、代替クリアは使わない。
- 人手確認候補: H-019, H-020, H-023。no-matchの終了時間、conditional pending、player起因AbortError、request直列化、cleanup誤判定を確認する。

## S-400 1時間遅れの時計（ラベル未定）

- 入場memoryに `Date.now()`と`performance.now()`のbaselineだけを持ち、盤面にはmonotonic elapsedから計算した「正しい時刻より1時間遅い」アナログ時計を秒単位で描画する。
- B01はwall clock driftが-60分±5分、B02は現在の入場でB01を観測した後にbaseline±5分へ復元した場合に開く。
- `visibilitychange` / `pageshow`とforeground pollingで比較し、background timerの発火には依存しない。exact timestampや設定値を進捗へ保存しない。
- page reload、process終了、page discardでmonotonic baselineを失った場合は試行終了とし、server timeやpersistent timestampへ切り替えない。
- stage前にOS時計変更の影響と自動時刻へ戻す必要を説明する。OS設定変更不能、lifecycle切断、非対応時にsimulationや代替クリアを用意しない。
- 人手確認: H-004, H-019, H-022, H-023。-55/-65分境界、日付またぎ、background復帰、NTP、sleep、page discard、復元を対象browser / OSで確認する。

## S-410 通知の外部入力（ラベル未定）

- B01はstage pageで示した左右2記号の短い列を、persistent notificationの2 actionだけで再生する。action handlerはpageをopen / focusせず、同じround tagのnotificationを次の入力へ差し替える。
- 正解actionはcursorを進め、誤入力はcursor 0へ戻す。完了まで回数制限なく再挑戦でき、通知本文clickは入力に数えない。
- round stateはnotification `data`とService Worker用IndexedDB recordに持つ。完了時は専用inboxへcommitし、後の通常訪問でpageが一度consumeしてProblemHandleへ渡す。action列と誤入力履歴は通常進捗やDriveへ保存しない。
- `Notification.maxActions >= 2`かつ実notificationに2 actionが表示される環境だけを対象とする。page内button、通常link、S-090の復帰URLによる代替clearは用意しない。
- Service Workerの`notificationclick`はtagでS-090 / S-410を分岐する。reset / cancel / 新roundではS-410のnotificationとrecordだけを削除する。
- 人手確認: H-005, H-006, H-019, H-022, H-023, H-025。page非遷移、action ID、連続差替え、worker再起動、誤入力reset、完了inbox、再挑戦、他stageとの分離を確認する。

## S-420 通知から戻る金庫（仮）

- B01は通知の `←` / `→` actionで固定長の入力列をService Worker用IndexedDBへappendし、notification本文clickを提出としてpageへ戻す。action clickだけではpageを開かない。
- 本文click handlerは入力列をimmutableな提出snapshotへcommitしてからround IDだけのS-420 URLをopen / navigateする。pageは未消費snapshotだけを読み、直接URLやquery parameterから入力を受け取らない。
- pageは入力列と正解列を順に金庫のdial / tumbler animationへ反映し、全長完全一致で開箱する。不一致・長さ不足は扉を閉じたまま入力をresetし、同じroundのnotificationを再表示して回数制限なく再挑戦させる。
- `prefers-reduced-motion`では演出を短縮するが、照合順と成否を同じDOM状態で示す。animation eventをclear根拠にせず、比較結果を正とする。
- `Notification.maxActions >= 2`と2 actionの実表示を公開条件とする。page内矢印、通常link、URL入力による代替clearは設けない。
- reset / cancel / successでS-420 tagのnotification、round record、提出snapshotを削除する。S-090 / S-410は別tagで分岐し、通知権限を変更しない。
- 人手確認: H-005, H-006, H-019, H-020, H-022, H-023, H-025。action連打、transaction順序、本文とのrace、重複提出、worker再起動、失敗後retry、animation、cleanupを確認する。

## S-430 外側の停止と復帰（仮）

- B01はuser activationからcontrolsなしのclient生成loop audioを再生し、実playing中にMedia Sessionの`pause` action handlerが呼ばれてaudioを停止した場合だけ開く。
- B01ではnative `<video controls>`、audioの通常`pause` event、page内停止button、visibility、autoplay失敗、cleanupを判定に使わない。Control Center、lock screen、browser media UI、keyboard / headset、system interruptionはaction sourceを区別できないため、pause handlerへ届いた場合はすべてexternal pause actionとして扱う。
- B02は別試行で同じ種類の生成loop audioを使う。playerの明示開始時に`navigator.audioSession.type = "playback"`を設定し、実`playing`と`audioSession.state === "active"`を観測してからarmedにする。
- B02はarmed後の`statechange`で`interrupted`を観測し、続いて同じ試行の`active`と対象media elementの`playing`による再生復帰を確認した場合だけ開く。type設定だけ、activeだけ、inactive、通常pause、B01のpause handler、visibility、cleanupでは開かない。
- incoming call、別tab、別app等のinterruption sourceは識別・限定しない。ゲーム自身は別tab、別AudioContext、別media element、OS操作を起動してinterruptionを生成しない。UIでは特定アプリや電話を要求せず「外部の音声に中断され、戻る」と案内する。
- B01は`navigator.mediaSession`とpause handlerに加え、実際にOS / browser media surfaceへsessionが現れる環境だけを対象にする。B02は`navigator.audioSession`、`statechange`、`type = "playback"`が成立し、実interruptionと再生復帰を観測できる環境だけを対象にする。相互のAPIやpage内pauseによる代替clearは用意しない。
- 停止、開箱、reset、離脱、abort時はaudioを停止し、sourceを破棄する。全Media Session action handlerを`null`へ戻し、metadata / playbackStateをresetし、Audio Session listenerを解除して`type`を`"auto"`へ戻し、生成Blob URLをrevokeする。音源、action履歴、type列、state列、時刻、外部音声情報は保存・送信しない。
- 自動確認: B02のtype設定、active後のarming、`active → interrupted → active → playing`、順序違い、inactive、通常pause、B01との分離、重複event、cleanupをstubで検証する。人手確認: H-003, H-004, H-019, H-020, H-022, H-023, H-025, H-039。

閾値やコピーは実機ゲートの結果で調整できるが、生入力を保存しない境界とユーザージェスチャー内の権限要求は変更しない。

## S-020 / S-150 / S-610 HTML要素固有挙動（DR-025追加、初版実装済み）

- S-020は既存の幅rulerを`<meter>`へ置き換える。`min` / `max`は入場幅と目標幅を十分含む範囲、`optimum`は目標幅、`value`はclampした現在の`innerWidth`とする。visible labelにも現在幅と目標帯を残す。meterは表示専用で、成功条件は既存の実`resize`観測から変えない。
- S-150-B03は同じ非空`name`を持つ`<details>`群を一つのsection内へ置く。summaryのtrusted pointer / keyboard activationに続く`toggle`と、user agentが他要素の`open`を外した排他状態を観測し、盤面で示した開閉列が完成した時だけ開く。scriptの`open`属性変更は判定外とする。
- S-610は一つのmodal dialogを試行ごとに初期化し、B01 ×button、B02 外側light dismiss、B03 platform cancelへ分ける。各箱の試行中は他の閉じ方を無効にする。
- B01は`closedby="none"`とし、dialog内の×buttonに対するtrusted clickを記録してから`method="dialog"`または`close()`の`close`を受けた場合だけ開く。
- B02は`closedby="any"`とし、dialog矩形外でのtrusted pointerdown / pointerupと、それに続くnative close request / `close`を組み合わせる。`closedby`またはnative light dismissがない環境は未観測とし、手製backdrop clickで解錠しない。
- B03は`closedby="closerequest"`とし、×buttonを置かず外側clickも無効にする。Esc、端末back、dismiss gesture等による`cancel`と、その後の`close`を同一試行で観測すると開く。dialog内の緊急終了buttonは安全に閉じるが、B03を開けない。
- `showModal()`でtop layerと外側documentのinert化を使い、dialog内へ見出し、説明、focus可能な終了手段を置く。離脱・reset・abort時は未完了試行としてdialogを閉じ、source markerとlistenerを破棄する。
- 人手確認: H-001, H-002, H-003, H-004, H-019, H-020, H-025。pointer / keyboard summary操作、details排他性、mouse / touch light dismiss、Esc / mobile back、emergency close、focus復帰、非対応隔離、cleanupを確認する。

## S-620 Unicode数字の計算式（DR-028派生、初版実装済み）

- 一つのstageにS-620-B01〜B17を置き、各箱へ1個の固定された3桁＋3桁の式を対応させる。stage内に見せる文字情報は式と一つの共通入力欄だけとし、体系名、説明、対応表、`@counter-style`は置かない。
- 17体系はASCII / European digits、Arabic-Indic digits、Eastern Arabic-Indic digits、漢数字、Osmanya、Adlam、N'Ko、Garay、Ol Chiki、Mro、Wancho、Nag Mundari、Ol Onal、Sora Sompeng、算木数字、Kaktovik numerals、Mayan numeralsとする。playerへ一律に「17言語」とは説明せず、内部資料とcreditsで文字・記数法・基数を正確に区別する。
- 十進体系のoperandは100〜999、KaktovikとMayanは基数20の3桁とする。漢数字は通常の`百`・`十`を使い、算木数字は位ごとに2形を交互に使って0を含むoperandを避ける。Mayanは最上位を上にした縦積みとする。
- 全17回答は十進値で互いに異なる固定値とし、registry生成testで重複、範囲、各formatterのround-tripを検査する。共通欄はASCII整数だけを受け付け、未開封問題の答えとの完全一致で対応箱だけを解決する。入力値、誤答、調査履歴は保存しない。
- 式は画像やcanvasへ焼かず、選択・コピー可能なUnicode textにする。RTL系は式単位でbidi isolationし、演算子を含む視覚順をfixtureで確認する。利用fontはglyph範囲と再配布licenseを確認してself-hostし、font load失敗時にASCII式へ置換する代替clearは作らない。
- Sora Sompengは固有文字の普及と包括的文化programという背景を踏まえて収録する。宗教的由来だけを除外理由にせず、架空・異文明・暗号民族としての演出はしない。Medefaidrinは主に典礼言語として使われるため、この説明なしの算数stageには収録しない。
- 人手確認: H-001, H-002, H-003, H-004, H-014, H-020, H-025。各fontのglyph、copy結果、RTL順、Mayan縦積み、keyboard入力、17回答の対応、再入場、狭いviewport、font load失敗時の未観測を確認する。

## S-630 接続の道（DR-101追加、未実装）

- S-630-B01 Wi-Fi、B02 cellular、B03 ethernet、B04 Bluetoothの4箱を一つのstageに置き、通常の永続進捗で複数回の訪問をまたいで累積する。
- stage表示時や`change`eventだけでは開箱しない。playerが「現在の接続を観測」buttonを明示的に押した瞬間に`navigator.connection.type`を読み、4方式の一つと完全一致した時だけ対応箱を開く。change listenerは現在表示の更新だけに使う。
- `none`はS-070と重複するため対象外。`mixed`はOS / UA裁量、`other` / `unknown`は具体方式でなく、`wimax`は検証環境を用意しにくいため対象外。VPNを独立方式として推測しない。
- `effectiveType`、`downlink`、`downlinkMax`、`rtt`、`saveData`を読まず、速度test download、IP情報、UA sniff、`navigator.onLine`、network request結果からtypeを推測しない。
- `connection`または`type`がない環境と対象外値では未観測とする。custom selectorや自己申告による代替clearは作らない。LabsとしてChrome Android、Android WebView、Opera Android、ChromeOS等の実対応環境だけを公開候補にする。
- 読み取ったtype、変更列、観測時刻、推定network情報を保存・同期・送信しない。保存するのは通常のproblem解決IDだけとし、離脱・reset・abort時にchange listenerを解除する。
- 自動確認: 4対象値、対象外値、property欠損、初期表示非clear、changeだけの非clear、明示観測、重複観測、reset、listener cleanupをstubで検証する。人手確認: H-004, H-019, H-023, H-025, H-032。

## S-640 十二の文字コード（DR-114追加、初版実装済み）

- S-640-B01〜B12の12箱を一つのstageに置く。playerは文字コード名を回答しない。各問の文字コードを推理して得た復号後の文字列を、その問のtext fieldへ入力し、固定回答文字列とのexact code point一致で対応箱を開く。
- B01〜B04は2進byte列とし、順にISO-8859-2のポーランド語文字テスト句`Zażółć gęślą jaźń`、ISO-8859-5の`русский текст`、Shift_JISの`文字コード`、windows-1255の`קוד עברי`を扱う。B05〜B08は16進byte列とし、順にGBKの`简体编码`、Big5の`繁體編碼`、ISO-8859-7の`ελληνικό κείμενο`、windows-874の`ภาษาไทย งดงาม`を扱う。
- B09はUTF-8 → windows-1252で`café français` → `cafÃ© franÃ§ais`、B10はKOI8-R → windows-1251で`русский ящик` → `ТХУУЛЙК СЭЙЛ`、B11はKOI8-U → IBM866で`український код` → `╒╦╥┴з╬╙╪╦╔╩ ╦╧─`、B12はMacintosh → x-mac-cyrillicで`åbn æsken` → `Мbn Њsken`を扱う。文字化け問ではraw bytesと誤読表示を問題として示し、playerは復元した元文字列を入力する。
- 12回答はすべて異なる固定値とする。漢字文化圏の回答は3文字以上、空白で語を分ける文化圏の回答は2語とASCII spaceを基本とし、短い一文字回答や別問と同じ回答を禁止する。16 labelはfixture内部で各1回だけ使い、2進・16進は各1 label、文字化けは「本来 → 誤読」の順序付き2 labelとして全体解を1個に固定するが、label自体はplayer入力に使わない。
- legacy encodingのencoderをruntimeに実装しない。WHATWG Encoding Standardのindexから作った固定byte fixtureをsource of truthにし、build testと対応browserの`new TextDecoder(label, { fatal: true }).decode(bytes)`で本来表示と誤読表示を再現する。`TextEncoder`はUTF-8 fixtureの照合だけに使える。
- 2進表示は8 bitごと、16進表示は2 digitごとに視覚的な区切りを付け、先頭zeroを省略しない。DOM textとして選択・コピー可能にする。各問にkeyboard操作可能なtext fieldを置き、文字コードlabelを選ぶselectやtoken割当UIは置かない。回答判定でtrim、case fold、Unicode normalizationを行わず、fixtureのspaceを含むexact code point列だけを受け付ける。
- fixture生成testは、16 labelの使用回数、各表示のexact code point列、fatal decode、U+FFFD、C0 / C1制御文字、不可視文字、私用領域文字、Unicode normalizationだけの差、12問全体の完全解数を検査する。誤読表示が元表示と十分変化しないfixtureは失敗させる。
- 入力文字列、clipboard内容、file、network、locale、端末の既定encodingを読まない。未提出の割当は離脱・reset時に破棄し、保存するのは通常の解決済みproblem IDだけとする。
- 自動確認: B01〜B12の回答対応、12回答と12問題表示の非重複、CJK回答の長さ、2語回答のspace、label一回制約、全体一意性、誤答、部分正解、reset、再入場、keyboard入力、fixture code point列を検証する。人手確認: H-001, H-002, H-003, H-004, H-014, H-020, H-025, H-033。

## S-650 四つの許可（DR-121追加、初版実装済み）

- S-650-B01位置情報、B02通知、B03カメラ、B04マイクの4箱を一つのstageに置く。成功条件は対応する`PermissionStatus.state === "granted"`だけとし、API requestのresolve、promptの表示、hardware検出、自己申告では開かない。
- stage開始時に`navigator.permissions.query()`へ`geolocation`、`notifications`、`camera`、`microphone`を個別に渡す。初期stateが`granted`なら対応箱を開き、各PermissionStatusの`change`で`granted`へ変わった時も開く。site settingsから変更してpageへ戻る場合に備え、focus / `visibilitychange`復帰時も4 descriptorを再照会する。
- 各箱に別々の説明と「権限を要求」buttonを置き、page表示だけではpromptを出さない。B01は`getCurrentPosition()`を一度呼ぶが返った座標、accuracy、時刻をstate、log、進捗、analyticsへ渡さず破棄する。success / error後にPermissionStatusを再照会する。
- B02は`Notification.requestPermission()`だけを呼び、permission成立の確認目的でnotificationを生成・表示しない。既存S-090 / S-410 / S-420の通知問題は別stageとして維持する。
- B03は`getUserMedia({ video: true, audio: false })`、B04は`getUserMedia({ video: false, audio: true })`を別々に呼ぶ。resolveしたstreamは全trackを即時`stop()`し、video / audio element、Canvas、Web Audio、録画、解析へ接続しない。abortまたは離脱後に遅れてresolveしたstreamも同様に停止する。
- request完了後は保持中のPermissionStatusだけを信用せず、該当descriptorを再queryする。`prompt`、`denied`、query reject、unknown descriptor、`navigator.permissions`欠損では未観測にする。`Notification.permission`、getUserMedia成功、geolocation callback成功を代替clearへ使わない。
- pushは通知権限とDR-093、persistent-storageは却下済みDR-104、clipboard、sensor、MIDI、local-fonts、window-management等は対応差または他stageの中心操作と重なるため対象外にする。Permissions Policy、OS-level deny、hardwareなしはpermission stateと分け、他stageを自動clearしない。
- 一度開いた箱は権限を後からOFFにしても閉じない。保存するのは通常の解決済みproblem IDだけで、PermissionStatus、許可変更列、時刻、位置、device ID / label、映像、音声を保存・同期・送信しない。
- 離脱・reset・abort時にPermissionStatusの`change` listener、focus / visibility listener、pending callback参照を破棄し、保持中streamの全trackを停止する。再入場時は古いPermissionStatus objectを再利用せずqueryし直す。
- 自動確認: 4 descriptorの初期3状態、初期granted、change、focus再照会、query失敗、request結果だけの非clear、重複event、reset、遅延resolve、listener / track cleanupをstubで検証する。人手確認: H-004, H-006, H-007, H-019, H-023, H-025, H-034。

## S-660 四つの計算圧力（DR-023追加、初版実装済み）

- S-660-B01 `nominal`、B02 `fair`、B03 `serious`、B04 `critical`の4箱を一つのLabs stageに置き、通常の永続進捗で複数回の訪問をまたいで累積する。
- page表示だけではobserverを開始しない。playerが「CPU pressureを観測」buttonを明示的に押した後、`new PressureObserver(callback)`から`observe("cpu", { sampleInterval: 1000 })`を呼ぶ。初回を含む実`PressureRecord.state`ごとに対応箱だけを開き、同じstateの再観測、state順序、滞在時間を追加条件にしない。
- ゲーム自身はstateを変える目的のWorker、busy loop、大量task、人工benchmark、hidden Canvas、WebGPU workloadを生成しない。他tab、他app、OS、温度、energy usageが状態へ影響しても、その寄与を推測・表示・保存しない。4 stateを独自のCPU使用率や温度帯へ変換しない。
- `PressureObserver.knownSources`に`"cpu"`がなく、`observe()`が`NotAllowedError` / `NotSupportedError`で失敗する場合は未観測にする。Permissions Policy違反、Secure Context外、OS / hardware非対応を、timer、Performance API、`requestAnimationFrame`、Battery API、自己申告で代替clearしない。
- 観測中は停止buttonを常設する。停止、離脱、reset、abort、`visibilitychange`でhiddenになった時に`disconnect()`し、pending recordとcallback参照を破棄する。観測開始済みの訪問でvisibleへ戻った場合は、playerへ停止中であることを示し、再度の明示操作で新しいobserverを作る。
- PressureRecord.state、timestamp、状態列、変化回数、観測時間、端末情報をlocal stateの表示に必要な範囲を越えて保持せず、進捗、Drive、file export、analyticsへ保存・送信しない。永続化するのは通常の解決済みproblem IDだけとする。
- Compute Pressure Level 1の有効sourceは`"cpu"`だけである。`"gpu"`を渡さず、WebGPU timestamp query、`GPUQueue.onSubmittedWorkDone()`、frame間隔から4段階GPU pressureを自作しない。標準PressureSourceへGPUが追加された時点で別stageの採否を再検討する。
- 自動確認: 4 state、初期record、state変化、重複record、再訪累積、API欠損、known source欠損、observe reject、停止、hidden、reset、listener cleanup、非保存をstubまたはvirtual pressure sourceで検証する。人手確認: H-004, H-019, H-023, H-025, H-035。

## S-670 端末迷路（DR-120追加、初版実装済み）

- 一つのstageに一箱を置く。roundごとに決定的に生成した迷路をConsoleへASCII textとして描き、同じ出力内に現在座標、出口座標、移動可能方向を装飾なしのplain textでも示す。
- player入力はpage上の方向buttonとkeyboardだけで受ける。Console evaluatorへの文字入力、Console上のobject編集、DOM / CSS / scriptの編集を成功手順に含めない。
- `console.group()`等でround固有tagを付けて出力するが、`console.clear()`は呼ばない。pageに「端末を再表示」buttonを置き、同じroundの現在盤面を再出力できるようにする。
- 成功条件はpage側のround stateでplayer位置が出口へ到達したことだけとする。DevToolsやConsoleを開いたこと、出力を読んだこと、groupを展開したことは検出せず、開箱条件にしない。
- `%c`の色、等幅表示、罫線幅、groupの既定開閉状態など実装依存のprinter表現へ正解情報を預けない。色や位置が崩れてもplain textから解ける内容にする。
- Consoleにはround内の迷路情報だけを出し、token、個人情報、device情報、他stageの内部状態を含めない。reset、再入場、新roundでは古いConsole出力を消そうとせず、tagとround IDで区別する。
- 自動確認: 迷路生成の決定性、到達可能性、page入力、境界、再表示、reset、古いroundの非clearを検証する。人手確認: H-001, H-002, H-003, H-019, H-020, H-025, H-036。

## S-680 端末診断卓（D-135で不採用）

- Consoleをread-only表示面、pageを入力面として往復する中心体験がS-670端末迷路と重複するため、stage・問題箱を実装しない。
- `console.table()`は内部診断へ任意利用できるが、採用API、問題箱、clear条件には数えない。

## S-690 断片をたどる文書（DR-049追加、詳細保留）

- 一つのstageに一箱を置く枠組みを採用する。一つの長いdocument内に複数のText Fragment linkを置き、playerが同一page内を順にjumpしてbrowserが示した一節からhint片を集め、組み合わせた最終回答をpage上の入力欄へ提出する。
- 移動にはround用の実`<a href="...#:~:text=...">`とtrustedなlink activationを使う。scriptだけの`location`変更、`scrollIntoView()`、通常fragment ID、app独自highlight、find-in-pageを成功手順の代替にしない。
- fragment directiveとmatch rangeはauthor scriptから隠されるため、各jumpの成否、highlight、scroll量、viewport内への侵入を直接判定しない。`document.fragmentDirective`はfeature detectionだけに使い、箱は最終回答の完全一致で開く。
- 一節数、巡回順、hint片の形式、完全解、誤答時の扱い、URL文字列からの答え漏れ、総当たり耐性は未確定であり、実装前に一組のpuzzleとして再吟味する。この詳細が確定するまでstage実装へ着手しない。
- target textは各round内で一意にし、prefix / suffixを含むdirective syntaxと巡回graphの到達性をfixture testする。browser Backを妨げず、試行が作るhistory entry数を固定上限にする。
- long documentは通常のreading順を保ち、linkをkeyboardでactivateできるようにする。hintをUA highlightの色だけで区別せず、URLへtoken、個人情報、保存進捗を含めない。巡回順、scroll位置、誤答、閲覧時刻を保存・同期・送信しない。
- 非対応または実link activation後にtextが示されない環境は未観測とし、模擬scrollによる代替clearを作らない。詳細確定後、自動fixture testと人手確認H-038を具体化する。

## S-800 断片を組み立てる文書（D-136追加、詳細保留）

- 同一pageの長い英文と、画面上部にB01 / B02の二箱を置く。B01は対象語を直接読めないpercent-encoded `textStart`とpunctuation contextを示し、B02は対象語そのものを示す。page内にfragmentや単語の入力欄を置かず、playerがaddress barへ同一pageのfragment付きURLを貼る。
- `textStart`を空白、suffixを`.`とする指定は中間の任意単語を含むmatchにならないため使わない。B01 / B02とも対象語だけがUA highlightされるdirectiveをfixtureとして固定し、対象語は互いに異なり各block内で一意にする。
- 通常の可視Text Fragment matchはauthor scriptから範囲を取得できないため、対象語を`hidden="until-found"`に置き、実matchで発生する`beforematch`を対応箱の開放条件にする。対象語は成功時に英文へ出現してhighlightされる。通常anchor、独自highlight、scroll量、`IntersectionObserver`を代替clearにしない。
- find-in-pageでも`beforematch`が発生し得ることを既知の迂回として記録する。英文、対象語、fragment文字列、空欄が文として不自然にならない構成、誤match耐性は実装前に一組の問題として吟味し、POC-032とH-038で実browser差を確認する。

## S-700 遠くの映写箱（DR-075 / DR-016 / DR-076追加、未実装）

- 新規stageに3箱を置く。B01 / B02は共通してplayerの明示操作から`HTMLMediaElement.remote.prompt()`を呼び、`connect` eventまたは`remote.state === "connected"`を観測してから、current roundに割り当てたself-hosted動画区間を再生する。pickerの選択だけで解決する`prompt()`完了、`connecting`、通常local再生、PiPでは開かない。
- 動画は外部機器から取得できる有限個のsame-origin資産とし、roundごとに文字鍵区間とQR区間を選ぶ。Blob URL、MediaStream、送信先だけの別document、外部画面への任意UI送信を前提にしない。選択区間と鍵はround ID、slot、checksumで結び、古いroundや固定の汎用鍵を拒否する。
- B01は対象区間が`connected`中に実再生されたことをmedia eventと再生位置から確認した後、外部画面に見える短い文字鍵を手元pageへ入力させる。提出時にも接続中で、正規化した入力がcurrent roundの鍵と完全一致した時だけ開く。鍵を手元video、poster、accessibility copy、logへ表示しない。
- B02はDR-016 Barcode Detection APIの実装先とする。対象QR区間のremote再生後、別の明示buttonから`getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })`を開始し、手元のcamera previewを`BarcodeDetector({ formats: ["qr_code"] })`へ渡す。`BarcodeDetector.getSupportedFormats()`に`qr_code`があり、接続中で、検出した`rawValue`がcurrent round tokenと完全一致した時だけ開く。
- B02ではJS製QR decoder、画像upload、手入力、同じ手元pageへのQR表示、固定QR、過去round tokenを代替clearにしない。camera sourceが外部画面そのものかは証明できないため、接続中、対象区間再生済み、round token一致を合わせてgeneric QRだけでは開けない境界にする。
- B03はDR-076 Presentation APIの実装先とする。same-originの固定receiver URLから`PresentationRequest`を作り、playerの明示buttonによるtransient activation内で`start()`する。実connectionが`connected`になった後、controllerからcurrent roundの初期化messageを1回だけ送り、receiverが`connectionList`から接続を取得してround用画面の初期描画後に返す`ready`を受けた時点で開く。元案のmessage列パズルや追加入力は行わない。
- B03では通常の別window、画面ミラーリング、Remote Playback、PiP、local iframe、直接生成した模擬messageを代替clearにしない。`getAvailability()`の常時監視、`defaultRequest`、presentation ID保存、`reconnect()`を使わない。
- B01 / B02 / B03は対応条件を独立させる。Remote Playback、camera、Barcode Detectionの交差がない環境でもB03が成立する可能性があり、Presentation receiverを表示できない環境でもB01 / B02は変更せず遊べる。能力不足、picker取消、camera拒否、検出失敗、receiver読込失敗は該当箱だけを未観測にする。
- 停止、開箱、reset、離脱、abort時にmediaをpauseし、sourceをresetし、availability watcherとevent listenerを解除する。必要なら`disableRemotePlayback`を有効にして接続を切り、全camera trackを`stop()`し、preview、canvas、ImageBitmap、検出loopを破棄する。B03で所有するPresentation connectionは`terminate()`し、receiver contextとmemory上のroundを終了する。
- device名、availability履歴、接続先、connection ID、ready message、video frame、decoded値、camera画像、入力鍵、観測時刻を保存・同期・送信しない。永続化するのは通常の解決済みproblem IDだけとする。
- 自動確認: B01 / B02のprompt、state列、区間gate、鍵とround token、supported format、重複検出に加え、B03の明示`start()`、connected前の拒否、round付きready、別round、模擬message、close / terminate、cleanupをstubとfixtureで検証する。人手確認: H-003, H-004, H-006, H-019, H-020, H-023, H-025, H-040, H-041。

## S-710 合言葉変換所（DR-077追加、初版実装済み）

> 現環境の初版は、設計時のInsertable Streams案ではなく、製品依存に追加済みのMediaBunny変換を使う。B02の固定1-frame出力assetは次のmedia生成波で置き換えるまでruntime fallbackとし、B03のQR detectorはBarcode Detection APIが存在する場合だけ試行する。

- 上部に4箱、左にvideo file選択とvideo-only webcam録画、右に変換後videoの自由再生・frame step / slow playback・download、下に共通合言葉入力を置く。webcamとfileは先頭10秒、640×360、15fpsを基準とし、入力size、出力size、出力 / 入力比を表示する。`videoBitsPerSecond`は初期候補384kbpsの固定hintとし、圧縮率を保証しない。
- fileはdecoded media elementの`captureStream()`、cameraは明示操作からの`getUserMedia()`を使う。DedicatedWorker内で`MediaStreamTrackProcessor`から`VideoFrame`を読み、`VideoTrackGenerator`へ書く。previewとMediaRecorder WebMを同じ変換trackから得る。非対応環境にCanvas / CSSだけの代替clearを作らない。
- B01はfull-resolution frameを走査し、alphaを無視した全pixelのR / G / Bが各`0x00`〜`0x10`の場合だけ、その1 output frameを白文字`DARK FRAME`の全面表示へ置換する。B02はdecode不能入力の別error経路で、Git管理済み短尺動画の1 frameへ`BROKEN INPUT`を表示する。壊れた動画以外のfileでも発火してよい。
- B03はbundled QR libraryでdownscaled sampleを読み、検出sampleに対応する1 output frameだけを`BUSYBOX{qr_frame_became_the_message}`の全面QRへ置換する。B04は正常出力をremuxして固定SimpleTag `BUSYBOX_TRANSFORMER=S710_V1`を付け、同tagの動画を再入力すると全frameへ`SECOND PASS`をoverlayする。合言葉自体をtagへ入れない。
- B02 error動画、QR template、基準fixtureはsource、生成script、checksumとともに事前生成しGit管理する。player入力を変換した出力だけをruntime生成する。入力・frame・出力をupload、永続保存、Drive同期しない。
- 停止、完了、reset、離脱、abort時にreader / writerをcancel / closeし、全`VideoFrame`をcloseし、trackを`stop()`し、workerとrecorderを終了してobject URLをrevokeする。自動確認とH-042でpixel境界、1 frame対応、decode error、metadata、固定回答、size比、10秒上限、codec差、連続試行、cleanupを確認する。

## S-720 映像復元機（DR-077派生、初版実装済み）

> 現環境の初版はcanvas seekとGit管理fixtureで検証する。WebCodecsによるdemux / muxと実QR decoderは追加波で再評価し、現段階の成功条件は固定fixtureとの二値pixel一致である。

- 上部4箱のclickからGit管理済み短尺fixtureをdownloadし、T1 / T2 / T3の複数file入力laneへ順に通す。各laneは変換結果をpreview / downloadでき、bundled QR helperはdistinct payloadをcopy可能なtextへ出す。外部deviceと`BarcodeDetector`は必須にしない。
- 全fixtureは約360×360、12fps、2〜3秒、最大約36 frameとする。T1は左右半分交換、T2は白1・黒0へ二値化した全frameのpixel積、T3は1-based奇数frameで左半分、偶数frameで右半分だけを残す。T2はmask一枚へ累積し、各段のencode前に白黒へ再正規化する。
- B01はT1済みfixtureを再度T1へ通して`BUSYBOX{swap_both_halves_to_restore_the_frame}`を得る。B02は黒cellが順次点滅するfixtureをT2へ通して`BUSYBOX{multiply_every_frame_to_rebuild_the_qr}`を得る。
- B03 / B04の箱はbyte-identicalな混合fixtureをdownloadする。奇数frameは`[A左 | B右]`、偶数frameは`[B左 | A右]`とし、T3→T2で`BUSYBOX{odd_left_even_right_reveals_qr_a}`、T1→T3→T2→T1で`BUSYBOX{swap_select_multiply_swap_reveals_qr_b}`を得る。途中decoyの提出には「2つが混ざっているようだ」と返し、final payloadが所定経路前に読めるfixtureはrejectする。
- MediaRecorderによるframe dropは奇偶を壊すため使わず、WebCodecs decoder / encoderとdemux / mux libraryで入力1 frameごとの出力1 frameと明示timestampを保つ。queue上限を設け、一度に1変換だけ実行する。これはS-720内部実装で、DR-078の別パズルを統合した扱いにしない。
- fixture、元QR、期待復元画像はsource、生成script、codec条件、checksumとともに事前生成・Git管理する。runtimeでfixtureを作らない。全frame / 複数scale scan、期待経路、途中decode拒否、B03 / B04同一性、frame数、timestamp、固定flagを自動確認し、H-043でcodec対応、連続chain、負荷、frame / worker cleanup、非送信を確認する。

## S-730 XRの箱（DR-084追加、未実装）

- 画面上ではAR / VRの対応状況を`navigator.xr.isSessionSupported()`で案内し、利用可能なmodeをplayerが選ぶ。B01の成功条件はsupport probeではなく、user activationから開始した実`immersive-ar`または`immersive-vr`のXRSessionと、そのsessionのXRFrameから得た最初の非null XRViewerPoseとする。`inline` session、page上の開始buttonだけ、模擬poseでは開かない。
- B01後、`local` reference spaceの開始姿勢から約1〜1.5m先の見やすい位置へ、単純な3D箱を一つだけ描画する。B02は実XRInputSourceの`select` eventと`targetRaySpace` poseからrayを作り、そのrayが箱のboundsへ交差した時だけ開く。controller trigger、AR画面tap、機器が配送するgaze selectを等価に扱う。
- page click、keyboard、DOM overlay、PointerEvent、一般Gamepad event、箱を外したselect、直接method呼出しを代替clearにしない。AR / VRの片方だけに対応する環境でも同じ2箱を成立させ、対応機器がない環境では未観測にする。
- XR内で凝った謎を作らない。歩行、振り返り、床・壁・机の探索、現実marker、hit test、anchor、plane / mesh / depth sensing、raw camera、room mapping、marker trackingを要求せず、座位または静止状態で完了できる。開始前に周囲の安全確認を表示する。
- 固定の箱model、material、iconはsource、生成scriptまたは編集手順、checksumとともに事前生成・Git管理する。pose、座標、機器識別情報、操作履歴を保存・Drive同期・送信せず、通常の解決済みproblem IDだけを永続化する。
- solve、reset、離脱、abort時にXR animation frameを止め、session / select / input listenerを解除し、WebGL / XR layer resourceとreference space、pose、input source参照を破棄して`session.end()`する。`sessionend`からも同じcleanupを冪等に呼ぶ。自動testはWebXR Test APIまたはtest fakeでimmersive / inline、pose有無、ray hit / miss、取消、cleanupを確認し、H-044で実AR端末またはVR headsetの開始、選択、安全性、終了、非保存を確認する。

## S-740 留守番温室（DR-097追加、未実装）

- 攻略必須経路と全箱必須報酬から外した長期Labsに一箱だけを置く。Chromium系のinstalled PWAを独立appとして起動し、`navigator.permissions.query({ name: "periodic-background-sync" })`が`granted`で、`ServiceWorkerRegistration.periodicSync`が存在する環境だけを対象にする。通常tab、未install、permission非granted、API欠損では未観測とし、代替clearを作らない。
- 初期phaseでplayerが「種を植える」を押し、`periodicSync.register("busybox-s740-garden", { minInterval })`を行う。`minInterval`は正確な日次scheduleや短時間timerとして扱わず、実装時のPoCでresource policyに沿う長期値を決める。UIへ日付、countdown、完了予想、期限を出さない。
- 第一段階では「水を預ける」だけを受け付け、専用IndexedDBへreset generation、expected phase、care kind `water`、未消費状態を保存する。光careは発芽receiptが届くまで表示・受付せず、複数careの先積み、誤答、枯死、成長後退を作らない。
- Service Workerの実`periodicsync` handlerはtag一致後、`clients.matchAll({ type: "window", includeUncontrolled: true })`が0件で、current generation / phaseに一致する未消費careが一件ある時だけ処理する。foreground中のeventはcareを消費せず成長させない。通常timer、page load、日付変更、通常Background Sync、constructed / synthetic event、DevToolsのdebug発火をproduction成功経路にしない。
- water eventはGit管理済み発芽asset、light eventはGit管理済み開花assetをsame-originから取得し、専用Cache Storageへ保存する。各assetは通常のinstall precacheから外し、source、生成手順、checksum、version manifestとともに実装前に生成してGit管理する。取得前後にreset generationとphaseを再照合し、stale eventやreset後の遅延完了をcommitしない。
- waterのcommitではcareを一回だけconsumeし、event receiptとasset versionを保存してphaseを`sprout`へ進める。playerが再訪するとcache済み発芽assetを表示し、「光へ向ける」を預けられる。別のclient 0件periodicsyncがlightをconsumeしてphaseを`bloom`へ進め、次の再訪でB01を開いて固定flag `BUSYBOX{THE_GARDEN_GREW_WHILE_THE_APP_WAS_AWAY}`をcopy可能に表示する。
- 通知、notification action、Push、badgeを使わず、変化は再訪時に発見させる。二回のeventが別の実scheduler opportunityだったことをreceipt IDとphase CASで検証するが、wall-clock日付、event間隔、engagement score、network名を成功条件や表示へ使わない。
- care record、phase receipt、event時刻列、asset versionは端末localの専用store / cacheに置き、Drive同期、file export、analyticsへ含めない。最終B01の通常解決済みproblem IDだけは共通進捗へ保存できる。same-origin固定asset以外を取得せず、player入力や端末・network情報を送信しない。
- 開花commit後に`periodicSync.unregister("busybox-s740-garden")`し、不要なcare recordを削除する。resetはtagをunregisterし、generationを更新して専用care、receipt、cacheを削除する。site data削除による自然resetを許容し、別端末や再installから途中phaseを復元しない。
- 自動確認はfake eventでphase CAS、client有無、care一回消費、二段階順序、asset failure、stale generation、reset、unregister、非同期競合、非同期storage / export分離を検証する。fake / DevTools eventはreal scheduler受入証跡に数えず、H-045でinstalled PWAの実periodicsync二回、長期非発火、browser / OS lifecycle、cleanupを確認する。

## S-750 届いた封書（DR-126追加、未実装）

- 攻略必須経路と全箱必須報酬から外したLabsに一箱を置く。clear条件を「current OTPがbrowser所有のOTP専用入力経路から入ること」とし、WebOTP credential経路とSecurity Code AutoFill経路を同じB01のOR条件にする。どちらも成立しない環境では未観測とし、manual inputだけのfallbackを作らない。
- 初期画面には対応条件、別のSMS送信端末または協力者が必要なこと、SMS料金が発生し得ること、carrier / OS / 送信者が公開hostを含む本文を扱うことを表示する。gameは電話番号入力を求めず、SMSを送信しない。
- playerが明示的に「SMSを待つ」を押した時、`crypto.getRandomValues()`からcurrent generation用の6桁数字codeをmemory上に生成する。`OTPCredential`がある環境ではAbortSignal付きの`navigator.credentials.get({ otp: { transport: ["sms"] } })`を直ちに開始し、同時に空の`<input autocomplete="one-time-code" inputmode="numeric">`を受信欄として有効にする。その後で、説明行と空行、`@${location.hostname} #${code}`の最終行を持つcopy可能なSMS文面を表示する。scheme、port、pathを最終行へ含めない。
- playerはその文面を別の携帯電話または協力者へ渡し、play端末へSMSとして送ってもらう。WebOTP対応browserではnative確認UIを許可して実credentialを受け、Safari等ではkeyboard / OSのSecurity Code AutoFillを使ってOTP専用欄へ入れる。browser prompt、Verify、AutoFill候補、SMS app自体をpageから模倣しない。
- WebOTP経路はfulfillment pathから返ったcredentialの`type === "otp"`、`code === currentRoundCode`、current generation、B01未解決を同時に要求する。promise解決だけ、prompt表示だけ、wrong / stale codeでは開かない。
- AutoFill経路は受信欄がround開始時に空で、過去の値変更がなく、一度のtrusted `input`で空文字列から6桁全体へ変化し、current codeと一致し、次のanimation frameでも`element.matches(":autofill")`またはlegacy alias `element.matches(":-webkit-autofill")`がtrueであることを要求する。user agentが自動入力し、その後playerが編集していないことを正のbrowser stateとして使う。
- `beforeinput`、`input`、`paste`、`drop`、`compositionstart` / `compositionend`をround中だけ監視する。AutoFill確定前に`insertText`、`insertFromPaste`、`insertFromDrop`、`insertCompositionText`、削除、途中値が観測された場合はそのroundのAutoFill経路をtaintする。`insertReplacementText`はautocorrectや通常候補も含むため、それだけでは認めず、trustedな一括full-code changeと実`:autofill`を追加で要求する。単なるkeydown不在、timing、CSS色、focus、`isTrusted`だけでは開かない。
- programmatic `.value`設定、synthetic event、manual type、paste、drop、IME、音声入力、通常文字候補、SMS受信の自己申告、query、URL fragment、postMessage、DevTools virtual SMSを代替clearにしない。`:autofill`はSMS出所を証明しないため、OS / browserの別のOTP専用AutoFillがcurrent codeを入れた場合も、B01の「何らかのOTP専用の方法で自動入力した」という条件に含める。
- 一つのroundは短い明示timeoutを持ち、cancel、timeout、reset、離脱、route変更でAbortControllerをabortし全input listenerを解除する。再試行時はgenerationとcodeを更新し、受信欄を新しい空elementへ置き換え、古いpromiseのlate fulfillment、stale SMS、二重fulfillment、以前のautofill stateを拒否する。page hiddenだけで直ちに失敗扱いにはしない。
- Safari / WebKit実機でSecurity Code AutoFill後に`:autofill`または`:-webkit-autofill`をscriptから観測できることをPoC gateにする。pseudo-classの反映timingはtrusted input後のmicrotaskと最大2 animation frameだけ確認する。観測できない環境ではinput event列だけの推測へ落とさず、AutoFill経路を未観測にする。
- phone number、SMS本文、送信者、credential、round code、到着時刻、取消理由、入力履歴を永続化、Drive同期、file export、analytics、network送信しない。通常の解決済みproblem IDだけを保存し、開箱またはcleanup時にcredential参照、受信欄の値、画面上のSMS文面を破棄する。
- B01開箱後はcopy可能な固定flag `BUSYBOX{THE_ORIGIN_BOUND_SMS_REACHED_THE_BROWSER}`を表示する。SMS codeはcurrent request照合専用で、flagや恒久回答へ流用しない。
- 自動確認はfake credential / autofill providerでpending前後、current / wrong / stale code、type mismatch、reject、`:autofill`有無、一括full-code change、manual type、paste、drop、composition、音声入力、programmatic value、edit-after-fill、abort、timeout、late result、二重fulfillment、reset、feature欠損、非保存を検証する。H-046では別送信者からの実SMS、Android ChromeのWebOTP、iOS SafariのSecurity Code AutoFillと実pseudo-class、可能ならdesktop連携、料金・privacy説明、cleanupを確認し、DevTools virtual SMSを公開受入証跡に数えない。

## S-760 架空の名刺（DR-017追加、未実装）

- 攻略必須経路と全箱必須報酬から外したLabsにB01 / B02を置く。`navigator.contacts`、`ContactsManager`、`getProperties()`、secure top-level contextをfeature detectionし、必要な`name` / `email` / `tel` / `address` / `icon`が一つでも利用不能なら未観測とする。iframe、game製picker、manual formの提出、fixture object注入を代替clearにしない。
- stageには架空contactの固定name、email、tel、構造化address、iconを名刺として表示する。各textはcopy可能にし、iconはdownload可能にする。playerがOSの連絡先appへ全項目を追加すること、Google / iCloud等のaccountへ同期され得ること、終了後に削除できることを開始前に説明する。実在人物のcontactを作成・編集・選択するよう求めない。
- iconは連絡先appによるcrop、resize、再圧縮後も識別できる単純なmarkerにし、source、生成script、基準decode、checksumを実装前にGit管理する。runtimeで正解iconを生成せず、Contact Picker API以外のBarcode Detection等をclear条件へ混ぜない。
- B01は明示buttonのtrusted activationから`navigator.contacts.select(["name", "email", "tel", "address", "icon"], { multiple: false })`を一回呼ぶ。promiseが返したcontactがちょうど1件で、5propertyすべてに期待値がある場合だけ開く。picker表示、promise開始、選択件数だけでは開かない。
- `name`はUnicode normalization、連続空白、前後空白を、`email`は前後空白とASCII caseを、`tel`は空白、括弧、hyphen等の表示記号を正規化する。`address`は表示文字列化せずcountry、postalCode、region、city、addressLine等の指定fieldを照合する。各propertyは配列順を固定せず期待値を含むかで判定し、iconはraw Blob hashではなくdecode、共通sizeへの縮小、色・形状の許容差で比較する。
- B02はB01が解決済みの同一sessionでだけ有効にし、同じ5propertyを要求する実pickerを再度開く。返却contactがちょうど1件で、5propertyがすべて空配列または欠損なら開く。部分共有、0件、複数件、cancel、rejectでは開かない。
- Contact Pickerは共有拒否と元からのfield欠損を区別せず、全propertyが空ならcontact identityもpageから確認できない。B02のcopyとtelemetryは「B01と同じcontactを選んだ」「共有OFF操作を検出した」と主張せず、「1件を選択したがBusyboxへ何も渡さなかった」とだけ表現する。
- 全5propertyを非共有にしたまま選択確定できるnative UIをAndroid Chrome実機PoC gateにする。実装が一部propertyを必須共有にする、全OFFでDoneできない、空contactを返さない場合はB02を未観測にし、game製checkbox、空値のcontact作成、部分共有、event timingによる推定へfallbackしない。
- B01のContactInfoとicon Blobはmemory内の照合だけに使い、画面へ再表示せず、永続化、Drive同期、file export、analytics、network送信しない。object URL、ImageBitmap、decoded pixel buffer、pending promise、listenerは照合完了、取消、reset、離脱で解放する。保存するのは通常のB01 / B02解決済みproblem IDだけとする。
- B01は`BUSYBOX{THE_CARD_BECAME_A_CONTACT}`、B02は`BUSYBOX{ONE_CONTACT_SHARED_NOTHING}`のcopy可能な固定flagを表示する。名刺fixtureへround tokenを混ぜない。
- 自動確認はfake ContactsManagerでfeature欠損、activation前後、single / zero / multiple、全5property一致、各field mismatch、配列順、正規化、icon再圧縮、B01未解決時のB02、全空、欠損、部分共有、cancel、reject、late result、reset、離脱、非保存を検証する。H-047では実Android Chromeのnative picker、contact追加、5property返却、全property非共有、同期説明、削除案内、resource cleanupを確認する。

## S-770 身分証棚（DR-127追加、未実装）

- 攻略必須経路と全箱必須報酬から外したLabsに、採用providerごとの独立箱を並べる。実装着手時に公式資料を再調査し、(1) service自身が公式FedCM endpointまたはSDKを提供、(2) 一般の第三者siteがRP / client登録可能、(3) provider自身または信頼できるmanaged IdPが運用、(4) callbackからFedCM経路をfallback loginと肯定的に区別可能、(5) Busybox独自backend、Cloud Functions、serverless function、identity database不要、をすべて満たすserviceだけをprovider registryへ採る。
- provider registryには調査日、公式資料、config URLまたは公式SDK、client登録手順、利用規約、要求scope / field、FedCM証拠、解除方法、PoC結果を記録する。有名なOAuth / OIDC providerであることだけでは採らず、X等への通常OAuthをbroker serviceのFedCM内に隠しただけの経路も、そのservice自身のFedCM箱として数えない。
- 各箱はpage loadで自動promptせず、provider名を示した「身分証を提示」操作から単一providerのactive attemptを開始する。provider公式SDKがFedCM専用resultを返す場合はその証拠を使い、標準APIを公式に案内するproviderでは実`navigator.credentials.get({ identity: { providers: [{ configURL, clientId }] }, mediation: "required" })`が返す`IdentityCredential`と期待`configURL`を使う。複数IdPを一つのpassive chooserへまとめず、一箱と一providerを対応させる。
- Google箱は現計画の下限B01とする。Drive保存と共有しない専用Google Cloud project / OAuth Web client、公開JavaScript origin、branding、privacy policyを用意し、Google公式hostのGISを`auto_select: false`で使う。current attemptで非空`credential`と厳密な`select_by === "fedcm"`が返った場合だけ開き、`fedcm_auto`、`auto`、`user`、`btn`その他のlegacy / button / automatic経路では開かない。
- 追加providerは公式client登録と実account PoCを完了してから固定problem IDを割り当てる。FedCM操作の成立時に対応箱だけを開き、provider別の完了messageや固定flagを後置しない。追加数はPoC完了時に正式計画値へ加算する。
- tokenの署名検証、payload decode、account ID / email / name / picture照合を行わず、特定account、本人性、勢力、既存login状態を成功条件にしない。このstageが証明するのは「browserが公式managed IdPを仲介し、playerが該当providerのFedCM UIで手動提示した」操作だけである。実認証やauthorization code exchangeがserver-side処理を要求するproviderは採らない。
- 開始前に必要account、online接続、providerとbrowserが扱う情報、pageへtokenが一時的に返ることをprovider別に説明する。result判定後にtokenとaccount propertyを破棄し、DOM、console、error report、local / session storage、IndexedDB、Drive同期、file export、analytics、Busybox backend、任意の第三者endpointへ渡さない。永続化するのはproviderに対応する通常の解決済みproblem IDだけとする。
- provider側connectionはBusybox resetで変更せず、完了後に公式account管理から解除できる方法をprovider別に案内する。auto revokeが他grantへ影響するproviderでは自動解除しない。cancel、prompt非表示、未login、network failure、reset、離脱、route変更でattempt generationを更新し、late / duplicate resultと一時token参照を破棄する。
- OAuth redirect、popup、通常Sign-In button、game製account chooser、mock credential、別stageのDrive tokenを代替clearにしない。provider accountを持たないplayerは該当箱を未観測のままにでき、箱数や報酬で複数serviceへの登録を促さない。
- 自動確認はprovider adapter共通contractでmanual FedCM、auto / legacy result、unexpected config URL、空token、duplicate / late callback、cancel、prompt非表示、network error、reset、離脱、非保存を検証する。Google adapterは`select_by`全値を追加確認する。H-049では採用providerごとにclient登録、実account、native FedCM UI、manual Continue、解除案内、token非保存を確認する。

## S-780 四つの財布（DR-129追加、未実装）

- 攻略必須経路と全箱必須報酬から外したLabsに4箱を並べる。Busyboxが管理する架空payment method manifest、payment app manifest、架空handlerのService Workerだけを使い、実payment providerをsupported methodへ混ぜない。
- B01は複数の架空handler候補から正しいhandlerを選び、current attemptと対応するhandler Service Workerがtrusted `PaymentRequestEvent`を受けた時点で開く。page側のclick、game製picker、登録済み判定、`canMakePayment()`だけでは開かない。
- B02はhandler windowで承認し、期待methodと固定schemaを満たす架空responseをmerchantが受けて`complete("success")`へ到達した時点で開く。
- B03はhandler windowで意図的拒否を選び、固定の拒否responseをmerchantが検証して`complete("fail")`へ到達した時点で開く。handler例外、handler不在、browser cancel、`AbortError`、`OperationError`は拒否成功にしない。
- B04は同じhandlerの最初のresponseへmerchantが`retry()`を行い、再提示された同じhandlerで正しい架空instrumentを選び、二度目のresponseを成功完了した時点で開く。別handler、最初から正しいresponse、game製retry UIでは開かない。
- 各条件が成立した瞬間に対応箱だけを開く。取引結果label、完了message、固定flagを表示しない。handler window内は承認、拒否、instrument選択に必要な非言語UIだけにし、任意のWeb UIを作れることを利用した別パズルを埋め込まない。
- payer name / email / phone、billing / shipping address、card、実payment credential、実通貨を要求しない。架空response detailsとcurrent attemptはmemory内の判定後に破棄し、永続化するのは通常のB01〜B04解決済みproblem IDだけとする。
- cancel、error、非対応、登録失敗、JIT install UI非表示は未観測にする。resetと離脱ではpending requestを可能な範囲でabortし、handler window、message channel、listener、一時response参照を解放する。Service Worker登録の保持・解除は他のBusybox worker scopeと衝突しない専用cleanup設計にする。
- 自動確認はfake merchant / handler adapterでwrong handler、untrusted / stale event、approve、deliberate decline、exception、cancel、first-pass success、retry two-pass success、handler switch、late / duplicate response、reset、離脱、非保存を検証する。H-050で公開browserの候補UI、trusted event、handler window、`complete("success")` / `complete("fail")`、同一handler `retry()`を実動作確認する。

## S-790 活字の鍵（DR-137追加、未実装）

- 攻略必須経路と全箱必須報酬から外したdesktop LabsにB01を置く。`window.queryLocalFonts`、`FontData.blob()`、`FontFace`、`crypto.subtle.digest()`、secure top-level contextをfeature detectionし、一つでも欠ける環境は未観測とする。非対応browserへfile upload、drag-and-drop、webfont、`@font-face local()`だけのfallback clearを作らない。
- 実装前にBusybox専用OpenType fontを生成し、font binary、編集可能な生成source、生成script、license、再生成手順、PostScript名、期待table metadata、SHA-256をGit管理する。第三者commercial fontやplayerの既存fontへ依存せず、専用glyph以外を最小限にした正常なfontとする。
- stageの閉じた箱から専用fontをdownloadできるようにする。playerがOS標準のfont preview / install UIでuser scopeへinstallし、stageへ戻って走査する流れを図形で示す。OS変更とpermissionの説明、対応環境、完了後のuninstall方法は文字でも省略しない。
- B01の走査は明示buttonのtrusted activationから一度だけ`queryLocalFonts({ postscriptNames: [expectedPostScriptName] })`を呼ぶ。全fontを列挙せず、返却0件、複数face、unexpected name / family / style、reject、permissionだけでは開かない。
- 返却された1件の実`FontData.blob()`をArrayBuffer化し、期待するOpenType header / name / glyph tableとchecksumを検証する。公開対象OSがinstall時にfont全体のbytesを合法的に書き換える場合だけ、PoCで不変と確認した固定tableのchecksumへ検証範囲を狭める。PostScript名だけ、font metricsだけ、描画幅heuristicでは合格させない。
- 検証済みBlobからobject URLまたはArrayBuffer sourceの`FontFace`を作り、専用private-use glyphを箱へ表示できた時点でB01を直接開く。download、installの自己申告、page bundled copyの描画、CSS `local()` match、任意font選択、mock result、DevToolsによるpermission変更だけでは開かない。固定flag、完了message、font名一覧を後置しない。
- raw font bytes、font metadata、permission state、scan時刻、OS情報を表示、console出力、local / session storage、IndexedDB、Drive同期、file export、analytics、network送信しない。永続化するのは通常のB01解決済みproblem IDだけとする。
- 照合完了、reject、reset、離脱でArrayBuffer、Blob、object URL、FontFace、pending promise参照を破棄し、追加したFontFaceを`document.fonts`から外す。BusyboxはOSへinstallしたfontやpersistしたsite permissionを自動削除できないため、完了後にOS別uninstallとsite informationからの`local-fonts` permission解除を案内する。
- 自動確認はfake font providerでfeature欠損、activation有無、0 / 1 / multiple、期待名、同名別data、metadata mismatch、checksum mismatch、blob reject、FontFace load reject、late result、duplicate scan、reset、離脱、非保存を検証する。H-051で対象desktop ChromiumとOSの実download、user install、permission prompt / persistence、限定照会、raw Blob、glyph表示、browser再起動、uninstall後、permission revokeを確認する。
