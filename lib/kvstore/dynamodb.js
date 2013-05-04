const AWS = require('aws-sdk');
const config = require('../config');
const Hapi = require('hapi');
const kvstore = require('../kvstore');

var client;

function parse(data) {
	var result = {};
	try {
		result.value = JSON.parse(data.Item.kv_value.S);
	}
	catch (e) {}
	result.casid = +(data.Item.kv_casid.N);
	return result;
}

function get(key, cb) {
	client.getItem(
		{
			TableName: 'kvstore',
			Key: {
				kv_key: { S: key }
			}//, ConsistentRead: true (?)
		},
		function (err, data) {
			if (err) { return cb(err); }
			if (!data || !data.Item) { return cb(null, null); }

			var result = parse(data);
			if (!result.value) {
				err = new Error("error parsing value");
			}
			cb(err, result);
		}
	);
}

function set(key, value, cb) {
	cas(key, value, false, cb);
}

function cas(key, value, casid, cb) {
	var query = {
		TableName: 'kvstore',
		Key: {
			kv_key: { S: key }
		},
		AttributeUpdates: {
			kv_value: {
				Value: { S: JSON.stringify(value) },
				Action: 'PUT'
			},
			kv_casid: {
				Value: { N: '1' },
				Action: 'ADD'
			}
		}
	};

	if (casid || casid === 0) {
		query.Expected = {
			kv_casid: {
				Value: { N: casid.toString() }
			}
		};
	}

	client.updateItem(
		query,
		function (err) {
			if (err) {
				if (err.code === 'ConditionalCheckFailedException') {
					return cb(kvstore.ERROR_CAS_MISMATCH);
				} else {
					return cb(err.code);
				}
			}
			cb(err);
		}
	);
}

function del(key, cb) {
	client.deleteItem(
		{
			TableName: 'kvstore',
			Key: {
				kv_key: { S: key }
			}
		},
		function (err) {
			cb(err);
		}
	);
}

module.exports = {
	connect: function (options, callback) {
		var api = {
			get: get,
			set: set,
			cas: cas,
			delete: del
		};
		if (!client) {
			options = Hapi.utils.merge(options, config.get('dynamodb'));
			client = new AWS.DynamoDB(options);
		}
		callback(null, api);
	}
};
