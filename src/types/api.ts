export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url?: string;
  farmProfile: FarmProfile;
  settings?: UserSettings;
}

export interface FarmProfile {
  farm_name: string;
  county: string;
  subcounty: string;
  ward: string;
  address: string;
  zip_code: string;
  country: string;
}

export interface UserSettings {
  notify_email_alerts: boolean;
  notify_sms_alerts: boolean;
  notify_push: boolean;
  alert_weekly_reports: boolean;
  alert_maintenance: boolean;
  alert_low_battery: boolean;
  alert_moisture: boolean;
  alert_temperature: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr';
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  temp_unit: 'C' | 'F';
  measurement_unit: 'Metric' | 'Imperial';
  share_data: boolean;
  usage_analytics: boolean;
  marketing_emails: boolean;
  third_party_integrations: boolean;
  two_factor_enabled: boolean;
}

export interface Kit {
  kit_id: string;
  location_name: string;
  crop_type: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KitConfiguration {
  active_mode: 'Manual' | 'Sensor' | 'SmartWeather';
  reading_interval_active_min: number;
  reading_interval_idle_min: number;
  low_moisture_threshold_pct: number;
  notifications_enabled: {
    Offline: boolean;
    'Low Battery': boolean;
  };
  manual_settings_json: {
    schedules: {
      time: string;
      duration_min: number;
    }[];
  };
  sensor_settings_json: {
    start_threshold_pct: number;
    stop_threshold_pct: number;
  };
  smart_weather_settings_json: {
    rain_threshold_mm: number;
    ai_sensitivity: 'low' | 'medium' | 'high';
  };
}

export interface SensorReading {
  kit_id: string;
  timestamp: string;
  moisture: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  battery: number;
  signal: number;
  firmware: number;
  ec: number;
  is_irrigating?: boolean;
}

export type LatestSensorData = SensorReading;

export interface DeviceSummary extends Kit {
  latest_sensor_data: LatestSensorData | null;
  maintenance: boolean;
}

export interface Alert {
  id: string;
  kit_id: string;
  timestamp: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  is_resolved: boolean;
}
