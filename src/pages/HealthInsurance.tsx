import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, HeartPulse, ExternalLink, Search, Globe } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface HealthInsuranceProvider {
    id: string;
    name: string;
    website_url: string;
    logo_url: string | null;
    description: string;
    display_order: number;
}

const HealthInsurance = () => {
    const [providers, setProviders] = useState<HealthInsuranceProvider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<HealthInsuranceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredProviders(providers);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredProviders(
                providers.filter(p =>
                    p.name.toLowerCase().includes(lowerTerm) ||
                    p.description.toLowerCase().includes(lowerTerm)
                )
            );
        }
    }, [searchTerm, providers]);

    const fetchProviders = async () => {
        try {
            // Cast to any to bypass type check since table is new
            const { data, error } = await (supabase
                .from("health_insurance_providers" as any)
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false })) as any;

            if (error) throw error;
            setProviders(data || []);
            setFilteredProviders(data || []);
        } catch (err) {
            console.error("Failed to fetch health insurance providers:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            <SEO
                title="Health Insurance Partners - OneStop Application Services"
                description="Find trusted health insurance providers for your needs."
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
                        <Badge className="mb-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border-teal-500/20 px-4 py-1 text-sm rounded-full">
                            Medical Coverage
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            Health Insurance Solutions
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Secure your health and peace of mind. Browse our vetted selection of health insurance providers offering comprehensive coverage options.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-md mx-auto mb-12 relative"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search health providers..."
                                className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-white/10 text-lg shadow-xl transition-all focus:ring-2 focus:ring-teal-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                    </div>
                ) : filteredProviders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className="h-full flex flex-col overflow-hidden border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-xl group">
                                    <div className="relative h-48 bg-white/90 overflow-hidden flex items-center justify-center p-6">
                                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white opacity-50" />
                                        {provider.logo_url ? (
                                            <img
                                                src={provider.logo_url}
                                                alt={provider.name}
                                                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                                                <HeartPulse className="w-10 h-10 text-teal-600" />
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
                                            {provider.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-teal-600/80 dark:text-teal-400/80">
                                            <Globe className="w-3.5 h-3.5" />
                                            Health Network
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                            {provider.description}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-white/5">
                                        <Button
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                                            asChild
                                        >
                                            <a href={provider.website_url} target="_blank" rel="noopener noreferrer">
                                                Visit Provider <ExternalLink className="ml-2 h-4 w-4" />
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
                            <HeartPulse className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No providers found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We couldn't find any health insurance providers matching your search.
                        </p>
                        {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4 text-teal-600">
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

export default HealthInsurance;
