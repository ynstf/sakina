import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# URL dyal Database (Bdl b dyal PostgreSQL dyalek)
DATABASE_URL = os.getenv("CHAT_DB_URL", "postgresql://postgres:password@localhost:5432/sakina_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, index=True)
    therapist_id = Column(String, index=True)
    sender_id = Column(String)
    message_text = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Creyi l-table f Database
Base.metadata.create_all(bind=engine)