window.addEventListener(`script-loaded`, (event) => {
    if (event.detail != 'slides' && event.detail.link != `${window.location.href.replace(window.location.hash, '')}slides/tour-slides.js`) return
    console.error(`This message is brought to you buy (<- intended) tour-slides!`)
});
