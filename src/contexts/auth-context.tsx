"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "resident" | "associate" | "marketing" | "events" | "finance" | "vice-president" | "president" | "community-manager" | "alumni";

interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    standoutSkill: string | null;
    onboarded?: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    needsOnboarding: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: data.displayName || firebaseUser.displayName,
                            photoURL: data.photoURL || firebaseUser.photoURL,
                            role: (data.role as UserRole) || "resident",
                            standoutSkill: data.standoutSkill || null,
                            onboarded: data.onboarded === true,
                        });
                        setNeedsOnboarding(data.onboarded !== true);
                    } else {
                        // User exists in Auth but not Firestore yet — create stub doc
                        try {
                            await setDoc(doc(db, "users", firebaseUser.uid), {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || null,
                                displayName: firebaseUser.displayName || null,
                                photoURL: firebaseUser.photoURL || null,
                                role: "resident",
                                onboarded: false,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                            }, { merge: true });
                        } catch {
                            // May fail if rules not set up yet
                        }

                        setProfile({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            role: "resident",
                            standoutSkill: null,
                            onboarded: false,
                        });
                        setNeedsOnboarding(true);
                    }
                } catch {
                    setProfile({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        role: "resident",
                        standoutSkill: null,
                    });
                }
            } else {
                setProfile(null);
                setNeedsOnboarding(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setProfile(null);
    };

    const refreshProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfile({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: data.displayName || currentUser.displayName,
                    photoURL: data.photoURL || currentUser.photoURL,
                    role: data.role || "member",
                    standoutSkill: data.standoutSkill || null,
                    onboarded: data.onboarded === true,
                });
                setNeedsOnboarding(data.onboarded !== true);
            }
        } catch (err) {
            console.error("Failed to refresh profile:", err);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                needsOnboarding,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Safe version for public pages — returns null values instead of throwing
export function useOptionalAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        return {
            user: null,
            profile: null,
            loading: false,
            needsOnboarding: false,
            signInWithGoogle: async () => { },
            signInWithEmail: async () => { },
            signUpWithEmail: async () => { },
            signOut: async () => { },
            refreshProfile: async () => { },
        } as AuthContextType;
    }
    return context;
}
