# API調査・採用方針

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
| Speech synthesis | 別family監査 | 認識問題の出力には使わず、MDN全件監査で独立に採否を決める |

アプリ自身は音声、transcript、confidence、alternativesを永続化・Drive同期しない。ただしbrowserのrecognition serviceが外部処理する可能性は開始前に説明し、H-027でnetwork、permission、error、abort、cleanupを確認する。

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

初回全体調査は2026-07-18、Geolocation、Clipboard change、Web Speech、Generic Sensorと実装順を左右するPWA / Notification / WebAuthn / text scale / Batteryの追加確認は2026-07-20に行った。引き継ぎスナップショットは147ファミリー・1,045インターフェースだが、完全な機械可読台帳はまだ作成していない。MDN一覧の項目数は増減するため、この固定値を現行件数と断定せず、次回棚卸しで再取得したスナップショットと抽出手順を台帳へ残す。

## 添付Deep Researchメモの扱い

[添付Deep Researchメモの保存版](./source/deep-research-report.md)は、APIごとのギミック案を広く拾うためのアイデア源として使う。原文の引用マーカーはこのリポジトリから解決できず、WebVRのような旧API、旧来方式、広告・決済・認証など高リスクな用途も含むため、互換性表や採用判断の根拠にはしない。

取り込み時は、各案を次のいずれかへ分類する。

| 取り込み状態 | 意味 |
| --- | --- |
| 未レビュー | 添付資料にあるだけで、現行性もゲーム性も未確認 |
| 既存案へ統合 | ギミックメモ台帳の既存案と発見が同じ |
| 調査候補 | 公式資料と最小試作へ進める価値がある |
| 保留 | サーバー、特殊機器、審査、プライバシーなどの前提が重い |
| 却下 | Deprecated、現行実装なし、重複、静的アプリ方針との不一致 |

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
