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
1. What are the standard ingredients for each pizza ? 
```
WITH
    pizza_toppings_cte AS (
        SELECT pizza_id, to_number(
                REGEXP_SPLIT_TO_TABLE(toppings, '[,\s]+'), 'S9999D99'
            ) AS topping_id
        FROM pizza_recipes
    )
SELECT pn.pizza_name, pt.topping_name
FROM
    pizza_toppings_cte ptc
    JOIN pizza_names pn ON ptc.pizza_id = pn.pizza_id
    JOIN pizza_toppings pt ON ptc.topping_id = pt.topping_id;
```
2. What was the most commonly added extra ?
```
WITH
    toppings_cte AS (
        SELECT pizza_id, to_number(
                REGEXP_SPLIT_TO_TABLE(toppings, '[,\s]+'), 'S9999D99'
            ) AS topping_id
        FROM pizza_recipes
    )
SELECT t.topping_id, pt.topping_name, COUNT(t.topping_id) AS topping_count
FROM
    toppings_cte t
    INNER JOIN pizza_toppings pt ON t.topping_id = pt.topping_id
GROUP BY
    t.topping_id,
    pt.topping_name
ORDER BY topping_count DESC;
```
3. What was the most common exclusion ?
```
WITH
    customer_orders_cte AS (
        SELECT order_id, to_number(
                REGEXP_SPLIT_TO_TABLE(exclusions, '[,\s]+'), 'S9999D99'
            ) AS exclusion
        FROM customer_orders
        WHERE
            exclusions != ' '
    ),
    pizza_toppings_cte AS (
        SELECT pt.topping_name, count(pt.topping_name) as topping_count, dense_rank() OVER (
                ORDER BY count(pt.topping_name) DESC
            ) as ranking
        FROM
            customer_orders_cte coc
            JOIN pizza_toppings pt ON coc.exclusion = pt.topping_id
        GROUP BY
            pt.topping_name
    )
SELECT topping_name, topping_count
FROM pizza_toppings_cte
WHERE
    ranking = 1;
```
4. Generate an order item for each record in the customers_orders table in the format of one of the following:Meat Lovers Meat Lovers - Exclude Beef Meat Lovers - Extra Bacon Meat Lovers - Exclude Cheese,
Bacon - Extra Mushroom,
Peppers
```
WITH
    customer_orders_cte AS (
        SELECT
            order_id,
            customer_id,
            pizza_id,
            CASE
                WHEN exclusions = 'null' THEN NULL
                ELSE (
                    SELECT string_agg(pt.topping_name, ', ')
                    FROM unnest(
                            string_to_array(exclusions, ',')
                        ) num
                        JOIN pizza_toppings pt ON to_number(num, '999D99') = pt.topping_id
                    WHERE
                        pt.topping_id IS NOT NULL
                )
            END AS exclusions_array,
            CASE
                WHEN extras = 'null' THEN NULL
                ELSE (
                    SELECT string_agg(pt.topping_name, ', ')
                    FROM unnest(string_to_array(extras, ',')) num
                        JOIN pizza_toppings pt ON to_number(num, '999D99') = pt.topping_id
                    WHERE
                        pt.topping_id IS NOT NULL
                )
            END AS extras_array,
            order_time
        FROM customer_orders
        GROUP BY
            order_id,
            customer_id,
            pizza_id,
            exclusions,
            extras,
            order_time
    )
SELECT
    coc.order_id,
    coc.customer_id,
    coc.pizza_id,
    CASE
        WHEN pn.pizza_name = 'Meatlovers' THEN 'Meat Lovers'
        ELSE 'Vegetarian'
    END || CASE
        WHEN coc.exclusions_array ISNULL THEN ''
        ELSE (
            ' - Exclude ' || coc.exclusions_array || ' '
        )
    END || CASE
        WHEN coc.exclusions_array ISNULL THEN ''
        ELSE (
            ' - Extra ' || coc.exclusions_array || ' '
        )
    END AS order_item,
    order_time
FROM
    customer_orders_cte coc
    JOIN pizza_names pn ON coc.pizza_id = pn.pizza_id;
```
5. Generate an alphabetically ordered comma separated ingredient list for each pizza order from the customer_orders table and add a 2x in front of any relevant ingredients
For example: "Meat Lovers: 2xBacon, Beef, ... , Salami"
```
SELECT co.order_id, 
CASE 
    WHEN pn.pizza_name = 'Meatlovers' THEN 'Meat Lovers' 
    ELSE 'Vegetarian'
END  || ': ' || (
        SELECT string_agg(ingredient_list, ', ') as ingredient_list
        FROM (
                SELECT
                    CASE
                        WHEN count(pt.topping_name) > 1 THEN '2x ' || pt.topping_name
                        ELSE pt.topping_name
                    END AS ingredient_list,
                    count(pt.topping_name) as topping_count
                FROM (
                        SELECT to_number(num, '999D99') as topping_id
                        FROM unnest(
                                string_to_array(
                                    case
                                        when co.extras ISNULL then ''
                                        else (co.extras || ', ')
                                    end || pr.toppings, ', '
                                )
                            ) num
                        WHERE num NOT IN (
                                SELECT num as topping_id
                                FROM unnest(
                                        string_to_array(
                                            case
                                                when co.exclusions ISNULL then ''
                                                else (co.exclusions || ', ')
                                            end, ', '
                                        )
                                    ) num
                            )
                    ) AS subquery
                    JOIN pizza_toppings pt ON subquery.topping_id = pt.topping_id
                GROUP BY
                    pt.topping_name
                ORDER BY
                    topping_count DESC
            ) AS subquery
    ) as ingredient_list
FROM
    customer_orders co
    LEFT JOIN pizza_recipes pr ON co.pizza_id = pr.pizza_id
    LEFT JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
ORDER BY
    co.order_id;
```
6. What is the total quantity of each ingredient used in all delivered pizzas sorted by most frequent first?
```
SELECT
    pt.topping_name,
    sum(
        CASE
            WHEN (
                SELECT count(pt2.topping_name)
                FROM (
                        SELECT to_number(num, '999D99') as topping_id
                        FROM unnest(
                                string_to_array(
                                    case
                                        when co.extras ISNULL then ''
                                        else (co.extras || ', ')
                                    end || pr.toppings, ', '
                                )
                            ) num
                        WHERE num NOT IN (
                                SELECT num as topping_id
                                FROM unnest(
                                        string_to_array(
                                            case
                                                when co.exclusions ISNULL then ''
                                                else (co.exclusions || ', ')
                                            end, ', '
                                        )
                                    ) num
                            )
                    ) AS subquery
                    JOIN pizza_toppings pt2 ON subquery.topping_id = pt.topping_id
                WHERE
                    pt.topping_name = pt2.topping_name
            ) > 1 THEN 2
            ELSE 1
        END
    ) as total_quantity
FROM customer_orders co
    LEFT JOIN pizza_recipes pr ON co.pizza_id = pr.pizza_id
    LEFT JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
    LEFT JOIN pizza_toppings pt ON pt.topping_id in (
        SELECT to_number(num, '999D99') as topping_id
        FROM unnest(
                string_to_array(
                    case
                        when co.extras ISNULL then ''
                        else (co.extras || ', ')
                    end || pr.toppings, ', '
                )
            ) num
        WHERE num NOT IN (
                SELECT num as topping_id
                FROM unnest(
                        string_to_array(
                            case
                                when co.exclusions ISNULL then ''
                                else (co.exclusions || ', ')
                            end, ', '
                        )
                    ) num
            )
    )
GROUP BY
    pt.topping_name
;
```
```
WITH pizza_toppings_cte AS (
SELECT co.order_id, 
string_to_table((
        SELECT string_agg(ingredient_list, ', ') as ingredient_list
        FROM (
                SELECT pt.topping_name as ingredient_list
                FROM (
                        SELECT to_number(num, '999D99') as topping_id
                        FROM unnest(
                                string_to_array(
                                    case
                                        when co.extras ISNULL then ''
                                        else (co.extras || ', ')
                                    end || pr.toppings, ', '
                                )
                            ) num
                        WHERE num NOT IN (
                                SELECT num as topping_id
                                FROM unnest(
                                        string_to_array(
                                            case
                                                when co.exclusions ISNULL then ''
                                                else (co.exclusions || ', ')
                                            end, ', '
                                        )
                                    ) num
                            )
                    ) AS subquery
                    JOIN pizza_toppings pt ON subquery.topping_id = pt.topping_id
            ) AS subquery
    ), ', ') as ingredient_list
FROM
    customer_orders co
    LEFT JOIN pizza_recipes pr ON co.pizza_id = pr.pizza_id
    LEFT JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
ORDER BY
    co.order_id
)
SELECT
    ingredient_list,
    count(ingredient_list) as total_quantity
FROM pizza_toppings_cte
GROUP BY ingredient_list
ORDER BY total_quantity DESC;
```
# D. Pricing and Ratings
1. If a Meat Lovers pizza costs $12 and Vegetarian costs $10 and there were no charges for changes - how much money has Pizza Runner made so far if there are no delivery fees?
```
SELECT SUM(
        CASE
            WHEN pn.pizza_name = 'Meatlovers' THEN 12
            ELSE 10
        END
    ) as total_revenue
FROM
    customer_orders co
    JOIN pizza_names pn ON co.pizza_id = pn.pizza_id;
```
2. What if there was an additional $1 charge for any pizza extras?
Add cheese is $1 extra
```
SELECT sum(
        CASE
            WHEN pn.pizza_name = 'Meatlovers' THEN 12
            ELSE 10
        END + (
            SELECT count(num) as extra_count
            FROM unnest(
                    string_to_array(
                        case
                            when co.extras ISNULL then ''
                            else (co.extras)
                        end, ', '
                    )
                ) num
        )
    ) as total_revenue
FROM
    customer_orders co
    JOIN pizza_recipes pr ON co.pizza_id = pr.pizza_id
    JOIN pizza_names pn ON co.pizza_id = pn.pizza_id;
```
3. The Pizza Runner team now wants to add an additional ratings system that allows customers to rate their runner, how would you design an additional table for this new dataset - generate a schema for this new table and insert your own data for ratings for each successful customer order between 1 to 5.
```
CREATE TABLE IF NOT EXISTS customer_ratings (
    "customer_id" INTEGER,
    "order_id" INTEGER,
    "runner_id" INTEGER,
    "rating" INTEGER
);

INSERT INTO
    customer_ratings (
        "customer_id",
        "order_id",
        "runner_id",
        "rating"
    )
VALUES (101, 1, 1, 5),
    (101, 2, 1, 4),
    (102, 3, 1, 3),
    (103, 4, 2, 5),
    (104, 5, 3, 4),
    (105, 7, 2, 3),
    (102, 8, 2, 2),
    (103, 9, 2, 1),
    (104, 10, 1, 5);
```
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
```
SELECT
    cr.customer_id,
    cr.order_id,
    cr.runner_id,
    cr.rating,
    co.order_time,
    ro.pickup_time,
    date_part(
        'minute',
        to_timestamp(
            ro.pickup_time,
            'YYYY-MM-DD HH24:MI:SS'
        ) - co.order_time
    ) as time_to_pickup,
    to_number(
        REPLACE(ro.duration, 'minutes', ''),
        'S9999D99'
    ) as delivery_duration,
    round(
        to_number(
            REPLACE(ro.distance, 'km', ''),
            'S999D99'
        ) / to_number(
            REPLACE(ro.duration, 'minutes', ''),
            'S9999D99'
        ) * 60,
        2
    ) as avg_speed,
    count(co.pizza_id) as total_pizzas
FROM
    customer_ratings cr
    JOIN customer_orders co ON cr.order_id = co.order_id
    JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE
    ro.distance != 'null'
    OR ro.distance != NULL
GROUP BY
    cr.customer_id,
    cr.order_id,
    cr.runner_id,
    cr.rating,
    co.order_time,
    ro.pickup_time,
    ro.duration,
    ro.distance
ORDER BY cr.customer_id;
```
5. If a Meat Lovers pizza was $12 and Vegetarian $10 fixed prices with no cost for extras and each runner is paid $0.30 per kilometre traveled - how much money does Pizza Runner have left over after these deliveries?
```
SELECT SUM(
        CASE
            WHEN pn.pizza_name = 'Meatlovers' THEN 12
            ELSE 10
        END
    ) - SUM(
        to_number(
            REPLACE(ro.distance, 'km', ''),
            'S999D99'
        ) * 0.30    
    ) as total_revenue
FROM
    customer_orders co
    JOIN pizza_names pn ON co.pizza_id = pn.pizza_id
    JOIN runner_orders ro ON co.order_id = ro.order_id
WHERE
    ro.distance != 'null'
    OR ro.distance != NULL;
```
# E. Bonus Questions
If Danny wants to expand his range of pizzas - how would this impact the existing data design? Write an INSERT statement to demonstrate what would happen if a new Supreme pizza with all the toppings was added to the Pizza Runner menu?
```
INSERT INTO pizza_names ("pizza_id", "pizza_name")
VALUES (3, 'Supreme');
```
