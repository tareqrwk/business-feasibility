from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class ReportBase(BaseModel):
    business_idea: str
    location: Optional[str] = None
    budget_range: Optional[str] = None
    business_type: Optional[str] = None
    target_customer: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    business_idea: Optional[str] = None
    location: Optional[str] = None
    budget_range: Optional[str] = None
    business_type: Optional[str] = None
    target_customer: Optional[str] = None


class FollowUpQuestion(BaseModel):
    question: str
    field_name: str
    options: Optional[List[str]] = None
    required: bool = True


class FollowUpQuestionsResponse(BaseModel):
    questions: List[FollowUpQuestion]


class StartupCost(BaseModel):
    equipment: Dict[str, float]
    setup_costs: Dict[str, float]
    initial_inventory: Dict[str, float]
    licenses_permits: Dict[str, float]
    total_range: Dict[str, float]


class OperatingCost(BaseModel):
    rent: float
    labor: float
    software_tools: float
    utilities: float
    misc_overhead: float
    total_monthly: float


class CompetitorAnalysis(BaseModel):
    competitor_types: List[str]
    market_saturation: str
    differentiation_suggestions: List[str]


class ProfitabilityAnalysis(BaseModel):
    estimated_price_range: Dict[str, float]
    estimated_monthly_revenue: Dict[str, float]
    break_even_months: int
    profit_margin_potential: str


class FeasibilityReport(BaseModel):
    startup_costs: StartupCost
    operating_costs: OperatingCost
    competitor_analysis: CompetitorAnalysis
    profitability: ProfitabilityAnalysis
    feasibility_score: int
    feasibility_rating: str
    summary: str
    recommendations: List[str]


class ReportResponse(ReportBase):
    id: UUID
    user_id: UUID
    processed_report: Optional[Dict[str, Any]] = None
    feasibility_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int