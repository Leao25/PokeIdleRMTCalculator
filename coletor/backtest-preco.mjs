// Mede o erro do preço justo (docs/preco.js: o mesmo do site e do Sniper) contra vendas reais.
//
// Para cada dia de teste, o Avaliar vê só as vendas ANTERIORES àquele dia (janela de 30 dias) e
// estima cada venda real do dia com a própria ficha dela (espécie, shiny, nível, potência, nota,
// qualidade, IV), na moeda em que ela foi vendida. Erro = preço estimado ÷ preço real.
//
//   node coletor/backtest-preco.mjs [dias de teste, padrão 14]
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// as funções de preço: o mesmo docs/preco.js que o site e o Sniper ao vivo carregam
// PRECO=caminho testa uma cópia experimental do preco.js
let codigo = await readFile(process.env.PRECO || path.join(RAIZ, 'docs/preco.js'), 'utf8');
// PATCH='[["texto","troca"],…]' testa uma variação da fórmula sem mexer no site
for (const [a, b] of JSON.parse(process.env.PATCH || '[]')) { if (!codigo.includes(a)) throw new Error(`patch não achou: ${a}`); codigo = codigo.split(a).join(b); }
const criarPreco = new Function(`${codigo}
return criarPreco;`)();
const state = { moeda: 'coins', rate: 3e6, dias: 30, taxaPk: null, degraus: !!process.env.DEGRAUS };
{
  // tipos por espécie (para a regra em degraus): DEGRAUS=1 liga
  const esp = JSON.parse(await readFile(path.join(RAIZ, 'docs/dados/especies.json'), 'utf8'));
  const n = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const mapa = new Map(esp.e.map((x) => [n(x[0]), x[3] >= 0 ? [x[2], x[3]] : [x[2]]]));
  const outland = new Set(esp.e.filter((x) => x[1] >= 2001 && x[1] < 3000).map((x) => n(x[0])));
  state.outlandDe = (s) => outland.has(n(String(s).replace(/^mega\s+/i, '')));
  state.tiposDe = (s) => mapa.get(n(s)) || mapa.get(n(String(s).replace(/^mega\s+/i, '').replace(/\s+[XY]$/, ''))) || null;
}
const P = criarPreco(state);
const M = { ...P, setCache: P.limparCaches };

const indice = JSON.parse(await readFile(path.join(RAIZ, 'docs/dados/indice.json'), 'utf8'));
state.rate = Math.round((indice.cotacao?.coinsPorGema || 3e6) / 1000) * 1000;
const base = [];
for (const m of indice.meses) for (const v of JSON.parse(await readFile(path.join(RAIZ, `docs/dados/${m}.json`), 'utf8')).vendas) base.push(M.venda(...v));
base.sort((a, b) => a.min - b.min);

const DIAS = Number(process.argv[2]) || 14;
const fim = base.at(-1).min, DIA = 1440;
const res = [];
for (let d = DIAS; d >= 1; d--) {
  const ini = fim - d * DIA, fimDia = ini + DIA;
  const antes = base.filter((s) => s.min < ini && s.min >= ini - 30 * DIA);
  const teste = base.filter((s) => s.min >= ini && s.min < fimDia);
  if (antes.length < 500 || !teste.length) continue;
  for (const moeda of ['coins', 'gemas']) {
    state.moeda = moeda; M.setCache();
    state.taxaPk = M.taxaPokemon(antes);
    const { kept } = M.limpar(antes.map((s) => ({ ...s })));
    // a venda testada também passa pelo mesmo filtro de "fora da curva" (com o histórico de antes)
    const { kept: testeOk } = M.limpar([...antes.map((s) => ({ ...s })), ...teste.filter((s) => s.moeda === moeda).map((s) => ({ ...s, _t: 1 }))]);
    for (const s of testeOk.filter((x) => x._t)) {
      const f = { species: s.species, shiny: s.shiny, lvl: s.lvl, pot: s.pot, nota: s.nota, q: s.q, iv: s.iv, mega: s.mega };
      const est = M.estimate(f, kept, ini);
      if (!(est.p50 > 0)) continue;
      const nEsp = est.sameMatch.length, nPerto = est.sameMatch.filter((x) => x.lvl >= s.lvl / 1.4 && x.lvl <= s.lvl * 1.4).length;
      res.push({ q: s.q, nota: s.nota, r: est.p50 / s.gem, dentro: s.gem >= est.p25 && s.gem <= est.p75, moeda, shiny: s.shiny, lvl: s.lvl, pot: s.pot, nEsp, nPerto, misturado: !!est.ref, degrau: est.degrau, species: s.species, real: s.gem, est: est.p50 });
    }
  }
}

