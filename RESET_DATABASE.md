# Hướng dẫn Reset Database

## Cách reset database để chạy lại với dữ liệu mới

### Bước 1: Mở file `App.tsx`

### Bước 2: Thay đổi trong hàm `useEffect`

**Thay dòng:**
```typescript
initDatabase(() => {
  console.log('✅ Database đã được khởi tạo thành công');
});
```

**Bằng:**
```typescript
resetDatabase(() => {
  console.log('✅ Database đã được reset và khởi tạo lại thành công');
});
```

### Bước 3: Chạy lại ứng dụng

Sau khi chạy ứng dụng một lần với `resetDatabase`, database sẽ được xóa và tạo lại với:
- ✅ Dữ liệu categories mới từ `initialCategories`
- ✅ Dữ liệu products mới từ `initialProducts` (bao gồm các thay đổi bạn đã chỉnh sửa)
- ✅ Giữ lại bảng users (không mất tài khoản admin)
- ✅ Xóa tất cả dữ liệu cũ: cart, orders, order_items

### Bước 4: Sau khi reset xong, đổi lại về `initDatabase`

Sau khi đã reset database, nhớ đổi lại về `initDatabase` để tránh mất dữ liệu mỗi lần khởi động app.

**Lưu ý:**
- `resetDatabase` sẽ xóa TẤT CẢ dữ liệu cũ (giỏ hàng, đơn hàng, sản phẩm, danh mục)
- Chỉ giữ lại bảng users (tài khoản admin)
- Chỉ nên dùng khi cần cập nhật dữ liệu ban đầu (categories, products)

### Cách chỉnh sửa dữ liệu mới

Để chỉnh sửa dữ liệu sản phẩm/danh mục, mở file `src/database.ts` và chỉnh sửa:
- `initialCategories` (dòng ~55-58)
- `initialProducts` (dòng ~59-99)

Sau đó reset database theo hướng dẫn trên.

