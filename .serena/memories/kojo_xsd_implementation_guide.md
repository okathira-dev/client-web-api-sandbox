# XSD活用による実装ガイド

## XSDファイルの構造分析

### 1. 要素情報の取得方法

XSDファイルから以下の情報を取得可能：

```xml
<xsd:element name="WCA00000" type="gen:name">
  <xsd:annotation>
    <xsd:appinfo>"保険会社名"</xsd:appinfo>
  </xsd:annotation>
</xsd:element>
```

**取得可能な情報**:
- `name`: 要素名（WCA00000）
- `type`: データ型（gen:name）
- `minOccurs`: 最小出現回数（デフォルト: 1）
- `maxOccurs`: 最大出現回数（デフォルト: 1、または"unbounded"）
- `xsd:appinfo`: 日本語名（"保険会社名"）

### 2. 型情報の取得

```xml
<xsd:complexType name="WCE00000-1-1type">
  <xsd:sequence>
    <xsd:element name="WCE00010" type="gen:yyyy">
      <xsd:annotation>
        <xsd:appinfo>"証明年"</xsd:appinfo>
      </xsd:annotation>
    </xsd:element>
  </xsd:sequence>
</xsd:complexType>
```

**取得可能な情報**:
- 子要素のリスト
- 各子要素の型、出現回数、日本語名

### 3. 共通ボキャブラリの型定義

```xml
<xsd:complexType name="yymmdd">
  <xsd:annotation>
    <xsd:appinfo>日付</xsd:appinfo>
  </xsd:annotation>
  <xsd:sequence>
    <xsd:group ref="yyGroup"/>
    <xsd:group ref="mmGroup"/>
    <xsd:group ref="ddGroup"/>
  </xsd:sequence>
</xsd:complexType>
```

**取得可能な情報**:
- 型名（yymmdd）
- 日本語名（日付）
- 子要素の構造（yyGroup, mmGroup, ddGroup）

## 実装アプローチ

### アプローチ1: ビルド時にXSDをパースしてJSONに変換（推奨）

**メリット**:
- ブラウザでのXSDパースの複雑さを回避
- パフォーマンスが良い（一度だけパース）
- 型安全性を確保

**実装手順**:

1. **ビルドスクリプトの作成**

```typescript
// scripts/generateXsdSpecs.ts
import { DOMParser } from '@xmldom/xmldom';
import { select } from 'xpath';
import * as fs from 'fs';
import * as path from 'path';

interface XsdElementSpec {
  name: string;
  japaneseName?: string;
  type: string;
  minOccurs: number;
  maxOccurs: number | 'unbounded';
  children: XsdElementSpec[];
  isRequired: boolean;
}

interface XsdTegSpec {
  tegCode: string;
  version: string;
  formName: string;
  rootElement: XsdElementSpec;
  elements: Map<string, XsdElementSpec>;
}

function parseXsdFile(xsdPath: string): XsdTegSpec {
  const xsdContent = fs.readFileSync(xsdPath, 'utf-8');
  const doc = new DOMParser().parseFromString(xsdContent);
  
  // 名前空間の登録
  const namespaces = {
    xsd: 'http://www.w3.org/2001/XMLSchema',
  };
  
  // バージョン情報を取得
  const documentation = select('//xsd:documentation', doc, namespaces)[0] as Element;
  const versionMatch = documentation?.textContent?.match(/version[：:]\s*([\d.]+)/);
  const version = versionMatch ? versionMatch[1] : '1.0';
  
  // 様式名を取得
  const formNameMatch = documentation?.textContent?.match(/様式名[：:]\s*(.+)/);
  const formName = formNameMatch ? formNameMatch[1].trim() : '';
  
  // TEGコードを取得（ファイル名から）
  const tegCode = path.basename(xsdPath, '.xsd').replace(/-001$/, '');
  
  // ルート要素を取得
  const rootElement = select('//xsd:element[@name]', doc, namespaces)[0] as Element;
  const rootElementName = rootElement?.getAttribute('name') || '';
  
  // すべての要素を取得
  const elements = new Map<string, XsdElementSpec>();
  
  function parseElement(element: Element): XsdElementSpec | null {
    const name = element.getAttribute('name');
    if (!name) return null;
    
    // appinfoから日本語名を取得
    const appinfo = select('.//xsd:appinfo', element, namespaces)[0] as Element;
    const japaneseName = appinfo?.textContent?.trim().replace(/"/g, '');
    
    // 型を取得
    const type = element.getAttribute('type') || '';
    
    // 出現回数を取得
    const minOccurs = parseInt(element.getAttribute('minOccurs') || '1', 10);
    const maxOccursAttr = element.getAttribute('maxOccurs');
    const maxOccurs = maxOccursAttr === 'unbounded' ? 'unbounded' : parseInt(maxOccursAttr || '1', 10);
    
    // 子要素を取得（complexTypeを参照）
    const children: XsdElementSpec[] = [];
    // ... 子要素のパース処理 ...
    
    const spec: XsdElementSpec = {
      name,
      japaneseName,
      type,
      minOccurs,
      maxOccurs,
      children,
      isRequired: minOccurs > 0,
    };
    
    elements.set(name, spec);
    return spec;
  }
  
  // ルート要素をパース
  const rootSpec = parseElement(rootElement);
  
  return {
    tegCode,
    version,
    formName,
    rootElement: rootSpec!,
    elements,
  };
}

// すべてのXSDファイルを処理
const xsdDir = path.join(__dirname, '../src/kojo-xml-viewer/kojoall_original/04XMLスキーマ/kyotsu');
const xsdFiles = fs.readdirSync(xsdDir).filter(f => f.endsWith('.xsd'));

const specs: Record<string, XsdTegSpec> = {};

for (const file of xsdFiles) {
  const xsdPath = path.join(xsdDir, file);
  const spec = parseXsdFile(xsdPath);
  specs[spec.tegCode] = spec;
}

// JSONファイルに出力
const outputPath = path.join(__dirname, '../src/kojo-xml-viewer/generated/xsd-specs.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2), 'utf-8');

console.log(`Generated XSD specs for ${Object.keys(specs).length} TEG codes`);
```

