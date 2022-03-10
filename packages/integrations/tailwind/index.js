import tailwindPlugin from 'tailwindcss';
import autoprefixerPlugin from 'autoprefixer';

export default async function () {
	return {
		name: '@astrojs/tailwind',
		hooks: {
			'astro:config:setup': ({ config, injectScript }) => {
				// Inject the Tailwind postcss plugin
				config.styleOptions.postcss.plugins.push(tailwindPlugin);
				config.styleOptions.postcss.plugins.push(autoprefixerPlugin);
				// Inject the Tailwind base import
				injectScript('bundle', `import '@astrojs/tailwind/base.css';`);
			},
		},
	};
}
