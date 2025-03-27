# app.py
from flask import Flask, render_template, redirect, url_for, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from food_api import food_api

# Initialize the Flask application
app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.config['SECRET_KEY'] = '12345678910'  # Change this in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nutrition_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Initialize Login Manager
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Define database models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    food_logs = db.relationship('FoodLog', backref='user', lazy=True)

class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    calories = db.Column(db.Float, nullable=False)
    protein = db.Column(db.Float, nullable=False)
    carbs = db.Column(db.Float, nullable=False)
    fat = db.Column(db.Float, nullable=False)
    vitamins = db.Column(db.String(200))  # Storing as a JSON string
    
class FoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey('food.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    portion_size = db.Column(db.Float, default=1.0)  # Multiplier for nutrition values
    food = db.relationship('Food', backref='logs')

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Route to serve the frontend
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

# Create database tables
with app.app_context():
    db.create_all()
    
    # Add some sample foods if the database is empty
    if Food.query.count() == 0:
        sample_foods = [
            Food(name='apple', calories=95, protein=0.5, carbs=25.0, fat=0.3, vitamins='{"C": 8.4, "B6": 0.041, "A": 54}'),
            Food(name='banana', calories=105, protein=1.3, carbs=27.0, fat=0.4, vitamins='{"C": 10.3, "B6": 0.433, "A": 64}'),
            Food(name='orange', calories=62, protein=1.2, carbs=15.4, fat=0.2, vitamins='{"C": 69.7, "B6": 0.06, "A": 14}'),
            Food(name='broccoli', calories=55, protein=3.7, carbs=11.2, fat=0.6, vitamins='{"C": 89.2, "B6": 0.175, "A": 623}'),
            Food(name='pizza', calories=285, protein=12.2, carbs=35.7, fat=10.4, vitamins='{"C": 2.1, "B6": 0.1, "A": 46}'),
            Food(name='hamburger', calories=295, protein=17.5, carbs=30.3, fat=14.2, vitamins='{"C": 1.5, "B6": 0.2, "A": 45}'),
            Food(name='salad', calories=152, protein=1.8, carbs=6.5, fat=12.9, vitamins='{"C": 26.8, "B6": 0.057, "A": 274}')
        ]
        
        for food in sample_foods:
            db.session.add(food)
        
        db.session.commit()

# Import routes after app is created
import routes.auth
import routes.food
import routes.report

# Register blueprints
app.register_blueprint(food_api)

if __name__ == '__main__':
    app.run(debug=True)
