// Steps to complete:

// 1. Initialize Firebase
// 2. Create button for adding new trains - then update the html + update the database
// 3. Create a way to retrieve trains from the train database.
// 4. Create a way to calculate the time until next train. Using difference between first time and current time.
//    Then use moment.js formatting to set difference in minutes or hours and minutes.
// 5. Add a timer to update trains arrivals every minute
// 6. Add a button for deleting train records
// 7. Add the ability to edit a train record
// 8. Add the ability to login as a unique user
// 9. Add the ability for a user to save their own specific train schedule --
//10.  Make multiple users to log in with different train schedules



// Initialize Firebase
var config = {
  apiKey: "AIzaSyCCSxNqNj1GXvKzAaC7AD3TFSo1OonFGsU",
  authDomain: "duhw-3d8f1.firebaseapp.com",
  databaseURL: "https://duhw-3d8f1.firebaseio.com",
  projectId: "duhw-3d8f1",
  storageBucket: "duhw-3d8f1.appspot.com",
  messagingSenderId: "719507945949"
};
firebase.initializeApp(config);

var database = firebase.database();

const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');


// //@todo validate username and email
// // Add login event
// btnLogin.addEventListener('click', e => {
//   console.log("clicked login button");
//   //Get email and password
//   const email = txtEmail.value;
//   const pass = txtPassword.value;

//   const auth = firebase.auth();
//   // Sign In
//   const promise = auth.signInWithEmailAndPassword(email, pass);
//   promise.catch(e => console.log(e.message));
// })


// // Add login event
// btnSignUp.addEventListener('click', e => {

//   //Get email and password
//   const email = txtEmail.value;
//   const pass = txtPassword.value;

//   const auth = firebase.auth();
//   // Sign In
//   auth.createUserWithEmailAndPassword(email, pass);

//   promise.catch(e => displayMsg(e.message));
// });

// // Add logout event
// btnLogout.addEventListener('click', e => {
//   firebase.auth().signOut();
// });

// firebase.auth().onAuthStateChanged(firebaseUser => {
//   if (firebaseUser) {
//     console.log(firebaseUser);
//     btnLogout.classList.remove('invisible');
//     btnLogout.classList.add('visible');
//   } else {
//     console.log("Not logged in");
//     btnLogout.classList.remove('visible');
//     btnLogout.classList.add('invisible');
//   }
// });


//existing user
//auth.signInWithEmailAndPassword(email, pass);
//new user
//auth.creatUserWithEmailAndPasword(email, pass);
//return promises that asynchronously 
//firebaseUser if logged in
//null if logged out
//auth.onAuthStateChanged(firebaseUser => { });
function displayMsg(msg) {
  console.log("display error message");
  console.log(msg);
  //document.getElementById('msg2user').innerHTML(e.message);
  $("#msg2user").text(msg);
}

//=================================================================/

var DEBUG = false;
//Start a Timer for Updating the Time until Next Train Arrival
var interval;
var updateTimer = 60;

var trainList = [];

// 2. Button for adding Trains
//    Grab the User Input
//    Create an object with the user data
//    Push to the database
//    Clear out the input fields on the HTML page 
$("#add-train-btn").on("click", function (event) {
  event.preventDefault();

  // Grabs user input
  var trainName = $("#train-name-input").val().trim();
  var trainDestination = $("#destination-input").val().trim();
  var firstTrainTime = moment($("#first-train-time-input").val().trim(), "HH:mm").format("X");
  var trainFrequency = $("#frequency-input").val().trim();

  // Creates local "temporary" object for holding train data
  var newTrain = {
    trainName: trainName,
    trainDestination: trainDestination,
    firstTrainTime: firstTrainTime,
    trainFrequency: trainFrequency
  };

  // Uploads train data to the database
  database.ref().push(newTrain);

  // Logs everything to console
  if (DEBUG) console.log(newTrain.trainName);
  if (DEBUG) console.log(newTrain.trainDestination);
  if (DEBUG) console.log(newTrain.firstTrainTime);
  if (DEBUG) console.log(newTrain.trainFrequency);

  //@todo change to html message
  console.log("Train successfully added");

  // Clears all of the text-boxes
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-time-input").val("");
  $("#frequency-input").val("");
});


