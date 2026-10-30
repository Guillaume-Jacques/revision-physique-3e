/* =========================================================
   Leçons « en avance sur la classe » (rédigées le 30/10/2026)
   - C4 L'énergie cinétique (Thème 3, suite logique de la distance d'arrêt)
   - C5 Poids et masse (Thème 1, interactions)
   Formulations, exemples et nombres propres à l'appli.
   ========================================================= */

Object.assign(SVG, {
  poids: `
  <svg viewBox="0 0 330 170" class="svg" role="img" aria-label="La flèche du poids part du centre de l’objet, verticale, vers le bas">
    <rect x="115" y="20" width="100" height="70" rx="10" class="s-r2"/>
    <text x="165" y="14" class="s-txt" text-anchor="middle">valise</text>
    <circle cx="165" cy="55" r="5" class="s-head"/>
    <path d="M165 55 V150" class="s-line arrow" marker-end="url(#ah2)"/>
    <text x="175" y="125" class="s-big">P</text>
    <text x="20" y="60" class="s-txt">point d’application :</text><text x="20" y="76" class="s-txt">le centre</text>
    <text x="230" y="110" class="s-txt">direction : verticale</text>
    <text x="230" y="128" class="s-txt">sens : vers le bas</text>
    <text x="230" y="146" class="s-txt">valeur : P = m × g</text>
    <defs><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`,
  chute: `
  <svg viewBox="0 0 330 150" class="svg" role="img" aria-label="Pendant une chute, l’énergie de position se convertit en énergie cinétique">
    <circle cx="60" cy="20" r="9" class="s-head"/><circle cx="60" cy="70" r="9" class="s-head"/><circle cx="60" cy="125" r="9" class="s-head"/>
    <line x1="20" y1="140" x2="100" y2="140" class="s-line"/>
    <rect x="130" y="12" width="70" height="16" rx="4" class="s-r1"/><rect x="200" y="12" width="6" height="16" rx="3" class="s-r2"/>
    <rect x="130" y="62" width="38" height="16" rx="4" class="s-r1"/><rect x="168" y="62" width="38" height="16" rx="4" class="s-r2"/>
    <rect x="130" y="117" width="4" height="16" rx="2" class="s-r1"/><rect x="134" y="117" width="72" height="16" rx="4" class="s-r2"/>
    <text x="215" y="25" class="s-txt">haut : surtout position</text>
    <text x="215" y="75" class="s-txt">moitié / moitié</text>
    <text x="215" y="130" class="s-txt">bas : surtout cinétique</text>
  </svg>`,
});

