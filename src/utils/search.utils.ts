interface SearchOptions {
  fields: string[]; // Các trường để tìm kiếm
  searchTerm: string; // Từ khóa tìm kiếm
}

export function buildSearchQuery(options: SearchOptions) {
  const { fields, searchTerm } = options;

  // Tạo điều kiện tìm kiếm cho tất cả các trường
  const searchQuery = fields.reduce((query, field) => {
    return { ...query, [field]: { $regex: searchTerm, $options: 'i' } };
  }, {});

  return searchQuery;
}
