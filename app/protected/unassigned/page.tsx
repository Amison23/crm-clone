"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinTenantWithCode } from "@/app/actions/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UnassignedPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    const result = await joinTenantWithCode(inviteCode.trim());
    setIsLoading(false);

    if (result.success) {
      toast.success("Successfully joined the organization!");
      router.push("/protected");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to join. Check your code.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      <div className="w-full max-w-md">
        <Card className="border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-500/10">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto size-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">vpn_key</span>
            </div>
            <CardTitle className="text-2xl font-black">Join your team</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              You aren't linked with any organization yet. Enter an invite code from your admin to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2 text-center">
                <Label htmlFor="code" className="sr-only">Invite Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="e.g. 8A3F9K"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  className="text-center text-2xl font-black tracking-widest uppercase h-14 bg-slate-50 dark:bg-slate-900 border-2 focus-visible:ring-indigo-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                disabled={isLoading || !inviteCode}
              >
                {isLoading ? "Verifying..." : "Join Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
