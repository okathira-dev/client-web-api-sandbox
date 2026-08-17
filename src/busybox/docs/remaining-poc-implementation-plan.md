# 残存PoC実装計画

> 基準日: 2026-08-16  
> 対象: 現行仕様で承認済みだが、PoCのコードまたは実環境での肯定証拠が揃っていないもの  
> 正本: 箱の仕様は[ステージ実装状況](./stage-implementation-status.md)、実行入口は[最新PoC索引](./poc-latest.md)、証拠は[PoC実施記録](./poc-results.md)を正とする。

## 目的

残っているPoCを、製品stageへ試作コードを流用せず、API固有のbrowser／OS所有挙動を確認できる隔離実装として完成させる。feature detection、synthetic event、game製の代替UI、debug発火だけではPASSにしない。

この計画では次の三状態を分ける。

- **実装待ち**: PoCの操作画面、fixture、判定、cleanupがまだない。
- **実行待ち**: PoCコードはあるが、対応browser、端末、外部機器、公開HTTPS、accountなどがなく肯定証拠を取れていない。
- **仕様待ち**: 技術経路はPoC済みだが、問題文や謎の内容を確定しないと製品判断できない。

実装済みstageの一般的な回帰確認は[人手確認台帳](./human-test-matrix.md)で扱い、新しいPoCへ重複させない。

## 全件判定

| 対象 | PoC | 現在 | この計画で行うこと | 完了判定 |
| --- | --- | --- | --- | --- |
| S-430-B02 Audio Session | **POC-033を新設** | 実行待ち | 隔離PoCとcleanupを実装済み | 実interruptionと再生復帰を観測 |
| S-480-B05〜B09 User Preferences | POC-008 | 実行待ち | module化、証拠欄とcleanupを実装済み | 5 preferenceのoverride／clearを対応browserで確認 |
| S-510 cross-window／cross-origin DnD | POC-009 | 再実行待ち | custom divは禁止cursorで失敗。browser標準のnative image sourceへ切替済み | native imageの実DataTransferを境界越しに受領 |
| S-630 Network Information | POC-012 | 実行待ち | `connection.type`専用PoCを実装済み | 実端末で各公開値を明示観測 |
| S-690 Text Fragment巡回 | POC-018 | 仕様待ち | 回帰計測を補強し、謎確定後に最終fixture化 | 巡回、Back、reloadが成立し、問題内容が承認済み |
| S-700-B01/B02 Remote Playback／QR | POC-019 | 実行待ち | round動画、外部再生、実BarcodeDetector読取を実装済み | receiver接続とcurrent round読取を実機確認 |
| S-700-B03 Presentation | POC-020 | **PASS** | controller／receiver／round ready handshakeを外部画面で実確認済み | 完了 |
| S-730 WebXR | POC-023 | 実行待ち | immersive sessionとselect-ray hitだけの最小sceneを実装済み | 実機poseと実input sourceの交差を確認 |
| S-740 Periodic Background Sync | POC-024 | 実行待ち | PWA、worker、care store、asset遷移、長期証跡を実装済み | client 0件の異なる実scheduler eventを二回観測 |
| S-750 WebOTP／OTP AutoFill | POC-025 | 実行待ち | WebOTP経路とOS AutoFill経路の比較入口を実装済み | 手入力等を除外し、少なくとも一つのOTP専用経路を実確認 |
| S-760 Contact Picker | POC-026 | 実行待ち | 架空contact完全共有とproperty非共有を分離して実装済み | Android実機でB01／B02を実確認 |
| S-770 FedCM | POC-027 | PoC再実行待ち | provider欠損を修正し、登録不要のMockFedCMをPoC専用に設定。通常OAuthへ迂回しない | browser所有chooserとFedCM固有resultを架空test accountで確認 |
| S-780 Payment Handler | POC-028 | **local PoC完了** | Vite middlewareでmethod URLの`Link` headerを返し、manifest、handler SW、decoy、handler window、承認・拒否・retryの3箱stage試作を実装済み。handler windowの選択は経路に固定しない。 | 完了。公開時のheader供給元だけ別途確定 |
| S-790 Local Font Access | POC-029 | 実行待ち | module化、専用OTF導線とdeny／revoke証拠を実装済み | OS installした対象fontのraw dataとglyphを確認 |
| S-800 Text Fragment組み立て | POC-032 | 仕様待ち・実行待ち | 負例と履歴回帰を補強し、英文問題を確定する | B01／B02の貼付、UA highlight、beforematchを確認 |
| S-350 将来B07 native音声track | **POC-034監視枠** | API対応待ち | `audioTracks`を読む監視枠を実装済み。公開browserが現れた時だけ再PoC | native UI変更とAudioTrackList eventを実確認 |

