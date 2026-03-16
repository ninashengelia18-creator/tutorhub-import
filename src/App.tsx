import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TutorSearch from "./pages/TutorSearch.tsx";
import TutorProfile from "./pages/TutorProfile.tsx";
import Booking from "./pages/Booking.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Classroom from "./pages/Classroom.tsx";
import AIPractice from "./pages/AIPractice.tsx";
import Messages from "./pages/Messages.tsx";
import TutorMessages from "./pages/TutorMessages.tsx";
import FAQ from "./pages/FAQ.tsx";
import ForBusiness from "./pages/ForBusiness.tsx";
import BecomeTutor from "./pages/BecomeTutor.tsx";
import TutorApply from "./pages/TutorApply.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import StudentSignup from "./pages/StudentSignup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import TutorSettings from "./pages/TutorSettings.tsx";
import BookingConfirmation from "./pages/BookingConfirmation.tsx";
import MyLessons from "./pages/MyLessons.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import CookiePolicy from "./pages/CookiePolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import LessonPlanner from "./pages/LessonPlanner.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import TutorDashboard from "./pages/TutorDashboard.tsx";
import TutorSchedule from "./pages/TutorSchedule.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<TutorSearch />} />
              <Route path="/tutor/:id" element={<TutorProfile />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/booking-confirmation" element={<ProtectedRoute requiredRole="student"><BookingConfirmation /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><Dashboard /></ProtectedRoute>} />
              <Route path="/classroom" element={<ProtectedRoute requiredRole="student"><Classroom /></ProtectedRoute>} />
              <Route path="/ai-practice" element={<AIPractice />} />
              <Route path="/messages" element={<ProtectedRoute requiredRole="student"><Messages /></ProtectedRoute>} />
              <Route path="/my-lessons" element={<ProtectedRoute requiredRole="student"><MyLessons /></ProtectedRoute>} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/for-business" element={<ForBusiness />} />
              <Route path="/become-tutor" element={<BecomeTutor />} />
              <Route path="/tutor-apply" element={<TutorApply />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signup/student" element={<StudentSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<ProtectedRoute requiredRole="student"><ProfileSettings /></ProtectedRoute>} />
              <Route path="/tutor-settings" element={<ProtectedRoute requiredRole="tutor"><TutorSettings /></ProtectedRoute>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/lesson-planner" element={<ProtectedRoute requiredRole="tutor"><LessonPlanner /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/tutor-dashboard" element={<ProtectedRoute requiredRole="tutor"><TutorDashboard /></ProtectedRoute>} />
              <Route path="/tutor-schedule" element={<ProtectedRoute requiredRole="tutor"><TutorSchedule /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
