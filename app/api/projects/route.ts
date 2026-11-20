import { connection } from "next/server";
import { handle, json } from "@/lib/http";
import { getPublishedProjects } from "@/lib/projects";

/** Public list of published projects. Runs per request so new projects appear immediately. */
export const GET = handle(async () => {
  await connection();
  return json({ projects: await getPublishedProjects() });
});
