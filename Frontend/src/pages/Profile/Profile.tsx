import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "../../Types/Users";

import { useUser } from "../../Contexts/UserContext";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC<User> = (user) => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  //TODO: Implement logic for logging out a user.
  function onLogout() {
    setUser(null);
    navigate("/pages/Login");
  }

  //TODO: Implement logic for updating user info.
  function onUpdate() {}

  if (user.firstName === undefined || user.lastName === undefined) {
    return (
      <div className="flex flex-col items-center p-6">
        <p>Login</p>
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
        </div>
      </div>
    );
  }
};

export default ProfilePage;
