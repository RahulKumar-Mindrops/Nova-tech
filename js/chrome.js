/**
 * Shared VOIR header / footer
 */
(function () {
  "use strict";

  function pageId() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!file || file === "index.html") return "home";
    if (file === "tv.html") return "tvs";
    return file.replace(".html", "");
  }

  function navMarkup(active) {
    const links = (window.VOIR && window.VOIR.nav) || [];
    const items = links
      .map(function (l) {
        const isActive = l.id === active;
        return (
          '<a href="' +
          l.href +
          '" class="nav__link' +
          (isActive ? " is-active" : "") +
          '"><span>' +
          l.label +
          "</span></a>"
        );
      })
      .join("");

    const solid = active !== "home" ? " is-scrolled nav--inner" : "";
    return (
      '<header class="nav' +
      solid +
      '" id="nav">' +
      '<div class="nav__inner">' +
      '<a href="index.html" class="nav__logo" data-magnetic aria-label="VOIR home">' +
      '<img src="images/voir-logo.png" alt="VOIR" class="nav__logo-img" />' +
      "</a>" +
      '<nav class="nav__links" id="navLinks" aria-label="Primary">' +
      items +
      "</nav>" +
      '<button class="nav__toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      "</div></header>"
    );
  }

  function footerMarkup() {
    const email = window.VOIR.contacts.email;
    const phone = window.VOIR.contacts.phone;
    const phoneHref = window.VOIR.contacts.phoneHref;
    const ig = window.VOIR.social.instagram;
    const fb = window.VOIR.social.facebook;
    return (
      '<footer class="footer" id="footer">' +
      '<div class="container footer__top">' +
      '<div class="footer__col footer__col--brand">' +
      '<a href="index.html" class="footer__logo">' +
      '<img src="images/voir-logo.png" alt="VOIR" class="footer__logo-img" />' +
      "</a>" +
      '<p class="footer__tagline">SEE IT. LOVE IT. LIVE IT.</p>' +
      '<p class="footer__about">VOIR Appliances Private Limited</p>' +
      '<p class="footer__contact"><a href="mailto:' +
      email +
      '">' +
      email +
      "</a></p>" +
      '<p class="footer__contact"><a href="' +
      phoneHref +
      '">' +
      phone +
      "</a></p>" +
      '<p class="footer__contact"><a href="https://www.voir.co.in" rel="noopener">www.voir.co.in</a></p>' +
      "</div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Products</h4>' +
      '<ul class="footer__links">' +
      '<li><a href="tvs.html">TVs</a></li>' +
      '<li><a href="air-coolers.html">Air Coolers</a></li>' +
      '<li><a href="washing-machines.html">Washing Machines</a></li>' +
      '<li><a href="accessories.html">Accessories</a></li>' +
      "</ul></div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Company</h4>' +
      '<ul class="footer__links">' +
      '<li><a href="about.html">About</a></li>' +
      '<li><a href="support.html">Support</a></li>' +
      "</ul></div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Follow</h4>' +
      '<div class="footer__social">' +
      '<a href="' +
      ig +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Instagram" data-magnetic>IG</a>' +
      '<a href="' +
      fb +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Facebook" data-magnetic>FB</a>' +
      "</div></div></div>" +
      '<div class="footer__bottom container">' +
      "<p>&copy; 2026 VOIR Appliances Private Limited. All rights reserved.</p>" +
      '<div class="footer__legal">' +
      '<a href="e-waste.html">E-Waste Management</a>' +
      '<a href="privacy.html">Privacy Policy</a>' +
      '<a href="faqs.html">FAQs</a>' +
      '<a href="manuals.html">Product Manuals</a>' +
      "</div></div></footer>"
    );
  }

  const active = pageId();
  const navHost = document.getElementById("site-nav");
  const footHost = document.getElementById("site-footer");
  if (navHost) navHost.innerHTML = navMarkup(active);
  if (footHost) footHost.innerHTML = footerMarkup();
})();
