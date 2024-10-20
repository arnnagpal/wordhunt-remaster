import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('a11y-')) return;
		handler(warning);
	},
	kit: {
		adapter: adapter({
			precompress: {
				brotli: true,
				gzip: true,
				files: ['htm', 'html']
			},
			dynamic_origin: true,
			xff_depth: 1
		}),
		alias: {
			ambient: './src/ambient.d.ts'
		}
	}
};

export default config;
