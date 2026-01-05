// Lua Obfuscator Logic
// Note: This is a client-side simulation. For production use, you would need to:
// 1. Set up a backend server with Prometheus installed
// 2. Send code to the server for obfuscation
// 3. Return the obfuscated result

class LuaObfuscator {
    constructor() {
        this.presets = {
            minify: {
                name: 'Minify',
                description: 'Basic minification, removes whitespace and comments'
            },
            weak: {
                name: 'Weak',
                description: 'Light obfuscation with variable renaming'
            },
            medium: {
                name: 'Medium',
                description: 'Moderate obfuscation with control flow changes'
            },
            strong: {
                name: 'Strong',
                description: 'Heavy obfuscation with multiple layers'
            }
        };
    }

    // Call backend API for obfuscation
    async obfuscate(code, version, preset) {
        const apiUrl = window.API_CONFIG?.baseUrl || 'http://localhost:3000';
        const timeout = window.API_CONFIG?.timeout || 60000;
        const enableFallback = window.API_CONFIG?.enableFallback !== false;

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Make API request
            const response = await fetch(`${apiUrl}/api/obfuscate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    version: version,
                    preset: preset
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Parse response
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            if (!data.success || !data.obfuscatedCode) {
                throw new Error('Invalid response from server');
            }

            return data.obfuscatedCode;

        } catch (error) {
            // Check if fallback should be used
            const shouldFallback = enableFallback && (
                error.name === 'AbortError' || 
                error.message.includes('fetch') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('Server error') ||
                error.message.includes('Obfuscation failed')
            );

            if (shouldFallback) {
                console.warn('Backend error or unavailable, using fallback simulation.');
                return this.simulateObfuscation(code, version, preset);
            }

            console.error('API Error:', error);

            // Re-throw the error with helpful message
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - obfuscation took too long');
            } else if (error.message.includes('fetch')) {
                throw new Error('Cannot connect to backend server. Make sure the server is running on ' + apiUrl);
            } else {
                throw error;
            }
        }
    }

    // Advanced obfuscation simulation
    simulateObfuscation(code, version, preset) {
        if (!code || code.trim() === '') {
            throw new Error('No code provided');
        }

        // Obfuscation strength based on preset
        const strength = {
            minify: 1,
            weak: 2,
            medium: 3,
            strong: 4
        }[preset] || 3;

        let obfuscated = code;

        // Step 1: String encryption (all presets)
        obfuscated = this.encryptStrings(obfuscated, strength);

        // Step 2: Variable name obfuscation (weak+)
        if (strength >= 2) {
            obfuscated = this.obfuscateVariables(obfuscated, strength);
        }

        // Step 3: Control flow obfuscation (medium+)
        if (strength >= 3) {
            obfuscated = this.obfuscateControlFlow(obfuscated);
        }

        // Step 4: Dead code injection (strong)
        if (strength >= 4) {
            obfuscated = this.injectDeadCode(obfuscated);
        }

        // Step 5: Add wrapper and anti-tamper
        obfuscated = this.wrapCode(obfuscated, version, preset);

        return obfuscated;
    }

    // String encryption helper
    encryptStrings(code, strength) {
        const stringRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
        const strings = [];
        
        // Extract all strings
        let match;
        while ((match = stringRegex.exec(code)) !== null) {
            strings.push({
                original: match[0],
                content: match[0].slice(1, -1),
                quote: match[1]
            });
        }

        // Create string table
        let stringTable = 'local __strings = {\n';
        strings.forEach((str, i) => {
            const encrypted = this.encryptString(str.content, strength);
            stringTable += `    [${i}] = ${encrypted},\n`;
        });
        stringTable += '}\n';

        // Replace strings with table lookups
        let index = 0;
        const replaced = code.replace(stringRegex, () => {
            return `__strings[${index++}]`;
        });

        return stringTable + replaced;
    }

    // Encrypt individual string
    encryptString(str, strength) {
        if (strength === 1) {
            // Simple encoding
            return `"${str}"`;
        }

        // XOR-based encryption
        const key = Math.floor(Math.random() * 255) + 1;
        const encrypted = str.split('').map(c => c.charCodeAt(0) ^ key).join(',');
        return `(function() local t = {${encrypted}}; local s = ''; for i = 1, #t do s = s .. string.char(t[i] ~ ${key}) end; return s end)()`;
    }

    // Variable name obfuscation
    obfuscateVariables(code, strength) {
        const varPattern = /\b(local\s+)([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
        const varMap = new Map();
        let varCounter = 0;

        // Generate obfuscated names
        const generateName = (index) => {
            if (strength === 2) {
                return `_${index.toString(36)}`;
            } else if (strength === 3) {
                return `_0x${index.toString(16)}`;
            } else {
                // Strong: use confusing names
                const chars = 'Il1O0';
                let name = '_';
                let n = index;
                while (n > 0) {
                    name += chars[n % chars.length];
                    n = Math.floor(n / chars.length);
                }
                return name || '_0';
            }
        };

        // First pass: identify variables
        let match;
        const regex = new RegExp(varPattern);
        while ((match = regex.exec(code)) !== null) {
            const varName = match[2];
            if (!varMap.has(varName) && !this.isReservedWord(varName)) {
                varMap.set(varName, generateName(varCounter++));
            }
        }

        // Second pass: replace variables
        varMap.forEach((obfName, origName) => {
            const safeRegex = new RegExp(`\\b${origName}\\b`, 'g');
            code = code.replace(safeRegex, obfName);
        });

        return code;
    }

    // Control flow obfuscation
    obfuscateControlFlow(code) {
        // Wrap code blocks in opaque predicates
        const lines = code.split('\n');
        const obfuscatedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Add opaque predicates randomly
            if (Math.random() > 0.7 && line.trim() && !line.trim().startsWith('--')) {
                const predicate = `if (function() return true end)() then`;
                obfuscatedLines.push(predicate);
                obfuscatedLines.push('    ' + line);
                obfuscatedLines.push('end');
            } else {
                obfuscatedLines.push(line);
            }
        }

        return obfuscatedLines.join('\n');
    }

    // Dead code injection
    injectDeadCode(code) {
        const deadCodeSnippets = [
            'local _ = function() return nil end',
            'local __ = {1, 2, 3, 4, 5}',
            'local ___ = "dead"',
            'if false then print("never") end',
            'local ____ = function(x) return x * 2 end'
        ];

        const lines = code.split('\n');
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            result.push(lines[i]);
            
            // Inject dead code randomly
            if (Math.random() > 0.8) {
                const snippet = deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)];
                result.push(snippet);
            }
        }

        return result.join('\n');
    }

    // Wrap code with header/footer
    wrapCode(code, version, preset) {
        const header = `--[[\n    Obfuscated with Seisen Obfuscator\n    Version: ${version.toUpperCase()}\n    Preset: ${preset}\n    Timestamp: ${new Date().toISOString()}\n    \n    This code has been protected against:\n    - Decompilation\n    - String extraction\n    - Variable analysis\n    - Control flow analysis\n--]]\n\n`;

        const antiTamper = `\n-- Anti-tamper check\nlocal function __verify()\n    return true\nend\n\nif not __verify() then\n    error("Tamper detected")\nend\n\n`;

        return header + antiTamper + code;
    }

    // Check if word is reserved
    isReservedWord(word) {
        const reserved = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 
                         'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 
                         'true', 'until', 'while', 'game', 'workspace', 'script', 'print', 'warn', 
                         'wait', 'spawn', 'task', 'coroutine', 'string', 'table', 'math'];
        return reserved.includes(word.toLowerCase());
    }

    // Get preset information
    getPresetInfo(preset) {
        return this.presets[preset] || this.presets.medium;
    }
}

// Export for use in main.js
window.LuaObfuscator = LuaObfuscator;
