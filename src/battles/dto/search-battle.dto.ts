export type SearchEventMode =
  | 'all'
  | 'bounty'
  | 'brawlBall'
  | 'duoShowdown'
  | 'gemGrab'
  | 'heist'
  | 'hotZone'
  | 'knockout'
  | 'soloShowdown'
  | 'trioShowdown'
  | 'unknown';
export type SearchEventType = 'teamVsTeam' | 'showdown';
export type SearchMapType = 'community' | 'original' | 'all';
export type SearchResult = 'all' | 'victory' | 'defeat' | 'draw';
export type SearchDateRange = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear';

export class SearchBattleDto {
  page: number;
  pageSize: number;
  date?: string;
  eventType?: SearchEventType;
  eventMode?: SearchEventMode;
  mapType?: SearchMapType;
  result?: SearchResult;
  dateRange?: SearchDateRange;
  eventId?: number;
  playerTag?: string;
  brawlerName?: string;
}