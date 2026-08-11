# 現環境確認分の一括実装計画（履歴）

> この文書はD-137時点の実行計画を保存した非規範スナップショットである。D-138以後の箱統合、D-140のS-350 / S-810分離、D-141のS-270 / Media Capabilities profile箱不採用、D-143のS-230からS-350-B06へのPiP統合、D-144のS-350 fullscreen・S-640共通欄・S-710 iframe・S-720 patch bay、現行件数は反映しない。本文のS-230、S-270、旧S-350箱、旧media stage UIは現行計画へ使わない。現在の箱IDと解法は[現行ステージ解法仕様](./stage-walkthroughs.md)、実装件数は[ステージ実装状況](./stage-implementation-status.md)を正とする。

> 決定日: 2026-08-09。PoCを完全な直列gateにはせず、現在のWindows / Chrome環境でAPIまたは中心経路を確認できた範囲を製品stageへ実装し、実stage上の確認でPARTIALを箱単位に減らす。未観測のbrowser eventをmockで成功扱いしない。

## 1. 到達点

- 現行コード: 60stage・97箱。
- 今回追加: 新規8stage、既存stageへの60箱追加、S-270-B01の全面置換、S-020-B01の表示改善。
- 今回完了時のコード: 68stage・156箱。
- 全採用計画: 79stage・187箱。
- 今回実装しない30箱は、API非対応、外部環境待ち、または問題相談待ちとして台帳に残す。

今回の「実装済み」は、観測、判定、演出、進捗、reset、cleanup、自動testが製品コードに入ったことを意味する。公開合格は意味せず、実APIで未観測の状態は人手確認待ちのままにする。

## 2. 実装境界

### 2.1 今回実装する

| Stage | 箱 | 実装内容 | 現環境で確定する範囲 |
| --- | --- | --- | --- |
| S-020 | 既存B01 | 現在のviewport幅と目標帯をnative `<meter>`へ表示する | meterは表示だけで、resize成功条件を変えない |
| S-030 | B02 | 離れた3箇所の`Range`を一つのCSS Custom Highlightへ登録する | registry、Range構成、再挑戦時のclear |
| S-060 | B02 | offline Beacon郵便を製品Service Workerとreceiverへ統合する | POST、worker receipt、full-document navigation、consume |
| S-150 | B02 / B03 | 不可視箱focusと`details[name]`排他開閉 | native focus / toggleだけを判定する |
| S-220 | B04 | Navigation APIのA→B→C→Back→D branch破棄 | `dispose`、`canGoForward === false`、連打防止 |
| S-270 | 既存B01置換 | 不可視compute検索を大量光粒子のWebGPU誘導盤面へ置換する | 安全な粒子数gate、実描画、停止、device loss |
| S-350 | B04〜B07 | Media Capabilities、frame cadence、native寸法、字幕track | Git管理fixtureと実media値の一致 |
| S-510 | B02 | sandboxed cross-origin相当iframeから画像をdrag & dropして合成する | 実DragEvent、許可payload、hash、3枚の合成 |
| S-580 | B02 | 位置shiftした文字列を一文字ずつSpeechSynthesisで発話する | 実`SpeechSynthesisUtterance`完了、cancel、離脱cleanup |
| S-610 | B01〜B03 | ×button、native light dismiss、platform cancelの3経路 | `close` / `cancel` / `returnValue`の分離 |
| S-620 | B01〜B17 | Unicode数字17問 | 固定fixture、self-host font、ASCII十進回答 |
| S-640 | B01〜B12 | 2進4問、16進4問、文字化け4問 | 固定byte、全decoder表、一意解、文字列回答 |
| S-650 | B01〜B04 | geolocation / notifications / camera / microphoneのPermissionStatus | 現環境で得られる実stateとchange。未観測stateは保留 |
| S-660 | B01〜B04 | CPUのnominal / fair / serious / critical | nominalとdisconnectを再確認。他stateは実通知待ち |
| S-670 | B01 | Consoleをread-only表示に使うASCII迷路 | page操作、plain text再描画、reset、Console入力なし |
| S-710 | B01〜B04 | 10秒上限の動画変換・圧縮tool | frame変換、decode失敗経路、metadata、download、size比 |
| S-720 | B01〜B04 | T1 / T2 / T3による動画復元とQR読取変換 | Git管理asset、4 route、frame一致、alpha / beta復元 |

### 2.2 今回実装しない

| 理由 | 対象 |
| --- | --- |
| 現browserでAPI非対応 | S-030-B03、S-350-B08、S-430-B02、S-480-B05〜B09、S-630、S-760、S-790 |
| 外部機器・公開環境・account待ち | S-700、S-730、S-740、S-750、S-770、S-780 |
| 問題内容または統合先の相談待ち | S-690、S-800、DR-041 Invoker Commands |
| 不採用 | S-680 |

