// resizing

const updateSizes = () => {
    document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`)
    document.documentElement.style.setProperty('--window-width', `${window.innerWidth}px`)
};

updateSizes();

window.addEventListener('resize', () => updateSizes());