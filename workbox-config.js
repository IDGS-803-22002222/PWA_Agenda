module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{png,json,css,html,js}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};