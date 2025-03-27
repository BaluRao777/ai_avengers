from flask import Blueprint, request, jsonify
import os
import sys
from PIL import Image
import io
import base64
import tempfile

# Import the functions from food.py
from food import get_gemini_response, input_image_setup

food_api = Blueprint('food_api', __name__)

@food_api.route('/api/detect-food', methods=['POST'])
def detect_food():
    try:
        # Get the image data from the request
        if 'image' not in request.files and 'imageData' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        if 'image' in request.files:
            # Handle file upload
            uploaded_file = request.files['image']
            image_data = input_image_setup(uploaded_file)
        else:
            # Handle base64 image data from canvas
            image_data_url = request.json['imageData']
            # Remove the data URL prefix
            image_data_base64 = image_data_url.split(',')[1]
            image_bytes = base64.b64decode(image_data_base64)
            
            # Create a temporary file to use with input_image_setup
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                temp_file.write(image_bytes)
                temp_file_path = temp_file.name
            
            # Create a file-like object for input_image_setup
            class TempUploadFile:
                def __init__(self, file_path):
                    self.file_path = file_path
                    self.type = "image/jpeg"
                
                def getvalue(self):
                    with open(self.file_path, 'rb') as f:
                        return f.read()
            
            temp_upload_file = TempUploadFile(temp_file_path)
            image_data = input_image_setup(temp_upload_file)
            # Clean up the temporary file
            os.unlink(temp_file_path)
        
        # Use the input prompt from food.py
        input_prompt = """
        You are an expert in nutritionist where you need to see the food items from the image
                   and calculate the total calories, also provide the details of every food items with calories intake
                   is below format

                   1. Item 1 - no of calories
                   2. Item 2 - no of calories
                   ----
                   ----
        Finally you can also mention whether the food is healthy, balanced or not healthy and what all additional food items can be added in the diet which are healthy.
        """
        
        # Get the response from Gemini
        response = get_gemini_response(input_prompt, image_data)
        
        # Parse the response to extract food name, nutrition details, and health assessment
        # This is a simple parsing logic and might need to be adjusted based on the actual response format
        lines = response.split('\n')
        food_name = "Mixed Food Items"  # Default
        nutrition_details = []
        health_assessment = ""
        
        parsing_nutrition = False
        parsing_health = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("1."):
                parsing_nutrition = True
                parsing_health = False
                
            if parsing_nutrition and (line.startswith("Finally") or line.startswith("The food")):
                parsing_nutrition = False
                parsing_health = True
                
            if parsing_nutrition and line[0].isdigit() and "." in line[:3]:
                nutrition_details.append(line)
                
            if parsing_health:
                health_assessment += line + " "
        
        return jsonify({
            'foodName': food_name,
            'nutritionDetails': nutrition_details,
            'healthAssessment': health_assessment.strip(),
            'fullResponse': response
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
