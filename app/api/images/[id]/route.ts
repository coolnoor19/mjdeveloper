import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { error, handle, parseId } from "@/lib/http";

/** Streams a project photo from GridFS. File ids never change, so browsers may cache them for a year. */
export const GET = handle(async (_req: NextRequest, ctx: RouteContext<"/api/images/[id]">) => {
  const id = parseId((await ctx.params).id);
  if (!id) return error("Not found.", 404);
  const { images } = await collections();
  const file = await images.find({ _id: id }).next();
  if (!file) return error("Not found.", 404);

  const stream = Readable.toWeb(images.openDownloadStream(id)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": (file.metadata?.contentType as string) || "application/octet-stream",
      "Content-Length": String(file.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
