import os
from flask_sqlalchemy import SQLAlchemy
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_app(app):
    print("init db")
    """Initialize the app with the database configuration."""

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)  # Initialize SQLAlchemy with the Flask app

    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        print("Database tables created (if they didn't already exist).")

