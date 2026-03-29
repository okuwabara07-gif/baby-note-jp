const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AMAZON_ID = process.env.AMAZON_TRACKING_ID || '';
const RAKUTEN_ID = process.env.RAKUTEN_AFFILIATE_ID || '';

const KEYWORDS = [
  {kw:"\u62b1\u3063\u3053\u7d10 \u304a\u3059\u3059\u3081 \u65b0\u751f\u5150",genre:"newborn"},
  {kw:"\u54fa\u4e73\u74f6 \u6d88\u6bd2 \u65b9\u6cd5",genre:"feeding"},
  {kw:"\u8d64\u3061\u3083\u3093 \u591c\u6ce3\u304d \u5bfe\u51e6\u6cd5",genre:"sleep"},
  {kw:"\u96e2\u4e73\u98df \u59cb\u3081\u65b9 \u6642\u671f",genre:"feeding"},
  {kw:"\u30d9\u30d3\u30fc\u30ab\u30fc \u304a\u3059\u3059\u3081 \u8efd\u91cf",genre:"goods"},
  {kw:"\u30c1\u30e3\u30a4\u30eb\u30c9\u30b7\u30fc\u30c8 \u304a\u3059\u3059\u3081",genre:"goods"},
  {kw:"\u8d64\u3061\u3083\u3093 \u304a\u3082\u3061\u3083 0\u6b73",genre:"toy"},
  {kw:"\u5bdd\u304b\u3057\u3064\u3051 \u30b3\u30c4 \u65b9\u6cd5",genre:"sleep"},
  {kw:"\u30d9\u30d3\u30fc\u30e2\u30cb\u30bf\u30fc \u304a\u3059\u3059\u3081",genre:"goods"},
  {kw:"\u8d64\u3061\u3083\u3093 \u808c\u7740 \u9078\u3073\u65b9",genre:"newborn"}
];

const SYS = `あなたは育児・子育て専門ライターです。読者目線で分かりやすく、SEOに強い記事を書きます。見出しはH2/H3を使ってください。文字数2000字以上。Markdown形式で出力。記事内でおすすめ商品を紹介する箇所には[AMAZON:商品名]と[RAKUTEN:商品名]を合計5箇所挿入してください。`;

function insertLinks(text) {
  text = text.replace(/\[AMAZON:([^\]]+)\]/g, (_, p) => {
    return `[🛒 ${p}をAmazonでチェック](https://www.amazon.co.jp/s?k=${encodeURIComponent(p)}&tag=${AMAZON_ID})`;
  });
  text = text.replace(/\[RAKUTEN:([^\]]+)\]/g, (_, p) => {
    return `[🛍 ${p}を楽天でチェック](https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p)}/?rafcid=${RAKUTEN_ID})`;
  });
  return text;
}

function toSlug(kw) {
  return kw.replace(/[\s\u3000]+/g, '-').replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '') + '-' + Date.now();
}

async function generateArticle(kw, genre) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYS,
      messages: [{ role: 'user', content: `ジャンル：${genre}\nキーワード：「${kw}」\n\nSEO記事をMarkdownで書いてください。` }],
    }),
  });
  const data = await res.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

async function main() {
  const contentDir = path.join(process.cwd(), 'content/blog');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  const targets = KEYWORDS.sort(() => Math.random() - 0.5).slice(0, 5);

  for (const { kw, genre } of targets) {
    console.log(`生成中: ${kw}`);
    try {
      let text = await generateArticle(kw, genre);
      text = insertLinks(text);
      const slug = toSlug(kw);
      const content = `---\ntitle: "${kw}"\ndate: "${new Date().toISOString().split('T')[0]}"\ngenre: "${genre}"\ntags: [${genre}]\n---\n\n${text}\n`;
      fs.writeFileSync(path.join(contentDir, `${slug}.mdx`), content);
      console.log(`完了: ${slug}.mdx`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`エラー: ${kw}`, e.message);
    }
  }
  console.log('全記事生成完了！');
}

main();
