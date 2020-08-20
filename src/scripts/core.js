// main
import { buildElement, Alder } from './modules/parse.js';
import {
    showMain,
    showDashboard,
    showIndex,
    updateIndicator,
    nextSlide,
    previousSlide,
    goToSlide,
} from './modules/binds.js';
import { Timer, addLoadIndicator } from './modules/timing.js';

// layout shell
const main =
    document.body.querySelector('.main') ||
    buildElement('div', {
        className: 'main hidden',
    });
const dashboard =
    document.body.querySelector('.dashboard') ||
    buildElement('div', {
        className: 'dashboard hidden',
    });
const index =
    document.body.querySelector('.index') ||
    buildElement('div', {
        className: 'index hidden',
    });
const preview =
    document.body.querySelector('.slide-preview-container') ||
    buildElement('div', {
        className: 'slide-preview-container',
    });

const moulin = buildElement('div', {
    className: 'moulin',
});

const indicator = buildElement('span', {
    id: 'slide-indicator',
});

const loadingTimeElement = buildElement('div', {
    className: 'loading-indicator',
});

// globals
const alder = new Alder();

// slide loading
const load = async (name) => {
    let parse = (element) => {
        const parser = new DOMParser();
        let content = parser.parseFromString(element, 'text/html');

        content.querySelector('div').dataset.slideName = name.split('/')[1];
        return alder.parse(content.querySelector('div'));
    };

    if (config.prod == true) {
        return await caches.open(`moulin-${config.version}`).then((cache) => {
            return cache.keys(`${name}.html`).then((data) => {
                if (data.length == 0) {
                    return cache.add(`${name}.html`).then(() => {
                        return fetch(`${name}.html`)
                            .then((resp) => resp.text())
                            .then((element) => parse(element));
                    });
                } else {
                    return data.map((item) => {
                        return cache.match(item.url).then((resp) => {
                            return resp
                                .clone()
                                .text()
                                .then((element) => {
                                    return parse(element);
                                });
                        });
                    });
                }
            });
        });
    } else {
        return await fetch(`${name}.html`)
            .then((resp) => {
                return resp.text();
            })
            .then((data) => {
                return parse(data);
            });
    }
};

// core
let status = {
    slides: {
        loaded: false,
        percentage: 0,
    },
};

let toc = [];
let slides = [];
let slideContent = [];

const goToHash = (ref) => {
    let hash = window.location.hash.replace('#', '');
    if (ref == 'hashchange') {
        console.warn(hash);
        if (hash == 'toc') showIndex();
        else goToSlide(hash, true);
        return;
    } else {
        if (!config.default || config.default == 'slides') {
            showMain();
            if (!window.location.hash && config.permalinks) {
                history.pushState(``, document.title, `#${config.permalinks == 'name' ? slides[0] : 1}`);
                window.addEventListener('slide-loading-finished', () => goToSlide(hash), {
                    once: true,
                });
            } else if (window.location.hash) {
                window.addEventListener('slide-loading-finished', () => goToSlide(hash), {
                    once: true,
                });
            } else {
                window.addEventListener('slide-loading-finished', () => goToSlide(0), { once: true });
            }
        } else if (config.default == 'dashboard') {
            showDashboard();
            history.pushState('', document.title, `${window.location.href.split('#')[0]}`);
        } else if (config.default == 'toc' && (window.location.hash == '#toc' || !window.location.hash)) {
            showIndex();
            window.addEventListener('slide-loading-finished', () => goToSlide(0), { once: true });
        } else if (window.location.hash) {
            showMain();

            window.addEventListener('slide-loading-finished', () => goToSlide(hash), {
                once: true,
            });
        } else {
            showMain();
            window.addEventListener('slide-loading-finished', () => goToSlide(0), { once: true });
        }
    }
};

// fetches config
async function getConfig() {
    return await fetch('./moulin.json').then((resp) => {
        return resp.json();
    });
}

let config;

let configTimer = new Timer('config');
configTimer.start();

