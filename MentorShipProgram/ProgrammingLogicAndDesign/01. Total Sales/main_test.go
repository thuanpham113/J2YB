package main

import (
	"testing"
)

// TestSum is a test function for sum
func TestSum(t *testing.T) {
	t.Run("Test case 1", func(t *testing.T) {
		sales := []int{1, 2, 3, 4, 5}
		total := sum(sales)
		if total != 15 {
			t.Errorf("Expected 15, but got %d", total)
		}
	})

	t.Run("Test case 2", func(t *testing.T) {
		sales := []int{1, 2, 3, 4, 5, 6}
		total := sum(sales)
		if total != 21 {
			t.Errorf("Expected 21, but got %d", total)
		}
	})
}

// TestInputSales is a test function for inputSales
func TestInputSales(t *testing.T) {
	t.Run("Test case 1", func(t *testing.T) {
		length := 5
		sales := inputSales(length)
		if len(sales) != 5 {
			t.Errorf("Expected 5, but got %d", len(sales))
		}
	})

	t.Run("Test case 2", func(t *testing.T) {
		length := 6
		sales := inputSales(length)
		if len(sales) != 6 {
			t.Errorf("Expected 6, but got %d", len(sales))
		}
	})
}
