const fs = require('fs')
const path = require('path')
const request = require('request')

const hooksRegex = require('@ff0000-ad-tech/hooks-regex')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index')

const defaultOptions = {
	inject: {}
}

function IndexPlugin(DM, options) {
	this.DM = DM
	this.options = Object.assign(defaultOptions, options)

	this.updates = [adParams, assets, environments, inline, initial]
	this.output
}

/** -- WEBPACK ----
 *
 *
 */
IndexPlugin.prototype.apply = function(compiler) {
	const self = this

	// add index.html to watchlist
	compiler.plugin('after-compile', (compilation, callback) => {
		const indexPath = path.resolve(self.options.source.path)
		compilation.fileDependencies.push(indexPath)
		callback()
	})

	// inject & update index
	compiler.plugin('emit', (compilation, callback) => {
		// load index
		loadSource(this.options.source.path)
			.then(output => {
				this.output = output
			})
			.then(() => {
				// apply injections
				log('Applying Injections:')
				const injections = Object.assign({}, self.options.inject)
				return fulfillInjections(injections, this.output).then(output => {
					this.output = output
				})
			})
			.then(() => {
				if (this.DM) {
					log('Applying Settings Updates:')
					// apply all updates
					this.output = self.updates.reduce((output, update) => {
						return update(self.DM, output, compilation)
					}, this.output)
				}
			})
			.then(() => {
				log('Applying Requesters:')
				// apply all requesters
				return fulfillRequesters(this.output, path.dirname(this.options.source.path)).then(output => {
					this.output = output
				})
			})
			.then(() => {
				callback()
			})
			.catch(err => {
				log(err)
				callback(err)
			})
	})

	// write index
	compiler.plugin('after-emit', (compilation, callback) => {
		log(`Emitting -> ${this.options.output.path}`)
		if (this.DM) {
			log(this.DM.ad.get().settings.ref)
		}
		writeOutput(this.options.output.path, this.output)
		callback()
	})
}

/** -- IO ----
 *
 *
 */
function loadSource(path) {
	return new Promise((resolve, reject) => {
		if (path.indexOf('http') > -1) {
			// request from internet
			request.get('https://ae.nflximg.net/monet/scripts/custom-element.js', (err, res, body) => {
				if (err) {
					return reject(err)
				}
				resolve(body)
			})
		} else {
			// load from filesystem
			fs.readFile(path, 'utf8', (err, data) => {
				if (err) {
					return reject(err)
				}
				resolve(data)
			})
		}
	})
}
function writeOutput(path, source) {
	fs.writeFileSync(path, source)
}

/** -- Inject ----
 *
 *
 */
function fulfillInjections(injections, source) {
	return new Promise((resolve, reject) => {
		if (!Object.keys(injections).length) {
			return resolve(source)
		}
		const name = Object.keys(injections)[0]
		const path = injections[name]
		inject(name, path, source)
			.then(output => {
				delete injections[name]
				return fulfillInjections(injections, output)
			})
			.then(output => {
				resolve(output)
			})
			.catch(err => reject(err))
	})
}
function inject(name, path, source) {
	log(` ${name}`)
	return loadSource(path)
		.then(content => {
			return source.replace(hooksRegex.get('Red', 'Inject', name), () => content)
		})
		.catch(err => {
			log(`Unable to find Red Hook "Red.Inject.${name}"`)
			return source
		})
}

/** -- UPDATERS ----
 *
 *
 */
function adParams(DM, source) {
	log(' adParams')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'ad_params'),
		`var adParams = ${JSON.stringify(DM.ad.get().settings.ref.adParams, null, '\t')};`
	)
	return source
}

function assets(DM, source) {
	log(' assets')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'assets'),
		`var assets = ${JSON.stringify(DM.ad.get().settings.ref.assets, null, '\t')};`
	)
	return source
}

function environments(DM, source) {
	log(' environments')
	source = source.replace(
		hooksRegex.get('Red', 'Settings', 'environments'),
		`var environments = ${JSON.stringify(DM.ad.get().settings.ref.environments, null, '\t')};`
	)
	return source
}

// passing in function as 2nd argument to prevent default "$n" escaping
function inline(DM, source, compilation) {
	log(' inline')
	source = source.replace(hooksRegex.get('Red', 'Inject', 'inline_entry'), () => compilation.assets['inline.bundle.js'].source())
	return source
}

function initial(DM, source, compilation) {
	log(' initial')
	source = source.replace(hooksRegex.get('Red', 'Inject', 'initial_entry'), () => compilation.assets['initial.bundle.js'].source())
	return source
}

/** -- REQUESTERS ----
 *
 *	Requesters are Red Hooks that request injection of a specific file.
 */
function fulfillRequesters(source, context) {
	return new Promise((resolve, reject) => {
		let promises = []
		const requester = getRequester(source)
		if (requester) {
			loadRequesterContent(requester, context)
				.then(content => {
					source = source.replace(hooksRegex.get('Red', 'Requester', requester.groups.param), content)
					return fulfillRequesters(source, context)
				})
				.then(source => resolve(source))
				.catch(err => reject(err))
		} else {
			resolve(source)
		}
	})
}
function getRequester(source) {
	const regex = hooksRegex.get('Red', 'Requester', '*')
	return regex.exec(source)
}

function loadRequesterContent(requester, context) {
	return new Promise((resolve, reject) => {
		const contentMatch = requester.groups.content.match(/inject[\s\(\'\"]{2,}([^\'\"]+)/)
		if (!contentMatch) {
			reject(new Error(`Unable to parse Requester: "inject('path-to-asset')"`))
		}
		log(` ${contentMatch[1]}`)
		loadSource(path.resolve(context, contentMatch[1]))
			.then(content => {
				resolve(content)
			})
			.catch(err => {
				log(`Unable to load Requester: ${requester.groups.content}:\n${err}`)
				reject(err)
			})
	})
}

module.exports = IndexPlugin
