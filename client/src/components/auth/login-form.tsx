"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { LoginSchema } from "@/lib/schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSucess } from "@/components/form-sucess";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginUser } from "@/lib/api/auth";

const LoginForm = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState<string>("Entity");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different Provider!"
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
      loginType: "Entity",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    values.loginType = selectedTab as "Entity" | "Individual";
    startTransition(() => {
      loginUser(values)
        .then((data) => {
          if (data?.error) {
            form.reset({
              ...form.getValues(),
              code: ""
            });
            setError(data.error);
          }

          if (data?.mfaRequired) {
            setShowTwoFactor(true);
            form.reset({
              ...form.getValues(),
              code: ""
            });
          }

          if (!data?.error && !data?.mfaRequired) {
            form.reset();
            setSuccess("Logged in successfully!");
            router.push('/dashboard');
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          setError("Something went wrong");
        });
    });
  };

  return (
    <CardWrapper
      headerLabel={showTwoFactor ? "Two-Factor Authentication" : "Welcome back"}
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial={!showTwoFactor}
    >
      <Tabs defaultValue="Entity" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Entity">Entity</TabsTrigger>
          <TabsTrigger value="Individual">Individual</TabsTrigger>
        </TabsList>
        <TabsContent value="Entity" asChild>
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* <CardWrapper
            headerLabel={showTwoFactor ? "Two-Factor Authentication" : "Welcome back"}
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial={!showTwoFactor}
          > */}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {showTwoFactor ? (
                    <>
                      <div className="text-sm text-muted-foreground text-center">
                        Enter the code from your authenticator app
                      </div>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authentication Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="123456"
                                disabled={isPending}
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                                defaultValue=""
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Email Address"
                                type="email"
                              />
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
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="***********"
                                type="password"
                              />
                            </FormControl>
                            <Button
                              size="sm"
                              variant="link"
                              asChild
                              className="px-0 font-normal"
                            >
                              <Link href="/auth/reset">Forgot password?</Link>
                            </Button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
                <FormError message={error || urlError} />
                <FormSucess message={success} />
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {showTwoFactor ? "Confirm" : "Login"}
                </Button>
              </form>
            </Form>
            {/* </CardWrapper> */}

          </motion.div>
        </TabsContent>
        <TabsContent value="Individual" asChild>
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* <CardWrapper
            headerLabel={showTwoFactor ? "Two-Factor Authentication" : "Welcome back"}
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial={!showTwoFactor}
          > */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {showTwoFactor ? (
                    <>
                      <div className="text-sm text-muted-foreground text-center">
                        Enter the code from your authenticator app
                      </div>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authentication Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="123456"
                                disabled={isPending}
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                                defaultValue=""
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Email Address"
                                type="email"
                              />
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
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="***********"
                                type="password"
                              />
                            </FormControl>
                            <Button
                              size="sm"
                              variant="link"
                              asChild
                              className="px-0 font-normal"
                            >
                              <Link href="/auth/reset">Forgot password?</Link>
                            </Button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
                <FormError message={error || urlError} />
                <FormSucess message={success} />
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {showTwoFactor ? "Confirm" : "Login"}
                </Button>
              </form>
            </Form>
            {/* </CardWrapper> */}
          </motion.div>
        </TabsContent>
      </Tabs>
    </CardWrapper>
  );
};

export default LoginForm;
