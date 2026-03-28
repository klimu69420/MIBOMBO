const cvs = document.getElementById('board');
const ctx = cvs.getContext('2d');

// game settings
const cfg = {
    g: 0.8,
    jf: -22,
    gh: 100,
    s0: 7,
    si: 0.001,
    spw: 1500,
    maxS: 15
};

let st = {
    on: false,
    over: false,
    sc: 0,
    best: localStorage.getItem('yamalHighScore') || 0,
    money: parseInt(localStorage.getItem('yamalCoins')) || 0,
    xp: parseInt(localStorage.getItem('yamalXP')) || 0,
    lvl: parseInt(localStorage.getItem('yamalLevel')) || 1,
    dj: localStorage.getItem('yamalDoubleJump') === 'true',
    sh: false,
    jmps: 0,
    v: cfg.s0,
    t0: 0,
    tc: 0,
    aid: null,
    skins: JSON.parse(localStorage.getItem('yamalSkins')) || ['yamal'],
    cur: localStorage.getItem('yamalCurrentSkin') || 'yamal',
    pass: localStorage.getItem('yamalGamePass') === 'true',
    clm: JSON.parse(localStorage.getItem('yamalClaimedRewards')) || [],
    shk: 0, // Screen shake intensity
    cmb: 0, // Current combo
    mcmb: 0, // Max combo in session
    fvr: 0, // Fever mode intensity (0-100)
    isf: false // Is in Fever mode?
};

let p = {
    x: 100, y: 0, w: 250, h: 250, dy: 0,
    gr: false,
    img: document.getElementById('yamal')
};

let obs = [];
let cld = [];
let cns = [];
let flr = [];
let crd = [];
let txts = [];
let fls = []; // flashes
let bgCvs = document.createElement('canvas');
let bgCtx = bgCvs.getContext('2d');

function drawBg() {
    bgCvs.width = cvs.width; bgCvs.height = cvs.height;
    const sy = bgCvs.height - cfg.gh;
    
    // Deep Sky with Stars
    bgCtx.fillStyle = '#020617';
    bgCtx.fillRect(0, 0, bgCvs.width, sy);
    bgCtx.fillStyle = '#fff';
    for(let i=0; i<50; i++) {
        bgCtx.globalAlpha = Math.random();
        bgCtx.fillRect(Math.random()*bgCvs.width, Math.random()*sy*0.4, 1, 1);
    }
    bgCtx.globalAlpha = 1.0;

    // Distant Stand (Darker)
    bgCtx.fillStyle = '#0f172a';
    bgCtx.beginPath();
    bgCtx.moveTo(0, sy * 0.65);
    bgCtx.bezierCurveTo(bgCvs.width * 0.25, sy * 0.3, bgCvs.width * 0.75, sy * 0.3, bgCvs.width, sy * 0.65);
    bgCtx.lineTo(bgCvs.width, sy); bgCtx.lineTo(0, sy);
    bgCtx.fill();

    // Main Stand (Perspective)
    let grd = bgCtx.createLinearGradient(0, sy*0.4, 0, sy);
    grd.addColorStop(0, '#1e293b');
    grd.addColorStop(1, '#0f172a');
    bgCtx.fillStyle = grd;
    bgCtx.beginPath();
    bgCtx.moveTo(0, sy * 0.8);
    bgCtx.bezierCurveTo(bgCvs.width * 0.2, sy * 0.4, bgCvs.width * 0.8, sy * 0.4, bgCvs.width, sy * 0.8);
    bgCtx.lineTo(bgCvs.width, sy); bgCtx.lineTo(0, sy);
    bgCtx.fill();

    // High-Detail Tiers
    for (let i = 0; i < 15; i++) {
        let h = 0.8 - (i * 0.035);
        bgCtx.strokeStyle = `rgba(255, 255, 255, ${0.02 + (i * 0.004)})`;
        bgCtx.lineWidth = 1;
        bgCtx.beginPath();
        bgCtx.moveTo(0, sy * h);
        bgCtx.bezierCurveTo(bgCvs.width * 0.2, sy * (h - 0.35), bgCvs.width * 0.8, sy * (h - 0.35), bgCvs.width, sy * h);
        bgCtx.stroke();
    }

    // Aisles & Stairs
    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for(let i=0.05; i<1; i+=0.12) {
        bgCtx.beginPath();
        bgCtx.moveTo(bgCvs.width * (i - 0.012), sy);
        bgCtx.lineTo(bgCvs.width * (i + 0.012), sy);
        bgCtx.lineTo(bgCvs.width * (i + 0.006), sy * 0.45);
        bgCtx.lineTo(bgCvs.width * (i - 0.006), sy * 0.45);
        bgCtx.fill();
    }

    // Stadium Roof (Cables and Frame)
    bgCtx.fillStyle = '#020617';
    bgCtx.beginPath();
    bgCtx.moveTo(0, 0); bgCtx.lineTo(bgCvs.width, 0);
    bgCtx.lineTo(bgCvs.width, sy * 0.12);
    bgCtx.bezierCurveTo(bgCvs.width * 0.75, sy * 0.02, bgCvs.width * 0.25, sy * 0.02, 0, sy * 0.12);
    bgCtx.fill();
    
    bgCtx.strokeStyle = '#334155';
    bgCtx.lineWidth = 2 * scf;
    for(let i=0; i<=1; i+=0.05) {
        bgCtx.beginPath();
        bgCtx.moveTo(bgCvs.width * i, 0);
        bgCtx.lineTo(bgCvs.width * i, sy * 0.08);
        bgCtx.stroke();
    }

    // Grand Towers
    [bgCvs.width * 0.05, bgCvs.width * 0.25, bgCvs.width * 0.75, bgCvs.width * 0.95].forEach(lx => {
        const ly = sy * 0.12;
        bgCtx.fillStyle = '#0f172a';
        bgCtx.fillRect(lx - 35 * scf, ly - 20 * scf, 70 * scf, 40 * scf);
        bgCtx.strokeStyle = '#475569'; bgCtx.lineWidth = 2;
        bgCtx.strokeRect(lx - 35 * scf, ly - 20 * scf, 70 * scf, 40 * scf);
        
        bgCtx.fillStyle = '#fff';
        for(let r=-1; r<=1; r++) {
            for(let c=-2; c<=2; c++) {
                bgCtx.beginPath();
                bgCtx.arc(lx + c * 12 * scf, ly + r * 10 * scf, 3.5 * scf, 0, Math.PI * 2);
                bgCtx.fill();
            }
        }
    });

    // Pitch - Ultra Texture
    let pitchG = bgCtx.createLinearGradient(0, sy, 0, bgCvs.height);
    pitchG.addColorStop(0, '#15803d');
    pitchG.addColorStop(1, '#166534');
    bgCtx.fillStyle = pitchG;
    bgCtx.fillRect(0, sy, bgCvs.width, cfg.gh);
    
    // Mowed pattern
    for (let i = 0; i < bgCvs.width; i += 120 * scf) {
        bgCtx.fillStyle = "rgba(0, 0, 0, 0.15)";
        bgCtx.fillRect(i, sy, 60 * scf, cfg.gh);
    }

    // Pitch Detail (Ads & Markings)
    bgCtx.fillStyle = '#1e293b'; // Ad boards base
    bgCtx.fillRect(0, sy, bgCvs.width, 10 * scf);
    
    const adColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    for(let i=0; i<10; i++) {
        bgCtx.fillStyle = adColors[i % adColors.length];
        bgCtx.fillRect(i * (bgCvs.width/10) + 5, sy + 2, (bgCvs.width/10) - 10, 6 * scf);
    }

    bgCtx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    bgCtx.lineWidth = 4 * scf;
    bgCtx.beginPath(); bgCtx.moveTo(0, sy + 10); bgCtx.lineTo(bgCvs.width, sy + 10); bgCtx.stroke();
    
    // Full Penalty Box
    bgCtx.beginPath();
    bgCtx.strokeRect(bgCvs.width * 0.7, sy + 15, bgCvs.width * 0.4, cfg.gh - 30);
    // Penalty Spot
    bgCtx.fillStyle = '#fff';
    bgCtx.beginPath(); bgCtx.arc(bgCvs.width * 0.85, sy + cfg.gh*0.5, 4*scf, 0, Math.PI*2); bgCtx.fill();

    // Goal Nets
    bgCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    bgCtx.lineWidth = 1;
    let netX = bgCvs.width - 20;
    let netY = sy + cfg.gh * 0.2;
    let netW = 20;
    let netH = cfg.gh * 0.6;
    for(let i=0; i<=netH; i+=5) {
        bgCtx.beginPath(); bgCtx.moveTo(netX, netY + i); bgCtx.lineTo(netX + netW, netY + i); bgCtx.stroke();
    }
    for(let i=0; i<=netW; i+=5) {
        bgCtx.beginPath(); bgCtx.moveTo(netX + i, netY); bgCtx.lineTo(netX + i, netY + netH); bgCtx.stroke();
    }
    bgCtx.strokeStyle = "#fff"; bgCtx.lineWidth = 4;
    bgCtx.strokeRect(netX, netY, netW, netH);

    // Depth Shadow
    let dg = bgCtx.createLinearGradient(0, bgCvs.height - cfg.gh, 0, bgCvs.height);
    dg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    dg.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    bgCtx.fillStyle = dg;
    bgCtx.fillRect(0, bgCvs.height - cfg.gh, bgCvs.width, cfg.gh);
}

