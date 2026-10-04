const fs = require('fs');

// October 2026 Week-by-Week CSV Data
const octWeeklyCSV = `\uFEFF"Tuan_Trong_Thang","Ngay_Thang","Thu_Trong_Tuan","Ca_Lam","Khung_Gio","Danh_Sach_NV_Phan_Ca","So_NV","Trang_Thai_Ca","Ghi_Chu"
"Tuần 1 (28/09 - 04/10)","28/09/2026","Thứ 2","Ca Sáng (07:00 - 12:30)","Ly, Hiền Lương","2 người","⚠️ Thiếu 1 NV","Hiền Lương rảnh cả ngày T2"
"Tuần 1 (28/09 - 04/10)","28/09/2026","Thứ 2","Ca Chiều (12:00 - 18:30)","T.Dương, Phan Châu, Hiền Lương, Minh Châu","4 người","🔍 Chọn 3 NV","Có 4 người rảnh"
"Tuần 1 (28/09 - 04/10)","29/09/2026","Thứ 3","Ca Sáng (07:00 - 12:30)","Ly, Hiền Lương, Nhàn","3 người","✅ Đủ 3 NV","Nhàn rảnh cả ngày T3"
"Tuần 1 (28/09 - 04/10)","29/09/2026","Thứ 3","Ca Chiều (12:00 - 18:30)","Hương, T.Dương, Minh Châu, Nhàn","4 người","🔍 Chọn 3 NV","Có 4 người rảnh"
"Tuần 1 (28/09 - 04/10)","30/09/2026","Thứ 4","Ca Sáng (07:00 - 12:30)","Hương, Phan Châu, Nhàn, T.Dương (từ 9h)","4 người","🔍 Chọn 3 NV","T.Dương rảnh từ 9h00 (làm 3.5h)"
"Tuần 1 (28/09 - 04/10)","30/09/2026","Thứ 4","Ca Chiều (12:00 - 18:30)","Hương, T.Dương, Minh Châu","3 người","✅ Đủ 3 NV","Hương rảnh cả ngày T4"
"Tuần 1 (28/09 - 04/10)","01/10/2026","Thứ 5","Ca Sáng (07:00 - 12:30)","T.Dương, Ly, Nhàn","3 người","✅ Đủ 3 NV","Ly rảnh sáng T5"
"Tuần 1 (28/09 - 04/10)","01/10/2026","Thứ 5","Ca Chiều (12:00 - 18:30)","T.Dương, Phan Châu, Nhàn (đến 16h)","3 người","⚠️ Có NV về sớm","Nhàn chỉ rảnh đến 16h00 (về sớm 2.5h)"
"Tuần 1 (28/09 - 04/10)","02/10/2026","Thứ 6","Ca Sáng (07:00 - 12:30)","Hiền Lương","1 người","🚨 Thiếu 2 NV","Hiền Lương rảnh sáng T6"
"Tuần 1 (28/09 - 04/10)","02/10/2026","Thứ 6","Ca Chiều (12:00 - 18:30)","Minh Châu","1 người","🚨 Thiếu 2 NV","Minh Châu rảnh chiều T6"
"Tuần 1 (28/09 - 04/10)","03/10/2026","Thứ 7","Cả ngày","(Trống)","0 người","🚨 Trống ca","Không có ai rảnh"
"Tuần 1 (28/09 - 04/10)","04/10/2026","Chủ Nhật","Cả ngày","(Trống)","0 người","🚨 Trống ca","Không có ai rảnh"
"Tuần 2 (05/10 - 11/10)","Lịch lặp lại","T2 - CN","Tương tự tuần 1","Xem chi tiết bảng tuần 1","3 người/ca","Áp dụng lặp lại theo tuần","Điều chỉnh trên ứng dụng khi cần"
"Tuần 3 (12/10 - 18/10)","Lịch lặp lại","T2 - CN","Tương tự tuần 1","Xem chi tiết bảng tuần 1","3 người/ca","Áp dụng lặp lại theo tuần","Điều chỉnh trên ứng dụng khi cần"
"Tuần 4 (19/10 - 25/10)","Lịch lặp lại","T2 - CN","Tương tự tuần 1","Xem chi tiết bảng tuần 1","3 người/ca","Áp dụng lặp lại theo tuần","Điều chỉnh trên ứng dụng khi cần"
"Tuần 5 (26/10 - 31/10)","Lịch lặp lại","T2 - T7","Tương tự tuần 1","Xem chi tiết bảng tuần 1","3 người/ca","Áp dụng lặp lại theo tuần","Điều chỉnh trên ứng dụng khi cần"
`;

fs.writeFileSync('public/lich_thang_10_theo_tuan.csv', octWeeklyCSV, 'utf8');
console.log('✅ Created public/lich_thang_10_theo_tuan.csv');
