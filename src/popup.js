var recordcache = [];
if (localStorage["recordcache"]) {
	var recordcache = JSON.parse(localStorage["recordcache"]);
}
if (!(localStorage["api_key"])) {
	window.close();
	chrome.tabs.create({'url': chrome.extension.getURL('options.html')});
}
var app = {
  kaboom: function() {
  //TODO Tabs: reports, due today, watchlist
	var records = document.getElementById("records");
	var search = document.getElementById("search");

	displayAll();
	document.querySelector('#search').addEventListener("keydown", keyDown);

}	
};

function displayAll() {
		records.innerHTML = '';
		for (var i = 0; i < recordcache.length; i++) {
			//console.log('Adding ID: ' + recordcache[i] + ' ' + i);
			var li = getTicket(recordcache[i],i);
			if (li==false) { 
				deleteCell(i);
				console.log('Deleting ' + i)};
		}
}
function getChangeReport(reportID) {
	var req = new XMLHttpRequest();
			req.open('GET', 'https://api.gotoassist.com/desk/external_api/v1/changes.json?report_id='+reportID+'&limit=100', false);
			req.setRequestHeader("Authorization", "Basic " + Base64.encode('x:'+localStorage["api_key"]));
			req.setRequestHeader('Content-Type', 'application/json');
			req.send(null);
	return (req.responseText);
}

function keyDown(e) {
		var keyCode = e.keyCode;
		if (keyCode==13) {
			//TODO add array
			//localStorage["recordcache"] = search.value;
			if ($.isArray(recordcache)) {
				recordcache.push(search.value);
				localStorage["recordcache"] = JSON.stringify(recordcache);
			}
			displayAll();
			search.value = '';
		} if (keyCode==9) {
				search.value = '';
				recordcache.splice( $.inArray(search.value, recordcache), 1 );		
				localStorage["recordcache"] = JSON.stringify(recordcache);
				displayAll()
		}
	}
	
	


function getTicket(ticketID,i) {
	// Determine if the ticket is an Incident or Change
	// TODO: add the rest of the ticket types (Release, etc)
	var response = getJSON('https://api.gotoassist.com/desk/external_api/v1/incidents/'+ticketID+'.json');
	if (response.status == 'Success') {
		showIncident(response,i);
		} else { 
			var response = getJSON('https://api.gotoassist.com/desk/external_api/v1/changes/'+ticketID+'.json');
				if (response.status == 'Success') {
					showChange(response,i);
				} else {
					alertbox('#'+ticketID+ ' is not a valid ticket ID');
					return false;
					}	
			} 
}

function showIncident(response,i) {
		//console.log(response)
		var response = response.result.incident;
		var latestnote = latestNote(response.latest_note);
		var id = response.id;
		var service = response.service.name;
		var assFname = response.assigned_user.first_name;
		var assLname = response.assigned_user.last_name;
		var title = response.title;
		var closed = response.closed_at;
		if (closed) { var closed = 'Closed' } else { closed = 'Open'}
		var li = document.createElement('li');
			li.innerHTML = 'Service: '+service+' <br>Assigned To: '+assFname+' '+assLname;
			li.id = i;
			//li.className = closed;
		var titlebar = document.createElement('li');
			titlebar.className = closed;
			titlebar.innerHTML = 'IN#'+id+' <b>'+title+'</b><span class="right">'+closed+'</span>';
			titlebar.id = 'cdl'+id;
			titlebar.addEventListener('click', 
				function(event) {
					chrome.tabs.create({'url': 'https://desk.gotoassist.com/a/edo/'+id});
			},true);
		var closebutton = document.createElement('a');
			closebutton.href = '#';
			closebutton.className = 'right';
			closebutton.innerHTML = '<img src="inc/closed.png">';
			closebutton.id = 'cl'+id;
			closebutton.addEventListener('click', 
				function(event) {
					recordcache.splice(i, 1);
					localStorage["recordcache"] = JSON.stringify(recordcache);
					displayAll();
			},true);
		li.appendChild(closebutton);
		li.insertBefore(titlebar,li.firstChild);
		records.insertBefore(li);
		console.log(latestnote);
}

