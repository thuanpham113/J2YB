LINQ cung cấp nhiều phương thức (functions) mạnh mẽ để thao tác và truy vấn dữ liệu. Dưới đây là các phương thức chính thường được sử dụng trong LINQ:

### 1. **Where**
Dùng để lọc các phần tử dựa trên điều kiện.
```csharp
var result = collection.Where(item => item.Age > 18);
```

### 2. **Select**
Dùng để chọn và chiếu dữ liệu thành dạng khác.
```csharp
var result = collection.Select(item => item.Name);
```

### 3. **OrderBy / OrderByDescending**
Sắp xếp các phần tử theo thứ tự tăng dần hoặc giảm dần.
```csharp
var result = collection.OrderBy(item => item.Name); // Tăng dần
var resultDesc = collection.OrderByDescending(item => item.Age); // Giảm dần
```

### 4. **GroupBy**
Nhóm các phần tử theo một tiêu chí nào đó.
```csharp
var result = collection.GroupBy(item => item.Department);
```

### 5. **Join**
Kết nối hai tập hợp dựa trên một điều kiện.
```csharp
var result = customers.Join(orders,
                customer => customer.Id,
                order => order.CustomerId,
                (customer, order) => new { customer.Name, order.OrderDate });
```

### 6. **Take / TakeWhile**
Lấy một số phần tử đầu tiên hoặc cho đến khi điều kiện không còn đúng.
```csharp
var result = collection.Take(5); // Lấy 5 phần tử đầu
var resultWhile = collection.TakeWhile(item => item.Age < 30); // Lấy phần tử đến khi gặp tuổi >= 30
```

### 7. **Skip / SkipWhile**
Bỏ qua một số phần tử đầu tiên hoặc cho đến khi điều kiện không còn đúng.
```csharp
var result = collection.Skip(5); // Bỏ qua 5 phần tử đầu
var resultWhile = collection.SkipWhile(item => item.Age < 30); // Bỏ qua phần tử đến khi gặp tuổi >= 30
```

### 8. **First / FirstOrDefault**
Trả về phần tử đầu tiên thỏa mãn điều kiện, hoặc giá trị mặc định nếu không tìm thấy.
```csharp
var result = collection.First(item => item.Age > 18);
var resultOrDefault = collection.FirstOrDefault(item => item.Age > 100); // Sẽ trả về null nếu không có phần tử thỏa mãn
```

### 9. **Single / SingleOrDefault**
Trả về phần tử duy nhất thỏa mãn điều kiện, ném lỗi nếu có nhiều hơn một phần tử thỏa mãn.
```csharp
var result = collection.Single(item => item.Id == 5);
```

### 10. **Any**
Kiểm tra nếu có bất kỳ phần tử nào thỏa mãn điều kiện.
```csharp
bool exists = collection.Any(item => item.Age > 18);
```

### 11. **All**
Kiểm tra nếu tất cả các phần tử đều thỏa mãn điều kiện.
```csharp
bool allAdults = collection.All(item => item.Age > 18);
```

### 12. **Count**
Đếm số phần tử thỏa mãn điều kiện.
```csharp
int count = collection.Count(item => item.Age > 18);
```

### 13. **Sum / Min / Max / Average**
Tính toán tổng, giá trị nhỏ nhất, lớn nhất, và giá trị trung bình.
```csharp
var totalAge = collection.Sum(item => item.Age);
var minAge = collection.Min(item => item.Age);
var maxAge = collection.Max(item => item.Age);
var averageAge = collection.Average(item => item.Age);
```

### 14. **Distinct**
Loại bỏ các phần tử trùng lặp.
```csharp
var distinctItems = collection.Distinct();
```

### 15. **Union / Intersect / Except**
- **Union**: Hợp hai tập hợp (loại bỏ phần tử trùng).
- **Intersect**: Tìm phần tử chung giữa hai tập hợp.
- **Except**: Lấy các phần tử thuộc tập hợp A nhưng không thuộc B.
```csharp
var unionResult = collectionA.Union(collectionB);
var intersectResult = collectionA.Intersect(collectionB);
var exceptResult = collectionA.Except(collectionB);
```

	LINQ cung cấp khả năng mạnh mẽ để thao tác dữ liệu dễ dàng và linh hoạt. Bạn có thể kết hợp nhiều phương thức để tạo ra các truy vấn phức tạp.