const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('preloader');

function copy(settings) {
	const paths = settings.deploy.paths;

	return new Promise((resolve, reject) => {
		var promises = [];

		// each preloader image
		settings.assets.preloader.images.forEach((image) => {
			const buildPath = path.normalize(
				`${paths.context.build}/${paths.images}`
			);
			const deployPath = path.normalize(
				`${paths.context.deploy}/${paths.images}`
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