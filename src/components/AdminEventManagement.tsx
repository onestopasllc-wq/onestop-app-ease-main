import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Settings2, Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Event {
    id: string;
    title: string;
    description: string | null;
    registration_deadline: string;
    status: 'active' | 'closed' | 'completed';
    created_at: string;
}

export const AdminEventManagement = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // New/Edit Event State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [status, setStatus] = useState<'active' | 'closed' | 'completed'>('active');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (err: any) {
            toast.error("Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = async () => {
        if (!title || !deadline) {
            toast.error("Title and Deadline are required");
            return;
        }

        try {
            const { error } = await supabase
                .from("events")
                .insert([{
                    title,
                    description,
                    registration_deadline: new Date(deadline).toISOString(),
                    status
                }]);

            if (error) throw error;

            toast.success("Event created successfully");
            setIsAdding(false);
            resetForm();
            fetchEvents();
        } catch (err) {
            toast.error("Failed to create event");
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: 'active' | 'closed' | 'completed') => {
        try {
            const { error } = await supabase
                .from("events")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            toast.success(`Event status updated to ${newStatus}`);
            fetchEvents();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Are you sure? This will delete the event and its registrations.")) return;

        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Event deleted");
            fetchEvents();
        } catch (err) {
            toast.error("Failed to delete event");
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDeadline("");
        setStatus("active");
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    Event Control Center
                </h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Event</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Create New Event</CardTitle>
                        <CardDescription>Set up a new event for registration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Event Title</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Professional Summit 2024" />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration Deadline</Label>
                                <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief event summary" />
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Status</Label>
                            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Open)</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={handleSaveEvent}>Create Event</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {events.map(event => {
                    const isOverDeadline = new Date(event.registration_deadline) < new Date();
                    return (
                        <Card key={event.id} className={`overflow-hidden transition-all ${event.status === 'active' ? 'border-l-4 border-l-green-500' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-bold">{event.title}</h4>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                event.status === 'active' ? 'bg-green-100 text-green-700' : 
                                                event.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{event.description || "No description provided."}</p>
                                        
                                        <div className="flex flex-wrap gap-4 text-xs font-medium pt-2">
                                            <div className="flex items-center gap-1.5 text-primary">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Deadline: {format(new Date(event.registration_deadline), "MMM d, yyyy h:mm a")}
                                            </div>
                                            {isOverDeadline && (
                                                <div className="flex items-center gap-1.5 text-red-600">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Deadline Passed
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Select 
                                            value={event.status} 
                                            onValueChange={(val: any) => handleUpdateStatus(event.id, val)}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {events.length === 0 && (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">No events created yet.</p>
                        <Button variant="link" onClick={() => setIsAdding(true)}>Create your first event</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
