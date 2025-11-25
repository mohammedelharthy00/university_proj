document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); 
  let ID = document.getElementById("id").value.trim();
  let password = document.getElementById("password").value.trim();
   let role = document.getElementById("role").value;

  if (ID && password) {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Login successful",
      showConfirmButton: false,
      timer: 1500
    }).then(() =>{

      if(role==="administrator"){
        window.location.href="admin.html";
      }
      else if (role === "student") {
        window.location.href = "student.html";
      } 
      else if (role === "staff") {
        window.location.href = "staff.html";
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter email and password!",
      footer: '<a href="#">Why do I have this issue?</a>'
    });
  }
});

const passwordInput = document.getElementById("password");
const toggle = document.getElementById("passwordToggle");

toggle.addEventListener("click", () => {
  const eyeIcon = toggle.querySelector(".eye-icon");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.add("show-password");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("show-password");
  }
});