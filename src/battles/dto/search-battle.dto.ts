export class SearchBattleDto {
  date?: string;
  dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}