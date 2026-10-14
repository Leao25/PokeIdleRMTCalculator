// Gera docs/dados/evolucoes.json: para cada espécie, em que nível evolui, para quem, com qual pedra,
// e qual a Mega dela. Usa os arquivos públicos do jogo (/assets/creatures*.json) e os módulos
// `shared/` de evolução do próprio jogo, baixados antes numa pasta à parte:
//
//   node coletor/gerar-evolucoes.mjs <pasta-do-jogo>
//   (<pasta-do-jogo>/assets/creatures*.json e <pasta-do-jogo>/shared/*.mjs)
//
// O pipeline segue a ordem do cliente do jogo (carregarCatalogoEspecies em app.js).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PASTA_DADOS } from './historico.mjs';

const pasta = process.argv[2];
if (!pasta) { console.error('Diga a pasta com assets/ e shared/ do jogo.'); process.exit(1); }
const mod = (m) => import(pathToFileURL(path.resolve(pasta, 'shared', m)).href);
const ler = async (f) => { try { return JSON.parse(await readFile(path.resolve(pasta, 'assets', f), 'utf8')).creatures ?? []; } catch { return []; } };

const cruz = await mod('evolucoes-cruzadas.mjs');
const ram = await mod('evolucoes-ramificadas.mjs');
const teto = await mod('teto-captura.mjs');
const megas = await mod('megas.mjs');
const outland = await mod('outland.mjs');

const lista = [...await ler('creatures.json'), ...await ler('creatures-novos.json'), ...await ler('creatures-outland-novos.json')];
const porId = new Map(lista.map((c) => [c.pokeId, c]));
const buscar = (id) => porId.get(Number(id)) ?? null;

cruz.aplicarCadeiasTruncadas(lista);
cruz.normalizarEvolveLevel600(lista);
for (const c of lista) if (outland.isOutlandPokeId?.(c.pokeId)) { c.evolvesToId = 0; c.evolveLevel = 0; }
cruz.aplicarEvolucoesEntreGeracoes(lista);
ram.alinharNivelPadraoRamificado(lista);
cruz.corrigirNiveisDeEvolucao(lista);
teto.aplicarTetoDeCaptura(lista, buscar);

const out = {};
for (const c of lista) {
  if (!c?.name || out[c.name]) continue;
  // cada destino: { pokeId, nivel, especie } (evoluções ramificadas têm um nível por destino)
  const destinos = (ram.destinosDeEvolucao(c, buscar) ?? []).filter((d) => d?.especie).map((d) => ({
    nome: d.especie.name, nivel: d.nivel || c.evolveLevel || 0, tipoPedra: ram.tipoDaPedraDeEvolucao(c, d.especie) ?? c.type1,
  }));
  const mega = megas.megaDaEspecie?.(c.pokeId) ?? null;
  if (!destinos.length && !mega && !c.evolveLevel) continue;
  out[c.name] = {
    id: c.pokeId, nivel: c.evolveLevel || 0, destinos,
    ...(mega ? { mega: { nome: mega.nome, pedra: mega.pedra, tipos: mega.tipos, bases: mega.bases } } : {}),
  };
}
await writeFile(path.join(PASTA_DADOS, 'evolucoes.json'), JSON.stringify({ fonte: 'pokeidle.io/assets + shared (evolução)', especies: out }, null, 1));
console.log(`${Object.keys(out).length} espécies com evolução ou Mega.`);
