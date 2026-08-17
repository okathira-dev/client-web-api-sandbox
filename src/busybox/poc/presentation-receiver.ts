const status = document.querySelector<HTMLElement>("#receiver-status");
const roundOutput = document.querySelector<HTMLElement>("#receiver-round");
const round = new URL(location.href).searchParams.get("round");

const presentation = (
  navigator as Navigator & {
    presentation?: {
      receiver?: {
        connectionList?: Promise<{
          connections: Array<EventTarget & { send: (message: string) => void }>;
        }>;
      };
    };
  }
).presentation;

if (roundOutput)
  roundOutput.textContent = round ? `round=${round}` : "roundなし";

if (!round || !presentation?.receiver?.connectionList) {
  if (status)
    status.textContent = "Presentation receiver APIまたはroundがありません。";
} else {
  void presentation.receiver.connectionList.then((list) => {
    for (const connection of list.connections) {
      connection.send(`ready:${round}`);
    }
    if (status)
      status.textContent = `receiver readyを${list.connections.length}件へ送信しました。`;
  });
}
