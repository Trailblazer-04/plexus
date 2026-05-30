"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "./MobileNav";
import { useUser, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="fixed top-0 z-50 h-16 w-full">
      <div className="absolute inset-0 border-b border-white/[0.05] bg-[#07070d]/75 backdrop-blur-2xl" />

      <div className="relative flex h-full items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
            <Image src="/icons/logo.svg" width={18} height={18} alt="Plexus" className="relative z-10" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white/90 transition-colors group-hover:text-white max-sm:hidden">
            PLEXUS
          </span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-white/40">Live</span>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 sm:flex">
                <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                <span className="text-xs font-medium text-white/50">
                  {user?.firstName}
                </span>
              </div>
              <UserButton />
            </div>
          )}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;