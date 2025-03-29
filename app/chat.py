from flask import Blueprint, request, jsonify
import requests
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Validate request data
        data = request.get_json()
        if not data or 'message' not in data:
            logging.error('Missing message in request')
            return jsonify({'error': 'Missing message in request'}), 400
        
        # Get message and history from request
        user_message = data['message']
        conversation_history = data.get('history', [])

        # Construct messages for OpenRouter API
        messages = []
        for msg in conversation_history:
            messages.append({
                'role': 'user' if msg.get('isUser') else 'assistant',
                'content': msg.get('content', '')
            })
        
        # Add the current user message
        messages.append({
            'role': 'user',
            'content': user_message
        })

        # Prepare headers and payload for OpenRouter API
        headers = {
            'Authorization': f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'openai/gpt-3.5-turbo',
            'messages': messages
        }

        # Log the request payload
        logging.debug(f'Request payload: {payload}')

        # Call OpenRouter API
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers=headers,
            json=payload
        )

        # Log the response status and content
        logging.debug(f'Response status: {response.status_code}')
        logging.debug(f'Response content: {response.text}')

        # Check for successful response
        if response.status_code != 200:
            logging.error('Failed to get response from OpenRouter')
            return jsonify({'error': 'Failed to get response from OpenRouter'}), 500

        # Extract and return the assistant's response
        assistant_response = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')

        return jsonify({
            'response': assistant_response
        })

    except Exception as e:
        logging.exception('An error occurred')
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500 