// build crowd
for (let i = 0; i < 150; i++) {
    crd.push({
        x: Math.random() * 2000,
        y: 350 + Math.random() * 250,
        off: Math.random() * Math.PI * 2,
        c: `hsl(${Math.random() * 360}, 70%, 50%)`,
        s: 0.8 + Math.random() * 0.4, // speed scale
        w: Math.random() > 0.5 // waving?
    });
}

const logos = ['atm', 'chelsea', 'liverpool', 'real-madrid', 'bayern', 'inter', 'dortmund', 'leverkusen', 'valencia', 'betis'];

const ui = {
    sc: document.getElementById('score'),
    cns: document.getElementById('coins-display'),
    best: document.getElementById('high-score'),
    lvl: document.getElementById('level-display'),
    xp: document.getElementById('xp-bar-fill'),
    ov: document.getElementById('overlay'),
    t: document.getElementById('title'),
    m: document.getElementById('message'),
    fsc: document.getElementById('final-score-container'),
    fv: document.getElementById('final-score'),
    play: document.getElementById('play-button'),
    home: document.getElementById('home-button'),
    rev: document.getElementById('revive-button'),
    revAd: document.getElementById('revive-ad-button'),
    shp: document.getElementById('shop-button'),
    shop: document.getElementById('shop'),
    cShp: document.getElementById('close-shop-button'),
    buys: document.querySelectorAll('.purchase-button'),
    donates: document.querySelectorAll('.donate-button'),
    gp: document.getElementById('game-pass-button'),
    pass: document.getElementById('game-pass'),
    cGp: document.getElementById('close-game-pass-button'),
    rwds: document.querySelectorAll('.claim-button'),
    lck: document.getElementById('locker-button'),
    locker: document.getElementById('locker'),
    lgrd: document.getElementById('locker-grid'),
    cLck: document.getElementById('close-locker-button'),
    pop: document.getElementById('custom-popup'),
    pt: document.getElementById('popup-title'),
    pm: document.getElementById('popup-msg'),
    cp: document.getElementById('close-popup-btn'),
    donBtn: document.getElementById('donate-tab-button'),
    donTab: document.getElementById('donate-tab'),
    donClose: document.getElementById('close-donate-button'),
    upiBtn: document.getElementById('upi-button'),
    buyPass: document.getElementById('buy-game-pass'),
    installBtn: document.getElementById('install-button'),
    mailDev: document.getElementById('mail-dev-button'),
    paypalPassage: document.getElementById('paypal-passage'),
    confirmPaypal: document.getElementById('confirm-paypal'),
    cancelPaypal: document.getElementById('cancel-paypal'),
    menuSkin: document.getElementById('menu-skin-img'),
    gameOnlyHUD: document.querySelectorAll('.hud-game-only'),
    cmb: document.getElementById('combo-container')
};

