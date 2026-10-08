/* ============================================================
   TWIGA CARGO — shared site behavior
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Shared rate model (per PDF spec) ---------- */
  var RATES = {
    packages: {
      medium: { label: "Medium Box", price: 85, dims: '18" × 18" × 16"', cuft: 3.0 },
      large:  { label: "Large Box", price: 130, dims: '18" × 18" × 24"', cuft: 4.5 },
      xl:     { label: "XL Box", price: 170, dims: '24" × 18" × 24"', cuft: 6.0 },
      tote:   { label: "55-Gal Heavy Duty Tote", price: 150, dims: "Standard 55-gallon tote", cuft: 7.35 },
      cbm:    { label: "Commercial / CBM", price: 30, dims: "per cubic foot", cuft: 1 }
    },
    destinations: {
      nairobi: { label: "Nairobi", fee: 0 },
      mombasa: { label: "Mombasa", fee: 0 },
      nakuru:  { label: "Nakuru", fee: 15 },
      kisumu:  { label: "Kisumu", fee: 20 },
      kampala: { label: "Kampala", fee: 35 }
    },
    customsFee: 45,
    deliveryBase: 35,
    commercialSurchargePct: 0.15,
    heavyWeightLimitLb: 150,
    heavyPerLb: 0.35,
    airMultiplier: 3.2
  };

  window.TWIGA_RATES = RATES;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  window.TWIGA_MONEY = money;

  /* ---------- Header: mobile menu + services dropdown ---------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    $$(".nav-drop").forEach(function (drop) {
      var btn = $("button", drop);
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = drop.classList.contains("open");
        $$(".nav-drop.open").forEach(function (d) { d.classList.remove("open"); });
        drop.classList.toggle("open", !wasOpen);
        btn.setAttribute("aria-expanded", !wasOpen ? "true" : "false");
      });
    });
    document.addEventListener("click", function () {
      $$(".nav-drop.open").forEach(function (d) {
        d.classList.remove("open");
        var b = $("button", d);
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        $$(".nav-drop.open").forEach(function (d) { d.classList.remove("open"); });
        if (nav) nav.classList.remove("open");
      }
    });
  }

  /* ---------- Reveal on scroll + animated progress bars ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 4, 3) * 90 + "ms";
        io.observe(el);
      });
    }

    var bars = $$("[data-fill]");
    if (bars.length && "IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.getAttribute("data-fill") + "%";
            io2.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      bars.forEach(function (b) { io2.observe(b); });
    } else {
      bars.forEach(function (b) { b.style.width = b.getAttribute("data-fill") + "%"; });
    }
  }

  /* ---------- Hero dual tabs ---------- */
  function initDualTabs() {
    var tabs = $$("[data-dual-tab]");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        $$("[data-dual-pane]").forEach(function (p) {
          p.hidden = p.getAttribute("data-dual-pane") !== tab.getAttribute("data-dual-tab");
        });
      });
    });
  }

  /* ---------- Hero quick-quote ---------- */
  function initQuickQuote() {
    var form = $("#quickQuote");
    if (!form) return;
    var typeSel = $("#qqType", form);
    var qtyInput = $("#qqQty", form);
    var destSel = $("#qqDest", form);
    var priceEl = $("#qqPrice");
    var windowEl = $("#qqWindow");

    function update() {
      var pkg = RATES.packages[typeSel.value];
      var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      var dest = RATES.destinations[destSel.value];
      var base = pkg.price * qty;
      if (typeSel.value === "cbm") base = pkg.price * qty; // qty = cubic feet
      var total = base + dest.fee;
      priceEl.textContent = money(total) + (typeSel.value === "cbm" ? "*" : "");
      windowEl.innerHTML =
        "<strong>Ocean Consolidation:</strong> 30–40 days door-to-door · " +
        "<strong>Air Express:</strong> 5–7 days (est. " + money(total * RATES.airMultiplier) + ")<br>" +
        pkg.label + " × " + qty + " → " + dest.label +
        (dest.fee ? " (incl. " + money(dest.fee) + " inland delivery)" : " (free hub pickup / $35 door delivery)") +
        (typeSel.value === "cbm" ? "<br>*Volume-based rate: $30 per cu. ft. Quantities are approximate cu. ft." : "");
    }

    [typeSel, qtyInput, destSel].forEach(function (el) {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    update();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      window.location.href = "calculator.html";
    });

    var trackForm = $("#quickTrack");
    if (trackForm) {
      trackForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = ($("#qtTrackId") || {}).value || "";
        window.location.href = "tracking.html?hbl=" + encodeURIComponent(id.trim());
      });
    }
  }

  /* ---------- Testimonials carousel ---------- */
  function initCarousel() {
    var root = $("#tcarousel");
    if (!root) return;
    var track = $(".ttrack", root);
    var slides = $$(".tslide", root);
    var dotsWrap = $(".tdots", root);
    var idx = 0;
    var timer;

    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "tdot" + (i === 0 ? " active" : "");
      d.type = "button";
      d.setAttribute("aria-label", "Testimonial " + (i + 1));
      d.addEventListener("click", function () { go(i, true); });
      dotsWrap.appendChild(d);
    });

    function go(i, manual) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      $$(".tdot", dotsWrap).forEach(function (d, j) {
        d.classList.toggle("active", j === idx);
      });
      if (manual) restart();
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1, false); }, 7000);
    }

    var prev = $(".tarrow.prev", root);
    var next = $(".tarrow.next", root);
    if (prev) prev.addEventListener("click", function () { go(idx - 1, true); });
    if (next) next.addEventListener("click", function () { go(idx + 1, true); });
    restart();
  }

  /* ---------- Calculator page ---------- */
  function initCalculator() {
    var form = $("#calcForm");
    if (!form) return;

    var unit = "imperial";
    var unitBtns = $$("[data-unit]");
    var L = $("#dimL"), W = $("#dimW"), H = $("#dimH"), WT = $("#dimWt");

    var defaults = {
      imperial: { l: 18, w: 18, h: 24, wt: 45 },
      metric:   { l: 46, w: 46, h: 61, wt: 20 }
    };

    function setUnits(u) {
      unit = u;
      unitBtns.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-unit") === u);
      });
      $$("[data-unit-label]").forEach(function (el) {
        el.textContent = u === "imperial" ? el.getAttribute("data-unit-label") : el.getAttribute("data-unit-label-metric");
      });
      var d = defaults[u];
      L.value = d.l; W.value = d.w; H.value = d.h; WT.value = d.wt;
      compute();
    }

    unitBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var u = b.getAttribute("data-unit");
        // convert current values instead of resetting
        if (u === unit) return;
        var f = function (v) { return Math.round((parseFloat(v) || 0) * 10) / 10; };
        if (u === "metric") {
          L.value = f(parseFloat(L.value) * 2.54);
          W.value = f(parseFloat(W.value) * 2.54);
          H.value = f(parseFloat(H.value) * 2.54);
          WT.value = f(parseFloat(WT.value) * 0.4536);
        } else {
          L.value = f(parseFloat(L.value) / 2.54);
          W.value = f(parseFloat(W.value) / 2.54);
          H.value = f(parseFloat(H.value) / 2.54);
          WT.value = f(parseFloat(WT.value) / 0.4536);
        }
        unit = u;
        unitBtns.forEach(function (bb) { bb.classList.toggle("active", bb === b); });
        $$("[data-unit-label]").forEach(function (el) {
          el.textContent = u === "imperial" ? el.getAttribute("data-unit-label") : el.getAttribute("data-unit-label-metric");
        });
        compute();
      });
    });

    // choice card selection
    $$(".choice input").forEach(function (input) {
      input.addEventListener("change", function () {
        $$("input[name='" + input.name + "']").forEach(function (i) {
          var card = i.closest(".choice");
          if (card) card.classList.toggle("selected", i.checked);
        });
        if (input.name === "category") {
          var notice = $("#commercialNotice");
          if (notice) notice.hidden = input.value !== "commercial";
        }
        compute();
      });
    });

    [L, W, H, WT].forEach(function (el) { el.addEventListener("input", compute); });
    $("#calcDest") && $("#calcDest").addEventListener("change", compute);

    function compute() {
      var l = parseFloat(L.value) || 0;
      var w = parseFloat(W.value) || 0;
      var h = parseFloat(H.value) || 0;
      var wt = parseFloat(WT.value) || 0;

      // normalize to inches / pounds
      var lin = unit === "imperial" ? l : l / 2.54;
      var win = unit === "imperial" ? w : w / 2.54;
      var hin = unit === "imperial" ? h : h / 2.54;
      var lb = unit === "imperial" ? wt : wt / 0.4536;

      var in3 = lin * win * hin;
      var cuft = in3 / 1728;

      // visual
      var scale = 118 / Math.max(lin, win, hin, 1);
      var box = $("#box3d");
      if (box) {
        box.style.setProperty("--width", Math.max(28, lin * scale) + "px");
        box.style.setProperty("--height", Math.max(24, hin * scale) + "px");
        box.style.setProperty("--depth", Math.max(24, win * scale) + "px");
      }
      $("#vrVol") && ($("#vrVol").textContent = cuft.toFixed(2) + " ft³");
      $("#vrWeight") && ($("#vrWeight").textContent = Math.round(lb) + " lb");
      $("#vrDims") && ($("#vrDims").textContent =
        Math.round(lin) + '×' + Math.round(win) + '×' + Math.round(hin) + " in");

      $("#formula") && ($("#formula").innerHTML =
        '<span class="fx">' + Math.round(lin) + ' × ' + Math.round(win) + ' × ' + Math.round(hin) + " in</span>" +
        "<span>÷ 1,728 =</span>" +
        '<span class="fx fx-out">' + cuft.toFixed(2) + " ft³</span>" +
        "<span>·</span><span class=\"fx\">" + Math.round(lb) + " lb</span>");

      // pricing
      var freight = Math.max(85, cuft * RATES.packages.cbm.price);
      var heavy = Math.max(0, lb - RATES.heavyWeightLimitLb) * RATES.heavyPerLb;

      var category = ($("input[name='category']:checked") || {}).value || "personal";
      var surcharge = category === "commercial" ? freight * RATES.commercialSurchargePct : 0;

      var mode = ($("input[name='mode']:checked") || {}).value || "ocean";
      var freightFinal = mode === "air" ? freight * RATES.airMultiplier : freight;

      var destSel = $("#calcDest");
      var dest = RATES.destinations[destSel ? destSel.value : "nairobi"];
      var delivery = RATES.deliveryBase + dest.fee;

      var customs = RATES.customsFee;
      var total = freightFinal + heavy + surcharge + customs + delivery;

      function setRow(id, val, node) {
        var el = $(id);
        if (el) el.textContent = val;
      }
      setRow("#sFreight", money(freightFinal) + (mode === "air" ? " (Air Express)" : " (Ocean)"));
      setRow("#sHeavy", heavy ? money(heavy) : "$0");
      setRow("#sSurcharge", surcharge ? money(surcharge) : "$0");
      setRow("#sCustoms", money(customs));
      setRow("#sDelivery", money(delivery) + " → " + dest.label);
      setRow("#sTotal", money(total));

      var meta = $("#sumMeta");
      if (meta) {
        meta.innerHTML = mode === "air"
          ? "<strong>Air Express:</strong> estimated 5–7 days door-to-door. Guaranteed flat rate — no surprise customs charges."
          : "<strong>Ocean Consolidation:</strong> estimated 30–40 days door-to-door. Guaranteed flat rate — no surprise customs charges.";
      }
    }

    // actions
    var saveBtn = $("#saveQuote");
    if (saveBtn) saveBtn.addEventListener("click", function () { window.print(); });
    var bookBtn = $("#bookIntake");
    if (bookBtn) bookBtn.addEventListener("click", function () {
      window.location.href = "hubs.html#book";
    });

    setUnits("imperial");
  }

  /* ---------- Tracking page ---------- */
  function initTracking() {
    var form = $("#trackForm");
    if (!form) return;

    var demo = {
      id: "KE-2026-8891",
      status: "In Transit — Ocean Freight",
      route: "Modesto, CA → Nairobi, Kenya",
      container: "CMAU-882190",
      vessel: "MV Nordic Spirit · Voyage 118E",
      eta: "Nov 14, 2026",
      weight: "412 lb (3 boxes + 1 tote)",
      milestones: [
        {
          time: "Sep 28, 2026 · 10:42 AM",
          title: "Package Received at Modesto Hub",
          body: "3 boxes + 1 heavy-duty tote checked in, weighed and dimension-verified at our Modesto, CA collection facility.",
          tags: ["Intake photo #A-2214", "Weight: 412 lb"],
          state: "done"
        },
        {
          time: "Oct 2, 2026 · 04:15 PM",
          title: "Consolidated into Container #CMAU-882190",
          body: "Shipment loaded into a secure 40ft high-cube container and staged for the Port of Oakland.",
          tags: ["House Bill: KE-2026-8891", "Staged for Oakland"],
          state: "done"
        },
        {
          time: "Oct 8, 2026 · 11:20 AM",
          title: "Vessel Departed Port of Oakland",
          body: "MV Nordic Spirit departed Oakland on voyage 118E bound for Mombasa via Singapore transshipment.",
          tags: ["Voyage 118E", "ETA Mombasa: Nov 9, 2026"],
          state: "current"
        },
        {
          time: "Est. Nov 9, 2026",
          title: "Arrive Port of Mombasa & Transfer to SGR Rail",
          body: "Container offloaded at Mombasa and transferred to the SGR rail service to Nairobi for customs processing.",
          tags: ["SGR Rail freight", "Customs processing"],
          state: "pending"
        },
        {
          time: "Est. Nov 11, 2026",
          title: "Cleared Customs at ICDN Embakasi, Nairobi",
          body: "KRA duty clearance completed by our approved clearing partner network at the ICDN Embakasi depot.",
          tags: ["KRA duty clearance", "ICDN Embakasi"],
          state: "pending"
        },
        {
          time: "Est. Nov 13, 2026",
          title: "Deconsolidated & Out for Last-Mile Delivery",
          body: "Container unpacked and your cargo released for hub pickup in Nairobi or direct last-mile delivery to the recipient's doorstep.",
          tags: ["Driver details via SMS", "Pickup ready notification"],
          state: "pending"
        }
      ]
    };

    function render(shipment) {
      var wrap = $("#shipmentResult");
      if (!wrap) return;
      $("#trackError").hidden = true;

      var pills = {
        done: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>',
        current: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/></svg>',
        pending: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/></svg>'
      };

      var html = "";
      html += '<div class="shipment-head">' +
        '<div class="shipment-id">' +
        '<div class="si-num">' + shipment.id + '</div>' +
        '<div class="si-route">' + shipment.route + '</div></div>' +
        '<div class="status-pill"><span class="pulse"></span>' + shipment.status + '</div>' +
        '<div class="shipment-facts">' +
        '<div class="sf-item"><div class="sf-key">Container</div><div class="sf-val">' + shipment.container + '</div></div>' +
        '<div class="sf-item"><div class="sf-key">Vessel</div><div class="sf-val">' + shipment.vessel + '</div></div>' +
        '<div class="sf-item"><div class="sf-key">Est. Delivery</div><div class="sf-val">' + shipment.eta + '</div></div>' +
        '<div class="sf-item"><div class="sf-key">Weight</div><div class="sf-val">' + shipment.weight + '</div></div>' +
        '</div></div>';

      html += '<div class="timeline">';
      shipment.milestones.forEach(function (m) {
        html += '<div class="tl-item ' + m.state + '">' +
          '<div class="tl-marker">' + pills[m.state] + '</div>' +
          '<div class="tl-time">' + m.time + '</div>' +
          '<h3>' + m.title + '</h3>' +
          '<p>' + m.body + '</p>' +
          (m.tags || []).map(function (t) {
            return '<span class="tl-detail">' + t + '</span>';
          }).join("") +
          '</div>';
      });
      html += '</div>';

      wrap.innerHTML = html;
      wrap.hidden = false;
      wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = ($("#trackId").value || "").trim().toUpperCase();
      if (!val || val === demo.id || val.indexOf("8891") !== -1) {
        render(demo);
      } else {
        $("#shipmentResult").hidden = true;
        var err = $("#trackError");
        err.hidden = false;
        err.textContent = "No shipment found for \"" + val + "\". Check your House Bill number — or try our demo shipment " + demo.id + ".";
      }
    });

    // deep-link: tracking.html?hbl=KE-2026-8891
    var params = new URLSearchParams(window.location.search);
    var hbl = (params.get("hbl") || "").trim();
    if (hbl) {
      $("#trackId").value = hbl.toUpperCase();
      form.dispatchEvent(new Event("submit"));
    } else {
      $("#trackId").value = demo.id;
    }
  }

  /* ---------- Hubs page: copy + booking form ---------- */
  function initHubs() {
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy");
        var done = function () {
          var old = btn.innerHTML;
          btn.innerHTML = "✓ Copied";
          btn.classList.add("btn-teal");
          setTimeout(function () {
            btn.innerHTML = old;
            btn.classList.remove("btn-teal");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });

    var bookForm = $("#bookForm");
    if (bookForm) {
      // sensible default date = tomorrow
      var dateInput = $("#bookDate");
      if (dateInput && !dateInput.value) {
        var d = new Date();
        d.setDate(d.getDate() + 1);
        dateInput.value = d.toISOString().slice(0, 10);
        dateInput.min = new Date().toISOString().slice(0, 10);
      }
      bookForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = $("#bookOk");
        if (ok) {
          var name = ($("#bookName") || {}).value || "there";
          var date = ($("#bookDate") || {}).value || "";
          var slot = ($("#bookTime") || {}).value || "";
          ok.querySelector(".ok-text").innerHTML =
            "Appointment request received, <strong>" + name + "</strong>. " +
            "Your drop-off slot at the Modesto hub is reserved for <strong>" + date + " · " + slot + "</strong>. " +
            "A confirmation with your unit tag and intake instructions has been sent to your email.";
          ok.classList.add("show");
          ok.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        bookForm.reset();
        if (dateInput) {
          var d2 = new Date();
          d2.setDate(d2.getDate() + 1);
          dateInput.value = d2.toISOString().slice(0, 10);
        }
      });
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initDualTabs();
    initQuickQuote();
    initCarousel();
    initCalculator();
    initTracking();
    initHubs();
  });
})();
