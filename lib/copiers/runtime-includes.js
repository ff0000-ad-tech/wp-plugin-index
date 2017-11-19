const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('wp-plugin-assets:runtime-includes');

function copy(deploy) {
	return new Promise((resolve, reject) => {
		var promises = [];

		for (var key in deploy.settings.runtimeIncludes) {
			// prepare paths
			const buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths[key].context}`
			);
			const deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.ad.js.context}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
			const fullFilename = path.basename(
				deploy.settings.runtimeIncludes[key]
			);
			log(`Emitting -> ${deployPath}/${fullFilename}`);

			// copy runtime-include
			promises.push(
				new Promise((resolve, reject) => {
					ncp(`${buildPath}/${fullFilename}`, 
						`${deployPath}/${fullFilename}`, (err) => {
						if (err) {
							log(err);
						}
						resolve();
					});
				})
			);
		}
		Promise.all(promises).then(() => {
			resolve();
		});
	});
}


module.exports = {
	copy: copy
};