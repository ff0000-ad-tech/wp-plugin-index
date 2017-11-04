const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('failover');

function copy(settings, deploy) {
	return new Promise((resolve, reject) => {
		var promises = [];

		// each failover image
		settings.assets.failover.images.forEach((image) => {
			const buildPath = path.normalize(
				`${deploy.context.build}/${deploy.paths.ad}`
			);
			const deployPath = path.normalize(
				`${deploy.context.deploy}/${deploy.paths.ad}`
			);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
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

