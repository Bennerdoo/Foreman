// packages/dashboard/src/main.ts

// --- Matrix Background ---
const setupMatrix = () => {
  const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  const chars = '0123ef456789ABCDEF0123456789'.split('');
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops: number[] = Array(Math.floor(columns)).fill(1);

  const draw = () => {
    ctx.fillStyle = 'rgba(3, 10, 3, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff41'; // Primary accent
    ctx.font = `${fontSize}px "JetBrains Mono"`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  };

  setInterval(draw, 40);
};

setupMatrix();

// --- Number Animation ---
const animateValue = (id: string, start: number, end: number, duration: number) => {
  if (start === end) return;
  const obj = document.getElementById(id);
  if (!obj) return;
  
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const curr = Math.floor(progress * (end - start) + start);
    obj.innerHTML = curr.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
  
  if (end > start && Math.abs(end - start) > end * 0.1) {
    obj.classList.add('spike');
    setTimeout(() => obj.classList.remove('spike'), 500);
  }
};

let currentMetrics = { throughput: 0, processed: 0, p99: 0, queue: 0 };

// --- Typing Effect ---
const typewrite = (el: HTMLElement, text: string, cb?: () => void) => {
  el.innerHTML = '';
  el.classList.add('typing-cursor');
  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 30);
    } else {
      setTimeout(() => el.classList.remove('typing-cursor'), 400);
      if (cb) cb();
    }
  };
  type();
};

const showToast = (msg: string) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `> ${msg}`;
  toast.classList.add('visible');
  toast.classList.add('typing-cursor');
  setTimeout(() => {
    toast.classList.remove('typing-cursor');
  }, Math.min(msg.length * 30 + 100, 1000));
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
};

// --- API & WebSocket ---
const ws = new WebSocket('ws://127.0.0.1:3001/ws');

interface TaskPayload {
  id: string;
  type: string;
  workerId?: string;
  latency?: number;
}

interface WorkerState {
  id: string;
  status: string;
  activeTasks: number;
  capacity: number;
  metrics: { processed: number, failed: number };
}

const workersMap = new Map<string, HTMLElement>();
const ganttState = new Map<string, { el: HTMLElement, start: number, interval?: number }>();

const updateDashboardMetrics = (data: any) => {
  const qDepthRaw = data.metrics.queueDepth;
  const totalQueue = Object.values(qDepthRaw).reduce((a: any, b: any) => a + b, 0) as number;
  
  animateValue('val-throughput', currentMetrics.throughput, data.metrics.throughput, 400);
  animateValue('val-processed', currentMetrics.processed, data.metrics.tasksProcessed, 400);
  animateValue('val-p99', currentMetrics.p99, data.metrics.p99, 400);
  animateValue('val-queue', currentMetrics.queue, totalQueue, 200);

  currentMetrics = { throughput: data.metrics.throughput, processed: data.metrics.tasksProcessed, p99: data.metrics.p99, queue: totalQueue };

  // Update Workers UI
  const grid = document.getElementById('workers-grid');
  if (!grid) return;

  data.workers.forEach((w: WorkerState) => {
    let card = workersMap.get(w.id);
    if (!card) {
      card = document.createElement('div');
      card.className = 'worker-card';
      card.id = `worker-${w.id}`;
      card.innerHTML = `
        <div class="worker-header">
          <span class="worker-id">${w.id}</span>
          <span class="status-badge badge-idle" id="badge-${w.id}">IDLE</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="cpu-${w.id}" style="width: 0%"></div>
        </div>
        <div class="worker-body" id="body-${w.id}">
           <!-- AWAITING INSTRUCTIONS screen saver on first worker if idle -->
        </div>
      `;
      grid.appendChild(card);
      workersMap.set(w.id, card);
    }

    const badge = document.getElementById(`badge-${w.id}`);
    const cpu = document.getElementById(`cpu-${w.id}`);
    
    // Status update
    if (w.status !== card.getAttribute('data-status')) {
      card.setAttribute('data-status', w.status);
      card.className = `worker-card ${w.status.toLowerCase()}`;
      if (badge) {
        badge.className = `status-badge badge-${w.status.toLowerCase()}`;
        badge.innerText = w.status;
      }
    }

    // CPU update
    if (cpu) {
      const pct = (w.activeTasks / w.capacity) * 100;
      cpu.style.width = `${pct}%`;
      if (pct > 85) cpu.classList.add('warning');
      else cpu.classList.remove('warning');
    }
  });

  // Health
  const healthEl = document.getElementById('val-health');
  if (healthEl) {
    if (data.metrics.tasksFailed > data.metrics.tasksProcessed * 0.1) {
      healthEl.innerText = 'DEGRADED';
      healthEl.style.color = 'var(--critical)';
    } else {
      healthEl.innerText = 'OPTIMAL';
      healthEl.style.color = 'var(--success)';
    }
  }
};

