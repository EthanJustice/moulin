// controls
(function () {
    document.body.addEventListener('keydown', event => {
        let k = event.which;
        if (k == 39 || k == 32) nextSlide() // right arrow key/space bar
        if (k == 37) previousSlide()
    });

    const nextSlide = () => {
        let currentSlide = document.querySelector('.main').firstChild;
        let current = slides.indexOf(currentSlide.dataset.slideName);

        if (slideContent.length !== 0 && current != slides.length - 1) {
            currentSlide.remove();
            document.querySelector('.main').appendChild(slideContent[current + 1]);
        }
    }

    const previousSlide = () => {
        let currentSlide = document.querySelector('.main').firstChild;
        let current = slides.indexOf(currentSlide.dataset.slideName);

        if (slideContent.length != 0 && current != 0) {

            currentSlide.remove();
            document.querySelector('.main').appendChild(slideContent[current - 1]);
        }
    }
}());