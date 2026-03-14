import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TutorSearch from "./pages/TutorSearch.tsx";
import TutorProfile from "./pages/TutorProfile.tsx";
import Booking from "./pages/Booking.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Classroom from "./pages/Classroom.tsx";
import AIPractice from "./pages/AIPractice.tsx";
import Messages from "./pages/Messages.tsx";
import FAQ from "./pages/FAQ.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<TutorSearch />} />
          <Route path="/tutor/:id" element={<TutorProfile />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/ai-practice" element={<AIPractice />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
