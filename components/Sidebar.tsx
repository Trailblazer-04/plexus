"use client";

import React from "react";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser, UserButton } from "@clerk/nextjs";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  return (
    <aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-[220px] flex-col border-r border-white/[0.05] bg-[#07070d] max-sm:hidden">

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20">
          Navigation
        </p>

        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route || pathname.startsWith(`${link.route}/`);

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-500" />
              )}

              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-blue-500/20"
                    : "bg-white/[0.04] group-hover:bg-white/[0.07]"
                }`}
              >
                <Image
                  src={link.imgURL}
                  alt=""
                  width={14}
                  height={14}
                  className={`transition-opacity duration-150 ${
                    isActive ? "opacity-100" : "opacity-40 group-hover:opacity-60"
                  }`}
                />
              </span>

              <span className="text-[13px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {isSignedIn && (
        <div className="border-t border-white/[0.05] p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-white/[0.04]">
            <UserButton />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white/80">
                {user?.fullName ?? "Account"}
              </p>
              <p className="truncate text-[11px] text-white/30">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;