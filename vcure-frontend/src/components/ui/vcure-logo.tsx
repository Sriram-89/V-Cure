"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "dark" | "light";
}

export function VCureSymbolLogo({ className = "h-10 w-10", size }: LogoProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <img
      src="/assets/vcure-official-symbol.png"
      alt="V-Cure Symbol"
      className={`inline-block object-contain ${className}`}
      style={style}
    />
  );
}

export function VCureWordmarkLogo({ className = "h-8 w-auto", size, variant = "dark" }: LogoProps) {
  const style = size ? { height: `${size}px` } : undefined;
  const src = variant === "light" ? "/assets/vcure-official-wordmark-light.png" : "/assets/vcure-official-wordmark.png";

  return (
    <img
      src={src}
      alt="V-Cure"
      className={`inline-block object-contain ${className}`}
      style={style}
    />
  );
}
