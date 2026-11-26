"use client";

import Image from "next/image";
import { useState } from "react";

type UserAvatarProps = {
  name?: string;
  image?: string;
  size?: number;
  className?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ML";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// A single avatar treatment keeps profile photos consistent in the header and dashboard.
export function UserAvatar({ name = "", image, size = 36, className = "" }: UserAvatarProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const showImage = Boolean(image) && failedImage !== image;

  return (
    <span
      className={`user-avatar ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.32)) }}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={image as string}
          alt=""
          width={size}
          height={size}
          unoptimized
          onError={() => setFailedImage(image ?? null)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </span>
  );
}
