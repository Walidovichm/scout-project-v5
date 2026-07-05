"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  name: string;
  src?: string;
  fallbackSrc?: string;
  brandColor?: string; // hex without #, e.g. "76B900"
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const sizeMap = {
  sm: "h-7 w-7 text-[12px]",
  md: "h-10 w-10 text-[15px]",
  lg: "h-12 w-12 text-[18px]",
  xl: "h-16 w-16 text-[24px]",
};

const roundMap = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

// Generate a deterministic color from a string (for fallback initials)
function colorFromString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 38%, 88%)`;
}

function getInitials(name: string): string {
  const cleaned = name
    .replace(/\b(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|LLC|PLC|AG|SE|S\.A\.|S\.p\.A\.|N\.V\.|N\.A\.|A\.S\.|Group|Holding|Holdings)\b/g, "")
    .replace(/[.,]/g, "")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Check if a URL is a SimpleIcons SVG (which needs mask-based coloring)
function isSimpleIconsSvg(url: string): boolean {
  return url.includes("cdn.jsdelivr.net/npm/simple-icons") || url.includes("cdn.simpleicons.org");
}

export function CompanyLogo({
  name,
  src,
  fallbackSrc,
  brandColor,
  size = "md",
  className,
  rounded = "md",
}: CompanyLogoProps) {
  return (
    <LogoInner
      key={`${src || "none"}|${fallbackSrc || "none"}`}
      name={name}
      src={src}
      fallbackSrc={fallbackSrc}
      brandColor={brandColor}
      size={size}
      className={className}
      rounded={rounded}
    />
  );
}

type Stage = "primary" | "fallback" | "initials";

function LogoInner({
  name,
  src,
  fallbackSrc,
  brandColor,
  size = "md",
  className,
  rounded = "md",
}: CompanyLogoProps) {
  const initialStage: Stage = src ? "primary" : fallbackSrc ? "fallback" : "initials";
  const [stage, setStage] = useState<Stage>(initialStage);
  const [loaded, setLoaded] = useState(false);

  const currentSrc =
    stage === "primary" ? src : stage === "fallback" ? fallbackSrc : null;

  // For SimpleIcons SVGs with a brand color, use CSS mask to tint the SVG
  const useMaskTinting =
    currentSrc &&
    brandColor &&
    isSimpleIconsSvg(currentSrc);

  const handleError = () => {
    if (stage === "primary" && fallbackSrc) {
      setStage("fallback");
      setLoaded(false);
    } else if (stage === "primary" || stage === "fallback") {
      setStage("initials");
      setLoaded(false);
    }
  };

  const showFallback = stage === "initials" || !currentSrc;
  const initials = getInitials(name);
  const bgColor = colorFromString(name);
  const brandHex = brandColor ? `#${brandColor}` : "var(--foreground)";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-secondary",
        sizeMap[size],
        roundMap[rounded],
        className
      )}
      aria-label={`${name} logo`}
    >
      {!showFallback && currentSrc && useMaskTinting ? (
        // Mask-based colored SVG: the SVG is used as a mask, and the
        // background-color (brand color) shows through the SVG shape.
        <div
          key={currentSrc}
          className={cn(
            "h-full w-full transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundColor: brandHex,
            WebkitMaskImage: `url(${currentSrc})`,
            maskImage: `url(${currentSrc})`,
            WebkitMaskSize: "75%",
            maskSize: "75%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
          onLoad={() => setLoaded(true)}
        >
          {/* Hidden img to detect load/error for mask */}
          <img
            src={currentSrc}
            alt=""
            className="hidden"
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        </div>
      ) : !showFallback && currentSrc ? (
        // Regular <img> for favicon PNGs and non-tinted logos
        <img
          src={currentSrc}
          alt={`${name} logo`}
          loading="lazy"
          className={cn(
            "h-full w-full object-contain p-2 transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      ) : null}
      {showFallback && (
        <div
          className="flex h-full w-full items-center justify-center font-serif font-medium text-foreground/80"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {!loaded && !showFallback && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
    </div>
  );
}
