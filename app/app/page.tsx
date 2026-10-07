import type { Metadata } from "next";
import { AccountCard } from "@/components/app/AccountCard";
import { SendPanel } from "@/components/app/SendPanel";
import { SignerPanel } from "@/components/app/SignerPanel";

export const metadata: Metadata = {
  title: "Dashboard · Cinnamon Wallet",
};

export default function AppPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 py-16">
      <h1 className="font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-none tracking-tight">
        Your wallet
      </h1>
      <SignerPanel />
      <AccountCard />
      <SendPanel />
    </main>
  );
}
