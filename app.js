// ==============================================================================
// STUDENT VIEW: REAL-TIME DATA FROM FIREBASE + NOTIFICATION PERMISSION
// (Admin login, notice/timetable forms, and delete are handled in admin.js —
//  keeping them in one place only, so nothing fires twice.)
// ==============================================================================

// Notification Audio Playback Function
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio play blocked by browser policy");
  }
}

let isInitialNoticeLoad = true;

// A. നോട്ടീസ് ബോർഡ് ഫയർബേസിൽ നിന്ന് തത്സമയം സ്ക്രീനിൽ കാണിക്കാൻ (24 മണിക്കൂർ ഫിൽട്ടറോട് കൂടി)
db.collection("notices")
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
    const container = document.getElementById("notices-container");
    if (!container) return;

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <p>പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.</p>
        </div>`;
      return;
    }

    let validNoticeCount = 0;
    const now = new Date().getTime();
    const twentyFourHours = 14 * 60 * 60 * 1000;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;

      if (data.timestamp) {
        const postTime = data.timestamp.toDate().getTime();
        if ((now - postTime) > twentyFourHours) {
          return;
        }
      }

      validNoticeCount++;

      const card = document.createElement("div");
      card.className = "card-animate notice-card";

      const deleteBtnHTML = window.isAdminLoggedIn
        ? `<button onclick="deleteItem('notices', '${docId}')" class="delete-btn">
             <i class="fa-solid fa-trash"></i>
           </button>`
        : '';

      card.innerHTML = `
        ${deleteBtnHTML}
        <h4>${data.title}</h4>
        ${data.description ? `<p>${data.description}</p>` : ''}
      `;

      container.appendChild(card);
    });

    if (validNoticeCount === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <p>പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.</p>
        </div>`;
      return;
    }

    if (!isInitialNoticeLoad && !snapshot.metadata.hasPendingWrites) {
      playNotificationSound();
    }
    isInitialNoticeLoad = false;
  });

let isInitialTTLoad = true;

// B. ടൈംടേബിൾ ഫയർബേസിൽ നിന്ന് തത്സമയം കാണിക്കാൻ (24 മണിക്കൂർ ഫിൽട്ടറോട് കൂടി)
db.collection("timetable")
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
    const container = document.getElementById("timetable-container");
    if (!container) return;

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-calendar-xmark"></i>
          <p>ടൈംടേബിൾ ലഭ്യമല്ല.</p>
        </div>`;
      return;
    }

    let validTTCount = 0;
    const now = new Date().getTime();
    const twentyFourHours = 14 * 60 * 60 * 1000;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;

      if (data.timestamp) {
        const postTime = data.timestamp.toDate().getTime();
        if ((now - postTime) > twentyFourHours) {
          return;
        }
      }

      validTTCount++;

      const card = document.createElement("div");
      card.className = "card-animate timetable-card";

      const deleteBtnHTML = window.isAdminLoggedIn
        ? `<button onclick="deleteItem('timetable', '${docId}')" class="delete-btn delete-btn-inline">
             <i class="fa-solid fa-trash"></i>
           </button>`
        : '';

      card.innerHTML = `
        <div class="pr-2">
          <span class="class-tag">${data.class}</span>
          <p>${data.details}</p>
        </div>
        ${deleteBtnHTML}
      `;

      container.appendChild(card);
    });

    if (validTTCount === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-calendar-xmark"></i>
          <p>ടൈംടേബിൾ ലഭ്യമല്ല.</p>
        </div>`;
      return;
    }

    if (!isInitialTTLoad && !snapshot.metadata.hasPendingWrites) {
      playNotificationSound();
    }
    isInitialTTLoad = false;
  });

// ==============================================================================
// PWA NOTIFICATION PERMISSION REQUEST
// ==============================================================================
const notifBtn = document.getElementById("enable-notif-btn");
if (notifBtn) {
  notifBtn.addEventListener("click", () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          alert("നോട്ടിഫിക്കേഷൻ ആക്റ്റീവ് ആയി! പുതിയ നോട്ടീസുകൾ വരുമ്പോൾ ഫോണിൽ അറിയാം.");
          notifBtn.classList.add("notif-on");
        } else {
          alert("നോട്ടിഫിക്കേഷൻ പെർമിഷൻ ബ്ലോക്ക് ചെയ്തിരിക്കുന്നു.");
        }
      });
    } else {
      alert("ഈ ബ്രൗസർ നോട്ടിഫിക്കേഷൻ സപ്പോർട്ട് ചെയ്യുന്നില്ല.");
    }
  });
}
