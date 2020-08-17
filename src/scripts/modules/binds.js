// controls
import { config, dispatch, main, index, dashboard, slideContent, slides } from "../core.js";

const showMain = () => {
    if (!main.classList.contains("hidden")) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove("hidden");
    index.classList.add("hidden");
    dashboard.classList.add("hidden");
};

const showDashboard = () => {
    if (!dashboard.classList.contains("hidden")) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add("hidden");
    index.classList.add("hidden");
    dashboard.classList.remove("hidden");
};

const showIndex = () => {
    if (!index.classList.contains("hidden")) return;
    dispatch(`index-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.add("hidden");
    index.classList.remove("hidden");

    history.pushState('', `Table of Contents`, '#toc');
};

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

    showMain();

    if ((slides.indexOf(currentSlide.dataset.slideName) == 0 && current <= 0) || (slides.indexOf(currentSlide.dataset.slideName) == slides.length - 1 && current >= slides.length - 1)) return;

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

export { showMain, showDashboard, showIndex, updateIndicator, nextSlide, previousSlide, goToSlide };
