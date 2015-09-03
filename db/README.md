# Instruction

100M+ records

```

Example in SQL
SELECT tracking_number FROM tracking_table
WHERE (courier="dhl" or courier="usps")
AND (ship_status="intransit" or ship_status="delivered")
AND ship_date>"2015-07-01" and ship_date<="2015-07-30")
AND ship_from="HKG"
AND ship_to="USA" or ship_to="GBR"
ORDER BY ship_date ASC
LIMIT 10

```

# Answer

I will choose MongoDB.



### Query from MongoDB:

```
db.tracking_table.find({courier: {$in:["dhl", "usps"]}, ship_status: { $in: ["intransit", "delivered"] }, ship_date: { $gt: "2015-07-01", $lte: "2015-07-30" }, ship_from: "HKG", ship_to: { $in: ["USA", "GBR"] }  }, {tracking_number:1, courier:1, ship_status:1, ship_date:1, ship_from:1, ship_to:1}).sort({ship_date:1}).limit(10);

```

### Database schema:

```
{
    _id:ObjectId(),
   tracking_number:sv529qveq8vw5,
   courier: "github",
   ship_status: "delivered",
   ship_date: "2015-09-03",
   ship_from: "TPE",
   ship_to: "HKG"
}

```

### Index strategy

Also, I will create index to make sorting quickly. Following is my indexing strategy.
Index improve the performance of query and sort.

```
db.createIndex({courier:1, ship_status:1,ship_date:1, ship_from:1, ship_to:1})
```

### Deploy

I will deploy MongoDB replica cluster by docker.
Also custmize docker image for deploy cluster.

```

~$ git clone https://github.com/Wen777/tutum-docker-mongodb.git

~$ cd tutum-docker-mongodb

~$ docker build -t wen777/mongodb .

~$ docker run -p 27017:27017 -p 28017:28017 -v /db:/data/db -v /mongod_conf:/etc/mongod_conf -e AUTH=no -e KEYFILE=true -e MONGODB_PASS=${PASSWORD} -e MONGODB_REPLICA_SET=rs1 -d wen777/mongodb
```

### Security

Otherwise, I create config file for mongodb. It help primary mongodb to connect secondary mongodb with ssl. (for security)

### Backup

Backup from secondary db by LVM. To backup data automaticaly, I will wrtie shell script and setup crontab.


### Read / Write

Create MongoDB cluster. nodejs app query/read from secondary mongodb and app/worker insert data to primary db.


