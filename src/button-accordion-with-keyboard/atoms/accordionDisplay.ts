import { atom, useAtom, useAtomValue } from "jotai";

export type AccordionDisplayMode = "left" | "right";

const accordionDisplayModeAtom = atom<AccordionDisplayMode>("right");

export const useAccordionDisplayMode = () => {
  return useAtom(accordionDisplayModeAtom);
};

export const useAccordionDisplayModeValue = () => {
  return useAtomValue(accordionDisplayModeAtom);
};
