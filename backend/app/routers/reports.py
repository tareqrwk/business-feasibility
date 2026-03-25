from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import (
    ReportCreate, ReportResponse, ReportListResponse, FollowUpQuestionsResponse
)
from app.utils.auth import get_current_user
from app.services.ai_service import generate_feasibility_report, get_follow_up_questions

router = APIRouter()


@router.post("/questions", response_model=FollowUpQuestionsResponse)
async def get_questions(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user)
):
    """Get follow-up questions for a business idea."""
    questions = await get_follow_up_questions(report_data)
    return FollowUpQuestionsResponse(questions=questions)


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a new feasibility report."""
    # Generate report using AI
    ai_response = await generate_feasibility_report(report_data)

    # Create report in database
    new_report = Report(
        user_id=current_user.id,
        business_idea=report_data.business_idea,
        location=report_data.location,
        budget_range=report_data.budget_range,
        business_type=report_data.business_type,
        target_customer=report_data.target_customer,
        raw_response=ai_response.get("raw_response"),
        processed_report=ai_response.get("processed_report"),
        feasibility_score=ai_response.get("feasibility_score")
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


@router.get("", response_model=ReportListResponse)
async def list_reports(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all reports for the current user."""
    total = db.query(Report).filter(Report.user_id == current_user.id).count()
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return ReportListResponse(reports=reports, total=total)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific report by ID."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a report."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()