旧POC-007は削除済みAudio Session試作の履歴であり再利用しない。POC-033は、現行S-430-B02の成功条件に合わせて新設する。旧POC-006の音声track fixtureはPOC-034で再利用可能だが、custom pickerによる迂回は作らない。

## 新しいPoCを作らない対象

網羅性を保つため、台帳上にPARTIALや人手待ちが残っていても、今回のPoC実装へ含めないものを明示する。

| 区分 | 対象 | 扱い |
| --- | --- | --- |
| 製品stageでの回帰確認 | POC-001〜004、010、014〜016、021、022、030、031に対応する現行stage | 中心経路のPoCコードはある。残りは製品stageの人手確認台帳で実施し、同じ試作を増やさない |
| 固定fixtureの検証完了 | POC-011、013、S-810固定asset | 自動testと製品stageの人手確認を使う。新しい隔離PoCは作らない |
| 却下済み | POC-005／S-270、POC-017／S-680 | 再実装しない |
| 旧設計へ置換済み | POC-006のMedia Capabilities、VFR、解像度reel、旧POC-007 | 現行仕様の判断へ戻さない。音声trackだけPOC-034の監視枠に限定する |

POC-021／022の実施記録に残るPARTIALは、製品S-710／S-720へ昇格後の実ブラウザ回帰項目である。PoCの再実装ではなくH-042／H-043で閉じる。

## Wave 0: PoC基盤の分離

最初に、52KBを超える`poc/main.ts`へ新規処理を足さずに済む最小基盤を作る。

### ファイル構成

```text
src/busybox/poc/
  main.ts                       # shell初期化とlegacy PoCだけ
  registry.ts                   # case metadataとlazy import
  contracts.ts                  # status／evidence／cleanup契約
  cases/
    poc-009-dnd.ts
    poc-012-network.ts
    poc-019-remote.ts
    poc-020-presentation.ts
    poc-023-xr.ts
    poc-024-periodic-sync.ts
    poc-025-otp.ts
    poc-026-contact.ts
    poc-027-fedcm.ts
    poc-028-payment-handler.ts
    poc-033-audio-session.ts
    poc-034-audio-track.ts
```

- `<details>`が初めて開いた時に該当moduleだけをdynamic importする。
- 一件のmoduleは`mount(root)`と`dispose()`を持つ。再度開閉してもlistener、media track、XR session、worker registrationが重複しない。
- 専用top-level documentが必要なText Fragment、User Preferences、Presentation receiver、Payment Handlerは、case moduleから独立HTMLへ遷移・起動する。
- 既存PoCを一括書き換えず、まずPOC-008／018／029／032を移してregistry契約を固め、その後の新規PoCはすべてcase moduleで追加する。

### 共通表示契約

各PoCに次を必須化する。

1. 前提環境と、現在不足している前提
2. playerが行う操作手順
3. PASSに必要な肯定証拠
4. 誤ってPASSさせないnegative case
5. 権限、登録、接続、保存データのcleanup
6. `NOT_RUN`／`PARTIAL`／`PASS`／`FAIL`／`UNSUPPORTED`の表示
7. browser、OS、実行日時、観測event列を貼り付けられる記録欄

`UNSUPPORTED`は能力不足の記録でありPASSではない。debug buttonは配線確認専用と明記し、公開受入証拠や製品stageの開箱条件へ流用しない。

## Wave 1: 既存PoCの完成

### POC-008 S-480 User Preferences

