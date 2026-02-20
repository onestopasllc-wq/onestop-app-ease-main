import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Testimonials from "./pages/Testimonials";
import Appointment from "./pages/Appointment";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import Auth from "./pages/Auth";
import UserAuth from "./pages/UserAuth";
import Admin from "./pages/Admin";
import Job from "./pages/Job";
import Dealerships from "./pages/Dealerships";
import Insurance from "./pages/Insurance";
import HealthInsurance from "./pages/HealthInsurance";
import Rentals from "./pages/Rentals";
import { RentalForm } from "./components/rentals/RentalForm";
import UserDashboardLayout from "./components/dashboard/UserDashboardLayout";
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserListings from "./pages/dashboard/UserListings";
import UserProfile from "./pages/dashboard/UserProfile";
import CommunityServices from "./pages/CommunityServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/appointment-success" element={<AppointmentSuccess />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<UserAuth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/job" element={<Job />} />
        <Route path="/dealerships" element={<Dealerships />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/health-insurance" element={<HealthInsurance />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/community-services" element={<CommunityServices />} />


        {/* User Dashboard */}
        <Route path="/dashboard" element={<UserDashboardLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="listings" element={<UserListings />} />
          <Route path="settings" element={<UserProfile />} />
          <Route path="rentals/new" element={<RentalForm />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
