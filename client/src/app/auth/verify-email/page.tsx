"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
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
  const code = searchParams.get("code");
  const { refreshUser, user } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  
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
      const { error, status } = await verifyEmail(verificationCode, user?.email || "");
      
      if (status === "success") {
        await refreshUser();
        setIsSuccess(true);
      } else {
        setError(error || "Email verification failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Email verification failed");
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
    if (!user?.email) return;
    
    setIsResending(true);
    setError(null);
    setResendSuccess(null);
    
    try {
      const { status } = await resendVerificationEmail(user?.email || "");
      if (status === "success") {
        setResendSuccess("Verification code resent successfully");
      } else {
        setError("Failed to resend verification code");
      }
    } catch (err) {
      setError("Failed to resend verification code");
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
            <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" onClick={() => router.push("/dashboard")}>
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
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
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
