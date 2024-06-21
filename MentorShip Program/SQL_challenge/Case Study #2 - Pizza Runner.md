# A. Pizza Metrics

1. How many pizzas were ordered?

```
SELECT COUNT(*) FROM customer_orders;
```

2. How many unique customer orders were made?

```
SELECT COUNT(DISTINCT order_id) FROM customer_orders;
```

3. How many successful orders were delivered by each runner?

```
SELECT runner_id, count(order_id) as successful_orders
FROM runner_orders
WHERE distance != 'null' OR distance != NULL
GROUP BY runner_id
ORDER BY runner_id;
```

4. How many of each type of pizza was delivered?

```
SELECT pn.pizza_name, count(pn.pizza_id) as total_pizzas
FROM customer_orders co
JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE ro.distance != 'null' OR ro.distance != NULL
GROUP BY pn.pizza_name
ORDER BY pn.pizza_name;
```

5. How many Vegetarian and Meatlovers were ordered by each customer?

```
SELECT co.customer_id, pn.pizza_name, count(pn.pizza_name) as total_pizzas
FROM customer_orders co
JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
GROUP BY co.customer_id, pn.pizza_name
ORDER BY co.customer_id;
```

6. What was the maximum number of pizzas delivered in a single order?

```
SELECT order_id, count(pizza_id) as total_pizzas
FROM customer_orders
GROUP BY order_id
ORDER BY order_id;
```

7. For each customer, how many delivered pizzas had at least 1 change and how many had no changes?

```
SELECT co.customer_id,
SUM( CASE
    WHEN (co.exclusions = ' ' AND co.extras = ' ') THEN 1
    ELSE 0
END ) as no_changes,
SUM( CASE
    WHEN (co.exclusions != ' ' OR co.extras != ' ') THEN 1
    ELSE 0
END ) as at_least_1_change
FROM customer_orders co
JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE ro.distance != 'null' OR ro.distance != NULL
GROUP BY co.customer_id
ORDER BY co.customer_id;
```

8. How many pizzas were delivered that had both exclusions and extras?

```
SELECT count(co.order_id) as total_pizzas
FROM customer_orders co
JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE (ro.distance != 'null' OR ro.distance != NULL) AND (co.exclusions != ' ' AND co.extras != ' ');
```

9. What was the total volume of pizzas ordered for each hour of the day?

```
SELECT date_part('hour', order_time), count(pizza_id) as total_pizzas
FROM customer_orders
GROUP BY date_part('hour', order_time)
ORDER BY date_part('hour', order_time);
```

10. What was the volume of orders for each day of the week?

```
SELECT TO_CHAR(order_time, 'Day')  ,
count(order_id) as total_orders
FROM customer_orders
GROUP BY TO_CHAR(order_time, 'Day')
```

# B. Runner and Customer Experience

1. How many runners signed up for each 1 week period? (i.e. week starts 2021-01-01)

```
SELECT to_char(registration_date, 'ww') as week_start, count(runner_id) as total_runners
FROM runners
GROUP BY to_char(registration_date, 'ww')
ORDER BY week_start;
```

2. What was the average time in minutes it took for each runner to arrive at the Pizza Runner HQ to pickup the order?

```
WITH runner_pickup_time AS (
    SELECT ro.runner_id,
    date_part('minute', to_timestamp(ro.pickup_time, 'YYYY-MM-DD HH24:MI:SS') - co.order_time) as time_to_pickup
    FROM runner_orders ro
    JOIN customer_orders co ON ro.order_id = co.order_id
    WHERE ro.distance != 'null' OR ro.distance != NULL
    GROUP BY ro.runner_id, co.order_time, ro.pickup_time
)
SELECT AVG(time_to_pickup) as avg_time_to_pickup
FROM runner_pickup_time
WHERE time_to_pickup > 0;
```

3. Is there any relationship between the number of pizzas and how long the order takes to prepare?

