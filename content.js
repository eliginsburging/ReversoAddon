// listener for when button in popup is pressed

chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
  if (response.greeting === "hello") {
    runExtension()
  };
  if (response.greeting === "clear") {
    var c = confirm('Are you sure you want to clear the examples?')
    if (c == true){
      chrome.storage.local.remove(["examples"]),function(){
        console.log("clearing storage")
      }
    };
  };
  /*because retrieving examples from chrome storage is asynchronous,
  we need to use a Promise object to wait for the results. Otherwise
  the browser will try to write to the new window before the stored
  examples have been retrieved, and it will think there is nothing
  to write.*/
  if (response.greeting === "show") {
    selectedArray = []
    let p = new Promise((resolve, reject) =>{
      chrome.storage.local.get(['examples'], function(result){
        console.log(result.examples)
        if (result.examples === undefined){
          alert("No examples to display!")
          reject([])
        } else {
          resolve(result.examples);
        }
      });
    });
    p.then((resultlist) => {
      if (resultlist.length < 1) {
        alert("No examples to display!")
      } else {
        $('body').empty();
        $('body').css('text-align', 'left');
        $('body').append(
          "<p>For information on importing these examples to Anki or Quizlet, visit:</p>" +
          "<ul><li><a href='https://docs.ankiweb.net/importing.html'>https://docs.ankiweb.net/importing.html</a></li>" +
          "<li><a href='https://help.quizlet.com/hc/en-us/articles/360029977151-Creating-sets-by-importing-content'>https://help.quizlet.com/hc/en-us/articles/360029977151-Creating-sets-by-importing-content</a></li></ul><br><br>" +
          "<textarea id='exampletext'></textarea>")
        for (i = 0; i < resultlist.length; i++) {
          // console.log(resultlist[i])
          $('#exampletext').append(resultlist[i] + "\n");
        };
        $("#exampletext").attr("rows",resultlist.length);
        $("#exampletext").css({"width":"100%", "border":"2px solid black", "padding":"2px", "margin":"2px"})
        $('body').append(
          "<br>" +
          "<button id='copytext'>Copy Examples</button>" + "<br>" +
          "<button id='refresh'>Back to Search</button>"
        )
        $("#copytext, #refresh").css({"border":"2px solid blue", "padding":"2px", "margin":"2px", "background":"#00ffb7"})
        function copyExamples() {
          $("#exampletext").select();
          document.execCommand("copy");
          alert("Examples copied to clipboard!")
        }
        $("#copytext").click(function() {
          copyExamples();
        });
        $("#refresh").click(function() {
          location.reload();
        })
      };
    });
  };
});

/*The extRun variable will ensure that the extract funciton cannot be run again
if the user has run the extension but not selected examples*/
extRun = false;
$(document).ready(function(){
  extRun = false;
})

$(document).keydown(function(e){
  if (e.which === 77 && e.ctrlKey){
    runExtension()
  };
});

