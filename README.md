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

## Numatytas publikavimas

- Vieša svetainė: `https://test.vild.lt`.
- Šaltinių saugykla turi būti **privati**: `dovius/test`.
- Cloudflare Worker: `test-vild`; statiniai failai imami tik iš `dist/`.
- `wrangler.jsonc` aprašo paskyrą, custom domain ir konfigūraciją; jame nėra kredencialų.
- Nėra GitHub Actions workflow. Naudojama numatyta Cloudflare Workers Builds Git integracija.

Saugyklos sukūrimas, domeno prijungimas ir Workers Builds įjungimas atliekami
atskirai. Vien šie vietiniai failai **neįrodo**, kad diegimas jau sukonfigūruotas.
Numatyti Workers Builds nustatymai:

| Nustatymas | Reikšmė |
| --- | --- |
| Production branch | `main` |
| Root directory | saugyklos šaknis |
| Build command | `npm run check` |
| Deploy command | `npm run deploy` (lokalus `wrangler deploy`) |
| Node.js | `22.23.2`, nustatoma `.nvmrc` arba `NODE_VERSION` |

Įjungus integraciją, kiekvienas `push` į `main` turi pradėti naują testavimą,
build ir publikavimą. Prisijungimo duomenys tvarkomi Cloudflare, ne saugykloje.
Rankinis `npm run deploy` publikuoja jau sukurtą `dist/`, todėl prieš jį būtinas
`npm run check`. Diegimui būtina atskira autentikacija ir leidimas.

## Build tapatybė

`dist/build-info.json` turi tik lauką `commit`: Workers Builds pateiktą
`WORKERS_CI_COMMIT_SHA`, kitu atveju tikrą `git rev-parse --verify HEAD` rezultatą.
Iki pirmo commit arba šaltinių archyve be Git naudojama reikšmė `local`.
Netinkamas CI SHA nutraukia build; savavališkos aplinkos reikšmės nepublikuojamos.
Metaduomenyse nėra laiko žymų, el. pašto, saugyklos URL ar paslapčių.
`/build-info.json` nėra rodomas puslapyje, o `_headers` išjungia jo cache.
Vietinis nešvarus darbinis medis gali skirtis nuo HEAD: įrodymui kurkite po commit.

Automatiką reikia patvirtinti tikru antru `push` į `main`, sėkmingu Workers Builds
įrašu ir viešo `/build-info.json` `commit` sutapimu su antru commit.

## Oficialūs šaltiniai

- Vite: https://vite.dev/guide/
- Vue renderinimo testai: https://vuejs.org/api/ssr.html
- Static assets: https://developers.cloudflare.com/workers/static-assets/binding/
- Wrangler konfigūracija: https://developers.cloudflare.com/workers/wrangler/configuration/
- Build aplinka: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Build image ir Node versija: https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
