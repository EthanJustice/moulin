// controls
(function () {
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


    window.addEventListener('slide-loading-finished', () => {
        updateIndicator();
    }, { once: true });

    document.body.addEventListener('keydown', event => {
        if (!document.querySelector('.main').firstChild) return

        let k = event.which;
        if (k == 39 || k == 32) nextSlide() // right arrow key/space bar
        if (k == 37) previousSlide()
        if (k == 84) cycleTheme()
    });

    const nextSlide = () => {
        let currentSlide = document.querySelector('.main').firstChild;
        let current = slides.indexOf(currentSlide.dataset.slideName);

        if (slideContent.length !== 0 && current != slides.length - 1) {
            currentSlide.remove();
            document.querySelector('.main').appendChild(slideContent[current + 1]);

            updateIndicator();
            dispatch('next-slide', { detail: current + 1 }, window);
        }
    }

    const previousSlide = () => {
        let currentSlide = document.querySelector('.main').firstChild;
        let current = slides.indexOf(currentSlide.dataset.slideName);

        if (slideContent.length != 0 && current != 0) {

            currentSlide.remove();
            document.querySelector('.main').appendChild(slideContent[current - 1]);

            updateIndicator();
            dispatch('previous-slide', { detail: current - 1 }, window);
        }
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