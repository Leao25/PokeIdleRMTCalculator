// As REGRAS do jogo e o DETECTOR de atualização.
//
// · docs/dados/regras.json — o que o jogo manda na mensagem de entrada (tabela de tipos, ampliação
//   da hunt, HP e dano do selvagem, captura, chance de shiny, potências) mais a comissão do Mercado
//   (shared/taxa-mercado.mjs, público). O site usa esses números no lugar dos escritos à mão.
// · docs/dados/versao-jogo.json — a "impressão digital" (sha256) do código do jogo, da wiki e dos
//   módulos de regras. Quando muda, guarda a data, e a wiki nova vai para coletor/jogo/ (o histórico
//   do git mostra o que mudou).
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PASTA_DADOS } from './historico.mjs';

const BASE = 'https://pokeidle.io';
const PASTA_JOGO = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jogo');
const ARQUIVOS = { app: '/app.js', wiki: '/pokepedia.mjs', taxas: '/shared/taxa-mercado.mjs', valores: '/shared/sell-value.mjs', nota: '/shared/nota-pokemon.mjs' };

async function lerJson(arq, padrao) { try { return JSON.parse(await readFile(arq, 'utf8')); } catch { return padrao; } }
async function baixar(url) {
  const r = await fetch(BASE + url, { headers: { 'User-Agent': 'BalancaDePrecos-coletor/1.0 (+github)' } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}

/** A comissão do Mercado, do módulo público do jogo (sem dependências). */
async function lerComissao() {
  await mkdir(PASTA_JOGO, { recursive: true });
  const arq = path.join(PASTA_JOGO, 'taxa-mercado.mjs');
  await writeFile(arq, await baixar(ARQUIVOS.taxas));
  const m = await import(pathToFileURL(arq).href + `?t=${Date.now()}`);
  return {
    faixasOrbPokemon: m.FAIXAS_ORB.map((f) => ({ ate: Number.isFinite(f.ate) ? f.ate : null, taxa: f.bp / 10000 })),
    orbPlana: m.TAXA_ORB_PLANA, gold: m.TAXA_GOLD,
  };
}

export async function gravarRegras(welcome) {
  const regras = { em: new Date().toISOString() };
  if (welcome) {
    for (const k of ['tabelaTipos', 'ampliacaoHunt', 'multHpSelvagem', 'multDanoSelvagem', 'captura', 'chanceShiny', 'potencias', 'multShinyStats', 'maxEquipe']) {
      if (welcome[k] != null) regras[k] = welcome[k];
    }
  }
  try { regras.comissao = await lerComissao(); } catch (e) { console.log(`Comissão: ${e.message}`); }
  // as hunts do mapa, com quantos de cada espécie nascem por onda ("pontos"): o ritmo de abates
  // depende do tamanho da onda (pausa de ~2,6 s entre ondas, até 16 por onda)
  console.log(`Welcome: hunts ${Array.isArray(welcome?.hunts) ? welcome.hunts.length : typeof welcome?.hunts}; campos ${Object.keys(welcome ?? {}).length} (${Object.keys(welcome ?? {}).filter((k) => /hunt|mapa|area|spawn/i.test(k)).join(', ') || 'nenhum de hunt'}).`);
  if (Array.isArray(welcome?.hunts) && welcome.hunts.length) {
    await writeFile(path.join(PASTA_DADOS, 'hunts.json'), JSON.stringify({
      em: regras.em,
      campos: Object.keys(welcome.hunts[0]),
      hunts: welcome.hunts.map((h) => ({
        nome: h.nome, slug: h.slug, nivel: h.nivel, regiao: h.regiao, area: h.area,
        especies: (h.especies ?? []).map((e) => ({ pokeId: e.pokeId, pontos: e.pontos ?? 1, ...Object.fromEntries(Object.entries(e).filter(([k, v]) => !['pokeId', 'pontos'].includes(k) && typeof v === 'number')) })),
      })),
    }));
  }
  // mantém o que já se sabia quando a entrada não trouxe (por exemplo, a coleta que não entrou no jogo)
  const antigo = await lerJson(path.join(PASTA_DADOS, 'regras.json'), {});
  const final = { ...antigo, ...regras };
  await writeFile(path.join(PASTA_DADOS, 'regras.json'), JSON.stringify(final, null, 1));
  return final;
}

export async function verificarVersao() {
  const arq = path.join(PASTA_DADOS, 'versao-jogo.json');
  const antes = await lerJson(arq, { impressoes: {} });
  const impressoes = {}, mudaram = [];
  let wiki = null;
  for (const [nome, url] of Object.entries(ARQUIVOS)) {
    try {
      const txt = await baixar(url);
      impressoes[nome] = createHash('sha256').update(txt).digest('hex').slice(0, 16);
      if (nome === 'wiki') wiki = txt;
      if (antes.impressoes?.[nome] && antes.impressoes[nome] !== impressoes[nome]) mudaram.push(nome);
    } catch (e) { impressoes[nome] = antes.impressoes?.[nome] ?? null; console.log(`Versão do jogo: ${e.message}`); }
  }
  const agora = new Date().toISOString();
  const novo = { verificadoEm: agora, impressoes, mudouEm: mudaram.length ? agora : antes.mudouEm ?? null, mudaram: mudaram.length ? mudaram : antes.mudaram ?? [] };
  if (!antes.impressoes || !Object.keys(antes.impressoes).length) novo.primeiraVez = agora;
  await writeFile(arq, JSON.stringify(novo, null, 1));
  // a wiki fica guardada a cada mudança: o git mostra a diferença
  if (wiki && (mudaram.includes('wiki') || !antes.impressoes?.wiki)) {
    await mkdir(PASTA_JOGO, { recursive: true });
    await writeFile(path.join(PASTA_JOGO, 'pokepedia.mjs'), wiki);
  }
  if (mudaram.length) console.log(`O JOGO MUDOU: ${mudaram.join(', ')}.`);
  return novo;
}
