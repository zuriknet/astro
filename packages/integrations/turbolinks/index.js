export default function createPlugin() {
	return {
		name: '@astrojs/turbolinks',
		hooks: {
			'astro:config:setup': ({ injectScript }) => {
				injectScript('bundle', `import Turbolinks from "turbolinks"; Turbolinks.start();`);
			},
		},
	};
}
