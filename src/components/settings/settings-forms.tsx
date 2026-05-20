"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDisplayName, updateEmail, updatePassword, deleteAccount } from "@/lib/actions/auth";

interface SettingsFormsProps {
  displayName: string;
  email: string;
}

type Msg = { type: "success" | "error"; text: string };

export function SettingsForms({ displayName, email }: SettingsFormsProps) {
  return (
    <div className="space-y-6">
      <ProfileForm displayName={displayName} />
      <SecurityForm email={email} />
      <DangerZone />
    </div>
  );
}

function ProfileForm({ displayName }: { displayName: string }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<Msg | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateDisplayName(formData);
      setMsg(result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: result.success! }
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Display name</Label>
            <Input id="full_name" name="full_name" defaultValue={displayName} required />
          </div>
          {msg && <p className={`text-sm ${msg.type === "error" ? "text-destructive" : "text-green-700"}`}>{msg.text}</p>}
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SecurityForm({ email }: { email: string }) {
  const [emailPending, startEmailTransition] = useTransition();
  const [passPending, startPassTransition] = useTransition();
  const [emailMsg, setEmailMsg] = useState<Msg | null>(null);
  const [passMsg, setPassMsg] = useState<Msg | null>(null);

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startEmailTransition(async () => {
      const result = await updateEmail(formData);
      setEmailMsg(result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: result.success! }
      );
    });
  }

  function handlePassSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startPassTransition(async () => {
      const result = await updatePassword(formData);
      setPassMsg(result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: result.success! }
      );
      if (!result.error) form.reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Update your email address or password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" defaultValue={email} required />
          </div>
          {emailMsg && <p className={`text-sm ${emailMsg.type === "error" ? "text-destructive" : "text-green-700"}`}>{emailMsg.text}</p>}
          <Button type="submit" variant="outline" size="sm" disabled={emailPending}>
            {emailPending ? "Updating…" : "Update Email"}
          </Button>
        </form>

        <div className="border-t pt-6">
          <form onSubmit={handlePassSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm new password</Label>
              <Input id="confirm_password" name="confirm_password" type="password" minLength={8} required />
            </div>
            {passMsg && <p className={`text-sm ${passMsg.type === "error" ? "text-destructive" : "text-green-700"}`}>{passMsg.text}</p>}
            <Button type="submit" variant="outline" size="sm" disabled={passPending}>
              {passPending ? "Updating…" : "Change Password"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, all saved quizzes, and all generated questions. <strong>This cannot be undone.</strong>
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
              >
                {isPending ? "Deleting…" : "Yes, delete everything"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setConfirming(false); setError(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
