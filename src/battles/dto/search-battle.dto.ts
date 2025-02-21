export class SearchBattleDto {
  page: number;
  pageSize: number;
  date?: string;
  dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}