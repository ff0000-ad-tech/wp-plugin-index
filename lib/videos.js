function copy() {
	if os.path.exists(self.paths['local_build_path'] + size['build_size'] + '/videos'):
		if len(os.listdir(self.paths['local_build_path'] + size['build_size'] + '/videos/')):
			copy_tree(
				self.paths['local_build_path'] + size['build_size'] + '/videos',
				deploy_paths[target]['videos_path']
			)
			# append ".js" to .fbv in order to upload to strict platforms
			for item_name in os.listdir(deploy_paths[target]['videos_path']):
				new_item_name = None
				if re.search(r'\.mpg$', item_name):
					new_item_name = re.sub(r'(\.mpg$)', '\g<1>.js', item_name)
				if new_item_name:
					os.rename(
						deploy_paths[target]['videos_path'] + item_name, 
						deploy_paths[target]['videos_path'] + new_item_name
					)
}

module.exports = {
	copy: copy
};