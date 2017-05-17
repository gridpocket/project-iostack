# Folder meter_gen
Contains IOStack's project meter_gen

This software has been developed as part of the research projet IOStack and it was co-financed by the European Commission whithin the Horizon 2020 program. 

Please visit the page of <a href="http://www.iostack.eu/">the IOStack project</a> for more details.

# Folder meteo
Contains scripts to convert meteo data into meter_gen configuration file


### Notes on using meter_gen with Apache Spark
Installation of environment
1) Create an ubuntu vagrant VM
2) ssh to the VM
3) Get a prebuilt install 
	http://d3kbcqa49mib13.cloudfront.net/spark-1.6.0-bin-hadoop2.6.tgz

### Notes on Using meter_gen with MongoDB
Installation of MongDB 3.2:

```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

Import meter csv file into meter collection:

```sh
time mongoimport --db simu --collection meter --type csv --file meter_gen-20160122174526.csv --fields date,index,vid,temp,city,lat,lng
```

Run the test:

```sh
mongo simu
db.meter.find({index:{$lt:1000}})
```

### See the Wiki for more information

[Github Wiki](https://github.com/gridpocket/project-iostack/wiki)