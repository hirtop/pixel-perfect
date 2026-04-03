import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/start" element={<StartProject />} />
          <Route path="/upload" element={<UploadPhotos />} />
          <Route path="/dimensions" element={<Dimensions />} />
          <Route path="/style-budget" element={<StyleBudget />} />
          <Route path="/options" element={<RemodelOptions />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/customize/:id" element={<CustomizeOption />} />
          <Route path="/workflow" element={<Workflow />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
