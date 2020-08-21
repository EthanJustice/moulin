// controls
import { config, dispatch, main, index, dashboard, slideContent, slides } from '../core.js';

// shows the slides
const showMain = () => {
    if (!main.classList.contains('hidden')) return;
    dispatch(`before-slides-opened`, {}, window);
    main.classList.remove('hidden');
    index.classList.add('hidden');
    dashboard.classList.add('hidden');
    dispatch(`after-slides-opened`, {}, window);
};

// shows the dashboard
const showDashboard = () => {
    if (!dashboard.classList.contains('hidden')) return;
    dispatch(`before-dashboard-opened`, {}, window);
    main.classList.add('hidden');
    index.classList.add('hidden');
    dashboard.classList.remove('hidden');
    dispatch(`after-dashboard-opened`, {}, window);
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

export { showMain, showDashboard, showIndex, updateIndicator, goToSlide };
