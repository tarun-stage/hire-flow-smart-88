
import Layout from "@/components/layout/Layout";
import MetricsCard from "@/components/dashboard/MetricsCard";
import RequisitionTable from "@/components/dashboard/RequisitionTable";
import CandidateKanban from "@/components/dashboard/CandidateKanban";
import { Users, FileText, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recentRequisitions = [
  {
    id: "req1",
    title: "Senior Full Stack Developer",
    department: "Engineering",
    status: "Approved" as const,
    applications: 12,
    dateCreated: "May 10, 2025",
  },
  {
    id: "req2",
    title: "Product Marketing Manager",
    department: "Marketing",
    status: "Pending" as const,
    applications: 5,
    dateCreated: "May 12, 2025",
  },
  {
    id: "req3",
    title: "UI/UX Designer",
    department: "Design",
    status: "Draft" as const,
    applications: 0,
    dateCreated: "May 13, 2025",
  },
  {
    id: "req4",
    title: "Data Scientist",
    department: "Analytics",
    status: "Rejected" as const,
    applications: 0,
    dateCreated: "May 8, 2025",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to TalentAI</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricsCard
          title="Total Candidates"
          value="124"
          icon={<Users size={18} />}
          description="This month"
          trend={{ value: 12, positive: true }}
        />
        <MetricsCard
          title="Open Requisitions"
          value="8"
          icon={<FileText size={18} />}
          description="Active jobs"
          trend={{ value: 3, positive: true }}
        />
        <MetricsCard
          title="Pending Approvals"
          value="3"
          icon={<CheckCircle size={18} />}
          description="Awaiting review"
        />
        <MetricsCard
          title="Interviews Scheduled"
          value="16"
          icon={<Calendar size={18} />}
          description="This week"
          trend={{ value: 5, positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <RequisitionTable requisitions={recentRequisitions} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <CandidateKanban />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
