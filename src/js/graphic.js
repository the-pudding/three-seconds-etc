/* global d3 */
import narration from './narration';

const $main = d3.select('main');
const $figure = $main.select('figure');
const $video = $figure.select('video');
const $figcaption = $figure.select('figcaption');
const $options = $figure.select('.figure__options');
const $buttonPlay = $figure.select('.button--play');
const $buttonVolume = $figure.select('.button--volume');
const $buttonCaption = $figure.select('.button--caption');

const videoEl = $video.node();

const THRESH = 0.8;

const ASPECT = {
  square: 1080 / 1080,
  vertical: 1080 / 1920,
};

let captionData = [];
let size = null;
let currentText = '';

function handleToggle() {
  videoEl.play();
  const hidden = $buttonPlay.classed('is-hidden');
  $buttonPlay.classed('is-hidden', !hidden);
  if (hidden) videoEl.pause();
  else videoEl.play();
}

function handleCaption() {
  const on = $buttonCaption.classed('is-on');
  $buttonCaption.classed('is-on', !on);
  $figcaption.classed('is-visible', !on);
}

function handleVolume() {
  const on = $buttonVolume.classed('is-on');
  $buttonVolume.classed('is-on', !on);
  videoEl.voume = on ? 0 : 1;
}

function handleProgress() {
  const t = videoEl.currentTime;
  const match = captionData.find(d => t >= d.timestamp);
  const text = match ? match.narration : '';
  if (text !== currentText) {
    currentText = text;
    $figcaption.text(text);
  }
}

function resize() {
  const w = $main.node().offsetWidth;
  const h = window.innerHeight;
  const ratio = w / h;
  const diffS = Math.abs(ASPECT.square - ratio);
  const diffV = Math.abs(ASPECT.vertical - ratio);
  size = diffS < diffV ? 'square' : 'vertical';

  const src = $video.attr('src');
  const newSrc = `assets/videos/${size}.mp4`;
  if (src !== newSrc) {
    $video.attr('src', newSrc);
    videoEl.load();
    videoEl.addEventListener('ended', () => {
      videoEl.currentTime = 0;
      handleToggle();
      $figcaption.text('');
    });
    videoEl.addEventListener('progress', handleProgress);
  }

  const fw = $figure.node().offsetWidth;
  let vw = fw;
  let vh = fw / ASPECT[size];
  if (vh > h * THRESH) {
    vh = h * THRESH;
    vw = vh * ASPECT[size];
  }

  $video.style('width', `${vw}px`).style('height', `${vh}px`);
  $figcaption.style('width', `${vw}px`);
  $options.style('right', `${(fw - vw) / 2}px`);
}

function init() {
  captionData = narration.section.map(d => ({
    ...d,
    timestamp: +d.timestamp,
  }));

  captionData.reverse();
  resize();
  $video.on('click', handleToggle);
  $buttonVolume.on('click', handleVolume);
  $buttonCaption.on('click', handleCaption);
}

export default { init, resize };
