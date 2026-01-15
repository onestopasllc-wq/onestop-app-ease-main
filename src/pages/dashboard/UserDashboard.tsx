import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, TrendingUp, Home, Bell } from "lucide-react";
import { motion } from "framer-motion";

const UserDashboard = () => {
    const [userName, setUserName] = useState("User");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeListings: 0,
        pendingListings: 0,
        totalViews: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserName(user.user_metadata.full_name || "User");

                // Fetch listing count
                const { count: activeCount } = await supabase
                    .from("rental_listings" as any)
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .eq("status", "approved");

                const { count: pendingCount } = await supabase
                    .from("rental_listings" as any)
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .eq("status", "pending_approval");

                setStats(prev => ({
                    ...prev,
                    activeListings: activeCount || 0,
                    pendingListings: pendingCount || 0
                }));

                // Fetch total views
                const { data: listings } = await supabase
                    .from("rental_listings" as any)
                    .select("views")
                    .eq("user_id", user.id);

                const totalViews = listings?.reduce((sum, item: any) => sum + (item.views || 0), 0) || 0;

                setStats(prev => ({
                    ...prev,
                    totalViews
                }));
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Hello, {userName}</h2>
                    <p className="text-muted-foreground">Here's what's happening with your rental listings today.</p>
                </div>
                <Button asChild className="shadow-lg hover:shadow-primary/25">
                    <Link to="/dashboard/rentals/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Post New Rental
                    </Link>
                </Button>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
                <motion.div variants={item}>
                    <Card className="hover:shadow-md transition-shadow duration-300 border-l-4 border-l-primary/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.activeListings}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently live on the platform
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="hover:shadow-md transition-shadow duration-300 border-l-4 border-l-amber-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.pendingListings}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting admin review
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="hover:shadow-md transition-shadow duration-300 border-l-4 border-l-green-500/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats.totalViews}</div>
                            <p className="text-xs text-muted-foreground">
                                Total views across all listings
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
            >
                <Card className="col-span-4 bg-gradient-to-br from-card to-secondary/10 border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest actions and notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Empty state for now */}
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <div className="rounded-full bg-secondary/30 p-3 mb-3">
                                    <Bell className="h-6 w-6 opacity-50" />
                                </div>
                                <p>No recent activity to show.</p>
                                <Button variant="link" asChild>
                                    <Link to="/dashboard/rentals/new">Create your first listing</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-primary/5 border-primary/10">
                    <CardHeader>
                        <CardTitle>Quick Tips</CardTitle>
                        <CardDescription>
                            Maximize your listing's potential
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium">Quality Photos</h4>
                                <p className="text-xs text-muted-foreground">Upload at least 5 high-res photos to get 40% more views.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium">Detailed Description</h4>
                                <p className="text-xs text-muted-foreground">Mention amenities and neighborhood highlights.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserDashboard;
