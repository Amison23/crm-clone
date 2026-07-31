"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface MFAChallengeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function MFAChallengeForm({ onCancel, onSuccess }: MFAChallengeFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      
      const totpFactor = factors.totp[0];
      if (!totpFactor) throw new Error("No TOTP factor found");

      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;
      
      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code,
      });
      
      if (verify.error) throw verify.error;
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Please enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
