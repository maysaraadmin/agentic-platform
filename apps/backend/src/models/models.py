from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from src.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_type = Column(String, index=True)
    query = Column(Text)
    response = Column(Text)
    user_id = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
