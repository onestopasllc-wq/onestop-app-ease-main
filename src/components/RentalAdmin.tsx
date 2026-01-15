import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Eye, Loader2, Home, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface RentalListing {
    id: string;
    title: string;
    status: string;
    price: number;
    contact_name: string;
    payment_status: string;
    created_at: string;
    description: string;
    images: string[];
}

export const RentalAdmin = () => {
    const [listings, setListings] = useState<RentalListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = (await supabase
                .from("rental_listings" as any)
                .select("*")
                .neq("status", "pending_payment")
                .order("created_at", { ascending: false })) as any;

            if (error) throw error;
            setListings(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch listings");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("rental_listings" as any)
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));

            if (newStatus === 'approved') toast.success("Listing approved");
            else if (newStatus === 'rejected') toast.info("Listing rejected");

            if (selectedListing?.id === id) {
                setIsDetailsOpen(false);
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const deleteListing = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setListingToDelete(id);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;

        try {
            const { error } = await supabase
                .from("rental_listings" as any)
                .delete()
                .eq("id", listingToDelete);

            if (error) throw error;

            setListings(listings.filter(l => l.id !== listingToDelete));
            toast.success("Listing deleted successfully");

            if (selectedListing?.id === listingToDelete) {
                setIsDetailsOpen(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete listing");
        } finally {
            setListingToDelete(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'pending_approval': return <Badge className="bg-amber-500">Pending Review</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    const pendingReview = listings.filter(l => l.status === 'pending_approval');
    const others = listings.filter(l => l.status !== 'pending_approval');

    return (
        <div className="space-y-6">
            {pendingReview.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-600">
                        <Loader2 className="w-5 h-5 animate-pulse" />
                        Needs Review ({pendingReview.length})
                    </h3>
                    <div className="grid gap-4">
                        {pendingReview.map(listing => (
                            <ListingRow
                                key={listing.id}
                                listing={listing}
                                onView={() => { setSelectedListing(listing); setIsDetailsOpen(true); }}
                                onApprove={() => updateStatus(listing.id, 'approved')}
                                onReject={() => updateStatus(listing.id, 'rejected')}
                                onDelete={(e: any) => deleteListing(listing.id, e)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-muted-foreground">All Listings</h3>
                <div className="grid gap-2">
                    {others.map(listing => (
                        <ListingRow
                            key={listing.id}
                            listing={listing}
                            onView={() => { setSelectedListing(listing); setIsDetailsOpen(true); }}
                            onDelete={(e: any) => deleteListing(listing.id, e)}
                            simple
                        />
                    ))}
                    {others.length === 0 && <p className="text-muted-foreground text-sm italic">No other listings.</p>}
                </div>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedListing && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedListing.title}</DialogTitle>
                                <DialogDescription>Posted on {new Date(selectedListing.created_at).toLocaleDateString()}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-muted-foreground">Status:</span>
                                        <div className="mt-1">{getStatusBadge(selectedListing.status)}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Payment:</span>
                                        <div className="mt-1">
                                            <Badge variant={selectedListing.payment_status === 'paid' ? 'default' : 'outline'}>
                                                {selectedListing.payment_status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Price:</span>
                                        <p>${selectedListing.price}/mo</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Contact:</span>
                                        <p>{selectedListing.contact_name}</p>
                                    </div>
                                </div>

                                <div className="bg-muted p-4 rounded-md text-sm">
                                    {selectedListing.description}
                                </div>

                                {selectedListing.images && selectedListing.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedListing.images.map((img, i) => (
                                            <img key={i} src={img} className="w-full h-24 object-cover rounded-md border" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="gap-2 sm:justify-between">
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                                {selectedListing.status === 'pending_approval' && (
                                    <div className="flex gap-2">
                                        <Button variant="destructive" onClick={() => updateStatus(selectedListing.id, 'rejected')}>Reject</Button>
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selectedListing.id, 'approved')}>Approve</Button>
                                    </div>
                                )}
                            </DialogFooter>
                            <div className="mt-4 pt-4 border-t flex justify-end">
                                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2" onClick={() => deleteListing(selectedListing.id)}>
                                    <Trash2 className="w-4 h-4" /> Delete Listing
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!listingToDelete} onOpenChange={(open) => !open && setListingToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the rental listing from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const ListingRow = ({ listing, onView, onApprove, onReject, onDelete, simple }: any) => (
    <Card className="overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {listing.images?.[0] ? <img src={listing.images[0]} className="w-full h-full object-cover" /> : <Home size={16} />}
                </div>
                <div>
                    <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>${listing.price}</span>
                        {!simple && <span className="hidden sm:inline">• {listing.contact_name}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {simple && (
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {listing.status}
                    </Badge>
                )}
                <Button size="sm" variant="ghost" onClick={onView}><Eye className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
                {!simple && (
                    <>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onReject}>
                            <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={onApprove}>
                            <Check className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </CardContent>
    </Card>
);
