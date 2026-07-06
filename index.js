import { renderPage } from "./content.js";
import { firstArticle } from "./articles/first-article.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    console.info({ message: "Request received", path: url.pathname });

    if (url.pathname === "/" || url.pathname === "/posts/my-first-post") {
      const html = renderPage({
        title: firstArticle.title,
        body: firstArticle.body,
      });
      return new Response(html, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
