(function () {
    let scope = document.querySelector('.toolbar')

    scope.classList.remove('hidden');

    let settings = scope.querySelector('p[id="toolbar-settings"]');
    let theme = scope.querySelector('p[id="toolbar-theme"]');
    let shortcuts = scope.querySelector('p[id="toolbar-shortcuts"]');

    theme.addEventListener('click', () => {
        setTheme();
    });
}());