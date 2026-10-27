#!/usr/bin/env bash
# One-shot setup for a fresh v0 / Vercel Sandbox: dependencies, Remotion's headless Chrome,
# and Chrome's system libraries (Amazon Linux 2023 lacks them: "libnspr4.so: cannot open shared object file").
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm install
pnpm exec remotion browser ensure

if command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y -q nss nspr atk at-spi2-atk cups-libs libdrm libxkbcommon libXcomposite libXdamage \
    libXrandr libXfixes libXext libX11 libxcb mesa-libgbm pango cairo alsa-lib libxshmfence dbus-libs expat
fi

echo "Sandbox ready. Render with: pnpm reel:render"
