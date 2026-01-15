import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import PrefeituraLayout from "./components/layout/PrefeituraLayout";
import Dashboard from "./pages/Dashboard";
import EmendasList from "./pages/EmendasList";
import EmendaDetail from "./pages/EmendaDetail";
import NovaEmenda from "./pages/NovaEmenda";
import Auth from "./pages/Auth";
import TransparenciaPublica from "./pages/TransparenciaPublica";
import TransparenciaEmendaDetail from "./pages/TransparenciaEmendaDetail";
import NotFound from "./pages/NotFound";
import Relatorios from "./pages/Relatorios";
import AdminPrefeituras from "./pages/admin/AdminPrefeituras";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import PrefeituraPortal from "./pages/prefeitura/PrefeituraPortal";
import PrefeituraAuth from "./pages/prefeitura/PrefeituraAuth";
import PrefeturaDashboard from "./pages/prefeitura/PrefeturaDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas de transparência */}
            <Route path="/" element={<TransparenciaPublica />} />
            <Route path="/transparencia" element={<TransparenciaPublica />} />
            <Route path="/transparencia/:id" element={<TransparenciaEmendaDetail />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Rotas de prefeitura (white-label) */}
            <Route path="/p/:slug" element={<PrefeituraPortal />} />
            <Route path="/p/:slug/auth" element={<PrefeituraAuth />} />
            <Route
              path="/p/:slug/dashboard"
              element={
                <ProtectedRoute>
                  <PrefeituraLayout>
                    <PrefeturaDashboard />
                  </PrefeituraLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/p/:slug/emendas"
              element={
                <ProtectedRoute>
                  <PrefeituraLayout>
                    <EmendasList />
                  </PrefeituraLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Rotas protegidas - Super Admin */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prefeituras"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminPrefeituras />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminUsuarios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Relatorios />
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
