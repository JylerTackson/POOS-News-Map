import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../Contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail } from "lucide-react";

// avoiding relative vs absolute path conflicts
import { API_ENDPOINTS } from "../../api";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [exists, setExists] = useState<boolean>(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    
    const response = await fetch(API_ENDPOINTS.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    console.log("Registration response:", json);  // <-- ADD IT HERE

    if (response.status === 409) {
      setExists(true);
    } else if (response.status === 201) {
      setExists(false);
      setRegisteredEmail(json.email);
      setShowVerificationDialog(true);
      toast.success("Registration successful! Please check your email.");
    }
  }

  async function resendVerification() {
    setIsResending(true);
    try {
      // You'll need to implement this endpoint in your backend
      const response = await fetch(`${API_ENDPOINTS.resendVerification}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      if (response.ok) {
        toast.success("Verification email resent! Please check your inbox.");
      } else {
        toast.error("Failed to resend email. Please try again.");
      }
    } catch (error) {
      toast.error("Error resending verification email");
    } finally {
      setIsResending(false);
    }
  }

  function handleConfirm() {
  setShowVerificationDialog(false);
  navigate("/pages/Login");
}

  return (
    <>
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Register a new Account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill out the details below to create an account
          </p>
          {exists ? (
            <Label className="text-red-500">Email already exists as user.</Label>
          ) : (
            <p></p>
          )}
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Jon"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Snow"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="me@example.com"
              required
              className={exists ? "border-red-500" : ""}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button variant="outline" className="w-full">
            <img src="/google.svg" alt="Google logo" width={24} height={24} />
            Register with Google
          </Button>
        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <a href="/pages/Login" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </form>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Check Your Email
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-2">
              <p>
                We've sent a verification email to:
              </p>
              <p className="font-medium text-sm bg-gray-100 p-2 rounded">
                {registeredEmail}
              </p>
              <p className="text-sm">
                Click the verification link in the email to activate your account. 
                The link will open in a new tab and log you in automatically.
              </p>
              <p className="text-xs text-gray-500">
                Can't find the email? Check your spam folder.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={resendVerification}
              disabled={isResending}
              className="flex-1"
            >
              {isResending ? "Sending..." : "Resend Email"}
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}