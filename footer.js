export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <p>&copy; ${year} My Blog. All rights reserved.</p>
    </footer>
  `;
}
