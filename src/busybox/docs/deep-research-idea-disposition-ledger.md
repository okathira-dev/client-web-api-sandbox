# Deep Research元案・暫定採否台帳

> 調査日: 2026-07-20。これは元案と対話過程の非規範台帳である。後の決定で上書きされた箱ID・箱数・成功条件は現行仕様に使わない。現在の解法は[現行ステージ解法仕様](./stage-walkthroughs.md)、件数は[ステージ実装状況](./stage-implementation-status.md)を正とする。

## 目的

[Deep Researchメモの保存版](./source/deep-research-report.md)にある145案へ`DR-001`〜`DR-145`の安定IDを付け、優先度に関係なく、現行60ステージ・97問題箱との差、実現可能性、Web APIがギミックの中心になるか、静的配信方針との整合を確認する。

原文の「1 APIにつき1アイデア」は調査漏れを防ぐためのものと解釈し、1 APIを必ず1ステージにする要件にはしない。原文の優先度は判定材料に使わず、次の5区分へ全件を必ず置く。

| 暫定分類 | この台帳での意味 |
| --- | --- |
| 採用 | 現行ステージと異なる中心操作があり、新規問題として詳細化する価値がある。ここでは実装着手までは承認しない |
| 重複 | 原案の中心操作が既存の採用案・実装で既に扱われている、または同じ原案を別のumbrella名で重ねている。追加stage・追加統合は行わない |
| 統合案 | 単独stageにはしないが、既存stageの追加箱、共通診断、演出、実装基盤へ取り込む具体的な作業案が残る |
| 保留 | 技術的な可能性はあるが、対応環境、外部機器、サーバー、再現性、ゲーム性のいずれかをPoCまたは相談で詰める必要がある |
| 却下 | Deprecated、非標準で代替困難、プライバシー・決済・広告用途、静的配信と不整合、またはAPI固有のプレイヤー操作にならないため、現案のままでは入れない |

`相談: 要`は、このあと1件ずつ「採用・重複・統合案・保留・却下」を決める対象である。全`統合案`、`保留`、`却下`を相談対象とし、確定前に独断で実装、統合、削除を行わない。

## 調査方法と現行性

