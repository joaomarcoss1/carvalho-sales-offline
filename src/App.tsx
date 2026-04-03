import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterCompany from "@/pages/RegisterCompany";
import RegisterDriver from "@/pages/RegisterDriver";
import Feed from "@/pages/Feed";
import SearchPage from "@/pages/SearchPage";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import Chat from "@/pages/Chat";
import ChatConversation from "@/pages/ChatConversation";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import PDV from "@/pages/PDV";
import CarvalhoVendas from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-company" element={<RegisterCompany />} />
            <Route path="/register-driver" element={<RegisterDriver />} />

            {/* App */}
            <Route element={<AppLayout />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/events" element={<Events />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/pdv" element={<PDV />} />
            </Route>

            {/* Detail pages */}
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/chat/:id" element={<ChatConversation />} />

            {/* Carvalho Vendas - PDV independente */}
            <Route path="/carvalho" element={<CarvalhoVendas />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
