
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New candidate application for Senior Developer", time: "10 minutes ago" },
    { id: 2, text: "John Smith approved your job requisition", time: "1 hour ago" },
    { id: 3, text: "Interview scheduled with Alex Johnson", time: "2 hours ago" },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
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
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Handle form submission
      handleCloseModal();
      navigate("/requisitions");
    }
  };

  const jobDescription = `# Full Stack Developer

## About Us
We are a fast-growing tech company that builds innovative solutions for modern businesses. Our team is passionate about creating great software that solves real problems.

## Role Description
We are looking for a talented Full Stack Developer to join our engineering team. In this role, you will work on both front-end and back-end development for our web applications. You will collaborate with product managers, designers, and other developers to create high-quality, scalable software.

## Requirements
- 3+ years of experience in software development
- Proficiency in JavaScript/TypeScript, Node.js, and React
- Experience with databases (SQL and NoSQL)
- Understanding of cloud services (AWS/Azure/GCP)
- Knowledge of Git and CI/CD pipelines

## Nice-to-Have Skills
- Experience with GraphQL and RESTful APIs
- Knowledge of Docker and Kubernetes
- Understanding of microservices architecture
- Experience with TDD and BDD

## Benefits
- Competitive salary and equity options
- Flexible work arrangements (remote/hybrid)
- Health, dental, and vision insurance
- Professional development budget
- Unlimited PTO`;

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
                      <p className="text-sm text-gray-800">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="py-2 px-4 border-t border-gray-200">
                  <Button variant="link" className="w-full justify-center text-xs">
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
          <Dialog open={showModal && currentStep === 1} onOpenChange={(open) => !open && handleCloseModal()}>
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
                <Button onClick={handleNext} disabled={!role || !experience}>
                  Next
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Step 2: Job Description Modal */}
          <Dialog open={showModal && currentStep === 2} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Job Description</DialogTitle>
                <DialogDescription>
                  Review the job description for {role} role.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="border rounded-md p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{jobDescription}</pre>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Create Requisition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
