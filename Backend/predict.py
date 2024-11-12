import requests
import os

# Replace with your own API Key and API Secret
api_key = os.getenv('API_KEY')
api_secret = os.getenv('API_SECRET')
# image_path = "captured-image.png"  # Local image path or a URL

# API endpoint for emotion detection
faceplusplus_url = "https://api-us.faceplusplus.com/facepp/v3/detect"

# Prepare the data for the request
data = {
    'api_key': api_key,
    'api_secret': api_secret,
    'return_attributes': 'emotion'
}

def predictEmotion(image_path):

    # Open the image file and send it in the request
    with open(image_path, 'rb') as image_file:
        files = {
            'image_file': image_file
        }

        # Make the request
        response = requests.post(faceplusplus_url, data=data, files=files)

    return response