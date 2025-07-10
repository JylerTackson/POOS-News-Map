import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/Signup/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img src="../public/newsmap.webp" className="h-15 w-15" />
            News Map
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="vh-100 flex items-center">
        <img src="../Public/Login.avif" alt="Image" className="" />
      </div>
    </div>
  );
}
