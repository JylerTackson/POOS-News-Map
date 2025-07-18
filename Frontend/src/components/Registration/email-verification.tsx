// forgor-Password.tsx
"use client";
import {
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function EmailVerified() {
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
          <DialogTitle>Enter One-Time Passkey</DialogTitle>
          <DialogDescription>
            You should have a OTP in your email, enter it below to Reset you
            password!
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"></button>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  );
}
