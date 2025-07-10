// components/Logo.tsx
import React from "react";
import logo from "../../../public/newsmap.png";

const Logo = () => {
  return (
    <div className="w-12 h-12 flex-shrink-0">
      <img
        src={logo}
        alt="News Map Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
