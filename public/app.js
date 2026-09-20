// ==========================================================================
// C-Studio Playground — Lógica do Editor e Terminal
// ==========================================================================

// Modelos de Código Pré-configurados
const TEMPLATES = {
  hello: {
    title: "Olá Mundo",
    code: `#include <stdio.h>

int main() {
    printf("Olá, Mundo! Bem-vindo ao C-Studio.\\n");
    printf("Compilador C pronto e funcionando perfeitamente.\\n");
    return 0;
}
`,
    input: ""
  },
  input: {
    title: "Entrada com scanf",
    code: `#include <stdio.h>

int main() {
    char nome[50];
    int idade;
    float altura;

    printf("=== CADASTRO INTERATIVO ===\\n");
    printf("Digite seu nome, idade e altura (ex: Carlos 25 1.78):\\n");

    if (scanf("%49s %d %f", nome, &idade, &altura) == 3) {
        printf("\\n--- DADOS REGISTRADOS ---\\n");
        printf("Nome:   %s\\n", nome);
        printf("Idade:  %d anos\\n", idade);
        printf("Altura: %.2f metros\\n", altura);
        printf("Status: Cadastro concluido com sucesso!\\n");
    } else {
        printf("\\n[ERRO] Nao foi possivel ler os dados.\\n");
        printf("Certifique-se de preencher a aba 'Entrada (STDIN)' antes de rodar.\\n");
    }

    return 0;
}
`,
    input: "Carlos 25 1.78\n"
  },
  vetores: {
    title: "Vetores & Estatísticas",
    code: `#include <stdio.h>

#define TAMANHO 6

int main() {
    int numeros[TAMANHO] = {14, 58, 27, 93, 4, 32};
    int soma = 0;
    int maior = numeros[0];
    int menor = numeros[0];

    printf("=== ANALISE DE VETORES ===\\n");
    printf("Elementos: ");
    for (int i = 0; i < TAMANHO; i++) {
        printf("[%d] ", numeros[i]);
        soma += numeros[i];
        if (numeros[i] > maior) maior = numeros[i];
        if (numeros[i] < menor) menor = numeros[i];
    }

    float media = (float)soma / TAMANHO;

    printf("\\n\\n--- RESULTADOS ---\\n");
    printf("Total de Elementos: %d\\n", TAMANHO);
    printf("Soma dos Valores:   %d\\n", soma);
    printf("Media Aritmetica:   %.2f\\n", media);
    printf("Maior Valor:        %d\\n", maior);
    printf("Menor Valor:        %d\\n", menor);

    return 0;
}
`,
    input: ""
  },
  gestao: {
    title: "Gestão de Dados & Arquivos (Structs + Exportação)",
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_ITENS 100

// Estrutura para representar registros de produtos/itens em memoria
typedef struct {
    int id;
    char titulo[50];
    char categoria[30];
    int quantidade;
    float preco;
} Item;

// Funcao para salvar o relatorio formatado em disco
void exportarRelatorio(Item lista[], int total) {
    if (total == 0) {
        printf("\\n[AVISO] Nenhum item cadastrado para exportacao.\\n");
        return;
    }

    const char *nomeArquivo = "relatorio_inventario.txt";
    FILE *arquivo = fopen(nomeArquivo, "w");

    if (arquivo == NULL) {
        printf("[ERRO] Falha ao criar o arquivo no disco.\\n");
        return;
    }

    fprintf(arquivo, "=========================================================\\n");
    fprintf(arquivo, "             RELATORIO GERAL DE INVENTARIO               \\n");
    fprintf(arquivo, "=========================================================\\n");

    float totalGeral = 0.0f;
    for (int i = 0; i < total; i++) {
        float subtotal = lista[i].quantidade * lista[i].preco;
        totalGeral += subtotal;

        fprintf(arquivo, "ID: #%03d | %-20s | Cat: %-12s\\n", 
                lista[i].id, lista[i].titulo, lista[i].categoria);
        fprintf(arquivo, "Qtd: %-4d | Unitario: R$ %7.2f | Subtotal: R$ %7.2f\\n",
                lista[i].quantidade, lista[i].preco, subtotal);
        fprintf(arquivo, "---------------------------------------------------------\\n");
    }

    fprintf(arquivo, "Total de Registros: %d | Faturamento Total: R$ %.2f\\n", total, totalGeral);
    fprintf(arquivo, "=========================================================\\n");
    fclose(arquivo);

    printf("[SUCESSO] Relatorio gerado com sucesso em '%s'!\\n", nomeArquivo);
}

int main() {
    Item estoque[3] = {
        {101, "Monitor 24 Pol", "Perifericos", 15, 899.90f},
        {102, "Teclado Mecanico", "Acessorios", 30, 249.50f},
        {103, "Cabo USB-C 2m",   "Cabos",      50,  39.90f}
    };
    int total = 3;

    printf("=== SISTEMA DE GESTAO DE ESTOQUE ===\\n");
    printf("Total de registros ativos: %d\\n\\n", total);

    for (int i = 0; i < total; i++) {
        printf("[%d] #%03d %-18s (Cat: %-10s) | Qtd: %2d | R$ %.2f\\n",
               i, estoque[i].id, estoque[i].titulo, estoque[i].categoria, 
               estoque[i].quantidade, estoque[i].preco);
    }

    printf("\\nIniciando exportacao para arquivo em disco...\\n");
    exportarRelatorio(estoque, total);

    return 0;
}
`,
    input: ""
  },
  pedidos: {
    title: "Sistema de Pedidos (Structs)",
    code: `#include <stdio.h>

typedef struct {
    int id;
    char cliente[30];
    char item[30];
    int qtd;
    float precoUnitario;
} Pedido;

float calcularTotal(Pedido p) {
    return p.qtd * p.precoUnitario;
}

int main() {
    Pedido lista[3] = {
        {101, "Mariana", "Teclado Mecanico", 1, 289.90f},
        {102, "Rafael",  "Mouse Sem Fio",    2, 115.00f},
        {103, "Juliana", "Headset Gamer",    1, 450.00f}
    };

    printf("================= SISTEMA DE PEDIDOS ================\\n");
    printf("%-5s | %-12s | %-18s | %-3s | %-10s\\n", "ID", "CLIENTE", "PRODUTO", "QTD", "TOTAL");
    printf("-----------------------------------------------------\\n");

    float faturamento = 0.0f;
    for (int i = 0; i < 3; i++) {
        float totalItem = calcularTotal(lista[i]);
        faturamento += totalItem;
        printf("#%-4d | %-12s | %-18s | %-3d | R$ %7.2f\\n",
               lista[i].id, lista[i].cliente, lista[i].item,
               lista[i].qtd, totalItem);
    }

    printf("-----------------------------------------------------\\n");
    printf("Faturamento Geral: R$ %.2f\\n", faturamento);

    return 0;
}
`,
    input: ""
  },
  ponteiros: {
    title: "Ponteiros & Troca de Valores",
    code: `#include <stdio.h>

// Funcao que altera diretamente as variaveis originais via ponteiro
void trocar(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int valor1 = 42;
    int valor2 = 99;

    printf("=== PONTEIROS EM C ===\\n");
    printf("Antes da troca:\\n");
    printf("valor1 = %d (Endereco de memoria: %p)\\n", valor1, (void*)&valor1);
    printf("valor2 = %d (Endereco de memoria: %p)\\n", valor2, (void*)&valor2);

    // Passamos o endereco de memoria (&) para a funcao
    trocar(&valor1, &valor2);

    printf("\\nApos a execucao de trocar(&valor1, &valor2):\\n");
    printf("valor1 = %d\\n", valor1);
    printf("valor2 = %d\\n", valor2);

    return 0;
}
`,
    input: ""
  }
};

// Elementos DOM
const codeEditor = document.getElementById('codeEditor');
const lineNumbers = document.getElementById('lineNumbers');
const cursorPosition = document.getElementById('cursorPosition');
const currentFileName = document.getElementById('currentFileName');
const btnRun = document.getElementById('btnRun');
const btnOpenFile = document.getElementById('btnOpenFile');
const fileInput = document.getElementById('fileInput');
const btnSaveCode = document.getElementById('btnSaveCode');
const btnDownloadExe = document.getElementById('btnDownloadExe');
const templateSelect = document.getElementById('templateSelect');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnClearCode = document.getElementById('btnClearCode');

const tabBtnOutput = document.getElementById('tabBtnOutput');
const tabBtnInput = document.getElementById('tabBtnInput');
const outputTab = document.getElementById('outputTab');
const inputTab = document.getElementById('inputTab');
const terminal = document.getElementById('terminal');
const stdinInput = document.getElementById('stdinInput');
const btnCopyOutput = document.getElementById('btnCopyOutput');
const btnClearOutput = document.getElementById('btnClearOutput');

const outputBadge = document.getElementById('outputBadge');
const inputIndicator = document.getElementById('inputIndicator');
const metricStatus = document.getElementById('metricStatus');
const metricTime = document.getElementById('metricTime');
const metricExitCode = document.getElementById('metricExitCode');
const compilerStatusBadge = document.getElementById('compilerStatusBadge');
const compilerStatusText = document.getElementById('compilerStatusText');
const toastNotification = document.getElementById('toastNotification');

let currentTab = 'output';
let isExecuting = false;

// ==========================================================================
// Toast Notification
// ==========================================================================
function showToast(message, type = 'info') {
  toastNotification.textContent = message;
  toastNotification.className = `toast visible ${type}`;
  setTimeout(() => {
    toastNotification.className = 'toast';
  }, 3500);
}

// ==========================================================================
// Status do Compilador
// ==========================================================================
async function checkCompilerStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.status === 'ready') {
      compilerStatusBadge.classList.add('ready');
      compilerStatusText.textContent = `${data.compiler} Pronto`;
    } else {
      compilerStatusText.textContent = 'Compilador não configurado';
    }
  } catch (err) {
    compilerStatusText.textContent = 'Servidor offline';
  }
}

// ==========================================================================
// Gerenciamento de Linhas e Cursor do Editor
// ==========================================================================
function updateLineNumbers() {
  const lines = codeEditor.value.split('\n');
  const count = lines.length;
  let numbersHtml = '';
  for (let i = 1; i <= count; i++) {
    numbersHtml += `<div>${i}</div>`;
  }
  lineNumbers.innerHTML = numbersHtml;
}

function updateCursorPosition() {
  const text = codeEditor.value.substring(0, codeEditor.selectionStart);
  const lines = text.split('\n');
  const currentLine = lines.length;
  const currentCol = lines[lines.length - 1].length + 1;
  cursorPosition.textContent = `Lin ${currentLine}, Col ${currentCol}`;
}

// Sincronizar scroll dos números de linha com o textarea
codeEditor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = codeEditor.scrollTop;
});

codeEditor.addEventListener('input', () => {
  updateLineNumbers();
  updateCursorPosition();
});

codeEditor.addEventListener('click', updateCursorPosition);
codeEditor.addEventListener('keyup', updateCursorPosition);

// Suporte a Tab (4 espaços) e fechamento de pares
codeEditor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;
    const tabSpaces = '    ';
    codeEditor.value = codeEditor.value.substring(0, start) + tabSpaces + codeEditor.value.substring(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + tabSpaces.length;
    updateLineNumbers();
    return;
  }

  // Atalho: Ctrl + Enter para Executar
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
    return;
  }

  // Fechamento de pares
  const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
  if (pairs[e.key]) {
    const start = codeEditor.selectionStart;
    const end = codeEditor.selectionEnd;
    if (start === end) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      codeEditor.value = codeEditor.value.substring(0, start) + e.key + closeChar + codeEditor.value.substring(end);
      codeEditor.selectionStart = codeEditor.selectionEnd = start + 1;
      updateLineNumbers();
    }
  }
});

// ==========================================================================
// Tabs (Terminal vs STDIN)
// ==========================================================================
function switchTab(tab) {
  currentTab = tab;
  if (tab === 'output') {
    tabBtnOutput.classList.add('active');
    tabBtnOutput.setAttribute('aria-selected', 'true');
    tabBtnInput.classList.remove('active');
    tabBtnInput.setAttribute('aria-selected', 'false');
    outputTab.classList.add('active');
    outputTab.hidden = false;
    inputTab.classList.remove('active');
    inputTab.hidden = true;
  } else {
    tabBtnInput.classList.add('active');
    tabBtnInput.setAttribute('aria-selected', 'true');
    tabBtnOutput.classList.remove('active');
    tabBtnOutput.setAttribute('aria-selected', 'false');
    inputTab.classList.add('active');
    inputTab.hidden = false;
    outputTab.classList.remove('active');
    outputTab.hidden = true;
    stdinInput.focus();
  }
}

tabBtnOutput.addEventListener('click', () => switchTab('output'));
tabBtnInput.addEventListener('click', () => switchTab('input'));

stdinInput.addEventListener('input', () => {
  const chars = stdinInput.value.trim().length;
  inputIndicator.textContent = chars > 0 ? chars : '0';
});

// ==========================================================================
// Execução do Código C
// ==========================================================================
async function runCode() {
  if (isExecuting) return;

  const code = codeEditor.value.trim();
  if (!code) {
    showToast('Por favor, escreva algum código C antes de executar.', 'error');
    return;
  }

  isExecuting = true;
  switchTab('output');

  // Atualiza estado do botão
  btnRun.classList.add('running');
  btnRun.innerHTML = `
    <svg class="icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    <span class="btn-text">Compilando...</span>
  `;

  metricStatus.textContent = 'Compilando...';
  metricStatus.className = 'metric-value';
  metricTime.textContent = '--';
  metricExitCode.textContent = '--';

  outputBadge.textContent = 'Executando';
  outputBadge.className = 'tab-badge';

  const startTime = performance.now();

  try {
    const response = await fetch('/api/compile-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: codeEditor.value,
        input: stdinInput.value
      })
    });

    const result = await response.json();
    const elapsed = Math.round(performance.now() - startTime);

    if (result.stage === 'compilation') {
      // Erro de compilação
      outputBadge.textContent = 'Erro de Sintaxe';
      outputBadge.className = 'tab-badge error';
      metricStatus.textContent = 'Falha';
      metricStatus.className = 'metric-value error';

      terminal.innerHTML = `
        <div class="log-header">❌ Erro de Compilação (GCC/TCC):</div>
        <pre class="log-stderr">${escapeHtml(result.stderr || 'Erro desconhecido na compilação.')}</pre>
        <p class="welcome-hint">Verifique a linha indicada no erro acima e tente novamente.</p>
      `;
    } else if (result.success) {
      // Sucesso na execução
      outputBadge.textContent = 'Sucesso';
      outputBadge.className = 'tab-badge success';
      metricStatus.textContent = 'Concluído';
      metricStatus.className = 'metric-value success';
      metricTime.textContent = `${result.executionTimeMs}ms`;
      metricExitCode.textContent = result.exitCode;

      let html = `<div class="log-header">⚡ Programa executado com sucesso em ${result.executionTimeMs}ms (Retorno: ${result.exitCode})</div>`;

      if (result.stdout) {
        html += `<pre class="log-stdout">${escapeHtml(result.stdout)}</pre>`;
      } else {
        html += `<pre class="log-stdout" style="color: var(--text-muted); italic;">(O programa foi executado, mas não produziu nenhuma saída impressa)</pre>`;
      }

      if (result.stderr) {
        html += `<pre class="log-stderr">${escapeHtml(result.stderr)}</pre>`;
      }

      html += `<div class="log-success-banner">✓ Processo finalizado</div>`;
      terminal.innerHTML = html;
    } else {
      // Erro de execução ou timeout
      outputBadge.textContent = 'Erro';
      outputBadge.className = 'tab-badge error';
      metricStatus.textContent = 'Erro';
      metricStatus.className = 'metric-value error';
      metricTime.textContent = result.executionTimeMs ? `${result.executionTimeMs}ms` : '--';

      terminal.innerHTML = `
        <div class="log-header">⚠️ Erro em tempo de execução:</div>
        <pre class="log-stderr">${escapeHtml(result.error || result.stderr || 'Erro desconhecido.')}</pre>
        ${result.stdout ? `<pre class="log-stdout">${escapeHtml(result.stdout)}</pre>` : ''}
      `;
    }
  } catch (err) {
    outputBadge.textContent = 'Falha de Conexão';
    outputBadge.className = 'tab-badge error';
    metricStatus.textContent = 'Desconectado';
    metricStatus.className = 'metric-value error';

    terminal.innerHTML = `
      <div class="log-header">❌ Erro de Comunicação com o Servidor:</div>
      <pre class="log-stderr">${escapeHtml(err.message)}</pre>
    `;
  } finally {
    isExecuting = false;
    btnRun.classList.remove('running');
    btnRun.innerHTML = `
      <svg class="icon play-icon" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      <span class="btn-text">Executar</span>
      <kbd class="shortcut-tag">Ctrl ↵</kbd>
    `;
  }
}

btnRun.addEventListener('click', runCode);

// ==========================================================================
// Baixar Executável (.EXE)
// ==========================================================================
async function downloadExe() {
  const code = codeEditor.value.trim();
  if (!code) {
    showToast('Escreva algum código em C antes de baixar o executável.', 'error');
    return;
  }

  const baseName = (currentFileName?.textContent || 'programa.c').replace(/\.[^/.]+$/, '');
  const outName = `${baseName}.exe`;

  showToast('Compilando executável .exe...', 'info');

  try {
    const res = await fetch('/api/download-exe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filename: outName })
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Erro ao compilar executável.', 'error');
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast(`Download de "${outName}" concluído!`, 'success');
  } catch (err) {
    showToast('Falha no download: ' + err.message, 'error');
  }
}

btnDownloadExe.addEventListener('click', downloadExe);

// ==========================================================================
// Abertura e Salvamento de Arquivos C Locais
// ==========================================================================
btnOpenFile.addEventListener('click', () => {
  fileInput.value = '';
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    codeEditor.value = event.target.result;
    if (currentFileName) currentFileName.textContent = file.name;
    updateLineNumbers();
    updateCursorPosition();
    showToast(`Arquivo "${file.name}" aberto com sucesso!`, 'success');
  };
  reader.onerror = () => {
    showToast('Erro ao ler o arquivo selecionado.', 'error');
  };
  reader.readAsText(file);
});

// Salvar / Baixar Código C (.c)
btnSaveCode.addEventListener('click', () => {
  const code = codeEditor.value;
  if (!code.trim()) {
    showToast('Editor vazio. Nenhum código para salvar.', 'info');
    return;
  }
  const baseName = (currentFileName?.textContent || 'main.c');
  const filename = baseName.endsWith('.c') ? baseName : `${baseName}.c`;
  const blob = new Blob([code], { type: 'text/x-csrc;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Código salvo como "${filename}"!`, 'success');
});

