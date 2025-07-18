"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiResumeOptimizer } from "./ai-resume-optimizer";
import { AiResumeCreator } from "./ai-resume-creator";
import { Wand2, FileText } from "lucide-react";

export function DashboardClient() {
  return (
    <Tabs defaultValue="optimizer" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-12">
        <TabsTrigger value="optimizer" className="h-10 text-base">
          <FileText className="mr-2 h-5 w-5" />
          AI Resume Optimizer
        </TabsTrigger>
        <TabsTrigger value="creator" className="h-10 text-base">
          <Wand2 className="mr-2 h-5 w-5" />
          AI Resume Creator
        </TabsTrigger>
      </TabsList>
      <TabsContent value="optimizer" className="mt-6">
        <AiResumeOptimizer />
      </TabsContent>
      <TabsContent value="creator" className="mt-6">
        <AiResumeCreator />
      </TabsContent>
    </Tabs>
  );
}
