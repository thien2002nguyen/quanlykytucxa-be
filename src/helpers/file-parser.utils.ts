import * as csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { BadRequestException, HttpStatus } from '@nestjs/common';

// Interface cho dữ liệu sinh viên (không bao gồm các thuộc tính của Mongoose)
export interface StudentBase {
  fullName: string;
  studentCode: string;
  nationalIdCard: string;
  dateOfBirth: string;
  gender: string;
  takeClass: string;
  department: string;
  address: string;
  enrollmentYear: string;
}

// Hàm parseCSV để xử lý file CSV
export function parseCSV(buffer: Buffer): Promise<StudentBase[]> {
  return new Promise(async (resolve, reject) => {
    const students: StudentBase[] = [];
    const stream = csvParser({ headers: true });

    stream
      .on('data', async (data) => {
        // Đảm bảo rằng tất cả các trường cần thiết không bị thiếu
        const requiredFields = [
          'Tên sinh viên',
          'Mã sinh viên',
          'Căn cước công dân',
          'Ngày sinh',
          'Giới tính',
          'Lớp',
          'Phòng - Khoa',
          'Địa chỉ',
          'Năm tuyển sinh',
        ];

        for (const field of requiredFields) {
          if (!data[field]) {
            throw new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              error: 'Bad Request',
              message: `Dữ liệu bắt buộc thiếu: ${field} ở dòng: ${JSON.stringify(data)}`,
              messageCode: 'REQUIRED_DATA_MISSING',
            });
          }
        }

        // Thêm sinh viên vào danh sách
        students.push({
          fullName: data['Tên sinh viên'],
          studentCode: data['Mã sinh viên'],
          nationalIdCard: data['Căn cước công dân'],
          dateOfBirth: data['Ngày sinh'],
          gender: data['Giới tính'],
          takeClass: data['Lớp'],
          department: data['Phòng - Khoa'],
          address: data['Địa chỉ'],
          enrollmentYear: data['Năm tuyển sinh'],
        });
      })
      .on('end', () => resolve(students)) // Khi kết thúc, trả về danh sách sinh viên
      .on('error', (error) => reject(error)); // Nếu có lỗi, trả về lỗi

    stream.write(buffer); // Ghi dữ liệu vào stream
    stream.end(); // Kết thúc stream
  });
}

// Hàm parseExcel để xử lý file Excel
export async function parseExcel(buffer: Buffer): Promise<StudentBase[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
  }) as unknown as any[][];

  const [header, ...dataRows] = rows;

  // Kiểm tra tính hợp lệ của dòng tiêu đề trong file Excel
  if (
    !Array.isArray(header) ||
    !header.every((field) => typeof field === 'string')
  ) {
    throw new Error('Dòng tiêu đề không hợp lệ trong file Excel');
  }

  const students: StudentBase[] = [];

  // Duyệt qua từng dòng dữ liệu
  for (const row of dataRows) {
    const studentData: any = {};
    header.forEach((field, index) => {
      studentData[field] = row[index];
    });

    // Đảm bảo rằng tất cả các trường cần thiết không bị thiếu
    const requiredFields = [
      'Tên sinh viên',
      'Mã sinh viên',
      'Căn cước công dân',
      'Ngày sinh',
      'Giới tính',
      'Lớp',
      'Phòng - Khoa',
      'Địa chỉ',
      'Năm tuyển sinh',
    ];

    for (const field of requiredFields) {
      if (!studentData[field]) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `Dữ liệu bắt buộc thiếu: ${field} ở dòng: ${JSON.stringify(studentData)}`,
          messageCode: 'REQUIRED_DATA_MISSING',
        });
      }
    }

    // Thêm sinh viên vào danh sách
    students.push({
      fullName: studentData['Tên sinh viên'],
      studentCode: studentData['Mã sinh viên'],
      nationalIdCard: studentData['Căn cước công dân'],
      dateOfBirth: studentData['Ngày sinh'],
      gender: studentData['Giới tính'],
      takeClass: studentData['Lớp'],
      department: studentData['Phòng - Khoa'],
      address: studentData['Địa chỉ'],
      enrollmentYear: studentData['Năm tuyển sinh'],
    });
  }

  return students; // Trả về danh sách sinh viên
}
