// Scripts Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - Starting script loading...");
  loadScripts();
});

async function loadScripts() {
  const container = document.getElementById("scripts-container");

  console.log("Container element:", container);

  if (!container) {
    console.error("scripts-container element not found!");
    return;
  }

  try {
    // Fetch all three game lists
    const [freeResponse, premiumResponse, discontinuedResponse] = await Promise.all([
      fetch('https://raw.githubusercontent.com/Ken-884/roblox/refs/heads/main/gamelist.lua'),
      fetch('https://raw.githubusercontent.com/Ken-884/roblox/refs/heads/main/premium/gamelist.lua'),
      fetch('https://raw.githubusercontent.com/Ken-884/roblox/refs/heads/main/discontinued.lua')
    ]);

    const [freeCode, premiumCode, discontinuedCode] = await Promise.all([
      freeResponse.text(),
      premiumResponse.text(),
      discontinuedResponse.text()
    ]);

    // Parse discontinued IDs
    const discontinuedIds = parseDiscontinuedList(discontinuedCode);
    
    // Parse each list
    const freeGames = parseLuaGameList(freeCode, 'Free');
    const premiumGames = parseLuaGameList(premiumCode, 'Premium');

    // Merge games intelligently
    const gamesMap = new Map();
    const gamesByUrl = new Map(); // Track URLs we've seen
    
    // Process free games first
    freeGames.forEach(game => {
      const key = `${game.id}-${game.scriptUrl}`;
      game.type = discontinuedIds.has(game.id) ? 'Discontinued' : 'Free';
      game.status = discontinuedIds.has(game.id) ? 'Discontinued' : 'Working';
      gamesMap.set(key, game);
      gamesByUrl.set(game.scriptUrl, game);
    });
    
    // Process premium games
    premiumGames.forEach(game => {
      const key = `${game.id}-${game.scriptUrl}`;
      
      // Check if this exact URL already exists (same URL = only show as Free)
      if (gamesByUrl.has(game.scriptUrl)) {
        // Same URL already in free, skip it
        return;
      }
      
      // Different URL, add as Premium
      game.type = discontinuedIds.has(game.id) ? 'Discontinued' : 'Premium';
      game.status = discontinuedIds.has(game.id) ? 'Discontinued' : 'Working';
      gamesMap.set(key, game);
      gamesByUrl.set(game.scriptUrl, game);
    });

    // Convert to array
    const allGames = Array.from(gamesMap.values());
    
    // Combine games with same name but different URLs for display
    const gamesByName = new Map();
    
    allGames.forEach(game => {
      if (gamesByName.has(game.name)) {
        // Game with same name exists, add URL to existing card
        const existing = gamesByName.get(game.name);
        if (!existing.additionalUrls) {
          existing.additionalUrls = [];
        }
        existing.additionalUrls.push({
          url: game.scriptUrl,
          type: game.type
        });
        // Update badge to show both types
        if (game.type === 'Premium' && existing.type === 'Free') {
          existing.displayType = 'Free & Premium';
        }
      } else {
        const gameCopy = {...game};
        gameCopy.displayType = game.type;
        gamesByName.set(game.name, gameCopy);
      }
    });
    
    const combinedGames = Array.from(gamesByName.values());
    
    // Store both versions in cache
    allGamesCache = allGames;  // Keep original for filtering
    allGamesCombined = combinedGames;  // Combined version for display

    console.log('Total unique games loaded:', combinedGames.length);
    console.log('Games:', combinedGames);

    // Clear loading spinner
    container.innerHTML = "";

    // Create script cards (combined by default)
    combinedGames.forEach((game, index) => {
      console.log(`Creating card ${index + 1}:`, game.name, `(${game.displayType})`);
      const card = createScriptCard(game);
      container.appendChild(card);
    });

    console.log("All cards created successfully!");
  } catch (error) {
    console.error("Error loading scripts:", error);
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load scripts. Please try again later.</p>
            </div>
        `;
  }
}

function parseDiscontinuedList(luaCode) {
  const discontinuedIds = new Set();
  const pattern = /\["(\d+)"\]\s*=\s*true/g;
  let match;
  
  while ((match = pattern.exec(luaCode)) !== null) {
    discontinuedIds.add(match[1]);
  }
  
  return discontinuedIds;
}

function parseLuaGameList(luaCode, type = 'Free') {
  const games = [];

  // Split into lines to process comments
  const lines = luaCode.split('\n');
  let currentComment = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for comment with game name
    const commentMatch = line.match(/--\s*(.+)/);
    if (commentMatch) {
      currentComment = commentMatch[1].trim();
    }
    
    // Check for game entry
    const entryMatch = line.match(/\["(\d+)"\]\s*=\s*"([^"]+)"/);
    if (entryMatch) {
      const gameId = entryMatch[1];
      const scriptUrl = entryMatch[2];
      
      // Use comment name if available, otherwise extract from URL
      let gameName = currentComment;
      if (!gameName || gameName === '') {
        const nameMatch = scriptUrl.match(/Script_([^.]+)\.lua/);
        gameName = nameMatch
          ? nameMatch[1].replace(/([A-Z])/g, " $1").trim()
          : "Unknown Game";
      }

      games.push({
        id: gameId,
        name: gameName,
        scriptUrl: scriptUrl,
        status: type === 'Discontinued' ? 'Discontinued' : 'Working',
        type: type,
        universeId: gameId
      });
      
      currentComment = ''; // Reset after use
    }
  }

  return games;
}


function createScriptCard(game) {
    const card = document.createElement("div");
    card.className = "script-card";
    card.dataset.scriptId = game.id; // Store script ID for detail page
    
    // Make card clickable to go to detail page
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on buttons
        if (e.target.closest('button')) {
            return;
        }
        window.location.href = `script-detail.html?id=${game.id}`;
    });
    
    card.innerHTML = `
        <div class="script-thumbnail">
            <img src="https://via.placeholder.com/400x225/1a1f2e/10b981?text=${encodeURIComponent(game.name)}" 
                 alt="${game.name}" 
                 class="game-thumbnail">
            <span class="script-type type-${game.displayType.toLowerCase().replace(/\s+/g, '-')}">${game.displayType}</span>
        </div>
        <div class="script-info">
            <div class="script-name">${game.name}</div>
            <div class="script-actions">
                ${game.displayType !== 'Discontinued' ? `
                    <button class="btn btn-primary" onclick="event.stopPropagation(); copyScript('${game.id}')">
                        <i class="fas fa-copy"></i>
                        <span>Copy</span>
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); getKey()">
                        <i class="fas fa-key"></i>
                        <span>Get key</span>
                    </button>
                ` : `
                    <button class="btn btn-secondary" disabled>
                        <i class="fas fa-ban"></i>
                        <span>Discontinued</span>
                    </button>
                `}
            </div>
        </div>
    `;
    
    // Fetch the actual thumbnail URL from Roblox API
    if (game.universeId) {
        fetchGameThumbnail(game.universeId, card);
    }
    
    return card;
}

async function fetchGameThumbnail(universeId, card) {
    try {
        // Use CORS proxy to bypass CORS restrictions
        const apiUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
        const corsProxy = 'https://corsproxy.io/?';
        const response = await fetch(corsProxy + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
            const imgElement = card.querySelector('.game-thumbnail');
            if (imgElement) {
                // Create a new image to preload
                const img = new Image();
                img.onload = function() {
                    imgElement.src = data.data[0].imageUrl;
                    // Add loaded class for fade-in animation
                    setTimeout(() => {
                        imgElement.classList.add('loaded');
                    }, 50);
                };
                img.src = data.data[0].imageUrl;
            }
        }
    } catch (error) {
        console.error(`Failed to fetch thumbnail for universe ${universeId}:`, error);
        // Image will remain as placeholder on error
    }
}

function copyScript(scriptUrl) {
  const loaderScript = `loadstring(game:HttpGet("https://api.junkie-development.de/api/v1/luascripts/public/8ac2e97282ac0718aeeb3bb3856a2821d71dc9e57553690ab508ebdb0d1569da/download"))()`;

  navigator.clipboard
    .writeText(loaderScript)
    .then(() => {
      showNotification("Script copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showNotification("Failed to copy script", "error");
    });
}

function copyLoader() {
  const loaderCode = document.getElementById("loader-code").textContent;

  navigator.clipboard
    .writeText(loaderCode)
    .then(() => {
      showNotification("Loader copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showNotification("Failed to copy loader", "error");
    });
}

function getKey() {
    // Use centralized configuration if available
    if (window.API_CONFIG && window.API_CONFIG.keySystemUrl) {
        window.open(window.API_CONFIG.keySystemUrl, '_blank');
    } else {
        // Fallback or redirect to get key page if config missing
        window.location.href = 'getkey.html';
    }
}

function showNotification(message, type = "success") {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

let currentFilter = 'all';
let allGamesCache = [];
let allGamesCombined = [];

function filterScripts(filter) {
  currentFilter = filter;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add('active');
  
  const container = document.getElementById('scripts-container');
  container.innerHTML = '';
  
  let filteredGames;
  
  if (filter === 'all') {
    // Show combined version
    filteredGames = allGamesCombined;
  } else {
    // Filter by type from original list (not combined)
    filteredGames = allGamesCache.filter(game => game.type.toLowerCase() === filter);
  }
  
  console.log(`Filtering by: ${filter}, showing ${filteredGames.length} games`);
  
  // Create cards
  filteredGames.forEach(game => {
    const card = createScriptCard(game);
    container.appendChild(card);
  });
  
  if (filteredGames.length === 0) {
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-search"></i>
        <p>No ${filter} scripts found.</p>
      </div>
    `;
  }
}
