import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import PrizeDrawManagement from "@/pages/PrizeDrawManagement";
import { useEffect } from "react";
import { wprest } from "./utils/rest";

const App: React.FC = () => {
  useEffect(() => {
    (async function () {
      wprest.GetToken();
    })();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="" element={<PrizeDrawManagement />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
