import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProfilePage from "./pages/Profile/Profile";
import FinanceTracker from "./pages/Finance/Finance";
import AnalyticsPage from "./pages/Analytics/Analytics";
import AIRecommendations from "./pages/AIRecommendations/AIRecommendations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/finance" element={<FinanceTracker />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai-recommendations" element={<AIRecommendations />} />
        <Route path="/solo-dashboard" element={<ProfilePage />} />
        <Route path="*" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
