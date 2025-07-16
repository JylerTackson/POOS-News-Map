import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/Contexts/UserContext";
import React, { useState } from "react";

interface UpdateFormProps extends React.ComponentProps<"form"> {
  updateStatus: boolean;
  setUpdateStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UpdateForm({
  updateStatus,
  setUpdateStatus,
  className,
  ...props
}: UpdateFormProps) {
  const { user } = useUser();
  const [exists, setExists] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    //Create Object
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    //Get Response
    const res = await fetch(`/api/users/update:${user?._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    //Handle Output
    if (res.status === 409 && json._id !== data._id) {
      setExists(true);
      setUpdateStatus(false);
    } else if (res.status === 201) {
      setExists(false);
      setUpdateStatus(true);
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
        <h1 className="text-2xl font-bold">Update your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Fill out the details below to update your account
        </p>
        {exists ? (
          <Label className="text-red-500">
            Email already exists to a different user.
          </Label>
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
            value={user?.firstName}
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
            value={user?.lastName}
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
            value={user?.email}
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
          Update
        </Button>
      </div>
    </form>
  );
}
