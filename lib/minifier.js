const htmlMinifier = require('html-minifier')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index:minifier')

const minifier = (html) => {
	return htmlMinifier.minify(html, {
		minifyCSS: true,
		minifyJS: {
			compress: {
				drop_console: true
			}
		},
		removeComments: true,
		caseSensitive: true,
		keepClosingSlash: true
	})
}

module.exports = minifier
