import type { PocRoot } from "./contracts";

export function mount(root: PocRoot): () => void {
  const traversalStatus = root.querySelector<HTMLOutputElement>(
    "#fragment-traversal-status",
  );
  const assemblyStatus = root.querySelector<HTMLOutputElement>(
    "#fragment-assembly-status",
  );
  const assemblyCases = ["fragment-assembly-a", "fragment-assembly-b"];
  const traversalSteps: string[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];

  for (const link of root.querySelectorAll<HTMLAnchorElement>(
    "[data-s690-step]",
  )) {
    const listener: EventListener = () => {
      const step = link.dataset.s690Step;
      if (!step) return;
      traversalSteps.push(step);
      if (traversalStatus) {
        traversalStatus.value = `native link activation: ${traversalSteps.join(" → ")}`;
      }
    };
    link.addEventListener("click", listener);
    listeners.push([link, "click", listener]);
  }

  for (const id of assemblyCases) {
    const target = root.querySelector<HTMLElement>(`#${id}`);
    if (!target) continue;
    const listener: EventListener = () => {
      target.dataset.beforematch = "observed";
      if (assemblyStatus) {
        const observed = assemblyCases.filter(
          (caseId) =>
            root.querySelector<HTMLElement>(`#${caseId}`)?.dataset
              .beforematch === "observed",
        );
        assemblyStatus.value = `native beforematch observed: ${observed.join(", ") || "none"}`;
      }
    };
    target.addEventListener("beforematch", listener);
    listeners.push([target, "beforematch", listener]);
  }

  const updateAssemblyUrls = () => {
    const base = `${location.origin}${location.pathname}`;
    for (const element of root.querySelectorAll<HTMLElement>(
      "[data-fragment-recipe]",
    )) {
      const fragment = element.dataset.fragmentRecipe;
      if (fragment) element.textContent = `${base}${fragment}`;
    }
  };
  updateAssemblyUrls();

  return () => {
    for (const [target, type, listener] of listeners) {
      target.removeEventListener(type, listener);
    }
  };
}
