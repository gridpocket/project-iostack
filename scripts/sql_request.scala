val sqlContext = new org.apache.spark.sql.SQLContext(sc)

import sqlContext.implicits._

//2010-01-01T00:00:00+01:00,220,METER000001,17.09,New York,40.717040,-73.98700
case class Meter(isodate: String, index: Int, vid: String, temp: String, city: String, lat: String, long: String)

val meter = sc.textFile("../meter_gen-20160122174526.csv").map(_.split(",")).map(m => Meter(m(0), m(1).trim.toInt, m(2), m(3), m(4), m(5), m(6))).toDF()

meter.registerTempTable("meter")

val meter_filter = sqlContext.sql("SELECT * FROM meter where index <= 1000")

meter_filter.map(t => "vid: " + t(2)).collect().foreach(println)