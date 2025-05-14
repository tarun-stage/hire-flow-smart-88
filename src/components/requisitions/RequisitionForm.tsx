
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RequisitionForm() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [section, setSection] = useState("form"); // form, preview, success

  const handleGenerateDescription = () => {
    setGenerating(true);
    
    // Simulate AI generating a job description
    setTimeout(() => {
      setGenerating(false);
      setJobDescription(`# Full Stack Developer

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
- Unlimited PTO`);
    }, 2000);
  };

  const handlePreview = () => {
    setSection("preview");
  };

  const handleSubmit = () => {
    // Simulate submitting the form
    setTimeout(() => {
      setSection("success");
      toast({
        title: "Job Requisition Submitted",
        description: "Your job requisition has been sent for approval.",
      });
    }, 1000);
  };

  const renderFormSection = () => {
    return (
      <>
        <CardHeader>
          <CardTitle>New Job Requisition</CardTitle>
          <CardDescription>
            Create a new job requisition by filling out the form below. 
            AI will help generate a job description based on your requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position Title</Label>
              <Input id="position" placeholder="e.g. Full Stack Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" placeholder="e.g. 3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <Textarea 
              id="skills" 
              placeholder="e.g. JavaScript, React, Node.js, AWS"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional">Additional Information</Label>
            <Textarea 
              id="additional" 
              placeholder="Additional details about the position, team, or specific responsibilities"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="approver">Approver</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an approver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john-smith">John Smith (CTO)</SelectItem>
                <SelectItem value="sarah-johnson">Sarah Johnson (VP of Engineering)</SelectItem>
                <SelectItem value="mike-davis">Mike Davis (Director of HR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hiring-manager">Hiring Manager</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a hiring manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alice-lee">Alice Lee (Engineering Manager)</SelectItem>
                <SelectItem value="ryan-garcia">Ryan Garcia (Product Manager)</SelectItem>
                <SelectItem value="elena-wang">Elena Wang (Design Lead)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleGenerateDescription} 
              disabled={generating}
              variant="outline"
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Generating Job Description...
                </>
              ) : (
                "Generate Job Description with AI"
              )}
            </Button>
          </div>
          
          {jobDescription && (
            <div className="space-y-2">
              <Label htmlFor="job-description">AI-Generated Job Description</Label>
              <div className="border rounded-md p-4 bg-primary-50">
                <Textarea 
                  id="job-description" 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px]"
                />
              </div>
              <p className="text-xs text-gray-500">
                You can edit the AI-generated description before submitting.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 pb-2">
          <Button variant="outline">Cancel</Button>
          <Button 
            onClick={handlePreview}
            disabled={!jobDescription}
          >
            Preview & Submit
          </Button>
        </CardFooter>
      </>
    );
  };
  
  const renderPreviewSection = () => {
    return (
      <>
        <CardHeader>
          <CardTitle>Preview Job Requisition</CardTitle>
          <CardDescription>
            Review your job requisition before submitting it for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Full Stack Developer</h3>
              <p className="text-sm text-gray-500">Engineering • Remote • 3+ years</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Job Description</h4>
              <div className="border rounded-md p-4 prose prose-sm max-w-none overflow-auto max-h-[400px]">
                <div className="whitespace-pre-wrap">{jobDescription}</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Approver</h4>
                <p className="text-sm">John Smith (CTO)</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Hiring Manager</h4>
                <p className="text-sm">Alice Lee (Engineering Manager)</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 pb-2">
          <Button variant="outline" onClick={() => setSection("form")}>Back to Edit</Button>
          <Button onClick={handleSubmit}>Submit for Approval</Button>
        </CardFooter>
      </>
    );
  };
  
  const renderSuccessSection = () => {
    return (
      <>
        <CardHeader>
          <div className="flex justify-center py-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">Job Requisition Submitted</CardTitle>
          <CardDescription className="text-center">
            Your job requisition has been sent to John Smith for approval.
            You will receive a notification once it's been reviewed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-4 pb-6">
          <Button onClick={() => setSection("form")}>Create Another Requisition</Button>
        </CardFooter>
      </>
    );
  };

  const renderSection = () => {
    switch (section) {
      case "form":
        return renderFormSection();
      case "preview":
        return renderPreviewSection();
      case "success":
        return renderSuccessSection();
      default:
        return renderFormSection();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {renderSection()}
    </Card>
  );
}
