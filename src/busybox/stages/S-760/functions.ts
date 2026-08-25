export interface ContactInfoLike {
  readonly name?: readonly string[];
  readonly email?: readonly string[];
  readonly tel?: readonly string[];
  readonly address?: readonly unknown[];
  readonly icon?: readonly Blob[];
}

export const S760_EXPECTED = {
  name: "Busybox Courier",
  email: "courier@busybox.invalid",
  tel: "+81300000000",
  addressTokens: ["1-1-1 Busybox", "Tokyo", "100-0001", "Japan"],
} as const;

function stringsInside(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsInside);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(stringsInside);
  return [];
}

function normalizeTelephone(value: string): string {
  const prefix = value.trim().startsWith("+") ? "+" : "";
  return prefix + value.replace(/\D/gu, "");
}

export function matchesS760Card(contact: ContactInfoLike | undefined): boolean {
  if (!contact) return false;
  const addressText = stringsInside(contact.address).join("\n");
  return (
    contact.name?.includes(S760_EXPECTED.name) === true &&
    contact.email?.some(
      (value) => value.toLowerCase() === S760_EXPECTED.email,
    ) === true &&
    contact.tel?.some(
      (value) => normalizeTelephone(value) === S760_EXPECTED.tel,
    ) === true &&
    S760_EXPECTED.addressTokens.every((token) => addressText.includes(token)) &&
    contact.icon?.some((blob) => blob instanceof Blob && blob.size > 0) === true
  );
}

export function hasNoSharedS760Properties(
  contact: ContactInfoLike | undefined,
): boolean {
  if (!contact) return false;
  return (["name", "email", "tel", "address", "icon"] as const).every(
    (property) => {
      const value = contact[property];
      return value == null || value.length === 0;
    },
  );
}
