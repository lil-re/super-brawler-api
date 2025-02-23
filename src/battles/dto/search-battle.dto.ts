export type SearchBattleType = 'teamVsTeam' | 'showdown'
export type SearchDateRange = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear'

export class SearchBattleDto {
  page: number;
  pageSize: number;
  date?: string;
  battleType?: SearchBattleType;
  dateRange?: SearchDateRange;
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}