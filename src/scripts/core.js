// main

import { buildElement, renderJS, scopeCSS } from "./modules/parse.js";
import { showMain, showDashboard } from "./modules/binds.js";

// layout shell
const main =
    document.body.querySelector(".main") ||
    buildElement("div", {
        className: "main hidden",
    });
const dashboard =
    document.body.querySelector(".dashboard") ||
    buildElement("div", {
        className: "dashboard hidden",
    });
const preview =
    document.body.querySelector(".slide-preview-container") ||
    buildElement("div", {
        className: "slide-preview-container",
    });

const moulin = buildElement("div", {
    className: "moulin",
});

const indicator = buildElement("span", {
    id: "slide-indicator",
});

const loadingTimeElement = buildElement("div", {
    className: "loading-indicator",
});

// binds
const updateIndicator = () => {
    let slideName = document.querySelector("div[data-slide-name]");
    let current = 0;

    if (slideName && slideName.dataset.slideName) {
        current = slides.indexOf(slideName.dataset.slideName);
    } else {
        current = 0;
    }

    if (current + 1 < 1) {
        current = 0;
    }

    let indicator = document.querySelector(`#slide-indicator`);
    if (indicator) indicator.innerText = `${current + 1}/${slides.length}`;
};

const nextSlide = () => {
    let currentSlide = main.firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (slideContent.length !== 0 && current != slides.length - 1) {
        if (dashboard.classList.contains("hidden")) current += 1;

        currentSlide.remove();
        main.insertBefore(slideContent[current], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title ||
                originalTitle ||
                document.title,
                `#${
                config.permalinks == "name" ? slides[current] : current + 1
                }`
            );
        document.title =
            main.firstChild.dataset.title || originalTitle || document.title;
        dispatch("slide-change", { detail: current }, window);
    }
    showMain();
};

const previousSlide = () => {
    showMain();

    let currentSlide = main.firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (current != 0) {
        currentSlide.remove();
        main.insertBefore(slideContent[current - 1], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title ||
                originalTitle ||
                document.title,
                `#${
                config.permalinks == "name" ? slides[current - 1] : current
                }`
            );
        document.title =
            main.firstChild.dataset.title || originalTitle || document.title;
        dispatch("slide-change", { detail: current - 1 }, window);
    }
};

const goToSlide = slide => {
    let currentSlide = main.firstChild;
    let current = typeof slide == "string" ? slides.indexOf(slide) : slide;
    if (currentSlide.id == "slide-indicator") {
        main.insertBefore(slideContent[current], main.firstChild);
        return;
    }

    if (
        (slides.indexOf(currentSlide.dataset.slideName) == 0 && current <= 0) ||
        (slides.indexOf(currentSlide.dataset.slideName) == slides.length - 1 &&
            current >= slides.length - 1)
    )
        return;

    showMain();

    if (current != slides.length) {
        currentSlide.remove();
        main.insertBefore(slideContent[current], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title ||
                originalTitle ||
                document.title,
                `#${
                config.permalinks == "name" ? slides[current] : current + 1
                }`
            );
        document.title =
            main.firstChild.dataset.title || originalTitle || document.title;
        dispatch("slide-change", { detail: current }, window);
    }
};

// timing

class Timer {
    constructor(name) {
        this.name = name;

        this.elapsed = 0;
        this.started;
        this.ended;
    }

    start() {
        this.started = Date.now();
    }

    stop() {
        this.ended = Date.now();
        this.elapsed = this.ended - this.started;
    }

    get elapsedMilliseconds() {
        return this.elapsed;
    }

    get elapsedSeconds() {
        return this.elapsed / 1000;
    }

    static toMilliseconds(seconds) {
        return seconds * 1000;
    }

    static toSeconds(milliseconds) {
        return milliseconds / 1000;
    }
}

