(function () {
  "use strict";

  var config = window.EVENT_RADAR_CONFIG || {};
  var board = document.getElementById("event-board");
  var form = document.getElementById("post-form");
  var postButton = document.getElementById("post-button");
  var refreshButton = document.getElementById("refresh-button");
  var result = document.getElementById("post-result");
  var resultLabel = result.querySelector(".result-label");
  var resultMessage = result.querySelector(".result-message");
  var reasons = result.querySelector(".reasons");
  var activeFilter = "all";
  var events = [];

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

  function setEmpty(message) {
    board.replaceChildren(makeElement("li", "empty", message));
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

  function buildEventCard(event) {
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

    item.appendChild(date);
    item.appendChild(body);
    return item;
  }

  function renderEvents() {
    var visibleEvents = events.filter(eventMatchesFilter);
    if (!visibleEvents.length) {
      setEmpty(events.length ? "No events match this filter yet." : "No events yet. Post the first one!");
      return;
    }
    board.replaceChildren.apply(board, visibleEvents.map(buildEventCard));
  }

  function setBoardLoading() {
    setEmpty("Loading events…");
    refreshButton.disabled = true;
  }

  async function loadEvents() {
    if (!window.supabase || !config.supabaseUrl || !config.publishableKey) {
      setEmpty("The website is not connected to Supabase yet.");
      return;
    }
    setBoardLoading();
    var client = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
    var response = await client
      .from("events")
      .select("id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary")
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });
    refreshButton.disabled = false;
    if (response.error) {
      events = [];
      setEmpty("Events could not be loaded right now. Please try Refresh.");
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
    (reasonList || []).forEach(function (reason) {
      reasons.appendChild(makeElement("li", "", reason));
    });
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    var announcement = document.getElementById("announcement").value.trim();
    if (announcement.length < 1 || announcement.length > 2000) {
      showResult("error", "Please enter an announcement between 1 and 2,000 characters.");
      return;
    }
    if (!config.supabaseUrl || !config.publishableKey) {
      showResult("error", "The website is missing its Supabase connection settings.");
      return;
    }

    postButton.disabled = true;
    postButton.textContent = "Checking…";
    result.hidden = true;
    var formData = new FormData();
    formData.append("announcement", announcement);
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

  form.addEventListener("submit", submitAnnouncement);
  refreshButton.addEventListener("click", loadEvents);
  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (filterButton) {
        filterButton.setAttribute("aria-pressed", String(filterButton === button));
      });
      renderEvents();
    });
  });

  loadEvents();
}());
