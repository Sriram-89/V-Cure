"use client";

import { useState, useEffect } from "react";
import { FileText, Shield, Upload, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useHealthVaultStore, type VaultDocumentType, type VaultDocument } from "@/store/health-vault-store";
import { checkReportQuality } from "@/lib/report-quality-checker";
import { useOnboardingStore } from "@/store/onboarding-store";

const CATEGORIES: { value: "ALL" | VaultDocumentType; label: string }[] = [
  { value: "ALL", label: "All Documents" },
  { value: "BLOOD_TEST", label: "Blood Tests" },
  { value: "HBA1C", label: "HbA1c Reports" },
  { value: "PRESCRIPTION", label: "Prescriptions" },
  { value: "INSURANCE", label: "Insurance" }
];

export function HealthVaultSection() {
  const documents = useHealthVaultStore((state) => state.documents);
  const fetchDocuments = useHealthVaultStore((state) => state.fetchDocuments);
  const addDocumentFile = useHealthVaultStore((state) => state.addDocumentFile);
  const confirmDocument = useHealthVaultStore((state) => state.confirmDocument);
  const updateGlucoseLabs = useOnboardingStore((state) => state.updateGlucoseLabs);

  const [activeTab, setActiveTab] = useState<"ALL" | VaultDocumentType>("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocs =
    activeTab === "ALL" ? documents : documents.filter((d) => d.type === activeTab);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQualityWarning(null);
    setIsProcessing(true);

    try {
      // 1. Run Pre-OCR Document Quality Check
      const quality = await checkReportQuality(file);

      if (!quality.isReadable) {
        setIsProcessing(false);
        setQualityWarning(quality.message);
        return;
      }

      const isInsurance =
        file.name.toLowerCase().includes("insurance") || file.name.toLowerCase().includes("policy");
      const category: VaultDocumentType = isInsurance ? "INSURANCE" : "BLOOD_TEST";

      // 2. Real Backend Upload to /api/medical-reports & Supabase Storage
      await addDocumentFile(file, category, "Metropolis Diagnostics");
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      setQualityWarning(err.message || "Failed to upload medical document file to storage.");
    }
  };

  const handleConfirmDoc = async (doc: VaultDocument) => {
    await confirmDocument(doc.id);
    if (doc.extractedBiomarkers) {
      const hba1c = doc.extractedBiomarkers.find((b) => b.name === "HbA1c");
      const fasting = doc.extractedBiomarkers.find((b) => b.name.includes("Fasting"));
      if (hba1c || fasting) {
        updateGlucoseLabs({
          hba1cPercent: hba1c ? parseFloat(hba1c.value) : 6.1,
          fastingGlucoseMgDl: fasting ? parseFloat(fasting.value) : 110,
          dontKnowWillUploadReport: false
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Digital Health Vault & Insurance
          </h2>
          <p className="text-xs font-medium text-gray-500">
            Secure digital storage for medical records & insurance policies
          </p>
        </div>
      </div>

      {/* Insurance Expiry Reminders Banner */}
      {documents.some((d) => d.type === "INSURANCE" && d.insuranceDetails?.expiryDate) ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
            <Clock className="h-4 w-4 text-amber-600" />
            Insurance Policy Reminder
          </div>
          <p className="text-xs font-medium text-amber-800 leading-relaxed">
            Your policy <span className="font-bold">Family Health Optima</span> has a renewal date approaching on <span className="font-bold">Oct 01, 2026</span>.
          </p>
        </div>
      ) : null}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveTab(cat.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
              activeTab === cat.value
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Upload Box */}
      <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-5 text-center bg-gray-50 hover:bg-gray-100/80 transition-all">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-2 shadow-xs">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-extrabold text-gray-900">Upload to Health Vault</p>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">Lab reports, Prescriptions, or Insurance PDFs</p>
        </div>
      </div>

      {/* Quality Check Warning Alert */}
      {qualityWarning ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-900 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{qualityWarning}</span>
        </div>
      ) : null}

      {isProcessing ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center text-xs font-bold text-gray-900 shadow-xs">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-1" />
          Performing document quality check & Supabase upload...
        </div>
      ) : null}

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center space-y-2 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No reports uploaded yet</h3>
            <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
              Upload lab reports, HbA1c tests, or health insurance PDFs to store them securely in your Health Vault.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
          <div key={doc.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 truncate max-w-[190px]">
                    {doc.name}
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400">
                    Uploaded: {doc.uploadDate} • {doc.type.replace("_", " ")}
                  </p>
                </div>
              </div>

              {doc.isConfirmed ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Confirmed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmDoc(doc)}
                  className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 hover:bg-amber-200 transition-all"
                >
                  Review & Sync
                </button>
              )}
            </div>

            {/* Storage path badge */}
            {doc.storagePath ? (
              <p className="text-[9px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded truncate">
                Key: {doc.storagePath}
              </p>
            ) : null}

            {/* Insurance details if present */}
            {doc.insuranceDetails ? (
              <div className="rounded-2xl bg-gray-50 p-3 text-xs space-y-1">
                <p className="font-bold text-gray-900">{doc.insuranceDetails.provider}</p>
                <p className="text-[11px] font-medium text-gray-600">
                  Policy: {doc.insuranceDetails.policyName} ({doc.insuranceDetails.policyNumber})
                </p>
                <p className="text-[10px] text-gray-400 font-semibold">
                  Valid: {doc.insuranceDetails.startDate} to {doc.insuranceDetails.expiryDate}
                </p>
              </div>
            ) : null}

            {/* Extracted Biomarkers if present */}
            {doc.extractedBiomarkers && doc.extractedBiomarkers.length > 0 ? (
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Extracted Biomarkers:</p>
                {doc.extractedBiomarkers.map((bm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-xl">
                    <span className="font-semibold text-gray-800">{bm.name}</span>
                    <span className={`font-bold ${bm.isAbnormal ? "text-amber-700" : "text-emerald-700"}`}>
                      {bm.value} {bm.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))
        )}
      </div>
    </div>
  );
}
