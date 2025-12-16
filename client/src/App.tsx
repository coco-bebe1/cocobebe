import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/AppContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import ClassPage from "@/pages/Class";
import Notices from "@/pages/Notices";
import Album from "@/pages/Album";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import Teacher from "@/pages/Teacher";
import Nutritionist from "@/pages/Nutritionist";
import ParentProfile from "@/pages/ParentProfile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/classes" component={Home} />
      <Route path="/classes/:id" component={ClassPage} />
      <Route path="/notices" component={Notices} />
      <Route path="/album" component={Album} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/teacher" component={Teacher} />
      <Route path="/nutritionist" component={Nutritionist} />
      <Route path="/profile" component={ParentProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
