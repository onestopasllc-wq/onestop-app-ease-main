import { useQuery } from "@tanstack/react-query";

// Types for Job Data
export interface JobPosition {
  MatchedObjectDescriptor: {
    PositionID: string;
    PositionTitle: string;
    PositionURI: string;
    ApplyURI: string[];
    PositionLocation: {
      LocationName: string;
      CountryCode: string;
      CountrySubDivisionCode: string;
      CityName: string;
    }[];
    OrganizationName: string;
    DepartmentName: string;
    JobCategory: {
      Name: string;
      Code: string;
    }[];
    PositionSchedule: {
      Name: string;
      Code: string;
    }[];
    PositionOfferingType: {
      Name: string;
      Code: string;
    }[];
    PositionRemuneration: {
      MinimumRange: string;
      MaximumRange: string;
      RateIntervalCode: string;
    }[];
    PositionStartDate: string;
    PositionEndDate: string;
    PublicationStartDate: string;
    ApplicationCloseDate: string;
    UserArea: {
      Details: {
        JobSummary: string;
        MajorDuties: string[];
        Education: string;
        Requirements: string;
        Evaluations: string;
        HowToApply: string;
        WhatToExpectNext: string;
        RequiredDocuments: string;
        Benefits: string;
        OtherInformation: string;
      };
    };
  };
}

export interface JobFilters {
  keyword?: string;
  location?: string;
  jobType?: string[]; // e.g., '1' for Full Time
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
}

// Mock Data for fallback/development
const MOCK_JOBS: JobPosition[] = [
  {
    MatchedObjectDescriptor: {
      PositionID: "1",
      PositionTitle: "Legal Assistant (Office Automation)",
      PositionURI: "https://www.usajobs.gov/job/1",
      ApplyURI: ["https://www.usajobs.gov/job/1/apply"],
      PositionLocation: [{ LocationName: "Washington, DC", CountryCode: "US", CountrySubDivisionCode: "DC", CityName: "Washington" }],
      OrganizationName: "Department of Justice",
      DepartmentName: "Offices, Boards and Divisions",
      JobCategory: [{ Name: "Legal Assistance", Code: "0986" }],
      PositionSchedule: [{ Name: "Full-time", Code: "1" }],
      PositionOfferingType: [{ Name: "Permanent", Code: "15317" }],
      PositionRemuneration: [{ MinimumRange: "55000", MaximumRange: "78000", RateIntervalCode: "PA" }],
      PositionStartDate: "2023-10-01",
      PositionEndDate: "2023-12-31",
      PublicationStartDate: "2023-10-01",
      ApplicationCloseDate: "2023-12-31",
      UserArea: {
        Details: {
          JobSummary: "Provides legal assistance to attorneys...",
          MajorDuties: ["Drafting documents", "Legal research"],
          Education: "Bachelor's degree",
          Requirements: "US Citizenship",
          Evaluations: "Interview",
          HowToApply: "Online",
          WhatToExpectNext: "Notification",
          RequiredDocuments: "Resume",
          Benefits: "Health, Dental",
          OtherInformation: "None"
        }
      }
    }
  },
  {
    MatchedObjectDescriptor: {
      PositionID: "2",
      PositionTitle: "Attorney Adviser (General)",
      PositionURI: "https://www.usajobs.gov/job/2",
      ApplyURI: ["https://www.usajobs.gov/job/2/apply"],
      PositionLocation: [{ LocationName: "New York, NY", CountryCode: "US", CountrySubDivisionCode: "NY", CityName: "New York" }],
      OrganizationName: "Securities and Exchange Commission",
      DepartmentName: "Division of Enforcement",
      JobCategory: [{ Name: "General Attorney", Code: "0905" }],
      PositionSchedule: [{ Name: "Full-time", Code: "1" }],
      PositionOfferingType: [{ Name: "Permanent", Code: "15317" }],
      PositionRemuneration: [{ MinimumRange: "120000", MaximumRange: "180000", RateIntervalCode: "PA" }],
      PositionStartDate: "2023-10-05",
      PositionEndDate: "2023-11-30",
      PublicationStartDate: "2023-10-05",
      ApplicationCloseDate: "2023-11-30",
      UserArea: {
        Details: {
          JobSummary: "Advises on securities laws...",
          MajorDuties: ["Legal analysis", "Litigation support"],
          Education: "JD",
          Requirements: "Bar membership",
          Evaluations: "Writing sample",
          HowToApply: "Online",
          WhatToExpectNext: "Interview",
          RequiredDocuments: "Resume, Transcripts",
          Benefits: "Federal benefits",
          OtherInformation: "Travel required"
        }
      }
    }
  },
   {
    MatchedObjectDescriptor: {
      PositionID: "3",
      PositionTitle: "Paralegal Specialist",
      PositionURI: "https://www.usajobs.gov/job/3",
      ApplyURI: ["https://www.usajobs.gov/job/3/apply"],
      PositionLocation: [{ LocationName: "Chicago, IL", CountryCode: "US", CountrySubDivisionCode: "IL", CityName: "Chicago" }],
      OrganizationName: "Social Security Administration",
      DepartmentName: "Office of Hearings Operations",
      JobCategory: [{ Name: "Paralegal Specialist", Code: "0950" }],
      PositionSchedule: [{ Name: "Full-time", Code: "1" }],
      PositionOfferingType: [{ Name: "Permanent", Code: "15317" }],
      PositionRemuneration: [{ MinimumRange: "60000", MaximumRange: "85000", RateIntervalCode: "PA" }],
      PositionStartDate: "2023-10-10",
      PositionEndDate: "2023-12-15",
      PublicationStartDate: "2023-10-10",
      ApplicationCloseDate: "2023-12-15",
      UserArea: {
        Details: {
          JobSummary: "Assists judges in drafting decisions...",
          MajorDuties: ["Case analysis", "Decision drafting"],
          Education: "Associate's degree",
          Requirements: "US Citizenship",
          Evaluations: "Assessment",
          HowToApply: "Online",
          WhatToExpectNext: "Status update",
          RequiredDocuments: "Resume",
          Benefits: "Standard",
          OtherInformation: "Telework eligible"
        }
      }
    }
  },
  {
    MatchedObjectDescriptor: {
      PositionID: "4",
      PositionTitle: "Contract Specialist",
      PositionURI: "https://www.usajobs.gov/job/4",
      ApplyURI: ["https://www.usajobs.gov/job/4/apply"],
      PositionLocation: [{ LocationName: "Remote", CountryCode: "US", CountrySubDivisionCode: "", CityName: "Remote" }],
      OrganizationName: "General Services Administration",
      DepartmentName: "Federal Acquisition Service",
      JobCategory: [{ Name: "Contracting", Code: "1102" }],
      PositionSchedule: [{ Name: "Full-time", Code: "1" }],
      PositionOfferingType: [{ Name: "Permanent", Code: "15317" }],
      PositionRemuneration: [{ MinimumRange: "80000", MaximumRange: "105000", RateIntervalCode: "PA" }],
      PositionStartDate: "2023-10-15",
      PositionEndDate: "2024-01-15",
      PublicationStartDate: "2023-10-15",
      ApplicationCloseDate: "2024-01-15",
      UserArea: {
        Details: {
          JobSummary: "Manages federal contracts...",
          MajorDuties: ["Contract negotiation", "Vendor management"],
          Education: "Bachelor's degree",
          Requirements: "US Citizenship",
          Evaluations: "Panel interview",
          HowToApply: "Online",
          WhatToExpectNext: "Selection",
          RequiredDocuments: "Resume, SF-50",
          Benefits: "Full package",
          OtherInformation: "Remote work available"
        }
      }
    }
  }
];

