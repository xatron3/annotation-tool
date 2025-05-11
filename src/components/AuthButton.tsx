"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();
  console.log("Session data:", session);

  if (session) {
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
