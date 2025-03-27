
// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const regUsernameInput = document.getElementById('reg-username');
    const regEmailInput = document.getElementById('reg-email');
    const regPasswordInput = document.getElementById('reg-password');
    
    // Camera elements
    const cameraFeed = document.getElementById('camera-feed');
    const cameraCanvas = document.getElementById('camera-canvas');
    const startCameraBtn = document.getElementById('start-camera');
    const captureImageBtn = document.getElementById('capture-image');
    const detectFoodBtn = document.getElementById('detect-food');
    const detectionResult = document.getElementById('detection-result');
    const foodNameSpan = document.getElementById('food-name');
    const logFoodBtn = document.getElementById('log-food');
    
    // Report elements
    const generateReportBtn = document.getElementById('generate-report');
    const reportContent = document.getElementById('report-content');
    
    // Nutrition summary elements
    const caloriesTotal = document.getElementById('calories-total');
    const proteinTotal = document.getElementById('protein-total');
    const carbsTotal = document.getElementById('carbs-total');
    const fatTotal = document.getElementById('fat-total');
    
    // Recent logs element
    const recentLogs = document.getElementById('recent-logs');
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Event Listeners
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    startCameraBtn.addEventListener('click', startCamera);
    captureImageBtn.addEventListener('click', captureImage);
    detectFoodBtn.addEventListener('click', detectFood);
    logFoodBtn.addEventListener('click', logFood);
    generateReportBtn.addEventListener('click', generateReport);
    
    // Functions
    function checkLoginStatus() {
        fetch('/api/auth/status')
            .then(response => response.json())
            .then(data => {
                if (data.logged_in) {
                    showDashboard();
                    loadUserData();
                } else {
                    showAuth();
                }
            })
            .catch(error => {
                console.error('Error checking login status:', error);
                showAuth();
            });
    }
    
    function handleLogin() {
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showDashboard();
                loadUserData();
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('An error occurred during login');
        });
    }
    
    function handleRegister() {
        const username = regUsernameInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;
        
        if (!username || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showDashboard();
                loadUserData();
            } else {
                alert(data.message || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        });
    }
    
    function handleLogout() {
        fetch('/api/auth/logout')
            .then(response => response.json())
            .then(data => {
                showAuth();
            })
            .catch(error => {
                console.error('Logout error:', error);
            });
    }
    
    function showAuth() {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
    
    function showDashboard() {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
    }
    
    function loadUserData() {
        // Load nutrition summary
        fetch('/api/food/summary')
            .then(response => response.json())
            .then(data => {
                caloriesTotal.textContent = Math.round(data.calories);
                proteinTotal.textContent = data.protein.toFixed(1) + 'g';
                carbsTotal.textContent = data.carbs.toFixed(1) + 'g';
                fatTotal.textContent = data.fat.toFixed(1) + 'g';
            })
            .catch(error => {
                console.error('Error loading nutrition summary:', error);
            });
        
        // Load recent logs
        fetch('/api/food/logs')
            .then(response => response.json())
            .then(data => {
                recentLogs.innerHTML = '';
                data.logs.forEach(log => {
                    const li = document.createElement('li');
                    li.textContent = `${log.food_name} - ${log.date} (${log.calories} calories)`;
                    recentLogs.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading food logs:', error);
            });
    }
    
    // Camera functionality
    let stream = null;
    
    function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(videoStream) {
                    stream = videoStream;
                    cameraFeed.srcObject = stream;
                    startCameraBtn.disabled = true;
                    captureImageBtn.disabled = false;
                })
                .catch(function(error) {
                    console.error('Camera error:', error);
                    alert('Could not access camera');
                });
        } else {
            alert('Your browser does not support camera access');
        }
    }
    
    function captureImage() {
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        cameraCanvas.classList.remove('hidden');
        detectFoodBtn.disabled = false;
    }
    
    function detectFood() {
        // Get the image data from the canvas
        const imageData = cameraCanvas.toDataURL('image/jpeg');
        
        // Send to backend for food detection
        fetch('/api/food/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                foodNameSpan.textContent = data.food_name;
                detectionResult.classList.remove('hidden');
            } else {
                alert(data.message || 'Could not detect food');
            }
        })
        .catch(error => {
            console.error('Food detection error:', error);
            alert('An error occurred during food detection');
        });
    }
    
    function logFood() {
        const foodName = foodNameSpan.textContent;
        
        fetch('/api/food/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                food_name: foodName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Food logged successfully!');
                loadUserData();
                detectionResult.classList.add('hidden');
            } else {
                alert(data.message || 'Could not log food');
            }
        })
        .catch(error => {
            console.error('Food logging error:', error);
            alert('An error occurred while logging food');
        });
    }
    
    function generateReport() {
        fetch('/api/report/generate')
            .then(response => response.json())
            .then(data => {
                reportContent.innerHTML = '';
                
                const title = document.createElement('h3');
                title.textContent = 'Nutrition Report';
                reportContent.appendChild(title);
                
                const summary = document.createElement('p');
                summary.textContent = data.summary;
                reportContent.appendChild(summary);
                
                const recommendations = document.createElement('h4');
                recommendations.textContent = 'Recommendations:';
                reportContent.appendChild(recommendations);
                
                const recList = document.createElement('ul');
                data.recommendations.forEach(rec => {
                    const li = document.createElement('li');
                    li.textContent = rec;
                    recList.appendChild(li);
                });
                reportContent.appendChild(recList);
                
                reportContent.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Report generation error:', error);
                alert('An error occurred while generating the report');
            });
    }
});

