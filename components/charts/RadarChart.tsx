'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  skills: Skill[];
  className?: string;
}

const AXES = ['Frontend', 'Backend', 'DevOps', 'Database', 'Mobile', 'Testing'] as const;

export function RadarChart({ skills, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Compute scores per axis (0-1) based on confidence of top skills in that category
    const scores = AXES.map(axis => {
      const categorySkills = skills.filter(s => s.category === axis);
      if (categorySkills.length === 0) return 0;
      // Average confidence of top 3 skills in category
      const top3 = categorySkills.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
      const avg = top3.reduce((sum, s) => sum + s.confidence, 0) / top3.length;
      return avg;
    });

    const width = 300;
    const height = 300;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);
    const angleSlice = (Math.PI * 2) / AXES.length;

    // Grid circles
    const levels = 4;
    for (let i = 0; i < levels; i++) {
      const levelFactor = radius * ((i + 1) / levels);
      svg.append('circle')
        .attr('r', levelFactor)
        .style('fill', 'none')
        .style('stroke', 'var(--bg-border)')
        .style('stroke-opacity', 0.3)
        .style('stroke-dasharray', '4 4');
    }

    // Axes
    const axes = svg.selectAll('.axis')
      .data(AXES)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axes.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(1.05) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => rScale(1.05) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('stroke', 'var(--bg-border)')
      .style('stroke-opacity', 0.3)
      .style('stroke-width', '1px');

    // Labels
    axes.append('text')
      .attr('class', 'font-display text-[11px] fill-[var(--text-secondary)]')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d);

    // Radar Blob coordinates
    const radarLine = d3.lineRadial<number>()
      .angle((d, i) => i * angleSlice)
      .radius(d => rScale(d))
      .curve(d3.curveLinearClosed);

    // Draw Blob
    svg.append('path')
      .datum(scores)
      .attr('d', radarLine)
      .style('fill', 'var(--brand-green)')
      .style('fill-opacity', 0.2)
      .style('stroke', 'var(--brand-green)')
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.8);

    // Data points
    scores.forEach((score, i) => {
      svg.append('circle')
        .attr('r', 3)
        .attr('cx', rScale(score) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('cy', rScale(score) * Math.sin(angleSlice * i - Math.PI / 2))
        .style('fill', 'var(--brand-green)');
    });

  }, [skills]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={cn("flex flex-col items-center", className)}
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider w-full text-center">
        Skill Radar
      </h3>
      <div className="relative flex items-center justify-center">
        <svg ref={svgRef} className="overflow-visible" />
      </div>
    </motion.div>
  );
}
