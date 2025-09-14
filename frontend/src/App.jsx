import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./useContext/Context";
import "./App.css";
function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashBoard />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;