// Food detection functionality
document.addEventListener('DOMContentLoaded', function() {
    const startCameraBtn = document.getElementById('start-camera');
    const captureImageBtn = document.getElementById('capture-image');
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadImageInput = document.getElementById('upload-image');
    const detectFoodBtn = document.getElementById('detect-food');
    const cameraFeed = document.getElementById('camera-feed');
    const cameraCanvas = document.getElementById('camera-canvas');
    const detectionResult = document.getElementById('detection-result');
    const foodNameSpan = document.getElementById('food-name');
    const nutritionDetails = document.getElementById('nutrition-details');
    const healthAssessment = document.getElementById('health-assessment');
    const logFoodBtn = document.getElementById('log-food');
    
    let capturedImage = null;
    let uploadedImage = null;
    
    // Start camera
    startCameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = stream;
            captureImageBtn.disabled = false;
            startCameraBtn.disabled = true;
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check permissions.');
        }
    });
    
    // Capture image
    captureImageBtn.addEventListener('click', () => {
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        capturedImage = cameraCanvas.toDataURL('image/jpeg');
        uploadedImage = null;
        
        // Stop camera stream
        const stream = cameraFeed.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraFeed.srcObject = null;
        
        // Show canvas with captured image
        cameraFeed.classList.add('hidden');
        cameraCanvas.classList.remove('hidden');
        
        // Enable detect food button
        detectFoodBtn.disabled = false;
        startCameraBtn.disabled = false;
        captureImageBtn.disabled = true;
    });
    
    // Upload image button
    uploadImageBtn.addEventListener('click', () => {
        uploadImageInput.click();
    });
    
    // Handle file selection
    uploadImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result;
                capturedImage = null;
                
                // Display the uploaded image
                const img = new Image();
                img.onload = () => {
                    const context = cameraCanvas.getContext('2d');
                    cameraCanvas.width = img.width;
                    cameraCanvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    
                    cameraFeed.classList.add('hidden');
                    cameraCanvas.classList.remove('hidden');
                    
                    // Enable detect food button
                    detectFoodBtn.disabled = false;
                };
                img.src = uploadedImage;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Detect food
    detectFoodBtn.addEventListener('click', async () => {
        try {
            detectFoodBtn.disabled = true;
            detectFoodBtn.textContent = 'Detecting...';
            
            let response;
            if (capturedImage) {
                // Send captured image
                response = await fetch('/api/detect-food', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageData: capturedImage })
                });
            } else if (uploadedImage) {
                // Send uploaded image
                const formData = new FormData();
                const blob = await fetch(uploadedImage).then(r => r.blob());
                formData.append('image', blob, 'image.jpg');
                
                response = await fetch('/api/detect-food', {
                    method: 'POST',
                    body: formData
                });
            } else {
                throw new Error('No image captured or uploaded');
            }
            
            if (!response.ok) {
                throw new Error('Failed to detect food');
            }
            
            const data = await response.json();
            
            // Display results
            foodNameSpan.textContent = data.foodName;
            
            // Display nutrition details
            nutritionDetails.innerHTML = '';
            if (data.nutritionDetails && data.nutritionDetails.length > 0) {
                const ul = document.createElement('ul');
                data.nutritionDetails.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                nutritionDetails.appendChild(ul);
            } else {
                nutritionDetails.textContent = data.fullResponse;
            }
            
            // Display health assessment
            healthAssessment.textContent = data.healthAssessment;
            
            // Show results
            detectionResult.classList.remove('hidden');
            
            // Reset button
            detectFoodBtn.textContent = 'Detect Food';
            detectFoodBtn.disabled = false;
            
        } catch (err) {
            console.error('Error detecting food:', err);
            alert('Error detecting food: ' + err.message);
            detectFoodBtn.textContent = 'Detect Food';
            detectFoodBtn.disabled = false;
        }
    });
    
    // Log food
    logFoodBtn.addEventListener('click', () => {
        // Get the food name and nutrition details
        const foodName = foodNameSpan.textContent;
        const nutritionInfo = nutritionDetails.textContent;
        
        // Add to recent logs
        const recentLogs = document.getElementById('recent-logs');
        const logItem = document.createElement('li');
        logItem.innerHTML = `<strong>${foodName}</strong>: ${nutritionInfo.substring(0, 100)}...`;
        recentLogs.prepend(logItem);
        
        // Update nutrition summary (simplified example)
        // In a real app, you would parse the nutrition data and update accordingly
        const caloriesTotal = document.getElementById('calories-total');
        const currentCalories = parseInt(caloriesTotal.textContent) || 0;
        // This is a placeholder - in a real app you would extract actual calories
        const estimatedCalories = 300;
        caloriesTotal.textContent = currentCalories + estimatedCalories;
        
        // Hide detection result
        detectionResult.classList.add('hidden');
        
        // Reset camera/canvas
        cameraCanvas.classList.add('hidden');
        cameraFeed.classList.remove('hidden');
    });
});
