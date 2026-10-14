// RECONHECIMENTO (uma vez): pede as telas do Mercado que a próxima fase vai usar — a lista de
// anúncios de pokémon, a grade de espécies e a vitrine de itens — e grava só a ESTRUTURA das
// respostas em docs/dados/_formato.json: nomes de campos, tipos, tamanhos de listas e números.
// Textos só entram quando são curtos e de campos que não identificam ninguém (moeda, tipo…).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PASTA_DADOS } from './historico.mjs';

const PESSOAL = /nick|vendedor|comprador|dono|autor|jogador|apelido|capturad|player|user|email|guild/i;

function forma(v, chave = '', prof = 0) {
  if (v == null) return v;
  if (Array.isArray(v)) return { lista: v.length, item: v.length ? forma(v[0], chave, prof + 1) : null };
  if (typeof v === 'object') {
    if (prof > 6) return 'objeto';
    const out = {};
    for (const [k, x] of Object.entries(v).slice(0, 60)) out[k] = forma(x, k, prof + 1);
    return out;
  }
  if (typeof v === 'string') return PESSOAL.test(chave) || v.length > 24 ? `texto(${v.length})` : `"${v}"`;
  return v; // números e booleanos
}

const pedidoPokemon = { tipo: 'pokemon', moeda: '', busca: '', criterios: [], elemento: '', categoria: '',
  soShiny: false, soP5: false, soTmElemental: false, soTmAoe: false, semOutland: false, pagina: 0 };

export async function explorar(sessao) {
  const r = { em: new Date().toISOString() };
  const pedir = async (nome, msg, aceita) => {
    try { r[nome] = forma(await sessao.pedir(msg, aceita, 10000)); } catch (e) { r[nome] = `falhou: ${e.message}`; }
  };
  await pedir('listar', { t: 'market.listar', ...pedidoPokemon, especieId: 0 }, (m) => m.t === 'market' && m.aba && m.aba !== 'historicoGlobal');
  await pedir('especies', { t: 'market.especies', ...pedidoPokemon }, (m) => m.t === 'market' && m.aba === 'especies');
  await pedir('itens', { t: 'market.itens' }, (m) => m.t === 'market' && m.aba === 'itens');
  const cat = sessao.welcome?.estado?.mercado?.catalogo;
  r.catalogo = Array.isArray(cat) ? { lista: cat.length, exemplos: cat.slice(0, 3).map((x) => forma(x)) } : forma(sessao.welcome?.estado?.mercado ?? null);
  r.welcomeChaves = Object.keys(sessao.welcome?.estado ?? {}).slice(0, 80);
  await writeFile(path.join(PASTA_DADOS, '_formato.json'), JSON.stringify(r, null, 1));
  console.log('Reconhecimento gravado em docs/dados/_formato.json.');
}
