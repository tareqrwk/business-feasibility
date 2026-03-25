import json
from typing import Dict, Any, List
from groq import Groq
from app.config import get_settings
from app.schemas.report import ReportCreate, FollowUpQuestion
from app.utils.prompts import SYSTEM_PROMPT, format_idea_prompt, FOLLOW_UP_QUESTIONS_PROMPT

settings = get_settings()


def get_groq_client() -> Groq:
    """Get the Groq API client."""
    return Groq(api_key=settings.groq_api_key)


async def generate_feasibility_report(report_data: ReportCreate) -> Dict[str, Any]:
    """Generate a feasibility report using Groq AI."""
    client = get_groq_client()

    # Format the prompt
    prompt = format_idea_prompt(
        business_idea=report_data.business_idea,
        location=report_data.location,
        budget_range=report_data.budget_range,
        business_type=report_data.business_type,
        target_customer=report_data.target_customer
    )

    # Call Groq API
    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=4096
    )

    # Parse the response
    content = response.choices[0].message.content

    # Extract JSON from response (handle potential markdown code blocks)
    try:
        # Try to parse directly
        processed_report = json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        import re
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            processed_report = json.loads(json_match.group(1))
        else:
            # Try to find JSON object in the text
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                processed_report = json.loads(json_match.group(0))
            else:
                raise ValueError("Could not parse JSON from AI response")

    return {
        "raw_response": {"content": content, "model": "llama-3.1-70b-versatile"},
        "processed_report": processed_report,
        "feasibility_score": processed_report.get("feasibility_score", 50)
    }


async def get_follow_up_questions(report_data: ReportCreate) -> List[FollowUpQuestion]:
    """Get follow-up questions for a business idea."""
    client = get_groq_client()

    prompt = FOLLOW_UP_QUESTIONS_PROMPT.format(business_idea=report_data.business_idea)

    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1024
    )

    content = response.choices[0].message.content

    # Parse JSON from response
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            parsed = json.loads(json_match.group(0))
        else:
            # Return default questions if parsing fails
            return get_default_questions()

    questions = []
    for q in parsed.get("questions", []):
        questions.append(FollowUpQuestion(
            question=q.get("question", ""),
            field_name=q.get("field_name", ""),
            options=q.get("options"),
            required=q.get("required", True)
        ))

    return questions if questions else get_default_questions()


def get_default_questions() -> List[FollowUpQuestion]:
    """Return default follow-up questions."""
    return [
        FollowUpQuestion(
            question="Where do you plan to operate this business?",
            field_name="location",
            options=["Local city", "Online/E-commerce", "Multiple locations", "Regional"],
            required=True
        ),
        FollowUpQuestion(
            question="What is your approximate startup budget?",
            field_name="budget_range",
            options=["Under $5,000", "$5,000 - $25,000", "$25,000 - $100,000", "Over $100,000"],
            required=True
        ),
        FollowUpQuestion(
            question="What type of business model is this?",
            field_name="business_type",
            options=["Retail", "Service-based", "Online/E-commerce", "Manufacturing", "Franchise"],
            required=True
        ),
        FollowUpQuestion(
            question="Who is your target customer?",
            field_name="target_customer",
            options=["General consumers", "Businesses (B2B)", "Students", "Professionals", "Seniors"],
            required=False
        )
    ]