# A. Customer Journey
Based off the 8 sample customers provided in the sample from the subscriptions table, write a brief description about each customer’s onboarding journey.

Try to keep it as short as possible - you may also want to run some sort of join to make your explanations a bit easier!

SELECT s.customer_id,
string_agg(p.plan_name, ' -> ') AS plan_names,
string_agg(to_char(s.start_date, 'dd/mm/yyyy'), ' -> ') AS start_dates
FROM subscriptions s
JOIN plans p ON s.plan_id = p.plan_id
GROUP BY s.customer_id
ORDER BY s.customer_id;

# B. Data Analysis Questions
1. How many customers has Foodie-Fi ever had?
```
SELECT COUNT(DISTINCT customer_id) AS customer_count
FROM subscriptions;
```
2. What is the monthly distribution of trial plan start_date values for our dataset - use the start of the month as the group by value
```
SELECT DATE_TRUNC('month', start_date) AS month_start,
COUNT(*) AS trial_start_count
FROM subscriptions
WHERE plan_id = 0
GROUP BY month_start
ORDER BY month_start;
```
3. What plan start_date values occur after the year 2020 for our dataset? Show the breakdown by count of events for each plan_name
```
SELECT p.plan_name,
COUNT(*) AS plan_count
FROM subscriptions s
JOIN plans p ON s.plan_id = p.plan_id
WHERE start_date > '2020-12-31'
GROUP BY p.plan_name;
```
4. What is the customer count and percentage of customers who have churned rounded to 1 decimal place?
```
SELECT COUNT(DISTINCT customer_id) AS churned_customer_count,
ROUND(COUNT(DISTINCT customer_id) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM subscriptions), 1) AS churned_customer_percentage
FROM subscriptions
WHERE plan_id = 4;
```
5. How many customers have churned straight after their initial free trial - what percentage is this rounded to the nearest whole number?
```
WITH churned_customers AS (
SELECT customer_id,
count(*) AS plan_count,
array_agg(plan_id) AS plan_names
FROM subscriptions
GROUP BY customer_id
)
SELECT count(*) AS churned_trial_count,
ROUND(count(*) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM subscriptions), 0) AS churned_trial_percentage
FROM churned_customers
WHERE plan_names[1] = 0 AND plan_names[2] = 4;
```
6. What is the number and percentage of customer plans after their initial free trial?
```
WITH churned_customers AS (
SELECT customer_id,
count(*) AS plan_count,
array_agg(plan_id) AS plan_names
FROM subscriptions
GROUP BY customer_id
)
SELECT count(*) AS converted_customer,
ROUND(count(*) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM subscriptions), 1) AS converted_percentage,
plan_names[2] AS plan_id
FROM churned_customers
GROUP BY plan_names[2]
ORDER BY plan_id;
```
7. What is the customer count and percentage breakdown of all 5 plan_name values at 2020-12-31?
```
WITH sort_sub AS (
SELECT *
FROM subscriptions
WHERE start_date <= '2020-12-31'
ORDER BY start_date DESC
),
plan_count AS (
SELECT array_agg(plan_id) AS plan_names, customer_id
FROM sort_sub
GROUP BY customer_id
),
final_plan_count AS (
SELECT plan_names[1] AS plan_id,
COUNT(*) AS customer_count
FROM plan_count
GROUP BY plan_id
)
SELECT p.plan_name,
COALESCE(f.customer_count, 0) AS customer_count,
ROUND(COALESCE(f.customer_count, 0) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM subscriptions), 1) AS customer_percentage
FROM plans p
LEFT JOIN final_plan_count f ON p.plan_id = f.plan_id
ORDER BY p.plan_id;
```
8. How many customers have upgraded to an annual plan in 2020?
```
SELECT COUNT(DISTINCT customer_id) AS num_of_customers
FROM foodie_fi.subscriptions
WHERE plan_id = 3
AND start_date <= '2020-12-31';
```
9. How many days on average does it take for a customer to an annual plan from the day they join Foodie-Fi?
```
WITH plan_customers AS (
SELECT customer_id,
array_agg(start_date) AS start_dates,
array_agg(plan_id) AS plan_ids
FROM subscriptions
GROUP BY customer_id
),
annual_customers AS (
SELECT customer_id,
array_position(plan_ids, 3) AS annual_index,
start_dates[array_position(plan_ids, 3)] AS annual_date,
start_dates[1] AS first_date
FROM plan_customers
WHERE array_position(plan_ids, 3) IS NOT NULL
)
SELECT ROUND(AVG(annual_date - first_date)) AS average_conversion_days
FROM annual_customers;
```
10. Can you further breakdown this average value into 30 day periods (i.e. 0-30 days, 31-60 days etc)
```
WITH plan_customers AS (
SELECT customer_id,
array_agg(start_date) AS start_dates,
array_agg(plan_id) AS plan_ids
FROM subscriptions
GROUP BY customer_id
),
annual_customers AS (
SELECT customer_id,
array_position(plan_ids, 3) AS annual_index,
start_dates[array_position(plan_ids, 3)] AS annual_date,
start_dates[1] AS first_date
FROM plan_customers
WHERE array_position(plan_ids, 3) IS NOT NULL
),
conversion_days AS (
SELECT ROUND(annual_date - first_date) AS conversion_days
FROM annual_customers
),
conversion_groups AS (
SELECT ceil(conversion_days/30) AS group_weeks,
COUNT(*) AS customer_count
FROM conversion_days
GROUP BY group_weeks
)
SELECT group_weeks * 30 || '-' || (group_weeks + 1) * 30 AS bucket,
customer_count
FROM conversion_groups
ORDER BY group_weeks;
```
11. How many customers downgraded from a pro monthly to a basic monthly plan in 2020?
```
WITH plan_customers AS (
SELECT customer_id,
array_agg(start_date) AS start_dates,
array_agg(plan_id) AS plan_ids
FROM subscriptions
WHERE start_date <= '2020-12-31' AND
start_date >= '2020-01-01'
GROUP BY customer_id
),
downgrade_customers AS (
SELECT customer_id,
array_position(plan_ids, 1) AS basic_index,
array_position(plan_ids, 2) AS pro_index
FROM plan_customers
WHERE array_position(plan_ids, 1) IS NOT NULL
AND array_position(plan_ids, 2) IS NOT NULL
)
SELECT COUNT(DISTINCT customer_id) AS downgrade_count
FROM downgrade_customers
WHERE basic_index < pro_index;
```
# C. Challenge Payment Question
The Foodie-Fi team wants you to create a new payments table for the year 2020 that includes amounts paid by each customer in the subscriptions table with the following requirements:

monthly payments always occur on the same day of month as the original start_date of any monthly paid plan
upgrades from basic to monthly or pro plans are reduced by the current paid amount in that month and start immediately
upgrades from pro monthly to pro annual are paid at the end of the current billing period and also starts at the end of the month period
once a customer churns they will no longer make payments

The schema for the payments table should be as follows:

Column Name	Data Type
date	date
customer_id	integer
amount	float
payment_type	varchar

D. Outside The Box Questions
The following are open ended questions which might be asked during a technical interview for this case study - there are no right or wrong answers, but answers that make sense from both a technical and a business perspective make an amazing impression!

1. How would you calculate the rate of growth for Foodie-Fi?
2. What key metrics would you recommend Foodie-Fi management to track over time to assess performance of their overall business?
3. What are some key customer journeys or experiences that you would analyse further to improve customer retention?
4. If the Foodie-Fi team were to create an exit survey shown to customers who wish to cancel their subscription, what questions would you include in the survey?
5. What business levers could the Foodie-Fi team use to reduce the customer churn rate? How would you validate the effectiveness of your ideas?