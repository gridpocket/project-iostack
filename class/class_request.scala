case class Meter(date: String, index: Int, vid: String, temp: String, city: String, lat: String, long: String)

class request {
	import scala.collection.mutable.MutableList
        val nameTab = MutableList("")  // list table loaded
        val sqlContext = new org.apache.spark.sql.SQLContext(sc)
        import sqlContext.implicits._
	import org.apache.spark.sql._
	// define List Argument request
	val select = MutableList("")
	val from = MutableList("")
	val where = MutableList("")
	val group = MutableList("")
	val order = MutableList("")

	var res:Array[Row] = _

	// function formating request
	def updateRequest( request:String, token:String, list:MutableList[String], instruction:String ) : String = {
	var ret = request
	if (list.isEmpty)
	  return ret
	list.foreach {
	    m =>
	    if (m != "")
		{
	    	if (m != list.head) {
		    ret = ret.concat(token)
		  }
	    	else {
		    ret = ret.concat(instruction)
		    }
		ret = ret.concat(m)
		}
	  }
	return ret
	}

	def clearRequest() : Unit = {
		this.select.clear()
		this.from.clear()
		this.where.clear()
		this.group.clear()
		this.order.clear()
	}

	def setArg(content:String, token:String) : Boolean = token match {
		case "select" => if (!this.select.isEmpty && this.select.head == "") { this.select.update(0, content) }
				 else { this.select.++=(List(content)) };
				return true
		case "from" => 	if (!this.from.isEmpty && this.from.head == "") { this.from.update(0, content) }
                                 else { this.from.++=(List(content)) };
                                return true
		case "where" => if (!this.where.isEmpty && this.where.head == "") { this.where.update(0, content) }
                                 else { this.where.++=(List(content)) };
                                return true
		case "groupby" => if (!this.group.isEmpty && this.group.head == "") { this.group.update(0, content) }
                                 else { this.group.++=(List(content)) };
                                return true
		case "orderby" => if (!this.order.isEmpty && this.order.head == "") { this.order.update(0, content) }
                                 else { this.order.++=(List(content)) };
                                return true
		case _ => return false
	}

	def send() : Boolean = {
			var send = ""
			send = this.updateRequest(send, ", ", this.select, "SELECT ")
			send = this.updateRequest(send, ", ", this.from, " FROM ")
			send = this.updateRequest(send, " AND ", this.where, " WHERE ")
                        send = this.updateRequest(send, ", ", this.group, " GROUP BY ")
                        send = this.updateRequest(send, ", ", this.order, " ORDER BY ")
			try {
			if (send != "") {
	                        val t1:Float = System.nanoTime()
				val df = this.sqlContext.sql(send)
				this.res = df.collect()
	                        val t2:Float = System.nanoTime()
        	                println("Elapsed time: " + ((t2 - t1) / 1000000000.0f) + "s")
			} else {
				return false
			}
			this.clearRequest()
			} catch { // catch exception table not found
			 case d: org.apache.spark.sql.AnalysisException =>
				println (d.getMessage());
			this.clearRequest()
				return false
			}
		return true
		}

	def printResult() : Unit = {
			res.foreach(println)
		}

	def setTable( tabPath:String , name:String ) : Boolean = {
			val conf = sc.hadoopConfiguration
			val fs = org.apache.hadoop.fs.FileSystem.get(conf)
			val exists = fs.exists(new org.apache.hadoop.fs.Path(tabPath))
			if (exists){
				val tab = sc.textFile(tabPath).map(_.split(",")).map(m => Meter(m(0), m(1).trim.toInt, m(2), m(3), m(4), m(5), m(6))).toDF()
				this.nameTab.++=(List(name))
				tab.registerTempTable(name)
			return true
			}
			return false
		}

	def setJsonTable(tabPath:String, name:String ) : Boolean = {
			val conf = sc.hadoopConfiguration
			val fs = org.apache.hadoop.fs.FileSystem.get(conf)
			val exists = fs.exists(new org.apache.hadoop.fs.Path(tabPath))
			if (exists){
				val tab = this.sqlContext.read.json(tabPath)
				this.nameTab.++=(List(name))
      	tab.registerTempTable(name)
				return true
				}
				return false
		}

	def removeTable( tab:String ) : Boolean = {
		this.nameTab.foreach {
			m =>
			if (m == tab) {
				this.sqlContext.dropTempTable(tab)
				return true
			}
		}
		return false
	}
}
