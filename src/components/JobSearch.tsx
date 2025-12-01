import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

interface JobSearchProps {
    onSearch: (keyword: string) => void;
    initialValue?: string;
}

const JobSearch = ({ onSearch, initialValue = "" }: JobSearchProps) => {
    const [keyword, setKeyword] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search for jobs (e.g. Legal Assistant, Attorney)..."
                    className="pl-12 pr-32 h-14 rounded-full shadow-lg border-0 bg-white/95 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-secondary text-lg"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <Button
                    type="submit"
                    className="absolute right-1.5 h-11 rounded-full px-6 bg-secondary hover:bg-secondary/90 text-white font-semibold transition-all"
                >
                    Search
                </Button>
            </div>
        </form>
    );
};

export default JobSearch;
