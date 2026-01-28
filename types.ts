
export interface IngredientDetail {
  name: string;
  weight_grams: number;
  unit_price_try_per_kg: number;
  total_item_cost_try: number;
}

export interface NearbyRestaurant {
  name: string;
  dish_name: string;
  price_try: number;
  location?: string;
}

export interface DishAnalysis {
  dish: string;
  description: string;
  portion_size: 'küçük' | 'normal' | 'büyük';
  detailed_ingredients: IngredientDetail[];
  estimated_total_cost_try: number;
  estimated_market_price_try: number;
  nearby_restaurants: NearbyRestaurant[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  data: DishAnalysis;
  sources: GroundingSource[];
}
