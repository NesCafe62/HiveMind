function History(limit = 100) {
	let states = [];
	let currentIndex = -1;

	function pushState(state, key = undefined) {
		let clearedFuture = false;
		if (currentIndex < states.length - 1) {
			// clear future history
			clearedFuture = true;
			states.splice(currentIndex + 1, states.length - currentIndex - 1);
		}

		// currentIndex always equal `states.length - 1` here
		if (key && !clearedFuture && key === states[currentIndex].key) {
			// replace last history item if key is the same
			states[currentIndex].data = state;
		} else {
			if (currentIndex >= limit) {
				states.copyWithin(0, 1);
				states[currentIndex] = {data: state, key};
			} else {
				states.push({
					data: state,
					key
				});
				currentIndex++;
			}
		}
	}

	function clear() { // need to add initial state after calling clear
		states = [];
		currentIndex = -1;
	}

	function canUndo() {
		return currentIndex > 0;
	}

	function canRedo() {
		return currentIndex < states.length - 1;
	}

	function undo() {
		if (!canUndo()) {
			// no previous history
			return;
		}
		currentIndex--;
		return states[currentIndex].data;
	}

	function redo() {
		if (!canRedo()) {
			// no future history
			return;
		}
		currentIndex++;
		return states[currentIndex].data;
	}

	return {
		pushState,
		undo,
		redo,
		canUndo,
		canRedo,
		clear,
	}
}

export default History;