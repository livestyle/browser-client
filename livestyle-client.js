import client from 'livestyle-client';
import patcher from 'livestyle-cssom-patcher';

export function enabled() {
	var elem = document && document.documentElement;
	return !elem || elem.getAttribute('data-livestyle-extension') !== 'available';
}

export function disconnect() {
	client.disconnect();
}

function extractHost(url) {
	if (url) {
		var m = url.match(/^(\w+)(:\/\/.+?)(\/|$)/);
		return m && (/^wss?$/.test(m[1]) ? m[1] : 'ws') + m[2];
	}
}

function initFromScript(script) {
	var hosts = [
		client.config().host,
		extractHost(script.src),
		extractHost(script.getAttribute('data-livestyle-host'))
	];
	init({
		rewriteHost: true,
		host: hosts.filter(function(host) {
			return !!host;
		})
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
	.on('incoming-updates', function(data) {
		// console.log('incoming patch', data.uri, data.patches);
		if (!enabled()) {
			return;
		}
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