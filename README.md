# PokeIdle RMT Calculator

Quanto vale o seu pokémon no Mercado da Comunidade do PokeIdle. Você cola a ficha (botão
**Copiar p/ ChatGPT** do jogo) e o site mostra:

- o preço sugerido pelas vendas reais (rápido, justo e com paciência), já com o líquido depois da comissão;
- as vendas mais parecidas com o seu pokémon;
- o gráfico de preço da espécie ao longo do tempo;
- a nota de mercado da espécie, de 0 a 5 estrelas;
- um ranking das espécies que mais vendem.

Dá para ver em Gemas ou Coins e escolher o período: 30, 60, 90 dias ou tudo.

Ferramenta de fã, sem ligação com o PokeIdle. Pokémon é marca da Nintendo, Game Freak e The Pokémon Company.

## Como funciona

```
GitHub Actions (a cada 2 h)  →  coletor/coletar.mjs  →  docs/dados/AAAA-MM.json  →  site (docs/index.html)
```

- O **coletor** entra no jogo com uma conta própria e pede a mesma planilha do botão
  "Exportar planilha" da Tabela de preços (aba Pokémon, até 5.000 vendas dos últimos 30 dias).
- As vendas novas são somadas ao **histórico** em `docs/dados/`, um arquivo por mês, sem apagar
  nada. Os nomes dos jogadores viram códigos.
- O **site** é uma página estática no GitHub Pages; toda a conta roda no navegador de quem usa.

## Configurar (uma vez)

### 1. Secrets

Em **Settings → Secrets and variables → Actions → New repository secret**, crie três:

| Nome | O que é |
|---|---|
| `POKEIDLE_NICK` | o nick da conta do coletor |
| `POKEIDLE_TOKEN` | a sessão dessa conta (passo 2) |
| `NOMES_SAL` | o texto do arquivo `.env` local (linha `NOMES_SAL=`), que embaralha os nomes |

> A conta joga em um lugar por vez: quando o coletor entra, a sessão dela em qualquer outro lugar
> pausa. Use uma conta que não esteja caçando.

### 2. Pegar o token da conta do coletor

1. No navegador, entre no pokeidle.io com a conta do coletor.
2. Aperte **F12** → aba **Application** (ou **Aplicativo**) → **Local Storage** → `https://pokeidle.io`.
3. Na chave `sessao`, copie o valor de `token` (sem as aspas) e cole no secret `POKEIDLE_TOKEN`.
4. Feche a aba do jogo.

A sessão dura 30 dias. Quando o coletor começar a falhar com "token vencido", repita este passo.

### 3. GitHub Pages

**Settings → Pages → Build and deployment**: Source **Deploy from a branch**, branch **main**,
pasta **/docs**. O site fica em `https://<usuario>.github.io/<repositorio>/`.

### 4. Testar o coletor

**Actions → Coletar vendas → Run workflow**. Em um minuto aparece um commit "Vendas …" com os
dados novos. Depois disso ele roda sozinho a cada 2 horas.

## Rodar no PC

```bash
npm install
npx http-server docs -p 8123     # o site em http://localhost:8123
```

Somar uma planilha baixada à mão ao histórico (precisa do mesmo `NOMES_SAL` do secret):

```bash
node --env-file=.env coletor/importar-csv.mjs caminho/da/planilha.csv
```
