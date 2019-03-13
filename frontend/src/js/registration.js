import {Http} from "./http.js";

const regNicknameEl = document.querySelector('#regNickname'); // поле ввода nickname
const regPassEl = document.querySelector('#regPass'); // поле ввода pass
const regFormEl = document.querySelector('#regForm');

const http = new Http('http://localhost:7777');

const errorEl = document.createElement('div'); // создание блока ошибок
errorEl.innerHTML = ''; // очистка блока чтобы не было копий

regFormEl.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    const regPass = regPassEl.value;
    const regNickname = regNicknameEl.value;

    if (regNickname.length < 4 || regPass.length < 7) {
        errorEl.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" id="errorEl" role="alert">
  <strong>Ой!</strong> Введенное имя пользователя или пароль должны удовлетворять условиям
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
        `;
        regFormEl.appendChild(errorEl);
        return
    }

    const newUser = {
        nickname: regNickname.trim(),
        password: regPass.trim()
    };

    let _resultRegFlag = ''; // ОТВЕЧАЕТ ЗА ФЛАГ РЕГИСТРАЦИИ, true если ник занят, false если нет
    let getRegFlag = await http.add(newUser);
    await getRegFlag.json().then(async (data) => {
            _resultRegFlag = data;
            await console.log(_resultRegFlag);
        }
    );
    if (_resultRegFlag === 'true'){
        errorEl.innerHTML = `
        <div class="alert alert-info alert-dismissible fade show" id="errorEl" role="alert">
  <strong>Отлично!</strong> Вы успешно зарегистрировались!
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
        `;
        regFormEl.appendChild(errorEl);
        return
    } else {
        errorEl.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" id="errorEl" role="alert">
  <strong>Ой!</strong> К сожалению, это имя уже занято
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
        `;
        regFormEl.appendChild(errorEl);
        return
    }
});