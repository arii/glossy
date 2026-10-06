import React from "react";

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
  eyebrowProps?: React.HTMLAttributes<HTMLParagraphElement> & Record<string, unknown>;
  titleProps?: React.HTMLAttributes<HTMLHeadingElement> & Record<string, unknown>;
  metadataProps?: React.HTMLAttributes<HTMLParagraphElement> & Record<string, unknown>;
  className?: string;
  containerClassName?: string;
}

export function PageHeader({
  eyebrow,
  title,
  actions,
  metadata,
  eyebrowProps,
  titleProps,
  metadataProps,
  className = "",
  containerClassName = "max-w-7xl",
}: PageHeaderProps) {
  return (
    <header
      className={`${containerClassName} mx-auto px-6 pt-10 pb-8 border-b border-stone-300/60 mb-8 ${className}`.trim()}
    >
      {eyebrow && (
        <p
          className="text-[11px] font-mono tracking-widest uppercase text-stone-500 mb-2"
          {...eyebrowProps}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
        <h1
          className="font-serif text-3xl md:text-4xl font-normal text-stone-900 leading-tight tracking-tight"
          {...titleProps}
        >
          {title}
        </h1>
        {actions && (
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
      {metadata && (
        <p
          className="text-xs text-stone-500 mt-2 font-serif italic"
          {...metadataProps}
        >
          {metadata}
        </p>
      )}
    </header>
  );
}
