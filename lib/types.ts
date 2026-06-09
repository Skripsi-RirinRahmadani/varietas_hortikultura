export interface District {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Commodity {
  id: string;
  name: string;
  image_url?: string;
  soil_type?: string;
  ph_min?: number;
  ph_max?: number;
  rainfall_min?: number;
  rainfall_max?: number;
  temp_min?: number;
  temp_max?: number;
  district_id?: string;
  status: 'Unggulan' | 'Biasa';
  created_at: string;
  
  // Joins
  district?: District;
}

export interface Prediction {
  id: string;
  created_at: string;
  soil_type: string;
  ph: number;
  rainfall: number;
  temperature: number;
  elevation: number;
  water_availability?: string;
  sunlight_duration?: number;
  identified_location?: string;
  variety_name: string;
  confidence_score: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  recommendation?: string;
  user_id?: string;
}

export interface Variety {
  id: string;
  name: string;
  commodity_id?: string;
  description?: string;
  harvest_age_days?: number;
  yield_per_ha?: number;
  resistance?: string;
  source?: string;
  status: 'Unggulan' | 'Biasa';
  created_at: string;
  // Join
  commodity?: { name: string };
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  updated_at?: string;
  // from auth.users via join
  email?: string;
}

export interface DashboardMetadata {
  key: string;
  value: any;
  updated_at: string;
}

export interface ModelPerformance {
  accuracy: number;
  delay: number;
  training_data: number;
  test_data: number;
}

export interface ProductionStat {
  name: string;
  value: number;
  label: string;
}
