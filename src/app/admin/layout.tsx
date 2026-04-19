import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { SessionProvider } from "@/components/admin/SessionProvider";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNav username={session.user?.name ?? "Admin"} />
        <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">{children}</main>
      </div>
    </SessionProvider>
  );
}
