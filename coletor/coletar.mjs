// O COLETOR: entra no PokeIdle como um jogador, pede a planilha da Tabela de preços (aba Pokémon)
// e junta ao histórico. Na mesma entrada, lê as vendas de diamante para a cotação Gema ↔ Coins.
//
// Usa o mesmo caminho do botão "Exportar planilha" do jogo (`csv.pedir` do tipo `mercado`), que o
// servidor libera UMA vez por hora. O agendamento roda de hora em hora, e cada rodada decide:
//
//   · coleta PRINCIPAL (sem filtro: as 5.000 vendas mais recentes) se a última foi há ~2 horas ou mais;
//   · senão, um item da FILA DE RECUPERAÇÃO (uma tipagem por vez, para buscar as vendas do mês que
//     a planilha sem filtro corta), se houver;
//   · senão, não entra no jogo — e a conta não é pausada.
//
// O estado (hora da última principal e a fila) fica em coletor/estado.json, salvo no repositório.
//
// Variáveis (no GitHub, são os secrets do repositório):
//   POKEIDLE_NICK   o nick da conta do coletor
//   POKEIDLE_TOKEN  a sessão dessa conta (dura 30 dias; ver o README para renovar)
//   NOMES_SAL       texto aleatório que embaralha os nomes dos jogadores
//
// A conta joga em um lugar por vez: entrar aqui PAUSA a sessão dela em qualquer outro lugar.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';
import { codigoDoJogador, juntarAoHistorico, salDosNomes } from './historico.mjs';
import { calcularCotacao, juntarDiamantes } from './diamantes.mjs';
import { gravarMercado, lerAnuncios, lerItens, lerLivros } from './mercado.mjs';
import { explorarPvp } from './explorar-pvp.mjs';
import { gerarReferencia } from './referencia.mjs';
import { gravarRegras, verificarVersao } from './regras.mjs';
import { gravarCatalogo } from './catalogo.mjs';
import { registrarAnuncios } from './anuncios-historico.mjs';
import { atualizarMetaPvp } from './pvp-meta.mjs';

const URL_JOGO = 'wss://pokeidle.io';
const INTERVALO_PRINCIPAL_MS = 50 * 60 * 1000; // de hora em hora (a planilha aceita 1 pedido por hora), com folga para o atraso
const ARQ_ESTADO = path.join(path.dirname(fileURLToPath(import.meta.url)), 'estado.json');

function exigir(nome) {
  const v = process.env[nome];
  if (!v) throw new Error(`Falta a variável ${nome}.`);
  return v;
}

async function lerEstado() {
  try { return JSON.parse(await readFile(ARQ_ESTADO, 'utf8')); } catch { return { ultimaPrincipal: null, fila: [], feitos: [] }; }
}
const salvarEstado = (e) => writeFile(ARQ_ESTADO, JSON.stringify(e, null, 2) + '\n');

/**
 * Entra no jogo e devolve uma sessão com `pedir(msg, aceita, ms)`: manda `msg` e espera a primeira
 * mensagem do servidor em que `aceita(m)` for verdade.
 */
