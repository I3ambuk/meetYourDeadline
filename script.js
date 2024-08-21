// TODO: Add button to add an entry to a topic
// TODO: handle empty topiclist at the beginning
// TODO: Add deadline to topic
// TODO: Calculate stuff -> daily Pages
// TODO: (Add planer what to do today, tomorrow etc.)

document.addEventListener("DOMContentLoaded", () => {
    initializeTable();
    document.getElementById('addEntryButton').addEventListener('click', addTopicEntry);
    document.getElementById('exportButton').addEventListener('click', exportTopic);
    document.getElementById('fileInput').addEventListener('change', importTopic);
    document.getElementById('fileButton').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', importTopic);
});

function initializeTable() {
    const topics = getStoredTopics();
    const tableBody = document.getElementById('table-body');
    topics.forEach((topic, index) => addRowToTable(topic, tableBody, index));
}

function getStoredTopics() {
    return JSON.parse(localStorage.getItem('topics')) || [];
}

function addTopicEntry() {
    const name = document.getElementById('newEntryName').value.trim();
    const finished = document.getElementById('newFinished').checked;
    const pages = parseInt(document.getElementById('newPages').value, 10) || 0;

    if (!name) {
        alert("Entry name is required!");
        return;
    }

    const topic = { name, finished, pages };
    const topics = getStoredTopics();
    topics.push(topic);
    saveTopics(topics)

    addRowToTable(topic, document.getElementById('table-body'), topics.length - 1);
    clearForm();
}

function addRowToTable(topic, tableBody, index) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${topic.name}</td>
        <td><input type="checkbox" ${topic.finished ? 'checked' : ''} onchange="toggleFinished(${index})"></td>
        <td>${topic.pages}</td>
        <td><button class="remove-button" onclick="removeEntry(${index})">-</button></td>
    `;

    tableBody.appendChild(row);
}
function toggleFinished(index) {
    const topics = getStoredTopics();
    topics[index].finished = !topics[index].finished;
    saveTopics(topics);
}
function saveTopics(topics) {
    localStorage.setItem('topics', JSON.stringify(topics));
}
function removeEntry(index) {
    const topics = getStoredTopics();
    topics.splice(index, 1);
    saveTopics(topics);
    refreshTable();
}
function refreshTable() {
    document.getElementById('table-body').innerHTML = '';
    initializeTable();
}

function clearForm() {
    document.getElementById('newEntryName').value = '';
    document.getElementById('newFinished').checked = false;
    document.getElementById('newPages').value = '';
}

function exportTopic() {
    const topics = getStoredTopics();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topics));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "topics.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importTopic(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importedTopics = JSON.parse(e.target.result);
        saveTopics(importedTopics)
        document.getElementById('table-body').innerHTML = '';
        initializeTable();
    };
    reader.readAsText(file);
}