// 3. Create Firebase event for adding train to the database and a row in the html when a user adds an entry
//    Keep track of the trains in a trainList array 
database.ref().on("child_added", function (childSnapshot) {

  if (DEBUG) console.log(childSnapshot.val());

  // Store everything into a variable.
  if (DEBUG) console.log("KEY: " + childSnapshot.key);
  var trainName = childSnapshot.val().trainName;
  var trainDestination = childSnapshot.val().trainDestination;
  var firstTrainTime = childSnapshot.val().firstTrainTime;
  var trainFrequency = childSnapshot.val().trainFrequency;
  var trainKey = childSnapshot.key;

  var newTrain = {
    trainName: trainName,
    trainDestination: trainDestination,
    firstTrainTime: firstTrainTime,
    trainFrequency: trainFrequency,
    trainKey: trainKey
  };

  //Code Array of Train Objects Holding/Reflecting DB train data
  trainList.push(newTrain);

  // train Info
  if (DEBUG) console.log(trainName);
  if (DEBUG) console.log(trainDestination);
  if (DEBUG) console.log(firstTrainTime);
  if (DEBUG) console.log(trainFrequency);

  renderTrainRow(newTrain, trainList.length);

  clearInterval(interval);
  interval = setInterval(updateCountdown, 1000);
  // If any errors are experienced, log them to console.
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

// 7. Add the ability to edit a train record
//    When the user clicks this button, make fields input types
//    Update a field that indicates if the field is in edit mode
//        Use this field to prevent attempting to convert to input fields if they are already input fields
//    Toggle button to SAVE
$("#train-table").on("click", ".edit", function (event) {
  console.log($(this));
  console.log($(this).attr("data-mode"));
  if ($(this).attr("data-mode") === "edit") {
    console.log("make fields editable");
    $(this).attr("data-mode", "save");
    $(this).text("Save");

    console.log($(this).attr("data-mode"));
    //var rowElem = $(this).attr("id");
    //console.log($(this).child('#name'));
    var key = $(this).attr("data-id");
    var rowElem = $("#" + key);

    var trainNameCell = rowElem.children('td.name');
    var html = trainNameCell.html();
    var input = $('<input class="editTrainName" type="text" />');
    input.val(html);
    trainNameCell.html(input);

    var trainDestCell = rowElem.children('td.destination');
    var html = trainDestCell.html();
    var input = $('<input class="editTrainDestination" type="text" />');
    input.val(html);
    trainDestCell.html(input);

    var trainFreqCell = rowElem.children('td.frequency');
    var html = trainFreqCell.html();
    var input = $('<input class="editFrequency" type="text" />');
    input.val(html);
    trainFreqCell.html(input);
  } else {

    var key = $(this).attr("data-id");
    var rowElem = $("#" + key);

    console.log("SAVE" + key);
    //update the data
    //switch the button text back to save
    //remove the editable fields and replace with static text
    // Grabs user input
    var trainName = rowElem.children("td.name").children(".editTrainName").val().trim();
    console.log(trainName);
    rowElem.children("td.name").children(".editTrainName").remove;
    rowElem.children("td.name").text(trainName);
    var trainDestination = rowElem.children("td.destination").children(".editTrainDestination").val().trim();
    console.log(trainDestination);
    rowElem.children("td.destination").children(".editTrainDestination").remove;
    rowElem.children("td.destination").text(trainDestination);
    //var firstTrainTime = moment($(rowElem.children("td.frequency").children(".editFrequencyName").val().trim(), "HH:mm").format("X");
    //console.log(firstTrainTime);

    var trainFrequency = rowElem.children("td.frequency").children(".editFrequency").val().trim();
    rowElem.children("td.frequency").children(".editFrequency").remove;
    rowElem.children("td.frequency").text(trainFrequency);

    //update the array    
    var editedTrain = findObjectIndexByKey(trainList, 'trainKey', key);
    editedTrain.trainName = trainName;
    editedTrain.trainDestination = trainDestination;
    editedTrain.trainFrequency = trainFrequency;

    // Uploads train data to the database
    database.ref().child(key).update({ trainName: trainName, trainDestination: trainDestination, trainFrequency: trainFrequency });
    $(this).attr("data-mode", "edit");
    $(this).text("Edit");

    // Logs everything to console
    if (DEBUG) console.log(editedTrain.trainName);
    if (DEBUG) console.log(editedTrain.trainDestination);
    if (DEBUG) console.log(editedTrain.firstTrainTime);
    if (DEBUG) console.log(editedTrain.trainFrequency);

    //@todo change to html message
    console.log("Train successfully changed");

  }
});

$("#train-table").on("click", ".close", function (event) {
  if (confirm("Do you really want to delete?")) {
    var key = $(this).attr("data-id");
    if (DEBUG) console.log("delete " + key);
    database.ref(key).remove();
  }
});


//=============================================================//
// A Train is being deleted from Firebase
// Also delete the row
// As well as the object from the array
//=============================================================//
database.ref().on("child_removed", function (childSnapshot) {
  console.log("on child remove");
  console.log(childSnapshot.key);

  // Remove the row from the table
  $("#" + childSnapshot.key).remove();

  // Remove the data from the array
  var trainI = findObjectIndexByKey(trainList, 'trainKey', childSnapshot.key);
  trainList.slice(trainI, 1);
}, function (errorObject) {
  console.log("The remove failed: " + errorObject.code);
});


function findObjectIndexByKey(array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return array[i];
    }
  }
  return null;
}
function updateTrainArr() {
  console.log("update Train Arr");
  //var userId = firebase.auth().currentUser.uid;
  //console.log(userId);
  // return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
  //   var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';

  // });
}