- 原文145見出しと各操作手順を読み、現行の[ギミック実装カバレッジ計画](./gimmick-coverage-plan.md)、[ステージ実装状況](./stage-implementation-status.md)、実ステージコード、[API台帳](../data/api-ledger.json)を照合した。
- 対応状況が判断を左右する案は、MDNと現行仕様を2026-07-20に再確認した。たとえば[Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)と[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)は原文作成後に実装状況が進んでいる一方、[EditContext](https://developer.mozilla.org/en-US/docs/Web/API/EditContext_API)、[VirtualKeyboard](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API)、[Document Picture-in-Picture](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)、[HTML Sanitizer](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)、[Audio Session](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Session_API)は依然として対応差を前提にする。
- [Force Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Force_Touch_events)はApple固有の非標準機能、WebVRはDeprecatedであり、新規の標準問題にはしない。
- [Text fragments](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment/Text_fragments)のdirectiveは読込時にURLから取り除かれ、現在の[URL Fragment Text Directives API](https://developer.mozilla.org/en-US/docs/Web/API/URL_Fragment_Text_Directives)も主にfeature detection用である。成功をscriptから確実に観測する原案はそのまま成立しない。
- [WebOTP](https://wicg.github.io/WebOTP/)はoriginを含む実SMSを必要とするが、送信者はgame serverに限定されない。G-074 / S-750では別の携帯電話または協力者がcurrent round文面を送るため、電話番号とSMS backendをgameへ持ち込まない。Push / SSE / WebSocket / WebTransport /各種background送信は引き続きbackend要件を個別判断する。
- ExperimentalやLimited availabilityだけを理由に却下しない。実機限定でも中心操作が固有ならLabs / Exhibit候補として`採用`または`保留`にする。

## 集計

| 暫定分類 | 件数 | 次の扱い |
| --- | ---: | --- |
| 採用 | 48 | DR-016、DR-017、DR-023、DR-025、DR-049、DR-075、DR-077、DR-084、DR-097、DR-101、DR-114、DR-120、DR-121、DR-126、DR-127、DR-129、DR-137は確定済み。DR-028から派生したG-061 / S-620と、DR-077から派生したG-071 / S-720は元案の分類外で別途採用した。通常相談は完了し、仕様化・PoC順を別途決める |
| 重複 | 51 | DR-095はDR-118と同じ`Scheduler.postTask()`を元案にしているため確定済み。その他は既存対応を正とし、追加stage・相談対象へは数えない |
| 統合案 | 11 | DR-002 / DR-013 / DR-019 / DR-029 / DR-047 / DR-063 / DR-065 / DR-069 / DR-076 / DR-100 / DR-136は確定済み |
| 保留 | 1 | DR-096はAPI固有性を残して継続保留とした。通常queueの保留相談は完了 |
| 却下 | 34 | DR-012 / DR-021 / DR-028 / DR-030 / DR-031 / DR-032 / DR-033 / DR-034 / DR-036 / DR-050 / DR-052 / DR-074 / DR-080 / DR-083 / DR-086 / DR-087 / DR-090 / DR-091 / DR-093 / DR-098 / DR-102 / DR-104 / DR-105 / DR-107 / DR-115 / DR-118 / DR-128 / DR-130 / DR-131 / DR-132 / DR-134は確定済み。通常相談は完了 |
| 合計 | 145 | 未分類0 |

## 実装状態との読み分け

- `採用`案は新規候補で、まだ実装していない。DR-016はS-700-B02、DR-017はS-760、DR-023はS-660、DR-025はS-610、DR-049はS-690、DR-075はS-700、DR-077はS-710、DR-084はS-730、DR-097はS-740、DR-101はS-630、DR-114はS-640、DR-120はS-670、DR-121はS-650、DR-126はS-750、DR-127はS-770、DR-129はS-780、DR-137はS-790を対話で予約済みである。DR-120から当初予約したG-067 / S-680はD-135で不採用に変更した。DR-028は元案自体を却下したがAPI非依存の派生案G-061 / S-620を、DR-077からは別pipelineの派生案G-071 / S-720を予約した。それ以外の採用分類は「次に仕様化する価値がある」という調査判断であり、直ちにstage IDを予約する意味ではない。
- `重複`51件は、現行stageで中心操作を実装済み、または既存案と同じため追加しない。DR-095は原文の疑似コードと中心機構がDR-118に一致するため、対話で重複へ確定した。原文の表現が異なっても、新しい問題箱の根拠にはしない。
- `統合案`11件は追加作業が残る。DR-002 / DR-013 / DR-019 / DR-029 / DR-047 / DR-063 / DR-065 / DR-069 / DR-076 / DR-100 / DR-136の統合内容は確定済みである。
- `保留`1件と`却下`34件も未実装である。DR-012 / DR-021 / DR-028 / DR-030 / DR-031 / DR-032 / DR-033 / DR-034 / DR-036 / DR-050 / DR-052 / DR-074 / DR-080 / DR-083 / DR-086 / DR-087 / DR-090 / DR-091 / DR-093 / DR-098 / DR-102 / DR-104 / DR-105 / DR-107 / DR-115 / DR-118 / DR-128 / DR-130 / DR-131 / DR-132 / DR-134の却下は確定済み。通常の対話相談queueは完了した。
- とくにDR-121の端末診断は未完成である。現行StageCardは定義上の利用可否を表示する一方、実際の権限状態・機器観測・待機・拒否を端末単位で集約していない。新規候補の実装前に、個別stageのfeature detectionを共通診断へどう接続するか別仕様にする。

## 入力・感知系 DR-001〜DR-023

| ID | 元案 / API | 暫定分類 | 対応先・ギミック評価 | 相談 |
| --- | --- | --- | --- | --- |
| DR-001 | 位置情報 API | 重複 | S-590の相対距離3帯とS-600の高度3帯で実装済み。固定された実在地点へ誘導する原案はprivacyと可搬性を損なうため、開始地点相対へ再設計済み | — |
| DR-002 | インク API | 統合案 | S-160のPointer軌跡描画へ統合。対応時はInk APIが次frameまでの一時trailを描き、Canvasが永続軌跡を確定する。入力・成功判定はPointer Eventsのまま、新しい問題箱は作らない | 済 |
| DR-003 | センサー API 群 | 重複 | S-100とS-520〜S-570へセンサー別に分割済み。磁気系だけはG-055で不採用 | — |
| DR-004 | 端末方向イベント | 重複 | S-100の傾き・静止へ統合済み | — |
| DR-005 | 端末形態 API | 重複 | S-320でpostureまたは2 viewport segmentを実際に観測済み | — |
| DR-006 | ゲームパッド API | 重複 | S-200で軸と複数buttonの同時状態を読む | — |
| DR-007 | 入力機器能力 API | 重複 | S-010のpointer種別判定へ統合。入力源だけで別ステージを増やさない | — |
| DR-008 | キーボード API | 採用 | Labs候補。`getLayoutMap()`で表示文字ではなく物理位置の暗号を復元し、通常のtext inputとは異なる問題にする | — |
| DR-009 | タッチイベント | 採用 | Labs候補。実`TouchList`の複数接点を保ちながら回す協調操作に限定する。単点操作はPointer Eventsへ統合する | — |
| DR-010 | ポインターイベント | 重複 | S-010の入力種別とS-160の軌跡・速度で使用済み | — |
| DR-011 | ポインターロック API | 採用 | Core候補。user activationでlockし、`movementX/Y`だけで内部ダイヤル迷路を解く。通常pointer座標では代替しない | — |
| DR-012 | Force Touch events | 却下 | Apple固有の非標準vendor APIは新規stageへ入れない。標準Pointer Eventsの`pressure`へ置換するとDR-010と重複する | 済 |
| DR-013 | UI イベント | 統合案 | S-150へ、画面上では見えないがDOMのtab順には存在する箱を追加する。Tab / Shift+Tabによるfocus到達で箱を表示・解錠し、pointerでは発見できない | 済 |
| DR-014 | バイブレーション API | 採用 | Labs候補。振動で提示した短いリズムをpointer tapで返す。視覚ヒントも併記し、振動非対応は未観測にする | — |
| DR-015 | EyeDropper API | 重複 | S-260で画面上の指定色を実際に採取済み | — |
| DR-016 | バーコード検出 API | 採用 | G-069 / S-700-B02へ具体化。Remote Playback接続中の外部画面に出たround別QRを手元cameraと実`BarcodeDetector`で読み、current roundの`rawValue`一致で開く | 済 |
| DR-017 | 連絡先ピッカー API | 採用 | G-075 / S-760の任意Labs 2箱。架空名刺をOS contactへ追加し、B01は5 property一致、B02は1件選択したまま全property非共有で開く | 済 |
| DR-018 | Idle Detection API | 採用 | Labs候補。明示許可後、実user idleとscreen stateの組合せを短い1箱として観測する。単なるpage timerでは代替しない | — |
| DR-019 | User Preferences API | 統合案 | S-480へ`prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion`、`prefers-reduced-transparency`、`prefers-reduced-data`の独立5箱を追加する | 済 |
| DR-020 | VirtualKeyboard API | 採用 | Labs候補。software keyboardのgeometryで隠れた層を押し上げ、正しいinsetで入力する。通常viewport resizeだけでは開かない | — |
| DR-021 | 端末メモリー API | 却下 | 読み取り専用の粗い端末属性でplayer自身が状態を変えられない。品質・負荷調整への内部利用もAPI固有のパズルにならないため採らない | 済 |
| DR-022 | バッテリー状態 API | 重複 | S-370でcharger接続・取り外しとlevel帯を4箱へ分離済み | — |
| DR-023 | Compute Pressure API | 採用 | 新規G-065 / S-660へCPUの`nominal`、`fair`、`serious`、`critical`を4箱として置く。ゲーム自身は状態を変える負荷を生成しない | 済 |

## 表示・描画・DOM系 DR-024〜DR-061

| ID | 元案 / API | 暫定分類 | 対応先・ギミック評価 | 相談 |
| --- | --- | --- | --- | --- |
| DR-024 | DOM | 重複 | S-150で見た目を固定したままDOM順を変える問題として実装済み | — |
| DR-025 | HTML DOM API | 採用 | `<details name>`はS-150へ1箱、`<dialog>`の×・外側click・platform cancelは新規S-610の3箱、`<meter>`はS-020の表示UIへ統合する。inputはS-490と重複 | 済 |
| DR-026 | Canvas API | 重複 | S-160の軌跡とS-190のcapture frame処理へ統合済み | — |
| DR-027 | SVG API | 重複 | vector部品dragはS-160 / S-510の中心操作と重なる。SVGは描画形式として統合し、属性一致だけの新規stageにはしない | — |
| DR-028 | CSS カウンタースタイル | 却下 | `@counter-style`、説明付き`ol`、架空・異文明風の独自記数法は使わない。派生したUnicode数字の計算式はAPIから分離し、新規G-061 / S-620として採用する | 済 |
| DR-029 | CSS カスタムハイライト API | 統合案 | S-030へ、非連続Rangeを蓄積するB02と、`highlightsFromPoint()`でDOM要素ではないhighlight領域をhit-testするB03を追加する | 済 |
| DR-030 | CSS フォント読み込み API | 却下 | font load完了はplayer操作ではない。S-620等でasset管理に使っても問題箱・成功条件にはしない | 済 |
| DR-031 | CSS 描画 API | 却下 | Paint Workletのprocedural描画は任意の見た目実装に留める。seed sliderは通常UIで、描画結果や実paint完了を成功条件として観測できない | 済 |
| DR-032 | CSS プロパティと値 API | 却下 | typed custom propertyの利用は任意の実装詳細とし、stage・箱・成功条件へ要求しない | 済 |
| DR-033 | CSS 型付き OM API | 却下 | typed CSS値の利用は任意の実装最適化とし、stage・箱・成功条件へ要求しない | 済 |
| DR-034 | CSSOM | 却下 | game UIでのrule編集は通常操作と重なり、DevToolsによるpage編集は解法を無制限にして本作の芯を損なうため採用しない | 済 |
| DR-035 | CSSOM ビュー API | 重複 | S-020の実要素寸法・viewport判定へ統合済み | — |
| DR-036 | 幾何インターフェイス | 却下 | DOMPoint / DOMMatrix等は任意の幾何計算補助とし、stage・箱・成功条件へ要求しない | 済 |
| DR-037 | 交差オブザーバー API | 採用 | Core候補。複数の窓をscrollで重ね、実intersection ratioが同時に閾値を越えると開く | — |
| DR-038 | リサイズオブザーバー API | 重複 | S-020で実寸法変化を観測済み | — |
| DR-039 | Selection API | 重複 | S-030とS-500で実selectionを成功条件に使用済み | — |
| DR-040 | 全画面 API | 採用 | Core候補。user activationでfullscreenへ入り、viewport変化後にだけ整列する図と`fullscreenchange`を組み合わせる | — |
| DR-041 | ポップオーバー API | 採用 | Core候補。top layerの実open / close列とlight-dismissを鍵盤にする。単なるcustom modalでは代替しない | — |
| DR-042 | ビュー遷移 API | 重複 | S-340で実View Transitionを観測済み。遷移中だけ読む原案はanimation timing依存を避け、既存設計を正とする | — |
| DR-043 | ビューポートセグメント API | 重複 | S-320の2 segment配置へ統合済み | — |
| DR-044 | Window Management API | 採用 | Exhibit候補。許可後に複数screenへround同期windowを配置し、実screen IDと配置を観測する。単一画面代替は作らない | — |
| DR-045 | Window Controls Overlay API | 重複 | S-460でinstalled desktop PWAの実titlebar geometryを使う | — |
| DR-046 | 履歴 API | 重複 | S-220でsame-document履歴、back-forward復帰、reloadを分担 | — |
| DR-047 | ナビゲーション API | 統合案 | S-220-B04へ統合。BackでAへ戻った後に別のDへ進み、旧forward entry B / Cの`dispose`と`canGoForward === false`を観測する | 済 |
| DR-048 | URL API | 採用 | Core候補。pathname / query / hashをアドレスバーで組み立てるURLダイヤル。page内の模擬URL入力では開かない | — |
| DR-049 | URL Fragment Text Directives | 採用 | G-068 / S-690の同一page Text Fragment巡回1箱に加え、D-136で派生G-079 / S-800のfragment組み立て2箱を採用。両stageの具体問題は実装前に再吟味する | 済 |
| DR-050 | URL パターン API | 却下 | URLPatternは入力URLのmatch / group抽出だけでplayer操作を増やさない。DR-048の内部route判定には任意利用可 | 済 |
| DR-051 | ウェブアニメーション API | 重複 | S-170でAnimationの時刻を成功条件に使用済み | — |
| DR-052 | ウェブコンポーネント | 却下 | player向けのbrowser固有UIではなく実装architecture。slot案も既存D&Dと重複し、内部利用は採用実績へ数えない | 済 |
| DR-053 | HTML ドラッグ＆ドロップ API | 重複 | S-510でwindow間の実File dropを成功条件に使用済み | — |
| DR-054 | HTML 無害化 API | 採用 | Labs候補。危険要素を実行せず、safe sanitizerで除去されたDOM断片を組む。対応外では未観測、unsafe methodは使わない | — |
| DR-055 | Houdini API | 重複 | umbrella名では1stageにせず、DR-031〜DR-033のPaint / Properties and Values / Typed OMへ分解して扱う | — |
| DR-056 | 画面方向 API | 採用 | Mobile候補。portrait / landscapeで別断片を読み、実orientation change後に2片を統合する。orientation lock成功だけは要求しない | — |
| DR-057 | 画面起動ロック API | 重複 | S-330でlock取得、visibility喪失、再取得を観測済み | — |
| DR-058 | 文書ピクチャインピクチャ API | 採用 | Labs候補。任意HTMLの別windowと本体をround同期し、両方の情報で解く。video PiPのS-350-B06とは分離する | — |
| DR-059 | ピクチャインピクチャ API | 重複 | S-350-B06でnative videoの実PiP入場eventを観測済み | — |
| DR-060 | ページ可視性 API | 重複 | S-040のhidden時間とS-400のwall-clock復元へ統合済み | — |
| DR-061 | EditContext API | 採用 | Labs候補。canvas上のcustom editable regionで実IME compositionと選択範囲を扱う。通常textarea入力では代替しない | — |

## メディア・映像・XR系 DR-062〜DR-084

| ID | 元案 / API | 暫定分類 | 対応先・ギミック評価 | 相談 |
| --- | --- | --- | --- | --- |
| DR-062 | ウェブオーディオ API | 重複 | S-120の音入力解析、S-360の生成音、S-430のloop audioへ統合済み | — |
| DR-063 | ウェブ音声 API | 統合案 | 既存S-580-B01の音声認識は維持し、文字位置ごとのalphabet shiftを音声合成だけで返す独立B02を追加する | 済 |
| DR-064 | Audio Output Devices API | 採用 | Labs候補。明示的に選んだsinkへ左右の鍵片を分け、`setSinkId()`成功と実選択を観測する。device labelは保存しない | — |
| DR-065 | オーディオセッション API | 統合案 | S-430-B02へ統合。type選択だけの元案は採らず、生成loop音声の実`active → interrupted → active`と再生復帰を観測する。ゲーム自身はinterruptionを生成しない | 済 |
| DR-066 | 画面キャプチャ API | 重複 | S-190で実`getDisplayMedia()` frameを使う | — |
| DR-067 | メディアキャプチャとストリーム API | 重複 | S-110のcamera、S-120のmicrophoneへ分割済み | — |
| DR-068 | MediaStream 画像キャプチャ API | 採用 | Labs候補。camera trackのcapabilitiesを確認し、playerがfocus / zoomを合わせて`takePhoto()`した実frameからround markerを読む | — |
| DR-069 | Media Capabilities API / media tracks | 一部採用・D-140〜D-142で整理 | Media Capabilities profile箱と実寸reelは不採用。字幕track、条件付き音声trackはS-350、frame cadenceはG-080 / S-810 | 済 |
| DR-070 | メディアセッション API | 重複 | S-430で外部pause actionを実際に観測する | — |
| DR-071 | メディアソース拡張機能 API | 採用 | Labs候補。local media chunkをplayerが正順に選び、SourceBufferへappendした連続映像内のround markerで開く | — |
| DR-072 | MediaStream 収録 API | 重複 | S-190のlocal recording問題へ統合済み | — |
| DR-073 | WebVTT API | 採用 | Core候補。playerがcueのstart / endを合わせ、実active cue列から鍵文を得る。単なる字幕表示では終わらせない | — |
| DR-074 | Encrypted Media Extensions API | 却下 | Clear Keyならbackendなしで成立するが、EME専用default UIはなく、playerに見えるのがgenericな動画停止・再開に近い | 済 |
| DR-075 | Remote Playback API | 採用 | 新規G-069 / S-700の2箱。B01は外部画面の文字鍵を手元入力、B02はDR-016のround別QRを手元cameraと実`BarcodeDetector`で読む | 済 |
| DR-076 | Presentation API | 統合案 | G-069 / S-700-B03へ統合。明示操作でreceiver pageを外部画面へ起動し、実`connected`とreceiverの表示準備完了messageを確認した時点で開く | 済 |
| DR-077 | Insertable Streams for MediaStreamTrack API | 採用 | 新規G-070 / S-710の動画変換4箱へ具体化。暗黒frame、decode失敗、QR frame、自己生成metadataを別条件とし、player入力依存の変換だけをruntime実行する | 済 |
| DR-078 | WebCodecs API | 採用 | Labs候補。local encoded chunksの順序・timestampを直し、decoderが復元したframe内markerで開く | — |
| DR-079 | WebRTC API | 重複 | S-360で同一origin 2 tabの実peer接続と明示終了へ統合。遠隔2人用backendは追加しない | — |
| DR-080 | WebTransport API | 却下 | datagram / stream差は固有だが専用HTTP/3 / QUIC backendと運用が必須。静的配信・自前backendなし方針を変更せず、新規stage・箱を作らない | 済 |
| DR-081 | WebGL | 採用 | Core候補。実3D箱を回し、view / projection上で離れた刻印が特定角度だけ重なる。DOM 3D transformでは代替しない | — |
| DR-082 | WebGPU API | 不採用 | player固有の体験を成立させられず、D-141でS-270ごと削除 | — |
| DR-083 | WebVR API | 却下 | Deprecatedな旧API。元案の箱の裏を覗く体験を現代APIへ移しても既存G-072 / S-730のWebXR 2箱と重複する | 済 |
| DR-084 | WebXR 機器 API | 採用 | 新規G-072 / S-730の2箱。B01は実immersive sessionと最初のviewer pose、B02は実XRInputSourceのselect rayでXR空間上の箱を選ぶ。凝ったXR世界、現実marker、歩行、page上の代替clearは作らない | 済 |

## ストレージ・オフライン・通信系 DR-085〜DR-120

| ID | 元案 / API | 暫定分類 | 対応先・ギミック評価 | 相談 |
| --- | --- | --- | --- | --- |
| DR-085 | Fetch API | 採用 | Core候補。静的local fragmentへ条件付きrequestを出し、response header / bodyの手掛かりで次URLを選ぶ。単なる順番clickにしない | — |
| DR-086 | XMLHttpRequest API | 却下 | 現役標準だが、readyState / ProgressEventをplayerへ見せるにはgame製UIが中心になり、既存DR-085 Fetch案と異なる体験にならない | 済 |
| DR-087 | サーバー送信イベント | 却下 | playerからは断続的な文字を待つだけで、EventSource固有の一方向streamや自動再接続を面白い操作にできない。backendの有無にかかわらずstage・箱・統合先を追加しない | 済 |
| DR-088 | Broadcast Channel API | 重複 | S-050、S-250、S-360の同一origin tab同期へ統合済み | — |
| DR-089 | チャンネルメッセージング API | 採用 | Core候補。iframeへ`MessagePort`をtransferし、port経由でだけ届く半鍵を交換する。BroadcastChannelでは代替しない | — |
| DR-090 | WebSocket API | 却下 | 遠隔二人協力の面白さはWebSocket固有ではなく、既存S-360と別に常時接続backend、相手待ち、room運用を追加する根拠にならない。新規stage・箱・統合先を作らない | 済 |
| DR-091 | Web Workers API | 却下 | worker完了、main threadの応答性、transfer後のdetached bufferはいずれもplayerからは任意の画面演出と区別できない。必要な重処理の内部実装には使えるが、問題箱・成功条件にはしない | 済 |
| DR-092 | Service Worker API | 重複 | S-070、S-090、S-410、S-420とBusybox PWA基盤で使用済み | — |
| DR-093 | Push API | 却下 | 本物のPushEventにはapplication serverが必要。Worker timer、直接notification、Periodic Background Syncで模倣せず、stage・箱・統合先を追加しない。閉じた後のbrowser裁量wakeは後にDR-097 / S-740として別問題化した | 済 |
| DR-094 | 通知 API | 重複 | S-090、S-410、S-420へ通知表示・action・復帰を分割済み | — |
| DR-095 | バックグラウンドタスク API | 重複 | 原文の疑似コード`Scheduler.postTask(..., { priority: "background" })`はDR-118 Prioritized Task Scheduling APIそのもの。`requestIdleCallback()`を意図しても待機完了はplayer操作にならない | 済 |
| DR-096 | バックグラウンド同期 API | 保留 | page / tab不在中にも登録済みの仕事を実Service Workerが完了できる特性は残す。現在の静的JSON取得・通知・S-070統合案には確定せず、具体的なギミックを再吟味する | 済 |
| DR-097 | ウェブ定期バックグラウンド同期 API | 採用 | 新規G-073 / S-740の長期Labs 1箱。訪問時に水と光の世話を順に預け、window不在中の実`periodicsync`を各1回経て発芽・開花する。日次保証、通知、timer fallbackは使わない | 済 |
| DR-098 | バックグラウンドフェッチ API | 却下 | 壊れた画像を残してwindow不在中の実download後にflag画像を復元する案は、数時間の実progressを静的配信だけで制御できない。stateless Edge Worker案はbackend許容時だけ再相談する | 済 |
| DR-099 | Badging API | 重複 | S-210で実app badgeを段階更新し、離脱時に消す | — |
| DR-100 | Beacon API | 統合案 | 既存S-060-B02「オフライン郵便（仮）」へ統合。offline中の明示投函で実`sendBeacon()`を呼び、full-document navigation後にService Workerが専用POSTを検証してIndexedDB receiptをcommitした時だけ開く | 済 |
| DR-101 | Network Information API | 採用 | 新規G-062 / S-630へWi-Fi、cellular、ethernet、Bluetoothの4箱を置く。明示観測時の`connection.type`だけを使い、速度・RTT・saveDataは使わない | 済 |
| DR-102 | Content Index API | 却下 | Chrome Androidのcontent棚でoffline鍵を開き、browser UI削除由来の実`contentdelete`を受ける次期案を記録した。PC browser非対応の現状ではstage・箱を追加しない | 済 |
| DR-103 | IndexedDB API | 重複 | S-060と全体進捗storeで使用済み | — |
| DR-104 | Storage API | 却下 | `persist()`のbrowser policy結果はplayerが必ず変えられず、eviction耐性を安全に実証できない。箱にも設定画面にも追加しない | 済 |
| DR-105 | Storage Access API | 却下 | 許可前にunpartitioned cookieを読めない状態をclear条件へ絡めず、API stageは作らない。派生したiframe画像D&DはStorage Accessと分離してS-510-B02へ統合する | 済 |
| DR-106 | ウェブストレージ API | 重複 | S-590の短命anchorなど、小さいsession状態へ限定して統合。正規進捗はIndexedDBを維持する | — |
| DR-107 | Cookie Store API | 却下 | async cookie操作は既存storage、Window changeはcross-context通信、Service Worker cookiechangeはS-740とplayer体験が重なる。内部実装候補にだけ残す | 済 |
| DR-108 | Shared Storage API | 却下 | 世界全体の進捗は得られず、cross-site local memoryの新規案もbrowser所有UIがない。WICG archive済み、Chromeでdeprecated・削除進行中の非標準APIなので統合もしない | 済 |
| DR-109 | File API | 重複 | S-130、S-440、S-510でfile内容、OS open、window間dropを分担済み | — |
| DR-110 | File System API | 採用 | Labs候補。round付きfileをpickerで開き、playerがOS editorで指定箇所だけ直して同じhandleへ保存・再読込する | — |
| DR-111 | File and Directory Entries API | 採用 | Labs候補。round manifestを含む実directory treeをdropし、階層とfile内容の両方で判定する。単一file inputでは代替しない | — |
| DR-112 | Compression Streams API | 採用 | Core候補。複数形式のlocal compressed streamから正しいdecoderを選び、展開された鍵文をstreamのまま読む | — |
| DR-113 | ストリーム API | 採用 | Core候補。ReadableStreamの分岐・Transform・backpressureを水路として可視化し、正しいsinkへround tokenを流す | — |
| DR-114 | エンコーディング API | 採用 | 新規G-063 / S-640へ、2進byte列4箱、16進byte列4箱、文字化け4箱を置く。16文字コードを各1回だけ割り当てる | 済 |
| DR-115 | Reporting API | 却下 | browser固有のplayer向けUIがなく、observer dataを見せる自作UIが体験の中心になる。対応環境での内部診断利用だけを任意に認める | 済 |
| DR-116 | パフォーマンス API | 重複 | S-040のmonotonic時間とS-400のwall-clock比較へ統合済み | — |
| DR-117 | JS Self-Profiling API | 却下 | 元案は実装者のcode最適化でplayer操作ではない。hot function診断卓もgame製表示、非決定的sampling、不要なCPU負荷が中心になるためS-680へ統合しない | 済 |
| DR-118 | Prioritized Task Scheduling API | 却下 | priorityカード、処理権レース、動的priority切替を検討したが、いずれもplayerには通常の並べ替えや勝者選択に見え、API固有の操作として不足する | 済 |
| DR-119 | 投機ルール API | 却下 | targetによる実prerender観測は可能だが、playerには投機中のbrowser固有UIがなくgame製演出と通常の高速読込しか見えない。元案、先に入っていた部屋案、S-220統合を却下 | 済 |
| DR-120 | コンソール API | 一部採用 | 新規G-066 / S-670のread-only Console迷路1箱だけを置く。G-067 / S-680診断卓はD-135で体験重複のため不採用 | 済 |

## 認証・権限・外部機器系 DR-121〜DR-145

| ID | 元案 / API | 暫定分類 | 対応先・ギミック評価 | 相談 |
| --- | --- | --- | --- | --- |
| DR-121 | 権限 API | 採用 | 新規G-064 / S-650へ位置情報、通知、カメラ、マイクの4箱を置き、対応PermissionStatusが`granted`になると開く | 済 |
| DR-122 | ウェブ共有 API | 重複 | S-240の送出とShare Target受信へ統合済み | — |
| DR-123 | クリップボード API | 重複 | S-180のpage外往復とS-500のcopy / paste / selectionへ分担済み | — |
| DR-124 | 資格情報管理 API | 重複 | S-380 / S-390のWebAuthn credential lifecycleへ統合。password保存の別問題は作らない | — |
| DR-125 | ウェブ認証 API | 重複 | S-380 / S-390でpasskey作成、assertion検証、失敗・abortを分担済み | — |
| DR-126 | WebOTP API | 採用 | 新規G-074 / S-750の任意Labs 1箱。実OTPCredentialまたは強く検証したOTP AutoFillでcurrent round codeが入った時だけ開く | 済 |
| DR-127 | Federated Credential Management API | 採用 | 新規G-076 / S-770の任意Labs「身分証棚」。実装時点で公式FedCM、public RP登録、managed運用、FedCM確証、独自backend不要を満たすserviceごとに箱を置く。現計画はGoogle 1箱を下限とする | 済 |
| DR-128 | 決済リクエスト API | 却下 | 実merchant / payment methodを仲介するUIを模擬通貨へ流用せず、Deprecatedな`basic-card`、実Google Pay / Apple Pay、cancelだけの箱も使わない。架空payment appはDR-129で別相談 | 済 |
| DR-129 | 決済ハンドラー API | 採用 | 新規G-077 / S-780の任意Labs 4箱。架空payment methodだけでhandler選択、承認、拒否、同一handler再試行を観測し、その時点で対応箱を直接開く | 済 |
| DR-130 | 帰属レポート API | 却下 | Chromeで非推奨化・削除予定。browser固有UIやclient側の確定eventがなく、report受信backendを要するためstage・統合・historical exhibitを作らない | 済 |
| DR-131 | Private State Token API | 却下 | 独自issuer / redeemer backend、暗号鍵運用、issuer登録が必要で一般向けmanaged issuerもない。通常player向けbrowser UIもないためstage・統合・demo依存を作らない | 済 |
| DR-132 | Topics API | 却下 | Chrome 144から非推奨化・削除予定。非標準、privacy、非決定性、固有UI欠如のためstage・統合・historical exhibit・設定変更箱を作らない | 済 |
| DR-133 | Trusted Types API | 採用 | Labs候補。CSPでsinkを制限し、安全なpolicyを通った断片だけを組み立てる。攻撃文字列を実行せず、HTML Sanitizer案と役割を分ける | — |
| DR-134 | フェンスフレーム API | 却下 | 隔離枠内の達成を親pageへ直接通知できず、playerには普通の埋め込みcontentにしか見えない。reporting backendやgame製puzzleへ置換せずstage・統合・historical exhibitを作らない | 済 |
| DR-135 | 起動ハンドラー API | 重複 | S-310、S-440、S-450でPWA起動、file、protocolの実LaunchQueueを分担済み | — |
| DR-136 | 呼び出しコマンド API | 統合案 | 原文のOS外部command案は破棄する。DR-041へ、複数buttonから同じPopoverへ宣言的なcommandを送り、呼び出し元を識別する別箱を1箱追加する。DR-025のDialogには追加しない | 済 |
| DR-137 | Local Font Access API | 採用 | 新規G-078 / S-790の任意Labs 1箱。Git管理する専用fontをplayerがOSへinstallし、対象PostScript名だけをLocal Font Accessで要求して実font dataを検証・表示すると直接開く | 済 |
| DR-138 | Web Bluetooth API | 重複 | S-280で標準Battery Serviceへ接続し実値を読む | — |
| DR-139 | Web Serial API | 採用 | Exhibit候補。microcontroller等からround nonce入りbyte列を受ける。専用deviceなしの代替clearは作らない | — |
| DR-140 | Web MIDI API | 採用 | Labs候補。実MIDI inputのnote-on / velocity列で短い旋律・chordを判定し、生device IDは保存しない | — |
| DR-141 | ウェブ NFC API | 採用 | Labs候補。round ID入りNDEFを実tagへ書き、別訪問で読み戻す2段階問題。対応mobileだけで未観測から進む | — |
| DR-142 | WebUSB API | 重複 | S-300で実deviceのIN transferを読む | — |
| DR-143 | WebHID API | 重複 | S-290で実input reportを読む | — |
| DR-144 | ウェブ暗号化 API | 重複 | S-130のfile digestへ統合済み | — |
| DR-145 | Web Locks API | 重複 | S-250の複数tab lock取得・解放順へ統合済み | — |

## 対話で確定した判断

### DR-002 インク API

- 決定日: 2026-07-20
- 最終分類: 統合案
- 統合先: S-160
- 決定: S-160のポインター軌跡描画へInk APIを組み込む。`navigator.ink.requestPresenter()`が利用できる環境では、最後にCanvasへ確定したtrusted Pointer Eventを`updateInkTrailStartPoint()`へ渡し、次のanimation frameまでの低遅延な一時trailを描く。Canvasは従来どおり永続軌跡を描く。
- 成功条件: 現行S-160のPointer Eventsによる軌跡・速度判定を維持する。Ink presenterの取得、描画遅延、compositorが描いたpixelはclear条件にしない。
- 対応差: Ink API非対応時は既存Canvas描画を維持する。これは別解ではなく表示pipelineのprogressive enhancementであり、同じPointer軌跡・成功条件を使う。
- 問題数: 新しいstage・問題箱は追加しない。
- 理由: Ink APIにはplayerが操作・観測できる固有の状態はないが、原案と同じポインター軌跡の実装自体を低遅延化できるため、重複として捨てず実装基盤へ統合する。

### DR-012 Force Touch events

- 決定日: 2026-07-26
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、stage ID予約を追加しない。
- 元案: Force Touch対応面を押し込む強さのprofileを合わせて封印を割り、materialが曲がって亀裂が入る演出でpressure差へ気付かせる。
- 新規案: 通常clickでは表面だけが沈み、`webkitmouseforcechanged`の圧力上昇、`webkitmouseforcedown`の二段目、`webkitmouseforceup`、通常`mouseup`までを一回の実操作で通す1箱「二段底（仮）」を検討した。Force Clickを無効化している場合や非対応hardwareを偽陽性にしない設計だった。
- 決定理由: Force Touch eventsはApple固有の非標準vendor APIであり、標準仕様を持たない。本作の新規stageへ非標準APIを入れない方針から、hardwareの面白さや現在の搭載状況にかかわらず採用しない。
- 統合先案との区別: 標準`PointerEvent.pressure`へ置換するとForce Touch固有の二段押しではなくなり、DR-010 Pointer Eventsの既存範囲と重複する。そのためfallbackとしての置換や既存stageへの統合も行わない。
- 検証・件数: PoC、実機gate、asset生成は行わない。計画値は75stage・177箱のままとする。
- 根拠: [MDN Force Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Force_Touch_events)、[Apple Responding to Force Touch Events from JavaScript](https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/SafariJSProgTopics/RespondingtoForceTouchEventsfromJavaScript.html)。

### DR-013 UI イベント

- 決定日: 2026-07-20
- 最終分類: 統合案
- 統合先: S-150へ1問題箱を追加する
- 決定: 画面上では見えないがsemanticなbuttonとしてDOMのtab順に存在する問題箱を置く。playerがTabまたはShift+Tabでfocusを到達させると箱を可視化し、そのfocus試行で解錠する。
- 成功条件: trustedなTab / Shift+Tabの`keydown`に続いて対象箱の`focus` / `focusin`を観測する。pointer hit testは無効にし、click、hover、scriptからの`focus()`、初期autofocusでは開かない。
- 表現: 未focus時は空間だけが見える。focus到達時はnative focus indicatorを残したまま箱が現れ、browserのtab移動で見えない箱を発見したことを示す。「正しい端子列」のような追加sequenceは要求しない。
- アクセシビリティ: 問題箱はDOMから隠さず、役割と短いlabelを持たせる。focus中に再び不可視化せず、resetまたは再入場時だけ初期状態へ戻す。
- 理由: scrollやdouble-clickのgeneric event列ではなく、browserが管理するfocus navigation自体をplayerの発見操作にできるため。

### DR-017 連絡先ピッカー API

- 決定日: 2026-07-29
- 最終分類: 採用。新規G-075 / S-760「架空の名刺（仮）」へ、攻略必須経路と全箱必須報酬から外したLabsの2箱を置く。
- 元案: 実アドレス帳から「箱の持ち主」を見つけ、選んだ連絡先の内容がhint条件に一致すると開く。宛名labelが封筒へ貼られる演出だった。
- 元案をそのまま採らない理由: 実連絡先の値を正解へ使うと第三者の個人情報を要求し、playerごとに連絡先集合が異なるため同じ解を保証できない。
- 新規設計: stageに固定の`name`、`email`、`tel`、`address`、`icon`を持つ架空名刺を表示する。iconはdownload可能なGit管理済みfixtureとし、playerが全5項目をOSの連絡先へ架空contactとして追加する。名刺の各textはcopy可能にしてよいが、Contact Pickerを使わないpage内入力やvCard内容の直接提出では開かない。
- B01「名刺の本人（仮）」: transient activationから実`navigator.contacts.select(["name", "email", "tel", "address", "icon"], { multiple: false })`を呼ぶ。返ったcontactが1件で、全5propertyを名刺fixtureと照合できた時だけ開く。`name`はUnicodeと空白、`email`はcaseと空白、`tel`は表示記号、`address`は構造化field、`icon`はcrop・resize・再圧縮を許容する画像内容で正規化する。配列の先頭固定ではなく期待値を含むかで判定する。
- B02「何も渡さない名刺（仮）」: B01解決後、同じ5propertyで実pickerをもう一度開く。返却contactがちょうど1件あり、`name` / `email` / `tel` / `address` / `icon`のすべてが空配列または欠損なら開く。仕様上、共有拒否と元からの値欠損を区別できず、propertyが皆無ならcontactのidentityも確認できないため、「同じ架空contactを選んだ」とは判定・表示しない。clear条件は「1件選択したがBusyboxへ何も渡さなかった」とする。
- native UI gate: Contact PickerのUIはorigin、要求property、共有内容、個別contactを示す。全5propertyをOFFにしたまま選択確定できることは実装保証ではないため、Android Chrome実機でB01の5property返却とB02の全非共有をPoCする。成立しない環境は未観測にし、game製checkbox、manual form、空object注入、部分共有を代替clearにしない。
- privacy / lifecycle: 名刺fixtureは架空値だけを使い、実在人物を選ぶよう促さない。OS contactがGoogle / iCloud等へ同期され得ることを登録前に説明し、完了後に削除を案内する。B01の返却値とicon Blobはmemory内で照合後すぐ破棄し、画面表示、永続化、Drive同期、file export、analytics、network送信へ使わない。object URL、ImageBitmap、pending promise、listenerは完了、取消、reset、離脱で解放する。
- asset / flag: iconのsource、生成手順、checksum、比較fixtureをGit管理する。B01は`BUSYBOX{THE_CARD_BECAME_A_CONTACT}`、B02は`BUSYBOX{ONE_CONTACT_SHARED_NOTHING}`のcopy可能な固定flagを表示する。
- 統合先案との区別: S-650はPermissionStatus、S-750はbrowser所有OTP入力を扱う。S-760はOS連絡先への架空contact追加と、毎回user agent所有pickerで共有範囲を選ぶ操作が中心なので、既存permission / credential stageへ箱を足さない。
- 検証・件数: fake providerの自動testでsingle selection、全5property一致、各field mismatch、配列順、正規化、画像再圧縮、B01未解決時のB02拒否、全空、部分共有、複数・0件、cancel、late result、reset、非保存を確認する。H-047で実Android Chrome、contact追加、5property返却、全property非共有UI、OS同期説明、削除案内、cleanupを確認する。新規1stage・2箱を追加し、計画値は76stage・179箱とする。
- 根拠: [Contact Picker API](https://www.w3.org/TR/contact-picker/)、[Chrome Contact Picker解説](https://developer.chrome.com/docs/capabilities/web-apis/contact-picker)。

### DR-019 User Preferences API

- 決定日: 2026-07-20
- 最終分類: 統合案
- 統合先: S-480へ5問題箱を追加する
- 対象: User Preferences APIの`navigator.preferences`が扱う5系統をすべて独立させる。S-480-B05は`prefers-color-scheme`、B06は`prefers-contrast`、B07は`prefers-reduced-motion`、B08は`prefers-reduced-transparency`、B09は`prefers-reduced-data`とする。`forced-colors`など`prefers-*`ではないmedia featureはこの決定へ含めない。
- 操作: 各箱に明示的な操作部を置き、対応する`PreferenceObject.requestOverride()`をuser actionから呼ぶ。B05は現在のlight / darkと反対側、B06は安全な候補から現在値と異なる値、B07〜B09は`reduce`を要求する。OS設定を変更させず、page側のoverrideを実入力にする。
- 表現: B05は盤面の明暗が反転し、B06は輪郭と境界の強さが切り替わり、B07は動く錠前が停止し、B08は半透明の外装が不透明になり、B09は情報量の多い絵が軽量な記号へ置換される。各変化は対応する`@media (prefers-*)`で描き、単なる設定menuの選択表示にはしない。
- 成功条件: `requestOverride()`が成功し、対象`PreferenceObject.override`と対応する`matchMedia()`の実効値が要求値へ一致した場合に、その箱だけを開く。初期のOS preference一致、CSS classの直接変更、通常のpage内theme設定だけでは開かない。`change`は表示同期に使うが、元から同じ実効値だった場合もあるため必須eventにはしない。
- cleanup: 開箱演出を観測したら`clearOverride()`でそのoverrideを戻す。reset、stage離脱、`pagehide`でも5項目すべてへbest-effort cleanupを行い、常設の「システム設定へ戻す」操作も置く。override値そのものは進捗へ保存しない。
- 対応差: User Preferences APIはExperimentalかつLimited availabilityとして扱う。API、対象field、`requestOverride()`のいずれかがない環境や、UAが要求を拒否した場合は未観測のままにし、`matchMedia()`だけで開く代替clearは作らない。
- 現状: 既存S-480-B01〜B04のpreferred text scaleは実装済み。B05〜B09はこの対話で設計決定済みだが未実装である。
- 根拠: [User Preferences API](https://developer.mozilla.org/en-US/docs/Web/API/User_Preferences_API)と[Media Queries Level 5のPreferenceManager](https://drafts.csswg.org/mediaqueries-5/#user-preferences-api)が公開する5種類を、playerが引き起こす別々の描画変化としてそのまま使えるため。

### DR-021 端末メモリー API

- 決定日: 2026-07-20
- 最終分類: 却下
- 決定: 新規stage・問題箱を作らず、重い描画やmedia処理の品質・負荷調整基盤にも統合しない。
- APIの性質: `navigator.deviceMemory`は端末RAMの概算を読み取るだけで、値はfingerprinting低減のため粗く量子化・clampされる。playerがpage上の操作で値や状態を変える経路はない。
- 却下理由: 端末class別の箱や鍵は所持端末だけで答えが決まり、playerの解法にならない。メモリー量に応じて内部処理方式や見た目を変えるだけの案も、API固有のplayer操作を追加しないため、本作のパズルとして採らない。
- 代替: 性能上の安全策が必要な場合は、API採用案とは分離し、保守的な既定値、実処理の失敗回復、資源cleanupとして通常の実装品質で扱う。Device Memory値を進捗・分析へ保存しない。
- 根拠: [Device Memory API仕様](https://www.w3.org/TR/device-memory/)と[`Navigator.deviceMemory`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)。

### DR-023 Compute Pressure API

- 決定日: 2026-07-24
- 最終分類: 採用。新規G-065 / S-660「四つの計算圧力（仮）」に4箱を置く。
- 相談対象の元案: 他の箱や処理を止め、CPU pressureが`nominal`になった時だけ1箱を開く。「静かな計算状態」に近づくにつれて箱の放熱フィンが閉じる演出だった。
- 採用する再設計: `PressureObserver`が返すCPUの`nominal`、`fair`、`serious`、`critical`をS-660-B01〜B04へ一対一で対応させる。playerが明示的に観測を開始した後、実`PressureRecord.state`を受け取るたびに該当箱だけを開き、複数回の訪問をまたいで4状態を累積する。初期recordも実観測として認め、特定順序や状態遷移は要求しない。
- 負荷方針: ゲーム自身はCPU worker、busy loop、大量task、人工benchmark、隠れた描画など、状態を`fair`以上へ動かすための負荷を一切生成しない。他tab、他app、OS状態、温度等をどう変えるかはplayerへ強制せず、自己申告や独自CPU使用率推定で代替clearしない。
- 状態の意味: 4値はCPU使用率の固定閾値ではなく、端末pressure、温度、energy usage等を加味したuser agentの実装依存hintとしてそのまま扱う。状態名を「CPU使用率0〜25%」のような数値帯へ読み替えず、ゲーム内の独自再分類も行わない。
- 対応差: `PressureObserver`、`PressureObserver.knownSources`の`"cpu"`、`observe("cpu")`が成立するSecure ContextだけをLabs対象にする。API欠損、Permissions Policy拒否、OS / hardware非対応、`NotAllowedError`、`NotSupportedError`では未観測とし、Performance API、`requestAnimationFrame`、battery、temperature推定による代替clearを作らない。
- privacy / lifecycle: PressureRecordの状態列、timestamp、観測時間、変化回数、端末情報を保存・同期・送信しない。永続化するのは通常の解決済みproblem IDだけとする。停止操作を常設し、離脱、reset、abort、document非表示時に`disconnect()`してpending recordと参照を破棄する。
- GPU版: Compute Pressure Level 1が定義する`PressureSource`は`"cpu"`だけで、仕様例の`"gpu"`は将来拡張の説明であり現行の有効値ではない。WebGPUのtimestamp queryや`GPUQueue.onSubmittedWorkDone()`はこのpageが投入した処理の時間・完了を測るもので、端末全体の4段階GPU pressureを返さない。GPU版stageは今回追加せず、標準PressureSourceへ`"gpu"`が追加された場合に再検討する。
- 件数: 新規1stage・4箱を追加し、計画値は66stage・157箱とする。
- 根拠: [Compute Pressure Level 1](https://www.w3.org/TR/compute-pressure/)、[WebGPU](https://gpuweb.github.io/gpuweb/)。

### DR-025 HTML DOM API

- 決定日: 2026-07-21
- 最終分類: 採用
- 元案: `<details>`、`<dialog>`、`<input>`などHTML要素固有の状態を鍵機構にし、複数状態の組合せが一致すると開く。元メモの例は`dialog.open && meter.value === 42`で、箱そのものがformへ変形する演出だった。
- 分類理由: 原案の一部は既存stageへ統合・重複するが、`<dialog>`の閉じ方を3種類のplayer操作へ分けた専用stageを新設するため、元案全体の最終分類は`統合案`ではなく`採用`とする。
- `<details>`: S-150-B03として追加する。同じ`name`を持つ複数の`<details>`を置き、user agentが一つを開くと別の一つを自動で閉じる排他的開閉を使う。trustedなsummary操作に続く`toggle`と`open`状態を観測し、盤面の手掛かりどおりの開閉列で1箱を開く。scriptによる属性変更は判定外。
- `<dialog>`: 新規S-610「三つの閉じ方（仮）」を予約し、同じmodal dialogを閉じるplayer操作を3箱へ分ける。
  - S-610-B01 ×: `closedby="none"`のdialog内にある×buttonをtrusted clickし、`<form method="dialog">`または`close()`による`close`を観測する。
  - S-610-B02 外側: `closedby="any"`で開き、dialog矩形外から始まり同じ外側で終わったtrusted pointer操作に続くnative light dismissと`close`を観測する。`closedby`非対応環境へscript模倣の代替clearは作らない。
  - S-610-B03 キャンセル: `closedby="closerequest"`で開き、×buttonとlight dismissを置かず、Escまたは端末の戻る／dismiss操作による`cancel`に続く`close`を観測する。画面内に置く緊急終了buttonはdialogを閉じるだけで解錠しない。
- dialog共通条件: `showModal()`によるtop layerと外側documentのinert化を使う。各試行で一つの閉じ方だけを有効にし、記録した直前のtrusted操作、`cancel`有無、`close`を組み合わせてsourceを区別する。箱を開いた後とstage離脱時は、開いているdialogを閉じてlistenerを破棄する。
- `<input>`: 新しい箱を作らない。playerがinput値を変える中心操作はS-490と重複する。
- `<meter>`: 箱や成功条件にはしない。S-020のviewport幅と目標帯を示す表示UIを`HTMLMeterElement`へ置き換え、現在幅、範囲、最適値を視覚・semanticに示す。S-020の成功条件は従来どおり実`resize`であり、meter値のscript変更では開かない。
- 現状: S-150-B03、S-020のmeter表示、S-610-B01〜B03はいずれも設計決定済み・未実装。
- 根拠: [`<details name>`の排他的group](https://html.spec.whatwg.org/dev/interactive-elements.html)、[`<dialog>`と`closedby` / light dismiss](https://html.spec.whatwg.org/multipage/interactive-elements.html?elementdef-dialog=)。

### DR-028 CSS カウンタースタイル

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: `@counter-style`で箱の目盛りを架空の独自数字へ置き換え、説明文を独自counterの`ol`で並べる。playerが対応表を読み取って2桁＋1桁の答えを通常のinputへ入力し、「異文明の数字を解読した」演出で開箱する案だった。
- 却下理由: `@counter-style`と説明付きcounterを捨て、架空・異文明として見せない方針になったため、CSS Counter Styles API自体は最終stageで使わない。文字を調べて計算する中心操作は残るが、元APIへの統合ではなく独立した新規問題へ置き換える。
- 派生採用: G-061 / S-620「十七の計算式（仮）」を新設する。17個の計算式と対応する17箱、一つの共通入力欄だけを置き、名称、凡例、説明文、`counter-style`はstage内へ表示しない。式の文字は画像化せず、選択・コピー・検索できる実Unicode textにする。
- 収録する17体系: ASCII / European digits、Arabic-Indic digits、Eastern Arabic-Indic digits、漢数字、Osmanya、Adlam、N'Ko、Garay、Ol Chiki、Mro、Wancho、Nag Mundari、Ol Onal、Sora Sompeng、算木数字、Kaktovik numerals、Mayan numerals。内部資料とcreditsでは、言語、文字、歴史的記数法を一律に「言語」と呼ばず正式名称を使う。
- 問題生成: 十進体系は100〜999の3桁＋3桁とし、漢数字は`百`・`十`を使う通常の乗法的表記にする。算木数字は一・百の位と十の位でUnicodeの2形を交互に使い、zero glyphがないためoperandへ0を含めない。KaktovikとMayanは基数20の3桁＋3桁とし、Mayanは最上位桁を上にした縦積みで表示する。全17問の十進回答は互いに異なる固定値とする。
- 操作と成功条件: playerは任意の式を外部で調べて計算し、共通欄へASCII十進整数を入力する。未開封の式の答えと完全一致した場合に、その式へ対応する箱だけを開く。既に開いた答え、空欄、部分一致、不正な文字では開かず、誤答履歴や入力値は保存しない。
- 表示実装: Arabic系、N'Ko、Adlam、Garayなどは各式をbidi isolationし、数字列と共通演算子の順序崩れを防ぐ。対応glyphと再配布可能なlicenseを確認したfontを同梱し、OS fontの有無で豆腐表示にならないようにする。font load失敗時にASCIIへ置換してclear可能にする代替は作らない。
- 文化的扱い: 宗教者の考案・宗教的由来だけでは除外しない。共同体の共通文字、言語保存、文化的自立、教育・一般出版へつながる文字は中立な表現で収録する。Sora Sompengは、複数の非固有文字の競合に対する改善として包括的文化programの中で普及され、宗教以外の印刷物にも使われるため収録する。一方、言語自体の主用途が日曜学校、祈り、聖書瞑想であるMedefaidrinは、説明を置かない算数問題への転用を避けて収録しない。
- 演出: 「異文明」「未知の民族」「古代の暗号」などのラベルは使わない。stage本体は式、箱、入力欄に限定する一方、game内creditsまたは資料画面には各体系の正式名称、communityに関する中立な短記述、一次情報への出典を残す。
- 現状: G-061 / S-620-B01〜B17は設計決定済み・未実装。DR-121のS-650を含む現在の計画値は65stage・153箱になる。
- 根拠: [Unicode 17のscript-specific decimal digits](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-22/)、[Sora Sompengの文化programと利用](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-15/)、[Sora Sompengの文字選択をめぐる背景](https://www.scriptsource.org/cms/scripts/page.php?item_id=script_detail&key=Sora&_sc=1)、[Medefaidrinの典礼用途](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-19/)、[Mayan numeralsの縦積み](https://www.unicode.org/wg2/docs/n4804-mayan-numerals.pdf)。

### DR-029 CSS カスタムハイライト API

- 決定日: 2026-07-21
- 最終分類: 統合案
- 元案: 詩や暗号文の一部をアプリがCustom Highlightで蛍光表示し、その断片を順番に読んで得た鍵文をinputへ入力すると箱が開く。箱面だけに蛍光線が走る演出を想定していた。
- 分類理由: 元案の「表示された箇所を読んで入力」はauthor側の装飾が中心で、鍵文入力はS-490、暗号文・貼付け・SelectionはS-500と重なる。一方、S-030は初期G-003でSelection / Custom Highlightを掲げながら現行B01が純Selectionだけなので、Custom Highlight固有の複数Range保持とrange hit testingを別箱として補う。
- 統合先: S-030へB02とB03を追加する。S-500は現行のCaesar copy override、trusted paste、`busybox`完全Selectionの1箱を維持し、Custom Highlightを追加してchainを長くしない。
- S-030-B02 非連続の蛍光線: playerが一つの文章内に散らした短い断片をtrusted Selectionで一つずつ選ぶ。正しい単一Rangeを選ぶたびにcloneしたRangeを同じ`Highlight`へ`add()`し、`CSS.highlights`へ登録した一つの`::highlight()`で、native Selectionが次へ移っても過去の非連続範囲を残す。指定した3Rangeが正しい順序で揃い、registry内のHighlightがその3Rangeを保持した時に開く。inputは追加しない。
- B02の誤操作: 部分選択、複数targetをまたぐRange、対象paragraph外、順序違いでは追加せず、既に正しく残ったRangeは消さない。resetでだけ空へ戻す。Range端点はgrapheme境界に置き、結合文字の途中を切らない。
- S-030-B03 座標で触る蛍光線: 同じparagraphのDOMをspanやbuttonへ分割せず、複数の名前付きHighlightへ別々または一部重なるRangeを登録する。箱面の色列を手掛かりに、playerが蛍光領域をpointer / touchで順番に直接触る。trusted `pointerup`の`clientX/Y`を`CSS.highlights.highlightsFromPoint()`へ渡し、返された`HighlightHitResult.highlight`集合が次の正解集合と一致した時だけ進め、全列で開く。event targetが共通paragraphであることや手計算したDOMRectだけでは開かない。
- B03の重なり: 一部の正解点は2個のhighlightが重なる領域とし、戻り値が両方のHighlightと対応Rangeを含むことを使う。返却順には依存せず、Highlight objectの集合として比較する。空集合、余分なhighlight、順序違いは入力列を先頭へ戻す。
- 対応差: `Highlight` / `CSS.highlights` / `::highlight()`がない環境はB02 / B03とも未観測とする。`highlightsFromPoint()`がない環境ではB02だけを遊べ、B03は未観測のままにする。DOM `span`、`elementFromPoint()`、Rangeの手動矩形計算によるB03の代替clearは作らない。
- accessibility: B02はnative Selectionと「選択を記録」buttonのkeyboard操作でも同じRange登録経路を使える。B03はpointer座標APIを中心にするため、keyboardだけの別成功条件へ置換しないが、各highlightの存在と進行状態をlive regionへ短く通知し、非対応・入力不能を失敗扱いにしない。
- cleanup / privacy: stage入場ごとに衝突しないregistry名を使い、reset、離脱、abort時に`CSS.highlights.delete()`し、Highlight、Range、pointer / selection listenerへの参照を破棄する。選択文字列、座標、誤操作列は保存・同期・送信しない。
- 現状: 既存S-030-B01は実装済み。B02 / B03は設計決定済み・未実装で、追加後のS-030は3箱になる。`highlightsFromPoint()`はLimited availabilityのため、対象browserで実機確認する。
- 根拠: [CSS Custom Highlight API Level 1](https://drafts.csswg.org/css-highlight-api-1/)、[`highlightsFromPoint()`](https://developer.mozilla.org/en-US/docs/Web/API/HighlightRegistry/highlightsFromPoint)。

### DR-030 CSS フォント読み込み API

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: 正しいfontが読み込まれた時だけ暗号文が可読な書体へ変わり、playerが読んだ答えをinputへ入力すると箱が開く。箱の刻印が別書体へ相転移する演出と、`document.fonts.load()`による配信待ちを想定していた。
- 却下理由: fontの取得、parse、layout完了はbrowser・app・network側の状態であり、元案ではplayerが待って表示後の文字を入力するだけになる。通常のtext inputはS-490、文字を調べて入力する問題はS-620と重なり、font load完了を成功条件にしてもplayer固有の操作にならない。
- 検討した代替: playerがgame配布の`.woff2`を再投入し、`FontFace`へBufferSourceとして渡してdocumentへ追加する案は技術的に成立する。しかし中心操作はS-130のfile書出し・再投入と重複し、任意fontの受入れは不要なparser入力面も増やすため、新箱にはしない。
- 実装基盤との区別: S-620などのself-host fontで`FontFace`、`document.fonts.load()`、`ready`、`loadingerror`をasset準備・失敗表示に使うことは妨げない。ただしこれはDR-030の問題採用・統合とは数えず、font load、cache hit、`loadingdone`だけでは箱を開けない。font失敗時に別書体やASCIIへ置換してclear可能にする代替も作らない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [CSS Font Loading Module Level 3](https://drafts.csswg.org/css-font-loading/)は、未使用fontをUAが必要になるまで読み込まないこと、URLまたはBufferSourceからの`FontFace`生成、FontFaceSetのload状態・event・`ready`を定義している。

### DR-031 CSS 描画 API

- 決定日: 2026-07-24
- 最終分類: 却下。新規stage・問題箱・成功条件には使わない。
- 元案: Paint Workletで箱表面へ生体的なnoise模様を描き、playerがCSS custom propertyのseedまたは周波数をsliderで正解値へ合わせると開く案だった。
- APIの性質: `CSS.paintWorklet.addModule()`で登録したpaint classは、`paint()`のCSS imageとしてbackground、border、content等をprocedural描画できる。要素の描画size、宣言した`inputProperties`、`paint()`引数を受け取れる一方、workletからDOMへ触れたり、表示されたbitmapをmain threadへ成功結果として返したりしない。
- 却下理由: playerの中心操作は通常のsliderによる値合わせであり、成功判定はmain threadが同じcustom property値を見るだけになる。Paint Workletの出力自体を判定しておらず、Canvasや通常CSSによる同じ模様へ置換しても問題が成立する。値合わせはDR-032で却下したdial案、size連動はS-020、procedural描画はS-160等のCanvas表現とも重なる。
- paint実行との区別: user agentは将来使う可能性があるsizeでpaint imageを投機的に生成でき、生成物が実際に表示されない場合もある。paint callbackの呼出し回数、時刻、完了を開箱条件にしない。
- 実装裁量: 将来、既存箱のbackgroundやborderをprocedural描画することで保守性・表現が改善する場合は任意に使用できる。ただしPaint Worklet対応、module load、custom property、描画結果を仕様要件、採用実績、problem ID、fallback分岐へ数えない。
- 対応差: CSS Painting APIはLimited availabilityで一部engineに限られる。任意の装飾へ使う場合も、非対応環境で成功条件や手掛かりを失わせず、同じ問題を遊べる静的表示を維持する。
- 件数: stage・問題箱は増えず、DR-023追加後の計画値は66stage・157箱のまま。
- 根拠: [CSS Painting API Level 1](https://www.w3.org/TR/css-paint-api-1/)。

### DR-032 CSS プロパティと値 API

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: `CSS.registerProperty()`で温度や角度に相当するcustom propertyを型付き登録し、playerが画面内dialで値を精密調整する。登録値が閾値へ一致すると箱が開き、数式的な変形を見せる案だった。
- 調査結果: 登録したcustom propertyにはsyntax、initial value、inheritanceを指定でき、数値・角度・色などは登録型のcomputed valueとしてCSS transition / animationで連続補間できる。同じdocumentのJS登録setへ同名を再登録すると`InvalidModificationError`になり、明示的な登録解除APIはない。
- 却下理由: 元案のplayer操作は通常のdial / sliderで、値合わせは既存S-170のanimation停止や一般的なCSS変形と重なる。S-170-B01の単純移動をtyped custom propertyで複数の歯車・色・変形へ広げる表現案も成立するが、成功条件は同じであり、既存実装より必ず簡単にはならない。
- 実装裁量: 将来S-170 / S-340等の演出を変更する時に、型付きcustom propertyがコード量や保守性を下げるなら使用してよい。使わなくても仕様欠落とはせず、API利用、連続補間、登録成否を箱の成功条件・必須PoC・対応判定へ含めない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api/)は、登録propertyの型、computed value、補間、JS登録setを定義している。

### DR-033 CSS 型付き OM API

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: playerが箱の位置・回転を数式的に微調整し、`attributeStyleMap.set()`へ`CSS.deg(45)`のようなtyped CSS値を設定して、計算誤差なく正解姿勢へ合わせる精密機械風の問題だった。
- 調査結果: Typed OMはCSS値を文字列ではなく`CSSStyleValue`、`CSSUnitValue`、`CSSTransformValue`等として読み書きし、unit-awareな演算、変換、StylePropertyMapへの直接設定を可能にする。文字列生成・parse・serializeを減らし、高頻度のstyle操作を実装しやすくすることが仕様目的に含まれる。
- 却下理由: playerが行うのは通常のdrag / dial / 端末回転で、typed objectを操作するのはapp内部だけである。単位tileやtransform順序の問題へ作り替えても、中心は通常の単位計算・並べ替えで、Typed OMでなければ成立しないplayer操作にはならない。
- 実装裁量: S-100の姿勢表示、S-170 / S-340のtransformなど、高頻度更新やunit変換で現行のCSS文字列より実装が簡単になる場合は任意に利用できる。使わなくても仕様欠落とはせず、Typed OM対応、typed演算、StylePropertyMapへの設定を箱の成功条件・必須PoCへ含めない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [CSS Typed OM Level 1](https://drafts.css-houdini.org/css-typed-om/)は、typed JS objectによるCSS値操作、unit-aware演算、StylePropertyMapを定義している。

### DR-034 CSSOM

- 決定日: 2026-07-24
- 最終分類: 却下。新規stage・問題箱・成功条件には使わない。
- 元案: 箱のstylesheetへruleを追加、削除、並べ替え、または宣言変更し、CSSRuleの組が答え状態になると開く。「実験室の配線盤」のようなgame UIと`CSSStyleSheet.insertRule()`を想定していた。
- game UI案の却下理由: rule候補をbutton、select、drag等で操作させる場合、playerの中心操作は通常の選択・並べ替えになる。CSSOMはapp内部の状態更新手段に留まり、DOM class、inline style、stateから生成したstylesheetでも同じ問題になる。
- DevTools案の却下理由: Styles panelやConsoleから実CSSStyleRuleを変更させる案はCSSOMを直接触れるが、同時にplayerへDOM、style、script、進捗object等の任意編集を促し、ほぼ何でもありの解法になる。本作の問題境界と発見の芯を損なうため、開発者向けHidden箱にも採用しない。
- Console APIとの分離: DR-120はpage編集を要求せず、Consoleをread-onlyの文字画面として使う別案を検討できる。consoleへASCII盤面、table、group、色付きstatusを出し、入力はpage上の通常操作から受ける案であり、CSSOM採用やDevTools編集の根拠にはしない。
- 実装裁量: app自身がstylesheetを管理する必要がある場合に`CSSStyleSheet.cssRules`、`insertRule()`、`deleteRule()`等を通常実装として使うことは妨げない。ただしAPI利用、rule数、computed style、DevTools変更を箱、採用実績、feature detectionへ数えない。
- 件数: stage・問題箱は増えず、DR-023追加後の計画値は66stage・157箱のまま。
- 根拠: [CSS Object Model](https://www.w3.org/TR/cssom-1/)。

### DR-036 幾何インターフェイス

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: playerがレンズや反射板を操作し、`DOMPoint`を`DOMMatrix`で変換した光線が鍵穴へ到達すると箱が開く、幾何学的な光線simulationだった。
- 調査結果: Geometry Interfacesは2D / 3Dの点、矩形、四辺形、3x2 / 4x4変換行列を共通表現し、`matrixTransform()`、行列の積・逆変換等をSVG、Canvas、CSS Transformsなどから利用するための基礎型である。
- 却下理由: レンズ問題はgameとして成立するが、playerが触るのは通常のdrag / rotateで、DOMPoint / DOMMatrixはapp内部の行列計算にしか現れない。同じ結果を一般の数値配列や幾何libraryでも作れ、API固有のbrowser操作・状態・描画にはならない。
- 実装裁量: S-160のpointer座標変換、Canvas / SVG描画、変形したelementのhit testなどで標準型を使う方が簡単なら任意に利用できる。使わなくても仕様欠落とはせず、Geometry Interfacesの使用、計算結果、object型を箱の成功条件・必須PoCへ含めない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [Geometry Interfaces Module Level 1](https://drafts.csswg.org/geometry/)は、他のmoduleや仕様が使用する点・矩形・四辺形・変換行列の基本interfaceとして定義している。

### DR-047 ナビゲーション API

- 決定日: 2026-07-21
- 最終分類: 統合案
- 元案: Navigation APIのentry列を迷路の部屋として見せ、playerが複数のsame-document navigationを進み、戻る・進む・別経路への分岐で正しいentry sequenceを作る。現在entry、戻れるか、進めるか、entryが破棄されたかを箱の状態へ反映する案だった。
- 統合理由: browser履歴そのものを操作する中心動詞は、既存G-019 / S-220のsame-document Back、full-document back-forward復帰、reloadと同じである。一方、Navigation APIには「Backした位置から新しいentryをpushすると旧forward entryがpruneされ、各`NavigationHistoryEntry`へ`dispose`が発火する」という、既存3箱にないplayer可変の履歴分岐があるため、単独stageではなく第4箱として残す。
- 統合先: S-220-B04「枝を切る箱」を追加する。stage数は増やさず、問題箱を1個増やす。
- 操作手順: playerがstage内のtrusted UIを順に操作して、`navigation.navigate()`によるround固有state付きsame-document entry A → B → Cを実際に作る。次にbrowserのBackを2回使ってAへ戻り、そこから別の選択肢Dへ進む。stage内に模擬Back buttonは置かず、scriptだけの`navigation.back()`では「playerが戻った」条件を満たさない。
- 成功条件: Aへの2回のuser-initiated traverseを観測したroundでDをpushし、事前に保持したBとCの`NavigationHistoryEntry`がそれぞれ`dispose`を発火し、`navigation.currentEntry`がD、かつ`navigation.canGoForward === false`になった時だけ開く。`dispose`の発火順には依存しない。
- 誤操作: Aから直接Dへ進む、URL queryだけを書き換える、entry数だけを合わせる、B / Cを残したままD相当の画面を表示する、scriptだけで戻る、別roundのentryを使う場合は開かない。途中で別entryへ移動した場合はroundをやり直す。
- 対応差: `window.navigation`、`entries()`、`currentEntry`、`NavigationHistoryEntry.dispose`のいずれかがない環境ではB04を未観測とする。History APIで同じ見た目を作る代替clearは用意せず、B01〜B03は独立して遊べる状態を維持する。
- 保存・cleanup: round中のentry object、key、id、state、listenerだけをmemoryに保持し、entry key / idやroute履歴を進捗、storage、Drive、analyticsへ保存しない。開箱、reset、離脱、abort時にlistenerと参照を破棄し、試行ごとの履歴汚染を固定上限内に収めてstageの開始entryへ戻せる導線を用意する。
- 現状: S-220-B01〜B03は実装済み。B04は設計決定済み・未実装。DR-121の追加を含む計画値は65stage・153箱である。
- 根拠: [HTML StandardのNavigation API](https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigation-api)、[MDN Browser Compatibility DataのNavigation](https://github.com/mdn/browser-compat-data/blob/main/api/Navigation.json)。

### DR-049 URL Fragment Text Directives

- 決定日: 2026-07-24
- 最終分類: 採用。新規G-068 / S-690「断片をたどる文書（仮）」に1箱を置く。
- 元案: 長文のどこを参照すべきか自体を謎にし、正しいText Fragmentへjumpした時点で開箱する。「この一節だけ読め」という演出と、scriptから`location.hash = ":~:text=secret"`を設定する例だった。
- 再設計: 一つの長いstage document内に複数の同一page Text Fragment linkを置く。playerは通常のlink activationで`#:~:text=...`付きURLへ順にnavigateし、browserがscroll / highlightした各一節からhint片を集める。集めたhintを組み合わせてpage上の最終回答欄へ提出し、完全一致した時に一箱を開く。
- 成功条件の境界: fragment directiveはsession history entryのdirective stateへ分離され、`location.href` / `location.hash`から取り除かれる。`document.fragmentDirective`もfeature detection用の空interfaceで、match rangeや成否eventを返さない。このため個々のjump、highlight、scroll位置を開箱条件として検出せず、最終回答だけをpage stateで判定する。scroll量、`IntersectionObserver`、`scrollend`、`:target`をText Fragment成功の代替証拠にしない。
- 中心操作: page内の模擬検索buttonやscriptによる`scrollIntoView()`ではなく、round用の実`<a href="...#:~:text=...">`をplayerがactivateする。各遷移は同一documentのまま行い、通常fragment IDだけで同じ位置へ移動する代替clearは作らない。browser Backで前の断片へ戻れることを妨げず、history entry数は固定上限にする。
- 謎の保留範囲: 一節数、巡回順、hint片の形式、最終回答、誤答時の戻し方、URLを直接読んだだけで答えが漏れない文面、総当たり耐性は実装前に再吟味する。この内容が確定するまでS-690の実装へ着手しない。
- 対応差: `document.fragmentDirective`をfeature detectionに使える環境を優先するが、実Text Fragment対応との実装差を実機で確認する。非対応、link activation後にtextが示されない環境では未観測として案内し、通常anchor、app独自highlight、find-in-pageによる代替clearを作らない。
- accessibility / privacy: long documentの通常reading順とkeyboard link操作を維持し、UA highlightの色だけにhintを載せない。URLにはround用の公開文面だけを含め、token、個人情報、保存進捗を埋め込まない。保存するのは解決済みproblem IDだけで、巡回順、scroll位置、誤答、閲覧時刻は保存・同期・送信しない。
- 検証: 自動testは各hrefのdirective syntax、全target textの存在と一意性、巡回graphの到達性、最終回答、reset、固定history上限を確認する。実browserでは同一page jump、highlight / scroll、Back、reload、keyboard操作、長文layout、非対応時の未観測を確認する。謎fixtureと完全解は詳細確定後に追加する。
- 件数: 新規1stage・1箱を追加し、計画値は69stage・160箱とする。
- 2026-08-09追加: D-136で派生G-079 / S-800を別stageとして採用した。英文上部にfragment表示B01と単語表示B02を置き、player自身が同一pageのfragment URLを組み立てる。`hidden="until-found"`と`beforematch`で対象語の出現と箱の開放を結ぶ。具体問題は別途吟味し、現在の全体計画値は79stage・187箱とする。
- 根拠: [URL Fragment Text Directives](https://wicg.github.io/scroll-to-text-fragment/)、[CSS Pseudo-Elements Level 4の`::target-text`](https://drafts.csswg.org/css-pseudo-4/#selectordef-target-text)。

### DR-050 URL パターン API

- 決定日: 2026-07-21
- 最終分類: 却下
- 元案: playerが箱の迷路配線図から正しいroute構造を推理してURLを辿り、`new URLPattern('/box/:face/:code').test(url)`へ一致する遷移を完成させると開く案だった。
- 調査結果: `URLPattern`はprotocol、hostname、pathname、search、hash等をcomponentごとのpatternへ照合し、`test()`で真偽、`exec()`で名前付きgroupを返す。navigation、address bar入力、履歴変更、route eventは起こさず、任意に渡されたURL文字列またはcomponent objectを解析するAPIである。
- 却下理由: playerが行う「アドレスバーでpathname / query / hashを組み立てる」操作は採用済みDR-048 URL APIのURLダイヤルと同じである。成功判定をURLPatternに置き換えても、playerから見えるbrowser固有の操作・状態・描画・性能は増えず、正規表現や通常のURL比較でも同じ問題になる。
- 実装裁量: DR-048またはS-220のroute判定を実装する際、名前付きgroupやcomponent別patternによって実装が簡潔になるなら内部でURLPatternを使ってよい。正規表現、`URL`、`URLSearchParams`、明示比較の方が簡単なら使わなくてもよく、URLPatternの利用や一致結果を箱仕様・必須PoCへ含めない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [URL Pattern Standard](https://urlpattern.spec.whatwg.org/)。

### DR-052 ウェブコンポーネント

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: 各箱を`<busy-box>` custom elementとして独立実装し、component内部のstate machineが完了すると開く。箱ごとに固有の振る舞いを保てる開発基盤として提案されていた。
- 調査結果: Custom Elementsはauthor定義elementのparser統合、後発upgrade、lifecycle reaction、`ElementInternals`等を提供する。Shadow DOM、`<template>`、`<slot>`と組み合わせれば内部DOM / CSSのencapsulationとlight DOM投影も行えるが、いずれもauthor向け実装機構で、playerが直接操作するbrowser所有UIではない。
- 新規案の評価: 未定義`<busy-box>`を後からupgradeする案は、playerにはgame製buttonでmoduleを読み込んで箱の見た目が変わるだけに見える。light DOM部品をnamed slotへ配置する案も、player体験は既存Drag and Drop問題と同じで、`slotchange`や`assignedElements()`は内部判定へ隠れる。
- 統合先案との区別: 現在のReact `GiftBox` / stage runtimeをCustom Elementsへ全面移行してもplayerの解法は変わらないため、API網羅を目的とした移行は行わない。外部documentとの境界など局所的な理由が生じた場合はCustom Elements、Shadow DOM、slot、ElementInternalsを内部利用してよいが、それだけでは採用stage、問題箱、API固有PoCへ数えない。
- 件数: 計画値は76stage・179箱のままとする。
- 根拠: [HTML Standard Custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html)、[DOM Standard Shadow trees](https://dom.spec.whatwg.org/#shadow-trees)。

### DR-063 ウェブ音声 API

- 決定日: 2026-07-21
- 最終分類: 統合案
- 元案: playerが合言葉を唱えて認識結果を正答へ合わせる、または箱が合成音声で指示を囁きplayerが従う。箱が囁き、playerが唱えると返歌する演出を想定していた。
- 既存との重複: 音声認識側はG-057 / S-580-B01で実装済みである。明示buttonからone-shot recognitionを開始し、final resultを正規化して`busybox`なら開くため、同じ認識問題は増やさない。
- 統合先: S-580へSpeechSynthesis専用のB02を追加する。B01へ合成音声を混ぜず、認識と合成を独立した2箱にする。stage数は増やさず、問題箱を1個増やす。
- B02の操作: 1〜12文字のASCII小文字をinputへ入れ、trustedな「読ませる」操作で提出する。入力の1文字目をalphabetで+1、2文字目を+2、3文字目を+3と位置ごとにshiftし、zの次はaへwrapする。たとえば`aaaaaaa`は`bcdefgh`へ変換される。
- 音声出力: 変換結果は画面、DOM、status、accessible nameへ表示せず、`SpeechSynthesisUtterance`が`en-US`で一文字ずつ区切って読み上げる。前のutteranceは新しい提出前に`cancel()`し、queueへ試行を積まない。playerは複数の入力と読み上げ結果から規則を推測する。
- 成功条件: `aspuwiq`を同じ規則で変換すると`busybox`になる。変換結果が`busybox`の提出について、対応utteranceが実際に`start`し、取消やerrorなしで`end`へ到達した時だけB02を開く。内部文字列一致だけ、発話開始だけ、直接`busybox`を入力した場合では開かない。
- 誤操作: 空欄、ASCII小文字以外、13文字以上は発話せず入力条件を案内する。入力値、変換結果、試行回数、発話履歴は保存・同期・送信しない。
- 対応差・cleanup: `speechSynthesis`または`SpeechSynthesisUtterance`がない環境、利用可能voiceがない環境、発話errorではB02を未観測とし、録音音声や画面表示による代替clearを作らない。再提出、reset、離脱、abort時に`speechSynthesis.cancel()`し、utterance event listenerと参照を破棄する。
- 現状: S-580-B01は実装済み。B02は設計決定済み・未実装。DR-121の追加を含む計画値は65stage・153箱である。
- 根拠: [Web Speech API Community Group Report](https://w3c.github.io/speech-api/speechapi.html)。

### DR-065 オーディオセッション API

- 決定日: 2026-07-24
- 最終分類: 統合案。既存G-041 / S-430へB02を追加する。
- 元案: BGM、効果音、音声案内の優先度をpage上で切り替え、`navigator.audioSession.type === "playback"`等の指定typeになれば開箱する。「儀式モード」へ入る演出だった。
- 元案から破棄する部分: `AudioSession.type`はapp自身が設定する宣言値であり、playerがselectやbuttonを選んだ直後に同じpage stateだけで判定できる。`auto`、`playback`、`transient`、`transient-solo`、`ambient`、`play-and-record`を順に設定すること自体は問題箱にしない。duck、mix、exclusiveの聴感だけを自己申告させる案も採らない。
- 統合理由: 既存S-430-B01はcontrolsなし生成loop audioへ届くMedia Sessionのexternal `pause` actionを観測する。同じ「page外の音声制御」stageで、Audio Session固有のread-only `state`と`statechange`によるaudio focus interruption / recoveryを独立B02にすると、生成音とcleanupを共有しつつ中心eventを分けられる。
- B02開始: playerの明示操作からB02専用の生成loop audioを再生し、`navigator.audioSession.type = "playback"`を設定する。実`playing`と`audioSession.state === "active"`を同じ試行で観測してからarmedにする。type設定だけ、`active`だけ、無音source、autoplay失敗では進めない。
- 成功条件: armed後に実`statechange`で`interrupted`を観測し、その後に同じ試行で`active`へ戻り、対象media elementの再生復帰を`playing`で確認した時だけS-430-B02を開く。`inactive`、通常の`pause` event、Media Sessionのpause handler、visibility、page内停止button、cleanup、scriptからの再生停止では開かない。
- 外部入力の境界: incoming call、別tab、別app等は仕様上の例だが、pageはinterruption sourceを識別できない。UIでは「外部の音声に中断され、戻る」とだけ案内し、特定アプリや電話を要求・断定しない。ゲーム自身が別tab、別AudioContext、別media element、OS操作を起動してinterruptionを生成しない。
- 対応差: `navigator.audioSession`、`state`、`statechange`、`type = "playback"`が成立する環境だけをLabs対象にする。実装差で`interrupted`または自動再生復帰を観測できない環境は未観測とし、Media Session action、通常pause、page内模擬stateによる代替clearを作らない。
- 分離とcleanup: B01とB02は別試行にし、同じeventを両方へ流用しない。停止、開箱、reset、離脱、abort時にaudioをpauseし、sourceを破棄し、AudioSession listenerを解除して`type`を`"auto"`へ戻す。Media Session handler、metadata、playbackStateも既存B01の手順で戻す。type列、state列、時刻、外部音声情報を保存・同期・送信しない。
- 検証: 自動testはtype設定、active後のarming、`active → interrupted → active → playing`、順序違い、inactive、通常pause、B01との分離、重複event、cleanupをstubで確認する。実機では対応Safari / WebKit環境を中心に、別tab / app、system interruption、復帰、silent mode、background、headset、type resetを確認する。
- 件数: stage数は増やさず1箱を追加し、計画値は69stage・161箱とする。
- 根拠: [Audio Session](https://w3c.github.io/audio-session/)はtype、read-only state、`statechange`、audio elementのinterruption時pauseと復帰時playを定義する。

### DR-069 Media Capabilities API

- 決定日: 2026-07-21
- 最終分類: 統合案
- 元案: 複数の動画形式から滑らかに再生できるものを見抜き、その形式の箱だけを開く。「重い映像を嫌う箱」として、`navigator.mediaCapabilities.decodingInfo()`が最も適したprofileを返すことを問題にする案だった。
- 調査結果: Media Capabilitiesはnative playerで現在選択中の画質やFPSを取得しない。authorがcodec、width、height、bitrate、framerate等を含む仮想構成を渡し、`supported`、`smooth`、`powerEfficient`を得る。実mediaからは別APIでnatural / frame解像度、presented frame列、subtitle / audio track状態を観測できるが、UA固有の画質menu内部やその選択labelを読む標準APIはない。
- 現行構成: B01 seek、B02 mute、B03 play後pause、B04 native再生速度、B05字幕track、B06 native PiP。frame cadenceはG-080 / S-810-B01へ分離し、対応環境限定の音声trackを合意済みIDの将来B07とする。
- Media Capabilities profile案: D-141で不採用。`decodingInfo()`はauthorが候補構成を照会するAPIで、字幕trackのようなnative解像度選択UIではない。
- S-810-B01 frame cadence: 同一originの可変frame-rate動画内に12 / 24 / 30 / 60fpsの区間を用意し、playerがnative seekで24fps区間を探す。`requestVideoFrameCallback()`の連続した`mediaTime`差を使う。
- frame解像度reel案: D-142で不採用。page製selectorしかなくbrowser特有のUIを使わない。
- S-350-B04 再生速度: native controlsで1倍速以外へ変更し、`ratechange`後の実`playbackRate`で開く。pageは速度を変更しない。
- S-350-B05 字幕track: native controlsの字幕menuからtarget label `Busybox`を選び、targetだけが`showing`になった時に開く。
- 将来S-350-B07 音声track: native controlsと`AudioTrackList`の双方を公開するbrowserだけでtarget label `Busybox`の選択を観測する。custom selectや別file再生では代替しない。
- cleanup / privacy: mediaをpauseし、track / media listenerを解除する。再生速度、track選択、言語、device能力は進捗以外へ保存・同期・送信しない。
- 現状: S-350-B01〜B06とS-810-B01を実装済み。Media Capabilities profile箱は不採用。
- 根拠: [Media Capabilities](https://www.w3.org/TR/media-capabilities/)、[HTML Standardのmedia elementとtrack API](https://html.spec.whatwg.org/multipage/media.html)、[`requestVideoFrameCallback()`仕様](https://wicg.github.io/video-rvfc/)。

### DR-074 Encrypted Media Extensions API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: 正しいlicenseを得た者だけが見られる保護mediaへ鍵を埋め、復号・再生に成功した映像内codeで開箱する。「許された者だけが見られる封印映像」という演出だった。
- 調査結果の訂正: EMEは商用DRMやproprietary license serverを必須にしない。全準拠user agentの共通baselineである`org.w3.clearkey`なら、暗号化media、KID、key、Clear Key licenseを固定assetとしてGit管理し、pageが`MediaKeySession`のmessageへlocal responseを`update()`する静的構成で成立する。backend必須という暫定理由は撤回する。
- 新規案の評価: 複数license cardからKIDに合う一枚を選ぶ箱と、異なるKIDの保護区間へ順にkeyを入れるrotation箱を検討した。実EME pipelineを通り、key status、`waitingforkey`、再生再開を成功条件にできるため、内部機構としてはAPI固有である。
- player可視状態: 仕様が保証するのはusable keyがない時に`readyState`を下げ、`waitingforkey`を発火して再生をsuspendし、key取得後に再開を試みることだけである。鍵icon、error文、spinner、license prompt等のEME専用default UIはない。unsupported key systemや不正licenseはpromise rejection、wrong KIDは鍵待ち継続、wrong keyは復号またはdecode errorになり得るが、専用表示を保証しない。
- 却下理由: playerからはnetwork bufferingやgeneric media errorに近い停止・再開に見え、EME固有性を説明するにはgame製status、license card、動画内演出が中心になる。本作が重視するbrowser所有UIまたは明確な固有操作として弱いため採らない。
- 実装裁量・件数: Clear Key fixtureをmedia pipelineの内部testへ使うことは妨げないが、それだけでは採用stageやAPI固有PoCへ数えない。計画値は76stage・179箱のままとする。
- 根拠: [Encrypted Media Extensions 2](https://www.w3.org/TR/encrypted-media-2/)。

### DR-075 Remote Playback API / DR-016 バーコード検出 API

- 決定日: 2026-07-24
- 最終分類: DR-075とDR-016をともに採用する。新規G-069 / S-700「遠くの映写箱（仮）」へ2箱を置き、DR-016はS-700-B02の実装先を得る。
- DR-075の元案: 外部再生機器にだけ「箱の裏側」のhintを映し、外部表示中の動画と手元端末の入力を組み合わせて開箱する案だった。
- 元案の能力修正: Remote Playbackは任意の別documentや自由なreceiver UIを外部画面へ送るAPIではなく、一つの`HTMLMediaElement`のmediaを選択した再生先へremotingする。外部画面だけに別内容を生成する想定は捨て、same-originのself-hosted動画内に文字鍵区間とQR区間をあらかじめ収録する。
- 共通開始条件: playerの明示操作から`media.remote.prompt()`を呼ぶ。picker取消、機器なし、`prompt()`のpromise解決、`connecting`だけでは進めず、`connect` eventまたは`remote.state === "connected"`を観測してからcurrent roundの区間を再生する。通常local再生とPicture-in-Pictureは接続の代替にしない。
- media構成: 外部再生先がURLから取得できる有限個の動画資産または複数区間を用意し、roundごとにslotを選ぶ。Blob URL、MediaStream、動的canvas capture、送信先だけの別documentへ依存しない。各slotはround IDとchecksumへ結び、別roundの文字鍵やQRでは開かない。
- S-700-B01 文字鍵: `connected`中にround指定区間を実再生した後、外部画面に現れる短い文字鍵を手元pageへ入力する。提出時にも接続中であり、再生済みslotとcurrent roundの正規化済み鍵が一致した時だけ開く。鍵を手元video、poster、DOM、logへ表示しない。
- S-700-B02 QR: DR-016の元案を外部映写へ具体化する。別の明示操作からvideo-only cameraを開始し、手元previewのframeを`BarcodeDetector({ formats: ["qr_code"] })`で読む。`BarcodeDetector.getSupportedFormats()`に`qr_code`が含まれ、Remote Playback接続中にround指定QR区間を再生済みで、検出した`rawValue`がcurrent round tokenと完全一致した時だけ開く。
- QRの境界: cameraが実際に外部画面を向いているかをWeb APIから証明することはできない。そこで接続中、指定区間再生済み、round token一致を同時に要求し、印刷した固定QRや汎用QRだけでは開かないようにする。JS製decoder、画像upload、手入力、手元pageへのQR再表示、古いround tokenを代替clearにしない。
- 対応差: Remote Playback、外部再生機器、camera、`BarcodeDetector`、`qr_code` formatの交差が成立する環境だけをLabs対象にする。B02が非対応でもB01は独立して遊べる。能力不足や拒否を模擬成功へ変えず、未観測として表示する。
- DR-076との差: S-700はmediaのremote再生だけを扱う。外部画面に独立したreceiver documentを開き、senderとmessageを交換する可能性があるPresentation API案はDR-076として次に別途相談する。
- privacy / cleanup: device名、availability履歴、接続先、video frame、camera画像、decoded値、入力鍵、観測時刻を保存・同期・送信しない。開箱、停止、reset、離脱、abort時にmediaをpauseしてsourceをresetし、availability watcherとevent listenerを解除し、必要なら`disableRemotePlayback`で切断する。全camera trackを`stop()`し、preview、canvas、ImageBitmap、検出loopを破棄する。
- 検証: 自動testはroundとslotの対応、prompt前後、state列、区間gate、文字鍵とQR tokenの一致・不一致、supported format、重複検出、切断、cleanupをstubとfixtureで確認する。H-040では対応送信端末とAirPlay等の外部再生先を使い、実remote表示、B01入力、B02 camera読取、拒否、切断、再接続、track停止を確認する。
- 件数: 新規1stage・2箱を追加し、計画値は70stage・163箱とする。
- 根拠: [Remote Playback API](https://w3c.github.io/remote-playback/)は`HTMLMediaElement.remote`、explicit prompt、接続状態とeventを定義する。[Shape Detection API](https://wicg.github.io/shape-detection-api/#barcode-detection-api)は`BarcodeDetector`、対応format照会、`BarcodeDetectorResult.rawValue`を定義する。

### DR-076 Presentation API

- 決定日: 2026-07-24
- 最終分類: 統合案。既存G-069 / S-700「遠くの映写箱（仮）」へB03を追加する。
- 元案: 手元端末を鍵盤、外部画面を箱本体として分離し、controllerとreceiverの間で正しいmessage列を交換すると開く。手元が外部画面のcontrollerになる展示向けパズルだった。
- 元案から破棄する部分: 正しいmessage列、外部画面だけに出る手順、複数keyの入力、順序誤りによるresetを問題にしない。WebSocket、WebRTC、別tab通信との違いを増やすために複雑なprotocolを足さず、playerの中心操作を「Presentation APIで外部画面へ実表示する」一動作へ絞る。
- 統合先と理由: S-700-B01 / B02はRemote Playbackで同じmediaを外部再生する。B03は独立したreceiver documentをpresentation displayへ起動する別APIだが、手元端末と外部画面を用意する物理構成を共有するため、別stageを増やさず同じG-069へ置く。
- 開始: same-originの固定receiver URLから`new PresentationRequest(receiverUrl)`を作り、playerが「外部画面へ映す」buttonを押したtransient activation内で`start()`する。browserのdisplay picker、許可、対応display選択をplayer自身が完了する。
- 成功条件: `start()`が返した実`PresentationConnection`が`connected`になった後、controllerからcurrent roundの初期化messageを1回だけ送る。receiver側が`navigator.presentation.receiver.connectionList`から同じ接続を取得し、round用画面の初期描画後に返す`ready`をcontrollerが受けた時点でS-700-B03を開く。この1往復は表示準備確認だけで、謎や追加入力にはしない。
- 代替禁止: `PresentationRequest`やreceiver APIの欠損、picker取消、`NotFoundError`、`NotAllowedError`、接続前、receiver読込失敗、`closed`、`terminated`では開かない。通常の`window.open()`、browserの画面ミラーリング、Remote Playback、Picture-in-Picture、local iframe、scriptが直接生成した模擬messageで代替clearしない。
- 対応差: Presentation APIはsecure contextかつ限定対応で、receiver URLを表示できるpresentation displayが必要である。条件が揃わない環境ではB03だけを未観測にし、B01 / B02へ影響させない。
- privacy / cleanup: `getAvailability()`による常時探索、`navigator.presentation.defaultRequest`、presentation ID保存、`reconnect()`を使わない。device名、display情報、connection ID、ready message、観測時刻を保存・同期・送信しない。開箱演出後、reset、離脱、abort時にlistenerを解除し、所有するconnectionを`terminate()`してreceiver contextとmemory上のroundを終了する。
- 検証: 自動testは明示操作、`start()`結果、connected前の拒否、round付きready、別round、模擬message、close / terminate、cleanupをstubで確認する。H-041では対応browserと実presentation displayでpicker、receiver表示、ready、取消、機器なし、読込失敗、切断、終了を確認する。
- 件数: stage数は増やさず1箱を追加し、計画値は70stage・164箱とする。
- 根拠: [Presentation API](https://www.w3.org/TR/presentation-api/)はsecure context、transient activation付き`start()`、`PresentationConnection`、receiverの`connectionList`、双方向messageを定義する。

### DR-077 Insertable Streams for MediaStreamTrack API

- 決定日: 2026-07-25
- 最終分類: 採用。新規G-070 / S-710「合言葉変換所（仮）」へ4箱を置く。相談から派生した別pipelineのG-071 / S-720「映像復元機（仮）」も4箱で採用する。
- 元案: 走査線、frame位相、四分割位置が崩れた映像に対して、playerが3段の変換順を選び正しい映像へ戻す。MediaStreamTrackのframe途中変換を使うが、変換順選択が通常の並べ替えに見える点と、API固有の気づきが弱い点を再吟味していた。
- 新規案G-070の体験: 一見すると動画変換・低bitrate圧縮toolで、上部に4箱、左にfile選択または最大10秒のwebcam録画、右に変換後videoの自由再生とdownload、下に共通合言葉欄を置く。file入力も先頭10秒まで、video-only、640×360・15fpsを基準とし、入力size、出力size、出力 / 入力比を表示する。`videoBitsPerSecond`は初期候補384kbpsの低い固定hintとし、必ず小さくなるとは表示しない。
- G-070のpipeline: fileはdecoded `<video>.captureStream()`、cameraは`getUserMedia()`からtrackを得る。DedicatedWorker内の`MediaStreamTrackProcessor`で`VideoFrame`を読み、変換後frameを`VideoTrackGenerator`へ書き、previewと`MediaRecorder`のWebM出力へ流す。Canvas / CSSだけで同じ成功条件を模倣せず、非対応環境は未観測とする。frame stepまたはslow playbackを用意し、1 frameだけの置換をplayerが探せるようにする。
- S-710-B01 暗闇: decoded frameの全pixelについてR / G / Bがすべて`0x00`〜`0x10`なら該当する。alphaは無視し、full-resolutionをearly exit付きで走査する。条件を満たしたその1 output frameだけを白文字`DARK FRAME`の全面表示へ差し替える。
- S-710-B02 decode不能: 入力を動画としてdecodeできなかった場合の別error経路であり、Insertable Streams変換ではない。壊れた動画に限定せず、動画でないfileでも発火してよい。固定語`BROKEN INPUT`を1 frame表示する短いerror動画を事前生成してGit管理し、変換結果として返す。静止区間問題へ変更しない。
- S-710-B03 QR frame: bundled JS / Wasm QR decoderで、15fps出力中の例として5fps相当のdownscaled sampleを読む。QRを検出したsampleに対応するその1 output frameだけを、固定flag `BUSYBOX{qr_frame_became_the_message}`をencodeした全面QRへ差し替える。1秒等へ延長しない。これはmarker読取であり`BarcodeDetector`実績へ数えない。
- S-710-B04 自己生成metadata: S-710の全正常出力をWebM / Matroskaでremuxし、`BUSYBOX_TRANSFORMER=S710_V1`等の固定SimpleTagを付ける。S-710生成動画を再入力した場合は全frameへ固定語`SECOND PASS`を全面overlayする。MediaRecorderだけでは任意metadataを付けられないため、container libraryを使う。合言葉自体をtag値に埋めず、tagがない通常動画をfilenameや拡張子だけで自己生成扱いしない。
- G-070の媒体・privacy: B02のerror動画、QR template、基準fixtureなど事前確定できる媒体はsource、生成script、checksumとともにGit管理する。player入力から生じる変換出力だけをruntime生成し、serverへuploadしない。停止、完了、reset、離脱時に全trackとframeを閉じ、reader / writer / worker / recorderを終了し、object URLをrevokeする。
- G-070の検証: 暗闇境界`#101010` / `#111010`、alpha無視、該当frameだけの置換、decode失敗別経路、sample対応frameだけのQR置換、metadata remux、再入力時全frame overlay、固定flag、size比、10秒上限、frame close、abortを自動確認する。H-042で対応browser、webcam、各codec、長短file、download再入力、CPU / memory、非送信を確認する。
- 派生案G-071の体験: 上部4箱をclickすると、約360×360・数秒の逆変換済みfixture動画をdownloadする。画面にはT1 / T2 / T3用の複数file入力laneと、各結果のpreview / downloadを置き、出力を次のlaneへ渡せるようにする。別deviceを必須にしないQR読取laneも置き、bundled JS / Wasm decoderがdistinct payloadをcopy可能なtextで表示する。
- G-071-T1: 左右半分を交換し、`output(x,y)=input((x+180) mod 360,y)`とする。360×360入力で自分自身が逆変換になる。
- G-071-T2: 各decoded frameを白1・黒0へ二値化し、`result(x,y)=Π frames`で時間方向へ乗算する。一度でも黒だったpixelは最終的に黒となる。全frameを保持せず360×360 mask一枚へ累積し、結果画像で全output frameを置換する。
- G-071-T3: 1-basedの奇数frameは左半分だけを採用して右を白、偶数frameは右半分だけを採用して左を白にする。
- D-144で製品UXをpatch bayへ改訂した。左のVIDEO 1〜3、中央のT1〜T3、右のOUTPUTをout→inのBezier cableで結び、正規routeへ到達したときだけ事前生成済み復元動画をOUTPUTでloop再生する。downloadとfile pickerは製品経路に置かない。
- S-720-B01は`VIDEO 1→T1→OUTPUT`で`BUSYBOX{swap_halves}`、B02は`VIDEO 2→T2→OUTPUT`で`BUSYBOX{merge_frames}`を復元する。
- S-720-B03は`VIDEO 3→T3→T2→OUTPUT`で`BUSYBOX{odd_even_alpha}`、B04は同じVIDEO 3を`T1→T3→T2→T1→OUTPUT`へ通して`BUSYBOX{swap_route_beta}`を復元する。B04は一つのT1 nodeへcycleして二度通す。
- G-071の製品fixture保証: 360×360・12fps・24 frameのsource 3本、途中2本、復元4本を生成script、manifest、SHA-256とともにGit管理する。PoCの逐次seek / canvas verifierは履歴検証に限定し、製品stageのruntimeへ持ち込まない。
- G-071の媒体・検証: 3種類のfixture、元QR、期待復元画像はすべて事前生成し、source、生成script、codec条件、checksumとともにGit管理する。runtimeでfixtureを作り直さない。各fixtureについて全frame・複数scaleをQR scanし、意図した順序前にfinal payloadが読めないこと、B03 / B04のdownloadがbyte-identicalであること、各transformのframe数 / timestamp / 二値境界、全経路の最終payloadを自動確認する。H-043でdecode / encode対応、連続download、QR helper、負荷、cleanupを確認する。
- Barcode Detection APIとの境界: QRが一手順のmarkerであるG-070 / G-071はbundled libraryを使ってよい。DR-016 / S-700-B02のようにBarcode Detection API自体が中心の箱は、実`BarcodeDetector.detect()`だけを成功経路とし、library、手入力、upload、模擬検出で迂回しない。
- 件数: G-070 / S-710の1stage・4箱と、派生G-071 / S-720の1stage・4箱を追加し、計画値は72stage・172箱とする。
- 根拠: [MediaStreamTrack Insertable Media Processing using Streams](https://www.w3.org/TR/mediacapture-transform/)、[Media Capture from DOM Elements](https://www.w3.org/TR/mediacapture-fromelement/)、[MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)、[WebCodecs](https://www.w3.org/TR/webcodecs/)、[Matroska elements](https://www.matroska.org/technical/elements.html)、[zxing-wasm](https://github.com/Sec-ant/zxing-wasm)、[Mediabunny metadata](https://mediabunny.dev/api/MetadataTags)。

### DR-080 WebTransport API

- 決定日: 2026-07-25
- 最終分類: 却下。新規stage、問題箱、共通runtime、専用backendを追加しない。
- 元案: serverから高速に流れるhintをdatagramとstreamへ振り分け、取りこぼさず同期すると開く。箱がrealtimeに脈動する低遅延通信パズルだった。
- API固有性: WebTransportは一つのsessionで欠落・順序変化を許すdatagram、信頼できるuni / bidirectional stream、複数独立streamを扱える。datagramはqueue overflow、age、network lossで消え得る一方、streamはwrite単位をmessage境界として保持しないためapplication framingが必要である。したがって元案の「datagramを取りこぼさない」は性質と逆であり、採るなら「最新状態はdatagram、欠落不可の長い鍵はstream」へ再設計する必要がある。
- 対応状況: WebTransportの中心機能は2026年3月にBaseline Newly Availableとなり、対応browser不足だけを却下理由にはしない。ただし新しい統計・送信順・reliability関連memberには実装差が残るため、採る場合も`ready` / `closed`、datagram、uni / bidirectional streamの共通部分へ限定する必要がある。
- 却下理由: browser clientだけでは成立せず、WebTransport sessionを受けるHTTP/3 / QUIC application serverが必要である。serverはextended CONNECT、WebTransport / HTTP datagram設定、browserからのOrigin検証、証明書、capacity、障害監視を運用しなければならない。GitHub Pagesはclient assetを配信できてもWebTransport endpointにはならず、WebTransport requestはService Workerを通らない。
- 既存案との差: S-360は自前backend、STUN / TURN、microphoneなしで同一origin 2 tabの実WebRTC lifecycleを扱う。DR-090 WebSocketも別途相談前であり、server通信というだけでWebTransport箱を追加しない。datagramと複数streamの差を実通信でplayerに見せない案は既存通信問題や通常のrouting mini-gameと重複する。
- 採らない代替: 公開echo server、第三者demo endpoint、client内simulation、Service Worker relay、WebSocket / WebRTCによるAPI名だけの置換を成功経路にしない。playerへlocal HTTP/3 serverや証明書準備を要求するExhibitにも変更しない。
- 将来の再検討条件: 本作全体で自前backendを正式採用し、静的配信方針、privacy、運用責任、費用、障害時UXを別決定として変更した場合だけ、新規案として再相談できる。その場合の最小案は、最新snapshotをdatagram、完全な固定flagをbidirectional streamで受ける2箱だが、今回の予約stage・箱数には含めない。
- privacy / lifecycle: 今回は通信を実装しないためpayload、接続先、IP由来情報、通信統計を収集しない。将来採る場合もcredentialsは既定で送られないこと、Origin allowlist、固定回答とcurrent-session tokenの分離、reader / writer cancel、session close、timeout、server log最小化を先に仕様化する。
- 件数: stage・箱を増やさず、計画値は72stage・172箱のままとする。
- 根拠: [WebTransport W3C Working Draft](https://www.w3.org/TR/webtransport/)、[WebTransport over HTTP/3 Internet-Draft](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/)、[WebDX 2026年3月更新](https://web-platform-dx.github.io/web-features-explorer/release-notes/march-2026/)。

### DR-083 WebVR API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: `VRDisplay.requestPresent()`で旧WebVR空間へ入り、箱の裏面を覗いて通常画面では見えない鍵を得る。
- 現行性: WebVR仕様化は中止され、preserved specification自体が主要browserは実装しないとしている。現代のimmersive Web APIはWebXR Device APIであり、WebVR compatibilityを新規標準問題として採らない。
- 新規案: なし。deprecated APIのためにlegacy環境やpolyfillを要求せず、mouse 3D preview等で見た目だけを模倣しない。
- 統合先案との関係: 現代APIへ読み替えた実immersive sessionと空間上の箱へのinteractionはG-072 / S-730-B01・B02へ採用済みである。元案の「裏へ回って鍵を探す」は、XRを対応機器の起動と空間上の箱へのinteractionの2箱だけに留め、凝ったXR世界、歩行、振り返り探索を作らない既決方針から外れるため統合もしない。
- 件数: stage・箱を増やさず、計画値は76stage・179箱のままとする。
- 根拠: [WebVR 1.1 preserved specification](https://immersive-web.github.io/webvr/spec/1.1/)、[WebXR Device API](https://www.w3.org/TR/webxr/)。

### DR-084 WebXR 機器 API

- 決定日: 2026-07-25
- 最終分類: 採用。新規G-072 / S-730「XRの箱（仮）」へ2箱だけを置く。
- 元案: ARで現実の机上へ箱を投影し、現実位置で角度を合わせ、XR空間の箱とmarker位置が一致すると開く案だった。物理感を強く見せる一方、空間認識と位置合わせを中心にした高難度のXR世界を想定していた。
- 新規設計案: XR世界そのものを作り込むと任意の3D gameになり、本作のWeb APIを触る芯から外れるため、中心操作を「対応XR機器を実際に稼働させる」と「XR空間上の箱へ実XR入力で触る」の二つへ縮める。現実markerとの位置合わせ、凝った空間謎、room-scale探索は引き継がない。
- 統合先案との区別: 既存stageへ統合せず、新規G-072 / S-730にする。S-100 / S-570は端末の向きと姿勢path、S-200は一般Gamepad入力であり、実immersive XRSessionとXRInputSourceの空間rayは未使用である。D-141で不採用にしたS-270 / WebGPU案は統合先にしない。WebGL / XRWebGLLayerはS-730の描画基盤に限り、未相談DR-081の別パズルを統合・消費しない。
- S-730-B01「対応機器」: `navigator.xr.isSessionSupported("immersive-ar")`と`isSessionSupported("immersive-vr")`を事前案内に使い、playerが利用可能なmodeを明示選択してuser activationから`requestSession()`する。AR / VRのどちらでもよい。実immersive `XRSession`が開始し、そのsessionの`XRFrame`から最初の非null `XRViewerPose`を得た時だけ開く。`navigator.xr`の存在、support probeのtrue、`inline` session、page上のbutton、模擬poseだけでは開かない。汎用の物理接続eventはないため、UI上の「接続・起動」はこのsession＋pose観測を技術的な証明とする。
- S-730-B02「空間の箱」: `local` reference spaceの安全で見やすい固定位置へ、単純な3D箱を一つだけ置く。実`XRInputSource`の`select`を受け、`targetRaySpace`のposeから得たrayがその箱のboundsへ交差した時だけ開く。controller trigger、AR画面tapの`targetRayMode="screen"`、機器が配送するgaze selectはいずれも認める。page click、keyboard、DOM overlay button、通常PointerEvent、一般Gamepad event、直接method呼出し、箱を外したselectは成功経路にしない。
- 空間と安全の境界: 箱は開始姿勢から約1〜1.5m先の無理なく見える位置へ置き、座位または静止したまま完了できる。歩行、振り返り、床や壁の探索、現実の机検出、hit test、anchor、plane / mesh / depth sensing、raw camera、room mapping、physical marker、marker tracking proposalを要求しない。開始前に周囲の安全確認を表示する。
- 対応差: WebXRはLimited availabilityのExhibit / Labsとし、対応機器がない環境では未観測のままにする。非XR 3D preview、inline session、mouse / touchだけで同じ2箱を開くfallbackは作らない。AR / VRの片方しか使えない環境でも、利用可能なimmersive modeで2箱とも成立させる。
- privacy / state: raw camera映像、depth、環境geometry、room情報を取得しない。session、viewer pose、input-source poseはmemoryだけで扱い、座標、機器識別情報、操作履歴を保存・同期・送信しない。永続化するのは通常の解決済みproblem IDだけとする。
- asset: 固定の箱model、material、icon等は実装前にsource、生成scriptまたは編集手順、checksumとともに生成してGit管理し、stage起動時に固定assetを生成し直さない。
- lifecycle: XR animation frame、session / select / input listenerを止め、WebGL / XR layer resourceとpose / reference-space / input-source参照を解放する。solve、reset、stage離脱、abortでは`session.end()`を呼び、`sessionend`でも同じcleanupを冪等に行う。
- 検証: WebXR Test APIまたはtest fakeでAR / VR support分岐、immersiveとinlineの区別、非null pose gate、実input sourceのray hit / miss、取消、sessionend、cleanupを自動確認する。H-044で対応AR端末またはVR headsetを使い、機器なし、support probe、開始取消、最初のpose、controller / screen select、空振り、session終了、安全導線、非保存を実機確認する。
- 件数: 新規1stage・2箱を追加し、計画値は73stage・174箱とする。
- 根拠: [WebXR Device API](https://www.w3.org/TR/webxr/)、[WebXR Augmented Reality Module](https://www.w3.org/TR/webxr-ar-module-1/)、[WebXR Hit Test Module](https://immersive-web.github.io/hit-test/)、[WebXR privacy and security explainer](https://immersive-web.github.io/webxr/privacy-security-explainer.html)、[WebDX WebXR support](https://web-platform-dx.github.io/web-features-explorer/features/webxr-device/)。

### DR-086 XMLHttpRequest API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存DR-085 Fetch案への統合を追加しない。
- 元案: 古い通信機器風の箱で`open()`、`setRequestHeader()`、`send()`を順に実行し、特定headerと`readyState`遷移を満たす「古い通信儀式」だった。
- 現行性: XMLHttpRequest自体は現役Living Standardで、`UNSENT`、`OPENED`、`HEADERS_RECEIVED`、`LOADING`、`DONE`の状態と、download / uploadの`ProgressEvent`、`abort`、`timeout`を持つ。main threadの同期XHRだけは削除方向であり、warningもuser agentへ推奨されるだけなので使わない。
- 新規案: Service WorkerからGit管理済みresponseを分割し、実`readystatechange`、`progress`、`timeout`、`abort`を5灯の通信盤へ反映する案を検討した。backendなしで実装できるが、灯火、状態名、操作盤はすべてgame製UIであり、XHR自身にplayer向けbrowser UIはない。
- 統合先案との関係: DR-085 Fetch APIはresponse header / bodyを手掛かりに次の静的URLを選ぶ候補である。通信儀式をXHRへ差し替えても中心操作は増えず、download progressや中断もFetchのresponse streamとabortで近い体験になる。XHRのupload progressを中心にすると受信endpointとgame製progress UIが必要で、本作の芯を強めない。
- 実装裁量・件数: application内部通信でXHRを利用することは妨げないが、それだけでは採用stageやAPI固有PoCへ数えない。計画値は76stage・179箱のままとする。
- 根拠: [XMLHttpRequest Living Standard](https://xhr.spec.whatwg.org/)。

### DR-087 サーバー送信イベント

- 決定日: 2026-07-25
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、SSE backendを追加しない。
- 元案: 箱がserverから断続的に受け取る予言文を読み、特定のevent列が揃うと開く。`new EventSource("/prophecy")`で一方向streamを購読し、「向こう側から囁かれる箱」として見せる案だった。
- API固有性: EventSourceは`text/event-stream`の持続HTTP responseからnamed event、data、IDを受け取る。切断後は自動再接続し、最後に受け取ったIDを`Last-Event-ID` request headerでserverへ返せる。serverは`retry:`で再接続間隔を指定し、HTTP 204で再接続を止められる。一方、clientからserverへmessageを送るAPIではない。
- 検討した新規設計案: ID付き予言の前半を送ってserver側から切断し、同じEventSourceが`Last-Event-ID`付きで再接続した後に後半を受け、重複・欠落なく固定flagを復元する1箱を検討した。これは単なるmessage受信よりSSE固有の再開を使うが、playerの操作は接続buttonを押して待つだけである。player自身へoffline → onlineを要求すると既存S-070の中心操作へ近づき、回線依存も増えるため採らない。
- 統合先案との区別: S-070はService Workerとoffline cache、S-050 / S-250はBroadcastChannel、S-360はWebRTC、DR-089はMessagePort transferであり、EventSourceの一方向streamや自動再接続を扱わない。ただし、これらへSSEを加えてもplayerから見える新しい操作にならないため、統合先は設けない。
- 却下理由: backend負担以前に、player視点では断続的に届く文字や演出を受動的に待つだけで、EventSourceを使ったからこその面白みを出せない。event type、ID、retry、再接続は実装上観測できても、通常のtimerや逐次表示と区別できるplayer操作にならない。
- 配信方針: GitHub Pagesは静的site hostingであり、requestを開いたままeventを逐次生成し、`Last-Event-ID`に応じて続きを返すendpointを提供しない。採用するなら別の持続HTTP backend、CORS / Origin制限、接続数、timeout、再接続、deployment、監視、server logの運用が必要だが、その追加費用を正当化するゲーム性もない。
- 採らない代替: client timer、Service Worker、静的event-stream file、公開demo endpoint、WebSocket / WebRTCによる模倣をEventSourceの成功経路にしない。将来自前backendを正式採用しても、player固有の操作が見つからない限り再採用しない。
- privacy / lifecycle: 今回は接続を実装しないためpayload、IP由来情報、Last-Event-ID、接続履歴、server logを収集しない。将来別案を検討する場合も固定回答とsession状態を分離し、離脱時の`EventSource.close()`、再接続上限、log最小化を先に仕様化する。
- 件数: stage・箱を増やさず、計画値は73stage・174箱のままとする。
- 根拠: [HTML Living StandardのServer-sent events](https://html.spec.whatwg.org/dev/server-sent-events.html)、[GitHub Pages公式説明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

### DR-090 WebSocket API

- 決定日: 2026-07-25
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、WebSocket backendを追加しない。
- 元案: serverが箱の状態をリアルタイムに変え、playerが接続を維持しながら時間制約付きの手順を送り返す。「生きている箱」として双方向常時接続を見せ、`ws.send(step)`と受信messageの列が揃うと開く案だった。
- API固有性: WebSocketはbrowserとserver processの双方向通信を維持し、text / binary message、subprotocol、`CONNECTING → OPEN → CLOSING → CLOSED`、close code / reason、未送信application data量の`bufferedAmount`を扱う。標準WebSocket interface自体には受信backpressureがなく、大量送受信を問題にするとmemory、CPU、回線差の危険がある。
- 検討した新規設計案: room codeで遠隔二人を結び、別々のswitchをserverが同じtickで観測し、二人が短時間同時に保持すると開く1箱を検討した。同期が本質のため固定flagではなく短命room tokenを認める余地はあるが、面白さの中心は遠隔二人協力であってWebSocketではない。同じ体験はWebRTC data channelや別の双方向通信でも構成できる。
- 統合先案との区別: 既存S-360は外部server、STUN / TURN、microphoneなしで同一origin 2 tabの実WebRTC peer接続と明示終了を扱う。WebSocketをsignalingへ足してもplayerの操作は変わらず、不要なbackendを増やすだけなので統合しない。S-050 / S-250のBroadcastChannel、DR-089のMessagePortへ置換・統合する案でもない。
- 却下理由: 遠隔二人協力自体にはplayer操作と面白さがあるが、WebSocketを使っている事実はplayerから見えず、本作のWeb APIを触る芯にならない。さらに第二の人または端末、相手待ち、room作成、切断復帰、放置room、荒らし対策を必要とし、単独で累積攻略できる現在のstage構成から外れる。
- 配信方針: GitHub Pagesは静的site hostingでWebSocket endpointを提供しない。採用には別の常時接続server、WSS、Origin検証、接続数、room lifecycle、deployment、監視、障害時UX、server logの管理が必要だが、API固有でない体験のために方針を変更しない。
- 採らない代替: 公開echo server、第三者room service、client内simulation、Service Worker、BroadcastChannel、WebRTCでWebSocket接続を模倣しない。`bufferedAmount`を目標帯へ合わせる案は意図的な大量送信と回線速度依存になるため採らず、subprotocolやclose codeを通常UIで選ぶだけの箱も作らない。
- privacy / lifecycle: 今回は接続を実装しないためroom ID、message、IP由来情報、接続相手、接続履歴、server logを収集しない。将来別案を検討する場合も認証なしの最小payload、Origin allowlist、rate limit、timeout、離脱時close、log最小化を先に仕様化する。
- 件数: stage・箱を増やさず、計画値は73stage・174箱のままとする。
- 根拠: [WebSockets Living Standard](https://websockets.spec.whatwg.org/)、[RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.html)、[GitHub Pages公式説明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

### DR-091 Web Workers API / S-270 WebGPU案

- 決定日: 2026-07-21
- 最終分類: DR-091とG-024 / S-270を却下。Web WorkerまたはWebGPUを新規stage、追加箱、成功条件にはしない。
- 元案: 箱内部の複雑な計算や生成をworkerへ逃がし、background計算結果で鍵を生成する。「箱の中で小人が働く」演出を付け、`worker.postMessage(seed)`で開始する案だった。
- 却下理由: 計算完了待ち、main threadが応答し続けること、transfer後に送信元`ArrayBuffer`がdetachedになることは実装上の事実だが、playerには任意の待機、animation、左右移動演出と区別できない。WorkerがDOMへ直接触れない制約も、それ自体ではplayerが操作する問題にならない。SharedWorkerのtab間生存は既存の複数tab問題と中心操作が重なる。WorkerはWebCodecs、圧縮、描画等の内部負荷分離へ任意で使えるが、採用数や箱数へ数えない。
- S-270の最終評価: compute結果も大量粒子の可視化も、playerからはWebGPU固有処理と任意の描画演出を区別できない。ゲームの芯となるbrowser固有UI / 挙動がないためD-141でstage、箱、実装、計画を削除した。
- 件数: G-024 / S-270を現行計画へ含めない。

### DR-093 Push API

- 決定日: 2026-07-25
- 最終分類: 却下。新規stage、問題箱、S-090への統合、Push送信用backendを追加しない。
- 元案: 一定時刻または外部条件で「鍵の夢」が届き、pushされたhintで箱を解く。pageがforegroundになくてもserver messageを受け、「箱があとで呼びかけてくる」体験を`registration.pushManager.subscribe()`で作る案だった。
- API固有性: Push APIはapplication serverがPushSubscriptionのendpointへ暗号化messageを送り、push serviceがuser agentへ配送し、必要ならService Workerを起動して実PushEventを渡す。VAPID restricted subscriptionでは登録時のapplication server公開鍵に対応する秘密鍵で送信requestを署名する。Service Workerは受信側であり、自分自身へPushEventを予約・配送するAPIではない。
- 検討した新規設計案: pageを閉じた後に実PushEventがService Workerを起こし、round付きnotificationを押して戻る「眠った箱」1箱を検討した。独立stageではなく既存S-090-B02へ統合すれば、page側から直接notificationを表示するB01との差も明確だったが、本物の送信にはapplication serverとpush serviceが必要になる。
- Web Worker調査: Dedicated Workerはowner document、Shared Workerは接続するowner群がなくなると終了対象で、pageを完全に閉じた後までtimerを保証できない。Service Workerもevent executionへ寿命が結び付けられ、処理eventがなければuser agentが終了できる。`setTimeout()`、待機Promise、Worker間messageで数十秒後のwakeを保証できず、scriptからsynthetic PushEventをdispatchしてもpush serviceから届いた実eventにはならない。
- browser直送案: pageがWeb Push protocol、payload encryption、VAPID署名を実装してsubscription endpointへ直接POSTする案も採らない。静的JavaScriptへ共通VAPID秘密鍵を置けず、端末ごとに生成してもpageを閉じた後の送信役が消える。push serviceのTTLは配達期限であり予約時刻ではなく、cross-origin endpointがbrowserからの認証付きPOSTを許可する保証もない。別端末を送信役にすると鍵とsubscriptionの受け渡しが必要になり、単独stageではなくなる。
- 統合先案との区別: S-090はpage起点のnotification表示とclick復帰、S-410 / S-420はnotification action、S-650-B02はnotification permissionを扱う。PushEventを使わない即時`showNotification()`はこれらと重複するため、Push名義の箱を追加しない。
- DR-096 / DR-097との境界: Background Syncは主に通信復旧時の後送信で、指定時刻のwakeではない。Periodic Background Syncはpage終了後にService Worker eventを得られる可能性があるが、希望間隔はsuggestionで、user agentが長い実効間隔または非実行を選べる。DR-093決定時点では未相談のDR-097として分離し、その後Pushの代替ではないG-073 / S-740の長期植物問題へ採用した。
- 採らない代替: Worker timer、直接notification、Periodic Background Sync、PushEvent constructor、公開push送信service、別端末senderをPush APIの成功経路にしない。将来自前backendを正式採用する場合も、subscription保護、VAPID鍵、one-shot job、配達遅延、取消、削除、log最小化を別決定にしたうえで再相談する。
- privacy / lifecycle: 今回はsubscriptionを作らず、endpoint、暗号鍵、VAPID情報、通知履歴、IP由来情報をbrowser外へ送信・保存しない。既存S-090 / S-410 / S-420のnotification lifecycleだけを維持する。
- 件数: stage・箱を増やさず、計画値は73stage・174箱のままとする。
- 根拠: [Push API](https://www.w3.org/TR/push-api/)、[Service Workers](https://www.w3.org/TR/service-workers/)、[HTML StandardのWorkers](https://html.spec.whatwg.org/multipage/workers.html)、[RFC 8030 Web Push](https://www.rfc-editor.org/info/rfc8030/)、[RFC 8292 VAPID](https://www.rfc-editor.org/info/rfc8292/)、[Periodic Background Sync](https://wicg.github.io/background-sync/spec/PeriodicBackgroundSync-index.html)。

### DR-095 バックグラウンドタスク API

- 決定日: 2026-07-21
- 最終分類: 重複。DR-118 Prioritized Task Scheduling APIへまとめ、新規stage・問題箱・成功条件は作らない。
- 元案: 箱が裏で「熟成計算」を続け、非同期task完了で開く。長く寝かせるほど開きやすい演出を付け、疑似コードに`scheduler.postTask(work, { priority: "background" })`を使う案だった。
- API整理: `scheduler.postTask()`はDR-118の中心APIであり、`background`は同APIのtask priorityである。Cooperative Scheduling of Background Tasksを指す場合の中心は`requestIdleCallback()`で、user agentが定めるidle periodが来なければcallbackは無期限に延期されうる。どちらもpage終了後に継続するService Worker型background処理ではない。
- 重複理由: 原文の疑似コード、中心動詞、完了条件がDR-118と同じである。idle callbackや低priority taskの完了はplayerから通常timerと区別できず、「待つ」だけを箱にしない。`requestIdleCallback()`を非必須のcache生成や診断集計へ使うことは妨げないが、問題採用には数えない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。DR-118自体の問題採否とruntime利用はDR-118の相談で決める。
- 根拠: [Cooperative Scheduling of Background Tasks](https://w3c.github.io/requestidlecallback/)、[Prioritized Task Scheduling](https://wicg.github.io/scheduling-apis/)。

### DR-096 バックグラウンド同期 API

- 相談日: 2026-07-26
- 現在分類: 継続保留。新規stage、問題箱、既存stageへの統合はまだ予約しない。
- 元案: offline中に記録した操作をoutboxへ置き、再接続後の実`sync` eventでserverへ提出して箱を開く。「一度閉じた箱が後で勝手に開く」案だった。受信結果をserver側で判定する元案のままなら動的backendが必要になる。
- API固有性として残す部分: foreground clientがある間に`ServiceWorkerRegistration.sync.register(tag)`を行い、その後page / tabがなくなっても、online復旧時にuser agentがService Workerへ実`SyncEvent`を配送して登録済みの仕事を完了できる。単なるoffline表示ではなく、操作元のdocumentが消えた後にもevent destinationが残る点を次回設計の中心にする。
- 実行時刻との境界: one-shot Background Syncには時刻、delay、deadlineを指定する引数がない。onlineで登録すれば即時発火し得て、offline時は主にonline復旧が契機になる。失敗後のretry時刻と回数もuser agent裁量であり、「離脱30分後」のalarmには使わない。時刻が不定な周期実行は別のDR-097で扱う。
- background中に可能な処理: `event.waitUntil()`の範囲で短い`fetch()`、IndexedDB、Cache Storage、hash検証、window clientの列挙とmessage、許可済みの`showNotification()`を実行できる。通知権限の新規要求、DOM操作、長時間timer、無制限計算、時刻指定、user activationなしの自動window生成はできない。通知click後の実`notificationclick`からpageへ戻すことはできる。
- 検討した新規設計案: offlineで依頼を登録し、全Busybox windowを閉じ、online復旧後の実SyncEventがGit管理された静的JSONを取得してIndexedDBへ受取証を置き、許可済みなら通知を出す1箱を検討した。動的backendなしでも実装でき、SyncEvent開始時のwindow client 0件と再訪前の完了時刻を記録できる。
- 現在案を確定しない理由: 静的JSON取得と「配達完了」通知だけでは、page不在中の実行という珍しさに対してplayerが行うことと受け取る驚きが弱い。通知を必須にするとS-090 / S-410 / S-420の通知表示・click・actionへ体験が寄り、S-070-B02へ置く根拠もまだ薄い。API固有の能力自体は捨てず、処理対象、離脱中に起きる変化、再訪時の発見を一体化したギミックが得られた時に再相談する。
- 再相談条件: tabを閉じている間に完了することが解法上不可欠で、通常のService Worker / IndexedDB / online eventや既存notification問題では代替できず、playerが実行時刻を待ち続けなくても完了を発見できる設計を提示する。Chromium系でtabを閉じた場合、browser processを終了した場合、mobile OSが停止した場合の発火差もPoCする。
- privacy / lifecycle: 採用時もsync中のrequest先は原則same-originとし、payload、IP由来情報、notification履歴を収集しない。処理は小さくboundedにし、`waitUntil()`の成功・失敗を正しく返す。backgroundから自己登録を連鎖させず、reset時のoutbox、receipt、notification tag、sync tagの扱いを事前に決める。
- 件数: DR-096決定時点ではstage・箱を増やさず73stage・174箱のままとした。その後DR-097 / S-740を追加した現在値は74stage・175箱である。
- 根拠: [Web Background Synchronization](https://wicg.github.io/background-sync/spec/)、[Notifications API](https://notifications.spec.whatwg.org/)、[Service Workers](https://www.w3.org/TR/service-workers/)。

### DR-097 ウェブ定期バックグラウンド同期 API

- 決定日: 2026-07-26
- 最終分類: 採用。新規G-073 / S-740「留守番温室（仮）」へ、攻略必須経路から外した長期Labsの1箱を置く。
- 元案: Periodic Background Syncが毎日鍵片を一つずつ育て、日次同期で完全体になる箱だった。`minInterval`を正確な日次scheduleとして扱う部分は現仕様と一致しないため捨てる。
- API固有性: `PeriodicSyncManager.register(tag, { minInterval })`は最小間隔の希望を登録し、user agentがonline、利用頻度、既知network、電源等を考慮してService Workerへ実`periodicsync` eventを配送する。指定間隔ちょうどの発火、deadline、最大待ち時間、発火回数は保証されず、originの実効間隔が`Infinity`になれば発火しない。Chromeではinstalled PWAを独立appとして起動した実績とsite engagementも必要になる。
- 新規設計案: playerが種を植え、第一段階で「水を預ける」。そのcare recordをIndexedDBへ保存してperiodic syncを登録し、Busyboxの全windowを閉じる。window client 0件の実`periodicsync`が水を一回だけconsumeし、Git管理された発芽assetをsame-originから取得してCache Storageへ置き、local phaseを発芽へ進める。playerが再訪して発芽を見つけ、「光へ向ける」を預けて再度離脱すると、二回目のwindow不在`periodicsync`が開花assetを取得して開花させる。次の再訪で一箱を開く。
- player操作: 種植え、水、光の三操作をforeground UIで明示的に行う。光の操作は発芽receiptがない限り表示・受付せず、二つの世話を先に積めない。世話に誤答や枯死を作らず、eventがまだ来ていない訪問では現在phaseと「次の巡回待ち」だけを示す。頻繁な確認、長期離脱、発火しない環境を失敗扱いにしない。
- 成長条件: B01は異なる二回の実`PeriodicSyncEvent`、各event開始時のscope内window client 0件、期待phaseに対応する未消費care record、次assetの取得・cache成功、IndexedDBのphase遷移を要求する。foreground中に来たevent、通常timer、page load、日付変更、通常Background Sync、synthetic event、DevToolsのdebug発火、直接IDB編集では成長させない。公開受入証跡にもDevTools模擬発火を使わない。
- 時間設計: 「毎日」「24時間後」「あと何分」を表示せず、countdownや期限を設けない。`minInterval`は低い値で発火を促す目的に使わず、実装時にbrowserのresource policyへ沿う長期値をPoCして決める。二回の実background eventを要するため、通常攻略・初回導線・全箱必須報酬から外す。
- 統合先案との区別: S-080はinstalled display modeを一度観測するstage、S-070は現在のoffline状態、S-090 / S-410 / S-420は通知表示・click・actionを扱う。S-740はinstalled PWAとService Workerを前提にするが、複数訪問の間にbrowser裁量の実periodicsyncがlocal植物を進める独立体験なので、既存stageへ追加しない。通知、badge、Push、DR-096 one-shot Background Syncを成功経路に混ぜない。
- fixture / flag: 種、鉢、発芽、開花の画像またはvector assetはsource、生成手順、checksumとともに実装前に生成してGit管理し、S-740の通常precacheから発芽・開花assetを外す。固定flagはcopy可能な`BUSYBOX{THE_GARDEN_GREW_WHILE_THE_APP_WAS_AWAY}`とし、round tokenや日付を含めない。
- state / cleanup: care record、phase receipt、取得asset version、registration tagは端末localの専用store / cacheへ置き、Drive同期やfile exportへ含めない。通常の最終解決済みproblem IDだけは共通進捗へ保存できる。各eventはphaseとreset generationを取得前後に照合してstale完了を拒否する。開花後とreset時に`periodicSync.unregister(tag)`し、専用care / receipt / cacheを削除する。
- privacy / resource: same-originの小さな固定assetだけを取得し、player入力、時刻列、network名、engagement score、IP由来情報を収集・送信しない。event処理はboundedにし、notificationを表示せず、background計算、analytics、第三者requestを行わない。
- 対応差 / PoC: Limited / ExperimentalかつChromium系installed PWA向けのExhibitとし、通常tab、未install、permission非granted、API欠損、長期非発火では未観測のままにする。installed PWAでの登録、real schedulerによるclient 0件event、二段階成長、browser process終了時とmobile OS停止時の差、unregister、site data削除、reset競合をH-045で確認するまで公開しない。
- 件数: 新規1stage・1箱を追加し、計画値は74stage・175箱とする。
- 根拠: [Web Periodic Background Synchronization](https://wicg.github.io/background-sync/spec/PeriodicBackgroundSync-index.html)、[ChromeのPeriodic Background Sync解説](https://developer.chrome.com/docs/capabilities/periodic-background-sync)、[MDN Web Periodic Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)。

### DR-098 バックグラウンドフェッチ API

- 決定日: 2026-07-26
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、低速配信endpointを追加しない。
- 元案: 巨大な鍵dataをBackground Fetchで長時間取得し、完了後に最終箱を開く。「宝物庫の搬入を待つ」案だった。完了を長引かせるためだけの巨大fixtureは帯域、storage、GitHub Pagesの配信量を浪費するため採らない。
- API固有性: `ServiceWorkerRegistration.backgroundFetch.fetch()`は一つまたは複数のrequestをbrowser管理jobへまとめ、page / worker終了後も転送を継続・再開できる。`downloaded` / `downloadTotal`の実byte progress、browser / OS側の中止可能なUI、`backgroundfetchsuccess` / `fail` / `abort` / `click`を持ち、success event中だけresponseを取り出してCache Storageへ保存できる。network requestはservice-workers mode `none`で、BusyboxのService Workerを通らない。
- 検討した新規設計案: flag画像を通常precacheから外し、未取得時はcustom placeholderや`onerror`差替えを使わず、寸法を確保した`<img>`へbrowser標準の壊れた画像表示をそのまま出す。playerが搬入を開始して全Busybox windowを閉じ、window client 0件の実Background Fetchが完了した時だけresponseを専用cacheへ移す。次回訪問時に同じ画像領域へ固定2語`AFTER HOURS`を焼き込んだ画像を表示する。通常page fetch、foreground完了、timer、偽progress、直接cache編集は成功経路にしない。
- offline案: 小さなGit管理済み画像でも、offline中にjobを登録して壊れた画像を確認し、windowを閉じてからonlineへ戻せば、完了前に離脱を確実に挟める。しかしplayerはoffline判定を中心にせず、読み込み割合UIが数時間かけて実際に進む設計を希望したため、この経路へは確定しない。
- backendなしで低速化できない理由: 静的GitHub Pagesは固定responseを配るだけで転送rateをplayerごとに制御しない。`downloadTotal`は進捗の分母と上限であり転送速度指定ではない。Background FetchはService Workerを迂回するため、Service Workerの`ReadableStream`やtimerでresponseを遅延できない。Dedicated / Shared Workerは全owner消失後の生存を保証せず、動画の再生時間もfileのdownload時間を決めない。確実に数時間残すには巨大fileか配信側の低速streamが必要で、前者は元案と同じ帯域浪費になる。
- backend許容時の将来案: Git管理済みのimmutableなflag画像をstateless Edge Workerへ同じsource / recipe / checksumからdeployし、正確な`Content-Length`、CORS allowlist、`Range` / `206`再開、`Cache-Control: no-store`を付け、`FixedLengthStream`等から低速chunkを返す。GitHub PagesはBusybox本体だけを配信し、Edge Workerはplayer状態、cookie、token、判定を持たず、約3時間を目標に実bytesを配る。完了時刻は保証せず、回線断やbrowser pause後も実Background Fetchの再開と全byte成功だけを判定する。
- 現状却下の理由: Edge Workerは常駐serverを管理しなくても配信側backendであり、D-004のGitHub Pages中心・自前backendなし方針に含めない。Cloudflare Workers等の導入、第三者の公開slow endpoint、DevTools throttling、OS側の帯域制限をproduction解法へ要求しない。将来、stateless配信backendを正式に許容した場合だけ、新規案を再相談する。
- privacy / resource: 現状はendpoint、asset、registration、cache、receiptを実装しない。再相談時もplayer識別子、時刻列、network情報を送らず、第三者analyticsを無効化し、CORSを公開originへ限定する。abort / fail / reset時にはregistration、専用cache、receiptを削除し、完成画像以外を進捗同期へ含めない。
- 統合先案との区別: S-070はoffline状態、S-740はbrowser裁量のperiodic eventによる植物成長を扱う。Background Fetchのbrowser所有転送UIと実byte progressは別能力だが、成立に必要な低速backendを導入しないため、両stageへの追加箱にも統合しない。
- 件数: stage・箱を増やさず、計画値は74stage・175箱のままとする。
- 根拠: [Background Fetch](https://wicg.github.io/background-fetch/)、[ChromeのBackground Fetch解説](https://developer.chrome.com/blog/background-fetch)、[MDN Background Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)、[GitHub Pages公式説明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)、[Cloudflare FixedLengthStream](https://developers.cloudflare.com/workers/runtime-apis/streams/transformstream/)。

### DR-100 Beacon API

- 決定日: 2026-07-29
- 最終分類: 統合案。新規stageは作らず、既存S-060へB02「オフライン郵便（仮）」を1箱追加する。
- 元案: pageを去る時に`sendBeacon()`で別れの手紙を送り、次回訪問で箱を開く。documentを止めずに送信を継続するfire-and-forget性を中心にする案だった。
- APIの境界: `sendBeacon()`の`true`は送信queueへの受理だけで、server受領や保存完了を証明しない。ただしsame-origin requestは制御中Service Workerのfetch eventで受けられるため、backendなしでもworkerをlocal郵便局にできる。
- 統合先案: S-060-B01の単純再訪は変更しない。B02は最初にonlineでService Worker制御とsender / receiver / receipt assetのcacheを準備し、controllerがなければ一度だけreloadを案内する。playerがnetworkをofflineにし、通常link「投函して郵便局へ移動」を明示操作する。
- 成功経路: click handlerで小さな固定protocol dataとcurrent attempt IDだけを実`navigator.sendBeacon()`へ渡す。`false`ならnavigationを止めて開かない。`true`ならdefaultを止めず、React routerではないreceiverへのfull-document navigationを続ける。Service Workerは専用virtual endpointへのPOSTを検証し、`respondWith()` Promise内で専用IndexedDB receiptをcommitしてから204を返す。receiverはmessage listenerを先に設置してstoreを照会し、matching receiptだけで開く。
- 非成功経路: `sendBeacon() === true`だけ、通常`fetch({keepalive:true})`、same-document navigation、単純再訪、foreground pageからの直接IndexedDB write、tab close、`visibilitychange:hidden`だけでは開かない。close / hidden時のBeaconは説明用の任意演出に留める。
- PoC: Chromiumでlocal HTTP serverを停止したoffline状態から明示clickし、`sendBeacon()`が`true`を返し、制御中Service WorkerがPOSTを受けて`receipt:explicit-offline-letter`をIndexedDBへ保存・再読出しできた。close / visibilityだけに依存する試行はreceiptを得られず、明示投函とfull-document navigationを堅牢な経路として選んだ。
- 表示・privacy: 初期receiptはnative broken image表示を残し、受領後だけsource、生成手順、checksumを持つGit管理済みstamp画像へ差し替える。flagは画像内でなくcopy可能な固定DOM text `BUSYBOX{THE_OFFLINE_BROWSER_DELIVERED_MY_FAREWELL}`とする。payloadへ個人情報を含めず、receiptをDrive同期、file export、analytics、外部requestへ出さない。resetは専用attempt / receiptを削除する。
- 件数・検証: 1箱を追加し、計画値は76stage・180箱とする。H-048で実offline、server停止、Beacon返り値、full-document navigation、Service Worker POST、IndexedDB commit、race、reset、stale attempt、非成功経路、外部送信なしを確認する。
- 根拠: [Beacon](https://w3c.github.io/beacon/)、[Service Workers](https://w3c.github.io/ServiceWorker/)、[Fetch](https://fetch.spec.whatwg.org/)。

### DR-101 Network Information API

- 決定日: 2026-07-21
- 最終分類: 採用。新規G-062 / S-630「接続の道（仮）」に4箱を置く。
- 元案: online / offlineや低速回線ごとに別箱を用意し、`navigator.connection.effectiveType`が示す現在条件に合う解法を選ぶ。「電波状況で気まぐれになる箱」という案だった。
- 残す部分: playerが端末の接続方式を外側で変更し、pageが現在の実接続方式を観測して対応箱を開く中心動詞を残す。
- 捨てる部分: `effectiveType`、`downlink`、`downlinkMax`、`rtt`、速度test downloadは使用しない。回線混雑や推定速度はplayerが安定して変更できず、fingerprinting要素にもなる。`saveData`はS-480-B09 `prefers-reduced-data`と重なるため追加しない。online / offlineはS-070と重複する。
- 箱構成: S-630-B01 Wi-Fi、B02 cellular、B03 ethernet、B04 Bluetooth。`none`はS-070と重複、`mixed`はOS / UA裁量、`other` / `unknown`は具体方式を示さず、`wimax`は現実的な検証環境を用意しにくいため箱にしない。VPNは仕様上の独立`type`ではない。
- player操作と判定: stage表示時には自動clearしない。playerが接続を選び直した後、「現在の接続を観測」buttonを明示的に押し、その瞬間の`navigator.connection.type`が4方式の一つなら対応箱だけを開く。複数回の訪問で累積できる。`change`は状態表示の更新に使えても、それだけで開箱しない。
- 対応差: `NetworkInformation.type`を実装するChrome Android、Android WebView、Opera Android、ChromeOS等だけをLabs対象にする。property欠損、`unknown`、`other`、対象外値では未観測とし、UA sniff、`navigator.onLine`、速度測定、IP情報、network requestによる推定で代替clearしない。
- privacy: 読み取ったtype、変更列、観測時刻、network推定値を保存・同期・送信しない。永続化するのは通常の解決済みproblem IDだけとする。listenerは離脱・reset・abort時に解除する。
- 件数: 新規1stage・4箱を追加した時点の計画値は63stage・137箱。DR-121追加後は65stage・153箱である。
- 根拠: [Network Information API](https://wicg.github.io/netinfo/)、[Browser Compatibility Data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/NetworkInformation.json)。

### DR-102 Content Index API

- 決定日: 2026-07-26
- 最終分類: 却下。次期案だけを記録し、新規stage、問題箱、既存stageへの統合、Content Index用のID予約は行わない。
- 元案: 解錠に必要な断片をoffline閲覧対象としてContent Indexへ登録し、すべて集めると開く。「箱が旅行用の鍵束になる」案だった。`index.add()`はmetadataを登録するだけでcontentをcacheせず、登録成功だけではplayerがbrowser外部UIを使ったことにならないため、そのまま採らない。
- API固有性: `ServiceWorkerRegistration.index.add()`はService Worker scope内のoffline対応HTMLとmetadataをbrowserのlocal indexへ登録する。user agentはentryを外部content一覧やoffline recommendationへ表示できるが、表示自体は任意である。entry activationは登録URLへの通常navigationで専用launch eventをpageへ渡さない。一方、browser内蔵UIからentryを削除した場合だけService Workerへ実`contentdelete`が届き、scriptの`index.delete()`では発火しない。
- 次期案「持ち歩く鍵」: 専用HTMLとiconをCache Storageへ保存して`article` entryを登録する。playerはBusyboxを閉じ、Chrome AndroidのDownloads / Articles for Youからentryを探してofflineで開く。cached pageの「読み終えた鍵は、この棚から捨てよ」という指示に従いbrowser標準UIからentryを削除する。同じgeneration IDについてpage open receiptと実`contentdelete`が揃った場合だけ、次回訪問時に固定flag `BUSYBOX{THE_OFFLINE_KEY_WAS_REMOVED_FROM_THE_BROWSER_SHELF}`をcopy可能に表示する。
- 代替clear禁止案: 次期採用時もアプリ内Content Index一覧、通常linkからのlaunch URL、page buttonによる`index.delete()`、constructed / synthetic event、DevTools操作では開けない。browser UI削除以外では`contentdelete`が来ない性質を中心にし、古いentryの削除eventを拒否するため内部IDだけにgenerationを持たせる。
- 現状不採用の理由: 現行はChrome Android / Android WebView等へ偏り、desktop Chrome、Firefox、Safariを含むPC browserでは利用できない。さらに仕様上user agentがentryを表示するかは任意で、Androidでも外部一覧の実UIが変わり得る。PCで全く成立しないAPIを現行の新規stageとして増やさない。
- 再相談条件: PC browserで`ServiceWorkerRegistration.index`、外部content一覧への実表示、entry activation、browser UI削除由来の実`contentdelete`が利用可能になり、通常navigationやscript deleteとの違いを人手証跡で確認できること。Android専用のままでは再採用しない。
- fixture / lifecycle: 再相談時のoffline HTML、iconは実装前にsource、生成手順、checksumとともにGit管理する。resetは`index.delete(currentId)`、専用cache、open / completion receiptを削除し、完了後もstale entryを残さない。entry title、description、ID、時刻をDrive同期・外部送信しない。
- 統合先案との区別: S-070はpage内のoffline状態、S-080はinstalled display mode、S-740はperiodic background eventを扱う。Content Indexのbrowser所有content棚と実`contentdelete`は別能力だが、PC非対応のため既存stageへ追加箱として統合しない。
- 件数: stage・箱を増やさず、計画値は74stage・175箱のままとする。
- 根拠: [Content Index](https://wicg.github.io/content-index/spec/)、[Chrome Content Indexing API解説](https://developer.chrome.com/docs/capabilities/web-apis/content-indexing-api)、[MDN Content Index API](https://developer.mozilla.org/en-US/docs/Web/API/Content_Index_API)。

### DR-104 Storage API

- 決定日: 2026-07-21
- 最終分類: 却下。問題箱、stage、設定画面のいずれにも追加しない。
- 元案: `navigator.storage.persist()`で箱の記憶をpersistent storageにし、永続化された記録でだけ開く長期箱を作る。「箱が忘れない」と宣言する演出を付ける案だった。
- 調査結果: `persist()`はdefault storage bucketのpersistent化を要求し、`persisted()`は現在のmode、`estimate()`はoriginのusage / quota概算を返す。許可はuser agentのpermission判断を含み、playerが必ず成功させられない。実際のeviction耐性を問題内で証明するにはstorage pressureやデータ消去が必要になり、安全で決定的な成功条件にできない。
- 却下範囲: `persist()`、`persisted()`、`estimate()`を箱や設定表示へ追加しない。特別な永続化演出、成功報酬、長期離脱条件も設けない。既存のIndexedDB進捗、file export、Drive backupだけを維持する。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [Storage Standard](https://storage.spec.whatwg.org/)。

### DR-105 Storage Access API

- 決定日: 2026-07-26
- 最終分類: 却下。Storage Access APIを中心にした新規stage、問題箱、既存storage stageへの統合を追加しない。
- 元案: cross-site iframe内の箱が`document.requestStorageAccess()`で本体の記憶へアクセスできた時だけ開く。別枠の小箱と本箱が記憶を共有する演出を想定していた。
- 調査結果: core APIはiframeからunpartitioned cookieへのaccessを要求できるが、実演には外部siteをfirst partyとして訪問・操作してcookieを作り、Busyboxから同じsiteをthird party iframeとして埋める必要がある。許可はtop-level siteとembedded siteの組にscopedされ、user activation、browser privacy policy、user設定、heuristicsの影響を受ける。
- 検討した新規案: 外部siteを別windowで開いて鍵をunpartitioned cookieへ預け、Busybox内の同じsiteでは鍵が見えない状態から実`requestStorageAccess()`を行い、許可後に読めた時だけ開く案を検討した。さらにPartitioned Cookieの「枠の鍵」とunpartitioned cookieの「本来の鍵」を同時に揃える案まで再設計した。
- 却下理由: どちらも許可前にcookieを読めないことを成功条件の前提にする。第三者cookieを最初から許可するbrowser設定では差が生まれず、逆に強く遮断するpolicyではplayerが成功へ到達できない。「できない状態」をplayerに作らせて証明することへ中心操作が寄るため採用しない。Promise resolve、`hasStorageAccess()`、許可prompt表示だけへ成功条件を弱める案もAPI固有の記憶回復を証明しないため採らない。
- 完全な別案: Storage Accessとは分離し、外部静的originのcross-origin iframeに置いた画像を親Documentへ実drag / dropする案を採用する。既存G-049 / S-510へB02として統合し、B01のinstalled PWA window→通常browserへのPNG File転送は残す。B02はiframe内のGit管理済み透明PNG layer 3枚を親側の現像台へ運び、実`drop`の`text/uri-list`、current iframe payload、期待asset URLが一致した時に合成・開箱する。
- 境界と判定: B02は外部originから画像をfetchしてpixel検査する問題ではない。iframe sourceへcurrent round識別子を渡し、同期的な実`dragstart`で標準形式の画像URLとcurrent payloadをDrag Data Storeへ載せる。親はtrustedな実`drop`だけを受け、allowlist済みhelper origin、layer ID、round一致を確認する。通常link、address bar、同一page内drag、file input、clipboard、constructed DragEvent、`postMessage`だけでは開けない。
- asset / flag: 3枚の透明PNGと完成見本、生成source、生成手順、checksumを実装前にGit管理する。画像はiframe内ではblur / cropした見た目にし、親の現像台でfilterなしに重ねる。完成時は固定flag `BUSYBOX{THE_IMAGE_ESCAPED_FROM_ITS_FOREIGN_FRAME}`をcopy可能なtextとして表示する。round識別子は二つのorigin間のcurrent drag照合だけに使い、合言葉へ含めない。
- privacy / cleanup: helperは静的配信だけとし、cookie、storage、analytics、identity、backendを持たない。親はdrag payload、layer URL、round IDを永続化・同期・送信せず、離脱・reset時にiframe、active drag、受領layer、object referenceを破棄する。
- PoC: desktop Chrome、Edge、Firefox、Safariで、cross-origin iframeから親Documentへのpointer drag、`text/uri-list`とcurrent payloadの保持、iframe境界を横切る`dragenter` / `drop`、取消、複数layer、keyboard説明を確認する。不成立環境へuploadや通常clickによる代替clearは設けない。
- 統合先との区別: S-510-B01はtop-level PWA / browser window境界を実PNG `File`が越える問題、B02はcross-origin iframe / parent Document境界を画像URLのDrag Data Store itemが越える問題である。中心APIは同じHTML Drag and Dropなので新規stageを作らず、境界とpayload kindの違いを同じstageの2箱にする。
- 件数: 新規stageは増やさずS-510へ1箱を追加し、計画値は74stage・176箱とする。
- 根拠: [HTML Standard Drag and Drop](https://html.spec.whatwg.org/multipage/dnd.html)、[MDN Working with the drag data store](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_data_store)、[Storage Access API](https://privacycg.github.io/storage-access/)。

### DR-107 Cookie Store API

- 決定日: 2026-07-26
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: Cookie値を古い鍵札に見立て、`cookieStore.set("seal", "ok")`による特定cookieの発行・更新を成功条件にする。封蝋付き通行証が箱を開く演出だった。
- API固有部分: `CookieStore`はWindowとService Workerから使える非同期cookie APIであり、Windowの`change` eventでscript-visible cookieの変更を監視できる。Service Worker registrationは`CookieStoreManager.subscribe()`でname / URLを購読し、該当変更時に実`cookiechange` functional eventを受けられる。
- 検討案A「三つの通行証」: 異なるpathの小窓でpath-scoped cookieを発行し、Service Workerが各変更を購読して中央箱へ集める案。実eventを使ってもplayerには複数buttonから中央へ状態を送る問題に見え、`postMessage`、BroadcastChannel、通常storageとの違いが表面へ出ないため不採用。
- 検討案B「燃え尽きる封蝋」: 短い寿命のcookieを発行してBusyboxを閉じ、user agentが期限切れcookieをevictした時の`deleted`をService Workerが受け、再訪時に開箱する案。page不在時に購読済みcookie変更がworkerを起こし得る点は固有だが、仕様は期限時刻ちょうどのevictionを保証せず、発火が次のcookie jar処理まで遅れる可能性がある。
- 却下理由: 通常の`get()` / `set()` / `delete()`は既存storage、Window `change`はcross-context通信と体験が重なる。Service Worker `cookiechange`まで使う案も、playerの中心操作がS-740の「状態を預け、windowを閉じ、background event後に戻る」と重なる。技術的なevent sourceだけを変えた箱を増やさない。
- 実装上の扱い: 将来cookieを非同期に扱う必要が生じた場合、secure contextでの内部実装基盤として`cookieStore`を利用してよい。ただし使用しただけでは採用stage、問題箱、API固有成功条件へ数えず、`document.cookie`との差を演出するためだけのUIも追加しない。
- privacy / cleanup: 現時点ではゲーム用cookie、change subscription、expiry待機、cookie履歴を作らない。将来内部利用する場合も認証cookie、HttpOnly cookie、外部site cookieをゲーム状態へ流用せず、用途を限定して離脱・reset時に不要なscript-visible cookieとsubscriptionを削除する。
- 件数: stage・問題箱を増やさず、計画値は74stage・176箱のままとする。
- 根拠: [Cookie Store API Standard](https://cookiestore.spec.whatwg.org/)、[MDN Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API)。

### DR-108 Shared Storage API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: 個人識別なしに「世界全体の箱進捗」をShared Storageへ蓄積し、全playerの集約状態に応じて開錠率を変える案だった。
- 成立しない点: Shared Storageはserver上のglobal databaseではなく、各browser profile内でcontext originがtop-level siteをまたいで使うunpartitioned local storageである。他playerの値は共有されず、backendなしに世界全体の達成率を得られない。
- 新規案: 二つの異なるtop-level siteへ同じ第三者originを埋め込み、一方で書いた記憶をworkletが読み、`selectURL()`で選んだcontentをFenced Frameへ表示する「二つのsiteをまたぐ秘密の記憶」を検討した。
- 却下理由: pageはShared Storage値や選択indexを直接取得できず、workletのoutput gateはURL選択またはPrivate Aggregationに制限される。playerが見るのはgame製contentで、browser所有のprompt、表示、外部操作はない。別top-level site、第三者origin、privacy sandbox enrollmentを追加しても、通常storage puzzleとの差がplayer体験にならない。
- 現行性: WICG Draft Community Group Reportで標準化されず、repositoryは2026-01-28にarchiveされた。ChromeはM144でdeprecatedとし、M150以降の無効化、M152でのstub置換と実装削除を進めている。他engineも採用していない。
- 実装上の扱い: historical exhibit、third-party cookieによる模倣、polyfill、Fenced Frameだけの演出、内部analytics利用を作らない。player識別子やcross-site profileを保存・送信しない。
- 件数: stage・問題箱を増やさず、計画値は76stage・180箱のままとする。
- 根拠: [WICG Shared Storage](https://wicg.github.io/shared-storage/)、[Chromium Intent to Deprecate and Remove](https://groups.google.com/a/chromium.org/g/blink-dev/c/uh5Ke6qyegc)、[archive済みWICG repository](https://github.com/WICG/shared-storage)。

### DR-114 エンコーディング API

- 決定日: 2026-07-21
- 最終分類: 採用。新規G-063 / S-640「十二の文字コード（仮）」に12箱を置く。
- 元案: 文字列をUTF-8等へ変換し、正しいbyte列との一致を鍵にして箱を開く案だった。原文の疑似コードは`new TextEncoder().encode(answer)`で、「箱が文字ではなく符号を読む」演出を想定していた。
- 再設計: 単一のUTF-8変換問題にはせず、2進byte列4問、16進byte列4問、文字化け4問を置く。16種類の文字コードlabelは固定fixture内で各1回使うが、playerはlabel名ではなく、推理して復号した文字列を各問のtext fieldへ入力する。
- 2進byte列: ISO-8859-2のポーランド語文字テスト句`Zażółć gęślą jaźń`、ISO-8859-5の`русский текст`、Shift_JISの`文字コード`、windows-1255の`קוד עברי`。日本語legacy encodingはShift_JISだけとする。
- 16進byte列: GBKの`简体编码`、Big5の`繁體編碼`、ISO-8859-7の`ελληνικό κείμενο`、windows-874の`ภาษาไทย งดงาม`。GBKとBig5は一文字問題にせず、簡体字・繁體字の差とencodingの題材が伝わる4文字回答にする。
- 文字化け: UTF-8 → windows-1252（`café français` → `cafÃ© franÃ§ais`）、KOI8-R → windows-1251（`русский ящик` → `ТХУУЛЙК СЭЙЛ`）、KOI8-U → IBM866（`український код` → `╒╦╥┴з╬╙╪╦╔╩ ╦╧─`）、Macintosh → x-mac-cyrillic（`åbn æsken` → `Мbn Њsken`）。raw bytesと誤読表示から元文字列を復元して回答する。
- 一意性: 12回答と12問題表示をすべて別値にする。漢字文化圏は3文字以上、空白で語を分ける文化圏は2語を基本とする。16 labelの使用回数と全体割当の解1個もfixture testで維持するが、label割当はplayer操作にしない。
- API境界: `TextEncoder`はUTF-8だけなので、legacy encodingのbyte列をruntimeで偽のencoderから生成しない。WHATWG Encoding Standardのindexに基づく固定fixtureを用意し、対応browserの`TextDecoder(label, { fatal: true })`で元表示と誤読表示を検証する。U+FFFD、制御文字、不可視文字、私用領域文字、正規化差だけに依存するfixtureは除外する。
- 操作と表示: 2進・16進のbyte列はcopy可能なtextにし、先頭zeroとbyte境界を保持する。文字化け欄も誤読表示を画像化しない。各問にkeyboard操作可能なtext fieldを置き、spaceを含む固定回答文字列とのexact code point一致だけで開箱する。
- privacy / cleanup: 入力文字列、clipboard、file、network、端末のlocaleや既定encodingを読まない。保存するのは通常の解決済みproblem IDだけで、未提出の割当は離脱・reset時に破棄する。
- 件数: 新規1stage・12箱を追加した時点の計画値は64stage・149箱。DR-121追加後は65stage・153箱である。
- 根拠: [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/)。

### DR-115 Reporting API

- 決定日: 2026-07-26
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: エラー、browser介入、policy違反等のreportを逆手に取り、`ReportingObserver`が特定classを受信すると箱が開く。「箱が異常時だけ本音を言う」という演出だった。
- API固有部分: Reporting APIはCSP違反、COOP / COEP、介入、非推奨機能等を構造化reportとして生成し、同じenvironment settings objectの`ReportingObserver`へ通知できる。一方、Report自体はplayer向けのbrowser標準画面、通知、dialog、操作部を持たない。
- 検討した新規案: Service Workerが専用documentへ`Content-Security-Policy-Report-Only` response headerを付け、script、style、image、same-origin fetchの4操作を画面上では成功させつつ、実`csp-violation`の`effectiveDirective`、`blockedURL`、`disposition`をobserverで照合する4箱を検討した。通常のenforced CSPと異なり、Report-Onlyなら「操作は成功したがbrowserは違反報告を作った」という性質を残せる。
- 却下理由: 違反reportはplayerから直接見えず、ランプ、報告書一覧、箱の反応はすべてゲーム側で自作する必要がある。playerがbrowser固有UIや外部操作へ触れるわけではなく、内部dataの可視化がstage体験の中心になるため、本作のAPI固有性を見せる箱として弱い。
- 統合先案: 既存stageへ追加しない。CSP違反、非推奨API、browser介入を対応環境だけで開発用diagnosticへ一時表示する内部実装には利用してよいが、対応不能でもgameplayへ影響させず、成功条件、保存、同期、telemetry、外部report endpointには使わない。内部利用はstage採用実績へ数えない。
- 件数: stage・問題箱を増やさず、計画値は74stage・176箱のままとする。
- 根拠: [Reporting API](https://www.w3.org/TR/reporting-1/)、[Content Security Policy Level 3](https://www.w3.org/TR/CSP/)。

### DR-117 JS Self-Profiling API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存S-680への統合を追加しない。
- 元案: playerの操作ではなく実装者がcodeを最適化し、特定関数のself timeを削減すると開く「開発者向けデバッグ箱」だった。
- API固有部分: `new Profiler()`でsampling sessionを開始し、`stop()`からsamples、stacks、frames、resourcesを持つtraceを得る。requested intervalでのsamplingはbest-effortで、user agentはbackground時にpauseできる。Document Policyの`js-profiling-mode`による明示許可を必要とする。
- 新規案: 三つのbounded処理を順にprofileし、実traceで最も多くsampleされたhot functionをplayerが答える診断卓を検討した。S-680 Console診断卓へ`console.table()`でtrace要約を出す案も含む。
- 却下理由: APIはbrowser所有のprofile画面、permission prompt、player操作UIを持たず、見える診断表はgame製formatterとConsole APIによる。sampling結果は端末性能、JIT、sampling timing、foreground状態で揺れ、安定させるにはgame側が不要な長時間CPU処理を行う必要がある。固定traceを使えば実APIの意味がなくなる。
- 実装上の扱い: 将来local開発時の性能調査へ任意利用してよいが、それだけでは採用APIや問題箱へ数えない。playerのstack、function name、resource URL、timing traceを保存、Drive同期、file export、analytics、network送信しない。
- 対応状況: WICG Draft Community Group Reportで、実装はChromium中心の限定対応である。非対応環境へ`performance.now()` instrumentationやDevTools recordingを代替clearとして追加しない。
- 件数: stage・問題箱を増やさず、計画値は76stage・180箱のままとする。
- 根拠: [WICG JS Self-Profiling API](https://wicg.github.io/js-self-profiling/)、[Chromium Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/7K7Qt7aRJ8s)。

### DR-118 Prioritized Task Scheduling API

- 決定日: 2026-07-21
- 最終分類: 却下。新規stage、箱、共通runtime要件を追加しない。
- 元案: 高優先度と低優先度のtaskを、指定した順序で実行した時だけ箱を開く案だった。`scheduler.postTask(step, { priority: "user-visible" })`を使い、箱内部のleverへpriorityが付く演出を想定していた。
- 検討1: 固定登録順の文字cardへ3段階priorityを割り当て、実行結果を`BUSYBOX`にする案。player操作と見た目が通常のstable sortへ収束し、browser scheduler固有の体験にならないため不採用。
- 検討2: 三つの機械へpriority leverを付け、同じ処理権を要求したcallbackのうち先に実行された機械だけを発光させる案。実callback順を使っても、playerには勝者を選ぶ通常のrace / lane選択に見え、priority APIでなければ成立しない操作にならないため不採用。
- 検討3: `TaskController.setPriority()`で待機中taskを緊急昇格させ、background backlogを追い越す案。playerがpriorityを切り替える時間を作るには人工delay、task大量投入、CPU負荷、または実行履歴の後付けanimationが必要になり、直接観測性か安全性を損なうため不採用。
- API調査: `postTask()`は`user-blocking`、`user-visible`、`background`の3 priority、delay、abortを扱い、同一Schedulerのrunnable taskはstrict priority順になる。`TaskController`は関連TaskSignalのpriorityを変更し`prioritychange`を発火でき、`yield()`のcontinuationは同じTaskPriorityの通常taskより高いeffective priorityを持つ。一方、通常event-loop taskとの選択はuser agent裁量を残す。
- DR-095との関係: DR-095の原文も`postTask(..., { priority: "background" })`による低priority task完了を中心にしており、DR-118と同じ機構なので重複のままとする。どちらからも箱を作らない。将来、非必須処理の内部schedulerとして使うことは妨げないが、仕様要件や採用実績には数えない。
- 件数: stage・問題箱は増えず、DR-121追加後の計画値は65stage・153箱のまま。
- 根拠: [Prioritized Task Scheduling](https://wicg.github.io/scheduling-apis/)。

### DR-119 投機ルール API

- 決定日: 2026-07-29
- 最終分類: 却下。新規stage、問題箱、既存S-220への統合を追加しない。
- 元案: playerが次に進むstageを予測し、投機が当たった場合だけ滑らかに遷移する。「先を読む箱」だった。
- API固有部分: speculation rulesはnavigation候補とeagernessを宣言し、browserがprefetchまたはprerenderを裁量実行する。target documentは`document.prerendering`、`prerenderingchange`、`PerformanceNavigationTiming.activationStart`から事前実行とactivationを観測できる。
- 元案の問題: 遷移速度はcache、network、端末性能でも変わるため、playerは投機成功と通常の高速読込を区別できない。browserがresource条件等でhintを実行しなくても失敗ではなく、滑らかさをclear条件にできない。
- 新規案: S-220-B05「先に入っていた部屋（仮）」として、専用linkへのhover / pointer interactionでdedicated full documentをprerenderし、targetがprerender状態を経験した後にactivationされた場合だけ、到着時に既に開いた箱を表示する案を検討した。
- 却下理由: game側は実prerenderを証明できるが、playerが直接見るのは到着時の開箱、経過表示、即時navigationというgame製またはgenericな見た目だけである。browserは投機中の専用UI、indicator、permission promptを出さず、player自身はAPI固有現象だと気づけない。
- 実装上の扱い: DevToolsのSpeculations panel、Network panel、page編集を解法にしない。通常navigationの内部品質改善へ投機ルールを任意利用してもよいが、それだけでは採用API、問題箱、clear条件へ数えない。過剰なimmediate prerenderで帯域、memory、CPUを浪費しない。
- 件数: stage・問題箱を増やさず、計画値は76stage・180箱のままとする。
- 根拠: [HTML Standard](https://html.spec.whatwg.org/multipage/speculative-loading.html)、[Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html)、[Chromeのprerender説明](https://developer.chrome.com/docs/web-platform/prerender-pages)。

### DR-120 コンソール API

- 決定日: 2026-07-24
- 最終分類: 一部採用。新規G-066 / S-670「端末迷路（仮）」1箱を置く。G-067 / S-680「端末診断卓（仮）」はD-135で体験重複のため不採用へ変更した。
- 元案: 「箱はConsoleでだけ喋る」Hidden箱として、DevTools Consoleへround固有の手掛かりを出し、playerが読んだ答えをpageへ入力する案だった。`console.log("%c42", ...)`による色付きの一問一答を想定していた。
- 共通再設計: Consoleをread-onlyの文字画面として使い、`console.log()`、`console.table()`、`console.group()`等でround状態を表示する。player入力はpage上のbutton、switch、dialだけから受け、DevTools evaluatorへのJavaScript入力、Consoleからの関数呼出し、DOM / CSS / script /進捗編集を解法として要求・承認しない。
- S-670端末迷路: ConsoleへASCII迷路、現在位置、向きをtextで表示し、page上の上下左右buttonで1stepずつ移動する。各操作後に専用label付きgroupへ盤面を再出力し、実round stateが出口へ到達した時に1箱を開く。色、文字幅、groupの開閉状態だけへ依存せず、monospaceでなくても壁、通路、現在位置を文字として判別できるfixtureにする。
- S-680端末診断卓: switch / dialと`console.table()`の案まで試作したが、Consoleをread-only表示面、pageを入力面として往復する中心体験がS-670と重なる。2026-08-09に別stage・箱を作らないと決定した。
- 再表示と対応差: `console.clear()`でplayer自身のlogを消さない。pageに「端末を再表示」操作を置き、Consoleを後から開いた場合やbuffer上限で過去logが失われた場合も現roundを再出力できるようにする。ConsoleのPrinter、table列、色、object展開、group UIは実装依存なので、正解に必要な情報はplain textでも保持する。
- 成功条件の境界: Consoleが開いていること、logを読んだこと、groupを展開したことはpageから標準的に観測できないため成功条件にしない。迷路の位置と診断卓のpage-side stateだけを判定し、Console出力は不可欠な手掛かり表示として使う。Consoleへ答えそのものを一行で出して通常text inputへ転記するだけの元案には戻さない。
- scope / privacy: desktop向けHidden / Labsとして通常導線の必須完了へ含めない。round seed、迷路盤面、診断値以外のapp state、個人情報、token、permission、device情報をlogしない。離脱・reset時にround stateを破棄し、永続化するのは通常の解決済みproblem IDだけとする。
- 検証: S-670について、自動testはConsole methodへの引数、再表示、page操作からのstate遷移、Console入力なし、reset、再入場をspyで確認する。実browserではChromium、Firefox、SafariのConsoleでplain text、group、長いlog、狭いDevTools幅、keyboard操作を確認する。S-680用fixtureは製品へ追加しない。
- 件数: 新規2stage・2箱を追加し、計画値は68stage・159箱とする。
- 根拠: [Console Standard](https://console.spec.whatwg.org/)。

### DR-121 権限 API

- 決定日: 2026-07-21
- 最終分類: 採用。新規G-064 / S-650「四つの許可（仮）」に4箱を置く。
- 相談中の元案: 位置、通知、カメラ等の許可状態を箱へ挑む前に診断し、必要権限が揃うと箱面へ本当の鍵穴を表示する「儀式の準備チェック」だった。成功条件は権限診断の通過で、`navigator.permissions.query({ name: "geolocation" })`を想定していた。
- 当初の統合先: 企画書の端末診断はSecure Context、PWA、保存、入力機器、描画能力、権限等を技術一覧ではなくstage mapや装置の反応で示す案である。現行StageCardは主にinterfaceの存在から`available`、`permission-required`、`unsupported`等を返すが、実PermissionStatusを共通照会していない。当初はここへDR-121を統合する案だった。
- 最終再設計: 診断表示だけに留めず、playerがbrowserのnative permission promptまたはsite settingsで権限をONにし、対応PermissionStatusが`granted`になると箱が開く独立stageへ変更する。B01位置情報、B02通知、B03カメラ、B04マイクとする。
- 観測: stage開始時に4 descriptorを個別に`navigator.permissions.query()`し、初期stateが`granted`なら対応箱を開く。保持した各PermissionStatusの`change`を監視し、外部site settingsで`granted`へ変わった場合も即時に開く。focus / visibility復帰時にも再照会する。`prompt`、`denied`、query失敗、descriptor非対応では開かない。
- 明示要求: 各箱に別buttonと事前説明を置く。B01は`getCurrentPosition()`を1回要求して座標を即時破棄、B02は`Notification.requestPermission()`だけを実行して通知を送らない。B03はvideo-only、B04はaudio-onlyの`getUserMedia()`を別々に要求し、成功時は全trackを即時`stop()`して映像・音声を描画、再生、解析しない。request結果だけで開けず、必ずPermissionStatusを再照会して`granted`を確認する。
- 除外: pushは通知権限およびDR-093のsubscriptionと重なる。persistent-storageはplayerが確実にONにできずDR-104で却下済み。clipboard、sensor、MIDI、local-fonts、window-management等はdescriptor対応差、別stageとの重複、hardware / policy条件を混ぜるため、この4箱へ追加しない。
- 状態変化: 一度開いた箱は後から権限をOFFにしても閉じない。PermissionStatus、許可変更履歴、時刻、位置、device label、映像、音声を保存・同期・送信せず、通常の解決済みproblem IDだけを永続化する。
- 対応差: `navigator.permissions`または個別descriptorがない環境では該当箱を未観測にする。Notification.permission、API request成功、自己申告、別descriptorによる代替clearは作らない。`granted`はhardware存在や実API成功を保証しないため、このstage外の箱を自動clearしない。
- cleanup: 離脱・reset・abort時に全PermissionStatusの`change` listener、focus / visibility listener、geolocation callback参照を破棄し、残ったmedia trackを停止する。遅れて完了したstreamも直ちに停止する。
- 件数: 新規1stage・4箱を追加し、計画値は65stage・153箱とする。
- 根拠: [Permissions](https://w3c.github.io/permissions/)、[Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)、[Notifications API](https://notifications.spec.whatwg.org/)、[Geolocation](https://www.w3.org/TR/geolocation/)。

### DR-126 WebOTP API

- 決定日: 2026-07-26
- 最終分類: 採用。新規G-074 / S-750「届いた封書（仮）」へ、攻略必須経路から外したLabsの1箱を置く。
- 元案: 現実のSMSで届く一時鍵を読み、OTP一致で箱を開く。「現実の封書を開いて、その番号で箱を開ける」という演出だった。通常の認証flowのようにgame serverがplayerの電話番号へcodeを送る構成を想定していた。
- 新規設計: gameは電話番号を受け取らず、SMSを送信しない。playerが明示的に「SMSを待つ」を押すとmemory上へcurrent roundの6桁数字codeを生成し、実`navigator.credentials.get({ otp: { transport: ["sms"] }, signal })`を開始してから、協力者または別の携帯電話へ渡すcopy可能なSMS文面を表示する。最終行は実公開hostへ結び付けた`@host #code`とする。
- player操作: 別のSMS送信者が表示文面をplay端末へ送る。一箱のclear条件を「current OTPがbrowser所有のOTP専用入力経路から入ること」とし、二つの肯定的な証明経路を同じB01へ束ねる。WebOTP経路はnative確認UIでplayerが許可し、待機中のpromiseが返した実`OTPCredential.code`がcurrent round codeと一致した時に開く。AutoFill経路はSafari等のSecurity Code AutoFillを含むuser-agent所有のOTP入力UIから同じcurrent codeが入った時に開く。
- AutoFillの強い判定: 空で未汚染の`<input autocomplete="one-time-code">`が一度のtrusted browser editで6桁全体へ変化し、次のanimation frameでも`:autofill`またはlegacy alias `:-webkit-autofill`に一致し、値がcurrent round codeと完全一致することを要求する。開始後にmanual text insertion、paste、drop、composition、途中編集、programmatic value設定のいずれかが先行したroundはAutoFill経路を失効させる。keydownの不在、`isTrusted`だけ、`inputType="insertReplacementText"`だけ、CSS色、timingだけでは開かない。
- 手入力との分離: WebOTP経路はcredential fulfillment、AutoFill経路はuser-agent autofill pseudo-classという正の証拠を使う。manual input、paste、drop、IME、音声入力、通常文字候補、SMS受信の自己申告、表示codeだけの提出では開かない。`:autofill`はSMS出所そのものを示さないため、OS / browserがOTP専用fieldへcurrent codeをAutoFillしたなら方法を限定せず正解とする。これは「何らかのOTP専用の方法で自動入力した」というB01定義に含める。
- round境界: codeは4〜10文字かつ数字を含む実装要件を安定して満たす6桁数字とし、`crypto.getRandomValues()`から生成する。固定flagや保存済み進捗と混ぜず、request開始後に届いたcurrent round SMSだけを受ける。codeは複数context同期と到着済みSMSのreplay拒否に不可欠な短命値なので、固定回答原則の例外とする。
- 対応差: WebOTP経路は`OTPCredential`、secure context、SMS受信環境、browser確認UIが揃う環境を対象にする。AutoFill経路は`autocomplete="one-time-code"`と`:autofill`観測が成立するSafari / WebKit等を対象にする。Safari Security Code AutoFillが実機でpseudo-classを設定することをPoC gateにし、観測できない環境へinput event列だけのfallbackを作らない。Chrome desktopのAndroid連携は成立すれば同じ実credentialとして許可する。送信者が受信者の連絡先に登録済みの場合などplatform上の不成立条件を開始前helpへ記載する。
- privacy / safety: phone numberはpageへ入力させず、game、GitHub Pages、Drive、analyticsへ渡さない。playerと協力者がSMS appの外側で宛先を扱う。開始前に、別端末または協力者、SMS契約と料金、carrier / OS / 送信者が公開hostを含む本文を扱うこと、SMSは強い本人認証ではないことを説明する。認証、account recovery、本人確認には流用しない。
- lifecycle: cancel、timeout、reset、離脱、route変更ではAbortControllerをabortし、pending promise、input / beforeinput / paste / drop / composition listener、round code、credential参照、AutoFill入力値、UI上の文面を破棄する。late fulfillmentと古いroundをgeneration照合で拒否し、code、SMS本文、送信者、電話番号、到着時刻、入力履歴を保存・同期・送信しない。永続化するのは通常の解決済みproblem IDだけとする。
- flag: B01開箱後はcopy可能な固定flag `BUSYBOX{THE_ORIGIN_BOUND_SMS_REACHED_THE_BROWSER}`を表示する。SMSへflagを入れず、SMSのcodeを最終回答として保存しない。
- 統合先案との区別: S-380 / S-390はWebAuthn authenticator、S-650はPermissionStatusを扱う。S-750は別の電話回線から届くorigin-bound SMSとbrowser確認UIを中心操作にし、既存credential / permission stageへ箱を足さない。
- 検証: 自動testはWebOTP fulfillment / rejection、credential type、current / stale code、二重解決、abort、timeoutに加え、`:autofill`有無、一括full-code change、事前手入力、paste、drop、composition、programmatic value、edit-after-fill、reset、late result、feature欠損、非保存をfake providerで確認する。H-046で実SMS、native確認UI、別送信者、Safari Security Code AutoFillと実`:autofill`、連絡先条件、cancel、料金説明、Android / iOS / desktop連携、非対応環境を確認し、DevToolsのvirtual SMSを公開受入証跡にしない。
- 件数: 新規1stage・1箱を追加し、計画値は75stage・177箱とする。
- 根拠: [WebOTP API](https://wicg.github.io/WebOTP/)、[Origin-bound one-time codes delivered via SMS](https://wicg.github.io/sms-one-time-codes/)、[Chrome WebOTP解説](https://developer.chrome.com/docs/identity/web-apis/web-otp)。

### DR-127 Federated Credential Management API

- 決定日: 2026-07-30
- 最終分類: 採用。新規G-076 / S-770「身分証棚（仮）」へ、攻略必須経路と全箱必須報酬から外したprovider別のLabs箱を置く。現計画には成立確認済みのGoogle 1箱だけを下限として算入する。
- 元案: 別世界のfederated IDを提示し、連携IDが箱の規則と一致すると勢力の印章で門が開く。特定のIdP、account属性、identity backendによる照合を想定していた。
- 元案をそのまま採らない理由: account属性や勢力を正解にすると、BusyboxがJWTを検証してidentityを信頼するbackendを持つ必要があり、実account情報をgameplayへ過剰に使う。Google accountの有無や内容を解答にせず、browserが外部IdPを仲介するFedCM固有の手動提示だけを中心動詞として残す。
- 新規設計: 実装着手時にserviceの公式情報を再調査し、公式FedCM endpointまたはSDK、一般向けRP / client登録、provider自身または信頼できるmanaged運用、fallbackと区別できる肯定的FedCM証拠、Busybox独自server / Cloud Functions / serverless function / identity database不要、をすべて満たすproviderごとに独立箱を置く。有名なOAuth / OIDC providerであるだけでは採らず、broker配下でX等へ通常loginする経路をそのserviceのFedCM箱として数えない。
- provider registry: 各候補の調査日、公式資料、config URLまたはSDK、client登録手順、利用条件、要求field、FedCM証拠、解除方法、実account PoCを記録する。追加providerはpublic client登録まで成功してから固定problem IDと箱数を加える。実装開始前の名前だけの候補を計画数へ数えない。
- Google下限: Google Identity Servicesは成立確認済みのmanaged IdPとしてB01へ置く。Google Drive進捗保存とは別project / OAuth clientを使い、`auto_select: false`、非空credential、厳密な`select_by === "fedcm"`を要求する。`fedcm_auto`、`auto`、`user`、`btn`その他のlegacy / button / popup / redirect経路では開かない。
- player操作と成功条件: provider名を示した明示操作から単一providerのactive attemptを開始する。公式SDKがFedCM専用resultを返す場合はその証拠、標準APIを公式に案内するproviderでは実`navigator.credentials.get({identity})`の`IdentityCredential`と期待`configURL`を使う。一つのpassive multi-IdP chooserへまとめず、一箱と一providerを対応させる。
- 認証との分離: tokenのpayloadをdecodeせず、署名検証、account ID / email / name / picture照合、本人確認、account login、勢力判定をしない。各箱が証明するのは「browserが公式managed IdPを仲介し、playerが該当providerのFedCM UIで手動提示した」ことだけである。server-side verificationやauthorization code exchangeが必要なproviderは採らない。
- privacy: 開始前に必要account、online接続、providerとbrowserが扱う情報、pageへtokenが一時的に返ることをprovider別に表示する。tokenとaccount propertyをDOM、console、error reportへ出さず、local / session storage、IndexedDB、Drive同期、file export、analytics、Busybox backend、別endpointへ渡さない。判定後すぐ参照を破棄し、永続化するのはprovider別の通常の解決済みproblem IDだけとする。
- lifecycle / account connection: provider側connectionはBusybox resetで変更せず、公式account管理から解除できる方法をprovider別に案内する。他grantへ影響し得るauto revokeは行わない。cancel、prompt非表示、network failure、reset、離脱、route変更ではattempt generationを更新し、late / duplicate resultと一時token参照を破棄する。
- 対応差: provider account、FedCM対応browser、必要設定、online接続が揃わない箱は未観測にする。OAuth redirect、popup、通常Sign-In button、game製account chooser、mock credential、Drive OAuth flowを代替clearにせず、複数serviceへの新規登録を攻略や報酬の条件にしない。
- 非言語演出: FedCM操作の成立時に対応箱だけを開き、provider別の完了messageや固定flagを後置しない。token、account property、client IDは表示用文字列やround tokenへ混ぜない。
- 統合先案との区別: S-380 / S-390はlocal authenticatorによるWebAuthn credential lifecycle、S-750は実SMSをbrowser所有OTP経路で受ける。S-770は第三者IdPのaccount chooserとbrowser mediationが中心なので、既存credential stageへ箱を足さない。
- 検証・件数: provider adapter共通contractでmanual FedCM、auto / legacy result、unexpected config URL、空token、prompt非表示、cancel、network error、duplicate / late result、reset、離脱、非保存を自動確認する。H-049で採用providerごとのclient登録、実account、native UI、manual Continue、解除案内、token非保存を確認する。Google 1箱を下限として新規1stage・1箱を追加し、計画値は77stage・181箱とする。追加providerはPoC完了後に加算する。
- 根拠: [FedCM IdP integration](https://developer.mozilla.org/en-US/docs/Web/API/FedCM_API/IDP_integration)、[FedCM RP sign-in](https://developer.mozilla.org/en-US/docs/Web/API/FedCM_API/RP_sign-in)、[Chrome FedCM overview](https://developer.chrome.com/docs/identity/fedcm/overview)、[Google Identity Servicesのclient ID設定](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)、[FedCM移行ガイド](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)、[GIS JavaScript API reference](https://developers.google.com/identity/gsi/web/reference/js-reference)。

### DR-128 決済リクエスト API

- 決定日: 2026-07-30
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合を追加しない。
- 元案: 支払そのものではなく通貨の組み合わせを鍵に見立て、指定した支払detailをbrowserの標準payment UIで模擬承認すると商人箱または寄付箱が開く。
- APIの実態: Payment Requestはmerchant、payer、payment methodを仲介し、`show()`でhandlerを選ばせ、user承認後にmerchantが処理する`PaymentResponse`を返す。架空決済を安全に完了させるsimulation modeではない。汎用card入力に使われた`basic-card` payment method identifierはDeprecatedである。
- 却下理由: 実Google Pay / Apple Pay等を指定すると、browser UIが実購入を意味し、payment credential、merchant登録、実決済の誤認・誤操作を持ち込む。総額0や架空通貨labelでもUIの意味は変わらない。payment sheetを開いてcancelするだけの案は肯定的な支払完了でなく、user cancel、handler不存在、browser裁量のabortをplayerが区別できない。
- DR-129との境界: Web Payment Handlerを自作し、架空payment methodをService Workerで処理する可能性はDR-128単体の案として採らず、次のDR-129でbrowser所有handler選択、JIT install、`PaymentRequestEvent`、handler windowの固有体験として別に判断する。
- privacy / safety: 実payment method、card、billing / shipping address、payer name / email / phone、payment tokenを要求、取得、保存、同期、送信しない。実決済providerのtest modeや最低額決済をgameplayへ使わない。
- 件数: stage・問題箱を増やさず、計画値は77stage・181箱のままとする。
- 根拠: [Payment Request API](https://www.w3.org/TR/payment-request/)、[MDN Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)、[MDN payment processing concepts](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API/Concepts)。

### DR-129 決済ハンドラー API

- 決定日: 2026-07-31
- 最終分類: 採用。新規G-077 / S-780「四つの財布（仮）」を任意Labsとして追加する。
- 元案: 架空の「眠りの通貨」をWeb Payment Handlerで受け取り、正しい支払flowを完了すると箱が開く。
- API固有性: BusyboxがGit管理する架空payment methodと複数の架空payment handlerだけを使う。browser所有のhandler候補、選択後にService Workerへ届くtrusted `PaymentRequestEvent`、handler window、`respondWith()`、merchant側の`complete()`と`retry()`を中心操作にする。実Google Pay / Apple Pay、card、実通貨、実merchant accountを使わない。
- B01 handler選択: 複数の架空handlerから指定された正しいhandlerを選び、そのhandlerのService Workerがcurrent attemptのtrusted `PaymentRequestEvent`を受け取った時点で開く。page clickやgame製wallet pickerだけでは開かない。
- B02 承認: handler windowで架空支払いを承認し、期待methodのresponseをmerchantが受け、`complete("success")`へ到達した時点で開く。
- B03 拒否: handler windowで意図的拒否を選び、handlerが返す固定の架空拒否resultをmerchantが検証して`complete("fail")`へ到達した時点で開く。例外、handler不在、browser cancelを拒否成功へ数えない。
- B04 再試行: 同じhandlerの最初のresponseへmerchantが`PaymentResponse.retry()`を行い、再提示された同じhandlerで正しい架空instrumentを選んで二度目のresponseを成功完了した時点で開く。別handlerへの切替、最初からの成功、game製retry UIだけでは開かない。
- 非言語演出: 各条件が成立した瞬間に対応箱だけを開く。短い取引結果、完了message、固定flagを表示せず、handler window内も承認・拒否・instrument選択などpayment lifecycleに必要な図形操作へ限定する。権限・privacy・非対応・error・accessibilityの説明だけは非言語性を理由に省かない。
- privacy / safety: payer name / email / phone、billing / shipping address、card、実payment credential、payment tokenを要求しない。架空response detailsはcurrent attemptの判定後に破棄し、通常の解決済みproblem IDだけを保存する。handler登録、window、pending request、listener、Service Worker scopeはresetと離脱時のcleanup仕様を持たせる。
- 対応差: Payment Handler非対応環境、handler登録失敗、JIT install UI非表示、cancel、`AbortError`、`OperationError`は未観測とし、game製payment sheetによる代替clearを作らない。候補UI、trusted event、`complete("fail")`、同一handler `retry()`を公開対象browserで実PoCしてから公開する。
- DR-128との境界: Payment Requestは架空handlerをbrowserから起動するmerchant側配線としてだけ使う。実payment methodを模擬通貨へ流用するDR-128案を復活させず、実providerを一つでも混ぜない。
- 件数: 新規1stage・4箱を追加し、計画値を78stage・185箱とする。
- 根拠: [Payment Handler API](https://www.w3.org/TR/payment-handler/)、[Web-based Payment Handler API](https://developer.mozilla.org/en-US/docs/Web/API/Web-Based_Payment_Handler_API)、[Payment Request API](https://www.w3.org/TR/payment-request/)、[PaymentResponse.retry()](https://developer.mozilla.org/en-US/docs/Web/API/PaymentResponse/retry)。

### DR-130 帰属レポート API

- 決定日: 2026-07-31
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、historical exhibitを追加しない。
- 元案: playerがどの導線から来たかをattribution sourceとして登録し、後のconversion triggerと一致した場合に反応が変わる「マーケ箱」を作る。
- APIの実態: `attributionsrc`、Fetch / XHRのattribution設定とHTTP response headerでsource / triggerを登録し、browserの非公開領域で照合した後、遅延・noise・件数制限を伴うreportをserver endpointへ送る。元案の`registerAttributionSource()`という直接的なclient APIはない。
- 却下理由: Googleは2025-10-17にAttribution Reporting APIのretireを発表し、Chromeは144でdeprecationを開始して削除を予定している。廃止予定APIを新規stageやhistorical exhibitへ固定しない。
- player体験: source登録、trigger登録、一致、不一致、report送信にbrowser固有UIがなく、pageへ一致を通知する確定eventもない。playerが知覚するのは通常のlink遷移とgame製結果だけで、非言語のbrowser固有パズルにならない。
- backend / privacy: 成否を知るには`.well-known/attribution-reporting/`配下等でreport POSTを受けるbackendが必要で、通常reportは即時でなくnoiseもある。debug reportもserver側の統合診断用で、即時開箱のclient証拠にしない。実広告、campaign、第三者計測service、tracking profileを導入しない。
- 代替案: URL query / fragment、`document.referrer`、History、same-origin storageで導線を記録すれば確実だが、Attribution Reporting固有性がなく既存navigation / fragment / storage体験とも重複するため、置換stageや統合箱を追加しない。
- 件数: stage・問題箱を増やさず、計画値は78stage・185箱のままとする。
- 根拠: [Privacy Sandbox技術の退役発表](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies)、[Privacy Sandbox feature status](https://privacysandbox.google.com/overview/status)、[Chrome 144 beta](https://developer.chrome.com/blog/chrome-144-beta)、[Attribution Reporting API](https://developer.mozilla.org/en-US/docs/Web/API/Attribution_Reporting_API)。

### DR-131 Private State Token API

- 決定日: 2026-07-31
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、demo issuer依存、historical exhibitを追加しない。
- 元案: 以前に正しく儀式を終えたplayerへ個人を識別しない「見えない紋章」を発行し、別contextでそのtrust signalを償還できた場合だけ箱を開く。
- APIの実態: issuerがbrowserへ暗号tokenを発行し、redeemerがtokenを償還してRedemption Recordを得る。`document.hasPrivateToken(issuer)`と`document.hasRedemptionRecord(issuer)`は保存有無をBooleanで返し、Fetch / XHR / iframeのprivate token operationで発行・償還・record転送を行う。APIは信頼を確立せず、issuerが別手段で決めた粗いtrust signalを伝える。
- status: Attribution Reporting等と異なり、Private State Tokensは2025-10-17のPrivacy Sandbox整理後も継続サポート対象である。廃止予定を却下理由にしない。
- backend理由: 本番issuerにはChromeへのissuer登録、key commitment、token issuance、暗号鍵保護が必要で、redeemerにもredemption endpointとrecord検証が必要になる。公式guideは独自server-side application、TLS、key rotation、observabilityを前提にする。Service Worker、GitHub Pages、固定fixtureだけでは正規発行・償還を構成できない。
- managed service調査: Busyboxの架空儀式を任意の発行条件にできる一般向けmanaged PST issuerは確認できない。Chrome issuer registryはhosted serviceの一覧でなく自前issuerの登録台帳であり、`privatetokens.dev`等は検証demoなのでproduction gameplayへ依存させない。reCAPTCHA等の別anti-fraud productをPST箱の代替clearにしない。
- player体験: 通常画面には発行prompt、token icon、償還確認UIがない。Chrome DevToolsのApplication panelならtokenを確認できるが、DevTools操作を解法にしない既定方針と衝突する。通常playerへ見えるのはrequest後のgame製開箱だけで、backend・鍵運用に見合うbrowser固有体験にならない。
- privacy / lifecycle: PSTは個人識別を避けるが端末情報の保存を伴い、地域によって同意要否の検討が必要である。架空trustを運ぶだけのためにanti-fraud基盤、issuer reputation、鍵管理、法的説明を持ち込まない。
- 代替案: 既存署名progress、same-origin storage、FedCM等へ「見えない紋章」を置き換えるとPST固有の匿名issuer / redeemer flowを失い、既存stageと重複するため追加しない。
- 件数: stage・問題箱を増やさず、計画値は78stage・185箱のままとする。
- 根拠: [Private State Tokens](https://privacysandbox.google.com/protections/private-state-tokens)、[Private State Tokens developer guide](https://privacysandbox.google.com/protections/private-state-tokens/developer-guide)、[Private State Token API](https://developer.mozilla.org/en-US/docs/Web/API/Private_State_Token_API)、[Privacy Sandbox feature status](https://privacysandbox.google.com/overview/status)。

### DR-132 Topics API

- 決定日: 2026-07-31
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、historical exhibit、browserの広告privacy設定変更を要求する箱を追加しない。
- 元案: browserが推定したplayerの関心topicに応じて内容が変わるpersonalized箱を置き、そのカテゴリに対応した謎を解く。
- APIの実態: Topicsを利用する複数siteでの観測からbrowserが一般的関心を分類し、週単位のepochごとにtop topicを更新する。`document.browsingTopics()`、Fetch / iframe request headerでcallerが以前観測したtopicを受ける。Privacy Sandbox enrollmentを要し、通常の履歴全体や即時の関心を返すAPIではない。
- status: Googleは2025-10-17にTopics APIのretireを発表し、Chrome 144からdeprecationを開始して削除を予定している。MDNもDeprecated、Non-standardとし、FirefoxとSafariのstandards positionは否定的である。廃止予定を主な却下理由にする。
- player制御性: 関心topicは複数siteの過去観測、epoch、履歴不足、noise、browser設定に左右され、playerがstage内の操作だけで目的topicを即時・確実に作れない。固定topicをgame側で選ぶfallbackはTopics APIでなく通常分岐なので追加しない。
- player体験: API呼出し時のbrowser固有UIはなく、playerが見るのはgameが表示したカテゴリと分岐だけである。browserの広告privacy設定面を開かせたりtopicを変更させたりすることも、設定依存・privacy負担・非決定性を増やすため成功条件にしない。
- privacy: 閲覧傾向から推定された関心カテゴリをgameplayへ利用、表示、保存、Drive同期、file export、analytics、network送信しない。敏感カテゴリをtaxonomyが除外する設計であっても、ゲームの正解へ使う根拠にはしない。
- 件数: stage・問題箱を増やさず、計画値は78stage・185箱のままとする。
- 根拠: [Privacy Sandbox技術の退役発表](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies)、[Privacy Sandbox feature status](https://privacysandbox.google.com/overview/status)、[Chrome 144 beta](https://developer.chrome.com/blog/chrome-144-beta)、[Topics API](https://developer.mozilla.org/en-US/docs/Web/API/Topics_API)。

### DR-134 フェンスフレーム API

- 決定日: 2026-07-31
- 最終分類: 却下。新規stage、問題箱、既存stageへの統合、historical exhibitを追加しない。
- 元案: 外界から見えない小箱を埋め込み、その内部でだけ鍵を生成し、隔離枠内の条件達成で開く「覗けない密室箱」を作る。
- APIの実態: Fenced Frameはplayerから見えないframeではなく、描画contentは通常どおり見える一方、embedderとframeが互いのDOM、URL、状態を観測・共有できない隔離された埋め込みである。通常の`postMessage()`による親子通信も意図的に使えない。
- 進捗連携: 隔離枠内だけで箱を開けば見た目は作れるが、通常のProblemGiftBox、保存、Drive同期へ達成を渡せない。逆に親pageから観測できるよう独自channelを設けるとAPIの隔離を崩す。frame内に任意の謎を作る案はFenced Frame固有の操作でなく、埋め込みcontentを自由に制作した結果なので採らない。
- reporting: `window.fence.reportEvent()`は事前設定されたreporting先へbeaconを送る広告計測用経路であり、親pageへの同期eventではない。Privacy Sandbox enrollmentや受信backendを持ち込み、親pageがpollする構成にはしない。Service Workerでの受領可否に依存する未確定な迂回路も、既存S-060-B02のoffline Beacon受領と体験が重なるためPoC対象にしない。
- player体験: browser所有のprompt、枠表示、隔離状態indicatorはなく、通常playerにはiframe風のgame製contentとして見えるだけである。top-level navigationで外へ出す案も通常navigationと区別できず、既存iframe / navigation系stageへ追加しない。
- status / 実装差: Fenced Frames自体はPrivacy Sandboxの継続サポート対象であり、廃止予定を却下理由にしない。ただし一般的なconfig生成元だったShared StorageとProtected Audienceは廃止方向で、現行MDNは`FencedFrameConfig`をscriptから手動構築できないと説明する一方、WICG草案にはconstructorがあり、公開実装との差も大きい。browser flagやDevToolsを解法・公開要件にしない。
- privacy / cleanup: cross-site広告計測、interest group、Shared Storage、第三者reporting endpoint、実広告識別子を導入しない。隔離を模倣する通常iframeも代替clearとして追加しない。
- 件数: stage・問題箱を増やさず、計画値は78stage・185箱のままとする。
- 根拠: [Fenced Frame API](https://developer.mozilla.org/en-US/docs/Web/API/Fenced_frame_API)、[Fenced Frameとの通信](https://developer.mozilla.org/en-US/docs/Web/API/Fenced_frame_API/Communication_with_embedded_frames)、[Privacy Sandbox Fenced Frames](https://privacysandbox.google.com/private-advertising/fenced-frame)、[Privacy Sandbox feature status](https://privacysandbox.google.com/overview/status)、[FencedFrameConfig](https://developer.mozilla.org/en-US/docs/Web/API/FencedFrameConfig)、[WICG Fenced Frame草案](https://wicg.github.io/fenced-frame/)。

### DR-137 Local Font Access API

- 決定日: 2026-08-01
- 最終分類: 採用。新規G-078 / S-790「活字の鍵（仮）」を任意Labs 1箱として追加する。
- 元案: PCへ偶然installされているfont群を列挙し、その頭文字の並びから鍵を導く「この端末らしさ」で開く箱だった。
- 破棄する部分: installed font集合、件数、並び、一般font名を正解にしない。端末・OS・言語・software構成で答えが変わるacrostic、広いfont列挙、既存fontによるfingerprintingを使わない。
- 新規案: Busybox自身が生成してGit管理する小さな専用OpenType fontを箱からdownloadし、playerがOS標準のfont preview / install UIでsystem fontへ追加する。stageへ戻って明示走査するとbrowserの`local-fonts` permissionを要求し、`queryLocalFonts({ postscriptNames: [expectedName] })`で専用PostScript名だけを照会する。
- 成功条件: current attemptのuser activationから実`queryLocalFonts()`が期待する1 faceを返し、その`FontData.blob()`がGit管理sourceの期待metadataとchecksumを満たし、Blobから生成した`FontFace`が専用glyphを表示できた場合だけB01を直接開く。permission grantedだけ、全font列挙、`@font-face local()`だけ、downloadだけ、file input / drag-and-drop、同名別font、game bundled webfont、mock FontDataでは開かない。OSがinstall時にbytesを書き換える環境は実PoCで許容可能な固定table検証へ狭め、名前だけへfallbackしない。
- player体験: downloadした活字がOSのfont install UIを通ってsystem fontになり、browser所有permission promptの後にWebへ戻って専用glyphとして現れる。page内で任意のfontを選ぶeditorや文字列謎を作らず、glyph表示と開箱を同じ肯定的反応にする。固定flagや完了messageを表示しない。
- asset方針: 専用font、生成source、license、再生成手順、checksumを実装前にrepositoryへ置き、runtime生成や第三者commercial fontへ依存しない。font sizeとglyph数を最小化し、malformed tableを使わない。
- privacy / cleanup: 特定PostScript名だけを要求し、返却された他font、端末font一覧、family / style、raw bytesを表示、log、保存、Drive同期、file export、analytics、network送信しない。照合後はBlob、ArrayBuffer、object URL、FontFace参照を破棄し、永続化するのは通常のB01解決済みproblem IDだけとする。終了時にOSから専用fontをuninstallする方法とsite informationから`local-fonts` permissionを解除する方法を案内し、自動削除を装わない。
- 対応差: Limited availabilityかつdesktop中心のため攻略必須経路と全箱必須報酬から外す。公開対象desktop Chromiumでdownload、user-scope install、再走査、permission persistence、raw Blob、再起動後、uninstall後、非対応browserを実PoCし、対象fontが返らない環境へuploadやwebfontの代替clearを作らない。
- 件数: 新規1stage・1箱を追加した後、D-135でS-680の1stage・1箱を外し、現在の計画値を78stage・185箱とする。
- 根拠: [Local Font Access API](https://developer.mozilla.org/en-US/docs/Web/API/Local_Font_Access_API)、[Local Font Access API WICG草案](https://wicg.github.io/local-font-access/)、[ChromeのLocal Font Access解説](https://developer.chrome.com/docs/capabilities/web-apis/local-fonts)。

### DR-136 呼び出しコマンド API

- 決定日: 2026-07-24
- 最終分類: 統合案
- 相談対象の元案: OSまたは外部actionのcommandを呼び出し、呼び出されたcommand種別が一致すると開く。「箱が外界の儀式を要求する」という演出と`navigation` eventを組み合わせる案だった。
- 調査結果: 現行Invoker Commands APIはOS外部commandやNavigation APIではなく、`<button commandfor>`から同一document内の対象要素へ`command`を宣言的に送る。対象側の`command` eventでは`CommandEvent.command`と、呼び出し元buttonを示す`CommandEvent.source`を観測できる。Popoverには`show-popover`、`hide-popover`、`toggle-popover`の組み込みcommandがある。
- 統合先の既存案: DR-041 Popover APIは、top layerにあるPopoverを正しい順番で開閉し、light dismissを含む状態列を揃える案である。この既存箱はInvoker Commands固有の呼び出し元識別を要求しない。
- 追加する新規案: DR-041へ別箱を1箱追加する。一つのPopoverに対して複数のbuttonを`commandfor`で結び、playerが正しい呼び出し元の順番でcommandを送った時だけ開く。判定には対象Popoverが受けた実`CommandEvent.source`と`command`を使い、button自身の`click`列、任意の`data-*`、scriptから直接呼んだ`showPopover()`だけでは開かない。
- DR-025との関係: Dialogの`show-modal`、`close`、`request-close`にもInvoker Commandsを利用できるが、DR-025で採用済みの×button、外側light dismiss、platform cancelという3種類の閉じ方から、playerに見える独立した中心操作を増やせない。Dialog側は任意の実装方法に留め、追加箱・成功条件・箱数へ含めない。
- 破棄する部分: OS／外部action連携、外部command種別、`navigation` event、外界の儀式という演出はAPIの実態と一致しないため採用しない。
- 対応差と操作性: `commandfor`、`command`、`CommandEvent.source`を実装する環境だけで追加箱を観測可能にする。pointerだけに限定せず、native buttonのclickとkeyboard activationを同等に扱う。非対応環境で通常のclick handlerから同じ成功列を模倣する代替clearは作らない。
- 件数: DR-041候補内の箱構成は元案に1箱を追加する。DR-041自体はまだstage IDと実装順を予約していないため、今回の決定では現在の正式計画値65stage・153箱を変更しない。
- 根拠: [HTML Standardのbutton command](https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-command)、[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)。

## 対話相談キュー

通常の対話相談対象は0件。DR-096はAPI固有性を残す継続保留として相談済みで、具体的案ができた時だけこのqueue外で再相談する。DR-137は端末固有font集合を答えにする元案を捨て、playerがGit管理済み専用fontをOSへ追加し、対象名だけをLocal Font Accessで再発見するG-078 / S-790へ採用した。その他の確定理由は各詳細節と[決定ログ](./decision-log.md)を正とする。

### 通常相談完了

安定ID順の`統合案`、`保留`、`却下候補`相談は2026-08-01に完了した。未相談案の実装は禁止する暫定gateを解除し、以後は確定案の仕様化、PoC、実装順を別計画で決める。

各相談では、(1) 元メモに書かれた操作手順・成功条件・UX演出、(2) 原案の中心動詞、(3) 現APIで実際に観測できること、(4) 現行ステージとの重複、(5) 統合時に原案から残す部分・変更する部分・統合先、(6) 採る場合の最小再設計、(7) 権限・privacy・cleanup、(8) 最終5分類、の順で決める。とくに`統合案`は元案の説明を省略せず、何が元案のままで何が統合による再設計かを分けて提示する。結論はこの台帳と[決定ログ](./decision-log.md)へ同時に反映する。

## API台帳との不整合メモ

現行`api-ledger.json`の自動分類はfamily名への正規表現一致であり、実コード利用の証拠ではない。今回の照合で少なくとも次の誤差を確認した。自動台帳の修正は、この元案整理とは別作業にする。

| API family | 現API台帳 | 実コード / この台帳 |
| --- | --- | --- |
| Channel Messaging API | stage | 実コード未使用。DR-089で新規`採用`候補 |
| Document Picture-in-Picture API | stage | S-350-B06はvideo PiPのみ。DR-058で新規`採用`候補 |
| File and Directory Entries API | stage | S-510は`DataTransfer.files`。DR-111で新規`採用`候補 |
| Federated Credential Management API | stage | S-380 / S-390はWebAuthnのみ。DR-127は新規G-076 / S-770へ`採用`済みだが未実装 |

この4件は「名前が既存matcherへ一致した」ことと「APIを使ったstageが存在する」ことを分ける必要がある。今後はfamily分類testに、実利用featureまたは明示的なmanual dispositionの根拠を要求する。
