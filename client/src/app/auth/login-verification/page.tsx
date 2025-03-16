"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { loginVerificationSchema } from "@/lib/validations/auth";
import { sendLoginVerificationCode, verifyLoginCode } from "@/lib/api/auth";

// Form schema for verification code
const verificationSchema = z.object({
  digit1: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
  digit2: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
  digit3: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
  digit4: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
  digit5: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
  digit6: z.string().length(1).regex(/^[0-9]$/, "Must be a number"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function LoginVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const email = searchParams.get("email");

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      digit1: "",
      digit2: "",
      digit3: "",
      digit4: "",
      digit5: "",
      digit6: "",
    },
  });

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      router.push("/auth/login");
      return;
    }

    // Send verification code on initial load
    const sendCode = async () => {
      setIsLoading(true);
      try {
        const response = await sendLoginVerificationCode(email);
        if (response.status === "error") {
          setError(response.error);
        }
      } catch (err: any) {
        setError("Failed to send verification code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    sendCode();
  }, [email, router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  // Handle input focus movement
  const handleDigitInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VerificationFormValues) => {
    const value = e.target.value;
    const isValid = /^[0-9]$/.test(value);

    if (isValid) {
      form.setValue(field, value);
      const fieldNumber = parseInt(field.replace('digit', ''));
      const nextField = `digit${fieldNumber + 1}` as keyof VerificationFormValues;

      if (nextField in form.getValues() && fieldNumber < 6) {
        const nextInput = document.querySelector(`input[name=${nextField}]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (value === '') {
      form.setValue(field, '');
    } else {
      e.preventDefault();
    }
  };

  // Handle backspace key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof VerificationFormValues) => {
    if (e.key === 'Backspace' && !form.getValues()[field]) {
      const fieldNumber = parseInt(field.replace('digit', ''));
      if (fieldNumber > 1) {
        const prevField = `digit${fieldNumber - 1}` as keyof VerificationFormValues;
        const prevInput = document.querySelector(`input[name=${prevField}]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  const onSubmit = async (data: VerificationFormValues) => {
    if (!email) return;

    setIsLoading(true);
    setError(null);

    const verificationCode =
      data.digit1 + data.digit2 + data.digit3 + data.digit4 + data.digit5 + data.digit6;

    try {
      const response = await verifyLoginCode({ email, code: verificationCode });
      
      // Check if there's an error from the API call
      if (response.status === 'error') {
        setError(response.error);
        setIsLoading(false);
        return;
      }
      
      const { data: responseData } = response;
      
      // Set login_verified cookie to indicate successful login verification
      Cookies.set("login_verified", "true", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: 1 // 1 day expiration for security
      });
      
      // Set email_verified cookie based on verification status
      if (responseData.user.emailVerified) {
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
      
      // Store user email in a cookie for middleware to use
      Cookies.set("user_email", email, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: 30 // 30 days
      });
      
      // Invalidate the auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      if (!responseData.user.emailVerified) {
        router.push("/auth/verify-email");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all digits are filled and valid
  useEffect(() => {
    const values = form.getValues();
    const allFilled = Object.values(values).every(value => value && /^[0-9]$/.test(value));

    if (allFilled && !isLoading) {
      form.handleSubmit(onSubmit)();
    }
  }, [form.watch("digit6")]);

  const handleResendCode = async () => {
    if (!email || resendDisabled) return;

    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown
    setError(null);
    setResendSuccess(null);

    try {
      const response = await sendLoginVerificationCode(email);
      if (response.status === "error") {
        setError(response.error);
      } else {
        setResendSuccess("Verification code has been sent!");
        setTimeout(() => setResendSuccess(null), 5000);
      }
    } catch (err: any) {
      setError("Failed to resend verification code. Please try again.");
    }
  };

  return (
      <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">Login Verification</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Please enter the 6-digit verification code sent to your email
              {email && <span className="font-medium"> ({email})</span>}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="border border-destructive/30 mb-4">
                <AlertDescription className="font-medium flex items-center gap-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert variant="default" className="mb-4 bg-green-50 border border-green-200 text-green-800">
                <AlertDescription className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {resendSuccess}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((digit) => {
                    const fieldName = `digit${digit}` as keyof VerificationFormValues;
                    return (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={1}
                                onChange={(e) => handleDigitInput(e, fieldName)}
                                onKeyDown={(e) => handleKeyDown(e, fieldName)}
                                autoComplete="off"
                                inputMode="numeric"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 text-white hover:bg-teal-700 transition duration-200"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => router.push("/auth/login")}
            >
              Back to Login
            </Button>
            <div className="text-sm text-center text-muted-foreground mt-2">
              Didn&apos;t receive a code?
              <Button 
                variant="link" 
                className="p-0 h-auto text-teal-600 hover:underline" 
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                {resendDisabled
                  ? `Resend code in ${countdown}s`
                  : "Request a new code"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
  );
} 