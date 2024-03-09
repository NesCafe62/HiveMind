import { For } from '../pozitron-web';

function PanelIncome({ getEconomyItems, workersCount }) {
	let economyItems;

	function setupItems(itemsEl) {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = economyItems[i];
			if (!item.id) {
				i++;
				continue;
			}
			itemEl.style['min-height'] = item.height + 'px';
			itemEl.style.width = item.width + 'px';
			if (item.invalid) {
				itemEl.classList.add('spending-item-invalid');
			} else {
				itemEl.classList.remove('spending-item-invalid');
			}
			if (item.isPrevSpent) {
				itemEl.classList.add('spending-item-next');
			} else {
				itemEl.classList.remove('spending-item-next');
			}
			if (item.spHigher) {
				itemEl.classList.add('spending-item-higher');
			} else {
				itemEl.classList.remove('spending-item-higher');
			}
			if (item.spLower) {
				itemEl.classList.add('spending-item-lower');
			} else {
				itemEl.classList.remove('spending-item-lower');
			}
			if (item.spNextHigher) {
				itemEl.classList.add('spending-item-next-higher');
			} else {
				itemEl.classList.remove('spending-item-next-higher');
			}
			if (item.spNextLower) {
				itemEl.classList.add('spending-item-next-lower');
			} else {
				itemEl.classList.remove('spending-item-next-lower');
			}
			i++;
		}
	}

	const _economyItems = () => (
		economyItems = getEconomyItems() 
	);

	return (
		<>
			<div id="workers-count">
				<div class="workers-count-icon" style="background-image: url('./resources/unit-terran-scv.png')" />
				<span class="workers-count-label">{workersCount}</span>
			</div>
			<For each={_economyItems} key="key" ref={(els) => setupItems(els)}>{ item => { // ref={(els) => setupItems(els)} 
				if (item.isLast) {
					return <div
						class="spending-item-space-infinite"
						classList={{
							'spending-item-higher': item.spHigher,
							'spending-item-lower': item.spLower,
						}}
						style={{ flex: '1', width: item.width + 'px' }}
					/>;
				} else {
					return <div
						class="spending-item-space"
						data-key={item.key}
						classList={{
							'spending-item-invalid': item.invalid,
							'spending-item-next': item.isPrevSpent,
							'spending-item-higher': item.spHigher, 
							'spending-item-lower': item.spLower,
							'spending-item-next-higher': item.spNextHigher,
							'spending-item-next-lower': item.spNextLower,
						}}
						style={{
							'min-height': item.height + 'px',
							width: item.width + 'px',
							'--cl-bg': (item.color ? item.color : '')
						}}
					><span></span></div>;
				}
			}}</For>
		</>
	);
}

export default PanelIncome;