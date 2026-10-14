// O COLETOR: entra no PokeIdle como um jogador, pede a planilha da Tabela de preços (aba Pokémon,
// sem filtro: as até 5.000 vendas mais recentes dos últimos 30 dias) e junta ao histórico.
//
// Usa o mesmo caminho do botão "Exportar planilha" do jogo (`csv.pedir` do tipo `mercado`), que o
// servidor libera uma vez por hora por IP. Rodando a cada 2 horas, sobra folga.
//
// Precisa de três variáveis (no GitHub, são os secrets do repositório):
//   POKEIDLE_NICK   o nick da conta do coletor
//   POKEIDLE_TOKEN  a sessão dessa conta (dura 30 dias; ver o README para renovar)
//   NOMES_SAL       texto aleatório que embaralha os nomes dos jogadores
//
// A conta joga em um lugar por vez: entrar aqui PAUSA a sessão dela em qualquer outro lugar.
// Por isso o coletor precisa de uma conta só dele.
import WebSocket from 'ws';
import { codigoDoJogador, juntarAoHistorico, salDosNomes } from './historico.mjs';

const URL_JOGO = 'wss://pokeidle.io';
const ESPERA_MAX_MS = 45000;

function exigir(nome) {
  const v = process.env[nome];
  if (!v) throw new Error(`Falta a variável ${nome}.`);
  return v;
}

/** Abre o socket, faz o "hello" e devolve a primeira resposta da planilha (ou a recusa). */
function pedirPlanilha({ nick, token }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL_JOGO, {
      headers: { Origin: 'https://pokeidle.io', 'User-Agent': 'BalancaDePrecos-coletor/1.0 (+github)' },
    });
    let pediu = false;
    const fim = (fn, val) => { clearTimeout(relogio); try { ws.close(); } catch {} fn(val); };
    const relogio = setTimeout(() => fim(reject, new Error(pediu
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
        ws.send(JSON.stringify({ t: 'csv.pedir', tipo: 'mercado', filtros: { tipo: 'pokemon' } }));
      }
      if (m.t === 'csv' && m.tipo === 'mercado') fim(resolve, m);
    });
    ws.on('close', (code) => {
      if (code === 4001) fim(reject, new Error('A conta foi aberta em outro lugar durante a coleta.'));
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

async function main() {
  const sal = salDosNomes();
  const resp = await pedirPlanilha({ nick: exigir('POKEIDLE_NICK'), token: exigir('POKEIDLE_TOKEN') });
  if (resp.recusa) {
    // A espera de uma hora por IP: não é erro do coletor, a próxima rodada pega.
    console.log(`O jogo pediu para esperar (${resp.recusa.chave}). Nada coletado desta vez.`);
    return;
  }
  if (!resp.ok || !Array.isArray(resp.mercado?.linhas)) throw new Error('A resposta da planilha veio num formato que o coletor não conhece.');
  const vendas = converter(resp.mercado.linhas, sal);
  const { adicionadas, total } = await juntarAoHistorico(vendas, { fonte: 'coletor' });
  console.log(`${resp.mercado.linhas.length} linhas recebidas${resp.mercado.cortado ? ' (cortada no teto)' : ''}; ${adicionadas} vendas novas; ${total} no histórico.`);
}

main().catch((e) => {
  console.error(`Falhou: ${e.message}`);
  process.exit(1);
});
