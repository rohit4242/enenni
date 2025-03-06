"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/auth-guard";
import { CheckCircle2, XCircle, ClipboardCopy, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { changePassword, disableTwoFactor, enableTwoFactor, updateProfile, verifyTwoFactorSetup } from "@/lib/api/user";


// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().optional(),
});

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Two-factor verification schema
const twoFactorVerificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type TwoFactorVerificationValues = z.infer<typeof twoFactorVerificationSchema>;

export default function ProfilePage() {
  const { user, refreshUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Auth state
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshingAuth, setIsRefreshingAuth] = useState(false);

  // General profile state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Two-factor state
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Two-factor verification form
  const twoFactorForm = useForm<TwoFactorVerificationValues>({
    resolver: zodResolver(twoFactorVerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Initialize the component
  useEffect(() => {
    // Mark component as loaded after initial render
    setIsPageLoaded(true);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isPageLoaded) {
      // If auth loading is complete and user is not authenticated, handle it
      if (!authLoading && !isAuthenticated) {
        setAuthError("Session expired. Please log in again.");
        // Instead of immediate redirect, show error message
        // router.push('/auth/login');
      } else if (!authLoading && isAuthenticated && user) {
        // Reset auth error if authentication succeeds
        setAuthError(null);

        // Update form data with user info
        profileForm.reset({
          name: user.name || "",
          image: user.image || "",
        });
      }
    }
  }, [authLoading, isAuthenticated, user, isPageLoaded, profileForm, router]);

  // Manual auth refresh function
  const handleAuthRefresh = async () => {
    setIsRefreshingAuth(true);
    try {
      await refreshUser();
      setAuthError(null);
    } catch (err: any) {
      setAuthError("Failed to refresh session. Please log in again.");
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } finally {
      setIsRefreshingAuth(false);
    }
  };

  // Handle profile update
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await updateProfile(values);
      await refreshUser();
      setProfileSuccess("Profile updated successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        setProfileError(err.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setPasswordSuccess("Password changed successfully");
      passwordForm.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        setPasswordError(err.response?.data?.message || "Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle two-factor enable/disable toggle
  const handleTwoFactorToggle = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError(null);

    try {
      if (user?.isTwoFactorEnabled) {
        // When disabling 2FA, directly call the API without verification
        await disableTwoFactor();
        await refreshUser();
        setProfileSuccess("Two-factor authentication disabled successfully");
      } else {
        // When enabling 2FA, get QR code
        const { data, error } = await enableTwoFactor();
        if (data && data.mfaQrCode) {
          setQrCode(data.mfaQrCode);
          setMfaSecret(data.mfaSecret);
          setShowVerification(true);
        } else {
          console.error("Invalid 2FA setup response structure:", error);
          setTwoFactorError("Invalid server response for 2FA setup. Please try again later.");
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        setTwoFactorError(
          err.response?.data?.message ||
          "Failed to process two-factor authentication. Please check your network connection."
        );
      }
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Handle two-factor verification (only for enabling)
  const onTwoFactorVerificationSubmit = async (values: TwoFactorVerificationValues) => {
    setTwoFactorLoading(true);
    setTwoFactorError(null);

    try {
      // Confirm 2FA enabling
      const { error, status } = await verifyTwoFactorSetup(values.code);

      if (status === "success") {
        setQrCode(null);
        setMfaSecret(null);
        setShowVerification(false);
        await refreshUser();
        setActiveTab("general"); // Switch back to general tab
        setProfileSuccess("Two-factor authentication enabled successfully");
      } else {
        console.error("Invalid 2FA verification response:", error);
        setTwoFactorError("Failed to verify two-factor code. Please try again.");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        setTwoFactorError(
          err.response?.data?.message ||
          "Failed to verify two-factor code. Please check your network connection."
        );
      }
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Utility function to copy to clipboard
  const copyToClipboard = (text: string, label: string = "Text") => {
    navigator.clipboard.writeText(text);
    setProfileSuccess(`${label} copied to clipboard`);
    setTimeout(() => setProfileSuccess(null), 2000);
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        {/* Authentication error alert */}
        {authError && (
          <Alert className="mb-6" variant="destructive">
            <div className="flex items-center justify-between">
              <AlertDescription>{authError}</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuthRefresh}
                disabled={isRefreshingAuth}
              >
                {isRefreshingAuth ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Session
                  </>
                )}
              </Button>
            </div>
          </Alert>
        )}

        {(profileSuccess || passwordSuccess) && (
          <Alert className="mb-6" variant="default">
            <AlertDescription>{profileSuccess || passwordSuccess}</AlertDescription>
          </Alert>
        )}

        {(profileError || passwordError) && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{profileError || passwordError}</AlertDescription>
          </Alert>
        )}

        {/* Show loading state while authentication is being checked */}
        {authLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading account information...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="twoFactor">Two-Factor Auth</TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and public profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                        <div className="w-full md:w-1/4">
                          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2">
                            {user?.image ? (
                              <Image
                                src={user.image}
                                alt="Profile picture"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Profile image updates are available in account settings
                          </div>
                        </div>

                        <div className="w-full md:w-3/4 space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-1">
                            <Label>Email Address</Label>
                            <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                              <span className="text-muted-foreground">
                                {user?.email || "No email set"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => user?.email && copyToClipboard(user.email, "Email")}
                                disabled={!user?.email}
                              >
                                <ClipboardCopy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              {user?.emailVerified ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-green-600">Verified</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="text-yellow-600">Not verified</span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <Label>Account Type</Label>
                            <div className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                              <span className="text-muted-foreground capitalize">
                                {user?.role?.toLowerCase() || "Standard User"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label>KYC Status</Label>
                            <div className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                              <span className={`capitalize ${user?.kycStatus === "APPROVED"
                                ? "text-green-600"
                                : user?.kycStatus === "REJECTED"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                                }`}>
                                {user?.kycStatus?.toLowerCase() || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={profileLoading}>
                          {profileLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-muted-foreground flex items-center">
                                {/[A-Z]/.test(field.value) ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-300 mr-1" />
                                )}
                                <span className={/[A-Z]/.test(field.value) ? "text-green-600" : "text-gray-500"}>
                                  Contains uppercase letter
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center">
                                {/[a-z]/.test(field.value) ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-300 mr-1" />
                                )}
                                <span className={/[a-z]/.test(field.value) ? "text-green-600" : "text-gray-500"}>
                                  Contains lowercase letter
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center">
                                {/[0-9]/.test(field.value) ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-300 mr-1" />
                                )}
                                <span className={/[0-9]/.test(field.value) ? "text-green-600" : "text-gray-500"}>
                                  Contains number
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center">
                                {field.value?.length >= 8 ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-300 mr-1" />
                                )}
                                <span className={field.value?.length >= 8 ? "text-green-600" : "text-gray-500"}>
                                  At least 8 characters
                                </span>
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Two-Factor Authentication Tab */}
            <TabsContent value="twoFactor">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account by enabling two-factor authentication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {twoFactorError && (
                    <Alert className="mb-6" variant="destructive">
                      <AlertDescription>{twoFactorError}</AlertDescription>
                    </Alert>
                  )}

                  {!showVerification ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            {user?.isTwoFactorEnabled
                              ? "Your account is protected with two-factor authentication"
                              : "Protect your account with an authenticator app"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            {twoFactorLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full z-10">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            )}
                            <Switch
                              checked={user?.isTwoFactorEnabled || false}
                              onCheckedChange={handleTwoFactorToggle}
                              disabled={twoFactorLoading}
                            />
                          </div>
                          <Label>{user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">How It Works</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="space-y-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              1
                            </div>
                            <h4 className="font-medium">Download an Authenticator App</h4>
                            <p className="text-sm text-muted-foreground">
                              Install Google Authenticator or Authy on your mobile device
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              2
                            </div>
                            <h4 className="font-medium">Scan QR Code</h4>
                            <p className="text-sm text-muted-foreground">
                              Scan the QR code with your authenticator app
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              3
                            </div>
                            <h4 className="font-medium">Enter Verification Code</h4>
                            <p className="text-sm text-muted-foreground">
                              Enter the verification code from your app to confirm setup
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!user?.isTwoFactorEnabled && qrCode && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Scan this QR Code</h3>
                          <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                          </p>
                          <div className="flex justify-center p-4 bg-white rounded-lg">
                            {/* Display QR code with proper error handling */}
                            {qrCode.startsWith('data:image') ? (
                              <Image
                                src={qrCode}
                                alt="QR Code"
                              
                                width={200}
                                height={200}
                                className="max-w-[200px]"
                                onError={(e) => {
                                  console.error('Error loading QR code image');
                                  e.currentTarget.style.display = 'none';
                                  setTwoFactorError('Failed to load QR code image. Please try again.');
                                }}
                              />
                            ) : (
                              <div className="text-center text-red-500">
                                <p>Invalid QR code format</p>
                                <Button
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => {
                                    setShowVerification(false);
                                    setQrCode(null);
                                    handleTwoFactorToggle();
                                  }}
                                >
                                  Try Again
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!user?.isTwoFactorEnabled && qrCode && mfaSecret && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Manual Setup Code</h3>
                          <p className="text-sm text-muted-foreground">
                            If you can&apos;t scan the QR code, you can manually enter this secret key into your authenticator app:
                          </p>
                          <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded flex-1 overflow-x-auto">
                              {mfaSecret}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(mfaSecret, "MFA Secret")}
                              title="Copy to clipboard"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {showVerification && !user?.isTwoFactorEnabled && (
                        <Form {...twoFactorForm}>
                          <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorVerificationSubmit)} className="space-y-6">
                            <FormField
                              control={twoFactorForm.control}
                              name="code"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Enter verification code to enable 2FA</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="000000"
                                      maxLength={6}
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowVerification(false);
                                  setQrCode(null);
                                  setMfaSecret(null);
                                  setTwoFactorError(null);
                                }}
                              >
                                Cancel
                              </Button>

                              <Button type="submit" disabled={twoFactorLoading}>
                                {twoFactorLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  "Enable Two-Factor Auth"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuthGuard>
  );
}
