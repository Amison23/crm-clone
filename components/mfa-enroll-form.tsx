"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export function MFAEnrollForm() {
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    // Check if already enrolled
    const checkEnrollment = async () => {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        console.error("Error checking MFA status", error);
        return;
      }
      if (data.currentLevel === "aal2" || data.nextLevel === "aal2") {
        setIsEnrolled(true);
      }
    };
    checkEnrollment();
  }, [supabase.auth.mfa]);

  const handleEnroll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      
      if (error) throw error;
      
      setFactorId(data.id);
      // Supabase returns the QR code as an SVG string
      setQrCode(data.totp.qr_code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });
      
      if (verify.error) throw verify.error;
      
      toast.success("Two-Factor Authentication successfully enabled!");
      setIsEnrolled(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      for (const factor of data.totp) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      
      setIsEnrolled(false);
      setFactorId("");
      setQrCode("");
      toast.success("MFA has been disabled.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isEnrolled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>MFA is currently enabled for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleUnenroll} disabled={isLoading}>
            {isLoading ? "Disabling..." : "Disable 2FA"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security by enabling 2FA using an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!qrCode ? (
          <Button onClick={handleEnroll} disabled={isLoading}>
            {isLoading ? "Generating..." : "Enable 2FA"}
          </Button>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex justify-center p-4 bg-white rounded-md">
               <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-48 h-48" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
            </p>
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading || verifyCode.length !== 6}>
              {isLoading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
