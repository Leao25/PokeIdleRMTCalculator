// A COMISSÃO do Mercado da Comunidade. Mora aqui porque as duas pontas precisam do mesmo
// número: o servidor cobra (`market-db.mjs`) e a tela promete o líquido antes do clique
// (`app.js`, `pokepedia.mjs`, `terms.mjs`). Já houve uma divergência assim — o servidor mudou
// de 30% para 15% e o cliente continuou prometendo o líquido velho —, e um arquivo só é o que
// impede a repetição.
//
// ### Em GEMA a faixa vale SÓ PARA POKÉMON
//
//     13%  sobre a parte do total até 500
//     10%  sobre a parte entre 501 e 5.000
//     7,5% sobre a parte acima de 5.000
//
// Item e diamante continuam em 15% plano, e a razão é o FATIAMENTO. A faixa lê o total da
// compra, e quem decide o tamanho da compra é o comprador — num lote de 200 Boss Token a 6
// gemas, comprar de um em um prende o vendedor na primeira faixa (200 gemas de comissão
// contra 135 se o lote sair inteiro). Como a comissão sai do vendedor, o comprador não paga
// nada para fazer isso: seria grief de graça.
//
// Pokémon não tem essa porta. `comprar` força `pedido = 1` quando o tipo é pokémon — cada
// bicho é peça única, o anúncio inteiro é a venda, e o total que a faixa lê é exatamente o
// preço anunciado. Não existe fatia, então não existe o abuso.
//
// É também onde a faixa tem valor: a venda grande em gema é pokémon — 81% das gemas movidas
// acima de 1.000 por venda (165 das 248 vendas, e 677.925 das 833.264 gemas, nos 24 dias
// medidos) —, e é ela que foge para PIX quando a comissão pesa.
//
// Qualquer tipo que não seja pokémon cai no plano, inclusive um tipo novo que apareça
// amanhã — o padrão seguro é a alíquota cheia.
//
// Marginal como imposto de renda, e não "a alíquota da faixa sobre o valor inteiro". A
// diferença não é detalhe — é a coisa mais importante deste arquivo.
//
// Com faixa cheia, um anúncio de 5.001 pagaria 7,5% sobre TUDO e renderia ao vendedor 4.625,
// enquanto um de 5.000 renderia 4.500: **cobrar 1 a mais pagaria 125 a mais**. O mesmo degrau
// apareceria em 500. Os dados de 24 dias do mercado real dizem o que aconteceria com isso:
// 162 vendas saíram exatamente a 100 gemas e 668 em múltiplos de 100 — jogador precifica em
// número redondo, e um degrau posto justamente aí faria a vitrine inteira encostar em 501 e
// 5.001. Marginal não tem degrau: a alíquota efetiva desliza (13% em 500, 11,5% em 1.000,
// 10,3% em 5.000, 7,9% em 33.000) e o preço maior sempre rende mais que o menor.
//
// ### A faixa lê o TOTAL DA VENDA, não o preço unitário
//
// É o que o comprador paga naquela compra, e é sobre ele que a comissão sempre incidiu. Numa
// compra parcial de lote, portanto, a faixa é a da fatia levada — quem compra 3 de um lote de
// 100 paga a faixa dos 3. O preço unitário continua mandando só no mínimo (`PRECO_MIN_ORB`).
//
// ### O arredondamento é do jogo, não da tabela
//
// A gema é inteira. O líquido vai no `floor`, então a comissão fica com a fração — é a regra
// que sempre valeu, e ela é o que garante que nenhuma venda saia com taxa zero (senão bastaria
// fatiar uma transferência grande em centenas de vendas de 5 gemas para não pagar nada).
//
// O efeito colateral é que na ponta de baixo a alíquota escrita não é a alíquota cobrada: uma
// venda de 3 gemas paga 1 (33%) com qualquer tabela, e em 17% das vendas reais cobrar 7,5% dá
// exatamente o mesmo inteiro que cobrar 15%. Abaixo de ~20 gemas a tabela é decorativa, e é
// por isso que não existe faixa nenhuma ali: não haveria o que descontar.

/**
 * As faixas da gema, em PONTOS-BASE (1.300 = 13%) e em ordem crescente de teto.
 *
 * Pontos-base, e não `0.13`, para a conta inteira ser feita em inteiros: `100 * 0.13` em
 * ponto flutuante dá 13.000000000000002, e um `Math.ceil` em cima disso cobraria 14 gemas de
 * uma venda de 100. Com `bp` a única divisão acontece uma vez, no fim.
 */
export const FAIXAS_ORB = [
  { ate: 500, bp: 1300 },
  { ate: 5_000, bp: 1000 },
  { ate: Infinity, bp: 750 },
];

/** A alíquota de entrada da faixa — a que vale para o pokémon barato. */
export const TAXA_ORB_ENTRADA = FAIXAS_ORB[0].bp / 10_000;

/** A comissão plana da gema: item, diamante e qualquer tipo que não seja pokémon. */
export const TAXA_ORB_PLANA = 0.15;

/** Quem paga por faixa. Só o pokémon, porque só ele não pode ser comprado em fatias. */
export const temFaixaOrb = (tipo) => tipo === 'pokemon';

/** A alíquota do topo — o piso para onde a efetiva tende na venda grande. */
export const TAXA_ORB_TOPO = FAIXAS_ORB.at(-1).bp / 10_000;

