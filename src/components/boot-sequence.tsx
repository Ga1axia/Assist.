"use client";

import { useEffect, useState } from "react";
import { Code2 } from "lucide-react";

export function BootSequence() {
    const [stage, setStage] = useState<"booting" | "glitching" | "opening" | "complete">("booting");

    useEffect(() => {
        // Stage 1: Initial black screen with scanlines, connecting... (0.5s)
        const t1 = setTimeout(() => {
            // Stage 2: Violent glitch phase (1.0s)
            setStage("glitching");
        }, 500);

        const t2 = setTimeout(() => {
            // Stage 3: TV Screen opening (0.5s)
            setStage("opening");
        }, 1500);

        const t3 = setTimeout(() => {
            // Stage 4: Unmount
            setStage("complete");
        }, 2100);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    if (stage === "complete") return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden pointer-events-none`}>

            {/* TV Screen Halves (Parts from the middle up and down) */}
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-background z-10 transition-transform duration-500 ease-in-out border-b-2 border-primary/20 ${stage === "opening" ? "-translate-y-full" : "translate-y-0"}`} />
            <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-background z-10 transition-transform duration-500 ease-in-out border-t-2 border-primary/20 ${stage === "opening" ? "translate-y-full" : "translate-y-0"}`} />

            {/* Glowing TV line in the middle that flashes right before opening */}
            <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-primary z-20 transition-all duration-300 shadow-[0_0_20px_var(--primary)] ${stage === "opening" ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100 hidden"}`} style={{ display: stage === 'glitching' ? 'block' : 'none' }} />

            {/* Boot Content Layer */}
            <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-200 ${stage === "glitching" ? "animate-pulse" : ""} ${stage === "opening" ? "opacity-0 scale-110 blur-md" : "opacity-100"}`}>
                {/* Background Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-20 scanlines" />

                {/* Grid overlay */}
                <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

                {/* Top Left Erratic Status */}
                <div className="absolute top-4 left-4 font-mono text-[10px] sm:text-xs text-primary/70 flex flex-col gap-1 uppercase tracking-widest">
                    {stage === "booting" && (
                        <span className="animate-pulse">ESTABLISHING SECURE HANDSHAKE...</span>
                    )}
                    {stage === "glitching" && (
                        <>
                            <span className="text-chart-1 glitch-text" data-text="ERR: CHROMA_DESYNC">ERR: CHROMA_DESYNC</span>
                            <span className="text-chart-1">FORCING CONNECTION...</span>
                            <span>DATA INTEGRITY: <span className="text-destructive">14%</span></span>
                        </>
                    )}
                </div>

                {/* Main Center Logo - Static during booting, violent during glitching */}
                <div className="relative z-10 flex flex-col items-center">
                    {stage === "booting" ? (
                        // Clean booting logo
                        <div className="flex items-center justify-center mb-6 opacity-50">
                            <div className="w-24 h-24 border-2 border-primary/50 flex items-center justify-center rounded-none relative">
                                <Code2 className="w-12 h-12 text-primary/50" />
                                <div className="absolute inset-0 border-[4px] border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : (
                        // Glitching logo
                        <div className="relative mb-6 scale-125 transition-transform duration-100">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
                            <div className="w-32 h-32 border-4 border-chart-1 bg-background/50 flex flex-col items-center justify-center relative glitch-text mix-blend-difference" data-text="CODE OS">
                                <Code2 className="w-16 h-16 text-primary mb-2 mix-blend-exclusion" />
                                <span className="font-black tracking-tighter text-xl">OS_V1.0</span>
                            </div>
                            {/* Random glitch bars around logo */}
                            <div className="absolute -left-10 top-4 w-4 h-1 bg-chart-2 animate-ping" />
                            <div className="absolute -right-8 bottom-4 w-6 h-2 bg-primary glitch-anim-1" style={{ animationDuration: '0.2s' }} />
                            <div className="absolute top-full mt-4 bg-chart-1 text-chart-1-foreground text-[10px] font-mono px-2 py-1 font-black transform -rotate-2">
                                UPLINK SEVERED. REBOOTING...
                            </div>
                        </div>
                    )}
                </div>

                {/* Horizontal sweeping scan bar during glitch */}
                {stage === "glitching" && (
                    <div
                        className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-transparent via-primary/30 to-transparent pointer-events-none opacity-50"
                        style={{
                            animation: 'slideDown 0.5s infinite linear'
                        }}
                    />
                )}
            </div>

            {/* Add a quick keyframe for the sweeping bar specifically for this component if needed, or rely on tailwind arbitrary */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes slideDown {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
        }
      `}} />
        </div>
    );
}
