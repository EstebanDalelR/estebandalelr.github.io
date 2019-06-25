function saveFarmer() {
  var gottenFarmers = window.localStorage.getItem("farmers")
  var gottenObject = [];
  if (gottenFarmers) {
    gottenObject = JSON.parse(gottenFarmers)
  }
  var radios = (document.getElementsByName("areatype"))
  var selectedAreaType = null
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      selectedAreaType = radios[i].value;
      break;
    }
  }
  gottenObject.push({
    name: document.getElementById("name").value,
    lastName: document.getElementById("lastName").value,
    idcc: document.getElementById("idcc").value,
    peopleInCharge: document.getElementById("peopleInCharge").value,
    area: document.getElementById("area").value,
    areatype: selectedAreaType,
    product: document.getElementById("product").value
  })
  document.getElementById("savedPeopleDiv").removeChild(document.getElementById("table"));
  var newTable = document.createElement("table")
  newTable.setAttribute("id", "table");
  document.getElementById("savedPeopleDiv").appendChild(newTable)
  for (let index = 0; index < gottenObject.length; index++) {
    const element = gottenObject[index];
    var row = table.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);
    cell1.innerHTML = element.name || "--";
    cell2.innerHTML = element.lastName || "--";
    cell3.innerHTML = element.idcc || "--";
    cell4.innerHTML = element.peopleInCharge || "--";
    cell5.innerHTML = element.product || "--";
    cell6.innerHTML = element.areatype || "--";
    cell7.innerHTML = element.area || "--";
  }
  window.localStorage.setItem("farmers", JSON.stringify(gottenObject))
  changeSavedNumber(gottenObject.length);
}
function changeSavedNumber(amount) {
  document.getElementById("savedPeople").innerHTML = amount;
}