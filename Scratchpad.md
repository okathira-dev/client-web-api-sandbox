# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### FSL Skillを公式構成へ移行

- [x] FSL v3.1.0の公式Skill bundleを取得してchecksumを検証
- [x] 公式Skillを`skills/`へ無改変で配置
- [x] `.cursor/skills/`をCursor発見用アダプターへ変更
- [x] `.agents/skills/`をCodex発見用アダプターとして正本へ接続
- [x] `AGENTS.md`とREADMEの索引を新構成へ更新
- [x] 上流ハッシュ、アダプター、参照、差分を最終検証

## 進捗状況

- 公式Releaseの`fsl-skills.tar.gz`を公開SHA-256と照合してから利用した。
- 配布bundleに含まれる6 Skillだけを導入し、タグのソースツリーにだけ存在する追加Skillは混在させない。
- portable-installation注記は公式Skill本文からクライアント別アダプターへ移した。
- 公式bundleの11ファイルは配布アーカイブおよび上流Git blobと一致した。
- 新規Codexセッションで`$fsl`が`skills/fsl/SKILL.md`を正本として読むことを確認した。
- ユーザーPython環境のPyYAML 6.0.3を使い、UTF-8モードの公式`quick_validate.py`で正本・Cursor・Codexの全18 Skillが合格した。

## リポジトリ構造分析結果

- Skill本文と参照資料の正本は公式構成と同じ`skills/`とし、`.cursor/skills/`と`.agents/skills/`は発見用アダプターだけにする。
- 固定的なCursorクライアントバージョンはScratchpadへ記録しない。

## メモと反省

- ベンダーした公式Skillは無改変で保ち、クライアント固有の発見・パス解釈はアダプターに隔離する。
