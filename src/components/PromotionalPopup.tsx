import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PopupData {
    id: string;
    type: string;
    image_url: string;
    title: string | null;
}

const PromotionalPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [eventData, setEventData] = useState<PopupData | null>(null);
    const [adData, setAdData] = useState<PopupData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if popup was already shown in this session
        const popupShown = sessionStorage.getItem("promotional_popup_shown");

        if (popupShown === "true") {
            setIsLoading(false);
            return;
        }

        // Fetch active popups from Supabase
        const fetchPopups = async () => {
            try {
                const { data, error } = await supabase
                    .from("promotional_popups")
                    .select("*")
                    .eq("is_active", true)
                    .order("display_order", { ascending: true });

                if (error) {

                    setIsLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // Find event and ad popups
                    const event = data.find((item) => item.type === "event");
                    const ad = data.find((item) => item.type === "ad");

                    setEventData(event || null);
                    setAdData(ad || null);

                    // Only show popup if we have at least one active item
                    if (event || ad) {
                        setIsVisible(true);
                    }
                }

                setIsLoading(false);
            } catch (err) {

                setIsLoading(false);
            }
        };

        fetchPopups();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Mark popup as shown in session storage
        sessionStorage.setItem("promotional_popup_shown", "true");
    };

    // Don't render anything while loading or if nothing to show
    if (isLoading || (!eventData && !adData)) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                                duration: 0.4
                            }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Card Container */}
                            <div className="bg-gradient-to-br from-white via-white to-secondary/5 rounded-3xl shadow-2xl border border-secondary/20 overflow-hidden">
                                {/* Header with Close Button */}
                                <div className="relative bg-gradient-to-r from-primary to-secondary p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">
                                                Special Announcements
                                            </h2>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleClose}
                                            className="text-white hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
                                            aria-label="Close popup"
                                        >
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                                    <div className={`grid gap-8 ${eventData && adData ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                        {/* Events Section */}
                                        {eventData && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full" />
                                                    <h3 className="text-xl font-bold text-primary">
                                                        {eventData.title || "Upcoming Events"}
                                                    </h3>
                                                </div>
                                                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-secondary/20 hover:border-secondary/40">
                                                    <img
                                                        src={eventData.image_url}
                                                        alt={eventData.title || "Event promotion"}
                                                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Ads Section */}
                                        {adData && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-1 w-12 bg-gradient-to-r from-secondary to-primary rounded-full" />
                                                    <h3 className="text-xl font-bold text-secondary">
                                                        {adData.title || "Special Offers"}
                                                    </h3>
                                                </div>
                                                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40">
                                                    <img
                                                        src={adData.image_url}
                                                        alt={adData.title || "Advertisement"}
                                                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Footer Note */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-center text-sm text-muted-foreground mt-8 italic"
                                    >
                                        This message will only appear once per session
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PromotionalPopup;
