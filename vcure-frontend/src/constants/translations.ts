export type Language = "en" | "te" | "ta" | "hi" | "kn" | "ml" | "mr" | "bn";

export interface TranslationDictionary {
  appName: string;
  selectLanguageTitle: string;
  selectLanguageSubtitle: string;
  continueToSignup: string;
  english: string;
  telugu: string;
  tamil: string;
  hindi: string;
  kannada: string;
  malayalam: string;
  marathi: string;
  bengali: string;
  
  // Auth
  welcomeBack: string;
  loginSubtitle: string;
  createAccount: string;
  signupSubtitle: string;
  continueWithGoogle: string;
  orSignInWithEmail: string;
  orSignUpWithEmail: string;
  emailLabel: string;
  passwordLabel: string;
  fullNameLabel: string;
  forgotPassword: string;
  signInButton: string;
  signUpButton: string;
  newHere: string;
  alreadyHaveAccount: string;
  logoutButton: string;
  
  // Navigation
  navDashboard: string;
  navMeals: string;
  navCoach: string;
  navProgress: string;
  navProfile: string;
  navVault: string;
  navShopping: string;
  navEducation: string;
  navSettings: string;
  navAdmin: string;
  
  // Onboarding
  onboardingTitle: string;
  onboardingSubtitle: string;
  stepPersonalInfo: string;
  stepDiabetesCategory: string;
  stepGlucoseLabs: string;
  stepLifestyle: string;
  stepFoodPreferences: string;
  stepAllergies: string;
  stepConditionsMedications: string;
  stepReportUpload: string;
  
  ageLabel: string;
  genderLabel: string;
  heightLabel: string;
  weightLabel: string;
  diabetesType1: string;
  diabetesType2: string;
  diabetesGestational: string;
  diabetesPrediabetes: string;
  diabetesNone: string;
  fastingGlucose: string;
  hba1cLabel: string;
  postPrandialGlucose: string;
  
  activityLevel: string;
  sedentary: string;
  moderate: string;
  active: string;
  sleepHours: string;
  stressLevel: string;
  
  vegetarian: string;
  nonVegetarian: string;
  eggetarian: string;
  vegan: string;
  jain: string;
  
  allergiesLabel: string;
  conditionsLabel: string;
  medicationsLabel: string;
  ocrReviewTitle: string;
  ocrReviewSubtitle: string;
  confirmFindings: string;
  
  // Dashboard & Metrics
  healthScoreLabel: string;
  healthScoreSubtitle: string;
  bmiLabel: string;
  waterLabel: string;
  caloriesLabel: string;
  macrosLabel: string;
  carbsLabel: string;
  proteinLabel: string;
  fatLabel: string;
  quickActionsTitle: string;
  actionLogWater: string;
  actionLogMeal: string;
  actionUploadReport: string;
  actionAskCoach: string;
  todaysMealPlanTitle: string;
  todaysMealPlanSubtitle: string;
  activeMeal: string;
  
  // Meals & Alternatives
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  healthyAlternatives: string;
  selectAlternative: string;
  mealDetailTitle: string;
  ingredientsTitle: string;
  instructionsTitle: string;
  prepTime: string;
  cookTime: string;
  addIngredientsToGrocery: string;
  videoTutorial: string;
  noVerifiedTutorial: string;
  
  // Coach
  coachTitle: string;
  coachSubtitle: string;
  askCoachPlaceholder: string;
  sendButton: string;
  disclaimerNotice: string;
  type1Warning: string;
  gestationalWarning: string;
  
  // Progress & Analytics
  progressTitle: string;
  progressSubtitle: string;
  scoreHistory: string;
  weightTrends: string;
  glucoseTrends: string;
  adherenceRate: string;
  
  // Profile & Vault
  profileTitle: string;
  overviewTab: string;
  medicalEditTab: string;
  personalHealth: string;
  healthVaultTitle: string;
  healthVaultDesc: string;
  medicalReports: string;
  uploadNewReport: string;
  insurancePolicy: string;
  insuranceExpiryNotice: string;
  familyFriendsTitle: string;
  familyFriendsDesc: string;
  connectedPeople: string;
  addDelegate: string;
  
  // Shopping & Education
  groceryListTitle: string;
  groceryListSubtitle: string;
  educationTitle: string;
  educationSubtitle: string;
  healthArticles: string;
  videoGuides: string;
  
