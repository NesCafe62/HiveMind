import { signal, voidSignal, untrack, sMemo, batch } from "pozitron-js";
import { render } from "pozitron-js/render";
import { UnitsData, ButtonCategories, Color, AND, OR, NO, EMPTY, COL_PRIMARY, COL_SECONDARY, Category, DragMode, BuildType } from "./data";
import { delegateEvent, divideInt } from "./libs/utils";
import { notifiableStore } from "./pozitron-store";
import PanelMenu from "./components/PanelMenu";
import ProductionColumns from "./components/ProductionColumns";
import PanelItemsPalette from "./components/PanelItemsPalette";
import PanelIncome from "./components/PanelIncome";

/* function pushImmutable(arr, item) {
	const newArr = arr.slice(0);
	newArr.push(item);
	return newArr;
}

function deleteImmutable(arr, index) {
	// range check is skipped. error if (index >= arr.length || index < 0)
	if (arr.length === 1) {
		return [];
	}
	const newArr = arr.slice(0, arr.length - 1); // without last element
	if (index < arr.length - 1) {
		newArr.copyWithin(index, index + 1);
		newArr[arr.length - 2] = arr[arr.length - 1]; // copy last element
	}
	return newArr;
} */

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
// [] учет газа
// [] учет лимита
// [] учет global requirements
// [] сохранение в localStorage и загрузка
// [] история, отмена операций по Ctrl+Z и повторное применение

// [+] кол-во рабочих на таймлайне (готово. временно)
// [] удалять юниты при удалении здания
// [+] починить скроллинг при перетаскивании (починено. вроде)
// [] перетаскивание лайна
// [] перетаскивание элементов между лайнами
// [-] залочить перетаскивание элементов при нехватке ресурсов
// [+] линия добычи до 16ти рабочих с одной базы
// [+] создавать юнита с учетом прокрутки (внизу вьюпорта)
// [+] расширить ширину зоны инкама
// [+] добавлять больше лайнов автоматически (всего один последний лайн. временно)
// [] добавлять деления таймлайна динамически
// [+] прокручивать viewport автоматически при перетаскивании эелментов таймлайна вверх или вниз
// [] лайн для мулов

const noopFn = () => {};
const trueFn = () => true;

const INITIAL_WORKERS = 12;
const INITIAL_MINERALS = 50;

const INCOME_SCALE_DIV = 60;

