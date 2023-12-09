// https://programmerhumor.io/wp-content/uploads/2021/08/programmerhumor-io-programming-memes-3e46b202e2cc5ef-758x953.jpg
const gameDiv = document.getElementById('game')
const fieldDiv = document.getElementById('field')
const levelSelect = document.getElementById('levelSelect')
const btnReset = document.getElementById('reset')

const MinesPerLevel = [10, 40, 99, 10]
const Colors = ['#878787', '#2020df', '#208020', '#df2020', '#202080', '#802020', '#006666', '#090909', '#6f6f6f']
const Mine = -1
const Level = {
    Beginner: 0,
    Intermediate: 1,
    Expert: 2,
    Custom: 3
}
const Icons = {
    Mine: '💣',
    Flag: '🚩'
}

let map = []
let fieldSize = {}

levelSelect.addEventListener('change', (event) => {
    const level = Number(event.target.value)
    startGame(level)
})

btnReset.addEventListener('click', () => {
    const level = Number(levelSelect.value)
    startGame(level)
    btnReset.className = 'resetUnpressed'
})

fieldDiv.addEventListener('click', (event) => {
    const button = event.target
    if (button.classList.contains('gameBtn') && button.textContent != Icons.Flag) {
        const position = getButtonPosition(button)
        revealCell(button, position.row, position.col)
    }
})

window.oncontextmenu = (event) => {
    if (event.target.classList.contains('gameBtn') && !event.target.disabled) {
        const button = event.target
        toggleFlag(button)
    }
    return false // cancel context menu
}

function toggleFlag(button) {
    if (!button.textContent) {
        toggleButtonValue(button, Icons.Flag)
    } else if (button.textContent === Icons.Flag) {
        toggleButtonValue(button, '')
    }
}

function getFieldSize(level) {
    switch(level) {
        case Level.Beginner:
            rows = cols = 9
            break
        case Level.Intermediate:
            rows = cols = 16
            break
        case Level.Expert:
            rows = 16, cols = 30
            break
        case Level.Custom:
            rows = cols = 9
            break
    }
    return { rows, cols }
}

function setupMap(field, level) {
    map = Array(field.rows).fill().map(() => Array(field.cols).fill(0));
    setupMines(field.rows, field.cols, MinesPerLevel[level])
    calculateCellValues(field.rows, field.cols)
}

function setupMines(rows, cols, mines) {
    for (let i = 0; i < mines;) {
        const row = Math.floor(Math.random() * (rows - 1))
        const col = Math.floor(Math.random() * (cols - 1))
        if (map[row][col] != Mine) {
            map[row][col] = Mine
            i++
        }
    }
}

function calculateCellValues(rows, cols) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (map[i][j] === Mine) continue;
            map[i][j] = calculateMinesAroundCell(i, j, rows, cols)
        }
    }
}

function calculateMinesAroundCell(row, col, maxRow, maxCol) {
    let area = getSurroundingArea(row, col, maxRow, maxCol)
    let mines = 0
    for (let i = area.rowFrom; i <= area.rowTo; i++) {
        for (let j = area.colFrom; j <= area.colTo; j++) {
            if (map[i][j] === Mine) ++mines
        }
    }
    return mines
}

function getSurroundingArea(row, col, maxRow, maxCol) {
    return {
        rowFrom: row-1 < 0 ? 0 : row-1,
        rowTo: row+1 > maxRow-1 ? maxRow-1 : row+1,
        colFrom: col-1 < 0 ? 0 : col-1,
        colTo: col+1 > maxCol-1 ? maxCol-1 : col+1
    }
}

function setupGameField(field) {
    fieldDiv.replaceChildren()
    for (let i = 0; i < field.rows; i++) {
        const row = document.createElement('div')
        for (let j = 0; j < field.cols; j++) {
            const button = document.createElement('button')
            button.className = 'gameBtn'
            button.id = `${i}-${j}`
            row.appendChild(button);
        }
        fieldDiv.appendChild(row)
    }
}

function revealCell(button, row, col) {
    const cellValue = map[row][col]
    if (cellValue === Mine) {
        endGame(false)
    } else if (cellValue != 0) {
        toggleButtonValue(button, cellValue)
    } else {
        const area = getSurroundingArea(row, col, fieldSize.rows, fieldSize.cols)
        revealArea(area)
    }

    if (allCellsGuessed()) {
        endGame(true)
    }
}

// https://live.staticflickr.com/5548/9399963363_657dc440ac_w.jpg
function revealArea(area) {
    for (let i = area.rowFrom; i <= area.rowTo; i++) {
        for (let j = area.colFrom; j <= area.colTo; j++) {
            const button = document.getElementById(`${i}-${j}`)
            if (button.textContent !== Icons.Flag && button.textContent !== '') continue;

            const cellValue = map[i][j]
            toggleButtonValue(button, cellValue)

            if (cellValue === 0) {
                const cellArea = getSurroundingArea(i, j, fieldSize.rows, fieldSize.cols)
                revealArea(cellArea)
            }
        }
    }
}

function toggleButtonValue(button, value) {
    button.textContent = value
    button.style.color = Colors[value]
    if (value === '') {
        button.classList.remove('btnClicked')
    } else {
        button.classList.add('btnClicked')
    }
}

function allCellsGuessed() {
    let buttons = document.getElementsByClassName('gameBtn')
    for (const button of buttons) {
        const position = getButtonPosition(button)
        const cellValue = map[position.row][position.col]
        if (cellValue !== Mine && Number(button.textContent) !== cellValue) return false
    }
    return true
}

function revealMap(success) {
    let buttons = document.getElementsByClassName('gameBtn')
    for (const button of buttons) {
        button.disabled = true
        const position = getButtonPosition(button)
        const cellValue = map[position.row][position.col]

        if (button.textContent === Icons.Flag) continue

        if (cellValue === Mine) {
            button.textContent = Icons.Mine
        } else if (success) {
            button.textContent = cellValue
        }
    }
}

function getButtonPosition(btn) {
    const arr = btn.id.split('-')
    return {
        row: Number(arr[0]),
        col: Number(arr[1])
    }
}

function startGame(level) {
    fieldSize = getFieldSize(level)
    setupMap(fieldSize, level)
    setupGameField(fieldSize)
}

function endGame(success) {
    btnReset.className = success ? 'resetWin' : 'resetLose'
    revealMap(success)
}

startGame(Level.Beginner)