import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { code, version, preset } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const prometheusPath = process.env.PROMETHEUS_PATH || 'C:\\Prometheus';
    const luaExecutable = process.env.LUA_EXECUTABLE || 'lua';
    const tempDir = process.env.TEMP_DIR || './temp';
    const debug = process.env.DEBUG === 'true';

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `temp_${timestamp}.lua`;
    const tempFilePath = path.join(tempDir, fileName);
    const prometheusCliPath = path.join(prometheusPath, 'cli.lua');

    if (!fs.existsSync(prometheusCliPath)) {
      return NextResponse.json({ 
        error: 'Prometheus not found', 
        hint: `Please ensure Prometheus is installed at ${prometheusPath}` 
      }, { status: 500 });
    }

    // Write code to temp file
    // Handle specific encoding if needed, usually utf8 is default
    fs.writeFileSync(tempFilePath, code);

    // Build command
    // "lua" "C:\Prometheus\cli.lua" "temp_123.lua" --preset "Medium" --out "temp_123_out.lua"
    // Adjust command args based on real CLI usage from server.js
    // server.js: `${LUA_EXECUTABLE} "${prometheusCliPath}" --preset "${preset}" --out "${tempFilePath}.out" "${tempFilePath}"`
    
    // Safety check for preset to prevent injection
    const allowedPresets = ['Minify', 'Weak', 'Medium', 'Strong'];
    const safePreset = allowedPresets.includes(preset) ? preset : 'Medium';

    const cmd = `"${luaExecutable}" "${prometheusCliPath}" --preset "${safePreset}" --out "${tempFilePath}.out" "${tempFilePath}"`;
    
    if (debug) console.log('Executing:', cmd);

    try {
        const { stdout, stderr } = await execPromise(cmd);
        
        if (debug) {
            console.log('Stdout:', stdout);
            console.log('Stderr:', stderr);
        }

        const outFile = `${tempFilePath}.out`;
        if (fs.existsSync(outFile)) {
            const obfuscatedCode = fs.readFileSync(outFile, 'utf8');
            
            // Cleanup
            try {
                fs.unlinkSync(tempFilePath);
                fs.unlinkSync(outFile);
            } catch (e) {
                console.error('Cleanup error:', e);
            }

            return NextResponse.json({ obfuscated: obfuscatedCode });
        } else {
             throw new Error('Output file not generated');
        }

    } catch (execError: any) {
        console.error('Obfuscation execution error:', execError);
        // Try cleanup
         try {
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        } catch {}
        
        return NextResponse.json({ 
            error: 'Obfuscation failed during execution',
            details: execError.message
        }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Obfuscation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
