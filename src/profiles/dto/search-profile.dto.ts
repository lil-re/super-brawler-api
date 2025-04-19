export class SearchProfileDto {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  orderByValue?: string;
  orderByDirection?: 'ASC' | 'DESC' | null;
}
