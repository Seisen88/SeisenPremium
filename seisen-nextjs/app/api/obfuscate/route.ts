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
    const { code, preset } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Initialize Lua Runtime (WASM)
    // We create a fresh engine per request to avoid state pollution
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    // 1. Mount Prometheus Files
    try {
        const prometheusFiles = await getFilesRec(PROMETHEUS_DIR);
        
        for (const file of prometheusFiles) {
            // Mount file to virtual filesystem
            // Note: we prefix with nothing, so 'src/cli.lua' is at root 'src/cli.lua' relative to execution?
            // Actually cli.lua is in root of lib/prometheus.
            // So `getFilesRec` returning `cli.lua` -> mounted as `cli.lua`.
            // `src/cli.lua` -> mounted as `src/cli.lua`.
            
            // factory.mountFile puts it in the filesystem available to the engine
            await factory.mountFile(file.path, file.content);
        }
    } catch (err) {
        console.error("Failed to load Prometheus files:", err);
        return NextResponse.json({ error: 'Failed to load obfuscator core' }, { status: 500 });
    }

    // 2. Mount Input Code
    const inputFile = "input.lua";
    const outputFile = "output.lua";
    await factory.mountFile(inputFile, code);

    // 3. Setup Environment
    // - Override package.path to ensure it finds files in virtual root and src
    // - Set global 'arg' table for CLI args
    
    // Safety check for preset
    const allowedPresets = ['Minify', 'Weak', 'Medium', 'Strong'];
    const safePreset = allowedPresets.includes(preset) ? preset : 'Medium';

    // Construct args: script, --preset, P, --out, O, input
    const argScript = `
        arg = {
            [0] = "cli.lua", 
            "--preset", "${safePreset}", 
            "--out", "${outputFile}", 
            "${inputFile}"
        }
        
        -- Override package path to include root and src
        package.path = "./?.lua;./src/?.lua;" .. package.path
    `;
    
    await lua.doString(argScript);

    // 4. Run Prometheus CLI
    // We execute the main cli.lua file
    try {
        await lua.doFile("cli.lua");
    } catch (luaError: any) {
        console.error("Lua execution error:", luaError);
         // Try to read error file if generated?
         return NextResponse.json({ error: 'Obfuscation failed', details: luaError.message }, { status: 500 });
    }

    // 5. Read Output
    // Since we can't easily access the FS directly from JS on 1.x without obscure APIs,
    // we simply ask Lua to read it back to us.
    try {
        const result = await lua.doString(`
            local f = io.open("${outputFile}", "r")
            if f then
                local content = f:read("*a")
                f:close()
                return content
            else
                return nil
            end
        `);

        if (result) {
            return NextResponse.json({ obfuscated: result });
        } else {
            throw new Error("Output file was not created by Lua script");
        }
    } catch (readError: any) {
        return NextResponse.json({ error: 'Failed to read output', details: readError.message }, { status: 500 });
    } finally {
        // Cleanup engine
        lua.global.close();
    }

  } catch (error: any) {
    console.error('Obfuscation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