// Suporte a Arrastar e Soltar (Drag & Drop) de arquivos .c no editor
const editorWrapper = document.querySelector('.editor-wrapper');
if (editorWrapper) {
  editorWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    editorWrapper.classList.add('drag-over');
  });
  editorWrapper.addEventListener('dragleave', () => {
    editorWrapper.classList.remove('drag-over');
  });
  editorWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    editorWrapper.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        codeEditor.value = event.target.result;
        if (currentFileName) currentFileName.textContent = file.name;
        updateLineNumbers();
        updateCursorPosition();
        showToast(`Arquivo "${file.name}" importado no editor!`, 'success');
      };
      reader.readAsText(file);
    }
  });
}

// ==========================================================================
// Seleção de Exemplos / Templates
// ==========================================================================
templateSelect.addEventListener('change', (e) => {
  const key = e.target.value;
  if (TEMPLATES[key]) {
    codeEditor.value = TEMPLATES[key].code;
    if (currentFileName) currentFileName.textContent = 'main.c';
    if (TEMPLATES[key].input) {
      stdinInput.value = TEMPLATES[key].input;
      inputIndicator.textContent = stdinInput.value.trim().length;
    } else {
      stdinInput.value = '';
      inputIndicator.textContent = '0';
    }
    updateLineNumbers();
    updateCursorPosition();
    showToast(`Exemplo "${TEMPLATES[key].title}" carregado!`, 'success');
    e.target.value = '';
  }
});

