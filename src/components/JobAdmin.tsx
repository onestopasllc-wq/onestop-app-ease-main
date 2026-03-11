import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminJob {
    id: string;
    title: string;
    organization: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_interval: string;
    job_type: string;
    description: string | null;
    apply_url: string | null;
    close_date: string | null;
    is_active: boolean;
    created_at: string;
}

export function JobAdmin() {
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        organization: "",
        location: "",
        salary_min: "",
        salary_max: "",
        salary_interval: "PA",
        job_type: "Full-time",
        description: "",
        apply_url: "",
        close_date: "",
        is_active: true
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("admin_jobs")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to fetch jobs: " + error.message);
        } else {
            setJobs(data || []);
        }
        setLoading(false);
    };

    const handleEdit = (job: AdminJob) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            organization: job.organization,
            location: job.location,
            salary_min: job.salary_min?.toString() || "",
            salary_max: job.salary_max?.toString() || "",
            salary_interval: job.salary_interval,
            job_type: job.job_type,
            description: job.description || "",
            apply_url: job.apply_url || "",
            close_date: job.close_date || "",
            is_active: job.is_active
        });
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingJob(null);
        setFormData({
            title: "",
            organization: "",
            location: "",
            salary_min: "",
            salary_max: "",
            salary_interval: "PA",
            job_type: "Full-time",
            description: "",
            apply_url: "",
            close_date: "",
            is_active: true
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...formData,
            salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
            salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
            close_date: formData.close_date || null
        };

        let error;
        if (editingJob) {
            const { error: updateError } = await supabase
                .from("admin_jobs")
                .update(payload)
                .eq("id", editingJob.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("admin_jobs")
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            toast.error("Error saving job: " + error.message);
        } else {
            toast.success(editingJob ? "Job updated successfully" : "Job added successfully");
            setIsDialogOpen(false);
            fetchJobs();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job post?")) return;

        const { error } = await supabase
            .from("admin_jobs")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete job: " + error.message);
        } else {
            toast.success("Job deleted");
            fetchJobs();
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-primary">Job Posts</h2>
                    <p className="text-muted-foreground">Manage custom job listings for the website</p>
                </div>
                <Button onClick={handleAddNew} className="shadow-elegant hover-lift">
                    <Plus className="mr-2 h-4 w-4" /> Add New Job
                </Button>
            </div>

            <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Title</TableHead>
                                <TableHead className="font-bold">Organization</TableHead>
                                <TableHead className="font-bold">Location</TableHead>
                                <TableHead className="font-bold">Type</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                        No job posts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredJobs.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium text-primary">{job.title}</TableCell>
                                        <TableCell>{job.organization}</TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>{job.job_type}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {job.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(job)} className="hover:text-primary">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="hover:text-destructive text-destructive/80">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingJob ? "Edit Job Post" : "Add New Job Post"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organization">Organization / Company</Label>
                                <Input
                                    id="organization"
                                    required
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="job_type">Job Type</Label>
                                <Select
                                    value={formData.job_type}
                                    onValueChange={(v) => setFormData({ ...formData, job_type: v })}
                                >
                                    <SelectTrigger id="job_type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Temporary">Temporary</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary_min">Min Salary</Label>
                                <Input
                                    id="salary_min"
                                    type="number"
                                    value={formData.salary_min}
                                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary_max">Max Salary</Label>
                                <Input
                                    id="salary_max"
                                    type="number"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary_interval">Salary Interval</Label>
                                <Select
                                    value={formData.salary_interval}
                                    onValueChange={(v) => setFormData({ ...formData, salary_interval: v })}
                                >
                                    <SelectTrigger id="salary_interval">
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PA">Per Year (PA)</SelectItem>
                                        <SelectItem value="PH">Per Hour (PH)</SelectItem>
                                        <SelectItem value="PM">Per Month (PM)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="close_date">Closing Date</Label>
                                <Input
                                    id="close_date"
                                    type="date"
                                    value={formData.close_date}
                                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apply_url">Application / Apply URL</Label>
                            <Input
                                id="apply_url"
                                type="url"
                                placeholder="https://..."
                                value={formData.apply_url}
                                onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description / Summary</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <Label htmlFor="is_active">Active (Visible on website)</Label>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingJob ? "Update Job" : "Create Job"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
