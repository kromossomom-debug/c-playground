#include <stdio.h> // Inclui a biblioteca padrao para operacoes de entrada e saida (printf, scanf, fgets, fopen, fprintf, fclose)
#include <stdlib.h> // Inclui a biblioteca padrao para funcoes utilitarias do sistema
#include <string.h> // Inclui a biblioteca para manipulacao de cadeias de caracteres / strings (strcspn)

#define CAPACIDADE_MAXIMA 100 // Define uma constante com a capacidade maxima de pedidos que o vetor suporta

// Define a estrutura (struct) para agrupar todas as informacoes de um unico pedido
typedef struct { // Inicia a definicao da estrutura com typedef para criar um novo tipo
    int id; // Campo inteiro que armazena o identificador unico e sequencial do pedido
    char cliente[50]; // Vetor de caracteres para armazenar o nome do cliente (ate 49 letras + '\0')
    char descricao[100]; // Vetor de caracteres para armazenar os itens solicitados no lanche
    int status; // Campo inteiro para indicar o progresso (1: Aguardando, 2: Pronto, 3: Entregue)
} Pedido; // Nome atribuido ao tipo da estrutura criada

// Funcao auxiliar para limpar o buffer de entrada do teclado e evitar erros na leitura com fgets
void limparBufferEntrada() { // Cabecalho da funcao auxiliar de limpeza
    int caractere; // Variavel temporaria para receber cada byte que ainda esta na fila do teclado
    while ((caractere = getchar()) != '\n' && caractere != EOF); // Le ate esgotar os caracteres ou encontrar quebra de linha
} // Fecha a funcao limparBufferEntrada

// Funcao responsavel por inserir um novo pedido no final do vetor
void inserirPedidoNoVetor(Pedido vetorPedidos[], int *totalPedidos) { // Recebe o vetor e o ponteiro para a quantidade total
    if (*totalPedidos >= CAPACIDADE_MAXIMA) { // Verifica se o vetor atingiu o limite maximo de posicoes
        printf("\n[AVISO] Capacidade maxima do vetor atingida! Nao e possivel adicionar novos pedidos.\n"); // Alerta de vetor cheio
        return; // Encerra a execucao da funcao imediatamente
    } // Fim da verificacao de capacidade
    Pedido novo; // Declara uma variavel temporaria do tipo Pedido para receber os dados
    novo.id = *totalPedidos + 1; // Gera o proximo ID sequencial somando 1 a quantidade atual
    limparBufferEntrada(); // Limpa o buffer antes de ler texto do teclado
    printf("\n--- NOVO PEDIDO (INSERCAO NO VETOR) ---\n"); // Titulo da secao de insercao
    printf("Nome do Cliente: "); // Solicita que o usuario digite o nome do cliente
    fgets(novo.cliente, sizeof(novo.cliente), stdin); // Le o nome digitado garantindo limite para nao estourar a memoria
    novo.cliente[strcspn(novo.cliente, "\n")] = '\0'; // Substitui a quebra de linha ('\n') gerada pelo fgets pelo terminador ('\0')
    printf("Descricao do Lanche / Itens: "); // Solicita os itens do pedido
    fgets(novo.descricao, sizeof(novo.descricao), stdin); // Le a descricao do pedido com espacos com seguranca
    novo.descricao[strcspn(novo.descricao, "\n")] = '\0'; // Remove o caractere de quebra de linha do final da descricao
    novo.status = 1; // Inicializa o status do pedido como 1 (Aguardando Preparacao)
    vetorPedidos[*totalPedidos] = novo; // Grava o novo pedido diretamente na posicao vaga do vetor
    (*totalPedidos)++; // Incrementa em 1 a variavel de contagem de pedidos cadastrados
    printf("[SUCESSO] Pedido #%d registrado com sucesso na posicao [%d] do vetor!\n", novo.id, *totalPedidos - 1); // Confirma gravacao
} // Fecha a funcao inserirPedidoNoVetor

