/* ─── NAVBAR BLOB ───
   Mesmo padrão do pillIndicator do portfólio: o blob muda ao clicar em um
   link e acompanha a seção ativa durante o scroll — não segue o mouse. */

(function () {
    const PAD_X = 20;

    const blob   = document.getElementById('blob');
    const menu   = document.getElementById('menu');
    const links  = Array.from(document.querySelectorAll('.menu-link'));

    let activeSection = 'inicio';

    function menuLeft() { return menu.getBoundingClientRect().left; }

    function rectOf(el) {
        const r  = el.getBoundingClientRect();
        const ml = menuLeft();
        return {
            left:  r.left - ml - PAD_X,
            width: r.width + PAD_X * 2
        };
    }

    function getActive() { return links.find(l => l.dataset.section === activeSection) || links[0]; }

    function moveBlobTo(el) {
        const r = rectOf(el);
        blob.style.transform = `translateY(-50%) translateX(${r.left}px)`;
        blob.style.width = r.width + 'px';
    }

    function highlight(el) {
        links.forEach(l => l.classList.remove('active'));
        el.classList.add('active');
    }

    links.forEach(link => {
        link.addEventListener('click', () => {
            activeSection = link.dataset.section;
            highlight(link);
            moveBlobTo(link);
        });
    });

    const sections = links
        .map(l => document.getElementById(l.dataset.section))
        .filter(Boolean);

    function updateActiveByScroll() {
        const viewportCenter = window.innerHeight * 0.4;
        let current = sections[0];

        sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= viewportCenter && rect.bottom > 0) {
                current = sec;
            }
        });

        if (current && current.id !== activeSection) {
            activeSection = current.id;
            highlight(getActive());
            moveBlobTo(getActive());
        }
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            updateActiveByScroll();
            scrollTicking = false;
        });
    }, { passive: true });

    function init() {
        blob.style.transition = 'none';
        moveBlobTo(getActive());
        // força reflow antes de restaurar a transição
        void blob.offsetWidth;
        blob.style.transition = '';
    }

    window.addEventListener('load', () => {
        init();
        updateActiveByScroll();
        // recalcula após fontes/ícones do CDN carregarem e mudarem larguras
        setTimeout(init, 300);
        setTimeout(init, 1000);
    });

    window.addEventListener('resize', () => {
        moveBlobTo(getActive());
    });
})();

/* ─── PORTFÓLIO — PILL NAV ───
   Trocado left/width por transform translateX + width, mantendo a
   transição suave já definida em CSS. */

(function () {
    const pillNav   = document.getElementById('pillNav');
    const indicator = document.getElementById('pillIndicator');
    const btns      = pillNav.querySelectorAll('.pill-btn');

    function moveIndicator(btn) {
        const nr = pillNav.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        indicator.style.transform = `translateX(${br.left - nr.left}px)`;
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
        if (a) {
            indicator.style.transition = 'none';
            moveIndicator(a);
            requestAnimationFrame(() => { indicator.style.transition = ''; });
        }
    });

    window.addEventListener('resize', () => {
        const a = pillNav.querySelector('.pill-btn.active');
        if (a) moveIndicator(a);
    });
})();

/* ════════════════════════════════════════════
   MODAL DE PROJETO
   ════════════════════════════════════════════ */

const modalOverlay = document.getElementById('modal-overlay');

function openProject(data) {
    const img         = document.getElementById('modal-img');
    const placeholder = document.getElementById('modal-img-placeholder');

    if (data.img) {
        img.src           = data.img;
        img.alt           = data.name || '';
        img.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    document.getElementById('modal-title').textContent = data.name        || '';
    document.getElementById('modal-desc').textContent  = data.description || '';

    const techsEl = document.getElementById('modal-techs');
    techsEl.innerHTML = '';
    if (Array.isArray(data.techs)) {
        const frag = document.createDocumentFragment();
        data.techs.forEach(t => {
            const span = document.createElement('span');
            span.className   = 'modal-tech-tag';
            span.textContent = t;
            frag.appendChild(span);
        });
        techsEl.appendChild(frag);
    }

    const actionsEl = document.getElementById('modal-actions');
    actionsEl.innerHTML = '';

    if (data.demo) {
        actionsEl.innerHTML +=
            `<a class="modal-link-btn modal-link-btn--primary"
                href="${data.demo}" target="_blank" rel="noopener">
                <i class="ti ti-external-link"></i> Ver projeto
            </a>`;
    }

    if (data.repo) {
        actionsEl.innerHTML +=
            `<a class="modal-link-btn"
                href="${data.repo}" target="_blank" rel="noopener">
                <i class="ti ti-brand-github"></i> Ver código
            </a>`;
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(e, force) {
    if (force || (e && e.target === modalOverlay)) {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

/* ════════════════════════════════════════════
   MODAL DE CERTIFICADO
   ════════════════════════════════════════════ */

const certOverlay = document.getElementById('cert-overlay');

function openCert(data) {
    const img = document.getElementById('cert-img');
    img.src = data.img || '';
    img.alt = data.name || '';

    certOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCertModal(e, force) {
    if (force || (e && e.target === certOverlay)) {
        certOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        modalOverlay.classList.remove('open');
        certOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
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

/* ─── EFEITO HOVER NA FOTO ───
   O scale agora é feito via CSS (:hover), removido o JS redundante que
   manipulava style.transform diretamente. */

/* ─── SCROLL REVEAL ─── */

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -10% 0px' });

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

/* ─── CARD ENTRY ─── */

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
}, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

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

const gmail =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${MEU_EMAIL}` +
    `&su=${encodeURIComponent(assunto)}` +
    `&body=${encodeURIComponent(corpo)}`;

window.open(gmail, '_blank');
    });
})();

/* ─── HERO ANIMATION ─── */

(function () {
    const heroEls = document.querySelectorAll('#inicio .hero-anim');
    let heroVisible = false;
    let played = false;

    function showHero() {
        heroEls.forEach(el => {
            el.classList.remove('no-transition');
            el.classList.add('visible');
        });
        heroVisible = true;
    }

    window.addEventListener('load', () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                showHero();
                played = true;
            });
        });
    });

    // A re-execução da animação ao reentrar na seção foi removida:
    // disparava reflow em cada elemento do hero a cada scroll de
    // ida/volta na primeira seção. A animação de entrada agora ocorre
    // apenas uma vez, no carregamento da página.
})();