import type { FamilyMember } from "@/store/family-store";

export interface NonDiagnosticObservation {
  id: string;
  type: "GLUCOSE_TREND" | "RECURRENT_FEVER" | "BP_TREND" | "HYDRATION";
  title: string;
  message: string;
  severity: "INFO" | "ADVISORY";
  suggestDoctorVisit: boolean;
}

/**
 * Evaluates recorded health data for a family member and generates non-diagnostic observation notices.
 * Never diagnoses diseases or prescribes/modifies medication doses.
 */
export function evaluateMemberObservations(member: FamilyMember): NonDiagnosticObservation[] {
  const observations: NonDiagnosticObservation[] = [];
  const data = member.healthData;

  if (!data || member.status !== "CONNECTED") return observations;

  // 1. Unimproved HbA1c / Glucose trend despite diet adherence
  if (data.dietComplianceMonths && data.dietComplianceMonths >= 2 && data.hba1cTrendImproved === false) {
    observations.push({
      id: `obs-glycemic-${member.id}`,
      type: "GLUCOSE_TREND",
      title: "Glycemic Measurement Observation",
      message: `${member.name}'s recent health measurements have not shown the expected improvement after ${data.dietComplianceMonths} months of diet management. Consider discussing these results with their physician.`,
      severity: "ADVISORY",
      suggestDoctorVisit: true
    });
  }

  // 2. Recurrent Fever observation
  if (data.feverRecordedDaysAgo !== undefined && data.feverRecordedDaysAgo <= 7) {
    observations.push({
      id: `obs-fever-${member.id}`,
      type: "RECURRENT_FEVER",
      title: "Recurrent Fever Logged",
      message: `Fever has been recorded again for ${member.name}. Consider contacting a healthcare professional. Depending on symptoms, they may recommend an appropriate examination or investigation.`,
      severity: "ADVISORY",
      suggestDoctorVisit: true
    });
  }

  // 3. Blood Pressure Observation
  if (data.systolicBP && data.systolicBP >= 140) {
    observations.push({
      id: `obs-bp-${member.id}`,
      type: "BP_TREND",
      title: "Elevated BP Reading Observed",
      message: `Recent blood pressure readings for ${member.name} are elevated (${data.systolicBP}/${data.diastolicBP} mmHg). Share these recorded readings with their care doctor at your next appointment.`,
      severity: "INFO",
      suggestDoctorVisit: true
    });
  }

  return observations;
}
