# Trò chơi Cào 3 lá (Three Card Brag)

Đây là một phiên bản đơn giản của trò chơi Cào 3 lá được viết bằng JavaScript.

## Yêu cầu

- Node.js (phiên bản 12.0.0 trở lên)
- npm (thường được cài đặt cùng với Node.js)

## Cài đặt

1. Clone repository này về máy của bạn:
```git clone https://github.com/thuanpham113/J2YB.git```
1. Di chuyển vào thư mục dự án:
```cd MentorShipProgram\ExamThreeCardPoker```
1. Cài đặt các dependencies:
```npm install```

## Cách chạy chương trình

1. Mở terminal và di chuyển đến thư mục dự án.

2. Chạy file JavaScript bằng lệnh:
```node ThreeCardPoker.js```
3. Chương trình sẽ tự động chạy một ván chơi với 3 người chơi và hiển thị kết quả trong console.

## Cách chạy tests

1. Đảm bảo rằng bạn đã cài đặt Jest (nó đã được bao gồm trong `package.json`).

2. Trong terminal, chạy lệnh:
```npm test```
3. Jest sẽ chạy tất cả các test case và hiển thị kết quả.

## Cấu trúc dự án

- `three_card_brag.js`: File chính chứa code cho trò chơi.
- `three_card_brag.test.js`: File chứa các test case.
- `package.json`: File cấu hình của dự án Node.js.

## Các chức năng chính

- `Card`: Đại diện cho một lá bài.
- `Deck`: Đại diện cho một bộ bài, có thể xáo và chia bài.
- `Player`: Đại diện cho một người chơi, có thể nhận bài và tính điểm.
- `playGame()`: Hàm chính để chạy trò chơi.

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, hãy tạo một pull request hoặc báo cáo các issues trên GitHub.
