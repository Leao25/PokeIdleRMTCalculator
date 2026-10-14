// O COLETOR: entra no PokeIdle como um jogador, pede a planilha da Tabela de preços (aba Pokémon)
// e junta ao histórico.
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

const URL_JOGO = 'wss://pokeidle.io';
const ESPERA_MAX_MS = 45000;
const INTERVALO_PRINCIPAL_MS = 110 * 60 * 1000; // ~2 h, com folga para o atraso do agendador
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

/** Abre o socket, faz o "hello" e devolve a resposta da planilha (ou a recusa). */
function pedirPlanilha({ nick, token, filtros }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL_JOGO, {
      headers: { Origin: 'https://pokeidle.io', 'User-Agent': 'BalancaDePrecos-coletor/1.0 (+github)' },
    });
    let pediu = false;
    let acabou = false;
    let planilha = null;
    const media = {};
    const fim = (fn, val) => { if (acabou) return; acabou = true; clearTimeout(relogio); try { ws.close(); } catch {} fn(val); };
    let relogio = setTimeout(() => fim(reject, new Error(pediu
      ? 'O jogo não respondeu ao pedido da planilha a tempo.'
      : 'O jogo não confirmou a entrada da conta a tempo (token vencido?).')), ESPERA_MAX_MS);

    ws.on('open', () => {
      ws.send(JSON.stringify({ t: 'hello', nick, token, delta: 1, dispositivo: 'balanca-coletor' }));
    });
    ws.on('message', (bruto) => {
      let m;
      try { m = JSON.parse(bruto.toString()); } catch { return; }
      if (m.t === 'erro') {
        return fim(reject, new Error(`O jogo recusou: ${m.chave ?? m.msg ?? JSON.stringify(m).slice(0, 200)}`));
      }
      if (m.t === 'sessao.renovada') {
        console.log('Aviso: o jogo renovou a sessão desta conta. Se o coletor começar a falhar, gere um token novo (README).');
      }
      if (m.t === 'welcome' && !pediu) {
        pediu = true;
        ws.send(JSON.stringify({ t: 'csv.pedir', tipo: 'mercado', filtros }));
      }
      if (m.t === 'csv' && m.tipo === 'mercado') {
        // Com a planilha em mãos, pede também a vitrine de diamantes nas duas moedas: a resposta
        // traz o preço médio do diamante nos últimos 7 dias, de onde sai a cotação Gema ↔ Coins.
        // Não é planilha, então não gasta a vez de uma hora. Se não vier em 8 s, segue sem ela.
        planilha = m;
        for (const moeda of ['orb', 'gold']) {
          ws.send(JSON.stringify({ t: 'market.listar', tipo: 'diamante', moeda, ordem: 'baratos', busca: '', pagina: 0, especieId: 0 }));
        }
        clearTimeout(relogio);
        relogio = setTimeout(() => fim(resolve, { ...planilha, mediaDiamante: media }), 8000);
      }
      if (m.t === 'market' && m.mediaDiamante) {
        for (const k of ['orb', 'gold']) if (m.mediaDiamante[k]?.media) media[k] = m.mediaDiamante[k];
        if (planilha && media.orb && media.gold) fim(resolve, { ...planilha, mediaDiamante: media });
      }
    });
    ws.on('close', (code) => {
      if (planilha) fim(resolve, { ...planilha, mediaDiamante: media });
      else if (code === 4001) fim(reject, new Error('A conta foi aberta em outro lugar durante a coleta.'));
      else if (code === 4003) fim(reject, new Error('O jogo bloqueou esta rede.'));
      else fim(reject, new Error(`O jogo fechou a conexão (código ${code}).`));
    });
    ws.on('error', (e) => fim(reject, e));
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

/** Gema ↔ Coins pelo diamante: o mesmo diamante vendido nas duas moedas (média de 7 dias do jogo). */
function cotacaoDosDiamantes(md) {
  const orb = Number(md?.orb?.media), gold = Number(md?.gold?.media);
  if (!(orb > 0 && gold > 0)) return null;
  return {
    coinsPorGema: gold / orb, gemasPorDiamante: orb, coinsPorDiamante: gold,
    unidades: { orb: md.orb.unidades ?? null, gold: md.gold.unidades ?? null }, em: new Date().toISOString(),
  };
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

  console.log(`Pedindo a planilha (${devePrincipal ? 'principal' : 'recuperação'}: ${descrever(filtros)}).`);
  const resp = await pedirPlanilha({ nick: exigir('POKEIDLE_NICK'), token: exigir('POKEIDLE_TOKEN'), filtros });
  if (resp.recusa) {
    // A espera de uma hora: não é erro do coletor, a próxima rodada tenta de novo.
    console.log(`O jogo pediu para esperar (${resp.recusa.chave}). Nada coletado desta vez.`);
    return;
  }
  if (!resp.ok || !Array.isArray(resp.mercado?.linhas)) throw new Error('A resposta da planilha veio num formato que o coletor não conhece.');

  const vendas = converter(resp.mercado.linhas, sal);
  const cotacao = cotacaoDosDiamantes(resp.mediaDiamante);
  if (cotacao) console.log(`Cotação: 1 Gema = ${Math.round(cotacao.coinsPorGema).toLocaleString('pt-BR')} Coins (diamante: ${cotacao.gemasPorDiamante} Gemas / ${cotacao.coinsPorDiamante.toLocaleString('pt-BR')} Coins).`);
  else console.log('Sem a média dos diamantes nesta rodada; o site mantém a última cotação.');
  const { adicionadas, total } = await juntarAoHistorico(vendas, { fonte: devePrincipal ? 'coletor' : `recuperação (${descrever(filtros)})`, cotacao });
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
