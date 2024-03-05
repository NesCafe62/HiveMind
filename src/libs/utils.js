
export function delegateEvent(containerEl, selector, eventType, fn) {
	containerEl.addEventListener(eventType, function(event) {
		const el = event.target.closest(selector);
		if (el) {
			fn(el, event);
		}
	});
}

export function divideInt(x, y) {
	return ~~(x / y);
}

export function clamp(value, min, max) {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}
	return value;
}