from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    # Load environment variables
    load_dotenv()
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Register blueprints
    from app.chat import chat_bp
    app.register_blueprint(chat_bp)
    
    return app 