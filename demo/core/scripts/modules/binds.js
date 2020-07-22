// controls
const showMain = () => {
    document.querySelector('.main').classList.remove('hidden');
    document.querySelector('.dashboard').classList.add('hidden');
}

const openDashboard = () => {
    document.body.querySelector('.main').classList.add('hidden');
    document.body.querySelector('.dashboard').classList.remove('hidden');
    document.body.querySelector('.main').firstChild.remove();
    document.body.querySelector('.main').insertBefore(slideContent[0], document.body.querySelector('.main').firstChild);
}

const updateIndicator = () => {
    let slideName = document.querySelector('.main').firstChild;
    let current = 0;

    if (slideName) {
        current = slides.indexOf(slideName.dataset.slideName);
    } else if (window.location.search) {
        current = window.location.search.replace('?', '');
    }

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

    if (slideContent.length != 0 && current != 0) {
        currentSlide.remove();
        document.querySelector('.main').insertBefore(slideContent[current - 1], document.querySelector('.main').firstChild);

        updateIndicator();
        dispatch('slide-change', { detail: current - 1 }, window);
    }
}

const goToSlide = (slide) => {
    showMain();

    let currentSlide = document.querySelector('.main').firstChild;
    let current = typeof slide == 'string' ? slides.indexOf(currentSlide.dataset.slideName) : slide;

    if (slideContent.length != 0 && current != slides.length) {
        currentSlide.remove();
        document.querySelector('.main').insertBefore(slideContent[current], document.querySelector('.main').firstChild);

        updateIndicator();
        dispatch('slide-change', { detail: current }, window);
    }
}

(function () {
    window.addEventListener('slide-loading-finished', () => {
        updateIndicator();
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
                    openDashboard()
                } else {
                    showMain();
                }
            }
        });
    }, { once: true });

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