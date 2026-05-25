# Formato da mensagem diária do Chat

Texto pronto pra mandar pro funcionário da produção que envia a mensagem.

---

```
Oi! Pra padronizar a mensagem diária dos Air 1 em manutenção, combinamos
o seguinte formato. Esse formato vai alimentar automaticamente o nosso
dashboard de visibilidade, sem precisar ninguém cadastrar nada à parte.

📋 Formato — 1 linha por equipamento, com ponto-vírgula entre os campos:

HGID. NS ; Cliente ; Status ; Data Entrada ; Prazo Análise ; Prazo Manutenção

Exemplos:
26050604. 202508220004 ; Fernando Jorge ; Pré Calibração ; 15/05/2026 ; 22/05/2026 ; 08/06/2026
26043007. 202506130016 ; Sem cliente ; Em Calibração ; 10/05/2026 ; 17/05/2026 ; 03/06/2026
26050613. 202511250002 ; C e F Sinkos / Camila Sinkos ; Pós Calibração ; 01/05/2026 ; 08/05/2026 ; 25/05/2026

Regras:
✓ Cada linha = 1 equipamento (não precisa agrupar por bloco)
✓ Se não souber o cliente, escreve "Sem cliente"
✓ Status: Pré Calibração / Em Calibração (ou Calibrando) / Pós Calibração
✓ Datas no formato DD/MM/AAAA (15/05/2026)
✓ As 3 datas vêm da etiqueta colada no equipamento (data de entrada,
  prazo da análise, prazo da manutenção)

Manda 1 vez por dia que o sistema atualiza tudo sozinho.
Valeu!
```

---

## Notas pra Paulo (não compartilhar com o funcionário)

- O sistema também aceita formatos legados (sem datas, com traço em vez de `;`). Isso é pra não quebrar o que já existe — mas o ideal é todo mundo usar o formato acima.
- Status canônicos no sistema: `Pré-calibração`, `Em calibração`, `Pós-calibração`. O parser entende variações (com/sem acento, "Calibrando"/"Em Calibração").
- Quando o funcionário cola uma mensagem com HGID NOVO + dados completos, o sistema CRIA a linha sozinho. Você não precisa cadastrar nada.
- Quando faltam campos (ex: vem só HGID + NS sem datas), o sistema gera alerta "HGID novo sem dados completos" e você decide o que fazer.
- A coluna `data_retorno_cliente` continua manual — você marca quando souber que o equipamento foi despachado.
