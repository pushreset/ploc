// Collectible keycaps: data table + procedural builder (primitives only, no assets).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CAP_H = 0.42;
const R = 0.28; // head radius

export const UNIVERSES = {
  rose:     { name: 'Bonbon Rose', cap: '#ffd0e0', accent: '#ff6f9f', particle: 'heart',  pcolor: '#ff86b0', sound: 'bubble' },
  fournee:  { name: 'Fournée',     cap: '#fbe5c4', accent: '#d08a4c', particle: 'crumb',  pcolor: '#e9b073', sound: 'soft' },
  lueur:    { name: 'Lueur',       cap: '#d8d2ff', accent: '#ffd166', particle: 'star',   pcolor: '#ffd166', sound: 'bell' },
  sousbois: { name: 'Sous-Bois',   cap: '#cfeccf', accent: '#5fb35a', particle: 'leaf',   pcolor: '#78c86a', sound: 'wood' },
  neon:     { name: 'Scène Néon',    cap: '#4a3a78', accent: '#ff5fd2', particle: 'note',    pcolor: '#ff7ce0', sound: 'synth' },
  manoir:   { name: 'Manoir Minuit', cap: '#c9bddb', accent: '#8e3b8f', particle: 'bat',     pcolor: '#6d4a92', sound: 'organ' },
  glam:     { name: 'Rose Glam',     cap: '#ff86c2', accent: '#ffd36b', particle: 'sparkle', pcolor: '#ffe08a', sound: 'sparkle' },
  sushi:    { name: 'Comptoir Sushi',  cap: '#33443a', accent: '#ff8a65', particle: 'crumb',   pcolor: '#ffffff', sound: 'squish' },
  chats:    { name: 'Famille Chat',    cap: '#ffd6a5', accent: '#ff6f9f', particle: 'paw',     pcolor: '#e8a07c', sound: 'meow' },
  souris:   { name: 'Famille Souris',  cap: '#bccbd6', accent: '#ff8fa8', particle: 'crumb',   pcolor: '#ffd34d', sound: 'squeak' },
  jungle:   { name: 'Famille Jungle',  cap: '#f9e38c', accent: '#ff8a3c', particle: 'leaf',    pcolor: '#3fbf5a', sound: 'drum' },
  yokai:    { name: 'Yōkai',           cap: '#f6b49a', accent: '#e8443a', particle: 'sakura',  pcolor: '#ffb3cf', sound: 'koto' },
  esprits:  { name: 'Esprits du Vent', cap: '#cfe3f0', accent: '#7fc9a0', particle: 'spore',   pcolor: '#f4ffb0', sound: 'wind' },
  meca:      { name: 'Méca Chibi',     cap: '#a9b3bf', accent: '#5ce1e6', particle: 'gear',    pcolor: '#c7d2de', sound: 'servo' },
  noel:      { name: 'Noël',           cap: '#f08080', accent: '#2f8f5b', particle: 'snow',    pcolor: '#ffffff', sound: 'jingle' },
  ville:     { name: 'Ville',          cap: '#b7c3d6', accent: '#ffcf5c', particle: 'star',    pcolor: '#ffe27a', sound: 'city' },
  chateau:   { name: 'Château',        cap: '#cfc6b8', accent: '#6a5acd', particle: 'sparkle', pcolor: '#ffd36b', sound: 'fanfare' },
  vehicules: { name: 'Véhicules',      cap: '#8fa3b8', accent: '#ffcf3c', particle: 'bubble',  pcolor: '#eef2f6', sound: 'beep' },
  sorcieres: { name: 'Sorcières',      cap: '#3f6f6a', accent: '#b06ce0', particle: 'spore',   pcolor: '#d9a6ff', sound: 'magic' },
  samourais: { name: 'Samouraïs',      cap: '#d9685f', accent: '#2b2238', particle: 'leaf',    pcolor: '#e8503a', sound: 'bamboo' },
  fruits:    { name: 'Fruits',         cap: '#ffb8a3', accent: '#5fb35a', particle: 'crumb',   pcolor: '#ffa040', sound: 'juicy' },
  legumes:   { name: 'Légumes',        cap: '#c9b38f', accent: '#5fb35a', particle: 'leaf',    pcolor: '#6cc46a', sound: 'crunch' },
  tortues:   { name: 'Famille Tortue', cap: '#bfe6dc', accent: '#3fae8f', particle: 'bubble',  pcolor: '#bfe9ff', sound: 'water' },
  halloween:  { name: 'Halloween',           cap: '#ffa35c', accent: '#7a3fb0', particle: 'bat',     pcolor: '#5a3e70', sound: 'organ' },
  bonbons:    { name: 'Bonbons',             cap: '#ffb3e0', accent: '#ff5fa8', particle: 'heart',   pcolor: '#ff8fc8', sound: 'bubble' },
  sport:      { name: 'Sport',               cap: '#9fd0ff', accent: '#ffffff', particle: 'star',    pcolor: '#ffe066', sound: 'whistle' },
  musique:    { name: 'Musique',             cap: '#c3a6ff', accent: '#2b2238', particle: 'note',    pcolor: '#8f6bff', sound: 'guitar' },
  ocean:      { name: 'Océan',               cap: '#7fd3ea', accent: '#ff8a5c', particle: 'bubble',  pcolor: '#d6f6ff', sound: 'water' },
  espace:     { name: 'Système solaire',     cap: '#34306b', accent: '#ffd34d', particle: 'star',    pcolor: '#fff2a8', sound: 'cosmic' },
  princesses: { name: 'Princesses du monde', cap: '#ffcfe0', accent: '#ffd36b', particle: 'sparkle', pcolor: '#ffe08a', sound: 'harp' },
  kaiju:      { name: 'Kaiju kawaii',        cap: '#8fc79a', accent: '#7cf3ff', particle: 'crumb',   pcolor: '#9aa39a', sound: 'roar' },
  blocs:      { name: 'Blocs & Bataille',    cap: '#8fcf6a', accent: '#6b4a2a', particle: 'pixel',   pcolor: '#7ac74f', sound: 'arcade' },
  dieux:      { name: 'Dieux grecs',         cap: '#f4ecd8', accent: '#ffd34d', particle: 'sparkle', pcolor: '#ffe08a', sound: 'harp' },
  capitales:  { name: 'Capitales',           cap: '#cfe0ff', accent: '#e8443a', particle: 'star',    pcolor: '#ffe27a', sound: 'city' },
  dekotora:   { name: 'Dekotora',            cap: '#ffe070', accent: '#ff5fd2', particle: 'sparkle', pcolor: '#ffd34d', sound: 'engine' },
  tuning:     { name: 'Voitures tuning',     cap: '#ff7aa8', accent: '#7cf3ff', particle: 'sparkle', pcolor: '#c0f6ff', sound: 'engine' },
  pirates:    { name: 'Pirates',             cap: '#6fb3d9', accent: '#2b2238', particle: 'crumb',   pcolor: '#ffd34d', sound: 'wood' },
  peluches:   { name: 'Peluches',            cap: '#f5d6e6', accent: '#ff8fb5', particle: 'heart',   pcolor: '#ff9fbf', sound: 'soft' },
  foret:      { name: 'Animaux de la forêt', cap: '#b9d7a8', accent: '#8a5a3a', particle: 'leaf',    pcolor: '#7cbf5a', sound: 'wood' },
  dinos:      { name: 'Dinosaures kawaii',   cap: '#9be0a0', accent: '#ffcf5c', particle: 'leaf',    pcolor: '#5fb35a', sound: 'roar' },
  fossiles:   { name: 'Dinosaures squelettes', cap: '#4a4458', accent: '#f2ead8', particle: 'crumb', pcolor: '#f2ead8', sound: 'wood' },
  poneys:     { name: 'Poneys',              cap: '#ffd6f0', accent: '#ff8fd8', particle: 'heart',   pcolor: '#ffb3e6', sound: 'sparkle' },
  reptiles:   { name: 'Reptiles',            cap: '#a8d08d', accent: '#ff5a7a', particle: 'leaf',    pcolor: '#6cc46a', sound: 'hiss' },
  nains:      { name: 'Nains de jardin',     cap: '#9fd47a', accent: '#e8443a', particle: 'leaf',    pcolor: '#7cbf5a', sound: 'wood' },
  ferme:      { name: 'Ferme',               cap: '#f6d58a', accent: '#e8443a', particle: 'crumb',   pcolor: '#e8c870', sound: 'moo' },
  hamsters:   { name: 'Hamsters',            cap: '#ffe0b3', accent: '#ff8fb5', particle: 'crumb',   pcolor: '#c98a4b', sound: 'squeak' },
  chasseuses: { name: 'Chasseuses de fantômes', cap: '#bfe8c0', accent: '#5a4a6a', particle: 'spore', pcolor: '#9cff8a', sound: 'synth' },
  glaces:     { name: 'Desserts glacés',     cap: '#d6f0ff', accent: '#ff8fb5', particle: 'snow',    pcolor: '#ffffff', sound: 'sparkle' },
  brochettes: { name: 'Brochettes japonaises', cap: '#e8b07a', accent: '#8a5a3a', particle: 'crumb', pcolor: '#b8743c', sound: 'sizzle' },
  crudites:   { name: 'Crudités',            cap: '#cfeec0', accent: '#5fb35a', particle: 'leaf',    pcolor: '#6cc46a', sound: 'crunch' },
  secret:   { name: 'Secret',      cap: '#fff0b0', accent: '#ffc93c', particle: 'star',   pcolor: '#ffd84a', sound: 'bell' },
};

export const RARITY = {
  common: { label: 'Commun',     weight: 60, color: '#9aa3ad' },
  rare:   { label: 'Rare',       weight: 30, color: '#4aa3ff' },
  super:  { label: 'Super rare', weight: 9,  color: '#b86bff' },
  secret: { label: 'Secret',     weight: 1,  color: '#e0a400' },
};