function renderTrainSchedule() {
  $("#train-table > tbody").empty(); // empties out the html
  console.log("renderTrainSchedule");
  // render our trains to the page
  // do we need to update our  Train List array From Database
  //updateTrainArr();
  for (var i = 0; i < trainList.length; i++) {
    console.log(trainList[i]);
    renderTrainRow(trainList[i], i);
  }
}

function renderTrainRow(train, i) {
  // Prettify the train start
  var firstTrainTimePretty = moment.unix(train.firstTrainTime).format("hh:mm");

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(train.firstTrainTime, "hh:mm").subtract(1, "years");
  if (DEBUG) console.log(firstTimeConverted);

  // Current Time
  var currentTime = moment();
  if (DEBUG) console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  if (DEBUG) console.log("DIFFERENCE IN TIME: " + diffTime);
  // Time apart (remainder)
  var tRemainder = diffTime % train.trainFrequency;
  if (DEBUG) console.log(tRemainder);

  // Minute Until Train
  var tMinutesTillTrain = train.trainFrequency - tRemainder;
  if (DEBUG) console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

  // Next Train
  var nextTrain = moment().add(tMinutesTillTrain, "minutes");
  if (DEBUG) console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
  var nextArrival = moment().diff(moment(train.firstTrainTime, "X"), "months");
  if (DEBUG) console.log(nextArrival);
  console.log("renderTrainRow");
  // Create the new row
  var newRow = $("<tr id='" + train.trainKey + "'>").append(
    $("<td>").text(train.trainName).addClass("name"),
    $("<td>").text(train.trainDestination).addClass("destination"),
    $("<td>").text(train.trainFrequency).addClass('frequency'),
    $("<td>").text(moment(nextTrain).format("hh:mm")).addClass("nextTrain"),
    $("<td>").text(tMinutesTillTrain).addClass("minutesTil"),
    $("<td class='update'>").html("<button type='button' class='btn' data-id='" + train.trainKey + "' data-mode='edit' class='edit' aria-label='Edit'>Edit</button>"),
    $("<td class='delete'>").html("<button type='button' data-id='" + train.trainKey + "' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>")
  );


  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
}


function updateCountdown() {
  //var formattedNumber = ("0" + game.qtime).slice(-2);
  updateTimer--;
  //if (DEBUG) console.log("timer at work: " + updateTimer);
  if (updateTimer <= 0) {
    updateTilTimes();
  }
};

//=============================================================================//
function updateTilTimes() {
  if (DEBUG) console.log("updateTilTimes - Update Arrival Times and reset timer");
  renderTrainSchedule();
  updateTimer = 60;
  clearInterval(interval);
  interval = setInterval(updateCountdown, 1000);
}



















