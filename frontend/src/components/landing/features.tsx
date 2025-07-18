import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Wand2, Percent, Download } from "lucide-react";
import { ReactNode } from "react";

const featureList: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "AI-Powered Resume Analysis",
    description: "Upload your PDF and receive instant, actionable feedback to boost your interview rate.",
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
  {
    title: "Effortless PDF Resume Creation",
    description: "Describe your background and let our AI generate a polished, ATS-optimized PDF resume in seconds.",
    icon: <Wand2 className="h-8 w-8 text-primary" />,
  },
  {
    title: "Job Description Match Scoring",
    description: "Upload a job description and your PDF resume to see your match score and get targeted improvement tips.",
    icon: <Percent className="h-8 w-8 text-primary" />,
  },
  {
    title: "Instant PDF Download",
    description: "Download your enhanced, ATS-friendly resume as a PDF—ready to submit anywhere.",
    icon: <Download className="h-8 w-8 text-primary" />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Ultimate ATS-Ready Resume Platform
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Every feature is engineered to maximize your chances of landing interviews. Stand out, pass ATS filters, and impress recruiters—every time.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featureList.map((feature, index) => (
            <Card
              key={feature.title}
              className="bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:border-primary/50 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 animate-fade-in-up"
              style={{ animationDelay: `${0.2 * (index + 1)}s` }}
            >
              <CardHeader className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
