import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ExplorePage from "./pages/ExplorePage";
import ArticlePage from "./pages/ArticlePage";
import BookmarksPage from "./pages/BookmarksPage";
import NotesPage from "./pages/NotesPage";
import AuthPage from "./pages/AuthPage";
import PricingPage from "./pages/PricingPage";
import DashboardPage from "./pages/DashboardPage";
import InstallPage from "./pages/InstallPage";
import OfflineArticlesPage from "./pages/OfflineArticlesPage";
import NotFound from "./pages/NotFound";
import MobileFAB from "./components/MobileFAB";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<ExplorePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/offline" element={<OfflineArticlesPage />} />
              <Route path="/article/:title" element={<ArticlePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileFAB />
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
