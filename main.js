(function () {
  var site = window.SITE || {};
  var phone = String(site.whatsapp || "").replace(/\D/g, "");
  var baseMessage = site.message || "Olá Marcela, vim pelo site e gostaria de agendar uma consulta.";

  function params() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return new URLSearchParams();
    }
  }

  function buildMessage(cta) {
    var search = params();
    var parts = [baseMessage];
    var campaign = search.get("utm_campaign");
    var source = search.get("utm_source");
    var medium = search.get("utm_medium");
    if (source || campaign) {
      var origin = [];
      if (source) origin.push("origem: " + source);
      if (medium) origin.push(medium);
      if (campaign) origin.push("campanha: " + campaign);
      parts.push("(" + origin.join(" · ") + ")");
    }
    if (cta) parts.push("[via " + cta + "]");
    return parts.join(" ");
  }

  function whatsappUrl(cta) {
    return (
      "https://wa.me/" +
      phone +
      "?text=" +
      encodeURIComponent(buildMessage(cta))
    );
  }

  function loadAds() {
    var ads = site.ads || {};
    var id = ads.measurementId || ads.conversionId;
    if (!id || !window.document) return;
    if (window.dataLayer && window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id);

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function trackClick(cta) {
    if (typeof window.gtag !== "function") return;
    var ads = site.ads || {};
    window.gtag("event", "generate_lead", {
      method: "whatsapp",
      cta: cta || "unknown",
    });
    if (ads.conversionId && ads.conversionLabel) {
      window.gtag("event", "conversion", {
        send_to: ads.conversionId + "/" + ads.conversionLabel,
      });
    }
  }

  function bindLinks() {
    var nodes = document.querySelectorAll(".js-whatsapp");
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var cta = el.getAttribute("data-cta") || "whatsapp";
        el.setAttribute("href", whatsappUrl(cta));
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.addEventListener("click", function () {
          trackClick(cta);
        });
      })(nodes[i]);
    }
  }

  function headerScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function parseInstagram(url) {
    if (!url) return null;
    var match = String(url).match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
    if (!match) return null;
    return { kind: match[1].toLowerCase(), code: match[2] };
  }

  function embedUrl(kind, code) {
    return (
      "https://www.instagram.com/" +
      encodeURIComponent(kind) +
      "/" +
      encodeURIComponent(code) +
      "/embed"
    );
  }

  function permalink(kind, code) {
    return "https://www.instagram.com/" + kind + "/" + encodeURIComponent(code) + "/";
  }

  function loadReelFrame(card) {
    if (!card || card.getAttribute("data-loaded") === "1") return;
    var code = card.getAttribute("data-code");
    var kind = card.getAttribute("data-kind") || "p";
    if (!code) return;
    card.setAttribute("data-loaded", "1");
    var frame = document.createElement("iframe");
    frame.src = embedUrl(kind, code);
    frame.title = "Publicação de " + (site.instagramHandle || "Instagram");
    frame.loading = "lazy";
    frame.setAttribute("allowtransparency", "true");
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; picture-in-picture");
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    card.appendChild(frame);
    card.classList.add("is-loaded");
  }

  function renderInstagram() {
    var grid = document.getElementById("reels");
    if (!grid) return;

    var raw = site.instagramReels || [];
    var posts = [];
    for (var i = 0; i < raw.length && posts.length < 3; i++) {
      var parsed = parseInstagram(raw[i] && raw[i].url ? raw[i].url : raw[i]);
      if (parsed) posts.push(parsed);
    }

    if (!posts.length) {
      grid.innerHTML =
        '<a class="reel reel-fallback" href="' +
        (site.instagram || "https://www.instagram.com/marcelastohlerpsi/") +
        '" target="_blank" rel="noopener noreferrer">' +
        '<span class="reel-play" aria-hidden="true"></span>' +
        "<span>Ver os vídeos no Instagram</span>" +
        "</a>";
      return;
    }

    var html = "";
    for (var k = 0; k < posts.length; k++) {
      html +=
        '<article class="reel" data-kind="' +
        posts[k].kind +
        '" data-code="' +
        posts[k].code +
        '">' +
        '<a class="reel-open" href="' +
        permalink(posts[k].kind, posts[k].code) +
        '" target="_blank" rel="noopener noreferrer">Abrir no Instagram</a>' +
        '<button class="reel-gate" type="button" aria-label="Assistir publicação">' +
        '<span class="reel-play" aria-hidden="true"></span>' +
        "</button>" +
        "</article>";
    }
    grid.innerHTML = html;

    var gates = grid.querySelectorAll(".reel-gate");
    for (var g = 0; g < gates.length; g++) {
      gates[g].addEventListener("click", function (ev) {
        var card = ev.currentTarget.parentNode;
        ev.currentTarget.remove();
        loadReelFrame(card);
      });
    }
  }

  loadAds();
  bindLinks();
  headerScroll();
  renderInstagram();
})();
