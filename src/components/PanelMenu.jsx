
import { signal } from 'pozitron-js';
import { Dynamic, StaticFor } from '../pozitron-web';
import { Races } from '../data';

function PanelMenu({ handleUndo, handleRedo, canUndo, canRedo, getRace, selectRace }) {
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

	const icons = {
		Terran: 'icon-terran',
		Zerg: 'icon-zerg',
		Protoss: 'icon-protoss',
	};

	function icon(race) {
		// <svg><use href="#icon-terran"></use></svg>
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.classList.add('race-icon');
		const use = document.createElementNS("http://www.w3.org/2000/svg", 'use');
		use.setAttribute('href', '#' + icons[race]);
		svg.appendChild(use);
		return svg;
	}

	function handleSelectRace(event, race) {
		// event.stopPropagation();
		if (race === getRace()) { // selected same race, just close dropdown menu
			setIsOpen(false);
			return;
		}
		if (race === 'Protoss') {
			event.target.closest('.menu-button-race').focus();
			return;
		}
		// todo: check isSaved() instead
		if (canUndo() && !confirm('Все несохраненные изменения будут потеряны, подтвердить выбор другой расы?')) {
			setIsOpen(false);
			return;
		}
		setIsOpen(false);
		selectRace(race);
	}

	const [isOpen, setIsOpen] = signal(false);

	function toggleIsOpen(event) {
		if (event.target.closest('.race-dropdown')) {
			return;
		}
		setIsOpen(!isOpen());
	}

	/* <Switch of={getRace}>{{
		Terran: () => icon('icon-terran'),
		Zerg: () => icon('icon-zerg'),
		Protoss: () => icon('icon-protoss'),
	}}</Switch>
	<span class="race-label">{() => getRace().toUpperCase()}</span> */

	function handleRaceButtonFocusOut(event) {
		setTimeout(() => {
			if (!document.activeElement.closest('.menu-button-race')) {
				setIsOpen(false);
			}
		}, 0);
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
			<button
				class="menu-button menu-button-race" classList={{ open: isOpen }}
				onClick={toggleIsOpen}
				onFocusOut={handleRaceButtonFocusOut}
			>
				<div class="race-dropdown">
					<StaticFor each={Races}>{(race) => (
						<button class="race-dropdown-item" onClick={(event) => handleSelectRace(event, race)}>{icon(race)}{ race.toUpperCase() }</button>)}
					</StaticFor>
				</div>
				<Dynamic value={getRace}>{race => icon(race)}</Dynamic>
				<span class="race-label">{() => getRace().toUpperCase()}</span>
				<i class="mdi mdi-chevron-down"></i>
			</button>
		</div>
	);
}

export default PanelMenu;