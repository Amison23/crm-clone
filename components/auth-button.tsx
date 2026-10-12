import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Link 
        href="/auth/login" 
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Login
      </Link>
    </div>
  );
}
