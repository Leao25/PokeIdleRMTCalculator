// ==UserScript==
// @name         RMT Calculator: Sniper ao vivo
// @namespace    pokeidle-rmt-calculator
// @version      1.0.8
// @description  Painel no PokeIdle que olha o Mercado de tempos em tempos e avisa quando aparece pokémon ou item bem abaixo do preço de referência. Não compra nada sozinho.
// @match        https://pokeidle.io/app*
// @run-at       document-start
// @sandbox      JavaScript
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      pokeidle-rmt-calculator.vercel.app
// @downloadURL  https://pokeidle-rmt-calculator.vercel.app/sniper-ao-vivo.user.js
// @updateURL    https://pokeidle-rmt-calculator.vercel.app/sniper-ao-vivo.user.js
// ==/UserScript==

// Como funciona
// · Usa a SUA sessão do jogo (a aba aberta): não entra com outra conta e não pausa nada.
// · A cada intervalo (padrão 60 s) pede ao jogo as mesmas telas que você abriria no Mercado:
//   a vitrine de itens (menor preço e média de 7 dias de cada item) e os 24 anúncios de pokémon
//   mais recentes. Com o Mercado aberto na sua tela, pula os anúncios de pokémon para não mexer
//   no que você está vendo.
// · Compara com a referência do RMT Calculator (mediana dos últimos 30 dias por espécie, shiny e
//   potência, ajustada ao nível), baixada uma vez por hora.
// · Mostra as pechinchas num painel no canto da tela. "Ver anúncio" abre o anúncio no jogo, como
//   o link do chat. Comprar é com você.
(function () {
  'use strict';
  const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const SITE = 'https://pokeidle-rmt-calculator.vercel.app';
  const CHAVE = 'rmtSniperAoVivo';

  // ---------- o socket do jogo: guardado quando o jogo o cria ----------
  let socket = null;
  const WSOriginal = W.WebSocket;
  function WSComGancho(...args) {
    const ws = new WSOriginal(...args);
    if (String(args[0] || '').includes(W.location.host)) {
      socket = ws;
      ws.addEventListener('message', (ev) => { try { aoReceber(JSON.parse(ev.data)); } catch (e) { /* não é JSON */ } });
    }
    return ws;
  }
  WSComGancho.prototype = WSOriginal.prototype;
  for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) WSComGancho[k] = WSOriginal[k];
  W.WebSocket = WSComGancho;
  const enviar = (msg) => { if (socket && socket.readyState === 1) { socket.send(JSON.stringify(msg)); return true; } return false; };

  // ---------- configuração ----------
  const cfg = Object.assign({ ligado: true, intervalo: 60, desconto: 0.3, som: true, alvo: 'pokemon', moeda: 'orb', minimizado: false },
    (() => { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } })());
  if (cfg.alvo !== 'pokemon' && cfg.alvo !== 'itens') cfg.alvo = 'pokemon';
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
  function referenciaDe(a) {
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
  let ultimaLeitura = 0, pediuAnuncios = false;
  let calmaAte = 0; // o jogo pediu calma: até essa hora, uma leitura por minuto
  function aoReceber(m) {
    if (m.t === 'erro' && /devagar|muitas mensagens/i.test(String(m.chave ?? m.msg ?? ''))) { calmaAte = Date.now() + 120e3; pintar(); return; }
    if (m.t !== 'market') return;
    if (m.aba === 'anuncio' && m.id != null) {
      const a = m.anuncio;
      if (!a || a.estado !== 'aberto') { achados.delete(`pk:${m.id}`); pintar(); }
      else { const x = achados.get(`pk:${m.id}`); if (x) { x.conferido = Date.now(); if (a.preco > 0 && a.preco !== x.preco) { x.preco = a.preco; x.desc = 1 - a.preco / x.ref; if (x.desc < cfg.desconto) achados.delete(`pk:${m.id}`); } pintar(); } }
      return;
    }
    if (m.aba === 'itens' && m.resumo) { avaliarItens(m.resumo, m.medias || {}); ultimaLeitura = Date.now(); pintar(); }
    if (m.aba === 'vitrine' && pediuAnuncios && (m.pagina ?? 0) === 0) { pediuAnuncios = false; avaliarAnuncios(m.linhas || []); ultimaLeitura = Date.now(); pintar(); }
  }
  function novoAchado(chave, dados) {
    const ja = achados.get(chave);
    if (ja) { Object.assign(ja, dados, { visto: Date.now() }); return; }
    achados.set(chave, { ...dados, primeiro: Date.now(), visto: Date.now(), novo: true });
    if (cfg.som) apitar();
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
        if (desc >= cfg.desconto) novoAchado(chave, { tipo: 'item', id: +id, nome: nomeItem(id), moeda, preco: min, ref: media, desc, extra: `${fmt(vendidos)} vendidos em 7 dias` });
        else achados.delete(chave); // o preço voltou ao normal: some da lista
      }
    }
  }
  function avaliarAnuncios(linhas) {
    if (cfg.alvo !== 'pokemon') return;
    for (const a of linhas) {
      if (a.tipo !== 'pokemon' || !a.ficha || a.estado !== 'aberto') continue;
      if ((a.moeda === 'gold' ? 'gold' : 'orb') !== cfg.moeda) continue;
      const r = referenciaDe(a);
      if (!r || !(a.preco > 0)) continue;
      const desc = 1 - a.preco / r.valor;
      if (desc < cfg.desconto) continue;
      const f = a.ficha;
      novoAchado(`pk:${a.id}`, {
        tipo: 'pokemon', id: a.id, nome: `${f.shiny ? '✨ ' : ''}${f.nome}`, moeda: a.moeda === 'gold' ? 'gold' : 'orb', preco: a.preco, ref: r.valor, desc,
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
      if (cfg.alvo === 'itens') enviar({ t: 'market.itens' });
      if (cfg.alvo === 'pokemon' && !mercadoAbertoNaTela()) {
        setTimeout(() => {
          pediuAnuncios = enviar({ t: 'market.listar', tipo: 'pokemon', moeda: cfg.moeda, busca: '', criterios: [], elemento: '', categoria: '',
            soShiny: false, soP5: false, soTmElemental: false, soTmAoe: false, semOutland: false, pagina: 0, especieId: 0 });
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
      if (ac === 'visto') { const x = achados.get(b.dataset.k); if (x) x.novo = false; }
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
      if (s.dataset.cfg === 'desconto') cfg.desconto = +s.value;
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
    requestAnimationFrame(posicionar);
    caixa.classList.toggle('min', cfg.minimizado);
    const lista = [...achados.entries()].sort((a, b) => b[1].desc - a[1].desc);
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
        <label>Desconto ${sel('desconto', [[0.2, '20%'], [0.3, '30%'], [0.4, '40%'], [0.5, '50%']], cfg.desconto)}</label>
        <label>A cada ${sel('intervalo', [[10, '10 s'], [30, '30 s'], [60, '60 s'], [120, '2 min'], [300, '5 min']], cfg.intervalo)}</label>
        <span class="seg"><button data-acao="alvo" data-v="pokemon" class="${cfg.alvo === 'pokemon' ? 'on' : ''}">Pokémon</button><button data-acao="alvo" data-v="itens" class="${cfg.alvo === 'itens' ? 'on' : ''}">Itens</button></span>
        <span class="seg"><button data-acao="moeda" data-v="gold" class="${cfg.moeda === 'gold' ? 'on' : ''}">Coins</button><button data-acao="moeda" data-v="orb" class="${cfg.moeda === 'orb' ? 'on' : ''}">Gemas</button></span>
      </div>
      <div class="lista">${lista.length ? lista.map(([k, x]) => `<div class="ach${x.novo ? ' novo' : ''}">
          <div class="top"><span>${x.nome}</span><span class="desc">−${Math.round(x.desc * 100)}%</span></div>
          <div class="sub">${precoTxt(x.preco, x.moeda)} · ref. ${precoTxt(Math.round(x.ref), x.moeda)} · ${x.extra}</div>
          <div class="sub">${(() => { const l = liquidoRevenda(x.ref, x.moeda, x.tipo) - x.preco; return l > 0 ? `<span class="desc">+${precoTxt(Math.round(l), x.moeda)}</span> revendendo pela ref., já sem a comissão` : 'sem lucro revendendo pela ref., depois da comissão'; })()}</div>
          <div class="sub">visto há ${ha(x.primeiro)}${x.conferido ? ` · à venda há ${ha(x.conferido)}` : ''}${x.tipo === 'pokemon' ? ` · <button data-acao="ver" data-id="${x.id}">Ver anúncio</button>` : ' · busque o item no Market'}${x.novo ? ` · <button data-acao="visto" data-k="${k}">ok</button>` : ''}</div></div>`).join('')
        : `<div class="vazio">${!socket ? 'Esperando o jogo conectar…' : !cfg.ligado ? 'Pausado.' : 'Nenhuma pechincha agora. O painel avisa quando aparecer.'}</div>`}</div>
      <div class="rod">${Date.now() < calmaAte ? '<b>O jogo pediu calma: lendo 1×/min por 2 min.</b><br>' : ''}${ultimaLeitura ? `Última leitura há ${ha(ultimaLeitura)}` : 'Ainda sem leitura'} · referência ${ref ? `de ${new Date(ref.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'carregando'} · <button data-acao="limpar">limpar</button><br>% = preço contra a referência (quem compra não paga taxa). O lucro de revenda já desconta a comissão. Referência simples (espécie, shiny, potência e nível): confira o laudo no RMT Calculator antes de comprar caro.</div>`;
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
  document.addEventListener('DOMContentLoaded', () => { pintar(); setTimeout(ciclo, 15000); });
  setInterval(pintar, 15000); // atualiza o "há X s"
})();
