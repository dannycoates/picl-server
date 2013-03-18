#!/bin/sh

sudo service memcached stop

sudo cp ./conf/couchbase.conf /etc/security/limits.d/
sudo chmod 644 /etc/security/limits.d/couchbase.conf
wget -q $CB_URL
sudo dpkg -i $CB_DEB
sudo dpkg -i libvbucket1-1_amd64.deb
sudo dpkg -i libcouchbase1-1_amd64.deb
sudo dpkg -i libcouchbase-dev-1_amd64.deb
sudo dpkg -i libcouchbase1-dbg-1_amd64.deb
sudo chmod a+x ./scripts/cluster_connect
./scripts/cluster_connect -n 1
$CB_CONFIG_CMD
