import { manifest } from "./manifest";

export type S920Direction = "up" | "right" | "down" | "left";

export interface S920MazeNode {
  readonly id: string;
  readonly parentId?: string;
  readonly direction?: S920Direction;
  readonly boxId?: (typeof manifest.boxIds)[number];
}

type S920Route = Readonly<{
  id: "amber" | "cyan" | "violet";
  directions: readonly S920Direction[];
  boxId: NonNullable<S920MazeNode["boxId"]>;
}>;

export const s920RootId = "s920-root";

const directions: readonly S920Direction[] = ["up", "right", "down", "left"];

const routes: readonly S920Route[] = [
  {
    id: "amber",
    directions: ["right", "right", "up", "right", "right", "down", "right"],
    boxId: manifest.box.B01,
  },
  {
    id: "cyan",
    directions: ["down", "left", "down", "down"],
    boxId: manifest.box.B02,
  },
  {
    id: "violet",
    directions: ["left", "up", "left", "up", "left", "down"],
    boxId: manifest.box.B03,
  },
];

function routeNodes(route: S920Route): readonly S920MazeNode[] {
  const nodes: S920MazeNode[] = [];
  let parentId = s920RootId;

  for (const [index, direction] of route.directions.entries()) {
    const step = index + 1;
    const isGoal = step === route.directions.length;
    const id = isGoal ? `s920-goal-${route.id}` : `s920-${route.id}-${step}`;
    nodes.push({
      id,
      parentId,
      direction,
      ...(isGoal ? { boxId: route.boxId } : {}),
    });
    if (!isGoal) {
      const decoyDirections = directions
        .filter((candidate) => candidate !== direction)
        .slice(0, 2);
      for (const decoyDirection of decoyDirections) {
        nodes.push({
          id: `${id}-dead-${decoyDirection}`,
          parentId: id,
          direction: decoyDirection,
        });
      }
    }
    parentId = id;
  }

  return nodes;
}

/**
 * Rootと各経由部屋は最大3方向の選択肢を持つ。3本の正解経路は、曲がり方と手数を意図的に
 * 変えている。Amberはinline端、Cyanはblock端を必ず越える長さを持つため、固定額縁内で
 * Popoverの幅を維持したまま、異なる軸のposition fallbackを体験できる。
 */
export const s920MazeNodes: readonly S920MazeNode[] = [
  { id: s920RootId },
  ...routes.flatMap(routeNodes),
];

export const s920NodeById = Object.fromEntries(
  s920MazeNodes.map((node) => [node.id, node]),
) as Readonly<Record<string, S920MazeNode>>;

export const s920GoalNodes = s920MazeNodes.filter(
  (
    node,
  ): node is S920MazeNode & {
    boxId: NonNullable<S920MazeNode["boxId"]>;
  } => node.boxId !== undefined,
);

export function s920ChildNodes(nodeId: string) {
  return s920MazeNodes.filter((node) => node.parentId === nodeId);
}

export function s920PathToNode(nodeId: string) {
  const path: S920MazeNode[] = [];
  const seen = new Set<string>();
  let current = s920NodeById[nodeId];
  while (current) {
    if (seen.has(current.id)) return [];
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId ? s920NodeById[current.parentId] : undefined;
  }
  return path[0]?.id === s920RootId ? path : [];
}

export function s920TriggerId(parentId: string, childId: string) {
  return `${parentId}--to--${childId}`;
}

export function s920MazeIsValid() {
  const ids = new Set(s920MazeNodes.map((node) => node.id));
  if (ids.size !== s920MazeNodes.length) return false;
  if (!ids.has(s920RootId)) return false;
  if (
    s920GoalNodes.length !== 3 ||
    new Set(s920GoalNodes.map((node) => node.boxId)).size !== 3
  )
    return false;
  return s920MazeNodes.every((node) => {
    if (node.id === s920RootId) return node.parentId === undefined;
    if (!node.parentId || !node.direction || !ids.has(node.parentId))
      return false;
    return s920PathToNode(node.id).length > 0;
  });
}
