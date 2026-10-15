// O CATÁLOGO de espécies, refeito do jogo: docs/dados/especies.json (stats, tipos, golpes, nível da
// hunt, preço no NPC) e docs/dados/evolucoes.json (para quem, em que nível, pedra e Mega).
//
// Baixa os arquivos públicos (/assets/creatures*.json) e os módulos `shared/` do jogo — seguindo
// os imports, para pegar o que eles usam — e roda a MESMA sequência do cliente
// (carregarCatalogoEspecies em app.js). Assim um rebalanceamento de stats, golpes ou evoluções
// chega ao site sem ninguém exportar planilha. Uma vez por dia (estado.catalogoEm).
//
//   node coletor/catalogo.mjs          (sem as hunts do welcome: o preço fica o da espécie)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PASTA_DADOS } from './historico.mjs';

const BASE = 'https://pokeidle.io';
// fora do git (.gitignore): é só o cache do que o jogo serve
const PASTA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jogo', 'cache');
const TIPOS = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
  'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'];
const MODULOS = ['outland', 'golpes-planilhas', 'herdar-looktype-orre', 'herdar-looktype-outland', 'herdar-base-outland',
  'evolucoes-cruzadas', 'ajustes-especie-espelho', 'alias-item', 'venda-npc-item', 'golpes-especiais', 'sell-value',
  'herdar-golpes-orre', 'evolucoes-ramificadas', 'teto-captura', 'drops-nossos', 'megas', 'linhagem-nota', 'valor-cadeia',
  'pokedex', 'sprite-jogo'];
const ASSETS = ['creatures', 'creatures-novos', 'creatures-outland-novos', 'creatures-sprites-lab', 'creatures-audit-overrides'];

