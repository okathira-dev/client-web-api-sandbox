# 権限・実機ステージ実装メモ

## 共通原則

権限プロンプトはページ表示時や一覧表示時には出さず、各ステージの説明可能なボタン操作からだけ開始する。拒否、機器なし、実行時失敗は箱の未解決として扱い、アプリ全体のエラーにしない。

ステージを戻る、別画面へ移る、再読込する場合は共通AbortSignalと各ステージのcleanupでイベント、タイマー、Animation Frame、MediaStreamTrack、AudioContextを破棄する。

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

## S-230〜S-250 ブラウザ・OS境界

- S-230: canvasから生成した短命なMediaStreamをvideoへ渡し、実際の `enterpictureinpicture` eventで判定する。離脱時は描画timer、track、PiPを終了する。
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

- sourceはinstalled PWA windowでだけ有効にし、通常browserで開いた同一roundのreceiver pageを別top-level contextとして用意する。共通PWA導線からinstallとsource起動方法へ到達できるようにする。
- sourceはround ID、乱数nonce、checksumを埋めた小さなPNG Blob / Fileをplayerがdragを始める前にmemory生成する。画像表面は同じpayloadを文字として露出しない。
- draggable stickerの同期`dragstart` handler内でだけ`event.dataTransfer.items.add(file)`を呼び、drag imageをstickerへ設定する。非同期`toBlob()`をdragstart後に開始しない。
- receiverの実`drop` eventで`DataTransfer.items`からkind `file`、MIME `image/png`の項目を取得し、size上限内のbytesをlocal decodeする。embedded round ID、nonce、checksumが現在のarmed roundと一致した時だけS-510-B01を開く。
- `text/plain` / custom stringだけのdrop、同一page内drop、file input、clipboard paste、download後のupload、OSの「開く」、programmatic DragEventでは開かない。
- PNG、payload、drag履歴をstorageやDriveへ保存せず、serverへ送信しない。round終了時にBlob / File参照とreceiver recordを破棄する。
- desktop Chrome、Edge、Firefox、Safariで、script生成Fileがinstalled PWA windowからbrowser windowのdropまで保持されるかPoCする。不成立環境へ別clear routeを追加しない。
- 人手確認: H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025。PWA / browser境界、window配置、取消、別画像、oversize、同一page非clear、keyboard説明、cleanupを確認する。

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

- microphone iconの明示buttonからだけ、`SpeechRecognition`またはvendor prefix付き同interfaceの1回認識を開始する。`lang = "en-US"`、`continuous = false`、`interimResults = false`とする。
- `result` eventのfinal alternativesだけを調べる。transcriptをNFKC、英小文字へ変換し、Unicodeの空白と句読点を除いた結果が正確に`busybox`ならB01を開く。interim result、page内text input、録音file、独自ASRは成功根拠にしない。
- target文字列をstage本文へ直接表示せず、S-490で覚えた語とmind mapのclue edgeを手掛かりにする。音声なしで答えを説明するaccessibility textは置かないが、buttonの役割とlistening状態は視覚・読み上げの両方で示す。
- 開始前に、アプリは音声とtranscriptを保存しないこと、browserの認識実装が外部serviceへ音声を送る可能性があることを説明する。`processLocally`、`available()`、`install()`は実験的な別機能として台帳に残すが、この箱の成功条件や代替routeにはしない。
- final result、`end`、`error`、stage離脱でrecognitionをstop / abortし、取得したmicrophone trackがある実装ではtrackもstopする。transcript、confidence、alternatives、音声は進捗やDriveへ保存しない。
- 人手確認: H-006, H-007, H-019, H-020, H-023, H-025, H-027。対応環境、permission、取消、no-speech、network、言語差、候補列、cleanupを確認する。

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

## S-260 / S-270 画面・GPU

- S-260: 明示操作から `EyeDropper.open()` を呼び、ブラウザが返した `sRGBHex` がステージ上の指定色と完全一致した場合だけ判定する。取消は未クリアとする。
- S-270: 4096個のu32候補をcompute shaderで64 workgroupへ分配し、GPU bufferからreadbackした正しいindexだけで判定する。CPUでの代替成功は用意しない。
- cleanup: GPU bufferはfinallyでdestroyし、GPU adapter情報や採取した画面内容は保存しない。
- 人手確認: H-006, H-019, H-023。色管理差、EyeDropper取消、adapterなし、device lost、GPU実行エラーを確認する。

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

## S-430 外側の停止（仮）

- B01はuser activationからcontrolsなしのclient生成loop audioを再生し、実playing中にMedia Sessionの`pause` action handlerが呼ばれてaudioを停止した場合だけ開く。
- native `<video controls>`、audioの通常`pause` event、page内停止button、visibility、autoplay失敗、cleanupは判定に使わない。page内停止buttonは安全な明示cleanupとして残す。
- Control Center、lock screen、browser media UI、keyboard / headsetのmedia control、system interruptionはAPIからsourceを区別できないため、すべてexternal pause actionとして扱う。
- `navigator.mediaSession`とpause handler登録に加え、実際にOS / browser media surfaceへsessionが現れる環境だけを対象とする。page内pauseによる代替clearは用意しない。
- reset / 離脱時はaudioを停止し、全action handlerを`null`へ戻し、metadata / playbackState / generated Blob URLをcleanupする。音源・action履歴は保存・送信しない。
- 人手確認: H-003, H-004, H-019, H-020, H-022, H-023, H-025。各external control、background playback、system interruption、page内停止の非clear、handler解除、再挑戦を確認する。

閾値やコピーは実機ゲートの結果で調整できるが、生入力を保存しない境界とユーザージェスチャー内の権限要求は変更しない。
