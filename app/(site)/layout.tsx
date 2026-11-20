import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CallButton } from "@/components/site/CallButton";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-ink px-5 py-3 font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CallButton />
    </SmoothScroll>
  );
}
