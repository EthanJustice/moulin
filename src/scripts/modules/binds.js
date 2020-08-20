// controls
import { config, dispatch, main, index, dashboard, slideContent, slides } from '../core.js';

// shows the slides
const showMain = () => {
    if (!main.classList.contains('hidden')) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove('hidden');
    index.classList.add('hidden');
    dashboard.classList.add('hidden');
};

// shows the dashboard
const showDashboard = () => {
    if (!dashboard.classList.contains('hidden')) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add('hidden');
    index.classList.add('hidden');
    dashboard.classList.remove('hidden');
};

// shows the index menu
const showIndex = () => {
    if (!index.classList.contains('hidden')) return;
    dispatch(`before-index-opened`, {}, window);
    main.classList.add('hidden');
    dashboard.classList.add('hidden');
    index.classList.remove('hidden');

    history.pushState('', `Table of Contents`, '#toc');
    dispatch(`after-index-opened`, {}, window);
};

// updates the slide indicator in the bottom left corner
const updateIndicator = () => {
    let slideName = document.querySelector('div[data-slide-name]');
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

// goes to the next slide
const nextSlide = () => {
    let currentSlide = main.firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (slideContent.length !== 0 && current != slides.length - 1) {
        if (dashboard.classList.contains('hidden')) current += 1;

        dispatch('before-slide-change', { detail: { old: current, new: current + 1 } }, window);
        currentSlide.remove();
        main.insertBefore(slideContent[current], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title || originalTitle || document.title,
                `#${config.permalinks == 'name' ? slides[current] : current + 1}`
            );
        document.title = main.firstChild.dataset.title || originalTitle || document.title;
        dispatch('after-slide-change', { detail: { old: current, new: current + 1 } }, window);
    }
    showMain();
};

// goes to the previous slide
const previousSlide = () => {
    showMain();

    let currentSlide = main.firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (current != 0) {
        dispatch('before-slide-change', { detail: { new: current - 1, previous: current } }, window);
        currentSlide.remove();
        main.insertBefore(slideContent[current - 1], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title || originalTitle || document.title,
                `#${config.permalinks == 'name' ? slides[current - 1] : current}`
            );
        document.title = main.firstChild.dataset.title || originalTitle || document.title;
        dispatch('after-slide-change', { detail: { new: current - 1, previous: current } }, window);
    }
};

// goes to the specified slide
// this can either be a number corresponding to a slide (starting at 0),
// or the name of a slide which is matched against the global `slides` variable
const goToSlide = (slide, force) => {
    if (force == true) showMain();
    let currentSlide = main.firstChild;
    let previous = slides.indexOf(main.dataset.slideName);
    let current = typeof slide == 'string' ? slides.indexOf(slide) : slide;
    if (currentSlide.id == 'slide-indicator') {
        main.insertBefore(slideContent[current], main.firstChild);
        return;
    }

    if (
        (slides.indexOf(currentSlide.dataset.slideName) == 0 && current <= 0) ||
        (slides.indexOf(currentSlide.dataset.slideName) == slides.length - 1 && current >= slides.length - 1)
    )
        return;

    if (current != slides.length) {
        dispatch('before-slide-change', { detail: { old: previous, new: current } }, window);
        currentSlide.remove();
        main.insertBefore(slideContent[current], main.firstChild);

        updateIndicator();
        if (config.permalinks)
            history.pushState(
                ``,
                main.firstChild.dataset.title || originalTitle || document.title,
                `#${config.permalinks == 'name' ? slides[current] : current + 1}`
            );
        document.title = main.firstChild.dataset.title || originalTitle || document.title;
        dispatch('after-slide-change', { detail: { old: previous, new: current } }, window);
    }
};

export { showMain, showDashboard, showIndex, updateIndicator, nextSlide, previousSlide, goToSlide };
