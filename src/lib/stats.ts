import type { RunRecord } from '../types';

export interface TodayStats {
  totalCount: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  mapBreakdown: Array<{
    mapName: string;
    count: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
  }>;
}

export function buildTodayStats(runHistory: RunRecord[], todayKey: string): TodayStats {
  const todayRuns = runHistory.filter((run) => run.dayKey === todayKey);
  const totalCount = todayRuns.length;
  const totalDurationSeconds = todayRuns.reduce(
    (sum, run) => sum + run.durationSeconds,
    0
  );
  const averageDurationSeconds = totalCount > 0 ? totalDurationSeconds / totalCount : 0;

  const mapStats = new Map<
    string,
    { count: number; totalDurationSeconds: number }
  >();

  for (const run of todayRuns) {
    const current = mapStats.get(run.mapName) ?? {
      count: 0,
      totalDurationSeconds: 0
    };

    current.count += 1;
    current.totalDurationSeconds += run.durationSeconds;
    mapStats.set(run.mapName, current);
  }

  const mapBreakdown = Array.from(mapStats.entries())
    .map(([mapName, values]) => ({
      mapName,
      count: values.count,
      totalDurationSeconds: values.totalDurationSeconds,
      averageDurationSeconds: values.totalDurationSeconds / values.count
    }))
    .sort((left, right) => right.count - left.count);

  return {
    totalCount,
    totalDurationSeconds,
    averageDurationSeconds,
    mapBreakdown
  };
}
