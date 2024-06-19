1. What is the total amount each customer spent at the restaurant?

```
select s.customer_id ,sum(me.price) as total_amount
from sales s
join menu me on s.product_id = me.product_id
group by s.customer_id
order by s.customer_id asc;
```

2. How many days has each customer visited the restaurant?

```
select s.customer_id,count(distinct s.order_date) as days_visited
from sales s
group by s.customer_id;
```

3. What was the first item from the menu purchased by each customer?

```
with order_sale as (
select
    s.customer_id,
    s.order_date,
    m.product_name,
    dense_rank() over(partition by s.customer_id order by s.order_date) as rank
from sales s
inner join menu m on s.product_id = m.product_id
)
select customer_id, product_name
from order_sale
where rank = 1
group by customer_id, product_name;
```

4. What is the most purchased item on the menu and how many times was it purchased by all customers?

```
select m.product_name, count(s.product_id) as total_purchased
from sales s
join menu m on s.product_id = m.product_id
group by m.product_name
order by total_purchased desc
limit 1;
```

5. Which item was the most popular for each customer?

```
with popular_item as (
select
    s.customer_id,
    m.product_name,
    count(s.product_id) as total_purchased,
    rank() over(partition by s.customer_id order by count(s.product_id) desc) as rank
from sales s
inner join menu m on s.product_id = m.product_id
group by s.customer_id, m.product_name
)
select customer_id, product_name, total_purchased
from popular_item
where rank = 1;
```

6. Which item was purchased first by the customer after they became a member?

```
with member_purchase as (
select
    s.customer_id,
    s.order_date,
    m.product_name,
    dense_rank() over(partition by s.customer_id order by s.order_date) as rank
from sales s
inner join menu m on s.product_id = m.product_id
inner join members me on s.customer_id = me.customer_id and s.order_date > me.join_date
)
select customer_id, product_name
from member_purchase
where rank = 1
group by customer_id, product_name;
```

7. Which item was purchased just before the customer became a member?

```
with member_purchase as (
select
    s.customer_id,
    s.order_date,
    m.product_name,
    row_number() over(partition by s.customer_id order by s.order_date desc) as rank
from sales s
inner join menu m on s.product_id = m.product_id
inner join members me on s.customer_id = me.customer_id and s.order_date < me.join_date
)
select customer_id, product_name
from member_purchase
where rank = 1
group by customer_id, product_name;
```

8. What is the total items and amount spent for each member before they became a member?

```
with member_purchase as (
select
    s.customer_id,
    count(s.product_id) as total_items,
    sum(m.price) as total_amount
from sales s
inner join menu m on s.product_id = m.product_id
inner join members me on s.customer_id = me.customer_id and s.order_date < me.join_date
group by s.customer_id
)
select customer_id, total_items, total_amount
from member_purchase
order by customer_id asc;
```

9. If each $1 spent equates to 10 points and sushi has a 2x points multiplier - how many points would each customer have?

```
select s.customer_id, sum(m.price * 10 * case when m.product_name = 'sushi' then 2 else 1 end) as points
from sales s
join menu m on s.product_id = m.product_id
group by s.customer_id
order by s.customer_id asc;
```

10. In the first week after a customer joins the program (including their join date) they earn 2x points on all items, not just sushi - how many points do customer A and B have at the end of January?

```
with points as (
select
    s.customer_id,
    sum (m.price * 10 * case when (date_trunc('day',s.order_date) >= me.join_date and date_trunc('day',s.order_date) < (me.join_date + 7)) then 2 else 1 end) as point
from sales s
join menu m on s.product_id = m.product_id
join members me on s.customer_id = me.customer_id
where date_trunc('day',s.order_date) <= '2021-01-31' and date_trunc('day',me.join_date) <= s.order_date
group by s.customer_id
)
select customer_id, point
from points
order by customer_id asc;
```