  // UI & Messages
  saveChanges: string;
  cancel: string;
  edit: string;
  delete: string;
  confirm: string;
  loading: string;
  success: string;
  error: string;
  back: string;
  next: string;
  changeLanguage: string;
  languageSaved: string;
  reportQualityWarning: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: "V-Cure",
    selectLanguageTitle: "Select your preferred language",
    selectLanguageSubtitle: "Choose how you would like to experience V-Cure nutrition & health guidance.",
    continueToSignup: "Continue to Signup →",
    english: "English",
    telugu: "తెలుగు (Telugu)",
    tamil: "தமிழ் (Tamil)",
    hindi: "हिन्दी (Hindi)",
    kannada: "ಕನ್ನಡ (Kannada)",
    malayalam: "മലയാളം (Malayalam)",
    marathi: "मराठी (Marathi)",
    bengali: "বাংলা (Bengali)",
    
    welcomeBack: "Welcome back",
    loginSubtitle: "Log in to see today's plan.",
    createAccount: "Create your account",
    signupSubtitle: "Build your health profile in a few minutes.",
    continueWithGoogle: "Continue with Google",
    orSignInWithEmail: "Or sign in with email",
    orSignUpWithEmail: "Or sign up with email",
    emailLabel: "EMAIL",
    passwordLabel: "PASSWORD",
    fullNameLabel: "FULL NAME",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    signUpButton: "Create Account",
    newHere: "New here? Create an account",
    alreadyHaveAccount: "Already have an account? Sign in",
    logoutButton: "Logout",
    
    navDashboard: "Dashboard",
    navMeals: "Meals & Swaps",
    navCoach: "AI Coach",
    navProgress: "Progress",
    navProfile: "Profile & Hub",
    navVault: "Health Vault",
    navShopping: "Shopping List",
    navEducation: "Education",
    navSettings: "Settings",
    navAdmin: "Admin",
    
    onboardingTitle: "Personalized Setup",
    onboardingSubtitle: "Tell us about your health baseline to customize your meal recommendations.",
    stepPersonalInfo: "Personal Information",
    stepDiabetesCategory: "Diabetes Category",
    stepGlucoseLabs: "Glucose & Lab Values",
    stepLifestyle: "Lifestyle & Sleep",
    stepFoodPreferences: "Food Preferences",
    stepAllergies: "Allergies & Intolerances",
    stepConditionsMedications: "Conditions & Medications",
    stepReportUpload: "Medical Report Upload",
    
    ageLabel: "Age",
    genderLabel: "Gender",
    heightLabel: "Height (cm)",
    weightLabel: "Weight (kg)",
    diabetesType1: "Type 1 Diabetes",
    diabetesType2: "Type 2 Diabetes",
    diabetesGestational: "Gestational Diabetes",
    diabetesPrediabetes: "Pre-Diabetes",
    diabetesNone: "No Diabetes (Preventive)",
    fastingGlucose: "Fasting Blood Glucose (mg/dL)",
    hba1cLabel: "HbA1c (%)",
    postPrandialGlucose: "Post-Prandial Glucose (mg/dL)",
    
    activityLevel: "Activity Level",
    sedentary: "Sedentary",
    moderate: "Moderate Activity",
    active: "Highly Active",
    sleepHours: "Sleep Duration (Hours)",
    stressLevel: "Stress Level",
    
    vegetarian: "Vegetarian",
    nonVegetarian: "Non-Vegetarian",
    eggetarian: "Eggetarian",
    vegan: "Vegan",
    jain: "Jain",
    
    allergiesLabel: "Allergies",
    conditionsLabel: "Medical Conditions",
    medicationsLabel: "Current Medications",
    ocrReviewTitle: "Extracted Lab Findings",
    ocrReviewSubtitle: "Please review findings extracted from your medical report.",
    confirmFindings: "I confirm these extracted lab findings and want to sync them to my Health Profile.",
    
