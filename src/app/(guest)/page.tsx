"use client";

import { AuthButton } from "@/components/AuthButton";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <div>
      <SessionProvider>
        <AuthButton />
      </SessionProvider>
    </div>
  );
}
