from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_idea = Column(Text, nullable=False)
    location = Column(String(255))
    budget_range = Column(String(100))
    business_type = Column(String(100))
    target_customer = Column(Text)
    raw_response = Column(JSONB)
    processed_report = Column(JSONB)
    feasibility_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.id} - {self.business_idea[:50]}>"