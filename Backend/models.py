from db_init import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    emailid = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Song(db.Model):
    __tablename__ = 'songs'  # Explicitly set the table name to match the database

    id = db.Column(db.Integer, primary_key=True)
    song_name = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    emotion_positive_high_arousal = db.Column(db.Float, nullable=False)
    emotion_positive_low_arousal = db.Column(db.Float, nullable=False)
    emotion_negative_low_arousal = db.Column(db.Float, nullable=False)
    emotion_negative_high_arousal = db.Column(db.Float, nullable=False)
    top_emotion = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "song_name": self.song_name,
            "language": self.language,
            "emotion_positive_high_arousal": self.emotion_positive_high_arousal,
            "emotion_positive_low_arousal": self.emotion_positive_low_arousal,
            "emotion_negative_low_arousal": self.emotion_negative_low_arousal,
            "emotion_negative_high_arousal": self.emotion_negative_high_arousal,
            "top_emotion": self.top_emotion,
        }