// id, name, universe, rarity, body, ears, accessory, head shape, eyes, accent override,
// extras { hair, hairColor, fangs, cape, pattern, patternColor, patternColor2, muzzle, whiskers, tail, tails, mane, trunk, beak, nose, eyeColor, glowBody, wave,
//          paws, wheels, windows, wings, spikes, beard, bigEyes, noMouth, shell, scutes, flippers, florets, tips }
const T = [
  ['guimauve',   'Guimauve',   'rose', 'common', '#fff4f8', 'cat',    'bow',      'round', 'dot'],
  ['praline',    'Praline',    'rose', 'common', '#ffc2d6', 'bear',   'none',     'wide',  'dot'],
  ['dragee',     'Dragée',     'rose', 'common', '#ffe0ec', 'bunny',  'flower',   'round', 'happy'],
  ['berlingot',  'Berlingot',  'rose', 'rare',   '#ff9fc2', 'cat',    'cherry',   'round', 'dot'],
  ['sucrette',   'Sucrette',   'rose', 'rare',   '#f6d0ff', 'bunny',  'crown',    'tall',  'dot'],
  ['rosee',      'Rosée',      'rose', 'super',  '#ffffff', 'none',   'halo',     'round', 'happy'],

  ['brioche',    'Brioche',    'fournee', 'common', '#f4c27a', 'bear', 'none',    'wide',  'dot'],
  ['chouquette', 'Chouquette', 'fournee', 'common', '#e9b46a', 'none', 'sugar',   'round', 'happy', '#ffffff'],
  ['cannele',    'Cannelé',    'fournee', 'common', '#b8692f', 'none', 'icing',   'tall',  'dot',   '#fff3e0'],
  ['macaron',    'Macaron',    'fournee', 'rare',   '#c8f0d8', 'cat',  'bow',     'wide',  'sleepy','#ff9fc2'],
  ['beignet',    'Beignet',    'fournee', 'rare',   '#f0c48a', 'bear', 'icing',   'round', 'happy', '#ff8fc0'],
  ['fraisier',   'Fraisier',   'fournee', 'super',  '#ff7f94', 'leaf', 'sugar',   'round', 'dot',   '#ffe9a8'],

  ['lumi',       'Lumi',       'lueur', 'common', '#ebe6ff', 'cat',     'star',  'round', 'dot'],
  ['nova',       'Nova',       'lueur', 'common', '#cfe8ff', 'bunny',   'none',  'round', 'happy'],
  ['brume',      'Brume',      'lueur', 'common', '#f2ecff', 'antenna', 'none',  'wide',  'sleepy'],
  ['opale',      'Opale',      'lueur', 'rare',   '#ffd9f5', 'horns',   'crown', 'round', 'dot'],
  ['comete',     'Comète',     'lueur', 'rare',   '#b9b0ff', 'bear',    'star',  'round', 'dot'],
  ['prisme',     'Prisme',     'lueur', 'super',  '#ffffff', 'cat',     'halo',  'tall',  'happy'],

  ['mousse',     'Mousse',     'sousbois', 'common', '#b7e4a8', 'leaf',  'none',     'round', 'happy'],
  ['noisette',   'Noisette',   'sousbois', 'common', '#c99466', 'bear',  'flower',   'wide',  'dot'],
  ['cepe',       'Cèpe',       'sousbois', 'common', '#f3e2c4', 'none',  'mushroom', 'round', 'dot',  '#e8504a'],
  ['pepin',      'Pépin',      'sousbois', 'rare',   '#b08968', 'tufts', 'none',     'wide',  'dot'],
  ['fougere',    'Fougère',    'sousbois', 'rare',   '#9fd9c4', 'bunny', 'flower',   'tall',  'sleepy'],
  ['roux',       'Roux',       'sousbois', 'super',  '#ff9a52', 'cat',   'bow',      'round', 'happy','#5fb35a'],

  // themed sets: original figures that borrow a vibe (stage idols vs demons, pastel-goth vampires, fashion dolls), no licensed characters
  ['sora',       'Sora',       'neon', 'common', '#ffe3d6', 'none',  'mic',     'round', 'dot',   '#ff5fd2', { hair: 'ponytail', hairColor: '#ff6fb5' }],
  ['hana',       'Hana',       'neon', 'common', '#ffe0cc', 'none',  'glasses', 'round', 'happy', '#ff5fd2', { hair: 'bob', hairColor: '#2a2340' }],
  ['gobi',       'Gobi',       'neon', 'common', '#8fc8ff', 'horns', 'none',    'wide',  'dot',   null,      { fangs: true }],
  ['yuna',       'Yuna',       'neon', 'rare',   '#ffe6d8', 'none',  'mic',     'round', 'dot',   '#7cf3ff', { hair: 'buns', hairColor: '#b9a2ff' }],
  ['dokki',      'Dokki',      'neon', 'rare',   '#b58cff', 'horns', 'star',    'round', 'happy', '#7cf3ff', { fangs: true }],
  ['aurore',     'Aurore',     'neon', 'super',  '#fff0e6', 'none',  'blade',   'tall',  'dot',   '#7cf3ff', { hair: 'long', hairColor: '#e8e6ff' }],

  ['nocturne',   'Nocturne',   'manoir', 'common', '#f4ecff', 'none',     'bow',   'round', 'dot',    '#b0306a', { hair: 'long', hairColor: '#2b2238', fangs: true }],
  ['chauvette',  'Chauvette',  'manoir', 'common', '#9a7fc0', 'batwings', 'none',  'wide',  'happy',  null,      { fangs: true }],
  ['spectre',    'Spectre',    'manoir', 'common', '#ffffff', 'none',     'none',  'tall',  'sleepy'],
  ['citrouille', 'Citrouille', 'manoir', 'rare',   '#ff9b3d', 'leaf',     'none',  'wide',  'happy'],
  ['comtesse',   'Comtesse',   'manoir', 'rare',   '#eef0ff', 'none',     'crown', 'round', 'dot',    null,      { hair: 'bob', hairColor: '#4a2a5a', fangs: true, cape: '#7a1f3d' }],
  ['minuit',     'Minuit',     'manoir', 'super',  '#7d6aa3', 'batwings', 'none',  'round', 'dot',    null,      { fangs: true, cape: '#7a1f3d' }],

  ['stella',     'Stella',     'glam', 'common', '#ffe6d8', 'none',    'tiara',   'round', 'dot',   '#ffd36b', { hair: 'long', hairColor: '#ffe07a' }],
  ['coco',       'Coco',       'glam', 'common', '#f3cfb3', 'none',    'glasses', 'round', 'happy', '#ff4fa0', { hair: 'ponytail', hairColor: '#7a4a2a' }],
  ['lila',       'Lila',       'glam', 'common', '#ffe6d8', 'none',    'bow',     'round', 'dot',   '#ff4fa0', { hair: 'buns', hairColor: '#ff8fc8' }],
  ['licorne',    'Licorne',    'glam', 'rare',   '#ffffff', 'unicorn', 'flower',  'round', 'happy'],
  ['caramel',    'Caramel',    'glam', 'rare',   '#e8b98a', 'floppy',  'bow',     'wide',  'dot',   '#ff4fa0'],
  ['diva',       'Diva',       'glam', 'super',  '#ffe6d8', 'none',    'crown',   'tall',  'dot',   '#ffd36b', { hair: 'long', hairColor: '#fff0a0' }],

  ['nigiri',     'Nigiri',     'sushi', 'common', '#fbfaf5', 'none', 'nigiri',  'wide',  'dot',   '#ff8a65'],
  ['maki',       'Maki',       'sushi', 'common', '#fbfaf5', 'none', 'maki',    'round', 'happy', '#7bd36a'],
  ['onigiri',    'Onigiri',    'sushi', 'common', '#fbfaf5', 'none', 'onigiri', 'tall',  'dot'],
  ['tamago',     'Tamago',     'sushi', 'rare',   '#fbfaf5', 'none', 'tamago',  'wide',  'happy', '#ffd75e'],
  ['ebi',        'Ebi',        'sushi', 'rare',   '#fbfaf5', 'none', 'ebi',     'wide',  'dot',   '#ff9a7a'],
  ['gunkan',     'Gunkan',     'sushi', 'super',  '#fbfaf5', 'none', 'gunkan',  'round', 'dot',   '#ff6a2b'],

  ['tigrou',     'Tigrou',     'chats', 'common', '#f5b46a', 'cat', 'none',  'round', 'dot',    null, { pattern: 'stripes', patternColor: '#c9772f', muzzle: '#fff3e0', whiskers: true }],
  ['chaussette', 'Chaussette', 'chats', 'common', '#4a4452', 'cat', 'none',  'round', 'dot',    null, { muzzle: '#ffffff', whiskers: true, eyeColor: '#ffe066' }],
  ['calin',      'Câlin',      'chats', 'common', '#d9d0c8', 'cat', 'none',  'round', 'sleepy', null, { muzzle: '#ffffff', whiskers: true }],
  ['calico',     'Calico',     'chats', 'rare',   '#ffffff', 'cat', 'none',  'round', 'happy',  null, { pattern: 'patches', patternColor: '#f39a3a', patternColor2: '#3a3440', whiskers: true }],
  ['siam',       'Siam',       'chats', 'rare',   '#f3e6d2', 'cat', 'none',  'round', 'dot',    null, { pattern: 'mask', patternColor: '#6b4a3a', eyeColor: '#5aa9ff', whiskers: true }],
  ['mamiechat',  'Mamie Chat', 'chats', 'super',  '#cfc6d8', 'cat', 'specs', 'round', 'happy',  null, { muzzle: '#ffffff', whiskers: true }],

  ['papa',       'Papa Souris',  'souris', 'common', '#a39cb0', 'mouse', 'specs',  'round', 'dot',    null, { whiskers: true, tail: 'mouse' }],
  ['maman',      'Maman Souris', 'souris', 'common', '#c2bacb', 'mouse', 'flower', 'round', 'happy',  null, { whiskers: true, tail: 'mouse' }],
  ['bebe',       'Bébé Souris',  'souris', 'common', '#d9d2e0', 'mouse', 'none',   'round', 'sleepy', null, { whiskers: true, tail: 'mouse' }],
  ['cousin',     'Cousin',       'souris', 'rare',   '#c2a98f', 'mouse', 'cheese', 'round', 'dot',    null, { whiskers: true, tail: 'mouse' }],
  ['mamie',      'Mamie Souris', 'souris', 'rare',   '#f4f1f6', 'mouse', 'bow',    'round', 'happy',  '#9b7bd6', { whiskers: true, tail: 'mouse' }],
  ['etoile',     'Souris Étoile','souris', 'super',  '#efe6ff', 'mouse', 'crown',  'round', 'dot',    null, { whiskers: true, tail: 'mouse' }],

  ['singe',      'Singe',      'jungle', 'common', '#a8754a', 'monkey',   'none',  'round', 'dot',   null,      { pattern: 'face', patternColor: '#f3d2b0' }],
  ['tigre',      'Tigre',      'jungle', 'common', '#ff9a3c', 'bear',     'none',  'wide',  'dot',   null,      { pattern: 'stripes', patternColor: '#3a2a20', muzzle: '#ffffff', whiskers: true }],
  ['perroquet',  'Perroquet',  'jungle', 'common', '#ff5a4a', 'crest',    'none',  'round', 'dot',   '#ffd34d', { beak: '#ffd34d' }],
  ['elephant',   'Éléphant',   'jungle', 'rare',   '#b9bdd0', 'elephant', 'none',  'round', 'happy', null,      { trunk: true }],
  ['grenouille', 'Grenouille', 'jungle', 'rare',   '#8fd86a', 'none',     'none',  'wide',  'frog'],
  ['lion',       'Lion',       'jungle', 'super',  '#f5c26b', 'bear',     'crown', 'round', 'dot',   null,      { mane: '#c9772f', muzzle: '#fff3e0', whiskers: true }],

  // traditional yōkai (public folklore)
  ['tanuki',     'Tanuki',     'yokai', 'common', '#a87a50', 'bear',   'leafhat', 'wide',  'dot',   null,      { pattern: 'bandit', patternColor: '#4a3428' }],
  ['kappa',      'Kappa',      'yokai', 'common', '#8fd18a', 'none',   'dish',    'round', 'dot',   null,      { beak: '#ffd34d' }],
  ['daruma',     'Daruma',     'yokai', 'common', '#e8443a', 'none',   'none',    'round', 'dot',   null,      { pattern: 'face', patternColor: '#fff6ea' }],
  ['maneki',     'Maneki',     'yokai', 'rare',   '#ffffff', 'cat',    'collar',  'round', 'happy', '#e8443a', { pattern: 'patches', patternColor: '#f39a3a', patternColor2: '#3a3440', wave: true }],
  ['tengu',      'Tengu',      'yokai', 'rare',   '#e0574a', 'none',   'none',    'round', 'dot',   null,      { nose: true }],
  ['kitsune',    'Kitsune',    'yokai', 'super',  '#ffffff', 'fox',    'none',    'round', 'happy', null,      { pattern: 'marks', patternColor: '#e8443a', tail: 'fox', tails: 3, patternColor2: '#ffd0c4' }],

  // gentle forest/wind spirits: Ghibli-like mood, original creatures
  ['mousseline', 'Mousseline', 'esprits', 'common', '#9fd88a', 'leaf',      'none',    'round', 'happy',  null,      { pattern: 'fuzz', patternColor: '#c6efb3' }],
  ['gland',      'Gland',      'esprits', 'common', '#e8c79a', 'none',      'acorn',   'round', 'dot',    '#9a6a3a'],
  ['nuageux',    'Nuageux',    'esprits', 'common', '#ffffff', 'none',      'none',    'wide',  'sleepy', null,      { pattern: 'puffs' }],
  ['lanterne',   'Lanterne',   'esprits', 'rare',   '#ffd9a0', 'none',      'lantern', 'tall',  'happy',  '#c9483a', { glowBody: true }],
  ['pluie',      'Pluie',      'esprits', 'rare',   '#a9d8ff', 'droptip',   'none',    'tall',  'dot'],
  ['luciole',    'Luciole',    'esprits', 'super',  '#eaffb0', 'antennae',  'none',    'round', 'dot',    '#f6ff7a', { glowBody: true }],

  // original chibi robots (no licensed mecha designs)
  ['boulon',     'Boulon',     'meca', 'common', '#e9eef3', 'antennae', 'none',  'box', 'visor', '#5ce1e6'],
  ['rivet',      'Rivet',      'meca', 'common', '#ffb25c', 'fin',      'none',  'box', 'visor', '#7cf3ff'],
  ['volt',       'Volt',       'meca', 'common', '#b9a3ff', 'radar',    'none',  'box', 'dot',   '#ffe066'],
  ['turbo',      'Turbo',      'meca', 'rare',   '#ff6b6b', 'fin',      'vents', 'box', 'visor', '#ffe066'],
  ['kiro',       'Kiro',       'meca', 'rare',   '#5fd3a8', 'horns',    'vents', 'box', 'visor', '#ff5fd2'],
  ['titan',      'Titan',      'meca', 'super',  '#e8e3d8', 'fin',      'vents', 'box', 'visor', '#ffd34d'],

  ['lutin',      'Lutin',         'noel', 'common', '#ffe0cc', 'elf',     'elfhat', 'round', 'happy', '#2f8f5b'],
  ['bonhomme',   'Bonhomme',      'noel', 'common', '#ffffff', 'none',    'tophat', 'round', 'dot',   '#e8443a', { beak: '#ff8a3c' }],
  ['renne',      'Renne',         'noel', 'common', '#b07a4a', 'antlers', 'none',   'round', 'dot',   null,      { muzzle: '#e8c7a0' }],
  ['painepice',  'Pain d’épices', 'noel', 'rare',   '#c98a4b', 'none',    'bow',    'round', 'happy', '#e8443a', { pattern: 'marks', patternColor: '#ffffff' }],
  ['sapin',      'Sapin',         'noel', 'rare',   '#3f9a5a', 'none',    'tree',   'tall',  'happy', '#ffd34d'],
  ['perenoel',   'Père Noël',     'noel', 'super',  '#ffe0cc', 'none',    'santa',  'round', 'happy', '#e8443a', { beard: '#ffffff' }],

  ['maison',      'Maison',      'ville', 'common', '#fff1d6', 'none',    'roof',   'box',   'dot',   '#e8735a', { paws: false, windows: true }],
  ['boulangerie', 'Boulangerie', 'ville', 'common', '#ffe9e0', 'none',    'awning', 'box',   'happy', '#ff8fb0', { paws: false, windows: true }],
  ['immeuble',    'Immeuble',    'ville', 'common', '#c8d3e6', 'none',    'none',   'tower', 'dot',   '#ffcf5c', { paws: false, windows: true }],
  ['ecole',       'École',       'ville', 'rare',   '#ffd9a8', 'none',    'clock',  'box',   'dot',   '#e8735a', { paws: false, windows: true }],
  ['phare',       'Phare',       'ville', 'rare',   '#ffffff', 'none',    'lamp',   'tall',  'dot',   '#e8443a', { paws: false, pattern: 'rings', patternColor: '#e8443a' }],
  ['gratteciel',  'Gratte-ciel', 'ville', 'super',  '#a9c7ff', 'antenna', 'none',   'tower', 'happy', '#ffcf5c', { paws: false, windows: true }],

  ['chevalier',  'Chevalier', 'chateau', 'common', '#ffe0cc', 'none',  'helmet',      'round', 'dot',   '#e8443a'],
  ['princesse',  'Princesse', 'chateau', 'common', '#ffe6d8', 'none',  'tiara',       'round', 'dot',   '#ffd36b', { hair: 'long', hairColor: '#c98a4b' }],
  ['tourelle',   'Tourelle',  'chateau', 'common', '#d8d0c4', 'none',  'battlements', 'tower', 'dot',   '#6a5acd', { paws: false }],
  ['roi',        'Roi',       'chateau', 'rare',   '#ffe0cc', 'none',  'crown',       'round', 'happy', null,      { beard: '#f2f2f2', cape: '#7a1f3d' }],
  ['bouffon',    'Bouffon',   'chateau', 'rare',   '#ffe6d8', 'none',  'jester',      'round', 'happy', '#ff5a4a'],
  ['dragon',     'Dragon',    'chateau', 'super',  '#7fd18a', 'horns', 'none',        'round', 'dot',   null,      { wings: '#5fae6a', spikes: '#ffd34d', fangs: true }],

  ['voiture',    'Voiture',   'vehicules', 'common', '#ff7b7b', 'none', 'none',     'car', 'dot',   null,      { paws: false, wheels: true }],
  ['bus',        'Bus',       'vehicules', 'common', '#ffc94d', 'none', 'none',     'box', 'happy', null,      { paws: false, wheels: true, windows: true }],
  ['taxi',       'Taxi',      'vehicules', 'common', '#ffd84a', 'none', 'taxisign', 'car', 'dot',   '#2b2238', { paws: false, wheels: true }],
  ['police',     'Police',    'vehicules', 'rare',   '#e8eef8', 'none', 'siren',    'car', 'dot',   '#3b6fe0', { paws: false, wheels: true }],
  ['ambulance',  'Ambulance', 'vehicules', 'rare',   '#ffffff', 'none', 'siren',    'box', 'happy', '#e8443a', { paws: false, wheels: true, pattern: 'cross', patternColor: '#e8443a' }],
  ['pompiers',   'Pompiers',  'vehicules', 'super',  '#e8443a', 'none', 'ladder',   'car', 'dot',   '#d8d8d8', { paws: false, wheels: true }],

  ['sorciere',   'Sorcière',        'sorcieres', 'common', '#ffe6d8', 'none',  'witch',    'round', 'dot',   '#b06ce0', { hair: 'long', hairColor: '#2b2238' }],
  ['matou',      'Matou',           'sorcieres', 'common', '#4a4256', 'cat',   'witch',    'round', 'dot',   '#b06ce0', { eyeColor: '#ffe066', whiskers: true }],
  ['chaudron',   'Chaudron',        'sorcieres', 'common', '#4a4452', 'none',  'cauldron', 'wide',  'happy', '#7cf36a', { eyeColor: '#ffe066' }],
  ['chouette',   'Chouette',        'sorcieres', 'rare',   '#9b7bd6', 'tufts', 'none',     'round', 'dot',   null,      { bigEyes: true, beak: '#ffb84d' }],
  ['potion',     'Potion',          'sorcieres', 'rare',   '#ff8fd8', 'none',  'cork',     'tall',  'happy', null,      { glowBody: true }],
  ['grandesorciere', 'Grande Sorcière', 'sorcieres', 'super', '#ffe6d8', 'none', 'witch',  'round', 'happy', '#ffd34d', { hair: 'long', hairColor: '#7a4ad8', cape: '#4b2a7a' }],

  ['samourai',   'Samouraï',  'samourais', 'common', '#ffe0cc', 'none', 'kabuto',   'round', 'dot',    '#3a2a30'],
  ['ninja',      'Ninja',     'samourais', 'common', '#3a3440', 'none', 'headband', 'round', 'dot',    '#e8443a', { pattern: 'mask', patternColor: '#ffe0cc', noMouth: true }],
  ['sumo',       'Sumo',      'samourais', 'common', '#ffd8c0', 'none', 'topknot',  'wide',  'happy',  '#2b2238'],
  ['kunoichi',   'Kunoichi',  'samourais', 'rare',   '#e86a9a', 'none', 'headband', 'round', 'dot',    '#ffffff', { pattern: 'mask', patternColor: '#ffe6d8', noMouth: true }],
  ['ronin',      'Rōnin',     'samourais', 'rare',   '#ffe0cc', 'none', 'kasa',     'round', 'sleepy', '#e3c27a'],
  ['shogun',     'Shogun',    'samourais', 'super',  '#ffe0cc', 'none', 'kabuto',   'round', 'dot',    '#ffd34d', { beard: '#2b2238' }],

  ['pomme',      'Pomme',      'fruits', 'common', '#ff5a5a', 'stem',        'none', 'round', 'dot'],
  ['poire',      'Poire',      'fruits', 'common', '#c9e06a', 'stem',        'none', 'tall',  'happy'],
  ['clementine', 'Clémentine', 'fruits', 'common', '#ffa040', 'leaf',        'none', 'wide',  'happy'],
  ['citron',     'Citron',     'fruits', 'rare',   '#ffe14d', 'none',        'none', 'wide',  'dot',   null, { tips: true }],
  ['pasteque',   'Pastèque',   'fruits', 'rare',   '#5cbf5a', 'stem',        'none', 'round', 'happy', null, { pattern: 'vstripes', patternColor: '#2f7a3a' }],
  ['ananas',     'Ananas',     'fruits', 'super',  '#ffc93c', 'crownleaves', 'none', 'tall',  'dot',   null, { pattern: 'fuzz', patternColor: '#d99a20' }],

  ['carotte',    'Carotte',   'legumes', 'common', '#ff8a3c', 'leaf', 'none',  'tall',  'dot',   null, { pattern: 'stripes', patternColor: '#e0702a' }],
  ['tomate',     'Tomate',    'legumes', 'common', '#ff4a3a', 'none', 'calyx', 'round', 'happy'],
  ['radis',      'Radis',     'legumes', 'common', '#ff7fae', 'leaf', 'none',  'round', 'dot'],
  ['aubergine',  'Aubergine', 'legumes', 'rare',   '#8a4fc0', 'none', 'calyx', 'tall',  'dot'],
  ['brocoli',    'Brocoli',   'legumes', 'rare',   '#b5e3a0', 'none', 'none',  'tall',  'happy', null, { florets: '#3f9a4a' }],
  ['mais',       'Maïs',      'legumes', 'super',  '#ffe066', 'husk', 'none',  'tall',  'dot',   null, { pattern: 'fuzz', patternColor: '#ffd030' }],

  ['papatortue',  'Papa Tortue',   'tortues', 'common', '#9fd98a', 'none', 'specs',  'round', 'dot',    null, { shell: '#5a9a4a' }],
  ['mamantortue', 'Maman Tortue',  'tortues', 'common', '#b5e3a0', 'none', 'flower', 'round', 'happy',  null, { shell: '#e39a5a' }],
  ['bebetortue',  'Bébé Tortue',   'tortues', 'common', '#c9eeb8', 'none', 'none',   'mini',  'sleepy', null, { shell: '#8fd0e0' }],
  ['tortuemer',   'Tortue de mer', 'tortues', 'rare',   '#8fd6c8', 'none', 'none',   'round', 'dot',    null, { shell: '#3f8f9a', flippers: true }],
  ['papytortue',  'Papy Tortue',   'tortues', 'rare',   '#a8c99a', 'none', 'specs',  'round', 'happy',  null, { shell: '#8a7a5a', beard: '#ffffff' }],
  ['arcenciel',   'Arc-en-ciel',   'tortues', 'super',  '#c9f0d8', 'none', 'none',   'round', 'happy',  null, { shell: '#ffffff', scutes: ['#ff8a8a', '#ffcf5c', '#8ee28a', '#7cc8ff', '#c69cff'] }],

  ['potiron',    'Potiron',    'halloween', 'common', '#ff8a2a', 'stem', 'none',  'wide',  'dot',   null,      { pattern: 'vstripes', patternColor: '#e06a10' }],
  ['boo',        'Boo',        'halloween', 'common', '#ffffff', 'none', 'bow',   'tall',  'happy', '#7a3fb0'],
  ['momie',      'Momie',      'halloween', 'common', '#f3ead8', 'none', 'none',  'round', 'dot',   null,      { bands: '#e2d6bc' }],
  ['frankie',    'Frankie',    'halloween', 'rare',   '#9ad87a', 'none', 'none',  'box',   'dot',   null,      { bolts: true, hair: 'flat', hairColor: '#2b2238' }],
  ['lougarou',   'Loup-garou', 'halloween', 'rare',   '#8f8a9a', 'fox',  'none',  'round', 'dot',   null,      { muzzle: '#cfc9d6', fangs: true, pattern: 'fuzz', patternColor: '#7a7585' }],
  ['reinecitrouille', 'Reine Citrouille', 'halloween', 'super', '#ff8a2a', 'stem', 'crown', 'wide', 'happy', null, { pattern: 'vstripes', patternColor: '#e06a10', cape: '#5a2a7a' }],

  ['sucette',    'Sucette',        'bonbons', 'common', '#ff8fc8', 'none', 'none',  'round', 'happy', null, { candy: ['#ffffff', '#ff5fa8'] }],
  ['reglisse',   'Réglisse',       'bonbons', 'common', '#3a2f3a', 'none', 'none',  'tall',  'dot',   null, { eyeColor: '#ffe066', pattern: 'rings', patternColor: '#55485a' }],
  ['ourson',     'Ourson gélifié', 'bonbons', 'common', '#ff5a6a', 'bear', 'none',  'round', 'dot',   null, { jelly: true }],
  ['barbeapapa', 'Barbe à papa',   'bonbons', 'rare',   '#ffc2e8', 'none', 'none',  'wide',  'happy', null, { pattern: 'puffs', fuzzy: true }],
  ['papillote',  'Papillote',      'bonbons', 'rare',   '#ffd34d', 'none', 'none',  'wide',  'dot',   null, { twists: '#ff8fc8' }],
  ['sucettearc', 'Sucette arc-en-ciel', 'bonbons', 'super', '#ffffff', 'none', 'crown', 'round', 'happy', null, { candy: ['#ff8a8a', '#ffcf5c', '#8ee28a', '#7cc8ff', '#c69cff'] }],

  ['foot',       'Foot',    'sport', 'common', '#ffffff', 'none', 'none', 'round', 'dot',   null,      { pattern: 'patches', patternColor: '#2b2238', patternColor2: '#2b2238' }],
  ['basket',     'Basket',  'sport', 'common', '#ff8a3c', 'none', 'none', 'round', 'happy', null,      { pattern: 'vstripes', patternColor: '#3a2a20' }],
  ['tennis',     'Tennis',  'sport', 'common', '#d8f04a', 'none', 'none', 'round', 'dot',   null,      { pattern: 'fuzz', patternColor: '#c4dc3a' }],
  ['rugby',      'Rugby',   'sport', 'rare',   '#b8743c', 'none', 'none', 'wide',  'dot',   null,      { pattern: 'marks', patternColor: '#ffffff' }],
  ['bowling',    'Bowling', 'sport', 'rare',   '#ffffff', 'none', 'none', 'tall',  'happy', null,      { pattern: 'rings', patternColor: '#e8443a' }],
  ['trophee',    'Trophée', 'sport', 'super',  '#ffd25a', 'none', 'star', 'round', 'happy', '#ffffff', { metal: true }],

  ['rockeur',    'Rockeur',       'musique', 'common', '#ffe0cc', 'none', 'glasses',    'round', 'dot',    '#2b2238', { hair: 'long', hairColor: '#2b2238' }],
  ['rappeur',    'Rappeur',       'musique', 'common', '#c68a5e', 'none', 'cap',        'round', 'dot',    '#ff5a4a', { chain: true }],
  ['maestro',    'Maestro',       'musique', 'common', '#ffe0cc', 'none', 'bow',        'round', 'happy',  '#2b2238', { hair: 'bob', hairColor: '#f4f4f4' }],
  ['jazz',       'Jazz',          'musique', 'rare',   '#8d5a3b', 'none', 'beret',      'round', 'sleepy', '#2b2238'],
  ['electro',    'Électro',       'musique', 'rare',   '#e8e3ff', 'none', 'headphones', 'round', 'happy',  '#ff5fd2', { hair: 'buns', hairColor: '#7cf3ff' }],
  ['operadiva',  'Diva d’opéra',  'musique', 'super',  '#ffe6d8', 'none', 'tiara',      'round', 'happy',  '#ffd36b', { hair: 'buns', hairColor: '#c98a4b', cape: '#b0306a' }],

  ['poulpe',     'Poulpe',        'ocean', 'common', '#ff8fb0', 'none',     'none', 'round', 'happy', null,      { tentacles: true, paws: false }],
  ['meduse',     'Méduse',        'ocean', 'common', '#c9b8ff', 'none',     'none', 'round', 'dot',   null,      { jelly: true, tentacles: 'thin', paws: false }],
  ['clown',      'Poisson-clown', 'ocean', 'common', '#ff8a3c', 'none',     'none', 'wide',  'dot',   null,      { pattern: 'rings', patternColor: '#ffffff', tips: true }],
  ['baleine',    'Baleine',       'ocean', 'rare',   '#7aa7e8', 'none',     'none', 'wide',  'happy', null,      { spout: true, flippers: true }],
  ['crabe',      'Crabe',         'ocean', 'rare',   '#ff5a4a', 'antennae', 'none', 'wide',  'dot',   '#ff5a4a', { claws: true, paws: false }],
  ['narval',     'Narval',        'ocean', 'super',  '#cfe8ff', 'unicorn',  'none', 'round', 'happy', null,      { flippers: true }],

  ['lune',       'Lune',    'espace', 'common', '#e8e6f0', 'none', 'none', 'round', 'sleepy', null, { pattern: 'patches', patternColor: '#c9c6d6', patternColor2: '#bdb9cc' }],
  ['terre',      'Terre',   'espace', 'common', '#5aa8f0', 'none', 'none', 'round', 'happy',  null, { pattern: 'patches', patternColor: '#6cc46a', patternColor2: '#6cc46a' }],
  ['mars',       'Mars',    'espace', 'common', '#e8734a', 'none', 'none', 'round', 'dot',    null, { pattern: 'patches', patternColor: '#c95a3a', patternColor2: '#d8683f' }],
  ['saturne',    'Saturne', 'espace', 'rare',   '#f0d08a', 'none', 'none', 'round', 'dot',    null, { ring: '#d9b870' }],
  ['jupiter',    'Jupiter', 'espace', 'rare',   '#e8b98a', 'none', 'none', 'wide',  'happy',  null, { pattern: 'rings', patternColor: '#c98a5a' }],
  ['soleil',     'Soleil',  'espace', 'super',  '#ffd84a', 'none', 'none', 'round', 'happy',  null, { rays: '#ffb020', glowBody: true }],

  // inspired by regional attire, respectfully: headpieces and hairstyles, no sacred items
  ['elise',      'Élise',  'princesses', 'common', '#ffe6d8', 'none', 'tiara',       'round', 'dot',   '#ffd36b', { hair: 'long', hairColor: '#ffe07a' }],
  ['mei',        'Mei',    'princesses', 'common', '#ffe3c8', 'none', 'hairpins',    'round', 'happy', '#e8443a', { hair: 'buns', hairColor: '#2b2238' }],
  ['amara',      'Amara',  'princesses', 'common', '#8d5a3b', 'none', 'headwrap',    'round', 'dot',   '#ff8a3c'],
  ['priya',      'Priya',  'princesses', 'rare',   '#c68a5e', 'none', 'tikka',       'round', 'happy', '#ffd34d', { hair: 'long', hairColor: '#2b2238' }],
  ['lupita',     'Lupita', 'princesses', 'rare',   '#d9a066', 'none', 'flowercrown', 'round', 'dot',   '#ff5fa8', { hair: 'long', hairColor: '#3a2420' }],
  ['nadia',      'Nadia',  'princesses', 'super',  '#ffe6d8', 'none', 'kokoshnik',   'round', 'happy', '#e8443a', { hair: 'long', hairColor: '#c98a4b' }],

  // original kaiju, no licensed monster designs
  ['kaijuvert',   'Kaiju vert',    'kaiju', 'common', '#7fcf7a', 'none', 'none',  'round', 'dot',    null,      { spikes: '#5aa85a', tail: 'dino', fangs: true }],
  ['kaijubleu',   'Kaiju bleu',    'kaiju', 'common', '#7ab8f0', 'none', 'none',  'round', 'happy',  null,      { spikes: '#7cf3ff', tail: 'dino' }],
  ['bebekaiju',   'Bébé kaiju',    'kaiju', 'common', '#a8e0a0', 'none', 'none',  'mini',  'sleepy', null,      { spikes: '#7fcf7a', tail: 'dino' }],
  ['kaijuvolcan', 'Kaiju volcan',  'kaiju', 'rare',   '#6a4a52', 'none', 'none',  'round', 'dot',    null,      { spikes: '#ff6a2b', tail: 'dino', pattern: 'marks', patternColor: '#ff8a3c', eyeColor: '#ffd34d' }],
  ['mecakaiju',   'Méca-kaiju',    'kaiju', 'rare',   '#c8d0dc', 'none', 'vents', 'box',   'visor',  '#ff5a4a', { spikes: '#8a95a8', tail: 'dino' }],
  ['roikaiju',    'Roi des kaiju', 'kaiju', 'super',  '#5fae6a', 'none', 'crown', 'round', 'dot',    null,      { spikes: '#7cf3ff', tail: 'dino', fangs: true, cape: '#7a1f3d' }],

  // original blocky characters, no game-specific designs
  ['mineur',       'Mineur',          'blocs', 'common', '#f3c8a0', 'none',  'pickaxe', 'box', 'dot',   '#9aa3ad', { hair: 'flat', hairColor: '#6b4a2a', pixels: '#e0b080' }],
  ['cubegelee',    'Cube gelée',      'blocs', 'common', '#7ad86a', 'none',  'none',    'box', 'happy', null,      { jelly: true }],
  ['golem',        'Golem de pierre', 'blocs', 'common', '#9aa3ad', 'none',  'none',    'box', 'dot',   null,      { pixels: '#7ac74f' }],
  ['batisseur',    'Bâtisseur',       'blocs', 'rare',   '#f3c8a0', 'none',  'hardhat', 'box', 'happy', '#ffcf3c', { pixels: '#e0b080' }],
  ['parachutiste', 'Parachutiste',    'blocs', 'rare',   '#c68a5e', 'none',  'goggles', 'box', 'dot',   '#5ab8f0', { pixels: '#b07a50' }],
  ['dragonpixel',  'Dragon pixel',    'blocs', 'super',  '#9a6ad8', 'horns', 'none',    'box', 'dot',   null,      { wings: '#7a4ab8', pixels: '#b88af0' }],

  ['zeus',       'Zeus',      'dieux', 'common', '#ffe0cc', 'none',         'laurel', 'round', 'dot',   '#ffd34d', { beard: '#f4f4f4', bolt: true }],
  ['athena',     'Athéna',    'dieux', 'common', '#f3d6c0', 'none',         'helmet', 'round', 'dot',   '#3b6fe0', { hair: 'long', hairColor: '#4a2a1a' }],
  ['poseidon',   'Poséidon',  'dieux', 'common', '#d6f0ee', 'none',         'crown',  'round', 'dot',   null,      { beard: '#7fd0c4', trident: true }],
  ['aphrodite',  'Aphrodite', 'dieux', 'rare',   '#ffe6d8', 'none',         'flower', 'round', 'happy', '#ff8fb5', { hair: 'long', hairColor: '#ffcf8a' }],
  ['hermes',     'Hermès',    'dieux', 'rare',   '#ffe0cc', 'featherwings', 'none',   'round', 'happy', null,      { hair: 'bob', hairColor: '#c98a4b' }],
  ['apollon',    'Apollon',   'dieux', 'super',  '#ffe6d8', 'none',         'laurel', 'round', 'happy', '#ffd34d', { hair: 'bob', hairColor: '#ffd36b', rays: '#ffcf3c' }],

  ['paris',      'Paris',    'capitales', 'common', '#ffe0cc', 'none', 'beret',    'round', 'happy', '#e8443a', { baguette: true }],
  ['londres',    'Londres',  'capitales', 'common', '#ffe0cc', 'none', 'bearskin', 'round', 'dot',   '#2b2238'],
  ['tokyo',      'Tokyo',    'capitales', 'common', '#ffe6d8', 'none', 'flower',   'round', 'happy', '#ffb3cf', { hair: 'bob', hairColor: '#2b2238' }],
  ['moscou',     'Moscou',   'capitales', 'rare',   '#ffe0cc', 'none', 'onion',    'round', 'dot',   '#e8443a'],
  ['lecaire',    'Le Caire', 'capitales', 'rare',   '#d9a066', 'none', 'nemes',    'round', 'dot',   '#3b6fe0'],
  ['rome',       'Rome',     'capitales', 'super',  '#ffe0cc', 'none', 'laurel',   'round', 'happy', '#ffd34d', { cape: '#b0303a' }],

  ['dekorose',     'Dekotora rose',  'dekotora', 'common', '#ff8fc8', 'none', 'visorbar', 'truck', 'dot',   '#ffd34d', { paws: false, wheels: true, truckLights: '#ffe066' }],
  ['dekobleu',     'Néon bleu',      'dekotora', 'common', '#7ab8f0', 'none', 'visorbar', 'truck', 'happy', '#7cf3ff', { paws: false, wheels: true, truckLights: '#7cf3ff' }],
  ['dekodragon',   'Dragon doré',    'dekotora', 'common', '#5fae6a', 'none', 'visorbar', 'truck', 'dot',   '#ffd34d', { paws: false, wheels: true, truckLights: '#ffd34d', pattern: 'marks', patternColor: '#ffd34d' }],
  ['dekolanterne', 'Lanterne rouge', 'dekotora', 'rare',   '#e8443a', 'none', 'visorbar', 'truck', 'dot',   '#ffd34d', { paws: false, wheels: true, truckLights: '#ff9a3c' }],
  ['dekoarc',      'Arc-en-ciel',    'dekotora', 'rare',   '#ffffff', 'none', 'visorbar', 'truck', 'happy', '#ff5fd2', { paws: false, wheels: true, truckLights: 'rainbow' }],
  ['dekoshogun',   'Shogun',         'dekotora', 'super',  '#ffd25a', 'none', 'visorbar', 'truck', 'dot',   '#ffffff', { paws: false, wheels: true, truckLights: '#ffffff', metal: true }],

  ['turborose',    'Turbo rose',    'tuning', 'common', '#ff7ab8', 'none', 'spoiler', 'car', 'dot',   '#2b2238', { paws: false, wheels: true, underglow: '#ff5fd2', racing: '#ffffff' }],
  ['driftmenthe',  'Drift menthe',  'tuning', 'common', '#7fe0c4', 'none', 'spoiler', 'car', 'happy', '#2b2238', { paws: false, wheels: true, underglow: '#7cf3ff' }],
  ['neonviolet',   'Néon violet',   'tuning', 'common', '#9a6ad8', 'none', 'spoiler', 'car', 'dot',   '#ffffff', { paws: false, wheels: true, underglow: '#c86bff', racing: '#ffd34d' }],
  ['vitessebleue', 'Vitesse bleue', 'tuning', 'rare',   '#3b6fe0', 'none', 'spoiler', 'car', 'dot',   '#ffffff', { paws: false, wheels: true, underglow: '#7cf3ff', racing: '#ffffff' }],
  ['musclerouge',  'Muscle rouge',  'tuning', 'rare',   '#e8443a', 'none', 'none',    'car', 'dot',   null,      { paws: false, wheels: true, racing: '#2b2238' }],
  ['goldracer',    'Gold racer',    'tuning', 'super',  '#ffd25a', 'none', 'spoiler', 'car', 'happy', '#2b2238', { paws: false, wheels: true, underglow: '#ffd34d', metal: true, racing: '#2b2238' }],

  ['capitaine',       'Capitaine',        'pirates', 'common', '#ffe0cc', 'none',  'tricorne', 'round', 'dot',   '#2b2238', { beard: '#6b3a1a' }],
  ['matelot',         'Matelot',          'pirates', 'common', '#ffe0cc', 'none',  'bandana',  'round', 'happy', '#e8443a'],
  ['perruche',        'Perruche pirate',  'pirates', 'common', '#6cc46a', 'crest', 'none',     'round', 'dot',   '#ffd34d', { beak: '#ffd34d', eyepatch: true }],
  ['squelettepirate', 'Squelette pirate', 'pirates', 'rare',   '#f2ead8', 'none',  'bandana',  'round', 'dot',   '#e8443a', { bigEyes: true, teeth: true, bone: true }],
  ['moussaillonne',   'Moussaillonne',    'pirates', 'rare',   '#c68a5e', 'none',  'bandana',  'round', 'happy', '#3b6fe0', { hair: 'ponytail', hairColor: '#2b2238' }],
  ['reinepirate',     'Reine pirate',     'pirates', 'super',  '#ffe6d8', 'none',  'tricorne', 'round', 'dot',   '#ffd34d', { hair: 'long', hairColor: '#b0303a', eyepatch: true }],

  ['nounours',       'Nounours',        'peluches', 'common', '#c99466', 'bear',    'bow',  'round', 'dot',   '#ff8fb5', { fuzzy: true, stitches: true, muzzle: '#e8c7a0' }],
  ['lapinpeluche',   'Lapin peluche',   'peluches', 'common', '#f4eef6', 'bunny',   'none', 'round', 'happy', null,      { fuzzy: true, stitches: true }],
  ['chiotpeluche',   'Chiot peluche',   'peluches', 'common', '#e8c7a0', 'floppy',  'none', 'round', 'dot',   null,      { fuzzy: true, muzzle: '#fff3e0' }],
  ['mouton',         'Mouton',          'peluches', 'rare',   '#ffffff', 'floppy',  'none', 'round', 'dot',   null,      { fuzzy: true, pattern: 'face', patternColor: '#6b5a60', eyeColor: '#ffffff', florets: '#ffffff' }],
  ['panda',          'Panda',           'peluches', 'rare',   '#ffffff', 'bear',    'none', 'round', 'dot',   null,      { fuzzy: true, pattern: 'bandit', patternColor: '#2b2238', eyeColor: '#ffffff', earColor: '#2b2238' }],
  ['licornepeluche', 'Licorne peluche', 'peluches', 'super',  '#fff4fb', 'unicorn', 'none', 'round', 'happy', null,      { fuzzy: true, mane: '#ffb3e6' }],

  ['herisson',  'Hérisson',  'foret', 'common', '#e8c7a0', 'none',    'none',  'round', 'dot',   null,      { quills: '#8a5a3a' }],
  ['ecureuil',  'Écureuil',  'foret', 'common', '#e0884a', 'tufts',   'seed',  'round', 'happy', null,      { tail: 'squirrel' }],
  ['blaireau',  'Blaireau',  'foret', 'common', '#9a9aa8', 'bear',    'none',  'wide',  'dot',   null,      { pattern: 'marks', patternColor: '#ffffff', muzzle: '#f4f4f4' }],
  ['faon',      'Faon',      'foret', 'rare',   '#d99a5a', 'cat',     'sugar', 'round', 'dot',   '#ffffff', { muzzle: '#f3e2c4' }],
  ['hibou',     'Hibou',     'foret', 'rare',   '#a8845a', 'tufts',   'none',  'round', 'dot',   null,      { bigEyes: true, beak: '#ffb84d', pattern: 'face', patternColor: '#e8d6b8' }],
  ['cerfblanc', 'Cerf blanc', 'foret', 'super', '#f8f6f0', 'antlers', 'none',  'round', 'dot',   null,      { muzzle: '#ffe6ea', glowBody: true }],

  ['trex',    'T-rex',        'dinos', 'common', '#7fcf7a', 'none',  'none', 'round', 'dot',   null, { tail: 'dino', arms: true, teeth: true }],
  ['tricera', 'Tricératops',  'dinos', 'common', '#f0b46a', 'horns', 'none', 'wide',  'happy', null, { frill: '#e8944a', tail: 'dino' }],
  ['stego',   'Stégosaure',   'dinos', 'common', '#9ad0b8', 'none',  'none', 'round', 'dot',   null, { plates: '#ff9a6a', tail: 'dino' }],
  ['ptero',   'Ptérodactyle', 'dinos', 'rare',   '#c9a0e8', 'none',  'none', 'round', 'dot',   null, { wings: '#a87ad0', beak: '#ffcf5c' }],
  ['diplo',   'Diplodocus',   'dinos', 'rare',   '#8fc0e8', 'none',  'none', 'tall',  'happy', null, { tail: 'dino' }],
  ['ankylo',  'Ankylosaure',  'dinos', 'super',  '#c9a87a', 'none',  'none', 'wide',  'dot',   null, { tail: 'dino', plates: '#8a6a4a', pattern: 'patches', patternColor: '#a8885a', patternColor2: '#a8885a' }],

  ['fossiletrex',    'Fossile T-rex',       'fossiles', 'common', '#f2ead8', 'none',  'none', 'round', 'dot', null, { tail: 'dino', teeth: true, bigEyes: true, bone: true }],
  ['fossiletricera', 'Fossile Tricératops', 'fossiles', 'common', '#efe6d0', 'horns', 'none', 'wide',  'dot', null, { frill: '#e6dcc2', bigEyes: true, bone: true }],
  ['fossilestego',   'Fossile Stégosaure',  'fossiles', 'common', '#f2ead8', 'none',  'none', 'round', 'dot', null, { plates: '#e6dcc2', bigEyes: true, bone: true }],
  ['fossileptero',   'Fossile Ptéro',       'fossiles', 'rare',   '#f2ead8', 'none',  'none', 'round', 'dot', null, { wings: '#e6dcc2', beak: '#e6dcc2', bigEyes: true, bone: true }],
  ['fossileraptor',  'Fossile Raptor',      'fossiles', 'rare',   '#efe6d0', 'none',  'none', 'tall',  'dot', null, { teeth: true, bigEyes: true, bone: true, tail: 'dino' }],
  ['fossiledore',    'Fossile doré',        'fossiles', 'super',  '#ffd25a', 'none',  'none', 'round', 'dot', null, { tail: 'dino', teeth: true, bigEyes: true, bone: true, metal: true }],

  ['poneyrose',   'Poney rose',   'poneys', 'common', '#ffd6ea', 'cat',     'none', 'round', 'dot',   null,      { muzzle: '#ffeef6', hair: 'ponytail', hairColor: '#ff8fd8' }],
  ['poneymenthe', 'Poney menthe', 'poneys', 'common', '#d6f5ea', 'cat',     'none', 'round', 'happy', null,      { muzzle: '#f0fff8', hair: 'ponytail', hairColor: '#5fd3a8' }],
  ['poneylilas',  'Poney lilas',  'poneys', 'common', '#e8dcff', 'cat',     'none', 'round', 'dot',   null,      { muzzle: '#f6f0ff', hair: 'ponytail', hairColor: '#9a6ad8' }],
  ['pegase',      'Pégase',       'poneys', 'rare',   '#ffffff', 'cat',     'none', 'round', 'dot',   null,      { muzzle: '#fff4f8', hair: 'ponytail', hairColor: '#7cc8ff', angelwings: true }],
  ['poneyetoile', 'Poney étoile', 'poneys', 'rare',   '#fff1c8', 'cat',     'star', 'round', 'happy', '#ffcf3c', { muzzle: '#fffaf0', hair: 'ponytail', hairColor: '#ffcf3c' }],
  ['licornearc',  'Licorne arc-en-ciel', 'poneys', 'super', '#ffffff', 'unicorn', 'none', 'round', 'happy', null, { muzzle: '#fff4fb', mane: 'rainbow' }],

  ['gecko',       'Gecko',     'reptiles', 'common', '#9ad86a', 'none', 'none', 'wide',  'dot',  null, { bigEyes: true, pattern: 'patches', patternColor: '#ffcf5c', patternColor2: '#ffcf5c' }],
  ['serpent',     'Serpent',   'reptiles', 'common', '#7fcf9a', 'none', 'none', 'round', 'dot',  null, { tongue: true, pattern: 'marks', patternColor: '#5aa878', paws: false }],
  ['cameleon',    'Caméléon',  'reptiles', 'common', '#8fd86a', 'none', 'none', 'round', 'frog', null, { tail: 'curl' }],
  ['iguane',      'Iguane',    'reptiles', 'rare',   '#6abf8a', 'none', 'none', 'wide',  'dot',  null, { spikes: '#4a9a6a' }],
  ['crocodile',   'Crocodile', 'reptiles', 'rare',   '#6a9a5a', 'none', 'none', 'wide',  'dot',  null, { teeth: true, longsnout: '#7aaa6a' }],
  ['cameleonarc', 'Caméléon arc-en-ciel', 'reptiles', 'super', '#c8f0d8', 'none', 'none', 'round', 'frog', null, { tail: 'curl', iridescent: true }],

  ['jardinier',  'Nain jardinier',  'nains', 'common', '#ffe0cc', 'none', 'elfhat',   'round', 'happy', '#e8443a', { beard: '#ffffff', bulbnose: true }],
  ['pecheur',    'Nain pêcheur',    'nains', 'common', '#ffe0cc', 'none', 'elfhat',   'round', 'dot',   '#3b6fe0', { beard: '#f4f4f4', bulbnose: true, rod: true }],
  ['fleurie',    'Naine fleurie',   'nains', 'common', '#ffe6d8', 'none', 'elfhat',   'round', 'happy', '#ff8fb5', { hair: 'long', hairColor: '#ffcf8a', bulbnose: true }],
  ['lecteur',    'Nain lecteur',    'nains', 'rare',   '#ffe0cc', 'none', 'elfhat',   'round', 'dot',   '#6a5acd', { beard: '#ffffff', bulbnose: true, specs: true }],
  ['nainchampi', 'Nain champignon', 'nains', 'rare',   '#ffe0cc', 'none', 'mushroom', 'round', 'happy', '#e8504a', { beard: '#ffffff', bulbnose: true }],
  ['roinains',   'Roi des nains',   'nains', 'super',  '#ffe0cc', 'none', 'crown',    'round', 'dot',   null,      { beard: '#ffffff', bulbnose: true, cape: '#3b6fe0' }],

  ['vache',   'Vache',    'ferme', 'common', '#ffffff', 'horns',  'none', 'wide',  'dot',   null,      { pattern: 'patches', patternColor: '#2b2238', patternColor2: '#2b2238', snout: '#ffb3c9' }],
  ['cochon',  'Cochon',   'ferme', 'common', '#ffc2d1', 'floppy', 'none', 'round', 'happy', null,      { snout: '#ff9fb5' }],
  ['poussin', 'Poussin',  'ferme', 'common', '#ffe066', 'none',   'none', 'mini',  'dot',   null,      { beak: '#ff9a3c' }],
  ['agneau',  'Agneau',   'ferme', 'rare',   '#ffffff', 'floppy', 'none', 'round', 'happy', null,      { fuzzy: true, florets: '#ffffff' }],
  ['ane',     'Âne',      'ferme', 'rare',   '#a9a2b4', 'bunny',  'none', 'round', 'dot',   null,      { muzzle: '#e8e2ec' }],
  ['coqdore', 'Coq doré', 'ferme', 'super',  '#ffd25a', 'crest',  'none', 'round', 'dot',   '#e8443a', { beak: '#ff9a3c', metal: true }],

  ['hamsterdore',  'Hamster doré',  'hamsters', 'common', '#f0b46a', 'bear', 'none',     'wide', 'dot',    null,      { puffcheeks: true, pattern: 'face', patternColor: '#fff3e0' }],
  ['hamsterblanc', 'Hamster blanc', 'hamsters', 'common', '#ffffff', 'bear', 'none',     'wide', 'happy',  null,      { puffcheeks: true }],
  ['hamsterpanda', 'Hamster panda', 'hamsters', 'common', '#ffffff', 'bear', 'none',     'wide', 'dot',    null,      { puffcheeks: true, pattern: 'bandit', patternColor: '#3a3040', earColor: '#3a3040', eyeColor: '#ffffff' }],
  ['grignoteur',   'Grignoteur',    'hamsters', 'rare',   '#e8c7a0', 'bear', 'seed',     'wide', 'happy',  '#4a3a30', { puffcheeks: true }],
  ['dormeur',      'Dormeur',       'hamsters', 'rare',   '#d9d0c8', 'bear', 'nightcap', 'wide', 'sleepy', '#7cc8ff', { puffcheeks: true }],
  ['hamsterroyal', 'Hamster royal', 'hamsters', 'super',  '#f0b46a', 'bear', 'crown',    'wide', 'happy',  null,      { puffcheeks: true, cape: '#b0303a', pattern: 'face', patternColor: '#fff3e0' }],

  // original ghost hunters (no logo / licensed gear)
  ['chasseusementhe', 'Chasseuse menthe',    'chasseuses', 'common', '#ffe0cc', 'none', 'goggles', 'round', 'dot',   '#7fd8c4', { hair: 'ponytail', hairColor: '#c98a4b', pack: '#7fd8c4' }],
  ['chasseuselilas',  'Chasseuse lilas',     'chasseuses', 'common', '#8d5a3b', 'none', 'goggles', 'round', 'happy', '#c3a6ff', { hair: 'buns', hairColor: '#2b2238', pack: '#c3a6ff' }],
  ['chasseusepeche',  'Chasseuse pêche',     'chasseuses', 'common', '#ffe6d8', 'none', 'goggles', 'round', 'dot',   '#ffb38a', { hair: 'bob', hairColor: '#ff8a5c', pack: '#ffb38a' }],
  ['farceur',         'Fantôme farceur',     'chasseuses', 'rare',   '#b8ffb0', 'none', 'none',    'tall',  'happy', null,      { glowBody: true, jelly: true, tongue: true, paws: false }],
  ['capitainechasse', 'Capitaine chasseuse', 'chasseuses', 'rare',   '#c68a5e', 'none', 'cap',     'round', 'dot',   '#5a4a6a', { hair: 'long', hairColor: '#2b2238', pack: '#ffcf5c' }],
  ['fantomeroi',      'Fantôme roi',         'chasseuses', 'super',  '#e8fff0', 'none', 'crown',   'tall',  'dot',   null,      { glowBody: true, jelly: true, paws: false }],

  ['boule',       'Boule vanille', 'glaces', 'common', '#fff3d6', 'none', 'icing',  'round', 'happy',  '#ff8fb5'],
  ['esquimau',    'Esquimau',      'glaces', 'common', '#ffd6e6', 'none', 'icing',  'tall',  'dot',    '#6b3a1a'],
  ['sorbet',      'Sorbet',        'glaces', 'common', '#c8f0a0', 'none', 'none',   'round', 'happy',  null,      { pattern: 'fuzz', patternColor: '#b8e890' }],
  ['coupeglacee', 'Coupe glacée',  'glaces', 'rare',   '#ffd6e6', 'none', 'cherry', 'round', 'happy',  null,      { scoop2: '#fff3d6' }],
  ['mochiglace',  'Mochi glacé',   'glaces', 'rare',   '#ffe0ec', 'none', 'none',   'wide',  'sleepy', null,      { fuzzy: true }],
  ['sundae',      'Sundae royal',  'glaces', 'super',  '#fff3d6', 'none', 'crown',  'round', 'happy',  null,      { scoop2: '#ff8fb5', wafer: '#e0b070' }],

  ['dango',          'Dango',           'brochettes', 'common', '#ffc2d6', 'none', 'none', 'round', 'happy', null, { skewer: ['#ffffff', '#a8d88a'] }],
  ['yakitori',       'Yakitori',        'brochettes', 'common', '#c98a4b', 'none', 'none', 'wide',  'dot',   null, { skewer: ['#b8743c', '#c98a4b'], glaze: true }],
  ['tsukune',        'Tsukune',         'brochettes', 'common', '#8a5a3a', 'none', 'none', 'round', 'happy', null, { skewer: ['#8a5a3a'], glaze: true }],
  ['negima',         'Negima',          'brochettes', 'rare',   '#e8b07a', 'none', 'none', 'wide',  'dot',   null, { skewer: ['#9ad86a', '#e8b07a'] }],
  ['mitarashi',      'Mitarashi',       'brochettes', 'rare',   '#e8c890', 'none', 'none', 'round', 'happy', null, { skewer: ['#e8c890', '#e8c890'], glaze: true }],
  ['brochettedoree', 'Brochette dorée', 'brochettes', 'super',  '#ffd25a', 'none', 'none', 'round', 'happy', null, { skewer: ['#ffd25a', '#ffd25a'], metal: true }],

  ['concombre', 'Concombre', 'crudites', 'common', '#6abf5a', 'none',        'none', 'tall',  'dot',   null, { pattern: 'vstripes', patternColor: '#8fd87a' }],
  ['celeri',    'Céleri',    'crudites', 'common', '#c8eaa0', 'crownleaves', 'none', 'tall',  'happy'],
  ['poivron',   'Poivron',   'crudites', 'common', '#ff5a4a', 'stem',        'none', 'wide',  'dot'],
  ['choufleur', 'Chou-fleur', 'crudites', 'rare',  '#e8f0d8', 'husk',        'none', 'round', 'happy', null, { florets: '#fffaf0' }],
  ['betterave', 'Betterave', 'crudites', 'rare',   '#a8326a', 'leaf',        'none', 'round', 'dot'],
  ['romanesco', 'Romanesco', 'crudites', 'super',  '#a8e07a', 'none',        'none', 'round', 'happy', null, { florets: '#8fd060', quills: '#9ad86a' }],

  ['nuage',      "Nuage d'Or", 'secret', 'secret', '#fff6d6', 'none', 'halo', 'wide', 'happy'],
];

