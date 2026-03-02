import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { caseStudies } from "./caseStudyData";

export default function CaseStudyNav({ currentSlug }) {
  const currentIndex = caseStudies.findIndex((cs) => cs.slug === currentSlug);
  const prev = currentIndex > 0 ? caseStudies[currentIndex - 1] : null;
  const next =
    currentIndex < caseStudies.length - 1
      ? caseStudies[currentIndex + 1]
      : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1E2830] border-t border-gray-200 dark:border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Previous */}
          <div className="flex-1">
            {prev ? (
              <Link
                to={createPageUrl(`CaseStudy?slug=${prev.slug}`)}
                className="flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:block truncate">{prev.client}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Back to Portfolio */}
          <Link
            to={createPageUrl("Portfolio")}
            className="flex items-center gap-2 px-5 py-2 bg-[#1A2332] dark:bg-white/10 text-white rounded-full text-sm font-medium hover:bg-[#FF6B35] transition-colors flex-shrink-0"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">All Work</span>
          </Link>

          {/* Next */}
          <div className="flex-1 flex justify-end">
            {next ? (
              <Link
                to={createPageUrl(`CaseStudy?slug=${next.slug}`)}
                className="flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 hover:text-[#FF6B35] dark:hover:text-[#FF6B35] transition-colors group"
              >
                <span className="hidden sm:block truncate">{next.client}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