function msg(t, m) {
    ui.pt.innerText = t;
    ui.pm.innerText = m;
    ui.pop.classList.remove('hidden');
}

ui.cp.onclick = () => ui.pop.classList.add('hidden');

function addXP(n) {
    st.xp += n;
    let nxt = st.lvl * 1000;
    if (st.xp >= nxt) {
        st.xp -= nxt;
        st.lvl++;
        localStorage.setItem('yamalLevel', st.lvl);
        if (!st.on || st.over) msg('LEVEL UP!', `Lvl ${st.lvl} reached!`);
    }
    localStorage.setItem('yamalXP', st.xp);
    refresh();
}

const sfx = {
    j: new Audio('audio/sfx_wing.wav'),
    p: new Audio('audio/sfx_point.wav'),
    h: new Audio('audio/sfx_hit.wav'),
    d: new Audio('audio/sfx_die.wav'),
    m: new Audio('audio/bgm_mario.mp3')
};
sfx.m.loop = true;

// Preload and unlock audio
function unlockAudio() {
    // Only unlock the BGM on the first interaction
    sfx.m.play().then(() => {
        sfx.m.volume = 0.5;
    }).catch(e => console.log('BGM unlock failed:', e));

    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
}
window.addEventListener('click', unlockAudio);
window.addEventListener('touchstart', unlockAudio);

const PAY_URL = 'https://www.paypal.com/paypalme/RASIM109';
let paypalBtn = null;
let currentPurchase = {};

function pay(amt = "1", type = "", val = 0) {
    currentPurchase = { amt, type, val };
    ui.paypalPassage.classList.remove('hidden');
}

ui.cancelPaypal.onclick = () => {
    ui.paypalPassage.classList.add('hidden');
    currentPurchase = {};
};

ui.confirmPaypal.onclick = () => {
    ui.paypalPassage.classList.add('hidden');
    const { amt, type, val } = currentPurchase;

    // Clear old button
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    
    msg('CHECKOUT', `Complete your payment of $${amt} below! Once approved, your item will unlock automatically.`);
    
    if (window.paypal) {
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: amt }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // GRANT REWARD AUTOMATICALLY
                    if (type === 'coins') {
                        st.money += val;
                        localStorage.setItem('yamalCoins', st.money);
                        msg('SUCCESS', `Added ${val} coins to your account!`);
                    } else if (type === 'pass') {
                        st.pass = true;
                        localStorage.setItem('yamalGamePass', 'true');
                        syncPass();
                        msg('SUCCESS', 'Premium Pass Activated!');
                    } else if (type === 'dj') {
                        st.dj = true;
                        localStorage.setItem('yamalDoubleJump', 'true');
                        msg('SUCCESS', 'Double Jump Unlocked!');
                    } else if (type === 'donate') {
                        msg('THANKS!', 'Thank you for your donation!');
                    }
                    refresh();
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                msg('ERROR', 'Something went wrong with the payment.');
            }
        }).render('#paypal-button-container');
    } else {
        // Fallback to old PayPal.me if SDK fails
        window.open(`${PAY_URL}/${amt}`, '_blank');
        msg('PAYMENT PENDING', `Manual verification: Please pay $${amt} and tell the dev!`);
    }
};

const rewards = {
    5: { premium: { type: 'skin', val: 'player1' } },
    10: { premium: { type: 'coins', val: 500 } },
    15: { premium: { type: 'skin', val: 'player2' } },
    20: { premium: { type: 'coins', val: 1000 } },
    25: { premium: { type: 'skin', val: 'player3' } },
    30: { premium: { type: 'coins', val: 1500 } },
    35: { premium: { type: 'skin', val: 'player4' } },
    40: { premium: { type: 'coins', val: 2000 } },
    45: { premium: { type: 'skin', val: 'player6' } },
    60: { premium: { type: 'coins', val: 3000 } },
    75: { premium: { type: 'skin', val: 'real-madrid' } },
    90: { premium: { type: 'coins', val: 5000 } },
    105: { premium: { type: 'skin', val: 'player1' } },
    135: { premium: { type: 'skin', val: 'messi' } }
};

function getRwd(l, t) {
    let k = `lvl${l}_${t}`;
    if (st.clm.includes(k) || !st.pass || st.lvl < l) return;

    let r = rewards[l][t];
    if (!r) return;

    if (r.type === 'coins') {
        st.money += r.val;
        localStorage.setItem('yamalCoins', st.money);
    } else if (r.type === 'shield') {
        st.sh = true;
    } else if (r.type === 'skin') {
        if (!st.skins.includes(r.val)) {
            st.skins.push(r.val);
            localStorage.setItem('yamalSkins', JSON.stringify(st.skins));
        }
    }
    
    st.clm.push(k);
    localStorage.setItem('yamalClaimedRewards', JSON.stringify(st.clm));
    refresh();
    syncPass();
    msg('GOT IT!', 'Item added.');
}

