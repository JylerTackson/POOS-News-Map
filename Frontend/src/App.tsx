import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navBar/NavBar";

//import all the pages
import { ForgorForm } from "./components/Profile/forgor-Password";
import AboutPage from "./pages/AboutUs/page";
import DailyPage from "./pages/Daily/page";
import FavoritesPage from "./pages/Favorites/page";
import HomePage from "./pages/Home/page";
import LoginPage from "./pages/Register/Login";
import RegistrationPage from "./pages/Register/Register";
import ProfilePage from "./pages/Profile/Profile";

import { useUser } from "./Contexts/UserContext";

function App() {
  const { user } = useUser();

  return (
    <>
      <NavBar />

      <div className="pt-16">
        <Routes>
          <Route
            path="/pages/Home"
            element={<HomePage children={undefined} />}
          />
          <Route path="/pages/Favorites" element={<FavoritesPage />} />
          <Route path="/pages/Daily" element={<DailyPage />} />
          <Route path="/pages/Login" element={<LoginPage />} />
          <Route path="/pages/AboutUs" element={<AboutPage />} />
          <Route path="/pages/Register" element={<RegistrationPage />} />
          <Route path="/pages/Forgor" element={<ForgorForm />} />
          <Route
            path="/pages/Profile"
            element={
              <ProfilePage
                _id={user?._id}
                firstName={user?.firstName}
                lastName={user?.lastName}
                email={user?.email}
                avatarUrl={user?.avatarUrl}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
