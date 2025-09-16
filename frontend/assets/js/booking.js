// --- Konfiguration ---
const OPENING_HOURS = {
    // 0 = søn ... 6 = lør
    1: { start: "10:00", end: "19:00" }, // man
    2: { start: "10:00", end: "19:00" }, // tir
    3: { start: "10:00", end: "19:00" }, // ons
    4: { start: "10:00", end: "19:00" }, // tor
    5: { start: "10:00", end: "19:00" }, // fre
    6: { start: "10:00", end: "16:00" }, // lør
    0: null, // søndag lukket
  };
  
  const SERVICE_DURATION_MIN = {
    "Classic Cut": 30,
    "Skin Fade": 45,
    "Beard Trim": 20,
    "Cut & Beard": 60,
  };
  
  const SLOT_INTERVAL_MIN = 15; // generer slots hver 15. minut
  
  // EmailJS – UDFYLD disse tre værdier i projektet
  const EMAILJS_PUBLIC_KEY = "DIN_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "DIN_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "DIN_TEMPLATE_ID";
  
  // --- Hjælpere ---
  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }
  function fromMinutes(min) {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}`;
  }
  function isToday(d) {
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }
  function setMinDate(input) {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    input.min = `${yyyy}-${mm}-${dd}`;
  }
  
  // Generér mulige tider ud fra dag + åbningstid + varighed
  function generateSlots(dateStr, service) {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return [];
    const weekday = d.getDay();
    const hours = OPENING_HOURS[weekday];
    if (!hours) return []; // lukket
  
    const dur = SERVICE_DURATION_MIN[service] || 30;
    const startMin = toMinutes(hours.start);
    const endMin = toMinutes(hours.end);
  
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
  
    const slots = [];
    for (let m = startMin; m + dur <= endMin; m += SLOT_INTERVAL_MIN) {
      // hvis datoen er i dag, undgå tider der er passeret
      if (isToday(d) && m <= nowMin) continue;
      slots.push(fromMinutes(m));
    }
    return slots;
  }
  
  // UI elementer
  const form = document.getElementById("bookingForm");
  const serviceEl = document.getElementById("service");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const submitBtn = document.getElementById("submitBtn");
  const toast = document.getElementById("toast");
  
  function showToast(msg, kind = "info") {
    toast.textContent = msg;
    toast.className = `toast ${kind} show`;
    setTimeout(() => toast.classList.remove("show"), 3200);
  }
  
  // Min. dato = i dag
  setMinDate(dateEl);
  
  // Når service eller dato ændres, opdater tider
  function refreshTimes() {
    const svc = serviceEl.value;
    const date = dateEl.value;
    timeEl.innerHTML = `<option value="" disabled selected>Vælg tidspunkt</option>`;
    if (!svc || !date) return;
    const slots = generateSlots(date, svc);
    if (!slots.length) {
      const d = new Date(date + "T00:00:00");
      const w = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][d.getDay()];
      showToast(`${w}: Ingen ledige tider (lukket eller udenfor åbningstid)`, "warn");
      return;
    }
    const opts = slots.map(t => `<option value="${t}">${t}</option>`).join("");
    timeEl.insertAdjacentHTML("beforeend", opts);
  }
  
  serviceEl.addEventListener("change", refreshTimes);
  dateEl.addEventListener("change", refreshTimes);
  
  // Afsend formular
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
  
    const payload = {
      service: serviceEl.value,
      date: dateEl.value,
      time: timeEl.value,
      barber: document.getElementById("barber").value || "Ingen præference",
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      note: document.getElementById("note").value.trim(),
      submitted_at: new Date().toISOString(),
    };
  
    submitBtn.disabled = true; submitBtn.textContent = "Sender...";
    try {
      // Hvis EmailJS er konfigureret, brug det
      if (window.emailjs && EMAILJS_PUBLIC_KEY !== "DIN_PUBLIC_KEY") {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
        showToast("Tak! Vi har modtaget din forespørgsel.", "ok");
      } else {
        // Fallback: åbner mailklient med udfyldt indhold
        const to = encodeURIComponent("hello@lojobarbers.com"); // ← skift til jeres e-mail
        const subject = encodeURIComponent(`Booking-anmodning: ${payload.service} ${payload.date} kl. ${payload.time}`);
        const body = encodeURIComponent(
          `Navn: ${payload.name}\nTelefon: ${payload.phone}\nEmail: ${payload.email}\nYdelse: ${payload.service}\nDato: ${payload.date}\nTid: ${payload.time}\nBarber: ${payload.barber}\nNoter: ${payload.note || "-" }\n\nSendt: ${new Date().toLocaleString()}`
        );
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        showToast("Åbnede din mailklient for at sende forespørgslen.", "info");
      }
  
      form.reset();
      setMinDate(dateEl);
      refreshTimes();
    } catch (err) {
      console.error(err);
      showToast("Kunne ikke sende. Prøv igen om lidt.", "err");
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = "Send booking-anmodning";
    }
  });
  