export const CHARS = T.map(([id, name, uni, rarity, body, ears, acc, shape, eyes, accent, x = {}], idx) =>
  ({ id, name, uni, rarity, body, ears, acc, shape, eyes, accent: accent || UNIVERSES[uni].accent, idx, ...x }));
export const BY_ID = Object.fromEntries(CHARS.map((c) => [c.id, c]));

// Blind-box draw by rarity weight; one free reroll on a duplicate keeps the zen pacing kind.
export function roll(owned = []) {
  const once = () => {
    let r = Math.random() * 100, rar = 'common';
    for (const [k, v] of Object.entries(RARITY)) if ((r -= v.weight) < 0) { rar = k; break; }
    const pool = CHARS.filter((c) => c.rarity === rar);
    return pool[(Math.random() * pool.length) | 0];
  };
  const a = once();
  return owned.includes(a.id) ? once() : a;
}

// ---------- geometry (shared) ----------
const G = {
  cap: new RoundedBoxGeometry(0.94, CAP_H, 0.94, 5, 0.16),
  sphere: new THREE.SphereGeometry(1, 32, 20),
  cone: new THREE.ConeGeometry(1, 1, 24),
  capsule: new THREE.CapsuleGeometry(1, 1, 6, 14),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  halo: new THREE.TorusGeometry(0.14, 0.018, 12, 48),
  smile: new THREE.TorusGeometry(0.03, 0.008, 6, 16, Math.PI),
  happy: new THREE.TorusGeometry(0.035, 0.011, 6, 16, Math.PI),
  dome: new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, 0.95),
  mush: new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  crown: new THREE.CylinderGeometry(0.1, 0.11, 0.07, 24, 1, true),
  cape: new THREE.CylinderGeometry(0.26, 0.42, 0.42, 32, 1, true, Math.PI / 2, Math.PI), // back half only
  tiara: new THREE.TorusGeometry(0.1, 0.012, 8, 32, Math.PI),
  slab: new RoundedBoxGeometry(0.5, 0.08, 0.34, 3, 0.035),
  box: new THREE.BoxGeometry(1, 1, 1),
  band: new THREE.CylinderGeometry(1, 1, 1, 32, 1, true),
  wedge: new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12, 1, false, 0, Math.PI / 3),
  ring: new THREE.TorusGeometry(0.05, 0.009, 8, 24),
  collar: new THREE.TorusGeometry(1, 0.1, 10, 40),
  rbox: new RoundedBoxGeometry(2, 2, 2, 4, 0.35), // same half-extents as the unit sphere, so scales/surf stay compatible
  pyr: new THREE.ConeGeometry(1, 1, 4),
  arc: new THREE.TorusGeometry(1, 0.06, 8, 32, Math.PI),
  tri: new THREE.ConeGeometry(1, 1, 3),
  thinRing: new THREE.TorusGeometry(1, 0.035, 8, 40),
  heart: (() => {
    const h = new THREE.Shape();
    h.moveTo(0, -0.05); h.bezierCurveTo(-0.08, 0, -0.045, 0.06, 0, 0.025); h.bezierCurveTo(0.045, 0.06, 0.08, 0, 0, -0.05);
    const g = new THREE.ExtrudeGeometry(h, { depth: 0.01, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 });
    g.center();
    return g;
  })(),
  star: (() => {
    const s = new THREE.Shape();
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + Math.PI / 2, r = k % 2 ? 0.035 : 0.08;
      k ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
    g.center();
    return g;
  })(),
};

