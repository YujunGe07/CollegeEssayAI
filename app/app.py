from flask import Flask
from .routes.chat import chat_bp
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.register_blueprint(chat_bp) 