// slide loading
const load = async name => {
    let parse = element => {
        const parser = new DOMParser();
        let content = parser.parseFromString(element, "text/html");

        content.querySelector("div").dataset.slideName = name.split("/")[1];
        return renderJS(scopeCSS(content.querySelector("div")));
    };

    if (config.prod == true) {
        return await caches.open(`moulin-${config.version}`).then(cache => {
            return cache.keys(`${name}.html`).then(data => {
                if (data.length == 0) {
                    return cache.add(`${name}.html`).then(() => {
                        return fetch(`${name}.html`)
                            .then(resp => resp.text())
                            .then(element => parse(element));
                    });
                } else {
                    return data.map(item => {
                        return cache.match(item.url).then(resp => {
                            return resp
                                .clone()
                                .text()
                                .then(element => {
                                    return parse(element);
                                });
                        });
                    });
                }
            });
        });
    } else {
        return await fetch(`${name}.html`)
            .then(resp => {
                return resp.text();
            })
            .then(data => {
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

let slides = [];
let slideContent = [];

async function getConfig() {
    return await fetch("./moulin.json").then(resp => {
        return resp.json();
    });
}

let config;

let configTimer = new Timer("config");
configTimer.start();

let originalTitle;
getConfig().then(data => {
    originalTitle = document.title;

    config = data;

    if (
        (config.disabled && !config.disabled.includes("dashboard")) ||
        !config.disabled
    )
        moulin.appendChild(dashboard);

    if ((config.disabled && !config.disabled.includes("preview")) ||
        !config.disabled)
        dashboard.appendChild(preview);

    dashboard.insertBefore(loadingTimeElement, dashboard.firstChild);

    main.appendChild(indicator);
    moulin.appendChild(main);

    document.body.appendChild(moulin);

    addLoadIndicator(
        `${config.name} ${config.prod ? "Production" : "Development"} ${
        config.version.includes("v") ? config.version : `v${config.version}`
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
            buildElement("link", {
                rel: "stylesheet",
                type: "text/css",
                href: config.global,
            })
        );
    }

    if (config.default == "dashboard") {
        document.querySelector(".dashboard").classList.remove("hidden");
    } else if (config.default == "preview") {
        document
            .querySelector(".slide-preview-container")
            .classList.remove("hidden");
    }

    (function () {
        window.addEventListener(
            "slide-loading-finished",
            () => {
                init();
            },
            {
                once: true,
            }
        );

        const init = () => {
            document.body.addEventListener("keydown", event => {
                if (!main.firstChild) return;

                let k = event.which;
                if ((!event.ctrlKey && k == 39) || k == 32) nextSlide(); // right arrow key/space bar
                if ((event.ctrlKey && k == 39) || k == 57)
                    goToSlide(slides.length - 1); // ctrl + right arrow
                if (!event.ctrlKey && k == 37) previousSlide(); // left arrow key
                if (event.ctrlKey && k == 37) goToSlide(0); // ctrl + left arrow key
                if (k == 84) cycleTheme(); // t key
                if (k == 68) {
                    // d key
                    if (
                        config.disabled &&
                        config.disabled.includes("dashboard")
                    )
                        return;

                    if (!dashboard.classList.contains("hidden")) {
                        showMain();
                    } else if (dashboard.classList.contains("hidden")) {
                        showDashboard();
                    }
                }
                if (k == 72) showMain(); // h key
                if (!event.ctrlKey && k >= 49 && k < 57)
                    goToSlide(Math.abs(k - 49));
            });
            updateIndicator();
        };

        const cycleTheme = ref => {
            if (ref) {
                if (
                    window.matchMedia("(prefers-color-scheme:dark)").matches ==
                    true
                ) {
                    document.body.classList.add("dark");
                    return;
                }
            }

            let i = 0;

            config.themes.forEach(item => {
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

        cycleTheme("init");

        indicator.addEventListener("click", showDashboard);
    })();
});

const dispatch = (event, data, location) => {
    let customEvent = new CustomEvent(event, data);
    location.dispatchEvent(customEvent);
};

const loadSlides = data => {
    let inferredDir;
    let loadTimes = {};
    const fetchSlide = slide => {
        if (slide == config.index && !config.slideDir)
            inferredDir = `${slide.split("/")[0]}/`;
        if (!slide.includes("/"))
            slide = `${config.slideDir || inferredDir}${slide}`;

        let name = slide
            .split("/")
        [slide.split("/").length - 1].replace(".html", "");

        slides.push(name);

        loadTimes[name] = {
            timer: new Timer(name),
            name: name,
        };

        loadTimes[name].timer.start();
        return load(slide.replace(".html", ""))
            .then(item => {
                const register = element => {
                    if (element != null && element != false) {
                        slideContent.push(element);

                        loadTimes[name].timer.stop();

                        let newPreview = buildElement(
                            `p`,
                            {
                                className: "slide-preview",
                                data_slide_index: name,
                            },
                            `Loaded slide "${
                            slideContent[slides.length - 1].dataset.title ||
                            slides[slides.length - 1]
                            }," in ${
                            loadTimes[name].timer.elapsedMilliseconds
                            }ms (${loadTimes[name].timer.elapsedSeconds}s)`
                        );

                        let newPreviewStatus = buildElement(`span`, {
                            className: "slide-preview-status loading",
                        });

                        newPreview.prepend(newPreviewStatus);

                        window.addEventListener("slide-loaded", event => {
                            if (event.detail != name) return;
                            newPreviewStatus.classList.remove("loading");
                            newPreviewStatus.classList.add("loaded");
                        });

                        window.addEventListener(
                            "slide-loading-failed",
                            event => {
                                if (event.detail != slides.indexOf(name))
                                    return;
                                newPreviewStatus.classList.remove("loading");
                                newPreviewStatus.classList.add(
                                    "loading-failed"
                                );
                            }
                        );

                        newPreview.addEventListener("click", () => {
                            goToSlide(
                                slides.indexOf(newPreview.dataset.slideIndex)
                            );
                        });

                        if (document.querySelector(".slide-preview-container"))
                            document
                                .querySelector(".slide-preview-container")
                                .appendChild(newPreview);

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
                            Object.values(loadTimes).forEach(
                                item => (t += item.timer.elapsedMilliseconds)
                            );
                            status.slides = {
                                loaded: true,
                                percentage: 100,
                                duration: t,
                            };

                            dispatch(
                                "slide-loading-finished",
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

                        if (
                            document.querySelector(
                                `p[data-slide-index="${slides.indexOf(name)}"]`
                            )
                        ) {
                            document
                                .querySelector(
                                    `p[data-slide-index="${slides.indexOf(
                                        name
                                    )}"]`
                                )
                                .classList.remove("loading");
                            document
                                .querySelector(
                                    `p[data-slide-index="${slides.indexOf(
                                        name
                                    )}"]`
                                )
                                .classList.add("loading-failed");
                        } else {
                            let newPreviewMessage = buildElement(
                                `p`,
                                {
                                    className: "slide-preview",
                                    data_slide_index: name,
                                },
                                `Failed to load slide ${
                                slideContent.length + 1
                                }`
                            );

                            let newPreviewStatus = buildElement(`span`, {
                                className:
                                    "slide-preview-status loading-failed",
                            });

                            newPreviewMessage.prepend(newPreviewStatus);

                            document
                                .querySelector(".slide-preview-container")
                                .appendChild(newPreviewMessage);
                        }
                    }
                };

                if (Array.isArray(item)) {
                    return item[0].then(element => {
                        register(element);
                    });
                } else {
                    register(item);
                }
            })
            .catch(err => {
                dispatch(
                    `slide-loading-failed`,
                    {
                        detail: slides.indexOf(name),
                    },
                    window
                );
            });
    };

    fetchSlide(data.index).then(() => {
        if (!config.default || config.default == "slides") {
            if (!window.location.hash && config.permalinks)
                history.pushState(
                    ``,
                    document.title,
                    `#${config.permalinks == "name" ? slides[0] : 1}`
                );
            if (!config.permalinks)
                document
                    .querySelector(".main")
                    .insertBefore(
                        slideContent[0],
                        document.querySelector(".main").firstChild
                    );
            document.querySelector(".main").classList.remove("hidden");
        }
    });
};

