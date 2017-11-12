const fs = require('fs');
const fx = require('mkdir-recursive');
const path = require('path');
const _ = require('lodash');

const copiers = {
	preloader: require('./lib/copiers/preloader'),
	failover: require('./lib/copiers/failover'),
	images: require('./lib/copiers/images'),
	videos: require('./lib/copiers/videos'),
	fonts: require('./lib/copiers/fonts'),
	runtimeIncludes: require('./lib/copiers/runtime-includes')
};

const debug = require('debug');
var log = debug('assets-plugin');

function AssetsPlugin(deploy, exclude) {
	this.deploy = deploy;
	this.exclude = exclude;
};


AssetsPlugin.prototype.apply = function(compiler) {
	compiler.plugin('emit', (compilation, callback) => {
		// emit non-compiled assets to deploy
		emitNonCompiledAssets(
			compilation,
			this.deploy
		)
		
		// binary-pack acceptable assets
		.then(() => {
			log(compilation.assets);
		})

		// return to webpack flow
		.then(() => {
			callback();
		})

		.catch((err) => {
			log(err);
		});
	});
};

function emitNonCompiledAssets(compilation, deploy) {
	return new Promise((resolve, reject) => {
		log('Preparing deploy folders for non-compiled assets');
		prepareDeploy(deploy);

		var promises = [];
		for (var i in copiers) {
			promises.push(
				copiers[i].copy(
					compilation.settings, 
					deploy
				)
			);
		}
		Promise.all(promises).then(() => {
			resolve();
		})
		.catch((err) => {
			log(err);
		});
	});
}
function prepareDeploy(deploy) {
	if (!fs.existsSync(deploy.context.deploy)) {
		fx.mkdirSync(deploy.context.deploy);
	}
}

module.exports = AssetsPlugin;