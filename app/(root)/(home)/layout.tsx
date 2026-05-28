import React, { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plexus",
  description: "Video calling app",
  icons : {
    icon : '/icons/logo.svg'
  }
};

const HomeLayout = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="relative min-h-screen bg-[#1C1C1C]">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <section
          className="
            flex min-h-screen flex-1 flex-col
            bg-[#1C1C1C]
            px-6 pb-6 pt-28
            max-md:pb-14 sm:pb-14
          "
        >
          <div className="w-full">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;