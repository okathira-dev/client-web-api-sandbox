# Tears of Overflowed Bits

「tears of overflowed bits」という映像作品を模倣したジェネラティブアート実装です。

## 概要

このプロジェクトはThree.jsを使用して3D空間内で日本語のテキストをアニメーションさせます。P5.jsの実装からThree.jsに移植したものです。Reactを使わず、純粋なThree.jsで実装しています。

2Dアニメーションに適した等角図法（Orthographic Projection）を使用しているため、奥行きによる遠近感がなく、平面的な表現になっています。

## 機能

- 3D空間内でのテキストアニメーション
- キーボード操作によるアニメーション制御
- カスタマイズ可能なアニメーションパラメータ
- Three.js FontLoaderとTextGeometryによる3Dテキスト表示
- 等角図法（OrthographicCamera）による2D的な表現

## キーボード操作

- Enter: 最初に戻る
- Space: 一時停止
- ←, →: 逆・倍速再生
- ↑, ↓: 10倍の逆・倍速再生
- Ctrl, Shift: 時の進みを4分の1倍, 4倍

## セットアップと実行

### 必要なフォント

このプロジェクトには以下のフォントが必要です：
- Noto Serif JP_Bold.json（Three.js用のJSONフォーマット）

### フォントの準備

フォントファイルは既に `public/font/` ディレクトリに配置されています。

## 実装情報

本プロジェクトでは、Three.jsの3D環境内でテキストを表示するためにFontLoaderとTextGeometryを使用しています：

1. Three.jsのFontLoaderでJSONフォーマットのフォントをロード
2. TextGeometryで3Dテキストメッシュを生成
3. MeshStandardMaterialでマテリアルを適用
4. 3Dテキストメッシュを3D空間に配置

また、遠近感のない2D的な表現を実現するために：

5. PerspectiveCameraではなくOrthographicCameraを使用
6. 等角図法（Orthographic Projection）により、距離による大きさの変化を排除

## トラブルシューティング

### よくある問題

1. **フォントが読み込めない**
   - フォントファイルのパスが正しいか確認
   - フォントファイル名に空白が含まれている場合は注意が必要
   - ブラウザのCORSポリシーを確認（ローカルファイルへのアクセスには制限がある場合があります）

2. **画面に何も表示されない**
   - コンソールでエラーを確認
   - WebGLがサポートされているか確認

3. **テキストが表示されない**
   - FontLoaderがフォントを正しくロードできているか確認（コンソールログを確認）
   - TextGeometryが適切に作成されているか確認

## 技術スタック

- Three.js
- TypeScript
- HTML/CSS

## ディレクトリ構造

```
/tears-of-overflowed-bits
  /public
    /font - Three.js用JSONフォントファイル
  /consts - 定数とテキストデータ
  /utils - ユーティリティ関数
  main.ts - メインエントリポイント
  index.html - HTMLエントリポイント
  style.css - スタイル
  types.ts - 型定義
  README.md - このファイル
```
