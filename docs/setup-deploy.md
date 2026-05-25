# Deploy no GitHub Pages

Como colocar o dashboard no ar, acessível pra qualquer um da empresa por uma URL fixa.

**Pré-requisito:** ter acesso à organização `health-go` no GitHub (ver com TI).

## 1. Criar o repositório no GitHub

1. Acesse https://github.com/health-go
2. Botão **New repository** (verde, canto superior direito)
3. **Repository name:** `manutencao-air1`
4. **Description:** `Dashboard de visibilidade dos Air 1 em manutenção`
5. **Visibilidade:** combine com TI. Recomendado **Privado** se possível (mantém o link de acesso só pra quem você compartilhar).
6. **NÃO** marque "Add a README file" (já temos um localmente).
7. Clique em **Create repository**.

## 2. Subir o código

Abra um terminal **dentro da pasta do projeto**:

```bash
cd "C:/Users/healthgo/Paulo-claude/projetos/sistema-manutencao-air1"
```

E rode:

```bash
git init
git add .
git commit -m "feat: MVP inicial do dashboard"
git branch -M main
git remote add origin https://github.com/health-go/manutencao-air1.git
git push -u origin main
```

Vai pedir login do GitHub na primeira vez (use Personal Access Token, não senha).

**Se você usar SSH em vez de HTTPS:**
```bash
git remote add origin git@github.com:health-go/manutencao-air1.git
```

## 3. Ativar o GitHub Pages

1. No GitHub, abra o repo `health-go/manutencao-air1`.
2. Vá em **Settings** (engrenagem no topo).
3. Menu lateral esquerdo → **Pages**.
4. **Source:** "Deploy from a branch".
5. **Branch:** `main` → pasta `/ (root)` → **Save**.
6. Espere 1-2 min.
7. A URL aparece no topo da página: algo como `https://health-go.github.io/manutencao-air1/`

## 4. Validar

Abra a URL no navegador. Deve aparecer o dashboard com os dados da sua planilha — igual ao que você viu rodando localmente, só que agora público (na URL fixa).

## 5. Compartilhar com os times

Mande a URL nos grupos do Chat de:
- Suporte
- Produção
- Operação

Sugestão de mensagem:

```
Pessoal, boa tarde.

Acabamos de subir o Sistema de Manutenção Air 1 — um dashboard
pra todo mundo enxergar quais equipamentos estão na fábrica e
quanto tempo cada um já está em manutenção.

📊 Acesse: https://health-go.github.io/manutencao-air1/

O que ele mostra:
- Quantos Air 1 estão em ciclo de SLA agora
- Quantos estouraram o limite (vermelho)
- Quantos estão chegando no limite (amarelo)
- Tempo médio cliente→cliente

Como funciona:
- Os dados vêm da nossa planilha de controle
- O dashboard atualiza sozinho a cada 2 minutos
- Dá pra alternar entre Kanban e Lista

Dúvidas? Me chamem.

Paulo
```

## 6. (Opcional) Domínio customizado

Se quiser `manutencao-air1.healthgo.com.br`:

1. Pede pra TI configurar um registro CNAME apontando `manutencao-air1.healthgo.com.br` → `health-go.github.io`
2. No GitHub Pages, em "Custom domain", coloca `manutencao-air1.healthgo.com.br` e Save.
3. Espera propagação DNS (até 24h).

## 7. Atualizar o dashboard depois

Se você (ou eu) mudar algum arquivo do projeto:

```bash
git add .
git commit -m "fix: descrição da mudança"
git push
```

Em 1-2 min, o site no GitHub Pages atualiza sozinho.
