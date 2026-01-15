import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, MapPin, Home, Phone, Mail, Plus, X } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

interface RentalListing {
    id: string;
    title: string;
    description: string;
    address: string;
    property_type: string;
    price: number;
    features: string[];
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    images: string[];
    created_at: string;
}

const Rentals = () => {
    const [rentals, setRentals] = useState<RentalListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedRental, setSelectedRental] = useState<RentalListing | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        checkAuth();
        fetchRentals();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
    };

    const fetchRentals = async () => {
        try {
            const { data, error } = await (supabase
                .from("rental_listings" as any)
                .select("*")
                .eq("status", "approved")
                .order("created_at", { ascending: false })) as any;

            if (error) throw error;
            setRentals(data || []);
        } catch (err) {
            console.error("Failed to fetch rentals:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (rental: RentalListing) => {
        setSelectedRental(rental);
        setIsDetailsOpen(true);

        // Increment view count
        try {
            await supabase.rpc('increment_rental_views', { listing_id: rental.id });
        } catch (err) {
            console.error("Failed to increment views:", err);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            <SEO
                title="Rental Listings - OneStop Application Services"
                description="Find your next home with our trusted rental listings."
            />
            <AnimatedBackground />
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1 text-sm rounded-full">
                                Real Estate
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                Find Your Next Home
                            </h1>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-muted-foreground"
                        >
                            Explore verified rental listings or post your own ad to reach thousands of potential tenants.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <Link to={isAuthenticated ? "/dashboard/rentals/new" : "/login"}>
                                <Plus className="mr-2 h-5 w-5" /> Post a Rental ($25)
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : rentals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rentals.map((rental, index) => (
                            <motion.div
                                key={rental.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className="h-full flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                    <div className="relative h-60 bg-muted overflow-hidden">
                                        {rental.images && rental.images.length > 0 ? (
                                            <img
                                                src={rental.images[0]}
                                                alt={rental.title}
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                                <Home className="h-12 w-12 opacity-50" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-4 right-4 bg-background/90 text-foreground backdrop-blur-md hover:bg-background/90 text-lg font-bold px-3 py-1">
                                            ${rental.price}/mo
                                        </Badge>
                                    </div>

                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <Badge variant="outline" className="mb-2">{rental.property_type}</Badge>
                                                <CardTitle className="text-xl font-bold line-clamp-1">
                                                    {rental.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <CardDescription className="flex items-center gap-1.5 line-clamp-1">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            {rental.address}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-grow space-y-4">
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {rental.description}
                                        </p>

                                        {rental.features && rental.features.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {rental.features.slice(0, 4).map((feature, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-foreground">
                                                        {feature}
                                                    </span>
                                                ))}
                                                {rental.features.length > 4 && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                        +{rental.features.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t border-border/50 flex flex-col gap-2">
                                        <div className="w-full flex justify-between items-center text-sm font-medium">
                                            <span className="flex items-center text-muted-foreground">
                                                <Phone className="h-3 w-3 mr-1" /> {rental.contact_phone}
                                            </span>
                                            <span
                                                className="text-primary cursor-pointer hover:underline"
                                                onClick={() => handleViewDetails(rental)}
                                            >
                                                View Details
                                            </span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Home className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No rentals found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                            There are currently no listings available. Be the first to post a rental ad!
                        </p>
                        <Button asChild>
                            <Link to="/dashboard/rentals/new">Post a Rental</Link>
                        </Button>
                    </div>
                )}
            </main>

            <Footer />

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedRental && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedRental.title}</DialogTitle>
                                <DialogDescription className="text-lg flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {selectedRental.address}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                    {selectedRental.images && selectedRental.images.length > 0 ? (
                                        <img
                                            src={selectedRental.images[0]}
                                            alt={selectedRental.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Home className="w-16 h-16 opacity-20" />
                                        </div>
                                    )}
                                    <Badge className="absolute top-4 right-4 text-lg px-3 py-1">
                                        ${selectedRental.price}/mo
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                {selectedRental.description}
                                            </p>
                                        </div>

                                        {selectedRental.features && selectedRental.features.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2">Features</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRental.features.map((feature, i) => (
                                                        <Badge key={i} variant="secondary" className="px-3 py-1">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Contact Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">{selectedRental.contact_name}</div>
                                                </div>
                                                <Button className="w-full" asChild>
                                                    <a href={`tel:${selectedRental.contact_phone}`}>
                                                        <Phone className="w-4 h-4 mr-2" /> Call
                                                    </a>
                                                </Button>
                                                <Button variant="outline" className="w-full" asChild>
                                                    <a href={`mailto:${selectedRental.contact_email}`}>
                                                        <Mail className="w-4 h-4 mr-2" /> Email
                                                    </a>
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <div className="text-xs text-muted-foreground text-center">
                                            Posted on {new Date(selectedRental.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {selectedRental.images && selectedRental.images.length > 1 && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Gallery</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedRental.images.slice(1).map((img, i) => (
                                                <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden">
                                                    <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Rentals;
