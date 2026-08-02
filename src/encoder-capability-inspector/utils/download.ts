/** ファイルの保存。生成した Blob URL は使い終わったら必ず解放する。 */

export const downloadJson = (fileName: string, data: unknown): void => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  /*
    click() の直後に同期で解放すると、保存処理が URL を読む前に消えることがある。
    次のタスクまで待ってから解放する。
  */
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};
