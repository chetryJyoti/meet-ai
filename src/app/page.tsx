"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            You are logged in!
          </h2>
          <p className="text-center text-gray-600">
            Welcome, {session.user.name || session.user.email}!
          </p>
          <Button className="mt-4 w-full" onClick={() => authClient.signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Button onClick={() => router.push("/sign-in")}>Back to auth</Button>
    </div>
  );
}
