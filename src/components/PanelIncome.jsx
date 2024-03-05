import { Index } from '../pozitron-web';

function PanelIncome({ getEconomyItems, workersCount }) {

	let economyItems;

	function setupItems(itemsEl) {
		let i = 0;
		for (const itemEl of itemsEl) {
			const item = economyItems[i];
			if (item.spendingHigher) {
				itemEl.classList.add('spending-item-higher');
			} else {
				itemEl.classList.remove('spending-item-higher');
			}
			if (item.spendingPrevHigher) {
				itemEl.classList.add('spending-item-prev-higher');
			} else {
				itemEl.classList.remove('spending-item-prev-higher');
			}
			i++;
		}
	}

	const _economyItems = () => (
		economyItems = getEconomyItems() 
	);

	return (
		<div id="panel-income">
			<div id="workers-count">
				<div class="workers-count-icon" style="background-image: url('./resources/unit-terran-scv.png')" />
				<span class="workers-count-label">{workersCount}</span>
			</div>
			<Index each={_economyItems} ref={(els) => setupItems(els)}>{ item => { //  key="key"
				if (item.isLast) {
					return <div
						class="spending-item-space-infinite"
						style={{ flex: '1', width: item.width + 'px' }}
					/>;
				} else {
					return <div
						class="spending-item-space"
						classList={{ 'spending-item-next': item.isPrevSpent }}
						style={{
							'min-height': item.height + 'px',
							width: item.width + 'px',
							'--cl-bg': (item.color ? item.color : '')
						}}
					/>;
				}
				/* return (
					<button title={button.name} class="items-palette-button" ref={el => el.clickAddItem = clickAddItem} disabled={button.isDisabled ? '' : undefined}>
						<div style={{ 'background-image': `url('./resources/${button.icon}')` }} class="production-icon"></div>
					</button>
				); */
			}}</Index>
		</div>
	);
}

/* <div class="panel-income">
	<div class="spending-item spending-item-higher bg-pink" style="min-height: 20px; width: 40px;" ></div>
	<div class="spending-item-space" style="min-height: 20px; width: 40px;"></div>

	<div class="spending-item spending-item-prev-higher bg-pink" style="min-height: 20px; width: 40px;" ></div>
	<div class="spending-item spending-item-higher bg-pink" style="min-height: 10px; width: 45px;" ></div>
	<div class="spending-item spending-item-next bg-pink" style="min-height: 15px; width: 45px;" ></div>
	<div class="spending-item-space spending-item-prev-higher" style="min-height: 30px; width: 45px;"></div>
	<div class="spending-item-space spending-item-higher" style="min-height: 20px; width: 50px;"></div>
	
	<div class="spending-item bg-green" style="min-height: 20px; width: 50px;" ></div>
	<div class="spending-item-space-infinite" style="flex: 1; width: 50px;"></div>
</div> */

export default PanelIncome;