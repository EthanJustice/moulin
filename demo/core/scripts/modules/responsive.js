// resizing

const updateSizes = () => {
    document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`)
    document.documentElement.style.setProperty('--window-width', `${window.innerWidth}px`)
};

updateSizes();

window.addEventListener('resize', () => updateSizes());

const setTheme = (media = false) => {
    const update = () => {
        let themeSheet = document.querySelector('link[id="theme-sheet"]');
        if (media) {
            if (window.matchMedia('(prefers-color-scheme:dark)') && config.themes.indexOf('dark')) {
                themeSheet.href = `core/stylesheets/themes/dark.css`;
            } else { return }
        } else if (media == false) {
            let current = themeSheet.href.split('themes/')[1].split('.css')[0];

            let theme = config.themes.indexOf(current) + 1;
            if (config.themes.length <= theme) { theme = 0 }

            themeSheet.href = `core/stylesheets/themes/${config.themes[theme]}.css`;
        }
    }

    if (!config) {
        getConfig().then(data => {
            config = data;
            update();
        });
    } else { update() }
}

window.addEventListener('load', () => setTheme(true));