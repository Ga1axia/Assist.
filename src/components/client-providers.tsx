"use client";

import { Suspense } from "react";
import { JoinModalProvider } from "@/contexts/join-modal-context";
import { NewsletterPopup } from "@/components/newsletter-popup";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <JoinModalProvider>
                {children}
                <NewsletterPopup />
            </JoinModalProvider>
        </Suspense>
    );
}
