self.importScripts('/assets/js/search/lunr.js', '/assets/js/search/lunr.stemmer.support.js', '/assets/js/search/lunr.zh.js');

let idx;
let jiebaInitialized = false;
let documents;

async function initJieba() {
  const { default: init, cut } = await import('/assets/js/search/jieba_rs_wasm.js');
  await init();
  self.cut = cut;
  jiebaInitialized = true;
}

async function buildIndexInBatches(docs, batchSize) {
  let allDocs = [];
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    batch.forEach((doc) => {
      const contentTokens = self.cut(doc.content, true);
      const content = contentTokens.join(' ');
      allDocs.push({ ...doc, content });
    });
    const progress = Math.min((i + batchSize) / docs.length, 1);
    if (progress != 1) {
      self.postMessage({ type: 'progress', progress });
    }
  }
  return allDocs;
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'init':
      await initJieba();
      documents = data;
      const progress = 0.1
      self.postMessage({ type: 'progress', progress });
      const allDocs = await buildIndexInBatches(documents, 50);
      idx = lunr(function () {
        this.use(lunr.zh);
        this.ref('url');
        this.field('title');
        this.field('content');

        allDocs.forEach((doc) => {
          this.add(doc);
        });
        const progress = 1
        self.postMessage({ type: 'progress', progress });
      });
      self.postMessage({ type: 'ready' });
      break;
    case 'search':
      if (!jiebaInitialized) {
        self.postMessage({ type: 'error', message: 'Jieba not initialized' });
        return;
      }
      const query = data.query;
      const tokens = self.cut(query, true);
      const queryString = tokens.join(' ');
      var results = idx.search(queryString).map(function(result) {
        var doc = documents.find(d => d.url === result.ref);
        return {
          title: doc.title,
          content: doc.content,
          ref: result.ref
        };
      });
      self.postMessage({ type: 'results', results: results, query: query });
      break;
    default:
      self.postMessage({ type: 'error', message: 'Unknown message type' });
  }
});
