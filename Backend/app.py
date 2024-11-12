from flask import Flask
import os
from flask_cors import CORS
from upload_routes import upload_bp 
from auth_routes import auth_bp
from dotenv import load_dotenv
from db_init import init_app
from song_routes import song_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set the upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize the database
init_app(app)

# Register the blueprint
app.register_blueprint(upload_bp)
app.register_blueprint(auth_bp,url_prefix='/auth')
app.register_blueprint(song_bp,url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True,port=5500)
