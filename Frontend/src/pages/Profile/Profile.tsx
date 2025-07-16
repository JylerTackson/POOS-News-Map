import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "../../Types/Users";

import { useUser } from "../../Contexts/UserContext";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";
import { UpdateForm } from "@/components/Registration/updateUser";

const ProfilePage: React.FC<User> = (user) => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [updateStatus, setUpdateStatus] = useState<boolean>(false);

  //TODO: Implement logic for logging out a user.
  function onLogout() {
    setUser(null);
    navigate("/pages/Login");
  }

  //TODO: Implement logic for updating user info.
  function onUpdate() {
    setUpdateStatus(true);
  }

  //TODO: Implement logic for deleting user
  function Delete() {
    fetch(`api/users/delete/:${user._id}`);

    toast("Deleted Account");
    navigate("/pages/Login");
  }

  if (user.firstName === undefined || user.lastName === undefined) {
    return (
      <div className="flex flex-col items-center p-6">
        <p>Login</p>
      </div>
    );
  } else if (updateStatus === true) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <UpdateForm
          updateStatus={updateStatus}
          setUpdateStatus={setUpdateStatus}
        />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center p-6">
        <Avatar className="w-32 h-32 mb-4">
          {user.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <AvatarFallback>
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{`${user.firstName} ${user.lastName}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </CardContent>
        </Card>

        <div className="flex space-x-4 mt-6">
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
          <Button onClick={onUpdate}>Update Info</Button>
          <Button variant="destructive" onClick={Delete}>
            Delete
          </Button>
        </div>
      </div>
    );
  }
};

export default ProfilePage;
