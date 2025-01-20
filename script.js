let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 페이지 로드시 저장된 할일 목록을 표시합니다
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
});

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            done: false,
            dueDate: null
        };
        
        todos.push(todo);
        saveTodos();
        renderTodos();
        input.value = '';
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.done = !todo.done;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const activeList = document.getElementById('todoList');
    const completedList = document.getElementById('completedList');
    activeList.innerHTML = '';
    completedList.innerHTML = '';
    
    todos.forEach(todo => {
        const daysRemaining = todo.dueDate ? getDaysRemaining(todo.dueDate) : null;
        const dueDateClass = daysRemaining < 0 ? 'overdue' : 
                           daysRemaining === 0 ? 'due-today' : 
                           daysRemaining <= 3 ? 'due-soon' : '';
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" 
                       ${todo.done ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})"
                       class="todo-checkbox">
                <span class="${todo.done ? 'done' : ''}" 
                      onclick="makeEditable(this, ${todo.id})"
                      data-id="${todo.id}">
                    ${todo.text}
                </span>
                ${todo.dueDate ? `
                    <div class="due-date ${dueDateClass}">
                        ${daysRemaining === 0 ? '오늘까지' :
                          daysRemaining < 0 ? `${Math.abs(daysRemaining)}일 지남` :
                          `${daysRemaining}일 남음`}
                    </div>
                ` : ''}
            </div>
            <div class="button-group">
                <button onclick="setDueDate(${todo.id})" class="date-btn">
                    ${todo.dueDate ? '날짜수정' : '날짜지정'}
                </button>
                <button onclick="editTodo(${todo.id})" class="edit-btn">수정</button>
                <button onclick="deleteTodo(${todo.id})" class="delete-btn">삭제</button>
            </div>
        `;
        
        if (todo.done) {
            completedList.appendChild(li);
        } else {
            activeList.appendChild(li);
        }
    });
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const newText = prompt('할일을 수정하세요:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            saveTodos();
            renderTodos();
        }
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

// localStorage에 todos 배열을 저장하는 함수를 추가합니다
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function makeEditable(element, id) {
    event.stopPropagation();
    
    const currentText = element.textContent.trim();
    
    element.contentEditable = true;
    element.classList.add('editing');
    
    element.onclick = null;
    
    element.focus();
    
    element.onblur = () => saveEdit(element, id);
    
    element.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            element.blur();
        }
    };
}

function saveEdit(element, id) {
    const newText = element.textContent.trim();
    const todo = todos.find(t => t.id === id);
    
    if (todo && newText !== '' && newText !== todo.text) {
        todo.text = newText;
        saveTodos();
    }
    
    element.contentEditable = false;
    element.classList.remove('editing');
    
    element.onclick = () => makeEditable(element, id);
    
    renderTodos();
}

function setDueDate(id) {
    const dateSelector = document.getElementById('dateSelector');
    const todo = todos.find(t => t.id === id);
    
    if (todo) {
        dateSelector.value = todo.dueDate || new Date().toISOString().split('T')[0];
        
        const handleDateChange = function() {
            if (isValidDate(this.value)) {
                todo.dueDate = this.value;
                saveTodos();
                renderTodos();
                dateSelector.removeEventListener('change', handleDateChange);
            }
        };
        
        dateSelector.addEventListener('change', handleDateChange);
        
        dateSelector.showPicker();
    }
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function getDaysRemaining(dueDate) {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
} 