$(document).ready(function(){
  $("#extractPage").click(function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
           console.log(response);
       });
    });
  });
});
$(document).ready(function(){
  $("#clearExamples").click(function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {greeting: "clear"}, function(response) {
           console.log(response);
       });
    });
  });
});
$(document).ready(function(){
  $("#showExamples").click(function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {greeting: "show"}, function(response) {
           console.log(response);
       });
    });
  });
});
