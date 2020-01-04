const R = require("ramda");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cache = require("./cache");
const { Semaphore } = require("await-semaphore");

const semaphore = new Semaphore(2);

async function $get(url) {
  let body = await cache.get(url);

  if (!body) {
    const release = await semaphore.acquire();

    console.log("🔜", url);
    const root = await fetch(url);
    console.log("👌", url);
    body = await root.text();
    await cache.set(url, body);

    release();
  }

  return cheerio.load(body);
}

async function getRecipeCategoryHrefs(url) {
  const $root = await $get(url);

  const rootEls = $root(".recipes-listing-item > .image");
  return rootEls.toArray().map(x => `https://redmondclub.com${x.attribs.href}`);
}

async function getCategoryHrefs() {
  const $root = await $get("https://redmondclub.com/projects/recipes/");

  const rootEls = $root(".recipes-listing-item > .image");
  return rootEls.toArray().map(x => `https://redmondclub.com${x.attribs.href}`);
}

function text(node) {
  return node.children
    .filter(c => c.type === "text")
    .map(R.prop("data"))
    .join(", ");
}

async function getRecipe(url) {
  const $root = await $get(url);

  const rootEls = $root(".ingredients-block tr").toArray();
  let mapped = rootEls.map(x => {
    const tds = x.children.filter(n => n.name === "td");
    console.assert(tds.length === 2);

    tds.forEach(td => {
      let value = td.children.filter(x => x.type === "text").length < 2;
      if (!value) {
        debugger;
      }
      console.assert(value, td);
    });
    return tds.map(text);
  });

  const ingredients = R.fromPairs(mapped);

  const title = $root("h1.pagetitle")
    .text()
    .trim();

  return { title, ingredients };
}

async function main() {
  const categoryHrefs = await getCategoryHrefs();
  const recipeHrefs = await Promise.all(
    R.map(getRecipeCategoryHrefs, categoryHrefs)
  );
  const recipePageHrefs = R.flatten(recipeHrefs);
  return R.flatten(await Promise.all(recipePageHrefs.map(getRecipe)));
}

main()
  .then(x => console.log(x.length))
  .catch(console.error);
