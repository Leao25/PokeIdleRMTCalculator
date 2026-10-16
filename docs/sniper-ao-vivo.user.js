// ==UserScript==
// @name         RMT Calculator: Sniper ao vivo
// @namespace    pokeidle-rmt-calculator
// @version      1.3.6
// @description  Painel no PokeIdle que olha o Mercado de tempos em tempos e avisa quando aparece pokémon ou item bem abaixo do preço de referência. Não compra nada sozinho.
// @match        https://pokeidle.io/app*
// @run-at       document-start
// @sandbox      JavaScript
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      pokeidle-rmt-calculator.vercel.app
// @require      https://pokeidle-rmt-calculator.vercel.app/preco.js?v=6
// @downloadURL  https://pokeidle-rmt-calculator.vercel.app/sniper-ao-vivo.user.js
// @updateURL    https://pokeidle-rmt-calculator.vercel.app/sniper-ao-vivo.user.js
// ==/UserScript==

// Como funciona
// · Usa a SUA sessão do jogo (a aba aberta): não entra com outra conta e não pausa nada.
// · A cada intervalo (padrão 60 s) pede ao jogo as mesmas telas que você abriria no Mercado:
//   a vitrine de itens (menor preço e média de 7 dias de cada item) e os 48 anúncios de pokémon
//   mais recentes (2 páginas). Com o Mercado aberto na sua tela, pula os anúncios de pokémon para não mexer
//   no que você está vendo.
// · Compara com o PREÇO JUSTO do RMT Calculator, com a mesma conta do site (preco.js, via @require):
//   baixa as vendas dos últimos 30 dias uma vez por hora e avalia cada anúncio como o Avaliar faria.
//   Enquanto as vendas não chegam, usa a referência resumida (referencia.json).
// · Mostra as pechinchas num painel no canto da tela. "Ver anúncio" abre o anúncio no jogo, como
//   o link do chat. Comprar é com você.
(function () {
  'use strict';
  const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const SITE = 'https://pokeidle-rmt-calculator.vercel.app';
  const CHAVE = 'rmtSniperAoVivo';

  // ---------- o socket do jogo: guardado quando o jogo o cria ----------
  let socket = null;
  // quem é você: o nick sai no login (hello) e o id na entrada (welcome); seus anúncios ficam fora da lista
  let meuNick = null, meuId = null;
  const WSOriginal = W.WebSocket;
  function WSComGancho(...args) {
    const ws = new WSOriginal(...args);
    if (String(args[0] || '').includes(W.location.host)) {
      socket = ws;
      const enviarOriginal = ws.send;
      ws.send = function (d) { try { const o = JSON.parse(d); if (o?.t === 'hello' && o.nick) meuNick = String(o.nick); } catch (e) { /* não é JSON */ } return enviarOriginal.call(this, d); };
      ws.addEventListener('message', (ev) => { try { aoReceber(JSON.parse(ev.data)); } catch (e) { /* não é JSON */ } });
    }
    return ws;
  }
  WSComGancho.prototype = WSOriginal.prototype;
  for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) WSComGancho[k] = WSOriginal[k];
  W.WebSocket = WSComGancho;
  const enviar = (msg) => { if (socket && socket.readyState === 1) { socket.send(JSON.stringify(msg)); return true; } return false; };

  // ---------- configuração ----------
  const cfg = Object.assign({ ligado: true, intervalo: 60, lucroMin: 0.3, revenda: 'justo', som: true, alvo: 'pokemon', moeda: 'orb', minimizado: false, semOutland: false },
    (() => { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } })());
  if (cfg.alvo !== 'pokemon' && cfg.alvo !== 'itens') cfg.alvo = 'pokemon';
  if (!['rapido', 'justo', 'paciencia'].includes(cfg.revenda)) cfg.revenda = 'justo';
  if (!(cfg.lucroMin > 0)) cfg.lucroMin = 0.3;
  // anúncios que você mandou esconder ("ok"): não voltam (os 300 últimos)
  const ignorados = new Set(Array.isArray(cfg.ignorados) ? cfg.ignorados : []);
  const ignorar = (k) => { ignorados.add(k); cfg.ignorados = [...ignorados].slice(-300); };
  if (cfg.moeda !== 'gold' && cfg.moeda !== 'orb') cfg.moeda = 'orb';
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(cfg)); } catch (e) { /* sem armazenamento */ } };

  // ---------- referência de preços (do site, de hora em hora) ----------
  let ref = null, refEm = 0;
  function baixarReferencia() {
    GM_xmlhttpRequest({
      method: 'GET', url: `${SITE}/dados/referencia.json?t=${Date.now()}`,
      onload: (r) => { try { ref = JSON.parse(r.responseText); refEm = Date.now(); pintar(); } catch (e) { /* tenta na próxima */ } },
    });
  }
  /**
   * Preço de referência de um anúncio, na moeda do anúncio, com a mesma ideia do preço justo do site:
   * a mediana da espécie (mesmo shiny e potência) levada ao nível do anúncio e, quando a espécie
   * quase não tem vendas perto desse nível, misturada com o que pokémon de QUALQUER espécie, do
   * mesmo shiny e potência, venderam naquela faixa de nível. Sem isso, um Glaceon Nv 453 era avaliado
   * pelos de Nv 100 vezes 4,5.
   */
  const faixaDoNivel = (n) => Math.round(2 * Math.log2(Math.max(1, n)));

  // ---------- o mesmo preço justo do site (preco.js) ----------
  const st = { moeda: 'gemas', rate: 3e6, dias: 30, taxaPk: null };
  const P = typeof criarPreco === 'function' ? criarPreco(st) : null;
  let hist = null, histEm = 0;
  const pegarJson = (url) => new Promise((ok, falha) => GM_xmlhttpRequest({ method: 'GET', url: `${SITE}/${url}?t=${Date.now()}`, onload: (r) => { try { ok(JSON.parse(r.responseText)); } catch (e) { falha(e); } }, onerror: falha }));
  async function baixarHistorico() {
    if (!P) return;
    try {
      const idx = await pegarJson('dados/indice.json');
      const meses = await Promise.all(idx.meses.slice(-2).map((m) => pegarJson(`dados/${m}.json`)));
      const todas = meses.flatMap((m) => m.vendas.map((v) => P.venda(...v)));
      const fim = Math.max(...todas.map((s) => s.min)), base = todas.filter((s) => s.min >= fim - 30 * 1440);
      if (idx.cotacao?.coinsPorGema > 0) st.rate = Math.round(idx.cotacao.coinsPorGema / 1000) * 1000;
      P.limparCaches();
      st.taxaPk = P.taxaPokemon(base);
      const kept = {};
      for (const m of ['coins', 'gemas']) { st.moeda = m; kept[m] = P.limpar(base.map((s) => ({ ...s }))).kept; }
      hist = { kept, fim, n: base.length, vendas30: P.vendasPorEspecie(base, fim) }; histEm = Date.now();
      pintar();
    } catch (e) { /* tenta na próxima hora */ }
  }
  function precoJusto(a) {
    const f = a.ficha;
    if (!hist || !f) return null;
    const moeda = a.moeda === 'gold' ? 'coins' : 'gemas';
    st.moeda = moeda;
    const ficha = { species: f.nome, shiny: !!f.shiny, lvl: f.level, pot: f.potencia || 1, nota: f.nota != null ? Number(f.nota) : NaN,
      q: f.quality != null ? Number(f.quality) : NaN, iv: f.ivTotal != null ? Number(f.ivTotal) : NaN, mega: /^mega\s/i.test(String(f.nome)) };
    const est = P.estimate(ficha, hist.kept[moeda], hist.fim);
    if (!(est.p50 > 0) || !est.sameMatch.length) return null;
    // na unidade interna, Coins vêm ÷ cotação do diamante (como o site exibe): volta para Coins
    const emMoeda = (v) => (moeda === 'coins' ? v * st.rate : v);
    const pr = P.procura(hist.vendas30.get(P.norm(f.nome) + '|' + (f.shiny ? 1 : 0)) || 0, ref?.abertos?.[`${f.nome}|${f.shiny ? 1 : 0}`] ?? 0);
    return { valor: emMoeda(est.p50), p25: emMoeda(est.p25), p75: emMoeda(est.p75), n: est.sameMatch.length, convertido: false, misturado: !!est.ref, nPerto: est.ref?.nPerto, mesmaConta: true,
      procura: pr, ficha: { species: f.nome, lvl: f.level, pot: f.potencia || 1, nota: ficha.nota, q: ficha.q, iv: ficha.iv, shiny: !!f.shiny, moeda } };
  }

  /** Abre o Avaliar do site com a ficha do anúncio já preenchida (?f=… em base64). */
  function abrirLaudo(x) {
    if (!x?.laudo) return;
    const j = JSON.stringify(x.laudo);
    const b64 = btoa(unescape(encodeURIComponent(j))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    W.open(`${SITE}/?f=${b64}#avaliar`, '_blank', 'noopener');
  }

  function referenciaDe(a) {
    const justo = precoJusto(a);
    if (justo) return justo;
    const f = a.ficha;
    if (!ref || !f) return null;
    const sh = f.shiny ? 1 : 0, pot = f.potencia || 1, L = f.level || 1;
    const g = ref.pk[`${f.nome}|${sh}|${pot}`];
    if (!g) return null;
    const moeda = a.moeda === 'gold' ? 'gold' : 'orb', outra = moeda === 'gold' ? 'orb' : 'gold';
    const taxa = (f.shiny ? ref.taxa?.shiny : ref.taxa?.comum) || ref.taxa?.diamante;
    const converter = (v) => (moeda === 'gold' ? v * taxa : v / taxa);
    // no comum o preço acompanha o nível; no shiny quase não
    const beta = f.shiny ? 0.1 : 1;
    const estica = (p, lv) => p * Math.min(8, Math.max(1 / 8, (L / Math.max(1, lv)) ** beta));
    // com 3+ vendas de nível parecido (×1,4 para cima ou para baixo), vale a mediana delas, levadas ao
    // nível do anúncio; senão, a mediana geral esticada pelo nível
    const noNivel = (lado) => {
      const perto = (lado.pts || []).filter(([lv]) => lv >= L / 1.4 && lv <= L * 1.4).map(([lv, p]) => estica(p, lv)).sort((x, y) => x - y);
      return perto.length >= 3 ? perto[perto.length >> 1] : estica(lado.med, lado.lvl);
    };
    let esp = null, niveis = [], convertido = false, n = 0;
    if (g[moeda]?.n >= 3) { esp = noNivel(g[moeda]); niveis = g[moeda].niveis || []; n = g[moeda].n; }
    else if (g[outra]?.n >= 3 && taxa) { esp = converter(noNivel(g[outra])); niveis = g[outra].niveis || []; n = g[outra].n; convertido = true; }
    if (esp == null) return null;
    const fx = ref.faixa?.[`${sh}|${pot}|${faixaDoNivel(L)}`];
    const porFaixa = fx?.[moeda]?.med ?? (fx?.[outra]?.med && taxa ? converter(fx[outra].med) : null);
    const nPerto = niveis.filter((x) => x >= L / 1.4 && x <= L * 1.4).length;
    const pesoEspecie = nPerto / (nPerto + 3);
    if (porFaixa == null || pesoEspecie >= 0.75) return { valor: esp, n, convertido, misturado: false };
    return { valor: Math.exp(pesoEspecie * Math.log(esp) + (1 - pesoEspecie) * Math.log(porFaixa)), n, convertido, misturado: true, nPerto };
  }

  // ---------- o que o jogo responde ----------
  const achados = new Map(); // chave -> achado
  // as 2 primeiras páginas da vitrine, em "mais recentes" (48 anúncios): a 1ª, e a 2ª logo depois dela
  const PAGINAS = 2;
  let ultimaLeitura = 0, pediuAnuncios = false, paginaPedida = 0;
  const pedirPagina = (pagina) => { paginaPedida = pagina; return enviar({ t: 'market.listar', tipo: 'pokemon', moeda: cfg.moeda, busca: '', ordem: 'recentes', criterios: [], elemento: '', categoria: '',
    soShiny: false, soP5: false, soTmElemental: false, soTmAoe: false, semOutland: false, pagina, especieId: 0 }); };
  let calmaAte = 0; // o jogo pediu calma: até essa hora, uma leitura por minuto
  function aoReceber(m) {
    if (m.t === 'welcome') {
      const eu = m.estado?.eu ?? m.eu;
      if (eu?.id != null) meuId = eu.id;
      if (eu?.nick) meuNick = String(eu.nick);
      for (const [k, x] of achados) if ((meuId != null && x.vendedorId === meuId) || (meuNick && x.vendedor === meuNick)) achados.delete(k);
      return;
    }
    if (m.t === 'erro' && /devagar|muitas mensagens/i.test(String(m.chave ?? m.msg ?? ''))) { calmaAte = Date.now() + 120e3; pintar(); return; }
    if (m.t !== 'market') return;
    if (m.aba === 'anuncio' && m.id != null) {
      const a = m.anuncio;
      if (!a || a.estado !== 'aberto') { achados.delete(`pk:${m.id}`); pintar(); }
      else { const x = achados.get(`pk:${m.id}`); if (x) { x.conferido = Date.now(); if (a.preco > 0 && a.preco !== x.preco) { x.preco = a.preco; x.desc = 1 - a.preco / x.ref; if (lucroDe(x, 'paciencia').pct < cfg.lucroMin) achados.delete(`pk:${m.id}`); } pintar(); } }
      return;
    }
    if (m.aba === 'itens' && m.resumo) { avaliarItens(m.resumo, m.medias || {}); ultimaLeitura = Date.now(); pintar(); }
    if (m.aba === 'vitrine' && pediuAnuncios && (m.pagina ?? 0) === paginaPedida) {
      avaliarAnuncios(m.linhas || []); ultimaLeitura = Date.now(); pintar();
      // tem mais página e ainda não chegou na última que lemos? pede a próxima (com folga, pelo limite do jogo)
      if (paginaPedida + 1 < PAGINAS && (m.linhas?.length ?? 0) >= 24) setTimeout(() => { if (!pedirPagina(paginaPedida + 1)) pediuAnuncios = false; }, 1200);
      else pediuAnuncios = false;
    }
  }
  function novoAchado(chave, dados) {
    const ja = achados.get(chave);
    if (ja) { Object.assign(ja, dados, { visto: Date.now() }); return; }
    achados.set(chave, { ...dados, primeiro: Date.now(), visto: Date.now(), novo: true });
    if (cfg.som && passa(achados.get(chave))) apitar();
  }
  function avaliarItens(resumo, medias) {
    if (cfg.alvo !== 'itens') return;
    for (const [id, r] of Object.entries(resumo)) {
      const md = medias[id] || {};
      for (const [moeda, min, media, vendidos] of [['gold', r.minGold, md.gold?.media, md.gold?.unidades], ['orb', r.minOrb, md.orb?.media, md.orb?.unidades]].filter((x) => x[0] === cfg.moeda)) {
        if (!(min > 0) || !(media > 0) || !(vendidos >= 20)) continue; // só item que vende de verdade nessa moeda
        if (moeda === 'orb' && media < 5) continue; // em Gemas, item de 2–3 Gemas não tem desconto possível
        const desc = 1 - min / media;
        const chave = `item:${id}:${moeda}`;
        const cand = { tipo: 'item', id: +id, nome: nomeItem(id), moeda, preco: min, ref: media, desc, extra: `${fmt(vendidos)} vendidos em 7 dias` };
        if (ignorados.has(chave)) continue;
        if (lucroDe(cand, 'paciencia').pct >= cfg.lucroMin) novoAchado(chave, cand);
        else achados.delete(chave); // o preço voltou ao normal: some da lista
      }
    }
  }
  // variantes de Outland (Brave, Furious, Toxic…): #2001–#2999 no jogo, ou pelo nome (lista do site)
  const OUTLAND_RESERVA = ['Brave', 'Tribal', 'Ancient', 'War', 'Furious', 'Enigmatic', 'Charged', 'Magnetic', 'Evil', 'Freezing', 'Psy', 'Heavy', 'Milch-Miltank', 'Roll', 'Hard', 'Brute', 'Enraged', 'Dark', 'Trickmaster', 'Banshee', 'Taekwondo', 'Magma', 'Toxic'];
  function ehOutland(f) {
    const id = Number(f.speciesId);
    if (id >= 2001 && id < 3000) return true;
    if (Array.isArray(ref?.outland) && ref.outland.length) return ref.outland.includes(f.nome);
    return id > 0 ? false : OUTLAND_RESERVA.includes(String(f.nome).split(' ')[0]) && String(f.nome).includes(' ');
  }
  function avaliarAnuncios(linhas) {
    if (cfg.alvo !== 'pokemon') return;
    for (const a of linhas) {
      if (a.tipo !== 'pokemon' || !a.ficha || a.estado !== 'aberto') continue;
      if ((a.moeda === 'gold' ? 'gold' : 'orb') !== cfg.moeda) continue;
      if (cfg.semOutland && ehOutland(a.ficha)) continue;
      if ((meuId != null && a.vendedorId === meuId) || (meuNick && a.vendedor === meuNick)) { achados.delete(`pk:${a.id}`); continue; } // seu anúncio
      if (ignorados.has(`pk:${a.id}`)) continue; // você apertou "ok"
      const r = referenciaDe(a);
      if (!r || !(a.preco > 0)) continue;
      const desc = 1 - a.preco / r.valor;
      const moedaA = a.moeda === 'gold' ? 'gold' : 'orb';
      // guarda se daria lucro mínimo revendendo pelo MAIOR alvo (Paciência); a escolha atual filtra na tela
      if (lucroDe({ tipo: 'pokemon', moeda: moedaA, preco: a.preco, ref: r.valor, p25: r.p25, p75: r.p75 }, 'paciencia').pct < cfg.lucroMin) continue;
      const f = a.ficha;
      novoAchado(`pk:${a.id}`, {
        tipo: 'pokemon', outland: ehOutland(f), id: a.id, nome: `${f.shiny ? '✨ ' : ''}${f.nome}`, moeda: a.moeda === 'gold' ? 'gold' : 'orb', preco: a.preco, ref: r.valor, desc,
        p25: r.p25, p75: r.p75, procura: r.procura, laudo: r.ficha, vendedorId: a.vendedorId, vendedor: a.vendedor,
        extra: `P${f.potencia || 1} · Nv ${fmt(f.level)} · nota ${f.nota != null ? String(f.nota).replace('.', ',') : '—'}${r.convertido ? ' · ref. da outra moeda' : ''}${r.misturado ? ` · ${r.nPerto ? 'poucas' : 'nenhuma'} venda${r.nPerto === 1 ? '' : 's'} da espécie nesse nível` : ''}${desc >= 0.9 ? ' · ⚠ bom demais' : ''}`,
      });
    }
  }
  // nomes de item: o próprio jogo mostra no Mercado; aqui, os mais comuns pelo id da vitrine
  let nomesItem = {};
  GM_xmlhttpRequest({ method: 'GET', url: `${SITE}/dados/itens.json`, onload: (r) => { try { const d = JSON.parse(r.responseText); for (const [id, x] of Object.entries(d.itens || {})) nomesItem[id] = x.nome; } catch (e) { /* sem nomes */ } } });
  const nomeItem = (id) => nomesItem[id] || `Item ${id}`;

  /**
   * Abre o anúncio no jogo pelo mesmo caminho do link do alto-falante no chat: o jogo só mostra
   * um anúncio que ele mesmo pediu, então o script cria um link de anúncio invisível dentro do
   * chat e clica nele.
   */
  function abrirAnuncio(id) {
    const chat = document.querySelector('#chat-msgs');
    if (!chat || !(id > 0)) return;
    const link = document.createElement('span');
    link.className = 'm-anuncio-link';
    link.dataset.anuncio = String(id);
    link.style.display = 'none';
    chat.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * O que sobra revendendo pela referência, depois da comissão (sai do vendedor; wiki, A comissão):
   * pokémon em Gema paga por faixa (13% até 500, 10% até 5.000, 7,5% acima); em Coins e item em
   * Gema, 15%.
   */
  /** Por quanto revender, conforme a escolha (Rápido = p25 do laudo, Justo = p50, Paciência = p75). Item: média de 7 dias. */
  const alvoRevenda = (x, qual = cfg.revenda) => (x.tipo === 'pokemon' && x.p25 ? (qual === 'rapido' ? x.p25 : qual === 'paciencia' ? x.p75 : x.ref) : x.ref);
  /** Lucro sobre o que se paga, revendendo pelo alvo escolhido, já sem a comissão (quem compra não paga taxa). */
  const lucroDe = (x, qual) => { const alvo = alvoRevenda(x, qual); return { alvo, valor: liquidoRevenda(alvo, x.moeda, x.tipo) - x.preco, pct: (liquidoRevenda(alvo, x.moeda, x.tipo) - x.preco) / x.preco }; };
  const passa = (x) => lucroDe(x).pct >= cfg.lucroMin;
  function liquidoRevenda(valor, moeda, tipo) {
    if (moeda === 'orb' && tipo === 'pokemon') {
      const t1 = Math.min(valor, 500), t2 = Math.min(Math.max(valor - 500, 0), 4500), t3 = Math.max(valor - 5000, 0);
      return t1 * 0.87 + t2 * 0.90 + t3 * 0.925;
    }
    return valor * 0.85;
  }

  // ---------- o ciclo ----------
  const mercadoAbertoNaTela = () => { const l = document.querySelector('#cm-lista'); return !!(l && l.offsetParent !== null); };
  function ciclo() {
    if (cfg.ligado && socket && socket.readyState === 1) {
      if (Date.now() - refEm > 3600e3) baixarReferencia();
      if (Date.now() - histEm > 3600e3) { histEm = Date.now(); baixarHistorico(); }
      if (cfg.alvo === 'itens') enviar({ t: 'market.itens' });
      if (cfg.alvo === 'pokemon' && !mercadoAbertoNaTela()) {
        setTimeout(() => {
          pediuAnuncios = pedirPagina(0);
        }, 1500);
      }
      // confere em silêncio se o anúncio mais antigo da lista ainda está à venda
      const conferir = [...achados.values()].filter((x) => x.tipo === 'pokemon').sort((a, b) => (a.conferido || a.primeiro) - (b.conferido || b.primeiro))[0];
      if (conferir) setTimeout(() => { conferir.conferido = Date.now(); enviar({ t: 'market.anuncio', id: conferir.id }); }, 3000);
      // achado que não aparece há 10 min sai da lista (foi vendido ou mudou de preço)
      for (const [k, x] of achados) if (Date.now() - Math.max(x.visto, x.conferido || 0) > 600e3) achados.delete(k);
    }
    const intervalo = Date.now() < calmaAte ? Math.max(60, cfg.intervalo) : Math.max(10, cfg.intervalo);
    setTimeout(ciclo, intervalo * 1000);
    pintar();
  }

  // ---------- painel ----------
  // todo texto vindo do jogo ou do site passa por aqui antes de entrar no painel (que roda na aba do jogo)
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  const curto = (v) => v >= 1e9 ? (v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + 'B' : v >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M' : v >= 1e4 ? (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'K' : fmt(v);
  const precoTxt = (v, m) => m === 'gold' ? `${curto(v)} Coins` : `${fmt(v)} Gemas`;
  const ha = (t) => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s / 60)} min` : `${Math.round(s / 3600)} h`; };
  let caixa = null;
  function montar() {
    if (caixa || !document.body) return;
    const css = document.createElement('style');
    css.textContent = `
      #rmt-sniper { position: fixed; right: 12px; bottom: 12px; z-index: 99999; width: 330px; max-height: 60vh; display: flex; flex-direction: column;
        background: #1d1826; color: #eee9f5; border: 1px solid #f36cb8; border-radius: 10px; font: 13px/1.4 system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,.5); }
      #rmt-sniper.min { width: auto; max-height: none; }
      #rmt-sniper header { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #342c42; cursor: grab; user-select: none; touch-action: none; }
      #rmt-sniper.arrastando header { cursor: grabbing; }
      #rmt-sniper.arrastando { opacity: .92; }
      #rmt-sniper header b { flex: 1; font-size: 13px; }
      #rmt-sniper button { background: #2a2236; color: inherit; border: 1px solid #4a3f5c; border-radius: 6px; padding: 2px 8px; cursor: pointer; font: inherit; }
      #rmt-sniper .cfg { display: flex; flex-wrap: wrap; gap: 6px 10px; padding: 6px 10px; border-bottom: 1px solid #342c42; font-size: 12px; color: #a59cb4; }
      #rmt-sniper .chk { display: inline-flex; gap: 4px; align-items: center; cursor: pointer; color: #eee9f5; }
      #rmt-sniper .cfg select { background: #2a2236; color: inherit; border: 1px solid #4a3f5c; border-radius: 4px; }
      #rmt-sniper .seg { display: inline-flex; border: 1px solid #4a3f5c; border-radius: 6px; overflow: hidden; }
      #rmt-sniper .seg button { border: 0; border-radius: 0; background: #2a2236; padding: 2px 9px; }
      #rmt-sniper .seg button.on { background: #f36cb8; color: #1d1826; font-weight: 700; }
      #rmt-sniper .lista { overflow-y: auto; padding: 4px 0; scrollbar-width: auto; scrollbar-color: #c9a7ff #2a2236; }
      #rmt-sniper .lista::-webkit-scrollbar { width: 11px; }
      #rmt-sniper .lista::-webkit-scrollbar-track { background: #2a2236; border-radius: 6px; }
      #rmt-sniper .lista::-webkit-scrollbar-thumb { background: #c9a7ff; border-radius: 6px; border: 2px solid #2a2236; }
      #rmt-sniper .lista::-webkit-scrollbar-thumb:hover { background: #e2ccff; }
      #rmt-sniper .ach { padding: 6px 10px; border-bottom: 1px solid #2a2236; display: grid; gap: 2px; }
      #rmt-sniper .ach.novo { background: rgba(92,199,125,.12); }
      #rmt-sniper .top { display: flex; justify-content: space-between; gap: 8px; }
      #rmt-sniper .desc { color: #5cc77d; font-weight: 700; }
      #rmt-sniper .sub { color: #a59cb4; font-size: 11.5px; }
      #rmt-sniper .aviso-procura { color: #f0b35a; }
      #rmt-sniper .vazio { padding: 10px; color: #a59cb4; }
      #rmt-sniper .rod { padding: 6px 10px; font-size: 11px; color: #a59cb4; border-top: 1px solid #342c42; }`;
    document.head.appendChild(css);
    caixa = document.createElement('div');
    caixa.id = 'rmt-sniper';
    document.body.appendChild(caixa);
    caixa.addEventListener('click', (e) => {
      const b = e.target.closest('[data-acao]');
      if (!b) return;
      const ac = b.dataset.acao;
      if (ac === 'ligar') cfg.ligado = !cfg.ligado;
      if (ac === 'min') cfg.minimizado = !cfg.minimizado;
      if (ac === 'som') cfg.som = !cfg.som;
      if (ac === 'limpar') achados.clear();
      if (ac === 'alvo' && cfg.alvo !== b.dataset.v) { cfg.alvo = b.dataset.v; achados.clear(); ultimaLeitura = 0; }
      if (ac === 'moeda' && cfg.moeda !== b.dataset.v) { cfg.moeda = b.dataset.v; achados.clear(); ultimaLeitura = 0; }
      if (ac === 'ver') abrirAnuncio(Number(b.dataset.id));
      if (ac === 'revenda') cfg.revenda = b.dataset.v;
      if (ac === 'laudo') abrirLaudo(achados.get(b.dataset.k));
      if (ac === 'outland') { cfg.semOutland = !cfg.semOutland; if (cfg.semOutland) for (const [k, x] of achados) if (x.outland) achados.delete(k); }
      if (ac === 'visto') { ignorar(b.dataset.k); achados.delete(b.dataset.k); }
      salvar(); pintar();
    });
    // arrastar pelo cabeçalho (fora dos botões); a posição fica salva. Duplo clique no cabeçalho volta ao canto.
    let arr = null;
    caixa.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('header') || e.target.closest('button, select')) return;
      const r = caixa.getBoundingClientRect();
      arr = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      caixa.classList.add('arrastando'); caixa.setPointerCapture(e.pointerId); e.preventDefault();
    });
    caixa.addEventListener('pointermove', (e) => {
      if (!arr) return;
      cfg.pos = { x: e.clientX - arr.dx, y: e.clientY - arr.dy };
      posicionar();
    });
    const soltar = () => { if (!arr) return; arr = null; caixa.classList.remove('arrastando'); salvar(); };
    caixa.addEventListener('pointerup', soltar);
    caixa.addEventListener('pointercancel', soltar);
    caixa.addEventListener('dblclick', (e) => { if (e.target.closest('header') && !e.target.closest('button, select')) { delete cfg.pos; salvar(); posicionar(); } });
    W.addEventListener('resize', posicionar);
    caixa.addEventListener('change', (e) => {
      const s = e.target;
      if (s.dataset.cfg === 'lucroMin') cfg.lucroMin = +s.value;
      if (s.dataset.cfg === 'intervalo') cfg.intervalo = +s.value;
      salvar(); pintar();
    });
  }
  // mantém o painel dentro da tela (a posição salva pode ser de uma janela maior)
  function posicionar() {
    if (!caixa) return;
    if (!cfg.pos) { caixa.style.left = caixa.style.top = ''; caixa.style.right = caixa.style.bottom = '12px'; return; }
    const r = caixa.getBoundingClientRect(), w = W.innerWidth, h = W.innerHeight;
    const x = Math.min(Math.max(0, cfg.pos.x), Math.max(0, w - r.width)), y = Math.min(Math.max(0, cfg.pos.y), Math.max(0, h - 40));
    caixa.style.right = caixa.style.bottom = 'auto'; caixa.style.left = x + 'px'; caixa.style.top = y + 'px';
  }
  function pintar() {
    montar();
    if (!caixa) return;
    // redesenhar não pode levar a lista de volta ao topo
    const rolagem = caixa.querySelector('.lista')?.scrollTop ?? 0;
    pintarConteudo();
    const lista = caixa.querySelector('.lista');
    if (lista && rolagem) lista.scrollTop = rolagem;
  }
  function pintarConteudo() {
    requestAnimationFrame(posicionar);
    caixa.classList.toggle('min', cfg.minimizado);
    const lista = [...achados.entries()].filter(([, x]) => passa(x)).sort((a, b) => lucroDe(b[1]).pct - lucroDe(a[1]).pct);
    const novos = lista.filter(([, x]) => x.novo).length;
    if (cfg.minimizado) {
      caixa.innerHTML = `<header title="Arraste para mover · duplo clique volta ao canto"><b>🎯 Sniper · ${cfg.alvo === 'itens' ? 'Itens' : 'Pokémon'} em ${cfg.moeda === 'gold' ? 'Coins' : 'Gemas'}${cfg.ligado ? '' : ' (pausado)'}</b>${novos ? `<span class="desc">${novos} nova${novos > 1 ? 's' : ''}</span>` : ''}<button data-acao="min" title="Abrir">▴</button></header>`;
      return;
    }
    const sel = (nome, valores, atual) => `<select data-cfg="${nome}">${valores.map(([v, t]) => `<option value="${v}"${+v === +atual ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
    caixa.innerHTML = `<header title="Arraste para mover · duplo clique volta ao canto"><b>🎯 Sniper ao vivo</b>
        <button data-acao="ligar" title="Ligar ou desligar as consultas">${cfg.ligado ? 'Pausar' : 'Ligar'}</button>
        <button data-acao="som" title="Aviso sonoro">${cfg.som ? '🔔' : '🔕'}</button>
        <button data-acao="min" title="Minimizar">▾</button></header>
      <div class="cfg">
        <label title="Lucro mínimo sobre o que você paga, revendendo pelo preço escolhido, já sem a comissão">Lucro mín. ${sel('lucroMin', [[0.1, '10%'], [0.2, '20%'], [0.3, '30%'], [0.5, '50%'], [1, '100%']], cfg.lucroMin)}</label>
        <label>A cada ${sel('intervalo', [[10, '10 s'], [30, '30 s'], [60, '60 s'], [120, '2 min'], [300, '5 min']], cfg.intervalo)}</label>
        <span class="seg"><button data-acao="alvo" data-v="pokemon" class="${cfg.alvo === 'pokemon' ? 'on' : ''}">Pokémon</button><button data-acao="alvo" data-v="itens" class="${cfg.alvo === 'itens' ? 'on' : ''}">Itens</button></span>
        ${cfg.alvo === 'pokemon' ? `<label class="chk" title="Esconde as variantes de Outland (Brave, Furious, Toxic…)"><input type="checkbox" data-acao="outland"${cfg.semOutland ? ' checked' : ''}> Sem Outland</label>` : ''}
        ${cfg.alvo === 'pokemon' ? `<span class="seg" title="Por quanto você pretende revender: as três faixas do laudo"><button data-acao="revenda" data-v="rapido" class="${cfg.revenda === 'rapido' ? 'on' : ''}">Rápido</button><button data-acao="revenda" data-v="justo" class="${cfg.revenda === 'justo' ? 'on' : ''}">Justo</button><button data-acao="revenda" data-v="paciencia" class="${cfg.revenda === 'paciencia' ? 'on' : ''}">Paciência</button></span>` : ''}
        <span class="seg"><button data-acao="moeda" data-v="gold" class="${cfg.moeda === 'gold' ? 'on' : ''}">Coins</button><button data-acao="moeda" data-v="orb" class="${cfg.moeda === 'orb' ? 'on' : ''}">Gemas</button></span>
      </div>
      <div class="lista">${lista.length ? lista.map(([k, x]) => `<div class="ach${x.novo ? ' novo' : ''}">
          <div class="top"><span>${esc(x.nome)}</span><span class="desc" title="Lucro sobre o que você paga, revendendo pelo preço ${cfg.revenda === 'rapido' ? 'rápido' : cfg.revenda === 'paciencia' ? 'com paciência' : 'justo'}, já sem a comissão">+${Math.round(lucroDe(x).pct * 100)}% lucro</span></div>
          <div class="sub">${precoTxt(x.preco, x.moeda)} · ${x.p25 ? `justo <b>${precoTxt(Math.round(x.ref), x.moeda)}</b> (rápido ${precoTxt(Math.round(x.p25), x.moeda)} · paciência ${precoTxt(Math.round(x.p75), x.moeda)})` : `ref. ${precoTxt(Math.round(x.ref), x.moeda)}`} · ${esc(x.extra)}</div>
          ${x.procura?.nivel === 'baixa' ? `<div class="sub aviso-procura">⚠ pouca procura: ${x.procura.vendas} venda${x.procura.vendas === 1 ? '' : 's'} em 30 dias e ${x.procura.abertos} anúncio${x.procura.abertos === 1 ? '' : 's'} aberto${x.procura.abertos === 1 ? '' : 's'} — pode ser difícil revender</div>` : ''}
          <div class="sub">${(() => { const l = lucroDe(x); const como = x.tipo === 'pokemon' && x.p25 ? (cfg.revenda === 'rapido' ? 'pelo rápido' : cfg.revenda === 'paciencia' ? 'com paciência' : 'pelo justo') : 'pela média de 7 dias'; return l.valor > 0 ? `<span class="desc">+${precoTxt(Math.round(l.valor), x.moeda)}</span> revendendo ${como} (${precoTxt(Math.round(l.alvo), x.moeda)}), já sem a comissão` : `sem lucro revendendo ${como}, depois da comissão`; })()}</div>
          <div class="sub">visto há ${ha(x.primeiro)}${x.conferido ? ` · à venda há ${ha(x.conferido)}` : ''}${x.tipo === 'pokemon' ? ` · <button data-acao="ver" data-id="${Number(x.id) || 0}">Ver anúncio</button>${x.laudo ? ` <button data-acao="laudo" data-k="${esc(k)}" title="Abre o Avaliar do site com esta ficha">Laudo</button>` : ''}` : ' · busque o item no Market'} · <button data-acao="visto" data-k="${esc(k)}" title="Esconde este anúncio: ele não volta na próxima leitura">ok</button></div></div>`).join('')
        : `<div class="vazio">${!socket ? 'Esperando o jogo conectar…' : !cfg.ligado ? 'Pausado.' : 'Nenhuma pechincha agora. O painel avisa quando aparecer.'}</div>`}</div>
      <div class="rod">${Date.now() < calmaAte ? '<b>O jogo pediu calma: lendo 1×/min por 2 min.</b><br>' : ''}${ultimaLeitura ? `Última leitura há ${ha(ultimaLeitura)}` : 'Ainda sem leitura'} · ${hist ? `preço justo do site (${hist.n.toLocaleString('pt-BR')} vendas)` : `referência ${ref ? `resumida de ${new Date(ref.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (carregando as vendas…)` : 'carregando'}`} · <button data-acao="limpar">limpar</button><br>% = lucro sobre o que você paga, revendendo pelo preço escolhido (Rápido, Justo ou Paciência), já sem a comissão; quem compra não paga taxa. O preço justo é a mesma conta do Avaliar do site, mas o mercado varia muito: confira o laudo antes de comprar caro.</div>`;
  }
  // apito curto (só toca depois de você clicar em algo na página — regra do navegador)
  let audio = null;
  function apitar() {
    try {
      audio = audio || new (W.AudioContext || W.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; g.gain.value = 0.06;
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.15);
    } catch (e) { /* sem som */ }
  }

  baixarReferencia();
  histEm = Date.now(); baixarHistorico();
  document.addEventListener('DOMContentLoaded', () => { pintar(); setTimeout(ciclo, 15000); });
  setInterval(pintar, 15000); // atualiza o "há X s"
})();
