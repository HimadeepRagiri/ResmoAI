"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Download } from "lucide-react";
import { optimizeResume } from "@/lib/backend";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { storage} from "@/lib/firebase";
import { ref, uploadBytes} from "firebase/storage";
import { useRouter } from "next/navigation";

function ResultDisplay({ result }: { result: any }) {
  const { toast } = useToast();
  const improvedResumeRef = useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = () => {
    if (improvedResumeRef.current) {
      navigator.clipboard.writeText(improvedResumeRef.current.value);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const downloadAsTxt = () => {
    if (improvedResumeRef.current) {
      const element = document.createElement("a");
      const file = new Blob([improvedResumeRef.current.value], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "improved_resume.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  const scoreData = [{ name: 'score', value: result.matchScore || 0 }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-fade-in-up">
      <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>ATS & Job Match Score</CardTitle>
          <CardDescription>See how your PDF resume scores for ATS and job relevance.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="70%" 
              outerRadius="100%" 
              data={scoreData} 
              startAngle={90} 
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                className="fill-primary"
              />
               <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-4xl font-bold"
              >
                {`${result.matchScore || 0}%`}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>AI-Powered Feedback</CardTitle>
          <CardDescription>Get expert suggestions to maximize your interview chances.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{result.feedback}</div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Download Your Optimized PDF</CardTitle>
          <CardDescription>Get your enhanced, ATS-friendly PDF resume instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mt-6">
            <a
              href={result.improvedResume}
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
    </div>
  );
}

export function AiResumeOptimizer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!file) {
      toast({ title: "No resume file selected.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    let resumeUrl = "";
    try {
      const storageRef = ref(storage, `resumes/${user.uid}/optimized_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      resumeUrl = storageRef.fullPath; // Send storage path
    } catch (err) {
      toast({ title: "Failed to upload file.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    try {
      const response = await optimizeResume({
        prompt: (e.target as any).jobDescription.value,
        fileUrl: resumeUrl,
        user,
      });
      setResult({
        matchScore: response.match_score,
        feedback: response.feedback,
        improvedResume: response.pdf_link, // Show the PDF link for download
      });
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
      setResult(null);
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">ATS Resume Optimizer</CardTitle>
        <CardDescription>Upload your PDF resume and a job description to receive instant, AI-powered ATS analysis and actionable feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {fileName ? `Selected: ${fileName}` : "Drag & drop PDF, or click to browse"}
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
            name="jobDescription"
            placeholder="Paste the job description here (optional, but recommended for a match score)..."
            className="h-40 bg-card/50 focus:glow-border-violet"
          />
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </form>
        {result && <ResultDisplay result={result} />}
      </CardContent>
    </Card>
  );
}
