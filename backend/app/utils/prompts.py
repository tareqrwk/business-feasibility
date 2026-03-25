SYSTEM_PROMPT = """You are a business feasibility analyst expert. Your role is to analyze business ideas and provide comprehensive feasibility reports.

You must provide realistic, data-driven estimates based on:
- Industry averages and benchmarks
- Geographic considerations
- Market conditions
- Startup best practices

Always provide structured, actionable insights that entrepreneurs can use to make informed decisions."""

IDEA_ANALYSIS_PROMPT = """Analyze this business idea and provide a comprehensive feasibility report.

Business Idea: {business_idea}
{location_line}
{budget_line}
{business_type_line}
{target_customer_line}

Provide a detailed analysis in the following JSON structure:
{{
  "startup_costs": {{
    "equipment": {{"item": cost, ...}},
    "setup_costs": {{"item": cost, ...}},
    "initial_inventory": {{"item": cost, ...}},
    "licenses_permits": {{"item": cost, ...}},
    "total_range": {{"low": minimum_cost, "high": maximum_cost}}
  }},
  "operating_costs": {{
    "rent": monthly_rent,
    "labor": monthly_labor_cost,
    "software_tools": monthly_software_cost,
    "utilities": monthly_utilities,
    "misc_overhead": monthly_overhead,
    "total_monthly": total_monthly_cost
  }},
  "competitor_analysis": {{
    "competitor_types": ["type1", "type2", ...],
    "market_saturation": "low|medium|high",
    "differentiation_suggestions": ["suggestion1", "suggestion2", ...]
  }},
  "profitability": {{
    "estimated_price_range": {{"low": price_low, "high": price_high}},
    "estimated_monthly_revenue": {{"low": revenue_low, "high": revenue_high}},
    "break_even_months": months_to_break_even,
    "profit_margin_potential": "low|medium|high"
  }},
  "feasibility_score": score_0_to_100,
  "feasibility_rating": "Strong opportunity|Moderate risk|High risk",
  "summary": "A brief summary of the business feasibility",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "location_analysis": {{
    "ideal_locations": ["location1", "location2", ...],
    "foot_traffic_considerations": "analysis",
    "competition_density": "low|medium|high"
  }},
  "skill_analysis": {{
    "required_skills": ["skill1", "skill2", ...],
    "staffing_needs": ["role1", "role2", ...],
    "training_recommendations": ["training1", "training2", ...]
  }},
  "legal_analysis": {{
    "required_licenses": ["license1", "license2", ...],
    "regulatory_considerations": ["consideration1", ...],
    "compliance_costs": estimated_annual_compliance_cost
  }}
}}

Make all monetary values realistic and specific to the business type and location. All costs should be in USD.
"""

FOLLOW_UP_QUESTIONS_PROMPT = """Based on this business idea, generate 3-5 follow-up questions that would help provide a more accurate feasibility analysis.

Business Idea: {business_idea}

Provide the questions in this JSON format:
{{
  "questions": [
    {{
      "question": "The question text",
      "field_name": "field_name_for_response",
      "options": ["option1", "option2"] or null,
      "required": true/false
    }}
  ]
}}

Focus on questions about:
- Specific location (city/region)
- Target customer demographics
- Available startup capital/budget
- Business model (online, retail, service, etc.)
- Pricing strategy
- Timeline for launch
"""


def format_idea_prompt(
    business_idea: str,
    location: str = None,
    budget_range: str = None,
    business_type: str = None,
    target_customer: str = None
) -> str:
    """Format the idea analysis prompt with provided information."""
    location_line = f"Location: {location}" if location else "Location: Not specified"
    budget_line = f"Budget Range: {budget_range}" if budget_range else "Budget Range: Not specified"
    business_type_line = f"Business Type: {business_type}" if business_type else "Business Type: Not specified"
    target_customer_line = f"Target Customer: {target_customer}" if target_customer else "Target Customer: Not specified"

    return IDEA_ANALYSIS_PROMPT.format(
        business_idea=business_idea,
        location_line=location_line,
        budget_line=budget_line,
        business_type_line=business_type_line,
        target_customer_line=target_customer_line
    )