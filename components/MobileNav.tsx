"use client";

import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import Image from "next/image";
import Link from "next/link";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="sm:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex items-center justify-center">
            <Image
              src="/icons/hamburger.svg"
              width={26}
              height={26}
              alt="menu"
              className="cursor-pointer"
            />
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="
            w-65
            border-none
            bg-[#171717]
            px-5 py-6
            text-white
          "
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Mobile Navigation</SheetTitle>
          </SheetHeader>

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/icons/logo.svg"
              width={38}
              height={38}
              alt="PLEXUS LOGO"
            />

            <p className="text-2xl font-bold tracking-wide">
              PLEXUS
            </p>
          </Link>

          <div className="mt-10 flex flex-col gap-3">
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.route ||
                pathname.startsWith(`${link.route}/`);

              return (
                <SheetClose asChild key={link.route}>
                  <Link
                    href={link.route}
                    className={`
                      flex items-center gap-4
                      rounded-xl
                      px-4 py-3
                      transition-all duration-200
                      hover:bg-[#252525]
                      ${
                        isActive
                          ? "bg-blue-500 shadow-md"
                          : ""
                      }
                    `}
                  >
                    <Image
                      src={link.imgUrl}
                      alt={link.label}
                      width={22}
                      height={22}
                      className="object-contain"
                    />

                    <p className="text-sm font-medium">
                      {link.label}
                    </p>
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;