export type SearchBattleType = 'teamVsTeam' | 'showdown';
export type SearchBattleMode = 'all' | 'bounty' | 'brawlBall' | 'duoShowdown' | 'gemGrab' | 'heist' | 'hotZone' | 'knockout' | 'soloShowdown' | 'trioShowdown' | 'unknown';
export type SearchMapType = 'community' | 'original' | 'all';
export type SearchDateRange = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';

export class SearchBattleDto {
  page: number;
  pageSize: number;
  date?: string;
  battleType?: SearchBattleType;
  battleMode?: SearchBattleMode;
  mapType?: SearchMapType;
  dateRange?: SearchDateRange;
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}