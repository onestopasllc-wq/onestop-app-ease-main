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
import { Plus, Trash2, Edit2, Loader2, Link as LinkIcon, Save, X, ImageIcon, Search, Globe, Phone, Mail, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const CATEGORIES = [
    "Health Insurance Services",
    "Car Insurance",
    "Housing & Rentals",
    "Car Rental & Vehicle Sales",
    "Cafés & Restaurants",
    "Medical Centers & Clinics",
    "Habesha Stores",
    "Hotels & Lodging",
    "Tax Preparation & Accounting",
    "Finance & Business Services",
    "Childcare Services",
    "Transportation Services",
    "Tech Solutions",
    "Other Community Services",
    "Short term training"
];

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
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
    created_at: string;
}

export const CommunityServicesAdmin = () => {
    const [services, setServices] = useState<CommunityService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const [formData, setFormData] = useState({
        name: "",
        category: CATEGORIES[0],
        description: "",
        website_url: "",
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        address: "",
        is_active: true,
        is_featured: false,
        display_order: 0,
        logo_url: "" as string | null
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("community_services")
                .select("*")
                .order("display_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch services: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (service?: CommunityService) => {
        if (service) {
            setEditingId(service.id);
            setFormData({
                name: service.name,
                category: service.category,
                description: service.description,
                website_url: service.website_url || "",
                contact_name: service.contact_name || "",
                contact_phone: service.contact_phone || "",
                contact_email: service.contact_email || "",
                address: service.address || "",
                is_active: service.is_active,
                is_featured: service.is_featured,
                display_order: service.display_order,
                logo_url: service.logo_url
            });
            setImagePreview(service.logo_url);
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                category: CATEGORIES[0],
                description: "",
                website_url: "",
                contact_name: "",
                contact_phone: "",
                contact_email: "",
                address: "",
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
                toast.success("Image selected: " + file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return formData.logo_url;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `community-services/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('community-services')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('community-services')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.category || !formData.description) {
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
                    .from("community_services")
                    .update(dataToSave)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Service updated successfully");
            } else {
                const { error } = await supabase
                    .from("community_services")
                    .insert([dataToSave]);
                if (error) throw error;
                toast.success("Service added successfully");
            }

            setIsDialogOpen(false);
            fetchServices();
        } catch (err: any) {
            toast.error(err.message || "Failed to save service");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("community_services")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Service deleted successfully");
            fetchServices();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete service");
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || s.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Community Services</h2>
                        <p className="text-sm text-muted-foreground">Manage classifieds and local business listings</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[250px]">
                        <SelectValue placeholder="Category Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredServices.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
                                {service.is_featured && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge className="bg-amber-500 text-white border-none">
                                            <Star className="w-3 h-3 mr-1 fill-white" /> Featured
                                        </Badge>
                                    </div>
                                )}
                                <div className="h-40 w-full overflow-hidden bg-muted/30 flex items-center justify-center p-4">
                                    {service.logo_url ? (
                                        <img
                                            src={service.logo_url}
                                            alt={service.name}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Globe className="w-8 h-8 text-primary/40" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg text-foreground line-clamp-1">{service.name}</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="w-fit text-[10px] py-0">{service.category}</Badge>
                                </CardHeader>
                                <CardContent className="flex-grow pt-0 flex flex-col gap-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

                                    <div className="space-y-1.5 text-xs text-muted-foreground">
                                        {service.address && <div className="flex items-center gap-1.5"><MapPin size={12} /> {service.address}</div>}
                                        {service.contact_phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {service.contact_phone}</div>}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={service.is_active}
                                                onCheckedChange={async (checked) => {
                                                    await supabase.from("community_services").update({ is_active: checked }).eq("id", service.id);
                                                    fetchServices();
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">{service.is_active ? "Active" : "Hidden"}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(service)} className="h-8 w-8 p-0">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                                                        <AlertDialogDescription>Permanently remove "{service.name}" from the directory.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive text-white">Delete</AlertDialogAction>
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
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Listing" : "Add New Community Service"}</DialogTitle>
                        <DialogDescription>Fill in the details for the service listing.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category <span className="text-destructive">*</span></Label>
                                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Description <span className="text-destructive">*</span></Label>
                            <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px]" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="web">Website URL</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="web" className="pl-9" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addr">Full Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="addr" className="pl-9" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="text-sm font-semibold mb-3 block">Media & Contact</Label>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-32 flex flex-col gap-2 shrink-0">
                                    <Label>Logo</Label>
                                    <div className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center bg-muted/20 relative overflow-hidden group">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-contain p-2" alt="Logo preview" />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground/30 h-8 w-8" />
                                        )}
                                        <label
                                            htmlFor="logo-upload"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        >
                                            <Plus className="text-white pointer-events-none" />
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Contact Name</Label>
                                            <Input value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4 items-end">
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                                <Label>Active</Label>
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                                <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                                <Label>Featured</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingId ? "Update Listing" : "Save Listing"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
