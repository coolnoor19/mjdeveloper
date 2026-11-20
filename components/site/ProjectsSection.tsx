import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { getPublishedProjects } from "@/lib/projects";
import type { Project } from "@/lib/dto";
import { ProjectsGrid } from "./ProjectsGrid";

/** Loads published projects at request time so new uploads show without a rebuild. */
export async function ProjectsSection() {
  await connection();
  let projects: Project[] = [];
  try {
    projects = await getPublishedProjects();
  } catch (err) {
    unstable_rethrow(err);
    // Keep the home page up if the database is unreachable; the grid shows its empty state.
    console.error("[projects] could not load", err);
  }
  return <ProjectsGrid projects={projects} />;
}

export function ProjectsSkeleton() {
  return (
    <section id="projects" className="wrap py-24 md:py-32" aria-busy="true">
      <div className="h-4 w-40 rounded bg-ink/10" />
      <div className="mt-6 h-14 w-full max-w-md rounded-xl bg-ink/10" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-ink/[0.07]" />
        ))}
      </div>
    </section>
  );
}
