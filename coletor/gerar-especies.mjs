// Gera docs/dados/especies.json a partir do .csv da Pokédex do jogo (botão de exportar da Pokédex).
// Uso:  node coletor/gerar-especies.mjs caminho/pokedex.csv
//
// Formato, uma espécie por linha da lista `e`:
//   [nome, dex, tipo1, tipo2, hp, atk, def, spAtk, spDef, speed, nivelHunt, precoNpc, golpes]
//   tipo é o índice em `tipos`; golpes = [[poder, recarga_s, fisico(1)/especial(0), tipo, nivelAprende], ...]
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
  'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'];

const arq = process.argv[2];
if (!arq) { console.error('Diga o caminho do .csv da Pokédex.'); process.exit(1); }
const linhas = (await readFile(arq, 'utf8')).replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
const cab = linhas[0].split(',');
const col = (n) => cab.indexOf(n);
const t = (x) => (x ? TIPOS.indexOf(x.toUpperCase()) : -1);
const por = new Map();
for (const l of linhas.slice(1)) {
  const r = l.split(',');
  const nome = r[col('especie')];
  if (!por.has(nome)) {
    por.set(nome, [nome, +r[col('dex')], t(r[col('tipo1')]), t(r[col('tipo2')]),
      +r[col('hp')], +r[col('atk')], +r[col('def')], +r[col('spatk')], +r[col('spdef')], +r[col('spd')],
      +r[col('nivel_hunt')] || 0, +r[col('preco_npc')] || 0, []]);
  }
  if (r[col('golpe')]) {
    por.get(nome)[12].push([+r[col('poder')], +r[col('cooldown_s')], r[col('categoria')] === 'F' ? 1 : 0,
      t(r[col('tipo_golpe')]), +r[col('nivel_aprende')] || 1]);
  }
}
const saida = { fonte: path.basename(arq), tipos: TIPOS, e: [...por.values()] };
await writeFile(path.join(PASTA_DADOS, 'especies.json'), JSON.stringify(saida).replace(/\]\],\["/g, ']],\n["'));
console.log(`${saida.e.length} espécies gravadas.`);
