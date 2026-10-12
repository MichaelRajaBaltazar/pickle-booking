const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = document.querySelector("#booking-date");
const bookingCourt = document.querySelector("#booking-court");
const bookingDuration = document.querySelector("#booking-duration");
const bookingEstimate = document.querySelector("#booking-estimate");
const promoInput = document.querySelector("#promo-code");
const promoFeedback = document.querySelector("#promo-feedback");
const lightbox = document.querySelector("#lightbox");
const qrDialog = document.querySelector("#qr-dialog");
const qrImage = document.querySelector("#website-qr");
const qrMessage = document.querySelector("#qr-message");
const qrPrint = document.querySelector("#qr-print");
const loyaltyCount = document.querySelector("#loyalty-count");
const loyaltyProgress = document.querySelector("#loyalty-progress");
const loyaltyStatus = document.querySelector("#loyalty-status");
const loyaltyAdd = document.querySelector("#loyalty-add");

document.querySelector("#year").textContent = new Date().getFullYear();

const today = new Date();
const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
document.querySelectorAll(".day-cell").forEach((dayCell, index) => {
  const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
  dayCell.querySelector("span").textContent = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  if (date.toDateString() === today.toDateString()) dayCell.classList.add("today");
});

if (bookingDate) {
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  bookingDate.min = localToday;
}

const updateBookingEstimate = () => {
  const hourlyRate = Number(bookingCourt.selectedOptions[0]?.dataset.rate);
  const hours = Number(bookingDuration.value);
  bookingEstimate.textContent = hourlyRate && hours
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(hourlyRate * hours)
    : "Choose a court & duration";
};

bookingCourt.addEventListener("change", updateBookingEstimate);
bookingDuration.addEventListener("change", updateBookingEstimate);

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

promoInput.addEventListener("input", () => {
  const code = promoInput.value.trim().toUpperCase();
  if (code) {
    promoFeedback.textContent = "We'll check this code when we confirm your booking.";
  } else {
    promoFeedback.textContent = "";
  }
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const booking = Object.fromEntries(new FormData(bookingForm).entries());
  const message = [
    "Hi PickleCourt! I'd like to request a court booking:",
    `Name: ${booking.name}`,
    `Mobile: ${booking.phone}`,
    `Court: ${booking.court}`,
    `Players: ${booking.players}`,
    `Duration: ${booking.duration} hour${booking.duration === "1" ? "" : "s"}`,
    `Estimated court total: ${bookingEstimate.textContent}`,
    `Date: ${booking.date}`,
    `Preferred time: ${booking.time}`,
    booking.promo ? `Promo code: ${booking.promo}` : "",
    booking.notes ? `Notes: ${booking.notes}` : "",
    "",
    "Please confirm availability and the final rate. Thank you!",
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

document.querySelectorAll(".gallery-open").forEach((button) => {
  button.addEventListener("click", () => {
    const image = lightbox.querySelector("img");
    image.src = button.dataset.gallery;
    image.alt = button.querySelector("img")?.alt || button.getAttribute("aria-label") || "Pickleball court";
    lightbox.showModal();
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

let demoVisits = 7;
loyaltyAdd.addEventListener("click", () => {
  demoVisits = Math.min(demoVisits + 1, 10);
  loyaltyCount.textContent = String(demoVisits);
  loyaltyProgress.style.width = `${demoVisits * 10}%`;
  loyaltyStatus.textContent = demoVisits === 10
    ? "Demo reward reached! Ask the club about actual rewards."
    : `${10 - demoVisits} visits to your next reward`;
  loyaltyAdd.disabled = demoVisits === 10;
});

const publicWebsiteUrl = new URL(window.location.href);
publicWebsiteUrl.hash = "";
publicWebsiteUrl.search = "";
const isPublicWebsite = ["http:", "https:"].includes(publicWebsiteUrl.protocol)
  && !["localhost", "127.0.0.1"].includes(publicWebsiteUrl.hostname);

document.querySelector("#qr-trigger").addEventListener("click", () => {
  qrImage.hidden = true;
  qrPrint.hidden = true;
  qrMessage.textContent = isPublicWebsite
    ? "Preparing a QR code for this website…"
    : "Publish this site at its final web address to create a shareable QR code.";
  qrDialog.showModal();

  if (isPublicWebsite) {
    const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
    qrUrl.searchParams.set("size", "320x320");
    qrUrl.searchParams.set("format", "svg");
    qrUrl.searchParams.set("data", publicWebsiteUrl.href);
    qrImage.src = qrUrl.href;
    qrImage.hidden = false;
  }
});

qrImage.addEventListener("load", () => {
  qrMessage.textContent = "Scan this code to visit the PickleCourt website.";
  qrPrint.hidden = false;
});

qrImage.addEventListener("error", () => {
  qrImage.hidden = true;
  qrPrint.hidden = true;
  qrMessage.textContent = "We couldn't load the QR code. Please try again or share the website link.";
});

qrDialog.querySelector(".qr-close").addEventListener("click", () => qrDialog.close());
qrDialog.addEventListener("click", (event) => {
  if (event.target === qrDialog) qrDialog.close();
});
qrPrint.addEventListener("click", () => window.print());
