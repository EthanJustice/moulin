// scopes css
const scopeCSS = (element) => {
    if (!element.querySelector('style')) { return element }
    let sheet = element.querySelector('style');
    Object.values(sheet.sheet.rules).forEach(item => {
        if (!item.cssText.includes('@')) {
            element.querySelectorAll(item.selectorText).forEach(child => {
                Object.values(item.style).forEach(prop => {
                    child.style[prop] = item.style[prop];
                });
            });
        }
    });

    sheet.remove();

    return element;
}