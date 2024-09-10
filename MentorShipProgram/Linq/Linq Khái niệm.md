LINQ (Language Integrated Query) là một cú pháp truy vấn mạnh mẽ trong C# cho phép bạn viết các truy vấn cho nhiều nguồn dữ liệu khác nhau như tập hợp, cơ sở dữ liệu, XML và nhiều nguồn khác, trực tiếp trong mã C# của bạn. LINQ giúp đơn giản hóa việc thao tác dữ liệu bằng cách tích hợp khả năng truy vấn vào trong ngôn ngữ, giúp làm việc với các cấu trúc dữ liệu khác nhau dễ dàng hơn và an toàn về kiểu dữ liệu.

Có hai loại cú pháp LINQ chính:

1. **Cú pháp truy vấn**: Trông giống như SQL và là một kiểu khai báo.
   ```csharp
   var result = from item in collection
                where item.Property > 10
                select item;
   ```

2. **Cú pháp phương thức**: Mang tính chức năng hơn và sử dụng các phương thức mở rộng.
   ```csharp
   var result = collection.Where(item => item.Property > 10).Select(item => item);
   ```

LINQ hỗ trợ các thao tác như lọc (`Where`), sắp xếp (`OrderBy`, `OrderByDescending`), nhóm (`GroupBy`), và nối dữ liệu (`Join`), cùng nhiều thao tác khác.

### 1. Định nghĩa

Linq là một query language được dùng để truy vấn dữ liệu từ các nguồn dữ liệu khác nhau (data sources).

![[Pasted image 20240910104524.png]]
### 2. Mệnh đề trong linq
Trong câu query sẽ có 3 mệnh đề (clause) from, where, select tương tự như khi viết query trong database.

- from: nguồn lấy dữ liệu (data source)
- where: điều kiện để lọc dữ liệu. (filter data)
- select: lấy kết quả
![[Pasted image 20240910110426.png]]
###  3. Các cách để viết query linq
- Query Syntax khá giống cách viết câu query trong SQL.
    ![image.png](https://images.viblo.asia/f4ac3a58-3154-4865-b5a6-2df4a5a4c90a.png)
- Method Syntax sử dụng các hàm hỗ trợ linq của c# .net.
    ![image.png](https://images.viblo.asia/43b6b924-67b3-44e3-965e-7bf3472e57ab.png)\
### 4. Lambda Expressions trong LINQ

- lambda expressions được dùng để tạo ra một function ẩn danh (anonymous function).
- productId => productId % 2 == 0 là một biểu thức lambda (Lambda expression) với productId là tham số đầu vào (input parameter) của function ẩn danh.
![image.png](https://images.viblo.asia/81a66998-ad8e-48a2-996d-14ae17620577.png)

Ví dụ lấy ra productName từ product id:
![image.png](https://images.viblo.asia/2d39cbe6-196f-4744-bd7e-cd24d79d1ac0.png)
### 5. Sorting: OrderBy, OrderByDecending
![image.png](https://images.viblo.asia/68f0ade5-bb45-4365-8795-a08f0891a637.png)

### 6. Tạo ra 1 object mới trong Select
![image.png](https://images.viblo.asia/49db339d-118f-469b-b4ed-c1fc8ccee58a.png)
### 7. Grouping: GroupBy
![image.png](https://images.viblo.asia/9d14ad49-5245-4b02-98db-a7002a242f42.png)

### 8. All, Any
- All xác định tất cả phần tử thỏa một điều kiện hay không
- Any xác định tồn tại bất kỳ phần tử thỏa một điều kiện cụ thể hay không.

![image.png](https://images.viblo.asia/844847b4-adf3-4640-b8ec-3cb82cc44da7.png)

### 9. Element: First, FirstOrDefault, Single, SingleOrDefault
- First() Lấy ra phần tử đầu tiên thỏa 1 điều kiện. Nếu không tìm thấy sẽ throw exception
- FirstOrDefault() tương tự như First() trong trường hợp không có phần tử thỏa điều kiện sẽ trả về null cho kiểu tham chiếu và giá trị default cho kiểu tham trị.
- Single() trả về một phần tử trong danh sách thỏa điều kiện. Nếu không có phần tử nào hoặc tìm thấy hơn 1 phần tử sẽ throw exception
- SingleOrDefault() tương tự như Single() nhưng nếu không có phần tử nào sẽ trả về null cho kiểu tham chiếu và giá trị default cho kiểu tham trị. Throw exception nếu kết quả nhiều hơn 1 phần tử.![image.png](https://images.viblo.asia/14b85e90-735e-4bb9-b37a-1ff018e9db23.png)

### 10. Partitioning: Skip, Take
- Skip(number) bỏ qua số lượng phần tử trong danh sách và trả về các phần tử còn lại.
- Take(number) trả về danh sách phần tử theo số lượng tham số number truyền vào tính từ phần tử đầu tiên.
    ![image.png](https://images.viblo.asia/5af099a7-4da6-48d2-a547-f76986cff26d.png)

### 11. Một số hàm phổ biến trong Linq
- Count(): đếm số phần tử của danh sách
- Average(): tính trung bình
- Max(): lấy ra giá trị lớn nhất
- Min(): lấy ra giá trị nhỏ nhất
- Sum(): tính tổng các phần tử
- First(): lấy ra phần tử đầu tiên
- Last(): lấy ra phần tử cuối cùng ….
- ToArray(): chuyển danh sách thành array. (ví dụ từ kiểu List sang Array)
- ToList(): chuyển danh sách thành List. (ví dụ từ kiểu Array sang List)
