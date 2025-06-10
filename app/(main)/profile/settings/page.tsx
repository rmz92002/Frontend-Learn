"use client";

import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  User,
  Bell,
  Eye,
  Settings as SettingsIcon,
  ArrowLeft,
  LogOut,
  Trash2,
  Upload,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getSettingsUser, updateSettingsUser } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * -----------------------------
 * Helper functions (API calls)
 * -----------------------------
 */
async function updateProfile(payload: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update profile");
  }
  return res.json();
}

async function updatePassword(payload: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update password");
  }
  return res.json();
}

async function uploadAvatar(formData: FormData) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/profiles/avatar`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Avatar upload failed");
  return res.json();
}

/**
 * -----------------------------
 * Main component
 * -----------------------------
 */
export default function SettingsPage() {
  const queryClient = useQueryClient();

  /** --------------------------------------------------
   * Remote state
   * --------------------------------------------------*/
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["currentUserSettings"],
    queryFn: ({ signal }) => getSettingsUser(signal),
    staleTime: 1000 * 60 * 60, // 1 h
  });

  /** --------------------------------------------------
   * Local state (forms)
   * --------------------------------------------------*/
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hashed_password, setHashedPassword] = useState<boolean | undefined>();

  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<string | undefined>();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const [publicProfile, setPublicProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  /** --------------------------------------------------
   * Sync fetched → form state
   * --------------------------------------------------*/
  useEffect(() => {
    if (!userData) return;

    setName(userData.name || "");
    setEmail(userData.email || "");
    setBio(userData.bio || "");
    setAvatar(userData.avatar_url || null);

    setDarkMode(userData.dark_mode || false);
    setLanguage(userData.language || "en");

    setEmailNotifications(userData.email_notifications || false);
    setPushNotifications(userData.push_notifications || false);

    setPublicProfile(userData.public_profile || false);
    setHashedPassword(userData.hashed_password)

  }, [userData]);

  /** --------------------------------------------------
   * Mutations
   * --------------------------------------------------*/
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUserSettings"]);
      alert("Saved!");
    },
    onError: (err: Error) => alert(err.message),
  };

  const profileMutation = useMutation({
  mutationFn: (settings: Parameters<typeof updateSettingsUser>[0]) =>
    updateSettingsUser(settings),
  ...mutationOptions,
});

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      alert("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => alert(err.message),
  });
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data: any) => {
      setAvatar(data.avatar_url);
      queryClient.invalidateQueries(["currentUserSettings"]);
    },
    onError: (err: Error) => alert(err.message),
  });

  /** --------------------------------------------------
   * Handlers
   * --------------------------------------------------*/
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    avatarMutation.mutate(fd);
    e.target.value = ""; // reset input
  };

  const handleSaveSettings = () => {
    profileMutation.mutate({
    name,
    email,               // if your schema really wants `email`             // ← add this
    bio,
    dark_mode: darkMode,
    language: language,  // trim any trailing newline (see below)
    email_notifications: emailNotifications,
    push_notifications: pushNotifications,
    public_profile: publicProfile,
  });
  };
  function buildPayload() {
  return {
    name,
    email,
    bio,
    dark_mode: darkMode,
    language,
    email_notifications: emailNotifications,
    push_notifications: pushNotifications,
    public_profile: publicProfile,
  };
}

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords don’t match");
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  /** --------------------------------------------------
   * JSX
  //  * --------------------------------------------------*/
  if (isLoading) {
    // Instagram-like skeletons for loading state
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6 mt-14">
          <Card className="p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="w-24 h-8 rounded" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-1/2 rounded" />
                <Skeleton className="h-6 w-2/3 rounded" />
                <Skeleton className="h-20 w-full rounded" />
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-sm">
            <Skeleton className="h-6 w-1/3 mb-4 rounded" />
            <Skeleton className="h-10 w-full rounded mb-2" />
            <Skeleton className="h-10 w-full rounded mb-2" />
            <Skeleton className="h-10 w-full rounded" />
          </Card>
          <Card className="p-6 shadow-sm">
            <Skeleton className="h-6 w-1/3 mb-4 rounded" />
            <Skeleton className="h-10 w-full rounded mb-2" />
            <Skeleton className="h-10 w-full rounded" />
          </Card>
          <Card className="rounded-2xl shadow-md border border-muted">
            <Skeleton className="h-6 w-1/3 mb-4 rounded" />
            <Skeleton className="h-10 w-full rounded mb-2" />
            <Skeleton className="h-10 w-full rounded" />
          </Card>
          <Card className="rounded-2xl shadow-sm border border-muted bg-background">
            <Skeleton className="h-6 w-1/3 mb-4 rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </Card>
          <Card className="rounded-2xl border border-destructive/40 bg-destructive/10 shadow-sm">
            <Skeleton className="h-6 w-1/3 mb-4 rounded" />
            <Skeleton className="h-10 w-full rounded mb-2" />
            <Skeleton className="h-10 w-full rounded" />
          </Card>
        </div>
        <div className="sticky bottom-0 p-4 mt-8 flex justify-end z-10">
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center h-32 text-red-600">
        Error: {(error as Error).message}
      </div>
    );
  }
  return (
<div className="container  mx-auto p-6">
      <div className="space-y-6 mt-14">
          <Card className="p-6 shadow-sm">
  <div className="flex flex-col md:flex-row gap-8 mb-6">
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32 border-2">
        <AvatarImage src={avatar || "/placeholder-avatar.svg"} />
        <AvatarFallback className="text-3xl">
          {name[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <input
        type="file"
        id="avatar-input"
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById("avatar-input")?.click()}
        disabled={avatarMutation.isLoading}
      >
        {avatarMutation.isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Change Photo
      </Button>
    </div>
    <div className="flex-1 space-y-4">
      <div className="space-y-1">
        <Label>Display Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Email Address</Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Bio</Label>
        <Textarea
          rows={3}
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="resize-none"
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button 
          onClick={handleSaveSettings} 
          disabled={profileMutation.isLoading} 
          className="rounded-lg"
        >
          {profileMutation.isLoading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  </div>
</Card> 


        {hashed_password? (
           <Card className="p-6  shadow-sm">
            <CardTitle className="text-lg font-semibold mb-4">Password Settings</CardTitle>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-1">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button className="w-full md:w-auto" type="submit">
                {passwordMutation.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Card>
        ): (<Card className="p-6 shadow-sm">
    <CardTitle className="text-lg font-semibold mb-4">Password Settings</CardTitle>
    <div className="text-muted-foreground text-sm">
      This account was created using Google. Password changes are not available.
    </div>
  </Card>)}
         
       

          <Card className="p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Additional Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Customize your interface appearance
                  </p>
                </div>
                <Switch checked={darkMode}
                onCheckedChange={checked => {
    setDarkMode(checked);
    profileMutation.mutate({
      ...buildPayload(),
      dark_mode: checked,
    });
  }}
                />
              </div>

              <div className="space-y-1">
                <Label>Interface Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

        
        {/* -----------------------------
            Notifications Tab
        ----------------------------- */}
  <Card className="rounded-2xl shadow-md border border-muted">
    <CardHeader className="pb-2">
      <CardTitle className="text-xl font-semibold tracking-tight">Notification Settings</CardTitle>
      <p className="text-sm text-muted-foreground">Choose how you’d like to be notified.</p>
    </CardHeader>

    <CardContent className="space-y-3 pt-0">
      <div className="flex items-center justify-between px-1">
        <div>
          <Label className="text-base">Email</Label>
          <p className="text-sm text-muted-foreground">Get updates via email</p>
        </div>
        <Switch checked={emailNotifications} 
        onCheckedChange={checked => {
    setEmailNotifications(checked);
    profileMutation.mutate({
      ...buildPayload(),
      email_notifications: checked,
    });
  }} />
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <Label className="text-base">Push</Label>
          <p className="text-sm text-muted-foreground">Receive push notifications</p>
        </div>
        <Switch checked={pushNotifications} 
        onCheckedChange={checked => {
    setPushNotifications(checked);
    profileMutation.mutate({
      ...buildPayload(),
      push_notifications: checked,
    });
  }} />
      </div>
    </CardContent>

   
  </Card>


        {/* -----------------------------
            Privacy Tab
        ----------------------------- */}
  {/* Privacy Settings */}
  <Card className="rounded-2xl shadow-sm border border-muted bg-background">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">Privacy Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">Public profile</Label>
        <Switch checked={publicProfile} onCheckedChange={checked => {
    setPublicProfile(checked);
    profileMutation.mutate({
      ...buildPayload(),
      public_profile: checked,
    });
  }} />
      </div>
    </CardContent>
    
  </Card>

  {/* Danger Zone */}
  <Card className="rounded-2xl border border-destructive/40 bg-destructive/10 shadow-sm">
    <CardHeader>
      <CardTitle className="text-destructive text-xl font-semibold">Danger Zone</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2 border-muted text-muted-foreground hover:text-foreground"
        onClick={() => alert("Not implemented")}
      >
        <LogOut className="h-4 w-4" />
        Log out all sessions
      </Button>
      <Button 
        variant="destructive" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => {
          if (confirm("Really delete? This is permanent.")) {
            alert("Not implemented");
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </Button>
    </CardContent>
  </Card>
</div>
        
    </div>
  );
}


