import { DailyLimit } from "@/components/landing/DailyLimit";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { PaymentJourney } from "@/components/landing/PaymentJourney";
import { Toppings } from "@/components/landing/Toppings";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <Nav />
      <main className="flex-1">
        <Hero />
        <DailyLimit />
        <Toppings />
        <PaymentJourney />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
