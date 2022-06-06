URL = window.URL || window.webkitURL;
var c = 0;
var t;
var timer_is_on = 0;
var gumStream;
var rec;
var input;
var globalBlob;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var filename;
var token;
var mylang;

var recordButton = document.getElementById("recordButton");
var displayContent = document.getElementById("displayContent");
var audioLink = document.getElementById("audioLink");
var Transilate = document.getElementById('Transilate');
var transilatedAudio = document.getElementById('transilatedAudio');
var backbtn = document.getElementById('Backbtn');
var Logo = document.getElementById('logo');

// //websocket.connect('ws://0.0.0.0:8000/api/v1/stt/ws')
// const socket = io("ws://mbaza.dev.cndp.org.rw/deepspeech/api/v1/stt/ws");
// //api/v1/stt/mic
// socket.on('connect', function () {
// 	console.log('socket connected? .... ', socket.connected);
// });


Transilate.addEventListener("click", transilate);

recordButton.addEventListener("click", startRecording);

backbtn.addEventListener("click", restartRecording);

Logo.addEventListener("click", clickLogo);

let el = $('.switch');
let cur = el.find('.current');
let options = el.find('.options li');
let content = $('#view');

loadingPage();
getLang();

transilatedAudio.style.visibility = "hidden";
displayContent.style.visibility = "hidden";
$("#recordButton").addClass("btn-primary");
$("#recordButton").removeClass("btn-danger");
mylang = cur.find('span').text();
//console.log("1 : " + mylang);
mybtnrecord = (mylang.toLowerCase() == "en") ? "<span data-lang='en'>Record</span>" : "<span data-lang='kiny'>Fata ijwi</span>";
$("#recordButton").html(mybtnrecord);

function clickLogo() {
	window.location.reload();
}


function startRecording() {
	displayContent.style.visibility = "hidden";
	transilatedAudio.style.visibility = "hidden";
	if ($("#recordButton").hasClass('btn-danger')) {
		stopRecording();
	} else {
		c = 0;
		timer_is_on = 0;
		var constraints = { audio: true, video: false };
		navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
			//console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
			$("#recordButton").removeClass("btn-primary");
			$("#recordButton").addClass("btn-danger");
			mylang = cur.find('span').text();
			//console.log("2 : " + mylang);
			mybtnrecord = (mylang.toLowerCase() == "en") ? "<span data-lang='en'>Finish</span>" : "<span data-lang='kiny'>Rangiza</span>";
			$("#recordButton").html(mybtnrecord);
			audioContext = new AudioContext();
			startCount();
			gumStream = stream;
			input = audioContext.createMediaStreamSource(stream);
			rec = new Recorder(input, { numChannels: 1 });
			rec.record();
			console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
			console.log(rec.exportWAV(function (b) {
				console.log(b);
			}));
			console.log("Recording started");
		}).catch(function (err) {
			displayContent.style.visibility = "hidden";
			$("#recordButton").addClass("btn-primary");
			$("#recordButton").removeClass("btn-danger");
			mylang = cur.find('span').text();
			//console.log("3 : " + mylang);
			mybtnrecord = (mylang.toLowerCase() == "en") ? "<span data-lang='en'>Record</span>" : "<span data-lang='kiny'>Fata ijwi</span>";
			$("#recordButton").html(mybtnrecord);
		});
	}
}

function stopRecording() {
	displayContent.style.visibility = "visible";
	stopCount();
	rec.stop();
	gumStream.getAudioTracks()[0].stop();
	rec.exportWAV(createDownloadLink);
	$("#recordButton").addClass("btn-primary");
	$("#recordButton").removeClass("btn-danger");
	mylang = cur.find('span').text();
	//console.log("4 : " + mylang);
	mybtnrecord = (mylang.toLowerCase() == "en") ? "<span data-lang='en'>Record</span>" : "<span data-lang='kiny'>Fata ijwi</span>";
	$("#recordButton").html(mybtnrecord);
}

function createDownloadLink(blob) {
	console.log("oooooooooooooooooooooooooooooooooooooooooooooooo");
	console.log(blob);
	globalBlob = blob;
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	filename = new Date().toISOString();
	au.controls = true;
	au.src = url;
	audioLink.href = url;
	audioLink.download = filename + ".wav ";
	mylang = cur.find('span').text();
	//console.log("5 : " + mylang);
	audioLink.innerHTML = (mylang.toLowerCase() == "en") ? "Listen to your recording" : "umviriza ijwi ryawe";
	$("#recordedArea").html(au);
}

