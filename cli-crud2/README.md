# crud-csharp — CLI sinh mã Controller C# (CRUD)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`crud-csharp` là công cụ CLI dùng Plop.js để sinh nhanh cấu trúc Controller C# với các thành phần CRUD, DTO, Service và template.

## Tính năng

- Sinh đầy đủ cấu trúc Controller cho từng feature
- Hỗ trợ nhiều vai trò (ví dụ: Admin, User)
- Cấu hình namespace và đường dẫn xuất file
- Sinh DTO, Service và template tự động
- Hỗ trợ sinh hàng loạt từ file JSON cấu hình

## Cài đặt

### Cài đặt toàn cục
```bash
npm install -g crud-csharp
```

### Cài đặt cục bộ (trong dự án)
```bash
npm install crud-csharp
```

## Sử dụng

### Chế độ tương tác (mặc định)
```bash
crud-csharp
```

### Chế độ hàng loạt (dùng file cấu hình)
```bash
crud-csharp --multiple
```

## Cấu hình (controllers-config.json)

Tạo file `controllers-config.json` với cấu trúc ví dụ:

```json
{
  "namespace": "YourApp.API",
  "outputPath": "./Controllers",
  "defaultRoles": ["Admin", "User"],
  "controllers": [
    { "name": "Product", "roles": ["Admin", "User"] },
    { "name": "Category", "roles": ["Admin"] }
  ]
}
```

## Cấu trúc kết quả mẫu

```
Controllers/
├── Products/
│   ├── Admin/
│   │   ├── ProductsController.cs
│   │   ├── ProductsDTO.cs
│   │   ├── ProductsService.cs
│   │   └── ProductsTemplate.cs
│   └── User/
│       └── [các file tương tự]
```

## Lệnh tiện ích trong `package.json` (phát triển)

- `npm run build` — build TypeScript và copy templates
- `npm run dev` — chạy trực tiếp từ `src` (ts-node)
- `npm run batch` — chạy chế độ batch (`--multiple`)

## Mẹo

- Sử dụng file JSON để sinh nhiều controller cùng lúc
- Đặt `namespace` và `outputPath` phù hợp với dự án ASP.NET Core của bạn

---

Nếu bạn muốn mình chỉnh thêm phần nào (dịch kỹ hơn, thêm ví dụ, hoặc cập nhật badges/links), nói mình biết.