// ==========================================================================
// Ações Rápidas (Copiar, Limpar)
// ==========================================================================
btnCopyCode.addEventListener('click', () => {
  if (!codeEditor.value) return;
  navigator.clipboard.writeText(codeEditor.value).then(() => {
    showToast('Código C copiado para a área de transferência!', 'success');
  });
});

btnClearCode.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar o código do editor?')) {
    codeEditor.value = '';
    updateLineNumbers();
    updateCursorPosition();
    showToast('Editor limpo.');
  }
});

btnCopyOutput.addEventListener('click', () => {
  const text = terminal.innerText;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Saída do terminal copiada!', 'success');
  });
});

btnClearOutput.addEventListener('click', () => {
  terminal.innerHTML = `
    <div class="terminal-welcome">
      <div class="welcome-icon">⚡</div>
      <div class="welcome-text">
        <h3>Terminal Limpo</h3>
        <p>Clique em <strong>Executar</strong> para rodar seu código novamente.</p>
      </div>
    </div>
  `;
  outputBadge.textContent = 'Limpo';
  outputBadge.className = 'tab-badge empty';
  metricStatus.textContent = 'Aguardando';
  metricStatus.className = 'metric-value';
  metricTime.textContent = '--';
  metricExitCode.textContent = '--';
});

// ==========================================================================
// Utilitários
// ==========================================================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  // Carrega template inicial (Olá Mundo)
  codeEditor.value = TEMPLATES.hello.code;
  updateLineNumbers();
  updateCursorPosition();
  checkCompilerStatus();
});
