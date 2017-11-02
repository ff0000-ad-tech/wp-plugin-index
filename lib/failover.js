function copy() {
	for failover_request in self.assets.get_failover_images(size['deploy_size']):
		failover_image_target = self.paths['local_build_path'] + size['build_size'] + '/' + failover_request

		# rename backup image in debug
		shutil.copy(
			failover_image_target,
			deploy_paths['to_debug']['ad_path'] + failover_request
		)
		# copy backup - to_cdn
		shutil.copy(
			failover_image_target,
			deploy_paths['to_cdn']['ad_path'] + failover_request
		)	

}

module.exports = {
	copy: copy
};