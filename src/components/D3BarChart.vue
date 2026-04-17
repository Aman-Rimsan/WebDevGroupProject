<template>
  <div ref="el" class="d3-chart-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  data: { required: true },
  maxBars: { default: 10 },
  labelRotation: { default: -30 },
});

const el = ref(null);

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
}

function draw(data) {
  if (!el.value) return;
  d3.select(el.value).selectAll('*').remove();

  const sliced = data.slice(0, props.maxBars);
  if (!sliced.length) return;

  const containerWidth = el.value.clientWidth || 400;
  const margin = { top: 16, right: 16, bottom: props.labelRotation !== 0 ? 80 : 40, left: 44 };
  const width = containerWidth - margin.left - margin.right;
  const height = 240 - margin.top - margin.bottom;

  const accent = cssVar('--accent') || '#1db954';
  const mutedCol = cssVar('--muted') || '#6b7280';
  const textCol = cssVar('--text') || '#111827';

  const svg = d3.select(el.value)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(sliced.map(d => d.label)).range([0, width]).padding(0.25);
  const y = d3.scaleLinear().domain([0, d3.max(sliced, d => d.value)]).nice().range([height, 0]);

  // Gridlines
  svg.append('g')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', mutedCol).attr('stroke-opacity', 0.2));

  // Bars (with entrance animation)
  svg.selectAll('.bar')
    .data(sliced)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.label))
    .attr('width', x.bandwidth())
    .attr('y', height)
    .attr('height', 0)
    .attr('rx', 5)
    .attr('fill', accent)
    .attr('fill-opacity', 0.82)
    .transition().duration(550).ease(d3.easeCubicOut)
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value));

  // Value labels
  svg.selectAll('.bar-label')
    .data(sliced)
    .join('text')
    .attr('class', 'bar-label')
    .attr('x', d => x(d.label) + x.bandwidth() / 2)
    .attr('y', d => y(d.value) - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', textCol)
    .attr('opacity', 0)
    .text(d => d.value)
    .transition().delay(350).duration(250)
    .attr('opacity', 1);

  // X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedCol)
    .attr('font-size', '11px')
    .attr('transform', `rotate(${props.labelRotation})`)
    .style('text-anchor', props.labelRotation < 0 ? 'end' : 'middle');

  // Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(4).tickSize(0))
    .call(g => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', mutedCol)
    .attr('font-size', '11px');
}

watch(() => props.data, val => { if (val?.length) draw(val); }, { deep: true });
onMounted(() => { if (props.data?.length) draw(props.data); });
</script>
