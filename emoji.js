// Microsoft Fluent Emoji 3D (MIT, github.com/microsoft/fluentui-emoji), copied into assets/emoji/.
// Glyph -> file; anything unmapped falls back to the system emoji font.
const FILES = {
  '🍦': 'soft_ice_cream', '🥐': 'croissant', '🍪': 'cookie', '🧁': 'cupcake', '🍓': 'strawberry',
  '🍕': 'pizza', '🍙': 'rice_ball', '🍟': 'french_fries', '🥨': 'pretzel', '🧀': 'cheese_wedge',
  '🛝': 'playground_slide', '⚽': 'soccer_ball', '🫧': 'bubbles', '🪀': 'yo-yo', '💃': 'woman_dancing', '🙈': 'see-no-evil_monkey',
  '🧣': 'scarf', '🍵': 'teacup_without_handle', '💊': 'pill', '🧊': 'ice', '🩹': 'adhesive_bandage', '💋': 'kiss_mark',
  '🤧': 'sneezing_face', '🤒': 'face_with_thermometer', '🤕': 'face_with_head-bandage',
  '🍽': 'fork_and_knife_with_plate', '🎲': 'game_die', '👆': 'backhand_index_pointing_up', '💆': 'person_getting_massage',
  '😴': 'sleeping_face', '💞': 'two_hearts', '🗺': 'world_map', '💢': 'anger_symbol', '🍬': 'candy', '🧂': 'salt', '❤': 'red_heart',
};
const key = (e) => e.replace(/️/g, '');
export const emojiSrc = (e) => (FILES[key(e)] ? `assets/emoji/${FILES[key(e)]}.png` : null);
export const emojiHTML = (e, px) => (emojiSrc(e) ? `<img class="emo" src="${emojiSrc(e)}" alt="${e}" style="width:${px}px;height:${px}px">` : e);
const imgs = {};
// decoded images for canvas drawing; onReady fires each time one finishes loading
export function emojiImg(e, onReady) {
  const src = emojiSrc(e);
  if (!src) return null;
  if (!imgs[src]) { imgs[src] = new Image(); imgs[src].onload = () => onReady?.(); imgs[src].src = src; }
  return imgs[src].complete && imgs[src].naturalWidth ? imgs[src] : null;
}
export const ALL_FILES = Object.values(FILES);
