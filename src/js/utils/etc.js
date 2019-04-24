const $tagline = d3.select('.header__etc-tagline');
const $logo = d3.select('.logo');

function toggle() {
  const visible = $tagline.classed('is-visible');
  $tagline.classed('is-visible', !visible);
}

export default function etc() {
  // $logo.on('mouseenter mouseout click', toggle);
  // $tagline.on('click', toggle);
}
