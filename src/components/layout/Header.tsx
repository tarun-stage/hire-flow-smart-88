import { useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function Header() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New candidate application for Senior Developer",
      time: "10 minutes ago",
    },
    {
      id: 2,
      text: "John Smith approved your job requisition",
      time: "1 hour ago",
    },
    {
      id: 3,
      text: "Interview scheduled with Alex Johnson",
      time: "2 hours ago",
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setShowModal(true);
    setCurrentStep(1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setRole("");
    setExperience("");
    setJobDescription("");
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/api/create-jd", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: role,
            yearsOfExperience: experience,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch job description");
        }

        const data = await response.json();
        setJobDescription(data.jobDescription);
        setCurrentStep(2);
      } catch (error) {
        console.error("Error fetching job description:", error);
        // You might want to show an error toast or message here
      } finally {
        setIsLoading(false);
      }
    } else {
      // Create requisition and send email
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:3001/api/create-requisition",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role,
              yearsOfExperience: experience,
              jobDescription,
              email: "tarun@stage.in",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create requisition");
        }

        handleCloseModal();
        navigate("/requisitions");
      } catch (error) {
        console.error("Error creating requisition:", error);
        // You might want to show an error toast or message here
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white fixed top-0 right-0 left-0 z-20 flex items-center px-4">
      <div className="ml-16 md:ml-64 flex-1 flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search candidates, jobs, or anything..."
            className="pl-8 bg-gray-50"
          />
        </div>

        <div className="flex items-center ml-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fade-in">
                <div className="py-2 px-4 bg-primary-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm text-gray-800">
                        {notification.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="py-2 px-4 border-t border-gray-200">
                  <Button
                    variant="link"
                    className="w-full justify-center text-xs"
                  >
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            className="ml-4 bg-primary-600 hover:bg-primary-700"
            onClick={handleOpenModal}
          >
            + New Requisition
          </Button>

          {/* Step 1: Role and Experience Modal */}
          <Dialog
            open={showModal && currentStep === 1}
            onOpenChange={(open) => !open && handleCloseModal()}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Requisition</DialogTitle>
                <DialogDescription>
                  Enter the basic details for the new job requisition.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role Title</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!role || !experience || isLoading}
                >
                  {isLoading ? "Loading..." : "Next"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Step 2: Job Description Modal */}
          <Dialog
            open={showModal && currentStep === 2}
            onOpenChange={(open) => !open && handleCloseModal()}
          >
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Job Description</DialogTitle>
                <DialogDescription>
                  Review the job description for {role} role.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="border rounded-md p-4 bg-gray-50 max-h-[400px] overflow-y-auto prose prose-sm">
                  <ReactMarkdown>{jobDescription}</ReactMarkdown>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Requisition"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