function abrirSessao({ nick, token }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL_JOGO, {
      headers: { Origin: 'https://pokeidle.io', 'User-Agent': 'BalancaDePrecos-coletor/1.0 (+github)' },
    });
    const esperas = new Set();
    let entrou = false;
    let erroFatal = null;
    const relogio = setTimeout(() => { reject(new Error('O jogo não confirmou a entrada da conta a tempo (token vencido?).')); try { ws.close(); } catch {} }, 45000);

    const sessao = {
      pedir(msg, aceita, ms = 15000) {
        if (erroFatal) return Promise.reject(erroFatal);
        return new Promise((ok, falha) => {
          const e = { aceita, ok, falha, t: setTimeout(() => { esperas.delete(e); falha(new Error(`Sem resposta para ${msg.t}.`)); }, ms) };
          esperas.add(e);
          ws.send(JSON.stringify(msg));
        });
      },
      fechar() { try { ws.close(); } catch {} },
      /** Pede e, se o jogo pedir calma, espera e tenta de novo (até 3 vezes). */
      async pedirComCalma(msg, aceita, ms = 15000) {
        for (let tentativa = 0; ; tentativa++) {
          try { return await sessao.pedir(msg, aceita, ms); } catch (e) {
            if (e.message !== 'devagar' || tentativa >= 3) throw e;
            await new Promise((r) => setTimeout(r, 4000 * (tentativa + 1)));
          }
        }
      },
    };
    const derrubar = (erro) => {
      erroFatal = erro;
      for (const e of esperas) { clearTimeout(e.t); e.falha(erro); }
      esperas.clear();
      if (!entrou) { clearTimeout(relogio); reject(erro); }
    };

    ws.on('open', () => ws.send(JSON.stringify({ t: 'hello', nick, token, delta: 1, dispositivo: 'balanca-coletor' })));
    ws.on('message', (bruto) => {
      let m;
      try { m = JSON.parse(bruto.toString()); } catch { return; }
      if (m.t === 'erro') {
        const texto = String(m.chave ?? m.msg ?? JSON.stringify(m).slice(0, 200));
        // "Devagar aí — muitas mensagens": o jogo pede calma. Não é fatal: os pedidos à espera falham
        // com 'devagar' e quem pediu espera e tenta de novo (ver `pedirComCalma`).
        if (/devagar|muitas mensagens|rate|lento/i.test(texto)) {
          for (const e of esperas) { clearTimeout(e.t); e.falha(new Error('devagar')); }
          esperas.clear();
          return;
        }
        return derrubar(new Error(`O jogo recusou: ${texto}`));
      }
      if (m.t === 'sessao.renovada') console.log('Aviso: o jogo renovou a sessão desta conta. Se o coletor começar a falhar, gere um token novo (README).');
      if (m.t === 'welcome' && !entrou) { entrou = true; sessao.welcome = m; clearTimeout(relogio); resolve(sessao); }
      for (const e of esperas) if (e.aceita(m)) { clearTimeout(e.t); esperas.delete(e); e.ok(m); }
    });
    ws.on('close', (code) => {
      derrubar(new Error(code === 4001 ? 'A conta foi aberta em outro lugar durante a coleta.'
        : code === 4003 ? 'O jogo bloqueou esta rede.' : `O jogo fechou a conexão (código ${code}).`));
    });
    ws.on('error', (e) => derrubar(e));
  });
}

/** As linhas da planilha vêm em lista: [em, tipo, descricao, qtd, moeda, bruto, vendedor, comprador, pk]. */
function converter(linhas, sal) {
  const out = [];
  for (const [em, tipo, descricao, qtd, moeda, bruto, vendedor, comprador, pk] of linhas) {
    if (tipo !== 'pokemon' || !em || bruto == null) continue;
    const [nivel, shiny, nota, iv, potencia, qualidade] = pk ?? [];
    const q = Number(qtd) || 1;
    out.push([
      Math.floor(Number(em) / 60000), String(descricao ?? ''), Number(nivel) || null, shiny ? 1 : 0,
      nota == null ? null : Number(nota), iv == null ? null : Number(iv), Number(potencia) || 1,
      qualidade == null ? null : Number(qualidade), moeda === 'gold' ? 'gold' : 'orb', Number(bruto) / q,
      codigoDoJogador(vendedor, sal), codigoDoJogador(comprador, sal),
    ]);
  }
  return out;
}

/**
 * As vendas de diamante das últimas ~26 horas, nas duas moedas, pela Tabela de preços (a mesma
 * tela que o jogador abre: 30 linhas por página). Ler a tela não gasta a vez da planilha.
 */
async function lerVendasDeDiamante(sessao) {
  const limite = Date.now() - 26 * 3600 * 1000;
  const out = [];
  let seq = 1000;
  for (const moeda of ['orb', 'gold']) {
    for (let pagina = 0; pagina < 20; pagina++) {
      const s = ++seq;
      const m = await sessao.pedirComCalma({ t: 'market.historicoGlobal', pagina, seq: s, tipo: 'diamante', moeda },
        (x) => x.t === 'market' && x.aba === 'historicoGlobal' && x.seq === s, 10000);
      const linhas = Array.isArray(m.linhas) ? m.linhas : [];
      for (const l of linhas) {
        const qtd = Number(l.qtd ?? l.quantidade) || Number(String(l.descricao ?? '').match(/(\d[\d.]*)\s*×/)?.[1]?.replace(/\./g, '')) || 1;
        const em = Number(l.em) || Date.parse(l.em);
        if (em && l.bruto != null) out.push({ em, moeda: l.moeda === 'gold' ? 'gold' : 'orb', bruto: Number(l.bruto), qtd });
      }
      const maisVelha = Math.min(...linhas.map((l) => Number(l.em) || Date.parse(l.em) || Infinity));
      if (!m.temMais || !linhas.length || maisVelha < limite) break;
    }
  }
  return out;
}