// Funcao responsavel por remover um pedido existente e reorganizar as posicoes do vetor (deslocamento/shift)
void removerPedidoDoVetor(Pedido vetorPedidos[], int *totalPedidos) { // Recebe o vetor e o ponteiro da quantidade
    if (*totalPedidos == 0) { // Verifica se o vetor esta completamente vazio
        printf("\n[AVISO] O vetor de pedidos esta vazio! Nao ha pedidos para remover.\n"); // Avisa que nao ha itens
        return; // Encerra a execucao da funcao
    } // Fim da verificacao de vetor vazio
    int idBusca; // Declara variavel para guardar o ID que o usuario deseja excluir
    printf("\n--- REMOCAO DE PEDIDO DO VETOR ---\n"); // Titulo da secao de remocao
    printf("Digite o ID do pedido que deseja remover: "); // Pede o ID desejado
    scanf("%d", &idBusca); // Le o ID digitado pelo usuario
    int indiceEncontrado = -1; // Inicializa a variavel de busca com -1 para sinalizar 'nao encontrado'
    for (int i = 0; i < *totalPedidos; i++) { // Percorre sequencialmente o vetor do indice 0 ate a quantidade atual
        if (vetorPedidos[i].id == idBusca) { // Compara se o ID da posicao atual coincide com o ID buscado
            indiceEncontrado = i; // Armazena a posicao do vetor onde o pedido foi localizado
            break; // Interrompe o laco de repeticao pois ja encontrou o pedido
        } // Fim da comparacao de ID
    } // Fim do laco for de busca
    if (indiceEncontrado == -1) { // Verifica se o pedido nao foi encontrado apos percorrer o vetor todo
        printf("[ERRO] Pedido com ID #%d nao foi encontrado no vetor!\n", idBusca); // Mensagem de erro de busca
        return; // Retorna encerrando a funcao
    } // Fim do tratamento de nao encontrado
    // Algoritmo de deslocamento (shift): puxa todos os elementos posteriores uma posicao para a esquerda
    for (int i = indiceEncontrado; i < *totalPedidos - 1; i++) { // Inicia na posicao excluida ate a penultima ocupada
        vetorPedidos[i] = vetorPedidos[i + 1]; // Copia o pedido da frente para a posicao atual, cobrindo o buraco
    } // Fim do deslocamento de elementos
    (*totalPedidos)--; // Decrementa a contagem total de pedidos do vetor
    printf("[SUCESSO] Pedido #%d removido com sucesso e posicoes do vetor reorganizadas!\n", idBusca); // Confirma a remocao
} // Fecha a funcao removerPedidoDoVetor

