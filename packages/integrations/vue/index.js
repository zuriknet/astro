import vue from '@vitejs/plugin-vue';

function getRenderer() {
	return {
		name: '@astrojs/vue',
		clientEntrypoint: '@astrojs/vue/client.js',
		serverEntrypoint: '@astrojs/vue/server.js',
	};
}

function getViteConfiguration() {
	return {
		optimizeDeps: {
			include: ['@astrojs/vue/client.js', 'vue'],
			exclude: ['@astrojs/vue/server.js'],
		},
		plugins: [vue()],
		ssr: {
			external: ['@vue/server-renderer'],
		},
	};
}

export default function () {
	return {
		name: '@astrojs/vue',
		hooks: {
			'astro:config:setup': ({ addRenderer }) => {
				addRenderer(getRenderer());
				return {
					vite: getViteConfiguration(),
				};
			},
		},
	};
}
