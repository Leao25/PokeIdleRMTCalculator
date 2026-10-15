// O MERCADO ABERTO: os anúncios de pokémon à venda agora e a vitrine de itens.
//
// · docs/dados/anuncios.json — a foto do momento: todos os anúncios de pokémon abertos, com a ficha
//   que o jogo manda (nota já calculada por ele). É reescrito a cada coleta.
// · docs/dados/itens.json — cada item do Mercado: nome, menor preço agora e a média de 7 dias que o
//   próprio jogo calcula, nas duas moedas. Também reescrito a cada coleta.
// · docs/dados/itens-serie.json — a série dessas médias e menores preços, uma linha por item por
//   coleta, para o gráfico de cada item (60 dias).
// · docs/dados/_catalogo.json — o que vem na entrada do jogo e a fase "Vale a pena investir?" vai
//   usar: o catálogo da vitrine e as pedras de evolução (só a estrutura que importa).
//
// Os nomes de vendedor não são guardados; o id do vendedor vira código com o NOMES_SAL.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { codigoDoJogador, PASTA_DADOS } from './historico.mjs';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const DIA = 864e5;

const pedidoPokemon = { tipo: 'pokemon', moeda: '', busca: '', criterios: [], elemento: '', categoria: '',
  soShiny: false, soP5: false, soTmElemental: false, soTmAoe: false, semOutland: false };

/** Todos os anúncios de pokémon abertos, página por página (24 por página), devagar. */
export async function lerAnuncios(sessao, sal) {
  const out = [];
  let total = Infinity;
  for (let pagina = 0; pagina * 24 < total && pagina < 400; pagina++) {
    const m = await sessao.pedirComCalma({ t: 'market.listar', ...pedidoPokemon, pagina, especieId: 0 },
      (x) => x.t === 'market' && x.aba === 'vitrine' && (x.pagina ?? 0) === pagina, 10000);
    total = Number(m.total) || 0;
    for (const a of m.linhas ?? []) {
      const f = a.ficha;
      if (a.tipo !== 'pokemon' || !f || a.estado !== 'aberto') continue;
      const iv = f.ivs ?? {};
      out.push([
        a.id, f.speciesId, f.nome, f.level, f.shiny ? 1 : 0, f.potencia || 1, f.quality ?? null, f.ivTotal ?? null,
        f.nota ?? null, [iv.hp, iv.atk, iv.def, iv.spAtk, iv.spDef, iv.speed], a.preco, a.moeda === 'gold' ? 'gold' : 'orb',
        a.criadoEm ?? null, a.compravelEm ?? null, f.tmElemental ? 1 : 0, f.tmAoe ? 1 : 0, f.refinoTotal || 0,
        f.poder ?? null, codigoDoJogador(String(a.vendedorId ?? a.vendedor ?? ''), sal), a.favoritos || 0,
      ]);
    }
    if (!m.linhas?.length) break;
    await espera(200);
  }
  return { anuncios: out, total };
}

/** A vitrine de itens: resumo (anúncios, menor preço) e médias de 7 dias. */
export async function lerItens(sessao) {
  const m = await sessao.pedir({ t: 'market.itens' }, (x) => x.t === 'market' && x.aba === 'itens', 10000);
  return { resumo: m.resumo ?? {}, medias: m.medias ?? {} };
}

/**
 * O livro de ofertas de cada item, em cada moeda: quantos anúncios, quantas unidades à venda e os
 * menores preços (por unidade) com a quantidade de cada um. É o que diz se dá para revender: um
 * item com milhares de unidades anunciadas à frente não sai tão cedo.
 */
export async function lerLivros(sessao, itemIds) {
  const livros = {};
  for (const id of itemIds) {
    for (const moeda of ['gold', 'orb']) {
      try {
        const m = await sessao.pedirComCalma({ t: 'market.item', itemId: Number(id), moeda },
          (x) => x.t === 'market' && x.aba === 'item' && String(x.itemId) === String(id) && x.moeda === moeda, 8000);
        const linhas = (m.linhas ?? []).map((l) => [Number(l.preco), Number(l.qtd) || 1]).filter((l) => l[0] > 0).sort((a, b) => a[0] - b[0]);
        (livros[id] ||= {})[moeda] = { anuncios: linhas.length, unidades: linhas.reduce((a, l) => a + l[1], 0), top: linhas.slice(0, 8) };
      } catch { /* sem resposta para este item nesta moeda: segue */ }
      await espera(350); // o jogo limita mensagens por segundo: devagar e sempre
    }
  }
  return livros;
}

