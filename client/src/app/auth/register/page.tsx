"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema } from "@/lib/validations/auth";
import { CheckCircle2, XCircle } from "lucide-react";
import { registerUser } from "@/lib/api/auth";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: undefined,
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  const passwordRequirements = [
    { label: "At least 8 characters", valid: password?.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(password || "") },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(password || "") },
    { label: "At least one number", valid: /[0-9]/.test(password || "") },
  ];

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerUser({ 
        name: values.name, 
        email: values.email, 
        password: values.password,
        isEntity: values.accountType === "entity"
      });
      
      // Check if there's an error from the API call
      if (response.status === 'error') {
        // Highlight the email field if it's a conflict error (email already exists)
        if (response.code === 'CONFLICT_ERROR') {
          form.setError('email', { 
            type: 'manual', 
            message: 'This email is already registered' 
          });
        }
        
        setError(response.error);
        setIsLoading(false);
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/verify-email");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Try to extract the specific error message for email conflicts
      if (err.response?.data?.error?.code === 'CONFLICT_ERROR') {
        form.setError('email', { 
          type: 'manual', 
          message: 'This email is already registered' 
        });
        setError(err.response.data.error.message);
      } else {
        setError(err.response?.data?.error?.message || err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-gray-500">Sign up to get started with Enenni</p>
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

      {success && (
        <Alert>
          <AlertDescription>
            Registration successful! Please check your email to verify your account.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select the account type</FormLabel>
                <FormControl> 
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormItem>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="entity">Entity</SelectItem>
                      </SelectContent>
                    </FormItem>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" type="email" {...field} />
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
                <ul className="mt-2 space-y-1 text-sm">
                  {passwordRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {req.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                      )}
                      <span className={req.valid ? "text-green-700" : "text-gray-500"}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading || success}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
