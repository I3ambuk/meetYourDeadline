document.addEventListener("DOMContentLoaded", () => {
    initializeTable();
    document.getElementById('addEntryButton').addEventListener('click', addTopicEntry);
    document.getElementById('exportButton').addEventListener('click', exportTopic);
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

function saveTopics(topics) {
    localStorage.setItem('topics', JSON.stringify(topics));
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
    saveTopics(topics);

    addRowToTable(topic, document.getElementById('table-body'), topics.length - 1);
    clearForm();
}

function addRowToTable(topic, tableBody, index) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td class="editable" contenteditable="false">${topic.name}</td>
        <td><input type="checkbox" ${topic.finished ? 'checked' : ''} onchange="toggleFinished(${index})"></td>
        <td class="editable" contenteditable="false">${topic.pages}</td>
        <td class="actions-cell">
            <button class="edit-button" onclick="toggleEdit(${index}, this)">Edit</button>
            <button class="remove-button" onclick="removeEntry(${index})">-</button>
        </td>
    `;

    tableBody.appendChild(row);
}

function clearForm() {
    document.getElementById('newEntryName').value = '';
    document.getElementById('newFinished').checked = false;
    document.getElementById('newPages').value = '';
}

function toggleFinished(index) {
    const topics = getStoredTopics();
    topics[index].finished = !topics[index].finished;
    saveTopics(topics);
}

function removeEntry(index) {
    const topics = getStoredTopics();
    topics.splice(index, 1);
    saveTopics(topics);
    refreshTable();
}

function toggleEdit(index, button) {
    const row = button.closest('tr');
    const nameCell = row.querySelector('td:nth-child(1)');
    const pagesCell = row.querySelector('td:nth-child(3)');

    const isEditing = nameCell.getAttribute('contenteditable') === 'true';

    if (isEditing) {
        // Save the changes
        nameCell.setAttribute('contenteditable', 'false');
        pagesCell.setAttribute('contenteditable', 'false');
        button.textContent = 'Edit';

        const topics = getStoredTopics();
        topics[index].name = nameCell.textContent.trim();
        topics[index].pages = parseInt(pagesCell.textContent.trim(), 10) || 0;
        saveTopics(topics);
    } else {
        // Enable editing
        nameCell.setAttribute('contenteditable', 'true');
        pagesCell.setAttribute('contenteditable', 'true');
        nameCell.focus();
        button.textContent = 'Save';
        // Restrict input to numbers in the Pages field
        pagesCell.addEventListener('input', restrictToNumbers);
    }
}
function restrictToNumbers(event) {
    const input = event.target.textContent;
    if (!/^\d*$/.test(input)) {
        event.target.textContent = input.replace(/\D/g, '');
    }
}

function refreshTable() {
    document.getElementById('table-body').innerHTML = '';
    initializeTable();
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
        saveTopics(importedTopics);
        refreshTable();
    };
    reader.readAsText(file);
}
