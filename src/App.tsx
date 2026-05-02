import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Index from "./pages/Index.tsx";
import StartProject from "./pages/StartProject.tsx";
import UploadPhotos from "./pages/UploadPhotos.tsx";
import Dimensions from "./pages/Dimensions.tsx";
import BathroomAssessment from "./pages/BathroomAssessment.tsx";
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
import FlowLayout from "./remodel-flow/FlowLayout.tsx";
import FlowStart from "./remodel-flow/pages/Start.tsx";
import FlowStyle from "./remodel-flow/pages/Style.tsx";
import FlowTier from "./remodel-flow/pages/Tier.tsx";
import FlowPackages from "./remodel-flow/pages/Packages.tsx";
import FlowCustomize from "./remodel-flow/pages/Customize.tsx";
import FlowPreview from "./remodel-flow/pages/Preview.tsx";
import FlowMyDesigns from "./remodel-flow/pages/MyDesigns.tsx";

const queryClient = new QueryClient();

function CustomizeRedirect() {
  const { id } = useParams();
  return <Navigate to={`/customize/${id ?? ""}`} replace />;
}

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
              <Route path="/assessment" element={<BathroomAssessment />} />
              <Route path="/style-budget" element={<StyleBudget />} />
              <Route path="/options" element={<RemodelOptions />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/customize/:id" element={<CustomizeOption />} />
              <Route path="/customized/:id" element={<CustomizeRedirect />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/summary" element={<ProjectSummary />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              <Route path="/agreement" element={<Agreement />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              {/* Isolated next-gen remodel flow */}
              <Route path="/remodel-flow" element={<FlowLayout />}>
                <Route index element={<Navigate to="/remodel-flow/start" replace />} />
                <Route path="start" element={<FlowStart />} />
                <Route path="style" element={<FlowStyle />} />
                <Route path="tier" element={<FlowTier />} />
                <Route path="packages" element={<FlowPackages />} />
                <Route path="customize" element={<FlowCustomize />} />
                <Route path="preview" element={<FlowPreview />} />
                <Route path="my-designs" element={<FlowMyDesigns />} />
              </Route>
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
