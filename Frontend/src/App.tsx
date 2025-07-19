import { Route, Routes } from "react-router-dom";
import NavBar from "./components/navBar/NavBar";

//import all the pages
import { ForgorForm } from "./components/Registration/forgor-Password";
import AboutPage from "./pages/AboutUs/page";
import DailyPage from "./pages/Daily/page";
import FavoritesPage from "./pages/Favorites/page";
import HomePage from "./pages/Home/page";
import LoginPage from "./pages/Register/Login";
import RegistrationPage from "./pages/Register/Register";
import ProfilePage from "./pages/Profile/Profile";

function App() {

  return (
    <>
      <div className="h-screen w-screen">
        <NavBar />

        <div className="pt-18 h-full w-full">
          <Routes>
            <Route path="/pages/Home" element={<HomePage />} />
            <Route path="/pages/Favorites" element={<FavoritesPage />} />
            <Route path="/pages/Daily" element={<DailyPage />} />
            <Route path="/pages/Login" element={<LoginPage />} />
            <Route path="/pages/AboutUs" element={<AboutPage />} />
            <Route path="/pages/Register" element={<RegistrationPage />} />
            <Route path="/pages/Forgor" element={<ForgorForm />} />
            <Route
              path="/pages/Profile"
              element={
                <ProfilePage/>
              }
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
