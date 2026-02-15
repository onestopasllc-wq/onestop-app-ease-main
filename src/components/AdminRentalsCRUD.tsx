import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Home, Upload, X, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
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
} from "@/components/ui/alert-dialog";

interface AdminRental {
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

const PROPERTY_TYPES = [
    "Condo",
    "Town House",
    "Town House – Basement",
    "Single House",
    "Single House – Basement",
    "Apartment",
    "Basement",
];

const FEATURES_LIST = [
    "Fully Furnished",
    "Utility Included",
    "Utility Excluded",
    "Parking",
    "Street Parking",
    "Pet Friendly",
    "Laundry in Unit",
    "Air Conditioning",
    "Dishwasher",
    "Balcony",
];

export const AdminRentalsCRUD = () => {
    const [rentals, setRentals] = useState<AdminRental[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [rentalToDelete, setRentalToDelete] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<AdminRental>>({
        title: "",
        description: "",
        address: "",
        property_type: "Condo",
        price: 0,
        features: [],
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        images: []
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("admin_rentals")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRentals(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch admin rentals");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureToggle = (feature: string) => {
        setFormData(prev => {
            const current = prev.features || [];
            if (current.includes(feature)) {
                return { ...prev, features: current.filter(f => f !== feature) };
            } else {
                return { ...prev, features: [...current, feature] };
            }
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `admin/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('rental-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('rental-images')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            }
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
            toast.success(`${newImages.length} image(s) uploaded`);
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            address: "",
            property_type: "Condo",
            price: 0,
            features: [],
            contact_name: "",
            contact_phone: "",
            contact_email: "",
            images: []
        });
        setEditingId(null);
    };

    const openCreateForm = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const openEditForm = (rental: AdminRental) => {
        setFormData(rental);
        setEditingId(rental.id);
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.address || !formData.price || !formData.contact_name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("admin_rentals")
                    .update(formData)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Rental updated successfully");
            } else {
                const { error } = await supabase
                    .from("admin_rentals")
                    .insert([formData]);
                if (error) throw error;
                toast.success("Rental created successfully");
            }
            setIsFormOpen(false);
            fetchRentals();
        } catch (err: any) {
            toast.error(err.message || "Failed to save rental");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!rentalToDelete) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from("admin_rentals")
                .delete()
                .eq("id", rentalToDelete);
            if (error) throw error;
            toast.success("Rental deleted successfully");
            fetchRentals();
        } catch (err: any) {
            toast.error("Failed to delete rental");
        } finally {
            setIsDeleting(false);
            setRentalToDelete(null);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-muted-foreground">Admin-Curated Rentals</h3>
                <Button onClick={openCreateForm} className="gap-2">
                    <Plus className="w-4 h-4" /> Add New Rental
                </Button>
            </div>

            <div className="grid gap-4">
                {rentals.map(rental => (
                    <Card key={rental.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                                    {rental.images?.[0] ? (
                                        <img src={rental.images[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <Home size={20} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium line-clamp-1">{rental.title}</h4>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="font-semibold text-primary">${rental.price}/mo</span>
                                        <span className="hidden sm:inline">• {rental.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => openEditForm(rental)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setRentalToDelete(rental.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {rentals.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                        <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground italic">No admin-curated rentals yet.</p>
                        <Button variant="link" onClick={openCreateForm}>Add your first listing</Button>
                    </div>
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Rental" : "Add New Rental Listing"}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the rental listing. These will be displayed publicly on the Rentals page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Luxury Condo in Downtown"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Monthly Price ($) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Full street address, City, Province/State"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Property Type</Label>
                                <Select
                                    value={formData.property_type}
                                    onValueChange={(val) => handleSelectChange("property_type", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROPERTY_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="min-h-[120px]"
                                placeholder="Detailed description of the property..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Features</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {FEATURES_LIST.map(feature => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`feature-${feature}`}
                                            checked={formData.features?.includes(feature)}
                                            onCheckedChange={() => handleFeatureToggle(feature)}
                                        />
                                        <label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer">{feature}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_name">Name *</Label>
                                    <Input
                                        id="contact_name"
                                        name="contact_name"
                                        value={formData.contact_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Phone *</Label>
                                    <Input
                                        id="contact_phone"
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Email *</Label>
                                    <Input
                                        id="contact_email"
                                        name="contact_email"
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <Label>Property Photos</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/20">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    id="admin-image-upload"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                <Button asChild disabled={uploading} variant="outline" size="sm">
                                    <label htmlFor="admin-image-upload" className="cursor-pointer">
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Select Files"}
                                    </label>
                                </Button>
                            </div>

                            {formData.images && formData.images.length > 0 && (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square group rounded-md overflow-hidden border">
                                            <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? "Save Changes" : "Create Listing"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!rentalToDelete} onOpenChange={(open) => !open && setRentalToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this rental listing. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