// Funcao responsavel por atualizar o status do pedido (fluxo de producao e entrega)
void atualizarStatusPedido(Pedido vetorPedidos[], int totalPedidos) { // Recebe o vetor e a quantidade atual
    if (totalPedidos == 0) { // Verifica se ha pedidos para atualizar
        printf("\n[AVISO] Nenhum pedido disponivel para atualizacao no momento.\n"); // Informa ausencia de pedidos
        return; // Encerra a execucao
    } // Fim da verificacao
    int idBusca; // Variavel para armazenar o ID do pedido a ser modificado
    printf("\n--- ATUALIZACAO DE STATUS DO PEDIDO ---\n"); // Titulo da secao de atualizacao
    printf("Digite o ID do pedido: "); // Pede o ID ao usuario
    scanf("%d", &idBusca); // Le o numero do ID
    int indiceEncontrado = -1; // Variavel para rastrear a posicao do pedido no vetor
    for (int i = 0; i < totalPedidos; i++) { // Percorre todos os pedidos existentes no vetor
        if (vetorPedidos[i].id == idBusca) { // Verifica se o ID bate com a busca
            indiceEncontrado = i; // Guarda o indice correspondente
            break; // Sai do laco de busca
        } // Fim do if
    } // Fim do for
    if (indiceEncontrado == -1) { // Se o indice permaneceu -1, o pedido nao existe
        printf("[ERRO] Pedido #%d nao encontrado no vetor!\n", idBusca); // Alerta que nao encontrou
        return; // Encerra a funcao
    } // Fim da validacao
    printf("\nPedido #%d | Cliente: %s\n", vetorPedidos[indiceEncontrado].id, vetorPedidos[indiceEncontrado].cliente); // Mostra dados
    printf("Status atual: "); // Rotulo do status atual
    if (vetorPedidos[indiceEncontrado].status == 1) printf("1 - Aguardando Preparacao\n"); // Caso status seja 1
    else if (vetorPedidos[indiceEncontrado].status == 2) printf("2 - Pronto para Entrega\n"); // Caso status seja 2
    else if (vetorPedidos[indiceEncontrado].status == 3) printf("3 - Entregue\n"); // Caso status seja 3
    printf("\nSelecione o novo status:\n"); // Menu de opcoes para o novo status
    printf("1 - Aguardando Preparacao\n"); // Opcao 1
    printf("2 - Pronto para Entrega\n"); // Opcao 2
    printf("3 - Entregue\n"); // Opcao 3
    printf("Opcao: "); // Pede a escolha do novo status
    int novoStatus; // Variavel para armazenar a nova opcao digitada
    scanf("%d", &novoStatus); // Le o novo status numerico
    if (novoStatus >= 1 && novoStatus <= 3) { // Valida se o status informado e valido (entre 1 e 3)
        vetorPedidos[indiceEncontrado].status = novoStatus; // Atualiza o campo status no registro do vetor
        printf("[SUCESSO] Status do pedido #%d atualizado com sucesso!\n", idBusca); // Mensagem de confirmacao
    } else { // Caso o usuario tenha digitado um numero fora de 1 a 3
        printf("[ERRO] Opcao de status invalida! Operacao cancelada.\n"); // Mensagem de opcao invalida
    } // Fim da validacao do status
} // Fecha a funcao atualizarStatusPedido

// Funcao responsavel por exibir o relatorio e historico completo dos pedidos no vetor
void exibirHistoricoPedidos(Pedido vetorPedidos[], int totalPedidos) { // Recebe o vetor e a quantidade de elementos
    if (totalPedidos == 0) { // Verifica se nao ha pedidos registrados
        printf("\n[AVISO] Historico vazio. Nenhum pedido foi registrado no sistema ate o momento.\n"); // Informa historico vazio
        return; // Retorna encerrando a exibicao
    } // Fim da verificacao
    printf("\n===================================================================\n"); // Linha decorativa superior
    printf("             HISTORICO DE PEDIDOS DO RESTAURANTE (VETOR)           \n"); // Titulo central do relatorio
    printf("===================================================================\n"); // Linha decorativa divisoria
    for (int i = 0; i < totalPedidos; i++) { // Percorre cada item do vetor do indice 0 ate o final
        printf("Posicao [%02d] | ID: #%03d\n", i, vetorPedidos[i].id); // Exibe o indice no vetor e o ID formatado
        printf("Cliente       : %s\n", vetorPedidos[i].cliente); // Exibe o nome do cliente
        printf("Descricao     : %s\n", vetorPedidos[i].descricao); // Exibe o que foi pedido
        printf("Status        : "); // Exibe o rotulo de status
        if (vetorPedidos[i].status == 1) { // Avalia se o status e 1
            printf("[AGUARDANDO PREPARACAO]\n"); // Imprime o texto correspondente ao status 1
        } else if (vetorPedidos[i].status == 2) { // Avalia se o status e 2
            printf("[PRONTO PARA ENTREGA]\n"); // Imprime o texto correspondente ao status 2
        } else if (vetorPedidos[i].status == 3) { // Avalia se o status e 3
            printf("[ENTREGUE COM SUCESSO]\n"); // Imprime o texto correspondente ao status 3
        } // Fim da checagem de status
        printf("-------------------------------------------------------------------\n"); // Linha separadora entre pedidos
    } // Fim do laco de exibicao
    printf("Total de pedidos no vetor: %d de %d vagas ocupadas.\n", totalPedidos, CAPACIDADE_MAXIMA); // Exibe resumo de ocupacao
    printf("===================================================================\n"); // Linha decorativa inferior
} // Fecha a funcao exibirHistoricoPedidos

