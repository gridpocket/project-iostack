# Get statistics about meters around Nice region for 2016 year
SELECT AVG(value) as avg, STDDEV(value) as stddev, MAX(value+0) as max, MIN(value+0) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value
	FROM table1
	WHERE '+inPoints(43.7,7.2, 0.4)+' 
	AND (date >= "2016-01-01") 
	AND (date < "2017-01-01")
	GROUP BY vid
)

;

# Compare meters from electric and gas heated houses around Marseille region for 2016-2017 winter
SELECT AVG(value) as avg, STDDEV(value) as stddev, MAX(value+0) as max, MIN(value+0) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value, FIRST_VALUE(type) as type
	FROM table1
	WHERE '+inPoints(43.3,5.4, 0.2)+' 
	AND (date > "2016-11-01")
	AND (date < "2017-04-01")
	GROUP BY vid
)
GROUP BY type

;

# Get consumption statistics for electric heated houses, comparing to the temperature
SELECT AVG(index) as avg, STDDEV(index) as stddev, MAX(index+0) as max, MIN(index+0) as min, FIRST_VALUE(temp) as temp, COUNT(1) as nb
FROM table1
WHERE '+inPoints(48.286, 2.337, 0.6)+' 
AND (type = "elec")
GROUP BY temp
ORDER BY temp

;

# Get consumption statistics for not electrical heated houses, for one day
SELECT AVG(value) as avg, STDDEV(value) as stddev, MAX(value+0) as max, MIN(value+0) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value
	FROM table1
	WHERE '+inPoints(43.6,1.446, 0.1)+' 
	GROUP BY vid, YEAR(date), DAYOFYEAR(date)
)