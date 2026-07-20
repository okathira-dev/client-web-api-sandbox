# ステージ展開計画

> 実装完了記録（2026-07-20）: Wave 1〜6をコードへ反映し、S-380 / S-390を分離した60stage・97箱をcatalogueへ登録した。以下の「現在35stage」「未実装」「技術スパイク待ち」は着手前スナップショットとして残す。現在状態は[ステージ実装状況](./stage-implementation-status.md)と[検証記録](./verification-record.md)を正とする。S-190-B05だけは標準化された再現条件がなく不採用に確定した。

## 目的と正本の範囲

2026-07-18から2026-07-20に行ったBlackbox参考機構の相談結果、新規Web API案、既存35ステージの再設計を、実装可能な順序へまとめる。この文書は「何をどの順で実装するか」の正本とし、個々の成功条件は[ステージ実装状況](./stage-implementation-status.md)、判断履歴は[決定ログ](./decision-log.md)と[Blackbox機構監査](./blackbox-mechanism-ledger.md)を正とする。

この文書の下記スナップショットはコード実装を開始する前の記録である。実装済みの結果と混同しない。

## 2026-07-20スナップショット

| 対象 | 現在 | 合意済みの計画 |
| --- | ---: | ---: |
| 実装／計画ステージ | 35 | 60行 |
| 問題箱 | 42 | 97個を確定計画 |
| ギミック台帳 | G-001〜G-059 | 57採用、2取りやめ |
| Blackbox初期△／×の相談 | 29件 | 29/29完了 |

計画ステージ数は、S-380と仮S-390を別ページにした場合が60、同一ページへ統合した場合が59である。問題箱はどちらも5個なので総数は変わらない。S-190のnotification marker B05を実機PoC後に採用した場合だけ98個になる。

97個の内訳は次のとおり。

- 現在の42箱
- 既存ステージの確定変更による純増8箱: S-040 `+1`、S-180 `-1`、S-190 B01〜B04 `+3`、S-220 `+2`、S-240 `+1`、S-310 `+2`
- 新規S-350〜S-600の25ステージ、47箱

S-250は現行2箱をRGB三色タブと解放順の2箱へ再設計するため、総数は変わらない。これらは計画値であり、現在のコード上の35ステージ・42箱と混同しない。

## 相談結果の整理

初期評価が△だった28件と×だったBB-065の合計29件は、すべて一度相談を完了した。Web向け問題または既存ステージへの統合を22件で採用し、7件は新規問題を作らない判断とした。元機構を取りやめて独自問題だけを採用したBB-080は、採用側へ数えている。

残っているのは採否の相談漏れではなく、次の技術判断である。

| 対象 | 合意済み | PoCでだけ決めること |
| --- | --- | --- |
| S-190-B05 | notification画像を共有映像から読む案 | OS通知欄が共有対象へ入り、別種markerの実pixelを安定decodeできるか。成立しなければB05だけ作らない |
| S-380 / S-390 | passkey 3箱とrequest lifecycle 2箱は採用 | 同一ページ5箱か、3箱＋2箱の2ステージか |
| S-360 | backend、STUN/TURN、microphoneなしの同一origin WebRTC 2箱 | 2タブの手動／BroadcastChannel signalingと明示切断が、問題として分かる操作感になるか |
| S-410 / S-420 | 2種類の通知action列問題を採用 | `Notification.maxActions >= 2`、tag差替え、Service Worker再起動後の反復が対象環境で成立するか |
| S-510 | PWA windowから通常browser windowへのPNG File dragを採用 | `DataTransfer.files`が実window境界を越えて維持される環境範囲 |
| S-480 | 小・標準・大・特大の4箱を採用 | `<meta name="text-scale">`と`env(preferred-text-scale)`から安定して4帯を判定できる環境と閾値 |
| S-520〜S-600 | 各問題の中心APIと箱数を採用 | 実機noise、sampling rate、権限、値欠損を踏まえた閾値。成功条件を別APIへ置換しない |

`SpeechRecognition.processLocally`、`available()`、`install()`、Geolocationの`speed` / `heading`、`clipboardchange`はMDN全件監査へ残すが、今回の確定ステージへ混ぜない。これらは実装のブロッカーではない。

## 実装前に解消する基盤差分

