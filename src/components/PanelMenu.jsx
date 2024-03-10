
function PanelMenu({ handleUndo, handleRedo, canUndo, canRedo }) {
	document.addEventListener('keydown', function(event) {
		if (event.code === 'KeyZ' &&event.ctrlKey && !event.shiftKey && !event.altKey) {
			handleUndo();
		}
	});
	document.addEventListener('keydown', function(event) {
		if (event.code === 'KeyY' && event.ctrlKey && !event.shiftKey && !event.altKey) {
			handleRedo();
		}
	});

	function handleClickUndo(event) {
		event.target.closest('.menu-button').blur();
		handleUndo();
	}

	function handleClickRedo(event) {
		event.target.closest('.menu-button').blur();
		handleRedo();
	}

	return (
		<div id="panel-menu">
			<button
				class="menu-button" title="Сохранить"
			><i class="mdi mdi-content-save" /></button>
			<button
				class="menu-button" title="Загрузить"
			><i class="mdi mdi-folder" /></button>
			<button
				class="menu-button" title="Отменить (Ctrl + Z)"
				disabled={() => canUndo() ? undefined : ''}
				onClick={handleClickUndo}
			><i class="mdi mdi-undo" /></button>
			<button
				class="menu-button" title="Повторить (Ctrl + Y)"
				disabled={() => canRedo() ? undefined : ''}
				onClick={handleClickRedo}
			><i class="mdi mdi-redo" /></button>
		</div>
	);
}

export default PanelMenu;