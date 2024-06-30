A. Customer Nodes Exploration

1. How many unique nodes are there on the Data Bank system?

SELECT COUNT(DISTINCT node_id) FROM customer_nodes;

2. What is the number of nodes per region?

SELECT r.region_name, COUNT(DISTINCT cn.node_id)
FROM customer_nodes cn
JOIN regions r ON r.region_id = cn.region_id
GROUP BY r.region_name;

3. How many customers are allocated to each region?

SELECT r.region_name, COUNT(DISTINCT cn.customer_id)
FROM customer_nodes cn
JOIN regions r ON r.region_id = cn.region_id
GROUP BY r.region_name;

4. How many days on average are customers reallocated to a different node?

WITH reallocation_days AS (
SELECT customer_id,
node_id,
end_date - start_date AS days
FROM customer_nodes
WHERE end_date != '9999-12-31'
GROUP BY customer_id, node_id, start_date, end_date
),
total_node_days AS (
SELECT customer_id, node_id,SUM(days) AS total_days
FROM reallocation_days
GROUP BY customer_id, node_id
)
SELECT round(AVG(total_days)) AS avg_reallocation_days
FROM total_node_days;

5. What is the median, 80th and 95th percentile for this same reallocation days metric for each region?

WITH reallocation_days AS (
SELECT customer_id,
node_id,
end_date - start_date AS days
FROM customer_nodes
WHERE end_date != '9999-12-31'
GROUP BY customer_id, node_id, start_date, end_date
),
total_node_days AS (
SELECT customer_id, node_id,SUM(days) AS total_days
FROM reallocation_days
GROUP BY customer_id, node_id
),
region_reallocation_days AS (
SELECT r.region_name, total_days
FROM total_node_days tnd
JOIN customer_nodes cn ON cn.node_id = tnd.node_id
JOIN regions r ON r.region_id = cn.region_id
)
SELECT region_name,
PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_days) AS median,
PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY total_days) AS percentile_80,
PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_days) AS percentile_95
FROM region_reallocation_days
GROUP BY region_name;

B. Customer Transactions

1. What is the unique count and total amount for each transaction type?

SELECT txn_type,
COUNT(customer_id) AS unique_count,
SUM(txn_amount) AS total_amount
FROM customer_transactions
GROUP BY txn_type;

2. What is the average total historical deposit counts and amounts for all customers?

WITH historical_deposits AS (
SELECT customer_id,
COUNT(customer_id) AS deposit_count,
AVG(txn_amount) AS total_amount
FROM customer_transactions
WHERE txn_type = 'deposit'
GROUP BY customer_id
)
SELECT ROUND(AVG(deposit_count)) AS avg_deposit_count,
ROUND(AVG(total_amount)) AS avg_total_amount
FROM historical_deposits;

3. For each month - how many Data Bank customers make more than 1 deposit and either 1 purchase or 1 withdrawal in a single month?

WITH monthly_transactions AS (
SELECT customer_id,
DATE_PART('month', txn_date) AS month,
SUM(CASE WHEN txn_type = 'deposit' THEN 0 ELSE 1 END) AS deposit_count,
SUM(CASE WHEN txn_type = 'purchase' THEN 0 ELSE 1 END) AS purchase_count,
SUM(CASE WHEN txn_type = 'withdrawal' THEN 1 ELSE 0 END) AS withdrawal_count
FROM customer_transactions
GROUP BY customer_id, month
)
SELECT month,
COUNT(DISTINCT customer_id) AS customers
FROM monthly_transactions
WHERE deposit_count > 1 AND (purchase_count > 0 OR withdrawal_count > 0)
GROUP BY month
ORDER BY month;

4. What is the closing balance for each customer at the end of the month? Also show the change in balance each month in the same table output.

