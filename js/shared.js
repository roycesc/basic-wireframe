/* ============================================================
   FW — Forma Wireframe Kit · shared.js
   Progressive enhancement ONLY. Every page must read correctly
   with JS disabled — interesting states are pre-posed in markup.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;

  function closestAnchor(el) {
    return el.closest(".fw-anchor, .fw-modswitch, .fw-toolbar__tool");
  }

  function closeAllAnchors(except) {
    doc.querySelectorAll(".fw-anchor.is-open, .fw-modswitch.is-open, .fw-toolbar__tool.is-open").forEach(function (a) {
      if (a !== except) a.classList.remove("is-open");
    });
  }

  /* ---- Delegated clicks ---- */
  doc.addEventListener("click", function (e) {
    var t;

    /* Flyout / menu toggles */
    t = e.target.closest("[data-fw-flyout], [data-fw-menu]");
    if (t) {
      var anchor = closestAnchor(t);
      if (anchor) {
        var willOpen = !anchor.classList.contains("is-open");
        closeAllAnchors(anchor);
        anchor.classList.toggle("is-open", willOpen);
        e.preventDefault();
        return;
      }
    }

    /* Tabs */
    t = e.target.closest("[data-fw-tab]");
    if (t) {
      var group = t.closest("[data-fw-tabs]");
      if (group) {
        var name = t.getAttribute("data-fw-tab");
        group.querySelectorAll("[data-fw-tab]").forEach(function (tab) {
          var on = tab === t;
          tab.classList.toggle("is-active", on);
          tab.setAttribute("aria-selected", on ? "true" : "false");
        });
        var scope = group.getAttribute("data-fw-tabs")
          ? doc.querySelector(group.getAttribute("data-fw-tabs"))
          : group.parentElement;
        if (scope) {
          scope.querySelectorAll("[data-fw-tabpanel]").forEach(function (p) {
            p.hidden = p.getAttribute("data-fw-tabpanel") !== name;
          });
        }
        e.preventDefault();
        return;
      }
    }

    /* Switch toggles */
    t = e.target.closest(".fw-switch");
    if (t) {
      t.setAttribute("aria-checked", t.getAttribute("aria-checked") === "true" ? "false" : "true");
      return;
    }

    /* Pressed icon buttons / segmented buttons */
    t = e.target.closest(".fw-seg__btn");
    if (t) {
      var seg = t.closest(".fw-seg");
      if (seg) {
        seg.querySelectorAll(".fw-seg__btn").forEach(function (b) {
          b.classList.toggle("is-active", b === t);
          if (b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", b === t ? "true" : "false");
        });
      }
      /* fall through (no return) so links inside segments still work */
    }

    /* Modal open / close */
    t = e.target.closest("[data-fw-modal-open]");
    if (t) {
      var m = doc.querySelector(t.getAttribute("data-fw-modal-open"));
      if (m) { m.classList.add("is-open"); e.preventDefault(); }
      return;
    }
    t = e.target.closest("[data-fw-modal-close]");
    if (t) {
      var sc = t.closest(".fw-scrim");
      if (sc) sc.classList.remove("is-open");
      return;
    }

    /* Toast dismiss */
    t = e.target.closest("[data-fw-dismiss]");
    if (t) {
      var toast = t.closest(".fw-toast");
      if (toast) toast.remove();
      return;
    }

    /* Click outside closes flyouts */
    if (!closestAnchor(e.target)) closeAllAnchors(null);
  });

  /* Scrim click closes modal (but not clicks inside the dialog) */
  doc.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("fw-scrim") && !e.target.classList.contains("fw-scrim--static")) {
      e.target.classList.remove("is-open");
    }
  });

  /* ---- Keyboard ---- */
  doc.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName);

    if (e.key === "Escape") {
      closeAllAnchors(null);
      doc.querySelectorAll(".fw-scrim.is-open").forEach(function (s) { s.classList.remove("is-open"); });
      return;
    }
    if (typing) return;

    /* g — toggle the 8px debug grid */
    if (e.key === "g") {
      doc.body.classList.toggle("fw-debug-grid");
      return;
    }

    /* r — toggle the presenter click ring */
    if (e.key === "r") {
      doc.body.classList.toggle("fw-presenter-off");
      return;
    }

    /* / — open command palette if the page has one */
    if (e.key === "/") {
      var pal = doc.querySelector("[data-fw-palette]");
      if (pal) {
        pal.classList.add("is-open");
        var input = pal.querySelector(".fw-palette__input");
        if (input) input.focus();
        e.preventDefault();
      }
    }
  });

  /* ---- Presenter click ring (toggle with `r`) ----
     Flashes a red ring around the clicked control — or the cursor
     point — so someone following a demo can see where you clicked. */
  var RING_TARGETS = "a, button, input, select, textarea, summary, label, [role='button']";
  doc.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    if (doc.body.classList.contains("fw-presenter-off")) return;
    var ring = doc.createElement("div");
    ring.className = "fw-clickring";
    var target = e.target.closest ? e.target.closest(RING_TARGETS) : null;
    var pad = 4;
    if (target) {
      var r = target.getBoundingClientRect();
      ring.style.left = (r.left - pad) + "px";
      ring.style.top = (r.top - pad) + "px";
      ring.style.width = (r.width + pad * 2) + "px";
      ring.style.height = (r.height + pad * 2) + "px";
    } else {
      ring.style.left = (e.clientX - 20) + "px";
      ring.style.top = (e.clientY - 20) + "px";
      ring.style.width = "40px";
      ring.style.height = "40px";
    }
    doc.body.appendChild(ring);
    ring.addEventListener("animationend", function () { ring.remove(); });
    setTimeout(function () { ring.remove(); }, 800); /* reduced-motion fallback */
  }, true);

  /* ---- Gradient-legend range handles (posed fallback in markup) ---- */
  doc.querySelectorAll(".fw-legendbar__track").forEach(function (track) {
    var handles = track.querySelectorAll(".fw-legendbar__handle");
    var masks = track.querySelectorAll(".fw-legendbar__mask");
    if (!handles.length) return;

    function pct(clientX) {
      var r = track.getBoundingClientRect();
      return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    }
    function layout() {
      var lo = parseFloat(handles[0].style.left) || 0;
      var hi = handles[1] ? (parseFloat(handles[1].style.left) || 100) : 100;
      if (masks[0]) { masks[0].style.left = "0"; masks[0].style.width = lo + "%"; }
      if (masks[1]) { masks[1].style.left = hi + "%"; masks[1].style.width = (100 - hi) + "%"; }
    }
    handles.forEach(function (h, i) {
      h.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        function move(ev) {
          var p = pct(ev.clientX);
          var lo = parseFloat(handles[0].style.left) || 0;
          var hi = handles[1] ? (parseFloat(handles[1].style.left) || 100) : 100;
          if (i === 0) p = Math.min(p, hi - 4);
          else p = Math.max(p, lo + 4);
          h.style.left = p + "%";
          layout();
        }
        function up() {
          h.removeEventListener("pointermove", move);
          h.removeEventListener("pointerup", up);
        }
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", up);
      });
    });
  });
})();
