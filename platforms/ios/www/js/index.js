/* activate localStorage */
var localStore = window.localStorage;

/* surveyQuestion Model (This time, written in "JSON" format to interface more cleanly with Mustache) */
/* This is used to input the questions you would like to ask in your experience sampling questionnaire*/
var surveyQuestions = [
                       /*number each question in this variable starting from 0, so it is easy to reference question items when setting up question logic*/
                       /*0*/
                       /*snooze question, where selecting "No" snoozes the app for a predetermined amount of time*/
                       /*this is a multiple choice question*/
                       {
                       "type":"mult1",
                       "variableName": "snooze",
                       "questionPrompt": "Are you able to take the survey now?",
                       "minResponse": 0,
                       "maxResponse": 1,
                       "labels": [
                                {"label": "No"},
                                {"label": "Yes"}
                                ],
                       },
                        /*1*/
                       {
                       "type": "instructions",
                       "variableName": "generalInstructions",
                       "questionPrompt": "On the following screens, we will be asking you 5 questions about your mood since we last notified you.",
                       },
                        /*2*/
                        /*this is what a "mult1" for a regular rating scale with only positive values (including 0) looks like*/                       
                       {
                       "type":"mult1",
                       "variableName": "pleasureDimension",
                       "questionPrompt": "Please indicate how you feel right now.",
                       "minResponse": -2,
                       "maxResponse": 2,
                       "labels": [
                                {"label": "Very Displeased"},
                                {"label": "Displeased"},
                                {"label": "Neutral"},
                                {"label": "Pleased"},
                                {"label": "Very Pleased"},
                                ]
                       },
                        /*3*/
                        /*this is what a "mult1" for a regular rating scale with only positive values (including 0) looks like*/                       
                       {
                       "type":"mult1",
                       "variableName": "arousalDimension",
                       "questionPrompt": "Please indicate how you feel right now.",
                       "minResponse": -2,
                       "maxResponse": 2,
                       "labels": [
                                {"label": "Very Inactive"},
                                {"label": "Inactive"},
                                {"label": "Neutral"},
                                {"label": "Active"},
                                {"label": "Very Active"},
                                ]
                       },
                       /*4*/
                       /*a "slider" item using a sliding rating scale. It only needs your question prompt and the minimum and
                       maximum values of your sliding scale. ExperienceSampler will set the default value to be the midpoint*/
                       {
                       "type":"slider",
                       "variableName": "pleasureDimensionSlider",
                       "questionPrompt": "How are you feeling?",
                       "minResponse": 0,
                       "maxResponse": 100,
                       "rightLable": "Alert",
                       "leftLable": "Sleepy",
                       
                       },                                            
                       /*5*/
                       /*a "slider" item using a sliding rating scale. It only needs your question prompt and the minimum and
                       maximum values of your sliding scale. ExperienceSampler will set the default value to be the midpoint*/
                       {
                       "type":"slider",
                       "variableName": "arousalDimensionSlider",
                       "questionPrompt": "How are you feeling?",
                       "minResponse": 0,
                       "maxResponse": 100,
                       "rightLable": "Positive",
                       "leftLable": "Negative",
                       
                       },
                       /*5*/
                       /*a "slider" item using a sliding rating scale. It only needs your question prompt and the minimum and
                       maximum values of your sliding scale. ExperienceSampler will set the default value to be the midpoint*/
                       {
                       "type":"slider",
                       "variableName": "stressSlider",
                       "questionPrompt": "Please rate your stress level at this moment?",
                       "minResponse": 0,
                       "maxResponse": 100,
                       "rightLable": "Not Stressed",
                       "leftLable": "Very Stressed",
                       },

];

/*These are the messages that are displayed at the end of the questionnaire*/
var lastPage = [
                /*0*/
                /*input your last-page message*/
                {
                "message": "Thank you for completing today’s questions. Please wait while the data is sent to our servers..."
                },
                /*1*/
                /*input snooze last-page message*/
                {
                "message": "That's cool! I'll notify you again in 20 minutes!"
                },
                ];

