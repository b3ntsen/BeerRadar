"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produkter", icon: Package },
  { href: "/admin/orders", label: "Ordrer", icon: ShoppingBag },
];

export default function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-900 text-sm mr-3">Elektro 4 Admin</span>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">{username}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logg ut</span>
          </button>
        </div>
      </div>
    </header>
  );
}
