document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const resumeUpload = document.getElementById('resumeUpload');
    const essayEditor = document.querySelector('.essay-editor');

    const STAGES = ['planning-stage', 'writing-stage', 'feedback-stage'];
    const progressSteps = document.querySelectorAll('.progress-step');
    let currentStageIndex = 0;

    // Add Intersection Observer for side navigation
    const sections = document.querySelectorAll('.card');
    const sectionBtns = document.querySelectorAll('.section-btn');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -70% 0px',  // Adjusted margins for better activation points
        threshold: 0
    };

    // Flag to prevent observer from firing during click-based scrolling
    let isScrollingToSection = false;

    const observer = new IntersectionObserver((entries) => {
        if (!isScrollingToSection) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    // Update side navigation
                    sectionBtns.forEach(btn => {
                        if (btn.dataset.section === sectionId) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            });
        }
    }, observerOptions);

    // Observe all sections including topics section
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        observer.observe(section);
    });

    // Side navigation click handlers
    sectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state of buttons
            sectionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Scroll to section
            const sectionId = btn.dataset.section;
            const section = document.getElementById(sectionId);
            if (section) {
                isScrollingToSection = true;
                
                // Calculate scroll position with offset for nav bar
                const navHeight = document.querySelector('nav').offsetHeight;
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navHeight - 20; // Added 20px padding
                
                window.scrollTo({
                    top: sectionTop,
                    behavior: 'smooth'
                });
                
                // Reset flag after animation completes
                setTimeout(() => {
                    isScrollingToSection = false;
                }, 1000);
            }
        });
    });

    // Update progress navigation
    function updateProgress(stageName) {
        const progressSteps = document.querySelectorAll('.progress-step');
        const stages = ['planning-stage', 'writing-stage', 'feedback-stage'];
        const currentIndex = stages.indexOf(stageName);
        
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'current', 'completed');
            
            if (index === currentIndex) {
                step.classList.add('current');
            } else if (index < currentIndex) {
                step.classList.add('completed');
            }
        });

        // Update progress line
        const progressContainer = document.querySelector('.progress-steps');
        const stageForAttribute = stageName.replace('-stage', '');
        progressContainer.setAttribute('data-current', stageForAttribute);
    }

    function showStage(stageName) {
        // Hide all stages
        document.querySelectorAll('.stage-container').forEach(stage => {
            if (stage.id === stageName) {
                stage.classList.remove('hidden');
                
                // If moving to writing stage, transfer the prompt
                if (stageName === 'writing-stage') {
                    const essayPrompt = document.getElementById('essayPrompt');
                    const selectedPrompt = document.getElementById('selectedPrompt');
                    if (essayPrompt && selectedPrompt) {
                        selectedPrompt.textContent = essayPrompt.value.trim() || 'No prompt entered';
                    }
                }
            } else {
                stage.classList.add('hidden');
            }
        });

        // Update progress
        updateProgress(stageName);
    }

    // Progress step click handlers
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.addEventListener('click', () => {
            const stages = ['planning-stage', 'writing-stage', 'feedback-stage'];
            showStage(stages[index]);
        });
    });

    // Next button handlers
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const stages = ['planning-stage', 'writing-stage', 'feedback-stage'];
            const currentStage = document.querySelector('.stage-container:not(.hidden)');
            const currentIndex = stages.indexOf(currentStage.id);
            
            if (currentIndex < stages.length - 1) {
                showStage(stages[currentIndex + 1]);
            }
        });
    });

    // Initialize first stage
    showStage('planning-stage');

    // Update the counter function
    function updateCounts() {
        const editor = document.querySelector('.essay-editor');
        const wordCountDisplay = document.getElementById('wordCount');
        const charCountDisplay = document.getElementById('charCount');
        
        const text = editor.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        wordCountDisplay.textContent = `${words} words`;
        charCountDisplay.textContent = `${chars} characters`;
    }

    // Update event listener
    document.querySelector('.essay-editor')?.addEventListener('input', () => {
        updateCounts();
        updatePromptAdherence();
    });

    // Initialize counts
    updateCounts();

    // For essay draft autosave
    let essayTimeout;
    essayEditor?.addEventListener('input', () => {
        clearTimeout(essayTimeout);
        essayTimeout = setTimeout(() => {
            localStorage.setItem('essayDraft', essayEditor.value);
        }, 1000);
    });

    // Load saved draft
    const savedDraft = localStorage.getItem('essayDraft');
    if (savedDraft) {
        essayEditor.value = savedDraft;
    }

    // Chat functionality
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');

    function addMessage(content, isUser = false) {
        const message = document.createElement('div');
        message.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageHTML = isUser 
            ? `<div class="message-content">${content}</div>`
            : `<div class="bot-avatar">🤖</div><div class="message-content">${content}</div>`;
        
        message.innerHTML = messageHTML;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(content) {
        addMessage(content, false);
    }

    function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        userInput.value = '';
        
        // Analyze message and potentially add suggestions
        analyzeMessageForSuggestions(message);
        
        // Simulate bot response
        setTimeout(() => {
            const response = generateBotResponse(message);
            addBotMessage(response);
        }, 1000);
    }

    if (userInput && sendMessage) {
        sendMessage.addEventListener('click', handleUserMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserMessage();
            }
        });
    }

    function generateBotResponse(message) {
        // This is where you'd integrate with a real AI service
        // For now, we'll use simple responses
        const responses = [
            "That's interesting! Could you tell me more about that experience?",
            "How did that experience change your perspective?",
            "What specific challenges did you face in that situation?",
            "That could make a compelling essay topic. Would you like to explore it further?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Add this after the existing chat and resume handling functions
    const suggestionsContainer = document.getElementById('topicSuggestions');
    let currentSuggestions = new Set();

    function addSuggestion(topic, source) {
        if (currentSuggestions.has(topic)) return;
        
        currentSuggestions.add(topic);
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';
        suggestionElement.innerHTML = `
            <div class="suggestion-content">
                <h3>${topic}</h3>
                <p class="suggestion-source">${source}</p>
            </div>
            <button class="use-topic-btn">Use This Topic</button>
        `;
        
        // Animate the suggestion entry
        suggestionElement.style.animation = 'slideFadeIn 0.5s ease-out';
        suggestionsContainer.prepend(suggestionElement);
    }

    // Update the resume handler function
    function handleResumeUpload(file) {
        const uploadContent = uploadArea.querySelector('.upload-content');
        const relevantActivities = document.getElementById('relevantActivities');
        
        // Show loading state with spinner and progress bar
        uploadContent.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Analyzing ${file.name}...</p>
            <div class="analysis-progress">
                <div class="progress-bar"></div>
            </div>
        `;

        // Start progress animation
        const progressBar = uploadContent.querySelector('.progress-bar');
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
        
        // Simulate resume analysis
        setTimeout(() => {
            const promptText = document.getElementById('essayPrompt').value.trim();
            const activities = analyzeResumeActivities(promptText);
            
            // Display relevant activities
            const activitiesList = relevantActivities.querySelector('.activities-list');
            activitiesList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-relevance">
                        ${activity.relevance}
                        <span class="relevance-score">${activity.score}% match</span>
                    </div>
                </div>
            `).join('');
            
            // Show the activities section
            relevantActivities.classList.remove('hidden');
            
            // Show success state
            uploadContent.innerHTML = `
                <div class="upload-icon">✅</div>
                <p>Resume analyzed successfully!</p>
            `;
            
            // Add suggestions based on analysis
            addBotMessage("I've analyzed your resume and the essay prompt. Here are some relevant experiences you might want to write about:");
        }, 2000);
    }

    // Add this function to analyze resume content against prompt
    function analyzeResumeActivities(promptText) {
        // This is a mock function - in reality, this would use NLP to analyze
        // the resume content against the prompt
        return [
            {
                title: "Leadership Role in Student Government",
                relevance: "Shows leadership and community impact",
                score: 95
            },
            {
                title: "Research Project on Climate Change",
                relevance: "Demonstrates problem-solving and dedication",
                score: 85
            },
            {
                title: "Volunteer Work at Local Shelter",
                relevance: "Illustrates community service and empathy",
                score: 80
            }
        ];
    }

    // Update the chat handler to generate suggestions based on conversation
    function analyzeMessageForSuggestions(message) {
        // This would normally use NLP to analyze the message
        // For now, we'll use simple keyword matching
        const keywords = {
            'challenge': 'Overcoming Personal Challenges',
            'learn': 'Personal Growth Through Learning',
            'help': 'Community Impact and Service',
            'change': 'Transformative Experiences',
            'family': 'Family Influence and Values',
            'passion': 'Pursuing Your Passions'
        };
        
        Object.entries(keywords).forEach(([keyword, topic]) => {
            if (message.toLowerCase().includes(keyword)) {
                addSuggestion(topic, "Based on our conversation");
            }
        });
    }

    // Add some CSS for the new animations and styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideFadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .suggestion-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: var(--background-color);
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            transition: all 0.2s;
        }

        .suggestion-content {
            flex-grow: 1;
        }

        .suggestion-content h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--text-color);
        }

        .suggestion-source {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0.25rem 0 0 0;
        }

        .use-topic-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: opacity 0.2s;
        }

        .use-topic-btn:hover {
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);

    // Move these declarations to the top of your DOMContentLoaded event
    const notesBtn = document.querySelector('.notes-btn');
    const notesPopup = document.getElementById('notesPopup');
    const closeNotesBtn = document.querySelector('.close-notes');
    const saveNotesBtn = document.querySelector('.save-notes');
    const notesTextarea = document.getElementById('userNotes');
    const essayPrompt = document.getElementById('essayPrompt');
    const analyzePromptBtn = document.getElementById('analyzePrompt');
    const clearPromptBtn = document.getElementById('clearPrompt');

    // Notes functionality
    if (notesBtn && notesPopup) {
        // Load saved notes
        const savedNotes = localStorage.getItem('userNotes');
        if (savedNotes) {
            notesTextarea.value = savedNotes;
        }

        notesBtn.addEventListener('click', () => {
            notesPopup.classList.add('active');
            notesTextarea.focus();
        });

        closeNotesBtn.addEventListener('click', () => {
            notesPopup.classList.remove('active');
        });

        notesPopup.addEventListener('click', (e) => {
            if (e.target === notesPopup) {
                notesPopup.classList.remove('active');
            }
        });
    }

    // Save notes
    saveNotesBtn.addEventListener('click', () => {
        localStorage.setItem('userNotes', notesTextarea.value);
        notesPopup.classList.remove('active');
    });

    // For notes autosave
    let notesTimeout;
    notesTextarea.addEventListener('input', () => {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(() => {
            localStorage.setItem('userNotes', notesTextarea.value);
        }, 1000);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && notesPopup.classList.contains('active')) {
            notesPopup.classList.remove('active');
        }
    });

    // Add to your existing JavaScript
    function updateWritingStage(prompt) {
        const promptDisplay = document.querySelector('#selectedPrompt');
        if (promptDisplay) {
            promptDisplay.textContent = prompt || 'No prompt selected';
        }
    }

    // Update progress based on content
    function updatePromptAdherence() {
        const editor = document.querySelector('.essay-editor');
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        // This would normally use NLP to analyze content against prompt
        // For now, we'll use a simple length-based calculation
        const content = editor.value.trim();
        const percentage = Math.min(Math.floor(content.length / 10), 100);
        
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }

    // Also update when clicking "Continue to Writing" button
    document.querySelector('.suggestions-card .next-btn')?.addEventListener('click', () => {
        const essayPrompt = document.getElementById('essayPrompt');
        const selectedPrompt = document.getElementById('selectedPrompt');
        if (essayPrompt && selectedPrompt) {
            selectedPrompt.textContent = essayPrompt.value.trim() || 'No prompt entered';
        }
    });

    // Prompt analysis functionality
    if (analyzePromptBtn && clearPromptBtn) {
        analyzePromptBtn.addEventListener('click', () => {
            const promptText = essayPrompt.value.trim();
            if (!promptText) {
                alert('Please enter an essay prompt first.');
                return;
            }
            
            const analysisDiv = document.getElementById('promptAnalysis');
            analysisDiv.innerHTML = '<p>Analyzing prompt...</p>';
            
            setTimeout(() => {
                const analysis = `
                    <h3>Key Elements:</h3>
                    <ul>
                        <li><span class="analysis-highlight">Type:</span> Personal reflection</li>
                        <li><span class="analysis-highlight">Focus:</span> Individual growth or experience</li>
                        <li><span class="analysis-highlight">Time frame:</span> Specific moment or period</li>
                    </ul>
                    <h3>Suggested Approaches:</h3>
                    <ul>
                        <li>Consider a moment of personal transformation</li>
                        <li>Focus on the learning outcome</li>
                        <li>Include specific details and reflection</li>
                    </ul>
                `;
                
                analysisDiv.innerHTML = analysis;
                
                // Add suggestions based on the analysis
                addSuggestion(
                    "Personal Growth Story",
                    "Based on prompt analysis"
                );
                
                addSuggestion(
                    "Key Learning Moment",
                    "Matches prompt requirements"
                );
                
                // Add a bot message about the analysis
                addBotMessage("I've analyzed the prompt. Would you like to explore any of these suggested approaches?");
            }, 1500);
        });

        clearPromptBtn.addEventListener('click', () => {
            essayPrompt.value = '';
            essayPrompt.focus();
        });
    }

    // Add resume upload event listeners
    if (uploadArea && resumeUpload) {
        uploadArea.addEventListener('click', () => {
            resumeUpload.click();
        });

        resumeUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleResumeUpload(file);
            }
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                handleResumeUpload(file);
            }
        });
    }

    // Essay management
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    const essayList = document.getElementById('essayList');
    const clearEssaysBtn = document.querySelector('.clear-essays-btn');

    // Load saved essays from localStorage
    let savedEssays = JSON.parse(localStorage.getItem('savedEssays')) || [];
    let currentEssayId = localStorage.getItem('currentEssayId');

    function saveNewEssay(prompt) {
        const newEssay = {
            id: Date.now().toString(),
            prompt: prompt,
            date: new Date().toLocaleDateString(),
            content: '',  // For the actual essay content
            stage: 'planning'  // Track which stage the essay is in
        };

        savedEssays.unshift(newEssay);
        currentEssayId = newEssay.id;
        
        localStorage.setItem('savedEssays', JSON.stringify(savedEssays));
        localStorage.setItem('currentEssayId', currentEssayId);
        
        updateEssayList();
    }

    function updateEssayList() {
        essayList.innerHTML = savedEssays.map(essay => `
            <div class="essay-item ${essay.id === currentEssayId ? 'active' : ''}" 
                 data-essay-id="${essay.id}">
                <div class="essay-title">${essay.prompt.substring(0, 50)}${essay.prompt.length > 50 ? '...' : ''}</div>
                <div class="essay-date">${essay.date}</div>
            </div>
        `).join('');

        // Add click handlers to essay items
        document.querySelectorAll('.essay-item').forEach(item => {
            item.addEventListener('click', () => {
                const essayId = item.dataset.essayId;
                loadEssay(essayId);
            });
        });
    }

    function loadEssay(essayId) {
        const essay = savedEssays.find(e => e.id === essayId);
        if (essay) {
            currentEssayId = essayId;
            localStorage.setItem('currentEssayId', currentEssayId);
            
            // Update UI with essay data
            document.getElementById('essayPrompt').value = essay.prompt;
            document.getElementById('selectedPrompt').textContent = essay.prompt;
            
            // Switch to appropriate stage
            showStage(`${essay.stage}-stage`);
            
            // Close dropdown
            menuDropdown.classList.add('hidden');
            
            // Update essay list to show active state
            updateEssayList();
        }
    }

    // Toggle menu dropdown
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            menuDropdown.classList.add('hidden');
        }
    });

    // Clear all essays
    clearEssaysBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved essays?')) {
            savedEssays = [];
            currentEssayId = null;
            localStorage.removeItem('savedEssays');
            localStorage.removeItem('currentEssayId');
            updateEssayList();
        }
    });

    // Update the analyze prompt button to save the essay
    analyzePromptBtn.addEventListener('click', () => {
        const promptText = essayPrompt.value.trim();
        if (promptText && !savedEssays.some(essay => essay.prompt === promptText)) {
            saveNewEssay(promptText);
        }
        // ... rest of your existing analyze prompt code ...
    });

    // Initial load
    updateEssayList();

    // Feedback tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => {
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // Update stats when essay content changes
    const essayContent = document.querySelector('.essay-content');
    
    function updateStats() {
        const text = essayContent.textContent;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const sentences = text.split(/[.!?]+/).length - 1;
        const paragraphs = text.split(/\n\s*\n/).length;
        
        document.querySelector('#stats-tab .stat-value:nth-child(2)').textContent = words;
        document.querySelector('#stats-tab .stat-value:nth-child(3)').textContent = chars;
        document.querySelector('#stats-tab .stat-value:nth-child(4)').textContent = sentences;
        document.querySelector('#stats-tab .stat-value:nth-child(5)').textContent = paragraphs;
    }

    essayContent?.addEventListener('input', updateStats);
}); 