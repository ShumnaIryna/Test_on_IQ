"use strict";

const test_wr = document.querySelector("#test-container");
const home_wr = document.querySelector("#home");
const test_res = document.querySelector("#test-results");
const header_title = document.querySelector("#survey-title");
const test_response = document.querySelector("#test-response");
const header_label = {
  initial: "ТЕСТ НА ОПРЕДЕЛЕНИЕ IQ",
  finish: "ГОТОВО!",
};

let answers = [];
let active_question = 0;

// Show/hide side panel
function togglePanel(show) {
  const panel = document.querySelector("#panel");
  if (show) {
    panel.classList.add("open");
  } else {
    panel.classList.remove("open");
  }
}

function showTest() {
  togglePanel();
  home_wr.style.display = "none";
  test_res.style.display = "none";
  test_response.innerHTML = "";
  test_wr.style.removeProperty("display");
  test_wr.scrollIntoView();
  startTest();
}

// Quit test, go back to home view
function abortTest() {
  togglePanel();
  home_wr.style.removeProperty("display");
  test_wr.style.display = "none";
  test_res.style.display = "none";
  header_title.innerHTML = header_label.initial;
}

// Start test from the 1st question
function startTest() {
  if (test_questions.length) {
    active_question = 0;
    answers.length = 0;
    drawQuestion(active_question);
  }
}

function finishTest() {
  const q_cont = document.querySelector("#question-container");
  const go_next = document.querySelector("#go-next");
  const progress = document.querySelector("#test-progress");
  const q_loading_test = document.createElement("p");
  const spinner = createSpinner();
  const q_title = document.createElement("p");

  q_cont.innerHTML = "";
  go_next.style.display = "none";
  progress.style.width = "100%";

  q_title.classList.add("test-title");
  q_title.textContent = "Обработка результатов";
  q_cont.appendChild(q_title);
  q_cont.appendChild(spinner);

  q_loading_test.classList.add("text-loading");
  q_loading_test.textContent =
    "Определение стиля мышления... ................................................................";
  q_cont.appendChild(q_loading_test);

  setTimeout(() => {
    test_wr.style.display = "none";
    test_res.style.removeProperty("display");
    countdown("ten-countdown", 10, 0);
    header_title.innerHTML = header_label.finish;

    console.log(answers); // log collected answers
  }, 1500);
}

function drawQuestion(q_index) {
  const question = test_questions[q_index];

  if (!question) {
    finishTest();
    return;
  }
  const format = question.format;

  // first - clear old question
  const q_cont = document.querySelector("#question-container");
  const go_next = document.querySelector("#go-next");
  q_cont.innerHTML = "";
  go_next.disabled = true;
  go_next.style.removeProperty("display");

  // set test progress
  const progress = document.querySelector("#test-progress");
  progress.style.width = (q_index / test_questions.length) * 100 + "%";

  // create question title
  const q_title = document.createElement("p");
  q_title.classList.add("test-title");
  q_title.textContent = question.question;
  q_cont.appendChild(q_title);

  if (question.img) {
    const image = document.createElement("img");
    image.classList.add("test-img");
    image.setAttribute("src", "./img/" + question.img);
    q_cont.appendChild(image);
  }

  // Color and number options have their special wrapper
  const options__custom_wr = document.createElement("div");
  const options_wr_class =
    format === "color" ? "colors" : format === "number" ? "numbers" : "options";
  options__custom_wr.classList.add(options_wr_class);

  // create answers
  question.options.forEach((option, idx) => {
    // option wraper
    const option_wr = document.createElement("div");
    const option_class =
      format === "color" ? "color" : format === "number" ? "number" : "option";
    option_wr.classList.add(option_class);

    // input radio
    const radio_btn = document.createElement("input");
    radio_btn.setAttribute("type", "radio");
    radio_btn.setAttribute("id", question.id + "_" + "a_" + idx);
    radio_btn.setAttribute("name", question.id);
    radio_btn.value = option;

    window.addEventListener("change", () => {
      go_next.disabled = false;
    });

    // label for input
    const option_lbl = document.createElement("label");
    option_lbl.classList.add("radio-lbl");
    option_lbl.setAttribute("for", question.id + "_" + "a_" + idx);
    if (format !== "color") {
      option_lbl.textContent = option;
    } else {
      option_lbl.style.backgroundColor = option;
    }

    option_wr.appendChild(radio_btn);
    option_wr.appendChild(option_lbl);

    if (format === "color" || format === "number") {
      options__custom_wr.appendChild(option_wr);
    } else {
      q_cont.appendChild(option_wr);
    }
  });

  if (format === "color" || format === "number") {
    q_cont.appendChild(options__custom_wr);
  }

  document.querySelector(`#test-anchor`).scrollIntoView();
}

function goNext() {
  answers.push({
    q_id: test_questions[active_question].id,
    q_answer: test_wr.querySelector("input:checked").value,
  });
  active_question++;
  drawQuestion(active_question);
}

// stop test and scroll to given element
function openView(el) {
  event.preventDefault();
  abortTest();
  document
    .querySelector(`#${el}`)
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// timer
function countdown(elementName, minutes, seconds) {
  var element, endTime, hours, mins, msLeft, time;

  function twoDigits(n) {
    return n <= 9 ? "0" + n : n;
  }

  function updateTimer() {
    msLeft = endTime - +new Date();
    if (msLeft < 1000) {
      element.innerHTML = "Время истекло!";
    } else {
      time = new Date(msLeft);
      hours = time.getUTCHours();
      mins = time.getUTCMinutes();
      element.innerHTML =
        (hours ? hours + ":" + twoDigits(mins) : mins) +
        ":" +
        twoDigits(time.getUTCSeconds()) +
        " минут";
      setTimeout(updateTimer, time.getUTCMilliseconds() + 500);
    }
  }

  element = document.getElementById(elementName);
  endTime = +new Date() + 1000 * (60 * minutes + seconds) + 500;
  updateTimer();
}

function sendResult(el) {
  el.disabled = true;
  test_response.innerHTML = "";
  const spinner = createSpinner();
  test_response.appendChild(spinner);
  fetch("https://swapi.dev/api/people/1/")
    .then((response) => response.json())
    .then((data) => {
      el.disabled = false;
      spinner.remove();
      if (data) {
        const res_container = document.createElement("div");
        res_container.classList.add("test-response");
        Object.keys(data).forEach((key) => {
          const res_el_name = document.createElement("b");
          const res_el_val = document.createElement("span");

          res_el_name.textContent = `${key}:`;
          if (Array.isArray(data[key])) {
            res_el_val.textContent = `${data[key].join(", ")}`;
          } else {
            res_el_val.textContent = `${data[key]}`;
          }
          res_container.appendChild(res_el_name);
          res_container.appendChild(res_el_val);
        });
        test_response.appendChild(res_container);
      }
    });
}

function createSpinner() {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  return spinner;
}
