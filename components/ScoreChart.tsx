'use client';

import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';

type ScoreData = {
  date: string;
  score: number;
};

type Props = {
  scores: ScoreData[];
};

export function ScoreChart({ scores }: Props) {
  const yDomain: [number, number] = (() => {
    if (!scores || scores.length === 0) return [0, 100];

    const ys = scores.map((s) => s.score).filter((n) => Number.isFinite(n)); //filter out non-finite values
    if (ys.length === 0) return [0, 100];

    let min = Math.min(...ys);
    let max = Math.max(...ys);

    if (min === max) {
      const bump = Math.max(1, Math.abs(min) * 0.05); //if all values are the same, add a small bump to show the line
      min -= bump;
      max += bump;
    }

    const range = max - min;
    const padding = Math.max(1, range * 0.05);

    let lower = min - padding;
    let high = max + padding;

    if (min >= 0 && max <= 100) {
      lower = Math.max(0, lower);
      high = Math.min(100, high);
    }

    return [lower, high];
  })();

  return (
    <VictoryChart
      containerComponent={
        <VictoryVoronoiContainer labels={({ datum }) => `${datum.score} - ${datum.date}`} />
      }
      domain={{ y: yDomain }}
      domainPadding={{ y: 10, x: 15 }} //add padding
    >
      <VictoryAxis
        tickFormat={(t) => String(t).split('-').slice(1).join('/')}
        style={{ tickLabels: { fontSize: 10 } }}
      />
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={scores}
        x='date'
        y='score'
        style={{ data: { stroke: '#4f46e5', strokeWidth: 2 } }}
        labelComponent={<VictoryTooltip style={{ fontSize: 12 }} />}
      />
    </VictoryChart>
  );
}
