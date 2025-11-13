import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Download, 
  Loader2, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users,
  Plus,
  Settings,
  Trash2,
  Mail,
  Menu
} from "lucide-react";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import type { User, Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { z } from "zod";

// Input validation schemas
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
const statusSchema = z.enum(["pending", "confirmed", "completed", "cancelled"]);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format");
const reasonSchema = z.string().max(500, "Reason must be less than 500 characters").trim();

interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  contact_method: string;
  services: string[];
  description: string | null;
  appointment_date: string;
  appointment_time: string;
  payment_status: string | null;
  status: string;
  stripe_session_id: string | null;
  file_url: string | null;
  how_heard: string | null;
  created_at: string;
}

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

interface Stats {
  today_count: number;
  upcoming_count: number;
  paid_count: number;
  total_revenue: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterService, setFilterService] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [stats, setStats] = useState<Stats>({ today_count: 0, upcoming_count: 0, paid_count: 0, total_revenue: 0 });
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          checkAdminStatus(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    console.log("Checking admin status for user:", userId);
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    console.log("Admin check result:", { data, error });

    if (error || !data) {
      console.error("Admin access denied:", error?.message || "No admin role found");
      setIsAdmin(false);
      setLoading(false);
      toast.error("Access denied. Admin role required.");
      navigate("/");
      return;
    }

    console.log("Admin access granted");
    setIsAdmin(true);
    setLoading(false);
    fetchAllData();
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchAppointments(),
      fetchStats(),
      fetchWorkingHours(),
      fetchBlockedDates()
    ]);
  };

  const fetchStats = async () => {
    console.log("Fetching stats...");
    
    const { data, error } = await supabase
      .from("appointments")
      .select("*");

    console.log("Stats fetch result:", { count: data?.length || 0, error: error?.message });

    if (error) {
      console.error("Stats fetch error:", error);
      toast.error(`Failed to fetch stats: ${error.message}`);
      return;
    }

    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const stats: Stats = {
        today_count: data.filter(apt => apt.appointment_date === today).length,
        upcoming_count: data.filter(apt => apt.appointment_date > today).length,
        paid_count: data.filter(apt => apt.payment_status === 'paid').length,
        total_revenue: data.filter(apt => apt.payment_status === 'paid').length * 25
      };
      console.log("Calculated stats:", stats);
      setStats(stats);
    }
  };

  const fetchAppointments = async () => {
    console.log("Fetching appointments...");
    
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Appointments fetch result:", { 
      count: data?.length || 0, 
      error: error?.message,
      data: data 
    });

    if (error) {
      console.error("Appointments fetch error:", error);
      toast.error(`Failed to fetch appointments: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("No appointments found in database");
      toast.info("No appointments found");
    }

    setAppointments(data || []);
    setFilteredAppointments(data || []);
  };

  const fetchWorkingHours = async () => {
    const { data } = await supabase
      .from("working_hours")
      .select("*")
      .order("day_of_week");
    
    setWorkingHours(data || []);
  };

  const fetchBlockedDates = async () => {
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_date");
    
    setBlockedDates(data || []);
  };

  useEffect(() => {
    let filtered = appointments;

    if (filterService !== "all") {
      filtered = filtered.filter(apt => apt.services.includes(filterService));
    }

    if (filterDate) {
      filtered = filtered.filter(apt => apt.appointment_date === filterDate);
    }

    setFilteredAppointments(filtered);
  }, [filterService, filterDate, appointments]);

  const isAllSelected = filteredAppointments.length > 0 && filteredAppointments.every(apt => selectedIds.has(apt.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked?: boolean) => {
    setSelectedIds(prev => {
      // if explicit checked value provided, use it; otherwise toggle based on current state
      const selectAll = typeof checked === 'boolean' ? checked : !isAllSelected;
      if (!selectAll) return new Set();
      return new Set(filteredAppointments.map(a => a.id));
    });
  };

  const deleteSelected = async (ids?: string[]) => {
    const targetIds = ids ?? Array.from(selectedIds);
    if (targetIds.length === 0) return { success: false, message: 'No appointments selected' };

    setDeleting(true);
    try {
      // Request deleted rows back so we can verify deletion succeeded
      const { data: deleted, error } = await supabase
        .from('appointments')
        .delete()
        .in('id', targetIds)
        .select('*');

      if (error) {
        console.error('Delete error', error);
        return { success: false, message: error.message };
      }

      // If no rows returned, deletion may have been blocked by RLS or not found
      if (!deleted || deleted.length === 0) {
        return { success: false, message: 'No rows deleted. Check permissions or IDs.' };
      }

      // Refresh UI
      await fetchAppointments();
      await fetchStats();
      setSelectedIds(new Set());
      return { success: true, message: `Deleted ${deleted.length} appointment(s)` };
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Validate input
    try {
      statusSchema.parse(newStatus);
    } catch (error) {
      toast.error("Invalid status value");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated successfully");
    fetchAppointments();
    setEditingAppointment(null);
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate) {
      toast.error("Please select a date");
      return;
    }

    // Validate inputs
    try {
      dateSchema.parse(newBlockedDate);
      reasonSchema.parse(newBlockedReason);
    } catch (error) {
      toast.error("Invalid input format");
      return;
    }

    const { error } = await supabase
      .from("blocked_dates")
      .insert({ 
        blocked_date: newBlockedDate, 
        reason: newBlockedReason.trim() || null 
      });

    if (error) {
      toast.error("Failed to add blocked date");
      return;
    }

    toast.success("Date blocked successfully");
    setNewBlockedDate("");
    setNewBlockedReason("");
    fetchBlockedDates();
  };

  const handleDeleteBlockedDate = async (id: string) => {
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete blocked date");
      return;
    }

    toast.success("Blocked date removed");
    fetchBlockedDates();
  };

  const handleUpdateWorkingHours = async (id: string, field: string, value: any) => {
    // Validate time fields
    if ((field === 'start_time' || field === 'end_time') && typeof value === 'string') {
      try {
        timeSchema.parse(value);
      } catch (error) {
        toast.error("Invalid time format");
        return;
      }
    }

    // Validate allowed fields
    const allowedFields = ['start_time', 'end_time', 'slot_duration', 'is_active'];
    if (!allowedFields.includes(field)) {
      toast.error("Invalid field");
      return;
    }

    const { error } = await supabase
      .from("working_hours")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update working hours");
      return;
    }

    toast.success("Working hours updated");
    fetchWorkingHours();
  };

  const exportToCSV = () => {
    const headers = ["Date", "Time", "Name", "Email", "Phone", "Services", "Status", "Payment Status"];
    const rows = filteredAppointments.map(apt => [
      apt.appointment_date,
      apt.appointment_time,
      apt.full_name,
      apt.email,
      apt.phone || "",
      apt.services.join("; "),
      apt.status,
      apt.payment_status || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const sendReminder = async (appointment: Appointment) => {
    const { error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: appointment.email,
        name: appointment.full_name,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        services: appointment.services,
      },
    });

    if (error) {
      toast.error("Failed to send reminder");
      return;
    }

    toast.success("Reminder sent successfully");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Calculate chart data
  const getWeeklyData = () => {
    const weekData = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: 0
      };
    });

    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - aptDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        weekData[6 - daysDiff].appointments++;
      }
    });

    return weekData;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <SEO 
        title="Admin Dashboard - OneStop Application Services"
        description="Manage appointments and bookings"
      />
      <AnimatedBackground />
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative">
          <AdminSidebar />
          
          <main className="flex-1 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
              <div className="container flex h-16 items-center gap-4 px-4">
                <SidebarTrigger className="hover:bg-accent hover-lift" />
                <motion.div 
                  className="flex-1 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </motion.div>
              </div>
            </header>

            <div className="container mx-auto px-4 py-8 space-y-8" id="dashboard">

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm shadow-lg card-glow group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Calendar className="h-6 w-6 text-primary" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{stats.today_count}</div>
                      <p className="text-xs text-muted-foreground mt-2">Scheduled for today</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent backdrop-blur-sm shadow-lg card-glow group">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="h-6 w-6 text-secondary" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-4xl font-bold bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent">{stats.upcoming_count}</div>
                      <p className="text-xs text-muted-foreground mt-2">Future appointments</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent backdrop-blur-sm shadow-lg card-glow group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Paid Bookings</CardTitle>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Users className="h-6 w-6 text-green-600" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">{stats.paid_count}</div>
                      <p className="text-xs text-muted-foreground mt-2">Confirmed payments</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent backdrop-blur-sm shadow-lg card-glow group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <DollarSign className="h-6 w-6 text-amber-600" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-4xl font-bold bg-gradient-to-br from-amber-600 to-amber-400 bg-clip-text text-transparent">${stats.total_revenue}</div>
                      <p className="text-xs text-muted-foreground mt-2">From deposits</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </motion.div>
                      Weekly Appointments
                    </CardTitle>
                    <CardDescription>Last 7 days booking statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getWeeklyData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="day" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="appointments" 
                          fill="hsl(var(--primary))" 
                          radius={[8, 8, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Appointments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-xl" id="appointments">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            📅
                          </motion.span>
                          Appointments Management
                        </CardTitle>
                        <CardDescription>View and manage all bookings</CardDescription>
                      </div>
                      <motion.div 
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Button 
                          onClick={exportToCSV} 
                          variant="outline"
                          className="hover:bg-accent hover-lift shadow-md"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service-filter">Filter by Service</Label>
                      <Select value={filterService} onValueChange={setFilterService}>
                        <SelectTrigger id="service-filter">
                          <SelectValue placeholder="All Services" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="visa">Visa Form Preparation</SelectItem>
                          <SelectItem value="college">College Application Support</SelectItem>
                          <SelectItem value="document">Document Evaluation</SelectItem>
                          <SelectItem value="licensing">Licensing Board Support</SelectItem>
                          <SelectItem value="job">Job Application Support</SelectItem>
                          <SelectItem value="business">Business License Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date-filter">Filter by Date</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-lg border bg-card/50 backdrop-blur overflow-hidden shadow-lg">
                    {/* Selection toolbar */}
                    {selectedIds.size > 0 && (
                      <div className="flex items-center justify-between p-3 border-b bg-background/60">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{selectedIds.size} selected</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="hover-lift">
                            Deselect
                          </Button>
                        </div>
                        <div>
                          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" className="shadow-md">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm deletion</DialogTitle>
                                <DialogDescription>You're about to delete {selectedIds.size} appointment(s). This action cannot be undone.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-2 py-4 max-h-40 overflow-auto">
                                {filteredAppointments.filter(a => selectedIds.has(a.id)).map(a => (
                                  <div key={a.id} className="flex items-center justify-between p-2 rounded-md bg-muted/10">
                                    <div>
                                      <div className="font-medium">{a.full_name}</div>
                                      <div className="text-sm text-muted-foreground">{a.appointment_date} {a.appointment_time}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    const result = await deleteSelected();
                                    if (result.success) {
                                      toast.success(result.message);
                                      setShowDeleteDialog(false);
                                    } else {
                                      toast.error(result.message);
                                    }
                                  }}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <div className="flex items-center justify-center">
                                <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                              </div>
                            </TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAppointments.map((apt) => (
                            <TableRow key={apt.id} className="hover:bg-accent/50 transition-colors">
                            <TableCell className="w-12">
                              <div className="flex items-center justify-center">
                                <Checkbox checked={selectedIds.has(apt.id)} onCheckedChange={() => toggleSelect(apt.id)} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{apt.appointment_date}</div>
                                  <div className="text-sm text-muted-foreground">{apt.appointment_time}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{apt.full_name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{apt.email}</div>
                                {apt.phone && <div className="text-muted-foreground">{apt.phone}</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {apt.services.slice(0, 2).map((service, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                                {apt.services.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{apt.services.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  apt.status === "completed" ? "default" :
                                  apt.status === "confirmed" ? "secondary" :
                                  apt.status === "cancelled" ? "destructive" :
                                  "outline"
                                }
                              >
                                {apt.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={apt.payment_status === "paid" ? "default" : "outline"}
                              >
                                {apt.payment_status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setEditingAppointment(apt)}
                                        className="shadow-md hover-lift"
                                      >
                                        Edit
                                      </Button>
                                    </motion.div>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Update Appointment</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Customer: {apt.full_name}</Label>
                                        <Label>Date: {apt.appointment_date} at {apt.appointment_time}</Label>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                          defaultValue={apt.status}
                                          onValueChange={(value) => handleStatusUpdate(apt.id, value)}
                                        >
                                          <SelectTrigger id="status">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => sendReminder(apt)}
                                    className="shadow-md hover-lift"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // select this single appointment and open confirm dialog
                                      setSelectedIds(new Set([apt.id]));
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* Availability Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-xl" id="availability">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/3 via-transparent to-primary/3 pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      >
                        ⏰
                      </motion.span>
                      Working Hours Configuration
                    </CardTitle>
                    <CardDescription>Set your available days and hours for appointments</CardDescription>
                  </CardHeader>
                <CardContent className="space-y-4">
                  {dayNames.map((day, index) => {
                    const workingHour = workingHours.find(wh => wh.day_of_week === index);
                    return (
                      <motion.div 
                        key={index} 
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur hover:bg-card/70 transition-all hover-lift"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-32 font-medium">{day}</div>
                        {workingHour ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={workingHour.start_time.substring(0, 5)}
                                onChange={(e) => handleUpdateWorkingHours(workingHour.id, 'start_time', e.target.value)}
                                className="w-32"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={workingHour.end_time.substring(0, 5)}
                                onChange={(e) => handleUpdateWorkingHours(workingHour.id, 'end_time', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label>Slot Duration:</Label>
                              <Input
                                type="number"
                                value={workingHour.slot_duration}
                                onChange={(e) => handleUpdateWorkingHours(workingHour.id, 'slot_duration', parseInt(e.target.value))}
                                className="w-20"
                                min="15"
                                step="15"
                              />
                              <span>min</span>
                            </div>
                            <Button
                              variant={workingHour.is_active ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleUpdateWorkingHours(workingHour.id, 'is_active', !workingHour.is_active)}
                              className="ml-auto"
                            >
                              {workingHour.is_active ? "Active" : "Inactive"}
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">Not configured</Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
              </motion.div>

              {/* Blocked Dates Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-xl" id="blocked">
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/3 via-transparent to-primary/3 pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🚫
                      </motion.span>
                      Add Blocked Date
                    </CardTitle>
                    <CardDescription>Block specific dates for holidays or breaks</CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Reason (optional)</Label>
                      <Input
                        placeholder="e.g., Holiday, Personal break"
                        value={newBlockedReason}
                        onChange={(e) => setNewBlockedReason(e.target.value)}
                      />
                    </div>
                    <motion.div 
                      className="flex items-end"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button onClick={handleAddBlockedDate} className="hover-lift shadow-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>

                {/* Blocked Dates List */}
                <CardHeader className="border-t relative z-10">
                  <CardTitle className="text-foreground">Current Blocked Dates</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    {blockedDates.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No blocked dates configured</p>
                    ) : (
                      blockedDates.map((blocked) => (
                        <motion.div 
                          key={blocked.id} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-card/50 backdrop-blur hover:bg-card/70 transition-all hover-lift"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div>
                            <div className="font-medium">{blocked.blocked_date}</div>
                            {blocked.reason && <div className="text-sm text-muted-foreground">{blocked.reason}</div>}
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBlockedDate(blocked.id)}
                              className="shadow-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Admin;
