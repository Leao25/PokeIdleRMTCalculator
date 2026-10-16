/**
 * Modelo de preço ajustado nos dados (16/10/2026). O coletor ajusta toda hora e grava
 * docs/dados/modelo.json; o site e o Sniper (via @require) só leem e preveem. O preco.js mistura
 * a previsão com as vendas parecidas da própria espécie (ver estimate()).
 *
 * log(preço) = efeitos fixos (potência, nível e nível², nota, qualidade, IV, mega, Outland,
 *              popularidade da espécie, e a curva de nível que muda no P4/P5 e na Outland)
 *            + efeito do TIPO principal (encolhido para 0)
 *            + efeito da ESPÉCIE (encolhido para o do tipo: 1 venda pesa pouco, 30 pesam muito)
 *            + efeito da ESPÉCIE NAQUELA POTÊNCIA (encolhido para o da espécie)
 * Um ajuste por moeda (Gemas e Coins são mercados diferentes) e por shiny/comum, no preço na moeda
 * da venda. Vendas recentes pesam mais (meia-vida de 7 dias). A faixa vem dos resíduos do grupo.
 *
 * Medido (backtest de 14 dias, 10.945 vendas): erro típico ±89% → ±78% (com a mistura), P5 comum
 * ±150% → ±89%, shiny ±49% → ±41%; faixa p25–p75 contém 49% das vendas.
 *
 *   const M = criarModelo();
 *   const dados = M.ajustarTudo(vendas, fimMin, especies)   // coletor: vendas = limpar().kept
 *   M.prever(dados, ficha, "gemas" | "coins")               // → { p20, p25, p35, p50, p65, p75, p80 } na moeda
 */
