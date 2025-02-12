# Battles per day
SELECT battle.battleTime, count(battle.id), battle.result
from battle
where battle.battleTime >= CURDATE() - INTERVAL 7 DAY
group by day(battle.battleTime), battle.result;

# Battles per event
select count(battle.id), event.mode, battle.result
from battle
         inner join event on event.id = battle.eventId
group by event.mode, battle.result;

# Battles per brawler
select count(battle.id), player.brawlerName, battle.result
from battle
         inner join player on player.battleId = battle.id
group by player.brawlerName, battle.result;

# Average trophy change per day
select battle.battleTime, avg(battle.trophyChange), sum(battle.trophyChange)
from battle
group by day(battle.battleTime);

# Average trophy change per day per mode
select avg(battle.trophyChange), sum(battle.trophyChange), event.mode
from battle
inner join event on event.id = battle.eventId
group by event.mode;

# Average trophy change per day per brawler
select avg(battle.trophyChange), sum(battle.trophyChange), player.brawlerName
from battle
         inner join player on player.battleId = battle.id
group by player.brawlerName;

select count(battle.id)
from battle
where battle.starPlayerTag = '#2LVR0LQ9J';
