// docs/dados/referencia.json: a tabela de preços de referência que o Sniper ao vivo (o script do
// Tampermonkey) baixa uma vez por hora. Para cada espécie + shiny + potência, a mediana dos últimos
// 30 dias em cada moeda, o nível típico dessas vendas e quantas foram; e a taxa Gema ↔ Coins do
// mercado de pokémon (quem compra pokémon em Gemas paga bem mais caro que em Coins).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const especieDe = (d) => String(d).replace(/\s+Nv\.?\s*\d[\d.]*\s*$/i, '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
const mediana = (a) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };

export async function gerarReferencia() {
  const indice = JSON.parse(await readFile(path.join(PASTA_DADOS, 'indice.json'), 'utf8'));
  const corte = Math.floor((Date.now() - 30 * 864e5) / 60000);
  const vendas = [];
  for (const m of indice.meses.slice(-2)) {
    const d = JSON.parse(await readFile(path.join(PASTA_DADOS, `${m}.json`), 'utf8'));
    for (const v of d.vendas) if (v[0] >= corte) vendas.push(v);
  }
  // [minuto, descricao, nivel, shiny, nota, iv, potencia, qualidade, moeda, valor, ...]
  const grupos = {};
  for (const v of vendas) {
    const ehGema = v[8] === 'orb';
    if (ehGema ? v[9] < 3 : v[9] < 1e5) continue; // transferências
    const k = `${especieDe(v[1])}|${v[3] ? 1 : 0}|${v[6] || 1}`;
    const g = (grupos[k] ||= { gold: [], orb: [] });
    g[ehGema ? 'orb' : 'gold'].push([v[9], v[2] || 1]);
  }
  const pk = {};
  const razoes = { 0: [], 1: [] };
  for (const [k, g] of Object.entries(grupos)) {
    const lado = (l) => l.length ? { med: mediana(l.map((x) => x[0])), lvl: mediana(l.map((x) => x[1])), n: l.length } : null;
    pk[k] = { gold: lado(g.gold), orb: lado(g.orb) };
    if (g.gold.length >= 2 && g.orb.length >= 2) razoes[k.split('|')[1]].push(pk[k].gold.med / pk[k].orb.med);
  }
  const comum = razoes[0].length >= 8 ? mediana(razoes[0]) : null;
  const taxa = { comum, shiny: razoes[1].length >= 8 ? mediana(razoes[1]) : comum, diamante: indice.cotacao?.coinsPorGema ?? null };
  await writeFile(path.join(PASTA_DADOS, 'referencia.json'), JSON.stringify({ em: new Date().toISOString(), dias: 30, taxa, pk }));
  return Object.keys(pk).length;
}
