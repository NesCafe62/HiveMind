import { subscribe } from 'pozitron-js';
import { For } from '../pozitron-web';
import { DelegateDraggable } from '../libs/draggable';
import { DragMode } from '../data';

// const MOUSE_BUTTON_RIGHT = 2;

function ProductionColumn({ column, getPrimaryColumn, trackInvalidItems, removeItem, dragStartItem, dragMoveItem, dragFinishItem, setSelectedColumn }) {
	let columnEl, itemsEl;

	const primaryCol = column.isSecondary
		? getPrimaryColumn(column)
		: column;

	function clickAppendItem() {
		setSelectedColumn(column, columnEl);
	}

	function updateDrag(maxY) {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.dragging) {
				itemEl.style.top = (maxY - item.height - item.y) + 'px';
				itemEl.style.left = '0px';
			}
			i++;
		}
	}

	function updateDragStart() {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.dragging) {
				itemEl.classList.add('dragging');
			}
			i++;
		}
	}

	function updateDragFinish() {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.dragging) {
				itemEl.classList.remove('dragging');
				itemEl.style.top = '';
				itemEl.style.left = '';
			}
			i++;
		}
	}

	function setup(el) {
		columnEl = el;

		columnEl.updateDrag = updateDrag;
		columnEl.updateDragStart = updateDragStart;
		columnEl.updateDragFinish = updateDragFinish;

		let dragElHeight, dragMode, dragItem, columnEl2;
		DelegateDraggable(columnEl, '.production-item', {
			// placeholder: true,
			move: ({el, x, y}) => {
				if (dragMode === DragMode.Column) {
					return;
				}
				const maxY = columnEl.offsetHeight;
				if (dragMode === DragMode.Single) {
					let [newX, newY] = el.handleDragMoveItem(column, dragItem, x, maxY - dragElHeight - y);
					newY = maxY - dragElHeight - newY;
					el.style.top = newY + 'px';
					el.style.left = newX + 'px';
				} else if (dragMode === DragMode.SingleWithSecondary) {
					el.handleDragMoveItem(primaryCol, dragItem, x, maxY - dragElHeight - y);
					updateDrag(maxY);
					columnEl2.updateDrag(maxY);
				} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
					el.handleDragMoveItem(column, dragItem, x, maxY - dragElHeight - y);
					updateDrag(maxY);
					if (dragMode === DragMode.MultipleWithSecondary) {
						columnEl2.updateDrag(maxY);
					}
				}
			},
			started: (el, event) => {
				[dragMode, dragItem] = el.handleDragStartItem(event);
				if (dragMode === DragMode.Column) {
					return;
				}
				// maxY = columnEl.offsetHeight;
				dragElHeight = el.offsetHeight;
				if (dragMode === DragMode.Single) {
					el.classList.add('dragging');
				} else if (dragMode === DragMode.SingleWithSecondary) {
					updateDragStart();
					columnEl2 = column.isSecondary
						? columnEl.previousElementSibling
						: columnEl.nextElementSibling;
					columnEl2.updateDragStart();
				} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
					updateDragStart();
					if (dragMode === DragMode.MultipleWithSecondary) {
						columnEl2 = columnEl.nextElementSibling;
						columnEl2.updateDragStart();
					}
				}
			},
			finished: (el) => {
				if (dragMode === DragMode.Column) {
					return;
				}
				if (dragMode === DragMode.Single) {
					el.classList.remove('dragging');
					el.style.top = '';
					el.style.left = '';
					el.handleDragFinishItem(column, dragItem);
				} else if (dragMode === DragMode.SingleWithSecondary) {
					updateDragFinish();
					columnEl2.updateDragFinish();
					el.handleDragFinishItem(primaryCol, dragItem);
				} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
					updateDragFinish();
					if (dragMode === DragMode.MultipleWithSecondary) {
						columnEl2.updateDragFinish();
					}
					el.handleDragFinishItem(column, dragItem);
				}
			},
		});
	}

	function displayTime(time) {
		const sec = time % 60;
		const min = ~~((time - sec) / 60);
		return ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
	}

	subscribe(trackInvalidItems, () => {
		if (!itemsEl) {
			return;
		}
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.invalid) {
				itemEl.classList.add('invalid');
			} else {
				itemEl.classList.remove('invalid');
			}
			i++;
		}
	});

	function setupItems(els) {
		itemsEl = els;
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (!item.spacing) {
				const titleText = displayTime(item.time) + '  –  ' + item.name;
				itemEl.setAttribute('title', titleText);
				if (item.roundedTop) {
					itemEl.classList.add('border-top-round');
				} else {
					itemEl.classList.remove('border-top-round');
				}
				if (item.roundedBottom) {
					itemEl.classList.add('border-bottom-round');
				} else {
					itemEl.classList.remove('border-bottom-round');
				}
			}
			i++;
		}
	}

	return (
		<div class="production-column" ref={el => setup(el)}>
			<For each={column.getItems} key="id" ref={(els) => setupItems(els)}>{ item => {
				if (item.draggingPlaceholder || item.hidden) {
					return <div class="production-item-placeholder" style={{ 'min-height': item.height + 'px' }} />;
				} else if (item.spacing) {
					return <div class="production-item-space" style={{ 'min-height': item.height + 'px' }} />;
				} else {
					function clickRemoveItem(event) {
						event.preventDefault();
						removeItem(column, item);
					}
					function handleDragStartItem(event) {
						return dragStartItem(column, item, event);
					}
					function handleDragMoveItem(col, item, x, y) {
						return dragMoveItem(col, item, x, y);
					}
					function handleDragFinishItem(col, item) {
						return dragFinishItem(col, item);
					}
					// .border-bottom-round
					// .border-top-round
					return (
						<div
							class="production-item" classList={{ 'production-item-wide': item.isWide, 'production-item-fixed': item.fixed }}
							ref={ el => (
								el.clickRemoveItem = clickRemoveItem,
								el.handleDragStartItem = handleDragStartItem,
								el.handleDragMoveItem = handleDragMoveItem,
								el.handleDragFinishItem = handleDragFinishItem
							)}
							style={{ 'min-height': item.fixed ? '' : (item.height + 'px'), '--cl-bg': item.color }}
						>
							<div class="production-icon" style={{ 'background-image': `url('./resources/${item.icon}')` }} />
							<i title="Недостаточно ресурсов" class="mdi mdi-alert-rhombus-outline" />
						</div>
					);
				}
			}}</For>
			<button class="production-button-add-item" ref={el => el.clickAppendItem = clickAppendItem}><i class="mdi mdi-plus" /></button>
		</div>
	);
	// .production-button-prev
}

function ProductionColumns({ columns, getPrimaryColumn, trackInvalidItems, removeItem, dragStartItem, dragMoveItem, dragFinishItem, setSelectedColumn }) {
	// const trackColumns = columns.track;
	return (
		<For each={columns} key="id">{ column => (
			<ProductionColumn
				column={column} getPrimaryColumn={getPrimaryColumn}
				trackInvalidItems={trackInvalidItems}
				removeItem={removeItem} dragStartItem={dragStartItem} dragMoveItem={dragMoveItem} dragFinishItem={dragFinishItem}
				setSelectedColumn={setSelectedColumn}
			/>
		)}</For>
	);
}

export default ProductionColumns;