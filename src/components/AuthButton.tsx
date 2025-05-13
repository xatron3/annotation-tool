"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    // Push route to the da
    const router = useRouter();
    router.push("/dashboard");

    return (
      <>
        <img
          src={session.user?.image || ""}
          alt="User Avatar"
          className="rounded-full w-8 h-8 mr-2"
        />
        {session.user?.name}
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return <button onClick={() => signIn("github")}>Sign in with GitHub</button>;
}
