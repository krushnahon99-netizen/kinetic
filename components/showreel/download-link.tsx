"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

const REEL_HREF = "/showreel/showreel.mp4";
const REEL_FILENAME = "krushna-hon-showreel-2026.mp4";

type DownloadLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "download">;

export function DownloadLink({ onClick, ...props }: DownloadLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // The v0 preview iframe is sandboxed without allow-downloads, so Chrome fails <a download>
    // there. A top-level tab receives the attachment header from next.config and saves the file.
    if (event.defaultPrevented || window.self === window.top) return;
    event.preventDefault();
    window.open(REEL_HREF, "_blank", "noopener");
  }

  return <a {...props} href={REEL_HREF} download={REEL_FILENAME} onClick={handleClick} />;
}
