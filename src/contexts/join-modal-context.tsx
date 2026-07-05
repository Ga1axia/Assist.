"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JoinModal } from "@/components/join-modal";

export type JoinModalView = "choose" | "newsletter" | "auth";
export type AuthMode = "signin" | "signup";

interface OpenJoinModalOptions {
    view?: JoinModalView;
    authMode?: AuthMode;
}

interface JoinModalContextType {
    isOpen: boolean;
    openJoinModal: (opts?: OpenJoinModalOptions) => void;
    closeJoinModal: () => void;
}

const JoinModalContext = createContext<JoinModalContextType | undefined>(undefined);

export function JoinModalProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<JoinModalView>("choose");
    const [authMode, setAuthMode] = useState<AuthMode>("signin");

    const openJoinModal = useCallback((opts?: OpenJoinModalOptions) => {
        setView(opts?.view ?? "choose");
        setAuthMode(opts?.authMode ?? "signin");
        setIsOpen(true);
    }, []);

    const closeJoinModal = useCallback(() => {
        setIsOpen(false);
        if (typeof window !== "undefined" && window.location.search.includes("join")) {
            router.replace("/", { scroll: false });
        }
    }, [router]);

    useEffect(() => {
        const join = searchParams.get("join");
        if (!join) return;
        if (join === "newsletter") {
            openJoinModal({ view: "newsletter" });
        } else {
            openJoinModal({ view: "auth", authMode: join === "signup" ? "signup" : "signin" });
        }
    }, [searchParams, openJoinModal]);

    return (
        <JoinModalContext.Provider value={{ isOpen, openJoinModal, closeJoinModal }}>
            {children}
            <JoinModal
                isOpen={isOpen}
                onClose={closeJoinModal}
                view={view}
                onViewChange={setView}
                authMode={authMode}
                onAuthModeChange={setAuthMode}
            />
        </JoinModalContext.Provider>
    );
}

export function useJoinModal() {
    const context = useContext(JoinModalContext);
    if (context === undefined) {
        throw new Error("useJoinModal must be used within a JoinModalProvider");
    }
    return context;
}

export function useOptionalJoinModal() {
    const context = useContext(JoinModalContext);
    if (context === undefined) {
        return {
            isOpen: false,
            openJoinModal: () => {},
            closeJoinModal: () => {},
        };
    }
    return context;
}
