import '../styles/style.scss'
const graph = document.querySelector('#graph-svg')
const yInput = document.querySelector('#y-data')
const rButtons = document.querySelectorAll('.radioR')
const xBtns = document.querySelectorAll('.x-btn')
const circle = document.querySelector('.dot')
const yLine = document.querySelector('#y-line')
const dottedLines = document.querySelectorAll('.dotted-line')
const checkLines = document.querySelectorAll('.hidden-line')
const xPointer = document.querySelector('#x-pointer')
const yPointer = document.querySelector('#y-pointer')
const popUp = document.querySelector('.popup')
const popUpTitle = document.querySelector('.popup__title')
const popUpCloseBtn = document.querySelector('.popup__close')

let rValue = 0
let segment

document.addEventListener('DOMContentLoaded', () => {
  const data = sessionStorage.getItem('history')
  document
    .querySelector('#result-table-body')
    .insertAdjacentHTML('beforeend', data ? data : '')
})

rButtons.forEach((el) => {
  el.addEventListener('change', (e) => {
    rButtons.forEach((int) => {
      int.checked = false
    })
    e.target.checked = true
    rValue = +el.value
    changeRValue(rValue)
    setLinesCoordinates(rValue)
  })
})

xBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    xBtns.forEach((el) => el.classList.remove('active'))
    e.target.classList.add('active')
  })
})

popUpCloseBtn.addEventListener('click', (e) => {
  showPopUp(false)
})

//================================================================

graph.addEventListener('click', (e) => {
  e.preventDefault()
  if (rValue === 0) {
    showPopUp(true, 'Choose R value')
  } else {
    showPopUp(false)

    let activeLine
    dottedLines.forEach((line) => {
      if (line.classList.contains('active')) activeLine = line
    })
    const x = activeLine ? activeLine.getAttribute('x1') : 150
    const y = yLine.getAttribute('y1')
    setDot(x, y)
    const convX = +(((x - 150) / 100) * +rValue).toFixed()
    const convY = +(-((y - 150) / 100) * +rValue).toFixed(2)
    setInput(convX, convY)
  }
})

graph.addEventListener('mousemove', (e) => {
  yLine.classList.add('active')
  const coord = e.offsetY - 20 * (e.offsetY / 320)
  if (rValue) {
    const limit = 300 / rValue
    if (coord > 150) {
      yLine.setAttribute('y1', coord)
      yLine.setAttribute('y2', coord)
    } else {
      yLine.setAttribute('y1', coord >= 150 - limit ? coord : 150 - limit)
      yLine.setAttribute('y2', coord >= 150 - limit ? coord : 150 - limit)
    }
  } else {
    yLine.setAttribute('y1', coord)
    yLine.setAttribute('y2', coord)
  }
})

checkLines.forEach((line) => {
  line.addEventListener('mouseover', (e) => {
    dottedLines.forEach((xline) => {
      if (e.target.dataset['number'] === xline.dataset['number']) {
        xline.classList.add('active')
      }
    })
  })

  line.addEventListener('mouseout', (event) => {
    let attr = event.target.dataset['number']
    const coordX = event.offsetX - 20 * (event.offsetX / 320)
    if (coordX > 150 + segment * Math.floor(checkLines.length / 2)) {
      return
    }
    dottedLines.forEach((dotLine) => {
      if (dotLine.dataset['number'] == attr) {
        dotLine.classList.remove('active')
      }
    })
  })
})

//================================================================

function changeRValue(rValue) {
  const rlablesWhole = document.querySelectorAll('.graph-label.r-whole-pos')
  const rlablesHalf = document.querySelectorAll('.graph-label.r-half-pos')
  const rlablesNegWhole = document.querySelectorAll('.graph-label.r-whole-neg')
  const rlablesNegHalf = document.querySelectorAll('.graph-label.r-half-neg')
  rlablesWhole.forEach((el) => (el.textContent = rValue))
  rlablesHalf.forEach((el) => (el.textContent = rValue / 2))
  rlablesNegWhole.forEach((el) => (el.textContent = -rValue))
  rlablesNegHalf.forEach((el) => (el.textContent = -(rValue / 2)))
}

