import { atom } from "jotai";

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

// 認証状態のatom
const authStateAtom = atom<AuthState>({
  isAuthenticated: false,
  accessToken: null,
});

// 読み取り専用atom
export const isAuthenticatedAtom = atom(
  (get) => get(authStateAtom).isAuthenticated,
);
export const accessTokenAtom = atom((get) => get(authStateAtom).accessToken);

// 書き込み用atom
export const setAuthStateAtom = atom(
  null,
  (get, set, newState: Partial<AuthState>) => {
    const currentState = get(authStateAtom);
    set(authStateAtom, { ...currentState, ...newState });
  },
);

export const clearAuthStateAtom = atom(null, (get, set) => {
  set(authStateAtom, {
    isAuthenticated: false,
    accessToken: null,
  });
});
