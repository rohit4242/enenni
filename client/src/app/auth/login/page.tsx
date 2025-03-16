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
      const { data, message } = await loginUser({ email: values.email, password: values.password });

      if (data.user.isTwoFactorEnabled) {
        setEmail(values.email);
        setShowTwoFactor(true);
      } else {
        // Check if email is verified
        console.log("data.user.emailVerified", data.user.emailVerified);
        
        // Set email_verified cookie based on verification status
        if (data.user.emailVerified) {
          Cookies.set("email_verified", "true", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: 30 // 30 days
          });
        } else {
          Cookies.set("email_verified", "false", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: 30 // 30 days
          });
        }
        
        if (data.user.emailVerified == null) {
          router.push("/auth/verify-email");
        } else {
          // Successful login without 2FA
          console.log("Login successful, redirecting to dashboard");
          // Invalidate the auth query to refresh user data
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Login submission error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const code = (e.currentTarget.elements.namedItem("code") as HTMLInputElement).value;

    try {
      const response = await verifyTwoFactor({ email, code });
      console.log("Login successful, redirecting to dashboard");
      
      // Set email_verified cookie based on verification status
      if (response.data.user.emailVerified) {
        Cookies.set("email_verified", "true", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
      } else {
        Cookies.set("email_verified", "false", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
      }
      
      // Invalidate the auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      if (!response.data.user.emailVerified) {
        router.push("/auth/verify-email");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid verification code");
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
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