```
WITH order_duration AS (
    SELECT co.order_id,
    count(co.pizza_id) as total_pizzas,
    date_part('minute', to_timestamp(ro.pickup_time, 'YYYY-MM-DD HH24:MI:SS') - co.order_time) as order_duration
    FROM customer_orders co
    JOIN runner_orders ro ON co.order_id = ro.order_id
    WHERE ro.distance != 'null' OR ro.distance != NULL
    GROUP BY co.order_id, co.order_time, ro.pickup_time
)
SELECT total_pizzas, AVG(order_duration) as avg_order_duration
FROM order_duration
GROUP BY total_pizzas;
```

4. What was the average distance travelled for each customer?

```
SELECT co.customer_id,
AVG(to_number(REPLACE(ro.distance, 'km', ''), 'S999D99')) distance_travelled
FROM customer_orders co
JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE ro.distance != 'null' OR ro.distance != NULL
GROUP BY co.customer_id;
```

5. What was the difference between the longest and shortest delivery times for all orders?

```
SELECT MAX(to_number(REPLACE(ro.duration,'minutes', ''), 'S9999D99')) - MIN(to_number(REPLACE(ro.duration,'minutes', ''), 'S9999D99')) as difference
FROM runner_orders ro
WHERE ro.distance != 'null' OR ro.distance != NULL;
```

6. What was the average speed for each runner for each delivery and do you notice any trend for these values?

```
SELECT ro.runner_id,
ro.order_id,
count(ro.order_id) as total_orders,
ro.distance,
to_number(REPLACE(ro.duration, 'minutes', ''), 'S9999D99') / 60 as duration_hours,
round(to_number(REPLACE(ro.distance, 'km', ''), 'S999D99') / to_number(REPLACE(ro.duration, 'minutes', ''), 'S9999D99') *60, 2) as avg_speed
FROM runner_orders ro
JOIN customer_orders co ON ro.order_id = co.order_id
WHERE ro.distance != 'null' OR ro.distance != NULL
GROUP BY ro.order_id, ro.runner_id, ro.distance, ro.duration;
```

7. What is the successful delivery percentage for each runner?

```
SELECT
  runner_id,
  ROUND(100 * SUM(
    CASE WHEN distance = 'null' OR distance = NULL THEN 0
    ELSE 1 END) / COUNT(*), 0) AS success_perc
FROM runner_orders
GROUP BY runner_id;
```

# C. Ingredient Optimisation

1. What are the standard ingredients for each pizza?

2. What was the most commonly added extra?
3. What was the most common exclusion?
4. Generate an order item for each record in the customers_orders table in the format of one of the following:
   Meat Lovers
   Meat Lovers - Exclude Beef
   Meat Lovers - Extra Bacon
   Meat Lovers - Exclude Cheese, Bacon - Extra Mushroom, Peppers
5. Generate an alphabetically ordered comma separated ingredient list for each pizza order from the customer_orders table and add a 2x in front of any relevant ingredients
   For example: "Meat Lovers: 2xBacon, Beef, ... , Salami"
6. What is the total quantity of each ingredient used in all delivered pizzas sorted by most frequent first?

# D. Pricing and Ratings

1.  If a Meat Lovers pizza costs $12 and Vegetarian costs $10 and there were no charges for changes - how much money has Pizza Runner made so far if there are no delivery fees?
2. What if there pg_wal_lsn_diff an additional $1 charge for any pizza extras?
    Add cheese is $1 extra
3. The Pizza Runner team now wants to add an additional ratings system that allows customers to rate their runner, how would you design an additional table for this new dataset - generate a schema for this new table and insert your own data for ratings for each successful customer order between 1 to 5.
4. Using your newly generated table - can you join all of the information together to form a table which has the following information for successful deliveries?
   customer_id
   order_id
   runner_id
   rating
   order_time
   pickup_time
   Time between order and pickup
   Delivery duration
   Average speed
   Total number of pizzas
5. If a Meat Lovers pizza was $12 and Vegetarian $10 fixed prices with no cost for extras and each runner is paid $0.30 per kilometre traveled - how much money does Pizza Runner have left over after these deliveries?

# E. Bonus Questions

1. If Danny wants to expand his range of pizzas - how would this impact the existing data design? Write an INSERT statement to demonstrate what would happen if a new Supreme pizza with all the toppings was added to the Pizza Runner menu?

