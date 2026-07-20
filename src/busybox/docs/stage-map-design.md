# ステージMind Map設計

## 目的

現在の`stage-grid`はステージを均等に列挙できる一方、操作や発見の近さ、別ステージで得た手掛かりの継承を表せない。最終一覧は、箱をnode、関係をedgeとして見せる決定的配置のmind mapへ置き換える。

この地図は攻略順や全クリ経路を固定しない。edgeは「近そう」「ここで見たものが別の場所にも効きそう」という発見を支える情報であり、明示した別仕様がない限りhard lockや必須順序には使わない。

## 情報モデル

各stageは既存の`StageSpec`へ、表示専用のmap metadataを追加する。

```ts
type StageMapMeta = {
  branch: "page" | "device" | "storage" | "passage" | "labs";
  order: number;
  relatedStageIds?: readonly StageId[];
  clueFromStageIds?: readonly StageId[];
};
```

- `branch`: 主となる系統。1stageにつき1つだけ持つ。
- `order`: branch内の安定配置順。実行ごとに位置が変わるforce layoutは使わない。
- `relatedStageIds`: 同じ中心動詞、似たbrowser surface、共通APIなどの近さ。
- `clueFromStageIds`: 別stageで得た記憶や手掛かりが効く有向関係。最初の具体例は`S-490 -> S-500`、`S-180 -> S-500`、`S-490 -> S-580`。

edge数が増えすぎないよう、各stageは主branch edgeを1本、補助的なrelated edgeを原則2本以下にする。カテゴリをまたぐstageでもprimary parentを複数作らず、必要な横断関係だけ補助edgeで示す。

## 表示

- 中央にBusybox本体を置き、入力、ページ往来、メディア、PWA、端末、センサーの6つの近接clusterへ枝を伸ばす。内部管理用の5 branch metadataとは分離し、playerが行う中心操作の近さを表示へ優先する。
- 各clusterは2列のcompact node群とし、60stageを重複なく1clusterへ割り当てる。各nodeは196×92px、行間16pxを基準にし、同じ仕組みのstageを隣接させる。
- stage nodeは既存と同じ箱DOMを縮小表示し、進捗のリボン、閉箱、開箱を維持する。カード全面を単一のsemantic button操作領域とし、別の「箱を見る」buttonは置かない。
- visibleな進捗文言は`3 箱 · 挑戦できる`のような説明ではなく累積値`0/3`へ圧縮する。状態名はbuttonのaccessible nameに残す。
- branch線、related線、clue線は背面SVGで描く。clue線だけ方向を示せるが、解法文やAPI名は表示しない。
- SVGやCanvasだけでstageを操作させない。DOM nodeの位置を測って線の端点を更新する。
- nodeをdragして保存する機能は初期実装へ入れず、作者が決めた関係を全playerへ同じ形で示す。
- mapの外縁にはS-190-B04用marker slotを1つ置く。通常時はround payloadを持たず、S-190のarmed tabとBroadcastChannel handshakeした別tabだけに高contrast markerを描画する。markerはviewport fixedにせずmap座標へ固定し、panして外縁へ到達しなければ見えない。

## 操作性とアクセシビリティ

- DOM上はstageのsemantic listを維持し、keyboard focus順は視覚座標ではなく安定したbranch / order順とする。
- screen readerにはcard buttonのaccessible nameとしてstage名、`x/n`進捗、状態を読み上げる。cluster見出し、related / clue関係は冗長にならない短い補助説明として関連付ける。
- mobileはpan可能な広い地図とし、zoom、現在位置へ戻る、未解決nodeを探す操作を用意する。browser pinch zoomを妨げない。
- `prefers-reduced-motion`ではpan時やnode状態変化の移動animationを省略する。
- 視覚的な線だけを唯一の情報にせず、focus時に直接関係するnodeと線を強調する。

## 実装順

1. `StageSpec`へmap metadataを追加し、全stageへbranchと安定orderを割り当てる。
2. 現行`stage-grid`と同じ進捗・routingを使うread-onlyなmap prototypeを作る。
3. desktop keyboard、200% zoom、mobile pan、日英label長でnode重なりを検証する。
4. `S-490 -> S-500`、`S-180 -> S-500`、`S-490 -> S-580`を最初のclue edgeとして、線が答えを露骨に説明せず関係だけを示すか確認する。
5. S-190のarmed tabと別tabのmapを接続し、外縁markerが通常閲覧や直接URLではround payloadを持たず、実capture frameだけでB04が開くことを確認する。
6. 一覧の主要導線をmapへ切り替え、必要なら設定にcompact semantic list viewを残す。これは問題のskipや代替clearではなく、一覧操作のaccessibility表示である。

## 実装状況（2026-07-20）

実装順1・2と一覧の主要導線切替を完了した。`StageSpec.map`を全catalogue項目の必須情報とし、未指定の既存stageにもカテゴリとIDから安定したbranch / orderを導出する。2026-07-20のcompact化で、表示を1480×1650の決定的なDOM mapへ再配置し、60stageを6近接clusterの各2列へ収めた。nodeは260×168pxから196×92pxへ縮小し、初期zoomを80%、範囲を55〜130%とした。カード全面button、累積値`x/n`、背面SVG edge、中央復帰、外縁marker slotから構成し、routing、永続進捗、keyboard focus、accessible nameは地図の描画方式から独立している。

実装順3の実ブラウザ目視、4の新規stage間clue edge、5のcapture handshakeは、それぞれ対応stageの実装と人手確認時に完了させる。Codex in-app browserからホストのlocalhostへ接続できない実行環境だったため、今回の基盤コミットでは型、DOM構造、catalogue整合、自動test、production buildを証跡とし、目視を合格扱いにはしない。

## 完了条件

- 全stageにprimary branchと決定的な位置順がある。
- resize、localization、progress更新後もnodeとedgeがずれない。
- mouse、touch、keyboard、screen readerのいずれでも全stageへ到達できる。
- edgeが過密にならず、機構の近さと手掛かり関係をgridより読み取りやすい。
- S-190未armed時と通常のstage map直リンクでは、外縁markerが有効なround payloadを表示しない。
- stageの解決可否や永続進捗は、地図の表示状態に依存しない。
