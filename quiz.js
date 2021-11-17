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
const shareButton = document.querySelector('#share')
const counter = document.querySelector('#counter')
const counterBox = document.querySelector('.main__counter')
const rank = document.querySelector('.result__rank')
const percentageSpan = document.querySelector('.statistics__percentage')
const popUp = document.querySelector('.pop-up')
const logo = document.querySelector('.result__logo')

let curScore = 0
if (!localStorage.highScore) {
    localStorage.highScore = 0
}
let older
const date = [0, 0]
const correct = [true, true]
let scoreSum = 0
let scoreSquareSum = 0
let percentage = 0
let gameSum = 0
let avg = 0


startButton.addEventListener('click', startGame)
retryButton.addEventListener('click', startGame)
counterBox.classList.add('white')
counter.classList.add('white')

fetchCounter("https://api.countapi.xyz/get/latte-king/counter", (count) => {
    counter.innerText = count
    setTimeout(() => {
        counterBox.classList.remove('white');
        counter.classList.remove('white');
        main.classList.remove('hidden')
    }, 0)
})

function shareUrl() {
    const textArea = document.createElement('textarea')
    document.body.appendChild(textArea) 
    textArea.value = window.location.protocol + "//" + window.location.host + window.location.pathname
    textArea.select();
    document.execCommand('copy')
    document.body.removeChild(textArea)
    popUp.classList.remove('hidden')
    setTimeout(() => {
        popUp.classList.add('hidden')
    }, 1000)
}

function fetchCounter(url, cb) {
    fetch(url)
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error')
        }
        return response.json();
    })
    .then((data) => {
        value = JSON.stringify(data.value)
        cb(value)
    })
    .catch((err) => {
        console.log(err)
    })
}

function betweenDay(firstDate, secondDate) {     
    var firstDateObj = new Date(firstDate.substring(0, 4), firstDate.substring(4, 6) - 1, firstDate.substring(6, 8));
    var secondDateObj = new Date(secondDate.substring(0, 4), secondDate.substring(4, 6) - 1, secondDate.substring(6, 8));
    var betweenTime = Math.abs(secondDateObj.getTime() - firstDateObj.getTime());
    return Math.floor(betweenTime / (1000 * 60 * 60 * 24));
}

function startGame() {
    main.classList.add('hidden')
    result.classList.add('hidden')
    shuffledSongs = songs.sort(() => Math.random() - 0.5)
    currentSongIndex = 0
    curScore = 0
    currentScoreSpan.innerText = '현재점수: ' + curScore
    if (localStorage.highScore) {
        highScoreSpan.innerText = '최고점수: ' + localStorage.highScore
    } else { highScoreSpan.innerText = ""}
    quizBox.classList.remove('hidden')
    percentageSpan.innerText = '당신의 라떼력은 상위 %!'
    setNextQuiz()
}

function setNextQuiz() {
    if (shuffledSongs.length <= currentSongIndex + 3) {
        shuffledSongs = songs.sort(() => Math.random() - 0.5)
        currentSongIndex = 0
    }
    resetState()
    let song1 = shuffledSongs[currentSongIndex]
    let song2 = shuffledSongs[currentSongIndex+1]
    let gap = betweenDay(String(song1.date), String(song2.date))
    if (gap > 180 && gap < 1095) {
        showQuiz([shuffledSongs[currentSongIndex], shuffledSongs[currentSongIndex+1]])
    } else {
        currentSongIndex += 1
        setNextQuiz()
    }
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
        if (localStorage.highScore) {
            localStorage.highScore = Math.max(curScore, localStorage.highScore)
            highScoreSpan.innerText = '최고점수: ' + localStorage.highScore
        } else { highScoreSpan.innerText = ""}
        currentScoreSpan.innerText = '현재점수: ' + curScore
    }
    for (var i = 0; i < 2; i++) {
        const selectButton = selectButtons[i]
        setStatusClass(selectButton, correct[i])
        selectButton.innerText = date[i]
    }
    currentSongIndex += 2
    if (!isCorrect) {
        setResult(curScore)
    }
    setTimeout(function() {
        if (isCorrect) {
            setNextQuiz()
        } else {
            showResult()
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

function showResult() {
    quizBox.classList.add('hidden')
    result.classList.remove('hidden')
}

function setResult(score) {
    fetchCounter("https://api.countapi.xyz/update/latte-king/counter?amount=" + 1, (gameCount) => {
        gameSum = gameCount
        if (score > 0) {
            sumUrl = "https://api.countapi.xyz/update/latte-king/score-sum?amount=" + score
        } else {
            sumUrl = "https://api.countapi.xyz/get/latte-king/score-sum"
        }
        fetchCounter(sumUrl, (sumCount) => {
            scoreSum = sumCount
            avg = (scoreSum / gameSum).toFixed(1)
            if (score > 0) {
                squareSumUrl = "https://api.countapi.xyz/update/latte-king/score-square-sum?amount=" + (score)**2
            } else {
                squareSumUrl = "https://api.countapi.xyz/get/latte-king/score-square-sum"
            }
            fetchCounter(squareSumUrl, (squareSumCount) => {
                scoreSquareSum = squareSumCount
                percentage = (computeNormalDistribution(score, gameSum, scoreSum, scoreSquareSum)*100).toFixed(1)
                percentageSpan.innerText = "(상위 " + percentage +"%)"
                if (percentage > 50) { 
                    logo.src="img/newbie.png"; 
                    rank.innerText = "노래평민"
                }
                else if (percentage > 20) { 
                    logo.src="img/prince.png"; 
                    rank.innerText = "노래왕자"
                }
                else if (percentage > 5) { 
                    logo.src="img/king.png"; 
                    rank.innerText = "노래왕"
                }
                else if (percentage >= 0) { 
                    logo.src="img/god.png"; 
                    rank.innerText = "노래도사"
                }
            })
        }) 
    })
    resultScore.innerText = String(score) + "점"
}

function computeNormalDistribution(x, gameSum, scoreSum, scoreSquareSum) {
    const mean = scoreSum / gameSum
    const scoreSquareMean = scoreSquareSum / gameSum
    const sd = (scoreSquareMean - (mean**2)) ** (0.5)
    const Z = (x-mean)/sd
    const T = 1 / (1 + 0.2316419*  Math.abs(Z))
    const D = 0.3989423 * Math.exp(-Z*Z/2);
    let prob = D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))))
    if (Z<0) {
        prob = 1 - prob
    }
    return prob
}

