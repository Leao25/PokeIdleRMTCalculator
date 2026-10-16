// docs/dados/modelo.json: o modelo de preço (docs/modelo-preco.js) ajustado com as vendas dos últimos
// 30 dias, já limpas pelo mesmo preco.js do site. O site e o Sniper ao vivo só leem e preveem.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

// os dois arquivos são scripts de navegador (o package.json é "type": "module"): carrega como o backtest
const DOCS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const carregar = async (arq, nome) => new Function(`${await readFile(path.join(DOCS, arq), 'utf8')}
return ${nome};`)();
const criarPreco = await carregar('preco.js', 'criarPreco');
const criarModelo = await carregar('modelo-preco.js', 'criarModelo');

export async function gerarModelo() {
  const indice = JSON.parse(await readFile(path.join(PASTA_DADOS, 'indice.json'), 'utf8'));
  const especies = JSON.parse(await readFile(path.join(PASTA_DADOS, 'especies.json'), 'utf8'));
  const state = { moeda: 'gemas', rate: indice.cotacao?.coinsPorGema || 3e6, dias: 30, taxaPk: null };
  const P = criarPreco(state);
  const vendas = [];
  for (const m of indice.meses.slice(-2)) for (const v of JSON.parse(await readFile(path.join(PASTA_DADOS, `${m}.json`), 'utf8')).vendas) vendas.push(P.venda(...v));
  const fim = Math.max(...vendas.map((s) => s.min));
  const recentes = vendas.filter((s) => s.min >= fim - 30 * 1440);
  state.taxaPk = P.taxaPokemon(recentes);
  const { kept } = P.limpar(recentes);
  const dados = criarModelo().ajustarTudo(kept, fim, especies);
  await writeFile(path.join(PASTA_DADOS, 'modelo.json'), JSON.stringify(dados));
  const n = (m) => ['comum', 'shiny'].map((g) => dados[m][g]?.n ?? 0).join('+');
  return `Gemas ${n('gemas')}, Coins ${n('coins')} vendas`;
}