- 既存の専用documentをcase moduleへ接続し、5種類を一件ずつ実行・clearできるようにする。
- `requestOverride()`成功だけでなく、対応する`matchMedia()`の実効値変化を同じ行へ記録する。
- override中の`change`、個別clear、全clear、離脱時clear、拒否／取消／非対応を記録する。
- 5種類を一括成功扱いにせず、API memberごとに結果を残す。

### POC-018 S-690 Text Fragment巡回

- 現在の巡回fixtureへ、現在地、history長、Back、reload後の位置を人が比較できる表示だけを追加する。
- scroll位置やIntersectionObserverを成功判定にしない。UA highlightがscriptから読めない部分は人手証拠として残す。
- 謎本体は別工程で相談して確定し、承認前の語やリンクgraphを製品fixtureへ昇格しない。

### POC-029 S-790 Local Font Access

- 専用OTFのPostScript名、期待SHA-256、専用glyph列をfixture契約として固定する。
- OS user install後に対象PostScript名一件だけを照会し、`FontData.blob()`のdigestとBlob由来`FontFace`のglyphを照合する。
- permission deny／cancel、font未install、誤font、revoke、uninstall後をnegative caseにする。
- font binary、OFL、生成・検証手順はGit管理する。全font列挙やfile uploadは作らない。

### POC-032 S-800 Text Fragment組み立て

- B01のpunctuation context方式とB02の先頭空白＋suffix方式を別fixtureとして保持する。
- 正しいURL貼付、`beforematch`、UA highlight、Back、reload、対象外fragment、find-in-pageを記録する。
- 通常anchor、自作highlight、page内入力欄を代替経路にしない。
- 長文、対象語、表示fragmentは問題レビュー後に固定する。

## Wave 2: browser／OS入力

### POC-033 S-430-B02 Audio Session

- 生成loop音声を明示操作で再生し、Audio Session typeを設定する。
- `active → interrupted → active`と、同じmedia elementがplayingへ復帰した時刻列を記録する。
- 通常pause、Media Session `pause` action、page自身の停止、`inactive`だけでは成功にしない。
- 別app／通話／system audio focusで実interruptionを起こす。ゲームはinterruptionを合成しない。
- 停止時に音声、listener、session typeを復元し、再実行時の残留状態を確認する。

### POC-009 S-510 cross-window／cross-origin DnD

- source window、same-origin target、別origin iframe targetの三面を用意する。
- 開発時は別localhost port、公開時は設定された静的な第二originを使い、backendは置かない。
- `File`と`text/uri-list`を実dragから読み、current round、MIME、URL、SHA-256を照合する。
- synthetic `DragEvent`、同一document内drag、download→file input、stale roundでは成功にしない。
- PWA install有無とwindow境界の差を同じ表に残す。

### POC-012 S-630 Network Information

- 明示「現在の接続を観測」操作時だけ`navigator.connection.type`を記録する。
- `wifi`、`cellular`、`ethernet`、`bluetooth`を別結果として累積し、初期表示や`change`だけでは成功にしない。
- `effectiveType`、RTT、downlink、Save Data、online/offline、UA、通信速度からの推定を禁止する。
- Android／ChromeOS実機で、接続切替後に値が公開されるか、値が欠損／unknownかも証拠に残す。

### POC-025 S-750 WebOTP／OTP AutoFill

- current codeとorigin-bound SMS文面を実行ごとに生成し、空の`autocomplete="one-time-code"`欄を用意する。
- Chromium WebOTPは実`OTPCredential`取得とcode一致を肯定証拠にする。
- OS AutoFillは、空欄からの一括入力、trusted入力、current code、実`:autofill`状態など、その環境で取得できる強い証拠の組を記録する。
- 手入力、paste、drop、composition、script代入、event列だけの推定では成功にしない。
- AutoFillと手入力を堅牢に区別できない環境では、その経路をFAILではなく未採用のまま残す。

### POC-026 S-760 Contact Picker

- PoC画面に架空名刺のname／email／tel／address／iconを表示し、OS側へ一件だけ登録してもらう。
- B01相当は5propertyを要求して一件選択し、全値を正規化してfixtureと照合する。
- B02相当はB01後、同じ一件を選びながら要求した5propertyがすべて空または欠損で返るnative操作が可能かを確認する。
- game製picker、manual form、共有拒否の理由推定、空contactの捏造を成功にしない。
- 取得値は画面上の一時比較だけに使い、保存・同期・外部送信しない。

