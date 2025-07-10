// components/NavBar.tsx
import { LinkIcon } from "lucide-react";
import Logo from "./logo";
import Navigations from "./navigations";
import Profile from "./profile";

const NavBar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Logo />
        <Navigations />
        <Profile />
      </div>
    </header>
  );
};

export default NavBar;
