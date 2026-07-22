import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import EventsPage from "@/pages/events-page";
import EventDetails from "@/pages/event-details";
import CreateEvent from "@/pages/create-event";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";

function AuthenticatedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/events" component={EventsPage} />
        <Route path="/events/new" component={CreateEvent} />
        <Route path="/events/:id" component={EventDetails} />
        <Route path="/community" component={Community} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        {/* Redirect all other routes to login via the landing page or auth guard */}
        <Route component={Landing} />
      </Switch>
    );
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