/** A média de 7 dias que o próprio jogo mostra na aba Diamantes — só como reserva. */
async function lerMediaDoJogo(sessao) {
  const media = {};
  for (const moeda of ['orb', 'gold']) {
    const m = await sessao.pedir({ t: 'market.listar', tipo: 'diamante', moeda, ordem: 'baratos', busca: '', pagina: 0, especieId: 0 },
      (x) => x.t === 'market' && x.mediaDiamante, 8000).catch(() => null);
    for (const k of ['orb', 'gold']) if (m?.mediaDiamante?.[k]?.media) media[k] = m.mediaDiamante[k];
  }
  return media;
}

const descrever = (f) => Object.entries(f).filter(([k]) => k !== 'tipo').map(([k, v]) => `${k}=${v}`).join(', ') || 'sem filtro';

async function main() {
  const sal = salDosNomes();
  const estado = await lerEstado();
  estado.fila ??= [];
  estado.feitos ??= [];
  const forcar = process.env.COLETA_FORCAR === 'principal';
  const devePrincipal = forcar || !estado.ultimaPrincipal
    || Date.now() - Date.parse(estado.ultimaPrincipal) >= INTERVALO_PRINCIPAL_MS;

  let filtros;
  if (devePrincipal) filtros = { tipo: 'pokemon' };
  else if (estado.fila.length) filtros = estado.fila[0];
  else {
    console.log('Nada a fazer nesta hora: a coleta principal foi há pouco e a fila de recuperação está vazia.');
    return;
  }

  const sessao = await abrirSessao({ nick: exigir('POKEIDLE_NICK'), token: exigir('POKEIDLE_TOKEN') });
  let resp, diamantes = [], media7 = {}, aberto = {}, itens = null, livros = null;
  try {
    console.log(`Pedindo a planilha (${devePrincipal ? 'principal' : 'recuperação'}: ${descrever(filtros)}).`);
    resp = await sessao.pedir({ t: 'csv.pedir', tipo: 'mercado', filtros }, (m) => m.t === 'csv' && m.tipo === 'mercado', 30000);
    diamantes = await lerVendasDeDiamante(sessao).catch((e) => { console.log(`Vendas de diamante: ${e.message}`); return []; });
    media7 = await lerMediaDoJogo(sessao);
    // O Mercado aberto: anúncios de pokémon e vitrine de itens (lê as telas; não gasta a vez da planilha)
    const t0 = Date.now();
    aberto = await lerAnuncios(sessao, sal).catch((e) => { console.log(`Anúncios: ${e.message}`); return {}; });
    itens = await lerItens(sessao).catch((e) => { console.log(`Itens: ${e.message}`); return null; });
    // livro de ofertas só dos itens com anúncio aberto (pedras, fragmentos, tokens…)
    // 25 itens por coleta, em rodízio (o jogo limita mensagens por segundo e a sessão não pode passar de ~1,5 min)
    if (itens) {
      const ids = Object.entries(itens.resumo).filter(([, r]) => (r.anuncios || 0) > 0).map(([id]) => id).sort((a, b) => a - b);
      const ini = (estado.livroRodizio || 0) % Math.max(1, ids.length);
      const lote = [...ids, ...ids].slice(ini, ini + Math.min(25, ids.length));
      estado.livroRodizio = ini + lote.length;
      livros = await lerLivros(sessao, lote).catch(() => null);
    }
    // reconhecimento do PvP (ranking e perfil do 1º): uma vez só
    if (!estado.exploradoPvp || estado.exploradoPvpFalhou) { const ok = await explorarPvp(sessao).catch((e) => { console.log(`Reconhecimento PvP: ${e.message}`); return false; }); estado.exploradoPvp = new Date().toISOString(); estado.exploradoPvpFalhou = !ok; }
    // meta do PvP: escada do top 100 e ~12 times por coleta, em rodízio
    const pv = await atualizarMetaPvp(sessao, estado, sal).catch((e) => { console.log(`Meta do PvP: ${e.message}`); return null; });
    if (pv) console.log(`Meta do PvP: ${pv.lidos} times lidos agora; ${pv.comTime} de ${pv.total} do top 100 com time.`);
    console.log(`Mercado aberto: ${aberto.anuncios?.length ?? 0} anúncios de pokémon e ${Object.keys(itens?.resumo ?? {}).length} itens, em ${Math.round((Date.now() - t0) / 1000)} s.`);
  } finally {
    sessao.fechar();
  }

  // histórico dos anúncios (quem entrou, quem saiu): antes de gravar o anuncios.json novo
  if (aberto.anuncios?.length) {
    const h = await registrarAnuncios(aberto.anuncios, aberto.total).catch((e) => { console.log(`Histórico de anúncios: ${e.message}`); return null; });
    if (h) console.log(`Histórico de anúncios: ${h.novos} novos, ${h.fechados} saíram, ${h.abertos} abertos${h.completa ? '' : ' (leitura incompleta: ninguém foi dado como saído)'}.`);
  }
  await gravarMercado(aberto, itens, sessao.welcome, livros).catch((e) => console.log(`Gravar mercado: ${e.message}`));

  // Cotação: a das últimas 24 h (ou a janela mais curta que tenha vendas suficientes).
  const { novas: novasDiamante } = await juntarDiamantes(diamantes);
  const cotacao = await calcularCotacao(media7);
  console.log(`${diamantes.length} vendas de diamante lidas (${novasDiamante} novas).`);
  if (cotacao) console.log(`Cotação (${cotacao.janela}): 1 Gema = ${Math.round(cotacao.coinsPorGema).toLocaleString('pt-BR')} Coins.`);

  // regras do jogo, detector de atualização e catálogo: em toda coleta, mesmo sem a planilha
  await gravarRegras(sessao.welcome).catch((e) => console.log(`Regras: ${e.message}`));
  const versao = await verificarVersao().catch((e) => console.log(`Versão do jogo: ${e.message}`));
  // o catálogo de espécies (stats, golpes, evoluções): uma vez por dia, ou logo que o jogo mudar
  if (Date.now() - Date.parse(estado.catalogoEm ?? 0) > 20 * 3600e3 || (versao?.mudouEm && versao.mudouEm > (estado.catalogoEm ?? ''))) {
    try {
      const r = await gravarCatalogo(sessao?.welcome);
      estado.catalogoEm = new Date().toISOString();
      console.log(`Catálogo: ${r.especies} espécies, ${r.evolucoes} com evolução ou Mega (hunts do welcome: ${sessao?.welcome?.hunts?.length ?? 0}).`);
    } catch (e) { console.log(`Catálogo: ${e.message}`); }
  }
  if (resp.recusa) {
    // A espera de uma hora: não é erro do coletor, a próxima rodada tenta de novo.
    console.log(`O jogo pediu para esperar (${resp.recusa.chave}). Nenhuma venda de pokémon desta vez.`);
    await juntarAoHistorico([], { fonte: 'só cotação', cotacao });
    await salvarEstado(estado);
    return;
  }
  if (!resp.ok || !Array.isArray(resp.mercado?.linhas)) throw new Error('A resposta da planilha veio num formato que o coletor não conhece.');

  const vendas = converter(resp.mercado.linhas, sal);
  const { adicionadas, total } = await juntarAoHistorico(vendas, { fonte: devePrincipal ? 'coletor' : `recuperação (${descrever(filtros)})`, cotacao });
  await gerarReferencia().then((n) => console.log(`Referência do Sniper ao vivo: ${n} grupos.`)).catch((e) => console.log(`Referência: ${e.message}`));
  console.log(`${resp.mercado.linhas.length} linhas recebidas${resp.mercado.cortado ? ' (cortada no teto de 5.000)' : ''}; ${adicionadas} vendas novas; ${total} no histórico.`);

  if (devePrincipal) estado.ultimaPrincipal = new Date().toISOString();
  else {
    estado.fila.shift();
    estado.feitos.push({ ...filtros, linhas: resp.mercado.linhas.length, novas: adicionadas, cortado: !!resp.mercado.cortado, em: new Date().toISOString() });
    // Uma tipagem que ainda bateu no teto é dividida pela moeda: cada metade traz até 5.000 de novo.
    if (resp.mercado.cortado && filtros.elemento && !filtros.moeda) {
      estado.fila.push({ ...filtros, moeda: 'orb' }, { ...filtros, moeda: 'gold' });
      console.log('A tipagem bateu no teto: entram na fila as metades em Gemas e em Coins.');
    }
  }
  await salvarEstado(estado);
  if (!devePrincipal) console.log(`Fila de recuperação: ${estado.fila.length} pedido(s) restante(s).`);
}

main().catch((e) => {
  console.error(`Falhou: ${e.message}`);
  process.exit(1);
});
