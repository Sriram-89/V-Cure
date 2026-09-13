"use client";

import React from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  src,
  name,
  size = "md",
  className = "",
  onClick
}: UserAvatarProps) {
  const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : "U";

  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-16 w-16 text-2xl",
    xl: "h-24 w-24 text-4xl"
  };

  const containerClasses = `relative flex shrink-0 items-center justify-center rounded-full overflow-hidden font-bold shadow-md transition-all ${
    sizeClasses[size]
  } ${src ? "bg-gray-100 border border-gray-200" : "bg-emerald-600 text-white"} ${className}`;

  return (
    <div className={containerClasses} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={name || "User avatar"}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
