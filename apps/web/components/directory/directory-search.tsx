"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Droplets, Car } from "lucide-react";

interface DirectoryMember {
  id: string;
  role: string;
  profiles: {
    full_name: string;
    phone: string | null;
    email: string | null;
    blood_group: string | null;
    family_members: { name: string; relation: string | null }[];
    vehicles: { plate_number: string; vehicle_type: string | null }[];
  };
  units: { unit_number: string; floor: string | null; blocks: { name: string } | null } | null;
}

export function DirectorySearch({
  societySlug,
  initialMembers,
}: {
  societySlug: string;
  initialMembers: DirectoryMember[];
}) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(initialMembers);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setMembers(initialMembers);
      return;
    }

    setLoading(true);
    const res = await fetch(
      `/api/${societySlug}/directory?q=${encodeURIComponent(value)}`
    );
    const data = await res.json();
    setMembers(data.members ?? []);
    setLoading(false);
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, house number, mobile, vehicle..."
          className="pl-10"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Searching...</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {members.map((member) => {
          const profile = member.profiles;
          const unit = member.units;

          return (
            <Card key={member.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                    {unit && (
                      <p className="text-sm text-muted-foreground">
                        {unit.blocks?.name ? `${unit.blocks.name} · ` : ""}
                        {unit.unit_number}
                        {unit.floor ? ` (Floor ${unit.floor})` : ""}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${profile.phone}`} className="hover:underline">
                      {profile.phone}
                    </a>
                  </p>
                )}
                {profile.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {profile.email}
                  </p>
                )}
                {profile.blood_group && (
                  <p className="flex items-center gap-2">
                    <Droplets className="h-3 w-3" />
                    {profile.blood_group}
                  </p>
                )}
                {profile.vehicles?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Car className="h-3 w-3 mt-0.5" />
                    <div>
                      {profile.vehicles.map((v) => (
                        <p key={v.plate_number}>
                          {v.plate_number}
                          {v.vehicle_type ? ` (${v.vehicle_type})` : ""}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {profile.family_members?.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Family</p>
                    {profile.family_members.map((f) => (
                      <p key={f.name}>
                        {f.name}
                        {f.relation ? ` (${f.relation})` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No members found.</p>
      )}
    </div>
  );
}
