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

  loadAds();
  bindLinks();
  headerScroll();
})();
