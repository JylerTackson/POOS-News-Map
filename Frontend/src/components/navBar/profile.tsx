import { Link } from "react-router-dom";
import defaultProfile from "../../assets/stockProfilePhoto.jpg";
import { useUser } from "../../Contexts/UserContext";
import { Button } from "../ui/button";

const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center space-x-6">
        <div className="flex space-x-2">
          <Link to="/pages/Register" className="cursor-pointer">
            <Button
              variant="outline"
              className="cursor-pointer px-4 py-1 text-sm font-medium hover:bg-blue-50 transition"
            >
              Register
            </Button>
          </Link>
          <Link to="/pages/Login" className="cursor-pointer">
            <Button
              variant="outline"
              className="cursor-pointer px-4 py-1 text-sm font-medium hover:bg-blue-50 transition"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6">
      <p>{`${user.firstName} ${user.lastName}`}</p>
      <Link
        to="/pages/Profile"
        className="w-10 h-10 block rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer"
      >
        <img
          src={defaultProfile}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </Link>
    </div>
  );
};

export default Profile;
