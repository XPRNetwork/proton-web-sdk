import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess({})],

  kit: {
    adapter: adapter({
      // default options are shown
      pages: 'build',
      assets: 'build',
      fallback: null,
    }),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

	vite: {
		ssr: {
			external: [
				'@proton/web-sdk',
				'@proton/browser-transport',
				// '@proton/browser-transport'
			]
		}
	}
  },
};

export default config;
