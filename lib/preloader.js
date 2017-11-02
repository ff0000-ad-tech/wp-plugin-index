const fs = require('fs');
const fx = require('mkdir-recursive');
const path = require('path');

const debug = require('debug');
var log = debug('preloader');

function copy(settings) {
	const paths = settings.deploy.paths;

	return new Promise((resolve, reject) => {
		var promises = [];
		settings.assets.preloader.images.forEach((image) => {
			const buildPath = path.normalize(
				`${paths.context.build}/${paths.images}`
			);
			const deployPath = path.normalize(
				`${paths.context.deploy}/${paths.images}`
			);
			log(deployPath);
			if (!fs.existsSync(deployPath)) {
				fx.mkdirSync(deployPath);
			}
			promises.push(new Promise((resolve, reject) => {
				fs.copyFile(`${buildPath}/${image.source}`, 
					`${deployPath}/${image.source}`, (err) => {
					if (err) {
						log(err);
					}
					resolve();
				});
			}));
		});
	});
}

module.exports = {
	copy: copy
};