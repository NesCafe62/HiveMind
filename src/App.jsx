import { signal, voidSignal, untrack, sMemo, batch } from "pozitron-js";
import { render } from "pozitron-js/render";
import { UnitsData, ButtonCategories, Color, AND, OR, NO, EMPTY, COL_PRIMARY, COL_SECONDARY, Category, DragMode, BuildType } from "./data";
import { delegateEvent, divideInt } from "./libs/utils";
import { notifiableStore } from "./pozitron-store";
import ProductionColumns from "./components/ProductionColumns";
import PanelItemsPalette from "./components/PanelItemsPalette";
import PanelIncome from "./components/PanelIncome";

/* function notifiable(data) {
	const [track, notify] = voidSignal();
	return [data, () => track(data), notify];
} */

/* function notifiable_(fn) {
	const [track, notify] = voidSignal();
	return [() => track(fn()), notify, track];
} */

/* function onCondition(getter, fn) {
	subscribe(getter, (res) => res && fn());
} */

// todo:
// [+] кол-во рабочих на таймлайне (готово. временно)
// [] удалять юниты при удалении здания
// [+] починить скроллинг при перетаскивании (починено. вроде)
// [] перетаскивание лайна
// [] перетаскивание элементов между лайнами
// [] залочить перетаскивание элементов при нехватке ресурсов
// [] линия добычи до 16ти рабочих с одной базы
// [+] создавать юнита с учетом прокрутки (внизу вьюпорта)
// [+] расширить ширину зоны инкама
// [+] добавлять больше лайнов автоматически (всего один последний лайн. временно)
// [] добавлять деления таймлайна динамически

const noopFn = () => {};
const trueFn = () => true;

const INITIAL_WORKERS = 12;
const INITIAL_MINERALS = 50;

const INCOME_SCALE_DIV = 60;

