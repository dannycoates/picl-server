#!/bin/sh

sudo service memcached stop

sudo cp ./conf/couchbase.conf /etc/security/limits.d/
sudo chmod 644 /etc/security/limits.d/couchbase.conf
sudo wget -O/etc/apt/sources.list.d/couchbase.list http://packages.couchbase.com/ubuntu/couchbase-ubuntu1110.list
wget -O- http://packages.couchbase.com/ubuntu/couchbase.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install libcouchbase2 libcouchbase-dev
wget -q $CB_URL
sudo dpkg -i $CB_DEB
sudo chmod a+x ./scripts/cluster_connect
./scripts/cluster_connect -n 1
$CB_CONFIG_CMD
