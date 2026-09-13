"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck, ArrowLeft, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSwipeBack } from "@/hooks/use-swipe-back";
import type { ExtractedBiomarker, OCRStatus } from "@/types/onboarding";

export default function ReportsPage() {
  useSwipeBack("/profile");
  const draft = useOnboardingStore((state) => state.draft);
  const updateReportUpload = useOnboardingStore((state) => state.updateReportUpload);
  const updateGlucoseLabs = useOnboardingStore((state) => state.updateGlucoseLabs);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<OCRStatus | null>(draft.reportUpload?.ocrStatus || null);
  const [extractedBiomarkers, setExtractedBiomarkers] = useState<ExtractedBiomarker[]>(
    draft.reportUpload?.extractedBiomarkers || []
  );
  const [userConfirmed, setUserConfirmed] = useState(draft.reportUpload?.userConfirmedFindings || false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);
    setIsSaved(false);

    // Simulate Multimodal OCR Pipeline processing
    setTimeout(() => {
      setIsProcessing(false);
      setOcrStatus("MANUAL_REVIEW_REQUIRED");

      const extracted: ExtractedBiomarker[] = [
        {
          name: "HbA1c",
          value: "6.4",
          unit: "%",
          referenceRange: "< 5.7%",
          isAbnormal: true,
          status: "MANUAL_REVIEW_REQUIRED",
          confidenceScore: 0.92,
          possibleFinding: "Possible finding: Elevated HbA1c (Prediabetes range)"
        },
        {
          name: "Fasting Blood Glucose",
          value: "115",
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          isAbnormal: true,
          status: "COMPLETED",
          confidenceScore: 0.96,
          possibleFinding: "Possible finding: Mildly elevated fasting glucose"
        },
        {
          name: "Total Cholesterol",
          value: "190",
          unit: "mg/dL",
          referenceRange: "< 200 mg/dL",
          isAbnormal: false,
          status: "COMPLETED",
          confidenceScore: 0.95
        }
      ];

      setExtractedBiomarkers(extracted);
      updateReportUpload({
        fileName: uploadedFile.name,
        ocrStatus: "MANUAL_REVIEW_REQUIRED",
        extractedBiomarkers: extracted,
        userConfirmedFindings: false
      });
    }, 1200);
  };

  const handleConfirmAndSave = () => {
    if (!userConfirmed) return;

    // Persist confirmed findings into health profile state
    updateReportUpload({
      fileName: file?.name || draft.reportUpload?.fileName || "Lab_Report.pdf",
      ocrStatus: "COMPLETED",
      extractedBiomarkers,
      userConfirmedFindings: true
    });

    const hba1cItem = extractedBiomarkers.find((b) => b.name === "HbA1c");
    const glucoseItem = extractedBiomarkers.find((b) => b.name.includes("Glucose"));

    updateGlucoseLabs({
      hba1cPercent: hba1cItem ? parseFloat(hba1cItem.value) : draft.glucoseLabs?.hba1cPercent || 6.1,
      fastingGlucoseMgDl: glucoseItem ? parseFloat(glucoseItem.value) : draft.glucoseLabs?.fastingGlucoseMgDl || 110,
      dontKnowWillUploadReport: false
    });

    setOcrStatus("COMPLETED");
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-4 shadow-xs">
        <Container className="max-w-md flex items-center justify-between">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-base font-bold text-gray-900">Medical Reports & OCR</h1>
          <div className="w-9" />
        </Container>
      </div>

      <Container className="max-w-md px-4 py-6 space-y-5">
        {/* Info Banner */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Medical Report Upload & OCR Foundation</p>
            <p className="mt-0.5 leading-relaxed font-medium">
              Upload lab reports (PDF, JPG, JPEG, PNG). V-Cure extracts biomarkers for manual review. Confirmed findings safely update your Health Profile and recommendations.
            </p>
          </div>
        </div>

        {/* Existing Active Report Card */}
        {draft.reportUpload?.fileName ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
                    {draft.reportUpload.fileName}
                  </h3>
                  <p className="text-[10px] font-semibold text-gray-400">
                    Status: {draft.reportUpload.ocrStatus || "Uploaded"}
                  </p>
                </div>
              </div>

              {draft.reportUpload.userConfirmedFindings ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Confirmed
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  Review Pending
                </span>
              )}
            </div>

            {/* Extracted Biomarkers List */}
            {draft.reportUpload.extractedBiomarkers && draft.reportUpload.extractedBiomarkers.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-700">Extracted Biomarkers:</p>
                {draft.reportUpload.extractedBiomarkers.map((bm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl">
                    <span className="font-semibold text-gray-800">{bm.name}</span>
                    <span className={`font-bold ${bm.isAbnormal ? "text-amber-700" : "text-emerald-700"}`}>
                      {bm.value} {bm.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Upload File Input */}
        <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center bg-gray-50 hover:bg-gray-100/80 transition-all">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-900">Upload New Report</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">PDF, PNG, JPG or JPEG up to 10MB</p>
            <span className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs">
              Select File
            </span>
          </div>
        </div>

        {/* Loader */}
        {isProcessing ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-xs">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-2" />
            <p className="text-xs font-bold text-gray-900">Running OCR Extraction...</p>
          </div>
        ) : null}

        {/* OCR Review & Confirm Section */}
        {ocrStatus && extractedBiomarkers.length > 0 && !isProcessing ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Review Extracted Findings
              </h3>
              <span className="text-[10px] font-bold text-amber-800">Manual Confirmation Required</span>
            </div>

            <div className="space-y-2">
              {extractedBiomarkers.map((bm, idx) => (
                <div key={idx} className="rounded-xl border border-gray-100 bg-white p-3 text-xs shadow-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{bm.name}</span>
                    <span className={bm.isAbnormal ? "text-amber-700" : "text-emerald-700"}>
                      {bm.value} {bm.unit}
                    </span>
                  </div>
                  {bm.possibleFinding ? (
                    <p className="text-[11px] font-semibold text-amber-800">{bm.possibleFinding}</p>
                  ) : null}
                  <p className="text-[10px] text-gray-400">Reference: {bm.referenceRange}</p>
                </div>
              ))}
            </div>

            <div
              onClick={() => setUserConfirmed(!userConfirmed)}
              className="cursor-pointer flex items-start gap-3 rounded-xl border border-amber-300 bg-white p-3 shadow-xs mt-2"
            >
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-gray-800 leading-tight">
                I have reviewed these extracted lab findings and confirm updating my Health Profile.
              </span>
            </div>

            <Button
              type="button"
              disabled={!userConfirmed}
              onClick={handleConfirmAndSave}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              Confirm & Sync to Health Profile
            </Button>
          </div>
        ) : null}

        {isSaved ? (
          <div className="rounded-2xl bg-emerald-100 p-3 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Report findings confirmed & updated in Health Profile!
          </div>
        ) : null}
      </Container>
    </div>
  );
}
