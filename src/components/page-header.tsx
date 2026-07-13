import { cn } from "@/lib/utils";

type PageHeaderProps = {
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(0,255,65,0.18)] pb-5",
                className
            )}
        >
            <div className="min-w-0">
                {eyebrow ? <p className="etower-section-label mb-2">{eyebrow}</p> : null}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                    {title}
                </h1>
                {description ? (
                    <div className="mt-2 text-sm text-white/55 max-w-2xl leading-relaxed">{description}</div>
                ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
        </div>
    );
}
