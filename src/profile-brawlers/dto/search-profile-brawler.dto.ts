export type OrderBrawlersBy =
  | 'label'
  | 'power'
  | 'rank'
  | 'trophies'
  | 'highestTrophies';

export class SearchProfileBrawlerDto {
  page: number;
  pageSize: number;
  search?: string;
  orderByValue?: OrderBrawlersBy;
  orderByDirection?: 'ASC' | 'DESC' | null;
}
