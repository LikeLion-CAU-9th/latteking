const startButton = document.querySelector('#start-btn')
const main = document.querySelector('.main')
const result = document.querySelector('.result')
const quizBox = document.querySelector('.quiz-box')
const selectButtons = document.querySelectorAll('.control__select-btn')
const movies = document.querySelectorAll('.screen__movie')
const highScoreSpan = document.querySelector('#high-score')
const currentScoreSpan = document.querySelector('#current-score')
const resultScore = document.querySelector('.result__score')
const retryButton = document.querySelector('#retry')
const counter = document.querySelector('#counter')
const statistics = document.querySelector('.statistics')

let curScore = 0
if (!localStorage.highScore) {
    localStorage.highScore = 0
}
let older
const date = [0, 0]
const correct = [true, true]
let scoreSum = 0
let gameSum = 3
let avg = 0


startButton.addEventListener('click', startGame)
retryButton.addEventListener('click', startGame)

var xhr = new XMLHttpRequest();
xhr.responseType = "json";
var xhr2 = new XMLHttpRequest();
xhr2.responseType = "json";
var xhr3 = new XMLHttpRequest();
xhr3.responseType = "json";
xhr.open("GET", "https://api.countapi.xyz/get/latteking/counter")
xhr.onload = function() {
    counter.innerText = this.response.value
}
xhr.send()


function startGame() {
    main.classList.add('hidden')
    result.classList.add('hidden')
    shuffledSongs = songs.sort(() => Math.random() - 0.5)
    currentSongIndex = 0
    curScore = 0
    currentScoreSpan.innerText = '현재점수: ' + curScore
    highScoreSpan.innerText ='최고점수: ' + localStorage.highScore
    quizBox.classList.remove('hidden')
    setNextQuiz()
}

function setNextQuiz() {
    resetState()
    showQuiz([shuffledSongs[currentSongIndex], shuffledSongs[currentSongIndex+1]])
}

function showQuiz(songs) {
    older = Math.min(songs[0].date, songs[1].date)
    for (var i = 0; i < 2; i++) {
        const song = songs[i]
        const selectButton = selectButtons[i]
        const movie = movies[i]
        movie.innerHTML = song.video
        selectButton.innerText = song.title
        selectButton.dataset.index = i
        selectButton.addEventListener('click', selectAnswer)
        date[i] = song.date
        if (song.date == older) {
            correct[i] = true
        } else {
            correct[i] = false
        }
    }
}

function resetState() {
    Array.from(selectButtons).forEach(button => {
        clearStatusClass(button)
    })
}

function selectAnswer(e) {
    const selectedButton = e.target
    const selectedIndex = JSON.parse(selectedButton.dataset.index)
    const isCorrect = correct[selectedIndex]
    if (isCorrect){
        curScore += 1
        localStorage.highScore = Math.max(curScore, localStorage.highScore)
        highScoreSpan.innerText ='최고점수: ' + localStorage.highScore
        currentScoreSpan.innerText = '현재점수: ' + curScore
    }
    for (var i = 0; i < 2; i++) {
        const selectButton = selectButtons[i]
        setStatusClass(selectButton, correct[i])
        selectButton.innerText = date[i]
    }
    currentSongIndex += 2
    setTimeout(function() {
        if (isCorrect) {
            if (shuffledSongs.length > currentSongIndex + 3) {
                setNextQuiz()
            } else {
                startGame()
            }
        } else {
            showResult(curScore)
        }
    }, 3000)
}

function setStatusClass(element, isCorrect) {
    clearStatusClass(element)
    if (isCorrect) {
      element.classList.add('correct')
    } else {
      element.classList.add('wrong')
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct')
    element.classList.remove('wrong')
}

function showResult(score) {
    xhr2.open("GET", "https://api.countapi.xyz/update/latteking/counter?amount=" + 1);
    xhr2.onload = function() {
        gameSum = this.response.value
        console.log(this.response.value)
        if (score > 0) {
            xhr3.open("GET", "https://api.countapi.xyz/update/latteking/score-sum?amount=" + score)
        } else {
            xhr3.open("GET", "https://api.countapi.xyz/get/latteking/score-sum")
        }
        xhr3.onload = function() {
            scoreSum = this.response.value
            console.log(scoreSum)
            avg = (scoreSum / gameSum).toFixed(1)
            console.log(avg)
            statistics.innerText = "평균점수: " + avg + "점"
        }
        xhr3.send()
    }
    xhr2.send();
    quizBox.classList.add('hidden')
    result.classList.remove('hidden')
    resultScore.innerText = String(score) + "점"
}

const songs = [
    {
        title: '백지영 - 사랑안해',
        date: 20060330,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/EAWHtXQpYX4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '성시경 - 거리에서',
        date: 20061010,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/wcuWIz6CI1U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '아이비 - 유혹의 소나타',
        date: 20070212,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/bIjLYvGNyO0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '윤하 - 비밀번호 486',
        date: 20070315,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/elulW4MAsP0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '빅뱅 - 거짓말',
        date: 20070816,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/Y4RmVcKav9Q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '빅뱅 - 마지막 인사',
        date: 20071122,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/VT9lKAPWG5E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '에픽하이 - One',
        date: 20080417,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/OKsqczjP5-8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '원더걸스 - So Hot',
        date: 20080603,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/agL-oiDlyYo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '이효리 - U-Go-Girl',
        date: 20080714,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/z246K3KBZjo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '동방신기 - 주문(MIROTIC)',
        date: 20080919,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/9r1lvcI-D6k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '백지영 - 총맞은것처럼',
        date: 20081113,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/weee_FzO2AI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '소녀시대 - Gee',
        date: 20090105,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/qizghQs4K6E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '슈퍼주니어 - 쏘리 쏘리',
        date: 20090309,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/_rX0IoeMSoc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '빅뱅, 2NE1 - Lolipop',
        date: 20090327,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/yz15f-1cUCg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '아웃사이더 - 외톨이',
        date: 20090601,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/HCslYhHcWkU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '박명수, 제시카 - 냉면',
        date: 20090713,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/IWYGE6fY594" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '카라 - 미스터',
        date: 20090730,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/lP6yruxrvdE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '씨앤블루 - 외톨이야',
        date: 20100114,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/BRIGlW12qpk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '미쓰에이 - Bad Girl Good Girl',
        date: 20100701,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/sdtspSYyQXs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '휘성 - 결혼까지 생각했어',
        date: 20100826,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/9xJy-KbTQX0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '강승윤 - 본능적으로',
        date: 20101013,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/BZZYKmHtFfM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '아이유 - 좋은 날',
        date: 20101209,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/OIHlzvEKncQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: 'f(x) - Hot Summer',
        date: 20110615,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/xTfbMYBoFik" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '티아라 - Roly-Poly',
        date: 20110629,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/PwpFx1-4BI4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '박명수, GD - 바람났어 (Feat. 박봄)',
        date: 20110702,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/1_UEBZCLn7U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
  ]