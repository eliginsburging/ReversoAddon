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
        myWindow = window.open()
        for (i = 0; i < resultlist.length; i++) {
          console.log(resultlist[i])
          myWindow.document.write(resultlist[i] + "<br>")
        };
        myWindow.focus();
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
    var styles = 'tr:nth-child(even) {background:#CCC}'
    css.type = 'text/css';
    css.appendChild(document.createTextNode(styles));
    document.head.appendChild(css)
    // Grab all the target language sentences and put them in an array
    trarray = $(".src.ltr").map(function(){
      return $.trim($(this).text());
    });
    // Grab all the English translations and put them in an array
    enarray = $(".trg.ltr").map(function(){
      return $.trim($(this).text());
    });
    // create a new array where each element is an object with
    // target sentence as one property and english translation as another
    var i;
    var combined = [];
    for (i = 0; i < trarray.length; i++) {
      combined.push({tr: trarray[i], en: enarray[i]})
    };
    // sort combined array based on length of target sentences
    combined.sort(function (a,b){
      return a.tr.length - b.tr.length
    });
    // lay the options out sorted in table inserted at beginning of body
    // with checkboxes next to each example/translation
    var x = document.createElement("TABLE");
    x.setAttribute("id", "translationTable");
    x.setAttribute("style", "text-align:left;");
    document.body.insertBefore(x, document.body.firstChild);
    for (j = 0; j < combined.length; j++) {
      $("#translationTable").append("<tr id='row" + j + "'><td><input type='checkbox' id='accept"+j+"'></input><td>"+j+"</td><td>"+combined[j].tr+"</td><td>"+combined[j].en+"</td></tr>")
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
        alert("no examples added!")
      } else if (count === 1){
        alert(count + " example added!")
      } else {
        alert(count + " examples added!")
      }
    };
  };
}
