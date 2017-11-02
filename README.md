##### RED Interactive Agency - Ad Technology

Copy Assets Plugin (webpack)
===============

This plugin relies on https://github.com/ff0000-ad-tech/parse-settings-plugin to generate a `settings` object on webpack's `compilation` object. Then, based on deploy options & those discovered settings, the appropriate assets are copied to deploy.  

More docs forthcoming. Basic webpack implementation looks like:
```javascript
	plugins: [
		...
		new CopyAssetsPlugin(deploy),
		...
	]
```
