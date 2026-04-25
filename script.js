(function () {
  "use strict";

  function trackCustom(eventName, payload) {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, payload || {});
    }
  }

  function trackStandard(eventName, payload) {
    if (typeof window.fbq === "function") {
      window.fbq("track", eventName, payload || {});
    }
  }

  function setCurrentYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function setUtmParams() {
    var params = new URLSearchParams(window.location.search);
    var map = ["utm_source", "utm_campaign", "utm_adset", "utm_ad"];
    map.forEach(function (key) {
      var input = document.getElementById(key);
      if (input) {
        input.value = params.get(key) || "";
      }
    });
  }

  function bindCtaTracking() {
    var ctas = document.querySelectorAll(".track-contact");
    ctas.forEach(function (cta) {
      cta.addEventListener("click", function () {
        var href = cta.getAttribute("href") || "";
        if (href.indexOf("tel:") === 0) {
          trackCustom("cta_click_call", { target: href });
          trackStandard("Contact");
        } else if (href.indexOf("mailto:") === 0) {
          trackCustom("cta_click_email", { target: href });
          trackStandard("Contact");
        } else if (href.indexOf("https://wa.me/") === 0 || href.indexOf("http://wa.me/") === 0) {
          trackCustom("cta_click_whatsapp", { target: href });
          trackStandard("Contact");
        } else {
          trackCustom("cta_click_form", { target: href });
        }
      });
    });
  }

  function bindLeadForm() {
    var form = document.getElementById("contact-form");
    var message = document.getElementById("form-message");

    if (!form || !message) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      message.className = "form-message";

      if (!form.checkValidity()) {
        message.textContent = "Please complete all required fields correctly.";
        message.classList.add("error");
        trackCustom("lead_submit_error", { reason: "validation_error" });
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var payload = {
        full_name: String(data.get("full_name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        company: String(data.get("company") || "").trim(),
        budget_range: String(data.get("budget_range") || ""),
        project_goal: String(data.get("project_goal") || "").trim(),
        consent_privacy: data.get("consent_privacy") === "on",
        utm_source: String(data.get("utm_source") || ""),
        utm_campaign: String(data.get("utm_campaign") || ""),
        utm_adset: String(data.get("utm_adset") || ""),
        utm_ad: String(data.get("utm_ad") || "")
      };

      if (!payload.consent_privacy) {
        message.textContent = "You must agree to the Privacy Policy before submitting.";
        message.classList.add("error");
        trackCustom("lead_submit_error", { reason: "missing_consent" });
        return;
      }

      console.log("Lead payload:", payload);

      message.textContent = "Thank you. Your request has been received. We will contact you soon.";
      message.classList.add("success");

      trackCustom("lead_submit_success", {
        budget_range: payload.budget_range,
        utm_source: payload.utm_source
      });
      trackStandard("Lead");

      form.reset();
      setUtmParams();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setCurrentYear();
    setUtmParams();
    bindCtaTracking();
    bindLeadForm();

    trackCustom("lp_view", {
      path: window.location.pathname,
      title: document.title
    });
    trackStandard("ViewContent");
  });
})();
