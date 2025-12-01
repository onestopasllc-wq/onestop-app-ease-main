import { useState, useEffect } from "react";
import { useJobs, JobFilters as FilterTypes } from "@/lib/jobApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";
import JobSearch from "@/components/JobSearch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const Job = () => {
    const [filters, setFilters] = useState<FilterTypes>({
        keyword: "",
        location: "",
        page: 1,
    });

    const { data, isLoading, isError, error, refetch } = useJobs(filters);

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [filters.page]);

    const handleSearch = (keyword: string) => {
        setFilters(prev => ({ ...prev, keyword, page: 1 }));
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AnimatedBackground />
            <SEO
                title="Legal Jobs | OneStop Application Services"
                description="Find legal job opportunities for US citizens. Search and apply for the latest legal positions."
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="container mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6">
                            <Briefcase className="w-4 h-4" />
                            <span className="font-semibold text-sm">Career Opportunities</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
                            Find Your Next <span className="text-secondary">Legal Job</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Browse thousands of legal positions for US citizens. From paralegals to attorneys, find the perfect role for your career.
                        </p>

                        <JobSearch onSearch={handleSearch} initialValue={filters.keyword} />
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar Filters - Desktop */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24 bg-card p-6 rounded-xl shadow-card border border-border/50">
                                <JobFilters filters={filters} setFilters={handleFilterChange} />
                            </div>
                        </aside>

                        {/* Mobile Filter Trigger */}
                        <div className="lg:hidden mb-6">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="w-full flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                    <div className="py-6">
                                        <JobFilters filters={filters} setFilters={handleFilterChange} />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Job Listings */}
                        <div className="flex-grow">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
                                    <p className="text-muted-foreground">Searching for the best opportunities...</p>
                                </div>
                            ) : isError ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">Oops! Something went wrong.</h3>
                                    <p className="text-muted-foreground mb-6">{(error as Error).message || "Failed to load jobs."}</p>
                                    <Button onClick={() => refetch()}>Try Again</Button>
                                </div>
                            ) : data?.SearchResult?.SearchResultItems?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-dashed border-border">
                                    <Briefcase className="w-16 h-16 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">No jobs found</h3>
                                    <p className="text-muted-foreground mb-6">Try adjusting your search or filters to find more results.</p>
                                    <Button variant="outline" onClick={() => setFilters({ keyword: "", location: "", page: 1 })}>
                                        Clear Filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-muted-foreground">
                                            Showing <span className="font-semibold text-primary">{data?.SearchResult?.SearchResultItems?.length}</span> jobs
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        {data?.SearchResult?.SearchResultItems?.map((job: any) => (
                                            <JobCard key={job.MatchedObjectDescriptor.PositionID} job={job} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={filters.page === 1}
                                            onClick={() => handlePageChange((filters.page || 1) - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center px-4 font-medium text-primary">
                                            Page {filters.page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            // Simple pagination logic since API might not return total pages clearly in all modes
                                            // Assuming if we have 10 items (limit), there might be more
                                            disabled={data?.SearchResult?.SearchResultItems?.length < 10}
                                            onClick={() => handlePageChange((filters.page || 1) + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Job;
