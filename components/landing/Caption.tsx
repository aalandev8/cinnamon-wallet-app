/** Small technical footnote; the only place protocol names appear. */
export function Caption({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-xs tracking-wide text-muted ${className}`}>
      <span aria-hidden className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-highlight align-middle" />
      {children}
    </p>
  );
}
