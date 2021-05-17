# tresvitemadose

Based on https://github.com/jarnix/tresvitemadose.

Detects the new Covid-19 doses availability on Doctolib.fr.

**Use it responsibly**

## Installation

```bash
git clone https://github.com/valcker/tresvitemadose
cd tresvitemadose
npm i
```

## Usage

`npm start {vaccine name} {area}`
where:
* **{vaccine name}** is either `pfizer` of `moderna`
* **{area}** corresponds to the city/area part of the URL on Doctolib. Example: https://www.doctolib.fr/vaccination-covid-19/chamonix-mont-blanc?ref_visit_motive_ids[]=6970&ref_visit_motive_ids[]=7005&force_max_limit=2. For this URL, the area would be _chamonix-mont-blanc_.
