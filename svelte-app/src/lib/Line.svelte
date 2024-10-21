<script lang="ts">
	import { onMount } from 'svelte';
	import { type Position } from 'wordhunt-utils';

	export let start: HTMLElement | Position;
	export let joints: Array<HTMLElement> | Array<Position>;
	export let color = '#000';
	export let thickness = 5;
	export let opacity = 1;

	let svg: SVGElement;

	let loaded = false;

	onMount(() => {
		if (!start || !joints) {
			console.error('From and To elements must be provided');
			return;
		}

		if (joints.length === 0) {
			console.error('At least one joint must be provided');
			return;
		}

		if (start === joints[0]) {
			console.error('From and To elements must be different');
			return;
		}

		adjustLine(start, joints);
		loaded = true;
	});

	$: {
		if (loaded) adjustLine(start, joints);
	}

	function getCenter(element: HTMLElement): Position {
		let rect = element.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		} as Position;
	}

	function adjustLine(from: HTMLElement | Position, joints: Array<HTMLElement> | Array<Position>) {
		let fromPos = from instanceof HTMLElement ? getCenter(from) : from;

		let path = `M${fromPos.x} ${fromPos.y}`;

		for (let joint of joints) {
			let jointPos = joint instanceof HTMLElement ? getCenter(joint) : joint;
			path += ` L${jointPos.x} ${jointPos.y}`;
		}

		svg.innerHTML = `<path d="${path}" fill="transparent" stroke="${color}" stroke-width="${thickness}" stroke-opacity="${opacity}" stroke-linecap="round" />`;
	}
</script>

<svg class="absolute top-0 left-0 z-[1] w-full h-full pointer-events-none filter" bind:this={svg}>
</svg>
