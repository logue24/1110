/* =========================================================
   Niên Thiện — script.js
   ========================================================= */
(function () {
  "use strict";

  /* ---------- CẤU HÌNH LIÊN HỆ ----------
     Điền thông tin thật vào đây. Mục nào để trống "" sẽ không hiện trên trang.
       email:    địa chỉ email
       phone:    số điện thoại
       zalo:     liên kết Zalo, bắt đầu bằng https://
       facebook / tiktok / youtube: liên kết, bắt đầu bằng https://
       address:  địa chỉ (bấm vào sẽ mở Google Maps)                          */
  var CONFIG = {
    contact: {
      email: "",
      phone: "",
      zalo: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      address: ""
    }
  };

  var STORAGE_KEY = "nt-theme";
  var THEME_COLORS = { light: "#FAF6EE", dark: "#0F1613" };
  var MOBILE_MAX = 760;

  var root = document.documentElement;
  var siteHeader = document.getElementById("siteHeader");
  var nav = document.getElementById("nav");
  var themeToggle = document.getElementById("themeToggle");
  var menuToggle = document.getElementById("menuToggle");
  var contactList = document.getElementById("contactList");
  var contactEmpty = document.getElementById("contactEmpty");
  var shareBtn = document.getElementById("shareBtn");
  var toastEl = document.getElementById("toast");
  var yearEl = document.getElementById("year");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Giao diện sáng / tối ---------- */
  function getStoredTheme() {
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      return t === "light" || t === "dark" ? t : null;
    } catch (e) {
      return null;
    }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLORS[theme]);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    }
  }

  applyTheme(getStoredTheme() || systemTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  if (window.matchMedia) {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function (e) {
      if (!getStoredTheme()) applyTheme(e.matches ? "dark" : "light");
    };
    if (mql.addEventListener) mql.addEventListener("change", onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange);
  }

  /* ---------- Menu trên di động ---------- */
  function setMenu(open) {
    if (!nav || !menuToggle) return;
    nav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > MOBILE_MAX) setMenu(false);
    });
  }

  /* ---------- Header đổi kiểu khi cuộn ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      if (siteHeader) siteHeader.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Đánh dấu mục đang xem trên menu ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var activeId = null;

  function setActive(id) {
    activeId = id;
    navLinks.forEach(function (link) {
      var on = id !== null && link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
        else if (activeId === entry.target.id) setActive(null);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    navLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      var section = id ? document.getElementById(id) : null;
      if (section) spy.observe(section);
    });
  }

  /* ---------- Hiệu ứng xuất hiện khi cuộn ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced && revealEls.length) {
    Array.prototype.forEach.call(document.querySelectorAll(".cards"), function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = i * 90 + "ms";
      });
    });

    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    root.classList.add("reveal-on");
    Array.prototype.forEach.call(revealEls, function (el) { reveal.observe(el); });
  }

  /* ---------- Thông tin liên hệ (từ CONFIG) ---------- */
  function isHttpUrl(v) {
    return /^https?:\/\/\S+$/i.test(v);
  }

  function buildContactItems() {
    var c = CONFIG.contact || {};
    var items = [];

    function val(key) { return typeof c[key] === "string" ? c[key].trim() : ""; }

    if (val("email")) {
      items.push({ label: "Email", text: val("email"), href: "mailto:" + val("email"), external: false });
    }
    if (val("phone")) {
      var tel = val("phone").replace(/[^\d+]/g, "");
      if (tel) items.push({ label: "Điện thoại", text: val("phone"), href: "tel:" + tel, external: false });
    }
    [["zalo", "Zalo"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["youtube", "YouTube"]].forEach(function (pair) {
      var url = val(pair[0]);
      if (url && isHttpUrl(url)) items.push({ label: pair[1], text: url.replace(/^https?:\/\//i, ""), href: url, external: true });
    });
    if (val("address")) {
      items.push({
        label: "Địa chỉ",
        text: val("address"),
        href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(val("address")),
        external: true
      });
    }
    return items;
  }

  function renderContacts() {
    if (!contactList) return;
    var items = buildContactItems();

    items.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "contact-item reveal";
      a.href = item.href;
      if (item.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      var label = document.createElement("span");
      label.className = "contact-label";
      label.textContent = item.label;
      var value = document.createElement("span");
      value.className = "contact-value";
      value.textContent = item.text;
      a.appendChild(label);
      a.appendChild(value);
      contactList.appendChild(a);
    });

    if (contactEmpty) contactEmpty.hidden = items.length > 0;
    if (!items.length && window.console && console.info) {
      console.info("[Niên Thiện] Chưa có thông tin liên hệ. Mở script.js và điền vào CONFIG.contact.");
    }
  }

  renderContacts();

  /* ---------- Thông báo nhỏ (toast) ---------- */
  var toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Chia sẻ trang ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function copyFallback() {
    copyText(window.location.href).then(function (ok) {
      showToast(ok ? "Đã sao chép liên kết trang." : "Không sao chép được. Hãy sao chép liên kết từ thanh địa chỉ.");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href }).catch(function (err) {
          if (err && err.name === "AbortError") return;
          copyFallback();
        });
      } else {
        copyFallback();
      }
    });
  }

  /* ---------- Năm ở chân trang ---------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Kiểm tra font logo Capitaly Script ----------
     Gắn class lên <html>: logo-font-capitaly (đã nạp được) hoặc logo-font-fallback. */
  function markFallback() {
    root.classList.add("logo-font-fallback");
    if (window.console && console.info) {
      console.info("[Niên Thiện] Chưa nạp được Capitaly Script — đang dùng Great Vibes. Đặt file vào fonts/CapitalyScript.woff2 (hoặc .woff/.ttf/.otf).");
    }
  }

  if (document.fonts && document.fonts.load) {
    document.fonts.load('1em "Capitaly Script"', "Niên Thiện").then(function (faces) {
      if (faces && faces.length > 0) root.classList.add("logo-font-capitaly");
      else markFallback();
    }).catch(markFallback);
  }
})();
