// forgor-Password.tsx
import { useState } from "react";
import {
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailVerified } from "./email-verification";

export function ForgorForm() {
  const [exists, setExists] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  async function handleForgotPassword(email: string) {
    try {
    const res = await fetch("/api/users/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    
    const json = await res.json();
    
    if (res.status === 200) {
      alert("Check your email for a temporary password!");
      // Close the dialog or redirect
    } else {
      setExists(true);
    }
  } catch (error) {
    console.error("Error:", error);
    setExists(true);
  }

  }

  return (
    <DialogPortal>
      {/* backdrop */}
      <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />

      {/* center‑positioned modal box */}
      <DialogContent
        className="
          fixed 
          top-1/2 left-1/2 
          z-50 
          w-full max-w-md 
          -translate-x-1/2 -translate-y-1/2 
          bg-white rounded-lg shadow-lg 
          p-6
        "
      >
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email below to receive a one‑time key for password
            recovery.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            {exists && (
              <>
                <span className="text-red-500">Email Not found</span>
              </>
            )}
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className={exists ? "border-red-500" : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => handleForgotPassword(email)}>
              Send
            </Button>
          </div>
        </form>

        <DialogClose asChild>
          <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  );
}
