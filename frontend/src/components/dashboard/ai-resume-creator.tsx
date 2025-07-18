"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Upload } from "lucide-react";
import { createResume } from "@/lib/backend";
import { useAuth } from "@/lib/auth-context";
import { storage} from "@/lib/firebase";
import { ref, uploadBytes} from "firebase/storage";
import { useRouter } from "next/navigation";

type BackendCreateResumeResult = { pdf_link: string };

function ResultDisplay({ result }: { result: BackendCreateResumeResult }) {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLTextAreaElement>(null);
  // Show a download button for the created resume PDF
  return (
    <Card className="lg:col-span-3 mt-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in-up">
      <CardHeader>
        <CardTitle>Your New PDF Resume</CardTitle>
        <CardDescription>Your AI-crafted, ATS-friendly PDF resume is ready to download and use.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mt-6">
          <a
            href={result.pdf_link}
            target="_blank"
            rel="noopener noreferrer"
            className="classic-download-btn"
          >
            <Download className="mr-2 h-5 w-5 opacity-80" />
            <span className="font-medium">Download PDF</span>
          </a>
        </div>
      </CardContent>
      <style jsx global>{`
        .classic-download-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 2rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 500;
          background: linear-gradient(90deg, #7c3aed 0%, #6366f1 100%);
          color: #fff;
          box-shadow: 0 2px 12px 0 #7c3aed22;
          border: none;
          transition: 
            transform 0.15s cubic-bezier(.4,0,.2,1),
            box-shadow 0.15s cubic-bezier(.4,0,.2,1),
            background 0.15s cubic-bezier(.4,0,.2,1);
          outline: none;
          text-decoration: none;
        }
        .classic-download-btn:hover, .classic-download-btn:focus {
          transform: scale(1.04) translateY(-1px);
          background: linear-gradient(90deg, #6366f1 0%, #7c3aed 100%);
          box-shadow: 0 4px 24px 0 #7c3aed33;
          color: #fff;
        }
      `}</style>
    </Card>
  );
}

export function AiResumeCreator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BackendCreateResumeResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or .txt file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.replace("/login");
      return;
    }
    setIsLoading(true);
    setResult(null);
    const formElement = e.target as HTMLFormElement;
    const prompt = formElement.prompt.value;
    if (!prompt) {
      toast({ title: "Prompt is required.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    let resumeUrl = "";
    if (file) {
      try {
        const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        resumeUrl = storageRef.fullPath; // Send storage path
      } catch (err) {
        toast({ title: "Failed to upload file.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }
    try {
      const response = await createResume({
        prompt,
        fileUrl: resumeUrl || undefined,
        user,
      });
      setResult({ pdf_link: response.pdf_link });
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">AI PDF Resume Creator</CardTitle>
        <CardDescription>Generate a brand new, ATS-optimized PDF resume from a prompt, or upload your PDF to enhance it with AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-6">
           <div
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {fileName ? `Selected: ${fileName}` : "Optional: Upload resume (PDF) to modify"}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt"
              name="resumeFile"
            />
          </div>
          <Textarea
            name="prompt"
            placeholder="e.g., Create a resume for a software engineer with 3 years of experience in React and Node.js. OR Modify my resume to highlight my project management skills for a tech lead role."
            className="h-40 bg-card/50 focus:glow-border-violet"
          />
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Resume"
            )}
          </Button>
        </form>
        {result && <ResultDisplay result={result} />}
      </CardContent>
    </Card>
  );
}
