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
import { Plus, Trash2, Edit2, Loader2, Car, Link as LinkIcon, Save, X, ImageIcon, Eye, BarChart } from "lucide-react";
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

interface Dealership {
    id: string;
    name: string;
    website_url: string;
    logo_url: string | null;
    description: string;
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
    created_at: string;
}

export const DealershipAdmin = () => {
    const [dealerships, setDealerships] = useState<Dealership[]>([]);
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
        is_featured: false,
        display_order: 0,
        logo_url: "" as string | null
    });

    useEffect(() => {
        fetchDealerships();
    }, []);

    const fetchDealerships = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("dealerships")
                .select("*")
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setDealerships(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch dealerships: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (dealership?: Dealership) => {
        if (dealership) {
            setEditingId(dealership.id);
            setFormData({
                name: dealership.name,
                website_url: dealership.website_url,
                description: dealership.description,
                is_active: dealership.is_active,
                is_featured: dealership.is_featured || false,
                display_order: dealership.display_order,
                logo_url: dealership.logo_url
            });
            setImagePreview(dealership.logo_url);
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                website_url: "",
                description: "",
                is_active: true,
                is_featured: false,
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
            const { error: uploadError } = await supabase.storage
                .from('dealership-logos')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('dealership-logos')
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
                    .from("dealerships")
                    .update(dataToSave)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Dealership updated successfully");
            } else {
                const { error } = await supabase
                    .from("dealerships")
                    .insert([dataToSave]);
                if (error) throw error;
                toast.success("Dealership added successfully");
            }

            setIsDialogOpen(false);
            fetchDealerships();
        } catch (err: any) {
            toast.error(err.message || "Failed to save dealership");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("dealerships")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Dealership deleted successfully");
            fetchDealerships();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete dealership");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("dealerships")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            fetchDealerships();
            toast.success(`Dealership ${!currentStatus ? 'activated' : 'deactivated'}`);
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
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Car Dealerships</h2>
                        <p className="text-sm text-muted-foreground">Manage dealership partners and listings</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="hover-lift shadow-elegant">
                    <Plus className="mr-2 h-4 w-4" /> Add Dealership
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {dealerships.map((dealership, index) => (
                        <motion.div
                            key={dealership.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col group hover:shadow-hover transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                {dealership.logo_url && (
                                    <div className="h-40 w-full overflow-hidden bg-muted/30 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                        <img
                                            src={dealership.logo_url}
                                            alt={dealership.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {dealership.is_featured && (
                                            <Badge className="absolute top-3 right-3 z-20 bg-yellow-500/90 text-black border-none shadow-md backdrop-blur-sm">
                                                Featured
                                            </Badge>
                                        )}
                                        <div className="absolute bottom-3 left-3 z-20">
                                            <Badge variant={dealership.is_active ? "default" : "secondary"} className={dealership.is_active ? "bg-green-500/80 hover:bg-green-600/80" : ""}>
                                                {dealership.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-3 relative">
                                    {!dealership.logo_url && (
                                        <div className="absolute top-4 right-4 text-muted-foreground/20">
                                            <Car size={40} />
                                        </div>
                                    )}
                                    <CardTitle className="text-lg text-foreground flex items-center justify-between">
                                        {dealership.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-xs truncate">
                                        <LinkIcon className="h-3 w-3" />
                                        <a href={dealership.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                                            {dealership.website_url}
                                        </a>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0 flex flex-col justify-between">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {dealership.description}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`active-${dealership.id}`} className="sr-only">Active</Label>
                                            <Switch
                                                id={`active-${dealership.id}`}
                                                checked={dealership.is_active}
                                                onCheckedChange={() => handleToggleActive(dealership.id, dealership.is_active)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(dealership)}
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
                                                        <AlertDialogTitle>Delete Dealership?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete "{dealership.name}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(dealership.id)}
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

                {dealerships.length === 0 && (
                    <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl border-border/50 bg-accent/20 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <Car className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No dealerships found</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Add your first dealership partner to get started. They will be displayed on the public dealerships page.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Add First Dealership
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Dealership" : "Add New Dealership"}</DialogTitle>
                        <DialogDescription>
                            Enter the details of the car dealership partner.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Dealership Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Prestige Auto Motors"
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
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                                        Upload a logo or dealership image. SVG, PNG, JPG or GIF (max. 2MB).
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
                                placeholder="Brief description of the dealership and their offerings..."
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
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                    />
                                    <Label htmlFor="is_featured" className="text-yellow-600 dark:text-yellow-500 font-medium flex items-center gap-1">
                                        Featured <Badge variant="outline" className="text-[10px] h-4 leading-none py-0 px-1 ml-1 bg-yellow-500/10 border-yellow-500/20 text-yellow-600">PRO</Badge>
                                    </Label>
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
                            {editingId ? "Update Dealership" : "Save Dealership"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
