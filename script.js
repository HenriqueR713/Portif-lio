/* ─── NAVBAR BLOB ─── */

(function () {
    const PAD_X = 20;
    const BLOB_H = 35;

    const blob   = document.getElementById('blob');
    const menu   = document.getElementById('menu');
    const navbar = document.getElementById('navbar');
    const links  = Array.from(document.querySelectorAll('.menu-link'));

    let activeSection = 'inicio';
    let isInside = false;
    let blobX = 0, blobW = 0, targetX = 0, targetW = 0;

    blob.style.height = BLOB_H + 'px';

    function menuLeft() { return menu.getBoundingClientRect().left; }

    function rectOf(el) {
        const r  = el.getBoundingClientRect();
        const ml = menuLeft();
        return {
            left:  r.left - ml - PAD_X,
            width: r.width + PAD_X * 2,
            cx:    r.left - ml + r.width / 2
        };
    }

    function getActive() { return links.find(l => l.dataset.section === activeSection) || links[0]; }

    function aimAt(el) {
        const r = rectOf(el);
        targetX = r.left;
        targetW = r.width;
    }

    function highlight(el) {
        links.forEach(l => l.classList.remove('active'));
        el.classList.add('active');
    }

    function nearest(mouseX) {
        const mx = mouseX - menuLeft();
        return links.reduce((best, l) => {
            const d = Math.abs(mx - rectOf(l).cx);
            return d < Math.abs(mx - rectOf(best).cx) ? l : best;
        }, links[0]);
    }

    (function tick() {
        blobX += (targetX - blobX) * 0.16;
        blobW += (targetW - blobW) * 0.16;
        blob.style.left  = blobX + 'px';
        blob.style.width = blobW + 'px';
        requestAnimationFrame(tick);
    })();

    navbar.addEventListener('mousemove', e => {
        const n = nearest(e.clientX);
        aimAt(n);
        highlight(n);
    });

    navbar.addEventListener('mouseenter', () => { isInside = true; });

    navbar.addEventListener('mouseleave', () => {
        isInside = false;
        const a = getActive();
        highlight(a);
        aimAt(a);
    });

    const sections = document.querySelectorAll('main[id], section[id]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSection = entry.target.id;
                if (!isInside) { highlight(getActive()); aimAt(getActive()); }
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));

    function init() {
        const r = rectOf(getActive());
        blobX = r.left; blobW = r.width;
        targetX = r.left; targetW = r.width;
        blob.style.left  = blobX + 'px';
        blob.style.width = blobW + 'px';
    }

    window.addEventListener('load', () => {
        init();
        setTimeout(init, 200);
    });
})();

/* ─── PORTFÓLIO — PILL NAV ─── */

(function () {
    const pillNav   = document.getElementById('pillNav');
    const indicator = document.getElementById('pillIndicator');
    const btns      = pillNav.querySelectorAll('.pill-btn');

    function moveIndicator(btn) {
        const nr = pillNav.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        indicator.style.left  = (br.left - nr.left) + 'px';
        indicator.style.width = br.width + 'px';
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moveIndicator(btn);

            document.querySelectorAll('.tab-panel').forEach(p =>
                p.classList.remove('active')
            );
            const panel = document.getElementById('tab-' + btn.dataset.tab);
            panel.classList.add('active');

            /* Garante que os itens do painel recém-aberto fiquem visíveis */
            requestAnimationFrame(() => {
                panel.querySelectorAll('.reveal').forEach(el => {
                    el.classList.add('visible');
                });
                panel.querySelectorAll('.card-entry').forEach(el => {
                    ativarCardEntry(el);
                });
            });
        });
    });

    window.addEventListener('load', () => {
        const a = pillNav.querySelector('.pill-btn.active');
        if (a) moveIndicator(a);
        setTimeout(() => {
            const a2 = pillNav.querySelector('.pill-btn.active');
            if (a2) moveIndicator(a2);
        }, 200);
    });

    window.addEventListener('resize', () => {
        const a = pillNav.querySelector('.pill-btn.active');
        if (a) moveIndicator(a);
    });
})();

