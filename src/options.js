// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  localStorage["api_key"] = document.getElementById("api_key").value;
  localStorage["reportID"] = document.getElementById("reportID").value;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Data saved";
  setTimeout(function() {
	status.innerHTML = "";
  }, 1000);
  
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var api_key = localStorage["api_key"];
  var reportID = localStorage["reportID"];
  if (api_key) {
    document.getElementById("api_key").value = api_key;
  }
  if (reportID) {
		document.getElementById("reportID").value = reportID;
  }

}

function reset_options() {
  localStorage["api_key"] = '';
  document.getElementById("api_key").value = '';
  localStorage["reportID"] = '';
  document.getElementById("reportID").value = '';

}


document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#reset').addEventListener('click', reset_options);