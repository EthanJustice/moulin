(function () {
    let scope = document.querySelector('.toolbar')

    scope.classList.remove('hidden');

    let settings = scope.querySelector('p[id="toolbar-settings"]');
    let theme = scope.querySelector('p[id="toolbar-theme"]');
    let shortcuts = scope.querySelector('p[id="toolbar-shortcuts"]');

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