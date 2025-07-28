import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Sidebar from "@/components/Sidebar";
import Transactions from "./pages/Transactions";
import { HouseholdProvider } from "./context/HouseholdContext";
import { AuthProvider } from "./context/AuthContext";
import { RegisterForm } from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";

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
          <Route path="/" element={<Transactions />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Index />} />
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
