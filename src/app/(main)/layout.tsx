import Navbar from "@/components/navber";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar/>
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}