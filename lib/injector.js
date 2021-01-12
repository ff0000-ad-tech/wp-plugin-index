const fsp = require('fs').promises
const path = require('path')
const axios = require('axios')
const commentHooks = require('@ff0000-ad-tech/comment-hooks')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('wpi:lib:injectors')

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
 * note, if the data is a function it is executed
 *
 */
const applyValue = async ({ source, hook, value }) => {
	log(` Applying value to ${hook}`)
	if (typeof value === 'function') {
		value = value()
	}
	const hookRegex = commentHooks.getRegexForHook(hook)
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
	log(` Applying bundle to ${hook}`)
	const hookRegex = commentHooks.getRegexForHook(hook)
	// passing in function as 2nd argument to prevent default "$n" escaping
	return source.replace(hookRegex, () => compilation.assets[bundle].source())
}

/**
 * File-type injection
 *
 * The hook.param can be strict or a wildcard `*`.
 * In the later case, the entire source is searched for comment-hooks
 * of the requested scope & type `Require`.
 *
 * If a regex is provided, the __first match-group__ in the body of the hook
 * is assumed to be the filepath.
 *
 * If a string is provided, it is assumed to be the filepath.
 *
 * URLs will be requested, local paths will be loaded.
 * The result is written to specified hook.
 *
 */
const applyFile = async ({ scope, source, hook, file }) => {
	log(` Applying file to ${hook}`)
	hook = commentHooks.parse(hook)
	// determine the hooks to be searched for filepaths
	let params = [hook.param]
	if (hook.param === '*') {
		params = getAllHookParams(hook.scope, source)
	}
	// get filepaths
	const filepaths = params.map((param) => {
		// if file is regex, get the hook body
		if (file instanceof RegExp) {
			return getFileFromHook(source, { ...hook, param }, file)
		}
		// otherwise a specific file is requested
		return file
	})
	// load files
	const files = await Promise.all(
		filepaths.map(async (filepath) => {
			if (isUrl(filepath)) {
				const res = await axios.get(filepath)
				return res.data
			} else {
				return await fsp.readFile(path.resolve(scope, filepath), 'utf8')
			}
		})
	)
	// write results into corresponding hook
	source = files.reduce((acc, file, i) => {
		const hookRegex = commentHooks.getRegexForHook({ ...hook, param: params[i] })
		return acc.replace(hookRegex, file)
	}, source)

	return source
}

const getAllHookParams = (scope, source) => {
	const allHooksRegex = commentHooks.getRegexForAll(scope)
	const hookMatches = source.match(allHooksRegex)
	return Array.from(
		hookMatches.reduce((acc, hookMatch) => {
			const match = hookMatch.match(/Red\.Require\.([^.]+)/)
			if (match) {
				acc.add(match[1])
			}
			return acc
		}, new Set())
	)
}

const getFileFromHook = (source, hook, fileRegex) => {
	// find the hook-body
	const hookRegex = commentHooks.getRegexForHook(hook)
	const hookBody = source.match(hookRegex)
	// test for match with config's file regex
	const file = hookBody[0].match(fileRegex)
	return file[1]
}

const isUrl = (filepath) => {
	return filepath.match(/^http/)
}

module.exports = {
	getInjectorFunc
}
