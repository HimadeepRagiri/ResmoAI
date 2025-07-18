'use client';

import { LogIn, Upload, BotMessageSquare, Download } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

const steps: { title: string; description: string; icon: ReactNode }[] = [
	{
		title: "Create Your Free Account",
		description:
			"Join in seconds and access all premium features—no credit card required.",
		icon: <LogIn className="h-8 w-8 text-primary" />,
	},
	{
		title: "Upload Your PDF Resume",
		description:
			"We only accept PDF files to ensure perfect formatting and ATS compatibility.",
		icon: <Upload className="h-8 w-8 text-primary" />,
	},
	{
		title: "Get Instant ATS Analysis",
		description:
			"Our AI reviews your PDF, scores it for ATS and job fit, and gives you clear, actionable feedback.",
		icon: <BotMessageSquare className="h-8 w-8 text-primary" />,
	},
	{
		title: "Download Your Optimized PDF",
		description:
			"Get your enhanced PDF resume and apply with confidence—knowing you’ll stand out.",
		icon: <Download className="h-8 w-8 text-primary" />,
	},
];

export function HowItWorks() {
	const [activeMobileStep, setActiveMobileStep] = useState<number | null>(null);
	return (
		<section id="how-it-works" className="py-20 md:py-32 bg-background/50">
			<div className="container mx-auto px-4 md:px-6">
				<div className="text-center mb-24">
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						From PDF Upload to Interview-Ready in Minutes
					</h2>
					<p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
						Our streamlined process ensures your resume is always ATS-ready and recruiter-approved.
					</p>
				</div>

				{/* Desktop Timeline View */}
				<div className="relative max-w-4xl mx-auto hidden md:block">
					<div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
					<div className="relative flex flex-col gap-y-32">
						{steps.map((step, index) => (
							<div
								key={step.title}
								className={cn(
									"group relative flex items-center animate-fade-in-up",
									index % 2 !== 0 ? "flex-row-reverse" : ""
								)}
								style={{ animationDelay: `${0.2 * index}s` }}
							>
								<div className="w-1/2">
									<div
										className={cn(
											"p-6 bg-card/50 rounded-xl transition-all duration-300 group-hover:bg-card/80 group-hover:shadow-xl group-hover:shadow-primary/10",
											index % 2 === 0 ? "mr-24 text-right" : "ml-24 text-left"
										)}
									>
										<h3 className="text-xl font-semibold mb-2 text-foreground transition-colors duration-300 group-hover:text-primary">
											{step.title}
										</h3>
										<p className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
											{step.description}
										</p>
									</div>
								</div>
								<div className="absolute left-1/2 -translate-x-1/2 z-10">
									<div className="relative w-24 h-24 flex items-center justify-center">
										{/* Solid background behind icon to block the timeline line */}
										<div className="absolute inset-0 rounded-full bg-background" />
										<div className="relative w-24 h-24 rounded-full bg-card border-4 border-primary/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:bg-primary/10">
											{step.icon}
										</div>
									</div>
								</div>
								<div className="w-1/2"></div>
							</div>
						))}
					</div>
				</div>

				{/* Mobile Stacked List View */}
				<div className="space-y-12 md:hidden">
					{steps.map((step, index) => (
						<div
							key={step.title}
							className={cn(
								"flex items-start gap-6 cursor-pointer transition-all duration-300",
								activeMobileStep === index
									? "bg-card/80 shadow-xl shadow-primary/10 rounded-xl"
								: ""
							)}
							style={{ animationDelay: `${0.2 * index}s` }}
							onClick={() => setActiveMobileStep(activeMobileStep === index ? null : index)}
						>
							<div className={cn(
								"mt-1 flex-shrink-0 w-16 h-16 rounded-full border-2 border-primary/50 flex items-center justify-center transition-all duration-300",
								activeMobileStep === index
									? "bg-primary/10 border-primary scale-110 shadow-lg shadow-primary/30"
									: "bg-card"
							)}>
								{step.icon}
							</div>
							<div>
								<h3 className={cn(
									"text-xl font-semibold mb-2 text-foreground transition-colors duration-300",
									activeMobileStep === index ? "text-primary" : ""
								)}>
									{step.title}
								</h3>
								<p className={cn(
									"text-muted-foreground transition-colors duration-300",
									activeMobileStep === index ? "text-foreground/80" : ""
								)}>
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
