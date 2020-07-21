// scopes css
const scopeCSS = (element) => {
    if (!element.querySelector('style')) { return element }
    let sheet = element.querySelector('style');
    Object.values(sheet.sheet.rules).forEach(item => {
        if (!item.cssText.includes('@') && !item.cssText.includes(':')) {
            element.querySelectorAll(item.selectorText).forEach(child => {
                Object.values(item.style).forEach(prop => {
                    child.style[prop] = item.style[prop];
                });
            });
        } else if (item.cssText.includes(':')) {
            document.styleSheets[0].insertRule(item.cssText, 0);
        }
    });

    sheet.remove();

    return element;
}

/*
    if (!element.querySelector('script')) return element
    let link = element.querySelector('script').src;

    let newScript = buildElement('script', {
        src: link
    });

    element.remove(element.querySelector('script'));
    element.appendChild(newScript);
*/

const renderJS = (element) => {
    if (!element.querySelector('script')) return element
    let link = element.querySelector('script').src;

    let script = buildElement('script', {
        src: link
    });

    script.addEventListener('load', () => {
        dispatch('script-loaded', {}, element);
    }, { once: true });

    element.remove(element.querySelector('script'));
    element.appendChild(script);

    dispatch('script-parsed', {}, element);

    return element;
}