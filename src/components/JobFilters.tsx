import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface JobFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
    onClose?: () => void; // For mobile drawer
}

const JobFilters = ({ filters, setFilters, onClose }: JobFiltersProps) => {

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, location: e.target.value });
    };

    const handleSalaryChange = (value: number[]) => {
        setFilters({ ...filters, salaryMin: value[0] });
    };

    const clearFilters = () => {
        setFilters({
            keyword: "",
            location: "",
            salaryMin: 0,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">Filters</h3>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="location-filter">Location</Label>
                    <Input
                        id="location-filter"
                        placeholder="City, State or Zip"
                        value={filters.location || ""}
                        onChange={handleLocationChange}
                        className="bg-white"
                    />
                </div>

                <Separator />

                <div className="space-y-3">
                    <Label>Job Type</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="full-time" />
                            <label htmlFor="full-time" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Full-time
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="part-time" />
                            <label htmlFor="part-time" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Part-time
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="contract" />
                            <label htmlFor="contract" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Contract
                            </label>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label>Min Salary</Label>
                        <span className="text-sm text-muted-foreground">
                            ${filters.salaryMin ? filters.salaryMin.toLocaleString() : "0"}+
                        </span>
                    </div>
                    <Slider
                        defaultValue={[0]}
                        max={200000}
                        step={5000}
                        value={[filters.salaryMin || 0]}
                        onValueChange={handleSalaryChange}
                        className="py-4"
                    />
                </div>

                <Button
                    variant="outline"
                    className="w-full mt-4 border-dashed"
                    onClick={clearFilters}
                >
                    Clear All Filters
                </Button>
            </div>
        </div>
    );
};

export default JobFilters;
