const canvas = document.getElementById("graph");
const ratio = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
canvas.height = rect.height * ratio;
canvas.width = rect.width * ratio;
const H = canvas.height;
const W = canvas.width;

const N = 100;
const P = 0.75;
const EPS = 1e-6;

// Speed (units per frame where 1 unit is total h/w)
const UPF = 1/3600;

const pos = Array(N);
for(let i = 0; i < N; ++i){
    pos[i] = [Math.random() * W, Math.random() * H];
}

// Generate a random tree
function generateGraph() {
    // UFDS
    const p = Array(N).fill(-1).map((_, i) => i);
    const find = i => p[i] == i ? i : (p[i] = find(p[i]));
    const union = (a, b) => {p[find(a)] = find(b); }

    const edgeList = [];
    for(let i = 0; i < N-1; ++i) {
        let j = i;
        while(true) {
            j = Math.floor(Math.random() * N);
            if(find(i) != find(j))
                break;
        }
        edgeList.push([i, j]);
        union(i, j);
    }
    return edgeList;
}

const edgeList = generateGraph();

const force = Array(N);

function norm(v) {
    return Math.sqrt(v.map(x => x*x).reduce((x, y) => x + y));
}
function normalise(v) {
    const n = norm(v);
    return v.map(x => x / n);
}

function forceToCenter(pos, centerForce) {
    const delta = [(W/2 - pos[0]) / W, (H/2 - pos[1]) / H];
    return [centerForce * delta[0], centerForce * delta[1]];

    const normed = normalise(delta);

    const f = [centerForce * normed[0], centerForce * normed[1]];
    // Clamp to prevent overshoot of the center
    const impact = [f[0] * UPF, f[1] * UPF];
    if(norm(impact) >= norm(delta) - EPS)
        return [delta[0] / UPF, delta[1] / UPF];
    return f
}

let pointer_x = 0;
let pointer_y = 0;
let pointer_inside = false;

function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 2;
    
    const centerForce = 100;
    const repForce = 100;
    const pullForce = 50;
    const pointerForce = 100;

    for(let i = 0; i < N; ++i)
        force[i] = forceToCenter(pos[i], centerForce);

    for(let i = 0; i < N; ++i) {
        for(let j = 0; j < i; ++j) {
            const d = [(pos[i][0] - pos[j][0]) / W, (pos[i][1] - pos[j][1]) / H];
            const n = norm(d);
            const rep = [repForce * d[0] / (500 * n * n), repForce * d[1] / (500 * n * n)];
            force[i][0] += rep[0];
            force[i][1] += rep[1];
            force[j][0] -= rep[0];
            force[j][1] -= rep[1];
        }
        if(pointer_inside) {
            const d = [(pos[i][0] - pointer_x) / W, (pos[i][1] - pointer_y) / H];
            const n = norm(d);
            const rep = [pointerForce * d[0] / (250 * n * n), pointerForce * d[1] / (250 * n * n)];
            force[i][0] += rep[0];
            force[i][1] += rep[1];
        }
    }

    for(const edge of edgeList) {
        const [i, j] = edge;
        const d = [(pos[j][0] - pos[i][0]) / W, (pos[j][1] - pos[i][1]) / H];
        const pull = [pullForce * d[0], pullForce * d[1]];
        force[i][0] += pull[0];
        force[i][1] += pull[1];
        force[j][0] -= pull[0];
        force[j][1] -= pull[1];
    }

    for(let i = 0; i < N; ++i) {
        pos[i][0] += force[i][0] * UPF *  W;
        pos[i][1] += force[i][1] * UPF * H;
    }

    for(const edge of edgeList) {
        const [i, j] = edge;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(pos[i][0], pos[i][1]);
        ctx.lineTo(pos[j][0], pos[j][1]);
        ctx.stroke();
    }

    for(let i = 0; i < N; ++i) {
        const x = pos[i][0];
        const y = pos[i][1];
        ctx.beginPath();
        ctx.strokeStyle = "#005acd";
        ctx.fillStyle = "#0093cb";
        ctx.arc(x, y, 0.015 * W, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
    requestAnimationFrame(draw);
}

canvas.addEventListener('mouseenter', () => {
    pointer_inside = true;
});
canvas.addEventListener('mouseleave', () => {
    pointer_inside = false;
});
canvas.addEventListener('mousemove', (e) => {
    pointer_x = e.offsetX * ratio;
    pointer_y = e.offsetY * ratio;
});

requestAnimationFrame(draw);
