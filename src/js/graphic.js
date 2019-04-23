/* global d3 */
import transitionEvent from './utils/transition-event';

const $player = d3.select('#player');
const $slide = $player.select('.player__slide');
const $video = $slide.selectAll('video');
const $prev = $player.select('.button--prev');
const $next = $player.select('.button--next');

const NUM_VIDEOS = $video.size();
const ASPECT = 1080 / 1080;

let videoW = 0;
let videoH = 0;
let index = 0;
let playing = null;

function prefix(p) {
  return [p, `webkit-${p}`, `ms-${p}`];
}

function resize() {
  videoW = $player.node().offsetWidth;
  videoH = videoW / ASPECT;
  const slideW = $video.size() * videoW;
  $slide.style('width', `${slideW}px`);
  $video.style('width', `${videoW}px`).style('height', `${videoH}px`);
}

function handleSlide(dir = 0) {
  index += dir;
  index = Math.min(Math.max(0, index), NUM_VIDEOS);

  const x = -videoW * index;

  $video.classed('is-active', (d, i) => i === index);

  const prefixes = prefix('transform');
  prefixes.forEach(pre => {
    const transform = `translate(${x}px, 0)`;
    $slide.node().style[pre] = transform;
  });

  $prev.property('disabled', index === 0);
  $next.property('disabled', index >= NUM_VIDEOS - 1);
  handleSlideEnd();
}

function toggle(state) {
  if (playing !== null) {
    const videoEl = $video.filter((d, i) => i === playing).node();
    if (state === 'play') videoEl.play();
    else if (state === 'stop') videoEl.pause();
  }
}

function handleSlideEnd() {
  if (playing !== index) {
    toggle('stop');
    playing = index;
    toggle('play');
  }
}

function setupEvents() {
  $prev.on('click', () => handleSlide(-1));
  $next.on('click', () => handleSlide(1));
  // $slide.on(transitionEvent, handleSlideEnd);
  $video.each((d, i, n) => {
    n[i].addEventListener('ended', () => handleSlide(1));
  });
}

function init() {
  resize();
  handleSlide();
  setupEvents();
}

export default { init, resize };
