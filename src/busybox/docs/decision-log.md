# 決定ログ

この文書は、確定事項、仮置き、未決事項を混同しないために使う。
後続の実装エージェントは、未決事項を既成事実としてコードへ固定しない。

## 確定している方針

| ID | 決定 | 理由 |
| --- | --- | --- |
| D-001 | タイトルは `Busybox: Web API Explorer` とする | 技術的な核であるWeb APIを名称に残すため |
| D-002 | キャッチコピーは「いつものブラウザが、パズルになる。」とする | 一般ユーザーへ体験を短く伝えるため |
| D-003 | 日英対応を初期スコープに含める | 非言語中心でも権限・設定・プライバシー説明が必要なため |
| D-004 | 静的WebアプリとしてGitHub Pagesで配信する | ブラウザだけで成立する体験と、自前サーバーを持たない方針を両立するため |
| D-005 | 進捗はIndexedDBを主保存先とするローカルファースト構成にする | 未連携でも遊べ、通信やOAuth障害で進捗を失わないため |
| D-006 | Google Drive `appDataFolder` は任意のバックアップ・引き継ぎに使う | ユーザー自身の保存領域を使い、自前DBを避けるため |
| D-007 | 全クリ前提にしない | API、権限、ハードウェア、OS、ブラウザの差をゲームの一部にするため |
| D-008 | Deprecated APIは新規ステージに採用しない | 将来性と保守性を損なうため |
| D-009 | Experimental APIと環境固有APIは採用候補に含める | Webの現在地と環境差を探索する企画だから |
| D-010 | ゲーム上の大区分と内部管理タグを分ける | プレイヤー体験と実装都合を混同しないため |
| D-011 | API名と解法をパズル中に直接説明しすぎない | 発見を体験の中心に置くため |
| D-012 | カメラ、マイク、位置情報などの生データは原則外部送信しない | パズルに不要な収集とプライバシーリスクを避けるため |
| D-013 | 今回の作業は専用ブランチとworktreeで隔離する | 並行作業の未完成変更を混ぜないため |
| D-014 | ステージと問題を箱で表し、ステージは1個以上の問題箱を持つ | 一覧、部分進捗、個別問題を同じ視覚言語で扱うため |
| D-015 | ステージ箱は未着手をリボン付き、一部解決を閉じた箱、完全解決を開いた箱で表す | 説明文に頼らず進捗を伝えるため |
| D-016 | 添付資料は原文スナップショットを保存し、現行仕様と決定ログを正とする | アイデア、古い前提、確定仕様を混同しないため |
| D-017 | ステージを観測、判定、演出、永続化、再挑戦の5層へ分ける | Web API差し替え、テスト、cleanup、進捗保存を分離するため |
| D-018 | `codex/busybox-web-api-game` を唯一のBusybox作業ブランチとする | 過去の試作や計画ブランチとの混同をなくすため |
| D-019 | Googleアカウントを識別・分離せず、選択されたアカウントと単一ローカル進捗をgrow-only統合する | identity scopeと個人情報を増やさず、アカウントをまたぐクリア情報の混在を許容して進捗消失を優先的に防ぐため（2026-07-17決定） |
| D-020 | 全問題箱は色と直下のヒント以外を同じ形状・寸法とし、入場ごとに閉箱から再挑戦する | 問題、履歴、今回の達成を同じ視覚言語で区別し、過去のチェック表示で今回の成否を隠さないため（2026-07-17決定） |
| D-021 | 個別ステージはIDだけを使った `S-xxx.tsx` へ分割し、表示ラベルを識別子に使わない | ラベルの推敲でURL・保存互換性・遅延読込・検索性を壊さないため（2026-07-18決定） |
| D-022 | 静的な `StageSpec` / `ProblemSpec` と、入場単位の `ProblemHandle` を分離する | 永続クリアと今回の再挑戦状態を混同せず、箱の定義・状態・解決操作を一つの問題オブジェクトとして扱うため（2026-07-18決定） |
| D-023 | Blackbox由来の参考機構は専用台帳で50/50件を追跡し、表現や解法を移植せずWeb固有の独自問題へ再設計してから採否を決める | 調査、未決案、確定仕様、現行コードを混同せず、漏れと不用意な模倣を防ぐため（2026-07-18決定） |
| D-024 | 他アプリの順序・終了を使うID 65相当は、S-250をRGB三色タブと白い監視タブによるWeb Lock解放順の問題へ再設計する | 観測不能なOS状態を捨て、同一オリジンの並行文脈、加法混色、lock lifecycleを組み合わせた独自のWeb問題にするため（2026-07-18決定） |
| D-025 | 非対応、権限拒否、必要機器なしの問題にskipや代替クリアを設けず、未観測のまま残す | 全クリを前提にせず、環境差そのものを観測対象にする既存方針を、問題ごとの成功条件でも維持するため（2026-07-18決定） |
| D-026 | OS音量系の参考機構は、native media playerのシーク、ミュート、再生・停止を独立して観測するS-350の3箱へ再設計する | 取得不能なsystem状態を使わず、user agentのmedia controlsとHTMLMediaElement eventを盤面にするため（2026-07-18決定） |
| D-027 | 端末再起動を要求する参考機構は取りやめ、S-220へdocument navigationのback-forward復帰とreloadを観測する2箱を追加する | 再起動を推測せず、`PerformanceNavigationTiming.type`で直接観測できるbrowser固有の操作を問題にするため。bfcache復元は同じ履歴操作として`pageshow.persisted`でも観測する（2026-07-18決定） |
| D-028 | OS通話の参考機構は、生成音声を送る2タブ間WebRTCの接続成立と明示切断を観測するS-360の2箱へ再設計し、実装前に技術スパイクを行う | 電話状態やmicrophoneへ依存せず、WebRTC lifecycle自体を問題にするため。接続・音声再生・data channel終了の実機成立性が未確認なので、PoC不成立時は成功条件を緩めず再相談する（2026-07-18決定） |
| D-029 | 共有シートの参考機構はS-240をWeb Share送出とWeb Share Target受信の2箱へ再設計し、Busybox自身のPWAインストール導線を共通UIとstage内に用意する | 選択された共有先を推測せず、Webが送信元にも受信先にもなる2方向を使うため。インストールは前提準備として案内するが、それ自体をクリアにはしない（2026-07-19決定） |
| D-030 | OS画面録画の参考機構は、S-190をuser-selected display streamのlive preview、local recording、別tabへのlive relayという3箱へ拡張する | OS録画を推測せず、同じscreen capture sourceをpreview、MediaRecorder、WebRTCという異なる実media pipelineへ流すため。録画Blobとcapture frameは保存・送信しない（2026-07-19決定） |
| D-031 | batteryの参考機構は、hosting deviceについてcharger接続、取り外し、75%以上、75%未満を独立観測するS-370の4箱へ再設計する | charger操作とcapacity帯を分け、別訪問で累積できるようにするため。接続・取り外しは実eventを要求し、capacityは物理証明ではなくbrowser報告値として扱う（2026-07-19決定） |
| D-032 | OS画面輝度の最小・最大を使う参考機構は取りやめ、page内brightness sliderにも置き換えない | 標準の輝度読取APIがなく、deprecatedな非標準APIは不採用であり、CSSだけの置換は既存camera輝度問題より発見が弱いため（2026-07-19決定） |
| D-033 | 生体認証失敗の参考機構は、ゲーム専用passkeyによる正常assertionと、存在しないcredential IDを指定したceremony拒否を観測するS-380の2箱へ再設計する | WebAuthnの失敗理由は区別できないため生体照合失敗とは呼ばず、成功側はpromise resolveだけでなくフロントエンドで署名まで検証する。これはclient内で完結するパズルであり、security boundaryとしての認証ではない。credential残留を事前説明しbest-effort cleanupを用意する（2026-07-19決定） |
| D-034 | D-033のpasskey方式は実装確定を解除し、G-036 / S-380をmemory-only Web Crypto案と再比較する | passkeyはproviderへ残る可能性と削除不能の負担があり、non-discoverable WebAuthnでも残留なしを保証できないため。最終方式の合意までS-380を実装しない（2026-07-19再検討開始） |
| D-035 | memory-only Web Cryptoの署名成功／改変失敗案はG-036 / S-380へ採用しない | browserやOSのauthenticator mediationが発生せず、通常の画面内パズルおよび既存S-020に近く、WebAuthn由来機構を置き換える固有性が不足するため。credentialを作らないWebAuthn rejection / abort案を次の候補として相談する（2026-07-19決定） |
| D-036 | WebAuthn問題にはConditional UIを必ず使い、disposable passkeyとrequest中断をG-036 / S-380へ統合する。G-037 / S-390は独立実装しない | Conditional UIは`autocomplete="username webauthn"`へbrowser固有のpasskey候補を差し込み、discoverable credentialと長時間pendingするrequestを必要とする。credentialなしstageとpasskey stageへ分けるより、一つのLabs stageで成功とplayer起因のabortを扱う方が固有性とlifecycleを保てるため（2026-07-19決定） |
| D-037 | S-380は画面遷移せず、passkey iconとlock iconを中心に、passkey保存、Conditional UI利用成功、保存済みpasskey利用不成立、no-match拒否、pending request中断の5箱を同一pageへ置く | passkey作成・利用と、先に検討したcredential-less request lifecycleを別stageへ分けず、一つのWebAuthn操作盤として比較できるようにするため。lock面は見た目をicon buttonとしつつ、Conditional UIに必要な`autocomplete="username webauthn"`付きinputへ関連付ける（2026-07-19決定） |
| D-038 | D-037の5問題はすべて採用したまま、passkey3箱とcredential-less request2箱のstage境界を技術スパイクで再検討する | 5箱を同一pageに置く操作感と、G-037を仮S-390へ分ける独立性は実際に触らないと判断できないため。問題の採否は再検討せず、5箱統合と3＋2分割だけを比較する（2026-07-19決定） |
| D-039 | system clockを戻す参考機構は、monotonic基準で1時間遅れて進むアナログ時計へOS wall clockを±5分で合わせ、続けてbaseline±5分へ復元するS-400の2箱として採用する | `Date.now()`と`performance.now()`のdriftを直接観測し、画面内の模擬時計ではなくOS設定を入力にするため。第2箱で正しい時刻へのcleanupも問題として促す（2026-07-19決定） |
| D-040 | OS設定の専用toggleを通知権限offへ置換するBB-038案は取りやめ、通知からpageへ戻る機構は既存G-029 / S-090だけを維持する | originの通知権限を`denied`にするとplayerがsettingsで解除するまで他の通知stageが成立せず、OS側でbrowser通知だけをoffにした操作はpageから確実に観測できないため。S-090はService Workerのnotification click専用URLからの復帰をすでに実装しており、追加問題は不要（2026-07-19決定） |
| D-041 | 通知actionの参考機構は、pageへ遷移せず2 actionの入力列をService Worker内で反復処理し、後の通常訪問で達成inboxをconsumeするS-410の1箱として採用する | action clickは`notificationclick`の`event.action`で識別でき、handlerがnavigationを起こさず次のnotificationを表示すれば通知面だけで再挑戦できるため。誤入力は先頭へ戻し、通知権限を変更せず、S-090のnotification本体からの復帰とも分担できる（2026-07-19決定） |
| D-042 | 通知の左右actionを入力列として蓄積し、notification本文からpageへ戻った時に正解列とまとめて比較して金庫の成否animationを行うS-420の1箱を、S-410とは別stageで採用する | S-410の通知内逐次判定とは異なり、通知actionを金庫の組合せ入力、本文clickを提出として役割分担できるため。Service Workerが提出snapshotをcommitしてからround URLを開き、直接URLやquery改変では開かない（2026-07-19決定） |
| D-043 | 通知からinline返信するBB-063は取りやめる | 現行Notifications StandardのNotificationActionはaction ID、title、navigate、iconだけでtext inputやreply payloadを持たないため。action反復による文字選択はS-410 / S-420の重複、pageへ遷移する入力は通常formとなり、通知inline reply固有の問題にならない（2026-07-19決定） |
| D-044 | 指定時刻の通知から復帰するBB-064は取りやめ、server-scheduled Push用のbackendを導入しない | client page / Service Workerには任意時刻の標準alarmがなく、Periodic Background Syncは実行時刻を保証せず、Notification Triggersも一般提供されていないため。static hosting境界を維持し、client timerによる近似問題も作らない（2026-07-19決定） |
| D-045 | 約25分backgroundの参考機構は、新規stageを作らず既存S-040へ25分以上連続hiddenのB02として追加し、既存2秒B01もmonotonic計測へ変更する | Page Visibilityという中心動詞が既存G-018と完全に一致するため。background timerを動かさずvisible復帰時の`performance.now()`差を使い、OS時計変更による誤判定を避ける。reload / discardでdocument memoryを失った場合は試行終了とする（2026-07-19決定） |
| D-046 | OS media controlによる停止の参考機構は、native video playerを使わず、生成loop audioへ届いたMedia Sessionのexternal `pause` action handlerを観測するS-430の1箱として採用する | page内audio pause eventではなくplatform / user-agentのmedia action経路を使い、S-350のnative video controlsと分担するため。Control Center、lock screen、media key、headset、system interruptionはsourceを区別できないので「外側の停止」と表現する（2026-07-19決定） |
| D-047 | home screen上のicon位置を使う参考機構は、manifest shortcut専用URLをinstalled PWAのLaunchQueueで受けるS-310-B02へ置換し、PWA起動周辺の他機能も全件再監査する | icon座標はWebへ公開されない一方、installed app iconのlong press / right clickに出るmanifest shortcutは専用URLで観測できるため。通常page内linkは置かず、既存B01の外部URL再起動とはmanifest task入口として分担する（2026-07-19決定） |
| D-048 | PWA起動周辺の追加ギミックとして、`note_taking`をS-310-B03、File HandlingをS-440、Protocol HandlersをS-450、Window Controls OverlayをS-460、Tabbed Application ModeをS-470へ採用する | OS / browserが所有する入口またはwindow surfaceをそれぞれ使い、通常deep link、shortcut、share targetとは異なる体験になるため。Limited / Experimental機能は対応環境だけで観測し、通常URLやpage内模擬UIによる代替clearは作らない（2026-07-19決定） |
| D-049 | D-048のうちChromeOS限定のTabbed Application Mode案を撤回し、G-045 / S-470は実装しない。File Handlingは固有拡張子`.busybox`をOSで開くS-440として維持する | 特定OSだけに限定されたPWA問題を作らない方針へ変更したため。標準のFile HandlingはOSの「開く」でPWAを起動する機能であり、file dropだけで未起動PWAを起動する標準経路はない。起動済みpageへのHTML dropはBB-086のD&D相談まで分離する（2026-07-19決定） |
| D-050 | BB-027の文字サイズ機構は、`text-scale`とpreferred text scaleを使い、小・標準・大・特大の4帯をそれぞれ別箱へ対応させるG-046 / S-480として採用する | OSまたはbrowserのuser preferenceがCSSの`medium` / `rem`へ入る現行標準を使い、page内sliderやzoomではなく外部設定を入力にできるため。初期状態の帯も正しい入力とし、exact倍率は保存しない（2026-07-19決定） |
| D-051 | BB-079のiOS Spotlight検索は取りやめる | Core Spotlightへの端末内index登録と検索result actionはnative framework限定で、Web indexingから通常HTTPS URLへ遷移してもSpotlight由来を証明する標準payloadがないため。site内検索やdeep linkへの置換は元の中心動詞を失い、S-310とも重複する（2026-07-19決定） |
| D-052 | BB-080のOSスクリーンショットへのQR埋込みは取りやめる一方、「表示とclipboard内容が異なる」独自問題を既存G-006 / S-180の1箱再設計として採用する | screenshot撮影pipelineは観測不能だが、trusted `copy` eventで選択中のCaesar暗号文を平文へ差し替えることは標準Clipboard Eventsで可能なため。平文を実pasteした後、そのDOM内の`busybox`だけをSelectionで選んだ場合に最終箱を開き、単純copy / pasteだけでは開かない（2026-07-19決定） |
| D-053 | `busybox`という文字列を後続問題の鍵として学ぶG-047 / S-490を、placeholderが`busybox`のtext inputへ同じ小文字列を完全一致で入力する1箱として採用する | S-180で突然固有文字列を要求せず、先に弱い記憶を作るため。typingとpasteは区別せず、IME composition完了後を含む実inputの現在値だけを判定し、値や入力履歴は保存しない（2026-07-19決定） |
| D-054 | ステージ一覧の最終形は固定gridから、系統・機構の近さ・手掛かりの継承を線で示す決定的配置のmind mapへ置き換える | 現行gridは進捗一覧としては機能するが、解き方の近さやS-490→S-180のような学習関係を表せないため。箱はsemanticなDOM nodeとして維持し、SVGの線を背面に描き、force layoutは使わない（2026-07-19決定） |
| D-055 | D-052を改訂し、既存G-006 / S-180は逆順の`xobysub`をclipboardへ書き、playerが外で`busybox`へ直して再copyした後、箱click時の`clipboard.readText()`完全一致で開く1箱にする。Caesar暗号chainは新規G-048 / S-500へ分離し、placeholder入力のG-047 / S-490とも別stageにする | S-180のwrite / clipboard受け渡しという既存機構を残しながら、単純copy箱とpaste箱を一つの往復問題へまとめるため。S-490は鍵語の直接入力、S-500はcopy override・paste・Selectionの暗号chainで中心動詞が異なる。D-054の具体的なclue edgeはS-490→S-500とS-180→S-500へ更新する（2026-07-19決定） |
| D-056 | S-190-B04として専用pageのround画像markerを実capture frameからdecodeする箱を採用し、notification欄の画像marker B05は実機PoC後に採否を決める | page markerはuser-selected display streamのpixelを確実な成功根拠にできる一方、notification `image`はLimitedで、OS / browserが通知を共有映像へ含める保証がないため（2026-07-19決定） |
| D-057 | BB-086のアプリ間sticker D&Dは、installed PWAのsource windowから通常browserのreceiver pageへ、round固有payload入りPNGを実FileとしてdragするG-049 / S-510の1箱へ再設計する | iMessageやnative app状態を観測せず、Drag Data Storeがtop-level context境界を越えて画像Fileを運ぶWeb固有の操作にするため。文字列token、同一page内drop、file input、download / uploadはclear根拠にせず、実装前にdesktop browser横断PoCを行う（2026-07-20決定） |
| D-058 | BB-009の近接機構は、W3C `ProximitySensor`の実readingでfarを観測した後に`near === true`となるG-050 / S-520のLabs 1箱として採用する | 2026年Working Draftに直接sensor interfaceがあり、camera遮蔽へ置換せず物理的な近接を観測できるため。非対応、hardwareなし、permission / policy拒否は未観測のままとする（2026-07-20決定） |
| D-059 | Generic Sensor追加問題として、LinearAccelerationSensorのX/Y/Z往復加速3箱をG-051 / S-530、AmbientLightSensorの暗所・明所2箱をG-052 / S-540、GyroscopeのX/Y/Z一回転3箱をG-054 / S-560として採用する | 各sensorの固有readingを中心条件にでき、姿勢、camera輝度、DeviceOrientationとは入力の物理量を分担できるため。いずれもLabsとして実hardwareだけを観測し、値や端末情報を保存しない（2026-07-20決定） |
| D-060 | 端末を投げ上げる／落とす自由落下条件は採用せず、Magnetometerも新規stageに採用しない | raw `Accelerometer`なら自由落下中に3軸が0付近になるという技術的推測は正しい。ただし、その値をクリア条件にすると端末の投擲・落下を通常解法としてゲームが促すため、安全上不採用とする。`GravitySensor`は別interfaceであり、自由落下時の正しさを保証しない。Magnetometer仕様は既定有効のbrowser engineがなく、一般の金属による変化も安定せず、強い磁石を端末へ近づける誘導も避ける（2026-07-20決定、Accelerometerとの区別を同日追記） |
| D-061 | G-056 / S-570として、RelativeOrientationSensorの開始quaternionからX/Y/Zの3姿勢gateを通り開始姿勢へ戻る1箱を採用する | S-560が角速度と累積回転量を扱うのに対し、S-570はmagnetometerに依存しない現在姿勢のpathと閉路を扱うため。raw quaternion列は保存しない（2026-07-20決定） |
| D-062 | D-060の自由落下問題不採用を改訂し、raw `Accelerometer`の3軸合成値が遊びを持った0付近へ入るG-053 / S-550の1箱を採用する。`GravitySensor`固有問題は作らない | raw `Accelerometer`は自由落下中に3軸が0付近となる仕様であり、「端末にかかる加速度が無重力帯へ入る瞬間」を直接観測できるため。初期PoCは合成値2.0m/s²以下を3 reading以上かつ80ms以上とし、実機noiseとsampling rateで閾値だけ調整する。投擲・落下を指示する文章や演出は置かず、raw readingは保存しない。D-060のMagnetometer不採用部分は維持する（2026-07-20決定） |
| D-063 | BB-031の指定語発話を、`SpeechRecognition`のfinal resultが正規化後に`busybox`となるG-057 / S-580のLabs 1箱として採用する | browser固有の音声認識結果を直接使い、text inputや独自ASRによる代替clearは作らない。`busybox`はS-490で先に記憶させ、mind mapにS-490→S-580のclue edgeを置く。音声とtranscriptはアプリへ保存しないが、認識処理がbrowser実装により外部serviceを使いうることは権限説明前に示す（2026-07-20決定） |
| D-064 | BB-033〜036の距離移動を、開始地点から確実に5m、25m、100m離れるG-058 / S-590の3箱として採用する。smartphone sleep / page discard後も同一tab sessionで再開する | Geolocationのaccuracy円を差し引いた保守的な距離でGPS driftによる偽clearを抑える。復帰には開始座標が必要なため、位置情報非保存原則の限定例外として開始座標・accuracy・開始時刻・round IDだけを`sessionStorage`へ最大24時間保存する。経路と途中座標は保存せず、Drive同期・外部送信せず、100m達成またはresetで即削除する（2026-07-20決定） |
| D-065 | BB-051の「ページ外でコピーした文字」は新規stageにせず見送る。Experimentalな`clipboardchange`もこの機構の独立箱には使わない | 既存S-180が、page外で`xobysub`を`busybox`へ直して再copyし、復帰後にclipboardを読ませる体験をすでに持つため。`clipboardchange`で最後の箱clickを自動化しても、playerが発見する中心操作は変わらない。API自体はMDN全件監査へ残す（2026-07-20決定） |
| D-066 | BB-055〜057の高度しきい値を、browser報告高度の100m未満、100m以上500m未満、500m以上へ対応するG-059 / S-600の3箱として採用する | 各訪問で現在位置の該当帯だけを開き、別の高度帯への訪問で累積できる。境界誤判定を抑えるため`altitude ± altitudeAccuracy`の区間全体が一つの帯へ収まるreadingを連続確認する。座標、高度、精度は保存・同期・送信せず、問題箱の達成だけを保存する（2026-07-20決定） |
| D-067 | D-056のS-190-B04 marker表示先を専用pageからmind map型ステージ一覧の外縁へ変更し、BB-060の画面探索機構を同じ箱へ統合する | stage一覧自体を探索空間にし、別tabのmapをpanしてround固有markerを見つけ、そのtabを共有映像へ収める一連の体験にできるため。marker DOMの表示やmap到達では開かず、S-190が実capture frameからpixel payloadを連続decodeした場合だけ開く（2026-07-20決定） |
| D-068 | ステージ一覧はカード全面を単一のbutton操作領域とし、専用の「箱を見る」buttonを廃止する。表示進捗は説明文ではなく累積値`x/n`へ圧縮し、60stageを入力、ページ往来、メディア、PWA、端末、センサーの6近接clusterへ決定的に配置する | 一覧の操作対象と情報量を減らし、APIの内部カテゴリよりplayerが発見する中心操作の近さを優先するため。箱の開閉表現、semantic list、keyboard順、S-190外縁markerは維持する（2026-07-20決定） |