/*Questions to set up participant notifications so that notifications are customized to participant's schedule*/ 
var participantSetup = [
                        {
                        "type": "text",
                        "variableName": "participant_id",
                        "questionPrompt": "Please enter your participant ID:"
                        },
                        {
                    	"type": "timePicker",
                        "variableName": "weekdayWakeTime",
                        "questionPrompt": "Please select the time that you usually wake up:"
                        },
                        {
                    	"type": "timePicker",
                        "variableName": "weekdayDinnerTime",
                        "questionPrompt": "Please select the time that you usually have dinner:"
                        },
                        //{
                        //"type": "timePicker",
                        //"variableName": "weekendWakeTime",
                        //"questionPrompt": "Please select the time that you usually wake up on WEEKENDS:"
                        //},
                        //{
                        //"type": "timePicker",
                        //"variableName": "weekendDinnerTime",
                        //"questionPrompt": "Please select the time that you usually have dinner on WEEKENDS:"
                        //},
                        ];

/*Populate the view with data from surveyQuestion model*/
// Making mustache templates
// This line determines the number of questions in your participant setup
var NUMSETUPQS = participantSetup.length;

// This line tells ExperienceSampler which question in surveyQuestions is the snooze question
// If you choose not to use the snooze option, just comment it out
var SNOOZEQ = 0;

// This section of code creates the templates for all the question formats
var questionTmpl = "<p>{{{questionText}}}</p><ul>{{{buttons}}}</ul>";
var questionTextTmpl = "{{questionPrompt}}";
var buttonTmpl = "<li><button id='{{id}}' value='{{value}}'>{{label}}</button></li>";
var textTmpl = "<li><textarea cols=50 rows=5 id='{{id}}'></textarea></li><li><button type='submit' value='Enter'>Enter</button></li>";
var checkListTmpl =  "<li><input type='checkbox' id='{{id}}' value='{{value}}'>{{label}}</input></li>";
var instructionTmpl = "<li><button id='{{id}}' value = 'Next'>Next</button></li>";
var sliderTmpl = ('<li><input type="range" min="{{min}}" max="{{max}}" value="{{value}}" orient=horizontal'
                  + 'id="{{id}}" oninput="outputUpdate(value)"></input><script>function outputUpdate(slidervalue)'
                  + '{document.querySelector("#slider").value=slidervalue;}</script></li>'
                  + '<div class="label-container"><div class="label">{{leftLable}}</div><div class="label">{{rightLable}}</div></div>'
                  + '<li><button type="submit" value="Enter">Enter</button></li>');
var datePickerTmpl = '<li><input id="{{id}}" data-format="DD-MM-YYYY" data-template="D MMM YYYY" name="date"><br /><br /></li><li><button type="submit" value="Enter">Enter</button></li><script>$(function(){$("input").combodate({firstItem: "name",minYear:2015, maxYear:2016});});</script>';
var dateAndTimePickerTmpl = '<li><input id="{{id}}" data-format="DD-MM-YYYY-HH-mm" data-template="D MMM YYYY  HH:mm" name="datetime24"><br /><br /></li><li><button type="submit" value="Enter">Enter</button></li><script>$(function(){$("input").combodate({firstItem: "name",minYear:2015, maxYear:2016});});</script>';
var timePickerTmpl = '<li><input id="{{id}}" data-format="HH:mm" data-template="HH : mm" name="time"><br /><br /></li><li><button type="submit" value="Enter">Enter</button></li><script>$(function(){$("input").combodate({firstItem: "name"});});</script>';
var lastPageTmpl = "<h3>{{message}}</h3>";

// This line generates the unique key variable. You will not assign the value here, because you want it the value to change
// with each new questionnaire
var uniqueKey;

//If you need to declare any other global variables (i.e., variables to be used in more than one function of ExperienceSampler)
//you should declare them here. 
//For example, you might declare your piped text variable or your question branch response variable
//var name /*sample piped text variable*/
var name;

