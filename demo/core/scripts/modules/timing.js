// Timing and loading
const startTimer = () => {
	let time = 0;
	let int = setInterval(() => time += 10, 10);
	return int;
}

const stopTimer = (interval, val) => {
	clearInterval(interval);
	return val;
}