function timedCount() {
	mylang = cur.find('span').text();
	//console.log("6 : " + mylang);
	var mymessage = (mylang.toLowerCase() == "en") ? "Format: 1 channel pcm @ " : "Imiterere: umuyoboro 1 pcm @";
	if (audioContext) {
		$("#formats").html(mymessage + audioContext.sampleRate / 1000 + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	} else {
		$("#formats").html(mymessage + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	}

	c = c + 1;
	t = setTimeout(timedCount, 1000);
}

function startCount() {
	if (!timer_is_on) {
		timer_is_on = 1;
		timedCount();
	}
}

function stopCount() {
	clearTimeout(t);
	timer_is_on = 0;
}

function transilate() {
	transilatedAudio.style.visibility = "visible";
	var img = document.createElement('img');
	img.src = './images/Ellipsis-9.1s-200px.gif';
	$('#responseText').html(img);
	var formData = new FormData();
	formData.append("audio", globalBlob, filename);
	$.ajax({
		url: 'https://mbaza.dev.cndp.org.rw/deepspeech/api/api/v1/stt/http',
		type: 'post',
		headers: {
			"Authorization": "Bearer " + token
		},
		data: formData,
		contentType: false,
		processData: false,
		success: function (response) {
			if (response.message) {
				document.getElementById("responseText").innerHTML = response.message;
			} else {
				mylang = cur.find('span').text();
				//console.log("7 : " + mylang);
				myopsmessage = (mylang.toLowerCase() == "en") ? "Ops! we can't translate that." : "Mwihangane! ntidushobora kubisobanura.";
				document.getElementById("responseText").innerHTML = myopsmessage;
			}
		},
	});
}

function restartRecording() {
	c = 0;
	transilatedAudio.style.visibility = "hidden";
	displayContent.style.visibility = "hidden";
	$("#recordButton").addClass("btn-primary");
	$("#recordButton").removeClass("btn-danger");
	mylang = cur.find('span').text();
	//console.log("8 : " + mylang);
	mybtnrecord = (mylang.toLowerCase() == "en") ? "<span data-lang='en'>Record</span>" : "<span data-lang='kiny'>Fata ijwi</span>";
	$("#recordButton").html(mybtnrecord);
	//console.log("9 : " + mylang);
	var mymessage = (mylang.toLowerCase() == "en") ? "Format: 1 channel pcm @ " : "Imiterere: umuyoboro 1 pcm @";
	if (audioContext) {
		$("#formats").html(mymessage + audioContext.sampleRate / 1000 + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	} else {
		$("#formats").html(mymessage + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	}
}

function loadingPage() {
	$.ajax({
		url: 'https://mbaza.dev.cndp.org.rw/deepspeech/api/token',
		type: 'post',
		data: JSON.stringify({
			username: "digitalumuganda",
			password: "fXzLtna5Ten37g3Q"
		}),
		processData: false,
		success: function (response) {
			//console.log(response);
			token = response.access_token;
			setTimeout(function () {
				$("div.spanner").removeClass("show");
				$("div.overlay").removeClass("show");
			}, 3000);

		},
	});
}

// Open language dropdown panel

el.on('click', function (e) {
	el.addClass('show-options');

	setTimeout(function () {
		el.addClass('anim-options');
	}, 50);

	setTimeout(function () {
		el.addClass('show-shadow');
	}, 200);
});


// Close language dropdown panel

options.on('click', function (e) {
	e.stopPropagation();
	el.removeClass('anim-options');
	el.removeClass('show-shadow');

	let newLang = $(this).data('lang');

	cur.find('span').text(newLang);
	content.attr('class', newLang);

	setLang(newLang);

	options.removeClass('selected');
	$(this).addClass('selected');

	setTimeout(function () {
		el.removeClass('show-options');
	}, 600);

});


// Save selected options into Local Storage

function getLang() {
	let lang;
	if (localStorage.getItem('currentLang') === null) {
		lang = cur.find('span').text();
	} else {
		lang = JSON.parse(localStorage.getItem('currentLang')).toLowerCase();
	}

	// console.log(lang);

	cur.find('span').text(lang);
	options.parent().find(`li[data-lang="${lang}"]`).addClass('selected');

	content.attr('class', lang);
	mylang = lang.toLowerCase();
}

getLang();

function setLang(newLang) {
	localStorage.setItem('currentLang', JSON.stringify(newLang).toLowerCase());

	content.attr('class', newLang.toLowerCase());

	var mybtnrecord = (newLang.toLowerCase() == "en") ? "<span data-lang='en'>Record</span>" : "<span data-lang='kiny'>Fata ijwi</span>";
	$("#recordButton").html(mybtnrecord);
	audioLink.innerHTML = (newLang.toLowerCase() == "en") ? "Listen to your recording" : "umviriza ijwi ryawe";


	var mymessage = (newLang.toLowerCase() == "en") ? "Format: 1 channel pcm @ " : "Imiterere: umuyoboro 1 pcm @";
	if (audioContext) {
		$("#formats").html(mymessage + audioContext.sampleRate / 1000 + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	} else {
		$("#formats").html(mymessage + "kHz | <span class='badge badge-pill badge-light'>" + c + "</span>");
	}


	var myopsmessage = (newLang.toLowerCase() == "en") ? "Ops! we can't translate that." : "Mwihangane! ntidushobora kubisobanura.";
	document.getElementById("responseText").innerHTML = myopsmessage;

	// console.log('New language is: ' + newLang);
}
