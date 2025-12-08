import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromotionalPopup {
    id: string;
    type: string;
    image_url: string;
    title: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export const PromotionalPopupsAdmin = () => {
    const [popups, setPopups] = useState<PromotionalPopup[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [adTitle, setAdTitle] = useState("");

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("promotional_popups")
                .select("*")
                .order("type", { ascending: true })
                .order("display_order", { ascending: true });

            if (error) {

                toast.error("Failed to fetch promotional popups");
                return;
            }

            setPopups(data || []);
        } catch (err) {

            toast.error("An error occurred while fetching popups");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (type: "event" | "ad", file: File) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setUploading(type);

        try {
            // Upload image to Supabase Storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${type}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("popup-images")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {

                toast.error("Failed to upload image: " + uploadError.message);
                return;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("popup-images")
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            // Check if popup of this type already exists
            const existingPopup = popups.find((p) => p.type === type);
            const title = type === "event" ? eventTitle : adTitle;

            if (existingPopup) {
                // Update existing popup
                const { error: updateError } = await supabase
                    .from("promotional_popups")
                    .update({
                        image_url: imageUrl,
                        title: title || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingPopup.id);

                if (updateError) {

                    toast.error("Failed to update popup");
                    return;
                }

                // Delete old image from storage if it exists
                if (existingPopup.image_url) {
                    const oldPath = existingPopup.image_url.split("/").pop();
                    if (oldPath) {
                        await supabase.storage.from("popup-images").remove([oldPath]);
                    }
                }

                toast.success(`${type === "event" ? "Event" : "Ad"} image updated successfully`);
            } else {
                // Create new popup
                const { error: insertError } = await supabase
                    .from("promotional_popups")
                    .insert({
                        type,
                        image_url: imageUrl,
                        title: title || null,
                        is_active: true,
                        display_order: 0,
                    });

                if (insertError) {

                    toast.error("Failed to create popup");
                    return;
                }

                toast.success(`${type === "event" ? "Event" : "Ad"} image uploaded successfully`);
            }

            // Reset title input
            if (type === "event") setEventTitle("");
            else setAdTitle("");

            // Refresh popups
            await fetchPopups();
        } catch (err) {

            toast.error("An error occurred during upload");
        } finally {
            setUploading(null);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("promotional_popups")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) {

                toast.error("Failed to update status");
                return;
            }

            toast.success(`Popup ${!currentStatus ? "activated" : "deactivated"}`);
            await fetchPopups();
        } catch (err) {

            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        try {
            // Delete from database
            const { error: deleteError } = await supabase
                .from("promotional_popups")
                .delete()
                .eq("id", id);

            if (deleteError) {
                toast.error("Failed to delete popup");
                return;
            }

            // Delete image from storage
            const imagePath = imageUrl.split("/").pop();
            if (imagePath) {
                await supabase.storage.from("popup-images").remove([imagePath]);
            }

            toast.success("Popup deleted successfully");
            await fetchPopups();
        } catch (err) {
            toast.error("An error occurred during deletion");
        }
    };

    const eventPopup = popups.find((p) => p.type === "event");
    const adPopup = popups.find((p) => p.type === "ad");

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Promotional Pop-ups</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage event and advertisement images displayed on the landing page
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Event Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                </div>
                                Event Image
                            </CardTitle>
                            <CardDescription>Upload and manage event promotional image</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {eventPopup ? (
                                <>
                                    <div className="relative group overflow-hidden rounded-lg border-2 border-primary/20">
                                        <img
                                            src={eventPopup.image_url}
                                            alt="Event promotion"
                                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <Badge variant={eventPopup.is_active ? "default" : "secondary"}>
                                                {eventPopup.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {eventPopup.title && (
                                        <div className="text-sm">
                                            <Label>Title</Label>
                                            <p className="font-medium">{eventPopup.title}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={eventPopup.is_active}
                                                onCheckedChange={() =>
                                                    handleToggleActive(eventPopup.id, eventPopup.is_active)
                                                }
                                            />
                                            <Label className="text-sm">Show on website</Label>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Event Popup?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the event popup and its image. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(eventPopup.id, eventPopup.image_url)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No event image uploaded yet</p>
                                </div>
                            )}

                            <div className="space-y-3 pt-4 border-t">
                                <Label htmlFor="event-title">Event Title (Optional)</Label>
                                <Input
                                    id="event-title"
                                    placeholder="e.g., Upcoming Events"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                />

                                <Label htmlFor="event-upload">
                                    {eventPopup ? "Replace Image" : "Upload Image"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="event-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload("event", file);
                                        }}
                                        disabled={uploading === "event"}
                                        className="cursor-pointer"
                                    />
                                    {uploading === "event" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 800x600px or larger. Max 5MB. JPG, PNG, or WebP.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Ad Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-secondary" />
                                </div>
                                Advertisement Image
                            </CardTitle>
                            <CardDescription>Upload and manage advertisement promotional image</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {adPopup ? (
                                <>
                                    <div className="relative group overflow-hidden rounded-lg border-2 border-secondary/20">
                                        <img
                                            src={adPopup.image_url}
                                            alt="Advertisement"
                                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <Badge variant={adPopup.is_active ? "default" : "secondary"}>
                                                {adPopup.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {adPopup.title && (
                                        <div className="text-sm">
                                            <Label>Title</Label>
                                            <p className="font-medium">{adPopup.title}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={adPopup.is_active}
                                                onCheckedChange={() => handleToggleActive(adPopup.id, adPopup.is_active)}
                                            />
                                            <Label className="text-sm">Show on website</Label>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Advertisement Popup?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the advertisement popup and its image. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(adPopup.id, adPopup.image_url)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No advertisement image uploaded yet</p>
                                </div>
                            )}

                            <div className="space-y-3 pt-4 border-t">
                                <Label htmlFor="ad-title">Advertisement Title (Optional)</Label>
                                <Input
                                    id="ad-title"
                                    placeholder="e.g., Special Offers"
                                    value={adTitle}
                                    onChange={(e) => setAdTitle(e.target.value)}
                                />

                                <Label htmlFor="ad-upload">{adPopup ? "Replace Image" : "Upload Image"}</Label>
                                <div className="relative">
                                    <Input
                                        id="ad-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload("ad", file);
                                        }}
                                        disabled={uploading === "ad"}
                                        className="cursor-pointer"
                                    />
                                    {uploading === "ad" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 800x600px or larger. Max 5MB. JPG, PNG, or WebP.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                                How it works
                            </p>
                            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
                                <li>Upload images for events and/or advertisements</li>
                                <li>Toggle the switch to activate/deactivate each popup</li>
                                <li>Active popups will appear on the home page upon first visit</li>
                                <li>Visitors see the popup once per session</li>
                                <li>Images are stored securely in Supabase Storage</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
