import { atom, useAtomValue, useSetAtom } from "jotai";

type AccordionMode = "dual" | "left" | "right";

const accordionModeAtom = atom<AccordionMode>("right");
export const useAccordionModeValue = () => {
  return useAtomValue(accordionModeAtom);
};
export const useSetAccordionMode = () => {
  return useSetAtom(accordionModeAtom);
};

const leftHandKeyboardAtom = atom<HIDDevice | null>(null);
export const useLeftHandKeyboardValue = () => {
  return useAtomValue(leftHandKeyboardAtom);
};
export const useSetLeftHandKeyboard = () => {
  return useSetAtom(leftHandKeyboardAtom);
};

const rightHandKeyboardAtom = atom<HIDDevice | null>(null);
export const useRightHandKeyboardValue = () => {
  return useAtomValue(rightHandKeyboardAtom);
};
export const useSetRightHandKeyboard = () => {
  return useSetAtom(rightHandKeyboardAtom);
};
