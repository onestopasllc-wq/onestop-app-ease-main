import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Car, ExternalLink, Search, MapPin, Globe } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Dealership {
    id: string;
    name: string;
    website_url: string;
    logo_url: string | null;
    description: string;
    is_featured: boolean;
    display_order: number;
}

const Dealerships = () => {
    const [dealerships, setDealerships] = useState<Dealership[]>([]);
    const [filteredDealerships, setFilteredDealerships] = useState<Dealership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDealerships();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredDealerships(dealerships);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredDealerships(
                dealerships.filter(d =>
                    d.name.toLowerCase().includes(lowerTerm) ||
                    d.description.toLowerCase().includes(lowerTerm)
                )
            );
        }
    }, [searchTerm, dealerships]);

    const fetchDealerships = async () => {
        try {
            // Cast to any to bypass type check since table is new
            const { data, error } = await (supabase
                .from("dealerships" as any)
                .select("*")
                .eq("is_active", true)
                .order("is_featured", { ascending: false })
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false })) as any;

            if (error) throw error;
            setDealerships(data || []);
            setFilteredDealerships(data || []); // Initialize filtered list
        } catch (err) {
            console.error("Failed to fetch dealerships:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            <SEO
                title="Car Dealership Partners - OneStop Application Services"
                description="Browse our trusted car dealership partners and find your next vehicle."
            />
            <AnimatedBackground />
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1 text-sm rounded-full">
                            Trusted Partners
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
                            Find Your Perfect Ride
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Explore our curated list of premier car dealerships. Whether you're looking for luxury, reliability, or value, our partners have you covered.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-md mx-auto mb-12 relative"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search dealerships..."
                                className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-white/10 text-lg shadow-xl transition-all focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : filteredDealerships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDealerships.map((dealership, index) => (
                            <motion.div
                                key={dealership.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className="h-full flex flex-col overflow-hidden border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-xl group">
                                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden flex items-center justify-center p-6">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                                        {dealership.logo_url ? (
                                            <img
                                                src={dealership.logo_url}
                                                alt={dealership.name}
                                                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                                                <Car className="w-10 h-10 text-white/50" />
                                            </div>
                                        )}
                                        {dealership.is_featured && (
                                            <Badge className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 border-none text-white shadow-lg">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">
                                            {dealership.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-primary/80">
                                            <Globe className="w-3.5 h-3.5" />
                                            Website Partner
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                            {dealership.description}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-white/5">
                                        <Button
                                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                            variant="outline"
                                            asChild
                                        >
                                            <a href={dealership.website_url} target="_blank" rel="noopener noreferrer">
                                                Visit Dealership <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Car className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No dealerships found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We couldn't find any dealerships matching your search. Please try adjusting your filters or check back later.
                        </p>
                        {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 text-primary">
                                Clear Search
                            </Button>
                        )}
                    </motion.div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Dealerships;
