var fileDialog;
var changelogDialog;

ready(function () {

    fileDialog = document.getElementById("folder");

});

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