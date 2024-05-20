var fileDialog;
var changelogDialog;
var savedList;
var saveForm;
var saveFile;
var currentPreviewList = [];

// <label>
//     <input type="radio" name="savedColor" value="#7141ff/comp/11/0/100/100.00">
//     <p>theWildSushii</p>
//     <div class="preview">
//         <div style="background-color: #7141ff;"></div>
//         <div style="background-color: #fff432;"></div>
//     </div>
//     <label>
//         <span class="material-symbols-rounded" translate="no">download</span>
//         Load colors
//         <input type="submit">
//     </label>
// </label>

ready(function () {

    fileDialog = document.getElementById("folder");
    changelogDialog = document.getElementById("changelog");
    savedList = document.getElementById("savedList");
    saveForm = document.getElementById("saveForm");

    try {
        saveFile = localStorage.getItem("savedList");
        if (saveFile != null) {
            saveFile = JSON.parse(saveFile);
            for(let i = 0; i < saveFile.list.length; i++) {
                appendToList(saveFile.list[i]);
            }
        } else {
            saveFile = {};
            saveFile.list = [];
        }
    } catch(e) {
        let folderButton = document.getElementById("folder-button");
        folderButton.style.display = "none";
    }

});

function appendToList(savedItem) {
    let item = document.createElement("label");
    let input = document.createElement("input");
    input.type = "radio";
    input.name = "savedColor";
    input.value = savedItem.hash;
    item.appendChild(input);
    let name = document.createElement("p");
    name.innerText = savedItem.name;
    item.appendChild(name);
    let preview = document.createElement("div");
    preview.classList.add("preview");
    item.appendChild(preview);
    for(let j = 0; j < savedItem.previews.length; j++) {
        let div = document.createElement("div");
        div.style.backgroundColor = (new Color(savedItem.previews[j])).display();
        preview.appendChild(div);
    }
    let submitLabel = document.createElement("label");
    submitLabel.innerHTML = '<span class="material-symbols-rounded" translate="no">download</span>Load colors<input type="submit">';
    item.appendChild(submitLabel);
    savedList.appendChild(item);
}

function openFolder() {
    fileDialog.showModal();
}

function closeFolder() {
    fileDialog.close();
}

function loadColors(e, form) {
    let data = new FormData(form);
    e.preventDefault();
    closeFolder();
    setHash(data.get("savedColor"));
}

function saveColors(e, form) {
    let data = new FormData(form);
    e.preventDefault();
    closeFolder();
    let newItem = {};
    newItem.name = data.get("fileName");
    newItem.hash = getHash();
    newItem.previews = [...currentPreviewList];
    saveFile.list.push(newItem);
    localStorage.setItem("savedList", JSON.stringify(saveFile));
    appendToList(newItem);
}