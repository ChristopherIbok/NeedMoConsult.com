import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getCaseStudyBySlug } from "@/components/casestudy/CaseStudyData";

import CaseStudyHero from "@/components/casestudy/CaseStudyHero";
import CaseStudyOverview from "@/components/casestudy/CaseStudyOverview";
import CaseStudySidebar from "@/components/casestudy/CaseStudySidebar";
import CaseStudyGallery from "@/components/casestudy/CaseStudyGallery";
import CaseStudyStrategy from "@/components/casestudy/CaseStudyStrategy";
import CaseStudyResults from "@/components/casestudy/CaseStudyResults";
import CaseStudyTimeline from "@/components/casestudy/CaseStudyTimeline";
import CaseStudyTestimonial from "@/components/casestudy/CaseStudyTestimonial";
import CaseStudyCTA from "@/components/casestudy/CaseStudyCTA";
import CaseStudyRelated from "@/components/casestudy/CaseStudyRelated";
import CaseStudyNav from "@/components/casestudy/CaseStudyNav";

export default function CaseStudy() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "brightstart-wellness";
  const study = getCaseStudyBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (study) {
      document.title = `${study.client} Case Study | NEEDMO CONSULT`;
    }
  }, [slug]);

  if (!study) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center bg-white dark:bg-[#0F1419]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Case Study Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            This case study doesn't exist yet.
          </p>
          <Link
            to={createPageUrl("Portfolio")}
            className="bg-[#D4AF7A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C49A5E] transition-colors"
          >
            Back to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <CaseStudyHero study={study} />

      {/* Overview + Sidebar */}
      <CaseStudyOverview study={study} />

      {/* Project Details Sidebar — desktop inline, mobile section */}
      <section className="py-10 bg-white dark:bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-10">
            <div className="lg:col-span-1">
              <CaseStudySidebar study={study} />
            </div>
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-[#F7F7F7] dark:bg-[#1A2332] rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-4">
                  Quick Results Summary
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {study.results.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#1E2830] rounded-xl p-5"
                    >
                      <div className="text-3xl font-bold text-[#D4AF7A] mb-1">
                        {r.metric}
                      </div>
                      <div className="font-semibold text-[#1A2332] dark:text-white text-sm">
                        {r.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {r.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Gallery */}
      <CaseStudyGallery gallery={study.gallery} />

      {/* Strategy Breakdown */}
      <CaseStudyStrategy strategy={study.strategy} />

      {/* Results & Charts */}
      <CaseStudyResults study={study} />

      {/* Timeline */}
      <CaseStudyTimeline timeline={study.timeline2} />

      {/* Testimonial */}
      <CaseStudyTestimonial testimonial={study.testimonial} />

      {/* CTA */}
      <CaseStudyCTA />

      {/* Related Projects */}
      <CaseStudyRelated relatedSlugs={study.relatedStudies} />

      {/* Floating Nav */}
      <CaseStudyNav currentSlug={slug} />
    </main>
  );
}
