"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-7xl">
        <SignUpForm />
      </div>
    </div>
  );
}
