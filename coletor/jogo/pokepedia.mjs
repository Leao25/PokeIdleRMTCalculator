// A POKEPÉDIA — o manual do jogo, escrito por dentro.
//
// ### Por que isto é um módulo, e não mais um `render` no app.js
//
// Todo o resto da interface é RÓTULO: palavra curta, num lugar fixo, traduzida em
// `i18n.mjs`. A Pokepédia é CONTEÚDO — parágrafos inteiros, em três línguas, que crescem
// junto com o jogo. Enfiar isso no dicionário significaria centenas de chaves longas
// disputando espaço com "Cancelar" e "Nv", e o `teste-i18n` gastaria o dia comparando
// frases de dois parágrafos.
//
// Aqui cada capítulo carrega as três versões do próprio texto, lado a lado, e quem traduz vê
// as três juntas em vez de caçá-las em três blocos de 550 linhas.
//
// ### A regra que manda em tudo: NENHUM NÚMERO É ESCRITO À MÃO
//
// Um manual com número errado é pior que nenhum manual — o jogador confia, planeja em cima e
// descobre a mentira gastando ouro. Então toda tabela desta tela é MONTADA a partir do que o
// servidor mandou no `welcome`: as pokébolas, a tabela de tipos, a potência, as chances de
// shiny, os preços da loja, o spread da gema, as regras do PvP e as fichas dos
// bosses. Se o balanceamento mudar no servidor, esta tela muda junto, sozinha.
//
// Os poucos números que aparecem no texto corrido são os que NÃO trafegam (a curva de XP, os
// cooldowns do combate) e estão marcados um a um com o arquivo de onde saíram.

// As regras dos GINÁSIOS não trafegam no `welcome` — elas moram em `shared/`, que é o
// arquivo que cliente e servidor leem juntos. Importar daqui é a mesma promessa da regra
// acima por outro caminho: se o balanceamento mudar lá, este capítulo muda junto.
import {
  TIPOS_GINASIO,
  GINASIO_TIME_MAX,
  ARENA_NIVEL_CHEIO,
  GINASIO_NIVEL_MIN,
  GINASIO_BUFF_PCT,
  GINASIO_DESAFIO_COOLDOWN_MS,
  ARENA_EXPO_GUERRA,
  nivelNaGuerra,
  nivelNoGinasio,
} from '../shared/ginasios.mjs';
// A diagonal da tabela de tipos (o tipo contra ele mesmo) não vem no `welcome` — o espelho só traz as
// outras células. A grade do capítulo de tipos a lê da mesma conta do combate.
import { multAtaqueContraDefesa } from '../shared/tipo-efetividade.mjs';
// Mesma promessa para o PvP RANQUEADO: a escada inteira (tiers, vagas, posicionamento,
// atrito da derrota, decaimento) mora em `shared/` e é lida por cliente e servidor. O
// capítulo 13 monta a tabela de ranks a partir daqui, sem número escrito à mão.
import {
  PVP_TIERS,
  PVP_PR_ELITE,
  PVP_VAGAS_MESTRE,
  PVP_VAGAS_CHALLENGER,
  PVP_PONTOS_POR_DIVISAO,
  PVP_PARTIDAS_POSICIONAMENTO,
  PVP_TETO_POSICIONAMENTO,
  PVP_ATRITO_DERROTA,
  PVP_ENTRE_PARTIDAS_MS,
  PVP_DECAIMENTO_HORAS,
  PVP_NIVEL_MIN,
  PVP_PREMIOS,
  PVP_POSICOES_PREMIADAS,
  PVP_TIME_MAX,
  PVP_TIME_MIN,
} from '../shared/pvp-rank.mjs';
// E a NOTA da calculadora: os degraus de cor saem de `FAIXAS_NOTA`, a mesma tabela que pinta a
// caixa grande da calculadora (`faixaDaNota`). Um degrau novo aparece na tabela do capítulo sozinho.
import { FAIXAS_NOTA, AUTO_LOCK_NOTA_MIN, GANHO_MIN_EVOLUCAO, MULT_LENDARIO_STATS } from '../shared/nota-pokemon.mjs';
// O OURO DO ABATE e as PEDRAS POR ESTÁGIO (o fim do loot, 15/10/2026): as mesmas contas do servidor.
import { ouroDoAbate } from '../shared/recompensa-hunt.mjs';
import { CHANCE_PEDRA_POR_ESTAGIO } from '../shared/loot-pedras.mjs';
// A OFERENDA, o CAMPEONATO e o nível do EEVEE também moram em `shared/`, lidos pelas duas pontas:
// as casas da roleta, as datas, o requisito e o prêmio do campeonato, e o degrau fixo dos oito
// destinos do Eevee saem daqui, e não de um número copiado no texto.
import { OFERENDA_CASAS, OFERENDA_LOTE_GIROS_MAX } from '../shared/oferenda.mjs';
import { faixasOrbParaTela, liquidoOrbDaVenda, TAXA_ORB_PLANA } from '../shared/taxa-mercado.mjs';
import { JANELA_PRECOS_POKEMON_DIAS } from '../shared/tabela-precos.mjs';
// A ÁREA DE TREINAMENTO, pela mesma razão: os limites da bancada (casas por lado, espera entre
// batalhas) moram em `shared/`, e mexer neles muda a Wiki no mesmo commit. (O capítulo das CAIXAS DO
// MARKET, que lia `shared/caixas-npc.mjs`, saiu com as caixas em 12/10/2026.)
import { TREINO_MAX_LADO, TREINO_COOLDOWN_MS } from '../shared/treino.mjs';
import { campeonatoDe, FUSO_CAMPEONATO, INTERVALO_ONDA_MS, montarChave, resolverChave } from '../shared/campeonato.mjs';
// O SHOWDOWN, o torneio semanal da comunidade: a agenda da quarta, a rodada, o teto de nível, o
// requisito e o prêmio saem do módulo com que o servidor recusa a equipe, congela o retrato e paga.
import {
  SHOWDOWN_PREMIOS, SHOWDOWN_MIN_PARA_PREMIO, SHOWDOWN_NIVEL_MIN, SHOWDOWN_NIVEL_CAP, TETO_DIAMANTES_SHOWDOWN,
  nivelNoShowdown, primeiroShowdown, showdownAberto, showdownAtivo,
} from '../shared/showdown.mjs';
import { EVOLUCOES_RAMIFICADAS } from '../shared/evolucoes-ramificadas.mjs';
// As recompensas da GUILD (o bônus do ranking Diário e os diamantes da Temporada Global) são as
// mesmas que o servidor paga e que a folha 🏆 do PvP mostra.
import {
  BONUS_RANKING_GP, PREMIOS_GLOBAL, POSICOES_BONUS_GP, PRIMEIRA_POS_RESTO, PREMIADOS_GLOBAL,
} from '../shared/guild-premios.mjs';
import {
  TRILHA as TRILHA_PASSE, PASSE_DIAS, PASSE_VIP_PRECO, PASSE_VIP_DIAS, PASSE_NIVEL_MIN,
} from '../shared/passe-batalha.mjs';
// O golpe do TM ELEMENTAL é o mesmo que o servidor usa para lutar: power, cooldown e o raio da
// área saem daqui, e o capítulo de TM Disks conta o alcance dele a partir do raio.
import { TM_ELEMENTAL_POWER, TM_ELEMENTAL_CD_MS, TM_ELEMENTAL_RAIO } from '../shared/tm-elemental.mjs';
import { MEGAS, megaTemShiny, MEGA_POKE_BASE } from '../shared/megas.mjs';
import { MAX_PASTAS } from '../shared/colecao-pastas.mjs';
import { BOOST_GUILD, BANCO_GUILD } from '../shared/guild-boost.mjs';
import {
  PESO_SOBREVIVENCIA, PESO_COMBATE, notaSobrevivencia, notaCombate, gpDaNota,
} from '../shared/guild-pontos.mjs';
import { ATRASADOS, ganhoAteOAlvo, precoAtrasados, xpTotalDoNivel } from '../shared/boost-atrasados.mjs';
import { FAIXAS_RANKING_MENSAL, PREMIADOS_RANKING_MENSAL, TETO_DIAMANTES_MES } from '../shared/ranking-mensal.mjs';
// O TOP CATCH SEMANAL (zera na virada do PvP e paga a própria escada toda semana): a escada, o teto e
// quantas posições pagam saem da mesma tabela com que o servidor paga.
import { FAIXAS_TOP_CATCH, PREMIADOS_TOP_CATCH, TETO_DIAMANTES_TOP_CATCH } from '../shared/top-catch.mjs';
// A leva de setembro e outubro de 2026 — Chocadeira, Mystic Ticket, Name Tag, skins, craft de casas,
// Quadro de guildas, formações do PvP, alto-falante, curva dos golpes, convites e Tag do Discord. As
// regras de todas moram em `shared/`, lidas pelo servidor e pela tela; o manual lê do mesmo lugar.
import {
  OVOS, OVO_SHINY, CHOCADEIRAS_GRATIS, CHOCADEIRAS_MAX, PRECO_CHOCADEIRA_DIAMANTES, PRECO_BULBO_DIAMANTES, BULBO_FATOR,
} from '../shared/chocadeira.mjs';
import {
  CUSTO_FRAGMENTOS_OVO_SHINY, CHANCE_FRAGMENTO_OVO_SHINY_BASE, CHANCE_FRAGMENTO_OVO_SHINY_PASSO, NIVEL_MIN_FRAGMENTO_OVO_SHINY,
  tabelaFragmentoOvoShiny,
} from '../shared/ovo-shiny.mjs';
import {
  CHANCE_TICKET_PASSO, NIVEL_LENDARIO_MISTICO, MISTICO_QUALIDADE_MIN, MISTICO_IV_SOMA_MIN,
  MISTICO_POTENCIA_MIN, CAPTURA_MISTICA_POR_BOLA, MISTICO_ESCOLHA_MS, ehMitico,
} from '../shared/mistico.mjs';
import {
  SAFARI_DURACAO_MS, chanceSafariTicketDoPar, NIVEL_SELVAGEM_SAFARI, TETO_CAPTURA_SAFARI, nivelDeCapturaNoSafari,
} from '../shared/safari.mjs';
import { TETO_CAPTURA_MAX } from '../shared/teto-captura.mjs';
import { FOLGA_NIVEL_POKEMON } from '../shared/pokemon-nivel-treinador.mjs';
import { NAME_TAG_PRECO, APELIDO_MAX } from '../shared/apelido-pokemon.mjs';
import { SKIN_PRECO, SKINS, EVENTOS_SKIN } from '../shared/skins.mjs';
import { CUSTO_CRAFT_CASA, CRAFT_CASA } from '../shared/casas.mjs';
import { GUILD_SAIDA_CD_MS, MAX_DESCRICAO_GUILD } from '../shared/guild-recrutamento.mjs';
import { PVP_FORMACOES_MAX, FORMACAO_NOME_MAX } from '../shared/pvp-formacoes.mjs';
import { CUSTO_ALTO_FALANTE, ESPERA_ALTO_FALANTE_MS } from '../shared/alto-falante.mjs';
import {
  cooldownDoPoder, COOLDOWN_600_MS, COOLDOWN_MEGA_MS, PODER_MINIMO,
  cooldownGolpeComSpeed, potencialDoSpeed, descontoDoSpeedPct, SPEED_POTENCIAL_TETO_PCT,
} from '../shared/cooldown-golpes.mjs';
import { escaparHtml } from '../shared/escapar-html.mjs';
import { MARCOS as MARCOS_CONVITE, IDADE_MINIMA_MS as IDADE_DISCORD_MS } from '../shared/convites.mjs';
import { PERIODO_DIAS as DIAS_TAG, DIAMANTES_POR_PERIODO as DIAMANTES_TAG, DIAMANTES_BOAS_VINDAS as DIAMANTES_TAG_1A } from '../shared/tag-discord.mjs';
import { nivelMinimoDoPar } from '../shared/bosses-lendarios.mjs';
import { AJUSTE_REVIVE_PCT, REVIVE_ID } from '../shared/ajuste-item-espelho.mjs';

// Os números abaixo NÃO trafegam e não moram em `shared/` — cada um diz de onde saiu.
/** Teto de tempo simulado da Guerra de Guilds, em minutos: `LIMITE_MS_GUERRA`, em `server/game/guild-pvp-sim.mjs`. */
const MIN_GUERRA = 10;
/** Espera entre duas mensagens no chat público, em segundos: `CHAT_COOLDOWN_MS`, em `server/limites-ws.mjs`. */
const SEG_CHAT = 30;
/** A janela do sorteio na liberação do Mercado, em segundos: `JANELA_SORTEIO_MS`, em `server/sorteio-mercado.mjs`. */
const SEG_SORTEIO = 3;
/** Quantos anúncios uma compra em quantidade atravessa: `MAX_ANUNCIOS_LOTE`, em `server/market-db.mjs`. */
const MAX_ANUNCIOS_LOTE = 500;
/** O nível em que o Eevee evolui para qualquer um dos oito destinos. */
const NIVEL_EEVEE = EVOLUCOES_RAMIFICADAS[133]?.[0]?.nivel ?? 80;
/** Base da penalidade de equipe dos bosses: `BOSS_PENALIDADE_BASE`, em `server/game/bosses.mjs`. */
const BASE_PENALIDADE_BOSS = 3;
/** O lado do quadrado do TM AoE, em tiles: `TM_AOE_RAIO` (5), em `server/game/tm.mjs` — 2 × 5 + 1. */
const LADO_TM_AOE = 11;
/** O lado do quadrado do golpe do TM Elemental — com o centro no ALVO, não no pokémon do jogador. */
const LADO_TM_ELEMENTAL = 2 * TM_ELEMENTAL_RAIO + 1;
/** Nível do treinador para mandar mensagem no chat e usar a Lista de Amigos: `CHAT_NIVEL_MIN`, em `server/protocol.mjs`. */
const NIVEL_CHAT = 10;
/** Teto da Lista de Amigos: `MAX_AMIGOS`, em `server/amigos-db.mjs`. */
const MAX_AMIGOS = 300;
/** Quantos dias as conversas privadas e o chat da guild ficam guardados: `RETENCAO_DM`, em `server/amigos-db.mjs`. */
const DIAS_DM = 7;
/** O que a transferência de Coins entre amigos queima, em %: `TAXA_COINS_AMIGO`, em `server/amigos-db.mjs`. */
const PCT_ENVIO_COINS = 15;
/** O mínimo de um envio de Coins entre amigos: `MIN_COINS_AMIGO`, em `server/amigos-db.mjs`. */
const MIN_ENVIO_COINS = 1000;
/** A espera do Mapa contra o "reset" da hunt, em segundos: `HUNT_REENTRADA_MS`, em `server/sim.mjs`. */
const SEG_REENTRADA_HUNT = 10;
/**
 * O Bônus Twitch, em pontos percentuais: `TWITCH_BONUS_PCT` e `TWITCH_BONUS_EXTRA_PCT`, em
 * `server/game/bonus-twitch.mjs`. Com o jogador logado, vale o que veio no snapshot (`eu.twitch`).
 */
const PCT_TWITCH = 15;
const PCT_TWITCH_EXTRA = 2.5;
/**
 * O Bônus na Kick: `KICK_BONUS_PCT`, `KICK_BONUS_MS` e o custo das três recompensas
 * (`RECOMPENSAS_KICK`), em `server/game/bonus-kick.mjs`. Com o jogador logado, vale o snapshot (`eu.kick`).
 */
const PCT_KICK = 15;
const MIN_KICK = 60;
const CUSTO_KICK = { xp: 300, captura: 500, shiny: 1000 };
/**
 * A comissão de indicação: `PCT_DIA_COMISSAO` (diamantes) e `PCT_ORB_COMISSAO` (gemas), e o dia de
 * VIP do Referral Especial (`HORAS_VIP_REFERRAL`), em `server/game/afiliados.mjs`.
 */
const PCT_INDICACAO_DIAMANTE = 10;
const PCT_INDICACAO_GEMA = 5;
const HORAS_VIP_REFERRAL = 24;
/**
 * O nível-alvo do Boost dos Atrasados que a Wiki usa nos exemplos quando não há jogador logado: a
 * mediana dos veteranos em 06/10/2026 (`game_meta.atrasados_alvo` na produção, calculada por
 * `server/game/boost-atrasados.mjs`). Logado, vale o alvo de hoje do snapshot (`eu.loja.alvoAtrasados`).
 */
const ALVO_EXEMPLO_ATRASADOS = 639;
/** Quantos votos no TopIdle valem um diamante: `VOTOS_POR_DIAMANTE`, em `server/game/topidle.mjs`. */
const VOTOS_POR_DIAMANTE = 2;
/** Quantas negociações do Comércio um comprador mantém abertas: `MAX_CONVERSAS_COMPRADOR`, em `server/comercio-db.mjs`. */
const MAX_NEGOCIACOES = 50;
/**
 * Quantos dos 8 selvagens que cercam o pokémon o golpe do TM Elemental alcança, com o alvo em
 * (ax, ay) relativo ao pokémon. É a conta de `alvosDoGolpe` (`server/game/tm.mjs`): Chebyshev até
 * o alvo ≤ `TM_ELEMENTAL_RAIO`. Com raio 1 dá 5 com o alvo reto e 3 na diagonal, contando o alvo.
 */
const cercoNoTmElemental = (ax, ay) => {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if ((dx || dy) && Math.max(Math.abs(dx - ax), Math.abs(dy - ay)) <= TM_ELEMENTAL_RAIO) n++;
    }
  }
  return n;
};
const TM_CERCO_RETO = cercoNoTmElemental(1, 0);
const TM_CERCO_DIAGONAL = cercoNoTmElemental(1, 1);

const T = ['NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
  'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'];

/** A espera entre dois desafios ao mesmo ginásio, em horas. */
const HORAS_DESAFIO_GINASIO = Math.round(GINASIO_DESAFIO_COOLDOWN_MS / 3_600_000);

/** Abreviação de três letras para caber na grade 18×18 sem virar coluna de 60 px. */
const CURTO = {
  NORMAL: 'NOR', FIRE: 'FOG', WATER: 'AGU', GRASS: 'PLA', ELECTRIC: 'ELE', ICE: 'GEL',
  FIGHTING: 'LUT', POISON: 'VEN', GROUND: 'TER', FLYING: 'VOO', PSYCHIC: 'PSI', BUG: 'INS',
  ROCK: 'ROC', GHOST: 'FAN', DRAGON: 'DRA', DARK: 'SOM', STEEL: 'MET', FAIRY: 'FAD',
};
const CURTO_EN = {
  NORMAL: 'NOR', FIRE: 'FIR', WATER: 'WAT', GRASS: 'GRA', ELECTRIC: 'ELE', ICE: 'ICE',
  FIGHTING: 'FIG', POISON: 'POI', GROUND: 'GRO', FLYING: 'FLY', PSYCHIC: 'PSY', BUG: 'BUG',
  ROCK: 'ROC', GHOST: 'GHO', DRAGON: 'DRA', DARK: 'DAR', STEEL: 'STE', FAIRY: 'FAI',
};

// ---------------------------------------------------------------- rótulos
//
// O vocabulário curto das tabelas, por língua. Só o que se repete em várias delas — o texto
// corrido de cada capítulo mora no próprio capítulo.

const ROTULOS = {
  pt: {
    bola: 'Pokébola', eficiencia: 'Eficiência', chanceCorpo: 'Chance (corpo caído)', preco: 'Preço', ouro: 'ouro',
    chance: 'Chance', bonus: 'Bônus', duracao: 'Duração', efeito: 'Efeito', diamantes: '💎',
    item: 'Item', valor: 'Valor', quanto: 'Quanto', quando: 'Quando', regra: 'Regra',
    nivel: 'Nível', xpTotal: 'XP total', custoNivel: 'Só deste nível',
    regiao: 'Região', nivelTreinador: 'Nv treinador',
    atacante: 'Golpe ↓', base: 'Normal', naHunt: 'Na hunt',
    tier: 'Tier', porTentativa: 'Por tentativa de captura', comIsca: 'Com Secret Lure', especies: 'Espécies',
    qualidade: 'Qualidade', rotulo: 'Rótulo',
    naoComprava: 'só com diamante', semLimite: 'sem limite', sim: 'sim', nao: 'não',
    taxa: 'Taxa', ondeIncide: 'Onde incide', quemPaga: 'Quem paga',
    porNivel: 'Por nível', totalAcum: 'Total', tipo: 'Tipo',
    pedra: 'Pedra', assinatura: 'Item assinatura', vira: 'Vira', ondeAparece: 'Hunt do alvo',
    mediaKills: 'Média de kills',
  },
  en: {
    bola: 'Poké Ball', eficiencia: 'Efficiency', chanceCorpo: 'Catch % (fainted)', preco: 'Price', ouro: 'gold',
    chance: 'Chance', bonus: 'Bonus', duracao: 'Duration', efeito: 'Effect', diamantes: '💎',
    item: 'Item', valor: 'Value', quanto: 'How much', quando: 'When', regra: 'Rule',
    nivel: 'Level', xpTotal: 'Total XP', custoNivel: 'This level only',
    regiao: 'Region', nivelTreinador: 'Trainer Lv',
    atacante: 'Move ↓', base: 'Normal', naHunt: 'On the hunt',
    tier: 'Tier', porTentativa: 'Per capture attempt', comIsca: 'With Secret Lure', especies: 'Species',
    qualidade: 'Quality', rotulo: 'Label',
    naoComprava: 'diamonds only', semLimite: 'no cap', sim: 'yes', nao: 'no',
    taxa: 'Fee', ondeIncide: 'Where it applies', quemPaga: 'Who pays',
    porNivel: 'Per level', totalAcum: 'Total', tipo: 'Type',
    pedra: 'Stone', assinatura: 'Signature item', vira: 'Becomes', ondeAparece: "Target's hunt",
    mediaKills: 'Avg. kills',
  },
  es: {
    bola: 'Poké Ball', eficiencia: 'Eficiencia', chanceCorpo: 'Chance (derrotado)', preco: 'Precio', ouro: 'oro',
    chance: 'Probabilidad', bonus: 'Bono', duracao: 'Duración', efeito: 'Efecto', diamantes: '💎',
    item: 'Objeto', valor: 'Valor', quanto: 'Cuánto', quando: 'Cuándo', regra: 'Regla',
    nivel: 'Nivel', xpTotal: 'XP total', custoNivel: 'Solo de este nivel',
    regiao: 'Región', nivelTreinador: 'Nv entrenador',
    atacante: 'Golpe ↓', base: 'Normal', naHunt: 'En la cacería',
    tier: 'Tier', porTentativa: 'Por intento de captura', comIsca: 'Con Secret Lure', especies: 'Especies',
    qualidade: 'Calidad', rotulo: 'Etiqueta',
    naoComprava: 'solo con diamantes', semLimite: 'sin tope', sim: 'sí', nao: 'no',
    taxa: 'Comisión', ondeIncide: 'Dónde se aplica', quemPaga: 'Quién paga',
    porNivel: 'Por nivel', totalAcum: 'Total', tipo: 'Tipo',
    pedra: 'Piedra', assinatura: 'Ítem insignia', vira: 'Se convierte en', ondeAparece: 'Cacería del objetivo',
    mediaKills: 'Media de kills',
  },
};

// ------------------------------------------------------------- utilidades

const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);

const N = (n, lang) => (n ?? 0).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US');

/**
 * Porcentagem com as casas que o valor merece.
 *
 * A escada é a mesma do `pct` do app.js, e existe pelo mesmo motivo: a potência 5 é 0,005%, e
 * arredondar para duas casas dobraria o número mais raro da tabela.
 */
const P = (v, lang) => {
  const casas = v >= 0.1 ? 1 : v >= 0.001 ? 2 : v >= 0.00001 ? 4 : 6;
  const s = (v * 100).toFixed(casas);
  return `${lang === 'en' ? s : s.replace('.', ',')}%`;
};

const umEm = (c) => (c > 0 ? `1 / ${Math.round(1 / c).toLocaleString('en-US').replace(/,/g, '.')}` : '—');

/**
 * O OURO DE CADA ABATE, nível a nível (o fim do loot, 15/10/2026): a curva, o bônus de loot (o que o
 * loot vendido ao NPC pagava) e o total com o Loot Boost — tudo de `ouroDoAbate`
 * (`shared/recompensa-hunt.mjs`), a conta do servidor. O +% do Loot Boost vem do `welcome`
 * (`tiposBoost`, o `mult` de `server/game/loja.mjs`); 40 é a reserva de antes do login.
 */
const NIVEIS_OURO_WIKI = [1, 100, 1_000, 5_000, 25_000, 160_300];
const pctLootBoost = (c) => Math.round((((c.d.tiposBoost ?? []).find((b) => b.chave === 'loot')?.mult ?? 1.4) - 1) * 100);
const tabelaOuroDoAbate = (c, lang) => {
  const boost = pctLootBoost(c);
  const cab = {
    pt: ['Nível do selvagem', 'Ouro (curva)', 'Bônus de loot', 'Total', `Com Loot Boost (+${boost}%)`],
    en: ['Wild level', 'Gold (curve)', 'Loot bonus', 'Total', `With Loot Boost (+${boost}%)`],
    es: ['Nivel del salvaje', 'Oro (curva)', 'Bono de loot', 'Total', `Con Loot Boost (+${boost}%)`],
  }[lang];
  return tabela(cab, NIVEIS_OURO_WIKI.map((n) => {
    const a = ouroDoAbate(n);
    const b = ouroDoAbate(n, boost);
    return `<tr><td class="wk-num">${N(n, lang)}</td><td class="wk-num">${N(a.base, lang)}</td>`
      + `<td class="wk-num">+${N(a.loot, lang)}</td><td class="wk-num destaque">${N(a.total, lang)}</td>`
      + `<td class="wk-num">${N(b.total, lang)}</td></tr>`;
  }).join(''));
};

/** A chance de cada pedra por estágio da cadeia (`CHANCE_PEDRA_POR_ESTAGIO`, `shared/loot-pedras.mjs`). */
const pctPedra = (v, lang) => `${lang === 'en' ? v : String(v).replace('.', ',')}%`;
const tabelaPedraPorEstagio = (c, lang) => {
  const [e1, e2, e3] = CHANCE_PEDRA_POR_ESTAGIO;
  const cab = {
    pt: ['Estágio', 'Exemplo', 'Chance de cada pedra'],
    en: ['Stage', 'Example', 'Chance of each stone'],
    es: ['Etapa', 'Ejemplo', 'Probabilidad de cada piedra'],
  }[lang];
  const nomes = {
    pt: ['1ª evolução', '2ª evolução', '3ª evolução ou quem não evolui'],
    en: ['1st evolution', '2nd evolution', "3rd evolution, or one that doesn't evolve"],
    es: ['1.ª evolución', '2.ª evolución', '3.ª evolución o quien no evoluciona'],
  }[lang];
  const ex = ['Charmander', 'Charmeleon', 'Charizard · Tauros'];
  return tabela(cab, [e1, e2, e3].map((v, i) =>
    `<tr><td>${nomes[i]}</td><td>${ex[i]}</td><td class="wk-num destaque">${pctPedra(v, lang)}</td></tr>`).join(''));
};

/** Chance do Bronze Boss Token por kill na Outland — vem do `welcome`, não hardcoded. */
const chanceBossToken = (c) => c.d.chanceBossToken ?? 0.0005;
const pctBossToken = (c) => P(chanceBossToken(c), c.lang);
const mediaBossToken = (c) => N(Math.round(1 / chanceBossToken(c)), c.lang);

/**
 * A ESCADA DAS OUTLANDS — o degrau que o jogador escolhe no seletor da aba Outland do mapa.
 *
 * Mesmo mapa, mesmos selvagens, mesmo nível 150 em todos os degraus. O que muda é a chance
 * dos TRÊS drops raros da área. Os números vêm do `welcome` (`shared/outland-tiers.mjs` no
 * servidor); a reserva abaixo é só para o manual abrir antes de o welcome chegar.
 *
 * Nada neste capítulo conta degraus à mão: título, texto e tabela saem todos desta lista, para
 * que uma Outland nova (ou um multiplicador rebalanceado) não deixe o manual mentindo.
 */
const tiersOutland = (c) => c.d.outlandTiers ?? [
  { tier: 1, rotulo: 'Outland 1', nivel: 150, mult: 1 },
  { tier: 2, rotulo: 'Outland 2', nivel: 500, mult: 1.25 },
  { tier: 3, rotulo: 'Outland 3', nivel: 1000, mult: 1.5 },
  { tier: 4, rotulo: 'Outland 4', nivel: 2000, mult: 2 },
  { tier: 5, rotulo: 'Outland 5', nivel: 4000, mult: 3 },
  { tier: 6, rotulo: 'Outland 6', nivel: 8000, mult: 4 },
  { tier: 7, rotulo: 'Outland 7', nivel: 16000, mult: 6 },
  { tier: 8, rotulo: 'Outland 8', nivel: 25000, mult: 8 },
];

/** Quantas Outlands existem — o número que os títulos e as frases usam. */
const quantasOutlands = (c) => N(tiersOutland(c).length, c.lang);

/** O maior multiplicador da escada, já com vírgula ou ponto conforme a língua. */
const maiorMultOutland = (c) => N(Math.max(...tiersOutland(c).map((x) => x.mult)), c.lang);

/**
 * A frase curta que os capítulos da Casa e da Shiny Stone usam para não repetir a tabela.
 *
 * Eles falam da chance BASE (a da Outland 1); esta linha é o "e nas de cima". Diz só o TETO da
 * escada em vez de enumerar degrau por degrau — enumerada, ela viraria uma frase de várias
 * linhas no meio de um parágrafo que fala de outra coisa, e cresceria a cada Outland nova.
 * Quem quer a escada inteira segue o link para o capítulo de Combate, onde ela está em tabela.
 * O Bronze Boss Token aponta para `bosses`, que tem a chance dele já multiplicada Outland a Outland.
 */
const dicaOutlandTiers = (c, cap = 'combate') => {
  if (!tiersOutland(c).some((x) => x.mult > 1)) return '';
  const teto = maiorMultOutland(c);
  const link = cap === 'bosses'
    ? `<a data-cap="bosses">Bosses</a>`
    : `<a data-cap="combate">${c.lang === 'en' ? 'Combat' : 'Combate'}</a>`;
  if (c.lang === 'en') {
    return ` That is the Outland 1 rate — the other steps multiply it up to <b>×${teto}</b>`
      + ` (see ${link}).`;
  }
  if (c.lang === 'es') {
    return ` Esa es la probabilidad en Outland 1 — los demás escalones la multiplican hasta`
      + ` <b>×${teto}</b> (ver ${link}).`;
  }
  return ` Essa é a chance na Outland 1 — os degraus de cima multiplicam até <b>×${teto}</b>`
    + ` (ver ${link}).`;
};

/** A escada inteira: nível de entrada e multiplicador dos raros, um degrau por linha. */
const tabelaOutlandTiers = (c) => tabela(
  [c.r.regiao, c.r.nivelTreinador, c.r.bonus],
  tiersOutland(c)
    .map((x) => `<tr><td>${esc(x.rotulo)}</td><td class="wk-num">${N(x.nivel, c.lang)}</td>` +
      `<td class="wk-num${x.mult > 1 ? ' destaque' : ''}">×${N(x.mult, c.lang)}</td></tr>`)
    .join(''),
);

/**
 * A chance do Bronze Boss Token em cada Outland, já multiplicada — o capítulo de Bosses mostra
 * a conta pronta, porque é a pergunta de quem abre ali ("quantas kills por token na minha?").
 * Sem Loot Boost: ele multiplica por cima de qualquer linha.
 */
const tabelaBossTokenPorOutland = (c) => tabela(
  [c.r.regiao, c.r.nivelTreinador, c.r.chance, c.r.mediaKills],
  tiersOutland(c)
    .map((x) => {
      const ch = chanceBossToken(c) * x.mult;
      return `<tr><td>${esc(x.rotulo)}</td><td class="wk-num">${N(x.nivel, c.lang)}</td>` +
        `<td class="wk-num${x.mult > 1 ? ' destaque' : ''}">${P(ch, c.lang)}</td>` +
        `<td class="wk-num">~${N(Math.round(1 / ch), c.lang)}</td></tr>`;
    })
    .join(''),
);

// ------------------------------------------------------------------ PvP ranqueado
//
// Os nomes dos tiers por língua. O `id` é o do servidor (`PVP_TIERS`), e é ele que manda: um
// tier novo aparece na tabela assim que entrar lá, e só o RÓTULO precisa vir aqui.
const NOME_TIER = {
  pt: {
    bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', platina: 'Platina',
    diamante: 'Diamante', mestre: 'Mestre', challenger: 'Challenger',
  },
  en: {
    bronze: 'Bronze', prata: 'Silver', ouro: 'Gold', platina: 'Platinum',
    diamante: 'Diamond', mestre: 'Master', challenger: 'Challenger',
  },
  es: {
    bronze: 'Bronce', prata: 'Plata', ouro: 'Oro', platina: 'Platino',
    diamante: 'Diamante', mestre: 'Maestro', challenger: 'Challenger',
  },
};

const ROTULO_RANK = {
  pt: { rank: 'Rank', comoEntra: 'Como se entra', divisoes: 'Divisões' },
  en: { rank: 'Rank', comoEntra: 'How you get in', divisoes: 'Divisions' },
  es: { rank: 'Rango', comoEntra: 'Cómo se entra', divisoes: 'Divisiones' },
};

/**
 * A escada dos sete ranks, montada a partir de `PVP_TIERS`.
 *
 * Nada é escrito à mão — nem a faixa de PR de cada tier, nem quantas vagas têm os dois do topo.
 * Mexer no balanceamento em `shared/pvp-rank.mjs` muda esta tabela junto, que é a promessa do
 * cabeçalho deste arquivo.
 */
function tabelaDeRanks(c) {
  const nomes = NOME_TIER[c.lang] ?? NOME_TIER.pt;
  const r = ROTULO_RANK[c.lang] ?? ROTULO_RANK.pt;
  const elite = N(PVP_PR_ELITE, c.lang);

  const comoEntra = (t) => {
    if (t.id === 'challenger') {
      return c.lang === 'pt'
        ? `<b>${elite} PR</b> e estar entre os <b>${N(PVP_VAGAS_CHALLENGER, c.lang)} primeiros</b>`
        : c.lang === 'es'
          ? `<b>${elite} PR</b> y estar entre los <b>${N(PVP_VAGAS_CHALLENGER, c.lang)} primeros</b>`
          : `<b>${elite} PR</b> and being in the <b>top ${N(PVP_VAGAS_CHALLENGER, c.lang)}</b>`;
    }
    if (t.id === 'mestre') {
      const de = N(PVP_VAGAS_CHALLENGER + 1, c.lang);
      const ate = N(PVP_VAGAS_MESTRE, c.lang);
      return c.lang === 'pt'
        ? `<b>${elite} PR</b> e ficar entre <b>${de}º e ${ate}º</b>`
        : c.lang === 'es'
          ? `<b>${elite} PR</b> y quedar entre <b>${de}º y ${ate}º</b>`
          : `<b>${elite} PR</b> and placing <b>${de}th to ${ate}th</b>`;
    }
    const ate = t.de + t.divisoes * PVP_PONTOS_POR_DIVISAO - 1;
    return `${N(t.de, c.lang)} – ${N(ate, c.lang)} PR`;
  };

  const linhas = PVP_TIERS.map((t) => {
    const eliteTier = t.id === 'mestre' || t.id === 'challenger';
    return `<tr>
      <td><b${eliteTier ? ' class="wk-num destaque"' : ''}>${esc(nomes[t.id] ?? t.id)}</b></td>
      <td>${comoEntra(t)}</td>
      <td>${eliteTier ? '—' : 'I · II · III'}</td>
    </tr>`;
  }).join('');

  return tabela([r.rank, r.comoEntra, r.divisoes], linhas);
}

// ------------------------------------------------------------ Casa e XP Share
//
// Tudo daqui sai de `estado.casas`, que o servidor monta em `sim.mjs` a partir das MESMAS
// constantes que ele usa para sortear e para creditar XP. Os `??` são a rede de baixo para o
// caso de o manual abrir antes de o welcome chegar — nunca a fonte.

const cfgCasas = (c) => c.d.casas ?? {};
const raridadesDeCasa = (c) => cfgCasas(c).raridades ?? [];
const cfgFrag = (c) => cfgCasas(c).fragmento ?? {};
const custoFragCasa = (c) => cfgFrag(c).custo ?? 10;
const chanceFragChave = (c) => cfgFrag(c).chanceDrop ?? 0.000005;
const pctFragChave = (c) => P(chanceFragChave(c), c.lang);
const mediaFragChave = (c) => N(Math.round(1 / chanceFragChave(c)), c.lang);
/** Quantas casas valem ao mesmo tempo — ter mais não tem teto, usar tem. */
const maxCasasEmUso = (c) => cfgCasas(c).maxEmUso ?? 5;
/**
 * A fatia de XP Share de uma raridade, redonda.
 *
 * O `P` geral daqui abre uma casa decimal (é feito para chance de drop, onde 0,005% importa) e
 * escreveria "75,0%" numa coluna cujos cinco valores são 25, 40, 75, 100 e 100. Número redondo
 * é o que faz a escada ser lida de relance.
 */
const PCT_CASA = (v) => `${Math.round((v ?? 0) * 100)}%`;

/**
 * A porcentagem do item Exp. Share (held), inteira.
 *
 * Sai do `welcome` (`xpShareHeld.pct`, que o servidor calcula de `XP_SHARE_HELD_PCT`) pelo mesmo
 * motivo das casas: se alguém balancear o item, o manual acompanha sem ninguém lembrar de vir
 * aqui. O `?? 5` é só a rede para o manual aberto antes do welcome chegar.
 */
const pctXpShareHeld = (c) => Math.round(c.d.xpShareHeld?.pct ?? 5);

const cfgPedra = (c) => c.d.shinyStone ?? {};
const custoFragPedra = (c) => cfgPedra(c).custo ?? 10;
const chanceFragPedra = (c) => cfgPedra(c).chanceDrop ?? 0.000005;
const pctFragPedra = (c) => P(chanceFragPedra(c), c.lang);
const mediaFragPedra = (c) => N(Math.round(1 / chanceFragPedra(c)), c.lang);

const ROTULO_CASA = {
  pt: { casa: 'Casa', xp: 'XP Share', bonecos: 'Pokémon', chance: 'Chance no sorteio' },
  en: { casa: 'House', xp: 'XP Share', bonecos: 'Pokémon', chance: 'Roll chance' },
  es: { casa: 'Casa', xp: 'XP Share', bonecos: 'Pokémon', chance: 'Probabilidad' },
};

/**
 * O NOME de cada raridade por língua.
 *
 * O servidor manda `rotulo`, mas ele é em português (é o rótulo do editor de casas) — usá-lo
 * direto punha "Comum / Mítica / Lendária" na tabela de quem joga em inglês, no meio de um
 * capítulo traduzido. Os cinco ids são fechados e não crescem, então a tradução mora aqui, do
 * mesmo jeito que o resto do vocabulário desta tela.
 */
const NOME_RARIDADE = {
  comum: { pt: 'Comum', en: 'Common', es: 'Común' },
  incomum: { pt: 'Incomum', en: 'Uncommon', es: 'Poco común' },
  rara: { pt: 'Rara', en: 'Rare', es: 'Rara' },
  mitica: { pt: 'Mítica', en: 'Mythic', es: 'Mítica' },
  lendaria: { pt: 'Lendária', en: 'Legendary', es: 'Legendaria' },
};

/**
 * As receitas do CRAFT de casas e bicicletas — `CRAFT_CASA` de `shared/casas.mjs`, a mesma tabela
 * que a bancada usa (a bicicleta reaproveita a da casa): "5× Comum → 1× Incomum · 5× Incomum → 1× Rara".
 */
const receitasCraft = (c) => Object.entries(CRAFT_CASA)
  .map(([de, para]) => `<b>${CUSTO_CRAFT_CASA}× ${NOME_RARIDADE[de]?.[c.lang] ?? de} → 1× ${NOME_RARIDADE[para]?.[c.lang] ?? para}</b>`)
  .join(' · ');

/** A raridade mais alta que o craft alcança (a última receita). */
const topoDoCraft = (c) => NOME_RARIDADE[Object.values(CRAFT_CASA).at(-1)]?.[c.lang] ?? '';

/** As cinco raridades: a fatia do XP Share, quantos postos e a chance de sair no sorteio. */
function tabelaDeCasas(c) {
  const r = ROTULO_CASA[c.lang] ?? ROTULO_CASA.pt;
  const lista = raridadesDeCasa(c);
  const total = lista.reduce((s, x) => s + x.peso, 0) || 1;
  const linhas = lista.map((x) => `
    <tr>
      <td><b>${NOME_RARIDADE[x.id]?.[c.lang] ?? x.rotulo}</b></td>
      <td>${PCT_CASA(x.xpShare)}</td>
      <td>${N(x.bonecos, c.lang)}</td>
      <td>${P(x.peso / total, c.lang)}</td>
    </tr>`).join('');
  return tabela([r.casa, r.xp, r.bonecos, r.chance], linhas);
}

// ------------------------------------------------------------ Bicicletas
//
// Como a Casa: nenhum número escrito à mão. Velocidade, pesos do sorteio, custo e chance do
// fragmento vêm de `estado.bicicletas` (welcome); a espera da troca, do snapshot do jogador.

const cfgBikes = (c) => c.d.bicicletas ?? {};
const raridadesDeBike = (c) => cfgBikes(c).raridades ?? [];
const custoFragBike = (c) => cfgBikes(c).fragmento?.custo ?? 10;
const chanceFragBike = (c) => cfgBikes(c).fragmento?.chanceDrop ?? 0.000005;
const minTrocaBike = (c) => Math.round((c.d.eu?.bicicleta?.intervaloTrocaMs ?? 300_000) / 60_000);
/** A velocidade a mais da i-ésima raridade, em pontos percentuais (0 se o welcome não chegou). */
const pctBike = (c, i) => Math.round((raridadesDeBike(c)[i]?.velocidade ?? 0) * 100);

const ROTULO_BIKE = {
  pt: { bike: 'Bicicleta', velocidade: 'Velocidade', passo: 'Tempo de cada passo', chance: 'Chance no sorteio' },
  en: { bike: 'Bicycle', velocidade: 'Speed', passo: 'Time per step', chance: 'Roll chance' },
  es: { bike: 'Bicicleta', velocidade: 'Velocidad', passo: 'Tiempo de cada paso', chance: 'Probabilidad en el sorteo' },
};

/**
 * As cinco bicicletas: quanto a mais de velocidade, quanto dura o passo comparado a andar a pé e a
 * chance de sair. O passo DIVIDE pelo fator (`fatorPassoDaRaridade`), então +100% é passo pela
 * metade — e não "passo zero", que é o que a porcentagem sozinha faria alguém imaginar.
 */
function tabelaDeBicicletas(c) {
  const r = ROTULO_BIKE[c.lang] ?? ROTULO_BIKE.pt;
  const lista = raridadesDeBike(c);
  const total = lista.reduce((s, x) => s + x.peso, 0) || 1;
  const linhas = lista.map((x) => `
    <tr>
      <td><b>${NOME_RARIDADE[x.id]?.[c.lang] ?? esc(x.rotulo)}</b></td>
      <td class="wk-num">+${Math.round(x.velocidade * 100)}%</td>
      <td class="wk-num">${Math.round(100 / (1 + x.velocidade))}%</td>
      <td class="wk-num">${P(x.peso / total, c.lang)}</td>
    </tr>`).join('');
  return tabela([r.bike, r.velocidade, r.passo, r.chance], linhas);
}

/**
 * Uma tabela com cabeçalho e linhas já em HTML, dentro do seu próprio vão de rolagem.
 *
 * O `.wk-rolar` não é enfeite. A `.wk-tabela` tem `overflow: hidden` (é o que arredonda os
 * cantos), então uma tabela mais larga que a tela era CORTADA — a coluna da direita ficava
 * ilegível e inalcançável, sem rolagem que chegasse nela. Foi o que aconteceu no celular
 * quando a tabela das pokébolas ganhou a quarta coluna: o Preço sumia pela beirada.
 *
 * Com o vão, a tabela larga rola por dentro (o mesmo que a `.wk-formula` já fazia com as
 * fórmulas longas) e a página nunca anda de lado.
 */
const tabela = (cabecalho, linhas, classe = '') => `
  <div class="wk-rolar">
    <table class="wk-tabela ${classe}">
      <thead><tr>${cabecalho.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  </div>`;

/** Caixa de destaque — o "preste atenção nisto" de cada capítulo. */
const nota = (texto, tipo = '') => `<div class="wk-nota ${tipo}">${texto}</div>`;

/**
 * "0,25%" — a chance escrita SEM arredondar para cima.
 *
 * Duas casas e sem zero à direita, a mesma regra da ficha do boss. Uma casa só mostrava o
 * fragmento de mega shiny (0,25%) como "0,3%", e este manual é justamente onde o jogador vai
 * comparar 0,25% com 0,50% antes de decidir o que farmar.
 */
const pctMega = (v) => `${((v ?? 0) * 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')}%`;

/**
 * As dez faixas de cor da nota da calculadora, de 0–1 a 9–10.
 *
 * Os limites saem de `FAIXAS_NOTA`; quem cai bem no limite fica na faixa de baixo, como em
 * `faixaDaNota`. Os nomes repetem `calc.faixa.*` do i18n — o `t()` só fala a língua atual e a
 * Pokepédia monta as três — e a cor descreve o `.calc-nota.<faixa>` do estilo.css, que também
 * pinta o nome aqui (`.wk-faixa-nota`).
 */
const FAIXA_NOTA_DOC = {
  'extremamente-fraco': { pt: ['Extremamente Fraco', 'cinza'], en: ['Extremely Weak', 'gray'], es: ['Extremadamente Débil', 'gris'] },
  fraco: { pt: ['Fraco', 'vermelho'], en: ['Weak', 'red'], es: ['Débil', 'rojo'] },
  mediano: { pt: ['Mediano', 'laranja'], en: ['Average', 'orange'], es: ['Medio', 'naranja'] },
  razoavel: { pt: ['Razoável', 'verde'], en: ['Fair', 'green'], es: ['Razonable', 'verde'] },
  bom: { pt: ['Bom', 'verde-claro'], en: ['Good', 'light green'], es: ['Bueno', 'verde claro'] },
  forte: { pt: ['Forte', 'verde vibrante, brilho pulsando'], en: ['Strong', 'bright green, pulsing glow'], es: ['Fuerte', 'verde vibrante, brillo que late'] },
  poderoso: { pt: ['Poderoso', 'lilás, brilho leve'], en: ['Powerful', 'lilac, soft glow'], es: ['Poderoso', 'lila, brillo suave'] },
  mitico: { pt: ['Mítico', 'roxo reluzente, moldura pulsando'], en: ['Mythic', 'glowing purple, pulsing frame'], es: ['Mítico', 'morado brillante, marco que late'] },
  legendario: { pt: ['Lendário', 'rosa-claro, com brilho'], en: ['Legendary', 'light pink, glowing'], es: ['Legendario', 'rosa claro, con brillo'] },
  divino: { pt: ['Divino', 'rosa reluzente, moldura pulsando'], en: ['Divine', 'glowing pink, pulsing frame'], es: ['Divino', 'rosa brillante, marco que late'] },
};

function tabelaDeFaixasDaNota(lang) {
  const cabecalho = { pt: ['Nota', 'Faixa', 'Cor'], en: ['Score', 'Tier', 'Color'], es: ['Nota', 'Rango', 'Color'] }[lang];
  const linhas = FAIXAS_NOTA.map((f, i) => {
    const [nome, cor] = FAIXA_NOTA_DOC[f.id]?.[lang] ?? [f.id, ''];
    return `<tr>
        <td class="wk-num">${i ? FAIXAS_NOTA[i - 1].ate : 0}–${f.ate}</td>
        <td><b class="wk-faixa-nota ${f.id}">${nome}</b></td>
        <td class="wk-desc">${cor}</td>
      </tr>`;
  }).join('');
  return tabela(cabecalho, linhas);
}

/** A curva de XP do jogo (`xpTotalParaNivel`, em content.mjs). Não trafega — é fórmula. */
const xpAcumulado = (L) => (L <= 1 ? 0 : Math.round((50 / 3) * (L ** 3 - 6 * L ** 2 + 17 * L - 12)));

/** Degraus de nível do treinador no Mapa — espelha `REGIOES_MAPA` em app.js. */
const REGIOES_MAPA_DOC = [
  { rotulo: { pt: 'Kanto', en: 'Kanto', es: 'Kanto' }, nivel: 1 },
  { rotulo: { pt: 'Johto', en: 'Johto', es: 'Johto' }, nivel: 1 },
  { rotulo: { pt: 'Outland', en: 'Outland', es: 'Outland' }, nivel: 150 },
  { rotulo: { pt: 'Hoenn', en: 'Hoenn', es: 'Hoenn' }, nivel: 500 },
  { rotulo: { pt: 'Sinnoh', en: 'Sinnoh', es: 'Sinnoh' }, nivel: 1000 },
  { rotulo: { pt: 'Unova', en: 'Unova', es: 'Unova' }, nivel: 5000 },
  { rotulo: { pt: 'Kalos', en: 'Kalos', es: 'Kalos' }, nivel: 10000 },
  { rotulo: { pt: 'Alola', en: 'Alola', es: 'Alola' }, nivel: 25000 },
];

function tabelaDeRegioes(c) {
  const linhas = REGIOES_MAPA_DOC.map(
    (r) => `<tr>
      <td>${esc(r.rotulo[c.lang] ?? r.rotulo.pt)}</td>
      <td class="wk-num">${N(r.nivel, c.lang)}</td>
    </tr>`,
  ).join('');
  return tabela([c.r.regiao ?? 'Região', c.r.nivelTreinador ?? 'Nv treinador'], linhas);
}

// -------------------------------------------------------- blocos dinâmicos
//
// Cada um monta uma tabela a partir do que o servidor mandou. O `c` é o contexto: `c.d` são
// os dados do welcome, `c.r` são os rótulos da língua e `c.lang` é o código dela.

/** Espelho de `chanceDeCaptura` no app.js — corpo caído (hpFrac = 0). */
function chanceCapturaWiki(c, precoNpc, catchRate) {
  const cap = c.d.captura ?? { base: 0.0075, piso: 0.003, teto: 0.1, raridadeDiv: 17, precoSemPreco: 6.5e9 };
  if (catchRate >= 255) return 1;
  const preco = precoNpc > 0 ? precoNpc : cap.precoSemPreco;
  const raridade = Math.log10(Math.max(100, preco)) - 1;
  const fator = 1 + raridade ** 3 / (cap.raridadeDiv ?? 17);
  return Math.max(cap.piso, Math.min(cap.teto, cap.base * (catchRate / fator) * 1.4));
}

/** Referência da espécie mais comum (raridade 1) — `max(100, priceNpc)` no servidor. */
const PRECO_CAPTURA_FACIL = 100;
/** Raridade mediana citada no balanceamento (`sim.mjs`). */
const PRECO_CAPTURA_MEDIANO = 10 ** (3.04 + 1);

function tabelaDeBolas(c) {
  const linhas = (c.d.catalogoBolas ?? [])
    .map(
      (b) => `<tr>
        <td>${esc(b.nome)}</td>
        <td class="wk-num">×${b.catchRate}</td>
        <td class="wk-num">${P(chanceCapturaWiki(c, PRECO_CAPTURA_FACIL, b.catchRate), c.lang)}</td>
        <td class="wk-num">${b.compravel && b.priceGold ? `${N(b.priceGold, c.lang)} ${c.r.ouro}` : `<em>${c.r.naoComprava}</em>`}</td>
      </tr>`,
    )
    .join('');
  return `${tabela([c.r.bola, c.r.eficiencia, c.r.chanceCorpo, c.r.preco], linhas)}
  <p class="wk-nota">${c.lang === 'en'
    ? 'Catch % is on a fainted body, for the easiest tier (rarity 1). Each species sheet in the Pokédex shows the exact table for that pokémon — the Beast Ball is always <b>2×</b> the Ultra Ball.'
    : c.lang === 'es'
      ? 'La chance es con el cuerpo derrotado, para el tier más fácil (rareza 1). Cada ficha de especie en la Pokédex muestra la tabla exacta — la Beast Ball siempre es <b>2×</b> la Ultra Ball.'
      : 'A chance é no corpo caído, para o tier mais fácil (raridade 1). Cada ficha de espécie na Pokédex mostra a tabela exata — a Beast Ball é sempre <b>2×</b> a Ultra Ball.'}</p>`;
}

function tabelaDePotencia(c) {
  const linhas = (c.d.potencias ?? [])
    .map(
      (p) => `<tr>
        <td class="wk-pot p${p.n}">P${p.n}</td>
        <td class="wk-num">${P(p.chance / 100, c.lang)}</td>
        <td class="wk-num">${p.bonus ? `+${Math.round(p.bonus * 100)}%` : '—'}</td>
      </tr>`,
    )
    .join('');
  return tabela([c.r.tier, c.r.chance, c.r.bonus], linhas);
}

function tabelaDeShiny(c) {
  const ch = Number(c.d.chanceShiny ?? 0);
  const n = Object.keys(c.d.shinyLooks ?? {}).length;
  return `<table class="wk-tabela">
    <thead><tr><th>${c.r.porTentativa}</th><th>${c.r.comIsca}</th></tr></thead>
    <tbody><tr>
        <td class="wk-num">${umEm(ch)}</td>
        <td class="wk-num">${umEm(Math.min(1, ch * 2))}</td>
    </tr></tbody>
  </table>
  <p class="wk-nota">${N(n, c.lang)} ${c.r.especies.toLowerCase()} ${c.lang === 'en' ? 'with a shiny form' : c.lang === 'es' ? 'con forma shiny' : 'com forma shiny'}.</p>`;
}

/**
 * Os três multiplicadores de nascimento juntos — potência × shiny × lendário, a mesma conta de
 * `multDeNascenca` (content.mjs). Uma linha por potência e uma coluna por combinação; a célula do teto
 * (lendário shiny P5) vai em destaque. Tudo sai da tabela de potência do `welcome`, do ×3 do shiny e
 * do ×4 do lendário (`MULT_LENDARIO_STATS`) — nenhum número digitado.
 */
function tabelaMultiplicadores(c) {
  const sh = Number(c.d.multShinyStats ?? 3);
  const combos = [[1, 1], [sh, 1], [1, MULT_LENDARIO_STATS], [sh, MULT_LENDARIO_STATS]];
  const pots = c.d.potencias ?? [];
  const topo = pots.at(-1)?.n;
  const linhas = pots
    .map((p) => `<tr>
        <td class="wk-pot p${p.n}">P${p.n}</td>
        ${combos.map(([s, l], i) => `<td class="wk-num${p.n === topo && i === combos.length - 1 ? ' destaque' : ''}">×${D((1 + p.bonus) * s * l, c.lang)}</td>`).join('')}
      </tr>`)
    .join('');
  const cab = {
    pt: ['Potência', 'Comum', 'Shiny', 'Lendário', 'Lendário shiny'],
    en: ['Potency', 'Regular', 'Shiny', 'Legendary', 'Shiny legendary'],
    es: ['Potencia', 'Común', 'Shiny', 'Legendario', 'Legendario shiny'],
  }[c.lang];
  return tabela(cab, linhas);
}

/**
 * A roleta de potência do lendário da Arena Mística: a de sempre, com o piso — o que sairia abaixo
 * de `MISTICO_POTENCIA_MIN` vira ele (`rolarLendarioMistico` no content.mjs), então a chance do piso
 * é a soma das de baixo. Ao lado, o multiplicador que cada degrau dá ao lendário, comum e shiny.
 */
function tabelaPotenciaMistica(c) {
  const sh = Number(c.d.multShinyStats ?? 3);
  const pots = c.d.potencias ?? [];
  const linhas = pots
    .filter((p) => p.n >= MISTICO_POTENCIA_MIN)
    .map((p) => {
      const chance = p.n === MISTICO_POTENCIA_MIN
        ? pots.filter((q) => q.n <= p.n).reduce((s, q) => s + q.chance, 0)
        : p.chance;
      return `<tr>
        <td class="wk-pot p${p.n}">P${p.n}</td>
        <td class="wk-num">${P(chance / 100, c.lang)}</td>
        <td class="wk-num">×${D((1 + p.bonus) * MULT_LENDARIO_STATS, c.lang)}</td>
        <td class="wk-num">×${D((1 + p.bonus) * sh * MULT_LENDARIO_STATS, c.lang)}</td>
      </tr>`;
    })
    .join('');
  const cab = {
    pt: ['Potência', 'Chance na arena', 'Lendário', 'Lendário shiny'],
    en: ['Potency', 'Chance in the arena', 'Legendary', 'Shiny legendary'],
    es: ['Potencia', 'Chance en la arena', 'Legendario', 'Legendario shiny'],
  }[c.lang];
  return tabela(cab, linhas);
}

/**
 * Os lendários e míticos que a Arena Mística sorteia, pelo nome e na ordem da Pokédex, com os míticos
 * à parte (`ehMitico`). O sorteio é o do SERVIDOR (`misticoPool` no welcome — no app ele vira um Set,
 * por isso o espalhamento) e os nomes vêm do catálogo (`c.d.especies`); espécie que o catálogo ainda
 * não trouxe fica de fora. Sem sorteio (Wiki aberta antes do login), não desenha nada.
 */
function listaDoSorteioMistico(c) {
  const esps = [...(c.d.misticoPool ?? [])]
    .map((id) => ({ id: Number(id), e: c.d.especies?.get?.(Number(id)) }))
    .filter((x) => x.e)
    .sort((a, b) => a.id - b.id);
  if (!esps.length) return '';
  const lend = esps.filter((x) => !ehMitico(x.id));
  const mit = esps.filter((x) => ehMitico(x.id));
  const nomes = (lista) => lista.map((x) => escaparHtml(x.e.name)).join(', ');
  const rot = {
    pt: ['Lendários', 'Míticos', 'no sorteio da Arena Mística'],
    en: ['Legendaries', 'Mythicals', 'in the Mystic Arena draw'],
    es: ['Legendarios', 'Míticos', 'en el sorteo de la Arena Mística'],
  }[c.lang];
  return nota(`<b>${N(esps.length, c.lang)} ${rot[2]}.</b><br>
    <b>${rot[0]} (${N(lend.length, c.lang)}):</b> ${nomes(lend)}.<br>
    <b>${rot[1]} (${N(mit.length, c.lang)}):</b> ${nomes(mit)}.`);
}

/**
 * A grade 18×18 de efetividade.
 *
 * Duas leituras na mesma célula: o número BASE (o da série) e, no `title`, o valor já
 * amplificado da hunt. A amplificação é a coisa mais específica deste jogo e a que mais
 * muda uma luta — ×2 vira ×2,5 e ×0,5 vira ×0,33 —, então ela não pode ficar só no texto.
 *
 * Cada célula sai da MESMA conta do combate (`multAtaqueContraDefesa`), inclusive a diagonal, que o
 * espelho não traz: Fogo contra Fogo ×0,5, Fantasma contra Fantasma ×2. Até 14/10/2026 a grade
 * desenhava a diagonal inteira como neutra, e o jogo não fazia isso.
 */
function gradeDeTipos(c) {
  const tab = c.d.tabelaTipos ?? {};
  const amp = c.d.ampliacaoHunt ?? 1.5;
  const curto = c.lang === 'pt' || c.lang === 'es' ? CURTO : CURTO_EN;
  const naHunt = (v) => (v === 0 || v === 1 ? v : v > 1 ? 1 + (v - 1) * amp : v / amp);
  const classe = (v) => (v === 0 ? 'z' : v > 1 ? 'b' : v < 1 ? 'm' : '');
  const mostra = (v) => (v === 0 ? '0' : v === 1 ? '' : String(v).replace('.', ','));

  const cab = `<tr><th class="wk-canto">${c.r.atacante}</th>${T.map(
    (d) => `<th class="wk-col tipo ${d}">${curto[d]}</th>`,
  ).join('')}</tr>`;

  const corpo = T.map((a) => {
    const celulas = T.map((d) => {
      const v = multAtaqueContraDefesa(a, d, tab[a] ?? {});
      return `<td class="wk-ef ${classe(v)}" title="${curto[a]}→${curto[d]}: ${c.r.base} ×${mostra(v) || 1} · ${c.r.naHunt} ×${String(+naHunt(v).toFixed(2)).replace('.', ',')}">${mostra(v)}</td>`;
    }).join('');
    return `<tr><th class="wk-lin tipo ${a}">${curto[a]}</th>${celulas}</tr>`;
  }).join('');

  return `<div class="wk-rolagem"><table class="wk-tipos">${cab}${corpo}</table></div>`;
}

function tabelaDeAmplificacao(c) {
  const amp = c.d.ampliacaoHunt ?? 1.5;
  const naHunt = (v) => (v === 0 || v === 1 ? v : v > 1 ? 1 + (v - 1) * amp : v / amp);
  const linhas = [0, 0.25, 0.5, 1, 2, 4]
    .map(
      (v) => `<tr>
        <td class="wk-num">×${String(v).replace('.', ',')}</td>
        <td class="wk-num destaque">×${String(+naHunt(v).toFixed(3)).replace('.', ',')}</td>
      </tr>`,
    )
    .join('');
  return tabela([c.r.base, c.r.naHunt], linhas);
}

function tabelaDeQualidade(c) {
  // As bandas são as do catálogo (`formulas.qualidade.bandas`), e o rótulo sai da mesma régua
  // que o jogo usa. Não trafegam para o cliente, mas são CONSTANTES do conteúdo — a fonte
  // está em public/data/index/formulas.json e em MECANICAS.md §3.
  const bandas = [
    [0.8, 0.9, 5], [0.9, 1.0, 5], [1.0, 1.1, 34.03846], [1.1, 1.2, 20], [1.2, 1.3, 10],
    [1.3, 1.4, 10], [1.4, 1.5, 10], [1.5, 1.6, 5], [1.7, 1.8, 0.67308], [1.8, 1.8, 0.28846],
  ];
  const rotulo = (q) =>
    q >= 1.7 ? 'Lendária' : q >= 1.5 ? 'Épica' : q >= 1.3 ? 'Rara' : q >= 1.1 ? 'Incomum' : q >= 1 ? 'Comum' : 'Fraca';
  const rotuloEn = { Fraca: 'Weak', Comum: 'Common', Incomum: 'Uncommon', Rara: 'Rare', Épica: 'Epic', Lendária: 'Legendary' };
  const rotuloEs = { Fraca: 'Débil', Comum: 'Común', Incomum: 'Poco común', Rara: 'Rara', Épica: 'Épica', Lendária: 'Legendaria' };

  const linhas = bandas
    .map(([min, max, ch]) => {
      const r = rotulo(min);
      const nome = c.lang === 'en' ? rotuloEn[r] : c.lang === 'es' ? rotuloEs[r] : r;
      const faixa = min === max ? String(min).replace('.', ',') : `${String(min).replace('.', ',')} – ${String(max).replace('.', ',')}`;
      return `<tr><td>${faixa}</td><td class="wk-num">${P(ch / 100, c.lang)}</td><td>${nome}</td></tr>`;
    })
    .join('');
  return tabela([c.r.qualidade, c.r.chance, c.r.rotulo], linhas);
}

/**
 * A curva do refino: degrau a degrau e acumulado.
 *
 * Os números saem da MESMA conta do servidor (`custoBase` chega no welcome), então a tabela
 * não pode envelhecer sozinha se o balanceamento mudar — que é o defeito que uma tabela
 * escrita à mão num manual sempre acaba tendo.
 */
function tabelaDeRefino(c) {
  const base = c.d.refino?.custoBase ?? 500;
  const degrau = (n) => base * (3 * n * n - 3 * n + 1);
  const total = (n) => base * n ** 3;
  const rot = {
    pt: ['Grau', 'Custo do degrau', 'Total investido'],
    en: ['Step', 'Step cost', 'Total invested'],
    es: ['Escalón', 'Costo del escalón', 'Total invertido'],
  }[c.lang] ?? ['Grau', 'Custo do degrau', 'Total investido'];
  const linhas = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20]
    .map((n) => `<tr><td>+${n}</td><td class="wk-num">${N(degrau(n), c.lang)}</td><td class="wk-num destaque">${N(total(n), c.lang)}</td></tr>`)
    .join('');
  return tabela(rot, linhas);
}

function tabelaDeXp(c) {
  const marcos = [10, 25, 50, 100, 200, 300, 500, 1000, 5000, 10000, 25000, 50000, 100000];
  const linhas = marcos
    .map(
      (L) => `<tr>
        <td class="wk-num">${N(L, c.lang)}</td>
        <td class="wk-num">${N(xpAcumulado(L), c.lang)}</td>
        <td class="wk-num">${N(xpAcumulado(L) - xpAcumulado(L - 1), c.lang)}</td>
      </tr>`,
    )
    .join('');
  return tabela([c.r.nivel, c.r.xpTotal, c.r.custoNivel], linhas);
}

/**
 * A pedra de cada tipo, e o item assinatura que sempre cai junto.
 *
 * Escrita à mão, e não lida do `welcome`, porque é regra de jogo estável: o mapa tipo→pedra
 * mora em `shared/pedras-evolucao.mjs` e a assinatura sai da medição de Kanto/Johto que o
 * gerador de drops usa. Se um dia isso trafegar, troca-se a fonte sem mexer no texto.
 */
const PEDRA_POR_TIPO_DOC = [
  ['NORMAL', 'Sun Stone', 'Rubber Ball'],
  ['FIRE', 'Fire Stone', 'Essence of Fire'],
  ['WATER', 'Water Stone', 'Water Gem'],
  ['GRASS', 'Leaf Stone', 'Seed'],
  ['ELECTRIC', 'Thunder Stone', 'Screw'],
  ['ICE', 'Ice Stone', 'Snowball'],
  ['FIGHTING', 'Punch Stone', 'Band Aid'],
  ['POISON', 'Venom Stone', 'Bottles of Poison'],
  ['GROUND', 'Earth Stone', 'Earth Ball'],
  ['FLYING', 'Feather Stone', '—'],
  ['PSYCHIC', 'Enigma Stone', 'Enchanted Gem'],
  ['BUG', 'Cocoon Stone', 'Bug Gosme'],
  ['ROCK', 'Rock Stone', 'Small Stone'],
  ['GHOST', 'Darkness Stone', 'Ghost Essence'],
  ['DRAGON', 'Ancient Stone', 'Dragon Scale'],
  ['DARK', 'Darkness Stone', 'Dark Gem'],
  ['STEEL', 'Metal Stone', 'Piece of Steel'],
  ['FAIRY', 'Heart Stone', 'Rubber Ball'],
];

/** tipo → pedra → item assinatura, a régua dos drops. */
function tabelaDePedras(c) {
  const linhas = PEDRA_POR_TIPO_DOC.map(
    ([tipo, pedra, item]) => `<tr>
      <td><b>${tipo}</b></td>
      <td>${esc(pedra)}</td>
      <td>${esc(item)}</td>
    </tr>`,
  ).join('');
  return tabela([c.r.tipo, c.r.pedra, c.r.assinatura], linhas);
}

/**
 * A escada do PRÊMIO DO MÊS do Ranking, da MESMA tabela com que o servidor paga
 * (`shared/ranking-mensal.mjs`): uma linha por faixa, e o selo do chat na do 1º.
 */
function tabelaPremioMensal(c) {
  const txt = {
    pt: { pos: 'Posição', premio: 'Prêmio', selo: 'selo no chat' },
    en: { pos: 'Place', premio: 'Prize', selo: 'chat badge' },
    es: { pos: 'Puesto', premio: 'Premio', selo: 'insignia en el chat' },
  }[c.lang] ?? { pos: 'Posição', premio: 'Prêmio', selo: 'selo no chat' };
  let de = 1;
  const linhas = FAIXAS_RANKING_MENSAL.map((f) => {
    const rotulo = f.ate === de ? `${de}º` : `${de}º–${f.ate}º`;
    de = f.ate + 1;
    return `<tr><td>${rotulo}</td><td>${N(f.diamantes, c.lang)} 💎${f.selo ? ` + ${txt.selo}` : ''}</td></tr>`;
  }).join('');
  return tabela([txt.pos, txt.premio], linhas);
}

/**
 * A escada do prêmio SEMANAL do Top Catch, da mesma tabela com que o servidor paga na virada
 * (`shared/top-catch.mjs`). É o molde da `tabelaPremioMensal`, com o selo dito pelo nome: o da
 * Poké Ball é o único que vai com o 1º desta escada.
 */
function tabelaPremioTopCatch(c) {
  const txt = {
    pt: { pos: 'Posição', premio: 'Prêmio', selo: 'selo da Poké Ball no chat' },
    en: { pos: 'Place', premio: 'Prize', selo: 'Poké Ball badge in chat' },
    es: { pos: 'Puesto', premio: 'Premio', selo: 'insignia de la Poké Ball en el chat' },
  }[c.lang] ?? { pos: 'Posição', premio: 'Prêmio', selo: 'selo da Poké Ball no chat' };
  let de = 1;
  const linhas = FAIXAS_TOP_CATCH.map((f) => {
    const rotulo = f.ate === de ? `${de}º` : `${de}º–${f.ate}º`;
    de = f.ate + 1;
    return `<tr><td>${rotulo}</td><td>${N(f.diamantes, c.lang)} 💎${f.selo ? ` + ${txt.selo}` : ''}</td></tr>`;
  }).join('');
  return tabela([txt.pos, txt.premio], linhas);
}

/** Os boosts da loja: um por TIPO, com as oito durações em colunas de preço. */
function tabelaDeBoosts(c) {
  const produtos = (c.d.lojaProdutos ?? []).filter((p) => p.cat === 'boosts');
  if (!produtos.length) return '';
  // Agrupa por nome sem a duração: "XP Boost (2h)" → "XP Boost".
  const grupos = new Map();
  for (const p of produtos) {
    const nome = p.nome.replace(/\s*\(.*\)$/, '');
    const dur = /\(([^)]+)\)$/.exec(p.nome)?.[1] ?? '';
    if (!grupos.has(nome)) grupos.set(nome, { nome, precos: new Map() });
    grupos.get(nome).precos.set(dur, p.preco);
  }
  const duracoes = [...new Set(produtos.map((p) => /\(([^)]+)\)$/.exec(p.nome)?.[1] ?? ''))];

  // A linha de baixo é o MULTIPLICADOR, não a descrição do produto.
  //
  // A descrição vem do catálogo da loja, que é escrito em português e não passa pelo i18n —
  // numa tabela em inglês ela aparecia como "+50% de XP do TREINADOR por 1 hora" no meio das
  // colunas traduzidas. "×1,5" diz a mesma coisa, é exato, e não tem língua. O nome do efeito
  // ("Loot Boost") já é um nome próprio nas três.
  const multDe = (nome) => (c.d.tiposBoost ?? []).find((b) => b.nome === nome)?.mult ?? null;

  const linhas = [...grupos.values()]
    .map((g) => {
      const m = multDe(g.nome);
      const sub = m ? `<em class="wk-sub">×${String(m).replace('.', c.lang === 'en' ? '.' : ',')}</em>` : '';
      return `<tr>
        <td>${esc(g.nome)}${sub}</td>
        ${duracoes.map((d) => `<td class="wk-num">${g.precos.has(d) ? N(g.precos.get(d), c.lang) : '—'}</td>`).join('')}
      </tr>`;
    })
    .join('');
  return tabela([c.r.efeito, ...duracoes.map((d) => `${d} ${c.r.diamantes}`)], linhas, 'wk-larga');
}

/** Os bosses desafiáveis: entrada, nível e o que cai. */
function tabelaDeBosses(c) {
  const linhas = (c.d.bossesJogaveis ?? [])
    .map((b) => {
      const drops = b.drops
        .map((d) => `${esc(d.nome)}${d.chance ? ` (${P(d.chance, c.lang)})` : d.qtd ? ` ×${d.qtd[0]}–${d.qtd[1]}` : ''}`)
        .join(' · ');
      return `<tr>
        <td>${esc(b.nome)}</td>
        <td class="wk-num">${N(b.level, c.lang)}</td>
        <td class="wk-num">${N(b.teamLevel, c.lang)}</td>
        <td class="wk-desc">${drops}</td>
      </tr>`;
    })
    .join('');
  return tabela(
    [c.lang === 'pt' ? 'Boss' : 'Boss', c.r.nivel, c.lang === 'pt' ? 'Nível de equipe' : c.lang === 'es' ? 'Nivel de equipo' : 'Team level', 'Drops'],
    linhas,
  );
}

/**
 * De onde vem uma peça de TM: quantos bosses a soltam e a faixa de chance, lidos da mesma tabela
 * de drops (`bossesJogaveis`) com que o servidor sorteia. Antes do welcome, `null`.
 */
function fontesDaPeca(c, itemId) {
  const chances = (c.d.bossesJogaveis ?? []).flatMap((b) =>
    (b.drops ?? []).filter((d) => d.itemId === itemId && d.chance).map((d) => d.chance));
  if (!chances.length) return null;
  const min = Math.min(...chances);
  const max = Math.max(...chances);
  return { bosses: chances.length, faixa: min === max ? P(min, c.lang) : `${P(min, c.lang)}–${P(max, c.lang)}` };
}

/** "13 bosses (0,50%–6,50%)" — a coluna "Vem de" da tabela de peças. */
const origemDaPeca = (c, itemId) => {
  const f = fontesDaPeca(c, itemId);
  return f ? `${N(f.bosses, c.lang)} bosses (${f.faixa})` : '—';
};
const idPecaElemental = (c) => c.d.tmResearcher?.pieceElemental ?? 59194;
const idPecaAoe = (c) => c.d.tmResearcher?.pieceAoe ?? 40530;
const pecasPorDisco = (c) => N(c.d.tmResearcher?.custoElemental ?? 10, c.lang);

/** Quantos pokémon no nível do boss zeram a penalidade (`BOSS_EQUIPE_IDEAL`, vem no welcome). */
const equipeIdealBoss = (c) => c.d.bossesJogaveis?.[0]?.equipeIdeal ?? 5;

/** O multiplicador de dano recebido por uma equipe de força `forca` — a conta de `penalidadeDeEquipe`. */
const multPenalidadeBoss = (c, forca) => BASE_PENALIDADE_BOSS ** Math.max(0, equipeIdealBoss(c) - forca);

/** A tabela da penalidade de equipe, montada pela mesma conta do servidor. */
function tabelaPenalidadeBoss(c) {
  const ideal = equipeIdealBoss(c);
  const L = {
    pt: {
      cab: ['Equipe', 'Multiplicador de dano recebido'],
      noNivel: (n) => (n === ideal ? `${n} ou mais pokémon no nível do boss` : `${n} pokémon no nível do boss`),
      metade: '1 pokémon com metade do nível do boss',
      teto: '1 pokémon muito abaixo do boss',
      ate: 'até',
    },
    en: {
      cab: ['Team', 'Incoming damage multiplier'],
      noNivel: (n) => (n === ideal ? `${n} or more pokémon at the boss level` : `${n} pokémon at the boss level`),
      metade: '1 pokémon at half the boss level',
      teto: '1 pokémon far below the boss',
      ate: 'up to',
    },
    es: {
      cab: ['Equipo', 'Multiplicador de daño recibido'],
      noNivel: (n) => (n === ideal ? `${n} o más pokémon al nivel del boss` : `${n} pokémon al nivel del boss`),
      metade: '1 pokémon con la mitad del nivel del boss',
      teto: '1 pokémon muy por debajo del boss',
      ate: 'hasta',
    },
  }[c.lang];
  const x = (v) => `×${N(Math.round(v), c.lang)}`;
  const degraus = [...new Set([ideal, ideal - 1, ideal - 2, 1])].filter((n) => n >= 1);
  const linhas = [
    ...degraus.map((n, i) => `<tr><td>${L.noNivel(n)}</td><td class="wk-num${i === 0 ? ' destaque' : ''}">${x(multPenalidadeBoss(c, n))}</td></tr>`),
    `<tr><td>${L.metade}</td><td class="wk-num">${x(multPenalidadeBoss(c, 0.5))}</td></tr>`,
    `<tr><td>${L.teto}</td><td class="wk-num">${L.ate} ${x(multPenalidadeBoss(c, 0))}</td></tr>`,
  ].join('');
  return tabela(L.cab, linhas);
}

/**
 * "3º" / "3rd" / "3.º" — o ordinal de uma posição do ranking, no idioma do capítulo. O inglês segue
 * a regra inteira (21st, 52nd, 113th): a tabela do PvP passa do 20º, e "21th" é erro de inglês.
 */
function ordinalDePosicao(n, lang) {
  if (lang === 'en') {
    const dezena = n % 100;
    const sufixo = dezena >= 11 && dezena <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
    return `${n}${sufixo}`;
  }
  return lang === 'es' ? `${n}.º` : `${n}º`;
}

/**
 * As linhas da tabela de prêmios da guild: o bônus do ranking Diário e os diamantes do Global.
 *
 * A escada inteira sai de `shared/guild-premios.mjs` — inclusive QUANTAS linhas ela tem. O
 * diário paga até o piso (última linha, "do Nº em diante"); o mensal tem teto, e a coluna dele
 * fica em "—" nas posições que o mês não paga.
 */
function linhasPremiosGuild(c) {
  const resto = {
    pt: `${ordinalDePosicao(PRIMEIRA_POS_RESTO, 'pt')} em diante (com GP &gt; 0)`,
    en: `${ordinalDePosicao(PRIMEIRA_POS_RESTO, 'en')} onward (GP &gt; 0)`,
    es: `${ordinalDePosicao(PRIMEIRA_POS_RESTO, 'es')} en adelante (GP &gt; 0)`,
  }[c.lang];
  return [...POSICOES_BONUS_GP, 'resto'].map((k, i) => `<tr>
      <td>${k === 'resto' ? resto : ordinalDePosicao(k, c.lang)}</td>
      <td class="wk-num${i === 0 ? ' destaque' : ''}">+${BONUS_RANKING_GP[k]}%</td>
      <td class="wk-num">${PREMIOS_GLOBAL[k] ? `${N(PREMIOS_GLOBAL[k], c.lang)} 💎` : '—'}</td>
    </tr>`).join('');
}

/**
 * A tabela dos prêmios da semana do PvP Ranqueado — uma linha por faixa de `PVP_PREMIOS`: as
 * posições ("1º", "2º e 3º", "4º ao 10º"), os boosts com a duração e os diamantes. Sai inteira do
 * shared, inclusive QUANTAS faixas há: era uma frase com três faixas fixas, e a tabela de 04/10/2026
 * tem seis.
 */
function tabelaPremiosPvp(c) {
  const L = {
    pt: { cab: ['Posição', 'Boosts', 'Diamantes'], e: 'e', ao: 'ao', por: 'por', dia: 'dia', dias: 'dias', horas: 'horas', loc: 'pt-BR' },
    en: { cab: ['Place', 'Boosts', 'Diamonds'], e: 'and', ao: 'to', por: 'for', dia: 'day', dias: 'days', horas: 'hours', loc: 'en-US' },
    es: { cab: ['Posición', 'Boosts', 'Diamantes'], e: 'y', ao: 'al', por: 'por', dia: 'día', dias: 'días', horas: 'horas', loc: 'es-ES' },
  }[c.lang] ?? { cab: ['Posição', 'Boosts', 'Diamantes'], e: 'e', ao: 'ao', por: 'por', dia: 'dia', dias: 'dias', horas: 'horas', loc: 'pt-BR' };
  const nomeBoost = {
    shiny: 'Shiny Secret Lure', captura: 'Capture Boost', xp: 'XP Boost',
    pokexp: c.lang === 'en' ? 'Pokémon XP Boost' : 'XP Boost Pokémon',
  };
  const duracao = (h) => (h === 24 ? `1 ${L.dia}` : h % 24 === 0 ? `${N(h / 24, c.lang)} ${L.dias}` : `${N(h, c.lang)} ${L.horas}`);
  const lista = new Intl.ListFormat(L.loc, { style: 'long', type: 'conjunction' });
  let de = 1;
  const linhas = PVP_PREMIOS.map((f, i) => {
    const o = (n) => ordinalDePosicao(n, c.lang);
    const pos = de === f.ate ? o(de) : f.ate === de + 1 ? `${o(de)} ${L.e} ${o(f.ate)}` : `${o(de)} ${L.ao} ${o(f.ate)}`;
    de = f.ate + 1;
    const porDuracao = new Map();
    for (const [k, h] of Object.entries(f.horas)) porDuracao.set(h, [...(porDuracao.get(h) ?? []), nomeBoost[k] ?? k]);
    const boosts = [...porDuracao].map(([h, nomes]) => `${lista.format(nomes)} ${L.por} ${duracao(h)}`).join(' · ');
    return `<tr><td>${pos}</td><td>${boosts}</td>`
      + `<td class="wk-num${i === 0 ? ' destaque' : ''}">${f.diamantes ? `${N(f.diamantes, c.lang)} 💎` : '—'}</td></tr>`;
  }).join('');
  return tabela(L.cab, linhas);
}

// ------------------------------------------------------------------ Showdown
//
// As tabelas do capítulo do Showdown. O teto, o prêmio e a rodada saem de `shared/showdown.mjs`; a
// coluna do Mundial é `nivelNoGinasio` (`shared/ginasios.mjs`), a régua do PvP Ranqueado; e a duração
// da noite sai da própria chave (`shared/campeonato.mjs`), a mesma que o servidor joga.

/** Os níveis de exemplo da tabela do teto — os mesmos do "Como funciona?" da tela do Showdown. */
const NIVEIS_EXEMPLO_SHOWDOWN = [100, 120, 150, 200, 300];

/** A passada que entrega o prêmio a quem está online, em segundos: `VARREDURA_MERCADO_MS`, em `server/sim.mjs`. */
const SEG_VARREDURA_PREMIO = 60;

/** O teto de nível: o nível do pokémon → com que nível ele luta no Showdown e no Mundial/Amador. */
function tabelaTetoShowdown(c) {
  const cab = {
    pt: ['Nível do pokémon', 'No Showdown, luta como', 'No Mundial e no Amador'],
    en: ['Pokémon level', 'In the Showdown, fights as', 'In the World and Amateur'],
    es: ['Nivel del pokémon', 'En el Showdown, pelea como', 'En el Mundial y el Amateur'],
  }[c.lang] ?? ['Nível do pokémon', 'No Showdown, luta como', 'No Mundial e no Amador'];
  const nv = c.lang === 'en' ? 'Lv' : 'Nv';
  const linhas = NIVEIS_EXEMPLO_SHOWDOWN.map((n) => {
    const sd = nivelNoShowdown(n);
    return `<tr><td>${nv} ${N(n, c.lang)}</td><td class="wk-num${sd < n ? ' destaque' : ''}">${N(sd, c.lang)}</td>`
      + `<td class="wk-num">${N(nivelNoGinasio(n), c.lang)}</td></tr>`;
  }).join('');
  return tabela(cab, linhas);
}

/** O pódio do Showdown, em diamante — `SHOWDOWN_PREMIOS`, a mesma lista com que o servidor paga. */
function tabelaPremioShowdown(c) {
  const cab = { pt: ['Posição', 'Prêmio'], en: ['Place', 'Prize'], es: ['Puesto', 'Premio'] }[c.lang] ?? ['Posição', 'Prêmio'];
  const linhas = SHOWDOWN_PREMIOS.map((d, i) => `<tr><td>${ordinalDePosicao(i + 1, c.lang)}</td>`
    + `<td class="wk-num${i === 0 ? ' destaque' : ''}">${N(d, c.lang)} 💎</td></tr>`).join('');
  return tabela(cab, linhas);
}

/**
 * Quantas RODADAS a chave de `n` inscritos leva até a grande final. É a conta do servidor, e não uma
 * fórmula à parte: monta a chave (`montarChave`) e, rodada a rodada, joga de uma vez toda partida que já
 * tem os dois lados (`resolverChave` — o que `avancarShowdown` faz a cada onda). Quem vence não muda a
 * conta; a seed melhor ganha aqui só para a simulação andar.
 */
function rodadasDaChave(n) {
  const chave = montarChave(n);
  if (!chave) return 0;
  const resultados = new Map();
  for (let rodadas = 0; rodadas < 64; rodadas++) {
    const prontas = [...resolverChave(chave, resultados).values()].filter((x) => x.pronta);
    if (!prontas.length) return rodadas;
    for (const x of prontas) {
      const [vencedor, perdedor] = x.a.seed < x.b.seed ? [x.a.seed, x.b.seed] : [x.b.seed, x.a.seed];
      resultados.set(x.partida.id, { vencedor, perdedor });
    }
  }
  return 64;
}

/**
 * Quanto dura a noite: inscritos → rodadas → a hora em que a grande final sai, com a primeira rodada em
 * `lutasEm` e uma a cada `intervaloOndaMs`. `hora` é o relógio de Brasília do capítulo.
 */
function tabelaDuracaoShowdown(c, ed, hora) {
  const cab = {
    pt: ['Inscritos', 'Rodadas', 'A grande final sai por volta das'],
    en: ['Entrants', 'Rounds', 'Grand final at about'],
    es: ['Inscritos', 'Rondas', 'La gran final sale hacia las'],
  }[c.lang] ?? ['Inscritos', 'Rodadas', 'A grande final sai por volta das'];
  const linhas = [SHOWDOWN_MIN_PARA_PREMIO, 32, 128].map((n) => {
    const r = rodadasDaChave(n);
    return `<tr><td class="wk-num">${N(n, c.lang)}</td><td class="wk-num">${N(r, c.lang)}</td>`
      + `<td class="wk-num">${hora(ed.lutasEm + (r - 1) * ed.intervaloOndaMs)}</td></tr>`;
  }).join('');
  return tabela(cab, linhas);
}

/** Quanto rende DOBRAR o nível na Guerra de Guilds, em % — a compressão acima do nível cheio. */
const DOBRA_NA_GUERRA_PCT = Math.round((2 ** ARENA_EXPO_GUERRA - 1) * 100);

/** A última aba do Mapa — a mais alta da escada. */
const ULTIMA_REGIAO = REGIOES_MAPA_DOC.at(-1);

/** A hunt de nível mais alto que o servidor mandou — 0 antes do welcome. */
const huntMaisAlta = (c) => (c.d.hunts ?? []).reduce((m, h) => Math.max(m, Number(h.nivel) || 0), 0);

/**
 * A tabela da gema escrita em uma linha, no idioma do capítulo — "13% até 500 · 10% até 5.000
 * · 7,5% acima". A comissão da gema é por faixa e marginal (ver `shared/taxa-mercado.mjs`), e
 * um número só ali seria mentira em qualquer preço que não fosse o da primeira faixa.
 */
const pctTx = (n) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const faixasOrbTexto = (lang = 'pt') => {
  const ate = { pt: 'até', en: 'up to', es: 'hasta' }[lang] ?? 'até';
  const acima = { pt: 'acima', en: 'above that', es: 'por encima' }[lang] ?? 'acima';
  return faixasOrbParaTela()
    .map((f) => (f.ate ? `${pctTx(f.pct)}% ${ate} ${f.ate.toLocaleString('pt-BR')}` : `${pctTx(f.pct)}% ${acima}`))
    .join(' · ');
};

/** As mesmas faixas como linhas de tabela, para o capítulo do Mercado. */
const linhasFaixasOrb = (rotulo, lang = 'pt') => {
  const ate = { pt: 'até', en: 'up to', es: 'hasta' }[lang] ?? 'até';
  const acima = { pt: 'acima disso', en: 'above that', es: 'por encima' }[lang] ?? 'acima disso';
  return faixasOrbParaTela()
    .map((f) => `<tr><td>${rotulo} — ${f.ate ? `${ate} ${f.ate.toLocaleString('pt-BR')}` : acima}</td>`
      + `<td class="wk-num destaque">${pctTx(f.pct)}%</td></tr>`)
    .join('');
};

/** O quadro de TAXAS: tudo que o jogo desconta, num lugar só. */
function tabelaDeTaxas(c) {
  const e = c.d.economia ?? {};
  const L = {
    pt: [
      ['Mercado da Comunidade — POKÉMON em Gema', `${faixasOrbTexto('pt')} (por faixa, sobre a venda)`, 'o VENDEDOR'],
      ['Mercado da Comunidade — item ou diamante em Gema', `${pctTx(TAXA_ORB_PLANA * 100)}% sobre a venda`, 'o VENDEDOR'],
      ['Mercado da Comunidade — anúncio em Ouro', `${e.taxaMercadoGoldPct ?? 15}% sobre a venda`, 'o VENDEDOR'],
      ['Mercado da Comunidade — pensão do pokémon', `${(e.taxaDiariaMercado ?? 100000).toLocaleString("pt-BR")} Coins por dia (só pokémon)`, 'o VENDEDOR'],
      ['Mercado da Comunidade — alto-falante (anúncio no chat)', `${N(CUSTO_ALTO_FALANTE, 'pt')} Coins por anúncio`, 'o VENDEDOR'],
      ['Enviar Coins a um amigo', `${PCT_ENVIO_COINS}% do envio, queimados`, 'quem envia'],
      ['Market (NPC) — comprar', 'nenhuma', '—'],
      ['Market (NPC) — vender', 'nenhuma (paga o valor cheio do catálogo)', '—'],
      ['Gema — compra com USDT', `US$ ${e.orbCompraUsdt} por Gema`, 'o comprador'],
      ['Gema — saque em USDT', `US$ ${e.orbSaqueUsdt} por Gema (spread de ${e.spreadPct}%)`, 'quem saca'],
      ['Gema — taxa de rede do saque', 'por conta do projeto', '—'],
      ['Loja de Diamantes', 'nenhuma (o preço é o final)', '—'],
      ['Nocaute — o time inteiro cai (hunt ou boss)', `${e.xpPerdidoPct ?? 10}% do XP do nível atual`, 'quem cai'],
    ],
    en: [
      ['Community Market — POKÉMON in Gems', `${faixasOrbTexto('en')} (tiered, on the sale)`, 'the SELLER'],
      ['Community Market — item or diamond in Gems', `${pctTx(TAXA_ORB_PLANA * 100)}% of the sale`, 'the SELLER'],
      ['Community Market — Gold listing', `${e.taxaMercadoGoldPct ?? 15}% of the sale`, 'the SELLER'],
      ['Community Market — pokémon boarding', `${(e.taxaDiariaMercado ?? 100000).toLocaleString("en-US")} Coins a day (pokémon only)`, 'the SELLER'],
      ['Community Market — loudspeaker (listing in chat)', `${N(CUSTO_ALTO_FALANTE, 'en')} Coins per announcement`, 'the SELLER'],
      ['Sending Coins to a friend', `${PCT_ENVIO_COINS}% of the transfer, burned`, 'the sender'],
      ['Market (NPC) — buying', 'none', '—'],
      ['Market (NPC) — selling', 'none (pays the full catalogue value)', '—'],
      ['Gem — buying with USDT', `US$ ${e.orbCompraUsdt} per Gem`, 'the buyer'],
      ['Gem — withdrawing to USDT', `US$ ${e.orbSaqueUsdt} per Gem (${e.spreadPct}% spread)`, 'whoever withdraws'],
      ['Gem — withdrawal network fee', 'paid by the project', '—'],
      ['Diamond Shop', 'none (the price is final)', '—'],
      ['Knockout — the whole team falls (hunt or boss)', `${e.xpPerdidoPct ?? 10}% of the current level's XP`, 'whoever falls'],
    ],
    es: [
      ['Mercado de la Comunidad — POKÉMON en Gemas', `${faixasOrbTexto('es')} (por tramos, sobre la venta)`, 'el VENDEDOR'],
      ['Mercado de la Comunidad — objeto o diamante en Gemas', `${pctTx(TAXA_ORB_PLANA * 100)}% sobre la venta`, 'el VENDEDOR'],
      ['Mercado de la Comunidad — anuncio en Oro', `${e.taxaMercadoGoldPct ?? 15}% sobre la venta`, 'el VENDEDOR'],
      ['Mercado de la Comunidad — pensión del pokémon', `${(e.taxaDiariaMercado ?? 100000).toLocaleString("es-ES")} Coins por día (solo pokémon)`, 'el VENDEDOR'],
      ['Mercado de la Comunidad — altavoz (anuncio en el chat)', `${N(CUSTO_ALTO_FALANTE, 'es')} Coins por anuncio`, 'el VENDEDOR'],
      ['Enviar Coins a un amigo', `${PCT_ENVIO_COINS}% del envío, quemado`, 'quien envía'],
      ['Market (NPC) — comprar', 'ninguna', '—'],
      ['Market (NPC) — vender', 'ninguna (paga el valor completo del catálogo)', '—'],
      ['Gema — compra con USDT', `US$ ${e.orbCompraUsdt} por Gema`, 'el comprador'],
      ['Gema — retiro en USDT', `US$ ${e.orbSaqueUsdt} por Gema (spread del ${e.spreadPct}%)`, 'quien retira'],
      ['Gema — comisión de red del retiro', 'a cargo del proyecto', '—'],
      ['Tienda de Diamantes', 'ninguna (el precio es final)', '—'],
      ['Nocaut — cae el equipo entero (cacería o boss)', `${e.xpPerdidoPct ?? 10}% del XP del nivel actual`, 'quien cae'],
    ],
  }[c.lang];

  return tabela(
    [c.r.taxa, c.r.quanto, c.r.quemPaga],
    L.map(([a, b, d]) => `<tr><td>${a}</td><td class="wk-num">${b}</td><td>${d}</td></tr>`).join(''),
  );
}

// ------------------------------------------------- tabelas da leva de setembro/outubro

/** Segundos com a vírgula do idioma: "12,4 s" / "12.4 s". */
const S = (ms, lang) => `${(ms / 1000).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 1 })} s`;

/** Uma nota (3.5) com a vírgula do idioma — o `${3.5}` cru sairia "3.5" no meio de um texto em português. */
const D = (v, lang) => Number(v).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 2 });

/**
 * A curva de recarga dos golpes, ponto a ponto — `cooldownDoPoder`, a mesma função que o servidor
 * usa para montar o catálogo. A última linha é o golpe de mega, a única coisa que sai da curva.
 */
function tabelaCurvaGolpes(c) {
  const pontos = [PODER_MINIMO, 40, 60, 80, 100, 120, 150, 300, 600];
  const linhas = pontos
    .map((p) => `<tr><td class="wk-num">${N(p, c.lang)}</td><td class="wk-num">${S(cooldownDoPoder(p), c.lang)}</td></tr>`)
    .join('');
  const mega = { pt: '600 (golpe de mega)', en: '600 (mega move)', es: '600 (golpe de mega)' }[c.lang];
  const cab = { pt: ['Poder do golpe', 'Recarga'], en: ['Move power', 'Cooldown'], es: ['Poder del golpe', 'Recarga'] }[c.lang];
  return tabela(cab, `${linhas}<tr><td class="wk-num">${mega}</td><td class="wk-num destaque">${S(COOLDOWN_MEGA_MS, c.lang)}</td></tr>`);
}

/**
 * O desconto do Speed nos golpes, pelos exemplos da proposta de 05/10/2026: o Speed base sai do
 * catálogo do jogo (`c.d.especies`, o mesmo da Pokédex) e a conta é `cooldownGolpeComSpeed` — a
 * mesma do servidor — no golpe de 600 (`COOLDOWN_600_MS`) com IV de SPD 32. Espécie que o catálogo
 * ainda não trouxe fica de fora, em vez de sair com Speed 0.
 */
function tabelaSpeedGolpes(c) {
  const EXEMPLOS = [143, 248, 571, 135, 291]; // Snorlax, Tyranitar, Zoroark, Jolteon, Ninjask
  const linhas = EXEMPLOS
    .map((id) => c.d.especies?.get?.(id))
    .filter((e) => e && Number.isFinite(Number(e.baseSpeed)))
    .map((e) => `<tr><td>${escaparHtml(e.name)}</td>
      <td class="wk-num">${N(Number(e.baseSpeed), c.lang)}</td>
      <td class="wk-num">${D(potencialDoSpeed(e.baseSpeed), c.lang)}%</td>
      <td class="wk-num destaque">${S(cooldownGolpeComSpeed(COOLDOWN_600_MS, e.baseSpeed, 32), c.lang)}</td></tr>`)
    .join('');
  if (!linhas) return '';
  const g600 = S(COOLDOWN_600_MS, c.lang);
  const cab = {
    pt: ['Espécie', 'Speed base', 'Potencial (IV 32)', `Golpe de 600 (${g600})`],
    en: ['Species', 'Base Speed', 'Potential (IV 32)', `600 move (${g600})`],
    es: ['Especie', 'Speed base', 'Potencial (IV 32)', `Golpe de 600 (${g600})`],
  }[c.lang];
  return tabela(cab, linhas);
}

/** O exemplo do texto (Jolteon, Speed 130, IV 24, no golpe de 600), calculado e não digitado. */
const exemploSpeed = (lang) => ({
  pct: D(descontoDoSpeedPct(130, 24), lang),
  potencial: D(potencialDoSpeed(130), lang),
  cd: S(cooldownGolpeComSpeed(COOLDOWN_600_MS, 130, 24), lang),
  g600: S(COOLDOWN_600_MS, lang),
  teto: D(SPEED_POTENCIAL_TETO_PCT, lang),
});

/**
 * Poções e revives do Market, com o efeito que o CARD mostra: a Golden Potion cura por
 * porcentagem, as outras um número fixo de HP, e cada revive levanta com a sua fração. Sai de
 * `estado.itens` — o mesmo catálogo, já com `ajustarItemEspelho`, de onde o Market desenha.
 */
function tabelaDeCuras(c) {
  const itens = [...(c.d.itens?.values?.() ?? [])]
    .filter((i) => (i.category === 'heal' || i.category === 'revive') && Number(i.npcPrice) > 0)
    .sort((a, b) => (a.category === b.category ? a.npcPrice - b.npcPrice : a.category === 'heal' ? -1 : 1));
  if (!itens.length) return '';
  const efeito = (i) => {
    if (i.category === 'revive') {
      const pct = Math.round((i.revivePct ?? 0) * 100);
      return { pt: `levanta com ${pct}% do HP`, en: `revives with ${pct}% HP`, es: `revive con ${pct}% del HP` }[c.lang];
    }
    if (i.healPct > 0) {
      const pct = Math.round(i.healPct * 100);
      return { pt: `cura ${pct}% do HP máximo`, en: `heals ${pct}% of max HP`, es: `cura ${pct}% del HP máximo` }[c.lang];
    }
    return `+${N(i.healAmount ?? 0, c.lang)} HP`;
  };
  const linhas = itens
    .map((i) => `<tr><td>${esc(i.name)}</td><td>${efeito(i)}</td><td class="wk-num">${N(i.npcPrice, c.lang)} ${c.r.ouro}</td></tr>`)
    .join('');
  return tabela([c.r.item, c.r.efeito, c.r.preco], linhas);
}

/** Os três Mystery Eggs: potência, preço, horas de choca e as horas com o Absorb Bulb. */
function tabelaDeOvos(c) {
  const h = (horas) => `${N(horas, c.lang)} h`;
  const cab = {
    pt: ['Ovo', 'Potência', 'Preço (Coins)', 'Choca em', 'Aquecido'],
    en: ['Egg', 'Potency', 'Price (Coins)', 'Hatches in', 'Warmed'],
    es: ['Huevo', 'Potencia', 'Precio (Coins)', 'Eclosiona en', 'Calentado'],
  }[c.lang];
  const linhas = OVOS
    .map((o) => `<tr>
        <td>${esc(o.nome)}</td>
        <td class="wk-num">P${o.potencia}</td>
        <td class="wk-num">${N(o.preco, c.lang)}</td>
        <td class="wk-num">${h(o.horas)}</td>
        <td class="wk-num destaque">${h(o.horas * BULBO_FATOR)}</td>
      </tr>`)
    .join('');
  return tabela(cab, linhas);
}

/** O Absorb Bulb em %: o que ele TIRA da espera (25%), lido do fator que sobra (0,75). */
const PCT_BULBO = Math.round((1 - BULBO_FATOR) * 100);

const NOME_REGIAO_OVO = { unova: 'Unova', kalos: 'Kalos', alola: 'Alola' };

/**
 * A escada do FRAGMENTO DE OVO SHINY, nível de hunt por nível de hunt — `tabelaFragmentoOvoShiny`
 * de `shared/ovo-shiny.mjs`, a mesma lista que o servidor sorteia. "Abates por ovo" é a média exata
 * (10 fragmentos ÷ a chance), sem Loot Boost, que multiplica por cima de qualquer linha.
 */
function tabelaOvoShiny(c) {
  const cab = {
    pt: ['Nível da hunt', 'Região', 'Chance por abate', 'Uma a cada', 'Abates por ovo'],
    en: ['Hunt level', 'Region', 'Chance per kill', 'One in', 'Kills per egg'],
    es: ['Nivel de la hunt', 'Región', 'Probabilidad por derrota', 'Una cada', 'Derrotas por huevo'],
  }[c.lang];
  const linhas = tabelaFragmentoOvoShiny()
    .map((d) => `<tr>
        <td class="wk-num">${N(d.nivel, c.lang)}</td>
        <td>${NOME_REGIAO_OVO[d.regiao] ?? d.regiao}</td>
        <td class="wk-num destaque">${P(d.chance, c.lang)}</td>
        <td class="wk-num">${umEm(d.chance)}</td>
        <td class="wk-num">~${N(Math.round(CUSTO_FRAGMENTOS_OVO_SHINY / d.chance), c.lang)}</td>
      </tr>`)
    .join('');
  return tabela(cab, linhas);
}

/** Os nomes das cinco bolas, para quando o `welcome` ainda não chegou. */
const NOME_BOLA = { 1: 'Poké Ball', 2: 'Great Ball', 3: 'Super Ball', 4: 'Ultra Ball', 5: 'Beast Ball' };

/** A captura na Arena Mística, bola por bola, sem e com Capture Boost (×2). */
function tabelaCapturaMistica(c) {
  const nome = (id) => (c.d.catalogoBolas ?? []).find((b) => b.id === Number(id))?.nome ?? NOME_BOLA[id] ?? `#${id}`;
  const linhas = Object.entries(CAPTURA_MISTICA_POR_BOLA)
    .map(([id, ch]) => `<tr>
        <td>${esc(nome(id))}</td>
        <td class="wk-num">${P(ch, c.lang)}</td>
        <td class="wk-num destaque">${P(Math.min(1, ch * 2), c.lang)}</td>
      </tr>`)
    .join('');
  const boost = { pt: 'Com Capture Boost', en: 'With Capture Boost', es: 'Con Capture Boost' }[c.lang];
  return tabela([c.r.bola, c.r.chance, boost], linhas);
}

/** A chance do Mystic Ticket nos primeiros pares de bosses — a escada de `chanceTicketDoPar`. */
function tabelaTicketPorPar(c) {
  const linhas = [0, 1, 2, 3]
    .map((par) => {
      const ch = CHANCE_TICKET_PASSO * (par + 1);
      return `<tr><td>${c.lang === 'en' ? 'Lv' : 'Nv'} ${N(nivelMinimoDoPar(par), c.lang)}</td><td class="wk-num">${P(ch, c.lang)}</td><td class="wk-num">${umEm(ch)}</td></tr>`;
    })
    .join('');
  const cab = {
    pt: ['Par de bosses', 'Chance por vitória', 'Uma a cada'],
    en: ['Boss pair', 'Chance per win', 'One in'],
    es: ['Par de bosses', 'Probabilidad por victoria', 'Una cada'],
  }[c.lang];
  return tabela(cab, linhas);
}

/** A chance do Safari Ticket nos primeiros pares de bosses — `chanceSafariTicketDoPar`, a do fragmento shiny. */
function tabelaSafariTicketPorPar(c) {
  const linhas = [0, 1, 2, 3]
    .map((par) => {
      const ch = chanceSafariTicketDoPar(par);
      return `<tr><td>${c.lang === 'en' ? 'Lv' : 'Nv'} ${N(nivelMinimoDoPar(par), c.lang)}</td><td class="wk-num">${P(ch, c.lang)}</td><td class="wk-num">${umEm(ch)}</td></tr>`;
    })
    .join('');
  const cab = {
    pt: ['Par de bosses', 'Chance por vitória', 'Uma a cada'],
    en: ['Boss pair', 'Chance per win', 'One in'],
    es: ['Par de bosses', 'Probabilidad por victoria', 'Una cada'],
  }[c.lang];
  return tabela(cab, linhas);
}

/** Os nomes dos cinco boosts da Loja, pela chave — os mesmos nos três idiomas. */
const NOME_BOOST = {
  xp: 'XP Boost', pokexp: 'XP Boost Pokémon', loot: 'Loot Boost', captura: 'Capture Boost', shiny: 'Shiny Secret Lure',
};

/** "3 h", "3 dias", "7 dias", "30 dias" — horas que caem em dia redondo viram dias. */
const duracaoHoras = (h, lang) => {
  if (h % 24 === 0) {
    const d = h / 24;
    return { pt: `${N(d, lang)} ${d === 1 ? 'dia' : 'dias'}`, en: `${N(d, lang)} ${d === 1 ? 'day' : 'days'}`, es: `${N(d, lang)} ${d === 1 ? 'día' : 'días'}` }[lang];
  }
  return `${N(h, lang)} h`;
};

/** A escada do Convide & Ganhe, marco por marco — `MARCOS` de `shared/convites.mjs`, a mesma do bot. */
function tabelaConvites(c) {
  const premio = (p) => {
    if (p.tipo === 'diamante') return `${N(p.qtd, c.lang)} 💎`;
    if (p.tipo === 'bola') return `${N(p.qtd, c.lang)} Beast Balls`;
    if (p.tipo === 'boost') return `${duracaoHoras(p.horas, c.lang)} ${{ pt: 'de', en: 'of', es: 'de' }[c.lang]} ${NOME_BOOST[p.boost] ?? p.boost}`;
    if (p.tipo === 'vip') return { pt: `VIP ${p.dias} dias`, en: `${p.dias}-day VIP`, es: `VIP ${p.dias} días` }[c.lang];
    if (p.tipo === 'vipPermanente') return { pt: '<b>VIP PERMANENTE</b>', en: '<b>PERMANENT VIP</b>', es: '<b>VIP PERMANENTE</b>' }[c.lang];
    return '';
  };
  const linhas = MARCOS_CONVITE
    .map((m) => `<tr><td class="wk-num">${N(m.amigos, c.lang)}</td><td>${m.premios.map(premio).join(' + ')}</td></tr>`)
    .join('');
  const cab = { pt: ['Convidados', 'Prêmio'], en: ['Invited', 'Prize'], es: ['Invitados', 'Premio'] }[c.lang];
  return tabela(cab, linhas);
}

/** As três recompensas da Kick: custo em pontos do canal e o bônus que cada resgate liga. */
function tabelaKick(c) {
  const k = c.d.eu?.kick ?? {};
  const pct = k.pct ?? PCT_KICK;
  const min = k.minutos ?? MIN_KICK;
  const custo = (tipo) => (k.recompensas ?? []).find((r) => r.tipo === tipo)?.custo ?? CUSTO_KICK[tipo];
  const efeito = {
    xp: { pt: `+${pct}% de XP (treinador e pokémon)`, en: `+${pct}% XP (trainer and pokémon)`, es: `+${pct}% de XP (entrenador y pokémon)` },
    captura: { pt: `+${pct}% na chance de captura`, en: `+${pct}% catch chance`, es: `+${pct}% en la probabilidad de captura` },
    shiny: { pt: `+${pct}% na chance de shiny`, en: `+${pct}% shiny chance`, es: `+${pct}% en la probabilidad de shiny` },
  };
  const nome = { xp: `+${pct}% XP`, captura: `+${pct}% Capture Boost`, shiny: `+${pct}% Secret Lure` };
  const pontos = { pt: 'pontos', en: 'points', es: 'puntos' }[c.lang];
  const linhas = ['xp', 'captura', 'shiny']
    .map((t) => `<tr><td>${nome[t]}</td><td class="wk-num">${N(custo(t), c.lang)} ${pontos}</td><td>${efeito[t][c.lang]}</td><td class="wk-num">${N(min, c.lang)} min</td></tr>`)
    .join('');
  const cab = {
    pt: ['Recompensa', 'Custo', 'Efeito', 'Cada resgate'],
    en: ['Reward', 'Cost', 'Effect', 'Each redeem'],
    es: ['Recompensa', 'Costo', 'Efecto', 'Cada canje'],
  }[c.lang];
  return tabela(cab, linhas);
}

/**
 * Os produtos de UMA seção da vitrine da Loja (`grupo`: utilitarios, vip, personagem, cosmeticos,
 * pacotes), com preço e descrição — a mesma arrumação do menu lateral da Loja.
 *
 * A descrição é a do CARD da Loja: o catálogo chega do servidor em português, com a chave de
 * tradução ao lado (`i18n`), e quem traduz é a vitrine (`textoDaLoja`, no app.js), que vem junto
 * dos dados; sem ela (um teste, por exemplo) fica o texto do servidor. Manual e botão dizendo a
 * mesma frase vale mais do que uma tradução própria: o jogador compara os dois antes de comprar.
 *
 * As SKINS saem numa linha só: são dezenas de cards (uma comum e uma shiny por desenho), todos com
 * o mesmo preço e a mesma regra, e listá-las uma a uma enterraria a Name Tag no meio delas.
 */
function tabelaDaLojaGrupo(c, grupo) {
  const traduzir = (chave, p, pronto) => c.d.textoDaLoja?.(chave, p.i18n?.params, pronto) ?? pronto;
  // O Boost dos Atrasados tem preço POR JOGADOR — numa tabela de preço fixo ele mentiria; tem seção
  // própria, com a regra da conta.
  const produtos = (c.d.lojaProdutos ?? []).filter((p) => (p.grupo ?? p.cat) === grupo && !p.atrasados);
  const skins = produtos.filter((p) => String(p.id).startsWith('skin_'));
  const linhas = produtos
    .filter((p) => !String(p.id).startsWith('skin_'))
    .map((p) => `<tr>
        <td>${esc(traduzir(p.i18n?.nome, p, p.nome))}</td>
        <td class="wk-num">${N(p.preco, c.lang)} ${c.r.diamantes}</td>
        <td class="wk-desc">${esc(traduzir(p.i18n?.desc, p, p.descricao ?? ''))}</td>
      </tr>`);
  if (skins.length) {
    const desc = {
      pt: `${N(skins.length, c.lang)} skins de evento, vendidas só durante o evento — as regras estão logo acima.`,
      en: `${N(skins.length, c.lang)} event skins, sold only while the event lasts — the rules are right above.`,
      es: `${N(skins.length, c.lang)} skins de evento, vendidas solo mientras dura el evento — las reglas están justo arriba.`,
    }[c.lang];
    linhas.push(`<tr><td>Skins</td><td class="wk-num">${N(skins[0].preco, c.lang)} ${c.r.diamantes}</td><td class="wk-desc">${desc}</td></tr>`);
  }
  if (!linhas.length) return '';
  return tabela([c.r.item, c.r.preco, c.r.efeito], linhas.join(''));
}

// ------------------------------------------------------------- capítulos
//
// A ordem é a do JOGADOR, não a do código: começa no que ele vê no primeiro minuto e só
// depois desce para o que só importa quando ele já tem um time. Dinheiro de verdade fica no
// fim, que é onde a pessoa chega quando já entendeu o resto.

export const CAPITULOS = [
  // ------------------------------------------------------------ 1. começo
  {
    id: 'inicio',
    titulo: { pt: 'Primeiros passos', en: 'Getting started', es: 'Primeros pasos' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>Pokéidle é um <b>idle</b>: o seu pokémon luta sozinho. Você escolhe onde caçar,
        com quem, e o que fazer com o que cair. O jogo continua enquanto a aba estiver aberta.</p>

        <h4>O laço de sempre</h4>
        <ol class="wk-passos">
          <li><b>Abra o Mapa</b> e escolha uma área. Cada uma tem um nível recomendado — o do
          pokémon mais forte que aparece lá. Área acima do seu nível fica trancada.</li>
          <li><b>O seu pokémon ativo</b> anda até o selvagem mais próximo e começa a bater.
          Você não clica em nada durante a luta.</li>
          <li><b>Derrubado, o selvagem vira corpo</b> e fica <b>30 segundos</b> no chão. É nesse
          intervalo que se joga a pokébola — e é assim que se captura de verdade
          (ver <a data-cap="captura">Captura</a>).</li>
          <li><b>O ouro</b> de cada abate entra direto — e já vem com o <b>bônus de loot</b> (ver
          <a data-cap="combate">Combate</a>). O que cai — a pedra de evolução dos tipos do pokémon e
          os drops raros — vai para a <b>Mochila</b>.</li>
        </ol>

        <h4>A sua equipe</h4>
        <p>Cabem <b>${c.d.maxEquipe}</b> pokémon na equipe. Quem for capturado com ela cheia cai
        no <b>Depot</b>, que não tem limite. Só um luta por vez — o <b>ativo</b> —, e quando ele
        desmaia o próximo da equipe entra no lugar automaticamente.</p>

        ${nota(`<b>O starter não é sorteado como os outros.</b> Ele nasce com piso de qualidade
        e de IV justamente para dar conta da primeira hunt. Um pokémon capturado gira a roleta
        inteira — ver <a data-cap="stats">Stats e Qualidade</a>.`)}

        <h4>Quando tudo dá errado</h4>
        <p>Se o time inteiro cair, você acorda na praça do <b>Centro Pokémon</b>. A Enfermeira
        Joy cura de graça; sair de lá é escolher outra área no Mapa. Detalhes em
        <a data-cap="morte">Desmaiar</a>.</p>

        <h4>O menu</h4>
        <p>Os botões do topo, e o capítulo desta Wiki que explica cada um:</p>
        ${tabela(
          ['Botão', 'O que abre'],
          `<tr><td><b>Pokédex</b></td><td>as espécies, as fichas, o registro de shinys e o Top Catch da semana — <a data-cap="pokedex">Pokédex</a></td></tr>
           <tr><td><b>Mapa</b></td><td>onde caçar — <a data-cap="mapa">Mapa e Hunt Analyser</a></td></tr>
           <tr><td><b>Market</b></td><td>o balcão do NPC: bolas, poções e ovos — <a data-cap="market">Market</a></td></tr>
           <tr><td><b>Passe</b></td><td>a trilha de 30 dias de login — <a data-cap="passe">Passe de Batalha</a></td></tr>
           <tr><td><b>Ranks</b></td><td>os placares do servidor — <a data-cap="ranking">Ranking</a></td></tr>
           <tr><td><b>Boss</b></td><td>as arenas de boss — <a data-cap="bosses">Bosses</a></td></tr>
           <tr><td><b>PvP</b></td><td>Ranqueado, Guild e Treinamento — <a data-cap="pvp">PvP Ranqueado</a></td></tr>
           <tr><td><b>Ginásio</b></td><td>os 18 pódios por tipo — <a data-cap="ginasios">Ginásios</a></td></tr>
           <tr><td><b>Torneio</b></td><td>os torneios: o Mundial e o Amador, com prêmio em dinheiro, e o Showdown semanal, com prêmio em diamante — <a data-cap="campeonato">Campeonatos</a> e <a data-cap="showdown">Showdown</a></td></tr>
           <tr><td><b>RMT</b></td><td>o Mercado da Comunidade, o depósito e o saque de Gemas — <a data-cap="comunidade">Mercado da Comunidade</a></td></tr>
           <tr><td><b>Casa</b></td><td>as suas casas e o XP Share — <a data-cap="casa">Casa e XP Share</a></td></tr>
           <tr><td><b>Shop</b></td><td>a Loja de diamantes — <a data-cap="loja">Loja de Diamantes</a></td></tr>
           <tr><td><b>Wiki</b></td><td>este manual</td></tr>`,
        )}
        <p>A <b>Mochila</b> (o inventário) abre pelo botão dela e mostra os <b>bolsos</b>:
        <b>Treinador</b> (bolas, poções e revives), <b>Itens Raros</b> (tickets, etiquetas, bicicletas,
        ovos, Z-Moves), <b>Pedras</b>, <b>Skins</b>, <b>Oferenda</b>, <b>Chocadeira</b> e <b>Coleção</b>.
        Um toque abre o bolso; o <b>‹</b> do topo volta para a Mochila.</p>

        <h4>Conversar</h4>
        <p>Os quatro canais do chat, a Lista de Amigos, as mensagens privadas e o chat de
        negociação com vendedores estão em <a data-cap="chat">Chat, amigos e Comércio</a>.</p>

        <h4>Conta e Termos</h4>
        <ul>
          <li>O PokeIdle é <b>só para maiores de 18 anos</b>. No cadastro, a caixa "Tenho 18 anos ou mais e
          li e aceito os Termos de Uso e a Política de Privacidade" é obrigatória.</li>
          <li>Quando os <a href="/terms" target="_blank" rel="noopener">Termos</a> mudam, quem já tem conta
          vê o aviso <b>"Atualizamos nossos Termos"</b> no login e só joga depois de <b>Aceitar</b>;
          <b>Recusar</b> volta para a tela de entrada.</li>
          <li>O e-mail de uma conta nova <b>não aceita "+"</b> (o apelido de caixa, tipo
          <code>nome+1@gmail.com</code>): use o endereço principal. Quem já tinha conta com "+" continua
          entrando normalmente.</li>
          <li><b>Cookies:</b> os de propaganda e de medição só carregam depois que você toca em
          <b>Aceitar</b> na faixa do rodapé; <b>Recusar</b> não tira nada do jogo. A escolha pode ser
          mudada a qualquer hora, pela seção de cookies dos Termos.</li>
          <li>Conta banida vê o <b>motivo</b> ao tentar entrar. Achou que foi engano? Peça <b>revisão</b> pelo
          e-mail de contato ou por ticket no Discord (#open-ticket) — a resposta vem em até <b>15 dias</b>.</li>
        </ul>
`,
      en: `
        <p>Pokéidle is an <b>idle game</b>: your pokémon fights on its own. You choose where to
        hunt, with whom, and what to do with the loot. The game runs while the tab is open.</p>

        <h4>The core loop</h4>
        <ol class="wk-passos">
          <li><b>Open the Map</b> and pick an area. Each one has a recommended level — that of
          the strongest species spawning there. Areas above your level stay locked.</li>
          <li><b>Your active pokémon</b> walks to the nearest wild and starts hitting it. You
          click nothing during the fight.</li>
          <li><b>Once knocked down, the wild becomes a body</b> and stays on the ground for
          <b>30 seconds</b>. That is the window to throw a ball — and that is how you actually
          catch things (see <a data-cap="captura">Catching</a>).</li>
          <li><b>Gold</b> from each defeat goes straight in — already with the <b>loot bonus</b> (see
          <a data-cap="combate">Combat</a>). What drops — the evolution stone of the pokémon's types
          and the rare drops — goes to the <b>Backpack</b>.</li>
        </ol>

        <h4>Your team</h4>
        <p>The team holds <b>${c.d.maxEquipe}</b> pokémon. Anything caught with a full team drops
        into the <b>Depot</b>, which has no limit. Only one fights at a time — the <b>active</b>
        one — and when it faints the next team member steps in automatically.</p>

        ${nota(`<b>The starter is not rolled like the others.</b> It is born with a quality and
        IV floor precisely so it can survive the first hunt. A caught pokémon spins the full
        wheel — see <a data-cap="stats">Stats and Quality</a>.`)}

        <h4>When it all goes wrong</h4>
        <p>If the whole team falls, you wake up in the <b>Pokémon Center</b> square. Nurse Joy
        heals for free; leaving means picking another area on the Map. Details in
        <a data-cap="morte">Fainting</a>.</p>

        <h4>The menu</h4>
        <p>The top buttons, and the chapter of this Wiki that explains each one:</p>
        ${tabela(
          ['Button', 'What it opens'],
          `<tr><td><b>Pokédex</b></td><td>the species, their sheets, the shiny registry and the weekly Top Catch — <a data-cap="pokedex">Pokédex</a></td></tr>
           <tr><td><b>Map</b></td><td>where to hunt — <a data-cap="mapa">Map and Hunt Analyser</a></td></tr>
           <tr><td><b>Market</b></td><td>the NPC counter: balls, potions and eggs — <a data-cap="market">Market</a></td></tr>
           <tr><td><b>Pass</b></td><td>the 30-day login track — <a data-cap="passe">Battle Pass</a></td></tr>
           <tr><td><b>Ranks</b></td><td>the server leaderboards — <a data-cap="ranking">Ranking</a></td></tr>
           <tr><td><b>Boss</b></td><td>the boss arenas — <a data-cap="bosses">Bosses</a></td></tr>
           <tr><td><b>PvP</b></td><td>Ranked, Guild and Training — <a data-cap="pvp">Ranked PvP</a></td></tr>
           <tr><td><b>Gym</b></td><td>the 18 podiums by type — <a data-cap="ginasios">Gyms</a></td></tr>
           <tr><td><b>Tournament</b></td><td>the tournaments: World and Amateur, with real-money prizes, and the weekly Showdown, with diamond prizes — <a data-cap="campeonato">Championships</a> and <a data-cap="showdown">Showdown</a></td></tr>
           <tr><td><b>RMT</b></td><td>the Community Market, and Gem deposits and withdrawals — <a data-cap="comunidade">Community Market</a></td></tr>
           <tr><td><b>House</b></td><td>your houses and XP Share — <a data-cap="casa">House &amp; XP Share</a></td></tr>
           <tr><td><b>Shop</b></td><td>the diamond Shop — <a data-cap="loja">Diamond Shop</a></td></tr>
           <tr><td><b>Wiki</b></td><td>this manual</td></tr>`,
        )}
        <p>The <b>Backpack</b> (your inventory) opens from its button and shows the <b>pockets</b>:
        <b>Trainer</b> (balls, potions and revives), <b>Rare Items</b> (tickets, tags, bicycles, eggs,
        Z-Moves), <b>Stones</b>, <b>Skins</b>, <b>Offering</b>, <b>Incubator</b> and <b>Collection</b>.
        A tap opens the pocket; the <b>‹</b> at the top goes back to the Backpack.</p>

        <h4>Talking</h4>
        <p>The four chat channels, the Friends List, private messages and the negotiation chat with
        sellers are in <a data-cap="chat">Chat, friends and Trade</a>.</p>

        <h4>Account and Terms</h4>
        <ul>
          <li>PokeIdle is <b>for adults only (18+)</b>. At sign-up, the box "I am 18 or older and I have
          read and accept the Terms of Use and the Privacy Policy" is required.</li>
          <li>When the <a href="/terms" target="_blank" rel="noopener">Terms</a> change, existing accounts
          see <b>"We updated our Terms"</b> at login and only play after tapping <b>Accept</b>;
          <b>Decline</b> goes back to the sign-in screen.</li>
          <li>A new account's e-mail <b>can't contain "+"</b> (the inbox alias, like
          <code>name+1@gmail.com</code>): use the main address. Accounts that already had a "+" keep
          signing in as usual.</li>
          <li><b>Cookies:</b> advertising and measurement cookies only load after you tap <b>Accept</b> on
          the footer banner; <b>Decline</b> takes nothing away from the game. You can change your choice
          any time from the cookies section of the Terms.</li>
          <li>A banned account sees the <b>reason</b> when trying to sign in. Think it was a mistake? Ask
          for a <b>review</b> by the contact e-mail or by ticket on Discord (#open-ticket) — the answer
          comes within <b>15 days</b>.</li>
        </ul>
`,
      es: `
        <p>Pokéidle es un <b>idle</b>: tu pokémon pelea solo. Tú eliges dónde cazar, con quién y
        qué hacer con lo que caiga. El juego sigue mientras la pestaña esté abierta.</p>

        <h4>El bucle de siempre</h4>
        <ol class="wk-passos">
          <li><b>Abre el Mapa</b> y elige una zona. Cada una tiene un nivel recomendado — el del
          pokémon más fuerte que aparece allí. Las zonas por encima de tu nivel están bloqueadas.</li>
          <li><b>Tu pokémon activo</b> camina hasta el salvaje más cercano y empieza a golpear.
          No haces clic en nada durante el combate.</li>
          <li><b>Al caer, el salvaje queda como cuerpo</b> durante <b>30 segundos</b>. Ese es el
          momento de lanzar la poké ball — y así es como se captura de verdad
          (ver <a data-cap="captura">Captura</a>).</li>
          <li><b>El oro</b> de cada derrota entra directo — ya con el <b>bono de loot</b> (ver
          <a data-cap="combate">Combate</a>). Lo que cae — la piedra evolutiva de los tipos del
          pokémon y los drops raros — va a la <b>Mochila</b>.</li>
        </ol>

        <h4>Tu equipo</h4>
        <p>Caben <b>${c.d.maxEquipe}</b> pokémon en el equipo. Lo que captures con el equipo lleno
        cae en el <b>Depot</b>, que no tiene límite. Solo uno pelea a la vez — el <b>activo</b> — y
        cuando se debilita entra el siguiente automáticamente.</p>

        ${nota(`<b>El inicial no se sortea como los demás.</b> Nace con un mínimo de calidad e IV
        justamente para aguantar la primera cacería. Un pokémon capturado gira la ruleta
        completa — ver <a data-cap="stats">Stats y Calidad</a>.`)}

        <h4>Cuando todo sale mal</h4>
        <p>Si cae el equipo entero, despiertas en la plaza del <b>Centro Pokémon</b>. La Enfermera
        Joy cura gratis; salir de allí es elegir otra zona en el Mapa. Detalles en
        <a data-cap="morte">Debilitarse</a>.</p>

        <h4>El menú</h4>
        <p>Los botones de arriba, y el capítulo de esta Wiki que explica cada uno:</p>
        ${tabela(
          ['Botón', 'Qué abre'],
          `<tr><td><b>Pokédex</b></td><td>las especies, sus fichas, el registro de shinys y el Top Captura de la semana — <a data-cap="pokedex">Pokédex</a></td></tr>
           <tr><td><b>Mapa</b></td><td>dónde cazar — <a data-cap="mapa">Mapa y Hunt Analyser</a></td></tr>
           <tr><td><b>Market</b></td><td>el mostrador del NPC: balls, pociones y huevos — <a data-cap="market">Market</a></td></tr>
           <tr><td><b>Pase</b></td><td>el recorrido de 30 días de login — <a data-cap="passe">Pase de Batalla</a></td></tr>
           <tr><td><b>Ranks</b></td><td>las clasificaciones del servidor — <a data-cap="ranking">Ranking</a></td></tr>
           <tr><td><b>Boss</b></td><td>las arenas de boss — <a data-cap="bosses">Bosses</a></td></tr>
           <tr><td><b>PvP</b></td><td>Clasificatorio, Guild y Entrenamiento — <a data-cap="pvp">PvP Clasificatorio</a></td></tr>
           <tr><td><b>Gimnasio</b></td><td>los 18 podios por tipo — <a data-cap="ginasios">Gimnasios</a></td></tr>
           <tr><td><b>Torneo</b></td><td>los torneos: el Mundial y el Amateur, con premio en dinero, y el Showdown semanal, con premio en diamantes — <a data-cap="campeonato">Campeonatos</a> y <a data-cap="showdown">Showdown</a></td></tr>
           <tr><td><b>RMT</b></td><td>el Mercado de la Comunidad, el depósito y el retiro de Gemas — <a data-cap="comunidade">Mercado de la Comunidad</a></td></tr>
           <tr><td><b>Casa</b></td><td>tus casas y el XP Share — <a data-cap="casa">Casa y XP Share</a></td></tr>
           <tr><td><b>Tienda</b></td><td>la Tienda de diamantes — <a data-cap="loja">Tienda de Diamantes</a></td></tr>
           <tr><td><b>Wiki</b></td><td>este manual</td></tr>`,
        )}
        <p>La <b>Mochila</b> (el inventario) se abre por su botón y muestra los <b>bolsillos</b>:
        <b>Entrenador</b> (balls, pociones y revivires), <b>Objetos Raros</b> (tickets, etiquetas,
        bicicletas, huevos, Z-Moves), <b>Piedras</b>, <b>Skins</b>, <b>Ofrenda</b>, <b>Incubadora</b> y
        <b>Colección</b>. Un toque abre el bolsillo; la <b>‹</b> de arriba vuelve a la Mochila.</p>

        <h4>Conversar</h4>
        <p>Los cuatro canales del chat, la Lista de Amigos, los mensajes privados y el chat de
        negociación con vendedores están en <a data-cap="chat">Chat, amigos y Comercio</a>.</p>

        <h4>Cuenta y Términos</h4>
        <ul>
          <li>PokeIdle es <b>solo para mayores de 18 años</b>. En el registro, la casilla "Tengo 18 años o
          más y he leído y acepto los Términos de Uso y la Política de Privacidad" es obligatoria.</li>
          <li>Cuando los <a href="/terms" target="_blank" rel="noopener">Términos</a> cambian, quien ya tiene
          cuenta ve el aviso <b>"Actualizamos nuestros Términos"</b> al entrar y solo juega después de
          <b>Aceptar</b>; <b>Rechazar</b> vuelve a la pantalla de entrada.</li>
          <li>El correo de una cuenta nueva <b>no acepta "+"</b> (el alias del buzón, como
          <code>nombre+1@gmail.com</code>): usa la dirección principal. Quien ya tenía cuenta con "+" sigue
          entrando normalmente.</li>
          <li><b>Cookies:</b> las de publicidad y de medición solo cargan después de que tocas <b>Aceptar</b>
          en la franja del pie de página; <b>Rechazar</b> no le quita nada al juego. Puedes cambiar la
          elección cuando quieras, en la sección de cookies de los Términos.</li>
          <li>Una cuenta baneada ve el <b>motivo</b> al intentar entrar. ¿Crees que fue un error? Pide una
          <b>revisión</b> por el correo de contacto o por ticket en Discord (#open-ticket) — la respuesta
          llega en hasta <b>15 días</b>.</li>
        </ul>
`,
    }),
  },

  // ------------------------------------------------------------- 2. níveis
  {
    id: 'niveis',
    titulo: { pt: 'Níveis e XP', en: 'Levels and XP', es: 'Niveles y XP' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>Há <b>dois níveis independentes</b>: o do <b>treinador</b> (você) e o do <b>pokémon
        ativo</b>. Cada derrota paga o mesmo XP para os dois, e cada um sobe na própria conta.</p>
        <ul>
          <li>O nível do <b>treinador</b> é o que <b>destranca as áreas</b> do Mapa.</li>
          <li>O nível do <b>pokémon</b> é o que faz os stats dele crescerem — e ele
          <b>cura por completo</b> a cada nível novo.</li>
        </ul>

        <h4>O pokémon passa do treinador em até ${FOLGA_NIVEL_POKEMON} níveis</h4>
        <p>Um pokémon só entra em campo se estiver no máximo <b>${FOLGA_NIVEL_POKEMON} níveis acima</b> do
        seu treinador — o inicial é a exceção e sempre entra. Um Nv 60 pede treinador Nv
        ${60 - FOLGA_NIVEL_POKEMON}. Com um bicho alto demais (comprado no Mercado, por exemplo), dá para
        esperar o treinador subir ou usar <b>Reduzir o nível</b>, na ficha do pokémon: você escolhe o
        nível novo — o piso é o <b>Nível ao capturar</b> da espécie —, o XP volta para o começo dele e
        não tem como desfazer.</p>

        <h4>A curva</h4>
        <p>É cúbica, e não tem teto. Subir sempre custa mais que o nível anterior:</p>
        <pre class="wk-formula">xpTotal(L) = arred( 50/3 × (L³ − 6L² + 17L − 12) )</pre>
        ${tabelaDeXp(c)}
        ${nota(`<b>Não existe nível máximo.</b> A curva só fica mais cara — ${ULTIMA_REGIAO.rotulo.pt}, a
        última aba do Mapa, abre no <b>nv ${N(ULTIMA_REGIAO.nivel, c.lang)}</b> do treinador${huntMaisAlta(c)
          ? `, e a hunt mais alta de hoje pede <b>nv ${N(huntMaisAlta(c), c.lang)}</b>` : ''}. Um
        pokémon nível 1000 já é caro; o topo do Mapa é meta de fim de jogo, não de primeira
        semana.`)}

        <h4>O que multiplica o seu XP</h4>
        <ul>
          <li><b>XP Boost</b> — +50% no XP do TREINADOR.</li>
          <li><b>XP Boost Pokémon</b> — +50% no XP do POKÉMON.</li>
          <li><b>VIP</b> — +50% nos dois.</li>
          <li><b>Boost da Guild</b> — +${BOOST_GUILD.pct}% nos dois, para a guild INTEIRA: os membros enchem
          juntos o banco da guild. Ver <a data-cap="guild">Guilds</a>.</li>
          <li><b>Bônus do ranking da guild</b> — de +${BONUS_RANKING_GP.resto}% a +${BONUS_RANKING_GP[1]}%
          nos dois (e no loot), para os escalados, pela posição da guild no Guild Diário. Ver
          <a data-cap="guild">Guilds</a>.</li>
          <li><b>Bônus Twitch</b> — +${D(PCT_TWITCH, 'pt')}% nos dois enquanto você assiste a uma live
          oficial, e +${D(PCT_TWITCH_EXTRA, 'pt')}% por live a mais aberta junto.</li>
          <li><b>Bônus na Kick</b> — +${D(PCT_KICK, 'pt')}% nos dois, por hora resgatada com pontos do
          canal. Os dois em <a data-cap="bonusLive">Bônus de live</a>.</li>
          <li><b>Boost dos Atrasados</b> — ×${ATRASADOS.mult} nos dois, até o seu treinador chegar ao nível
          dos veteranos. Ver <a data-cap="atrasados">Boost dos Atrasados</a>.</li>
          <li><b>Eventos</b> — o buff de XP de um evento entra por cima de tudo isso.</li>
        </ul>
        <p>Eles se <b>multiplicam</b>, não se somam: VIP + XP Boost dá <b>2,25×</b>, e não 2×.
        São compras separadas, e somar faria a segunda valer menos que a primeira justamente
        para quem gastou mais. Ver <a data-cap="loja">Loja de Diamantes</a>.</p>`,
      en: `
        <p>There are <b>two independent levels</b>: the <b>trainer's</b> (yours) and the
        <b>active pokémon's</b>. Every kill pays the same XP to both, and each climbs its own
        curve.</p>
        <ul>
          <li>The <b>trainer</b> level is what <b>unlocks Map areas</b>.</li>
          <li>The <b>pokémon</b> level is what grows its stats — and it <b>fully heals</b> on
          every level-up.</li>
        </ul>

        <h4>A pokémon can be up to ${FOLGA_NIVEL_POKEMON} levels above the trainer</h4>
        <p>A pokémon only takes the field if it is at most <b>${FOLGA_NIVEL_POKEMON} levels above</b> your
        trainer — the starter is the exception and always gets in. A Lv 60 needs a Lv
        ${60 - FOLGA_NIVEL_POKEMON} trainer. With a pokémon that is too high (bought on the Market, for
        example), you can wait for the trainer to level up or use <b>Lower the level</b> on the pokémon's
        sheet: you pick the new level — the floor is the species' <b>Level when caught</b> —, its XP
        goes back to the start of that level, and it cannot be undone.</p>

        <h4>The curve</h4>
        <p>It is cubic, and there is no cap. Every level costs more than the last:</p>
        <pre class="wk-formula">totalXp(L) = round( 50/3 × (L³ − 6L² + 17L − 12) )</pre>
        ${tabelaDeXp(c)}
        ${nota(`<b>There is no level cap.</b> The curve just gets more expensive — ${ULTIMA_REGIAO.rotulo.en},
        the last Map tab, unlocks at trainer <b>Lv ${N(ULTIMA_REGIAO.nivel, c.lang)}</b>${huntMaisAlta(c)
          ? `, and today's highest hunt asks for <b>Lv ${N(huntMaisAlta(c), c.lang)}</b>` : ''}.
        Level 1000 is already costly; the top of the Map is endgame, not week one.`)}

        <h4>What multiplies your XP</h4>
        <ul>
          <li><b>XP Boost</b> — +50% to TRAINER XP.</li>
          <li><b>Pokémon XP Boost</b> — +50% to POKÉMON XP.</li>
          <li><b>VIP</b> — +50% to both.</li>
          <li><b>Guild Boost</b> — +${BOOST_GUILD.pct}% to both, for the WHOLE guild: the members fill the
          guild bank together. See <a data-cap="guild">Guilds</a>.</li>
          <li><b>Guild ranking bonus</b> — from +${BONUS_RANKING_GP.resto}% to +${BONUS_RANKING_GP[1]}% to
          both (and to loot), for the rostered members, by the guild's place on the Daily Guild board.
          See <a data-cap="guild">Guilds</a>.</li>
          <li><b>Twitch Bonus</b> — +${D(PCT_TWITCH, 'en')}% to both while you watch an official live,
          and +${D(PCT_TWITCH_EXTRA, 'en')}% for each extra live open at the same time.</li>
          <li><b>Kick Bonus</b> — +${D(PCT_KICK, 'en')}% to both, per hour redeemed with channel points.
          Both in <a data-cap="bonusLive">Live bonuses</a>.</li>
          <li><b>Late Joiner Boost</b> — ×${ATRASADOS.mult} to both, until your trainer reaches the
          veterans' level. See <a data-cap="atrasados">Late Joiner Boost</a>.</li>
          <li><b>Events</b> — an event's XP buff goes on top of all of this.</li>
        </ul>
        <p>They <b>multiply</b> rather than add: VIP + XP Boost is <b>2.25×</b>, not 2×. They are
        separate purchases, and adding them would make the second one worth less than the first
        precisely for whoever spent more. See <a data-cap="loja">Diamond Shop</a>.</p>`,
      es: `
        <p>Hay <b>dos niveles independientes</b>: el del <b>entrenador</b> (tú) y el del
        <b>pokémon activo</b>. Cada derrota paga el mismo XP a los dos, y cada uno sube por su
        cuenta.</p>
        <ul>
          <li>El nivel del <b>entrenador</b> es el que <b>desbloquea las zonas</b> del Mapa.</li>
          <li>El nivel del <b>pokémon</b> es el que hace crecer sus stats — y se <b>cura por
          completo</b> en cada nivel nuevo.</li>
        </ul>

        <h4>El pokémon pasa al entrenador en hasta ${FOLGA_NIVEL_POKEMON} niveles</h4>
        <p>Un pokémon solo entra al campo si está como mucho <b>${FOLGA_NIVEL_POKEMON} niveles por encima</b>
        de tu entrenador — el inicial es la excepción y siempre entra. Un Nv 60 pide entrenador Nv
        ${60 - FOLGA_NIVEL_POKEMON}. Con un bicho demasiado alto (comprado en el Mercado, por ejemplo), se
        puede esperar a que suba el entrenador o usar <b>Reducir el nivel</b>, en la ficha del pokémon:
        eliges el nivel nuevo — el piso es el <b>Nivel al capturar</b> de la especie —, el XP vuelve al
        comienzo de ese nivel y no se puede deshacer.</p>

        <h4>La curva</h4>
        <p>Es cúbica y no tiene tope. Subir siempre cuesta más que el nivel anterior:</p>
        <pre class="wk-formula">xpTotal(L) = redondear( 50/3 × (L³ − 6L² + 17L − 12) )</pre>
        ${tabelaDeXp(c)}
        ${nota(`<b>No existe nivel máximo.</b> La curva solo se encarece — ${ULTIMA_REGIAO.rotulo.es}, la
        última pestaña del Mapa, se abre en <b>nv ${N(ULTIMA_REGIAO.nivel, c.lang)}</b> del
        entrenador${huntMaisAlta(c)
          ? `, y la cacería más alta de hoy pide <b>nv ${N(huntMaisAlta(c), c.lang)}</b>` : ''}. Nivel
        1000 ya es caro; la cima del Mapa es meta de final de juego, no de la primera semana.`)}

        <h4>Qué multiplica tu XP</h4>
        <ul>
          <li><b>XP Boost</b> — +50% al XP del ENTRENADOR.</li>
          <li><b>XP Boost Pokémon</b> — +50% al XP del POKÉMON.</li>
          <li><b>VIP</b> — +50% a los dos.</li>
          <li><b>Boost de la Guild</b> — +${BOOST_GUILD.pct}% a los dos, para TODA la guild: los miembros
          llenan juntos el banco de la guild. Ver <a data-cap="guild">Guilds</a>.</li>
          <li><b>Bono del ranking de la guild</b> — de +${BONUS_RANKING_GP.resto}% a +${BONUS_RANKING_GP[1]}%
          a los dos (y al loot), para los convocados, según la posición de la guild en el Guild Diario.
          Ver <a data-cap="guild">Guilds</a>.</li>
          <li><b>Bono Twitch</b> — +${D(PCT_TWITCH, 'es')}% a los dos mientras miras un directo oficial,
          y +${D(PCT_TWITCH_EXTRA, 'es')}% por cada directo más abierto a la vez.</li>
          <li><b>Bono en Kick</b> — +${D(PCT_KICK, 'es')}% a los dos, por hora canjeada con puntos del
          canal. Los dos en <a data-cap="bonusLive">Bonos de directo</a>.</li>
          <li><b>Boost de los Rezagados</b> — ×${ATRASADOS.mult} en los dos, hasta que tu entrenador
          alcance el nivel de los veteranos. Ver <a data-cap="atrasados">Boost de los Rezagados</a>.</li>
          <li><b>Eventos</b> — el buff de XP de un evento va encima de todo esto.</li>
        </ul>
        <p>Se <b>multiplican</b>, no se suman: VIP + XP Boost da <b>2,25×</b>, no 2×. Son compras
        distintas, y sumarlas haría que la segunda valiera menos que la primera justamente para
        quien más gastó. Ver <a data-cap="loja">Tienda de Diamantes</a>.</p>`,
    }),
  },

  // ------------------------------------------------------ 2b. bônus de live
  //
  // Twitch e Kick lado a lado: são dois bônus diferentes (um vale ENQUANTO se assiste, o outro é
  // hora comprada com pontos do canal), e os dois multiplicam com o resto. Os percentuais vêm do
  // snapshot do jogador (`eu.twitch`, `eu.kick`) quando ele está logado, e das constantes do topo
  // do arquivo antes disso.
  {
    id: 'bonusLive',
    titulo: { pt: 'Bônus de live: Twitch e Kick', en: 'Live bonuses: Twitch and Kick', es: 'Bonos de directo: Twitch y Kick' },
    grupo: 'basico',
    html: (c) => {
      const tw = c.d.eu?.twitch ?? {};
      const pct = Number(tw.pct) || PCT_TWITCH;
      const extra = Number(tw.extra) || PCT_TWITCH_EXTRA;
      const pctK = c.d.eu?.kick?.pct ?? PCT_KICK;
      const d2 = D(pct + extra, c.lang);
      const d3 = D(pct + 2 * extra, c.lang);
      const ex = D(extra, c.lang);
      const comKick = D(2 * (1 + pctK / 100), c.lang);
      return {
        pt: `
        <p>Os <b>Streamers Oficiais</b> do PokéIdle fazem live na <b>Twitch</b> e na <b>Kick</b>, e
        assistir rende bônus no jogo. São dois bônus diferentes, cada um com a sua linha no
        <b>painel do treinador</b> (junto do VIP e dos boosts) — e os dois se <b>multiplicam</b> entre
        si e com VIP, boosts, guild e eventos (ver <a data-cap="niveis">Níveis e XP</a>).</p>

        <h4>Bônus Twitch — enquanto você assiste</h4>
        <ol class="wk-passos">
          <li>Clique em <b>Conectar Twitch</b> no painel e vincule a sua conta da Twitch.</li>
          <li>Abra a live de qualquer canal da lista de <b>Streamers Oficiais</b> (quem está ao vivo
          aparece em verde, com o número de espectadores) e assista <b>logado</b> na Twitch.</li>
          <li>Em alguns minutos a linha acende: <b>+${D(pct, c.lang)}% de XP</b> do treinador e do
          pokémon, enquanto você estiver na live.</li>
        </ol>
        <p><b>As lives se somam:</b> cada live oficial a mais aberta ao mesmo tempo soma
        <b>+${ex}%</b> — duas dão <b>${d2}%</b>, três dão <b>${d3}%</b>. Um ponto vermelho na linha
        avisa quando há uma live oficial no ar que você ainda não abriu.</p>
        ${nota(`"Assistir" é estar no <b>chat</b> da live, logado. A Twitch não conta ao jogo quem
        está vendo — só quem está conectado ao chat, mesmo sem digitar. Quem abre a live deslogado
        não aparece na lista, e o bônus não liga. A lista é conferida a cada minuto, então o bônus
        também desliga sozinho alguns minutos depois de você sair.`)}

        <h4>Bônus na Kick — horas compradas com pontos do canal</h4>
        <p>Na Kick o caminho é outro. Assistindo logado, você junta os <b>pontos do canal</b> que a
        própria Kick dá (10 a cada 5 minutos; assinante ganha o dobro) e troca os pontos por
        <b>horas de bônus</b> no jogo, nas recompensas que todo canal oficial tem:</p>
        ${tabelaKick(c)}
        <ul>
          <li><b>Vincule antes:</b> clique na linha <b>Bônus na Kick</b> do painel e em <b>Vincular
          Kick</b>. O vínculo é <b>para sempre</b> — uma conta da Kick por treinador —, então entre
          com a sua conta principal da Kick.</li>
          <li>Na live, abra os pontos do canal e resgate. Em segundos o bônus aparece no painel, com
          a contagem regressiva.</li>
          <li>As horas <b>se somam</b>: resgatar o mesmo bônus três vezes (no mesmo canal ou em canais
          diferentes) dá três horas. O percentual não sobe — o que cresce é o prazo.</li>
          <li>Resgatou sem ter vinculado? O resgate é recusado e a Kick <b>devolve os pontos</b>.</li>
        </ul>
        ${nota(`O +${D(pctK, c.lang)}% de captura e o de shiny da Kick <b>multiplicam</b> o boost da
        Loja: Capture Boost (×2) mais o da Kick dá <b>×${comKick}</b> na chance de captura, e o mesmo
        vale para o Shiny Secret Lure. O teto de cada chance continua valendo por cima.`, 'dica')}

        <h4>Quer ser Streamer Oficial?</h4>
        <p>A sua live entra na lista oficial e passa a render bônus para quem assistir — na Twitch, o
        +${D(pct, c.lang)}%; na Kick, as recompensas do canal. Chame a gente no Discord.</p>`,
        en: `
        <p>PokéIdle's <b>Official Streamers</b> go live on <b>Twitch</b> and <b>Kick</b>, and watching
        pays a bonus in the game. They are two different bonuses, each with its own line on the
        <b>trainer panel</b> (next to VIP and the boosts) — and both <b>multiply</b> with each other
        and with VIP, boosts, guild and events (see <a data-cap="niveis">Levels and XP</a>).</p>

        <h4>Twitch Bonus — while you watch</h4>
        <ol class="wk-passos">
          <li>Click <b>Connect Twitch</b> on the panel and link your Twitch account.</li>
          <li>Open the live of any channel on the <b>Official Streamers</b> list (whoever is live
          shows in green, with the viewer count) and watch <b>logged in</b> to Twitch.</li>
          <li>Within a few minutes the line lights up: <b>+${D(pct, c.lang)}% XP</b> for the trainer
          and the pokémon, while you stay on the live.</li>
        </ol>
        <p><b>Lives add up:</b> each extra official live open at the same time adds
        <b>+${ex}%</b> — two give <b>${d2}%</b>, three give <b>${d3}%</b>. A red dot on the line tells
        you when an official live is on that you haven't opened yet.</p>
        ${nota(`"Watching" means being in the live's <b>chat</b>, logged in. Twitch doesn't tell the
        game who is viewing — only who is connected to the chat, even without typing. Whoever opens
        the live logged out is not on the list, and the bonus doesn't turn on. The list is checked
        every minute, so the bonus also turns itself off a few minutes after you leave.`)}

        <h4>Kick Bonus — hours bought with channel points</h4>
        <p>On Kick it works differently. Watching logged in, you earn the <b>channel points</b> Kick
        itself hands out (10 every 5 minutes; subscribers get double) and trade them for <b>bonus
        hours</b> in the game, through the rewards every official channel has:</p>
        ${tabelaKick(c)}
        <ul>
          <li><b>Link first:</b> click the <b>Kick Bonus</b> line on the panel and <b>Link Kick</b>.
          The link is <b>forever</b> — one Kick account per trainer — so log in with your main Kick
          account.</li>
          <li>On the live, open the channel points and redeem. Within seconds the bonus shows on the
          panel, with its countdown.</li>
          <li>Hours <b>add up</b>: redeeming the same bonus three times (on the same channel or on
          different ones) gives three hours. The percentage doesn't grow — the duration does.</li>
          <li>Redeemed without linking? The redemption is refused and Kick <b>refunds the
          points</b>.</li>
        </ul>
        ${nota(`Kick's +${D(pctK, c.lang)}% catch and shiny bonuses <b>multiply</b> the Shop's boost:
        Capture Boost (×2) plus Kick's gives <b>×${comKick}</b> on the catch chance, and the same goes
        for the Shiny Secret Lure. Each chance's cap still applies on top.`, 'dica')}

        <h4>Want to be an Official Streamer?</h4>
        <p>Your live joins the official list and starts paying a bonus to whoever watches — on
        Twitch, the +${D(pct, c.lang)}%; on Kick, the channel rewards. Reach out on Discord.</p>`,
        es: `
        <p>Los <b>Streamers Oficiales</b> de PokéIdle hacen directo en <b>Twitch</b> y en
        <b>Kick</b>, y mirar da bonos en el juego. Son dos bonos distintos, cada uno con su línea en
        el <b>panel del entrenador</b> (junto al VIP y los boosts) — y los dos se <b>multiplican</b>
        entre sí y con VIP, boosts, guild y eventos (ver <a data-cap="niveis">Niveles y XP</a>).</p>

        <h4>Bono Twitch — mientras miras</h4>
        <ol class="wk-passos">
          <li>Pulsa <b>Conectar Twitch</b> en el panel y vincula tu cuenta de Twitch.</li>
          <li>Abre el directo de cualquier canal de la lista de <b>Streamers Oficiales</b> (quien
          está en vivo aparece en verde, con el número de espectadores) y mira con la sesión
          <b>iniciada</b> en Twitch.</li>
          <li>En unos minutos la línea se enciende: <b>+${D(pct, c.lang)}% de XP</b> del entrenador y
          del pokémon, mientras sigas en el directo.</li>
        </ol>
        <p><b>Los directos se suman:</b> cada directo oficial más abierto a la vez suma
        <b>+${ex}%</b> — dos dan <b>${d2}%</b>, tres dan <b>${d3}%</b>. Un punto rojo en la línea
        avisa cuando hay un directo oficial que todavía no abriste.</p>
        ${nota(`"Mirar" es estar en el <b>chat</b> del directo, con la sesión iniciada. Twitch no le
        dice al juego quién está viendo — solo quién está conectado al chat, aunque no escriba. Quien
        abre el directo sin sesión no aparece en la lista, y el bono no se activa. La lista se revisa
        cada minuto, así que el bono también se apaga solo unos minutos después de que salgas.`)}

        <h4>Bono en Kick — horas compradas con puntos del canal</h4>
        <p>En Kick el camino es otro. Mirando con la sesión iniciada, juntas los <b>puntos del
        canal</b> que da la propia Kick (10 cada 5 minutos; los suscriptores, el doble) y los cambias
        por <b>horas de bono</b> en el juego, en las recompensas que tiene todo canal oficial:</p>
        ${tabelaKick(c)}
        <ul>
          <li><b>Vincula antes:</b> pulsa la línea <b>Bono en Kick</b> del panel y <b>Vincular
          Kick</b>. El vínculo es <b>para siempre</b> — una cuenta de Kick por entrenador —, así que
          entra con tu cuenta principal de Kick.</li>
          <li>En el directo, abre los puntos del canal y canjea. En segundos el bono aparece en el
          panel, con la cuenta atrás.</li>
          <li>Las horas <b>se suman</b>: canjear el mismo bono tres veces (en el mismo canal o en
          canales distintos) da tres horas. El porcentaje no sube — lo que crece es el plazo.</li>
          <li>¿Canjeaste sin vincular? El canje se rechaza y Kick <b>devuelve los puntos</b>.</li>
        </ul>
        ${nota(`El +${D(pctK, c.lang)}% de captura y el de shiny de Kick <b>multiplican</b> el boost de
        la Tienda: Capture Boost (×2) más el de Kick da <b>×${comKick}</b> en la probabilidad de
        captura, y lo mismo vale para el Shiny Secret Lure. El tope de cada probabilidad sigue valiendo
        por encima.`, 'dica')}

        <h4>¿Quieres ser Streamer Oficial?</h4>
        <p>Tu directo entra en la lista oficial y empieza a dar bonos a quien mire — en Twitch, el
        +${D(pct, c.lang)}%; en Kick, las recompensas del canal. Escríbenos en Discord.</p>`,
      };
    },
  },

  // ------------------------------------------------ 2c. boost dos atrasados
  //
  // As regras inteiras do produto, com o porquê de cada uma — a Loja só resume e aponta para cá. Os
  // números saem de `shared/boost-atrasados.mjs` (o módulo que a vitrine e o servidor usam para
  // cobrar), o alvo de hoje do snapshot (`eu.loja.alvoAtrasados`) e, sem login, do exemplo de
  // `ALVO_EXEMPLO_ATRASADOS`. O exemplo do abate que cruza o alvo é calculado por `ganhoAteOAlvo`, a
  // mesma conta do servidor.
  {
    id: 'atrasados',
    titulo: { pt: 'Boost dos Atrasados', en: 'Late Joiner Boost', es: 'Boost de los Rezagados' },
    grupo: 'basico',
    html: (c) => {
      const A = ATRASADOS;
      const n = (v) => N(v, c.lang);
      const loja = c.d.eu?.loja ?? {};
      const hoje = Number(loja.alvoAtrasados) || 0;
      const ativo = loja.atrasados ?? null;
      const nivel = Number(c.d.eu?.level) || 0;
      const precoMeu = hoje && nivel < hoje ? precoAtrasados(c.d.eu?.xp, hoje) : null;
      const alvo = hoje || ALVO_EXEMPLO_ATRASADOS;
      const xpAlvo = xpTotalDoNivel(alvo);
      const morte = Math.round(c.d.economia?.xpPerdidoPct ?? 10);

      // "x%" com uma casa abaixo de 10% (a curva cúbica deixa os primeiros níveis em 0,x%) e o
      // inteiro acima disso, com teto de 99 — 99,8% não vira "100%" num caminho que ainda não acabou.
      const pc = (v) => {
        const x = v * 100;
        if (x <= 0) return '0%';
        const s = x >= 10 ? String(Math.min(99, Math.round(x))) : x.toFixed(1);
        return `${c.lang === 'en' ? s : s.replace('.', ',')}%`;
      };
      const metade = Math.floor(alvo / 2);
      const metadeXp = pc(xpTotalDoNivel(metade) / xpAlvo);
      const marcos = [...new Set([1, Math.floor(alvo / 4), metade, Math.floor((3 * alvo) / 4), Math.floor(alvo * 0.9), alvo - 1])]
        .filter((L) => L >= 1 && L < alvo);
      const linhas = marcos.map((L) => `<tr>
          <td class="wk-num">${n(L)}</td>
          <td class="wk-num">${pc((L - 1) / (alvo - 1))}</td>
          <td class="wk-num">${pc(xpTotalDoNivel(L) / xpAlvo)}</td>
          <td class="wk-num">${n(precoAtrasados(xpTotalDoNivel(L), alvo))} 💎</td>
        </tr>`).join('');
      const cab = {
        pt: ['Seu nível', 'do caminho em níveis', 'do caminho em XP', 'Preço'],
        en: ['Your level', 'of the way in levels', 'of the way in XP', 'Price'],
        es: ['Tu nivel', 'del camino en niveles', 'del camino en XP', 'Precio'],
      }[c.lang];
      const tabelaPrecos = tabela(cab, linhas);

      // O abate que cruza o alvo: faltando `exFalta` de XP, um selvagem de `exBase` (sem outros bônus).
      const exFalta = 30;
      const exBase = 8;
      const exGanho = ganhoAteOAlvo(exBase, A.mult, A.mult, { alvo: 100, mult: A.mult }, 99, xpTotalDoNivel(100) - exFalta).treinador;
      const exDentro = exFalta / A.mult;
      const exFora = exBase - exDentro;

      const meu = {
        pt: ativo
          ? `O seu está <b>ligado</b>: XP ×${n(Number(ativo.mult) || A.mult)} até o <b>nv ${n(ativo.alvo)}</b>.`
          : precoMeu != null
            ? `Hoje o alvo é o <b>nv ${n(hoje)}</b>. Você está no nv ${n(nivel)}, e o seu preço agora é <b>${n(precoMeu)} 💎</b>.`
            : hoje ? `Hoje o alvo é o <b>nv ${n(hoje)}</b> — e você já está nele.` : '',
        en: ativo
          ? `Yours is <b>on</b>: XP ×${n(Number(ativo.mult) || A.mult)} up to <b>level ${n(ativo.alvo)}</b>.`
          : precoMeu != null
            ? `Today's target is <b>level ${n(hoje)}</b>. You are level ${n(nivel)}, and your price right now is <b>${n(precoMeu)} 💎</b>.`
            : hoje ? `Today's target is <b>level ${n(hoje)}</b> — and you are already there.` : '',
        es: ativo
          ? `El tuyo está <b>activo</b>: XP ×${n(Number(ativo.mult) || A.mult)} hasta el <b>nv ${n(ativo.alvo)}</b>.`
          : precoMeu != null
            ? `Hoy el objetivo es el <b>nv ${n(hoje)}</b>. Estás en el nv ${n(nivel)}, y tu precio ahora es <b>${n(precoMeu)} 💎</b>.`
            : hoje ? `Hoy el objetivo es el <b>nv ${n(hoje)}</b> — y ya estás en él.` : '',
      }[c.lang];
      const exemploDe = {
        pt: hoje ? `com o alvo de hoje (nv ${n(alvo)})` : `com o alvo de exemplo (nv ${n(alvo)}, a mediana de 6 de outubro de 2026)`,
        en: hoje ? `with today's target (level ${n(alvo)})` : `with an example target (level ${n(alvo)}, the median on October 6, 2026)`,
        es: hoje ? `con el objetivo de hoy (nv ${n(alvo)})` : `con un objetivo de ejemplo (nv ${n(alvo)}, la mediana del 6 de octubre de 2026)`,
      }[c.lang];

      return {
        pt: `
        <p>Quem entra num servidor que já tem meses chega numa conversa em andamento: os veteranos
        estão centenas de níveis acima, e as hunts deles estão fechadas para quem acabou de chegar. O
        <b>Boost dos Atrasados</b> encurta esse caminho, e só ele: <b>XP ×${n(A.mult)}</b>
        (${A.mult * 100}%) no treinador <b>e</b> nos pokémon, até o seu treinador alcançar o
        <b>nível dos veteranos</b>. Chegou lá, ele acaba sozinho.</p>
        ${meu ? nota(meu, 'dica') : ''}

        <h4>O nível-alvo: a mediana dos veteranos</h4>
        <ul>
          <li>É o nível do meio — a <b>mediana</b> — de quem jogou nos últimos <b>${n(A.diasAtivo)} dias</b>
          e tem conta há mais de <b>${n(A.diasConta)} dias</b>.</li>
          <li><b>Mediana, e não média</b>: a média seria puxada para cima pelos poucos jogadores de nível
          altíssimo.</li>
          <li><b>Só veteranos</b>: as contas novas da semana puxariam o número para baixo — quem chega
          quer alcançar quem já está jogando, e não quem chegou junto com ele.</li>
          <li><b>Recalculada todo dia</b>, às 00:00 de Brasília, numa conta só para o servidor inteiro.
          Quem chegar daqui a um ano vê o alvo daquele dia, e não um número congelado.</li>
          <li>Com menos de <b>${n(A.minimoAmostra)}</b> veteranos ativos não há mediana que diga alguma
          coisa, e o boost sai da Loja até haver.</li>
          <li>O alvo fica <b>gravado na compra</b>: se a mediana subir amanhã, o seu boost continua
          acabando no nível que a tela prometeu.</li>
        </ul>

        <h4>O preço: proporcional ao XP que falta</h4>
        <p>O caminho inteiro, do nível 1 ao alvo, custa <b>${n(A.precoCheio)} 💎</b>. Quem já andou uma
        parte paga só o que falta — medido em XP:</p>
        <pre class="wk-formula">preço = ${A.precoCheio} × (XP do alvo − seu XP) ÷ XP do alvo   (arredondado para cima; mínimo ${A.precoMinimo})</pre>
        <ul>
          <li><b>Em XP, e não em níveis</b>, porque a curva é cúbica (ver <a data-cap="niveis">Níveis e
          XP</a>): na metade do caminho em níveis (nv ${n(metade)} de ${n(alvo)}) você tem só
          <b>${metadeXp}</b> do XP. Os últimos níveis antes do alvo são a maior parte do tempo de jogo,
          e é esse tempo que o boost economiza.</li>
          <li><b>Mínimo de ${n(A.precoMinimo)} 💎</b>: um pedaço pequeno do caminho ainda custa isso — o
          ×${n(A.mult)} vale também para os pokémon, e por isso ele nunca sai quase de graça perto do
          alvo.</li>
          <li><b>O preço cheio não cresce com o tempo</b>: chegar ao nível dos veteranos custa o mesmo
          hoje e daqui a um ano, mesmo que o alvo de lá seja bem mais alto.</li>
        </ul>
        <p>Quanto custa ${exemploDe}:</p>
        ${tabelaPrecos}
        <p>O card fica na <a data-cap="loja">Loja de Diamantes</a>, na seção <b>Pacotes</b>, e mostra o
        alvo de hoje (e de quantos veteranos ativos saiu a mediana), quanto do caminho você já tem e o
        <b>seu</b> preço. O número do card é o do débito:
        se ele <b>subir</b> entre o clique e a compra (você desmaiou e perdeu XP, ou virou o dia e o alvo
        mudou), a compra é recusada e o card pede para conferir de novo; se <b>cair</b> (você caçou
        enquanto lia), cobra o menor. E se você alcançar o alvo enquanto a compra é processada, os
        diamantes voltam.</p>

        <h4>Enquanto ele dura</h4>
        <ul>
          <li><b>Sem prazo</b>: não é por dias. Acaba sozinho quando o treinador chega ao alvo, com o
          aviso de que você alcançou os veteranos.</li>
          <li>Aparece no painel do treinador, logo abaixo das moedas, e em <b>Bônus ativos</b> na
          Loja, como <b>Atrasados ×${n(A.mult)} → nv …</b>.</li>
          <li><b>Multiplica</b> com tudo o que multiplica o XP: XP Boost, XP Boost Pokémon, VIP, o
          bônus do ranking da guild, o Boost da Guild, eventos, Twitch e Kick (ver
          <a data-cap="niveis">Níveis e XP</a>).</li>
          <li><b>Um de cada vez</b>: com ele ligado, a Loja não vende outro.</li>
          <li><b>Desmaiar não tira XP</b>: na hunt, no boss e no PvP, desistindo do combate ou
          abandonando a arena — nada tira XP do treinador (ver
          <a data-cap="morte">Desmaiar e curar</a>).</li>
        </ul>

        <h4>Por que não se perde XP até chegar ao alvo</h4>
        <p>O boost dá ×${n(A.mult)} também no XP dos <b>pokémon</b>, mas quem o desliga é o nível do
        <b>treinador</b>. Se desmaiar tirasse XP do treinador — os ${n(morte)}% do nível, como acontece
        sem o boost —, daria para parar logo abaixo do alvo e desmaiar de propósito de tempos em tempos:
        o treinador nunca chegaria lá, e o time inteiro subiria com ×${n(A.mult)} para sempre, por um
        boost que foi vendido como uma corrida com linha de chegada.</p>
        <p>Sem a perda, o treinador <b>só anda para a frente</b> enquanto o boost dura, e ele sempre
        acaba no nível que a tela prometeu. E, para quem está alcançando os outros, desmaiar enquanto
        aprende as hunts mais fortes não joga o progresso para trás.</p>

        <h4>Até o alvo, e nem um ponto além</h4>
        <p>O abate que cruza o alvo leva o ×${n(A.mult)} só até o XP exato do alvo; o resto daquele
        mesmo abate entra no multiplicador normal — no treinador e, na mesma proporção, no pokémon.
        Faltando <b>${n(exFalta)} XP</b>, um selvagem que vale <b>${n(exBase)} XP</b> (sem outros
        bônus) dá <b>${n(exGanho)}</b>, e não ${n(exBase * A.mult)}: ${n(exDentro)} dos ${n(exBase)}
        cobrem no ×${n(A.mult)} os ${n(exFalta)} que faltavam, e os outros ${n(exFora)} entram no ×1.</p>
        ${nota(`Ninguém passa do alvo com o boost — nem com todos os bônus empilhados num abate de boss.`, 'dica')}

        <h4>Justo com quem já está lá</h4>
        <ul>
          <li>O alvo é a mediana: a <b>metade de cima dos veteranos continua na frente</b>, e o boost
          não fura ranking nenhum.</li>
          <li>Só <b>vende</b> para quem está abaixo do alvo de hoje. Quem já chegou vê o card do mesmo
          jeito, sem o botão de compra: ele fica na Loja para todo mundo acompanhar a mediana do
          servidor.</li>
          <li>Chegou ao alvo e a mediana subiu depois? O card volta, e você paga <b>só o pedaço
          novo</b>, com o mesmo preço proporcional.</li>
        </ul>`,
        en: `
        <p>Joining a server that has been running for months means arriving in the middle of a
        conversation: the veterans are hundreds of levels ahead, and their hunts are locked for whoever
        just got here. The <b>Late Joiner Boost</b> shortens that road, and only that: <b>XP
        ×${n(A.mult)}</b> (${A.mult * 100}%) for your trainer <b>and</b> your pokémon, until your
        trainer reaches the <b>veterans' level</b>. Once there, it ends by itself.</p>
        ${meu ? nota(meu, 'dica') : ''}

        <h4>The target level: the veterans' median</h4>
        <ul>
          <li>It is the middle level — the <b>median</b> — of players who played in the last
          <b>${n(A.diasAtivo)} days</b> and have accounts older than <b>${n(A.diasConta)} days</b>.</li>
          <li><b>Median, not average</b>: the average would be pulled up by the few players at very high
          levels.</li>
          <li><b>Veterans only</b>: the week's new accounts would pull the number down — whoever joins
          wants to catch up with the people already playing, not with the ones who joined alongside
          them.</li>
          <li><b>Recalculated every day</b> at 00:00 Brasília time, in a single calculation for the whole
          server. Whoever joins a year from now sees that day's target, not a frozen number.</li>
          <li>With fewer than <b>${n(A.minimoAmostra)}</b> active veterans there is no meaningful median,
          and the boost leaves the Shop until there is one.</li>
          <li>The target is <b>locked at purchase</b>: if the median rises tomorrow, your boost still ends
          at the level the screen promised.</li>
        </ul>

        <h4>The price: proportional to the XP still missing</h4>
        <p>The whole road, from level 1 to the target, costs <b>${n(A.precoCheio)} 💎</b>. If you have
        already covered part of it, you only pay for what is left — measured in XP:</p>
        <pre class="wk-formula">price = ${A.precoCheio} × (target XP − your XP) ÷ target XP   (rounded up; minimum ${A.precoMinimo})</pre>
        <ul>
          <li><b>In XP, not in levels</b>, because the curve is cubic (see <a data-cap="niveis">Levels and
          XP</a>): halfway there in levels (level ${n(metade)} of ${n(alvo)}) you have only
          <b>${metadeXp}</b> of the XP. The last levels before the target are most of the playing time,
          and that time is what the boost saves.</li>
          <li><b>Minimum ${n(A.precoMinimo)} 💎</b>: a small piece of the road still costs that much — the
          ×${n(A.mult)} also applies to your pokémon, so it is never almost free near the target.</li>
          <li><b>The full price does not grow over time</b>: reaching the veterans' level costs the same
          today and a year from now, even if that target is much higher.</li>
        </ul>
        <p>What it costs ${exemploDe}:</p>
        ${tabelaPrecos}
        <p>The card is in the <a data-cap="loja">Diamond Shop</a>, in the <b>Bundles</b> section, and
        shows today's target (and how many active veterans the median came from), how much of the road
        you already have and <b>your</b> price. The number on
        the card is the one charged: if it <b>goes up</b> between the click and the purchase (you fainted
        and lost XP, or the day turned and the target changed), the purchase is refused and the card asks
        you to check again; if it <b>goes down</b> (you hunted while reading), you pay the lower one. And
        if you reach the target while the purchase is being processed, the diamonds come back.</p>

        <h4>While it lasts</h4>
        <ul>
          <li><b>No timer</b>: it is not counted in days. It ends by itself when your trainer reaches the
          target, with a notice that you caught up with the veterans.</li>
          <li>It shows up on the trainer panel, right below your coins, and under <b>Active
          bonuses</b> in the Shop, as <b>Late Joiner ×${n(A.mult)} → lv …</b>.</li>
          <li>It <b>multiplies</b> with everything that multiplies XP: XP Boost, Pokémon XP Boost, VIP,
          the guild ranking bonus, the Guild Boost, events, Twitch and Kick (see
          <a data-cap="niveis">Levels and XP</a>).</li>
          <li><b>One at a time</b>: while it is on, the Shop does not sell another.</li>
          <li><b>Fainting costs no XP</b>: in hunts, bosses and PvP, giving up a battle or leaving the
          arena — nothing takes trainer XP (see
          <a data-cap="morte">Fainting and healing</a>).</li>
        </ul>

        <h4>Why you lose no XP until you reach the target</h4>
        <p>The boost also gives ×${n(A.mult)} to <b>pokémon</b> XP, but what switches it off is the
        <b>trainer's</b> level. If fainting took trainer XP — the ${n(morte)}% of the level, as it does
        without the boost —, you could stop right below the target and faint on purpose every now and
        then: the trainer would never get there, and the whole team would level at ×${n(A.mult)}
        forever, from a boost that was sold as a race with a finish line.</p>
        <p>Without the loss, your trainer <b>only moves forward</b> while the boost lasts, and it always
        ends at the level the screen promised. And for whoever is catching up, fainting while learning
        the tougher hunts does not set the progress back.</p>

        <h4>Up to the target, and not one point past it</h4>
        <p>The kill that crosses the target gets the ×${n(A.mult)} only up to the exact target XP; the
        rest of that same kill goes in at the normal multiplier — for the trainer and, in the same
        proportion, for the pokémon. With <b>${n(exFalta)} XP</b> to go, a wild pokémon worth
        <b>${n(exBase)} XP</b> (no other bonuses) gives <b>${n(exGanho)}</b>, not ${n(exBase * A.mult)}:
        ${n(exDentro)} of the ${n(exBase)} cover the missing ${n(exFalta)} at ×${n(A.mult)}, and the other
        ${n(exFora)} go in at ×1.</p>
        ${nota(`Nobody goes past the target with the boost — not even with every bonus stacked on a boss kill.`, 'dica')}

        <h4>Fair to those already there</h4>
        <ul>
          <li>The target is the median: the <b>top half of the veterans stays ahead</b>, and the boost
          skips no ranking.</li>
          <li>It is only <b>sold</b> to players below today's target. Those already there still see
          the card, without the buy button: it stays in the Shop so everyone can follow the server's
          median.</li>
          <li>Reached the target and the median rose afterwards? The card comes back, and you pay
          <b>only the new stretch</b>, with the same proportional price.</li>
        </ul>`,
        es: `
        <p>Quien entra en un servidor que ya tiene meses llega a una conversación empezada: los
        veteranos están cientos de niveles arriba, y sus cacerías están cerradas para quien acaba de
        llegar. El <b>Boost de los Rezagados</b> acorta ese camino, y solo eso: <b>XP ×${n(A.mult)}</b>
        (${A.mult * 100}%) para el entrenador <b>y</b> los pokémon, hasta que tu entrenador alcance el
        <b>nivel de los veteranos</b>. Al llegar, termina solo.</p>
        ${meu ? nota(meu, 'dica') : ''}

        <h4>El nivel objetivo: la mediana de los veteranos</h4>
        <ul>
          <li>Es el nivel del medio — la <b>mediana</b> — de quienes jugaron en los últimos
          <b>${n(A.diasAtivo)} días</b> y tienen cuenta hace más de <b>${n(A.diasConta)} días</b>.</li>
          <li><b>Mediana, y no promedio</b>: el promedio lo subirían los pocos jugadores de nivel
          altísimo.</li>
          <li><b>Solo veteranos</b>: las cuentas nuevas de la semana bajarían el número — quien llega
          quiere alcanzar a quien ya está jugando, y no a quien llegó con él.</li>
          <li><b>Se recalcula todos los días</b>, a las 00:00 de Brasilia, en una sola cuenta para todo
          el servidor. Quien llegue dentro de un año ve el objetivo de ese día, y no un número
          congelado.</li>
          <li>Con menos de <b>${n(A.minimoAmostra)}</b> veteranos activos no hay mediana que diga algo, y
          el boost sale de la Tienda hasta que la haya.</li>
          <li>El objetivo queda <b>grabado en la compra</b>: si la mediana sube mañana, tu boost sigue
          terminando en el nivel que la pantalla prometió.</li>
        </ul>

        <h4>El precio: proporcional al XP que falta</h4>
        <p>El camino entero, del nivel 1 al objetivo, cuesta <b>${n(A.precoCheio)} 💎</b>. Quien ya
        recorrió una parte paga solo lo que falta — medido en XP:</p>
        <pre class="wk-formula">precio = ${A.precoCheio} × (XP del objetivo − tu XP) ÷ XP del objetivo   (redondeado hacia arriba; mínimo ${A.precoMinimo})</pre>
        <ul>
          <li><b>En XP, y no en niveles</b>, porque la curva es cúbica (ver <a data-cap="niveis">Niveles
          y XP</a>): a mitad del camino en niveles (nv ${n(metade)} de ${n(alvo)}) tienes solo
          <b>${metadeXp}</b> del XP. Los últimos niveles antes del objetivo son la mayor parte del tiempo
          de juego, y es ese tiempo lo que el boost ahorra.</li>
          <li><b>Mínimo de ${n(A.precoMinimo)} 💎</b>: un pedazo pequeño del camino todavía cuesta eso —
          el ×${n(A.mult)} vale también para los pokémon, y por eso nunca sale casi gratis cerca del
          objetivo.</li>
          <li><b>El precio completo no crece con el tiempo</b>: llegar al nivel de los veteranos cuesta
          lo mismo hoy y dentro de un año, aunque el objetivo de entonces sea mucho más alto.</li>
        </ul>
        <p>Cuánto cuesta ${exemploDe}:</p>
        ${tabelaPrecos}
        <p>La tarjeta está en la <a data-cap="loja">Tienda de Diamantes</a>, en la sección
        <b>Paquetes</b>, y muestra el objetivo de hoy (y de cuántos veteranos activos salió la mediana),
        cuánto del camino ya tienes y <b>tu</b> precio. El
        número de la tarjeta es el que se cobra: si <b>sube</b> entre el clic y la compra (te debilitaste
        y perdiste XP, o cambió el día y el objetivo), la compra se rechaza y la tarjeta pide revisar de
        nuevo; si <b>baja</b> (cazaste mientras leías), cobra el menor. Y si alcanzas el objetivo
        mientras la compra se procesa, los diamantes vuelven.</p>

        <h4>Mientras dura</h4>
        <ul>
          <li><b>Sin plazo</b>: no se cuenta en días. Termina solo cuando el entrenador llega al
          objetivo, con el aviso de que alcanzaste a los veteranos.</li>
          <li>Aparece en el panel del entrenador, justo debajo de las monedas, y en <b>Bonos
          activos</b> en la Tienda, como <b>Rezagados ×${n(A.mult)} → nv …</b>.</li>
          <li><b>Se multiplica</b> con todo lo que multiplica el XP: XP Boost, XP Boost Pokémon, VIP, el
          bonus del ranking de la guild, el Boost de la Guild, eventos, Twitch y Kick (ver
          <a data-cap="niveis">Niveles y XP</a>).</li>
          <li><b>Uno a la vez</b>: con él activo, la Tienda no vende otro.</li>
          <li><b>Debilitarse no quita XP</b>: en la cacería, en el boss y en el PvP, rindiéndote en el
          combate o abandonando la arena — nada quita XP del entrenador (ver
          <a data-cap="morte">Debilitarse y curar</a>).</li>
        </ul>

        <h4>Por qué no se pierde XP hasta llegar al objetivo</h4>
        <p>El boost da ×${n(A.mult)} también al XP de los <b>pokémon</b>, pero quien lo apaga es el nivel
        del <b>entrenador</b>. Si debilitarse quitara XP del entrenador — el ${n(morte)}% del nivel, como
        pasa sin el boost —, se podría parar justo debajo del objetivo y debilitarse a propósito cada
        tanto: el entrenador nunca llegaría, y el equipo entero subiría con ×${n(A.mult)} para siempre,
        con un boost que se vendió como una carrera con meta.</p>
        <p>Sin la pérdida, el entrenador <b>solo avanza</b> mientras dura el boost, y siempre termina en
        el nivel que la pantalla prometió. Y, para quien está alcanzando a los demás, debilitarse
        mientras aprende las cacerías más fuertes no le hace retroceder.</p>

        <h4>Hasta el objetivo, y ni un punto más</h4>
        <p>La derrota que cruza el objetivo lleva el ×${n(A.mult)} solo hasta el XP exacto del objetivo;
        el resto de esa misma derrota entra con el multiplicador normal — en el entrenador y, en la misma
        proporción, en el pokémon. Faltando <b>${n(exFalta)} XP</b>, un salvaje que vale
        <b>${n(exBase)} XP</b> (sin otros bonos) da <b>${n(exGanho)}</b>, y no ${n(exBase * A.mult)}:
        ${n(exDentro)} de los ${n(exBase)} cubren con ×${n(A.mult)} los ${n(exFalta)} que faltaban, y los
        otros ${n(exFora)} entran con ×1.</p>
        ${nota(`Nadie pasa del objetivo con el boost — ni con todos los bonos acumulados en una derrota de boss.`, 'dica')}

        <h4>Justo con quien ya está ahí</h4>
        <ul>
          <li>El objetivo es la mediana: la <b>mitad de arriba de los veteranos sigue por delante</b>, y
          el boost no se salta ningún ranking.</li>
          <li>Solo se <b>vende</b> a quien está por debajo del objetivo de hoy. Quien ya llegó ve la
          tarjeta igual, sin el botón de compra: queda en la Tienda para que todos sigan la mediana del
          servidor.</li>
          <li>¿Llegaste al objetivo y la mediana subió después? La tarjeta vuelve, y pagas <b>solo el
          tramo nuevo</b>, con el mismo precio proporcional.</li>
        </ul>`,
      };
    },
  },

  // -------------------------------------------------------------- 3. stats
  {
    id: 'stats',
    titulo: { pt: 'Stats, Qualidade e IV', en: 'Stats, Quality and IV', es: 'Stats, Calidad e IV' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>Dois pokémon da mesma espécie e do mesmo nível quase nunca são iguais. O que os
        separa são três números sorteados <b>na captura</b> e que <b>nunca mais mudam</b>:
        <b>qualidade</b>, <b>IV</b> e <b>potência</b>.</p>

        <pre class="wk-formula">stat = arred( (base + 2 × IV) × nível/100 × qualidade^expoente × multiplicador )
somaStats = hp + atk + def + spAtk + spDef + speed</pre>

        <h4>IV — 1 a 32 por stat</h4>
        <p>Seis sorteios independentes, de <b>1 a 32</b> cada (máximo somado: 192). Evoluir
        <b>não</b> rerola nada.</p>

        <h4>Speed e IV de SPD — recarga, não corrida</h4>
        <p>O <b>IV de Velocidade (SPD)</b> é sorteado separado, como os outros cinco. Nem ele nem o
        stat de SPD entram na fórmula de dano ou aceleram a corrida na hunt — o pokémon sempre
        corre um pouco na frente do treinador por design da cena. O que muda é a <b>recarga</b>:
        nos golpes, o <b>Speed base da espécie</b> dá até ${D(SPEED_POTENCIAL_TETO_PCT, 'pt')}% de
        desconto e o IV de SPD decide quanto disso o pokémon aproveita (IV 32, tudo; IV 16, metade);
        na Investida e no intervalo entre ataques só o IV conta, <b>−0,01 s por ponto</b> (IV 32 →
        −0,32 s), fixo no nascimento. A conta inteira está em <a data-cap="combate">Combate</a>.
        Sp.ATK e Sp.DEF só entram em golpes <b>especiais</b>.</p>

        <h4>Qualidade — o número que mais pesa</h4>
        <p>Ela entra em <b>cada stat</b> como expoente (<code>qualidade^expo</code>) — por isso
        muda o bicho inteiro e vale mais que o IV isolado. A linha <code>somaStats</code> acima é
        só a <b>soma dos seis stats</b> (útil na Pokédex para comparar potências). A <b>nota</b> e
        o <b>⚔</b> usam essa força de nascimento — ver <a data-cap="nota">Nota, Poder e Calculadora</a>.</p>
        <h4>Como nasce a qualidade</h4>
        <p><b>Não é calculada</b> a partir dos IVs, da potência, do shiny nem do nível. Na captura
        o jogo sorteia <b>uma faixa</b> (pelas chances da tabela abaixo) e, dentro dela, um valor
        aleatório entre o mínimo e o máximo — com três casas decimais. Esse número fica para
        sempre; evoluir não muda nada.</p>
        ${nota(`Um pokémon com IV no teto e potência V pode nascer com q<b>1,0</b> (Comum) ou
        q<b>1,7</b> (Lendária): são três sorteios <b>independentes</b> na mesma captura. IV alto
        <b>não</b> puxa a qualidade para cima.`)}
        ${tabelaDeQualidade(c)}
        ${nota(`A faixa <b>1,6 – 1,7 é um buraco intencional</b>: nenhum pokémon nasce nela. O
        teto do sorteio é exatamente <b>1,8</b> (~0,29% de chance). O shiny não ganha qualidade
        extra — ele fica mais forte pelo <b>×${c.d.multShinyStats ?? 3} nos stats</b> e pelos IVs rerolados, não por um q
        maior.`)}
        <p>O expoente muda por stat: <b>0,95</b> para HP e Velocidade, <b>0,8</b> para os
        outros quatro. O efeito do <b>Speed</b> e do <b>IV de SPD</b> no combate (recarga, não corrida) está em
        <a data-cap="combate">Combate</a>.</p>

        <h4>HP de combate</h4>
        <pre class="wk-formula">hpDeCombate = máx(24, arred(hp × 12))</pre>
        <p>Um selvagem ainda leva <b>×${c.d.multHpSelvagem ?? 5}</b> por cima disso — ver
        <a data-cap="combate">Combate</a>.</p>

        <h4>Refino — o “+1” comprado com pedra</h4>
        <p>É o único jeito de mexer na <b>base</b> de um pokémon depois que ele nasceu. Cada
        degrau soma <b>+${c.d.refino?.passo ?? 1}</b> permanente a um stat-base, e o ganho entra
        <b>antes</b> de tudo o mais na fórmula lá em cima — ou seja, é multiplicado por nível,
        qualidade e potência. O mesmo degrau que vale +1 num nível 100 comum vale ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} vezes
        isso num P5 shiny — e ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS} num <a data-cap="lendarios">lendário</a> P5 shiny.</p>
        <p>Você paga na <b>pedra de evolução do tipo do próprio pokémon</b> — a mesma com que ele
        evolui, e a comum mesmo se ele for shiny. Forma final também refina: o Dragonite não
        evolui para lugar nenhum, mas usa Ancient Stone como qualquer outro DRAGON.</p>
        <p>Quem tem <b>dois tipos</b> aceita a pedra de <b>qualquer um deles</b>, e as duas somam: num
        Charizard, 300 Feather Stone + 200 Fire Stone fecham um degrau de 500. Na tela do refino você
        <b>escolhe quanto sai de cada pedra</b>.</p>
<pre class="wk-formula">ter +N num stat  = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × N³ pedras, somando tudo
custo do degrau N = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × (3N² − 3N + 1)</pre>
        ${tabelaDeRefino(c)}
        ${nota(`<b>Não há teto.</b> Quem quiser continuar subindo, sobe — quem decide o ritmo é o
        preço. A curva é cúbica, e não exponencial, exatamente por isso: dobrando, o vigésimo
        degrau custaria 262 milhões de pedras e existiria um teto de fato escondido na fórmula.`)}
        ${nota(`O custo é <b>por stat</b>, não por pokémon. Quem colocou quatro degraus no HP paga
        ${N(30500, c.lang)} pelo quinto — mas o
        primeiro de ATK continua custando ${N(c.d.refino?.custoBase ?? 500, c.lang)}. Refinar é
        <b>escolher</b> onde o bicho vai ser bom, não encher uma barra.`)}
        <p><b>O SPD não refina</b>, e não é esquecimento: o stat de SPD não entra em combate
        nenhum — quem acelera os ataques é o <b>Speed base da espécie</b> com o <b>IV</b> de Speed,
        ali em cima, e o refino não mexe em nenhum dos dois. Vender “+1 SPD” seria vender um número
        que não faz nada.</p>
        <p>A <b>nota N=</b> e o <b>⚔</b> sobem com o refino — usam a base atual (espécie + +N).
        Z-Move e held items não entram na nota. O selo <b>+N</b> ao lado do nome mostra
        quanto já foi investido; os stats de verdade sobem na ficha.</p>
        <p>O “+” fica em dois lugares: no cabeçalho do painel <b>Em campo</b> e em cada linha de
        <b>Stats-base</b> na ficha de um pokémon seu. Refinar manda o pokémon para a sua
        <a data-cap="market">Coleção</a>, fora da venda ao NPC — devolva ao Depot se quiser mesmo
        vendê-lo.</p>

        <h4>O piso do starter</h4>
        <p>O primeiro pokémon <b>não</b> passa pelo sorteio livre. Ele nasce com qualidade
        <b>≥ 1,30</b>, soma de IVs <b>&gt; 140</b> e nenhum IV abaixo de <b>16</b>. Sem isso, um
        em cada dez treinadores começaria com um bicho da banda "Fraca" e a primeira hunt seria
        intransponível.</p>`,
      en: `
        <p>Two pokémon of the same species and level are almost never the same. What sets them
        apart are three numbers rolled <b>at capture</b> that <b>never change again</b>:
        <b>quality</b>, <b>IV</b> and <b>potency</b>.</p>

        <pre class="wk-formula">stat = round( (base + 2 × IV) × level/100 × quality^exponent × multiplier )
statSum = hp + atk + def + spAtk + spDef + speed</pre>

        <h4>IV — 1 to 32 per stat</h4>
        <p>Six independent rolls, <b>1 to 32</b> each (max total: 192). Evolving does
        <b>not</b> reroll anything.</p>

        <h4>Speed and SPD IV — cooldowns, not running speed</h4>
        <p><b>Speed IV (SPD)</b> is rolled separately, like the other five. Neither it nor the SPD
        stat enter the damage formula or make the pokémon run faster on the hunt map — the active
        pokémon is always slightly ahead of the trainer by scene design. What changes is the
        <b>cooldown</b>: on moves, the <b>species' base Speed</b> gives up to
        ${D(SPEED_POTENCIAL_TETO_PCT, 'en')}% off and the SPD IV decides how much of it the pokémon gets
        (IV 32, all of it; IV 16, half); on Tackle and the gap between attacks only the IV counts,
        <b>−0.01 s per point</b> (IV 32 → −0.32 s), fixed at birth. The full math is in
        <a data-cap="combate">Combat</a>. Sp.ATK and Sp.DEF only matter on <b>special</b> moves.</p>

        <h4>Quality — the number that weighs most</h4>
        <p>It enters <b>each stat</b> as an exponent (<code>quality^exp</code>) — so it shifts the
        whole pokémon and matters more than IV alone. The <code>statSum</code> line above is just
        the <b>sum of the six stats</b> (used in the Pokédex to compare potencies). The <b>score</b>
        and <b>⚔</b> use that birth strength — see <a data-cap="nota">Score, Power and Calculator</a>.</p>
        <h4>How quality is rolled</h4>
        <p>It is <b>not calculated</b> from IVs, potency, shininess or level. At capture the game
        rolls <b>one band</b> (using the table chances below) and then a random value between that
        band's min and max — three decimal places. That number is permanent; evolving changes
        nothing.</p>
        ${nota(`A pokémon with max IVs and potency V can still roll q<b>1.0</b> (Common) or
        q<b>1.7</b> (Legendary): three <b>independent</b> rolls on the same capture. High IV
        does <b>not</b> pull quality up.`)}
        ${tabelaDeQualidade(c)}
        ${nota(`The <b>1.6 – 1.7 range is an intentional gap</b>: no pokémon is born in it. The
        roll ceiling is exactly <b>1.8</b> (~0.29% chance). Shinies do not get extra quality — they
        are stronger from the <b>×${c.d.multShinyStats ?? 3} stat multiplier</b> and rerolled IVs, not from a higher q.`)}
        <p>The exponent varies per stat: <b>0.95</b> for HP and Speed, <b>0.8</b> for the other
        four. How <b>Speed</b> and the <b>SPD IV</b> affect combat (cooldowns, not running) is in
        <a data-cap="combate">Combat</a>.</p>

        <h4>Combat HP</h4>
        <pre class="wk-formula">combatHp = max(24, round(hp × 12))</pre>
        <p>A wild pokémon takes a further <b>×${c.d.multHpSelvagem ?? 5}</b> on top of that — see
        <a data-cap="combate">Combat</a>.</p>

        <h4>Refine — the “+1” bought with stones</h4>
        <p>The only way to touch a pokémon's <b>base</b> stats after it is born. Each step adds a
        permanent <b>+${c.d.refino?.passo ?? 1}</b> to one base stat, and it enters <b>before</b>
        everything else in the formula above — so it is multiplied by level, quality and potency.
        The step worth +1 on a plain level 100 is worth ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} times that on a shiny P5 — and ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS} on a shiny P5 <a data-cap="lendarios">legendary</a>.</p>
        <p>You pay in the <b>evolution stone of the pokémon's own type</b> — the same one it
        evolves with, and the common one even if it is shiny. Final forms refine too: Dragonite
        evolves nowhere, but it uses Ancient Stone like any other DRAGON.</p>
        <p>A pokémon with <b>two types</b> takes the stone of <b>either one</b>, and both add up: on a
        Charizard, 300 Feather Stones + 200 Fire Stones close a 500 step. On the refine screen you
        <b>choose how much comes from each stone</b>.</p>
<pre class="wk-formula">holding +N on a stat = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × N³ stones, all told
cost of step N       = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × (3N² − 3N + 1)</pre>
        ${tabelaDeRefino(c)}
        ${nota(`<b>There is no cap.</b> Whoever wants to keep climbing, climbs — the price sets the
        pace. The curve is cubic and not exponential for exactly that reason: by doubling, the
        twentieth step would cost 262 million stones and a de facto cap would be hidden in the
        formula.`)}
        ${nota(`The cost is <b>per stat</b>, not per pokémon. Four steps into HP means
        ${N(30500, c.lang)} for the fifth — but the first ATK step still costs
        ${N(c.d.refino?.custoBase ?? 500, c.lang)}. Refining is <b>choosing</b> what the creature is
        good at, not filling a bar.`)}
        <p><b>SPD does not refine</b>, and that is not an oversight: the SPD stat never enters
        combat — attack pace comes from the <b>species' base Speed</b> with the Speed <b>IV</b>
        above, and refining touches neither. Selling "+1 SPD" would be selling a number that does
        nothing.</p>
        <p>The <b>score</b> and the <b>⚔</b> do not move with refining: both measure how the
        pokémon was <b>born</b>. What refining shows is the <b>+N</b> badge next to the name and
        the real stats climbing on the card.</p>
        <p>The “+” lives in two places: the header of the <b>On field</b> panel and each
        <b>Base stats</b> row on the card of a pokémon you own. Refining sends the pokémon to your
        <a data-cap="market">Collection</a>, out of NPC sales — return it to the Depot if you really
        want to sell it.</p>

        <h4>The starter floor</h4>
        <p>Your first pokémon does <b>not</b> go through the free roll. It is born with quality
        <b>≥ 1.30</b>, IV total <b>&gt; 140</b> and no single IV below <b>16</b>. Without that,
        one in ten trainers would start with a "Weak" band creature and the first hunt would be
        impossible.</p>`,
      es: `
        <p>Dos pokémon de la misma especie y nivel casi nunca son iguales. Lo que los separa son
        tres números sorteados <b>en la captura</b> y que <b>nunca cambian</b>: <b>calidad</b>,
        <b>IV</b> y <b>potencia</b>.</p>

        <pre class="wk-formula">stat = redond( (base + 2 × IV) × nivel/100 × calidad^exponente × multiplicador )
sumaStats = hp + atk + def + spAtk + spDef + speed</pre>

        <h4>IV — 1 a 32 por stat</h4>
        <p>Seis sorteos independientes, de <b>1 a 32</b> cada uno (máximo sumado: 192). Evolucionar
        <b>no</b> vuelve a sortear nada.</p>

        <h4>Speed e IV de SPD — recarga, no velocidad de carrera</h4>
        <p>El <b>IV de Velocidad (SPD)</b> se sortea aparte, como los otros cinco. Ni él ni el stat
        de SPD entran en la fórmula de daño ni aceleran la carrera en la cacería — el pokémon activo
        siempre va un poco delante del entrenador por diseño de la escena. Lo que cambia es la
        <b>recarga</b>: en los golpes, el <b>Speed base de la especie</b> da hasta
        ${D(SPEED_POTENCIAL_TETO_PCT, 'es')}% de descuento y el IV de SPD decide cuánto aprovecha el
        pokémon (IV 32, todo; IV 16, la mitad); en la Embestida y en el intervalo entre ataques solo
        cuenta el IV, <b>−0,01 s por punto</b> (IV 32 → −0,32 s), fijo al nacer. La cuenta completa
        está en <a data-cap="combate">Combate</a>. Sp.ATK y Sp.DEF solo cuentan en golpes
        <b>especiales</b>.</p>

        <h4>Calidad — el número que más pesa</h4>
        <p>Entra en <b>cada stat</b> como exponente (<code>calidad^exp</code>) — por eso cambia
        todo el pokémon y pesa más que el IV aislado. La línea <code>sumaStats</code> es solo la
        <b>suma de los seis stats</b> (útil en la Pokédex para comparar potencias). La <b>nota</b> y
        el <b>⚔</b> usan esa fuerza al nacer — ver <a data-cap="nota">Nota, Poder y Calculadora</a>.</p>
        <h4>Cómo nace la calidad</h4>
        <p><b>No se calcula</b> a partir de los IV, la potencia, el shiny ni el nivel. En la
        captura el juego sortea <b>una franja</b> (según las probabilidades de la tabla) y, dentro
        de ella, un valor aleatorio entre el mínimo y el máximo — con tres decimales. Ese número
        queda para siempre; evolucionar no lo cambia.</p>
        ${nota(`Un pokémon con IV al tope y potencia V puede nacer con q<b>1,0</b> (Común) o
        q<b>1,7</b> (Legendaria): son tres sorteos <b>independientes</b> en la misma captura. IV
        alto <b>no</b> sube la calidad.`)}
        ${tabelaDeQualidade(c)}
        ${nota(`La franja <b>1,6 – 1,7 es un hueco intencional</b>: ningún pokémon nace en ella. El
        tope del sorteo es exactamente <b>1,8</b> (~0,29% de probabilidad). El shiny no gana
        calidad extra — es más fuerte por el <b>×${c.d.multShinyStats ?? 3} en los stats</b> y los IV rerolados, no por un q
        mayor.`)}
        <p>El exponente cambia por stat: <b>0,95</b> para HP y Velocidad, <b>0,8</b> para los otros
        cuatro. El efecto del <b>Speed</b> y del <b>IV de SPD</b> en combate (recarga, no carrera) está en
        <a data-cap="combate">Combate</a>.</p>

        <h4>HP de combate</h4>
        <pre class="wk-formula">hpDeCombate = máx(24, redond(hp × 12))</pre>
        <p>Un salvaje todavía recibe <b>×${c.d.multHpSelvagem ?? 5}</b> encima de eso — ver
        <a data-cap="combate">Combate</a>.</p>

        <h4>Refinado — el “+1” comprado con piedras</h4>
        <p>Es la única forma de tocar la <b>base</b> de un pokémon después de nacer. Cada escalón
        suma <b>+${c.d.refino?.passo ?? 1}</b> permanente a un stat base, y entra <b>antes</b> que
        todo lo demás en la fórmula de arriba — o sea, se multiplica por nivel, calidad y
        potencia. El mismo escalón que vale +1 en un nivel 100 común vale ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} veces eso en un
        P5 shiny — y ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS} en un <a data-cap="lendarios">legendario</a> P5 shiny.</p>
        <p>Se paga con la <b>piedra de evolución del tipo del propio pokémon</b> — la misma con la
        que evoluciona, y la común incluso si es shiny. Las formas finales también se refinan:
        Dragonite no evoluciona a ninguna parte, pero usa Ancient Stone como cualquier DRAGON.</p>
        <p>Quien tiene <b>dos tipos</b> acepta la piedra de <b>cualquiera de los dos</b>, y las dos
        suman: en un Charizard, 300 Feather Stone + 200 Fire Stone cierran un escalón de 500. En la
        pantalla del refinado <b>eliges cuánto sale de cada piedra</b>.</p>
<pre class="wk-formula">tener +N en un stat = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × N³ piedras, sumando todo
costo del escalón N = ${N(c.d.refino?.custoBase ?? 500, c.lang)} × (3N² − 3N + 1)</pre>
        ${tabelaDeRefino(c)}
        ${nota(`<b>No hay tope.</b> Quien quiera seguir subiendo, sube — el precio marca el ritmo.
        La curva es cúbica y no exponencial justo por eso: duplicando, el vigésimo escalón
        costaría 262 millones de piedras y habría un tope de hecho escondido en la fórmula.`)}
        ${nota(`El costo es <b>por stat</b>, no por pokémon. Quien puso cuatro escalones en HP paga
        ${N(30500, c.lang)} por el quinto — pero el primero de ATK sigue costando
        ${N(c.d.refino?.custoBase ?? 500, c.lang)}. Refinar es <b>elegir</b> en qué será bueno el
        bicho, no llenar una barra.`)}
        <p><b>El SPD no se refina</b>, y no es un olvido: el stat de SPD no entra en ningún
        combate — lo que acelera los ataques es el <b>Speed base de la especie</b> con el <b>IV</b>
        de Speed, arriba, y el refinado no toca ninguno de los dos. Vender “+1 SPD” sería vender un
        número que no hace nada.</p>
        <p>La <b>nota N=</b> y el <b>⚔</b> suben con el refinado — usan la base actual (especie + +N).
        Z-Move y held items no entran en la nota. El sello <b>+N</b> al lado del nombre muestra
        cuánto ya se invirtió; los stats reales suben en la ficha.</p>
        <p>El “+” está en dos lugares: en la cabecera del panel <b>En campo</b> y en cada línea de
        <b>Stats base</b> de la ficha de un pokémon tuyo. Refinar envía el pokémon a tu
        <a data-cap="market">Colección</a>, fuera de la venta al NPC — devuélvelo al Depósito si de
        verdad quieres venderlo.</p>

        <h4>El mínimo del inicial</h4>
        <p>El primer pokémon <b>no</b> pasa por el sorteo libre. Nace con calidad <b>≥ 1,30</b>,
        suma de IV <b>&gt; 140</b> y ningún IV por debajo de <b>16</b>. Sin eso, uno de cada diez
        entrenadores empezaría con un bicho de la franja "Débil" y la primera cacería sería
        imposible.</p>`,
    }),
  },

  // -------------------------------------------------------- 3b. nota e poder
  {
    id: 'nota',
    titulo: { pt: 'Nota, Poder e Calculadora', en: 'Score, Power and Calculator', es: 'Nota, Poder y Calculadora' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>São <b>duas métricas diferentes</b> que o jogo mostra na ficha — e confundir as duas
        é a origem de quase todo mal-entendido sobre “pokémon bom”.</p>

        <h4>Nota N= (0–10) — alinhada ao ⚔@100</h4>
        <p>Mede o quão forte o pokémon <b>nasceu dentro da espécie</b>. Usa a <b>mesma força
        (score)</b> do ranking ⚔, como se todo mundo estivesse no <b>nível 100</b> — subir de
        nível não muda a nota, só o ⚔ que aparece no placar.</p>
        <pre class="wk-formula">score = força de nascimento (0–1), mesma base do ⚔
nota   = 10 × (score − pior possível) ÷ (melhor − pior)   ← só dentro da espécie</pre>
        <ul>
          <li><b>0</b> = pior nascimento possível <i>daquela</i> espécie; <b>10</b> = P5 + shiny + IV máximo.</li>
          <li><b>Evoluir sempre SOBE a nota</b> — nunca derruba e nunca empata. Cada espécie tem a
          sua régua, e a forma nova mede o mesmo nascimento de outro jeito; por isso a nota depois de
          evoluir é, no mínimo, a da forma anterior <b>+${D(GANHO_MIN_EVOLUCAO, 'pt')}</b> por
          evolução (o piso da linhagem). Megaevoluir segue a mesma regra. O único limite é o teto: 10
          continua sendo 10.</li>
          <li>Refino (+N) <b>sobe</b> a nota e o ⚔ — usa a base atual (espécie + refino).</li>
        </ul>
        ${nota(`O <a data-cap="comunidade">Mercado da Comunidade</a> exige faixa mínima de nota na
        calculadora. <b>Shiny, P5 e lendário entram</b> mesmo abaixo da faixa.`)}

        <h4>A Calculadora na prática</h4>
        <p>Abra pelo quadradinho da <b>calculadora</b>, na coluna do seu retrato, ou pela ficha de
        um pokémon (aí ela já vem com os números dele). São duas abas.</p>
        <p><b>Calcular Pokémon.</b> Escolha a <b>espécie primeiro</b> — 0 e 10 são o pior e o melhor
        nascimento <i>daquela</i> espécie — e preencha o nascimento: o <b>IV de cada stat</b> (seis
        campos, de 1 a 32), a qualidade, a potência, o shiny e, se quiser, o Z-Move. Sai:</p>
        <ul>
          <li>a <b>nota</b> grande, no pedestal com o holofote na <b>cor da faixa</b> (tabela abaixo),
          e quanto falta para a faixa seguinte;</li>
          <li><b>De onde vem a nota</b>: quanto cada eixo (IV, qualidade, potência, shiny) pesa na
          força total — não são 25% fixos, e um P5 brilhante puxa mais que um comum fraco;</li>
          <li><b>Peso de cada stat na nota</b>: qual stat a espécie mais valoriza. Dois bichos com a
          mesma soma de IV podem ter notas diferentes se os pontos caírem em stats diferentes;</li>
          <li><b>Em combate</b>: o multiplicador de stats, o HP de combate, o <b>Poder (ranking)</b> —
          o ⚔ no nível da ficha — e o <b>Poder (ginásio)</b>;</li>
          <li><b>Potencial na evolução final</b> e <b>Potencial na Mega Evolução</b>: a nota N= que o
          mesmo nascimento teria nas formas finais alcançáveis (Eevee e ramificações inclusive) e na
          Mega, avisando se cada uma atinge a faixa do Mercado.</li>
        </ul>
        ${nota(`<b>Lendário e Mítico não têm nota.</b> Eles são <b>×${MULT_LENDARIO_STATS} em todos os
        stats</b> (ver <a data-cap="potencia">Potência</a>), e esse ×${MULT_LENDARIO_STATS} passa do topo
        da régua de 0 a 10. Com um deles escolhido, a calculadora "quebra" — aparece <b>INESTIMÁVEL</b>
        no lugar do número. O cartão <b>Em combate</b> continua valendo, já com o ×${MULT_LENDARIO_STATS}.`)}
        <p><b>Comparar Pokémons.</b> Monte dois lados (espécie, nível e nascimento) e a calculadora
        simula um <b>duelo 1×1 de desgaste</b>, com a tabela de tipos, o STAB e o melhor golpe de cada
        um contra o outro. Sai quem vence e em que fração dos duelos simulados — a faixa varia com a
        sorte do dano, e por isso dois pokémon parecidos raramente dão 0% ou 100%.</p>
        <p>A cor da caixa sobe um degrau a cada ponto de nota — são dez faixas. Uma nota bem no
        limite fica na faixa de baixo.</p>
        ${tabelaDeFaixasDaNota('pt')}

        <h4>Poder (⚔) — ranking “Pokémon Forte”</h4>
        <p>É um <b>número único</b> no placar e na ficha. <b>Não é a nota</b> e <b>não muda
        combate</b> — só ordena quem aparece no ranking. Sobe com nível, refino e evolução.</p>
        <pre class="wk-formula">score = mesma força da nota (0–1)
poder = arred( nível × 10 × score )   → no nv 100: ⚔ ≈ 1000 × score</pre>
        <p>No <b>combate</b>, qualidade ainda entra como expoente em cada stat; potência, shiny e o
        ×${MULT_LENDARIO_STATS} do lendário ainda multiplicam os stats. O ⚔ do ranking é outra conta — e
        também leva o ×${MULT_LENDARIO_STATS}, que a nota não leva.</p>

        <h4>O que muda no combate</h4>
        <ul>
          <li><b>HP de combate</b> = máx(24, arred(hp × 12)). Selvagem leva ×5 por cima.</li>
          <li><b>Dano</b> usa ATK ou Sp.Atk vs DEF ou Sp.Def reais, tipo, STAB e efetividade —
          não usa o número “poder” diretamente.</li>
          <li>O <b>Speed base</b> com o <b>IV de SPD</b> encurta a recarga dos golpes (até
          ${D(SPEED_POTENCIAL_TETO_PCT, 'pt')}%), e o IV ainda tira −0,01 s a −0,32 s da Investida — nada
          disso acelera a corrida na hunt.</li>
          <li><b>Defesa</b> reduz o dano recebido na fórmula clássica; mais DEF/Sp.Def = aguenta
          mais hits.</li>
        </ul>

        <h4>A ficha do seu pokémon</h4>
        <p>Clicar num pokémon seu abre a ficha. O que ela mostra, de cima para baixo:</p>
        <ul>
          <li>o pokémon num <b>pedestal com holofote</b> na cor da faixa da nota — o shiny ganha um
          halo dourado que brilha;</li>
          <li>embaixo do pedestal, a <b>placa da nota</b> — num <a data-cap="lendarios">lendário ou
          mítico</a> ela vem "quebrada": <b>INESTIMÁVEL</b> no lugar do número e a faixa <b>GLITCH</b>,
          porque o ×${MULT_LENDARIO_STATS} dele passa do topo da régua;</li>
          <li>o <b>apelido</b> da <a data-cap="loja">Name Tag</a>, quando tem, com a espécie logo
          abaixo — e a <b>skin</b> que ele estiver vestindo;</li>
          <li>a fileira <b>Potência · Qualidade · IV</b> e, lado a lado, o <b>Poder no PvE</b> — a força de
          luta na caça — e o <b>Poder no PvP</b>, com o nível comprimido acima do Nv 150 como no ginásio e no
          PvP ranqueado ("conta como Nv X"), mais o <b>HP de combate</b>;</li>
          <li>os selos <b>P · IV · Q · N</b>, que do azul para cima viram metal — o dourado de P5 se lê
          de relance numa grade cheia;</li>
          <li><b>quem capturou</b> o pokémon — o nome fica mesmo depois que ele troca de dono, e é link para
          o perfil de quem capturou;</li>
          <li>a <b>Medalha de Guerra</b> (<a data-cap="guild">Guilds</a>) e o <b>Troféu</b> de
          campeonato (<a data-cap="campeonato">Campeonatos</a>), que também vão junto numa venda;</li>
          <li>a <b>evolução</b> e a <b>Mega</b> da espécie como link para a Pokédex — numa forma final
          que tem Mega, a ficha mostra a Mega Evolução no lugar do "não evolui". Enquanto o pokémon não
          chega ao nível, a seta diz <b>Precisa de Nv X/N</b>; o N é só o mínimo, e evoluir mantém o nível
          dele;</li>
          <li>o botão <b>Copiar p/ ChatGPT</b>: copia a ficha em texto — espécie, stats-base, IV de cada
          stat, potência, qualidade, shiny e como o jogo calcula — para colar no ChatGPT.</li>
        </ul>`,
      en: `
        <p>These are <b>two different metrics</b> on the pokémon sheet — mixing them up is where
        most “good pokémon” confusion comes from.</p>

        <h4>Score N= (0–10) — aligned with ⚔@100</h4>
        <p>Measures how strong the pokémon was <b>born within its species</b>. Uses the <b>same
        strength (score)</b> as ranking ⚔, as if everyone were <b>level 100</b> — leveling up
        does not change the score; only the ⚔ on the ladder does.</p>
        <pre class="wk-formula">score = birth strength (0–1), same base as ⚔
N=     = 10 × (score − worst) ÷ (best − worst)   ← within species only</pre>
        <ul>
          <li><b>0</b> = worst possible birth <i>for that</i> species; <b>10</b> = P5 + shiny + max IV.</li>
          <li><b>Evolving always RAISES the score</b> — it never drops it and never ties. Every species
          has its own scale, and the new form measures the same birth differently; so the score after
          evolving is at least the previous form's <b>+${D(GANHO_MIN_EVOLUCAO, 'en')}</b> per evolution
          (the lineage floor). Mega Evolving follows the same rule. The only limit is the ceiling: 10
          is still 10.</li>
          <li>Refinement (+N) <b>raises</b> both score and ⚔ — uses current base (species + refine).</li>
        </ul>
        ${nota(`The <a data-cap="comunidade">Community Market</a> requires a minimum calculator score.
        <b>Shiny, P5 and legendary pokémon bypass</b> the bar.`)}

        <h4>Using the Calculator</h4>
        <p>Open it from the <b>calculator</b> square in your portrait column, or from a pokémon's
        sheet (then it comes with that pokémon's numbers). It has two tabs.</p>
        <p><b>Calculate Pokémon.</b> Pick the <b>species first</b> — 0 and 10 are the worst and best
        birth of <i>that</i> species — and fill in the birth: the <b>IV of each stat</b> (six fields,
        1 to 32), quality, potency, shiny and, if you want, the Z-Move. You get:</p>
        <ul>
          <li>the big <b>score</b>, on the pedestal with the spotlight in the <b>tier colour</b> (table
          below), and how far it is from the next tier;</li>
          <li><b>Where the score comes from</b>: how much each axis (IV, quality, potency, shiny)
          weighs in total strength — not a fixed 25%, and a shiny P5 pulls more than a weak common;</li>
          <li><b>Weight of each stat in the score</b>: which stat the species values most. Two pokémon
          with the same IV total can score differently if the points land on different stats;</li>
          <li><b>In combat</b>: the stat multiplier, combat HP, <b>Power (ranking)</b> — the ⚔ at the
          sheet's level — and <b>Power (gym)</b>;</li>
          <li><b>Potential at final evolution</b> and <b>Potential at Mega Evolution</b>: the N= score
          the same birth would have on every reachable final form (Eevee and branches included) and on
          the Mega, flagging whether each one meets the Market bar.</li>
        </ul>
        ${nota(`<b>Legendaries and Mythicals have no score.</b> They are <b>×${MULT_LENDARIO_STATS} on every
        stat</b> (see <a data-cap="potencia">Potency</a>), and that ×${MULT_LENDARIO_STATS} goes past the top
        of the 0–10 ruler. Pick one and the calculator "breaks" — <b>PRICELESS</b> shows up where the
        number would be. The <b>In battle</b> card still works, already with the ×${MULT_LENDARIO_STATS}.`)}
        <p><b>Compare Pokémon.</b> Set up two sides (species, level and birth) and the calculator
        simulates a <b>1×1 attrition duel</b>, with the type chart, STAB and each side's best move
        against the other. You get who wins and in what share of the simulated duels — the range moves
        with damage luck, which is why two close pokémon rarely give 0% or 100%.</p>
        <p>The box color steps up with every point of score — ten tiers in all. A score right on a
        boundary stays in the lower tier.</p>
        ${tabelaDeFaixasDaNota('en')}

        <h4>Power (⚔) — “Strongest Pokémon” ladder</h4>
        <p>A <b>single ranking number</b> on the sheet and ladder. <b>Not the score</b> and
        <b>does not change combat</b> — only sort order. Rises with level, refinement and evolution.</p>
        <pre class="wk-formula">score = same strength as N= (0–1)
power = round( level × 10 × score )   → at lv 100: ⚔ ≈ 1000 × score</pre>
        <p>In <b>combat</b>, quality still uses per-stat exponents; potency, shiny and the Legendary
        ×${MULT_LENDARIO_STATS} still multiply stats. Ranking ⚔ is a separate formula — and it carries the
        ×${MULT_LENDARIO_STATS} too, which the score does not.</p>

        <h4>What changes in combat</h4>
        <ul>
          <li><b>Combat HP</b> = max(24, round(hp × 12)). Wilds get ×5 on top.</li>
          <li><b>Damage</b> uses real ATK/Sp.Atk vs DEF/Sp.Def, type, STAB and effectiveness —
          not the “power” number directly.</li>
          <li><b>Base Speed</b> with the <b>SPD IV</b> shortens move cooldowns (up to
          ${D(SPEED_POTENCIAL_TETO_PCT, 'en')}%), and the IV also takes −0.01 s to −0.32 s off Tackle —
          none of it speeds up running on the hunt map.</li>
          <li><b>Defense</b> lowers damage taken in the classic formula.</li>
        </ul>

        <h4>Your pokémon's sheet</h4>
        <p>Clicking one of your pokémon opens its sheet. What it shows, top to bottom:</p>
        <ul>
          <li>the pokémon on a <b>spotlit pedestal</b> in its score tier's colour — a shiny gets a
          glowing golden halo;</li>
          <li>under the pedestal, the <b>score plate</b> — on a <a data-cap="lendarios">legendary or
          mythical</a> it comes "broken": <b>PRICELESS</b> instead of the number and the <b>GLITCH</b>
          band, because its ×${MULT_LENDARIO_STATS} goes past the top of the ruler;</li>
          <li>the <b>nickname</b> from a <a data-cap="loja">Name Tag</a>, if it has one, with the species
          right below — and the <b>skin</b> it is wearing;</li>
          <li>the <b>Potency · Quality · IV</b> row and, side by side, <b>Power in PvE</b> — the fighting
          strength in hunts — and <b>Power in PvP</b>, with the level compressed above Lv 150 as in gyms
          and ranked PvP ("counts as Lv X"), plus <b>Combat HP</b>;</li>
          <li>the <b>P · IV · Q · N</b> badges, which turn to metal from blue up — the gold of a P5
          reads at a glance in a full grid;</li>
          <li><b>who caught</b> the pokémon — the name stays even after it changes hands, and links to the
          catcher's profile;</li>
          <li>the <b>War Medal</b> (<a data-cap="guild">Guilds</a>) and the championship <b>Trophy</b>
          (<a data-cap="campeonato">Championships</a>), which also go along in a sale;</li>
          <li>the species' <b>evolution</b> and <b>Mega</b> as links to the Pokédex — on a final form
          that has a Mega, the sheet shows Mega Evolution instead of "does not evolve". Until the pokémon
          reaches the level, the arrow says <b>Needs Lv X/N</b>; N is only the minimum, and evolving keeps
          its level;</li>
          <li>the <b>Copy for ChatGPT</b> button: copies the sheet as text — species, base stats, the IV
          of each stat, potency, quality, shiny and how the game calculates — to paste into ChatGPT.</li>
        </ul>`,
      es: `
        <p>Son <b>dos métricas distintas</b> en la ficha — confundirlas es el origen de casi todo
        malentendido sobre “pokémon bueno”.</p>

        <h4>Nota N= (0–10) — alineada al ⚔@100</h4>
        <p>Mide qué tan fuerte nació el pokémon <b>dentro de la especie</b>. Usa la <b>misma fuerza
        (score)</b> del ranking ⚔, como si todos estuvieran en <b>nivel 100</b> — subir de nivel
        no cambia la nota, solo el ⚔ del placar.</p>
        <pre class="wk-formula">score = fuerza al nacer (0–1), misma base del ⚔
nota  = 10 × (score − peor posible) ÷ (mejor − peor)   ← solo dentro de la especie</pre>
        <ul>
          <li><b>0</b> = peor nacimiento posible <i>de esa</i> especie; <b>10</b> = P5 + shiny + IV máximo.</li>
          <li><b>Evolucionar siempre SUBE la nota</b> — nunca la baja y nunca empata. Cada especie
          tiene su propia regla, y la forma nueva mide el mismo nacimiento de otra manera; por eso la
          nota después de evolucionar es, como mínimo, la de la forma anterior
          <b>+${D(GANHO_MIN_EVOLUCAO, 'es')}</b> por evolución (el piso del linaje). Megaevolucionar
          sigue la misma regla. El único límite es el techo: 10 sigue siendo 10.</li>
          <li>El refinado (+N) <b>sube</b> la nota y el ⚔ — usa la base actual (especie + refino).</li>
        </ul>
        ${nota(`El <a data-cap="comunidade">Mercado de la Comunidad</a> exige nota mínima en la
        calculadora. <b>Shiny, P5 y legendarios entran</b> aunque estén por debajo.`)}

        <h4>La Calculadora en la práctica</h4>
        <p>Ábrela con el cuadradito de la <b>calculadora</b>, en la columna de tu retrato, o desde la
        ficha de un pokémon (entonces ya viene con sus números). Tiene dos pestañas.</p>
        <p><b>Calcular Pokémon.</b> Elige la <b>especie primero</b> — 0 y 10 son el peor y el mejor
        nacimiento <i>de esa</i> especie — y rellena el nacimiento: el <b>IV de cada stat</b> (seis
        campos, de 1 a 32), la calidad, la potencia, el shiny y, si quieres, el Z-Move. Sale:</p>
        <ul>
          <li>la <b>nota</b> grande, en el pedestal con el foco en el <b>color del rango</b> (tabla
          abajo), y cuánto falta para el rango siguiente;</li>
          <li><b>De dónde viene la nota</b>: cuánto pesa cada eje (IV, calidad, potencia, shiny) en la
          fuerza total — no son 25% fijos, y un P5 shiny pesa más que un común débil;</li>
          <li><b>Peso de cada stat en la nota</b>: qué stat valora más la especie. Dos pokémon con la
          misma suma de IV pueden tener notas distintas si los puntos caen en stats distintos;</li>
          <li><b>En combate</b>: el multiplicador de stats, el HP de combate, el <b>Poder (ranking)</b>
          — el ⚔ al nivel de la ficha — y el <b>Poder (gimnasio)</b>;</li>
          <li><b>Potencial en la evolución final</b> y <b>Potencial en la Mega Evolución</b>: la nota
          N= que el mismo nacimiento tendría en las formas finales alcanzables (Eevee y ramificaciones
          incluidas) y en la Mega, avisando si cada una alcanza la barra del Mercado.</li>
        </ul>
        ${nota(`<b>Los legendarios y míticos no tienen nota.</b> Son <b>×${MULT_LENDARIO_STATS} en todos los
        stats</b> (ver <a data-cap="potencia">Potencia</a>), y ese ×${MULT_LENDARIO_STATS} pasa del tope de la
        regla de 0 a 10. Con uno elegido, la calculadora "se rompe" — aparece <b>INESTIMABLE</b> en lugar
        del número. La tarjeta <b>En combate</b> sigue valiendo, ya con el ×${MULT_LENDARIO_STATS}.`)}
        <p><b>Comparar Pokémon.</b> Arma dos lados (especie, nivel y nacimiento) y la calculadora
        simula un <b>duelo 1×1 de desgaste</b>, con la tabla de tipos, el STAB y el mejor golpe de cada
        uno contra el otro. Sale quién gana y en qué parte de los duelos simulados — el rango varía con
        la suerte del daño, y por eso dos pokémon parecidos rara vez dan 0% o 100%.</p>
        <p>El color de la caja sube un escalón por cada punto de nota — son diez rangos. Una nota
        justo en el límite queda en el rango de abajo.</p>
        ${tabelaDeFaixasDaNota('es')}

        <h4>Poder (⚔) — ranking “Pokémon Fuerte”</h4>
        <p>Es un <b>número único</b> en el placar y la ficha. <b>No es la nota</b> y <b>no cambia
        el combate</b> — solo ordena el ranking. Sube con nivel, refinado y evolución.</p>
        <pre class="wk-formula">score = misma fuerza que la nota (0–1)
poder = redond( nivel × 10 × score )   → en nv 100: ⚔ ≈ 1000 × score</pre>
        <p>En <b>combate</b> la calidad sigue como exponente por stat; potencia, shiny y el
        ×${MULT_LENDARIO_STATS} del legendario siguen multiplicando stats. El ⚔ del ranking es otra cuenta —
        y también lleva el ×${MULT_LENDARIO_STATS}, que la nota no lleva.</p>

        <h4>Qué cambia en combate</h4>
        <ul>
          <li><b>HP de combate</b> = máx(24, redond(hp × 12)).</li>
          <li><b>Daño</b> usa ATK/DEF reales — no el número “poder” directamente.</li>
          <li>El <b>Speed base</b> con el <b>IV de SPD</b> acorta la recarga de los golpes (hasta
          ${D(SPEED_POTENCIAL_TETO_PCT, 'es')}%), y el IV además quita −0,01 s a −0,32 s a la Embestida —
          nada de eso acelera la carrera en la cacería.</li>
        </ul>

        <h4>La ficha de tu pokémon</h4>
        <p>Pulsar uno de tus pokémon abre su ficha. Lo que muestra, de arriba abajo:</p>
        <ul>
          <li>el pokémon en un <b>pedestal con foco</b> en el color del rango de su nota — el shiny
          lleva un halo dorado que brilla;</li>
          <li>debajo del pedestal, la <b>placa de la nota</b> — en un <a data-cap="lendarios">legendario o
          mítico</a> viene "rota": <b>INESTIMABLE</b> en lugar del número y la franja <b>GLITCH</b>,
          porque su ×${MULT_LENDARIO_STATS} pasa del tope de la regla;</li>
          <li>el <b>apodo</b> de la <a data-cap="loja">Name Tag</a>, si tiene, con la especie justo
          debajo — y la <b>skin</b> que lleve puesta;</li>
          <li>la fila <b>Potencia · Calidad · IV</b> y, lado a lado, el <b>Poder en PvE</b> — la fuerza de
          pelea en la cacería — y el <b>Poder en PvP</b>, con el nivel comprimido por encima del Nv 150 como
          en el gimnasio y en el PvP clasificatorio ("cuenta como Nv X"), más el <b>HP de combate</b>;</li>
          <li>los sellos <b>P · IV · Q · N</b>, que del azul para arriba son de metal — el dorado de P5
          se lee de un vistazo en una cuadrícula llena;</li>
          <li><b>quién lo capturó</b> — el nombre se queda aunque cambie de dueño, y es enlace al perfil de
          quien lo capturó;</li>
          <li>la <b>Medalla de Guerra</b> (<a data-cap="guild">Guilds</a>) y el <b>Trofeo</b> de
          campeonato (<a data-cap="campeonato">Campeonatos</a>), que también van con él en una
          venta;</li>
          <li>la <b>evolución</b> y la <b>Mega</b> de la especie como enlace a la Pokédex — en una forma
          final que tiene Mega, la ficha muestra la Mega Evolución en lugar de "no evoluciona". Mientras el
          pokémon no llega al nivel, la flecha dice <b>Necesita Nv X/N</b>; el N es solo el mínimo, y
          evolucionar mantiene su nivel;</li>
          <li>el botón <b>Copiar p/ ChatGPT</b>: copia la ficha en texto — especie, stats base, el IV de
          cada stat, potencia, calidad, shiny y cómo calcula el juego — para pegarla en ChatGPT.</li>
        </ul>`,
    }),
  },

  // ----------------------------------------------------------- 4. potência
  {
    id: 'potencia',
    titulo: { pt: 'Potência (I a V)', en: 'Potency (I to V)', es: 'Potencia (I a V)' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>A <b>potência</b> é o segundo eixo que separa dois pokémon iguais — o primeiro é a
        qualidade. É um número de <b>1 a 5</b>, sorteado <b>uma vez, na captura</b>, e que
        <b>nunca muda</b>: subir de nível não melhora a potência.</p>
        ${tabelaDePotencia(c)}
        <p>O bônus multiplica <b>os seis stats</b> e entra no mesmo ponto da qualidade.</p>

        ${nota(`É por causa dela que um pokémon de <b>nível baixo</b> pode valer muito no
        <a data-cap="comunidade">Mercado da Comunidade</a>: nível qualquer um sobe, potência
        não. Um P4 nível 20 vale mais que um P1 nível 80 da mesma espécie.`)}

        <h4>Potência e shiny se multiplicam</h4>
        <p>Shiny é <b>×${c.d.multShinyStats}</b> em tudo. Um <b>P5 shiny</b> é
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)}</b> —
        ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} vezes um pokémon comum da mesma espécie e nível.</p>

        <h4>E o lendário é ×${MULT_LENDARIO_STATS}</h4>
        <p>Todo <b>Lendário ou Mítico</b> — os da <a data-cap="mistico">Arena Mística</a> — é
        <b>×${MULT_LENDARIO_STATS} em todos os stats</b>, o maior multiplicador do jogo. Vale pela espécie e
        se multiplica com os outros dois: um lendário <b>P5 shiny</b> é
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS}</b>.
        Ele não tem nota na <a data-cap="nota">Calculadora</a>: o ×${MULT_LENDARIO_STATS} passa do topo da régua.
        A tabela de todas as combinações, e o piso de quem sai da Arena Mística, estão em
        <a data-cap="lendarios">Lendários e Míticos</a>.</p>

        <p>Abra a ficha de qualquer espécie na <b>Pokédex</b> para ver o poder que cada potência
        daria naquele bicho.</p>`,
      en: `
        <p><b>Potency</b> is the second axis separating two otherwise identical pokémon — the
        first is quality. It is a number from <b>1 to 5</b>, rolled <b>once, at capture</b>, that
        <b>never changes</b>: levelling up does not improve potency.</p>
        ${tabelaDePotencia(c)}
        <p>The bonus multiplies <b>all six stats</b> and enters at the same point as quality.</p>

        ${nota(`This is why a <b>low-level</b> pokémon can be worth a lot on the
        <a data-cap="comunidade">Community Market</a>: anyone can grind levels, nobody can grind
        potency. A level 20 P4 is worth more than a level 80 P1 of the same species.`)}

        <h4>Potency and shiny multiply</h4>
        <p>Shiny is <b>×${c.d.multShinyStats}</b> on everything. A <b>shiny P5</b> is
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)}</b> —
        ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} times a common pokémon of the same species and level.</p>

        <h4>And a Legendary is ×${MULT_LENDARIO_STATS}</h4>
        <p>Every <b>Legendary or Mythical</b> — the ones from the <a data-cap="mistico">Mystic Arena</a> — is
        <b>×${MULT_LENDARIO_STATS} on every stat</b>, the biggest multiplier in the game. It goes by species and
        multiplies with the other two: a <b>shiny P5</b> Legendary is
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS}</b>.
        It has no score in the <a data-cap="nota">Calculator</a>: the ×${MULT_LENDARIO_STATS} goes past the top of the ruler.
        The table of every combination, and the floor of what comes out of the Mystic Arena, are in
        <a data-cap="lendarios">Legendaries and Mythicals</a>.</p>

        <p>Open any species sheet in the <b>Pokédex</b> to see the power each potency would give
        that creature.</p>`,
      es: `
        <p>La <b>potencia</b> es el segundo eje que separa a dos pokémon iguales — el primero es la
        calidad. Es un número de <b>1 a 5</b>, sorteado <b>una vez, en la captura</b>, y que
        <b>nunca cambia</b>: subir de nivel no mejora la potencia.</p>
        ${tabelaDePotencia(c)}
        <p>El bono multiplica <b>los seis stats</b> y entra en el mismo punto que la calidad.</p>

        ${nota(`Por eso un pokémon de <b>nivel bajo</b> puede valer mucho en el
        <a data-cap="comunidade">Mercado de la Comunidad</a>: el nivel lo sube cualquiera, la
        potencia no. Un P4 de nivel 20 vale más que un P1 de nivel 80 de la misma especie.`)}

        <h4>Potencia y shiny se multiplican</h4>
        <p>Shiny es <b>×${c.d.multShinyStats}</b> en todo. Un <b>P5 shiny</b> es
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)}</b> —
        ${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3)} veces un pokémon común de la misma especie y nivel.</p>

        <h4>Y el legendario es ×${MULT_LENDARIO_STATS}</h4>
        <p>Todo <b>Legendario o Mítico</b> — los de la <a data-cap="mistico">Arena Mística</a> — es
        <b>×${MULT_LENDARIO_STATS} en todos los stats</b>, el mayor multiplicador del juego. Vale por especie y
        se multiplica con los otros dos: un legendario <b>P5 shiny</b> es
        <b>×${(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1)) * (c.d.multShinyStats ?? 3) * MULT_LENDARIO_STATS}</b>.
        No tiene nota en la <a data-cap="nota">Calculadora</a>: el ×${MULT_LENDARIO_STATS} pasa del tope de la regla.
        La tabla de todas las combinaciones, y el piso de lo que sale de la Arena Mística, están en
        <a data-cap="lendarios">Legendarios y Míticos</a>.</p>

        <p>Abre la ficha de cualquier especie en la <b>Pokédex</b> para ver el poder que cada
        potencia daría en ese bicho.</p>`,
    }),
  },

  // -------------------------------------------------------------- 5. shiny
  {
    id: 'shiny',
    titulo: { pt: 'Shiny', en: 'Shiny', es: 'Shiny' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p><b>${Object.keys(c.d.shinyLooks ?? {}).length} espécies</b> têm forma shiny. Ela
        só se revela na <b>tentativa de captura</b> — com arte própria (não é o mesmo desenho com
        outra cor) e um selo ✨ no cartão.</p>

        <h4>Quanto é raro</h4>
        <p>A chance é <b>a mesma para todas</b> — <b>1 em ${Math.round(1 / Number(c.d.chanceShiny)).toLocaleString('en-US').replace(/,/g, '.')}</b> por tentativa de
        captura. O brilho é sorteado no <b>arremesso</b> da bola, antes de se saber se ela fecha;
        qualidade, IV e potência só rolam se a captura der certo. Na hunt, todo selvagem parece
        comum até a bola ser arremessada. Na <b>Outland</b> o shiny não rola: as variantes de lá nunca
        saem brilhantes.</p>
        ${tabelaDeShiny(c)}
        <p>O <b>Shiny Secret Lure</b>, da <a data-cap="loja">Loja</a>, <b>dobra</b> essa chance
        enquanto estiver ativo (1 em ${Math.round(1 / (Number(c.d.chanceShiny) * 2)).toLocaleString('en-US').replace(/,/g, '.')}).
        O <a data-cap="bonusLive">Bônus na Kick</a> de Secret Lure soma +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'pt')}%
        por cima, multiplicando.</p>
        <p>A mesma chance vale fora da hunt: um <a data-cap="chocadeira">Mystery Egg</a> pode chocar
        shiny, e o lendário capturado na <a data-cap="mistico">Arena Mística</a> também. E o
        <a data-cap="ovoShiny">Ovo Shiny</a> — fabricado no Professor Carvalho com fragmentos que caem de
        Unova para frente — nasce shiny com certeza.</p>

        <h4>O que o brilho dá</h4>
        <ul>
          <li><b>×${c.d.multShinyStats} em todos os stats.</b> Só o <a data-cap="lendarios">lendário</a> (×${MULT_LENDARIO_STATS}) passa dele,
          e ele se multiplica com a potência.</li>
          <li><b>IV alto garantido</b>: o sorteio é refeito até a soma dos seis passar de
          <b>110</b> (o máximo é 192).</li>
          <li><b>Vale 10× a mais</b> na venda ao NPC (ver <a data-cap="market">Market</a>).</li>
          <li><b>Sobe a nota da calculadora</b> — o ×${c.d.multShinyStats ?? 3} nos stats entra na mesma conta de força de
          nascimento (ver <a data-cap="nota">Nota, Poder e Calculadora</a>).</li>
        </ul>

        ${nota(`<b>Capturar um shiny usa a mesma pokébola e a mesma chance por arremesso que
        qualquer outro.</b> O brilho é sorteado no arremesso — não dá para saber antes —, e um
        shiny que escapa da bola vai embora junto com o corpo. Por isso vale gastar a melhor bola
        em todo corpo; a tabela de cada espécie está na ficha da Pokédex.`, 'aviso')}

        <h4>Evolução shiny</h4>
        <p>Um shiny <b>evolui</b>, mas não com a pedra comum: ele precisa de uma
        <b>Shiny Stone</b> do <b>tipo primário</b> da espécie. Um Shiny Abra pede a pedra
        <b>PSYCHIC</b> e vira um Shiny Kadabra; um Shiny Bulbasaur (GRASS/POISON) pede a de
        <b>GRASS</b>, porque o primário é o que conta.</p>

        <p>A pedra vem de <b>${N(custoFragPedra(c), c.lang)} Fragmentos de Shiny Stone</b>, na
        bancada <b>Fabricar Shiny Stone</b> do <b>Professor Carvalho</b>. O fragmento cai só na
        <b>Outland</b>, a ${pctFragPedra(c)} por derrota — cerca de <b>${mediaFragPedra(c)}</b>
        kills por fragmento.${dicaOutlandTiers(c)} Você escolhe o tipo na hora de fabricar, então os dez fragmentos
        nunca saem no tipo errado.</p>

        ${nota(`<b>Se a evolução ainda não tem forma shiny no jogo, a evolução é RECUSADA.</b>
        É proposital: sem a arte shiny da próxima etapa, evoluir trocaria o seu bicho raro por um
        de cor comum — e isso não teria como ser desfeito. A pedra pronta e o fragmento são
        negociáveis no <a data-cap="comunidade">Mercado da Comunidade</a>.`, 'atencao')}
`,
      en: `
        <p><b>${Object.keys(c.d.shinyLooks ?? {}).length} species</b> have a shiny form. It is
        only revealed on a <b>capture attempt</b> — with its own artwork (not a recolour) and a ✨
        badge on the card.</p>

        <h4>How rare it is</h4>
        <p>The chance is <b>the same for every species</b> — <b>1 in ${Math.round(1 / Number(c.d.chanceShiny)).toLocaleString('en-US')}</b> per capture
        attempt. The shine is rolled when the ball is <b>thrown</b>, before anyone knows whether it
        closes; quality, IV and potency only roll if the capture succeeds. In a hunt, every wild
        looks common until the ball is thrown. In the <b>Outland</b> shiny doesn't roll: the variants
        there never come out shiny.</p>
        ${tabelaDeShiny(c)}
        <p>The <b>Shiny Secret Lure</b>, from the <a data-cap="loja">Shop</a>, <b>doubles</b> that
        chance while active (1 in ${Math.round(1 / (Number(c.d.chanceShiny) * 2)).toLocaleString('en-US')}).
        The Secret Lure from the <a data-cap="bonusLive">Kick Bonus</a> adds
        +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'en')}% on top, multiplying.</p>
        <p>The same chance applies outside the hunt: a <a data-cap="chocadeira">Mystery Egg</a> can
        hatch shiny, and so can the legendary caught in the <a data-cap="mistico">Mystic Arena</a>. And
        the <a data-cap="ovoShiny">Shiny Egg</a> — crafted at Professor Oak from fragments that drop from
        Unova onward — always hatches shiny.</p>

        <h4>What the shine gives</h4>
        <ul>
          <li><b>×${c.d.multShinyStats} on every stat.</b> Only a <a data-cap="lendarios">Legendary</a> (×${MULT_LENDARIO_STATS}) beats it,
          and it stacks multiplicatively with potency.</li>
          <li><b>Guaranteed high IV</b>: the roll is repeated until the six sum above <b>110</b>
          (the maximum is 192).</li>
          <li><b>Worth 10× more</b> when sold to the NPC (see <a data-cap="market">Market</a>).</li>
          <li><b>Raises the calculator score</b> — the ×${c.d.multShinyStats ?? 3} on stats enters the same birth-strength
          formula (see <a data-cap="nota">Score, Power and Calculator</a>).</li>
        </ul>

        ${nota(`<b>Catching a shiny uses the same ball and the same per-throw chance as any
        other.</b> The shine is rolled on the throw — you cannot tell beforehand — and a shiny that
        breaks out of the ball leaves together with the body. So spend your best ball on every
        body; the per-species table is on the Pokédex sheet.`, 'aviso')}

        <h4>Shiny evolution</h4>
        <p>A shiny <b>can evolve</b>, but not with the ordinary stone: it needs a
        <b>Shiny Stone</b> of the species <b>primary type</b>. A Shiny Abra needs the
        <b>PSYCHIC</b> stone and becomes a Shiny Kadabra; a Shiny Bulbasaur (GRASS/POISON) needs
        the <b>GRASS</b> one, because the primary type is what counts.</p>

        <p>The stone comes from <b>${N(custoFragPedra(c), c.lang)} Shiny Stone Fragments</b>, at
        the <b>Craft Shiny Stone</b> bench at <b>Professor Oak</b>. The fragment only drops in
        <b>Outland</b>, at ${pctFragPedra(c)} per kill — around <b>${mediaFragPedra(c)}</b> kills
        per fragment.${dicaOutlandTiers(c)} You pick the type when crafting, so the ten fragments never come out as the
        wrong type.</p>

        ${nota(`<b>If the evolution has no shiny form in the game yet, the evolution is
        REFUSED.</b> That is deliberate: without the shiny art for the next stage, evolving would
        trade your rare pokémon for a normally coloured one — and that could not be undone. Both
        the finished stone and the fragment are tradeable on the
        <a data-cap="comunidade">Community Market</a>.`, 'atencao')}
`,
      es: `
        <p><b>${Object.keys(c.d.shinyLooks ?? {}).length} especies</b> tienen forma shiny. Solo se
        revela en el <b>intento de captura</b> — con arte propio (no es el mismo dibujo con otro
        color) y un sello ✨ en la carta.</p>

        <h4>Qué tan raro es</h4>
        <p>La probabilidad es <b>la misma para todas</b> — <b>1 entre ${Math.round(1 / Number(c.d.chanceShiny)).toLocaleString('en-US').replace(/,/g, '.')}</b> por intento
        de captura. El brillo se sortea al <b>lanzar</b> la bola, antes de saber si cierra; calidad,
        IV y potencia solo se sortean si la captura sale bien. En la cacería, todo salvaje parece
        común hasta que se lanza la bola. En <b>Outland</b> el shiny no sale: las variantes de allí
        nunca salen brillantes.</p>
        ${tabelaDeShiny(c)}
        <p>El <b>Shiny Secret Lure</b>, de la <a data-cap="loja">Tienda</a>, <b>duplica</b> esa
        probabilidad mientras esté activo (1 entre ${Math.round(1 / (Number(c.d.chanceShiny) * 2)).toLocaleString('en-US').replace(/,/g, '.')}).
        El Secret Lure del <a data-cap="bonusLive">Bono en Kick</a> suma
        +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'es')}% encima, multiplicando.</p>
        <p>La misma probabilidad vale fuera de la cacería: un <a data-cap="chocadeira">Mystery Egg</a>
        puede eclosionar shiny, y el legendario capturado en la <a data-cap="mistico">Arena
        Mística</a> también. Y el <a data-cap="ovoShiny">Huevo Shiny</a> — fabricado con el Profesor Oak
        con fragmentos que caen de Unova en adelante — nace shiny con seguridad.</p>

        <h4>Qué da el brillo</h4>
        <ul>
          <li><b>×${c.d.multShinyStats} en todos los stats.</b> Solo el <a data-cap="lendarios">legendario</a> (×${MULT_LENDARIO_STATS}) lo
          supera, y se multiplica con la potencia.</li>
          <li><b>IV alto garantizado</b>: el sorteo se repite hasta que la suma de los seis pase de
          <b>110</b> (el máximo es 192).</li>
          <li><b>Vale 10× más</b> al venderlo al NPC (ver <a data-cap="market">Market</a>).</li>
          <li><b>Sube la nota de la calculadora</b> — el ×${c.d.multShinyStats ?? 3} en stats entra en la misma cuenta de
          fuerza al nacer (ver <a data-cap="nota">Nota, Poder y Calculadora</a>).</li>
        </ul>

        ${nota(`<b>Capturar un shiny usa la misma poké ball y la misma probabilidad por lanzamiento
        que cualquier otro.</b> El brillo se sortea en el lanzamiento — no se puede saber antes —, y
        un shiny que escapa de la bola se va junto con el cuerpo. Por eso vale gastar la mejor bola
        en cada cuerpo; la tabla por especie está en la ficha de la Pokédex.`, 'aviso')}

        <h4>Evolución shiny</h4>
        <p>Un shiny <b>evoluciona</b>, pero no con la piedra común: necesita una
        <b>Shiny Stone</b> del <b>tipo primario</b> de la especie. Un Shiny Abra pide la piedra
        <b>PSYCHIC</b> y se convierte en Shiny Kadabra; un Shiny Bulbasaur (GRASS/POISON) pide la
        de <b>GRASS</b>, porque el primario es el que cuenta.</p>

        <p>La piedra sale de <b>${N(custoFragPedra(c), c.lang)} Fragmentos de Shiny Stone</b>, en
        el banco <b>Fabricar Shiny Stone</b> del <b>Profesor Oak</b>. El fragmento cae solo en
        <b>Outland</b>, al ${pctFragPedra(c)} por derrota — unos <b>${mediaFragPedra(c)}</b> kills
        por fragmento.${dicaOutlandTiers(c)} Eliges el tipo al fabricar, así que los diez fragmentos nunca salen del
        tipo equivocado.</p>

        ${nota(`<b>Si la evolución todavía no tiene forma shiny en el juego, la evolución se
        RECHAZA.</b> Es a propósito: sin el arte shiny de la siguiente etapa, evolucionar cambiaría
        tu pokémon raro por uno de color común — y eso no se podría deshacer. La piedra terminada
        y el fragmento son negociables en el <a data-cap="comunidade">Mercado de la
        Comunidad</a>.`, 'atencao')}
`,
    }),
  },

  // ------------------------------------------------- 5a. lendários e míticos
  //
  // Logo depois de Shiny: são os três multiplicadores de nascimento — potência, shiny e lendário —, e
  // este capítulo junta o que estava espalhado pela Nota, pela Potência e pela Arena Mística: o ×4
  // (`MULT_LENDARIO_STATS`, 12/10/2026), como ele se multiplica com os outros dois (a conta de
  // `multDeNascenca`), onde ele vale, onde não entra, e o piso do capturado (`shared/mistico.mjs`) —
  // um só, igual para toda espécie. O sorteio vem do `welcome` (`misticoPool`) e os nomes do catálogo.
  {
    id: 'lendarios',
    titulo: { pt: 'Lendários e Míticos', en: 'Legendaries and Mythicals', es: 'Legendarios y Míticos' },
    grupo: 'basico',
    html: (c) => {
      const x = MULT_LENDARIO_STATS;
      const sh = D(c.d.multShinyStats ?? 3, c.lang);
      const multP = (n) => 1 + (c.d.potencias?.find((p) => p.n === n)?.bonus ?? 0);
      const p5 = D(multP(5), c.lang);
      const teto = D(multP(5) * (c.d.multShinyStats ?? 3) * x, c.lang);
      const piso = D(multP(MISTICO_POTENCIA_MIN) * x, c.lang);
      const pMin = MISTICO_POTENCIA_MIN;
      const nv = N(NIVEL_LENDARIO_MISTICO, c.lang);
      const q = D(MISTICO_QUALIDADE_MIN, c.lang);
      const iv = N(MISTICO_IV_SOMA_MIN, c.lang);
      const shiny = umEm(Number(c.d.chanceShiny ?? 0));
      const sorteio = listaDoSorteioMistico(c);
      return {
        pt: `
        <p>Os <b>Lendários e Míticos</b> são os pokémon mais fortes do jogo: valem <b>×${x} em todos os
        stats</b> — HP, Ataque, Defesa, Sp. Atk, Sp. Def e Speed. É o maior multiplicador do jogo, acima
        do <a data-cap="shiny">shiny</a> (×${sh}) e da <a data-cap="potencia">potência</a> máxima (P5,
        ×${p5}).</p>

        <h4>Quem conta</h4>
        <p>Todo Lendário e Mítico de Kanto a Paldea — as Ultra Beasts entram como lendárias. Vale pela
        <b>espécie</b>, e não pelo caminho até ela: todo lendário da sua conta tem o ×${x}, venha de onde
        vier. A cópia de Orre de um lendário também é lendária; as variantes da Outland não são. Na ficha
        de cada um, na <a data-cap="pokedex">Pokédex</a>, aparece a placa <b>Bônus de lendário ×${x}</b>
        (ou <b>Bônus de mítico</b>).</p>
        ${sorteio}

        <h4>Os bônus se multiplicam</h4>
        <p>Potência, shiny e lendário <b>não se substituem — se multiplicam</b>. A conta é sempre
        <b>potência × shiny × lendário</b>, igual nos seis stats:</p>
        ${tabelaMultiplicadores(c)}
        <p>Um lendário <b>P5 shiny</b> é <b>×${teto}</b> (×${p5} da potência × ${sh} do shiny × ${x} do
        lendário): ${teto} vezes os stats que a mesma espécie teria sem bônus nenhum, no mesmo nível, com
        a mesma qualidade e os mesmos IVs.</p>

        <h4>Onde o ×${x} vale</h4>
        <ul>
          <li><b>Em todo combate</b>: hunt, ginásios, PvP, Guerra de Guilds e campeonatos — inclusive nas
          arenas com teto de nível, porque o ×${x} é do pokémon, e não do nível.</li>
          <li>No <b>Poder (⚔)</b> do ranking e da ficha.</li>
          <li>No cartão <b>Em combate</b> da <a data-cap="nota">Calculadora</a>.</li>
        </ul>

        <h4>Onde ele não entra</h4>
        <ul>
          <li><b>Na nota.</b> A régua de 0 a 10 mede o nascimento <i>dentro</i> da espécie, e o ×${x}
          passa do topo dela — por isso o lendário não tem nota. A Calculadora "quebra" e mostra
          <b>INESTIMÁVEL</b>, a placa da ficha do pokémon mostra <b>INESTIMÁVEL</b> com a faixa
          <b>GLITCH</b>, e o selo N= dos cartões vira <b>GLITCH</b>.</li>
          <li><b>No <a data-cap="showdown">Showdown</a> e no <a data-cap="campeonato">Campeonato</a>
          Amador</b>: lendário e mítico são proibidos. No Mundial eles entram.</li>
          <li><b>Na <a data-cap="chocadeira">Chocadeira</a></b>: nenhum ovo choca lendário ou mítico.</li>
          <li><b>Nas hunts</b>: nenhuma hunt tem espécie lendária. Os <a data-cap="bosses">Bosses</a> têm
          forma de lendário, mas são lutas de arena — não se capturam e não levam o ×${x}.</li>
        </ul>

        <h4>Como conseguir</h4>
        <p>Hoje, só na <a data-cap="mistico">Arena Mística</a>: o <b>Mystic Ticket</b> cai dos Bosses e abre
        a arena com um lendário ou mítico sorteado, que luta no <b>seu nível de treinador</b> e já com o
        ×${x}. Derrubou, você tem <b>uma bola</b> — e a chance de captura é a mesma para todos, do Articuno
        ao Mewtwo.</p>
        <p>Também dá para <b>comprar e vender</b>: no <a data-cap="comunidade">Mercado da Comunidade</a> o lendário
        tem <b>passe livre</b> — entra em qualquer nível e nota, como o shiny e o P5.</p>

        <h4>O piso: o mesmo para todos</h4>
        <p>Todo lendário capturado na arena nasce no <b>nível ${nv}</b> e com o <b>mesmo piso</b>, seja qual
        for a espécie:</p>
        <ul>
          <li><b>qualidade ${q} ou mais</b> — rerola até passar, então o que sai é a escada natural acima do
          piso, e não um monte de ${q} cravado;</li>
          <li><b>IV somado ${iv} ou mais</b> (de 192), cada IV de 1 a 32;</li>
          <li><b>potência P${pMin} ou mais</b> — a roleta gira como em toda captura, e o que sairia abaixo de
          P${pMin} vira P${pMin}.</li>
        </ul>
        ${tabelaPotenciaMistica(c)}
        <p>Ou seja: o lendário da arena sai com <b>pelo menos ×${piso}</b> em todos os stats. O
        <b>shiny</b> rola com a chance cheia do jogo (${shiny}, dobrada pelo Shiny Secret Lure) — desde que
        a espécie tenha forma shiny.</p>
        ${nota(`<b>Guarde o seu lendário na Coleção.</b> O <b>Auto Coleção</b> já faz isso por padrão: a regra
        <b>Lendário/Mítico</b> vem ligada para todo jogador. Se você a desligar, lembre que a nota do
        lendário fica escondida atrás do GLITCH — a regra da nota nunca o pega. Fora da Coleção,
        o lendário entra no <b>Vender todo o Depot</b> do <a data-cap="market">Market</a> e pode ser
        escolhido pela <a data-cap="oferenda">Oferenda</a> automática. A setinha dourada do card manda
        ele para a Coleção num toque.`, 'atencao')}`,
        en: `
        <p><b>Legendaries and Mythicals</b> are the strongest pokémon in the game: they are <b>×${x} on
        every stat</b> — HP, Attack, Defense, Sp. Atk, Sp. Def and Speed. It is the biggest multiplier in
        the game, above <a data-cap="shiny">shiny</a> (×${sh}) and top <a data-cap="potencia">potency</a>
        (P5, ×${p5}).</p>

        <h4>Who counts</h4>
        <p>Every Legendary and Mythical from Kanto to Paldea — Ultra Beasts count as legendaries. It goes by
        <b>species</b>, not by how you got it: every legendary on your account has the ×${x}, wherever it
        came from. An Orre copy of a legendary is legendary too; Outland variants are not. Each one's sheet
        in the <a data-cap="pokedex">Pokédex</a> shows the <b>Legendary bonus ×${x}</b> plate (or
        <b>Mythical bonus</b>).</p>
        ${sorteio}

        <h4>The bonuses multiply</h4>
        <p>Potency, shiny and legendary <b>don't replace each other — they multiply</b>. The formula is
        always <b>potency × shiny × legendary</b>, the same on all six stats:</p>
        ${tabelaMultiplicadores(c)}
        <p>A <b>shiny P5</b> legendary is <b>×${teto}</b> (×${p5} from potency × ${sh} from shiny × ${x} from
        legendary): ${teto} times the stats the same species would have with no bonus at all, at the same
        level, with the same quality and IVs.</p>

        <h4>Where the ×${x} counts</h4>
        <ul>
          <li><b>In every battle</b>: hunts, gyms, PvP, the Guild War and championships — level-capped arenas
          included, because the ×${x} belongs to the pokémon, not to its level.</li>
          <li>In the <b>Power (⚔)</b> of the ranking and the sheet.</li>
          <li>In the <b>In battle</b> card of the <a data-cap="nota">Calculator</a>.</li>
        </ul>

        <h4>Where it doesn't go</h4>
        <ul>
          <li><b>Into the score.</b> The 0–10 ruler measures a birth <i>within</i> the species, and the
          ×${x} goes past its top — so a legendary has no score. The Calculator "breaks" and shows
          <b>PRICELESS</b>, the pokémon sheet's plate shows <b>PRICELESS</b> with the <b>GLITCH</b> band,
          and the N= badge on cards turns into <b>GLITCH</b>.</li>
          <li><b>In the <a data-cap="showdown">Showdown</a> and the Amateur
          <a data-cap="campeonato">Championship</a></b>: legendaries and mythicals are banned. The World
          Championship allows them.</li>
          <li><b>In the <a data-cap="chocadeira">Incubator</a></b>: no egg hatches a legendary or mythical.</li>
          <li><b>In hunts</b>: no hunt has a legendary species. <a data-cap="bosses">Bosses</a> look like
          legendaries, but they are arena fights — they can't be caught and don't get the ×${x}.</li>
        </ul>

        <h4>How to get one</h4>
        <p>Today, only in the <a data-cap="mistico">Mystic Arena</a>: the <b>Mystic Ticket</b> drops from
        Bosses and opens the arena with a random legendary or mythical, which fights at <b>your trainer
        level</b> and already with the ×${x}. Knock it down and you get <b>one ball</b> — and the catch
        chance is the same for all of them, from Articuno to Mewtwo.</p>
        <p>You can also <b>buy and sell</b> them: on the <a data-cap="comunidade">Community Market</a> a legendary
        has a <b>free pass</b> — it can be listed at any level and score, like shiny and P5.</p>

        <h4>The floor: the same for everyone</h4>
        <p>Every legendary caught in the arena is born at <b>level ${nv}</b> and with the <b>same floor</b>,
        whatever the species:</p>
        <ul>
          <li><b>quality ${q} or higher</b> — it rerolls until it passes, so you get the natural ladder above
          the floor, not a pile of ${q} exactly;</li>
          <li><b>IV total ${iv} or higher</b> (out of 192), each IV from 1 to 32;</li>
          <li><b>potency P${pMin} or higher</b> — the wheel spins like on any catch, and whatever would land
          below P${pMin} becomes P${pMin}.</li>
        </ul>
        ${tabelaPotenciaMistica(c)}
        <p>In short: an arena legendary comes out with <b>at least ×${piso}</b> on every stat. <b>Shiny</b>
        rolls at the game's full chance (${shiny}, doubled by the Shiny Secret Lure) — as long as the
        species has a shiny form.</p>
        ${nota(`<b>Keep your legendary in the Collection.</b> <b>Auto Collection</b> already does it by default:
        the <b>Legendary/Mythical</b> rule comes on for every player. If you turn it off, remember that a
        legendary's score is hidden behind the GLITCH — the score rule never catches it.
        Outside the Collection, the legendary goes into the <a data-cap="market">Market</a>'s <b>Sell entire
        Depot</b> and can be picked by the automatic <a data-cap="oferenda">Offering</a>. The golden
        arrow on the card sends it to the Collection in one tap.`, 'atencao')}`,
        es: `
        <p>Los <b>Legendarios y Míticos</b> son los pokémon más fuertes del juego: valen <b>×${x} en todos
        los stats</b> — HP, Ataque, Defensa, Sp. Atk, Sp. Def y Speed. Es el mayor multiplicador del juego,
        por encima del <a data-cap="shiny">shiny</a> (×${sh}) y de la <a data-cap="potencia">potencia</a>
        máxima (P5, ×${p5}).</p>

        <h4>Quién cuenta</h4>
        <p>Todo Legendario y Mítico de Kanto a Paldea — los Ultraentes cuentan como legendarios. Vale por la
        <b>especie</b>, y no por el camino hasta ella: todo legendario de tu cuenta tiene el ×${x}, venga de
        donde venga. La copia de Orre de un legendario también es legendaria; las variantes de Outland no.
        En la ficha de cada uno, en la <a data-cap="pokedex">Pokédex</a>, aparece la placa <b>Bono de
        legendario ×${x}</b> (o <b>Bono de mítico</b>).</p>
        ${sorteio}

        <h4>Los bonos se multiplican</h4>
        <p>Potencia, shiny y legendario <b>no se reemplazan — se multiplican</b>. La cuenta es siempre
        <b>potencia × shiny × legendario</b>, igual en los seis stats:</p>
        ${tabelaMultiplicadores(c)}
        <p>Un legendario <b>P5 shiny</b> es <b>×${teto}</b> (×${p5} de la potencia × ${sh} del shiny × ${x}
        del legendario): ${teto} veces los stats que la misma especie tendría sin ningún bono, al mismo
        nivel, con la misma calidad y los mismos IV.</p>

        <h4>Dónde vale el ×${x}</h4>
        <ul>
          <li><b>En todo combate</b>: hunt, gimnasios, PvP, Guerra de Guilds y campeonatos — también en las
          arenas con tope de nivel, porque el ×${x} es del pokémon, y no del nivel.</li>
          <li>En el <b>Poder (⚔)</b> del ranking y de la ficha.</li>
          <li>En la tarjeta <b>En combate</b> de la <a data-cap="nota">Calculadora</a>.</li>
        </ul>

        <h4>Dónde no entra</h4>
        <ul>
          <li><b>En la nota.</b> La regla de 0 a 10 mide el nacimiento <i>dentro</i> de la especie, y el
          ×${x} pasa de su tope — por eso el legendario no tiene nota. La Calculadora "se rompe" y muestra
          <b>INESTIMABLE</b>, la placa de la ficha del pokémon muestra <b>INESTIMABLE</b> con la franja
          <b>GLITCH</b>, y el sello N= de las tarjetas se convierte en <b>GLITCH</b>.</li>
          <li><b>En el <a data-cap="showdown">Showdown</a> y en el <a data-cap="campeonato">Campeonato</a>
          Amateur</b>: legendarios y míticos están prohibidos. En el Mundial sí entran.</li>
          <li><b>En la <a data-cap="chocadeira">Incubadora</a></b>: ningún huevo eclosiona un legendario o
          mítico.</li>
          <li><b>En las hunts</b>: ninguna hunt tiene una especie legendaria. Los <a data-cap="bosses">Bosses</a>
          tienen forma de legendario, pero son luchas de arena — no se capturan y no llevan el ×${x}.</li>
        </ul>

        <h4>Cómo conseguir uno</h4>
        <p>Hoy, solo en la <a data-cap="mistico">Arena Mística</a>: el <b>Mystic Ticket</b> cae de los Bosses
        y abre la arena con un legendario o mítico sorteado, que lucha a <b>tu nivel de entrenador</b> y ya
        con el ×${x}. Si lo derribas, tienes <b>una bola</b> — y la chance de captura es la misma para todos,
        del Articuno al Mewtwo.</p>
        <p>También se pueden <b>comprar y vender</b>: en el <a data-cap="comunidade">Mercado de la Comunidad</a> el
        legendario tiene <b>pase libre</b> — entra en cualquier nivel y nota, como el shiny y el P5.</p>

        <h4>El piso: el mismo para todos</h4>
        <p>Todo legendario capturado en la arena nace en el <b>nivel ${nv}</b> y con el <b>mismo piso</b>,
        sea cual sea la especie:</p>
        <ul>
          <li><b>calidad ${q} o más</b> — se vuelve a sortear hasta pasar, así que sale la escalera natural
          por encima del piso, y no un montón de ${q} clavado;</li>
          <li><b>IV sumado ${iv} o más</b> (de 192), cada IV de 1 a 32;</li>
          <li><b>potencia P${pMin} o más</b> — la ruleta gira como en toda captura, y lo que saldría por
          debajo de P${pMin} se convierte en P${pMin}.</li>
        </ul>
        ${tabelaPotenciaMistica(c)}
        <p>O sea: el legendario de la arena sale con <b>al menos ×${piso}</b> en todos los stats. El
        <b>shiny</b> sale con la chance completa del juego (${shiny}, doblada por el Shiny Secret Lure) —
        siempre que la especie tenga forma shiny.</p>
        ${nota(`<b>Guarda tu legendario en la Colección.</b> La <b>Auto Colección</b> ya lo hace por defecto: la
        regla <b>Legendario/Mítico</b> viene encendida para todo jugador. Si la apagas, recuerda que la nota
        del legendario queda escondida detrás del GLITCH — la regla de la nota nunca lo toma.
        Fuera de la Colección, el legendario entra en el <b>Vender todo el Depósito</b> del
        <a data-cap="market">Market</a> y puede ser elegido por la <a data-cap="oferenda">Ofrenda</a>
        automática. La flechita dorada de la carta lo manda a la Colección con un toque.`, 'atencao')}`,
      };
    },
  },

  // ----------------------------------------------------------- 5b. pokédex
  {
    id: 'pokedex',
    titulo: { pt: 'Pokédex', en: 'Pokédex', es: 'Pokédex' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>A <b>Pokédex</b> registra o que você já viu e capturou. Abra pelo menu principal —
        é diferente do Mapa: aqui você consulta espécies, não escolhe onde caçar.</p>

        <h4>Nove gerações</h4>
        <p>As abas seguem a Pokédex nacional (1ª a 9ª). Cada aba mostra só espécies que
        <b>já têm sprite no jogo</b> — quem ainda não tem arte publicada não aparece na lista,
        para não prometer hunt que não existe.</p>
        <ul>
          <li><b>???</b> — ainda não encontrou na hunt.</li>
          <li><b>Nome visível, sem captura</b> — já derrotou ou viu, mas ainda não pegou.</li>
          <li><b>Cartão colorido</b> — já capturou pelo menos uma vez.</li>
        </ul>

        <p>Depois das nove gerações vem a aba <b>Mega</b>, com as Mega Evoluções na faixa
        <b>#3000</b> (ver <a data-cap="mega">Mega Evolução</a>).</p>

        <h4>Busca</h4>
        <p>O campo de busca ignora a aba ativa: digite o nome ou número (#${725} funciona) e
        a grade mostra qualquer geração que bater. O filtro <b>só vistos/capturados</b> esconde o
        que você ainda não encontrou.</p>

        <h4>Ficha da espécie</h4>
        <p>Clique num cartão para abrir a ficha completa — as setas <b>◀ ▶</b> do topo (ou as teclas
        <b>← →</b>) folheiam de uma espécie à outra:</p>
        <ul>
          <li>Stats base, tipos e sprite animado</li>
          <li><b>Golpes</b> — a tabela com poder, tipo, categoria, recarga e o nível em que cada um
          libera (não aparece nos cartões da grade). Nas espécies refeitas pelas planilhas de
          balanceamento, todos os golpes liberam no nível 1.</li>
          <li>Drops (as pedras dos tipos, e a chance de cada uma), chance de captura por pokébola e chance de shiny (se a espécie tiver forma shiny —
          hoje são <b>${Object.keys(c.d.shinyLooks ?? {}).length}</b> no catálogo)</li>
          <li><b>Nível ao capturar</b> — em que nível ela entra na sua equipe (ver
          <a data-cap="captura">Captura</a>)</li>
          <li><b>Onde encontrar</b> — quando a hunt existir no Mapa</li>
          <li>A <b>evolução</b> e a <b>Mega</b> dela, quando existem</li>
        </ul>
        <p>Nos <b>lendários que são boss</b>, a ficha traz o painel <b>Captura com o Mystic Ticket</b>:
        de que boss o ticket cai, a chance de a arena sortear <b>aquele</b> lendário, o nível dele na
        arena e a tabela de captura por bola — e o botão <b>Ir para Boss</b>. Ver
        <a data-cap="mistico">Mystic Ticket e Arena Mística</a>.</p>
        ${nota(`A contagem no topo (<i>vistos · capturados · total</i>) usa o mesmo catálogo
        visível da grade — só espécies com sprite.`, 'dica')}

        <h4>Shinys do servidor</h4>
        <p>O botão <b>📋 Shinys</b>, no topo da Pokédex, abre o registro de <b>todos os shinys
        capturados no servidor</b>: de quem é cada um, com busca pelo nome e o filtro <b>só à
        venda</b>. Os anunciados mostram o preço e o botão <b>Comprar</b> ali mesmo, e os seus
        aparecem marcados.</p>

        <h4>Top Catch</h4>
        <p>No topo da Pokédex, clique em <b>Top Catch</b> para abrir o painel da semana: as
        <b>espécies que você capturou com bola nesta semana</b>, com a hora de cada captura, o
        <b>relógio até a virada</b> de sábado, 23h59 (horário de Brasília), a <b>sua posição</b> no
        placar, as faixas do prêmio, o <b>pódio da semana</b> e o <b>campeão da semana passada</b>. Na
        semana de estreia, a lista é a sua Pokédex inteira, que é o que conta nessa semana. A Pokédex em
        si nunca zera — o painel só mostra o recorte da semana. As regras e o prêmio estão em
        <a data-cap="ranking">Ranking</a>; lá, a aba Top Catch tem um botão que traz de volta para este
        painel.</p>`,
      en: `
        <p>The <b>Pokédex</b> tracks what you have seen and caught. Open it from the main menu —
        unlike the Map, it is for browsing species, not picking a hunt.</p>

        <h4>Nine generations</h4>
        <p>Tabs follow the National Dex (Gen 1–9). Each tab lists only species that
        <b>already have an in-game sprite</b> — entries without published art stay hidden so the
        book does not promise hunts that do not exist yet.</p>
        <ul>
          <li><b>???</b> — not encountered in a hunt yet.</li>
          <li><b>Name visible, not caught</b> — seen or defeated, not captured.</li>
          <li><b>Coloured card</b> — caught at least once.</li>
        </ul>

        <p>After the nine generations comes the <b>Mega</b> tab, with the Mega Evolutions in the
        <b>#3000</b> range (see <a data-cap="mega">Mega Evolution</a>).</p>

        <h4>Search</h4>
        <p>The search box ignores the active tab: type a name or number (#725 works) and the
        grid shows matches from any generation. The <b>seen/caught only</b> filter hides what you
        haven't found yet.</p>

        <h4>Species sheet</h4>
        <p>Click a card for the full sheet — the <b>◀ ▶</b> arrows at the top (or the <b>← →</b> keys)
        flip from one species to the next:</p>
        <ul>
          <li>Base stats, types and animated sprite</li>
          <li><b>Moves</b> — the table with power, type, category, cooldown and the level each one
          unlocks at (not shown on grid cards). On species reworked by the balance sheets, every move
          unlocks at level 1.</li>
          <li>Drops (the stones of its types, and each one's chance), catch rates per ball and shiny chance (when the species has a shiny form —
          <b>${Object.keys(c.d.shinyLooks ?? {}).length}</b> in the catalogue today)</li>
          <li><b>Level when caught</b> — the level it joins your team at (see
          <a data-cap="captura">Catching</a>)</li>
          <li><b>Where to find it</b> — when the hunt exists on the Map</li>
          <li>Its <b>evolution</b> and <b>Mega</b>, when they exist</li>
        </ul>
        <p>On <b>legendaries that are bosses</b>, the sheet has the <b>Catching it with the
        Mystic Ticket</b> panel: which boss drops the ticket, the chance of the arena rolling <b>that</b> legendary, its
        level in the arena and the per-ball catch table — plus the <b>Go to Boss</b> button. See
        <a data-cap="mistico">Mystic Ticket and Mystic Arena</a>.</p>
        ${nota(`The header count (<i>seen · caught · total</i>) uses the same visible catalogue
        as the grid — sprite-ready species only.`, 'dica')}

        <h4>Server shinies</h4>
        <p>The <b>📋 Shinies</b> button, at the top of the Pokédex, opens the registry of <b>every
        shiny caught on the server</b>: who owns each one, with a name search and the <b>for sale
        only</b> filter. Listed ones show the price and a <b>Buy</b> button right there, and yours
        show up marked.</p>

        <h4>Top Catch</h4>
        <p>At the top of the Pokédex, click <b>Top Catch</b> to open the week's panel: the <b>species
        you caught with a ball this week</b>, with the time of each catch, the <b>clock to the
        reset</b> on Saturday, 11:59 PM (Brasília time), <b>your place</b> on the ladder, the prize
        tiers, <b>this week's podium</b> and <b>last week's champion</b>. In the launch week, the list is
        your whole Pokédex, which is what counts that week. The Pokédex itself never resets — the panel
        only shows the week's slice. The rules and the prize are in <a data-cap="ranking">Rankings</a>;
        there, the Top Catch tab has a button that brings you back to this panel.</p>`,
      es: `
        <p>La <b>Pokédex</b> registra lo que ya viste y capturaste. Ábrela desde el menú principal —
        no es el Mapa: aquí consultas especies, no eliges dónde cazar.</p>

        <h4>Nueve generaciones</h4>
        <p>Las pestañas siguen la Pokédex nacional (1.ª a 9.ª). Cada una muestra solo especies que
        <b>ya tienen sprite en el juego</b> — quien aún no tiene arte publicada no aparece, para
        no prometer una cacería que aún no existe.</p>
        <ul>
          <li><b>???</b> — aún no la encontraste en cacería.</li>
          <li><b>Nombre visible, sin captura</b> — ya la viste o derrotaste, pero no la atrapaste.</li>
          <li><b>Carta coloreada</b> — capturada al menos una vez.</li>
        </ul>

        <p>Después de las nueve generaciones viene la pestaña <b>Mega</b>, con las Mega Evoluciones en
        el rango <b>#3000</b> (ver <a data-cap="mega">Mega Evolución</a>).</p>

        <h4>Búsqueda</h4>
        <p>El buscador ignora la pestaña activa: escribe el nombre o número (#725 vale) y la
        cuadrícula muestra cualquier generación que coincida. El filtro <b>solo vistos/capturados</b>
        oculta lo que aún no encontraste.</p>

        <h4>Ficha de la especie</h4>
        <p>Haz clic en una carta para la ficha completa — las flechas <b>◀ ▶</b> de arriba (o las teclas
        <b>← →</b>) pasan de una especie a otra:</p>
        <ul>
          <li>Stats base, tipos y sprite animado</li>
          <li><b>Movimientos</b> — la tabla con poder, tipo, categoría, recarga y el nivel en que cada
          uno se desbloquea (no aparece en las cartas de la cuadrícula). En las especies rehechas por
          las planillas de balance, todos los golpes se desbloquean en el nivel 1.</li>
          <li>Drops (las piedras de sus tipos, y la probabilidad de cada una), probabilidad de captura por poké ball y chance shiny (si la especie tiene forma
          shiny — hoy <b>${Object.keys(c.d.shinyLooks ?? {}).length}</b> en el catálogo)</li>
          <li><b>Nivel al capturar</b> — en qué nivel entra a tu equipo (ver
          <a data-cap="captura">Captura</a>)</li>
          <li><b>Dónde encontrarla</b> — cuando la cacería exista en el Mapa</li>
          <li>Su <b>evolución</b> y su <b>Mega</b>, cuando existen</li>
        </ul>
        <p>En los <b>legendarios que son boss</b>, la ficha trae el panel <b>Captura con el
        Mystic Ticket</b>: de qué boss cae el ticket, la probabilidad de que la arena sortee <b>ese</b>
        legendario, su nivel en la arena y la tabla de captura por ball — y el botón <b>Ir a
        Boss</b>. Ver <a data-cap="mistico">Mystic Ticket y Arena Mística</a>.</p>
        ${nota(`El contador superior (<i>vistos · capturados · total</i>) usa el mismo catálogo
        visible que la cuadrícula — solo especies con sprite.`, 'dica')}

        <h4>Shinys del servidor</h4>
        <p>El botón <b>📋 Shinys</b>, arriba en la Pokédex, abre el registro de <b>todos los shinys
        capturados en el servidor</b>: de quién es cada uno, con búsqueda por nombre y el filtro
        <b>solo en venta</b>. Los anunciados muestran el precio y el botón <b>Comprar</b> ahí mismo,
        y los tuyos aparecen marcados.</p>

        <h4>Top Captura</h4>
        <p>Arriba en la Pokédex, haz clic en <b>Top Captura</b> para abrir el panel de la semana: las
        <b>especies que capturaste con bola esta semana</b>, con la hora de cada captura, el <b>reloj
        hasta el cambio</b> del sábado, 23:59 (hora de Brasilia), <b>tu puesto</b> en la clasificación,
        las franjas del premio, el <b>podio de la semana</b> y el <b>campeón de la semana pasada</b>. En
        la semana de estreno, la lista es tu Pokédex entera, que es lo que cuenta esa semana. La Pokédex
        en sí nunca se reinicia — el panel solo muestra lo de la semana. Las reglas y el premio están en
        <a data-cap="ranking">Clasificación</a>; allí, la pestaña Top Captura tiene un botón que te trae
        de vuelta a este panel.</p>`,
    }),
  },

  // ------------------------------------------------------------ 6. combate
  // ---------------------------------------------------------- evolução e pedras
  {
    id: 'evolucao',
    titulo: { pt: 'Evolução e pedras', en: 'Evolution & stones', es: 'Evolución y piedras' },
    grupo: 'basico',
    html: (c) => ({
      pt: `
        <p>Evoluir pede <b>duas coisas ao mesmo tempo</b>: o pokémon no <b>nível</b> que a
        evolução exige, e <b>1 pedra</b> do tipo certo no inventário. Faltando qualquer uma, o
        botão recusa e não gasta nada.</p>

        <h4>O nível segue a escada do teto de captura</h4>
        <p>Em Kanto e Johto a evolução pede o nível de sempre. Quando o <b>destino</b> é de Hoenn
        para frente — ou o elo pedia mais que o Nv 100 —, ele pede o <b>teto do destino</b>, a mesma
        escada em que o capturado nasce (ver <a data-cap="captura">Captura</a>): <b>40</b> para virar o do meio de uma
        cadeia de três (ou o primeiro de uma de dois) e <b>100</b> para virar o último. O Treecko vira
        Grovyle no <b>Nv 40</b> e Sceptile no <b>Nv 100</b>; o Tirtouga vira Carracosta no
        <b>Nv 100</b>.</p>
        <p>É o que fecha a conta: o bicho chega no teto da espécie, é treinado e evolui no teto
        seguinte — sem um degrau de centenas de níveis no meio do caminho. A ficha da espécie, na
        Pokédex, mostra o número de cada elo.</p>
        ${nota(`<b>O Eevee é a exceção escolhida à mão:</b> ele evolui no <b>Nv ${N(NIVEL_EEVEE, c.lang)}</b>
        para <b>qualquer um</b> dos oito destinos — Vaporeon, Jolteon, Flareon, Espeon, Umbreon,
        Leafeon, Glaceon e Sylveon —, que é o nível em que Vaporeon, Jolteon e Flareon aparecem
        nas hunts de Kanto. Leafeon, Glaceon e Sylveon são de regiões mais altas, mas saem no
        mesmo degrau dos irmãos. A Pokédex mostra o mesmo número.`)}

        <h4>Os bebês</h4>
        <p>Alguns pokémon são de uma geração <b>posterior</b> à da própria evolução: o Mime Jr. é
        de Sinnoh e o Mr. Mime é de Kanto. A hunt do bebê pode ficar bem acima da do alvo (o Mime Jr.
        aparece no Nv 1.000; o Mr. Mime, no 80), mas o capturado não chega pronto: acima do Nv 100
        ele nasce no <b>teto</b> da espécie (20 ou 40) e é treinado até o nível da evolução, como
        qualquer outro.</p>
        <p>São 15 casos: Pichu, Cleffa, Igglybuff, Tyrogue, Smoochum, Elekid, Magby, Azurill,
        Wynaut, Budew, Chingling, Mime Jr., Munchlax, Mantyke — e os clones de Hoenn.</p>

        <h4>Variantes de Outland não evoluem</h4>
        <p>Os pokémon exclusivos da <b>Outland</b> — Ancient Pupitar, Ancient Dragonair, Furious
        Magikarp e todo o catálogo <b>#2001+</b> — <b>não evoluem</b>, mesmo quando o nome
        parece uma cadeia: um <b>Ancient Pupitar nunca vira Ancient Tyranitar</b> com pedra
        nenhuma. São espécies <b>separadas</b>; cada uma é capturada pronta na hunt. O servidor
        recusa com <i>“variantes de Outland não evoluem”</i>.</p>
        ${nota(`Isto é diferente das <b>espécies nacionais</b>: Pupitar ainda vira Tyranitar,
        Magikarp ainda vira Gyarados — só muda o nível pedido quando o destino mora em hunt alta.
        A trava vale só para a variante Outland.`, 'dica')}

        <h4>Qual pedra</h4>
        <p>A pedra é a do <b>tipo primário</b> do pokémon. Um Machop é FIGHTING e pede
        <b>Punch Stone</b>; um Abra é PSYCHIC e pede <b>Enigma Stone</b>.</p>
        <ul>
          <li><b>Cadeias que abrem em mais de um destino</b> pedem a pedra do que ele VAI VIRAR:
          o Eevee é NORMAL, mas para Vaporeon ele pede Water Stone e para Flareon, Fire Stone.</li>
          <li><b>Os pássaros NORMAL/FLYING</b> são a exceção escrita à mão: Pidgey, Spearow,
          Hoothoot, Taillow, Swablu, Starly, Rufflet, Fletchling e Pikipek pedem
          <b>Feather Stone</b>, não Sun Stone.</li>
          <li><b>Shiny</b> não usa a pedra comum: pede a <b>Shiny Stone</b> do mesmo tipo (ver o
          capítulo de Shiny).</li>
        </ul>
        ${tabelaDePedras(c)}

        <h4>De onde as pedras caem</h4>
        <p>A regra é a mesma que Kanto e Johto sempre seguiram, e agora vale nas quatro regiões
        novas: <b>o que um pokémon solta é do tipo dele</b>. A pedra de um tipo cai de bicho
        daquele tipo, e cada tipo tem um <b>item assinatura</b> que cai de praticamente todos os
        seus — Water Gem de todo WATER, Bug Gosme de todo BUG.</p>
        <p>Uns 20% do que cai escapa para tipos vizinhos, e isso é de propósito: um GRASS/POISON
        solta Venom Stone porque POISON também é dele.</p>
        ${nota(`Em Sinnoh, Unova, Kalos e Alola os drops estavam sorteados sem olhar o tipo — um
        Combee (BUG/FLYING) soltava Rock e Metal Stone e <b>não</b> soltava a Cocoon Stone de que
        ele precisa para virar Vespiquen. Foram <b>394 espécies</b> refeitas. Hoje
        <b>todo pokémon que evolui solta a própria pedra</b>, e cada região tem fonte para todas
        as pedras que ela pede — antes Alola não tinha nenhuma fonte de Fire Stone nem de
        Water Stone.`, 'aviso')}
        <p>Para <b>escolher</b> a pedra em vez de esperar o drop, leve pokémon do depot à
        <a data-cap="oferenda">Oferenda</a>: cada um pinta a fatia do tipo dele numa roleta.</p>`,
      en: `
        <p>Evolving needs <b>two things at once</b>: the pokémon at the <b>level</b> the evolution
        demands, and <b>1 stone</b> of the right type in your backpack. Missing either, the button
        refuses and spends nothing.</p>

        <h4>The level follows the capture-cap ladder</h4>
        <p>In Kanto and Johto an evolution asks for its usual level. When the <b>target</b> is from
        Hoenn onwards — or the link asked for more than Lv 100 —, it asks for the <b>target's cap</b>,
        the same ladder a caught pokémon is born on (see <a data-cap="captura">Catching</a>): <b>40</b> to become
        the middle of a three-stage chain (or the first of a two-stage one) and <b>100</b> to become
        the last. Treecko becomes Grovyle at <b>Lv 40</b> and Sceptile at <b>Lv 100</b>; Tirtouga
        becomes Carracosta at <b>Lv 100</b>.</p>
        <p>That is what makes it add up: the pokémon arrives at its species cap, is trained and
        evolves at the next cap — with no step of hundreds of levels in the middle. The species
        sheet in the Pokédex shows the number for each link.</p>
        ${nota(`<b>Eevee is the hand-picked exception:</b> it evolves at <b>Lv ${N(NIVEL_EEVEE, c.lang)}</b>
        into <b>any</b> of its eight targets — Vaporeon, Jolteon, Flareon, Espeon, Umbreon,
        Leafeon, Glaceon and Sylveon —, the level at which Vaporeon, Jolteon and Flareon show up in
        the Kanto hunts. Leafeon, Glaceon and Sylveon come from higher regions, but they unlock at
        the same step as their siblings. The Pokédex shows the same number.`)}

        <h4>Babies</h4>
        <p>Some pokémon come from a generation <b>later</b> than their own evolution: Mime Jr. is
        from Sinnoh and Mr. Mime is from Kanto. The baby's hunt can sit far above the target's
        (Mime Jr. shows up at Lv 1,000; Mr. Mime, at 80), but the catch does not arrive ready:
        above Lv 100 it is born at the species <b>cap</b> (20 or 40) and is trained up to the
        evolution level, like any other.</p>
        <p>There are 15 such cases: Pichu, Cleffa, Igglybuff, Tyrogue, Smoochum, Elekid, Magby,
        Azurill, Wynaut, Budew, Chingling, Mime Jr., Munchlax, Mantyke — plus the Hoenn clones.</p>

        <h4>Outland variants do not evolve</h4>
        <p>Pokémon exclusive to <b>Outland</b> — Ancient Pupitar, Ancient Dragonair, Furious
        Magikarp and the whole <b>#2001+</b> catalogue — <b>do not evolve</b>, even when the name
        looks like a chain: an <b>Ancient Pupitar never becomes Ancient Tyranitar</b> with any
        stone. They are <b>separate species</b>; each one is caught ready-made in the hunt. The
        server refuses with <i>“Outland variants do not evolve”</i>.</p>
        ${nota(`This is different from <b>national species</b>: Pupitar still becomes Tyranitar,
        Magikarp still becomes Gyarados — only the required level changes when the target lives in
        a high hunt. The lock applies to the Outland variant only.`, 'dica')}

        <h4>Which stone</h4>
        <p>The stone follows the pokémon's <b>primary type</b>. Machop is FIGHTING and asks for
        <b>Punch Stone</b>; Abra is PSYCHIC and asks for <b>Enigma Stone</b>.</p>
        <ul>
          <li><b>Chains that branch</b> ask for the stone of what it WILL BECOME: Eevee is NORMAL,
          but for Vaporeon it asks Water Stone and for Flareon, Fire Stone.</li>
          <li><b>The NORMAL/FLYING birds</b> are the hand-written exception: Pidgey, Spearow,
          Hoothoot, Taillow, Swablu, Starly, Rufflet, Fletchling and Pikipek ask for
          <b>Feather Stone</b>, not Sun Stone.</li>
          <li><b>Shiny</b> does not use the plain stone: it needs the <b>Shiny Stone</b> of the
          same type (see the Shiny chapter).</li>
        </ul>
        ${tabelaDePedras(c)}

        <h4>Where stones drop from</h4>
        <p>The rule is the one Kanto and Johto always followed, and it now holds in the four new
        regions: <b>what a pokémon drops is of its own type</b>. A type's stone drops from that
        type, and every type has a <b>signature item</b> that drops from nearly all of its
        members — Water Gem from every WATER, Bug Gosme from every BUG.</p>
        <p>About 20% of what drops leaks to neighbouring types, and that is deliberate: a
        GRASS/POISON drops Venom Stone because POISON is its type too.</p>
        ${nota(`In Sinnoh, Unova, Kalos and Alola the drops had been rolled without looking at the
        type — a Combee (BUG/FLYING) dropped Rock and Metal Stone and did <b>not</b> drop the
        Cocoon Stone it needs to become Vespiquen. <b>394 species</b> were redone. Today
        <b>every pokémon that evolves drops its own stone</b>, and every region has a source for
        every stone it asks for — Alola previously had no source of Fire Stone or Water Stone at
        all.`, 'aviso')}
        <p>To <b>choose</b> the stone instead of waiting for the drop, bring depot pokémon to the
        <a data-cap="oferenda">Offering</a>: each one paints its type's slice on a wheel.</p>`,
      es: `
        <p>Evolucionar exige <b>dos cosas a la vez</b>: el pokémon en el <b>nivel</b> que la
        evolución pide, y <b>1 piedra</b> del tipo correcto en el inventario. Si falta cualquiera,
        el botón se niega y no gasta nada.</p>

        <h4>El nivel sigue la escalera del techo de captura</h4>
        <p>En Kanto y Johto la evolución pide el nivel de siempre. Cuando el <b>destino</b> es de
        Hoenn en adelante — o el enlace pedía más que el Nv 100 —, pide el <b>techo del destino</b>,
        la misma escalera en la que nace el capturado (ver <a data-cap="captura">Captura</a>): <b>40</b> para
        volverse el del medio de una cadena de tres (o el primero de una de dos) y <b>100</b> para
        volverse el último. Treecko se convierte en Grovyle en el <b>Nv 40</b> y en Sceptile en el
        <b>Nv 100</b>; Tirtouga se convierte en Carracosta en el <b>Nv 100</b>.</p>
        <p>Es lo que cierra la cuenta: el bicho llega en el techo de la especie, se entrena y
        evoluciona en el techo siguiente — sin un escalón de cientos de niveles en el medio. La
        ficha de la especie, en la Pokédex, muestra el número de cada enlace.</p>
        ${nota(`<b>Eevee es la excepción elegida a mano:</b> evoluciona en el <b>Nv ${N(NIVEL_EEVEE, c.lang)}</b>
        a <b>cualquiera</b> de sus ocho destinos — Vaporeon, Jolteon, Flareon, Espeon, Umbreon,
        Leafeon, Glaceon y Sylveon —, que es el nivel en que Vaporeon, Jolteon y Flareon aparecen
        en las cacerías de Kanto. Leafeon, Glaceon y Sylveon son de regiones más altas, pero salen
        en el mismo escalón que sus hermanos. La Pokédex muestra el mismo número.`)}

        <h4>Los bebés</h4>
        <p>Algunos pokémon son de una generación <b>posterior</b> a la de su propia evolución:
        Mime Jr. es de Sinnoh y Mr. Mime es de Kanto. La cacería del bebé puede quedar muy por
        encima de la del objetivo (Mime Jr. aparece en el Nv 1.000; Mr. Mime, en el 80), pero el
        capturado no llega listo: por encima del Nv 100 nace en el <b>techo</b> de la especie (20 o
        40) y se entrena hasta el nivel de la evolución, como cualquier otro.</p>
        <p>Son 15 casos: Pichu, Cleffa, Igglybuff, Tyrogue, Smoochum, Elekid, Magby, Azurill,
        Wynaut, Budew, Chingling, Mime Jr., Munchlax, Mantyke — y los clones de Hoenn.</p>

        <h4>Las variantes de Outland no evolucionan</h4>
        <p>Los pokémon exclusivos de <b>Outland</b> — Ancient Pupitar, Ancient Dragonair, Furious
        Magikarp y todo el catálogo <b>#2001+</b> — <b>no evolucionan</b>, aunque el nombre
        parezca una cadena: un <b>Ancient Pupitar nunca se convierte en Ancient Tyranitar</b> con
        ninguna piedra. Son especies <b>separadas</b>; cada una se captura hecha en la cacería. El
        servidor lo rechaza con <i>“variantes de Outland no evolucionan”</i>.</p>
        ${nota(`Esto es distinto de las <b>especies nacionales</b>: Pupitar sigue siendo Tyranitar,
        Magikarp sigue siendo Gyarados — solo cambia el nivel pedido cuando el destino vive en una
        cacería alta. La traba vale solo para la variante Outland.`, 'dica')}

        <h4>Qué piedra</h4>
        <p>La piedra es la del <b>tipo primario</b> del pokémon. Machop es FIGHTING y pide
        <b>Punch Stone</b>; Abra es PSYCHIC y pide <b>Enigma Stone</b>.</p>
        <ul>
          <li><b>Las cadenas que se abren</b> piden la piedra de en lo que SE VA A CONVERTIR:
          Eevee es NORMAL, pero para Vaporeon pide Water Stone y para Flareon, Fire Stone.</li>
          <li><b>Los pájaros NORMAL/FLYING</b> son la excepción escrita a mano: Pidgey, Spearow,
          Hoothoot, Taillow, Swablu, Starly, Rufflet, Fletchling y Pikipek piden
          <b>Feather Stone</b>, no Sun Stone.</li>
          <li><b>Shiny</b> no usa la piedra común: pide la <b>Shiny Stone</b> del mismo tipo (ver
          el capítulo de Shiny).</li>
        </ul>
        ${tabelaDePedras(c)}

        <h4>De dónde caen las piedras</h4>
        <p>La regla es la que Kanto y Johto siempre siguieron, y ahora vale en las cuatro regiones
        nuevas: <b>lo que suelta un pokémon es de su tipo</b>. La piedra de un tipo cae de bichos
        de ese tipo, y cada tipo tiene un <b>ítem insignia</b> que cae de casi todos los suyos —
        Water Gem de todo WATER, Bug Gosme de todo BUG.</p>
        <p>Un 20% de lo que cae se escapa a tipos vecinos, y es a propósito: un GRASS/POISON
        suelta Venom Stone porque POISON también es suyo.</p>
        ${nota(`En Sinnoh, Unova, Kalos y Alola los drops estaban sorteados sin mirar el tipo — un
        Combee (BUG/FLYING) soltaba Rock y Metal Stone y <b>no</b> soltaba la Cocoon Stone que
        necesita para ser Vespiquen. Se rehicieron <b>394 especies</b>. Hoy <b>todo pokémon que
        evoluciona suelta su propia piedra</b>, y cada región tiene fuente para todas las piedras
        que pide — antes Alola no tenía ninguna fuente de Fire Stone ni de Water Stone.`, 'aviso')}
        <p>Para <b>elegir</b> la piedra en vez de esperar el drop, lleva pokémon del depot a la
        <a data-cap="oferenda">Ofrenda</a>: cada uno pinta la porción de su tipo en una ruleta.</p>`,
    }),
  },

  // ------------------------------------------------------------- oferenda
  //
  // As casas saem de `OFERENDA_CASAS` e a nota do Auto Selecionar de `AUTO_LOCK_NOTA_MIN`, os
  // dois de `shared/`. A fatia de um pokémon é uma casa inteira (`100 / casas`), partida ao meio
  // quando ele pinta duas pedras — a conta de `shared/oferenda.mjs`.
  {
    id: 'oferenda',
    titulo: { pt: 'Oferenda de Pokémon', en: 'Pokémon Offering', es: 'Ofrenda de Pokémon' },
    grupo: 'basico',
    html: (c) => {
      const casas = N(OFERENDA_CASAS, c.lang);
      const pct = Math.round(100 / OFERENDA_CASAS);
      const meio = Math.round(50 / OFERENDA_CASAS);
      const dois = Math.round((2 / OFERENDA_CASAS) * 100);
      const vazio = 100 - dois;
      const autoLock = String(AUTO_LOCK_NOTA_MIN).replace('.', c.lang === 'en' ? '.' : ',');
      return {
        pt: `
        <p>A Oferenda troca pokémon do depot por <b>pedra de evolução</b>. Fica na mochila:
        <b>Mochila → Oferenda</b>. Você carrega uma roleta com até <b>${casas}
        pokémon</b>, gira, e sai <b>uma pedra</b>, sorteada entre os tipos que você pôs. Os
        pokémon oferecidos <b>somem para sempre</b>.</p>

        <h4>Como funciona, em três passos</h4>
        <ol class="wk-passos">
          <li><b>Encha as casas.</b> Cada casa vazia é um <b>+</b> que abre a folha de escolha, a
          mesma do Mercado: cards com a fileira P·IV·Q·N, busca por nome, filtro de tipo, IV
          mínimo e ordenação. Ela não fecha a cada escolha, e o card escolhido mostra o número da
          casa. Clicar de novo tira.</li>
          <li><b>Confira a roleta.</b> Cada casa repete sprite, nome e selos do pokémon, e o
          círculo mostra as fatias e a chance de sair pedra antes de você girar. Ao lado, a lista
          <b>O que pode sair</b> dá a fatia de cada pedra e quantas você já tem; passar o mouse
          numa casa acende as fatias que aquele pokémon pintou.</li>
          <li><b>Clique em Oferendar e confirme.</b> O diálogo diz quantos pokémon vão e quantos
          deles são shiny. A roleta gira e para na fatia sorteada.</li>
        </ol>
        <p>Com pressa? O botão <b>⚡ Oferenda Rápida</b>, ao lado de Oferendar, pula a animação da
        roleta e mostra o resultado na hora — o mesmo sorteio, com a mesma confirmação.</p>

        <h4>Quanto cada pokémon vale</h4>
        <p><b>Um pokémon vale uma casa: ${pct}% do círculo</b>, tenha ele um tipo ou dois. A casa
        vai para a pedra do tipo dele (a mesma da <a data-cap="evolucao">tabela de pedras</a>).
        Quem tem dois tipos parte a casa ao meio: o segundo tipo compra <b>variedade</b>, não
        vantagem.</p>
        ${tabela(
          ['Na roleta', 'Pinta'],
          `<tr><td>Charmander (FIRE)</td><td class="wk-num">${pct}% de Fire Stone</td></tr>
           <tr><td>Charizard (FIRE/FLYING)</td><td class="wk-num">${meio}% de Fire Stone + ${meio}% de Feather Stone</td></tr>
           <tr><td>Gengar (GHOST/POISON)</td><td class="wk-num">${meio}% de Darkness Stone + ${meio}% de Venom Stone</td></tr>`,
        )}
        ${nota(`A divisão é pelas <b>pedras</b>, não pelos tipos. DARK e GHOST usam a mesma
        Darkness Stone, então um DARK/GHOST comum leva a casa <b>inteira</b> nela.`, 'dica')}

        <h4>A chance de sair pedra</h4>
        <p>É <b>pokémon ÷ ${casas}</b>. Com as ${casas} casas cheias, a pedra é garantida. Com
        menos, o resto do círculo vira a fatia <b>Nada</b>, desenhada antes de você girar: com
        dois pokémon, ${dois}% de chance de pedra e ${vazio}% de Nada.</p>

        <h4>Shiny paga em Shiny Stone</h4>
        <p>Um shiny na roleta não pinta a pedra comum: pinta a <b>Shiny Stone do tipo dele</b>. Um
        Shiny Dratini (DRAGON) só pode dar Dragon Shiny Stone; um Shiny Bulbasaur (GRASS/POISON)
        abre Grass <b>ou</b> Poison Shiny Stone. A fatia shiny tem contorno dourado.</p>
        <ul>
          <li><b>${casas} shinys do mesmo tipo</b> fecham a roleta e garantem a Shiny Stone.</li>
          <li>É a única fonte de Shiny Stone que não passa pelos fragmentos (ver
          <a data-cap="shiny">Shiny</a>).</li>
          <li>As Shiny Stones não se juntam como as comuns: um shiny DARK/GHOST pinta
          <b>duas</b> fatias, Dark e Ghost.</li>
        </ul>

        <h4>Quem não entra</h4>
        <p>A folha só lista o <b>depot</b>: quem está na equipe nem aparece. Também ficam de fora:</p>
        <ul>
          <li>quem segura <b>Exp. Share</b> ou está no <b>posto de XP Share</b> de uma
          <a data-cap="casa">Casa</a> — a folha diz quantos escondeu;</li>
          <li>quem está <b>anunciado</b> no <a data-cap="comunidade">Mercado da Comunidade</a>. Se
          ele já estava numa casa quando foi anunciado, a casa esvazia e o giro segue com os
          outros;</li>
          <li>o <b>último pokémon</b> da conta.</li>
        </ul>
        ${nota(`<b>A Coleção não barra a Oferenda.</b> Ela protege contra a venda ao NPC do
        <a data-cap="market">Market</a>, e aqui cada pokémon é uma escolha sua, olhando o card.
        O pokémon da Coleção aparece com a <b>★</b>, e o filtro <b>Local</b> separa Depot e
        Coleção.`, 'aviso')}

        <h4>Auto Selecionar</h4>
        <p>O botão ao lado de <b>Esvaziar</b> enche as casas vazias com os pokémon do depot de
        <b>menor nota</b> (a N= da <a data-cap="nota">calculadora</a>).</p>
        <ul>
          <li>Só pega nota <b>abaixo da Nota mínima do seu Auto Coleção</b> (Market → Vender; o padrão é
          ${autoLock}). Com três ruins e um ótimo no depot, a quarta casa fica vazia.</li>
          <li><b>Nunca pega:</b> shiny, P5, pokémon da Coleção, da vitrine do perfil, com
          item segurado, refino ou TM, o starter, nem as suas equipes do
          <a data-cap="pvp">PvP Ranqueado</a>, do <a data-cap="campeonato">Campeonato</a> e do
          <a data-cap="showdown">Showdown</a> — a escolhida para um torneio fica protegida até a
          meia-noite do dia das lutas.</li>
          <li>Empate na nota: primeiro o de nível menor, depois a captura mais recente.</li>
          <li>Na folha de escolha, o mesmo botão escolhe <b>só entre os que a lista mostra</b>:
          busque "charmander" (ou filtre FIRE) e clique para montar uma roleta só de Fire
          Stone.</li>
          <li>Ele só enche as casas. O giro continua pedindo a sua confirmação.</li>
        </ul>

        <h4>Oferendar tudo do Depot</h4>
        <p>Para limpar o Depot de uma vez, o botão <b>Oferendar tudo do Depot</b> gira <b>de
        ${OFERENDA_CASAS} em ${OFERENDA_CASAS}</b> com a mesma peneira do Auto Selecionar: só o que
        está abaixo da Nota mínima do seu Auto Coleção, do pior para o melhor, e nunca shiny, P5, a
        Coleção, a vitrine, as equipes, quem segura item, tem refino ou TM, nem o starter.</p>
        <ul>
          <li>A confirmação diz quantos pokémon vão, em quantos giros, e <b>quem ficou de fora e
          por quê</b>.</li>
          <li>O último giro pode sair com menos de ${OFERENDA_CASAS} casas — a confirmação mostra a
          chance de ele não dar nada, a mesma de uma roleta incompleta.</li>
          <li>São até <b>${OFERENDA_LOTE_GIROS_MAX} giros</b> por clique; o que sobrar fica para a
          próxima, e a tela diz quantos.</li>
          <li>O lote <b>não escolhe o tipo</b>: ele leva o que vier. Quem quer uma pedra
          específica continua montando as casas à mão — é isso que faz o garimpo valer.</li>
        </ul>
        ${nota(`O sorteio é feito no <b>servidor</b>. A roleta que gira na tela só mostra o
        resultado que já saiu.`)}`,
        en: `
        <p>The Offering trades depot pokémon for an <b>evolution stone</b>. It lives in the backpack:
        <b>Backpack → Offering</b>. You load a wheel with up to <b>${casas} pokémon</b>,
        spin, and get <b>one stone</b>, drawn among the types you put in. The offered pokémon are
        <b>gone for good</b>.</p>

        <h4>How it works, in three steps</h4>
        <ol class="wk-passos">
          <li><b>Fill the slots.</b> Each empty slot is a <b>+</b> that opens the picker, the same
          one the Market uses: cards with the P·IV·Q·N row, name search, type filter, minimum IV and
          sorting. It stays open while you pick, and a chosen card shows its slot number. Click it
          again to take it out.</li>
          <li><b>Check the wheel.</b> Each slot repeats the pokémon's sprite, name and badges, and
          the circle shows the slices and the chance of a stone before you spin. Next to it, the
          <b>What can come out</b> list gives each stone's slice and how many you already have;
          hovering a slot lights up the slices that pokémon painted.</li>
          <li><b>Click Offer and confirm.</b> The dialog says how many pokémon are going and how
          many of them are shiny. The wheel spins and stops on the drawn slice.</li>
        </ol>
        <p>In a hurry? The <b>⚡ Quick Offering</b> button, next to Offer, skips the wheel animation
        and shows the result right away — same draw, same confirmation.</p>

        <h4>What each pokémon is worth</h4>
        <p><b>One pokémon is worth one slot: ${pct}% of the circle</b>, whether it has one type or
        two. The slot goes to the stone of its type (the same as the
        <a data-cap="evolucao">stone table</a>). A dual-type splits the slot in half: the second
        type buys <b>variety</b>, not an edge.</p>
        ${tabela(
          ['On the wheel', 'Paints'],
          `<tr><td>Charmander (FIRE)</td><td class="wk-num">${pct}% Fire Stone</td></tr>
           <tr><td>Charizard (FIRE/FLYING)</td><td class="wk-num">${meio}% Fire Stone + ${meio}% Feather Stone</td></tr>
           <tr><td>Gengar (GHOST/POISON)</td><td class="wk-num">${meio}% Darkness Stone + ${meio}% Venom Stone</td></tr>`,
        )}
        ${nota(`The split follows the <b>stones</b>, not the types. DARK and GHOST share the same
        Darkness Stone, so a regular DARK/GHOST puts its <b>whole</b> slot on it.`, 'dica')}

        <h4>The chance of a stone</h4>
        <p>It is <b>pokémon ÷ ${casas}</b>. With all ${casas} slots filled, the stone is
        guaranteed. With fewer, the rest of the circle becomes the <b>Nothing</b> slice, drawn
        before you spin: with two pokémon, a ${dois}% chance of a stone and ${vazio}% Nothing.</p>

        <h4>Shiny pays in Shiny Stone</h4>
        <p>A shiny on the wheel does not paint the regular stone: it paints the <b>Shiny Stone of
        its type</b>. A Shiny Dratini (DRAGON) can only give a Dragon Shiny Stone; a Shiny
        Bulbasaur (GRASS/POISON) opens Grass <b>or</b> Poison Shiny Stone. The shiny slice has a
        gold outline.</p>
        <ul>
          <li><b>${casas} shinies of the same type</b> fill the wheel and guarantee the Shiny
          Stone.</li>
          <li>It is the only source of Shiny Stones that does not go through fragments (see
          <a data-cap="shiny">Shiny</a>).</li>
          <li>Shiny Stones do not merge like the regular ones: a DARK/GHOST shiny paints
          <b>two</b> slices, Dark and Ghost.</li>
        </ul>

        <h4>Who cannot go in</h4>
        <p>The picker only lists the <b>depot</b>: team members do not even show up. Also left
        out:</p>
        <ul>
          <li>anyone holding an <b>Exp. Share</b> or sitting in the <b>XP Share post</b> of a
          <a data-cap="casa">House</a> — the picker says how many it hid;</li>
          <li>anyone <b>listed</b> on the <a data-cap="comunidade">Community Market</a>. If it was
          already in a slot when it got listed, the slot empties and the spin goes on with the
          rest;</li>
          <li>the account's <b>last pokémon</b>.</li>
        </ul>
        ${nota(`<b>The Collection does not block the Offering.</b> It guards against NPC sales at
        the <a data-cap="market">Market</a>, and here every pokémon is your own choice, card in
        view. Collection pokémon show a <b>★</b>, and the <b>Location</b> filter splits Depot and
        Collection.`, 'aviso')}

        <h4>Auto Select</h4>
        <p>The button next to <b>Empty it</b> fills the empty slots with the <b>lowest-rated</b>
        depot pokémon (the N= from the <a data-cap="nota">calculator</a>).</p>
        <ul>
          <li>It only takes ratings <b>below the Minimum score of your Auto Collection</b> (Market → Sell; the default
          is ${autoLock}). With three bad ones and one great one in the depot, the fourth slot
          stays empty.</li>
          <li><b>It never takes:</b> shiny, P5, Collection, profile showcase, or pokémon with a
          held item, refine or TM, the starter, nor your <a data-cap="pvp">Ranked PvP</a>,
          <a data-cap="campeonato">Championship</a> and <a data-cap="showdown">Showdown</a> teams — a
          team picked for a tournament stays protected until midnight on fight day.</li>
          <li>On a rating tie: lower level first, then the most recent catch.</li>
          <li>In the picker, the same button chooses <b>only among what the list shows</b>: search
          "charmander" (or filter FIRE) and click to build a Fire Stone-only wheel.</li>
          <li>It only fills the slots. The spin still asks for your confirmation.</li>
        </ul>

        <h4>Offer the whole Depot</h4>
        <p>To clear the Depot in one go, the <b>Offer the whole Depot</b> button spins <b>in groups
        of ${OFERENDA_CASAS}</b> with the same filter as Auto Select: only what is below your Auto
        Collection N score, worst first, and never a shiny, a P5, the Collection, the showcase, your
        teams, anything holding an item, refined or with a TM, nor the starter.</p>
        <ul>
          <li>The confirmation says how many pokémon go, in how many spins, and <b>who was left out
          and why</b>.</li>
          <li>The last spin may have fewer than ${OFERENDA_CASAS} slots — the confirmation shows the
          chance of it giving nothing, the same as any incomplete wheel.</li>
          <li>It does up to <b>${OFERENDA_LOTE_GIROS_MAX} spins</b> per click; whatever is left waits
          for the next one, and the screen says how many.</li>
          <li>The batch <b>does not pick the type</b>: it takes what comes. Whoever wants a specific
          stone still fills the slots by hand — that is what makes hand-picking worth it.</li>
        </ul>
        ${nota(`The draw happens on the <b>server</b>. The wheel spinning on screen only shows the
        result that already came out.`)}`,
        es: `
        <p>La Ofrenda cambia pokémon del depot por una <b>piedra de evolución</b>. Está en la
        mochila: <b>Mochila → Ofrenda</b>. Cargas una ruleta con hasta <b>${casas}
        pokémon</b>, giras y sale <b>una piedra</b>, sorteada entre los tipos que pusiste. Los
        pokémon ofrecidos <b>desaparecen para siempre</b>.</p>

        <h4>Cómo funciona, en tres pasos</h4>
        <ol class="wk-passos">
          <li><b>Llena las casillas.</b> Cada casilla vacía es un <b>+</b> que abre la hoja de
          selección, la misma del Mercado: tarjetas con la fila P·IV·Q·N, búsqueda por nombre,
          filtro de tipo, IV mínimo y orden. No se cierra en cada elección, y la tarjeta elegida
          muestra el número de la casilla. Otro clic la quita.</li>
          <li><b>Revisa la ruleta.</b> Cada casilla repite el sprite, el nombre y los sellos del
          pokémon, y el círculo muestra las porciones y la probabilidad de piedra antes de
          girar. Al lado, la lista <b>Lo que puede salir</b> da la porción de cada piedra y cuántas
          ya tienes; pasar el ratón por una casilla ilumina las porciones que pintó ese
          pokémon.</li>
          <li><b>Pulsa Ofrendar y confirma.</b> El diálogo dice cuántos pokémon se van y cuántos
          son shiny. La ruleta gira y se detiene en la porción sorteada.</li>
        </ol>
        <p>¿Con prisa? El botón <b>⚡ Ofrenda Rápida</b>, al lado de Ofrendar, salta la animación
        de la ruleta y muestra el resultado al instante — el mismo sorteo, con la misma
        confirmación.</p>

        <h4>Cuánto vale cada pokémon</h4>
        <p><b>Un pokémon vale una casilla: el ${pct}% del círculo</b>, tenga uno o dos tipos. La
        casilla va a la piedra de su tipo (la misma de la
        <a data-cap="evolucao">tabla de piedras</a>). El de dos tipos parte la casilla por la
        mitad: el segundo tipo compra <b>variedad</b>, no ventaja.</p>
        ${tabela(
          ['En la ruleta', 'Pinta'],
          `<tr><td>Charmander (FIRE)</td><td class="wk-num">${pct}% de Fire Stone</td></tr>
           <tr><td>Charizard (FIRE/FLYING)</td><td class="wk-num">${meio}% de Fire Stone + ${meio}% de Feather Stone</td></tr>
           <tr><td>Gengar (GHOST/POISON)</td><td class="wk-num">${meio}% de Darkness Stone + ${meio}% de Venom Stone</td></tr>`,
        )}
        ${nota(`El reparto es por <b>piedras</b>, no por tipos. DARK y GHOST usan la misma Darkness
        Stone, así que un DARK/GHOST común pone la casilla <b>entera</b> en ella.`, 'dica')}

        <h4>La probabilidad de piedra</h4>
        <p>Es <b>pokémon ÷ ${casas}</b>. Con las ${casas} casillas llenas, la piedra está
        garantizada. Con menos, el resto del círculo es la porción <b>Nada</b>, dibujada antes de
        girar: con dos pokémon, ${dois}% de piedra y ${vazio}% de Nada.</p>

        <h4>El shiny paga en Shiny Stone</h4>
        <p>Un shiny en la ruleta no pinta la piedra común: pinta la <b>Shiny Stone de su tipo</b>.
        Un Shiny Dratini (DRAGON) solo puede dar Dragon Shiny Stone; un Shiny Bulbasaur
        (GRASS/POISON) abre Grass <b>o</b> Poison Shiny Stone. La porción shiny tiene borde
        dorado.</p>
        <ul>
          <li><b>${casas} shinys del mismo tipo</b> llenan la ruleta y garantizan la Shiny
          Stone.</li>
          <li>Es la única fuente de Shiny Stone que no pasa por los fragmentos (ver
          <a data-cap="shiny">Shiny</a>).</li>
          <li>Las Shiny Stones no se juntan como las comunes: un shiny DARK/GHOST pinta
          <b>dos</b> porciones, Dark y Ghost.</li>
        </ul>

        <h4>Quién no entra</h4>
        <p>La hoja solo lista el <b>depot</b>: los del equipo ni aparecen. También quedan
        fuera:</p>
        <ul>
          <li>quien lleva <b>Exp. Share</b> o está en el <b>puesto de XP Share</b> de una
          <a data-cap="casa">Casa</a> — la hoja dice cuántos ocultó;</li>
          <li>quien está <b>anunciado</b> en el <a data-cap="comunidade">Mercado de la
          Comunidad</a>. Si ya estaba en una casilla cuando se anunció, la casilla se vacía y el
          giro sigue con los demás;</li>
          <li>el <b>último pokémon</b> de la cuenta.</li>
        </ul>
        ${nota(`<b>La Colección no bloquea la Ofrenda.</b> Protege de la venta al NPC del
        <a data-cap="market">Market</a>, y aquí cada pokémon es una elección tuya, con la tarjeta
        a la vista. El pokémon de la Colección aparece con la <b>★</b>, y el filtro
        <b>Ubicación</b> separa Depósito y Colección.`, 'aviso')}

        <h4>Autoseleccionar</h4>
        <p>El botón junto a <b>Vaciar</b> llena las casillas vacías con los pokémon del depot de
        <b>menor nota</b> (la N= de la <a data-cap="nota">calculadora</a>).</p>
        <ul>
          <li>Solo elige notas <b>por debajo de la Nota mínima de tu Auto Colección</b> (Market → Vender; por
          defecto ${autoLock}). Con tres malos y uno muy bueno en el depot, la cuarta casilla queda
          vacía.</li>
          <li><b>Nunca elige:</b> shiny, P5, los de la Colección, la vitrina del perfil, con
          objeto equipado, refinado o TM, el inicial, ni tus equipos del
          <a data-cap="pvp">PvP Clasificatorio</a>, del <a data-cap="campeonato">Campeonato</a> y del
          <a data-cap="showdown">Showdown</a> — el elegido para un torneo queda protegido hasta la
          medianoche del día de las peleas.</li>
          <li>Empate de nota: primero el de menor nivel, después la captura más reciente.</li>
          <li>En la hoja de selección, el mismo botón elige <b>solo entre los que muestra la
          lista</b>: busca "charmander" (o filtra FIRE) y pulsa para armar una ruleta solo de Fire
          Stone.</li>
          <li>Solo llena las casillas. El giro sigue pidiendo tu confirmación.</li>
        </ul>

        <h4>Ofrendar todo el Depósito</h4>
        <p>Para vaciar el Depósito de una vez, el botón <b>Ofrendar todo el Depósito</b> gira <b>de
        ${OFERENDA_CASAS} en ${OFERENDA_CASAS}</b> con el mismo filtro de Autoseleccionar: solo lo
        que está por debajo de la Nota mínima de tu Auto Colección, del peor al mejor, y nunca shiny, P5,
        la Colección, la vitrina, los equipos, quien sostiene un objeto, tiene refinado o TM, ni el
        inicial.</p>
        <ul>
          <li>La confirmación dice cuántos pokémon van, en cuántos giros, y <b>quién quedó fuera y
          por qué</b>.</li>
          <li>El último giro puede salir con menos de ${OFERENDA_CASAS} casillas — la confirmación
          muestra la probabilidad de que no dé nada, la misma de una ruleta incompleta.</li>
          <li>Son hasta <b>${OFERENDA_LOTE_GIROS_MAX} giros</b> por clic; lo que sobre queda para la
          próxima, y la pantalla dice cuántos.</li>
          <li>El lote <b>no elige el tipo</b>: lleva lo que venga. Quien quiere una piedra concreta
          sigue armando las casillas a mano — eso es lo que hace que buscar valga la pena.</li>
        </ul>
        ${nota(`El sorteo se hace en el <b>servidor</b>. La ruleta que gira en pantalla solo
        muestra el resultado que ya salió.`)}`,
      };
    },
  },

  // -------------------------------------------------- configurações e modos
  //
  // Tudo aqui é preferência DESTE navegador (`preferencias.mjs`, em localStorage): nenhuma opção
  // muda o que o servidor caça, captura ou paga. Os nomes são os rótulos `cfg.*` do i18n.
  {
    id: 'configuracoes',
    titulo: { pt: 'Configurações e modos de tela', en: 'Settings and display modes', es: 'Ajustes y modos de pantalla' },
    grupo: 'basico',
    html: () => ({
      pt: `
        <p>A <b>engrenagem</b>, entre os botões do painel do treinador, abre as
        <b>Configurações</b>. Cada opção é um interruptor que vale <b>só neste navegador</b> (fica
        guardado no aparelho, não na conta), e nenhuma muda o que a caça rende: o servidor caça,
        captura e paga igual com qualquer combinação.</p>

        <h4>Para gastar menos</h4>
        <ul>
          <li><b>Modo Economia</b> — desliga a cena de vez: nada de mapa, de pokémon nem de
          animação. No lugar do palco fica um painel com o que se acompanha num idle — XP, Coins,
          abates e capturas por hora, o tempo de sessão e o histórico de capturas (que se ordena pela
          nota da Calculadora, pelo IV — o total ou o de um stat —, pela potência, qualidade ou nível; a maior nota da sessão leva o troféu). A caça continua
          no servidor e você segue online. Na hunt, a plaquinha da área abre a ficha da espécie na
          <a data-cap="pokedex">Pokédex</a>; fora dela, o <a data-cap="mapa">Mapa</a> para escolher outra
          hunt. Os botões de saída da cena também estão no painel: <b>Ir para o Centro Pokémon</b> e
          <b>Desistir do Combate</b> na hunt, <b>Curar equipe</b> no Centro e, na arena do
          <a data-cap="bosses">boss</a>, o <b>Abandonar arena</b> — no cabeçalho e colado à bateria (a
          entrada paga não volta). <b>Ligar a cena</b> volta ao normal. Feito para celular e PC fraco.
          O painel tem ainda a <b>janelinha flutuante</b>: só os números, por cima dos outros apps, para
          acompanhar a caça com o jogo minimizado. E a <b>bateria</b>, ao lado da Escape Rope durante a
          hunt, liga o Modo Economia num toque, sem abrir as Configurações. Embaixo do painel fica o
          <b>cofre</b> — Itens, Depot e Coleção. Nas duas abas de pokémon dá para buscar pelo nome ou
          pelo apelido, ligar o <b>Shiny</b> e, no <b>funil</b>, pedir potência mínima, qualidade
          mínima e o IV mínimo de cada stat; o "Ordenar por" põe no card o número da ordem escolhida
          (nota, IV, qualidade ou potência). A <b>setinha dourada</b> que aparece no card manda o
          pokémon para a Coleção (ou de volta ao Depot), e no pé do Depot fica o <b>Vender todo o
          Depot</b> do Market — com um filtro ligado, o <b>(Filtrado)</b>, que vende só o que a grade
          mostra.</li>
          <li><b>Tela sempre acesa</b> (celular) — impede a tela de apagar sozinha com o jogo
          aberto: tela apagada suspende a página e tira você do mundo. Gasta a bateria da tela, então
          ligue junto com o Modo Economia e abaixe o brilho. Funciona no Chrome e no Samsung
          Internet do Android e no Safari do iPhone (iOS 16.4 ou mais novo); nos outros navegadores
          a opção aparece travada, dizendo o porquê.</li>
          <li><b>Modo otimizado</b> — mantém a cena, mas sem as animações de golpe e os números de
          dano. Ajuda em PC mais fraco.</li>
        </ul>

        <h4>Tela e interface</h4>
        <ul>
          <li><b>Modo Imersivo</b> — esconde painéis e HUD: só a batalha em tela cheia, como um
          wallpaper animado. Para sair, o botão no <b>canto superior direito</b>. Com o Modo
          Economia ligado junto, o que aparece é o painel da economia, com o mesmo botão de
          saída. Na hunt e na arena do boss há um <b>atalho</b> ao lado da bateria, com o mesmo
          desenho do botão de sair: um toque e a batalha vai para a tela cheia.</li>
          <li><b>Night Mode</b> — tema escuro no site inteiro.</li>
          <li><b>Painel de golpes</b> — mostra os golpes do pokémon ativo ao lado da batalha, com o
          cooldown de cada um. Só informação: não muda o combate automático.</li>
          <li><b>Layout de celular</b> — a cena em tela cheia, com painéis e chat numa gaveta no
          rodapé. A opção aparece em aparelho de toque (ou com o layout já ligado); desligue para
          ver o layout de computador.</li>
        </ul>

        <h4>Som</h4>
        <ul>
          <li><b>Sound Mode</b> — trilhas de cidade de Hoenn num player flutuante: tocar, pausar,
          próxima faixa e repetir.</li>
          <li><b>Som de shiny</b>, <b>Som de captura</b> e <b>Som de TM Disk Boss Drop</b> — tocam
          quando <b>você</b> captura um shiny, captura um pokémon ou tira uma peça de TM de um boss.
          Só no seu navegador: ninguém mais ouve.</li>
        </ul>

        <h4>Modo Pocket</h4>
        <p>Durante a hunt, o ícone ao lado da <b>Escape Rope</b> e do <b>Ir para o Centro
        Pokémon</b> abre a <b>janelinha Pocket</b>: a cena e os contadores da sessão (XP, ouro,
        abates e capturas por hora, shinies vistos e capturados). No Chrome e no Edge ela fica
        sempre em primeiro plano, para acompanhar a hunt com o jogo minimizado; nos outros
        navegadores vira um cartão que se arrasta pela tela. No Android, a cena pode seguir em
        picture-in-picture quando você aperta Home. Para trazer o jogo de volta, feche a
        janelinha ou clique de novo no ícone.</p>

        <h4>Janelas</h4>
        <ul>
          <li>Toda janela aberta de <b>dentro de outra</b> (a ficha de um pokémon aberta pelo Depot,
          o perfil aberto pelo ranking…) ganha o <b>‹</b> ao lado do ×: ele volta para a janela de
          antes, na mesma aba, com os filtros e a rolagem de onde você estava.</li>
          <li>Clicar <b>fora</b> da janela fecha. Soltar o mouse fora dela — selecionando um texto para
          copiar, por exemplo — <b>não</b> fecha.</li>
          <li>As confirmações (evoluir, Mega, refino, Mercado, Loja, guild, Casa…) mostram a cena:
          o pokémon no palco, a pedra ou a moeda, os requisitos com ✓/✗ e o preço com o seu saldo
          antes e depois.</li>
        </ul>

        <h4>Novidades</h4>
        <p>O <b>!</b>, ao lado das bandeiras de idioma (no celular, na gaveta <b>Menu</b>), abre as
        <b>Novidades no PokéIdle</b>. Depois de uma atualização elas abrem sozinhas, uma vez, na
        próxima vez que você entrar; as setas levam às edições anteriores.</p>`,
      en: `
        <p>The <b>gear</b>, among the trainer panel's buttons, opens the <b>Settings</b>. Each
        option is a switch that applies <b>to this browser only</b> (it is stored on the device,
        not on the account), and none of them changes what hunting yields: the server hunts,
        catches and pays the same with any combination.</p>

        <h4>To spend less</h4>
        <ul>
          <li><b>Battery Saver</b> — turns the scene off entirely: no map, no pokémon, no
          animation. In place of the stage there is a panel with what you follow in an idle game —
          XP, Coins, kills and catches per hour, session time and the catch history (which you can
          sort by Calculator Score, by IV — the total or a single stat —, by potency, quality or level; the best score of the session gets the trophy). Hunting goes
          on in the server and you stay online. In a hunt, the area plate opens the species sheet in the
          <a data-cap="pokedex">Pokédex</a>; outside one, the <a data-cap="mapa">Map</a> to pick another hunt. The
          scene's exit buttons are on the panel too: <b>Go to the Pokémon Center</b> and <b>Give Up</b> in a
          hunt, <b>Heal team</b> at the Center and, in a <a data-cap="bosses">boss</a> arena, <b>Leave arena</b> —
          in the header and next to the battery (the paid entry does not come back). <b>Turn the scene on</b>
          goes back to normal. Made for phones and weak PCs. The panel also has the <b>floating mini-window</b>:
          just the numbers, on top of other apps, to follow the hunt with the game minimised. And the
          <b>battery</b>, next to the Escape Rope during a hunt, turns Battery Saver on in one tap,
          without opening the Settings. Below the panel sits the <b>vault</b> — Items, Depot and
          Collection. On the two Pokémon tabs you can search by name or nickname, switch on
          <b>Shiny</b> and, under the <b>funnel</b>, set a minimum potency, a minimum quality and a
          minimum IV for each stat; "Sort by" puts the number you sorted by on each card (score, IV,
          quality or potency). The <b>gold arrow</b> on a card sends that Pokémon to the Collection
          (or back to the Depot), and the foot of the Depot has the Market's <b>Sell entire
          Depot</b> — with a filter on, the <b>(Filtered)</b> one, which sells only what the grid
          shows.</li>
          <li><b>Keep screen on</b> (phone) — stops the screen from turning off by itself with the
          game open: a dark screen suspends the page and takes you out of the world. It spends
          screen battery, so turn it on together with Battery Saver and lower the brightness. Works
          in Chrome and Samsung Internet on Android and in Safari on iPhone (iOS 16.4 or newer); in
          other browsers the option shows locked, saying why.</li>
          <li><b>Optimized mode</b> — keeps the scene, but without move animations and damage
          numbers. Helps on weaker PCs.</li>
        </ul>

        <h4>Screen and interface</h4>
        <ul>
          <li><b>Immersive mode</b> — hides panels and HUD: just the battle in full screen, like an
          animated wallpaper. To leave, use the button in the <b>top-right corner</b>. With Battery
          Saver on as well, what shows is the Battery Saver panel, with the same exit button. In a
          hunt and in the boss arena there is a <b>shortcut</b> next to the battery, with the same
          art as the exit button: one tap and the battle goes full screen.</li>
          <li><b>Night mode</b> — dark theme across the whole site.</li>
          <li><b>Moves panel</b> — shows the active pokémon's moves next to the battle, with each
          one's cooldown. Information only: it does not change the automatic combat.</li>
          <li><b>Mobile layout</b> — the scene in full screen, with panels and chat in a drawer at
          the bottom. The option shows on touch devices (or with the layout already on); turn it
          off to see the desktop layout.</li>
        </ul>

        <h4>Sound</h4>
        <ul>
          <li><b>Sound mode</b> — Hoenn town themes in a floating player: play, pause, next track
          and repeat.</li>
          <li><b>Shiny sound</b>, <b>Catch sound</b> and <b>TM Disk Boss Drop sound</b> — they play
          when <b>you</b> catch a shiny, catch a pokémon or get a TM piece from a boss. Only in your
          browser: nobody else hears them.</li>
        </ul>

        <h4>Pocket Mode</h4>
        <p>During a hunt, the icon next to the <b>Escape Rope</b> and <b>Go to the Pokémon
        Center</b> opens the <b>Pocket window</b>: the scene and the session counters (XP, gold,
        kills and catches per hour, shinies seen and caught). In Chrome and Edge it stays always
        on top, so you can follow the hunt with the game minimized; in other browsers it becomes a
        card you drag around the screen. On Android, the scene can carry on in
        picture-in-picture when you press Home. To bring the game back, close the window or click
        the icon again.</p>

        <h4>Windows</h4>
        <ul>
          <li>Every window opened from <b>inside another</b> (a pokémon's sheet opened from the Depot,
          a profile opened from the ranking…) gets the <b>‹</b> next to the ×: it goes back to the
          previous window, on the same tab, with the filters and scroll where you left them.</li>
          <li>Clicking <b>outside</b> a window closes it. Releasing the mouse outside it — while
          selecting text to copy, for example — does <b>not</b>.</li>
          <li>Confirmations (evolving, Mega, refining, Market, Shop, guild, House…) show the scene: the
          pokémon on stage, the stone or the coin, the requirements with ✓/✗ and the price with your
          balance before and after.</li>
        </ul>

        <h4>What's new</h4>
        <p>The <b>!</b>, next to the language flags (on a phone, in the <b>Menu</b> drawer), opens
        <b>What's new in PokéIdle</b>. After an update it opens by itself, once, the next time you
        log in; the arrows go back to earlier editions.</p>`,
      es: `
        <p>El <b>engranaje</b>, entre los botones del panel del entrenador, abre los
        <b>Ajustes</b>. Cada opción es un interruptor que vale <b>solo en este navegador</b> (se
        guarda en el dispositivo, no en la cuenta), y ninguna cambia lo que rinde la cacería: el
        servidor caza, captura y paga igual con cualquier combinación.</p>

        <h4>Para gastar menos</h4>
        <ul>
          <li><b>Modo Ahorro</b> — apaga la escena del todo: sin mapa, sin pokémon y sin
          animación. En lugar del escenario queda un panel con lo que se sigue en un idle — XP,
          Coins, derrotas y capturas por hora, el tiempo de sesión y el historial de capturas (que se
          ordena por la nota de la Calculadora, por el IV — el total o el de un stat —, por la potencia,
          la calidad o el nivel; la mejor nota de la sesión se lleva el trofeo). La
          cacería sigue en el servidor y tú sigues en línea. En la cacería, la placa de la zona abre la ficha
          de la especie en la <a data-cap="pokedex">Pokédex</a>; fuera de ella, el <a data-cap="mapa">Mapa</a> para
          elegir otra cacería. Los botones de salida de la escena también están en el panel: <b>Ir al Centro
          Pokémon</b> y <b>Rendirse</b> en la cacería, <b>Curar equipo</b> en el Centro y, en la arena del
          <a data-cap="bosses">boss</a>, <b>Abandonar arena</b> — en la cabecera y junto a la batería (la entrada
          pagada no vuelve). <b>Encender la escena</b> vuelve a lo normal. Pensado para móvil y PC flojo. El panel tiene además la <b>mini ventana
          flotante</b>: solo los números, encima de las otras apps, para seguir la cacería con el juego
          minimizado. Y la <b>batería</b>, junto a la Escape Rope durante la cacería, enciende el
          Modo Ahorro de un toque, sin abrir los Ajustes. Debajo del panel está el <b>cofre</b> —
          Objetos, Depósito y Colección. En las dos pestañas de pokémon puedes buscar por nombre o
          por apodo, activar el <b>Shiny</b> y, en el <b>embudo</b>, pedir potencia mínima, calidad
          mínima y el IV mínimo de cada stat; el "Ordenar por" pone en la tarjeta el número del orden
          elegido (nota, IV, calidad o potencia). La <b>flechita dorada</b> de la tarjeta manda el
          pokémon a la Colección (o de vuelta al Depósito), y al pie del Depósito está el <b>Vender
          todo el Depósito</b> del Market — con un filtro activo, el <b>(Filtrado)</b>, que vende solo
          lo que muestra la cuadrícula.</li>
          <li><b>Pantalla siempre encendida</b> (móvil) — evita que la pantalla se apague sola con
          el juego abierto: con la pantalla apagada la página se suspende y sales del mundo. Gasta
          la batería de la pantalla, así que enciéndela junto con el Modo Ahorro y baja el brillo.
          Funciona en Chrome y Samsung Internet en Android y en Safari en iPhone (iOS 16.4 o más
          nuevo); en los demás navegadores la opción aparece bloqueada, diciendo por qué.</li>
          <li><b>Modo optimizado</b> — mantiene la escena, pero sin las animaciones de golpe ni los
          números de daño. Ayuda en PC más flojo.</li>
        </ul>

        <h4>Pantalla e interfaz</h4>
        <ul>
          <li><b>Modo inmersivo</b> — oculta paneles y HUD: solo la batalla a pantalla completa,
          como un fondo animado. Para salir, el botón de la <b>esquina superior derecha</b>. Con el
          Modo Ahorro encendido a la vez, lo que aparece es el panel del ahorro, con el mismo botón
          de salida. En la hunt y en la arena del boss hay un <b>atajo</b> al lado de la batería, con
          el mismo dibujo del botón de salida: un toque y la batalla pasa a pantalla completa.</li>
          <li><b>Modo nocturno</b> — tema oscuro en todo el sitio.</li>
          <li><b>Panel de golpes</b> — muestra los golpes del pokémon activo junto a la batalla, con
          el cooldown de cada uno. Solo información: no cambia el combate automático.</li>
          <li><b>Diseño de móvil</b> — la escena a pantalla completa, con paneles y chat en un
          cajón abajo. La opción aparece en dispositivos táctiles (o con el diseño ya encendido);
          apágala para ver el diseño de ordenador.</li>
        </ul>

        <h4>Sonido</h4>
        <ul>
          <li><b>Modo sonido</b> — músicas de ciudad de Hoenn en un reproductor flotante:
          reproducir, pausar, siguiente pista y repetir.</li>
          <li><b>Sonido de shiny</b>, <b>Sonido de captura</b> y <b>Sonido de TM Disk Boss Drop</b>
          — suenan cuando <b>tú</b> capturas un shiny, capturas un pokémon o sacas una pieza de TM
          de un boss. Solo en tu navegador: nadie más los oye.</li>
        </ul>

        <h4>Modo Pocket</h4>
        <p>Durante la cacería, el icono junto a la <b>Escape Rope</b> y a <b>Ir al Centro
        Pokémon</b> abre la <b>ventanita Pocket</b>: la escena y los contadores de la sesión (XP,
        oro, derrotas y capturas por hora, shinies vistos y capturados). En Chrome y Edge queda
        siempre en primer plano, para seguir la cacería con el juego minimizado; en los demás
        navegadores se vuelve una tarjeta que se arrastra por la pantalla. En Android, la escena
        puede seguir en picture-in-picture al pulsar Inicio. Para traer el juego de vuelta, cierra
        la ventanita o pulsa de nuevo el icono.</p>

        <h4>Ventanas</h4>
        <ul>
          <li>Toda ventana abierta <b>desde otra</b> (la ficha de un pokémon abierta desde el
          Depósito, un perfil abierto desde el ranking…) gana la <b>‹</b> junto a la ×: vuelve a la
          ventana anterior, en la misma pestaña, con los filtros y el desplazamiento donde estabas.</li>
          <li>Pulsar <b>fuera</b> de la ventana la cierra. Soltar el ratón fuera de ella —
          seleccionando un texto para copiar, por ejemplo — <b>no</b> la cierra.</li>
          <li>Las confirmaciones (evolucionar, Mega, refinado, Mercado, Tienda, guild, Casa…) muestran
          la escena: el pokémon en el escenario, la piedra o la moneda, los requisitos con ✓/✗ y el
          precio con tu saldo antes y después.</li>
        </ul>

        <h4>Novedades</h4>
        <p>El <b>!</b>, junto a las banderas de idioma (en el móvil, en el cajón <b>Menú</b>), abre
        las <b>Novedades en PokéIdle</b>. Tras una actualización se abren solas, una vez, la
        próxima vez que entres; las flechas llevan a las ediciones anteriores.</p>`,
    }),
  },

  // ------------------------------------------------------ chat, amigos e comércio
  //
  // Tudo o que é CONVERSA num lugar só: os quatro canais, a Lista de Amigos e o Comércio (o chat
  // de negociação preso a um anúncio). Os tetos saem das constantes do topo do arquivo, cada uma
  // com o arquivo do servidor de onde veio; o alto-falante, de `shared/alto-falante.mjs`.
  {
    id: 'chat',
    titulo: { pt: 'Chat, amigos e Comércio', en: 'Chat, friends and Trade', es: 'Chat, amigos y Comercio' },
    grupo: 'basico',
    html: (c) => {
      const minAlto = Math.round(ESPERA_ALTO_FALANTE_MS / 60_000);
      const alto = N(CUSTO_ALTO_FALANTE, c.lang);
      const envioMin = N(MIN_ENVIO_COINS, c.lang);
      return {
        pt: `
        <p>O chat fica na coluna da direita, e mandar mensagem pede <b>nível ${NIVEL_CHAT}</b> de
        treinador. São <b>quatro canais</b>, cada um com o seu assunto — os quatro botões (2×2) em cima
        da conversa ficam sempre à vista, com o contador de mensagens novas de cada um:</p>
        ${tabela(
          ['Canal', 'Para quê'],
          `<tr><td><b>Mundo</b></td><td>conversa geral com todo mundo — e onde saem os avisos do jogo (shiny capturado, lendário, resultado da guerra)</td></tr>
           <tr><td><b>Comércio</b></td><td>compra, venda e os anúncios do Market</td></tr>
           <tr><td><b>Dúvidas</b></td><td>perguntas sobre o jogo — a comunidade e os tutores 🎓 respondem</td></tr>
           <tr><td><b>Guild</b></td><td>só a sua guild</td></tr>`,
        )}
        <p>O <b>idioma</b> é uma escolha à parte: a bandeira do chat decide em que língua você
        escreve e lê (português, inglês ou espanhol). "Mundo em espanhol" é o mesmo canal Mundo,
        filtrado pelo idioma — quem fala duas línguas troca a bandeira sem perder o canal.</p>

        <h4>O ritmo</h4>
        <p>Uma mensagem a cada <b>${SEG_CHAT} segundos</b>, somando os quatro canais. A espera é da
        conta: recarregar a página ou reconectar não a zera.</p>

        <h4>Palavrões</h4>
        <p>O chat barra o conteúdo <b>pesado</b> — racismo, preconceito, discurso de ódio, xingamento
        sexual explícito — nos quatro canais e nas mensagens diretas: a mensagem não
        sai, e aparece <b>"Você não pode enviar palavras de baixo calão ao chat!"</b>. O palavrão comum do
        dia a dia passa. Nomes são mais rígidos: o nick, o nome da guild e o apelido de pokémon não aceitam
        <b>nenhum</b> palavrão (ver <a data-cap="loja">Loja</a> e <a data-cap="guild">Guilds</a>).</p>

        <h4>Chamar, responder e fixar</h4>
        <ul>
          <li><b>Chamar pelo nome:</b> escreva <b>@</b> colado no nick — <code>@ash oi</code> ou
          <code>eaiii @ash</code> — e o nome vira uma etiqueta. Para quem foi chamado, a linha
          inteira acende: é assim que uma resposta não se perde quando a conversa anda depressa.</li>
          <li><b>Responder:</b> a setinha ao lado de uma mensagem começa a sua fala já com o
          <b>@nick</b> de quem você está respondendo. No anúncio do alto-falante ela marca o
          vendedor.</li>
          <li><b>Mensagem fixada:</b> admins e moderadores fixam um aviso no <b>topo do canal</b>,
          por cima da conversa. No chat da <b>Guild</b>, quem fixa é o <b>dono</b> ou um
          <b>sub-dono</b> — e os dois também <b>apagam</b> mensagens dali (clique no nick de quem
          escreveu). Dá para recolher e abrir de novo.</li>
          <li><b>Clique no nick</b> de alguém para <b>ver o perfil</b>, <b>adicionar amigo</b> ou
          <b>ignorar</b>. Quem você ignora some do seu chat; a lista de ignorados desfaz isso.</li>
        </ul>

        <h4>Quem é quem</h4>
        <p>A equipe do jogo (admin, moderador e helper) leva um <b>escudo roxo</b> logo depois do
        horário, e o cargo se lê pela <b>cor do nick</b>. O nick do <b>VIP</b> é azul-claro, com
        brilho. A <b>TAG da guild</b> vem antes do nick, na cor que o dono escolheu (ver
        <a data-cap="guild">Guilds</a>).</p>

        <h4>Anúncios do Market no chat</h4>
        <p>No <a data-cap="comunidade">Mercado da Comunidade</a>, o botão <b>📢 Anunciar no chat
        global</b> manda UM anúncio seu para os canais <b>Mundo</b> e <b>Comércio</b>, com um link
        que leva direto a ele. Custa <b>${alto} Coins</b>, e a conta espera <b>${minAlto} minutos</b>
        até o próximo — a espera é da conta, não do anúncio.</p>
        <p>Não quer ver anúncio? A setinha ao lado do emoji abre as opções do chat:
        <b>Esconder anúncios da comunidade</b> tira os anúncios do alto-falante do seu Mundo (no
        Comércio eles continuam). Vale só neste navegador.</p>

        <h4>Comandos</h4>
        <p>Digite no chat para receber uma resposta que só você vê — ela não é publicada para
        ninguém.</p>
        <ul>
          <li><b>/site</b> — o site de hunts X4 feito pela comunidade.</li>
          <li><b>/ticket</b> — o convite do Discord e a sala de suporte, onde se reportam bugs
          (há recompensa em diamantes por bug bounty e vulnerabilidade).</li>
          <li><b>/guia</b> ou <b>/hunt</b> — a Extensão Oficial do PokeIdle (Chrome Web Store), que te
          ajuda a decidir os melhores lugares de farm.</li>
          <li><b>/resgatar &lt;código&gt;</b> — resgata o código de um prêmio do Discord (convites e
          Tag IDLE, ver <a data-cap="recompensas">Ganhe diamantes</a>). Só <b>/resgatar</b> mostra
          a escada de convites.</li>
        </ul>

        <h4>Lista de Amigos</h4>
        <p>O botão de <b>Amigos</b>, na coluna do seu retrato, abre a lista — ela também pede nível
        ${NIVEL_CHAT}. Cabem <b>${N(MAX_AMIGOS, c.lang)} amigos</b>.</p>
        <ul>
          <li><b>Adicionar</b> é uma busca: digite 3 letras ou mais do nick e veja os treinadores,
          com <b>Ver perfil</b> antes de pedir. O pedido espera na aba <b>Pendentes</b> do outro
          lado.</li>
          <li>Os pedidos que você mandou aparecem embaixo da busca como <b>aguardando</b>, cada um com o
          botão <b>Cancelar</b>: quem parou de jogar não responde nunca, e cancelar tira o pedido da sua
          lista e da lista de quem recebeu. Dá para pedir de novo depois.</li>
          <li>A ordem da lista: primeiro quem tem mensagem <b>não lida</b>, depois quem conversou
          com você na semana, depois quem está <b>online</b>, e o resto pelo <b>visto por último</b>
          ("visto há 3h").</li>
          <li>As conversas ficam guardadas por <b>${DIAS_DM} dias</b>. As suas mensagens levam dois
          tracinhos: <b>cinza-escuro</b> = enviada, <b>azul-claro</b> = lida.</li>
          <li>Na conversa dá para <b>anexar um pokémon</b> (o amigo abre a ficha), <b>enviar
          Coins</b> e desafiar para um <a data-cap="amistoso">PvP amistoso</a>. Ver perfil abre a
          ficha do amigo por cima da conversa; fechar devolve você ao papo.</li>
          <li>O chat da sua <b>guild</b> também aparece ali, guardado pelos mesmos ${DIAS_DM} dias.</li>
        </ul>
        ${nota(`<b>Enviar Coins</b> queima <b>${PCT_ENVIO_COINS}%</b> do valor: o amigo recebe o
        resto, e a parte queimada não vai para ninguém. O mínimo é <b>${envioMin} Coins</b> por envio.
        É a mesma comissão do Mercado em Ouro, de propósito — as duas portas para passar ouro custam
        o mesmo (ver <a data-cap="taxas">Todas as taxas</a>).`)}

        <h4>Comércio: negociar com o vendedor</h4>
        <p>Cada anúncio do Mercado da Comunidade tem o botão <b>Enviar DM</b>: ele abre uma
        conversa com o vendedor, presa àquele anúncio. As negociações ficam na própria Lista de
        Amigos, no modo <b>Comércio</b>, em duas abas — <b>Minhas Ofertas</b> (os vendedores que
        você chamou) e <b>Meus Produtos</b> (os compradores que chamaram você).</p>
        <ul>
          <li>É para <b>combinar</b>. A compra continua sendo feita no Mercado, pelo anúncio, com a
          trava de preço e a comissão de sempre.</li>
          <li>A conversa some quando o anúncio é vendido ou retirado.</li>
          <li>Cada comprador mantém até <b>${N(MAX_NEGOCIACOES, c.lang)}</b> negociações abertas ao
          mesmo tempo.</li>
        </ul>
        ${nota(`Vender conta ou pokémon <b>por fora</b> do Mercado da Comunidade (PIX, outro site,
        "passa o pokémon que eu te pago") é <b>proibido</b> e pode dar <b>banimento</b>. O jogo não
        tem como proteger ninguém numa troca externa: quem é lesado ali não tem a quem recorrer.`, 'aviso')}

        <h4>Uma sessão por conta</h4>
        <p>A conta joga em <b>um lugar por vez</b>. Abrir o jogo em outro aparelho ou aba
        <b>pausa</b> a sessão antiga, que mostra "Conta aberta em outro lugar" e o botão <b>Jogar
        aqui</b> — ele traz o jogo de volta e pausa a outra. Nada se perde: a hunt e o progresso
        seguem na sessão que estiver jogando.</p>`,
        en: `
        <p>Chat lives in the right-hand column, and sending messages requires trainer
        <b>level ${NIVEL_CHAT}</b>. There are <b>four channels</b>, each with its own subject — the four
        buttons (2×2) above the conversation are always in view, each with its count of new messages:</p>
        ${tabela(
          ['Channel', 'What for'],
          `<tr><td><b>World</b></td><td>general talk with everyone — and where the game's notices show up (shiny caught, legendary, war result)</td></tr>
           <tr><td><b>Trade</b></td><td>buying, selling and the Market's listings</td></tr>
           <tr><td><b>Help</b></td><td>questions about the game — the community and the 🎓 tutors answer</td></tr>
           <tr><td><b>Guild</b></td><td>your guild only</td></tr>`,
        )}
        <p>The <b>language</b> is a separate choice: the chat flag decides which language you write
        and read (Portuguese, English or Spanish). "World in Spanish" is the same World channel,
        filtered by language — anyone who speaks two languages switches the flag without leaving
        the channel.</p>

        <h4>The pace</h4>
        <p>One message every <b>${SEG_CHAT} seconds</b>, across all four channels. The wait belongs to
        the account: reloading the page or reconnecting does not reset it.</p>

        <h4>Swearing</h4>
        <p>The chat blocks <b>heavy</b> content — racism, prejudice, hate speech, explicit sexual
        insults — on all four channels and in direct messages: the message doesn't go
        out, and you see <b>"You can't send offensive language to the chat!"</b>. Everyday swearing goes
        through. Names are stricter: the nickname, the guild name and a pokémon's nickname accept
        <b>no</b> swearing at all (see <a data-cap="loja">Shop</a> and <a data-cap="guild">Guilds</a>).</p>

        <h4>Mention, reply and pin</h4>
        <ul>
          <li><b>Mention by name:</b> type <b>@</b> right before the nick — <code>@ash hi</code> or
          <code>heyyy @ash</code> — and the name turns into a tag. For the person mentioned, the
          whole line lights up: that is how a reply does not get lost when the chat moves fast.</li>
          <li><b>Reply:</b> the little arrow next to a message starts your line with the
          <b>@nick</b> of whoever you are answering. On a loudspeaker listing it tags the seller.</li>
          <li><b>Pinned message:</b> admins and moderators pin a notice to the <b>top of the
          channel</b>, above the conversation. In the <b>Guild</b> chat, the <b>owner</b> or a
          <b>co-owner</b> pins — and both can also <b>delete</b> messages there (click the nick of
          whoever wrote it). You can collapse it and open it again.</li>
          <li><b>Click someone's nick</b> to <b>View profile</b>, <b>Add friend</b> or
          <b>ignore</b>. Whoever you ignore disappears from your chat; the ignored list undoes it.</li>
        </ul>

        <h4>Who is who</h4>
        <p>The game staff (admin, moderator and helper) carries a <b>purple shield</b> right after
        the time, and the role shows in the <b>nick colour</b>. A <b>VIP</b> nick is light blue,
        with a glow. The <b>guild TAG</b> comes before the nick, in the colour the owner picked (see
        <a data-cap="guild">Guilds</a>).</p>

        <h4>Market listings in chat</h4>
        <p>In the <a data-cap="comunidade">Community Market</a>, the <b>📢 Announce in global
        chat</b> button sends ONE of your listings to the <b>World</b> and <b>Trade</b> channels,
        with a link straight to it. It costs <b>${alto} Coins</b>, and the account waits
        <b>${minAlto} minutes</b> before the next one — the wait belongs to the account, not to the
        listing.</p>
        <p>Don't want to see listings? The little arrow next to the emoji button opens the chat
        options: <b>Hide community listings</b> removes loudspeaker listings from your World (they
        stay in Trade). It only applies to this browser.</p>

        <h4>Commands</h4>
        <p>Type them in chat to get an answer only you see — it is not posted for anyone.</p>
        <ul>
          <li><b>/site</b> — the X4 hunts website made by the community.</li>
          <li><b>/ticket</b> — the Discord invite and the support room, where bugs are reported
          (there are diamond rewards for bug bounties and vulnerabilities).</li>
          <li><b>/guia</b> or <b>/hunt</b> — the Official PokeIdle Extension (Chrome Web Store), which
          helps you decide the best places to farm.</li>
          <li><b>/resgatar &lt;code&gt;</b> — redeems the code of a Discord prize (invites and the
          IDLE Tag, see <a data-cap="recompensas">Earn diamonds</a>). Just <b>/resgatar</b> shows the
          invite ladder.</li>
        </ul>

        <h4>Friends List</h4>
        <p>The <b>Friends</b> button, in your portrait column, opens the list — it also requires
        level ${NIVEL_CHAT}. It holds <b>${N(MAX_AMIGOS, c.lang)} friends</b>.</p>
        <ul>
          <li><b>Adding</b> is a search: type 3 or more letters of the nick and see the trainers, with
          <b>View profile</b> before you ask. The request waits in the other side's <b>Pending</b>
          tab.</li>
          <li>The requests you sent show up under the search as <b>pending</b>, each with a
          <b>Cancel</b> button: someone who stopped playing never answers, and cancelling removes the
          request from your list and from theirs. You can ask again later.</li>
          <li>The list order: first whoever has an <b>unread</b> message, then whoever talked to you
          this week, then who is <b>online</b>, and the rest by <b>last seen</b> ("seen 3h ago").</li>
          <li>Conversations are kept for <b>${DIAS_DM} days</b>. Your messages carry two ticks:
          <b>dark grey</b> = sent, <b>light blue</b> = read.</li>
          <li>In the chat you can <b>attach a pokémon</b> (your friend opens its sheet), <b>send
          Coins</b> and challenge them to a <a data-cap="amistoso">Friendly PvP</a>. View profile opens
          your friend's sheet on top of the chat; closing it brings you back.</li>
          <li>Your <b>guild</b> chat shows up there too, kept for the same ${DIAS_DM} days.</li>
        </ul>
        ${nota(`<b>Sending Coins</b> burns <b>${PCT_ENVIO_COINS}%</b> of the amount: your friend gets
        the rest, and the burned part goes to no one. The minimum is <b>${envioMin} Coins</b> per
        transfer. It is the same fee as the Market in Gold, on purpose — both ways of moving gold cost
        the same (see <a data-cap="taxas">All fees</a>).`)}

        <h4>Trade: negotiating with the seller</h4>
        <p>Every Community Market listing has a <b>Send DM</b> button: it opens a chat with the
        seller, tied to that listing. Negotiations live in the Friends List itself, in <b>Trade</b>
        mode, in two tabs — <b>My Offers</b> (sellers you contacted) and <b>My Products</b> (buyers
        who contacted you).</p>
        <ul>
          <li>It is for <b>agreeing</b>. The purchase is still made in the Market, through the
          listing, with the usual price lock and fee.</li>
          <li>The chat disappears when the listing is sold or withdrawn.</li>
          <li>Each buyer keeps up to <b>${N(MAX_NEGOCIACOES, c.lang)}</b> negotiations open at the same
          time.</li>
        </ul>
        ${nota(`Selling an account or a pokémon <b>outside</b> the Community Market (PIX, another
        website, "send me the pokémon and I'll pay you") is <b>forbidden</b> and can get you
        <b>banned</b>. The game has no way to protect anyone in an external trade: whoever gets
        scammed there has nowhere to turn.`, 'aviso')}

        <h4>One session per account</h4>
        <p>The account plays in <b>one place at a time</b>. Opening the game on another device or
        tab <b>pauses</b> the old session, which shows "Account opened elsewhere" and a <b>Play
        here</b> button — it brings the game back and pauses the other one. Nothing is lost: the hunt
        and your progress carry on in whichever session is playing.</p>`,
        es: `
        <p>El chat está en la columna de la derecha, y enviar mensajes pide <b>nivel
        ${NIVEL_CHAT}</b> de entrenador. Hay <b>cuatro canales</b>, cada uno con su tema — los cuatro
        botones (2×2) encima de la conversación están siempre a la vista, con el contador de mensajes
        nuevos de cada uno:</p>
        ${tabela(
          ['Canal', 'Para qué'],
          `<tr><td><b>Mundo</b></td><td>conversación general con todos — y donde salen los avisos del juego (shiny capturado, legendario, resultado de la guerra)</td></tr>
           <tr><td><b>Comercio</b></td><td>compra, venta y los anuncios del Market</td></tr>
           <tr><td><b>Dudas</b></td><td>preguntas sobre el juego — la comunidad y los tutores 🎓 responden</td></tr>
           <tr><td><b>Guild</b></td><td>solo tu guild</td></tr>`,
        )}
        <p>El <b>idioma</b> es otra elección: la bandera del chat decide en qué lengua escribes y
        lees (portugués, inglés o español). "Mundo en español" es el mismo canal Mundo, filtrado por
        idioma — quien habla dos lenguas cambia la bandera sin perder el canal.</p>

        <h4>El ritmo</h4>
        <p>Un mensaje cada <b>${SEG_CHAT} segundos</b>, sumando los cuatro canales. La espera es de la
        cuenta: recargar la página o reconectar no la reinicia.</p>

        <h4>Groserías</h4>
        <p>El chat bloquea el contenido <b>pesado</b> — racismo, prejuicio, discurso de odio, insultos
        sexuales explícitos — en los cuatro canales y en los mensajes directos: el
        mensaje no sale, y aparece <b>"¡No puedes enviar palabras groseras al chat!"</b>. La grosería común
        del día a día pasa. Los nombres son más estrictos: el nick, el nombre de la guild y el apodo de un
        pokémon no aceptan <b>ninguna</b> grosería (ver <a data-cap="loja">Tienda</a> y
        <a data-cap="guild">Guilds</a>).</p>

        <h4>Llamar, responder y fijar</h4>
        <ul>
          <li><b>Llamar por el nombre:</b> escribe <b>@</b> pegado al nick — <code>@ash hola</code> o
          <code>eyyy @ash</code> — y el nombre se vuelve una etiqueta. Para quien fue llamado, la línea
          entera se ilumina: así una respuesta no se pierde cuando la conversación va rápido.</li>
          <li><b>Responder:</b> la flechita junto a un mensaje empieza tu frase con el <b>@nick</b>
          de quien respondes. En el anuncio del altavoz marca al vendedor.</li>
          <li><b>Mensaje fijado:</b> admins y moderadores fijan un aviso en la <b>parte de arriba del
          canal</b>, encima de la conversación. En el chat de la <b>Guild</b>, quien fija es el
          <b>dueño</b> o un <b>sub-dueño</b> — y los dos también <b>borran</b> mensajes de allí (pulsa
          el nick de quien escribió). Se puede recoger y volver a abrir.</li>
          <li><b>Pulsa el nick</b> de alguien para <b>ver el perfil</b>, <b>añadir amigo</b> o
          <b>ignorar</b>. A quien ignoras desaparece de tu chat; la lista de ignorados lo deshace.</li>
        </ul>

        <h4>Quién es quién</h4>
        <p>El equipo del juego (admin, moderador y helper) lleva un <b>escudo morado</b> justo
        después de la hora, y el cargo se lee por el <b>color del nick</b>. El nick del <b>VIP</b> es
        celeste, con brillo. La <b>TAG de la guild</b> va antes del nick, en el color que eligió el
        dueño (ver <a data-cap="guild">Guilds</a>).</p>

        <h4>Anuncios del Market en el chat</h4>
        <p>En el <a data-cap="comunidade">Mercado de la Comunidad</a>, el botón <b>📢 Anunciar en el
        chat global</b> manda UNO de tus anuncios a los canales <b>Mundo</b> y <b>Comercio</b>, con
        un enlace directo. Cuesta <b>${alto} Coins</b>, y la cuenta espera <b>${minAlto} minutos</b>
        hasta el siguiente — la espera es de la cuenta, no del anuncio.</p>
        <p>¿No quieres ver anuncios? La flechita junto al emoji abre las opciones del chat:
        <b>Ocultar anuncios de la comunidad</b> quita los anuncios del altavoz de tu Mundo (en
        Comercio siguen). Vale solo en este navegador.</p>

        <h4>Comandos</h4>
        <p>Escríbelos en el chat para recibir una respuesta que solo tú ves — no se publica para
        nadie.</p>
        <ul>
          <li><b>/site</b> — la web de cacerías X4 hecha por la comunidad.</li>
          <li><b>/ticket</b> — la invitación al Discord y la sala de soporte, donde se reportan bugs
          (hay recompensa en diamantes por bug bounty y vulnerabilidades).</li>
          <li><b>/guia</b> o <b>/hunt</b> — la Extensión Oficial de PokeIdle (Chrome Web Store), que te
          ayuda a decidir los mejores lugares para farmear.</li>
          <li><b>/resgatar &lt;código&gt;</b> — canjea el código de un premio del Discord
          (invitaciones y Tag IDLE, ver <a data-cap="recompensas">Gana diamantes</a>). Solo
          <b>/resgatar</b> muestra la escalera de invitaciones.</li>
        </ul>

        <h4>Lista de Amigos</h4>
        <p>El botón de <b>Amigos</b>, en la columna de tu retrato, abre la lista — también pide nivel
        ${NIVEL_CHAT}. Caben <b>${N(MAX_AMIGOS, c.lang)} amigos</b>.</p>
        <ul>
          <li><b>Añadir</b> es una búsqueda: escribe 3 letras o más del nick y ve a los entrenadores,
          con <b>Ver perfil</b> antes de pedir. La solicitud espera en la pestaña <b>Pendientes</b>
          del otro lado.</li>
          <li>Las solicitudes que enviaste aparecen debajo de la búsqueda como <b>esperando</b>, cada una
          con el botón <b>Cancelar</b>: quien dejó de jugar no responde nunca, y cancelar quita la
          solicitud de tu lista y de la de quien la recibió. Se puede pedir de nuevo después.</li>
          <li>El orden de la lista: primero quien tiene un mensaje <b>sin leer</b>, después quien
          habló contigo en la semana, después quien está <b>en línea</b>, y el resto por la
          <b>última conexión</b> ("visto hace 3h").</li>
          <li>Las conversaciones se guardan <b>${DIAS_DM} días</b>. Tus mensajes llevan dos rayitas:
          <b>gris oscuro</b> = enviado, <b>celeste</b> = leído.</li>
          <li>En la conversación puedes <b>adjuntar un pokémon</b> (tu amigo abre la ficha),
          <b>enviar Coins</b> y desafiarlo a un <a data-cap="amistoso">PvP amistoso</a>. Ver perfil
          abre la ficha del amigo encima de la conversación; al cerrarla vuelves a la charla.</li>
          <li>El chat de tu <b>guild</b> también aparece ahí, guardado los mismos ${DIAS_DM} días.</li>
        </ul>
        ${nota(`<b>Enviar Coins</b> quema el <b>${PCT_ENVIO_COINS}%</b> del valor: tu amigo recibe el
        resto, y la parte quemada no va a nadie. El mínimo es <b>${envioMin} Coins</b> por envío. Es la
        misma comisión del Mercado en Oro, a propósito — las dos puertas para pasar oro cuestan lo
        mismo (ver <a data-cap="taxas">Todas las comisiones</a>).`)}

        <h4>Comercio: negociar con el vendedor</h4>
        <p>Cada anuncio del Mercado de la Comunidad tiene el botón <b>Enviar DM</b>: abre una
        conversación con el vendedor, atada a ese anuncio. Las negociaciones quedan en la propia
        Lista de Amigos, en el modo <b>Comercio</b>, en dos pestañas — <b>Mis Ofertas</b> (los
        vendedores que contactaste) y <b>Mis Productos</b> (los compradores que te contactaron).</p>
        <ul>
          <li>Es para <b>acordar</b>. La compra se sigue haciendo en el Mercado, por el anuncio, con
          el bloqueo de precio y la comisión de siempre.</li>
          <li>La conversación desaparece cuando el anuncio se vende o se retira.</li>
          <li>Cada comprador mantiene hasta <b>${N(MAX_NEGOCIACOES, c.lang)}</b> negociaciones abiertas
          a la vez.</li>
        </ul>
        ${nota(`Vender una cuenta o un pokémon <b>por fuera</b> del Mercado de la Comunidad (PIX, otra
        web, "pásame el pokémon que te pago") está <b>prohibido</b> y puede costar un <b>baneo</b>. El
        juego no tiene cómo proteger a nadie en un intercambio externo: quien es estafado ahí no
        tiene a quién recurrir.`, 'aviso')}

        <h4>Una sesión por cuenta</h4>
        <p>La cuenta juega en <b>un lugar a la vez</b>. Abrir el juego en otro dispositivo o pestaña
        <b>pausa</b> la sesión anterior, que muestra "Cuenta abierta en otro lugar" y el botón
        <b>Jugar aquí</b> — trae el juego de vuelta y pausa la otra. No se pierde nada: la cacería y
        el progreso siguen en la sesión que esté jugando.</p>`,
      };
    },
  },

  {
    id: 'combate',
    titulo: { pt: 'Combate', en: 'Combat', es: 'Combate' },
    grupo: 'luta',
    html: (c) => ({
      pt: `
        <p>O pokémon ativo anda até o selvagem <b>mais próximo</b> e só troca golpes quando
        <b>encosta</b> nele. Nada de dano voando de um lado a outro do mapa.</p>

        <h4>O dano</h4>
        <pre class="wk-formula">base  = ((2 × nível/5 + 2) × power × atk/def) / 50 + 2
final = base × STAB × efetividade × aleatório(0,85–1,00)</pre>
        <ul>
          <li><b>power</b> é o do golpe usado — ver <b>Os golpes</b>, logo abaixo.</li>
          <li><b>STAB</b> é <b>×1,5</b> quando o golpe é de um dos tipos do próprio pokémon.</li>
          <li><b>atk/def</b> usa Ataque e Defesa em golpe físico, e Sp.Atk / Sp.Def em especial.</li>
          <li><b>efetividade</b> vem da <a data-cap="tipos">tabela de tipos</a>, já amplificada.</li>
        </ul>

        <h4>Os golpes</h4>
        <p>O pokémon escolhe sozinho, a cada ataque, o golpe de <b>maior dano esperado</b> contra
        aquele alvo entre os que já recarregaram — pesando o poder, o STAB, a efetividade de tipo e o
        Ataque (ou Sp.Atk) dele contra a defesa do alvo. Enquanto todos recarregam, vem a Investida
        (abaixo).</p>
        <p>A <b>recarga</b> de cada golpe sai do <b>poder</b> dele, numa curva única para o catálogo
        inteiro. Até 100 de poder o golpe paga a recarga quase na proporção; acima disso o golpe caro
        fica cada vez mais barato — é o que mantém o golpe de 600 valendo a pena.</p>
        ${tabelaCurvaGolpes(c)}
        <ul>
          <li><b>Toda última evolução tem dois golpes de 600</b> — um de cada tipo nas de tipo duplo,
          dois do mesmo tipo nas de tipo único —, com ${S(COOLDOWN_600_MS, 'pt')} de recarga. A
          categoria (física ou especial) segue o lado de ataque mais forte da espécie, a não ser que a
          planilha dela escolha outra. A Mega ganha um terceiro, na metade da recarga (ver
          <a data-cap="mega">Mega Evolução</a>).</li>
          <li>Os <a data-cap="lendarios">lendários e míticos</a> vão além: <b>14 golpes, quatro de 600</b> —
          dois de cada tipo, ou os quatro do tipo único. Phione e Poipole, que evoluem (para Manaphy e
          Naganadel), ficam com dez golpes e dois de 600. O clone de Orre herda a lista.</li>
          <li>Cada golpe libera num <b>nível</b>; nas espécies refeitas pelas planilhas de
          balanceamento, todos liberam no nível 1. A ficha da <a data-cap="pokedex">Pokédex</a> mostra
          a lista inteira.</li>
          <li>O <b>Speed</b> encurta a recarga dos golpes em até ${D(SPEED_POTENCIAL_TETO_PCT, 'pt')}%: o
          Speed base da espécie com o IV de SPD (abaixo).</li>
        </ul>

        <h4>O ataque básico</h4>
        <p>Enquanto todos os golpes estão carregando, o pokémon dá uma <b>Investida</b>:
        power <b>30</b>, a cada <b>2 s</b>, no tipo dele. Sem ela um Caterpie daria dois golpes e
        ficaria dez segundos parado. Se o alvo for imune aos dois tipos dele, só um golpe de
        verdade resolve.</p>
        <ul>
          <li>Ela é <b>física</b>: entra na fórmula com <b>Ataque</b> contra a <b>Defesa</b> do
          alvo, nunca com Sp.Atk / Sp.Def. Quem tem ATK baixo e Sp.Atk alto (um Alakazam tem
          <b>50</b> contra <b>135</b>) quase não arranha com o básico e vive dos golpes de
          verdade.</li>
          <li>Como ela sai no tipo do próprio pokémon, o <b>STAB ×1,5 vale sempre</b>: os
          <b>30</b> de power rendem como 45.</li>
          <li>Em pokémon de dois tipos ela tenta o <b>primeiro</b>, e só passa para o segundo se
          o alvo for <b>imune</b> ao primeiro — não é o melhor dos dois contra aquele alvo.</li>
          <li>Os <b>2 s</b> encurtam só com o <b>IV de SPD</b>: −10 ms por ponto, até 1,68 s com
          IV 32 (abaixo).</li>
        </ul>

        <h4>Speed — a recarga dos golpes e o ataque básico</h4>
        <p>O stat <b>SPD</b> da ficha <b>não</b> entra na fórmula de dano nem acelera a corrida na
        hunt. Quem acelera os ataques são o <b>Speed base da espécie</b> e o <b>IV de SPD</b>
        (1–32, sorteado na captura), cada um no seu lugar:</p>
        <ul>
          <li><b>Golpes</b> (skills e ultimates): o Speed base dá um <b>potencial</b> de desconto —
          cada 20 de Speed vale 1%, até 6% no 120; acima disso, cada 40 vale mais 1%, até o teto de
          ${D(SPEED_POTENCIAL_TETO_PCT, 'pt')}%. O IV de SPD decide quanto desse potencial o pokémon
          aproveita: IV 32 aproveita tudo; IV 16, metade.</li>
          <li><b>Investida e intervalo entre ataques</b>: só o IV de SPD, <b>10 ms por ponto</b> (até
          −320 ms), com piso de 400 ms — a Investida de 2 s vira 1,68 s com IV 32, e o intervalo
          entre os seus golpes, de 0,9 s, vira 0,58 s.</li>
        </ul>
        <pre class="wk-formula">potencial = Speed ÷ 20                (Speed até 120)
          = 6 + (Speed − 120) ÷ 40     (acima de 120; teto de ${D(SPEED_POTENCIAL_TETO_PCT, 'pt')}%)
desconto  = potencial × IV de SPD ÷ 32
recarga   = recarga × (1 − desconto ÷ 100)</pre>
        <p>Um Jolteon (Speed 130) tem ${exemploSpeed('pt').potencial}% de potencial; com IV 24 ele
        aproveita 75% disso — ${exemploSpeed('pt').pct}% a menos —, e o golpe de
        ${exemploSpeed('pt').g600} recarrega em ${exemploSpeed('pt').cd}. Com IV 32:</p>
        ${tabelaSpeedGolpes(c)}
        <p>A regra é a mesma na hunt, nos bosses, no <a data-cap="pvp">PvP Ranqueado</a> e na
        Guerra de Guildas.</p>

        <h4>A recarga é do pokémon</h4>
        <p>A recarga de um golpe só corre com o pokémon <b>em campo</b>. Trocar o ativo <b>pausa</b>
        o que falta, guardado com ele; quando ele volta, a recarga continua de onde parou. Trocar por
        tática (tipo contra tipo) não custa nem rende um décimo de segundo — o que deixou de existir
        foi soltar o golpe de 600 de cinco pokémon seguidos e voltar ao primeiro com a recarga já
        vencida.</p>
        <ul>
          <li>A cura da Enfermeira, no Centro, <b>não</b> zera a recarga.</li>
          <li>Só as arenas pagas zeram: entrar num <a data-cap="bosses">Boss</a> ou na
          <a data-cap="mistico">Arena Mística</a> começa com tudo pronto.</li>
          <li>PvP, Guerra de Guilds, ginásio e campeonato são lutas simuladas à parte: todo mundo
          entra com a recarga limpa.</li>
        </ul>

        <h4>Movimento na hunt</h4>
        <p>O pokémon ativo corre um pouco <b>na frente</b> do treinador — é ritmo da cena (260 ms
        vs 290 ms por tile), não stat SPD. Com IV alto você <b>ataca</b> mais rápido e passa mais
        tempo correndo entre alvos, o que pode parecer que “disparou”, mas a velocidade de passo
        não mudou.</p>

        <h4>O selvagem joga com vantagem</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>HP do selvagem na hunt</td><td class="wk-num destaque">×${c.d.multHpSelvagem ?? 5}</td></tr>
           <tr><td>Dano do selvagem por golpe</td><td class="wk-num destaque">×${c.d.multDanoSelvagem ?? 1.8}</td></tr>
           <tr><td>Intervalo mínimo entre golpes seus</td><td class="wk-num">0,9 s</td></tr>
           <tr><td>Intervalo mínimo entre golpes dele</td><td class="wk-num">1,4 s</td></tr>`,
        )}
        <p>Não é injustiça: é o que faz uma hunt no seu nível ser uma luta, e não uma fila.</p>

        <h4>Ondas e corpos</h4>
        <p>Os selvagens nascem em <b>ondas</b>, nos pontos de spawn da área. Quando o campo
        esvazia, a onda seguinte entra em poucos segundos. Quem cai <b>fica no chão por
        30 segundos</b> — e é nele que se joga a bola.</p>
        <p>De <b>Unova em diante</b>, toda área tem o <b>mesmo ritmo</b>: os selvagens nascem em
        <b>bandos</b> espalhados pelo mapa, calibrados para o mesmo time limpar a onda no mesmo tempo em
        qualquer hunt dali — e para a bicicleta render o mesmo em todas.</p>

        <h4>Ouro e drops de cada abate</h4>
        <p>O <b>ouro</b> de um abate tem duas partes, as duas pelo nível do selvagem: a <b>curva</b>,
        que para de crescer no nível 25.000, e o <b>bônus de loot</b> — o que o loot vendido ao NPC
        pagava até 15/10/2026, quando ele saiu do jogo. Até o nível 25.000 o bônus é <b>+15%</b> da
        curva; acima, é ele que cresce, até igualar a curva no topo. O <b>Loot Boost</b> (e o bônus
        de guild e o farm de evento, que somam com ele) multiplica o bônus de loot. O log de batalha
        mostra a parte do bônus em cada abate.</p>
        ${tabelaOuroDoAbate(c, 'pt')}
        <p>O que <b>cai</b> é só <b>pedra de evolução</b>: cada pokémon solta a pedra de <b>cada tipo</b>
        dele (o Pidgey, NORMAL/FLYING, solta Sun Stone e Feather Stone), com a chance do
        <b>estágio</b> na cadeia de evolução. Quem não evolui (Tauros, Lapras) e as variantes da
        Outland contam como forma final. A tabela de cada espécie está na <b>Pokédex</b>.</p>
        ${tabelaPedraPorEstagio(c, 'pt')}

        <h4>Drop na Outland</h4>
        <p>Na <b>Outland</b> o selvagem solta a pedra dos tipos dele como em todo lugar (com a chance
        da forma final) e, além dela, pode soltar <b>1× Bronze Boss Token</b> — entrada de
        <a data-cap="bosses">boss</a> — e os fragmentos de Chave, Shiny Stone e Bicicleta. Kanto e Orre
        não dropam o token.</p>
        ${tabela(
          [c.r.item, c.r.chance, c.r.quando],
          `<tr><td>Bronze Boss Token</td><td class="wk-num destaque">${pctBossToken(c)} · ${umEm(chanceBossToken(c))}</td><td>kill na Outland</td></tr>`,
        )}
        ${nota(`Média de ~${mediaBossToken(c)} derrotas por token na Outland 1 — as outras Outlands
        multiplicam essa chance (tabela logo abaixo). O Loot Boost da Loja,
        o bônus de ranking da guild e os eventos de farm aumentam a chance. O NPC não compra — preço só no
        <a data-cap="comunidade">Mercado da Comunidade</a>.`, 'dica')}

        <h4>As ${quantasOutlands(c)} Outlands</h4>
        <p>A aba <b>Outland</b> do Mapa tem um seletor com as
        <b>${quantasOutlands(c)} Outlands</b>. É o <b>mesmo mapa</b>, os <b>mesmos pokémon</b> e
        o mesmo nível 150 em todas — o que muda é a chance dos quatro drops raros da área (Bronze
        Boss Token, Fragmento de Chave, Fragmento de Shiny Stone e Fragmento de Bicicleta):</p>
        ${tabelaOutlandTiers(c)}
        ${nota(`O degrau vale para os <b>quatro raros ao mesmo tempo</b> e multiplica <b>depois</b>
        do Loot Boost. XP, ouro, captura e as pedras da espécie não mudam — quem sobe de
        Outland está comprando raridade, não velocidade.`, 'dica')}

        <h4>Evolução</h4>
        <p>Variantes de Outland <b>não evoluem</b> — um Ancient Pupitar não vira Ancient Tyranitar.
        Ver <a data-cap="evolucao">Evolução e pedras</a>.</p>`,
      en: `
        <p>The active pokémon walks to the <b>nearest</b> wild and only trades blows once it
        <b>reaches</b> it. No damage flying across the map.</p>

        <h4>Damage</h4>
        <pre class="wk-formula">base  = ((2 × level/5 + 2) × power × atk/def) / 50 + 2
final = base × STAB × effectiveness × random(0.85–1.00)</pre>
        <ul>
          <li><b>power</b> is the move's — see <b>The moves</b>, right below.</li>
          <li><b>STAB</b> is <b>×1.5</b> when the move matches one of the pokémon's own types.</li>
          <li><b>atk/def</b> uses Attack and Defence for physical moves, Sp.Atk / Sp.Def for
          special ones.</li>
          <li><b>effectiveness</b> comes from the <a data-cap="tipos">type chart</a>, already
          amplified.</li>
        </ul>

        <h4>The moves</h4>
        <p>On every attack the pokémon picks, by itself, the move with the <b>highest expected
        damage</b> against that target among the ones off cooldown — weighing power, STAB, type
        effectiveness and its Attack (or Sp.Atk) against the target's defence. While everything is
        recharging, it uses Tackle (below).</p>
        <p>Each move's <b>cooldown</b> comes from its <b>power</b>, on a single curve for the whole
        catalogue. Up to 100 power a move pays its cooldown almost in proportion; above that, an
        expensive move gets cheaper and cheaper — which is what keeps the 600 move worth it.</p>
        ${tabelaCurvaGolpes(c)}
        <ul>
          <li><b>Every final evolution has two 600 moves</b> — one of each type for dual types, two of
          the same type for single types — with a ${S(COOLDOWN_600_MS, 'en')} cooldown. The category
          (physical or special) follows the species' stronger attack side, unless its balance sheet
          picks otherwise. A Mega gets a third one, at half the cooldown (see
          <a data-cap="mega">Mega Evolution</a>).</li>
          <li><a data-cap="lendarios">Legendaries and mythicals</a> go further: <b>14 moves, four of them
          600s</b> — two of each type, or all four of the single type. Phione and Poipole, which evolve
          (into Manaphy and Naganadel), keep ten moves and two 600s. An Orre clone inherits the list.</li>
          <li>Each move unlocks at a <b>level</b>; on species reworked by the balance sheets, every
          move unlocks at level 1. The <a data-cap="pokedex">Pokédex</a> sheet shows the full list.</li>
          <li><b>Speed</b> shortens move cooldowns by up to ${D(SPEED_POTENCIAL_TETO_PCT, 'en')}%: the
          species' base Speed together with the SPD IV (below).</li>
        </ul>

        <h4>The basic attack</h4>
        <p>While every move is on cooldown, the pokémon throws a <b>Tackle</b>: power <b>30</b>,
        every <b>2 s</b>, in its own type. Without it a Caterpie would land two moves and then
        stand still for ten seconds. If the target is immune to both of its types, only a real
        move works.</p>
        <ul>
          <li>It is <b>physical</b>: it enters the formula with <b>Attack</b> against the
          target's <b>Defense</b>, never Sp.Atk / Sp.Def. A pokémon with low ATK and high Sp.Atk
          (Alakazam has <b>50</b> against <b>135</b>) barely scratches with the basic and lives
          off its real moves.</li>
          <li>Since it always comes out in the pokémon's own type, <b>STAB ×1.5 always
          applies</b>: those <b>30</b> power hit like 45.</li>
          <li>On a dual-type pokémon it tries the <b>first</b> type, and only falls back to the
          second if the target is <b>immune</b> to the first — it is not the better of the
          two.</li>
          <li>The <b>2 s</b> shorten only with the <b>SPD IV</b>: −10 ms per point, down to 1.68 s
          at IV 32 (below).</li>
        </ul>

        <h4>Speed — move cooldowns and the basic attack</h4>
        <p>The <b>SPD</b> stat on the sheet does <b>not</b> enter the damage formula nor speed up
        running on the hunt map. What speeds up attacks is the <b>species' base Speed</b> and the
        <b>SPD IV</b> (1–32, rolled at capture), each in its own place:</p>
        <ul>
          <li><b>Moves</b> (skills and ultimates): base Speed gives a discount <b>potential</b> —
          every 20 Speed is worth 1%, up to 6% at 120; above that, every 40 adds 1%, up to a cap of
          ${D(SPEED_POTENCIAL_TETO_PCT, 'en')}%. The SPD IV decides how much of that potential the
          pokémon gets: IV 32 gets all of it; IV 16, half.</li>
          <li><b>Tackle and the gap between attacks</b>: only the SPD IV, <b>10 ms per point</b>
          (up to −320 ms), with a 400 ms floor — the 2 s Tackle becomes 1.68 s at IV 32, and the
          0.9 s gap between your attacks becomes 0.58 s.</li>
        </ul>
        <pre class="wk-formula">potential = Speed ÷ 20                (Speed up to 120)
          = 6 + (Speed − 120) ÷ 40     (above 120; capped at ${D(SPEED_POTENCIAL_TETO_PCT, 'en')}%)
discount  = potential × SPD IV ÷ 32
cooldown  = cooldown × (1 − discount ÷ 100)</pre>
        <p>A Jolteon (Speed 130) has ${exemploSpeed('en').potencial}% potential; at IV 24 it gets
        75% of it — ${exemploSpeed('en').pct}% off —, and its ${exemploSpeed('en').g600} move
        recharges in ${exemploSpeed('en').cd}. At IV 32:</p>
        ${tabelaSpeedGolpes(c)}
        <p>The rule is the same on the hunt, against bosses, in <a data-cap="pvp">Ranked PvP</a>
        and in the Guild War.</p>

        <h4>Cooldowns belong to the pokémon</h4>
        <p>A move's cooldown only runs while the pokémon is <b>on the field</b>. Switching the active
        one <b>pauses</b> what is left, stored with it; when it comes back, the cooldown carries on
        from where it stopped. Switching for tactics (type against type) neither costs nor earns a
        tenth of a second — what no longer works is firing the 600 move of five pokémon in a row and
        coming back to the first one with its cooldown already done.</p>
        <ul>
          <li>Nurse Joy's healing, at the Center, does <b>not</b> reset cooldowns.</li>
          <li>Only the paid arenas reset them: entering a <a data-cap="bosses">Boss</a> or the
          <a data-cap="mistico">Mystic Arena</a> starts with everything ready.</li>
          <li>PvP, Guild War, gyms and championships are separate simulated battles: everyone goes in
          with clean cooldowns.</li>
        </ul>

        <h4>Movement on the hunt</h4>
        <p>The active pokémon runs slightly <b>ahead</b> of the trainer — scene pacing (260 ms vs
        290 ms per tile), not SPD stat. High SPD IV makes you <b>attack</b> faster and spend more
        time running between targets, which can look like it “shot ahead”, but step speed did not
        change.</p>

        <h4>The wild plays with an edge</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Wild HP on the hunt</td><td class="wk-num destaque">×${c.d.multHpSelvagem ?? 5}</td></tr>
           <tr><td>Wild damage per hit</td><td class="wk-num destaque">×${c.d.multDanoSelvagem ?? 1.8}</td></tr>
           <tr><td>Minimum gap between your hits</td><td class="wk-num">0.9 s</td></tr>
           <tr><td>Minimum gap between its hits</td><td class="wk-num">1.4 s</td></tr>`,
        )}
        <p>It is not unfair: it is what makes a hunt at your level a fight rather than a queue.</p>

        <h4>Waves and bodies</h4>
        <p>Wilds spawn in <b>waves</b>, at the area's spawn points. When the field empties, the
        next wave arrives within seconds. Whatever falls <b>stays on the ground for 30
        seconds</b> — and that is what you throw a ball at.</p>
        <p>From <b>Unova onward</b>, every area has the <b>same pace</b>: wild pokémon spawn in
        <b>packs</b> spread across the map, tuned so the same team clears a wave in the same time on any of
        those hunts — and so the bicycle pays off the same on all of them.</p>

        <h4>Gold and drops from each defeat</h4>
        <p>The <b>gold</b> from a defeat has two parts, both by the wild's level: the <b>curve</b>,
        which stops growing at level 25,000, and the <b>loot bonus</b> — what loot sold to the NPC used
        to pay until 10/15/2026, when it left the game. Up to level 25,000 the bonus is <b>+15%</b> of
        the curve; above that, the bonus is what keeps growing, until it matches the curve at the top.
        <b>Loot Boost</b> (plus the guild bonus and event farm, which add up with it) multiplies the
        loot bonus. The battle log shows the bonus part of every defeat.</p>
        ${tabelaOuroDoAbate(c, 'en')}
        <p>What <b>drops</b> is only <b>evolution stones</b>: every pokémon drops the stone of <b>each
        of its types</b> (Pidgey, NORMAL/FLYING, drops Sun Stone and Feather Stone), with the chance of
        its <b>stage</b> in the evolution chain. Pokémon that don't evolve (Tauros, Lapras) and the
        Outland variants count as final forms. Each species' table is in the <b>Pokédex</b>.</p>
        ${tabelaPedraPorEstagio(c, 'en')}

        <h4>Outland drop</h4>
        <p>In <b>Outland</b> the wild drops the stones of its types like everywhere else (at the
        final-form chance) and, besides them, can drop <b>1× Bronze Boss Token</b> — a
        <a data-cap="bosses">boss</a> entry ticket — and the Key, Shiny Stone and Bicycle fragments.
        Kanto and Orre do not drop the token.</p>
        ${tabela(
          [c.r.item, c.r.chance, c.r.quando],
          `<tr><td>Bronze Boss Token</td><td class="wk-num destaque">${pctBossToken(c)} · ${umEm(chanceBossToken(c))}</td><td>Outland kill</td></tr>`,
        )}
        ${nota(`Average ~${mediaBossToken(c)} defeats per token in Outland 1 — the other Outlands
        multiply that chance (table right below). The Shop's Loot Boost, the
        guild ranking bonus and farm events raise the chance. The NPC does not buy it — price only on the
        <a data-cap="comunidade">Community Market</a>.`, 'dica')}

        <h4>The ${quantasOutlands(c)} Outlands</h4>
        <p>The <b>Outland</b> tab on the Map has a selector with all
        <b>${quantasOutlands(c)} Outlands</b>. Same map, same pokémon and the same level 150 in
        every one of them — what changes is the chance of the area's four rare drops (Bronze
        Boss Token, Key Fragment, Shiny Stone Fragment and Bicycle Fragment):</p>
        ${tabelaOutlandTiers(c)}
        ${nota(`The step applies to <b>all four rares at once</b> and multiplies <b>after</b>
        Loot Boost. XP, gold, capture and the species' stones do not change — moving up an
        Outland buys rarity, not speed.`, 'dica')}

        <h4>Evolution</h4>
        <p>Outland variants <b>do not evolve</b> — an Ancient Pupitar does not become Ancient
        Tyranitar. See <a data-cap="evolucao">Evolution &amp; stones</a>.</p>`,
      es: `
        <p>El pokémon activo camina hasta el salvaje <b>más cercano</b> y solo intercambia golpes
        cuando lo <b>alcanza</b>. Nada de daño volando de un lado a otro del mapa.</p>

        <h4>El daño</h4>
        <pre class="wk-formula">base  = ((2 × nivel/5 + 2) × power × atk/def) / 50 + 2
final = base × STAB × efectividad × aleatorio(0,85–1,00)</pre>
        <ul>
          <li><b>power</b> es el del movimiento — ver <b>Los golpes</b>, justo abajo.</li>
          <li><b>STAB</b> es <b>×1,5</b> cuando el movimiento es de uno de los tipos del pokémon.</li>
          <li><b>atk/def</b> usa Ataque y Defensa en movimientos físicos, y Sp.Atk / Sp.Def en
          especiales.</li>
          <li><b>efectividad</b> viene de la <a data-cap="tipos">tabla de tipos</a>, ya
          amplificada.</li>
        </ul>

        <h4>Los golpes</h4>
        <p>En cada ataque el pokémon elige solo el golpe de <b>mayor daño esperado</b> contra ese
        objetivo entre los que ya se recargaron — pesando el poder, el STAB, la efectividad de tipo y
        su Ataque (o Sp.Atk) contra la defensa del objetivo. Mientras todos se recargan, usa la
        Embestida (abajo).</p>
        <p>La <b>recarga</b> de cada golpe sale de su <b>poder</b>, en una curva única para todo el
        catálogo. Hasta 100 de poder el golpe paga la recarga casi en proporción; por encima, el golpe
        caro sale cada vez más barato — es lo que mantiene el golpe de 600 valiendo la pena.</p>
        ${tabelaCurvaGolpes(c)}
        <ul>
          <li><b>Toda última evolución tiene dos golpes de 600</b> — uno de cada tipo en las de tipo
          doble, dos del mismo tipo en las de tipo único —, con ${S(COOLDOWN_600_MS, 'es')} de recarga.
          La categoría (física o especial) sigue el lado de ataque más fuerte de la especie, salvo que
          su planilla elija otra. La Mega gana un tercero, con la mitad de recarga (ver
          <a data-cap="mega">Mega Evolución</a>).</li>
          <li>Los <a data-cap="lendarios">legendarios y míticos</a> van más allá: <b>14 golpes, cuatro de
          600</b> — dos de cada tipo, o los cuatro del tipo único. Phione y Poipole, que evolucionan (a
          Manaphy y Naganadel), se quedan con diez golpes y dos de 600. El clon de Orre hereda la lista.</li>
          <li>Cada golpe se desbloquea en un <b>nivel</b>; en las especies rehechas por las planillas
          de balance, todos se desbloquean en el nivel 1. La ficha de la
          <a data-cap="pokedex">Pokédex</a> muestra la lista entera.</li>
          <li>El <b>Speed</b> acorta la recarga de los golpes hasta un ${D(SPEED_POTENCIAL_TETO_PCT, 'es')}%:
          el Speed base de la especie con el IV de SPD (abajo).</li>
        </ul>

        <h4>El ataque básico</h4>
        <p>Mientras todos los movimientos se recargan, el pokémon lanza una <b>Embestida</b>:
        power <b>30</b>, cada <b>2 s</b>, de su propio tipo. Sin ella un Caterpie daría dos golpes
        y se quedaría diez segundos quieto. Si el objetivo es inmune a sus dos tipos, solo un
        movimiento de verdad sirve.</p>
        <ul>
          <li>Es <b>física</b>: entra en la fórmula con el <b>Ataque</b> contra la <b>Defensa</b>
          del objetivo, nunca con Sp.Atk / Sp.Def. Quien tiene ATK bajo y Sp.Atk alto (un
          Alakazam tiene <b>50</b> contra <b>135</b>) casi no rasca con el básico y vive de los
          movimientos de verdad.</li>
          <li>Como siempre sale del tipo del propio pokémon, el <b>STAB ×1,5 vale siempre</b>:
          esos <b>30</b> de power rinden como 45.</li>
          <li>En un pokémon de dos tipos prueba el <b>primero</b>, y solo pasa al segundo si el
          objetivo es <b>inmune</b> al primero — no es el mejor de los dos.</li>
          <li>Los <b>2 s</b> se acortan solo con el <b>IV de SPD</b>: −10 ms por punto, hasta
          1,68 s con IV 32 (abajo).</li>
        </ul>

        <h4>Speed — la recarga de los golpes y el ataque básico</h4>
        <p>El stat <b>SPD</b> de la ficha <b>no</b> entra en la fórmula de daño ni acelera la
        carrera en la cacería. Lo que acelera los ataques es el <b>Speed base de la especie</b> y el
        <b>IV de SPD</b> (1–32, sorteado al capturar), cada uno en su lugar:</p>
        <ul>
          <li><b>Golpes</b> (skills y ultimates): el Speed base da un <b>potencial</b> de descuento —
          cada 20 de Speed vale 1%, hasta 6% en 120; por encima, cada 40 suma 1%, hasta el tope de
          ${D(SPEED_POTENCIAL_TETO_PCT, 'es')}%. El IV de SPD decide cuánto de ese potencial aprovecha
          el pokémon: IV 32 lo aprovecha todo; IV 16, la mitad.</li>
          <li><b>Embestida e intervalo entre ataques</b>: solo el IV de SPD, <b>10 ms por punto</b>
          (hasta −320 ms), con piso de 400 ms — la Embestida de 2 s pasa a 1,68 s con IV 32, y el
          intervalo entre tus golpes, de 0,9 s, pasa a 0,58 s.</li>
        </ul>
        <pre class="wk-formula">potencial = Speed ÷ 20                (Speed hasta 120)
          = 6 + (Speed − 120) ÷ 40     (por encima de 120; tope de ${D(SPEED_POTENCIAL_TETO_PCT, 'es')}%)
descuento = potencial × IV de SPD ÷ 32
recarga   = recarga × (1 − descuento ÷ 100)</pre>
        <p>Un Jolteon (Speed 130) tiene ${exemploSpeed('es').potencial}% de potencial; con IV 24
        aprovecha el 75% — ${exemploSpeed('es').pct}% menos —, y su golpe de
        ${exemploSpeed('es').g600} se recarga en ${exemploSpeed('es').cd}. Con IV 32:</p>
        ${tabelaSpeedGolpes(c)}
        <p>La regla es la misma en la cacería, contra los bosses, en el
        <a data-cap="pvp">PvP Clasificatorio</a> y en la Guerra de Guilds.</p>

        <h4>La recarga es del pokémon</h4>
        <p>La recarga de un golpe solo corre con el pokémon <b>en el campo</b>. Cambiar el activo
        <b>pausa</b> lo que falta, guardado con él; cuando vuelve, la recarga sigue desde donde se
        quedó. Cambiar por táctica (tipo contra tipo) no cuesta ni rinde una décima de segundo — lo
        que ya no funciona es soltar el golpe de 600 de cinco pokémon seguidos y volver al primero con
        la recarga ya cumplida.</p>
        <ul>
          <li>La cura de la Enfermera, en el Centro, <b>no</b> reinicia la recarga.</li>
          <li>Solo las arenas de pago la reinician: entrar en un <a data-cap="bosses">Boss</a> o en la
          <a data-cap="mistico">Arena Mística</a> empieza con todo listo.</li>
          <li>PvP, Guerra de Guilds, gimnasio y campeonato son combates simulados aparte: todos
          entran con la recarga limpia.</li>
        </ul>

        <h4>Movimiento en la cacería</h4>
        <p>El pokémon activo corre un poco <b>delante</b> del entrenador — ritmo de la escena (260 ms
        vs 290 ms por tile), no stat SPD. Con IV alto <b>atacas</b> más rápido y pasas más tiempo
        corriendo entre objetivos; puede parecer que “disparó”, pero la velocidad de paso no cambió.</p>

        <h4>El salvaje juega con ventaja</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>HP del salvaje en la cacería</td><td class="wk-num destaque">×${c.d.multHpSelvagem ?? 5}</td></tr>
           <tr><td>Daño del salvaje por golpe</td><td class="wk-num destaque">×${c.d.multDanoSelvagem ?? 1.8}</td></tr>
           <tr><td>Intervalo mínimo entre tus golpes</td><td class="wk-num">0,9 s</td></tr>
           <tr><td>Intervalo mínimo entre los suyos</td><td class="wk-num">1,4 s</td></tr>`,
        )}
        <p>No es injusticia: es lo que hace que una cacería de tu nivel sea un combate y no una
        fila.</p>

        <h4>Oleadas y cuerpos</h4>
        <p>Los salvajes nacen en <b>oleadas</b>, en los puntos de aparición de la zona. Cuando el
        campo se vacía, la siguiente entra en pocos segundos. El que cae <b>se queda en el suelo
        30 segundos</b> — y es ahí donde se lanza la bola.</p>
        <p>Desde <b>Unova en adelante</b>, todas las zonas tienen el <b>mismo ritmo</b>: los salvajes
        nacen en <b>grupos</b> repartidos por el mapa, calibrados para que el mismo equipo limpie la oleada
        en el mismo tiempo en cualquiera de esas cazas — y para que la bici rinda lo mismo en todas.</p>

        <h4>Oro y drops de cada derrota</h4>
        <p>El <b>oro</b> de una derrota tiene dos partes, las dos por el nivel del salvaje: la
        <b>curva</b>, que deja de crecer en el nivel 25.000, y el <b>bono de loot</b> — lo que el loot
        vendido al NPC pagaba hasta el 15/10/2026, cuando salió del juego. Hasta el nivel 25.000 el
        bono es <b>+15%</b> de la curva; por encima, es él el que crece, hasta igualar la curva en la
        cima. El <b>Loot Boost</b> (y el bono de guild y el farm de evento, que se suman a él)
        multiplica el bono de loot. El registro de batalla muestra la parte del bono en cada derrota.</p>
        ${tabelaOuroDoAbate(c, 'es')}
        <p>Lo que <b>cae</b> es solo <b>piedra evolutiva</b>: cada pokémon suelta la piedra de <b>cada
        uno de sus tipos</b> (Pidgey, NORMAL/FLYING, suelta Sun Stone y Feather Stone), con la
        probabilidad de su <b>etapa</b> en la cadena evolutiva. Quien no evoluciona (Tauros, Lapras) y
        las variantes de Outland cuentan como forma final. La tabla de cada especie está en la
        <b>Pokédex</b>.</p>
        ${tabelaPedraPorEstagio(c, 'es')}

        <h4>Drop en Outland</h4>
        <p>En <b>Outland</b> el salvaje suelta las piedras de sus tipos como en todas partes (con la
        probabilidad de forma final) y, además, puede soltar <b>1× Bronze Boss Token</b> — entrada de
        <a data-cap="bosses">boss</a> — y los fragmentos de Llave, Shiny Stone y Bicicleta. Kanto y
        Orre no sueltan el token.</p>
        ${tabela(
          [c.r.item, c.r.chance, c.r.quando],
          `<tr><td>Bronze Boss Token</td><td class="wk-num destaque">${pctBossToken(c)} · ${umEm(chanceBossToken(c))}</td><td>kill en Outland</td></tr>`,
        )}
        ${nota(`Media de ~${mediaBossToken(c)} derrotas por token en Outland 1 — las demás Outlands
        multiplican esa probabilidad (tabla justo abajo). El Loot Boost de la
        Tienda, el bono de ranking de la guild y los eventos de farm suben la chance. El NPC no compra — precio solo en el
        <a data-cap="comunidade">Mercado de la Comunidad</a>.`, 'dica')}

        <h4>Las ${quantasOutlands(c)} Outlands</h4>
        <p>La pestaña <b>Outland</b> del Mapa tiene un selector con las
        <b>${quantasOutlands(c)} Outlands</b>. Es el <b>mismo mapa</b>, los <b>mismos pokémon</b>
        y el mismo nivel 150 en todas — lo que cambia es la probabilidad de los cuatro drops raros
        de la zona (Bronze Boss Token, Fragmento de Llave, Fragmento de Shiny Stone y Fragmento de bicicleta):</p>
        ${tabelaOutlandTiers(c)}
        ${nota(`El escalón vale para los <b>cuatro raros a la vez</b> y multiplica <b>después</b>
        del Loot Boost. XP, oro, captura y las piedras de la especie no cambian — subir de
        Outland compra rareza, no velocidad.`, 'dica')}

        <h4>Evolución</h4>
        <p>Las variantes de Outland <b>no evolucionan</b> — un Ancient Pupitar no se convierte en
        Ancient Tyranitar. Ver <a data-cap="evolucao">Evolución y piedras</a>.</p>`,
    }),
  },

  // -------------------------------------------------------------- 7. tipos
  {
    id: 'tipos',
    titulo: { pt: 'Tipos: forças e fraquezas', en: 'Types: strengths and weaknesses', es: 'Tipos: fuerzas y debilidades' },
    grupo: 'luta',
    html: (c) => ({
      pt: `
        <p>A efetividade é <b>multiplicativa nos dois tipos</b> do defensor. Água contra
        Rocha/Terra é ×2 × ×2 = <b>×4</b>.</p>
        <pre class="wk-formula">efetividade = tabela[atacante][tipo1] × tabela[atacante][tipo2]</pre>

        <h4>Na hunt a vantagem é ${c.d.ampliacaoHunt ?? 1.5}× mais forte</h4>
        <p>É a mecânica mais específica deste jogo, e vale <b>nos dois sentidos</b>: bater no
        tipo certo compensa muito mais, e bater no errado dói muito mais.</p>
        ${tabelaDeAmplificacao(c)}
        ${nota(`Imunidade (×0) e neutro (×1) <b>não</b> mudam. Fogo contra Água vira <b>×0,33</b> —
        é literalmente por isso que um Charmander não encara um Magikarp: com HP ×5 ele
        simplesmente não morre.`)}

        <h4>A tabela completa</h4>
        <p>Linha = tipo do <b>golpe</b>. Coluna = tipo do <b>defensor</b>. Célula vazia é neutro
        (×1). Passe o mouse para ver o valor já amplificado da hunt.</p>
        ${gradeDeTipos(c)}`,
      en: `
        <p>Effectiveness is <b>multiplicative across both</b> defender types. Water against
        Rock/Ground is ×2 × ×2 = <b>×4</b>.</p>
        <pre class="wk-formula">effectiveness = chart[attacker][type1] × chart[attacker][type2]</pre>

        <h4>On the hunt the advantage is ${c.d.ampliacaoHunt ?? 1.5}× stronger</h4>
        <p>This is the most game-specific mechanic here, and it cuts <b>both ways</b>: hitting the
        right type pays much more, and hitting the wrong one hurts much more.</p>
        ${tabelaDeAmplificacao(c)}
        ${nota(`Immunity (×0) and neutral (×1) do <b>not</b> change. Fire against Water becomes
        <b>×0.33</b> — which is literally why a Charmander cannot handle a Magikarp: with ×5 HP it
        simply will not die.`)}

        <h4>The full chart</h4>
        <p>Row = <b>move</b> type. Column = <b>defender</b> type. An empty cell is neutral (×1).
        Hover to see the hunt-amplified value.</p>
        ${gradeDeTipos(c)}`,
      es: `
        <p>La efectividad es <b>multiplicativa en los dos tipos</b> del defensor. Agua contra
        Roca/Tierra es ×2 × ×2 = <b>×4</b>.</p>
        <pre class="wk-formula">efectividad = tabla[atacante][tipo1] × tabla[atacante][tipo2]</pre>

        <h4>En la cacería la ventaja es ${c.d.ampliacaoHunt ?? 1.5}× más fuerte</h4>
        <p>Es la mecánica más específica de este juego, y vale <b>en los dos sentidos</b>: pegar
        con el tipo correcto compensa mucho más, y pegar con el equivocado duele mucho más.</p>
        ${tabelaDeAmplificacao(c)}
        ${nota(`La inmunidad (×0) y lo neutro (×1) <b>no</b> cambian. Fuego contra Agua pasa a
        <b>×0,33</b> — literalmente por eso un Charmander no aguanta a un Magikarp: con HP ×5
        simplemente no muere.`)}

        <h4>La tabla completa</h4>
        <p>Fila = tipo del <b>movimiento</b>. Columna = tipo del <b>defensor</b>. Celda vacía es
        neutro (×1). Pasa el ratón para ver el valor ya amplificado de la cacería.</p>
        ${gradeDeTipos(c)}`,
    }),
  },

  // ------------------------------------------------------------ 8. captura
  {
    id: 'captura',
    titulo: { pt: 'Captura', en: 'Catching', es: 'Captura' },
    grupo: 'luta',
    html: (c) => {
      const beast = (c.d.catalogoBolas ?? []).find((b) => b.id === 5);
      const catchBeast = beast?.catchRate ?? 8;
      const pctFacil = P(chanceCapturaWiki(c, PRECO_CAPTURA_FACIL, catchBeast), c.lang);
      const pctMediano = P(chanceCapturaWiki(c, PRECO_CAPTURA_MEDIANO, catchBeast), c.lang);
      return {
      pt: `
        <h4>As pokébolas</h4>
        ${tabelaDeBolas(c)}
        <p>A <b>Beast Ball</b> é a mais forte e não se compra com ouro — só em pacotes na
        <a data-cap="loja">Loja de Diamantes</a>.</p>

        <h4>A chance por arremesso</h4>
        <pre class="wk-formula">raridade = log10(máx(100, preçoNpc)) − 1
fator    = 1 + raridade³ / ${c.d.captura?.raridadeDiv ?? 17}
chance   = ${c.d.captura?.base ?? 0.0075} × (eficiência / fator) × (1,4 − hpAtual/hpMáximo)</pre>
        <p>Limitada entre <b>${P(c.d.captura?.piso ?? 0.003, c.lang)}</b> e
        <b>${P(c.d.captura?.teto ?? 0.1, c.lang)}</b>. Três coisas decidem tudo:</p>
        <ul>
          <li><b>Quanto o pokémon vale</b> (o preço de NPC dele, em escala logarítmica). Um
          Pidgey sai fácil; um Dragonite, não.</li>
          <li><b>A bola.</b> A eficiência entra multiplicando direto.</li>
          <li><b>O HP do alvo.</b> A bola só vai em quem já caiu, e corpo tem HP zero — que é a
          ponta boa da fórmula.</li>
        </ul>

        ${nota(`<b>Capturar é difícil de propósito.</b> Com a MELHOR bola, num corpo caído, a
        espécie mais fácil do jogo dá <b>${pctFacil}</b> e a mediana dá <b>${pctMediano}</b> — e daí para cima
        cai rápido. A ficha de cada espécie na Pokédex mostra a tabela exata, bola por bola,
        com quantas derrotas isso significa na média.`, 'dica')}

        <h4>É uma tentativa por corpo</h4>
        <p>Se a bola falhar num <b>corpo caído</b>, ele some do mapa. Não dá para despejar bolas
        no mesmo alvo até sair — o custo por captura existe justamente por isso. Um selvagem
        <b>vivo</b> continua em campo quando a bola falha, porque ele ainda está lutando.</p>

        <h4>O nível do capturado</h4>
        <p>O selvagem <b>luta</b> no nível da hunt; o capturado <b>nasce</b> no teto da espécie.
        O teto sai da cadeia evolutiva dela:</p>
        <pre class="wk-formula">cadeia de 3 (Treecko → Grovyle → Sceptile)   20 · 40 · 100
cadeia de 2 (Makuhita → Hariyama)                 40 · 100
não evolui (Spinda, variantes de Outland)              100</pre>
        <p><b>Até o Nv 100 nada muda</b> — Kanto e Johto inteiras entregam o bicho no
        nível em que ele estava caído. Acima disso o teto manda: um Torterra derrubado numa hunt
        de 3.500 entra na equipe no <b>Nv 100</b>, e um Turtwig, no <b>Nv 20</b>.</p>
        <p>A <b>evolução das espécies nacionais</b> segue a mesma escada: quando o destino mora em
        hunt de Nv 100+, o elo pede o <b>teto do destino</b> (40 ou 100), não o nível da hunt
        onde ele aparece. O caminho é capturar no 20, treinar até 40, evoluir; treinar até 100,
        evoluir de novo. <b>Variantes de Outland (#2001+) não entram nessa conta — não
        evoluem</b> (ver capítulo Evolução).</p>

        ${nota(`Cada ficha da Pokédex tem a linha <b>Nível ao capturar</b>, e o painel dos caídos
        mostra o "→ Nv" antes de você gastar a bola. O bicho continua valendo o que vale — ele
        só chega para ser treinado, e não pronto.`, 'dica')}

        <h4>O que aumenta</h4>
        <ul>
          <li><b>Capture Boost</b> (Loja) — <b>dobra</b> a chance por arremesso, respeitando o
          teto de ${P(c.d.captura?.teto ?? 0.1, c.lang)}.</li>
          <li><b>Bônus na Kick</b> — +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'pt')}% por hora resgatada
          com pontos do canal, multiplicando com o boost da Loja (ver
          <a data-cap="bonusLive">Bônus de live</a>).</li>
          <li><b>Bola melhor</b> — a Poké Ball é a mais barata <i>por arremesso</i>, mas a Ultra
          e a Beast gastam menos tempo.</li>
        </ul>
        ${nota(`O lendário da <a data-cap="mistico">Arena Mística</a> não segue esta fórmula: lá a
        chance é uma tabela por bola, igual para todos, e a tentativa é uma só.`)}

        <h4>Automação</h4>
        <p>As opções <b>Lançar até Capturar</b> e <b>Lançar sem Parar</b> arremessam sozinhas nos corpos
        caídos, respeitando um intervalo de 1,2 s — a primeira para na captura, a segunda não. São um
        <b>benefício de VIP</b> — ver
        <a data-cap="automacoes">Automações</a>.</p>`,
      en: `
        <h4>The balls</h4>
        ${tabelaDeBolas(c)}
        <p>The <b>Beast Ball</b> is the strongest and cannot be bought with gold — only in packs
        at the <a data-cap="loja">Diamond Shop</a>.</p>

        <h4>Chance per throw</h4>
        <pre class="wk-formula">rarity = log10(max(100, npcPrice)) − 1
factor = 1 + rarity³ / ${c.d.captura?.raridadeDiv ?? 17}
chance = ${c.d.captura?.base ?? 0.0075} × (efficiency / factor) × (1.4 − currentHp/maxHp)</pre>
        <p>Clamped between <b>${P(c.d.captura?.piso ?? 0.003, c.lang)}</b> and
        <b>${P(c.d.captura?.teto ?? 0.1, c.lang)}</b>. Three things decide everything:</p>
        <ul>
          <li><b>How much the pokémon is worth</b> (its NPC price, on a log scale). A Pidgey comes
          easy; a Dragonite does not.</li>
          <li><b>The ball.</b> Efficiency multiplies directly.</li>
          <li><b>The target's HP.</b> The ball only goes at something already down, and a body has
          zero HP — the good end of the formula.</li>
        </ul>

        ${nota(`<b>Catching is meant to be hard.</b> With the BEST ball, on a fallen body, the
        easiest species in the game gives <b>${pctFacil}</b> and the median gives <b>${pctMediano}</b> — and it
        drops fast from there. Each species sheet in the Pokédex shows the exact table, ball by
        ball, with how many kills that means on average.`, 'dica')}

        <h4>One attempt per body</h4>
        <p>If the ball fails on a <b>fallen body</b>, it vanishes from the map. You cannot dump
        balls on the same target until one sticks — that is precisely what gives capture a cost. A
        <b>living</b> wild stays on the field when a ball fails, because it is still fighting.</p>

        <h4>The level it joins at</h4>
        <p>The wild one <b>fights</b> at the hunt's level; the caught one <b>is born</b> at the
        species cap. The cap comes from its evolution chain:</p>
        <pre class="wk-formula">3-stage chain (Treecko → Grovyle → Sceptile)   20 · 40 · 100
2-stage chain (Makuhita → Hariyama)                 40 · 100
no evolution (Spinda, Outland variants)                  100</pre>
        <p><b>Up to Lv 100 nothing changes</b> — all of Kanto and Johto hand you the
        pokémon at the level it was lying at. Above that the cap rules: a Torterra knocked down in
        a level 3,500 hunt joins at <b>Lv 100</b>, and a Turtwig at <b>Lv 20</b>.</p>
        <p><b>National species</b> follow the same ladder: when the target lives in a hunt above
        Lv 100, the step asks for the <b>destination's cap</b> (40 or 100), not the level of the
        hunt where it appears. Catch at 20, train to 40, evolve; train to 100, evolve again.
        <b>Outland variants (#2001+) are not part of this — they do not evolve</b> (see the
        Evolution chapter).</p>

        ${nota(`Every Pokédex sheet has a <b>Level when caught</b> line, and the fallen panel shows
        the "→ Lv" before you spend the ball. The pokémon is still worth what it is worth — it just
        arrives to be trained, not finished.`, 'dica')}

        <h4>What raises it</h4>
        <ul>
          <li><b>Capture Boost</b> (Shop) — <b>doubles</b> the per-throw chance, still respecting
          the ${P(c.d.captura?.teto ?? 0.1, c.lang)} ceiling.</li>
          <li><b>Kick Bonus</b> — +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'en')}% per hour redeemed with
          channel points, multiplying with the Shop boost (see
          <a data-cap="bonusLive">Live bonuses</a>).</li>
          <li><b>A better ball</b> — the Poké Ball is the cheapest <i>per throw</i>, but the Ultra
          and the Beast spend less of your time.</li>
        </ul>
        ${nota(`The legendary in the <a data-cap="mistico">Mystic Arena</a> does not follow this
        formula: there the chance is a per-ball table, the same for every legendary, and you get a
        single try.`)}

        <h4>Automation</h4>
        <p>The <b>Throw until Catch</b> and <b>Throw Nonstop</b> options throw at fallen bodies on their
        own, respecting a 1.2 s gap — the first stops at the catch, the second doesn't. They are a
        <b>VIP benefit</b> — see <a data-cap="automacoes">Automation</a>.</p>`,
      es: `
        <h4>Las poké balls</h4>
        ${tabelaDeBolas(c)}
        <p>La <b>Beast Ball</b> es la más fuerte y no se compra con oro — solo en paquetes en la
        <a data-cap="loja">Tienda de Diamantes</a>.</p>

        <h4>La probabilidad por lanzamiento</h4>
        <pre class="wk-formula">rareza = log10(máx(100, precioNpc)) − 1
factor = 1 + rareza³ / ${c.d.captura?.raridadeDiv ?? 17}
prob.  = ${c.d.captura?.base ?? 0.0075} × (eficiencia / factor) × (1,4 − hpActual/hpMáximo)</pre>
        <p>Limitada entre <b>${P(c.d.captura?.piso ?? 0.003, c.lang)}</b> y
        <b>${P(c.d.captura?.teto ?? 0.1, c.lang)}</b>. Tres cosas lo deciden todo:</p>
        <ul>
          <li><b>Cuánto vale el pokémon</b> (su precio de NPC, en escala logarítmica). Un Pidgey
          sale fácil; un Dragonite, no.</li>
          <li><b>La bola.</b> La eficiencia multiplica directamente.</li>
          <li><b>El HP del objetivo.</b> La bola solo va a quien ya cayó, y un cuerpo tiene HP cero —
          el extremo bueno de la fórmula.</li>
        </ul>

        ${nota(`<b>Capturar es difícil a propósito.</b> Con la MEJOR bola, en un cuerpo caído, la
        especie más fácil del juego da <b>${pctFacil}</b> y la mediana da <b>${pctMediano}</b> — y de ahí para
        arriba cae rápido. La ficha de cada especie en la Pokédex muestra la tabla exacta, bola
        por bola, con cuántas derrotas significa eso de media.`, 'dica')}

        <h4>Es un intento por cuerpo</h4>
        <p>Si la bola falla en un <b>cuerpo caído</b>, este desaparece del mapa. No se pueden
        volcar bolas sobre el mismo objetivo hasta que salga — el coste por captura existe
        justamente por eso. Un salvaje <b>vivo</b> sigue en el campo cuando la bola falla, porque
        todavía está peleando.</p>

        <h4>El nivel del capturado</h4>
        <p>El salvaje <b>pelea</b> en el nivel de la cacería; el capturado <b>nace</b> en el tope
        de la especie. El tope sale de su cadena evolutiva:</p>
        <pre class="wk-formula">cadena de 3 (Treecko → Grovyle → Sceptile)   20 · 40 · 100
cadena de 2 (Makuhita → Hariyama)                 40 · 100
no evoluciona (Spinda, variantes de Outland)           100</pre>
        <p><b>Hasta el Nv 100 no cambia nada</b> — Kanto y Johto enteras entregan al
        pokémon en el nivel en que estaba caído. Por encima manda el tope: un Torterra derribado en
        una cacería de 3.500 entra en el <b>Nv 100</b>, y un Turtwig, en el <b>Nv 20</b>.</p>
        <p>La <b>evolución de las especies nacionales</b> sigue la misma escalera: cuando el
        destino vive en una cacería por encima del Nv 100, el eslabón pide el <b>tope del
        destino</b> (40 o 100), no el nivel de la cacería donde aparece. Capturar en el 20,
        entrenar hasta 40, evolucionar; entrenar hasta 100, evolucionar de nuevo. <b>Las variantes
        de Outland (#2001+) no entran aquí — no evolucionan</b> (ver capítulo Evolución).</p>

        ${nota(`Cada ficha de la Pokédex tiene la línea <b>Nivel al capturar</b>, y el panel de
        caídos muestra el "→ Nv" antes de que gastes la bola. El pokémon sigue valiendo lo que
        vale — solo llega para ser entrenado, no terminado.`, 'dica')}

        <h4>Qué la aumenta</h4>
        <ul>
          <li><b>Capture Boost</b> (Tienda) — <b>duplica</b> la probabilidad por lanzamiento,
          respetando el tope de ${P(c.d.captura?.teto ?? 0.1, c.lang)}.</li>
          <li><b>Bono en Kick</b> — +${D(c.d.eu?.kick?.pct ?? PCT_KICK, 'es')}% por hora canjeada con
          puntos del canal, multiplicando con el boost de la Tienda (ver
          <a data-cap="bonusLive">Bonos de directo</a>).</li>
          <li><b>Una bola mejor</b> — la Poké Ball es la más barata <i>por lanzamiento</i>, pero la
          Ultra y la Beast gastan menos tiempo.</li>
        </ul>
        ${nota(`El legendario de la <a data-cap="mistico">Arena Mística</a> no sigue esta fórmula:
        ahí la probabilidad es una tabla por ball, igual para todos, y el intento es uno solo.`)}

        <h4>Automatización</h4>
        <p>Las opciones <b>Lanzar hasta Capturar</b> y <b>Lanzar sin Parar</b> lanzan solas a los cuerpos
        caídos, respetando un intervalo de 1,2 s — la primera se detiene en la captura, la segunda no.
        Son un <b>beneficio VIP</b> — ver
        <a data-cap="automacoes">Automatizaciones</a>.</p>`,
      };
    },
  },

  // -------------------------------------------------------------- 9. morte
  {
    id: 'morte',
    titulo: { pt: 'Desmaiar e curar', en: 'Fainting and healing', es: 'Debilitarse y curar' },
    grupo: 'luta',
    html: (c) => ({
      pt: `
        <h4>Quando UM pokémon cai</h4>
        <ol class="wk-passos">
          <li>Se a automação de <b>Revive</b> estiver ligada e você tiver o item, ele levanta — com
          <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% do HP</b> no Revive comum e com tudo no Max Revive (e a automação de poção
          completa em seguida, se estiver ligada).</li>
          <li>Senão, o <b>próximo da equipe que estiver de pé</b> entra no lugar,
          automaticamente.</li>
        </ol>

        <h4>Quando o TIME INTEIRO cai</h4>
        <p>A hunt é suspensa e você aparece na praça do <b>Centro Pokémon</b> — uma área comum,
        com os outros jogadores andando por lá (WASD para andar). A <b>Enfermeira Joy</b> cura a
        equipe inteira de graça, quantas vezes for preciso. A cura devolve o HP, mas <b>não</b> zera
        a recarga dos golpes (ver <a data-cap="combate">Combate</a>).</p>
        <p><b>Curar não tira você de lá.</b> Sair é escolher outra área no Mapa — a hunt em que
        você estava fica guardada.</p>
        ${nota(`<b>Desmaiar contra selvagens custa ${Math.round((c.d.economia?.xpPerdidoPct ?? 10))}% do XP do nível atual</b> do treinador
        (com o <a data-cap="atrasados">Boost dos Atrasados</a> ligado não custa nada — nem
        desmaiar, nem desistir do combate). O custo extra é o tempo: a volta ao Centro, a cura e o
        caminho de novo. No <a data-cap="pvp">PvP Ranqueado</a> é diferente: perder <b>não</b>
        cobra XP — o que se perde ali é <b>PR</b>.`)}

        <h4>Fechar a aba ou cair a internet no meio da luta</h4>
        <p>Não derruba o time. O servidor segura você por <b>90 segundos</b>: voltando dentro desse
        tempo, você continua exatamente onde estava, na mesma hunt e com a equipe como estava. Passado
        isso, a hunt fica guardada e a equipe fica como estava, de pé — no próximo login você entra no
        Centro Pokémon, sem nocaute e sem perder XP.</p>
        <p>A exceção são as arenas <b>pagas</b>: no <b>boss</b> e na <b>Arena Mística</b>, se você não
        voltar dentro dos 90 segundos, a luta se perde — e a entrada não volta.</p>
        <p>Para sair limpo há o botão <b>Ir para o Centro Pokémon</b> no canto do palco. Ele
        trava por <b>3 segundos</b> a cada dano trocado.</p>

        <h4>Os itens</h4>
        <ul>
          <li><b>Revive</b> — levanta um pokémon desmaiado com <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}%</b> do HP: ele tira o
          bicho do chão, e a poção recompõe a barra depois. O <b>Max Revive</b> levanta com o HP
          inteiro.</li>
          <li><b>Poções</b> — as do Market curam um valor <b>fixo</b> de HP, da mais barata à mais cara;
          a <b>Golden Potion</b> é a única que cura por <b>porcentagem</b> do HP máximo, e por isso é a
          que acompanha um pokémon de nível alto.</li>
        </ul>
        ${tabelaDeCuras(c)}
        <p>Poções e revives se compram no <a data-cap="market">Market</a>, em quantidade
        ilimitada e a preço fixo.</p>

        <h4>Escape Rope</h4>
        <p>Sair de uma hunt pelo botão <b>Ir para o Centro Pokémon</b> exige <b>3 segundos</b> sem
        trocar dano — a trava existe para ninguém sumir da luta no instante do golpe fatal. A
        <b>Escape Rope</b> é o atalho pago para essa mesma saída: <b>1 💎</b> na
        <a data-cap="loja">Loja</a>, e ela te leva ao Centro <b>na hora</b>, sem espera.</p>
        <ul>
          <li>O botão fica <b>ao lado</b> do de subir ao Centro, com a quantidade que você tem.
          Sem nenhuma, ele aparece apagado.</li>
          <li>É <b>consumida</b> ao usar e <b>não</b> pode ser vendida no Mercado da Comunidade.</li>
        </ul>
`,
      en: `
        <h4>When ONE pokémon falls</h4>
        <ol class="wk-passos">
          <li>If the <b>Revive</b> automation is on and you own the item, it gets up — with
          <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% HP</b> on a regular Revive and fully on a Max Revive (and the potion
          automation tops it off right after, if enabled).</li>
          <li>Otherwise, the <b>next team member still standing</b> steps in automatically.</li>
        </ol>

        <h4>When the WHOLE TEAM falls</h4>
        <p>The hunt is suspended and you appear in the <b>Pokémon Center</b> square — a shared
        area, with other players walking around (WASD to move). <b>Nurse Joy</b> heals the whole
        team for free, as many times as needed. Healing restores HP but does <b>not</b> reset move
        cooldowns (see <a data-cap="combate">Combat</a>).</p>
        <p><b>Healing does not take you out.</b> Leaving means picking another area on the Map —
        the hunt you were in is remembered.</p>
        ${nota(`<b>Fainting against wilds costs ${Math.round((c.d.economia?.xpPerdidoPct ?? 10))}% of your current level's trainer XP</b>
        (with the <a data-cap="atrasados">Late Joiner Boost</a> on it costs nothing —
        neither fainting nor giving up a battle). The extra cost is time: the trip back, the heal and
        the walk out again. <a data-cap="pvp">Ranked PvP</a> is different: losing costs <b>no</b>
        XP — what you lose there is <b>PR</b>.`)}

        <h4>Closing the tab or losing connection mid-fight</h4>
        <p>It does not knock your team down. The server holds you for <b>90 seconds</b>: come back
        within that time and you carry on exactly where you were, in the same hunt and with the team
        as it was. After that, the hunt stays saved and the team stays as it was, standing — on your
        next login you enter the Pokémon Center, with no knockout and no XP lost.</p>
        <p>The exception is the <b>paid</b> arenas: in a <b>boss</b> fight or the <b>Mystic Arena</b>,
        if you do not come back within the 90 seconds the fight is lost — and the entry is not refunded.</p>
        <p>To leave cleanly there is the <b>Go to the Pokémon Center</b> button at the corner of
        the stage. It locks for <b>3 seconds</b> on every point of damage traded.</p>

        <h4>The items</h4>
        <ul>
          <li><b>Revive</b> — brings a fainted pokémon back at <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}%</b> HP: it gets the
          pokémon off the ground, and a potion refills the bar afterwards. The <b>Max Revive</b> brings
          it back at full HP.</li>
          <li><b>Potions</b> — the Market ones heal a <b>fixed</b> amount of HP, from the cheapest to the
          priciest; the <b>Golden Potion</b> is the only one that heals a <b>percentage</b> of max HP,
          which is why it keeps up with a high-level pokémon.</li>
        </ul>
        ${tabelaDeCuras(c)}
        <p>Potions and revives are bought at the <a data-cap="market">Market</a>, unlimited and at
        a fixed price.</p>

        <h4>Escape Rope</h4>
        <p>Leaving a hunt through the <b>Go to the Pokémon Center</b> button needs <b>3 seconds</b>
        without trading damage — the lock exists so nobody vanishes from a fight on the frame of
        the killing blow. The <b>Escape Rope</b> is the paid shortcut for that same exit:
        <b>1 💎</b> in the <a data-cap="loja">Shop</a>, and it takes you to the Center
        <b>instantly</b>, with no wait.</p>
        <ul>
          <li>The button sits <b>next to</b> the Center one, showing how many you own. With none
          left it shows greyed out.</li>
          <li>It is <b>consumed</b> on use and <b>cannot</b> be sold on the Community Market.</li>
        </ul>
`,
      es: `
        <h4>Cuando cae UN pokémon</h4>
        <ol class="wk-passos">
          <li>Si la automatización de <b>Revivir</b> está activa y tienes el objeto, se levanta — con
          el <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% del HP</b> en el Revive común y con todo en el Max Revive (y la
          automatización de pociones lo completa después, si está activa).</li>
          <li>Si no, entra automáticamente el <b>siguiente del equipo que siga en pie</b>.</li>
        </ol>

        <h4>Cuando cae el EQUIPO ENTERO</h4>
        <p>La cacería se suspende y apareces en la plaza del <b>Centro Pokémon</b> — una zona
        común, con otros jugadores caminando por allí (WASD para moverte). La <b>Enfermera Joy</b>
        cura al equipo entero gratis, tantas veces como haga falta. La cura devuelve el HP, pero
        <b>no</b> reinicia la recarga de los golpes (ver <a data-cap="combate">Combate</a>).</p>
        <p><b>Curar no te saca de allí.</b> Salir es elegir otra zona en el Mapa — la cacería en la
        que estabas queda guardada.</p>
        ${nota(`<b>Debilitarse contra salvajes cuesta el ${Math.round((c.d.economia?.xpPerdidoPct ?? 10))}% del XP del nivel actual</b> del entrenador
        (con el <a data-cap="atrasados">Boost de los Rezagados</a> activo
        no cuesta nada — ni debilitarse ni rendirse en un combate). El coste extra es el tiempo: la vuelta
        al Centro, la cura y el camino de nuevo. En el <a data-cap="pvp">PvP Clasificatorio</a> es
        distinto: perder <b>no</b> cuesta XP — allí lo que se pierde es <b>PR</b>.`)}

        <h4>Cerrar la pestaña o perder la conexión en plena pelea</h4>
        <p>No derriba al equipo. El servidor te espera <b>90 segundos</b>: si vuelves dentro de ese
        tiempo, sigues exactamente donde estabas, en la misma cacería y con el equipo como estaba.
        Pasado eso, la cacería queda guardada y el equipo queda como estaba, en pie — en el próximo
        login entras al Centro Pokémon, sin nocaut y sin perder XP.</p>
        <p>La excepción son las arenas <b>pagadas</b>: en un <b>boss</b> o en la <b>Arena Mística</b>,
        si no vuelves dentro de los 90 segundos la pelea se pierde — y la entrada no se devuelve.</p>
        <p>Para salir limpio está el botón <b>Ir al Centro Pokémon</b> en la esquina del escenario.
        Se bloquea <b>3 segundos</b> con cada daño intercambiado.</p>

        <h4>Los objetos</h4>
        <ul>
          <li><b>Revivir</b> — levanta a un pokémon debilitado con el <b>${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}%</b> del HP: lo
          saca del suelo, y la poción rellena la barra después. El <b>Max Revive</b> lo levanta con el HP
          completo.</li>
          <li><b>Pociones</b> — las del Market curan un valor <b>fijo</b> de HP, de la más barata a la
          más cara; la <b>Golden Potion</b> es la única que cura un <b>porcentaje</b> del HP máximo, y
          por eso es la que acompaña a un pokémon de nivel alto.</li>
        </ul>
        ${tabelaDeCuras(c)}
        <p>Pociones y revivires se compran en el <a data-cap="market">Market</a>, en cantidad
        ilimitada y a precio fijo.</p>

        <h4>Escape Rope</h4>
        <p>Salir de una hunt con el botón <b>Ir al Centro Pokémon</b> exige <b>3 segundos</b> sin
        intercambiar daño — el candado existe para que nadie desaparezca de la pelea justo en el
        golpe final. La <b>Escape Rope</b> es el atajo de pago para esa misma salida: <b>1 💎</b>
        en la <a data-cap="loja">Tienda</a>, y te lleva al Centro <b>al instante</b>, sin
        espera.</p>
        <ul>
          <li>El botón está <b>al lado</b> del de subir al Centro, con la cantidad que tienes. Sin
          ninguna, aparece apagado.</li>
          <li>Se <b>consume</b> al usarla y <b>no</b> se puede vender en el Mercado de la
          Comunidad.</li>
        </ul>
`,
    }),
  },

  // -------------------------------------------------------- 10. automações
  {
    id: 'automacoes',
    titulo: { pt: 'Automações', en: 'Automation', es: 'Automatizaciones' },
    grupo: 'luta',
    html: () => ({
      pt: `
        <p>Ficam na coluna da direita e valem enquanto a aba estiver aberta.</p>
        ${nota(`<b>Usar Revive</b>, <b>Usar Poções</b> e <b>Voltar à hunt</b> já vêm
        <b>ligadas</b>, com todas as poções e revives da loja já marcados — da mais barata para
        a mais cara. Você não precisa configurar nada para a hunt não parar; se quiser o
        contrário, é só desligar, e aí fica desligado.`)}

        <h4><span class="selo-vip">VIP</span> Lançar até Capturar · Lançar sem Parar</h4>
        <p>Arremessam sozinhos nos <b>corpos caídos</b>, um por corpo, respeitando 1,2 s entre
        arremessos. Escolha <b>quais bolas</b> podem ser gastas clicando nos ícones — a
        automação usa a primeira da lista que ainda tiver estoque. São dois interruptores, e ligar um
        desliga o outro:</p>
        <ul>
          <li><b>Lançar até Capturar</b> — para na <b>primeira captura</b>, e também quando acabam as bolas
          escolhidas. Bom para caçar uma espécie e não gastar bola depois dela.</li>
          <li><b>Lançar sem Parar</b> — segue arremessando captura após captura. Se as bolas acabam, ele
          <b>continua ligado</b>: só não arremessa, e recomeça sozinho quando o estoque volta (compra na
          Loja, no Market ou no Mercado) — sem precisar marcar a caixa de novo.</li>
        </ul>
        ${nota(`Este recurso é <b>exclusivo de VIP</b>. Sem assinatura o interruptor abre o
        convite para a <a data-cap="loja">Loja</a>, e assim que o VIP vence a automação para
        sozinha (a sua escolha de bolas fica guardada).`, 'aviso')}

        <h4>Usar Revive ao desmaiar</h4>
        <p>Levanta o pokémon ativo — com ${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% do HP no Revive comum, com tudo no Max Revive — em
        vez de trocar por outro da equipe. Clique nos
        ícones para escolher <b>quais revives</b> gastar; a <b>ordem dos cliques é a ordem de
        gasto</b>. A automação <b>para</b> quando acaba tudo o que está marcado — ela não gasta o
        que você não pediu —, e por isso a conta já nasce com todos marcados. Nada escolhido =
        qualquer um, mas aí do mais <b>caro</b> para o mais barato.</p>

        <h4>Usar Poções</h4>
        <p>Mesma ideia, com as poções — e mais uma escolha: <b>a partir de que altura da vida</b>
        a poção entra. Um <b>slider de 10% a 100%</b>, de 10 em 10 (10%, 20%, 30%… até 100%).</p>
        ${tabela(
          ['Limiar', 'Para quem'],
          `<tr><td class="wk-num">10–20%</td><td>economiza poção e aceita chegar perto do nocaute</td></tr>
           <tr><td class="wk-num">30%</td><td>o meio-termo (padrão)</td></tr>
           <tr><td class="wk-num">50–100%</td><td>hunt acima do seu nível, onde um golpe tira muita vida</td></tr>`,
        )}
        <p>Um item escolhido que <b>acabou</b> continua na fila, apagado: a preferência é sua e
        não some porque o estoque zerou no meio de uma hunt.</p>

        <h4>Voltar à hunt ao morrer/reset</h4>
        <p>Se o time inteiro cair, a Enfermeira cura e a automação <b>devolve você à mesma hunt</b>
        alguns segundos depois — é o que deixa farmar de madrugada sem acordar para clicar.</p>
        <ul>
          <li><b>Só dispara com poção ou revive na mochila.</b> Sem itens ela <b>pausa</b> e avisa no
          log e em toast, em vez de devolver você à hunt que acabou de matar seu time. Sem essa
          trava, ficar sem item de madrugada vira um laço de mortes — e cada volta cobra a
          <a data-cap="morte">perda de XP do nocaute</a>, até o seu nível cair <b>abaixo do
          mínimo dos seus próprios pokémon</b>.</li>
          <li>O interruptor <b>continua ligado</b> quando ela pausa: você não desligou nada, só
          ficou sem item. Comprar uma poção e voltar à hunt na mão já rearma tudo.</li>
          <li><b>Desistir não conta.</b> Sair da hunt pelo botão de desistência é uma decisão sua,
          não uma derrota — a automação não é acionada.</li>
        </ul>

        <h4>Automação de fora do jogo</h4>
        <p>Os <b>Termos de Uso</b> permitem automações, no jogo e no
        <a data-cap="comunidade">Mercado</a> — inclusive a <b>extensão de automação do PokéIdle</b>,
        que está no nosso Discord, no canal <b>#how-to-play</b>.</p>
        <ul>
          <li>As regras de conduta valem para todo mundo, jogando na mão ou com automação.</li>
          <li>O servidor segura rajadas de ações por segundo <b>por conta</b>, e o sorteio da
          liberação do Mercado vale igual para os dois: ser mais rápido não dá vantagem.</li>
          <li>Continua proibido usar falha do jogo para conseguir Gemas por fora da compra
          oficial.</li>
        </ul>`,
      en: `
        <p>They live in the right-hand column and run while the tab is open.</p>
        ${nota(`<b>Use Revive</b>, <b>Use Potions</b> and <b>Back to the hunt</b> come
        <b>already on</b>, with every shop potion and revive already ticked — cheapest first.
        You do not have to set anything up for the hunt to keep going; if you want the
        opposite, just switch it off and it stays off.`)}

        <h4><span class="selo-vip">VIP</span> Throw until Catch · Throw Nonstop</h4>
        <p>They throw on their own at <b>fallen bodies</b>, one per body, with 1.2 s between throws.
        Pick <b>which balls</b> may be spent by clicking the icons — the automation uses the first one
        on the list that still has stock. There are two switches, and turning one on turns the other
        off:</p>
        <ul>
          <li><b>Throw until Catch</b> — stops at the <b>first catch</b>, and also when the chosen balls run
          out. Good for hunting one species without spending balls after it.</li>
          <li><b>Throw Nonstop</b> — keeps throwing catch after catch. If the balls run out it <b>stays
          on</b>: it just doesn't throw, and starts again by itself when stock comes back (bought in the
          Shop, the Market or the Community Market) — no need to tick the box again.</li>
        </ul>
        ${nota(`This feature is <b>VIP-only</b>. Without a subscription the switch opens an
        invitation to the <a data-cap="loja">Shop</a>, and the moment VIP expires the automation
        stops by itself (your ball choice is kept).`, 'aviso')}

        <h4>Use Revive on faint</h4>
        <p>Brings the active pokémon back — at ${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% HP with a regular Revive, at full HP with a
        Max Revive — instead of swapping to another team member.
        Click the icons to choose <b>which revives</b> to spend; the <b>click order is the spend
        order</b>. Nothing chosen = any of them.</p>

        <h4>Use Potions</h4>
        <p>Same idea with potions — plus one more choice: <b>at what health</b> the potion
        kicks in. A <b>slider from 10% to 100%</b>, in steps of 10 (10%, 20%, 30%… up to 100%).</p>
        ${tabela(
          ['Threshold', 'For whom'],
          `<tr><td class="wk-num">10–20%</td><td>saves potions and accepts flirting with a knockout</td></tr>
           <tr><td class="wk-num">30%</td><td>the middle ground (default)</td></tr>
           <tr><td class="wk-num">50–100%</td><td>hunts above your level, where one hit takes a big chunk of health</td></tr>`,
        )}
        <p>A chosen item that has <b>run out</b> stays in the queue, dimmed: the preference is
        yours and does not vanish because stock hit zero mid-hunt.</p>

        <h4>Return to hunt on death/reset</h4>
        <p>If your whole team goes down, the Nurse heals you and the automation <b>puts you back
        in the same hunt</b> a few seconds later — that is what lets you farm overnight without
        waking up to click.</p>
        <ul>
          <li><b>It only fires with a potion or a revive in the backpack.</b> With no items it
          <b>pauses</b> and warns you in the log and in a toast, instead of sending you back to
          the hunt that just wiped your team. Without that lock, running out of items overnight
          becomes a death loop — and every trip back charges the
          <a data-cap="morte">knockout XP loss</a>, until your level drops <b>below the minimum
          your own pokémon require</b>.</li>
          <li>The switch <b>stays on</b> when it pauses: you did not turn anything off, you just
          ran out. Buying a potion and re-entering the hunt by hand rearms it.</li>
          <li><b>Surrendering does not count.</b> Leaving a hunt through the give-up button is
          your decision, not a defeat — the automation does not run.</li>
        </ul>

        <h4>Automation from outside the game</h4>
        <p>The <b>Terms of Use</b> allow automation, in the game and on the
        <a data-cap="comunidade">Market</a> — including the <b>PokéIdle automation extension</b>,
        available on our Discord, in the <b>#how-to-play</b> channel.</p>
        <ul>
          <li>The conduct rules apply to everyone, playing by hand or with automation.</li>
          <li>The server caps bursts of actions per second <b>per account</b>, and the Market
          release draw treats both the same: being faster gives no edge.</li>
          <li>Using a game flaw to get Gems outside the official purchase is still forbidden.</li>
        </ul>`,
      es: `
        <p>Están en la columna de la derecha y funcionan mientras la pestaña esté abierta.</p>
        ${nota(`<b>Usar Revive</b>, <b>Usar Pociones</b> y <b>Volver a la hunt</b> ya vienen
        <b>activadas</b>, con todas las pociones y revives de la tienda ya marcados — de la más
        barata a la más cara. No hace falta configurar nada para que la hunt no se detenga; si
        quieres lo contrario, basta con apagarlo, y se queda apagado.`)}

        <h4><span class="selo-vip">VIP</span> Lanzar hasta Capturar · Lanzar sin Parar</h4>
        <p>Lanzan solos a los <b>cuerpos caídos</b>, uno por cuerpo, respetando 1,2 s entre
        lanzamientos. Elige <b>qué bolas</b> se pueden gastar haciendo clic en los iconos — la
        automatización usa la primera de la lista que aún tenga existencias. Son dos interruptores, y
        encender uno apaga el otro:</p>
        <ul>
          <li><b>Lanzar hasta Capturar</b> — se detiene en la <b>primera captura</b>, y también cuando se
          acaban las bolas elegidas. Bueno para cazar una especie sin gastar bolas después.</li>
          <li><b>Lanzar sin Parar</b> — sigue lanzando captura tras captura. Si se acaban las bolas,
          <b>sigue encendido</b>: solo no lanza, y vuelve a empezar solo cuando regresa el stock (compra en
          la Tienda, el Market o el Mercado) — sin tener que marcar la casilla de nuevo.</li>
        </ul>
        ${nota(`Esta función es <b>exclusiva de VIP</b>. Sin suscripción el interruptor abre la
        invitación a la <a data-cap="loja">Tienda</a>, y en cuanto el VIP vence la automatización
        se detiene sola (tu elección de bolas queda guardada).`, 'aviso')}

        <h4>Usar Revivir al debilitarse</h4>
        <p>Levanta al pokémon activo — con el ${Math.round((AJUSTE_REVIVE_PCT.get(REVIVE_ID) ?? 0.1) * 100)}% del HP en el Revive común, con todo en el
        Max Revive — en vez de cambiarlo por otro del equipo. Haz
        clic en los iconos para elegir <b>qué revivires</b> gastar; el <b>orden de los clics es el
        orden de gasto</b>. Nada elegido = cualquiera.</p>

        <h4>Usar Pociones</h4>
        <p>La misma idea, con las pociones — y una elección más: <b>a partir de qué nivel de
        vida</b> entra la poción. Un <b>deslizador de 10% a 100%</b>, de 10 en 10 (10%, 20%, 30%…
        hasta 100%).</p>
        ${tabela(
          ['Umbral', 'Para quién'],
          `<tr><td class="wk-num">10–20%</td><td>ahorra pociones y acepta rozar el nocaut</td></tr>
           <tr><td class="wk-num">30%</td><td>el término medio (por defecto)</td></tr>
           <tr><td class="wk-num">50–100%</td><td>cacerías por encima de tu nivel, donde un golpe quita mucha vida</td></tr>`,
        )}
        <p>Un objeto elegido que se <b>agotó</b> sigue en la cola, apagado: la preferencia es tuya y
        no desaparece porque el stock llegó a cero en plena cacería.</p>

        <h4>Volver a la hunt al morir/reset</h4>
        <p>Si todo el equipo cae, la Enfermera cura y la automatización <b>te devuelve a la misma
        cacería</b> unos segundos después — es lo que permite farmear de madrugada sin despertarse
        para hacer clic.</p>
        <ul>
          <li><b>Solo se activa con poción o revivir en la mochila.</b> Sin objetos se
          <b>pausa</b> y avisa en el registro y en un aviso, en vez de devolverte a la cacería que
          acaba de matar a tu equipo. Sin esa traba, quedarse sin objetos de madrugada se vuelve
          un bucle de muertes — y cada vuelta cobra la <a data-cap="morte">pérdida de XP del
          nocaut</a>, hasta que tu nivel caiga <b>por debajo del mínimo de tus propios
          pokémon</b>.</li>
          <li>El interruptor <b>sigue encendido</b> cuando se pausa: no apagaste nada, solo te
          quedaste sin objetos. Comprar una poción y volver a la cacería a mano lo rearma.</li>
          <li><b>Rendirse no cuenta.</b> Salir de una cacería por el botón de rendición es una
          decisión tuya, no una derrota — la automatización no se activa.</li>
        </ul>

        <h4>Automatización de fuera del juego</h4>
        <p>Los <b>Términos de Uso</b> permiten automatizaciones, en el juego y en el
        <a data-cap="comunidade">Mercado</a> — incluida la <b>extensión de automatización de
        PokéIdle</b>, que está en nuestro Discord, en el canal <b>#how-to-play</b>.</p>
        <ul>
          <li>Las reglas de conducta valen para todos, jugando a mano o con automatización.</li>
          <li>El servidor frena las ráfagas de acciones por segundo <b>por cuenta</b>, y el sorteo
          de la liberación del Mercado vale igual para los dos: ser más rápido no da ventaja.</li>
          <li>Sigue prohibido usar un fallo del juego para conseguir Gemas por fuera de la compra
          oficial.</li>
        </ul>`,
    }),
  },

  // ---------------------------------------------------------- 12. mapa / analyser
  {
    id: 'mapa',
    titulo: { pt: 'Mapa e Hunt Analyser', en: 'Map and Hunt Analyser', es: 'Mapa y Hunt Analyser' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>O <b>Mapa</b> é onde você escolhe a hunt. Cada marcador mostra o nível recomendado da
        área; trancadas ficam cinza até o seu treinador alcançar o nível.</p>

        <h4>Regiões e nível do treinador</h4>
        <p>Cada região do Mapa (o seletor <b>Região</b>, no alto) pede um <b>nível mínimo do
        treinador</b> (não do pokémon); a lista mostra o nível de cada uma, o cadeado nas que ainda
        não abriram e quantas das áreas dela você já capturou. Kanto e Johto dividem a mesma
        ilustração; Hoenn, Sinnoh, Unova e Kalos têm a sua; e a região
        <b>${ULTIMA_REGIAO.rotulo.pt}</b> reúne as gerações 7, 8 e 9 — os pokémon de Galar e Paldea
        moram lá. A <b>Outland</b> fica fora da ordem das gerações: é o mapa das variantes e dos
        drops raros (ver <a data-cap="combate">Combate</a>).</p>
        ${tabelaDeRegioes(c)}

        <h4>Ícones dos marcadores</h4>
        <p>Cada hunt mostra o retrato da espécie principal num círculo. O atlas de marcadores
        cobre centenas de looktypes publicados; se faltar algum, o jogo desenha o sprite do
        outfit na hora.</p>

        <h4>Hunt Analyser</h4>
        <p>Com o Mapa aberto, passe o mouse (ou toque) num marcador liberado: no canto superior
        direito aparece o <b>Hunt Analyser</b> — uma estimativa daquela área para a sua conta
        <b>agora</b>, com os boosts ativos. No computador ela some quando o mouse sai do
        marcador; no celular, feche pelo <b>×</b> do cabeçalho da ficha e toque em outra área — e o
        próprio cabeçalho (<b>Ver na Pokédex</b>) abre a ficha da espécie daquela hunt.</p>
        <ul>
          <li><b>XP treinador / hora</b> e <b>XP pokémon / hora</b></li>
          <li><b>Ouro / hora</b> (pelo <code>experience</code> das espécies que spawnam lá)</li>
          <li><b>Forte contra</b> — tipos que você bate com ×2 na hunt (já amplificado)</li>
          <li><b>Fraco contra</b> — tipos com ×0,5 ou imunidade</li>
        </ul>
        ${nota(`São estimativas, não promessas: spawn aleatório, tempo andando até o alvo e
        desmaios mudam o resultado real. Serve para comparar duas hunts, não para prever a
        próxima hora ao minuto.`, 'dica')}

        <h4>Filtros</h4>
        <p>A barra do Mapa é uma fileira só: o seletor <b>Região</b> (de Kanto a
        ${ULTIMA_REGIAO.rotulo.pt}), três filtros em menus e a busca pelo nome da área. No
        celular, os três filtros moram atrás do botão <b>Filtros</b>.</p>
        <ul>
          <li><b>Tipo</b> — um ou mais tipos. Com um tipo marcado, o próprio menu oferece
          <b>Fraco contra</b> (as hunts cujos selvagens levam ×2 ou mais de um golpe desse tipo)
          e <b>Forte contra</b> (as que resistem a ele: ×0,5 ou menos).</li>
          <li><b>Pokédex</b> — Todos · Capturados · Não capturados: separa as hunts cuja espécie
          você já tem — as do anel dourado, "já capturado" — das que faltam.</li>
          <li><b>Nível</b> — a faixa de nível da área e <b>só as áreas liberadas</b>, útil quando
          você sobe de nível e quer ver o que abriu.</li>
        </ul>

        <h4>Modo Lista</h4>
        <p>A chave <b>Mapa | Lista</b>, ao lado da busca, troca o mapa por uma <b>lista</b> com as
        mesmas áreas — os mesmos filtros e a mesma contagem do rodapé —, em linhas largas, mais
        fáceis de achar e de clicar (e sem esperar a imagem do mapa carregar). Cada linha mostra o
        pokémon, o nível da área, os tipos e o ✓ dourado de "já capturado"; a área onde você caça
        fica em roxo, e as que o seu nível ainda não alcança, em cinza com o cadeado. Os títulos
        <b>Pokémon</b>, <b>Nível</b> e <b>Tipo</b> ordenam a lista (clique de novo para inverter).
        No computador, passar o mouse mostra o Hunt Analyser numa coluna ao lado, e o clique troca
        de área; no celular, o toque abre a ficha com <b>Caçar aqui</b>. O jogo lembra a sua escolha
        neste aparelho.</p>

        <h4>Trocar de área: ${SEG_REENTRADA_HUNT} segundos</h4>
        <p>Entrar numa área pelo Mapa monta o campo com a onda cheia. Por isso existem duas esperas,
        as duas de <b>${SEG_REENTRADA_HUNT} s</b>:</p>
        <ul>
          <li>depois de entrar numa área, você só escolhe outra (ou a mesma) ${SEG_REENTRADA_HUNT} s
          depois — o aviso diz quanto falta;</li>
          <li>quem chega a uma área até ${SEG_REENTRADA_HUNT} s depois de trocar dano — vindo de outra
          hunt ou do Centro — a encontra <b>vazia</b> até completar o tempo.</li>
        </ul>
        <p>A onda normal volta em menos de 3 s, então sair e entrar de novo para ganhar uma onda cheia
        nunca compensa. A volta automática depois de um nocaute não paga essa espera.</p>

        <h4>A Sessão (a prancheta)</h4>
        <p>Durante a hunt, o painel <b>Sessão</b> soma o que aconteceu desde o último <b>Reset</b>, em
        quatro seções: <b>Treinador</b> (tempo, XP do treinador e do pokémon, Gold, abates e
        capturas, cada um também por hora), <b>Shiny</b> (vistos e capturados), <b>Drops raros</b>
        (Boss Token, fragmentos de Chave, Shiny Stone, Bicicleta e Mega, peças de TM, Mystic Ticket, Safari
        Ticket e Fragmento de Ovo Shiny) e <b>Custos</b> — as bolas, poções e revives que a automação gastou, ao
        preço do Market, com o <b>Gold gasto</b> e o <b>Lucro líquido</b>, também por hora.</p>
        <ul>
          <li><b>Shiny e Drops raros mostram só o que pode cair onde você está</b>: na hunt, o shiny; de
          Unova para frente, também o Fragmento de Ovo Shiny; na Outland, os quatro drops dela e nenhum
          shiny (lá ele não rola); no boss, os fragmentos de Mega, as peças de TM, o Mystic Ticket e o Safari
          Ticket; na
          Arena Mística, o shiny. O que já caiu nesta sessão continua na conta quando você muda de lugar.</li>
          <li>Os <b>Boss Tokens</b> gastos na entrada do boss — também na repetição automática — aparecem nos
          Custos, contados à parte: o token não tem preço de NPC (só se negocia no Mercado), então fica
          fora do Gold gasto.</li>
        </ul>
        <p>Os números são deste navegador e sobrevivem a recarregar a página. <b>Copiar</b> leva um
        resumo de uma linha — ⏱️ tempo, 🎮 XP/h, 🪙 Gold/h e 💫 shinies vistos e capturados —, para
        colar no chat.</p>`,
      en: `
        <p>The <b>Map</b> is where you pick a hunt. Each marker shows the area's recommended level;
        locked ones stay grey until your trainer reaches it.</p>

        <h4>Regions and trainer level</h4>
        <p>Each Map region (the <b>Region</b> selector at the top) requires a minimum <b>trainer
        level</b> (not the pokémon's); the list shows each one's level, a padlock on the ones not
        open yet and how many of its areas you have already caught. Kanto and Johto share one
        illustration; Hoenn, Sinnoh, Unova and Kalos have their own; and the
        <b>${ULTIMA_REGIAO.rotulo.en}</b> region gathers generations 7, 8 and 9 — Galar and Paldea
        pokémon live there. <b>Outland</b> sits outside the generation order: it is the map of
        variants and rare drops (see <a data-cap="combate">Combat</a>).</p>
        ${tabelaDeRegioes(c)}

        <h4>Marker icons</h4>
        <p>Each hunt shows the main species portrait in a circle. The marker atlas covers hundreds
        of published looktypes; if one is missing, the client draws the outfit sprite on the fly.</p>

        <h4>Hunt Analyser</h4>
        <p>With the Map open, hover (or tap) an unlocked marker: the <b>Hunt Analyser</b> panel
        appears in the top-right — an estimate for that area on your account <b>right now</b>,
        with active boosts included. On a computer it goes away when the mouse leaves the marker;
        on a phone, close it with the <b>×</b> in the sheet's header and tap another area — and the
        header itself (<b>View in Pokédex</b>) opens that hunt's species sheet.</p>
        <ul>
          <li><b>Trainer XP / hour</b> and <b>Pokémon XP / hour</b></li>
          <li><b>Gold / hour</b> (from species <code>experience</code> that spawn there)</li>
          <li><b>Strong against</b> — types you hit for ×2 on the hunt (already amplified)</li>
          <li><b>Weak against</b> — types at ×0.5 or immunity</li>
        </ul>
        ${nota(`These are estimates, not guarantees: random spawns, walking time and faints
        change real results. Use it to compare hunts, not to predict the next hour to the minute.`,
        'dica')}

        <h4>Filters</h4>
        <p>The Map bar is a single row: the <b>Region</b> selector (Kanto through
        ${ULTIMA_REGIAO.rotulo.en}), three filters in menus and the search by area name. On a phone,
        the three filters live behind the <b>Filters</b> button.</p>
        <ul>
          <li><b>Type</b> — one or more types. With a type ticked, the menu itself offers
          <b>Weak against</b> (the hunts whose wilds take ×2 or more from a move of that type) and
          <b>Strong against</b> (the ones that resist it: ×0.5 or less).</li>
          <li><b>Pokédex</b> — All · Caught · Not caught: splits the hunts whose species you already
          have — the ones with the golden ring, "already caught" — from the ones you are missing.</li>
          <li><b>Level</b> — the area level range and <b>unlocked areas only</b>, handy after a
          level-up to see what opened.</li>
        </ul>

        <h4>List mode</h4>
        <p>The <b>Map | List</b> switch next to the search box swaps the map for a <b>list</b> of the
        same areas — the same filters and the same count in the footer — in wide rows that are
        easier to find and click (with no wait for the map image to load). Each row shows the
        pokémon, the area level, its types and the golden ✓ for "already caught"; the area you are
        hunting in is purple, and the ones your level does not reach yet are grey with a padlock.
        The <b>Pokémon</b>, <b>Level</b> and <b>Type</b> headers sort the list (click again to
        reverse). On a computer, hovering shows the Hunt Analyser in a column beside it, and a click
        switches area; on a phone, a tap opens the sheet with <b>Hunt here</b>. The game remembers
        your choice on this device.</p>

        <h4>Switching areas: ${SEG_REENTRADA_HUNT} seconds</h4>
        <p>Entering an area from the Map builds the field with a full wave. That is why there are two
        waits, both of <b>${SEG_REENTRADA_HUNT} s</b>:</p>
        <ul>
          <li>after entering an area, you can only pick another one (or the same) ${SEG_REENTRADA_HUNT} s
          later — the notice says how long is left;</li>
          <li>whoever reaches an area within ${SEG_REENTRADA_HUNT} s of trading damage — from another
          hunt or from the Center — finds it <b>empty</b> until the time is up.</li>
        </ul>
        <p>The normal wave comes back in under 3 s, so leaving and coming back for a full wave never
        pays off. The automatic return after a knockout does not pay this wait.</p>

        <h4>The Session (the clipboard)</h4>
        <p>During the hunt, the <b>Session</b> panel adds up what happened since the last
        <b>Reset</b>, in four sections: <b>Trainer</b> (time, trainer and pokémon XP, Gold, kills and
        catches, each also per hour), <b>Shiny</b> (seen and caught), <b>Rare drops</b> (Boss Token,
        Key, Shiny Stone, Bicycle and Mega fragments, TM pieces, Mystic Ticket, Safari Ticket and Shiny Egg
        Fragment)
        and <b>Costs</b> — the balls, potions and revives the automation spent, at Market price, with
        <b>Gold spent</b> and <b>Net profit</b>, also per hour.</p>
        <ul>
          <li><b>Shiny and Rare drops only show what can drop where you are</b>: in a hunt, the shiny;
          from Unova on, the Shiny Egg Fragment too; in the Outland, its four drops and no shiny (it
          doesn't roll there); at a boss, the Mega fragments, the TM pieces, the Mystic Ticket and the Safari
          Ticket; in the
          Mystic Arena, the shiny. What already dropped this session stays in the count when you move.</li>
          <li>The <b>Boss Tokens</b> spent to enter a boss — repeat runs included — show up in Costs,
          counted apart: the token has no NPC price (it only trades on the Community Market), so it stays
          out of Gold spent.</li>
        </ul>
        <p>The numbers belong to this browser and survive a page reload. <b>Copy</b> takes a one-line
        summary — ⏱️ time, 🎮 XP/h, 🪙 Gold/h and 💫 shinies seen and caught — to paste in chat.</p>`,
      es: `
        <p>El <b>Mapa</b> es donde eliges la cacería. Cada marcador muestra el nivel recomendado;
        las bloqueadas quedan grises hasta que tu entrenador alcance ese nivel.</p>

        <h4>Regiones y nivel del entrenador</h4>
        <p>Cada región del Mapa (el selector <b>Región</b>, arriba) exige un <b>nivel mínimo del
        entrenador</b> (no del pokémon); la lista muestra el nivel de cada una, el candado en las que
        aún no se abrieron y cuántas de sus zonas ya capturaste. Kanto y Johto comparten la misma
        ilustración; Hoenn, Sinnoh, Unova y Kalos tienen la suya; y la región
        <b>${ULTIMA_REGIAO.rotulo.es}</b> reúne las generaciones 7, 8 y 9 — los pokémon
        de Galar y Paldea viven allí. <b>Outland</b> queda fuera del orden de las generaciones: es
        el mapa de las variantes y de los drops raros (ver <a data-cap="combate">Combate</a>).</p>
        ${tabelaDeRegioes(c)}

        <h4>Iconos de los marcadores</h4>
        <p>Cada cacería muestra el retrato de la especie principal en un círculo. El atlas cubre
        cientos de looktypes publicados; si falta alguno, el cliente dibuja el sprite del outfit
        al vuelo.</p>

        <h4>Hunt Analyser</h4>
        <p>Con el Mapa abierto, pasa el ratón (o toca) un marcador desbloqueado: en la esquina
        superior derecha aparece el <b>Hunt Analyser</b> — una estimación de esa zona para tu
        cuenta <b>ahora</b>, con los boosts activos. En el ordenador desaparece cuando el ratón
        sale del marcador; en el móvil, ciérrala con la <b>×</b> de la cabecera de la ficha y toca
        otra zona — y la propia cabecera (<b>Ver en la Pokédex</b>) abre la ficha de la especie de esa
        cacería.</p>
        <ul>
          <li><b>XP entrenador / hora</b> y <b>XP pokémon / hora</b></li>
          <li><b>Oro / hora</b> (por el <code>experience</code> de las especies que aparecen)</li>
          <li><b>Fuerte contra</b> — tipos que pegas con ×2 en la cacería (ya amplificado)</li>
          <li><b>Débil contra</b> — tipos con ×0,5 o inmunidad</li>
        </ul>
        ${nota(`Son estimaciones, no promesas: el spawn es aleatorio, el tiempo caminando y los
        debilitamientos cambian el resultado real. Sirve para comparar dos hunts, no para predecir
        la próxima hora al minuto.`, 'dica')}

        <h4>Filtros</h4>
        <p>La barra del Mapa es una sola fila: el selector <b>Región</b> (de Kanto a
        ${ULTIMA_REGIAO.rotulo.es}), tres filtros en menús y la búsqueda por el nombre de la zona. En
        el móvil, los tres filtros viven detrás del botón <b>Filtros</b>.</p>
        <ul>
          <li><b>Tipo</b> — uno o más tipos. Con un tipo marcado, el propio menú ofrece
          <b>Débil contra</b> (las cacerías cuyos salvajes reciben ×2 o más de un golpe de ese tipo)
          y <b>Fuerte contra</b> (las que lo resisten: ×0,5 o menos).</li>
          <li><b>Pokédex</b> — Todos · Capturados · No capturados: separa las cacerías cuya especie ya
          tienes — las del anillo dorado, "ya capturado" — de las que te faltan.</li>
          <li><b>Nivel</b> — el rango de nivel de la zona y <b>solo zonas liberadas</b>, útil cuando
          subes de nivel y quieres ver qué se abrió.</li>
        </ul>

        <h4>Modo Lista</h4>
        <p>El interruptor <b>Mapa | Lista</b>, junto a la búsqueda, cambia el mapa por una
        <b>lista</b> con las mismas zonas — los mismos filtros y el mismo conteo del pie —, en filas
        anchas, más fáciles de encontrar y de pulsar (y sin esperar a que cargue la imagen del mapa).
        Cada fila muestra el pokémon, el nivel de la zona, sus tipos y el ✓ dorado de "ya
        capturado"; la zona donde cazas queda en morado, y las que tu nivel aún no alcanza, en gris
        con el candado. Los títulos <b>Pokémon</b>, <b>Nivel</b> y <b>Tipo</b> ordenan la lista
        (pulsa de nuevo para invertir). En el ordenador, pasar el ratón muestra el Hunt Analyser en
        una columna al lado, y el clic cambia de zona; en el móvil, el toque abre la ficha con
        <b>Cazar aquí</b>. El juego recuerda tu elección en este dispositivo.</p>

        <h4>Cambiar de zona: ${SEG_REENTRADA_HUNT} segundos</h4>
        <p>Entrar en una zona por el Mapa arma el campo con la oleada llena. Por eso hay dos esperas,
        las dos de <b>${SEG_REENTRADA_HUNT} s</b>:</p>
        <ul>
          <li>después de entrar en una zona, solo eliges otra (o la misma) ${SEG_REENTRADA_HUNT} s
          después — el aviso dice cuánto falta;</li>
          <li>quien llega a una zona hasta ${SEG_REENTRADA_HUNT} s después de intercambiar daño —
          desde otra cacería o desde el Centro — la encuentra <b>vacía</b> hasta completar el
          tiempo.</li>
        </ul>
        <p>La oleada normal vuelve en menos de 3 s, así que salir y entrar de nuevo para ganar una
        oleada llena nunca compensa. La vuelta automática después de un nocaut no paga esta espera.</p>

        <h4>La Sesión (la planilla)</h4>
        <p>Durante la cacería, el panel <b>Sesión</b> suma lo que pasó desde el último <b>Reset</b>,
        en cuatro secciones: <b>Entrenador</b> (tiempo, XP del entrenador y del pokémon, Gold,
        derrotas y capturas, cada uno también por hora), <b>Shiny</b> (vistos y capturados), <b>Drops
        raros</b> (Boss Token, fragmentos de Llave, Shiny Stone, Bicicleta y Mega, piezas de TM,
        Mystic Ticket, Safari Ticket y Fragmento de Huevo Shiny) y <b>Costos</b> — las balls, pociones y revivires que
        gastó la automatización, al precio del Market, con el <b>Gold gastado</b> y la <b>Ganancia neta</b>,
        también por hora.</p>
        <ul>
          <li><b>Shiny y Drops raros muestran solo lo que puede caer donde estás</b>: en la cacería, el
          shiny; de Unova en adelante, también el Fragmento de Huevo Shiny; en Outland, sus cuatro drops y
          ningún shiny (allí no sale); en el boss, los fragmentos de Mega, las piezas de TM, el
          Mystic Ticket y el Safari Ticket; en la Arena Mística, el shiny. Lo que ya cayó en esta sesión sigue en la cuenta
          cuando cambias de lugar.</li>
          <li>Los <b>Boss Tokens</b> gastados al entrar al boss — también en la repetición automática —
          aparecen en Costos, contados aparte: el token no tiene precio de NPC (solo se negocia en el
          Mercado), así que queda fuera del Gold gastado.</li>
        </ul>
        <p>Los números son de este navegador y sobreviven a recargar la página. <b>Copiar</b> lleva un
        resumen de una línea — ⏱️ tiempo, 🎮 XP/h, 🪙 Gold/h y 💫 shinies vistos y capturados —, para
        pegar en el chat.</p>`,
    }),
  },

  // ------------------------------------------------------------- 13. guilds
  {
    id: 'guild',
    titulo: { pt: 'Guilds', en: 'Guilds', es: 'Guilds' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>Clãs <b>sem limite de tamanho</b>: chame quantos jogadores quiser. O botão fica abaixo
        do seu retrato: <b>+</b> para criar ou o brasão da guild se você já estiver numa.</p>

        <h4>Criar e gerenciar</h4>
        <ul>
          <li>Custo de criação: <b>${N(c.d.guildCusto ?? 250_000, c.lang)}</b> de ouro</li>
          <li>Escolha nome, formato do escudo, emblema e cores (mesmo vocabulário visual do outfit) — o nome
          não aceita palavrão</li>
          <li>O dono convida por nick, expulsa membros, escala o time ou apaga a guild — e pode
          nomear <b>sub-donos</b> para dividir o trabalho</li>
          <li><b>Não há teto de membros</b> — o teto é do <b>TIME</b>, logo abaixo</li>
        </ul>

        <h4>Sub-donos</h4>
        <p>Na ficha de um membro, o dono pode <b>Tornar sub-dono</b> — quantos quiser. O sub-dono
        convida, expulsa membros, responde às candidaturas, escala o time, registra a guild na guerra,
        troca o brasão e a TAG e apaga e fixa mensagens no chat da guild: tudo o que o dono faz, menos
        <b>apagar a guild</b>, <b>passar a
        liderança</b> e <b>nomear outro sub-dono</b>. Um sub-dono não expulsa outro. E quem passa a
        liderança vira sub-dono, em vez de membro comum.</p>

        <h4>O painel da guild</h4>
        <p>Quatro abas: <b>Membros</b> (busca, convite e, ao lado de cada nick, a tag <b>no time</b>
        ou <b>reserva</b>; clicar no membro abre a ficha dele, com a equipe e as ações de dono),
        <b>Guerra</b> (a sua equipe de guerra, o Time da Guild e o atalho para o PvP Guild),
        <b>Guild</b> (brasão, TAG, recrutamento e a saída) e <b>Boost</b> (o banco da guild, mais
        abaixo).</p>

        <h4>Entrar numa guild: o Quadro</h4>
        <p>Quem não tem guild abre o botão e encontra o <b>Quadro</b>: a lista de todas as guilds,
        com busca por nome ou TAG, o filtro <b>só as que posso entrar</b> e três ordens — <b>Maior GP</b>,
        <b>Mais membros</b> e <b>⚔ Maior força</b> (a equipe de guerra dos escalados, somada; o ⚔ aparece
        em cada guild). Cada guild diz como recebe
        gente nova — o dono escolhe em <b>Guild → Quem pode entrar</b>:</p>
        ${tabela(
          ['Política', 'Como se entra'],
          `<tr><td><b>Aberta</b></td><td>qualquer treinador entra na hora, sem pedir nada</td></tr>
           <tr><td><b>Aberta com requisitos</b></td><td>entra na hora quem tiver o nível e o PR (do PvP Ranqueado) mínimos que o dono exigir</td></tr>
           <tr><td><b>Fechada</b></td><td>só por convite — mas qualquer um pode <b>Candidatar-se</b>, e o dono ou um sub-dono responde</td></tr>`,
        )}
        <ul>
          <li>O <b>cartaz</b> de recrutamento, uma linha de até ${MAX_DESCRICAO_GUILD} caracteres
          ("guerra todo dia às 22h"), aparece no Quadro. Ele segue a régua do chat: o conteúdo pesado é
          recusado.</li>
          <li>Os convites que você recebe ficam na aba <b>Convites</b>; as candidaturas para a sua
          guild, em <b>Pedidos para entrar</b>.</li>
          <li><b>Quem sai de uma guild espera ${Math.round(GUILD_SAIDA_CD_MS / 3_600_000)} horas</b> para entrar em outra. Só quem sai por
          vontade própria: quem foi <b>expulso</b>, ou perdeu a guild porque o dono a apagou, entra em
          outra na hora. É o que impede pular toda manhã para a guild que está em primeiro no
          bônus.</li>
        </ul>


        <h4>A TAG da guild</h4>
        <p>Até <b>três letras</b> ao lado do seu nick no chat, na cor que o dono escolher — em
        <b>Guild → Guild → TAG da guild</b>, e também na hora de criar a guild.</p>
        <ul>
          <li>Por padrão são as <b>três primeiras letras do nome</b> da guild: "Lua Cheia" nasce
          com <b>[LUA]</b>. Ninguém precisa configurar nada.</li>
          <li>A cor sai de uma paleta pensada para o <b>vidro preto do chat</b> — nada de tag
          invisível.</li>
          <li><b>Uma troca a cada 24 horas</b>, a mesma espera do brasão. A primeira é livre.</li>
          <li><b>ADM, MOD, GM e as outras da equipe são bloqueadas</b> (inclusive escritas com
          número, como <b>M0D</b>): o chat já marca a equipe do jogo na mesma linha, e a tag não
          pode servir para se passar por ela.</li>
          <li>A tag é um <b>retrato</b> na mensagem: trocar a tag hoje não reescreve o que você
          falou ontem.</li>
        </ul>

        <h4>O TIME da guild (a escalação)</h4>
        <p>A guild cresce sem limite, mas quem vai à <b>Guerra de Guilds</b> é o <b>time</b>:
        <b>${N(c.d.guildMaxTime ?? 10, c.lang)} jogadores</b>, escolhidos pelo <b>dono</b> (ou um
        sub-dono) em <b>Guild → Guerra → Time da Guild</b>. É a decisão que define a força da guild no dia.</p>
        <ul>
          <li><b>Guild com ${N(c.d.guildMaxTime ?? 10, c.lang)} membros ou menos está toda escalada.</b>
          Se você é oito, os oito entram — não há nada a escolher. O editor só passa a valer
          quando a guild passa de ${N(c.d.guildMaxTime ?? 10, c.lang)}.</li>
          <li>Com trinta membros, <b>dez</b> lutam e os outros vinte são <b>reserva</b>: continuam
          na guild, no chat e no ranking, mas não entram na guerra.</li>
          <li><b>Só os escalados recebem.</b> O bônus diário do ranking de GP (XP de treinador, XP
          de pokémon e loot) e os <b>diamantes do fechamento mensal</b> vão para o time, e não
          para a lista de membros. Quem é reserva farma sem bônus de guild.</li>
          <li>Vaga que abre (alguém saiu, foi expulso) <b>fecha sozinha</b> com o membro mais
          antigo que estava de fora: o time nunca vai à guerra com lugar vazio.</li>
          <li>O <b>Time da Guild</b> (quais JOGADORES lutam) não é a <b>Minha equipe de guerra</b>
          (quais POKÉMON você leva) — são dois botões no mesmo painel, e cada escalado precisa
          dos dois.</li>
        </ul>

        <h4>GP: o placar do dia e o do mês</h4>
        <p>Cada guild ganha <b>GP</b> (Guild Points) na <b>Guerra de Guilds</b>, e esse GP entra em
        dois placares, cada um com a sua aba no <a data-cap="ranking">Ranking</a>:</p>
        <ul>
          <li><b>Guild Diário</b> — o GP da última guerra. Ele <b>zera a cada guerra</b>, e a
          posição nele decide o bônus de <b>XP do treinador, XP do pokémon e loot</b> dos
          <b>escalados</b> até a guerra seguinte. Com 0 GP não há bônus.</li>
          <li><b>Guild Global</b> — a <b>Temporada Global</b>: soma o GP de todas as guerras do mês.
          No dia 1º, às <b>00:00 (horário de Brasília)</b>, as <b>${N(PREMIADOS_GLOBAL, c.lang)} primeiras</b>
          levam <b>diamantes para cada escalado</b> e o placar recomeça do zero.</li>
        </ul>
        <p>O <b>diário</b> não tem teto de posição: qualquer guild com GP levanta pelo menos o
        piso de +${BONUS_RANKING_GP.resto}%. O <b>mensal</b> tem — fora das
        ${N(PREMIADOS_GLOBAL, c.lang)} primeiras, o mês não paga.</p>
        <p>Os dois prêmios são <b>do time</b>: quem está na guild mas fora da escalação não leva
        nem o bônus do dia nem o diamante do mês.</p>
        ${tabela(['Posição', 'Bônus do dia', 'Prêmio do mês (por escalado)'], linhasPremiosGuild(c))}
        <p>O botão <b>🏆 Recompensas</b>, na aba <b>Guild</b> do PvP (embaixo do replay), mostra as
        duas tabelas, quanto falta para cada virada e onde a sua guild está.</p>

        <h4>Boost da Guild: o banco</h4>
        <p>Na aba <b>Boost</b> do painel da guild fica o <b>banco da guild</b>: qualquer membro doa
        diamantes, de 1 até o que falta. Quando o banco junta <b>${N(BANCO_GUILD.meta, c.lang)} 💎</b>, a
        guild <b>inteira</b> ganha <b>+${BOOST_GUILD.pct}% de XP</b> do treinador e do pokémon por
        <b>${BOOST_GUILD.dias} dias</b> — e o banco zera para a próxima rodada.</p>
        <ul>
          <li>Encher o banco com o boost ainda ligado <b>soma mais ${BOOST_GUILD.dias} dias</b> ao que falta.</li>
          <li>A doação é cortada no que falta: com ${N(BANCO_GUILD.meta - 50, c.lang)} no banco, quem doa 100 paga só 50.</li>
          <li>Vale para quem está na guild <b>agora</b>: quem entra enquanto ele dura também recebe, e quem
          sai perde na hora.</li>
          <li><b>Multiplica</b> com XP Boost, VIP, o bônus do ranking, eventos, Twitch e Kick.</li>
          <li>A doação é da guild: <b>não volta</b> se você sair ou for <b>expulso</b> — ela fica no banco
          para o próximo boost. Se a guild for <b>apagada</b> antes de o banco encher, o que estiver nele
          volta para quem doou, mesmo para quem já saiu. O que já encheu um banco virou boost e não volta.</li>
          <li>A aba mostra quem já doou no banco atual e o histórico, ao vivo; o chat da guild avisa quando
          o boost liga.</li>
        </ul>

        <h4>Guerra de Guilds (diária)</h4>
        <p>Uma vez por dia, às <b>22h UTC</b> (19h de Brasília), todas as guilds registradas se
        enfrentam numa arena só, e cada uma leva em <b>GP</b> a nota que tirou, de 0 a
        ${N(PESO_SOBREVIVENCIA + PESO_COMBATE, c.lang)}. O <b>dono</b> (ou um sub-dono) registra uma
        vez só — a guild entra <b>automaticamente todo dia</b> —, na aba <b>Guild</b> do painel de
        <a data-cap="pvp">PvP</a>. Registrou depois da guerra do dia? Vale para a de amanhã.</p>
        <ul>
          <li><b>A colocação é por uma nota de 0 a 100: ${N(PESO_SOBREVIVENCIA, c.lang)} de ficar de pé e ${N(PESO_COMBATE, c.lang)} de briga.</b>
          <ul>
            <li><b>Sobrevivência — até ${N(PESO_SOBREVIVENCIA, c.lang)}:</b> ${N(PESO_SOBREVIVENCIA, c.lang)} ÷ √ da posição em que a guild caiu, contando da
            última de pé. A última leva <b>${N(PESO_SOBREVIVENCIA, c.lang)}</b>; a 2ª, ${D(Math.round(notaSobrevivencia(2) * 10) / 10, c.lang)}; a 3ª, ${D(Math.round(notaSobrevivencia(3) * 10) / 10, c.lang)}; a 10ª,
            ${D(Math.round(notaSobrevivencia(10) * 10) / 10, c.lang)}; a 20ª, ${D(Math.round(notaSobrevivencia(20) * 10) / 10, c.lang)}. O peso está no topo: sobreviver à penúltima vale muito,
            e no meio da tabela quem decide é a briga.</li>
            <li><b>Combate — até ${N(PESO_COMBATE, c.lang)}:</b> um contador de pokémon inimigos derrubados pela guild — o
            abate de qualquer membro soma —, na mesma conta da sobrevivência: ${N(PESO_COMBATE, c.lang)} ÷ √ da posição da
            guild nesse contador. A que mais derrubou leva <b>${N(PESO_COMBATE, c.lang)}</b>; a 2ª, ${D(Math.round(notaCombate(2, 1) * 10) / 10, c.lang)}; a 3ª, ${D(Math.round(notaCombate(3, 1) * 10) / 10, c.lang)}; a
            10ª, ${D(Math.round(notaCombate(10, 1) * 10) / 10, c.lang)}. Quem não derrubou nenhum leva 0, e guilds com o mesmo número de abates dividem
            a posição. O dano não entra na nota (a análise da guerra continua mostrando).</li>
            <li>A <b>nota</b> é a soma das duas, com uma casa, e decide a colocação. Empate: leva quem
            caiu por último, depois quem derrubou mais.</li>
            <li><b>O GP é a nota</b>, arredondada a inteiro — até ,5 para baixo, acima de ,5 para
            cima: ${D(65.5, c.lang)} vira <b>${N(gpDaNota(65.5), c.lang)} GP</b>, ${D(40.8, c.lang)} vira ${N(gpDaNota(40.8), c.lang)}, e a nota máxima,
            ${N(gpDaNota(PESO_SOBREVIVENCIA + PESO_COMBATE), c.lang)}. No ranking do dia, que dá o bônus, GP igual desempata pela
            colocação na guerra.</li>
          </ul>
          Por que assim: só a ordem de queda punha no top 20 guilds de dois membros que passavam a
          guerra longe da briga, e só os pontos deixavam a última guild viva perder a guerra. Com a
          nota, a última de pé leva os ${N(PESO_SOBREVIVENCIA, c.lang)} e quase sempre vence, e quem só se escondeu não passa de
          quem brigou. A aba <b>Última guerra</b> mostra a nota de cada guild — o escudinho é a posição
          de sobrevivência, e parando o mouse na nota a conta inteira aparece.</li>
          <li><b>Ninguém precisa estar acordado.</b> A guerra é <b>simulada no servidor</b> com o
          <b>time</b> de quem se registrou — até ${N(c.d.guildMaxTime ?? 10, c.lang)} jogadores por guild,
          e não a guild inteira. Você não entra em arena nenhuma no horário.</li>
          <li>Entra a <b>equipe de guerra</b> que você salvou no painel; quem nunca salvou entra
          com a equipe de hunt. Ela é fotografada <b>na hora do evento</b>.</li>
          <li>Todo mundo entra <b>curado</b>: ter desmaiado antes de dormir não vira peso morto.</li>
          <li><b>Onde cada guild nasce é chaveado, como num campeonato.</b> As <b>4 guilds mais
          fortes</b> são as cabeças de chave: a 1ª nasce numa ponta da arena, a 2ª no ponto mais
          distante dela <b>a pé</b>, e a 3ª e a 4ª nos pontos mais distantes das duas. Cada vaga que
          sobra pertence à região da cabeça de chave mais próxima, e as outras guilds são repartidas
          entre as regiões em <b>serpentina</b> — numa chave de 16, 1-8-9-16, 2-7-10-15, 3-6-11-14 e
          4-5-12-13 —, para toda região ter a mesma força. Dentro da região, a mais fraca nasce mais
          perto da cabeça de chave e as fortes ficam na divisa: as favoritas só se cruzam no fim.
          A força é o <b>GP Global</b> da temporada, depois o GP do dia anterior e, empatando, a
          força das equipes. A ponta da 1ª é sorteada a cada guerra.</li>
          <li>A arena é um <b>quadrado liso de grama</b>, sem pedra nem corredor no meio, e só os
          <b>pokémon</b> estão em campo: ninguém fica preso atrás de obstáculo nem esperando na fila
          — o que a fita mostra é a briga.</li>
          <li>O nível conta <b>inteiro até ${N(ARENA_NIVEL_CHEIO, c.lang)}</b> e <b>comprimido</b> daí
          para cima — mais do que no <a data-cap="ginasios">ginásio</a>: nv ${N(1000, c.lang)} conta
          ${N(nivelNaGuerra(1000), c.lang)}, nv ${N(3000, c.lang)} conta ${N(nivelNaGuerra(3000), c.lang)}
          e nv ${N(10000, c.lang)} conta ${N(nivelNaGuerra(10000), c.lang)}. Dobrar o nível rende
          +${DOBRA_NA_GUERRA_PCT}%. Qualidade, potência e refino continuam valendo inteiros.</li>
          <li>Vale o <b>Z-Move</b> de cada pokémon; o <b>TM AoE não entra</b> — na guerra o
          dano é sempre num alvo só. O <b>+25% de líder de ginásio</b> vale só na hunt (ver
          <a data-cap="ginasios">Ginásios</a>).</li>
          <li><b>A guerra dura até ${MIN_GUERRA} minutos simulados.</b> Ela acaba quando sobra uma
          guild de pé ou quando bate o teto — e, nos dois casos, a colocação sai da nota (no teto, as
          que ainda estão de pé contam como as últimas a cair, na ordem da saúde). Os
          duelos de ginásio, do PvP Ranqueado e do Campeonato têm teto próprio, mais curto, e neles
          vence quem fica de pé.</li>
        </ul>
        <p>Depois é só clicar em <b>assistir ao replay</b>: a guerra inteira gravada, com os
        golpes, os efeitos de tipo, os números de dano, as trocas de pokémon, o placar e o feed de
        abates (<b>jogador</b> ⚔ <b>pokémon</b> de <b>dono</b>). Dá para acelerar até 8×, afastar
        a câmera e acompanhar um lutador específico — o painel lateral tem <b>busca por nick ou
        guild</b>, para achar alguém no meio de centenas.</p>
        ${nota(`<b>Medalha de Guerra.</b> O <b>Pokémon da guerra</b> — o destaque de dano — ganha a
        Medalha de Guerra para sempre, numerada. Ela aparece na ficha e numa cápsula dourada no
        Mercado da Comunidade, e vai junto quando ele troca de dono.`, 'dica')}
        <p>Ao lado das Recompensas, o botão <b>📊 Análise</b> abre os números da última guerra
        inteira: <b>dano causado e recebido, abates e pokémon perdidos</b> de cada jogador, os pokémon
        que cada um pôs em campo (e quanto cada um fez), os destaques — maior dano, mais abates, o
        Pokémon da guerra, o maior golpe, o primeiro abate, o último de pé — e o placar de todas as
        guilds. Os números saem da própria fita; assistência não entra, porque a fita não separa
        ajuda de coincidência.</p>`,
      en: `
        <p>Clans with <b>no size cap</b>: invite as many players as you like. The button sits
        below your portrait: <b>+</b> to create, or your guild crest if you are already in one.</p>

        <h4>Create and manage</h4>
        <ul>
          <li>Creation cost: <b>${N(c.d.guildCusto ?? 250_000, c.lang)}</b> gold</li>
          <li>Pick name, shield shape, emblem and colours — the name accepts no swearing</li>
          <li>The owner invites by nick, kicks members, sets the roster or deletes the guild — and can
          appoint <b>co-owners</b> to share the work</li>
          <li><b>No member cap</b> — the cap is on the <b>ROSTER</b>, just below</li>
        </ul>

        <h4>Co-owners</h4>
        <p>On a member's sheet, the owner can <b>Make co-owner</b> — as many as they like. A co-owner
        invites, kicks members, answers applications, sets the roster, registers the guild for the
        war, changes the crest and the TAG and deletes and pins messages in the guild chat: everything
        the owner does, except <b>deleting the
        guild</b>, <b>handing over leadership</b> and <b>appointing another co-owner</b>. A co-owner
        cannot kick another one. And whoever hands over leadership becomes a co-owner, not a plain
        member.</p>

        <h4>The guild panel</h4>
        <p>Four tabs: <b>Members</b> (search, invite and, next to each nick, the <b>on roster</b> or
        <b>reserve</b> tag; clicking a member opens their sheet, with their team and the owner
        actions), <b>War</b> (your war team, the Guild Roster and the shortcut to Guild PvP),
        <b>Guild</b> (crest, TAG, recruiting and leaving) and <b>Boost</b> (the guild bank, further
        down).</p>

        <h4>Joining a guild: the Board</h4>
        <p>Anyone without a guild opens the button and finds the <b>Board</b>: the list of every
        guild, with a search by name or TAG, the <b>only ones I can join</b> filter and three orders —
        <b>Most GP</b>, <b>Most members</b> and <b>⚔ Strongest</b> (the lineup's war teams, summed; the ⚔
        shows on every guild). Each guild
        says how it takes new people — the owner picks it in <b>Guild → Who can join</b>:</p>
        ${tabela(
          ['Policy', 'How you get in'],
          `<tr><td><b>Open</b></td><td>any trainer joins right away, no questions asked</td></tr>
           <tr><td><b>Open with requirements</b></td><td>joins right away whoever has the minimum level and PR (Ranked PvP) the owner set</td></tr>
           <tr><td><b>Closed</b></td><td>invite only — but anyone can <b>Apply</b>, and the owner or a co-owner answers</td></tr>`,
        )}
        <ul>
          <li>The recruiting <b>poster</b>, one line of up to ${MAX_DESCRICAO_GUILD} characters ("war every
          day at 10 PM"), shows on the Board. It follows the chat's rule: heavy content is refused.</li>
          <li>Invites you receive go to the <b>Invites</b> tab; applications to your guild, to
          <b>Join requests</b>.</li>
          <li><b>Whoever leaves a guild waits ${Math.round(GUILD_SAIDA_CD_MS / 3_600_000)} hours</b> before joining another. Only those who
          leave by choice: whoever was <b>kicked</b>, or lost the guild because the owner deleted it,
          joins another right away. It is what stops people hopping every morning to the guild that
          is first on the bonus.</li>
        </ul>


        <h4>The guild TAG</h4>
        <p>Up to <b>three letters</b> next to your nick in chat, in the colour the owner picks —
        in <b>Guild → Guild → Guild TAG</b>, and also while creating the guild.</p>
        <ul>
          <li>It defaults to the <b>first three letters of the name</b>: "Lua Cheia" is born with
          <b>[LUA]</b>. Nobody has to set anything up.</li>
          <li>The colour comes from a palette built for the <b>black glass of the chat</b> — no
          invisible tags.</li>
          <li><b>One change every 24 hours</b>, the same wait as the crest. The first one is free.</li>
          <li><b>ADM, MOD, GM and the other staff ones are blocked</b> (including the digit
          spellings, like <b>M0D</b>): the chat already marks the game's staff on that same line,
          and the tag cannot be used to pass for it.</li>
          <li>The tag is a <b>snapshot</b> on the message: changing it today does not rewrite what
          you said yesterday.</li>
        </ul>

        <h4>The guild roster</h4>
        <p>The guild grows without limit, but what goes to the <b>Guild War</b> is the
        <b>roster</b>: <b>${N(c.d.guildMaxTime ?? 10, c.lang)} players</b>, picked by the <b>owner</b> (or
        a co-owner) in <b>Guild → War → Guild Roster</b>. That choice is what the guild's strength is made of.</p>
        <ul>
          <li><b>A guild with ${N(c.d.guildMaxTime ?? 10, c.lang)} members or fewer is fully rostered.</b>
          If you are eight, all eight fight — there is nothing to pick. The editor only starts to
          matter once the guild goes past ${N(c.d.guildMaxTime ?? 10, c.lang)}.</li>
          <li>With thirty members, <b>ten</b> fight and the other twenty are <b>reserves</b>: still
          in the guild, the chat and the ranking, but not in the war.</li>
          <li><b>Only rostered players collect.</b> The daily GP ranking bonus (trainer XP, pokémon
          XP and loot) and the <b>diamonds from the monthly close</b> go to the roster, not to the
          member list. Reserves farm without the guild bonus.</li>
          <li>A slot that opens up (someone left or was kicked) <b>fills itself</b> with the
          longest-standing member off the roster: the team never goes to war a player short.</li>
          <li>The <b>Guild Roster</b> (which PLAYERS fight) is not <b>My war team</b> (which
          POKÉMON you bring) — two buttons in the same panel, and every rostered player needs
          both.</li>
        </ul>

        <h4>GP: the daily board and the monthly one</h4>
        <p>Each guild earns <b>GP</b> (Guild Points) in the <b>Guild War</b>, and that GP feeds two
        boards, each with its own tab in <a data-cap="ranking">Rankings</a>:</p>
        <ul>
          <li><b>Guild Daily</b> — the GP from the last war. It <b>resets every war</b>, and your
          place on it sets the <b>trainer XP, pokémon XP and loot</b> bonus for the <b>rostered
          players</b> until the next war. With 0 GP there is no bonus.</li>
          <li><b>Guild Global</b> — the <b>Global Season</b>: it adds up the GP of every war in the
          month. On the 1st, at <b>00:00 (Brasília time)</b>, the <b>top ${N(PREMIADOS_GLOBAL, c.lang)}</b>
          get <b>diamonds for each rostered player</b> and the board starts over.</li>
        </ul>
        <p>The <b>daily</b> board has no cutoff: any guild with GP takes at least the
        +${BONUS_RANKING_GP.resto}% floor. The <b>monthly</b> one does — below the top
        ${N(PREMIADOS_GLOBAL, c.lang)}, the month pays nothing.</p>
        <p>Both prizes belong to the <b>roster</b>: a member off it gets neither the daily bonus
        nor the monthly diamonds.</p>
        ${tabela(['Place', 'Daily bonus', 'Monthly prize (per rostered player)'], linhasPremiosGuild(c))}
        <p>The <b>🏆 Rewards</b> button, on the PvP <b>Guild</b> tab (below the replay), shows both
        tables, the time left until each reset and where your guild stands.</p>

        <h4>Guild Boost: the bank</h4>
        <p>The guild panel's <b>Boost</b> tab holds the <b>guild bank</b>: any member donates diamonds,
        from 1 up to what is missing. When the bank reaches <b>${N(BANCO_GUILD.meta, c.lang)} 💎</b>, the
        <b>whole</b> guild gets <b>+${BOOST_GUILD.pct}% trainer and pokémon XP</b> for
        <b>${BOOST_GUILD.dias} days</b> — and the bank empties for the next round.</p>
        <ul>
          <li>Filling the bank while the boost is still on <b>adds ${BOOST_GUILD.dias} more days</b> to what is left.</li>
          <li>Donations are capped at what is missing: with ${N(BANCO_GUILD.meta - 50, c.lang)} in the bank, donating 100 costs only 50.</li>
          <li>It applies to whoever is in the guild <b>now</b>: anyone who joins while it lasts gets it too,
          and anyone who leaves loses it at once.</li>
          <li>It <b>multiplies</b> with XP Boost, VIP, the ranking bonus, events, Twitch and Kick.</li>
          <li>Donations belong to the guild: they <b>don't come back</b> if you leave or get <b>kicked</b> —
          they stay in the bank for the next boost. If the guild is <b>deleted</b> before the bank fills,
          whatever is in it goes back to the donors, even those who already left. What already filled a
          bank became a boost and never comes back.</li>
          <li>The tab shows who donated to the current bank and the history, live; the guild chat tells
          everyone when the boost turns on.</li>
        </ul>

        <h4>Guild War (daily)</h4>
        <p>Once a day, at <b>22:00 UTC</b>, every registered guild fights in a single arena, and
        each one earns its score, from 0 to ${N(PESO_SOBREVIVENCIA + PESO_COMBATE, c.lang)}, in <b>GP</b>. The
        <b>owner</b> (or a co-owner) registers just once — the guild joins <b>automatically every
        day</b> — on the <b>Guild</b> tab of the <a data-cap="pvp">PvP</a> panel. Registered after
        the day's war? It counts for tomorrow's.</p>
        <ul>
          <li><b>Placing is by a score from 0 to 100: ${N(PESO_SOBREVIVENCIA, c.lang)} for staying alive and ${N(PESO_COMBATE, c.lang)} for fighting.</b>
          <ul>
            <li><b>Survival — up to ${N(PESO_SOBREVIVENCIA, c.lang)}:</b> ${N(PESO_SOBREVIVENCIA, c.lang)} ÷ √ of the position the guild fell in, counting from
            the last one standing. The last one gets <b>${N(PESO_SOBREVIVENCIA, c.lang)}</b>; 2nd, ${D(Math.round(notaSobrevivencia(2) * 10) / 10, c.lang)}; 3rd, ${D(Math.round(notaSobrevivencia(3) * 10) / 10, c.lang)};
            10th, ${D(Math.round(notaSobrevivencia(10) * 10) / 10, c.lang)}; 20th, ${D(Math.round(notaSobrevivencia(20) * 10) / 10, c.lang)}. The weight sits at the top: outlasting the
            runner-up is worth a lot, and in the middle of the table fighting decides.</li>
            <li><b>Combat — up to ${N(PESO_COMBATE, c.lang)}:</b> a counter of enemy Pokémon knocked out by the guild — any
            member's knockout counts —, with the same math as survival: ${N(PESO_COMBATE, c.lang)} ÷ √ of the guild's position
            on that counter. The one with the most knockouts gets <b>${N(PESO_COMBATE, c.lang)}</b>; 2nd, ${D(Math.round(notaCombate(2, 1) * 10) / 10, c.lang)}; 3rd, ${D(Math.round(notaCombate(3, 1) * 10) / 10, c.lang)};
            10th, ${D(Math.round(notaCombate(10, 1) * 10) / 10, c.lang)}. No knockouts gets 0, and guilds tied on knockouts share the position. Damage
            does not count toward the score (the war analysis still shows it).</li>
            <li>The <b>score</b> is the sum of both, with one decimal, and decides the placing. Ties go
            to whoever fell last, then to whoever knocked out more.</li>
            <li><b>GP is the score</b>, rounded to a whole number — .5 or less rounds down, above .5
            rounds up: ${D(65.5, c.lang)} becomes <b>${N(gpDaNota(65.5), c.lang)} GP</b>, ${D(40.8, c.lang)} becomes ${N(gpDaNota(40.8), c.lang)}, and the top score,
            ${N(gpDaNota(PESO_SOBREVIVENCIA + PESO_COMBATE), c.lang)}. In the day's ranking, which pays the bonus, equal GP is broken by
            the war placing.</li>
          </ul>
          Why: the order of elimination alone put two-member guilds that spent the war away from the
          fight in the top 20, and points alone let the last guild alive lose the war. With the score,
          the last one standing gets the ${N(PESO_SOBREVIVENCIA, c.lang)} and almost always wins, and a guild that only hid does
          not pass the ones that fought. The <b>Last war</b> tab shows each guild's score — the little
          shield is the survival position, and hovering the score shows the full math.</li>
          <li><b>Nobody has to be awake.</b> The war is <b>simulated on the server</b> with the
          <b>roster</b> of everyone who registered — up to ${N(c.d.guildMaxTime ?? 10, c.lang)} players per
          guild, not the whole guild. You do not enter any arena at that hour.</li>
          <li>Your <b>war team</b> from the panel is the one that fights; if you never saved one,
          your hunt team goes in. It is snapshotted <b>at event time</b>.</li>
          <li>Everyone enters <b>healed</b>: having fainted before logging off is not dead
          weight.</li>
          <li><b>Where each guild spawns is seeded, like a tournament.</b> The <b>4 strongest
          guilds</b> are the top seeds: 1st starts at a corner of the arena, 2nd at the point
          farthest from it <b>on foot</b>, and 3rd and 4th at the points farthest from both. Every
          remaining spot belongs to the region of the nearest top seed, and the other guilds are
          spread across those regions in <b>snake order</b> — in a 16-guild bracket, 1-8-9-16,
          2-7-10-15, 3-6-11-14 and 4-5-12-13 —, so every region has the same strength. Inside a
          region the weakest guild spawns closest to the top seed and the strong ones sit on the
          border: the favourites only meet at the end. Strength is the season's <b>Global GP</b>,
          then the previous day's GP and, on a tie, the teams' strength. The 1st seed's corner is
          drawn every war.</li>
          <li>The arena is a <b>flat square of grass</b>, with no rock or corridor in the middle, and
          only the <b>pokémon</b> are on the field: nobody gets stuck behind an obstacle or waiting in
          line — what the replay shows is the fight.</li>
          <li>Level counts <b>in full up to ${N(ARENA_NIVEL_CHEIO, c.lang)}</b> and <b>compressed</b>
          above that — harder than in the <a data-cap="ginasios">gyms</a>: lv ${N(1000, c.lang)}
          counts as ${N(nivelNaGuerra(1000), c.lang)}, lv ${N(3000, c.lang)} as
          ${N(nivelNaGuerra(3000), c.lang)} and lv ${N(10000, c.lang)} as
          ${N(nivelNaGuerra(10000), c.lang)}. Doubling your level pays +${DOBRA_NA_GUERRA_PCT}%.
          Quality, potency and refinement still count in full.</li>
          <li>Each pokémon's <b>Z-Move</b> counts; the <b>AoE TM does not</b> — in the war
          damage is always single-target. The <b>+25% gym leader</b> bonus applies only in the hunt
          (see <a data-cap="ginasios">Gyms</a>).</li>
          <li><b>The war lasts up to ${MIN_GUERRA} simulated minutes.</b> It ends when only one guild
          is left standing or when it hits the cap — either way, placing comes from the score (at the cap,
          the guilds still standing count as the last to fall, in order of health). Gym,
          Ranked PvP and Championship duels have their own, shorter cap, and there whoever stays
          standing wins.</li>
        </ul>
        <p>Afterwards just hit <b>watch the replay</b>: the whole war recorded, with the moves,
        the type effects, the damage numbers, the pokémon swaps, the scoreboard and the kill feed
        (<b>player</b> ⚔ <b>pokémon</b> of <b>owner</b>). You can speed it up to 8×, zoom the
        camera out and follow one specific fighter — the side panel has a <b>search by nick or
        guild</b>, to find someone among hundreds.</p>
        ${nota(`<b>War Medal.</b> The <b>Pokémon of the war</b> — the top damage dealer — earns the War
        Medal for good, numbered. It shows on its sheet and as a golden capsule in the Community
        Market, and goes along when it changes hands.`, 'dica')}
        <p>Next to Rewards, the <b>📊 Analysis</b> button opens the numbers of the whole last war:
        <b>damage dealt and taken, knockouts and pokémon lost</b> for every player, the pokémon each one
        put on the field (and how much each did), the highlights — most damage, most knockouts, the
        Pokémon of the war, the biggest hit, first blood, last one standing — and every guild's
        scoreboard. The numbers come from the replay itself; assists are not counted, because the
        replay cannot tell help from coincidence.</p>`,
      es: `
        <p>Clanes <b>sin límite de tamaño</b>: invita a cuantos jugadores quieras. El botón está
        debajo de tu retrato: <b>+</b> para crear, o el escudo si ya estás en una guild.</p>

        <h4>Crear y gestionar</h4>
        <ul>
          <li>Costo de creación: <b>${N(c.d.guildCusto ?? 250_000, c.lang)}</b> de oro</li>
          <li>Elige nombre, forma del escudo, emblema y colores — el nombre no acepta groserías</li>
          <li>El dueño invita por nick, expulsa, arma el equipo o borra la guild — y puede nombrar
          <b>sub-dueños</b> para repartir el trabajo</li>
          <li><b>No hay límite de miembros</b> — el límite es del <b>EQUIPO</b>, aquí abajo</li>
        </ul>

        <h4>Sub-dueños</h4>
        <p>En la ficha de un miembro, el dueño puede <b>Hacer sub-dueño</b> — a cuantos quiera. El
        sub-dueño invita, expulsa miembros, responde a las postulaciones, arma el equipo, registra la
        guild en la guerra, cambia el escudo y la TAG y borra y fija mensajes en el chat de la guild:
        todo lo que hace el dueño, menos <b>borrar la
        guild</b>, <b>pasar el liderazgo</b> y <b>nombrar otro sub-dueño</b>. Un sub-dueño no expulsa
        a otro. Y quien pasa el liderazgo se vuelve sub-dueño, en vez de miembro común.</p>

        <h4>El panel de la guild</h4>
        <p>Cuatro pestañas: <b>Miembros</b> (búsqueda, invitación y, junto a cada nick, la etiqueta
        <b>en el equipo</b> o <b>reserva</b>; pulsar el miembro abre su ficha, con su equipo y las
        acciones de dueño), <b>Guerra</b> (tu equipo de guerra, el Equipo de la Guild y el atajo al
        PvP Guild), <b>Guild</b> (escudo, TAG, reclutamiento y la salida) y <b>Boost</b> (el banco de
        la guild, más abajo).</p>

        <h4>Entrar en una guild: el Tablón</h4>
        <p>Quien no tiene guild abre el botón y encuentra el <b>Tablón</b>: la lista de todas las
        guilds, con búsqueda por nombre o TAG, el filtro <b>solo en las que puedo entrar</b> y tres
        órdenes — <b>Más GP</b>, <b>Más miembros</b> y <b>⚔ Mayor fuerza</b> (los equipos de guerra de los
        alineados, sumados; el ⚔ aparece en cada guild). Cada
        guild dice cómo recibe gente nueva — el dueño lo elige en <b>Guild → Quién puede
        entrar</b>:</p>
        ${tabela(
          ['Política', 'Cómo se entra'],
          `<tr><td><b>Abierta</b></td><td>cualquier entrenador entra al instante, sin pedir nada</td></tr>
           <tr><td><b>Abierta con requisitos</b></td><td>entra al instante quien tenga el nivel y el PR (del PvP Clasificatorio) mínimos que pida el dueño</td></tr>
           <tr><td><b>Cerrada</b></td><td>solo por invitación — pero cualquiera puede <b>Postularse</b>, y el dueño o un sub-dueño responde</td></tr>`,
        )}
        <ul>
          <li>El <b>cartel</b> de reclutamiento, una línea de hasta ${MAX_DESCRICAO_GUILD} caracteres
          ("guerra todos los días a las 22h"), aparece en el Tablón. Sigue la regla del chat: el
          contenido pesado se rechaza.</li>
          <li>Las invitaciones que recibes quedan en la pestaña <b>Invitaciones</b>; las postulaciones
          a tu guild, en <b>Solicitudes de entrada</b>.</li>
          <li><b>Quien sale de una guild espera ${Math.round(GUILD_SAIDA_CD_MS / 3_600_000)} horas</b> para entrar en otra. Solo quien sale
          por voluntad propia: quien fue <b>expulsado</b>, o perdió la guild porque el dueño la borró,
          entra en otra al instante. Es lo que impide saltar cada mañana a la guild que va primera en el
          bono.</li>
        </ul>


        <h4>La TAG de la guild</h4>
        <p>Hasta <b>tres letras</b> junto a tu nick en el chat, del color que elija el dueño — en
        <b>Guild → Guild → TAG de la guild</b>, y también al crear la guild.</p>
        <ul>
          <li>Por defecto son las <b>tres primeras letras del nombre</b>: "Lua Cheia" nace con
          <b>[LUA]</b>. Nadie tiene que configurar nada.</li>
          <li>El color sale de una paleta pensada para el <b>vidrio negro del chat</b> — nada de
          tags invisibles.</li>
          <li><b>Un cambio cada 24 horas</b>, la misma espera del escudo. El primero es libre.</li>
          <li><b>ADM, MOD, GM y las demás del equipo están bloqueadas</b> (incluso escritas con
          número, como <b>M0D</b>): el chat ya marca al equipo del juego en esa misma línea, y la
          tag no puede servir para hacerse pasar por él.</li>
          <li>La tag es una <b>foto</b> en el mensaje: cambiarla hoy no reescribe lo que dijiste
          ayer.</li>
        </ul>

        <h4>El EQUIPO de la guild (la convocatoria)</h4>
        <p>La guild crece sin límite, pero quien va a la <b>Guerra de Guilds</b> es el
        <b>equipo</b>: <b>${N(c.d.guildMaxTime ?? 10, c.lang)} jugadores</b>, elegidos por el <b>dueño</b>
        (o un sub-dueño) en <b>Guild → Guerra → Equipo de la Guild</b>. Es la decisión que define la fuerza de la guild.</p>
        <ul>
          <li><b>Una guild con ${N(c.d.guildMaxTime ?? 10, c.lang)} miembros o menos está toda
          convocada.</b> Si sois ocho, entran los ocho — no hay nada que elegir. El editor empieza
          a valer cuando la guild pasa de ${N(c.d.guildMaxTime ?? 10, c.lang)}.</li>
          <li>Con treinta miembros, <b>diez</b> luchan y los otros veinte son <b>reserva</b>: siguen
          en la guild, en el chat y en la clasificación, pero no entran en la guerra.</li>
          <li><b>Solo los convocados cobran.</b> El bonus diario del ranking de GP (XP de
          entrenador, XP de pokémon y loot) y los <b>diamantes del cierre mensual</b> van al
          equipo, no a la lista de miembros. La reserva farmea sin bonus de guild.</li>
          <li>La plaza que se abre (alguien salió o fue expulsado) <b>se llena sola</b> con el
          miembro más antiguo que estaba fuera: el equipo nunca va a la guerra con un hueco.</li>
          <li>El <b>Equipo de la Guild</b> (qué JUGADORES luchan) no es <b>Mi equipo de guerra</b>
          (qué POKÉMON llevas) — son dos botones del mismo panel, y cada convocado necesita los
          dos.</li>
        </ul>

        <h4>GP: el marcador del día y el del mes</h4>
        <p>Cada guild gana <b>GP</b> (Guild Points) en la <b>Guerra de Guilds</b>, y ese GP entra en
        dos marcadores, cada uno con su pestaña en la <a data-cap="ranking">Clasificación</a>:</p>
        <ul>
          <li><b>Guild Diaria</b> — el GP de la última guerra. Se <b>reinicia en cada guerra</b>, y
          el puesto en ella decide el bonus de <b>XP del entrenador, XP del pokémon y loot</b> de
          los <b>convocados</b> hasta la guerra siguiente. Con 0 GP no hay bonus.</li>
          <li><b>Guild Global</b> — la <b>Temporada Global</b>: suma el GP de todas las guerras del
          mes. El día 1, a las <b>00:00 (hora de Brasilia)</b>, las <b>${N(PREMIADOS_GLOBAL, c.lang)} primeras</b>
          se llevan <b>diamantes para cada convocado</b> y el marcador vuelve a cero.</li>
        </ul>
        <p>La <b>diaria</b> no tiene tope de puesto: cualquier guild con GP se lleva al menos el
        piso de +${BONUS_RANKING_GP.resto}%. La <b>mensual</b> sí — fuera de las
        ${N(PREMIADOS_GLOBAL, c.lang)} primeras, el mes no paga nada.</p>
        <p>Los dos premios son <b>del equipo</b>: quien está en la guild pero fuera de la
        convocatoria no recibe ni el bonus del día ni el diamante del mes.</p>
        ${tabela(['Posición', 'Bonus del día', 'Premio del mes (por convocado)'], linhasPremiosGuild(c))}
        <p>El botón <b>🏆 Recompensas</b>, en la pestaña <b>Guild</b> del PvP (debajo del replay),
        muestra las dos tablas, cuánto falta para cada cambio y dónde está tu guild.</p>

        <h4>Boost de la Guild: el banco</h4>
        <p>En la pestaña <b>Boost</b> del panel de la guild está el <b>banco de la guild</b>: cualquier
        miembro dona diamantes, de 1 hasta lo que falta. Cuando el banco junta
        <b>${N(BANCO_GUILD.meta, c.lang)} 💎</b>, <b>toda</b> la guild gana <b>+${BOOST_GUILD.pct}% de XP</b>
        del entrenador y del pokémon durante <b>${BOOST_GUILD.dias} días</b> — y el banco vuelve a cero para
        la próxima ronda.</p>
        <ul>
          <li>Llenar el banco con el boost todavía activo <b>suma ${BOOST_GUILD.dias} días más</b> a lo que falta.</li>
          <li>La donación se corta en lo que falta: con ${N(BANCO_GUILD.meta - 50, c.lang)} en el banco, quien dona 100 paga solo 50.</li>
          <li>Vale para quien está en la guild <b>ahora</b>: quien entra mientras dura también lo recibe, y
          quien sale lo pierde al instante.</li>
          <li>Se <b>multiplica</b> con el XP Boost, el VIP, el bonus del ranking, los eventos, Twitch y Kick.</li>
          <li>La donación es de la guild: <b>no vuelve</b> si sales o te <b>expulsan</b> — se queda en el
          banco para el próximo boost. Si la guild se <b>borra</b> antes de que el banco se llene, lo que
          haya en él vuelve a quienes donaron, incluso a quien ya salió. Lo que ya llenó un banco se
          convirtió en boost y no vuelve.</li>
          <li>La pestaña muestra quién donó al banco actual y el historial, en vivo; el chat de la guild
          avisa cuando el boost se activa.</li>
        </ul>

        <h4>Guerra de Guilds (diaria)</h4>
        <p>Una vez al día, a las <b>22:00 UTC</b>, todas las guilds registradas se enfrentan en una
        sola arena, y cada una se lleva en <b>GP</b> la nota que sacó, de 0 a
        ${N(PESO_SOBREVIVENCIA + PESO_COMBATE, c.lang)}. El <b>dueño</b> (o un sub-dueño) registra una sola vez — la guild
        entra <b>automáticamente cada día</b> —, en la pestaña <b>Guild</b> del panel de
        <a data-cap="pvp">PvP</a>. ¿Registraste después de la guerra del día? Vale para la de
        mañana.</p>
        <ul>
          <li><b>La posición es por una nota de 0 a 100: ${N(PESO_SOBREVIVENCIA, c.lang)} por quedar en pie y ${N(PESO_COMBATE, c.lang)} por pelear.</b>
          <ul>
            <li><b>Supervivencia — hasta ${N(PESO_SOBREVIVENCIA, c.lang)}:</b> ${N(PESO_SOBREVIVENCIA, c.lang)} ÷ √ de la posición en que cayó la guild,
            contando desde la última en pie. La última lleva <b>${N(PESO_SOBREVIVENCIA, c.lang)}</b>; la 2.ª, ${D(Math.round(notaSobrevivencia(2) * 10) / 10, c.lang)}; la 3.ª,
            ${D(Math.round(notaSobrevivencia(3) * 10) / 10, c.lang)}; la 10.ª, ${D(Math.round(notaSobrevivencia(10) * 10) / 10, c.lang)}; la 20.ª, ${D(Math.round(notaSobrevivencia(20) * 10) / 10, c.lang)}. El peso está arriba: sobrevivir a
            la penúltima vale mucho, y en el medio de la tabla decide la pelea.</li>
            <li><b>Combate — hasta ${N(PESO_COMBATE, c.lang)}:</b> un contador de pokémon enemigos derrotados por la guild —
            la derrota de cualquier miembro suma —, con la misma cuenta de la supervivencia: ${N(PESO_COMBATE, c.lang)} ÷ √ de
            la posición de la guild en ese contador. La que más derrotó lleva <b>${N(PESO_COMBATE, c.lang)}</b>; la 2.ª, ${D(Math.round(notaCombate(2, 1) * 10) / 10, c.lang)};
            la 3.ª, ${D(Math.round(notaCombate(3, 1) * 10) / 10, c.lang)}; la 10.ª, ${D(Math.round(notaCombate(10, 1) * 10) / 10, c.lang)}. La que no derrotó ninguno lleva 0, y las guilds con el mismo
            número de derrotas dividen la posición. El daño no entra en la nota (el análisis de la guerra
            lo sigue mostrando).</li>
            <li>La <b>nota</b> es la suma de las dos, con un decimal, y decide la posición. Empate: gana
            quien cayó último, después quien derrotó más.</li>
            <li><b>El GP es la nota</b>, redondeada a entero — hasta ,5 hacia abajo, por encima de ,5
            hacia arriba: ${D(65.5, c.lang)} se vuelve <b>${N(gpDaNota(65.5), c.lang)} GP</b>, ${D(40.8, c.lang)} se vuelve ${N(gpDaNota(40.8), c.lang)}, y la nota
            máxima, ${N(gpDaNota(PESO_SOBREVIVENCIA + PESO_COMBATE), c.lang)}. En el ranking del día, que da el bonus, el mismo GP se
            desempata por la posición en la guerra.</li>
          </ul>
          Por qué así: solo el orden de caída ponía en el top 20 guilds de dos miembros que pasaban la
          guerra lejos de la pelea, y solo los puntos dejaban que la última guild viva perdiera la
          guerra. Con la nota, la última en pie lleva los ${N(PESO_SOBREVIVENCIA, c.lang)} y casi siempre gana, y quien solo se
          escondió no pasa a quien peleó. La pestaña <b>Última guerra</b> muestra la nota de cada guild —
          el escudito es la posición de supervivencia, y al pasar el ratón por la nota aparece la cuenta
          entera.</li>
          <li><b>Nadie necesita estar despierto.</b> La guerra se <b>simula en el servidor</b> con
          el <b>equipo</b> de quien se registró — hasta ${N(c.d.guildMaxTime ?? 10, c.lang)}
          jugadores por guild, no la guild entera. No entras a ninguna arena a esa hora.</li>
          <li>Entra el <b>equipo de guerra</b> que guardaste en el panel; quien nunca guardó entra
          con el equipo de cacería. Se fotografía <b>en el momento del evento</b>.</li>
          <li>Todos entran <b>curados</b>: haber caído antes de dormir no se vuelve peso
          muerto.</li>
          <li><b>Dónde nace cada guild se reparte como el cuadro de un campeonato.</b> Las <b>4
          guilds más fuertes</b> son las cabezas de serie: la 1ª nace en una esquina de la arena, la
          2ª en el punto más lejano de ella <b>a pie</b>, y la 3ª y la 4ª en los puntos más lejanos
          de las dos. Cada hueco que queda pertenece a la región de la cabeza de serie más cercana, y
          las demás guilds se reparten entre esas regiones en <b>serpentina</b> — en un cuadro de 16,
          1-8-9-16, 2-7-10-15, 3-6-11-14 y 4-5-12-13 —, para que cada región tenga la misma fuerza.
          Dentro de la región, la más débil nace más cerca de la cabeza de serie y las fuertes quedan
          en la frontera: las favoritas solo se cruzan al final. La fuerza es el <b>GP Global</b> de
          la temporada, después el GP del día anterior y, si empatan, la fuerza de los equipos. La
          esquina de la 1ª se sortea en cada guerra.</li>
          <li>La arena es un <b>cuadrado liso de césped</b>, sin piedra ni pasillo en el medio, y solo
          los <b>pokémon</b> están en el campo: nadie se queda atascado detrás de un obstáculo ni
          esperando en fila — lo que muestra la grabación es la pelea.</li>
          <li>El nivel cuenta <b>entero hasta ${N(ARENA_NIVEL_CHEIO, c.lang)}</b> y <b>comprimido</b>
          por encima — más que en el <a data-cap="ginasios">gimnasio</a>: nv ${N(1000, c.lang)}
          cuenta ${N(nivelNaGuerra(1000), c.lang)}, nv ${N(3000, c.lang)} cuenta
          ${N(nivelNaGuerra(3000), c.lang)} y nv ${N(10000, c.lang)} cuenta
          ${N(nivelNaGuerra(10000), c.lang)}. Duplicar el nivel rinde +${DOBRA_NA_GUERRA_PCT}%.
          Calidad, potencia y refinado siguen valiendo enteros.</li>
          <li>Vale el <b>Z-Move</b> de cada pokémon; el <b>TM AoE no entra</b> — en la guerra
          el daño siempre es a un solo objetivo. El <b>+25% de líder de gimnasio</b> vale solo en la
          cacería (ver <a data-cap="ginasios">Gimnasios</a>).</li>
          <li><b>La guerra dura hasta ${MIN_GUERRA} minutos simulados.</b> Termina cuando queda una
          sola guild en pie o cuando llega al tope — en los dos casos, la posición sale de la nota (en el
          tope, las que siguen en pie cuentan como las últimas en caer, en el orden de la salud). Los duelos de gimnasio, del PvP Clasificatorio y del Campeonato tienen su propio
          tope, más corto, y en ellos gana quien queda en pie.</li>
        </ul>
        <p>Después basta con pulsar <b>ver el replay</b>: la guerra entera grabada, con los
        golpes, los efectos de tipo, los números de daño, los cambios de pokémon, el marcador y el
        feed de derrotas (<b>jugador</b> ⚔ <b>pokémon</b> de <b>dueño</b>). Se puede acelerar hasta
        8×, alejar la cámara y seguir a un luchador concreto — el panel lateral tiene <b>búsqueda por
        nick o guild</b>, para encontrar a alguien entre cientos.</p>
        ${nota(`<b>Medalla de Guerra.</b> El <b>Pokémon de la guerra</b> — el que más daño hizo — gana
        la Medalla de Guerra para siempre, numerada. Aparece en su ficha y en una cápsula dorada en el
        Mercado de la Comunidad, y va con él cuando cambia de dueño.`, 'dica')}
        <p>Junto a Recompensas, el botón <b>📊 Análisis</b> abre los números de la última
        guerra entera: <b>daño causado y recibido, derrotas y pokémon perdidos</b> de cada jugador, los
        pokémon que cada uno puso en campo (y cuánto hizo cada uno), los destacados — mayor daño, más
        derrotas, el Pokémon de la guerra, el mayor golpe, la primera derrota, el último en pie — y el
        marcador de todas las guilds. Los números salen de la propia grabación; las asistencias no
        cuentan, porque la grabación no separa ayuda de coincidencia.</p>`,
    }),
  },

  // ------------------------------------------------------- 13b. Casa e XP Share
  //
  // Como todo capítulo desta tela, NENHUM número aqui é escrito à mão: as raridades, os
  // pesos do sorteio, o teto de fragmentos e as chances de drop vêm todos de `estado.casas`,
  // que o servidor manda no welcome a partir das mesmas constantes que ele usa para decidir.
  // Balancear o `xpShare` de uma raridade muda esta página junto.
  {
    id: 'casa',
    titulo: { pt: 'Casa e XP Share', en: 'House & XP Share', es: 'Casa y XP Share' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>A <b>Casa</b> é o que faz a sua <b>equipe</b> subir junto com o pokémon de batalha. Dentro dela
        ficam os <b>bonecos</b>, e cada boneco é um <b>posto de XP Share</b>: você registra ali
        um pokémon da sua <b>equipe</b>, e ele passa a receber uma fatia do XP que o seu pokémon
        de batalha ganha na hunt.</p>

        <h4>As cinco casas</h4>
        <p>O que muda de uma para a outra é <b>o tamanho da fatia</b>, e não o tamanho da casa.
        Quatro delas têm <b>um posto só</b>; a Lendária é a única com dois:</p>
        ${tabelaDeCasas(c)}

        <h4>Como conseguir uma</h4>
        <p>Dois caminhos, os dois na bancada <b>Fabricar Casa</b> do <b>Professor Carvalho</b>, no
        Centro Pokémon:</p>
        <ul>
          <li><b>Sorteio:</b> <b>${N(custoFragCasa(c), c.lang)} Fragmentos de Chave</b> viram uma casa
          de raridade <b>sorteada</b>, com as chances da tabela — não se escolhe qual vem. É o único
          caminho para a Mítica e a Lendária.</li>
          <li><b>Craft de Casas:</b> casas da mesma raridade viram uma da raridade seguinte —
          ${receitasCraft(c)}. O craft vai <b>só até a ${topoDoCraft(c)}</b>. Você escolhe <b>quais</b>
          entram, pelo número; a casa em uso também serve, menos aquela em que você está dentro e a
          que estiver anunciada no Mercado. As escolhidas somem (no Registro ficam como fundidas), a
          nova nasce com <b>número novo</b> e os postos vazios, e os pokémon que estavam no XP Share
          delas voltam para a sua <b>Coleção</b> — nenhum se perde.</li>
        </ul>

        <p>A Casa <b>não se compra pronta</b> — nasce de fragmentos dropados na Outland, ou do craft
        de outras casas.
        Cada casa sai com um <b>número do servidor</b> — quem tirou a primeira ficou com a
        <b>#000001</b> — e você pode ter <b>quantas quiser</b>. O teto é de <b>uso</b>: até
        <b>${N(maxCasasEmUso(c), c.lang)} casas</b> ficam em uso ao mesmo tempo, cada uma com os seus
        postos, e só elas repartem XP. As outras ficam <b>guardadas</b> — você escolhe quais usar no
        botão <b>Casa</b>, e guardar uma tira do XP Share os pokémon dos postos dela. Casa nova entra
        em uso sozinha enquanto houver vaga.</p>

        ${nota(`<b>Fragmentos de Chave não têm teto por conta.</b> Caem na Outland
        (${pctFragChave(c)} por derrota, ~${mediaFragChave(c)} kills em média).${dicaOutlandTiers(c)} E se compram e
        vendem no <a data-cap="comunidade">Mercado da Comunidade</a>, como a casa pronta.`, 'dica')}

        <p>A <b>casa pronta</b> é negociável — anuncie a sua pelo <b>número</b> na aba Casa do
        Mercado. Ao anunciar, os pokémon dos postos <b>daquela casa</b> saem do XP Share, e não
        voltam se você cancelar o anúncio: a casa volta vazia.</p>

        <h4>Como funciona o XP Share</h4>
        <p>Abra o botão <b>Casa</b> (ou entre nela e clique no boneco) e escolha <b>um pokémon da
        sua equipe</b> para cada posto — <b>um pokémon só ocupa um posto</b>, em todas as suas
        casas. A partir
        daí, a cada selvagem que você derruba, ele recebe a <b>fatia da sua casa</b> (a coluna
        "XP Share" da tabela acima) do XP que o seu pokémon de <b>batalha</b> ganhou naquele
        abate. Os seus multiplicadores de <b>XP de pokémon</b> (boost, VIP, guild, evento) já
        estão dentro desse número.</p>

        <p><b>O registrado não pode ser o que está lutando.</b> Se você registrar o Charizard e
        for caçar com o Charizard, ele não recebe nada — ele já leva o XP inteiro. Registre o
        Charizard e cace com o Squirtle, e é o Charizard que sobe junto.</p>

        <p>A fatia é calculada sobre o <b>XP da hunt em que você está</b>, e é isso que muda tudo
        em relação ao treino antigo: caçando numa hunt de nível 600, 75% de cada abate é muito;
        caçando numa hunt de nível 10, 75% ainda rende — mas bem menos em número absoluto. Um
        pokémon nível 600 registrado enquanto você caça no nível 10 sobe — devagar, mas sobe.</p>

        ${nota(`<b>Ninguém perde XP: a fatia é EXTRA.</b> Este é o mal-entendido mais comum do
        jogo, então vale dito com todas as letras: o seu pokémon de <b>batalha</b> fica com
        <b>100% do XP, sempre</b>. A fatia do XP Share é <b>criada por cima</b> — ela não sai do
        que ele ganhou e não divide nada com ninguém.`, 'atencao')}

        <p>Num abate que dá <b>1.000</b> de XP, com uma casa <b>Rara</b> (75%), o que acontece
        é isto:</p>
        <ul>
          <li>pokémon de <b>batalha</b>: <b>1.000</b> — os 100% de sempre, intactos</li>
          <li>pokémon <b>registrado</b> no boneco: <b>+750</b></li>
          <li>total que entrou na sua conta: <b>1.750</b></li>
        </ul>

        ${nota(`<b>Três limites que valem a pena saber de cor.</b>
        (1) Só a <b>EQUIPE</b> — pokémon parado no Depot não recebe nada (o <b>item</b> Exp.
        Share, logo abaixo, é diferente nisso).
        (2) O <b>treinador</b> não ganha XP extra, e nenhum outro pokémon além do registrado.
        (3) Sem hunt não há fatia: a porcentagem é calculada <b>sobre o XP de um abate</b>, então
        sem abate não há sobre o que calcular. Com a aba fechada, não acontece nada.`)}

        <h4>O item Exp. Share (o que se segura)</h4>
        <p>Existe também um <b>item</b> chamado <b>Exp. Share</b>, comprado na Loja por diamantes.
        Ele não tem nada a ver com a casa nem com os bonecos: ele é <b>segurado</b> por um
        pokémon, e vale sozinho — quem não tem casa nenhuma pode usá-lo.</p>

        <p>Quem estiver segurando um recebe <b>+${pctXpShareHeld(c)}%</b> do XP que o seu pokémon
        de batalha ganhou em cada abate. E vale a mesma regra de cima, que é onde quase todo mundo
        se confunde: <b>não é ${100 - pctXpShareHeld(c)}% para um e ${pctXpShareHeld(c)}% para o
        outro</b>. O de batalha continua com os <b>100%</b>, e os ${pctXpShareHeld(c)}% são um
        acréscimo em cima disso.</p>

        <p>Naquele mesmo abate de <b>1.000</b> de XP, com um pokémon segurando o item:</p>
        <ul>
          <li>pokémon de <b>batalha</b>: <b>1.000</b></li>
          <li>pokémon <b>segurando</b> o Exp. Share: <b>+${Math.round(10 * pctXpShareHeld(c))}</b></li>
        </ul>

        ${nota(`<b>O item funciona no Depot.</b> É a diferença que mais importa em relação aos
        bonecos da casa: o boneco só alimenta pokémon <b>da equipe</b>, e o Exp. Share alimenta
        quem estiver segurando ele, esteja na equipe ou guardado no <b>Depot</b>.`, 'dica')}

        <ul>
          <li><b>Não soma com a casa: é um ou o outro.</b> O mesmo pokémon não pode estar
          registrado num boneco E segurando um Exp. Share — o jogo recusa pelos dois lados. Para
          equipar o item, tire-o do posto antes; para registrá-lo no boneco, remova o item
          antes.</li>
          <li><b>Cada item rende os seus ${pctXpShareHeld(c)}%.</b> Dois pokémon segurando dois
          Exp. Share ganham ${pctXpShareHeld(c)}% cada um — eles não repartem entre si.</li>
          <li><b>Quem está lutando não ganha o próprio bônus.</b> Se o pokémon de batalha estiver
          segurando o item, ele não recebe nada a mais: já leva os 100%.</li>
          <li><b>Não é negociável.</b> O Exp. Share nasce na Loja e morre na conta que comprou —
          não vai para o Mercado.</li>
          <li><b>Trocar de portador tem espera de 1 minuto</b> entre equipar e desequipar.</li>
        </ul>

        ${nota(`<b>A escolha fica guardada.</b> Diferente do treino antigo, sair do jogo não
        esvazia os postos — quando você voltar, o mesmo pokémon continua registrado. O posto só
        se esvazia sozinho se aquele pokémon sair da equipe, for vendido ou for para a
        vitrine.`, 'dica')}

        <h4>Entrar em casa</h4>
        <p>Pelo botão <b>Casa</b>, em qualquer uma das suas — mas só <b>a partir do Centro
        Pokémon</b> (ou de dentro de outra casa): elas ficam em Cerulean. Lá dentro você anda com
        <b>W A S D</b>, vê quem está registrado ao lado de cada boneco e tem os botões
        <b>Escolher pokémon</b> e <b>Sair de casa</b>. Entrar é só para <b>escolher</b>: o XP
        Share já estava valendo, e sair não interrompe nada.</p>`,
      en: `
        <p>The <b>House</b> is what makes your <b>team</b> level alongside your battling pokémon. Inside it are
        the <b>dummies</b>, and each dummy is an <b>XP Share post</b>: you register one pokémon
        from your <b>team</b> there, and it starts receiving a share of the XP your battling
        pokémon earns on the hunt.</p>

        <h4>The five houses</h4>
        <p>What changes between them is <b>the size of the share</b>, not the size of the house.
        Four of them hold <b>a single post</b>; the Legendary is the only one with two:</p>
        ${tabelaDeCasas(c)}

        <h4>How to get one</h4>
        <p>Two paths, both at the <b>Craft House</b> bench at <b>Professor Oak</b>, in the Pokémon
        Center:</p>
        <ul>
          <li><b>Roll:</b> <b>${N(custoFragCasa(c), c.lang)} Key Fragments</b> become a house of
          <b>rolled</b> rarity, with the odds in the table — you don't pick which one you get. It is the
          only path to Mythic and Legendary.</li>
          <li><b>House Craft:</b> houses of the same rarity become one of the next rarity —
          ${receitasCraft(c)}. Crafting goes <b>only up to ${topoDoCraft(c)}</b>. You choose
          <b>which</b> ones go in, by number; the house in use counts too, except the one you are
          inside and one listed on the Market. The chosen ones are gone (the registry marks them as
          merged), the new one is born with a <b>new number</b> and empty posts, and the pokémon that
          were on their XP Share go back to your <b>Collection</b> — none is lost.</li>
        </ul>

        <p>A House <b>cannot be bought ready-made</b> — it comes from fragments dropped in Outland,
        or from crafting other houses. Every house comes with a <b>server number</b> — whoever rolled the first one got
        <b>#000001</b> — and you can own <b>as many as you like</b>. The cap is on <b>use</b>: up to
        <b>${N(maxCasasEmUso(c), c.lang)} houses</b> are in use at the same time, each with its own
        posts, and only they share XP. The rest stay <b>stored</b> — you pick which ones to use from
        the <b>House</b> button, and storing one takes the pokémon on its posts out of XP Share. A new
        house goes into use on its own while there is a free spot.</p>

        ${nota(`<b>Key Fragments have no per-account cap.</b> They drop in Outland
        (${pctFragChave(c)} per kill, ~${mediaFragChave(c)} kills on average).${dicaOutlandTiers(c)} They are also
        bought and sold on the <a data-cap="comunidade">Community Market</a>, like the finished house.`, 'dica')}

        <p>The <b>finished house</b> is tradeable — list it by its <b>number</b> on the House tab.
        When you list it, the pokémon on <b>that house's</b> posts leave XP Share, and they don't come
        back if you cancel the listing: the house returns empty.</p>

        <h4>How XP Share works</h4>
        <p>Open the <b>House</b> button (or go inside and click the dummy) and pick <b>one pokémon
        from your team</b> for each post — <b>a pokémon holds only one post</b>, across all your
        houses. From
        then on, every wild you knock down gives it <b>your house's share</b> (the "XP Share"
        column above) of the XP your <b>battling</b> pokémon earned on that kill. Your
        <b>pokémon XP</b> multipliers (boost, VIP, guild, event) are already inside that number.</p>

        <p><b>The registered one cannot be the one fighting.</b> Register Charizard and go hunting
        with Charizard, and it gets nothing — it already takes the full XP. Register Charizard and
        hunt with Squirtle, and Charizard is the one levelling alongside.</p>

        <p>The share is calculated on <b>the XP of the hunt you are actually on</b>, and that is
        what changes everything versus the old training: on a level 600 hunt, 75% of every kill is
        a lot; on a level 10 hunt, 75% still pays — but much less in absolute numbers. A level 600
        pokémon registered while you hunt at level 10 still levels — slowly, but it does.</p>

        ${nota(`<b>Nobody loses XP: the share is EXTRA.</b> This is the most common
        misunderstanding in the game, so here it is in plain words: your <b>battling</b> pokémon
        keeps <b>100% of the XP, always</b>. The XP Share slice is <b>created on top</b> — it does
        not come out of what it earned, and it splits nothing with anyone.`, 'atencao')}

        <p>On a kill worth <b>1,000</b> XP, with a <b>Rare</b> house (75%), what happens is:</p>
        <ul>
          <li><b>battling</b> pokémon: <b>1,000</b> — the usual 100%, untouched</li>
          <li>pokémon <b>registered</b> at the dummy: <b>+750</b></li>
          <li>total credited to your account: <b>1,750</b></li>
        </ul>

        ${nota(`<b>Three limits worth memorising.</b>
        (1) <b>TEAM</b> only — a pokémon sitting in the Depot gets nothing (the Exp. Share
        <b>item</b>, just below, differs on exactly this).
        (2) The <b>trainer</b> gains no extra XP, and neither does anyone but the registered one.
        (3) No hunt, no share: the percentage is worked out <b>on the XP of a kill</b>, so with no
        kill there is nothing to work it out on. With the tab closed, nothing happens.`)}

        <h4>The Exp. Share item (the held one)</h4>
        <p>There is also an <b>item</b> called <b>Exp. Share</b>, bought in the Shop with diamonds.
        It has nothing to do with the house or the dummies: it is <b>held</b> by a pokémon and
        works on its own — you can use it with no house at all.</p>

        <p>Whoever holds one gets <b>+${pctXpShareHeld(c)}%</b> of the XP your battling pokémon
        earned on each kill. And the rule above applies here too, which is where nearly everyone
        gets confused: <b>it is not ${100 - pctXpShareHeld(c)}% for one and ${pctXpShareHeld(c)}%
        for the other</b>. The battler still keeps the full <b>100%</b>, and the
        ${pctXpShareHeld(c)}% is added on top of that.</p>

        <p>On that same <b>1,000</b> XP kill, with a pokémon holding the item:</p>
        <ul>
          <li><b>battling</b> pokémon: <b>1,000</b></li>
          <li>pokémon <b>holding</b> the Exp. Share: <b>+${Math.round(10 * pctXpShareHeld(c))}</b></li>
        </ul>

        ${nota(`<b>The item works in the Depot.</b> That is the difference that matters most
        against the house dummies: a dummy only feeds a pokémon <b>on your team</b>, while the
        Exp. Share feeds whoever holds it, on the team or stored in the <b>Depot</b>.`, 'dica')}

        <ul>
          <li><b>It does not stack with the house: it is one or the other.</b> The same pokémon
          cannot be registered at a dummy AND holding an Exp. Share — the game refuses it from
          both sides. To equip the item, take it off the post first; to register it at the dummy,
          remove the item first.</li>
          <li><b>Each item pays its own ${pctXpShareHeld(c)}%.</b> Two pokémon holding two
          Exp. Shares get ${pctXpShareHeld(c)}% each — they do not split it between them.</li>
          <li><b>The one fighting gets no bonus of its own.</b> If the battling pokémon is holding
          the item, it receives nothing extra: it already takes the 100%.</li>
          <li><b>Not tradeable.</b> The Exp. Share is born in the Shop and dies on the account
          that bought it — it never reaches the Market.</li>
          <li><b>Switching holders has a 1-minute wait</b> between equipping and unequipping.</li>
        </ul>

        ${nota(`<b>Your pick is remembered.</b> Unlike the old training, logging out doesn't empty
        the posts — the same pokémon is still registered when you come back. A post only clears
        itself if that pokémon leaves the team, is sold, or goes to the market.`, 'dica')}

        <h4>Entering the house</h4>
        <p>From the <b>House</b> button, into any of yours — but only <b>from the Pokémon Center</b>
        (or from inside another house): they are in Cerulean. Inside you walk with
        <b>W A S D</b>, see who is registered next to each dummy, and get the <b>Pick a
        pokémon</b> and <b>Leave house</b> buttons. Going in is just to <b>choose</b>: XP Share
        was already running, and leaving doesn't interrupt anything.</p>`,
      es: `
        <p>La <b>Casa</b> es lo que hace subir a tu <b>equipo</b> junto con el pokémon de batalla. Dentro están los
        <b>muñecos</b>, y cada muñeco es un <b>puesto de XP Share</b>: registras ahí un pokémon de
        tu <b>equipo</b>, y pasa a recibir una porción de la XP que tu pokémon de batalla gana en
        la hunt.</p>

        <h4>Las cinco casas</h4>
        <p>Lo que cambia de una a otra es <b>el tamaño de la porción</b>, no el tamaño de la casa.
        Cuatro tienen <b>un solo puesto</b>; la Legendaria es la única con dos:</p>
        ${tabelaDeCasas(c)}

        <h4>Cómo conseguir una</h4>
        <p>Dos caminos, los dos en el banco <b>Fabricar Casa</b> del <b>Profesor Oak</b>, en el
        Centro Pokémon:</p>
        <ul>
          <li><b>Sorteo:</b> <b>${N(custoFragCasa(c), c.lang)} Fragmentos de Llave</b> se vuelven una
          casa de rareza <b>sorteada</b>, con las probabilidades de la tabla — no se elige cuál sale.
          Es el único camino a la Mítica y la Legendaria.</li>
          <li><b>Craft de Casas:</b> casas de la misma rareza se vuelven una de la rareza siguiente —
          ${receitasCraft(c)}. El craft llega <b>solo hasta la ${topoDoCraft(c)}</b>. Tú eliges
          <b>cuáles</b> entran, por el número; la casa en uso también sirve, menos aquella en la que
          estás dentro y la que esté anunciada en el Mercado. Las elegidas desaparecen (en el Registro
          quedan como fundidas), la nueva nace con <b>número nuevo</b> y los puestos vacíos, y los
          pokémon que estaban en su XP Share vuelven a tu <b>Colección</b> — ninguno se pierde.</li>
        </ul>

        <p>La Casa <b>no se compra hecha</b> — nace de fragmentos que caen en Outland, o del craft de
        otras casas.
        Cada casa sale con un <b>número del servidor</b> — quien sacó la primera se quedó con la
        <b>#000001</b> — y puedes tener <b>todas las que quieras</b>. El tope es de <b>uso</b>: hasta
        <b>${N(maxCasasEmUso(c), c.lang)} casas</b> están en uso al mismo tiempo, cada una con sus
        puestos, y solo ellas reparten XP. Las demás quedan <b>guardadas</b> — eliges cuáles usar en el
        botón <b>Casa</b>, y guardar una saca del XP Share a los pokémon de sus puestos. Una casa nueva
        entra en uso sola mientras haya hueco.</p>

        ${nota(`<b>Los Fragmentos de Llave no tienen límite por cuenta.</b> Caen en Outland
        (${pctFragChave(c)} por derrota, ~${mediaFragChave(c)} kills de media).${dicaOutlandTiers(c)} Y se compran y
        venden en el <a data-cap="comunidade">Mercado de la Comunidad</a>, como la casa terminada.`, 'dica')}

        <p>La <b>casa terminada</b> sí es negociable — anúnciala por su <b>número</b> en la pestaña
        Casa. Al anunciarla, los pokémon de los puestos <b>de esa casa</b> salen del XP Share, y no
        vuelven si cancelas el anuncio: la casa vuelve vacía.</p>

        <h4>Cómo funciona el XP Share</h4>
        <p>Abre el botón <b>Casa</b> (o entra y haz clic en el muñeco) y elige <b>un pokémon de tu
        equipo</b> para cada puesto — <b>un pokémon solo ocupa un puesto</b>, en todas tus casas.
        Desde
        ahí, cada salvaje que derribas le da la <b>porción de tu casa</b> (la columna "XP Share"
        de la tabla de arriba) de la XP que tu pokémon de <b>batalla</b> ganó en esa derrota. Tus
        multiplicadores de <b>XP de pokémon</b> (boost, VIP, guild, evento) ya están dentro de ese
        número.</p>

        <p><b>El registrado no puede ser el que está peleando.</b> Si registras al Charizard y
        cazas con el Charizard, no recibe nada — ya se lleva la XP entera. Registra al Charizard y
        caza con el Squirtle, y es el Charizard el que sube en paralelo.</p>

        <p>La porción se calcula sobre el <b>XP de la hunt en la que estás</b>, y eso lo cambia
        todo respecto al entrenamiento antiguo: cazando en una hunt de nivel 600, el 75% de cada
        derrota es mucho; en una de nivel 10, el 75% sigue pagando — pero mucho menos en números
        absolutos. Un pokémon nivel 600 registrado mientras cazas en nivel 10 sube — despacio,
        pero sube.</p>

        ${nota(`<b>Nadie pierde XP: la porción es EXTRA.</b> Este es el malentendido más común del
        juego, así que va con todas las letras: tu pokémon de <b>batalla</b> se queda con el
        <b>100% del XP, siempre</b>. La porción del XP Share se <b>crea por encima</b> — no sale
        de lo que él ganó y no reparte nada con nadie.`, 'atencao')}

        <p>En una derrota que da <b>1.000</b> de XP, con una casa <b>Rara</b> (75%), pasa esto:</p>
        <ul>
          <li>pokémon de <b>batalla</b>: <b>1.000</b> — el 100% de siempre, intacto</li>
          <li>pokémon <b>registrado</b> en el muñeco: <b>+750</b></li>
          <li>total que entró en tu cuenta: <b>1.750</b></li>
        </ul>

        ${nota(`<b>Tres límites que conviene saber.</b>
        (1) Solo el <b>EQUIPO</b> — un pokémon parado en el Depot no recibe nada (el <b>ítem</b>
        Exp. Share, aquí abajo, se diferencia justo en eso).
        (2) El <b>entrenador</b> no gana XP extra, y ningún otro pokémon salvo el registrado.
        (3) Sin hunt no hay porción: el porcentaje se calcula <b>sobre el XP de una derrota</b>,
        así que sin derrota no hay sobre qué calcular. Con la pestaña cerrada no pasa nada.`)}

        <h4>El ítem Exp. Share (el que se lleva)</h4>
        <p>También existe un <b>ítem</b> llamado <b>Exp. Share</b>, comprado en la Tienda con
        diamantes. No tiene nada que ver con la casa ni con los muñecos: lo <b>lleva</b> un pokémon
        y funciona solo — se puede usar sin tener casa alguna.</p>

        <p>Quien lo lleve recibe <b>+${pctXpShareHeld(c)}%</b> del XP que tu pokémon de batalla
        ganó en cada derrota. Y vale la misma regla de arriba, que es donde casi todos se
        confunden: <b>no es ${100 - pctXpShareHeld(c)}% para uno y ${pctXpShareHeld(c)}% para el
        otro</b>. El de batalla sigue con el <b>100%</b>, y el ${pctXpShareHeld(c)}% es un añadido
        encima de eso.</p>

        <p>En esa misma derrota de <b>1.000</b> de XP, con un pokémon llevando el ítem:</p>
        <ul>
          <li>pokémon de <b>batalla</b>: <b>1.000</b></li>
          <li>pokémon que <b>lleva</b> el Exp. Share: <b>+${Math.round(10 * pctXpShareHeld(c))}</b></li>
        </ul>

        ${nota(`<b>El ítem funciona en el Depot.</b> Es la diferencia que más importa frente a los
        muñecos de la casa: el muñeco solo alimenta a un pokémon <b>del equipo</b>, mientras que el
        Exp. Share alimenta a quien lo lleve, esté en el equipo o guardado en el
        <b>Depot</b>.`, 'dica')}

        <ul>
          <li><b>No se acumula con la casa: es uno o el otro.</b> El mismo pokémon no puede estar
          registrado en un muñeco Y llevando un Exp. Share — el juego lo rechaza por los dos
          lados. Para equipar el ítem, sácalo del puesto antes; para registrarlo en el muñeco,
          quita el ítem antes.</li>
          <li><b>Cada ítem rinde su ${pctXpShareHeld(c)}%.</b> Dos pokémon llevando dos Exp. Share
          ganan ${pctXpShareHeld(c)}% cada uno — no lo reparten entre sí.</li>
          <li><b>El que está peleando no gana su propio bono.</b> Si el pokémon de batalla lleva el
          ítem, no recibe nada de más: ya se lleva el 100%.</li>
          <li><b>No es negociable.</b> El Exp. Share nace en la Tienda y muere en la cuenta que lo
          compró — no llega al Mercado.</li>
          <li><b>Cambiar de portador tiene una espera de 1 minuto</b> entre equipar y desequipar.</li>
        </ul>

        ${nota(`<b>Tu elección queda guardada.</b> A diferencia del entrenamiento antiguo, salir
        del juego no vacía los puestos — al volver, el mismo pokémon sigue registrado. Un puesto
        solo se vacía solo si ese pokémon sale del equipo, se vende o va al mercado.`, 'dica')}

        <h4>Entrar en casa</h4>
        <p>Desde el botón <b>Casa</b>, en cualquiera de las tuyas — pero solo <b>desde el Centro
        Pokémon</b> (o desde dentro de otra casa): están en Cerulean. Dentro caminas con
        <b>W A S D</b>, ves quién está registrado junto a cada muñeco y tienes los botones
        <b>Elegir pokémon</b> y <b>Salir de casa</b>. Entrar es solo para <b>elegir</b>: el XP
        Share ya estaba valiendo, y salir no interrumpe nada.</p>`,
    }),
  },

  // ------------------------------------------------------------- Bicicletas
  //
  // Logo depois da Casa: são as duas coisas que o Professor Carvalho fabrica com fragmento da
  // Outland, com a mesma escada de raridade. Números todos de `estado.bicicletas`.
  {
    id: 'bicicletas',
    titulo: { pt: 'Bicicletas', en: 'Bicycles', es: 'Bicicletas' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>A <b>bicicleta</b> é a progressão de <b>mobilidade</b> do jogo. Na hunt, boa parte do tempo
        o seu pokémon está <b>andando</b> de um selvagem até o outro — e é esse caminho que ela
        encurta. Vale para o <b>pokémon</b> e para o <b>treinador</b>, na hunt e na praça de
        Cerulean.</p>

        <h4>As cinco bicicletas</h4>
        <p>A raridade decide o quanto ela acelera. "Tempo de cada passo" é quanto um passo leva
        comparado a andar a pé (100%): na Lendária, o passo dura a <b>metade</b>.</p>
        ${tabelaDeBicicletas(c)}

        <h4>Como conseguir uma</h4>
        <p>Todo abate na <b>Outland</b> pode soltar um <b>Fragmento de Bicicleta</b>
        (${P(chanceFragBike(c), c.lang)} por derrota, ~${N(Math.round(1 / chanceFragBike(c)), c.lang)}
        kills em média).${dicaOutlandTiers(c)} O Loot Boost também aumenta a chance.</p>

        <p>Com <b>${N(custoFragBike(c), c.lang)} fragmentos</b>, a bancada <b>Fabricar Bicicleta</b> do
        <b>Professor Carvalho</b>, no Centro Pokémon, monta uma bicicleta. A raridade é
        <b>sorteada</b>, com as chances da tabela acima — as mesmas da <a data-cap="casa">Casa</a>.</p>
        <p>Na mesma bancada fica o <b>Craft de Bicicletas</b>, com a receita da Casa:
        ${receitasCraft(c)} — só até a ${topoDoCraft(c)}; Mítica e Lendária saem apenas do sorteio.
        Você escolhe as bicicletas pelo número (a equipada também serve; a anunciada no Mercado,
        não), elas somem e nasce uma com número novo. Se a equipada entrou no craft, a nova já sai
        <b>equipada</b>.</p>

        <p>Cada bicicleta sai com um <b>número do servidor</b> — a primeira tirada é a <b>#000001</b> —,
        e é por ele que ela se equipa e se anuncia. O <b>Registro de Bikes</b>, no botão <b>Casa</b>,
        mostra todas as bikes já abertas, quem tirou cada uma e quais estão à venda.</p>

        <p>Bicicleta e fragmento são <b>negociáveis</b>: os dois se compram e vendem no
        <a data-cap="comunidade">Mercado da Comunidade</a>. Tirou uma <b>Lendária</b>? O chat Mundo
        inteiro fica sabendo.</p>

        <h4>Equipar</h4>
        <p>Clique na bicicleta em <b>Mochila → Itens Raros</b>. Você pode ter <b>quantas quiser</b>, de
        qualquer raridade, mas só <b>uma fica equipada</b> — e só a equipada vale.</p>

        ${nota(`<b>As porcentagens não somam.</b> Uma ${NOME_RARIDADE.comum.pt}, uma
        ${NOME_RARIDADE.incomum.pt} e uma ${NOME_RARIDADE.lendaria.pt} na mochila, com a
        ${NOME_RARIDADE.comum.pt} equipada, é andar a <b>+${pctBike(c, 0)}%</b> — não a
        +${pctBike(c, 0) + pctBike(c, 1) + pctBike(c, 4)}%. Equipe sempre a melhor que você tem.`, 'atencao')}

        <ul>
          <li><b>Trocar tem espera de ${N(minTrocaBike(c), c.lang)} minutos.</b> Equipar outra ou
          guardar a equipada trava a troca seguinte por esse tempo, e sair do jogo não zera a
          espera.</li>
          <li><b>Anunciar a equipada no Mercado</b> tira ela do seu pé na hora: você volta a andar a pé
          até equipar outra — mesmo tendo outra da mesma raridade na mochila. Cancelar o anúncio a devolve
          já equipada.</li>
        </ul>

        <h4>Onde ela NÃO vale</h4>
        <p>A bicicleta só encurta a <b>caminhada</b>. Ela não muda dano, cooldown de golpe nem
        alcance, e não vale no <b>PvP</b>, no <b>Ginásio</b>, na <b>Guild</b> nem na arena do
        <b>Boss</b> — esses modos rodam em simuladores próprios, e lá todo mundo anda na mesma
        velocidade.</p>

        ${nota(`<b>Ela rende mais onde o spawn é espaçado.</b> Numa hunt apertada, com um selvagem
        colado no outro, o passo quase não aparece; na <b>Outland</b>, onde se anda muito entre um e
        outro, a bike vira mais abates por hora. De <b>Unova em diante</b>, os selvagens nascem em bandos
        espalhados e a bike rende o mesmo ganho em qualquer área.`, 'dica')}`,
      en: `
        <p>The <b>bicycle</b> is the game's <b>mobility</b> progression. On a hunt, your pokémon spends
        a good part of the time <b>walking</b> from one wild pokémon to the next — and that walk is
        what it shortens. It works for the <b>pokémon</b> and for the <b>trainer</b>, on the hunt and
        in the Cerulean plaza.</p>

        <h4>The five bicycles</h4>
        <p>The rarity decides how much faster you go. "Time per step" is how long a step takes compared
        with walking (100%): on the Legendary, a step takes <b>half</b> as long.</p>
        ${tabelaDeBicicletas(c)}

        <h4>How to get one</h4>
        <p>Every kill in <b>Outland</b> can drop a <b>Bicycle Fragment</b>
        (${P(chanceFragBike(c), c.lang)} per kill, ~${N(Math.round(1 / chanceFragBike(c)), c.lang)}
        kills on average).${dicaOutlandTiers(c)} Loot Boost raises the chance too.</p>

        <p>With <b>${N(custoFragBike(c), c.lang)} fragments</b>, the <b>Craft Bicycle</b> bench at
        <b>Professor Oak</b>, in the Pokémon Center, builds a bicycle. The rarity is <b>rolled</b>,
        with the odds in the table above — the same as the <a data-cap="casa">House</a>.</p>
        <p>The same bench holds the <b>Bicycle Craft</b>, with the House's recipe: ${receitasCraft(c)}
        — only up to ${topoDoCraft(c)}; Mythic and Legendary come only from the roll. You pick the
        bicycles by number (the equipped one counts; one listed on the Market does not), they are
        gone and one with a new number is born. If the equipped one went into the craft, the new one
        comes out <b>already equipped</b>.</p>

        <p>Every bicycle comes with a <b>server number</b> — the first one rolled is <b>#000001</b> —,
        and that number is how you equip and list it. The <b>Bike registry</b>, under the <b>House</b>
        button, shows every bike ever opened, who rolled each one and which are for sale.</p>

        <p>Bicycles and fragments are <b>tradeable</b>: both are bought and sold on the
        <a data-cap="comunidade">Community Market</a>. Got a <b>Legendary</b>? The whole World chat
        finds out.</p>

        <h4>Equipping</h4>
        <p>Click the bicycle in <b>Backpack → Rare Items</b>. You can own <b>as many as you like</b>, of any
        rarity, but only <b>one is equipped</b> — and only the equipped one counts.</p>

        ${nota(`<b>The percentages do not stack.</b> A ${NOME_RARIDADE.comum.en}, an
        ${NOME_RARIDADE.incomum.en} and a ${NOME_RARIDADE.lendaria.en} in the backpack, with the
        ${NOME_RARIDADE.comum.en} equipped, is riding at <b>+${pctBike(c, 0)}%</b> — not
        +${pctBike(c, 0) + pctBike(c, 1) + pctBike(c, 4)}%. Always equip the best one you have.`, 'atencao')}

        <ul>
          <li><b>Switching has a ${N(minTrocaBike(c), c.lang)}-minute wait.</b> Equipping another one or
          storing the equipped one locks the next switch for that long, and logging out does not reset
          the wait.</li>
          <li><b>Listing the equipped one on the Market</b> takes it off you right away: you are back on
          foot until you equip another — even with another of the same rarity in your backpack. Cancelling
          the listing gives it back already equipped.</li>
        </ul>

        <h4>Where it does NOT count</h4>
        <p>The bicycle only shortens the <b>walk</b>. It does not change damage, move cooldown or range,
        and it does not count in <b>PvP</b>, <b>Gyms</b>, <b>Guild</b> or the <b>Boss</b> arena — those
        modes run on their own simulators, where everyone walks at the same speed.</p>

        ${nota(`<b>It pays off most where spawns are spread out.</b> On a tight hunt, with wild pokémon
        right next to each other, the step barely shows; in <b>Outland</b>, where you walk a lot between
        them, the bike turns into more kills per hour. From <b>Unova onward</b>, wild pokémon spawn in
        spread-out packs and the bike gives the same boost in every area.`, 'dica')}`,
      es: `
        <p>La <b>bicicleta</b> es la progresión de <b>movilidad</b> del juego. En la caza, buena parte
        del tiempo tu pokémon está <b>caminando</b> de un salvaje al siguiente — y es ese camino el que
        ella acorta. Vale para el <b>pokémon</b> y para el <b>entrenador</b>, en la caza y en la plaza
        de Cerulean.</p>

        <h4>Las cinco bicicletas</h4>
        <p>La rareza decide cuánto acelera. "Tiempo de cada paso" es cuánto dura un paso comparado con
        ir a pie (100%): en la Legendaria, el paso dura la <b>mitad</b>.</p>
        ${tabelaDeBicicletas(c)}

        <h4>Cómo conseguir una</h4>
        <p>Cada derrota en <b>Outland</b> puede soltar un <b>Fragmento de Bicicleta</b>
        (${P(chanceFragBike(c), c.lang)} por derrota, ~${N(Math.round(1 / chanceFragBike(c)), c.lang)}
        kills de media).${dicaOutlandTiers(c)} El Loot Boost también sube la probabilidad.</p>

        <p>Con <b>${N(custoFragBike(c), c.lang)} fragmentos</b>, el banco <b>Fabricar Bicicleta</b> del
        <b>Profesor Oak</b>, en el Centro Pokémon, arma una bicicleta. La rareza se <b>sortea</b>, con
        las probabilidades de la tabla — las mismas de la <a data-cap="casa">Casa</a>.</p>
        <p>En el mismo banco está el <b>Craft de Bicicletas</b>, con la receta de la Casa:
        ${receitasCraft(c)} — solo hasta la ${topoDoCraft(c)}; la Mítica y la Legendaria salen solo
        del sorteo. Eliges las bicicletas por el número (la equipada también sirve; la anunciada en el
        Mercado, no), desaparecen y nace una con número nuevo. Si la equipada entró en el craft, la
        nueva ya sale <b>equipada</b>.</p>

        <p>Cada bicicleta sale con un <b>número del servidor</b> — la primera es la <b>#000001</b> —, y
        por ese número se equipa y se anuncia. El <b>Registro de Bicis</b>, en el botón <b>Casa</b>,
        muestra todas las bicis abiertas, quién sacó cada una y cuáles están en venta.</p>

        <p>Bicicleta y fragmento son <b>negociables</b>: los dos se compran y venden en el
        <a data-cap="comunidade">Mercado de la Comunidad</a>. ¿Te salió una <b>Legendaria</b>? Todo el
        chat Mundo se entera.</p>

        <h4>Equipar</h4>
        <p>Haz clic en la bicicleta en <b>Mochila → Objetos raros</b>. Puedes tener <b>todas las que
        quieras</b>, de cualquier rareza, pero solo <b>una queda equipada</b> — y solo la equipada
        vale.</p>

        ${nota(`<b>Los porcentajes no se suman.</b> Una ${NOME_RARIDADE.comum.es}, una
        ${NOME_RARIDADE.incomum.es} y una ${NOME_RARIDADE.lendaria.es} en la mochila, con la
        ${NOME_RARIDADE.comum.es} equipada, es ir a <b>+${pctBike(c, 0)}%</b> — no a
        +${pctBike(c, 0) + pctBike(c, 1) + pctBike(c, 4)}%. Equipa siempre la mejor que tengas.`, 'atencao')}

        <ul>
          <li><b>Cambiar tiene una espera de ${N(minTrocaBike(c), c.lang)} minutos.</b> Equipar otra o
          guardar la equipada bloquea el cambio siguiente durante ese tiempo, y salir del juego no
          reinicia la espera.</li>
          <li><b>Anunciar la equipada en el Mercado</b> te la quita en el acto: vuelves a ir a pie hasta
          equipar otra — aunque tengas otra de la misma rareza en la mochila. Cancelar el anuncio te la
          devuelve ya equipada.</li>
        </ul>

        <h4>Dónde NO vale</h4>
        <p>La bicicleta solo acorta la <b>caminata</b>. No cambia daño, cooldown de golpe ni alcance, y
        no vale en <b>PvP</b>, <b>Gimnasio</b>, <b>Guild</b> ni en la arena del <b>Boss</b> — esos modos
        corren en simuladores propios, y ahí todos caminan a la misma velocidad.</p>

        ${nota(`<b>Rinde más donde el spawn está espaciado.</b> En una caza apretada, con un salvaje
        pegado al otro, el paso casi no se nota; en <b>Outland</b>, donde se camina mucho entre uno y
        otro, la bici se convierte en más derrotas por hora. Desde <b>Unova en adelante</b>, los salvajes
        nacen en grupos repartidos y la bici rinde lo mismo en cualquier zona.`, 'dica')}`,
    }),
  },

  // ------------------------------------------------------- 13c. chocadeira e ovos
  //
  // Os três ovos, as chocadeiras e o Absorb Bulb saem de `shared/chocadeira.mjs` — a mesma tabela
  // que o Market NPC vende e que o servidor choca. Mudou preço ou hora lá, muda aqui.
  {
    id: 'chocadeira',
    titulo: { pt: 'Chocadeira e Mystery Eggs', en: 'Incubator and Mystery Eggs', es: 'Incubadora y Mystery Eggs' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>O <a data-cap="market">Market</a> vende <b>Mystery Eggs</b>, e a <b>Chocadeira</b> choca: em
        algumas horas — contadas <b>mesmo com você offline</b> — o ovo abre e nasce um <b>pokémon
        surpresa</b>, direto na sua <b>Coleção</b>, com a <b>potência do ovo garantida</b>.</p>

        <h4>Os três ovos</h4>
        ${tabelaDeOvos(c)}
        <p>Ficam no <b>Market → Ovos</b>. Comprado, o ovo vai para <b>Mochila → Itens Raros</b>; de lá, um
        clique o leva a uma chocadeira livre (<b>Mochila → Chocadeira</b>). O ovo é da sua conta: <b>não
        vai ao Mercado da Comunidade</b>.</p>
        <p>Há um quarto ovo que o Market não vende: o <a data-cap="ovoShiny">Ovo Shiny</a>, fabricado no
        Professor Carvalho com fragmentos que caem nas hunts de Unova para frente (e negociável no
        Mercado da Comunidade). Ele choca na mesma chocadeira, em
        ${N(Math.round(OVO_SHINY.horas / 24), c.lang)} dias, e nasce sempre shiny.</p>

        <h4>O que pode nascer</h4>
        <ul>
          <li>Uma espécie sorteada entre <b>todas as que têm hunt no Mapa</b>, de qualquer região, com a
          <b>mesma chance</b> para cada uma — um Magikarp e um pokémon de hunt alta saem igual.</li>
          <li><b>Nunca</b> sai da Outland, nem <b>Lendário</b>, <b>Mítico</b> ou <b>Mega</b> — esses
          têm os caminhos deles (a <a data-cap="mistico">Arena Mística</a> e a
          <a data-cap="mega">Mega Stone</a>).</li>
          <li>A <b>potência</b> é a do ovo. <b>Qualidade, IV e shiny</b> rolam como numa captura — o
          shiny inclusive, com a mesma chance.</li>
          <li>O <b>nível</b> é o da hunt da espécie, com o mesmo teto da captura (ver
          <a data-cap="captura">Captura</a>).</li>
        </ul>
        <p>O canal 🥚┃radar-do-ovo do nosso Discord anuncia quem chocou, qual ovo e o pokémon que
        saiu.</p>

        <h4>As chocadeiras</h4>
        <p>Toda conta tem <b>${CHOCADEIRAS_GRATIS}</b>, e dá para ter até <b>${CHOCADEIRAS_MAX}</b>: cada uma a
        mais custa <b>${PRECO_CHOCADEIRA_DIAMANTES} 💎</b> na <a data-cap="loja">Loja</a> e fica na
        conta <b>para sempre</b> — não é item, não vai à mochila e não se vende. Cada chocadeira choca um
        ovo por vez.</p>

        <h4>Absorb Bulb — aquecer um ovo</h4>
        <p>Por <b>${PRECO_BULBO_DIAMANTES} 💎</b>, a lamparina <b>aquece UM ovo</b> que já está chocando: ele
        abre <b>${PCT_BULBO}% mais rápido</b> (a coluna "Aquecido" da tabela). Quando o ovo choca, a
        lamparina <b>quebra junto</b> — o próximo ovo pede outra.</p>
        <ul>
          <li>Só se acende <b>com o ovo dentro</b>: não dá para comprar antes e guardar.</li>
          <li>Um ovo já aquecido não aceita outra, e um que já vai abrir também não — seria pagar por um
          desconto que não existe.</li>
        </ul>`,
      en: `
        <p>The <a data-cap="market">Market</a> sells <b>Mystery Eggs</b>, and the <b>Incubator</b>
        hatches them: in a few hours — counted <b>even while you are offline</b> — the egg opens and a
        <b>surprise pokémon</b> is born, straight into your <b>Collection</b>, with the <b>egg's potency
        guaranteed</b>.</p>

        <h4>The three eggs</h4>
        ${tabelaDeOvos(c)}
        <p>They are in <b>Market → Eggs</b>. Once bought, the egg goes to <b>Backpack → Rare Items</b>; from
        there, one click takes it to a free incubator (<b>Backpack → Incubator</b>). The egg belongs to your
        account: it <b>does not go to the Community Market</b>.</p>
        <p>There is a fourth egg the Market doesn't sell: the <a data-cap="ovoShiny">Shiny Egg</a>, crafted
        at Professor Oak from fragments that drop in hunts from Unova onward (and tradable on the
        Community Market). It hatches in the same incubator, in
        ${N(Math.round(OVO_SHINY.horas / 24), c.lang)} days, and is always shiny.</p>

        <h4>What can hatch</h4>
        <ul>
          <li>A species drawn from <b>every species with a hunt on the Map</b>, from any region, with the
          <b>same chance</b> for each — a Magikarp and a high-level hunt pokémon come out alike.</li>
          <li>It <b>never</b> comes from Outland, and is never a <b>Legendary</b>, <b>Mythical</b> or
          <b>Mega</b> — those have their own paths (the <a data-cap="mistico">Mystic Arena</a> and the
          <a data-cap="mega">Mega Stone</a>).</li>
          <li>The <b>potency</b> is the egg's. <b>Quality, IV and shiny</b> roll as in a catch — shiny
          included, at the same chance.</li>
          <li>The <b>level</b> is the species' hunt level, with the same cap as catching (see
          <a data-cap="captura">Catching</a>).</li>
        </ul>
        <p>The 🥚┃radar-do-ovo channel on our Discord announces who hatched, which egg and the
        pokémon that came out.</p>

        <h4>The incubators</h4>
        <p>Every account has <b>${CHOCADEIRAS_GRATIS}</b>, and you can have up to <b>${CHOCADEIRAS_MAX}</b>:
        each extra one costs <b>${PRECO_CHOCADEIRA_DIAMANTES} 💎</b> in the <a data-cap="loja">Shop</a> and
        stays on the account <b>forever</b> — it is not an item, does not go to the backpack and cannot be
        sold. Each incubator hatches one egg at a time.</p>

        <h4>Absorb Bulb — warming an egg</h4>
        <p>For <b>${PRECO_BULBO_DIAMANTES} 💎</b>, the bulb <b>warms ONE egg</b> that is already hatching: it
        opens <b>${PCT_BULBO}% faster</b> (the "Warmed" column in the table). When the egg hatches, the
        bulb <b>burns out with it</b> — the next egg needs another.</p>
        <ul>
          <li>It only lights <b>with the egg inside</b>: you can't buy it ahead and keep it.</li>
          <li>An egg that is already warmed doesn't take another, and neither does one that is about
          to open — that would be paying for a discount that doesn't exist.</li>
        </ul>`,
      es: `
        <p>El <a data-cap="market">Market</a> vende <b>Mystery Eggs</b>, y la <b>Incubadora</b> los
        incuba: en unas horas — contadas <b>aunque estés desconectado</b> — el huevo se abre y nace un
        <b>pokémon sorpresa</b>, directo en tu <b>Colección</b>, con la <b>potencia del huevo
        garantizada</b>.</p>

        <h4>Los tres huevos</h4>
        ${tabelaDeOvos(c)}
        <p>Están en <b>Market → Huevos</b>. Comprado, el huevo va a <b>Mochila → Objetos Raros</b>; desde
        ahí, un clic lo lleva a una incubadora libre (<b>Mochila → Incubadora</b>). El huevo es de tu
        cuenta: <b>no va al Mercado de la Comunidad</b>.</p>
        <p>Hay un cuarto huevo que el Market no vende: el <a data-cap="ovoShiny">Huevo Shiny</a>,
        fabricado con el Profesor Oak con fragmentos que caen en las hunts de Unova en adelante (y
        negociable en el Mercado de la Comunidad). Eclosiona en la misma incubadora, en
        ${N(Math.round(OVO_SHINY.horas / 24), c.lang)} días, y siempre nace shiny.</p>

        <h4>Qué puede nacer</h4>
        <ul>
          <li>Una especie sorteada entre <b>todas las que tienen cacería en el Mapa</b>, de cualquier
          región, con la <b>misma probabilidad</b> para cada una — un Magikarp y un pokémon de cacería
          alta salen igual.</li>
          <li><b>Nunca</b> sale de Outland, ni un <b>Legendario</b>, <b>Singular</b> o <b>Mega</b> —
          esos tienen sus caminos (la <a data-cap="mistico">Arena Mística</a> y la
          <a data-cap="mega">Mega Stone</a>).</li>
          <li>La <b>potencia</b> es la del huevo. <b>Calidad, IV y shiny</b> se sortean como en una
          captura — el shiny incluido, con la misma probabilidad.</li>
          <li>El <b>nivel</b> es el de la cacería de la especie, con el mismo tope de la captura (ver
          <a data-cap="captura">Captura</a>).</li>
        </ul>
        <p>El canal 🥚┃radar-do-ovo de nuestro Discord anuncia quién eclosionó, qué huevo y el
        pokémon que salió.</p>

        <h4>Las incubadoras</h4>
        <p>Toda cuenta tiene <b>${CHOCADEIRAS_GRATIS}</b>, y puedes tener hasta <b>${CHOCADEIRAS_MAX}</b>:
        cada una más cuesta <b>${PRECO_CHOCADEIRA_DIAMANTES} 💎</b> en la <a data-cap="loja">Tienda</a> y
        queda en la cuenta <b>para siempre</b> — no es un objeto, no va a la mochila y no se vende. Cada
        incubadora incuba un huevo a la vez.</p>

        <h4>Absorb Bulb — calentar un huevo</h4>
        <p>Por <b>${PRECO_BULBO_DIAMANTES} 💎</b>, la lámpara <b>calienta UN huevo</b> que ya está
        incubando: se abre un <b>${PCT_BULBO}% más rápido</b> (la columna "Calentado" de la tabla). Cuando
        el huevo eclosiona, la lámpara <b>se rompe con él</b> — el siguiente huevo pide otra.</p>
        <ul>
          <li>Solo se enciende <b>con el huevo dentro</b>: no se puede comprar antes y guardar.</li>
          <li>Un huevo ya calentado no acepta otra, y uno que ya va a abrirse tampoco — sería pagar por
          un descuento que no existe.</li>
        </ul>`,
    }),
  },

  // ------------------------------------------------------- 13d. ovo shiny
  //
  // O fragmento, a escada da chance e o ovo saem de `shared/ovo-shiny.mjs` e `shared/chocadeira.mjs`
  // — os mesmos números que o servidor sorteia e choca. O "N espécies" vem do welcome
  // (`ovoShiny.pool`): só o servidor sabe quais têm arte shiny.
  {
    id: 'ovoShiny',
    titulo: { pt: 'Ovo Shiny', en: 'Shiny Egg', es: 'Huevo Shiny' },
    grupo: 'mundo',
    html: (c) => {
      const pctDe = (v) => (v * 100)
        .toLocaleString(c.lang === 'pt' ? 'pt-BR' : c.lang === 'es' ? 'es-ES' : 'en-US', { maximumSignificantDigits: 3 });
      const base = pctDe(CHANCE_FRAGMENTO_OVO_SHINY_BASE);
      const passo = pctDe(CHANCE_FRAGMENTO_OVO_SHINY_PASSO);
      const abatesPorOvoNaPorta = N(Math.round(CUSTO_FRAGMENTOS_OVO_SHINY / CHANCE_FRAGMENTO_OVO_SHINY_BASE), c.lang);
      const dias = N(Math.round(OVO_SHINY.horas / 24), c.lang);
      const aquecido = N(Math.round(OVO_SHINY.horas * BULBO_FATOR), c.lang);
      const pool = Number(c.d.ovoShiny?.pool) || 0;
      const nivel = N(NIVEL_MIN_FRAGMENTO_OVO_SHINY, c.lang);
      const custo = N(CUSTO_FRAGMENTOS_OVO_SHINY, c.lang);
      return {
        pt: `
        <p>O <b>Ovo Shiny</b> é o prêmio de quem <b>rusha nível</b>: com <b>${custo} Fragmentos de Ovo
        Shiny</b>, o <b>Professor Carvalho</b> fabrica um ovo que choca em <b>${dias} dias</b> e de onde
        nasce, <b>sempre</b>, um pokémon <b>shiny</b>.</p>

        <h4>Onde cai o fragmento</h4>
        <p>Em <b>toda hunt de Unova para frente</b> — nível de hunt <b>${nivel} ou mais</b>, o que inclui
        Kalos e a aba de Alola (com Galar e Paldea). Em nenhum outro lugar: nem abaixo de Unova, nem na
        <b>Outland</b>, nem em boss. A chance é da <b>hunt</b>, e não do seu nível de treinador: começa
        em <b>${base}%</b> na porta de Unova e cada nível de hunt acima soma <b>${passo}%</b>.</p>
        ${tabelaOvoShiny(c)}
        <ul>
          <li>O <b>Loot Boost</b> multiplica essa chance, como em todo drop raro.</li>
          <li>Descer para uma hunt mais fácil é descer de chance: a escada é a do nível da hunt.</li>
          <li>O fragmento é <b>negociável</b> no <a data-cap="comunidade">Mercado da Comunidade</a>
          (aba Fragmentos).</li>
        </ul>

        <h4>Fabricar e chocar</h4>
        <p>No <a data-cap="tm">Professor Carvalho</a> (Centro Pokémon), a bancada <b>Fabricar Ovo
        Shiny</b> mostra quantos fragmentos você tem; com <b>${custo}</b>, o botão <b>Fabricar</b> troca os
        fragmentos por <b>um Ovo Shiny</b> na mochila. Ele vai para uma chocadeira livre como os
        <a data-cap="chocadeira">Mystery Eggs</a> e abre em <b>${dias} dias</b> — o <b>Absorb Bulb</b>
        vale para ele também (${aquecido} h aquecido).</p>
        <ul>
          <li>O pokémon nasce <b>shiny com certeza</b>, de uma espécie sorteada entre as ${pool ? `<b>${N(pool, c.lang)}</b>` : ''}
          que têm hunt no Mapa e arte shiny — sem Outland, Lendário, Mítico nem Mega, todas com a mesma
          chance.</li>
          <li>A <b>potência</b> não é fixa: gira na roleta de uma captura, como a qualidade. Os IVs são
          os de um <a data-cap="shiny">shiny</a>.</li>
          <li>O <b>nível</b> é o da hunt da espécie, com o mesmo teto da <a data-cap="captura">captura</a>.</li>
          <li>O <b>ovo inteiro também vende</b> no <a data-cap="comunidade">Mercado da Comunidade</a>
          (aba Ovo Shiny) — antes de entrar na chocadeira; chocando, ele já não é item.</li>
          <li>Quando ele choca, o servidor inteiro vê: o aviso de shiny aparece na tela de todos e no
          chat, com o seu nome.</li>
        </ul>
        ${nota(`<b>Por que a escada sobe tanto dentro de Unova?</b> Porque é ali que o caminho do nível
        começa a render: na porta (Nv ${nivel}) um ovo pede ~${abatesPorOvoNaPorta}
        abates, e cada hunt acima encurta a conta. Quem sobe de hunt sobe de chance.`, 'dica')}`,
        en: `
        <p>The <b>Shiny Egg</b> is the prize for those who <b>rush levels</b>: with <b>${custo} Shiny Egg
        Fragments</b>, <b>Professor Oak</b> crafts an egg that hatches in <b>${dias} days</b> and
        <b>always</b> gives a <b>shiny</b> pokémon.</p>

        <h4>Where the fragment drops</h4>
        <p>In <b>every hunt from Unova onward</b> — hunt level <b>${nivel} or higher</b>, which includes
        Kalos and the Alola tab (with Galar and Paldea). Nowhere else: not below Unova, not in the
        <b>Outland</b>, not from bosses. The chance belongs to the <b>hunt</b>, not to your trainer
        level: it starts at <b>${base}%</b> at Unova's door and each hunt level above adds <b>${passo}%</b>.</p>
        ${tabelaOvoShiny(c)}
        <ul>
          <li>The <b>Loot Boost</b> multiplies this chance, as with every rare drop.</li>
          <li>Dropping to an easier hunt drops your chance: the ladder follows the hunt level.</li>
          <li>The fragment can be <b>traded</b> in the <a data-cap="comunidade">Community Market</a>
          (Fragments tab).</li>
        </ul>

        <h4>Crafting and hatching</h4>
        <p>At <a data-cap="tm">Professor Oak</a> (Pokémon Center), the <b>Craft Shiny Egg</b> bench shows
        how many fragments you have; with <b>${custo}</b>, the <b>Craft</b> button turns them into <b>one
        Shiny Egg</b> in your backpack. It goes into a free incubator like the
        <a data-cap="chocadeira">Mystery Eggs</a> and opens in <b>${dias} days</b> — the <b>Absorb
        Bulb</b> works on it too (${aquecido} h warmed).</p>
        <ul>
          <li>The pokémon is <b>shiny for sure</b>, a species drawn from the ${pool ? `<b>${N(pool, c.lang)}</b>` : ''}
          that have a hunt on the Map and shiny art — no Outland, Legendary, Mythical or Mega, each with
          the same chance.</li>
          <li>The <b>potency</b> isn't fixed: it rolls like a catch, as does quality. IVs are those of a
          <a data-cap="shiny">shiny</a>.</li>
          <li>The <b>level</b> is the species' hunt level, with the same cap as <a data-cap="captura">catching</a>.</li>
          <li>The <b>whole egg sells too</b> on the <a data-cap="comunidade">Community Market</a> (Shiny
          Egg tab) — before it goes into an incubator; once hatching, it's no longer an item.</li>
          <li>When it hatches, the whole server sees it: the shiny alert shows on everyone's screen and
          in chat, with your name.</li>
        </ul>
        ${nota(`<b>Why does the ladder climb so fast inside Unova?</b> Because that's where the leveling
        path starts paying off: at the door (Lv ${nivel}) an egg takes ~${abatesPorOvoNaPorta}
        kills, and each hunt above shortens the count. Climbing hunts means climbing chance.`, 'dica')}`,
        es: `
        <p>El <b>Huevo Shiny</b> es el premio de quien <b>sube de nivel rápido</b>: con <b>${custo}
        Fragmentos de Huevo Shiny</b>, el <b>Profesor Oak</b> fabrica un huevo que eclosiona en
        <b>${dias} días</b> y del que nace, <b>siempre</b>, un pokémon <b>shiny</b>.</p>

        <h4>Dónde cae el fragmento</h4>
        <p>En <b>toda hunt de Unova en adelante</b> — nivel de hunt <b>${nivel} o más</b>, lo que incluye
        Kalos y la pestaña de Alola (con Galar y Paldea). En ningún otro lugar: ni debajo de Unova, ni en
        la <b>Outland</b>, ni en bosses. La probabilidad es de la <b>hunt</b>, no de tu nivel de
        entrenador: empieza en <b>${base}%</b> en la puerta de Unova y cada nivel de hunt por encima suma
        <b>${passo}%</b>.</p>
        ${tabelaOvoShiny(c)}
        <ul>
          <li>El <b>Loot Boost</b> multiplica esa probabilidad, como en todo drop raro.</li>
          <li>Bajar a una hunt más fácil es bajar de probabilidad: la escalera es la del nivel de la hunt.</li>
          <li>El fragmento se puede <b>negociar</b> en el <a data-cap="comunidade">Mercado de la
          Comunidad</a> (pestaña Fragmentos).</li>
        </ul>

        <h4>Fabricar e incubar</h4>
        <p>Con el <a data-cap="tm">Profesor Oak</a> (Centro Pokémon), la mesa <b>Fabricar Huevo
        Shiny</b> muestra cuántos fragmentos tienes; con <b>${custo}</b>, el botón <b>Fabricar</b> los
        cambia por <b>un Huevo Shiny</b> en la mochila. Va a una incubadora libre como los
        <a data-cap="chocadeira">Mystery Eggs</a> y se abre en <b>${dias} días</b> — el <b>Absorb
        Bulb</b> también sirve para él (${aquecido} h calentado).</p>
        <ul>
          <li>El pokémon nace <b>shiny con seguridad</b>, de una especie sorteada entre las ${pool ? `<b>${N(pool, c.lang)}</b>` : ''}
          que tienen hunt en el Mapa y arte shiny — sin Outland, Legendario, Singular ni Mega, todas con
          la misma probabilidad.</li>
          <li>La <b>potencia</b> no es fija: gira como en una captura, igual que la calidad. Los IV son
          los de un <a data-cap="shiny">shiny</a>.</li>
          <li>El <b>nivel</b> es el de la hunt de la especie, con el mismo tope de la <a data-cap="captura">captura</a>.</li>
          <li>El <b>huevo entero también se vende</b> en el <a data-cap="comunidade">Mercado de la
          Comunidad</a> (pestaña Huevo Shiny) — antes de entrar en la incubadora; incubando, ya no es
          un objeto.</li>
          <li>Cuando eclosiona, todo el servidor lo ve: el aviso de shiny aparece en la pantalla de todos
          y en el chat, con tu nombre.</li>
        </ul>
        ${nota(`<b>¿Por qué la escalera sube tanto dentro de Unova?</b> Porque ahí empieza a rendir el
        camino del nivel: en la puerta (Nv ${nivel}) un huevo pide ~${abatesPorOvoNaPorta}
        derrotas, y cada hunt por encima acorta la cuenta. Quien sube de hunt sube de probabilidad.`, 'dica')}`,
      };
    },
  },

  // ---------------------------------------------------- 14. Professor Carvalho
  {
    id: 'tm',
    titulo: { pt: 'Z-Move e TM AoE', en: 'Z-Moves and AoE TM', es: 'Z-Move y TM AoE' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>O <b>Z-Move</b> (o antigo Z-Move) e o <b>TM AoE</b> são melhorias <b>permanentes</b> no pokémon — desbloqueiam conteúdo avançado e mudam
        como ele luta. No <b>Centro Pokémon</b>, fale com o <b>Professor Carvalho</b> (botão na
        praça). Lá tem um botão <b>[i]</b> com o guia completo.</p>

        ${nota(`O balcão do Professor tem <b>sete bancadas</b>: as duas do Z-Move e do TM AoE (<b>Trocar peças</b> e
        <b>Aplicar disco</b>), <b>Fabricar Casa</b> — com o Craft de Casas dentro — (ver
        <a data-cap="casa">Casa e XP Share</a>), <b>Fabricar Bicicleta</b> — com o Craft de
        Bicicletas — (ver <a data-cap="bicicletas">Bicicletas</a>), <b>Fabricar Shiny Stone</b> (ver
        <a data-cap="shiny">Shiny</a>), <b>Fabricar Mega Stone</b> (ver
        <a data-cap="mega">Mega Evolução</a>) e <b>Fabricar Ovo Shiny</b> (ver
        <a data-cap="ovoShiny">Ovo Shiny</a>). Antes de gastar fragmento, peça ou disco, ele sempre
        mostra o que sai e o que entra e pede a sua confirmação.`)}

        <h4>Quando aplicado</h4>
        <ul>
          <li><b>Z-Move</b> — o pokémon aprende um golpe especial novo (ex.: <b>Z-Move GHOST</b>):
          power <b>${TM_ELEMENTAL_POWER}</b>, CD <b>${TM_ELEMENTAL_CD_MS / 1000} s</b>, área
          <b>${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL}</b> com o centro no <b>alvo</b>. O tipo do
          Z-Move tem que ser um dos tipos do pokémon <b>na hora de aplicar</b>. Depois, ele fica no
          "DNA": evoluir ou megaevoluir não o tira, mesmo que o tipo dele suma do pokémon.</li>
          <li><b>AoE</b> — os golpes do pokémon passam a acertar em área
          <b>${LADO_TM_AOE}×${LADO_TM_AOE}</b> com o centro no <b>seu pokémon</b>. Vários selvagens
          grudados levam dano <b>simultaneamente</b>.</li>
        </ul>
        <p>Z-Move e AoE <b>coexistem</b> no mesmo bicho. Ex.: Gengar (Ghost/Poison) aceita Z-Move
        <b>Ghost</b> ou <b>Poison</b> — um Z-Move por pokémon, mais um AoE se quiser. O AoE
        <b>não aumenta</b> o golpe do Z-Move: ele continua no
        ${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL} em volta do alvo.</p>

        <h4>Onde o golpe do Z-Move acerta</h4>
        <p>O quadrado fica em volta do <b>alvo</b> (o selvagem com quem seu pokémon está brigando),
        e não em volta do seu pokémon: acerta o alvo e quem estiver encostado <b>nele</b>. Com vários
        selvagens cercando seu pokémon, quantos levam dano depende de onde o alvo está:</p>
        <ul>
          <li>Alvo <b>reto</b> (em cima, embaixo ou do lado): até <b>${TM_CERCO_RETO}</b> dos 8 que
          cercam seu pokémon, contando o alvo.</li>
          <li>Alvo na <b>diagonal</b>: até <b>${TM_CERCO_DIAGONAL}</b> — o alvo e os vizinhos dele.
          É o caso mais comum, porque seu pokémon para de andar assim que encosta no alvo, e
          encostar de quina já vale.</li>
        </ul>
        <p>Só o golpe do <b>Z-Move</b> acerta em área. Os outros golpes acertam um selvagem por vez, a não
        ser que o pokémon tenha o disco <b>AoE</b> — esse, sim, fica em volta do seu pokémon e pega
        todo mundo até ${(LADO_TM_AOE - 1) / 2} tiles de distância.</p>

        <h4>Bronze Boss Token → bosses → peças</h4>
        <p>Para farmar peças você precisa entrar nas arenas de boss (gasta
        <b>1× Bronze Boss Token</b> por tentativa):</p>
        <ul>
          <li><b>Token</b> — drop raro na <b>Outland</b> (${pctBossToken(c)} por kill, média
          ~${mediaBossToken(c)} derrotas).${dicaOutlandTiers(c, 'bosses')} Kanto e Orre não dropam. O NPC não vende, mas ele sai
          como prêmio do <a data-cap="passe">Passe de Batalha</a> e se negocia no <a data-cap="comunidade">Mercado da Comunidade</a>.</li>
          <li><b>Bosses</b> — cada boss solta <b>um</b> dos dois tipos de peça: o <b>Fragmento de
          Z-Move</b> em ${origemDaPeca(c, idPecaElemental(c))} e <b>AoE TM Disk Piece</b> em
          ${origemDaPeca(c, idPecaAoe(c))}. Quanto mais alto o boss, maior a chance — a lista
          completa está em <a data-cap="bosses">Bosses</a>.</li>
        </ul>

        <h4>Peças → discos</h4>
        <p>Junte <b>${pecasPorDisco(c)}</b> peças iguais e troque no Professor (consumidas na hora):</p>
        ${tabela(
          ['Peça', 'Vem de', 'Vira'],
          `<tr><td>Fragmento de Z-Move</td><td>${origemDaPeca(c, idPecaElemental(c))}</td><td>Z-Move (escolhe o tipo)</td></tr>
           <tr><td>AoE TM Disk Piece</td><td>${origemDaPeca(c, idPecaAoe(c))}</td><td>Disco AoE</td></tr>`,
        )}
        <p>O Z-Move e o disco vão para a Mochila (Itens Raros); na aba <b>Aplicar</b> você escolhe um
        pokémon da equipe e consome o item — é permanente no bicho. Na ficha do pokémon, o selo do
        Z-Move leva o cristal do tipo ao lado, e o do AoE, o disco laranja.</p>

        <h4>Status aprimorados e Orre</h4>
        <p>Selvagens na <b>Outland</b> (treinador Nv 150+) e na <b>Orre</b> (as abas de Hoenn em diante, Nv 500+) têm stats
        mais altos que Kanto — mais HP e dano por golpe. Na <b>Orre</b>, o pokémon ativo precisa
        do <b>Z-Move</b> e do <b>TM AoE</b> para caçar com eficiência.</p>

        ${nota(`Tokens e discos TM são escassos de propósito — a progressão passa por farm na
        Outland e vitórias em boss.`, 'dica')}`,
      en: `
        <p>The <b>Z-Move</b> (formerly the Z-Move) and the <b>AoE TM</b> are <b>permanent</b> upgrades on a pokémon — they unlock advanced content and change
        how it fights. At the <b>Pokémon Center</b>, talk to <b>Professor Oak</b> (button in the
        square). There is an <b>[i]</b> button with the full guide.</p>

        ${nota(`The Professor's counter has <b>seven benches</b>: the two for the Z-Move and AoE TM (<b>Trade pieces</b>
        and <b>Apply disk</b>), <b>Craft House</b> — with the House Craft inside — (see
        <a data-cap="casa">House &amp; XP Share</a>), <b>Craft Bicycle</b> — with the Bicycle Craft —
        (see <a data-cap="bicicletas">Bicycles</a>), <b>Craft Shiny Stone</b> (see
        <a data-cap="shiny">Shiny</a>), <b>Craft Mega Stone</b> (see
        <a data-cap="mega">Mega Evolution</a>) and <b>Craft Shiny Egg</b> (see
        <a data-cap="ovoShiny">Shiny Egg</a>). Before spending a fragment, a piece or a disk, he
        always shows what goes out and what comes in, and asks you to confirm.`)}

        <h4>When applied</h4>
        <ul>
          <li><b>Z-Move</b> — the pokémon learns a new special move (e.g. <b>Z-Move GHOST</b>): power
          <b>${TM_ELEMENTAL_POWER}</b>, <b>${TM_ELEMENTAL_CD_MS / 1000} s</b> CD,
          <b>${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL}</b> area centered on the <b>target</b>. The
          disk type must match one of the pokémon's types <b>when you apply it</b>. After that the TM
          is in its "DNA": evolving or Mega Evolving doesn't remove it, even if its type leaves the
          pokémon.</li>
          <li><b>AoE</b> — the pokémon's moves hit an <b>${LADO_TM_AOE}×${LADO_TM_AOE}</b> area
          centered on <b>your pokémon</b>. Several nearby wilds take damage <b>at the same
          time</b>.</li>
        </ul>
        <p>Z-Move and AoE <b>stack</b> on the same pokémon. E.g. Gengar (Ghost/Poison) accepts
        <b>Ghost</b> or <b>Poison</b> — one Z-Move per pokémon, plus AoE if you want. AoE
        <b>does not widen</b> the Z-Move: it stays a
        ${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL} around the target.</p>

        <h4>Where the Z-Move hits</h4>
        <p>The square is around the <b>target</b> (the wild your pokémon is fighting), not around
        your pokémon: it hits the target and whoever is touching <b>it</b>. With several wilds
        surrounding your pokémon, how many take damage depends on where the target stands:</p>
        <ul>
          <li>Target <b>straight</b> (above, below or beside): up to <b>${TM_CERCO_RETO}</b> of the 8
          around your pokémon, counting the target.</li>
          <li>Target <b>diagonal</b>: up to <b>${TM_CERCO_DIAGONAL}</b> — the target and its
          neighbors. This is the most common case, because your pokémon stops walking as soon as it
          touches the target, and touching at a corner counts.</li>
        </ul>
        <p>Only the <b>Z-Move</b> hits an area. The other moves hit one wild at a time, unless the
        pokémon has the <b>AoE</b> disk — that one is centered on your pokémon and hits everyone up
        to ${(LADO_TM_AOE - 1) / 2} tiles away.</p>

        <h4>Bronze Boss Token → bosses → pieces</h4>
        <p>To farm pieces you enter boss arenas (costs <b>1× Bronze Boss Token</b> per attempt):</p>
        <ul>
          <li><b>Token</b> — rare <b>Outland</b> drop (${pctBossToken(c)} per kill, ~${mediaBossToken(c)}
          defeats on average).${dicaOutlandTiers(c, 'bosses')} Kanto and Orre do not drop it. The NPC does not sell it, but it
          comes out as a <a data-cap="passe">Battle Pass</a> prize and is traded on the <a data-cap="comunidade">Community Market</a>.</li>
          <li><b>Bosses</b> — each boss drops <b>one</b> of the two piece types: the <b>Z-Move
          Fragment</b> from ${origemDaPeca(c, idPecaElemental(c))} and <b>AoE TM Disk Piece</b> from
          ${origemDaPeca(c, idPecaAoe(c))}. The higher the boss, the higher the chance — the full
          list is under <a data-cap="bosses">Bosses</a>.</li>
        </ul>

        <h4>Pieces → disks</h4>
        <p>Collect <b>${pecasPorDisco(c)}</b> matching pieces and trade them at the Professor (consumed immediately):</p>
        ${tabela(
          ['Piece', 'From', 'Becomes'],
          `<tr><td>Z-Move Fragment</td><td>${origemDaPeca(c, idPecaElemental(c))}</td><td>Z-Move (pick type)</td></tr>
           <tr><td>AoE TM Disk Piece</td><td>${origemDaPeca(c, idPecaAoe(c))}</td><td>AoE disk</td></tr>`,
        )}
        <p>The Z-Move and the disk go to your Backpack (Rare Items); on the <b>Apply</b> tab you pick a
        team pokémon and consume the item — it is permanent on that pokémon. On the pokémon's sheet the
        Z-Move tag shows its type crystal next to it, and the AoE tag, the orange disk.</p>

        <h4>Enhanced stats and Orre</h4>
        <p>Wilds in <b>Outland</b> (trainer Lv 150+) and <b>Orre</b> (the Hoenn tab onward, Lv 500+) have higher stats
        than Kanto — more HP and damage per hit. In <b>Orre</b>, your active pokémon needs
        <b>both</b> the Z-Move and the AoE TM to hunt efficiently.</p>`,
      es: `
        <p>El <b>Z-Move</b> (el antiguo Z-Move) y el <b>TM AoE</b> son mejoras <b>permanentes</b> en el pokémon — desbloquean contenido avanzado y
        cambian cómo pelea. En el <b>Centro Pokémon</b>, habla con el <b>Profesor Oak</b>. Hay un
        botón <b>[i]</b> con la guía completa.</p>

        ${nota(`El mostrador del Profesor tiene <b>siete bancos</b>: los dos del Z-Move y del TM AoE (<b>Cambiar
        piezas</b> y <b>Aplicar disco</b>), <b>Fabricar Casa</b> — con el Craft de Casas dentro — (ver
        <a data-cap="casa">Casa y XP Share</a>), <b>Fabricar Bicicleta</b> — con el Craft de
        Bicicletas — (ver <a data-cap="bicicletas">Bicicletas</a>), <b>Fabricar Shiny Stone</b> (ver
        <a data-cap="shiny">Shiny</a>), <b>Fabricar Mega Stone</b> (ver
        <a data-cap="mega">Mega Evolución</a>) y <b>Fabricar Huevo Shiny</b> (ver
        <a data-cap="ovoShiny">Huevo Shiny</a>). Antes de gastar un fragmento, una pieza o un disco,
        siempre muestra lo que sale y lo que entra y pide tu confirmación.`)}

        <h4>Al aplicar</h4>
        <ul>
          <li><b>Z-Move</b> — el pokémon aprende un golpe especial nuevo (ej.: <b>Z-Move GHOST</b>):
          power <b>${TM_ELEMENTAL_POWER}</b>, CD <b>${TM_ELEMENTAL_CD_MS / 1000} s</b>, área
          <b>${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL}</b> con el centro en el <b>objetivo</b>. El
          tipo del disco debe coincidir con uno de los tipos del pokémon <b>al aplicarlo</b>. Después, el
          TM queda en el "ADN": evolucionar o megaevolucionar no lo quita, aunque su tipo desaparezca del
          pokémon.</li>
          <li><b>AoE</b> — los golpes del pokémon aciertan área <b>${LADO_TM_AOE}×${LADO_TM_AOE}</b>
          con el centro en <b>tu pokémon</b>. Varios salvajes juntos reciben daño
          <b>a la vez</b>.</li>
        </ul>
        <p>Z-Move y AoE <b>conviven</b> en el mismo bicho. Ej.: Gengar (Ghost/Poison) acepta
        Z-Move <b>Ghost</b> o <b>Poison</b> — un Z-Move por pokémon, más AoE si quieres. El AoE
        <b>no agranda</b> el golpe del Z-Move: sigue en el
        ${LADO_TM_ELEMENTAL}×${LADO_TM_ELEMENTAL} alrededor del objetivo.</p>

        <h4>Dónde acierta el golpe del Z-Move</h4>
        <p>El cuadrado está alrededor del <b>objetivo</b> (el salvaje con el que pelea tu pokémon),
        no alrededor de tu pokémon: acierta al objetivo y a quien esté pegado <b>a él</b>. Con
        varios salvajes rodeando a tu pokémon, cuántos reciben daño depende de dónde está el
        objetivo:</p>
        <ul>
          <li>Objetivo <b>recto</b> (arriba, abajo o al lado): hasta <b>${TM_CERCO_RETO}</b> de los 8
          que rodean a tu pokémon, contando el objetivo.</li>
          <li>Objetivo en <b>diagonal</b>: hasta <b>${TM_CERCO_DIAGONAL}</b> — el objetivo y sus
          vecinos. Es el caso más común, porque tu pokémon deja de caminar en cuanto toca al
          objetivo, y tocarlo en esquina ya cuenta.</li>
        </ul>
        <p>Solo el golpe del <b>Z-Move</b> acierta en área. Los demás golpes aciertan a un salvaje por vez,
        salvo que el pokémon tenga el disco <b>AoE</b> — ese sí está centrado en tu pokémon y
        alcanza a todos hasta ${(LADO_TM_AOE - 1) / 2} tiles de distancia.</p>

        <h4>Bronze Boss Token → jefes → piezas</h4>
        <p>Para farmear piezas entras en arenas de jefe (gastas <b>1× Bronze Boss Token</b> por
        intento):</p>
        <ul>
          <li><b>Token</b> — drop raro en <b>Outland</b> (${pctBossToken(c)} por kill, media
          ~${mediaBossToken(c)} derrotas).${dicaOutlandTiers(c, 'bosses')} Kanto y Orre no sueltan. El NPC no lo vende, pero sale
          como premio del <a data-cap="passe">Pase de Batalla</a> y se negocia en el <a data-cap="comunidade">Mercado de la Comunidad</a>.</li>
          <li><b>Bosses</b> — cada boss suelta <b>uno</b> de los dos tipos de pieza: el <b>Fragmento de
          Z-Move</b> en ${origemDaPeca(c, idPecaElemental(c))} y <b>AoE TM Disk Piece</b> en
          ${origemDaPeca(c, idPecaAoe(c))}. Cuanto más alto el boss, mayor la chance — la lista
          completa está en <a data-cap="bosses">Bosses</a>.</li>
        </ul>

        <h4>Piezas → discos</h4>
        <p>Junta <b>${pecasPorDisco(c)}</b> piezas iguales y cámbialas con el Profesor:</p>
        ${tabela(
          ['Pieza', 'De', 'Se convierte en'],
          `<tr><td>Fragmento de Z-Move</td><td>${origemDaPeca(c, idPecaElemental(c))}</td><td>Z-Move</td></tr>
           <tr><td>AoE TM Disk Piece</td><td>${origemDaPeca(c, idPecaAoe(c))}</td><td>Disco AoE</td></tr>`,
        )}
        <p>El Z-Move y el disco van a la Mochila (Objetos Raros); en la pestaña <b>Aplicar</b> eliges
        un pokémon del equipo y consumes el objeto — es permanente en el bicho. En la ficha del pokémon,
        el sello del Z-Move lleva el cristal del tipo al lado, y el del AoE, el disco naranja.</p>

        <h4>Stats mejorados y Orre</h4>
        <p>Salvajes en <b>Outland</b> (entrenador Nv 150+) y <b>Orre</b> (de la pestaña Hoenn en adelante, Nv 500+) tienen stats más
        altos que Kanto. En <b>Orre</b>, el pokémon activo necesita los <b>dos</b> TMs (elemental +
        AoE) para cazar con eficiencia.</p>`,
    }),
  },

  // ------------------------------------------------------------- 15. bosses
  {
    id: 'bosses',
    titulo: { pt: 'Bosses', en: 'Bosses', es: 'Bosses' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>Arenas de desafio: você gasta um <b>Bronze Boss Token</b>, entra num mapa próprio e
        enfrenta um pokémon gigante. Ele fica parado — não persegue — e bate MUITO forte. Para
        desafiar, o seu <b>treinador</b> precisa ter pelo menos o <b>nível do boss</b> (coluna
        Nível da tabela abaixo).</p>

        <h4>Como conseguir o token</h4>
        <p><b>Drop na Outland</b> — todo selvagem derrotado na Outland pode soltar 1× Bronze Boss
        Token. A chance depende da Outland que você escolhe no seletor da aba <b>Outland</b> do
        Mapa: na Outland 1 é <b>${pctBossToken(c)}</b> (média ~${mediaBossToken(c)} kills), e as de
        cima multiplicam até <b>×${maiorMultOutland(c)}</b>. O Loot Boost aumenta por cima de
        qualquer linha.</p>
        ${tabelaBossTokenPorOutland(c)}
        <ul>
          <li><b>Não</b> vende no Market do NPC. Além do drop na Outland, ele sai como prêmio do
          <a data-cap="passe">Passe de Batalha</a> e se negocia entre jogadores.</li>
          <li>O NPC <b>não compra</b> o token (nem na venda avulsa nem no “vender tudo”). Quem
          define o preço é a comunidade no <a data-cap="comunidade">Mercado da Comunidade</a>.</li>
        </ul>
        ${tabelaDeBosses(c)}

        <h4>A penalidade de equipe</h4>
        <p>É a mecânica central da arena, e ela multiplica <b>o dano que o boss causa</b> — não o
        que ele aguenta.</p>
        <pre class="wk-formula">força    = Σ mín(1, nível do pokémon / nível de equipe do boss)
déficit  = máx(0, ${equipeIdealBoss(c)} − força)
multiplicador = ${BASE_PENALIDADE_BOSS} ^ déficit</pre>
        ${tabelaPenalidadeBoss(c)}
        ${nota(`Leve <b>${equipeIdealBoss(c)}</b> pokémon (ou mais) no nível do boss. Não é conselho —
        é a diferença entre tomar ${N(400, c.lang)} de dano e tomar até
        ${N(400 * multPenalidadeBoss(c, 0), c.lang)}.`, 'aviso')}

        <h4>O que muda lá dentro</h4>
        <ul>
          <li>O boss usa <b>golpes próprios</b>, com power e cooldown da ficha dele — não os da
          espécie. Os dois têm o <b>tipo dele</b>: o mais forte leva o 1º tipo da espécie e o outro,
          o 2º (ou o 1º de novo, no lendário de um tipo só).</li>
          <li>Ele <b>não</b> leva o ×${c.d.multDanoSelvagem ?? 1.8} de dano do selvagem: os golpes
          dele já vêm com power de boss.</li>
          <li>O boss luta com a <b>tabela de tipos</b>, nos dois sentidos e com a mesma amplificação
          da hunt (ver <a data-cap="tipos">Tipos</a>): o golpe super-efetivo nele bate
          ×${String(1 + (c.d.ampliacaoHunt ?? 1.5)).replace('.', ',')} (×${String(1 + 3 * (c.d.ampliacaoHunt ?? 1.5)).replace('.', ',')}
          no dobro) e o resistido, ×${String(+(0.5 / (c.d.ampliacaoHunt ?? 1.5)).toFixed(2)).replace('.', ',')}. Os golpes dele ganham
          <b>STAB</b> (×1,5) e, a cada ataque, ele escolhe o que mais machuca o seu pokémon da vez — monte o
          time pelo tipo do boss. A tabela vale <b>inteira</b>, imunidade inclusive: se o seu pokémon for
          <b>imune</b> aos dois golpes dele (um Fantasma contra o Normal do Regigigas, um Voador contra o Terra
          do Groudon), o boss <b>não causa dano</b> nele.</li>
          <li>Não dá para capturar um boss. O prêmio é a tabela de drops — onde estão a peça de TM,
          os dois fragmentos de <a data-cap="mega">Mega Stone</a>, o <a data-cap="safari">Safari Ticket</a> e o
          <a data-cap="mistico">Mystic Ticket</a>, todos com a chance subindo par a par.</li>
          <li>A recarga dos golpes começa <b>zerada</b>: a arena é paga, e é uma das duas lutas que
          começam com tudo pronto (a outra é a <a data-cap="mistico">Arena Mística</a>).</li>
        </ul>

        <h4>Se você vencer</h4>
        <p>Abre um painel com XP, boss points e loot; você volta ao <b>Centro Pokémon</b> (não
        retorna à hunt anterior). Curar e seguir caçando é escolher outra área no Mapa.</p>

        <h4>Se você perder</h4>
        <p>Você sai da arena e vai para o Centro Pokémon. <b>A entrada não volta</b> — nem se você
        abandonar por vontade própria.</p>

        <h4>Repetir automaticamente</h4>
        <p>Na tela do boss, <b>Repetir automaticamente</b> emenda uma luta na outra: ao fim de cada
        uma — ganhando ou perdendo —, você cai no Centro, a Enfermeira cura o time e o jogo entra de
        novo na <b>mesma</b> arena, gastando outro token. Ela desliga sozinha, com aviso, quando os
        tokens acabam, quando o seu nível não alcança mais o boss ou quando a equipe não tem quem
        lute — e também se você abandonar a arena ou sair do Centro para caçar.</p>
        <ul>
          <li>Durante a série, as telas de drop <b>se empilham</b> em vez de sumir, e um botão fecha
          todas de uma vez.</li>
          <li>Quando a repetição termina, aparece o <b>resumo da série</b>: em quantas vitórias, e tudo
          o que caiu.</li>
          <li>A escolha fica guardada na conta: uma queda de conexão no meio da madrugada não desliga
          a série.</li>
        </ul>`,
      en: `
        <p>Challenge arenas: you spend a <b>Bronze Boss Token</b>, enter a dedicated map and face
        a giant pokémon. It stands still — it does not chase — and it hits VERY hard. To
        challenge one, your <b>trainer</b> must be at least at the <b>boss's level</b> (the Level
        column in the table below).</p>

        <h4>Getting the token</h4>
        <p><b>Outland drop</b> — every wild defeated in Outland can drop 1× Bronze Boss Token. The
        chance depends on the Outland you pick in the selector on the Map's <b>Outland</b> tab: in
        Outland 1 it is <b>${pctBossToken(c)}</b> (~${mediaBossToken(c)} kills on average), and the
        higher ones multiply it up to <b>×${maiorMultOutland(c)}</b>. Loot Boost raises any row
        further.</p>
        ${tabelaBossTokenPorOutland(c)}
        <ul>
          <li><b>Not</b> sold at the NPC Market. Besides the Outland drop, it comes out as a prize
          from the <a data-cap="passe">Battle Pass</a> and is traded between players.</li>
          <li>The NPC does <b>not buy</b> the token (single sell or sell-all). Price is set by
          players on the <a data-cap="comunidade">Community Market</a>.</li>
        </ul>
        ${tabelaDeBosses(c)}

        <h4>The team penalty</h4>
        <p>This is the arena's core mechanic, and it multiplies <b>the damage the boss deals</b> —
        not the damage it takes.</p>
        <pre class="wk-formula">strength = Σ min(1, pokémon level / boss team level)
deficit  = max(0, ${equipeIdealBoss(c)} − strength)
multiplier = ${BASE_PENALIDADE_BOSS} ^ deficit</pre>
        ${tabelaPenalidadeBoss(c)}
        ${nota(`Bring <b>${equipeIdealBoss(c)}</b> pokémon (or more) at the boss's level. This is not
        advice — it is the difference between taking ${N(400, c.lang)} damage and taking up to
        ${N(400 * multPenalidadeBoss(c, 0), c.lang)}.`, 'aviso')}

        <h4>What changes inside</h4>
        <ul>
          <li>The boss uses <b>its own moves</b>, with the power and cooldown from its sheet — not
          the species'. Both carry <b>its type</b>: the stronger one takes the species' 1st type and
          the other one the 2nd (or the 1st again, on a single-type legendary).</li>
          <li>It does <b>not</b> take the ×${c.d.multDanoSelvagem ?? 1.8} wild damage multiplier:
          its moves already come with boss-grade power.</li>
          <li>The boss fights with the <b>type chart</b>, both ways and with the same amplification
          as the hunt (see <a data-cap="tipos">Types</a>): a super-effective move hits it
          ×${1 + (c.d.ampliacaoHunt ?? 1.5)} (×${1 + 3 * (c.d.ampliacaoHunt ?? 1.5)} on a double
          weakness) and a resisted one ×${+(0.5 / (c.d.ampliacaoHunt ?? 1.5)).toFixed(2)}. Its moves get <b>STAB</b> (×1.5)
          and, on every attack, it picks the one that hurts your current pokémon the most — build the team
          around the boss's type. The chart applies <b>in full</b>, immunity included: if your pokémon is
          <b>immune</b> to both of its moves (a Ghost against Regigigas's Normal, a Flying against Groudon's
          Ground), the boss <b>deals it no damage</b>.</li>
          <li>You cannot catch a boss. The prize is the drop table — which holds the TM piece, the
          two <a data-cap="mega">Mega Stone</a> fragments, the <a data-cap="safari">Safari Ticket</a> and the
          <a data-cap="mistico">Mystic Ticket</a>, all with chances rising pair by pair.</li>
          <li>Move cooldowns start <b>reset</b>: the arena is paid, and it is one of the two fights
          that start with everything ready (the other is the <a data-cap="mistico">Mystic
          Arena</a>).</li>
        </ul>

        <h4>If you win</h4>
        <p>A loot panel shows XP, boss points and drops; you return to the <b>Pokémon Center</b>
        (not the previous hunt).</p>

        <h4>If you lose</h4>
        <p>You leave the arena and go to the Pokémon Center. <b>The entry fee is not refunded</b> —
        not even if you leave voluntarily.</p>

        <h4>Auto-repeat</h4>
        <p>On the boss screen, <b>Auto-repeat</b> chains one fight into the next: at the end of each
        — win or lose — you land in the Center, Nurse Joy heals the team and the game enters the
        <b>same</b> arena again, spending another token. It turns itself off, with a notice, when the
        tokens run out, when your level no longer reaches the boss or when the team has no one left
        to fight — and also if you abandon the arena or leave the Center to hunt.</p>
        <ul>
          <li>During the series, the drop screens <b>stack up</b> instead of disappearing, and one
          button closes them all.</li>
          <li>When the repetition ends, the <b>series summary</b> shows up: over how many wins, and
          everything that dropped.</li>
          <li>The choice is saved on the account: a dropped connection in the middle of the night does
          not turn the series off.</li>
        </ul>`,
      es: `
        <p>Arenas de desafío: gastas un <b>Bronze Boss Token</b>, entras en un mapa propio y te
        enfrentas a un pokémon gigante. Se queda quieto — no persigue — y pega MUY fuerte. Para
        desafiarlo, tu <b>entrenador</b> necesita al menos el <b>nivel del boss</b> (columna Nivel
        de la tabla de abajo).</p>

        <h4>Cómo conseguir el token</h4>
        <p><b>Drop en Outland</b> — todo salvaje derrotado en Outland puede soltar 1× Bronze Boss
        Token. La probabilidad depende de la Outland que eliges en el selector de la pestaña
        <b>Outland</b> del Mapa: en Outland 1 es <b>${pctBossToken(c)}</b> (~${mediaBossToken(c)}
        kills de media), y las de arriba la multiplican hasta <b>×${maiorMultOutland(c)}</b>. El
        Loot Boost la sube aún más en cualquier fila.</p>
        ${tabelaBossTokenPorOutland(c)}
        <ul>
          <li><b>No</b> se vende en el Market del NPC. Además del drop en Outland, sale como premio
          del <a data-cap="passe">Pase de Batalla</a> y se negocia entre jugadores.</li>
          <li>El NPC <b>no compra</b> el token. El precio lo fija la comunidad en el
          <a data-cap="comunidade">Mercado de la Comunidad</a>.</li>
        </ul>
        ${tabelaDeBosses(c)}

        <h4>La penalización de equipo</h4>
        <p>Es la mecánica central de la arena, y multiplica <b>el daño que hace el boss</b> — no el
        que aguanta.</p>
        <pre class="wk-formula">fuerza   = Σ mín(1, nivel del pokémon / nivel de equipo del boss)
déficit  = máx(0, ${equipeIdealBoss(c)} − fuerza)
multiplicador = ${BASE_PENALIDADE_BOSS} ^ déficit</pre>
        ${tabelaPenalidadeBoss(c)}
        ${nota(`Lleva <b>${equipeIdealBoss(c)}</b> pokémon (o más) al nivel del boss. No es un consejo
        — es la diferencia entre recibir ${N(400, c.lang)} de daño y recibir hasta
        ${N(400 * multPenalidadeBoss(c, 0), c.lang)}.`, 'aviso')}

        <h4>Qué cambia allí dentro</h4>
        <ul>
          <li>El boss usa <b>movimientos propios</b>, con el power y el cooldown de su ficha — no
          los de la especie. Los dos tienen <b>su tipo</b>: el más fuerte lleva el 1.º tipo de la
          especie y el otro, el 2.º (o el 1.º otra vez, en el legendario de un solo tipo).</li>
          <li><b>No</b> recibe el ×${c.d.multDanoSelvagem ?? 1.8} de daño del salvaje: sus
          movimientos ya vienen con power de boss.</li>
          <li>El boss pelea con la <b>tabla de tipos</b>, en los dos sentidos y con la misma
          amplificación de la hunt (ver <a data-cap="tipos">Tipos</a>): el movimiento supereficaz le pega
          ×${String(1 + (c.d.ampliacaoHunt ?? 1.5)).replace('.', ',')} (×${String(1 + 3 * (c.d.ampliacaoHunt ?? 1.5)).replace('.', ',')}
          en la doble debilidad) y el resistido, ×${String(+(0.5 / (c.d.ampliacaoHunt ?? 1.5)).toFixed(2)).replace('.', ',')}. Sus movimientos tienen
          <b>STAB</b> (×1,5) y, en cada ataque, elige el que más daña a tu pokémon de turno — arma el
          equipo según el tipo del boss. La tabla vale <b>entera</b>, inmunidad incluida: si tu pokémon es
          <b>inmune</b> a los dos movimientos (un Fantasma contra el Normal de Regigigas, un Volador contra el
          Tierra de Groudon), el boss <b>no le hace daño</b>.</li>
          <li>No se puede capturar a un boss. El premio es la tabla de drops — donde están la pieza de
          TM, los dos fragmentos de <a data-cap="mega">Mega Stone</a>, el <a data-cap="safari">Safari Ticket</a> y el
          <a data-cap="mistico">Mystic Ticket</a>, todos con la probabilidad subiendo par a par.</li>
          <li>La recarga de los golpes empieza <b>reiniciada</b>: la arena es de pago, y es una de las
          dos peleas que empiezan con todo listo (la otra es la <a data-cap="mistico">Arena
          Mística</a>).</li>
        </ul>

        <h4>Si ganas</h4>
        <p>Aparece un panel con XP, boss points y loot; vuelves al <b>Centro Pokémon</b>.</p>

        <h4>Si pierdes</h4>
        <p>Sales de la arena y vas al Centro Pokémon. <b>La entrada no se devuelve</b> — ni siquiera
        si abandonas por voluntad propia.</p>

        <h4>Repetir automáticamente</h4>
        <p>En la pantalla del boss, <b>Repetir automáticamente</b> encadena una pelea con la otra: al
        final de cada una — ganando o perdiendo —, caes en el Centro, la Enfermera cura al equipo y el
        juego entra de nuevo en la <b>misma</b> arena, gastando otro token. Se apaga sola, con aviso,
        cuando se acaban los tokens, cuando tu nivel ya no alcanza el boss o cuando el equipo no tiene
        quién luche — y también si abandonas la arena o sales del Centro a cazar.</p>
        <ul>
          <li>Durante la serie, las pantallas de drop <b>se apilan</b> en vez de desaparecer, y un
          botón las cierra todas.</li>
          <li>Cuando la repetición termina, aparece el <b>resumen de la serie</b>: en cuántas
          victorias, y todo lo que cayó.</li>
          <li>La elección queda guardada en la cuenta: una caída de conexión en plena madrugada no
          apaga la serie.</li>
        </ul>`,
    }),
  },

  // ------------------------------------------------------------ 12a. arena mística
  //
  // Logo depois de Bosses: o ticket CAI do boss, e o jogador chega aqui pela pergunta "o que é
  // esse drop roxo?". Tudo sai de `shared/mistico.mjs` — a escada do ticket, a tabela de captura,
  // o piso do capturado e o prazo da bola —, e o tamanho do sorteio vem do `welcome` (`misticoPool`).
  {
    id: 'mistico',
    titulo: { pt: 'Mystic Ticket e Arena Mística', en: 'Mystic Ticket and Mystic Arena', es: 'Mystic Ticket y Arena Mística' },
    grupo: 'mundo',
    html: (c) => {
      // No app o sorteio é um Set (`estado.misticoPool`); o `.length` dele era `undefined`, e a frase
      // do tamanho do sorteio nunca aparecia. Espalhado, vale para Set e para lista.
      const pool = [...(c.d.misticoPool ?? [])].length;
      const passo = P(CHANCE_TICKET_PASSO, c.lang);
      const nv = N(NIVEL_LENDARIO_MISTICO, c.lang);
      const seg = Math.round(MISTICO_ESCOLHA_MS / 1000);
      const multSelv = D(c.d.multDanoSelvagem ?? 1.8, c.lang);
      const q = D(MISTICO_QUALIDADE_MIN, c.lang);
      const iv = N(MISTICO_IV_SOMA_MIN, c.lang);
      const umEmPool = pool ? P(1 / pool, c.lang) : null;
      return {
        pt: `
        <p>O <b>Mystic Ticket</b> é o drop mais raro dos <a data-cap="bosses">Bosses</a>. Usado, ele
        abre a <b>Arena Mística</b>: uma sala roxa com <b>um Pokémon Lendário ou Mítico no seu nível de
        treinador</b>, sorteado${pool ? ` entre os <b>${N(pool, c.lang)}</b> que o jogo desenha — cada um com
        ${umEmPool} de chance` : ''}. Derrubou, você tem <b>uma bola</b> para tentar a captura.</p>

        <h4>De onde vem o ticket</h4>
        <p>Cai na <b>vitória</b> contra qualquer boss, como a peça de TM e o fragmento de Mega — e
        segue a mesma escada: <b>${passo}</b> no primeiro par de bosses, e mais ${passo} a cada par
        acima.</p>
        ${tabelaTicketPorPar(c)}
        <p>Ele aparece em <b>Boss → Recompensas</b> e na ficha de cada boss na
        <a data-cap="pokedex">Pokédex</a>, e é <b>negociável</b> no
        <a data-cap="comunidade">Mercado da Comunidade</a> (Itens → aba Tickets): quem não quer arriscar a
        tentativa vende.</p>

        <h4>Entrar na arena</h4>
        <ul>
          <li>Use em <b>Mochila → Itens Raros → Mystic Ticket</b>. Entra-se do <b>Centro Pokémon</b>, fora
          de combate, fora da fila do PvP, com a equipe de pé e pelo menos <b>uma pokébola</b> na
          mochila.</li>
          <li>O ticket é <b>gasto na entrada</b>. Se a equipe cair ou você abandonar a arena, ela acaba e
          ele <b>não volta</b>. Uma atualização do jogo com você lá dentro também encerra a arena.</li>
          <li><b>Caiu a conexão?</b> A internet caiu, você recarregou a página (F5) ou abriu o jogo em outra
          aba: a arena <b>não acaba</b>. Voltando em até <b>10 minutos</b>, você cai no <b>mesmo ponto</b> — o
          MESMO lendário, com a vida que ele tinha, e as recargas como estavam (enquanto você está fora, a luta
          fica parada). A bola continua sendo <b>uma só</b>: jogada antes da queda, ela não volta para a mão. O
          navegador pergunta antes de fechar ou recarregar a aba lá dentro.</li>
          <li>A recarga dos golpes começa <b>zerada</b>, como na arena de boss.</li>
          <li>Ele luta no <b>seu nível de treinador</b> — quem é nível 2.000 enfrenta o lendário no 2.000
          — e com o <b>×${MULT_LENDARIO_STATS} de lendário</b> em todos os atributos, o mesmo do lendário capturado.</li>
          <li>O lendário luta como um selvagem de hunt: com os golpes da espécie, o HP de selvagem e o
          ×${multSelv} de dano de selvagem. Não há penalidade de equipe, e ele não solta loot nem Coins — o prêmio é a
          chance da captura.</li>
        </ul>

        <h4>Uma bola, uma chance</h4>
        <p>Derrubado, o lendário fica no chão e a tela pede a pokébola. A chance é uma <b>tabela por
        bola</b>, a mesma para todo lendário: o Articuno e o Mewtwo custam o mesmo ticket, então saem
        com a mesma chance.</p>
        ${tabelaCapturaMistica(c)}
        <ul>
          <li>Você tem <b>${seg} segundos</b> para escolher. Passado isso, o jogo arremessa sozinho a
          <b>melhor bola</b> que você tiver — a tentativa é uma só, e perdê-la para uma aba em segundo
          plano seria perder o ticket.</li>
          <li>Capturou ou não, a arena fecha logo depois e você volta ao Centro.</li>
          <li>O <b>shiny</b> rola com a chance cheia do jogo.</li>
        </ul>

        <h4>O lendário capturado</h4>
        <p>Nasce no nível ${nv} — o teto de captura: a luta é no seu nível, o capturado não — e com
        <b>piso</b>, porque o ticket é raro demais para entregar um bicho de nascimento fraco:</p>
        <ul>
          <li><b>qualidade ${q} ou mais</b>;</li>
          <li><b>IV somado ${iv} ou mais</b> (de 192);</li>
          <li><b>potência P${MISTICO_POTENCIA_MIN} ou mais</b> — acima dela, cada potência continua com a
          chance de sempre.</li>
        </ul>
        <p>O piso é o mesmo para toda espécie, e ele já nasce com o ×${MULT_LENDARIO_STATS} de lendário — a
        chance de cada potência na arena e quanto cada combinação multiplica estão em
        <a data-cap="lendarios">Lendários e Míticos</a>.</p>
        <p>O <b>chat Mundo inteiro</b> fica sabendo da captura, e o canal 🔮┃radar-lendario do nosso
        Discord conta quem dropou um ticket, quem entrou na arena e como terminou.</p>
        ${nota(`A ficha de cada boss na <a data-cap="pokedex">Pokédex</a> tem o painel <b>Captura com o
        Mystic Ticket</b>: de onde o ticket cai, a chance de sair <b>aquele</b> lendário, o nível dele na
        arena e a tabela de captura por bola.`, 'dica')}`,
        en: `
        <p>The <b>Mystic Ticket</b> is the rarest drop of the <a data-cap="bosses">Bosses</a>. Used, it
        opens the <b>Mystic Arena</b>: a purple room with <b>one Legendary or Mythical Pokémon at your
        trainer level</b>, drawn${pool ? ` from the <b>${N(pool, c.lang)}</b> the game can draw — each with a
        ${umEmPool} chance` : ''}. Knock it down and you get <b>one ball</b> to try the catch.</p>

        <h4>Where the ticket comes from</h4>
        <p>It drops on a <b>win</b> against any boss, like the TM piece and the Mega fragment — and
        follows the same ladder: <b>${passo}</b> on the first pair of bosses, and ${passo} more for each
        pair above.</p>
        ${tabelaTicketPorPar(c)}
        <p>It shows in <b>Boss → Rewards</b> and on each boss's sheet in the
        <a data-cap="pokedex">Pokédex</a>, and it is <b>tradeable</b> on the
        <a data-cap="comunidade">Community Market</a> (Items → Tickets tab): whoever doesn't want to risk the
        attempt sells it.</p>

        <h4>Entering the arena</h4>
        <ul>
          <li>Use it from <b>Backpack → Rare Items → Mystic Ticket</b>. You enter from the <b>Pokémon
          Center</b>, out of combat, out of the PvP queue, with your team standing and at least <b>one
          poké ball</b> in the backpack.</li>
          <li>The ticket is <b>spent on entry</b>. If your team falls or you abandon the arena, it ends and the
          ticket <b>does not come back</b>. A game update while you are inside also ends the arena.</li>
          <li><b>Connection dropped?</b> Your internet dropped, you reloaded the page (F5) or opened the game in
          another tab: the arena <b>does not end</b>. Come back within <b>10 minutes</b> and you land on the
          <b>same spot</b> — the SAME legendary, with the HP it had, and the cooldowns as they were (while you
          are away, the fight stands still). The ball is still <b>a single one</b>: thrown before the drop, it
          does not come back to your hand. The browser asks before closing or reloading the tab in there.</li>
          <li>Move cooldowns start <b>reset</b>, as in a boss arena.</li>
          <li>It fights at <b>your trainer level</b> — a level 2,000 trainer faces the legendary at
          2,000 — and with the <b>legendary ×${MULT_LENDARIO_STATS}</b> on every stat, the same as the caught legendary.</li>
          <li>The legendary fights like a hunt wild: with its species' moves, the wild HP and the
          ×${multSelv} wild damage. There is no team penalty, and it drops no loot or Coins — the prize is the catch
          chance.</li>
        </ul>

        <h4>One ball, one chance</h4>
        <p>Once down, the legendary stays on the ground and the screen asks for a poké ball. The
        chance is a <b>per-ball table</b>, the same for every legendary: Articuno and Mewtwo cost the
        same ticket, so they come out with the same chance.</p>
        ${tabelaCapturaMistica(c)}
        <ul>
          <li>You have <b>${seg} seconds</b> to choose. After that, the game throws the <b>best ball</b>
          you have by itself — there is only one try, and losing it to a background tab would mean
          losing the ticket.</li>
          <li>Caught or not, the arena closes right after and you go back to the Center.</li>
          <li><b>Shiny</b> rolls with the game's full chance.</li>
        </ul>

        <h4>The caught legendary</h4>
        <p>It is born at level ${nv} — the catch cap: the fight is at your level, the catch is not —
        and with a <b>floor</b>, because the ticket is too rare to hand over a poorly born pokémon:</p>
        <ul>
          <li><b>quality ${q} or more</b>;</li>
          <li><b>IV total ${iv} or more</b> (out of 192);</li>
          <li><b>potency P${MISTICO_POTENCIA_MIN} or more</b> — above it, every potency keeps its usual chance.</li>
        </ul>
        <p>The floor is the same for every species, and it is born with the legendary ×${MULT_LENDARIO_STATS}
        already — the chance of each potency in the arena and how much each combination multiplies are in
        <a data-cap="lendarios">Legendaries and Mythicals</a>.</p>
        <p>The <b>whole World chat</b> hears about the catch, and the 🔮┃radar-lendario channel on our
        Discord tells who dropped a ticket, who entered the arena and how it ended.</p>
        ${nota(`Each boss's sheet in the <a data-cap="pokedex">Pokédex</a> has the <b>Catching it with
        the Mystic Ticket</b> panel: where the ticket drops, the chance of getting <b>that</b>
        legendary, its level in the arena and the per-ball catch table.`, 'dica')}`,
        es: `
        <p>El <b>Mystic Ticket</b> es el drop más raro de los <a data-cap="bosses">Bosses</a>. Usado,
        abre la <b>Arena Mística</b>: una sala morada con <b>un Pokémon Legendario o Singular en tu nivel
        de entrenador</b>, sorteado${pool ? ` entre los <b>${N(pool, c.lang)}</b> que el juego dibuja — cada uno con
        ${umEmPool} de probabilidad` : ''}. Si lo derribas, tienes <b>una ball</b> para intentar la
        captura.</p>

        <h4>De dónde sale el ticket</h4>
        <p>Cae al <b>vencer</b> a cualquier boss, como la pieza de TM y el fragmento de Mega — y sigue
        la misma escalera: <b>${passo}</b> en el primer par de bosses, y ${passo} más por cada par por
        encima.</p>
        ${tabelaTicketPorPar(c)}
        <p>Aparece en <b>Boss → Recompensas</b> y en la ficha de cada boss en la
        <a data-cap="pokedex">Pokédex</a>, y es <b>negociable</b> en el
        <a data-cap="comunidade">Mercado de la Comunidad</a> (Objetos → pestaña Tickets): quien no quiere arriesgar
        el intento lo vende.</p>

        <h4>Entrar en la arena</h4>
        <ul>
          <li>Úsalo desde <b>Mochila → Objetos Raros → Mystic Ticket</b>. Se entra desde el <b>Centro
          Pokémon</b>, fuera de combate, fuera de la cola del PvP, con el equipo en pie y al menos
          <b>una poké ball</b> en la mochila.</li>
          <li>El ticket se <b>gasta al entrar</b>. Si tu equipo cae o abandonas la arena, ella termina y el
          ticket <b>no vuelve</b>. Una actualización del juego contigo adentro también termina la arena.</li>
          <li><b>¿Se cayó la conexión?</b> Se cayó internet, recargaste la página (F5) o abriste el juego en
          otra pestaña: la arena <b>no termina</b>. Si vuelves en hasta <b>10 minutos</b>, caes en el <b>mismo
          punto</b> — el MISMO legendario, con la vida que tenía, y las recargas como estaban (mientras no estás,
          la pelea queda quieta). La ball sigue siendo <b>una sola</b>: lanzada antes de la caída, no vuelve a tu
          mano. El navegador pregunta antes de cerrar o recargar la pestaña allí dentro.</li>
          <li>La recarga de los golpes empieza <b>reiniciada</b>, como en la arena de boss.</li>
          <li>Pelea en <b>tu nivel de entrenador</b> — quien es nivel 2.000 enfrenta al legendario en
          el 2.000 — y con el <b>×${MULT_LENDARIO_STATS} de legendario</b> en todos los atributos, el mismo del legendario
          capturado.</li>
          <li>El legendario pelea como un salvaje de cacería: con los golpes de la especie, el HP de
          salvaje y el ×${multSelv} de daño de salvaje. No hay penalización de equipo, y no suelta loot ni Coins — el
          premio es la probabilidad de captura.</li>
        </ul>

        <h4>Una ball, una oportunidad</h4>
        <p>Derribado, el legendario queda en el suelo y la pantalla pide la poké ball. La probabilidad
        es una <b>tabla por ball</b>, la misma para todo legendario: Articuno y Mewtwo cuestan el mismo
        ticket, así que salen con la misma probabilidad.</p>
        ${tabelaCapturaMistica(c)}
        <ul>
          <li>Tienes <b>${seg} segundos</b> para elegir. Pasado ese tiempo, el juego lanza solo la
          <b>mejor ball</b> que tengas — el intento es uno solo, y perderlo por una pestaña en segundo
          plano sería perder el ticket.</li>
          <li>Lo captures o no, la arena se cierra enseguida y vuelves al Centro.</li>
          <li>El <b>shiny</b> se sortea con la probabilidad completa del juego.</li>
        </ul>

        <h4>El legendario capturado</h4>
        <p>Nace en el nivel ${nv} — el tope de captura: la pelea es en tu nivel, la captura no — y con
        <b>piso</b>, porque el ticket es demasiado raro para entregar un pokémon de nacimiento flojo:</p>
        <ul>
          <li><b>calidad ${q} o más</b>;</li>
          <li><b>IV sumado ${iv} o más</b> (de 192);</li>
          <li><b>potencia P${MISTICO_POTENCIA_MIN} o más</b> — por encima de ella, cada potencia sigue con la
          probabilidad de siempre.</li>
        </ul>
        <p>El piso es el mismo para toda especie, y nace ya con el ×${MULT_LENDARIO_STATS} de legendario — la
        probabilidad de cada potencia en la arena y cuánto multiplica cada combinación están en
        <a data-cap="lendarios">Legendarios y Míticos</a>.</p>
        <p><b>Todo el chat Mundo</b> se entera de la captura, y el canal 🔮┃radar-lendario de nuestro
        Discord cuenta quién dropeó un ticket, quién entró en la arena y cómo terminó.</p>
        ${nota(`La ficha de cada boss en la <a data-cap="pokedex">Pokédex</a> tiene el panel <b>Captura
        con el Mystic Ticket</b>: de dónde cae el ticket, la probabilidad de que salga <b>ese</b>
        legendario, su nivel en la arena y la tabla de captura por ball.`, 'dica')}`,
      };
    },
  },

  // ------------------------------------------------------------ 12a·2. safari
  //
  // Logo depois da Arena Mística: os dois tickets caem do boss e se usam na Bolsa. A hora e a chance do
  // ticket saem de `shared/safari.mjs` (a do ticket é a do Fragmento de Mega Shiny Stone), como o nível dos
  // selvagens e a regra do capturado (o dobro do "Nível ao capturar", até o teto do Safari); o tamanho do
  // sorteio vem do `welcome` (`safariPool`).
  {
    id: 'safari',
    titulo: { pt: 'Safari Ticket e Safari', en: 'Safari Ticket and the Safari', es: 'Safari Ticket y el Safari' },
    grupo: 'mundo',
    html: (c) => {
      const pool = Number(c.d.safariPool) || 0;
      const umEmPool = pool ? P(1 / pool, c.lang) : null;
      const min = N(Math.round(SAFARI_DURACAO_MS / 60000), c.lang);
      const passo = P(chanceSafariTicketDoPar(0), c.lang);
      const nvSelvagem = N(NIVEL_SELVAGEM_SAFARI, c.lang);
      const tetoSafari = N(TETO_CAPTURA_SAFARI, c.lang);
      // A conta do dobro com dois exemplos: um do meio da escada (40) e o maior "Nível ao capturar" (100).
      const ex40 = N(nivelDeCapturaNoSafari(40), c.lang);
      const ex100 = N(nivelDeCapturaNoSafari(TETO_CAPTURA_MAX), c.lang);
      const cem = N(TETO_CAPTURA_MAX, c.lang);
      return {
        pt: `
        <p>O <b>Safari Ticket</b> cai dos <a data-cap="bosses">Bosses</a> e abre o <b>Safari</b>: <b>${min} minutos</b>
        num mapa só dele, em que <b>cada aparição é uma espécie sorteada</b>${pool ? ` entre <b>${N(pool, c.lang)}</b> — cada
        uma com ${umEmPool} de chance` : ''} —, sem Outland, Mega, lendário nem mítico. Lá se caça para <b>capturar</b>.</p>

        <h4>De onde vem o ticket</h4>
        <p>Cai na <b>vitória</b> contra qualquer boss, com a <b>mesma chance do Fragmento de Mega Stone Shiny</b>:
        <b>${passo}</b> no primeiro par de bosses, e mais ${passo} a cada par acima.</p>
        ${tabelaSafariTicketPorPar(c)}
        <p>É <b>negociável</b> no <a data-cap="comunidade">Mercado da Comunidade</a> (Itens → aba Tickets).</p>

        <h4>Entrar</h4>
        <ul>
          <li>Use em <b>Mochila → Itens Raros → Safari Ticket</b>. Dá para entrar do Centro Pokémon, de casa ou de
          uma hunt, com as mesmas travas da troca de hunt (3 s sem combate), fora das arenas de
          boss e da Arena Mística, com a equipe de pé e pelo menos <b>uma pokébola</b> na mochila.</li>
          <li>O ticket é gasto na entrada, e os ${min} minutos começam a correr <b>no Entrar</b>.</li>
        </ul>

        <h4>Sem volta</h4>
        <p>Como na <a data-cap="mistico">Arena Mística</a>, o Safari <b>não tem volta</b>: a hora acaba antes do fim
        em qualquer uma destas, e voltar só com <b>outro ticket</b>.</p>
        <ul>
          <li><b>Sair por vontade própria</b> — pelo Centro, pela corda, desistindo do combate ou escolhendo outra
          área no Mapa. O jogo pergunta antes.</li>
          <li><b>O time cair</b> lá dentro.</li>
          <li><b>Uma atualização do jogo</b> com você lá dentro: o servidor reinicia, e o Safari acaba junto.</li>
        </ul>
        <p><b>Por quê:</b> com a volta, bastava deixar o time cair de propósito para ganhar uma onda nova, até
        aparecer o pokémon desejado. As capturas feitas antes do fim ficam na conta, e um resumo diz quantas foram
        e por que a hora acabou. As ondas também seguem uma <b>sequência sorteada uma vez por ticket</b>.</p>

        <h4>Caiu a conexão? Você volta de onde parou</h4>
        <p>A internet caiu, você recarregou a página (F5), fechou a aba ou abriu o jogo em outra aba: o Safari
        <b>não acaba</b>. Voltando antes de a hora terminar, você cai no <b>mesmo ponto</b> — os mesmos pokémon
        selvagens, com a mesma vida, o seu time com a vida que tinha e as recargas (golpes, bola, o corpo no chão)
        como estavam na queda. Enquanto você está fora, a luta fica parada; a hora, não: ela corre no relógio e
        não pausa. Com o Safari aberto, o navegador pergunta antes de fechar ou recarregar a aba.</p>
        <p>A hora acabou com você lá dentro: o Safari fecha, você sobe ao Centro e o mesmo resumo diz quantas
        capturas você fez.</p>

        <h4>O que muda lá dentro</h4>
        <ul>
          <li>Os selvagens vêm no <b>Nv ${nvSelvagem}</b>, para todo treinador: caem num golpe, e a hora vira bola.</li>
          <li>O capturado nasce no <b>dobro do nível de captura</b> da espécie — o <b>Nível ao capturar</b> da ficha
          dela na <a data-cap="pokedex">Pokédex</a> —, até o <b>Nv ${tetoSafari}</b>: nível de captura 40 vira
          <b>Nv ${ex40}</b>; ${cem} vira <b>Nv ${ex100}</b>.</li>
          <li>A captura é a de sempre: com as <b>suas</b> pokébolas, pelo painel de capturar (ou pelo auto-ball,
          para quem é VIP), com a chance de cada bola e o <b>shiny</b> rolando normalmente.</li>
          <li>Derrotar <b>não dá XP</b> (nem de treinador, nem de pokémon), <b>nem itens, nem Coins</b>.</li>
          <li>Na <a data-cap="pokedex">Pokédex</a>, a ficha de cada espécie do sorteio mostra o Safari em
          <b>Onde encontrar</b>, com a chance de cada aparição ser ela e o nível com que ela sai de lá.</li>
        </ul>`,
        en: `
        <p>The <b>Safari Ticket</b> drops from the <a data-cap="bosses">Bosses</a> and opens the <b>Safari</b>:
        <b>${min} minutes</b> on a map of its own, where <b>every appearance is a random species</b>${pool ? ` out of
        <b>${N(pool, c.lang)}</b> — each with a ${umEmPool} chance` : ''} —, with no Outland, Mega, legendary or mythical.
        You hunt there to <b>catch</b>.</p>

        <h4>Where the ticket comes from</h4>
        <p>It drops on a <b>win</b> against any boss, with the <b>same chance as the Shiny Mega Stone Fragment</b>:
        <b>${passo}</b> on the first pair of bosses, and ${passo} more for each pair above.</p>
        ${tabelaSafariTicketPorPar(c)}
        <p>It is <b>tradeable</b> on the <a data-cap="comunidade">Community Market</a> (Items → Tickets tab).</p>

        <h4>Entering</h4>
        <ul>
          <li>Use it from <b>Backpack → Rare Items → Safari Ticket</b>. You can enter from the Pokémon Center, from your
          house or from a hunt, with the same locks as switching hunts (3 s out of combat),
          outside the boss arenas and the Mystic Arena, with your team standing and at least <b>one poké ball</b>
          in the backpack.</li>
          <li>The ticket is spent on entry, and the ${min} minutes start running <b>on Enter</b>.</li>
        </ul>

        <h4>No way back</h4>
        <p>Like the <a data-cap="mistico">Mystic Arena</a>, the Safari <b>has no way back</b>: the hour ends early in
        any of these, and coming back takes <b>another ticket</b>.</p>
        <ul>
          <li><b>Leaving on your own</b> — through the Center, with the rope, giving up the fight or picking another
          area on the Map. The game asks first.</li>
          <li><b>Your team fainting</b> inside.</li>
          <li><b>A game update</b> while you are inside: the server restarts, and the Safari ends with it.</li>
        </ul>
        <p><b>Why:</b> with a way back, letting your team faint on purpose was enough to get a new wave, until the
        Pokémon you wanted showed up. Catches made before the end stay on your account, and a summary tells how
        many there were and why the hour ended. The waves also follow a <b>sequence drawn once per ticket</b>.</p>

        <h4>Connection dropped? You come back where you left off</h4>
        <p>Your internet dropped, you reloaded the page (F5), closed the tab or opened the game in another tab:
        the Safari <b>does not end</b>. Come back before the hour is up and you land on the <b>same spot</b> — the
        same wild Pokémon, with the same HP, your team with the HP it had, and the cooldowns (moves, ball, the
        body on the ground) as they were when you dropped. While you are away the fight stands still; the hour
        does not: it runs on the clock and never pauses. With the Safari open, the browser asks before closing or
        reloading the tab.</p>
        <p>The hour ended with you inside: the Safari closes, you go up to the Center and the same summary tells how
        many catches you made.</p>

        <h4>What changes inside</h4>
        <ul>
          <li>Wild Pokémon come at <b>Lv ${nvSelvagem}</b>, for every trainer: one hit and they are down, and the
          hour turns into balls.</li>
          <li>Your catch is born at <b>double the species' catch level</b> — the <b>Level when caught</b> on its
          <a data-cap="pokedex">Pokédex</a> page —, up to <b>Lv ${tetoSafari}</b>: catch level 40 becomes
          <b>Lv ${ex40}</b>; ${cem} becomes <b>Lv ${ex100}</b>.</li>
          <li>Catching works as always: with <b>your own</b> poké balls, from the catch panel (or with auto-ball, for
          VIPs), with each ball's chance and <b>shiny</b> rolling as usual.</li>
          <li>Defeating gives <b>no XP</b> (trainer or pokémon), <b>no items and no Coins</b>.</li>
          <li>In the <a data-cap="pokedex">Pokédex</a>, the sheet of every species in the draw shows the Safari
          under <b>Where to find it</b>, with the chance of each appearance being it and the level it comes out at.</li>
        </ul>`,
        es: `
        <p>El <b>Safari Ticket</b> cae de los <a data-cap="bosses">Bosses</a> y abre el <b>Safari</b>: <b>${min}
        minutos</b> en un mapa propio, donde <b>cada aparición es una especie sorteada</b>${pool ? ` entre
        <b>${N(pool, c.lang)}</b> — cada una con ${umEmPool} de probabilidad` : ''} —, sin Outland, Mega, legendario ni
        singular. Allí se caza para <b>capturar</b>.</p>

        <h4>De dónde sale el ticket</h4>
        <p>Cae al <b>vencer</b> a cualquier boss, con la <b>misma probabilidad del Fragmento de Mega Stone
        Shiny</b>: <b>${passo}</b> en el primer par de bosses, y ${passo} más por cada par por encima.</p>
        ${tabelaSafariTicketPorPar(c)}
        <p>Es <b>negociable</b> en el <a data-cap="comunidade">Mercado de la Comunidad</a> (Objetos → pestaña
        Tickets).</p>

        <h4>Entrar</h4>
        <ul>
          <li>Úsalo desde <b>Mochila → Objetos Raros → Safari Ticket</b>. Se puede entrar desde el Centro Pokémon,
          desde casa o desde una cacería, con los mismos bloqueos del cambio de cacería (3 s sin combate),
          fuera de las arenas de boss y de la Arena Mística, con el equipo en pie y al menos
          <b>una poké ball</b> en la mochila.</li>
          <li>El ticket se gasta al entrar, y los ${min} minutos empiezan a correr <b>en Entrar</b>.</li>
        </ul>

        <h4>Sin vuelta</h4>
        <p>Como en la <a data-cap="mistico">Arena Mística</a>, el Safari <b>no tiene vuelta</b>: la hora termina antes
        de tiempo en cualquiera de estos casos, y volver solo con <b>otro ticket</b>.</p>
        <ul>
          <li><b>Salir por voluntad propia</b> — por el Centro, con la cuerda, abandonando el combate o eligiendo otra
          zona en el Mapa. El juego pregunta antes.</li>
          <li><b>Que tu equipo caiga</b> dentro.</li>
          <li><b>Una actualización del juego</b> contigo adentro: el servidor se reinicia, y el Safari termina con
          él.</li>
        </ul>
        <p><b>Por qué:</b> con la vuelta, bastaba con dejar caer al equipo a propósito para ganar una oleada nueva,
        hasta que apareciera el pokémon deseado. Las capturas hechas antes del final se quedan en la cuenta, y un
        resumen dice cuántas fueron y por qué terminó la hora. Las oleadas también siguen una <b>secuencia sorteada
        una vez por ticket</b>.</p>

        <h4>¿Se cayó la conexión? Vuelves donde lo dejaste</h4>
        <p>Se cayó internet, recargaste la página (F5), cerraste la pestaña o abriste el juego en otra pestaña: el
        Safari <b>no termina</b>. Si vuelves antes de que termine la hora, caes en el <b>mismo punto</b> — los
        mismos pokémon salvajes, con la misma vida, tu equipo con la vida que tenía y las recargas (golpes, ball,
        el cuerpo en el suelo) como estaban en la caída. Mientras no estás, la pelea queda quieta; la hora, no:
        corre en el reloj y no se pausa. Con el Safari abierto, el navegador pregunta antes de cerrar o recargar
        la pestaña.</p>
        <p>La hora terminó contigo dentro: el Safari se cierra, subes al Centro y el mismo resumen dice cuántas
        capturas hiciste.</p>

        <h4>Qué cambia allí dentro</h4>
        <ul>
          <li>Los salvajes vienen en el <b>Nv ${nvSelvagem}</b>, para todo entrenador: caen de un golpe, y la hora
          se vuelve ball.</li>
          <li>Lo capturado nace en el <b>doble del nivel de captura</b> de la especie — el <b>Nivel al capturar</b>
          de su ficha en la <a data-cap="pokedex">Pokédex</a> —, hasta el <b>Nv ${tetoSafari}</b>: nivel de captura
          40 pasa a <b>Nv ${ex40}</b>; ${cem} pasa a <b>Nv ${ex100}</b>.</li>
          <li>La captura es la de siempre: con <b>tus</b> poké balls, desde el panel de capturar (o con la
          auto-ball, para quien es VIP), con la probabilidad de cada ball y el <b>shiny</b> sorteándose como
          siempre.</li>
          <li>Derrotar <b>no da XP</b> (ni de entrenador, ni de pokémon), <b>ni objetos, ni Coins</b>.</li>
          <li>En la <a data-cap="pokedex">Pokédex</a>, la ficha de cada especie del sorteo muestra el Safari en
          <b>Dónde encontrarlo</b>, con la probabilidad de que cada aparición sea ella y el nivel con que sale de
          allí.</li>
        </ul>`,
      };
    },
  },

  // ------------------------------------------------------------ 12b. mega evolução
  //
  // Depois de Bosses, e não junto de Evolução: o que o jogador precisa entender primeiro é
  // ONDE o fragmento cai, e isso é o capítulo de cima. A evolução por pedra de tipo e a mega
  // são duas moedas diferentes para dois destinos diferentes, e misturá-las num capítulo só
  // faria o leitor achar que uma Water Stone tem algo a ver com a Gyaradosite.
  {
    id: 'mega',
    titulo: { pt: 'Mega Evolução', en: 'Mega Evolution', es: 'Mega Evolución' },
    grupo: 'mundo',
    html: (c) => {
      const n = MEGAS.length;
      const semShiny = MEGAS.filter((m) => !megaTemShiny(m)).length;
      const custo = c.d.mega?.custo ?? 10;
      const base = pctMega(c.d.mega?.chanceBase ?? 0.005);
      const baseShiny = pctMega(c.d.mega?.chanceBaseShiny ?? 0.0025);
      const lista = MEGAS.map((m) => m.nome.replace(/^Mega /, '')).join(', ');
      return {
        pt: `
        <p>A <b>Mega Evolução</b> troca o seu pokémon pela <b>forma Mega</b> dele: arte nova,
        <b>stats-base novos</b> e, em muitas, <b>tipos novos</b>. São <b>${n}</b> megas no jogo, e
        elas entram na Pokédex numa aba própria — a aba <b>Mega</b>, na faixa <b>#3000</b>
        (Mega Gengar é o <b>#3094</b>, que é <code>3000 + 94</code>, o dex do Gengar).</p>

        ${nota(`Não é bônus de porcentagem. As seis bases são <b>substituídas</b> pelas da
        Pokédex oficial: Mega Alakazam tem <b>175</b> de Sp. Atk contra 135, e Mega Aggron troca
        Sp. Atk por <b>230</b> de Defense. O seu <a data-cap="stats">refino</a>, o IV, a
        qualidade e a potência continuam valendo <b>por cima</b> disso.`, 'dica')}

        <h4>Um terceiro golpe de 600, na METADE da recarga</h4>
        <p>A mega tem um <b>moveset próprio</b>, montado para os tipos <b>dela</b> — a Mega
        Gyarados, que é WATER/DARK, bate de DARK —, e as poucas que não precisaram de ajuste
        herdam o da espécie base. Todas têm o <b>golpe de mega</b>: 600 de poder, de um dos
        <b>tipos dela</b> (logo, sempre com STAB) e com <b>30 s</b> de recarga. Somado aos dois
        golpes de 600 de toda última evolução, a mega fica com <b>três</b>.</p>
        ${nota(`Os 30 s são a única coisa do catálogo que sai da curva de cooldown de propósito
        — todo outro golpe de 600 recarrega em 60 s. É o que a mega de fato entrega: o golpe
        dispara <b>duas vezes</b> no tempo em que os outros dois disparam uma. O gargalo de um
        pokémon de endgame é a recarga, não a falta de opção.`, 'dica')}

        <h4>O caminho, em quatro passos</h4>
        <ol>
          <li><b>Derrote bosses.</b> Todo boss lendário solta <b>Fragmento de Mega Stone</b> e
          <b>Fragmento de Mega Shiny Stone</b>, além da peça de TM de sempre (ver
          <a data-cap="bosses">Bosses</a>).</li>
          <li><b>Junte ${custo}.</b> Os fragmentos também se compram no
          <a data-cap="comunidade">Mercado da Comunidade</a>.</li>
          <li><b>Professor Carvalho, bancada Mega.</b> Os ${custo} fragmentos viram a
          <b>Mega Stone da espécie que VOCÊ escolher</b> — não há sorteio.</li>
          <li><b>Mega Evoluir.</b> Com a pedra na mochila, o botão dourado aparece no pokémon.</li>
        </ol>

        <h4>A chance no boss sobe com o degrau</h4>
        <p>É a <b>mesma escada</b> da peça de TM: <b>${base}</b> no primeiro par de bosses
        (Nv 300), o <b>dobro</b> no segundo (Nv 650) e mais um degrau a cada par. O fragmento
        <b>shiny</b> é sempre a <b>metade</b> do comum — <b>${baseShiny}</b> no Nv 300.</p>
        ${tabela(
          ['Par de bosses', 'Fragmento de Mega', 'Fragmento de Mega Shiny'],
          [0, 1, 2, 3].map((par) => `<tr>
            <td><b>${par === 0 ? 'Nv 300' : par === 1 ? 'Nv 650' : `${par + 1}º par`}</b></td>
            <td>${pctMega(0.005 * (par + 1))}</td>
            <td>${pctMega(0.0025 * (par + 1))}</td>
          </tr>`).join(''),
        )}
        ${nota(`A chance da ficha de cada boss está na aba <b>Boss</b>, no bloco
        <b>Recompensas</b> — ela é por vitória, e cresce par a par até o último boss da lista.`)}

        <h4>Shiny pede pedra shiny</h4>
        <p>Um pokémon <b>shiny</b> só megaevolui com a <b>Shiny Mega Stone</b>, e <b>continua
        shiny</b> depois. A pedra comum <b>recusa</b> shiny — de propósito: sem essa trava, o
        item mais raro da conta viraria uma mega de cor comum, e não há como desfazer.</p>
        ${semShiny === 0
          ? nota(`<b>As ${n} têm forma shiny</b> — nenhuma fica de fora. Se um dia uma mega nova
          chegar só com a arte comum, ela entra sem Shiny Stone no catálogo e a bancada não a
          oferece: uma pedra que não dá para usar seria pior do que uma pedra que não existe.`)
          : nota(`<b>${semShiny === 1 ? 'Uma mega ainda não tem arte shiny' : `${semShiny} megas ainda não têm arte shiny`}.</b>
          Enquanto a arte não entra, a Shiny Stone dela não existe no catálogo e um shiny daquela
          espécie não megaevolui. Uma pedra que não dá para usar seria pior do que uma pedra que
          não existe.`, 'aviso')}

        <h4>O que muda, e o que não muda</h4>
        <ul>
          <li><b>Os tipos podem mudar.</b> Mega Gyarados vira WATER/DARK, Mega Ampharos ganha
          DRAGON, Mega Sceptile ganha DRAGON. Isso mexe no STAB, na
          <a data-cap="tipos">efetividade</a> e até na pedra de <a data-cap="stats">refino</a> — mas não no
          <a data-cap="tm">TM</a> elemental, que continua valendo mesmo que o tipo dele suma.</li>
          <li><b>Não tem volta</b>, como toda evolução aqui — e por isso o pokémon megaevoluído vai
          para a sua <b>Coleção</b>, fora da venda ao NPC (devolver ao Depot é um clique).</li>
          <li>A <a data-cap="nota">Calculadora</a> mostra o <b>Potencial na Mega Evolução</b>: a nota
          que o mesmo nascimento teria na forma Mega, antes de você gastar a pedra.</li>
          <li><b>A nota nunca cai.</b> Megaevoluir sempre <b>sobe</b> o N=, pela mesma regra que
          vale para evoluir (ver <a data-cap="nota">A nota</a>).</li>
          <li>Uma mega <b>não evolui de novo</b>, e variantes de <b>Outland não megaevoluem</b>.
          Os clones de Orre megaevoluem normalmente — são a mesma espécie.</li>
          <li>Mega <b>não aparece em hunt</b> e <b>não se captura</b>: ela só existe fabricada.</li>
        </ul>

        <h4>Tudo isso se negocia</h4>
        <p>Os <b>dois fragmentos</b> vão para a aba <b>Fragmentos</b> do Mercado da Comunidade, e
        as <b>${n * 2 - semShiny} pedras</b> (comuns e shiny) têm aba própria: <b>Mega Stones</b>.
        Nenhuma delas vende ao NPC — quem define o preço é a comunidade.</p>

        <h4>As ${n} megas</h4>
        <p>${lista}.</p>`,

        en: `
        <p><b>Mega Evolution</b> swaps your pokémon for its <b>Mega form</b>: new art, <b>new base
        stats</b> and, in many of them, <b>new types</b>. There are <b>${n}</b> megas in the game,
        and they join the Pokédex in a tab of their own — the <b>Mega</b> tab, in the
        <b>#3000</b> range (Mega Gengar is <b>#3094</b>, which is <code>3000 + 94</code>,
        Gengar's dex).</p>

        ${nota(`This is not a percentage bonus. The six base stats are <b>replaced</b> by the
        official Pokédex ones: Mega Alakazam has <b>175</b> Sp. Atk against 135, and Mega Aggron
        trades Sp. Atk for <b>230</b> Defense. Your <a data-cap="stats">refine</a>, IV, quality
        and potency still stack <b>on top</b> of that.`, 'dica')}

        <h4>A third 600 move, at HALF the cooldown</h4>
        <p>A mega has <b>its own moveset</b>, built for <b>its</b> types — Mega Gyarados, which
        is WATER/DARK, hits with DARK — and the few that needed no change inherit the base
        species' one. Every mega has the <b>mega move</b>: 600 power, of one of <b>its types</b>
        (so always with STAB) and with a <b>30 s</b> cooldown. Added to the two 600 moves every
        final evolution has, a mega ends up with <b>three</b>.</p>
        ${nota(`Those 30 s are the only thing in the catalogue that leaves the cooldown curve on
        purpose — every other 600 move recharges in 60 s. It is what the mega actually delivers:
        the move fires <b>twice</b> in the time the other two fire once. The bottleneck for an
        endgame pokémon is the cooldown, not the lack of options.`, 'dica')}

        <h4>The path, in four steps</h4>
        <ol>
          <li><b>Beat bosses.</b> Every legendary boss drops <b>Mega Stone Fragment</b> and
          <b>Mega Shiny Stone Fragment</b>, on top of the usual TM piece (see
          <a data-cap="bosses">Bosses</a>).</li>
          <li><b>Collect ${custo}.</b> Fragments are also buyable on the
          <a data-cap="comunidade">Community Market</a>.</li>
          <li><b>Professor Oak, Mega bench.</b> The ${custo} fragments become the
          <b>Mega Stone of the species YOU pick</b> — there is no lottery.</li>
          <li><b>Mega Evolve.</b> With the stone in your backpack, the golden button shows up on the
          pokémon.</li>
        </ol>

        <h4>The boss drop rate climbs with the step</h4>
        <p>It is the <b>same ladder</b> as the TM piece: <b>${base}</b> on the first boss pair
        (Lv 300), <b>double</b> on the second (Lv 650) and one more step per pair. The
        <b>shiny</b> fragment is always <b>half</b> of the normal one — <b>${baseShiny}</b> at
        Lv 300.</p>
        ${tabela(
          ['Boss pair', 'Mega Fragment', 'Mega Shiny Fragment'],
          [0, 1, 2, 3].map((par) => `<tr>
            <td><b>${par === 0 ? 'Lv 300' : par === 1 ? 'Lv 650' : `pair #${par + 1}`}</b></td>
            <td>${pctMega(0.005 * (par + 1))}</td>
            <td>${pctMega(0.0025 * (par + 1))}</td>
          </tr>`).join(''),
        )}
        ${nota(`Each boss's own rate is on the <b>Boss</b> tab, in the <b>Rewards</b> block — it
        is per win, and it grows pair by pair up to the last boss on the list.`)}

        <h4>Shiny needs the shiny stone</h4>
        <p>A <b>shiny</b> pokémon only mega evolves with the <b>Shiny Mega Stone</b>, and it
        <b>stays shiny</b> afterwards. The normal stone <b>refuses</b> shiny on purpose: without
        that lock, the rarest item on the account would turn into a normal-coloured mega, and
        there is no undo.</p>
        ${semShiny === 0
          ? nota(`<b>All ${n} have a shiny form</b> — none is left out. If a new mega ever arrives
          with only the normal art, it joins with no Shiny Stone in the catalogue and the bench
          does not offer one: a stone you cannot use would be worse than a stone that does not
          exist.`)
          : nota(`<b>${semShiny === 1 ? 'One mega has no shiny art yet' : `${semShiny} megas have no shiny art yet`}.</b>
          Until the art lands, its Shiny Stone does not exist in the catalogue and a shiny of
          that species cannot mega evolve. A stone you cannot use would be worse than a stone
          that does not exist.`, 'aviso')}

        <h4>What changes, and what does not</h4>
        <ul>
          <li><b>Typing can change.</b> Mega Gyarados turns WATER/DARK, Mega Ampharos gains
          DRAGON, Mega Sceptile gains DRAGON. That changes STAB,
          <a data-cap="tipos">effectiveness</a> and even the <a data-cap="stats">refine</a>
          stone — but not the elemental <a data-cap="tm">TM</a>, which keeps working even if its type goes
          away.</li>
          <li><b>There is no going back</b>, like every evolution here — which is why the mega
          evolved pokémon goes to your <b>Collection</b>, out of NPC selling (sending it back to the
          Depot is one click).</li>
          <li>The <a data-cap="nota">Calculator</a> shows the <b>Potential at Mega Evolution</b>: the
          score the same birth would have in Mega form, before you spend the stone.</li>
          <li><b>The grade never drops.</b> Mega evolving always <b>raises</b> the N=, by the
          same rule that applies to evolving (see <a data-cap="nota">The grade</a>).</li>
          <li>A mega <b>does not evolve again</b>, and <b>Outland variants do not mega
          evolve</b>. Orre clones do — they are the same species.</li>
          <li>Megas <b>appear in no hunt</b> and <b>cannot be caught</b>: they only exist
          crafted.</li>
        </ul>

        <h4>All of it is tradeable</h4>
        <p>The <b>two fragments</b> go to the <b>Fragments</b> tab of the Community Market, and
        the <b>${n * 2 - semShiny} stones</b> (normal and shiny) have a tab of their own:
        <b>Mega Stones</b>. None of them sells to the NPC — the community sets the price.</p>

        <h4>The ${n} megas</h4>
        <p>${lista}.</p>`,

        es: `
        <p>La <b>Mega Evolución</b> cambia tu pokémon por su <b>forma Mega</b>: arte nuevo,
        <b>stats base nuevos</b> y, en muchas, <b>tipos nuevos</b>. Son <b>${n}</b> megas en el
        juego, y entran en la Pokédex en una pestaña propia — la pestaña <b>Mega</b>, en el rango
        <b>#3000</b> (Mega Gengar es el <b>#3094</b>, o sea <code>3000 + 94</code>, el dex del
        Gengar).</p>

        ${nota(`No es un bono porcentual. Las seis bases se <b>sustituyen</b> por las de la
        Pokédex oficial: Mega Alakazam tiene <b>175</b> de Sp. Atk contra 135, y Mega Aggron
        cambia Sp. Atk por <b>230</b> de Defense. Tu <a data-cap="stats">refinado</a>, el IV, la
        calidad y la potencia siguen sumando <b>encima</b> de eso.`, 'dica')}

        <h4>Un tercer golpe de 600, a la MITAD de la recarga</h4>
        <p>La mega tiene un <b>moveset propio</b>, armado para los tipos <b>de ella</b> — la Mega
        Gyarados, que es WATER/DARK, pega de DARK —, y las pocas que no necesitaron ajuste heredan
        el de la especie base. Todas tienen el <b>golpe de mega</b>: 600 de poder, de uno de
        <b>sus tipos</b> (o sea, siempre con STAB) y con <b>30 s</b> de recarga. Sumado a los dos
        golpes de 600 de toda última evolución, la mega queda con <b>tres</b>.</p>
        ${nota(`Esos 30 s son lo único del catálogo que sale de la curva de cooldown a propósito
        — todo otro golpe de 600 recarga en 60 s. Es lo que la mega entrega de verdad: el golpe
        dispara <b>dos veces</b> en el tiempo en que los otros dos disparan una. El cuello de
        botella de un pokémon de endgame es la recarga, no la falta de opciones.`, 'dica')}

        <h4>El camino, en cuatro pasos</h4>
        <ol>
          <li><b>Vence bosses.</b> Todo boss legendario suelta <b>Fragmento de Mega Stone</b> y
          <b>Fragmento de Mega Shiny Stone</b>, además de la pieza de TM de siempre (ver
          <a data-cap="bosses">Bosses</a>).</li>
          <li><b>Junta ${custo}.</b> Los fragmentos también se compran en el
          <a data-cap="comunidade">Mercado de la Comunidad</a>.</li>
          <li><b>Profesor Oak, banco Mega.</b> Los ${custo} fragmentos se convierten en la
          <b>Mega Stone de la especie que TÚ elijas</b> — no hay sorteo.</li>
          <li><b>Mega Evoluciona.</b> Con la piedra en la mochila, el botón dorado aparece en el
          pokémon.</li>
        </ol>

        <h4>La probabilidad en el boss sube con el escalón</h4>
        <p>Es la <b>misma escalera</b> de la pieza de TM: <b>${base}</b> en el primer par de
        bosses (Nv 300), el <b>doble</b> en el segundo (Nv 650) y un escalón más por par. El
        fragmento <b>shiny</b> es siempre la <b>mitad</b> del normal — <b>${baseShiny}</b> en el
        Nv 300.</p>
        ${tabela(
          ['Par de bosses', 'Fragmento de Mega', 'Fragmento de Mega Shiny'],
          [0, 1, 2, 3].map((par) => `<tr>
            <td><b>${par === 0 ? 'Nv 300' : par === 1 ? 'Nv 650' : `${par + 1}º par`}</b></td>
            <td>${pctMega(0.005 * (par + 1))}</td>
            <td>${pctMega(0.0025 * (par + 1))}</td>
          </tr>`).join(''),
        )}
        ${nota(`La probabilidad de cada boss está en la pestaña <b>Boss</b>, en el bloque
        <b>Recompensas</b> — es por victoria, y crece par a par hasta el último boss de la
        lista.`)}

        <h4>Shiny pide piedra shiny</h4>
        <p>Un pokémon <b>shiny</b> solo mega evoluciona con la <b>Shiny Mega Stone</b>, y
        <b>sigue shiny</b> después. La piedra normal <b>rechaza</b> shiny a propósito: sin ese
        bloqueo, el ítem más raro de la cuenta se volvería una mega de color normal, y no hay
        vuelta atrás.</p>
        ${semShiny === 0
          ? nota(`<b>Las ${n} tienen forma shiny</b> — ninguna queda fuera. Si algún día llega una
          mega nueva solo con el arte normal, entra sin Shiny Stone en el catálogo y el banco no
          la ofrece: una piedra que no se puede usar sería peor que una piedra que no existe.`)
          : nota(`<b>${semShiny === 1 ? 'Una mega aún no tiene arte shiny' : `${semShiny} megas aún no tienen arte shiny`}.</b>
          Mientras el arte no llega, su Shiny Stone no existe en el catálogo y un shiny de esa
          especie no puede mega evolucionar. Una piedra que no se puede usar sería peor que una
          piedra que no existe.`, 'aviso')}

        <h4>Qué cambia y qué no</h4>
        <ul>
          <li><b>Los tipos pueden cambiar.</b> Mega Gyarados pasa a WATER/DARK, Mega Ampharos
          gana DRAGON, Mega Sceptile gana DRAGON. Eso afecta el STAB, la
          <a data-cap="tipos">efectividad</a> y hasta la piedra de
          <a data-cap="stats">refinado</a> — pero no el <a data-cap="tm">TM</a> elemental, que sigue valiendo
          aunque su tipo desaparezca.</li>
          <li><b>No tiene vuelta atrás</b>, como toda evolución aquí — por eso el pokémon mega
          evolucionado va a tu <b>Colección</b>, fuera de la venta al NPC (devolverlo al Depósito es un
          clic).</li>
          <li>La <a data-cap="nota">Calculadora</a> muestra el <b>Potencial en la Mega Evolución</b>:
          la nota que el mismo nacimiento tendría en la forma Mega, antes de gastar la piedra.</li>
          <li><b>La nota nunca baja.</b> Mega evolucionar siempre <b>sube</b> el N=, por la misma
          regla que vale para evolucionar (ver <a data-cap="nota">La nota</a>).</li>
          <li>Una mega <b>no evoluciona de nuevo</b>, y las variantes de <b>Outland no mega
          evolucionan</b>. Los clones de Orre sí — son la misma especie.</li>
          <li>Las megas <b>no aparecen en hunt</b> y <b>no se capturan</b>: solo existen
          fabricadas.</li>
        </ul>

        <h4>Todo esto se negocia</h4>
        <p>Los <b>dos fragmentos</b> van a la pestaña <b>Fragmentos</b> del Mercado de la
        Comunidad, y las <b>${n * 2 - semShiny} piedras</b> (normales y shiny) tienen pestaña
        propia: <b>Mega Stones</b>. Ninguna se vende al NPC — el precio lo pone la comunidad.</p>

        <h4>Las ${n} megas</h4>
        <p>${lista}.</p>`,
      };
    },
  },

  // ---------------------------------------------------------------- 13. pvp
  {
    id: 'pvp',
    titulo: { pt: 'PvP Ranqueado', en: 'Ranked PvP', es: 'PvP Clasificatorio' },
    grupo: 'mundo',
    html: (c) => {
      const posic = N(PVP_PARTIDAS_POSICIONAMENTO, c.lang);
      const espera = Math.round(PVP_ENTRE_PARTIDAS_MS / 1000);
      const atrito = Math.round(PVP_ATRITO_DERROTA * 100);
      const teto = N(PVP_TETO_POSICIONAMENTO, c.lang);
      const elite = N(PVP_PR_ELITE, c.lang);
      const revancheMin = 10; // REVANCHE_MS, em `server/game/pvp-ranqueado.mjs`
      // O que cada faixa leva sai da MESMA tabela com que o servidor paga (`PVP_PREMIOS`), na
      // `tabelaPremiosPvp`: o prêmio já mudou de dias para horas e de três para seis faixas, e texto
      // escrito à mão teria ficado prometendo o de antes.
      return {
        pt: `
        <p><b>Um contra um, contra alguém do seu rank.</b> Você monta a equipe, entra na fila e
        a partida acontece <b>sozinha</b> — não há nada para clicar durante a luta. O que está
        em jogo é um número só: os <b>pontos de ranking (PR)</b>. Tier, divisão e a barrinha da
        tela saem todos dele.</p>

        <h4>Como funciona, em três passos</h4>
        <ol class="wk-passos">
          <li><b>Monte a equipe de PvP</b> — até <b>${N(PVP_TIME_MAX, c.lang)} pokémon</b>, na
          ordem em que entram. Ela é <b>separada da equipe de hunt</b>: mexer numa não mexe na
          outra. O primeiro abre a luta; os outros entram quando o anterior cai.</li>
          <li><b>Procure partida.</b> Pode fechar a tela e continuar caçando — a busca segue, e
          um aviso pequeno fica no alto ("Na fila PvP · 0:42") com um × para cancelar.</li>
          <li><b>A partida roda sozinha.</b> Abre um mapa, os dois times se enfrentam, e no fim
          a tela diz quanto de PR você ganhou ou perdeu.</li>
        </ol>

        <h4>As regras da casa</h4>
        ${tabela(
    [c.r.regra, c.r.valor],
    `<tr><td>Formato</td><td>1 contra 1, <b>100% automático</b></td></tr>
           <tr><td>Nível de treinador</td><td class="wk-num destaque">${N(PVP_NIVEL_MIN, c.lang)}</td></tr>
           <tr><td>Pokémon na equipe</td><td class="wk-num">${N(PVP_TIME_MIN, c.lang)} a ${N(PVP_TIME_MAX, c.lang)}</td></tr>
           <tr><td>Custo para entrar</td><td><b>nada</b> — sem ficha, sem ouro, sem taxa</td></tr>
           <tr><td>Perder custa XP?</td><td><b>não</b> — só PR</td></tr>
           <tr><td>Entre uma partida e a fila seguinte</td><td class="wk-num">${espera} s</td></tr>
           <tr><td>Reencontrar o mesmo oponente</td><td>evitado por ${revancheMin} min — e paga PR cheio</td></tr>`,
  )}

        <h4>Os sete ranks</h4>
        ${tabelaDeRanks(c)}
        <p>Dentro de cada tier a divisão vai de <b>I</b> a <b>III</b>, de
        ${N(PVP_PONTOS_POR_DIVISAO, c.lang)} em ${N(PVP_PONTOS_POR_DIVISAO, c.lang)} PR. <b>I é a
        entrada e III é o topo</b> — Ouro III é melhor que Ouro I. É o inverso do League of
        Legends, de propósito: lá a ordem invertida é herança de um sistema antigo.</p>

        ${nota(`<b>Mestre e Challenger são VAGAS, não pontos.</b> Passar dos ${elite} PR te põe
        na fila de espera: as <b>${N(PVP_VAGAS_CHALLENGER, c.lang)} primeiras</b> posições da
        tabela são Challenger e da ${N(PVP_VAGAS_CHALLENGER + 1, c.lang)}ª à
        <b>${N(PVP_VAGAS_MESTRE, c.lang)}ª</b> é Mestre. Enquanto não houver vaga você aparece
        como Diamante. Pontos inflam com o tempo; posição não — "estar entre os
        ${N(PVP_VAGAS_CHALLENGER, c.lang)} melhores do servidor" quer dizer a mesma coisa daqui
        a um ano.`)}

        <h4>Posicionamento: as ${posic} primeiras</h4>
        <p>Nas suas <b>${posic} primeiras partidas</b> você aparece como <b>Não classificado</b>,
        não entra na tabela, e o PR não passa de <b>${teto}</b> — o topo do Bronze. Todo mundo
        começa no pé da escada; a subida <b>é</b> o jogo.</p>

        <h4>Quanto vale cada partida</h4>
        <p>É o Elo do xadrez: o que decide é a <b>diferença de rank</b> entre os dois.</p>
        <ul>
          <li>Contra alguém do seu nível, o movimento é pequeno e parelho.</li>
          <li><b>Ganhar de quem está muito acima</b> paga muito — e custa muito a ele.</li>
          <li><b>Perder para quem está muito abaixo</b> é a derrota mais cara que existe.</li>
        </ul>
        <p>Com uma diferença que vale entender: <b>a derrota cobra ${atrito}% do que a vitória
        pagaria</b>. Não é soma zero, e é de propósito — com todo mundo começando do chão, uma
        escada de soma zero deixaria Diamante para cima <b>inalcançável</b>, porque não haveria
        de onde os pontos virem. Com o atrito, quem ganha cerca de metade sobe devagar e quem
        ganha menos de ~41% desce.</p>

        ${nota(`<b>Escudo de tier:</b> acabou de subir de tier? A primeira derrota no piso dele
        não te rebaixa. Cair de Ouro para Prata na derrota seguinte à promoção é a sensação ruim
        que o escudo existe para evitar.`)}

        <h4>Inatividade e temporada</h4>
        <ul>
          <li><b>${N(PVP_DECAIMENTO_HORAS, c.lang)} horas sem jogar</b> (um dia) derrubam Mestre e
          Challenger para o <b>Diamante</b>: os pontos caem para <b>um acima do primeiro
          Diamante</b> da tabela, e a vaga vai para quem está jogando. Para voltar, é subir de novo
          até os 1.500 PR. Enquanto você está na elite, um <b>relógio</b> no seu cartão mostra
          quanto falta — e toda partida ranqueada o zera.</li>
          <li><b>Todo sábado, 23h59 (horário de Brasília), a tabela zera:</b> todo mundo
          volta a 0 PR e ao posicionamento. É o que faz o número voltar a valer o que vale. A semana
          da escada vai de domingo a sábado.</li>
          <li>Na virada, as <b>${N(PVP_POSICOES_PREMIADAS, c.lang)} primeiras posições</b> levam
          <b>prêmio</b>: boosts e, até o ${ordinalDePosicao(PVP_VAGAS_MESTRE, c.lang)}, <b>diamantes</b>
          (a tabela está logo abaixo). Os boosts chegam sozinhos, e o diamante entra no saldo — vale na
          Loja e no banco da guild, mas não se vende no Mercado. Só entra quem jogou nas últimas
          ${N(PVP_DECAIMENTO_HORAS, c.lang)} horas.</li>
          <li>O botão <b>🏆 Recompensas</b>, logo abaixo da <b>Fila automática</b>, abre essa tabela
          com quanto falta para a virada e em que faixa você está.</li>
        </ul>
        ${tabelaPremiosPvp(c)}

        <h4>Fila automática (VIP)</h4>
        <p>Assinantes podem deixar a fila ligada: acabou uma partida, a próxima busca começa
        sozinha ${espera} segundos depois. Desliga quando você cancela na mão ou quando a equipe
        fica vazia.</p>

        <h4>O ranqueado no perfil</h4>
        <ul>
          <li>O card <b>ELO</b> da Ficha do Treinador mostra o <b>emblema</b>, o tier com a divisão
          e o <b>PR</b> — no seu perfil e no de quem você abrir pelo ranking, pelo chat ou pela
          lista de amigos. Quem ainda está no posicionamento aparece como <b>Não
          classificado</b>, sem emblema e sem PR.</li>
          <li>A <b>composição</b> da equipe do PvP Ranqueado é pública — quem abre a sua ficha vê
          <b>quais</b> pokémon você leva —, mas a <b>ordem de entrada é secreta</b>: na ficha dos
          outros (e no Tracker) a equipe aparece na ordem da Pokédex, com o aviso <b>ordem de entrada
          oculta</b>. Só você vê e edita a sua ordem, e a luta segue a ordem que você montou. Assim dá
          para estudar o adversário, mas não montar a resposta exata para a escalação dele.</li>
          <li>Para o <a data-cap="campeonato">Campeonato</a> dá para escolher outra equipe, que
          <b>não aparece</b> no perfil de ninguém.</li>
        </ul>

        <h4>Formações salvas</h4>
        <p>Embaixo da equipe de PvP fica o armário de <b>formações</b>: até <b>${PVP_FORMACOES_MAX}</b>
        escalações salvas, cada uma com nome (até ${FORMACAO_NOME_MAX} caracteres) e o <b>placar</b>
        dela. <b>Usar</b> troca a equipe de PvP pela formação num clique.</p>
        <ul>
          <li>O placar conta as partidas em que <b>aquela escalação exata</b> — os mesmos pokémon, na
          mesma ordem — lutou, no Ranqueado e no Campeonato. Não importa se você clicou em Usar ou
          remontou à mão.</li>
          <li>Mudar a escalação de uma formação <b>zera</b> o placar (era de outro time); renomear não
          zera.</li>
          <li>O lápis abre o editor da formação inteira: nome e escalação.</li>
          <li>Formações, nomes e placares são <b>só seus</b> — nenhuma ficha pública mostra.</li>
        </ul>

        <h4>Histórico e Tracker</h4>
        <ul>
          <li>Clique numa partida do seu <b>histórico</b> para ver ali mesmo a equipe do adversário e o
          resumo da luta.</li>
          <li>Se o servidor reiniciar com você na fila, você <b>volta para ela</b> com o tempo de espera
          que já tinha.</li>
          <li>O <b>Tracker</b> (<a href="https://pokeidle.io/tracker" target="_blank" rel="noopener">pokeidle.io/tracker</a>)
          é o site público do PvP: o meta por rank (Low elo, High elo e cada tier), o relatório de cada
          pokémon, o ranking de cada temporada e as últimas partidas de cada treinador, com o combate
          turno a turno.</li>
        </ul>`,
        en: `
        <p><b>One versus one, against someone of your rank.</b> You set up a team, join the
        queue and the match plays out <b>on its own</b> — there is nothing to click during the
        fight. One number is at stake: your <b>ranking points (PR)</b>. Tier, division and the
        progress bar all derive from it.</p>

        <h4>How it works, in three steps</h4>
        <ol class="wk-passos">
          <li><b>Set up your PvP team</b> — up to <b>${N(PVP_TIME_MAX, c.lang)} pokémon</b>, in
          the order they enter. It is <b>separate from your hunt team</b>: changing one does not
          touch the other. The first one opens the fight; the rest come in as the previous falls.</li>
          <li><b>Search for a match.</b> You may close the screen and keep hunting — the search
          goes on, and a small badge stays at the top ("PvP queue · 0:42") with an × to cancel.</li>
          <li><b>The match runs by itself.</b> A map opens, both teams fight, and at the end the
          screen tells you how much PR you gained or lost.</li>
        </ol>

        <h4>House rules</h4>
        ${tabela(
    [c.r.regra, c.r.valor],
    `<tr><td>Format</td><td>1 vs 1, <b>100% automatic</b></td></tr>
           <tr><td>Trainer level</td><td class="wk-num destaque">${N(PVP_NIVEL_MIN, c.lang)}</td></tr>
           <tr><td>Pokémon on the team</td><td class="wk-num">${N(PVP_TIME_MIN, c.lang)} to ${N(PVP_TIME_MAX, c.lang)}</td></tr>
           <tr><td>Entry cost</td><td><b>none</b> — no token, no gold, no fee</td></tr>
           <tr><td>Does losing cost XP?</td><td><b>no</b> — PR only</td></tr>
           <tr><td>Between a match and the next queue</td><td class="wk-num">${espera} s</td></tr>
           <tr><td>Meeting the same opponent again</td><td>avoided for ${revancheMin} min — and pays full PR</td></tr>`,
  )}

        <h4>The seven ranks</h4>
        ${tabelaDeRanks(c)}
        <p>Inside each tier the division runs from <b>I</b> to <b>III</b>, every
        ${N(PVP_PONTOS_POR_DIVISAO, c.lang)} PR. <b>I is the entry and III is the top</b> — Gold
        III beats Gold I. That is the reverse of League of Legends, on purpose: there the
        inverted order is a leftover from an old system.</p>

        ${nota(`<b>Master and Challenger are SLOTS, not points.</b> Passing ${elite} PR puts you
        in line: the <b>top ${N(PVP_VAGAS_CHALLENGER, c.lang)}</b> places on the ladder are
        Challenger and places ${N(PVP_VAGAS_CHALLENGER + 1, c.lang)} to
        <b>${N(PVP_VAGAS_MESTRE, c.lang)}</b> are Master. While no slot is free you show up as
        Diamond. Points inflate over time; positions do not — "being in the top
        ${N(PVP_VAGAS_CHALLENGER, c.lang)} on the server" will mean the same thing a year from
        now.`)}

        <h4>Placement: your first ${posic}</h4>
        <p>For your <b>first ${posic} matches</b> you show as <b>Unranked</b>, you are not on the
        ladder, and your PR is capped at <b>${teto}</b> — the top of Bronze. Everyone starts at
        the bottom of the stairs; the climb <b>is</b> the game.</p>

        <h4>What each match is worth</h4>
        <p>It is chess Elo: what decides is the <b>rank gap</b> between the two of you.</p>
        <ul>
          <li>Against someone at your level the swing is small and even.</li>
          <li><b>Beating someone far above you</b> pays a lot — and costs them a lot.</li>
          <li><b>Losing to someone far below you</b> is the most expensive defeat there is.</li>
        </ul>
        <p>With one difference worth understanding: <b>a loss charges ${atrito}% of what a win
        would pay</b>. It is not zero-sum, and that is deliberate — with everyone starting from
        the floor, a zero-sum ladder would make Diamond and above <b>unreachable</b>, because
        there would be nowhere for the points to come from. With the friction, winning about
        half climbs slowly and winning under ~41% slides down.</p>

        ${nota(`<b>Tier shield:</b> just promoted? The first loss at the floor of your new tier
        does not demote you. Dropping from Gold back to Silver on the very next match is the bad
        feeling the shield exists to prevent.`)}

        <h4>Inactivity and season</h4>
        <ul>
          <li><b>${N(PVP_DECAIMENTO_HORAS, c.lang)} hours without playing</b> (one day) drop Master
          and Challenger to <b>Diamond</b>: the points fall to <b>one above the top Diamond</b> in
          the table, and the slot goes to whoever is playing. To come back, you climb to 1,500 RP
          again. While you are in the elite, a <b>clock</b> on your card shows how long is left —
          and every ranked match resets it.</li>
          <li><b>Every Saturday, 11:59 PM (Brasília time), the ladder resets:</b> everyone goes back to
          0 PR and to placement. That is what makes the number mean what it means again. The ladder's
          week runs from Sunday to Saturday.</li>
          <li>At the turn the <b>top ${N(PVP_POSICOES_PREMIADAS, c.lang)} places</b> get a <b>prize</b>:
          boosts and, down to ${ordinalDePosicao(PVP_VAGAS_MESTRE, c.lang)}, <b>diamonds</b> (the table is
          right below). The boosts arrive on their own, and the diamonds go into your balance — they work
          in the Shop and the guild bank, but can't be sold on the Market. Only players who played in the
          last ${N(PVP_DECAIMENTO_HORAS, c.lang)} hours count.</li>
          <li>The <b>🏆 Rewards</b> button, right below <b>Auto queue</b>, opens this table with the
          time left until the reset and which bracket you are in.</li>
        </ul>
        ${tabelaPremiosPvp(c)}

        <h4>Auto-queue (VIP)</h4>
        <p>Subscribers can leave the queue on: when a match ends, the next search starts by itself
        ${espera} seconds later. It switches off when you cancel by hand or when the team goes
        empty.</p>

        <h4>Ranked on your profile</h4>
        <ul>
          <li>The <b>ELO</b> card on the Trainer Sheet shows the <b>emblem</b>, the tier with its
          division and the <b>PR</b> — on your profile and on anyone's you open from the rankings,
          the chat or the friends list. Players still in placement show as <b>Unranked</b>, with no
          emblem and no PR.</li>
          <li>Your Ranked PvP team's <b>line-up</b> is public — whoever opens your sheet sees
          <b>which</b> pokémon you bring —, but the <b>entry order is secret</b>: on other people's view
          (and on the Tracker) the team shows in Pokédex order, with the <b>entry order hidden</b> note.
          Only you see and edit your order, and the battle follows the order you set. That way you can
          study an opponent, but not build the exact answer to their line-up.</li>
          <li>For the <a data-cap="campeonato">Championship</a> you can pick another team, which
          <b>never shows</b> on anyone's profile.</li>
        </ul>

        <h4>Saved formations</h4>
        <p>Below the PvP team sits the <b>formations</b> locker: up to <b>${PVP_FORMACOES_MAX}</b>
        saved line-ups, each with a name (up to ${FORMACAO_NOME_MAX} characters) and its own
        <b>record</b>. <b>Use</b> swaps your PvP team for the formation in one click.</p>
        <ul>
          <li>The record counts the matches in which <b>that exact line-up</b> — the same pokémon, in
          the same order — fought, in Ranked and in the Championship. It doesn't matter whether you
          clicked Use or rebuilt it by hand.</li>
          <li>Changing a formation's line-up <b>resets</b> its record (it belonged to another team);
          renaming doesn't.</li>
          <li>The pencil opens the editor for the whole formation: name and line-up.</li>
          <li>Formations, names and records are <b>yours only</b> — no public sheet shows them.</li>
        </ul>

        <h4>History and Tracker</h4>
        <ul>
          <li>Click a match in your <b>history</b> to see the opponent's team and the battle summary
          right there.</li>
          <li>If the server restarts while you are in the queue, you <b>go back into it</b> with the
          waiting time you already had.</li>
          <li>The <b>Tracker</b> (<a href="https://pokeidle.io/tracker" target="_blank" rel="noopener">pokeidle.io/tracker</a>)
          is the public PvP site: the meta by rank (Low elo, High elo and each tier), each pokémon's
          report, each season's ranking and every trainer's latest matches, with the turn-by-turn
          combat.</li>
        </ul>`,
        es: `
        <p><b>Uno contra uno, contra alguien de tu rango.</b> Armas el equipo, entras a la cola y
        la partida ocurre <b>sola</b> — no hay nada que pulsar durante la pelea. Lo que está en
        juego es un solo número: los <b>puntos de clasificación (PR)</b>. Tier, división y la
        barrita de la pantalla salen todos de él.</p>

        <h4>Cómo funciona, en tres pasos</h4>
        <ol class="wk-passos">
          <li><b>Arma el equipo de PvP</b> — hasta <b>${N(PVP_TIME_MAX, c.lang)} pokémon</b>, en
          el orden en que entran. Es <b>independiente del equipo de cacería</b>: tocar uno no
          toca el otro. El primero abre la pelea; los demás entran cuando cae el anterior.</li>
          <li><b>Busca partida.</b> Puedes cerrar la pantalla y seguir cazando — la búsqueda
          continúa, y arriba queda un aviso pequeño ("En cola PvP · 0:42") con una × para
          cancelar.</li>
          <li><b>La partida corre sola.</b> Se abre un mapa, los dos equipos pelean, y al final la
          pantalla dice cuánto PR ganaste o perdiste.</li>
        </ol>

        <h4>Las reglas de la casa</h4>
        ${tabela(
    [c.r.regra, c.r.valor],
    `<tr><td>Formato</td><td>1 contra 1, <b>100% automático</b></td></tr>
           <tr><td>Nivel de entrenador</td><td class="wk-num destaque">${N(PVP_NIVEL_MIN, c.lang)}</td></tr>
           <tr><td>Pokémon en el equipo</td><td class="wk-num">${N(PVP_TIME_MIN, c.lang)} a ${N(PVP_TIME_MAX, c.lang)}</td></tr>
           <tr><td>Costo de entrada</td><td><b>nada</b> — sin ficha, sin oro, sin tasa</td></tr>
           <tr><td>¿Perder cuesta XP?</td><td><b>no</b> — solo PR</td></tr>
           <tr><td>Entre una partida y la cola siguiente</td><td class="wk-num">${espera} s</td></tr>
           <tr><td>Reencontrar al mismo rival</td><td>evitado por ${revancheMin} min — y paga PR completo</td></tr>`,
  )}

        <h4>Los siete rangos</h4>
        ${tabelaDeRanks(c)}
        <p>Dentro de cada tier la división va de <b>I</b> a <b>III</b>, cada
        ${N(PVP_PONTOS_POR_DIVISAO, c.lang)} PR. <b>I es la entrada y III es la cima</b> — Oro III
        es mejor que Oro I. Es al revés que en League of Legends, a propósito: allí el orden
        invertido es herencia de un sistema viejo.</p>

        ${nota(`<b>Maestro y Challenger son PLAZAS, no puntos.</b> Pasar los ${elite} PR te pone
        en lista de espera: los <b>${N(PVP_VAGAS_CHALLENGER, c.lang)} primeros</b> puestos de la
        tabla son Challenger y del ${N(PVP_VAGAS_CHALLENGER + 1, c.lang)}º al
        <b>${N(PVP_VAGAS_MESTRE, c.lang)}º</b> es Maestro. Mientras no haya plaza apareces como
        Diamante. Los puntos se inflan con el tiempo; la posición no — "estar entre los
        ${N(PVP_VAGAS_CHALLENGER, c.lang)} mejores del servidor" querrá decir lo mismo dentro de
        un año.`)}

        <h4>Colocación: las ${posic} primeras</h4>
        <p>En tus <b>${posic} primeras partidas</b> apareces como <b>Sin clasificar</b>, no entras
        en la tabla, y el PR no pasa de <b>${teto}</b> — la cima del Bronce. Todo el mundo empieza
        al pie de la escalera; la subida <b>es</b> el juego.</p>

        <h4>Cuánto vale cada partida</h4>
        <p>Es el Elo del ajedrez: lo que decide es la <b>diferencia de rango</b> entre los dos.</p>
        <ul>
          <li>Contra alguien de tu nivel el movimiento es pequeño y parejo.</li>
          <li><b>Ganarle a quien está muy por encima</b> paga mucho — y a él le cuesta mucho.</li>
          <li><b>Perder contra quien está muy por debajo</b> es la derrota más cara que existe.</li>
        </ul>
        <p>Con una diferencia que vale entender: <b>la derrota cobra el ${atrito}% de lo que
        pagaría la victoria</b>. No es suma cero, y es a propósito — con todos empezando desde el
        suelo, una escalera de suma cero dejaría Diamante y arriba <b>inalcanzables</b>, porque no
        habría de dónde salieran los puntos. Con el roce, quien gana cerca de la mitad sube
        despacio y quien gana menos de ~41% baja.</p>

        ${nota(`<b>Escudo de tier:</b> ¿acabas de subir? La primera derrota en el suelo de tu tier
        nuevo no te baja. Caer de Oro a Plata en la partida siguiente al ascenso es la mala
        sensación que el escudo existe para evitar.`)}

        <h4>Inactividad y temporada</h4>
        <ul>
          <li><b>${N(PVP_DECAIMENTO_HORAS, c.lang)} horas sin jugar</b> (un día) bajan a Maestro y
          Challenger a <b>Diamante</b>: los puntos caen a <b>uno por encima del primer
          Diamante</b> de la tabla, y la plaza va para quien está jugando. Para volver, hay que
          subir de nuevo hasta los 1.500 PR. Mientras estás en la élite, un <b>reloj</b> en tu
          tarjeta muestra cuánto falta — y cada partida clasificatoria lo reinicia.</li>
          <li><b>Cada sábado, 23:59 (hora de Brasilia), la tabla se reinicia:</b> todos vuelven a 0
          PR y a la colocación. Es lo que hace que el número vuelva a valer lo que vale. La semana de
          la escalera va de domingo a sábado.</li>
          <li>En el cambio los <b>${N(PVP_POSICOES_PREMIADAS, c.lang)} primeros puestos</b> llevan
          <b>premio</b>: boosts y, hasta el ${ordinalDePosicao(PVP_VAGAS_MESTRE, c.lang)}, <b>diamantes</b>
          (la tabla está justo debajo). Los boosts llegan solos, y los diamantes entran en tu saldo — sirven
          en la Tienda y en el banco de la guild, pero no se venden en el Mercado. Solo cuenta quien jugó en
          las últimas ${N(PVP_DECAIMENTO_HORAS, c.lang)} horas.</li>
          <li>El botón <b>🏆 Recompensas</b>, justo debajo de la <b>Cola automática</b>, abre esta
          tabla con cuánto falta para el cambio y en qué franja estás.</li>
        </ul>
        ${tabelaPremiosPvp(c)}

        <h4>Cola automática (VIP)</h4>
        <p>Los suscriptores pueden dejar la cola encendida: al terminar una partida, la siguiente
        búsqueda arranca sola ${espera} segundos después. Se apaga cuando cancelas a mano o cuando
        el equipo queda vacío.</p>

        <h4>El clasificatorio en el perfil</h4>
        <ul>
          <li>La tarjeta <b>ELO</b> de la Ficha del Entrenador muestra el <b>emblema</b>, el tier
          con la división y los <b>PR</b> — en tu perfil y en el de quien abras desde la
          clasificación, el chat o la lista de amigos. Quien sigue en la colocación aparece como
          <b>Sin clasificar</b>, sin emblema y sin PR.</li>
          <li>La <b>composición</b> del equipo del PvP Clasificatorio es pública — quien abre tu
          ficha ve <b>qué</b> pokémon llevas —, pero el <b>orden de entrada es secreto</b>: en la ficha
          que ven los demás (y en el Tracker) el equipo aparece en el orden de la Pokédex, con el aviso
          <b>orden de entrada oculto</b>. Solo tú ves y editas tu orden, y la pelea sigue el orden que
          armaste. Así se puede estudiar al rival, pero no armar la respuesta exacta a su
          alineación.</li>
          <li>Para el <a data-cap="campeonato">Campeonato</a> puedes elegir otro equipo, que
          <b>no aparece</b> en el perfil de nadie.</li>
        </ul>

        <h4>Formaciones guardadas</h4>
        <p>Debajo del equipo de PvP está el armario de <b>formaciones</b>: hasta
        <b>${PVP_FORMACOES_MAX}</b> alineaciones guardadas, cada una con nombre (hasta
        ${FORMACAO_NOME_MAX} caracteres) y su <b>marcador</b>. <b>Usar</b> cambia tu equipo de PvP por
        la formación de un clic.</p>
        <ul>
          <li>El marcador cuenta las partidas en que <b>esa alineación exacta</b> — los mismos pokémon,
          en el mismo orden — peleó, en el Clasificatorio y en el Campeonato. No importa si pulsaste
          Usar o la armaste a mano.</li>
          <li>Cambiar la alineación de una formación <b>reinicia</b> su marcador (era de otro equipo);
          renombrarla no.</li>
          <li>El lápiz abre el editor de la formación entera: nombre y alineación.</li>
          <li>Formaciones, nombres y marcadores son <b>solo tuyos</b> — ninguna ficha pública los
          muestra.</li>
        </ul>

        <h4>Historial y Tracker</h4>
        <ul>
          <li>Pulsa una partida de tu <b>historial</b> para ver ahí mismo el equipo del rival y el
          resumen de la pelea.</li>
          <li>Si el servidor se reinicia contigo en la cola, <b>vuelves a ella</b> con el tiempo de
          espera que ya tenías.</li>
          <li>El <b>Tracker</b> (<a href="https://pokeidle.io/tracker" target="_blank" rel="noopener">pokeidle.io/tracker</a>)
          es la web pública del PvP: el meta por rango (Low elo, High elo y cada tier), el informe de
          cada pokémon, la clasificación de cada temporada y las últimas partidas de cada entrenador,
          con el combate turno a turno.</li>
        </ul>`,
      };
    },
  },


  // ------------------------------------------------------------ campeonatos
  //
  // Datas, requisito, restrições, intervalo das rodadas e prêmios saem do CALENDÁRIO de
  // `shared/campeonato.mjs`, o mesmo que o servidor usa para aceitar inscrição e jogar a chave.
  // Nada aqui é data escrita à mão: o capítulo pergunta ao calendário qual é a próxima edição
  // de cada tipo e acompanha sozinho a virada do mês, para sempre.
  // ------------------------------------------------ a bancada de testes do PvP
  // ---------------------------------------------------------- 14b. PvP amistoso
  {
    id: 'amistoso',
    titulo: { pt: 'PvP amistoso', en: 'Friendly PvP', es: 'PvP amistoso' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>Um desafio entre <b>amigos</b>, pela conversa da <a data-cap="inicio">Lista de
        Amigos</a>. Abra a conversa com o amigo e clique em <b>⚔ PvP amistoso</b>.</p>
        <ul>
          <li>O convite aparece na conversa dos dois, e o amigo tem <b>5 minutos</b> para
          <b>Aceitar</b> ou <b>Recusar</b>. Quem desafiou pode cancelar enquanto espera.</li>
          <li>Só vale para amigo <b>online</b>, e é um convite pendente por vez.</li>
          <li>Aceitou, a luta acontece na hora com as <b>regras do <a data-cap="pvp">PvP
          Ranqueado</a></b>: a equipe de PvP de cada um (quem não montou luta com a equipe de hunt), a
          mesma arena e a mesma régua de nível. A fita abre para os dois.</li>
          <li><b>Não vale PR nem prêmio</b> — é só pela honra.</li>
          <li>Depois da luta, <b>os dois esperam 5 minutos</b> para jogar outro amistoso, com qualquer
          amigo. Quem chamar alguém nessa espera vê quanto tempo falta.</li>
          <li>A conversa guarda o resultado, e o <b>▶ Assistir</b> reabre a fita por 30 minutos.</li>
        </ul>`,
      en: `
        <p>A challenge between <b>friends</b>, through the <a data-cap="inicio">Friends
        List</a> chat. Open the chat with your friend and click <b>⚔ Friendly PvP</b>.</p>
        <ul>
          <li>The invite shows up in both chats, and your friend has <b>5 minutes</b> to
          <b>Accept</b> or <b>Decline</b>. The challenger can cancel while waiting.</li>
          <li>Only for friends who are <b>online</b>, one pending invite at a time.</li>
          <li>Once accepted, the battle happens right away under <b><a data-cap="pvp">Ranked PvP</a>
          rules</b>: each player's PvP team (without one, the hunting team), the same arena and the
          same level curve. The replay opens for both.</li>
          <li><b>No PR and no prizes</b> — just for glory.</li>
          <li>After the battle, <b>both wait 5 minutes</b> before another friendly, with any friend.
          Whoever calls someone during that wait sees how long is left.</li>
          <li>The chat keeps the result, and <b>▶ Watch</b> reopens the replay for 30 minutes.</li>
        </ul>`,
      es: `
        <p>Un desafío entre <b>amigos</b>, por la conversación de la <a data-cap="inicio">Lista
        de Amigos</a>. Abre la conversación con tu amigo y pulsa <b>⚔ PvP amistoso</b>.</p>
        <ul>
          <li>La invitación aparece en la conversación de los dos, y el amigo tiene <b>5 minutos</b>
          para <b>Aceptar</b> o <b>Rechazar</b>. Quien desafió puede cancelar mientras espera.</li>
          <li>Solo para amigos <b>conectados</b>, y una invitación pendiente a la vez.</li>
          <li>Al aceptar, la batalla ocurre en el momento con las <b>reglas del <a data-cap="pvp">PvP
          Clasificatorio</a></b>: el equipo de PvP de cada uno (sin uno, el equipo de caza), la misma
          arena y la misma regla de nivel. La grabación se abre para los dos.</li>
          <li><b>No vale PR ni premio</b> — solo por el honor.</li>
          <li>Después de la batalla, <b>los dos esperan 5 minutos</b> para otro amistoso, con
          cualquier amigo. Quien llame a alguien en esa espera ve cuánto falta.</li>
          <li>La conversación guarda el resultado, y <b>▶ Ver</b> reabre la grabación por 30 minutos.</li>
        </ul>`,
    }),
  },

  {
    id: 'treinamento',
    titulo: { pt: 'Área de Treinamento', en: 'Training Area', es: 'Área de Entrenamiento' },
    grupo: 'mundo',
    html: (c) => {
      const casas = N(TREINO_MAX_LADO, c.lang);
      const min = Math.round(TREINO_COOLDOWN_MS / 60000);
      return {
        pt: `
        <p><b>Uma bancada de testes, sem nada em jogo.</b> Na aba <b>Treinamento</b> do PvP você
        monta dois lados, manda lutar e assiste. Não há XP, Coin, item, pedra nem ponto de
        ranking — e <b>nada é gravado</b>.</p>

        <h4>Como se monta</h4>
        <ol class="wk-passos">
          <li><b>Até ${casas} pokémon de cada lado</b>, escolhidos casa a casa. A casa 1 é quem
          entra em campo primeiro.</li>
          <li>Em cada casa você escolhe entre <b>um pokémon seu</b> e um <b>pokémon teste</b>.</li>
          <li>O <b>pokémon teste</b> é de mentira: você diz a espécie, o nível, se é shiny, a
          potência, a qualidade e os seis IVs. Ele existe só naquela luta.</li>
          <li>Clique em <b>Lutar</b>. A fita abre na arena dos ginásios, com o mesmo tocador do
          desafio ao líder.</li>
        </ol>

        <h4>As regras da luta são as do Ranqueado</h4>
        <p>Mesma arena, mesmo simulador e a mesma régua de nível do
        <a data-cap="pvp">PvP Ranqueado</a> e do <a data-cap="ginasios">Ginásio</a> — inteiro até
        150 e comprimido daí para cima. Treinar com outra régua não treinaria nada.</p>

        <p><b>Os lados são independentes:</b> 5 × 1 é uma luta válida. A bancada não pede
        equilíbrio — quem decide o que quer perguntar é você.</p>

        <h4>O seu pokémon não entra na arena</h4>
        <p>Entra uma <b>cópia</b> dele, com os mesmos números de nascimento. O original não perde
        HP, não ganha XP, não sai do lugar e não fica sabendo que a luta aconteceu. O pokémon
        teste, por sua vez, <b>não vai para o Depot</b> e não conta na Pokédex.</p>

        ${nota(`<b>Uma batalha a cada ${min} minutos por conta.</b> A espera vale em qualquer
        aparelho e não zera ao sair e entrar de novo.`)}

        <h4>Para que serve</h4>
        <ul class="wk-lista">
          <li>descobrir qual dos seus pokémon é mais forte de verdade, e não na conta de cabeça;</li>
          <li>comparar duas equipes antes de levar uma para o Ranqueado ou para a guerra;</li>
          <li>ver quanto um nível, um IV ou uma potência a mais mudam a luta;</li>
          <li>montar a equipe contra um oponente que você inventa — o time de alguém que te
          venceu, por exemplo.</li>
        </ul>`,
        en: `
        <p><b>A test bench, with nothing at stake.</b> In the PvP <b>Training</b> tab you build
        two sides, hit fight and watch. No XP, Coins, items, stones or ranking points — and
        <b>nothing is saved</b>.</p>

        <h4>How to build it</h4>
        <ol class="wk-passos">
          <li><b>Up to ${casas} pokémon per side</b>, picked slot by slot. Slot 1 enters first.</li>
          <li>In each slot you choose between <b>one of your pokémon</b> and a <b>test pokémon</b>.</li>
          <li>The <b>test pokémon</b> is make-believe: you set the species, level, shiny,
          potential, quality and the six IVs. It exists only for that fight.</li>
          <li>Hit <b>Fight</b>. The replay opens in the gym arena, in the same player as the
          leader challenge.</li>
        </ol>

        <h4>The fight follows ranked rules</h4>
        <p>Same arena, same simulator and the same level ruler as
        <a data-cap="pvp">Ranked PvP</a> and the <a data-cap="ginasios">Gyms</a> — full up to 150
        and compressed above it. Training under other rules would train nothing.</p>

        <p><b>The sides are independent:</b> 5 × 1 is a valid fight. The bench asks for no
        balance — you decide what you want to ask it.</p>

        <h4>Your pokémon never enters the arena</h4>
        <p>A <b>copy</b> does, with the same birth numbers. The original loses no HP, gains no
        XP, does not move and never learns the fight happened. The test pokémon, in turn,
        <b>does not go to your Depot</b> and does not count in the Pokédex.</p>

        ${nota(`<b>One battle every ${min} minutes per account.</b> The wait applies on any
        device and does not reset when you log out and back in.`)}

        <h4>What it is for</h4>
        <ul class="wk-lista">
          <li>finding out which of your pokémon is actually stronger, instead of guessing;</li>
          <li>comparing two teams before taking one to ranked or to the war;</li>
          <li>seeing how much one more level, IV or potential changes a fight;</li>
          <li>building a team against an opponent you invent — the team that just beat you,
          for instance.</li>
        </ul>`,
        es: `
        <p><b>Un banco de pruebas, sin nada en juego.</b> En la pestaña <b>Entrenamiento</b> del
        PvP armas dos lados, mandas pelear y miras. No hay XP, Coins, objetos, piedras ni puntos
        de clasificación — y <b>nada se guarda</b>.</p>

        <h4>Cómo se arma</h4>
        <ol class="wk-passos">
          <li><b>Hasta ${casas} pokémon por lado</b>, elegidos casilla por casilla. La casilla 1
          entra primero.</li>
          <li>En cada casilla eliges entre <b>un pokémon tuyo</b> y un <b>pokémon de prueba</b>.</li>
          <li>El <b>pokémon de prueba</b> es de mentira: defines la especie, el nivel, si es
          shiny, la potencia, la calidad y los seis IVs. Existe solo en esa pelea.</li>
          <li>Pulsa <b>Pelear</b>. La repetición abre en la arena de los gimnasios, con el mismo
          reproductor del desafío al líder.</li>
        </ol>

        <h4>Las reglas son las del Clasificatorio</h4>
        <p>Misma arena, mismo simulador y la misma regla de nivel del
        <a data-cap="pvp">PvP Clasificatorio</a> y de los <a data-cap="ginasios">Gimnasios</a> —
        entero hasta 150 y comprimido de ahí para arriba.</p>

        <p><b>Los lados son independientes:</b> 5 × 1 es una pelea válida.</p>

        <h4>Tu pokémon no entra a la arena</h4>
        <p>Entra una <b>copia</b>, con los mismos números de nacimiento. El original no pierde
        HP, no gana XP, no se mueve y ni se entera. El pokémon de prueba <b>no va a tu Depot</b>
        y no cuenta en la Pokédex.</p>

        ${nota(`<b>Una pelea cada ${min} minutos por cuenta.</b> La espera vale en cualquier
        aparato y no se reinicia al salir y volver a entrar.`)}

        <h4>Para qué sirve</h4>
        <ul class="wk-lista">
          <li>descubrir cuál de tus pokémon es más fuerte de verdad;</li>
          <li>comparar dos equipos antes de llevar uno al clasificatorio o a la guerra;</li>
          <li>ver cuánto cambian un nivel, un IV o una potencia más;</li>
          <li>armar el equipo contra un oponente que tú inventas.</li>
        </ul>`,
      };
    },
  },
  {
    id: 'campeonato',
    titulo: { pt: 'Campeonatos', en: 'Championships', es: 'Campeonatos' },
    grupo: 'mundo',
    html: (c) => {
      const loc = c.lang === 'pt' ? 'pt-BR' : c.lang === 'es' ? 'es-ES' : 'en-US';
      // O CALENDÁRIO é gerado, não cadastrado: `campeonatoAtivo` devolve a edição que está
      // acontecendo agora, e `campeonatoDe` a de qualquer mês. Este capítulo mostra a PRÓXIMA de
      // cada tipo e acompanha sozinho a virada do mês — nenhuma data escrita à mão aqui.
      const agora = Date.now();
      const proxima = (tipo) => {
        const d = new Date(agora);
        for (let n = 0; n <= 2; n++) {
          const t = d.getUTCFullYear() * 12 + d.getUTCMonth() + n;
          const x = campeonatoDe(tipo, Math.floor(t / 12), (t % 12) + 1);
          if (x && agora < x.fimEm) return x;
        }
        return campeonatoDe(tipo, d.getUTCFullYear(), d.getUTCMonth() + 1);
      };
      const M = proxima('mundial');
      const A = proxima('amador');
      // As datas são dias de Brasília escritos como AAAA-MM-DD; o meio-dia UTC não muda de dia
      // em fuso nenhum das Américas nem da Europa.
      const dia = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(loc, {
        day: 'numeric', month: 'long', timeZone: 'UTC',
      });
      const hora = new Date(M.lutasEm).toLocaleTimeString(loc, {
        hour: '2-digit', minute: '2-digit', timeZone: FUSO_CAMPEONATO,
      });
      const minRodada = N(Math.round(M.intervaloOndaMs / 60_000), c.lang);
      const max = N(PVP_TIME_MAX, c.lang);
      const reais = (v) => v.toLocaleString(loc, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
      const [m1, m2, m3] = M.premios.map(reais);
      const [a1, a2, a3] = A.premios.map(reais);
      const nvM = N(M.nivelMin, c.lang);
      const nvA = N(A.nivelMin, c.lang);
      return {
        pt: `
        <p>Os campeonatos do PokéIdle com <b>prêmio em dinheiro</b>: o <b>Mundial</b> e o
        <b>Amador</b>, um de cada todo mês, que se repetem para sempre no mesmo calendário. Ficam no
        menu do topo, em <b>Torneio</b>, que abre a <b>seleção de torneios</b>: três cards —
        <b>Mundial</b>, <b>Amador</b> e <b>Showdown</b> —, cada um com o prêmio, quando acontece, o
        nível pedido e uma linha ao vivo (inscrições abertas, chave publicada, ao vivo, campeão); o selo
        <b>✓ Inscrito</b> marca onde você já está. O card abre a <b>lista de edições</b> daquele modo —
        as que vêm por aí e as que já passaram —, e o botão <b>Como funciona?</b> da barra explica as
        regras. O terceiro card, o <a data-cap="showdown">Showdown</a>, é o torneio semanal da
        comunidade, com prêmio em diamante: tem capítulo próprio.</p>

        ${tabela(
          ['', 'Campeonato Mundial', 'Campeonato Amador'],
          `<tr><td>Dia das lutas</td><td>último dia do mês, às ${hora}</td><td>dia 15, às ${hora}</td></tr>
           <tr><td>Inscrições abrem</td><td>dia 16</td><td>dia 1º</td></tr>
           <tr><td>Inscrições fecham</td><td>fim do dia ${N(Number(M.ultimoDiaInscricao.slice(8)), c.lang)}</td><td>fim do dia 13</td></tr>
           <tr><td>Dia de análise</td><td>a véspera</td><td>dia 14</td></tr>
           <tr><td>Nível mínimo</td><td class="wk-num">${nvM}</td><td class="wk-num">${nvA}</td></tr>
           <tr><td>Shiny, P5 e lendário</td><td>liberados</td><td class="destaque">PROIBIDOS</td></tr>
           <tr><td>Premiação</td><td class="wk-num">${m1} / ${m2} / ${m3}</td><td class="wk-num">${a1} / ${a2} / ${a3}</td></tr>`,
        )}
        <p>A próxima edição do <b>Mundial</b> é dia <b>${dia(M.dia)}</b> (inscrições até o fim do
        dia <b>${dia(M.ultimoDiaInscricao)}</b>); a do <b>Amador</b>, dia <b>${dia(A.dia)}</b>
        (inscrições até <b>${dia(A.ultimoDiaInscricao)}</b>). Todos os horários são de Brasília.</p>

        ${nota(`<b>O Amador não aceita shiny, P5 nem lendário.</b> É o que ele é: um campeonato para quem
        ainda não tem a coleção do topo. Um shiny, um pokémon de potência 5 ou um
        <a data-cap="lendarios">lendário ou mítico</a> (o ×${MULT_LENDARIO_STATS} dele passaria por cima de
        qualquer montagem) é recusado na hora de salvar a equipe — e, se você não escolher equipe nenhuma,
        os que estiverem na sua equipe de PvP simplesmente não entram em campo.`, 'aviso')}

        <p>No Brasil, o prêmio é pago por <b>PIX</b>. Fora do Brasil, vai o valor equivalente em
        <b>USDT na rede Solana</b>, convertido na hora do pagamento.</p>

        <h4>Inscrição</h4>
        <ul>
          <li>Na lista, abra o campeonato e clique em <b>Registrar</b>. O Mundial pede <b>nível
          ${nvM}</b> de treinador; o Amador, <b>nível ${nvA}</b>.</li>
          <li>Dá para estar inscrito nos <b>dois ao mesmo tempo</b> — são campeonatos separados,
          com equipes separadas.</li>
          <li>Até o prazo dá para <b>cancelar</b> e se inscrever de novo.</li>
          <li>A aba <b>Participantes</b> mostra cada inscrito, com a skin, o nível, o elo, o PR e a
          seed. Tem busca por nick, e clicar no card abre o perfil.</li>
        </ul>

        <h4>A sua equipe</h4>
        <p>Depois de se inscrever, a faixa <b>Sua equipe do campeonato</b> mostra com quem você
        vai lutar.</p>
        <ul>
          <li><b>Selecionar minha Equipe</b> abre a sua coleção inteira (equipe e depot), com busca e
          filtros. Marque até <b>${max} pokémon</b>: o número no card é a ordem em que entram em
          campo. <b>Salvar equipe</b> grava.</li>
          <li>Essa equipe é <b>só daquele campeonato</b>: não muda a do PvP Ranqueado, não muda a do
          outro campeonato e <b>não aparece no perfil</b> de ninguém.</li>
          <li>Quem não escolher luta com a equipe do <a data-cap="pvp">PvP Ranqueado</a>, que é
          pública no perfil. <b>Usar a equipe do PvP</b> apaga a escolha e volta para ela.</li>
          <li><b>A equipe fica aberta o dia de análise inteiro</b> e só congela às <b>23h da
          véspera</b> — é para isso que o dia de análise existe: você já viu a chave e sabe contra
          quem vai lutar. Pokémon vendido ou anunciado no Mercado até lá fica de fora.</li>
        </ul>
        ${nota(`<b>Sem equipe no congelamento, todas as suas partidas são W.O.</b> A faixa avisa
        antes do prazo.`, 'aviso')}

        <h4>Seeds e chave</h4>
        <ul>
          <li>A <b>seed</b> é a sua posição na Tabela do PvP Ranqueado entre os inscritos: o mais
          alto é a Seed 1. Quem ainda está no posicionamento vem depois, pelos pontos.</li>
          <li>Até o prazo as seeds são <b>provisórias</b> e acompanham a Tabela. No fechamento
          elas <b>congelam</b> e a chave é publicada — e você passa o <b>dia de análise</b>
          inteiro olhando quem vai enfrentar.</li>
          <li>Na 1ª rodada a Seed 1 enfrenta a última, a 2 enfrenta a penúltima, e assim por
          diante. A 1 e a 2 ficam em lados opostos e só se cruzam na final.</li>
          <li>Se os inscritos não fecham uma chave cheia (4, 8, 16, 32…), as melhores seeds
          <b>avançam direto</b> para a 2ª rodada.</li>
        </ul>

        <h4>O formato</h4>
        <ul>
          <li><b>Eliminação dupla.</b> Perdeu na chave dos vencedores, você cai para a dos
          perdedores. Perdeu na dos perdedores, está fora.</li>
          <li><b>Grande final</b> em partida única: o campeão dos vencedores contra o campeão dos
          perdedores. O <b>3º lugar</b> é de quem perde a final da chave dos perdedores.</li>
          <li><b>A luta é a do PvP Ranqueado</b>: automática, com as mesmas regras.</li>
        </ul>

        <h4>As partidas rodam sozinhas</h4>
        <p>À <b>meia-noite do dia do campeonato</b> o servidor joga a chave <b>uma rodada a cada
        ${minRodada} minutos</b>, até a grande final. Ninguém precisa estar online.</p>
        <ul>
          <li>Na aba <b>Bracket</b>, toda partida jogada tem <b>▶ Assistir</b>: qualquer jogador vê o
          replay de qualquer partida.</li>
          <li>A chave acende o vencedor, mostra o placar de abates e marca W.O., título e 3º
          lugar. <b>Ver minha chave</b> leva direto ao seu caminho.</li>
          <li>Cada inscrito aparece como invicto, na chave dos perdedores ou eliminado. No fim, a
          <b>Premiação</b> mostra os três colocados.</li>
          <li>Numa chave grande, o seletor <b>Bracket inteira / Top 32 / Top 16 / Top 8 / Top 4</b>
          mostra só o trecho que interessa. Segure e arraste para navegar, como num mapa.</li>
        </ul>

        <h4>Troféus</h4>
        <ul>
          <li>Os pokémon da <b>equipe campeã</b> ganham o <b>Troféu</b> do campeonato (Mundial ou
          Amador) na ficha — e ele vai junto se o pokémon for vendido.</li>
          <li>O pódio ganha no <b>perfil</b> o troféu do campeão e as medalhas de 2º e 3º lugar.</li>
        </ul>

        <h4>Até quando dá para assistir</h4>
        <p>Os replays de um campeonato ficam disponíveis <b>até a chave do campeonato seguinte ser
        publicada</b> — na prática, umas duas semanas. Depois disso a tela mostra <b>só o pódio</b>,
        e o botão de assistir some.</p>
        ${nota(`Guardar a fita de todas as partidas de todos os campeonatos, para sempre, seria
        encher o servidor de vídeo que ninguém abre — e o processamento faz falta para o jogo. Por
        isso o replay tem prazo. O <b>resultado</b> não: a chave inteira, com todos os confrontos,
        continua lá para sempre.`)}`,
        en: `
        <p>PokéIdle's championships with a <b>cash prize</b>: the <b>World</b> and the
        <b>Amateur</b>, one of each every month, repeating forever on the same calendar. They live in
        the top menu, under <b>Tournament</b>, which opens the <b>tournament picker</b>: three cards —
        <b>World</b>, <b>Amateur</b> and <b>Showdown</b> —, each with the prize, when it happens, the
        level required and a live line (sign-ups open, bracket out, live, champion); the
        <b>✓ Registered</b> badge marks where you are already in. A card opens that mode's <b>edition
        list</b> — the ones coming up and the ones already played —, and the bar's <b>How does it
        work?</b> button explains the rules. The third card, the <a data-cap="showdown">Showdown</a>, is
        the community's weekly tournament, paid in diamonds: it has its own chapter.</p>

        ${tabela(
          ['', 'World Championship', 'Amateur Championship'],
          `<tr><td>Fight day</td><td>last day of the month, at ${hora}</td><td>the 15th, at ${hora}</td></tr>
           <tr><td>Sign-ups open</td><td>the 16th</td><td>the 1st</td></tr>
           <tr><td>Sign-ups close</td><td>end of the ${N(Number(M.ultimoDiaInscricao.slice(8)), c.lang)}th</td><td>end of the 13th</td></tr>
           <tr><td>Scouting day</td><td>the day before</td><td>the 14th</td></tr>
           <tr><td>Minimum level</td><td class="wk-num">${nvM}</td><td class="wk-num">${nvA}</td></tr>
           <tr><td>Shiny, P5 and legendary</td><td>allowed</td><td class="destaque">BANNED</td></tr>
           <tr><td>Prizes</td><td class="wk-num">${m1} / ${m2} / ${m3}</td><td class="wk-num">${a1} / ${a2} / ${a3}</td></tr>`,
        )}
        <p>The next <b>World</b> edition is on <b>${dia(M.dia)}</b> (sign-ups until the end of
        <b>${dia(M.ultimoDiaInscricao)}</b>); the next <b>Amateur</b> one is on
        <b>${dia(A.dia)}</b> (sign-ups until <b>${dia(A.ultimoDiaInscricao)}</b>). All times are
        Brasília time.</p>

        ${nota(`<b>The Amateur takes no shinies, no P5 and no legendaries.</b> That is the whole point of
        it: a championship for players who do not have the top-end collection yet. A shiny, a power-5
        pokémon or a <a data-cap="lendarios">legendary or mythical</a> (its ×${MULT_LENDARIO_STATS} would
        override any build) is refused when you save the team — and if you pick no team at all, the
        ones in your PvP team simply do not take the field.`, 'aviso')}

        <p>In Brazil, the prize is paid by <b>PIX</b>. Outside Brazil, the equivalent amount goes
        out in <b>USDT on the Solana network</b>, converted at the time of payment.</p>

        <h4>Signing up</h4>
        <ul>
          <li>From the list, open the championship and click <b>Register</b>. World asks for trainer
          <b>level ${nvM}</b>; Amateur, <b>level ${nvA}</b>.</li>
          <li>You can be in <b>both at once</b> — they are separate championships, with separate
          teams.</li>
          <li>Until the deadline you can <b>cancel</b> and sign up again.</li>
          <li>The <b>Participants</b> tab shows every entrant with their skin, level, elo, PR and
          seed. It has a nick search, and clicking a card opens the profile.</li>
        </ul>

        <h4>Your team</h4>
        <p>Once you sign up, the <b>Your championship team</b> strip shows who you will fight
        with.</p>
        <ul>
          <li><b>Select my Team</b> opens your whole collection (team and depot), with search and
          filters. Mark up to <b>${max} pokémon</b>: the number on the card is the order they take
          the field. <b>Save team</b> stores it.</li>
          <li>That team is <b>for that championship only</b>: it does not change your Ranked PvP
          team, does not change the other championship's team and <b>never shows</b> on anyone's
          profile.</li>
          <li>If you do not pick one, you fight with your <a data-cap="pvp">Ranked PvP</a> team,
          which is public on your profile. <b>Use my PvP team</b> clears your pick and goes back to
          it.</li>
          <li><b>The team stays open through the whole scouting day</b> and only freezes at
          <b>11 PM the day before</b> — that is what the scouting day is for: you have already seen
          the bracket and you know who you are up against. A pokémon sold or listed on the Market
          before then is left out.</li>
        </ul>
        ${nota(`<b>With no team at freeze time, every match of yours is a walkover loss.</b> The
        strip warns you before the deadline.`, 'aviso')}

        <h4>Seeds and bracket</h4>
        <ul>
          <li>Your <b>seed</b> is your position on the Ranked PvP ladder among the entrants: the
          highest is Seed 1. Players still in placement come after, by points.</li>
          <li>Until the deadline the seeds are <b>provisional</b> and follow the ladder. At closing
          they <b>freeze</b> and the bracket is published — and you get the whole <b>scouting
          day</b> to study who you will face.</li>
          <li>In round 1, Seed 1 faces the last seed, Seed 2 faces the second-to-last, and so on.
          Seeds 1 and 2 sit on opposite sides and can only meet in the final.</li>
          <li>If the entrants do not fill a full bracket (4, 8, 16, 32…), the best seeds get a
          <b>bye</b> into round 2.</li>
        </ul>

        <h4>The format</h4>
        <ul>
          <li><b>Double elimination.</b> Lose in the winners' bracket and you drop to the losers'
          bracket. Lose in the losers' bracket and you are out.</li>
          <li><b>Grand final</b> in a single match: the winners' champion against the losers'
          champion. <b>3rd place</b> goes to whoever loses the losers' bracket final.</li>
          <li><b>The fight is the Ranked PvP one</b>: automatic, with the same rules.</li>
        </ul>

        <h4>Matches play themselves</h4>
        <p>At <b>midnight on the championship day</b> the server plays the bracket <b>one round
        every ${minRodada} minutes</b>, up to the grand final. Nobody needs to be online.</p>
        <ul>
          <li>In the <b>Bracket</b> tab, every played match has <b>▶ Watch</b>: any player can see
          the replay of any match.</li>
          <li>The bracket lights up the winner, shows the knockout score and marks walkovers, the
          title and 3rd place. <b>View my bracket</b> jumps to your path.</li>
          <li>Each entrant shows as unbeaten, in the losers' bracket or eliminated. At the end, the
          <b>Prizes</b> tab shows the top three.</li>
          <li>In a big bracket, the <b>Full bracket / Top 32 / Top 16 / Top 8 / Top 4</b> selector
          shows only the part that matters. Hold and drag to move around, like a map.</li>
        </ul>

        <h4>Trophies</h4>
        <ul>
          <li>The pokémon on the <b>champion team</b> earn the championship's <b>Trophy</b> (World or
          Amateur) on their sheet — and it goes along if the pokémon is sold.</li>
          <li>The podium gets the champion's trophy and the 2nd and 3rd place medals on their
          <b>profile</b>.</li>
        </ul>

        <h4>How long replays stay up</h4>
        <p>A championship's replays stay available <b>until the next championship's bracket is
        published</b> — about two weeks in practice. After that the screen shows <b>the podium
        only</b>, and the watch button is gone.</p>
        ${nota(`Keeping the tape of every match of every championship forever would fill the server
        with video nobody opens — and the processing is better spent on the game. So the replay has
        a deadline. The <b>result</b> does not: the whole bracket, with every match-up, stays there
        for good.`)}`,
        es: `
        <p>Los campeonatos de PokéIdle con <b>premio en dinero</b>: el <b>Mundial</b> y el
        <b>Amateur</b>, uno de cada uno al mes, que se repiten para siempre en el mismo calendario.
        Están en el menú superior, en <b>Torneo</b>, que abre la <b>selección de torneos</b>: tres
        tarjetas — <b>Mundial</b>, <b>Amateur</b> y <b>Showdown</b> —, cada una con el premio, cuándo se
        juega, el nivel exigido y una línea en vivo (inscripciones abiertas, cuadro publicado, en vivo,
        campeón); el sello <b>✓ Inscrito</b> marca dónde ya estás. La tarjeta abre la <b>lista de
        ediciones</b> de ese modo — las que vienen y las que ya pasaron —, y el botón <b>¿Cómo
        funciona?</b> de la barra explica las reglas. La tercera tarjeta, el
        <a data-cap="showdown">Showdown</a>, es el torneo semanal de la comunidad, con premio en
        diamantes: tiene capítulo propio.</p>

        ${tabela(
          ['', 'Campeonato Mundial', 'Campeonato Amateur'],
          `<tr><td>Día de las peleas</td><td>último día del mes, a las ${hora}</td><td>día 15, a las ${hora}</td></tr>
           <tr><td>Inscripciones abren</td><td>día 16</td><td>día 1</td></tr>
           <tr><td>Inscripciones cierran</td><td>fin del día ${N(Number(M.ultimoDiaInscricao.slice(8)), c.lang)}</td><td>fin del día 13</td></tr>
           <tr><td>Día de análisis</td><td>la víspera</td><td>día 14</td></tr>
           <tr><td>Nivel mínimo</td><td class="wk-num">${nvM}</td><td class="wk-num">${nvA}</td></tr>
           <tr><td>Shiny, P5 y legendario</td><td>permitidos</td><td class="destaque">PROHIBIDOS</td></tr>
           <tr><td>Premios</td><td class="wk-num">${m1} / ${m2} / ${m3}</td><td class="wk-num">${a1} / ${a2} / ${a3}</td></tr>`,
        )}
        <p>La próxima edición del <b>Mundial</b> es el <b>${dia(M.dia)}</b> (inscripciones hasta el
        final del <b>${dia(M.ultimoDiaInscricao)}</b>); la del <b>Amateur</b>, el
        <b>${dia(A.dia)}</b> (inscripciones hasta el <b>${dia(A.ultimoDiaInscricao)}</b>). Todos
        los horarios son de Brasilia.</p>

        ${nota(`<b>El Amateur no acepta shiny, P5 ni legendarios.</b> Es justo lo que lo define: un
        campeonato para quien todavía no tiene la colección de arriba. Un shiny, un pokémon de potencia
        5 o un <a data-cap="lendarios">legendario o mítico</a> (su ×${MULT_LENDARIO_STATS} pasaría por
        encima de cualquier armado) se rechaza al guardar el equipo — y si no eliges ningún equipo, los
        que estén en tu equipo de PvP simplemente no salen al campo.`, 'aviso')}

        <p>En Brasil, el premio se paga por <b>PIX</b>. Fuera de Brasil, se envía el valor
        equivalente en <b>USDT en la red Solana</b>, convertido en el momento del pago.</p>

        <h4>Inscripción</h4>
        <ul>
          <li>En la lista, abre el campeonato y pulsa <b>Inscribirse</b>. El Mundial pide <b>nivel
          ${nvM}</b> de entrenador; el Amateur, <b>nivel ${nvA}</b>.</li>
          <li>Puedes estar inscrito en <b>los dos a la vez</b>: son campeonatos separados, con
          equipos separados.</li>
          <li>Hasta el plazo puedes <b>cancelar</b> y volver a inscribirte.</li>
          <li>La pestaña <b>Participantes</b> muestra a cada inscrito con su skin, nivel, elo, PR y
          seed. Tiene búsqueda por nick, y al pulsar la tarjeta se abre el perfil.</li>
        </ul>

        <h4>Tu equipo</h4>
        <p>Después de inscribirte, la franja <b>Tu equipo del campeonato</b> muestra con quién
        vas a pelear.</p>
        <ul>
          <li><b>Seleccionar mi Equipo</b> abre tu colección entera (equipo y depot), con búsqueda y
          filtros. Marca hasta <b>${max} pokémon</b>: el número de la tarjeta es el orden en que
          salen al campo. <b>Guardar equipo</b> lo graba.</li>
          <li>Ese equipo es <b>solo de aquel campeonato</b>: no cambia el del PvP Clasificatorio, no
          cambia el del otro campeonato y <b>no aparece en el perfil</b> de nadie.</li>
          <li>Quien no elige pelea con el equipo del <a data-cap="pvp">PvP Clasificatorio</a>, que
          es público en el perfil. <b>Usar mi equipo del PvP</b> borra la elección y vuelve a
          él.</li>
          <li><b>El equipo sigue abierto todo el día de análisis</b> y solo se congela a las
          <b>23h de la víspera</b>: para eso existe el día de análisis, ya viste el cuadro y sabes
          contra quién peleas. Un pokémon vendido o anunciado en el Mercado antes de eso queda
          fuera.</li>
        </ul>
        ${nota(`<b>Sin equipo al congelar, todas tus partidas se pierden por W.O.</b> La franja
        avisa antes del plazo.`, 'aviso')}

        <h4>Seeds y cuadro</h4>
        <ul>
          <li>La <b>seed</b> es tu posición en la Tabla del PvP Clasificatorio entre los inscritos:
          el más alto es la Seed 1. Quien sigue en la colocación va después, por los puntos.</li>
          <li>Hasta el plazo las seeds son <b>provisionales</b> y siguen la Tabla. Al cierre se
          <b>congelan</b> y se publica el cuadro — y tienes todo el <b>día de análisis</b> para
          estudiar a quién te enfrentas.</li>
          <li>En la 1.ª ronda la Seed 1 se enfrenta a la última, la 2 a la penúltima, y así
          sucesivamente. La 1 y la 2 quedan en lados opuestos y solo se cruzan en la final.</li>
          <li>Si los inscritos no llenan un cuadro completo (4, 8, 16, 32…), las mejores seeds
          <b>pasan directo</b> a la 2.ª ronda.</li>
        </ul>

        <h4>El formato</h4>
        <ul>
          <li><b>Doble eliminación.</b> Si pierdes en el cuadro de ganadores, bajas al de
          perdedores. Si pierdes en el de perdedores, quedas fuera.</li>
          <li><b>Gran final</b> a partida única: el campeón de ganadores contra el campeón de
          perdedores. El <b>3.er puesto</b> es de quien pierde la final del cuadro de
          perdedores.</li>
          <li><b>La pelea es la del PvP Clasificatorio</b>: automática, con las mismas reglas.</li>
        </ul>

        <h4>Las partidas se juegan solas</h4>
        <p>A <b>medianoche del día del campeonato</b> el servidor juega el cuadro <b>una ronda cada
        ${minRodada} minutos</b>, hasta la gran final. Nadie necesita estar conectado.</p>
        <ul>
          <li>En la pestaña <b>Bracket</b>, toda partida jugada tiene <b>▶ Ver</b>: cualquier
          jugador ve el replay de cualquier partida.</li>
          <li>El cuadro ilumina al ganador, muestra el marcador de derrotas y marca W.O., título y
          3.er puesto. <b>Ver mi cuadro</b> lleva directo a tu camino.</li>
          <li>Cada inscrito aparece como invicto, en el cuadro de perdedores o eliminado. Al final,
          la pestaña <b>Premios</b> muestra a los tres primeros.</li>
          <li>En un cuadro grande, el selector <b>Cuadro completo / Top 32 / Top 16 / Top 8 / Top 4</b>
          muestra solo el tramo que interesa. Mantén pulsado y arrastra para moverte, como en un
          mapa.</li>
        </ul>

        <h4>Trofeos</h4>
        <ul>
          <li>Los pokémon del <b>equipo campeón</b> ganan el <b>Trofeo</b> del campeonato (Mundial o
          Amateur) en su ficha — y va con ellos si el pokémon se vende.</li>
          <li>El podio gana en el <b>perfil</b> el trofeo del campeón y las medallas de 2.º y 3.er
          puesto.</li>
        </ul>

        <h4>Hasta cuándo se puede ver</h4>
        <p>Los replays de un campeonato quedan disponibles <b>hasta que se publique el cuadro del
        campeonato siguiente</b> — unas dos semanas en la práctica. Después de eso la pantalla
        muestra <b>solo el podio</b>, y el botón de ver desaparece.</p>
        ${nota(`Guardar la cinta de todas las partidas de todos los campeonatos, para siempre,
        llenaría el servidor de vídeo que nadie abre — y el procesamiento hace falta para el juego.
        Por eso el replay tiene plazo. El <b>resultado</b> no: el cuadro entero, con todos los
        enfrentamientos, sigue ahí para siempre.`)}`,
      };
    },
  },

  // ------------------------------------------------------------ 14a. showdown
  //
  // O torneio SEMANAL da comunidade (decisões do dono em 11/10/2026). Tudo sai de `shared/showdown.mjs`,
  // o módulo com que o servidor recusa a equipe, congela o retrato e paga o pódio: a agenda da quarta, a
  // rodada, o teto de nível, o requisito, o prêmio e o mínimo de participantes. A coluna do Mundial na
  // tabela do teto é `nivelNoGinasio` (`shared/ginasios.mjs`); o ×N do shiny e do P5 são os do `welcome`,
  // os mesmos dos capítulos Shiny e Potência; a duração da noite sai da chave de `shared/campeonato.mjs`.
  // As duas regras do prêmio que não são número — o mínimo conta só quem tem pokémon que pode lutar, e
  // quem chega ao pódio só por W.O. não recebe — são as de `fecharPremios` (`server/showdown-db.mjs`).
  {
    id: 'showdown',
    titulo: { pt: 'Showdown', en: 'Showdown', es: 'Showdown' },
    grupo: 'mundo',
    html: (c) => {
      const loc = c.lang === 'pt' ? 'pt-BR' : c.lang === 'es' ? 'es-ES' : 'en-US';
      // O CALENDÁRIO é gerado, como o dos campeonatos: `A` é a edição que recebe inscrições agora
      // (antes da janela da nº 1, a própria nº 1). Na noite das lutas — quarta 20:00 à meia-noite —
      // `showdownAtivo` devolve a que está lutando, e o capítulo avisa que ela está ao vivo.
      const agora = Date.now();
      const A = showdownAberto(agora) ?? primeiroShowdown();
      const ativo = showdownAtivo(agora);
      const hoje = ativo && ativo.id !== A.id ? ativo : null;
      const dia = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(loc, {
        day: 'numeric', month: 'long', timeZone: 'UTC',
      });
      const hora = (t) => new Date(t).toLocaleTimeString(loc, {
        hour: '2-digit', minute: '2-digit', timeZone: FUSO_CAMPEONATO,
      });
      const fecha = hora(A.inscricoesAte);
      const lutas = hora(A.lutasEm);
      const fim = hora(A.fimEm);
      const porRodada = (ms) => {
        const m = Math.round(ms / 60_000);
        return {
          pt: m === 1 ? 'uma rodada por minuto' : `uma rodada a cada ${N(m, 'pt')} minutos`,
          en: m === 1 ? 'one round per minute' : `one round every ${N(m, 'en')} minutes`,
          es: m === 1 ? 'una ronda por minuto' : `una ronda cada ${N(m, 'es')} minutos`,
        }[c.lang];
      };
      const rodadaSd = porRodada(A.intervaloOndaMs);
      const rodadaCamp = porRodada(INTERVALO_ONDA_MS);
      const numero = (ed) => N(ed.numero, c.lang);
      const cap = N(SHOWDOWN_NIVEL_CAP, c.lang);
      const cheio = N(ARENA_NIVEL_CHEIO, c.lang);
      const nv = N(SHOWDOWN_NIVEL_MIN, c.lang);
      const max = N(PVP_TIME_MAX, c.lang);
      const min = N(SHOWDOWN_MIN_PARA_PREMIO, c.lang);
      const teto = N(TETO_DIAMANTES_SHOWDOWN, c.lang);
      const [p1, p2, p3] = SHOWDOWN_PREMIOS.map((v) => N(v, c.lang));
      const nv200 = N(200, c.lang);
      const nv300 = N(300, c.lang);
      const sd200 = N(nivelNoShowdown(200), c.lang);
      const mundial300 = N(nivelNoGinasio(300), c.lang);
      const shiny = D(c.d.multShinyStats ?? 3, c.lang);
      const p5 = D(1 + (c.d.potencias?.find((p) => p.n === 5)?.bonus ?? 1), c.lang);
      const seg = N(SEG_VARREDURA_PREMIO, c.lang);
      return {
        pt: `
        <p>O <b>Showdown</b> é o torneio <b>semanal</b> da comunidade: <b>toda quarta</b>, com os
        <b>seus pokémon de verdade</b> — a mesma equipe do Mundial e do Amador, a mesma luta do
        <a data-cap="pvp">PvP Ranqueado</a> —, mas sem o que só os veteranos têm. Aqui ganha quem
        <b>monta</b> melhor, não quem tem o pokémon mais raro. O prêmio é em <b>diamante</b>. Para
        entrar: menu do topo → <b>Torneio</b> → <b>Showdown</b> (a seleção de torneios está em
        <a data-cap="campeonato">Campeonatos</a>).</p>

        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Quando</td><td>toda quarta, às ${lutas}</td></tr>
           <tr><td>Inscrições</td><td>a semana inteira, até quarta às ${fecha}</td></tr>
           <tr><td>A equipe trava</td><td>quarta às ${fecha}, junto com as inscrições</td></tr>
           <tr><td>Rodadas</td><td>${rodadaSd}</td></tr>
           <tr><td>Nível de treinador</td><td class="wk-num">${nv}</td></tr>
           <tr><td>Pokémon na equipe</td><td class="wk-num">até ${max}</td></tr>
           <tr><td>Nível do pokémon na luta</td><td class="wk-num destaque">até ${cap}</td></tr>
           <tr><td>Não entram</td><td>shiny, P5, lendário e mítico, variante de Outland, pokémon com Z-Move ou TM AoE</td></tr>
           <tr><td>Podem</td><td>mega (sem limite) e espécie repetida</td></tr>
           <tr><td>Prêmio</td><td class="wk-num">${p1} / ${p2} / ${p3} 💎</td></tr>`,
        )}
        <p>${hoje ? `<b>Hoje é noite de Showdown:</b> o #${numero(hoje)} luta a partir das ${lutas}, ao
        vivo, na aba Bracket. ` : ''}A próxima edição é o <b>Showdown #${numero(A)}</b>${A.numero === 1
          ? ', o primeiro' : ''}: lutas na quarta, <b>${dia(A.dia)}</b>, às ${lutas}, e inscrições até as
        <b>${fecha}</b> do mesmo dia. Todos os horários são de Brasília.</p>

        <h4>Quem não entra — e por quê</h4>
        <ul>
          <li><b>Shiny</b> — ×${shiny} em todos os stats (ver <a data-cap="shiny">Shiny</a>). É sorte de
          captura, e decidiria a luta sozinho.</li>
          <li><b>P5</b> — a potência máxima: ×${p5} nos stats (ver <a data-cap="potencia">Potência</a>).
          Rara, e quase sempre de quem caça há meses.</li>
          <li><b>Lendário e mítico</b> — ×${MULT_LENDARIO_STATS} em todos os stats (ver
          <a data-cap="potencia">Potência</a>): Mewtwo, Rayquaza, Arceus e companhia, de Kanto a Paldea. A
          lista é a mesma da <a data-cap="mistico">Arena Mística</a>, e o clone de Orre de um lendário também
          conta como lendário.</li>
          <li><b>Variante de Outland</b> — o catálogo <b>#2001+</b>, exclusivo das Outlands (Ancient
          Pupitar, Furious Magikarp…), de quem já chegou lá.</li>
          <li><b>Com Z-Move</b> ou <b>com TM AoE</b> instalado — o investimento da caça avançada (ver
          <a data-cap="tm">TM Disks</a>).</li>
        </ul>
        <p><b>Podem:</b> <b>mega</b>, sem limite, e <b>espécie repetida</b> — dois Garchomp no mesmo
        time, por exemplo. Os proibidos não saem da sua coleção nem mudam em nada: só ficam de fora do
        Showdown.</p>
        ${nota(`<b>Por quê?</b> O Showdown é o torneio da comunidade. Tirando da mesa o que só os
        veteranos juntaram — a sorte da captura, os meses de caça, os discos —, quem decide é a
        <b>montagem</b>: que pokémon, em que ordem, contra quem. E a lista puxa a caça: toda semana vale
        ir atrás de um pokémon forte que <b>caiba</b> no Showdown.`, 'dica')}

        <h4>O nível máximo: ${cap}</h4>
        <p>É o único torneio com <b>teto de nível</b>: o pokémon luta com o nível dele <b>até ${cap}</b>,
        e daí para cima o nível a mais não ajuda. No Mundial, no Amador e no PvP Ranqueado o nível acima
        de ${cheio} ainda conta, só que comprimido pela régua da arena (ver
        <a data-cap="ginasios">Ginásios</a>):</p>
        ${tabelaTetoShowdown(c)}
        <p>Até ${cap}, os dois dão exatamente o mesmo nível — a diferença é que aqui ele para. Um Nv
        ${nv300} luta como <b>${mundial300}</b> no Mundial e como <b>${cap}</b> no Showdown: um Nv ${cap}
        bem montado briga de igual com ele. Na folha da equipe, o card de quem passa do teto mostra a
        conta — <b>Nv ${nv200} → luta como ${sd200}</b>.</p>
        ${nota(`<b>Só o nível tem teto.</b> IV, qualidade, potência (até P4) e refino entram inteiros — é
        neles que dois pokémon Nv ${cap} se separam.`)}

        <h4>A agenda da semana</h4>
        <ul>
          <li><b>A semana inteira:</b> inscrições abertas. Elas abrem na quarta às ${fecha}, no instante
          em que a edição anterior fecha, e vão até a quarta seguinte, às ${fecha}. Até lá dá para
          cancelar e se inscrever de novo, e trocar a equipe quantas vezes quiser.</li>
          <li><b>Quarta, ${fecha}:</b> as inscrições fecham, as seeds congelam, a <b>chave é publicada</b>
          e a equipe <b>trava</b> — tudo no mesmo instante. Não há dia de análise como no Mundial:
          ninguém ajusta a equipe olhando a chave.</li>
          <li><b>Quarta, ${lutas}:</b> a primeira rodada, e daí <b>${rodadaSd}</b>, ao vivo, até a grande
          final — no Mundial e no Amador é ${rodadaCamp}. Ninguém precisa estar online.</li>
        </ul>
        <p>A noite é curta: cada rodada joga de uma vez toda partida que já tem os dois lados, e o número
        de rodadas cresce devagar com o tamanho da chave.</p>
        ${tabelaDuracaoShowdown(c, A, hora)}

        <h4>Inscrição</h4>
        <ul>
          <li>Em <b>Torneio → Showdown</b>, abra a edição e clique em <b>Inscrever-se</b>. Pede <b>nível
          ${nv}</b> de treinador. A confirmação repete as regras e a agenda antes de você entrar.</li>
          <li>É de graça, e até quarta às ${fecha} dá para <b>cancelar</b> e se inscrever de novo.</li>
          <li>A aba <b>Participantes</b> mostra cada inscrito, com a seed; clicar no card abre o
          perfil.</li>
        </ul>

        <h4>A sua equipe</h4>
        <ul>
          <li>Até <b>${max} pokémon</b> seus, na ordem em que entram na luta. Depois de se inscrever,
          <b>Selecionar minha Equipe</b> abre a sua coleção — equipe e depot —, com busca e filtros; os
          proibidos ficam no fim, apagados e com o motivo escrito (Shiny, P5, Lendário, Mítico, Outland,
          tem Z-Move, tem TM AoE). <b>Salvar equipe</b> grava. Os botões de <b>Formações</b>
          preenchem a seleção com uma formação salva do PvP, sem os proibidos dela.</li>
          <li>Sem escolher, vale a sua <b>equipe do PvP Ranqueado</b> — e os proibidos dela ficam de fora
          na hora da trava. <b>Usar a equipe do PvP</b> apaga a escolha e volta para ela.</li>
          <li>A equipe escolhida é <b>só do Showdown</b>: não muda a do PvP nem a de um campeonato, e não
          aparece no perfil de ninguém.</li>
          <li><b>Às ${fecha} de quarta a equipe trava</b> e vira um <b>retrato</b>: os números de cada
          pokémon naquele instante. É o retrato que luta a chave inteira — subir de nível, vender ou
          anunciar o pokémon depois disso não muda nada. Vendido ou anunciado no Mercado <b>antes</b> da
          trava, ele fica de fora.</li>
          <li>O Showdown <b>só lê</b> os seus pokémon: eles não saem da coleção, não mudam, não ganham
          troféu nem XP, e as partidas não contam no placar das formações nem vão para o Tracker.</li>
          <li>Até o fim da noite das lutas (quinta, ${fim}), a equipe escolhida fica <b>protegida do Auto
          Selecionar</b> da <a data-cap="oferenda">Oferenda</a>: o botão não a põe na roleta.</li>
        </ul>
        ${nota(`<b>Sem nenhum pokémon que possa lutar na hora da trava, todas as suas partidas são
        W.O.</b> A faixa da sua equipe avisa antes, e conta quantos ficaram de fora por serem
        proibidos.`, 'aviso')}

        <h4>Seeds, chave e formato</h4>
        <ul>
          <li>A <b>seed</b> é a sua posição na Tabela do <a data-cap="pvp">PvP Ranqueado</a> entre os
          inscritos: o mais alto é a Seed 1. Quem ainda está no posicionamento vem depois, pelos pontos.
          Até quarta às ${fecha} as seeds são provisórias; na trava elas congelam.</li>
          <li>O formato é o do Mundial e do Amador: <b>eliminação dupla</b> (perdeu na chave dos
          vencedores, cai para a dos perdedores; perdeu lá, está fora), <b>grande final</b> em partida
          única e o <b>3º lugar</b> para quem perde a final da chave dos perdedores. Se os inscritos não
          fecham uma chave cheia, as melhores seeds avançam direto (detalhes em
          <a data-cap="campeonato">Campeonatos</a>).</li>
          <li>A luta é a do PvP Ranqueado — automática, mesmas regras —, com o nível de cada pokémon no
          teto de ${cap}.</li>
          <li>Na aba <b>Bracket</b>, toda partida jogada tem <b>▶ Assistir</b>, para qualquer jogador. As
          fitas ficam até a chave do Showdown seguinte ser publicada — na quarta seguinte, às ${fecha}:
          uma semana. Depois disso fica só o resultado.</li>
        </ul>

        <h4>O prêmio</h4>
        ${tabelaPremioShowdown(c)}
        <ul>
          <li><b>Só com ${min} ou mais participantes que podem lutar.</b> Conta quem entrou na chave,
          chegou à trava com <b>pelo menos um pokémon que pode lutar</b> e não está com a conta banida.
          Numa edição com menos, a chave roda igual, mas ninguém leva diamante.</li>
          <li><b>Quem chega ao pódio sem ter lutado nenhuma partida de verdade — só por W.O. — não
          recebe</b>, e o lugar não passa para o seguinte. Conta banida também não recebe, e o lugar dela
          também não passa adiante: o prêmio segue o resultado que todo mundo viu.</li>
          <li>O prêmio <b>cai sozinho</b>. O pódio é registrado logo depois da grande final: quem está
          online recebe a tela de prêmio na próxima passada do servidor, que roda a cada ${seg} segundos;
          quem está fora recebe no <b>próximo login</b>. Não vence.</li>
          <li>É <b>diamante de prêmio</b>: vale na Loja, mas <b>não vai ao Mercado da Comunidade</b> — só
          diamante comprado entra na cota de venda. Uma edição paga no máximo ${teto} 💎, somando o
          pódio.</li>
          <li>Sem troféu: o Showdown não dá troféu na ficha do pokémon nem medalha no perfil. Na aba
          <b>Premiação</b> ficam os <b>times do pódio</b> — a espécie, o nível no teto e a potência de
          cada pokémon com que eles lutaram —, e um clique num deles abre a <b>ficha</b> dele, com os stats
          com que lutou.</li>
        </ul>`,
        en: `
        <p>The <b>Showdown</b> is the community's <b>weekly</b> tournament: <b>every Wednesday</b>, with
        <b>your real pokémon</b> — the same team as in the World and the Amateur, the same fight as
        <a data-cap="pvp">Ranked PvP</a> —, but without what only veterans have. Here the best
        <b>build</b> wins, not the rarest pokémon. The prize is in <b>diamonds</b>. To get there: top
        menu → <b>Tournament</b> → <b>Showdown</b> (the tournament picker is covered in
        <a data-cap="campeonato">Championships</a>).</p>

        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>When</td><td>every Wednesday, at ${lutas}</td></tr>
           <tr><td>Sign-ups</td><td>all week, until Wednesday at ${fecha}</td></tr>
           <tr><td>Team lock</td><td>Wednesday at ${fecha}, together with sign-ups</td></tr>
           <tr><td>Rounds</td><td>${rodadaSd}</td></tr>
           <tr><td>Trainer level</td><td class="wk-num">${nv}</td></tr>
           <tr><td>Pokémon per team</td><td class="wk-num">up to ${max}</td></tr>
           <tr><td>Pokémon level in battle</td><td class="wk-num destaque">up to ${cap}</td></tr>
           <tr><td>Not allowed</td><td>shiny, P5, legendary and mythical, Outland variants, pokémon with an Z-Move or AoE TM</td></tr>
           <tr><td>Allowed</td><td>megas (no limit) and repeated species</td></tr>
           <tr><td>Prizes</td><td class="wk-num">${p1} / ${p2} / ${p3} 💎</td></tr>`,
        )}
        <p>${hoje ? `<b>Tonight is Showdown night:</b> #${numero(hoje)} fights from ${lutas}, live, in
        the Bracket tab. ` : ''}The next edition is <b>Showdown #${numero(A)}</b>${A.numero === 1
          ? ', the very first' : ''}: fights on Wednesday, <b>${dia(A.dia)}</b>, at ${lutas}, and sign-ups
        until <b>${fecha}</b> that same day. All times are Brasília time.</p>

        <h4>Who is out — and why</h4>
        <ul>
          <li><b>Shiny</b> — ×${shiny} on every stat (see <a data-cap="shiny">Shiny</a>). It is capture
          luck, and it would decide the fight on its own.</li>
          <li><b>P5</b> — the top potency: ×${p5} on stats (see <a data-cap="potencia">Potency</a>).
          Rare, and almost always from someone who has hunted for months.</li>
          <li><b>Legendary and mythical</b> — ×${MULT_LENDARIO_STATS} on every stat (see
          <a data-cap="potencia">Potency</a>): Mewtwo, Rayquaza, Arceus and friends, from Kanto to Paldea.
          The list is the same as the <a data-cap="mistico">Mystic Arena</a>'s, and the Orre clone of a
          legendary counts as legendary too.</li>
          <li><b>Outland variants</b> — the <b>#2001+</b> catalog, exclusive to the Outlands (Ancient
          Pupitar, Furious Magikarp…), from players who already got there.</li>
          <li><b>With an Z-Move</b> or <b>with an AoE TM</b> installed — the advanced-hunt
          investment (see <a data-cap="tm">TM Disks</a>).</li>
        </ul>
        <p><b>Allowed:</b> <b>megas</b>, with no limit, and <b>repeated species</b> — two Garchomp on the
        same team, for example. Banned pokémon do not leave your collection and nothing about them
        changes: they just sit out the Showdown.</p>
        ${nota(`<b>Why?</b> The Showdown is the community tournament. Take off the table what only
        veterans have piled up — capture luck, months of hunting, the disks — and the <b>build</b>
        decides: which pokémon, in what order, against whom. And the list drives the hunt: every week it
        is worth chasing a strong pokémon that <b>fits</b> the Showdown.`, 'dica')}

        <h4>The level cap: ${cap}</h4>
        <p>It is the only tournament with a <b>level cap</b>: a pokémon fights at its own level <b>up
        to ${cap}</b>, and beyond that extra levels do not help. In the World, the Amateur and Ranked PvP,
        levels above ${cheio} still count, just compressed by the arena scale (see
        <a data-cap="ginasios">Gyms</a>):</p>
        ${tabelaTetoShowdown(c)}
        <p>Up to ${cap}, both give exactly the same level — the difference is that here it stops. A Lv
        ${nv300} fights as <b>${mundial300}</b> in the World and as <b>${cap}</b> in the Showdown: a
        well-built Lv ${cap} fights it on equal terms. In the team picker, the card of anything above
        the cap shows the math — <b>Lv ${nv200} → fights as ${sd200}</b>.</p>
        ${nota(`<b>Only the level is capped.</b> IVs, quality, potency (up to P4) and refining count in
        full — that is where two Lv ${cap} pokémon pull apart.`)}

        <h4>The weekly schedule</h4>
        <ul>
          <li><b>All week:</b> sign-ups are open. They open on Wednesday at ${fecha}, the moment the
          previous edition closes, and run until the next Wednesday at ${fecha}. Until then you can
          withdraw and sign up again, and change your team as often as you like.</li>
          <li><b>Wednesday, ${fecha}:</b> sign-ups close, seeds freeze, the <b>bracket is
          published</b> and the team <b>locks</b> — all at the same instant. There is no scouting day
          like in the World: nobody adjusts their team looking at the bracket.</li>
          <li><b>Wednesday, ${lutas}:</b> the first round, then <b>${rodadaSd}</b>, live, up to the
          grand final — in the World and the Amateur it is ${rodadaCamp}. Nobody needs to be
          online.</li>
        </ul>
        <p>The night is short: each round plays, in one go, every match whose two sides are already
        known, and the number of rounds grows slowly with the bracket size.</p>
        ${tabelaDuracaoShowdown(c, A, hora)}

        <h4>Signing up</h4>
        <ul>
          <li>In <b>Tournament → Showdown</b>, open the edition and click <b>Sign up</b>. It requires
          trainer <b>level ${nv}</b>. The confirmation repeats the rules and the schedule before you
          join.</li>
          <li>It is free, and until Wednesday at ${fecha} you can <b>withdraw</b> and sign up again.</li>
          <li>The <b>Participants</b> tab shows every entrant with their seed; clicking a card opens the
          profile.</li>
        </ul>

        <h4>Your team</h4>
        <ul>
          <li>Up to <b>${max} of your pokémon</b>, in the order they enter the fight. Once signed up,
          <b>Select my Team</b> opens your collection — team and depot —, with search and filters;
          banned pokémon sit at the end, greyed out, with the reason written on them (Shiny, P5,
          Legendary, Mythical, Outland, has Z-Move, has AoE TM). <b>Save team</b> stores it. The
          <b>Lineups</b> buttons fill the selection with a saved PvP lineup, minus its banned
          pokémon.</li>
          <li>With no pick, your <b>Ranked PvP team</b> counts — and its banned pokémon sit out when the
          team locks. <b>Use my PvP team</b> clears your pick and goes back to it.</li>
          <li>The team you pick is <b>for the Showdown only</b>: it does not change your PvP team or a
          championship team, and it never shows on anyone's profile.</li>
          <li><b>At ${fecha} on Wednesday the team locks</b> and becomes a <b>snapshot</b>: the numbers of
          each pokémon at that instant. The snapshot plays the whole bracket — leveling up, selling or
          listing the pokémon after that changes nothing. Sold or listed on the Market <b>before</b> the
          lock, it is left out.</li>
          <li>The Showdown <b>only reads</b> your pokémon: they do not leave your collection, do not
          change, get no trophy and no XP, and the matches do not count toward your lineup scores or go
          to the Tracker.</li>
          <li>Until the end of fight night (Thursday, ${fim}), the team you picked is <b>protected from
          Auto Select</b> in the <a data-cap="oferenda">Offering</a>: the button will not put it on the
          wheel.</li>
        </ul>
        ${nota(`<b>With no pokémon able to fight when the team locks, every match of yours is a walkover
        loss.</b> Your team strip warns you beforehand, and counts how many were left out for being
        banned.`, 'aviso')}

        <h4>Seeds, bracket and format</h4>
        <ul>
          <li>Your <b>seed</b> is your position on the <a data-cap="pvp">Ranked PvP</a> ladder among the
          entrants: the highest is Seed 1. Players still in placement come after, by points. Until
          Wednesday at ${fecha} the seeds are provisional; at the lock they freeze.</li>
          <li>The format is the World's and the Amateur's: <b>double elimination</b> (lose in the
          winners' bracket and you drop to the losers'; lose there and you are out), a single-match
          <b>grand final</b>, and <b>3rd place</b> for whoever loses the losers' bracket final. If the
          entrants do not fill a full bracket, the best seeds get a bye (details in
          <a data-cap="campeonato">Championships</a>).</li>
          <li>The fight is the Ranked PvP one — automatic, same rules —, with every pokémon's level
          capped at ${cap}.</li>
          <li>In the <b>Bracket</b> tab, every played match has <b>▶ Watch</b>, for any player. Replays
          stay up until the next Showdown's bracket is published — the following Wednesday at ${fecha}:
          one week. After that, only the result remains.</li>
        </ul>

        <h4>The prize</h4>
        ${tabelaPremioShowdown(c)}
        <ul>
          <li><b>Only with ${min} or more participants who can fight.</b> That means entrants who made
          the bracket, reached the lock with <b>at least one pokémon able to fight</b> and are not
          banned. In a smaller edition the bracket runs all the same, but nobody gets diamonds.</li>
          <li><b>Whoever reaches the podium without playing a single real match — on walkovers only —
          gets nothing</b>, and the place does not pass to the next player. A banned account gets
          nothing either, and its place does not pass on: the prize follows the result everyone
          saw.</li>
          <li>The prize <b>lands on its own</b>. The podium is recorded right after the grand final: if
          you are online, the prize screen shows up on the server's next pass, which runs every ${seg}
          seconds; if you are away, at your <b>next login</b>. It never expires.</li>
          <li>These are <b>prize diamonds</b>: good in the Shop, but they <b>do not go to the Community
          Market</b> — only purchased diamonds count toward the selling quota. An edition pays at most
          ${teto} 💎, across the podium.</li>
          <li>No trophies: the Showdown puts no trophy on the pokémon's sheet and no medal on the
          profile. The <b>Prizes</b> tab keeps the <b>podium teams</b> — the species, the capped level
          and the potency of each pokémon they fought with —, and clicking one opens its <b>sheet</b>,
          with the stats it fought with.</li>
        </ul>`,
        es: `
        <p>El <b>Showdown</b> es el torneo <b>semanal</b> de la comunidad: <b>todos los miércoles</b>, con
        <b>tus pokémon de verdad</b> — el mismo equipo del Mundial y del Amateur, la misma pelea del
        <a data-cap="pvp">PvP Clasificatorio</a> —, pero sin lo que solo tienen los veteranos. Aquí gana
        quien <b>arma</b> mejor, no quien tiene el pokémon más raro. El premio es en <b>diamantes</b>.
        Para entrar: menú superior → <b>Torneo</b> → <b>Showdown</b> (la selección de torneos está en
        <a data-cap="campeonato">Campeonatos</a>).</p>

        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Cuándo</td><td>todos los miércoles, a las ${lutas}</td></tr>
           <tr><td>Inscripciones</td><td>toda la semana, hasta el miércoles a las ${fecha}</td></tr>
           <tr><td>El equipo se bloquea</td><td>el miércoles a las ${fecha}, junto con las inscripciones</td></tr>
           <tr><td>Rondas</td><td>${rodadaSd}</td></tr>
           <tr><td>Nivel de entrenador</td><td class="wk-num">${nv}</td></tr>
           <tr><td>Pokémon en el equipo</td><td class="wk-num">hasta ${max}</td></tr>
           <tr><td>Nivel del pokémon en la pelea</td><td class="wk-num destaque">hasta ${cap}</td></tr>
           <tr><td>No entran</td><td>shiny, P5, legendarios y míticos, variantes de Outland, pokémon con Z-Move o TM AoE</td></tr>
           <tr><td>Sí entran</td><td>megas (sin límite) y especies repetidas</td></tr>
           <tr><td>Premios</td><td class="wk-num">${p1} / ${p2} / ${p3} 💎</td></tr>`,
        )}
        <p>${hoje ? `<b>Hoy es noche de Showdown:</b> el #${numero(hoje)} pelea desde las ${lutas}, en
        vivo, en la pestaña Bracket. ` : ''}La próxima edición es el <b>Showdown #${numero(A)}</b>${A.numero === 1
          ? ', el primero' : ''}: peleas el miércoles <b>${dia(A.dia)}</b> a las ${lutas}, e inscripciones
        hasta las <b>${fecha}</b> del mismo día. Todos los horarios son de Brasilia.</p>

        <h4>Quién no entra — y por qué</h4>
        <ul>
          <li><b>Shiny</b> — ×${shiny} en todos los stats (ver <a data-cap="shiny">Shiny</a>). Es suerte
          de captura, y decidiría la pelea solo.</li>
          <li><b>P5</b> — la potencia máxima: ×${p5} en los stats (ver
          <a data-cap="potencia">Potencia</a>). Rara, y casi siempre de quien caza desde hace meses.</li>
          <li><b>Legendarios y míticos</b> — ×${MULT_LENDARIO_STATS} en todos los stats (ver
          <a data-cap="potencia">Potencia</a>): Mewtwo, Rayquaza, Arceus y compañía, de Kanto a Paldea. La
          lista es la misma de la <a data-cap="mistico">Arena Mística</a>, y el clon de Orre de un
          legendario también cuenta como legendario.</li>
          <li><b>Variantes de Outland</b> — el catálogo <b>#2001+</b>, exclusivo de las Outlands (Ancient
          Pupitar, Furious Magikarp…), de quien ya llegó allí.</li>
          <li><b>Con Z-Move</b> o <b>con TM AoE</b> instalado — la inversión de la caza avanzada (ver
          <a data-cap="tm">Discos TM</a>).</li>
        </ul>
        <p><b>Sí entran:</b> las <b>megas</b>, sin límite, y las <b>especies repetidas</b> — dos Garchomp
        en el mismo equipo, por ejemplo. Los prohibidos no salen de tu colección ni cambian en nada: solo
        se quedan fuera del Showdown.</p>
        ${nota(`<b>¿Por qué?</b> El Showdown es el torneo de la comunidad. Sacando de la mesa lo que solo
        juntaron los veteranos — la suerte de la captura, los meses de caza, los discos —, quien decide es
        el <b>armado</b>: qué pokémon, en qué orden, contra quién. Y la lista mueve la caza: cada semana
        vale la pena ir tras un pokémon fuerte que <b>quepa</b> en el Showdown.`, 'dica')}

        <h4>El nivel máximo: ${cap}</h4>
        <p>Es el único torneo con <b>tope de nivel</b>: el pokémon pelea con su nivel <b>hasta ${cap}</b>,
        y de ahí para arriba el nivel extra no ayuda. En el Mundial, el Amateur y el PvP Clasificatorio el
        nivel por encima de ${cheio} todavía cuenta, solo que comprimido por la regla de la arena (ver
        <a data-cap="ginasios">Gimnasios</a>):</p>
        ${tabelaTetoShowdown(c)}
        <p>Hasta ${cap}, los dos dan exactamente el mismo nivel — la diferencia es que aquí se detiene. Un
        Nv ${nv300} pelea como <b>${mundial300}</b> en el Mundial y como <b>${cap}</b> en el Showdown: un
        Nv ${cap} bien armado pelea de igual a igual con él. En la hoja del equipo, la tarjeta de quien
        pasa del tope muestra la cuenta — <b>Nv ${nv200} → pelea como ${sd200}</b>.</p>
        ${nota(`<b>Solo el nivel tiene tope.</b> IV, calidad, potencia (hasta P4) y refinado cuentan
        enteros — es ahí donde se separan dos pokémon Nv ${cap}.`)}

        <h4>La agenda de la semana</h4>
        <ul>
          <li><b>Toda la semana:</b> inscripciones abiertas. Abren el miércoles a las ${fecha}, en el
          instante en que cierra la edición anterior, y siguen hasta el miércoles siguiente a las
          ${fecha}. Hasta entonces puedes cancelar y volver a inscribirte, y cambiar el equipo cuantas
          veces quieras.</li>
          <li><b>Miércoles, ${fecha}:</b> cierran las inscripciones, las seeds se congelan, se <b>publica
          el cuadro</b> y el equipo se <b>bloquea</b> — todo en el mismo instante. No hay día de análisis
          como en el Mundial: nadie ajusta el equipo mirando el cuadro.</li>
          <li><b>Miércoles, ${lutas}:</b> la primera ronda, y de ahí <b>${rodadaSd}</b>, en vivo, hasta la
          gran final — en el Mundial y el Amateur es ${rodadaCamp}. Nadie necesita estar
          conectado.</li>
        </ul>
        <p>La noche es corta: cada ronda juega de una vez toda partida que ya tiene los dos lados, y el
        número de rondas crece despacio con el tamaño del cuadro.</p>
        ${tabelaDuracaoShowdown(c, A, hora)}

        <h4>Inscripción</h4>
        <ul>
          <li>En <b>Torneo → Showdown</b>, abre la edición y pulsa <b>Inscribirse</b>. Pide <b>nivel
          ${nv}</b> de entrenador. La confirmación repite las reglas y la agenda antes de que
          entres.</li>
          <li>Es gratis, y hasta el miércoles a las ${fecha} puedes <b>cancelar</b> y volver a
          inscribirte.</li>
          <li>La pestaña <b>Participantes</b> muestra a cada inscrito con su seed; al pulsar la tarjeta
          se abre el perfil.</li>
        </ul>

        <h4>Tu equipo</h4>
        <ul>
          <li>Hasta <b>${max} pokémon</b> tuyos, en el orden en que entran a la pelea. Después de
          inscribirte, <b>Seleccionar mi Equipo</b> abre tu colección — equipo y depot —, con búsqueda y
          filtros; los prohibidos quedan al final, apagados y con el motivo escrito (Shiny, P5,
          Legendario, Mítico, Outland, tiene Z-Move, tiene TM AoE). <b>Guardar equipo</b> lo graba.
          Los botones de <b>Formaciones</b> llenan la selección con una formación guardada del PvP, sin
          sus prohibidos.</li>
          <li>Si no eliges, vale tu <b>equipo del PvP Clasificatorio</b> — y sus prohibidos quedan fuera al
          bloquearse el equipo. <b>Usar mi equipo del PvP</b> borra la elección y vuelve a él.</li>
          <li>El equipo elegido es <b>solo del Showdown</b>: no cambia el del PvP ni el de un campeonato,
          y no aparece en el perfil de nadie.</li>
          <li><b>A las ${fecha} del miércoles el equipo se bloquea</b> y se vuelve un <b>retrato</b>: los
          números de cada pokémon en ese instante. Es el retrato el que pelea el cuadro entero — subir de
          nivel, vender o anunciar el pokémon después de eso no cambia nada. Vendido o anunciado en el
          Mercado <b>antes</b> del bloqueo, queda fuera.</li>
          <li>El Showdown <b>solo lee</b> tus pokémon: no salen de tu colección, no cambian, no ganan
          trofeo ni XP, y las partidas no cuentan en el marcador de las formaciones ni van al
          Tracker.</li>
          <li>Hasta el final de la noche de peleas (jueves, ${fim}), el equipo elegido queda
          <b>protegido del Autoseleccionar</b> de la <a data-cap="oferenda">Ofrenda</a>: el botón no lo
          pone en la ruleta.</li>
        </ul>
        ${nota(`<b>Sin ningún pokémon que pueda pelear al bloquearse el equipo, todas tus partidas se
        pierden por W.O.</b> La franja de tu equipo avisa antes, y cuenta cuántos quedaron fuera por estar
        prohibidos.`, 'aviso')}

        <h4>Seeds, cuadro y formato</h4>
        <ul>
          <li>La <b>seed</b> es tu posición en la Tabla del <a data-cap="pvp">PvP Clasificatorio</a> entre
          los inscritos: el más alto es la Seed 1. Quien sigue en la colocación va después, por los
          puntos. Hasta el miércoles a las ${fecha} las seeds son provisionales; al bloqueo se
          congelan.</li>
          <li>El formato es el del Mundial y el Amateur: <b>doble eliminación</b> (si pierdes en el cuadro
          de ganadores, bajas al de perdedores; si pierdes allí, quedas fuera), <b>gran final</b> a
          partida única y el <b>3.er puesto</b> para quien pierde la final del cuadro de perdedores. Si
          los inscritos no llenan un cuadro completo, las mejores seeds pasan directo (detalles en
          <a data-cap="campeonato">Campeonatos</a>).</li>
          <li>La pelea es la del PvP Clasificatorio — automática, mismas reglas —, con el nivel de cada
          pokémon en el tope de ${cap}.</li>
          <li>En la pestaña <b>Bracket</b>, toda partida jugada tiene <b>▶ Ver</b>, para cualquier
          jugador. Las grabaciones quedan hasta que se publica el cuadro del Showdown siguiente — el
          miércoles siguiente a las ${fecha}: una semana. Después, queda solo el resultado.</li>
        </ul>

        <h4>El premio</h4>
        ${tabelaPremioShowdown(c)}
        <ul>
          <li><b>Solo con ${min} o más participantes que pueden pelear.</b> Cuenta quien entró en el
          cuadro, llegó al bloqueo con <b>al menos un pokémon que puede pelear</b> y no tiene la cuenta
          baneada. En una edición con menos, el cuadro se juega igual, pero nadie se lleva
          diamantes.</li>
          <li><b>Quien llega al podio sin haber jugado ninguna partida de verdad — solo por W.O. — no
          recibe</b>, y el puesto no pasa al siguiente. Una cuenta baneada tampoco recibe, y su puesto
          tampoco pasa: el premio sigue el resultado que todos vieron.</li>
          <li>El premio <b>llega solo</b>. El podio se registra justo después de la gran final: si estás
          conectado, la pantalla de premio aparece en la próxima pasada del servidor, que corre cada
          ${seg} segundos; si no, en tu <b>próximo inicio de sesión</b>. No vence.</li>
          <li>Son <b>diamantes de premio</b>: valen en la Tienda, pero <b>no van al Mercado de la
          Comunidad</b> — solo los diamantes comprados entran en la cuota de venta. Una edición paga como
          máximo ${teto} 💎, sumando el podio.</li>
          <li>Sin trofeos: el Showdown no pone trofeo en la ficha del pokémon ni medalla en el perfil. La
          pestaña <b>Premios</b> guarda los <b>equipos del podio</b> — la especie, el nivel con tope y la
          potencia de cada pokémon con el que pelearon —, y un clic en uno abre su <b>ficha</b>, con los
          stats con los que peleó.</li>
        </ul>`,
      };
    },
  },

  // ------------------------------------------------------------ 14. ginásios
  {
    id: 'ginasios',
    titulo: { pt: 'Ginásios', en: 'Gyms', es: 'Gimnasios' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>São <b>${N(TIPOS_GINASIO.length, c.lang)} ginásios</b>, um para cada tipo elemental.
        Cada um tem um <b>pódio</b> disputado por todo o servidor: quem estiver em <b>1º</b> é o
        <b>líder</b> daquele tipo — e liderar paga <b>+${GINASIO_BUFF_PCT}% de dano</b>.</p>

        <h4>O time do ginásio</h4>
        <ul>
          <li>Até <b>${N(GINASIO_TIME_MAX, c.lang)} pokémon</b>, e <b>todos do tipo do ginásio</b>.
          Tipo duplo entra nos dois: um Charizard vale para <b>FIRE</b> e para <b>FLYING</b>.</li>
          <li><b>Sem espécies repetidas.</b> Cinco cópias do mesmo bicho bom não fazem um time —
          e o pódio é de quem montou um time, não de quem farmou uma espécie.</li>
          <li>Precisa de <b>nível ${N(GINASIO_NIVEL_MIN, c.lang)} de treinador</b> para registrar
          em qualquer ginásio.</li>
          <li>O time registrado <b>continua seu e continua jogável</b> — ele não sai da sua equipe
          nem fica preso em lugar nenhum.</li>
        </ul>

        ${nota(`<b>O nível conta inteiro até ${N(ARENA_NIVEL_CHEIO, c.lang)}, e comprimido daí
        para cima.</b> Não há teto: cada nível acima disso continua valendo, só que cada vez
        menos — nv 1.000 conta 352, nv 3.000 conta 578, nv 10.000 conta 993. Dobrar o nível
        rende sempre os mesmos <b>+37%</b>, em qualquer ponto da curva, então nenhum nível é
        desperdiçado. O nascimento e o refino voltam a decidir o pódio, e o grind continua
        pesando. (A <a data-cap="guild">Guerra de Guilds</a> comprime <b>mais</b> que o
        ginásio — são eventos diferentes.)`)}

        <h4>Montar o time</h4>
        <p>A página de um ginásio é um <b>duelo</b>: você à esquerda, o líder à direita. Embaixo do
        seu lado ficam as <b>${N(GINASIO_TIME_MAX, c.lang)} vagas</b> e os seus pokémon do tipo — toque num
        cartão para pô-lo no time, toque na vaga para tirá-lo.</p>
        <ul>
          <li><b>Melhor time</b> escolhe sozinho os mais fortes da lista, um por espécie. Com o filtro
          <b>Local</b> ligado, vale o melhor do que está à vista.</li>
          <li>Enquanto você mexe, a tela mostra a <b>força</b> do time escolhido, quanto ela ganha ou
          perde contra o time salvo e <b>em que lugar do pódio</b> ele cairia.</li>
          <li>Nada muda de verdade até <b>Salvar time</b>. Mexeu e quer lutar? <b>Salvar e desafiar</b>
          grava o time e já chama o líder — o duelo é sempre com o time salvo.</li>
          <li>Quem <b>lidera</b> e tira o time inteiro entrega o título: a tela pergunta antes.</li>
        </ul>

        <h4>Como a força é medida</h4>
        <p>Não é o <b>⚔ do Ranking</b>. Aquele número mede o quanto um espécime é <b>raro e bem
        investido</b>; o pódio precisa responder outra pergunta: <b>quem ganharia a luta</b>. A
        força de cada pokémon é o produto do <b>dano por segundo</b> pelo <b>HP efetivo</b> — que
        é o que decide um duelo de desgaste —, e o time vale a soma dos cinco.</p>

        <h4>Desafiar o líder</h4>
        <p>O desafio é um <b>duelo simulado</b>: o seu time contra o dele, um de cada vez, com a
        mesma engine da <a data-cap="guild">Guerra de Guilds</a>. Ganhou, o ginásio é seu. Você
        assiste tudo no <b>replay</b>, com os golpes, os números de dano e as trocas de pokémon.</p>
        <ul>
          <li><b>${N(HORAS_DESAFIO_GINASIO, c.lang)} horas de espera</b> entre dois desafios ao <b>mesmo</b> ginásio.
          Os 18 relógios são independentes — perder em FIRE não trava o seu desafio em WATER.</li>
          <li>O bônus de líder <b>não vale dentro do duelo</b>: o líder não defende o ginásio
          batendo 25% mais forte por já ser o líder.</li>
        </ul>

        <h4>O prêmio</h4>
        <p>Enquanto você for o líder, todo pokémon seu <b>daquele tipo</b> bate
        <b>+${GINASIO_BUFF_PCT}%</b> na <a data-cap="mapa">hunt</a> — inclui
        <b>boss</b>. Não vale no duelo do ginásio, na
        <a data-cap="pvp">PvP Ranqueado</a> nem na <a data-cap="guild">Guerra de Guilds</a>.</p>
        <ul>
          <li>Vale para o <b>pokémon inteiro</b>, não para o golpe: o Charizard de quem lidera
          FIRE bate mais forte com Flamethrower <b>e</b> com Investida.</li>
          <li><b>Não empilha.</b> Liderar FIRE e FLYING não dá 56% ao Charizard — dá os mesmos
          ${GINASIO_BUFF_PCT}%.</li>
        </ul>`,
      en: `
        <p>There are <b>${N(TIPOS_GINASIO.length, c.lang)} gyms</b>, one per elemental type. Each
        has a <b>leaderboard</b> the whole server competes for: whoever sits in <b>1st</b> is the
        <b>leader</b> of that type — and leading pays <b>+${GINASIO_BUFF_PCT}% damage</b>.</p>

        <h4>The gym team</h4>
        <ul>
          <li>Up to <b>${N(GINASIO_TIME_MAX, c.lang)} pokémon</b>, and <b>all of the gym's
          type</b>. Dual types count for both: a Charizard works for <b>FIRE</b> and
          <b>FLYING</b>.</li>
          <li><b>No repeated species.</b> Five copies of the same good pokémon are not a team —
          the podium is for who built a team, not who farmed one species.</li>
          <li>Requires <b>trainer level ${N(GINASIO_NIVEL_MIN, c.lang)}</b> to register in any
          gym.</li>
          <li>A registered team <b>stays yours and stays playable</b> — it does not leave your
          party or get locked away.</li>
        </ul>

        ${nota(`<b>Level counts in full up to ${N(ARENA_NIVEL_CHEIO, c.lang)}, and compressed
        above that.</b> There is no cap: every level above it still counts, just less and less —
        lv 1,000 counts as 352, lv 3,000 as 578, lv 10,000 as 993. Doubling your level always
        pays the same <b>+37%</b>, anywhere on the curve, so no level is ever wasted. Birth stats
        and refining decide the podium again, and grinding still weighs. (The
        <a data-cap="guild">Guild War</a> compresses <b>harder</b> than the gyms — they are
        different events.)`)}

        <h4>Building the team</h4>
        <p>A gym page is a <b>duel</b>: you on the left, the leader on the right. Under your side are
        the <b>${N(GINASIO_TIME_MAX, c.lang)} slots</b> and your pokémon of the type — tap a card to put it on
        the team, tap a slot to take it out.</p>
        <ul>
          <li><b>Best team</b> picks the strongest on the list for you, one per species. With the
          <b>Location</b> filter on, it takes the best of what is on screen.</li>
          <li>While you edit, the screen shows the picked team's <b>power</b>, how much it gains or
          loses against the saved team and <b>where on the podium</b> it would land.</li>
          <li>Nothing really changes until <b>Save team</b>. Changed it and want to fight? <b>Save and
          challenge</b> saves the team and calls the leader — the duel always uses the saved team.</li>
          <li>A <b>leader</b> who removes the whole team gives the title away: the screen asks first.</li>
        </ul>

        <h4>How strength is measured</h4>
        <p>It is not the <b>⚔ from the Rankings</b>. That number measures how <b>rare and well
        invested</b> a specimen is; the podium answers a different question: <b>who would win the
        fight</b>. Each pokémon's strength is its <b>damage per second</b> times its <b>effective
        HP</b> — which is what decides a war of attrition — and the team is worth the sum of the
        five.</p>

        <h4>Challenging the leader</h4>
        <p>The challenge is a <b>simulated duel</b>: your team against theirs, one at a time, on
        the same engine as the <a data-cap="guild">Guild War</a>. Win and the gym is yours. You
        watch the whole thing in the <b>replay</b>, with the moves, the damage numbers and the
        pokémon swaps.</p>
        <ul>
          <li><b>${N(HORAS_DESAFIO_GINASIO, c.lang)} hours of cooldown</b> between two challenges to the <b>same</b>
          gym. All 18 clocks are independent — losing in FIRE does not lock your WATER
          challenge.</li>
          <li>The leader bonus <b>does not apply inside the duel</b>: the leader does not defend
          the gym hitting 25% harder for already being the leader.</li>
        </ul>

        <h4>The prize</h4>
        <p>While you are the leader, every pokémon of yours <b>of that type</b> hits
        <b>+${GINASIO_BUFF_PCT}%</b> in the <a data-cap="mapa">hunt</a> — including
        <b>bosses</b>. It does not apply in the gym duel, the
        <a data-cap="pvp">Ranked PvP</a> or the <a data-cap="guild">Guild War</a>.</p>
        <ul>
          <li>It applies to the <b>whole pokémon</b>, not to the move: the Charizard of a FIRE
          leader hits harder with Flamethrower <b>and</b> with Tackle.</li>
          <li><b>It does not stack.</b> Leading FIRE and FLYING does not give Charizard 56% — it
          gives the same ${GINASIO_BUFF_PCT}%.</li>
        </ul>`,
      es: `
        <p>Son <b>${N(TIPOS_GINASIO.length, c.lang)} gimnasios</b>, uno por cada tipo elemental.
        Cada uno tiene un <b>podio</b> disputado por todo el servidor: quien esté en <b>1º</b> es
        el <b>líder</b> de ese tipo — y liderar paga <b>+${GINASIO_BUFF_PCT}% de daño</b>.</p>

        <h4>El equipo del gimnasio</h4>
        <ul>
          <li>Hasta <b>${N(GINASIO_TIME_MAX, c.lang)} pokémon</b>, y <b>todos del tipo del
          gimnasio</b>. El tipo doble entra en los dos: un Charizard vale para <b>FIRE</b> y para
          <b>FLYING</b>.</li>
          <li><b>Sin especies repetidas.</b> Cinco copias del mismo bicho bueno no son un equipo —
          y el podio es de quien armó un equipo, no de quien farmeó una especie.</li>
          <li>Necesita <b>nivel ${N(GINASIO_NIVEL_MIN, c.lang)} de entrenador</b> para registrar
          en cualquier gimnasio.</li>
          <li>El equipo registrado <b>sigue siendo tuyo y sigue jugable</b> — no sale de tu equipo
          ni queda encerrado en ningún lado.</li>
        </ul>

        ${nota(`<b>El nivel cuenta entero hasta ${N(ARENA_NIVEL_CHEIO, c.lang)}, y comprimido de
        ahí en adelante.</b> No hay techo: cada nivel por encima sigue valiendo, solo que cada vez
        menos — nv 1.000 cuenta 352, nv 3.000 cuenta 578, nv 10.000 cuenta 993. Duplicar el nivel
        rinde siempre el mismo <b>+37%</b>, en cualquier punto de la curva, así que ningún nivel
        se desperdicia. El nacimiento y el refinado vuelven a decidir el podio, y el grind sigue
        pesando. (La <a data-cap="guild">Guerra de Guilds</a> comprime <b>más</b> que el
        gimnasio — son eventos distintos.)`)}

        <h4>Armar el equipo</h4>
        <p>La página de un gimnasio es un <b>duelo</b>: tú a la izquierda, el líder a la derecha. Bajo
        tu lado están los <b>${N(GINASIO_TIME_MAX, c.lang)} espacios</b> y tus pokémon del tipo — toca una
        carta para ponerla en el equipo, toca el espacio para quitarla.</p>
        <ul>
          <li><b>Mejor equipo</b> elige solo los más fuertes de la lista, uno por especie. Con el filtro
          <b>Ubicación</b> activo, vale lo mejor de lo que está a la vista.</li>
          <li>Mientras editas, la pantalla muestra la <b>fuerza</b> del equipo elegido, cuánto gana o
          pierde frente al equipo guardado y <b>en qué puesto del podio</b> quedaría.</li>
          <li>Nada cambia de verdad hasta <b>Guardar equipo</b>. ¿Lo cambiaste y quieres pelear?
          <b>Guardar y desafiar</b> guarda el equipo y ya llama al líder — el duelo siempre es con el
          equipo guardado.</li>
          <li>Quien <b>lidera</b> y quita todo el equipo entrega el título: la pantalla pregunta antes.</li>
        </ul>

        <h4>Cómo se mide la fuerza</h4>
        <p>No es el <b>⚔ de la Clasificación</b>. Ese número mide cuán <b>raro y bien invertido</b>
        es un ejemplar; el podio responde otra pregunta: <b>quién ganaría la pelea</b>. La fuerza
        de cada pokémon es su <b>daño por segundo</b> por su <b>HP efectivo</b> — que es lo que
        decide un duelo de desgaste —, y el equipo vale la suma de los cinco.</p>

        <h4>Desafiar al líder</h4>
        <p>El desafío es un <b>duelo simulado</b>: tu equipo contra el suyo, uno a la vez, con el
        mismo motor de la <a data-cap="guild">Guerra de Guilds</a>. Si ganas, el gimnasio es tuyo.
        Lo ves todo en el <b>replay</b>, con los golpes, los números de daño y los cambios de
        pokémon.</p>
        <ul>
          <li><b>${N(HORAS_DESAFIO_GINASIO, c.lang)} horas de espera</b> entre dos desafíos al <b>mismo</b> gimnasio.
          Los 18 relojes son independientes — perder en FIRE no bloquea tu desafío en WATER.</li>
          <li>El bono de líder <b>no vale dentro del duelo</b>: el líder no defiende el gimnasio
          pegando 25% más fuerte por ya ser el líder.</li>
        </ul>

        <h4>El premio</h4>
        <p>Mientras seas el líder, todo pokémon tuyo <b>de ese tipo</b> pega
        <b>+${GINASIO_BUFF_PCT}%</b> en la <a data-cap="mapa">cacería</a> — incluye
        <b>bosses</b>. No vale en el duelo del gimnasio, en el
        <a data-cap="pvp">PvP Clasificatorio</a> ni en la <a data-cap="guild">Guerra de Guilds</a>.</p>
        <ul>
          <li>Vale para el <b>pokémon entero</b>, no para el golpe: el Charizard de quien lidera
          FIRE pega más fuerte con Flamethrower <b>y</b> con Placaje.</li>
          <li><b>No se acumula.</b> Liderar FIRE y FLYING no da 56% al Charizard — da los mismos
          ${GINASIO_BUFF_PCT}%.</li>
        </ul>`,
    }),
  },

  // ------------------------------------------------------------ 15. ranking
  {
    id: 'ranking',
    titulo: { pt: 'Ranking', en: 'Rankings', es: 'Clasificación' },
    grupo: 'mundo',
    html: (c) => ({
      pt: `
        <p>O placar do mundo inteiro, não do seu servidor. São oito placares, escolhidos no menu do alto da janela:</p>
        ${tabela(
          ['Placar', 'O que ordena'],
          `<tr><td>Top Treinadores</td><td>nível do treinador (desempate por XP); o card mostra o nível, e o XP exato aparece ao passar o mouse (no celular, tocando no número)</td></tr>
           <tr><td>Pokémon Forte</td><td>o <b>poder</b> de um pokémon, de qualquer treinador</td></tr>
           <tr><td>Top Catch</td><td><b>espécies diferentes</b> capturadas <b>com bola nesta semana</b>, não capturas totais; zera toda semana e paga diamante (ver abaixo)</td></tr>
           <tr><td>Top Coins</td><td>ouro acumulado na conta; o número vem curto (26,4B), e o exato aparece ao passar o mouse (no celular, tocando no número)</td></tr>
           <tr><td>PvP Ranqueado</td><td>o rank e o PR (ver <a data-cap="pvp">PvP Ranqueado</a>)</td></tr>
           <tr><td>Bosses</td><td>vitórias em boss: em <b>Todos</b> (o padrão da aba), a soma de todos os bosses; ou as de um boss só, escolhido no seletor</td></tr>
           <tr><td>Guild Diário</td><td>GP da guild, que dá o bônus de XP e loot (ver <a data-cap="guild">Guilds</a>)</td></tr>
           <tr><td>Guild Global</td><td>GP somado das guerras do mês, com prêmio em diamantes; zera todo mês</td></tr>`,
        )}
        <p>Clicar num nome abre o perfil público do treinador — stats, Pokédex, o rank do PvP
        Ranqueado e a equipe dele no PvP, sem dados de conta. O mesmo perfil abre pelo chat e pela
        lista de amigos.</p>
        <p>O prêmio e as regras de cada placar ficam numa caixa <b>recolhida</b> no alto, com o relógio da
        virada à vista: um toque em <b>Ver detalhes</b> abre a escada do prêmio, a nota e o atalho para onde
        aquele placar se joga.</p>

        <h4>Top Catch da semana</h4>
        <p>O Top Catch conta quantas <b>espécies diferentes</b> você capturou <b>com bola nesta
        semana</b>. Se nesta semana você capturou Pikachu, Rattata e Pidgey com bola, o seu Top Catch
        é <b>3</b>; outro Pikachu na mesma semana não muda nada, e uma espécie nova soma mais 1.</p>
        <ul>
          <li><b>Zera toda semana</b>, no mesmo instante da virada do <a data-cap="pvp">PvP
          Ranqueado</a>: <b>sábado, 23h59 (horário de Brasília)</b>. A semana vai de domingo a
          sábado.</li>
          <li><b>A sua Pokédex não zera.</b> Quem volta a 0 é só o placar. Por isso vale capturar de
          novo o que você já tem: na semana nova, a espécie conta outra vez.</li>
          <li><b>Conta:</b> a captura com bola na hunt (jogada por você ou pelas automações <b>Lançar até
          Capturar</b> e <b>Lançar sem Parar</b>) e na <a data-cap="mistico">Arena Mística</a>.</li>
          <li><b>Não conta:</b> evoluir com pedra (nem a Mega), chocar ovo na
          <a data-cap="chocadeira">Chocadeira</a> e comprar no <a data-cap="comunidade">Mercado</a>.</li>
        </ul>
        <p><b>Por que só a bola?</b> O Top Catch paga diamante. Se a evolução contasse, daria para
        subir no placar sem caçar: comprar pré-evoluções no Mercado e evoluir com pedra. Com a bola,
        cada espécie do placar é uma captura de verdade, na hunt.</p>
        ${nota(`<b>A semana de estreia.</b> Na primeira semana do Top Catch semanal, o placar ainda
        conta a sua <b>Pokédex inteira</b> — tudo que você já capturou, como era o Top Catch de antes —,
        para que quem liderava não perca o lugar no dia da troca. Da primeira virada em diante, o placar
        zera e passa a valer a regra da bola.`)}
        <p>Na virada, a <b>posição final</b> da semana paga diamante:</p>
        ${tabelaPremioTopCatch(c)}
        <ul>
          <li>O resultado sai uns <b>dois minutos depois da virada</b>. Quem está online recebe na hora,
          com a tela de prêmio; quem está fora recebe no <b>próximo login</b> — não precisa estar online
          na virada, e o prêmio não vence.</li>
          <li>Desempate: o <b>nível</b> do treinador; se empatar também, fica na frente a <b>conta mais
          antiga</b>.</li>
          <li>Conta banida não recebe, e a posição dela não passa para o seguinte. Quem terminou a
          semana com 0 espécies não recebe.</li>
          <li>O <b>1º da semana</b> usa o <b>selo da Poké Ball</b> ao lado do nick no chat. O selo é
          <b>ao vivo</b>: passa para quem ultrapassar (o jogo confere a cada 2 minutos).</li>
          <li>O diamante do prêmio é para usar na Loja: como os outros brindes, ele não vai para o
          Mercado da Comunidade. Uma semana paga no máximo ${N(TETO_DIAMANTES_TOP_CATCH, 'pt')} 💎,
          somando as ${N(PREMIADOS_TOP_CATCH, 'pt')} posições.</li>
        </ul>
        <p>O painel da semana — as suas espécies, o relógio até a virada, a sua posição e o pódio —
        fica na <a data-cap="pokedex">Pokédex</a>, no <b>Top Catch</b>; na aba Top Catch do Ranking, um
        botão leva direto para ele.</p>

        <h4>Prêmio do mês: Top Treinadores, Top Coins e Bosses</h4>
        <p>No dia 1º de cada mês, às <b>00:00 de Brasília</b> (o relógio da Temporada Global de guilds),
        quem estiver nesses três placares ganha diamante pela posição — no de Bosses, vale o
        <b>Todos</b>, a soma das vitórias em todos os bosses (o Top Catch tem prêmio próprio, toda
        semana — ver acima):</p>
        ${tabelaPremioMensal(c)}
        <ul>
          <li>Quem está em <b>1º</b> em cada placar usa um <b>selo ao lado do nick no chat</b>: o
          <b>Ash</b> (a primeira logo do jogo) no Top Treinadores, a <b>moeda</b> no Top Coins e a
          <b>coroa de boss</b> no Top Bosses — e a <b>Poké Ball</b> é do 1º do Top Catch <b>da
          semana</b>. O selo é <b>ao vivo</b>: passa para quem ultrapassar (o jogo confere a cada 2
          minutos).</li>
          <li>Vale a posição <b>na hora do fechamento</b>. Estes três placares não zeram — o jogo não zera
          nível, ouro nem vitórias —, então o prêmio é de quem segue no topo quando o mês vira.</li>
          <li>Os três mostram até o <b>${N(PREMIADOS_RANKING_MENSAL, 'pt')}º</b>. Conta banida no
          fechamento não recebe, e a posição dela não passa para o seguinte.</li>
          <li>O diamante do prêmio é para usar na Loja: como os outros brindes, ele não vai para o
          Mercado da Comunidade. No máximo ${N(TETO_DIAMANTES_MES, 'pt')} 💎 por mês, somando os três
          placares.</li>
        </ul>

        <h4>Pokémon Forte — como o ⚔ é calculado</h4>
        <p>Usa a <b>mesma força de nascimento</b> da calculadora (soma dos seis stats, normalizada),
        mas multiplica pelo <b>nível</b> do pokémon. Treinar sobe no placar; a nota da
        calculadora não. Detalhes em
        <a data-cap="nota">Nota, Poder e Calculadora</a>.</p>
        <pre class="wk-formula">score = mesma força da nota (0–1)
poder = arred( nível × 10 × score )</pre>
        <p>A exceção é o <a data-cap="lendarios">lendário e o mítico</a>: o ⚔ deles leva o
        <b>×${MULT_LENDARIO_STATS}</b> em todos os stats, que a nota não leva — por isso um lendário sobe no
        placar muito acima do que a nota escondida dele diria.</p>
        <p>O placar mostra essa fórmula numa caixa recolhida no alto — um toque abre.</p>
        <p><b>A coroa.</b> O 1º do Pokémon Forte leva a <b>coroa do Ranks</b> antes do nome — na placa em
        cima dele no campo (na hunt do dono), na Equipe e na ficha.
        É só a coroa, sem outro prêmio, e ela passa para quem ultrapassar em até 2 minutos.</p>

        ${nota(`O placar sai do banco, não da memória do jogo, e é uma foto renovada a cada 10 segundos: o
        que você vê pode estar até uns <b>15 segundos</b> atrasado. Para um ranking, é irrelevante.`)}`,
      en: `
        <p>The world-wide ladder, not your server's. There are eight boards, picked from the menu at the top of the window:</p>
        ${tabela(
          ['Board', 'What it sorts by'],
          `<tr><td>Top Trainers</td><td>trainer level (XP breaks ties); the card shows the level, and the exact XP shows up when you hover it (on a phone, tap the number)</td></tr>
           <tr><td>Strongest Pokémon</td><td>a pokémon's <b>power</b>, from any trainer</td></tr>
           <tr><td>Top Catch</td><td><b>distinct species</b> caught <b>with a ball this week</b>, not total catches; resets every week and pays diamonds (see below)</td></tr>
           <tr><td>Top Coins</td><td>gold held; the number is shortened (26.4B), and the exact amount shows up when you hover it (on a phone, tap the number)</td></tr>
           <tr><td>Ranked PvP</td><td>rank and PR (see <a data-cap="pvp">Ranked PvP</a>)</td></tr>
           <tr><td>Bosses</td><td>boss wins: in <b>All</b> (the tab's default), the sum over every boss; or the wins against one boss, picked in the selector</td></tr>
           <tr><td>Guild Daily</td><td>guild GP, which grants the XP and loot bonus (see <a data-cap="guild">Guilds</a>)</td></tr>
           <tr><td>Guild Global</td><td>GP added up from the month's wars, with a diamond prize; resets every month</td></tr>`,
        )}
        <p>Clicking a name opens that trainer's public profile — stats, Pokédex progress, their
        Ranked PvP rank and PvP team, without account details. The same profile opens from the
        chat and the friends list.</p>
        <p>Each board's prize and rules sit in a <b>collapsed</b> box at the top, with the reset clock in
        view: tapping <b>See details</b> opens the prize ladder, the note and the shortcut to where that
        board is played.</p>

        <h4>Weekly Top Catch</h4>
        <p>Top Catch counts how many <b>distinct species</b> you caught <b>with a ball this
        week</b>. If you caught Pikachu, Rattata and Pidgey with a ball this week, your Top Catch is
        <b>3</b>; another Pikachu in the same week changes nothing, and a new species adds 1 more.</p>
        <ul>
          <li><b>It resets every week</b>, at the same instant as the <a data-cap="pvp">Ranked PvP</a>
          reset: <b>Saturday, 11:59 PM (Brasília time)</b>. The week runs from Sunday to
          Saturday.</li>
          <li><b>Your Pokédex does not reset.</b> Only the ladder goes back to 0. That is why it pays to
          catch what you already have: in the new week, the species counts again.</li>
          <li><b>Counts:</b> catching with a ball in a hunt (thrown by you or by the <b>Throw until
          Catch</b> and <b>Throw Nonstop</b> automations) and in the <a data-cap="mistico">Mystic Arena</a>.</li>
          <li><b>Does not count:</b> evolving with a stone (Mega Evolution included), hatching an egg in
          the <a data-cap="chocadeira">Incubator</a> and buying on the
          <a data-cap="comunidade">Market</a>.</li>
        </ul>
        <p><b>Why only the ball?</b> Top Catch pays diamonds. If evolving counted, you could climb the
        ladder without hunting: buy pre-evolutions on the Market and evolve them with stones. With the
        ball, every species on the ladder is a real catch, in a hunt.</p>
        ${nota(`<b>Launch week.</b> In the first week of the weekly Top Catch, the ladder still counts
        your <b>whole Pokédex</b> — everything you have ever caught, like the old Top Catch —, so that
        whoever was leading does not lose their place on the changeover day. From the first reset on,
        the ladder goes back to 0 and the ball rule applies.`)}
        <p>At the reset, your <b>final place</b> for the week pays diamonds:</p>
        ${tabelaPremioTopCatch(c)}
        <ul>
          <li>The result comes out about <b>two minutes after the reset</b>. If you are online you get it
          right away, with the prize screen; if you are away, at your <b>next login</b> — you do not need to
          be online at the reset, and the prize never expires.</li>
          <li>Ties: the trainer's <b>level</b> breaks them; if that ties too, the <b>older account</b>
          goes first.</li>
          <li>A banned account gets nothing, and its place does not pass to the next player. Whoever
          finished the week with 0 species gets nothing.</li>
          <li>The <b>week's #1</b> wears the <b>Poké Ball badge</b> next to their name in chat. The badge
          is <b>live</b>: it moves to whoever overtakes them (the game checks every 2 minutes).</li>
          <li>The prize diamonds are for the Shop: like the other gifts, they cannot go to the Community
          Market. A week pays at most ${N(TETO_DIAMANTES_TOP_CATCH, 'en')} 💎 in total, across all
          ${N(PREMIADOS_TOP_CATCH, 'en')} places.</li>
        </ul>
        <p>The week's panel — your species, the clock to the reset, your place and the podium — is in
        the <a data-cap="pokedex">Pokédex</a>, under <b>Top Catch</b>; on the Rankings' Top Catch tab, a
        button takes you straight to it.</p>

        <h4>Monthly prize: Top Trainers, Top Coins and Bosses</h4>
        <p>On the 1st of every month, at <b>00:00 Brasília time</b> (the Global Guild Season clock),
        whoever is on these three ladders gets diamonds by place — for Bosses, the <b>All</b> ladder
        counts, the sum of wins over every boss (Top Catch has its own prize, every week — see
        above):</p>
        ${tabelaPremioMensal(c)}
        <ul>
          <li>Whoever is <b>#1</b> on each ladder wears a <b>badge next to their name in chat</b>:
          <b>Ash</b> (the game's first logo) for Top Trainers, the <b>coin</b> for Top Coins and the
          <b>boss crown</b> for Top Bosses — and the <b>Poké Ball</b> belongs to the #1 of <b>this
          week's</b> Top Catch. The badge is <b>live</b>: it moves to whoever overtakes them (the game
          checks every 2 minutes).</li>
          <li>What counts is your place <b>when it closes</b>. These three ladders do not reset — the game
          never resets levels, gold or wins —, so the prize goes to whoever is still on top when the
          month turns.</li>
          <li>All three show up to <b>#${N(PREMIADOS_RANKING_MENSAL, 'en')}</b>. A banned account gets
          nothing at the close, and its place does not pass to the next player.</li>
          <li>The prize diamonds are for the Shop: like the other gifts, they cannot go to the
          Community Market. At most ${N(TETO_DIAMANTES_MES, 'en')} 💎 per month across the three
          ladders.</li>
        </ul>

        <h4>Strongest Pokémon — how ⚔ is calculated</h4>
        <p>Uses the <b>same birth strength</b> as the calculator (sum of six stats, normalized),
        but multiplies by the pokémon's <b>level</b>. Training raises the ladder score; the
        calculator score does not. Full detail in
        <a data-cap="nota">Score, Power and Calculator</a>.</p>
        <pre class="wk-formula">score = same strength as the calculator (0–1)
power = round( level × 10 × score )</pre>
        <p>The exception is the <a data-cap="lendarios">legendary and the mythical</a>: their ⚔ carries the
        <b>×${MULT_LENDARIO_STATS}</b> on every stat, which the score does not — so a legendary climbs the
        ladder far above what its hidden score would say.</p>
        <p>The board shows this formula in a collapsed box at the top — tap to open it.</p>
        <p><b>The crown.</b> The #1 Strongest Pokémon wears the <b>Ranks crown</b> before its name — on
        the tag above it in the field (in its owner's hunt), in the
        Team and in its details sheet. It is just the crown, with no other prize, and it moves to whoever
        overtakes it within 2 minutes.</p>

        ${nota(`The ladder comes from the database, not from live memory, as a snapshot renewed every 10
        seconds: what you see may be up to about <b>15 seconds</b> behind. For a ranking, that is irrelevant.`)}`,
      es: `
        <p>La clasificación del mundo entero, no de tu servidor. Son ocho clasificaciones, elegidas en el menú de arriba de la ventana:</p>
        ${tabela(
          ['Clasificación', 'Qué ordena'],
          `<tr><td>Top Entrenadores</td><td>nivel del entrenador (desempata el XP); la tarjeta muestra el nivel, y el XP exacto aparece al pasar el ratón (en el móvil, tocando el número)</td></tr>
           <tr><td>Pokémon Fuerte</td><td>el <b>poder</b> de un pokémon, de cualquier entrenador</td></tr>
           <tr><td>Top Captura</td><td><b>especies distintas</b> capturadas <b>con bola esta semana</b>, no capturas totales; se reinicia cada semana y paga diamantes (ver abajo)</td></tr>
           <tr><td>Top Coins</td><td>oro acumulado; el número va abreviado (26,4B), y el exacto aparece al pasar el ratón (en el móvil, tocando el número)</td></tr>
           <tr><td>PvP Clasificatorio</td><td>el rango y los PR del PvP Clasificatorio (ver <a data-cap="pvp">PvP Clasificatorio</a>)</td></tr>
           <tr><td>Jefes</td><td>victorias contra jefes: en <b>Todos</b> (lo que abre la pestaña), la suma de todos los jefes; o las de un jefe solo, elegido en el selector</td></tr>
           <tr><td>Guild Diaria</td><td>GP de la guild, que da el bonus de XP y loot (ver <a data-cap="guild">Guilds</a>)</td></tr>
           <tr><td>Guild Global</td><td>GP sumado de las guerras del mes, con premio en diamantes; se reinicia cada mes</td></tr>`,
        )}
        <p>Hacer clic en un nombre abre el perfil público del entrenador — stats, progreso de
        Pokédex, el rango del PvP Clasificatorio y su equipo de PvP, sin datos de cuenta. El mismo
        perfil se abre desde el chat y la lista de amigos.</p>
        <p>El premio y las reglas de cada clasificación quedan en un recuadro <b>plegado</b> arriba, con el
        reloj del cierre a la vista: un toque en <b>Ver detalles</b> abre la escalera del premio, la nota y el
        atajo a donde se juega esa clasificación.</p>

        <h4>Top Captura de la semana</h4>
        <p>El Top Captura cuenta cuántas <b>especies distintas</b> capturaste <b>con bola esta
        semana</b>. Si esta semana capturaste con bola a Pikachu, Rattata y Pidgey, tu Top Captura es
        <b>3</b>; otro Pikachu en la misma semana no cambia nada, y una especie nueva suma 1 más.</p>
        <ul>
          <li><b>Se reinicia cada semana</b>, en el mismo instante del cambio del <a data-cap="pvp">PvP
          Clasificatorio</a>: <b>sábado, 23:59 (hora de Brasilia)</b>. La semana va de domingo a
          sábado.</li>
          <li><b>Tu Pokédex no se reinicia.</b> Solo la clasificación vuelve a 0. Por eso vale la pena
          capturar de nuevo lo que ya tienes: en la semana nueva, la especie cuenta otra vez.</li>
          <li><b>Cuenta:</b> la captura con bola en la cacería (lanzada por ti o por las automatizaciones
          <b>Lanzar hasta Capturar</b> y <b>Lanzar sin Parar</b>) y en la <a data-cap="mistico">Arena Mística</a>.</li>
          <li><b>No cuenta:</b> evolucionar con piedra (ni la Mega), eclosionar un huevo en la
          <a data-cap="chocadeira">Incubadora</a> ni comprar en el <a data-cap="comunidade">Mercado</a>.</li>
        </ul>
        <p><b>¿Por qué solo la bola?</b> El Top Captura paga diamantes. Si la evolución contara, se
        podría subir sin cazar: comprar preevoluciones en el Mercado y evolucionarlas con piedra. Con la
        bola, cada especie de la clasificación es una captura de verdad, en la cacería.</p>
        ${nota(`<b>La semana de estreno.</b> En la primera semana del Top Captura semanal, la
        clasificación todavía cuenta tu <b>Pokédex entera</b> — todo lo que ya capturaste, como el Top
        Captura de antes —, para que quien lideraba no pierda su puesto el día del cambio. Desde el
        primer cambio de semana, vuelve a 0 y vale la regla de la bola.`)}
        <p>En el cambio de semana, tu <b>puesto final</b> paga diamantes:</p>
        ${tabelaPremioTopCatch(c)}
        <ul>
          <li>El resultado sale unos <b>dos minutos después del cambio</b>. Si estás conectado lo recibes
          al momento, con la pantalla de premio; si no, en tu <b>próximo inicio de sesión</b> — no hace falta
          estar conectado en el cambio, y el premio no vence.</li>
          <li>Desempate: el <b>nivel</b> del entrenador; si también empata, va primero la <b>cuenta más
          antigua</b>.</li>
          <li>Una cuenta baneada no recibe, y su puesto no pasa al siguiente. Quien terminó la semana con
          0 especies no recibe.</li>
          <li>El <b>1º de la semana</b> lleva la <b>insignia de la Poké Ball</b> junto a su nombre en el
          chat. La insignia es <b>en vivo</b>: pasa a quien lo supere (el juego revisa cada 2
          minutos).</li>
          <li>Los diamantes del premio son para la Tienda: como los otros regalos, no van al Mercado de la
          Comunidad. Una semana paga como máximo ${N(TETO_DIAMANTES_TOP_CATCH, 'es')} 💎 en total,
          sumando los ${N(PREMIADOS_TOP_CATCH, 'es')} puestos.</li>
        </ul>
        <p>El panel de la semana — tus especies, el reloj hasta el cambio, tu puesto y el podio — está en
        la <a data-cap="pokedex">Pokédex</a>, en <b>Top Captura</b>; en la pestaña Top Captura de la
        Clasificación, un botón te lleva directo a él.</p>

        <h4>Premio del mes: Top Entrenadores, Top Coins y Jefes</h4>
        <p>El día 1 de cada mes, a las <b>00:00 de Brasilia</b> (el reloj de la Temporada Global de
        guilds), quien esté en estas tres clasificaciones gana diamantes según el puesto — en Jefes,
        cuenta <b>Todos</b>, la suma de las victorias contra todos los jefes (el Top Captura tiene premio
        propio, cada semana — ver arriba):</p>
        ${tabelaPremioMensal(c)}
        <ul>
          <li>Quien está <b>1º</b> en cada clasificación lleva una <b>insignia junto a su nombre en el
          chat</b>: <b>Ash</b> (el primer logo del juego) en Top Entrenadores, la <b>moneda</b> en Top
          Coins y la <b>corona de jefe</b> en Top Jefes — y la <b>Poké Ball</b> es del 1º del Top Captura
          <b>de la semana</b>. La insignia es <b>en vivo</b>: pasa a quien lo supere (el juego revisa cada
          2 minutos).</li>
          <li>Cuenta el puesto <b>a la hora del cierre</b>. Estas tres clasificaciones no se reinician — el
          juego nunca reinicia el nivel, el oro ni las victorias —, así que el premio es de quien sigue
          arriba cuando cambia el mes.</li>
          <li>Las tres muestran hasta el <b>${N(PREMIADOS_RANKING_MENSAL, 'es')}º</b>. Una cuenta baneada
          en el cierre no recibe, y su puesto no pasa al siguiente.</li>
          <li>Los diamantes del premio son para la Tienda: como los otros regalos, no van al Mercado de la
          Comunidad. Como máximo ${N(TETO_DIAMANTES_MES, 'es')} 💎 por mes, sumando las tres
          clasificaciones.</li>
        </ul>

        <h4>Pokémon Fuerte — cómo se calcula el ⚔</h4>
        <p>Usa la <b>misma fuerza al nacer</b> que la calculadora (suma de los seis stats,
        normalizada), pero multiplica por el <b>nivel</b> del pokémon. Entrenar sube en el placar;
        la nota de la calculadora no. Detalle en
        <a data-cap="nota">Nota, Poder y Calculadora</a>.</p>
        <pre class="wk-formula">score = misma fuerza que la nota (0–1)
poder = redond( nivel × 10 × score )</pre>
        <p>La excepción es el <a data-cap="lendarios">legendario y el mítico</a>: su ⚔ lleva el
        <b>×${MULT_LENDARIO_STATS}</b> en todos los stats, que la nota no lleva — por eso un legendario sube
        en el placar muy por encima de lo que diría su nota escondida.</p>
        <p>La clasificación muestra esta fórmula en un recuadro plegado arriba: un toque lo abre.</p>
        <p><b>La corona.</b> El 1º de Pokémon Fuerte lleva la <b>corona de Ranks</b> antes del nombre —
        en la placa encima de él en el campo (en la cacería de su dueño), en el Equipo y en la ficha. Es solo la corona, sin otro premio, y pasa a quien lo supere en
        hasta 2 minutos.</p>

        ${nota(`La clasificación sale de la base de datos, no de la memoria del juego, como una foto
        renovada cada 10 segundos: lo que ves puede estar hasta unos <b>15 segundos</b> atrasado. Para un
        ranking, es irrelevante.`)}`,
    }),
  },

  // ------------------------------------------------------------- 15. market
  {
    id: 'market',
    titulo: { pt: 'Market (o NPC)', en: 'Market (the NPC)', es: 'Market (el NPC)' },
    grupo: 'economia',
    html: (c) => ({
      pt: `
        <p>O balcão do jogo. Compra e venda com o <b>NPC</b>, em <b>ouro</b>, sem taxa nenhuma e
        em quantidade ilimitada. No alto, a chave <b>Comprar | Vender</b> troca a metade da tela.</p>

        <h4>Comprar</h4>
        <p>As categorias ficam numa barra à esquerda (no celular, numa fita no alto):</p>
        <ul>
          <li><b>Pokébolas</b> — as compráveis, aos preços da <a data-cap="captura">tabela</a>.</li>
          <li><b>Poções</b> e <b>Revives</b> — todas as variantes, ao preço de catálogo.</li>
          <li><b>Ovos</b> — os três Mystery Eggs da <a data-cap="chocadeira">Chocadeira</a>.</li>
        </ul>
        <p>Cada produto fica num <b>palanque</b>: o desenho na luz, quanto você já tem, o preço da
        unidade, o contador e os atalhos <b>×10</b>, <b>×100</b> e <b>Máx</b> (o máximo que o seu ouro
        paga, até 9.999 por compra). O botão <b>Comprar</b> já mostra o total. A luz sobe do produto
        mais simples para o melhor de cada categoria.</p>
        <p>O <b>Bronze Boss Token</b> (entrada de <a data-cap="bosses">boss</a>) <b>não</b> se
        compra aqui — é drop raro na Outland (${pctBossToken(c)} por kill) e prêmio do <a data-cap="passe">Passe de Batalha</a>.${dicaOutlandTiers(c, 'bosses')}</p>

        <h4>Vender</h4>
        <p>Do outro lado da chave, o NPC compra os <b>pokémon capturados</b> (a conta está logo
        abaixo). <b>Item não se vende ao NPC</b>: o loot saiu do jogo em 15/10/2026 — os pokémon
        soltam só as pedras de evolução dos tipos deles, e o que o loot rendia vem no ouro de cada
        abate, o <b>bônus de loot</b> (ver <a data-cap="combate">Combate</a>). O loot que estava na
        mochila de cada um virou Coins pelo preço do NPC, no primeiro login depois da mudança.</p>
        ${nota(`Pedra, Bronze Boss Token e o resto do que tem valor entre jogadores se vendem no
        <a data-cap="comunidade">Mercado da Comunidade</a>.`, 'aviso')}
        <p>Bola e poção sobrando na mochila? A <b>Lixeira</b>, na aba <b>Treinador</b> da Mochila, joga
        fora a quantidade que você escolher (ou <b>Tudo</b>). Ela só aceita bolas, poções e
        revives, e o que vai para ela <b>some para sempre</b> — não há como desfazer.</p>

        <h4>Venda de Pokémon</h4>
        <pre class="wk-formula">preço = valorBase × (1 + nível/50) × qualidade × (shiny ? 10 : 1)</pre>
        <ul>
          <li>O <b>valorBase</b> é o da espécie, do catálogo.</li>
          <li>Nível e qualidade valorizam; <b>shiny vale 10×</b>.</li>
          <li>Repare que a <b>potência não entra</b> nesta conta — o NPC não paga por ela. Um P4 ou
          P5 vale muito mais no <a data-cap="comunidade">Mercado da Comunidade</a>, com outro
          jogador.</li>
        </ul>
        <p>O <b>Ordenar por</b> da lista arruma por nível, qualidade, potência, nota da
        calculadora, <b>Maior IV Total</b> (a soma dos seis IVs), cada IV separado, tipo,
        <b>Nº da Pokédex</b> ou captura mais recente. A mesma lista serve à escolha da <a data-cap="oferenda">Oferenda</a>
        e ao anexo do chat.</p>
        <p>Não dá para vender quem está lutando, nem o último pokémon. "Vender todo o Depot" nunca
        toca em quem está na equipe. Com um filtro ligado (busca por nome ou apelido, tipo, shiny, ou o funil
        de potência, qualidade e IV mínimo de cada stat), o botão vira
        <b>Vender todo o Depot (Filtrado)</b> e vende só o que a lista está mostrando — a confirmação
        avisa quem não está na Coleção e seria perdido.</p>

        <h4>A Coleção</h4>
        <p>Os pokémon que você quer <b>guardar</b> vão para a <b>Coleção</b>: eles saem desta lista
        e do "vender todo o Depot", e o NPC não os compra.</p>
        <ul>
          <li>A <b>setinha</b> no canto do card manda o pokémon para a Coleção. No Depot (Centro
          de Cerulean), os guardados têm duas abas, <b>Depot</b> e <b>Coleção</b>, e a mesma
          setinha leva de uma para a outra. A Coleção também abre de qualquer lugar, na aba
          <b>Coleção</b> da Mochila.</li>
          <li>Mover não troca o pokémon de lugar nenhum: é uma marca. Ele continua valendo no
          <a data-cap="comunidade">Mercado da Comunidade</a>, na
          <a data-cap="oferenda">Oferenda</a> e nas equipes, com uma <b>★</b>. Nesses seletores, o
          filtro <b>Local</b> mostra só a Equipe, o Depot ou a Coleção.</li>
          <li>Cada pokémon espera alguns segundos antes de mudar de lado de novo.</li>
          <li><b>Auto Coleção</b> (o botão <b>★</b> ao lado do "vender todo"): um painel com seis
          regras — <b>Lendário/Mítico</b>, <b>Shiny</b>, Potência mínima, Qualidade mínima, IV mínimo e
          Nota mínima —, cada uma com um interruptor de liga/desliga. Cada regra ligada basta sozinha: o
          pokémon que passar em qualquer uma vai para a Coleção. Para todo jogador, <b>Lendário/Mítico</b>,
          <b>Shiny</b> e <b>Potência P4+</b> vêm ligados, e o resto desligado. Vale na captura, na compra
          no Mercado e, ao <b>Salvar</b> — depois de mostrar quantos são —, para quem você já tem. A
          trava só tranca: desligar uma regra não devolve ninguém ao Depot. Pokémon comprado no
          Mercado da Comunidade e pokémon refinado também chegam na Coleção.</li>
          <li><b>Pastas</b>: dentro da Coleção você cria até <b>${MAX_PASTAS} pastas</b>, com nome e
          ícone ("PvP", "GvG", "Torneio", "Evoluir para Mega"…) — a Coleção de sempre é a
          <b>Geral</b>, e a aba Coleção da Mochila mostra uma pasta de cada vez. No <b>⋮</b> da ficha de um
          pokémon seu, <b>Mover para</b> leva ele a uma pasta (do Depot, isso já o guarda na Coleção).
          É só organização: em qualquer pasta ele continua fora da venda ao NPC, e apagar uma pasta
          devolve os pokémon dela à Geral.</li>
        </ul>`,
      en: `
        <p>The game's counter. Buying and selling with the <b>NPC</b>, in <b>gold</b>, with no fee
        whatsoever and in unlimited quantity. At the top, the <b>Buy | Sell</b> switch flips the
        screen.</p>

        <h4>Buy</h4>
        <p>The categories sit on a bar on the left (on a phone, on a strip at the top):</p>
        <ul>
          <li><b>Poké Balls</b> — the purchasable ones, at the <a data-cap="captura">table</a>
          prices.</li>
          <li><b>Potions</b> and <b>Revives</b> — every variant, at catalogue price.</li>
          <li><b>Eggs</b> — the three Mystery Eggs for the <a data-cap="chocadeira">Incubator</a>.</li>
        </ul>
        <p>Every product stands on its own <b>stand</b>: the art in the spotlight, how many you
        already have, the unit price, the counter and the <b>×10</b>, <b>×100</b> and <b>Max</b>
        shortcuts (the most your gold pays for, up to 9,999 per purchase). The <b>Buy</b> button already
        shows the total. The light grows from the simplest product to the best one in each category.</p>
        <p>The <b>Bronze Boss Token</b> is <b>not</b> sold here — it is a rare Outland drop (${pctBossToken(c)} per kill) and a <a data-cap="passe">Battle Pass</a> prize.${dicaOutlandTiers(c, 'bosses')}</p>

        <h4>Sell</h4>
        <p>On the other side of the switch, the NPC buys your <b>caught pokémon</b> (the formula is
        right below). <b>Items are not sold to the NPC</b>: loot left the game on 10/15/2026 — pokémon
        drop only the evolution stones of their types, and what loot used to earn comes in the gold of
        every defeat, the <b>loot bonus</b> (see <a data-cap="combate">Combat</a>). The loot each player
        had in the backpack became Coins at the NPC price, on the first login after the change.</p>
        ${nota(`Stones, the Bronze Boss Token and everything else that players value are sold on the
        <a data-cap="comunidade">Community Market</a>.`, 'aviso')}
        <p>Too many balls and potions in the backpack? The <b>Trash</b>, on the Backpack's <b>Trainer</b> tab,
        throws away the amount you choose (or <b>All</b>). It only takes balls, potions and
        revives, and whatever goes in is <b>gone for good</b> — there is no undo.</p>

        <h4>Selling Pokémon</h4>
        <pre class="wk-formula">price = baseValue × (1 + level/50) × quality × (shiny ? 10 : 1)</pre>
        <ul>
          <li><b>baseValue</b> is the species', from the catalogue.</li>
          <li>Level and quality add value; <b>shiny is worth 10×</b>.</li>
          <li>Note that <b>potency does not enter</b> this formula — the NPC does not pay for it. A
          P4 or P5 is worth far more on the <a data-cap="comunidade">Community Market</a>, to
          another player.</li>
        </ul>
        <p>The list's <b>Sort by</b> orders by level, quality, potency, calculator score,
        <b>Highest Total IV</b> (the sum of the six IVs), each IV on its own, type, <b>Pokédex
        No.</b> or most recent catch. The same list powers the <a data-cap="oferenda">Offering</a> picker and the chat
        attachment.</p>
        <p>You cannot sell whoever is fighting, nor your last pokémon. "Sell the whole Depot" never
        touches anyone on the team. With a filter on (search by name or nickname, type, shiny, or the funnel
        of potency, quality and minimum IV per stat), the button becomes <b>Sell
        entire Depot (Filtered)</b> and sells only what the list is showing — the confirmation warns
        about anyone who is not in the Collection and would be lost.</p>

        <h4>The Collection</h4>
        <p>The pokémon you want to <b>keep</b> go to your <b>Collection</b>: they leave this list
        and "sell the whole Depot", and the NPC does not buy them.</p>
        <ul>
          <li>The <b>arrow</b> in the card's corner sends a pokémon to the Collection. In the
          Depot (Cerulean Center), stored pokémon have two tabs, <b>Depot</b> and
          <b>Collection</b>, and the same arrow moves them across. The Collection also opens from
          anywhere, in the Backpack's <b>Collection</b> tab.</li>
          <li>Moving does not take the pokémon anywhere: it is a mark. It still counts on the
          <a data-cap="comunidade">Community Market</a>, in the
          <a data-cap="oferenda">Offering</a> and on your teams, with a <b>★</b>. In those pickers
          the <b>Location</b> filter shows only the Team, the Depot or the Collection.</li>
          <li>Each pokémon waits a few seconds before it can switch sides again.</li>
          <li><b>Auto Collection</b> (the <b>★</b> button next to "sell all"): a panel with six
          rules — <b>Legendary/Mythical</b>, <b>Shiny</b>, Minimum potency, Minimum quality, Minimum IV
          and Minimum score —, each with an on/off switch. Each rule that is on is enough by itself:
          a pokémon that passes any of them goes to the Collection. For every player,
          <b>Legendary/Mythical</b>, <b>Shiny</b> and <b>Potency P4+</b> come on, and the rest off. It
          applies when catching, when buying on the Market and, when you <b>Save</b> — after showing
          how many —, to the ones you already have. The lock only locks: turning a rule off sends no
          one back to the Depot. Pokémon bought on the Community Market and refined pokémon also land
          in the Collection.</li>
          <li><b>Folders</b>: inside the Collection you can create up to <b>${MAX_PASTAS} folders</b>,
          with a name and an icon ("PvP", "GvG", "Tournament", "Mega evolve"…) — the usual
          Collection is <b>General</b>, and the Backpack's Collection tab shows one folder at a time. In the
          <b>⋮</b> of your pokémon's sheet, <b>Move to</b> puts it in a folder (from the Depot, that also
          keeps it in the Collection). It is just organizing: in any folder it stays out of NPC sales,
          and deleting a folder sends its pokémon back to General.</li>
        </ul>`,
      es: `
        <p>El mostrador del juego. Compra y venta con el <b>NPC</b>, en <b>oro</b>, sin comisión
        alguna y en cantidad ilimitada. Arriba, el interruptor <b>Comprar | Vender</b> cambia la mitad
        de la pantalla.</p>

        <h4>Comprar</h4>
        <p>Las categorías están en una barra a la izquierda (en el móvil, en una cinta arriba):</p>
        <ul>
          <li><b>Poké Balls</b> — las comprables, a los precios de la
          <a data-cap="captura">tabla</a>.</li>
          <li><b>Pociones</b> y <b>Revivires</b> — todas las variantes, a precio de catálogo.</li>
          <li><b>Huevos</b> — los tres Mystery Eggs de la <a data-cap="chocadeira">Incubadora</a>.</li>
        </ul>
        <p>Cada producto está en su <b>pedestal</b>: el dibujo bajo la luz, cuántos ya tienes, el
        precio por unidad, el contador y los atajos <b>×10</b>, <b>×100</b> y <b>Máx</b> (lo máximo que
        tu oro paga, hasta 9.999 por compra). El botón <b>Comprar</b> ya muestra el total. La luz sube
        del producto más simple al mejor de cada categoría.</p>
        <p>El <b>Bronze Boss Token</b> <b>no</b> se compra aquí — es drop raro en Outland (${pctBossToken(c)} por kill) y premio del <a data-cap="passe">Pase de Batalla</a>.${dicaOutlandTiers(c, 'bosses')}</p>

        <h4>Vender</h4>
        <p>Del otro lado del interruptor, el NPC compra los <b>pokémon capturados</b> (la cuenta está
        justo abajo). <b>Los objetos no se venden al NPC</b>: el loot salió del juego el 15/10/2026 —
        los pokémon sueltan solo las piedras evolutivas de sus tipos, y lo que el loot rendía viene en
        el oro de cada derrota, el <b>bono de loot</b> (ver <a data-cap="combate">Combate</a>). El loot
        que cada uno tenía en la mochila se convirtió en Coins al precio del NPC, en el primer inicio de
        sesión después del cambio.</p>
        ${nota(`Las piedras, el Bronze Boss Token y todo lo que vale entre jugadores se venden en el
        <a data-cap="comunidade">Mercado de la Comunidad</a>.`, 'aviso')}
        <p>¿Te sobran balls y pociones en la mochila? La <b>Papelera</b>, en la pestaña
        <b>Entrenador</b> de la Mochila, tira la cantidad que elijas (o <b>Todo</b>). Solo acepta
        balls, pociones y revivires, y lo que va a ella <b>desaparece para siempre</b> — no se
        puede deshacer.</p>

        <h4>Venta de Pokémon</h4>
        <pre class="wk-formula">precio = valorBase × (1 + nivel/50) × calidad × (shiny ? 10 : 1)</pre>
        <ul>
          <li>El <b>valorBase</b> es el de la especie, del catálogo.</li>
          <li>Nivel y calidad revalorizan; <b>shiny vale 10×</b>.</li>
          <li>Fíjate en que la <b>potencia no entra</b> en esta cuenta — el NPC no la paga. Un P4 o
          P5 vale mucho más en el <a data-cap="comunidade">Mercado de la Comunidad</a>, con otro
          jugador.</li>
        </ul>
        <p>El <b>Ordenar por</b> de la lista ordena por nivel, calidad, potencia, nota de la
        calculadora, <b>Mayor IV Total</b> (la suma de los seis IV), cada IV por separado, tipo,
        <b>N.º de Pokédex</b> o captura más reciente. La misma lista sirve a la selección de la
        <a data-cap="oferenda">Ofrenda</a> y al adjunto del chat.</p>
        <p>No se puede vender a quien está peleando ni al último pokémon. "Vender todo el Depot"
        nunca toca a los del equipo. Con un filtro activo (búsqueda por nombre o apodo, tipo, shiny, o el
        embudo de potencia, calidad e IV mínimo de cada stat), el botón pasa a ser
        <b>Vender todo el Depósito (Filtrado)</b> y vende solo lo que muestra la lista — la
        confirmación avisa de quien no está en la Colección y se perdería.</p>

        <h4>La Colección</h4>
        <p>Los pokémon que quieres <b>guardar</b> van a la <b>Colección</b>: salen de esta lista y
        de "vender todo el Depot", y el NPC no los compra.</p>
        <ul>
          <li>La <b>flechita</b> en la esquina de la tarjeta envía el pokémon a la Colección. En el
          Depósito (Centro de Cerulean), los guardados tienen dos pestañas, <b>Depósito</b> y
          <b>Colección</b>, y la misma flechita los pasa de una a otra. La Colección también se
          abre desde cualquier lugar, en la pestaña <b>Colección</b> de la Mochila.</li>
          <li>Mover no cambia el pokémon de lugar: es una marca. Sigue valiendo en el
          <a data-cap="comunidade">Mercado de la Comunidad</a>, en la
          <a data-cap="oferenda">Ofrenda</a> y en los equipos, con una <b>★</b>. En esos
          selectores, el filtro <b>Ubicación</b> muestra solo el Equipo, el Depósito o la
          Colección.</li>
          <li>Cada pokémon espera unos segundos antes de cambiar de lado otra vez.</li>
          <li><b>Auto Colección</b> (el botón <b>★</b> junto a "vender todo"): un panel con seis
          reglas — <b>Legendario/Mítico</b>, <b>Shiny</b>, Potencia mínima, Calidad mínima, IV mínimo y
          Nota mínima —, cada una con un interruptor de encendido/apagado. Cada regla encendida basta
          sola: el pokémon que pase cualquiera de ellas va a la Colección. Para todo jugador,
          <b>Legendario/Mítico</b>, <b>Shiny</b> y <b>Potencia P4+</b> vienen encendidas, y el resto
          apagado. Vale al capturar, al comprar en el Mercado y, al <b>Guardar</b> — después de mostrar
          cuántos son —, para los que ya tienes. El bloqueo solo bloquea: apagar una regla no devuelve a
          nadie al Depósito. Los pokémon comprados en el Mercado de la Comunidad y los refinados también
          llegan a la Colección.</li>
          <li><b>Carpetas</b>: dentro de la Colección creas hasta <b>${MAX_PASTAS} carpetas</b>, con
          nombre e ícono ("PvP", "GvG", "Torneo", "Evolucionar a Mega"…) — la Colección de siempre
          es la <b>General</b>, y la pestaña Colección de la Mochila muestra una carpeta a la vez. En el
          <b>⋮</b> de la ficha de un pokémon tuyo, <b>Mover a</b> lo lleva a una carpeta (desde el
          Depósito, eso ya lo guarda en la Colección). Es solo organización: en cualquier carpeta sigue
          fuera de la venta al NPC, y borrar una carpeta devuelve sus pokémon a General.</li>
        </ul>`,
    }),
  },

  // --------------------------------------------------------- 16. comunidade
  {
    id: 'comunidade',
    titulo: { pt: 'Mercado da Comunidade', en: 'Community Market', es: 'Mercado de la Comunidad' },
    grupo: 'economia',
    html: (c) => {
      const e = c.d.economia ?? {};
      const m = c.d.mercado ?? {};
      return {
        pt: `
        <p>Aqui quem está do outro lado do balcão é <b>outro jogador</b>. Você anuncia pokémon,
        itens e <b>diamantes comprados</b>, e cobra em <b>Ouro</b> ou em <b>Gema</b> — a moeda com
        lastro em USDT (ver <a data-cap="gemas">Gemas</a>).</p>

        <h4>Anunciar</h4>
        <ul>
          <li>Anunciar <b>tira da sua mão</b>: o item sai da mochila e o pokémon sai do depot na
          hora. Cancelar devolve.</li>
          <li>Você pode ter até <b>${e.maxAnuncios ?? 20} anúncios abertos</b> ao mesmo tempo.</li>
          <li><b>Um anúncio por item</b>: enquanto o seu Water Stone estiver na vitrine, não dá
          para abrir um segundo por outro preço — mude o preço do que já está lá. Quando ele
          sair (vendido ou cancelado), são <b>${m.reanuncioMin ?? 30} minutos</b> até você poder
          anunciar o mesmo item de novo. É o que impede uma escada de "o mesmo item por um Coin
          a menos" tomar a lista inteira.</li>
          <li><b>Só entra item com valor de troca</b>: <b>pedras de evolução</b> (as
          <b>Shiny Stones</b> inclusive), <b>discos e peças de TM</b>, o <b>Bronze Boss Token</b>,
          o <b>Mystic Ticket</b> e o <b>Safari Ticket</b> (aba <b>Tickets</b>), as <b>Mega Stones</b>, os
          <b>fragmentos</b> (de Chave, de Shiny Stone, de Bicicleta, de Mega, de Mega Shiny e de Ovo Shiny),
          o <b>Ovo Shiny</b>, <b>casas</b>,
          <b>bicicletas</b> e as <b>Caixas de Fundador</b>. Drop de pokémon (Bug Wing, Fur,
          Fossil…) não vai à vitrine — eram centenas de itens de mil moedas enterrando o que a
          pessoa foi procurar.</li>
          <li><b>Das coisas de diamante, só as skins e as Caixas de Fundador</b>: a <b>Beast Ball</b>
          e o resto da Loja VIP não vão à vitrine. O que se negocia é o próprio <b>diamante</b>,
          que compra tudo isso na Loja.</li>
          <li><b>Pokémon precisa passar na faixa mínima</b>: <b>nível ${m.pokemonMin?.level ?? 50}+</b> e
          <b>nota ${D(m.pokemonMin?.nota ?? 3.5, 'pt')}+</b> na calculadora (força de nascimento — IV,
          qualidade, potência e shiny). <b>Shiny, P5 e lendário</b> entram em qualquer nível/nota.</li>
          <li><b>Pokémon Shiny só se vende por Gemas</b>: no anúncio de um shiny o
          botão <b>Coins</b> fica travado, e a edição não troca a moeda de Gemas para Coins. Anúncio de
          shiny em Coins que já estava aberto foi encerrado, e o pokémon voltou para a <b>Coleção</b> do
          dono — é só anunciar de novo, em Gemas.</li>
          <li>O preço é <b>por unidade</b>. Um lote de 100 Water Stone pode ser comprado em
          fatias.</li>
        </ul>

        <h4>Comprar</h4>
        <p>Todo pokémon comprado aqui <b>chega na sua Coleção</b>, fora da venda ao NPC, para ele
        não ir embora num "vender todo o depot" do <a data-cap="market">Market</a>. Devolva ao
        Depot se quiser mesmo revendê-lo ao NPC.</p>
        <ul>
          <li><b>Itens</b> e <b>Diamantes</b> não têm <b>Ordenar por</b>: quem vende aparece sempre do
          <b>menor preço</b> para o maior e, no mesmo preço, quem anunciou <b>antes</b> vem primeiro — a
          fila é de quem chegou primeiro. Só a aba de <b>Pokémon</b> escolhe a ordem (Adicionados
          recentemente, Menor preço, Maior preço), porque ali se escolhe um exemplar.</li>
          <li>A <b>★</b> no card de um pokémon à venda guarda o anúncio na aba <b>Favoritos</b>. Se
          alguém comprar ou o vendedor retirar, o card continua lá por alguns dias, apagado e com o
          aviso, até você limpar.</li>
          <li>A <b>Tabela de preços</b> (a prancheta) mostra as vendas recentes de todo mundo e filtra
          por tipo, por moeda (Coins ou Gemas) e por item — os Diamantes inclusive. Na aba
          <b>Pokémon</b> ela busca pelo nome, filtra por <b>tipagem</b>, <b>Só shiny</b> e <b>Apenas
          P5</b>, e ordena por valor, nota, IV, qualidade, potência ou nível — sempre dentro das vendas
          dos <b>últimos ${JANELA_PRECOS_POKEMON_DIAS} dias</b>. O botão <b>Exportar planilha</b>, no canto de
          cima da tabela, baixa o que está na tela — com os mesmos filtros — como um arquivo
          <b>.csv</b>: um download por hora por conexão de internet.</li>
          <li>O seu <b>Histórico de vendas</b> e o <b>de compras</b> mostram os selos <b>P·IV·Q·N</b> de
          cada pokémon, e clicar na linha abre a ficha dele.</li>
          <li>O filtro <b>Omitir Pokémon de Outland</b> (grupo <b>Espécie</b>) tira da vitrine as
          variantes #2001+: buscar "pupitar" passa a trazer só o Pupitar, sem o Ancient Pupitar.</li>
          <li>No grupo <b>Raridade</b>, <b>Mega Evolução</b> deixa na vitrine só os pokémon já na forma
          Mega (#${MEGA_POKE_BASE + 1} em diante) e <b>Lendários</b> só os lendários e míticos — os do
          ×${MULT_LENDARIO_STATS} nos stats, inclusive Ultra Beasts e as cópias de Orre. Os dois valem
          para a grade de espécies e para a lista de ofertas.</li>
          <li>O card de um pokémon à venda mostra <b>quantas pessoas favoritaram</b> o anúncio — e no
          seu anúncio, quantas favoritaram o seu.</li>
          <li><b>Enviar DM</b> abre uma conversa com o vendedor, presa àquele anúncio, para combinar
          antes de comprar (ver <a data-cap="chat">Comércio</a>).</li>
        </ul>

        <h4>A vitrine de pokémon</h4>
        <p>A aba de pokémon abre como uma <b>grade de espécies</b>: um card por espécie, com quantas
        ofertas ela tem e se há shiny ou TM à venda entre elas. O clique abre as ofertas daquela
        espécie, nas duas moedas juntas. Quem prefere varrer a feira inteira atrás de pechincha
        desliga <b>Agregar espécies</b> (no grupo <b>Espécie</b>) e tem de volta a lista de anúncios,
        um card por pokémon.</p>

        <h4>Anunciar com referência</h4>
        <p>Ao pôr preço, dois atalhos preenchem o campo: <b>Menor anúncio</b> (o mais barato à venda
        agora) e <b>Média vendida</b> (o preço médio vendido nos últimos 7 dias, com quantas unidades).
        A confirmação mostra o recibo — a comissão e o que cai para você —, e os cards usam o preço
        curto (20M, 1,5B).</p>
        <p>O botão <b>📢 Anunciar no chat global</b> manda o anúncio para os chats Mundo e Comércio
        (custa ${N(CUSTO_ALTO_FALANTE, 'pt')} Coins; ver <a data-cap="chat">Chat</a>).</p>
        ${nota(`O pokémon vai para o comprador com o que é <b>dele</b>: o <b>apelido</b> da Name Tag, a
        <b>Medalha de Guerra</b>, o <b>Troféu</b> de campeonato e o nome de <b>quem capturou</b>. A
        <b>skin</b>, não: ela é do dono, e volta a ficar livre na mochila de quem vendeu.`)}

        <h4>Filtros de pokémon</h4>
        <p>Na aba de pokémon, além do tipo, dos selos e do <b>Filtrar por</b>, o grupo
        <b>Faixas</b> tem "mín" e "máx" para <b>nível, potência, IV total, qualidade e nota</b>.
        Dá para pedir "nota de 3,8 a 4,1", "IV acima de 166" ou "potência de P3 para cima", e
        combinar tudo. Qualidade e nota aceitam vírgula, e uma faixa digitada ao contrário vale
        como a mesma faixa.</p>

        <h4>Retenção e sorteio</h4>
        <p>O anúncio aparece na hora para todo mundo, mas só pode ser comprado depois de
        <b>${m.cooldownCompraMin ?? 2} minutos</b> de retenção. O selo <b>Retido</b> conta o tempo
        ao vivo, pelo relógio do servidor.</p>
        <ul>
          <li>Somar unidades a um anúncio que já está à venda <b>reinicia</b> a retenção. Editar o
          preço só é possível depois que ela acaba, e também a reinicia. Cancelar vale a qualquer
          momento.</li>
          <li><b>Sorteio na liberação:</b> todo pedido de compra que chega nos primeiros
          <b>${SEG_SORTEIO} segundos</b> depois de o anúncio liberar entra num sorteio com a mesma
          chance. Pedir no primeiro milissegundo não vale mais que pedir no fim da janela. Quem
          pede depois do sorteio compra na hora, como sempre.</li>
          <li><b>Um pedido por jogador em cada anúncio</b>: clicar várias vezes não dá mais
          chances. Quem perde o sorteio recebe o aviso e não paga nada.</li>
          <li><b>A janela do sorteio:</b> assim que o seu pedido entra, abre uma janelinha com
          <b>quantos jogadores</b> estão na disputa e <b>quem são</b> (até 100 nicks; numa disputa
          maior, o resto aparece como “+N”, e quem levou aparece sempre), o relógio dos
          ${SEG_SORTEIO} segundos, o sorteio e <b>quem levou</b>.
          Nada disso fica guardado: a lista existe só durante o sorteio, e não vai para a Tabela de
          preços.</li>
        </ul>

        <h4>Comprar em quantidade</h4>
        <p>No painel de um item — e na aba de diamantes —, o botão <b>Comprar em quantidade</b> pede
        só o número: o jogo junta os anúncios <b>mais baratos</b>, cada um pelo <b>preço dele</b>, e
        mostra o total antes de comprar (2 a 1kk e 4 a 1,2kk dão 6 por 6,8kk), com a escada de preços
        e a lista de quem vende.</p>
        <ul>
          <li>Ficam de fora os seus anúncios, os que ainda estão em <b>retenção</b> e os que estão no
          <b>sorteio</b> da liberação: ela só leva o que um clique compraria na hora.</li>
          <li>O que a tela mostra é o teto: nenhuma unidade acima do <b>maior preço</b> da cotação, e
          nunca mais que o <b>total</b>. Se um anúncio sair antes, o próximo mais barato dentro desses
          dois limites completa; se não houver, a compra leva menos e diz quanto levou.</li>
          <li>Uma compra atravessa até <b>${N(MAX_ANUNCIOS_LOTE, 'pt')} anúncios</b>. Pokémon e as
          peças numeradas (Caixas, Casas e Bicicletas) não entram.</li>
        </ul>

        <h4>Vender diamantes</h4>
        <p>A terceira aba do mercado vende <b>diamante</b> — a moeda que se compra com dinheiro de
        verdade. É o caminho para quem tem diamante e quer Coins ou Gemas, e para quem tem Coins e
        quer diamante sem passar pelo cartão.</p>
        ${nota(`<b>APENAS DIAMANTES COMPRADOS podem ser vendidos</b> — os que você pagou com PIX ou
        cartão. Os de <b>comissão de indicação</b> (desde 03/10/2026), os de <b>voto no
        TopIdle</b>, dos <b>convites do Discord</b> e da <b>Tag IDLE</b>, do <b>pódio de guilds</b>
        ou de um <b>ajuste da administração</b> ficam de
        fora — eles existem para gastar na Loja, e deixá-los virar Coin transformaria um prêmio
        numa torneira de economia. A tela de anunciar mostra quantos você pode vender antes de
        pedir o preço.`, 'atencao')}
        <ul>
          <li>O preço é <b>por diamante</b>; o comprador pode levar uma <b>fatia</b> do lote.</li>
          <li>Anunciar <b>tira do seu saldo</b> na hora, como o item sai da mochila. Cancelar
          devolve o que ainda restava no anúncio.</li>
          <li><b>Um anúncio de diamante por vez</b>, com os mesmos
          ${m.reanuncioMin ?? 30} minutos de espera entre um e o próximo. Para vender mais barato,
          edite o preço do que já está de pé.</li>
          <li>Diamante <b>comprado de outro jogador</b> não pode ser revendido: quem o recebeu não
          pagou por ele em dinheiro nenhum, e revender abriria um ciclo sem lastro.</li>
          <li>A comissão da tabela abaixo vale igual, e sai do vendedor.</li>
        </ul>

        <h4>A pensão da feira</h4>
        <p>Pokémon anunciado não fica numa prateleira: fica na <b>feira</b>, e os tratadores de lá
        cuidam dele até alguém levar. Por isso <b>só pokémon</b> paga diária —
        <b>${(m.taxaDiaria ?? 100000).toLocaleString('pt-BR')} Coins por dia</b>, de
        ${m.diasMin ?? 1} a ${m.diasMax ?? 30} dias, escolhidos na hora de publicar e pagos à vista.</p>
        <ul>
          <li><b>Item não paga nada</b> e não tem prazo: prateleira não come.</li>
          <li>Vendeu antes do fim? Os dias já pagos <b>não voltam</b> — os tratadores cuidaram dos
          dias que cuidaram.</li>
          <li>Ninguém levou? No fim do prazo o pokémon <b>volta para o seu Depot</b> sozinho —
          na hora, mesmo com o jogo aberto, e com um aviso na tela dizendo o que voltou.</li>
          <li>Quer mais tempo? Em <b>Editar</b>, o <b>Aumentar a estadia</b> soma dias ao mesmo
          anúncio, pagos à vista na mesma diária — até ${m.diasMax ?? 30} dias à frente. O preço, a
          retenção, as estrelas dos Favoritos e as conversas do Comércio continuam como estavam.</li>
        </ul>

        <h4>A comissão</h4>
        ${tabela(
          [c.r.regra, c.r.taxa],
          `<tr><td>Anúncio cobrado em <b>Ouro</b></td><td class="wk-num destaque">${e.taxaMercadoGoldPct ?? 15}%</td></tr>
           <tr><td>Item ou diamante em <b>Gema</b></td><td class="wk-num destaque">${pctTx(TAXA_ORB_PLANA * 100)}%</td></tr>
           ${linhasFaixasOrb('<b>Pokémon</b> em Gema', 'pt')}`,
        )}
        <p>A comissão sai do <b>vendedor</b>: quem anuncia por 100 Coins recebe
        <b>${100 - (e.taxaMercadoGoldPct ?? 15)}</b>; por 100 Gemas recebe
        <b>${liquidoOrbDaVenda(100, 'item')}</b>. O comprador paga exatamente o que está na
        vitrine.</p>
        <p>No <b>pokémon</b> cobrado em Gema a taxa é <b>por faixa</b>, como imposto de renda: cada
        pedaço do preço paga a alíquota da faixa dele, e não a maior de todas. Num pokémon de
        10.000 Gemas,
        os primeiros 500 pagam ${pctTx(faixasOrbParaTela()[0].pct)}%, o trecho seguinte paga
        ${pctTx(faixasOrbParaTela()[1].pct)}% e só o que passa de 5.000 paga
        ${pctTx(faixasOrbParaTela()[2].pct)}% — o vendedor recebe
        <b>${liquidoOrbDaVenda(10000, 'pokemon').toLocaleString('pt-BR')}</b>. Quanto maior a venda,
        menor a taxa efetiva, e aumentar o preço nunca diminui o que você recebe.</p>
        <p>Item e diamante em Gema pagam ${pctTx(TAXA_ORB_PLANA * 100)}% em qualquer valor. A faixa
        é só do pokémon porque só ele não pode ser comprado em pedaços: cada bicho é peça única e
        a venda é o anúncio inteiro. Num lote de itens, quem escolhe o tamanho da compra é o
        comprador, e a faixa viraria sorteio.</p>

        <h4>Você recebe quando entrar</h4>
        <p>A venda cai numa <b>caixa postal</b>. Da próxima vez que você abrir o jogo (ou dentro de
        um minuto, se já estiver dentro), o valor entra e um aviso diz o que foi vendido e por
        quanto. É assim porque o vendedor quase sempre está offline na hora da venda.</p>

        <h4>A trava de preço</h4>
        ${nota(`Ao comprar, o jogo manda junto <b>o preço que estava na sua tela</b>. Se o vendedor
        tiver subido o valor entre o seu clique e a chegada da mensagem, a compra é <b>recusada</b>
        em vez de cobrar o preço novo. Se o preço tiver <b>caído</b>, você paga o mais barato. A
        moeda entra na mesma trava — um anúncio de 100 de ouro que vira 100 gemas é recusado.`,
        'aviso')}

        <h4>A ficha do anúncio</h4>
        <p>Clique na arte de um pokémon anunciado (ou em <b>Ver ficha</b>) para abrir tudo sobre
        ele: nível, XP e quanto falta para o próximo, os seis stats com o IV de cada um (SPD
        encurta cooldown), a qualidade, a nota da calculadora, o brilho e o que cada potência
        valeria naquele bicho. É a única forma honesta de julgar um preço.</p>`,
        en: `
        <p>Here the other side of the counter is <b>another player</b>. You list pokémon, items and
        <b>purchased diamonds</b>, and charge in <b>Gold</b> or in <b>Gems</b> — the USDT-backed
        currency (see <a data-cap="gemas">Gems</a>).</p>

        <h4>Listing</h4>
        <ul>
          <li>Listing <b>takes it out of your hands</b>: the item leaves your backpack and the pokémon
          leaves your depot immediately. Cancelling returns it.</li>
          <li>You may hold up to <b>${e.maxAnuncios ?? 20} open listings</b> at a time.</li>
          <li><b>One listing per item</b>: while your Water Stone is on the shelf you cannot open
          a second one at another price — change the price of the one already there. Once it is
          gone (sold or cancelled), it takes <b>${m.reanuncioMin ?? 30} minutes</b> before you can
          list the same item again. That is what stops a ladder of "the same item for one Coin
          less" from taking over the whole list.</li>
          <li><b>Only items with trade value get in</b>: <b>evolution stones</b> (<b>Shiny
          Stones</b> included), <b>TM disks and pieces</b>, the <b>Bronze Boss Token</b>, the
          <b>Mystic Ticket</b> and the <b>Safari Ticket</b> (<b>Tickets</b> tab), the <b>Mega Stones</b>, the
          <b>fragments</b> (Key, Shiny Stone, Bicycle, Mega, Mega Shiny and Shiny Egg), the <b>Shiny Egg</b>,
          <b>houses</b>, <b>bicycles</b> and the
          <b>Founder Boxes</b>. Pokémon drops (Bug Wing, Fur, Fossil…) don't reach the shelf —
          they were hundreds of thousand-coin items burying whatever you came looking for.</li>
          <li><b>Of the diamond goods, only skins and Founder Boxes</b>: the <b>Beast Ball</b> and
          the rest of the VIP Shop stay off the shelf. What gets traded is the <b>diamond</b>
          itself, which buys all of it in the Shop.</li>
          <li><b>Pokémon must clear the minimum bar</b>: <b>level ${m.pokemonMin?.level ?? 50}+</b> and
          <b>calculator score ${D(m.pokemonMin?.nota ?? 3.5, 'en')}+</b> (birth strength — IV, quality,
          potency and shiny). <b>Shiny, P5 and legendary pokémon bypass</b> the minimum.</li>
          <li><b>Shiny pokémon sell for Gems only</b>: when you list a shiny the
          <b>Coins</b> button is locked, and editing can't switch the currency from Gems to Coins. Shiny
          listings that were already open in Coins were closed, and the pokémon went back to the
          owner's <b>Collection</b> — just list it again, for Gems.</li>
          <li>The price is <b>per unit</b>. A lot of 100 Water Stones can be bought in slices.</li>
        </ul>

        <h4>Buying</h4>
        <p>Every pokémon bought here <b>arrives in your Collection</b>, out of NPC sales, so it
        cannot leave in a "sell the whole depot" at the <a data-cap="market">Market</a>. Return it
        to the Depot if you really want to sell it back to the NPC.</p>
        <ul>
          <li><b>Items</b> and <b>Diamonds</b> have no <b>Sort by</b>: sellers always show up from the
          <b>lowest price</b> to the highest and, at the same price, whoever listed <b>first</b> comes
          first — the line belongs to whoever got there first. Only the <b>Pokémon</b> tab picks an order
          (Recently listed, Lowest price, Highest price), because there you are choosing one specimen.</li>
          <li>The <b>★</b> on the card of a pokémon for sale keeps the listing in the <b>Favorites</b>
          tab. If someone buys it or the seller withdraws it, the card stays there for a few days,
          greyed out with a notice, until you clear it.</li>
          <li>The <b>Price table</b> (the clipboard) shows everyone's recent sales and filters by type,
          by currency (Coins or Gems) and by item — Diamonds included. On the <b>Pokémon</b> tab it
          searches by name, filters by <b>typing</b>, <b>Shiny only</b> and <b>P5 only</b>, and sorts
          by price, score, IV, quality, potency or level — always within the sales of the <b>last
          ${JANELA_PRECOS_POKEMON_DIAS} days</b>. The <b>Export spreadsheet</b> button, in the table's top
          corner, downloads what is on screen — with the same filters — as a <b>.csv</b> file: one
          download per hour per internet connection.</li>
          <li>Your <b>Sales history</b> and <b>Purchase history</b> show each pokémon's <b>P·IV·Q·N</b>
          badges, and clicking the row opens its card.</li>
          <li>The <b>Hide Outland Pokémon</b> filter (<b>Species</b> group) removes the #2001+ variants
          from the listings: searching "pupitar" now brings only Pupitar, without Ancient Pupitar.</li>
          <li>In the <b>Rarity</b> group, <b>Mega Evolution</b> keeps only pokémon already in Mega form
          (#${MEGA_POKE_BASE + 1} onward) and <b>Legendaries</b> only legendaries and mythicals — the ones
          with ×${MULT_LENDARIO_STATS} stats, Ultra Beasts and the Orre copies included. Both apply to the
          species grid and to the list of offers.</li>
          <li>The card of a pokémon for sale shows <b>how many people favourited</b> the listing — and
          on your own listing, how many favourited yours.</li>
          <li><b>Send DM</b> opens a chat with the seller, tied to that listing, to agree before buying
          (see <a data-cap="chat">Trade</a>).</li>
        </ul>

        <h4>The pokémon showcase</h4>
        <p>The pokémon tab opens as a <b>grid of species</b>: one card per species, with how many
        offers it has and whether there is a shiny or a TM for sale among them. Clicking opens that
        species' offers, in both currencies together. Whoever prefers to sweep the whole market for
        bargains switches off <b>Group by species</b> (in the <b>Species</b> group) and gets the
        listing list back, one card per pokémon.</p>

        <h4>Listing with a reference</h4>
        <p>When setting a price, two shortcuts fill the field: <b>Lowest listing</b> (the cheapest one
        for sale right now) and <b>Average sold</b> (the average price sold over the last 7 days, with
        how many units). The confirmation shows the receipt — the fee and what lands with you —, and
        the cards use the short price (20M, 1.5B).</p>
        <p>The <b>📢 Announce in global chat</b> button sends the listing to the World and Trade chats
        (it costs ${N(CUSTO_ALTO_FALANTE, 'en')} Coins; see <a data-cap="chat">Chat</a>).</p>
        ${nota(`The pokémon goes to the buyer with what is <b>its own</b>: the Name Tag
        <b>nickname</b>, the <b>War Medal</b>, the championship <b>Trophy</b> and the name of <b>who
        caught it</b>. The <b>skin</b> does not: it belongs to the owner, and goes back to being free
        in the seller's backpack.`)}

        <h4>Pokémon filters</h4>
        <p>On the pokémon tab, besides type, badges and <b>Filter by</b>, the <b>Ranges</b> group
        has "min" and "max" for <b>level, potency, total IV, quality and score</b>. You can ask for
        "score from 3.8 to 4.1", "IV above 166" or "potency P3 and up", and combine them all.
        Quality and score accept a decimal comma, and a range typed backwards counts as the same
        range.</p>

        <h4>Hold and draw</h4>
        <p>A listing shows up for everyone right away, but it can only be bought after a
        <b>${m.cooldownCompraMin ?? 2}-minute</b> hold. The <b>Held</b> badge counts down live, on
        the server's clock.</p>
        <ul>
          <li>Adding units to a listing that is already for sale <b>restarts</b> the hold. The price
          can only be edited once the hold is over, and editing restarts it too. Cancelling works at
          any time.</li>
          <li><b>Release draw:</b> every purchase request that arrives in the first
          <b>${SEG_SORTEIO} seconds</b> after a listing is released goes into a draw with the same
          chance. Asking in the first millisecond is worth no more than asking at the end of the
          window. Requests after the draw buy right away, as always.</li>
          <li><b>One request per player per listing</b>: clicking several times does not add
          chances. Whoever loses the draw gets a notice and pays nothing.</li>
          <li><b>The draw window:</b> as soon as your request gets in, a small window opens with
          <b>how many players</b> are in the draw and <b>who they are</b> (up to 100 nicks; in a
          bigger draw the rest shows as “+N”, and the winner always shows), the
          ${SEG_SORTEIO}-second clock, the draw and <b>who won</b>. None
          of it is stored: the list only exists during the draw, and it does not go to the Price
          table.</li>
        </ul>

        <h4>Buy in bulk</h4>
        <p>On an item's panel — and on the diamonds tab —, the <b>Buy in bulk</b> button only asks for
        the number: the game gathers the <b>cheapest</b> listings, each at <b>its own price</b>, and
        shows the total before you buy (2 at 1kk and 4 at 1.2kk make 6 for 6.8kk), with the price
        ladder and the list of sellers.</p>
        <ul>
          <li>Your own listings, the ones still on <b>hold</b> and the ones in the release
          <b>draw</b> are left out: it only takes what a click would buy right away.</li>
          <li>What the screen shows is the ceiling: no unit above the quote's <b>highest price</b>,
          and never more than the <b>total</b>. If a listing is gone before you buy, the next cheapest
          within those two limits fills in; if there is none, the purchase takes less and tells you
          how much.</li>
          <li>One purchase goes through up to <b>${N(MAX_ANUNCIOS_LOTE, 'en')} listings</b>. Pokémon
          and the numbered pieces (Boxes, Houses and Bicycles) are not included.</li>
        </ul>

        <h4>Selling diamonds</h4>
        <p>The market's third tab sells <b>diamonds</b> — the currency you buy with real money. It
        is the way out for someone holding diamonds who wants Coins or Gems, and the way in for
        someone holding Coins who wants diamonds without a card.</p>
        ${nota(`<b>PURCHASED DIAMONDS ONLY can be sold</b> — the ones you paid for with PIX or a
        card. The ones from a <b>referral commission</b> (since Oct 3, 2026), a <b>TopIdle
        vote</b>, the <b>Discord invites</b> and the <b>IDLE Tag</b>, the <b>guild podium</b> or a
        <b>staff adjustment</b> stay out — those exist to be
        spent in the Shop, and letting them become Coins would turn a prize into an economy tap.
        The listing screen shows how many you can sell before it asks for a price.`,
        'atencao')}
        <ul>
          <li>The price is <b>per diamond</b>; the buyer can take a <b>slice</b> of the lot.</li>
          <li>Listing <b>takes it out of your balance</b> right away, the way an item leaves your
          backpack. Cancelling returns whatever was still in the listing.</li>
          <li><b>One diamond listing at a time</b>, with the same ${m.reanuncioMin ?? 30} minutes
          of wait between one and the next. To sell cheaper, edit the price of the one already up.</li>
          <li>Diamonds <b>bought from another player</b> cannot be resold: whoever received them
          paid no money for them, and reselling would open a loop with nothing behind it.</li>
          <li>The commission in the table below applies the same, and comes out of the seller.</li>
        </ul>

        <h4>Boarding at the fair</h4>
        <p>A listed pokémon does not sit on a shelf: it stays at the <b>fair</b>, where the handlers
        look after it until someone takes it home. That is why <b>only pokémon</b> pay a daily fee —
        <b>${(m.taxaDiaria ?? 100000).toLocaleString('en-US')} Coins a day</b>, from
        ${m.diasMin ?? 1} to ${m.diasMax ?? 30} days, chosen when you publish and paid up front.</p>
        <ul>
          <li><b>Items pay nothing</b> and never expire: a shelf does not eat.</li>
          <li>Sold early? The days already paid <b>do not come back</b> — the handlers cared for the
          days they cared for.</li>
          <li>Nobody took it? When the term ends the pokémon <b>returns to your Depot</b> on its
          own — right away, even with the game open, and with a notice saying what came back.</li>
          <li>Need more time? In <b>Edit</b>, <b>Extend the stay</b> adds days to the same listing,
          paid up front at the same daily fee — up to ${m.diasMax ?? 30} days ahead. The price, the
          hold, the Favorites stars and the Trade conversations stay as they were.</li>
        </ul>

        <h4>The commission</h4>
        ${tabela(
          [c.r.regra, c.r.taxa],
          `<tr><td>Listing priced in <b>Gold</b></td><td class="wk-num destaque">${e.taxaMercadoGoldPct ?? 15}%</td></tr>
           <tr><td>Item or diamond in <b>Gems</b></td><td class="wk-num destaque">${pctTx(TAXA_ORB_PLANA * 100)}%</td></tr>
           ${linhasFaixasOrb('<b>Pokémon</b> in Gems', 'en')}`,
        )}
        <p>The commission comes out of the <b>seller</b>: listing for 100 Gold pays you
        <b>${100 - (e.taxaMercadoGoldPct ?? 15)}</b>; for 100 Gems pays you
        <b>${liquidoOrbDaVenda(100, 'item')}</b>. The buyer pays exactly what is on the shelf.</p>
        <p>For a <b>pokémon</b> priced in Gems the fee is <b>tiered</b>, like income tax: each slice
        of the price pays its own rate, not the highest one. On a 10,000 Gem pokémon the first 500 pay
        ${pctTx(faixasOrbParaTela()[0].pct)}%, the next slice pays
        ${pctTx(faixasOrbParaTela()[1].pct)}% and only what goes past 5,000 pays
        ${pctTx(faixasOrbParaTela()[2].pct)}% — the seller gets
        <b>${liquidoOrbDaVenda(10000, 'pokemon').toLocaleString('pt-BR')}</b>. The bigger the sale,
        the lower the effective fee, and raising the price never lowers what you receive.</p>
        <p>Items and diamonds in Gems pay ${pctTx(TAXA_ORB_PLANA * 100)}% at any value. Only the
        pokémon is tiered, because only it cannot be bought in pieces: each one is a unique item and
        the sale is the whole listing. In a stack, the buyer picks the size of the purchase.</p>

        <h4>You get paid when you log in</h4>
        <p>The sale lands in a <b>mailbox</b>. Next time you open the game (or within a minute, if
        you are already in), the money arrives and a notice tells you what sold and for how much.
        It works that way because the seller is almost always offline at the moment of sale.</p>

        <h4>The price lock</h4>
        ${nota(`When you buy, the game sends along <b>the price that was on your screen</b>. If the
        seller raised it between your click and the message arriving, the purchase is
        <b>refused</b> instead of charging the new price. If the price <b>dropped</b>, you pay the
        cheaper one. The currency is under the same lock — a 100-gold listing that turns into 100
        gems is refused.`, 'aviso')}

        <h4>The listing sheet</h4>
        <p>Click a listed pokémon's artwork (or <b>View sheet</b>) to open everything about it:
        level, XP and progress to the next one, the six stats with each IV (SPD shortens cooldowns),
        quality, calculator score, shine, and what each potency would be worth on that creature.
        It is the only honest way to judge a price.</p>`,
        es: `
        <p>Aquí quien está al otro lado del mostrador es <b>otro jugador</b>. Anuncias pokémon,
        objetos y <b>diamantes comprados</b>, y cobras en <b>Oro</b> o en <b>Gemas</b> — la moneda
        respaldada en USDT (ver <a data-cap="gemas">Gemas</a>).</p>

        <h4>Anunciar</h4>
        <ul>
          <li>Anunciar <b>te lo quita de la mano</b>: el objeto sale de la mochila y el pokémon sale
          del depot al instante. Cancelar lo devuelve.</li>
          <li>Puedes tener hasta <b>${e.maxAnuncios ?? 20} anuncios abiertos</b> a la vez.</li>
          <li><b>Un anuncio por objeto</b>: mientras tu Water Stone esté en la vitrina no puedes
          abrir otro a distinto precio — cambia el precio del que ya está. Cuando salga (vendido
          o cancelado), pasan <b>${m.reanuncioMin ?? 30} minutos</b> hasta poder anunciar el mismo
          objeto otra vez. Es lo que impide que una escalera de "el mismo objeto por un Coin
          menos" se quede con toda la lista.</li>
          <li><b>Solo entra lo que tiene valor de intercambio</b>: <b>piedras de evolución</b>
          (las <b>Shiny Stones</b> incluidas), <b>discos y piezas de MT</b>, el <b>Bronze Boss
          Token</b>, el <b>Mystic Ticket</b> y el <b>Safari Ticket</b> (pestaña <b>Tickets</b>), las <b>Mega
          Stones</b>, los <b>fragmentos</b> (de Llave, de Shiny Stone, de Bicicleta, de Mega, de Mega Shiny
          y de Huevo Shiny), el <b>Huevo Shiny</b>,
          <b>casas</b>, <b>bicicletas</b> y las <b>Cajas de Fundador</b>. Los drops de pokémon (Bug
          Wing, Fur, Fossil…) no llegan a la vitrina — eran cientos de ítems de mil monedas
          enterrando lo que uno fue a buscar.</li>
          <li><b>De lo que se compra con diamantes, solo las skins y las Cajas de Fundador</b>: la
          <b>Beast Ball</b> y el resto de la Tienda VIP no llegan a la vitrina. Lo que se negocia es
          el propio <b>diamante</b>, que compra todo eso en la Tienda.</li>
          <li><b>El pokémon debe pasar el mínimo</b>: <b>nivel ${m.pokemonMin?.level ?? 50}+</b> y
          <b>nota ${D(m.pokemonMin?.nota ?? 3.5, 'es')}+</b> en la calculadora (fuerza al nacer — IV,
          calidad, potencia y shiny). <b>Shiny, P5 y legendarios entran</b> en cualquier nivel/nota.</li>
          <li><b>El pokémon Shiny solo se vende por Gemas</b>: al anunciar un
          shiny el botón <b>Coins</b> queda bloqueado, y la edición no cambia la moneda de Gemas a
          Coins. Los anuncios de shiny en Coins que ya estaban abiertos se cerraron, y el pokémon volvió
          a la <b>Colección</b> del dueño — basta anunciarlo de nuevo, en Gemas.</li>
          <li>El precio es <b>por unidad</b>. Un lote de 100 Water Stone se puede comprar por
          partes.</li>
        </ul>

        <h4>Comprar</h4>
        <p>Todo pokémon comprado aquí <b>llega a tu Colección</b>, fuera de la venta al NPC, para
        que no se vaya en un "vender todo el depósito" del <a data-cap="market">Market</a>.
        Devuélvelo al Depósito si de verdad quieres revenderlo al NPC.</p>
        <ul>
          <li><b>Objetos</b> y <b>Diamantes</b> no tienen <b>Ordenar por</b>: quien vende aparece siempre
          del <b>menor precio</b> al mayor y, al mismo precio, quien anunció <b>antes</b> va primero — la
          fila es de quien llegó primero. Solo la pestaña de <b>Pokémon</b> elige el orden (Añadidos
          recientemente, Menor precio, Mayor precio), porque ahí se elige un ejemplar.</li>
          <li>La <b>★</b> en la tarjeta de un pokémon en venta guarda el anuncio en la pestaña
          <b>Favoritos</b>. Si alguien lo compra o el vendedor lo retira, la tarjeta sigue ahí unos
          días, apagada y con el aviso, hasta que la limpies.</li>
          <li>La <b>Tabla de precios</b> (la tablilla) muestra las ventas recientes de todos y filtra
          por tipo, por moneda (Coins o Gemas) y por objeto — los Diamantes incluidos. En la pestaña
          <b>Pokémon</b> busca por nombre, filtra por <b>tipo elemental</b>, <b>Solo shiny</b> y <b>Solo
          P5</b>, y ordena por valor, nota, IV, calidad, potencia o nivel — siempre dentro de las ventas
          de los <b>últimos ${JANELA_PRECOS_POKEMON_DIAS} días</b>. El botón <b>Exportar planilla</b>, en la
          esquina de arriba de la tabla, descarga lo que hay en pantalla — con los mismos filtros — como
          un archivo <b>.csv</b>: una descarga por hora por conexión a internet.</li>
          <li>Tu <b>Historial de ventas</b> y el <b>de compras</b> muestran los sellos <b>P·IV·Q·N</b> de
          cada pokémon, y al pulsar la fila se abre su ficha.</li>
          <li>El filtro <b>Ocultar Pokémon de Outland</b> (grupo <b>Especie</b>) quita del escaparate las
          variantes #2001+: buscar "pupitar" trae solo el Pupitar, sin el Ancient Pupitar.</li>
          <li>En el grupo <b>Rareza</b>, <b>Mega Evolución</b> deja en el escaparate solo los pokémon ya
          en forma Mega (#${MEGA_POKE_BASE + 1} en adelante) y <b>Legendarios</b> solo los legendarios y
          míticos — los del ×${MULT_LENDARIO_STATS} en los stats, incluidos los Ultraentes y las copias de
          Orre. Los dos valen para la cuadrícula de especies y para la lista de ofertas.</li>
          <li>La tarjeta de un pokémon en venta muestra <b>cuántas personas lo marcaron como
          favorito</b> — y en tu anuncio, cuántas marcaron el tuyo.</li>
          <li><b>Enviar DM</b> abre una conversación con el vendedor, atada a ese anuncio, para acordar
          antes de comprar (ver <a data-cap="chat">Comercio</a>).</li>
        </ul>

        <h4>El escaparate de pokémon</h4>
        <p>La pestaña de pokémon se abre como una <b>cuadrícula de especies</b>: una tarjeta por
        especie, con cuántas ofertas tiene y si hay shiny o TM en venta entre ellas. El clic abre las
        ofertas de esa especie, en las dos monedas juntas. Quien prefiere recorrer el mercado entero
        buscando gangas desactiva <b>Agrupar por especie</b> (en el grupo <b>Especie</b>) y recupera la
        lista de anuncios, una tarjeta por pokémon.</p>

        <h4>Anunciar con referencia</h4>
        <p>Al poner el precio, dos atajos rellenan el campo: <b>Anuncio más bajo</b> (el más barato en
        venta ahora) y <b>Promedio vendido</b> (el precio medio vendido en los últimos 7 días, con
        cuántas unidades). La confirmación muestra el recibo — la comisión y lo que te llega —, y las
        tarjetas usan el precio corto (20M, 1,5B).</p>
        <p>El botón <b>📢 Anunciar en el chat global</b> manda el anuncio a los chats Mundo y Comercio
        (cuesta ${N(CUSTO_ALTO_FALANTE, 'es')} Coins; ver <a data-cap="chat">Chat</a>).</p>
        ${nota(`El pokémon va al comprador con lo que es <b>suyo</b>: el <b>apodo</b> de la Name Tag,
        la <b>Medalla de Guerra</b>, el <b>Trofeo</b> de campeonato y el nombre de <b>quien lo
        capturó</b>. La <b>skin</b> no: es del dueño, y vuelve a quedar libre en la mochila de quien
        vendió.`)}

        <h4>Filtros de pokémon</h4>
        <p>En la pestaña de pokémon, además del tipo, los sellos y el <b>Filtrar por</b>, el grupo
        <b>Rangos</b> tiene "mín" y "máx" para <b>nivel, potencia, IV total, calidad y nota</b>.
        Puedes pedir "nota de 3,8 a 4,1", "IV por encima de 166" o "potencia de P3 para arriba", y
        combinarlo todo. Calidad y nota aceptan coma, y un rango escrito al revés vale como el
        mismo rango.</p>

        <h4>Retención y sorteo</h4>
        <p>El anuncio aparece al instante para todos, pero solo se puede comprar tras
        <b>${m.cooldownCompraMin ?? 2} minutos</b> de retención. El sello <b>Retenido</b> cuenta el
        tiempo en vivo, con el reloj del servidor.</p>
        <ul>
          <li>Sumar unidades a un anuncio que ya está a la venta <b>reinicia</b> la retención.
          Editar el precio solo se puede cuando termina, y también la reinicia. Cancelar vale en
          cualquier momento.</li>
          <li><b>Sorteo en la liberación:</b> toda petición de compra que llega en los primeros
          <b>${SEG_SORTEIO} segundos</b> después de liberarse el anuncio entra en un sorteo con la
          misma probabilidad. Pedir en el primer milisegundo no vale más que pedir al final de la
          ventana. Quien pide después del sorteo compra al instante, como siempre.</li>
          <li><b>Una petición por jugador en cada anuncio</b>: pulsar varias veces no da más
          oportunidades. Quien pierde el sorteo recibe el aviso y no paga nada.</li>
          <li><b>La ventana del sorteo:</b> en cuanto tu pedido entra, se abre una ventanita con
          <b>cuántos jugadores</b> están en el sorteo y <b>quiénes son</b> (hasta 100 nicks; en un
          sorteo más grande, el resto aparece como “+N”, y quien se lo llevó aparece siempre), el
          reloj de los ${SEG_SORTEIO} segundos, el sorteo y <b>quién se lo llevó</b>. Nada de eso se guarda: la lista existe solo durante el sorteo, y no va a la
          Tabla de precios.</li>
        </ul>

        <h4>Comprar por cantidad</h4>
        <p>En el panel de un objeto — y en la pestaña de diamantes —, el botón <b>Comprar por
        cantidad</b> solo pide el número: el juego junta los anuncios <b>más baratos</b>, cada uno a
        <b>su precio</b>, y muestra el total antes de comprar (2 a 1kk y 4 a 1,2kk dan 6 por 6,8kk),
        con la escalera de precios y la lista de quién vende.</p>
        <ul>
          <li>Quedan fuera tus anuncios, los que aún están en <b>retención</b> y los que están en el
          <b>sorteo</b> de la liberación: solo lleva lo que un clic compraría al instante.</li>
          <li>Lo que muestra la pantalla es el techo: ninguna unidad por encima del <b>precio más
          alto</b> de la cotización, y nunca más que el <b>total</b>. Si un anuncio sale antes, el
          siguiente más barato dentro de esos dos límites completa; si no hay, la compra lleva menos y
          dice cuánto llevó.</li>
          <li>Una compra recorre hasta <b>${N(MAX_ANUNCIOS_LOTE, 'es')} anuncios</b>. Los pokémon y
          las piezas numeradas (Cajas, Casas y Bicicletas) no entran.</li>
        </ul>

        <h4>Vender diamantes</h4>
        <p>La tercera pestaña del mercado vende <b>diamantes</b> — la moneda que se compra con
        dinero de verdad. Es la salida para quien tiene diamantes y quiere Coins o Gemas, y la
        entrada para quien tiene Coins y quiere diamantes sin pasar por la tarjeta.</p>
        ${nota(`<b>SOLO DIAMANTES COMPRADOS se pueden vender</b> — los que pagaste con PIX o
        tarjeta. Los de <b>comisión de recomendación</b> (desde el 03/10/2026), los de <b>votar en
        TopIdle</b>, de las <b>invitaciones al Discord</b> y de la <b>Tag IDLE</b>, del <b>podio de
        guilds</b> o de un <b>ajuste de la administración</b> quedan
        fuera — existen para gastar en la Tienda, y dejar que se convirtieran en Coins
        transformaría un premio en un grifo de economía. La pantalla de anunciar muestra cuántos
        puedes vender antes de pedirte el precio.`, 'atencao')}
        <ul>
          <li>El precio es <b>por diamante</b>; el comprador puede llevarse una <b>parte</b> del
          lote.</li>
          <li>Anunciar <b>sale de tu saldo</b> al instante, como el objeto sale de la mochila.
          Cancelar devuelve lo que aún quedaba en el anuncio.</li>
          <li><b>Un anuncio de diamantes a la vez</b>, con los mismos ${m.reanuncioMin ?? 30}
          minutos de espera entre uno y el siguiente. Para vender más barato, edita el precio del
          que ya está publicado.</li>
          <li>El diamante <b>comprado a otro jugador</b> no se puede revender: quien lo recibió no
          pagó dinero por él, y revenderlo abriría un ciclo sin respaldo.</li>
          <li>La comisión de la tabla de abajo se aplica igual, y sale del vendedor.</li>
        </ul>

        <h4>La pensión de la feria</h4>
        <p>Un pokémon anunciado no se queda en un estante: se queda en la <b>feria</b>, donde los
        cuidadores lo atienden hasta que alguien se lo lleve. Por eso <b>solo el pokémon</b> paga
        diaria — <b>${(m.taxaDiaria ?? 100000).toLocaleString('es-ES')} Coins por día</b>, de
        ${m.diasMin ?? 1} a ${m.diasMax ?? 30} días, elegidos al publicar y pagados por adelantado.</p>
        <ul>
          <li><b>El ítem no paga nada</b> y no tiene plazo: un estante no come.</li>
          <li>¿Se vendió antes? Los días ya pagados <b>no vuelven</b>: los cuidadores lo atendieron
          los días que lo atendieron.</li>
          <li>¿Nadie se lo llevó? Al terminar el plazo el pokémon <b>vuelve a tu Depot</b> solo —
          al instante, aun con el juego abierto, y con un aviso en pantalla.</li>
          <li>¿Quieres más tiempo? En <b>Editar</b>, <b>Extender la estadía</b> suma días al mismo
          anuncio, pagados por adelantado a la misma diaria — hasta ${m.diasMax ?? 30} días por
          delante. El precio, la retención, las estrellas de Favoritos y las conversaciones del
          Comercio siguen como estaban.</li>
        </ul>

        <h4>La comisión</h4>
        ${tabela(
          [c.r.regra, c.r.taxa],
          `<tr><td>Anuncio cobrado en <b>Oro</b></td><td class="wk-num destaque">${e.taxaMercadoGoldPct ?? 15}%</td></tr>
           <tr><td>Objeto o diamante en <b>Gemas</b></td><td class="wk-num destaque">${pctTx(TAXA_ORB_PLANA * 100)}%</td></tr>
           ${linhasFaixasOrb('<b>Pokémon</b> en Gemas', 'es')}`,
        )}
        <p>En el <b>pokémon</b> cobrado en Gemas la comisión es <b>por tramos</b>, como el impuesto a
        la renta: cada parte del precio paga su propia tasa, no la más alta. En un pokémon de 10.000
        Gemas el vendedor recibe <b>${liquidoOrbDaVenda(10000, 'pokemon').toLocaleString('pt-BR')}</b>,
        y subir el precio nunca baja lo que recibes. Objetos y diamantes en Gemas pagan
        ${pctTx(TAXA_ORB_PLANA * 100)}% en cualquier valor: solo el pokémon va por tramos, porque
        solo él no se puede comprar en partes.</p>
        <p>La comisión sale del <b>vendedor</b>: quien anuncia por 100 Coins recibe
        <b>${100 - (e.taxaMercadoGoldPct ?? 15)}</b>; por 100 Gemas recibe
        <b>${liquidoOrbDaVenda(100, 'item')}</b>. El comprador paga exactamente lo que está en la
        vitrina.</p>

        <h4>Cobras al entrar</h4>
        <p>La venta cae en un <b>buzón</b>. La próxima vez que abras el juego (o en un minuto, si ya
        estás dentro), el importe entra y un aviso dice qué se vendió y por cuánto. Es así porque el
        vendedor casi siempre está desconectado en el momento de la venta.</p>

        <h4>El bloqueo de precio</h4>
        ${nota(`Al comprar, el juego envía junto <b>el precio que estaba en tu pantalla</b>. Si el
        vendedor lo subió entre tu clic y la llegada del mensaje, la compra se <b>rechaza</b> en vez
        de cobrar el precio nuevo. Si el precio <b>bajó</b>, pagas el más barato. La moneda entra en
        el mismo bloqueo — un anuncio de 100 de oro que pasa a 100 gemas se rechaza.`, 'aviso')}

        <h4>La ficha del anuncio</h4>
        <p>Haz clic en el arte de un pokémon anunciado (o en <b>Ver ficha</b>) para abrir todo sobre
        él: nivel, XP y cuánto falta para el siguiente, los seis stats con su IV (SPD acorta
        cooldowns), la calidad, la nota de la calculadora, el brillo y lo que valdría cada potencia
        en ese bicho. Es la única forma honesta de juzgar un precio.</p>`,
      };
    },
  },

  // ---------------------------------------------------------------- 17. loja
  {
    id: 'loja',
    titulo: { pt: 'Loja de Diamantes', en: 'Diamond Shop', es: 'Tienda de Diamantes' },
    grupo: 'economia',
    // As tabelas de produto saem de `lojaProdutos` (o catálogo que o servidor manda), uma por SEÇÃO
    // da vitrine — a mesma arrumação do menu lateral da Loja. As regras da Name Tag e das skins
    // vêm de `shared/apelido-pokemon.mjs` e `shared/skins.mjs`.
    html: (c) => {
      const precoOutfit = (c.d.lojaProdutos ?? []).find((p) => p.cat === 'outfits')?.preco ?? 30;
      const evento = EVENTOS_SKIN[SKINS[0]?.evento];
      const agora = Date.now();
      const dataBr = (ms) => new Date(ms).toLocaleDateString(
        c.lang === 'en' ? 'en-US' : c.lang === 'es' ? 'es-ES' : 'pt-BR',
        { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long' },
      );
      const abre = evento ? dataBr(evento.abreEm) : '';
      const fecha = evento ? dataBr(evento.fechaEm - 1) : '';
      const janela = !evento ? 'sem' : agora < evento.abreEm ? 'antes' : agora < evento.fechaEm ? 'aberta' : 'fechada';
      const vendaSkins = {
        pt: {
          sem: '',
          antes: `A venda das skins de Halloween abre em <b>${abre}</b> e vai até <b>${fecha}</b>.`,
          aberta: `As skins de Halloween estão à venda até <b>${fecha}</b>.`,
          fechada: 'A venda das skins de Halloween acabou: quem comprou fica com elas para sempre, e as unidades livres seguem no Mercado da Comunidade.',
        },
        en: {
          sem: '',
          antes: `The Halloween skins go on sale on <b>${abre}</b> and stay until <b>${fecha}</b>.`,
          aberta: `The Halloween skins are on sale until <b>${fecha}</b>.`,
          fechada: 'The Halloween skins sale is over: whoever bought them keeps them forever, and the free units are still on the Community Market.',
        },
        es: {
          sem: '',
          antes: `La venta de las skins de Halloween abre el <b>${abre}</b> y dura hasta el <b>${fecha}</b>.`,
          aberta: `Las skins de Halloween están a la venta hasta el <b>${fecha}</b>.`,
          fechada: 'La venta de las skins de Halloween terminó: quien las compró se queda con ellas para siempre, y las unidades libres siguen en el Mercado de la Comunidad.',
        },
      }[c.lang][janela];
      return {
        pt: `
        <p>A loja do JOGO. Paga-se em <b>Diamante</b>, que se compra com dinheiro de verdade
        (PIX ou cartão) e <b>acaba ao ser gasto</b>. Não confunda com a <b>Gema</b>, que é do
        <a data-cap="comunidade">Mercado da Comunidade</a> e volta em USDT. A vitrine é dividida em
        seções — as mesmas desta página.</p>

        <h4>Comprar diamantes</h4>
        <p>O botão <b>Comprar Diamantes</b>, no topo da Loja, abre os pacotes (ou outra quantidade),
        pagos por <b>PIX</b> — que pede o CPF, só para o registro fiscal — ou <b>cartão</b>. O saldo
        entra sozinho assim que o pagamento é confirmado. O preço por diamante <b>cai com a
        quantidade</b>: os pacotes grandes mostram o desconto no próprio card. Faltou diamante para
        um produto? O botão dele já abre a compra com o que falta.</p>
        ${nota(`Diamante é consumo: ele é gasto na Loja e não pode ser sacado nem transferido. A
        desistência da compra pode ser pedida em até 7 dias, e cobre só os diamantes comprados que
        ainda estão na conta. Também dá para ganhar diamante sem pagar — ver
        <a data-cap="recompensas">Ganhe diamantes</a>.`)}

        <h4>VIP</h4>
        ${tabela(
          [c.r.efeito, c.r.regra],
          `<tr><td>+50% de XP</td><td>no treinador E no pokémon</td></tr>
           <tr><td>Auto-Catch</td><td>libera as automações <b>Lançar até Capturar</b> e <b>Lançar sem Parar</b></td></tr>
           <tr><td>Outfits exclusivas</td><td>a Gamer VIP Outfit e a Gamer VIP Outfit II</td></tr>
           <tr><td>Emojis VIP</td><td>no chat</td></tr>`,
        )}
        ${tabelaDaLojaGrupo(c, 'vip')}
        <p>Renovar <b>estende</b> em vez de reiniciar: comprar 30 dias faltando 10 dá 40. O tempo
        restante aparece no seu painel, em dias, com a tag azul.</p>

        <h4>Boosts</h4>
        <p>Cinco tipos, oito durações cada (de 1 hora a 30 dias). Preço em diamante:</p>
        ${tabelaDeBoosts(c)}
        <ul>
          <li><b>Não acumulam</b>: comprar o mesmo tipo de novo <b>estende</b> o que está
          correndo.</li>
          <li>Sem limite diário: compre quantos quiser, quando quiser.</li>
          <li>Tipos diferentes rodam juntos — três boosts ativos aparecem como três linhas no seu
          painel, cada uma com o próprio contador.</li>
          <li>O <b>Boost da Guild</b> não se compra aqui: ele liga quando os membros enchem o banco da
          guild (ver <a data-cap="guild">Guilds</a>).</li>
        </ul>

        <h4>Pacotes</h4>
        <p>Dois ou três boosts juntos, por <b>um dia</b>, <b>uma semana</b> ou <b>um mês</b>, mais barato
        que a soma — o card mostra quanto sairia avulso, e os de 7 e 30 dias também quanto sairiam os
        dias soltos. O <b>Pacote Treinador</b> de 7 e o de 30 dias vêm com <b>1 Exp. Share</b> de
        brinde.</p>
        ${tabelaDaLojaGrupo(c, 'pacotes')}

        <h4>Boost dos Atrasados</h4>
        <p>Para quem chegou depois: <b>XP ×${ATRASADOS.mult}</b> (${ATRASADOS.mult * 100}%) no treinador
        e nos pokémon até o seu treinador alcançar o <b>nível dos veteranos</b> — a mediana de quem joga
        há mais de ${ATRASADOS.diasConta} dias, recalculada todo dia. O preço é proporcional ao XP que
        falta (${N(ATRASADOS.precoCheio, 'pt')} 💎 o caminho inteiro, mínimo de
        ${N(ATRASADOS.precoMinimo, 'pt')} 💎), não tem prazo, e enquanto ele dura desmaiar não tira XP.
        As regras inteiras, com o porquê de cada uma, em <a data-cap="atrasados">Boost dos
        Atrasados</a>.</p>

        <h4>Utilitários</h4>
        <p>Os consumíveis e as utilidades: os pacotes de <b>Beast Ball</b> (com o selo de desconto nos
        maiores), a <b>Escape Rope</b> (ver <a data-cap="morte">Desmaiar</a>), o <b>Exp. Share</b> (ver
        <a data-cap="casa">Casa e XP Share</a>), as <b>chocadeiras</b> a mais e o <b>Absorb Bulb</b>
        (ver <a data-cap="chocadeira">Chocadeira</a>).</p>
        ${tabelaDaLojaGrupo(c, 'utilitarios')}
        ${nota(`O <b>Pacote de Suprimentos</b> é o melhor negócio em bolas por diamante, mas só
        pode ser comprado <b>uma vez por semana</b>. O contador aparece no próprio botão quando
        ainda está em espera.`, 'dica')}

        <h4>Nick</h4>
        <p>O nick <b>não se troca mais</b> na Loja (a Troca de Nome saiu em 16/10/2026): escolha bem no cadastro. Só a
        <b>equipe</b> troca, em caso extremo — e a troca reconecta você ao jogo em um segundo (o nick é a chave da sessão),
        com o nome antigo livre para outro jogador.</p>

        <h4>Cosméticos: Name Tag e skins</h4>
        <p>Enfeites de <b>pokémon</b> — só aparência. Espécie, stats, tipo, evolução e combate não mudam
        em nada.</p>
        <ul>
          <li><b>Name Tag</b> (${NAME_TAG_PRECO} 💎): dá um <b>nome</b> ao seu pokémon. Comprada, ela
          espera na mochila; use em <b>Mochila → Itens Raros → Name Tag</b>, escolha o pokémon (equipe,
          Depot ou Coleção) e escreva até <b>${APELIDO_MAX} letras</b>. É de <b>uso único</b>: trocar o
          nome de novo pede outra etiqueta.</li>
          <li>O nome aparece na ficha (com a espécie logo abaixo), em campo, na praça do Centro, no
          chat, na equipe, no Depot, na Coleção e no Mercado — e <b>vai junto</b> quando o pokémon troca
          de dono. No PvP o adversário continua vendo a espécie.</li>
          <li><b>Skins</b> (${SKIN_PRECO} 💎 cada): a fantasia que troca o <b>desenho</b> de um pokémon.
          Cada skin veste <b>uma espécie e uma cor</b> — a comum só veste o comum e a shiny só o shiny —,
          e a skin de uma Mega é outra skin, da Mega. Ela fica para sempre na aba <b>Skins</b> da mochila:
          vista e tire quando quiser, e cada unidade veste um pokémon.</li>
          <li>A skin é do <b>dono</b>, não do pokémon: vendê-lo não leva a skin junto, e megaevoluir um
          pokémon vestido tira a fantasia (a skin volta a ficar livre). A unidade livre se vende no
          <a data-cap="comunidade">Mercado da Comunidade</a>.</li>
          <li>As skins são <b>de evento</b>, vendidas só na janela dele. ${vendaSkins}</li>
        </ul>
        ${nota(`O apelido <b>não aceita palavrão</b>: o jogo recusa antes de gastar a etiqueta. E nome com
        <b>racismo, preconceito ou qualquer ofensa</b> que escape do filtro pode fazer o pokémon ser
        excluído sem aviso e o jogador banido. Toda troca de nome fica registrada.`, 'aviso')}
        ${tabelaDaLojaGrupo(c, 'cosmeticos')}

        <h4>Outfits</h4>
        <p>Aparência para o seu treinador, ${precoOutfit}
        💎 cada. Comprar já equipa, e você troca entre as suas quando quiser.</p>`,
        en: `
        <p>The GAME's shop. You pay in <b>Diamonds</b>, bought with real money (card or PIX), and
        they are <b>gone once spent</b>. Do not confuse them with <b>Gems</b>, which belong to the
        <a data-cap="comunidade">Community Market</a> and come back as USDT. The shop is split into
        sections — the same ones on this page.</p>

        <h4>Buying diamonds</h4>
        <p>The <b>Buy Diamonds</b> button, at the top of the Shop, opens the packs (or any other
        amount), paid by <b>PIX</b> — which asks for a CPF, for tax records only — or <b>card</b>. The
        balance comes in by itself as soon as the payment is confirmed. The price per diamond <b>drops
        with quantity</b>: the big packs show the discount on the card itself. Short of diamonds for a
        product? Its button opens the purchase with what is missing.</p>
        ${nota(`Diamonds are consumed: they are spent in the Shop and cannot be withdrawn or
        transferred. A purchase can be cancelled within 7 days, and that covers only the purchased
        diamonds still on the account. You can also earn diamonds without paying — see
        <a data-cap="recompensas">Earn diamonds</a>.`)}

        <h4>VIP</h4>
        ${tabela(
          [c.r.efeito, c.r.regra],
          `<tr><td>+50% XP</td><td>on the trainer AND the pokémon</td></tr>
           <tr><td>Auto-Catch</td><td>unlocks the <b>Throw until Catch</b> and <b>Throw Nonstop</b> automations</td></tr>
           <tr><td>Exclusive outfits</td><td>the Gamer VIP Outfit and the Gamer VIP Outfit II</td></tr>
           <tr><td>VIP emojis</td><td>in chat</td></tr>`,
        )}
        ${tabelaDaLojaGrupo(c, 'vip')}
        <p>Renewing <b>extends</b> rather than restarts: buying 30 days with 10 left gives you 40.
        The remaining time shows on your panel, in days, with the blue tag.</p>

        <h4>Boosts</h4>
        <p>Five types, eight durations each (from 1 hour to 30 days). Price in diamonds:</p>
        ${tabelaDeBoosts(c)}
        <ul>
          <li>They <b>do not stack</b>: buying the same type again <b>extends</b> the running
          one.</li>
          <li>No daily limit: buy as many as you want, whenever you want.</li>
          <li>Different types run together — three active boosts show as three rows on your panel,
          each with its own countdown.</li>
          <li>The <b>Guild Boost</b> is not sold here: it turns on when the members fill the guild bank
          (see <a data-cap="guild">Guilds</a>).</li>
        </ul>

        <h4>Bundles</h4>
        <p>Two or three boosts together, for <b>one day</b>, <b>one week</b> or <b>one month</b>,
        cheaper than their sum — the card shows what they would cost separately, and the 7- and 30-day
        ones also what the loose days would cost. The 7-day and the 30-day <b>Trainer Pack</b> come with
        <b>1 Exp. Share</b> as a gift.</p>
        ${tabelaDaLojaGrupo(c, 'pacotes')}

        <h4>Late Joiner Boost</h4>
        <p>For whoever joined late: <b>XP ×${ATRASADOS.mult}</b> (${ATRASADOS.mult * 100}%) for your
        trainer and pokémon until your trainer reaches the <b>veterans' level</b> — the median of players
        with more than ${ATRASADOS.diasConta} days in the game, recalculated every day. The price is
        proportional to the XP still missing (${N(ATRASADOS.precoCheio, 'en')} 💎 for the whole road,
        minimum ${N(ATRASADOS.precoMinimo, 'en')} 💎), there is no timer, and while it lasts fainting
        costs no XP. The full rules, with the reason behind each one, in
        <a data-cap="atrasados">Late Joiner Boost</a>.</p>

        <h4>Consumables</h4>
        <p>The consumables and utilities: the <b>Beast Ball</b> packs (with the discount badge on the
        bigger ones), the <b>Escape Rope</b> (see <a data-cap="morte">Fainting</a>), the <b>Exp.
        Share</b> (see <a data-cap="casa">House &amp; XP Share</a>), extra <b>incubators</b> and the
        <b>Absorb Bulb</b> (see <a data-cap="chocadeira">Incubator</a>).</p>
        ${tabelaDaLojaGrupo(c, 'utilitarios')}
        ${nota(`The <b>Supply Pack</b> is the best balls-per-diamond deal, but it can only be bought
        <b>once a week</b>. The countdown shows on the button itself while it is still on
        cooldown.`, 'dica')}

        <h4>Nick</h4>
        <p>The nick <b>can no longer be changed</b> in the Shop (the Name Change was removed on 2026-10-16): choose well when
        you sign up. Only the <b>team</b> changes it, in extreme cases — and the change reconnects you within a second (the
        nick is the session key), with the old name free for another player.</p>

        <h4>Cosmetics: Name Tag and skins</h4>
        <p>Decorations for a <b>pokémon</b> — looks only. Species, stats, type, evolution and combat
        don't change at all.</p>
        <ul>
          <li><b>Name Tag</b> (${NAME_TAG_PRECO} 💎): gives your pokémon a <b>name</b>. Once bought, it
          waits in the backpack; use it from <b>Backpack → Rare Items → Name Tag</b>, pick the pokémon (team,
          Depot or Collection) and write up to <b>${APELIDO_MAX} letters</b>. It is <b>single-use</b>:
          renaming again takes another tag.</li>
          <li>The name shows on the sheet (with the species right below), on the field, in the Center
          square, in chat, on the team, in the Depot, the Collection and the Market — and it <b>goes
          along</b> when the pokémon changes hands. In PvP your opponent still sees the
          species.</li>
          <li><b>Skins</b> (${SKIN_PRECO} 💎 each): the costume that changes a pokémon's
          <b>sprite</b>. Each skin fits <b>one species and one colour</b> — the regular one only fits a
          regular pokémon and the shiny one only a shiny —, and a Mega's skin is a separate skin, for
          the Mega. It stays forever on the backpack's <b>Skins</b> tab: put it on and take it off whenever
          you want, and each unit dresses one pokémon.</li>
          <li>The skin belongs to the <b>owner</b>, not the pokémon: selling it doesn't take the skin
          along, and mega evolving a dressed pokémon takes the costume off (the skin is free again).
          A free unit can be sold on the <a data-cap="comunidade">Community Market</a>.</li>
          <li>Skins are <b>event</b> items, sold only during the event window. ${vendaSkins}</li>
        </ul>
        ${nota(`The nickname <b>accepts no swearing</b>: the game refuses it before spending the tag. And a
        name with <b>racism, prejudice or any offence</b> that slips past the filter can get the pokémon
        deleted without notice and the player banned. Every rename is logged.`, 'aviso')}
        ${tabelaDaLojaGrupo(c, 'cosmeticos')}

        <h4>Outfits</h4>
        <p>Looks for your trainer, ${precoOutfit}
        💎 each. Buying equips it right away, and you switch between the ones you own whenever you
        want.</p>`,
        es: `
        <p>La tienda del JUEGO. Se paga en <b>Diamantes</b>, que se compran con dinero real (PIX o
        tarjeta) y <b>se acaban al gastarse</b>. No los confundas con las <b>Gemas</b>, que son del
        <a data-cap="comunidade">Mercado de la Comunidad</a> y vuelven en USDT. El escaparate está
        dividido en secciones — las mismas de esta página.</p>

        <h4>Comprar diamantes</h4>
        <p>El botón <b>Comprar Diamantes</b>, arriba en la Tienda, abre los paquetes (u otra
        cantidad), pagados por <b>PIX</b> — que pide el CPF, solo para el registro fiscal — o
        <b>tarjeta</b>. El saldo entra solo en cuanto se confirma el pago. El precio por diamante
        <b>baja con la cantidad</b>: los paquetes grandes muestran el descuento en la propia tarjeta.
        ¿Te faltan diamantes para un producto? Su botón ya abre la compra con lo que falta.</p>
        ${nota(`El diamante es consumo: se gasta en la Tienda y no se puede retirar ni transferir.
        El desistimiento de la compra se puede pedir en hasta 7 días, y cubre solo los diamantes
        comprados que sigan en la cuenta. También se pueden ganar diamantes sin pagar — ver
        <a data-cap="recompensas">Gana diamantes</a>.`)}

        <h4>VIP</h4>
        ${tabela(
          [c.r.efeito, c.r.regra],
          `<tr><td>+50% de XP</td><td>en el entrenador Y en el pokémon</td></tr>
           <tr><td>Auto-Catch</td><td>libera las automatizaciones <b>Lanzar hasta Capturar</b> y <b>Lanzar sin Parar</b></td></tr>
           <tr><td>Outfits exclusivas</td><td>la Gamer VIP Outfit y la Gamer VIP Outfit II</td></tr>
           <tr><td>Emojis VIP</td><td>en el chat</td></tr>`,
        )}
        ${tabelaDaLojaGrupo(c, 'vip')}
        <p>Renovar <b>extiende</b> en vez de reiniciar: comprar 30 días faltando 10 da 40. El tiempo
        restante aparece en tu panel, en días, con la etiqueta azul.</p>

        <h4>Boosts</h4>
        <p>Cinco tipos, ocho duraciones cada uno (de 1 hora a 30 días). Precio en diamantes:</p>
        ${tabelaDeBoosts(c)}
        <ul>
          <li><b>No se acumulan</b>: comprar el mismo tipo otra vez <b>extiende</b> el que está
          corriendo.</li>
          <li>Sin límite diario: compra cuantos quieras, cuando quieras.</li>
          <li>Tipos distintos corren juntos — tres boosts activos aparecen como tres líneas en tu
          panel, cada una con su propio contador.</li>
          <li>El <b>Boost de la Guild</b> no se compra aquí: se activa cuando los miembros llenan el
          banco de la guild (ver <a data-cap="guild">Guilds</a>).</li>
        </ul>

        <h4>Paquetes</h4>
        <p>Dos o tres boosts juntos, por <b>un día</b>, <b>una semana</b> o <b>un mes</b>, más baratos que
        la suma — la tarjeta muestra cuánto costarían sueltos, y los de 7 y 30 días también cuánto
        costarían los días sueltos. El <b>Paquete Entrenador</b> de 7 y el de 30 días traen
        <b>1 Exp. Share</b> de regalo.</p>
        ${tabelaDaLojaGrupo(c, 'pacotes')}

        <h4>Boost de los Rezagados</h4>
        <p>Para quien llegó después: <b>XP ×${ATRASADOS.mult}</b> (${ATRASADOS.mult * 100}%) para el
        entrenador y los pokémon hasta que tu entrenador alcance el <b>nivel de los veteranos</b> — la
        mediana de quienes juegan hace más de ${ATRASADOS.diasConta} días, recalculada todos los días.
        El precio es proporcional al XP que falta (${N(ATRASADOS.precoCheio, 'es')} 💎 el camino entero,
        mínimo de ${N(ATRASADOS.precoMinimo, 'es')} 💎), no tiene plazo, y mientras dura debilitarse no
        quita XP. Las reglas completas, con el porqué de cada una, en <a data-cap="atrasados">Boost de
        los Rezagados</a>.</p>

        <h4>Consumibles</h4>
        <p>Los consumibles y las utilidades: los paquetes de <b>Beast Ball</b> (con el sello de
        descuento en los mayores), la <b>Escape Rope</b> (ver <a data-cap="morte">Debilitarse</a>), el
        <b>Exp. Share</b> (ver <a data-cap="casa">Casa y XP Share</a>), las <b>incubadoras</b> extra y
        el <b>Absorb Bulb</b> (ver <a data-cap="chocadeira">Incubadora</a>).</p>
        ${tabelaDaLojaGrupo(c, 'utilitarios')}
        ${nota(`El <b>Paquete de Suministros</b> es el mejor negocio en bolas por diamante, pero
        solo se puede comprar <b>una vez por semana</b>. El contador aparece en el propio botón
        mientras sigue en espera.`, 'dica')}

        <h4>Nick</h4>
        <p>El nick <b>ya no se cambia</b> en la Tienda (el Cambio de Nombre salió el 16/10/2026): elige bien al registrarte.
        Solo el <b>equipo</b> lo cambia, en casos extremos — y el cambio te reconecta en un segundo (el nick es la llave de la
        sesión), con el nombre antiguo libre para otro jugador.</p>

        <h4>Cosméticos: Name Tag y skins</h4>
        <p>Adornos de <b>pokémon</b> — solo apariencia. Especie, stats, tipo, evolución y combate no
        cambian en nada.</p>
        <ul>
          <li><b>Name Tag</b> (${NAME_TAG_PRECO} 💎): le da un <b>nombre</b> a tu pokémon. Comprada,
          espera en la mochila; úsala en <b>Mochila → Objetos Raros → Name Tag</b>, elige el pokémon
          (equipo, Depósito o Colección) y escribe hasta <b>${APELIDO_MAX} letras</b>. Es de <b>un solo
          uso</b>: cambiar el nombre otra vez pide otra etiqueta.</li>
          <li>El nombre aparece en la ficha (con la especie justo debajo), en el campo, en la plaza del
          Centro, en el chat, en el equipo, en el Depósito, en la Colección y en el Mercado — y <b>va
          con él</b> cuando el pokémon cambia de dueño. En el PvP el rival sigue viendo la
          especie.</li>
          <li><b>Skins</b> (${SKIN_PRECO} 💎 cada una): el disfraz que cambia el <b>dibujo</b> de un
          pokémon. Cada skin viste <b>una especie y un color</b> — la común solo viste al común y la
          shiny solo al shiny —, y la skin de una Mega es otra skin, de la Mega. Queda para siempre en
          la pestaña <b>Skins</b> de la mochila: póntela y quítatela cuando quieras, y cada unidad viste a
          un pokémon.</li>
          <li>La skin es del <b>dueño</b>, no del pokémon: venderlo no se lleva la skin, y
          megaevolucionar un pokémon disfrazado le quita el disfraz (la skin vuelve a quedar libre). La
          unidad libre se vende en el <a data-cap="comunidade">Mercado de la Comunidad</a>.</li>
          <li>Las skins son <b>de evento</b>, vendidas solo en su ventana. ${vendaSkins}</li>
        </ul>
        ${nota(`El apodo <b>no acepta groserías</b>: el juego lo rechaza antes de gastar la etiqueta. Y un
        nombre con <b>racismo, prejuicio o cualquier ofensa</b> que se escape del filtro puede hacer que el
        pokémon se elimine sin aviso y que el jugador sea baneado. Todo cambio de nombre queda registrado.`, 'aviso')}
        ${tabelaDaLojaGrupo(c, 'cosmeticos')}

        <h4>Outfits</h4>
        <p>Apariencia para tu entrenador, ${precoOutfit}
        💎 cada una. Comprarla la equipa al momento, y cambias entre las tuyas cuando quieras.</p>`,
      };
    },
  },

  // ------------------------------------------------------ 17a. diamantes sem pagar
  //
  // Os quatro caminhos de diamante que não passam pelo caixa. A escada de convites e a régua da
  // Tag do Discord saem de `shared/convites.mjs` e `shared/tag-discord.mjs` — as mesmas que o bot
  // e o servidor usam; as porcentagens da indicação e o voto, das constantes do topo do arquivo.
  {
    id: 'recompensas',
    titulo: { pt: 'Ganhe diamantes: indicação, votos e Discord', en: 'Earn diamonds: referrals, votes and Discord', es: 'Gana diamantes: referidos, votos y Discord' },
    grupo: 'economia',
    html: (c) => {
      const anos = Math.round(IDADE_DISCORD_MS / (365 * 24 * 3_600_000));
      return {
        pt: `
        <p>Diamante se compra — mas também se ganha. São quatro caminhos, e nenhum depende de
        sorte. Os diamantes que vêm daqui são <b>brinde</b>: valem na Loja e no banco da guild, mas
        <b>não se vendem</b> no Mercado da Comunidade (só diamante comprado se vende).</p>

        <h4>Indique & Ganhe</h4>
        <p>O botão <b>Indique & Ganhe</b>, ao lado das suas moedas no painel do treinador, mostra o
        <b>seu link</b> e o seu código. Quem cria a conta pelo seu link vira seu <b>indicado</b>, para
        sempre:</p>
        <ul>
          <li>você recebe <b>${PCT_INDICACAO_DIAMANTE}%</b> em diamantes de tudo o que ele <b>comprar</b>
          de diamante, e <b>${PCT_INDICACAO_GEMA}%</b> das <b>Gemas</b> que ele depositar;</li>
          <li>a comissão só nasce de pagamento real confirmado, e fica <b>A recolher</b> até você clicar
          em <b>Recolher lucro dos afiliados</b>;</li>
          <li>quem entrou sem link pode digitar o código de quem o trouxe, mas só <b>antes da primeira
          compra</b> de diamantes.</li>
        </ul>
        <p><b>Referral Especial.</b> Streamers e parceiros com acordo têm link próprio e o selo
        <b>★ Influenciador Oficial</b>, às vezes com outra porcentagem. Quem <b>cria a conta</b> por um
        desses links ganha <b>${HORAS_VIP_REFERRAL} horas de VIP</b> no primeiro login.</p>

        <h4>Vote & Ganhe</h4>
        <p>O quadradinho da <b>estrela</b>, na coluna do seu retrato, leva ao <b>TopIdle</b> com o seu
        nick já preenchido. O TopIdle libera <b>um voto por dia</b>, e a cada <b>${VOTOS_POR_DIAMANTE}
        votos</b> cai <b>1 💎</b> na conta, sozinho, em segundos. A conta Google pedida lá é do
        TopIdle, só para provar que o voto é de uma pessoa — não precisa ser a do jogo.</p>

        <h4>Convide & Ganhe (Discord)</h4>
        <p>Cada pessoa que entra no nosso <b>Discord pelo SEU link de convite</b> vira ponto. Não é
        sorteio, é contagem — e cada marco paga uma vez: quem chega a 20 já levou os de 1, 5 e 10 pelo
        caminho.</p>
        ${tabelaConvites(c)}
        <ul>
          <li>Pegue o seu link no Discord, no botão <b>Gerar meu convite</b>. Ele vale <b>1 dia</b>:
          clicar de novo mostra o mesmo link até ele vencer, e depois o botão gera outro. O link geral
          do servidor não conta para ninguém.</li>
          <li>Só vale ponto quem entra com <b>conta de Discord de mais de ${anos} ano</b>, e quem sai do
          servidor deixa de contar.</li>
          <li>O prêmio sai como <b>código</b>: no canal <b>#reedem-codes</b>, o botão <b>Resgatar
          Recompensa de Referral</b> mostra o seu (só você vê). No jogo, digite
          <b>/resgatar &lt;código&gt;</b> no chat — cada código vale uma vez.</li>
        </ul>

        <h4>Tag IDLE no Discord</h4>
        <p>Ponha a tag <b>IDLE</b> do nosso servidor no seu perfil do Discord: <b>${DIAMANTES_TAG_1A} 💎
        na hora</b> na primeira vez (uma vez por conta de Discord) e mais <b>${DIAMANTES_TAG} 💎 a cada
        ${DIAS_TAG} dias seguidos</b> com ela.</p>
        <ul>
          <li>Tirou a tag (trocou pela de outro servidor, ou saiu do servidor)? O relógio <b>zera</b>, e a
          sequência recomeça quando ela voltar.</li>
          <li>Vale a mesma régua da conta de Discord com mais de ${anos} ano.</li>
          <li>No #reedem-codes, o botão <b>Resgatar Recompensa de TAG</b> mostra o seu relógio e o
          código que liga o Discord à sua conta do jogo — o vínculo é um para um, para sempre.</li>
        </ul>`,
        en: `
        <p>Diamonds can be bought — but they can also be earned. There are four paths, and none of
        them depends on luck. The diamonds from here are a <b>gift</b>: they work in the Shop and the
        guild bank, but <b>cannot be sold</b> on the Community Market (only purchased diamonds
        can).</p>

        <h4>Refer & Earn</h4>
        <p>The <b>Refer & Earn</b> button, next to your coins on the trainer panel, shows <b>your
        link</b> and your code. Whoever creates an account through your link becomes your
        <b>referral</b>, forever:</p>
        <ul>
          <li>you get <b>${PCT_INDICACAO_DIAMANTE}%</b> in diamonds of every diamond they <b>buy</b>, and
          <b>${PCT_INDICACAO_GEMA}%</b> of the <b>Gems</b> they deposit;</li>
          <li>the commission only comes from a real, confirmed payment, and waits as <b>To collect</b>
          until you click <b>Collect affiliate earnings</b>;</li>
          <li>whoever joined without a link can type the code of whoever brought them, but only
          <b>before their first</b> diamond purchase.</li>
        </ul>
        <p><b>Special Referral.</b> Streamers and partners with a deal have their own link and the
        <b>★ Official Influencer</b> badge, sometimes with a different percentage. Whoever <b>creates an
        account</b> through one of those links gets <b>${HORAS_VIP_REFERRAL} hours of VIP</b> on their
        first login.</p>

        <h4>Vote & Earn</h4>
        <p>The <b>star</b> square, in your portrait column, takes you to <b>TopIdle</b> with your nick
        already filled in. TopIdle allows <b>one vote a day</b>, and every <b>${VOTOS_POR_DIAMANTE}
        votes</b> drop <b>1 💎</b> into your account, on their own, within seconds. The Google account it
        asks for belongs to TopIdle, just to prove the vote comes from a person — it doesn't have to be
        your game account.</p>

        <h4>Invite & Earn (Discord)</h4>
        <p>Everyone who joins our <b>Discord through YOUR invite link</b> counts as a point. It is not a
        draw, it is a count — and each milestone pays once: reaching 20 means you already collected 1, 5
        and 10 along the way.</p>
        ${tabelaConvites(c)}
        <ul>
          <li>Get your link on Discord, from the <b>Gerar meu convite</b> button. It lasts <b>1 day</b>:
          clicking again shows the same link until it expires, then the button makes a new one. The
          server's general link counts for no one.</li>
          <li>A point only counts for people joining with a <b>Discord account over ${anos} year
          old</b>, and whoever leaves the server stops counting.</li>
          <li>The prize comes as a <b>code</b>: in the <b>#reedem-codes</b> channel, the <b>Resgatar
          Recompensa de Referral</b> button shows yours (only you see it). In the game, type
          <b>/resgatar &lt;code&gt;</b> in chat — each code works once.</li>
        </ul>

        <h4>IDLE Tag on Discord</h4>
        <p>Put our server's <b>IDLE</b> tag on your Discord profile: <b>${DIAMANTES_TAG_1A} 💎 right
        away</b> the first time (once per Discord account) and <b>${DIAMANTES_TAG} 💎 more every
        ${DIAS_TAG} days in a row</b> with it.</p>
        <ul>
          <li>Took the tag off (switched to another server's, or left the server)? The clock
          <b>resets</b>, and the streak starts again when it comes back.</li>
          <li>The same rule of a Discord account over ${anos} year old applies.</li>
          <li>In #reedem-codes, the <b>Resgatar Recompensa de TAG</b> button shows your clock and the
          code that links Discord to your game account — the link is one to one, forever.</li>
        </ul>`,
        es: `
        <p>El diamante se compra — pero también se gana. Hay cuatro caminos, y ninguno depende de la
        suerte. Los diamantes que salen de aquí son <b>regalo</b>: valen en la Tienda y en el banco de
        la guild, pero <b>no se venden</b> en el Mercado de la Comunidad (solo se vende diamante
        comprado).</p>

        <h4>Invita y Gana</h4>
        <p>El botón <b>Invita y Gana</b>, junto a tus monedas en el panel del entrenador, muestra
        <b>tu enlace</b> y tu código. Quien crea la cuenta por tu enlace se vuelve tu <b>referido</b>,
        para siempre:</p>
        <ul>
          <li>recibes el <b>${PCT_INDICACAO_DIAMANTE}%</b> en diamantes de todo lo que <b>compre</b> de
          diamante, y el <b>${PCT_INDICACAO_GEMA}%</b> de las <b>Gemas</b> que deposite;</li>
          <li>la comisión solo nace de un pago real confirmado, y queda <b>Por recoger</b> hasta que
          pulses <b>Recoger ganancias de referidos</b>;</li>
          <li>quien entró sin enlace puede escribir el código de quien lo trajo, pero solo <b>antes de
          su primera compra</b> de diamantes.</li>
        </ul>
        <p><b>Referral Especial.</b> Streamers y socios con acuerdo tienen enlace propio y el sello
        <b>★ Influenciador Oficial</b>, a veces con otro porcentaje. Quien <b>crea la cuenta</b> por uno
        de esos enlaces gana <b>${HORAS_VIP_REFERRAL} horas de VIP</b> en su primer inicio de
        sesión.</p>

        <h4>Vota & Gana</h4>
        <p>El cuadradito de la <b>estrella</b>, en la columna de tu retrato, lleva a <b>TopIdle</b> con
        tu nick ya rellenado. TopIdle permite <b>un voto al día</b>, y cada <b>${VOTOS_POR_DIAMANTE}
        votos</b> cae <b>1 💎</b> en la cuenta, solo, en segundos. La cuenta de Google que pide es de
        TopIdle, solo para probar que el voto es de una persona — no tiene que ser la del juego.</p>

        <h4>Invita y Gana (Discord)</h4>
        <p>Cada persona que entra en nuestro <b>Discord por TU enlace de invitación</b> cuenta como
        punto. No es sorteo, es conteo — y cada hito paga una vez: quien llega a 20 ya cobró los de 1, 5
        y 10 por el camino.</p>
        ${tabelaConvites(c)}
        <ul>
          <li>Consigue tu enlace en Discord, en el botón <b>Gerar meu convite</b>. Dura <b>1 día</b>:
          al hacer clic otra vez ves el mismo enlace hasta que caduque, y luego el botón crea otro. El
          enlace general del servidor no cuenta para nadie.</li>
          <li>Solo suma punto quien entra con una <b>cuenta de Discord de más de ${anos} año</b>, y quien
          sale del servidor deja de contar.</li>
          <li>El premio sale como <b>código</b>: en el canal <b>#reedem-codes</b>, el botón <b>Resgatar
          Recompensa de Referral</b> muestra el tuyo (solo tú lo ves). En el juego, escribe
          <b>/resgatar &lt;código&gt;</b> en el chat — cada código vale una vez.</li>
        </ul>

        <h4>Tag IDLE en Discord</h4>
        <p>Pon la tag <b>IDLE</b> de nuestro servidor en tu perfil de Discord: <b>${DIAMANTES_TAG_1A} 💎
        al instante</b> la primera vez (una vez por cuenta de Discord) y <b>${DIAMANTES_TAG} 💎 más cada
        ${DIAS_TAG} días seguidos</b> con ella.</p>
        <ul>
          <li>¿Te quitaste la tag (la cambiaste por la de otro servidor, o saliste del servidor)? El
          reloj <b>vuelve a cero</b>, y la racha empieza de nuevo cuando vuelva.</li>
          <li>Vale la misma regla de la cuenta de Discord con más de ${anos} año.</li>
          <li>En #reedem-codes, el botón <b>Resgatar Recompensa de TAG</b> muestra tu reloj y el código
          que une Discord con tu cuenta del juego — el vínculo es uno a uno, para siempre.</li>
        </ul>`,
      };
    },
  },

  // --------------------------------------------------------- 17b. Passe de Batalha
  //
  // A tabela dos 30 dias sai da MESMA `TRILHA` que o servidor entrega (`shared/passe-batalha.mjs`):
  // mudar um prêmio lá muda esta página junto.
  {
    id: 'passe',
    titulo: { pt: 'Passe de Batalha', en: 'Battle Pass', es: 'Pase de Batalla' },
    grupo: 'economia',
    html: (c) => {
      const nomeBoost = {
        xp: 'XP Boost', pokexp: c.lang === 'en' ? 'Pokémon XP Boost' : 'XP Boost Pokémon',
        loot: 'Loot Boost', captura: 'Capture Boost', shiny: 'Shiny Secret Lure',
      };
      const L = {
        pt: { vip: 'dias de VIP', coins: 'Coins', dia: 'Dia', gratis: 'Grátis', bau: '🎁 baú', lend: '🏆 lendário' },
        en: { vip: 'days of VIP', coins: 'Coins', dia: 'Day', gratis: 'Free', bau: '🎁 chest', lend: '🏆 legendary' },
        es: { vip: 'días de VIP', coins: 'Coins', dia: 'Día', gratis: 'Gratis', bau: '🎁 cofre', lend: '🏆 legendario' },
      }[c.lang] ?? {};
      const nomeDe = (pr) => {
        if (pr.tipo === 'coins') return `${N(pr.qtd, c.lang)} ${L.coins}`;
        if (pr.tipo === 'boost') return `${nomeBoost[pr.boost] ?? pr.boost} (${pr.horas}h)`;
        if (pr.tipo === 'vip') return `${pr.dias} ${L.vip}`;
        if (pr.tipo === 'bola') {
          const b = (c.d.catalogoBolas ?? []).find((x) => x.id === pr.id);
          return `${N(pr.qtd, c.lang)}× ${b?.nome ?? '#' + pr.id}`;
        }
        const it = c.d.itens?.get?.(pr.id);
        return `${N(pr.qtd, c.lang)}× ${it?.name ?? '#' + pr.id}`;
      };
      const linhas = TRILHA_PASSE.map((d) => `<tr${d.bau ? ' class="wk-destaque"' : ''}>
          <td class="wk-num">${d.dia}${d.dia === PASSE_DIAS ? ` ${L.lend}` : d.bau ? ` ${L.bau}` : ''}</td>
          <td>${d.free.map(nomeDe).join(' + ')}</td>
          <td>${d.vip.map(nomeDe).join(' + ')}</td>
        </tr>`).join('');
      // A coluna do passe pago é "Premium": o nome VIP é do VIP da Loja, outro produto (e quem lia
      // "VIP" aqui achava que ter VIP já dava o passe).
      const tabelaTrilha = tabela([L.dia, L.gratis, 'Premium'], linhas);
      return {
        pt: `
        <p>O botão <b>Passe</b>, no topo ao lado do Market, é uma trilha de <b>${PASSE_DIAS} dias de
        login</b>. Entre, resgate o prêmio do dia e ande um degrau. Libera no nível
        <b>${N(PASSE_NIVEL_MIN, c.lang)}</b>.</p>
        <ul>
          <li><b>Um resgate por dia.</b> O dia vira à <b>meia-noite de Brasília</b> (03:00 UTC).</li>
          <li><b>Faltou um dia, a trilha volta ao Dia 1.</b> A tela mostra um relógio com quanto
          falta para a sequência zerar.</li>
          <li>Depois do Dia ${PASSE_DIAS} começa um ciclo novo, do Dia 1.</li>
          <li>Os dias <b>7, 14, 21 e 28</b> são baús, e o <b>Dia ${PASSE_DIAS}</b> é o lendário.</li>
        </ul>
        <h4>Passe Premium</h4>
        <p>O Passe Premium é comprado <b>à parte</b>: <b>ter VIP não dá o Passe Premium</b> — são dois
        produtos diferentes da Loja (a trilha Premium, aliás, traz dias de VIP entre os prêmios).</p>
        <p>Custa <b>${N(PASSE_VIP_PRECO, c.lang)} 💎</b> e vale <b>${PASSE_VIP_DIAS} dias corridos</b> a partir da
        compra. Enquanto ele vale, cada resgate entrega a recompensa <b>grátis E a Premium</b> do dia. Comprou
        depois de resgatar o grátis? O Premium de hoje sai na hora. O Premium <b>não é retroativo</b>: os dias
        que você resgatou antes da compra não ganham o Premium depois. Mas os ${PASSE_VIP_DIAS} dias contam
        da compra, então o que passar do Dia ${PASSE_DIAS} continua no ciclo seguinte: comprou no Dia 5,
        pega o Premium do Dia 5 ao 30 e depois do Dia 1 ao 4 do próximo ciclo. Se faltar um dia com o Premium
        ativo, a trilha volta ao Dia 1 e o relógio do Premium continua correndo. Comprar de novo
        <b>estende</b> 30 dias (até 90 acumulados).</p>
        ${tabelaTrilha}`,
        en: `
        <p>The <b>Pass</b> button, at the top next to the Market, is a <b>${PASSE_DIAS}-day login</b>
        track. Log in, claim the daily reward and move one step. Unlocks at level
        <b>${N(PASSE_NIVEL_MIN, c.lang)}</b>.</p>
        <ul>
          <li><b>One claim per day.</b> The day turns at <b>midnight Brasília time</b> (03:00 UTC).</li>
          <li><b>Miss a day and the track goes back to Day 1.</b> The screen shows a timer with how
          long until the streak resets.</li>
          <li>After Day ${PASSE_DIAS} a new cycle starts from Day 1.</li>
          <li>Days <b>7, 14, 21 and 28</b> are chests, and <b>Day ${PASSE_DIAS}</b> is the legendary one.</li>
        </ul>
        <h4>Premium Pass</h4>
        <p>The Premium Pass is bought <b>separately</b>: <b>having VIP does not give you the Premium
        Pass</b> — they are two different Shop products (the Premium track even includes some VIP days
        among its rewards).</p>
        <p>Costs <b>${N(PASSE_VIP_PRECO, c.lang)} 💎</b> and lasts <b>${PASSE_VIP_DIAS} calendar days</b> from the
        purchase. While it lasts, every claim gives the day's <b>free AND Premium</b> reward. Bought it after
        claiming the free one? Today's Premium reward comes right away. The Premium is <b>not retroactive</b>:
        days you claimed before buying don't get the Premium reward afterwards. But the ${PASSE_VIP_DIAS} days
        count from the purchase, so whatever goes past Day ${PASSE_DIAS} carries over to the next cycle: buy
        it on Day 5 and you get the Premium rewards from Day 5 to 30, then Day 1 to 4 of the next cycle.
        Miss a day with the Premium active and the track goes back to Day 1 while the Premium clock keeps
        running. Buying again <b>extends</b> it by 30 days (up to 90 stacked).</p>
        ${tabelaTrilha}`,
        es: `
        <p>El botón <b>Pase</b>, arriba junto al Market, es una pista de <b>${PASSE_DIAS} días de
        conexión</b>. Entra, reclama el premio del día y avanza un escalón. Se desbloquea en el nivel
        <b>${N(PASSE_NIVEL_MIN, c.lang)}</b>.</p>
        <ul>
          <li><b>Un reclamo por día.</b> El día cambia a la <b>medianoche de Brasilia</b> (03:00 UTC).</li>
          <li><b>Si faltas un día, la pista vuelve al Día 1.</b> La pantalla muestra un reloj con
          cuánto falta para que la racha se reinicie.</li>
          <li>Después del Día ${PASSE_DIAS} empieza un ciclo nuevo, desde el Día 1.</li>
          <li>Los días <b>7, 14, 21 y 28</b> son cofres, y el <b>Día ${PASSE_DIAS}</b> es el legendario.</li>
        </ul>
        <h4>Pase Premium</h4>
        <p>El Pase Premium se compra <b>aparte</b>: <b>tener VIP no da el Pase Premium</b> — son dos
        productos distintos de la Tienda (la ruta Premium, de hecho, trae días de VIP entre los premios).</p>
        <p>Cuesta <b>${N(PASSE_VIP_PRECO, c.lang)} 💎</b> y vale <b>${PASSE_VIP_DIAS} días corridos</b> desde la
        compra. Mientras vale, cada reclamo entrega la recompensa <b>gratis Y la Premium</b> del día. ¿Lo
        compraste después de reclamar la gratis? El Premium de hoy sale en el momento. El Premium <b>no es
        retroactivo</b>: los días que reclamaste antes de la compra no reciben el Premium después. Pero los
        ${PASSE_VIP_DIAS} días cuentan desde la compra, así que lo que pase del Día ${PASSE_DIAS} sigue en
        el ciclo siguiente: si lo compraste en el Día 5, recibes el Premium del Día 5 al 30 y luego del Día 1
        al 4 del próximo ciclo. Si faltas un día con el Premium activo, la pista vuelve al Día 1 y el reloj
        del Premium sigue corriendo. Comprar de nuevo <b>extiende</b> 30 días (hasta 90 acumulados).</p>
        ${tabelaTrilha}`,
      };
    },
  },

  // --------------------------------------------------------------- 18. gemas
  {
    id: 'gemas',
    titulo: { pt: 'Gemas: depósito e saque', en: 'Gems: deposit and withdrawal', es: 'Gemas: depósito y retiro' },
    grupo: 'economia',
    html: (c) => {
      const e = c.d.economia ?? {};
      // UMA rede, a que o servidor está de fato usando. Ver a nota no `welcome`: publicar as
      // outras que o validador conhece mandaria alguém depositar na rede errada.
      const redes = e.rede ?? 'Solana (SPL)';
      return {
        pt: `
        <p>A <b>Gema</b> é a única moeda do jogo que <b>volta a ser dinheiro</b>. Você a compra
        depositando <b>USDT</b> e a saca de volta em <b>USDT</b>, para a sua carteira ou direto
        para uma corretora (Binance, OKX, Bybit — qualquer uma que aceite USDT na rede escolhida).</p>

        <h4>Os preços</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Comprar 1 Gema</td><td class="wk-num">US$ ${e.orbCompraUsdt}</td></tr>
           <tr><td>Sacar 1 Gema</td><td class="wk-num">US$ ${e.orbSaqueUsdt}</td></tr>
           <tr><td>Spread (a diferença entre as duas pontas)</td><td class="wk-num destaque">${e.spreadPct}%</td></tr>
           <tr><td>Saque mínimo</td><td class="wk-num">${N(e.saqueMinimo, c.lang)} Gemas (US$ ${((e.saqueMinimo ?? 0) * (e.orbSaqueUsdt ?? 0)).toFixed(2)})</td></tr>
           <tr><td>Taxa de rede do saque</td><td>por conta do projeto</td></tr>
        `)}
        <p>Não há taxa por transação: o <b>spread de ${e.spreadPct}%</b> é a única cobrança, e é
        dele que saem servidor, desenvolvimento e a taxa de rede dos saques.</p>

        <h4>Como DEPOSITAR</h4>
        <ol class="wk-passos">
          <li>Abra <b>RMT → ↓ Depósito</b>: o RMT fica no menu do topo, e o <b>↓ Depósito</b>, ao lado do seu saldo de Gemas. O jogo mostra um <b>endereço só seu</b>, na rede
          ${redes}.</li>
          <li>Mande <b>USDT</b> desse endereço a partir da sua carteira ou corretora.
          <b>Confira a rede</b> — USDT existe em várias, e mandar pela errada perde o dinheiro.</li>
          <li>O jogo confirma o depósito automaticamente e credita as Gemas. Basta esperar as
          confirmações da rede.</li>
        </ol>
        ${nota(`<b>Mande só USDT, e só na rede indicada.</b> Qualquer outro token, ou o mesmo token
        noutra rede, cai num lugar de onde não há como recuperar. Isto vale para todo endereço de
        depósito de qualquer serviço — não é uma limitação nossa.`, 'aviso')}

        <h4>Como SACAR (inclusive direto para a Binance)</h4>
        <ol class="wk-passos">
          <li>Na sua corretora, vá em <b>Depositar → USDT</b> e escolha a rede
          <b>${redes}</b>. Copie o endereço de depósito que ela gerar.</li>
          <li>No jogo, abra <b>RMT → ↑ Withdraw</b>, cole esse endereço, escolha a mesma rede
          e diga quantas Gemas quer sacar (mínimo ${N(e.saqueMinimo, c.lang)}).</li>
          <li>Confira o endereço <b>caractere por caractere</b> na tela de confirmação. Uma
          transferência enviada <b>não tem como ser desfeita</b>.</li>
          <li>O pedido passa pela <b>aprovação da equipe</b> antes do envio — não há prazo
          garantido para ela. Você acompanha o status no extrato e, quando sair, recebe o
          <b>hash</b> da transação para conferir no explorador da rede. Enquanto ele não sair, dá
          para cancelar, e as Gemas voltam ao saldo.</li>
          <li>Se a equipe <b>recusar</b> o pedido, as Gemas voltam ao saldo na hora, e em <b>Meus
          saques</b> ele aparece como <b>recusado pela equipe</b>, com o <b>motivo</b> embaixo.</li>
        </ol>
        ${nota(`Se a sua corretora pedir um <b>MEMO/TAG</b> junto do endereço, ela <b>não</b> serve
        para este saque — o campo de memo não existe aqui. Use uma carteira própria e transfira de
        lá, ou escolha uma corretora que dê endereço sem memo.`, 'aviso')}

        <h4>A transparência do caixa</h4>
        <p>A carteira do projeto é pública. No painel de depósito você vê, em tempo real, quanto
        entrou, quanto saiu, quanto está em caixa e qual é o <b>passivo</b> — o que o projeto
        deveria se todo mundo sacasse tudo agora. É esse número que precisa ficar abaixo do caixa,
        e é por isso que ele está publicado.</p>
        ${nota(`<b>Gema nunca é dada de graça.</b> Não cai de drop, não vem de quest, não sai de
        boss. Toda Gema nasce de um depósito em USDT — é isso que mantém o caixa solvente. A única
        exceção é a <b>comissão de indicação</b>: quem trouxe o jogador recebe, em Gemas, uma parte do
        depósito dele, e essa parte é paga pela diferença entre o preço de compra e o de saque.`)}`,
        en: `
        <p>The <b>Gem</b> is the only in-game currency that <b>turns back into money</b>. You buy it
        by depositing <b>USDT</b> and withdraw it back as <b>USDT</b>, to your wallet or straight to
        an exchange (Binance, OKX, Bybit — any that accepts USDT on the chosen network).</p>

        <h4>The prices</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Buying 1 Gem</td><td class="wk-num">US$ ${e.orbCompraUsdt}</td></tr>
           <tr><td>Withdrawing 1 Gem</td><td class="wk-num">US$ ${e.orbSaqueUsdt}</td></tr>
           <tr><td>Spread (the gap between the two ends)</td><td class="wk-num destaque">${e.spreadPct}%</td></tr>
           <tr><td>Minimum withdrawal</td><td class="wk-num">${N(e.saqueMinimo, c.lang)} Gems (US$ ${((e.saqueMinimo ?? 0) * (e.orbSaqueUsdt ?? 0)).toFixed(2)})</td></tr>
           <tr><td>Withdrawal network fee</td><td>paid by the project</td></tr>
        `)}
        <p>There is no per-transaction fee: the <b>${e.spreadPct}% spread</b> is the only charge,
        and it pays for the servers, the development and the network fees on withdrawals.</p>

        <h4>How to DEPOSIT</h4>
        <ol class="wk-passos">
          <li>Open <b>RMT → ↓ Deposit</b>: RMT is on the top menu, and <b>↓ Deposit</b> sits next to your Gem balance. The game shows an <b>address that is yours alone</b>,
          on the ${redes} network.</li>
          <li>Send <b>USDT</b> to that address from your wallet or exchange. <b>Check the
          network</b> — USDT exists on several, and sending on the wrong one loses the money.</li>
          <li>The game confirms the deposit automatically and credits the Gems. Just wait for the
          network confirmations.</li>
        </ol>
        ${nota(`<b>Send only USDT, and only on the stated network.</b> Any other token, or the same
        token on another chain, lands somewhere it cannot be recovered from. This is true of every
        deposit address of every service — it is not a limitation of ours.`, 'aviso')}

        <h4>How to WITHDRAW (including straight to Binance)</h4>
        <ol class="wk-passos">
          <li>On your exchange, go to <b>Deposit → USDT</b> and pick the <b>${redes}</b>
          network. Copy the deposit address it generates.</li>
          <li>In the game, open <b>RMT → ↑ Withdraw</b>, paste that address, choose the same
          network and say how many Gems to withdraw (minimum ${N(e.saqueMinimo, c.lang)}).</li>
          <li>Check the address <b>character by character</b> on the confirmation screen. A sent
          transfer <b>cannot be undone</b>.</li>
          <li>The request goes through <b>approval by the team</b> before it is sent — there is no
          guaranteed deadline for it. You follow its status in the statement and, once it goes
          out, you get the transaction <b>hash</b> to check on the network explorer. Until it goes
          out, you can cancel it, and the Gems return to your balance.</li>
          <li>If the team <b>refuses</b> the request, the Gems return to your balance right away, and
          in <b>My withdrawals</b> it shows as <b>refused by the team</b>, with the <b>reason</b> below.</li>
        </ol>
        ${nota(`If your exchange asks for a <b>MEMO/TAG</b> alongside the address, it will <b>not</b>
        work for this withdrawal — there is no memo field here. Use your own wallet and transfer
        from there, or pick an exchange that gives a memo-free address.`, 'aviso')}

        <h4>Treasury transparency</h4>
        <p>The project wallet is public. On the deposit panel you see, live, how much came in, how
        much went out, how much is on hand and what the <b>liability</b> is — what the project would
        owe if everyone withdrew everything right now. That is the number that must stay below the
        balance, and that is why it is published.</p>
        ${nota(`<b>Gems are never given away.</b> They do not drop, they do not come from quests,
        they do not come from bosses. Every Gem is born from a USDT deposit — that is what keeps the
        treasury solvent. The one exception is the <b>referral commission</b>: whoever brought the player
        in receives, in Gems, a share of their deposit, and that share is paid for by the gap between the
        buy price and the withdrawal price.`)}`,
        es: `
        <p>La <b>Gema</b> es la única moneda del juego que <b>vuelve a ser dinero</b>. La compras
        depositando <b>USDT</b> y la retiras de nuevo en <b>USDT</b>, a tu cartera o directo a un
        exchange (Binance, OKX, Bybit — cualquiera que acepte USDT en la red elegida).</p>

        <h4>Los precios</h4>
        ${tabela(
          [c.r.regra, c.r.valor],
          `<tr><td>Comprar 1 Gema</td><td class="wk-num">US$ ${e.orbCompraUsdt}</td></tr>
           <tr><td>Retirar 1 Gema</td><td class="wk-num">US$ ${e.orbSaqueUsdt}</td></tr>
           <tr><td>Spread (la diferencia entre las dos puntas)</td><td class="wk-num destaque">${e.spreadPct}%</td></tr>
           <tr><td>Retiro mínimo</td><td class="wk-num">${N(e.saqueMinimo, c.lang)} Gemas (US$ ${((e.saqueMinimo ?? 0) * (e.orbSaqueUsdt ?? 0)).toFixed(2)})</td></tr>
           <tr><td>Comisión de red del retiro</td><td>a cargo del proyecto</td></tr>
        `)}
        <p>No hay comisión por transacción: el <b>spread del ${e.spreadPct}%</b> es el único cobro, y
        de él salen el servidor, el desarrollo y la comisión de red de los retiros.</p>

        <h4>Cómo DEPOSITAR</h4>
        <ol class="wk-passos">
          <li>Abre <b>RMT → ↓ Depósito</b>: el RMT está en el menú de arriba, y el <b>↓ Depósito</b>, junto a tu saldo de Gemas. El juego muestra una <b>dirección solo tuya</b>, en
          la red ${redes}.</li>
          <li>Envía <b>USDT</b> a esa dirección desde tu cartera o exchange. <b>Verifica la red</b> —
          USDT existe en varias, y enviar por la equivocada pierde el dinero.</li>
          <li>El juego confirma el depósito automáticamente y acredita las Gemas. Solo hay que
          esperar las confirmaciones de la red.</li>
        </ol>
        ${nota(`<b>Envía solo USDT, y solo en la red indicada.</b> Cualquier otro token, o el mismo
        token en otra red, cae en un lugar del que no hay forma de recuperarlo. Esto vale para toda
        dirección de depósito de cualquier servicio — no es una limitación nuestra.`, 'aviso')}

        <h4>Cómo RETIRAR (incluso directo a Binance)</h4>
        <ol class="wk-passos">
          <li>En tu exchange, ve a <b>Depositar → USDT</b> y elige la red
          <b>${redes}</b>. Copia la dirección de depósito que genere.</li>
          <li>En el juego, abre <b>RMT → ↑ Withdraw</b>, pega esa dirección, elige la misma red y
          di cuántas Gemas quieres retirar (mínimo ${N(e.saqueMinimo, c.lang)}).</li>
          <li>Revisa la dirección <b>carácter por carácter</b> en la pantalla de confirmación. Una
          transferencia enviada <b>no se puede deshacer</b>.</li>
          <li>El pedido pasa por la <b>aprobación del equipo</b> antes del envío; no hay un plazo
          garantizado para ella. Sigues el estado en el extracto y, cuando salga, recibes el
          <b>hash</b> de la transacción para verificarlo en el explorador de la red. Mientras no
          salga, puedes cancelarlo, y las Gemas vuelven a tu saldo.</li>
          <li>Si el equipo <b>rechaza</b> el pedido, las Gemas vuelven a tu saldo en el acto, y en
          <b>Mis retiros</b> aparece como <b>rechazado por el equipo</b>, con el <b>motivo</b> debajo.</li>
        </ol>
        ${nota(`Si tu exchange pide un <b>MEMO/TAG</b> junto con la dirección, <b>no</b> sirve para
        este retiro — aquí no existe el campo de memo. Usa una cartera propia y transfiere desde
        allí, o elige un exchange que dé dirección sin memo.`, 'aviso')}

        <h4>La transparencia de la caja</h4>
        <p>La cartera del proyecto es pública. En el panel de depósito ves, en tiempo real, cuánto
        entró, cuánto salió, cuánto hay en caja y cuál es el <b>pasivo</b> — lo que el proyecto
        debería si todos retiraran todo ahora. Ese número es el que tiene que quedar por debajo de la
        caja, y por eso está publicado.</p>
        ${nota(`<b>La Gema nunca se regala.</b> No cae de drop, no viene de misiones, no sale de
        bosses. Toda Gema nace de un depósito en USDT — eso es lo que mantiene la caja solvente. La
        única excepción es la <b>comisión de referido</b>: quien trajo al jugador recibe, en Gemas, una
        parte de su depósito, y esa parte la paga la diferencia entre el precio de compra y el de retiro.`)}`,
      };
    },
  },

  // --------------------------------------------------------------- 19. taxas
  {
    id: 'taxas',
    titulo: { pt: 'Todas as taxas', en: 'Every fee', es: 'Todas las comisiones' },
    grupo: 'economia',
    html: (c) => ({
      pt: `
        <p>Tudo que o jogo desconta, num quadro só. Se não está aqui, não é cobrado.</p>
        ${tabelaDeTaxas(c)}
        ${nota(`<b>O <a data-cap="market">Market</a> do NPC não cobra nada</b>: compra e venda pelo
        valor de catálogo. As comissões moram no <a data-cap="comunidade">Mercado da
        Comunidade</a> e saem do VENDEDOR, só quando a venda acontece:
        ${c.d.economia?.taxaMercadoGoldPct ?? 15}% nos anúncios em ouro, ${pctTx(TAXA_ORB_PLANA * 100)}% nos de item
        e diamante em Gema, e ${faixasOrbTexto('pt')} no POKÉMON em Gema — por faixa, como imposto
        de renda, e quanto maior a venda menor a taxa efetiva. A de ouro é a mesma da transferência de Coins entre amigos, de propósito:
        assim o Mercado não vira um caminho mais barato para passar ouro. A pensão vale só para pokémon
        anunciado e é paga à vista, na hora de publicar.`)}`,
      en: `
        <p>Everything the game deducts, in a single table. If it is not here, it is not charged.</p>
        ${tabelaDeTaxas(c)}
        ${nota(`<b>The NPC <a data-cap="market">Market</a> charges nothing</b>: buying and selling
        are at catalogue value. The commissions live on the
        <a data-cap="comunidade">Community Market</a> and come out of the SELLER, only when the
        sale happens: ${c.d.economia?.taxaMercadoGoldPct ?? 15}% on gold listings, ${pctTx(TAXA_ORB_PLANA * 100)}% on items and
        diamonds in Gems, and ${faixasOrbTexto('en')} on a POKÉMON in Gems — tiered like income
        tax, so the bigger the sale the lower the effective fee. The gold one matches the Coins transfer between friends on
        purpose, so the Market is not a cheaper way to move gold. Boarding applies only to listed pokémon and
        is paid up front, when you publish.`)}`,
      es: `
        <p>Todo lo que el juego descuenta, en un solo cuadro. Si no está aquí, no se cobra.</p>
        ${tabelaDeTaxas(c)}
        ${nota(`<b>El <a data-cap="market">Market</a> del NPC no cobra nada</b>: compra y venta al
        valor de catálogo. Las comisiones viven en el <a data-cap="comunidade">Mercado de la
        Comunidad</a> y salen del VENDEDOR, solo cuando la venta ocurre:
        ${c.d.economia?.taxaMercadoGoldPct ?? 15}% en los anuncios en oro, ${pctTx(TAXA_ORB_PLANA * 100)}% en objetos y
        diamantes en Gemas, y ${faixasOrbTexto('es')} en el POKÉMON en Gemas — por tramos, como el
        impuesto a la renta: cuanto mayor la venta, menor la tasa efectiva. La de oro es la misma de la transferencia de Coins entre
        amigos, a propósito. La pensión vale solo para
        pokémon anunciados y se paga por adelantado, al publicar.`)}`,
    }),
  },
];

/** Os grupos da barra lateral, na ordem. */
export const GRUPOS = {
  basico: { pt: 'O básico', en: 'The basics', es: 'Lo básico' },
  luta: { pt: 'Luta e captura', en: 'Fighting and catching', es: 'Combate y captura' },
  mundo: { pt: 'O mundo', en: 'The world', es: 'El mundo' },
  economia: { pt: 'Economia e dinheiro', en: 'Economy and money', es: 'Economía y dinero' },
};

/**
 * Monta o HTML de um capítulo na língua pedida.
 *
 * `dados` é o que veio do `welcome` — o app.js passa `estado` inteiro por conveniência, e o
 * módulo só lê o que precisa. Uma língua que não exista cai no português, que é a mesma regra
 * do `t()`.
 */
export function corpoDoCapitulo(id, lang, dados) {
  const cap = CAPITULOS.find((x) => x.id === id);
  if (!cap) return '';
  const l = ROTULOS[lang] ? lang : 'pt';
  const c = { lang: l, r: ROTULOS[l], d: dados ?? {} };
  const partes = cap.html(c);
  // O capítulo devolve `{ pt, en, es }`. Um que já escolheu a língua (`{…}[c.lang]`) chega
  // aqui como texto — foi o que apagou o Passe e o PvP amistoso inteiros, com um "undefined".
  if (typeof partes === 'string') return partes;
  return partes?.[l] ?? partes?.pt ?? '';
}

export const tituloDoCapitulo = (id, lang) => {
  const cap = CAPITULOS.find((x) => x.id === id);
  return cap ? (cap.titulo[lang] ?? cap.titulo.pt) : '';
};

export const tituloDoGrupo = (id, lang) => GRUPOS[id]?.[lang] ?? GRUPOS[id]?.pt ?? id;

// ------------------------------------------------------- a Wiki inteira em texto
//
// Serve ao botão "Copiar toda a Wiki" — o jogador leva o manual para um assistente e estuda
// lá, perguntando o que quiser.
//
// A saída é MARKDOWN, e não o HTML cru nem texto corrido. Um modelo de linguagem lê os dois,
// mas a estrutura é metade do conteúdo aqui: `## Bosses` diz de que capítulo veio a resposta,
// e uma tabela em pipes preserva a relação entre "Bronze" e "1 / 2.000" que o texto corrido
// desmancha em duas palavras soltas na mesma linha.
//
// E o manual é montado a partir do `welcome`, então o que sai daqui não é a documentação
// genérica do jogo: são os NÚMEROS que estão valendo neste servidor, hoje.

/**
 * Espaço em branco de um nó de TEXTO, colapsado do jeito que o HTML faz.
 *
 * Só aqui, e não na junção dos pedaços: as quebras de linha que este arquivo GERA (o `\n\n`
 * de `bloco`, o `\n` entre itens de lista, as linhas de uma tabela) são estrutura de Markdown
 * e precisam sobreviver. As que vêm do HTML são indentação do código-fonte e viram espaço.
 */
const textoLimpo = (s) => String(s).replace(/[ \t\r\n]+/g, ' ');

/** Junta pedaços já normalizados. */
const juntar = (partes) => partes.join('');

/** Um bloco: garante linha em branco antes e depois, sem acumular três seguidas. */
const bloco = (txt) => `\n\n${txt.trim()}\n\n`;

/**
 * Uma `<table>` em Markdown.
 *
 * A linha de separação (`| --- |`) é obrigatória para um leitor entender que aquilo é tabela,
 * e o número de colunas dela tem de bater com o cabeçalho — por isso as células são contadas
 * na primeira linha e não em cada uma.
 */
function tabelaEmMarkdown(tabelaEl, texto) {
  const linhas = [...tabelaEl.querySelectorAll('tr')]
    .map((tr) => [...tr.children].map((celula) => texto(celula).trim().replace(/\|/g, '\\|')))
    .filter((cels) => cels.length);
  if (!linhas.length) return '';

  const colunas = linhas[0].length;
  // Sem `<thead>` a primeira linha vira cabeçalho assim mesmo: uma tabela em Markdown não
  // existe sem ele, e a primeira linha é o cabeçalho em todas as tabelas deste manual.
  const saida = [
    `| ${linhas[0].join(' | ')} |`,
    `| ${Array.from({ length: colunas }, () => '---').join(' | ')} |`,
    ...linhas.slice(1).map((cels) => `| ${cels.join(' | ')} |`),
  ];
  return bloco(saida.join('\n'));
}

/**
 * O HTML de um capítulo virado Markdown, andando no DOM em vez de raspar com expressão
 * regular — o navegador já sabe casar as tags, e uma `<b>` dentro de uma `<td>` dentro de uma
 * `<table>` é exatamente o caso em que raspar erra.
 */
function htmlEmMarkdown(html) {
  const raiz = document.createElement('div');
  raiz.innerHTML = html;

  const texto = (no) => {
    if (no.nodeType === 3) return textoLimpo(no.nodeValue); // texto puro
    if (no.nodeType !== 1) return '';
    const filhos = () => juntar([...no.childNodes].map(texto));

    switch (no.tagName) {
      case 'BR': return '\n';
      case 'B': case 'STRONG': return `**${filhos().trim()}**`;
      case 'I': case 'EM': return `*${filhos().trim()}*`;
      case 'CODE': return `\`${filhos().trim()}\``;
      case 'PRE': return bloco(`\`\`\`\n${[...no.childNodes].map(texto).join('').trim()}\n\`\`\``);
      case 'H2': case 'H3': case 'H4': case 'H5': return bloco(`### ${filhos().trim()}`);
      case 'P': return bloco(filhos().trim());
      case 'TABLE': return tabelaEmMarkdown(no, texto);
      // As linhas e células saem pela tabela; alcançadas por fora, viram texto e nada mais.
      case 'THEAD': case 'TBODY': case 'TR': case 'TD': case 'TH': return filhos();
      case 'UL': case 'OL': {
        const ordenada = no.tagName === 'OL';
        const itens = [...no.children]
          .filter((f) => f.tagName === 'LI')
          .map((f, i) => `${ordenada ? `${i + 1}.` : '-'} ${juntar([...f.childNodes].map(texto)).trim()}`);
        return itens.length ? bloco(itens.join('\n')) : '';
      }
      case 'LI': return `- ${filhos().trim()}\n`; // `<li>` solto, fora de lista
      case 'A': {
        // Link INTERNO do manual (`data-cap`): o destino não é uma URL, é outro capítulo —
        // e o texto do link já é o nome dele. Vira menção, não endereço quebrado.
        const t = filhos().trim();
        const href = no.getAttribute('href');
        return href && !no.dataset.cap ? `[${t}](${href})` : t;
      }
      default:
        // As caixas de destaque (`.wk-nota`) são o "preste atenção nisto" de cada capítulo, e
        // citação é como o Markdown diz isso.
        if (no.classList?.contains('wk-nota')) {
          return bloco(filhos().trim().split('\n').map((l) => `> ${l}`).join('\n'));
        }
        return filhos();
    }
  };

  return juntar([...raiz.childNodes].map(texto))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * A Wiki inteira, na língua pedida, com os números deste servidor.
 *
 * `cabecalho` é a linha de instrução que vai na frente (quem está lendo, e para quê) — o
 * app.js a traduz, porque ela é rótulo de interface e não conteúdo do manual.
 */
export function wikiEmTexto(lang, dados, cabecalho = '') {
  const l = ROTULOS[lang] ? lang : 'pt';
  const partes = [];
  if (cabecalho) partes.push(cabecalho, '');

  let grupoAberto = null;
  for (const cap of CAPITULOS) {
    if (cap.grupo !== grupoAberto) {
      grupoAberto = cap.grupo;
      partes.push(`\n# ${tituloDoGrupo(cap.grupo, l)}`);
    }
    partes.push(`\n## ${tituloDoCapitulo(cap.id, l)}`, '', htmlEmMarkdown(corpoDoCapitulo(cap.id, l, dados)));
  }
  return partes.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