async function baixar(url) {
  const r = await fetch(BASE + url, { headers: { 'User-Agent': 'BalancaDePrecos-coletor/1.0 (+github)' } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}

/** Baixa um módulo e, recursivamente, tudo o que ele importa por caminho relativo. */
async function baixarModulo(url, vistos) {
  if (vistos.has(url)) return;
  vistos.add(url);
  const txt = await baixar(url);
  const arq = path.join(PASTA, url);
  await mkdir(path.dirname(arq), { recursive: true });
  await writeFile(arq, txt);
  const deps = [...txt.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)].map((m) => new URL(m[1], BASE + url).pathname);
  for (const d of deps) await baixarModulo(d, vistos);
}

async function baixarJogo() {
  const vistos = new Set();
  for (const m of MODULOS) await baixarModulo(`/shared/${m}.mjs`, vistos);
  const assets = {};
  for (const a of ASSETS) {
    try { assets[a] = JSON.parse(await baixar(`/assets/${a}.json`)); } catch (e) { if (a === 'creatures') throw e; assets[a] = null; }
  }
  return { assets, modulos: vistos.size };
}

const imp = (m) => import(pathToFileURL(path.join(PASTA, 'shared', `${m}.mjs`)).href); // sem ?t=: os módulos se ajustam entre si no lugar (o teto de captura reescreve a tabela das ramificadas)

/**
 * A sequência do cliente, na mesma ordem. `hunts` é a lista do welcome ([{nivel, especies:[{pokeId}]}]);
 * sem ela, o preço fica o valor-base da espécie.
 */
export async function montarCatalogo(hunts = null) {
  const { assets, modulos } = await baixarJogo();
  const M = {};
  for (const m of MODULOS) M[m] = await imp(m);
  const fn = (nome) => { for (const m of Object.values(M)) if (typeof m[nome] === 'function') return m[nome]; throw new Error(`o jogo não tem mais ${nome}()`); };

  const lista = [...(assets.creatures.creatures ?? [])];
  if (assets['creatures-novos']?.creatures?.length) lista.push(...assets['creatures-novos'].creatures);
  if (assets['creatures-outland-novos']?.creatures?.length) lista.push(...assets['creatures-outland-novos'].creatures);
  fn('aplicarRemapOutlandLista')(lista);
  for (const p of assets['creatures-sprites-lab']?.patches ?? []) {
    const c = lista.find((x) => x.pokeId === p.pokeId);
    if (c && p.looktype) c.looktype = p.looktype;
  }
  for (const o of assets['creatures-audit-overrides']?.overrides ?? []) {
    const c = lista.find((x) => x.pokeId === o.pokeId);
    if (!c) continue;
    for (const k of ['baseHp', 'baseAtk', 'baseDef', 'baseSpAtk', 'baseSpDef', 'baseSpeed']) if (typeof o[k] === 'number') c[k] = o[k];
    if (Array.isArray(o.attacks)) c.attacks = o.attacks.map((a) => ({ ...a }));
  }
  fn('aplicarGolpesDasPlanilhas')((id) => lista.filter((c) => c.pokeId === id));
  fn('herdarLooktypeOrre')(lista);
  fn('herdarLooktypeOutland')(lista);
  fn('herdarBaseOutland')(lista);
  fn('aplicarCadeiasTruncadas')(lista);
  fn('normalizarEvolveLevel600')(lista);
  fn('aplicarAjustesHuntLevel')((id) => lista.find((c) => c.pokeId === id));
  const especies = new Map();
  const isFantasma = fn('isEspelhoFantasmaPokeId'), isOutland = fn('isOutlandPokeId');
  const resolverNomeItem = fn('resolverNomeItem'), itemMorto = fn('itemMortoPorNome');
  for (const c of lista) {
    if (isFantasma(c.pokeId)) continue;
    for (const l of c.loot ?? []) l.name = resolverNomeItem(l.name);
    if (c.loot?.length) c.loot = c.loot.filter((l) => !itemMorto(l.name));
    fn('injetarGolpesEspeciais')(c);
    fn('normalizarSellValue')(c);
    if (isOutland(c.pokeId)) { c.evolvesToId = 0; c.evolveLevel = 0; }
    especies.set(c.pokeId, c);
  }
  fn('herdarGolpesOrre')(lista);
  fn('aplicarEvolucoesEntreGeracoes')(lista);
  fn('alinharNivelPadraoRamificado')(lista);
  fn('corrigirNiveisDeEvolucao')(lista);
  const { estagios } = fn('aplicarTetoDeCaptura')(lista, (id) => especies.get(id));
  fn('aplicarDropsNossos')(lista);
  for (const esp of fn('criarEspeciesMega')(lista)) { lista.push(esp); especies.set(esp.pokeId, esp); }
  fn('anotarLinhagemDaNota')(lista, (id) => especies.get(id), fn('elosMegaDaNota')(lista));
  const menor = new Map();
  for (const h of hunts ?? []) for (const e of h.especies ?? []) {
    const antes = menor.get(e.pokeId);
    if (antes == null || h.nivel < antes) menor.set(e.pokeId, h.nivel);
  }
  fn('assentarValorDasEspecies')(especies.values(), estagios, (id) => menor.get(id) ?? null);
  return { especies, M, modulos };
}

/**
 * As espécies da Pokédex, como especiesPokedex() do cliente: uma por número da Pokédex (a de menor
 * pokeId), só quem tem arte no jogo; as variantes Outland entram pelo número que o welcome dá.
 */
function especiesPokedex(especies, M, outlandDex) {
  const isOutland = M.outland.isOutlandPokeId, isFantasma = M.outland.isEspelhoFantasmaPokeId;
  const temSprite = M['sprite-jogo'].temSpriteJogo, chave = M.pokedex.chavePokedex;
  const porDex = new Map();
  for (const c of especies.values()) {
    if (isOutland(c.pokeId) || isFantasma(c.pokeId) || !temSprite(c)) continue;
    const k = chave(c.pokeId);
    if (k == null) continue;
    const ant = porDex.get(k);
    if (!ant || c.pokeId < ant.pokeId) porDex.set(k, c);
  }
  for (const c of especies.values()) {
    if (!isOutland(c.pokeId) || !temSprite(c)) continue;
    const dex = outlandDex?.pokeToDex?.[c.pokeId];
    if (dex) porDex.set(`o${dex}`, c);
  }
  return [...porDex.values()];
}

/** Uma espécie no formato de docs/dados/especies.json (as mesmas colunas do CSV da Pokédex do jogo). */
function linhaEspecie(c, M, hunts, outlandDex, antes) {
  const isOutland = M.outland.isOutlandPokeId, isMega = M.megas.isMegaPokeId;
  const dexDo = (id) => (id < 1000 || isMega(id) ? id : id % 1000);
  const dex = isOutland(c.pokeId) ? outlandDex?.pokeToDex?.[c.pokeId] ?? antes?.[1] ?? dexDo(c.pokeId) : dexDo(c.pokeId);
  // a hunt mais fácil em que aparece (huntsComEspecie: por dex, fora a Outland, que é por pokeId)
  let nivelHunt = null;
  if (hunts) {
    const casa = (e) => (isOutland(c.pokeId) ? e.pokeId === c.pokeId : !isOutland(e.pokeId) && dexDo(e.pokeId) === dexDo(c.pokeId));
    const ns = hunts.filter((h) => h.especies?.some(casa)).map((h) => Number(h.nivel) || 1);
    nivelHunt = ns.length ? Math.min(...ns) : 0;
  } else nivelHunt = antes?.[10] ?? c.huntLevel ?? 0; // sem o welcome: fica o que já se sabia
  const golpes = M['golpes-especiais'].golpesDaFicha(c);
  const t = (x) => (x ? TIPOS.indexOf(String(x).toUpperCase()) : -1);
  const lista = golpes.slice().sort((a, b) => (a.learnLevel ?? 1) - (b.learnLevel ?? 1) || String(a.name).localeCompare(String(b.name)));
  const g = lista.filter((a) => a && a.power > 0).map((a) => [
    a.power, Math.round((a.cooldownMs ?? 0) / 100) / 10, String(a.category).toUpperCase() === 'PHYSICAL' ? 1 : 0, t(a.type), a.learnLevel ?? 1,
  ]);
  return [c.name, dex, t(c.type1), c.type2 && c.type2 !== c.type1 ? t(c.type2) : -1,
    c.baseHp, c.baseAtk, c.baseDef, c.baseSpAtk, c.baseSpDef, c.baseSpeed,
    // o preço de quem só aparece em hunt alta sobe ao da hunt (assentarValorDasEspecies), o que
    // depende das hunts do welcome; sem elas, fica o preço que já se sabia
    nivelHunt, hunts || !antes ? Number(c.priceNpc) || 0 : antes[11], g];
}

/** welcome: a mensagem de entrada do jogo (hunts e outlandDex); sem ela, nível de hunt fica o anterior. */
export async function gravarCatalogo(welcome = null) {
  const hunts = Array.isArray(welcome?.hunts) && welcome.hunts.length ? welcome.hunts : null;
  const { especies, M, modulos } = await montarCatalogo(hunts);
  const atual = JSON.parse(await readFile(path.join(PASTA_DADOS, 'especies.json'), 'utf8').catch(() => '{"e":[]}'));
  const antes = new Map(atual.e.map((x) => [x[0], x]));
  const porNome = new Map();
  for (const c of especiesPokedex(especies, M, welcome?.outlandDex)) if (c?.name && !porNome.has(c.name)) porNome.set(c.name, c);
  // sem o welcome a Outland não tem número: mantém as variantes que o site já conhecia
  if (!welcome?.outlandDex) for (const c of especies.values()) if (M.outland.isOutlandPokeId(c.pokeId) && antes.has(c.name) && !porNome.has(c.name)) porNome.set(c.name, c);
  const e = [...porNome.values()].map((c) => linhaEspecie(c, M, hunts, welcome?.outlandDex, antes.get(c.name)));
  if (e.length < antes.size * 0.9) throw new Error(`catálogo encolheu (${e.length} de ${antes.size}); mantendo o anterior`);
  await writeFile(path.join(PASTA_DADOS, 'especies.json'), JSON.stringify({ fonte: `pokeidle.io/assets + shared (${new Date().toISOString().slice(0, 10)})`, tipos: TIPOS, e }));

  // evoluções (o mesmo de gerar-evolucoes.mjs, agora do catálogo inteiro)
  const ram = M['evolucoes-ramificadas'], megas = M.megas;
  const buscar = (id) => especies.get(Number(id)) ?? null;
  const out = {};
  for (const c of especies.values()) {
    if (!c?.name || out[c.name]) continue;
    const destinos = (ram.destinosDeEvolucao(c, buscar) ?? []).filter((d) => d?.especie).map((d) => ({
      nome: d.especie.name, nivel: d.nivel || c.evolveLevel || 0, tipoPedra: ram.tipoDaPedraDeEvolucao(c, d.especie) ?? c.type1,
    }));
    const mega = megas.megaDaEspecie?.(c.pokeId) ?? null;
    if (!destinos.length && !mega && !c.evolveLevel) continue;
    out[c.name] = { id: c.pokeId, nivel: c.evolveLevel || 0, destinos, ...(mega ? { mega: { nome: mega.nome, pedra: mega.pedra, tipos: mega.tipos, bases: mega.bases } } : {}) };
  }
  await writeFile(path.join(PASTA_DADOS, 'evolucoes.json'), JSON.stringify({ fonte: 'pokeidle.io/assets + shared (evolução)', especies: out }, null, 1));
  return { especies: e.length, evolucoes: Object.keys(out).length, modulos };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await gravarCatalogo();
  console.log(`${r.especies} espécies, ${r.evolucoes} com evolução ou Mega (${r.modulos} módulos do jogo).`);
}
