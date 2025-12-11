import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AIAssistant from "./pages/AI/AIAssistant";
import Solo from "./pages/Solo/Solo";
import Family from "./pages/Family/Family";
import FamilyMember from "./pages/FamilyMember/FamilyMember";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        
        {/* Main Dashboards */}
        <Route path="/solo" element={<Solo />} />
        <Route path="/family" element={<Family />} />
        <Route path="/family-member/:userId" element={<FamilyMember />} />
        
        {/* Backend Redirect Routes (map to actual components) */}
        <Route path="/admin-dashboard" element={<Family />} />
        <Route path="/member-dashboard" element={<Family />} />
        <Route path="/kid-dashboard" element={<Solo />} />
        <Route path="/solo-dashboard" element={<Solo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