const soft = (color, extra = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.6, ...extra,
});
const INK = new THREE.MeshStandardMaterial({ color: '#2b2233', roughness: 0.3 });
const SHINE = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const BLUSH = new THREE.MeshStandardMaterial({ color: '#ff9cb8', roughness: 0.8, transparent: true, opacity: 0.85 });
const GOLD = () => new THREE.MeshPhysicalMaterial({ color: '#ffcc4d', metalness: 0.9, roughness: 0.25, emissive: new THREE.Color('#ffb300'), emissiveIntensity: 0.15 });

// Rarity reads on the cap: pearl (rare), holo (super), gold (secret).
function capMat(def, glow) {
  const m = soft(UNIVERSES[def.uni].cap, { clearcoat: 0.9, clearcoatRoughness: 0.15, roughness: 0.32 });
  if (def.rarity === 'rare') Object.assign(m, { iridescence: 0.6, iridescenceIOR: 1.4, roughness: 0.22 });
  if (def.rarity === 'super') Object.assign(m, { iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [150, 750], roughness: 0.12, metalness: 0.2 });
  if (def.rarity === 'secret') { m.color.set('#ffd25a'); Object.assign(m, { metalness: 0.85, roughness: 0.22, sheen: 0 }); }
  if (def.uni === 'neon') { m.emissive = new THREE.Color(UNIVERSES.neon.accent); m.emissiveIntensity = 0.2; glow.push(m); }
  if (def.uni === 'lueur' || def.rarity === 'secret') { m.emissive = new THREE.Color(m.color); m.emissiveIntensity = 0.22; glow.push(m); }
  return m;
}

function add(parent, geo, mat, { p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0] } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p); m.scale.set(...(s.length ? s : [s, s, s])); m.rotation.set(...r);
  parent.add(m);
  return m;
}

const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
// Point + outward normal on the head ellipsoid, for gluing parts onto its surface.
function surf(head, dx, dy, dz, out = 0) {
  if (head.userData?.box) { // box bodies: project onto the cube face instead of the ellipsoid, so faces sit ON the front
    const v = [dx, dy, dz], ax = v.map(Math.abs), k = ax.indexOf(Math.max(...ax));
    const n = new THREE.Vector3(); n.setComponent(k, Math.sign(v[k]));
    const p = new THREE.Vector3(dx, dy, dz).divideScalar(ax[k]).multiply(head.scale).add(head.position).addScaledVector(n, out * head.scale.getComponent(k));
    return { p, n };
  }
  const d = new THREE.Vector3(dx, dy, dz).normalize();
  const p = d.clone().multiply(head.scale).multiplyScalar(1 + out).add(head.position);
  const n = d.clone().divide(head.scale).normalize();
  return { p, n };
}
function glue(mesh, { p, n }, up = Z) { mesh.position.copy(p); mesh.quaternion.setFromUnitVectors(up, n); return mesh; }