## Wave 3: 外部表示とXR

### POC-019 S-700-B01／B02 Remote PlaybackとQR

- round付き固定動画をGit管理し、B01用の短い文字鍵とB02用のround QRを異なる区間へ入れる。
- `RemotePlayback`のpicker、`connecting`、`connected`、`disconnected`を記録する。
- B01は外部画面で読んだ文字鍵を手元へ入力し、current roundと一致したことを確認する。
- B02は手元cameraの実frameを`BarcodeDetector({ formats: ["qr_code"] })`で読み、current roundだけを受理する。
- local再生、PiP、接続前、固定QR、JS decoder、手入力だけではB02を成功にしない。
- camera track、remote connection、動画frame、機器名を終了時に破棄する。

### POC-020 S-700-B03 Presentation

- controllerとsame-origin receiverを別entryで作り、roundをPresentation URLへ含める。
- 明示操作から`PresentationRequest.start()`を呼び、実connectionが`connected`になった後だけreceiverを初期化する。
- receiverは最初の描画完了後、connection経由でround付き`ready`を返す。
- 通常window、local iframe、画面ミラーリング、Remote Playback、模擬messageでは成功にしない。
- picker取消、receiver load失敗、wrong round、close、terminate、再入場を確認する。

### POC-023 S-730 WebXR

- `immersive-vr`または`immersive-ar`を明示操作で開始し、最初の非null viewer poseをB01相当の証拠にする。
- 固定位置に一箱だけ描画し、実`XRInputSource`のselect rayと箱の交差をB02相当の証拠にする。
- inline session、page click、DOM overlay、mouse、模擬poseを成功にしない。
- sceneを最小限にし、歩行、room scan、高負荷表現を要求しない。終了時にsessionとrender resourceを破棄する。

## Wave 4: installed PWA／Service Worker

POC-024とPOC-028はworker scope、manifest、storageが干渉しないよう、別directoryと別registration scopeを使う。

### POC-024 S-740 Periodic Background Sync

- install可能な専用manifest、worker、IndexedDB care store、Cache Storage assetを用意する。
- 水と光は別訪問で一度ずつ預け、phase、care種別、実event識別子だけを保存する。
- window clientが0件の異なる二回の実`periodicsync`で、発芽asset取得、開花asset取得へ進める。
- DevTools／test用debug発火はworker配線確認専用の別欄にし、PASSへ加算しない。
- foreground event、page load、timer、日付変更、通常Background Sync、通知では成長させない。
- permission、registration、active tag、unregister、site data削除、browser／OS停止条件を記録する。

### POC-028 S-780 Payment Handler

- 技術検証とstage試作を分ける。技術検証はVite middlewareでmethod URLに`Link: <...>; rel="payment-method-manifest"`を返し、PoCページのHEAD照会で証跡を残す。stage試作はmerchant、payment method manifest、payment app manifest、handler Service Worker、handler windowを分離して配置する。
- GitHub Pagesの静的配信だけでは任意のmethod URL response headerを追加できないため、公開時はheaderを供給できるorigin／proxyの採用判断を残す。local PoCをこの制約のためにBLOCKED扱いにはしない。
- trusted `PaymentRequestEvent`は経路の証跡として記録するが、単独の箱にはしない。
- B01相当はhandler承認後のresponseとmerchant側`complete("success")`を記録する。
- B02相当は固定の意図的拒否responseと`complete("fail")`を記録する。
- B03相当は同一handlerの最初のresponse後に実`retry()`を行い、二度目の成功を記録する。
- handler windowのApprove／Decline／retry選択をmerchant側の開始ボタンで固定せず、返ったresponseに対応する箱を開く。
- `canMakePayment()`、game製sheet、cancel、例外、wrong handler、最初から成功したretry経路を成功にしない。
- 架空通貨だけを使い、payer／shipping／credentialを要求・保存・送信しない。

## Wave 5: 外部provider

### POC-027 S-770 FedCM

コードを書く直前に、公式資料だけを使ってproviderを再監査する。

