// O histórico de vendas de pokémon: um arquivo JSON por mês em docs/dados/, lido pelo site.
//
// Cada venda é uma lista curta, para o arquivo não inchar:
//   [minuto, descricao, nivel, shiny, nota, iv, potencia, qualidade, moeda, valor, vendedor, comprador]
//   minuto     minutos desde 1970 (UTC); a planilha do jogo só tem minuto, então o coletor também
//   descricao  como o jogo escreve: "Charizard Nv 80", "Mega Raichu Y Nv 1236"
//   shiny      1 ou 0
//   moeda      "orb" (Gemas) ou "gold" (Coins), os ids do jogo
//   valor      o bruto, o que o comprador pagou
//   vendedor e comprador viram um código (ver `codigoDoJogador`): o nome de ninguém vai para o site.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PASTA_DADOS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'dados');

/** O mesmo jogador vira sempre o mesmo código, e o código não volta ao nome sem o sal (secret). */
export function codigoDoJogador(nick, sal) {
  if (!nick) return '';
  return 'j' + createHash('sha256').update(`${sal}\n${String(nick).toLowerCase()}`).digest('hex').slice(0, 8);
}

export function salDosNomes() {
  const sal = process.env.NOMES_SAL;
  if (!sal || sal.length < 16) {
    throw new Error('Falta o NOMES_SAL (pelo menos 16 caracteres). Ele embaralha os nomes dos jogadores.');
  }
  return sal;
}

/** Duas coletas que trazem a mesma venda têm de dar a mesma chave. */
export const chaveDaVenda = (v) => [v[0], v[1], v[9], v[8], v[10], v[11]].join('|');

const mesDoMinuto = (min) => new Date(min * 60000).toISOString().slice(0, 7);

async function lerJson(arquivo, padrao) {
  try { return JSON.parse(await readFile(arquivo, 'utf8')); } catch { return padrao; }
}

/** Junta as vendas novas ao histórico. Devolve quantas eram novas de fato. */
export async function juntarAoHistorico(novas, { fonte }) {
  await mkdir(PASTA_DADOS, { recursive: true });
  const indiceArq = path.join(PASTA_DADOS, 'indice.json');
  const indice = await lerJson(indiceArq, { meses: [] });

  const porMes = new Map();
  for (const v of novas) {
    const mes = mesDoMinuto(v[0]);
    if (!porMes.has(mes)) porMes.set(mes, []);
    porMes.get(mes).push(v);
  }

  let adicionadas = 0;
  const meses = new Set(indice.meses);
  for (const [mes, lista] of porMes) {
    const arq = path.join(PASTA_DADOS, `${mes}.json`);
    const atual = await lerJson(arq, { mes, vendas: [] });
    const vistas = new Set(atual.vendas.map(chaveDaVenda));
    for (const v of lista) {
      const k = chaveDaVenda(v);
      if (vistas.has(k)) continue;
      vistas.add(k);
      atual.vendas.push(v);
      adicionadas++;
    }
    atual.vendas.sort((a, b) => a[0] - b[0]);
    await writeFile(arq, JSON.stringify(atual).replace(/\],\[/g, '],\n['));
    meses.add(mes);
  }

  let total = 0;
  for (const mes of meses) total += (await lerJson(path.join(PASTA_DADOS, `${mes}.json`), { vendas: [] })).vendas.length;
  const novoIndice = {
    meses: [...meses].sort(),
    total,
    atualizadoEm: new Date().toISOString(),
    ultimaFonte: fonte,
    ultimasNovas: adicionadas,
  };
  await writeFile(indiceArq, JSON.stringify(novoIndice, null, 2));
  return { adicionadas, total };
}
