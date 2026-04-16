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
  variety_name: string;
  confidence_score: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  recommendation?: string;
  user_id?: string;
}
