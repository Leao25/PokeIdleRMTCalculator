// O META do PvP: os times dos 100 primeiros da escada do PvP Ranqueado, para o site mostrar quais
// espécies o topo usa e quão longe um pokémon está delas.
//
// · A escada (pvp.info → ladder) traz posição, pontos e tier dos 100 primeiros.
// · O time de cada um vem do perfil público (ranking.perfil → perfil.pvpTime): até 5 pokémon com a
//   ficha inteira. Para não esbarrar no limite de mensagens do jogo, lê POR_COLETA perfis por
//   coleta, em rodízio (estado.pvpRodizio): o top 100 se renova a cada ~8 coletas.
// · docs/dados/pvp-meta.json guarda posição e time, SEM o nick (só um código embaralhado com o
//   sal dos nomes, para juntar as leituras do mesmo jogador).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS, codigoDoJogador } from './historico.mjs';

const ARQ = path.join(PASTA_DADOS, 'pvp-meta.json');
const POR_COLETA = 12;
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
async function lerJson(arq, padrao) { try { return JSON.parse(await readFile(arq, 'utf8')); } catch { return padrao; } }

/** Um pokémon do time, compacto: só o que o site usa. */
function pokemonDoTime(p) {
  return {
    sp: p.speciesId, nome: p.nome, tipos: p.tipos, nv: p.level, pot: p.potencia ?? 1, q: p.quality, nota: p.nota, poder: p.poder,
    shiny: !!p.shiny, tm: p.tmElemental ?? null, aoe: !!p.tmAoe, refino: p.refinoTotal ?? 0, ivs: p.ivs ?? null, stats: p.stats ?? null,
  };
}

export async function atualizarMetaPvp(sessao, estado, sal) {
  const info = await sessao.pedirComCalma({ t: 'pvp.info' }, (x) => x.t === 'pvp', 10000);
  const ladder = Array.isArray(info?.ladder) ? info.ladder : [];
  if (!ladder.length) throw new Error('a escada do PvP veio vazia');
  const antes = await lerJson(ARQ, { jogadores: [] });
  const porCodigo = new Map(antes.jogadores.map((j) => [j.id, j]));
  const agora = new Date().toISOString();
  // a escada de agora manda na posição; o time é o último lido
  const jogadores = ladder.slice(0, 100).map((l) => {
    const id = codigoDoJogador(l.nick, sal);
    const ja = porCodigo.get(id);
    return { id, pos: l.posicao ?? l.pos, pts: l.pontos, tier: l.tierId, div: l.divisaoNum || '', v: l.vitorias, d: l.derrotas, time: ja?.time ?? null, timeEm: ja?.timeEm ?? null, _nick: l.nick };
  });
  // rodízio: primeiro quem nunca foi lido, depois o mais antigo
  const fila = jogadores.slice().sort((a, b) => (a.timeEm ? Date.parse(a.timeEm) : 0) - (b.timeEm ? Date.parse(b.timeEm) : 0)).slice(0, POR_COLETA);
  let lidos = 0;
  for (const j of fila) {
    try {
      const m = await sessao.pedirComCalma({ t: 'ranking.perfil', nick: j._nick }, (x) => x.t === 'perfil', 10000);
      const time = m?.perfil?.pvpTime;
      if (Array.isArray(time)) { j.time = time.map(pokemonDoTime); j.timeEm = agora; lidos++; }
    } catch (e) { /* fica com o time antigo; tenta na próxima */ }
    await pausa(700);
  }
  for (const j of jogadores) delete j._nick;
  await writeFile(ARQ, JSON.stringify({ em: agora, total: info.totalClassificados ?? null, corteFinal: info.corteFinal ?? null, jogadores }, null, 0).replace(/\},\{"id"/g, '},\n{"id"'));
  estado.pvpMetaEm = agora;
  return { lidos, comTime: jogadores.filter((j) => j.time).length, total: jogadores.length };
}