// Funcao responsavel por exportar os dados do vetor para um arquivo de texto, mantendo o historico salvo em disco
void exportarDadosDoDia(Pedido vetorPedidos[], int totalPedidos) { // Recebe o vetor de pedidos e o total de registros
    if (totalPedidos == 0) { // Verifica se ha pedidos para serem exportados
        printf("\n[AVISO] Nao ha pedidos no vetor para exportar!\n"); // Informa ao usuario que o vetor esta vazio
        return; // Encerra a funcao sem criar arquivo vazio
    } // Fim da verificacao
    char nomeArquivo[50] = "historico_pedidos_do_dia.txt"; // Define o nome padrao do arquivo de relatorio
    printf("\n--- EXPORTACAO DO HISTORICO DO DIA ---\n"); // Titulo da secao de exportacao
    printf("Salvando relatorio em '%s'...\n", nomeArquivo); // Avisa qual arquivo sera criado
    FILE *arquivo = fopen(nomeArquivo, "w"); // Abre o arquivo no modo escrita ('w'), criando ou sobrescrevendo
    if (arquivo == NULL) { // Verifica se o sistema operacional permitiu a criacao do arquivo
        printf("[ERRO] Nao foi possivel criar o arquivo no disco!\n"); // Alerta em caso de falha de permissao ou disco
        return; // Encerra a funcao caso o ponteiro seja nulo
    } // Fim do teste de abertura
    fprintf(arquivo, "===================================================================\n"); // Escreve borda no arquivo
    fprintf(arquivo, "           RELATORIO DIARIO DE PEDIDOS - FAST FOOD DELIVERY        \n"); // Escreve titulo do relatorio
    fprintf(arquivo, "===================================================================\n"); // Escreve divisoria
    for (int i = 0; i < totalPedidos; i++) { // Percorre sequencialmente todos os pedidos contidos no vetor
        fprintf(arquivo, "Posicao [%02d] | ID: #%03d\n", i, vetorPedidos[i].id); // Grava indice e ID no arquivo
        fprintf(arquivo, "Cliente       : %s\n", vetorPedidos[i].cliente); // Grava nome do cliente no arquivo
        fprintf(arquivo, "Descricao     : %s\n", vetorPedidos[i].descricao); // Grava itens do lanche no arquivo
        fprintf(arquivo, "Status        : "); // Grava o rotulo de status no arquivo
        if (vetorPedidos[i].status == 1) { // Verifica se o status e 1
            fprintf(arquivo, "[AGUARDANDO PREPARACAO]\n"); // Grava status 1 por extenso
        } else if (vetorPedidos[i].status == 2) { // Verifica se o status e 2
            fprintf(arquivo, "[PRONTO PARA ENTREGA]\n"); // Grava status 2 por extenso
        } else if (vetorPedidos[i].status == 3) { // Verifica se o status e 3
            fprintf(arquivo, "[ENTREGUE COM SUCESSO]\n"); // Grava status 3 por extenso
        } // Fim da gravacao condicional do status
        fprintf(arquivo, "-------------------------------------------------------------------\n"); // Linha divisoria
    } // Fim do laco for
    fprintf(arquivo, "Total de pedidos exportados: %d pedidos registrados hoje.\n", totalPedidos); // Grava totalizador
    fprintf(arquivo, "===================================================================\n"); // Borda final
    fclose(arquivo); // Fecha o arquivo garantindo que todos os dados sejam gravados no disco
    printf("[SUCESSO] Dados exportados com sucesso para '%s'!\n", nomeArquivo); // Mensagem amigavel de sucesso
} // Fecha a funcao exportarDadosDoDia

