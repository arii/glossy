"use client";

import React, { ReactNode } from "react";

export interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  badge?: ReactNode;
  variant?: "standard" | "split";
  eyebrowDataTinaField?: string;
  titleDataTinaField?: string;
  descriptionDataTinaField?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  badge,
  variant = "standard",
  eyebrowDataTinaField,
  titleDataTinaField,
  descriptionDataTinaField,
  className = "",
  style,
}: PageHeroProps) {
  const isSplit = variant === "split" || !!aside;

  return (
    <section
      className={`page-hero ${isSplit ? "page-hero-split" : "page-hero-standard"} ${className}`}
      style={style}
    >
      {isSplit ? (
        <div className="page-hero-split-grid">
          <div className="page-hero-main">
            {(eyebrow || badge) && (
              <div className="page-hero-top-row">
                {eyebrow && (
                  <p
                    className="page-hero-eyebrow"
                    data-tina-field={eyebrowDataTinaField}
                  >
                    {eyebrow}
                  </p>
                )}
                {badge && <div className="page-hero-badge">{badge}</div>}
              </div>
            )}

            <h1
              className="page-hero-title"
              data-tina-field={titleDataTinaField}
            >
              {title}
            </h1>

            {description && (
              <div
                className="page-hero-description"
                data-tina-field={descriptionDataTinaField}
              >
                {typeof description === "string" ? <p>{description}</p> : description}
              </div>
            )}

            {actions && <div className="page-hero-actions">{actions}</div>}
          </div>

          {aside && <div className="page-hero-aside">{aside}</div>}
        </div>
      ) : (
        <div className="page-hero-container">
          <div className="page-hero-main">
            {(eyebrow || badge) && (
              <div className="page-hero-top-row">
                {eyebrow && (
                  <p
                    className="page-hero-eyebrow"
                    data-tina-field={eyebrowDataTinaField}
                  >
                    {eyebrow}
                  </p>
                )}
                {badge && <div className="page-hero-badge">{badge}</div>}
              </div>
            )}

            <h1
              className="page-hero-title"
              data-tina-field={titleDataTinaField}
            >
              {title}
            </h1>

            {description && (
              <div
                className="page-hero-description"
                data-tina-field={descriptionDataTinaField}
              >
                {typeof description === "string" ? <p>{description}</p> : description}
              </div>
            )}

            {actions && <div className="page-hero-actions">{actions}</div>}
          </div>
        </div>
      )}
    </section>
  );
}
