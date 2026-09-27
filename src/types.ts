export type Language = 'en' | 'hi';

export interface WeatherData {
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  condition: string;
  icon: string;
  agriAdvisory: {
    irrigation: string;
    spraying: string;
    harvest: string;
    temperatureAlert?: string;
  };
}

export interface CropAnalysisResult {
  id: string;
  timestamp: string;
  createdAt?: string;
  imageUrl: string;
  crop: string;
  problem: string;
  healthStatus: 'healthy' | 'moderate' | 'critical' | 'uncertain';
  confidence: string;
  possible_causes: string[];
  recommendations: string[];
  prevention: string[];
  warning: string;
  language: Language;
}

export interface AskResponse {
  success: boolean;
  answer: string;
  answerHindi?: string;
  answerEnglish?: string;
  audioScriptHindi?: string;
  audioScriptEnglish?: string;
  language: Language;
  detectedLanguage?: string;
  suggestedQuestions?: string[];
  id?: string;
}

export interface ExpertRequest {
  id: string;
  farmerName: string;
  phoneNumber: string;
  location: string;
  cropName: string;
  problemDescription: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'Pending' | 'Assigned' | 'Resolved';
}

export interface HistoryItem {
  id: string;
  type: 'text_qa' | 'image_diagnosis' | 'expert_request';
  title: string;
  snippet: string;
  date: string;
  language: Language;
  data?: any;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  village?: string;
  state?: string;
  crops?: string[];
  preferredLanguage?: Language;
  role?: 'admin' | 'farmer';
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface ExpertCallbackRequest {
  id: string;
  farmerName: string;
  phone: string;
  crop?: string;
  problem?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface AdminStats {
  totalFarmers: number;
  totalScans: number;
  totalQueries: number;
  pendingCallbacks: number;
  criticalAlerts: number;
}

export type NotificationType = 'weather_alert' | 'crop_health' | 'irrigation' | 'pest_alert' | 'advisory';
export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface FarmerNotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleHi?: string;
  body: string;
  bodyHi?: string;
  severity: NotificationSeverity;
  crop?: string;
  read?: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationSettings {
  weatherAlerts: boolean;
  cropHealthReminders: boolean;
  soundEnabled: boolean;
  fcmToken?: string | null;
  permissionStatus: NotificationPermission | 'unsupported';
}