/**
 * Comissão sobre anúncio cobrado em Coins. Sem faixa, e igual à da transferência entre amigos.
 *
 * ### Por que 15% e não os 10% de antes
 *
 * Mandar Coins para um amigo queima 15% (`TAXA_COINS_AMIGO`, em `amigos-db.mjs`). Enquanto o
 * Mercado cobrava 10%, ele era um trilho de transferência MAIS BARATO que a transferência:
 * para passar 1.000.000 de Coins, a via direta custava 150.000 e "anuncio um item qualquer por
 * 1.000.000 e você compra" custava 100.000. Quem quisesse mover ouro em volume não usava a
 * porta da frente, e o sink de 15% virava um sink de 10% para quem soubesse da fresta.
 *
 * Os dois números agora são o mesmo, e a escolha entre as duas vias volta a ser por
 * conveniência e não por arbitragem.
 *
 * ### Por que o ouro não ganha faixa como a gema
 *
 * São moedas com trabalhos opostos. A gema tem lastro em USDT e é escassa: a faixa existe
 * para não espantar a venda grande, que é a que foge para fora do jogo. O ouro é impresso por
 * abate e sofre de inflação — ali a comissão é RALO, e um desconto para a venda grande seria
 * desconto justo onde mais ouro precisa sumir.
 */
export const TAXA_GOLD = 0.15;

/** As faixas num formato que a tela mostra: `{ ate, pct }`, com `ate: null` na última. */
export const faixasOrbParaTela = () =>
  FAIXAS_ORB.map((f) => ({ ate: Number.isFinite(f.ate) ? f.ate : null, pct: f.bp / 100 }));

/**
 * A comissão em gema de uma venda, em gemas inteiras.
 *
 * Soma faixa a faixa e arredonda PARA CIMA uma vez só, no fim — é o espelho exato do `floor`
 * do líquido. Sem `tipo`, ou com um tipo que não seja pokémon, cobra o plano: o padrão é
 * sempre a alíquota cheia, nunca o desconto.
 */
export function taxaOrbDaVenda(total, tipo) {
  const t = Math.floor(Number(total) || 0);
  if (t <= 0) return 0;
  if (!temFaixaOrb(tipo)) return Math.min(t, Math.ceil((t * 1500) / 10_000));
  let piso = 0;
  let bp = 0;
  for (const faixa of FAIXAS_ORB) {
    const teto = Math.min(t, faixa.ate);
    if (teto <= piso) break;
    bp += (teto - piso) * faixa.bp;
    piso = teto;
  }
  return Math.min(t, Math.ceil(bp / 10_000));
}

/**
 * A mesma comissão de `taxaOrbDaVenda`, FAIXA A FAIXA — a conta que o "i" do recibo abre.
 *
 * Cada faixa diz onde começa (`de`, exclusivo) e termina (`ate`, `null` na última), a alíquota
 * (`pct`), quanto do total cai nela (`base`, 0 se o total não chega lá) e quanto esse pedaço paga
 * (`valor`, em gemas, ainda com fração). `soma` é a conta antes do arredondamento, e `taxa` é o
 * que de fato se cobra: o mesmo `Math.ceil` único de `taxaOrbDaVenda`, que o teste confere. Só
 * faz sentido para quem paga por faixa (`temFaixaOrb`); o plano não passa por aqui.
 */
export function faixasOrbDaVenda(total) {
  const t = Math.max(0, Math.floor(Number(total) || 0));
  let piso = 0;
  let bp = 0;
  const faixas = FAIXAS_ORB.map((f) => {
    const base = Math.max(0, Math.min(t, f.ate) - piso);
    const linha = { de: piso, ate: Number.isFinite(f.ate) ? f.ate : null, pct: f.bp / 100, base, valor: (base * f.bp) / 10_000 };
    bp += base * f.bp;
    piso = f.ate;
    return linha;
  });
  return { faixas, soma: bp / 10_000, taxa: Math.min(t, Math.ceil(bp / 10_000)) };
}

/** O que sobra para o vendedor. Nunca negativo, e nunca maior que o total. */
export const liquidoOrbDaVenda = (total, tipo) => {
  const t = Math.floor(Number(total) || 0);
  return t <= 0 ? 0 : t - taxaOrbDaVenda(t, tipo);
};

/**
 * A alíquota EFETIVA daquela venda, em porcentagem (15, 13, 11.5, 10.3…). É o número que a
 * tela mostra, e no pokémon é o único honesto: com faixa marginal não existe "a taxa" sem um
 * preço junto.
 */
export const pctEfetivoOrb = (total, tipo) => {
  const t = Math.floor(Number(total) || 0);
  if (t <= 0) return (temFaixaOrb(tipo) ? TAXA_ORB_ENTRADA : TAXA_ORB_PLANA) * 100;
  return (taxaOrbDaVenda(t, tipo) / t) * 100;
};

/**
 * O menor preço UNITÁRIO que ainda deixa 1 gema para o vendedor.
 *
 * Pela alíquota PLANA, que é a mais pesada das duas — assim o mínimo vale para qualquer tipo
 * de anúncio e não precisa de um número por tipo. Derivado, e não escrito à mão: mexer na
 * alíquota reajusta o mínimo sozinho.
 */
export const PRECO_MIN_ORB = Math.ceil(1 / (1 - TAXA_ORB_PLANA));

/** O mesmo, em Coins. */
export const PRECO_MIN_GOLD = Math.ceil(1 / (1 - TAXA_GOLD));
