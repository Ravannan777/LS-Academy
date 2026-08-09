// ==============================================================================
// ADMIN PANEL MANAGEMENT & DATA SUBMISSION
// ==============================================================================
const db = window.db; 
const ADMIN_PASSWORD = "leenasugi";
let isAdminLoggedIn = false;

// Toggle Admin Panel View
function toggleAdminView() {
  const userView = document.getElementById("user-view");
  const adminView = document.getElementById("admin-view");
  const adminBtn = document.getElementById("nav-admin-btn");

  if (!isAdminLoggedIn) {
    const inputPass = prompt("Enter Admin Password:");
    
    if (inputPass === ADMIN_PASSWORD) {
      isAdminLoggedIn = true;
      userView.classList.add("hidden");
      adminView.classList.remove("hidden");
      
      adminBtn.classList.replace("bg-indigo-700", "bg-red-600");
      adminBtn.classList.replace("hover:bg-indigo-800", "hover:bg-red-700");
      adminBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> <span>Logout</span>`;
      
      alert("Login Successful! Admin Panel Active.");
    } else if (inputPass !== null) {
      alert("Invalid Password!");
    }
  } else {
    isAdminLoggedIn = false;
    adminView.classList.add("hidden");
    userView.classList.remove("hidden");
    
    adminBtn.classList.replace("bg-red-600", "bg-indigo-700");
    adminBtn.classList.replace("hover:bg-red-700", "hover:bg-indigo-800");
    adminBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> <span>Admin Login</span>`;
  }
}

// 1. Notice Form Submission Logic
document.addEventListener("DOMContentLoaded", () => {
  const noticeForm = document.getElementById("notice-form");
  
  if (noticeForm) {
    noticeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById("notice-submit-btn");
      const title = document.getElementById("notice-title").value.trim();
      const desc = document.getElementById("notice-desc").value.trim();

      if (!title) {
        alert("Please enter a notice title.");
        return;
      }

      // UI Feedback: Button Loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Publishing Notice...</span>`;

      try {
        await db.collection("notices").add({
          title: title,
          description: desc,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear Form & Alert
        noticeForm.reset();
        alert("✅ Notice Published to Notice Board Successfully!");

      } catch (error) {
        console.error("Error publishing notice: ", error);
        alert("❌ Failed to publish notice! Check your Firebase Configuration or Internet Connection.");
      } finally {
        // Reset Button UI
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Publish Notice</span>`;
      }
    });
  }

  // 2. Timetable Form Submission Logic
  const timetableForm = document.getElementById("timetable-form");
  
  if (timetableForm) {
    timetableForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById("tt-submit-btn");
      const selectedClass = document.getElementById("tt-class").value;
      const details = document.getElementById("tt-details").value.trim();

      if (!details) {
        alert("Please enter subject and time details.");
        return;
      }

      // UI Feedback: Button Loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Updating Timetable...</span>`;

      try {
        await db.collection("timetable").add({
          class: selectedClass,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Clear Form & Alert
        timetableForm.reset();
        alert(`✅ Timetable Updated Successfully for ${selectedClass}!`);

      } catch (error) {
        console.error("Error updating timetable: ", error);
        alert("❌ Failed to update timetable! Check Firebase Setup.");
      } finally {
        // Reset Button UI
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> <span>Update Timetable</span>`;
      }
    });
  }
});

// Delete Function
async function deleteItem(collectionName, docId) {
  if (confirm("Are you sure you want to delete this item?")) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      alert("✅ Item Deleted Successfully!");
    } catch (error) {
      console.error("Delete Error: ", error);
      alert("❌ Failed to delete item.");
    }
  }
}