const songs = [
    {
        title: '김범수 - 보고싶다',
        date: 20021211,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/Nl-iaDdA908" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '보아 - 아틀란티스 소녀',
        date: 20030530,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/rVF-F_bgIEc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '이효리 - 10 Minutes',
        date: 20030813,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/okJnl6n3G7E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '델리스파이스 - 고백',
        date: 20030124,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/BYyVDi8BpZw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '렉시 - 애송이',
        date: 20031007,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/i5i-qoH3pK8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '비 - 태양을 피하는 방법',
        date: 20031006,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/GoT3vK3zrPE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '쥬얼리 - 니가 참 좋아',
        date: 20030712,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/gsXQPVwEO34" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '체리 필터 - 오리 날다',
        date: 20030904,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/FYjWDBEA76E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '임창정 - 소주 한 잔',
        date: 20030605,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/Q6ChonO-4iM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '조PD - 친구여',
        date: 20040323,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/Jhl35eJXgjY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '이수영 - 휠릴리',
        date: 20040909,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/gSHerpMWRCQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '거미 - 기억상실',
        date: 20040909,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/4duD8KFRUC8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '동방신기 - Hug',
        date: 20041014,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/p3dxVQsDwyU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: "비 - It's Raining",
        date: 20041008,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/nueYr7Yx8CU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '이승기 - 내 여자라니까',
        date: 20040625,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/4eLS-U2npxk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '김종국 - 한 남자',
        date: 20040618,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/7eqOZqmKIEs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '세븐 - 열정',
        date: 20040707,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/Cqokr695Gic" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '테이 - 사랑은... 향기를 남기고',
        date: 20040105,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/4wuZsWr4kK4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '버즈 - 겁쟁이',
        date: 20050303,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/qkIrcN04AyQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '윤도현 - 사랑했나봐',
        date: 20050429,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/KeMbLY7ztDw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: 'SG 워너비 - 살다가',
        date: 20050323,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/0UQt0STXrK8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '채연 - 둘이서',
        date: 20041213,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/qJrFJRoto88" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '에픽하이 - Fly',
        date: 20051004,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/sHqLlyBlmQI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '나얼 - 귀로',
        date: 20050108,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/upA01bvUemQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '김종국 - 사랑스러워',
        date: 20050701,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/aBCT3B6FGaY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '프리스타일 - Y',
        date: 20040713,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/MKYv5w0QqFM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '쥬얼리 - Super Star',
        date: 20050325,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/l9Ih9zqtWJY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '박효신 - 눈의 꽃',
        date: 20041115,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/BY4sHNaV4WU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '동방신기 - Rising Sun',
        date: 20050912,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/krNW5K6AjWM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '클래지콰이 - She Is',
        date: 20050615,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/zjVt73gD1fc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '성시경 - 거리에서',
        date: 20061010,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/wcuWIz6CI1U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '원더걸스 - tell me',
        date: 20070905,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/2nxIYH11FhM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '소녀시대 - 다시만난세계',
        date: 20070802,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/I1OzfxybATE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
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
        title: '소녀시대 - 소녀시대',
        date: 20071101,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/fz3HuKfNmdE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '아이비 - 유혹의 소나타',
        date: 20070212,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/bIjLYvGNyO0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '슈퍼쥬니어 - 로꾸거',
        date: 20070223,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/4KAg6CryES8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '윤하 - 비밀번호 486',
        date: 20070315,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/elulW4MAsP0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '소녀시대 - kissing you',
        date: 20071101,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/RZwxxqmhA7c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '인순이 - 거위의 꿈',
        date: 20070129,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/9QYYplck9Ic" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '씨야 - 사랑의 인사',
        date: 20070525,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/wRdNZKsh_a00" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '씨야 - 미친 사랑의 노래',
        date: 20060718,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/_MythyZ0w3s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '노을 - 전부 너였다',
        date: 20060210,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/pX_Nv6gG6SY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '이루 - 까만안경',
        date: 20061009,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/8s9lL-k9DAE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '박현빈 - 곤드레 만드레',
        date: 20060809,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/NbP1wTPk3ME" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '윤하 - 기다리다',
        date: 20061204,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/QNt7KUUk_d8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '스윗소로우 - 아무리 생각해도 난 너를',
        date: 20060504,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/vtZGJgbTXgo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '싸이 - 연예인',
        date: 20060724,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/0siBQG4aPWs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '거북이 - 비행기',
        date: 20060720,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dXQzwNb8G7g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '버즈 - 남자를 몰라',
        date: 20060424,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/rgms0zs6SZc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '하동균 - 그녀를 사랑해줘요',
        date: 20060627,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/PlOPWA_DE4U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '바이브 - 그남자 그여자',
        date: 20060227,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/2RMs8I3LUd4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '럼블피쉬 - I Go',
        date: 20060613,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/FwuZKJSrGAg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '백지영 - 사랑 안해',
        date: 20060313,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/EAWHtXQpYX4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '빅뱅 - 하루 하루',
        date: 20080808,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/6I4Ygo0dwRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '태연 - 만약에',
        date: 20080123,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/RjU5Op_KSBw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '사랑비 - 김태우',
        date: 20090903,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/LF2zAz2_ICA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '애프터스쿨 - diva',
        date: 20090409,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/w39MXjjGwfI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '샤이니 - 줄리엣',
        date: 20090518,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/7A4WZsC1njA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '4minute - Hot issue',
        date: 20090615,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/B8p-zOux9s8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: 'U-kiss - 만만하니',
        date: 20091106,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/UQsNfs_9SYk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: 'love - 브라운아이드걸스',
        date: 20080117,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/CdsQsniwoDk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '다비치 - 8282',
        date: 20090227,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/c54FzJcol3I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '브라운아이드걸스 - abracadabra',
        date: 20090721,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/oU0b_47itlc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '손담비 - 미쳤어',
        date: 20080918,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/5maMAv48OcM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '2am - 이노래',
        date: 20080711,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/TTpvoSN5LHg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title : '엄정화 - D.I.S.C.O',
        date : 20080701,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/C0USKQRvuIc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
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
        title: '아이유&슬옹 - 잔소리',
        date: 20100603,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/bzdsqPOJK_I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '뜨거운 감자 - 고백',
        date: 20100330,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/KdKucPl2lXA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '소녀시대 - Oh!',
        date: 20100128,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/5r6M-c3_7YA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
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
    {
        title: '2NE1 - 내가 제일 잘 나가',
        date: 20110624,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/rnxZyt3f708" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '씨스타 - So Cool',
        date: 20110809,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/yW5a8JO28gI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '다비치 - 안녕이라고 말하지마',
        date: 20110829,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/90ie319tqIs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '시크릿 - 샤이보이',
        date: 20110106,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/9iMFkd2yf_Y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '2PM - Hand Up',
        date: 20110620,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/XGAQzfhC4g4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
    {
        title: '트러블메이커 - Trouble Maker',
        date: 20111201,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/z4zR1l9qTgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },
    {
        title: '버스커 버스커 - 벚꽃엔딩',
        date: 20120329,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/jrYIZ9VgmKo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '싸이 - 강남스타일',
        date: 20120715,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/DQCuV0ck4aA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '씨스타 - 나혼자(ALONE)',
        date: 20120412,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/kLka40yzGWQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: 'BIGBANG - Fantastic Baby',
        date: 20120229,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/oM4KBLQRCM8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '에일리 - Heaven',
        date: 20120209,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/X2nUBZnC5gk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '아이유 - 하루 끝',
        date: 20120511,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/gJtNx3P02Z4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '나얼 - 바람기억',
        date: 20120920,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/wyejTBPksy0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
      {
        title: '소녀시대 태티서 - Twinkle',
        date: 20120430,
        video: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/ETIuTYFZLow" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    },  
  ]