# クロマティックボタンアコーディオンを演奏できるウェブアプリ

## 利用技術

フレームワークはReact, 状態管理にはjotai, 音声ライブラリにはTone.jsを利用する。

## 制作するアコーディオン

主にメロディーを演奏するための右手側筐体と、主に伴奏を演奏するための左手側筐体からなる。

アプリでは、その右手側筐体と左手側筐体をスイッチで切り替えられる。

最終的には、WebHID APIを用いて、デバイスに接続した２つのコンピュータキーボードをそれぞれ認識させて、同時にアコーディオンの右手側キーボードと左手側キーボードを演奏できるようにしたい。

## 右手側筐体（メロディー側）

[クロマティックボタンアコーディオン](https://en.wikipedia.org/wiki/Chromatic_button_accordion)のCシステム

### 右手側 - 音量調整

右手側筐体の音量を調整できるスライダー。

### 右手側 - リードセット

右手側筐体では、音が出るリードセットを５つ持つ。内訳は、低音１つ（L1）、中音３つ（M1, M2, M3）、高音１つ（H1）。
低音は中音より１オクターブ低く、高音は中音より１オクターブ高い。中音のM1はM2より僅かに低くデチューンされており、M3はM2より僅かに高くデチューンされている。

アプリには以下の動作ができるUIを用意する。

- リードセット全体のピッチを変更できるインプット要素
- それぞれのリードセットのピッチをバラバラに変更できるインプット要素
- それぞれのリードセットを鳴らすか鳴らさないか切り替えるスイッチ

### 右手側 - 音色切り替えスイッチ（レジスタースイッチ）

リードセットの音が鳴るプリセットを切り替えるためのスイッチ。レジスタースイッチとも言う。

アプリには以下の動作ができるUIを用意する。

- ファンクションキーに反応するレジスタースイッチ。
- それぞれのレジスタースイッチに対応するリードセットのプリセットをドラッグで入れ替えられるUI。

### 右手側 - ボタンキーボード

コンピュータキーボードの文字キーがそれぞれアコーディオンのボタンキーボードに対応する。レイアウトはクロマティックボタンアコーディオンのCシステム。
キーを押している間だけ有効になっているリードセットの音が鳴る。

アプリには、アコーディオンのボタンのレイアウトに合わせつつ、コンピュータキーボードの文字を印字したキーボードのUIを用意する。

## 左手側筐体（伴奏側）

[ストラデラベースシステム](https://en.wikipedia.org/wiki/Stradella_bass_system)

### 左手側 - 音量調整

左手側筐体の音量を調整できるスライダー。

### 左手側 - リードセット

左手側筐体のリードセットには、コードとベースの両方で鳴るものとベースのみで鳴るものの２種類がある。
コードとベースの両方で鳴るものには、SopranoとAltoがある。ベースのみで鳴るものには、TenorとBassがある。それぞれのルート音の高さはSoprano(C5-B5), Alto(C4-B4), Tenor(C3-B3), Bass(C2-B2).

### 左手側 - 音色切り替えスイッチ（レジスタースイッチ）

左手側筐体も右手側筐体と同様に、リードセットの音が鳴るプリセットを切り替えるためのスイッチを持つ。

### 左手側 - ボタンキーボード

ストラデラベースで、4x12の48ベース。ベースは対位ベース（メジャーサード）、基本ベース（ルート）、メジャーコード、マイナーコードの４種類を持ち、それぞれがコンピュータキーボードの"1", "q", "a", "z"の列に対応する。