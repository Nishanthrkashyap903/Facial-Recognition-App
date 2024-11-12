from flask import Blueprint, request, jsonify
from db_init import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup(): 

    fullName = request.json.get('fullName')
    emailId = request.json.get('emailId')
    password = request.json.get('password')

    print(fullName,emailId,password)

    if not fullName or not emailId or not password:
        return jsonify({'error': 'Please provide fullname, username, and password'}), 400

    existing_user = User.query.filter_by(emailid=emailId).first()

    print("existing user",existing_user)
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    new_user = User(fullname=fullName, emailid=emailId)

    if not new_user:
        return jsonify({'error': 'Something went wrong while registering the user'}), 500
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'emailId':emailId}), 201

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    emailId = data.get('emailId')
    password = data.get('password')

    # Find the user by username
    user = User.query.filter_by(emailid=emailId).first()
    if user :
        if user.check_password(password):
            # Here you can return a token or user data as per your authentication method
            return jsonify({'message': 'Login successful', 'emailId': user.emailid}), 200
        
        return jsonify({'error': 'Invalid password'}), 401

    return jsonify({'error': 'Invalid username please register before signin'}), 401