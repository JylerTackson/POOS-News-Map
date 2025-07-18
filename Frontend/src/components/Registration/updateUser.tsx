import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/Contexts/UserContext";
import React, { useState } from "react";

// hell wmario, 

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
  const [exists, setExists] = useState<boolean>(false);

  // Create state for form fields
  const [formData, setFormData] = useState({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
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
    //Create Object
    e.preventDefault();
    // Only send non-empty fields
    const data: any = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email
  };

// Only include password if it's not empty
if (formData.password) {
  data.password = formData.password;
}

console.log("Sending data:", data);

    //Get Response
    const res = await fetch(`/api/users/update/${user?._id}`, { //<--- 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json(); //<------ your response converted to json

    //Handle Output
    if(res.status === 409) {
      setExists(true);
    } else if (res.status === 200) {
      setExists(false);
      setUpdateStatus(false);
      setUser(json.user); //<------ user data
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="me@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={exists ? "border-red-500" : ""}
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
