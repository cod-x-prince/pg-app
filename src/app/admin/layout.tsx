import PageTransition from "@/components/animations/PageTransition";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
