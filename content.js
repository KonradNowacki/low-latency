import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";

export function renderPage({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      padding: 0 1rem;
      line-height: 1.6;
      color: #222;
    }
    .site-header nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }
    .nav-links {
      list-style: none;
      display: flex;
      gap: 1.5rem;
      margin: 0;
      padding: 0;
    }
    .nav-links a, .logo {
      text-decoration: none;
      color: #222;
    }
    article h1 {
      margin-bottom: 0.2rem;
    }
    .post-date {
      color: #777;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .site-footer {
      margin-top: 3rem;
      padding: 1rem 0;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  ${renderHeader(title)}
  <main>
    ${body}
  </main>
  ${renderFooter()}
</body>
</html>`;
}