/* ─── LIGHTBOX ─── */

const lightbox = document.getElementById('lightbox');

function openProject(data) {
    const img = document.getElementById('lb-img');
    img.src           = data.img || '';
    img.style.display = data.img ? 'block' : 'none';

    document.getElementById('lb-name').textContent = data.name;

    const links = document.getElementById('lb-links');
    links.innerHTML = '';

    if (data.demo) {
        links.innerHTML +=
            `<a class="lk-btn primary" href="${data.demo}" target="_blank">
                <i class="ti ti-external-link"></i> Demo
            </a>`;
    }

    if (data.repo) {
        links.innerHTML +=
            `<a class="lk-btn" href="${data.repo}" target="_blank">
                <i class="ti ti-brand-github"></i> Repo
            </a>`;
    }

    lightbox.classList.add('open');
}

function openCert(data) {
    const img = document.getElementById('lb-img');
    img.src           = data.img || '';
    img.style.display = data.img ? 'block' : 'none';

    document.getElementById('lb-name').textContent = data.name;
    document.getElementById('lb-links').innerHTML   = '';

    lightbox.classList.add('open');
}

function closeLightbox(e, force) {
    if (force || (e && e.target === lightbox)) {
        lightbox.classList.remove('open');
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
});

/* ─── FRASE DIGITADA ─── */

(function () {
    const frases = [
        'Websites modernos e responsivos.',
        'Interfaces que encantam o usuário.',
        'Código limpo, design que converte.',
        'Do layout à experiência completa.'
    ];

    const el = document.getElementById('frase-typed');
    let fi = 0, ci = 0, apagando = false;
    const DELAY_DIGITAR = 55;
    const DELAY_APAGAR  = 30;
    const PAUSA_FIM     = 2200;
    const PAUSA_INICIO  = 400;

    function loop() {
        const frase = frases[fi];

        if (!apagando) {
            el.textContent = frase.slice(0, ci + 1);
            ci++;
            if (ci === frase.length) {
                apagando = true;
                setTimeout(loop, PAUSA_FIM);
            } else {
                setTimeout(loop, DELAY_DIGITAR);
            }
        } else {
            el.textContent = frase.slice(0, ci - 1);
            ci--;
            if (ci === 0) {
                apagando = false;
                fi = (fi + 1) % frases.length;
                setTimeout(loop, PAUSA_INICIO);
            } else {
                setTimeout(loop, DELAY_APAGAR);
            }
        }
    }

    loop();
})();

/* ─── CONTADORES DAS STATS ─── */

(function () {
    const nums = document.querySelectorAll('.stat-num');

    const animarContador = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duracao = 1200;
        const intervalo = 30;
        const passos = duracao / intervalo;
        const incremento = target / passos;
        let atual = 0;

        const timer = setInterval(() => {
            atual += incremento;
            if (atual >= target) {
                el.textContent = target + '+';
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(atual);
            }
        }, intervalo);
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarContador(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(n => observer.observe(n));
})();

/* ─── EFEITO 3D MOEDA NA FOTO ─── */

(function () {
    const foto    = document.querySelector('.foto-perfil');
    const wrapper = document.querySelector('.foto-wrapper');
    if (!foto || !wrapper) return;

    const INTENSIDADE = 18;

    foto.addEventListener('mousemove', e => {
        const r  = foto.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / (r.width  / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        const rotX = -dy * INTENSIDADE;
        const rotY =  dx * INTENSIDADE;

        wrapper.style.transition = 'transform 0.12s ease';
        wrapper.style.transform  = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    });

    foto.addEventListener('mouseleave', () => {
        wrapper.style.transition = 'transform 0.6s cubic-bezier(.4,0,.2,1)';
        wrapper.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
})();

/* ─── SCROLL REVEAL ─── */

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            if (!entry.target.closest('.tab-panel')) {
                entry.target.classList.remove('visible');
            }
        }
    });
}, { threshold: 0.05 });

document.querySelectorAll('.reveal').forEach(el => {
    if (!el.closest('.tab-panel')) {
        revealObserver.observe(el);
    }
});

