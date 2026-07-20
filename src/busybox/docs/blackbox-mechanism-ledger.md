# Blackbox機構監査・対話決定台帳

## 目的

Blackboxを参考に抽出した機構を、そのまま複製せず、Web固有の独自問題へ再設計できるか1件ずつ判断する。名称、文章、画像、音、数値、配置、解法順、進行演出は流用しない。

この文書は2026-07-18時点の調査を引き継ぎ、2026-07-20までに完了した対話決定の正本とする。コードの現状と承認済みの将来仕様を区別し、技術PoCで境界が確定した時にも更新する。

## 引き継いだ調査スナップショット

- MDN Web API一覧: 147ファミリー、1,045インターフェース
- Busybox向け分類: 直接候補32、条件付き候補52、実装基盤48、原則除外15
- Blackbox iOS/iPadOS版: 現役81ライト、50種類の機構
- Web実現性の初期評価: ほぼ再現可能21、再設計28、同一挙動は不可能1
- Vision Pro版は公開情報から全機構を列挙できないため、この監査の対象外

上記件数は引き継いだ調査時点のスナップショットであり、API互換性の根拠にはしない。実装前にMDN、Browser Compatibility Data、Web Platform Baseline、仕様策定元、ブラウザ公式情報、実ブラウザで再確認する。

## 進め方

1. 初期評価が△または×の29件を、影響と代替案の不確実性が大きいものから1件ずつ相談する。
2. 各項目を「独自問題として採用」「既存ステージへ統合」「保留」「取りやめ」のいずれかへ確定する。
3. 採用時は、体験の核、問題箱ごとの成功条件、使用API、対応差、非対応時の状態、reset、cleanup、既存ステージとの重複、実装先を記録する。
4. 合意した設計と現行コードが異なる間は、必ず「再設計待ち」と明記する。
5. 29件の相談は2026-07-20に完了した。Blackbox 50/50機構のWeb案または不採用理由を維持し、採否の相談漏れを再発させない。
6. 次に、MDN一覧を再取得した機械可読台帳、ステージマニフェスト、JSON Schema、未分類を失敗させるCIへ進む。147ファミリーと1,045インターフェースは2026-07-18のスナップショットであり、再取得前の固定母数にはしない。

全採用ステージにfeature detectionとreset / cleanupを用意する。非対応、権限拒否、必要機器なしの場合はその問題を未観測のままにし、代替操作やskipによるクリアは用意しない。全クリを前提とせず、非対応問題がアプリ全体を壊さないことを完了条件とする。

## 状態

| 状態 | 意味 |
| --- | --- |
| 未相談 | 初期評価だけがあり、代替案をまだ合意していない |
| 相談中 | 次の対話対象 |
| 採用 | 独自問題または既存ステージへの統合を合意した |
| 保留 | 前提や検証材料が足りず、後で再判断する |
| 取りやめ | Web版へ入れない理由を確定した |

## 確定した判断

### BB-065 App Switcherの順序と他アプリの強制終了

- 初期評価: ×。Webページは他アプリの並びや終了状態を観測できない。
- 決定日: 2026-07-18
- 状態: 採用
- 決定: RGB加法混色をモチーフにした、同一オリジンの複数タブとWeb Lock解放順の独自問題へ置き換える。
- 実装先: 既存のG-022 / S-250を再設計する。G-017 / S-050は2タブ通信の入門として残し、第3の類似ステージは追加しない。
- 現行コードとの差: 現在のS-250はholderタブとblockedタブを判定する実装であり、以下の承認仕様はまだ未実装。

#### 体験

1. 赤い背景から開始する。
2. ステージ内のリンクを新しいタブで開くたび、同じラウンドの背景を `赤 → 緑 → 青 → 赤` と循環させる。
3. 赤、緑、青の3種が同時に存在すると、中央の光を白へ合成し、`S-250-B01`を開く。
4. 開いた第1箱を明示的に操作すると、白い監視タブを開く。ユーザー操作から開き、自動popupにはしない。
5. 白タブには目標となる光の変化 `白 → 黄 → 赤 → 黒` を示す。
6. 色タブを `青 → 緑 → 赤` の順で閉じると、白タブがWeb Lockの解放順を観測し、`S-250-B02`を開く。この順番は開いた順番の逆であり、加法混色から推理できる。

#### 技術境界

- URLへラウンドIDと `r | g | b | white` の役割を持たせ、過去のタブや別ラウンドを混ぜない。
- 各色はラウンド固有のexclusive Web Lockを1つ保持する。重複色タブは同じ役割として参加させない。
- BroadcastChannelは同一ラウンドの役割通知と表示同期に使う。
- 第2箱の判定は `beforeunload` や `pagehide` のgoodbyeだけに依存せず、白タブが色別Web Lockの解放順を観測する。
- 物理的なタブ終了と別URLへの離脱を完全には区別できないため、仕様上の入力は「色のページ文脈が消灯してlockを解放すること」とする。主導線はブラウザのタブを閉じる操作にする。
- 観測用の白タブが残るため、3色すべてを閉じた後も最終結果を表示・保存できる。
- 離脱時は保持lock、待機中request、channel、timer、listener、背景用CSS変数を解放・復元する。

#### 失敗、再試行、アクセシビリティ

- 誤順時も第1箱の今回達成は維持し、第2段階だけをリセットする。
- 白タブから不足色を再点灯し、第2段階を最初から再試行できる導線を用意する。
- 背景色だけに依存せず、タブタイトル、favicon、模様または形でも赤・緑・青を区別する。
- 高彩度背景でも文字と箱のコントラストを保ち、動きの軽減設定へ対応する。

### BB-017 スクリーンショット検出

- 初期評価: △。WebページからOSのスクリーンショット撮影eventを受け取る標準経路は確認できない。
- 決定日: 2026-07-18
- 状態: 取りやめ
- 決定: スクリーンショット撮影の検出も、撮影画像をページへ戻して検証する代替問題も採用しない。S-190へ問題箱を追加しない。
- 理由: 受動的な撮影検出はできず、成果物の再入力へ変えると元の中心動詞から離れる。さらにS-130のfile往復、S-180のpaste、S-190の画面取得と近くなるため、問題数を増やす価値が不足する。

### BB-018–021 消音、音量、ヘッドホン

