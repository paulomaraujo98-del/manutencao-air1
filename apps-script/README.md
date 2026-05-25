# Apps Script — Setup

Esse "robô" lê o Google Form que você submete diariamente e atualiza a coluna `status_atual` dos equipamentos cadastrados na planilha.

## 1. Abrir o editor de Apps Script da planilha

1. Abra a planilha `Manutenção Air 1` no Google Sheets.
2. Menu **Extensões** → **Apps Script**.
3. Vai abrir uma nova aba do navegador com o editor de código.

## 2. Colar o código

1. No editor, vai ter um arquivo `Code.gs` aberto com `function myFunction() {}` ou algo parecido.
2. **Apaga tudo** que está lá (Ctrl+A → Delete).
3. **Cola** o conteúdo do arquivo `apps-script/Code.gs` deste repo.
4. **Salva** (Ctrl+S ou ícone de disquete).
5. Vai pedir nome do projeto: coloca `Manutenção Air 1 — Apps Script`.

## 3. Testar o parser ANTES de configurar trigger

1. No editor, no topo, tem um menu suspenso de funções (geralmente diz "função selecionada" ou nome de alguma função).
2. Escolhe a função `testParser`.
3. Clica em **Executar** (botão ao lado).
4. Vai pedir permissões na primeira execução — **autorize** com sua conta @healthgo.com.br.
5. No menu lateral, ícone de "Execuções" (parece um relógio): vai mostrar a última execução.
6. Clica nela pra ver os logs. Deve aparecer no final: `✓ Todos os testes passaram`.

**Se aparecer FALHOU:** me avisa. O parser ainda precisa de ajuste.

## 4. Criar o trigger (gatilho automático)

1. No editor, ícone do **relógio** (⏰) no menu lateral esquerdo → **Acionadores**.
2. Botão **+ Adicionar acionador** (canto inferior direito).
3. Configure:
   - **Função a ser executada:** `onFormSubmit`
   - **Implantação:** `Head`
   - **Origem do evento:** `Da planilha`
   - **Tipo de evento:** `Ao enviar o formulário`
4. **Salvar**.

## 5. Teste end-to-end (com o Form)

1. Abre o link do Google Form (Tarefa 3).
2. Cola uma mensagem de teste:
   ```
   Pós Calibração
   HGID.       NS
   99999999.   99999999999
   ```
3. Submete.
4. Volta na planilha:
   - **Aba `equipamentos`:** se HGID `99999999` (linha de teste) estiver cadastrado, a coluna `status_atual` deve ter mudado pra `Pós-calibração`.
   - **Aba `alertas`:** se NÃO estiver cadastrado, deve aparecer uma linha nova com tipo "HGID não cadastrado".

## 6. Onde ver os logs (debugging)

Sempre que algo der errado: editor Apps Script → menu lateral **Execuções**. Lá você vê o histórico de cada vez que o trigger rodou, com o erro detalhado.
