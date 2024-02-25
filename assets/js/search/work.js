self.importScripts('/assets/js/search/lunr.js', '/assets/js/search/lunr.stemmer.support.js', '/assets/js/search/lunr.zh.js');

let idx;
let jiebaInitialized = false;
let documents; // 添加一个全局变量来存储文档数据

async function initJieba() {
  const { default: init, cut } = await import('/assets/js/search/jieba_rs_wasm.js');
  await init();
  self.cut = cut;
  jiebaInitialized = true;
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'init':
      await initJieba();
      documents = data; // 在初始化时保存文档数据
      idx = lunr(function () {
        this.use(lunr.zh);
        this.ref('url');
        this.field('title');
        this.field('content');

        documents.forEach((doc) => {
          const contentTokens = self.cut(doc.content, true);
          const content = contentTokens.join(' ');
          this.add({ ...doc, content });
        }, this);
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
        var doc = documents.find(d => d.url === result.ref); // 使用全局变量 documents 来查找文档
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
