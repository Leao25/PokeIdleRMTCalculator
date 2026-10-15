// RECONHECIMENTO (uma vez): o ranking de PvP ("elo"), o painel de PvP e o perfil do 1º colocado,
// para saber se dá para montar o meta (quais espécies os melhores usam). Grava só a ESTRUTURA em
// docs/dados/_formato-pvp.json: nomes de campos, tipos, tamanhos. Texto só entra se for curto e de
// um campo que não identifica ninguém; nomes de espécie ficam (é o que interessa).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const PESSOAL = /nick|nome|vendedor|comprador|dono|autor|jogador|apelido|capturad|caught|player|user|email|guild|tag|bio|titulo/i;
const ESPECIE = /^(species|especie|speciesNome|pokemon|nomeEspecie)$/i;

function forma(v, chave = '', prof = 0) {
  if (v == null) return v;
  if (Array.isArray(v)) return { lista: v.length, item: v.length ? forma(v[0], chave, prof + 1) : null, segundo: v.length > 1 ? forma(v[1], chave, prof + 1) : undefined };
  if (typeof v === 'object') {
    if (prof > 7) return 'objeto';
    const out = {};
    for (const [k, x] of Object.entries(v).slice(0, 80)) out[k] = forma(x, k, prof + 1);
    return out;
  }
  if (typeof v === 'string') return ESPECIE.test(chave) ? `"${v}"` : PESSOAL.test(chave) || v.length > 24 ? `texto(${v.length})` : `"${v}"`;
  return v;
}

export async function explorarPvp(sessao) {
  const r = { em: new Date().toISOString() };
  let primeiro = null;
  try {
    const m = await sessao.pedir({ t: 'ranking.pedir', aba: 'elo' }, (x) => x.t === 'ranking' && x.aba === 'elo', 10000);
    r.rankingElo = forma(m);
    primeiro = (m.linhas ?? [])[0]?.nick ?? null;
  } catch (e) { r.rankingElo = `falhou: ${e.message}`; }
  try { r.pvpInfo = forma(await sessao.pedir({ t: 'pvp.info' }, (x) => x.t === 'pvp', 10000)); } catch (e) { r.pvpInfo = `falhou: ${e.message}`; }
  if (primeiro) {
    try { r.perfilDoPrimeiro = forma(await sessao.pedir({ t: 'ranking.perfil', nick: primeiro }, (x) => x.t === 'perfil', 10000)); } catch (e) { r.perfilDoPrimeiro = `falhou: ${e.message}`; }
  }
  await writeFile(path.join(PASTA_DADOS, '_formato-pvp.json'), JSON.stringify(r, null, 1));
  console.log('Reconhecimento do PvP gravado em docs/dados/_formato-pvp.json.');
}