function runExtension(){
  if (extRun === false){
    // style table so alternating rows are shaded
    var css = document.createElement("STYLE");
    var styles = 'tr:nth-child(even) {background:#CCC} table {width:100%;table-layout:fixed;} .thirty {width:32%}'
    css.type = 'text/css';
    css.appendChild(document.createTextNode(styles));
    document.head.appendChild(css)
    // Grab all the target language sentences and put them in an array
    var url = window.location.href;
    var classtargetstr = ""
    var classtargetsen = ""
    if (url.indexOf('arabic-english') >= 0 || url.indexOf('hebrew-english') >= 0){
      classtargetstr = ".src.rtl"
      classtargetsen = ".trg.ltr"
    } else if (url.indexOf('english-arabic') >= 0 || url.indexOf('english-hebrew') >= 0) {
      classtargetstr = ".src.ltr"
      classtargetsen = ".trg.rtl"
    } else {
      classtargetstr = ".src.ltr"
      classtargetsen = ".trg.ltr"
    }
    var srctargetstr = ".more-context"
    // Grab all the sentences in the target language and put them in an array
    trarray = $(classtargetstr).map(function(){
      return $.trim($(this).text());
    });
    // Grab all the English translations and put them in an array
    enarray = $(classtargetsen).map(function(){
      return $.trim($(this).text());
    });
    // grab all the source links and put them in an array
    srcarray = $(srctargetstr).map(function(){
      return $.trim($(this).attr('title'));
    });
    // create a new array where each element is an object with
    // target sentence as one property, english translation as another, and
    // an indication of the source is a third
    var i;
    var combined = [];
    // regexp to capture source url (captures substring between parentheses)
    var regExp = /\(([^()]*)\)/g;
    for (i = 0; i < trarray.length; i++) {
      combined.push({tr: trarray[i], en: enarray[i], src: srcarray[i]})
    };
    // sort combined array based on length of target sentences
    combined.sort(function (a,b){
      return a.tr.length - b.tr.length
    });
    if (combined.length === 0){
      alert("No examples detected on this page.")
      return false
    }
    // lay the options out sorted in table inserted at beginning of body
    // with checkboxes next to each example/translation
    // sources appear as titles for the table row, which will appear on hover
    var x = document.createElement("TABLE");
    x.setAttribute("id", "translationTable");
    x.setAttribute("style", "text-align:left;");
    document.body.insertBefore(x, document.body.firstChild);
    //add table headers
    $("#translationTable").append("<tr><th></th><th>#</th><th class='thirty'>Sentence</th><th class='thirty'>Translation</th><th class='thirty'>source</th></tr>")
    //add table rows where each row contains a checkbox, a sentence, the translation of that sentence, and the source of the sentence
    for (j = 0; j < combined.length; j++) {
      var urlshortened = combined[j].src.split('(').pop().slice(0,-1).slice(0,75)
      if (urlshortened.length > 74) {
        urlshortened = urlshortened+"..."
      }
      $("#translationTable").append("<tr id='row" + j + "' title='"+combined[j].src+"'><td><input type='checkbox' id='accept"+j+"'></input><td>"+j+"</td><td"+">"+combined[j].tr+"</td><td>"+combined[j].en+"</td><td>"+urlshortened+"</td></tr>")
    };
    //add some space after the table
    var b = document.createElement("DIV");
    var c = document.createElement("BR");
    b.appendChild(c)
    document.body.insertBefore(b, document.body.firstChild.nextSibling);
    // add a button to click once sentences are selected
    var btn = document.createElement("BUTTON");
    btn.setAttribute("id", "selectButton");
    btn.setAttribute("style", "border:2px solid black")
    document.body.insertBefore(btn, document.body.firstChild.nextSibling);
    //automatically scroll to top of page where the table has been inserted.
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    extRun = true;
    $("#selectButton").text("Select");
    // when button is clicked, selected examples/translations are added to array
    // table is removed, and slected examples/translations are printed in
    // plain text in place of the table for ease of copy/pasting
    console.log("trying to get data")
    selectedArray = []
    chrome.storage.local.get(['examples'], function(result){
      // console.log(result.examples)
      if (result.examples === undefined){
        selectedArray = []
      } else {
        selectedArray = result.examples;
      }
    });
    $("#selectButton").click(function(){
      selectify(combined);
    });
    function selectify (combinedlist) {
      var k;
      var count = 0;
      for (k = 0; k < combinedlist.length; k++) {
        if ($("#accept"+k).is(":checked")) {
          count += 1
          selectedArray.push(combinedlist[k].tr+"|"+combinedlist[k].en);
        };
      };
      $("#translationTable").hide()
      $("#selectButton").hide()
      extRun = false;
      console.log(selectedArray)
      chrome.storage.local.set({"examples": selectedArray}, function(){
        console.log("attempting to store data")
      })
      if (count === 0) {
        alert("No examples added!")
      } else if (count === 1){
        alert(count + " example added!")
      } else {
        alert(count + " examples added!")
      }
    };
  };
}
