import React from "react";
import Link from "next/link";
import Image from "next/image";
import MobileNav from "./MobileNav";

const Navbar = () => {
  return (
    <nav
      className="
        fixed top-0 z-50
        flex w-full items-center justify-between
        bg-[#171717]
        px-6 py-3
        lg:px-10
        border-b border-[#252525]
      "
    >
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/icons/logo.svg"
          width={40}
          height={40}
          alt="PLEXUS LOGO"
          className="object-contain"
        />

        <p className="text-3xl font-extrabold text-white max-sm:hidden">
          PLEXUS
        </p>
      </Link>

      <div className="flex items-center gap-5">
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;