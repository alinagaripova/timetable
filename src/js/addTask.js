import Http from "./http.js";
import {DataStorage} from "./lib.js";
import {LocalStorage} from "./storage.js";
import {Link} from "./lib.js";
import Render from "./renderTimetable.js";
import {ConnectAccount} from "./connectAccount.js";
import {ServerLink} from "./serverLink.js";
import {RenderTags} from "./renderTagList.js";
import {RenderTaskList} from "./renderTaskList.js";

export function addTask() {
    const serverLink = new ServerLink();
    const http = new Http(serverLink.link);
    const renderTagList = new RenderTags();
    const connectAccount = new ConnectAccount();
    const renderTaskList = new RenderTaskList();
// const authForSync = new WebSocket("ws://timetable-eeenkeeei.herokuapp.com/updateData");
// const syncWithServer = new WebSocket("ws://timetable-eeenkeeei.herokuapp.com/sync");

    const storage = new DataStorage(new LocalStorage());
    const renderClass = new Render();

    let user;
    (async function updateUser() {
        if (storage.getUserData === null) {
            document.location.href = 'index.html'
        } else {
            await connectAccount.getData();
            user = await connectAccount.user;
            renderTaskList.renderTasks(user);
            usernameBarEl.textContent = user.username;
        }
    })();

    const usernameBarEl = document.querySelector('#usernameBar');
    usernameBarEl.textContent = storage.getUserData.data.username;
    let selectedTags = []; // массив для хранения выбранных тегов, обнуляется при каждом сабмите или отмене

    let innerHTML = `
<div class="fadeIn wow animated" data-animation="true">
                    <form id="addLessonForm">
                        <div class="container">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                    <label id="inputNameLabel" class="h6">Выберите теги:</label>
                                    
                                       <div class="account-label h6" style="cursor: pointer" id="tagsInner"></div>
                                       <!--INNER ДЛЯ СПИСКА ДОСТУПНЫХ ТЕГОВ-->
                                    
                                </div>
                                
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">

                                    <label id="inputNameLabel">Название заметки</label>
                                    <input type="text" class="form-control form-control-sm shadow-sm" id="taskName"
                                           placeholder="Название заметки" autofocus="autofocus">
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                    <label>Примечание</label>
                                    <input type="text" class="form-control form-control-sm shadow-sm" id="taskNote" placeholder="Примечание">
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="margin-top: 0.5rem">
                                    <label id="inputNameLabel" class="h6">Выбранные теги: </label>
                                       <div class="account-label h6" style="cursor: pointer" id="selectedTagsInner"></div>
                                       <!--INNER ДЛЯ ВЫБРАННЫХ ТЕГОВ-->
                                        </div>
                                </div>
                                <button type="submit" class="btn btn-outline-success shadow addTagFormButton" id="addTaskButton"><strong>Добавить</strong></button>
                                <button type="button" class="btn btn-outline-danger shadow addTagFormButton" id="cancelAddButton">Отмена</button>
                        </div>
                    </form>
                </div>
`;

    const msgEl = document.querySelector('#msgEl');
    msgEl.innerHTML = '';

    const addDivFormEl = document.querySelector('#addDivForm');
    const addTaskButtonEl = document.querySelector('#addTaskButton');
    addTaskButtonEl.addEventListener('click', () => {
        const serviceMsgEl = document.createElement('label');
        serviceMsgEl.innerHTML = '';
        renderClass.editLessonFlag = false;
        addDivFormEl.innerHTML = '';
        addDivFormEl.innerHTML = innerHTML;
        renderTagsForTracker(user);
        const addLessonFormEl = document.querySelector('#addLessonForm');

        const cancelAddButton = document.querySelector('#cancelAddButton');
        cancelAddButton.addEventListener('click', () => {
            const animatedDivEl = document.querySelector('[data-animation=true]');
            animatedDivEl.className = 'fadeOut wow animated';
            selectedTags = [];
            setTimeout(() => {
                addLessonFormEl.innerHTML = '';
            }, 900);
        });

        addLessonFormEl.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            msgEl.innerHTML = `
    <div class="spinner-border text-info" role="status">
    <span class="sr-only">Loading...</span>
    </div>
    `;
            const taskNameEl = document.querySelector('#taskName');
            const taskName = taskNameEl.value;
            const taskNoteEl = document.querySelector('#taskNote');
            const taskNote = taskNoteEl.value;
            const taskObjectToSend = {
                taskName: taskName,
                taskNote: taskNote,
                tags: selectedTags,
                done: false
            };
            user.tasks.push(taskObjectToSend);
            console.log(user.tasks);
            selectedTags = [];
            let timetableUpdate = await http.timetableUpdate(user);
            let _resultUpdateFlag = '';
            await timetableUpdate.json().then(async (data) => {
                _resultUpdateFlag = data;
                await console.log(data);
                renderTaskList.renderTasks(user);

            });

            if (_resultUpdateFlag === 'Timetable Updated') {
                addDivFormEl.className = 'account-label h6 fadeOut wow animated';
                setTimeout(() => {
                    addDivFormEl.innerHTML = '';
                    addDivFormEl.className = 'account-label h6';
                }, 800);
                msgEl.innerHTML = '';
                msgEl.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show shadow-sm" id="errorEl" role="alert">
                <strong>Заметка добавлена</strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            `;
            }

        })
    });

    function renderTagsForTracker(user) {
        const serviceMsgEl = document.createElement('label');
        serviceMsgEl.innerHTML = '';
        const tagsInnerEl = document.querySelector('#tagsInner');
        let tags = user.noteTags;
        tagsInnerEl.innerHTML = '';
        tags.forEach(({tagText, tagClass}) => {
            const tagItem = document.createElement('span');
            tagItem.innerHTML = `
                                        <label class="badge badge-${tagClass} text-uppercase" style=" font-size: 1rem; cursor: pointer">
                                           ${tagText}
                                        </label>
                                        
            `;
            tagsInnerEl.appendChild(tagItem);
            const addTagListener = () =>{
                const addedTag = {
                    tagText: tagText,
                    tagClass: tagClass
                };
                console.log(addedTag);
                console.log(selectedTags);
                for (const selectedTag of selectedTags) {
                    if (selectedTag.tagText === addedTag.tagText && selectedTag.tagClass === addedTag.tagClass){
                        return;
                    }
                }
                selectedTags.push(addedTag);
                renderAddedTags(selectedTags);
            };
            tagItem.addEventListener('click', addTagListener);

        });
    }

    function renderAddedTags(addedTags) {
        const serviceMsgEl = document.createElement('label');
        serviceMsgEl.innerHTML = '';
        const tagsInnerEl = document.querySelector('#selectedTagsInner');
        let tags = addedTags;
        tagsInnerEl.innerHTML = '';
        tags.forEach(({tagText, tagClass}) => {
            const tagItem = document.createElement('span');
            tagItem.innerHTML = `
                                        <label class="badge badge-${tagClass} text-uppercase" style=" font-size: 1rem; cursor: pointer">
                                           ${tagText} <span aria-hidden="true" id="removeTag">&times;</span>
                                        </label>
                                        
            `;
            tagsInnerEl.appendChild(tagItem);
            const removeTagEl = tagItem.querySelector('#removeTag');
            const removeTagFromSelectedTags = () =>{
                const deletableTag = {
                    tagText: tagText,
                    tagClass: tagClass
                };
                for (const selectedTag of selectedTags) {
                    if (selectedTag.tagText === deletableTag.tagText && selectedTag.tagClass === deletableTag.tagClass){
                        selectedTags.splice(selectedTags.indexOf(selectedTag), 1);
                    }
                }
                console.log(selectedTags);
                renderAddedTags(addedTags)
            };
            removeTagEl.addEventListener('click', removeTagFromSelectedTags);

        });
    }
}
