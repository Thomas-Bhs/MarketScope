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
  return (
    <VictoryChart
      containerComponent={
        <VictoryVoronoiContainer labels={({ datum }) => `${datum.score} - ${datum.date}`} />
      }
      domain={{ y: [0, 100] }}
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