var app = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},

    // Bind Event Listeners
bindEvents: function() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    document.addEventListener("resume", this.onResume, false);
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("receivedLocalNotification", onReceivedLocalNotification, false);
},

//these functions tell the app what to do at different stages of running
onDeviceReady: function() {
    app.init();
},

onResume: function() {app.sampleParticipant();},

onPause: function() {app.pauseEvents();},

//Beginning our app functions
/* The first function is used to specify how the app should display the various questions. You should note which questions 
should be displayed using which formats before customizing this function*/
renderQuestion: function(question_index) {
    //First load the correct question from the JSON database
    var question;
    if (question_index <= -1) {question = participantSetup[question_index + NUMSETUPQS];}
    else {question = surveyQuestions[question_index];}
    
    //If you want to include piped text in your question wording, you would implement it in this section. 
    //Below is an example of how you would look for the NAME placeholder in your surveyQuestion questionPrompts 
    //and replace it with the response value that you assign to the name variable
    var questionPrompt = question.questionPrompt;
    
	if (questionPrompt.indexOf('NAME') >= 0) {
		questionPrompt = questionPrompt.replace("NAME", function replacer() {return name;});
      	}
    question.questionText = Mustache.render(questionTextTmpl, {questionPrompt: questionPrompt});
    
    //Now populate the view for this question, depending on what the question type is
    //This part of the function will render different question formats depending on the type specified
    switch (question.type) {
    	case 'mult1': // Rating scales (i.e., small numbers at the top of the screen and larger numbers at the bottom of the screen).
    		question.buttons = "";
        	var label_count = 0;
        	for (var i = question.minResponse; i <= question.maxResponse; i++) {
            	var label = question.labels[label_count++].label;
                
            	question.buttons += Mustache.render(buttonTmpl, {
                                                id: question.variableName+i,
                                                value: i,
                                                label: label
                                                });
        	}
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	$("#question ul li button").click(function(){
        		app.recordResponse(this, question_index, question.type);
        	});
        	break;
        
        case 'mult2': // Rating scales (i.e., positive numbers at the top of the screen and negative numbers at the bottom of the screen).
    		question.buttons = "";
            var label_count = 0;
            for (var j = question.maxResponse; j >= question.minResponse; j--) {
                var label = question.labels[label_count++].label;
                question.buttons += Mustache.render(buttonTmpl, {
                                                    id: question.variableName+j,
                                                    value: j,
                                                    label: label
                                                    });
            }
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	$("#question ul li button").click(function(){
        		app.recordResponse(this, question_index, question.type);
        	});
        	break;
        
        case 'checklist':
        	question.buttons = "";
        	var label_count = 0;
        	var checkboxArray = [];
        	for (var i = question.minResponse; i <= question.maxResponse; i++) {
            	var label = question.labels[label_count++].label;
            	question.buttons += Mustache.render(checkListTmpl, {
                                                	id: question.variableName+i,
                                                	value: i,
                                                	label: label
                                                	});
        	}
        	question.buttons += "<li><button type='submit' value='Enter'>Enter</button></li>";
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	$("#question ul li button").click( function(){
                                          checkboxArray.push(question.variableName);
                                          $.each($("input[type=checkbox]:checked"), function(){checkboxArray.push($(this).val());});
                                          app.recordResponse(String(checkboxArray), question_index, question.type);
            });
            break;
        
        case 'slider':
            var leftLable = question.leftLable;
            var rightLable = question.rightLable;
        	question.buttons = Mustache.render(sliderTmpl, {
                                              id: question.variableName+"1",
                                              rightLable: question.rightLable,
                                              leftLable: question.leftLable,
                                              },
                                              {min: question.minResponse}, {max: question.maxResponse}, {value: (question.maxResponse)/2});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	var slider = [];
        	$("#question ul li button").click(function(){
        			slider.push(question.variableName);
        			slider.push($("input[type=range]").val());
        			app.recordResponse(String(slider), question_index, question.type);
        	});
        	break;
        
        case 'instructions':
        	question.buttons = Mustache.render(instructionTmpl, {id: question.variableName+"1"});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	var instruction = [];
        	$("#question ul li button").click(function(){ 
        		instruction.push(question.variableName);
        		instruction.push($(this).val());
        		app.recordResponse(String(instruction), question_index, question.type);
        	});
        	break;
        
        case 'text': //default to open-ended text
        	 question.buttons = Mustache.render(textTmpl, {id: question.variableName+"1"});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	$("#question ul li button").click(function(){
				if (app.validateResponse($("textarea"))){
        		 	app.recordResponse($("textarea"), question_index, question.type);
                } 
                else {
                    alert("Please enter something.");
                }
            });
            break;
        
        case 'datePicker':
        	question.buttons = Mustache.render(datePickerTmpl, {id: question.variableName+"1"});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	var date, dateSplit, variableName = [], dateArray = [];
        	$("#question ul li button").click(function(){
        		date = $("input").combodate('getValue');
        		dateArray.push(question.variableName);
        		dateArray.push(date);
        		app.recordResponse(String(dateArray), question_index, question.type);
        	});
        	break;
        
        case 'dateAndTimePicker':
        	question.buttons = Mustache.render(dateAndTimePickerTmpl, {id: question.variableName+"1"});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	var date, dateSplit, variableName = [], dateArray = [];
        	$("#question ul li button").click(function(){
        		date = $("input").combodate('getValue');
        		dateArray.push(question.variableName);
        		dateArray.push(date);
        		app.recordResponse(String(dateArray), question_index, question.type);
        	});
        	break;
        
        case 'timePicker':
        	question.buttons = Mustache.render(timePickerTmpl, {id: question.variableName+"1"});
        	$("#question").html(Mustache.render(questionTmpl, question)).fadeIn(400);
        	var time, timeSplit, variableName = [], timeArray = [];
        	$("#question ul li button").click(function(){
        		time = $("input").combodate('getValue');
        		timeArray.push(question.variableName);
        		timeArray.push(time);
        		app.recordResponse(String(timeArray), question_index, question.type);
        	});
        	break;	        		                 
        }
},

