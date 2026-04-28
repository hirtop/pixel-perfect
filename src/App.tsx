import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Index from "./pages/Index.tsx";
import StartProject from "./pages/StartProject.tsx";
import UploadPhotos from "./pages/UploadPhotos.tsx";
import Dimensions from "./pages/Dimensions.tsx";
import StyleBudget from "./pages/StyleBudget.tsx";
import RemodelOptions from "./pages/RemodelOptions.tsx";
import PackageDetail from "./pages/PackageDetail.tsx";
import CustomizeOption from "./pages/CustomizeOption.tsx";
import Workflow from "./pages/Workflow.tsx";
import ProjectSummary from "./pages/ProjectSummary.tsx";
import Subcontractors from "./pages/Subcontractors.tsx";
import Agreement from "./pages/Agreement.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Contact from "./pages/Contact.tsx";
import Shop from "./pages/Shop.tsx";
import Disclaimer from "./pages/Disclaimer.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/start" element={<StartProject />} />
              <Route path="/upload" element={<UploadPhotos />} />
              <Route path="/dimensions" element={<Dimensions />} />
              <Route path="/style-budget" element={<StyleBudget />} />
              <Route path="/options" element={<RemodelOptions />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/customize/:id" element={<CustomizeOption />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/summary" element={<ProjectSummary />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              <Route path="/agreement" element={<Agreement />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
