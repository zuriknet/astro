import tailwindPlugin from 'tailwindcss';
export default async function () {
	return {
		name: '@astrojs/tailwind',
		hooks: {
			'astro:config:setup': ({ config, injectScript }) => {
				// Inject the Tailwind postcss plugin
				config.styleOptions.postcss.plugins.push(tailwindPlugin);
				// Inject the Tailwind base import
				injectScript('bundle', `import '@astrojs/tailwind/base.css';`);
			},
		},
	};
}
