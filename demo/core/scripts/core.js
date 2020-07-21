let status = {
	modules: {
		loaded: false,
		percentage: 0
	},
	templates: {
		loaded: false,
		percentage: 0
	},
	slides: {
		loaded: false,
		percentage: 0
	}
};

let slides = [];
let slideContent = [];

async function getConfig() {
	return await fetch('./config.json').then(resp => { return resp.json() });
}

let config;
getConfig().then(data => {
	config = data;
	loadSlides(data);
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
			status.modules.percentage = parseInt(((index + 1) / modList.length) * 100);
			status.modules.loaded == true && script.src.replace(window.location.href, '').replace('core/scripts/modules/', '').replace('.js', '') == modList[modList.length - 1] ? buildTemplates() : null;
		}, { once: true });
	});

	document.body.appendChild(modContainer);

	status.modules = {
		loaded: true,
		percentage: 100
	};
};

start();

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
	Object.entries(skeleton).forEach((item, index) => {
		loaded.push(item[0])
		load(`core/templates/${item[0]}`).then(element => {
			item[1].appendChild(element);
			element.addEventListener('script-loaded', () => {
				dispatch('template-loaded', {
					detail: ''
				}, element);
			}, { once: true });
			status.templates.percentage = parseInt(((index + 1) / Object.keys(skeleton).length) * 100);
			status.templates.loaded == true ? loadSlides() : null;
		});
	});
}

const loadSlides = (data) => {
	const fetchSlide = (slide) => {
		slides.push(slide);
		load(slide.replace('.html', '')).then(element => {
			slideContent.push(element);

			element.querySelectorAll('div[data-next-slide]').forEach(item => {
				if (slides.indexOf(item.dataset.nextSlide == false)) {
					fetchSlide(item.dataset.nextSlide);
				}
			});
		});
	};

	fetchSlide(data.slide);

	if (document.querySelector('.main')) {
		document.querySelector('.main').appendChild(slideContent[0]);
	} else {
		window.addEventListener('template-loaded', (event) => {
			if (event.detail.location == 'main') {
				document.querySelector('.main').appendChild(slideContent[0]);
			}
		});
	}
}