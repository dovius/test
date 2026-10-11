# welcome

Minimalus Vue + Vite puslapis: ekrane matomas tik tekstas `welcome`.
Nėra serverio API, išorinių šriftų, analitikos ar vykdymui reikalingų paslapčių.
Vue SSR naudojamas tik teste, o publikuojami tik statiniai `dist/` failai.

## Vietinis paleidimas

Rekomenduojama Node.js `22.23.2` (`.nvmrc`) ir npm `10.9.8`.
Tikslios priklausomybių versijos bei tranzityvios priklausomybės užfiksuotos
`package.json` ir `package-lock.json`; viskas diegiama lokaliai.

```sh
npm ci              # atkuriamas diegimas pagal lockfile
# npm install       # alternatyva sąmoningai atnaujinant priklausomybes
npm run dev         # vietinis kūrimo serveris
npm test            # tikras Vue renderinimas ir build metaduomenų testai
npm run build       # statiniai failai į dist/
npm run preview     # vietinė dist/ peržiūra
npm run check       # testai ir production build
npm run deploy:dry-run  # tik vietinė Wrangler patikra, nieko nepublikuoja
```

## Publikavimas ir CI

- Vieša svetainė: `https://test.vild.lt`.
- Šaltinių saugykla `dovius/test` yra **vieša** aiškiu savininko sprendimu.
- Viešuose šaltiniuose nėra vykdymui reikalingų API raktų ar paslapčių; svetainė neturi serverio API.
- Cloudflare Worker: `test-vild`; statiniai failai imami tik iš `dist/`.
- `wrangler.jsonc` aprašo paskyrą, custom domain ir konfigūraciją; jame nėra kredencialų.
- Nėra GitHub Actions workflow. Workers Builds nustatymai išsaugoti, tačiau
  Settings → Builds rodo: „This project is disconnected from your Git account.
  This may cause deployments to fail.“ GitHub App automatinis paleidimas po
  tikro `push` nesuveikė; tai Git paskyros jungties, ne statinių failų nustatymų
  problema. Rankiniai build buvo sėkmingi.

Alternatyvus automatinis kelias: GitHub saugyklos `push` webhook → Cloudflare
Deploy Hook, pririštas prie `main` → tie patys esamo `test-vild` Worker Builds,
testai ir publikavimas. Atskiras Worker, GitHub Actions ar naujas API tokenas
nereikalingas. Šis alternatyvus kelias **neatkuria** integruotos GitHub paskyros
jungties ar App leidimų ir nepašalina minėto įspėjimo. Deploy Hook ir aktyvus
GitHub `push` webhook sukurti; jų konfigūracija patikrinta pakartotinai perskaičius
nuotolinius nustatymus. Vien konfigūracijos patikra **neįrodo** sėkmingo automatinio
diegimo po tikro `push`; tam taikoma žemiau aprašyta patikros procedūra.

Workers Builds nustatymai:

| Nustatymas | Reikšmė |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` (saugyklos šaknis) |
| Build command | `npm run check && git rev-parse HEAD` |
| Deploy command | `npx wrangler deploy` |
| Node.js | `NODE_VERSION=22.23.2` |

Sujungtas webhook po `push` inicijuoja `main` build; kitų šakų `push` gali
nereikalingai pakartoti **`main`** build, bet negali publikuoti tų šakų kodo.
Deploy Hook ima dabartinę `main` viršūnę, ne GitHub payload perduotą SHA;
artimi įvykiai gali būti sujungti į vieną laukiantį build. GitHub sukuriamas
pradinis `ping` taip pat gali inicijuoti build ir nėra tikro `push` įrodymas.
Build įrašo šaltinis yra `deploy_hook`. Deploy Hook URL ir jo identifikatorius
yra paslaptys: jų negalima dėti į Git, viešus logus ar įrodymų archyvus.
Prisijungimo duomenys ir webhook paskirties URL laikomi paslaugų nustatymuose,
ne saugykloje.
Rankinis `npm run deploy` publikuoja jau sukurtą `dist/`, todėl prieš jį būtinas
`npm run check`. Diegimui būtina atskira autentikacija ir leidimas.

## Build tapatybė

`dist/build-info.json` turi tik lauką `commit`: Workers Builds pateiktą
`WORKERS_CI_COMMIT_SHA`, o kai jis nepateiktas arba yra tiksliai tuščia eilutė
(`''`, kaip gali būti Deploy Hook build), tikrą `git rev-parse --verify HEAD` rezultatą.
Iki pirmo commit arba šaltinių archyve be Git naudojama reikšmė `local`.
Netuščias CI SHA turi būti tiksliai 40 mažųjų šešioliktainių simbolių; bet kuri
netinkama netuščia reikšmė (įskaitant tarpus ar naujos eilutės simbolį) nutraukia
build, nėra apkarpoma ar pakeičiama Git HEAD. Tinkamas CI SHA turi pirmenybę.
Metaduomenyse nėra laiko žymų, el. pašto, saugyklos URL ar paslapčių.
`/build-info.json` nėra rodomas puslapyje, o `_headers` išjungia jo cache.
Vietinis nešvarus darbinis medis gali skirtis nuo HEAD: įrodymui kurkite po commit.

Automatinio diegimo patikros procedūra:

1. Įkelkite tikrą commit į `main` ir užfiksuokite jo pilną SHA. Patikros metu
   nedarykite konkuruojančių `push`, nes Deploy Hook ima dabartinę šakos viršūnę.
2. Patikrinkite būtent GitHub `push` (ne pradinio `ping`) webhook pristatymo
   sėkmę ir atsakymo `build_uuid` susiekite su Workers Builds įrašu.
3. Patikrinkite to įrašo šaltinį `deploy_hook`, šaką `main`, sėkmingus testus,
   build ir publikavimą. Build komandos pabaigos `git rev-parse HEAD` loge
   išveda tikrą checkout SHA po sėkmingo `npm run check`; jis turi sutapti su
   įkelto commit SHA. Deploy Hook įrašo `metadata.commit_hash` gali likti tuščias,
   todėl vien šiuo lauku negalima remtis kaip šaltinių tapatybės įrodymu.
4. Perskaitykite viešą `/build-info.json`: jame turi būti tik `commit`, sutampantis
   su įkelto commit ir build loge patvirtintu checkout SHA. Atskirai patikrinkite,
   kad viešas puslapis tebėra tik `welcome`.

GitHub pristatymo `build_uuid`, to build checkout SHA loge ir gyvo JSON sutapimas
kartu patvirtina šį kelią; jie nepatvirtina integruotos Git paskyros jungties
atkūrimo. Įrodymuose nesaugokite Deploy Hook URL ar jo identifikatoriaus.

## Oficialūs šaltiniai

- Vite: https://vite.dev/guide/
- Vue renderinimo testai: https://vuejs.org/api/ssr.html
- Static assets: https://developers.cloudflare.com/workers/static-assets/binding/
- Wrangler konfigūracija: https://developers.cloudflare.com/workers/wrangler/configuration/
- Build aplinka: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Build image ir Node versija: https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
