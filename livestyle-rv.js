var client = require('livestyle-client');
var patcher = require('livestyle-cssom-patcher');

function initFromScript(script) {
	var connectUrl = script.getAttribute('data-livestyle-connect');
	if (!connectUrl) {
		throw new Error('Unable to connect to LiveStyle server: no connection URL');
	}

	var m = connectUrl.match(/^(\w+:\/\/[^\/]+)(.+)$/);
	if (!m) {
		throw new Error('Invalid LiveStyle connection URL: ' + connectUrl);
	}

	init({
		host: m[1],
		endpoint: m[2],
		timeout: 5000
	});
}

function init(config) {
	client
	.on('open', function() {
		console.log('LiveStyle: connected to server');
	})
	.on('close', function() {
		console.log('LiveStyle: closed connection to server');
	})
	.on('incoming-updates diff', function(data) {
		var result = patcher.patch(data.uri, data.patches);
	})
	.connect(config);
}

// find script tag that embedded client
var scripts = document.getElementsByTagName('script');
for (var i = 0, il = scripts.length; i < il; i++) {
	if ((scripts[i].src || '').indexOf('/livestyle-rv.js') !== -1) {
		initFromScript(scripts[i]);
		break;
	}
}