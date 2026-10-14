// Junta ao histórico uma planilha baixada à mão pelo botão "Exportar planilha" do jogo.
// Uso:  NOMES_SAL=... node coletor/importar-csv.mjs caminho/da/planilha.csv
//
// A planilha sai com a hora de Brasília e números no formato brasileiro (1.234,5).
import { readFile } from 'node:fs/promises';
import { codigoDoJogador, juntarAoHistorico, salDosNomes } from './historico.mjs';

const num = (s) => {
  s = String(s ?? '').trim();
  return s ? Number(s.replace(/\./g, '').replace(',', '.')) : null;
};
const sem = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

async function main() {
  const arq = process.argv[2];
  if (!arq) throw new Error('Diga o caminho do .csv.');
  const sal = salDosNomes();
  const linhas = (await readFile(arq, 'utf8')).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const sep = linhas[0].includes(';') ? ';' : ',';
  const cab = linhas[0].split(sep).map(sem);
  const c = (n) => cab.indexOf(n);
  const vendas = [];
  for (const l of linhas.slice(1)) {
    const r = l.split(sep);
    if (!/pok/i.test(r[c('tipo')] ?? '')) continue;
    const [d, h] = (r[c('data')] ?? '').split(' ');
    const em = Date.parse(`${d}T${h}:00-03:00`);
    if (!Number.isFinite(em)) continue;
    const qtd = num(r[c('quantidade')]) || 1;
    vendas.push([
      Math.floor(em / 60000), r[c('item')], num(r[c('nivel')]), /^sim$/i.test((r[c('shiny')] ?? '').trim()) ? 1 : 0,
      num(r[c('nota')]), num(r[c('iv total')]), num(r[c('potencia')]) || 1, num(r[c('qualidade')]),
      /coin|ouro/i.test(r[c('moeda')] ?? '') ? 'gold' : 'orb', num(r[c('valor total')]) / qtd,
      codigoDoJogador(r[c('vendedor')], sal), codigoDoJogador(r[c('comprador')], sal),
    ]);
  }
  const { adicionadas, total } = await juntarAoHistorico(vendas, { fonte: 'planilha manual' });
  console.log(`${vendas.length} vendas lidas; ${adicionadas} novas; ${total} no histórico.`);
}

main().catch((e) => { console.error(`Falhou: ${e.message}`); process.exit(1); });