非対応箱のためにclick handler、独自picker、synthetic event、固定flagだけの代替経路を作らない。既存stageに未対応箱が残る場合、stage全体を隠さず、その箱の操作領域だけに能力不足を表示する。

## 3. 共通実装方針

### 3.1 catalogueとprogress

- `domain/stages.ts`へ新規S-610、S-620、S-640、S-650、S-660、S-670、S-710、S-720と既存stageの追加problem IDを登録する。
- `runtime/stageDefinitions.ts`へ新規8stageのlazy importと、stageを開始できる最小共通能力だけを判定するprobeを追加する。
- 一部の箱だけが追加APIを必要とするstageでは、stage-level probeで既存箱まで隠さない。箱固有の能力判定はstage component内で行う。
- `data/stageManifest.ts`、JSON schema、API ledger、map、件数testを68stage・156箱へ同期する。
- 既存problem ID、保存済みprogress、stage URLを変更しない。追加箱はgrow-only mergeで自然に未解決として現れる。

### 3.2 fixtureとasset

- 製品stageは検証済みfixtureの境界を通して参照する。Unicode / encodingは`src/busybox/fixtures/**`のproduct facade、media / videoも同じ製品fixture領域を正本として使う。
- Unicode font、encoding bytes、media、video recovery assetはlicense、生成script、manifest、codec / 寸法 / 内容などの意味検証を維持する。
- runtime生成が本質でない動画、QR、font、問題byteは事前生成してGit管理する。
- S-710だけはplayer入力の変換が本質なのでruntime処理する。MediaBunnyを使った初版変換を置き、decode失敗用入力動画、QR sample、metadata再入力fixtureはGit管理する。

### 3.3 状態機械とcleanup

- API eventを直接JSX内で積み上げず、判定可能な小さな純粋関数またはreducerへ分離する。
- `ProblemHandle.solve()`へ渡すfactsは非機密な成功根拠だけにし、permission履歴、frame、入力動画、音声、Console操作列を保存しない。
- `props.signal`、effect cleanup、明示resetの三経路でlistener、worker、track、reader、GPU buffer、object URL、speech queueを解放する。
- 同じeventの重複、古いattempt、離脱後callback、Strict Modeのeffect再実行で箱が誤って開かないtestを置く。

### 3.4 対応差の表示

- 能力不足は未観測であり、失敗や解決済みにしない。
- permission要求、media再生、GPU開始、downloadなどの副作用は明示buttonからだけ開始する。
- current browserで一部だけ確認できるS-650 / S-660は、実装後も箱単位の確認状態を文書へ残す。観測していないstateをtest doubleだけでPASSへ昇格しない。

## 4. 実装wave

各waveは、対象コード、自動test、現環境の手動確認、台帳更新までを一つの完了単位にする。途中waveで全体を壊さないよう、catalogue・component・registration・manifest・testを同じwave内で揃える。

### Wave 0: 共通契約とfixture昇格

1. fixtureの製品配置、生成script、codec / 寸法 / 内容などの意味検査を決める。
2. experimental API型を`experimental-web-apis.d.ts`へ集約し、stage file内の大きな独自型を減らす。
3. 箱固有の能力不足表示と、固定回答fieldの共通部品が本当に共通化できる範囲を決める。
4. 最終件数68stage・156箱をregistry testの到達値として設定する。ただし新規stage定義は対応componentと同じwaveで追加する。

完了条件: fixture testがPoC配置に依存せず合格し、既存60stage・97箱の挙動が変わらない。

### Wave 1: DOM・Navigation・音声・Console

対象: S-020、S-030-B02、S-150-B02/B03、S-220-B04、S-580-B02、S-610、S-670。

- S-030は三つのRangeをDOM wrapper追加なしで作り、一つの`Highlight`へ登録する。
- S-150-B02は視覚上の箱配置を変えずfocusを受けた実要素で開く。B03はnative `toggle`後の排他stateで開く。
- S-220-B04はNavigation entry keyの固定列と`dispose`集合をattempt内だけで管理する。
- S-580-B02は`aspuwiq`相当の変換後文字列を画面へ出さず、一文字ずつqueueして全utterance正常終了で開く。
- S-610は三つの閉じ方を別dialogまたはattempt reset可能な列として分離する。
- S-670はConsoleへ盤面を直接`console.info()`し、page側の四方向buttonだけで移動する。