const addLoadIndicator = (type, duration) => {
    if (duration) {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: `${
                        type == "Everything" ? "loading-indicator-success" : ""
                        }`,
                },
                `${type} loaded in ${duration}ms (${Timer.toSeconds(
                    duration
                )}s)`
            )
        );
    } else if (duration == 0) {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: "loading-indicator-version",
                },
                `${type}`
            )
        );
    } else {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: "loading-indicator-failure",
                },
                `Failed to load ${type}.`
            )
        );
    }
};

window.addEventListener(
    "slide-loading-finished",
    event => {
        if (window.location.hash) {
            let s;
            if (config.permalinks == "name")
                s = slides.indexOf(window.location.hash.replace("#", ""));
            if (config.permalinks == "index")
                s = window.location.hash.replace("#", "") - 1;
            goToSlide(s);
        }

        document.title = main.firstChild.dataset.title || document.title;

        if (config.prod) {
            caches.open(`moulin-${config.version}`).then(cache => {
                cache
                    .keys()
                    .then(data => {
                        if (data.length != 0) {
                            addLoadIndicator(
                                `${event.detail.slides} slides (cached)`,
                                event.detail.data.duration
                            );
                        } else {
                            addLoadIndicator(
                                `${event.detail.slides} slides`,
                                event.detail.data.duration
                            );
                        }
                    })
                    .then(() => {
                        let t = 0;
                        Object.values(status).forEach(
                            item => (t += item.duration)
                        );
                        addLoadIndicator(`Everything`, t);
                    });
            });
        } else {
            addLoadIndicator(
                `${event.detail.slides} slides`,
                event.detail.data.duration
            );

            let t = 0;
            Object.values(status).forEach(item => (t += item.duration));
            addLoadIndicator(`Everything`, t);
        }
    },
    { once: true }
);

export { dispatch, main, preview, dashboard };
