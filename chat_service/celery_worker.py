from celery_client import celery_app
from models import SessionLocal, ChatMessage

@celery_app.task(name="save_chat_message")
def save_message_to_db(client_id, therapist_id, sender_id, message_text):
    db = SessionLocal()
    try:
        # 9iyed l-message f Database
        new_message = ChatMessage(
            client_id=client_id,
            therapist_id=therapist_id,
            sender_id=sender_id,
            message_text=message_text
        )
        db.add(new_message)
        db.commit()
        return f"Message saved successfully!"
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()