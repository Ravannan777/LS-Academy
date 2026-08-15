// ==============================================================================
// ADMIN PANEL: LOGIN, NOTICE/TIMETABLE FORMS, DELETE
// This is the ONLY place these are defined — app.js only renders the student view.
// ==============================================================================
const ADMIN_PASSWORD = "leenasugi";
window.isAdminLoggedIn = false;

// Toggle Admin Panel View
function toggleAdminView() {
  const userView = document.getElementById("user-view");
  const adminView = document.getElementById("admin-view");
  const adminBtn = document.getElementById("nav-admin-btn");

  if (!window.isAdminLoggedIn) {
    const inputPass = prompt("അഡ്മിൻ പാനലിൽ പ്രവേശിക്കാൻ പാസ്‌വേഡ് നൽകുക:");

    if (inputPass === ADMIN_PASSWORD) {
      window.isAdminLoggedIn = true;
      userView.classList.add("hidden");
      adminView.classList.remove("hidden");

      adminBtn.classList.add("nav-btn-active");
      adminBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> <span>ലോഗ് ഔട്ട്</span>`;

      alert("ലോഗിൻ വിജയകരമാണ്! നിങ്ങൾക്ക് ഇനി പുതിയ നോട്ടീസുകളും ടൈംടേബിളും ഇടാം.");
    } else if (inputPass !== null) {
      alert("തെറ്റായ പാസ്‌വേഡ്! വീണ്ടും ശ്രമിക്കുക.");
    }
  } else {
    window.isAdminLoggedIn = false;
    adminView.classList.add("hidden");
    userView.classList.remove("hidden");

    adminBtn.classList.remove("nav-btn-active");
    adminBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> <span>അഡ്മിൻ ലോഗിൻ</span>`;
  }
}

// 1. Notice Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const noticeForm = document.getElementById("notice-form");

  if (noticeForm) {
    noticeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById("notice-submit-btn");
      const title = document.getElementById("notice-title").value.trim();
      const desc = document.getElementById("notice-desc").value.trim();

      if (!title) {
        alert("ദയവായി വിവിരത്തിന്റെ ടൈറ്റിൽ നൽകുക.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>പോസ്റ്റ് ചെയ്യുന്നു...</span>`;

      try {
        await db.collection("notices").add({
          title: title,
          description: desc,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        noticeForm.reset();
        alert("✅ അറിയിപ്പ് വിജയകരമായി പോസ്റ്റ് ചെയ്തു!");
      } catch (error) {
        console.error("Error publishing notice: ", error);
        alert("❌ സെർവർ എറർ! നോട്ടീസ് അയക്കാൻ സാധിച്ചില്ല.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>അറിയിപ്പ് പോസ്റ്റ് ചെയ്യുക</span>`;
      }
    });
  }

  // 2. Timetable Form Submission
  const timetableForm = document.getElementById("timetable-form");

  if (timetableForm) {
    timetableForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById("tt-submit-btn");
      const selectedClass = document.getElementById("tt-class").value;
      const details = document.getElementById("tt-details").value.trim();

      if (!details) {
        alert("ദയവായി വിഷയവും സമയവും ടൈപ്പ് ചെയ്യുക.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>അപ്‌ഡേറ്റ് ചെയ്യുന്നു...</span>`;

      try {
        await db.collection("timetable").add({
          class: selectedClass,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        timetableForm.reset();
        alert(`✅ ${selectedClass} ടൈംടേബിൾ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!`);
      } catch (error) {
        console.error("Error updating timetable: ", error);
        alert("❌ സെർവർ എറർ! ടൈംടേബിൾ മാറ്റാൻ സാധിച്ചില്ല.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> <span>ടൈംടേബിൾ അപ്‌ഡേറ്റ് ചെയ്യുക</span>`;
      }
    });
  }
});

// Delete Function
async function deleteItem(collectionName, docId) {
  if (confirm("ഈ വിവരം ഡിലീറ്റ് ചെയ്യണം എന്ന് ഉറപ്പാണോ?")) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      alert("✅ വിജയകരമായി നീക്കം ചെയ്തു!");
    } catch (error) {
      console.error("Delete Error: ", error);
      alert("❌ നീക്കം ചെയ്യാൻ സാധിച്ചില്ല.");
    }
  }
}
