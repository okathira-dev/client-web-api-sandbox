# 最新PoC索引

この一覧は、現行仕様に対応する実行可能PoCの入口だけを示す。過去の候補、却下案、旧箱番号、途中のfixtureはここへ戻さない。製品の解法・箱数・成功条件は各ステージのJSDocと実装を正本とする。

## 隔離ページ

`/busybox/poc/` のアコーディオンに、次の最新版だけを残す。PoCは製品stageとは独立し、製品コードからPoCへ依存しない。

| 対象 | 最新PoC | 隔離ページの項目 | 状態の意味 |
| --- | --- | --- | --- |
| S-030 | POC-001 | CSS Custom Highlight | APIの観測 |
| S-060 | POC-002 | offline Beacon | Service Worker receipt経路 |
| S-150 / S-610 | POC-003 | `details[name]` / native dialog | native event経路 |
| S-220 | POC-004 | Navigation API | branch disposal観測 |
| S-580 | POC-010 | SpeechSynthesis | queue / cancel観測 |
| S-650 | POC-014 | Permissions | state照会とcleanup |
| S-660 | POC-015 | Compute Pressure | passive recordとdisconnect |
| S-670 | POC-016 | Console maze | plain ASCII盤面の再表示 |
| S-690 | POC-018 | Text Fragment traversal | 同一ページのfragment移動 |
| S-350 / S-430 | POC-031 | browser / OS media controls | native player・PiP・Media Session |
| S-620 | POC-011 | Unicode fixture | glyph・copy・font検証 |
| S-640 | POC-013 | Encoding fixture | 全label組み合わせ表 |
| S-710 | POC-021 | bounded Insertable Streams | bounded frame読取 |
| S-720 | POC-022 | WebCodecs / recovery fixture | frame変換と期待値照合 |
| S-810 | 固定asset検証 | `fixtures/s810/assets.test.ts` | pack・manifest・native寸法fixture |
| DR-041 | POC-030 | Invoker Commands | native `CommandEvent` |

## 外部条件の最新版記録

実機・公開origin・外部account・長期schedulerが必要なものは、隔離ページのcapability tableと確認キューに入口だけを残す。成功を合成せず、対応環境で最後に観測した結果を`verification-record.md`と`human-test-matrix.md`へ記録する。

| 対象 | 最新PoC | 必要な外部条件 |
| --- | --- | --- |
| S-480 | POC-008 | User Preferences対応browser |
| S-510 | POC-009 | installed PWA・別origin iframe・window境界 |
| S-630 | POC-012 | `connection.type`を公開する実端末 |
| S-700 | POC-019 / POC-020 | Remote Playback receiver・Presentation display |
| S-730 | POC-023 | XR機器 |
| S-740 | POC-024 | installed HTTPS PWA・長期scheduler |
| S-750 | POC-025 | 実SMS・OTP専用AutoFill |
| S-760 | POC-026 | Contact Picker対応Android |
| S-770 | POC-027 | 公式FedCM provider・公開RP |
| S-780 | POC-028 | Payment Handler対応browser |
| S-790 | POC-029 | Local Font Access対応desktop Chromium |

## 削除済みの旧PoC

- POC-005 / S-270: ステージ却下済み。
- POC-006: S-350の旧Media Capabilities・旧VFR・旧解像度reel。現行のnative操作はPOC-031へ統合済み。
- POC-007: S-430の旧Audio Session案。現行S-430はMedia Sessionのpause actionをPOC-031で扱う。
- POC-017 / S-680: Console診断卓の候補。S-670との体験重複で不採用。

旧計画・調査・時系列結果は当面 `docs/plans/` または履歴資料として保持するが、現行判断の入力にはしない。製品実装と人手確認が完了した時点で、計画資料と旧結果を削除する。
