import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Users,
  BarChart2,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  BriefcaseBusiness,
  GraduationCap,
  UserCheck,
  GitPullRequest,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: BarChart2,
    path: "/",
  },
  {
    name: "Requisitions",
    icon: FileText,
    path: "/requisitions",
  },
  {
    name: "Candidates",
    icon: Users,
    path: "/candidates",
  },
  {
    name: "Approvals",
    icon: CheckCircle,
    path: "/approvals",
  },
  {
    name: "Review Assignment",
    icon: GitPullRequest,
    path: "/review-assignment",
  },
  {
    name: "Onboarding",
    icon: BriefcaseBusiness,
    path: "/onboarding",
  },
  {
    name: "Learning",
    icon: GraduationCap,
    path: "/learning",
  },
  {
    name: "Performance",
    icon: UserCheck,
    path: "/performance",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4">
        {!collapsed && (
          <div className="flex items-center flex-1">
            <div className="text-xl font-bold text-primary-600">TalentAI</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 h-5 w-5",
                  location.pathname === item.path
                    ? "text-primary-600"
                    : "text-gray-500"
                )}
              />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                JD
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Jane Doe</p>
              <p className="text-xs text-gray-500">HR Manager</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              JD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
