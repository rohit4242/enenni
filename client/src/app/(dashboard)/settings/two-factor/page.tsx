"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthGuard } from "@/components/auth/auth-guard";
import { disableTwoFactor, enableTwoFactor } from "@/lib/api/user";
import Image from "next/image";
export default function TwoFactorPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await enableTwoFactor();
      setQrCode(data.data.qrCode);
      setIsEnabling(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await disableTwoFactor(); // This API endpoint is used to confirm 2FA setup too
      await refreshUser();
      setSuccess("Two-factor authentication enabled successfully");
      setIsEnabling(false);
      setQrCode(null);
      setCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisable = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await disableTwoFactor();
      await refreshUser();
      setSuccess("Two-factor authentication disabled successfully");
      setCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Two-Factor Authentication</h1>
        
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {user?.isTwoFactorEnabled && !isEnabling ? (
          <div className="space-y-6">
            <p>Two-factor authentication is currently enabled.</p>
            
            <form onSubmit={handleDisable} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-1">
                  Enter verification code to disable 2FA
                </label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  className="w-40"
                />
              </div>
              
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </form>
          </div>
        ) : isEnabling ? (
          <div className="space-y-6">
            <p>Scan this QR code with your authenticator app:</p>
            
            {qrCode && (
              <div className="bg-white p-4 inline-block">
                <Image src={qrCode} alt="QR Code" fill />
              </div>
            )}
            
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-1">
                  Enter verification code from your app
                </label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  className="w-40"
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify and Enable"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <p>
              Two-factor authentication adds an extra layer of security to your account.
              When enabled, you&apos;ll need to enter a code from your authenticator app
              when signing in.
            </p>
            
            <Button onClick={handleEnable} disabled={isLoading}>
              {isLoading ? "Setting up..." : "Set Up Two-Factor Authentication"}
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 