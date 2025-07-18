"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  username?: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, username: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.emailVerified) {
        setUser(null);
        setUsername(null);
      } else if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch username from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || userDoc.data().displayName || "");
          } else {
            setUsername(firebaseUser.displayName || "");
          }
        } catch {
          setUsername(firebaseUser.displayName || "");
        }
      } else {
        setUser(null);
        setUsername(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, username }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
