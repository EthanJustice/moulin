(function () {
    let scope = document.querySelector('.toolbar')

    scope.addEventListener('template-loaded', () => {
        scope.classList.remove('hidden');
    }, { once: true });

    let settings = scope.querySelector('a[id="toolbar-settings"]');
    let theme = scope.querySelector('a[id="toolbar-theme"]');
    let shortcuts = scope.querySelector('a[id="toolbar-shortcuts"]');

    theme.addEventListener('click', () => {
        setTheme();
    });

    let shortcutsContainer = loadTemplate('shortcuts');
    shortcuts.addEventListener('click', () => {
        if (document.querySelector('.main').querySelector('.shortcuts')) {
            document.querySelector('.main').querySelector('.shortcuts').remove();
        } else if (!document.querySelector('.main').querySelector('.shortcuts')) {
            shortcutsContainer.then((element) => document.querySelector('.main').appendChild(element));
        }
    });
}());