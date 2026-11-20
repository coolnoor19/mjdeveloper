import { Suspense } from "react";
import { Enquiries } from "@/components/admin/Enquiries";

export const metadata = { title: "Enquiries" };

// ?status= and ?open= come from dashboard links. Reading searchParams is request-time,
// so it sits behind Suspense as Cache Components requires.
async function WithParams({ searchParams }: { searchParams: PageProps<"/admin/enquiries">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return <Enquiries initialStatus={one(sp.status)} initialOpen={one(sp.open)} />;
}

export default function Page({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <WithParams searchParams={searchParams} />
    </Suspense>
  );
}
