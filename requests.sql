# Get statistics about meters around Nice region for 2016 year
SELECT ROUND(AVG(value),2) as avg, ROUND(STDDEV(value),2) as stddev, ROUND(MAX(value+0),2) as max, ROUND(MIN(value+0),2) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value
	FROM table1
	WHERE '+inPoints(43.7,7.2, 0.4)+' 
	AND (date >= "2016-01-01") 
	AND (date < "2017-01-01")
	GROUP BY vid
)

;

# Compare meters from electric and gas heated houses around Marseille region for 2016 summer
SELECT type, ROUND(AVG(value),2) as avg, ROUND(STDDEV(value),2) as stddev, ROUND(MAX(value+0),2) as max, ROUND(MIN(value+0),2) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value, FIRST_VALUE(type) as type
	FROM table1
	WHERE '+inPoints(43.3,5.4, 0.2)+' 
	AND (date >= "2016-04-01")
	AND (date < "2016-11-01")
	GROUP BY vid
)
GROUP BY type

;

# Get consumption statistics for not electrical heated houses, for one month, in center district of Toulouse
SELECT ROUND(AVG(value),2) as avg, ROUND(STDDEV(value),2) as stddev, ROUND(MAX(value+0),2) as max, ROUND(MIN(value+0),2) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value
	FROM table1
	WHERE '+inPoints(43.6,1.446, 0.1)+' 
	GROUP BY vid, YEAR(date), DAY(date)
)

;

# Get consumption statistics for gas heated houses, comparing to the temperature, in Paris
SELECT ROUND(AVG(value),2) as avg, ROUND(STDDEV(value),2) as stddev, ROUND(MAX(value+0),2) as max, ROUND(MIN(value+0),2) as min, FIRST_VALUE(temp) as temp, COUNT(1) as nb
FROM ( # Have one point by day by vid, with 'value' is the consumption of the day
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value, AVG(temp) as temp
	FROM table1
	WHERE '+inPoints(48.86, 2.337, 0.6)+' 
	AND (type = "gas")
	GROUP BY vid, YEAR(date), DAYOFYEAR(date)
)
GROUP BY temp
ORDER BY temp

;

# Get statistics about meters in Paris, round zone, for March 2017
# tmp0 get all data in circle's outer square
# tmp1 filters to compute only data in inner circle.
# distance in tmp0 is multiplied by (2⁻¹/2) to get all points in the complete circle's inner square
# OR in tmp0 is distance computation
SELECT ROUND(AVG(value),2) as avg, ROUND(STDDEV(value),2) as stddev, ROUND(MAX(value+0),2) as max, ROUND(MIN(value+0),2) as min, COUNT(1) as nb
FROM (
	SELECT vid, (MAX(index+0)-MIN(index+0)) as value, FIRST_VALUE(lat) as lat, FIRST_VALUE(lng) as lng
	FROM table1
	WHERE (date >= "2016-03-01") 
	AND (date < "2016-04-01")
	AND '+inPoints(48.86, 2.337, 0.4)+'
	GROUP BY vid
)
WHERE '+inPoints(48.86, 2.337, 0.4*math.sqrt(2)/2)+' 
OR (((lat-48.86)*(lat-48.86)+(lng-2.337)*(lng-2.337)) < 0.4)