async function lerJson(arq, padrao) { try { return JSON.parse(await readFile(arq, 'utf8')); } catch { return padrao; } }

/** Grava anúncios, itens, a série dos itens e o catálogo. */
export async function gravarMercado({ anuncios, total }, itens, welcome, livros = null) {
  const agora = new Date().toISOString();
  if (anuncios) {
    await writeFile(path.join(PASTA_DADOS, 'anuncios.json'), JSON.stringify({
      em: agora, total,
      campos: ['id', 'speciesId', 'nome', 'nivel', 'shiny', 'potencia', 'qualidade', 'ivTotal', 'nota', 'ivs',
        'preco', 'moeda', 'criadoEm', 'compravelEm', 'tmElemental', 'tmAoe', 'refino', 'poder', 'vendedor', 'favoritos'],
      a: anuncios,
    }).replace(/\],\[/g, '],\n['));
  }

  // nomes dos itens: o catálogo vem na entrada; se não vier, fica o que já estava gravado
  const catArq = path.join(PASTA_DADOS, '_catalogo.json');
  const antigo = await lerJson(catArq, {});
  const cat = welcome?.mercado?.catalogo;
  const catalogo = Array.isArray(cat) && cat.length ? cat : antigo.catalogo ?? [];
  if (Array.isArray(cat) && cat.length) {
    await writeFile(catArq, JSON.stringify({
      em: agora,
      catalogo: cat,
      pedrasEvolucao: welcome.pedrasEvolucao ?? antigo.pedrasEvolucao ?? null,
      refino: welcome.refino ?? antigo.refino ?? null,
      mercadoRegras: Object.fromEntries(Object.entries(welcome.mercado).filter(([k]) => k !== 'catalogo')),
      chavesEntrada: Object.keys(welcome).slice(0, 200),
    }, null, 1));
  }
  if (!itens) return;
  // livros que não foram lidos nesta coleta (rodízio) ficam como estavam, com a hora em que foram lidos
  const anteriores = (await lerJson(path.join(PASTA_DADOS, 'itens.json'), { itens: {} })).itens || {};
  const livroDe = (id) => (livros?.[id] ? { ...livros[id], em: agora } : anteriores[id]?.livro ?? null);
  const nomeDe = new Map(catalogo.map((i) => [String(i.id), i]));
  const lista = {};
  for (const [id, r] of Object.entries(itens.resumo)) {
    const c = nomeDe.get(String(id)) ?? {};
    const md = itens.medias[id] ?? {};
    lista[id] = {
      nome: c.nome ?? c.name ?? `Item ${id}`, categoria: c.categoria ?? c.tipo ?? null,
      anuncios: r.anuncios ?? 0, unidades: r.unidades ?? 0, minGold: r.minGold ?? null, minOrb: r.minOrb ?? null,
      mediaGold: md.gold?.media ?? null, vendidosGold: md.gold?.unidades ?? null,
      mediaOrb: md.orb?.media ?? null, vendidosOrb: md.orb?.unidades ?? null,
      livro: livroDe(id),
    };
  }
  // itens com média de venda mas sem anúncio aberto agora também entram
  for (const [id, md] of Object.entries(itens.medias)) {
    if (lista[id]) continue;
    const c = nomeDe.get(String(id)) ?? {};
    lista[id] = { nome: c.nome ?? c.name ?? `Item ${id}`, categoria: c.categoria ?? c.tipo ?? null, anuncios: 0, unidades: 0,
      minGold: null, minOrb: null, mediaGold: md.gold?.media ?? null, vendidosGold: md.gold?.unidades ?? null,
      mediaOrb: md.orb?.media ?? null, vendidosOrb: md.orb?.unidades ?? null };
  }
  await writeFile(path.join(PASTA_DADOS, 'itens.json'), JSON.stringify({ em: agora, itens: lista }, null, 1));

  const serieArq = path.join(PASTA_DADOS, 'itens-serie.json');
  const serie = await lerJson(serieArq, { campos: ['em', 'id', 'minGold', 'minOrb', 'mediaGold', 'mediaOrb'], s: [] });
  const t = Math.floor(Date.now() / 60000);
  for (const [id, x] of Object.entries(lista)) serie.s.push([t, +id, x.minGold, x.minOrb, x.mediaGold, x.mediaOrb]);
  const corte = Math.floor((Date.now() - 60 * DIA) / 60000);
  serie.s = serie.s.filter((r) => r[0] >= corte);
  await writeFile(serieArq, JSON.stringify(serie).replace(/\],\[/g, '],\n['));
}
