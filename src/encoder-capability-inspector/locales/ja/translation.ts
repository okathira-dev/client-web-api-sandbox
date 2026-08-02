import type { TranslationResource } from "../types";

const translation: TranslationResource = {
  app: {
    title: "エンコーダー実用可否検査",
    description:
      "列挙したすべての codec string / Profile / Level について、実際にエンコード・デコード・多重化まで通して実用可否を確認します。`isConfigSupported` が受理しただけの設定は「利用可能」として扱いません。結果はこの環境（ブラウザー・OS・GPU・ドライバーの組み合わせ）に固有のもので、すべての録画条件での成功を保証するものではありません。",
    language: "言語",
    languageJa: "日本語",
    languageEn: "English",
  },
  runner: {
    start: "一括実用検査を開始",
    rerun: "すべて再検査",
    resume: "途中から再開（残り {{count}} 件）",
    cancelFull: "検査を一時中断",
    cancelHint:
      "一時中断です。ここまでの結果は残り、あとで残りの候補から再開できます",
    cancelSustained: "実用継続検査を中断",
    reset: "結果を破棄",
    export: "結果をJSONで保存",
    exportHint:
      "全結果と実行環境の概要（ブラウザー・OS・GPU）を書き出します。画面内容や音声サンプルは含みません。共有するときは環境の情報が入っていることに注意してください。",
    pauseLabel: "候補間の待機 (ms)",
    pauseInvalid: "0〜{{max}} の整数で指定してください",
    pauseHelp: "既定 {{default}} ms。0 のとき待機処理を行いません",
    completed:
      "一括実用検査が完了しました。この結果はこの環境で一度実出力まで到達したことを示します。",
    cancelled:
      "検査を一時中断しました。ここまでの結果は残っており、「途中から再開」で残りの候補から続けられます。途中結果は環境の結論としては扱われません。直前に完全完了した結果があればそちらが有効なままです。",
    failed: "検査が完了前に停止しました: {{reason}}",
    unknownReason: "不明な理由",
  },
  runStatus: {
    notStarted: "未実行",
    running: "実行中",
    complete: "完了",
    cancelled: "中断",
    failed: "失敗",
  },
  progress: {
    unitCount: "{{completed}} / {{total}} 候補",
    elapsed: "経過 {{value}}",
    eta: "残り見込み {{value}}",
    pass: "成功 {{count}}",
    warning: "警告 {{count}}",
    fail: "失敗 {{count}}",
    pause: "候補間待機 {{value}} ms",
    familyHeading: "コーデックファミリー",
    familyUntested: "{{family}}: 未検査",
    familyRatio: "{{family}}: {{usable}} / {{total}}",
    familyNote:
      "映像は codec string の数、音声はビットレートとチャンネル数まで含んだ設定の数を分母にします（AAC はどの設定でも codec string が同じため）。完全に完了した検査の結果だけを集計します。",
    familyIncludeExperimental: "実験的な構成も分母に含める",
    environment: "実行環境",
    cores: "{{count}} 論理コア",
    stage: {
      declared: "設定の受理を確認中",
      output: "エンコード中",
      decode: "デコード検証中",
      mux: "多重化中",
      complete: "完了",
    },
    idle: {
      idle: "一括実用検査を開始すると、候補ごとの結果がここに表示されます",
      waiting: "次の候補を待機しています",
      complete: "すべての候補を処理しました",
      cancelled:
        "検査を一時中断しました。「途中から再開」で残りの候補から続けられます",
      failed: "検査が完了前に停止しました",
    },
  },
  sustained: {
    heading: "実用継続検査",
    description:
      "選択した具体的な設定を、指定した時間ぶんだけ実出力・デコード・多重化まで通して検査します。単発の少数フレーム結果では分からない継続性能を確認するためのものです。ライブ入力はブラウザーの画面共有ダイアログを開きますが、録画ファイルは一切作成しません。",
    captureFailed: "画面キャプチャを取得できませんでした: {{reason}}",
    liveAudioNote:
      "音声候補をライブ入力で検査するには、共有ダイアログで音声の共有を有効にしてください。共有されなかった場合は音声候補を検査できません。",
    liveAudioMono:
      "キャプチャした音声が 1ch でした。2ch の候補は複製して形だけ合わせているため、2ch を実際に扱えたことの確認にはなりません。共有元の音声がステレオか確認してください。",
    audioSourceLine: "音声 {{channels}}ch @ {{sampleRate}} Hz",
    audioSourceNone: "音声の共有なし",
    inputLabel: "入力",
    inputSynthetic: "合成パターン（再現可能）",
    inputLive: "画面・タブのキャプチャ",
    durationLabel: "検査時間（秒）",
    durationHelp: "上限はありません。長く回しても途中で中断できます",
    memoryCaution:
      "検査中は 1 候補ぶんの出力を最後まで抱えるため、この条件では最大 {{size}} 程度のメモリを使います。中断はいつでもできますが、足りなくなるとタブごと落ちることがあります。",
    durationInvalid: "{{min}} 秒以上を指定してください",
    run: "選択した {{count}} 件を実用継続検査",
    selectPassedVideo: "成功した映像設定を選択",
    clearSelection: "選択を解除",
    statusChip: "実用継続検査 {{status}}",
    statusDetail: "{{completed}} / {{total}} 件 · {{seconds}} 秒 · {{input}}",
    sourceLine: "入力: {{width}}×{{height}} @ {{fps}} fps",
  },
  preview: {
    heading: "合成パターンを確認",
    description:
      "検査へ渡している入力そのものを、同じ生成コードで再生します。表示は {{width}}×{{height}} ですが、実際の検査は候補ごとの解像度で同じパターンを描きます。音声は {{seconds}} 秒ぶんを繰り返し再生します。",
    compatibilityHeading: "一括実用検査の入力",
    compatibilityNote:
      "1 枚・1 チャンクだけ作って使い回します。全候補を 1 周する検査なので、入力生成は軽いほど結果が揺れません。動かないのが正しい状態です。",
    sustainedHeading: "実用継続検査の入力",
    sustainedNote:
      "フレームごと・チャンクごとに作り直します。動きと情報量が無いと圧縮が効きすぎ、エンコーダーの実力を測れないためです。",
    compatibilityVideoLabel: "一括実用検査の映像パターン",
    sustainedVideoLabel: "実用継続検査の映像パターン",
    compatibilityAudioLabel: "一括実用検査の音声パターンの波形",
    sustainedAudioLabel: "実用継続検査の音声パターンの波形",
    playVideo: "映像を再生",
    pauseVideo: "映像を停止",
    play: "音声を再生",
    stop: "音声を停止",
    volumeNote:
      "合成パターンはほぼフルスケールのため、プレビューは音量を下げて再生します。実際の振幅は samples/ の WAV で確認できます。",
    runningNote: "検査の実行中はプレビューを止めています。",
    unavailable: "この環境ではプレビューを描画できません。",
  },
  table: {
    summary: "{{total}} 件中 {{shown}} 件を表示",
    selectedSuffix: " · {{count}} 件を選択中",
    empty: "まだ結果がありません。一括実用検査を開始してください。",
    noMatch: "この絞り込みに一致する結果はありません。",
    label: "検査結果",
    selectAll: "表示中の候補をまとめて選択",
    selectOne: "{{codec}} を実用継続検査の対象にする",
    columnFamily: "ファミリー",
    columnCodec: "codec string",
    columnVariant: "方針 / ch",
    columnStatus: "結果",
    columnDetails: "詳細",
    columnBudget: "フレーム予算",
    columnSustained: "継続検査",
    columnTime: "実行時間",
    filterAll: "すべて",
    filterCodecPlaceholder: "avc1.64…",
    filterDetailsPlaceholder: "エラー・警告で絞り込む",
    sortHint: "押すと並べ替え（昇順 → 降順 → 解除）",
    budgetHint:
      "一括実用検査は 2 フレームだけの互換性確認なので、フレーム予算比には初期化のコストがそのまま乗ります。100% を超えていても実用上の問題を意味しません。継続的な性能は実用継続検査の値で判断してください。",
    budgetOver: "100% 超",
    budgetUnder: "100% 以下",
    experimentalBadge: "実験的",
    experimentalFilterLabel: "実験的な構成の扱い",
    experimentalAll: "すべて",
    experimentalExclude: "実用構成のみ",
    experimentalOnly: "実験的のみ",
    backendHint:
      "WebCodecs には実際に使われた実装を返す API がありません。同じ codec string の prefer-hardware / prefer-software と出力バイト数・チャンク数を突き合わせた推定です。",
    backendMatched: "推定 {{backend}}（出力一致）",
    backendLikely: "推定 {{backend}}（片側のみ成功）",
    backendUnknown: "実体は判定不能",
    backend_hardware: "HW",
    backend_software: "SW",
    sustainedDone: "実施済み",
    sustainedNone: "未実施",
    sustainedFrames: "{{count}} フレーム",
    timeQuick: "1 秒未満",
    timeSlow: "1 秒以上",
    statusPass: "成功",
    statusWarning: "成功/警告",
    statusFail: "失敗",
    declaredButFailed: "設定は受理されたが {{stage}} で失敗",
    sourceLine: "入力 {{width}}×{{height}} @ {{fps}} fps · 欠落 {{missing}}",
  },
  references: {
    heading: "参考文献",
    description:
      "codec string の書き方や、この検査が何を確かめているのかを追える資料です。",
    group: {
      spec: "WebCodecs の仕様",
      "codec-string": "codec string の書式",
      codec: "各コーデックの仕様",
      implementation: "実装と利用ライブラリ",
    },
    groupNote: {
      spec: "エンコーダーの設定と、対応判定がどう定義されているか。",
      "codec-string":
        "`avc1.640028` のような文字列の組み立て方。候補行列はここに従って作っています。",
      codec: "Profile・Level・ビット深度そのものの定義。",
      implementation:
        "ブラウザー実装の使い方と、多重化に使っているライブラリ。",
    },
  },
  family: {
    h264: "H.264 / AVC",
    h265: "H.265 / HEVC",
    vp9: "VP9",
    av1: "AV1",
    vp8: "VP8",
    aac: "AAC",
    opus: "Opus",
  },
  kind: {
    video: "映像",
    audio: "音声",
  },
  experimental: {
    "bit-depth-10": "10bit",
    "chroma-422": "4:2:2 クロマサブサンプリング",
    "chroma-444": "4:4:4 クロマサブサンプリング",
    "high-profile": "上位 Profile",
    "level-6x": "Level 6.x",
  },
  codes: {
    "isConfigSupported-false": "この設定は宣言の時点で拒否されました",
    "encoder-no-output": "エンコーダーが出力を返しませんでした",
    "video-decoder-unavailable": "VideoDecoder が利用できません",
    "video-decoder-unsupported": "出力をデコードできる構成がありません",
    "video-decoder-no-output": "デコーダーがフレームを返しませんでした",
    "audio-decoder-unavailable": "AudioDecoder が利用できません",
    "audio-decoder-unsupported": "出力をデコードできる構成がありません",
    "audio-decoder-no-output": "デコーダーがサンプルを返しませんでした",
    "mux-output-too-small": "多重化の出力が小さすぎます",
    "webcodecs-video-unavailable":
      "この環境では WebCodecs の映像 API が使えません",
    "webcodecs-audio-unavailable":
      "この環境では WebCodecs の音声 API が使えません",
    "offscreen-canvas-2d-unavailable":
      "OffscreenCanvas の 2D コンテキストを取得できません",
    "throughput-below-75-percent": "実効 FPS が要求の 75% を下回りました",
    "live-capture-ended": "ライブ入力が途中で終了しました",
    "live-capture-unavailable": "ライブ入力を取得できません",
    "live-capture-video-track-unavailable":
      "キャプチャに映像トラックが含まれていません",
    "live-capture-audio-track-unavailable":
      "音声が共有されていないため音声候補を検査できません",
    "live-audio-captured-as-mono":
      "キャプチャした音声が 1ch のため、2ch は複製で埋めました",
    "media-stream-track-processor-unavailable":
      "MediaStreamTrackProcessor が利用できません",
    "display-capture-unavailable": "画面キャプチャ API が利用できません",
    "capability-report-not-found": "先に一括実用検査を完了させてください",
    "no-units-selected": "対象が選択されていません",
    "inspection-already-running": "別のタブまたはウィンドウで検査が実行中です",
    "inspection-worker-crashed": "検査ワーカーが停止しました",
    "inspection-worker-busy": "検査ワーカーが前の候補を処理中です",
    "indexeddb-open-failed": "保存領域を開けませんでした",
    "indexeddb-request-failed": "保存領域への読み書きに失敗しました",
    "indexeddb-transaction-aborted": "保存処理が中断されました",
  },
};

export default translation;
