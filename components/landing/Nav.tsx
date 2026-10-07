import { ButtonLink } from "@/components/Button";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4">
      <nav aria-label="Main" className="mx-auto flex max-w-3xl items-center justify-between rounded-chip bg-surface/85 py-1.5 pr-1.5 pl-5 outline-cel shadow-soft backdrop-blur-md">
        <span className="font-display text-xl font-semibold">Cinnamon</span>
        <ButtonLink href="/app" className="min-h-10 px-4 text-base">
          Open the app
        </ButtonLink>
      </nav>
    </header>
  );
}
