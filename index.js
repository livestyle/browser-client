var client = require('livestyle-client');
var patcher = require('livestyle-cssom-patcher');

function initFromScript(script) {
	var host = script.getAttribute('data-livestyle-host');
	var rewriteHost = (script.getAttribute('data-livestyle-rewrite') || '').trim().toLowerCase();
	var config = {
		rewriteHost: true
	};

	if (rewriteHost && rewriteHost !== 'true' && rewriteHost !== 'yes') {
		config.rewriteHost = false;
	}

	if (host) {
		var port = null;
		host = host.replace(/:(\w+)(\/.*)?$/, function(str, p) {
			port = +p;
		});

		config.host = host;
		if (port) {
			config.port = port;
		}
	}

	init(config);
}

function init(config) {
	client
	.on('incoming-updates', function(data) {
		console.log('incoming patch', data.uri, data.patches);
		var result = patcher.patch(data.uri, data.patches);
		if (!result && config.rewriteHost) {
			// Unable to patch CSS, might be due to host mismatch.
			// One of the possible reason: viewing the same local page
			// on native browser and in virtual machine.
			var uri = data.uri.replace(/^\w+:\/\/[^\/]+/, location.protocol + '//' + location.host);
			if (uri !== data.uri) {
				patcher.patch(uri, data.patches);
			}
		}
	})
	.connect(config);
}


// find script tag that embedded client
var scripts = document.getElementsByTagName('script');
var inited = false;
for (var i = 0, il = scripts.length; i < il; i++) {
	if (~scripts[i].src.indexOf('livestyle-client.js')) {
		inited = true;
		initFromScript(scripts[i]);
		break;
	}
}

if (!inited) {
	init();
}

module.exports = {
	disconnect: function() {
		client.disconnect();
	}
};