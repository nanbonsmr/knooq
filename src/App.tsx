import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ExplorePage from "./pages/ExplorePage";
import ArticlePage from "./pages/ArticlePage";
import BookmarksPage from "./pages/BookmarksPage";
import NotesPage from "./pages/NotesPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import MobileFAB from "./components/MobileFAB";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/article/:title" element={<ArticlePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileFAB />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
