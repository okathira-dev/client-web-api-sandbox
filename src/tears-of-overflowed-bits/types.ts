import * as THREE from "three";
// THREE名前空間にTextGeometryとFontLoaderを追加

declare module "three" {
  export interface TextGeometryParameters {
    font: THREE.Font;
    size?: number;
    height?: number;
    curveSegments?: number;
    bevelEnabled?: boolean;
    bevelThickness?: number;
    bevelSize?: number;
    bevelOffset?: number;
    bevelSegments?: number;
  }

  export class TextGeometry extends THREE.ExtrudeGeometry {
    constructor(text: string, parameters: TextGeometryParameters);
  }

  export class Font {
    constructor(jsondata: object);
    generateShapes(text: string, size: number): THREE.Shape[];
  }

  export interface FontLoaderParameters {
    manager?: THREE.LoadingManager;
  }

  export class FontLoader {
    constructor(manager?: THREE.LoadingManager);
    load(
      url: string,
      onLoad?: (font: Font) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (err: unknown) => void,
    ): void;
    parse(json: object): Font;
  }
}