// TODO: Add Latest Note function
function latestNote(obj) {
var info = []
	if (typeof(obj.Resolution) != "undefined") {
			info.push(obj.Resolution.note);
			info.push('duece');
		} else if (typeof(obj.Comment) != "undefined") {
				info.push(obj.Comment.note)
				} else if (typeof(obj.Symptom) != "undefined") {
						info.push(obj.Symptom.note)
				} else { info.push('Nada') }
return info;
}
function deleteCell(i) {
	recordcache.splice(i, 1);
	localStorage["recordcache"] = JSON.stringify(recordcache);
}
function showChange(response,i) {
		var id = response.result.change.id;
		var service = response.result.change.service.name;
		var assFname = response.result.change.assigned_user.first_name;
		var assLname = response.result.change.assigned_user.last_name;
		var title = response.result.change.title;
		var approved = response.result.change.approved_at;
		if (approved) { var approved = 'Approved' } else { approved = 'Not approved'}
		var closed = response.result.change.closed_at;
		if (closed) { var closed = 'Closed' } else { closed = 'Open'}
		var li = document.createElement('li');
			li.innerHTML = 'Service: '+service+' <br>Assigned To: '+assFname+' '+assLname+'<br>Status: '+approved;
			li.id = i;
		var titlebar = document.createElement('li');
			titlebar.className = closed;
			titlebar.innerHTML = 'CH#'+id+' <b>'+title+'</b><span class="right">'+closed+'</span>';
			titlebar.id = 'cdl'+id;
			titlebar.addEventListener('click', 
				function(event) {
					chrome.tabs.create({'url': 'https://desk.gotoassist.com/a/edo/'+id});
			},true);
		var closebutton = document.createElement('a');
			closebutton.href = '#';
			closebutton.className = 'right';
			closebutton.innerHTML = '<img src="inc/closed.png">';
			closebutton.id = 'cl'+id;
			closebutton.addEventListener('click', 
				function(event) {
					recordcache.splice(i, 1);
					localStorage["recordcache"] = JSON.stringify(recordcache);
					displayAll();
			},true);
		li.appendChild(closebutton);
		li.insertBefore(titlebar,li.firstChild);
		records.insertBefore(li);

}						

function getJSON(url) {
	var req = new XMLHttpRequest();
				req.open('GET', url, false); 
				req.setRequestHeader("Authorization", "Basic " + Base64.encode('x:'+localStorage["api_key"]));
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(null);
	//console.log(req.responseText);
	return JSON.parse(req.responseText);
}
function alertbox(message){
	var alert = document.getElementById("alert");
	alert.style.display = 'block';
	alert.innerHTML = message;
	setTimeout(function() {
	alert.innerHTML = "";
	alert.style.display = 'none';
	}, 5000);
	

	
}

function openTab(href) {
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('f.html')}, function(tab) {
    // Tab opened.
  });
});
}
// function getReports() {
  // // TODO Add report function
	// // start report
	// var obj = JSON.parse(getChangeReport(localStorage["reportID"]));
	// var changes = obj.result.changes
	// var message = '';
	// for (i=0; i < changes.length; i++) {
    // var id = changes[i].id;
    // var service = changes[i].service.name;
    // var desc = changes[i].descriptions[0].description.note;
    // var assFname = changes[i].assigned_user.first_name;
    // var assLname = changes[i].assigned_user.last_name;
    // var title = changes[i].title;
    // var message = message+'<li>#'+id+' <a href="https://desk.gotoassist.com/a/edo/'+id+'">'+title+'</a> <br> '+assFname+' '+assLname+': '+desc+' </li>';
	// }	
	// records.innerHTML = message;
	// // end report
	
	// }
	
	
document.addEventListener('DOMContentLoaded', function () {
  app.kaboom();
});


