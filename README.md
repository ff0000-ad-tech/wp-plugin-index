##### RED Interactive Agency - Ad Technology

Assets Plugin (webpack)
===============

This plugin relies on https://github.com/ff0000-ad-tech/parse-settings-plugin to generate a `settings` object on webpack's `compilation` object. 

Check webpack dependency graph for binary-packable assets.

Then, based on deploy options & those discovered settings, the appropriate assets fba-compiled or copied to the deploy, depending on `deploy.compile` settings.  

More docs forthcoming. Basic webpack implementation looks like:
```javascript
	plugins: [
		...
		new CopyAssetsPlugin(deploy),
		...
	]
```
