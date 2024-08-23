//TODO: do progress calculation
//TODO: Import Days into html textform when importing

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
    const entries = getStoredEntries();
    const tableBody = document.getElementById('table-body');
    entries.forEach((entry, index) => addRowToTable(entry, tableBody, index));
    saveEntries(entries);
}

function getStoredEntries() {
    topic = getStoredTopic();
    return topic.entries || [];
}
function getStoredDays() {
    topic = getStoredTopic();
    return topic.days;
}

function getStoredTopic() {
    topic_parsed = JSON.parse(localStorage.getItem('topic'));
    if (topic_parsed) {
        entries_parsed = topic_parsed["entries"];
        days_parsed = topic_parsed["days"];
    } else {
        today=new Date();
        entries_parsed = [];
        days_parsed = [`${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`];
    }

    return {
        entries: entries_parsed,
        days: days_parsed
    };
}

function saveDays(days) {
    topic = getStoredTopic()
    topic.days = days;
    saveTopic(topic);
}
function saveEntries(entries) {
    topic = getStoredTopic();
    topic.entries = entries;
    saveTopic(topic);
}
function saveTopic(topic) {
    localStorage.setItem('topic', JSON.stringify(topic));
    onSaveTopic(topic);
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
    const entries = getStoredEntries();
    entries.push(entry);
    saveEntries(entries);

    addRowToTable(entry, document.getElementById('table-body'), entries.length - 1);
    clearForm();
}

function addRowToTable(entries, tableBody, index) {
    const row = document.createElement('tr');
    finished = entries.pages_done >= entries.pages

    row.innerHTML = `
        <td class="editable" contenteditable="false">${entries.name}</td>
        <td><input type="checkbox" ${finished ? 'checked' : ''} class="finishedcheckbox" onclick="handleFinishedClick(this,${index})"></td>
        <td><input type="number" value="${entries.pages_done}" class="pages-done-input small-input" min="0" max="${entries.pages}" onchange="handlePagesDoneChange(this,${index})"> / ${entries.pages}</td>
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
    const entries = getStoredEntries();
    
    if (cb.checked) {
        // set pages_done == entrypages and store
        topic[index].pages_done = topic[index].pages
        saveEntries(entries);
        row.querySelector('.pages-done-input').value = entries[index].pages
    } else {
        // set pages_done == entrypages and store
        entries[index].pages_done = entries[index].pages - 1
        saveEntries(topic);
        row.querySelector('.pages-done-input').value = entries[index].pages - 1
    }
}

function handlePagesDoneChange(field, index) {
    const entries = getStoredEntries();
    entries[index].pages_done = field.value
    saveEntries(entries);
    
    const row = field.closest('tr')
    finished = entries[index].pages_done >= entries[index].pages
    row.querySelector('.finishedcheckbox').checked = finished
}

function removeEntry(index) {
    const entries = getStoredEntries();
    entries.splice(index, 1);
    saveEntries(entries);
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
    const entries = getStoredEntries();
    if (isEditing) {
        // Save the changes
        nameCell.setAttribute('contenteditable', 'false');
        button.textContent = 'Edit';

        entries[index].name = nameCell.textContent.trim();
        entries[index].pages = parseInt(pagesCell.querySelector('.pages-input').value.trim(), 10) || 0;
        saveEntries(entries);

        const abortButton = actionCell.querySelector('.abort-button');
        if (abortButton) {
            actionCell.removeChild(abortButton);
        }
        entries[index].pages_done = entries[index].pages_done > entries[index].pages? entries[index].pages : entries[index].pages_done
        pagesCell.innerHTML = `<input type="number" value="${entries[index].pages_done}" min="0" max="${entries[index].pages}" class="pages-done-input small-input" onchange="handlePagesDoneChange(this,${index})"> / ${entries[index].pages}`;
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
            pagesCell.innerHTML = `<input type="number" value="${entries[index].pages_done}" min="0" max="${entries[index].pages}" class="pages-done-input small-input"  onchange="handlePagesDoneChange(this,${index})"> / ${cachedPages}`;
            abortButton.remove();
        };
        actionCell.appendChild(abortButton);

        pagesCell.innerHTML = `${entries[index].pages_done} / <input type="number" value="${cachedPages}" class="pages-input small-input">`;
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
        //TODO: add Days to Form (Selecting Working Days)
    };
    reader.readAsText(file);
}

// Progress calculation
function onSaveTopic(topic) {
    //TODO: Filter out days before current Day
    ppd_row = document.getElementById('deadline');
    ppd_row.innerHTML = `${topic.days.length}`
}

function handleDateSelectorChange() {
    days_string = document.getElementById("working-days").value;
    days = days_string.split(",");
    saveDays(days);
}
