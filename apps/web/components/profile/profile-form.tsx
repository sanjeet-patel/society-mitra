"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, addFamilyMember, addVehicle } from "@/lib/actions/members";
import { BLOOD_GROUPS } from "@society-mitra/shared";

interface ProfileData {
  full_name: string;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  family_members: { id: string; name: string; relation: string | null; age: number | null }[];
  vehicles: { id: string; plate_number: string; vehicle_type: string | null }[];
}

export function ProfileForm({
  societySlug,
  profile,
}: {
  societySlug: string;
  profile: ProfileData;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleProfileUpdate(formData: FormData) {
    setError("");
    setSuccess("");
    const result = await updateProfile(societySlug, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Profile updated");
    router.refresh();
  }

  async function handleAddFamily(formData: FormData) {
    await addFamilyMember(societySlug, formData);
    router.refresh();
  }

  async function handleAddVehicle(formData: FormData) {
    await addVehicle(societySlug, formData);
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleProfileUpdate} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.full_name} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select name="bloodGroup" defaultValue={profile.blood_group ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.family_members.map((f) => (
            <p key={f.id} className="text-sm">
              {f.name}
              {f.relation ? ` (${f.relation})` : ""}
              {f.age ? `, ${f.age} yrs` : ""}
            </p>
          ))}

          <form action={handleAddFamily} className="flex gap-2 flex-wrap items-end">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input name="name" required className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Relation</Label>
              <Input name="relation" placeholder="Spouse" className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <Input name="age" type="number" className="h-8 w-20" />
            </div>
            <Button type="submit" size="sm">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.vehicles.map((v) => (
            <p key={v.id} className="text-sm">
              {v.plate_number}
              {v.vehicle_type ? ` (${v.vehicle_type})` : ""}
            </p>
          ))}

          <form action={handleAddVehicle} className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Plate Number</Label>
              <Input name="plateNumber" required className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Input name="vehicleType" placeholder="Car" className="h-8" />
            </div>
            <Button type="submit" size="sm">Add</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