function ProductionColumnsData(validateRequirement, columnRemoved, getUnitData, getTimeScale, data) {
	let nextColumnId = 1, nextItemId = 1;

	const [trackColumns, notifyColumns] = voidSignal();

	const [trackColumnsData, notifyColumnsData] = voidSignal();
	const [trackInvalidItems, notifyInvalidItems] = voidSignal();

	const [workersCount, setWorkersCount] = signal(0);

	let incomeItems;

	function getEconomyItems() {
		trackColumnsData();

		const timeScale = getTimeScale();

		const incomeWidthScale = 4;

		const workerIncome = 60;

		let workers = INITIAL_WORKERS;
		incomeItems = [{
			time: 0, endTime: 0,
			incomeDelta: INITIAL_WORKERS * workerIncome,
			incomePerMin: 0,
			width: 0, height: 0,
			color: undefined, id: undefined,
			isSpent: false, reminder: INITIAL_MINERALS * INCOME_SCALE_DIV,
			isPrevSpent: false,
			spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
			// key: '', itemsId: ['I'],
		}];


		function insertIncomeDelta(time, incomeDelta, itemId) {
			let incomeIndex = 0; // todo: use incomeItems.findIndex(i => i.time >= time) || incomeItems.length
			while (
				incomeIndex < incomeItems.length &&
				incomeItems[incomeIndex].time < time
			) {
				incomeIndex++;
			}
			
			if (
				incomeIndex < incomeItems.length &&
				incomeItems[incomeIndex].time === time
			) {
				incomeItems[incomeIndex].incomeDelta += incomeDelta;
				// incomeItems[incomeIndex].itemsId.push(itemId);
			} else {
				incomeItems.splice(incomeIndex, 0, {
					time: time, endTime: 0,
					incomeDelta,
					incomePerMin: 0,
					width: 0, height: 0,
					color: undefined, id: undefined,
					isSpent: false, reminder: 0,
					isPrevSpent: false,
					spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
					// spendingHigher: false, spendingPrevHigher: false,
					// key: '', itemsId: [itemId],
				});
			}
		}

		function insertSpending(time, cost, itemId, color) {
			let remaining = cost * INCOME_SCALE_DIV; // remaining resource amount to spend
			let insertTimeEnd = time;

			for (let i = incomeItems.length - 1; i >= 0; i--) {
				const incomeItem = incomeItems[i];
				if (incomeItem.time > insertTimeEnd) {
					continue;
				}

				// replace with 3 blocks

				// insertTimeEnd    ->   incomeItem.endTime
				// insertTime       ->   insertTimeEnd
				// incomeItem.time  ->   insertTime

				if (incomeItem.reminder > 0) {
					const spentReminder = Math.min(remaining, incomeItem.reminder);
					incomeItem.reminder -= spentReminder;
					remaining -= spentReminder;

					if (remaining === 0) {
						break;
					}
				}

				if (incomeItem.isSpent) {
					insertTimeEnd = incomeItem.time;
					continue;
				}

				if (incomeItem.time >= insertTimeEnd) {
					continue;
				}

				const incomePerMin = incomeItem.incomePerMin;
				const available = incomePerMin * (insertTimeEnd - incomeItem.time);

				/* if (available === 0) {
					console.log('zero height!');
					console.log({
						insertTimeEnd,
						isSpent: incomeItem.isSpent,
						incomeItem: {...incomeItem},
						incomeItemTime: incomeItem.time,
					});
				} */

				let insertTime, unspentReminder = 0;
				if (remaining >= available) {
					insertTime = incomeItem.time;
					remaining -= available;
				} else {
					const timeHeight = Math.ceil(remaining / incomePerMin);
					insertTime = insertTimeEnd - timeHeight;
					unspentReminder = timeHeight * incomePerMin - remaining; // same as (remaining % incomePerMin)
					remaining = 0;
				}

				const replaceItems = [];
				if (insertTime > incomeItem.time) {
					replaceItems.push({
						time: incomeItem.time, endTime: insertTime,
						incomePerMin, // unspent: incomePerMin * (insertTime - incomeItem.time),
						width: 0, height: 0,
						color: undefined, id: undefined,
						isSpent: false, reminder: 0,
						isPrevSpent: false,
						spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
					});
					// need to increment 'i' after
				}

				replaceItems.push({
					time: insertTime, endTime: insertTimeEnd,
					incomePerMin,
					width: 0, height: 0,
					color, id: itemId,
					isSpent: true, reminder: unspentReminder,
					isPrevSpent: false,
					spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
				});

				const isLast = (i === incomeItems.length - 1);
				if (isLast || incomeItem.endTime > insertTimeEnd) {
					replaceItems.push({
						time: insertTimeEnd, endTime: incomeItem.endTime,
						incomePerMin,
						width: 0, height: 0,
						color: undefined, id: undefined,
						isSpent: false, reminder: 0,
						isPrevSpent: false,
						spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
					});
				}

				insertTimeEnd = insertTime;

				incomeItems.splice(i, 1, ...replaceItems);
				if (insertTime > incomeItem.time) {
					i++;
				}

				if (remaining === 0) {
					break;
				}
			}
			return remaining;
		}

		for (const column of columns) {
			for (const item of column.items) {
				const unitData = getUnitData(item.typeId);
				if (unitData.mineralIncome > 0) {
					if (unitData.lifeTime > 0) { // temporary income (MULE)
						insertIncomeDelta(item.time, unitData.mineralIncome, item.id,);
						insertIncomeDelta(item.endTime, -unitData.mineralIncome, -item.id);
					} else { // permanent income (workers, SCV-s ...)
						insertIncomeDelta(item.endTime, unitData.mineralIncome, item.id);
					}
				}
				if (unitData.buildType === BuildType.WorkerBuild) { // build with worker not mining
					insertIncomeDelta(item.time, -workerIncome, -item.id);
					insertIncomeDelta(item.endTime, workerIncome, item.id);
				} else if (unitData.buildType === BuildType.WorkerMorph) { // build with worker morph
					insertIncomeDelta(item.time, -workerIncome, -item.id);
				}
			}
		}
		let lastItem, incomeValue = 0;
		for (const income of incomeItems) {
			if (lastItem) {
				// lastItem.timeHeight = income.time - lastItem.time;
				lastItem.endTime = income.time;
				// lastItem.height = lastItem.timeHeight * timeScale;
				// lastItem.unspent = incomeValue * (income.time - lastItem.time);
			//	lastItem.key = income.itemsId.join(',') + ':' + lastItem.timeHeight + ':' + lastItem.width; // lastItem.time + ':' + income.time + ':' + lastItem.width;
			}
			incomeValue += income.incomeDelta;
			income.incomePerMin = incomeValue;
			// income.width = divideInt(incomeValue * incomeScale, INCOME_SCALE_DIV);
			lastItem = income;
		}
		lastItem.endTime = lastItem.time;
		// lastItem.isLast = true;
		// lastItem.key = 'last:' + lastItem.width;

		/* incomeItems.unshift({
			time: -1, endTime: 0,
			incomePerMin: INITIAL_MINERALS * INCOME_SCALE_DIV, spent: false,
			color: undefined, id: undefined,
		}); */

		// incomeItems[0].unspent += INITIAL_MINERALS * INCOME_SCALE_DIV;

		// incomeItems[0].initialIncome = INITIAL_MINERALS;

		// console.log(incomeItems);

		for (const column of columns) {
			for (const item of column.items) {
				if (item.fixed) {
					continue;
				}
				const unitData = getUnitData(item.typeId);
				if (unitData.category === Category.WORKER) {
					workers++;
				}
				if (unitData.mineralCost > 0) {
					const remaining = insertSpending(item.time, unitData.mineralCost, item.id, Color[unitData.category]);
					if (remaining > 0) {
						item.invalid = true;
						// console.log(`Not enough minerals! ${-divideInt(remaining, INCOME_SCALE_DIV)}`);
					} else {
						item.invalid = false;
					}
					// console.log('insertSpending', item.time, unitData.mineralCost, item.id, Color[unitData.category]);
				}
			}
		}

		for (const income of incomeItems) {
			income.height = (income.endTime - income.time) * timeScale;
			income.width = divideInt(income.incomePerMin * incomeWidthScale, INCOME_SCALE_DIV);
			income.isPrevSpent = (
				lastItem.isSpent &&
				income.isSpent &&
				income.id !== lastItem.id
			);
			income.spHigher = (income.width > lastItem.width); // || isFirst
			income.spLower = (
				income.width < lastItem.width &&
				income.id === lastItem.id
			);
			lastItem.spNextLower = (
				income.width < lastItem.width
			);
			lastItem.spNextHigher = (
				income.width > lastItem.width &&
				income.id === lastItem.id
			);
			lastItem = income;
		}
		lastItem.isLast = true;
		// incomeItems[incomeItems.length - 1].isLast = true;

		incomeItems[0].spHigher = true;
		// incomeItems[0].spPrevHigher = false;

		// console.log(incomeItems);

		setWorkersCount(workers);
		notifyInvalidItems();

		return incomeItems;
	}

	function initColumnItems(columnItems) {
		let endTime = 0;
		const items = columnItems.map( item => {
			const unitData = getUnitData(item.typeId);
			endTime = item.time + (item.fixed ? 0 : unitData.buildTime);
			item.id = nextItemId;
			item.productionTypeId = undefined;
			item.endTime = endTime;
			item.dragging = false;
			item.visible = true;
			item.invalid = false;
			item.fixed = item.fixed || false;
			nextItemId++;
			return item;
		});
		return items;
	}

	function getColumnEndTime(column) {
		const length = column.items.length;
		return length > 0
			? column.items[length - 1].endTime
			: 0;
	}

	function getViewItems(column) {
		const timeScale = getTimeScale();

		const viewItems = [];
		const draggingItems = [];
		let lastTime = 0;
		let i = 0;
		for (const item of column.items) {
			const unitData = getUnitData(item.typeId);
			let addSpacing = item.time > lastTime;
			if (addSpacing) {
				viewItems.push({
					id: 's:' + lastTime + ':' + item.time,
					spacing: true,
					height: (item.time - lastTime) * timeScale,
				});
			}
			lastTime = item.time + (item.fixed ? 0 : unitData.buildTime);
			if (!item.visible) {
				viewItems.push({
					id: item.id,
					hidden: true,
					height: unitData.buildTime * timeScale,
				});
			} else {
				let text = unitData.name;
				if (item.fixed && unitData.category === Category.RESOURCE_CENTER) {
					text += ` +${INITIAL_WORKERS} workers`;
				}
				const nextItem = column.items[i + 1];
				const viewItem = {
					id: item.id,
					name: text,
					time: item.time,
					typeId: item.typeId,
					icon: unitData.icon,
					color: Color[unitData.category],
					y: item.time * timeScale,
					height: unitData.buildTime * timeScale,
					isWide: unitData.isWide || false,
					fixed: item.fixed,
					invalid: item.invalid,
					dragging: item.dragging,
					roundedTop: !item.fixed && (!nextItem || (nextItem.time > lastTime)),
					roundedBottom: false,
				};
				if (item.dragging) {
					viewItem.roundedBottom = addSpacing || (i === 0);
					viewItems.push({
						id: 'd:' + item.id,
						draggingPlaceholder: true,
						height: unitData.buildTime * timeScale,
					});
					draggingItems.push(viewItem);
				} else {
					viewItems.push(viewItem);
				}
			}
			i++;
		}
		// console.log(column.id, 'viewItems', viewItems.concat(draggingItems));
		return column.viewItems = viewItems.concat(draggingItems);
	}

	function createColumn(items = []) {
		const [track, notify] = voidSignal();
		const column = {
			id: nextColumnId,
			secondaryCol: undefined,
			isSecondary: false,
			items, viewItems: [], notify,
			getItems: () => track(getViewItems(column)),
		};
		nextColumnId++;
		return column;
	}

	const columns = data.map( columnItems => {
		const items = initColumnItems(columnItems);
		return createColumn(items);
	});

	function findColumnIndex(column) {
		const index = columns.findIndex(c => c === column);
		if (index === -1) {
			throw new Error(`Column not found, id = '${column.id}'`);
		}
		return index;
	}

	function appendColumn() {
		columns.push(createColumn());
		notifyColumns();
		notifyColumnsData();
	}

	function removeColumn(column) {
		const index = findColumnIndex(column);
		columns.splice(index, 1);
		columnRemoved(column);
		notifyColumns();
		notifyColumnsData();
	}

	function insertColumnAfter(column, afterCol) {
		const index = findColumnIndex(afterCol);
		columns.splice(index + 1, 0, column);
		notifyColumns();
		notifyColumnsData();
	}

	/* function removeColumn(column) {
		;
	} */

	/* function insertColumnAfter(column) {
		const index = columns.findIndex(c => c === column);
		columns.splice(index + 1, 0, createColumn());
		notifyColumns();
		return column;
	} */

	/* function cloneItem(item) {
		const cloned = Object.assign({}, item);
		cloned.id = nextItemId;
		nextItemId++;
		return cloned;
	} */

	function getProductionTypeId(column) {
		for (const item of column.items) {
			const unitData = getUnitData(item.typeId);
			if (unitData.category === Category.PRODUCTION) {
				return item.typeId;
			}
		}
		return undefined;
	}

	function isLastColumn(column) {
		return (column === columns[columns.length - 1]);
	}

	function appendItem(column, typeId, data = {}) {
		const {
			visible = true,
			time = Math.max(getColumnEndTime(column), data.minTime || 0),
			productionTypeId,
		} = data;
		const unitData = getUnitData(typeId);
		const item = {
			id: nextItemId,
			typeId, productionTypeId,
			visible, fixed: false, invalid: false,
			name: unitData.name,
			time, endTime: time + unitData.buildTime,
			dragging: false,
		};
		nextItemId++;
		
		notifyColumnsData();
		column.items.push(item);
		column.notify();
		if (column.items.length === 1 && isLastColumn(column)) {
			insertColumnAfter(createColumn(), column);
		}

		if (!column.isSecondary && unitData.category === Category.ADDON) {
			let insertCol = false;
			if (!column.secondaryCol) {
				insertCol = true;
				column.secondaryCol = createColumn();
				column.secondaryCol.isSecondary = true;
			}
			// const productionTypeId = getProductionTypeId(column);
			appendItem(column.secondaryCol, typeId, {
				time, visible: false,
				productionTypeId: getProductionTypeId(column),
			});
			// console.log(column.secondaryCol.items);
			// console.log(addonItem);
			// column.secondaryCol.items.push(cloneItem(item));
			if (insertCol) {
				insertColumnAfter(column.secondaryCol, column);
			}
		}
	}

	function deleteElement(items, fn) {
		const index = items.findIndex(fn);
		if (index !== -1) {
			const item = items[index];
			items.splice(index, 1);
			return item;
		}
	}

	function removeItem(column, viewItem) {
		const item = deleteElement(column.items, i => i.id === viewItem.id);
		if (item) {
			// delete items that used this requirement, or mark invalid
			if (column.secondaryCol) {
				const unitData = getUnitData(item.typeId);
				if (unitData.category === Category.ADDON) {
					// console.log(column.secondaryCol.items);
					// console.log(item.time);
					deleteElement(
						column.secondaryCol.items,
						i => i.time === item.time && !i.visible
					);
					column.secondaryCol.notify();
					if (column.secondaryCol.items.length === 0) {
						removeColumn(column.secondaryCol);
						column.secondaryCol = undefined;
					}
				}
			}
			column.notify();
			notifyColumnsData();
		}
	}

	/* function round(value, scale) {
		return (~~(value / scale)) * scale;
	} */

	function intersectRange(aFrom, aTo, bFrom, bTo) {
		return (
			aFrom < bTo &&
			aTo > bFrom
		);
	}

	function intersect(a, from, to) {
		return (
			a > from &&
			a <= to
		);
	}

	function intersect2(a, from, to) {
		return (
			a >= from &&
			a < to
		);
	}

	function getPrimaryColumn(column) {
		const columnIndex = columns.findIndex(c => c === column);
		return columns[columnIndex - 1];
	}

	function setItemsDragging(column, fn = trueFn) {
		for (const item of column.items) {
			if (fn(item)) {
				item.dragging = true;
			}
		}
	}

	function clearItemsDragging(column) {
		for (const item of column.items) {
			item.dragging = false;
		}
	}

	let dragMode, dragMinTime;

	function dragStartItem(column, viewItem, event) {
		let dragItem = column.items.find(i => i.id === viewItem.id);
		if (!dragItem) {
			throw new Error(`Item not found, id = '${viewItem.id}'`);
		}
		const unitData = getUnitData(viewItem.typeId);
		if (dragItem.fixed) {
			dragMode = DragMode.Column;
			dragMinTime = 0;
		} else if (
			unitData.category === Category.PRODUCTION ||
			unitData.category === Category.RESOURCE_CENTER ||
			unitData.category === Category.TECH_STRUCTURE
		) {
			// drag all items
			dragMode = DragMode.Multiple;
			dragMinTime = 0;
			setItemsDragging(column, (item) => {
				dragMinTime = Math.max(dragMinTime, dragItem.time - item.time);
				return true;
			});
			if (column.secondaryCol) {
				dragMode = DragMode.MultipleWithSecondary;
				setItemsDragging(column.secondaryCol);
				column.secondaryCol.notify();
			}
			column.notify();
			notifyColumnsData();
		} else if (
			unitData.category === Category.ADDON && (
				column.isSecondary || !event.shiftKey
			)
		) {
			dragMode = DragMode.SingleWithSecondary;
			dragMinTime = 0;
			const primaryCol = column.isSecondary ? getPrimaryColumn(column) : column;
			validateRequirement(unitData.requirement, primaryCol.items, false /* isSecondary */, (reqItem) => {
				dragMinTime = Math.max(dragMinTime, reqItem.endTime);
			});
			
			// немного костыль, определеять соответствие по time. но пока так
			dragItem = primaryCol.items.find(i => i.time === dragItem.time);
			dragItem.dragging = true;
			setItemsDragging(primaryCol.secondaryCol);

			primaryCol.notify();
			primaryCol.secondaryCol.notify();
			notifyColumnsData();
		} else if (event.shiftKey) {
			// drag all items except production
			dragMode = DragMode.Multiple;
			dragMinTime = 0;
			let heightOffset = 0;
			for (const item of column.items) {
				if (item.fixed) {
					continue;
				}
				const unitData = getUnitData(item.typeId);
				/* if (
					unitData.category !== Category.PRODUCTION &&
					unitData.category !== Category.RESOURCE_CENTER &&
					unitData.category !== Category.TECH_STRUCTURE && (
						!column.isSecondary ||
						unitData.category !== Category.ADDON
					)
				) { */
				if (item.time >= dragItem.time) {
					if (!column.isSecondary && unitData.category === Category.ADDON) {
						dragMode = DragMode.MultipleWithSecondary;
					}
					heightOffset = Math.max(heightOffset, dragItem.time - item.time);
					item.dragging = true;
				} else {
					dragMinTime = Math.max(dragMinTime, item.endTime);
				}
			}
			dragMinTime += heightOffset;

			if (dragMode === DragMode.MultipleWithSecondary) {
				setItemsDragging(column.secondaryCol);
				column.secondaryCol.notify();
			}
			column.notify();
			notifyColumnsData();
		} else {
			dragMode = DragMode.Single;
			dragMinTime = 0;
			validateRequirement(unitData.requirement, column.items, column.isSecondary, (reqItem) => {
				dragMinTime = Math.max(dragMinTime, reqItem.endTime);
			});
		}
		return [dragMode, dragItem];
	}

	function dragMoveItem(column, viewItem, x, y) {
		const index = column.items.findIndex(i => i.id === viewItem.id);
		if (index === -1) {
			throw new Error(`Item not found, id = '${viewItem.id}'`);
		}
		const dragItem = column.items[index];
		const timeScale = getTimeScale();
		const newX = 0;
		let newY = divideInt(y, timeScale); // Math.max(~~(y / timeScale), 0);
		newY = Math.max(newY, dragMinTime);
		const prevTime = dragItem.time;

		if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
			let offset = newY - prevTime;
			for (const item of column.items) {
				if (item.dragging) {
					const itemHeight = item.endTime - item.time;
					item.time += offset;
					item.endTime = item.time + itemHeight;
				}
			}
			column.notify();
		} else if (dragMode === DragMode.Single || dragMode === DragMode.SingleWithSecondary) {
			const itemHeight = dragItem.endTime - dragItem.time;
			let maxY = newY, minY = newY;
			for (const item of column.items) {
				if (item === dragItem) {
					continue;
				}
				const from = item.time - itemHeight;
				const to = item.endTime;
				if (to >= newY && intersect(maxY, from, to)) { // todo: break if no intersect
					maxY = to;
				}
			}
			for (let i = column.items.length - 1; i >= 0; i--) {
				const item = column.items[i];
				if (item === dragItem) {
					continue;
				}
				const from = item.time - itemHeight;
				const to = item.endTime;
				if (from <= newY && intersect2(minY, from, to)) {
					minY = from;
				}
			}
			if (minY >= 0 && newY - minY <= maxY - newY) {
				newY = minY;
			} else {
				newY = maxY;
			}

			const time = newY;
			dragItem.time = time;
			dragItem.endTime = time + itemHeight;
			dragItem.dragging = true;

			let offset = (time > prevTime) ? 1 : -1;
			let i = index;
			let nextIndex = i + offset;
			let nextItem = column.items[nextIndex];
			while (nextItem && (time - nextItem.time) * offset > 0) {
				column.items[i] = nextItem;
				i += offset;
				nextIndex = i + offset;
				nextItem = column.items[nextIndex];
			}
			column.items[i] = dragItem;

			column.notify();
		}

		if (
			dragMode === DragMode.SingleWithSecondary ||
			dragMode === DragMode.MultipleWithSecondary
		) {
			let offset = newY - prevTime;
			for (const item of column.secondaryCol.items) {
				if (item.dragging) {
					const itemHeight = item.endTime - item.time;
					item.time += offset;
					item.endTime = item.time + itemHeight;
				}
			}
			column.secondaryCol.notify();
		}
		notifyColumnsData();

		if (dragMode === DragMode.Single || dragMode === DragMode.SingleWithSecondary) {
			return [newX, newY * timeScale];
		}
	}

	function dragFinishItem(column, viewItem) {
		if (dragMode === DragMode.Multiple) {
			clearItemsDragging(column);
			column.notify();
		} else if (dragMode === DragMode.MultipleWithSecondary || dragMode === DragMode.SingleWithSecondary) {
			clearItemsDragging(column);
			column.notify();
			const column2 = column.isSecondary
				? getPrimaryColumn(column)
				: column.secondaryCol;
			clearItemsDragging(column2);
			column2.notify();
		} else if (dragMode === DragMode.Single) {	
			const item = column.items.find(i => i.id === viewItem.id);
			if (!item) {
				throw new Error(`Item not found, id = '${viewItem.id}'`);
			}
			item.dragging = false;

			column.notify();
			/* if (dragMode === DragMode.SingleWithSecondary) {
				clearItemsDragging(column.secondaryCol);
				column.secondaryCol.notify();
			} */
		}
		notifyColumnsData();

		/* const index = column.items.findIndex(i => i.id === viewItem.id);
		if (index === -1) {
			throw new Error(`Item not found, id = '${viewItem.id}'`);
		}
		const item = column.items[index];
		const itemHeight = item.endTime - item.time;
		const time = (~~(y / getTimeScale()));
		
		const prevTime = item.time;
		item.time = time;
		item.endTime = time + itemHeight;
		item.dragging = false;
		
		let offset = (time > prevTime) ? 1 : -1;
		let i = index;
		let nextIndex = i + offset;
		let nextItem = column.items[nextIndex];
		while (nextItem && (time - nextItem.time) * offset > 0) {
			column.items[i] = nextItem;
			i += offset;
			nextIndex = i + offset;
			nextItem = column.items[nextIndex];
		}
		column.items[i] = item;

		column.notify(); */
	}

	const columnsData = () => trackColumns(columns);

	// const columnsData = () => {
		// trackColumns();

		// const timeScale = getTimeScale();
		
		// for (const column of columns) {
			/* const viewItems = [];
			let lastTime = 0;
			for (const item of column.items) {
				const unitData = getUnitData(item.typeId);
				if (item.time > lastTime) {
					viewItems.push({
						id: 's:' + lastTime + ':' + item.time,
						spacing: true,
						height: (item.time - lastTime) * timeScale,
					});
				}
				if (item.dragging) {
					viewItems.push({
						id: 'd:' + item.id,
						dragging: true,
						height: unitData.buildTime * timeScale,
					});
				}
				viewItems.push({
					id: item.id,
					name: unitData.name,
					typeId: item.typeId,
					icon: unitData.icon,
					color: Color[unitData.category],
					height: unitData.buildTime * timeScale,
					roundedTop: undefined,
				});
				lastTime = item.time + unitData.buildTime;
			}
			column.viewItems = viewItems; */
			// getViewItems(column);
		// }
		
		// return columns;
	// };

	return {
		trackInvalidItems,

		workersCount,
		columnsData,
		getEconomyItems,
		getPrimaryColumn,

		// appendColumn,
		// removeColumn,
		// moveColumn,

		appendItem,
		removeItem,

		dragStartItem,
		dragMoveItem,
		dragFinishItem,

		// moveItem,
	};
}

