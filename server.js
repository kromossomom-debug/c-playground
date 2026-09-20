const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFile, execSync } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const TEMP_DIR = path.join(__dirname, 'temp');
const TCC_EXE = path.join(__dirname, 'compiler', 'tcc', 'tcc.exe');

// Garante que a pasta temp existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Limpeza de arquivos temporários antigos
function cleanTempDir() {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 10 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {}
    }
  } catch (err) {}
}
setInterval(cleanTempDir, 5 * 60 * 1000);

// Helper para ler corpo da requisição JSON
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // Limite de 2MB
        reject(new Error('Tamanho da requisição excedeu o limite.'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('JSON inválido.'));
      }
    });
    req.on('error', reject);
  });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // API: Status
  if (urlPath === '/api/status' && req.method === 'GET') {
    const compilerExists = fs.existsSync(TCC_EXE);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: compilerExists ? 'ready' : 'missing_compiler',
      compiler: 'Tiny C Compiler (TCC) v0.9.27',
      system: 'Windows x64'
    }));
    return;
  }

  // API: Compilar e Executar
  if (urlPath === '/api/compile-run' && req.method === 'POST') {
    try {
      const { code, input = '', timeoutMs = 5000 } = await parseJsonBody(req);

      if (!code || typeof code !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Nenhum código C fornecido.' }));
        return;
      }

      if (!fs.existsSync(TCC_EXE)) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Compilador C não encontrado no servidor.' }));
        return;
      }

      const jobId = crypto.randomBytes(6).toString('hex');
      const sourceFile = path.join(TEMP_DIR, `prog_${jobId}.c`);
      const exeFile = path.join(TEMP_DIR, `prog_${jobId}.exe`);

      fs.writeFileSync(sourceFile, code, 'utf8');

      // 1. Etapa de Compilação
      execFile(TCC_EXE, [sourceFile, '-o', exeFile], { timeout: 8000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          // Erro de compilação
          try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (e) {}
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            stage: 'compilation',
            stderr: compileStderr || compileErr.message,
            stdout: compileStdout || ''
          }));
          return;
        }

        // 2. Etapa de Execução
        const startTime = process.hrtime.bigint();
        let stdoutData = '';
        let stderrData = '';
        let isTerminated = false;

        const child = spawn(exeFile, [], {
          windowsHide: true,
          cwd: TEMP_DIR
        });

        // Enviar STDIN se houver
        if (input) {
          try {
            child.stdin.write(input);
            if (!input.endsWith('\n')) {
              child.stdin.write('\n');
            }
          } catch (err) {}
        }
        child.stdin.end();

        child.stdout.on('data', data => {
          if (stdoutData.length < 500000) {
            stdoutData += data.toString();
          }
        });

        child.stderr.on('data', data => {
          if (stderrData.length < 100000) {
            stderrData += data.toString();
          }
        });

        // Timer de Timeout contra loops infinitos
        const timer = setTimeout(() => {
          isTerminated = true;
          try {
            // Força o encerramento do processo no Windows
            execSync(`taskkill /pid ${child.pid} /T /F`);
          } catch (e) {
            try { child.kill('SIGKILL'); } catch (err) {}
          }
        }, timeoutMs);

        child.on('close', (exitCode, signal) => {
          clearTimeout(timer);
          const endTime = process.hrtime.bigint();
          const executionTimeMs = Number((endTime - startTime) / 1000000n);

          // Limpa arquivos temporários
          setTimeout(() => {
            try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (e) {}
            try { if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (e) {}
          }, 300);

          if (isTerminated) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              stage: 'execution',
              error: `Tempo limite de execução excedido (${timeoutMs / 1000}s). Se o seu código tem loops infinitos ou espera entrada (scanf) que não foi enviada, finalize-o ou envie os dados no campo de Entrada.`,
              stdout: stdoutData,
              stderr: stderrData,
              executionTimeMs
            }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            stage: 'execution',
            stdout: stdoutData,
            stderr: stderrData,
            exitCode: exitCode ?? (signal ? -1 : 0),
            executionTimeMs
          }));
        });

        child.on('error', err => {
          clearTimeout(timer);
          try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (e) {}
          try { if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (e) {}
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            stage: 'execution',
            error: 'Falha ao executar o binário: ' + err.message
          }));
        });
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API: Baixar Executável (.exe)
  if (urlPath === '/api/download-exe' && req.method === 'POST') {
    try {
      const { code, filename = 'programa.exe' } = await parseJsonBody(req);
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Código não fornecido.' }));
        return;
      }

      const jobId = crypto.randomBytes(6).toString('hex');
      const sourceFile = path.join(TEMP_DIR, `dl_${jobId}.c`);
      const exeFile = path.join(TEMP_DIR, `dl_${jobId}.exe`);

      fs.writeFileSync(sourceFile, code, 'utf8');

      execFile(TCC_EXE, [sourceFile, '-o', exeFile], { timeout: 8000 }, (compileErr) => {
        if (compileErr) {
          try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (e) {}
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Erro de compilação. Corrija o código antes de baixar.' }));
          return;
        }

        try {
          const exeBuffer = fs.readFileSync(exeFile);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.microsoft.portable-executable',
            'Content-Disposition': `attachment; filename="${filename.replace(/[^a-zA-Z0-9_\-\.]/g, '') || 'programa.exe'}"`,
            'Content-Length': exeBuffer.length
          });
          res.end(exeBuffer);
        } catch (readErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Falha ao ler arquivo gerado.' }));
        } finally {
          setTimeout(() => {
            try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (e) {}
            try { if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (e) {}
          }, 500);
        }
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Arquivos Estáticos (public)
  let filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);

  // Previne path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Acesso Negado');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Arquivo não encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 C-Studio Playground está rodando!`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`⚙️  Compilador integrado: Tiny C Compiler (TCC)`);
  console.log(`==============================================\n`);
});
