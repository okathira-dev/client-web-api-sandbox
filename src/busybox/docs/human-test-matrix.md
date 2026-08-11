# 人手確認台帳

ブラウザ権限、実機センサー、PWA、OAuth、外部機器は、自動テストやAPI存在判定だけでは保証できない。この台帳は「後で誰かが見る」項目ではなく、該当ステージを完成扱いにするための必須証跡を管理する。

## 判定

| 判定 | 意味 |
| --- | --- |
| 必須 | 初期リリースまたは該当ステージ公開前に合格が必要 |
| 条件付き必須 | 対象環境向けステージを公開する場合に合格が必要 |
| 探索 | 対応可否やUXを知るための調査。未合格でも全体を止めない |

## 証跡

確認結果には、可能な範囲で次を残す。

- 実施日
- ブラウザ名とバージョン
- OSと端末種別
- 通常タブまたはPWA
- 許可、拒否、キャンセルなどの分岐
- 実施したステージまたはギミックID
- 期待結果と実結果
- コンソールエラー
- 必要ならスクリーンショットまたは短い録画
- 再現手順と既知の制約

正確な個人端末識別情報や、権限で取得した生データを証跡へ含めない。

## 環境カバレッジ

| 環境 | 初期版 | 用途 |
| --- | --- | --- |
| Windows + Chrome Stable | 必須 | 主開発・Baseline寄り・Chromium固有機能 |
| Windows + Firefox Stable | 必須 | Baseline差、履歴、保存、権限差 |
| macOS + Safari Stable | 条件付き必須 | Safari固有差とデスクトップWebKit |
| iPhone / iPad + Safari | 条件付き必須 | タッチ、センサー、PWA、モバイル権限 |
| Android + Chrome Stable | 条件付き必須 | センサー、PWA、共有、外部機器系 |
| インストール済みPWA | 必須 | 表示モード、更新、オフライン、PWA限定機能 |
| 2台の異なる端末 | 必須 | Google Drive引き継ぎと競合統合 |
| Experimental対応環境 | ステージごと | Experimentalステージの公開判断 |
| ペン入力対応端末 | ステージごと | Pointer Eventsのmouse、touch、pen識別 |

初期版で用意できない環境は、該当ステージを未検証として明示し、推測だけで対応済みにしない。

## 確認ケース一覧

