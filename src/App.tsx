import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TasksPage from "./pages/TasksPage";
import ContentPage from "./pages/ContentPage";
import CalendarPage from "./pages/CalendarPage";
import MemoryPage from "./pages/MemoryPage";
import TeamPage from "./pages/TeamPage";
import OfficePage from "./pages/OfficePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/office" element={<OfficePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
