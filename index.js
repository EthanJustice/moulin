document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'visible') {
        document.body.classList.remove('hidden');
        document.body.classList.add('fadeIn');
        document.body.addEventListener('animationend', () => document.body.classList.remove('fadeIn'), { once: true });
    } else {
        document.body.classList.add('hidden');
    }
});
