<template>
  <div ref="el" class="d3-chart-container d3-donut-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';
import $ from 'jquery';

const props = defineProps({
  data: { required: true },
  emptyMessage: { default: 'No data yet.' },
});

const el = ref(null);

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
}

function draw(data) {
  if (!el.value) return;
  d3.select(el.value).selectAll('*').remove();

  if (!data.length) {
    d3.select(el.value).append('p').attr('class', 'helper-text').style('padding', '0.5rem 0').text(props.emptyMessage);
    return;
  }

  const mutedCol = cssVar('--muted') || '#6b7280';
  const textCol = cssVar('--text') || '#111827';
  const containerWidth = el.value.clientWidth || 320;
  const size = Math.min(containerWidth * 0.65, 240);
  const radius = size / 2 - 16;

  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.label))
    .range(d3.quantize(t => d3.interpolateRgb('#1db954', '#0284c7')(t), Math.max(data.length, 2)));

  const svg = d3.select(el.value).append('svg').attr('width', containerWidth).attr('height', size);
  const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.54).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(radius * 0.54).outerRadius(radius + 7);

  const slices = g.selectAll('.slice').data(pie(data)).join('g').attr('class', 'slice');

  slices.append('path')
    .attr('fill', d => colorScale(d.data.label))
    .attr('stroke', 'var(--surface)')
    .attr('stroke-width', 2)
    .attr('opacity', 0)
    .transition().duration(600).ease(d3.easeCubicOut)
    .attr('opacity', 0.9)
    .attrTween('d', function (d) {
      const interp = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return t => arc(interp(t));
    });

  // jQuery handles the hover labels, combining jQuery and D3
  slices.selectAll('path')
    .on('mouseenter', function (event, d) {
      d3.select(this).transition().duration(120).attr('d', arcHover).attr('opacity', 1);
      $(this).closest('svg').find('.donut-label').text(d.data.label);
      $(this).closest('svg').find('.donut-count').text(d.data.value);
    })
    .on('mouseleave', function () {
      d3.select(this).transition().duration(120).attr('d', arc).attr('opacity', 0.9);
      $(this).closest('svg').find('.donut-label').text('hover a slice');
      $(this).closest('svg').find('.donut-count').text('');
    });

  // Center labels
  g.append('text').attr('class', 'donut-count')
    .attr('text-anchor', 'middle').attr('dy', '-0.1em')
    .attr('font-size', '20px').attr('font-weight', '700').attr('fill', textCol).text('');
  g.append('text').attr('class', 'donut-label')
    .attr('text-anchor', 'middle').attr('dy', '1.2em')
    .attr('font-size', '10px').attr('fill', mutedCol).text('hover a slice');

  const legend = svg.append('g').attr('transform', `translate(${size + 8},${size / 2 - data.length * 11})`);
  data.forEach((d, i) => {
    legend.append('rect').attr('x', 0).attr('y', i * 22).attr('width', 11).attr('height', 11)
      .attr('rx', 3).attr('fill', colorScale(d.label));
    legend.append('text').attr('x', 17).attr('y', i * 22 + 10)
      .attr('font-size', '11px').attr('fill', mutedCol).text(`${d.label} (${d.value})`);
  });
}

watch(() => props.data, val => draw(val ?? []), { deep: true });
onMounted(() => draw(props.data ?? []));
</script>
