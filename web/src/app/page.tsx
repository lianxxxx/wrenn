import { MarkerFilters } from "@/components/blob-words";
import { Demo } from "@/components/demo";
import { Faq } from "@/components/faq";
import { DownloadCta } from "@/components/download-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Templates } from "@/components/templates";

export default function Home() {
  return (
    <>
      <MarkerFilters />
      <main className="p-sm md:p-md">
        {/* Hero card (inspo: Little Bloom): nav cloud and hero inside one rounded box.
            Only the hero gets a card; other sections sit on the page background. */}
        <div className="relative overflow-hidden rounded-[28px]">
          <SiteNav />
          <Hero />
        </div>
        <HowItWorks />
        <Demo />
        <Templates />
        <Faq />
        <DownloadCta />
      </main>
      <SiteFooter />
      <RevealOnScroll />
    </>
  );
}
