var fileDialog;
var saveConfirmDialog;
var savedList;
var saveForm;
var saveFile;
var overwritedFileName;
var currentPreviewList = [];

ready(function () {

    fileDialog = document.getElementById("folder");
    savedList = document.getElementById("savedList");
    saveForm = document.getElementById("saveForm");
    saveConfirmDialog = document.getElementById("saveConfirm");
    overwritedFileName = document.getElementById("overwritedFileName");

    try {
        saveFile = localStorage.getItem("savedList");
        if (saveFile != null) {
            saveFile = JSON.parse(saveFile);
            for (let i = 0; i < saveFile.list.length; i++) {
                appendToList(saveFile.list[i]);
            }
        } else {
            saveFile = {};
            saveFile.list = [];
        }
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                openFolder();
            }
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                openFolder();
            }
        });
    } catch (e) {
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
    for (let j = 0; j < savedItem.previews.length; j++) {
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

var tempItem;
var tempIndex = -1;
function saveColors(e, form) {
    let data = new FormData(form);
    e.preventDefault();
    closeFolder();
    let newItem = {};
    newItem.name = data.get("fileName");
    newItem.hash = getHash();
    newItem.previews = [...currentPreviewList];
    overwritedFileName.innerText = newItem.name;
    for (let i = 0; i < saveFile.list.length; i++) {
        if (saveFile.list[i].name === newItem.name) {
            saveConfirmDialog.showModal();
            tempItem = newItem;
            tempIndex = i;
            return;
        }
    }
    saveFile.list.push(newItem);
    localStorage.setItem("savedList", JSON.stringify(saveFile));
    appendToList(newItem);
}

function confirmOverwrite() {
    closeConfirm();
    saveFile.list[tempIndex] = tempItem;
    localStorage.setItem("savedList", JSON.stringify(saveFile));
    removeChilds(savedList);
    for (let i = 0; i < saveFile.list.length; i++) {
        appendToList(saveFile.list[i]);
    }
}

function closeConfirm() {
    saveConfirmDialog.close();
}