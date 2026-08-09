// ==============================================================================
// 1. FIREBASE INITIALIZATION & CONFIGURATION
// ==============================================================================
// (ശ്രദ്ധിക്കുക: നിങ്ങളുടെ Firebase Console-ൽ നിന്നും ലഭിക്കുന്ന Keys ഇവിടെ മാറ്റുക)


// ==============================================================================
// 2. ADMIN PANEL ACCESS & SECURITY (SINGLE PAGE SWITCH)
// ==============================================================================

const ADMIN_PASSWORD = "leenasugi"; 
let isAdminLoggedIn = false;

/**
 * Toggle between Student View and Admin View without reloading page
 */
function toggleAdminView() {
  const userView = document.getElementById("user-view");
  const adminView = document.getElementById("admin-view");
  const adminBtn = document.getElementById("nav-admin-btn");

  if (!isAdminLoggedIn) {
    const inputPass = prompt("അഡ്മിൻ പാനലിൽ പ്രവേശിക്കാൻ പാസ്‌വേഡ് നൽകുക:");
    
    if (inputPass === ADMIN_PASSWORD) {
      isAdminLoggedIn = true;
      userView.classList.add("hidden");
      adminView.classList.remove("hidden");
      
      // Update Button Text & Icon for Logout
      adminBtn.classList.replace("bg-indigo-700", "bg-red-600");
      adminBtn.classList.replace("hover:bg-indigo-800", "hover:bg-red-700");
      adminBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> <span>ലോഗ് ഔട്ട്</span>`;
      
      alert("ലോഗിൻ വിജയകരമാണ്! നിങ്ങൾക്ക് ഇനി പുതിയ നോട്ടീസുകളും ടൈംടേബിളും ഇടാം.");
    } else if (inputPass !== null) {
      alert("തെറ്റായ പാസ്‌വേഡ്! വീണ്ടും ശ്രമിക്കുക.");
    }
  } else {
    // Logout Action
    isAdminLoggedIn = false;
    adminView.classList.add("hidden");
    userView.classList.remove("hidden");
    
    // Reset Button Text
    adminBtn.classList.replace("bg-red-600", "bg-indigo-700");
    adminBtn.classList.replace("hover:bg-red-700", "hover:bg-indigo-800");
    adminBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> <span>അഡ്മിൻ ലോഗിൻ</span>`;
  }
}

// ==============================================================================
// 3. ADMIN: PUBLISH DATA TO FIREBASE (NOTICES & TIMETABLE)
// ==============================================================================

// A. പുതിയ അറിയിപ്പുകൾ (Notices) അയക്കാൻ
const noticeForm = document.getElementById("notice-form");
if (noticeForm) {
  noticeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("notice-title").value.trim();
    const desc = document.getElementById("notice-desc").value.trim();

    if (!title) {
      alert("ദയവായി വിവിരത്തിന്റെ ടൈറ്റിൽ നൽകുക.");
      return;
    }

    try {
      await db.collection("notices").add({
        title: title,
        description: desc,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("അറിയിപ്പ് വിജയകരമായി പോസ്റ്റ് ചെയ്തു!");
      noticeForm.reset();
    } catch (error) {
      console.error("Error publishing notice: ", error);
      alert("സെർവർ എറർ! നോട്ടീസ് അയക്കാൻ സാധിച്ചില്ല.");
    }
  });
}

// B. പുതിയ ടൈംടേബിൾ (Timetable) അയക്കാൻ
const timetableForm = document.getElementById("timetable-form");
if (timetableForm) {
  timetableForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const selectedClass = document.getElementById("tt-class").value;
    const details = document.getElementById("tt-details").value.trim();

    if (!details) {
      alert("ദയവായി വിഷയവും സമയവും ടൈപ്പ് ചെയ്യുക.");
      return;
    }

    try {
      await db.collection("timetable").add({
        class: selectedClass,
        details: details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("ടൈംടേബിൾ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!");
      timetableForm.reset();
    } catch (error) {
      console.error("Error updating timetable: ", error);
      alert("സെർവർ എറർ! ടൈംടേബിൾ മാറ്റാൻ സാധിച്ചില്ല.");
    }
  });
}

// ==============================================================================
// 4. ADMIN: DELETE FUNCTIONALITY (പഴയ ഫയലുകൾ ഡിലീറ്റ് ചെയ്യാൻ)
// ==============================================================================
async function deleteItem(collectionName, docId) {
  if (confirm("ഈ വിവരം ഡിലീറ്റ് ചെയ്യണം എന്ന് ഉറപ്പാണോ?")) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      alert("വിജയകരമായി നീക്കം ചെയ്തു.");
    } catch (error) {
      console.error("Delete Error: ", error);
      alert("നീക്കം ചെയ്യാൻ സാധിച്ചില്ല.");
    }
  }
}

