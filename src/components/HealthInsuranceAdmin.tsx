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
import { Plus, Trash2, Edit2, Loader2, Link as LinkIcon, Save, X, ImageIcon, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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

interface HealthInsuranceProvider {
    id: string;
    name: string;
    website_url: string;
    logo_url: string | null;
    description: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

export const HealthInsuranceAdmin = () => {
    const [providers, setProviders] = useState<HealthInsuranceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        website_url: "",
        description: "",
        is_active: true,
        display_order: 0,
        logo_url: "" as string | null
    });

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            // Cast to any to bypass type check since table is new
            const { data, error } = await (supabase
                .from("health_insurance_providers" as any)
                .select("*")
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false })) as any;

            if (error) throw error;
            setProviders(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch providers: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (provider?: HealthInsuranceProvider) => {
        if (provider) {
            setEditingId(provider.id);
            setFormData({
                name: provider.name,
                website_url: provider.website_url,
                description: provider.description,
                is_active: provider.is_active,
                display_order: provider.display_order,
                logo_url: provider.logo_url
            });
            setImagePreview(provider.logo_url);
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                website_url: "",
                description: "",
                is_active: true,
                display_order: 0,
                logo_url: null
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return formData.logo_url;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // Reusing insurance-logos bucket
            const { error: uploadError } = await supabase.storage
                .from('insurance-logos')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('insurance-logos')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.website_url || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            let logoUrl = formData.logo_url;
            if (imageFile) {
                logoUrl = await uploadImage();
            }

            const dataToSave = {
                ...formData,
                logo_url: logoUrl,
                updated_at: new Date().toISOString()
            };

            if (editingId) {
                const { error } = await supabase
                    .from("health_insurance_providers" as any)
                    .update(dataToSave)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Provider updated successfully");
            } else {
                const { error } = await supabase
                    .from("health_insurance_providers" as any)
                    .insert([dataToSave]);
                if (error) throw error;
                toast.success("Provider added successfully");
            }

            setIsDialogOpen(false);
            fetchProviders();
        } catch (err: any) {
            toast.error(err.message || "Failed to save provider");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("health_insurance_providers" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Provider deleted successfully");
            fetchProviders();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete provider");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("health_insurance_providers" as any)
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            fetchProviders();
            toast.success(`Provider ${!currentStatus ? 'activated' : 'deactivated'}`);
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                        <HeartPulse className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Health Insurance Providers</h2>
                        <p className="text-sm text-muted-foreground">Manage health insurance partners and listings</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="hover-lift shadow-elegant">
                    <Plus className="mr-2 h-4 w-4" /> Add Provider
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {providers.map((provider, index) => (
                        <motion.div
                            key={provider.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col group hover:shadow-hover transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                {provider.logo_url && (
                                    <div className="h-40 w-full overflow-hidden bg-muted/30 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <img
                                            src={provider.logo_url}
                                            alt={provider.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-3 left-3 z-20">
                                            <Badge variant={provider.is_active ? "default" : "secondary"} className={provider.is_active ? "bg-green-500/80 hover:bg-green-600/80" : ""}>
                                                {provider.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-3 relative">
                                    {!provider.logo_url && (
                                        <div className="absolute top-4 right-4 text-muted-foreground/20">
                                            <HeartPulse size={40} />
                                        </div>
                                    )}
                                    <CardTitle className="text-lg text-foreground flex items-center justify-between">
                                        {provider.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-xs truncate">
                                        <LinkIcon className="h-3 w-3" />
                                        <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                                            {provider.website_url}
                                        </a>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0 flex flex-col justify-between">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {provider.description}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`active-${provider.id}`} className="sr-only">Active</Label>
                                            <Switch
                                                id={`active-${provider.id}`}
                                                checked={provider.is_active}
                                                onCheckedChange={() => handleToggleActive(provider.id, provider.is_active)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(provider)}
                                                className="hover:bg-primary/10 hover:text-primary h-8 w-8 p-0"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive text-destructive/80 h-8 w-8 p-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Provider?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete "{provider.name}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(provider.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {providers.length === 0 && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl border-border/50 bg-accent/20 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <HeartPulse className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No health insurance providers found</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Add your first health insurance provider to get started. They will be displayed on the public health insurance page.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Add First Provider
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Provider" : "Add New Provider"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the health insurance provider.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Provider Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Cigna Global"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="website"
                                    value={formData.website_url}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    className="pl-9"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Logo Image</Label>
                            <div className="flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative w-24 h-24 rounded-md overflow-hidden border border-border">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                        <button
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                                setFormData({ ...formData, logo_url: null });
                                            }}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/10">
                                        <ImageIcon className="text-muted-foreground/50 h-8 w-8" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Upload a logo image. SVG, PNG, JPG or GIF (max. 2MB).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the provider and their health coverage offerings..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is_active">Active (Visible)</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingId ? "Update Provider" : "Save Provider"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
