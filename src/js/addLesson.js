import Http from "./http.js";
import {DataStorage} from "./lib.js";
import {LocalStorage} from "./storage.js";
import {Link} from "./lib.js";
import Render from "./renderTimetable.js";
import {ConnectAccount} from "./connectAccount.js";
import {ServerLink} from "./serverLink.js";

export function addLesson() {

    const serverLink = new ServerLink();
    const http = new Http(serverLink.link);
// const authForSync = new WebSocket("ws://timetable-eeenkeeei.herokuapp.com/updateData");
// const syncWithServer = new WebSocket("ws://timetable-eeenkeeei.herokuapp.com/sync");

    const storage = new DataStorage(new LocalStorage());
    const renderClass = new Render();
    if (storage.getUserData === null) {
        document.location.href = 'index.html'
    }

    let user;
    let innerHTML = ``;
    const connectAccount = new ConnectAccount();
    (async function updateUser() {
        if (storage.getUserData === null) {
            document.location.href = 'index.html'
        } else {
            await connectAccount.getData();
            user = await connectAccount.user;
            renderClass.renderTimetable(user);
            usernameBarEl.textContent = user.username;
            innerHTML = `
<div class="fadeIn wow animated" data-animation="true">
<form id="addLessonForm"> 
<div class="container">
<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
       
    <label for="selectDay" id="inputNameLabel">Название</label>
    <input type="text" class="form-control form-control-sm shadow-sm" id="lessonName" placeholder="Название занятия" autofocus="autofocus">
</div>
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-3 col-xl-2">
        <label for="selectDay">Заметка</label>
        <input type="text" class="form-control form-control-sm shadow-sm" id="lessonNote" placeholder="Заметка">
    </div>
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-2 col-xl-3"><label for="selectDay">Номер занятия</label>
         <select class="form-control form-control-sm shadow-sm" id="selectLessonNumber">
                                <option value="1">1 пара ${user.lessonsTimetable[0].start} - ${user.lessonsTimetable[0].end}</option>
                                <option value="2">2 пара ${user.lessonsTimetable[1].start} - ${user.lessonsTimetable[1].end}</option>
                                <option value="3">3 пара ${user.lessonsTimetable[2].start} - ${user.lessonsTimetable[2].end}</option>
                                <option value="4">4 пара ${user.lessonsTimetable[3].start} - ${user.lessonsTimetable[3].end}</option>
                                <option value="5">5 пара ${user.lessonsTimetable[4].start} - ${user.lessonsTimetable[4].end}</option>
                                <option value="6">6 пара ${user.lessonsTimetable[5].start} - ${user.lessonsTimetable[5].end}</option>
         </select>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-2 col-xl-2"><label for="selectDay">Тип занятия</label>
         <select class="form-control form-control-sm shadow-sm" id="selectLessonType">
                                <option value="Лекция">Лекция</option>
                                <option value="Практика">Практика</option>
                                <option value="Лабораторная работа">Лабораторная работа</option>
         </select>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-2 col-xl-2">
    <label>День</label>
                            <select class="form-control form-control-sm shadow-sm" id="selectLessonDay">
                                <option value="Понедельник">Понедельник</option>
                                <option value="Вторник">Вторник</option>
                                <option value="Среда">Среда</option>
                                <option value="Четверг">Четверг</option>
                                <option value="Пятница">Пятница</option>
                                <option value="Суббота">Суббота</option>
                            </select>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label></label>
          <button type="submit" class="btn btn-outline-success shadow" id="addFormButton"><strong>Добавить</strong></button>
          <button type="button" class="btn btn-outline-danger shadow" id="cancelAddButton"><strong>Отмена</strong></button>
      </div>
    </div>
</div>
</form>
</div>
`;
        }
    })();

    const usernameBarEl = document.querySelector('#usernameBar');
    usernameBarEl.textContent = storage.getUserData.data.username;

    const timetableDivEl = document.querySelector('#timetableDiv'); // корневой див для таблицы

    let selectLessonNumber = '1';
    let selectLessonDay = 'Понедельник';
    let selectLessonType = 'Лекция';


//
// authForSync.onopen = function (event) {
//     console.log("Opened socket!");
//     authForSync.send(user.username);
// };
//
// syncWithServer.onmessage = function (event) {
//     if ((JSON.parse(event.data)).username === user.username) {
//         console.log((JSON.parse(event.data)).username);
//     }
//     syncWithServer.close();
// };


    const msgEl = document.querySelector('#msgEl');
    msgEl.innerHTML = '';


    let lessonObject = {};
    const addDivFormEl = document.querySelector('#addDivForm');
    const addLessonButtonEl = document.querySelector('#addLessonButton');
    addLessonButtonEl.addEventListener('click', () => {
        renderClass.renderTimetable(user);
        renderClass.editLessonFlag = false;
        addDivFormEl.innerHTML = '';
        addDivFormEl.innerHTML = innerHTML;
        const addLessonFormEl = document.querySelector('#addLessonForm');
        document.querySelector('#selectLessonNumber')
            .addEventListener('input', (evt) => {
                selectLessonNumber = evt.currentTarget.value;
            });
        document.querySelector('#selectLessonDay')
            .addEventListener('input', (evt) => {
                selectLessonDay = evt.currentTarget.value;
            });
        document.querySelector('#selectLessonType')
            .addEventListener('input', (evt) => {
                selectLessonType = evt.currentTarget.value;
            });

        const cancelAddButton = document.querySelector('#cancelAddButton');
        cancelAddButton.addEventListener('click', () => {
            const animatedDivEl = document.querySelector('[data-animation=true]');
            animatedDivEl.className = 'fadeOut wow animated';
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
            const lessonNameEl = document.querySelector('#lessonName');
            let lessonName = lessonNameEl.value;
            if (lessonName.length < 2) {
                msgEl.innerHTML = '';
                lessonNameEl.className = 'form-control form-control-sm shadow-sm is-invalid';
                return
            }
            const lessonNoteEl = document.querySelector('#lessonNote');
            let lessonNote = lessonNoteEl.value;
            setTimeout(() => {
                addLessonFormEl.innerHTML = '';
            }, 900);
            const animatedDivEl = document.querySelector('[data-animation=true]');
            animatedDivEl.className = 'fadeOut wow animated';
            lessonObject = {
                day: selectLessonDay,
                number: selectLessonNumber,
                name: lessonName,
                note: lessonNote,
                type: selectLessonType
            };
            user.timetable.push(lessonObject);
            let timetableUpdate = await http.timetableUpdate(user);
            renderClass.renderTimetable(user);

            let _resultUpdateFlag = '';
            await timetableUpdate.json().then(async (data) => {
                _resultUpdateFlag = data;
                await console.log(data);
            });

            if (_resultUpdateFlag === 'Timetable Updated') {
                msgEl.innerHTML = '';
                msgEl.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show shadow-sm" id="errorEl" role="alert">
            <strong>Занятие добавлено</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `;

            }
        })
    });







}
