
// main.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    const registerFormContainer = document.getElementById('register-form-container');
    
    // Camera elements
    const cameraFeed = document.getElementById('camera-feed');
    const cameraCanvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const retryBtn = document.getElementById('retry-btn');
    const detectionResult = document.getElementById('detection-result');
    const intakeBtn = document.getElementById('intake-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Nutrition display elements
    const totalCalories = document.getElementById('total-calories');
    const totalProtein = document.getElementById('total-protein');
    const totalCarbs = document.getElementById('total-carbs');
    const totalFat = document.getElementById('total-fat');
    
    // Food detection result elements
    const foodName = document.getElementById('food-name');
    const foodCalories = document.getElementById('food-calories');
    const foodProtein = document.getElementById('food-protein');
    const foodCarbs = document.getElementById('food-carbs');
    const foodFat = document.getElementById('food-fat');
    
    // Recent logs and report elements
    const recentLogs = document.getElementById('recent-logs');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportContent = document.getElementById('report-content');
    
    // Store current detected food
    let currentDetectedFood = null;
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Event listeners for forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    showRegisterBtn.addEventListener('click', showRegisterForm);
    showLoginBtn.addEventListener('click', showLoginForm);
    
    // Camera controls
    captureBtn.addEventListener('click', captureImage);
    retryBtn.addEventListener('click', resetCamera);
    intakeBtn.addEventListener('click', logFoodIntake);
    cancelBtn.addEventListener('click', resetCamera);
    
    // Report generation
    generateReportBtn.addEventListener('click', generateReport);
    
    // Functions
    function checkLoginStatus() {
        // Check if user is logged in (this would typically involve checking a token in localStorage)
        const isLoggedIn = localStorage.getItem('token') !== null;
        
        if (isLoggedIn) {
            showDashboard();
            loadDashboardData();
            setupCamera();
        } else {
            showLogin();
        }
    }
    
    function showLogin() {
        loginContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        registerFormContainer.classList.add('hidden');
    }
    
    function showRegisterForm(e) {
        e.preventDefault();
        loginForm.parentElement.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
    }
    
    function showLoginForm(e) {
        e.preventDefault();
        loginForm.parentElement.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
    }
    
    function showDashboard() {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token in localStorage (this would come from the server in a real app)
                localStorage.setItem('token', 'example-token');
                showDashboard();
                loadDashboardData();
                setupCamera();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }
    
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please log in.');
                showLoginForm(e);
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('token');
        showLogin();
    }
    
    async function loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard_data', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                updateDashboardUI(data);
            } else {
                console.error('Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Dashboard data error:', error);
        }
    }
    
    function updateDashboardUI(data) {
        // Update nutrition summary
        totalCalories.textContent = data.total_nutrition.calories.toFixed(0);
        totalProtein.textContent = data.total_nutrition.protein.toFixed(1) + 'g';
        totalCarbs.textContent = data.total_nutrition.carbs.toFixed(1) + 'g';
        totalFat.textContent = data.total_nutrition.fat.toFixed(1) + 'g';
        
        // Update recent logs
        recentLogs.innerHTML = '';
        data.recent_logs.forEach(log => {
            const li = document.createElement('li');
            li.textContent = `${log.date} - ${log.food_name} (${log.calories.toFixed(0)} cal)`;
            recentLogs.appendChild(li);
        });
    }
    
    function setupCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    cameraFeed.srcObject = stream;
                })
                .catch(error => {
                    console.error('Camera error:', error);
                    alert('Unable to access camera. Please make sure you have granted permission.');
                });
        } else {
            alert('Your browser does not support camera access.');
        }
    }
    
    function captureImage() {
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraFeed.videoWidth;
        cameraCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        cameraFeed.classList.add('hidden');
        cameraCanvas.classList.remove('hidden');
        captureBtn.classList.add('hidden');
        retryBtn.classList.remove('hidden');
        
        // Convert canvas to blob and send to server
        cameraCanvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('image', blob);
            
            // Send to server for food detection
            detectFood(formData);
        });
    }
    
    async function detectFood(formData) {
        try {
            const response = await fetch('/api/detect_food', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });
            
            if (response.ok) {
                const data = await response.json();
                displayFoodDetection(data);
            } else {
                alert('Failed to detect food. Please try again.');
                resetCamera();
            }
        } catch (error) {
            console.error('Food detection error:', error);
            alert('Error detecting food. Please try again.');
            resetCamera();
        }
    }
    
    function displayFoodDetection(data) {
        // Store current detected food for later use
        currentDetectedFood = data;
        
        // Update UI with detected food information
        foodName.textContent = data.food_name;
        foodCalories.textContent = data.nutrition.calories.toFixed(0);
        foodProtein.textContent = data.nutrition.protein.toFixed(1);
        foodCarbs.textContent = data.nutrition.carbs.toFixed(1);
        foodFat.textContent = data.nutrition.fat.toFixed(1);
        
        // Show detection result
        detectionResult.classList.remove('hidden');
    }
    
    function resetCamera() {
        cameraFeed.classList.remove('hidden');
        cameraCanvas.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        retryBtn.classList.add('hidden');
        detectionResult.classList.add('hidden');
        
        // Clear current detected food
        currentDetectedFood = null;
    }
    
    async function logFoodIntake() {
        if (!currentDetectedFood) {
            alert('No food detected to log.');
            return;
        }
        
        try {
            const response = await fetch('/api/log_food', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ food_id: currentDetectedFood.id }),
            });
            
            if (response.ok) {
                alert('Food intake logged successfully!');
                resetCamera();
                loadDashboardData(); // Refresh dashboard data
            } else {
                alert('Failed to log food intake. Please try again.');
            }
        } catch (error) {
            console.error('Food logging error:', error);
            alert('Error logging food intake. Please try again.');
        }
    }
    
    async function generateReport() {
        try {
            const response = await fetch('/api/generate_report', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                displayReport(data);
            } else {
                alert('Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Report generation error:', error);
            alert('Error generating report. Please try again.');
        }
    }
    
    function displayReport(data) {
        reportContent.innerHTML = '';
        reportContent.classList.remove('hidden');
        
        // Create report HTML
        const reportTitle = document.createElement('h3');
        reportTitle.textContent = 'Nutrition Report';
        reportContent.appendChild(reportTitle);
        
        const dateRange = document.createElement('p');
        dateRange.textContent = `Date Range: ${data.startDate} to ${data.endDate}`;
        reportContent.appendChild(dateRange);
        
        // Create averages section
        const averagesTitle = document.createElement('h4');
        averagesTitle.textContent = 'Daily Averages';
        reportContent.appendChild(averagesTitle);
        
        const averagesTable = document.createElement('table');
        averagesTable.classList.add('report-table');
        
        const averagesHeader = document.createElement('tr');
        ['Metric', 'Average', 'Recommended', 'Status'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            averagesHeader.appendChild(th);
        });
        averagesTable.appendChild(averagesHeader);
        
        // Add rows for each nutrient
        addNutrientRow(averagesTable, 'Calories', data.averages.calories, data.recommendations.calories);
        addNutrientRow(averagesTable, 'Protein', data.averages.protein, data.recommendations.protein, 'g');
        addNutrientRow(averagesTable, 'Carbs', data.averages.carbs, data.recommendations.carbs, 'g');
        addNutrientRow(averagesTable, 'Fat', data.averages.fat, data.recommendations.fat, 'g');
        
        reportContent.appendChild(averagesTable);
        
        // Create trends section
        const trendsTitle = document.createElement('h4');
        trendsTitle.textContent = 'Nutrition Trends';
        reportContent.appendChild(trendsTitle);
        
        const trendsParagraph = document.createElement('p');
        trendsParagraph.textContent = data.trends;
        reportContent.appendChild(trendsParagraph);
        
        // Create recommendations section
        const recommendationsTitle = document.createElement('h4');
        recommendationsTitle.textContent = 'Recommendations';
        reportContent.appendChild(recommendationsTitle);
        
        const recommendationsList = document.createElement('ul');
        data.recommendations.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            recommendationsList.appendChild(li);
        });
        reportContent.appendChild(recommendationsList);
        
        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Report (PDF)';
        downloadBtn.addEventListener('click', () => downloadReport(data));
        reportContent.appendChild(downloadBtn);
    }
    
    function addNutrientRow(table, name, average, recommended, unit = '') {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        const averageCell = document.createElement('td');
        averageCell.textContent = average.toFixed(1) + unit;
        row.appendChild(averageCell);
        
        const recommendedCell = document.createElement('td');
        recommendedCell.textContent = recommended.toFixed(1) + unit;
        row.appendChild(recommendedCell);
        
        const statusCell = document.createElement('td');
        const percentage = (average / recommended) * 100;
        
        if (percentage < 80) {
            statusCell.textContent = 'Low';
            statusCell.classList.add('status-low');
        } else if (percentage > 120) {
            statusCell.textContent = 'High';
            statusCell.classList.add('status-high');
        } else {
            statusCell.textContent = 'Good';
            statusCell.classList.add('status-good');
        }
        
        row.appendChild(statusCell);
        table.appendChild(row);
    }
    
    function downloadReport(data) {
        // In a real application, this would generate a PDF
        alert('PDF download functionality would be implemented here.');
        // This would typically involve calling a server endpoint to generate the PDF
    }
});