const API_KEY = import.meta.env.VITE_USAJOBS_API_KEY;
const USER_AGENT = import.meta.env.VITE_USAJOBS_USER_AGENT;
const BASE_URL = "https://data.usajobs.gov/api/search";

export const fetchJobs = async (filters: JobFilters) => {
  // If no API key is present, return mock data
  if (!API_KEY) {
    console.warn("No USAJobs API Key found. Using mock data.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple client-side filtering for mock data
    let filteredJobs = [...MOCK_JOBS];
    
    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.MatchedObjectDescriptor.PositionTitle.toLowerCase().includes(lowerKeyword) ||
        job.MatchedObjectDescriptor.OrganizationName.toLowerCase().includes(lowerKeyword)
      );
    }
    
    if (filters.location) {
       const lowerLoc = filters.location.toLowerCase();
       filteredJobs = filteredJobs.filter(job => 
        job.MatchedObjectDescriptor.PositionLocation.some(loc => loc.LocationName.toLowerCase().includes(lowerLoc))
       );
    }

    return {
      SearchResult: {
        SearchResultCount: filteredJobs.length,
        SearchResultCountAll: filteredJobs.length,
        SearchResultItems: filteredJobs
      }
    };
  }

  const params = new URLSearchParams();
  
  // Basic filters
  if (filters.keyword) params.append("Keyword", filters.keyword);
  if (filters.location) params.append("LocationName", filters.location);
  
  // Pagination
  if (filters.page) params.append("Page", filters.page.toString());
  params.append("ResultsPerPage", "10");
  
  // US Citizenship requirement is implicit for most federal jobs, but we can enforce it if needed
  // params.append("WhoMayApply", "Citizens"); 

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Host": "data.usajobs.gov",
      "User-Agent": USER_AGENT || "demo@example.com",
      "Authorization-Key": API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
