// As vendas de diamante e a cotação Gema ↔ Coins que sai delas.
//
// O diamante é vendido nas duas moedas, então o preço dele em Coins dividido pelo preço em Gemas diz
// quantos Coins vale uma Gema. O jogo mostra a média de 7 dias, que demora a acompanhar um preço que
// muda rápido; aqui a conta usa as vendas das últimas 24 horas.
//
// docs/dados/diamantes.json guarda as vendas dos últimos 30 dias (sem nomes) e a série das cotações
// calculadas, para o site poder mostrar a variação depois.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const ARQ = path.join(PASTA_DADOS, 'diamantes.json');
const DIA = 24 * 3600 * 1000;
const MIN_VENDAS = 8;          // por moeda, para a janela valer
const JANELAS = [1, 2, 7];     // dias: tenta a mais curta primeiro

async function ler() {
  try { return JSON.parse(await readFile(ARQ, 'utf8')); } catch { return { vendas: [], cotacoes: [] }; }
}

/** Junta as vendas lidas agora às guardadas (sem repetir) e corta o que passou de 30 dias. */
export async function juntarDiamantes(lidas) {
  const dados = await ler();
  const chave = (v) => `${v.em}|${v.moeda}|${v.bruto}|${v.qtd}`;
  const vistas = new Set(dados.vendas.map(chave));
  let novas = 0;
  for (const v of lidas) if (!vistas.has(chave(v))) { vistas.add(chave(v)); dados.vendas.push(v); novas++; }
  const corte = Date.now() - 30 * DIA;
  dados.vendas = dados.vendas.filter((v) => v.em >= corte).sort((a, b) => a.em - b.em);
  await writeFile(ARQ, JSON.stringify(dados).replace(/\},\{/g, '},\n{'));
  return { novas };
}

/**
 * Preço médio por diamante, pesado pela quantidade (um lote de 500 pesa mais que um de 1), sem os
 * 10% mais baratos e os 10% mais caros. Média e não mediana: em Gemas o diamante sai por 6, 7 ou 8
 * inteiros, e a mediana pularia de degrau em degrau (6 → 7 é 17% de diferença na cotação).
 */
function medianaPorUnidade(vendas) {
  const xs = vendas.map((v) => ({ p: v.bruto / v.qtd, w: v.qtd })).sort((a, b) => a.p - b.p);
  const tot = xs.reduce((a, x) => a + x.w, 0);
  const lo = tot * 0.1, hi = tot * 0.9;
  let acc = 0, soma = 0, peso = 0;
  for (const x of xs) {
    const ini = acc, fim = acc + x.w;
    acc = fim;
    const dentro = Math.max(0, Math.min(fim, hi) - Math.max(ini, lo));
    soma += dentro * x.p; peso += dentro;
  }
  return peso ? soma / peso : NaN;
}

/** A cotação da janela mais curta que tenha vendas nas duas moedas; senão, a média de 7 dias do jogo. */
export async function calcularCotacao(media7 = {}) {
  const dados = await ler();
  let cot = null;
  for (const dias of JANELAS) {
    const desde = Date.now() - dias * DIA;
    const orb = dados.vendas.filter((v) => v.moeda === 'orb' && v.em >= desde);
    const gold = dados.vendas.filter((v) => v.moeda === 'gold' && v.em >= desde);
    if (orb.length < MIN_VENDAS || gold.length < MIN_VENDAS) continue;
    const gemas = medianaPorUnidade(orb), coins = medianaPorUnidade(gold);
    if (!(gemas > 0 && coins > 0)) continue;
    cot = {
      coinsPorGema: coins / gemas, gemasPorDiamante: gemas, coinsPorDiamante: coins,
      janela: dias === 1 ? 'últimas 24 h' : `últimos ${dias} dias`,
      vendas: { orb: orb.length, gold: gold.length },
      diamantes: { orb: orb.reduce((a, v) => a + v.qtd, 0), gold: gold.reduce((a, v) => a + v.qtd, 0) },
    };
    break;
  }
  if (!cot && media7.orb?.media > 0 && media7.gold?.media > 0) {
    cot = {
      coinsPorGema: media7.gold.media / media7.orb.media, gemasPorDiamante: media7.orb.media, coinsPorDiamante: media7.gold.media,
      janela: 'média de 7 dias do jogo', vendas: null, diamantes: { orb: media7.orb.unidades ?? null, gold: media7.gold.unidades ?? null },
    };
  }
  if (!cot) return null;
  cot.em = new Date().toISOString();
  cot.media7Jogo = media7.orb?.media && media7.gold?.media ? media7.gold.media / media7.orb.media : null;
  dados.cotacoes = [...(dados.cotacoes ?? []), { em: cot.em, coinsPorGema: Math.round(cot.coinsPorGema), janela: cot.janela }].slice(-2000);
  await writeFile(ARQ, JSON.stringify(dados).replace(/\},\{/g, '},\n{'));
  return cot;
}
