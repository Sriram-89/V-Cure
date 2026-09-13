export type Language = "en" | "te";

export interface TranslationDictionary {
  appName: string;
  selectLanguageTitle: string;
  selectLanguageSubtitle: string;
  continueToSignup: string;
  english: string;
  telugu: string;
  welcomeBack: string;
  loginSubtitle: string;
  createAccount: string;
  signupSubtitle: string;
  profileTitle: string;
  overviewTab: string;
  medicalEditTab: string;
  healthScoreLabel: string;
  bmiLabel: string;
  conditionsLabel: string;
  familyFriendsTitle: string;
  familyFriendsDesc: string;
  healthVaultTitle: string;
  healthVaultDesc: string;
  todaysMealPlanTitle: string;
  todaysMealPlanSubtitle: string;
  coachTitle: string;
  coachSubtitle: string;
  groceryListTitle: string;
  groceryListSubtitle: string;
  addIngredientsToGrocery: string;
  healthyAlternatives: string;
  selectAlternative: string;
  activeMeal: string;
  changeLanguage: string;
  languageSaved: string;
  type1Warning: string;
  gestationalWarning: string;
  insuranceExpiryNotice: string;
  reportQualityWarning: string;
  noVerifiedTutorial: string;
  confirmFindings: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: "V-Cure",
    selectLanguageTitle: "Select your preferred language",
    selectLanguageSubtitle: "Choose how you would like to experience V-Cure nutrition & health guidance.",
    continueToSignup: "Continue to Signup →",
    english: "English",
    telugu: "తెలుగు (Telugu)",
    welcomeBack: "Welcome back",
    loginSubtitle: "Log in to see today's plan.",
    createAccount: "Create your account",
    signupSubtitle: "Build your health profile in a few minutes.",
    profileTitle: "Profile & Health Hub",
    overviewTab: "Overview & Hub",
    medicalEditTab: "Medical Records & Edit",
    healthScoreLabel: "Health Score",
    bmiLabel: "BMI",
    conditionsLabel: "Conditions",
    familyFriendsTitle: "Family & Friends",
    familyFriendsDesc: "Monitor and support loved ones with explicit permission",
    healthVaultTitle: "Health Vault & Reports",
    healthVaultDesc: "Secure digital medical documents, lab tests & insurance",
    todaysMealPlanTitle: "Today's Meal Plan",
    todaysMealPlanSubtitle: "One primary meal per slot • Select healthy alternatives to swap",
    coachTitle: "V-Cure AI Coach",
    coachSubtitle: "Educational guidance — not a substitute for medical advice",
    groceryListTitle: "Grocery & Shopping List",
    groceryListSubtitle: "Personalized safe ingredients for your meal plan",
    addIngredientsToGrocery: "Add ingredients to grocery list",
    healthyAlternatives: "Healthy alternatives",
    selectAlternative: "Select",
    activeMeal: "ACTIVE MEAL",
    changeLanguage: "Language Preference",
    languageSaved: "Language preference saved.",
    type1Warning: "Type 1 Notice: Guidance supports carb awareness. V-Cure never calculates or modifies insulin doses.",
    gestationalWarning: "Gestational Care: Follow pregnancy meal guidelines and your obstetrician's plan.",
    insuranceExpiryNotice: "Insurance Policy Expiry Reminder",
    reportQualityWarning: "This report is difficult to read clearly. Please retake the photo in good lighting and upload again.",
    noVerifiedTutorial: "No suitable verified tutorial found for this recipe.",
    confirmFindings: "I confirm these extracted lab findings and want to sync them to my Health Profile."
  },
  te: {
    appName: "వి-క్యూర్ (V-Cure)",
    selectLanguageTitle: "మీ భాషను ఎంచుకోండి",
    selectLanguageSubtitle: "మీ పోషణ మరియు ఆరోగ్య మార్గదర్శకత్వం కోసం ఇష్టమైన భాషను ఎంచుకోండి.",
    continueToSignup: "ఖాతా సృష్టించడానికి కొనసాగండి →",
    english: "English",
    telugu: "తెలుగు",
    welcomeBack: "మళ్ళీ స్వాగతం",
    loginSubtitle: "ఈరోజు ఆహార ప్రణాళిక చూడటానికి లాగిన్ అవ్వండి.",
    createAccount: "మీ ఖాతాను సృష్టించండి",
    signupSubtitle: "కొద్ది నిమిషాల్లో మీ ఆరోగ్య ప్రోఫైల్‌ను సిద్ధం చేసుకోండి.",
    profileTitle: "ప్రొఫైల్ & ఆరోగ్య హబ్",
    overviewTab: "అవలోకనం & వివరాలు",
    medicalEditTab: "వైద్య వివరాలు & సవరణ",
    healthScoreLabel: "ఆరోగ్య స్కోర్",
    bmiLabel: "BMI సగటు",
    conditionsLabel: "ఆరోగ్య పరిస్థితులు",
    familyFriendsTitle: "కుటుంబం & స్నేహితులు",
    familyFriendsDesc: "అనుమతితో మీ కుటుంబ సభ్యుల ఆరోగ్యాన్ని పర్యవేక్షించండి",
    healthVaultTitle: "హెల్త్ వాల్ట్ & మెడికల్ రిపోర్టులు",
    healthVaultDesc: "మెడికల్ రిపోర్టులు, ల్యాబ్ పరీక్షలు & ఇన్సూరెన్స్ పత్రాలు",
    todaysMealPlanTitle: "ఈరోజు ఆహార ప్రణాళిక",
    todaysMealPlanSubtitle: "ప్రతి సమయానికి ఒక ముఖ్యమైన ఆహారం • ప్రత్యామ్నాయాలను ఎంచుకోండి",
    coachTitle: "వి-క్యూర్ AI కోచ్",
    coachSubtitle: "విద్యాత్మక మార్గదర్శకత్వం — ఇది డాక్టర్ వైద్య సలహా కాదు",
    groceryListTitle: "కిరాణా & షాపింగ్ జాబితా",
    groceryListSubtitle: "మీ ఆహార ప్రణాళికకు అనుకూలమైన ఆరోగ్యకరమైన దినుసులు",
    addIngredientsToGrocery: "దినుసులను కిరాణా జాబితాకు జోడించండి",
    healthyAlternatives: "ఆరోగ్యకరమైన ప్రత్యామ్నాయాలు",
    selectAlternative: "ఎంచుకోండి",
    activeMeal: "ప్రస్తుత ఆహారం",
    changeLanguage: "భాష ఎంపిక",
    languageSaved: "మీ భాషా ప్రాధాన్యత భద్రపరచబడింది.",
    type1Warning: "టైప్ 1 నోటీసు: కార్బోహైడ్రేట్ అవగాహన కోసం మార్గదర్శకత్వం. ఇన్సులిన్ డోస్ మార్పులు చేయకూడదు.",
    gestationalWarning: "గర్భధారణ సంరక్షణ: గర్భధారణ ఆహార సూత్రాలు మరియు మీ వైద్యుల ప్రణాళికను అనుసరించండి.",
    insuranceExpiryNotice: "ఇన్సూరెన్స్ పాలసీ గడువు ముగింపు గుర్తుచేసే ప్రకటన",
    reportQualityWarning: "ఈ రిపోర్టు స్పష్టంగా చదవడానికి కష్టంగా ఉంది. దయచేసి మంచి వెలుతురులో మళ్ళీ ఫోటో తీసి అప్‌లోడ్ చేయండి.",
    noVerifiedTutorial: "ఈ వంటకానికి తగిన పరిశీలించిన ట్యుటోరియల్ అందుబాటులో లేదు.",
    confirmFindings: "నేను ఈ ల్యాబ్ నివేదిక ఫలితాలను సమీక్షించాను మరియు హెల్త్ ప్రొఫైల్‌కు నవీకరించడాన్ని ధృవీకరిస్తున్నాను."
  }
};
