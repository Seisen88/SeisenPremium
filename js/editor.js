// Code Editor Enhancements - Line Numbers and Syntax Highlighting
document.addEventListener('DOMContentLoaded', function() {
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const inputLineNumbers = document.getElementById('input-line-numbers');
    const outputLineNumbers = document.getElementById('output-line-numbers');

    // Create syntax highlighted overlays
    const inputWrapper = inputCode.parentElement;
    const outputWrapper = outputCode.parentElement;
    
    const inputHighlight = document.createElement('pre');
    const outputHighlight = document.createElement('pre');
    
    inputHighlight.className = 'syntax-highlight';
    outputHighlight.className = 'syntax-highlight';
    
    inputWrapper.insertBefore(inputHighlight, inputCode);
    outputWrapper.insertBefore(outputHighlight, outputCode);

    // Lua keywords and built-in functions
    const luaKeywords = [
        'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
        'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then',
        'true', 'until', 'while'
    ];

    const luaBuiltins = [
        'print', 'pairs', 'ipairs', 'tonumber', 'tostring', 'type', 'assert',
        'error', 'pcall', 'xpcall', 'next', 'select', 'unpack', 'rawequal',
        'rawget', 'rawset', 'getmetatable', 'setmetatable', 'require', 'module'
    ];

    // Syntax highlighting function
    function highlightLua(code) {
        if (!code) return '';
        
        let highlighted = code;
        
        // Escape HTML
        highlighted = highlighted
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Highlight comments (-- comment)
        highlighted = highlighted.replace(/(--.*$)/gm, '<span class="lua-comment">$1</span>');
        
        // Highlight strings (single and double quotes)
        highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="lua-string">$1</span>');
        
        // Highlight numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="lua-number">$1</span>');
        
        // Highlight keywords
        luaKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, '<span class="lua-keyword">$1</span>');
        });
        
        // Highlight built-in functions
        luaBuiltins.forEach(builtin => {
            const regex = new RegExp(`\\b(${builtin})\\b`, 'g');
            highlighted = highlighted.replace(regex, '<span class="lua-function">$1</span>');
        });
        
        return highlighted;
    }

    // Update syntax highlighting
    function updateHighlight(textarea, highlightDiv) {
        const code = textarea.value;
        highlightDiv.innerHTML = highlightLua(code) + '\n';
    }

    // Update line numbers
    function updateLineNumbers(textarea, lineNumbersDiv) {
        const lines = textarea.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersText = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersText += i + '\n';
        }
        
        lineNumbersDiv.textContent = lineNumbersText;
    }

    // Sync scroll between textarea and line numbers
    function syncScroll(textarea, lineNumbersDiv, highlightDiv) {
        lineNumbersDiv.scrollTop = textarea.scrollTop;
        highlightDiv.scrollTop = textarea.scrollTop;
        highlightDiv.scrollLeft = textarea.scrollLeft;
    }

    // Initialize
    updateLineNumbers(inputCode, inputLineNumbers);
    updateLineNumbers(outputCode, outputLineNumbers);
    updateHighlight(inputCode, inputHighlight);
    updateHighlight(outputCode, outputHighlight);

    // Update on input
    inputCode.addEventListener('input', function() {
        updateLineNumbers(inputCode, inputLineNumbers);
        updateHighlight(inputCode, inputHighlight);
    });

    // Observer for output code changes (from obfuscation)
    const outputObserver = new MutationObserver(function() {
        updateLineNumbers(outputCode, outputLineNumbers);
        updateHighlight(outputCode, outputHighlight);
    });

    outputCode.addEventListener('input', function() {
        updateLineNumbers(outputCode, outputLineNumbers);
        updateHighlight(outputCode, outputHighlight);
    });

    // Sync scroll
    inputCode.addEventListener('scroll', function() {
        syncScroll(inputCode, inputLineNumbers, inputHighlight);
    });

    outputCode.addEventListener('scroll', function() {
        syncScroll(outputCode, outputLineNumbers, outputHighlight);
    });

    // Handle tab key for proper indentation
    function handleTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const value = this.value;
            
            // Insert tab (4 spaces)
            this.value = value.substring(0, start) + '    ' + value.substring(end);
            
            // Move cursor
            this.selectionStart = this.selectionEnd = start + 4;
            
            // Update
            if (this === inputCode) {
                updateLineNumbers(inputCode, inputLineNumbers);
                updateHighlight(inputCode, inputHighlight);
            } else {
                updateLineNumbers(outputCode, outputLineNumbers);
                updateHighlight(outputCode, outputHighlight);
            }
        }
    }

    inputCode.addEventListener('keydown', handleTab);
    outputCode.addEventListener('keydown', handleTab);

    // Trigger initial highlight
    setTimeout(() => {
        updateHighlight(inputCode, inputHighlight);
        updateHighlight(outputCode, outputHighlight);
    }, 100);
});
