// components/navigations.tsx
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import {
  LinkIcon,
  HomeIcon,
  HeartIcon,
  ClockIcon,
  InfoIcon,
} from "lucide-react";

const menuItems = [
  { href: "/pages/Home", label: "Home", Icon: HomeIcon },
  { href: "/pages/Favorites", label: "Favorites", Icon: HeartIcon },
  { href: "/pages/Daily", label: "Daily", Icon: ClockIcon },
  { href: "/pages/AboutUs", label: "About Us", Icon: InfoIcon },
];

const Navigations = () => {
  return (
    <nav className="flex-1">
      <NavigationMenu>
        <NavigationMenuList className="flex justify-center space-x-6">
          {menuItems.map(({ href, label, Icon }) => {
            const isActive = window.location.pathname === href;
            return (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  href={href}
                  className={`
                    inline-flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{label}</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default Navigations;