renderLastPage: function(pageData, question_index) {
    $("#question").html(Mustache.render(lastPageTmpl, pageData));
    //This section should be implemented if you choose to use a snooze feature
    if ( question_index == SNOOZEQ ) {
        app.snoozeNotif();
        localStore.snoozed = 1;
        app.saveData();        
    }
    else if ( question_index == -1) {
    	app.saveDataLastPage();
    }
    //This part of the code says that if the participant has completed the entire questionnaire,
    //the app should create a completed tag for it.
    //This tag will be used to count the number of completed questionnaires participants have completed
    //at the end of each day
    //The time stamp created here will also be used to create an end time for your restructured data
    else {
    	var datestamp = new Date();
    	var year = datestamp.getFullYear(), month = datestamp.getMonth(), day=datestamp.getDate(), hours=datestamp.getHours(), minutes=datestamp.getMinutes(), seconds=datestamp.getSeconds();
    	localStore[uniqueKey + '.' + "completed" + "_" + "completedSurvey"  + "_" + year + "_" + (month+1) + "_" + day + "_" + hours + "_" + minutes + "_" + seconds] = 1;	
    	app.saveDataLastPage();
    }
},

    /* Initialize the whole thing */
init: function() {
    //First, we assign a value to the unique key when we initialize the app
    uniqueKey = new Date().getTime();
    //The statement below states that if there is no participant id or if the participant id is left blank,
	//ExperienceSampler would present the participant set up questions
    if (localStore.participant_id === " " || !localStore.participant_id) {app.renderQuestion(-NUMSETUPQS);}
    //otherwise the app should just save the unique key and display the first question in survey questions  
    else {
    	uniqueKey = new Date().getTime();
        localStore.uniqueKey = uniqueKey;
        app.renderQuestion(0);
    }
    localStore.snoozed = 0;
},

    /* Record User Responses */
