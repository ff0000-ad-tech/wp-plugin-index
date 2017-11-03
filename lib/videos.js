const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');
const walk = require('walk');

const debug = require('debug');
var log = debug('videos');

function copy(settings) {
	const paths = settings.deploy.paths;

	return new Promise((resolve, reject) => {
		const buildPath = path.normalize(
			`${paths.context.build}/${paths.videos}`
		);
		const deployPath = path.normalize(
			`${paths.context.deploy}/${paths.videos}`
		);

		// if there is a videos folder
		if (!fs.existsSync(buildPath)) {
			return resolve();
		}
		var promises = [];
		walk.walk(buildPath)
		.on('file', (root, stat, next) => {
			if (!stat.name.match(/^\./)) {
				promises.push(
					new Promise((resolve, reject) => {
						// a bunch of juggling to get the paths right
						const subpath = root.slice(buildPath.length);
						const destPath = path.normalize(
							`${deployPath}/${subpath}`
						);
						if (!fs.existsSync(destPath)) {
							fx.mkdirSync(destPath);
						}
						const renamed = checkToRename(stat.name);
						const finalPath = path.normalize(
							`${destPath}/${renamed}`
						)
						log(` -> ${finalPath}`);

						// do the copy
						ncp(`${root}/${stat.name}`, finalPath, (err) => {
							if (err) {
								reject(err);
							}	
							resolve();
						});
					})
				);
			}
			next();
		})
		.on('errors', function(entry, stat) {
			const err = 'Unable to hash:\n' + stat[0].error.Error;
			log(err);
			reject(err);
		})
		.on('end', function() {
			Promise.all(promises).then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
		});

	});
}


function checkToRename(filename) {
	// append '.js' to '.mpg'
	return filename.replace(/(\.mpg)$/, '$1.js');
}



module.exports = {
	copy: copy
};