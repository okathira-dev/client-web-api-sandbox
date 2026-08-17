import type { PocRoot } from "../contracts";

type ContactInfo = Record<string, unknown>;
type ContactsManagerLike = {
  select: (
    properties: string[],
    options?: { multiple?: boolean },
  ) => Promise<ContactInfo[]>;
};

const expected = {
  name: ["Busybox Sample"],
  email: ["sample@busybox.invalid"],
  tel: ["+81-3-0000-0000"],
  address: ["1-1-1 Busybox, Tokyo"],
  icon: ["icon"],
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const full = root.querySelector<HTMLButtonElement>("[data-contact-full]");
  const empty = root.querySelector<HTMLButtonElement>("[data-contact-empty]");
  const reset = root.querySelector<HTMLButtonElement>("[data-contact-reset]");
  const contacts = (navigator as Navigator & { contacts?: ContactsManagerLike })
    .contacts;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const normalize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === "object") {
      const object = value as Record<string, unknown>;
      if ("blob" in object) return "icon";
      return Object.fromEntries(
        Object.entries(object).map(([key, item]) => [key, normalize(item)]),
      );
    }
    return value;
  };
  const select = async (properties: string[], emptyMode: boolean) => {
    if (!contacts?.select) {
      render(
        "Contact Picker APIを公開していません。手入力pickerへfallbackしません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      const result = await contacts.select(properties, { multiple: false });
      const contact = result[0];
      const normalized = contact ? normalize(contact) : undefined;
      if (emptyMode) {
        const noValues =
          !contact ||
          Object.values(contact).every(
            (value) =>
              value == null || (Array.isArray(value) && value.length === 0),
          );
        render(
          `property非共有経路: selected=${Boolean(contact)}, allEmpty=${noValues}`,
        );
        root.dataset.pocState = noValues ? "pass" : "partial";
        return;
      }
      const matches = JSON.stringify(normalized) === JSON.stringify(expected);
      render(`5 property照合: match=${matches}; identityは保存しません。`);
      root.dataset.pocState = matches ? "pass" : "partial";
    } catch (error) {
      render(
        `Contact Picker未完了: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const resetState = () => {
    delete root.dataset.pocState;
    render("未実行。取得値は一時比較だけです。");
  };
  const fullSelect = () =>
    void select(["name", "email", "tel", "address", "icon"], false);
  const emptySelect = () => void select([], true);
  full?.addEventListener("click", fullSelect);
  empty?.addEventListener("click", emptySelect);
  reset?.addEventListener("click", resetState);
  return () => {
    full?.removeEventListener("click", fullSelect);
    empty?.removeEventListener("click", emptySelect);
    reset?.removeEventListener("click", resetState);
  };
}
