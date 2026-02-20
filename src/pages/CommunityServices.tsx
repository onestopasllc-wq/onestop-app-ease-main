import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Loader2, Search, Globe, Phone, Mail, MapPin, ExternalLink,
    GraduationCap, Building2, Car, HeartPulse, ShoppingBag,
    Utensils, Hotel, Calculator, DollarSign, Baby, Truck,
    Laptop, Megaphone, Info, Star, ChevronRight, ShieldCheck,
    Stethoscope, Home, Tag, Key, Luggage, Wallet, Users, HelpCircle
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { CATEGORIES } from "@/components/CommunityServicesAdmin";

interface CommunityService {
    id: string;
    name: string;
    category: string;
    description: string;
    website_url: string | null;
    logo_url: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    address: string | null;
    is_featured: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
    "Health Insurance Services": ShieldCheck,
    "Car Insurance": ShieldCheck,
    "Housing & Rentals": Home,
    "Car Rental & Vehicle Sales": Car,
    "Cafés & Restaurants": Utensils,
    "Medical Centers & Clinics": HeartPulse,
    "Habesha Stores": ShoppingBag,
    "Hotels & Lodging": Hotel,
    "Tax Preparation & Accounting": Calculator,
    "Finance & Business Services": Wallet,
    "Childcare Services": Baby,
    "Transportation Services": Truck,
    "Tech Solutions": Laptop,
    "Short term training": GraduationCap,
    "Other Community Services": Megaphone
};

const CommunityServices = () => {
    const [services, setServices] = useState<CommunityService[]>([]);
    const [filteredServices, setFilteredServices] = useState<CommunityService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        fetchServices();
    }, []);

    const formatUrl = (url: string | null) => {
        if (!url) return "#";
        const trimmedUrl = url.trim();
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) return trimmedUrl;
        return `https://${trimmedUrl}`;
    };

    useEffect(() => {
        let result = services;

        if (activeCategory !== "all") {
            result = result.filter(s => s.category === activeCategory);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(lowerTerm) ||
                s.description.toLowerCase().includes(lowerTerm) ||
                (s.address && s.address.toLowerCase().includes(lowerTerm))
            );
        }

        setFilteredServices(result);
    }, [searchTerm, activeCategory, services]);

    const fetchServices = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from("community_services")
                .select("*")
                .eq("is_active", true)
                .order("is_featured", { ascending: false })
                .order("display_order", { ascending: true });

            if (error) throw error;
            setServices(data || []);
            setFilteredServices(data || []);
        } catch (err) {
            console.error("Failed to fetch community services:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            <SEO
                title="Community Services - OneStop Application Services"
                description="Explore local essential services, community stores, and professional support."
            />
            <AnimatedBackground />
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1 text-sm rounded-full tracking-wide">
                            Community Directory
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
                            Community Services
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Discover local listings, Ethiopian specialty stores, and essential professional services tailored for you.
                    </motion.p>
                </div>

                {/* Search Bar - Aligned with project style */}
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
                                placeholder="Search services..."
                                className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-white/10 text-lg shadow-xl transition-all focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Category Navigation - No redundant icons */}
                <div className="max-w-7xl mx-auto mb-12">
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                        <Button
                            variant={activeCategory === "all" ? "default" : "outline"}
                            onClick={() => setActiveCategory("all")}
                            className={`rounded-full px-6 py-2 h-auto whitespace-nowrap font-medium transition-all ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-white/40 border-primary/10 hover:bg-primary/5"
                                }`}
                        >
                            All Services
                        </Button>

                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={activeCategory === cat ? "default" : "outline"}
                                onClick={() => setActiveCategory(cat)}
                                className={`rounded-full px-6 py-2 h-auto whitespace-nowrap font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-white/40 border-primary/10 hover:bg-primary/5"
                                    }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredServices.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    className="h-full"
                                >
                                    <Card className="h-full flex flex-col overflow-hidden border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-xl group">
                                        <div className="relative h-48 bg-white/90 overflow-hidden flex items-center justify-center p-6">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white opacity-50" />
                                            {service.logo_url ? (
                                                <img
                                                    src={service.logo_url}
                                                    alt={service.name}
                                                    className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                                                    {(() => {
                                                        const Icon = CATEGORY_ICONS[service.category] || HelpCircle;
                                                        return <Icon className="w-10 h-10 text-primary" />;
                                                    })()}
                                                </div>
                                            )}

                                            {service.is_featured && (
                                                <div className="absolute top-4 right-4 z-20">
                                                    <Badge className="bg-amber-500 text-white border-none shadow-lg animate-pulse">
                                                        <Star size={12} className="fill-white mr-1" />
                                                        Featured
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        <CardHeader>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/20 text-primary">
                                                    {service.category}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl font-bold text-primary truncate">
                                                {service.name}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="flex-grow">
                                            <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                                {service.description}
                                            </p>

                                            <div className="mt-4 space-y-2 text-xs text-muted-foreground/80">
                                                {service.address && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={12} className="text-primary/60" />
                                                        <span className="truncate">{service.address}</span>
                                                    </div>
                                                )}
                                                {service.contact_phone && (
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Phone size={12} className="text-primary/60" />
                                                        <span>{service.contact_phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-4 border-t border-white/5">
                                            {service.website_url ? (
                                                <Button
                                                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a href={formatUrl(service.website_url)} target="_blank" rel="noopener noreferrer">
                                                        Visit Business <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button disabled variant="outline" className="w-full opacity-50 border-dashed">
                                                    In-Person Services
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No listings found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            No services match your current search or category filter. Try widening your search.
                        </p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchTerm(""); setActiveCategory("all"); }}
                            className="mt-4 text-primary"
                        >
                            Reset Exploration
                        </Button>
                    </motion.div>
                )}
            </main>

            <Footer />
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            ` }} />
        </div>
    );
};

export default CommunityServices;