recordResponse: function(button, count, type) {
    //Record date (create new date object)
    
    var datestamp = new Date();
    var year = datestamp.getFullYear(), month = datestamp.getMonth(), day=datestamp.getDate(), hours=datestamp.getHours(), minutes=datestamp.getMinutes(), seconds=datestamp.getSeconds();
    
    //Record value of text field
    var response, currentQuestion, uniqueRecord;
    if (type == 'text') {
        response = button.val();
        // remove newlines from user input
        response = response.replace(/(\r\n|\n|\r)/g, ""); //encodeURIComponent(); decodeURIComponent()
        currentQuestion = button.attr('id').slice(0,-1);
    }
    else if (type == 'slider') {
    	response = button.split(/,(.+)/)[1];
        currentQuestion = button.split(",",1);
    }
    
    //Record the array
    else if (type == 'checklist') {
        response = button.split(/,(.+)/)[1];
        currentQuestion = button.split(",",1);
    }
    else if (type == 'instructions') {
    	response = button.split(/,(.+)/)[1];
        currentQuestion = button.split(",",1);
    }
    
    //Record value of clicked button
    else if (type == 'mult1') {
        response = button.value;
        //Create a unique identifier for this response
        currentQuestion = button.id.slice(0,-1);
    }
    
    //Record value of clicked button
    else if (type == 'mult2') {
        response = button.value;
        //Create a unique identifier for this response
        currentQuestion = button.id.slice(0,-1);
    }
    else if (type == 'datePicker') {
		response = button.split(/,(.+)/)[1];
     	currentQuestion = button.split(",",1);
    }
    else if (type == 'dateAndTimePicker') {
		response = button.split(/,(.+)/)[1];
     	currentQuestion = button.split(",",1);
    }
    else if (type == 'timePicker') {
		response = button.split(/,(.+)/)[1];
     	currentQuestion = button.split(",",1);
    }
    
	//if you have piped text, you would assign your response variable here
	//where X is the question index number of the question you ask for response you would like to pipe
	//In this example, we just use name to consist with our earlier variables
    if (count == 6) {name = response;}
    
    if (count <= -1) {uniqueRecord = currentQuestion;}
    else {uniqueRecord = uniqueKey + "_" + currentQuestion + "_" + year + "_" + (month+1) + "_" + day + "_" + hours + "_" + minutes + "_" + seconds;}
   
    //Save this to local storage
    localStore[uniqueRecord] = response;
    
    //Identify the next question to populate the view
    //This is where you do the Question Logic
    //if (count <= -1) {console.log(uniqueRecord);} NOT NEEED?
    
	//The line below states that if the app is on the last question of participant setup, it should schedule all the notifications
	//then display the default end of survey message, and then record which notifications have been scheduled.
   	if (count == -1) {app.scheduleNotifs(); app.renderLastPage(lastPage[0], count);} //Changed to 0
    
 	//This statement says that if the participant says they are currently unable to complete the questionnaire now,
 	//the app will display the snooze end of survey message.
    else if (count == SNOOZEQ && response == 0) {app.renderLastPage(lastPage[1], count);}
    
    //else if (count == 5 && response == 0) {app.renderLastPage(lastPage[0], count);}
    //else if (count == 5 && response == 1) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(6);});}
    //else if (count == 7 && response == 0) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(9);});}
    //else if (count == 7 && response == 1) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(8);});}
    //else if (count == 10 && response < 11) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(12);});}
    //else if (count == 10 && response == 11) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(11);});}
    //else if (count == 13 && response == 0) {app.renderLastPage(lastPage[0], count);}
    //else if (count == 13 && response == 1) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(14);});}
    //else if (count == 16 && response == 0) {app.renderLastPage(lastPage[0], count);}
    //else if (count == 16 && response == 1) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(14);});}
    
    //The app will just proceed to the next question in the JSON database
    else if (count < surveyQuestions.length-1) {$("#question").fadeOut(400, function () {$("#question").html("");app.renderQuestion(count+1);});}
    
    else {app.renderLastPage(lastPage[0], count);}
},
    /* Prepare for Resume and Store Data */
    /* Time stamps the current moment to determine how to resume */
