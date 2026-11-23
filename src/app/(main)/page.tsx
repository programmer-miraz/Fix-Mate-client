import Hero from "@/components/hero";
import Services_cart from "@/components/services-cart";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Services_cart></Services_cart>
    </main>
  );
}