- 初期評価: △。Webページはsystem mute、system volume、silent switch、headphone装着状態を信頼できる入力として取得できない。
- 決定日: 2026-07-18
- 状態: 採用
- 決定: OS状態の再現をやめ、user agentが描画するnative media playerのシーク、ミュート、再生・停止を3つの問題箱にする。
- 対応先: 新規G-033 / S-350として計画する。元の4ライトを4箱へ対応させない。
- 現行コードとの差: S-350と動画assetは未実装。
- 現行機能の境界:
  - [`HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)は `play`、`pause`、`seeking`、`seeked`、`timeupdate`、`ratechange`、`volumechange` など、native media controlsの結果を反映するeventとpropertyを持つ。
  - [`volumechange`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volumechange_event)はmedia elementの `volume` または `muted` が変化した場合に発火するため、player自身のmute操作は観測できる。
  - [`HTMLMediaElement.volume`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume)の数値操作はLimited availabilityであり、OS全体のvolumeではない。物理volume buttonやsilent switchを成功条件にはしない。

#### 確定仕様

1. originalの短い音声付き動画をlocal assetとして `<video controls>` に埋め込み、独自のplay、pause、seek、mute buttonは作らない。
2. `S-350-B01` シーク箱: `seeking`から`seeked`までを観測し、開始前から再生位置が有意に変わった場合に開く。目標時刻や目標frameは要求せず、通常再生で時刻が進んだだけでは開かない。
3. `S-350-B02` ミュート箱: `volumechange`後に `muted === true`、または利用可能な環境で `volume === 0` になった時点で開く。指定区間の通過、再生継続、解除は要求しない。初期状態をscriptからmuteして偽クリアさせない。
4. `S-350-B03` 再生・停止箱: `playing`を観測した後、再生位置が進んでから`pause`を観測した場合に開く。初期のpaused状態だけでは開かない。
5. 3箱は順不同で独立して開く。映像には操作の直接説明ではなく、timelineとspeakerを示唆する非言語的な手掛かりだけを置く。
6. 突然の大音量を使わず、安全な一定音量にする。字幕または視覚表現を付け、聴覚だけに依存させない。
7. native controlsが操作を提示しない環境では該当箱を未観測のままにする。custom control、skip、別操作による代替クリアは用意しない。
8. 離脱時は再生停止、listener解除、source解放を行い、視聴履歴、再生位置、音量値を進捗へ保存しない。

#### 既存ステージとの差

- S-120はmicrophone入力、S-170はWeb Animationのtimeline、S-190はscreen captureであり、user agentが描画するmedia controlsとmedia timelineを盤面にする問題はまだない。
- 複数audio outputへのroutingはこのステージへ混ぜず、MDN監査時の別候補として残す。

### BB-023 機内モード、Wi-Fi切断

- 初期評価: △。Webページはnetwork接続種別や機内モードを特定できない。
- 決定日: 2026-07-18
- 状態: 既存ステージへ統合
- 決定: 機内モード、Wi-Fi、Ethernetなどの切断方法を区別せず、「browserがofflineへ遷移した」という機構として既存S-070へ統合する。新しい問題箱や到達確認用serverは追加しない。
- 現行機能の境界: [`navigator.onLine`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)と `online` / `offline` eventは広く利用できるが、OSとbrowserごとのheuristicであり、`true`はInternet到達性を保証しない。
- 既存実装: S-070はService Workerでページを維持し、`navigator.onLine === false`を観測すると `S-070-B01`を開く。BB-023のためのコード変更は不要。

### BB-050 端末再起動後に戻る

- 初期評価: △。通常のWebページは端末やbrowser processの再起動を確実に識別できない。
- 決定日: 2026-07-18
- 状態: 元の機構は取りやめ、別のWeb固有機構を採用
- 決定: 端末再起動を成功条件にはしない。代わりに [`PerformanceNavigationTiming.type`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type) が識別するdocument navigationを使い、「browserの戻る・進むでステージへ復帰」と「reload」を独立した2箱にする。
- 実装先: 既存G-019 / S-220を3箱へ拡張する。現行の同一document内の履歴問題は第1箱として残し、Navigation Timingの2箱を追加する。
- 現行コードとの差: 現在のS-220は `pushState` で積んだ3履歴をBackで戻る1箱だけを実装しており、以下の第2箱、第3箱とfull-document navigationの入口は未実装。

#### 確定仕様

1. `S-220-B01` 同一document履歴箱: 現行どおり、ステージ内で積まれた3つのhistory entryをbrowser Backで開始地点まで戻ると開く。
2. `S-220-B02` 戻る・進む箱: S-220をfull-document navigationで開いた後、browser Backで一度離れ、browser ForwardでS-220へ戻ると開く。新しいdocument loadでは `PerformanceNavigationTiming.type === "back_forward"` を成功条件として観測する。
3. back-forward cacheから復元された場合は新しいnavigation timing entryが作られないため、同じbrowser Back / Forward操作の観測として `pageshow` eventの `persisted === true` も成功条件に含める。これは別解や代替操作ではなく、browser内部の復元経路の差を吸収する実装条件とする。
4. `S-220-B03` reload箱: S-220上でbrowser reloadを行い、再読込後の `PerformanceNavigationTiming.type === "reload"` を観測すると開く。
5. 第2箱を成立させるため、通常のSPA内 `pushState` だけでS-220を開かず、S-220への入口は実際のdocument navigationを発生させる。stage内の模擬Back / Forward / Reload buttonは用意しない。
6. 3箱は順不同で独立して永続化する。document navigationでstage instanceが破棄されても、すでに開いた箱を失わない。
7. navigation entry、`pageshow` listener、history stateの有無をfeature detectionし、利用できない環境では該当箱を未観測のままにする。skipや別操作による代替クリアは用意しない。

#### 既存ステージとの差

- S-060は訪問間の永続記憶を使う問題であり、戻り方やnavigation種別を問わない。S-220はbrowser履歴とdocument navigationそのものを入力にする。
- `pushState` / `popstate`によるsame-document navigationは `PerformanceNavigationTiming.type` を更新しないため、第1箱と第2箱を同じ判定にまとめない。
- 端末再起動後にも進捗が復元されることはgameplay条件にせず、保存基盤の品質確認としてのみ維持する。

### BB-058–059 通話の発着信と終了

- 初期評価: △。WebページはOSの電話着信、発信、通話終了を観測できない。
- 決定日: 2026-07-18
- 状態: 採用・技術スパイク待ち
- 決定: OS通話の再現をやめ、同一オリジンの2タブ間で実際のWebRTC peer connectionを確立し、接続と明示切断を2つの問題箱にする。
- 対応先: 新規G-034 / S-360として計画する。
- 現行コードとの差: S-360は未実装。実装へ入る前に、下記の観測が対象ブラウザで成立するか最小PoCを作る。

#### 確定仕様

1. 同じラウンドIDを持つ「発信側」と「応答側」の2タブを用意する。片方のtabだけ、または異なるラウンドのtab同士では成立しない。
2. BroadcastChannelはoffer、answer、ICE candidateのsignalingと役割調整にだけ使う。問題箱の成功根拠をBroadcastChannelの自己申告だけにしない。
3. microphoneは要求しない。Web Audioで小さな安全音量の呼出音を生成し、`MediaStreamAudioDestinationNode`のaudio trackを `RTCPeerConnection` で相手へ送る。音を出さずに確認できる接続状態表示も付ける。
4. `S-360-B01` 接続箱: 発信と明示的な応答の後、両peerが [`RTCPeerConnection.connectionState`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState) の `connected` を観測した場合に開く。offer生成だけ、応答前、接続失敗では開かない。
5. `S-360-B02` 終了箱: 同じ通話で一度connectedを観測した後、どちらかのtabから明示的に終了し、相手側がRTCDataChannelのcloseを観測した場合に開く。接続前の終了、単なるsignaling message、失敗によるtimeoutでは開かない。
6. 2箱は接続から終了の順序を持つ。第1箱の永続達成済みだけを根拠にせず、現在の入場でconnectedを観測してから第2箱を判定する。
7. 離脱時はoscillator、AudioContext、MediaStreamTrack、RTCDataChannel、RTCPeerConnection、BroadcastChannel、listener、timerを停止・解放する。音声、SDP、ICE candidate、接続先情報は進捗へ保存しない。
8. 非対応や接続不能の場合は箱を未観測のままにし、疑似通話や別操作による代替クリアは用意しない。

#### 技術スパイクの合格条件

- 同一端末の2タブ間で、外部signaling serverやSTUN / TURNを置かずに接続できることをChrome、Firefox、Safariの対象環境で確認する。
- user activation後に生成audio trackを送受信でき、意図しない大音量、feedback、autoplay拒否が起きないことを確認する。
- connected後に片側がdata channelを閉じ、反対側でcloseを安定して観測できることを確認する。
- tab終了、急なreload、ICE失敗が第2箱の明示終了として誤判定されないことを確認する。
- いずれかが成立しない場合はsuccess条件を独断で緩めず、検証結果をこの台帳へ追記して再相談する。

### BB-072 OS共有シートを2経路で利用

- 初期評価: △。Web Share APIはOSの共有先一覧や、ユーザーが選んだ共有先をページへ公開しない。
- 決定日: 2026-07-19
- 状態: 既存ステージへ統合・PWA導線を含めて再設計待ち
- 決定: 共有先を推測する元の機構は使わず、G-021 / S-240を「Web Shareで外へ渡す」と「Web Share Targetとして外から受け取る」の非対称な2箱へ再設計する。
- 現行コードとの差: 現在のS-240は文字列を `navigator.share()` へ渡す1箱だけを実装している。第2箱、manifestの `share_target`、受信route、PWAインストール導線は未実装。
- 現行機能の境界:
  - [`navigator.share()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)はtext、URL、対応環境ではfileをuser-selected targetへ渡せるが、選択されたtargetは取得できない。
  - [Web Share仕様](https://w3c.github.io/web-share/)は、利用可能なtargetや選択されたtargetをsiteが知れないことをprivacy要件としている。promiseのresolveを、共有先app内での投稿、保存、送信完了の証明として扱わない。
  - [Web Share Target](https://w3c.github.io/web-share-target/)はmanifestの `share_target` によりPWA自身が受信先になれるがearly draftであり、登録条件と対応環境はbrowser / OSに依存する。

#### 確定仕様

1. `S-240-B01` 送出箱: 現行の一時tokenをWeb Shareでuser-selected targetへ引き渡す。`navigator.share()`がresolveしたら開くが、成功表現は「共有完了」ではなく「引き渡し受付」とする。
2. `S-240-B02` 受信箱: installed PWAのBusyboxをWeb Share Targetとして登録する。browser UIまたは別appから現在のS-240ラウンドURLをBusyboxへ共有し、share target actionが同じラウンドtokenを実際に受信した場合に開く。
3. 第2箱に必要なのは任意の別PWAではなく、共有先として登録されるBusybox自身のインストールである。player向け文言で曖昧にしない。
4. staticなGitHub Pagesで受信できるよう、manifestの `share_target` は同一scopeの `index.html` をactionとするGET routeを使う。受信後はstageとroundを検証し、不要なquery parameterをhistoryから除去する。
5. 2箱は順不同で独立する。第1箱の送出先としてBusyboxを選ぶことを強制せず、第2箱はbrowser UIや別appから独立して持ち込める。
6. 受信した生text、title、URLは表示・保存せず、stage IDと現在有効なround tokenの一致だけを観測事実へ残す。
7. Web Share Target非対応環境では第2箱を未観測のままにする。file共有やcopy/pasteによる代替クリアは用意しない。

#### PWAインストール導線

1. S-240の受信箱の近くに、前提として「Busyboxをこの端末へインストールすると、OSの共有先にBusyboxが加わる」ことを明示する。箱の成功条件を満たした表示にはしない。
2. Chromium系で `beforeinstallprompt` を捕捉できる場合は、共通PWA案内から明示的な「Busyboxをインストール」操作を提示する。promptのacceptだけでは箱を開かない。
3. programmatic install promptを利用できない場合は、browser / OS別に「browser menuからアプリをインストール」またはiOS Safariの「共有 → ホーム画面に追加」を示す。これは準備手順であり、代替クリアではない。
4. インストール後はinstalled Busyboxを一度起動し、S-240へ戻る導線を示す。`display-mode: standalone`の場合は「インストール済み。対応OSでは共有先にBusyboxが現れる」と表示し、share target登録済みとは断定しない。
5. 共通の設定画面に現在のdisplay mode、インストール案内、対応環境の説明を置く。S-080、S-240、S-310から同じ案内へ到達できるようにし、ステージごとに異なる手順を重複実装しない。
6. インストール済みかどうかを標準APIだけで常に判定できないため、promptがないことを「インストール済み」の証明に使わない。

### BB-081–082 画面録画とbroadcast先

- 初期評価: △。WebページはOS標準の画面録画開始、保存先、broadcast先を受動的に観測できない。
- 決定日: 2026-07-19
- 状態: 既存ステージへ統合・再設計待ち
- 決定: OS画面録画を検出せず、G-012 / S-190を、userが選んだdisplay streamのlive preview、local recording、別tabへのlive relayという3箱へ拡張する。
- 現行コードとの差: 現在のS-190はcurrent browser tabのlive frameを12回観測する1箱だけを実装している。MediaRecorder、recorded Blobの検証、observer tab、WebRTC relayは未実装。

#### 確定仕様

1. `S-190-B01` live preview箱: 現行どおり、明示操作から `getDisplayMedia()` を呼び、userが選んだbrowser display surfaceのlive frameを継続観測すると開く。
2. `S-190-B02` local recording箱: 同じcapture streamを [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) へ渡す。明示的なstart後にrecorderの `start` event、recording中のlive frame進行、明示stop、`dataavailable`の非空Blob、`stop` eventを順に観測すると開く。
3. B02のBlobは内容を再生、解析、download、永続化せず、`size > 0`の確認後に参照を破棄する。開始直後の空recordingやcapture trackの失敗終了では開かない。
4. `S-190-B03` live relay箱: 同じcapture streamのvideo trackを、同じroundのobserver tabへRTCPeerConnectionで送る。observer側videoで複数のframe進行を観測した場合に開く。offer、answer、ICE接続、signaling messageだけでは開かない。
5. B03のBroadcastChannelはround調整とWebRTC signalingにだけ使う。S-360の技術スパイクで得たsignaling helperを再利用できるが、S-190の成功根拠はuser-selected display videoの到達に置く。
6. B01、B02、B03は独立して永続化する。B02とB03はそれぞれ新しいcapture permission操作から再挑戦でき、一度取得したscreen capture permissionを永続許可として扱わない。
7. 離脱、retry、recording終了、observer tab終了時はtimer、video source、MediaRecorder、Blob、全MediaStreamTrack、RTCPeerConnection、RTCDataChannel、BroadcastChannel、listenerを停止・解放する。
8. capture frame、recorded Blob、SDP、ICE candidate、display surfaceの識別情報は進捗へ保存せず、外部serverへ送らない。relay先は同一端末・同一origin・同一roundのobserver tabに限定する。
9. MediaRecorderまたはWebRTC relay非対応環境では該当箱を未観測のままにし、upload済み動画や疑似frameによる代替クリアは用意しない。

#### 既存ステージとの差

- S-360は生成audioを使ったpeer接続と明示切断のlife cycleを問題にする。S-190-B03はuser-selected display videoが別contextへ実際に届くことを問題にする。
- S-130のfile export / importとは異なり、B02は録画成果物をplayerへ渡さず、その場のMediaRecorder lifecycleだけを観測する。
- S-190の3箱は同じcapture sourceをpreview、record、relayという異なるmedia pipelineへ流す構成であり、API名だけを変えた別stageには分割しない。

### BB-010–012 バッテリー残量

- 初期評価: △。Battery Status APIは主要browser共通ではなく、取得不能時やbatteryなし環境では満充電・充電中に見えるdefault値を返しうる。
- 決定日: 2026-07-19
- 状態: 採用・新規ステージ計画
- 決定: hosting deviceのBattery Statusを、充電器の接続、取り外し、75%以上、75%未満という4つの独立した箱にする。
- 対応先: 新規G-035 / S-370として計画する。G-025 / S-280の外部Bluetooth機器Battery Serviceとは統合しない。
- 現行コードとの差: S-370は未実装。
- 現行機能の境界:
  - [`navigator.getBattery()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery)はBatteryManagerを返し、`charging`、`level`と `chargingchange`、`levelchange`などを観測できる。
  - [Battery Status仕様](https://w3c.github.io/battery/)では、report不能、batteryなし、または状態を秘匿する環境で `charging === true`、`level === 1`などのdefault値を使う。このため、容量箱は物理batteryの証明ではなく、browserが公開した値の観測として扱う。
  - MDNではLimited availabilityであり、対応環境限定のLabs問題とする。

#### 確定仕様

1. `S-370-B01` 接続箱: stage入場後の `chargingchange` eventで、直前の `charging === false` から `true`へ変化した場合に開く。入場時から充電中という静的状態だけでは開かない。
2. `S-370-B02` 取り外し箱: stage入場後の `chargingchange` eventで、直前の `charging === true` から `false`へ変化した場合に開く。入場時から放電中という静的状態だけでは開かない。
3. `S-370-B03` 高容量箱: 初回取得または `levelchange` 後の `level >= 0.75` で開く。75%ちょうどは高容量側とする。
4. `S-370-B04` 中低容量箱: 初回取得または `levelchange` 後の `level < 0.75` で開く。
5. 4箱は順不同で独立して永続化する。同じ入場で4状態を揃える必要はなく、別の訪問で観測した箱も累積する。
6. capacityの境界は表示上も75%で統一し、浮動小数の比較はBatteryManagerの0〜1値に対して行う。
7. `level === 1`かつ`charging === true`は、batteryなしやreport不能時のdefault値と区別できない。B03はあくまでbrowser報告値として開き、B01は実 `chargingchange`がない限り開かない。
8. exact level、chargingTime、dischargingTimeは進捗へ保存せず、`battery:connected`、`battery:disconnected`、`battery:high`、`battery:low`という判定事実だけを残す。
9. 離脱時はBatteryManagerの全listenerを解除する。`getBattery`非対応やpolicy拒否では4箱を未観測のままにし、simulationや手入力による代替クリアは用意しない。

#### 既存ステージとの差

- S-280はuser-selected Bluetooth peripheralのGATT Battery Serviceを一度読む。S-370はhosting deviceのBatteryManagerと時間変化を観測する。
- S-330は画面消灯を抑制するScreen Wake Lockであり、battery levelやcharger状態を入力にしない。

### BB-015–016 OS画面輝度の最小、最大

- 初期評価: △。標準WebページはOS display brightnessの現在値、最小値、最大値を取得できない。
- 決定日: 2026-07-19
- 状態: 取りやめ
- 決定: OS画面輝度の検出も、page内brightness sliderによる置換も採用しない。新しいstageや問題箱は追加しない。
- 理由:
  - [`Screen.mozBrightness`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/mozBrightness)はdeprecatedかつnon-standardであり、D-008のDeprecated API不採用方針に反する。
  - screen brightnessを制御する提案は現在の標準browserへ一般提供された読取・変更APIではなく、WebKitもbrightness制御案へ反対のstandards positionを示している。
  - CSSの色、opacity、`filter: brightness()`はpage描画だけを変え、physical display brightnessを観測しない。sliderへ置き換えると標準的な画面内操作に閉じ、独立stageにする発見が弱い。
  - S-110はcameraで環境の暗さ→明るさをすでに観測する。cameraを使った間接推定は重複する。
  - dark / light color schemeは別のBB-083で標準`matchMedia()`を使うため、ここへ統合しない。

### BB-022 生体認証を意図的に失敗

- 初期評価: △。WebAuthnはuser verificationを要求できるが、生体認証の種類や、生体照合に失敗したという個別理由をWebページへ公開しない。
- 決定日: 2026-07-19
- 状態: 5問題を採用・stage境界は技術スパイク待ち
- 決定: ゲーム専用のdiscoverable credential、Conditional UI、credential-less request lifecycleを同じS-380操作盤へ統合する。
- 対応先: 新規G-036 / S-380として計画する。
- 現行コードとの差: S-380とpasskey cleanup導線は未実装。
- 再検討履歴（2026-07-19）: credentialが端末または同期providerへ残る負担を避ける案を比較し、Conditional UI必須と5問題の採用を決定した。当初は同一pageの5箱としたが、D-038で3箱＋2箱の分割variantもPoC比較へ戻した。以下の旧案は判断履歴であり、現行仕様は「統合案: WebAuthn Conditional UI」と「ステージ境界の技術スパイク」を正とする。
- 現行機能の境界:
  - [Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)は `navigator.credentials.create()` と `get()`によるregistration / authentication ceremonyを提供する。`userVerification: "required"`はverificationを要求するが、fingerprint、face、PINなどの方式をsiteが指定・識別する仕組みではない。
  - [WebAuthn Level 3仕様](https://www.w3.org/TR/webauthn-3/)は、対象credentialなしとuser non-consentの双方を `NotAllowedError` 相当として扱う。したがって、API拒否の発生は検知できるが、誤った指、顔、PIN、cancel、対象鍵なしをerror名から区別できない。
  - [`AuthenticatorAttestationResponse.getPublicKey()`](https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAttestationResponse/getPublicKey) と `getPublicKeyAlgorithm()`で、将来のassertion検証に必要なSPKI公開鍵とCOSE algorithmをregistration responseから取得できる。
  - フロントエンドだけでも署名検証はできるが、challenge、公開鍵record、検証code、進捗が同じclient上にあり改変可能である。これはローカルな暗号ceremonyを使うパズルであり、account loginやsecurity boundaryとしての認証ではない。

#### 旧2箱案（履歴、現行仕様ではない）

1. setupでは明示ボタンから `navigator.credentials.create()` を呼び、`residentKey: "required"`、`userVerification: "required"`、`attestation: "none"`、platform authenticatorを要求する。user IDは乱数、表示名は「Busybox disposable key」に相当する明示的な名称とし、氏名、email、端末識別子を使わない。
2. credential作成は問題箱に数えない。作成前に、ゲーム専用passkeyが端末または同期providerへ保存され、ゲーム側から確実には削除できないことを説明して同意を得る。
3. registration後、credential ID、SPKI公開鍵、COSE algorithm、必要なtransport情報だけをIndexedDBへ保存する。private key、生体情報、PIN、attestation objectは保存しない。
4. `S-380-B01` 成功箱: 保存したcredential IDと新しい乱数challengeを使って `navigator.credentials.get()` を開始する。返されたassertionについて、type、challenge、origin、RP ID hash、user presence、user verification、credential ID、`authenticatorData || SHA-256(clientDataJSON)` のsignatureを保存公開鍵で検証できた場合だけ開く。promise resolveだけでは開かない。
5. `S-380-B02` 失敗箱: このstageが生成した、実在credentialと一致しない十分な長さの乱数IDだけを `allowCredentials` に指定し、明示ボタンから別の `get()` ceremonyを開始する。そのrequestが `NotAllowedError` でrejectされた場合に開く。
6. B02は「認証ceremonyが成立しなかった箱」であり、「生体認証を間違えた箱」とは表現しない。同じerrorにcancelやnon-consentも含まれ、ページ側で理由を区別できない境界をstage後の解説へ明記する。
7. `AbortController.abort()`によるscript中断、極端に短いtimeout、`SecurityError`、`TypeError`、設定不備などはB02に数えない。存在しないIDを指定した専用requestの `NotAllowedError`だけを観測対象にする。
8. B01とB02はsetup後に順不同で独立して開く。B02のために実credentialのPINや生体照合を意図的に失敗させず、認証lockoutを誘発しない。
9. ES256とRS256を最低対応algorithmとして実装候補にし、公開鍵importとsignature形式差をbrowser横断testする。対応algorithmを安全に検証できない環境ではB01を未観測のままにし、promise resolveだけの代替判定はしない。
10. cleanup UIは2箱とは別に用意する。ユーザーが「鍵を片付ける」を選んだ場合、対応環境では [`PublicKeyCredential.signalUnknownCredential()`](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential/signalUnknownCredential_static) をbest effortで呼び、ローカルrecordを削除し、provider側での手動削除方法も案内する。このAPIはLimited availabilityで、authenticatorが削除する保証はない。
11. game progressのresetではpasskey自体を削除できないため、reset前にも残留可能性を警告する。別のcredentialを無制限に増やさず、local recordがある間は再作成より既存鍵の利用を優先する。
12. WebAuthn、必要method、secure context、platform authenticatorのいずれかが利用できない場合は箱を未観測のままにし、password、PIN UI、疑似認証による代替クリアは用意しない。
13. WebAuthn credentialはURL pathではなくRP IDにscopedされる。GitHub Pagesの共用host配下pathだけで公開すると同じoriginの別appと範囲を共有するため、S-380を本番提供する前にBusybox専用のhost名またはcustom subdomainを割り当てる。静的GitHub Pages配信は維持してよい。

#### 既存ステージとの差

- S-020のWeb Cryptoはdigest計算、S-040はlocal保存、S-160はPermissions API状態を扱う。S-380は秘密鍵をJSへ渡さないauthenticator ceremonyと、返されたassertionのローカル署名検証を体験の核にする。
- 一般的なフロントエンドだけのpassword / PIN判定はclientから改変でき、このstageより認証らしい安全性を追加しないため採用しない。
- cleanupはcredential lifecycleの説明に必要だが、箱を開く操作や代替解法にはしない。

#### 再検討する実装方式

| 案 | 残留物 | OS認証UI | 成功・失敗の意味 | 評価 |
| --- | --- | --- | --- | --- |
| discoverable WebAuthn / passkey | authenticatorまたは同期providerへ残りうる。削除保証なし | あり | user verificationを伴う実WebAuthn ceremony | 旧採用案。ユーザー負担が最も重い |
| non-discoverable WebAuthn | credential-specific dataをauthenticatorへ保存しない実装が可能。ただし `residentKey: "discouraged"` はdiscoverable credentialを禁止できない | あり | user verificationを伴う実WebAuthn ceremony | passkey一覧の負担は減らせるが、残留なしを保証できない |
| memory-only Web Crypto + Dedicated Worker | page memoryだけ。Worker終了またはtab終了で消える | なし | challenge署名が検証成功／改変後に検証失敗 | 不採用。WebAuthn固有のbrowser介在がなく、通常の画面内パズルへ寄りすぎる |
| temporary Web Crypto + IndexedDB | origin storageへ残るがappがrecordを確実に削除できる | なし | challenge署名の検証成功／失敗 | reloadをまたげるが、途中離脱時の一時recordが残りうる |
| page内PIN / password | memoryだけにもできる | なし | 入力一致／不一致 | 入力と記憶の負担があり、通常のform操作に近いため非推奨 |
| credential-less WebAuthn rejection / abort | なし。credentialを作成せず、乱数requestだけをmemoryに置く | authenticator選択UIはありうる | `NotAllowedError`による拒否と、`AbortSignal`による`AbortError` | 新しい推奨候補。WebAuthn固有のrequest lifecycleを残せるが技術スパイク必須 |

`residentKey: "discouraged"`はnon-discoverable credentialを希望するだけで、仕様上discoverable credentialの作成を禁止できない。したがって「OS認証UIを使い、かつ何も残さない」という要件をWebAuthnで保証する案はない。

memory-only案では、Dedicated Worker内でECDSA P-256鍵pairを `extractable: false` で生成し、private keyをWorker外へ渡さない構成を検討した。しかし、browserやOSのauthenticator mediationが発生せず、既存S-020のWeb Cryptoとも近いため採用しない。

1. `S-380-B01`は、Workerがchallengeへ署名し、main threadが元のchallengeに対して `crypto.subtle.verify()` の `true`を得た場合に開く。
2. `S-380-B02`は、署名後にplayerが視覚patternの1 bitを反転し、改変後challengeに対して同じ署名の `verify()` が `false`になった場合に開く。例外を意図的に起こす問題にはしない。
3. stage離脱時にWorkerをterminateし、鍵参照、challenge、signatureを破棄する。IndexedDB、localStorage、sessionStorage、Cache Storageには保存せず、進捗には `crypto:verified` と `crypto:rejected`だけを残す。
4. WorkerはUI codeから鍵を分離する装置であり、同一origin内のsecurity boundaryやuser identityの証明とは呼ばない。
5. 2箱のための操作は「封をする」と「封をした後にpatternを1箇所変える」程度にし、OS prompt、account作成、手動cleanupを要求しない。

#### 新候補: credentialを作らないWebAuthn lifecycle

1. `navigator.credentials.create()`は呼ばず、`navigator.credentials.get()`だけを使う。stage固有の乱数challengeと、実在credentialに一致しない乱数IDを `allowCredentials`へ渡すため、成功assertionやpasskeyは生成されない。
2. `S-380-B01` 拒否箱: 明示操作からno-match requestを開始し、browser / authenticatorが `NotAllowedError`でrejectした場合に開く。これは生体照合失敗とは呼ばず、「使える鍵が提示されなかったWebAuthn ceremony」と表現する。
3. `S-380-B02` 中断箱: 同じ種類のrequestがpendingの間に、stageから開いた同一roundのbreaker tabで切断操作を行う。BroadcastChannelで元tabへ命令し、元tab自身の `AbortController.abort()`によりrequestが `AbortError`でrejectされた場合に開く。
4. scriptが自動timerだけでabortして箱を開かず、別tabでのplayer操作を要求する。BroadcastChannel messageだけでは判定せず、元tabが実際に受け取った `AbortError`を成功根拠にする。
5. 乱数credential ID、challenge、AbortController、channelは入場memoryだけに置き、離脱時に破棄する。credential、passkey、公開鍵record、account、provider同期、manual cleanupは発生しない。
6. B01とB02はともにauthentication成功ではなく、WebAuthn requestの「authenticator側で不成立」と「RP側から中断」という異なる終了経路を問題にする。

技術スパイクでは、no-match requestがplayer操作可能な時間だけpendingになるか、native UIを表示したまま別tabへ移れるか、別tabからのsignal後に `AbortError`を得られるかをChrome、Firefox、Safariのdesktop / mobile対象環境で確認する。requestが即時 `NotAllowedError`になってB02を成立させられない環境は未観測のままにし、timerや模擬dialogへ置き換えない。

#### 両案を分離して残す候補

- 2026-07-19にS-380 credential-less lifecycleとS-390 disposable passkeyを分ける案を検討した。
- WebAuthn Conditional UIを必須採用する方針により、この分離案は撤回する。Conditional UIはdiscoverable credentialを候補表示する機構であり、credentialを作らないS-380だけではplayerが選べる候補を出せない。
- G-037 / S-390の独立stage候補はG-036 / S-380へ統合する。S-390を別stageとして実装せず、G-037は統合履歴としてのみ残す。
- passkey cleanup、専用host名、署名検証、provider残留警告は統合後のS-380へ戻す。`signalUnknownCredential()`はbest effortであり、削除を保証しない。
- 再変更（2026-07-19）: no-match requestとAbortSignal中断は問題として採用するが、Conditional UIの3箱と同じstageへ置くかは実際の操作感を確認してから決める。G-037 / S-390をrequest lifecycle用の仮配置として復活させる。

#### 統合案: WebAuthn Conditional UI

- 状態: Conditional UIを使うpasskey3箱を採用。no-match / abortの2箱も採用し、同一stageか別stageかは技術スパイク待ち。
- S-380はdisposable passkeyを使うLabs stageとし、`PublicKeyCredential.isConditionalMediationAvailable()`または `getClientCapabilities().conditionalGet` で事前検出する。
- S-380のpasskey icon、lock iconと3つの問題箱は同じstage pageに置き、各操作のために別pageへ遷移しない。
- passkey iconは明示的な作成操作とする。クリック前にprovider残留、同期可能性、削除保証がないことを説明し、同意後にdiscoverable credentialを1つ作る。
- lock iconは見た目をbutton状にするが、Conditional UIを確実にbrowserへ関連付けるため `autocomplete="username webauthn"` を持つ実inputまたはそのlabelを操作面にする。playerがlock面を押すとinputへfocusし、browserのautofill候補からpasskeyを選べるようにする。独自のpasskey pickerは描画しない。
- stage入場後または前requestの終了後に `navigator.credentials.get({ publicKey, mediation: "conditional", signal })` を1件だけpendingにしてよい。inputを自動focusせず、候補表示はplayerがlock面を触れた後にだけ発生させる。
- Conditional requestでは `allowCredentials`を省略する。仕様上conditional mediationではdiscoverable credentialだけが候補となり、non-discoverable credentialをこの導線へ使わない。
- `S-380-B01` 保存箱: passkey iconから `navigator.credentials.create()`がPublicKeyCredentialを返し、credential ID、SPKI公開鍵、COSE algorithmと必要transportのlocal registration recordをIndexedDBへcommitできた場合に開く。provider作成後にlocal保存が失敗した場合は開かず、orphan cleanupを案内する。
- `S-380-B02` 利用成功箱: playerがlock面を押し、browser autofillからBusyboxのpasskeyを選択する。device verification後に返されたassertionのcredential ID、type、challenge、origin、RP ID hash、UP / UV flags、signatureをlocal公開鍵で検証できた場合に開く。promise resolveだけでは開かない。
- `S-380-B03` 利用不成立箱: 有効なlocal credential recordがある状態で開始したpasskey利用requestが `NotAllowedError`で不成立になった場合に開く。cancel、verification拒否、利用可能な鍵なしなどを区別できないため、生体照合失敗とは表現しない。単にautofill popupを閉じ、conditional promiseがpendingのままなら開かない。
- `G-037-B01` no-match箱（仮にS-390-B01）: passkey作成とは独立して、実在credentialと一致しないstage生成の乱数IDを `allowCredentials`へ指定したnon-conditional `get()`を明示操作から開始する。その専用requestが `NotAllowedError`でrejectされた場合に開く。Conditional UIは仕様上credential ID filterを使わないため、この箱は `mediation: "conditional"`を使わない。
- `G-037-B02` 中断箱（仮にS-390-B02）: conditional requestがpendingの間に、同じpage上の回路をplayerが切る。対応する `AbortController.abort()`によってrequestが実 `AbortError`でrejectされた場合に開く。自動timer、stage入場直後のabort、例外のsimulationでは開かない。
- S-380-B03とG-037-B01は同じ `NotAllowedError`でも、appが発行したrequest modeを区別する。前者は保存済みcredentialを利用する文脈、後者は乱数no-match IDだけを指定した文脈であり、別request IDの結果を流用しない。
- G-037-B02をS-380へ統合する場合も別S-390へ置く場合も、Conditional UIはmodal dialogを即時表示せずannotated inputのautofill候補として待機する性質を使う。別tabとBroadcastChannelは要求しない。
- 1度に走らせるWebAuthn requestは1件だけとし、requestがsettleした後に新しいchallenge、request ID、AbortControllerで次を開始する。
- 離脱時はpending requestをabortし、listenerとlocal request stateを破棄する。ただし通常のstage cleanupが発生させた `AbortError`はG-037-B02に数えず、playerが問題内の回路を切った操作との因果がある場合だけ解決する。
- S-380を本番提供する前にBusybox専用host名を割り当てる。cleanup UIではSignal APIとlocal record削除を提供し、provider側の手動削除方法も案内する。

#### ステージ境界の技術スパイク

- 採否は確定済みで、検証対象は配置だけとする。no-matchとabortが成立しても、問題自体を再度採否相談には戻さない。
- Variant A: S-380同一pageへ5箱を置き、passkey create / Conditional use / failureとrequest lifecycleを一つの操作盤で比較する。
- Variant B: S-380をpasskey3箱、仮S-390をcredential-less request2箱に分ける。S-390のabort用conditional requestは、候補表示を成功条件にせずpending lifecycleだけを使う。
- 比較項目は、playerが各iconの役割を混同しないか、同じ `NotAllowedError`の2箱に意味の差が出るか、5箱が過密でないか、S-390単独でもbrowser固有の発見が成立するか、request直列化とcleanupが理解可能かとする。
- Chrome、Firefox、Safariのdesktop / mobileで両variantを触り、結果をこの台帳へ記録してからstage IDを確定する。成功条件を緩めたsimulationや代替クリアは作らない。

#### 体験確認用の既存資料

- [WebAuthn.io](https://webauthn.io/)はregistration、authentication、user verification、attachment、discoverable credential設定を試せる。実端末でregistrationするとcredentialが残りうる。
- [Chrome DevTools WebAuthn Virtual Authenticator](https://developer.chrome.com/docs/devtools/webauthn/)を有効にしてWebAuthn demoを使えば、実端末のproviderではなく仮想authenticatorへcredentialを作り、DevToolsから削除できる。設計確認用であり、一般playerの解法にはしない。
- Web Platform Testsには [`navigator.credentials.get()`のabort test](https://chromium.googlesource.com/external/w3c/web-platform-tests/+/refs/tags/merge_pr_51544/webauthn/getcredential-abort.https.html) があり、pending requestを `AbortController`で中断して `AbortError`になることを自動検証する。ただしcross-tab操作を見せる一般向けdemoではない。

## 再利用候補

### QRまたは一時視覚パターン

- 状態: 未割り当て
- BB-017の採用とは切り離し、QRや誤り訂正付き視覚パターンそのものは他の独自問題へ利用してよい。
- 画面撮影の代用品として無理に使わず、cameraでの読取り、別端末との受け渡し、日替わりpayload、画像内探索など、視覚的な情報伝送自体が体験の核になる項目で再評価する。
- 実装先、問題箱数、decoderは未決定。標準APIだけへ固定せず、対応差がある場合は利用可能な環境を明記する。

### 複数audio outputへのrouting

- 状態: MDN監査時に再評価
- BB-018–021の置換として提案したが、native media player操作を使う方向へ変更したため、この機構には割り当てない。
- [Audio Output Devices API](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Output_Devices_API)自体は未採用として捨てず、MDN全件監査でExperimental / Labs候補として別途評価する。

## 直前の相談

### BB-022 実装方式の再選定

- 状態: 5問題採用、stage境界だけ技術スパイク待ち
- 決定: G-036のpasskey保存、Conditional UI利用成功、保存済みpasskey利用不成立と、G-037のno-match拒否、pending request中断をすべて問題として採用する。
- 仮配置: S-380をG-036の3箱、S-390をG-037の2箱とする。技術スパイクで一体の操作盤が優れる場合はS-380の5箱へ再統合する。
- 未決定: 3箱＋2箱か5箱かのstage境界、各iconと箱の最終配置、hint、passkey作成前copy、cleanup提示時点。

## 確定した直近の相談

### BB-032 system clockを戻す

- 初期評価: △。`Date.now()`はsystem clockの変更を反映しうるが、通常のWebページは正しい外部時刻や、ユーザーが時計設定を変更したという直接eventを持たない。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・新規ステージ計画
- 現行機能の境界:
  - [`Date.now()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)はUnix epoch基準のwall clockであり、systemまたはuserによる時計補正の影響を受けうる。
  - [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)はtime originからの単調増加clockで、同じ実行文脈ではsystem clock調整の対象にならない。両者を同時にsampleすれば大きなclock driftを推定できる。
  - [High Resolution Time Level 3](https://www.w3.org/TR/hr-time-3/)もwall clockを使う設計はuserによる前後調整を考慮するよう要求する一方、monotonic clockは複数のuser agent実行をまたぐ永続的な正解時刻としては使えない。
  - clock変更専用eventはなく、同一document内の差分推定はbrowser終了、OS sleep、長時間background、NTP補正などの影響と実機差を受ける。static hostingだけでは信頼できるserver timeとの比較もできない。
- 決定: wall clockとmonotonic clockの差を使い、1時間遅れのアナログ時計へOS時刻を合わせる箱と、その後正しい時刻へ復元する箱を採用する。

#### 2つの時計案

1. stage入場時に `Date.now()` と `performance.now()`を同時sampleし、baseline wall timeとmonotonic timeを入場memoryだけに保持する。exact timestampは進捗やstorageへ保存しない。
2. 盤面のアナログ時計は `baselineWall + monotonicElapsed - 1時間`から針を描画する。固定画像ではなく秒針まで進めるが、現在の `Date.now()`を再読込して針を動かさない。playerがOS時計を変更しても、目標の針が一緒にずれないようにする。
3. `visibilitychange`、`pageshow`と短いforeground pollingで再sampleし、`wallElapsed - monotonicElapsed`を入場baselineからのclock driftとして計算する。
4. `S-400-B01` 1時間前箱: clock driftが `-60分 ±5分`、すなわち-65分以上かつ-55分以下になった場合に開く。単に5分以上戻すのではなく、アナログ時計が示す約1時間前へ合わせることを要求する。
5. B01が開いた後、盤面のアナログ時計はmonotonic基準の正しい現在時刻へ1時間進める。文章で「戻せ」と直接指示せず、針の変化を復元の手掛かりにする。
6. `S-400-B02` 復元箱: B01を現在の入場で観測した後、clock driftがbaselineの `±5分`以内へ戻った場合に開く。OSの自動時刻または正しい時刻へ戻すcleanupを問題として促す。
7. 2箱は順序を持つ。過去にB01を永続達成済みという事実だけでB02を開かず、現在の入場で巻き戻しを観測してから復元を待つ。
8. ±5分は、OS設定操作中の経過、NTPの小さな補正、timer精度低下を吸収する確定toleranceとする。実機不成立を理由に独断で範囲を広げず、再相談する。
9. page reload、browser process終了、OSによるpage破棄でmonotonic baselineを失った場合は今回の試行を終了する。persistent wall timeや外部time APIによる代替判定は行わない。
10. browserをbackgroundへ送るためtimer callback自体には依存せず、復帰時に現在値を比較する。OS sleep中に `performance.now()`が進むかのbrowser差は人手検証対象とし、sleepを主解法にはしない。
11. stage前に「端末の時刻変更は通信、通知、calendarなどへ影響しうる」「終了後は自動設定へ戻す」ことを説明する。変更方法をOS別に逐語的には案内せず、管理端末など変更不能な環境では未観測のままにする。
12. feature detection不能、document lifecycle切断、閾値未達では箱を開かず、server time、手入力、simulation、skipによる代替クリアは用意しない。

- 対応先: 新規G-038 / S-400。既存S-170はWeb Animation timeline、S-350はmedia timeline、S-220はnavigation種別であり、OS wall clockとmonotonic clockのdrift比較は重複しない。
- 技術スパイク: Windows Chrome / Edge / Firefox、macOS Safari / Chrome / Firefox、iOS Safari、Android Chromeで、background復帰後のdrift、1時間前への変更（許容誤差±5分）、復元、NTP補正、page discardを確認する。
- 現行コードとの差: G-038 / S-400、アナログ時計描画、drift observer、安全説明は未実装。

## 確定した直近の相談

### BB-038 OS設定画面の専用項目

- 初期評価: △。通常のWebページはOS設定画面の専用項目を開いたことや、その設定値を一般的に観測できない。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 取りやめ
- 検討案: 通知権限が `granted`になった後に隠しstageを出し、notificationまたはbrowserのsite settingsから通知をoffにして `Notification.permission`の変化を観測する案を検討した。
- 取りやめ理由:
  - playerが通知を `denied`へ変更すると、pageは再度 `requestPermission()`を呼んでも許可を回復できず、browserまたはOS settingsでplayer自身が解除するまで通知を必要とする他stageが成立しなくなる。
  - OS側でbrowser全体の通知表示だけをoffにした場合は、originの `Notification.permission`が `granted`のまま残りうるため、通知の右クリックまたは省略menuを使った事実をpageから一意に判定できない。
  - [`actions`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification#actions)はpageが定義して `notificationclick`の `event.action`で識別できるが、OS固有の右クリックmenuではなく、BB-062の通知action機構と重複する。
- 既存対応: G-029 / S-090「外からの呼び声」が、stage内の明示操作から通知を表示し、Service Workerのnotification click専用URLを経由してpageへ戻った場合に箱を開く処理を実装済み。通知からアクセスするギミックはS-090だけを正とし、BB-038から箱やclear条件を追加しない。
- 影響: S-090の実装、通知権限、進捗schemaは変更しない。通知権限を意図的に拒否・取消させる問題も追加しない。

## 確定した直近の相談

### BB-062 通知actionを順に選択

- 初期評価: △。persistent notificationの `actions`とService Workerの `notificationclick`で選択されたaction IDを観測できるが、表示できるaction数とUIはbrowser / OS依存になる。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・新規ステージ計画
- 決定: 通知からpageへ遷移せず、2つのnotification actionをService Worker内で順次処理して通知を差し替える、繰り返し挑戦可能な1箱として採用する。

#### 通知だけで完結する反復入力

1. `S-410-B01`のstage pageは左右2記号からなる短い目標列を一度表示する。開始操作時にround ID、目標列、cursor 0を持つpersistent notificationを `showNotification()`で表示する。
2. notificationには `left` / `right`の2 actionを置く。`notificationclick`で `event.action`を読み、actionに `navigate`は指定せず、handlerから `clients.openWindow()`や既存clientの`focus()`も呼ばない。入力中はpageへ遷移しない。
3. 正しいactionならcursorを1進め、同じround tagで次のnotificationを表示する。誤入力ならcursorを0へ戻して先頭から再表示し、回数制限なしで再挑戦できる。
4. 状態はnotificationのstructured-clone可能な `data`と、Service Worker終了に備えた専用IndexedDB recordへ置く。action処理は `event.waitUntil()`でnotification差替えとrecord更新が終わるまで延長する。
5. 最後まで一致した場合、Service Workerが専用の達成inboxへround IDをcommitし、完了を知らせるnotificationへ置き換える。完了通知もpageを自動で開かない。playerが後で通常経路からBusyboxへ戻ると、pageがinboxを一度consumeしてB01を開く。
6. notification本文のclickで `event.action === ""`となった場合は、入力として数えず同じcursorのnotificationを再表示する。S-090専用のnotification click URLへ誤配送しないよう、Service Workerはstage固有tagでhandlerを分岐する。
7. `Notification.maxActions >= 2`を公開前の最低条件とし、2 actionを実表示できないbrowser / OSでは未観測のままにする。page内button、通常リンク、通知本文clickを代替clearにしない。
8. 通知権限を拒否・取消させず、既存の許可状態を変更しない。開始前にPWA / notification action対応条件と、通知が複数回差し替わることを説明する。
9. round取消、stage reset、別round開始時はS-410 tagの通知と専用recordだけを閉じて削除し、S-090や将来の通知stageへ触れない。exact action列や誤入力履歴は進捗・Driveへ保存しない。

- 他候補の結論:
  - `notificationclose`で閉じるたび再出現させる案は、end user close eventがLimited availabilityで、OSの自動整理や一括消去との体験差も弱いため採用しない。
  - `tag` / `getNotifications()`で複数通知の並びを扱う案は、OSが並び・grouping・折畳みを支配し、playerの意図した順序を安定判定できないため採用しない。
  - 現行Notifications Standardのactionは `action`、`title`、`navigate`、`icon`だけで、標準的なinline text replyはない。これは次のBB-063で別途判断する。
- 既存との差: S-090はnotification本体から専用URLへ復帰したnavigationを観測する。S-410はpageを開かずnotification actionだけで有限状態機械を進め、後の通常訪問で達成結果を受け取る。
- 対応先: 新規G-039 / S-410。既存Service Workerのgeneric `notificationclick` handlerはtag-based routerへ変更する必要がある。
- 技術スパイク: Windows Chrome / Edge / Firefox、macOS Safari / Chrome / Firefox、Android Chrome、installed iOS / iPadOS PWAで、2 action実表示、page非遷移、連続差替え、worker再起動、誤入力reset、完了inbox、cleanupを確認する。
- 現行コードとの差: S-410、notification action router、Service Worker用round record / completion inboxは未実装。

#### 追加採用: 通知から戻る金庫

- 状態: 採用・S-410とは別stageとして計画
- 対応先: 新規G-040 / S-420。通知actionを入力装置、通知本文を金庫へ戻る提出linkとして使う。

1. `S-420-B01`のstage pageに金庫と、左右2記号からなる固定長の正解列を視覚patternとして置く。開始操作でround ID、正解列、空の入力列をService Worker用IndexedDBへ保存し、金庫round専用tagのpersistent notificationを表示する。
2. notificationの `←` / `→` actionを押すたび、Service Workerが `event.action`を入力列へappendし、同じtagのnotificationを差し替える。action handlerではpageをopen / focusしない。
3. 入力列は正解列と同じ固定長までとし、上限後の追加actionは無視してnotification本文からの提出を待つ。入力途中でも本文を押して提出できるが、長さ不足として不成立になる。
4. notification本文clickの `event.action === ""`だけを提出操作とする。Service Workerは現在の入力列をimmutableな提出snapshotとしてround recordへcommitした後、round IDだけを含むS-420 URLをopenまたは既存clientへnavigateする。入力列や正解列をURLへ載せない。
5. pageは有効な未消費の提出snapshotをIndexedDBから取得し、正解列と1要素ずつ比較する。直接URL訪問、古いround ID、提出前record、消費済みsnapshotでは判定animationを開始しない。
6. 金庫animationは各入力に対応してdial / tumblerを順番に動かす。全長完全一致なら最後に扉が開いてB01を開く。不一致または長さ不足なら該当位置で止まり、扉を閉じたまま入力列を空へ戻して新しいnotificationを出し、同じroundを回数制限なく再挑戦できる。
7. `prefers-reduced-motion`では移動量を抑えるが、同じ要素順の照合状態と成否を表示し、成功条件は変えない。animation終了eventだけを根拠にせず、照合結果を正として演出完了後に箱へ渡す。
8. success、stage reset、round取消ではS-420のnotification、round record、提出snapshotだけを削除する。通知権限を変更せず、矢印列・正解列・失敗履歴を通常進捗やDriveへ保存しない。

- S-090との差: S-090はnotification本文から戻るだけで開く。S-420は本文click前にService Workerが蓄積したaction列と正解列の照合が必要で、navigation単独では開かない。
- S-410との差: S-410は正誤をService Worker内で逐次判定してpageへ戻らない。S-420は入力列を判定せず蓄積し、playerが本文から金庫へ提出してpage animationでまとめて成否を知る。
- 公開条件: S-410と同じく `Notification.maxActions >= 2`と2 actionの実表示を要求する。page内矢印、query parameter、通常linkによる代替入力・提出は用意しない。
- 技術スパイク: action連打のtransaction直列化、notification差替え、本文click前のsnapshot commit、既存clientへの復帰、重複click、worker再起動、失敗後reset、成功cleanup、S-090 / S-410とのtag分離を対象環境で確認する。
- 現行コードとの差: G-040 / S-420、金庫animation、提出snapshot protocolは未実装。

## 現在の相談

### BB-063 通知からinline返信

- 初期評価: △。現行の標準NotificationActionにはtext input / reply payloadがなく、通知内で入力された文字列をWebのService Workerへ返す共通APIはない。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 取りやめ
- 現行機能の境界:
  - [WHATWG Notifications Standard](https://notifications.spec.whatwg.org/#dictdef-notificationaction)の `NotificationAction`は `action`、`title`、`navigate`、`icon`だけを定義し、text field、reply placeholder、入力値を含むmemberを持たない。
  - [`notificationclick`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event)で受け取れるaction結果は選択されたstring IDであり、OS固有のinline reply文字列を取得する標準propertyはない。
  - actionへ `navigate`を付けてWeb pageの入力欄へ移動することはできるが、通知内返信ではない。既存S-090の通知復帰およびS-420の通知本文提出とも重複する。
- 検討した置換:
  - 2 actionを反復して文字を選ぶ方式は技術的には可能だが、S-410の有限状態入力とS-420の矢印列提出を文字UIへ置き換えただけになる。
  - notification actionからpageを開き、`<input>`、Web Speech、Virtual Keyboardで返信させる方式は、通知を入口にした通常formであり、inline reply固有の操作にならない。
  - `mailto:`、外部messaging app、server webhookへ渡す方式は外部account / app / backendへ依存し、入力完了をstatic Busyboxが安全かつ決定的に観測できない。
- 決定: 取りやめ。Notification APIの範囲はS-090（本文から復帰）、S-410（page非遷移action列）、S-420（action列を本文から提出）で十分に分担できており、別API固有性のない文字入力版は追加しない。
- 採用する場合の条件: 将来、標準 `NotificationAction`にtext replyと入力payloadが追加され、Service Workerがその値を直接受け取れる実装が出た場合だけ再監査する。browser extension APIやnative wrapper固有機能はWeb本編の採用根拠にしない。

## 現在の相談

### BB-064 指定時刻の通知から復帰

- 初期評価: △。通常のWeb page / Service Workerは任意の将来時刻に自力でwakeしてnotificationを表示する標準alarmを持たず、正確な配信にはserver-side Web Pushなどが必要になる。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 取りやめ
- 現行機能の境界:
  - Service Workerは常駐processではなく、browserがevent処理後に停止できる。pageの `setTimeout()`やworker内の待機を将来時刻のalarmとして扱えない。
  - [Periodic Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)の `minInterval`は最短間隔の希望にすぎず、実際のevent時刻はbrowserがsite engagement、network等を考慮して決める。指定分単位の通知判定には使えない。
  - [Notification Triggers](https://developer.chrome.com/docs/web-platform/notification-triggers)の `TimestampTrigger` / `showTrigger`はorigin trial終了後もlaunch未開始で、experimental flagなしの一般playerを対象にできない。
  - [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)はappが閉じていてもserverからbrowser push service経由でService Workerを起動できる。ただしsubscription endpoint、VAPID署名、scheduler、失効cleanupを扱うbackendが必要になる。

#### 案A: server-scheduled Web Pushとして採用

1. stage開始時にserver timeを基準として数分後のtarget slotを割り当て、pageにアナログまたはデジタル時計だけで指定時刻を示す。
2. playerの明示操作で通知権限とPush subscriptionを取得し、backendへround ID、push endpoint、target slotを登録する。endpoint以外の端末識別子は収集しない。
3. schedulerはtarget slot到達時に一度だけ暗号化Web Pushを送り、payloadへround ID、scheduled slot、expiry、server署名を含める。Service Workerは検証可能なpayloadだけを専用のscheduled-push tagでnotificationとして表示する。
4. notification本文から専用URLへ復帰した時、pageは署名、round、未使用、expiryを検証してB01を開く。実配信はOS / networkで遅延しうるため、playerが秒単位の狭い時間窓でtapしたことは要求せず、「指定slotにschedulerが発行した通知から戻ったこと」を正とする。
5. clickまたはexpiry後にsubscription紐付けとround recordをbackendから削除し、client側notification / pending recordもcleanupする。通知権限自体は変更しない。
6. iOS / iPadOSはinstalled Home Screen PWAを前提とし、共通PWA導線を出す。backend、Push、notification等が非対応なら未観測のままとし、client timerやPeriodic Syncを代替clearにしない。

- 長所: appを閉じた状態で指定時刻に外部eventが届くという元の本質を保ち、S-090の即時local notification、S-410 / S-420のnotification action入力とも重複しない。
- 短所: 現在のstatic hosting境界を越え、push endpointという機密性のあるsubscription情報、scheduler運用、VAPID key、abuse対策、削除処理が必要。`decision-log.md`のO-006「server依存APIを本編へ含めるか」を先に確定する規模になる。

#### 案B: 取りやめ

- static Busyboxを維持する場合はこちらを推奨する。page timer、worker待機、Periodic Background Sync、実験flag限定Notification Triggersでは「指定時刻に通知」を確実に観測できない。
- 数分pageを開いたまま待たせてlocal notificationを出す置換は、通常timer問題でありbackground通知固有性がなく、S-090とも重なるため採用しない。

- 決定: backendを用意せずstatic hosting境界を維持するため取りやめ。server-scheduled Push用のstage IDは作成・予約せず、client timer、Periodic Background Sync、experimental Notification Triggersによる近似問題も追加しない。

## 現在の相談

### BB-069 約25分background

- 初期評価: △。background timerの継続には依存できないが、Page Visibilityのhidden開始時刻と復帰時刻の差は比較できる。既存G-018 / S-040「見ない時間」と中心動詞が重なる。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・既存S-040拡張計画
- 現行実装: S-040-B01は `visibilitychange`でhidden時の `Date.now()`をmemoryへ置き、同じdocumentがvisibleへ戻った時に2秒以上なら開く1箱。background中のtimer callbackには依存していない。
- 決定: 新規stageを作らず、S-040へ `S-040-B02` 長い不在箱を追加する。

#### S-040 2箱への拡張案

1. B01の2秒条件は入門箱として残す。B02は同一documentが連続してhiddenだった時間が25分（1,500,000ms）以上でvisibleへ戻った場合に開く。
2. hidden遷移時に `performance.now()`をmemoryへ保存し、visible復帰eventで現在値との差を一度だけ比較する。background中に `setTimeout()`、`setInterval()`、`requestAnimationFrame()`を動かし続けない。
3. B01も `Date.now()`から同じmonotonic計測へ変更する。OS wall clockの手動変更、NTP補正、S-400の1時間巻き戻しでS-040が誤って開かないようにする。
4. 25分以上に上限は設けない。25分経過直後に戻る精密操作は要求せず、background throttlingや復帰操作の遅れを不正解にしない。
5. hidden中にpage reload、navigation、browser process終了、OSのpage discardでdocument memoryを失った場合は試行終了とする。IndexedDB、sessionStorage、wall clockへ開始時刻を保存して再訪をbackground扱いにしない。
6. tab切替、window最小化、別appへの切替、screen offなど、user agentがdocumentを実際に `hidden`と報告した経路は同じ入力として扱う。blur / focusだけでは開始・終了しない。
7. `performance.now()`はmonotonicでwall clock調整を受けないが、OS sleep中に進むかはbrowser / OS差が残る。主条件はdocument hiddenでありsleepを要求しない。実機PoCでsleep非加算が判明しても `Date.now()`へfallbackせず、その環境では画面offでなくtab / app切替による25分を使う。
8. B01 / B02は別訪問で累積達成できる。再挑戦時は今回のhidden intervalを再計測し、過去の25分記録だけで入場直後に開かない。

- 既存との差: 新規APIや新しい中心動詞はないためG-018 / S-040へ統合する。S-400はwall clock変更そのもの、S-040はPage Visibilityが報告した連続hidden intervalを観測する。
- 現行コードとの差: S-040-B02のproblem定義、monotonic化、25分表示 / hint、境界testは未実装。
- 人手確認: 2秒 / 25分境界、複数回hiddenの非加算、reload / discard、OS時計変更、tab切替、最小化、mobile別app、screen off、再入場をH-013 / H-022 / H-025で確認する。

## 現在の相談

### BB-070 OSメディア操作から音声停止

- 初期評価: △。Media Session APIのaction handlerでOS / browserが送る `pause` actionを受け取れるが、Control Center、lock screen、hardware media keyなど操作元を標準APIで区別できない。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・新規ステージ計画
- 現行機能の境界:
  - [`navigator.mediaSession.setActionHandler("pause", handler)`](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler)は、deviceのonscreen / physical media controlsから届くpause actionをhandlerへ渡せる。
  - [Media Session Standard](https://w3c.github.io/mediasession/#actions-model)はaction sourceをplatformまたはuser-agent UI surfaceと定義するが、page callbackの `MediaSessionActionDetails`にsourceを公開しない。Control Center、lock screen、headset、keyboard media key、browser chromeを区別できない。
  - 一部browser / OSは電話着信などのsystem interruptionをpause actionとしてdispatchしうる。playerの明示操作だったと断定できない。
- 決定: 新規G-041 / S-430の1箱として、「Control Centerを使う」ではなく「page外のMedia Session pause actionを受ける」問題へ再設計する。native video playerのcontrols / pause eventは判定に使わない。

#### 外側のpause案

1. stage pageに、Busyboxがclientで生成した短いloop音源を持つcontrolsなしの `<audio>`と、再生開始buttonを置く。user activationから再生し、copyrighted音源、microphone、network audioは使わない。
2. 再生開始時にBusybox専用の `MediaMetadata`、`navigator.mediaSession.playbackState = "playing"`、`pause` / `play` action handlerを登録し、OS / browserのmedia control surfaceへsessionを出す。
3. `S-430-B01`は、音源が実際にplayingの間に登録済みMedia Session `pause` handlerが呼ばれ、そのhandlerがaudioをpauseしてplaybackStateを`paused`へ更新した場合だけ開く。
4. `<audio>`の通常 `pause` event、page内cleanup button、stage離脱、autoplay失敗、audio終了、visibility変化だけでは開かない。page内に音を止める安全buttonは用意するが、それはcleanupでありclearにはしない。
5. Control Center、lock screen、hardware key、headset、browser media UIのどこから届いたpause actionでも同じ入力として扱う。UI copyでも「外側の停止」と表現し、Control Center限定・player起因とは主張しない。
6. system interruptionもsourceを区別できないため、pause handlerが呼ばれれば同じ観測として開きうる。この境界を受け入れられない場合は成功条件を推測で狭めず、問題自体を取りやめる。
7. `navigator.mediaSession`、`setActionHandler("pause")`、実際のexternal media controls表示を公開条件とする。native `<video controls>`、page内pause、visibilityによる代替clearは用意しない。
8. reset / 離脱時はaudioをpauseし、action handlersへ`null`を設定し、metadataとplaybackStateを戻し、生成Blob URLをrevokeする。再入場時は新しいsessionから再挑戦する。

- 既存との差: S-350-B03はpage内のnative video controlsでplay後の`pause` eventを観測する。S-430はcontrolsなしaudioに対してMedia Session action handlerが呼ばれた事実を観測し、media element eventだけでは開かない。
- 現行コードとの差: G-041 / S-430、generated loop audio、Media Session handler、external controls用metadataは未実装。
- 技術スパイク: Windows / macOS / iOS / Androidのlock screen、notification / control surface、keyboard / headset、browser media UIでpause handler、background playback、system interruption、cleanupを確認する。

## 現在の相談

### BB-026 home画面上の位置から起動

- 初期評価: △。Web App Manifest / Launch Handlerはinstalled PWAの起動経路やtarget URLを扱えるが、OS home screen上のicon座標・page・folder位置はWebへ公開されない。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・既存S-310拡張計画
- 現行機能の境界:
  - Web page / installed PWAは、自身のiconがhome screenの何行何列、どのpage / folderへ置かれたかを取得できない。icon移動eventもない。
  - [Web App Manifest `shortcuts`](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/shortcuts)は、installed PWA iconのlong press / right click等でOS context menuへtaskを出し、選択時にmanifest指定URLでPWAを起動できる。
  - shortcutsの表示有無、個数、順番、context menu UIはbrowser / OS裁量で、pageから「menuに実表示された」とfeature detectできない。
  - 既存S-080はstandalone display mode、S-310-B01は任意のstage-scoped URLがLaunchQueueへ渡されたことを観測済み。shortcut URLだけを受ける新規stageはLaunch Handlerの重複になる。
- 決定: 新規stageを作らずS-310へ `S-310-B02` PWA shortcut専用URL箱を追加する。

#### icon menuからの入口案

1. manifestの `shortcuts`先頭へ、短い固有名とiconを持つBusybox専用shortcutを1つ追加する。URLはscope内の `./index.html?stage=S-310&launch=shortcut`とする。
2. S-310 pageには、installed Busybox iconをlong press / right clickすることを示す非言語clueと共通PWAインストール導線を置く。通常page内にshortcut URLのclickable linkは置かない。
3. installed PWAのshortcutが選択され、既存 `launch_handler.client_mode = "navigate-existing"`経由のLaunchQueue consumerへ `stage=S-310&launch=shortcut`のtarget URLが渡された場合にB02を開く。
4. S-310-B01の既存 `launch=busybox` URL再起動箱は残す。B01は外部URLからinstalled appを再起動、B02はinstalled app iconのmanifest taskから起動という別入口にする。
5. 通常browser tabで同じqueryへ直接navigateしただけではB02を開かず、現在のdocumentが受け取ったLaunchParamsを要求する。ただし標準LaunchParamsは「manifest shortcutが発生源だった」というsource fieldを持たないため、別経路で同一shortcut URLをinstalled PWAへdeep-linkした場合までは区別できない。
6. shortcutはinstall時にmanifestから登録され、manifest更新がinstalled UIへ反映される時期はbrowser / OS依存になる。既存installを更新した実機では再インストールが必要か確認し、必要なら共通PWA案内に明示する。
7. shortcut非対応またはcontext menuに実表示されない環境では未観測のままとし、page内button、通常link、S-080のstandalone判定による代替clearは用意しない。

- 既存との差: S-080は「installed表示モード」、S-310-B01は「URLをinstalled PWAがLaunchQueueで受信」、B02は「manifestにOS taskとして登録されたicon menu入口」を体験の中心にする。判定APIは同じLaunchQueueなのでS-310へ統合する。
- 現行コードとの差: manifest shortcut、S-310-B02、shortcut用clue、既存install更新説明は未実装。
- 人手確認: Windows / Androidを中心にicon context menu表示、shortcut icon / label、cold / warm launch、LaunchQueue target、manifest更新、通常URL非clear、cleanupをH-005 / H-021 / H-023 / H-025で確認する。

### PWA起動周辺の追加監査

- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 現行の公開仕様とbrowser資料を全件監査。独立性のある4案を維持し、ChromeOS限定の1案を撤回
- 監査範囲:
  - [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)の現行member一覧
  - [Manifest Incubations](https://wicg.github.io/manifest-incubations/)のlaunch / OS integration member
  - [Chrome PWA navigation management](https://developer.chrome.com/docs/capabilities/pwa-navigation-management)と各capability資料
  - Microsoft EdgeのPWA OS integration資料

| 機能 | 判定 | 対応 |
| --- | --- | --- |
| `start_url` / `display-mode: standalone` | 採用済み | S-080。通常tabとinstalled app表示を分ける |
| same-scope HTTPS link capture / `launch_handler` | 採用済み | S-310-B01。外部のstage-scoped URLをLaunchQueueで受ける |
| manifest `shortcuts` | 採用済み | S-310-B02。icon context menuの専用URLを受ける |
| `note_taking.new_note_url` | 採用 | S-310-B03。「新規メモ」OS入口の専用URLを受ける |
| `share_target` | 採用済み | S-240-B02。OS share sheetからround URLを受ける |
| `file_handlers` / `LaunchParams.files` | 採用 | 新規G-042 / S-440。OSで鍵fileを開く |
| `protocol_handlers` | 採用 | 新規G-043 / S-450。`web+busybox:` URLで呼び出す |
| Window Controls Overlay | 採用 | 新規G-044 / S-460。titlebar実領域を盤面にする |
| Tabbed Application Mode / `tab_strip` | 取りやめ | ChromeOS限定機能を問題にしない方針のためG-045を閉じ、S-470は予約しない |
| navigation capturingの`client_mode`差 | 新規問題なし | manifestは同時に1方針しか選べず、現行`navigate-existing`をS-310で扱う。mode差だけの追加問題は作らない |
| `scope_extensions` / cross-origin link capture | 保留・stageなし | 追加originの`/.well-known/web-app-origin-association`が必要で、cross-originをapp scope内に見せる機能。起動sourceの新payloadはなくS-310-B01と重なる |
| `url_handlers` / `handle_links` | 不採用 | `url_handlers`は廃止方向、後継は標準化・実装中。same-scope HTTPS link captureはS-310-B01で扱う |
| OS login時の自動起動 | 不採用 | Edge等のuser設定として存在するが、pageへ「login起動だった」という標準source情報は渡らず、通常`start_url`起動と区別できない |
| App Actions on Windows | 不採用 | packaged / Store / OS固有の統合で、Web側は既存`share_target`、`protocol_handlers`、`launch_handler`の合成になる |
| `getInstalledRelatedApps()` | 新規問題なし | install状態の問い合わせであり起動入口ではない。S-080と共通PWA導線の補助に限る |
| install prompt / badge / notification / offline | 起動監査外 | 既存の共通install導線、S-210、S-090 / S-410 / S-420、S-070で扱う |

#### S-310-B03 新規メモ入口

1. manifestに`"note_taking": { "new_note_url": "./index.html?stage=S-310&launch=new-note" }`を追加する。
2. OS / browserがinstalled Busyboxへ「新規メモ」affordanceを実表示し、それがLaunchQueueへ専用target URLを渡した場合にB03を開く。
3. [MDN `note_taking`](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/note_taking)が明記する通りmemberはexperimentalで、user agentはhintを無視できる。入口のない環境では未観測のままにする。
4. 標準LaunchParamsに「note-taking入口だった」というsource fieldはない。専用URLとLaunchQueue callbackを要求するが、別経路で同じURLをinstalled PWAへ渡した場合まで暗号学的には区別できない。
5. B01は通常deep link、B02はapp icon shortcut、B03はOSのnote-taking taskという入口の体験差で分担し、同じLaunch Handler stageへまとめる。

#### S-440 ファイルの鍵

1. manifest `file_handlers`で専用action URL、MIME `application/x-busybox`、既存formatを横取りしない固有拡張子`.busybox`を登録する。
2. stageはround nonceとversionだけを含む小さな`.busybox` fileをclient内で生成し、playerの明示操作でdownloadする。serverへ送らず、個人情報を入れない。
3. playerがfile managerの「開く / Open with」からinstalled Busyboxを選び、[LaunchQueueの`LaunchParams.files`](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA)へ実file handleが渡された場合だけ読む。
4. file内容、armed round、action URLが一致した時にB01を開く。通常の`<input type=file>`、drag-and-drop、file名だけのqueryでは開かない。
5. 現行標準が定義するのはOSのfile-opening actionによるlaunchであり、fileをapp iconへdropするだけで未起動PWAをlaunchする共通Web APIはない。起動済みpageへのHTML Drag and Dropは別機構なので、BB-086の相談まで分離する。
6. File Handlingは現時点でChromium系desktop限定だが特定OS限定ではない。関連付けの許可取消、default app競合、複数file、cold / warm launch、file削除案内を技術スパイクする。

#### S-450 別の名前で呼ぶ

1. manifest `protocol_handlers`でcustom scheme `web+busybox`とscope内handler URLを登録する。
2. stageの明示操作でmemory上のround nonceを含む`web+busybox:open?...`をtop-levelに開く。programmatic iframeでは発火させない。
3. browser / OSのhandler確認を経てinstalled Busyboxが起動し、展開後のhandler URLとLaunchQueue targetから同じnonceを受けた場合にB01を開く。
4. handler HTTPS URLへの直接遷移、nonceなし、期限切れroundは未クリア。handler登録や既定app選択をpageから列挙しない。
5. [ChromeのProtocol Handler資料](https://developer.chrome.com/docs/web-platform/best-practices/url-protocol-handler)が示す初回許可、拒否、登録解除、別handler競合を実機確認する。

#### S-460 窓の上辺

1. manifestの`display_override`へ`window-controls-overlay`を追加する。desktopにinstalledされた対応PWAだけを対象にする。
2. [Window Controls Overlay API](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API)の`visible`と`getTitlebarAreaRect()`を読み、titlebarの実矩形内に小さな箱を配置する。
3. 箱だけを`app-region: no-drag`相当にし、overlayがvisibleかつpointer座標が最新矩形内にある実clickでB01を開く。通常standalone window、CSSだけの模擬titlebarでは開かない。
4. `geometrychange`でOSごとのwindow controls位置とresizeへ追従し、close / maximize領域を覆わない。離脱時にlistenerを破棄する。

#### ChromeOS限定案の撤回

- Tabbed Application ModeはWebとして実装可能だが現時点でChromeOS限定のため、ユーザー方針により取りやめる。G-045は履歴のみ残し、S-470はstage IDとして予約しない。
- 共通実装差: manifestへ`note_taking`、`file_handlers`、`protocol_handlers`、`display_override`を追加し、LaunchParams型を`targetURL`だけでなく`files`へ拡張する必要がある。S-440〜S-460は全て未実装。
- 共通導線: S-240 / S-310と同じPWA案内を各stageから開けるようにし、installed PWAが必要な理由、manifest更新後の再installが必要になり得ること、対象OSを明記する。install自体はclear条件にしない。
- 共通方針: 非対応環境では未観測のままとし、通常URL、file input、page内模擬OS UI、別APIによる代替clearやskipを用意しない。

### BB-027 OS文字サイズ

- 初期評価: △から採用へ変更。従来はOS文字倍率を標準的に読む方法がなかったが、現行CSS Fonts Level 5とHTMLにpreferred text scaleの経路が追加された。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 採用・新規G-046 / S-480技術スパイク待ち
- 現行機能の境界:
  - [MDN `<meta name="text-scale">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/text-scale)の`content="scale"`は、OSまたはuser agentで選ばれた文字サイズをfont-relative sizeへ反映するようbrowserへ伝える。
  - [CSS Fonts Module Level 5](https://www.w3.org/TR/css-fonts-5/#text-scale)では、`font-size: medium`を`16px × text scale factor`として計算し、`env(preferred-text-scale)`も同じ倍率を返す。
  - これはOS設定だけを識別するAPIではない。browser既定文字サイズも正当なuser preferenceとして合成されるため、問題名とclueは「OS設定」ではなく「あなたの文字の大きさ」にする。
  - 新しい機能で実装差が大きく、設定変更が開いているdocumentへ即時反映されるかもbrowser / OSごとに実機確認が必要。従来の`text-size-adjust`だけではmobile text inflationとの区別がつかない。
- 決定: 新規G-046 / S-480の4箱として、preferred text scaleを小・標準・大・特大の4帯へ対応させる。

#### 4段階の文字目盛り案

1. Busybox documentへ`<meta name="text-scale" content="scale">`を設定し、stageの文字と箱配置は`rem` / `em`および`font-size: medium`を基準にする。固定pxで設定を打ち消さない。
2. `font-size: medium`のcurrent computed sizeを標準16pxで割ったscaleとして読む。初期境界はB01小`<0.90`、B02標準`0.90以上1.20未満`、B03大`1.20以上1.50未満`、B04特大`1.50以上`とする。
3. 4段のeye-chart風typographic clueを置き、current bandに対応する行だけが箱と視覚的につながる。slider、倍率表示、page内文字サイズbuttonは置かない。
4. 入場時から該当帯にいるplayerは、その箱を直ちに開く。設定変更がlive反映されれば同じdocumentで再評価し、reloadが必要なbrowserでは再入場後に別帯を開く。
5. `env(preferred-text-scale)`をlayoutへも使える環境では、文字の成長と箱の接続を連動させる。判定はCSS文字列の存在ではなくcurrent computed size / geometryで行う。
6. exactなfont size、OS種別、accessibility設定名は保存しない。小・標準・大・特大のband IDだけを問題箱へ渡す。
7. 非対応環境では未観測のままとし、browser zoom、page内slider、viewport resizeを代替clearにしない。

- 既存との差: font loading問題や画面zoomではなく、OS / UAのpreferred paragraph text sizeがCSS cascadeへ入った結果を使う。
- 技術スパイク: Android Chrome、iOS / iPadOS Safari、Windows Chrome / Edge / Firefox、macOS Safari / Chrome / Firefoxで、各離散設定が4帯へ到達するか、境界丸め、live update、reload後反映、zoom非clear、200% accessibility layoutを確認する。PoCで到達不能な隙間が判明した場合は箱数を減らさず境界だけを調整する。
- 現行コードとの差: `text-scale` meta、preferred scale対応layout、G-046 / S-480は未実装。

### BB-079 iOS Spotlight検索

- 初期評価: △ではなく、標準Webだけでは元の中心動詞を観測不能。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 取りやめ
- 現行機能の境界:
  - [Core Spotlight](https://developer.apple.com/documentation/corespotlight/adding-your-app-s-content-to-spotlight-indexes)でapp固有contentを端末indexへ登録し、検索result actionを受けるAPIはSwift / Objective-Cのnative frameworkで、Web pageやinstalled PWAへ公開されていない。
  - 公開Web contentは[ApplebotのWeb markup](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/WebContent.html)によりSpotlight / Safari結果へ出る可能性がある。しかしcrawl、ranking、表示時期、query、実表示をsite側で制御できない。
  - Web検索resultが通常HTTPS URLを開いても、pageへ「Spotlightから選ばれた」という標準launch sourceや署名済みpayloadは渡らない。referrerやquery parameterは欠落・模倣でき、クリア根拠にできない。
  - site内検索へ置換するとOS検索という本質がなくなり、S-310のdeep linkや通常navigationと重なる。
- 決定: BB-079は取りやめる。Applebot向けmetadataを製品discoverabilityのために整備する可能性は残すが、問題箱の条件にはしない。
- 代替clear / skip: 作らない。

### BB-080 OSスクリーンショットへQRを埋める

- 初期評価: △ではなく、元の挙動は標準Webで観測不能。
- 調査日: 2026-07-19
- 決定日: 2026-07-19
- 状態: 元のscreenshot機構は取りやめ・独立Clipboard案をS-500へ採用。既存S-180は別のClipboard往復問題として維持
- 現行機能の境界:
  - Web pageはOSが生成するスクリーンショットfileや撮影pipelineへ介入できず、撮影後の画像へQRを追加できない。
  - QRをpage上へ常時描画すれば撮影画像へ写るが、撮影eventを受け取れないため、箱を開く根拠にはならない。撮影時だけ現れるという発見も失われる。
  - 画像を明示exportして再upload / pasteさせる案はBB-017で不採用済みで、S-130のfile往復、S-180のpaste、S-190のscreen captureとも近い。
  - QR / 視覚pattern自体は再利用候補として残しており、camera読取り、別端末間転送、日替わりpayloadなど、視覚情報伝送が中心になる独自問題へ割り当てる。
- 決定履歴: BB-080のscreenshot / QR機構は取りやめ、QR再利用候補を維持する。「表示とは異なる内容がclipboardへ入る」Caesar案は当初S-180再設計として採用したが、D-055で新規G-048 / S-500へ分離した。
- 代替clear / skip: 作らない。

#### S-180 逆順鍵の見えない受け渡し

1. stage上のcopy操作で`navigator.clipboard.writeText("xobysub")`を呼び、`busybox`を文字順だけ逆にした鍵をsystem clipboardへ書く。write成功だけでは開かない。
2. playerはpage外の任意の編集面で`xobysub`を`busybox`へ直し、その結果を再copyしてstageへ戻る。stage内に修正欄やpaste欄は用意しない。
3. S-180-B01の箱自体をclickまたはkeyboard activationした時だけ`navigator.clipboard.readText()`を呼び、case-sensitiveかつtrimなしで`busybox`と完全一致した場合に開く。
4. 自動polling、visibility復帰、paste event、query parameterでは判定しない。read拒否、空clipboard、前後空白、大小文字違いは未解決のままにする。
5. clipboard内容と編集履歴は保存しない。離脱時もplayerのclipboardを無断上書きしない。

- 現行コードとの差: 現在はround固有`BOX-XXXXXXXX`のwrite成功でB01、同じtokenのinput pasteでB02を開く。固定の逆順鍵を外で修復し、箱clickで読み戻す1箱へ統合する。

#### S-500 Caesar暗号の紙片

1. 入場ごとに`busybox`を1回だけ含む短いASCII平文、1〜25のshift、暗号文をmemoryで生成する。画面には一見randomな暗号文だけを表示し、平文やshift値をDOM、URL、storageへ置かない。
2. playerが暗号文block全体を選択してOS / browserのcopy操作を行った場合だけ、[trusted `copy` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/copy_event)の`clipboardData.setData("text/plain", plaintext)`でclipboard内容を平文へ差し替え、defaultの暗号文copyを`preventDefault()`する。
3. 部分選択、別要素、synthetic copyでは平文を渡さない。copy成功そのものでは箱を開かない。
4. 同じstageの空の紙面へ実pasteした時、`paste` eventのtextがmemory上の平文と完全一致した場合だけ、その値をHTMLとして解釈せずstatic text nodeとして表示する。直接typingやprogrammatic DOM注入では進めない。
5. [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection_API)で、単一Rangeの両端がその貼付け結果text node内にあり、選択文字列がcase-sensitiveで正確に`busybox`だけの場合にS-500-B01を開く。ページ内のstage名、clue、他の`busybox`文字列を選んでも開かない。
6. S-030は目に見える語を直接選ぶ純Selection問題、S-180は逆順鍵を外で修復して読み戻すClipboard API問題、S-490はplaceholderを使う直接入力問題として残す。
7. round平文、暗号文、shift、貼付け内容、選択範囲は保存しない。離脱時にlistenerとmemoryを破棄する。非機密な平文がsystem clipboardへ残るが、cleanupのためにplayerのclipboardを無断上書きしない。

- 技術根拠: `ClipboardEvent.clipboardData`によるcopy内容の差替えとpaste内容の取得はBaselineで、Selection APIの`selectionchange`とRange境界でtarget DOM内のexact selectionを確認できる。
- 現行コードとの差: G-048 / S-500は未実装。暗号文selection、copy override、static paste sheet、target-contained Rangeを持つ新規1箱として追加する。

#### S-490 `busybox`鍵語の導入

- placeholderが`busybox`のtext inputへ同じ小文字列を完全一致で入力すると1箱だけ開くG-047 / S-490を、S-180やS-500とは別に置く。
- typingとpasteは区別せず、IME composition中を除くcurrent valueだけを判定する。入力値と履歴は保存しない。
- stage mapではS-490からS-500へ手掛かりの継承edgeを引くが、S-500をunlock制にせず、到達順を強制しない。S-180も`busybox`を復元する別の手掛かりとしてS-500へ接続できる。
- 目的はS-500の答えをstage内で明記することではなく、別stageで一度見た固有語を思い出す余地を作ることにある。

## 独自追加案: Screen Capture画像マーカー

- 調査日: 2026-07-19
- 状態: page markerはS-190-B04として採用確定。notification markerは実機PoC待ちで未確定。
- page marker: round固有の高contrast markerをmind map型stage一覧の外縁へ描画し、user-selected display streamの実frameからCanvas decodeできた時だけ開く。S-190と別tab mapのBroadcastChannel handshake後だけpayloadを描画し、marker DOMの存在、viewport表示、共有開始、URL訪問だけでは開かない。
- notification marker: Service Worker notificationの`image`へ別種markerを入れ、通知欄を含むcapture frameからdecodeする案。Notification imageのLimited対応と、OSが共有映像から通知を隠す可能性があるため、安定してpixelを取得できる対象環境をPoCで確認してから採否を決める。
- page / notificationのmarker payloadは別namespaceとし、少なくとも3連続frameでchecksumを確認する。frame、通知画像、解析画像は保存・送信しない。
- 既存S-190-B01〜B03はpreview / recording / relayというpipelineの問題。この案はstage mapを探索し、capture stream内のpixel contentを認識する問題なので、同じstageへ箱を追加しても中心条件を区別できる。BB-060はこのB04へ統合する。

### BB-086 iMessage stickerのアプリ間D&D

- 初期評価: △。iMessageや他native appのdrag source / destinationはWebから観測できないが、別top-level Busybox context間の実HTML Drag and Dropへ再設計できる。
- 調査日: 2026-07-19
- 決定日: 2026-07-20
- 状態: 採用・新規G-049 / S-510技術スパイク待ち。
- 決定: installed PWAのsource windowでround固有payloadを埋めた小さなPNG stickerを事前生成し、draggableな画像の`dragstart`で同期的に`DataTransferItemList.add(new File(...))`へ載せる。通常browserのreceiver windowの実`drop` eventで`DataTransfer.items`から画像Fileを読み、PNG bytes内のpayloadとcurrent roundが一致した場合に1箱を開く。
- `dragstart`後の非同期`canvas.toBlob()`ではDrag Data Storeを書き換えられないため、Blob / Fileはplayerがdragを始める前にmemoryへ用意する。文字列tokenだけのdropやDOM移動だけでは開かない。
- sourceとreceiverは同一page内の2領域にせず、installed PWA windowから通常browser windowへ渡す一方向に固定する。通常のfile input、download / upload、OSの「開く」は判定外とする。
- S-130はfileをdiskへ書き出して後で再投入、S-440は`.busybox`をOSから開いてPWAをlaunchする問題。本案はdiskへ保存せず、継続中のpointer dragが2つのtop-level context間でFileを運ぶ点で分担する。
- Desktopの現行Chrome、Edge、Firefox、Safariで、script生成Fileがwindow境界を越えて`drop`へ残るかをPoCする。成立しないbrowserへtext payloadやuploadによる代替clearは設けない。
- 技術根拠: [`DataTransferItemList.add()`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList/add)はFile項目を追加でき、drag dataは原則`dragstart`でだけ変更し、`drop`で読み出す。

### BB-009 近接センサーを覆う

- 初期評価: Labsで直接実現可能。camera明度への置換は不要。
- 調査日: 2026-07-20
- 決定日: 2026-07-20
- 状態: 採用・新規G-050 / S-520技術スパイク待ち。
- 現行仕様: 2026-05-14の[W3C Proximity Sensor Working Draft](https://www.w3.org/TR/proximity/)はGeneric Sensor APIを継承する`ProximitySensor`を定義し、`distance`、`max`、`near`をlive readingとして返す。Secure Context、permission `proximity`、Permissions Policy feature `proximity-sensor`を前提とする。
- 推奨案: 明示的な開始操作から`new ProximitySensor()`を生成して`start()`する。少なくとも1回の実readingで「近くない」状態を観測した後、同じsensor instanceの後続readingが`near === true`になった場合にS-520-B01を開く。
- 現行仕様では対象物が検出範囲外の時に`distance`と`near`が`null`になり得る。reading eventを一度も受けていない初期`null`と混同せず、baselineは実reading受信済みであることを要求する。
- distance値は端末差が大きく、仕様も正確な距離計として頼れないとしているため、cm閾値や段階箱は作らない。中心操作を「上部センサーを覆う」1箱へ絞る。
- S-110はcamera frameの平均輝度を暗→明へ変える問題。本案はcameraを開始せず、hardware proximity readingのfar→near transitionだけを使うため分担できる。
- `ProximitySensor`なし、hardwareなし、permission / policy拒否、reading errorでは未観測のままにする。camera、touch、pointer長押しによる代替clearは作らない。
- raw distance、max、reading時刻、端末情報は保存しない。離脱時にsensorを`stop()`し、event listenerと最新readingを破棄する。
- 公開前に実装のあるbrowser / deviceを再調査し、少なくとも1台の実hardwareでfar→near、初期near、遮蔽物素材差、permission取消、visibility、cleanupを確認する。

#### Generic Sensor追加監査

- 調査日: 2026-07-20
- 共通境界: 全候補をSecure Context、実interface、実hardware、permission / Permissions Policy、live readingが揃うLabsとして扱う。非対応時のDeviceMotion、camera、page内sliderなどによる代替clearは作らない。

##### 採用: G-051 / S-530 LinearAccelerationSensor

- X/Y/Zごとに1箱、合計3箱。target axisが他軸よりdominantな正負peakを短いwindowで両方観測すると開く。
- 初期PoC条件は絶対値8m/s²、他軸の1.5倍、正負peak間800ms以内。安全な短い手首の往復で達成できるよう実機調整する。
- 投げる、落とす、物へ打ち付ける操作をヒントや条件にしない。

##### 採用: G-052 / S-540 AmbientLightSensor

- 暗所と非常に明るい環境の2箱を順序なしで独立観測する。初期PoC帯は`<= 50 lx`と`>= 10,000 lx`を1秒維持。
- 仕様はprivacy対策としてilluminanceを少なくとも50 lux単位へ量子化でき、同一光でもdevice差があるため、exact値ではなく実機で到達可能な帯を確定する。
- 太陽を直視する、端末を太陽へ向け続ける、高出力光源へ極端に近づける案内はしない。camera輝度のS-110とは別stageにする。

##### 採用: G-053 / S-550 raw Accelerometerの無重力帯

- `Accelerometer`は重力を含むraw accelerationを返し、free fallでは3軸が0m/s²付近になり得る。この性質を`LinearAccelerationSensor`や`GravitySensor`と混同せず、raw合成値の問題として使う。
- 箱は1つ。`Math.hypot(x, y, z)`が遊びを持った0付近へ短時間入ると開く。初期PoCは2.0m/s²以下を3 reading以上かつ80ms以上とし、3.0m/s²超で候補列をresetする。
- exact 0や1 sampleだけでは判定しない。threshold、必要sample数、継続時間は対応実機のnoiseとsampling rateを比較して調整するが、「raw accelerationが0付近」という中心条件は変えない。
- stage内で端末を投げる、落とす、打ち付ける操作は指示しない。実機PoCには端末を損傷させない試験手順と誤検知確認を含める。
- `GravitySensor`の3軸gravity成分を均等にする案は撤回し、同interface固有のstageは作らない。raw readingと端末情報は保存しない。

##### 採用: G-054 / S-560 Gyroscope

- X/Y/Zごとに1箱、合計3箱。target axisがdominantなangular velocityだけをtime deltaで積分し、同一符号方向の累積が約`2π`になると開く。
- Gyroscopeの単位はrad/sであり、現在姿勢ではなく回転速度を直接読む。逆回転は差し引き、複合的な振りでは進めない。
- 端末を両手で保持した安全な1回転を想定し、高速spinや投擲を要求しない。

##### 取りやめ: G-055 Magnetometer / AbsoluteOrientationSensor

- 2026-05-14版Magnetometer Working Draft自身が、既定で利用可能なbrowser engineはなく、現形のままRecommendationへ進む見込みもないと明記している。
- 金属一般は磁場変化が安定せず、強い磁石を端末へ近づける操作も推奨しない。browser flagを有効にする導線もゲーム条件にしない。
- `AbsoluteOrientationSensor`はaccelerometer、gyroscopeに加えてmagnetometer permissionへ依存するため、同時に新規stageから除外する。

##### 採用: G-056 / S-570 RelativeOrientationSensor

- magnetometerを使わず、開始quaternionから相対X/Y/Z quarter-turnの3 gateを通り、開始姿勢へ戻る1箱案。
- S-560がangular velocityと累積角、S-570はcurrent quaternionの姿勢pathと閉路を扱う。gate角度と開始姿勢への許容角は実機PoCで確定する。

### BB-031 指定語を発話

- 状態: 採用・新規G-057 / S-580技術スパイク待ち。
- microphone iconの明示操作から`SpeechRecognition`を1回開始し、final alternativesのいずれかが正規化後に`busybox`なら1箱を開く。
- 正規化はNFKC、英小文字化、Unicode空白・句読点の除去だけとし、`busy box`のような認識表記差を吸収する。別語、interim result、typed text、録音fileは受け付けない。
- targetは本文へ直接書かず、先行S-490で記憶した語とmind mapのS-490→S-580 clue edgeを使う。到達順は強制しない。
- 既存S-120はWeb Audioで音量・周波数形状を観測し、本案はbrowserのspeech-to-text final resultを観測するため分担できる。
- `SpeechRecognition`はLimited availabilityで、実装は端末内またはserver-based recognitionを選び得る。アプリは音声とtranscriptを保存しないが、browser serviceによる外部処理の可能性を開始前に説明する。
- `processLocally`、`available()`、`install()`は2026年時点で実験的なon-device機能として別途API台帳へ残す。この1箱の必須条件やfallbackにはしない。

### BB-033〜036 出発地点から一定距離移動

- 状態: 採用・新規G-058 / S-590技術スパイク待ち。
- 箱は3つ。開始地点から5m、25m、100mの距離帯へ対応し、順に離れていくと開く。
- GPS driftだけで開かないよう、haversine距離から開始fixと現在fix双方の`accuracy`を引いた下限距離を判定に使う。公称5mでもaccuracyが悪い端末では実際に余分な移動が必要になるが、閾値を偽装したりpointer入力へ置き換えたりしない。
- Web Geolocationはfully activeかつvisibleなdocumentへだけ位置updateを配送する。sleep中の経路は追跡せず、復帰時に現在地を再取得して開始地点との直線距離を比較する。
- mobile OSによるpage discard / reloadでも同じ試行を続けるため、開始座標、accuracy、timestamp、round IDだけを同一tabの`sessionStorage`へ最大24時間保存する。これは位置情報非保存原則の限定例外であり、経路と途中fixは保存せず、Drive同期・外部送信しない。
- 100m箱達成、reset、TTL切れでanchorを削除する。tab / PWA session終了時もsessionStorageと共に失われる。

### BB-051 他アプリでコピーした文字

- 状態: 新規stageは見送り。既存S-180とplayer体験が重複する。
- 2026年のClipboard APIには、system clipboardがページ外で変化し、documentが再びsystem focusを得た時にpending eventを配送できるExperimentalな`clipboardchange`がある。
- しかしS-180は、page外で逆順文字を直して再copyし、復帰後の箱clickで`readText()`する往復をすでに中心操作にしている。イベントで復帰時に自動判定しても、player視点では「外で文字をcopyして戻る」という発見が同じである。
- `clipboardchange`はAPI台帳の監査対象として残すが、BB-051由来の新規Gimmick IDやstage IDは予約しない。S-600は後にBB-055〜057の高度stageへ割り当てた。

### BB-055〜057 高度しきい値

- 状態: 採用・新規G-059 / S-600技術スパイク待ち。
- [Device-Test Geolocation](https://device-test.com/geolocation)は現在の`altitude`を表示し、位置データはbrowser内だけで処理すると明記する。`altitudeAccuracy`は表示しないため、値が出るかの一次確認用とする。
- [OpenLayers公式Geolocation example](https://openlayers.org/en/latest/examples/geolocation.html)は`altitude`と`altitudeAccuracy`をメートル単位で連続表示し、source codeも同じpageで確認できる。地図表示にOpenStreetMap tileを使うため、純粋なlocal-only確認ではない。
- 実機では屋外でhigh-accuracyを許可し、30〜60秒待って`altitude` / `altitudeAccuracy`が数値になるか、静止中のdrift、階移動への追従を記録する。`null`または大きな誤差の場合はその端末での成立根拠にしない。
- 箱は3つ。browser報告高度が100m未満、100m以上500m未満、500m以上の各帯へ入ると対応箱を開き、別訪問で累積する。
- 1 readingのpoint estimateでは判定せず、`altitude ± altitudeAccuracy`の区間全体が同じ帯へ収まるreadingを3回以上かつ5秒以上観測する。境界付近やaccuracyが大きい場所では未観測のままとする。
- browser値はWGS84基準の報告値として扱い、海抜補正、地形API、backend、手入力fallbackは使わない。座標、高度、accuracyは保存・同期・送信しない。

### BB-060 画面探索後にスクリーンショット

- 状態: 既存G-012 / S-190-B04へ統合。
- OS screenshotの撮影eventや保存画像は使わない。mind map型stage一覧そのものを探索面にし、一覧の外縁へround固有markerを置く。
- S-190から別tabでstage mapを開き、playerがpanしてmarkerを見つけ、そのtabを`getDisplayMedia()`で共有する。S-190が実capture frame内のmarker payloadを連続decodeした場合にB04を開く。
- map tabとのhandshake、markerのDOM表示、viewport到達、共有開始だけでは開かない。直接URLや古いmarker画像でもcurrent roundは成立しない。
- 専用探索pageは作らず、mind mapの広がりと「一覧の端」をゲーム盤として再利用する。notification marker B05は別の実機PoC判断として残す。

## 監査キュー

相談順は暫定。完了した判断も履歴として残す。類似機構は個別に判断した後、同じ発見なら1ステージへ統合する。

| 次 | Blackbox ID | 元の機構 | 初期論点 | 状態 |
| ---: | --- | --- | --- | --- |
| 1 | 17 | スクリーンショット検出 | 撮影eventは取得不可。成果物の再入力案も既存問題と重なる | 取りやめ |
| 2 | 18–21 | 消音、音量、ヘッドホン | native video controlsのseek / mute / play-pauseへ置換 | 採用・S-350計画 |
| 3 | 23 | 機内モード、Wi-Fi切断 | 接続種別は問わずbrowser offlineとしてS-070へ統合 | 既存S-070へ統合 |
| 4 | 50 | 端末再起動後に戻る | 元の再起動は廃止し、back_forward / reloadの2箱をS-220へ追加 | 採用・S-220拡張待ち |
| 5 | 58–59 | 通話の発着信と終了 | 生成音声を使うWebRTC接続と明示終了の2箱へ置換 | 採用・S-360技術スパイク待ち |
| 6 | 72 | OS共有シートを2経路で利用 | S-240をWeb Share送出とWeb Share Target受信の2方向へ再設計。BusyboxのPWAインストール導線を含む | 採用・S-240再設計待ち |
| 7 | 81–82 | 画面録画とbroadcast先 | S-190をlive preview、local recording、別tabへのlive relayの3箱へ拡張 | 採用・S-190再設計待ち |
| 8 | 10–12 | バッテリー残量 | charger接続、取り外し、75%以上、75%未満の4箱 | 採用・S-370計画 |
| 9 | 15–16 | OS画面輝度の最小、最大 | 標準APIなし。page内sliderにも置換しない | 取りやめ |
| 10 | 22 | 生体認証を意図的に失敗 | passkey3箱とcredential-less request2箱を採用。5箱統合か3＋2分割かをPoC比較 | 採用・stage境界スパイク待ち |
| 11 | 32 | system clockを戻す | 1時間遅れのアナログ時計へ±5分で合わせ、その後正しい時刻へ復元する2箱 | 採用・S-400計画 |
| 12 | 38 | OS設定画面の専用項目 | 通知権限off案は他の通知stageを阻害。通知からの復帰は既存S-090で扱う | 取りやめ |
| 13 | 62 | 通知actionを順に選択 | pageを開かず逐次判定するS-410と、通知本文から金庫へ提出して一括照合する独自S-420 | 採用・2stage技術スパイク待ち |
| 14 | 63 | 通知からinline返信 | 標準NotificationActionに文字入力payloadがなく、代替案はS-410 / S-420と重複 | 取りやめ |
| 15 | 64 | 指定時刻の通知から復帰 | backendを用意しないためserver-scheduled Pushは不採用。client alarmも成立しない | 取りやめ |
| 16 | 69 | 約25分background | S-040へ2秒B01とmonotonicな25分B02を配置 | 採用・S-040拡張待ち |
| 17 | 70 | Control Centerから音声停止 | native playerではなくMedia Sessionのexternal pause actionを観測 | 採用・S-430技術スパイク待ち |
| 18 | 26 | home画面上の位置から起動 | icon座標は廃止し、manifest shortcut専用URLをLaunchQueueで受けるS-310-B02へ置換 | 採用・S-310拡張待ち |
| 19 | 27 | OS文字サイズ | text-scale meta / preferred-text-scaleを小・標準・大・特大の4箱へ対応 | 採用・S-480技術スパイク待ち |
| 20 | 79 | iOS Spotlight検索 | Core Spotlightはnative限定。Web indexing結果からの遷移sourceも証明できない | 取りやめ |
| 21 | 80 | OS screenshotへQRを埋める | 元機構は取りやめ。表示と異なるClipboard内容のCaesar暗号案は独立S-500の1箱へ採用 | 元機構取りやめ・S-500計画 |
| 22 | 86 | iMessage stickerのアプリ間D&D | installed PWAから通常browserへ生成PNG FileをdragするS-510の1箱 | 採用・S-510技術スパイク待ち |
| 23 | 9 | proximity sensorを覆う | 2026 Working DraftのProximitySensorで実far→nearを読むLabs 1箱 | 採用・S-520技術スパイク待ち |
| 24 | 31 | 指定語を発話 | `SpeechRecognition`で`busybox`を認識し、S-490の鍵語を声で再利用する1箱 | 採用・S-580技術スパイク待ち |
| 25 | 33–36 | 出発地点から一定距離移動 | accuracy差引後の5m・25m・100m。開始anchorだけをsession保存しsleep / discard後に再開 | 採用・S-590技術スパイク待ち |
| 26 | 51 | 他アプリでcopyした文字 | `clipboardchange`案もS-180とplayer体験が同じ。新規stageは作らない | 見送り・S-180と重複 |
| 27 | 55–57 | 高度しきい値 | 100m未満、100〜500m、500m以上の3帯。accuracy区間全体の所属を連続判定 | 採用・S-600技術スパイク待ち |
| 28 | 60 | 画面探索後にscreenshot | mind map型stage一覧の外縁markerを探索し、実capture frameで読むS-190-B04へ統合 | 採用・S-190-B04再設計待ち |

## 相談完了後の状態

初期評価が△だった28件と×だったBB-065の合計29件は29/29相談済みである。Web向け問題または既存ステージへの統合を22件で採用し、7件は新規問題を作らない判断とした。元機構を取りやめて独自Clipboard問題だけを採用したBB-080は採用側へ数える。

未確定なのは採否の相談ではなく、S-380 / S-390のページ境界、S-190-B05の実機成立性、各Limited / Experimental APIの閾値と対応環境である。これらは成功条件を別APIへ緩めずPoC結果で確定する。

実装ウェーブ、97箱の集計、依存関係、共通完了条件は[ステージ展開計画](./stage-rollout-plan.md)を正とする。