const handleTaskStarted = (t: TaskPayload) => {
  if (t.workerId) {
    const list = document.getElementById(`body-${t.workerId}`);
    if (list) {
      const item = document.createElement('div');
      item.className = 'task-item';
      item.id = `ui-task-${t.id}`;
      list.prepend(item);
      typewrite(item, `${t.type} [${t.id.substring(0,6)}]`);
      
      // Cleanup visual task list over 4 tasks
      while (list.children.length > 4) {
        list.children[list.children.length - 1].remove();
      }
    }
  }

  // Gantt Timeline Add
  const gantt = document.getElementById('gantt-tracks');
  if (gantt && Number(currentMetrics.queue) < 100) { // Limit DOM heavily in stress test Gantt
    const track = document.createElement('div');
    track.className = 'gantt-track';
    const block = document.createElement('div');
    block.className = 'gantt-block';
    block.style.width = '0px';
    track.appendChild(block);
    gantt.prepend(track);

    if (gantt.children.length > 8) {
      gantt.removeChild(gantt.children[gantt.children.length - 1]);
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const width = Math.min((elapsed / 50) * 10, 800); // Visual scaling
      block.style.width = `${width}px`;
    }, 50);

    ganttState.set(t.id, { el: block, start, interval });
  }
};

const handleTaskCompleted = (t: TaskPayload) => {
  const taskEl = document.getElementById(`ui-task-${t.id}`);
  if (taskEl) {
    taskEl.style.opacity = '0.5';
    setTimeout(() => taskEl.remove(), 1000);
  }

  const gantt = ganttState.get(t.id);
  if (gantt) {
    clearInterval(gantt.interval);
    gantt.el.classList.add('completed');
    ganttState.delete(t.id);
  }
};

const handleTaskFailed = (t: TaskPayload) => {
  const taskEl = document.getElementById(`ui-task-${t.id}`);
  if (taskEl) {
    taskEl.classList.add('failed');
    taskEl.innerHTML = `[FAIL] ${taskEl.innerHTML}`;
  }

  const gantt = ganttState.get(t.id);
  if (gantt) {
    clearInterval(gantt.interval);
    gantt.el.classList.add('failed');
    ganttState.delete(t.id);
  }
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case 'metricsUpdate':
      updateDashboardMetrics(msg.payload);
      break;
    case 'taskStarted':
      handleTaskStarted(msg.payload);
      break;
    case 'taskCompleted':
      handleTaskCompleted(msg.payload);
      break;
    case 'taskFailed':
      handleTaskFailed(msg.payload);
      break;
  }
};

// UI Triggers
document.getElementById('btn-batch')?.addEventListener('click', async () => {
  showToast('INITIATING BATCH RUN: 100 TASKS');
  await fetch('http://127.0.0.1:3001/api/tasks/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: 100 })
  });
});

document.getElementById('btn-stress')?.addEventListener('click', async () => {
  showToast('STRESS TEST INITIATED. BRACE FOR IMPACT');
  await fetch('http://127.0.0.1:3001/api/tasks/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: 10000, priority: 1 })
  });
});

document.getElementById('btn-add')?.addEventListener('click', async () => {
  const input = document.getElementById('task-input') as HTMLInputElement;
  const prio = document.getElementById('priority-select') as HTMLSelectElement;
  if (!input.value) return;

  const type = input.value;
  showToast(`SUBMITTING: ${type}`);
  
  await fetch('http://127.0.0.1:3001/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, priority: parseInt(prio.value), payload: { latency: 50, failRate: 0.1 } })
  });

  input.value = '';
});

// Awaiting Instructions screensaver
setTimeout(() => {
  // Find first idle worker
  const w = workersMap.values().next().value;
  if (w && w.getAttribute('data-status') === 'IDLE' && currentMetrics.queue === 0) {
    const body = w.querySelector('.worker-body');
    if (body && body.children.length === 0) {
      body.innerHTML = '<div class="screensaver">AWAITING INSTRUCTIONS...</div>';
    }
  }
}, 5000);
