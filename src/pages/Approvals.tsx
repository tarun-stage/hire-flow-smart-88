
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Approval = {
  id: string;
  title: string;
  type: "requisition" | "offer";
  requester: string;
  department: string;
  dateSubmitted: string;
  daysAgo: number;
};

const approvals: Approval[] = [
  {
    id: "a1",
    title: "Senior Frontend Developer",
    type: "requisition",
    requester: "Jane Doe",
    department: "Engineering",
    dateSubmitted: "May 12, 2025",
    daysAgo: 2
  },
  {
    id: "a2",
    title: "Product Marketing Manager",
    type: "requisition",
    requester: "Alex Johnson",
    department: "Marketing",
    dateSubmitted: "May 11, 2025",
    daysAgo: 3
  },
  {
    id: "a3",
    title: "Offer for Michael Chen",
    type: "offer",
    requester: "Sarah Williams",
    department: "Engineering",
    dateSubmitted: "May 13, 2025",
    daysAgo: 1
  }
];

const Approvals = () => {
  const { toast } = useToast();
  
  const handleApprove = (approval: Approval) => {
    toast({
      title: "Approved",
      description: `You've approved the ${approval.type} for ${approval.title}`,
    });
  };
  
  const handleReject = (approval: Approval) => {
    toast({
      title: "Rejected",
      description: `You've rejected the ${approval.type} for ${approval.title}`,
      variant: "destructive",
    });
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-gray-500">Review and manage pending approvals</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pending Approvals ({approvals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.map(approval => (
              <div key={approval.id} className="p-4 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base font-medium">{approval.title}</h3>
                    <Badge variant="outline" className={approval.type === "requisition" 
                      ? "bg-blue-50 text-blue-700 border-blue-200" 
                      : "bg-purple-50 text-purple-700 border-purple-200"}>
                      {approval.type === "requisition" ? "Job Requisition" : "Job Offer"}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>Requested by {approval.requester}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span>{approval.department}</span>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{approval.daysAgo} {approval.daysAgo === 1 ? 'day' : 'days'} ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(approval)}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(approval)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            
            {approvals.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">No pending approvals</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Approvals;