function countYValue(yValue) {
  return (-(yValue > 4 ? 4 : yValue) * 100) / rValue + 150
}

function countXValue(xValue) {
  return ((xValue !== undefined ? xValue : 3) * 100) / rValue + 150
}

const form = document.querySelector('#form')
form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (yInput.value === '') {
    showPopUp(true, 'Y value cannot be empty')
    return
  }
  if (!+yInput.value) {
    showPopUp(true, 'Y value must be a number')
    return
  }
  if (+yInput.value > 4 || +yInput.value < -4) {
    showPopUp(true, 'Wrong Y value, out of range (-4 : 4)')
    return
  }
  const y = countYValue(+yInput.value)
  let x

  xBtns.forEach((btn) => {
    if (btn.classList.contains('active')) {
      x = +btn.value
    }
  })

  if (x === undefined) {
    showPopUp(true, 'X value cannot be empty')
    return
  }

  if (rValue === 0) {
    showPopUp(true, 'R value is required')
    return
  }

  let newX = countXValue(x)
  setDot(newX, y)

  fetch(`http://localhost:5000/api/hit?x=${x}&y=${+yInput.value}&r=${rValue}`)
    .then((res) => res.text())
    .then((data) => {
      sessionStorage.setItem(
        'history',
        sessionStorage.getItem('history') === null
          ? data
          : data + sessionStorage.getItem('history')
      )
      document
        .querySelector('#result-table-body')
        .insertAdjacentHTML('afterbegin', data)
    })
    .catch((e) => alert(e.message))
})

function setLinesCoordinates(rValue) {
  segment = 100 / rValue
  let shift = 1
  for (let i = 0; i < dottedLines.length - 1; i += 2) {
    dottedLines[i].setAttribute('x1', 150 - segment * shift)
    dottedLines[i].setAttribute('x2', 150 - segment * shift)
    dottedLines[i + 1].setAttribute('x1', 150 + segment * shift)
    dottedLines[i + 1].setAttribute('x2', 150 + segment * shift)
    checkLines[i].setAttribute('x1', 150 - segment * shift)
    checkLines[i].setAttribute('x2', 150 - segment * shift)
    checkLines[i + 1].setAttribute('x1', 150 + segment * shift)
    checkLines[i + 1].setAttribute('x2', 150 + segment * shift)
    checkLines[i].setAttribute('stroke-width', segment)
    checkLines[i + 1].setAttribute('stroke-width', segment)
    checkLines[i].classList.remove('inactive')
    checkLines[i + 1].classList.remove('inactive')
    shift++
  }
  checkLines[checkLines.length - 1].setAttribute('x1', 150 - segment * shift)
  checkLines[checkLines.length - 1].setAttribute('x2', 150 - segment * shift)
  dottedLines[dottedLines.length - 1].setAttribute('x1', 150 - segment * shift)
  dottedLines[dottedLines.length - 1].setAttribute('x2', 150 - segment * shift)
  checkLines[checkLines.length - 1].classList.remove('inactive')
}

function setDot(x, y) {
  circle.setAttribute('cx', x)
  circle.setAttribute('cy', y)
  xPointer.setAttribute('x1', x)
  xPointer.setAttribute('y1', y)
  xPointer.setAttribute('y2', y)
  yPointer.setAttribute('y1', y)
  yPointer.setAttribute('x1', x)
  yPointer.setAttribute('x2', x)
  xPointer.classList.add('pointer')
  yPointer.classList.add('pointer')
  xPointer.classList.remove('inactive')
  yPointer.classList.remove('inactive')
  circle.classList.remove('inactive')
}

function setInput(x, y) {
  xBtns.forEach((btn) => {
    btn.classList.remove('active')
    if (+btn.value === x) {
      btn.classList.add('active')
    }
  })
  yInput.value = y
}

function showPopUp(show, text = '') {
  let tm
  if (show) {
    popUp.classList.remove('disabled')
    popUpTitle.innerText = text
    tm = setTimeout(() => popUp.classList.add('disabled'), 2500)
  } else {
    popUp.classList.add('disabled')
    clearTimeout(tm)
  }
}
