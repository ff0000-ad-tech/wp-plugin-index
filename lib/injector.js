const commentHooks = require('@ff0000-ad-tech/comment-hooks')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wp-plugin-index:injectors')

const getInjectorFunc = (injection) => {
	if ('value' in injection) {
		return applyValue
	} else if ('bundle' in injection) {
		return applyBundle
	} else if ('file' in injection) {
		return applyFile
	}
}

/**
 * Value-type injection
 *
 * stringifies whatever data is passed
 * and appends it to specified hook
 *
 */
const applyValue = async ({ source, hook, value }) => {
	log(` ${param}:`, value)
	const hookRegex = commentHooks.getHookRegex(hook)
	return source.replace(hookRegex, value)
}

/**
 * Bundle-type injection
 *
 * locates requested bundle in webpack compilation-object
 * and appends it to specified hook
 *
 */
const applyBundle = async ({ compilation, source, hook, bundle }) => {
	log(` ${param}:`, bundle)
	const hookRegex = commentHooks.getHookRegex(hook)
	return source.replace(hookRegex, () => compilation.assets[bundle].source())
}

/**
 * File-type injection
 *
 * The hook.param can be strict or a wildcard `*`.
 * In the later case, the entire source is searched for comment-hooks
 * of the requested scope & type `Require`.
 *
 * If a regex is provided, the first match-group in the body of the hook
 * is assumed to be the filepath.
 *
 * If a string is provided, it is assumed to be the filepath.
 *
 * URLs will be requested, local paths will be loaded.
 * The result is written to specified hook.
 *
 */
const applyFile = async ({ source, hook, file }) => {
	log(` ${param}:`, file)
	hook = commentHooks.parse(hook)
	if (hook.param === '*') {
		const matches = source.match(commentHooks.getScopeRegex(hook.scope))
		log(matches)
	}

	// first get the hook value
	// const hookRegex = commentHooks.getHookRegex(hook)
	// const hookValue = source.match(hookRegex)
	// if (!hookValue)
	// let filepath
	// if (file instanceof RegExp) {

	// }
	// return source.replace(commentHooks.getHookRegex(hook.scope, hook.component, hook.param), value)
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
				.then((content) => {
					source = source.replace(hooksRegex.get('Red', 'Requester', requester.groups.param), content)
					return fulfillRequesters(source, context)
				})
				.then((source) => resolve(source))
				.catch((err) => reject(err))
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
		loadSource(contentMatch[1], context)
			.then((content) => {
				resolve(content)
			})
			.catch((err) => {
				log(`Unable to load Requester: ${requester.groups.content}:\n${err}`)
				reject(err)
			})
	})
}

module.exports = {
	getInjectorFunc
}