let originalTitle;
getConfig().then((data) => {
    originalTitle = document.title;

    config = data;

    moulin.appendChild(index);

    if ((config.disabled && !config.disabled.includes('dashboard')) || !config.disabled) moulin.appendChild(dashboard);

    if ((config.disabled && !config.disabled.includes('preview')) || !config.disabled) dashboard.appendChild(preview);

    dashboard.insertBefore(loadingTimeElement, dashboard.firstChild);

    main.appendChild(indicator);
    moulin.appendChild(main);

    document.body.appendChild(moulin);

    addLoadIndicator(
        `${config.name} ${config.prod ? 'Production' : 'Development'} ${
            config.version.includes('v') ? config.version : `v${config.version}`
        }`,
        0
    );

    configTimer.stop();
    status.config = {
        duration: configTimer.elapsedMilliseconds,
    };
    addLoadIndicator(`Config`, configTimer.elapsedMilliseconds);

    loadSlides(config);

    if (config.global) {
        document.head.appendChild(
            buildElement('link', {
                rel: 'stylesheet',
                type: 'text/css',
                href: config.global,
            })
        );
    }

    goToHash();

    (function () {
        window.addEventListener(
            'slide-loading-finished',
            () => {
                init();
            },
            {
                once: true,
            }
        );

        // generates keybinds
        const init = () => {
            document.body.addEventListener('keydown', (event) => {
                if (!main.firstChild) return;

                let k = event.which;
                if (!main.classList.contains('hidden')) {
                    if ((!event.ctrlKey && k == 39) || k == 32) nextSlide(); // right arrow key/space bar
                    if (!event.ctrlKey && k == 37) previousSlide(); // left arrow key
                    if ((event.ctrlKey && k == 39) || k == 57) goToSlide(slides.length - 1); // ctrl + right arrow || 9
                    if (event.ctrlKey && k == 37) goToSlide(0); // ctrl + left arrow key
                    if (!event.ctrlKey && k >= 49 && k < 57)
                        // 0...8
                        goToSlide(Math.abs(k - 49));
                }

                if (k == 84) cycleTheme(); // t key
                if (k == 68) {
                    // d key
                    if (config.disabled && config.disabled.includes('dashboard')) return;

                    if (!dashboard.classList.contains('hidden')) {
                        showMain();
                    } else if (dashboard.classList.contains('hidden')) {
                        showDashboard();
                    }
                }
                if (k == 83) {
                    // s key
                    if (
                        document.querySelector('.index') &&
                        document.querySelector('.index').classList.contains('hidden') == true
                    ) {
                        showIndex();
                    } else {
                        showMain();
                        history.pushState(
                            ``,
                            main.firstChild.dataset.title || originalTitle || document.title,
                            `#${
                                config.permalinks == 'name'
                                    ? main.firstChild.dataset.slideName
                                    : slides.indexOf(main.firstChild.dataset.slideName) + 1
                            }`
                        );
                    }
                }
                if (k == 72) showMain(); // h key
            });
            updateIndicator();
        };

        const cycleTheme = (ref) => {
            if (ref) {
                if (window.matchMedia('(prefers-color-scheme:dark)').matches == true) {
                    document.body.classList.add('dark');
                    return;
                }
            }

            let i = 0;

            config.themes.forEach((item) => {
                if (document.body.classList.contains(item)) {
                    i = config.themes.indexOf(item);
                }
            });

            document.body.classList.remove(config.themes[i]);

            i += 1;

            if (i >= config.themes.length) i = 0;

            document.body.classList.add(config.themes[i]);

            dispatch(
                `theme-change`,
                {
                    detail: config.themes[i],
                },
                window
            );
        };

        cycleTheme('init');

        indicator.addEventListener('click', showIndex);
    })();
});

// dispatches a hook
const dispatch = (event, data, location) => {
    let customEvent = new CustomEvent(event, data);
    location.dispatchEvent(customEvent);
};

