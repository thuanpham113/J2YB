package main

import (
	"fmt"
	"strconv"
)

func sum(sales []int) int {
	total := 0
	for _, sale := range sales {
		total += sale
	}
	return total
}

func inputSales(length int) []int {
	sales := make([]int, length)
	for i := 0; i < length; i++ {
		fmt.Printf("Please enter the sales for day %d:\n", i+1)
		var saleStr string
		fmt.Scanln(&saleStr)
		sale, _ := strconv.Atoi(saleStr)
		sales[i] = sale
	}
	return sales
}

func main() {
	fmt.Println("Please enter the number of days you want to enter sales for:")
	var lengthStr string
	fmt.Scanln(&lengthStr)
	length, _ := strconv.Atoi(lengthStr)
	sales := inputSales(length)
	total := sum(sales)
	fmt.Printf("The total of your sales is: %d\n", total)
}
