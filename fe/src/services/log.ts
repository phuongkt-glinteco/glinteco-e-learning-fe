import * as fs from 'fs';
import * as path from 'path';

// Xác định đường dẫn file log (lưu cùng thư mục với file code)
const logFile = path.join(__dirname, 'application.txt');

// Hàm ghi log đồng bộ (Sync)
export default function logToFile(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`; // Thêm \n để xuống dòng

    try {
        // Sử dụng appendFileSync để ghi nối tiếp vào cuối file
        fs.appendFileSync(logFile, logMessage, 'utf8');
        console.log('Đã ghi log:', message);
    } catch (error) {
        console.error('Lỗi khi ghi file log:', error);
    }
}