    healthScoreLabel: "Health Score",
    healthScoreSubtitle: "Based on lab values, adherence, and lifestyle",
    bmiLabel: "BMI Index",
    waterLabel: "Water Intake",
    caloriesLabel: "Daily Calories",
    macrosLabel: "Macronutrient Distribution",
    carbsLabel: "Carbohydrates",
    proteinLabel: "Protein",
    fatLabel: "Fats",
    quickActionsTitle: "Quick Actions",
    actionLogWater: "Log Water",
    actionLogMeal: "Log Meal",
    actionUploadReport: "Upload Report",
    actionAskCoach: "Ask AI Coach",
    todaysMealPlanTitle: "Today's Meal Plan",
    todaysMealPlanSubtitle: "One primary meal per slot • Select healthy alternatives to swap",
    activeMeal: "ACTIVE MEAL",
    
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",
    healthyAlternatives: "Healthy Alternatives",
    selectAlternative: "Swap This Meal",
    mealDetailTitle: "Meal Overview & Nutrition",
    ingredientsTitle: "Ingredients",
    instructionsTitle: "Preparation Steps",
    prepTime: "Prep Time",
    cookTime: "Cook Time",
    addIngredientsToGrocery: "Add ingredients to grocery list",
    videoTutorial: "Recipe Tutorial Video",
    noVerifiedTutorial: "No suitable verified tutorial found for this recipe.",
    
    coachTitle: "V-Cure AI Health Coach",
    coachSubtitle: "Educational guidance — not a substitute for medical advice",
    askCoachPlaceholder: "Ask about your meals, glucose levels, or nutrition...",
    sendButton: "Send",
    disclaimerNotice: "Clinical Disclaimer: V-Cure AI provides dietary education based on clinical guidelines.",
    type1Warning: "Type 1 Notice: Guidance supports carb awareness. V-Cure never calculates or modifies insulin doses.",
    gestationalWarning: "Gestational Care: Follow pregnancy meal guidelines and your obstetrician's plan.",
    
    progressTitle: "Health Progress & Analytics",
    progressSubtitle: "Track your health score, glucose trends, and dietary compliance.",
    scoreHistory: "Health Score History",
    weightTrends: "Weight Trajectory",
    glucoseTrends: "Blood Glucose Trends",
    adherenceRate: "Dietary Adherence Rate",
    
    profileTitle: "Profile & Health Hub",
    overviewTab: "Overview & Hub",
    medicalEditTab: "Medical Records & Edit",
    personalHealth: "Personal Health Details",
    healthVaultTitle: "Health Vault & Reports",
    healthVaultDesc: "Secure digital medical documents, lab tests & insurance",
    medicalReports: "Medical Reports",
    uploadNewReport: "Upload New Report",
    insurancePolicy: "Health Insurance Details",
    insuranceExpiryNotice: "Insurance Policy Expiry Reminder",
    familyFriendsTitle: "Family & Friends",
    familyFriendsDesc: "Monitor and support loved ones with explicit permission",
    connectedPeople: "Connected Family Members",
    addDelegate: "Add Family Member / Caregiver",
    
    groceryListTitle: "Grocery & Shopping List",
    groceryListSubtitle: "Personalized safe ingredients for your meal plan",
    educationTitle: "Health Education Hub",
    educationSubtitle: "Evidence-based nutrition guides, glycemic index tips, and articles.",
    healthArticles: "Health Articles",
    videoGuides: "Video Guides",
    
