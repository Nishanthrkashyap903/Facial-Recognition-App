from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from predict import predictEmotion
from models import Song
from db_init import db

# Initialize the Blueprint
upload_bp = Blueprint('upload', __name__)

# Allowed extensions for file uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    print("File name: ", filename)
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_upload(request_files):
    if 'file' not in request_files:
        return None, ('No file part in the request', 400)
    
    file = request_files['file']
    if file.filename == '':
        return None, ('No selected file', 400)
    
    if not allowed_file(file.filename):
        return None, ('File type not allowed', 400)
    
    return file, None

def save_uploaded_file(file):
    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    return os.path.join(current_app.config['UPLOAD_FOLDER'], 'captured-image.png')

def process_emotion_data(emotion_data):
    emotion_groups = {
        "emotion_positive_high_arousal": ["happiness", "surprise"],
        "emotion_positive_low_arousal": ["neutral"],
        "emotion_negative_low_arousal": ["sadness", "disgust"],
        "emotion_negative_high_arousal": ["anger", "fear"]
    }

    # Calculate summed values for each broader emotion
    grouped_emotion_data = {
        group: sum(emotion_data[emotion] for emotion in emotions) 
        for group, emotions in emotion_groups.items()
    }

    # Normalize the values
    total = sum(grouped_emotion_data.values())
    normalized_emotion_data = {
        emotion: (value / total) 
        for emotion, value in grouped_emotion_data.items()
    }

    return normalized_emotion_data

def get_songs_by_emotion(normalized_emotion_data):
    top_emotion = max(normalized_emotion_data, key=normalized_emotion_data.get)
    return Song.query.filter_by(top_emotion=top_emotion).all()

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    print("Request Files:", request.files)
    
    # Validate file upload
    file, error = validate_file_upload(request.files)
    if error:
        return jsonify({'error': error[0]}), error[1]

    # Save file
    img_path = save_uploaded_file(file)

    # Get emotion prediction
    response = predictEmotion(img_path)
    if response.status_code != 200:
        return jsonify({'error': 'Unable to fetch Emotion Data'}), 500

    # Process response
    result = response.json()
    if 'faces' not in result or not result['faces']:
        return jsonify({'error': 'Invalid API Response'}), 500

    # Process emotion data
    emotion_data = result['faces'][0]['attributes']['emotion']
    normalized_emotion_data = process_emotion_data(emotion_data)
    
    # Get matching songs
    songs = get_songs_by_emotion(normalized_emotion_data)

    return jsonify({
        "songs": [song.to_dict() for song in songs],
        "imageEmotion": normalized_emotion_data
    }), 200


