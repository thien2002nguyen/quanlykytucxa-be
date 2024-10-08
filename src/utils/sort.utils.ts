import { SortOrder } from 'mongoose';

// Hàm này nhận một đối tượng các trường và hướng sắp xếp
export function getSortOptions(sortDirections: {
  [field: string]: 'asc' | 'desc';
}): { [key: string]: SortOrder } {
  const validDirections: SortOrder[] = ['asc', 'desc'];

  // Chuyển đổi hướng sắp xếp từ chuỗi thành số
  const sortOptions: { [key: string]: SortOrder } = {};

  for (const [field, direction] of Object.entries(sortDirections)) {
    if (validDirections.includes(direction)) {
      sortOptions[field] = direction === 'asc' ? 1 : -1;
    }
  }

  return sortOptions;
}
