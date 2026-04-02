import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EditorPage } from "@/pages/EditorPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReportPage } from "@/pages/ReportPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