// Funcao principal (ponto de entrada da execucao do programa)
int main() { // Cabecalho da funcao main
    Pedido listaPedidos[CAPACIDADE_MAXIMA]; // Declara o vetor estatico capaz de comportar ate 100 pedidos
    int totalPedidos = 0; // Inicializa a quantidade de pedidos armazenados no vetor como zero
    int opcao = -1; // Variavel para armazenar a opcao escolhida pelo usuario no menu
    while (opcao != 0) { // Laco de repeticao while: executa repetidamente enquanto a opcao for diferente de 0
        printf("\n=========================================================\n"); // Borda superior do menu
        printf("     SISTEMA DE DELIVERY FAST FOOD - CONTROLE POR VETOR  \n"); // Nome do restaurante / sistema
        printf("=========================================================\n"); // Linha divisoria
        printf(" 1. Inserir novo pedido no vetor\n"); // Opcao para cadastrar pedido
        printf(" 2. Atualizar status de pedido (Preparacao / Entrega)\n"); // Opcao para avancar status
        printf(" 3. Remover pedido do vetor (Cancelar / Concluir)\n"); // Opcao para remover pedido
        printf(" 4. Exibir historico completo de pedidos\n"); // Opcao para ver a listagem
        printf(" 5. Exportar dados do dia para arquivo de texto\n"); // Opcao para salvar historico em arquivo
        printf(" 0. Sair do programa\n"); // Opcao para finalizar execucao
        printf("---------------------------------------------------------\n"); // Separador
        printf("Escolha uma opcao: "); // Solicita que o usuario digite sua escolha
        if (scanf("%d", &opcao) != 1) { // Le a opcao e valida se foi digitado um numero valido
            limparBufferEntrada(); // Limpa o buffer caso tenham digitado texto ou simbolo invalido
            printf("\n[ERRO] Entrada invalida! Por favor, digite um numero valido.\n"); // Mensagem de erro de digitacao
            continue; // Retorna para o comeco do laco do menu
        } // Fim da validacao de entrada
        switch (opcao) { // Avalia qual opcao numerica foi selecionada pelo usuario
            case 1: // Se a opcao for 1
                inserirPedidoNoVetor(listaPedidos, &totalPedidos); // Chama a funcao de insercao passando o vetor e o contador
                break; // Encerra o bloco do caso 1
            case 2: // Se a opcao for 2
                atualizarStatusPedido(listaPedidos, totalPedidos); // Chama a funcao de atualizar status
                break; // Encerra o bloco do caso 2
            case 3: // Se a opcao for 3
                removerPedidoDoVetor(listaPedidos, &totalPedidos); // Chama a funcao de remocao com deslocamento no vetor
                break; // Encerra o bloco do caso 3
            case 4: // Se a opcao for 4
                exibirHistoricoPedidos(listaPedidos, totalPedidos); // Chama a funcao que imprime o historico completo
                break; // Encerra o bloco do caso 4
            case 5: // Se a opcao for 5
                exportarDadosDoDia(listaPedidos, totalPedidos); // Chama a funcao de exportar dados para arquivo
                break; // Encerra o bloco do caso 5
            case 0: // Se a opcao for 0
                printf("\nEncerrando o sistema de pedidos. Tenha um excelente dia!\n"); // Mensagem amigavel de despedida
                break; // Encerra o bloco do caso 0
            default: // Se o usuario digitar qualquer outro numero nao listado no menu
                printf("\n[ERRO] Opcao invalida! Escolha uma opcao entre 0 e 5.\n"); // Informa que a opcao e inexistente
                break; // Encerra o bloco default
        } // Fim da estrutura switch de opcoes
    } // Fim do laco de repeticao while
    return 0; // Retorna o valor 0 ao sistema operacional indicando que o programa finalizou sem erros
} // Fecha a funcao principal main
