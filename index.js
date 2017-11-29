const fs = require('fs');
const path = require('path');


const debug = require('debug');
var log = debug('wp-plugin-index');


function IndexPlugin(DM, options) {
	this.DM = DM;
	this.options = options;
}


IndexPlugin.prototype.apply = function(compiler) {
	compiler.plugin('emit', (compilation, callback) => {
	
	});
};




module.exports = IndexPlugin;