const images = [];
function preloadImages() {
	for (const unitData of UnitsData.Terran) {
		const image = new Image();
		image.src = './resources/' + unitData.icon;
		images.push(image);
	}
}

function App() {
	preloadImages();

	const [race, setRace] = signal('Terran');
	const [timeScale, setTimeScale] = signal(4);

	const unitsData = sMemo(
		() => UnitsData[race()]
	);

	function getUnitData(typeId) {
		return unitsData()[typeId];
	}

	function validateRequirement(requirement, items, isSecondary, foundReqFn = noopFn) {
		if (requirement === COL_PRIMARY) {
			return !isSecondary;
		}
		if (requirement === COL_SECONDARY) {
			return isSecondary;
		}
		if (requirement === EMPTY) {
			return (items.length === 0);
		}
		if (Array.isArray(requirement)) {
			const operator = requirement[0];
			if (operator === NO) {
				return !validateRequirement(requirement[1], items, isSecondary);
			}
			if (operator === AND) {
				return requirement.slice(1).every(
					req => validateRequirement(req, items, isSecondary, foundReqFn)
				);
			}
			if (operator === OR) {
				const reqs = requirement.slice(1);
				const hasEmpty = reqs.some(req => req === EMPTY);
				return reqs.some(
					req => validateRequirement(req, items, isSecondary, hasEmpty ? noopFn : foundReqFn)
				);
			}
			throw Error(`Wrong condition type: '${operator}'`);
		} else {
			return items.some( item => {
				const unitData = getUnitData(item.typeId);
				const productionUnitData = item.productionTypeId
					? getUnitData(item.productionTypeId)
					: undefined;
				if (
					unitData.category === requirement ||
					unitData.name === requirement || (
						productionUnitData &&
						productionUnitData.name === requirement
					)
				) {
					foundReqFn(item);
					return true;
				}
				return false;
			});
		}
	}

	const [isShowPalette, setIsShowPalette] = signal(false);

	const buttonCategoryMap = {};
	let i = 0;
	for (const buttonCategory of ButtonCategories) {
		for (const category of buttonCategory.categories) {
			buttonCategoryMap[category] = i;
		}
		i++;
	}

	const [buttonCategories, notifyButtons] = notifiableStore((track) => (
		ButtonCategories.map( (c, i) => {
			const buttons = {
				title: c.title,
				buttons: [],
				getButtons: () => track(buttons.buttons),
				hasButtons: () => track(buttons.buttons.length > 0),
			};
			return buttons;
		})
	));


	let selectedColumn;
	let selectedColumnEl;

	function updateButtons() {
		let typeId = 0;
		buttonCategories.forEach((buttonCategory) => buttonCategory.buttons = []);
		for (const unitData of unitsData()) {
			const hasRequirements = validateRequirement(unitData.requirement, selectedColumn.items, selectedColumn.isSecondary);
			const isVisible = unitData.visible
				? validateRequirement(unitData.visible, selectedColumn.items, selectedColumn.isSecondary)
				: false;
			if (hasRequirements || isVisible) {
				const isDisabled = !hasRequirements;
				const buttonCategory = buttonCategoryMap[unitData.category];
				buttonCategories[buttonCategory].buttons.push({
					key: typeId + ':' + isDisabled,
					typeId,
					name: unitData.name,
					icon: unitData.icon,
					isDisabled,
				});
			}
			typeId++;
		}
		notifyButtons();
	}

	/* function columnUpdated(columnId) {
		if (selectedColumn && selectedColumn.id === columnId) {
			updateButtons();
		}
	} */

	function setSelectedColumn(column, columnEl = undefined) {
		if (selectedColumn === column) {
			return;
		}
		if (selectedColumnEl) {
			selectedColumnEl.classList.remove('selected-column');
		}
		if (columnEl) {
			columnEl.classList.add('selected-column');
		}
		selectedColumn = column;
		selectedColumnEl = columnEl;
		if (!column) {
			setIsShowPalette(false);
			return;
		}
		updateButtons();
		setIsShowPalette(true);
	}

	function columnRemoved(column) {
		if (selectedColumn === column) {
			setSelectedColumn(undefined);
		}
	}

	/* const z = [
		[
			{
				name: 'Command center', typeId: 0,
				time: 0, fixed: true,
			},
			{
				name: 'SCV', typeId: 1,
				time: 24,
			},
		],
		[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],
	]; */

	const { workersCount, columnsData, getEconomyItems, getPrimaryColumn, trackInvalidItems, appendItem, removeItem, dragStartItem, dragMoveItem, dragFinishItem } = ProductionColumnsData(
		validateRequirement,
		columnRemoved,
		getUnitData,
		() => untrack(timeScale),
		[
			[
				{
					name: 'Command center', typeId: 0,
					time: 0, fixed: true,
				},
				{
					name: 'SCV', typeId: 1,
					time: 0,
				},
				{
					name: 'SCV', typeId: 1,
					time: 12,
				},
				{
					name: 'SCV', typeId: 1,
					time: 24,
				},
			],
			[],
			[],
			[],
			[],
			[
				{
					name: 'Barracks', typeId: 6,
					time: 40 + 8,
				},
				{
					name: 'Marine', typeId: 20,
					time: 40 + 8 + 46,
				},
				/* {
					name: 'Marine', typeId: 20,
					time: 8 + 46 + 18,
				},
				{
					name: 'Marine', typeId: 20,
					time: 8 + 46 + 18 + 18,
				}, */
			],
			/* [
				{
					name: 'Barracks', typeId: 6,
					time: 0,
				},
				{
					name: 'Marine', typeId: 20,
					time: 46,
				},
				{
					name: 'Marine', typeId: 20,
					time: 46 + 18,
				},
				{
					name: 'Marine', typeId: 20,
					time: 46 + 18 + 18,
				},
			], */
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
		]
	);



	function handleRemoveItem(column, item) {
		batch(() => {
			removeItem(column, item);
			if (selectedColumn && selectedColumn.id === column.id) {
				updateButtons();
			}
		});
	}

	function handleAppendItem(typeId) {
		batch(() => {
			if (selectedColumn) {
				const minTime = divideInt((
					panelProductionEl.scrollHeight - panelProductionEl.scrollTop - panelProductionEl.offsetHeight
				), timeScale());
				appendItem(selectedColumn, typeId, {minTime});
				// columnUpdated(selectedColumn.id);
				updateButtons();
			}
		});
	}

	const panelProductionEl = document.getElementById('panel-production');
	delegateEvent(panelProductionEl, '.production-button-add-item', 'click', (el) => el.clickAppendItem(el));

	delegateEvent(panelProductionEl, '.production-item', 'contextmenu', (el, event) => el.clickRemoveItem(event));

	render(ProductionColumns, document.getElementById('production-columns'), {
		columns: columnsData,
		getPrimaryColumn,
		trackInvalidItems,
		removeItem: handleRemoveItem,
		dragStartItem,
		dragMoveItem,
		dragFinishItem,
		setSelectedColumn,
	});
	render(PanelIncome, document.getElementById('panel-income'), {
		getEconomyItems,
		workersCount,
	});
	render(PanelItemsPalette, document.getElementById('panel-items-palette'), {
		buttonCategories,
		isShow: isShowPalette,
		appendItem: handleAppendItem,
		onClose: () => setSelectedColumn(undefined),
	});
}

export default App;