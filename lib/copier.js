const fs = require('fs');
const fx = require('mkdir-recursive');
const ncp = require('ncp').ncp;
const path = require('path');

const debug = require('debug');
var log = debug('wp-plugin-assets:copier');

function copy(deploy, options) {
	if (deploy.inline.preloader) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		// each source
		var promises = [];
		options.sources.forEach((source) => {
			// prepare target folder
			const targetPath = path.normalize(`${options.deployPath}/${source}`);
			if (!fs.existsSync(path.dirname(targetPath))) {
				mkdirp.sync(path.dirname(targetPath));
			}

			// copy
			log(`Emitting -> ${targetPath}`);
			promises.push(
				new Promise((resolve, reject) => {
					ncp(
						path.normalize(`${options.buildPath}/${source}`), 
						targetPath, (err) => {
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