const med = (a) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : NaN; };
const pct = (x) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;
function resumo(nome, l) {
  if (l.length < 10) return;
  const lr = l.map((x) => Math.log(x.r));
  const erroAbs = med(lr.map(Math.abs));
  const dentro = (k) => l.filter((x) => Math.abs(Math.log(x.r)) <= Math.log(1 + k)).length / l.length;
  console.log(`${nome.padEnd(34)} n=${String(l.length).padStart(5)}  viés ${pct(Math.exp(med(lr)) - 1).padStart(5)}  erro típico ±${Math.round((Math.exp(erroAbs) - 1) * 100)}%  ±25%: ${Math.round(dentro(0.25) * 100)}%  ±50%: ${Math.round(dentro(0.5) * 100)}%  na faixa p25–p75: ${Math.round(l.filter((x) => x.dentro).length / l.length * 100)}%`);
}
console.log(`${res.length} vendas testadas (${DIAS} dias; o Avaliar só vê as vendas anteriores a cada dia)\n`);
resumo('TUDO', res);
resumo('comum · Coins', res.filter((x) => !x.shiny && x.moeda === 'coins'));
resumo('comum · Gemas', res.filter((x) => !x.shiny && x.moeda === 'gemas'));
resumo('shiny · Gemas', res.filter((x) => x.shiny && x.moeda === 'gemas'));
resumo('shiny · Coins', res.filter((x) => x.shiny && x.moeda === 'coins'));
resumo('3+ vendas da espécie perto do nível', res.filter((x) => x.nPerto >= 3));
resumo('0–2 vendas perto do nível', res.filter((x) => x.nPerto < 3));
resumo('misturado com outras espécies', res.filter((x) => x.misturado));
for (const g of [1, 2, 3]) for (const m of ['coins', 'gemas']) resumo(`degrau ${g} · ${m}`, res.filter((x) => x.degrau === g && x.moeda === m));
resumo('comum Nv ≤ 100', res.filter((x) => !x.shiny && x.lvl <= 100));
resumo('comum Nv 101–300', res.filter((x) => !x.shiny && x.lvl > 100 && x.lvl <= 300));
resumo('comum Nv > 300', res.filter((x) => !x.shiny && x.lvl > 300));
for (const p of [1, 2, 3, 4, 5]) resumo(`comum P${p}`, res.filter((x) => !x.shiny && x.pot === p));
resumo('comum qualidade ≥ 1,7', res.filter((x) => !x.shiny && x.q >= 1.7));
resumo('comum qualidade < 1,4', res.filter((x) => !x.shiny && x.q < 1.4));
if (process.env.LISTAR) for (const x of res.filter((y) => y.species === process.env.LISTAR)) console.log(x.species, x.lvl, `P${x.pot}`, x.moeda, Math.round(x.real), '→', Math.round(x.est));
if (process.env.POR_ESPECIE) {
  const by = {};
  for (const x of res.filter((y) => !y.shiny)) (by[x.species] ||= []).push(Math.log(x.r));
  const l = Object.entries(by).filter(([, a]) => a.length >= 25).map(([k, a]) => [k, a.length, Math.exp(med(a)) - 1]).sort((a, b) => b[2] - a[2]);
  console.log('\nViés por espécie (comum, 25+ vendas testadas) — mais SUPERvalorizadas:');
  for (const [k, n, b] of l.slice(0, 10)) console.log(`  ${k.padEnd(22)} n=${n}  ${pct(b)}`);
  console.log('Mais SUBvalorizadas:');
  for (const [k, n, b] of l.slice(-8)) console.log(`  ${k.padEnd(22)} n=${n}  ${pct(b)}`);
  const vies = l.map((x) => x[2]); console.log(`Espécies com viés entre −25% e +25%: ${Math.round(vies.filter((b) => Math.abs(b) <= 0.25).length / vies.length * 100)}% de ${vies.length}`);
}
