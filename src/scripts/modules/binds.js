// controls
const showMain = () => {
    if (!main.classList.contains("hidden")) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove("hidden");
    dashboard.classList.add("hidden");
    preview.classList.add("hidden");
};

const showDashboard = () => {
    if (!dashboard.classList.contains("hidden")) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.remove("hidden");
    preview.classList.add("hidden");
};

const showPreview = () => {
    if (!preview.classList.contains("hidden")) return;
    dispatch(`preview-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.add("hidden");
    preview.classList.remove("hidden");
};

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
    indicator.innerText = `${current + 1}/${slides.length}`;
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

(function () {
    window.addEventListener("slide-loading-finished", () => init(), {
        once: true,
    });
    window.addEventListener("slide-loading-failed", () => init(), {
        once: true,
    });

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
                if (dashboard.classList.contains("hidden") == true) {
                    showDashboard();
                } else {
                    showMain();
                }
            }
            if (k == 83) {
                // s key
                if (document.querySelector(".slide-preview-container") && document.querySelector(".slide-preview-container").classList.contains("hidden") == true) {
                    showPreview();
                } else {
                    showMain();
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
                window.matchMedia("(prefers-color-scheme:dark)").matches == true
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

    indicator.addEventListener("click", showPreview);
})();
