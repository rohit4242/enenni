"use client";

import { Separator } from "@/components/ui/separator";

import { ProfileForm } from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>

      </div>
      <ProfileForm />
    </div>
  );
}
