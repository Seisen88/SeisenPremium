// Script Detail Page - Display detailed information about a specific script

document.addEventListener('DOMContentLoaded', function() {
    loadScriptDetails();
});

function loadScriptDetails() {
    // Get script ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');
    
    if (!scriptId) {
        window.location.href = 'scripts.html';
        return;
    }
    
    // Find the script in the scripts data
    const script = window.SCRIPTS_DATA?.find(s => s.id === scriptId);
    
    if (!script) {
        window.location.href = 'scripts.html';
        return;
    }
    
    // Populate the page with script data
    displayScriptDetails(script);
}

function displayScriptDetails(script) {
    // Update page title
    document.title = `${script.name} - Seisen`;
    
    // Set thumbnail
    const thumbnail = document.getElementById('script-thumbnail');
    if (thumbnail) {
        thumbnail.src = script.thumbnail;
        thumbnail.alt = script.name;
    }
    
    // Set badge
    const badge = document.getElementById('script-badge');
    if (badge) {
        badge.textContent = script.type;
        badge.className = `script-detail-badge type-${script.type.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    // Set title and game name
    document.getElementById('script-title').textContent = script.name;
    document.getElementById('script-game').textContent = script.game;
    
    // Set metadata
    document.getElementById('script-updated').textContent = script.updated;
    document.getElementById('script-downloads').textContent = formatNumber(script.downloads || 0);
    
    // Set description
    const descriptionEl = document.getElementById('script-description');
    if (script.description) {
        descriptionEl.innerHTML = `<p>${script.description}</p>`;
    } else {
        descriptionEl.innerHTML = `<p>This is a premium script for ${script.game}. Get access to exclusive features and enhance your gameplay experience.</p>`;
    }
    
    // Display features
    displayFeatures(script.features || getDefaultFeatures(script));
    
    // Set up copy button
    const copyBtn = document.getElementById('copy-script-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyScriptToClipboard(script));
    }
}

function displayFeatures(features) {
    const featuresContainer = document.getElementById('features-list');
    featuresContainer.innerHTML = '';
    
    features.forEach(feature => {
        const featureCard = document.createElement('div');
        featureCard.className = 'feature-card';
        featureCard.innerHTML = `
            <div class="feature-icon">
                <i class="${feature.icon || 'fas fa-check-circle'}"></i>
            </div>
            <div class="feature-content">
                <h3>${feature.name}</h3>
                <p>${feature.description || ''}</p>
            </div>
        `;
        featuresContainer.appendChild(featureCard);
    });
}

function getDefaultFeatures(script) {
    // Default features if none are specified
    return [
        {
            name: 'Auto Farm',
            description: 'Automatically farm resources and level up',
            icon: 'fas fa-robot'
        },
        {
            name: 'ESP/Wallhack',
            description: 'See players and items through walls',
            icon: 'fas fa-eye'
        },
        {
            name: 'Speed Boost',
            description: 'Increase your movement speed',
            icon: 'fas fa-running'
        },
        {
            name: 'Teleport',
            description: 'Instantly teleport to any location',
            icon: 'fas fa-location-arrow'
        },
        {
            name: 'God Mode',
            description: 'Become invincible to damage',
            icon: 'fas fa-shield-alt'
        },
        {
            name: 'Infinite Resources',
            description: 'Get unlimited in-game currency',
            icon: 'fas fa-coins'
        }
    ];
}

function copyScriptToClipboard(script) {
    const scriptCode = `loadstring(game:HttpGet("https://raw.githubusercontent.com/Seisen88/scripts/main/${script.id}.lua"))()`;
    
    navigator.clipboard.writeText(scriptCode).then(() => {
        showNotification('Script copied to clipboard!', 'success');
        
        // Update button temporarily
        const btn = document.getElementById('copy-script-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    }).catch(err => {
        showNotification('Failed to copy script', 'error');
        console.error('Copy failed:', err);
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
