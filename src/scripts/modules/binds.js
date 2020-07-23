// controls
const showMain = () => {
    document.body.querySelector('.main').classList.remove('hidden');
    document.body.querySelector('.dashboard').classList.add('hidden');
    document.body.querySelector('.slide-preview-container').classList.add('hidden');
}

const showDashboard = () => {
    document.body.querySelector('.main').classList.add('hidden');
    document.body.querySelector('.dashboard').classList.remove('hidden');
    document.body.querySelector('.slide-preview-container').classList.add('hidden');
}

const showSlides = () => {
    document.body.querySelector('.main').classList.add('hidden');
    document.body.querySelector('.dashboard').classList.add('hidden');
    document.body.querySelector('.slide-preview-container').classList.remove('hidden');
}

const updateIndicator = () => {
    let slideName = document.querySelector('div[data-slide-name]');
    let current = 0;

    if (slideName && slideName.dataset.slideName) {
        current = slides.indexOf(slideName.dataset.slideName);
    } else if (window.location.search) {
        current = window.location.search.replace('?', '');
    } else { current = 0 }

    if ((current + 1) < 1) { current = 1 }

    let slideIndicator = document.querySelector(`#slide-indicator`);
    slideIndicator.innerText = `${current + 1}/${slides.length}`;
}

const nextSlide = () => {
    let currentSlide = document.querySelector('.main').firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (slideContent.length !== 0 && current != slides.length - 1) {
        if (document.querySelector('.dashboard').classList.contains('hidden')) current += 1

        currentSlide.remove();
        document.querySelector('.main').insertBefore(slideContent[current], document.querySelector('.main').firstChild);

        updateIndicator();
        dispatch('slide-change', { detail: current }, window);
    }
    showMain();
}

const previousSlide = () => {
    showMain();

    let currentSlide = document.querySelector('.main').firstChild;
    let current = slides.indexOf(currentSlide.dataset.slideName);

    if (current != 0) {
        currentSlide.remove();
        document.querySelector('.main').insertBefore(slideContent[current - 1], document.querySelector('.main').firstChild);

        updateIndicator();
        dispatch('slide-change', { detail: current - 1 }, window);
    }
}

const goToSlide = (slide) => {
    let currentSlide = document.querySelector('.main').firstChild;
    let current = typeof slide == 'string' ? slides.indexOf(currentSlide.dataset.slideName) : slide;

    if (slides.indexOf(currentSlide.dataset.slideName) == 0 && current <= 0 || slides.indexOf(currentSlide.dataset.slideName) == slides.length - 1 && current >= slides.length - 1) return

    showMain();

    if (current != slides.length) {
        currentSlide.remove();
        document.querySelector('.main').insertBefore(slideContent[current], document.querySelector('.main').firstChild);

        updateIndicator();
        dispatch('slide-change', { detail: current }, window);
    }
}

(function () {
    window.addEventListener('slide-loading-finished', () => init(), { once: true });
    window.addEventListener('slide-loading-failed', () => init(), { once: true })

    const init = () => {
        document.body.addEventListener('keydown', event => {
            if (!document.querySelector('.main').firstChild) return

            let k = event.which;
            if (!event.ctrlKey && k == 39 || k == 32) nextSlide() // right arrow key/space bar
            if (event.ctrlKey && k == 39) goToSlide(slides.length - 1) // ctrl + right arrow
            if (!event.ctrlKey && k == 37) previousSlide() // left arrow key
            if (event.ctrlKey && k == 37) goToSlide(0) // ctrl + left arrow key
            if (k == 84) cycleTheme() // t key
            if (k == 68) { // d key
                if (document.querySelector('.dashboard').classList.contains('hidden') == true) {
                    showDashboard();
                } else {
                    showMain();
                }
            }
            if (k == 83) {
                if (document.querySelector('.slide-preview-container').classList.contains('hidden') == true) {
                    showSlides();
                } else {
                    showMain();
                }
            }
        });
        updateIndicator();
    }

    const cycleTheme = (ref) => {
        if (ref) {
            if (window.matchMedia('(prefers-color-scheme:dark)').matches == true) {
                document.body.classList.add('dark');
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
    }

    cycleTheme('init')
}());