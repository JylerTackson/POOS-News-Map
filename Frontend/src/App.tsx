import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./Nav";

//import all the pages
import { ForgorForm } from "./components/Signup/forgor-Password";
import AboutPage from "./pages/AboutUs/page";
import DailyPage from "./pages/Daily/page";
import FavoritesPage from "./pages/Favorites/page";
import HomePage from "./pages/Home/page";
import LoginPage from "./pages/Register/Login";
import RegistrationPage from "./pages/Register/Register";

function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/pages/Home" element={<HomePage children={undefined} />} />
        <Route path="/pages/Favorites" element={<FavoritesPage />} />
        <Route path="/pages/Daily" element={<DailyPage />} />
        <Route path="/pages/Login" element={<LoginPage />} />
        <Route path="/pages/AboutUs" element={<AboutPage />} />
        <Route path="/pages/Register" element={<RegistrationPage />} />
        <Route path="/pages/Forgor" element={<ForgorForm />} />
      </Routes>
    </>
  );
}

export default App;
