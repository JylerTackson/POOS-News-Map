import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // handle form submission logic here
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    console.log(data.get("email"));
    console.log(data.get("password"));

    //Turn FormData into a plain object
    const payload = Object.fromEntries(data.entries());
    console.log("payload:", payload);

    //define fetch request
    const response = await fetch("http://localhost:5050/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    //handle output
    console.log("status:", response.status);
    const json = await response.json();
    console.log("body:", json);

    if (!response.ok) {
      throw new Error(json.Error || "Login Failed");
    }

    return json;
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
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
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <img src="/google.svg" alt="Google logo" width={24} height={24} />
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <a href="/pages/Register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}
