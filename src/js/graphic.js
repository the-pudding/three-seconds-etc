/* global d3 */
const $main = d3.select('main');
const $figure = $main.select('figure');
const $video = $figure.select('video');
const $figcaption = $figure.select('figcaption');
const $button = $figure.select('button');

const THRESH = 0.75;

const ASPECT = {
  square: 1080 / 1080,
  vertical: 1080 / 1920,
};

let size = null;

const playing = null;

function resize() {
  const w = $main.node().offsetWidth;
  const h = window.innerHeight;
  const ratio = w / h;
  const diffS = Math.abs(ASPECT.square - ratio);
  const diffV = Math.abs(ASPECT.vertical - ratio);
  size = diffS < diffV ? 'square' : 'vertical';
  $video.attr('src', `assets/videos/${size}.mp4`);

  let vw = $figure.node().offsetWidth;
  let vh = vw / ASPECT[size];
  if (vh > h * THRESH) {
    vh = h * THRESH;
    vw = vh * ASPECT[size];
  }

  $video.style('width', `${vw}px`).style('height', `${vh}px`);
  // videoW = $player.node().offsetWidth;
  // videoH = videoW / ASPECT;
  // const slideW = $video.size() * videoW;
  // $slide.style('width', `${slideW}px`);
  // $video.style('width', `${videoW}px`).style('height', `${videoH}px`);
}

function handleToggle() {
  $video.node().play();
  const hidden = $button.classed('is-hidden');
  $button.classed('is-hidden', !hidden);
  if (hidden) $video.node().pause();
  else $video.node().play();
}

function init() {
  resize();
  $video.on('click', handleToggle);
  // handleSlide();
  // setupEvents();
}

export default { init, resize };
