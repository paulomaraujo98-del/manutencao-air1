# Setup da Planilha Google

Guia passo a passo para criar (ou atualizar) a planilha que é a fonte de dados do dashboard.

## 1. Criar a planilha

1. https://sheets.google.com → "Em branco"
2. Nome: `Manutenção Air 1`

## 2. Criar as 4 abas

Clicando no `+` no rodapé:

| Aba | Função |
|---|---|
| `equipamentos` | Dados principais (1 linha = 1 Air 1) |
| `respostas_form` | Criada automaticamente quando você conectar o Form |
| `alertas` | Avisos gerados pelo Apps Script |
| `configuracoes` | Parâmetros editáveis |

## 3. Aba `equipamentos` — 9 colunas

Cabeçalho (linha 1):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| hgid | numero_serie | cliente | data_entrada | prazo_analise | prazo_manutencao | status_atual | data_retorno_cliente | observacoes |

**Significado:**

| Coluna | O que é | Quem preenche |
|---|---|---|
| `hgid` | Identificador do equipamento | Apps Script (automático, ao ver HGID novo na mensagem) |
| `numero_serie` | Número de série | Apps Script |
| `cliente` | Cliente que tinha o equipamento (vem da etiqueta) | Apps Script |
| `data_entrada` | Quando o equipamento chegou na fábrica (etiqueta) | Apps Script |
| `prazo_analise` | Prazo para finalizar a análise (etiqueta) | Apps Script |
| `prazo_manutencao` | Prazo para finalizar manutenção (etiqueta). É contra esse prazo que o SLA é medido. | Apps Script |
| `status_atual` | Pré-calibração / Em calibração / Pós-calibração | Apps Script (atualiza a cada submissão) |
| `data_retorno_cliente` | Quando o equipamento foi despachado de volta. Equipamento "sai" do dashboard quando essa célula é preenchida. | **Paulo manual** |
| `observacoes` | Notas livres | **Paulo manual (opcional)** |

**Formatação:** colunas D, E, F, H → Formatar → Número → Data.

## 4. Aba `configuracoes`

Cabeçalho linha 1: `chave | valor | descricao`

| A (chave) | B (valor) | C (descrição) |
|---|---|---|
| `dias_amarelo_antes_prazo` | 3 | Dias antes do prazo_manutencao para alerta amarelo |
| `dias_sumido_para_alerta` | 3 | Dias que um HGID pode sumir da mensagem antes de gerar alerta |
| `intervalo_refresh_dashboard_min` | 2 | Frequência do auto-refresh do dashboard em minutos |

## 5. Aba `alertas`

Cabeçalho linha 1: `data | tipo | hgid | mensagem`. Linhas vazias — Apps Script preenche.

## 6. Compartilhar como público leitor

1. Compartilhar (canto superior direito) → "Acesso geral" → **Qualquer pessoa com o link** → **Leitor**
2. Concluído

## 7. Copiar o ID da planilha

Na URL: `https://docs.google.com/spreadsheets/d/AQUI_O_ID/edit`. Anota o ID.

## 8. Validação

Tudo pronto? Verifique:

- [ ] Aba `equipamentos` com 9 colunas no cabeçalho
- [ ] Colunas de data formatadas como Data (não Número)
- [ ] Aba `configuracoes` com 3 parâmetros
- [ ] Aba `alertas` com cabeçalho
- [ ] Planilha pública para leitor
- [ ] ID anotado

---

## Migração — se você já tem uma planilha antiga (versão 1.0)

Se sua planilha foi criada com a versão antiga (antes da mudança de 2026-05-25, que usava `data_saida_cliente`, `data_chegada_fabrica`, etc), faz assim:

### Na aba `equipamentos`

1. **Excluir colunas obsoletas:**
   - `problema_detectado` (era coluna D)
   - `data_saida_cliente` (era coluna E)

2. **Renomear coluna:**
   - `data_chegada_fabrica` → `data_entrada`

3. **Inserir 2 colunas novas:**
   - Após `data_entrada`, inserir `prazo_analise` (formatada como Data)
   - Após `prazo_analise`, inserir `prazo_manutencao` (formatada como Data)

4. **Resultado final:** 9 colunas (hgid, numero_serie, cliente, data_entrada, prazo_analise, prazo_manutencao, status_atual, data_retorno_cliente, observacoes).

5. **Preencher prazo_manutencao das linhas existentes** (importante! Sem isso o SLA não calcula): para cada linha, coloca a data limite de manutenção.

### Na aba `configuracoes`

1. **Excluir linhas obsoletas:**
   - `limite_sla_dias`
   - `alerta_amarelo_pct`

2. **Adicionar linha nova:**
   - chave: `dias_amarelo_antes_prazo`, valor: `3`, descrição: `Dias antes do prazo_manutencao para alerta amarelo`

3. **Resultado final:** 3 parâmetros (`dias_amarelo_antes_prazo`, `dias_sumido_para_alerta`, `intervalo_refresh_dashboard_min`).