export function buildKey(def) {
  const glow = [], eyes = [];
  const group = new THREE.Group();
  const cap = add(group, G.cap, capMat(def, glow), { p: [0, CAP_H / 2, 0] });
  const char = new THREE.Group(); char.position.y = CAP_H - 0.01; group.add(char);
  const body = def.rarity === 'secret' ? soft(def.body, { metalness: 0.35, roughness: 0.3, emissive: new THREE.Color('#ffcf4a'), emissiveIntensity: 0.12 }) : soft(def.body);
  if (def.rarity === 'secret') glow.push(body);
  if (def.jelly) Object.assign(body, { transparent: true, opacity: 0.8, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0 }); // gummy candy
  if (def.fuzzy) Object.assign(body, { roughness: 0.95, clearcoat: 0, sheen: 1, sheenRoughness: 0.9 }); // plush / cotton
  if (def.iridescent) Object.assign(body, { iridescence: 1, iridescenceIOR: 1.6, roughness: 0.2 });
  if (def.glaze) Object.assign(body, { clearcoat: 1, clearcoatRoughness: 0.08, roughness: 0.15 });
  if (def.metal) Object.assign(body, { metalness: 0.85, roughness: 0.22, sheen: 0, clearcoat: 1 });
  if (def.glowBody) { body.emissive = new THREE.Color(def.body); body.emissiveIntensity = 0.35; glow.push(body); }
  const eyeMat = def.eyeColor ? soft(def.eyeColor, { roughness: 0.15, clearcoat: 1, sheen: 0 }) : INK;
  const pm = def.pattern ? soft(def.patternColor || '#ffffff') : null;
  const NORI = soft('#1f2a22', { roughness: 0.6, sheen: 0.3, side: THREE.DoubleSide });
  const acc = soft(def.accent, { clearcoat: 0.9, roughness: 0.3 });
  const inner = soft('#ffb3c9');

  const SHAPES = { round: [1, 0.88, 0.95], wide: [1.18, 0.78, 1], tall: [0.92, 1.08, 0.92], mini: [0.82, 0.74, 0.8], box: [1.12, 1, 0.95], tower: [0.82, 1.35, 0.8], car: [1.3, 0.62, 0.9], truck: [1.12, 0.95, 1.05] };
  const sc = SHAPES[def.shape].map((v) => v * R), boxy = ['box', 'tower', 'car', 'truck'].includes(def.shape);
  const head = add(char, boxy ? G.rbox : G.sphere, body, { p: [0, sc[1] - 0.02 + (def.wheels ? 0.07 : 0), 0], s: sc });
  head.userData.box = boxy;
  let top = head.position.y + sc[1]; // raised by stacked extras (2nd scoop, skewer) so hats/cherries sit on top

  // paws peeking over the cap edge (not for buildings / vehicles)
  if (def.paws !== false) for (const x of [-1, 1]) add(char, G.sphere, body, { p: [x * 0.12, 0.03, sc[2] * 0.78], s: [0.06, 0.045, 0.06] });

  // face-base patterns go first; eyes are pushed out (fo) so they sit on top
  const fo = { mask: 0.06, face: 0.07, bandit: 0.03 }[def.pattern] || 0;
  if (def.pattern === 'face') glue(add(char, G.sphere, pm, { s: [0.2, 0.17, 0.025] }), surf(head, 0, -0.02, 1, -0.05));
  if (def.pattern === 'mask') glue(add(char, G.sphere, pm, { s: [0.19, 0.14, 0.025] }), surf(head, 0, 0.02, 1, -0.04));
  if (def.muzzle) glue(add(char, G.sphere, soft(def.muzzle), { s: [0.12, 0.08, 0.085] }), surf(head, 0, -0.2, 1, -0.22));
  for (const x of [-1, 1]) {
    if (def.pattern === 'bandit') glue(add(char, G.sphere, pm, { s: [0.085, 0.07, 0.025] }), surf(head, x * 0.33, 0.08, 1, -0.04));
    if (def.eyes === 'frog') {
      const bp = surf(head, x * 0.42, 0.8, 0.4, -0.1).p;
      add(char, G.sphere, body, { p: bp.toArray(), s: [0.085, 0.085, 0.085] });
      const e = add(char, G.sphere, eyeMat, { p: [bp.x, bp.y + 0.01, bp.z + 0.07], s: [0.036, 0.05, 0.022] });
      add(e, G.sphere, SHINE, { p: [-0.35, 0.4, 0.8], s: [0.32, 0.25, 0.3] });
      eyes.push(e);
    } else if (def.eyes === 'dot') {
      const k = def.bigEyes ? 1.5 : 1;
      const e = glue(add(char, G.sphere, eyeMat, { s: [0.036 * k, 0.05 * k, 0.022] }), surf(head, x * 0.33, 0.1, 1, fo));
      add(e, G.sphere, SHINE, { p: [-0.35, 0.4, 0.8], s: [0.32, 0.25, 0.3] });
      e.userData.sy = e.scale.y; eyes.push(e);
    } else if (def.eyes === 'visor') {
      if (x < 0) { // one glowing band across both eyes
        const v = glue(add(char, G.capsule, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.7, clearcoat: 1 }), { s: [0.032, 0.11, 0.02] }), surf(head, 0, 0.12, 1, 0.01));
        v.rotateZ(Math.PI / 2); glow.push(v.material);
      }
    } else {
      const m = glue(add(char, def.eyes === 'happy' ? G.happy : G.cyl, eyeMat, {}), surf(head, x * 0.33, 0.08, 1, 0.01 + fo));
      if (def.eyes === 'sleepy') { m.scale.set(0.011, 0.06, 0.011); m.rotateZ(Math.PI / 2 + x * 0.15); }
    }
    if (!def.bone) glue(add(char, G.sphere, BLUSH, { s: [0.05, 0.028, 0.012] }), surf(head, x * 0.55, -0.12, 0.85, fo));
    if (def.whiskers) for (const k of [-1, 1]) {
      const w = add(char, G.cyl, INK, { s: [0.004, 0.13, 0.004], r: [0, 0, Math.PI / 2 + x * k * 0.14] });
      w.position.copy(surf(head, x * 0.62, -0.2 + k * 0.05, 0.8, 0.02).p); w.position.x += x * 0.05;
    }
  }
  const mouth = glue(add(char, G.smile, INK), surf(head, 0, -0.12, 1, def.muzzle ? 0.07 : 0.01 + fo));
  mouth.rotateZ(Math.PI);
  mouth.visible = !def.beak && !def.trunk && !def.noMouth && !def.beard;
  if (def.beard) glue(add(char, G.sphere, soft(def.beard), { s: [0.17, 0.13, 0.07] }), surf(head, 0, -0.45, 1, -0.12));
  if (def.muzzle || def.whiskers) add(char, G.sphere, soft('#ff8fa8'), { p: surf(head, 0, -0.08, 1, def.muzzle ? 0.08 : 0.02).p.toArray(), s: [0.022, 0.016, 0.016] });
  if (def.beak) add(char, G.cone, soft(def.beak, { clearcoat: 1 }), { p: surf(head, 0, -0.12, 1, 0.14).p.toArray(), s: [0.075, 0.13, 0.045], r: [Math.PI / 2, 0, 0] });
  if (def.nose) add(char, G.cone, soft(new THREE.Color(def.body).multiplyScalar(0.92)), { p: surf(head, 0, -0.02, 1, 0.3).p.toArray(), s: [0.035, 0.2, 0.035], r: [Math.PI / 2, 0, 0] });
  if (def.trunk) add(char, G.capsule, body, { p: surf(head, 0, -0.3, 1, 0.05).p.add(new THREE.Vector3(0, -0.04, 0.05)).toArray(), s: [0.045, 0.1, 0.045], r: [2.21, 0, 0] });
  if (def.fangs) for (const x of [-1, 1]) {
    const f = add(char, G.cone, soft('#ffffff', { sheen: 0 }), { s: [0.018, 0.045, 0.018], r: [Math.PI, 0, 0] });
    f.position.copy(surf(head, x * 0.11, -0.2, 1, 0.03).p);
  }

  // hair: a fringe dome tilted back, plus a style-specific volume
  if (def.hair === 'flat') { // blocky fringe: a slab on box heads, a low dome otherwise
    const hm = soft(def.hairColor, { roughness: 0.5 });
    if (boxy) { add(char, G.box, hm, { p: [0, top - 0.02, -0.01], s: [sc[0] * 2.04, 0.09, sc[2] * 2.04] }); add(char, G.box, hm, { p: [0, top - 0.09, sc[2] + 0.005], s: [sc[0] * 2.04, 0.07, 0.02] }); }
    else add(char, G.dome, hm, { p: head.position.toArray(), s: [sc[0] * 1.06, sc[1] * 0.75, sc[2] * 1.06], r: [-0.2, 0, 0] });
  }
  if (def.hair && def.hair !== 'flat') {
    const hm = soft(def.hairColor, { clearcoat: 0.9, clearcoatRoughness: 0.2, roughness: 0.3 });
    add(char, G.dome, hm, { p: head.position.toArray(), s: sc.map((v) => v * 1.07), r: [-0.32, 0, 0] });
    const hy = head.position.y;
    if (def.hair === 'bob' || def.hair === 'long')
      add(char, G.sphere, hm, { p: [0, hy - 0.03, -0.06], s: [sc[0] * 1.12, sc[1] * 1.02, sc[2] * 0.98] });
    if (def.hair === 'long')
      add(char, G.sphere, hm, { p: [0, hy - sc[1] * 0.55, -sc[2] * 0.5], s: [sc[0] * 1.08, sc[1] * 1.25, sc[2] * 0.62] });
    if (def.hair === 'ponytail') {
      add(char, G.sphere, acc, { p: [0, top - 0.03, -sc[2] * 0.82], s: [0.04, 0.04, 0.04] });
      add(char, G.capsule, hm, { p: [0, hy + 0.06, -sc[2] - 0.1], s: [0.06, 0.14, 0.06], r: [0.55, 0, 0] });
    }
    if (def.hair === 'buns') for (const x of [-1, 1]) {
      const s = surf(head, x * 0.6, 0.78, -0.15, 0.1);
      add(char, G.sphere, hm, { p: s.p.toArray(), s: [0.085, 0.085, 0.085] });
    }
  }
  if (def.cape) {
    const cm = soft(def.cape, { side: THREE.DoubleSide, clearcoat: 0.6 });
    add(char, G.cape, cm, { p: [0, 0.2, 0] });
    for (const x of [-1, 1]) add(char, G.cone, cm, { p: [x * 0.17, 0.42, -0.08], s: [0.07, 0.16, 0.03], r: [0, 0, x * 0.35] }); // stand-up collar
  }

  // body patterns
  const onHead = (dx, dy, dz, geo, s, out = 0, mat = pm) => glue(add(char, geo, mat, { s }), surf(head, dx, dy, dz, out));
  if (def.pattern === 'stripes') {
    for (const dx of [-0.18, 0, 0.18]) onHead(dx, 0.62, 0.75, G.capsule, [0.012, 0.035, 0.01]);
    for (const x of [-1, 1]) for (const k of [0, 1]) onHead(x * 0.9, -0.05 + k * 0.13, 0.35, G.capsule, [0.01, 0.035, 0.01]).rotateZ(Math.PI / 2);
  }
  if (def.pattern === 'patches') {
    const pm2 = soft(def.patternColor2 || def.patternColor);
    onHead(0.55, 0.55, 0.5, G.sphere, [0.11, 0.09, 0.025], -0.02);
    onHead(-0.7, 0.35, 0.25, G.sphere, [0.1, 0.085, 0.025], -0.02, pm2);
    onHead(0.15, 0.8, -0.5, G.sphere, [0.1, 0.08, 0.025], -0.02, pm2);
  }
  if (def.pattern === 'marks') {
    onHead(0, 0.55, 0.8, G.capsule, [0.014, 0.04, 0.01]);
    for (const x of [-1, 1]) for (const k of [0, 1]) onHead(x * 0.78, -0.05 + k * 0.1, 0.6, G.capsule, [0.01, 0.035, 0.01]).rotateZ(Math.PI / 2 + x * 0.3);
  }
  if (def.pattern === 'fuzz') for (let k = 0; k < 34; k++) {
    const a = Math.random() * Math.PI * 2, el = -0.3 + Math.random() * 1.8, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)];
    if (d[2] > 0.55 && Math.abs(d[0]) < 0.6 && d[1] < 0.5) continue; // keep the face clear
    onHead(...d, G.sphere, [0.032, 0.032, 0.032], -0.02);
  }
  if (def.pattern === 'puffs') {
    for (const x of [-1, 1]) add(char, G.sphere, body, { p: [x * sc[0] * 0.9, head.position.y - sc[1] * 0.35, 0], s: [0.13, 0.11, 0.12] });
    add(char, G.sphere, body, { p: [sc[0] * 0.35, top - 0.04, -0.05], s: [0.13, 0.11, 0.12] });
  }
  if (def.pattern === 'vstripes') for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2; if (Math.cos(a) > 0.55) continue; // keep the face clear
    glue(add(char, G.capsule, pm, { s: [0.03, 0.15, 0.008] }), surf(head, Math.sin(a), 0.05, Math.cos(a), -0.015)); // painted on, not sticking out
  }
  if (def.pattern === 'rings') for (const yy of [-0.6, 0.55]) {
    const r = Math.sqrt(1 - yy * yy);
    add(char, G.collar, pm, { p: [0, head.position.y + yy * sc[1], 0], s: [sc[0] * r * 1.02, sc[2] * r * 1.02, 0.45], r: [Math.PI / 2, 0, 0] });
  }
  if (def.pattern === 'cross') for (const x of [-1, 1]) {
    add(char, G.box, pm, { p: [x * (sc[0] + 0.006), head.position.y, 0], s: [0.01, 0.13, 0.045] });
    add(char, G.box, pm, { p: [x * (sc[0] + 0.006), head.position.y, 0], s: [0.01, 0.045, 0.13] });
  }
  if (def.windows) {
    const wm = soft('#bfe4ff', { emissive: new THREE.Color('#fff2b0'), emissiveIntensity: 0.25, clearcoat: 1, roughness: 0.1 });
    const rows = def.shape === 'tower' ? 3 : 2;
    for (const x of [-1, 1]) for (let j = 0; j < rows; j++) for (const k of [-1, 1])
      add(char, G.box, wm, { p: [x * (sc[0] + 0.004), head.position.y + (j - (rows - 1) / 2) * sc[1] * 0.55, k * sc[2] * 0.42], s: [0.01, 0.075, 0.075] });
    if (def.shape === 'tower') for (const k of [-1, 0, 1]) add(char, G.box, wm, { p: [k * sc[0] * 0.5, head.position.y + sc[1] * 0.68, sc[2] + 0.004], s: [0.07, 0.07, 0.01] });
  }
  if (def.wheels) {
    const tire = soft('#2b2b33', { roughness: 0.8, sheen: 0 }), hub = soft('#e8e8ee', { metalness: 0.6, roughness: 0.3 });
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      add(char, G.cyl, tire, { p: [x * sc[0] * 0.98, 0.085, z * sc[2] * 0.6], s: [0.085, 0.07, 0.085], r: [0, 0, Math.PI / 2] }); // flush with the sides so they show
      add(char, G.sphere, hub, { p: [x * (sc[0] * 0.98 + 0.036), 0.085, z * sc[2] * 0.6], s: [0.01, 0.04, 0.04] });
    }
    const hl = soft('#fff6c8', { emissive: new THREE.Color('#fff2a0'), emissiveIntensity: 0.6 });
    for (const x of [-1, 1]) glue(add(char, G.sphere, hl, { s: [0.035, 0.03, 0.012] }), surf(head, x * 0.72, -0.5, 1, 0.01));
    if (def.shape === 'truck') add(char, G.box, soft('#cfeeff', { clearcoat: 1, roughness: 0.05 }), { p: [0, head.position.y + sc[1] * 0.5, sc[2] + 0.006], s: [sc[0] * 1.6, sc[1] * 0.45, 0.01] });
    if (def.shape === 'car') add(char, G.box, soft('#cfeeff', { clearcoat: 1, roughness: 0.05 }), { p: [0, top - 0.005, sc[2] * 0.35], s: [sc[0] * 1.5, 0.012, sc[2] * 0.6] });
  }
  if (def.wings) for (const x of [-1, 1]) {
    const wm = soft(def.wings);
    for (const [k, sz] of [[0, 1], [1, 0.7]]) add(char, G.cone, wm, { p: [x * (0.24 + k * 0.06), 0.32 - k * 0.05, -0.14], s: [0.11 * sz, 0.24 * sz, 0.022], r: [0, x * 0.5, -x * (0.9 + k * 0.5)] });
  }
  if (def.spikes) for (const dy of [0.85, 0.45, 0.05]) glue(add(char, G.cone, soft(def.spikes), { s: [0.035, 0.07, 0.035] }), surf(head, 0, dy, -1, -0.05), Y);
  if (def.tips) for (const x of [-1, 1]) add(char, G.cone, body, { p: [x * (sc[0] + 0.015), head.position.y, 0], s: [0.045, 0.07, 0.045], r: [0, 0, -x * Math.PI / 2] });
  if (def.florets) {
    const fm = soft(def.florets, { roughness: 0.8 });
    add(char, G.sphere, fm, { p: [0, top + 0.03, -0.01], s: [0.12, 0.1, 0.12] });
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; add(char, G.sphere, fm, { p: [Math.cos(a) * 0.14, top - 0.03, Math.sin(a) * 0.12 - 0.02], s: [0.1, 0.085, 0.1] }); }
  }
  if (def.shell) {
    const shm = soft(def.shell, { clearcoat: 1, roughness: 0.25 }), ss = [sc[0] * 1.45, sc[1] * 1.05, sc[2] * 1.3];
    add(char, G.mush, shm, { p: [0, 0.02, -sc[2] * 0.55], s: ss });
    const proxy = { position: new THREE.Vector3(0, 0.02, -sc[2] * 0.55), scale: new THREE.Vector3(...ss) };
    const cols = def.scutes || [new THREE.Color(def.shell).multiplyScalar(0.78)];
    [[0, 1, -0.2], [0.65, 0.6, -0.45], [-0.65, 0.6, -0.45], [0.35, 0.35, -0.95], [-0.35, 0.35, -0.95]].forEach((d, k) =>
      glue(add(char, G.sphere, soft(cols[k % cols.length]), { s: [0.075, 0.065, 0.02] }), surf(proxy, ...d, -0.01)));
    if (def.flippers) for (const x of [-1, 1]) add(char, G.sphere, body, { p: [x * sc[0] * 1.05, 0.05, sc[2] * 0.25], s: [0.13, 0.025, 0.06], r: [0, x * 0.4, -x * 0.25] });
  }
  // ---- extras (sets 24+) ----
  const ex = (c, o = {}) => soft(c, o);
  if (def.flippers && !def.shell) for (const x of [-1, 1]) add(char, G.sphere, body, { p: [x * sc[0] * 1.05, 0.05, sc[2] * 0.25], s: [0.13, 0.025, 0.06], r: [0, x * 0.4, -x * 0.25] });
  if (def.bands) { const bm = ex(def.bands, { roughness: 0.8 }); for (const yy of [-0.6, -0.32, 0.45, 0.72]) { const r = Math.sqrt(1 - yy * yy); add(char, G.collar, bm, { p: [0, head.position.y + yy * sc[1], 0], s: [sc[0] * r * 1.02, sc[2] * r * 1.02, 0.9], r: [Math.PI / 2 + (yy * 7 % 0.2), 0, 0] }); } }
  if (def.bolts) for (const x of [-1, 1]) add(char, G.cyl, ex('#b8c0cc', { metalness: 0.7, roughness: 0.3 }), { p: [x * (sc[0] + 0.025), head.position.y - sc[1] * 0.45, 0], s: [0.032, 0.06, 0.032], r: [0, 0, Math.PI / 2] });
  if (def.candy) for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2; if (Math.cos(a) > 0.5) continue;
    glue(add(char, G.capsule, ex(def.candy[k % def.candy.length], { clearcoat: 1 }), { s: [0.03, 0.16, 0.008] }), surf(head, Math.sin(a), 0.05, Math.cos(a), -0.012)).rotateZ(0.5);
  }
  if (def.twists) for (const x of [-1, 1]) {
    add(char, G.cone, ex(def.twists, { clearcoat: 1 }), { p: [x * (sc[0] + 0.075), head.position.y, 0], s: [0.08, 0.13, 0.025], r: [0, 0, x * Math.PI / 2] });
    add(char, G.sphere, ex(def.twists), { p: [x * (sc[0] + 0.01), head.position.y, 0], s: [0.03, 0.04, 0.04] });
  }
  if (def.chain) add(char, G.collar, GOLD(), { p: [0, 0.06, 0], s: [sc[0] * 0.8, sc[2] * 0.8, 0.35], r: [Math.PI / 2, 0, 0] });
  if (def.tentacles) {
    const thin = def.tentacles === 'thin';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.5, g = new THREE.Group(); g.position.set(Math.cos(a) * sc[0] * 0.75, 0.04, Math.sin(a) * sc[2] * 0.75); g.rotation.y = -a; char.add(g);
      add(g, G.capsule, body, { p: [0.07, 0, 0], s: thin ? [0.018, 0.09, 0.018] : [0.035, 0.07, 0.035], r: [0, 0, -Math.PI / 2 + 0.25] });
      add(g, G.sphere, body, { p: [0.15, 0.03, 0], s: thin ? [0.02, 0.02, 0.02] : [0.035, 0.035, 0.035] });
    }
  }
  if (def.claws) for (const x of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(x * (sc[0] + 0.06), 0.12, 0.08); g.rotation.z = -x * 0.5; char.add(g);
    add(g, G.capsule, body, { p: [0, 0.04, 0], s: [0.03, 0.05, 0.03] });
    for (const k of [-1, 1]) add(g, G.cone, body, { p: [k * 0.025, 0.13, 0], s: [0.03, 0.08, 0.025], r: [0, 0, k * 0.35] });
  }
  if (def.spout) {
    const wm = ex('#bfe9ff', { transparent: true, opacity: 0.85, clearcoat: 1, roughness: 0.05 });
    add(char, G.cyl, wm, { p: [0, top + 0.06, 0], s: [0.018, 0.12, 0.018] });
    for (const [x, y] of [[0, 0.15], [-0.05, 0.13], [0.05, 0.13]]) add(char, G.sphere, wm, { p: [x, top + y, 0], s: [0.03, 0.03, 0.03] });
  }
  if (def.ring) add(char, G.collar, ex(def.ring, { clearcoat: 1 }), { p: head.position.toArray(), s: [sc[0] * 1.65, sc[2] * 1.65, 0.3], r: [Math.PI / 2 - 0.35, 0, 0.15] });
  if (def.rays) for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, m = add(char, G.cone, ex(def.rays, { emissive: new THREE.Color(def.rays), emissiveIntensity: 0.5 }), { p: [Math.cos(a) * sc[0] * 1.18, head.position.y + Math.sin(a) * sc[1] * 1.18, -0.06], s: [0.045, 0.1, 0.03], r: [0, 0, a - Math.PI / 2] });
    glow.push(m.material);
  }
  if (def.pixels) for (let k = 0; k < 15; k++) { // voxel-ish speckles on the top and side faces
    const c = new THREE.Color(def.pixels).offsetHSL(0, 0, ((k * 37) % 10) / 60 - 0.08), m = ex(c, { roughness: 0.6 });
    const u = (((k * 53) % 17) / 17) * 1.6 - 0.8, v = (((k * 29) % 13) / 13) * 1.6 - 0.8, f = k % 3;
    if (f === 0) add(char, G.box, m, { p: [u * sc[0], top + 0.003, v * sc[2]], s: [0.055, 0.008, 0.055] });
    else add(char, G.box, m, { p: [(f === 1 ? -1 : 1) * (sc[0] + 0.003), head.position.y + v * sc[1], u * sc[2]], s: [0.008, 0.055, 0.055] });
  }
  if (def.bolt) [[0.12, 0.36, 0.5], [0.08, 0.25, -0.6], [0.12, 0.14, 0.5]].forEach(([dx, y, rz]) => {
    const m = add(char, G.box, ex('#ffe066', { emissive: new THREE.Color('#ffd21a'), emissiveIntensity: 0.6 }), { p: [sc[0] + dx, y, 0.05], s: [0.03, 0.13, 0.02], r: [0, 0, rz] }); glow.push(m.material);
  });
  if (def.trident) {
    const g = GOLD();
    add(char, G.cyl, g, { p: [sc[0] + 0.1, 0.27, 0.04], s: [0.01, 0.5, 0.01] });
    add(char, G.box, g, { p: [sc[0] + 0.1, 0.5, 0.04], s: [0.09, 0.012, 0.012] });
    for (const dx of [-0.04, 0, 0.04]) add(char, G.cone, g, { p: [sc[0] + 0.1 + dx, 0.55, 0.04], s: [0.012, 0.07, 0.012] });
  }
  if (def.baguette) add(char, G.capsule, ex('#e0a860', { roughness: 0.6 }), { p: [sc[0] + 0.05, 0.16, 0.05], s: [0.035, 0.22, 0.035], r: [0.2, 0, -0.6] });
  if (def.truckLights) {
    const cols = def.truckLights === 'rainbow' ? ['#ff6a6a', '#ffcf5c', '#8ee28a', '#7cc8ff', '#c69cff'] : [def.truckLights];
    for (let k = 0; k < 9; k++) {
      const c = cols[k % cols.length], m = add(char, G.sphere, ex(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.7 }), { p: [(k / 8 - 0.5) * sc[0] * 1.9, top + 0.015, sc[2] * 0.9], s: [0.018, 0.018, 0.018] });
      glow.push(m.material);
    }
    for (const x of [-1, 1]) for (let k = 0; k < 4; k++) { const c = cols[(k + 2) % cols.length], m = add(char, G.sphere, ex(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.7 }), { p: [x * (sc[0] + 0.006), head.position.y - sc[1] * 0.55, (k / 3 - 0.5) * sc[2] * 1.5], s: [0.016, 0.016, 0.016] }); glow.push(m.material); }
  }
  if (def.underglow) { const m = add(char, G.box, ex(def.underglow, { emissive: new THREE.Color(def.underglow), emissiveIntensity: 0.9, transparent: true, opacity: 0.75 }), { p: [0, 0.02, 0], s: [sc[0] * 2.3, 0.008, sc[2] * 2.15] }); glow.push(m.material); }
  if (def.racing) for (const x of [-1, 1]) add(char, G.box, ex(def.racing), { p: [x * 0.035, top + 0.002, 0], s: [0.03, 0.005, sc[2] * 2.02] });
  if (def.eyepatch) {
    glue(add(char, G.sphere, ex('#2b2238'), { s: [0.06, 0.055, 0.012] }), surf(head, 0.33, 0.12, 1, 0.06));
    add(char, G.collar, ex('#2b2238'), { p: [0, head.position.y + sc[1] * 0.2, 0], s: [sc[0] * 1.02, sc[2] * 1.02, 0.12], r: [Math.PI / 2 - 0.35, 0, -0.35] });
  }
  if (def.teeth) for (const dx of [-0.08, 0, 0.08]) { const f = add(char, G.cone, ex('#ffffff', { sheen: 0 }), { s: [0.016, 0.032, 0.016], r: [Math.PI, 0, 0] }); f.position.copy(surf(head, dx, -0.2, 1, 0.03).p); }
  if (def.bone) for (const x of [-1, 1]) glue(add(char, G.sphere, ex('#3a3040'), { s: [0.013, 0.02, 0.008] }), surf(head, x * 0.07, -0.05, 1, 0.01));
  if (def.stitches) {
    for (let k = 0; k < 4; k++) glue(add(char, G.capsule, ex('#7a5a6a'), { s: [0.006, 0.016, 0.004] }), surf(head, 0, 0.45 + k * 0.13, 1 - k * 0.18, 0.005)).rotateZ(Math.PI / 2);
    glue(add(char, G.sphere, ex('#ffd6e6', { roughness: 0.9 }), { s: [0.05, 0.05, 0.01] }), surf(head, -0.6, 0.45, 0.55, 0.01));
  }
  if (def.quills) for (let k = 0; k < 34; k++) {
    const a = k * 2.399, el = -0.2 + ((k * 0.618) % 1) * 1.6, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)];
    if (d[2] > 0.35 && d[1] < 0.55) continue; // face stays clear
    const sp = surf(head, ...d, -0.05), m = glue(add(char, G.cone, ex(def.quills), { s: [0.022, 0.08, 0.022] }), sp, Y); m.position.addScaledVector(sp.n, 0.035);
  }
  if (def.tail === 'squirrel') {
    add(char, G.sphere, body, { p: [0, 0.2, -sc[2] - 0.08], s: [0.12, 0.17, 0.1] });
    add(char, G.sphere, body, { p: [0, 0.42, -sc[2] - 0.02], s: [0.11, 0.1, 0.09] });
    add(char, G.sphere, soft(new THREE.Color(def.body).lerp(new THREE.Color('#ffffff'), 0.4)), { p: [0, 0.47, sc[2] * -0.85], s: [0.06, 0.05, 0.05] });
  }
  if (def.arms) for (const x of [-1, 1]) add(char, G.capsule, body, { p: [x * sc[0] * 0.5, head.position.y - sc[1] * 0.4, sc[2] * 0.85], s: [0.02, 0.035, 0.02], r: [0.9, 0, x * 0.3] });
  if (def.frill) add(char, G.sphere, ex(def.frill), { p: [0, head.position.y + 0.05, -sc[2] * 0.5], s: [sc[0] * 1.5, sc[1] * 1.35, 0.04] });
  if (def.plates) for (const dy of [0.9, 0.55, 0.15, -0.25]) glue(add(char, G.cone, ex(def.plates), { s: [0.015, 0.11, 0.07] }), surf(head, 0, dy, -1, -0.05), Y);
  if (def.angelwings) for (const x of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(x * sc[0] * 0.75, head.position.y, -sc[2] * 0.55); g.rotation.set(0, x * 0.5, -x * 0.35); char.add(g);
    for (let k = 0; k < 4; k++) add(g, G.capsule, soft('#ffffff'), { p: [x * (0.04 + k * 0.035), 0.04 - k * 0.02, -k * 0.012], s: [0.028, 0.09 + k * 0.02, 0.014], r: [0, 0, -x * (0.25 + k * 0.28)] });
  }
  if (def.tongue) { const t = add(char, G.capsule, ex('#ff5a7a'), { s: [0.016, 0.03, 0.008], r: [Math.PI / 2 + 0.5, 0, 0] }); t.position.copy(surf(head, 0, -0.2, 1, 0.08).p); }
  if (def.tail === 'curl') for (let k = 0; k < 7; k++) { const a = k * 0.95, r = 0.1 - k * 0.011; add(char, G.sphere, body, { p: [0, 0.13 + Math.sin(a) * r, -sc[2] - 0.08 - Math.cos(a) * r], s: Array(3).fill(0.042 - k * 0.004) }); }
  if (def.longsnout) {
    add(char, G.sphere, ex(def.longsnout), { p: [0, head.position.y - sc[1] * 0.3, sc[2] * 0.85], s: [0.12, 0.065, 0.15] });
    for (const x of [-1, 1]) add(char, G.sphere, ex('#2b2238'), { p: [x * 0.03, head.position.y - sc[1] * 0.3 + 0.06, sc[2] * 0.85 + 0.12], s: [0.012, 0.008, 0.012] });
  }
  if (def.bulbnose) add(char, G.sphere, ex('#ffb08a', { clearcoat: 1 }), { p: surf(head, 0, -0.08, 1, 0.06).p.toArray(), s: [0.045, 0.04, 0.04] });
  if (def.specs) {
    for (const x of [-1, 1]) glue(add(char, G.ring, INK), surf(head, x * 0.33, 0.1, 1, 0.09 + fo));
    add(char, G.cyl, INK, { p: surf(head, 0, 0.12, 1, 0.1 + fo).p.toArray(), s: [0.006, 0.07, 0.006], r: [0, 0, Math.PI / 2] });
  }
  if (def.rod) {
    const g = new THREE.Group(); g.position.set(sc[0] + 0.06, 0.08, 0.1); g.rotation.set(0.5, 0, -0.3); char.add(g);
    add(g, G.cyl, ex('#8a5a3a'), { p: [0, 0.22, 0], s: [0.008, 0.44, 0.008] });
    add(g, G.sphere, ex('#e8443a', { clearcoat: 1 }), { p: [0, 0.45, 0], s: [0.025, 0.025, 0.025] });
  }
  if (def.snout) {
    glue(add(char, G.sphere, ex(def.snout), { s: [0.1, 0.065, 0.05] }), surf(head, 0, -0.25, 1, -0.15));
    for (const x of [-1, 1]) glue(add(char, G.sphere, ex('#7a4a5a'), { s: [0.014, 0.018, 0.008] }), surf(head, x * 0.09, -0.25, 1, 0.04));
  }
  if (def.puffcheeks) for (const x of [-1, 1]) add(char, G.sphere, soft(new THREE.Color(def.body).lerp(new THREE.Color('#ffffff'), 0.35)), { p: surf(head, x * 0.62, -0.25, 0.7, -0.12).p.toArray(), s: [0.1, 0.085, 0.09] });
  if (def.pack) {
    add(char, G.rbox, ex(def.pack), { p: [0, 0.22, -sc[2] - 0.05], s: [0.11, 0.13, 0.065] });
    add(char, G.capsule, ex('#5a4a6a'), { p: [sc[0] * 0.85, 0.14, -sc[2] * 0.4], s: [0.018, 0.12, 0.018], r: [0.9, 0, 0.3] });
  }
  if (def.scoop2) {
    const r = [sc[0] * 0.75, sc[1] * 0.72, sc[2] * 0.75];
    add(char, G.sphere, soft(def.scoop2, { clearcoat: 0.6 }), { p: [0, top + r[1] * 0.75, -0.02], s: r });
    top += r[1] * 1.5;
  }
  if (def.wafer) add(char, G.box, ex(def.wafer, { roughness: 0.7 }), { p: [sc[0] * 0.55, top - 0.02, -0.05], s: [0.035, 0.15, 0.09], r: [0, 0, -0.4] });
  if (def.skewer) {
    const r = R * 0.68; let y = top;
    def.skewer.forEach((c) => { add(char, G.sphere, soft(c, def.glaze ? { clearcoat: 1, roughness: 0.12 } : {}), { p: [0, y + r * 0.9, 0], s: [r * 1.05, r * 0.92, r] }); y += r * 1.8; });
    add(char, G.cyl, ex('#d9b07a', { roughness: 0.8 }), { p: [0, (top + y) / 2 + 0.04, 0], s: [0.009, y - top + 0.12, 0.009] });
    top = y;
  }
  if (def.tail === 'dino') add(char, G.cone, body, { p: [0.04, 0.08, -sc[2] - 0.12], s: [0.09, 0.3, 0.09], r: [-1.35, 0.2, 0] });
  if (def.mane) {
    const manes = def.mane === 'rainbow' ? ['#ff8a8a', '#ffcf5c', '#8ee28a', '#7cc8ff', '#c69cff'] : [def.mane];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      add(char, G.sphere, soft(manes[k % manes.length]), { p: [Math.cos(a) * sc[0] * 1.05, head.position.y + Math.sin(a) * sc[1] * 1.05, -0.08], s: [0.085, 0.085, 0.06] });
    }
  }
  if (def.tail === 'mouse') {
    const tm = soft('#ffb3c9');
    add(char, G.capsule, tm, { p: [0.12, 0.04, -sc[2] * 0.85], s: [0.014, 0.1, 0.014], r: [0, 0, Math.PI / 2] });
    add(char, G.capsule, tm, { p: [0.25, 0.11, -sc[2] * 0.85], s: [0.014, 0.07, 0.014], r: [0, 0, -0.4] });
  }
  if (def.tail === 'fox') {
    const n = def.tails || 1;
    for (let i = 0; i < n; i++) {
      const tg = new THREE.Group(); tg.position.set(0, 0.08, -sc[2] * 0.75); tg.rotation.set(-1.15, 0, -(i - (n - 1) / 2) * 0.7); char.add(tg);
      add(tg, G.capsule, body, { p: [0, 0.16, 0], s: [0.065, 0.13, 0.06] });
      add(tg, G.sphere, soft(def.patternColor2 || '#ffffff'), { p: [0, 0.31, 0], s: [0.05, 0.05, 0.05] });
    }
  }

  // ears / top features
  const E = def.ears;
  for (const x of [-1, 1]) {
    if (E === 'cat') {
      const s = surf(head, x * 0.6, 0.85, 0.05, -0.08);
      const c = glue(add(char, G.cone, body, { s: [0.085, 0.17, 0.085] }), s, Y); c.position.addScaledVector(s.n, 0.07);
      const ci = glue(add(char, G.cone, inner, { s: [0.05, 0.11, 0.03] }), s, Y); ci.position.addScaledVector(s.n, 0.06); ci.position.z += 0.035;
    } else if (E === 'bear') {
      const s = surf(head, x * 0.68, 0.74, 0, -0.05);
      glue(add(char, G.sphere, def.earColor ? soft(def.earColor) : body, { s: [0.085, 0.085, 0.055] }), s, Y);
      const bi = glue(add(char, G.sphere, inner, { s: [0.05, 0.05, 0.02] }), s, Y); bi.position.z += 0.04;
    } else if (E === 'bunny') {
      const s = surf(head, x * 0.28, 0.96, 0, -0.1);
      const b = glue(add(char, G.capsule, body, { s: [0.05, 0.13, 0.04] }), s, Y); b.position.addScaledVector(s.n, 0.13); b.rotateZ(-x * 0.12);
      const bi = glue(add(char, G.capsule, inner, { s: [0.028, 0.09, 0.02] }), s, Y); bi.position.addScaledVector(s.n, 0.13); bi.position.z += 0.025; bi.rotateZ(-x * 0.12);
    } else if (E === 'horns') {
      const s = surf(head, x * 0.45, 0.9, 0.1, -0.05);
      const h = glue(add(char, G.cone, GOLD(), { s: [0.04, 0.13, 0.04] }), s, Y); h.position.addScaledVector(s.n, 0.05);
    } else if (E === 'batwings') {
      const s = surf(head, x * 0.92, 0.38, -0.1, -0.05);
      const wm = soft(new THREE.Color(def.body).multiplyScalar(0.7));
      for (const [k, sz] of [[0, 1], [1, 0.7]]) {
        const w = add(char, G.cone, wm, { s: [0.1 * sz, 0.22 * sz, 0.022] });
        w.position.copy(s.p).add(new THREE.Vector3(x * (0.1 + k * 0.05), 0.04 - k * 0.07, 0));
        w.rotation.z = -x * (1.0 + k * 0.5);
      }
    } else if (E === 'floppy') {
      const s = surf(head, x * 0.95, 0.35, 0, -0.04);
      add(char, G.capsule, soft(new THREE.Color(def.body).multiplyScalar(0.72)), { p: [s.p.x + x * 0.02, s.p.y - 0.09, s.p.z], s: [0.055, 0.09, 0.035], r: [0, 0, x * 0.25] });
    } else if (E === 'mouse') {
      // big round discs standing upright, facing forward (not glued to the normal, which tilted them like cat ears)
      const s = surf(head, x * 0.62, 0.75, 0, 0.1);
      add(char, G.sphere, body, { p: s.p.toArray(), s: [0.15, 0.15, 0.035], r: [0, -x * 0.25, -x * 0.3] });
      add(char, G.sphere, inner, { p: [s.p.x, s.p.y, s.p.z + 0.025], s: [0.1, 0.1, 0.015], r: [0, -x * 0.25, -x * 0.3] });
    } else if (E === 'elephant') {
      const s = surf(head, x * 0.98, 0.2, -0.1, -0.08);
      add(char, G.sphere, body, { p: [s.p.x + x * 0.04, s.p.y, s.p.z], s: [0.04, 0.17, 0.16], r: [0, x * 0.4, 0] });
      add(char, G.sphere, inner, { p: [s.p.x + x * 0.055, s.p.y, s.p.z + 0.03], s: [0.02, 0.11, 0.1], r: [0, x * 0.4, 0] });
    } else if (E === 'fox') {
      const s = surf(head, x * 0.55, 0.85, 0.05, -0.08);
      const c = glue(add(char, G.cone, body, { s: [0.08, 0.2, 0.06] }), s, Y); c.position.addScaledVector(s.n, 0.08);
      const ci = glue(add(char, G.cone, inner, { s: [0.045, 0.13, 0.02] }), s, Y); ci.position.addScaledVector(s.n, 0.07); ci.position.z += 0.03;
    } else if (E === 'monkey') {
      const s = surf(head, x, 0.1, 0, -0.05);
      add(char, G.sphere, body, { p: s.p.toArray(), s: [0.04, 0.075, 0.075] });
      add(char, G.sphere, soft(def.patternColor || '#f3d2b0'), { p: [s.p.x + x * 0.02, s.p.y, s.p.z + 0.01], s: [0.02, 0.05, 0.05] });
    } else if (E === 'antennae') {
      add(char, G.cyl, INK, { p: [x * 0.06, top + 0.05, 0.02], s: [0.007, 0.12, 0.007], r: [0, 0, -x * 0.35] });
      const b = add(char, G.sphere, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.6 }), { p: [x * 0.1, top + 0.11, 0.02], s: [0.035, 0.035, 0.035] });
      glow.push(b.material);
    } else if (E === 'elf') {
      const s = surf(head, x, 0.15, 0, -0.05);
      add(char, G.cone, body, { p: [s.p.x + x * 0.05, s.p.y + 0.02, s.p.z], s: [0.045, 0.15, 0.035], r: [0, 0, -x * (Math.PI / 2 - 0.35)] });
    } else if (E === 'antlers') {
      const s = surf(head, x * 0.45, 0.9, 0, -0.05), am = soft('#8a5a3a');
      const g = new THREE.Group(); g.position.copy(s.p); g.rotation.z = -x * 0.35; char.add(g);
      add(g, G.cyl, am, { p: [0, 0.08, 0], s: [0.014, 0.16, 0.014] });
      add(g, G.cyl, am, { p: [x * 0.035, 0.09, 0], s: [0.011, 0.08, 0.011], r: [0, 0, -x * 0.9] });
      add(g, G.cyl, am, { p: [-x * 0.025, 0.13, 0], s: [0.009, 0.06, 0.009], r: [0, 0, x * 0.9] });
    } else if (E === 'husk') {
      add(char, G.sphere, soft('#8fd06a'), { p: [x * sc[0] * 0.85, head.position.y - 0.02, -0.03], s: [0.06, 0.22, 0.03], r: [0, x * 0.3, -x * 0.3] });
    } else if (E === 'featherwings') {
      const g = new THREE.Group(); g.position.copy(surf(head, x * 0.95, 0.45, -0.1, -0.02).p); g.rotation.z = -x * 0.7; char.add(g);
      for (let k = 0; k < 3; k++) add(g, G.capsule, soft('#ffffff'), { p: [x * (0.03 + k * 0.025), 0.03 + k * 0.012, -k * 0.01], s: [0.018, 0.06 - k * 0.012, 0.01], r: [0, 0, -x * (0.3 + k * 0.35)] });
    } else if (E === 'tufts') {
      const s = surf(head, x * 0.78, 0.62, 0, -0.06);
      const t = glue(add(char, G.cone, soft(new THREE.Color(def.body).multiplyScalar(0.8)), { s: [0.06, 0.13, 0.05] }), s, Y); t.position.addScaledVector(s.n, 0.05);
    }
  }
  const leafMat = soft('#6cc46a', { clearcoat: 0.9 });
  if (E === 'leaf') {
    add(char, G.cyl, leafMat, { p: [0, top + 0.03, 0], s: [0.012, 0.08, 0.012] });
    for (const x of [-1, 1]) add(char, G.sphere, leafMat, { p: [x * 0.06, top + 0.07, 0], s: [0.07, 0.016, 0.04], r: [0, 0, x * 0.5] });
  }
  if (E === 'fin') add(char, G.cone, soft(new THREE.Color(def.body).multiplyScalar(0.8), { clearcoat: 1 }), { p: [0, top + 0.08, -0.02], s: [0.03, 0.2, 0.12] });
  if (E === 'radar') {
    add(char, G.cyl, INK, { p: [sc[0] * 0.45, top + 0.05, 0], s: [0.008, 0.1, 0.008] });
    add(char, G.mush, soft(def.accent, { clearcoat: 1, side: THREE.DoubleSide }), { p: [sc[0] * 0.45, top + 0.11, 0], s: [0.07, 0.035, 0.07], r: [-0.6, 0, 0.3] });
  }
  if (E === 'stem') {
    add(char, G.cyl, soft('#7a4a2a'), { p: [0, top + 0.03, 0], s: [0.012, 0.07, 0.012], r: [0, 0, 0.15] });
    add(char, G.sphere, soft('#6cc46a', { clearcoat: 0.9 }), { p: [0.05, top + 0.05, 0], s: [0.06, 0.014, 0.035], r: [0, 0, -0.5] });
  }
  if (E === 'crownleaves') for (let k = 0; k < 7; k++) {
    const a = (k - 3) * 0.32;
    add(char, G.cone, soft('#3f9a4a', { clearcoat: 0.8 }), { p: [Math.sin(a) * 0.06, top + 0.08, (k % 2 ? -0.03 : 0.02)], s: [0.035, 0.2 - Math.abs(k - 3) * 0.025, 0.02], r: [0, 0, -a] });
  }
  if (E === 'crest') for (const k of [-1, 0, 1])
    add(char, G.cone, soft(k ? def.accent : '#5cb8ff', { clearcoat: 1 }), { p: [k * 0.05, top + 0.05, -0.04], s: [0.035, 0.13, 0.03], r: [-0.35, 0, -k * 0.4] });
  if (E === 'droptip') add(char, G.cone, body, { p: [0, top + 0.03, 0], s: [0.14, 0.2, 0.14] });
  if (E === 'unicorn') {
    const h = add(char, G.cone, soft('#ffe9a8', { clearcoat: 1, roughness: 0.2, iridescence: 0.6 }), { p: [0, top + 0.08, 0.06], s: [0.04, 0.2, 0.04], r: [0.3, 0, 0] });
    h.castShadow = true;
  }
  if (E === 'antenna') {
    add(char, G.cyl, INK, { p: [0, top + 0.06, 0], s: [0.008, 0.13, 0.008] });
    const ball = add(char, G.sphere, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.5 }), { p: [0, top + 0.14, 0], s: [0.04, 0.04, 0.04] });
    glow.push(ball.material);
  }

  // accessory
  const A = def.acc;
  if (A === 'bow') {
    const s = surf(head, 0.55, 0.8, 0.35);
    const b = new THREE.Group(); glue(b, s, Y); char.add(b);
    for (const x of [-1, 1]) add(b, G.cone, acc, { p: [x * 0.055, 0.01, 0], s: [0.05, 0.1, 0.03], r: [0, 0, x * Math.PI / 2] });
    add(b, G.sphere, acc, { p: [0, 0.01, 0], s: [0.03, 0.03, 0.03] });
    b.rotateY(0.6);
  } else if (A === 'cherry') {
    add(char, G.sphere, soft('#e8384f', { clearcoat: 1, roughness: 0.15 }), { p: [0.05, top + 0.04, 0.02], s: [0.06, 0.06, 0.06] });
    add(char, G.cyl, leafMat, { p: [0.07, top + 0.13, 0.02], s: [0.008, 0.1, 0.008], r: [0, 0, -0.4] });
  } else if (A === 'flower') {
    const f = new THREE.Group(); glue(f, surf(head, -0.55, 0.72, 0.35)); char.add(f);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      add(f, G.sphere, soft('#ffffff'), { p: [Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0], s: [0.032, 0.032, 0.015] });
    }
    add(f, G.sphere, soft('#ffd34d'), { p: [0, 0, 0.01], s: [0.025, 0.025, 0.015] });
  } else if (A === 'crown') {
    const g = GOLD();
    const c = add(char, G.crown, g, { p: [0, top + 0.01, 0] }); c.material.side = THREE.DoubleSide;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      add(char, G.cone, g, { p: [Math.cos(a) * 0.1, top + 0.07, Math.sin(a) * 0.1], s: [0.02, 0.05, 0.02] });
    }
    add(char, G.sphere, soft('#ff6fa8', { clearcoat: 1, roughness: 0.1 }), { p: [0, top + 0.01, 0.11], s: [0.022, 0.022, 0.012] });
  } else if (A === 'mic') {
    // headset: earpiece + boom reaching toward the mouth
    const ear = surf(head, 1, 0.05, 0.05, 0.02);
    add(char, G.sphere, INK, { p: ear.p.toArray(), s: [0.03, 0.05, 0.05] });
    const end = surf(head, 0.32, -0.22, 1, 0.1).p;
    const dir = end.clone().sub(ear.p), boom = add(char, G.cyl, INK);
    boom.position.copy(ear.p).addScaledVector(dir, 0.5); boom.scale.set(0.007, dir.length(), 0.007);
    boom.quaternion.setFromUnitVectors(Y, dir.normalize());
    add(char, G.sphere, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.4 }), { p: end.toArray(), s: [0.022, 0.022, 0.022] });
  } else if (A === 'glasses') {
    const lens = soft(def.accent, { transparent: true, opacity: 0.75, clearcoat: 1, roughness: 0.1 });
    for (const x of [-1, 1]) glue(add(char, G.heart, lens), surf(head, x * 0.33, 0.1, 1, 0.09));
    add(char, G.cyl, lens, { p: surf(head, 0, 0.12, 1, 0.1).p.toArray(), s: [0.007, 0.06, 0.007], r: [0, 0, Math.PI / 2] });
  } else if (A === 'tiara') {
    const g = GOLD();
    add(char, G.tiara, g, { p: [0, top - 0.04, sc[2] * 0.3], r: [-0.45, 0, 0] });
    add(char, G.sphere, soft('#ff6fa8', { clearcoat: 1, roughness: 0.1 }), { p: [0, top + 0.05, sc[2] * 0.36], s: [0.025, 0.03, 0.015] });
  } else if (A === 'blade') {
    const b = add(char, G.capsule, new THREE.MeshStandardMaterial({ color: def.accent, emissive: new THREE.Color(def.accent), emissiveIntensity: 0.9 }), { p: [0.36, 0.3, 0.05], s: [0.018, 0.32, 0.018], r: [0, 0, -0.35] });
    glow.push(b.material);
    add(char, G.cyl, GOLD(), { p: [0.32, 0.1, 0.05], s: [0.05, 0.015, 0.05], r: [0, 0, -0.35] });
  } else if (A === 'nigiri' || A === 'tamago' || A === 'ebi') {
    add(char, G.slab, soft(def.accent, { clearcoat: 1, roughness: 0.2 }), { p: [0, top - 0.025, -0.01], r: [-0.12, 0, 0] });
    if (A !== 'tamago') for (const k of [-1, 0, 1]) add(char, G.box, soft('#ffffff'), { p: [k * 0.12, top + 0.018, -0.01], s: [0.022, 0.01, 0.26], r: [-0.12, 0.5, 0] });
    if (A === 'tamago') add(char, G.box, NORI, { p: [0, top - 0.02, -0.01], s: [0.1, 0.11, 0.37], r: [-0.12, 0, 0] });
    if (A === 'ebi') for (const x of [-1, 1]) add(char, G.cone, soft('#ff5a3a'), { p: [x * 0.04, top - 0.01, -0.24], s: [0.05, 0.1, 0.02], r: [-1.9, 0, x * 0.4] });
  } else if (A === 'maki' || A === 'gunkan') {
    const h = A === 'maki' ? 0.12 : 0.17;
    add(char, G.band, NORI, { p: [0, head.position.y - sc[1] * (A === 'maki' ? 0.6 : 0.45), 0], s: [sc[0] * 0.92, h, sc[2] * 0.92] });
    const n = A === 'maki' ? 3 : 9, fm = soft(def.accent, { clearcoat: 1, roughness: 0.1, emissive: new THREE.Color(def.accent), emissiveIntensity: A === 'gunkan' ? 0.15 : 0 });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + k, r = k ? 0.04 + (k % 3) * 0.03 : 0;
      add(char, G.sphere, fm, { p: [Math.cos(a) * r, top - 0.005 + (k % 2) * 0.01, Math.sin(a) * r - 0.03], s: [0.035, 0.035, 0.035] });
    }
  } else if (A === 'onigiri') {
    glue(add(char, G.box, NORI, { s: [0.24, 0.14, 0.02] }), surf(head, 0, -0.55, 0.83, 0.03));
  } else if (A === 'cheese') {
    add(char, G.wedge, soft('#ffd34d', { clearcoat: 0.6 }), { p: [0.03, top + 0.02, 0], r: [0, 1.3, 0.15] });
    for (const [dx, dz] of [[0.06, 0.02], [0.1, -0.05]]) add(char, G.sphere, soft('#e0ac2a'), { p: [dx, top + 0.063, dz], s: [0.02, 0.008, 0.02] });
  } else if (A === 'specs') {
    for (const x of [-1, 1]) glue(add(char, G.ring, INK), surf(head, x * 0.33, 0.1, 1, 0.09 + fo));
    add(char, G.cyl, INK, { p: surf(head, 0, 0.12, 1, 0.1 + fo).p.toArray(), s: [0.006, 0.07, 0.006], r: [0, 0, Math.PI / 2] });
  } else if (A === 'collar') {
    add(char, G.collar, soft(def.accent), { p: [0, 0.07, 0], s: [sc[0] * 0.85, sc[2] * 0.85, 0.6], r: [Math.PI / 2, 0, 0] });
    add(char, G.sphere, GOLD(), { p: [0, 0.04, sc[2] * 0.85 + 0.02], s: [0.035, 0.035, 0.035] });
  } else if (A === 'dish') {
    add(char, G.cyl, soft('#f4f9f2', { clearcoat: 1, roughness: 0.15 }), { p: [0, top - 0.005, 0], s: [0.13, 0.015, 0.13] });
  } else if (A === 'acorn') {
    add(char, G.mush, soft(def.accent, { roughness: 0.75, clearcoat: 0.2 }), { p: [0, head.position.y + sc[1] * 0.35, 0], s: [sc[0] * 1.12, sc[1] * 0.7, sc[2] * 1.12] });
    add(char, G.cyl, soft('#6b4a2a'), { p: [0, top + 0.05, 0], s: [0.015, 0.06, 0.015] });
  } else if (A === 'lantern') {
    const rm = soft(def.accent);
    for (const k of [1, -1]) add(char, G.collar, rm, { p: [0, head.position.y + k * sc[1] * 0.88, 0], s: [sc[0] * 0.55, sc[2] * 0.55, 0.5], r: [Math.PI / 2, 0, 0] });
    add(char, G.cyl, rm, { p: [0, top + 0.03, 0], s: [0.03, 0.04, 0.03] });
  } else if (A === 'leafhat') {
    add(char, G.sphere, leafMat, { p: [0, top + 0.01, 0.02], s: [0.13, 0.02, 0.08], r: [0.2, 0.3, 0.1] });
    add(char, G.cyl, leafMat, { p: [0.1, top + 0.03, 0.05], s: [0.008, 0.06, 0.008], r: [0, 0, -0.9] });
  } else if (A === 'vents') {
    const vm = soft('#3a3440');
    for (const x of [-1, 1]) for (let k = 0; k < 3; k++) glue(add(char, G.box, vm, { s: [0.06, 0.012, 0.008] }), surf(head, x * 0.62, -0.3 + k * 0.1, 1, 0.01));
  } else if (A === 'elfhat' || A === 'santa' || A === 'witch') {
    // cone hat on a group tilted to the side; rim + tip ornament
    const [col, tipCol, h, rim] = { elfhat: [def.accent, '#ffd34d', 0.34, '#ffffff'], santa: [def.accent, '#ffffff', 0.3, '#ffffff'], witch: [def.accent, null, 0.4, '#2b2238'] }[A];
    const g = new THREE.Group(); g.position.set(0, top - 0.06, -0.01); g.rotation.set(-0.2, 0, A === 'witch' ? 0.12 : 0.28); char.add(g);
    const hm = soft(col, { clearcoat: 0.6 });
    add(g, G.cone, hm, { p: [0, h / 2, 0], s: [sc[0] * 0.92, h, sc[2] * 0.92] });
    if (A === 'witch') {
      add(g, G.cyl, hm, { p: [0, 0, 0], s: [sc[0] * 1.55, 0.015, sc[2] * 1.55] });
      add(g, G.cyl, soft('#ffd34d'), { p: [0, 0.035, 0], s: [sc[0] * 0.86, 0.03, sc[2] * 0.86] });
    } else {
      add(g, G.collar, soft(rim), { s: [sc[0] * 0.95, sc[2] * 0.95, 0.5], r: [Math.PI / 2, 0, 0] });
      add(g, G.sphere, A === 'elfhat' ? GOLD() : soft(tipCol), { p: [0, h + 0.01, 0], s: [0.04, 0.04, 0.04] });
    }
  } else if (A === 'tophat') {
    const hm = soft('#2b2238', { clearcoat: 0.8 });
    add(char, G.cyl, hm, { p: [0, top + 0.07, 0], s: [0.12, 0.17, 0.12] });
    add(char, G.cyl, hm, { p: [0, top - 0.015, 0], s: [0.2, 0.014, 0.2] });
    add(char, G.cyl, acc, { p: [0, top + 0.015, 0], s: [0.123, 0.03, 0.123] });
  } else if (A === 'tree') {
    const cols = ['#e8443a', '#ffd34d', '#5cb8ff', '#ff8fd8', '#ffffff'];
    for (let k = 0; k < 9; k++) {
      const a = k * 2.4, el = -0.3 + (k % 3) * 0.4, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)];
      if (d[2] > 0.6 && Math.abs(d[0]) < 0.5 && d[1] < 0.4) continue;
      glue(add(char, G.sphere, soft(cols[k % cols.length], { clearcoat: 1, roughness: 0.1 }), { s: [0.03, 0.03, 0.03] }), surf(head, ...d, 0.05));
    }
    const st = add(char, G.star, soft('#ffd34d', { emissive: new THREE.Color('#ffc21a'), emissiveIntensity: 0.5, clearcoat: 1 }), { p: [0, top + 0.07, 0], s: [1.1, 1.1, 1.1] });
    glow.push(st.material);
  } else if (A === 'roof') {
    add(char, G.pyr, acc, { p: [0, top + 0.12, 0], s: [sc[0] * 1.55, 0.26, sc[2] * 1.55], r: [0, Math.PI / 4, 0] });
    add(char, G.box, soft('#b8644a'), { p: [sc[0] * 0.5, top + 0.15, -0.05], s: [0.06, 0.12, 0.06] });
  } else if (A === 'awning') {
    for (let k = 0; k < 6; k++)
      add(char, G.box, k % 2 ? soft('#ffffff') : acc, { p: [(k - 2.5) * (sc[0] / 3), head.position.y + sc[1] * 0.66, sc[2] + 0.05], s: [sc[0] / 3, 0.012, 0.13], r: [0.5, 0, 0] });
  } else if (A === 'clock') {
    const cy = head.position.y + sc[1] * 0.62;
    add(char, G.cyl, soft('#ffffff', { clearcoat: 1 }), { p: [0, cy, sc[2] + 0.008], s: [0.075, 0.012, 0.075], r: [Math.PI / 2, 0, 0] });
    add(char, G.box, INK, { p: [0, cy + 0.02, sc[2] + 0.018], s: [0.008, 0.045, 0.004] });
    add(char, G.box, INK, { p: [0.015, cy, sc[2] + 0.018], s: [0.035, 0.008, 0.004] });
  } else if (A === 'lamp') {
    const l = add(char, G.cyl, soft('#fff3a0', { emissive: new THREE.Color('#ffe066'), emissiveIntensity: 0.8 }), { p: [0, top + 0.04, 0], s: [0.09, 0.08, 0.09] });
    glow.push(l.material);
    add(char, G.cone, acc, { p: [0, top + 0.13, 0], s: [0.12, 0.1, 0.12] });
  } else if (A === 'battlements') {
    const stone = soft(new THREE.Color(def.body).multiplyScalar(0.9));
    for (const xx of [-1, 0, 1]) for (const zz of [-1, 0, 1]) if (xx || zz) add(char, G.box, stone, { p: [xx * sc[0] * 0.75, top + 0.035, zz * sc[2] * 0.75], s: [0.07, 0.07, 0.07] });
    add(char, G.cyl, INK, { p: [0, top + 0.15, 0], s: [0.008, 0.26, 0.008] });
    add(char, G.cone, acc, { p: [0.055, top + 0.24, 0], s: [0.045, 0.1, 0.01], r: [0, 0, -Math.PI / 2] });
  } else if (A === 'helmet') {
    add(char, G.dome, soft('#d8dde6', { metalness: 0.75, roughness: 0.25, sheen: 0 }), { p: head.position.toArray(), s: sc.map((v) => v * 1.08), r: [-0.25, 0, 0] });
    add(char, G.capsule, acc, { p: [0, top + 0.07, -0.06], s: [0.035, 0.08, 0.035], r: [-0.7, 0, 0] });
  } else if (A === 'jester') {
    const cols = [def.accent, '#ffd34d'];
    for (const [k, x] of [[0, -1], [1, 1]]) {
      add(char, G.cone, soft(cols[k]), { p: [x * 0.13, top + 0.04, 0], s: [0.07, 0.22, 0.06], r: [0, 0, -x * 1.0] });
      add(char, G.sphere, GOLD(), { p: [x * 0.24, top + 0.1, 0], s: [0.03, 0.03, 0.03] });
    }
  } else if (A === 'taxisign') {
    add(char, G.box, soft('#fff3b0', { emissive: new THREE.Color('#ffe066'), emissiveIntensity: 0.35 }), { p: [0, top + 0.03, 0], s: [0.15, 0.05, 0.05] });
  } else if (A === 'siren') {
    for (const [x, c] of [[-1, '#ff4a4a'], [1, def.accent === '#e8443a' ? '#ff9a3c' : def.accent]]) {
      const m = add(char, G.box, soft(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.6 }), { p: [x * 0.045, top + 0.025, 0], s: [0.06, 0.04, 0.05] });
      glow.push(m.material);
    }
  } else if (A === 'ladder') {
    const lm = soft(def.accent, { metalness: 0.5, roughness: 0.3 });
    for (const x of [-1, 1]) add(char, G.box, lm, { p: [x * 0.06, top + 0.025, 0], s: [0.014, 0.014, sc[2] * 2.1] });
    for (let k = 0; k < 5; k++) add(char, G.box, lm, { p: [0, top + 0.025, (k - 2) * sc[2] * 0.42], s: [0.12, 0.01, 0.012] });
  } else if (A === 'cauldron') {
    const liquid = soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.6, clearcoat: 1 });
    add(char, G.cyl, liquid, { p: [0, top - 0.02, 0], s: [sc[0] * 0.6, 0.012, sc[2] * 0.6] });
    add(char, G.collar, soft('#2b2630'), { p: [0, top - 0.02, 0], s: [sc[0] * 0.62, sc[2] * 0.62, 0.4], r: [Math.PI / 2, 0, 0] });
    for (const [bx, bz, r] of [[0.04, 0.02, 0.025], [-0.05, -0.02, 0.02], [0.0, -0.06, 0.018]]) add(char, G.sphere, liquid, { p: [bx, top + 0.005, bz], s: [r, r, r] });
    glow.push(liquid);
  } else if (A === 'cork') {
    add(char, G.cyl, soft(def.body, { transparent: true, opacity: 0.8, clearcoat: 1 }), { p: [0, top + 0.03, 0], s: [0.07, 0.08, 0.07] });
    add(char, G.cyl, soft('#b0804a', { roughness: 0.8 }), { p: [0, top + 0.09, 0], s: [0.06, 0.05, 0.06] });
  } else if (A === 'kabuto') {
    const sh = soft(def.accent, { clearcoat: 1, roughness: 0.2, metalness: def.accent === '#ffd34d' ? 0.7 : 0 });
    add(char, G.dome, sh, { p: head.position.toArray(), s: sc.map((v) => v * 1.1), r: [-0.3, 0, 0] });
    add(char, G.tiara, GOLD(), { p: [0, top - 0.01, sc[2] * 0.42], s: [1.25, 1.1, 1.25], r: [-0.25, 0, 0] });
    for (const x of [-1, 1]) add(char, G.sphere, sh, { p: [x * sc[0] * 0.95, head.position.y - 0.01, -0.03], s: [0.05, 0.1, 0.11], r: [0, 0, x * 0.25] });
  } else if (A === 'headband') {
    add(char, G.collar, acc, { p: [0, head.position.y + sc[1] * 0.42, 0], s: [sc[0] * 0.95, sc[2] * 0.95, 0.3], r: [Math.PI / 2, 0, 0] });
    for (const x of [-1, 1]) add(char, G.capsule, acc, { p: [x * 0.04, head.position.y + sc[1] * 0.3, -sc[2] - 0.05], s: [0.015, 0.07, 0.01], r: [0.9, 0, x * 0.35] });
  } else if (A === 'topknot') {
    const hm = soft(def.accent, { clearcoat: 0.8 });
    add(char, G.dome, hm, { p: head.position.toArray(), s: sc.map((v) => v * 1.05), r: [-0.6, 0, 0] });
    add(char, G.capsule, hm, { p: [0, top + 0.03, 0.01], s: [0.035, 0.06, 0.035], r: [1.2, 0, 0] });
  } else if (A === 'kasa') {
    add(char, G.cone, soft(def.accent, { roughness: 0.8 }), { p: [0, top + 0.01, -0.06], s: [sc[0] * 1.35, 0.12, sc[2] * 1.35], r: [-0.45, 0, 0] }); // tipped back so the face shows
  } else if (A === 'calyx') {
    const lm = soft('#3f9a4a', { clearcoat: 0.8 });
    for (let k = 0; k < 5; k++) {
      const g = new THREE.Group(); g.position.set(0, top - 0.005, 0); g.rotation.y = (k / 5) * Math.PI * 2; char.add(g);
      add(g, G.cone, lm, { p: [0.065, 0, 0], s: [0.035, 0.11, 0.012], r: [0, 0, -Math.PI / 2 - 0.25] });
    }
    add(char, G.cyl, lm, { p: [0, top + 0.03, 0], s: [0.012, 0.06, 0.012] });
  } else if (A === 'cap') {
    add(char, G.mush, acc, { p: [0, head.position.y + sc[1] * 0.25, 0], s: [sc[0] * 1.07, sc[1] * 0.8, sc[2] * 1.07] });
    add(char, G.cyl, acc, { p: [0, head.position.y + sc[1] * 0.3, -sc[2] - 0.05], s: [0.13, 0.012, 0.1] }); // brim worn backwards
  } else if (A === 'beret') {
    add(char, G.sphere, acc, { p: [0.03, top - 0.01, 0], s: [sc[0] * 1.05, 0.05, sc[2] * 1.0], r: [0, 0, 0.25] });
    add(char, G.cyl, acc, { p: [0.05, top + 0.04, 0], s: [0.01, 0.03, 0.01] });
  } else if (A === 'headphones') {
    add(char, G.arc, acc, { p: head.position.toArray(), s: [sc[0] * 1.12, sc[1] * 1.12, 0.6] });
    for (const x of [-1, 1]) {
      add(char, G.cyl, acc, { p: [x * (sc[0] + 0.03), head.position.y, 0], s: [0.07, 0.05, 0.07], r: [0, 0, Math.PI / 2] });
      add(char, G.cyl, ex('#2b2238'), { p: [x * (sc[0] + 0.005), head.position.y, 0], s: [0.06, 0.02, 0.06], r: [0, 0, Math.PI / 2] });
    }
  } else if (A === 'hairpins') {
    for (const x of [-1, 1]) {
      add(char, G.cyl, GOLD(), { p: [x * 0.14, top + 0.04, -0.04], s: [0.007, 0.17, 0.007], r: [0.4, 0, x * 0.6] });
      add(char, G.sphere, acc, { p: [x * 0.2, top + 0.09, -0.01], s: [0.025, 0.025, 0.025] });
    }
  } else if (A === 'headwrap') {
    add(char, G.mush, acc, { p: [0, head.position.y + sc[1] * 0.3, -0.01], s: [sc[0] * 1.2, sc[1] * 1.0, sc[2] * 1.15] });
    add(char, G.collar, ex(new THREE.Color(def.accent).multiplyScalar(0.8)), { p: [0, head.position.y + sc[1] * 0.32, 0], s: [sc[0] * 1.1, sc[2] * 1.08, 0.5], r: [Math.PI / 2 - 0.1, 0, 0] });
    for (const x of [-1, 1]) add(char, G.sphere, acc, { p: [x * 0.07, top + 0.06, -0.03], s: [0.08, 0.06, 0.05], r: [0, 0, x * 0.5] });
    for (let k = 0; k < 7; k++) { const a = k * 0.9; glue(add(char, G.sphere, ex('#ffd34d'), { s: [0.014, 0.014, 0.008] }), surf(head, Math.cos(a) * 0.7, 0.7, Math.sin(a) * 0.5 + 0.3, 0.12)); }
  } else if (A === 'tikka') {
    glue(add(char, G.sphere, ex('#ff5a7a', { clearcoat: 1, roughness: 0.1 }), { s: [0.022, 0.028, 0.012] }), surf(head, 0, 0.45, 1, 0.02));
    glue(add(char, G.cyl, GOLD(), { s: [0.004, 0.09, 0.004] }), surf(head, 0, 0.62, 0.8, 0.03), Y);
  } else if (A === 'flowercrown') {
    const cols = [def.accent, '#ffd34d', '#ffffff', '#ff8a5c'];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      add(char, G.sphere, ex(cols[k % cols.length], { clearcoat: 1 }), { p: [Math.cos(a) * sc[0] * 0.88, head.position.y + sc[1] * 0.58, Math.sin(a) * sc[2] * 0.88], s: [0.035, 0.03, 0.035] });
      add(char, G.sphere, soft('#6cc46a'), { p: [Math.cos(a + 0.35) * sc[0] * 0.9, head.position.y + sc[1] * 0.55, Math.sin(a + 0.35) * sc[2] * 0.9], s: [0.03, 0.01, 0.018], r: [0, -a, 0] });
    }
  } else if (A === 'kokoshnik') {
    add(char, G.sphere, acc, { p: [0, top - 0.01, -0.03], s: [sc[0] * 0.95, sc[1] * 0.75, 0.035] });
    add(char, G.arc, GOLD(), { p: [0, top - 0.06, -0.01], s: [sc[0] * 0.95, sc[1] * 0.78, 0.25] });
    for (let k = 0; k < 5; k++) { const a = 0.35 + (k / 4) * (Math.PI - 0.7); add(char, G.sphere, ex('#ffffff', { clearcoat: 1 }), { p: [Math.cos(a) * sc[0] * 0.75, top - 0.06 + Math.sin(a) * sc[1] * 0.55, 0.01], s: [0.016, 0.016, 0.016] }); }
  } else if (A === 'pickaxe') {
    const g = new THREE.Group(); g.position.set(sc[0] + 0.07, 0.1, 0.06); g.rotation.z = -0.4; char.add(g);
    add(g, G.cyl, ex('#8a5a3a'), { p: [0, 0.11, 0], s: [0.013, 0.22, 0.013] });
    add(g, G.box, ex(def.accent, { metalness: 0.5, roughness: 0.3 }), { p: [0, 0.22, 0], s: [0.17, 0.03, 0.03] });
  } else if (A === 'hardhat' || A === 'goggles') {
    if (A === 'hardhat') {
      add(char, boxy ? G.mush : G.dome, acc, { p: boxy ? [0, top - 0.03, 0] : head.position.toArray(), s: boxy ? [sc[0] * 1.02, sc[1] * 0.55, sc[2] * 1.02] : sc.map((v) => v * 1.08) });
      add(char, G.cyl, acc, { p: [0, boxy ? top - 0.03 : head.position.y + sc[1] * 0.25, 0.02], s: [sc[0] * 1.15, 0.012, sc[2] * 1.2] });
    } else {
      for (const x of [-1, 1]) {
        const l = glue(add(char, G.cyl, ex(def.accent, { transparent: true, opacity: 0.75, clearcoat: 1, roughness: 0.05 }), { s: [0.055, 0.03, 0.055] }), surf(head, x * 0.32, 0.55, 1, 0.02), Y);
        l.position.z += 0.01;
      }
      add(char, boxy ? G.box : G.thinRing, ex('#2b2238'), boxy ? { p: [0, head.position.y + sc[1] * 0.55, 0], s: [sc[0] * 2.03, 0.03, sc[2] * 2.03] } : { p: [0, head.position.y + sc[1] * 0.5, 0], s: [sc[0] * 0.92, sc[2] * 0.92, 0.4], r: [Math.PI / 2, 0, 0] });
    }
  } else if (A === 'laurel') {
    const lm = def.rarity === 'super' ? GOLD() : soft('#6cbf5a', { clearcoat: 0.8 });
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.08) continue; // gap at the front
      add(char, G.sphere, lm, { p: [Math.cos(a) * sc[0] * 0.96, head.position.y + sc[1] * 0.42, Math.sin(a) * sc[2] * 0.96], s: [0.045, 0.012, 0.024], r: [0.4, -a, 0.3] });
    }
  } else if (A === 'bearskin') {
    add(char, G.cyl, soft('#2b2238', { roughness: 0.95, sheen: 1, sheenRoughness: 0.9, clearcoat: 0 }), { p: [0, top + 0.1, -0.01], s: [sc[0] * 0.9, 0.34, sc[2] * 0.9] });
    add(char, G.sphere, soft('#2b2238', { roughness: 0.95, sheen: 1 }), { p: [0, top + 0.27, -0.01], s: [sc[0] * 0.9, 0.06, sc[2] * 0.9] });
  } else if (A === 'onion') {
    add(char, G.sphere, acc, { p: [0, top + 0.08, 0], s: [0.14, 0.13, 0.14] });
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; add(char, G.capsule, GOLD(), { p: [Math.cos(a) * 0.13, top + 0.08, Math.sin(a) * 0.13], s: [0.012, 0.06, 0.012], r: [Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4] }); }
    add(char, G.cone, GOLD(), { p: [0, top + 0.26, 0], s: [0.04, 0.12, 0.04] });
  } else if (A === 'nemes') {
    const gold = soft('#ffd25a', { clearcoat: 1, metalness: 0.3 });
    add(char, G.mush, gold, { p: [0, head.position.y + sc[1] * 0.15, -0.01], s: [sc[0] * 1.12, sc[1] * 1.05, sc[2] * 1.1] });
    for (const yy of [0.35, 0.6, 0.82]) { const r = Math.sqrt(1 - yy * yy); add(char, G.collar, acc, { p: [0, head.position.y + sc[1] * (0.15 + yy * 0.9), 0], s: [sc[0] * 1.12 * r, sc[2] * 1.1 * r, 0.4], r: [Math.PI / 2, 0, 0] }); }
    for (const x of [-1, 1]) add(char, G.box, gold, { p: [x * sc[0] * 0.92, head.position.y - sc[1] * 0.35, sc[2] * 0.3], s: [0.06, 0.22, 0.05] });
  } else if (A === 'visorbar') {
    add(char, G.box, soft('#e8eef6', { metalness: 0.9, roughness: 0.15, sheen: 0 }), { p: [0, top + 0.025, sc[2] * 0.6], s: [sc[0] * 2.2, 0.03, 0.08] });
    for (let k = 0; k < 5; k++) { const m = add(char, G.sphere, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.6 }), { p: [(k / 4 - 0.5) * sc[0] * 1.8, top + 0.055, sc[2] * 0.6], s: [0.02, 0.02, 0.02] }); glow.push(m.material); }
  } else if (A === 'spoiler') {
    for (const x of [-1, 1]) add(char, G.cyl, acc, { p: [x * sc[0] * 0.6, top + 0.04, -sc[2] * 0.8], s: [0.01, 0.07, 0.01] });
    add(char, G.box, acc, { p: [0, top + 0.08, -sc[2] * 0.85], s: [sc[0] * 1.9, 0.015, 0.09], r: [0.15, 0, 0] });
  } else if (A === 'tricorne') {
    add(char, G.tri, soft(def.accent === '#ffd34d' ? '#2b2238' : def.accent, { clearcoat: 0.6 }), { p: [0, top + 0.03, 0], s: [sc[0] * 1.45, 0.17, sc[2] * 1.45], r: [0, Math.PI, 0] });
    add(char, G.sphere, def.rarity === 'super' ? GOLD() : soft('#ffffff'), { p: [0, top + 0.05, sc[2] * 0.62], s: [0.03, 0.03, 0.012] });
  } else if (A === 'bandana') {
    add(char, G.dome, acc, { p: head.position.toArray(), s: sc.map((v) => v * 1.06), r: [-0.55, 0, 0] });
    for (const k of [-1, 1]) add(char, G.cone, acc, { p: [sc[0] * 0.75, head.position.y + sc[1] * 0.25, -sc[2] * 0.55 + k * 0.03], s: [0.03, 0.08, 0.02], r: [0, 0, -1.2 + k * 0.3] });
  } else if (A === 'nightcap') {
    const g = new THREE.Group(); g.position.set(0, top - 0.05, -0.01); g.rotation.set(-0.2, 0, 0.9); char.add(g);
    add(g, G.cone, acc, { p: [0, 0.16, 0], s: [sc[0] * 0.85, 0.32, sc[2] * 0.85] });
    add(g, G.collar, soft('#ffffff'), { s: [sc[0] * 0.88, sc[2] * 0.88, 0.5], r: [Math.PI / 2, 0, 0] });
    add(g, G.sphere, soft('#ffffff'), { p: [0, 0.33, 0], s: [0.04, 0.04, 0.04] });
  } else if (A === 'seed') { // a little nut / seed held against the chest
    add(char, G.sphere, acc, { p: [0, 0.07, sc[2] * 0.95], s: [0.045, 0.06, 0.04] });
    add(char, G.mush, soft(new THREE.Color(def.accent).multiplyScalar(0.7)), { p: [0, 0.11, sc[2] * 0.95], s: [0.05, 0.03, 0.045] });
  } else if (A === 'halo') {
    const h = add(char, G.halo, new THREE.MeshStandardMaterial({ color: '#ffe08a', emissive: new THREE.Color('#ffcc33'), emissiveIntensity: 0.9 }), { p: [0, top + 0.1, -0.02], r: [Math.PI / 2 - 0.25, 0, 0] });
    glow.push(h.material);
  } else if (A === 'star') {
    const st = add(char, G.star, soft(def.accent, { emissive: new THREE.Color(def.accent), emissiveIntensity: 0.4, clearcoat: 1 }), { p: [0.1, top + 0.03, 0.04], r: [0, 0, -0.3] });
    glow.push(st.material);
  } else if (A === 'icing') {
    add(char, G.dome, soft(def.accent, { clearcoat: 1, roughness: 0.15 }), { p: head.position.toArray(), s: sc.map((v) => v * 1.04) });
    const cols = ['#ff6f9f', '#6fc3ff', '#ffe066', '#8ee28a', '#ffffff'];
    for (let k = 0; k < 14; k++) {
      const a = Math.random() * Math.PI * 2, el = 0.55 + Math.random() * 0.4;
      const s = surf(head, Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el), 0.05);
      const m = glue(add(char, G.capsule, soft(cols[k % cols.length]), { s: [0.008, 0.016, 0.008] }), s, Y);
      m.rotateX(Math.PI / 2); m.rotateZ(Math.random() * 3);
    }
  } else if (A === 'sugar') {
    for (let k = 0; k < 12; k++) {
      const a = Math.random() * Math.PI * 2, el = 0.35 + Math.random() * 0.9;
      glue(add(char, G.sphere, soft(def.accent), { s: [0.014, 0.014, 0.014] }), surf(head, Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el) * 0.7 + 0.2, 0.02));
    }
  } else if (A === 'mushroom') {
    const capY = head.position.y + sc[1] * 0.45;
    add(char, G.mush, soft(def.accent, { clearcoat: 1, roughness: 0.25 }), { p: [0, capY, 0], s: [sc[0] * 1.25, sc[1] * 0.75, sc[2] * 1.25] });
    const dummy = { position: new THREE.Vector3(0, capY, 0), scale: new THREE.Vector3(sc[0] * 1.25, sc[1] * 0.75, sc[2] * 1.25) };
    for (const [dx, dy, dz] of [[0, 1, 0.2], [0.6, 0.6, 0.4], [-0.6, 0.55, 0.45], [0.2, 0.5, 0.9], [-0.7, 0.4, -0.3], [0.6, 0.45, -0.5]])
      glue(add(char, G.sphere, soft('#ffffff'), { s: [0.035, 0.035, 0.01] }), surf(dummy, dx, dy, dz, 0.01));
  }

  if (def.wave) add(char, G.capsule, body, { p: [0.25, 0.3, 0.08], s: [0.05, 0.07, 0.05], r: [0, 0, -0.35] }); // beckoning paw

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = o === cap; } });
  return { group, cap, char, eyes, glow };
}

// Shared geometries stay; only per-key materials are disposed.
export function disposeKey(k) {
  const keep = new Set([INK, SHINE, BLUSH]);
  k.group.traverse((o) => { if (o.isMesh && !keep.has(o.material)) o.material.dispose(); });
  k.group.removeFromParent();
}
