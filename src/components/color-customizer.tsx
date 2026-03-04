"use client";

import { useState, useEffect } from "react";
import { Palette, X, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_PRESETS = [
    { name: "Lime", value: "oklch(0.88 0.23 118)", hex: "#cbf702" },
    { name: "Cyan", value: "oklch(0.78 0.14 200)", hex: "#4dd4e6" },
    { name: "Violet", value: "oklch(0.62 0.22 290)", hex: "#8b5cf6" },
    { name: "Rose", value: "oklch(0.68 0.20 10)", hex: "#f43f5e" },
    { name: "Amber", value: "oklch(0.80 0.16 75)", hex: "#f59e0b" },
    { name: "Teal", value: "oklch(0.70 0.15 175)", hex: "#14b8a6" },
    { name: "Blue", value: "oklch(0.65 0.18 250)", hex: "#3b82f6" },
    { name: "Pink", value: "oklch(0.72 0.20 340)", hex: "#ec4899" },
];

const DEFAULT_ACCENT = "oklch(0.88 0.23 118)";
const STORAGE_KEY = "code-os-accent";

export function ColorCustomizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentAccent, setCurrentAccent] = useState(DEFAULT_ACCENT);

    // Load saved accent on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setCurrentAccent(saved);
            applyAccent(saved);
        }
    }, []);

    function applyAccent(value: string) {
        const root = document.documentElement;
        root.style.setProperty("--primary", value);
        root.style.setProperty("--ring", value);
        root.style.setProperty("--chart-1", value);
        root.style.setProperty("--sidebar-ring", value);
        // Dark mode sidebar primary uses the accent
        if (document.documentElement.classList.contains("dark")) {
            root.style.setProperty("--sidebar-primary", value);
        }
    }

    function selectAccent(value: string) {
        setCurrentAccent(value);
        applyAccent(value);
        localStorage.setItem(STORAGE_KEY, value);
    }

    function resetAccent() {
        setCurrentAccent(DEFAULT_ACCENT);
        applyAccent(DEFAULT_ACCENT);
        localStorage.removeItem(STORAGE_KEY);
    }

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all group"
                aria-label="Customize theme"
            >
                <Palette className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
            </button>

            {/* Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="fixed bottom-20 right-5 z-50 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Palette className="w-4 h-4 text-primary" />
                                Theme Accent
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-accent transition-colors">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Color grid */}
                        <div className="p-4">
                            <p className="text-xs text-muted-foreground mb-3">Pick an accent color for the app</p>
                            <div className="grid grid-cols-4 gap-2">
                                {ACCENT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => selectAccent(preset.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all hover:bg-accent",
                                            currentAccent === preset.value && "ring-2 ring-foreground/20 bg-accent"
                                        )}
                                        title={preset.name}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-border shadow-sm flex items-center justify-center"
                                            style={{ backgroundColor: preset.hex }}
                                        >
                                            {currentAccent === preset.value && (
                                                <Check className="w-4 h-4 text-black" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">{preset.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom hex input */}
                            <div className="mt-4 pt-3 border-t border-border">
                                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Custom hex</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        defaultValue="#cbf702"
                                        onChange={(e) => {
                                            // Convert hex to a simple oklch approximation — we use the hex directly as CSS
                                            const hex = e.target.value;
                                            const value = hex; // CSS will interpret hex correctly
                                            selectAccent(value);
                                        }}
                                        className="w-10 h-9 rounded-md border border-border cursor-pointer bg-transparent"
                                    />
                                    <button
                                        onClick={resetAccent}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Reset to Lime
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
