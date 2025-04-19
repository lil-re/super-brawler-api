export class SearchUserDto {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  orderByValue?: string;
  orderByDirection?: 'ASC' | 'DESC' | null;
}
