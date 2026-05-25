# Prompt para Open Design — Sistema de Manutenção Air 1

Prompt completo para gerar o mockup visual do dashboard. Copie todo o bloco abaixo e cole na sua ferramenta de AI design (Open Design, v0.dev, Penpot AI, Pencil, Figma AI, etc).

---

## Prompt (copiar tudo abaixo)

```
Build a single-page web dashboard called "Manutenção Air 1" for HealthGo, a
Brazilian healthtech company specializing in respiratory diagnostic equipment.

CONTEXT
The dashboard shows respiratory diagnostic equipment (Air 1 model) currently
under maintenance at the factory. It gives the support, production, and
operations teams visibility into which units have exceeded SLA, which are
approaching the limit, and the current status of each unit in the maintenance
workflow.

VISUAL IDENTITY (HealthGo brand)
Use exactly these colors via CSS variables:
- Primary: #233A4A (deep navy — used for headings and primary text)
- Accent: #62AADD (sky blue — used for interactive elements and primary KPI)
- Background: #F8FAFB (off-white page background)
- Card surface: #FFFFFF (cards on top of bg)
- Border: #E5EBF0 (subtle borders)
- Text body: #344955 (slate)
- Subtle text: #6B7F8E (secondary labels)
- Success: #2E7D5B (green — within SLA)
- Warning: #D4A843 (mustard yellow — approaching SLA limit)
- Error: #C75050 (crimson red — SLA exceeded)

Typography: Inter (Google Fonts). Hierarchy:
- H1 page title: 24px, weight 600, color #233A4A
- KPI labels: 12px uppercase, letter-spacing 0.5px, color #6B7F8E
- KPI values: 36px, weight 700
- Card titles: 14px uppercase, color #233A4A
- Body: 14px, color #344955

Border radius: 12px on cards, 8px on smaller elements.
Spacing: 16-24px between major sections; 8-12px inside cards.

PAGE STRUCTURE (top to bottom)

1. HEADER
   - H1: "Manutenção Air 1" (color #233A4A, font weight 600)
   - No subtitle, no logo (keep minimal).

2. KPI BAR (4 cards in a horizontal row, equal width, 16px gap)
   Each card has: small uppercase label on top, big number below.

   Card 1 — "EM CICLO SLA" / value 18 (color #62AADD)
   Card 2 — "ESTOURADOS" / value 3 (color #C75050)
   Card 3 — "NO LIMITE" / value 5 (color #D4A843)
   Card 4 — "TEMPO MÉDIO" / value "15 dias" (color #6B7F8E)

3. CONTROLS BAR (single row, 16px below KPIs)
   - Left: segmented button "Kanban | Lista" (Kanban is active = blue background #62AADD with white text; Lista is white with #344955 text)
   - Middle: two dropdown filters labeled "Todos os status" and "Todos os clientes"
   - Right: small italic text "Atualizado às 14:32"

4. MAIN VIEW (alternates between two states)

   STATE A — KANBAN (default, show this first)
   Three columns side by side, equal width, 16px gap.
   Each column has:
   - White card background, 12px border-radius, 1px border #E5EBF0, 12px padding
   - Column title uppercase: "PRÉ-CALIBRAÇÃO", "EM CALIBRAÇÃO", "PÓS-CALIBRAÇÃO"
   - Title shows count in parentheses, e.g. "EM CALIBRAÇÃO (6)"
   - Below title, a thin divider line
   - Stack of equipment cards inside

   Each equipment card:
   - Light gray background (#F8FAFB), 8px border-radius, 12px padding, 8px gap
   - Colored circle indicator on top-right corner (12px diameter)
     - Green #2E7D5B for within SLA
     - Yellow #D4A843 for approaching limit (SLA: cliente→cliente, 24 days default)
     - Red #C75050 for exceeded
   - Line 1 (bold, color #233A4A): HGID like "26942501"
   - Line 2 (small, color #6B7F8E): serial number like "20260504007"
   - Line 3 (color #344955): client name like "Paula Nazareno" (may be blank if not assigned)
   - Line 4 (small, color #6B7F8E): "12 dias" (days since equipment left the client)

   STATE B — LISTA (show as alternative state)
   Single white card with rounded corners containing a table.
   Columns: HGID | Nº Série | Cliente | Status | Saída do Cliente | Dias | SLA
   Header row: bg #F8FAFB, color #233A4A, font weight 600, clickable cursor.
   Body rows: 14px font, hover bg light blue.
   The HGID column has a small colored circle (8px) before the text, indicating SLA state.
   The "SLA" column shows text like "OK" (green), "Limite" (yellow), or "Estourado" (red).
   The "Saída do Cliente" column shows the date when equipment was picked up from the client (start of SLA clock).

5. ALERTS BAR (bottom, only visible if alerts exist)
   - Thin strip with white background, 1px border #D4A843, 8px border-radius, 12px padding
   - Warning emoji ⚠️ + text "2 alertas: 1 HGID novo no Chat sem cadastro · 1 HGID sumiu há 3 dias"
   - Right side: text button "Ver detalhes" in #62AADD

SAMPLE DATA for the Kanban (HGIDs and serial numbers in the real HealthGo format,
clients are real client names from the production sample):

Pré-calibração (3 cards):
- 26050701 / 202605060006 / Aleksandra Menezes / 4 dias / green
- 26051106 / 202511030001 / Kaline Bezerra / 6 dias / green
- 26050704 / 202605120004 / (no client) / 8 dias / green

Em calibração (4 cards):
- 26051108 / 202604280003 / (no client) / 15 dias / green
- 26051304 / 202605190007 / (no client) / 19 dias / yellow
- 26050615 / 20260522001 / (no client) / 22 dias / yellow
- 25051115 / 202506130018 / (no client) / 28 dias / red

Pós-calibração (3 cards):
- 26942501 / 20260504007 / (no client) / 12 dias / green
- 26051305 / 202509020003 / Paula Nazareno / 20 dias / yellow
- 26050613 / 202511250002 / Camila Sinkos / 26 dias / red

For the List view, use the same data flattened into a table.

LAYOUT NOTES
- Desktop first (1440px width target). Layout should be visually clean and
  scannable from across a room (this may show on a TV in the production
  area).
- KPI numbers should be VERY large and bold so they're readable from distance.
- The red "Estourados" KPI should grab attention — make it pop.
- Spacing must be generous, not cramped. Treat the whole UI as professional
  healthcare software: clinical, trustworthy, calm.
- Avoid gradients except subtle ones if used. Avoid drop shadows on cards
  (use 1px border for elevation instead).
- No icons except the warning emoji in the alerts bar and the colored circles
  on cards.

DELIVERABLE
Show me the dashboard in the Kanban state (State A) as the main view.
If the tool allows multiple frames, also show the Lista state (State B) as a
second variant.

Use semantic HTML where possible: <section>, <table>, <button>.
```

---

## Notas pra você (Paulo)

1. **Tudo em inglês** — IA designers geram melhor com inglês.
2. **Cores hex literais** — não dependo da ferramenta entender "HG brand". Coloquei os HEX exatos.
3. **Dados de exemplo realistas** — clientes brasileiros, HGIDs sequenciais, dias variados.
4. **Pede dois estados** — Kanban (principal) e Lista (alternativo). Se a ferramenta só gerar um, foque no Kanban.
5. **Resolução desktop** — 1440px, pensando em TV da produção também.

**Iteração esperada:** o primeiro resultado raramente é perfeito. Use os botões de "refinar" da ferramenta pedindo coisas tipo:
- "Make the 'Estourados' KPI more prominent"
- "Reduce the size of the controls bar"
- "Show the alert bar in a more subtle way"

Quando estiver satisfeito, exporta como PNG/SVG e cola na pasta `recursos/` do workspace pra referência futura.
