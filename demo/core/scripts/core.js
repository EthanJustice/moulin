let modStatus = {
	loaded: false,
	percentage: 0
};

async function getConfig() {
	return await fetch('./config.json').then(resp => { return resp.json() });
}

let config;
getConfig().then(data => {
	config = data;
});

const start = () => {
	const modList = [
		'cache',
		'config',
		'controls',
		'fetch',
		'parse',
		'responsive',
		'template',
		'timing',
		'translate'
	];

	const modContainer = buildElement('div', {
		id: 'scripts',
	});

	modList.forEach((item, index) => {
		let script = buildElement('script', {
			src: `core/scripts/modules/${item}.js`
		});

		modContainer.appendChild(script);

		script.addEventListener('load', () => {
			modStatus.percentage = parseInt(((index + 1) / modList.length) * 100);
			modStatus.loaded == true && script.src.replace(window.location.href, '').replace('core/scripts/modules/', '').replace('.js', '') == modList[modList.length - 1] ? buildTemplates() : null;
		});
	});

	document.body.appendChild(modContainer);

	modStatus = {
		loaded: true,
		percentage: 100
	};
};

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState == 'visible') {
		document.body.classList.remove('hidden')
		document.body.classList.add('fadeIn');
		document.body.addEventListener('animationend', () => document.body.classList.remove('fadeIn'), { once: true });
	} else {
		document.body.classList.add('hidden');
	}
});

const buildTemplates = () => {
	loadTemplate('toolbar', document.body);
}

start();