| 基盤 | 現状 | 必要な変更 |
| --- | --- | --- |
| stage catalogue | 実装済み35ステージだけから`StageId`を導出 | 計画項目をruntime registryへ誤登録せず、実装単位で型・catalogue・lazy importを同時追加する |
| stage map | 単純なgrid/list | 決定的座標、branch、related / clue edge、pan / zoom、semantic DOMを持つmind mapへ移行する |
| round通信 | 各ステージ固有 | BroadcastChannel handshake、round nonce、期限、重複consumeを共通化する |
| PWA manifest | 基本installと`launch_handler`のみ | shortcuts、note_taking、share_target、file_handlers、protocol_handlers、`display_override`を一つの互換性監査で追加する |
| Service Worker | offline cacheとS-090通知復帰 | stage別tag/action router、IndexedDB inbox、通知差替え、version migrationを追加する |
| 実験API型 | TypeScript DOM型にあるAPIが中心 | Generic Sensor、LaunchQueueなど不足するIDLを狭い宣言とfeature probeで補う |
| privacy storage | 共通進捗だけ | S-590の開始anchorだけを最大24時間の`sessionStorage`例外として分離し、reset / expiry / 100m達成で削除する |

## 実装ウェーブ

### Wave 0: 台帳と実装契約

1. この計画、stage status、gimmick coverage、human testの件数と状態語を揃える。
2. MDN 147ファミリー・1,045インターフェースという2026-07-18スナップショットを再取得し、機械可読API台帳へ変換する。現在この完全台帳は未作成であり、固定件数を現行値として扱わない。
3. stage manifestとJSON Schemaを作り、stage ID、problem ID、Gimmick ID、API台帳、人手確認IDの未参照・重複をCIで失敗させる。
4. 計画ステージを実装済みとしてcatalogueへ先行登録しない。

完了条件は、現在の35ステージ・42箱を壊さず、計画と実装の件数を別々に自動集計できること。

### Wave 1: mind mapと横断ランタイム

1. [ステージMind Map設計](./stage-map-design.md)に従ってgridを置き換える。
2. `StageSpec`へ安定order、branch、related / clue edgeを追加する。
3. round nonce、BroadcastChannel handshake、one-time inbox、期限切れ、resetを共通化する。
4. PWA専用URLをquery parameterの直接訪問と区別して受け取るroute envelopeを定義する。
5. Generic Sensor lifecycleと実験APIの型宣言を、まだ個別stageを追加せず用意する。

mind mapはS-190-B04の盤面でもあるため、Screen Capture拡張より先に完成させる。

### Wave 2: 低リスクな既存再設計とCore追加

次を小さな単位で実装し、stage catalogue移行と再挑戦モデルを検証する。

1. S-040 B02、S-180 1箱化、S-220 B02/B03
2. S-250 RGB三色タブと解放順
3. S-350 native media controls 3箱
4. S-490 `busybox` input 1箱
5. S-500 Caesar copy override / paste / Selection 1箱
6. S-190-B02 local recording

各変更で既存の累積進捗を移行する。削除されるS-180-B02の達成記録を無言で別問題へ流用せず、progress schemaの移行方針を先に決める。

### Wave 3: 複数tab・画面・WebRTC

1. S-360を先に技術スパイクし、同一origin 2タブ間の接続・切断を確認する。
2. 成立した共通接続を使ってS-190-B03 live relayを実装する。
3. mind map外縁markerとround handshakeを使ってS-190-B04を実装する。
4. S-190-B05 notification markerは独立した実機PoCを行い、採否だけを記録する。
5. S-510 cross-window File dragをdesktop実機で試作する。

画面frame、録画Blob、生成音声、D&D画像は進捗・Driveへ保存しない。

### Wave 4: PWA起動面とService Worker

manifest関連はインストール時の関連付けと再インストールを伴うため、一つの互換性バッチとして扱う。

1. 共通のPWAインストール説明と、各OSでの再インストール／関連付け更新手順
2. S-240-B02 Share Target受信
3. S-310-B02 shortcut、S-310-B03 note taking
4. S-440 `.busybox` File Handling
5. S-450 `web+busybox:` Protocol Handler
6. S-460 Window Controls Overlay
7. S-410 / S-420 notification actionsとService Worker inbox
8. S-430 Media Session external pause

File Handlingは現時点で主にdesktop Chromiumのinstalled PWA、Window Controls Overlayもinstalled desktop PWAが対象となる。通知actionは実装上限が0の場合がある。いずれも代替clearやskipを設けず、feature probeと対象環境の人手証跡を完成条件にする。

### Wave 5: WebAuthnと時計

