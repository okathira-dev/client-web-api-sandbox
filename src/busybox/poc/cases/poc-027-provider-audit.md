# FedCM provider audit worksheet

実装時点で公式providerの一次資料を確認し、次の条件を満たすものだけを`POC-027`へ追加する。

- provider公式資料にFedCM対応の記載がある
- 一般RPがpublic clientを登録できる
- Busybox独自のIdP backendを運用しない
- browser所有chooserを経由したFedCM結果を観測できる
- 公開HTTPSのテストoriginとテストaccountで再現できる

通常OAuth redirect、providerの自作login UI、tokenの固定表示はFedCM PoCの成功条件にしない。
