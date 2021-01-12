const fs = require('fs')
const axios = require('axios')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index:io')

/** -- IO ----
 *
 *
 */
const loadSource = (target, context) => {
	return new Promise(async (resolve, reject) => {
		// request from internet
		if (target.indexOf('http') > -1) {
			try {
				const res = await axios.get(target)
				resolve(res.data)
			} catch (err) {
				reject(err)
			}
		} else {
			// load from filesystem
			if (context) {
				target = path.resolve(context, target)
			}
			fs.readFile(target, 'utf8', (err, data) => {
				if (err) {
					return reject(err)
				}
				// if target is "package.json", look for "bundle" property from which to load the minified package
				// this makes it possible to inject a modules whose structure differs between: NPM-installed vs. git cloned, ie. Netflix components
				if (target.match(/package\.json$/)) {
					const pkg = JSON.parse(data)
					if ('bundle' in pkg) {
						const modulePath = target.replace(/package\.json$/, '')
						fs.readFile(path.resolve(modulePath, pkg.bundle), 'utf8', (err, data) => {
							if (err) {
								return reject(err)
							}
							resolve(data)
						})
					} else {
						return reject(new Error('Injection specified a "package.json" which did not include a "bundle" path.'))
					}
				} else {
					resolve(data)
				}
			})
		}
	})
}
const writeOutput = (target, source) => {
	fs.writeFileSync(target, source)
}

module.exports = {
	loadSource,
	writeOutput
}
