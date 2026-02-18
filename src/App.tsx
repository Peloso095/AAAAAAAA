import React from "react";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AccessGate } from "@/components/AccessGate";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Assinatura from "./pages/Assinatura";
import Onboarding from "./pages/Onboarding";
import Importar from "./pages/Importar";
import Materias from "./pages/Materias";
import Resumos from "./pages/Resumos";
import Flashcards from "./pages/Flashcards";
import Questoes from "./pages/Questoes";
import ClinicaVirtual from "./pages/ClinicaVirtual";
import Portfolio from "./pages/Portfolio";
import Agenda from "./pages/Agenda";
import Conquistas from "./pages/Conquistas";
import Calculadoras from "./pages/Calculadoras";
import BibliotecaDiagnostica from "./pages/BibliotecaDiagnostica";
import SimuladorOSCE from "./pages/SimuladorOSCE";
import Procedimentos from "./pages/Procedimentos";
import Comparador from "./pages/Comparador";
import RankingSintomas from "./pages/RankingSintomas";
import SoftSkills from "./pages/SoftSkills";
import TutorIA from "./pages/TutorIA";
import CramMode from "./pages/CramMode";
import NotFound from "./pages/NotFound";
import Diagnostico from "./pages/Diagnostico";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Algo deu errado
            </h1>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro ao carregar o aplicativo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Ver detalhes do erro
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
function AppLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🏥</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">MEDTRACK</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Carregando...</p>
      </div>
    </div>
  );
}

// Protected route - requires authentication and access
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoading />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AccessGate>{children}</AccessGate>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/assinatura" element={<Assinatura />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/importar" element={<ProtectedRoute><Importar /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/materias" element={<ProtectedRoute><Materias /></ProtectedRoute>} />
      <Route path="/resumos" element={<ProtectedRoute><Resumos /></ProtectedRoute>} />
      <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
      <Route path="/questoes" element={<ProtectedRoute><Questoes /></ProtectedRoute>} />
      <Route path="/clinica" element={<ProtectedRoute><ClinicaVirtual /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
      <Route path="/conquistas" element={<ProtectedRoute><Conquistas /></ProtectedRoute>} />
      <Route path="/calculadoras" element={<ProtectedRoute><Calculadoras /></ProtectedRoute>} />
      <Route path="/biblioteca" element={<ProtectedRoute><BibliotecaDiagnostica /></ProtectedRoute>} />
      <Route path="/osce" element={<ProtectedRoute><SimuladorOSCE /></ProtectedRoute>} />
      <Route path="/procedimentos" element={<ProtectedRoute><Procedimentos /></ProtectedRoute>} />
      <Route path="/comparador" element={<ProtectedRoute><Comparador /></ProtectedRoute>} />
      <Route path="/sintomas" element={<ProtectedRoute><RankingSintomas /></ProtectedRoute>} />
      <Route path="/softskills" element={<ProtectedRoute><SoftSkills /></ProtectedRoute>} />
      <Route path="/tutor" element={<ProtectedRoute><TutorIA /></ProtectedRoute>} />
      <Route path="/crammode" element={<ProtectedRoute><CramMode /></ProtectedRoute>} />
      <Route path="/diagnostico" element={<ProtectedRoute><Diagnostico /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
