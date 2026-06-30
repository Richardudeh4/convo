import { Session, User } from "@supabase/supabase-js"
import { createContext, useContext } from "react";

type AuthContextType = {
    session : Session | null; 
    user: User | null; 
    profile : any | null;
    loading: boolean;
    isAdmin: boolean; 
    isPremium: boolean;
    premiumExpiresAt: string | null;
    refreshProfile : () => Promise<void>;
    refreshRank: () => Promise<void>;
    /** 0=A1, 1=A2, 2=B1, 3=B2, 4=C1 — computed locally from lesson progress */
    rank: number;
};

export const AuthContext = createContext<AuthContextType>({
    session :null, 
    user: null, 
    profile : null,
    loading: true,
    isAdmin: false,
    isPremium: false,
    premiumExpiresAt:  null,
    refreshProfile : async () => {},
    refreshRank: async () => {},
    rank: 0,
});

export const useAuth = () => useContext(AuthContext);