// ==============================================================================
// 5. STUDENT VIEW: REAL-TIME DATA FETCHING FROM FIREBASE (With 24-Hour Expiry Filter)
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
        <div class="text-center py-6">
          <i class="fa-solid fa-inbox text-gray-300 text-2xl mb-1"></i>
          <p class="text-xs text-gray-400">പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.</p>
        </div>`;
      return;
    }

    let validNoticeCount = 0;
    const now = new Date().getTime(); // ഇപ്പോഴത്തെ സമയം
    const twentyFourHours = 14 * 60 * 60 * 1000; // 24 മണിക്കൂറിന്റെ മില്ലിസെക്കൻഡ്

    snapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;
      
      // ടൈംസ്റ്റാമ്പ് പരിശോധിക്കുന്നു (Timestamp ഉണ്ടെങ്കിൽ മാത്രം 24 മണിക്കൂർ നോക്കും)
      if (data.timestamp) {
        const postTime = data.timestamp.toDate().getTime();
        // സമയം 24 മണിക്കൂറിലധികം കഴിഞ്ഞിട്ടുണ്ടെങ്കിൽ ഇത് സ്കിപ്പ് ചെയ്യും (കാണിക്കില്ല)
        if ((now - postTime) > twentyFourHours) {
          return; 
        }
      }

      validNoticeCount++;

      const card = document.createElement("div");
      card.className = "card-animate bg-amber-50/70 border border-amber-100 p-3.5 rounded-xl shadow-sm relative";
      
      const deleteBtnHTML = isAdminLoggedIn 
        ? `<button onclick="deleteItem('notices', '${docId}')" class="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs p-1">
             <i class="fa-solid fa-trash"></i>
           </button>` 
        : '';

      card.innerHTML = `
        ${deleteBtnHTML}
        <h4 class="font-bold text-sm text-gray-800 pr-6">${data.title}</h4>
        ${data.description ? `<p class="text-xs text-gray-600 mt-1.5 leading-relaxed">${data.description}</p>` : ''}
      `;
      
      container.appendChild(card);
    });

    // 24 മണിക്കൂറിനുള്ളിൽ പുതിയ നോട്ടീസുകൾ ഒന്നും ഇല്ലെങ്കിൽ
    if (validNoticeCount === 0) {
      container.innerHTML = `
        <div class="text-center py-6">
          <i class="fa-solid fa-inbox text-gray-300 text-2xl mb-1"></i>
          <p class="text-xs text-gray-400">പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.</p>
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
        <div class="text-center py-6">
          <i class="fa-regular fa-calendar-xmark text-gray-300 text-2xl mb-1"></i>
          <p class="text-xs text-gray-400">ടൈംടേബിൾ ലഭ്യമല്ല.</p>
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
          return; // 24 മണിക്കൂർ കഴിഞ്ഞ ടൈംടേബിൾ ഒഴിവാക്കുന്നു
        }
      }

      validTTCount++;

      const card = document.createElement("div");
      card.className = "card-animate bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl flex justify-between items-center shadow-sm relative";

      const deleteBtnHTML = isAdminLoggedIn 
        ? `<button onclick="deleteItem('timetable', '${docId}')" class="text-red-500 hover:text-red-700 text-xs p-1 ml-2">
             <i class="fa-solid fa-trash"></i>
           </button>` 
        : '';

      card.innerHTML = `
        <div class="pr-2">
          <span class="text-[10px] bg-indigo-600 text-white font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">${data.class}</span>
          <p class="text-xs text-gray-800 font-semibold mt-1.5">${data.details}</p>
        </div>
        ${deleteBtnHTML}
      `;

      container.appendChild(card);
    });

    if (validTTCount === 0) {
      container.innerHTML = `
        <div class="text-center py-6">
          <i class="fa-regular fa-calendar-xmark text-gray-300 text-2xl mb-1"></i>
          <p class="text-xs text-gray-400">ടൈംടേബിൾ ലഭ്യമല്ല.</p>
        </div>`;
      return;
    }

    if (!isInitialTTLoad && !snapshot.metadata.hasPendingWrites) {
      playNotificationSound();
    }
    isInitialTTLoad = false;
  });
  
// ==============================================================================
// 6. PWA NOTIFICATION PERMISSION REQUEST
// ==============================================================================
const notifBtn = document.getElementById("enable-notif-btn");
if (notifBtn) {
  notifBtn.addEventListener("click", () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          alert("നോട്ടിഫിക്കേഷൻ ആക്റ്റീവ് ആയി! പുതിയ നോട്ടീസുകൾ വരുമ്പോൾ ഫോണിൽ അറിയാം.");
          notifBtn.classList.add("text-green-600", "bg-green-50");
        } else {
          alert("നോട്ടിഫിക്കേഷൻ പെർമിഷൻ ബ്ലോക്ക് ചെയ്തിരിക്കുന്നു.");
        }
      });
    } else {
      alert("ഈ ബ്രൗസർ നോട്ടിഫിക്കേഷൻ സപ്പോർട്ട് ചെയ്യുന്നില്ല.");
    }
  });
}
