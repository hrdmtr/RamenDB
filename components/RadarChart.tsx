'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  data: {
    scoreTaste: number;
    scorePortion: number;
    scorePrice: number;
    scoreService: number;
    scoreCleanliness: number;
  };
}

export default function RadarChart({ data }: RadarChartProps) {
  // レーダーチャート用のデータ整形
  const chartData = [
    {
      subject: '味',
      score: data.scoreTaste,
      fullMark: 5,
    },
    {
      subject: '量',
      score: data.scorePortion,
      fullMark: 5,
    },
    {
      subject: '価格',
      score: data.scorePrice,
      fullMark: 5,
    },
    {
      subject: '接客',
      score: data.scoreService,
      fullMark: 5,
    },
    {
      subject: '衛生',
      score: data.scoreCleanliness,
      fullMark: 5,
    },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#374151', fontSize: 14, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Radar
            name="評価"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
