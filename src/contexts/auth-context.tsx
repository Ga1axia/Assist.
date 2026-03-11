"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole = "resident" | "associate" | "marketing" | "events" | "finance" | "vice-president" | "president" | "community-manager" | "alumni";

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    status: "pending" | "approved" | "rejected";
    standoutSkill: string | null;
    skills?: string[];
    onboarded?: boolean;
    openToMentorship?: boolean;
    linkedin?: string | null;
}

// Minimal user shape (no Firebase dependency)
export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

const DEMO_UID = "demo-user";
const demoUser: AppUser = {
    uid: DEMO_UID,
    email: "demo@thegenerator.babson.edu",
    displayName: "Demo Member",
    photoURL: null,
};
const demoProfile: UserProfile = {
    uid: DEMO_UID,
    email: demoUser.email,
    displayName: demoUser.displayName,
    photoURL: null,
    role: "resident",
    status: "approved",
    standoutSkill: "Full-stack",
    skills: [],
    onboarded: true,
    openToMentorship: false,
    linkedin: null,
};

interface AuthContextType {
    user: AppUser | null;
    profile: UserProfile | null;
    loading: boolean;
    needsOnboarding: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    signInAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Always assume logged in with demo user so dummy data shows on frontend
    const [user, setUser] = useState<AppUser | null>(demoUser);
    const [profile, setProfile] = useState<UserProfile | null>(demoProfile);
    const [loading, setLoading] = useState(false);

    const signInAsDemo = () => {
        setUser(demoUser);
        setProfile(demoProfile);
    };

    const signInWithGoogle = async () => {
        setUser(demoUser);
        setProfile(demoProfile);
    };

    const signInWithEmail = async (_email: string, _password: string) => {
        setUser(demoUser);
        setProfile(demoProfile);
    };

    const signUpWithEmail = async (_email: string, _password: string) => {
        setUser(demoUser);
        setProfile(demoProfile);
    };

    const signOut = async () => {
        // Demo mode: stay logged in so dummy data always visible
        setUser(demoUser);
        setProfile(demoProfile);
    };

    const refreshProfile = async () => {};

    const needsOnboarding = profile ? !profile.onboarded : false;

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
                signInAsDemo,
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

export function useOptionalAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Always assume logged in so nav and public pages never show Sign In or redirect to login
        return {
            user: demoUser,
            profile: demoProfile,
            loading: false,
            needsOnboarding: false,
            signInWithGoogle: async () => {},
            signInWithEmail: async () => {},
            signUpWithEmail: async () => {},
            signOut: async () => {},
            refreshProfile: async () => {},
            signInAsDemo: () => {},
        } as AuthContextType;
    }
    return context;
}
