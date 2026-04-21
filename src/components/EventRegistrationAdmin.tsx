import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, Loader2, Trash2, User, Phone, MapPin, Calendar } from "lucide-react";
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

interface EventRegistration {
    id: string;
    full_name: string;
    phone_number: string;
    areas_of_interest: string[];
    other_interest: string | null;
    city_state: string;
    payment_status: string;
    stripe_session_id: string;
    created_at: string;
}

export const EventRegistrationAdmin = () => {
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [regToDelete, setRegToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("event_registrations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (err: any) {
            console.error("Fetch error:", err);
            toast.error("Failed to fetch registrations");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!regToDelete) return;

        try {
            const { error } = await supabase
                .from("event_registrations")
                .delete()
                .eq("id", regToDelete);

            if (error) throw error;

            setRegistrations(registrations.filter(r => r.id !== regToDelete));
            toast.success("Registration deleted");

            if (selectedReg?.id === regToDelete) {
                setIsDetailsOpen(false);
            }
        } catch (err) {
            toast.error("Failed to delete registration");
        } finally {
            setRegToDelete(null);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Event Registrations ({registrations.length})
                </h3>
                <Button variant="outline" size="sm" onClick={fetchRegistrations}>Refresh</Button>
            </div>

            <div className="grid gap-4">
                {registrations.map(reg => (
                    <Card key={reg.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-default">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{reg.full_name}</h4>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Phone size={12} /> {reg.phone_number}
                                        <span className="hidden sm:inline">•</span>
                                        <MapPin size={12} /> {reg.city_state}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant={reg.payment_status === 'paid' ? 'default' : 'outline'} className="hidden sm:inline-flex">
                                    {reg.payment_status.toUpperCase()}
                                </Badge>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedReg(reg); setIsDetailsOpen(true); }}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setRegToDelete(reg.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {registrations.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">No registrations found yet.</p>
                    </div>
                )}
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md">
                    {selectedReg && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Registration Details</DialogTitle>
                                <DialogDescription>Registered on {new Date(selectedReg.created_at).toLocaleString()}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground font-medium">Full Name</p>
                                        <p>{selectedReg.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground font-medium">Phone</p>
                                        <p>{selectedReg.phone_number}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground font-medium">Location</p>
                                        <p>{selectedReg.city_state}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground font-medium">Payment</p>
                                        <Badge>{selectedReg.payment_status.toUpperCase()}</Badge>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                    <p className="text-muted-foreground font-medium text-sm">Areas of Interest</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedReg.areas_of_interest.map(area => (
                                            <Badge key={area} variant="secondary">{area}</Badge>
                                        ))}
                                        {selectedReg.other_interest && (
                                            <Badge variant="outline" className="border-primary/30">Other: {selectedReg.other_interest}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button className="w-full" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!regToDelete} onOpenChange={(open) => !open && setRegToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Registration?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this registration from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