完了条件: reducer / DOM test、keyboard test、PoCで確認したevent列との一致、全listenerとspeech queueのcleanup。

### Wave 2: 固定文字fixture

対象: S-620、S-640。

- S-620は17問をdata駆動で描画し、17個の個別入力欄または現在選択中の箱に対応する回答欄を、総当たりを助長しない一貫したUIにする。
- S-640は問題表示、回答文字列、正答labelをfixtureから導出し、runtimeにはlegacy encoderを入れない。
- Unicode fontは`font-display`完了後に問題を有効化し、load失敗で開かない。
- 回答はNFC等へ勝手に正規化せず、仕様で決めたspaceとcode pointの完全一致にする。

完了条件: 29回答の非重複、全fixtureの形式・内容検証、全parser / formatter round-trip、font `cmap`、表示・copyの人手確認。

### Wave 3: Service Worker郵便

対象: S-060-B02。

- 製品`service-worker.js`へattempt付きBeacon POST、IndexedDB receipt commit、one-shot read / consumeを統合する。
- senderはcurrent attemptを作って`sendBeacon()`した後、同一scopeのreceiverへfull-document navigationする。
- receiverはworker制御を待ち、nonce一致receiptだけを消費して固定flagを示す。senderへ戻ってflagを提出する経路またはreceiverからの進捗反映方法をstage仕様どおり一つに固定する。
- development workerはVite assetをcacheしない既存方針を維持する。

完了条件: worker VM test、wrong / stale / duplicate nonce、未制御、online、Vite停止中、reset、DB cleanupが合格する。

### Wave 4: media fixtureと動画pipeline

対象: S-350-B04〜B07、S-710、S-720。

1. Media fixtureを製品assetへ昇格し、S-350の4箱を先に実装する。
2. S-710は製品依存のMediaBunny `Conversion`でdemux、frame process、encode、WebM metadata、object URL cleanupを一つのstageへ閉じ込める。入力を保存・送信する共通moduleは作らない。
3. S-710を10秒、640×360、15fps、384kbpsの低い固定bitrateで実装する。B02の固定1-frame outputは生成環境を確保した次のmedia waveでassetへ置き換え、現環境ではruntime fallbackを使用する。
4. S-720はGit管理済みassetをHTMLVideoElement + canvas seekで読み、T1 / T2 / T3をrouteごとに連結する初版を製品側へ移す。WebCodecs demux / muxとQR decoderは追加波で再評価する。

S-710の箱別条件:

- B01: 全pixelが各channel `0x00..0x10`のfull-resolution frameだけを、白文字の固定flag frameへ差し替える。
- B02: input decode不能時だけ、Git管理する1-frame flag動画を返す。通常frame処理へ偽装しない。
- B03: downscaled frameでQRを検出したframeだけを、固定flag textのQR frameへ差し替える。
- B04: Busybox生成metadataの実照合後、全frameへ固定flagをoverlayする。filenameやMIMEだけでは開かない。

S-710 / S-720共通で、入力fileを保存・送信せず、download用object URLをreset / 離脱時にrevokeする。S-710 B03はBarcode Detection APIが存在する場合だけ試行し、S-720はQR decoderを必須にしない。S-700のBarcode Detection必須条件とは混同しない。

完了条件: frame数、timestamp、寸法、binary matrix、metadata、出力size / 入力比、再生、download、連続実行、cancel、reader / worker / track cleanupを自動testと実browserで確認する。

### Wave 5: PermissionStatusとCompute Pressure

対象: S-650、S-660。

- S-650は4 descriptorを個別にqueryし、明示buttonからだけ実permission requestを行う。geolocation値は破棄し、notificationは送らず、camera / microphone trackは取得直後に停止する。
- 初期state、`change`、window focus時の再照会を同じreducerへ入力し、対象descriptorが実`granted`になった箱だけを開く。
- S-660は一つの`PressureObserver`でCPUの4 stateを観測し、`fair`と`serious`は中間状態の一箱へ累積する。game自身はworker、busy loop、benchmarkを開始しない。
- observerはhidden、reset、離脱でdisconnectし、recordや時刻を保存しない。

完了条件: 現環境の4 permission表示と実state、camera / microphone stop、CPU nominal、disconnectを再確認する。未観測のpermission変化とfair / serious / criticalは人手確認待ちとして残す。

### Wave 6: cross-origin境界とWebGPU

対象: S-510-B02、S-270-B01置換。