| ID | 対象 | 確認内容 | 対応ギミック候補 | 判定 |
| --- | --- | --- | --- | --- |
| H-001 | Windows Chrome | 初回起動、再読込、ローカル保存、基本ステージ、戻る進む | G-001, G-002, G-005, G-006, G-008, G-014, G-019, G-047, G-048, G-049 | 必須 |
| H-002 | Windows Firefox | Baseline寄りステージが同じ意味で成立し、非対応機能が安全に沈黙する | G-002, G-005, G-006, G-008, G-019, G-047, G-048, G-049 | 必須 |
| H-003 | macOS / iOS Safari | 選択、履歴、保存、画面サイズ、権限のSafari差を確認する | G-002, G-003, G-005, G-006, G-008, G-019, G-041, G-046, G-047, G-048, G-049 | 条件付き必須 |
| H-004 | Android Chrome | タッチ、共有、センサー、モバイルPWAの挙動を確認する | G-004, G-006, G-009, G-021, G-041, G-046, G-047, G-048 | 条件付き必須 |
| H-005 | PWA | インストール、ホーム画面起動、オフライン起動、更新、削除を確認する | G-015, G-016, G-027, G-029, G-039, G-040, G-042, G-043, G-044, G-049 | 必須 |
| H-006 | 権限分岐 | 許可、拒否、閉じる、再試行、設定で取消した後を確認する | G-006, G-010, G-011, G-012, G-023, G-025, G-026, G-029, G-039, G-040, G-042, G-043, G-048 | 必須 |
| H-007 | メディア解放 | カメラ、マイク、画面共有を離脱・再開し、インジケーターとストリームが残らない | G-010, G-011, G-012 | 必須 |
| H-008 | 端末姿勢 | iOSとAndroidで許可、回転ロック、縦横、静止判定を確認する | G-009 | 条件付き必須 |
| H-009 | Gamepad | 未接続、接続、切断、複数パッド、標準外マッピングを確認する | G-013 | 条件付き必須 |
| H-010 | Bluetooth | 対応OSとブラウザで選択、キャンセル、範囲外、切断、再接続を確認する | G-025 | 条件付き必須 |
| H-011 | HID / USB / MIDI | 対応機器で許可、データ受信、抜去、再接続、別機器選択を確認する | G-026 | 条件付き必須 |
| H-012 | Screen Capture / PiP | 共有対象選択、キャンセル、共有停止、PiP終了、複数画面、別tabのmind map外縁marker探索、capture frame decode、直接URL非clearを確認する。PiPはS-350のnative playerにbrowserがcontrolを提示する環境で入場し、実`enterpictureinpicture`／`leavepictureinpicture`として観測できるか確認する。page製PiP要求は製品経路にしない | G-012, G-020 | 条件付き必須 |
| H-013 | 複数タブ・窓 | 2タブ、3タブ、片方の終了、同時更新、ロック待機を確認する | G-017, G-018, G-022, G-049 | 必須 |
| H-014 | Clipboard / File / Share | 権限、キャンセル、空データ、大きなファイル、共有先なしを確認する | G-006, G-007, G-021, G-042, G-048, G-049 | 必須 |
| H-015 | Drive単一端末 | 接続、初回作成、再同期、失効、キャンセル、破損バックアップからの回復 | G-030 | 必須 |
| H-016 | Drive複数端末 | 端末AとBで別ステージを進め、同期後に両方が残る | G-030 | 必須 |
| H-017 | Googleアカウント切替 | AからBへ切り替えると説明どおりgrow-only統合され、両方のクリアが残る。拒否・取消・失敗時はローカルを変更しない | G-030 | 必須 |
| H-018 | オフライン競合 | 2端末をオフラインで進め、時計をずらし、復帰後もクリアが消えない | G-014, G-030 | 必須 |
| H-019 | プライバシー | ネットワークと保存内容を調べ、生メディア・位置・機器識別子が送信されない | 全権限ステージ | 必須 |
| H-020 | 日英・アクセシビリティ | 言語切替、200%拡大、キーボード、読み上げラベル、音なしでの状態把握 | G-001, G-003, G-004, G-006, G-007, G-040, G-041, G-046, G-047, G-048, G-049 | 必須 |
| H-021 | GitHub Pages | サブパス、直接URL、再読込、manifest、Service Worker scope、HTTPSを確認する | G-015とアプリ全体 | 必須 |
| H-022 | ライフサイクル | 高速再読込、タブ休止、戻る進む、更新配信、古いキャッシュを確認する | G-015, G-018, G-022, G-031, G-039, G-040, G-041 | 必須 |
| H-023 | Experimental / Limited | 対象の公式対応環境で最小試作と本番配信の両方を確認する | G-016, G-020, G-023, G-025, G-026, G-027, G-028, G-031, G-039, G-040, G-041, G-042, G-043, G-044, G-046, G-049 | 条件付き必須 |
| H-024 | Pointer入力 | mouse、touch、penが別の`pointerType`として反応し、未所持入力を偽装して開けない | G-004 | 条件付き必須 |
| H-025 | 問題箱の再挑戦 | 全実装ステージへ入り直すと全問題箱が閉じ、初回だけリボン、過去クリアはリボンなし、条件の再達成後だけ開箱になる。問題箱は色と直下のヒント以外が同形・同寸法である | 全実装ステージ・問題箱 | 必須 |
| H-026 | Generic Sensor実機 | 対応端末でinterfaceとhardwareを分けて確認し、permission / policy、reading frequency、axes、visibility停止、sensor error、離脱stopを検証する | G-050, G-051, G-052, G-053, G-054, G-056 | 条件付き必須 |
| H-027 | Web Speech実機 | 対応browserでrecognition開始、final alternatives、`busy box`表記揺れ、permission拒否、no-speech、network / offlineを確認する。SpeechSynthesisはvoice準備、一文字ずつの発話、queue取消、start / end / error、`aspuwiq → busybox`、離脱cleanupを確認する | G-057 | 条件付き必須 |
| H-028 | Geolocation距離・復帰 | outdoor実機でanchor精度、5m・25m・100m、静止drift、screen sleep / wake、page freeze / discard / reload、sessionStorage復元、24時間expiry、reset / 完了削除、外部通信なしを確認する | G-058 | 条件付き必須 |
| H-029 | Geolocation高度帯 | smartphone実機でaltitude / altitudeAccuracyの数値取得、100m・500m境界、連続reading、静止drift、別高度帯の累積、null、permission、hidden / 離脱cleanup、非保存を確認する | G-059 | 条件付き必須 |
| H-030 | Native media速度・track・表示mode | S-350のnative controlsで、速度menuから1倍速以外を選んだ時だけ`playbackRate` / `ratechange`でB04、native字幕label `Busybox`でB05、PiP入場でB06、同じvideoのfullscreen入場でB08が開くことを確認する。別elementのfullscreen、CSS拡大ではB08を開かない。対応browserのnative音声label `Busybox`、track change、非対応時未観測、cleanupも確認する。pageは速度変更、PiP、fullscreenをscript要求しない。VFR 24fps区間はH-053で別に確認する | G-020, G-033 | 条件付き必須 |
| H-032 | Network Information接続方式 | Chrome Android / ChromeOS等の対応環境でWi-Fi、cellular、ethernet、Bluetoothの実`connection.type`、明示観測、再訪累積、change表示、対象外値、property欠損、listener cleanupを確認する。速度測定、UA sniff、IP情報、network requestがないことも確認する | G-062 | 条件付き必須 |
| H-033 | Encoding API文字化け | 8問の誤表示、元encodingと表示encodingの復号順、3文字以上または2語の回答、8問共通欄、全回答の非重複、誤答、keyboard入力、再入場、resetを確認する。対応browserの`TextDecoder(..., { fatal: true })`で固定fixtureの意味検証結果と一致することも確認する | G-063 | 必須 |
| H-034 | Permissions API四権限 | 位置情報、通知、カメラ、マイクについて、初期prompt / granted / denied、native prompt、site settings変更中の`change`、focus復帰時再照会、descriptor非対応、OS拒否、Permissions Policy、reset、離脱cleanupを確認する。位置非保存、通知非送信、camera / microphone track即時停止、遅延stream停止も確認する | G-064 | 条件付き必須 |
| H-035 | Compute Pressure四状態 | 対応Chromium環境で`PressureObserver.knownSources`、CPU初期record、state変化、再訪累積、停止、非表示復帰、Permissions Policy拒否、非対応OS / hardware、disconnect cleanupを確認する。ゲームがworker、busy loop、benchmark等の負荷を生成せず、状態列・timestampを保存しないことも確認する。4状態の決定的な自動確認はvirtual pressure sourceまたはstubで行う | G-065 | 条件付き必須 |
| H-036 | Console端末迷路 | Chromium、Firefox、Safariのdesktop ConsoleでASCII盤面、現在位置、壁、出口、専用group、再表示、長いlog後の再出力、狭いDevTools幅、page側button / keyboard操作、reset、再入場を確認する。Console入力、page編集、色、文字幅、group展開を成功条件にしないことも確認する | G-066 | 条件付き必須 |
| H-037 | Console端末診断卓 | D-135でS-670 Console迷路との体験重複を理由に不採用としたため実施しない | G-067 | 対象外 |
| H-038 | Text Fragment巡回／組み立て | G-068では対応browserで同一pageの実Text Fragment link activation、対象一節へのscroll / highlight、複数回の巡回、Back、reload、keyboard操作、長文layout、非対応時の未観測を確認し、最終回答だけで開くことを確認する。G-079ではaddress barへB01 / B02のfragment URLを貼り、正しい`hidden=until-found`対象語だけの出現、UA highlight、`beforematch`による対応箱開放、誤fragment、find-in-page迂回、Back、reloadを確認する。両stageともscroll位置、IntersectionObserver、通常anchor、独自highlightを代替clearにしない。問題fixture確定までは実装開始しない | G-068, G-079 | 保留中 |
| H-039 | Audio Session interruption | 対応Safari / WebKit環境を中心に、生成loop音声のactive、外部audio focusによるinterrupted、active復帰、media elementの再生再開、別tab / app、system interruption、silent mode、background、headset、停止、typeのauto復元を確認する。通常pause、inactive、Media Session actionをB02へ流用せず、ゲーム自身がinterruptionを生成しないことも確認する | G-041 | 条件付き必須 |
| H-040 | Remote Playback / QR実機 | AirPlay等の対応送信端末と外部再生先でpicker取消、機器なし、`connecting`、`connected`、切断、再接続を確認する。B01は選ばれた動画区間の文字鍵が外部画面だけで読め、手元入力と一致することを確認する。B02はcamera許可、`BarcodeDetector`の`qr_code`対応、current roundのQR読取、古いround・別QRの拒否、track停止を確認する。通常local再生、PiP、接続前の再生、固定QR、手入力、JS decoderを代替clearにせず、映像frame・decoded値・機器名を保存しないことも確認する | G-069 | 条件付き必須 |
| H-041 | Presentation receiver実機 | 対応browserとpresentation displayで明示buttonからpickerを開き、receiver pageが外部画面へ表示され、実connectionの`connected`後にround付きreadyが戻ってB03だけが開くことを確認する。取消、機器なし、許可拒否、receiver読込失敗、別round、close、terminate、再入場を確認し、通常window、画面ミラーリング、Remote Playback、PiP、local iframe、模擬messageで開かないこと、終了後にreceiverとlistenerが残らないことも確認する | G-069 | 条件付き必須 |
| H-042 | iframe動画変換 | same-origin iframeのClipPressでfileと10秒webcamを入力し、暗黒境界、1 frameだけの文字 / QR置換、decode不能fileの事前生成error動画、低bitrate出力、実size比、download再生、SimpleTag再入力、全frame overlayを確認する。QRはnative `BarcodeDetector`の有無にかかわらずbundled jsQR経路で一致すること、session不一致・別windowのmessageで親の回答欄が有効にならないこと、録画拒否、reset、離脱、連続試行でtrack、frame、object URLが残らず、入力・出力が送信されないことも確認する | G-070 | 条件付き必須 |
| H-043 | 映像復元patch bay | 対応browserで左3動画、中央T1〜T3、右outputが固定表示され、out→任意inのBezier cableをmouse / touch / keyboardで接続できることを確認する。4正規routeだけで対応するGit管理済み360×360復元動画がoutputにloop再生され、QR flagの共通欄入力で該当箱だけが開くこと、B04のT1 cycle、誤route、重複cable、全解除、再接続、mobile横scroll、外部送信なしを確認する | G-071 | 必須 |
| H-044 | WebXR実機 | 対応AR端末またはVR headsetで、機器なし、AR / VR support probe、session picker取消、実immersive session開始、最初の非null viewer pose、controller / screen / gaze select、箱へのray hit / miss、sessionend、reset、離脱を確認する。inline session、page click、DOM overlay、PointerEvent、一般Gamepad、模擬poseでは開かず、歩行やroom scanなしで完了でき、pose・座標・機器情報が保存・送信されず、終了後にXR animation frame、listener、layer resourceが残らないことも確認する | G-072 | 条件付き必須 |
| H-045 | Periodic Background Sync長期実行 | Chromium系のinstalled PWAを独立appとして起動し、通常tab、未install、permission非granted、登録成功、active tag、水care、window client 0件の実scheduler eventによる発芽、再訪後の光care、別の実scheduler eventによる開花、開花後unregister、reset競合、site data削除、browser process終了、mobile OS停止を確認する。foreground event、通常timer、page load、日付変更、通知、通常Background Sync、synthetic event、DevTools debug発火では成長せず、debug発火を公開受入証跡へ使わないこと、care / phase / event時刻列がDrive・file export・外部送信へ混入しないことも確認する | G-073 | 条件付き必須・長期 |
| H-046 | browser所有OTP入力 | Android ChromeのWebOTPとiOS SafariのSecurity Code AutoFillで受信待機を開始し、別送信者からcurrent roundの`@host #code`文面を実SMSで送る。WebOTPはnative確認UI後の実credential、Safariは空のOTP専用欄への一括trusted input、current code一致、実`:autofill`状態で同じB01が開くことを確認する。manual type、paste、drop、composition、音声入力、通常文字候補、programmatic value、edit-after-fill、wrong / stale code、二重SMS、取消、timeout、reset、離脱、連絡先条件、desktop連携を確認する。Safariで`:autofill`を観測できなければevent列だけで合格させず、電話番号、code、本文、送信者、時刻、入力履歴が保存・同期・送信されないこと、料金とSMS privacy説明が開始前にあることも確認する | G-074 | 条件付き必須・実SMS |
| H-047 | Contact Picker架空名刺 | 対応Android Chromeで固定name / email / tel / address / iconを持つ架空contactをOSへ追加し、B01で実native pickerから1件を選んで全5property一致、各field mismatch、複数値、表示記号、住所field順、icon crop / resize / recompressを確認する。B02ではB01後に同じ5propertyを要求し、全propertyを非共有にしたまま1件を確定して全配列が空または欠損で開くことを確認する。0件、複数件、部分共有、取消、B01未解決、late result、reset、離脱、非対応browserでは開かず、全非共有をnative UIで確定できなければgame製UIへfallbackしない。登録前にOS account同期の可能性、完了後に架空contact削除を案内し、返却値とicon Blobが表示・保存・Drive同期・file export・analytics・network送信されないことも確認する | G-075 | 条件付き必須・Android実機 |
| H-048 | Beaconオフライン郵便 | 最初にonlineでBusybox scopeがService Workerに制御されsender / receiver / receipt assetがcache済みであること、未制御時の一度だけのreload案内、offlineかつserver停止中のnative broken receipt表示、明示投函で実`sendBeacon()`が呼ばれることを確認する。`false`では遷移・開箱せず、`true`ではfull-document navigationし、workerが専用POSTとcurrent attemptを検証して`respondWith()`中にIndexedDB receiptをcommitした後、receiverがlistener設置→store照会の順でflagを開くことを確認する。same-document navigation、通常`fetch({keepalive:true})`、単純再訪、foreground直接write、tab close / visibilityだけ、wrong / stale attemptでは開かず、reload、message/query race、reset、site data削除、Chrome / Firefox / Safariの対応差を確認する。payloadに個人情報がなく、receiptがDrive同期・file export・analytics・外部requestへ出ないことも確認する | G-014 | 必須 |
| H-049 | FedCM provider実連携 | 実装着手時に候補serviceの公式資料を再調査し、公式FedCM endpoint / SDK、一般向けRP登録、利用規約、managed運用、独自backend不要、FedCM専用resultの有無をprovider台帳へ記録する。採用providerごとに公開originとclientを登録し、実account、browser所有chooser、手動Continue、期待providerの肯定的FedCM証拠で対応箱だけが開くことを確認する。GoogleはDriveと別project / client、非空credential、`select_by === "fedcm"`を必須にする。auto / legacy result、OAuth redirect、popup、broker経由の通常SNS login、credential空、cancel、未login、非対応browser、network failure、late callback、reset、離脱では開かない。全providerでtokenとaccount属性をdecode、表示、log、保存、Drive同期、file export、analytics、Busybox backendや別endpointへ送らず、接続解除方法を案内する。Google 1箱を下限とし、追加箱はこの実登録・実account証跡後に計画数へ加える | G-076 | 条件付き必須・provider別実account / online |
| H-050 | Payment Handler架空決済 | 対応browserと公開HTTPS originで架空payment method / app manifest、複数handler、Service Worker登録、browser所有候補UI、handler windowを確認する。B01は正しいhandlerのtrusted `PaymentRequestEvent`受信時、B02は承認responseと`complete("success")`、B03は固定の意図的拒否responseと`complete("fail")`、B04は最初のresponse後の実`retry()`と同一handler二度目の成功で、各条件成立時に対応箱だけが開くことを確認する。wrong handler、page click、game製picker、`canMakePayment()`だけ、handler不在、cancel、`AbortError`、`OperationError`、例外、別handlerへの切替、最初からの成功、late / duplicate response、reset、離脱、非対応browserでは該当箱を開かない。取引結果label、完了message、固定flagがなくても箱の反応だけで成立し、payer / shipping情報、実payment method、credential、架空response detailsが表示・保存・同期・外部送信されないことも確認する | G-077 | 条件付き必須・対応browser / HTTPS |
| H-051 | Local Font Access実活字 | 公開対象desktop ChromiumとWindows / macOS等の対象OSで、Git管理済み専用OTFのdownload、OS標準preview、user-scope install、再走査、browser所有`local-fonts` prompt、permission persistence、対象PostScript名だけの実`queryLocalFonts()`、`FontData.blob()`のmetadata / checksum、専用glyph表示とB01開箱を確認する。未install、0 / multiple result、同名別font、permissionだけ、全font列挙、`@font-face local()`だけ、file upload、bundled webfont、mock、cancel、deny、late result、reset、離脱、browser再起動、uninstall後、permission revoke、非対応browserでは開かないことを確認する。返却font情報とraw bytesが表示・log・保存・Drive同期・file export・analytics・network送信されず、FontFace / object URLが解放され、OS別uninstallとsite permission解除案内が正しいことも確認する | G-078 | 条件付き必須・desktop Chromium / OS変更 |
| H-052 | Browser／OS media controls | Git管理するseek可能な短尺mediaを使い、browser native playerでseek、mute、実再生後pause、提示される場合のPiPを確認する。別のcontrolsなしmedia sessionではOS control surface、lock screen、media key、headset、browser media UIからのpause actionを確認し、通常のmedia element eventやpage内buttonではS-430-B01が開かないことを確認する。探索としてplay、seekbackward、seekforward、seekto、previoustrack、nexttrackの提示有無と受信action typeをOS／browser別に記録するが、sourceは推定せず、この探索だけで箱を追加しない | G-020, G-033, G-041 | 条件付き必須 |
| H-053 | native video resize sweep | S-810でスウィープ動画を生成し、native controlsで再生・シークして小さい正方形、大きい正方形、横長、縦長の実`videoWidth` / `videoHeight`を確認する。CSS変更だけ、生成前の操作、固定寸法の動画では開かず、reload・離脱でcallbackとobject URLが残らないことも確認する | G-080 | 必須・`resize`対応browser |

## 各ステージ公開前のチェック

- API対応情報の調査日が新しい
- 対応環境と未検証環境が記録されている
- 許可、拒否、キャンセルを確認した
- 必要な機器が途中で切断されても復帰できる
- ステージ離脱後にイベント、ストリーム、ロックが残らない
- ローカル進捗が再訪後も残る
- 同じギミックの既存ステージがない
- 日英の権限説明とエラー説明がある
- 生データが進捗やDriveへ混入しない
- 事前生成可能なmedia fixtureがsource・生成手順・codec / 寸法 / 内容などの意味検証とともにGit管理されている
- 非同期・非リアルタイム問題の合言葉が固定で、copy可能なら長いCTF形式、転記なら最大2語になっている
- 非対応環境でアプリ全体が壊れない
- 入場直後の過去クリア表示が、今回もクリア済みだと誤認させない

## リリース判定の運用

人手確認が未実施の環境を「おそらく動く」として合格にしない。

初期版全体の必須ケースに失敗があればリリースを止める。条件付き必須の失敗は、該当ステージだけを非公開または未検証扱いにできる。これにより、希少な外部機器やExperimental APIが、基礎ステージの公開を不必要に止めないようにする。
