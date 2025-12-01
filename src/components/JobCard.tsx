import { JobPosition } from "@/lib/jobApi";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, DollarSign, Calendar, ArrowRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

interface JobCardProps {
    job: JobPosition;
}

const JobCard = ({ job }: JobCardProps) => {
    const descriptor = job.MatchedObjectDescriptor;

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="h-full flex flex-col card-glow border-l-4 border-l-secondary overflow-hidden group">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-primary line-clamp-2 group-hover:text-secondary transition-colors">
                                {descriptor.PositionTitle}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm font-medium">{descriptor.OrganizationName}</span>
                            </div>
                        </div>
                        {descriptor.PositionOfferingType[0] && (
                            <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 whitespace-nowrap">
                                {descriptor.PositionSchedule[0]?.Name || "Full-time"}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow pb-4">
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-secondary" />
                            <span>{descriptor.PositionLocation[0]?.LocationName || "Multiple Locations"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-secondary" />
                            <span>
                                {formatCurrency(descriptor.PositionRemuneration[0]?.MinimumRange)} - {formatCurrency(descriptor.PositionRemuneration[0]?.MaximumRange)}
                                <span className="text-xs ml-1">/ {descriptor.PositionRemuneration[0]?.RateIntervalCode === 'PA' ? 'year' : 'hour'}</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary" />
                            <span>Closes: {formatDate(descriptor.ApplicationCloseDate)}</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="line-clamp-3 text-foreground/80 leading-relaxed">
                                {descriptor.UserArea.Details.JobSummary}
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-0">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white shadow-md group-hover:shadow-lg transition-all">
                        <a href={descriptor.ApplyURI[0]} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            Apply Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default JobCard;