function syncPass() {
    if (!ui.pass) return;
    ui.pass.querySelectorAll('.pass-row').forEach(row => {
        let l = parseInt(row.dataset.level);
        let btn = row.querySelector('.claim-premium');
        if (btn) {
            if (st.clm.includes(`lvl${l}_premium`)) {
                btn.innerText = 'DONE';
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else if (st.lvl >= l && st.pass) {
                btn.disabled = false;
                btn.style.opacity = '1';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.3';
            }
        }
    });
    
    let b = document.getElementById('buy-game-pass');
    if (b && st.pass) {
        b.innerText = 'ACTIVE';
        b.style.background = '#4caf50';
        b.disabled = true;
    }
}

let scf = 1;

function start() {
    const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    cvs.width = w;
    cvs.height = h;
    
    // Scale game parameters based on height
    scf = Math.max(cvs.height / 800, 0.4);
    p.w = 250 * scf;
    p.h = 250 * scf;
    cfg.gh = 100 * Math.max(scf, 0.6);
    cfg.g = 0.8 * scf;
    cfg.jf = -22 * scf;
    p.x = cvs.width * 0.1;

    // Re-initialize crowd based on screen size (ULTRA Crowd)
    const sy = cvs.height - cfg.gh;
    const skins = ['#fecaca', '#fcd4d1', '#e5c1bd', '#d2b48c', '#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac'];
    crd = [];
    for (let i = 0; i < 300; i++) {
        crd.push({
            x: Math.random() * cvs.width,
            y: sy * 0.32 + Math.random() * sy * 0.48, 
            off: Math.random() * Math.PI * 2,
            c: `hsl(${Math.random() * 360}, 80%, 50%)`, // Shirt
            sk: skins[Math.floor(Math.random() * skins.length)], // Skin tone
            s: 0.6 + Math.random() * 0.8,
            w: Math.random() > 0.5, // Waving flags/scarves
            j: Math.random() > 0.7, // Jumping
            sc: Math.random() > 0.8, // Has a scarf
            a: Math.random() > 0.5 ? 1 : -1 // Wave direction
        });
    }
    
    ui.best.innerText = `BEST: ${st.best}`;
    ui.cns.innerText = `COINS: ${st.money}`;
    drawBg();
    clr();
    if (!st.aid) loop(performance.now());
}

function clr() {
    st.sc = 0;
    st.v = cfg.s0;
    p.img = document.getElementById(st.cur);
    p.y = cvs.height - cfg.gh - p.h;
    p.dy = 0;
    p.gr = true;
    st.jmps = 0;
    st.sh = false;
    st.cmb = 0;
    st.isf = false;
    obs = [];
    cld = [];
    cns = [];
    flr = [];
    txts = [];
    for(let i=0; i<5; i++) mkCld(Math.random() * cvs.width);
    st.over = false;
    refresh();
}

function mkCld(x = cvs.width) {
    cld.push({ x, y: Math.random()*(cvs.height-200), w: 80+Math.random()*100, h: 40+Math.random()*40, v: 1+Math.random()*2 });
}

function mkCns() {
    let y = Math.random() > 0.5 ? cvs.height - cfg.gh - 50 * scf : cvs.height - cfg.gh - 200 * scf;
    let count = 3 + Math.floor(Math.random() * 3); // 3 to 5 coins in a row
    let gap = 150 * scf; // Significant space between coins in the row
    
    for(let i = 0; i < count; i++) {
        cns.push({ 
            x: cvs.width + i * gap, 
            y, 
            w: 30 * scf, 
            h: 30 * scf, 
            ok: false 
        });
    }
}

function refresh() {
    ui.sc.innerText = `SCORE: ${st.sc}`;
    ui.sc.style.transform = `scale(${1 + (st.sc % 10 === 0 ? 0.2 : 0)})`; // Bounce every 10 points
    ui.cns.innerText = `COINS: ${st.money}`;
    if (st.cmb > 1) {
        ui.cmb.style.display = 'block';
        ui.cmb.innerText = `COMBO X${st.cmb}`;
        ui.cmb.style.transform = `scale(${1 + Math.min(st.cmb * 0.05, 1)})`;
    } else {
        ui.cmb.style.display = 'none';
    }

    if (ui.lvl) ui.lvl.innerText = `LVL ${st.lvl}`;
    if (ui.xp) {
        let nxt = st.lvl * 1000;
        ui.xp.style.width = `${(st.xp / nxt) * 100}%`;
    }
    
    p.img = document.getElementById(st.cur);
    if (ui.menuSkin) ui.menuSkin.src = p.img.src;

    if (st.over) {
        ui.ov.classList.add('game-over-state');
        ui.ov.classList.remove('hidden');
        ui.t.innerText = "GAME OVER";
        ui.m.innerText = "NICE TRY!";
        ui.fsc.classList.remove('hidden');
        ui.fv.innerText = `SCORE: ${st.sc}`;
        ui.play.innerText = "REPLAY";
        ui.gameOnlyHUD.forEach(h => h.classList.remove('hidden'));
        
        if (st.money >= 50) ui.rev.classList.remove('hidden');
        else ui.rev.classList.add('hidden');

        if (st.sc > st.best) {
            st.best = st.sc;
            localStorage.setItem('yamalHighScore', st.best);
            ui.best.innerText = `BEST: ${st.best}`;
        }
    } else if (!st.on) {
        ui.ov.classList.remove('game-over-state');
        ui.ov.classList.remove('hidden');
        ui.t.innerText = "YAMAL RUN";
        ui.m.innerText = "READY?";
        ui.play.innerText = "PLAY";
        ui.fsc.classList.add('hidden');
        ui.rev.classList.add('hidden');
        ui.gameOnlyHUD.forEach(h => h.classList.add('hidden'));
    } else {
        ui.ov.classList.add('hidden');
        ui.gameOnlyHUD.forEach(h => h.classList.remove('hidden'));
    }
}

function revive() {
    if (st.money >= 50) {
        st.money -= 50; localStorage.setItem('yamalCoins', st.money);
        st.over = false; obs = [];
        refresh();
        
        // Count down
        let count = 3;
        ui.ov.classList.remove('hidden');
        ui.t.innerText = "READY?";
        ui.play.classList.add('hidden');
        ui.rev.classList.add('hidden');
        ui.fsc.classList.add('hidden');
        
        let timer = setInterval(() => {
            ui.m.innerText = count;
            if (count === 0) ui.m.innerText = "GO!";
            count--;
            if (count < -1) {
                clearInterval(timer);
                ui.ov.classList.add('hidden');
                ui.play.classList.remove('hidden');
                // loop(performance.now()); // No longer needed
                sfx.m.play().catch(e => console.log('BGM play failed:', e));
            }
        }, 1000);
    }
}

function mkObs() {
    let l = logos[Math.floor(Math.random() * logos.length)];
    let o = { x: cvs.width, y: cvs.height-cfg.gh-60*scf, w: 60*scf, h: 60*scf, img: document.getElementById(l), ok: false, log: Math.random()>0.7 };
    if (o.log) {
        o.h = 90*scf;
        o.y = cvs.height - cfg.gh - o.h;
    }
    obs.push(o);
}

function mkTxt(x, y, t, c) {
    txts.push({ x, y, t, c, l: 100 });
}

function mkFlr() {
    for (let i = 0; i < 20; i++) {
        flr.push({
            x: Math.random() * cvs.width,
            y: cvs.height,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 15 - 10,
            l: 100,
            c: Math.random() > 0.5 ? '#ff5722' : '#ffeb3b'
        });
    }
}

function loop(ts) {
    ctx.save();
    if (st.shk > 0) {
        ctx.translate((Math.random() - 0.5) * st.shk, (Math.random() - 0.5) * st.shk);
        st.shk *= 0.9;
        if (st.shk < 0.1) st.shk = 0;
    }

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    // Draw static background once
    ctx.drawImage(bgCvs, 0, 0);

    const sy = cvs.height - cfg.gh;

    // Crowd - Optimized batch rendering
    ctx.lineWidth = 1 * scf;
    
    // 1. Draw all bodies
    crd.forEach(c => {
        let jumpH = c.j ? 15 : 8;
        let jy = Math.sin(ts / 200 * c.s + c.off) * jumpH;
        if (c.y > sy * 0.3 && c.y < sy) {
            ctx.fillStyle = c.c;
            ctx.fillRect(c.x, c.y + jy, 8 * scf, 14 * scf);
        }
    });

    // 2. Draw all heads & details
    crd.forEach(c => {
        let jumpH = c.j ? 15 : 8;
        let jy = Math.sin(ts / 200 * c.s + c.off) * jumpH;
        if (c.y > sy * 0.3 && c.y < sy) {
            // Head
            ctx.fillStyle = c.sk;
            ctx.beginPath();
            ctx.arc(c.x + 4 * scf, c.y + jy - 2 * scf, 3.5 * scf, 0, Math.PI * 2);
            ctx.fill();

            // Waving arms/scarves
            if (c.w && Math.sin(ts/150 + c.off) > 0.4) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 * scf;
                ctx.beginPath();
                ctx.moveTo(c.x + (c.a > 0 ? 8 : 0) * scf, c.y + jy + 4 * scf);
                ctx.lineTo(c.x + (c.a > 0 ? 15 : -7) * scf, c.y + jy - 8 * scf);
                ctx.stroke();
                
                if (c.sc) { // Scarf/Flag
                    ctx.fillStyle = c.c;
                    ctx.fillRect(c.x + (c.a > 0 ? 15 : -17) * scf, c.y + jy - 14 * scf, 12 * scf, 8 * scf);
                }
            }
        }
    });

    // Camera Flashes
    if (Math.random() < 0.08) {
        fls.push({ x: Math.random() * cvs.width, y: sy * 0.4 + Math.random() * sy * 0.4, l: 10 });
    }
    for (let i = fls.length - 1; i >= 0; i--) {
        let f = fls[i];
        let g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 30 * scf);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, 30 * scf, 0, Math.PI * 2); ctx.fill();
        f.l--; if (f.l <= 0) fls.splice(i, 1);
    }

    // Lights - Ultra Dynamic Beams (Scanning)
    [cvs.width * 0.05, cvs.width * 0.25, cvs.width * 0.75, cvs.width * 0.95].forEach((lx, idx) => {
        const ly = sy * 0.12;
        const scan = Math.sin(ts / 1000 + idx) * 50 * scf;
        let b = ctx.createRadialGradient(lx + scan, ly, 0, lx + scan, ly, 450 * scf);
        b.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        b.addColorStop(0.2, 'rgba(255, 255, 255, 0.1)');
        b.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
        b.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = b;
        ctx.beginPath();
        ctx.moveTo(lx + scan - 180 * scf, sy); ctx.lineTo(lx + scan + 180 * scf, sy);
        ctx.lineTo(lx + 30 * scf, ly); ctx.lineTo(lx - 30 * scf, ly);
        ctx.fill();
    });

    // Pitch Haze / Smoke (Cinematic)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for(let i=0; i<3; i++) {
        let hx = (ts / 20 + i * 500) % cvs.width;
        ctx.fillRect(hx, sy, 200 * scf, cfg.gh);
        ctx.fillRect(hx - cvs.width, sy, 200 * scf, cfg.gh);
    }

    // Stadium Screen (Dynamic)
    let screenX = cvs.width * 0.45;
    let screenY = sy * 0.1;
    let screenW = 100 * scf;
    let screenH = 60 * scf;
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, screenW, screenH);
    
    // Screen Content (Yamal Run Text or Score)
    let screenText = st.on ? `SCORE ${st.sc}` : "GO!";
    if (st.isf) screenText = "FEVER!!";
    
    ctx.fillStyle = (st.isf && ts % 100 < 50) ? '#ff00ff' : (ts % 1000 < 500 ? '#ffeb3b' : '#fff');
    ctx.font = `${Math.floor((st.isf ? 14 : 10) * scf)}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText(screenText, screenX + screenW/2, screenY + screenH/2 + 5 * scf);
    ctx.textAlign = 'start'; // reset

    if (!st.on || st.over) {
        st.aid = requestAnimationFrame(loop);
        return;
    }

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    if(Math.random() < 0.005) mkCld();
    for(let i=cld.length-1; i>=0; i--) {
        let c = cld[i];
        c.x -= c.v;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.h/2, 0, Math.PI*2);
        ctx.arc(c.x + c.w/3, c.y - c.h/4, c.h/2, 0, Math.PI*2);
        ctx.arc(c.x + c.w/1.5, c.y, c.h/2, 0, Math.PI*2);
        ctx.fill();
        if(c.x + c.w < -100) cld.splice(i, 1);
    }

    p.dy += cfg.g;
    p.y += p.dy;

    if (p.y + p.h > cvs.height - cfg.gh) {
        p.y = cvs.height - cfg.gh - p.h;
        if (p.dy > 5) { st.shk = p.dy * 0.5; mkFlr(); } // Impact shake
        p.dy = 0;
        p.gr = true;
    }

    // Fever Mode Logic
    if (st.cmb >= 20 && !st.isf) {
        st.isf = true;
        st.fvr = 100;
        st.shk = 50;
        mkTxt(p.x, p.y - 100, 'FEVER MODE!', '#ff00ff');
    }
    if (st.isf) {
        st.fvr -= 0.2;
        if (st.fvr <= 0) { st.isf = false; st.cmb = 0; }
        // Flash stadium screen
        if (ts % 200 < 100) {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
            ctx.fillRect(0, 0, cvs.width, cvs.height);
        }
    }

    // Speed Trail (Juice)
    if (st.v > 10 || st.isf) {
        ctx.globalAlpha = 0.3;
        for(let i=1; i<=3; i++) {
            ctx.drawImage(p.img, p.x - i * st.v * 2, p.y, p.w, p.h);
        }
        ctx.globalAlpha = 1.0;
    }

    // Shadow
    let sw = p.w / 2.5 * (1 - (cvs.height - cfg.gh - p.y - p.h) / 200);
    if(sw > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(p.x + p.w/2, cvs.height - cfg.gh, sw, 10, 0, 0, Math.PI*2);
        ctx.fill();
    }

    // Draw Player with Speed Stretch
    let stretch = 1 + (st.v - cfg.s0) * 0.02;
    ctx.drawImage(p.img, p.x, p.y, p.w * stretch, p.h);
    
    // Particles
    for (let i = flr.length - 1; i >= 0; i--) {
        let f = flr[i];
        f.x += f.vx; f.y += f.vy;
        f.vy += 0.2;
        f.l -= 1;
        ctx.fillStyle = f.c;
        ctx.globalAlpha = f.l / 100;
        ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
        if (f.l <= 0) flr.splice(i, 1);
    }

    for (let i = txts.length - 1; i >= 0; i--) {
        let t = txts[i];
        t.y -= 1; t.l -= 2;
        ctx.fillStyle = t.c;
        ctx.globalAlpha = t.l / 100;
        ctx.font = `${Math.floor(20 * scf)}px "Press Start 2P"`;
        ctx.fillText(t.t, t.x, t.y);
        ctx.globalAlpha = 1.0;
        if (t.l <= 0) txts.splice(i, 1);
    }
    
    if (st.sh) {
        ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2 + 10, 0, Math.PI*2); ctx.stroke();
    }

    if (ts - st.t0 > cfg.spw / (st.v / cfg.s0)) { mkObs(); st.t0 = ts; }
    if (ts - st.tc > 4000) { mkCns(); st.tc = ts; } // Increased interval for groups

    // Coins
    for (let i = cns.length - 1; i >= 0; i--) {
        let c = cns[i];
        c.x -= st.v;
        let stretch = 1 + (st.v - cfg.s0) * 0.01;
        
        // Spacey Glow
        let hue = (ts / 10) % 360;
        let glowColor = st.isf ? `hsl(${hue}, 100%, 70%)` : '#ffd700';
        
        ctx.shadowBlur = 15 * scf;
        ctx.shadowColor = glowColor;
        
        // Coin Body (Spacey Ellipse)
        ctx.fillStyle = st.isf ? `hsl(${hue}, 100%, 50%)` : "#ffd700";
        ctx.beginPath(); 
        ctx.ellipse(c.x + c.w/2, c.y + c.h/2, (c.w/2) * stretch, c.h/2, 0, 0, Math.PI*2); 
        ctx.fill();
        
        // Inner Shine
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.ellipse(c.x + c.w/3, c.y + c.h/3, c.w/6, c.h/6, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = st.isf ? "#fff" : "#daa520"; 
        ctx.lineWidth = 2; 
        ctx.stroke();
        
        // Spacey Ring (Orbit)
        if (st.cmb > 5 || st.isf) {
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            let rx = (c.w * 0.8) * stretch;
            let ry = c.h * 0.3;
            let rot = ts / 500;
            ctx.ellipse(c.x + c.w/2, c.y + c.h/2, rx, ry, rot, 0, Math.PI*2);
            ctx.stroke();
            
            // Sparkle on ring
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(c.x + c.w/2 + Math.cos(rot) * rx, c.y + c.h/2 + Math.sin(rot) * ry, 2*scf, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.shadowBlur = 0; // Reset shadow for performance

        // Pass-through logic: Collect when coin passes the player's center
        if (!c.ok && c.x < p.x + p.w / 2) {
            c.ok = true;
            let gain = st.isf ? 10 : 5;
            st.money += gain;
            st.cmb++;
            st.shk = 5;
            localStorage.setItem('yamalCoins', st.money);
            sfx.p.play().catch(e => console.log('SFX play failed:', e));
            mkTxt(c.x, c.y, `+${gain}`, '#ffd700');
            refresh();
        }
        if (c.x + c.w < 0) cns.splice(i, 1);
    }

    // Obstacles
    for (let i = obs.length - 1; i >= 0; i--) {
        let o = obs[i];
        o.x -= st.v;

        if (o.log) {
            ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(o.x + 15, o.y + o.h - 10, o.w - 10, 10);
            ctx.fillStyle = "#5d4037"; ctx.fillRect(o.x + 10, o.y + 30, o.w - 20, o.h - 30);
        }
        let stretch = 1 + (st.v - cfg.s0) * 0.01;
        ctx.drawImage(o.img, o.x, o.y, o.w * stretch, 60);
        
        let pb = { l: p.x + 60 * scf, r: p.x + p.w - 60 * scf, t: p.y + 50 * scf, b: p.y + p.h - 50 * scf };
        let ob = { l: o.x, r: o.x + o.w, t: o.y, b: o.y + o.h };

        if (pb.r > ob.l && pb.l < ob.r && pb.b > ob.t && pb.t < ob.b) {
            if (st.sh) { st.sh = false; obs.splice(i, 1); sfx.h.play().catch(e => console.log('SFX play failed:', e)); st.cmb = 0; st.shk = 20; continue; }
            sfx.h.play().catch(e => console.log('SFX play failed:', e));
            sfx.d.play().catch(e => console.log('SFX play failed:', e));
            sfx.m.pause();
            st.shk = 40;
            st.over = true; refresh();
            ctx.restore();
            st.aid = requestAnimationFrame(loop);
            return;
        }

        if (!o.ok && o.x < p.x + p.w / 2) {
            o.ok = true;
            st.sc++;
            st.cmb++;
            addXP(50 + st.cmb * 5);
            if (st.sc > 0 && st.sc % 100 === 0) { mkFlr(); mkTxt(cvs.width / 2 - 100, 100, 'MAX ENERGY!', '#ffeb3b'); st.shk = 30; }
            if (p.y + p.h > o.y - 20 && p.y + p.h < o.y + 50) {
                st.money += 10; addXP(100); sfx.p.play().catch(e => console.log('SFX play failed:', e));
                mkTxt(p.x, p.y - 50, 'LEGENDARY! +10c', '#ffeb3b');
                st.shk = 15;
            }
            refresh();
        }
        if (o.x + o.w < 0) obs.splice(i, 1);
    }

    st.v += cfg.si;
    if (st.v > cfg.maxS) st.v = cfg.maxS;

    ctx.restore();
    st.aid = requestAnimationFrame(loop);
}

function jump() {
    if (st.on && !st.over) {
        if (p.gr) { 
            p.dy = cfg.jf; p.gr = false; st.jmps = 1; 
            sfx.j.play().catch(e => console.log('SFX play failed:', e)); 
            st.shk = 5;
            for(let i=0; i<10; i++) flr.push({x: p.x + p.w/2, y: p.y + p.h, vx: (Math.random()-0.5)*10, vy: -Math.random()*5, l: 50, c: '#fff'});
        }
        else if (st.dj && st.jmps < 2) { 
            p.dy = cfg.jf * 0.8; st.jmps = 2; 
            sfx.j.play().catch(e => console.log('SFX play failed:', e)); 
            st.shk = 8;
            for(let i=0; i<15; i++) flr.push({x: p.x + p.w/2, y: p.y + p.h/2, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, l: 60, c: '#00ffff'});
        }
    }
}

window.onkeydown = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    // Removed Enter to prevent accidental restarts
};

cvs.onpointerdown = () => {
    if (st.on && !st.over) jump();
};

ui.play.onclick = () => go();

ui.home.onclick = () => {
    st.on = false;
    st.over = false;
    // BGM should keep playing on the menu
    sfx.m.volume = 0.5;
    refresh();
};

function syncAll() {
    ui.lck.onclick = () => { ui.locker.classList.remove('hidden'); syncLocker(); };
    ui.cLck.onclick = () => ui.locker.classList.add('hidden');
    ui.shp.onclick = () => ui.shop.classList.remove('hidden');
    ui.cShp.onclick = () => ui.shop.classList.add('hidden');
    ui.gp.onclick = () => { ui.pass.classList.remove('hidden'); syncPass(); };
    ui.cGp.onclick = () => ui.pass.classList.add('hidden');
    ui.donBtn.onclick = () => ui.donTab.classList.remove('hidden');
    ui.donClose.onclick = () => ui.donTab.classList.add('hidden');
    ui.mailDev.onclick = () => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=kimuball@gmail.com&su=Yamal%20Run%20Feedback', '_blank');
    ui.upiBtn.onclick = () => msg('COMING SOON', 'UPI payments are currently being set up. Please use PayPal in the meantime! 🚀');
    ui.buyPass.onclick = () => {
        if (store && store.order) store.order('com.yamalrun.gamepass');
        else pay("1", 'pass');
    };
    
    ui.donates.forEach(btn => {
        btn.onclick = () => pay(btn.dataset.amt, 'donate');
    });
}
syncAll();

function go() {
    if (!st.on) st.on = true;
    sfx.m.volume = 1.0; // Max volume for the game
    if (sfx.m.paused) {
        sfx.m.currentTime = 0;
        sfx.m.play().catch(e => console.log('BGM play failed:', e));
    }
    clr();
    st.t0 = performance.now(); st.tc = performance.now();
    // Start loop if not already running
    if (!st.aid) loop(performance.now());
}

// Initial Start
start();
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', start);
} else {
    window.onresize = start;
}

// Service Worker & Install Logic
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed', err));
}

let deferredPrompt;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (ui.installBtn && !isStandalone) ui.installBtn.classList.remove('hidden');
});

if (ui.installBtn) {
    // Show manual instructions for iOS since they don't support beforeinstallprompt
    if (isIOS && !isStandalone) {
        ui.installBtn.classList.remove('hidden');
        ui.installBtn.onclick = () => {
            msg('INSTALL', 'To install: Tap the "Share" button at the bottom and select "Add to Home Screen" 📲');
        };
    } else {
        ui.installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    ui.installBtn.classList.add('hidden');
                }
                deferredPrompt = null;
            } else {
                msg('INSTALL', 'Please use your browser menu to "Install" or "Add to Home Screen".');
            }
        };
    }
}

const store = window.store || null;
if (store) {
    store.register([
        { id: 'com.yamalrun.coins100', type: store.CONSUMABLE },
        { id: 'com.yamalrun.coins500', type: store.CONSUMABLE },
        { id: 'com.yamalrun.doublejump', type: store.NON_CONSUMABLE },
        { id: 'com.yamalrun.gamepass', type: store.NON_CONSUMABLE }
    ]);

    store.when('com.yamalrun.coins100').approved((p) => {
        st.money += 100; localStorage.setItem('yamalCoins', st.money);
        p.finish(); refresh(); msg('SUCCESS', '100 Coins Added!');
    });

    store.when('com.yamalrun.coins500').approved((p) => {
        st.money += 500; localStorage.setItem('yamalCoins', st.money);
        p.finish(); refresh(); msg('SUCCESS', '500 Coins Added!');
    });

    store.when('com.yamalrun.doublejump').approved((p) => {
        st.dj = true; localStorage.setItem('yamalDoubleJump', 'true');
        p.finish(); refresh(); msg('SUCCESS', 'DJ Unlocked!');
    });

    store.when('com.yamalrun.gamepass').approved((p) => {
        st.pass = true; localStorage.setItem('yamalGamePass', 'true');
        p.finish(); syncPass(); msg('SUCCESS', 'Pass Active!');
    });

    store.refresh();
}

function syncLocker() {
    if (!ui.lgrd) return;
    ui.lgrd.innerHTML = '';
    st.skins.forEach(id => {
        let img = document.getElementById(id);
        if (!img) return;
        let isEquipped = st.cur === id;
        let item = document.createElement('div');
        item.className = `shop-item ${isEquipped ? 'equipped' : ''}`;
        item.innerHTML = `
            <h3>${id.replace('-', ' ').toUpperCase()}</h3>
            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 15px; margin-bottom: 15px; width: 100%; display: flex; justify-content: center;">
                <img src="${img.src}" style="width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.3));">
            </div>
            <button class="equip-button ${isEquipped ? 'equipped' : ''}" data-skin="${id}">
                ${isEquipped ? 'EQUIPPED' : 'EQUIP'}
            </button>
        `;
        
        let btn = item.querySelector('.equip-button');
        btn.onclick = () => {
            if (isEquipped) return;
            st.cur = id;
            localStorage.setItem('yamalCurrentSkin', id);
            syncLocker();
            refresh();
            msg('SKIN EQUIPPED', `${id.replace('-', ' ').toUpperCase()} is now active!`);
        };
        ui.lgrd.appendChild(item);
    });
}

ui.lck.onclick = () => { ui.locker.classList.remove('hidden'); syncLocker(); };
ui.cLck.onclick = () => ui.locker.classList.add('hidden');
ui.shp.onclick = () => ui.shop.classList.remove('hidden');
ui.cShp.onclick = () => ui.shop.classList.add('hidden');
ui.gp.onclick = () => { ui.pass.classList.remove('hidden'); syncPass(); };
ui.cGp.onclick = () => ui.pass.classList.add('hidden');

ui.rev.onclick = () => revive();

ui.revAd.onclick = () => {
    // --- POPUP/BANNER AD INTEGRATION ---
    // The banner/popup script is at the bottom of index.html.
    
    // --- REAL AD SDK INTEGRATION POINT ---
    // 1. Check if an ad is available (e.g., unityAds.isReady('rewardedVideo'))
    // 2. If available, show the ad (e.g., unityAds.show('rewardedVideo'))
    // 3. In the ad SDK's "onFinished" callback, call grantAdRevive()
    
    // --- SIMULATED AD FLOW FOR WEB/PC ---
    // The user cannot close this popup until the ad is "finished"
    ui.cp.classList.add('hidden'); // Hide close button
    msg('AD LOADING', 'Showing ad... Please wait.');
    document.getElementById('paypal-button-container').innerHTML = ''; // Hide PayPal buttons
    
    setTimeout(() => {
        msg('AD FINISHED', 'Thanks for watching! You have been revived.');
        ui.cp.classList.remove('hidden'); // Show close button again
        grantAdRevive(); // Grant revive only AFTER the ad is finished
    }, 3000); // Simulate 3-second ad view
};

function grantAdRevive() {
    st.over = false;
    obs = [];
    refresh();
    
    // Countdown
    let count = 3;
    ui.ov.classList.remove('hidden');
    ui.t.innerText = "READY?";
    ui.play.classList.add('hidden');
    ui.rev.classList.add('hidden');
    ui.revAd.classList.add('hidden');
    ui.fsc.classList.add('hidden');
    
    let timer = setInterval(() => {
        ui.m.innerText = count;
        if (count === 0) ui.m.innerText = "GO!";
        count--;
        if (count < -1) {
            clearInterval(timer);
            ui.ov.classList.add('hidden');
            ui.play.classList.remove('hidden');
            // loop(performance.now()); // No longer needed
            sfx.m.play().catch(e => console.log('BGM play failed:', e));
        }
    }, 1000);
}

ui.buys.forEach(btn => {
    btn.onclick = () => {
        let id = btn.id;
        let sid = btn.dataset.skin;

        if (sid) {
            let cost = parseInt(btn.dataset.cost);
            if (st.skins.includes(sid)) {
                st.cur = sid; localStorage.setItem('yamalCurrentSkin', sid);
                msg('DONE', `Equipped ${sid}!`);
            } else if (st.money >= cost) {
                st.money -= cost; st.skins.push(sid); st.cur = sid;
                localStorage.setItem('yamalCoins', st.money);
                localStorage.setItem('yamalSkins', JSON.stringify(st.skins));
                localStorage.setItem('yamalCurrentSkin', sid);
                msg('UNLOCKED', sid);
            } else msg('ERROR', 'No coins!');
        } else if (id === 'buy-double-jump') {
            if (store && store.order) store.order('com.yamalrun.doublejump');
            else pay("1", 'dj');
        } else if (id === 'buy-shield') {
            if (st.money >= 100) { st.money -= 100; st.sh = true; localStorage.setItem('yamalCoins', st.money); msg('OK', 'Shield ON!'); }
            else msg('ERROR', 'No coins!');
        } else if (id === 'buy-game-pass') {
            if (store && store.order) store.order('com.yamalrun.gamepass');
            else pay("1", 'pass');
        } else {
            let n = parseInt(btn.dataset.coins);
            if (n) {
                let amt = n === 100 ? "1" : "2"; // $1 for 100, $2 for 500
                if (store && store.order) store.order(n === 100 ? 'com.yamalrun.coins100' : 'com.yamalrun.coins500');
                else pay(amt, 'coins', n);
            }
        }
        refresh();
    };
});
