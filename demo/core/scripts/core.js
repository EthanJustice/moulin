let modStatus = {
	loaded: false,
	percentage: 0
};

const modLoader = () => { // Loads modules to avoid having HTML shell have them all pre-set
	const modList = [
		'config',
		'timing',
		'translate',
		'utils'
	];

	modList.forEach((item, index) => {
		let script = document.createElement('script');
		script.src = `core/scripts/modules/${item}.js`;
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		modStatus.percentage = ((index + 1) / modList.length) * 100;
	});

	modStatus = {
		loaded: true,
		percentage: 100
	};
};

modLoader();
