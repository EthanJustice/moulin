// main
// utils
const buildElement = (type, attributes, text) => {
	let element = document.createElement(type);
	element.innerText = text || '';
	if (attributes) {
		Object.keys(attributes).forEach(item => {
			if (item.includes('data_')) { element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]) }
			else { element.setAttribute(item, attributes[item]) }
		});
	}
	return element;
}

const error = (msg, err) => {
	console.error(msg);
}

// core
let status = {
	modules: {
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

	start(config);

	if (config.global) {
		document.head.appendChild(buildElement('link', {
			rel: 'stylesheet',
			type: 'text/css',
			href: config.global
		}));
	}
});

const dispatch = (event, data, location) => {
	console.error(`dispatching ${event}`) // debug
	let customEvent = new CustomEvent(event, data);
	location.dispatchEvent(customEvent);
}

const start = (config) => {
	const modList = [
		'timing',
		'template',
		'parse',
		'binds',
		'cache',
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
			status.modules.loaded == true && script.src.replace(window.location.href, '').replace('core/scripts/modules/', '').replace('.js', '') == modList[modList.length - 1] ? loadSlides(config) : null;

			dispatch('script-loaded', {
				detail: {
					name: item,
					slides: slides.length
				}
			}, window);
		}, { once: true });
	});

	document.body.appendChild(modContainer);

	status.modules = {
		loaded: true,
		percentage: 100
	};

	const loadSlides = (data) => {
		const fetchSlide = (slide) => {
			if (!slide.includes('/')) slide = `${config.slideDir}${slide}`;

			let name = slide.split('/')[slide.split('/').length - 1].replace('.html', '');

			slides.push(name);
			return load(slide.replace('.html', '')).then(element => {
				element.dataset.slideName = name;
				slideContent.push(element);

				if (element.dataset.next) {
					if (slides.indexOf(element.dataset.next) == -1) {
						fetchSlide(element.dataset.next);
					}
				} else {
					dispatch('slide-loading-finished', {}, window);
				}
			});
		};

		fetchSlide(data.slide).then(() => {
			if (document.querySelector('.main')) {
				document.querySelector('.main').appendChild(slideContent[0]);
			}
		});
	}

	dispatch('core-finished', {}, window);
};