function criarModelo(opts = {}) {
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const semMega = (s) => norm(String(s).replace(/^mega\s+/i, "").replace(/\s+[XY]$/, ""));
  const LAMBDA_ESP = Number(opts.lambdaEsp ?? 3), LAMBDA_TIPO = Number(opts.lambdaTipo ?? 20), MEIA_VIDA = Number(opts.meiaVida ?? 7);
  // os resíduos dentro da amostra saem um pouco mais apertados que os de vendas novas (medido: ×1,1 → 49% na p25–p75)
  const ESCALA_FAIXA = Number(opts.escalaFaixa ?? 1.1);
  const QS = { p20: 0.2, p25: 0.25, p35: 0.35, p50: 0.5, p65: 0.65, p75: 0.75, p80: 0.8 };
  const fin = (x, d) => (Number.isFinite(x) ? x : d);
  const mediana = (a) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : NaN; };
  const r4 = (x) => Math.round(x * 1e4) / 1e4;

  // esp: { nomeNormalizado: [tipoPrincipal, outland 0|1] }
  const tipoDe = (esp, sp) => String(esp[semMega(sp)]?.[0] ?? "?");
  const outlandDe = (esp, sp) => (esp[semMega(sp)]?.[1] ? 1 : 0);

  function xDe(f, med, pop, esp) {
    const L = Math.log(Math.max(1, fin(f.lvl, med.lvl))) - med.L, p = f.pot || 1, out = outlandDe(esp, f.species);
    const nota = fin(f.nota, med.nota) - med.nota;
    return [1, p === 2 ? 1 : 0, p === 3 ? 1 : 0, p === 4 ? 1 : 0, p === 5 ? 1 : 0,
      L, L * L, nota, fin(f.q, med.q) - med.q, (fin(f.iv, med.iv) - med.iv) / 50,
      f.mega ? 1 : 0, out, Math.log1p(pop[norm(f.species)] || 0) - med.pop,
      p >= 4 ? L : 0, p === 5 ? L : 0, out * L, p >= 3 ? nota : 0];
  }

  function resolver(A, b) { // eliminação de Gauss com pivô
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      const d = M[c][c] || 1e-9;
      for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / d; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
    }
    return M.map((r, i) => r[n] / (r[i] || 1e-9));
  }

  function ajustarGrupo(vs, fimMin, esp) {
    if (vs.length < 30) return null;
    const med = { lvl: mediana(vs.map((s) => s.lvl).filter((x) => x > 0)) || 100, nota: mediana(vs.map((s) => s.nota).filter(Number.isFinite)),
      q: mediana(vs.map((s) => s.q).filter(Number.isFinite)), iv: mediana(vs.map((s) => s.iv).filter(Number.isFinite)) };
    med.L = Math.log(med.lvl);
    for (const k of ["nota", "q", "iv"]) if (!Number.isFinite(med[k])) med[k] = 0;
    const pop = {}; for (const s of vs) pop[norm(s.species)] = (pop[norm(s.species)] || 0) + 1;
    med.pop = mediana(vs.map((s) => Math.log1p(pop[norm(s.species)])));
    const X = vs.map((s) => xDe(s, med, pop, esp)), y = vs.map((s) => Math.log(s.price));
    const w = vs.map((s) => Math.pow(0.5, Math.max(0, (fimMin - s.min) / 1440) / MEIA_VIDA));
    const ce = vs.map((s) => norm(s.species)), ct = vs.map((s) => tipoDe(esp, s.species)), cp = vs.map((s, i) => ce[i] + "|" + (s.pot || 1));
    const k = X[0].length;
    let beta = new Array(k).fill(0), uE = new Map(), uT = new Map(), uP = new Map();
    const g = (m, c) => m.get(c) || 0;
    // média encolhida de um efeito, dado o resto
    const encolher = (chaves, resto, lambda) => {
      const s = new Map(), ws = new Map();
      for (let i = 0; i < y.length; i++) { const c = chaves[i]; s.set(c, (s.get(c) || 0) + w[i] * resto(i)); ws.set(c, (ws.get(c) || 0) + w[i]); }
      return new Map([...s].map(([c, v]) => [c, v / (ws.get(c) + lambda)]));
    };
    let fixo = new Array(y.length).fill(0);
    for (let it = 0; it < 8; it++) {
      // efeitos fixos (ridge leve, fora o intercepto)
      const A = Array.from({ length: k }, () => new Array(k).fill(0)), b = new Array(k).fill(0);
      for (let i = 0; i < y.length; i++) {
        const r = y[i] - g(uT, ct[i]) - g(uE, ce[i]) - g(uP, cp[i]);
        for (let a = 0; a < k; a++) { b[a] += w[i] * X[i][a] * r; for (let c = 0; c < k; c++) A[a][c] += w[i] * X[i][a] * X[i][c]; }
      }
      for (let a = 1; a < k; a++) A[a][a] += 1;
      beta = resolver(A, b);
      fixo = X.map((x) => x.reduce((acc, v, j) => acc + v * beta[j], 0));
      uT = encolher(ct, (i) => y[i] - fixo[i] - g(uE, ce[i]) - g(uP, cp[i]), LAMBDA_TIPO);
      uE = encolher(ce, (i) => y[i] - fixo[i] - g(uT, ct[i]) - g(uP, cp[i]), LAMBDA_ESP);
      uP = encolher(cp, (i) => y[i] - fixo[i] - g(uT, ct[i]) - g(uE, ce[i]), LAMBDA_ESP);
    }
    const res = y.map((v, i) => ({ r: v - fixo[i] - g(uT, ct[i]) - g(uE, ce[i]) - g(uP, cp[i]), w: w[i] })).sort((a, b) => a.r - b.r);
    const tot = res.reduce((a, x) => a + x.w, 0);
    const qRes = (p) => { let acc = 0; for (const x of res) { acc += x.w; if (acc / tot >= p) return x.r; } return res.at(-1).r; };
    const d50 = qRes(0.5);
    const desl = Object.fromEntries(Object.entries(QS).map(([nome, p]) => [nome, r4(d50 + (qRes(p) - d50) * ESCALA_FAIXA)]));
    const obj = (m) => Object.fromEntries([...m].map(([c, v]) => [c, r4(v)]).filter(([, v]) => v !== 0));
    return { n: vs.length, med: Object.fromEntries(Object.entries(med).map(([c, v]) => [c, r4(v)])), beta: beta.map(r4), uT: obj(uT), uE: obj(uE), uP: obj(uP), desl, pop };
  }

  /**
   * Ajusta tudo: vendas = limpar().kept (com price na moeda da venda), especies = docs/dados/especies.json
   * (lista e: [nome, dex, t1, t2, …]; Outland = dex 2001–2999).
   */
  function ajustarTudo(vendas, fimMin, especies) {
    const esp = {};
    for (const x of especies?.e || []) esp[norm(x[0])] = [x[2], x[1] >= 2001 && x[1] < 3000 ? 1 : 0];
    const out = { versao: 1, em: new Date(fimMin * 60000).toISOString(), especies: esp };
    for (const moeda of ["gemas", "coins"]) {
      const da = vendas.filter((s) => s.moeda === moeda && s.price > 0);
      out[moeda] = { comum: ajustarGrupo(da.filter((s) => !s.shiny), fimMin, esp), shiny: ajustarGrupo(da.filter((s) => s.shiny), fimMin, esp) };
    }
    return out;
  }

  /** Previsão na moeda (Gemas ou Coins de verdade), ou null sem modelo para o grupo. */
  function prever(dados, f, moeda) {
    const g = dados?.[moeda]?.[f.shiny ? "shiny" : "comum"];
    if (!g || !f?.species) return null;
    const esp = dados.especies || {};
    const x = xDe(f, g.med, g.pop, esp), sp = norm(f.species);
    const m = x.reduce((acc, v, j) => acc + v * g.beta[j], 0) + (g.uT[tipoDe(esp, f.species)] || 0) + (g.uE[sp] || 0) + (g.uP[sp + "|" + (f.pot || 1)] || 0);
    const o = {};
    for (const [k, d] of Object.entries(g.desl)) o[k] = Math.exp(m + d);
    return o;
  }

  return { ajustarTudo, prever };
}
if (typeof module !== "undefined" && module.exports) module.exports = { criarModelo };
