import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import PrizeDrawManagement from "@/pages/PrizeDrawManagement";

const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="" element={<PrizeDrawManagement />} />
    </Routes>
  </HashRouter>
);

export default App;
