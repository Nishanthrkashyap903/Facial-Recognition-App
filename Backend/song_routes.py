from flask import Blueprint, request, send_from_directory, jsonify
import os

# Initialize the Blueprint
song_bp = Blueprint('song', __name__)

# Define Songs folder path
SONGS_FOLDER = 'Songs'

# Create Songs directory if it doesn't exist
if not os.path.exists(SONGS_FOLDER):
    os.makedirs(SONGS_FOLDER)

@song_bp.route('/songs/<filename>')
def serve_song(filename):
    try:
        language = request.args.get('language')
        # print(language)

        songs_path = os.path.join(SONGS_FOLDER, language)

        full_filename = f"{filename}.mp3"
        return send_from_directory(songs_path, full_filename, as_attachment=False, mimetype='audio/mpeg')
    except FileNotFoundError:
        return jsonify({'error': 'Song not found'}), 404 