pauseEvents: function() {
    localStore.pause_time = new Date().getTime();
    app.saveData();
}, 

    
sampleParticipant: function() {
    var current_moment = new Date();
    var current_time = current_moment.getTime();
    //change X to the amount of time the participant is locked out of the app for in milliseconds
    //e.g., if you want to lock the participant out of the app for 10 minutes, replace X with 600000
    if ((current_time - localStore.pause_time) > 600000 || localStore.snoozed == 1) {
        uniqueKey = new Date().getTime();
        localStore.snoozed = 0;
        app.renderQuestion(0);
    }
    else {
        uniqueKey = localStore.uniqueKey;
    }
    app.saveData();
},

saveData:function() {
    $.ajax({
           type: 'post',
           url: 'http://159.203.248.207:3000/ajax',
           data: localStore,
           crossDomain: true,
           success: function (result) {
           var pid = localStore.participant_id, snoozed = localStore.snoozed, 
           uniqueKey = localStore.uniqueKey, pause_time = localStore.pause_time;
           localStore.clear();
           localStore.participant_id = pid;
           localStore.snoozed = snoozed;
           localStore.uniqueKey = uniqueKey;
           localStore.pause_time = pause_time;
           },
           error: function (request, error) {console.log(error);
           //ADDED ERROR MESSAGE
            $("#question").html("<h3>Please try resending data. If problems persist, please contact the researchers.</h3><br><button>Resend data</button>");
            $("#question button").click(function () {app.saveDataLastPage();}); 
           },
           });
},
saveDataLastPage:function() {
    $.ajax({
           type: 'post',
           url: 'http://159.203.248.207:3000/ajax',
           data: localStore,
           crossDomain: true,
           success: function (result) {	
           		var pid = localStore.participant_id, snoozed = localStore.snoozed, uniqueKey = localStore.uniqueKey;
           		localStore.clear();
            	localStore.participant_id = pid;
           		localStore.snoozed = snoozed;
           		localStore.uniqueKey = uniqueKey;
           		$("#question").html("<h3>Your responses have been recorded. Thank you for completing this survey. You can close the application now.</h3>");
           },
           error: function (request, error) {console.log(error);
                $("#question").html("<h3>Please try resending data. If problems persist, please contact the researchers.</h3><br><button>Resend data</button>");
                $("#question button").click(function () {app.saveDataLastPage();});           		
           	},
           });
},

//Code for a interval-contingent design where all participants answer the questionnaire at the same time
//(i.e., not customized to their schedule) is available