const HISTORY_LIMIT = 100;

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
			key: '', sIndex: 1, itemsId: ['I'], invalid: false,
		}];


		function insertIncomeDelta(time, incomeDelta, itemId) {
			let incomeIndex = incomeItems.findIndex(i => i.time >= time);
			if (incomeIndex === -1) {
				incomeIndex = incomeItems.length;
			}
			
			if (
				incomeIndex < incomeItems.length &&
				incomeItems[incomeIndex].time === time
			) {
				incomeItems[incomeIndex].incomeDelta += incomeDelta;
				incomeItems[incomeIndex].itemsId.push(itemId);
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
					key: '', sIndex: 1, itemsId: [itemId], invalid: false,
				});
			}
		}

		function insertSpending(time, cost, itemId, color) {
			let remaining = cost * INCOME_SCALE_DIV; // remaining resource amount to spend
			let insertTimeEnd = time;

			const inserted = [];

			for (let i = incomeItems.length - 1; i >= 0; i--) {
				const incomeItem = incomeItems[i];
				if (incomeItem.time > insertTimeEnd) {
					continue;
				}

				// replace with 3 blocks

				// insertTimeEnd    ->   incomeItem.endTime
				// insertTime       ->   insertTimeEnd
				// incomeItem.time  ->   insertTime

				// sIndex - index of spacing item
				// it starts from 1:
				// ------
				// sIndex*2     = 2 -> 4
				//                  -> 5
				// sIndex*2 + 1 = 3 -> 6
				//                  -> 7, etc.
				// ------
				// grows like binary tree, which guarantees it to be unique

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
						incomePerMin,
						width: 0, height: 0,
						color: undefined, id: undefined,
						isSpent: false, reminder: 0,
						isPrevSpent: false,
						spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
						key: '', sIndex: incomeItem.sIndex * 2, itemsId: incomeItem.itemsId, invalid: false,
					});
					// need to increment 'i' after
				}

				const spendingItem = {
					time: insertTime, endTime: insertTimeEnd,
					incomePerMin,
					width: 0, height: 0,
					color, id: itemId,
					isSpent: true, reminder: unspentReminder,
					isPrevSpent: false,
					spHigher: false, spNextHigher: false, spLower: true, spNextLower: false,
					key: '', sIndex: 0, itemsId: ['s' + itemId + '#' + inserted.length], invalid: false,
				};
				inserted.push(spendingItem);
				replaceItems.push(spendingItem);

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
						key: '', sIndex: incomeItem.sIndex * 2 + 1, itemsId: incomeItem.itemsId, invalid: false,
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
			if (remaining > 0) {
				inserted.forEach(i => i.invalid = true);
			}
			return remaining;
		}

		for (const column of columns) {
			for (const item of column.items) {
				if (item.fixed || !item.visible) {
					continue;
				}
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
				lastItem.endTime = income.time;
			}
			incomeValue += income.incomeDelta;
			income.incomePerMin = incomeValue;
			lastItem = income;
		}
		lastItem.endTime = lastItem.time;

		for (const column of columns) {
			let needNotifyColumn = false;
			for (const item of column.items) {
				if (item.fixed || !item.visible) {
					continue;
				}
				const unitData = getUnitData(item.typeId);
				if (unitData.category === Category.WORKER) {
					workers++;
				}
				if (unitData.mineralCost > 0) {
					const remaining = insertSpending(item.time, unitData.mineralCost, item.id, Color[unitData.category]);
					const invalid = (remaining > 0);
					if (item.invalid !== invalid) {
						item.invalid = invalid;
						needNotifyColumn = true;
						/* if (invalid) {
							console.log(`Not enough minerals! ${-divideInt(remaining, INCOME_SCALE_DIV)}`);
						} */
					}
				}
			}
			if (needNotifyColumn) {
				// update viewItems for changed `.invalid` values
				column.notify();
			}
		}

		for (const income of incomeItems) {
			income.height = (income.endTime - income.time) * timeScale;
			income.width = divideInt(income.incomePerMin * incomeWidthScale, INCOME_SCALE_DIV);
			// income.key = (income.invalid ? '!' : '') + (income.endTime - income.time) + ':' + income.incomePerMin + ':' + income.itemsId.join(',');
			if (income.id) {
				income.key = '%' + income.itemsId.join(',');
			} else {
				income.key = income.sIndex + ':' + (income.endTime - income.time) + ':' + income.incomePerMin + ':' + income.itemsId.join(',');
			}

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

		incomeItems[0].spHigher = true;

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
					isLiftOff: unitData.category === Category.LIFT_OFF,
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
		return column.viewItems = viewItems.concat(draggingItems);
	}

	const columnsById = new Map();

	function createColumn(items = []) {
		const [track, notify] = voidSignal();
		const column = {
			id: nextColumnId,
			removed: false,
			secondaryCol: undefined,
			isSecondary: false,
			items, viewItems: [], notify,
			getItems: () => track(getViewItems(column)),
		};
		columnsById.set(column.id, column);
		nextColumnId++;
		return column;
	}

	let columns = data.map( columnItems => {
		const items = initColumnItems(columnItems);
		return createColumn(items);
	});

	const history = History(HISTORY_LIMIT);

	// let vv = 0;

	const [canUndo, setCanUndo] = signal(false);
	const [canRedo, setCanRedo] = signal(false);

	function saveHistory(key = undefined) {
		const data = {
			// columnsV: 0,
			// v: vv,
			columns: columns.map(c => ({
				id: c.id,
				isSecondary: c.isSecondary,
				secondaryColId: c.secondaryCol ? c.secondaryCol.id : undefined,
				items: c.items.slice(0),
			}))
		};
		// console.log('save', vv, JSON.stringify(columns[7].items, null, 4));
		// vv++;
		history.pushState(data, key);
		setCanUndo(history.canUndo());
		setCanRedo(false);
	}

	saveHistory();

	function clearColumnsData(data = []) {
		history.clear();
		columnsById.clear();

		columns = data.map( columnItems => {
			const items = initColumnItems(columnItems);
			return createColumn(items);
		});
		saveHistory();
		notifyColumns();
		notifyColumnsData();
	}

	function applyHistoryData(data) {
		notifyColumnsData();
		const prevColumns = columns;
		columns.forEach(c => c.removed = true);
		columns = [];
		for (const colData of data.columns) {
			const column = columnsById.get(colData.id);
			column.removed = false;
			column.secondaryCol = colData.secondaryColId
				? columnsById.get(colData.secondaryColId)
				: undefined;
			if (column.items.length > 0 || colData.items.length > 0) { // skip updating empty columns
				column.items = colData.items.slice(0);
				clearItemsDragging(column);
				column.notify();
			}
			/* if (column === prevColumns[7]) {
				console.log('load', data.v, JSON.stringify(column.items, null, 4));
			} */
			columns.push(column);
		}
		prevColumns.forEach(column => {
			if (column.removed) {
				columnRemoved(column);
			}
		});
		notifyColumns();
	}

	function undoHistory() {
		const data = history.undo();
		if (!data) {
			return false;
		}
		batch(() => {
			applyHistoryData(data);
		});
		setCanUndo(history.canUndo());
		setCanRedo(history.canRedo()); // true
		return true;
	}

	function redoHistory() {
		const data = history.redo();
		if (!data) {
			return false;
		}
		batch(() => {
			applyHistoryData(data);
		});
		setCanUndo(history.canUndo()); // true
		setCanRedo(history.canRedo());
		return true;
	}

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
		// notifyColumnsData();
	}

	function insertColumnAfter(column, afterCol) {
		const index = findColumnIndex(afterCol);
		columns.splice(index + 1, 0, column);
		notifyColumns();
		// notifyColumnsData();
	}

	/* function removeColumn(column) {
		;
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
		// column.items = pushImmutable(column.items, item); // immutable version
		column.items.push(item);
		column.notify();
		if (column.items.length === 1 && isLastColumn(column)) {
			insertColumnAfter(createColumn(), column);
		}

		if (!column.isSecondary && unitData.isWide) {
			let insertCol = false;
			if (!column.secondaryCol) {
				insertCol = true;
				column.secondaryCol = createColumn();
				column.secondaryCol.isSecondary = true;
			}
			appendItem(column.secondaryCol, typeId, {
				time, visible: false,
				productionTypeId: getProductionTypeId(column),
			});
			if (insertCol) {
				insertColumnAfter(column.secondaryCol, column);
			}
		}
		if (visible) {
			saveHistory();
		}
	}

	function deleteColumnItem(column, fn) {
		const index = column.items.findIndex(fn);
		if (index !== -1) {
			const item = column.items[index];
			// column.items = column.items.toSpliced(index, 1);
			// column.items = deleteImmutable(column.items, index); // immutable version
			column.items.splice(index, 1);
			return item;
		}
	}

	let removeEventId = 0;

	function removeItem(column, viewItem, mouseDown = false) {
		const index = column.items.findIndex(i => i.id === viewItem.id);
		// const item = deleteColumnItem(column, i => i.id === viewItem.id);
		if (index !== -1) {
			const item = column.items[index];
			column.items.splice(index, 1);
			const unitData = getUnitData(item.typeId);
			if (
				unitData.category === Category.PRODUCTION ||
				unitData.category === Category.RESOURCE_CENTER ||
				unitData.category === Category.TECH_STRUCTURE
			) {
				column.items = [];
			} else {
				// delete items that has missing requirements
				for (let i = index; i < column.items.length; i++) {
					const itemUnitData = getUnitData(column.items[i].typeId);
					if (!validateRequirement(itemUnitData.requirement, column.items, column.isSecondary)) {
						column.items.splice(i, 1);
						i--;
					}
				}
			}
			if (column.secondaryCol) {
				if (unitData.category === Category.ADDON) {
					/* deleteColumnItem(
						column.secondaryCol,
						i => i.time === item.time && !i.visible
					); */
					// if (column.secondaryCol.items.length === 0) {
						removeColumn(column.secondaryCol);
						column.secondaryCol = undefined;
					// }
				} else if (unitData.isWide) {
					// delete invisible height placeholder item in second line
					deleteColumnItem(
						column.secondaryCol,
						i => i.time === item.time && !i.visible
					);
				}
			}
			notifyColumnsData();
			column.notify();
			if (column.secondaryCol) {
				column.secondaryCol.notify();
			}
			if (mouseDown) {
				removeEventId++;
			}
			saveHistory('removeItems:' + removeEventId);
		}
	}

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

	/* function getPrimaryColumn(column) {
		const columnIndex = columns.findIndex(c => c === column);
		return columns[columnIndex - 1];
	} */

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
			notifyColumnsData();
			if (column.secondaryCol) {
				dragMode = DragMode.MultipleWithSecondary;
				setItemsDragging(column.secondaryCol);
				column.secondaryCol.notify();
			}
			column.notify();
		} else if (unitData.category === Category.ADDON && !event.shiftKey) {
			// todo: перетаскивание перелета (Category.LIFT_OFF) багованное - пока не предусмотрено drag режима с захватом его placeholder-а. только перетаскивание всех элеметнов колонки
			dragMode = DragMode.SingleWithSecondary;
			dragMinTime = 0;
			// const primaryCol = column.isSecondary ? getPrimaryColumn(column) : column;
			validateRequirement(unitData.requirement, column.items, false /* isSecondary */, (reqItem) => {
				dragMinTime = Math.max(dragMinTime, reqItem.endTime);
			});
			
			// dragItem = column.items.find(i => i.time === dragItem.time);
			dragItem.dragging = true;
			setItemsDragging(column.secondaryCol);

			notifyColumnsData();
			column.notify();
			column.secondaryCol.notify();
		} else if (event.shiftKey) {
			// drag item with all items above
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

			notifyColumnsData();
			if (dragMode === DragMode.MultipleWithSecondary) {
				setItemsDragging(column.secondaryCol);
				column.secondaryCol.notify();
			}
			column.notify();
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
		let dragItem = column.items[index];
		const timeScale = getTimeScale();
		const newX = 0;
		let newY = divideInt(y, timeScale);
		newY = Math.max(newY, dragMinTime);
		const prevTime = dragItem.time;

		notifyColumnsData();
		if (dragMode === DragMode.Multiple || dragMode === DragMode.MultipleWithSecondary) {
			let offset = newY - prevTime;
			let i = 0;
			for (const item of column.items) {
				if (item.dragging) {
					const itemHeight = item.endTime - item.time;
					const newItem = Object.assign({}, item);
					newItem.time += offset;
					newItem.endTime = newItem.time + itemHeight;
					column.items[i] = newItem;
				}
				i++;
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
			dragItem = Object.assign({}, dragItem);
			dragItem.time = time;
			dragItem.endTime = time + itemHeight;
			dragItem.dragging = true;

			let offset = (time > prevTime) ? 1 : -1;
			let i = index;
			let nextIndex = i + offset;
			let nextItem = column.items[nextIndex];
			// let cloned = false;
			while (nextItem && (time - nextItem.time) * offset > 0) {
				/* if (!cloned) {
					cloned = true;
					column.items = column.items.slice(0); // cloning array, to need to stay immutable for history
				} */
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
			let i = 0;
			for (const item of column.secondaryCol.items) {
				if (item.dragging) {
					const itemHeight = item.endTime - item.time;
					const newItem = Object.assign({}, item);
					newItem.time += offset;
					newItem.endTime = newItem.time + itemHeight;
					column.secondaryCol.items[i] = newItem;
				}
				i++;
			}
			column.secondaryCol.notify();
		}

		if (dragMode === DragMode.Single || dragMode === DragMode.SingleWithSecondary) {
			return [newX, newY * timeScale];
		}
	}

	function dragFinishItem(column, viewItem) {
		notifyColumnsData();
		if (dragMode === DragMode.Multiple) {
			clearItemsDragging(column);
			column.notify();
		} else if (dragMode === DragMode.MultipleWithSecondary || dragMode === DragMode.SingleWithSecondary) {
			clearItemsDragging(column);
			column.notify();
			/* const column2 = column.isSecondary
				? getPrimaryColumn(column)
				: column.secondaryCol; */
			clearItemsDragging(column.secondaryCol);
			column.secondaryCol.notify();
		} else if (dragMode === DragMode.Single) {	
			const item = column.items.find(i => i.id === viewItem.id);
			if (!item) {
				throw new Error(`Item not found, id = '${viewItem.id}'`);
			}
			item.dragging = false;
			column.notify();
		}
		saveHistory();
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

		clearColumnsData,

		workersCount,
		columnsData,
		getEconomyItems,
		// getPrimaryColumn,

		// appendColumn,
		// removeColumn,
		// dragMoveColumn,

		appendItem,
		removeItem,

		dragStartItem,
		dragMoveItem,
		dragFinishItem,

		undoHistory,
		redoHistory,
		canUndo,
		canRedo,
	};
}

const images = [];
function preloadImages() {
	for (const unitData of UnitsData.Terran) {
		const image = new Image();
		image.src = './resources/' + unitData.icon;
		images.push(image);
	}
	for (const unitData of UnitsData.Zerg) {
		const image = new Image();
		image.src = './resources/' + unitData.icon;
		images.push(image);
	}
}

function App() {
	preloadImages();

	const [race, setRace] = signal('Terran');
	const [timeScale, setTimeScale] = signal(4);

	function getRaceKey() {
		return race(race => {
			if (race === 'Terran') {
				return 't';
			}
			if (race === 'Zerg') {
				return 'z';
			}
			if (race === 'Protoss') {
				return 'p';
			}
		});
	}

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
		if (!selectedColumn) {
			return;
		}
		let typeId = 0;
		const raceKey = getRaceKey();
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
					key: raceKey + typeId + ':' + isDisabled,
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

	const {
		workersCount, columnsData, getEconomyItems,
		trackInvalidItems,
		appendItem, removeItem,
		dragStartItem, dragMoveItem, dragFinishItem,
		undoHistory, redoHistory, clearColumnsData,
		canUndo, canRedo,
	} = ProductionColumnsData(
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
			],
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



	function handleRemoveItem(column, item, mouseDown) {
		batch(() => {
			removeItem(column, item, mouseDown);
			if (selectedColumn && selectedColumn.id === column.id) {
				updateButtons();
			}
		});
	}

	function handleAppendItem(typeId) {
		batch(() => {
			if (selectedColumn) {
				const minTime = Math.ceil((
					panelProductionEl.scrollHeight - panelProductionEl.scrollTop - panelProductionEl.clientHeight
				) / timeScale());
				appendItem(selectedColumn, typeId, {minTime});
				updateButtons();
			}
		});
	}

	function handleUndo() {
		if (undoHistory()) {
			updateButtons();
		}
	}
	
	function handleRedo() {
		if (redoHistory()) {
			updateButtons();
		}
	}

	function selectRace(race) {
		setSelectedColumn(undefined);
		setRace(race);

		let data;
		if (race === 'Terran') {
			const firstColumnData = [
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
			];
			data = [
				firstColumnData,
				...Array.from({length: 18}, () => [])
			];
		} else if (race === 'Zerg') {
			const firstColumnData = [
				{
					name: 'Hatchery', typeId: 0,
					time: 0, fixed: true,
				}
			];
			const secondColumnData = [
				{
					name: 'Overlord', typeId: 3,
					time: 0, fixed: true,
				}
			];
			const thirdColumnData = [
				{
					name: 'Drone', typeId: 1,
					time: 0,
				},
				{
					name: 'Drone', typeId: 1,
					time: 12,
				},
				{
					name: 'Drone', typeId: 1,
					time: 24,
				},
			];
			data = [
				firstColumnData, secondColumnData, thirdColumnData,
				...Array.from({length: 16}, () => [])
			];
		} else if (race === 'Protoss') {
			const firstColumnData = [
				{
					name: 'Nexus', typeId: 0,
					time: 0, fixed: true,
				},
				{
					name: 'Probe', typeId: 1,
					time: 0,
				},
				{
					name: 'Probe', typeId: 1,
					time: 12,
				},
				{
					name: 'Probe', typeId: 1,
					time: 24,
				},
			];
			data = [
				firstColumnData,
				...Array.from({length: 18}, () => [])
			];
		}

		clearColumnsData(data);
	}

	const panelProductionEl = document.getElementById('panel-production');
	delegateEvent(panelProductionEl, '.production-button-add-item', 'click', (el) => el.clickAppendItem(el));

	panelProductionEl.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	});

	const MOUSE_BUTTON_RIGHT = 2;
	function handleMouseRightButton(el, event, mouseDown = false) {
		if (event.buttons === MOUSE_BUTTON_RIGHT) {
			el.clickRemoveItem(event, mouseDown);
		}
	}
	delegateEvent(panelProductionEl, '.production-item', 'mousedown', function(el, event) {
		handleMouseRightButton(el, event, true);
	});
	delegateEvent(panelProductionEl, '.production-item', 'mousemove', handleMouseRightButton);

	// delegateEvent(panelProductionEl, '.production-item', 'contextmenu', (el, event) => el.clickRemoveItem(event));

	render(PanelMenu, document.getElementById('panel-menu'), {
		handleUndo,
		handleRedo,
		canUndo,
		canRedo,
		getRace: race,
		selectRace,
	});
	render(ProductionColumns, document.getElementById('production-columns'), {
		panelProductionEl,
		columns: columnsData,
		trackInvalidItems,
		removeItem: handleRemoveItem,
		dragStartItem,
		dragMoveItem,
		dragFinishItem,
		setSelectedColumn,
	});
	render(PanelIncome, document.getElementById('panel-income-mount'), {
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