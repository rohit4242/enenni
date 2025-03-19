"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser, verifyTwoFactor } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [email, setEmail] = useState("");
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response.status === "error") {
        if (response.error === "Two factor authentication required") {
          setTwoFactorEmail(values.email);
          setShowTwoFactor(true);
          setIsLoading(false);
          return;
        }

        setError(response.error);
        setIsLoading(false);
        return;
      }

      // Set auth stage cookie based on verification status
      if (!response.data.user.emailVerified) {
        // User needs email verification
        Cookies.set("auth_stage", "registered", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        Cookies.set("email_verified", "false", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
      } else {
        // Email is verified, set appropriate cookies
        Cookies.set("email_verified", "true", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        Cookies.set("auth_stage", "email_verified", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        // Reset login verification state
        Cookies.set("login_verified", "false", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 1 // 1 day
        });
      }
      
      // Store user email in a cookie for middleware to use
      Cookies.set("user_email", values.email, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: 30 // 30 days
      });
      
      // Invalidate the auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      if (!response.data.user.emailVerified) {
        // If email not verified, redirect to email verification
        router.push("/auth/verify-email");
      } else {
        // If email verified, redirect to login verification
        router.push(`/auth/login-verification?email=${values.email}`);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyTwoFactor({
        email: twoFactorEmail,
        code: twoFactorCode,
      });

      if (response.status === "error") {
        setError(response.error);
        setIsLoading(false);
        return;
      }
      
      console.log("Login successful, redirecting to verification");
      
      // Set auth stage cookie based on verification status
      if (!response.data.user.emailVerified) {
        // User needs email verification
        Cookies.set("auth_stage", "registered", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        Cookies.set("email_verified", "false", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
      } else {
        // Email is verified, update cookies
        Cookies.set("email_verified", "true", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        Cookies.set("auth_stage", "email_verified", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        // Login verification needed
        Cookies.set("login_verified", "false", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 1 // 1 day
        });
      }
      
      // Store user email in a cookie for middleware to use
      Cookies.set("user_email", twoFactorEmail, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: 30 // 30 days
      });
      
      // Invalidate the auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      if (!response.data.user.emailVerified) {
        router.push("/auth/verify-email");
      } else {
        // Redirect to login verification after 2FA
        router.push(`/auth/login-verification?email=${twoFactorEmail}`);
      }
    } catch (err: any) {
      console.error("Two-factor verification error:", err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showTwoFactor) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-gray-500">Please enter the code from your authenticator app</p>
        </div>

        {error && (
          <Alert variant="destructive" className="border border-destructive/30">
            <AlertDescription className="font-medium flex items-center gap-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">Verification Code</label>
            <Input
              id="code"
              name="code"
              placeholder="000000"
              required
              maxLength={6}
              pattern="\d{6}"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Login to Your Account</h1>
        <p className="text-gray-500">Enter your credentials to access your account</p>
      </div>

      {error && (
        <Alert variant="destructive" className="border border-destructive/30">
          <AlertDescription className="font-medium flex items-center gap-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm text-right">
            <Link href="/auth/reset" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
