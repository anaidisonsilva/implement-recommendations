import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import EmendasList from "./pages/EmendasList";
import EmendaDetail from "./pages/EmendaDetail";
import NovaEmenda from "./pages/NovaEmenda";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emendas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EmendasList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emendas/nova"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NovaEmenda />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/emendas/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EmendaDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
