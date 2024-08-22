//TODO: do progress calculation
//TODO: Add deadline option (Date? Fetch current Date?)

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
    const topic = getStoredTopic();
    const tableBody = document.getElementById('table-body');
    topic.forEach((entry, index) => addRowToTable(entry, tableBody, index));
}

function getStoredTopic() {
    return JSON.parse(localStorage.getItem('topic')) || [];
}

function saveTopic(topic) {
    localStorage.setItem('topic', JSON.stringify(topic));
}

function addTopicEntry() {
    const name = document.getElementById('newEntryName').value.trim();
    const pages_done = 0;
    const pages = parseInt(document.getElementById('newPages').value, 10) || 10;

    if (!name) {
        alert("Entry name is required!");
        return;
    }

    const entry = { name, pages_done, pages };
    const topic = getStoredTopic();
    topic.push(entry);
    saveTopic(topic);

    addRowToTable(entry, document.getElementById('table-body'), topic.length - 1);
    clearForm();
}

function addRowToTable(topic, tableBody, index) {
    const row = document.createElement('tr');
    finished = topic.pages_done >= topic.pages

    row.innerHTML = `
        <td class="editable" contenteditable="false">${topic.name}</td>
        <td><input type="checkbox" ${finished ? 'checked' : ''} class="finishedcheckbox" onclick="handleFinishedClick(this,${index})"></td>
        <td><input type="number" value="${topic.pages_done}" class="pages-done-input small-input" min="0" max="${topic.pages}" onchange="handlePagesDoneChange(this,${index})"> / ${topic.pages}</td>
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
    document.getElementById('newPagesDone').value = '';
    document.getElementById('newPages').value = '';
}

function handleFinishedClick(cb, index) {
    const row = cb.closest('tr')
    const topic = getStoredTopic();
    
    if (cb.checked) {
        // set pages_done == entrypages and store
        topic[index].pages_done = topic[index].pages
        saveTopic(topic);
        row.querySelector('.pages-done-input').value = topic[index].pages
    } else {
        // set pages_done == entrypages and store
        topic[index].pages_done = topic[index].pages - 1
        saveTopic(topic);
        row.querySelector('.pages-done-input').value = topic[index].pages - 1
    }
}

function handlePagesDoneChange(field, index) {
    const topic = getStoredTopic();
    topic[index].pages_done = field.value
    saveTopic(topic);
    
    const row = field.closest('tr')
    finished = topic[index].pages_done >= topic[index].pages
    row.querySelector('.finishedcheckbox').checked = finished
}

function removeEntry(index) {
    const topic = getStoredTopic();
    topic.splice(index, 1);
    saveTopic(topic);
    refreshTable();
}

function toggleEdit(index, button) {
    const row = button.closest('tr');
    const actionCell = button.closest('td');
    const nameCell = row.querySelector('td:nth-child(1)');
    const pagesCell = row.querySelector('td:nth-child(3)');
    const isEditing = nameCell.getAttribute('contenteditable') === 'true';
    const cachedName = nameCell.textContent;
    const cachedPages = pagesCell.querySelector('.pages-input') ? pagesCell.querySelector('.pages-input').value : pagesCell.textContent.split('/')[1].trim();
    const topic = getStoredTopic();
    if (isEditing) {
        // Save the changes
        nameCell.setAttribute('contenteditable', 'false');
        button.textContent = 'Edit';

        topic[index].name = nameCell.textContent.trim();
        topic[index].pages = parseInt(pagesCell.querySelector('.pages-input').value.trim(), 10) || 0;
        saveTopic(topic);

        const abortButton = actionCell.querySelector('.abort-button');
        if (abortButton) {
            actionCell.removeChild(abortButton);
        }
        topic[index].pages_done = topic[index].pages_done > topic[index].pages? topic[index].pages : topic[index].pages_done
        pagesCell.innerHTML = `<input type="number" value="${topic[index].pages_done}" min="0" max="${topic[index].pages}" class="pages-done-input small-input" onchange="handlePagesDoneChange(this,${index})"> / ${topic[index].pages}`;
    } else {
        // Enable editing
        nameCell.setAttribute('contenteditable', 'true');
        nameCell.focus();
        button.textContent = 'Save';

        const abortButton = document.createElement("button");
        abortButton.className = 'abort-button';
        abortButton.innerHTML = 'X';
        abortButton.onclick = function() {
            nameCell.setAttribute('contenteditable', 'false');
            button.textContent = 'Edit';
            nameCell.textContent = cachedName;
            pagesCell.innerHTML = `<input type="number" value="${topic[index].pages_done}" min="0" max="${topic[index].pages}" class="pages-done-input small-input"  onchange="handlePagesDoneChange(this,${index})"> / ${cachedPages}`;
            abortButton.remove();
        };
        actionCell.appendChild(abortButton);

        pagesCell.innerHTML = `${topic[index].pages_done} / <input type="number" value="${cachedPages}" class="pages-input small-input">`;
    }
}

function refreshTable() {
    document.getElementById('table-body').innerHTML = '';
    initializeTable();
}

function exportTopic() {
    const topic = getStoredTopic();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topic));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "topic.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importTopic(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importedTopic = JSON.parse(e.target.result);
        saveTopic(importedTopic);
        refreshTable();
    };
    reader.readAsText(file);
}
