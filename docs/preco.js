/**
 * Preço justo do PokeIdle RMT Calculator — o MESMO código no site (docs/index.html) e no Sniper ao
 * vivo (docs/sniper-ao-vivo.user.js, via @require). Mexeu aqui, mudou nos dois.
 *
 * criarPreco(state) devolve as funções, que leem do state: moeda ("gemas" | "coins", a unidade em
 * que o preço sai), rate (Coins por Gema do diamante), taxaPk (Coins por Gema no mercado de
 * pokémon, de taxaPokemon) e dias (janela).
 *
 * Mudanças na fórmula: medir antes com  node coletor/backtest-preco.mjs  (vendas reais).
 */
function criarPreco(state) {
  const quant = (s, p) => { if (!s.length) return NaN; const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };

  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  // ---------- vendas ----------
  const speciesOf = (desc) => String(desc).replace(/\s+Nv\.?\s*\d[\d.]*\s*$/i, "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();

  function venda(min, desc, lvl, shiny, nota, iv, pot, q, moeda, valor, vend, comp) {
    const species = speciesOf(desc);
    return { date: new Date(min * 60000), min, desc, species, mega: /^mega\s/i.test(species),
      base: species.replace(/^mega\s+/i, "").replace(/\s+[XY]$/, ""), lvl, shiny: !!shiny, nota, iv, pot: pot || 1, q,
      moeda: moeda === "gold" ? "coins" : "gemas", price: valor, seller: vend, buyer: comp };
  }

  /**
   * Quantos Coins vale uma Gema NO MERCADO DE POKÉMON. Não é a cotação do diamante: quem compra
   * pokémon em Gemas paga, em Coins equivalentes, bem mais caro que quem compra em Coins (medido:
   * ~0,5M Coins por Gema no comum, contra ~3,3M do diamante). Mede-se nos grupos (espécie +
   * potência + shiny) vendidos nas duas moedas: mediana em Coins ÷ mediana em Gemas, e a mediana
   * disso entre os grupos. Sem grupos suficientes (o shiny quase só vende em Gemas), usa a do comum.
   */
  let taxaCache = null;

  function taxaPokemon(vendas) {
    if (taxaCache?.n === vendas.length) return taxaCache.taxa;
    const medi = (a) => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
    const calc = (sh) => {
      const by = {};
      for (const s of vendas) {
        if (s.shiny !== sh) continue;
        const k = s.species + "|" + s.pot, b = (by[k] ||= { g: [], o: [] });
        if (s.moeda === "coins" && s.price >= 1e5) b.g.push(s.price);
        if (s.moeda === "gemas" && s.price >= 3) b.o.push(s.price);
      }
      const r = Object.values(by).filter((b) => b.g.length >= 2 && b.o.length >= 2).map((b) => medi(b.g) / medi(b.o));
      return r.length >= 8 ? Math.min(state.rate * 1.5, Math.max(state.rate / 20, medi(r))) : null;
    };
    const comum = calc(false) ?? state.rate;
    const taxa = { comum, shiny: calc(true) ?? comum };
    taxaCache = { n: vendas.length, taxa };
    return taxa;
  }

  /** Preço de uma venda ou anúncio de pokémon na unidade interna (Gemas; em Coins, ÷ cotação do diamante para exibir certo). */
  function emExibicao(preco, moedaVenda, shiny) {
    const taxa = state.taxaPk?.[shiny ? "shiny" : "comum"] || state.rate;
    const ehGema = moedaVenda === "gemas" || moedaVenda === "orb";
    if (state.moeda === "coins") return (ehGema ? preco * taxa : preco) / state.rate;
    return ehGema ? preco : preco / taxa;
  }

  const gemOf = (s) => emExibicao(s.price, s.moeda, s.shiny);

  function limpar(raw) {
    const kept = [], gone = [], by = {};
    // A curva é por espécie + shiny + potência: um P5 comum vale dezenas de vezes um P1 da mesma espécie.
    raw.forEach((s) => { s.gem = gemOf(s); (by[`${s.species}|${s.shiny ? 1 : 0}|${s.pot}`] ||= []).push(s); });
    for (const k in by) {
      const list = by[k], med = quant(list.map((s) => s.gem).sort((a, b) => a - b), 0.5);
      for (const s of list) {
        // Piso na moeda da venda (não convertido): 2 Gemas ou 2 Coins é transferência, não preço.
        // Comum barato vende mesmo por 5–7 Gemas, então o piso em Gema é baixo.
        if (!(s.moeda === "gemas" ? s.price >= 3 : s.price >= 100000)) gone.push({ s, why: "valor simbólico" });
        // Margem larga: no comum, nível e nota mudam muito o preço; a mediana ponderada já segura o resto.
        else if (list.length >= 4 && (s.gem < med / 15 || s.gem > med * 25)) gone.push({ s, why: "fora da curva" });
        else kept.push(s);
      }
    }
    return { kept, gone };
  }

  // ---------- estimativa ----------
  function dist(f, s) {
    const d = (a, b, sc) => Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) / sc : 0.5;
    return d(f.pot, s.pot, 1) * 1.2 + d(f.nota, s.nota, 0.5) + d(f.q, s.q, 0.2) * 0.6 + d(f.iv, s.iv, 25) * 0.6
      + d(Math.log2(f.lvl || 1), Math.log2(s.lvl || 1), 1.5) * 1 + (!!f.mega !== s.mega ? 2 : 0) + (f.shiny !== s.shiny ? 4 : 0)
      + (norm(f.species) !== norm(s.species) ? 2.5 : 0);
  }

  function wQuant(items, p) {
    if (!items.length) return NaN;
    if (items.length === 1) return items[0].v;
    const tot = items.reduce((a, x) => a + x.w, 0);
    // posição de cada venda = meio do seu trecho no peso acumulado; entre duas, interpola (em log)
    let acc = 0;
    const pts = items.map((x) => { const c = (acc + x.w / 2) / tot; acc += x.w; return [c, Math.log(x.v)]; });
    if (p <= pts[0][0]) return Math.exp(pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      if (p <= pts[i][0]) { const [c0, v0] = pts[i - 1], [c1, v1] = pts[i]; return Math.exp(v0 + (v1 - v0) * (p - c0) / (c1 - c0 || 1)); }
    }
    return Math.exp(pts.at(-1)[1]);
  }

  /**
   * Quanto o nível mexe no preço, medido no próprio mercado: dentro de cada espécie + potência,
   * a inclinação de log(preço) contra log(nível). No comum dá perto de 1 (o preço acompanha o
   * nível); no shiny, perto de 0 (o que vale é o brilho). Recalculado quando os dados mudam.
   */
  let elasticCache = null;

  function elasticidadeNivel(kept) {
    if (elasticCache?.kept === kept) return elasticCache.beta;
    const beta = {};
    for (const sh of [false, true]) {
      const by = {};
      for (const s of kept) if (s.shiny === sh && s.lvl > 0 && s.gem > 0) (by[`${s.species}|${s.pot}`] ||= []).push(s);
      let sxy = 0, sxx = 0;
      for (const g of Object.values(by)) {
        if (g.length < 4) continue;
        const lx = g.map((s) => Math.log(s.lvl)), ly = g.map((s) => Math.log(s.gem));
        const mx = lx.reduce((a, b) => a + b, 0) / g.length, my = ly.reduce((a, b) => a + b, 0) / g.length;
        g.forEach((_, i) => { sxy += (lx[i] - mx) * (ly[i] - my); sxx += (lx[i] - mx) ** 2; });
      }
      beta[sh ? "shiny" : "comum"] = sxx > 0 ? Math.max(0, Math.min(1.3, sxy / sxx)) : 0;
    }
    elasticCache = { kept, beta };
    return beta;
  }

  function estimate(f, kept, fimMin) {
    const same = kept.filter((s) => norm(s.species) === norm(f.species));
    const sameMatch = same.filter((s) => s.shiny === f.shiny);
    const anyMatch = kept.filter((s) => s.shiny === f.shiny);
    const pool = sameMatch.length >= 3 ? sameMatch : anyMatch;
    const janela = state.dias || 90;
    // Cada venda é levada ao nível da ficha antes de entrar na conta (fator entre 1/8 e 8).
    const beta = elasticidadeNivel(kept)[f.shiny ? "shiny" : "comum"];
    const ajuste = (s) => Number.isFinite(f.lvl) && f.lvl > 0 && s.lvl > 0 ? Math.min(8, Math.max(1 / 8, (f.lvl / s.lvl) ** beta)) : 1;
    const items = pool.map((s) => {
      const d = dist(f, s), age = (fimMin - s.min) / 1440;
      // a moeda escolhida manda: Gemas e Coins são dois mercados com preços diferentes, e a outra moeda só
      // completa (×30; medido no teste contra vendas reais: o comum em Gemas errava ±150% com ×4, ±135% com ×30).
      // Venda recente pesa mais: meia-vida de 7 dias (o mercado muda rápido).
      const peso = s.moeda === state.moeda ? 30 : 1;
      return { s, d, v: s.gem * ajuste(s), w: peso * Math.exp(-d) * Math.pow(0.5, Math.max(age, 0) / 7) };
    }).filter((x) => x.w > 0).sort((a, b) => a.v - b.v);
    const sw = items.reduce((a, x) => a + x.w, 0), sw2 = items.reduce((a, x) => a + x.w * x.w, 0);
    // o fator típico aplicado (média ponderada), para o laudo explicar quando for grande
    const fatorNivel = sw ? Math.exp(items.reduce((a, x) => a + x.w * Math.log(x.v / x.s.gem), 0) / sw) : 1;
    const est = { same, sameMatch, fallback: sameMatch.length < 3, items, ess: sw2 ? sw * sw / sw2 : 0, beta, fatorNivel,
      p25: wQuant(items, 0.25), p50: wQuant(items, 0.5), p75: wQuant(items, 0.75) };

    // Pouca venda da espécie perto do nível da ficha? Mistura com o que pokémon do mesmo grupo
    // (shiny ou comum), de nível, nota e potência parecidos, venderam — de qualquer espécie.
    if (Number.isFinite(f.lvl) && f.lvl > 0) {
      const perto = (s) => s.lvl >= f.lvl / 1.4 && s.lvl <= f.lvl * 1.4;
      const nPerto = sameMatch.filter(perto).length;
      const pesoEspecie = nPerto / (nPerto + 3);
      if (pesoEspecie < 0.75) {
        let viz = anyMatch.filter((s) => perto(s) && (!Number.isFinite(f.nota) || !Number.isFinite(s.nota) || Math.abs(s.nota - f.nota) <= 0.5));
        const mesmaP = viz.filter((s) => s.pot === f.pot);
        if (mesmaP.length >= 8) viz = mesmaP;
        if (viz.length >= 6) {
          const vi = viz.map((s) => ({ s, v: s.gem, w: 1 })).sort((a, b) => a.v - b.v);
          const ref = { p25: wQuant(vi, 0.25), p50: wQuant(vi, 0.5), p75: wQuant(vi, 0.75) };
          const mix = (a, b) => !Number.isFinite(a) ? b : Math.exp(pesoEspecie * Math.log(a) + (1 - pesoEspecie) * Math.log(b));
          est.ref = { n: viz.length, nPerto, pesoEspecie, ...ref, mesmaP: viz === mesmaP };
          est.p25 = mix(est.p25, ref.p25); est.p50 = mix(est.p50, ref.p50); est.p75 = mix(est.p75, ref.p75);
        }
      }
    }
    return est;
  }

  /**
   * A PROCURA da espécie: quantas vendas (mesmo shiny ou comum) nos últimos 30 dias contra quantos
   * anúncios abertos. O preço justo só aprende com quem VENDEU; espécie que quase não vende (um
   * Nidoking comum: 1 venda no histórico inteiro) fica com o preço genérico de outras espécies, e
   * quem anuncia por ele pode ficar parado. Isto não muda o número: avisa.
   *   vendas30: vendas da espécie no grupo nos últimos 30 dias · abertos: anúncios abertos no grupo
   */
  function procura(vendas30, abertos) {
    const v = Number(vendas30) || 0, a = Number(abertos) || 0;
    const nivel = v <= 2 || (a >= 4 && v < a / 2) ? "baixa" : v >= 15 && v >= a ? "alta" : "média";
    return { vendas: v, abertos: a, nivel };
  }
  /** Quantas vendas por espécie|shiny nos últimos 30 dias (a partir das vendas cruas, antes do filtro de período). */
  function vendasPorEspecie(vendas, fimMin) {
    const ini = fimMin - 30 * 1440, m = new Map();
    for (const s of vendas) if (s.min >= ini && s.min <= fimMin) { const k = norm(s.species) + "|" + (s.shiny ? 1 : 0); m.set(k, (m.get(k) || 0) + 1); }
    return m;
  }

  /** Esquece as contas guardadas (taxa e elasticidade): chamar quando o histórico for recarregado. */
  const limparCaches = () => { taxaCache = null; elasticCache = null; };
  return { quant, norm, speciesOf, venda, taxaPokemon, emExibicao, gemOf, limpar, dist, wQuant, elasticidadeNivel, estimate, limparCaches, procura, vendasPorEspecie };
}
if (typeof module !== 'undefined' && module.exports) module.exports = { criarPreco };
