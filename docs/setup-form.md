# Setup do Google Form

Guia passo a passo para criar o formulário que vai receber a mensagem diária do Chat.

**Pré-requisito:** Planilha `Manutenção Air 1` já criada (Tarefa 2).

## 1. Criar o formulário

1. Vá em https://forms.google.com → "Em branco"
2. Título: `Mensagem diária Air 1`
3. Descrição: `Cole aqui a mensagem diária do grupo do Chat sobre os equipamentos em manutenção.`

## 2. Adicionar a pergunta

1. Pergunta: `Mensagem do dia`
2. Tipo: **Parágrafo** (texto longo, não "Resposta curta")
3. Obrigatório: **Sim**

## 3. Conectar à planilha

1. No Form, vá na aba **Respostas** (no topo)
2. Clique no ícone do Google Sheets (verde, escrito "Vincular ao Sheets")
3. Escolha: **Selecionar planilha existente**
4. Escolha `Manutenção Air 1`
5. Confirme.
6. Volte na planilha — vai ter uma nova aba `Respostas ao formulário 1`. **Renomeie para `respostas_form`** (clique duas vezes no nome da aba).

## 4. Obter o link do Form

1. No Form, clique em **Enviar** (canto superior direito)
2. Ícone de link 🔗
3. Marque "Encurtar URL"
4. Copie o link curto

**Salve esse link em local fácil de achar** (favoritos do navegador, atalho no desktop, etc). Você vai abrir esse link uma vez por dia para colar a mensagem.

## 5. Validação

- Abra o link do Form
- Cole uma mensagem de teste qualquer (ex: "teste")
- Clique em Enviar
- Volte na planilha, aba `respostas_form` — confirme que a linha apareceu com:
  - Coluna A: timestamp (data/hora)
  - Coluna B: "teste"
- Apague a linha de teste depois.

## Checklist final

- [ ] Formulário criado com 1 campo "Mensagem do dia" (parágrafo, obrigatório)
- [ ] Form conectado à planilha
- [ ] Aba criada na planilha foi renomeada para `respostas_form`
- [ ] Link do Form salvo
- [ ] Mensagem de teste enviada com sucesso e apareceu na aba `respostas_form`

**Quando terminar:** me avisa que terminou. Próximo passo (Tarefa 13) é configurar o Apps Script.
