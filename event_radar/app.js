(function () {
  "use strict";

  var config = window.EVENT_RADAR_CONFIG || {};
  var supabaseClient = null;
  var board = document.getElementById("event-board");
  var form = document.getElementById("post-form");
  var postButton = document.getElementById("post-button");
  var refreshButton = document.getElementById("refresh-button");
  var result = document.getElementById("post-result");
  var resultLabel = result.querySelector(".result-label");
  var resultMessage = result.querySelector(".result-message");
  var reasons = result.querySelector(".reasons");
  var moderatorPanel = document.getElementById("moderator-panel");
  var moderatorLogin = document.getElementById("moderator-login");
  var moderatorLoginForm = document.getElementById("moderator-login-form");
  var moderatorWorkspace = document.getElementById("moderator-workspace");
  var moderatorEmail = document.getElementById("moderator-email");
  var signOutButton = document.getElementById("sign-out-button");
  var moderatorStatus = document.getElementById("moderator-status");
  var moderatorStatusLabel = moderatorStatus.querySelector(".result-label");
  var moderatorStatusMessage = moderatorStatus.querySelector(".result-message");
  var moderatorReasons = moderatorStatus.querySelector(".reasons");
  var waitingBoard = document.getElementById("waiting-board");
  var activeFilter = "all";
  var events = [];
  var moderatorSession = null;
  var maxFlyerBytes = 5 * 1024 * 1024;

  var statusLabels = {
    published: "Published",
    waiting: "Waiting for a moderator",
    rejected: "Not posted",
    duplicate: "Already posted",
    error: "Could not post"
  };

  function makeElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setEmpty(list, message) {
    list.replaceChildren(makeElement("li", "empty", message));
  }

  function formatDateParts(dateValue) {
    if (!dateValue) return null;
    var parts = String(dateValue).slice(0, 10).split("-");
    if (parts.length !== 3) return null;
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: date.toLocaleDateString(undefined, { month: "short" }),
      day: date.toLocaleDateString(undefined, { day: "numeric" }),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      monthDay: date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    };
  }

  function formatTime(timeValue) {
    if (!timeValue) return "";
    var parts = String(timeValue).split(":");
    var hours = Number(parts[0]);
    var minutes = Number(parts[1] || 0);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
    var suffix = hours >= 12 ? "PM" : "AM";
    var displayHour = hours % 12 || 12;
    return displayHour + ":" + String(minutes).padStart(2, "0") + " " + suffix;
  }

  function formatWhen(event) {
    var date = formatDateParts(event.event_date);
    var start = formatTime(event.start_time);
    var end = formatTime(event.end_time);
    if (!date && !start) return "Date and time to be announced";
    if (!date) return [start, end ? "to " + end : ""].filter(Boolean).join(" ");
    var time = start ? " · " + start + (end ? " to " + end : "") : "";
    return date.weekday + ", " + date.monthDay + time;
  }

  function eventMatchesFilter(event) {
    if (activeFilter === "free") return String(event.cost || "").trim().toLowerCase() === "free";
    if (activeFilter === "food") return event.free_food === true;
    return true;
  }

  function isProjectFlyerUrl(value) {
    if (!value || !config.supabaseUrl) return false;
    try {
      var projectUrl = new URL(config.supabaseUrl);
      var flyerUrl = new URL(value);
      return flyerUrl.origin === projectUrl.origin && flyerUrl.pathname.indexOf("/storage/v1/object/public/flyers/") === 0;
    } catch (error) {
      return false;
    }
  }

  function addReviewControls(body, event) {
    var review = makeElement("div", "review");
    review.appendChild(makeElement("p", "why", event.status_reason || event.note_for_moderator || "This post needs moderator review."));
    review.appendChild(makeElement("p", "original", event.announcement || "Original announcement unavailable."));

    var actions = makeElement("p", "actions");
    var approveButton = makeElement("button", "", "Approve");
    approveButton.type = "button";
    approveButton.dataset.reviewAction = "approve";
    approveButton.dataset.eventId = event.id;
    var rejectButton = makeElement("button", "ghost", "Reject");
    rejectButton.type = "button";
    rejectButton.dataset.reviewAction = "reject";
    rejectButton.dataset.eventId = event.id;
    actions.appendChild(approveButton);
    actions.appendChild(rejectButton);
    review.appendChild(actions);
    body.appendChild(review);
  }

  function buildEventCard(event, includeReview) {
    var item = makeElement("li", "event");
    var dateParts = formatDateParts(event.event_date);
    var date = makeElement("div", dateParts ? "date" : "date tba");
    if (dateParts) {
      date.appendChild(makeElement("span", "mon", dateParts.month));
      date.appendChild(makeElement("span", "day", dateParts.day));
    } else {
      date.appendChild(makeElement("span", "day", "TBA"));
    }

    var body = makeElement("div", "event-body");
    body.appendChild(makeElement("p", "when", formatWhen(event)));
    body.appendChild(makeElement("h3", "", event.title || "Untitled event"));
    var location = [event.club, event.place_name, event.place_detail].filter(function (part) {
      return String(part || "").trim();
    }).join(" · ");
    body.appendChild(makeElement("p", "meta", location || "Campus location to be announced"));
    body.appendChild(makeElement("p", "summary", event.summary || "Details coming soon."));

    var tags = makeElement("p", "tags");
    if (String(event.cost || "").trim().toLowerCase() === "free") {
      tags.appendChild(makeElement("span", "tag", "Free"));
    } else if (event.cost) {
      tags.appendChild(makeElement("span", "tag", event.cost));
    }
    if (event.free_food === true) {
      tags.appendChild(makeElement("span", "tag food", "🍕 Free food"));
    }
    if (tags.childNodes.length) body.appendChild(tags);
    if (includeReview) addReviewControls(body, event);

    item.appendChild(date);
    item.appendChild(body);
    if (isProjectFlyerUrl(event.flyer_url)) {
      var flyer = document.createElement("img");
      flyer.className = "flyer";
      flyer.src = event.flyer_url;
      flyer.alt = "Flyer for " + (event.title || "event");
      flyer.loading = "lazy";
      item.appendChild(flyer);
    }
    return item;
  }

  function renderEvents() {
    var visibleEvents = events.filter(eventMatchesFilter);
    if (!visibleEvents.length) {
      setEmpty(board, events.length ? "No events match this filter yet." : "No events yet. Post the first one!");
      return;
    }
    board.replaceChildren.apply(board, visibleEvents.map(function (event) {
      return buildEventCard(event, false);
    }));
  }

  function setBoardLoading() {
    setEmpty(board, "Loading events…");
    refreshButton.disabled = true;
  }

  async function loadEvents() {
    if (!supabaseClient) {
      setEmpty(board, "The website is not connected to Supabase yet.");
      return;
    }
    setBoardLoading();
    var response = await supabaseClient
      .from("events")
      .select("id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url")
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    refreshButton.disabled = false;
    if (response.error) {
      events = [];
      setEmpty(board, "Events could not be loaded right now. Please try Refresh.");
      return;
    }
    events = response.data || [];
    renderEvents();
  }

  function showResult(status, message, reasonList) {
    result.className = "result " + status;
    result.hidden = false;
    resultLabel.textContent = statusLabels[status] || "Result";
    resultMessage.textContent = message || "";
    reasons.replaceChildren();
    (Array.isArray(reasonList) ? reasonList : []).forEach(function (reason) {
      reasons.appendChild(makeElement("li", "", reason));
    });
  }

  function showModeratorStatus(status, message, reasonList) {
    moderatorStatus.className = "result " + status;
    moderatorStatus.hidden = false;
    moderatorStatusLabel.textContent = status === "published" ? "Updated" : status === "error" ? "Could not update" : "Moderator";
    moderatorStatusMessage.textContent = message || "";
    moderatorReasons.replaceChildren();
    (Array.isArray(reasonList) ? reasonList : []).forEach(function (reason) {
      moderatorReasons.appendChild(makeElement("li", "", reason));
    });
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    var announcement = document.getElementById("announcement").value.trim();
    var flyerInput = document.getElementById("flyer");
    var flyerFile = flyerInput.files && flyerInput.files[0];
    if (announcement.length < 1 || announcement.length > 2000) {
      showResult("error", "Please enter an announcement between 1 and 2,000 characters.");
      return;
    }
    if (flyerFile && flyerFile.type !== "image/jpeg" && flyerFile.type !== "image/png") {
      showResult("error", "The flyer must be a JPG or PNG image.");
      return;
    }
    if (flyerFile && flyerFile.size > maxFlyerBytes) {
      showResult("error", "The flyer must be 5 MB or smaller.");
      return;
    }
    if (!config.supabaseUrl || !config.publishableKey) {
      showResult("error", "The website is missing its Supabase connection settings.");
      return;
    }

    postButton.disabled = true;
    postButton.textContent = "Checking…";
    result.hidden = true;
    var formData = new FormData(form);
    formData.set("announcement", announcement);
    try {
      var response = await fetch(config.supabaseUrl + "/functions/v1/submit-event", {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body: formData
      });
      var data = await response.json();
      if (!response.ok || !data.ok) {
        showResult("error", data.message || "The agent could not check this post.", data.reasons);
      } else {
        showResult(data.status, data.message, data.reasons);
        if (data.status === "published") {
          form.reset();
          await loadEvents();
        }
      }
    } catch (error) {
      showResult("error", "The agent could not be reached. Please try again.");
    } finally {
      postButton.disabled = false;
      postButton.textContent = "Check and post";
    }
  }

  function updateModeratorUi() {
    var signedIn = Boolean(moderatorSession);
    moderatorLogin.hidden = signedIn;
    moderatorWorkspace.hidden = !signedIn;
    if (signedIn) {
      moderatorPanel.open = true;
      moderatorEmail.textContent = moderatorSession.user.email || "Moderator";
    } else {
      moderatorEmail.textContent = "";
      setEmpty(waitingBoard, "Sign in to see posts waiting for review.");
    }
  }

  function renderWaitingEvents(waitingEvents) {
    if (!waitingEvents.length) {
      setEmpty(waitingBoard, "No posts are waiting for review.");
      return;
    }
    waitingBoard.replaceChildren.apply(waitingBoard, waitingEvents.map(function (event) {
      return buildEventCard(event, true);
    }));
  }

  async function loadWaitingEvents() {
    if (!supabaseClient || !moderatorSession) return;
    setEmpty(waitingBoard, "Loading posts for review…");
    var response = await supabaseClient
      .from("events")
      .select("id, created_at, status, status_reason, announcement, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url, note_for_moderator")
      .eq("status", "waiting")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    if (response.error) {
      setEmpty(waitingBoard, "Waiting posts could not be loaded. Please try again.");
      showModeratorStatus("error", "The moderator queue could not be loaded.");
      return;
    }
    renderWaitingEvents(response.data || []);
  }

  async function reviewEvent(eventId, action) {
    if (!supabaseClient || !moderatorSession) return;
    var isApproval = action === "approve";
    var response = await supabaseClient
      .from("events")
      .update({
        status: isApproval ? "published" : "rejected",
        status_reason: isApproval ? "Approved by moderator." : "Rejected by moderator.",
        reviewed_at: new Date().toISOString(),
        reviewed_by: moderatorSession.user.id
      })
      .eq("id", eventId)
      .eq("status", "waiting");
    if (response.error) {
      showModeratorStatus("error", "The post could not be updated. Please try again.");
      return;
    }
    showModeratorStatus("published", isApproval ? "The post was approved and is now public." : "The post was rejected and will not appear publicly.");
    await Promise.all([loadWaitingEvents(), loadEvents()]);
  }

  async function signInModerator(event) {
    event.preventDefault();
    var email = document.getElementById("moderator-login-email").value.trim();
    var password = document.getElementById("moderator-login-password").value;
    if (!email || !password) {
      showModeratorStatus("error", "Enter the moderator email and password.");
      return;
    }
    var button = moderatorLoginForm.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Signing in…";
    try {
      var response = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
      if (response.error) {
        showModeratorStatus("error", "The email or password was not accepted.");
        return;
      }
      moderatorSession = response.data.session;
      updateModeratorUi();
      await loadWaitingEvents();
    } catch (error) {
      showModeratorStatus("error", "Moderator sign-in is unavailable right now.");
    } finally {
      button.disabled = false;
      button.textContent = "Sign in";
    }
  }

  async function signOutModerator() {
    var response = await supabaseClient.auth.signOut();
    if (response.error) {
      showModeratorStatus("error", "Could not sign out. Please try again.");
      return;
    }
    moderatorSession = null;
    updateModeratorUi();
    moderatorStatus.hidden = true;
  }

  function initializeSupabase() {
    if (!window.supabase || !config.supabaseUrl || !config.publishableKey) return;
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
    supabaseClient.auth.onAuthStateChange(function (_event, session) {
      moderatorSession = session;
      updateModeratorUi();
      if (session) window.setTimeout(loadWaitingEvents, 0);
    });
  }

  async function initializeModeratorSession() {
    if (!supabaseClient) return;
    var response = await supabaseClient.auth.getSession();
    if (response.error) {
      showModeratorStatus("error", "Moderator sign-in could not be checked.");
      return;
    }
    moderatorSession = response.data.session;
    updateModeratorUi();
    if (moderatorSession) await loadWaitingEvents();
  }

  form.addEventListener("submit", submitAnnouncement);
  refreshButton.addEventListener("click", loadEvents);
  moderatorLoginForm.addEventListener("submit", signInModerator);
  signOutButton.addEventListener("click", signOutModerator);
  waitingBoard.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-review-action]");
    if (button) reviewEvent(button.dataset.eventId, button.dataset.reviewAction);
  });
  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (filterButton) {
        filterButton.setAttribute("aria-pressed", String(filterButton === button));
      });
      renderEvents();
    });
  });

  initializeSupabase();
  updateModeratorUi();
  loadEvents();
  initializeModeratorSession();
}());
