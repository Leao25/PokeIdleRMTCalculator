// O HISTÓRICO dos anúncios de pokémon: quando cada anúncio entrou, por quanto, quanto tempo ficou
// e quando saiu. O preço justo só aprende com quem VENDEU; com isto dá para medir quem ENCALHA
// (espécie de pouca procura, preço acima do que o mercado paga) e testar um desconto ou um teto.
//
// · docs/dados/anuncios-hist/abertos.json — os anúncios abertos agora, um por linha:
//     id: [primeiroVisto, ultimoVisto, precoInicial, precoAtual, mudancasDePreco]
// · docs/dados/anuncios-hist/fechados-AAAA-MM.jsonl — um anúncio por linha quando ele SOME da vitrine
//   (vendido, cancelado ou vencido; o cruzamento com as vendas diz qual):
//     [id, speciesId, nome, nivel, shiny, potencia, qualidade, ivTotal, nota, moeda, precoInicial,
//      precoFinal, criadoEm, primeiroVisto, ultimoVisto, sumiuAte, vendedor, mudancasDePreco]
// Horários em minutos desde 1970 (como o histórico de vendas); criadoEm como o jogo manda (ms).
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const PASTA = path.join(PASTA_DADOS, 'anuncios-hist');
const CAMPOS = ['id', 'speciesId', 'nome', 'nivel', 'shiny', 'potencia', 'qualidade', 'ivTotal', 'nota', 'ivs',
  'preco', 'moeda', 'criadoEm', 'compravelEm', 'tmElemental', 'tmAoe', 'refino', 'poder', 'vendedor', 'favoritos'];
const C = Object.fromEntries(CAMPOS.map((k, i) => [k, i]));

async function lerJson(arq, padrao) { try { return JSON.parse(await readFile(arq, 'utf8')); } catch { return padrao; } }

/**
 * Chamar ANTES de gravar o anuncios.json novo: a ficha de quem sumiu vem da leitura anterior.
 * anuncios: as linhas novas (formato CAMPOS); total: quantos o jogo disse que existem.
 * Devolve { novos, fechados, abertos } ou null quando a leitura veio incompleta (não fecha nada).
 */
export async function registrarAnuncios(anuncios, total) {
  if (!Array.isArray(anuncios) || !anuncios.length) return null;
  await mkdir(PASTA, { recursive: true });
  const arqAbertos = path.join(PASTA, 'abertos.json');
  const antes = await lerJson(arqAbertos, { em: null, a: {} });
  const agora = Math.floor(Date.now() / 60000);
  const completa = !(total > 0) || anuncios.length >= total * 0.9;
  const atual = {}, porId = new Map(anuncios.map((r) => [String(r[C.id]), r]));
  let novos = 0;
  for (const [id, r] of porId) {
    const ja = antes.a[id];
    const preco = r[C.preco];
    if (ja) atual[id] = [ja[0], agora, ja[2], preco, ja[4] + (preco !== ja[3] ? 1 : 0)];
    else { atual[id] = [agora, agora, preco, preco, 0]; novos++; }
  }
  let fechados = 0;
  if (completa) {
    // o que estava aberto e sumiu: guarda a ficha (da leitura anterior) no arquivo do mês
    const ant = await lerJson(path.join(PASTA_DADOS, 'anuncios.json'), { a: [] });
    const fichasAntes = Object.fromEntries((ant.a || []).map((r) => [String(r[C.id]), r]));
    const linhas = [];
    for (const [id, x] of Object.entries(antes.a)) {
      if (atual[id]) continue;
      const r = fichasAntes[id];
      if (!r) continue;
      linhas.push(JSON.stringify([Number(id), r[C.speciesId], r[C.nome], r[C.nivel], r[C.shiny], r[C.potencia], r[C.qualidade], r[C.ivTotal], r[C.nota],
        r[C.moeda], x[2], x[3], r[C.criadoEm], x[0], x[1], agora, r[C.vendedor], x[4]]));
    }
    if (linhas.length) {
      const mes = new Date().toISOString().slice(0, 7);
      await appendFile(path.join(PASTA, `fechados-${mes}.jsonl`), linhas.join('\n') + '\n');
      fechados = linhas.length;
    }
  } else {
    // leitura incompleta: quem não apareceu continua como estava (não dá para saber se saiu)
    for (const [id, x] of Object.entries(antes.a)) if (!atual[id]) atual[id] = x;
  }
  const umPorLinha = (obj) => '{\n' + Object.entries(obj).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n') + '\n}\n';
  await writeFile(arqAbertos, `{"em":${JSON.stringify(new Date().toISOString())},"completa":${completa},"a":${umPorLinha(atual)}}`);
  return { novos, fechados, abertos: Object.keys(atual).length, completa };
}
