// TODO: Add button to add an entry to a topic
// TODO: handle empty topiclist at the beginning
// TODO: Add deadline to topic
// TODO: Calculate stuff -> daily Pages
// TODO: (Add planer what to do today, tomorrow etc.)

// Load Topic Table on Startup
loadTable()
function loadTable() {
    const topic = localStorage.getItem('topic');
    const topic_parsed = topic ? JSON.parse(topic) : []
    console.log(topic)

    // Create the table
    if (topic_parsed.length > 0) {
        createTable(topic_parsed);
    }

    function createTable(topic) {
        // Create table body
        const tbody = document.getElementById("table-body")
        topic.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');

            // NAME
            const name = row['name']
            const td_name = document.createElement('td');
            td_name.contentEditable = "true"
            const text = document.createTextNode(name)
            text.addEventListener('change', function() {
                topic[rowIndex]['name'] = text
                saveTopic(topic);
            })
            td_name.appendChild(text);
            tr.appendChild(td_name);

            // Finished
            finished = row['finished']
            const td_finished = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = finished; // Assuming true/false in data
            checkbox.addEventListener('change', function() {
                topic[rowIndex]['finished'] = checkbox;
                saveTopic(topic);
            });
            td_finished.appendChild(checkbox);
            tr.appendChild(td_finished);

            //Pages
            pages = row['pages']
            const td_pages = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.value = pages || "NaN"; // Default to empty string if undefined
            input.addEventListener('change', function() {
                topic[rowIndex]['pages'] = parseInt(input.value) || NaN; // Convert to integer
                saveTopic(topic);
            });
            td_pages.appendChild(input);
            tr.appendChild(td_pages);

            tbody.appendChild(tr);
        });
    }

}

function deleteTable() {
    const tablebody = document.getElementById('table-body');
    tablebody.innerHTML = "";
} 
function refreshTable() {
    deleteTable();
    loadTable();
}

// Save settings to local storage
function addTopicEntry() {
    new_entryname = document.getElementById("new_entryname").value
    new_finished = document.getElementById("new_finished").checked
    new_pages = document.getElementById("new_pages").value
    if (new_entryname != "" && new_pages != "") {
        entry = {
            name: new_entryname,
            finished: new_finished,
            pages: new_pages
        };
        const topic = JSON.parse(localStorage.getItem('topic')) || [];
        topic.push(entry)
        localStorage.setItem('topic', JSON.stringify(topic))
        refreshTable()
    }
}

function saveTopic(topic=[
{ name: 'Kapitel 1', finished: true, pages: 10 },
{ name: 'Kapitel 2', finished: false, pages: 5 },
{ name: 'Kapitel 3', finished: false, pages: 8 }]) {

localStorage.setItem('topic', JSON.stringify(topic));
}

// Export settings as JSON
function exportTopic() {
    const topic = localStorage.getItem('topic');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topic));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "topic.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Import settings from JSON file
function importTopic(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const topic = JSON.parse(event.target.result);
        if (checkTopicFile()) {
            localStorage.setItem('topic', topic);
            refreshTable();
            alert('Topic imported');
        } else {
            alert('Invalid settings file');
        }
    };
    reader.readAsText(file);

    function checkTopicFile() {
        // TODO: Implement
        return true
    }
}
