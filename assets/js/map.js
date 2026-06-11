/**
 * Shivaay Logistics — Midnight Cargo
 * Animated SVG Route Map
 *
 * Creates a simplified India outline with 5 service cities
 * (Ludhiana, Amritsar, Delhi, Mumbai, Mundra) connected by
 * amber dashed route lines with teal pulsing city dots.
 */
(function () {
  'use strict';
  var container = document.querySelector('.route-map');
  if (!container) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Route map showing Shivaay Logistics service locations across India');

  // Inline styles for Ludhiana pulse
  var style = document.createElementNS(SVG_NS, 'style');
  style.textContent =
    '.route-dot-ludhiana { animation: pulse-ludhiana 2s ease-in-out infinite; }' +
    '@keyframes pulse-ludhiana {' +
    '  0%, 100% { r: 8; opacity: 1; }' +
    '  50% { r: 13; opacity: 0.4; }' +
    '}';
  svg.appendChild(style);

  // Helper functions
  function el(name, attrs) {
    var e = document.createElementNS(SVG_NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // --- India Outline (simplified) ---
  var indiaPath = 'M 120 80 L 160 75 L 195 70 L 220 60 L 250 55 L 280 50 ' +
    'L 310 55 L 335 75 L 340 95 L 335 120 L 325 145 ' +
    'L 320 165 L 310 180 L 290 195 L 275 210 ' +
    'L 260 230 L 240 250 L 220 270 L 200 290 ' +
    'L 185 310 L 175 330 L 180 350 L 200 355 ' +
    'L 230 350 L 250 330 L 260 310 ' +
    'L 250 290 L 220 275 L 195 260 L 185 240 ' +
    'L 175 220 L 165 195 L 155 175 L 145 155 ' +
    'L 135 130 L 120 110 Z';
  svg.appendChild(el('path', {
    d: indiaPath,
    fill: 'rgba(148,163,184,0.05)',
    stroke: 'rgba(148,163,184,0.15)',
    'stroke-width': '1.5'
  }));

  // --- City coordinates (approximate positions) ---
  var cities = {
    Ludhiana: { x: 165, y: 90,  cls: 'route-dot route-dot-pulse route-dot-ludhiana', r: 8, label: 'Ludhiana', lx: 180, ly: 90 },
    Amritsar: { x: 150, y: 70,  cls: 'route-dot route-dot-pulse', r: 6, label: 'Amritsar', lx: 155, ly: 55 },
    Delhi:    { x: 185, y: 125, cls: 'route-dot route-dot-pulse', r: 6, label: 'Delhi', lx: 197, ly: 130 },
    Mumbai:   { x: 75,  y: 240, cls: 'route-dot route-dot-pulse', r: 6, label: 'Mumbai', lx: 55, ly: 235 },
    Mundra:   { x: 55,  y: 195, cls: 'route-dot route-dot-pulse', r: 6, label: 'Mundra', lx: 38, ly: 198 }
  };

  // --- Route lines (hub-and-spoke from Ludhiana + corridor) ---
  var routes = [
    [cities.Ludhiana, cities.Amritsar],
    [cities.Ludhiana, cities.Delhi],
    [cities.Ludhiana, cities.Mumbai],
    [cities.Ludhiana, cities.Mundra],
    [cities.Delhi, cities.Mumbai],
    [cities.Mumbai, cities.Mundra]
  ];
  routes.forEach(function (pair) {
    svg.appendChild(el('line', {
      x1: pair[0].x, y1: pair[0].y,
      x2: pair[1].x, y2: pair[1].y,
      class: 'route-line'
    }));
  });

  // --- City dots ---
  for (var name in cities) {
    var c = cities[name];
    svg.appendChild(el('circle', { cx: c.x, cy: c.y, class: c.cls, r: c.r }));
  }

  // --- City labels ---
  for (name in cities) {
    var lbl = cities[name];
    var text = el('text', { x: lbl.lx, y: lbl.ly, class: 'route-label' });
    text.textContent = lbl.label;
    svg.appendChild(text);
  }

  // --- Legend ---
  var legendY = 340;
  svg.appendChild(el('circle', { cx: 100, cy: legendY, class: 'route-dot', r: 5 }));
  var leg1 = el('text', { x: 112, y: legendY + 4, class: 'route-label', fill: '#94A3B8' });
  leg1.textContent = 'Service Hub';
  svg.appendChild(leg1);

  svg.appendChild(el('line', { x1: 200, y1: legendY, x2: 230, y2: legendY, class: 'route-line' }));
  var leg2 = el('text', { x: 240, y: legendY + 4, class: 'route-label', fill: '#94A3B8' });
  leg2.textContent = 'Freight Route';
  svg.appendChild(leg2);

  container.appendChild(svg);
})();
