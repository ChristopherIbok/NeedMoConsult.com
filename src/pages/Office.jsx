import React, { useState, useEffect, lazy, Suspense } from "react";

const OfficeContent = lazy(() => import("../components/office/OfficeContent"));

export default function Office() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#D4AF7A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#D4AF7A] rounded-full animate-spin"></div>
      </div>
    }>
      <OfficeContent />
    </Suspense>
  );
}
