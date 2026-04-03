import { Scheduler, PriorityLevel, Task } from '@foreman/core';

async function runBenchmark() {
  console.log('🚀 Starting Foreman Framework Benchmark...');
  
  // Use 8 native threads
  const scheduler = new Scheduler(8);
  scheduler.start();

  const totalTasks = 50_000;
  console.log(`Injecting ${totalTasks} tasks into the pipeline...`);
  
  const start = Date.now();
  
  // Create tasks that do essentially "nothing" (0ms forced latency simulation)
  // to measure raw scheduling and worker passing overhead
  const tasks: Task[] = [];
  for (let i = 0; i < totalTasks; i++) {
    tasks.push({
      id: `bench-${i}`,
      type: 'benchmark-task',
      // We pass 0 latency so the task runner returns almost instantly, testing true queue throughput
      payload: { latency: 0, failRate: 0 }, 
      priority: PriorityLevel.NORMAL,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    });
  }

  // Submit all tasks in one mega-batch
  scheduler.submit(tasks);

  // Monitor progress
  const interval = setInterval(() => {
    const snap = scheduler.getSnapshot();
    const processed = snap.metrics.tasksProcessed;
    const qDepth = snap.metrics.queueDepth[PriorityLevel.NORMAL] || 0;
    
    process.stdout.write(`\r✅ Processed: ${processed}/${totalTasks} | ⏳ Queue: ${qDepth} | 🏎️ Throughput: ${snap.metrics.throughput} tasks/sec | ⏱️ P99 Latency: ${snap.metrics.p99}ms       `);
    
    if (processed >= totalTasks) {
      clearInterval(interval);
      scheduler.stop();
      const elapsed = (Date.now() - start) / 1000;
      console.log(`\n\n🎉 Benchmark completed in ${elapsed.toFixed(2)} seconds!`);
      console.log(`⚡ Final Average Throughput: ${(totalTasks / elapsed).toFixed(0)} tasks/sec`);
      process.exit(0);
    }
  }, 250);
}

runBenchmark().catch(console.error);
