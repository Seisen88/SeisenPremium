// Loading Screen Initialization
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    
    let progress = 0;
    const loadingBar = document.querySelector('.loading-bar');
    const loadingText = document.querySelector('.loading-text');
    
    const messages = [
        'Loading...',
        'Initializing...',
        'Almost ready...',
        'Welcome!'
    ];
    
    let messageIndex = 0;
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Hide loading screen after completion
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 300);
        }
        
        if (loadingBar) {
            loadingBar.style.width = progress + '%';
        }
        
        // Update loading text
        if (progress > 25 && messageIndex === 0) {
            messageIndex = 1;
            if (loadingText) loadingText.textContent = messages[1];
        } else if (progress > 60 && messageIndex === 1) {
            messageIndex = 2;
            if (loadingText) loadingText.textContent = messages[2];
        } else if (progress >= 90 && messageIndex === 2) {
            messageIndex = 3;
            if (loadingText) loadingText.textContent = messages[3];
        }
    }, 200);
}
