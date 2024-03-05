import { signal } from "pozitron-js";
import { For, StaticFor } from '../pozitron-web';
import { Draggable } from "../libs/draggable";
import { delegateEvent } from "../libs/utils";

function PanelItemsPalette({ buttonCategories, appendItem, isShow, onClose }) {
	let titleEl, itemsPaletteEl;
	let [dragging, setDragging] = signal(false);

	function setup(el) {
		Draggable(el, {
			grabEl: titleEl,
			started: () => setDragging(true),
			finished: () => setDragging(false),
		});

		delegateEvent(itemsPaletteEl, '.items-palette-button', 'click', (el) => el.clickAddItem());
	}

	return (
		<div
			ref={(el) => setup(el)} style={{ top: '100px', left: '913px' }} show={isShow}
			id="panel-items-palette" class="modal" classList={{ dragging }}
		>
			<div class="modal-header">
				<div class="modal-header-title" ref={titleEl}>Панель производства</div>
				<button class="modal-header-button button-close" onClick={onClose}><i class="mdi mdi-close" /></button>
			</div>
			<div class="modal-content" ref={itemsPaletteEl}>
				<StaticFor each={buttonCategories}>{ buttonCategory => (
					<div class="items-palette-section" show={buttonCategory.hasButtons}>
						<div class="items-palette-section-title">{buttonCategory.title}</div>
						<For each={buttonCategory.getButtons} key="key">{ button => {
							const clickAddItem = () => appendItem(button.typeId);
							return (
								<button title={button.name} class="items-palette-button" ref={el => el.clickAddItem = clickAddItem} disabled={button.isDisabled ? '' : undefined}>
									<div style={{ 'background-image': `url('./resources/${button.icon}')` }} class="production-icon" />
								</button>
							);
						}}</For>
					</div>)}
				</StaticFor>
			</div>
		</div>
	);
}

/* <div class="items-palette-section">
<div class="items-palette-section-title">Строения</div>
<button class="items-palette-button">
	<div style="background-image: url('/resources/building-terran-barracks.png');" class="production-icon"></div>
</button>
</div>
<div class="items-palette-section">
<div class="items-palette-section-title">Юниты</div>
<button class="items-palette-button">
	<div style="background-image: url('/resources/unit-terran-marine.png');" class="production-icon"></div>
</button>
</div>
<div class="items-palette-section">
<div class="items-palette-section-title">Улучшения</div>
<button class="items-palette-button">
	<div style="background-image: url('/resources/ability-terran-stimpack-color.png');" class="production-icon"></div>
</button>
</div> */

export default PanelItemsPalette;