2. **実行時の使用**

```typescript
// specs/loadXsdSpecs.ts
import xsdSpecs from '../generated/xsd-specs.json';

export interface XsdElementSpec {
  name: string;
  japaneseName?: string;
  type: string;
  minOccurs: number;
  maxOccurs: number | 'unbounded';
  children: XsdElementSpec[];
  isRequired: boolean;
}

export function getXsdSpec(tegCode: string): XsdElementSpec | undefined {
  const spec = xsdSpecs[tegCode];
  return spec?.rootElement;
}

export function getElementSpec(tegCode: string, elementCode: string): XsdElementSpec | undefined {
  const spec = xsdSpecs[tegCode];
  return spec?.elements[elementCode];
}

export function getElementJapaneseName(tegCode: string, elementCode: string): string | undefined {
  const elementSpec = getElementSpec(tegCode, elementCode);
  return elementSpec?.japaneseName;
}
```

3. **既存のCSVパーサーとの統合**

```typescript
// mappings/elementMapping.ts (拡張版)

import { getElementSpec, getElementJapaneseName } from '../specs/loadXsdSpecs';
import { generateElementMappings as generateFromCsv } from './elementMapping';

export function generateElementMappingsHybrid(
  specification: TegSpecification,
): ElementMapping[] {
  const tegCode = specification.tegCode;
  
  // CSVから基本情報を取得（既存の実装）
  const csvMappings = generateFromCsv(specification);
  
  // XSDから追加情報を取得
  for (const mapping of csvMappings) {
    const xsdSpec = getElementSpec(tegCode, mapping.elementCode);
    
    if (xsdSpec) {
      // XSDの日本語名を優先（より正確）
      if (xsdSpec.japaneseName) {
        mapping.label = xsdSpec.japaneseName;
      }
      
      // 出現回数の情報を追加
      mapping.minOccurs = xsdSpec.minOccurs;
      mapping.maxOccurs = xsdSpec.maxOccurs;
      
      // 必須/任意の情報を追加
      mapping.isRequired = xsdSpec.isRequired;
    }
  }
  
  return csvMappings;
}
```

### アプローチ2: 実行時にXSDをパース（WASM版）

**メリット**:
- ビルド時の処理が不要
- XSDファイルの更新が即座に反映される

**デメリット**:
- ブラウザでのXSDパースの複雑さ
- パフォーマンスの懸念

**実装例**:

```typescript
// specs/parseXsdRuntime.ts
import { DOMParser } from '@xmldom/xmldom';
import { select } from 'xpath';

export async function parseXsdFile(xsdPath: string): Promise<XsdTegSpec> {
  const response = await fetch(xsdPath);
  const xsdContent = await response.text();
  
  const doc = new DOMParser().parseFromString(xsdContent);
  // ... パース処理（アプローチ1と同じ） ...
}
```

## バリデーションの実装

### XMLバリデーション（XSDベース）

```typescript
// utils/xmlValidator.ts
import { DOMParser } from '@xmldom/xmldom';

interface ValidationError {
  line: number;
  column: number;
  message: string;
  element?: string;
}

export async function validateXmlAgainstXsd(
  xmlString: string,
  tegCode: string,
): Promise<{ isValid: boolean; errors: ValidationError[] }> {
  // XSDファイルを読み込む
  const xsdPath = `/kojo-xml-viewer/kojoall_original/04XMLスキーマ/kyotsu/${tegCode}-001.xsd`;
  const xsdResponse = await fetch(xsdPath);
  const xsdContent = await xsdResponse.text();
  
  // XMLをパース
  const xmlDoc = new DOMParser().parseFromString(xmlString);
  
  // 基本的な構造チェック
  const errors: ValidationError[] = [];
  
  // 1. ルート要素のチェック
  const rootElement = xmlDoc.documentElement;
  if (rootElement.tagName !== tegCode) {
    errors.push({
      line: 1,
      column: 1,
      message: `ルート要素が正しくありません。期待値: ${tegCode}, 実際: ${rootElement.tagName}`,
      element: rootElement.tagName,
    });
  }
  
  // 2. 必須要素のチェック
  // XSDから必須要素のリストを取得してチェック
  // ...
  
  // 3. 型のチェック
  // 各要素の値がXSDで定義された型に適合しているかチェック
  // ...
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

## 段階的な移行計画

### Phase 1: XSDパーサーの実装（1-2週間）
1. ビルドスクリプトの作成
2. XSDから要素情報を抽出
3. JSONファイルに出力

### Phase 2: 既存コードとの統合（1週間）
1. XSDから日本語名を取得する機能を追加
2. CSVパーサーと並行して使用
3. XSDの情報を優先的に使用

### Phase 3: バリデーションの追加（1週間）
1. XMLファイルの構造検証
2. エラーメッセージの表示

### Phase 4: CSV依存の削減（2-3週間）
1. XSDからすべての構造情報を取得
2. CSVは表示情報（書式など）のみに使用
3. 最終的にCSVへの依存を最小化

## まとめ

XSDファイルを活用することで、以下の改善が可能：

1. **型安全性**: XSDから型情報を取得
2. **正確性**: 仕様書との整合性を確保
3. **保守性**: CSVへの依存を削減
4. **バリデーション**: XMLファイルの構造検証

段階的な実装により、既存の機能を壊すことなく改善を進めることができます。
