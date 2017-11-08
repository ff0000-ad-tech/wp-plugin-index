const fs = require('fs');
const fx = require('mkdir-recursive');
const path = require('path');
const _ = require('lodash');

const lib = {
	preloader:  require('./lib/preloader'),
	failover:  require('./lib/failover'),
	images:  require('./lib/images'),
	videos:  require('./lib/videos'),
	fonts:  require('./lib/fonts'),
	// runtimeIncludes:  require('./lib/runtimeIncludes'),
// miscAdFolders:  require('./lib/miscAdFolders'),
// miscCommonFolders:  require('./lib/miscCommonFolders')
};

const debug = require('debug');
var log = debug('copy-assets-plugin');

function CopyAssetsPlugin(deploy) {
	this.deploy = deploy;
};


CopyAssetsPlugin.prototype.apply = function(compiler) {
	compiler.plugin('emit', (compilation, callback) => {
		log('Preparing deploy folders');
		prepareDeploy(this.deploy);

		log('Copying assets:');
		var promises = [];
		for (var i in lib) {
			promises.push(
				lib[i].copy(
					compilation.settings, 
					this.deploy
				)
			);
		}

		// return to webpack flow
		Promise.all(promises).then(() => {
			callback();
		})
		.catch((err) => {
			log(err);
		});
	});
};

function prepareDeploy(deploy) {
	if (!fs.existsSync(deploy.context.deploy)) {
		fx.mkdirSync(deploy.context.deploy);
	}
}

module.exports = CopyAssetsPlugin;