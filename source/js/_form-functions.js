
let html = document.querySelector("html");
let mainTag = document.querySelector("main");

var isStorageSupport = true;
var storagePhone = "";
var storageEmail = "";

try {
  storagePhone = localStorage.getItem("phone");
  storageEmail = localStorage.getItem("email");
} catch (err) {
  isStorageSupport = false;
}

let getStorage = (popup) => {
  var phone = popup.querySelector("[name='phone']");
  var email = popup.querySelector("[name='email']");
  if (localStorage){
    phone.value = storagePhone;
    email.value = storageEmail;
  }
}

let closePopupKeyDown = (evt, popup) => {
  if (evt.keyCode === window.util.ENTER_KEYCODE) {
    closePopup(evt, popup);
  }
}

let closeEsc = (evt, popup) => {
  if (evt.keyCode === window.util.ESC_KEYCODE) {
    closePopup(evt, popup);
  }
}

let checkCloseArea = (evt, popup) => {
  if (evt.target.classList === popup.classList) {
    closePopup(evt, popup);
  }
}

let closePopup = (evt, popup) => {
  evt.preventDefault();
  // Если была открыта 2 "страница" формы, то прячем их
  // Класс отвечающщий за скрытие первой страницы уберем при открытии попапа, чтобы анимация исчезновения не пострадала
  // popup.querySelector(".form__second-page").classList.remove("open");

  popup.classList.remove("popup--active");

  popup.removeEventListener("click", evt => checkCloseArea(evt, popup));  
  popup.querySelector(".form__close").removeEventListener("click", evt => closePopup(evt, popup));
  popup.querySelector(".form__close").removeEventListener("keydown", evt => closePopupKeyDown(evt, popup));
  window.removeEventListener("keydown", evt => closeEsc(evt, popup));

  // Отмена запрета скрола страницы
  html.classList.remove("lock");
}

let openPopup = (evt, popup) => {
  evt.preventDefault();
  // Если была открыта 2 "страница" формы, то нужно убрать с первой страницы класс её закрытия
  // if (popup.querySelector(".form__first-page").classList.contains("close")) {
  //   popup.querySelector(".form__first-page").classList.remove("close");
  // }
  getStorage(popup);
  popup.querySelector("#phone").select();
  popup.classList.add("popup--active");

  popup.addEventListener("click", evt => checkCloseArea(evt, popup));  
  popup.querySelector(".form__close").addEventListener("click", evt => closePopup(evt, popup));
  popup.querySelector(".form__close").addEventListener("keydown", evt => closePopupKeyDown(evt, popup));
  window.addEventListener("keydown", evt => closeEsc(evt, popup));

  // Запрет скрола страницы
  html.classList.add("lock");
}

let addError = (field) => {
  field.classList.add("error");
}

let removeError = (field) => {
  field.classList.remove("error");
}

let checkPhone = (input) => {
  return (/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(input.value));
}

let checkTextInput = (email) => {
  return (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email.value));
}

let checkValidate = (form) => {
  let inputs = form.querySelectorAll("input");
  let error = 0;

  [].slice.call(inputs).forEach(input => {
    if (input.hasAttribute("required")) {
      if ( ((input.getAttribute("type") === "tel") && (!checkPhone(input))) ||
            ((input.getAttribute("type") === "email") && (!checkTextInput(email)))
          ) {
        addError(input.parentElement);
        error++;
      }
    }
  });
  return(error);
}

let moveToNextPage = (popup) => {
  let successTemplate = document.querySelector("#success").content.querySelector(".status").cloneNode(true);
  popup.querySelector(".form").reset()
  popup.classList.remove("sending");
  mainTag.appendChild(successTemplate);
  // popup.querySelector(".form__first-page").classList.add("close");
  // popup.querySelector(".form__second-page").classList.add("open");
}

let moveToErrorPage = (popup) => {
  popup.querySelector(".form").reset();
  popup.classList.remove("sending");
  // popup.querySelector(".form__second-page").querySelector("#first-line").innerHTML = "Ошибка";
  // popup.querySelector(".form__second-page").querySelector("#second-line").innerHTML = "Сбой при отправке формы. Пожалуйста, попробуйте отправить данные позднее.";
  // popup.querySelector(".form__first-page").classList.add("close");
  // popup.querySelector(".form__second-page").classList.add("open");
}

let sendFormData = async (evt, form, url) => {
  evt.preventDefault();
  let errors = checkValidate(form.querySelector(".form"));
  if (errors === 0) {
    if (isStorageSupport) {
      localStorage.setItem("phone", phone.value);
      localStorage.setItem("email", email.value);
    }
    form.classList.add("sending");
    let response = await fetch(url, {
      method: "POST",
      body: new FormData(form.querySelector(".form"))
    });

    if (response.ok) {
      moveToNextPage(form);
    } else {
      moveToNextPage(form);
      // moveToErrorPage(form);
    }
  }
}

let addSubmitListener = (form) => {
  form.querySelector(".form").addEventListener("submit", (evt) => {
    evt.preventDefault();
    sendFormData(evt, form, window.util.FORM_ACTION);
  });
};

let addSubmitAction = (targetForm) => {
  [].slice.call(targetForm.querySelectorAll(".form__field")).forEach(field => {
    field.addEventListener("input", () => {
      if (field.classList.contains("error")) {
        removeError(field);
      }
    });
  });

  addSubmitListener(targetForm);
}
