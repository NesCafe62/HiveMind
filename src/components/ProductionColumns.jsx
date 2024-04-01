import { subscribe, batch } from 'pozitron-js';
import { For, If } from '../pozitron-web';
import { DelegateDraggable, handleDragScroll } from '../libs/draggable';
import { DragMode } from '../data';

const SYMBOL_NDASH = decodeURIComponent('%E2%80%93'); // &ndash;

function ProductionColumn({
	panelProductionEl, column, removeItem, // trackInvalidItems
	dragStartItem, dragMoveItem, dragFinishItem, setSelectedColumn
}) {
	let columnEl, itemsEl;

	/* const primaryCol = column.isSecondary
		? getPrimaryColumn(column)
		: column; */

	function clickAppendItem() {
		setSelectedColumn(column, columnEl);
	}

	function updateDragConnected() {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.connectedColor) {
				itemEl.style.setProperty('--item-height', item.height + 'px');
				itemEl.style.setProperty('--item-bottom', item.bottom + 'px');
			}
			i++;
		}
	}

	function updateDrag(maxY) {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = column.viewItems[i];
			if (item.connectedColor) {
				itemEl.style.setProperty('--item-height', item.height + 'px');
				itemEl.style.setProperty('--item-bottom', item.bottom + 'px');
			} else if (item.dragging) {
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
		columnEl.classList.add('has-dragging');
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
		columnEl.classList.remove('has-dragging');
	}

	let scroll = 0;
	let scrollingTimer = null;

	function updateScroll() {
		if (scroll !== 0) {
			panelProductionEl.scrollBy({left: 0, top: scroll, behavior: 'instant'});
		}
		scroll = 0;
		scrollingTimer = null;
	}

	function setup(el) {
		columnEl = el;

		columnEl.updateDrag = updateDrag;
		columnEl.updateDragStart = updateDragStart;
		columnEl.updateDragFinish = updateDragFinish;

		let dragElHeight, dragMode, dragItem, columnSecondaryEl;

		DelegateDraggable(columnEl, '.production-item', {
			move: ({el, x, y}) => {
				if (dragMode === DragMode.Column) {
					return;
				}
				const maxY = columnEl.offsetHeight;
				const yFromBottom = maxY - dragElHeight - y;
				if (y < panelProductionEl.scrollTop + 30) {
					scroll = Math.max(-20, y - (panelProductionEl.scrollTop + 30));
				} else if (yFromBottom < 30 + panelProductionEl.scrollHeight - panelProductionEl.scrollTop - panelProductionEl.clientHeight) {
					scroll = Math.min(20, (30 + panelProductionEl.scrollHeight - panelProductionEl.scrollTop - panelProductionEl.clientHeight) - yFromBottom);
				} else {
					scroll = 0;
				}
				if (scroll !== 0 && !scrollingTimer) {
					scrollingTimer = requestAnimationFrame(updateScroll);
				}

				if (dragMode === DragMode.Single) {
					batch(() => {
						let [newX, newY] = el.handleDragMoveItem(column, dragItem, x, yFromBottom);
						newY = maxY - dragElHeight - newY;
						el.style.top = newY + 'px';
						el.style.left = newX + 'px';
					});
					updateDragConnected();
				} else if (dragMode === DragMode.SingleWithSecondary) {
					batch(() => {
						el.handleDragMoveItem(column, dragItem, x, yFromBottom);
					});
					updateDrag(maxY);
					columnSecondaryEl.updateDrag(maxY);
				} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
					batch(() => {
						el.handleDragMoveItem(column, dragItem, x, yFromBottom);
					});
					updateDrag(maxY);
					if (dragMode === DragMode.MultipleWithSecondary) {
						columnSecondaryEl.updateDrag(maxY);
					}
				}
			},
			started: (el, event) => {
				batch(() => {
					[dragMode, dragItem] = el.handleDragStartItem(event);
				});
				if (dragMode === DragMode.Column) {
					return;
				}
				dragElHeight = el.offsetHeight;
				if (dragMode === DragMode.Single) {
					el.classList.add('dragging');
				} else if (dragMode === DragMode.SingleWithSecondary) {
					updateDragStart();
					/* columnEl2 = column.isSecondary
						? columnEl.previousElementSibling
						: columnEl.nextElementSibling; */
					columnSecondaryEl = columnEl.nextElementSibling;
					columnSecondaryEl.updateDragStart();
				} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
					updateDragStart();
					if (dragMode === DragMode.MultipleWithSecondary) {
						columnSecondaryEl = columnEl.nextElementSibling;
						columnSecondaryEl.updateDragStart();
					}
				}
			},
			finished: (el) => {
				if (dragMode === DragMode.Column) {
					return;
				}
				batch(() => {
					if (dragMode === DragMode.Single) {
						el.classList.remove('dragging');
						el.style.top = '';
						el.style.left = '';
						el.handleDragFinishItem(column, dragItem);
					} else if (dragMode === DragMode.SingleWithSecondary) {
						updateDragFinish();
						columnSecondaryEl.updateDragFinish();
						el.handleDragFinishItem(column, dragItem);
					} else if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
						updateDragFinish();
						if (dragMode === DragMode.MultipleWithSecondary) {
							columnSecondaryEl.updateDragFinish();
						}
						el.handleDragFinishItem(column, dragItem);
					}
				});
				scroll = 0;
				if (scrollingTimer) {
					cancelAnimationFrame(scrollingTimer);
				}
				scrollingTimer = null;
			},
		});
	}

	function displayTime(time) {
		const sec = time % 60;
		const min = ~~((time - sec) / 60);
		return ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
	}

	subscribe(column.trackInvalidItems, (viewItems) => {
		if (!itemsEl) {
			return;
		}
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = viewItems[i];
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
			if (item.connectedColor) {
				itemEl.style.setProperty('--item-height', item.height + 'px');
				itemEl.style.setProperty('--item-bottom', item.bottom + 'px');
			} else if (!item.spacing && !item.hidden) {
				const timeText = displayTime(item.time);
				const titleText = `${timeText}  ${SYMBOL_NDASH}  ${item.name}`;
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
					if (item.connectedColor) {
						return <div
							class="production-item-space production-item-connected-line"
							style={{
								// '--item-height': item.height + 'px',
								// '--item-bottom': item.bottom + 'px',
								'--cl-connected': item.connectedColor
							}}
						/>;
					} else {
						return <div class="production-item-space" style={{ 'min-height': item.height + 'px' }} />;
					}
				} else {
					function clickRemoveItem(event, mouseDown) {
						// event.preventDefault();
						if (!item.fixed) {
							removeItem(column, item, mouseDown);
						}
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
					return (
						<div
							class="production-item" classList={{
								'production-item-wide': item.isWide,
								'production-item-lift': item.isLiftOff,
								'production-item-fixed': item.fixed
							}}
							ref={ el => (
								el.clickRemoveItem = clickRemoveItem,
								el.handleDragStartItem = handleDragStartItem,
								el.handleDragMoveItem = handleDragMoveItem,
								el.handleDragFinishItem = handleDragFinishItem
							)}
							style={{ 'min-height': item.fixed ? '' : (item.height + 'px'), '--cl-bg': item.color }}
						>
							<If condition={item.count === 2}>
								<div
									class="production-icon production-icon-second"
									style={{ 'background-image': `url('./resources/${item.icon}')`}}
								/>
							</If>
							<div class="production-icon" style={{ 'background-image': `url('./resources/${item.icon}')` }} />
							<i title="Недостаточно ресурсов" class="mdi mdi-alert-rhombus-outline" />
						</div>
					);
				}
			}}</For>
			<button class="production-button-add-item" ref={el => el.clickAppendItem = clickAppendItem}><i class="mdi mdi-plus" /></button>
		</div>
	);
}

// <i class="mdi mdi-close-thick" />
// <i class="mdi mdi-numeric-2" />

function ProductionColumns({
	panelProductionEl, columns, removeItem, // trackInvalidItems
	dragStartItem, dragMoveItem, dragFinishItem, setSelectedColumn
}) {
	let lastScrollTop;

	function setup() {
		panelProductionEl.scrollTop = panelProductionEl.scrollHeight; // set scrolling at the bottom on initial load
		lastScrollTop = panelProductionEl.scrollTop;
	}

	panelProductionEl.addEventListener('scroll', function() {
		handleDragScroll(0, lastScrollTop - panelProductionEl.scrollTop);
		lastScrollTop = panelProductionEl.scrollTop;
	});

	return (
		<For each={columns} key="id" ref={() => setup()}>{ column => (
			<ProductionColumn
				panelProductionEl={panelProductionEl}
				column={column}
				// trackInvalidItems={trackInvalidItems}
				removeItem={removeItem} dragStartItem={dragStartItem} dragMoveItem={dragMoveItem} dragFinishItem={dragFinishItem}
				setSelectedColumn={setSelectedColumn}
			/>
		)}</For>
	);
}

export default ProductionColumns;