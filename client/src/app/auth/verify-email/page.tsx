"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/context/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";
import { resendVerificationEmail, verifyEmail } from "@/lib/api/auth";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";

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

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");
  const { user, refetch } = useAuthContext();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.emailVerified) {
      router.push("/");
    }
  }, [user?.emailVerified, router]);

  // Initialize form with default values
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      digit1: code ? code[0] : "",
      digit2: code ? code[1] : "",
      digit3: code ? code[2] : "",
      digit4: code ? code[3] : "",
      digit5: code ? code[4] : "",
      digit6: code ? code[5] : "",
    },
  });

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

  // Handle form submission
  const onSubmit = async (data: VerificationFormValues) => {
    setIsVerifying(true);
    setError(null);

    const verificationCode =
      data.digit1 + data.digit2 + data.digit3 + data.digit4 + data.digit5 + data.digit6;

    try {
      const response = await verifyEmail(verificationCode, user?.email || "");

      // Check if there's an error from the API call
      if (response.status === 'error') {
        setError(response.error);
        setIsVerifying(false);
        return;
      }

      if (response.status === "success") {
        // Set email_verified cookie
        Cookies.set("email_verified", "true", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: 30 // 30 days
        });
        
        await refetch();
        setIsSuccess(true);
      } else {
        setError(response.error || "Email verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Email verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-submit when all digits are filled and valid
  useEffect(() => {
    const values = form.getValues();
    const allFilled = Object.values(values).every(value => value && /^[0-9]$/.test(value));

    if (allFilled && !isVerifying && !isSuccess) {
      form.handleSubmit(onSubmit)();
    }
  }, [form.watch("digit6")]);

  const handleResendVerificationEmail = async () => {
    if (isResending || !user?.email) return;
    
    setIsResending(true);
    setResendSuccess(null);
    setError(null);
    
    try {
      const response = await resendVerificationEmail(user.email);
      
      // Check if there's an error from the API call
      if (response.status === 'error') {
        setError(response.error);
        setIsResending(false);
        return;
      }
      
      setResendSuccess("Verification email has been sent!");
      setTimeout(() => setResendSuccess(null), 5000);
    } catch (err: any) {
      console.error("Resend verification error:", err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg">
      {isSuccess ? (
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-teal-50 p-3">
                <CheckCircle2 className="h-8 w-8 text-teal-500" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-semibold">Email Verified</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Your email has been successfully verified. You can now access all features of your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" onClick={() => router.push("/")}>
              Continue to Dashboard
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">Verify Your Email</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter the 6-digit code sent to {user?.email || "your email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
            {resendSuccess && (
              <Alert variant="default" className="mb-4 bg-green-50 border border-green-200 text-green-800">
                <AlertDescription className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
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
                                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full bg-teal-500 text-white hover:bg-teal-600"
                  loading={isVerifying}
                  disabled={isVerifying || !form.formState.isValid}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
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
              Didn&apos;t receive a code? Check your spam folder or
              <Button variant="link" className="p-0 h-auto text-teal-500 hover:underline" onClick={handleResendVerificationEmail}>
                request a new code
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
