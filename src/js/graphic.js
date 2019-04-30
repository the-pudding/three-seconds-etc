/* global d3 */
import narration from './narration';
import tracker from './utils/tracker';

const $main = d3.select('main');
const $figure = $main.select('figure');
const $video = $figure.select('video');
const $figcaption = $figure.select('figcaption');
const $options = $figure.select('.figure__options');
const $buttonPlay = $figure.select('.button--play');
const $buttonPause = $figure.select('.button--pause');
const $buttonVolume = $figure.select('.button--volume');
const $buttonCaption = $figure.select('.button--caption');
const $buttonRewind = $figure.select('.button--rewind');
const $warning = $figure.select('.figure__warning');

const videoEl = $video.node();

const MAX_W = 560;
const THRESH = 0.8;
const DPR = Math.min(window.devicePixelRatio, 2);

const ASPECT = {
  square: 1080 / 1080,
  vertical: 1080 / 1920,
};

let captionData = [];
let currentText = '';
let ticker = null;
let canPlay = false;

const tracked = [];

function handleToggle() {
  $warning.remove();
  if (canPlay) {
    const hidden = $buttonPlay.classed('is-hidden');
    $buttonPlay.classed('is-hidden', !hidden);
    $buttonPause.classed('is-hidden', hidden);
    if (hidden) videoEl.pause();
    else videoEl.play();
  }
}

function handleCaption() {
  const on = $buttonCaption.classed('is-on');
  $buttonCaption.classed('is-on', !on);
  $figcaption.classed('is-visible', !on);
}

function handleRewind() {
  if (canPlay && ticker) {
    videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
  }
}

function handleVolume() {
  const on = $buttonVolume.classed('is-on');
  $buttonVolume.classed('is-on', !on);
  videoEl.volume = on ? 0 : 1;
}

function handleTick() {
  const t = videoEl.currentTime;
  const match = captionData.find(d => t >= d.start && t <= d.end);
  const text = match ? match.narration : '';
  if (text !== currentText) {
    currentText = text;
    $figcaption.text(text);
  }

  let milestone = 0;
  if (t > 0) milestone = 1;
  if (t / 10 >= 1) milestone = Math.floor(t / 10) * 10;

  if (milestone && !tracked.includes(milestone)) {
    tracked.push(milestone);
    tracker.send({ category: 'milestone', action: milestone, once: true });
  }
}

function chooseVideo() {
  const w = $main.node().offsetWidth;
  const h = window.innerHeight;
  const ratio = w / h;
  const diffS = Math.abs(ASPECT.square - ratio);
  const diffV = Math.abs(ASPECT.vertical - ratio);

  const size = diffS < diffV ? 'square' : 'vertical';

  const fw = $figure.node().offsetWidth;
  let vw = fw;
  let vh = fw / ASPECT[size];
  if (vh > h * THRESH) {
    vh = h * THRESH;
    vw = vh * ASPECT[size];
  }

  const suffix = vw * DPR > MAX_W * 1.5 ? '' : '--small';

  $video.style('width', `${vw}px`).style('height', `${vh}px`);
  $figcaption.style('width', `${vw}px`);
  $options.style('right', `${(fw - vw) / 2}px`);

  videoEl.addEventListener('ended', () => {
    videoEl.currentTime = 0;
    handleToggle();
    $figcaption.text('');
  });

  videoEl.addEventListener('canplaythrough', () => {
    canPlay = true;
  });

  const src = `assets/videos/${size}${suffix}.mp4`;
  $video.attr('src', src);
  videoEl.load();

  ticker = d3.timer(handleTick);
}

function resize() {}

function init() {
  captionData = narration.section.map(d => ({
    ...d,
    start: +d.start,
    end: +d.end,
  }));

  captionData.reverse();
  chooseVideo();
  $video.on('click', handleToggle);
  $buttonVolume.on('click', handleVolume);
  $buttonCaption.on('click', handleCaption);
  $buttonRewind.on('click', handleRewind);
}

export default { init, resize };
