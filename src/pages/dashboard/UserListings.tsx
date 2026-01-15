import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { toast } from "sonner";
import {
    Loader2,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Plus,
    MapPin,
    Home,
    Phone,
    Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const UserListings = () => {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedListing, setSelectedListing] = useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editListing, setEditListing] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("rental_listings" as any)
                .select("*")
                .eq("user_id", user.id)
                .neq("status", "pending_payment")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch listings");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase
                .from("rental_listings" as any)
                .delete()
                .eq("id", deleteId);

            if (error) throw error;

            setListings(prev => prev.filter(l => l.id !== deleteId));
            toast.success("Listing deleted successfully");
        } catch (error: any) {
            toast.error("Failed to delete listing: " + error.message);
        } finally {
            setDeleteId(null);
        }
    };

    const handleEditClick = (listing: any) => {
        setEditListing(listing);
        setEditForm({
            title: listing.title,
            description: listing.description,
            price: listing.price,
            address: listing.address,
            contact_name: listing.contact_name,
            contact_phone: listing.contact_phone,
            contact_email: listing.contact_email
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editListing) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from("rental_listings" as any)
                .update(editForm)
                .eq("id", editListing.id);

            if (error) throw error;

            setListings(prev => prev.map(l =>
                l.id === editListing.id ? { ...l, ...editForm } : l
            ));
            toast.success("Listing updated successfully");
            setIsEditOpen(false);
        } catch (error: any) {
            toast.error("Failed to update listing: " + error.message);
        } finally {
            setUpdating(false);
        }
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
            case "pending_approval":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
                    <p className="text-muted-foreground">Manage your rental properties.</p>
                </div>
                <Button asChild>
                    <Link to="/dashboard/rentals/new">
                        <Plus className="mr-2 h-4 w-4" /> Post New Rental
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Listings</CardTitle>
                    <CardDescription>
                        A list of all your rental submissions and their current status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {listings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>You haven't posted any rentals yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link to="/dashboard/rentals/new">Create your first listing</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Date Posted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listings.map((listing) => (
                                        <TableRow key={listing.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-3">
                                                    {listing.images && listing.images[0] && (
                                                        <img
                                                            src={listing.images[0]}
                                                            alt="Thumbnail"
                                                            className="h-10 w-10 rounded object-cover border hidden sm:block"
                                                        />
                                                    )}
                                                    <span className="line-clamp-1 max-w-[200px]">{listing.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>${listing.price}/mo</TableCell>
                                            <TableCell>{getStatusBadge(listing.status || listing.admin_status)}</TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                {new Date(listing.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedListing(listing);
                                                            setIsDetailsOpen(true);
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditClick(listing)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(listing.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your rental listing along with all associated images.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedListing && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedListing.title}</DialogTitle>
                                <DialogDescription className="text-lg flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {selectedListing.address}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                    {selectedListing.images && selectedListing.images.length > 0 ? (
                                        <img
                                            src={selectedListing.images[0]}
                                            alt={selectedListing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Home className="w-16 h-16 opacity-20" />
                                        </div>
                                    )}
                                    <Badge className="absolute top-4 right-4 text-lg px-3 py-1">
                                        ${selectedListing.price}/mo
                                    </Badge>
                                    <Badge className="absolute top-4 left-4 text-sm px-3 py-1 bg-background/90">
                                        {getStatusBadge(selectedListing.status)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                {selectedListing.description}
                                            </p>
                                        </div>

                                        {selectedListing.features && selectedListing.features.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2">Features</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedListing.features.map((feature: string, i: number) => (
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
                                                    <div className="font-medium">{selectedListing.contact_name}</div>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{selectedListing.contact_phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate">{selectedListing.contact_email}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {selectedListing.views !== undefined && (
                                            <div className="text-sm text-muted-foreground text-center p-3 bg-muted rounded-lg">
                                                <div className="font-semibold text-foreground text-lg">{selectedListing.views}</div>
                                                <div>Total Views</div>
                                            </div>
                                        )}

                                        <div className="text-xs text-muted-foreground text-center">
                                            Posted on {new Date(selectedListing.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {selectedListing.images && selectedListing.images.length > 1 && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Gallery</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedListing.images.slice(1).map((img: string, i: number) => (
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Listing</DialogTitle>
                        <DialogDescription>
                            Update your rental listing information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Property title"
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Describe your property"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-price">Price ($/month)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={editForm.price || ''}
                                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    placeholder="Monthly rent"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-address">Address</Label>
                                <Input
                                    id="edit-address"
                                    value={editForm.address || ''}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Property address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="edit-contact-name">Contact Name</Label>
                                <Input
                                    id="edit-contact-name"
                                    value={editForm.contact_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-contact-phone">Contact Phone</Label>
                                <Input
                                    id="edit-contact-phone"
                                    value={editForm.contact_phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-contact-email">Contact Email</Label>
                                <Input
                                    id="edit-contact-email"
                                    type="email"
                                    value={editForm.contact_email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                                    placeholder="Email address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updating}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={updating}>
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserListings;
