import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter: adapter({fallback:true}),
	},
	preprocess: sveltePreprocess({
		scss: {
			prependData: `@import 'src/lib/theme/global.scss';`
		}
	}),
};

export default config;
