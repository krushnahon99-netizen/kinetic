import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function DemoHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 font-mono text-[11px] uppercase tracking-[0.2em] sm:px-6 lg:px-8">
        <p className="flex items-center gap-2.5 text-bone">
          <span aria-hidden="true" className="size-2 bg-signal" />
          <span>
            Krushna Hon<span className="hidden sm:inline"> — KH fill demo</span>
          </span>
        </p>
        <p className="hidden text-muted-foreground md:block">Ending study · not in the reel yet</p>
        <Link
          href="/"
          className="flex items-center gap-2 text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Full reel
        </Link>
      </div>
    </header>
  );
}