1. Busybox専用host名を確定し、他コンテンツとRP IDを共有しない静的配信を用意する。
2. S-380 / S-390の2variantを同じ実装部品でPoCし、ページ境界だけを決める。
3. passkeyが端末または同期providerへ残り得ること、Webページから完全削除を保証できないことを作成前に示す。
4. create、conditional get成功、保存済みcredentialの不成立、no-match、player起因`AbortSignal`を別eventとして記録する。
5. S-400は`performance.now()`系のmonotonic基準とwall clock差だけを一時保持し、document切断で試行を終える。

WebAuthnはゲーム内の強い認証を目的にせず、browser UIとcredential lifecycleを観測する。独自backendは追加しない。

### Wave 6: 端末・センサー・位置

依存する共通runtimeごとに実装する。

1. S-370 Battery Status
2. S-480 text scale専用document
3. S-520 Proximity、S-530 Linear Acceleration、S-540 Ambient Light
4. S-550 raw Accelerometer、S-560 Gyroscope、S-570 Relative Orientation
5. S-580 Speech Recognition
6. S-590 distance、S-600 altitude

S-480はページ全体のroot font sizeへ影響するため、通常のstage shellへmetaを常時追加せず、同一PWA scope内の専用documentで先に検証する。S-550は問題採用済みだが物理操作リスクが高いため、保護された試験環境で誤検知と閾値を確認し、投げる・落とす指示や演出を公開コピーへ入れない。S-590の開始anchor以外のsensor値、音声、transcript、位置、高度は保存・送信しない。

### Wave 7: API全件監査と公開判定

1. MDN / BCD / Web Featuresの固定スナップショットを生成し、未分類をCIエラーにする。
2. 採用、既存stageへ統合、Labs、保留、除外をfamily / interface / member単位で記録する。
3. 実装直前と公開前にLimited / Experimental APIの対応を再確認する。
4. iPhone / iPad Safari、Android Chrome、Windows / macOSの主要browser、通常tab / installed PWA、権限状態、機器なしを人手台帳へ記録する。
5. 参考作品の名称、文面、画像、音、配置、数値、解法順を流用していないことを独立レビューする。

## 優先依存関係

```text
machine-readable ledger ──> stage manifest / CI
mind map ─────────────────> S-190-B04
round protocol ───────────> S-190-B03/B04, S-240-B02, S-310, S-410/420, S-440/450
WebRTC spike ─────────────> S-360 ──> S-190-B03
manifest + install guide ─> S-240, S-310, S-440, S-450, S-460
Service Worker inbox ─────> S-410, S-420
dedicated RP hostname ────> S-380/S-390
Generic Sensor runtime ───> S-520〜S-570
Geolocation runtime ──────> S-590, S-600
```

## 共通完了条件

- 成功は対象APIの実event / reading / payloadからのみ導出する。
- 非対応、権限拒否、取消、機器なしに代替clear、skip、模擬入力を用意しない。
- 条件不成立はその問題を未観測のままにし、他ステージの利用を壊さない。
- stage離脱、再入場、reload、visibility変化でlistener、stream、track、sensor、lock、peer connectionを確実に解放する。
- 生のcamera、microphone、screen、sensor、clipboard、位置情報を進捗やDriveへ保存しない。明記されたS-590の短命anchorだけを例外とする。
- 一つのAPI名につき一問を量産せず、同じ中心操作は既存stageへ統合する。
- 自動test、型check、buildに加え、Limited / Experimental、PWA、権限、実機条件は人手証跡が揃うまで公開合格にしない。

## 2026-07-20公式情報の再確認

- [Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/)はconditional mediationの能力確認と`AbortSignal`による中断を定義する。Conditional requestはdocument lifetime中待機し得るため、S-380 / S-390は明示cleanupが必要。
- [Notifications Living Standard](https://notifications.spec.whatwg.org/)ではaction数は実装・platform依存で0以上であり、`image`も表示されない場合がある。S-410 / S-420とS-190-B05は実機PoCを外せない。
- [MDNのFile Handling解説](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Associate_files_with_your_PWA)ではinstalled PWA、manifestの`file_handlers`、`LaunchQueue`が必要で、現状はdesktop Chromium系に限定される。
- [Web App Manifest member一覧](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference)で、shortcuts、share_target、note_taking、file_handlers、protocol_handlers、launch_handler、display_overrideを別々のmemberとして再確認した。
- [`<meta name="text-scale">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/text-scale)は2026-07-20時点でExperimental / Limitedであり、最大200〜300%超の設定でもlayoutを壊さない検証が必要。
- [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)はSecure Context限定かつLimited availabilityで、`chargingchange`と`levelchange`を提供する。
