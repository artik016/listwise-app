
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/login');
    }
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, router, pathname]);


  const signIn = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state update and redirect
    } catch (error: any) {
      console.error("Sign-in error", error);
      let description = "An unknown error occurred during sign-in.";
      
      if (error.code === 'auth/unauthorized-domain') {
        description = `This app's domain is not authorized for Firebase Auth. Please check your browser's address bar to find the current domain, and then add it to the authorized domains list in the Firebase console under Authentication > Settings. The reported domain is often similar to *.cloudworkstations.dev or *.googleusercontent.com`;
      } else if (error.code === 'auth/configuration-not-found') {
        description = "Google Sign-In is not enabled for this project. Please enable it in the Firebase console's Authentication section.";
      }

      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: description,
        duration: 9000,
      });
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle the user state update and redirect
    } catch (error: any)
       {
      console.error("Sign-out error", error);
       toast({
        variant: "destructive",
        title: "Sign-Out Failed",
        description: "Could not sign out. Please try again.",
      });
    }
  };
  
  if (loading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
      return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }


  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
