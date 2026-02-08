const flapDisplay = document.getElementById('flapdisplay');
const flapBlocks = flapDisplay.children;
const L = flapBlocks.length;
const idxRange = Array.from({length: L}, (_, i) => i);

const charSet = Array.from({length: 26}, (_, i) => String.fromCharCode(i + 'A'.charCodeAt(0))).concat([' ']);
const curChars = Array(L).fill(charSet.indexOf(' '));
for(let i = 0; i < L; ++i){
    const [flipUp, _, __, bottom] = flapBlocks[i].children;
    if(flipUp.innerHTML.length == 1 && charSet.indexOf(flipUp.innerHTML[0]) != -1) {
        curChars[i] = charSet.indexOf(flipUp.innerHTML[0]);
        bottom.innerHTML = flipUp.innerHTML;
    } else {
        flipUp.innerHTML = ' ';
        bottom.innerHTML = ' ';
    }
}

async function changeText(newText) {
    if(newText.length > L) {
        console.error('String too long');
        return;
    }
    const charArr = Array.from(newText);
    const idxs = charArr.map(c => charSet.indexOf(c));
    if(idxs.some(i => i == -1)) {
        console.error('Invalid String');
        return;
    }
    idxs.push(...Array(L - newText.length).fill(charSet.indexOf(' ')));
    
    while(curChars.some((c, i) => c != idxs[i])) {
        await Promise.all(idxRange
            .filter(i => curChars[i] != idxs[i])
            .map(i => animateFlap(i, (curChars[i] + 1) % charSet.length)));
        // Debounce
        await new Promise(res => setTimeout(res, 1));
    }
}

function animateFlap(fn, nc) {
    const [flipUp, peekNext, flipDown, bottom] = flapBlocks[fn].children;
    const c = charSet[nc];
    peekNext.innerHTML = c;
    flipDown.innerHTML = c;

    const flipUpAnim = new Promise(resolve => flipUp.addEventListener('animationend', () => resolve(), {once: true}));
    const flipDownAnim = new Promise(resolve => flipDown.addEventListener('animationend', () => resolve(), {once: true}));

    flipUp.classList.add('flipup_anim');
    flipDown.classList.add('flipdown_anim');

    return Promise.all([flipUpAnim, flipDownAnim])
        .then(() => {
            flipUp.innerHTML = c;
            bottom.innerHTML = c;
            flipUp.classList.remove('flipup_anim');
            flipDown.classList.remove('flipdown_anim');
            curChars[fn] = nc;
        });
}

const nouns = ['MATHEMATICS', 'AI', 'DATA SCIENCE', 'OPTIMIZATION',
    'DEEP LEARNING', 'KG SYSTEMS', 'TRANSFORMERS', 'NUMBER THEORY', 'DATA STRUCTS',
    'CLOUD', 'GAA', 'ALGORITHMS', 'GRAPH THEORY', 'NLP', 'MULTI AGENT'];

// Fisher-Yates shuffle
let ci = nouns.length;
while(ci != 0) {
    let ri = Math.floor(Math.random() * ci);
    ci--;
    [nouns[ci], nouns[ri]] = [nouns[ri], nouns[ci]];
}

const timeGap = 4;
function loopDisplay(idx) {
    changeText(nouns[idx])
        .then(() => new Promise(res => setTimeout(res, timeGap * 1000)))
        .then(() => window.requestAnimationFrame(() => loopDisplay((idx + 1) % nouns.length)));
}

window.requestAnimationFrame(() => loopDisplay(0));
