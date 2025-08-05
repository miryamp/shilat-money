import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Transactions from "./pages/Transactions";
import { HouseholdProvider } from "./context/HouseholdContext";
import { AuthProvider } from "./context/AuthContext";
import { RegisterForm } from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import JoinHousehold from "./pages/JoinHousehold";
import HouseholdSettings from "./pages/HouseholdSettings";
import GoogleCallback from "./components/GoogleCallback";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <div className={!isAuthPage ? 'ml-48' : ''}>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/join-household" element={<ProtectedRoute><JoinHousehold /></ProtectedRoute>} />
          <Route path="/household-settings" element={<ProtectedRoute><HouseholdSettings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <HouseholdProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HouseholdProvider>
  </AuthProvider>
);

export default App;
