import { delegateEvent } from "./utils";

let current;

function updatePosition(drag, event) {
	drag.x = (event.clientX - drag.startX);
	drag.y = (event.clientY - drag.startY);
	if (drag.move) {
		drag.move(drag);
	} else {
		drag.el.style.left = drag.x + 'px';
		drag.el.style.top = drag.y + 'px';
	}
}

document.addEventListener('mouseup', function(event) {
	if (!current) {
		return;
	}
	if (current.finished) {
		current.finished(current.el, current.x, current.y);
	}
	current = undefined;
});
document.addEventListener('mousemove', function(event) {
	if (!current) {
		return;
	}
	updatePosition(current, event);
});

export function handleDragScroll(deltaX, deltaY) {
	if (!current) {
		return;
	}
	current.startX += deltaX;
	current.startY += deltaY;
	current.x -= deltaX;
	current.y -= deltaY;
	if (current.move) {
		current.move(current);
	} else {
		current.el.style.left = current.x + 'px';
		current.el.style.top = current.y + 'px';
	}
};


export const MOUSE_BUTTON_LEFT = 0;
export const MOUSE_BUTTON_RIGHT = 2;

export function Draggable(el, options = {}) {
	const { grabEl = el, started, finished, move, buttons = [MOUSE_BUTTON_LEFT] } = options;
	const drag = {
		el, startX: 0, startY: 0, x: 0, y: 0,
		finished, move,
	};

	grabEl.addEventListener('mousedown', function(event) {
		if (buttons && !buttons.includes(event.button)) {
			return;
		}
		event.preventDefault();
		current = drag;
		current.startX = event.clientX - el.offsetLeft;
		current.startY = event.clientY - el.offsetTop;
		if (started) {
			started(el);
		}
		updatePosition(current, event);
	});
}

export function DelegateDraggable(containerEl, selector, options = {}) {
	const { started, finished, move, buttons = [MOUSE_BUTTON_LEFT], placeholder = false } = options;
	// todo: grabEl

	let placeholderEl;

	const drag = {
		el: undefined, startX: 0, startY: 0, x: 0, y: 0,
		finished(el, x, y) {
			if (placeholder) {
				placeholderEl.remove();
				placeholderEl = undefined;
			}
			if (finished) {
				finished(el, x, y);
			}
		},
		move,
	};

	delegateEvent(containerEl, selector, 'mousedown', (el, event) => {
		if (buttons && !buttons.includes(event.button)) {
			return;
		}
		event.preventDefault();
		current = drag;
		current.el = el;
		current.startX = event.clientX - el.offsetLeft;
		current.startY = event.clientY - el.offsetTop;
		if (started) {
			started(el, event);
		}
		updatePosition(current, event);
		if (placeholder) {
			placeholderEl = document.createElement('div');
			// placeholderEl.className = 'drag-placeholder';
			placeholderEl.style.height = el.offsetHeight + 'px';
			el.insertAdjacentElement('beforebegin', placeholderEl);
		}
	});

}