// This code is for signal-contingent designs with varying time intervals between notifications
// BUG APPLICATION MUST BE CLOSED TO CLICK ON NOTIFICATION
scheduleNotifs:function() {
	//cordova.plugins.backgroundMode.enable();
    //Section 1 - Declaring necessary variables
    var notifs=[];
    //Declares the number of intervals between the notifications for each day (i.e., if beeping participants 6 times, declare 6 intervals)
   	var interval1, interval2, interval3, interval4//, interval5, interval6, interval7
    
	//Declares a variable to represent the id of each notification for the day
 	//Declare as many letters as you have intervals (i.e., 6 intervals, declare 6 ids)
   	var a, b, c, d, e, f, g;
    
	//Declare a variable to represent new date to be calculated for each beep
	//That is, if there are 6 intervals, declare 6 new dates
   	var date1, date2, date3, date4, date5, date6, date7;
    
 	//The statement below declares the start and end time of the daily data collection period
 	//These variables are not necessary if the start and end time of the daily data collection period do not vary across the experience
	//sampling data collection period
   	var currentMaxHour, currentMaxMinutes, currentMinHour, currenMinMinutes, nextMinHour, nextMinMinutes;
   	
 	//The next variables represent the amount of time between the end of the data collection to the start of the next one (nightlyLag), 
	//the interval between the scheduling time and the start of the first data collection period (currentLag), the maximum amount of time
 	//in the data collection period (maxInterval), and the time between until the end of the next data collection period (in our case 
	//dinner time; dinnerInterval)
    var currentLag, dinnerLag, maxInterval;
    
    //Then you can declare any values that you might use more than once such as the number of milliseconds in a day
    var day = 86400000;
   	var minDiaryLag = 5400000;
   	var randomDiaryLag = 1800000;
    
    //These represents the participants time values CHANGE TO FIXED
	var weekendDinnerTime = localStore.weekdayDinnerTime.split(":");//localStore.weekendDinnerTime.split(":");
	var weekendWakeTime = localStore.weekdayWakeTime.split(":");//localStore.weekendWakeTime.split(":");
	var weekdayDinnerTime = localStore.weekdayDinnerTime.split(":");
	var weekdayWakeTime = localStore.weekdayWakeTime.split(":");
    
    //The next three lines create variables for the present time when the notifications are being scheduled
	var dateObject = new Date();
    var now = dateObject.getTime(); 
    var dayOfWeek = dateObject.getDay(), currentHour = dateObject.getHours(), currentMinute = dateObject.getMinutes();
   	
 	//This is a loop that repeats this block of codes for the number of days there are in the experience sampling period
 	//Replace X with the number of days in the experience sampling period (e.g., collecting data for 7 days, replace X with 7)
 	//Note that iOS apps can only have 64 unique notifications, so you should keep that in mind if you are collecting data 
 	//for more than longer periods of time
    for (i = 0; i < 14; i ++) {
        //The code below (up to "else { nightlyLag = ...}" is only necessary if you allow the daily data collection period to vary across 
 		//weekdays and weekends
   		var alarmDay = dayOfWeek + 1 + i; 
   			if (alarmDay > 6) {alarmDay = alarmDay - 7;}
            //enter time weekendDinnerTime hour and then enter weekendDinnerTime minute
   			if (alarmDay == 0 || alarmDay == 6) {
   				currentMaxHour = weekendDinnerTime[0];
   				currentMaxMinutes = weekendDinnerTime[1];
   				currentMinHour = weekendWakeTime[0];
   				currenMinMinutes = weekendWakeTime[1];
   				if (alarmDay == 0) {
   					nextMinHour = weekdayWakeTime[0];
   					nextMinMinutes = weekdayWakeTime[1];
   				}
   				else {
   					nextMinHour = weekendWakeTime[0];
   					nextMinMinutes = weekendWakeTime[1];
   				}
   				currentLag = (((((24 - parseInt(currentHour) + parseInt(weekendWakeTime[0]))*60) - parseInt(currentMinute) + parseInt(weekendWakeTime[1]))*60)*1000);
				
   			}
   			else {
   				currentMaxHour = weekdayDinnerTime[0];
   				currentMaxMinutes = weekdayDinnerTime[1];
   				currentMinHour = weekdayWakeTime[0];
   				currenMinMinutes = weekdayWakeTime[1];   				
   				if (alarmDay == 5) {
   					nextMinHour = weekendWakeTime[0];
   					nextMinMinutes = weekendWakeTime[1];
   				}
   				else {
   					nextMinHour = weekdayWakeTime[0];
   					nextMinMinutes = weekdayWakeTime[1];   				
   				}
                currentLag = (((((24 - parseInt(currentHour) + parseInt(weekdayWakeTime[0]))*60) - parseInt(currentMinute) + parseInt(weekdayWakeTime[1]))*60)*1000);
   			}
   			if (alarmDay == 5 || alarmDay == 0) {nightlyLag = currentLag;}
   			else {
            	nightlyLag= (((((24 - parseInt(currentHour) + parseInt(nextMinHour))*60) - parseInt(currentMinute) + parseInt(nextMinMinutes))*60)*1000);
   			}
            
            //The maxInterval is the number of milliseconds between wakeup time and dinner time
   			maxInterval = (((((parseInt(currentMaxHour) - parseInt(currentMinHour))*60) + parseInt(currentMaxMinutes) - parseInt(currenMinMinutes))*60)*1000);
   			
 			//This part of the code calculates how much time there should be between the questionnaires
 			//Change X to the minimum amount of time that should elapse between beeps in seconds
 			//Change Y to the amount of additional time in seconds that should elapse to reach the maximum amount of time
 			//The part of the code that accompanies Y randomly generates a number that allows for notifications to occur randomly between X and X+Y after the previous beep
 			//That is, X + Y = maximum amount of time that can elapse between beeps

            //If designing an interval-based design, delete "Math.round(Math.random()*Y)+" and replace X with the amount of time in seconds between each beep
            interval1 = parseInt(currentLag) + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag)) + day*i;
   			interval2 = interval1 + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag));
   			interval3 = interval2 + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag));
   			interval4 = interval3 + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag));
   			//interval5 = interval4 + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag));
   			//interval6 = interval5 + (parseInt(Math.round(Math.random()*randomDiaryLag)+minDiaryLag));
   			
            //NEEDED?
            dinnerInterval = parseInt(currentLag) + parseInt(maxInterval) + day*i;
   			
            //This part of the code calculates a unique ID for each notification 
   			a = 101+(parseInt(i)*100);
            b = 102+(parseInt(i)*100);
            c = 103+(parseInt(i)*100);
            d = 104+(parseInt(i)*100);
            //e = 105+(parseInt(i)*100);
            //f = 106+(parseInt(i)*100);
            
            //This part of the code calculates the time when the notification should be sent by adding the time interval to the current date and time  
        	date1 = new Date(now + interval1);
        	date2 = new Date(now + interval2);
        	date3 = new Date(now + interval3);
        	date4 = new Date(now + interval4);
        	//date5 = new Date(now + interval5);
        	//date6 = new Date(now + interval6);
        	
            //This part of the code schedules the notifications            
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: a, at: date1, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: b, at: date2, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: c, at: date3, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: d, at: date4, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: e, at: date5, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	//cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: f, at: date6, text: 'Time for your next Mood Report!', title: 'Mood Survey'}); 

            //This part of the code records when the notifications are scheduled for and sends it to the server
        	localStore['notification_' + i + '_1'] = localStore.participant_id + "_" + a + "_" + date1;
        	localStore['notification_' + i + '_2'] = localStore.participant_id + "_" + b + "_" + date2;
        	localStore['notification_' + i + '_3'] = localStore.participant_id + "_" + c + "_" + date3;
        	localStore['notification_' + i + '_4'] = localStore.participant_id + "_" + d + "_" + date4;
        	//localStore['notification_' + i + '_5'] = localStore.participant_id + "_" + e + "_" + date5;
        	//localStore['notification_' + i + '_6'] = localStore.participant_id + "_" + f + "_" + date6;
            
            notifs.push({id: a, at: date1, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	notifs.push({id: b, at: date2, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	notifs.push({id: c, at: date3, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        	notifs.push({id: d, at: date4, text: 'Time for your next Mood Report!', title: 'Mood Survey'});
        
        	}
            cordova.plugins.notification.local.schedule(notifs);
},

//snoozeNotif function to test the snooze scheduling notification function
//Replace X with the number of seconds you want the app to snooze for (e.g., 10 minutes is 600 seconds)
//You can also customize the Title of the message, the snooze message that appears in the notification
snoozeNotif:function() {
    var now = new Date().getTime(), snoozeDate = new Date(now + 1200*1000);
    var id = '99';
    cordova.plugins.notification.local.schedule({
                                         icon: 'ic_launcher',
                                         id: id,
                                         title: 'Mood Survey',
                                         text: 'Please complete survey now!',
                                         at: snoozeDate,
                                         });
  //console.log(snoozeDate);                                       
},

//This function forces participants to respond to an open-ended question if they have left it blank
validateResponse: function(data){
        var text = data.val();
//         console.log(text);
        if (text === ""){
        	return false;
        } else { 
        	return true;
        }
    },      
};