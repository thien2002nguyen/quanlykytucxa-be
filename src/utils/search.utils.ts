interface SearchOptions {
  fields: string[]; // Các trường để tìm kiếm
  searchTerm: string; // Từ khóa tìm kiếm
}

export function buildSearchQuery(options: SearchOptions) {
  const { fields, searchTerm } = options;

  if (!searchTerm) {
    return {}; // Trả về truy vấn rỗng nếu không có từ khóa
  }

  // Tạo mảng các điều kiện tìm kiếm
  const orConditions = fields.map((field) => ({
    [field]: { $regex: searchTerm, $options: 'i' },
  }));

  // Kết hợp các điều kiện với `$or`
  return { $or: orConditions };
}
