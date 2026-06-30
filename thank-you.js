/* Thank you page — personalize from registration redirect */

(() => {
  "use strict";

  const COMMUNITY_URL = "https://www.stephenakintayo.com";

  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const company = params.get("company");

  const greeting = document.getElementById("thankYouGreeting");
  const nameEl = document.getElementById("thankYouName");
  const companyEl = document.getElementById("thankYouCompany");
  const nameRow = document.getElementById("thankYouNameRow");
  const companyRow = document.getElementById("thankYouCompanyRow");
  const joinBtn = document.getElementById("joinCommunityBtn");

  if (joinBtn) joinBtn.href = COMMUNITY_URL;

  if (name && greeting) {
    greeting.textContent = `Thank you, ${name}`;
  }

  if (name && nameEl && nameRow) {
    nameEl.textContent = name;
    nameRow.hidden = false;
  }

  if (company && companyEl && companyRow) {
    companyEl.textContent = company;
    companyRow.hidden = false;
  }
})();
