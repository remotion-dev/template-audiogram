import { Config } from 'remotion';

Config.Rendering.setImageFormat('jpeg');
Config.Output.setOverwriteOutput(true);

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
	const cssRules = currentConfiguration.module?.rules?.find((r) => {
		if (r === '...') {
			return false;
		}
		return r.test?.toString().includes('.css');
	});
	const useCss =
		cssRules !== '...' && cssRules !== undefined ? cssRules.use : [];
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules ?? []).filter((rule) => {
					if (rule === '...') {
						return false;
					}
					if (rule.test?.toString().includes('.css')) {
						return false;
					}
					return true;
				}),
				{
					test: /\.css$/i,
					use: [
						...(Array.isArray(useCss) ? [...useCss] : []),
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: [
										'postcss-preset-env',
										'tailwindcss',
										'autoprefixer',
									],
								},
							},
						},
					],
				},
				{
					test: /\.srt?$/,
					type: 'asset/source',
				},
			],
		},
	};
});
