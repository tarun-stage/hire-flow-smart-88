
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

type Requisition = {
  id: string;
  title: string;
  department: string;
  status: "Draft" | "Pending" | "Approved" | "Rejected";
  applications: number;
  dateCreated: string;
};

type RequisitionTableProps = {
  requisitions: Requisition[];
};

export default function RequisitionTable({ requisitions }: RequisitionTableProps) {
  const getStatusIcon = (status: Requisition["status"]) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={16} className="text-green-500" />;
      case "Rejected":
        return <XCircle size={16} className="text-red-500" />;
      case "Pending":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Requisition["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Draft":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Title</th>
              <th className="py-3 px-4 text-left font-medium">Department</th>
              <th className="py-3 px-4 text-left font-medium">Status</th>
              <th className="py-3 px-4 text-left font-medium">Applications</th>
              <th className="py-3 px-4 text-left font-medium">Date</th>
              <th className="py-3 px-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {requisitions.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{req.title}</div>
                </td>
                <td className="py-3 px-4">{req.department}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className={getStatusColor(req.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(req.status)} {req.status}
                    </span>
                  </Badge>
                </td>
                <td className="py-3 px-4">{req.applications}</td>
                <td className="py-3 px-4">{req.dateCreated}</td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
