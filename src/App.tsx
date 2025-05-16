import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Requisitions from "./pages/Requisitions";
import Candidates from "./pages/Candidates";
import Approvals from "./pages/Approvals";
import Apply from "./pages/Apply";
import ReviewAssignment from "./pages/ReviewAssignment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/review-assignment" element={<ReviewAssignment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
