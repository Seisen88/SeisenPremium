import { NextRequest, NextResponse } from 'next/server';
import { LuaFactory } from 'wasmoon';
import { promises as fs } from 'fs';
import path from 'path';

const PROMETHEUS_DIR = path.join(process.cwd(), 'lib', 'prometheus');

// Helper to recursively read directory
async function getFilesRec(dir: string, baseDir: string = ''): Promise<{ path: string, content: string }[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files: { path: string, content: string }[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(baseDir, entry.name).replace(/\\/g, '/'); // Force forward slashes for Lua

        if (entry.isDirectory()) {
            const children = await getFilesRec(fullPath, relPath);
            files = files.concat(children);
        } else {
            // Read as string (utf8)
            const content = await fs.readFile(fullPath, 'utf-8');
            files.push({ path: relPath, content });
        }
    }
    return files;
}

export async function POST(req: NextRequest) {
  try {
    const { code, version, preset } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Initialize Lua Runtime (WASM)
    const wasmPath = path.join(process.cwd(), 'node_modules', 'wasmoon', 'dist', 'glue.wasm');
    const factory = new LuaFactory(wasmPath);
    const lua = await factory.createEngine();

    // 1. Mount Prometheus Files
    try {
        const prometheusFiles = await getFilesRec(PROMETHEUS_DIR);
        for (const file of prometheusFiles) {
            await factory.mountFile(file.path, file.content);
        }
    } catch (err) {
        console.error("Failed to load Prometheus files:", err);
        return NextResponse.json({ error: 'Failed to load obfuscator core' }, { status: 500 });
    }

    // 2. Mount Input Code
    const inputFile = "input.lua";
    const outputFile = "output.lua";
    // Ensure the code has a trailing newline to avoid EOF issues in some Lua parsers
    const stabilizedCode = code.endsWith('\n') ? code : code + '\n';
    await factory.mountFile(inputFile, stabilizedCode);
    console.log(`[Obfuscate] Mounted ${inputFile} (${stabilizedCode.length} bytes)`);

    // 3. Setup Environment
    const allowedPresets = ['Minify', 'Weak', 'Medium', 'Strong'];
    const safePreset = allowedPresets.includes(preset) ? preset : 'Medium';
    
    // Map version to flags
    let versionFlag = "";
    if (version === 'lua51') versionFlag = "--Lua51";
    if (version === 'luau') versionFlag = "--LuaU";

    const argScript = `
        arg = {
            [0] = "cli.lua", 
            "--preset", "${safePreset}", 
            "${versionFlag}",
            "--out", "${outputFile}", 
            "${inputFile}"
        }
        
        -- Override package path to include root and src
        package.path = "./?.lua;./src/?.lua;" .. package.path
    `;
    
    await lua.doString(argScript);
    console.log(`[Obfuscate] Configured with preset=${safePreset}, version=${version || 'default'}`);

    // 4. Run Prometheus CLI
    // We execute the main cli.lua file
    try {
        await lua.doFile("cli.lua");
    } catch (luaError: any) {
        console.error("Lua execution error:", luaError);
         return NextResponse.json({ error: 'Obfuscation failed', details: luaError.message }, { status: 500 });
    }

    // 5. Read Output
    try {
        const result = await lua.doString(`
            local f = io.open("${outputFile}", "r")
            if f then
                local content = f:read("*all") or f:read("*a")
                f:close()
                return content
            else
                return nil
            end
        `);

        if (result) {
            const response = NextResponse.json({ obfuscated: result });
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            return response;
        } else {
            throw new Error("Output file was not created by Lua script");
        }
    } catch (readError: any) {
        const response = NextResponse.json({ error: 'Failed to read output', details: readError.message }, { status: 500 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } finally {
        // Cleanup engine
        lua.global.close();
    }

  } catch (error: any) {
    console.error('Obfuscation API error:', error);
    const response = NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}
