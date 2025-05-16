import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Send, FileText, GitPullRequest, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RoleSelect } from "@/components/apply/RoleSelect";

// Base form schema for common fields
const baseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

// Frontend role schema with GitHub and preview URLs
const frontendFormSchema = baseFormSchema.extend({
  githubUrl: z.string().min(1, "GitHub URL is required"),
  previewUrl: z.string().min(1, "Preview URL is required"),
});

// Design role schema with file upload
const designFormSchema = baseFormSchema.extend({});

type BaseFormValues = z.infer<typeof baseFormSchema>;
type FrontendFormValues = z.infer<typeof frontendFormSchema>;
type DesignFormValues = z.infer<typeof designFormSchema>;

type AnalysisResult = {
  score: number;
  details: string;
  status: string;
};

export default function ReviewAssignment() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const isFrontendRole = selectedRole.toLowerCase().includes("frontend");

  // Create form based on role type
  const form = useForm<FrontendFormValues | DesignFormValues>({
    resolver: zodResolver(
      isFrontendRole ? frontendFormSchema : designFormSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      ...(isFrontendRole
        ? {
            githubUrl: "",
            previewUrl: "",
          }
        : {}),
    },
  });

  const onSubmit = async (values: FrontendFormValues | DesignFormValues) => {
    if (!selectedRole) {
      toast({
        variant: "destructive",
        title: "Role required",
        description: "Please select a role to continue",
      });
      return;
    }

    if (!isFrontendRole && !portfolioFile) {
      toast({
        variant: "destructive",
        title: "Portfolio required",
        description: "Please upload your portfolio to continue",
      });
      return;
    }

    setIsSubmitting(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", selectedRole);

      if (isFrontendRole) {
        const frontendValues = values as FrontendFormValues;
        formData.append("githubUrl", frontendValues.githubUrl);
        formData.append("previewUrl", frontendValues.previewUrl);
      } else {
        formData.append("portfolio", portfolioFile!);
      }

      const response = await fetch("http://localhost:3001/api/pr-review", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      const data = await response.json();
      setAnalysisResult({
        score: data.review.score,
        details: data.review.analysis,
        status: data.review.status,
      });

      toast({
        title: "Assignment submitted!",
        description: "We'll review your submission and get back to you soon.",
      });

      // Reset form
      form.reset();
      setPortfolioFile(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to submit assignment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    form.reset();
    setPortfolioFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 100MB",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setPortfolioFile(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-500";
      case "HOLD":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Assignment Submission</CardTitle>
            <CardDescription>
              Submit your completed assignment for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <FormLabel>Select Role</FormLabel>
                  <RoleSelect
                    onRoleSelect={handleRoleSelect}
                    selectedRole={selectedRole}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isFrontendRole ? (
                  <>
                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub Repository URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <GitPullRequest className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                className="pl-10"
                                placeholder="https://github.com/username/repo"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Please provide the URL of your GitHub repository
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previewUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preview/Deployed URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                className="pl-10"
                                placeholder="https://your-preview-url.vercel.app"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Please provide the URL where your changes are
                            deployed/previewed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="space-y-2">
                    <FormLabel>Portfolio</FormLabel>
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                      <input
                        type="file"
                        id="portfolio"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="portfolio"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <div className="rounded-full bg-primary-50 p-3">
                          <Upload className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Click to upload your portfolio
                          </p>
                          <p className="text-sm text-gray-500">
                            PDF, DOC or DOCX (max 100MB)
                          </p>
                        </div>
                      </label>
                      {portfolioFile && (
                        <div className="mt-4 p-2 bg-primary-50 rounded-md flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-medium truncate flex-1">
                            {portfolioFile.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({(portfolioFile.size / (1024 * 1024)).toFixed(2)}{" "}
                            MB)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPortfolioFile(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    {form.formState.isSubmitted && !portfolioFile && (
                      <p className="text-sm font-medium text-destructive">
                        Portfolio is required
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-t-2 border-white"></div>
                      Submitting Assignment...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {analysisResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Results</CardTitle>
                <Badge
                  className={`${getStatusColor(
                    analysisResult.status
                  )} text-white`}
                >
                  {analysisResult.status}
                </Badge>
              </div>
              <CardDescription>
                Your submission has been analyzed. Here are the results:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Score</span>
                <Badge variant="outline" className="text-lg">
                  {analysisResult.score}%
                </Badge>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Detailed Analysis</h3>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {analysisResult.details}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