// loads all slides
const loadSlides = (data) => {
    let inferredDir;
    let loadTimes = {};
    const fetchSlide = (slide) => {
        if (slide == config.index && !config.slideDir) inferredDir = `${slide.split('/')[0]}/`;
        if (!slide.includes('/')) slide = `${config.slideDir || inferredDir}${slide}`;

        let name = slide.split('/')[slide.split('/').length - 1].replace('.html', '');

        slides.push(name);

        loadTimes[name] = {
            timer: new Timer(name),
            name: name,
        };

        loadTimes[name].timer.start();
        return load(slide.replace('.html', ''))
            .then((item) => {
                const register = (element) => {
                    if (element != null && element != false) {
                        toc.push(element.dataset.toc || '');
                        slideContent.push(element);

                        loadTimes[name].timer.stop();

                        let newPreview = buildElement(
                            `p`,
                            {
                                className: 'slide-preview',
                                data_slide_index: name,
                            },
                            `Loaded slide "${
                                slideContent[slides.length - 1].dataset.title || slides[slides.length - 1]
                            }," in ${loadTimes[name].timer.elapsedMilliseconds}ms (${
                                loadTimes[name].timer.elapsedSeconds
                            }s)`
                        );

                        let newPreviewStatus = buildElement(`span`, {
                            className: 'slide-preview-status loading',
                        });

                        newPreview.prepend(newPreviewStatus);

                        window.addEventListener('slide-loaded', (event) => {
                            if (event.detail != name) return;
                            newPreviewStatus.classList.remove('loading');
                            newPreviewStatus.classList.add('loaded');
                        });

                        window.addEventListener('slide-loading-failed', (event) => {
                            if (event.detail != slides.indexOf(name)) return;
                            newPreviewStatus.classList.remove('loading');
                            newPreviewStatus.classList.add('loading-failed');
                        });

                        newPreview.addEventListener('click', () => {
                            goToSlide(newPreview.dataset.slideIndex);
                        });

                        if (document.querySelector('.slide-preview-container'))
                            document.querySelector('.slide-preview-container').appendChild(newPreview);

                        dispatch(
                            `slide-loaded`,
                            {
                                detail: name,
                            },
                            window
                        );

                        if (element.dataset.next) {
                            if (slides.indexOf(element.dataset.next) == -1) {
                                fetchSlide(element.dataset.next);
                            }
                        } else {
                            let t = 0;
                            Object.values(loadTimes).forEach((item) => (t += item.timer.elapsedMilliseconds));
                            status.slides = {
                                loaded: true,
                                duration: t,
                            };

                            dispatch(
                                'slide-loading-finished',
                                {
                                    detail: {
                                        data: status.slides,
                                        slides: slides.length,
                                    },
                                },
                                window
                            );
                        }
                    } else {
                        slides.pop();
                        dispatch(
                            `slide-loading-failed`,
                            {
                                detail: slides.indexOf(name),
                            },
                            window
                        );

                        addLoadIndicator(`slides`);

                        if (document.querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`)) {
                            document
                                .querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`)
                                .classList.remove('loading');
                            document
                                .querySelector(`p[data-slide-index="${slides.indexOf(name)}"]`)
                                .classList.add('loading-failed');
                        } else {
                            let newPreviewMessage = buildElement(
                                `p`,
                                {
                                    className: 'slide-preview',
                                    data_slide_index: name,
                                },
                                `Failed to load slide ${slideContent.length + 1}`
                            );

                            let newPreviewStatus = buildElement(`span`, {
                                className: 'slide-preview-status loading-failed',
                            });

                            newPreviewMessage.prepend(newPreviewStatus);

                            document.querySelector('.slide-preview-container').appendChild(newPreviewMessage);
                        }
                    }
                };

                if (Array.isArray(item)) {
                    return item[0].then((element) => {
                        register(element);
                    });
                } else {
                    register(item);
                }
            })
            .catch((err) => {
                dispatch(
                    `slide-loading-failed`,
                    {
                        detail: slides.indexOf(name),
                    },
                    window
                );
            });
    };

    // starts the slide loading process
    fetchSlide(data.index).then(() => goToHash());
};

// other things, requires all slide loading to be finished
window.addEventListener(
    'slide-loading-finished',
    (event) => {
        document.title = main.firstChild.dataset.title || document.title;

        index.appendChild(
            buildElement(
                'p',
                {
                    className: 'title',
                },
                'Table of Contents'
            )
        );

        slides.forEach((item, i) => {
            let newItem = buildElement(
                'p',
                {
                    data_slide_index: item,
                },
                `${toc[i] || i + 1}. ${slideContent[i].dataset.title || item}`
            );

            newItem.addEventListener('click', () => {
                goToSlide(newItem.dataset.slideIndex, true);
            });

            if (index) index.appendChild(newItem);
        });

        if (config.prod) {
            caches.open(`moulin-${config.version}`).then((cache) => {
                cache
                    .keys()
                    .then((data) => {
                        if (data.length != 0) {
                            addLoadIndicator(`${event.detail.slides} slides (cached)`, event.detail.data.duration);
                        } else {
                            addLoadIndicator(`${event.detail.slides} slides`, event.detail.data.duration);
                        }
                    })
                    .then(() => {
                        let t = 0;
                        Object.values(status).forEach((item) => (t += item.duration));
                        addLoadIndicator(`Everything`, t);
                    });
            });
        } else {
            addLoadIndicator(`${event.detail.slides} slides`, event.detail.data.duration);

            let t = 0;
            Object.values(status).forEach((item) => (t += item.duration));
            addLoadIndicator(`Everything`, t);
        }

        dispatch('moulin-ready', {}, window);
    },
    {
        once: true,
    }
);

window.addEventListener('hashchange', () => {
    goToHash('hashchange');
});

export { config, dispatch, main, preview, dashboard, index, slides, slideContent, loadingTimeElement };
