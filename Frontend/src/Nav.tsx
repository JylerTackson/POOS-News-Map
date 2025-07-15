import { LinkIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./components/ui/navigation-menu";

const NavBar = () => {
  const menuItems = [
    { href: "/pages/Home", label: "Home" },
    { href: "/pages/Favorites", label: "Favorites" },
    { href: "/pages/Daily", label: "Daily" },
    { href: "/pages/Register", label: "Register" },
    { href: "/pages/AboutUs", label: "About Us" },
  ];

  return (
    <nav className="bg-gray-200 shadow-md">
      <div className="max-w-5xl mx-auto flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="flex justify-center items-center space-x-6 px-6 py-4">
            {menuItems.map((item) => {
              const isActive = item.href;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={`
                      inline-flex items-center justify-center space-x-1.5 px-3 py-2
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <LinkIcon size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default NavBar;
