import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../Contexts/UserContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { setUser } = useUser();
  const Navigate = useNavigate();
  const [invalid, setInvalid] = useState(false); // ← new

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInvalid(false); // ← reset on each submit

    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("http://localhost:5050/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();

    if (response.status === 201) {
      // explicitly pluck out the User fields
      const userPayload = {
        _id: json._id,
        firstName: json.firstName,
        lastName: json.lastName,
        email: json.email,
        avatarUrl: "",
      };
      setUser(userPayload);
      Navigate("/pages/Home");
      return json;
    }

    if (response.status === 203) {
      setInvalid(true);
      return;
    }

    // any other error
    throw new Error(json.Error || "Login failed");
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>

      {/* show a message if invalid */}
      {invalid && (
        <p className="text-red-600 text-sm text-center">
          Email or Password is incorrect
        </p>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className={cn(invalid && "border-red-500 focus:border-red-500")}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="../pages/forgor"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className={cn(invalid && "border-red-500 focus:border-red-500")}
          />
        </div>

        <Button type="submit" className="w-full">
          Login
        </Button>
        {/* …the rest of your form… */}
      </div>
    </form>
  );
}
