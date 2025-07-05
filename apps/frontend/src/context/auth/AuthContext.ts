import { createContext } from "react";
import type { UserProp } from "../../types/schema";

export interface AuthContextType {
  user: UserProp | null;
  accessToken: React.RefObject<string | null>;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
