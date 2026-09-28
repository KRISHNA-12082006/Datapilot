import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { PipelineSection } from "@/components/landing/pipeline-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PreviewSection } from "@/components/landing/preview-section";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <Hero />
      <PipelineSection />
      <FeaturesSection />
      <PreviewSection />
      <CtaFooter />
    </div>
  );
}
