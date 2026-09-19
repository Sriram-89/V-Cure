export interface DemoPersona {
  id: string;
  email: string;
  passwordHint: string;
  fullName: string;
  shortName: string;
  dateOfBirth: string; // DD-MM-YYYY
  gender: "MALE" | "FEMALE";
  heightCm: number;
  weightKg: number;
  primaryGoal: "WEIGHT_LOSS" | "WEIGHT_GAIN" | "FITNESS" | "HEALTH_MANAGEMENT";
  diabetesCategory: "NON_DIABETIC" | "PREDIABETES" | "TYPE_2_DIABETES";
  healthConditions: string[];
  allergies: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  insurancePolicies: {
    providerName: string;
    policyId: string;
    policyHolder: string;
    startDate: string;
    expiryDate: string;
    coverageSummary: string;
  }[];
  healthReports: {
    id: string;
    title: string;
    date: string;
    type: string;
    summary: string;
    metrics: { name: string; value: string; unit: string; range: string; status: "NORMAL" | "ELEVATED" | "LOW" }[];
  }[];
  healthLogs: {
    date: string;
    systolicBp?: number;
    diastolicBp?: number;
    glucoseMgDl?: number;
    weightKg: number;
    hba1c?: number;
  }[];
  dietaryContext: {
    dietType: "VEGETARIAN" | "NON_VEGETARIAN" | "EGGITARIAN";
    specialNote: string;
  };
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "demo-user-1-sriram",
    email: "sriram_vcure1@gmail.com",
    passwordHint: "Sriram#Vcure2026!",
    fullName: "Sriramreddy Chintaparthi",
    shortName: "Sriram",
    dateOfBirth: "08-12-2005",
    gender: "MALE",
    heightCm: 175,
    weightKg: 82,
    primaryGoal: "WEIGHT_LOSS",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: [],
    allergies: [],
    medications: [],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-SRIRAM-01",
        policyHolder: "Sriramreddy Chintaparthi",
        startDate: "2024-01-10",
        expiryDate: "2027-01-09",
        coverageSummary: "Synthetic Showcase Coverage — ₹5,00,000 Sum Insured (Demo)"
      },
      {
        providerName: "Ditto Health",
        policyId: "DEMO-DITTO-SRIRAM-02",
        policyHolder: "Sriramreddy Chintaparthi",
        startDate: "2024-03-15",
        expiryDate: "2027-03-14",
        coverageSummary: "Synthetic Showcase OPD & Preventive Health Cover (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-sr-1",
        title: "Complete Blood Count (CBC)",
        date: "2026-08-12",
        type: "Blood Test",
        summary: "Normal hemoglobin and WBC count. Safe baseline.",
        metrics: [
          { name: "Hemoglobin", value: "14.8", unit: "g/dL", range: "13.0 - 17.0", status: "NORMAL" },
          { name: "WBC Count", value: "6,800", unit: "/µL", range: "4,000 - 10,000", status: "NORMAL" },
          { name: "Platelets", value: "245,000", unit: "/µL", range: "150,000 - 450,000", status: "NORMAL" }
        ]
      },
      {
        id: "rep-sr-2",
        title: "Lipid Profile & Body Composition",
        date: "2026-08-20",
        type: "Metabolic Profile",
        summary: "Slightly elevated LDL. Calorie deficit and low GI fiber diet recommended.",
        metrics: [
          { name: "Total Cholesterol", value: "192", unit: "mg/dL", range: "< 200", status: "NORMAL" },
          { name: "LDL Cholesterol", value: "128", unit: "mg/dL", range: "< 100", status: "ELEVATED" },
          { name: "Triglycerides", value: "140", unit: "mg/dL", range: "< 150", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 84.0, systolicBp: 118, diastolicBp: 78 },
      { date: "2026-09-08", weightKg: 83.2, systolicBp: 116, diastolicBp: 76 },
      { date: "2026-09-15", weightKg: 82.5, systolicBp: 117, diastolicBp: 77 },
      { date: "2026-09-19", weightKg: 82.0, systolicBp: 115, diastolicBp: 75 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "High protein, low carb calorie-deficit meals for healthy weight loss."
    }
  },
  {
    id: "demo-user-2-medha",
    email: "medha_vcure2@gmail.com",
    passwordHint: "Medha#Vcure2026!",
    fullName: "Medha Sri Varsha Vegi",
    shortName: "Medha",
    dateOfBirth: "26-04-2005",
    gender: "FEMALE",
    heightCm: 162,
    weightKg: 46,
    primaryGoal: "WEIGHT_GAIN",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: ["Migraine", "Low Blood Pressure"],
    allergies: ["Excessive Caffeine"],
    medications: [
      { name: "ORS / Hydration Electrolytes", dosage: "1 Sachet", frequency: "AS_NEEDED" }
    ],
    insurancePolicies: [
      {
        providerName: "Ditto Health",
        policyId: "DEMO-DITTO-MEDHA-01",
        policyHolder: "Medha Sri Varsha Vegi",
        startDate: "2024-05-01",
        expiryDate: "2027-05-01",
        coverageSummary: "Synthetic Showcase Comprehensive Wellness Cover (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-md-1",
        title: "Blood Pressure & Electrolyte Panel",
        date: "2026-08-05",
        type: "Vitals & Electrolytes",
        summary: "Mild postural low blood pressure. Hydration and sodium balance prioritized.",
        metrics: [
          { name: "Systolic BP", value: "98", unit: "mmHg", range: "110 - 120", status: "LOW" },
          { name: "Diastolic BP", value: "62", unit: "mmHg", range: "70 - 80", status: "LOW" },
          { name: "Serum Sodium", value: "136", unit: "mEq/L", range: "135 - 145", status: "NORMAL" }
        ]
      },
      {
        id: "rep-md-2",
        title: "Nutritional & Iron Profile",
        date: "2026-08-18",
        type: "Micronutrient Panel",
        summary: "Mild vitamin D deficiency. Nutrient-dense calorie surge recommended.",
        metrics: [
          { name: "Vitamin D3", value: "18.5", unit: "ng/mL", range: "30.0 - 100.0", status: "LOW" },
          { name: "Serum Ferritin", value: "32", unit: "ng/mL", range: "15 - 150", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 44.8, systolicBp: 96, diastolicBp: 60 },
      { date: "2026-09-08", weightKg: 45.2, systolicBp: 98, diastolicBp: 62 },
      { date: "2026-09-15", weightKg: 45.7, systolicBp: 99, diastolicBp: 63 },
      { date: "2026-09-19", weightKg: 46.0, systolicBp: 100, diastolicBp: 64 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "Migraine-safe, low-sodium-balanced, calorie-dense frequent meals."
    }
  },
  {
    id: "demo-user-3-rajkumar",
    email: "rajkumar_vcure3@gmail.com",
    passwordHint: "Rajkumar#Vcure2026!",
    fullName: "Rajkumar Peketi",
    shortName: "Rajkumar",
    dateOfBirth: "11-05-2004",
    gender: "MALE",
    heightCm: 172,
    weightKg: 52,
    primaryGoal: "WEIGHT_GAIN",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: ["Post-Illness Recovery"],
    allergies: [],
    medications: [],
    insurancePolicies: [
      {
        providerName: "SBI General Health",
        policyId: "DEMO-SBI-RAJKUMAR-01",
        policyHolder: "Rajkumar Peketi",
        startDate: "2024-02-10",
        expiryDate: "2027-02-09",
        coverageSummary: "Synthetic Showcase Recovery & OPD Insurance (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-rk-1",
        title: "Post-Recovery Metabolic Assessment",
        date: "2026-08-10",
        type: "General Health",
        summary: "Pure vegetarian high-protein meals required for digestive recovery.",
        metrics: [
          { name: "Total Protein", value: "6.8", unit: "g/dL", range: "6.0 - 8.3", status: "NORMAL" },
          { name: "Serum Albumin", value: "4.1", unit: "g/dL", range: "3.5 - 5.2", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 50.5 },
      { date: "2026-09-08", weightKg: 51.0 },
      { date: "2026-09-15", weightKg: 51.6 },
      { date: "2026-09-19", weightKg: 52.0 }
    ],
    dietaryContext: {
      dietType: "VEGETARIAN",
      specialNote: "Strictly vegetarian high-protein recovery meals (paneer, lentils, nuts)."
    }
  },
  {
    id: "demo-user-4-abhinaya",
    email: "abhinaya_vcure4@gmail.com",
    passwordHint: "Abhinaya#Vcure2026!",
    fullName: "Satya Abhinaya Bonnam",
    shortName: "Abhinaya",
    dateOfBirth: "29-09-2006",
    gender: "FEMALE",
    heightCm: 165,
    weightKg: 48,
    primaryGoal: "WEIGHT_GAIN",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: [],
    allergies: [],
    medications: [],
    insurancePolicies: [
      {
        providerName: "Star Health",
        policyId: "DEMO-STAR-ABHINAYA-01",
        policyHolder: "Satya Abhinaya Bonnam",
        startDate: "2024-06-12",
        expiryDate: "2027-06-11",
        coverageSummary: "Synthetic Showcase Star Comprehensive Health Shield (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-ab-1",
        title: "Complete Body Mass & Energy Analysis",
        date: "2026-08-14",
        type: "Fitness Baseline",
        summary: "Healthy metabolism. Calorie surplus with balanced macronutrients.",
        metrics: [
          { name: "Hemoglobin", value: "13.2", unit: "g/dL", range: "12.0 - 15.5", status: "NORMAL" },
          { name: "Fasting Blood Sugar", value: "88", unit: "mg/dL", range: "70 - 99", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 46.5 },
      { date: "2026-09-08", weightKg: 47.1 },
      { date: "2026-09-15", weightKg: 47.6 },
      { date: "2026-09-19", weightKg: 48.0 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "Balanced wholesome meals designed for muscle mass and healthy gain."
    }
  },
  {
    id: "demo-user-5-sai",
    email: "sai_vcure5@gmail.com",
    passwordHint: "Sai#Vcure2026!",
    fullName: "Jaya Shanker Sai Kamireddy",
    shortName: "Sai",
    dateOfBirth: "27-01-2006",
    gender: "MALE",
    heightCm: 178,
    weightKg: 74,
    primaryGoal: "FITNESS",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: [],
    allergies: [],
    medications: [],
    insurancePolicies: [
      {
        providerName: "Care Health Insurance",
        policyId: "DEMO-CARE-SAI-01",
        policyHolder: "Jaya Shanker Sai Kamireddy",
        startDate: "2024-04-20",
        expiryDate: "2027-04-19",
        coverageSummary: "Synthetic Showcase Active Athlete Care Shield (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-sai-1",
        title: "Athletic Performance & Lipid Profile",
        date: "2026-08-16",
        type: "Sports Fitness",
        summary: "Optimal cardiovascular parameters. High athletic endurance.",
        metrics: [
          { name: "HDL Cholesterol", value: "58", unit: "mg/dL", range: "> 40", status: "NORMAL" },
          { name: "Resting Heart Rate", value: "62", unit: "bpm", range: "60 - 100", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 73.8, systolicBp: 115, diastolicBp: 75 },
      { date: "2026-09-08", weightKg: 74.0, systolicBp: 116, diastolicBp: 74 },
      { date: "2026-09-15", weightKg: 74.1, systolicBp: 114, diastolicBp: 75 },
      { date: "2026-09-19", weightKg: 74.0, systolicBp: 115, diastolicBp: 74 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "High-protein athletic meals for peak performance and recovery."
    }
  },
  {
    id: "demo-user-6-lalitha",
    email: "lalitha_vcure6@gmail.com",
    passwordHint: "Lalitha#Vcure2026!",
    fullName: "Lalitha Raja Rajeshwari Bethireddy",
    shortName: "Lalitha",
    dateOfBirth: "26-04-2006",
    gender: "FEMALE",
    heightCm: 160,
    weightKg: 68,
    primaryGoal: "WEIGHT_LOSS",
    diabetesCategory: "PREDIABETES",
    healthConditions: ["High Blood Pressure", "PCOD"],
    allergies: [],
    medications: [
      { name: "Myo-Inositol Supplement", dosage: "2g", frequency: "DAILY" }
    ],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-LALITHA-01",
        policyHolder: "Lalitha Raja Rajeshwari Bethireddy",
        startDate: "2024-03-01",
        expiryDate: "2027-03-01",
        coverageSummary: "Synthetic Showcase LIC Women's Wellness Cover (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-lal-1",
        title: "PCOD & Hormonal Health Summary",
        date: "2026-08-08",
        type: "Endocrine Profile",
        summary: "Mild insulin resistance and elevated blood pressure. Low GI DASH diet recommended.",
        metrics: [
          { name: "Systolic BP", value: "138", unit: "mmHg", range: "< 120", status: "ELEVATED" },
          { name: "Diastolic BP", value: "88", unit: "mmHg", range: "< 80", status: "ELEVATED" },
          { name: "HbA1c", value: "5.9", unit: "%", range: "< 5.7", status: "ELEVATED" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 70.2, systolicBp: 140, diastolicBp: 90, hba1c: 6.0 },
      { date: "2026-09-08", weightKg: 69.4, systolicBp: 136, diastolicBp: 86 },
      { date: "2026-09-15", weightKg: 68.6, systolicBp: 134, diastolicBp: 85 },
      { date: "2026-09-19", weightKg: 68.0, systolicBp: 132, diastolicBp: 84, hba1c: 5.9 }
    ],
    dietaryContext: {
      dietType: "VEGETARIAN",
      specialNote: "DASH-compliant, low-GI, anti-inflammatory meals tailored for PCOD & BP."
    }
  },
  {
    id: "demo-user-7-shannu",
    email: "shannu_vcure7@gmail.com",
    passwordHint: "Shannu#Vcure2026!",
    fullName: "Shanmukh I",
    shortName: "Shannu",
    dateOfBirth: "20-04-2004",
    gender: "MALE",
    heightCm: 176,
    weightKg: 71,
    primaryGoal: "FITNESS",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: [],
    allergies: [],
    medications: [],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-SHANNU-01",
        policyHolder: "Shanmukh I",
        startDate: "2024-01-15",
        expiryDate: "2027-01-14",
        coverageSummary: "Synthetic Showcase Young Adult Fitness Plan (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-sh-1",
        title: "General Fitness & Health Screen",
        date: "2026-08-11",
        type: "Routine Checkup",
        summary: "Excellent health metrics. High energy and metabolic baseline.",
        metrics: [
          { name: "Fasting Glucose", value: "85", unit: "mg/dL", range: "70 - 99", status: "NORMAL" },
          { name: "BMR Estimation", value: "1,750", unit: "kcal", range: "1,600 - 1,900", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 71.0, systolicBp: 118, diastolicBp: 76 },
      { date: "2026-09-08", weightKg: 71.2, systolicBp: 117, diastolicBp: 75 },
      { date: "2026-09-15", weightKg: 71.0, systolicBp: 118, diastolicBp: 76 },
      { date: "2026-09-19", weightKg: 71.0, systolicBp: 117, diastolicBp: 75 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "Balanced, high-energy lean protein meals for daily conditioning."
    }
  },
  {
    id: "demo-user-8-pavani",
    email: "pavani_vcure8@gmail.com",
    passwordHint: "Pavani#Vcure2026!",
    fullName: "Pavani Mirthipati",
    shortName: "Pavani",
    dateOfBirth: "23-06-2003",
    gender: "FEMALE",
    heightCm: 158,
    weightKg: 45,
    primaryGoal: "WEIGHT_GAIN",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: ["PCOD", "Low Energy / Weakness"],
    allergies: [],
    medications: [
      { name: "Multivitamin & Iron Complex", dosage: "1 Tablet", frequency: "DAILY" }
    ],
    insurancePolicies: [
      {
        providerName: "Ditto Health",
        policyId: "DEMO-DITTO-PAVANI-01",
        policyHolder: "Pavani Mirthipati",
        startDate: "2024-07-01",
        expiryDate: "2027-06-30",
        coverageSummary: "Synthetic Showcase Essential Care & Nutrition Shield (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-pav-1",
        title: "Hemoglobin & Thyroid Profile",
        date: "2026-08-03",
        type: "Hormonal & Blood Check",
        summary: "Mild anemia causing tiredness. Iron-rich calorie-boosting meals needed.",
        metrics: [
          { name: "Hemoglobin", value: "10.8", unit: "g/dL", range: "12.0 - 15.5", status: "LOW" },
          { name: "TSH (Thyroid)", value: "2.4", unit: "µIU/mL", range: "0.4 - 4.2", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 43.8 },
      { date: "2026-09-08", weightKg: 44.3 },
      { date: "2026-09-15", weightKg: 44.8 },
      { date: "2026-09-19", weightKg: 45.0 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "Iron-rich, easy-to-digest, nutrient-dense meals for strength & PCOD."
    }
  },
  {
    id: "demo-user-9-nageswarao",
    email: "nageswarao_vcure9@gmail.com",
    passwordHint: "Nageswarao#Vcure2026!",
    fullName: "Nageshwarao Akumarthi",
    shortName: "Nageswarao",
    dateOfBirth: "12-12-1967",
    gender: "MALE",
    heightCm: 170,
    weightKg: 75,
    primaryGoal: "HEALTH_MANAGEMENT",
    diabetesCategory: "NON_DIABETIC",
    healthConditions: ["High Blood Pressure"],
    allergies: [],
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "DAILY_MORNING" }
    ],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-NAGESWARAO-01",
        policyHolder: "Nageshwarao Akumarthi",
        startDate: "2023-01-01",
        expiryDate: "2027-01-01",
        coverageSummary: "Synthetic Showcase Senior Health Shield (Demo)"
      },
      {
        providerName: "Ditto Health",
        policyId: "DEMO-DITTO-NAGESWARAO-02",
        policyHolder: "Nageshwarao Akumarthi",
        startDate: "2024-02-15",
        expiryDate: "2027-02-14",
        coverageSummary: "Synthetic Showcase Hypertension OPD Support (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-nag-1",
        title: "Cardiovascular & BP Evaluation",
        date: "2026-08-01",
        type: "Cardiac Screening",
        summary: "Hypertension under control. Low-sodium, light evening meals strongly recommended.",
        metrics: [
          { name: "Systolic BP", value: "135", unit: "mmHg", range: "< 120", status: "ELEVATED" },
          { name: "Diastolic BP", value: "85", unit: "mmHg", range: "< 80", status: "ELEVATED" },
          { name: "Serum Creatinine", value: "0.95", unit: "mg/dL", range: "0.7 - 1.3", status: "NORMAL" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 76.0, systolicBp: 138, diastolicBp: 88 },
      { date: "2026-09-08", weightKg: 75.6, systolicBp: 135, diastolicBp: 86 },
      { date: "2026-09-15", weightKg: 75.2, systolicBp: 133, diastolicBp: 84 },
      { date: "2026-09-19", weightKg: 75.0, systolicBp: 132, diastolicBp: 83 }
    ],
    dietaryContext: {
      dietType: "VEGETARIAN",
      specialNote: "Low-sodium, heart-healthy DASH meals with light digested dinners."
    }
  },
  {
    id: "demo-user-10-rambabu",
    email: "rambabu_vcure10@gmail.com",
    passwordHint: "Rambabu#Vcure2026!",
    fullName: "Rambabu Akumarthi",
    shortName: "Rambabu",
    dateOfBirth: "15-07-1969",
    gender: "MALE",
    heightCm: 172,
    weightKg: 78,
    primaryGoal: "HEALTH_MANAGEMENT",
    diabetesCategory: "TYPE_2_DIABETES",
    healthConditions: ["Type 2 Diabetes", "High Blood Pressure"],
    allergies: [],
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "TWICE_DAILY" },
      { name: "Telmisartan", dosage: "40mg", frequency: "DAILY_MORNING" }
    ],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-RAMBABU-01",
        policyHolder: "Rambabu Akumarthi",
        startDate: "2022-05-10",
        expiryDate: "2027-05-09",
        coverageSummary: "Synthetic Showcase Senior Chronic Illness Cover (Demo)"
      },
      {
        providerName: "Ditto Health",
        policyId: "DEMO-DITTO-RAMBABU-02",
        policyHolder: "Rambabu Akumarthi",
        startDate: "2023-08-01",
        expiryDate: "2027-07-31",
        coverageSummary: "Synthetic Showcase OPD Diabetes & BP Care (Demo)"
      },
      {
        providerName: "ONGC Employee Health Insurance",
        policyId: "DEMO-ONGC-RAMBABU-03",
        policyHolder: "Rambabu Akumarthi",
        startDate: "2020-01-01",
        expiryDate: "2029-12-31",
        coverageSummary: "Synthetic Showcase Corporate Employee Health Benefits (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-ram-1",
        title: "Glycemic & Renal Screening (HbA1c)",
        date: "2026-07-28",
        type: "Diabetic Profile",
        summary: "HbA1c 7.6%. High-fiber, very low-GI meals with sodium control required.",
        metrics: [
          { name: "HbA1c", value: "7.6", unit: "%", range: "< 5.7", status: "ELEVATED" },
          { name: "Fasting Blood Sugar", value: "142", unit: "mg/dL", range: "70 - 99", status: "ELEVATED" },
          { name: "Postprandial Glucose", value: "195", unit: "mg/dL", range: "< 140", status: "ELEVATED" },
          { name: "Systolic BP", value: "142", unit: "mmHg", range: "< 120", status: "ELEVATED" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 79.5, systolicBp: 145, diastolicBp: 92, glucoseMgDl: 155, hba1c: 7.8 },
      { date: "2026-09-08", weightKg: 79.0, systolicBp: 142, diastolicBp: 89, glucoseMgDl: 148 },
      { date: "2026-09-15", weightKg: 78.4, systolicBp: 139, diastolicBp: 86, glucoseMgDl: 140 },
      { date: "2026-09-19", weightKg: 78.0, systolicBp: 138, diastolicBp: 85, glucoseMgDl: 136, hba1c: 7.6 }
    ],
    dietaryContext: {
      dietType: "NON_VEGETARIAN",
      specialNote: "High-fiber low-GI meals with zero added sugar and controlled sodium."
    }
  },
  {
    id: "demo-user-11-venkata",
    email: "venkata_vcure11@gmail.com",
    passwordHint: "Venkata#Vcure2026!",
    fullName: "Venkatalakshmi Kondepudi",
    shortName: "Venkata Lakshmi",
    dateOfBirth: "18-11-1968",
    gender: "FEMALE",
    heightCm: 161,
    weightKg: 66,
    primaryGoal: "HEALTH_MANAGEMENT",
    diabetesCategory: "PREDIABETES",
    healthConditions: ["High Blood Pressure", "Mild Headache"],
    allergies: [],
    medications: [
      { name: "Metformin", dosage: "250mg", frequency: "DAILY" },
      { name: "Telmisartan", dosage: "20mg", frequency: "DAILY_MORNING" }
    ],
    insurancePolicies: [
      {
        providerName: "LIC Health",
        policyId: "DEMO-LIC-VENKATA-01",
        policyHolder: "Venkatalakshmi Kondepudi",
        startDate: "2023-03-15",
        expiryDate: "2027-03-14",
        coverageSummary: "Synthetic Showcase LIC Family Health Shield (Demo)"
      },
      {
        providerName: "Plum Health Insurance",
        policyId: "DEMO-PLUM-VENKATA-02",
        policyHolder: "Venkatalakshmi Kondepudi",
        startDate: "2024-01-01",
        expiryDate: "2027-01-01",
        coverageSummary: "Synthetic Showcase Corporate Wellness Cover (Demo)"
      },
      {
        providerName: "Star Health Insurance",
        policyId: "DEMO-STAR-VENKATA-03",
        policyHolder: "Venkatalakshmi Kondepudi",
        startDate: "2023-11-20",
        expiryDate: "2026-11-19",
        coverageSummary: "Synthetic Showcase Senior Care Super Surplus (Demo)"
      }
    ],
    healthReports: [
      {
        id: "rep-ven-1",
        title: "Metabolic & Blood Glucose Evaluation",
        date: "2026-08-07",
        type: "Comprehensive Screen",
        summary: "Prediabetes and borderline hypertension. Low-sodium balanced vegetarian plan.",
        metrics: [
          { name: "HbA1c", value: "6.2", unit: "%", range: "< 5.7", status: "ELEVATED" },
          { name: "Fasting Glucose", value: "112", unit: "mg/dL", range: "70 - 99", status: "ELEVATED" },
          { name: "Systolic BP", value: "134", unit: "mmHg", range: "< 120", status: "ELEVATED" }
        ]
      }
    ],
    healthLogs: [
      { date: "2026-09-01", weightKg: 67.2, systolicBp: 138, diastolicBp: 86, glucoseMgDl: 118, hba1c: 6.3 },
      { date: "2026-09-08", weightKg: 66.8, systolicBp: 135, diastolicBp: 84, glucoseMgDl: 114 },
      { date: "2026-09-15", weightKg: 66.3, systolicBp: 132, diastolicBp: 82, glucoseMgDl: 110 },
      { date: "2026-09-19", weightKg: 66.0, systolicBp: 130, diastolicBp: 80, glucoseMgDl: 108, hba1c: 6.2 }
    ],
    dietaryContext: {
      dietType: "VEGETARIAN",
      specialNote: "Balanced vegetarian low-sodium, low-GI meals for BP & glucose control."
    }
  }
];

export function findDemoPersonaByEmail(email?: string | null): DemoPersona | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  return DEMO_PERSONAS.find((p) => p.email.toLowerCase() === clean);
}

export function findDemoPersonaById(userId?: string | null): DemoPersona | undefined {
  if (!userId) return undefined;
  return DEMO_PERSONAS.find((p) => p.id === userId);
}
