"use client";

import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function parseWithLinks(text: string): React.ReactNode[] {
    if (!text || typeof text !== "string") return [text];
    const parts = text.split(URL_REGEX);
    return parts.map((part, i) => {
        const isUrl = /^https?:\/\//.test(part);
        if (isUrl) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80 break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

export function LinkifyText({
    children,
    className,
}: {
    children: string | undefined | null;
    className?: string;
}) {
    const text = children ?? "";
    return <span className={className}>{parseWithLinks(text)}</span>;
}
