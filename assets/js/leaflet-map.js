(function () {
  'use strict';

  var container = document.getElementById('network-map');
  if (!container || typeof L === 'undefined') return;

  var map = L.map('network-map', {
    center: [27.0, 77.0],
    zoom: 5.5,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    dragging: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    minZoom: 3
  }).addTo(map);

  var cities = {
    Ludhiana: {
      lat: 30.9010, lng: 75.8573,
      label: 'Ludhiana',
      tag: 'Headquarters',
      services: ['Customs Clearance', 'Freight Forwarding', 'Logistics Hub'],
      r: 12,
      isHub: true
    },
    Amritsar: {
      lat: 31.6340, lng: 74.8723,
      label: 'Amritsar',
      tag: 'Border Hub',
      services: ['Customs Clearance', 'Cross-Border Logistics'],
      r: 9
    },
    Delhi: {
      lat: 28.6139, lng: 77.2090,
      label: 'Delhi',
      tag: 'Distribution Hub',
      services: ['Freight Forwarding', 'Distribution', 'Warehousing'],
      r: 9
    },
    Mumbai: {
      lat: 19.0760, lng: 72.8777,
      label: 'Mumbai',
      tag: 'Major Port',
      services: ['Sea Freight', 'Port Operations', 'Customs Clearance'],
      r: 9
    },
    Mundra: {
      lat: 22.8395, lng: 69.7217,
      label: 'Mundra',
      tag: 'Port Hub',
      services: ['Port Operations', 'Cargo Handling', 'Sea Freight'],
      r: 9
    }
  };

  var routeData = [
    { from: 'Ludhiana', to: 'Amritsar' },
    { from: 'Ludhiana', to: 'Delhi' },
    { from: 'Ludhiana', to: 'Mumbai' },
    { from: 'Ludhiana', to: 'Mundra' },
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Mundra' }
  ];

  var markers = {};
  var routes = [];

  function createIcon(city, isHub) {
    var size = isHub ? 24 : 18;
    var cls = isHub ? 'map-marker-icon map-marker-hub' : 'map-marker-icon';
    return L.divIcon({
      className: cls,
      html: '<div class="map-marker-inner"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  Object.keys(cities).forEach(function (name) {
    var c = cities[name];
    var icon = createIcon(c, c.isHub);
    var marker = L.marker([c.lat, c.lng], { icon: icon }).addTo(map);

    var tooltipContent = '<strong>' + c.label + '</strong>' + (c.tag ? '<br><span class="map-tooltip-tag">' + c.tag + '</span>' : '');
    marker.bindTooltip(tooltipContent, {
      direction: 'top',
      offset: [0, -8],
      className: 'map-tooltip'
    });

    var popupContent =
      '<div class="map-popup">' +
      '<h4 class="map-popup-title">' + c.label + '</h4>' +
      (c.tag ? '<span class="map-popup-tag">' + c.tag + '</span>' : '') +
      '<ul class="map-popup-services">' +
      c.services.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
      '</ul>' +
      '</div>';
    marker.bindPopup(popupContent, {
      className: 'map-popup-wrapper',
      closeButton: true,
      offset: [0, -12]
    });

    markers[name] = marker;
  });

  var routeStyle = {
    color: '#F59E0B',
    weight: 2.5,
    opacity: 0.6,
    dashArray: '10 8'
  };

  routeData.forEach(function (r) {
    var from = cities[r.from];
    var to = cities[r.to];
    var latlngs = [
      [from.lat, from.lng],
      [to.lat, to.lng]
    ];
    var polyline = L.polyline(latlngs, routeStyle).addTo(map);
    routes.push(polyline);
  });

  var animateMarkers = [];
  var animationSpeed = 0.0003;

  routeData.forEach(function (r, idx) {
    var from = cities[r.from];
    var to = cities[r.to];
    var start = { lat: from.lat, lng: from.lng };
    var end = { lat: to.lat, lng: to.lng };

    var freight = L.circleMarker([start.lat, start.lng], {
      radius: 4,
      fillColor: '#F59E0B',
      color: '#F59E0B',
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.9
    }).addTo(map);

    var progress = Math.random();
    var direction = 1;

    animateMarkers.push({
      marker: freight,
      start: start,
      end: end,
      progress: progress,
      direction: direction,
      routeIdx: idx,
      pause: 0
    });
  });

  var animFrame = null;
  var lastTime = 0;

  function animateFreight(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var delta = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    animateMarkers.forEach(function (a) {
      if (a.pause > 0) {
        a.pause -= delta;
        return;
      }
      a.progress += animationSpeed * delta * a.direction * 60;

      if (a.progress >= 1) {
        a.progress = 1;
        a.direction = -1;
        a.pause = 0.5 + Math.random() * 1.0;
      } else if (a.progress <= 0) {
        a.progress = 0;
        a.direction = 1;
        a.pause = 0.5 + Math.random() * 1.0;
      }

      var lat = a.start.lat + (a.end.lat - a.start.lat) * a.progress;
      var lng = a.start.lng + (a.end.lng - a.start.lng) * a.progress;
      a.marker.setLatLng([lat, lng]);
    });

    animFrame = requestAnimationFrame(animateFreight);
  }

  animFrame = requestAnimationFrame(animateFreight);

  var LegendControl = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
      var div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML =
        '<div class="map-legend-item"><span class="map-legend-dot map-legend-hub"></span>Service Hub</div>' +
        '<div class="map-legend-item"><span class="map-legend-dot map-legend-city"></span>Service City</div>' +
        '<div class="map-legend-item"><span class="map-legend-line"></span>Freight Route</div>';
      return div;
    }
  });
  map.addControl(new LegendControl());

  if (window.innerWidth >= 768) {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      map.invalidateSize();
      if (window.innerWidth >= 768) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
      } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
      }
    }, 200);
  });

  container._mapInstance = map;
  container._animFrame = animFrame;

})();