1. provider自身がFedCM対応を公式に明記している。
2. 一般のRPがclient登録できる。
3. Busybox側で独自IdP backendを運用しなくてよい。
4. OAuth redirectや通常SDK loginではなく、FedCMを通ったことを確認できる。
5. テストaccountとpublic HTTPS originで再現可能である。

全条件を満たしたproviderだけを一件ずつcase化する。Google一件を下限候補とするが、調査時点で条件を満たさなければ架空providerや自作IdPで埋めない。追加provider数は調査結果で決める。

- provider別の明示開始、browser所有account chooser、取消、再認証、無accountを記録する。
- tokenやaccount属性は成功判定後に破棄し、game save、Drive同期、logへ入れない。
- client ID等の公開設定とsecretを分け、secretはrepositoryへ置かない。

## 監視枠: POC-034 S-350 native音声track

現在の製品仕様は保留を正とし、通常Waveでは実装しない。対象browserが`HTMLMediaElement.audioTracks`とnative音声track UIを公開した時に、既存の3音声MP4 fixtureを使って次だけを再確認する。

- playerがnative UIからBusybox trackを選べる。
- 対応`AudioTrackList`のenabled状態またはchange eventをpageが取得できる。
- 自動選択、custom selector、字幕track、複数videoの切替では成功しない。

この条件が揃うまではS-350-B07を追加しない。

## 現在の実装状態

- Wave 0〜4（registry、browser／OS入力、外部表示、PWA／worker）はコード化済み。対応条件がない場合は`UNSUPPORTED`または`PARTIAL`のまま止まり、製品stageの成功条件へ流用しない。
- Wave 5（FedCM）はchooser入口とtoken破棄だけをコード化済み。公式provider、公開RP、実accountの監査が終わるまで製品箱へ昇格しない。
- POC-034は監視枠として実装済みだが、`audioTracks`を公開するbrowserが現れるまで再実行しない。
- 下記のcommit境界は変更を分割する場合の推奨であり、まだcommit済みという意味ではない。

## 実装順とcommit境界

1. **Commit A — PoC基盤**: contracts、registry、lazy load、既存4 caseの移行。
2. **Commit B — browser／OS入力**: POC-033、009、012、025、026。
3. **Commit C — 外部表示**: POC-019、020、023と固定media／receiver fixture。
4. **Commit D — PWA／worker**: POC-024、028とscope分離、storage cleanup。
5. **Commit E — FedCM**: 公式provider監査記録と、監査を通過した場合だけPOC-027を確定。
6. **Commit F — 証跡整理**: 最新索引、結果、人手台帳、絶対path・secret・license監査。

対応機器がなくてもCommit A〜Dは`NOT_RUN`／`UNSUPPORTED`を正しく表示するところまでコード化できる。Commit Eは公式provider監査とRP登録条件が通ってから着手する。実機確認が済むまで製品stageへ昇格せず、PoC実装完了とPoC合格を別管理する。

## 自動検証

- 純粋なvalidator、round照合、状態遷移、negative caseはJestで検証する。
- worker、manifest、receiver、fixed assetはURL、scope、MIME、license、参照切れをbuild時に検証する。
- mockのeventを使うtestは配線・状態機械のtestに限定し、PoCのPASS証拠にはしない。
- Node 24.14.0で`npm run check`、対象test、`npm run test:ci`、`npm run build`、`git diff --check`を実行する。
- commit前に秘密情報、個人情報、local絶対path、未許諾asset、worker scope競合を監査する。

## 各Waveの終了条件

各Waveは、対応環境が手元にない場合でも次を満たせば「PoC実装完了」とする。

- 実APIを呼ぶ入口と、実APIからしか得られない肯定条件がコード化されている。
- 非対応環境が成功表示にならない。
- negative caseとcleanupを同じ画面から確認できる。
- 固定fixtureと第三者licenseがGit管理されている。
- 操作手順がPoC画面と文書で一致する。
- `poc-latest.md`、`poc-results.md`、`human-test-matrix.md`の状態が同期している。

実機証拠が揃った時だけ「PoC合格」とし、その後に別commitで製品stageへ昇格する。
