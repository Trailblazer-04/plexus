import React, { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plexus",
  description: "Video calling app",
  icons: { icon: "/icons/logo.svg" },
};

const HomeLayout = async ({ children }: { children: ReactNode }) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#07070d]">
      <Navbar />
      <Sidebar />

      <main className="min-h-screen pl-0 pt-16 sm:pl-[220px]">
        <div className="px-6 py-8 md:px-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default HomeLayout;