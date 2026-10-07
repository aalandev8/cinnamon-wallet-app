export function Footer() {
  return (
    <footer className="border-t-2 border-outline">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row">
        <p>Cinnamon Wallet · local demo, not for real funds.</p>
        <a
          href="https://github.com/aalandev8/cinnamon-wallet-app"
          className="rounded-pill px-2 py-1 font-bold text-text underline decoration-caramel decoration-2 underline-offset-4 hover:decoration-primary"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
