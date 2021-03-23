// listener for when button in popup is pressed
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
  if (response.greeting === "hello") {
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
    $("#selectButton").text("Select");
    // when button is clicked, selected examples/translations are added to array
    // table is removed, and slected examples/translations are printed in
    // plain text in place of the table for ease of copy/pasting
    selectedArray = []
    $("#selectButton").click(function(){
      selectify(combined);
    });
    function selectify (combinedlist) {
      // console.log(trlist);
      var k;
      for (k = 0; k < combinedlist.length; k++) {
        if ($("#accept"+k).is(":checked")) {
          selectedArray.push(combinedlist[k].tr+"|"+combinedlist[k].en);
        };
      };
      $("#translationTable").hide()
      $("#selectButton").hide()
      var i;
      for (i = 0; i < selectedArray.length; i++) {
        var t = document.createElement("DIV");
        t.setAttribute("style", "text-align:left")
        t.textContent += selectedArray[i];
        document.body.insertBefore(t, document.body.firstChild.nextSibling);
      };
    };
  };
});
