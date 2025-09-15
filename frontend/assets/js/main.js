// Mobile nav
document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('siteNav')?.classList.toggle('open');
  });
  
  // Active year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Simple header/footer include
  async function includePartials() {
    const headerHTML = `
      <header class="site-header">
        <a class="logo" href="index.html">Lojo<span>Barbers</span></a>
        <button id="navToggle" class="nav-toggle" aria-label="Menu">☰</button>
        <nav id="siteNav" class="nav">
          <a href="index.html">Home</a>
          <a href="services.html">Services</a>
          <a href="gallery.html">Gallery</a>
          <a href="booking.html">Booking</a>
          <a href="contact.html">Contact</a>
        </nav>
      </header>`;
    const footerHTML = `
      <footer class="site-footer">
        <div class="container">
          <p>© <span id="year"></span> Lojo Barbers. All rights reserved.</p>
          <div class="social">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </footer>`;
    document.querySelectorAll('[data-include="header"]').forEach(el => el.outerHTML = headerHTML);
    document.querySelectorAll('[data-include="footer"]').forEach(el => el.outerHTML = footerHTML);
  
    // rebind toggles + year after injection
    document.getElementById('navToggle')?.addEventListener('click', () => {
      document.getElementById('siteNav')?.classList.toggle('open');
    });
    const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
  }
  includePartials();
  