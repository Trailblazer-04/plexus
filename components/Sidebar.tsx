"use client";

import React from "react";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen flex-col justify-between bg-[#171717] 
        px-4 py-6 pt-24 text-white max-sm:hidden w-65">
      <div className="flex flex-1 flex-col gap-4">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route ||
            pathname.startsWith(`${link.route}/`);

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`
                flex items-center gap-4
                rounded-xl
                px-4 py-3
                transition-all duration-200
                hover:bg-[#252525]
                ${
                  isActive
                    ? "bg-blue-500 shadow-lg"
                    : "bg-transparent"
                }
              `}
            >
              <Image
                src={link.imgUrl}
                alt={link.label}
                width={24}
                height={24}
                className="object-contain"
              />

              <p className="text-base font-medium">
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;