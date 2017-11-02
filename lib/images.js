function copy() {
	if (!this.deploy.compileImages) {
		for (image in self.settings.assets.images) {
			destination_path = os.path.dirname(deploy_paths[target]['images_path'] + image_request)
			if not os.path.exists(destination_path):
				os.makedirs(destination_path)

			shutil.copy(
				self.paths['local_build_path'] + size['build_size'] + '/images/' + image_request,
				deploy_paths[target]['images_path'] + image_request
			)
		}
	}
}

module.exports = {
	copy: copy
};