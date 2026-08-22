# 次のPoC・ステージ化キュー

更新日: 2026-08-21

この文書は、採用済みギミックのうち製品化または追加PoCが残っているものを示す現行キューである。過去の実測証拠は[PoC実施記録](./poc-results.md)、製品stageの状態は[ステージ実装状況](./stage-implementation-status.md)、実ブラウザ・実機の手順は[人手確認台帳](./human-test-matrix.md)を正とする。

## 現在の件数

| 区分 | 件数 | 状態 |
| --- | ---: | --- |
| 採用済み・製品化待ち | 0 | S-480追加箱、S-630、S-700追加箱、S-730〜S-770、S-790まで製品stageへ統合済み |
| 採用済み・追加PoC実装待ち | 0 | 現在の決定ログからコード化できるものは処理済み |
| 自動確認待ち | 0 | 現行の自動test、型検証、lint、markup、buildへ統合済み |
| 人手・外部条件待ち | 人手台帳参照 | 実API、専用機器、公開origin、実account、実SMS、OS変更、長期schedulerだけを残す |

PoCは`/busybox/poc/`へ隔離し、製品stageはPoC moduleやPoC assetを参照しない。採用fixtureは生成script、generation manifest、意味検証testとともに製品fixtureへ昇格した。

## 製品化済みで、人手確認だけを残す対象

| 対象 | 製品上の状態 | 残るゲート |
| --- | --- | --- |
| S-480 B05〜B09 | User Preferences APIの5 overrideと対応media queryを実装 | H-003, H-004, H-019, H-020, H-023, H-025 |
| S-630 B01〜B04 | 明示観測したNetwork Information `type`の4種類を実装 | H-032 |
| S-700 B01〜B03 | 固定4slotのRemote Playback文字鍵・native QR検出とPresentation receiverを実装 | H-040, H-041 |
| S-730 B01〜B02 | immersive XR viewer poseと実input-source ray hitを実装 | H-044 |
| S-740 B01 | clientlessな異なる2回の実`periodicsync`で成長する温室を実装 | H-045 |
| S-750 B01 | WebOTPまたは強いOS Security Code AutoFill判定を実装 | H-046 |
| S-760 B01〜B02 | OS Contact Pickerの5項目一致と全項目非共有を実装 | H-047 |
| S-770 B01 | Google GISの手動FedCM結果だけを受け入れるstageを実装 | [設定手順](./google-fedcm-setup.md), H-049 |
| S-780 B01〜B04 | 2つの架空Payment Appと4経路を実装 | H-050。method manifest headerを設定できる公開hostが必要 |
| S-790 B01 | Git管理TTFのOS install、限定照会、raw bytes照合、専用glyphを実装 | H-051 |

その他の製品stageを含む全件の確認順は人手確認台帳を正とする。対応端末や外部条件がないことは未実装を意味せず、game製fallbackやsynthetic eventで合格させない。

## 更新規則

1. 新しい案は決定ログで採否と既存体験との重複を確定してからこのキューへ入れる。
2. PoC成功だけでstage IDや箱数を増やさない。API固有のプレイヤー体験、negative case、privacy、cleanupを先に固定する。
3. 製品実装へ移した項目はこの文書から実装待ちとして削除し、ステージ実装状況と人手確認台帳へ移す。
4. 完了済みWaveや旧箱番号を現行キューへ戻さない。
