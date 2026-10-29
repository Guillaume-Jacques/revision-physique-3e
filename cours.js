/* =========================================================
   Cours complets — calés sur le cahier du professeur
   Thème 1 « Mouvement et interactions »
   - Chap. 1 Notion de vitesse (+ fiche « Étude du mouvement »)
   - Ch. II Distance de réaction, de freinage et d'arrêt
   Textes rédigés pour l'appli (pas de recopie du manuel).
   ========================================================= */

/* ---------- Schémas (SVG, couleurs du thème) ---------- */
const SVG = {
  trajectoires: `
  <svg viewBox="0 0 330 120" class="svg" role="img" aria-label="Trois trajectoires : rectiligne, circulaire, curviligne">
    <g class="s-dot">${[15, 35, 55, 75, 95].map((x) => `<circle cx="${x}" cy="60" r="4"/>`).join('')}</g>
    <line x1="10" y1="60" x2="100" y2="60" class="s-line dash"/>
    <text x="55" y="105" class="s-txt" text-anchor="middle">Rectiligne</text>
    <circle cx="165" cy="55" r="32" class="s-line dash"/>
    <g class="s-dot">${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${165 + 32 * Math.cos(a * Math.PI / 180)}" cy="${55 + 32 * Math.sin(a * Math.PI / 180)}" r="4"/>`).join('')}</g>
    <text x="165" y="105" class="s-txt" text-anchor="middle">Circulaire</text>
    <path d="M230 75 Q255 20 275 60 T320 45" class="s-line dash"/>
    <g class="s-dot"><circle cx="232" cy="72" r="4"/><circle cx="252" cy="45" r="4"/><circle cx="273" cy="57" r="4"/><circle cx="296" cy="62" r="4"/><circle cx="318" cy="46" r="4"/></g>
    <text x="275" y="105" class="s-txt" text-anchor="middle">Curviligne</text>
  </svg>`,
  chrono: `
  <svg viewBox="0 0 330 150" class="svg" role="img" aria-label="Chronophotographies : uniforme, accéléré, ralenti">
    ${[['Uniforme', [90, 135, 180, 225, 270, 315]], ['Accéléré', [90, 98, 114, 140, 176, 222]], ['Ralenti', [90, 136, 174, 204, 224, 234]]].map(([t, xs], r) => `
      <text x="4" y="${32 + r * 48}" class="s-txt b">${t}</text>
      <line x1="85" y1="${28 + r * 48}" x2="325" y2="${28 + r * 48}" class="s-line thin"/>
      <g class="s-dot">${xs.map((x) => `<circle cx="${x}" cy="${28 + r * 48}" r="5"/>`).join('')}</g>`).join('')}
    <text x="165" y="146" class="s-txt" text-anchor="middle">Une photo toutes les 0,1 s, le mobile va vers la droite →</text>
  </svg>`,
  triangle: `
  <svg viewBox="0 0 220 150" class="svg" style="max-width:240px" role="img" aria-label="Triangle d, v, t">
    <path d="M110 10 L205 140 L15 140 Z" class="s-line fill"/>
    <line x1="52" y1="88" x2="168" y2="88" class="s-line"/>
    <line x1="110" y1="88" x2="110" y2="140" class="s-line"/>
    <text x="110" y="72" class="s-big" text-anchor="middle">d</text>
    <text x="72" y="126" class="s-big" text-anchor="middle">v</text>
    <text x="148" y="126" class="s-big" text-anchor="middle">t</text>
    <text x="110" y="122" class="s-txt" text-anchor="middle">×</text>
  </svg>`,
  arret: `
  <svg viewBox="0 0 330 135" class="svg" role="img" aria-label="Distance d'arrêt = distance de réaction + distance de freinage">
    <rect x="10" y="40" width="130" height="26" rx="6" class="s-r1"/>
    <rect x="140" y="40" width="180" height="26" rx="6" class="s-r2"/>
    <text x="75" y="58" class="s-txt w" text-anchor="middle">dr : vitesse constante</text>
    <text x="230" y="58" class="s-txt w" text-anchor="middle">df : la voiture ralentit</text>
    <text x="10" y="28" class="s-txt b">👀 obstacle vu</text>
    <text x="140" y="28" class="s-txt b" text-anchor="middle">🦶 freinage</text>
    <text x="320" y="28" class="s-txt b" text-anchor="end">🛑 arrêt</text>
    <path d="M10 78 v8 h310 v-8" class="s-line"/>
    <text x="165" y="106" class="s-big" text-anchor="middle">da = dr + df</text>
    <text x="165" y="127" class="s-txt" text-anchor="middle">durée : ta = tr + tf</text>
  </svg>`,
  echo: `
  <svg viewBox="0 0 330 110" class="svg" role="img" aria-label="Écho : le son fait l'aller et le retour">
    <text x="12" y="70" style="font-size:30px">🧍</text>
    <path d="M300 20 L325 20 L325 100 L285 100 Z" class="s-r2"/>
    <text x="300" y="15" class="s-txt" text-anchor="middle">montagne</text>
    <path d="M50 45 H280" class="s-line arrow" marker-end="url(#ah)"/>
    <path d="M280 75 H50" class="s-line arrow" marker-end="url(#ah)"/>
    <text x="165" y="38" class="s-txt" text-anchor="middle">aller : d</text>
    <text x="165" y="95" class="s-txt" text-anchor="middle">retour : d</text>
    <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`,
};

/* ---------- Les leçons ---------- */
const COURS = [
  /* ======================= LEÇON 1 ======================= */
  {
    id: 'C1', chap: 'Chap. 1 — Notion de vitesse', title: 'Décrire un mouvement', icon: '🧭',
    cahier: 'Fiche « Étude du mouvement » (parties I, II et III)',
    skills: ['V1'],
    sections: [
      {
        title: 'Les mots de base',
        html: `
          <p>La partie de la physique qui étudie les mouvements s’appelle la <b>mécanique</b>.</p>
          <p>Le <b>mobile</b>, c’est ce qu’on observe pendant qu’il se déplace : une voiture, un ballon, un coureur… On peut même le réduire à un seul point.</p>
          <p>Le <b>référentiel</b>, c’est le « poste d’observation » : l’objet par rapport auquel on décide si le mobile bouge ou non. Ton prof en cite trois :</p>
          <table class="tbl">
            <tr><th>On regarde depuis…</th><th>Nom du référentiel</th></tr>
            <tr><td>le sol</td><td><b>terrestre</b></td></tr>
            <tr><td>le centre de la Terre</td><td><b>géocentrique</b> (géo = Terre)</td></tr>
            <tr><td>le centre du Soleil</td><td><b>héliocentrique</b> (hélio = Soleil)</td></tr>
          </table>`,
        retenir: 'Avant de dire qu’un objet bouge, on choisit d’où on le regarde : c’est le référentiel.',
        quiz: [
          { q: 'Pour étudier la Terre qui tourne autour du Soleil, on se place dans le référentiel :', choices: [
            { t: 'Héliocentrique', ok: true },
            { t: 'Géocentrique', msg: 'Géocentrique = centre de la Terre. Pour observer la Terre elle-même tourner autour du Soleil, on se met au centre du Soleil.' },
            { t: 'Terrestre', msg: 'Terrestre = le sol. On ne peut pas voir la Terre tourner autour du Soleil en restant debout dessus.' }] },
        ],
      },
      {
        title: 'Immobile… ou pas ? (relativité)',
        html: `
          <p>Un objet n’est jamais « en mouvement » tout court : il est en mouvement <b>par rapport à</b> quelque chose.</p>
          <p><b>Le test simple :</b> on prend un point sur chaque objet et on regarde la distance entre les deux. Si cette distance <b>change</b> au cours du temps, il y a mouvement l’un par rapport à l’autre. Si elle reste la même, ils sont immobiles l’un par rapport à l’autre.</p>
          <div class="ex"><b>Exemple :</b> tu es assise dans le bus.<br>
          • Par rapport à ton siège : la distance ne change pas → tu es <b>immobile</b>.<br>
          • Par rapport à l’arrêt de bus : la distance augmente → tu es <b>en mouvement</b>.</div>`,
        retenir: 'Toujours préciser « par rapport à quoi » : un même objet peut être immobile pour l’un et en mouvement pour l’autre.',
        quiz: [
          { q: 'Le conducteur d’une voiture qui roule est, <b>par rapport au volant</b> :', choices: [
            { t: 'Immobile', ok: true },
            { t: 'En mouvement', msg: 'La distance entre le conducteur et son volant ne change pas : il est immobile par rapport au volant (mais en mouvement par rapport à la route).' }] },
          { q: 'Un arbre au bord de la route est, <b>par rapport à la voiture qui passe</b> :', choices: [
            { t: 'En mouvement', ok: true },
            { t: 'Immobile', msg: 'Vu de la voiture, la distance avec l’arbre change : il est en mouvement par rapport à la voiture. C’est pour ça que les arbres « défilent » par la fenêtre !' }] },
        ],
      },
      {
        title: 'Les trajectoires',
        html: `
          <p>La <b>trajectoire</b>, c’est le chemin dessiné par toutes les positions successives du mobile. On regarde sa forme :</p>
          ${SVG.trajectoires}
          <ul class="fiche">
            <li>une droite → trajectoire <b>rectiligne</b></li>
            <li>un cercle ou un arc de cercle → trajectoire <b>circulaire</b></li>
            <li>une autre courbe → trajectoire <b>curviligne</b></li>
          </ul>
          <div class="ex"><b>L’exemple de ton cahier : la valve d’une roue de vélo.</b><br>
          • Vue par le cycliste (référentiel vélo) : la valve tourne en rond → <b>circulaire</b>.<br>
          • Vue par quelqu’un sur le trottoir : la roue avance en tournant, la valve dessine des arches → <b>curviligne</b>.<br>
          La trajectoire dépend donc elle aussi du référentiel.</div>`,
        retenir: 'Droite = rectiligne • cercle = circulaire • autre courbe = curviligne.',
        quiz: [
          { q: 'Une nacelle de grande roue à la fête foraine a une trajectoire :', choices: [
            { t: 'Circulaire', ok: true },
            { t: 'Curviligne', msg: 'C’est bien une courbe, mais quand cette courbe est un cercle, on utilise le mot plus précis : circulaire.' },
            { t: 'Rectiligne', msg: 'La nacelle tourne autour de l’axe de la roue : ce n’est pas une ligne droite.' }] },
        ],
      },
      {
        title: 'Quand la vitesse change',
        html: `
          <p>On compare les distances parcourues pendant des <b>durées égales</b> (par exemple chaque seconde) :</p>
          <table class="tbl">
            <tr><th>Les distances…</th><th>Le mouvement est…</th></tr>
            <tr><td>sont toutes <b>égales</b></td><td><b>uniforme</b> (vitesse constante)</td></tr>
            <tr><td><b>grandissent</b></td><td><b>accéléré</b> (la vitesse augmente)</td></tr>
            <tr><td><b>rapetissent</b></td><td><b>ralenti</b> ou décéléré (la vitesse diminue)</td></tr>
          </table>
          <p>Pour décrire complètement un mouvement, on donne <b>deux informations</b> : la forme de la trajectoire + l’évolution de la vitesse. Exemple : « rectiligne et accéléré ».</p>`,
        retenir: 'Distances égales = uniforme • de plus en plus grandes = accéléré • de plus en plus petites = ralenti.',
        quiz: [
          { q: 'Une voiture démarre au feu vert sur une route droite. Son mouvement est :', choices: [
            { t: 'Rectiligne et accéléré', ok: true },
            { t: 'Rectiligne et uniforme', msg: 'Au démarrage, la vitesse augmente : chaque seconde, la voiture parcourt plus de distance que la précédente. Ce n’est pas uniforme.' },
            { t: 'Curviligne et accéléré', msg: 'La route est droite : la trajectoire est rectiligne.' }] },
        ],
      },
      {
        title: 'Direction, sens et valeur',
        html: `
          <p>Donner une vitesse, ce n’est pas seulement donner un nombre. Pour la décrire complètement, il faut <b>trois informations</b> :</p>
          <table class="tbl">
            <tr><th>Caractéristique</th><th>Question à se poser</th><th>Exemple</th></tr>
            <tr><td><b>Direction</b></td><td>Sur quelle ligne le mobile se déplace-t-il à cet instant ?</td><td>horizontale</td></tr>
            <tr><td><b>Sens</b></td><td>Vers où, sur cette ligne ?</td><td>vers la droite</td></tr>
            <tr><td><b>Valeur</b></td><td>Combien, avec quelle unité ?</td><td>12 m/s</td></tr>
          </table>
          <p>On la dessine avec une <b>flèche</b> (le « vecteur vitesse ») : elle suit la direction, pointe dans le sens du mouvement, et elle est d’autant plus longue que la valeur est grande.</p>
          <div class="ex"><b>Exemple :</b> une voiture qui tourne sur un rond-point à vitesse constante. La <b>valeur</b> ne change pas (le compteur reste à 30 km/h), mais la <b>direction</b> change sans arrêt. Sa vitesse n’est donc pas la même d’un instant à l’autre !</div>`,
        retenir: 'Une vitesse = une direction + un sens + une valeur (avec son unité).',
        quiz: [
          { q: 'Une voiture fait le tour d’un rond-point en restant à 30 km/h. Qu’est-ce qui change ?', choices: [
            { t: 'La direction de sa vitesse', ok: true },
            { t: 'Rien du tout', msg: 'La valeur reste 30 km/h, mais la voiture tourne : la direction de sa vitesse change à chaque instant.' },
            { t: 'La valeur de sa vitesse', msg: 'Le compteur reste bloqué à 30 km/h : la valeur ne change pas. C’est la direction qui change.' }] },
        ],
      },
      {
        title: 'La chronophotographie',
        html: `
          <p>C’est une technique : on prend une photo à <b>intervalles réguliers</b> (par exemple toutes les 0,1 s) et on superpose toutes les photos sur une seule image. On voit alors d’un coup toutes les positions du mobile.</p>
          ${SVG.chrono}
          <p>Il suffit de regarder les écarts entre deux positions voisines : égaux, de plus en plus grands, ou de plus en plus petits.</p>
          <div class="ex"><b>Calculer une vitesse sur une chronophoto.</b><br>
          Entre deux photos (0,1 s), le motard avance de 1,5 m.<br>
          v = d ÷ t = 1,5 ÷ 0,1 = <b>15 m/s</b>, soit 15 × 3,6 = <b>54 km/h</b>.</div>`,
        retenir: 'Sur une chronophoto, les photos sont prises à intervalles de temps égaux : on compare simplement les écarts.',
        quiz: [
          { q: 'Sur une chronophotographie, les écarts entre les positions d’un ballon sont : 6 cm, 5 cm, 3 cm, 2 cm. Le mouvement est :', choices: [
            { t: 'Ralenti', ok: true },
            { t: 'Accéléré', msg: 'Les écarts diminuent : le ballon parcourt de moins en moins de distance à chaque photo, il ralentit.' },
            { t: 'Uniforme', msg: 'Uniforme voudrait dire des écarts tous égaux. Ici ils diminuent.' }] },
        ],
      },
    ],
    exos: [],
  },

  /* ======================= LEÇON 2 ======================= */
  {
    id: 'C2', chap: 'Chap. 1 — Notion de vitesse', title: 'Calculer une vitesse, une durée, une distance', icon: '🏎️',
    cahier: 'Chap. 1 : I) Vitesse moyenne • II) Temps de parcours • III) Distance parcourue',
    skills: ['V2', 'V3', 'V4', 'V5', 'V6'],
    sections: [
      {
        title: 'La vitesse moyenne',
        html: `
          <p>La <b>vitesse moyenne</b> d’un mobile, c’est la distance qu’il parcourt par unité de temps (par seconde, par heure…). On l’obtient en <b>divisant la distance par la durée</b> :</p>
          <div class="formula">v = d ÷ t</div>
          <table class="tbl">
            <tr><th></th><th>Unités du système international</th><th>Unités de la vie courante</th></tr>
            <tr><td><b>v</b> vitesse</td><td>m/s (ou m·s⁻¹)</td><td>km/h (ou km·h⁻¹)</td></tr>
            <tr><td><b>d</b> distance</td><td>m</td><td>km</td></tr>
            <tr><td><b>t</b> durée</td><td>s</td><td>h</td></tr>
          </table>
          <p>⚠️ L’unité de la vitesse dépend des unités utilisées : des <b>km</b> et des <b>h</b> donnent des <b>km/h</b> ; des <b>m</b> et des <b>s</b> donnent des <b>m/s</b>. Ne mélange jamais (pas de km avec des s !).</p>
          <div class="ex"><b>Exemple (exercice du cahier) :</b> un camion parcourt 300 km en 4 h.<br>v = 300 ÷ 4 = <b>75 km/h</b>.</div>`,
        retenir: 'v = d ÷ t : la distance en haut, la durée en bas.',
        quiz: [
          { q: 'Un vélo parcourt 30 km en 2 h. Quel calcul donne sa vitesse ?', choices: [
            { t: '30 ÷ 2 = 15 km/h', ok: true },
            { t: '2 ÷ 30', msg: 'C’est la division à l’envers. La distance (30) va en haut : v = d ÷ t.' },
            { t: '30 × 2 = 60 km/h', msg: 'Pour une vitesse, on divise : v = d ÷ t.' }] },
        ],
      },
      {
        title: 'Une seule formule, trois calculs',
        html: `
          <p>Avec la même relation, on peut calculer les trois grandeurs. Le triangle aide à s’en souvenir : <b>cache avec ton doigt ce que tu cherches</b>, il reste le calcul.</p>
          ${SVG.triangle}
          <table class="tbl">
            <tr><th>Je cherche…</th><th>Je cache…</th><th>Formule</th></tr>
            <tr><td>la vitesse</td><td>v → il reste d sur t</td><td><b>v = d ÷ t</b></td></tr>
            <tr><td>la durée (temps de parcours)</td><td>t → il reste d sur v</td><td><b>t = d ÷ v</b></td></tr>
            <tr><td>la distance parcourue</td><td>d → il reste v × t</td><td><b>d = v × t</b></td></tr>
          </table>
          <p>Petit contrôle de bon sens : dans les deux formules avec une division, c’est <b>toujours la distance qui est en haut</b>.</p>`,
        retenir: 'v = d ÷ t • t = d ÷ v • d = v × t',
        quiz: [
          { q: 'Je connais la distance et la vitesse. Pour trouver la durée, je calcule :', choices: [
            { t: 't = d ÷ v', ok: true },
            { t: 't = v ÷ d', msg: 'La distance est toujours en haut de la division : t = d ÷ v.' },
            { t: 't = d × v', msg: 'Cache t dans le triangle : il reste d au-dessus de v, donc une division.' }] },
        ],
      },
      {
        title: 'Le piège n°1 : les durées',
        html: `
          <p>Une heure ne fait <b>pas 100 minutes</b>, elle en fait <b>60</b>. Donc les minutes ne sont pas des « centièmes d’heure ».</p>
          <div class="piege">⚠️ 3 h 15 min n’est PAS 3,15 h !</div>
          <p><b>La méthode qui marche à tous les coups :</b></p>
          <div class="formula">heures + minutes ÷ 60 + secondes ÷ 3 600</div>
          <table class="tbl">
            <tr><th>Durée</th><th>Calcul</th><th>En heures</th></tr>
            <tr><td>3 h 15 min</td><td>3 + 15 ÷ 60</td><td><b>3,25 h</b></td></tr>
            <tr><td>2 h 48 min</td><td>2 + 48 ÷ 60</td><td><b>2,8 h</b></td></tr>
            <tr><td>30 min</td><td>30 ÷ 60</td><td><b>0,5 h</b></td></tr>
            <tr><td>11 h 32 min 15 s</td><td>11 + 32 ÷ 60 + 15 ÷ 3 600</td><td><b>≈ 11,54 h</b></td></tr>
          </table>
          <p>Même chose pour les secondes : <b>15 s = 15 ÷ 60 = 0,25 min</b> (et pas 0,15 min).</p>
          <p>💡 Astuce calculatrice : tape tout le calcul d’un coup et <b>n’arrondis qu’à la toute fin</b>.</p>`,
        retenir: '1 h = 60 min = 3 600 s. Pour convertir en heures : h + min ÷ 60 + s ÷ 3 600.',
        quiz: [
          { q: '1 h 30 min en heures, c’est :', choices: [
            { t: '1,5 h', ok: true },
            { t: '1,3 h', msg: '30 minutes, c’est une demi-heure : 30 ÷ 60 = 0,5. Donc 1,5 h.' },
            { t: '1,30 h', msg: 'Les minutes ne se recopient pas après la virgule : 30 ÷ 60 = 0,5 → 1,5 h.' }] },
          { q: '45 s en minutes, c’est :', choices: [
            { t: '0,75 min', ok: true },
            { t: '0,45 min', msg: 'Une minute fait 60 secondes, pas 100 : 45 ÷ 60 = 0,75 min.' }] },
        ],
      },
      {
        title: 'Passer des km/h aux m/s',
        html: `
          <p>1 km/h, c’est 1 000 m en 3 600 s. Comme 3 600 ÷ 1 000 = <b>3,6</b>, on utilise ce nombre magique :</p>
          <div class="formula">km/h ÷ 3,6 = m/s &nbsp;&nbsp;•&nbsp;&nbsp; m/s × 3,6 = km/h</div>
          <table class="tbl">
            <tr><th>km/h</th><th></th><th>m/s</th></tr>
            <tr><td>36 km/h</td><td>÷ 3,6</td><td>10 m/s</td></tr>
            <tr><td>90 km/h</td><td>÷ 3,6</td><td>25 m/s</td></tr>
            <tr><td>75 km/h</td><td>÷ 3,6</td><td>≈ 20,83 m/s</td></tr>
          </table>
          <p><b>Vérification :</b> la même vitesse s’écrit toujours avec un <b>plus petit nombre en m/s</b> qu’en km/h. Si ton résultat en m/s est plus grand, tu t’es trompée de sens.</p>`,
        retenir: 'Vers les m/s : ÷ 3,6 (le nombre rapetisse). Vers les km/h : × 3,6 (il grandit).',
        quiz: [
          { q: '72 km/h en m/s, c’est :', choices: [
            { t: '20 m/s', ok: true },
            { t: '259,2 m/s', msg: 'Tu as multiplié. Vers les m/s, le nombre doit devenir plus petit : 72 ÷ 3,6 = 20.' }] },
        ],
      },
      {
        title: 'Vitesse moyenne et vitesse instantanée',
        html: `
          <p>Avec v = d ÷ t, on obtient la vitesse <b>moyenne</b> sur tout le trajet. Pendant ce trajet, la voiture a pu s’arrêter à un feu puis rouler plus vite : la moyenne « lisse » tout ça.</p>
          <p>La vitesse <b>instantanée</b>, c’est la vitesse à un instant précis. Pour l’obtenir avec la formule, il faudrait mesurer la distance sur un intervalle de temps <b>très, très petit</b>, trop court pour que la vitesse ait le temps de changer.</p>
          <p>Dans la vie courante, on la mesure avec :</p>
          <ul class="fiche"><li>le <b>compteur de vitesse</b> d’un véhicule ;</li><li>le <b>radar</b>, qui utilise l’effet Doppler.</li></ul>`,
        retenir: 'Formule d ÷ t = vitesse moyenne. Compteur et radar = vitesse instantanée.',
        quiz: [
          { q: 'Un radar flashe une voiture à 97 km/h. Cette vitesse est :', choices: [
            { t: 'Instantanée', ok: true },
            { t: 'Moyenne', msg: 'Le radar mesure la vitesse au moment précis où la voiture passe devant lui : c’est la vitesse instantanée.' }] },
        ],
      },
      {
        title: 'Deux vitesses à connaître',
        html: `
          <table class="tbl">
            <tr><th></th><th>Vitesse</th><th>À savoir</th></tr>
            <tr><td>🔊 <b>Son</b> dans l’air</td><td><b>340 m/s</b></td><td>On l’appelle aussi « Mach 1 ». Le son a besoin de matière : il ne se propage pas dans le vide.</td></tr>
            <tr><td>💡 <b>Lumière</b> dans le vide (ou l’air)</td><td><b>300 000 km/s</b><br>= 3 × 10⁸ m/s</td><td>On la note <b>c</b> (comme « celeritas », vitesse en latin).</td></tr>
          </table>
          <div class="ex"><b>L’orage.</b> L’éclair et le tonnerre partent en même temps, mais la lumière arrive presque instantanément alors que le son prend son temps. Si tu entends le tonnerre 3 s après l’éclair : d = 340 × 3 = <b>1 020 m</b>. L’orage est à environ 1 km.</div>`,
        retenir: 'Son : 340 m/s • Lumière : c = 3 × 10⁸ m/s = 300 000 km/s.',
        quiz: [
          { q: 'Dans l’espace (dans le vide), on peut :', choices: [
            { t: 'Voir la lumière d’une étoile, mais pas entendre une explosion', ok: true },
            { t: 'Entendre une explosion lointaine', msg: 'Le son a besoin de matière (air, eau, solide) pour avancer. Dans le vide, il ne se propage pas.' }] },
        ],
      },
      {
        title: 'L’écho : l’aller-retour',
        html: `
          <p>Quand tu cries face à une montagne, le son va jusqu’à la montagne, rebondit, puis revient vers toi. Le chronomètre mesure donc <b>l’aller ET le retour</b>.</p>
          ${SVG.echo}
          <p><b>La méthode d’Ethan (exercice du cahier) :</b> il crie et lance le chronomètre en même temps, puis l’arrête quand il entend l’écho. Il a mesuré une durée t.</p>
          <ul class="fiche">
            <li>Distance totale parcourue par le son : 340 × t (aller + retour) ;</li>
            <li>Distance jusqu’à la montagne : la moitié.</li>
          </ul>
          <div class="formula">d = 340 × t ÷ 2</div>
          <div class="ex"><b>Exemple :</b> écho entendu au bout de 3 s → 340 × 3 = 1 020 m aller-retour → montagne à <b>510 m</b>.</div>`,
        retenir: 'Écho = aller + retour : on divise par 2. Tonnerre = trajet simple : on ne divise pas.',
        quiz: [
          { q: 'Un bateau envoie un son vers le fond de la mer et reçoit l’écho. Pour la profondeur, il faut :', choices: [
            { t: 'Diviser la distance totale par 2', ok: true },
            { t: 'Garder la distance totale', msg: 'Le son est descendu puis remonté : la distance totale vaut deux fois la profondeur.' }] },
        ],
      },
    ],
    exos: [
      {
        title: 'Le camion (exercice 1)',
        enonce: 'Un camion parcourt 300 km en 4 h. Calcule sa vitesse moyenne en km/h, puis en m/s.',
        steps: ['On cherche une vitesse : v = d ÷ t.', 'v = 300 ÷ 4 = 75 km/h.', 'En m/s : 75 ÷ 3,6 ≈ 20,83 m/s.'],
        rep: 'La vitesse moyenne du camion est de 75 km/h, soit environ 20,83 m/s.',
      },
      {
        title: 'La voiture (exercice 2)',
        enonce: 'Une voiture parcourt 300 km en 3 h 15 min. Calcule sa vitesse moyenne en km/h.',
        steps: ['On convertit d’abord la durée en heures : 3 + 15 ÷ 60 = 3,25 h.', 'v = d ÷ t = 300 ÷ 3,25.', 'v ≈ 92,3 km/h.'],
        rep: 'La vitesse moyenne de la voiture est d’environ 92,3 km/h.',
        piege: 'Diviser par 3,15 donne 95,2 km/h : faux, car 15 min ne font pas 0,15 h. Autre piège vu dans le cahier : diviser par 195 (des minutes) donne des km par minute, pas des km/h.',
      },
      {
        title: 'La moto (exercice 3)',
        enonce: 'Une moto parcourt 300 km en 2 h 48 min. Calcule sa vitesse moyenne en km/h.',
        steps: ['Durée en heures : 2 + 48 ÷ 60 = 2,8 h.', 'v = 300 ÷ 2,8.', 'v ≈ 107,1 km/h.'],
        rep: 'La vitesse moyenne de la moto est d’environ 107 km/h.',
      },
      {
        title: 'Le cycliste (exercice 4)',
        enonce: 'Un cycliste parcourt 300 km en 11 h 32 min 15 s. Calcule sa vitesse moyenne en km/h.',
        steps: ['Durée en heures : 11 + 32 ÷ 60 + 15 ÷ 3 600 ≈ 11,5375 h.', 'v = d ÷ t = 300 ÷ 11,5375 (distance en haut !).', 'v ≈ 26,0 km/h.'],
        rep: 'La vitesse moyenne du cycliste est d’environ 26 km/h.',
        piege: 'Dans le cahier, deux erreurs : 15 s écrites 0,15 min (c’est 0,25 min), et la division faite à l’envers (692,15 ÷ 300). La distance va toujours en haut.',
      },
      {
        title: 'L’avion (exercice 5)',
        enonce: 'Un avion vole à la vitesse moyenne de 850 km/h pendant 5 h 35 min et 12 s. Quelle distance a-t-il parcourue ?',
        steps: ['On cherche une distance : d = v × t.', 'Durée en heures : 5 + 35 ÷ 60 + 12 ÷ 3 600 ≈ 5,5867 h (on garde tous les chiffres).', 'd = 850 × 5,5867 ≈ 4 749 km.'],
        rep: 'L’avion a parcouru environ 4 749 km.',
        piege: 'Arrondir la durée à 5,58 h trop tôt donne 4 743 km : 6 km d’écart. On n’arrondit qu’à la fin.',
      },
      {
        title: 'Ethan et la montagne (exercice 6)',
        enonce: 'Ethan est à côté d’une montagne et veut connaître la distance qui l’en sépare. Il a un chronomètre et une calculatrice. Comment faire ? (Exemple : écho entendu au bout de 2,4 s.)',
        steps: ['Il crie et démarre le chronomètre en même temps ; il l’arrête quand il entend l’écho.', 'Pendant ce temps, le son a fait l’aller ET le retour : distance totale = 340 × t.', 'Distance de la montagne : d = 340 × t ÷ 2. Avec 2,4 s : 340 × 2,4 ÷ 2 = 408 m.'],
        rep: 'La montagne est à 340 × t ÷ 2 ; avec 2,4 s, elle est à 408 m.',
      },
      {
        title: 'Le sprinteur (exercice 7)',
        enonce: 'Quel temps faudrait-il à un sprinteur courant à 44,5 km/h pour parcourir 250 mètres ?',
        steps: ['La distance est en mètres : on convertit la vitesse en m/s. 44,5 ÷ 3,6 ≈ 12,36 m/s.', 'On cherche une durée : t = d ÷ v.', 't = 250 ÷ 12,36 ≈ 20,2 s.'],
        rep: 'Il lui faudrait environ 20,2 secondes.',
        piege: 'Calculer 250 ÷ 44,5 mélange des mètres et des km/h : le résultat ne veut rien dire.',
      },
    ],
  },

  /* ======================= LEÇON 3 ======================= */
  {
    id: 'C3', chap: 'Ch. II — Distance d’arrêt', title: 'Réaction, freinage et arrêt', icon: '🛑',
    cahier: 'Ch. II : Distance de réaction, de freinage et d’arrêt',
    skills: ['V7', 'V8'],
    sections: [
      {
        title: 'Freiner, ça prend de la place',
        html: `
          <p>Un cyclomoteur roule à 50 km/h. Soudain, un obstacle ! Entre le moment où le conducteur le <b>voit</b> et le moment où il est <b>complètement arrêté</b>, il continue d’avancer en deux temps :</p>
          ${SVG.arret}
          <ul class="fiche">
            <li><b>Temps de réaction tr</b> : de « je vois l’obstacle » à « j’appuie sur le frein ». Pendant ce temps, on roule encore <b>à vitesse constante</b> : on parcourt la <b>distance de réaction dr</b>.</li>
            <li><b>Temps de freinage tf</b> : de « j’appuie sur le frein » à « je suis arrêté ». On ralentit : on parcourt la <b>distance de freinage df</b>.</li>
            <li><b>Temps d’arrêt ta</b> et <b>distance d’arrêt da</b> : le total, de « je vois » à « je suis arrêté ».</li>
          </ul>
          <div class="formula">da = dr + df &nbsp;&nbsp;•&nbsp;&nbsp; ta = tr + tf</div>`,
        retenir: 'Distance d’arrêt = distance de réaction + distance de freinage.',
        quiz: [
          { q: 'Pendant le temps de réaction, la voiture :', choices: [
            { t: 'Roule toujours à la même vitesse', ok: true },
            { t: 'Commence à ralentir', msg: 'Le conducteur n’a pas encore touché le frein : la vitesse ne change pas encore.' }] },
        ],
      },
      {
        title: 'La distance de réaction',
        html: `
          <p>Pendant le temps de réaction, la vitesse est constante, donc on utilise la formule de la distance :</p>
          <div class="formula">dr = v × tr &nbsp;(v en m/s, tr en s → dr en m)</div>
          <div class="ex"><b>Exemple :</b> une voiture roule à 90 km/h, le conducteur réagit en 1,2 s.<br>
          1) v = 90 ÷ 3,6 = 25 m/s<br>
          2) dr = 25 × 1,2 = <b>30 m</b></div>
          <p>Le temps de réaction dépend <b>du conducteur</b> : ses réflexes, son âge, son état (alcool, drogue, médicaments, fatigue) et sa concentration (téléphone, discussion, enfants à l’arrière…).</p>
          <div class="piege">⚠️ Prends toujours le temps de réaction donné dans l’énoncé : 1,2 s n’est pas 1 s !</div>`,
        retenir: 'dr = v × tr, avec la vitesse en m/s. Le temps de réaction dépend du conducteur.',
        quiz: [
          { q: 'À 72 km/h (20 m/s) avec un temps de réaction de 1,5 s, la distance de réaction est :', choices: [
            { t: '30 m', ok: true },
            { t: '108 m', msg: 'Tu as utilisé 72 km/h directement. Il faut la vitesse en m/s : 20 × 1,5 = 30 m.' },
            { t: '20 m', msg: 'Tu as pris 1 s de réaction. L’énoncé dit 1,5 s : 20 × 1,5 = 30 m.' }] },
        ],
      },
      {
        title: 'La distance de freinage',
        html: `
          <p>Dans les exercices de ton prof, la distance de freinage est donnée par :</p>
          <div class="formula">df = k × v² &nbsp;(v en m/s)</div>
          <table class="tbl">
            <tr><th>Route</th><th>Valeur de k</th></tr>
            <tr><td>sèche</td><td>k = 0,08</td></tr>
            <tr><td>mouillée</td><td>k = 0,14</td></tr>
          </table>
          <p><b>v²</b> veut dire v × v. Sur la calculatrice : la touche x² ou tape 25 × 25.</p>
          <div class="ex"><b>Exemple :</b> à 25 m/s sur route sèche : df = 0,08 × 25² = 0,08 × 625 = <b>50 m</b>.</div>
          <p><b>Pourquoi la vitesse est si dangereuse :</b> à cause du carré, si la vitesse <b>double</b>, la distance de freinage est multipliée par <b>4</b> (2² = 4).</p>`,
        retenir: 'df = k × v² : ne pas oublier le carré, et la vitesse en m/s.',
        quiz: [
          { q: 'Si on roule deux fois plus vite, la distance de freinage est :', choices: [
            { t: 'Multipliée par 4', ok: true },
            { t: 'Multipliée par 2', msg: 'La vitesse est au carré dans la formule : 2 × 2 = 4. C’est tout l’intérêt de cette formule !' }] },
        ],
      },
      {
        title: 'Qu’est-ce qui allonge quoi ?',
        html: `
          <p>Le grand tableau de ton cahier, à comprendre plutôt qu’à apprendre par cœur. Pose-toi une seule question : <b>est-ce que ça touche le conducteur (réaction) ou la voiture et la route (freinage) ?</b></p>
          <table class="tbl c">
            <tr><th>Facteur</th><th>dr</th><th>df</th><th>da</th></tr>
            <tr><td>La vitesse</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Alcool, drogues, médicaments</td><td>✅</td><td>—</td><td>✅</td></tr>
            <tr><td>Fatigue, téléphone, distraction</td><td>✅</td><td>—</td><td>✅</td></tr>
            <tr><td>État des freins</td><td>—</td><td>✅</td><td>✅</td></tr>
            <tr><td>État des pneus</td><td>—</td><td>✅</td><td>✅</td></tr>
            <tr><td>Chaussée (mouillée, glissante, trous)</td><td>—</td><td>✅</td><td>✅</td></tr>
            <tr><td>Météo (pluie, verglas…)</td><td>—</td><td>✅</td><td>✅</td></tr>
            <tr><td>Masse du véhicule, chargement</td><td>—</td><td>✅</td><td>✅</td></tr>
          </table>
          <p>Logique : tout ce qui allonge dr <b>ou</b> df allonge forcément da. Et la <b>vitesse</b> est la seule qui agit sur les deux.</p>`,
        retenir: 'Conducteur → réaction. Véhicule, route, météo → freinage. Vitesse → les deux.',
        quiz: [
          { q: 'Des pneus usés allongent :', choices: [
            { t: 'La distance de freinage (donc aussi d’arrêt)', ok: true },
            { t: 'La distance de réaction', msg: 'Les pneus ne changent pas la vitesse à laquelle le conducteur réagit : ils jouent sur le freinage.' }] },
          { q: 'Le conducteur regarde son téléphone. Cela allonge :', choices: [
            { t: 'La distance de réaction (donc aussi d’arrêt)', ok: true },
            { t: 'La distance de freinage', msg: 'Le téléphone n’abîme pas les freins : il retarde le moment où le conducteur appuie dessus.' }] },
        ],
      },
      {
        title: 'La méthode complète',
        html: `
          <p>Pour un exercice « calcule la distance d’arrêt », suis toujours les mêmes étapes :</p>
          <ol class="fiche">
            <li>Convertir la vitesse en <b>m/s</b> (÷ 3,6).</li>
            <li>Distance de réaction : <b>dr = v × tr</b> (avec le tr de l’énoncé).</li>
            <li>Distance de freinage : <b>df = k × v²</b> (le bon k : sec ou mouillé).</li>
            <li>Distance d’arrêt : <b>da = dr + df</b>.</li>
            <li>Phrase réponse avec l’unité.</li>
          </ol>
          <div class="ex"><b>90 km/h, tr = 1,2 s, route sèche :</b><br>
          v = 25 m/s • dr = 30 m • df = 0,08 × 625 = 50 m • da = 30 + 50 = <b>80 m</b>.</div>`,
        retenir: 'm/s → dr → df → da = dr + df → phrase.',
        quiz: [
          { q: 'dr = 30 m et df = 87,5 m. La distance d’arrêt vaut :', choices: [
            { t: '117,5 m', ok: true },
            { t: '87,5 m', msg: 'C’est seulement la distance de freinage. Il faut ajouter la distance de réaction : 30 + 87,5.' },
            { t: '57,5 m', msg: 'On additionne les deux distances, on ne les soustrait pas.' }] },
        ],
      },
      {
        title: 'Lire la question jusqu’au bout',
        html: `
          <p>Les derniers exercices du cahier ne demandent pas une distance, mais une <b>comparaison</b>. Il faut répondre exactement à la question.</p>
          <p><b>Augmentation en pourcentage :</b></p>
          <div class="formula">(nouvelle − ancienne) ÷ ancienne × 100</div>
          <p>On divise toujours par la valeur <b>de départ</b> (ici, celle de la route sèche).</p>
          <p><b>Gain de temps :</b></p>
          <div class="formula">ancienne durée − nouvelle durée</div>
          <p>Calculer la nouvelle durée n’est qu’une <b>étape</b> : le gain, c’est la différence.</p>`,
        retenir: 'Avant d’écrire la réponse, relis la question : une augmentation et un gain sont des différences.',
        quiz: [
          { q: 'Un trajet passe de 20 min à 16 min 40 s. Le gain de temps est :', choices: [
            { t: '3 min 20 s', ok: true },
            { t: '16 min 40 s', msg: '16 min 40 s est la nouvelle durée. Le gain, c’est ce qu’on économise : 20 min − 16 min 40 s = 3 min 20 s.' }] },
        ],
      },
    ],
    exos: [
      {
        title: 'Distance d’arrêt sur route sèche',
        enonce: 'Calcule la distance d’arrêt d’un véhicule roulant à 90 km/h, avec un conducteur ayant un temps de réaction de 1,2 s, sur route sèche (df = k × v², k = 0,08).',
        steps: ['v = 90 ÷ 3,6 = 25 m/s.', 'dr = v × tr = 25 × 1,2 = 30 m.', 'df = 0,08 × 25² = 0,08 × 625 = 50 m.', 'da = dr + df = 30 + 50 = 80 m.'],
        rep: 'Sur route sèche, la distance d’arrêt est de 80 m.',
        piege: 'Dans le cahier, la réaction a été calculée avec 1 s (25 m) au lieu de 1,2 s : on obtient 75 m au lieu de 80 m.',
      },
      {
        title: 'Distance d’arrêt sur route mouillée',
        enonce: 'Même véhicule (90 km/h, tr = 1,2 s), mais sur route mouillée (k = 0,14).',
        steps: ['dr ne change pas : la route ne change pas les réflexes du conducteur. dr = 30 m.', 'df = 0,14 × 625 = 87,5 m.', 'da = 30 + 87,5 = 117,5 m.'],
        rep: 'Sur route mouillée, la distance d’arrêt est de 117,5 m.',
      },
      {
        title: 'Augmentation de la distance de freinage',
        enonce: 'Quelle est l’augmentation en pourcentage de la distance de freinage sur route mouillée par rapport à la route sèche ?',
        steps: ['Valeurs : 50 m (sec) → 87,5 m (mouillé).', 'Augmentation : 87,5 − 50 = 37,5 m.', 'En % : 37,5 ÷ 50 × 100 = 75 %.'],
        rep: 'La distance de freinage augmente de 75 %.',
        piege: '87,5 ÷ 50 × 100 = 175 % : c’est la nouvelle distance comparée à l’ancienne, pas l’augmentation.',
      },
      {
        title: 'Augmentation de la distance d’arrêt',
        enonce: 'Même question pour la distance d’arrêt.',
        steps: ['Valeurs : 80 m (sec) → 117,5 m (mouillé).', 'Augmentation : 117,5 − 80 = 37,5 m.', 'En % : 37,5 ÷ 80 × 100 ≈ 46,9 %.'],
        rep: 'La distance d’arrêt augmente d’environ 47 %.',
        piege: 'Dans le cahier : 37,5 ÷ 50 × 100 = 75 %. Faux, car on doit diviser par l’ancienne distance d’arrêt (80 m), pas par l’ancienne distance de freinage.',
      },
      {
        title: 'Le gain de temps',
        enonce: 'Quel est le gain de temps si un automobiliste roule à 60 km/h au lieu de 50 km/h, sur un trajet qui dure 20 min à 50 km/h ?',
        steps: ['Longueur du trajet : d = v × t = 50 × 20 ÷ 60 ≈ 16,67 km.', 'Nouvelle durée à 60 km/h : t = d ÷ v = 16,67 ÷ 60 ≈ 0,2778 h = 16,67 min = 16 min 40 s.', 'Gain : 20 min − 16 min 40 s = 3 min 20 s.'],
        rep: 'Le gain de temps n’est que de 3 min 20 s.',
        piege: 'Le cahier s’arrête à 16 min 40 s : c’est la nouvelle durée, pas le gain. Et 3 min 20 s gagnées… contre une distance d’arrêt bien plus longue !',
      },
    ],
  },
];
