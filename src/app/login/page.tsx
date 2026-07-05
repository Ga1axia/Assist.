"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy /login route — opens the join modal on the landing page. */
export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/?join=account");
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground font-mono text-xs uppercase tracking-widest">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Redirecting...
            </div>
        </div>
    );
}
