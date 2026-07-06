export const firstArticle = {
  title: "My First Post",
  slug: "my-first-post",
  date: "2026-07-06",
  body: `
    <article>
      <h1>My First Post</h1>
      <p class="post-date">Published July 6, 2026</p>

      <p>Welcome to my new blog, running on a Cloudflare Worker. This is the first real article, served straight from JavaScript instead of Markdown.</p>

      <h2>Why Workers?</h2>
      <p>Cloudflare Workers let me control routing and HTML generation directly at the edge, with no build step required.</p>

      <pre><code>function main() {
  console.log("Hello, Workers");
}</code></pre>

      <h2>What's next</h2>
      <p>More posts will live as separate files under <code>src/articles/</code>, each exporting a title, slug, date, and body.</p>
    </article>
  `,
};
