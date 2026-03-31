import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterCompany from "@/pages/RegisterCompany";
import Feed from "@/pages/Feed";
import SearchPage from "@/pages/SearchPage";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import Chat from "@/pages/Chat";
import ChatConversation from "@/pages/ChatConversation";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-company" element={<RegisterCompany />} />

          {/* App */}
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Detail pages without bottom nav */}
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/chat/:id" element={<ChatConversation />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
