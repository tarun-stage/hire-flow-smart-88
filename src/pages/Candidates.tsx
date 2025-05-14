
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CheckCircle } from "lucide-react";

const candidates = [
  {
    id: "c1",
    name: "Alex Johnson",
    position: "Full Stack Developer",
    applied: "May 10, 2025",
    stage: "Screening",
    score: 85,
    tags: ["JavaScript", "React", "Node.js"]
  },
  {
    id: "c2",
    name: "Maria Rodriguez",
    position: "UI/UX Designer",
    applied: "May 9, 2025",
    stage: "Screening",
    score: 92,
    tags: ["Figma", "UI Design", "Prototyping"]
  },
  {
    id: "c3",
    name: "James Wilson",
    position: "Product Manager",
    applied: "May 8, 2025",
    stage: "Interview",
    score: 78,
    tags: ["Agile", "Product Strategy", "User Research"]
  },
  {
    id: "c4",
    name: "Sarah Kim",
    position: "Data Scientist",
    applied: "May 7, 2025",
    stage: "Assessment",
    score: 94,
    tags: ["Python", "Machine Learning", "SQL"]
  },
  {
    id: "c5",
    name: "Michael Chen",
    position: "Frontend Developer",
    applied: "May 6, 2025",
    stage: "Screening",
    score: 82,
    tags: ["React", "TypeScript", "CSS"]
  }
];

const Candidates = () => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-gray-500">Manage and track your candidates</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search candidates by name, skills, or position..." 
            className="pl-8 w-full"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} /> Filters
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {candidates.map(candidate => (
              <div key={candidate.id} className="py-4 flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <Badge 
                        variant="outline" 
                        className="ml-2 bg-primary-50 text-primary-700 border-primary-200"
                      >
                        {candidate.stage}
                      </Badge>
                      {candidate.score >= 90 && (
                        <Badge className="ml-2 bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle size={12} /> Top Match
                        </Badge>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${getScoreColor(candidate.score)}`}>
                      {candidate.score}% Match
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{candidate.position} • Applied {candidate.applied}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Candidates;
