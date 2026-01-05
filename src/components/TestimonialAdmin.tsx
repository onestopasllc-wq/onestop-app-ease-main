import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, MessageSquare, Star, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
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

interface Testimonial {
    id: string;
    name: string;
    location: string | null;
    service: string | null;
    text: string;
    rating: number;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export const TestimonialAdmin = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        service: "",
        text: "",
        rating: 5,
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("testimonials")
                .select("*")
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) {
                toast.error("Failed to fetch testimonials");
                return;
            }

            setTestimonials(data || []);
        } catch (err) {
            toast.error("An error occurred while fetching testimonials");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (testimonial?: Testimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setFormData({
                name: testimonial.name,
                location: testimonial.location || "",
                service: testimonial.service || "",
                text: testimonial.text,
                rating: testimonial.rating,
                display_order: testimonial.display_order,
                is_active: testimonial.is_active
            });
        } else {
            setEditingTestimonial(null);
            setFormData({
                name: "",
                location: "",
                service: "",
                text: "",
                rating: 5,
                display_order: 0,
                is_active: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.text) {
            toast.error("Name and testimonial text are required");
            return;
        }

        setSaving(true);
        try {
            if (editingTestimonial) {
                const { error } = await supabase
                    .from("testimonials")
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingTestimonial.id);

                if (error) throw error;
                toast.success("Testimonial updated successfully");
            } else {
                const { error } = await supabase
                    .from("testimonials")
                    .insert([formData]);

                if (error) throw error;
                toast.success("Testimonial added successfully");
            }

            setIsDialogOpen(false);
            fetchTestimonials();
        } catch (err: any) {
            toast.error(err.message || "Failed to save testimonial");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("testimonials")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Testimonial deleted successfully");
            fetchTestimonials();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete testimonial");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("testimonials")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            toast.success(`Testimonial ${!currentStatus ? "activated" : "deactivated"}`);
            fetchTestimonials();
        } catch (err: any) {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Testimonials Management</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage client success stories and testimonials
                        </p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="hover-lift shadow-elegant">
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col group hover:shadow-hover transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < testimonial.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={testimonial.is_active}
                                                onCheckedChange={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                                            />
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-3 text-primary">{testimonial.name}</CardTitle>
                                    <CardDescription>
                                        {testimonial.location} • {testimonial.service}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0">
                                    <p className="text-sm text-muted-foreground italic line-clamp-4">
                                        "{testimonial.text}"
                                    </p>
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenDialog(testimonial)}
                                            className="hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="hover:bg-destructive/10 hover:text-destructive text-destructive/80"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete "{testimonial.name}'s" testimonial. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(testimonial.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {testimonials.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl border-border/50 bg-accent/20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground font-medium">No testimonials found</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your first testimonial to get started</p>
                    <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
                        Add First Testimonial
                    </Button>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the testimonial to display on the website.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Mihret Walelgne"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Newark, DE, USA"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="service">Service Provided</Label>
                            <Input
                                id="service"
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                placeholder="e.g., CGFNS Application Support"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="text">Testimonial Text</Label>
                            <Textarea
                                id="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="The client's experience..."
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating (1-5)</Label>
                                <div className="flex gap-2 items-center">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <Button
                                            key={r}
                                            type="button"
                                            variant={formData.rating >= r ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, rating: r })}
                                            className="p-2"
                                        >
                                            <Star className={`w-4 h-4 ${formData.rating >= r ? "fill-white" : ""}`} />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Active (Visible on website)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingTestimonial ? "Update Testimonial" : "Save Testimonial"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