## 仮置きしている事項

| ID | 仮置き | 変更してよい条件 |
| --- | --- | --- |
| T-001 | 大区分は5系統とする | API棚卸しまたはMVP試作で分類が体験を損なうと分かった場合 |
| T-002 | 大区分の仮称に「基盤」「端末」「保存」「通路」「実験」を使う | アート・ゲームデザイン検討でより適切な名称が決まった場合 |
| T-003 | 初期版は各系統から少数のステージを選ぶ | 試作評価に必要な組み合わせが変わった場合 |
| T-004 | 既存リポジトリ内の1つのViteエントリとして配置する | PWAスコープやService Worker分離に重大な問題がある場合 |

## 未決事項

| ID | 論点 | 決定に必要な材料 | 決定期限 |
| --- | --- | --- | --- |
| O-001 | 箱を中核にした最終アートディレクションと大区分名 | 競合作品調査、複数の画面試作、非言語での理解度 | UI実装前 |
| O-002 | 初期ステージの正確な組み合わせ | API再調査、試作コスト、対応環境、ギミック重複確認 | ステージ実装前 |
| O-003 | ステージ一覧の最終レイアウト | D-054でmind mapを採用済み。枝数、mobile viewport、keyboard順を技術スパイクで確定する | 解決済み・D-054参照 |
| O-004 | どの途中状態をDrive同期するか | 競合例、データ量、別端末UX | Drive実装前 |
| O-005 | Google OAuth公開設定とブランド確認の範囲 | Google Cloud Consoleの現行要件、公開ドメイン | 公開設定前 |
| O-006 | サーバー依存APIを本編へ含めるか | 静的配信との両立方法、外部依存の保守コスト | API拡張フェーズ |
| O-007 | アクセシビリティ用ヒントの粒度 | 非言語性との両立、テスト参加者の所見 | 初期リリース前 |
| O-008 | `Busybox` の最終名称利用可否 | 商標・検索・既存OSSとの混同調査 | 公開告知前 |

## 更新ルール

- 決定を変える場合は、既存行を書き換えるだけでなく、理由と日付を追記する。
- ブラウザ対応状況のように時間で変わる情報は、この文書ではなくAPI調査台帳へ記録する。
- 実装都合だけでプロダクト方針を変えない。変更が必要なら、先にこのログへ論点を追加する。
