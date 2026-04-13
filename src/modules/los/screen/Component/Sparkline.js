// components/ui/Sparkline.js
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function buildPath(points, width, height) {
  if (!points || points.length === 0) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, points.length - 1);
  return points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export default function Sparkline({ data = [], width = 60, height = 18, stroke = '#2196F3', strokeWidth = 2, fill = 'none' }) {
  const d = buildPath(data, width, height);
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
