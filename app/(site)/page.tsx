import { Suspense } from "react";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Facts } from "@/components/site/Facts";
import { Highlights } from "@/components/site/Highlights";
import { Services } from "@/components/site/Services";
import { ProjectsSection, ProjectsSkeleton } from "@/components/site/ProjectsSection";
import { Process } from "@/components/site/Process";
import { About } from "@/components/site/About";
import { Faq } from "@/components/site/Faq";
import { Contact } from "@/components/site/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Facts />
      <Highlights />
      <Services />
      {/* Everything else is static and prerendered; only the project list waits on the database. */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsSection />
      </Suspense>
      <Process />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