WITH
monthend_series AS (
SELECT customer_id,
to_date('2022-01-31', 'YYYY-MM-DD') + INTERVAL '1 MONTH' * generate_series(0, cast(date_part('month', txn_date) as int)) AS month_of_end
FROM customer_transactions
GROUP BY customer_id, month_of_end
ORDER BY month_of_end
),
ending_monthly_balances AS (
SELECT customer_id,
DATE_TRUNC('month', txn_date) AS month,
SUM(CASE WHEN txn_type = 'deposit' THEN txn_amount
WHEN txn_type = 'purchase' THEN -txn_amount
WHEN txn_type = 'withdrawal' THEN -txn_amount
ELSE 0 END) AS total_monthly_balance
FROM customer_transactions
GROUP BY customer_id, DATE_TRUNC('month', txn_date)
)
SELECT ms.customer_id,
ms.month_of_end AS ending_month,
COALESCE(emb.total_monthly_balance, 0) AS ending_balance,
SUM (emb.total_monthly_balance) OVER (PARTITION BY ms.customer_id ORDER BY ms.month_of_end ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS ending_balance
FROM monthend_series ms
LEFT JOIN ending_monthly_balances emb ON ms.customer_id = emb.customer_id AND cast(date_part('month',ms.month_of_end) as INT) = cast(date_part('month',emb.month) as int);

5. What is the percentage of customers who increase their closing balance by more than 5%?
   C. Data Allocation Challenge
   To test out a few different hypotheses - the Data Bank team wants to run an experiment where different groups of customers would be allocated data using 3 different options:

Option 1: data is allocated based off the amount of money at the end of the previous month

WITH
ending_monthly_balances AS (
SELECT customer_id,
DATE_TRUNC('month', txn_date) AS month,
SUM(CASE WHEN txn_type = 'deposit' THEN txn_amount
WHEN txn_type = 'purchase' THEN -txn_amount
WHEN txn_type = 'withdrawal' THEN -txn_amount
ELSE 0 END) AS total_monthly_balance,
rank() OVER (PARTITION BY customer_id ORDER BY DATE_TRUNC('month', txn_date)) AS rnk
FROM customer_transactions
GROUP BY customer_id, month
)
SELECT
round(100.0* sum(CASE
WHEN total_monthly_balance > 0 THEN  1
ELSE  0
END) / count(DISTINCT customer_id),2) AS total_monthly_balance,
round(100.0* sum(CASE
WHEN total_monthly_balance < 0 THEN  1
ELSE  0
END) / count(DISTINCT customer_id),2) AS total_monthly_balance_2
FROM ending_monthly_balances
WHERE rnk = 1;

Option 2: data is allocated on the average amount of money kept in the account in the previous 30 days

WITH array_balance AS (
SELECT customer_id,
array_agg(total_monthly_balance) AS balance_array
FROM (
SELECT customer_id,
date_trunc('month', txn_date) AS month,
SUM(CASE WHEN txn_type = 'deposit' THEN txn_amount
WHEN txn_type = 'purchase' THEN -txn_amount
WHEN txn_type = 'withdrawal' THEN -txn_amount
ELSE 0 END) AS total_monthly_balance
FROM customer_transactions
GROUP BY customer_id, month
ORDER BY month
) AS subquery
GROUP BY customer_id
)
SELECT
round(100.0* sum(CASE
WHEN balance_array[1] > 0 and  (100.0 * balance_array[2] / balance_array[1]) > 105  THEN  1
ELSE  0
END) / count(DISTINCT customer_id),2) AS balance_array
FROM array_balance;

Option 3: data is updated real-time
For this multi-part challenge question - you have been requested to generate the following data elements to help the Data Bank team estimate how much data will need to be provisioned for each option:

running customer balance column that includes the impact each transaction
customer balance at the end of each month
minimum, average and maximum values of the running balance for each customer
Using all of the data available - how much data would have been required for each option on a monthly basis?

D. Extra Challenge
Data Bank wants to try another option which is a bit more difficult to implement - they want to calculate data growth using an interest calculation, just like in a traditional savings account you might have with a bank.

If the annual interest rate is set at 6% and the Data Bank team wants to reward its customers by increasing their data allocation based off the interest calculated on a daily basis at the end of each day, how much data would be required for this option on a monthly basis?

Special notes:

Data Bank wants an initial calculation which does not allow for compounding interest, however they may also be interested in a daily compounding interest calculation so you can try to perform this calculation if you have the stamina!
