# S-880 Compression Streams fixture

`assets/parcel-a.gz`、`parcel-b.deflate`、`parcel-c.raw` は、それぞれgzip、zlib wrapped deflate、raw deflateで圧縮した65,536 byteの固定payloadです。S-880は同梱assetをfetchし、playerが選んだ`DecompressionStream`だけで展開してmarkerとbyte長を照合します。

runtimeでpayloadを生成・圧縮せず、library / Node fallbackも使いません。再生成時だけ次を実行します。

```powershell
node scripts/generate-busybox-s880-fixtures.mjs
```

`assets.test.ts`はmanifest、圧縮形式、Nodeの独立展開による固定内容を確認します。これは生成物の検証であり、製品stageのfallbackではありません。
