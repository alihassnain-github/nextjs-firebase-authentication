"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { User } from "@/types/User";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type UserContextType = {
    user: User | null
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const { currentUser } = useAuth()!;

    useEffect(() => {
        if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const unsubscribe = onSnapshot(
                userRef,
                (docSnap) => {
                    setUser(docSnap.data() as User);
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [currentUser]);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    )
}


export const getUserFormFirestore = () => useContext(UserContext);