window.addEventListener('load', () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        activePanel.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }
});

/* ─── CARD ENTRY — sem conflito com hover transform ─── */
/* Após a animação de entrada terminar, troca o transition para o hover funcionar */

function ativarCardEntry(el) {
    if (el.classList.contains('entrada-feita')) return;
    el.classList.add('visible');
    el.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
            el.classList.add('entrada-feita');
            el.removeEventListener('transitionend', handler);
        }
    });
}

const cardEntryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            ativarCardEntry(entry.target);
            cardEntryObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.05 });

document.querySelectorAll('.card-entry').forEach(el => {
    if (!el.closest('.tab-panel')) {
        cardEntryObserver.observe(el);
    }
});

window.addEventListener('load', () => {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
        activePanel.querySelectorAll('.card-entry').forEach(el => {
            cardEntryObserver.observe(el);
        });
    }
});


/* ─── CONTATO — UTILITÁRIO SHAKE ─── */

function sacudir(el) {
    el.classList.remove('campo-erro');
    void el.offsetWidth;
    el.classList.add('campo-erro');
    el.focus();
    el.addEventListener('animationend', () => el.classList.remove('campo-erro'), { once: true });
}

/* ─── CONTATO — WHATSAPP ─── */

(function () {
    const btn = document.getElementById('btn-whatsapp');
    if (!btn) return;

    const NUMERO = '5581985103175';

    btn.addEventListener('click', () => {
        const nome     = document.getElementById('wpp-nome').value.trim();
        const mensagem = document.getElementById('wpp-mensagem').value.trim();

        if (!nome) {
            sacudir(document.getElementById('wpp-nome'));
            return;
        }
        if (!mensagem) {
            sacudir(document.getElementById('wpp-mensagem'));
            return;
        }

        const texto = `Olá, me chamo ${nome}.\n\n${mensagem}`;
        const url   = `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
    });
})();

/* ─── CONTATO — EMAIL ─── */

(function () {
    const btn = document.getElementById('btn-email');
    if (!btn) return;

    const MEU_EMAIL = 'ramosdemourahenrique@gmail.com';

    btn.addEventListener('click', () => {
        const nome      = document.getElementById('email-nome').value.trim();
        const remetente = document.getElementById('email-remetente').value.trim();
        const mensagem  = document.getElementById('email-mensagem').value.trim();

        if (!nome) {
            sacudir(document.getElementById('email-nome'));
            return;
        }
        if (!mensagem) {
            sacudir(document.getElementById('email-mensagem'));
            return;
        }

        const assunto = `Contato via portfólio — ${nome}`;

        let corpo = `Olá, me chamo ${nome}.\n\n${mensagem}`;
        if (remetente) {
            corpo += `\n\n— ${remetente}`;
        }

        const headers = remetente
            ? `&reply-to=${encodeURIComponent(remetente)}`
            : '';

        const mailtoUrl =
            `mailto:${MEU_EMAIL}` +
            `?subject=${encodeURIComponent(assunto)}` +
            `&body=${encodeURIComponent(corpo)}` +
            headers;

        window.location.href = mailtoUrl;
    });
})();

/* ─── HERO ANIMATION ─── */

(function () {
    const heroEls = document.querySelectorAll('#inicio .hero-anim');
    let heroVisible = false;

    function showHero() {
        heroEls.forEach(el => {
            el.classList.remove('no-transition');
            el.classList.add('visible');
        });
        heroVisible = true;
    }

    function hideHero() {
        heroEls.forEach(el => {
            el.classList.add('no-transition');
            el.classList.remove('visible');
        });
        heroVisible = false;
    }

    window.addEventListener('load', () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                showHero();
            });
        });
    });

    const heroObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !heroVisible) {
                hideHero();
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        heroEls.forEach(el => el.classList.remove('no-transition'));
                        showHero();
                    });
                });
            }
            if (!entry.isIntersecting) {
                heroVisible = false;
            }
        });
    }, { threshold: 0.2 });

    const heroSection = document.querySelector('#inicio');
    if (heroSection) heroObserver.observe(heroSection);
})();