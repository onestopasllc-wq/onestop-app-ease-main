import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Upload, Home, check, DollarSign, Image as ImageIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Zod Schema for validation
const rentalSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    address: z.string().min(5, "Address is required"),
    property_type: z.string().min(1, "Property type is required"),
    price: z.coerce.number().min(50, "Price must be at least $50"),
    contact_name: z.string().min(2, "Contact name is required"),
    contact_phone: z.string().min(10, "Valid phone number is required"),
    contact_email: z.string().email("Valid email is required"),
    features: z.array(z.string()).optional(),
});

type RentalFormValues = z.infer<typeof rentalSchema>;

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

export const RentalForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<RentalFormValues>({
        resolver: zodResolver(rentalSchema),
        defaultValues: {
            features: [],
            price: 0
        }
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Please login to post a rental listing");
            navigate("/login");
        }
    };

    const selectedFeatures = watch("features") || [];

    const handleFeatureToggle = (feature: string) => {
        const current = selectedFeatures;
        if (current.includes(feature)) {
            setValue("features", current.filter(f => f !== feature));
        } else {
            setValue("features", [...current, feature]);
        }
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
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('rental-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('rental-images')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            }
            setUploadedImages([...uploadedImages, ...newImages]);
            toast.success(`${newImages.length} image(s) uploaded`);
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: RentalFormValues) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in to post a rental");
                return;
            }

            // Skip database insertion step and go straight to payment
            await handlePayment({
                ...data,
                images: uploadedImages,
                user_id: user.id,
                features: selectedFeatures
            });

        } catch (error: any) {
            toast.error("Failed to initiate process: " + error.message);
            setSaving(false);
        }
    };

    const handlePayment = async (listingData: any) => {
        try {
            toast.info("Redirecting to secure payment...");

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const { data, error } = await supabase.functions.invoke('create-rental-checkout', {
                body: {
                    listingData: {
                        ...listingData,
                        user_id: session.user.id,
                        features: selectedFeatures
                    }
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error("Failed to initiate payment: " + error.message);
            setSaving(false);
        }
    };


    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Post a Rental Listing</h1>
                <p className="text-muted-foreground">Share your property with thousands of potential tenants.</p>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className={`h-3 w-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-muted"} transition-colors`} />
                <div className={`h-3 w-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-1 w-16 ${step >= 3 ? "bg-primary" : "bg-muted"} transition-colors`} />
                <div className={`h-3 w-3 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Property Details"}
                        {step === 2 && "Photos & Media"}
                        {step === 3 && "Review & Pay"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Start by providing the basic information about your rental property."}
                        {step === 2 && "High-quality photos increase your chances of finding a tenant."}
                        {step === 3 && "Confirm your details and proceed to payment ($25.00 USD)."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input {...register("title")} placeholder="e.g. Spacious 2BR Condo downtown" />
                                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Monthly Price ($)</Label>
                                        <Input type="number" {...register("price")} />
                                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input {...register("address")} placeholder="Full property address" />
                                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Property Type</Label>
                                        <Select onValueChange={(val) => setValue("property_type", val)} defaultValue={getValues("property_type")}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PROPERTY_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.property_type && <p className="text-xs text-destructive">{errors.property_type.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea {...register("description")} className="min-h-[120px]" placeholder="Describe the property features, location benefits, etc." />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label>Features</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {FEATURES_LIST.map(feature => (
                                            <div key={feature} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={feature}
                                                    checked={selectedFeatures.includes(feature)}
                                                    onCheckedChange={() => handleFeatureToggle(feature)}
                                                />
                                                <label htmlFor={feature} className="text-sm cursor-pointer">{feature}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="text-sm font-medium mb-4">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input {...register("contact_name")} />
                                            {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input {...register("contact_phone")} />
                                            {errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input {...register("contact_email")} />
                                            {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/20">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="font-medium text-lg">Upload Photos</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Upload up to 10 photos of your property.</p>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        id="image-upload"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    <Button asChild disabled={uploading} variant="outline">
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Select Files"}
                                        </label>
                                    </Button>
                                </div>

                                {uploadedImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        {uploadedImages.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square group rounded-md overflow-hidden border">
                                                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {uploadedImages.length === 0 && (
                                    <div className="text-center p-4 text-amber-600 bg-amber-50 rounded-md text-sm border border-amber-200">
                                        At least one photo is recommended for better visibility.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center">
                                        <Home className="mr-2 h-5 w-5" />
                                        {watch("title")}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block">Property Type</span>
                                            {watch("property_type")}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Price</span>
                                            ${watch("price")}/mo
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground block">Address</span>
                                            {watch("address")}
                                        </div>
                                    </div>
                                </div>

                                <div className="border bg-card p-6 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-semibold text-lg">Listing Subscription</h3>
                                            <p className="text-sm text-muted-foreground">Monthly subscription for premium placement</p>
                                        </div>
                                        <div className="text-2xl font-bold">$25.00<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20 mb-4">
                                        <div className="flex gap-3">
                                            <DollarSign className="text-primary h-5 w-5 shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-medium text-primary">Secure Payment via Stripe</p>
                                                <p className="text-muted-foreground mt-1">This is a recurring monthly subscription of $25.00 USD. You can cancel anytime from your dashboard.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1 || saving}
                    >
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button onClick={handleSubmit(() => setStep(s => s + 1))}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit(onSubmit)} disabled={saving} className="bg-green-600 hover:bg-green-700">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay & Publish"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};
