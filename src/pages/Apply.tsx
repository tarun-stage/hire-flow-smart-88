import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Send, User, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
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
import { RoleSelect } from "@/components/apply/RoleSelect";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  coverLetter: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Apply() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!resumeFile) {
      toast({
        variant: "destructive",
        title: "Resume required",
        description: "Please upload your resume to continue",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        variant: "destructive",
        title: "Role required",
        description: "Please select a role to continue",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("coverLetter", values.coverLetter || "");
      formData.append("role", selectedRole);

      const response = await fetch("http://localhost:3001/api/apply", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      const data = await response.json();

      toast({
        title: "Application submitted!",
        description: "We'll be in touch soon regarding your application.",
      });

      // Reset form
      form.reset();
      setResumeFile(null);
      setSelectedRole("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Job Application</CardTitle>
          <CardDescription>
            Complete the form below to apply for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          className="pl-10"
                          placeholder="John Doe"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            className="pl-10"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            className="pl-10"
                            placeholder="(123) 456-7890"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Resume</FormLabel>
                <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                  <input
                    type="file"
                    id="resume"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="resume"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="rounded-full bg-primary-50 p-3">
                      <Upload className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload your resume</p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC or DOCX (max 5MB)
                      </p>
                    </div>
                  </label>
                  {resumeFile && (
                    <div className="mt-4 p-2 bg-primary-50 rounded-md flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium truncate flex-1">
                        {resumeFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                {form.formState.isSubmitted && !resumeFile && (
                  <p className="text-sm font-medium text-destructive">
                    Resume is required
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Tell us why you're interested in this position and why you're a good fit..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief cover letter will help us understand your
                      motivation and fit for the role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-t-2 border-white"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
