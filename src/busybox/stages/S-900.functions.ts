export const s900ExpectedOrder = ["A", "B", "C", "D"] as const;

export type S900ReelId = (typeof s900ExpectedOrder)[number];

export function hasS900CorrectOrder(order: readonly S900ReelId[]) {
  return (
    order.length === s900ExpectedOrder.length &&
    order.every((reel, index) => reel === s900ExpectedOrder[index])
  );
}
