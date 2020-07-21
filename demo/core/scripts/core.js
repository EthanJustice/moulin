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
		'hooks',
		'template',
		'cache',
		'config',
		'controls',
		'fetch',
		'parse',
		'responsive',
		'timing'
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
		}, { once: true });
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

let skeleton = {
	'main': document.querySelector('.visible'),
	'toolbar': document.querySelector('.visible')
};

const buildTemplates = () => {
	let loaded = [];
	Object.entries(skeleton).forEach(item => {
		loaded.push(item[0])
		loadTemplate(item[0]).then(element => {
			item[1].appendChild(element);
			element.addEventListener('script-loaded', () => {
				dispatch('template-loaded', {
					detail: ''
				}, element);
			}, { once: true });
		});
	});
}

start();