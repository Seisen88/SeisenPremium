// Lua Syntax Validation Helper Functions

function validateLuaSyntax(code) {
    // Basic Lua syntax checks
    const lines = code.split('\n');
    
    // Check for unmatched brackets/parentheses
    let parenCount = 0, bracketCount = 0, braceCount = 0;
    let inString = false, stringChar = null;
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const prevChar = i > 0 ? code[i-1] : '';
        
        // Handle strings
        if ((char === '"' || char === "'") && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
            continue;
        }
        
        if (inString) continue;
        
        // Count brackets
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
    
    if (parenCount > 0) return 'Syntax Error: Unclosed parenthesis "("';
    if (parenCount < 0) return 'Syntax Error: Extra closing parenthesis ")"';
    if (bracketCount > 0) return 'Syntax Error: Unclosed bracket "["';
    if (bracketCount < 0) return 'Syntax Error: Extra closing bracket "]"';
    if (braceCount > 0) return 'Syntax Error: Unclosed brace "{"';
    if (braceCount < 0) return 'Syntax Error: Extra closing brace "}"';
    
    // Check for unclosed strings
    if (inString) return 'Syntax Error: Unclosed string';
    
    // Check for common Lua keywords misuse
    let functionCount = 0, endCount = 0, ifCount = 0, doCount = 0, repeatCount = 0, untilCount = 0;
    
    const tokens = code.match(/\b(function|end|if|then|do|repeat|until)\b/g) || [];
    tokens.forEach(token => {
        if (token === 'function') functionCount++;
        if (token === 'end') endCount++;
        if (token === 'if') ifCount++;
        if (token === 'do') doCount++;
        if (token === 'repeat') repeatCount++;
        if (token === 'until') untilCount++;
    });
    
    const blockCount = functionCount + ifCount + doCount + repeatCount;
    const closeCount = endCount + untilCount;
    
    if (blockCount > closeCount) return 'Syntax Error: Missing "end" or "until" keyword';
    if (blockCount < closeCount) return 'Syntax Error: Extra "end" or "until" keyword';
    
    return null; // No errors found
}

function showSyntaxError(message) {
    const errorDiv = document.getElementById('syntax-error');
    const errorText = document.getElementById('syntax-error-text');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
    }
}

function hideSyntaxError() {
    const errorDiv = document.getElementById('syntax-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Make functions globally accessible
window.validateLuaSyntax = validateLuaSyntax;
window.showSyntaxError = showSyntaxError;
window.hideSyntaxError = hideSyntaxError;

