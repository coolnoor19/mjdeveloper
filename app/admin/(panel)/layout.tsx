import { AdminShell } from "@/components/admin/AdminShell";

// Access is checked in proxy.ts (pages) and again in every /api/admin route (data).
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
