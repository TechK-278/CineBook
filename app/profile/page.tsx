"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Ticket,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { profileEditSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  city?: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; city?: string }>({});

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch profile record from public.profiles
        const { data: profileRecord, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileRecord && !error) {
          setProfile({
            id: profileRecord.id,
            email: profileRecord.email,
            fullName: profileRecord.full_name || user.user_metadata?.full_name || "CineBook User",
            phone: profileRecord.phone || null,
            city: profileRecord.city || "Ahmedabad",
            role: profileRecord.role || "customer",
            createdAt: profileRecord.created_at || user.created_at,
          });
        } else {
          // Fallback to auth user metadata if database profile record is syncing
          setProfile({
            id: user.id,
            email: user.email || "",
            fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "CineBook User",
            phone: null,
            city: "Ahmedabad",
            role: "customer",
            createdAt: user.created_at,
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const openEditModal = () => {
    if (profile) {
      setEditName(profile.fullName);
      setEditPhone(profile.phone || "");
      setEditCity(profile.city || "");
      setFieldErrors({});
      setErrorMessage(null);
      setIsEditOpen(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validation = profileEditSchema.safeParse({
      fullName: editName.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
    });

    if (!validation.success) {
      const errors: typeof fieldErrors = {};
      validation.error.errors.forEach((err) => {
        const f = err.path[0] as keyof typeof fieldErrors;
        if (f) errors[f] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    const supabase = createClient();
    if (!supabase || !profile) return;

    setIsSaving(true);
    try {
      // 1. Update public.profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim(),
          phone: editPhone.trim() || null,
          city: editCity.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (dbError) {
        setErrorMessage(dbError.message || "Failed to update profile.");
        setIsSaving(false);
        return;
      }

      // 2. Update user_metadata in auth
      await supabase.auth.updateUser({
        data: { full_name: editName.trim() },
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              fullName: editName.trim(),
              phone: editPhone.trim() || null,
              city: editCity.trim() || null,
            }
          : null
      );

      setIsSaving(false);
      setIsEditOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setErrorMessage("An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    router.push("/");
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-zinc-400">
        <div className="mx-auto h-12 w-12 rounded-full border-2 border-cinebook-accent border-t-transparent animate-spin mb-4" />
        <p className="text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Card className="p-8 border-cinebook-border bg-cinebook-surface/90">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cinebook-dark border border-cinebook-border text-cinebook-accent mb-4">
            <User className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-white mb-2">
            Sign In Required
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400 mb-6">
            Please sign in to view and manage your CineBook account, personalized bookings, and profile details.
          </CardDescription>
          <Link href="/auth/login?next=/profile">
            <Button className="w-full text-xs sm:text-sm">Sign In to Continue</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const memberSinceFormatted = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cinebook-border mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <User className="h-7 w-7 text-cinebook-accent" />
            My Account
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your personal profile, contact information, and preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={openEditModal} className="gap-2 text-xs">
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center border-cinebook-border bg-cinebook-surface">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cinebook-accent text-2xl font-black text-white shadow-xl mb-4 border-2 border-cinebook-border">
            {getInitials(profile.fullName)}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{profile.fullName}</h2>
          <p className="text-xs text-zinc-400 mb-3">{profile.email}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {profile.role}
            </Badge>
            <span className="text-[11px] text-zinc-500">
              Joined {memberSinceFormatted}
            </span>
          </div>
        </Card>

        {/* Right Column: Personal Information & Preferences */}
        <Card className="md:col-span-2 p-6 border-cinebook-border bg-cinebook-surface flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-cinebook-border">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
                <span className="text-xs text-zinc-500 block mb-1">Full Name</span>
                <span className="text-sm font-semibold text-white">{profile.fullName}</span>
              </div>

              <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
                <span className="text-xs text-zinc-500 block mb-1">Email Address</span>
                <span className="text-sm font-semibold text-white">{profile.email}</span>
              </div>

              <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
                <span className="text-xs text-zinc-500 block mb-1">Mobile Phone</span>
                <span className="text-sm font-semibold text-white">
                  {profile.phone || <em className="text-zinc-500 font-normal">Not provided</em>}
                </span>
              </div>

              <div className="rounded-lg bg-cinebook-dark p-3 border border-cinebook-border">
                <span className="text-xs text-zinc-500 block mb-1">Default City</span>
                <span className="text-sm font-semibold text-white">
                  {profile.city || "Ahmedabad"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cinebook-border flex items-center justify-between">
            <Link href="/bookings">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Ticket className="h-4 w-4 text-cinebook-accent" />
                View My Reservations
              </Button>
            </Link>
            <span className="text-xs text-zinc-500">
              CineBook v2 Verified Account
            </span>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Profile"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-2xl border border-cinebook-border bg-cinebook-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-cinebook-border mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cinebook-accent" />
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close edit modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="edit-name"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  disabled={isSaving}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark px-3 py-2 text-sm text-white focus:border-cinebook-accent focus:outline-none"
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-red-400">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label
                  htmlFor="edit-phone"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Mobile Number (optional)
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={isSaving}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark px-3 py-2 text-sm text-white focus:border-cinebook-accent focus:outline-none"
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-400">{fieldErrors.phone}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-1">
                <label
                  htmlFor="edit-city"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Preferred City (optional)
                </label>
                <input
                  id="edit-city"
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Ahmedabad"
                  disabled={isSaving}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark px-3 py-2 text-sm text-white focus:border-cinebook-accent focus:outline-none"
                />
                {fieldErrors.city && (
                  <p className="text-[11px] text-red-400">{fieldErrors.city}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cinebook-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
