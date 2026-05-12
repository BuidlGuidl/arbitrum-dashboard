"use client";

import Image from "next/image";

export const ArbitrumLogo = ({ size = 64, className }: { size?: number; className?: string }) => (
  <>
    <Image
      src="/arbitrum.svg"
      alt="Arbitrum"
      width={size}
      height={size}
      className={`block dark:hidden shrink-0 ${className ?? ""}`}
    />
    <Image
      src="/arbitrum_dark.svg"
      alt="Arbitrum"
      width={size}
      height={size}
      className={`hidden dark:block shrink-0 ${className ?? ""}`}
    />
  </>
);
