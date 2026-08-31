/**
 * API client for communicating with the Express backend.
 */

const API_URL = '';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as { error: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface FarmData {
  _id: string;
  farmerId: string;
  farmerName: string;
  location: {
    state: string;
    district: string;
    village: string;
    latitude: number;
    longitude: number;
    source: string;
  };
  crop: string;
  cropVariety: string;
  farmArea: number;
  farmAreaUnit: string;
  plantingDate: string;
  cropAge: number;
  growthStage: string;
  irrigationMethod: string;
  soilType: string;
  previousDiseases: string[];
  previousTreatments: string[];
  notes: string;
}

export interface ScanData {
  _id: string;
  crop: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  severity: number;
  affectedArea: number;
  riskLevel: string;
  explanation: string;
  recommendations: string[];
  treatment: {
    immediate: string[];
    organic: string[];
    chemical: string[];
    prevention: string[];
    avoid: string[];
  };
  weatherContext: {
    temperature: number;
    humidity: number;
    rainProbability: number;
    conditions: string;
  };
  isDemo: boolean;
  scanDate: string;
  severityChange?: number;
  improvementPct?: number;
  status?: string;
  scanNumber?: number;
}

export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    conditions: string;
    icon: string;
    rainProbability: number;
    uvIndex: number;
    pressure: number;
    visibility: number;
  };
  forecast: Array<{
    date: string;
    dayName: string;
    high: number;
    low: number;
    humidity: number;
    rainProbability: number;
    conditions: string;
    icon: string;
    windSpeed: number;
  }>;
  weatherRisk: {
    level: string;
    score: number;
    reasoning: string;
    reasoningHi: string;
  };
  isDemo: boolean;
}

export interface RiskData {
  risk: {
    currentRisk: string;
    currentScore: number;
    sevenDayRisk: string;
    sevenDayScore: number;
    factors: Array<{
      name: string;
      nameHi: string;
      value: string;
      impact: string;
      score: number;
      description: string;
      descriptionHi: string;
    }>;
    recommendation: string;
    recommendationHi: string;
  };
  timing: {
    recommended: boolean;
    windowDate: string;
    windowDay: string;
    windowTime: string;
    reason: string;
    reasonHi: string;
    alternatives: Array<{ date: string; day: string; time: string; reason: string }>;
  };
}

export interface AlertData {
  _id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  titleHi: string;
  messageHi: string;
  isRead: boolean;
  createdAt: string;
}

export interface RegionalReportData {
  _id: string;
  region: string;
  state: string;
  district: string;
  disease: string;
  reportCount: number;
  severity: string;
  coordinates: { lat: number; lng: number };
  isDemo: boolean;
  reportDate: string;
}

export interface TimelineData {
  scans: ScanData[];
  summary: {
    totalScans: number;
    latestSeverity: number;
    initialSeverity: number;
    overallChange: number;
    overallStatus: string;
  };
}

export interface AssistantResponse {
  reply: string;
  replyHi: string;
  suggestions: string[];
  suggestionsHi: string[];
}

export const api = {
  // Auth
  login: (credentials: any) => fetchAPI<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (credentials: any) => fetchAPI<any>('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchAPI<any>('/auth/me'),
  logout: () => fetchAPI<any>('/auth/logout', { method: 'POST' }),

  // Farmer Settings
  getLanguage: () => fetchAPI<{userId: string, farmerId: string, language: string}>('/debug/farmer'),
  updateLanguage: (language: string) => fetchAPI<{success: boolean, language: string}>('/farmer/language', {
    method: 'POST',
    body: JSON.stringify({ language }),
  }),
  updateTheme: (theme: 'light' | 'dark') => fetchAPI<{success: boolean, theme: string}>('/farmer/theme', {
    method: 'POST',
    body: JSON.stringify({ theme }),
  }),

  // Health
  health: () => fetchAPI<{ status: string; demoMode: boolean }>('/health'),

  // Farm
  getFarm: () => fetchAPI<FarmData>('/farm'),
  updateFarm: (data: Partial<FarmData>) => fetchAPI<FarmData>('/farm', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Scans
  getScans: () => fetchAPI<ScanData[]>('/scans'),
  getScan: (id: string) => fetchAPI<ScanData>(`/scans/${id}`),
  uploadScan: (formData: FormData) => fetchAPI<ScanData>('/scans', {
    method: 'POST',
    body: formData,
  }),

  // Timeline
  getTimeline: () => fetchAPI<TimelineData>('/timeline'),

  // Weather
  getWeather: () => fetchAPI<WeatherData>('/weather'),

  // Risk
  getRisk: () => fetchAPI<RiskData>('/risk'),

  // Alerts
  getAlerts: () => fetchAPI<AlertData[]>('/alerts'),

  // Regional Disease
  getRegionalDisease: () => fetchAPI<RegionalReportData[]>('/regional-disease'),

  // Recommendations
  getRecommendations: () => fetchAPI<{ disease: string; severity: number; treatment: ScanData['treatment']; recommendations: string[] }>('/recommendations'),

  // Assistant
  askAssistant: (data: { message?: string, language?: string, conversationId?: string, imageBase64?: string }) => fetchAPI<any>('/assistant', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Conversations
  getConversations: () => fetchAPI<any>('/conversations'),
  getConversation: (id: string) => fetchAPI<any>(`/conversations/${id}`),
};
