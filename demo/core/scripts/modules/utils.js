const createElement = (type, text, attributes) => {
	let elem = document.createElement(type);
	elem.innerText = text || null;
	if (attributes) {
		Object.keys(attributes).forEach(item => {
			if (item.includes('data_')) { elem.dataset[item.slice(4)] = attributes[item] }
			else if (item == 'class') {
				attributes[item].split(' ').forEach(val => elem.classList.add(val));
			}
			else { elem[item] = attributes[item] }
		});
	}

	return elem;
}
