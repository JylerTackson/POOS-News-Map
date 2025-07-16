// components/profile.tsx
import React from "react";
import defaultProfile from "../../assets/stockProfilePhoto.jpg";
import { Button } from "../ui/button";
import { useUser } from "../../Contexts/UserContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useUser();

  if (user === null) {
    return (
      <div className="flex items-center space-x-6">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="px-4 py-1 text-sm font-medium hover:bg-blue-50 transition"
          >
            <a href="/pages/Register">Register</a>
          </Button>
          <Button
            variant="outline"
            className="px-4 py-1 text-sm font-medium hover:bg-blue-50 transition"
          >
            <a href="/pages/Login">Login</a>
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-6">
        <div className="flex space-x-2">
          <p>{`${user.firstName} ${user.lastName}`}</p>
        </div>

        <div className="w-10 h-10">
          <Link to="/pages/Profile">
            <img
              src={defaultProfile}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-gray-300"
            />
          </Link>
        </div>
      </div>
    );
  }
};

export default Profile;
