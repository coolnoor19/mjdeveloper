import "server-only";
import { collections } from "./db";
import { toProject, type Project } from "./dto";

export async function getPublishedProjects(): Promise<Project[]> {
  const { projects } = await collections();
  const docs = await projects
    .find({ isPublished: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(48)
    .toArray();
  return docs.map(toProject);
}
