export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  business_idea: string;
  location?: string;
  budget_range?: string;
  business_type?: string;
  target_customer?: string;
  processed_report?: FeasibilityReport;
  feasibility_score?: number;
  created_at: string;
  updated_at: string;
}

export interface FeasibilityReport {
  startup_costs: {
    equipment: Record<string, number>;
    setup_costs: Record<string, number>;
    initial_inventory: Record<string, number>;
    licenses_permits: Record<string, number>;
    total_range: { low: number; high: number };
  };
  operating_costs: {
    rent: number;
    labor: number;
    software_tools: number;
    utilities: number;
    misc_overhead: number;
    total_monthly: number;
  };
  competitor_analysis: {
    competitor_types: string[];
    market_saturation: string;
    differentiation_suggestions: string[];
  };
  profitability: {
    estimated_price_range: { low: number; high: number };
    estimated_monthly_revenue: { low: number; high: number };
    break_even_months: number;
    profit_margin_potential: string;
  };
  feasibility_score: number;
  feasibility_rating: string;
  summary: string;
  recommendations: string[];
  location_analysis?: {
    ideal_locations: string[];
    foot_traffic_considerations: string;
    competition_density: string;
  };
  skill_analysis?: {
    required_skills: string[];
    staffing_needs: string[];
    training_recommendations: string[];
  };
  legal_analysis?: {
    required_licenses: string[];
    regulatory_considerations: string[];
    compliance_costs: number;
  };
}

export interface FollowUpQuestion {
  question: string;
  field_name: string;
  options?: string[];
  required: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ReportFormData {
  business_idea: string;
  location?: string;
  budget_range?: string;
  business_type?: string;
  target_customer?: string;
}