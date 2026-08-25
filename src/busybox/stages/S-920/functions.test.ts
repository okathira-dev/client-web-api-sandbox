import {
  s920ChildNodes,
  s920GoalNodes,
  s920MazeIsValid,
  s920MazeNodes,
  s920PathToNode,
  s920RootId,
} from "./functions";

describe("S-920 popover maze", () => {
  it("keeps three distinct reachable goal popovers in a finite tree", () => {
    expect(s920MazeIsValid()).toBe(true);
    expect(s920GoalNodes).toHaveLength(3);
    for (const goal of s920GoalNodes) {
      const path = s920PathToNode(goal.id);
      expect(path[0]?.id).toBe(s920RootId);
      expect(path.at(-1)?.boxId).toBe(goal.boxId);
      expect(new Set(path.map((node) => node.id)).size).toBe(path.length);
    }
  });

  it("keeps three choices in every room that is not a dead end or a goal", () => {
    const roomNodes = s920MazeNodes.filter(
      (node) => node.boxId === undefined && s920ChildNodes(node.id).length > 0,
    );
    expect(roomNodes.length).toBeGreaterThan(0);
    for (const node of roomNodes) {
      expect(s920ChildNodes(node.id)).toHaveLength(3);
    }
  });

  it("gives each goal a distinct route shape and distance", () => {
    const paths = s920GoalNodes.map((goal) => s920PathToNode(goal.id));
    const hopCounts = paths
      .map((path) => path.length - 1)
      .sort((a, b) => a - b);
    const shapes = paths.map((path) =>
      path
        .slice(1)
        .map((node) => node.direction)
        .join(":"),
    );

    expect(hopCounts).toEqual([4, 6, 7]);
    expect(new Set(shapes).size).toBe(3);
  });
});
