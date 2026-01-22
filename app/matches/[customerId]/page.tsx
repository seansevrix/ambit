"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import ScoutingReportClient from "./ScoutingReportClient";

export default function MatchesPage() {
  const params = useParams();
  const customerId = Number(params.customerId);

  // 🔥 Fire Meta conversion when user reaches matches after signup
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "CompleteRegistration");
    }
  }, []);

  if (!customerId || Number.isNaN(customerId)) {
    return null; // safety guard
  }

  return <ScoutingReportClient customerId={customerId} />;
}
