// controls
(function () {
    document.body.addEventListener('keydown', event => {
        let k = event.which;
        if (k == 39 || k == 32) nextSlide() // right arrow key/spacebar
    });

    const nextSlide = () => {
        if (slideContent.length !== 0) {
            let currentSlide = document.querySelector('.main').firstChild;
            let current = slides.indexOf(currentSlide.dataset.slideName);

            currentSlide.remove();
            document.querySelector('.main').appendChild(slideContent[current + 1]);
        }
    }
}());