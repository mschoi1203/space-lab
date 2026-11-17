/* 스타 레인저 우주 실험실 공통 — 저장은 연성중 한눈 체크(Apps Script). 이 파일에는 키·PIN이 없다. */
var API = 'https://script.google.com/macros/s/AKfycbyjTVXBmn74fC8wMl_feUeLy8ZC9ZPT4bjKR8m6YurHhIB8a4aXRaZZ420icQBEzmMH8g/exec';

var EXP = {
  parallax: {
    id: 'parallax', icon: '📏', name: '시차 측정 — 엄지(연필) 실험', std: '[9과23-01] 탐구: 시차 측정하기',
    x: '눈 ~ 연필 거리', xu: 'cm', y: '배경 자에서 움직인 거리', yu: 'cm', rows: 5,
    preset: [20, 30, 40, 50, 60],
    how: '벽에 자를 붙이고 그 앞에 섭니다. 연필을 눈에서 20·30·40·50·60 cm 떨어진 곳에 두고, 왼눈·오른눈을 번갈아 감으며 연필이 벽의 자 위에서 몇 cm 움직여 보이는지 잽니다. (벽까지의 거리는 모둠 모두 같게!)',
    q: '가까운 연필일수록 더 많이 움직일까? 거리가 2배가 되면 움직임은?'
  },
  balloon: {
    id: 'balloon', icon: '🎈', name: '풍선 우주 팽창', std: '[9과23-03] 탐구: 스티커 붙인 풍선으로 우주 팽창 실험',
    x: '처음 거리 (A→은하)', xu: 'cm', y: '나중 거리 (A→은하)', yu: 'cm', rows: 4,
    preset: ['B', 'C', 'D', 'E'],
    how: '풍선을 조금 불고 스티커(은하) A·B·C·D·E를 붙입니다. 기준 은하 A에서 B·C·D·E까지 거리를 줄자로 잽니다(처음). 정해진 시간(예: 10초) 동안 더 불고 다시 잽니다(나중).',
    q: '멀리 있는 은하일수록 더 많이 멀어졌을까?'
  }
};
var COLORS = ['#7cc4ff', '#ffd166', '#ff6b9a', '#4ade80', '#c084fc', '#fb923c', '#22d3ee', '#f472b6', '#a3e635', '#fca5a5'];

function $(id) { return document.getElementById(id); }
function toast(t) { var e = $('toast'); if (!e) return alert(t); e.textContent = t; e.classList.remove('hidden'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.add('hidden'); }, 2800); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

function apiGet(params) {
  var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  return fetch(API + '?' + q).then(function (r) { return r.json(); }).then(function (d) { if (d.error) throw new Error(d.error); return d; });
}
function apiPost(body) {
  return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    .then(function (r) { return r.json(); }).then(function (d) { if (d.error) throw new Error(d.error); return d; });
}
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

/* 원점을 지나는 직선 y = k x (최소제곱) */
function slope0(pts) {
  var sxy = 0, sxx = 0;
  pts.forEach(function (p) { sxy += p[0] * p[1]; sxx += p[0] * p[0]; });
  return sxx ? sxy / sxx : 0;
}
function fmt(n, d) { return isFinite(n) ? Number(n).toFixed(d == null ? 2 : d) : '-'; }

/* 간단한 SVG 산점도: series = [{color, label, pts:[[x,y]...]}], line = {k} (y=kx) */
function scatter(el, series, opt) {
  opt = opt || {};
  var W = el.clientWidth || 600, H = opt.h || 360, L = 52, R = 16, T = 14, B = 44;
  var all = [];
  series.forEach(function (s) { s.pts.forEach(function (p) { all.push(p); }); });
  var xmax = opt.xmax || Math.max.apply(null, all.map(function (p) { return p[0]; }).concat([1])) * 1.1;
  var ymax = opt.ymax || Math.max.apply(null, all.map(function (p) { return p[1]; }).concat([1])) * 1.15;
  function X(v) { return L + (W - L - R) * v / xmax; }
  function Y(v) { return H - B - (H - T - B) * v / ymax; }
  var g = '';
  for (var i = 0; i <= 5; i++) {
    var xv = xmax * i / 5, yv = ymax * i / 5;
    g += '<line x1="' + X(xv) + '" y1="' + T + '" x2="' + X(xv) + '" y2="' + (H - B) + '" stroke="rgba(255,255,255,.07)"/>';
    g += '<line x1="' + L + '" y1="' + Y(yv) + '" x2="' + (W - R) + '" y2="' + Y(yv) + '" stroke="rgba(255,255,255,.07)"/>';
    g += '<text x="' + X(xv) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + fmt(xv, xmax < 2 ? 3 : 0) + '</text>';
    g += '<text x="' + (L - 8) + '" y="' + (Y(yv) + 4) + '" text-anchor="end">' + fmt(yv, yv < 10 ? 1 : 0) + '</text>';
  }
  g += '<line x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '" stroke="rgba(255,255,255,.4)"/>';
  g += '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '" stroke="rgba(255,255,255,.4)"/>';
  g += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" style="fill:#dbe3ff;font-weight:700">' + esc(opt.xl || '') + '</text>';
  g += '<text transform="translate(14,' + ((T + H - B) / 2) + ') rotate(-90)" text-anchor="middle" style="fill:#dbe3ff;font-weight:700">' + esc(opt.yl || '') + '</text>';
  if (opt.line && isFinite(opt.line.k) && opt.line.k > 0) {
    var xe = Math.min(xmax, ymax / opt.line.k);
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(xe) + '" y2="' + Y(opt.line.k * xe) + '" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="7 5"/>';
  }
  if (opt.curve) { // y = K / x
    var d = '', K = opt.curve.K;
    for (var j = 1; j <= 60; j++) { var xx = xmax * j / 60, yy = K / xx; if (yy > ymax) continue; d += (d ? 'L' : 'M') + X(xx) + ' ' + Y(yy); }
    if (d) g += '<path d="' + d + '" fill="none" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="7 5"/>';
  }
  series.forEach(function (s) {
    s.pts.forEach(function (p) {
      g += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="7" fill="' + s.color + '" stroke="#061021" stroke-width="1.5"><title>' + esc(s.label) + ' (' + p[0] + ', ' + fmt(p[1], 2) + ')</title></circle>';
    });
  });
  el.innerHTML = '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg>';
}
