let modStatus = {
	loaded: false,
	percentage: 0
};

const start = () => {
	const modList = [
		'config',
		'controls',
		'fetch',
		'template',
		'timing',
		'translate',
		'utils'
	];

	const modContainer = document.createElement('div');
	modContainer.id = 'scripts';

	modList.forEach((item, index) => {
		let script = document.createElement('script');
		script.src = `core/scripts/modules/${item}.js`;
		script.defer = true;
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

const buildTemplates = () => {
	let load = startTimer();
	loadTemplate('toolbar', document.body);
	stopTimer(load);
}

start();