COURS.push(
  /* ======================= LEÇON 4 ======================= */
  {
    id: 'C4', chap: 'En avance — L’énergie', title: 'L’énergie cinétique', icon: '⚡', ahead: true,
    cahier: 'pas encore dans ton cahier : c’est la suite logique de la distance d’arrêt.',
    skills: ['E1', 'E2'],
    sections: [
      {
        title: 'Les formes d’énergie',
        html: `
          <p>L’énergie, c’est ce qui permet de faire bouger, chauffer, éclairer… Elle existe sous plusieurs <b>formes</b> :</p>
          <table class="tbl">
            <tr><th>Forme</th><th>Exemple</th></tr>
            <tr><td>cinétique</td><td>une voiture qui roule</td></tr>
            <tr><td>de position</td><td>un rocher en haut d’une falaise</td></tr>
            <tr><td>thermique</td><td>de l’eau chaude</td></tr>
            <tr><td>électrique</td><td>le courant d’une prise</td></tr>
            <tr><td>chimique</td><td>l’essence, un aliment, une pile</td></tr>
            <tr><td>lumineuse</td><td>la lumière d’une lampe</td></tr>
          </table>
          <p>Attention : le Soleil, le vent ou une pile sont des <b>sources</b>. Ce qu’ils fournissent, ce sont des <b>formes</b> d’énergie.</p>`,
        retenir: 'Une forme d’énergie (cinétique, thermique, électrique…) n’est pas une source (Soleil, vent, pile).',
        quiz: [
          { q: 'Une voiture qui roule possède surtout de l’énergie :', choices: [
            { t: 'cinétique', ok: true }, { t: 'électrique', msg: 'L’énergie liée au mouvement s’appelle énergie cinétique.' }, { t: 'lumineuse', msg: 'Le mouvement, c’est l’énergie cinétique.' }] },
        ],
      },
      {
        title: 'L’énergie ne disparaît pas',
        html: `
          <p>L’énergie ne se crée pas et ne se perd pas : elle <b>passe d’une forme à une autre</b>. On dit qu’elle est <b>convertie</b>.</p>
          <div class="ex"><b>Exemple :</b> un grille-pain reçoit de l’énergie électrique et la convertit en énergie thermique.</div>
          <p>Souvent, une partie de l’énergie part sous une forme qu’on ne voulait pas (de la chaleur, en général). On fait alors un bilan :</p>
          <div class="formula">énergie reçue = énergie utile + énergie perdue</div>
          <p>Dans une copie, on évite donc « produire » ou « consommer » de l’énergie : on écrit « convertir ».</p>`,
        retenir: 'L’énergie se conserve : elle est convertie, jamais créée ni détruite.',
        quiz: [
          { q: 'Une lampe reçoit 100 J d’énergie électrique et donne 10 J de lumière. Que deviennent les 90 J restants ?', choices: [
            { t: 'Ils sont convertis en chaleur', ok: true }, { t: 'Ils disparaissent', msg: 'L’énergie ne disparaît jamais : ici, elle chauffe la lampe.' }, { t: 'Ils restent dans la lampe sous forme électrique', msg: 'La lampe ne stocke pas l’énergie : elle la convertit en lumière et en chaleur.' }] },
        ],
      },
      {
        title: 'La formule de l’énergie cinétique',
        html: `
          <p>Tout objet qui bouge possède une <b>énergie cinétique</b>, notée Ec. Elle dépend de sa masse et de sa vitesse :</p>
          <div class="formula">Ec = ½ × m × v²</div>
          <table class="tbl">
            <tr><th>Lettre</th><th>Grandeur</th><th>Unité obligatoire</th></tr>
            <tr><td>Ec</td><td>énergie cinétique</td><td>joule (J)</td></tr>
            <tr><td>m</td><td>masse</td><td>kilogramme (kg)</td></tr>
            <tr><td>v</td><td>vitesse</td><td>mètre par seconde (m/s)</td></tr>
          </table>
          <p>v² se lit « v au carré » et veut dire <b>v × v</b>. Si la vitesse est donnée en km/h, on divise d’abord par 3,6.</p>`,
        retenir: 'Ec = ½ × m × v², avec m en kg, v en m/s et Ec en joules.',
        quiz: [
          { q: 'Pour calculer Ec, la vitesse doit être en :', choices: [
            { t: 'm/s', ok: true }, { t: 'km/h', msg: 'Avec des km/h, le résultat ne serait pas en joules : on convertit d’abord (÷ 3,6).' }] },
          { q: '5², c’est :', choices: [
            { t: '25', ok: true }, { t: '10', msg: '5² = 5 × 5 = 25. Ce n’est pas 5 × 2.' }, { t: '52', msg: 'Le petit 2 veut dire « au carré » : 5 × 5 = 25.' }] },
        ],
      },
      {
        title: 'Un calcul pas à pas',
        html: `
          <p><b>Énoncé :</b> une voiture de 1 000 kg roule à 72 km/h. Calcule son énergie cinétique.</p>
          <ol class="steps">
            <li>🎯 On cherche une énergie cinétique, en joules.</li>
            <li>📐 Ec = ½ × m × v²</li>
            <li>🔁 La vitesse doit être en m/s : 72 ÷ 3,6 = 20 m/s.</li>
            <li>🧮 v² = 20 × 20 = 400. Ec = 0,5 × 1 000 × 400 = 200 000 J.</li>
            <li>✍️ L’énergie cinétique de la voiture est de 200 000 J.</li>
          </ol>
          <p>💡 À la calculatrice, tape <b>0,5 × 1000 × 20²</b> : la touche x² évite d’oublier le carré.</p>`,
        retenir: 'Méthode : conversion en m/s → carré de la vitesse → × masse → × 0,5.',
        quiz: [
          { q: 'Un ballon de 0,5 kg va à 10 m/s. Ec = ?', choices: [
            { t: '25 J', ok: true }, { t: '50 J', msg: 'Tu as oublié le ½ : 0,5 × 0,5 × 100 = 25 J.' }, { t: '2,5 J', msg: 'N’oublie pas le carré : 10² = 100, donc 0,5 × 0,5 × 100 = 25 J.' }] },
        ],
      },
      {
        title: 'Masse ou vitesse : qui compte le plus ?',
        html: `
          <p>Comparons deux changements pour une voiture :</p>
          <table class="tbl">
            <tr><th>Changement</th><th>Effet sur Ec</th></tr>
            <tr><td>masse × 2</td><td>Ec × 2</td></tr>
            <tr><td>vitesse × 2</td><td><b>Ec × 4</b> (2 × 2)</td></tr>
            <tr><td>vitesse × 3</td><td><b>Ec × 9</b> (3 × 3)</td></tr>
          </table>
          <p>C’est le <b>carré</b> qui fait la différence : la vitesse compte beaucoup plus que la masse.</p>`,
        retenir: 'Vitesse × 2 → Ec × 4. Masse × 2 → Ec × 2.',
        quiz: [
          { q: 'Une moto passe de 30 km/h à 90 km/h. Son énergie cinétique est multipliée par :', choices: [
            { t: '9', ok: true }, { t: '3', msg: 'La vitesse est multipliée par 3, mais elle est au carré : 3 × 3 = 9.' }, { t: '60', msg: 'On regarde le rapport 90 ÷ 30 = 3, puis le carré : 9.' }] },
        ],
      },
      {
        title: 'Chute, freinage et sécurité routière',
        html: `
          <p><b>Pendant une chute</b>, l’objet perd de la hauteur et gagne de la vitesse : son énergie de position se convertit en énergie cinétique.</p>
          ${SVG.chute}
          <p><b>Pendant un freinage</b>, les freins convertissent l’énergie cinétique en énergie thermique (ils chauffent). Plus il y a d’énergie cinétique, plus il faut de distance pour tout convertir.</p>
          <div class="piege">⚠️ À 100 km/h, une voiture a 4 fois plus d’énergie cinétique qu’à 50 km/h : sa distance de freinage est environ 4 fois plus longue. C’est le lien avec df = k × v² de ton cahier.</div>`,
        retenir: 'Chute : position → cinétique. Freinage : cinétique → thermique. Df suit v², comme Ec.',
        quiz: [
          { q: 'Pourquoi la distance de freinage augmente-t-elle beaucoup avec la vitesse ?', choices: [
            { t: 'Parce que l’énergie cinétique à convertir augmente comme v²', ok: true }, { t: 'Parce que le conducteur est plus fatigué', msg: 'La fatigue joue sur le temps de réaction, pas sur le freinage.' }, { t: 'Parce que la voiture est plus lourde', msg: 'La masse ne change pas avec la vitesse.' }] },
        ],
      },
    ],
    exos: [
      { title: 'Ec d’un cycliste', enonce: 'Un cycliste et son vélo ont une masse totale de 75 kg. Ils roulent à 8 m/s. Calcule leur énergie cinétique.', ans: 2400, unit: 'J',
        steps: ['🎯 On cherche Ec, en joules. 📐 Ec = ½ × m × v².', '🔁 Unités : m = 75 kg et v = 8 m/s, rien à convertir.', '🧮 v² = 8 × 8 = 64 ; Ec = 0,5 × 75 × 64 = 2 400 J.'], rep: 'L’énergie cinétique du cycliste est de 2 400 J.', piege: 'Calculer 0,5 × 75 × 8 = 300 : on a oublié le carré.' },
      { title: 'Ec d’une voiture en ville', enonce: 'Une voiture de 1 200 kg roule à 54 km/h. Calcule son énergie cinétique.', ans: 135000, unit: 'J',
        steps: ['🔁 54 km/h ÷ 3,6 = 15 m/s.', '🧮 v² = 15 × 15 = 225.', '🧮 Ec = 0,5 × 1 200 × 225 = 135 000 J.'], rep: 'L’énergie cinétique de la voiture est de 135 000 J.', piege: 'Garder 54 km/h dans la formule donne un résultat 13 fois trop grand.' },
      { title: 'Ec d’une balle de tennis', enonce: 'Une balle de tennis de 58 g est servie à 50 m/s. Calcule son énergie cinétique.', ans: 72.5, unit: 'J',
        steps: ['🔁 La masse doit être en kg : 58 g ÷ 1 000 = 0,058 kg.', '🧮 v² = 50 × 50 = 2 500.', '🧮 Ec = 0,5 × 0,058 × 2 500 = 72,5 J.'], rep: 'L’énergie cinétique de la balle est de 72,5 J.', piege: 'Laisser 58 g donne 72 500 J : mille fois trop.' },
      { title: 'Vitesse doublée', enonce: 'Une voiture roulait à 45 km/h, elle passe à 90 km/h. Par combien est multipliée son énergie cinétique ?', ans: 4, unit: '',
        steps: ['La masse ne change pas ; la vitesse est multipliée par 90 ÷ 45 = 2.', 'Dans la formule, la vitesse est au carré : 2 × 2 = 4.'], rep: 'Son énergie cinétique est multipliée par 4.', piege: 'Répondre 2 : c’est le cas pour la masse, pas pour la vitesse.' },
      { title: 'Masse doublée', enonce: 'Un camion vide de 5 000 kg et le même camion chargé (10 000 kg) roulent à la même vitesse. Par combien l’énergie cinétique du camion chargé est-elle multipliée ?', ans: 2, unit: '',
        steps: ['La vitesse est la même ; la masse est multipliée par 10 000 ÷ 5 000 = 2.', 'La masse n’est pas au carré dans la formule : Ec est multipliée par 2.'], rep: 'L’énergie cinétique du camion chargé est 2 fois plus grande.' },
      { title: 'Le scooter', enonce: 'Un scooter et son pilote (masse totale 150 kg) roulent à 36 km/h. Calcule leur énergie cinétique.', ans: 7500, unit: 'J',
        steps: ['🔁 36 ÷ 3,6 = 10 m/s.', '🧮 Ec = 0,5 × 150 × 10² = 0,5 × 150 × 100 = 7 500 J.'], rep: 'L’énergie cinétique est de 7 500 J.' },
      { title: 'Quelle forme d’énergie ?', enonce: 'Donne la conversion principale dans chaque cas : 1) un sèche-cheveux ; 2) une pomme qui tombe ; 3) une voiture qui freine ; 4) un panneau solaire.',
        steps: ['On repère ce que l’objet reçoit, puis ce qu’il donne d’utile.', '1) électrique → thermique (et un peu cinétique pour le ventilateur).', '2) position → cinétique.', '3) cinétique → thermique (freins chauds).', '4) lumineuse → électrique.'],
        rep: '1) électrique → thermique • 2) position → cinétique • 3) cinétique → thermique • 4) lumineuse → électrique.', piege: 'Ne pas écrire « le panneau produit de l’électricité à partir de rien » : il convertit la lumière.' },
      { title: 'Bilan d’un moteur', enonce: 'Un moteur reçoit 1 000 J d’énergie électrique. Il fournit 700 J d’énergie cinétique. Combien d’énergie est perdue sous forme de chaleur ?', ans: 300, unit: 'J',
        steps: ['📐 énergie reçue = énergie utile + énergie perdue.', '🧮 énergie perdue = 1 000 − 700 = 300 J.'], rep: 'Le moteur perd 300 J sous forme de chaleur.' },
      { title: 'Le skieur', enonce: 'Un skieur part d’en haut d’une piste avec 12 000 J d’énergie de position (sans vitesse). En bas, s’il n’y avait aucun frottement, quelle serait son énergie cinétique ?', ans: 12000, unit: 'J',
        steps: ['L’énergie se conserve : ce qui est perdu en hauteur est gagné en vitesse.', 'Sans frottements, toute l’énergie de position devient cinétique : 12 000 J.'], rep: 'Son énergie cinétique serait de 12 000 J.', piege: 'Avec des frottements, une partie part en chaleur : l’énergie cinétique serait plus petite.' },
      { title: 'Freinage et vitesse', enonce: 'À 50 km/h, une voiture freine sur 14 m. Sur la même route, quelle distance de freinage peut-on prévoir à 100 km/h ?', ans: 56, unit: 'm',
        steps: ['La vitesse est multipliée par 2.', 'La distance de freinage suit v² (comme l’énergie cinétique) : elle est multipliée par 2 × 2 = 4.', '🧮 14 × 4 = 56 m.'], rep: 'À 100 km/h, la distance de freinage est d’environ 56 m.', piege: 'Répondre 28 m : on a oublié que la vitesse compte au carré.' },
    ],
  },

  /* ======================= LEÇON 5 ======================= */
  {
    id: 'C5', chap: 'En avance — Les interactions', title: 'Poids et masse', icon: '⚖️', ahead: true,
    cahier: 'pas encore dans ton cahier : prochain chapitre probable après la vitesse.',
    skills: ['P1', 'P2'],
    sections: [
      {
        title: 'La masse',
        html: `
          <p>La <b>masse</b> d’un objet, c’est la quantité de matière qu’il contient. Elle se mesure avec une <b>balance</b> et s’exprime en <b>kilogrammes (kg)</b>.</p>
          <p>La masse d’un objet est <b>la même partout</b> : sur Terre, sur la Lune ou dans une fusée.</p>
          <div class="ex"><b>Rappel des conversions :</b> 1 kg = 1 000 g, donc 250 g = 0,25 kg.</div>`,
        retenir: 'Masse : quantité de matière, en kg, mesurée avec une balance. Elle ne change pas d’un astre à l’autre.',
        quiz: [
          { q: 'Un astronaute de 80 kg arrive sur la Lune. Sa masse vaut :', choices: [
            { t: '80 kg', ok: true }, { t: 'moins de 80 kg', msg: 'Il a toujours la même quantité de matière : 80 kg.' }] },
        ],
      },
      {
        title: 'Le poids, une force',
        html: `
          <p>Le <b>poids</b> d’un objet, c’est la force avec laquelle un astre (la Terre, la Lune…) l’attire. C’est une action <b>à distance</b> : pas besoin de contact.</p>
          <p>Comme toute force, il s’exprime en <b>newtons (N)</b> et se mesure avec un <b>dynamomètre</b>.</p>
          <table class="tbl">
            <tr><th></th><th>Masse</th><th>Poids</th></tr>
            <tr><td>C’est…</td><td>une quantité de matière</td><td>une force</td></tr>
            <tr><td>Unité</td><td>kg</td><td>N</td></tr>
            <tr><td>Instrument</td><td>balance</td><td>dynamomètre</td></tr>
            <tr><td>Change sur la Lune ?</td><td>non</td><td>oui</td></tr>
          </table>`,
        retenir: 'Poids : force d’attraction d’un astre, en newtons, mesurée au dynamomètre.',
        quiz: [
          { q: 'Lequel est une force ?', choices: [
            { t: 'Le poids', ok: true }, { t: 'La masse', msg: 'La masse est une quantité de matière, en kg.' }] },
          { q: 'L’unité du poids est :', choices: [
            { t: 'le newton', ok: true }, { t: 'le kilogramme', msg: 'Le kilogramme, c’est pour la masse.' }] },
        ],
      },
      {
        title: 'La relation P = m × g',
        html: `
          <p>Le poids et la masse sont liés par :</p>
          <div class="formula">P = m × g</div>
          <p>P en newtons, m en kilogrammes, g en newtons par kilogramme (N/kg). La valeur de g dépend de l’astre :</p>
          <table class="tbl">
            <tr><th>Astre</th><th>g</th></tr>
            <tr><td>Terre</td><td>≈ 9,8 N/kg</td></tr>
            <tr><td>Lune</td><td>≈ 1,6 N/kg</td></tr>
            <tr><td>Mars</td><td>≈ 3,7 N/kg</td></tr>
          </table>
          <div class="ex"><b>Exemple :</b> un sac de 4 kg sur Terre : P = 4 × 9,8 = 39,2 N.</div>
          <p>Pour retrouver la masse : <b>m = P ÷ g</b>.</p>`,
        retenir: 'P = m × g. Terre : g ≈ 9,8 N/kg. Lune : g ≈ 1,6 N/kg.',
        quiz: [
          { q: 'Un chien de 10 kg sur Terre a un poids d’environ :', choices: [
            { t: '98 N', ok: true }, { t: '10 N', msg: '10, c’est la masse en kg. Le poids : 10 × 9,8 = 98 N.' }, { t: '1 N', msg: 'On multiplie par g : 10 × 9,8 = 98 N.' }] },
        ],
      },
      {
        title: 'Sur la Lune',
        html: `
          <p>La Lune attire beaucoup moins que la Terre : son g est environ <b>6 fois plus petit</b>. Un objet y pèse donc environ 6 fois moins, mais sa masse ne change pas.</p>
          <div class="ex"><b>Astronaute de 90 kg :</b><br>sur Terre : P = 90 × 9,8 = 882 N<br>sur la Lune : P = 90 × 1,6 = 144 N<br>masse : 90 kg dans les deux cas.</div>
          <p>C’est pour ça que les astronautes font de grands bonds sur la Lune.</p>`,
        retenir: 'Sur la Lune : même masse, poids environ 6 fois plus faible.',
        quiz: [
          { q: 'Sur la Lune, le poids d’un objet est :', choices: [
            { t: 'plus petit que sur Terre', ok: true }, { t: 'le même', msg: 'g est plus petit sur la Lune, donc P = m × g aussi.' }, { t: 'plus grand', msg: 'La Lune attire moins que la Terre.' }] },
        ],
      },
      {
        title: 'Dessiner le poids',
        html: `
          <p>Une force se représente par une <b>flèche</b> (un vecteur) qui donne ses 4 caractéristiques :</p>
          ${SVG.poids}
          <p>La <b>longueur</b> de la flèche dépend d’une échelle. Avec 1 cm pour 10 N, un poids de 39,2 N donne une flèche de 3,9 cm.</p>`,
        retenir: 'Poids : départ au centre de l’objet, verticale, vers le bas, longueur = valeur ÷ échelle.',
        quiz: [
          { q: 'Échelle 1 cm pour 50 N. Un poids de 200 N se dessine avec une flèche de :', choices: [
            { t: '4 cm', ok: true }, { t: '2 cm', msg: '200 ÷ 50 = 4 cm.' }, { t: '10 cm', msg: 'On divise la valeur par 50 : 200 ÷ 50 = 4 cm.' }] },
        ],
      },
      {
        title: 'La gravitation',
        html: `
          <p>Le poids est un cas particulier de la <b>gravitation</b> : tous les objets qui ont une masse s’attirent.</p>
          <p>Cette attraction est <b>réciproque</b> : la Terre attire la Lune et la Lune attire la Terre (c’est l’origine des marées).</p>
          <p>Elle est d’autant plus forte que les <b>masses sont grandes</b> et que les objets sont <b>proches</b>. Si on éloigne deux objets, l’attraction diminue vite.</p>
          <p>C’est la gravitation du Soleil qui fait tourner les planètes autour de lui.</p>`,
        retenir: 'Gravitation : attraction réciproque entre masses, plus forte si les masses sont grandes et proches.',
        quiz: [
          { q: 'La Terre attire la Lune. La Lune :', choices: [
            { t: 'attire aussi la Terre', ok: true }, { t: 'n’attire pas la Terre', msg: 'L’attraction est réciproque : chacune attire l’autre.' }] },
        ],
      },
    ],
    exos: [
      { title: 'Le poids d’un élève', enonce: 'Un élève a une masse de 45 kg. Calcule son poids sur Terre (g = 9,8 N/kg).', ans: 441, unit: 'N',
        steps: ['🎯 On cherche un poids, en N. 📐 P = m × g.', '🧮 P = 45 × 9,8 = 441 N.'], rep: 'Le poids de l’élève est de 441 N.', piege: 'Écrire « il pèse 45 kg » : en physique, 45 kg est sa masse.' },
      { title: 'Le cartable', enonce: 'Un cartable a une masse de 6 kg. Calcule son poids sur Terre (g = 9,8 N/kg).', ans: 58.8, unit: 'N',
        steps: ['📐 P = m × g.', '🧮 P = 6 × 9,8 = 58,8 N.'], rep: 'Le poids du cartable est de 58,8 N.' },
      { title: 'L’astronaute sur la Lune', enonce: 'Un astronaute équipé a une masse de 120 kg. Calcule son poids sur la Lune (g = 1,6 N/kg).', ans: 192, unit: 'N',
        steps: ['📐 P = m × g avec g de la Lune.', '🧮 P = 120 × 1,6 = 192 N.'], rep: 'Sur la Lune, son poids est de 192 N ; sa masse reste 120 kg.' },
      { title: 'Retrouver une masse', enonce: 'Un dynamomètre indique que le poids d’un objet vaut 29,4 N sur Terre (g = 9,8 N/kg). Quelle est sa masse ?', ans: 3, unit: 'kg',
        steps: ['📐 P = m × g, donc m = P ÷ g.', '🧮 m = 29,4 ÷ 9,8 = 3 kg.'], rep: 'La masse de l’objet est de 3 kg.', piege: 'Multiplier 29,4 × 9,8 : pour isoler m, on divise.' },
      { title: 'La trousse', enonce: 'Une trousse a une masse de 300 g. Calcule son poids sur Terre (g = 9,8 N/kg).', ans: 2.94, unit: 'N',
        steps: ['🔁 La masse doit être en kg : 300 g = 0,3 kg.', '🧮 P = 0,3 × 9,8 = 2,94 N.'], rep: 'Le poids de la trousse est de 2,94 N.', piege: 'Garder 300 donne 2 940 N, le poids d’une petite voiture !' },
      { title: 'Le robot sur Mars', enonce: 'Un robot a une masse de 50 kg. Calcule son poids sur Mars (g = 3,7 N/kg).', ans: 185, unit: 'N',
        steps: ['📐 P = m × g, avec g de Mars.', '🧮 P = 50 × 3,7 = 185 N.'], rep: 'Sur Mars, le poids du robot est de 185 N.' },
      { title: 'De la Terre à la Lune', enonce: 'Sur Terre, le poids d’une caisse vaut 490 N (g = 9,8 N/kg). Quel serait son poids sur la Lune (g = 1,6 N/kg) ?', ans: 80, unit: 'N',
        steps: ['La masse ne change pas : on la calcule d’abord. m = 490 ÷ 9,8 = 50 kg.', '🧮 Sur la Lune : P = 50 × 1,6 = 80 N.'], rep: 'Sur la Lune, la caisse pèserait 80 N.', piege: 'Faire 490 × 1,6 : on a mélangé poids et masse.' },
      { title: 'Longueur de la flèche', enonce: 'On représente le poids de la caisse (490 N) avec l’échelle 1 cm pour 100 N. Quelle est la longueur de la flèche ?', ans: 4.9, unit: 'cm',
        steps: ['Longueur = valeur ÷ échelle.', '🧮 490 ÷ 100 = 4,9 cm.'], rep: 'La flèche mesure 4,9 cm, part du centre de la caisse et descend verticalement.' },
      { title: 'Les 4 caractéristiques', enonce: 'Donne les 4 caractéristiques du poids d’un ballon de 0,5 kg posé au sol (g = 9,8 N/kg).',
        steps: ['Point d’application : le centre du ballon.', 'Direction : verticale. Sens : vers le bas.', 'Valeur : P = 0,5 × 9,8 = 4,9 N.'],
        rep: 'Le poids du ballon s’applique en son centre, il est vertical, dirigé vers le bas et vaut 4,9 N.' },
      { title: 'Poids ou masse ?', enonce: 'Corrige les phrases fausses : 1) « Mon frère pèse 40 kg. » 2) « Sur la Lune, ma masse diminue. » 3) « Le dynamomètre mesure une force. »',
        steps: ['1) 40 kg est une masse : « Mon frère a une masse de 40 kg » (son poids vaut 392 N).', '2) Faux : la masse ne change pas, c’est le poids qui diminue.', '3) Juste : le dynamomètre mesure une force, comme le poids.'],
        rep: '1) Il a une masse de 40 kg. 2) Sur la Lune, mon poids diminue, ma masse reste la même. 3) Correct.' },
    ],
  },
);
