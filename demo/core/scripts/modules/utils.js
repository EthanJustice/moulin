// General utilities

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
	console.error(err);
}