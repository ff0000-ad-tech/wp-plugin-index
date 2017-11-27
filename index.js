const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');

const fbaCompiler = require('fba-compiler');
const copier = require('./lib/copier.js');

const debug = require('debug');
var log = debug('wp-plugin-assets');


function AssetsPlugin(DM, assets) {
	this.DM = DM;
	this.assets = assets;
	/** TODO 
			Document `this.options`:

			this.assets = [
				{
					payload: [
						// payload objects (see wp-plugin-payload)
						{
							modules: [] // subpaths to file locations
						}
					],
					copy: {
						from: './source-context',
						to: './destination-context'	
					}
				}
			]
	*/
}


AssetsPlugin.prototype.apply = function(compiler) {
	compiler.plugin('emit', (compilation, callback) => {
		// prepare destination folders
		prepareDeploy(this.DM);

		var promises = [];
		var payloadOutput = this.DM.payload.get().output;
		var fbaAssets = [];
		// iterate assets
		for (var i in this.assets) {
			const payload = this.assets[i].payload();
			payload.type = payload.type || 'copy';
			
			// if payload type is an fba chunk-type
			if (payload.type.match(/^fbA/i)) {
				// append content to fba-compiler
				payload.modules.forEach((module) => {
					log(' --->', module.userRequest);
					fbaAssets.push({
						chunkType: payload.type,
						path: module.userRequest
					});
				});
			}

			// if payload type is inline
			else if (payload.type == 'inline') {}

			// if payload type is copy
			else {
				// copy the asset to deploy
				promises.push(
					copier.copy(
						payload.modules, 
						this.assets[i].copy
					)
				);				
			}
		}

		// compile all the assets
		promises.push(
			fbaCompiler.compile({
				target: `${payloadOutput.path}/${payloadOutput.filename}`,
				assets: fbaAssets
			})
		);
		// TODO: <img> and background-image declarations would have to be rewritten to payload blobs

		// return to webpack flow
		Promise.all(promises).then(() => {
			callback();
		})
		.catch((err) => {
			log(err);
		});		
	});
};



function prepareDeploy(DM) {
	const adEnv = DM.ad.get().env;
	if (!fs.existsSync(adEnv.context.deploy)) {
		mkdirp.sync(adEnv.context.deploy);
	}
}

module.exports = AssetsPlugin;