    saveChanges: "Save Changes",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading...",
    success: "Saved successfully",
    error: "An error occurred",
    back: "Back",
    next: "Next",
    changeLanguage: "Language Preference",
    languageSaved: "Language preference saved.",
    reportQualityWarning: "This report is difficult to read clearly. Please retake the photo in good lighting and upload again."
  },
  te: {
    appName: "వి-క్యూర్ (V-Cure)",
    selectLanguageTitle: "మీ భాషను ఎంచుకోండి",
    selectLanguageSubtitle: "మీ పోషణ మరియు ఆరోగ్య మార్గదర్శకత్వం కోసం ఇష్టమైన భాషను ఎంచుకోండి.",
    continueToSignup: "ఖాతా సృష్టించడానికి కొనసాగండి →",
    english: "English",
    telugu: "తెలుగు",
    tamil: "తమిళం (Tamil)",
    hindi: "హిందీ (Hindi)",
    kannada: "కన్నడ (Kannada)",
    malayalam: "మలయాళం (Malayalam)",
    marathi: "మరాఠీ (Marathi)",
    bengali: "బెంగాలీ (Bengali)",
    
    welcomeBack: "మళ్ళీ స్వాగతం",
    loginSubtitle: "ఈరోజు ఆహార ప్రణాళిక చూడటానికి లాగిన్ అవ్వండి.",
    createAccount: "మీ ఖాతాను సృష్టించండి",
    signupSubtitle: "కొద్ది నిమిషాల్లో మీ ఆరోగ్య ప్రోఫైల్‌ను సిద్ధం చేసుకోండి.",
    continueWithGoogle: "గూగుల్ తో లాగిన్ అవ్వండి",
    orSignInWithEmail: "లేదా ఈమెయిల్ తో లాగిన్ అవ్వండి",
    orSignUpWithEmail: "లేదా ఈమెయిల్ తో ఖాతా తెరవండి",
    emailLabel: "ఈమెయిల్ (EMAIL)",
    passwordLabel: "పాస్‌వర్డ్ (PASSWORD)",
    fullNameLabel: "పూర్తి పేరు (FULL NAME)",
    forgotPassword: "పాస్‌వర్డ్ మరిచిపోయారా?",
    signInButton: "లాగిన్ అవ్వండి",
    signUpButton: "ఖాతా సృష్టించండి",
    newHere: "కొత్త వారా? ఖాతాను సృష్టించండి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి",
    logoutButton: "లాగౌట్ (Logout)",
    
    navDashboard: "డాష్‌బోర్డ్ (Dashboard)",
    navMeals: "ఆహారం & మార్పులు (Meals)",
    navCoach: "AI హెల్త్ కోచ్",
    navProgress: "పురోగతి (Progress)",
    navProfile: "ప్రొఫైల్ & హబ్",
    navVault: "హెల్త్ వాల్ట్ (Vault)",
    navShopping: "కిరాణా జాబితా",
    navEducation: "ఆరోగ్య విద్య (Education)",
    navSettings: "సెట్టింగ్‌లు (Settings)",
    navAdmin: "అడ్మిన్ (Admin)",
    
    onboardingTitle: "వ్యక్తిగత ఆరోగ్య అమరిక",
    onboardingSubtitle: "మీ ఆహార పద్ధతులను సరిచేయడానికి మీ ఆరోగ్య వివరాలను నమోదు చేయండి.",
    stepPersonalInfo: "వ్యక్తిగత సమాచారం",
    stepDiabetesCategory: "డయాబెటిస్ రకం",
    stepGlucoseLabs: "గ్లూకోజ్ & ల్యాబ్ విలువలు",
    stepLifestyle: "జీవనశైలి & నిద్ర",
    stepFoodPreferences: "ఆహార ప్రాధాన్యతలు",
    stepAllergies: "అలెర్జీలు & ఇబ్బందులు",
    stepConditionsMedications: "ఆరోగ్య సమస్యలు & మందులు",
    stepReportUpload: "మెడికల్ రిపోర్ట్ అప్‌లోడ్",
    
    ageLabel: "వయస్సు",
    genderLabel: "లింగం",
    heightLabel: "ఎత్తు (సెం.మీ)",
    weightLabel: "బరువు (కిలోలు)",
    diabetesType1: "టైప్ 1 డయాబెటిస్",
    diabetesType2: "టైప్ 2 డయాబెటిస్",
    diabetesGestational: "గర్భధారణ డయాబెటిస్",
    diabetesPrediabetes: "ప్రీ-డయాబెటిస్",
    diabetesNone: "డయాబెటిస్ లేదు (ముందస్తు జాగ్రత్త)",
    fastingGlucose: "ఖాళీ కడుపు గ్లూకోజ్ (Fasting mg/dL)",
    hba1cLabel: "HbA1c శాతం (%)",
    postPrandialGlucose: "భోజనం తర్వాత గ్లూకోజ్ (Post-Prandial mg/dL)",
    
    activityLevel: "శారీరక శ్రమ స్థాయి",
    sedentary: "తక్కువ శ్రమ (Sedentary)",
    moderate: "మధ్యస్థ శ్రమ (Moderate)",
    active: "అధిక శ్రమ (Active)",
    sleepHours: "నిద్ర సమయం (గంటలు)",
    stressLevel: "మానసిక ఒత్తిడి స్థాయి",
    
    vegetarian: "శాకాహారం (Vegetarian)",
    nonVegetarian: "మాంసాహారం (Non-Veg)",
    eggetarian: "కోడిగుడ్లు తినేవారు (Eggetarian)",
    vegan: "సంపూర్ణ శాకాహారం (Vegan)",
    jain: "జైన్ ఆహారం (Jain)",
    
    allergiesLabel: "అలెర్జీలు",
    conditionsLabel: "వైద్య సమస్యలు",
    medicationsLabel: "ప్రస్తుతం వాడుతున్న మందులు",
    ocrReviewTitle: "ల్యాబ్ రిపోర్టు ఫలితాలు",
    ocrReviewSubtitle: "మీ రిపోర్టు నుండి సేకరించిన వివరాలను సమీక్షించండి.",
    confirmFindings: "నేను ఈ ల్యాబ్ నివేదిక ఫలితాలను సమీక్షించాను మరియు హెల్త్ ప్రొఫైల్‌కు నవీకరించడాన్ని ధృవీకరిస్తున్నాను.",
    
    healthScoreLabel: "ఆరోగ్య స్కోర్",
    healthScoreSubtitle: "మీ ల్యాబ్ వివరాలు మరియు ఆహార నియమాల ఆధారంగా",
    bmiLabel: "BMI సూచిక",
    waterLabel: "నీటి వినియోగం",
    caloriesLabel: "రోజువారీ క్యాలరీలు",
    macrosLabel: "పోషకాల పంపిణీ",
    carbsLabel: "పిండి పదార్థాలు (Carbs)",
    proteinLabel: "మాంసకృత్తులు (Protein)",
    fatLabel: "కొవ్వులు (Fats)",
    quickActionsTitle: "త్వరిత చర్యలు",
    actionLogWater: "నీరు నమోదు",
    actionLogMeal: "ఆహారం నమోదు",
    actionUploadReport: "రిపోర్ట్ అప్‌లోడ్",
    actionAskCoach: "AI కోచ్‌ని అడగండి",
    todaysMealPlanTitle: "ఈరోజు ఆహార ప్రణాళిక",
    todaysMealPlanSubtitle: "ప్రతి సమయానికి ఒక ముఖ్యమైన ఆహారం • ప్రత్యామ్నాయాలను ఎంచుకోండి",
    activeMeal: "ప్రస్తుత ఆహారం",
    
    breakfast: "ఉదయం అల్పాహారం (Breakfast)",
    lunch: "మధ్యాహ్న భోజనం (Lunch)",
    snack: "సాయంత్రం తిండి (Snack)",
    dinner: "రాత్రి భోజనం (Dinner)",
    healthyAlternatives: "ఆరోగ్యకరమైన ప్రత్యామ్నాయాలు",
    selectAlternative: "ఈ ఆహారాన్ని మార్చండి",
    mealDetailTitle: "ఆహార వివరాలు & పోషకాలు",
    ingredientsTitle: "కావలసిన దినుసులు",
    instructionsTitle: "తయారీ విధానం",
    prepTime: "సిద్ధం చేసే సమయం",
    cookTime: "వండు సమయం",
    addIngredientsToGrocery: "దినుసులను కిరాణా జాబితాకు జోడించండి",
    videoTutorial: "వంటకం వీడియో ట్యుటోరియల్",
    noVerifiedTutorial: "ఈ వంటకానికి తగిన పరిశీలించిన ట్యుటోరియల్ అందుబాటులో లేదు.",
    
    coachTitle: "వి-క్యూర్ AI హెల్త్ కోచ్",
    coachSubtitle: "విద్యాత్మక మార్గదర్శకత్వం — ఇది డాక్టర్ వైద్య సలహా కాదు",
    askCoachPlaceholder: "మీ ఆహారం లేదా గ్లూకోజ్ వివరాల గురించి అడగండి...",
    sendButton: "పంపండి",
    disclaimerNotice: "వైద్య ప్రకటన: వి-క్యూర్ AI క్లినికల్ మార్గదర్శకాల ఆధారంగా పోషణ విద్యను అందిస్తుంది.",
    type1Warning: "టైప్ 1 నోటీసు: కార్బోహైడ్రేట్ అవగాహన కోసం మార్గదర్శకత్వం. ఇన్సులిన్ డోస్ మార్పులు చేయకూడదు.",
    gestationalWarning: "గర్భధారణ సంరక్షణ: గర్భధారణ ఆహార సూత్రాలు మరియు మీ వైద్యుల ప్రణాళికను అనుసరించండి.",
    
    progressTitle: "ఆరోగ్య పురోగతి & విశ్లేషణ",
    progressSubtitle: "మీ ఆరోగ్య స్కోర్, గ్లూకోజ్ మార్పులు మరియు ఆహార నియమాలను పర్యవేక్షించండి.",
    scoreHistory: "ఆరోగ్య స్కోర్ చరిత్ర",
    weightTrends: "బరువు మార్పులు",
    glucoseTrends: "రక్తంలో గ్లూకోజ్ వివరాలు",
    adherenceRate: "ఆహార నియమాల పాటించే శాతం",
    
    profileTitle: "ప్రొఫైల్ & ఆరోగ్య హబ్",
    overviewTab: "అవలోకనం & వివరాలు",
    medicalEditTab: "వైద్య వివరాలు & సవరణ",
    personalHealth: "వ్యక్తిగత ఆరోగ్య వివరాలు",
    healthVaultTitle: "హెల్త్ వాల్ట్ & మెడికల్ రిపోర్టులు",
    healthVaultDesc: "మెడికల్ రిపోర్టులు, ల్యాబ్ పరీక్షలు & ఇన్సూరెన్స్ పత్రాలు",
    medicalReports: "మెడికల్ రిపోర్టులు",
    uploadNewReport: "కొత్త రిపోర్ట్ అప్‌లోడ్ చేయండి",
    insurancePolicy: "ఆరోగ్య ఇన్సూరెన్స్ వివరాలు",
    insuranceExpiryNotice: "ఇన్సూరెన్స్ పాలసీ గడువు ముగింపు గుర్తుచేసే ప్రకటన",
    familyFriendsTitle: "కుటుంబం & స్నేహితులు",
    familyFriendsDesc: "అనుమతితో మీ కుటుంబ సభ్యుల ఆరోగ్యాన్ని పర్యవేక్షించండి",
    connectedPeople: "కనెక్ట్ అయిన కుటుంబ సభ్యులు",
    addDelegate: "కుటుంబ సభ్యులను జోడించండి",
    
    groceryListTitle: "కిరాణా & షాపింగ్ జాబితా",
    groceryListSubtitle: "మీ ఆహార ప్రణాళికకు అనుకూలమైన ఆరోగ్యకరమైన దినుసులు",
    educationTitle: "ఆరోగ్య విద్య కేంద్రం",
    educationSubtitle: "ఆరోగ్యకరమైన ఆహార చిట్కాలు, గ్లైసీమిక్ సూచిక గైడ్‌లు మరియు వ్యాసాలు.",
    healthArticles: "ఆరోగ్య వ్యాసాలు",
    videoGuides: "వీడియో గైడ్‌లు",
    
    saveChanges: "వివరాలు భద్రపరచండి",
    cancel: "రద్దు చేయండి",
    edit: "సవరించండి",
    delete: "తొలగించండి",
    confirm: "ధృవీకరించండి",
    loading: "లోడ్ అవుతోంది...",
    success: "విజయవంతంగా భద్రపరచబడింది",
    error: "ఒక పొరపాటు జరిగింది",
    back: "వెనుకకు",
    next: "తరువాత",
    changeLanguage: "భాష ఎంపిక (Language)",
    languageSaved: "మీ భాషా ప్రాధాన్యత భద్రపరచబడింది.",
    reportQualityWarning: "ఈ రిపోర్టు స్పష్టంగా చదవడానికి కష్టంగా ఉంది. దయచేసి మంచి వెలుతురులో మళ్ళీ ఫోటో తీసి అప్‌లోడ్ చేయండి."
  },
  ta: {} as TranslationDictionary,
  hi: {} as TranslationDictionary,
  kn: {} as TranslationDictionary,
  ml: {} as TranslationDictionary,
  mr: {} as TranslationDictionary,
  bn: {} as TranslationDictionary
};

const supportedLangs: Language[] = ["ta", "hi", "kn", "ml", "mr", "bn"];
supportedLangs.forEach((lang) => {
  TRANSLATIONS[lang] = { ...TRANSLATIONS.en };
});
