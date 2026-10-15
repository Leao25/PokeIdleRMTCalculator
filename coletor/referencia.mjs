// docs/dados/referencia.json: a tabela de preços de referência que o Sniper ao vivo (o script do
// Tampermonkey) baixa uma vez por hora. Segue a mesma ideia do preço justo do site:
//
// · pk["espécie|shiny|potência"] = { gold, orb }: em cada moeda, a mediana dos últimos 30 dias, o
//   nível típico, quantas vendas e os níveis delas (para saber quantas foram perto do nível do
//   anúncio) e os pares [nível, preço] (pts);
// · faixa["shiny|potência|faixa de nível"] = { gold, orb }: a mediana de QUALQUER espécie naquela
//   faixa de nível (meia oitava: Nv 362–512, 512–724…). Quando a espécie quase não tem vendas
//   perto do nível do anúncio, o script mistura as duas, como o laudo do site;
// · taxa: Coins por Gema no mercado de pokémon (quem compra pokémon em Gemas paga bem mais caro).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const especieDe = (d) => String(d).replace(/\s+Nv\.?\s*\d[\d.]*\s*$/i, '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
const mediana = (a) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };
/** Faixa de nível em meia oitava: Nv 100 → 13, Nv 453 → 18 (round(2·log2(nível))). */
export const faixaDoNivel = (n) => Math.round(2 * Math.log2(Math.max(1, n)));

export async function gerarReferencia() {
  const indice = JSON.parse(await readFile(path.join(PASTA_DADOS, 'indice.json'), 'utf8'));
  const corte = Math.floor((Date.now() - 30 * 864e5) / 60000);
  const vendas = [];
  for (const m of indice.meses.slice(-2)) {
    const d = JSON.parse(await readFile(path.join(PASTA_DADOS, `${m}.json`), 'utf8'));
    for (const v of d.vendas) if (v[0] >= corte) vendas.push(v);
  }
  // [minuto, descricao, nivel, shiny, nota, iv, potencia, qualidade, moeda, valor, ...]
  const grupos = {}, faixas = {};
  for (const v of vendas) {
    const ehGema = v[8] === 'orb';
    if (ehGema ? v[9] < 3 : v[9] < 1e5) continue; // transferências
    const sh = v[3] ? 1 : 0, pot = v[6] || 1, lvl = v[2] || 1, lado = ehGema ? 'orb' : 'gold';
    ((grupos[`${especieDe(v[1])}|${sh}|${pot}`] ||= { gold: [], orb: [] })[lado]).push([v[9], lvl]);
    ((faixas[`${sh}|${pot}|${faixaDoNivel(lvl)}`] ||= { gold: [], orb: [] })[lado]).push(v[9]);
  }
  const pk = {};
  const razoes = { 0: [], 1: [] };
  for (const [k, g] of Object.entries(grupos)) {
    // pts: [nível, preço] de cada venda (até 60), para o script usar as vendas de nível parecido em vez
    // de esticar a mediana geral pelo nível (o Rhyperior P2 Nv 500 saía 357M com as vendas reais em ~200M)
    const lado = (l) => l.length ? { med: mediana(l.map((x) => x[0])), lvl: mediana(l.map((x) => x[1])), n: l.length, niveis: l.map((x) => x[1]).slice(0, 60), pts: l.slice(0, 60).map((x) => [x[1], x[0]]) } : null;
    pk[k] = { gold: lado(g.gold), orb: lado(g.orb) };
    if (g.gold.length >= 2 && g.orb.length >= 2) razoes[k.split('|')[1]].push(pk[k].gold.med / pk[k].orb.med);
  }
  const faixa = {};
  for (const [k, g] of Object.entries(faixas)) {
    const lado = (l) => l.length >= 4 ? { med: mediana(l), n: l.length } : null;
    const x = { gold: lado(g.gold), orb: lado(g.orb) };
    if (x.gold || x.orb) faixa[k] = x;
  }
  const comum = razoes[0].length >= 8 ? mediana(razoes[0]) : null;
  const taxa = { comum, shiny: razoes[1].length >= 8 ? mediana(razoes[1]) : comum, diamante: indice.cotacao?.coinsPorGema ?? null };
  await writeFile(path.join(PASTA_DADOS, 'referencia.json'), JSON.stringify({ em: new Date().toISOString(), dias: 30, versao: 2, taxa, pk, faixa }));
  return Object.keys(pk).length;
}
