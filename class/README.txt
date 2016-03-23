class scala to use spark for SQL request.

start spark-shell

use the command ":load <path of class file>"

instantiate class "val <name> = new request"

set the argument for the request with "<name>.setArg("<value>", <token>)", the token are curently:

"select" to set the selected info.

"from" to set the table used in your request.

"where" to set the condition for your request.

"orderby" to set the order of your request.

"groupby" to set the group of your request.

you can load the table from a file with "<name>.setTable(<path>, <table name>)"

you can also load the table from a Json file with "<name>.setJsonTable(<path>, <table name>)"

send the request with "<name>.send()"

to view your result you can use "<name>.printResult()"
