export type SearchBattleMode = 'teamVsTeam' | 'showdown';
export type SearchMapType = 'community' | 'original' | 'all';
export type SearchDateRange = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';

export class SearchBattleDto {
  page: number;
  pageSize: number;
  date?: string;
  battleMode?: SearchBattleMode;
  mapType?: SearchMapType;
  dateRange?: SearchDateRange;
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}