- S-510-B02は`iframe sandbox`でsame-origin権限を与えないdocumentをsourceにし、透明PNG 3枚を個別にdrag可能にする。parentはtrusted drop、許可MIME、`File` bytesまたはallowlist済み`text/uri-list`、SHA-256、current attemptを確認して合成する。
- script生成`DragEvent`、parent内画像、古いattempt、同じ画像3回では開かない。iframeとparentのURL構成はGitHub Pagesの静的配信で成立させる。
- S-270は明示開始後にadapter / deviceを取得し、小規模probeから粒子数を段階的に増やす。上限4096粒子、同期readbackなし、CPU simulation fallbackなしとする。
- GPUは粒子更新と描画を担当し、playerはpage上の磁石／レンズ操作で複数受光器へ光を導く。成功値のreadbackは低頻度・boundedにし、frame間隔悪化、hidden、abort、device lossで新規submitを止める。

完了条件: cross-origin相当の実drag、payload negative case、GPU安全gate、実盤面の理解可能性、device loss、buffer / device破棄、CPU fallback不在を確認する。

## 5. ファイル配置案

```text
src/busybox/
  fixtures/
    encoding/
    media/
    unicode/
    video-recovery/
  stages/
    shared/
      capability.ts
      mediaPipeline.ts
      videoTransforms.ts
    S-610.tsx
    S-620.tsx
    S-640.tsx
    S-650.tsx
    S-660.tsx
    S-670.tsx
    S-710.tsx
    S-720.tsx
  workers/
    video-transform.worker.ts
src/public/busybox/
  assets/
  service-worker.js
  offline-beacon-receiver.html
```

これは責務の目安であり、1stageからしか使わない処理を早期にsharedへ移さない。PoCの大きな単一`main.ts`を製品へコピーせず、fixture、純粋判定、resource ownerを分離する。

現環境の初版では、S-710はこの配置案のworkerをまだ作らずstage内のMediaBunnyを使用し、S-720もshared workerではなくcanvas初版を使用する。上記はWebCodecs / workerへ進める次のmedia waveの配置候補である。

## 6. テスト計画

### 6.1 各wave共通

1. 新しい判定関数のunit test。
2. problem ID、stage count、box count、manifest、map位置の整合test。
3. unsupported、cancel、duplicate、stale、reset、unmount後callbackのnegative test。
4. 対象stageを`?stage=S-xxx`で開く実browser確認。
5. replay時に永続済み箱が閉箱へ戻り、今回再達成した箱だけ開くことを確認する。

### 6.2 自動コマンド

各waveで対象testを先に実行し、wave終了時に次を通す。

```powershell
npm run check
npm test -- --runInBand
npm run build
git diff --check
```

Media waveではfixture生成checkとcodec / 寸法 / 内容などの意味検証、Service Worker waveではworker VM testも必須とする。自動修正commandは変更範囲を確認してから使い、ユーザーの既存差分を巻き込まない。

### 6.3 現環境での最終一括確認

- 追加60箱がmap、stage header、progressへ重複なく現れる。
- S-610、S-620、S-640、S-670、S-710、S-720を一つずつ最後まで解ける。
- S-650は現在の4 permission state、S-660はnominalを実表示し、観測済み条件だけが開く。
- S-270は安全gateを通過した場合だけ盤面が開始し、停止後にGPU submitが継続しない。
- S-510はiframe sourceからの実dragだけを受ける。
- S-060はonlineと開発server停止中の両方でreceiptを消費できる。
- reload、Back、stage離脱、reset、連続二回実行後に古いresourceやreceiptが残らない。

## 7. 状態更新と停止条件

各wave完了時に次を更新する。

- `stage-implementation-status.md`: 箱単位で「実装済み・現環境確認済み」「実装済み・人手確認待ち」を分離する。
- `poc-results.md`: 製品実装で新しく得た肯定／否定証拠を追記する。PoCページだけの結果を消さない。
- `human-test-matrix.md`: 外部機器、別browser、未観測stateだけを残す。
- `verification-record.md`: command、browser、確認stage、未確認事項を記録する。

次の場合は該当箱だけを止め、別APIやgame製UIへ迂回せず再相談する。

- 仕様上必要なbrowser eventを製品実装でも観測できない。
- GitHub Pagesの静的配信またはService Worker scopeで中心経路が成立しない。
- media処理が10秒入力、bounded queue、cleanup、低負荷の条件を守れない。
- WebGPUの安全gateを満たす粒子数では、playerが並列描画の体験を認識できない。
- native UIをcustom UIへ置換しなければ解けない。

## 8. 実装順の完了判定

Wave 0〜6を順番に完了し、68stage・156箱のregistry / manifest / buildが一致し、現環境最終一括確認を記録できた時点で今回の一括実装を完了とする。79stage・187箱への残りは別batchであり、今回の完了条件へ混ぜない。
