export function renderHeader(title = "My Blog") {
  return `
    <header class="site-header">
      <nav>
        <a href="/" class="logo">My Blog</a>
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/posts">Posts</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>
  `;
}
