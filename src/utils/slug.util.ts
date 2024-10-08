export function generateSlug(roomName: string, floor: number): string {
  const slug = roomName
    .toLowerCase()
    .normalize('NFD') // Tách dấu khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/\s+/g, '_') // Thay thế khoảng trắng bằng '_'
    .replace(/[^\w\-]+/g, '') // Xóa các ký tự không phải chữ cái
    .replace(/\-\-+/g, '_') // Xóa các dấu '_' dư thừa
    .trim(); // Xóa khoảng trắng thừa

  // Kết hợp roomName đã chuyển đổi và floor
  return `${slug}_tang_${floor}`;
}
