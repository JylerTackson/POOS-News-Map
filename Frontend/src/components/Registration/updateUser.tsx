import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/Contexts/UserContext";
import React, { useState } from "react";

// avoiding relative vs absolute path conflicts
import { API_ENDPOINTS } from "../../api";

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
  const { user, setUser } = useUser();

  // Create state for form fields (removed email)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    password: ""
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Only send non-empty fields
    const data: any = {
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    // Only include password if it's not empty
    if (formData.password) {
      data.password = formData.password;
    }

    //Get Response
    const res = await fetch(API_ENDPOINTS.updateUser(user?._id || ''), { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    //Handle Output
    if (res.status === 200) {
      setUpdateStatus(false);
      setUser(json.user);
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
          Update your name or password below
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Jon"
            value={formData.firstName}
            onChange={handleInputChange}
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
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">New Password (leave blank to keep current)</Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit" className="w-full">
          Update
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setUpdateStatus(false)}
        >
          Return
        </Button>
      </div>
    </form>
  );
}