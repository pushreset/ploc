# Ploc

Jeu ASMR Three.js inspiré du *concept* des touches de clavier à collectionner (Clickeez) : persos mignons sur keycaps, clic « pop », capsules surprise, rareté. Persos, univers et nom 100 % originaux, zéro asset (géométrie procédurale + son WebAudio synthétisé).

```sh
python3 -m http.server 8080   # puis http://localhost:8080
node check.mjs                # smoke test headless (playwright-core ~/.dev-browser + chromium-1248)
```

## Ce que ça explore
- **Feel** : course de touche en ressort amorti (pas de tween), squash & stretch du perso, son en 2 temps (press = bruit filtré + « thock », release = « pop » sur une gamme pentatonique → taper reste musical).
- **13 sets, une voix de switch chacun** : Bonbon Rose (bulle), Fournée (feutré), Lueur (clochette), Sous-Bois (bois), Scène Néon (synthé), Manoir Minuit (orgue), Rose Glam (carillon), Comptoir Sushi (plop mouillé), Famille Chat (miaou), Famille Souris (couinement), Famille Jungle (bongo), Yōkai (koto), Esprits du Vent (souffle + carillon).
- **Sets à thème** (idoles chasseuses de démons, petits vampires, poupées fashion, esprits façon Ghibli) : figurines originales qui reprennent une ambiance, aucun perso sous licence. Les yōkai sont du folklore traditionnel.
- **10 sets de plus** : Méca Chibi (robots originaux, servo), Noël (grelots), Ville (bâtiments, sonnette), Château (fanfare), Véhicules (pouet), Sorcières (magie), Samouraïs (bambou), Fruits (pop pétillant), Légumes (croquant), Famille Tortue (goutte). Les corps en boîte (bâtiments, véhicules, robots) projettent visage et pièces sur leurs faces (`surf()` dans `chars.js`).
- **27 sets de plus** : Halloween, Bonbons, Sport, Musique, Océan, Système solaire, Princesses du monde, Kaiju kawaii, Blocs & Bataille, Dieux grecs, Capitales, Dekotora, Voitures tuning, Pirates, Peluches, Animaux de la forêt, Dinosaures kawaii, Dinosaures squelettes, Poneys, Reptiles, Nains de jardin, Ferme, Hamsters, Chasseuses de fantômes, Desserts glacés, Brochettes japonaises, Crudités. Godzilla / Minecraft / Fortnite / Ghostbusters → personnages originaux ; princesses inspirées de tenues régionales, sans caricature ni objet sacré. Aperçu : liste déroulante + grille de vignettes ; album : « Aller au set ».
- **Boucle zen** : 1 clic = 1 ✦, capsule = 20→90 ✦, 3 clics pour la dévisser, reveal, la touche vole dans un slot libre. Doublon = bonus ✦. 300 figurines en 50 sets + 1 secrète, une seule pioche, raretés nacré / holo / or.
- **6 plateaux à débloquer** (`boards.js`) : Classique, Cœur (5 capsules ouvertes), Nuage (10), Fleur (18), Arbre (28), Chat (40). Flèches ‹ › ou ← → pour changer, une disposition sauvegardée par plateau. Chaque forme = un masque de cases + un contour ajusté automatiquement pour que toutes les touches tiennent (vérifié par `check.mjs`). Les touches du clavier suivent la forme (rangée des chiffres pour les plateaux de 4 rangées).
- **Besoins façon Tamagotchi** (`needs.js`) : une bulle de BD au-dessus des figurines. Faim (sucré/salé → plat), jeu, câlins ×N exacts, massage (maintenir 3 s), dodo (ne plus toucher), maladie (remède à trouver), ami (le poser à côté), voyage (autre plateau). Goûts cachés par figurine, à apprendre (indices après un raté) ; bonus 15-50 ✦. Ignoré 2 min → boude 1 min. Affection ❤️ 0-5 : +1 ✦ par clic tous les 2 ❤️. Réglages dans `TUNING`.
- Clavier physique (`e.code`, donc QWERTY/AZERTY indifférent, labels via `navigator.keyboard.getLayoutMap`), glisser le doigt sur les touches, mode Ranger, album avec silhouettes, sauvegarde localStorage.

## Fichiers
`needs.js` (besoins) · `boards.js` (plateaux) · `preview.html` (aperçu 3D de tous les sets, clic = son ; http://localhost:8080/preview.html) · `chars.js` (table + builder procédural) · `audio.js` (synth) · `main.js` (scène, input, capsule, HUD) · `index.html`.

Pas fait : musique d'ambiance, autres bases (manette/porte-clé), mini-jeux.

Emojis des besoins : [Microsoft Fluent Emoji 3D](https://github.com/microsoft/fluentui-emoji) (MIT, licence dans `assets/emoji/LICENSE`), mappés dans `emoji.js`, avec repli sur les emojis système.

## 🎵 Concert (mini-jeu de rythme)
Notes qui tombent dans 3 à 5 couloirs ; les figurines du plateau affiché sont les musiciens (touches `D F J K`, `S…K` en difficile, ou tap). Parfait ≤ 45 ms, Bien ≤ 90, OK ≤ 140 ; combo ×1 → ×4 ; note S/A/B/C → ✦ (+50 au premier S) et ❤ pour les musiciens dès B.
- **Morceaux générés** (`rhythm.js`) : Pop / Lo-fi / Disco, grille d'accords + mélodie pentatonique répétée (question/réponse), batterie/basse/nappes en WebAudio. La mélodie, c'est toi : chaque note réussie est chantée par la créature du couloir.
- **YouTube pré-analysé** (`concert/`) : `uv run concert/analyze.py <id> [<id>…]` télécharge l'audio dans `concert/.cache/` (gitignoré), librosa en tire tempo, temps et attaques → `concert/charts/<id>.json` + `concert/index.json`. En jeu la vidéo passe en fond (lecteur officiel), horloge recalée sur `getCurrentTime()`, curseur de décalage si ça ne tombe pas pile.

## Tactile
Jouable au doigt (tablette, téléphone) : multi-touch, glisser d'une touche à l'autre, maintenir pour le massage, tap sur bulles / capsule / couloirs du Concert (bouton ✕ pour quitter). Pas de zoom au double-tap ni au pincement (iOS), marges d'encoche (`safe-area`), textes adaptés au tactile, Concert proportionné en paysage. Vérifié en tactile émulé (`check.mjs`, iPhone portrait + paysage). Sur iPhone, le bouton silencieux coupe le son.
Test sur appareil : même Wi-Fi, `http://<ip-du-mac>:8080`.

## 🕹️ Machine à pince
Une pièce = 3 essais. 🥉 Bronze (40 % du prix d'une capsule) → capsules communes, 🥈 Argent (65 %) → rares, 🥇 Or (100 %) → super rares (+ parfois la dorée secrète). La couleur du haut d'une capsule = son set : on vise celle qu'on veut (flèches/ZQSD ou glisser le doigt, 12 s), on descend, on ferme au bon moment (anneau rouge → vert). Prise = centrage × timing ; elle peut glisser au décollage ou en route (85 % de tenue au mieux). La capsule gagnée tombe sur le plateau et s'ouvre normalement, avec une figurine de ce set et de cette rareté (les manquantes d'abord). Réglages dans `CLAW` en tête de `claw.js`.
