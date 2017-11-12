const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('failover');

function copy(settings, deploy) {
	return new Promise((resolve, reject) => {
		// prepare paths
		var buildPath, deployPath;
		if (settings.assets.failover.images.length) {
			buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths.run.ad}`
			);
			deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.run.ad}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
		}

		// each failover image
		var promises = [];
		settings.assets.failover.images.forEach((image) => {
			log(` -> ${deployPath}/${image.source}`);

			promises.push(
				new Promise((resolve, reject) => {
					ncp(`${buildPath}/${image.source}`, 
						`${deployPath}/${image.source}`, (err) => {
						if (err) {
							log(err);
						}
						resolve();
					});
				})
			);
		});
		Promise.all(promises).then(() => {
			resolve();
		});
	});
}

module.exports = {
	copy: copy
};

